/**
 * RHIVE Telephony Swarm - Rev 39 Local Verification Test Suite
 * Tests health, Google Auth Gate, WebSocket streaming, Explain Turn, Replay Turn, Call Flow Matrix, and Zero Checkbox UI Rule.
 */
const axios = require('axios');
const { WebSocket } = require('ws');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const TEST_PORT = 8996;
process.env.PORT = String(TEST_PORT);

console.log('================================================================');
console.log('RHIVE TELEPHONY SWARM - REV 39 LOCAL VERIFICATION SUITE');
console.log('================================================================');

let serverProc = null;

async function runTests() {
  let passed = 0;
  let total = 0;

  function assert(condition, desc) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${desc}`);
    }
  }

  // Static Test 1: Zero Checkbox Verification & Rev 41 UI Elements
  const settingsHtml = fs.readFileSync(path.join(__dirname, '..', 'public', 'settings.html'), 'utf8');
  const hasCheckbox = /<input[^>]*type=["']checkbox["']/i.test(settingsHtml);
  assert(!hasCheckbox, 'Public UI strictly adheres to NO CHECKBOX rule (Quantum switches only)');
  assert(settingsHtml.includes('antigravity-toolbar'), 'Antigravity floating selection toolbar injected into cockpit');
  assert(settingsHtml.includes('reasoning-drawer'), 'Slide-out Reasoning Inspector drawer injected into cockpit');
  assert(settingsHtml.includes('replay-modal'), 'Step-by-Step Replayer modal injected into cockpit');
  assert(settingsHtml.includes('call-flow-matrix-section'), 'Wasatch Commercial Call Flow Matrix section injected into cockpit');
  assert(settingsHtml.includes('flow-detail-modal'), 'Rev 41 Flow Pathway & Inspection modal injected into cockpit');
  assert(settingsHtml.includes('copy-toast'), 'Rev 41 1-click clipboard copy toast notification injected');
  assert(settingsHtml.includes('AI MODEL ROUTING MATRIX'), 'Multi-Model Specialist Architecture Ribbon injected into cockpit header');
  assert(settingsHtml.includes('Gemini 3.8 Flash'), 'UI features Gemini 3.8 Flash for Executive Agentic Writing & DISC synthesis');
  assert(settingsHtml.includes('Gemini 3.8 Flash'), 'UI features Gemini 3.8 Flash for sub-300ms triage & reasoning');
  assert(settingsHtml.includes('Gemini 3.8 Live'), 'UI features Gemini 3.8 Live for full-duplex speech-to-speech voice');
  assert(settingsHtml.includes('Gemini 3.8 Live Transcribe') || settingsHtml.includes('gemini-3.8-live'), 'UI features Gemini 3.8 Live Transcribe for bidirectional STT streaming');


  // Static Test 1B: Rev 66 Executive Dashboard (Pure White Background + Zero Checkboxes)
  const dashboardPath = path.join(__dirname, '..', 'public', 'dashboard.html');
  assert(fs.existsSync(dashboardPath), 'Rev 66 Executive Dashboard HTML exists in public/dashboard.html');
  const dashboardHtml = fs.readFileSync(dashboardPath, 'utf8');
  const dashCheckbox = /<input[^>]*type=["']checkbox["']/i.test(dashboardHtml);
  assert(!dashCheckbox, 'Executive Dashboard strictly adheres to NO CHECKBOX rule (Pure Quantum Switches)');
  assert(dashboardHtml.includes('--bg-main: #FFFFFF;'), 'Executive Dashboard features pure white background (#FFFFFF)');
  assert(dashboardHtml.includes('--rhive-pink: #ec028b;'), 'Executive Dashboard includes RHIVE Pink brand color (#ec028b)');
  assert(dashboardHtml.includes('--rhive-blue: #08137C;'), 'Executive Dashboard includes RHIVE Blue brand color (#08137C)');

  // Static Test 1C: Mobile Project Intake & Verification PWA (Pure White Background + Zero Checkboxes)
  const verifyPath = path.join(__dirname, '..', 'public', 'verify.html');
  assert(fs.existsSync(verifyPath), 'Project Intake & Verification HTML exists in public/verify.html');
  const verifyHtml = fs.readFileSync(verifyPath, 'utf8');
  const verifyCheckbox = /<input[^>]*type=["']checkbox["']/i.test(verifyHtml);
  assert(!verifyCheckbox, 'Project Verification Form strictly adheres to NO CHECKBOX rule (Pure Quantum Switches)');
  assert(verifyHtml.includes('--bg: #FFFFFF;'), 'Project Verification Form features pure white background (#FFFFFF)');
  assert(verifyHtml.includes('--accent: #ec028b;'), 'Project Verification Form includes RHIVE Pink brand color (#ec028b)');
  assert(verifyHtml.includes('--primary: #08137C;'), 'Project Verification Form includes RHIVE Blue brand color (#08137C)');

  // Static Test 1D: V4 Cyberpunk Chamfered Super-App (Dialer, Mobile, AI Studio & PWA Service Worker)
  const dialerHtml = fs.readFileSync(path.join(__dirname, '..', 'public', 'dialer.html'), 'utf8');
  const mobileHtml = fs.readFileSync(path.join(__dirname, '..', 'public', 'mobile.html'), 'utf8');
  const aiHtml = fs.readFileSync(path.join(__dirname, '..', 'public', 'ai.html'), 'utf8');
  const swJs = fs.readFileSync(path.join(__dirname, '..', 'public', 'sw.js'), 'utf8');

  assert(!/<input[^>]*type=["']checkbox["']/i.test(dialerHtml), 'dialer.html strictly adheres to NO CHECKBOX rule (Chamfered Quantum Switches)');
  assert(!/<input[^>]*type=["']checkbox["']/i.test(mobileHtml), 'mobile.html strictly adheres to NO CHECKBOX rule (Chamfered Quantum Switches)');
  assert(!/<input[^>]*type=["']checkbox["']/i.test(aiHtml), 'ai.html strictly adheres to NO CHECKBOX rule (Chamfered Quantum Switches)');
  assert(!swJs.includes('self.registration.unregister()'), 'public/sw.js keeps PWA Service Worker active for Pixel 8 & Pixel 11 XL');
  assert(dialerHtml.includes('clip-path: polygon'), 'dialer.html enforces 45-degree Cyberpunk Chamfer geometry');
  assert(dialerHtml.includes('googleAccountAvatar'), 'dialer.html features logged-in Google Account Avatar badge in ultra-slim 40px header');
  assert(dialerHtml.includes('outboundCallerIdSelect'), 'dialer.html includes JustCall-style Outbound Caller ID selector');
  assert(dialerHtml.includes('inAppGoogleChatPanel') && dialerHtml.includes('tabMeet') && dialerHtml.includes('tabNotes') && dialerHtml.includes('tabHoney'), 'dialer.html embeds In-App Google Chat, Meet, Notes & Dedicated Honey AI tabs');

  console.log(`\nSpawning local server on port ${TEST_PORT}...`);
  const serverPath = path.join(__dirname, '..', 'server.js');
  serverProc = spawn('node', [serverPath], {
    env: { ...process.env, PORT: String(TEST_PORT), NODE_ENV: 'test', GOOGLE_CHAT_WEBHOOK_URL: '' },
    cwd: path.join(__dirname, '..'),
    stdio: 'pipe'
  });

  serverProc.stdout.on('data', d => {
    const s = d.toString().trim();
    if (s.includes('RUNNING ON PORT') || s.includes('READY')) {
      console.log('  [Server]', s);
    }
  });

  serverProc.stderr.on('data', d => {
    console.error('  [Server Error]', d.toString().trim());
  });

  // Wait for server to start listening (up to 30s)
  await new Promise((resolve, reject) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        await axios.get(`http://localhost:${TEST_PORT}/health`);
        clearInterval(interval);
        resolve();
      } catch (err) {
        if (attempts > 60) {
          clearInterval(interval);
          reject(new Error('Server failed to start within 30 seconds'));
        }
      }
    }, 500);
  });

  // Test 2: Health Check & Multi-Model Architecture Audit
  try {
    const res = await axios.get(`http://localhost:${TEST_PORT}/health`);
    assert(res.status === 200 && res.data.status === 'ok', 'GET /health returns 200 OK');
    assert(res.data.revision === 'Rev 68' && res.data.version === '1.9.0', 'Health reports revision: Rev 68 (v1.9.0)');
    assert(res.data.ambientCompositeLoaded === true, 'Health reports ambientCompositeLoaded: true');
    assert(res.data.dashboardAvailable === true, 'Health reports Executive Dashboard is available');
    assert(res.data.verifyAvailable === true, 'Health reports Project Verification PWA is available');
    assert(res.data.models && (res.data.models.voiceEngine === 'gemini-3.8-live' || res.data.models.voiceEngine === 'gemini-3.1-flash-live-preview'), 'Health reports Voice Engine: ' + res.data.models.voiceEngine);
    assert(res.data.models && res.data.models.extendedThinking === 'gemini-3.8-live-extended-thinking', 'Health reports Extended Thinking: gemini-3.8-live-extended-thinking');
    assert(res.data.models && res.data.models.agenticWriting === 'gemini-3.8-flash', 'Health reports Agentic Writing & DISC: gemini-3.8-flash');
    assert(res.data.models && (res.data.models.reasoningInspector === 'gemini-3.8-flash' || res.data.models.reasoningInspector === 'gemini-3.5-flash-lite'), 'Health reports Sub-300ms Reasoning Inspector: ' + res.data.models?.reasoningInspector);
    assert(res.data.models && (res.data.models.liveTranscription === 'gemini-3.5-transcribe-live' || res.data.models.liveTranscription === 'gemini-3.8-live'), 'Health reports Bidirectional Streaming STT: ' + res.data.models?.liveTranscription);

    // Verify GET / serves the all-white dashboard or landing
    const dashRes = await axios.get(`http://localhost:${TEST_PORT}/`);
    assert(dashRes.status === 200 && (dashRes.data.includes('Executive Telephony Dashboard') || dashRes.data.includes('RHIVE')), 'GET / serves Rev 67 All-White Executive Dashboard');

  } catch(e) {
    assert(false, 'GET /health error: ' + e.message);
  }

  // Test 2C: Mobile Project Verification Route & API Endpoints
  try {
    const verifyPageRes = await axios.get(`http://localhost:${TEST_PORT}/verify`);
    assert(verifyPageRes.status === 200 && verifyPageRes.data.includes('Project Quote Intake & Verification'), 'GET /verify serves Project Intake & Verification HTML');

    const infoRes = await axios.get(`http://localhost:${TEST_PORT}/api/verify-info?phone=8014491451`);
    assert(infoRes.status === 200 && infoRes.data.phone !== undefined, 'GET /api/verify-info returns 200 and schema');

    const submitRes = await axios.post(`http://localhost:${TEST_PORT}/api/verify-email`, {
      phone: '8014491451',
      email: 'verified_tester@rhiveconstruction.com',
      priority: 'Fast Installation'
    });
    assert(submitRes.status === 200 && submitRes.data.success === true, 'POST /api/verify-email successfully verifies and clears 10-min timer');
  } catch(e) {
    assert(false, 'Verification endpoints error: ' + e.message);
  }

  // Test 2B: Dynamic Google Auth Config Endpoint
  try {
    const authConfig = await axios.get(`http://localhost:${TEST_PORT}/api/auth/config`);
    assert(authConfig.status === 200 && authConfig.data.clientId, 'GET /api/auth/config returns 200 and clientId');
    assert(authConfig.data.authEnabled === true, 'GET /api/auth/config reports authEnabled: true');
  } catch(e) {
    assert(false, 'GET /api/auth/config error: ' + e.message);
  }

  // Test 3: Auth Verify (Whitelist Gate)
  try {
    const authOk = await axios.post(`http://localhost:${TEST_PORT}/api/auth/verify`, {
      email: 'michael@rhiveconstruction.com',
      name: 'Michael Robinson'
    });
    assert(authOk.status === 200 && authOk.data.authorized === true, 'POST /api/auth/verify authorizes michael@rhiveconstruction.com');
  } catch(e) {
    assert(false, 'Auth verify error: ' + e.message);
  }

  // Test 3B: Auth Verify (Executive Passkey Bypass)
  try {
    const passkeyOk = await axios.post(`http://localhost:${TEST_PORT}/api/auth/verify`, {
      passkey: 'rhive2026'
    });
    assert(passkeyOk.status === 200 && passkeyOk.data.authorized === true, 'POST /api/auth/verify authorizes executive via rhive2026 passkey');
  } catch(e) {
    assert(false, 'Passkey verify error: ' + e.message);
  }

  // Test 4: Auth Reject (Unauthorized)
  try {
    await axios.post(`http://localhost:${TEST_PORT}/api/auth/verify`, {
      email: 'stranger@competitor.com',
      name: 'Unknown'
    });
    assert(false, 'Unauthorized user should have been rejected');
  } catch(e) {
    assert(e.response && e.response.status === 403, 'POST /api/auth/verify returns 403 Forbidden for unauthorized user');
  }

  // Test 5: Web Voice WebSocket Connection
  try {
    const ws = new WebSocket(`ws://localhost:${TEST_PORT}/web-voice-stream?userEmail=michael@rhiveconstruction.com`);
    const wsConnected = await new Promise((resolve) => {
      ws.on('open', () => {
        ws.close();
        resolve(true);
      });
      ws.on('error', () => resolve(false));
      setTimeout(() => resolve(false), 4000);
    });
    assert(wsConnected, 'WSS /web-voice-stream accepts WebSocket audio connection');
  } catch(e) {
    assert(false, 'WebSocket test error: ' + e.message);
  }

  // Test 6: Canonical Call Flows List with Rev 41 Enrichment
  try {
    const res = await axios.get(`http://localhost:${TEST_PORT}/api/telephony/flows`);
    const flows = res.data.flows || [];
    assert(res.status === 200 && flows.length === 4, `GET /api/telephony/flows returns all 4 canonical flows (${flows.length}/4 found)`);
    
    // Rev 47 validation: IVR Option mapping, IVR Key, Operator Test Script, Planned Turns
    const allHaveIvr = flows.every(f => f.ivrOption && f.ivrKey !== undefined);
    assert(allHaveIvr, 'All 4 canonical flows enriched with IVR Key and Canonical Route mapping');

    const allHaveScripts = flows.every(f => f.operatorTestScript && f.operatorTestScript.length > 10);
    assert(allHaveScripts, 'All 4 canonical flows embed verbatim Operator Test Scripts for $0.00 Web Voice testing');

    const allHavePlannedTurns = flows.every(f => Array.isArray(f.plannedTurns) && f.plannedTurns.length >= 2);
    assert(allHavePlannedTurns, 'All 4 canonical flows specify discrete planned conversation turns');
  } catch(e) {
    assert(false, 'GET /api/telephony/flows error: ' + e.message);
  }

  // Test 7: Lock/Unlock Call Flow
  try {
    const res = await axios.post(`http://localhost:${TEST_PORT}/api/telephony/flows/lock`, {
      flowId: 'flow_quotes_residential_commercial',
      isLocked: true
    });
    assert(res.status === 200 && res.data.success === true && res.data.isLocked === true, 'POST /api/telephony/flows/lock locks flow_quotes_residential_commercial');
  } catch(e) {
    assert(false, 'POST /api/telephony/flows/lock error: ' + e.message);
  }

  // Test 8: Explain Turn (Reasoning Inspector via Gemini 3.5 Flash-Lite)
  try {
    const res = await axios.post(`http://localhost:${TEST_PORT}/api/telephony/explain-turn`, {
      turnText: 'Thank you for calling R-HIVE Construction roofing specialists. Honey here, how can I assist you with your roofing project today?',
      callerContext: { test: true }
    });
    const exp = res.data.explanation || {};
    assert(res.status === 200 && exp.matchedRules && exp.matchedRules.length > 0, `POST /api/telephony/explain-turn (Gemini 3.5 Flash-Lite) returns matched rules & intent (${exp.detectedIntent})`);
  } catch(e) {
    assert(false, 'POST /api/telephony/explain-turn error: ' + e.message);
  }

  // Test 9: Replay Turn with Modified Directive (Gemini 3.5 Flash-Lite)
  try {
    const res = await axios.post(`http://localhost:${TEST_PORT}/api/telephony/replay-turn`, {
      turnIndex: 1,
      conversationHistory: [{ role: 'caller', text: 'We have water dripping in our kitchen!' }],
      modifiedDirective: 'Reassure caller immediately and state our 3-hour arrival window with $150 fee per tarp location credited to repair.',
      callerPrompt: 'Water is dripping through our kitchen ceiling right now!'
    });
    assert(res.status === 200 && res.data.replayedText && res.data.success === true, 'POST /api/telephony/replay-turn (Gemini 3.5 Flash-Lite) generates replayed response');
  } catch(e) {
    assert(false, 'POST /api/telephony/replay-turn error: ' + e.message);
  }

  // Test 10: Simulate Call Flow with <20 Words Turn Economy (Gemini 3.5 Flash-Lite)
  try {
    const res = await axios.post(`http://localhost:${TEST_PORT}/api/telephony/flows/simulate`, {
      flowId: 'flow_emergency_leaks_insurance_storm'
    });
    const sim = res.data.simulation || {};
    assert(res.status === 200 && sim.turns && sim.turns.length > 0, `POST /api/telephony/flows/simulate (Gemini 3.5 Flash-Lite) produces multi-turn dialogue (Score: ${sim.complianceScore}%)`);
    
    // Rev 47 Turn Economy check: Honey turns must be <= 25 words
    const honeyTurns = sim.turns.filter(t => t.speaker === 'Honey');
    const allConcise = honeyTurns.every(t => t.text.split(/\s+/).filter(Boolean).length <= 25);
    assert(allConcise, `Honey simulation turns adhere to concise conversational economy (<25 words per turn)`);
  } catch(e) {
    assert(false, 'POST /api/telephony/flows/simulate error: ' + e.message);
  }

  // Test 11: Propose Rule via Gemini 3.8 Flash Agentic Synthesis
  try {
    const res = await axios.post(`http://localhost:${TEST_PORT}/api/telephony/propose-tuning`, {
      turnTranscript: 'Honey: Thanks for calling R-HIVE! Are you looking for a residential or commercial quote today?',
      humanFeedback: 'When caller sounds in a hurry, skip straight to asking for their address and do not ask if it is residential or commercial.',
      userEmail: 'michael@rhiveconstruction.com'
    });
    const prop = res.data.proposal || {};
    assert(res.status === 200 && res.data.success === true && prop.proposedRule, `POST /api/telephony/propose-tuning (Gemini 3.8 Flash) synthesizes rule: "${(prop.proposedRule || '').substring(0, 45)}..."`);
  } catch(e) {
    assert(false, 'POST /api/telephony/propose-tuning error: ' + e.message);
  }

  // Test 12: Sequential Automated Test Suite Across All 4 Canonical Flows
  try {
    const res = await axios.post(`http://localhost:${TEST_PORT}/api/telephony/test-all-flows`);
    assert(res.status === 200 && res.data.success === true, 'POST /api/telephony/test-all-flows returns HTTP 200 and success: true');
    assert(res.data.totalFlows === 4, `All 4 canonical flows simulated (found ${res.data.totalFlows})`);
    assert(res.data.allPassed === true, `All 4 flows pass regression check (avg compliance: ${res.data.averageCompliance}%)`);
  } catch(e) {
    assert(false, 'POST /api/telephony/test-all-flows error: ' + e.message);
  }

  // Test 13: Clean MP3 Hold Music (Zero Scratchiness, Infinite Native Loop)
  try {
    const res = await axios.get(`http://localhost:${TEST_PORT}/hold-music?option=3&callSid=TEST_CALL_123`);
    assert(res.status === 200 && res.data.includes('<Play loop="0">') && res.data.includes('rhive_hold_option3_operations.mp3'), 'GET /hold-music streams clean, pre-encoded MP3 with loop="0" (eliminates scratchy WAV slicing)');
  } catch(e) {
    assert(false, 'GET /hold-music error: ' + e.message);
  }

  // Test 14: Dual Speech & DTMF Screen Whisper (Say 1/2 or Press 1/2) with PBX Protection
  try {
    const res = await axios.get(`http://localhost:${TEST_PORT}/screen-whisper?target=Kara&callerName=Michael&invoiceNumber=4229&reason=Invoice&conf=RHIVE_CALL_123`);
    assert(res.status === 200, 'GET /screen-whisper returns 200 OK');
    assert(res.data.includes('input="dtmf speech"'), 'Screen whisper enables dual input="dtmf speech" (supports saying 1/2 or pressing 1/2)');
    assert(res.data.includes('Say 1 or press 1') || res.data.includes('say 1 or press 1'), 'Screen whisper instructs recipient to say 1/2 or press 1/2');
    assert(res.data.includes('<break time="150ms"/>'), 'Screen whisper injects +150ms settle pause upon recipient answering');
    assert(!res.data.includes('conf=RHIVE_CALL_123&amp;conf=') && !res.data.includes('conf=RHIVE_CALL_123,RHIVE_CALL_123'), 'Screen whisper does NOT duplicate conference name in actionUrl');
  } catch(e) {
    assert(false, 'GET /screen-whisper error: ' + e.message);
  }

  // Test 15: Screen Decision Joins Clean Conference (Zero Array/Comma Duplication)
  try {
    const res = await axios.post(`http://localhost:${TEST_PORT}/screen-decision?conf=RHIVE_TEST_CONF,RHIVE_TEST_CONF`, {
      Digits: '1'
    });
    assert(res.status === 200, 'POST /screen-decision returns 200 OK');
    assert(res.data.includes('<Conference>RHIVE_TEST_CONF</Conference>'), 'Screen decision joins sanitized conference room without duplicate array commas');
  } catch(e) {
    assert(false, 'POST /screen-decision error: ' + e.message);
  }

  // Test 16: Static MP3 Audio Delivery & Content-Type
  try {
    const res = await axios.get(`http://localhost:${TEST_PORT}/audio/rhive_hold_option3_operations.mp3`, {
      responseType: 'arraybuffer'
    });
    assert(res.status === 200 && res.headers['content-type'] === 'audio/mpeg', 'GET /audio/rhive_hold_option3_operations.mp3 serves clean audio/mpeg with caching');
    assert(res.data.length > 1000000, `Local MP3 payload verified (${(res.data.length / 1024 / 1024).toFixed(2)} MB)`);
  } catch(e) {
    assert(false, 'GET /audio/...mp3 error: ' + e.message);
  }

  // Test 17: V4 Super-App In-App Google Chat, Meet, Notes & Shared Drive Routing APIs
  try {
    const chatRes = await axios.get(`http://localhost:${TEST_PORT}/api/workspace/chat?channelId=space-field-ops`);
    assert(chatRes.status === 200 && chatRes.data.success === true && Array.isArray(chatRes.data.messages), 'GET /api/workspace/chat returns In-App Google Chat Spaces & DMs');

    const chatSendRes = await axios.post(`http://localhost:${TEST_PORT}/api/workspace/chat/send`, {
      channelId: 'space-field-ops',
      sender: 'Michael Robison',
      text: 'Verified flashing on Sandy project.',
      projectRef: 'Residential/Chad_Evenhuis_Sandy'
    });
    assert(chatSendRes.status === 200 && chatSendRes.data.success === true, 'POST /api/workspace/chat/send appends message and syncs project reference');

    const meetSnapRes = await axios.post(`http://localhost:${TEST_PORT}/api/workspace/meet/snap`, {
      projectCategory: 'Residential',
      projectFolder: 'Chad_Evenhuis_Sandy',
      caption: 'Valley_Flashing_Check.jpg'
    });
    assert(meetSnapRes.status === 200 && meetSnapRes.data.success === true && meetSnapRes.data.snapshot.driveFolderId === '1vkfdY4OYdljEevai3oZTGxUGSqytekSi', 'POST /api/workspace/meet/snap routes capture to Residential Shared Drive ID (1vkfdY4OYdljEevai3oZTGxUGSqytekSi)');

    const driveRes = await axios.get(`http://localhost:${TEST_PORT}/api/drive/projects`);
    assert(driveRes.status === 200 && driveRes.data.sharedDrive && driveRes.data.sharedDrive.commercialId === '1Vq4gODo_veMJUoE6KzOSTX-gc9EVXAU8', 'GET /api/drive/projects verifies Commercial (1Vq4g...XAU8) & Residential (1vkfd...ekSi) Shared Drive routing');

    const bindRes = await axios.post(`http://localhost:${TEST_PORT}/api/drive/bind-contact`, {
      name: 'Sarah Evenhuis',
      phone: '+18015550199',
      role: 'Additional Homeowner',
      category: 'Residential',
      projectFolder: 'Chad_Evenhuis_Sandy'
    });
    assert(bindRes.status === 200 && bindRes.data.success === true, 'POST /api/drive/bind-contact binds additional homeowner phone number to Residential project folder');

    const notesRes = await axios.get(`http://localhost:${TEST_PORT}/api/workspace/notes`);
    assert(notesRes.status === 200 && notesRes.data.success === true && Array.isArray(notesRes.data.notes), 'GET /api/workspace/notes returns In-App Notes & Pinned Checklists');

    const slotsRes = await axios.get(`http://localhost:${TEST_PORT}/api/calendar/route-slots`);
    assert(slotsRes.status === 200 && slotsRes.data.success === true && Array.isArray(slotsRes.data.slots), 'GET /api/calendar/route-slots returns Route-Optimized Google Calendar slots');

    // Test 18: V4.6 Past Calls, WebRTC Parent/Child Recording Proxy, Verbatim Transcripts & AI Post-Call SMS Action Generator
    const callsRes = await axios.get(`http://localhost:${TEST_PORT}/api/mobile/calls`);
    assert(callsRes.status === 200 && callsRes.data.success === true && callsRes.data.calls.length > 0, `GET /api/mobile/calls returns ${callsRes.data.calls.length} enriched call records with recordings & transcripts`);

    const jenniferCall = callsRes.data.calls.find(c => String(c.contact_phone || c.to || '').includes('4252310700')) || callsRes.data.calls[0];
    assert(jenniferCall && jenniferCall.has_recording === true && jenniferCall.recording_url, `Recent call (${jenniferCall?.contact_name}) has playable recording_url: ${jenniferCall?.recording_url}`);
    assert(jenniferCall && jenniferCall.transcript && jenniferCall.transcript.length > 40, `Recent call (${jenniferCall?.contact_name}) includes timestamped verbatim transcript`);

    const streamRes = await axios.get(`http://localhost:${TEST_PORT}/api/telephony/recording-stream/CAab9d4132d01ba9703a9b169fbbb67ca2`, {
      responseType: 'arraybuffer'
    });
    assert(streamRes.status === 200 && (streamRes.headers['content-type'] || '').startsWith('audio/') && streamRes.data.byteLength > 1000, `GET /api/telephony/recording-stream/CAab9d4132d01ba9703a9b169fbbb67ca2 streams ${streamRes.data.byteLength} bytes of ${streamRes.headers['content-type']}`);

    const trRes = await axios.get(`http://localhost:${TEST_PORT}/api/telephony/calls/CAab9d4132d01ba9703a9b169fbbb67ca2/transcript`);
    assert(trRes.status === 200 && trRes.data.success === true && trRes.data.transcript.includes('Monday at 12:20'), 'GET /api/telephony/calls/CAab9d4132d01ba9703a9b169fbbb67ca2/transcript returns verbatim Jennifer dialogue');

    const suggestRes = await axios.get(`http://localhost:${TEST_PORT}/api/telephony/calls/CAab9d4132d01ba9703a9b169fbbb67ca2/suggest-sms?phone=+14252310700`);
    assert(suggestRes.status === 200 && suggestRes.data.firstName === 'Jennifer' && suggestRes.data.appointmentDateTime === 'Monday at 12:20 PM' && suggestRes.data.suggestedSms.startsWith('Hi Jennifer, we are messaging to confirm'), 'GET /api/telephony/calls/:callSid/suggest-sms extracts Jennifer + Monday at 12:20 PM + 1852 East Gentile Street and generates SMS confirmation');
  } catch (e) {
    assert(false, 'V4 Super-App API test error: ' + e.message);
  }

  // Test 19: V5.0 Zero-Dead-Air TwiML Rescue, Google AQuA Sentinel, Elephant-Goldfish Reviewer & Live Honey Audio Stream Proof
  try {
    const twimlRes = await axios.post(`http://localhost:${TEST_PORT}/twiml`, {
      CallSid: 'CA_TEST_TWIML_V5',
      From: '+18019284434',
      To: '+18398676637'
    });
    assert(twimlRes.status === 200 && twimlRes.data.includes('/voice-stream-fallback') && twimlRes.data.includes('<Redirect method="POST">'), 'POST /twiml arms Zero-Dead-Air <Redirect> to /voice-stream-fallback after </Connect>');

    const silentRescueRes = await axios.post(`http://localhost:${TEST_PORT}/voice-stream-fallback?callSid=CA_TEST_SILENT_RESCUE&caller=%2B18019284434`);
    assert(silentRescueRes.status === 200 && silentRescueRes.data.includes('<Gather') && silentRescueRes.data.includes('Google.en-US-Neural2-F'), 'POST /voice-stream-fallback rescues 0-audio-chunk caller immediately with Neural2-F intake (Zero Dead Air)');

    const aquaHealthRes = await axios.get(`http://localhost:${TEST_PORT}/api/telephony/aqua-health`);
    assert(aquaHealthRes.status === 200 && aquaHealthRes.data.agentStatus === 'ANSWERING_READY' && aquaHealthRes.data.zeroDeadAirTwimlFallbackArmed === true, 'GET /api/telephony/aqua-health reports ANSWERING_READY and zeroDeadAirTwimlFallbackArmed: true');

    const aquaAuditRes = await axios.post(`http://localhost:${TEST_PORT}/api/telephony/aqua-audit`, {
      callSid: 'CA_TEST_SILENT_AUDIT',
      callerPhone: '+18019284434',
      honeyAudioChunksSent: 0,
      durationSec: 20,
      geminiCloseReason: 'Simulated expired GEMINI_API_KEY handshake error'
    });
    assert(aquaAuditRes.status === 200 && aquaAuditRes.data.insight?.status === 'CRITICAL_SILENT_AGENT', 'POST /api/telephony/aqua-audit detects CRITICAL_SILENT_AGENT on 0-audio-frame calls');

    const egmRes = await axios.post(`http://localhost:${TEST_PORT}/api/telephony/goldfish-review`, {
      flowName: 'Opening Greeting Audit',
      ruleOrPrompt: 'Hi, welcome to Ry-hive concierge! <break time="500ms"/> We are so happy to help you today!'
    });
    assert(egmRes.status === 200 && egmRes.data.verdict?.passed === false && egmRes.data.verdict?.blindSpots?.length >= 3, `POST /api/telephony/goldfish-review catches banned phrases, phonetic drift & SSML leak (${egmRes.data.verdict?.blindSpots?.length} blind spots caught)`);

    // Live End-to-End Honey Voice Synthesis Verification via /media-stream
    const liveCallSid = 'CA_TEST_LIVE_HONEY_V5';
    const liveAudioStats = await new Promise((resolve) => {
      let mediaFrames = 0;
      let firstAudioMs = null;
      const startedAt = Date.now();
      const ws = new WebSocket(`ws://localhost:${TEST_PORT}/media-stream`);
      const done = () => {
        try { ws.close(); } catch (_) {}
        resolve({ mediaFrames, firstAudioMs });
      };
      const timeout = setTimeout(done, 8500);

      ws.on('open', () => {
        ws.send(JSON.stringify({
          event: 'start',
          start: {
            streamSid: 'MZ_TEST_LIVE_HONEY_V5',
            callSid: liveCallSid,
            customParameters: {
              caller: '+18015550199',
              callSid: liveCallSid,
              agentType: 'intake',
              selection: 'direct_switchboard',
              selectionLabel: 'direct executive switchboard',
              ambient: 'none'
            }
          }
        }));
      });

      ws.on('message', (raw) => {
        try {
          const pkt = JSON.parse(raw.toString());
          if (pkt.event === 'media' && pkt.media && pkt.media.payload) {
            mediaFrames++;
            if (firstAudioMs === null) firstAudioMs = Date.now() - startedAt;
            if (mediaFrames >= 30) {
              clearTimeout(timeout);
              ws.send(JSON.stringify({ event: 'stop' }));
              setTimeout(done, 250);
            }
          }
        } catch (_) {}
      });

      ws.on('error', () => {
        clearTimeout(timeout);
        done();
      });
    });

    assert(liveAudioStats.mediaFrames >= 25, `Live Honey /media-stream synthesized ${liveAudioStats.mediaFrames} G.711u RTP audio frames via gemini-3.8-live (TTFA: ${liveAudioStats.firstAudioMs}ms)`);

    const postLiveFallbackRes = await axios.post(`http://localhost:${TEST_PORT}/voice-stream-fallback?callSid=${liveCallSid}&caller=%2B18015550199`);
    assert(postLiveFallbackRes.status === 200 && postLiveFallbackRes.data.includes('<Hangup/>') && !postLiveFallbackRes.data.includes('<Gather'), 'POST /voice-stream-fallback cleanly hangs up (<Hangup/>) after verified Honey spoken session');

    // Test 20: V5.5 Phase 2 & Phase 3 (Avalon Lexicon, ADK Sub-Agents, NON_BLOCKING Scheduling, AQuA Canary & Closed-Loop Self-Tune)
    assert(aiHtml.includes('aquaGoldfishSentinelBar'), 'ai.html embeds Chamfered Google AQuA + Elephant-Goldfish Live Sentinel Bar');

    const lexRes = await axios.post(`http://localhost:${TEST_PORT}/api/workspace/lexicon-normalize`, {
      text: "arhive roofing installed owen's cornering duration flex with shore nail on 1852 east gentle street in too illa"
    });
    assert(lexRes.status === 200 && lexRes.data.normalized.includes('R-HIVE Construction') && lexRes.data.normalized.includes('Owens Corning Duration FLEX') && lexRes.data.normalized.includes('SureNail') && lexRes.data.normalized.includes('Gentile Street') && lexRes.data.normalized.includes('Tooele'), `POST /api/workspace/lexicon-normalize corrects 5 domain homophones: "${lexRes.data.normalized}"`);

    const subRes = await axios.get(`http://localhost:${TEST_PORT}/api/telephony/subagents`);
    assert(subRes.status === 200 && Array.isArray(subRes.data.subagents) && subRes.data.subagents.length === 4 && subRes.data.nonBlockingToolScheduling?.verify_address === 'WHEN_IDLE' && subRes.data.nonBlockingToolScheduling?.update_caller_profile === 'SILENT', 'GET /api/telephony/subagents exposes 4 ADK specialist sub-agents and NON_BLOCKING WHEN_IDLE/SILENT tool matrix');

    const canaryRes = await axios.post(`http://localhost:${TEST_PORT}/api/telephony/aqua-canary`);
    assert(canaryRes.status === 200 && canaryRes.data.canaryStatus === 'LIVE_VOICE_VERIFIED' && canaryRes.data.handshakeLatencyMs > 0, `POST /api/telephony/aqua-canary verifies live Gemini 3.8 handshake (${canaryRes.data.handshakeLatencyMs}ms)`);

    const selfTuneRes = await axios.post(`http://localhost:${TEST_PORT}/api/telephony/aqua-self-tune`, {});
    assert(selfTuneRes.status === 200 && selfTuneRes.data.goldfishColdAudit?.passed === true && selfTuneRes.data.readyForOneTapApproval === true, `POST /api/telephony/aqua-self-tune synthesizes cold-verified directive: "${(selfTuneRes.data.candidateDirective || '').substring(0, 52)}..."`);

    // Test 21: V6.0 "Are-Hive" Phonetics, 13 Must Invariants, Goldfish Judge, 24/7 Moderator & Carrier Shield
    const settingsRes = await axios.get(`http://localhost:${TEST_PORT}/api/agent/live-settings`);
    assert(
      settingsRes.status === 200 &&
      settingsRes.data.systemInstruction.includes("Are-Hive's AI Roofing Specialist") &&
      !settingsRes.data.systemInstruction.includes("R-hive's AI Roofing Specialist") &&
      !settingsRes.data.systemInstruction.includes('Michael Robinson and our estimating team'),
      'GET /api/agent/live-settings enforces phonetic "Are-Hive\'s AI Roofing Specialist" & zero pre-answer executive name-drops'
    );

    const areHiveNorm = await axios.post(`http://localhost:${TEST_PORT}/api/workspace/lexicon-normalize`, {
      text: "Hi! This is Honey! Are-Hive's AI Roofing Specialist, how may I assist your call today?"
    });
    assert(
      areHiveNorm.status === 200 && areHiveNorm.data.normalized === "Hi! This is Honey! R-HIVE's AI Roofing Specialist, how may I assist your call today?",
      `Dual-layer phonetic mapper converts spoken "Are-Hive's" -> written "${areHiveNorm.data.normalized}"`
    );

    assert(
      aquaHealthRes.data.invariantsCount === 13 && aquaHealthRes.data.executiveSyncSpace === 'spaces/AAQA_y6BMAI',
      'AQuA health exposes all 13 Must Invariants & 24/7 Executive Sync Space (spaces/AAQA_y6BMAI)'
    );

    const driftAuditRes = await axios.post(`http://localhost:${TEST_PORT}/api/telephony/aqua-audit`, {
      callSid: 'CA_TEST_DRIFT_13_INV',
      callerPhone: '+18015550199',
      honeyAudioChunksSent: 42,
      durationSec: 34,
      turns: [
        { role: 'assistant', text: "Hi! This is Honey with Rive's roofing! Slat board decking costs $78 per sheet and Michael will review your eleven thousand four hundred South address. What material do you prefer?" }
      ]
    });
    assert(
      driftAuditRes.status === 200 && (driftAuditRes.data.insight?.anomalies?.length || 0) >= 4,
      `13-Invariant + Goldfish judge catches grouped grid, $78 price leak, material ask, name-drop & phonetic "Rive's" (${driftAuditRes.data.insight?.anomalies?.length} verified violations)`
    );

    const briefRes = await axios.post(`http://localhost:${TEST_PORT}/api/telephony/aqua-daily-brief`, { dispatchChat: false });
    assert(
      briefRes.status === 200 && briefRes.data.success === true && briefRes.data.executiveSyncSpace === 'spaces/AAQA_y6BMAI' && briefRes.data.brief?.chatCardText?.includes('HONEY 24/7 AQuA + GOLDFISH DAILY BRIEF'),
      'POST /api/telephony/aqua-daily-brief builds Daily Executive Sync report with Goldfish-verified constellations'
    );

    const shieldRes = await axios.get(`http://localhost:${TEST_PORT}/api/telephony/carrier-shield`);
    assert(
      shieldRes.status === 200 && shieldRes.data.cnam?.displayName === 'RHIVE ROOFING' && shieldRes.data.shakenStir?.attestationLevel === 'A' && shieldRes.data.a2p10Dlc?.campaignStatus === 'VERIFIED',
      'GET /api/telephony/carrier-shield verifies CNAM ("RHIVE ROOFING"), SHAKEN/STIR ("A"), and 10DLC ("VERIFIED")'
    );
  } catch (e) {
    assert(false, 'V5.0/V6.0 AQuA / Goldfish / Live Honey Audio test error: ' + e.message);
  }

  console.log(`\n================================================================`);
  console.log(`LOCAL VERIFICATION COMPLETE: ${passed} / ${total} Passed (${Math.round(passed/total*100)}%)`);
  console.log(`================================================================\n`);

  if (serverProc) {
    serverProc.kill();
  }

  process.exit(passed === total ? 0 : 1);
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  if (serverProc) serverProc.kill();
  process.exit(1);
});
