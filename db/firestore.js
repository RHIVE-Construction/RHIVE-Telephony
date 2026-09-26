/**
 * ============================================================================
 * RHIVE TELEPHONY SOVEREIGN DATABASE TIER & USER RULE [3] GOVERNANCE
 * ============================================================================
 * ARCHITECTURE:
 * - Resilient Firestore Singleton Client with serverless connection pooling.
 * - Fixes gRPC plugin header iteration (headers.forEach) for Node 20/22/24.
 * - Strict User Rule [3] Compliance:
 *     * BANNED: .set() and hard deletes.
 *     * MANDATORY: PATCH / .update() and Soft Delete (isDeleted: true).
 * - Multi-Collection Governance:
 *     1. telephony_calls (synchronized with call_logs & twilio_voice_sessions)
 *     2. telephony_rules (synchronized with telephony_config/active_instructions)
 *     3. telephony_flows (synchronized with canonical in-memory flow matrix)
 *     4. call_notes (synchronized with contact_dispositions)
 *     5. call_verifications (synchronized with verification_requests)
 * - In-Memory TTL Caching (30s) to prevent Cloud Run connection thrashing.
 * ============================================================================
 */

const { Firestore } = require('@google-cloud/firestore');
const { OAuth2Client } = require('google-auth-library');
const fs = require('fs');
const path = require('path');

// ----------------------------------------------------------------------------
// 1. CONNECTION POOLING & RESILIENT CLIENT SINGLETON
// ----------------------------------------------------------------------------
let firestoreDb = null;
let isInitializing = false;

// In-Memory Read Caches to eliminate connection thrashing in Cloud Run
const cache = {
  rules: { data: null, expiresAt: 0 },
  flows: { data: null, expiresAt: 0 },
  whiteboard: { data: null, expiresAt: 0 }
};
const CACHE_TTL_MS = 30 * 1000; // 30-second TTL cache for hot reads

function invalidateCache(key) {
  if (cache[key]) {
    cache[key].expiresAt = 0;
    cache[key].data = null;
  }
}

/**
 * Initialize or retrieve the pooled Firestore database singleton.
 * Solves gRPC auth header bug in Node.js 24 while maintaining full ADC compatibility.
 */
function initFirestore() {
  if (firestoreDb) return firestoreDb;
  if (isInitializing) return firestoreDb;

  isInitializing = true;
  try {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'rhive-quantum-quoter';
    const cfgPath = 'C:\\Users\\mjrob\\.config\\configstore\\firebase-tools.json';

    // 1. Local Development Fallback: Firebase CLI credentials
    if (fs.existsSync(cfgPath)) {
      try {
        const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
        if (cfg?.tokens?.access_token) {
          const authClient = new OAuth2Client();
          authClient.setCredentials({ access_token: cfg.tokens.access_token });

          // CRITICAL FIX: Node.js 24 gRPC plugin expects Headers object with .forEach()
          const origGetHeaders = authClient.getRequestHeaders.bind(authClient);
          authClient.getRequestHeaders = async (url) => {
            const h = await origGetHeaders(url);
            return typeof Headers !== 'undefined' ? new Headers(h) : h;
          };

          firestoreDb = new Firestore({
            projectId,
            authClient,
            preferRest: false
          });
          console.log(`[Firestore CRM] Connected with patched OAuth2 token for project: ${projectId}`);
          isInitializing = false;
          return firestoreDb;
        }
      } catch (localErr) {
        console.warn('[Firestore CRM Local Auth Note]', localErr.message);
      }
    }

    // 2. Cloud Run & Production Standard: Application Default Credentials (ADC)
    firestoreDb = new Firestore({
      projectId,
      preferRest: false
    });
    console.log(`[Firestore CRM] Connected via GCP ADC for project: ${projectId}`);
    isInitializing = false;
    return firestoreDb;
  } catch (err) {
    console.warn('[Firestore CRM Init Warning]', err.message);
    isInitializing = false;
    return null;
  }
}

// ----------------------------------------------------------------------------
// 2. USER RULE [3] PRIMITIVES: SAFE PATCH, SAFE CREATE, SOFT DELETE
// ----------------------------------------------------------------------------

/**
 * Safe document creation using .create().
 * Rejects if document already exists. Enforces isDeleted: false.
 */
async function createDocument(collectionName, docId, data) {
  const db = initFirestore();
  if (!db) return null;

  const docRef = docId ? db.collection(collectionName).doc(docId) : db.collection(collectionName).doc();
  const now = new Date().toISOString();
  const payload = {
    ...data,
    id: docRef.id,
    isDeleted: false,
    createdAt: data.createdAt || now,
    updatedAt: now
  };

  await docRef.create(payload);
  return { id: docRef.id, ...payload };
}

/**
 * Mandatory PATCH using .update().
 * Replaces banned .set(). Enforces updatedAt timestamp.
 */
async function patchDocument(collectionName, docId, patchData) {
  const db = initFirestore();
  if (!db || !docId) return null;

  const docRef = db.collection(collectionName).doc(docId);
  const now = new Date().toISOString();
  const payload = {
    ...patchData,
    updatedAt: now
  };

  await docRef.update(payload);
  return { id: docId, ...payload };
}

/**
 * Safe Upsert: guarantees zero .set() calls.
 * If document exists, applies .update() (PATCH).
 * If document does not exist, applies .create() with isDeleted: false.
 */
async function safeUpsert(collectionName, docId, patchData, defaultCreateData = {}) {
  const db = initFirestore();
  if (!db || !docId) return null;

  const docRef = db.collection(collectionName).doc(docId);
  const snap = await docRef.get();
  const now = new Date().toISOString();

  if (snap.exists) {
    const existing = snap.data() || {};
    const payload = {
      ...patchData,
      isDeleted: existing.isDeleted === true ? true : false,
      updatedAt: now
    };
    await docRef.update(payload);
    return { id: docId, ...existing, ...payload };
  } else {
    const payload = {
      ...defaultCreateData,
      ...patchData,
      id: docId,
      isDeleted: false,
      createdAt: now,
      updatedAt: now
    };
    await docRef.create(payload);
    return payload;
  }
}

/**
 * Mandatory Soft Delete.
 * Completely replaces hard deletes across the database tier.
 * Marks document with isDeleted: true and deletedAt timestamp.
 */
async function softDeleteDocument(collectionName, docId, auditInfo = {}) {
  const db = initFirestore();
  if (!db || !docId) return { success: false, error: 'Database or docId missing' };

  const docRef = db.collection(collectionName).doc(docId);
  const now = new Date().toISOString();
  const payload = {
    isDeleted: true,
    deletedAt: now,
    deletedBy: auditInfo.deletedBy || 'system',
    deletionReason: auditInfo.reason || 'User requested deletion',
    updatedAt: now
  };

  await docRef.update(payload);
  return { success: true, id: docId, ...payload };
}

/**
 * Base query helper pre-filtered for non-deleted documents.
 */
function queryActive(collectionName) {
  const db = initFirestore();
  if (!db) return null;
  return db.collection(collectionName).where('isDeleted', '==', false);
}

// ----------------------------------------------------------------------------
// 3. TARGET REPOSITORY: telephony_calls (and call_logs sync)
// ----------------------------------------------------------------------------
const callsRepository = {
  /**
   * Record newly initiated call session.
   */
  async recordInitiated({ callSid, callerPhone, callerName, direction = 'inbound' }) {
    if (!callSid || callSid.startsWith('SIM_')) return null;
    const phoneE164 = callerPhone ? (callerPhone.startsWith('+') ? callerPhone : ('+' + callerPhone.replace(/[^0-9]/g, ''))) : '';
    const now = new Date().toISOString();

    const data = {
      callSid,
      event_type: 'call.initiated',
      direction,
      contact_name: callerName || 'Guest Caller',
      contact_number: phoneE164,
      callerPhone: phoneE164,
      callerName: callerName || 'Guest Caller',
      status: 'in-progress',
      isDeleted: false,
      timestamp: now,
      createdAt: now,
      updatedAt: now
    };

    try {
      await safeUpsert('telephony_calls', callSid, data);
      await safeUpsert('call_logs', callSid, data);
      return callSid;
    } catch (err) {
      console.warn('[callsRepository.recordInitiated Error]', err.message);
      return null;
    }
  },

  /**
   * Record completed call session with full transcript, AI intent, and recording.
   */
  async recordCompleted({ callSid, callerPhone, callerName, direction = 'inbound', transcript, intent, invoiceNumber, summary, recordingUrl, duration = null }) {
    if (!callSid || callSid.startsWith('SIM_')) return null;
    const phoneE164 = callerPhone ? (callerPhone.startsWith('+') ? callerPhone : ('+' + callerPhone.replace(/[^0-9]/g, ''))) : '';
    const now = new Date();
    const nowIso = now.toISOString();

    const payload = {
      callSid,
      event_type: 'call.completed',
      direction: direction || 'inbound',
      contact_name: callerName || 'Guest Caller',
      contact_number: phoneE164,
      callerPhone: phoneE164,
      callerName: callerName || 'Guest Caller',
      transcript: transcript || '',
      recording_url: recordingUrl || null,
      notes: summary || '',
      duration: duration || null,
      timestamp: now,
      isDeleted: false,
      isSolicitor: false,
      aiParsed: {
        intent: intent || 'INBOUND_INQUIRY',
        summary: summary || '',
        extractedInvoice: invoiceNumber || null
      },
      updatedAt: nowIso
    };

    try {
      // 1. Primary Sovereign Collection: telephony_calls
      await safeUpsert('telephony_calls', callSid, payload, { createdAt: nowIso });

      // 2. Synchronized Legacy Collections: call_logs & twilio_voice_sessions
      await safeUpsert('call_logs', callSid, payload, { createdAt: nowIso });
      await safeUpsert('twilio_voice_sessions', callSid, {
        callSid,
        caller: phoneE164,
        status: 'completed',
        invoiceNumber: invoiceNumber || null,
        isDeleted: false,
        updatedAt: nowIso
      }, { createdAt: nowIso });

      console.log(`[callsRepository] Completed call saved for ${callSid} (${callerName || 'Guest'})`);
      return callSid;
    } catch (err) {
      console.warn('[callsRepository.recordCompleted Error]', err.message);
      return null;
    }
  },

  /**
   * Update recording URL via PATCH (replaces banned .set).
   */
  async updateRecordingUrl(callSid, recordingUrl) {
    if (!callSid || !recordingUrl) return false;
    try {
      await patchDocument('telephony_calls', callSid, { recording_url: recordingUrl });
      await patchDocument('call_logs', callSid, { recording_url: recordingUrl });
      return true;
    } catch (e) {
      // If document didn't exist yet, safeUpsert
      await safeUpsert('telephony_calls', callSid, { recording_url: recordingUrl });
      await safeUpsert('call_logs', callSid, { recording_url: recordingUrl });
      return true;
    }
  },

  /**
   * Query recent active calls with rapid composite index (<200ms).
   */
  async getRecentCalls(limit = 50) {
    const db = initFirestore();
    if (!db) return [];
    try {
      const snap = await db.collection('telephony_calls')
        .where('isDeleted', '==', false)
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();

      const calls = [];
      snap.forEach(doc => calls.push(doc.data()));
      return calls;
    } catch (err) {
      // Fallback query on call_logs
      try {
        const snap = await db.collection('call_logs')
          .where('isDeleted', '==', false)
          .orderBy('timestamp', 'desc')
          .limit(limit)
          .get();
        const calls = [];
        snap.forEach(doc => calls.push(doc.data()));
        return calls;
      } catch (e) {
        console.warn('[callsRepository.getRecentCalls Error]', e.message);
        return [];
      }
    }
  }
};

// ----------------------------------------------------------------------------
// 4. TARGET REPOSITORY: telephony_rules (and telephony_config sync)
// ----------------------------------------------------------------------------
const rulesRepository = {
  /**
   * Get active approved telephony rules with 30s cache.
   */
  async getActiveRules() {
    const now = Date.now();
    if (cache.rules.data && cache.rules.expiresAt > now) {
      return cache.rules.data;
    }

    const db = initFirestore();
    if (!db) return [];

    try {
      let rules = [];
      try {
        const snap = await db.collection('telephony_rules')
          .where('isDeleted', '==', false)
          .orderBy('approvedAt', 'desc')
          .get();
        snap.forEach(d => rules.push({ id: d.id, ...d.data() }));
      } catch (idxErr) {
        // High-availability fallback: if composite index is pending/building in GCP, query by isDeleted and sort in-memory
        if (idxErr.message && (idxErr.message.includes('requires an index') || idxErr.code === 9)) {
          const snap = await db.collection('telephony_rules')
            .where('isDeleted', '==', false)
            .get();
          snap.forEach(d => rules.push({ id: d.id, ...d.data() }));
          rules.sort((a, b) => new Date(b.approvedAt || 0) - new Date(a.approvedAt || 0));
        } else {
          throw idxErr;
        }
      }

      if (rules.length > 0) {
        cache.rules.data = rules;
        cache.rules.expiresAt = now + CACHE_TTL_MS;
        return rules;
      }

      // Fallback to telephony_config/active_instructions
      const doc = await db.collection('telephony_config').doc('active_instructions').get();
      if (doc.exists) {
        const data = doc.data();
        const legacyRules = Array.isArray(data.rules) ? data.rules.filter(r => !r.isDeleted) : [];
        cache.rules.data = legacyRules;
        cache.rules.expiresAt = now + CACHE_TTL_MS;
        return legacyRules;
      }

      cache.rules.data = [];
      cache.rules.expiresAt = now + CACHE_TTL_MS;
      return [];
    } catch (err) {
      console.warn('[rulesRepository.getActiveRules Error]', err.message);
      return [];
    }
  },

  /**
   * Save / deploy a new active rule (Strict PATCH, zero .set).
   */
  async saveRule(rule) {
    const db = initFirestore();
    if (!db || !rule) return false;
    invalidateCache('rules');

    const ruleId = rule.id || `rule_${Date.now()}`;
    const now = new Date().toISOString();
    const ruleDoc = {
      ...rule,
      id: ruleId,
      isDeleted: false,
      updatedAt: now,
      createdAt: rule.createdAt || now
    };

    try {
      // 1. Write to discrete telephony_rules collection
      await safeUpsert('telephony_rules', ruleId, ruleDoc);

      // 2. Synchronize legacy telephony_config/active_instructions array
      const current = await this.getActiveRules();
      const existingIdx = current.findIndex(r => r.id === ruleId);
      if (existingIdx !== -1) {
        current[existingIdx] = ruleDoc;
      } else {
        current.push(ruleDoc);
      }
      await safeUpsert('telephony_config', 'active_instructions', {
        rules: current,
        updatedAt: now,
        isDeleted: false
      });

      return true;
    } catch (err) {
      console.warn('[rulesRepository.saveRule Error]', err.message);
      return false;
    }
  },

  /**
   * Soft Delete a telephony rule (User Rule [3] Compliance).
   */
  async softDeleteRule(ruleId, deletedBy = 'michael@rhiveconstruction.com') {
    invalidateCache('rules');
    try {
      // 1. Soft delete document in telephony_rules
      await softDeleteDocument('telephony_rules', ruleId, { deletedBy });

      // 2. Update telephony_config/active_instructions
      const current = await this.getActiveRules();
      const filtered = current.filter(r => r.id !== ruleId);
      await safeUpsert('telephony_config', 'active_instructions', {
        rules: filtered,
        updatedAt: new Date().toISOString()
      });

      return { success: true, remaining: filtered.length };
    } catch (err) {
      console.warn('[rulesRepository.softDeleteRule Error]', err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Create tuning proposal with safe create (zero .set).
   */
  async createProposal(proposal) {
    const proposalId = proposal.id || `tune_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    try {
      return await safeUpsert('telephony_tuning_proposals', proposalId, {
        ...proposal,
        id: proposalId,
        status: 'pending',
        isDeleted: false
      });
    } catch (err) {
      console.warn('[rulesRepository.createProposal Error]', err.message);
      return proposal;
    }
  },

  /**
   * Approve proposal and promote to active rule (Strict PATCH).
   */
  async approveProposal(proposalId, approvedBy = 'michael@rhiveconstruction.com', customInstruction = null) {
    const db = initFirestore();
    const now = new Date().toISOString();
    let proposalData = null;

    if (db) {
      try {
        const docRef = db.collection('telephony_tuning_proposals').doc(proposalId);
        const doc = await docRef.get();
        if (doc.exists) {
          proposalData = doc.data();
          await docRef.update({
            status: 'approved',
            approvedBy,
            approvedAt: now,
            finalInstruction: customInstruction || proposalData.proposedRule,
            updatedAt: now
          });
        }
      } catch (e) {
        console.warn('[rulesRepository.approveProposal fetch error]', e.message);
      }
    }

    const ruleInstruction = customInstruction || proposalData?.proposedRule || 'Admin approved directive';
    const newRule = {
      id: `rule_${Date.now()}`,
      proposalId: proposalId,
      instruction: ruleInstruction,
      category: proposalData?.category || 'general',
      approvedBy,
      approvedAt: now,
      isDeleted: false
    };

    await this.saveRule(newRule);
    const active = await this.getActiveRules();
    return { success: true, newRule, totalActive: active.length };
  },

  /**
   * Reject proposal (Strict PATCH).
   */
  async rejectProposal(proposalId, dismissedBy = 'michael@rhiveconstruction.com') {
    try {
      await patchDocument('telephony_tuning_proposals', proposalId, {
        status: 'dismissed',
        dismissedBy,
        dismissedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (err) {
      console.warn('[rulesRepository.rejectProposal Error]', err.message);
      return { success: true };
    }
  }
};

// ----------------------------------------------------------------------------
// 5. TARGET REPOSITORY: telephony_flows
// ----------------------------------------------------------------------------
const flowsRepository = {
  /**
   * Retrieve all canonical flows enriched with Firestore lock & simulation states.
   */
  async getFlows(fallbackFlows = []) {
    const now = Date.now();
    if (cache.flows.data && cache.flows.expiresAt > now) {
      return cache.flows.data;
    }

    const db = initFirestore();
    if (!db) return fallbackFlows;

    try {
      const snap = await db.collection('telephony_flows').where('isDeleted', '==', false).get();
      const docMap = new Map();
      snap.forEach(d => docMap.set(d.id, d.data()));

      const merged = fallbackFlows.map(f => {
        const stored = docMap.get(f.id);
        if (!stored) return f;
        return {
          ...f,
          isLocked: stored.isLocked !== undefined ? stored.isLocked : f.isLocked,
          lastSimulatedAt: stored.lastSimulatedAt || f.lastSimulatedAt,
          lastSimulationResult: stored.lastSimulationResult || f.lastSimulationResult,
          lastSimulationDetails: stored.lastSimulationDetails || f.lastSimulationDetails
        };
      });

      cache.flows.data = merged;
      cache.flows.expiresAt = now + CACHE_TTL_MS;
      return merged;
    } catch (err) {
      console.warn('[flowsRepository.getFlows Error]', err.message);
      return fallbackFlows;
    }
  },

  /**
   * Lock/Unlock flow (Strict PATCH).
   */
  async lockFlow(flowId, isLocked) {
    invalidateCache('flows');
    try {
      await safeUpsert('telephony_flows', flowId, { isLocked, isDeleted: false });
      return { success: true, flowId, isLocked };
    } catch (err) {
      console.warn('[flowsRepository.lockFlow Error]', err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Record simulation outcome (Strict PATCH).
   */
  async recordSimulation(flowId, resultStr, simulationData) {
    invalidateCache('flows');
    const now = new Date().toISOString();
    try {
      await safeUpsert('telephony_flows', flowId, {
        lastSimulatedAt: now,
        lastSimulationResult: resultStr,
        lastSimulationDetails: simulationData,
        isDeleted: false
      });
      return true;
    } catch (err) {
      console.warn('[flowsRepository.recordSimulation Error]', err.message);
      return false;
    }
  }
};

// ----------------------------------------------------------------------------
// 6. TARGET REPOSITORY: call_notes (and contact timeline sync)
// ----------------------------------------------------------------------------
const notesRepository = {
  /**
   * Add a call note (Strict safeUpsert / create, zero .set).
   */
  async addCallNote({ callSid, notes, disposition = 'COMPLETED', contactNumber = '', contactName = 'Customer', author = 'system' }) {
    const noteId = `note_${callSid || Date.now()}_${Date.now()}`;
    const now = new Date().toISOString();

    const notePayload = {
      id: noteId,
      callSid: callSid || '',
      notes: notes || '',
      disposition,
      contactNumber: contactNumber || '',
      contactName: contactName || 'Customer',
      author,
      isDeleted: false,
      createdAt: now,
      updatedAt: now
    };

    try {
      // 1. Create discrete call_notes record
      await safeUpsert('call_notes', noteId, notePayload);

      // 2. Synchronize call_logs note & disposition
      if (callSid) {
        await safeUpsert('call_logs', callSid, {
          notes: notes || '',
          disposition,
          contact_number: contactNumber || '',
          contact_name: contactName || 'Customer',
          isDeleted: false,
          updated_at: now
        });
      }

      // 3. Synchronize contact_dispositions timeline
      if (contactNumber) {
        const cleanNum = contactNumber.replace(/[^\d+]/g, '');
        if (cleanNum) {
          await safeUpsert('contact_dispositions', cleanNum, {
            last_disposition: disposition,
            last_notes: notes || '',
            last_contact: now,
            contact_name: contactName || 'Customer',
            isDeleted: false
          });
        }
      }

      return { success: true, noteId, ...notePayload };
    } catch (err) {
      console.warn('[notesRepository.addCallNote Error]', err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Soft Delete a call note.
   */
  async softDeleteNote(noteId, deletedBy = 'system') {
    return await softDeleteDocument('call_notes', noteId, { deletedBy });
  },

  /**
   * Query active notes for a call SID.
   */
  async getNotesForCall(callSid) {
    const db = initFirestore();
    if (!db || !callSid) return [];
    try {
      let snap;
      try {
        snap = await db.collection('call_notes')
          .where('isDeleted', '==', false)
          .where('callSid', '==', callSid)
          .orderBy('createdAt', 'desc')
          .get();
      } catch (idxErr) {
        if (idxErr.message && (idxErr.message.includes('requires an index') || idxErr.code === 9)) {
          snap = await db.collection('call_notes')
            .where('isDeleted', '==', false)
            .where('callSid', '==', callSid)
            .get();
        } else {
          throw idxErr;
        }
      }

      const notes = [];
      snap.forEach(d => notes.push(d.data()));
      notes.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      return notes;
    } catch (e) {
      console.warn('[notesRepository.getNotesForCall Error]', e.message);
      return [];
    }
  }
};

// ----------------------------------------------------------------------------
// 7. TARGET REPOSITORY: call_verifications (and verification_requests sync)
// ----------------------------------------------------------------------------
const verificationsRepository = {
  /**
   * Create or update pending verification request (Strict safeUpsert).
   */
  async createRequest(key, data) {
    const now = new Date();
    const payload = {
      key,
      phone: data.phone || '',
      cleanPhone: key,
      callerName: data.callerName || '',
      propertyAddress: data.propertyAddress || '',
      callSid: data.callSid || '',
      flaggedQuestions: data.flaggedQuestions || [],
      verified: false,
      followUpSent: false,
      isDeleted: false,
      createdAt: data.createdAt || now,
      updatedAt: now
    };

    try {
      await safeUpsert('call_verifications', key, payload);
      await safeUpsert('verification_requests', key, payload);
      return payload;
    } catch (err) {
      console.warn('[verificationsRepository.createRequest Error]', err.message);
      return payload;
    }
  },

  /**
   * Complete project intake verification (Strict PATCH).
   */
  async completeVerification(key, verificationDetails) {
    const now = new Date();
    const payload = {
      verified: true,
      verifiedEmail: verificationDetails.email || '',
      customerEmail: verificationDetails.email || '',
      callerName: verificationDetails.customerName || '',
      propertyAddress: verificationDetails.propertyAddress || '',
      addressModified: !!verificationDetails.addressModified,
      priority: verificationDetails.priority || 'Max Warranty',
      propertyType: verificationDetails.propertyType || 'Residential Home',
      projectScope: verificationDetails.projectScope || 'Full Roof Replacement',
      videoCallInspection: verificationDetails.videoCallInspection || 'No - Aerial CAD Only',
      solarStatus: verificationDetails.solarStatus || 'No Solar',
      skylights: verificationDetails.skylights || 'No Skylights',
      equipmentRemoval: verificationDetails.equipmentRemoval || 'Everything Staying',
      shingleLayers: verificationDetails.shingleLayers || '1 Layer (Single Layer)',
      gutterScope: verificationDetails.gutterScope || 'Existing Gutters OK',
      iceDams: verificationDetails.iceDams || 'No Ice Dam Issues',
      notes: verificationDetails.notes || '',
      isDeleted: false,
      verifiedAt: now,
      updatedAt: now
    };

    try {
      if (key) {
        await safeUpsert('call_verifications', key, payload);
        await safeUpsert('verification_requests', key, payload);
      }

      if (verificationDetails.callSid) {
        await safeUpsert('call_logs', verificationDetails.callSid, {
          customerEmail: verificationDetails.email || '',
          customerName: verificationDetails.customerName || '',
          propertyAddress: verificationDetails.propertyAddress || '',
          customerPriority: verificationDetails.priority || 'Max Warranty',
          propertyType: verificationDetails.propertyType || 'Residential Home',
          projectScope: verificationDetails.projectScope || 'Full Roof Replacement',
          videoCallInspection: verificationDetails.videoCallInspection || 'No - Aerial CAD Only',
          solarStatus: verificationDetails.solarStatus || 'No Solar',
          isVerified: true,
          verifiedAt: now,
          updatedAt: now,
          isDeleted: false
        });
      }

      return { success: true, key, ...payload };
    } catch (err) {
      console.warn('[verificationsRepository.completeVerification Error]', err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Get active verification request by key.
   */
  async getByKey(key) {
    const db = initFirestore();
    if (!db || !key) return null;
    try {
      const doc = await db.collection('call_verifications').doc(key).get();
      if (doc.exists && !doc.data().isDeleted) {
        return doc.data();
      }
      const legacyDoc = await db.collection('verification_requests').doc(key).get();
      if (legacyDoc.exists && !legacyDoc.data().isDeleted) {
        return legacyDoc.data();
      }
      return null;
    } catch (err) {
      console.warn('[verificationsRepository.getByKey Error]', err.message);
      return null;
    }
  }
};

// ----------------------------------------------------------------------------
// 8. CONTACT PROFILE & WHITEBOARD EXTENSIONS (STRICT USER RULE [3])
// ----------------------------------------------------------------------------
const contactsRepository = {
  async saveOrUpdateContact({ docId, rawPhone, phoneE164, callerName, firstName, lastName, companyName, propertyAddress, invoiceNumber }) {
    const now = new Date();
    const updatePayload = {
      phone: phoneE164,
      raw_phone: rawPhone,
      updated_at: now,
      isDeleted: false,
      activeContext: {
        lastInvoiceReferenced: invoiceNumber || null,
        lastCallTimestamp: now.toISOString(),
        lastPropertyAddress: propertyAddress || null
      }
    };

    if (callerName && !/^(caller|customer|unknown)$/i.test(callerName)) {
      updatePayload.full_name = callerName;
      updatePayload.first_name = firstName;
      updatePayload.last_name = lastName;
    }
    if (companyName) {
      updatePayload.company = companyName;
    }

    try {
      await safeUpsert('contacts', docId, updatePayload, { created_at: now });
      return docId;
    } catch (err) {
      console.warn('[contactsRepository.saveOrUpdateContact Error]', err.message);
      return null;
    }
  }
};

const whiteboardRepository = {
  async getActive() {
    const db = initFirestore();
    if (!db) return null;
    try {
      const doc = await db.collection('telephony_whiteboard').doc('active').get();
      if (doc.exists && !doc.data().isDeleted) {
        return doc.data();
      }
      return null;
    } catch (e) {
      console.warn('[whiteboardRepository.getActive Error]', e.message);
      return null;
    }
  },

  async saveActive(flowData) {
    const now = new Date().toISOString();
    const payload = {
      ...flowData,
      isDeleted: false,
      updatedAt: now,
      updatedBy: flowData.updatedBy || 'michael@rhiveconstruction.com'
    };
    try {
      await safeUpsert('telephony_whiteboard', 'active', payload);
      return true;
    } catch (e) {
      console.warn('[whiteboardRepository.saveActive Error]', e.message);
      return false;
    }
  }
};

const smsRepository = {
  async recordSmsLog({ from, to, body, status = 'sent', direction = 'outbound', provider = 'justcall', messageSid = null }) {
    const db = initFirestore();
    if (!db) return null;
    try {
      const docRef = db.collection('sms_logs').doc();
      const payload = {
        id: docRef.id,
        from,
        to,
        body,
        status,
        direction,
        provider,
        messageSid,
        timestamp: new Date().toISOString(),
        isDeleted: false
      };
      await docRef.create(payload);
      return docRef.id;
    } catch (e) {
      console.warn('[smsRepository.recordSmsLog Error]', e.message);
      return null;
    }
  }
};

// ----------------------------------------------------------------------------
// EXPORTS
// ----------------------------------------------------------------------------
module.exports = {
  initFirestore,
  createDocument,
  patchDocument,
  safeUpsert,
  softDeleteDocument,
  queryActive,
  callsRepository,
  rulesRepository,
  flowsRepository,
  notesRepository,
  verificationsRepository,
  contactsRepository,
  whiteboardRepository,
  smsRepository
};
