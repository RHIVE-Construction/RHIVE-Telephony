/**
 * RHIVE Telephony Swarm - Live Production Verification Test Suite
 * Target: https://rhive-voice-live-bridge-910835773728.us-central1.run.app
 */
const axios = require('axios');
const WebSocket = require('ws');

const BASE_URL = 'https://rhive-voice-live-bridge-910835773728.us-central1.run.app';

async function runLiveTests() {
  console.log('================================================================');
  console.log('RHIVE CLOUD RUN REVISION LIVE VERIFICATION SUITE');
  console.log(`Target: ${BASE_URL}`);
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
    }
  }

  try {
    const res = await axios.get(`${BASE_URL}/health`);
    assert(res.status === 200 && res.data.status === 'ok', 'GET /health returned HTTP 200 OK');
  } catch(e) {
    assert(false, 'GET /health failed: ' + e.message);
  }

  try {
    const res = await axios.get(`${BASE_URL}/settings`);
    assert(res.status === 200 && res.data.includes('cockpit-turn-latency'), 'Web Voice Cockpit with Option A latency meter loaded in production');
  } catch(e) {
    assert(false, 'GET /settings failed: ' + e.message);
  }

  try {
    const res = await axios.get(`${BASE_URL}/api/telephony/rules`);
    assert(res.status === 200 && Array.isArray(res.data.rules), 'GET /api/telephony/rules returns live dynamic rules array');
  } catch(e) {
    assert(false, 'GET /api/telephony/rules failed: ' + e.message);
  }

  console.log(`\n================================================================`);
  console.log(`LIVE PRODUCTION VERIFICATION COMPLETE: ${passed} / ${total} Passed`);
  console.log(`================================================================\n`);

  process.exit(passed === total ? 0 : 1);
}

runLiveTests();
