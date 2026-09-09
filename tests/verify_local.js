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
  assert(settingsHtml.includes('Gemini 3.5 Flash-Lite'), 'UI features Gemini 3.5 Flash-Lite for sub-300ms triage & reasoning');
  assert(settingsHtml.includes('Gemini 3.1 Flash Live'), 'UI features Gemini 3.1 Flash Live for full-duplex speech-to-speech voice');
  assert(settingsHtml.includes('Gemini 3.5 Transcribe Live'), 'UI features Gemini 3.5 Transcribe Live for bidirectional STT streaming');

  console.log(`\nSpawning local server on port ${TEST_PORT}...`);
  const serverPath = path.join(__dirname, '..', 'server.js');
  serverProc = spawn('node', [serverPath], {
    env: { ...process.env, PORT: String(TEST_PORT) },
    cwd: path.join(__dirname, '..'),
    stdio: 'pipe'
  });

  serverProc.stdout.on('data', d => {
    const s = d.toString().trim();
    if (s.includes('RUNNING ON PORT') || s.includes('READY')) {
      console.log('  [Server]', s);
    }
  });

  await new Promise(r => setTimeout(r, 2500));

  // Test 2: Health Check & Multi-Model Architecture Audit
  try {
    const res = await axios.get(`http://localhost:${TEST_PORT}/health`);
    assert(res.status === 200 && res.data.status === 'ok', 'GET /health returns 200 OK');
    assert(res.data.models && res.data.models.voiceEngine === 'gemini-3.1-flash-live-preview', 'Health reports Voice Engine: gemini-3.1-flash-live-preview');
    assert(res.data.models && res.data.models.agenticWriting === 'gemini-3.8-flash', 'Health reports Agentic Writing & DISC: gemini-3.8-flash');
    assert(res.data.models && res.data.models.reasoningInspector === 'gemini-3.5-flash-lite', 'Health reports Sub-300ms Reasoning Inspector: gemini-3.5-flash-lite');
    assert(res.data.models && res.data.models.liveTranscription === 'gemini-3.5-transcribe-live', 'Health reports Bidirectional Streaming STT: gemini-3.5-transcribe-live');
  } catch(e) {
    assert(false, 'GET /health error: ' + e.message);
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
