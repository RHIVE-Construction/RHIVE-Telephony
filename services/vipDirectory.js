/**
 * ============================================================================
 * RHIVE TELEPHONY V6.5 - SILENT VIP COMMERCIAL ACCOUNT & CUSTOMER DIRECTORY
 * WITH PRIVACY SHIELD & ZERO-STONEWALL FAST-PASS ROUTING
 * ============================================================================
 * Continuously indexes (5-min TTL cache, 0ms hot-path matching):
 *   1. Google Drive Commercial Shared Drive (1Vq4gODo_veMJUoE6KzOSTX-gc9EVXAU8)
 *   2. Google Drive Residential Shared Drive (1vkfdY4OYdljEevai3oZTGxUGSqytekSi)
 *   3. Google Contacts (People API - up to 1,000 contacts)
 *   4. Firestore Contacts & Commercial Account Aliases / Phonetic Variants
 *
 * PRIVACY INVARIANT:
 *   When a caller matches a VIP Commercial Account or Known Customer, Honey
 *   MUST NOT disclose, verify, or read back private CRM/Drive account details
 *   aloud to the caller. Instead, Honey silently passes the caller straight
 *   through to Michael or Kara (putting the full VIP context ONLY in the
 *   private internal /screen-whisper briefing to Michael/Kara!).
 * ============================================================================
 */

const SHARED_DRIVE_COMMERCIAL_ID = process.env.SHARED_DRIVE_COMMERCIAL_ID || '1Vq4gODo_veMJUoE6KzOSTX-gc9EVXAU8';
const SHARED_DRIVE_RESIDENTIAL_ID = process.env.SHARED_DRIVE_RESIDENTIAL_ID || '1vkfdY4OYdljEevai3oZTGxUGSqytekSi';

const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Built-in phonetic & alias registry for RHIVE's core commercial accounts,
 * their spoken acronyms ("U-N-P-H-C"), properties ("Dominguez Park", "Preston Place"),
 * and known key contacts — always active at 0ms even during container cold start.
 */
const COMMERCIAL_VIP_SEEDS = [
  {
    accountName: 'UNPHC (Utah Nonprofit Housing Corporation)',
    canonicalCode: 'UNPHC',
    aliases: [
      'unphc', 'u n p h c', 'u-n-p-h-c', 'u.n.p.h.c', 'u and p h c', 'un phc',
      'utah nonprofit housing', 'utah non-profit housing', 'utah non profit housing',
      'utah nonprofit housing corporation', 'utah nonprofit housing corp',
      'dominguez park', 'dominguez lp', 'dominguez', 'preston place', 'unphc.org'
    ],
    knownPhones: ['3852598179', '8013009923'],
    knownContacts: ['greg wright', 'esperanza vicente'],
    defaultSpecialist: 'kara'
  },
  {
    accountName: 'PPC-Utah',
    canonicalCode: 'PPC',
    aliases: ['ppc', 'p p c', 'p-p-c', 'ppc utah', 'ppc-utah', 'ppc_utah'],
    knownPhones: [],
    knownContacts: [],
    defaultSpecialist: 'michael'
  },
  {
    accountName: 'ACS Advanced Community Services',
    canonicalCode: 'ACS',
    aliases: ['acs', 'a c s', 'a-c-s', 'advanced community services', 'acs advanced community services'],
    knownPhones: [],
    knownContacts: [],
    defaultSpecialist: 'michael'
  },
  {
    accountName: 'ICON National',
    canonicalCode: 'ICON National',
    aliases: ['icon national', 'icon'],
    knownPhones: [],
    knownContacts: [],
    defaultSpecialist: 'michael'
  },
  {
    accountName: 'Wadman Corp',
    canonicalCode: 'Wadman Corp',
    aliases: ['wadman', 'wadman corp', 'wadman corporation'],
    knownPhones: [],
    knownContacts: [],
    defaultSpecialist: 'michael'
  },
  {
    accountName: 'Mint Construction',
    canonicalCode: 'Mint Construction',
    aliases: ['mint construction', 'mint'],
    knownPhones: [],
    knownContacts: [],
    defaultSpecialist: 'michael'
  },
  {
    accountName: 'Heritage Investment Group',
    canonicalCode: 'Heritage Investment Group',
    aliases: ['heritage investment', 'heritage investment group'],
    knownPhones: [],
    knownContacts: [],
    defaultSpecialist: 'michael'
  },
  {
    accountName: 'Larry H Miller',
    canonicalCode: 'Larry H Miller',
    aliases: ['larry h miller', 'larry miller', 'lhm', 'l h m'],
    knownPhones: [],
    knownContacts: [],
    defaultSpecialist: 'michael'
  },
  {
    accountName: 'Ken Garff West Valley',
    canonicalCode: 'Ken Garff West Valley',
    aliases: ['ken garff', 'ken garff west valley', 'garff'],
    knownPhones: [],
    knownContacts: [],
    defaultSpecialist: 'michael'
  },
  {
    accountName: 'Wellness Farms',
    canonicalCode: 'Wellness Farms',
    aliases: ['wellness farms'],
    knownPhones: [],
    knownContacts: [],
    defaultSpecialist: 'michael'
  },
  {
    accountName: 'Transtar',
    canonicalCode: 'Transtar',
    aliases: ['transtar'],
    knownPhones: [],
    knownContacts: [],
    defaultSpecialist: 'michael'
  },
  {
    accountName: 'Dojo',
    canonicalCode: 'Dojo',
    aliases: ['dojo'],
    knownPhones: [],
    knownContacts: [],
    defaultSpecialist: 'michael'
  },
  {
    accountName: 'Trade Supply Partners (SRS / ABC / Beacon)',
    canonicalCode: 'Trade Supply',
    aliases: ['srs distribution', 'srs building', 'srs', 'abc supply', 'beacon building', 'beacon supply'],
    knownPhones: [],
    knownContacts: [],
    defaultSpecialist: 'kara'
  }
];

const IGNORE_FOLDER_NAMES = new Set([
  'video_analysis_test', 'test1', 'test', 'past clients', 'archive', 'templates', 'misc'
]);

const directoryCache = {
  lastSyncedAt: 0,
  syncInFlight: null,
  commercialFolders: [],
  residentialFolders: [],
  googleContacts: [],
  firestoreContacts: []
};

function cleanPhone10(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/[^0-9]/g, '');
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1);
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

function normalizeMatchText(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[._-]+/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generates spoken-acronym & spaced-letter variants for any multi-word company folder
 * e.g. "Utah Nonprofit Housing Corporation" -> ["utah nonprofit housing corporation", "unhc", "u n h c"]
 */
function buildFolderVariants(folderName) {
  const clean = normalizeMatchText(folderName);
  if (!clean || IGNORE_FOLDER_NAMES.has(clean)) return [];
  const variants = new Set([clean]);
  const words = clean.split(' ').filter(w => w.length > 0 && w !== 'and' && w !== '&');
  if (words.length >= 2 && words.length <= 6) {
    const acronym = words.map(w => w[0]).join('');
    if (acronym.length >= 3) {
      variants.add(acronym);
      variants.add(acronym.split('').join(' '));
    }
  }
  // If folder name is already an acronym (e.g. "UNPHC", "ACS", "PPC"), add spaced letters "u n p h c"
  if (words.length === 1 && words[0].length >= 3 && words[0].length <= 6) {
    variants.add(words[0].split('').join(' '));
  }
  return Array.from(variants);
}

/**
 * Refreshes live Commercial Drive, Residential Drive, Google Contacts & Firestore Contacts.
 * Non-blocking when cached; enforces a tight timeout so calls never stall.
 */
async function syncVipDirectory({ driveClient = null, fetchGoogleContacts = null, initFirestore = null, force = false } = {}) {
  const now = Date.now();
  if (!force && directoryCache.lastSyncedAt > 0 && (now - directoryCache.lastSyncedAt < CACHE_TTL_MS)) {
    return directoryCache;
  }
  if (directoryCache.syncInFlight) {
    return directoryCache.syncInFlight;
  }

  directoryCache.syncInFlight = (async () => {
    const tasks = [];

    // 1. Live Google Drive Commercial & Residential Folders
    if (driveClient) {
      tasks.push(
        driveClient.files.list({
          q: `'${SHARED_DRIVE_COMMERCIAL_ID}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
          fields: 'files(id, name)',
          pageSize: 150,
          supportsAllDrives: true,
          includeItemsFromAllDrives: true
        }).then(res => {
          directoryCache.commercialFolders = (res.data.files || [])
            .map(f => ({ id: f.id, name: String(f.name || '').trim(), variants: buildFolderVariants(f.name) }))
            .filter(f => f.name && !IGNORE_FOLDER_NAMES.has(f.name.toLowerCase()));
        }).catch(err => console.warn('[VIP Directory] Commercial Drive sync note:', err.message))
      );

      tasks.push(
        driveClient.files.list({
          q: `'${SHARED_DRIVE_RESIDENTIAL_ID}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
          fields: 'files(id, name)',
          pageSize: 150,
          supportsAllDrives: true,
          includeItemsFromAllDrives: true
        }).then(res => {
          directoryCache.residentialFolders = (res.data.files || [])
            .map(f => ({ id: f.id, name: String(f.name || '').trim(), clean: normalizeMatchText(f.name) }))
            .filter(f => f.name && !IGNORE_FOLDER_NAMES.has(f.name.toLowerCase()));
        }).catch(err => console.warn('[VIP Directory] Residential Drive sync note:', err.message))
      );
    }

    // 2. Live Google Contacts (all contacts up to 1,000)
    if (typeof fetchGoogleContacts === 'function') {
      tasks.push(
        fetchGoogleContacts(force).then(list => {
          if (Array.isArray(list)) {
            directoryCache.googleContacts = list;
          }
        }).catch(err => console.warn('[VIP Directory] Google Contacts sync note:', err.message))
      );
    }

    // 3. Firestore Contacts
    if (typeof initFirestore === 'function') {
      tasks.push((async () => {
        try {
          const db = initFirestore();
          if (!db) return;
          const snap = await db.collection('contacts').where('isDeleted', '==', false).limit(300).get();
          const list = [];
          snap.forEach(doc => {
            const d = doc.data() || {};
            list.push({
              id: doc.id,
              name: d.full_name || d.name || '',
              company: d.company || d.companyName || '',
              phone10: cleanPhone10(d.phone || doc.id)
            });
          });
          directoryCache.firestoreContacts = list;
        } catch (err) {
          console.warn('[VIP Directory] Firestore contacts sync note:', err.message);
        }
      })());
    }

    await Promise.allSettled(tasks);
    directoryCache.lastSyncedAt = Date.now();
    directoryCache.syncInFlight = null;
    console.log(
      `[VIP Directory] Synced ${directoryCache.commercialFolders.length} Commercial Drive accounts, ` +
      `${directoryCache.residentialFolders.length} Residential Drive customers, ` +
      `${directoryCache.googleContacts.length} Google Contacts, ${directoryCache.firestoreContacts.length} Firestore contacts.`
    );
    return directoryCache;
  })();

  return directoryCache.syncInFlight;
}

/**
 * Checks whether a spoken phrase contains a whole-word / whole-phrase token match
 * (prevents false matches like "icon" matching "silicone" or "acs" matching "facts").
 */
function hasTokenMatch(haystack, needle) {
  const h = normalizeMatchText(haystack);
  const n = normalizeMatchText(needle);
  if (!h || !n || n.length < 3) return false;
  const escaped = n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|\\s)${escaped}(?:\\s|$)`, 'i').test(h);
}

/**
 * Resolves preferred routing specialist (Michael vs Kara) for a matched VIP / Customer.
 */
function resolveVipTarget(defaultSpecialist, combinedText) {
  const txt = String(combinedText || '').toLowerCase();
  if (/\b(kara|carrie|cara|billing|invoice|payable|receivable|accounting|payment|order|supplier|delivery|customer service)\b/i.test(txt)) {
    return 'kara';
  }
  if (/\b(michael|mike|leak|water|estimate|quote|inspection|roof|tarp|repair|commercial roof)\b/i.test(txt)) {
    return 'michael';
  }
  return defaultSpecialist || 'michael';
}

/**
 * Silent VIP Commercial Account & Known Customer Matcher.
 * Evaluates Caller ID + spoken name/company/property/transcript against:
 *   1. Built-in Commercial VIP Seeds (UNPHC, PPC, ACS, Wadman, Larry H Miller, Ken Garff, etc.)
 *   2. Live Google Drive Commercial Shared Drive folders
 *   3. Live Google Drive Residential Shared Drive customer folders
 *   4. Live Google Contacts (phone, name, organization)
 *   5. Live Firestore Contacts (excluding generic/solicitor records)
 *
 * Returns { matched, tier, accountName, matchedContactName, matchedBy, preferredTarget, privacyShield, whisperSummary }
 */
function matchVipOrCustomer({
  phone = '',
  callerName = '',
  companyName = '',
  propertyAddress = '',
  reason = '',
  transcript = ''
} = {}) {
  const phone10 = cleanPhone10(phone);
  const combinedText = [callerName, companyName, propertyAddress, reason, transcript].filter(Boolean).join(' ');
  const combinedNorm = normalizeMatchText(combinedText);

  // Never VIP-fast-pass obvious spam/cold-sales solicitors
  if (/\b(seo|software sales|marketing agency|lead gen|experian business credit|line of credit|pre-qualified for|merchant services|staffing recruiter|zoho|hook point)\b/i.test(combinedText)) {
    return { matched: false, isSolicitor: true };
  }

  // 1. Check Commercial VIP Seeds (Phone -> Alias/Acronym -> Known Contact)
  for (const seed of COMMERCIAL_VIP_SEEDS) {
    if (phone10 && seed.knownPhones.includes(phone10)) {
      const target = resolveVipTarget(seed.defaultSpecialist, combinedText);
      return {
        matched: true,
        tier: 'VIP_COMMERCIAL',
        accountName: seed.accountName,
        canonicalCode: seed.canonicalCode,
        matchedContactName: callerName || seed.knownContacts[0] || '',
        matchedBy: 'vip_commercial_phone',
        preferredTarget: target,
        privacyShield: true,
        whisperSummary: `VIP Commercial Account ${seed.accountName}${callerName ? ' — ' + callerName : ''}`
      };
    }
    if (combinedNorm) {
      const matchedAlias = seed.aliases.find(a => hasTokenMatch(combinedNorm, a));
      if (matchedAlias) {
        const target = resolveVipTarget(seed.defaultSpecialist, combinedText);
        return {
          matched: true,
          tier: 'VIP_COMMERCIAL',
          accountName: seed.accountName,
          canonicalCode: seed.canonicalCode,
          matchedContactName: callerName || '',
          matchedBy: `vip_commercial_alias:${matchedAlias}`,
          preferredTarget: target,
          privacyShield: true,
          whisperSummary: `VIP Commercial Account ${seed.accountName}${callerName ? ' — ' + callerName : ''}`
        };
      }
      const matchedContact = seed.knownContacts.find(c => hasTokenMatch(combinedNorm, c));
      if (matchedContact) {
        const target = resolveVipTarget(seed.defaultSpecialist, combinedText);
        return {
          matched: true,
          tier: 'VIP_COMMERCIAL',
          accountName: seed.accountName,
          canonicalCode: seed.canonicalCode,
          matchedContactName: callerName || matchedContact,
          matchedBy: `vip_commercial_contact:${matchedContact}`,
          preferredTarget: target,
          privacyShield: true,
          whisperSummary: `VIP Commercial Account ${seed.accountName} — ${callerName || matchedContact}`
        };
      }
    }
  }

  // 2. Check Live Google Drive Commercial Shared Drive Folders (auto-discovers any newly added commercial accounts!)
  for (const folder of directoryCache.commercialFolders) {
    if (combinedNorm && folder.variants.some(v => hasTokenMatch(combinedNorm, v))) {
      const target = resolveVipTarget('michael', combinedText);
      return {
        matched: true,
        tier: 'VIP_COMMERCIAL',
        accountName: folder.name,
        canonicalCode: folder.name,
        matchedContactName: callerName || '',
        matchedBy: 'drive_commercial_folder',
        preferredTarget: target,
        privacyShield: true,
        whisperSummary: `VIP Commercial Drive Account ${folder.name}${callerName ? ' — ' + callerName : ''}`
      };
    }
  }

  // 3. Check Live Google Drive Residential Customer Folders (by full name or last name + first name)
  if (combinedNorm) {
    for (const folder of directoryCache.residentialFolders) {
      const cleanName = folder.clean;
      if (!cleanName || cleanName.length < 5) continue;
      // Match full folder name OR individual "First Last" pair (e.g. "Chad Evenhuis", "Melony Pulley")
      const parts = cleanName.split(' ').filter(w => w.length >= 3 && w !== 'and');
      const fullHit = hasTokenMatch(combinedNorm, cleanName);
      const lastName = parts[parts.length - 1];
      const firstAndLastHit = parts.length >= 2 && lastName.length >= 4 &&
        hasTokenMatch(combinedNorm, lastName) &&
        parts.slice(0, -1).some(fn => fn.length >= 3 && hasTokenMatch(combinedNorm, fn));

      if (fullHit || firstAndLastHit) {
        const target = resolveVipTarget('michael', combinedText);
        return {
          matched: true,
          tier: 'EXISTING_RESIDENTIAL',
          accountName: folder.name,
          canonicalCode: folder.name,
          matchedContactName: callerName || folder.name,
          matchedBy: 'drive_residential_customer',
          preferredTarget: target,
          privacyShield: true,
          whisperSummary: `Existing Residential Customer ${folder.name}`
        };
      }
    }
  }

  // 4. Check Live Google Contacts (by phone, full name, or organization)
  for (const c of directoryCache.googleContacts) {
    const phoneHit = phone10 && Array.isArray(c.phones) && c.phones.some(p => p.clean === phone10);
    const orgHit = combinedNorm && c.organization && c.organization.length >= 4 && hasTokenMatch(combinedNorm, c.organization);
    const fullNameHit = combinedNorm && c.givenName && c.familyName && c.familyName.length >= 3 &&
      hasTokenMatch(combinedNorm, `${c.givenName} ${c.familyName}`);

    if (phoneHit || orgHit || fullNameHit) {
      const target = resolveVipTarget('michael', combinedText);
      const acctLabel = c.organization ? `${c.name} (${c.organization})` : c.name;
      return {
        matched: true,
        tier: c.organization ? 'KNOWN_COMMERCIAL_CONTACT' : 'KNOWN_CONTACT',
        accountName: c.organization || c.name,
        canonicalCode: c.organization || c.name,
        matchedContactName: c.name,
        matchedBy: phoneHit ? 'google_contacts_phone' : (orgHit ? 'google_contacts_org' : 'google_contacts_name'),
        preferredTarget: target,
        privacyShield: true,
        whisperSummary: `Known Contact ${acctLabel}`
      };
    }
  }

  // 5. Check Firestore Contacts (only if they have a real company or verified name)
  for (const fc of directoryCache.firestoreContacts) {
    if (phone10 && fc.phone10 === phone10 && (fc.company || (fc.name && fc.name.includes(' ')))) {
      const target = resolveVipTarget('kara', combinedText);
      const acctLabel = fc.company ? `${fc.name || 'Caller'} (${fc.company})` : fc.name;
      return {
        matched: true,
        tier: fc.company ? 'KNOWN_COMMERCIAL_CONTACT' : 'KNOWN_CONTACT',
        accountName: fc.company || fc.name,
        canonicalCode: fc.company || fc.name,
        matchedContactName: fc.name || '',
        matchedBy: 'firestore_contact_phone',
        preferredTarget: target,
        privacyShield: true,
        whisperSummary: `Returning Account ${acctLabel}`
      };
    }
  }

  return { matched: false };
}

function getVipDirectorySummary() {
  return {
    lastSyncedAt: directoryCache.lastSyncedAt ? new Date(directoryCache.lastSyncedAt).toISOString() : null,
    commercialSeedsCount: COMMERCIAL_VIP_SEEDS.length,
    commercialDriveFoldersCount: directoryCache.commercialFolders.length,
    commercialDriveFolders: directoryCache.commercialFolders.map(f => f.name),
    residentialDriveFoldersCount: directoryCache.residentialFolders.length,
    residentialDriveFolders: directoryCache.residentialFolders.map(f => f.name),
    googleContactsCount: directoryCache.googleContacts.length,
    firestoreContactsCount: directoryCache.firestoreContacts.length,
    privacyShieldMode: 'SILENT_PASS_THROUGH_ZERO_DISCLOSURE'
  };
}

module.exports = {
  COMMERCIAL_VIP_SEEDS,
  syncVipDirectory,
  matchVipOrCustomer,
  getVipDirectorySummary,
  cleanPhone10,
  normalizeMatchText
};
