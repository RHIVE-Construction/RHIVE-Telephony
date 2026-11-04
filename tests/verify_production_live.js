/**
 * RHIVE Telephony V5.5 - Live Production Cloud Run & WSS Honey Audio Verifier
 * Verifies https://rhive-voice-live-bridge-910835773728.us-central1.run.app
 * and https://rhive-quantum-quoter.web.app end-to-end.
 */
const axios = require('axios');
const { WebSocket } = require('ws');

const CLOUD_RUN_HOST = 'rhive-voice-live-bridge-910835773728.us-central1.run.app';
const HOSTING_URL = 'https://rhive-quantum-quoter.web.app';

async function verifyProduction() {
  let passed = 0;
  let total = 0;
  function assert(cond, msg) {
    total++;
    if (cond) {
      passed++;
      console.log(`  [PASS] ${msg}`);
    } else {
      console.error(`  [FAIL] ${msg}`);
    }
  }

  console.log('==================================================================');
  console.log(' RHIVE V5.5 LIVE PRODUCTION CLOUD RUN & WSS AUDIO VERIFICATION');
  console.log('==================================================================');

  // 1. Live Cloud Run /health (v1.8.0)
  const health = await axios.get(`https://${CLOUD_RUN_HOST}/health`);
  assert(health.status === 200 && health.data.version === '1.8.0', `Cloud Run /health reports version: ${health.data.version} (Persona: ${health.data.voicePersona})`);
  assert(health.data.zeroDeadAirFallback === true && health.data.geminiKeyConfigured === true, `Cloud Run /health confirms geminiKeyConfigured=true & zeroDeadAirFallback=true`);

  // 2. Live AQuA Health & Live 5-Min Canary
  const aquaHealth = await axios.get(`https://${CLOUD_RUN_HOST}/api/telephony/aqua-health`);
  assert(aquaHealth.status === 200 && aquaHealth.data.agentStatus === 'ANSWERING_READY', `GET /api/telephony/aqua-health reports agentStatus: ${aquaHealth.data.agentStatus}`);

  const canary = await axios.post(`https://${CLOUD_RUN_HOST}/api/telephony/aqua-canary`);
  assert(canary.status === 200 && canary.data.canaryStatus === 'LIVE_VOICE_VERIFIED', `POST /api/telephony/aqua-canary verified live Gemini 3.8 handshake in ${canary.data.handshakeLatencyMs}ms`);

  // 3. Live Firebase Hosting Rewrite Proxy Check
  const hostedSubagents = await axios.get(`${HOSTING_URL}/api/telephony/subagents`);
  assert(hostedSubagents.status === 200 && hostedSubagents.data.subagents?.length === 4, `Firebase Hosting (${HOSTING_URL}/api/telephony/subagents) proxies to v1.8.0 with 4 ADK sub-agents`);

  // 4. Live /twiml Zero-Dead-Air Redirect Check
  const twiml = await axios.post(`https://${CLOUD_RUN_HOST}/twiml`, {
    CallSid: 'CA_TEST_PROD_TWIML_CHECK',
    From: '+18019284434',
    To: '+18398676637'
  });
  assert(twiml.status === 200 && twiml.data.includes('/voice-stream-fallback'), `Production POST /twiml arms Zero-Dead-Air <Redirect> to /voice-stream-fallback`);

  // 5. LIVE PRODUCTION WSS /media-stream HONEY VOICE AUDIO SYNTHESIS PROOF
  let frames = 0;
  let ttfaMs = null;
  let transcriptText = '';
  const t0 = Date.now();

  await new Promise((resolve) => {
    const ws = new WebSocket(`wss://${CLOUD_RUN_HOST}/media-stream`);
    const timer = setTimeout(() => {
      try { ws.close(); } catch (_) {}
      resolve();
    }, 9000);

    ws.on('open', () => {
      ws.send(JSON.stringify({
        event: 'start',
        start: {
          streamSid: 'MZ_PROD_CANARY_TEST',
          callSid: 'CA_PROD_CANARY_TEST',
          customParameters: {
            caller: '+18015550199',
            callSid: 'CA_PROD_CANARY_TEST',
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
        const msg = JSON.parse(raw.toString());
        if (msg.event === 'media' && msg.media?.payload) {
          frames++;
          if (ttfaMs === null) ttfaMs = Date.now() - t0;
          if (frames >= 35) {
            clearTimeout(timer);
            ws.send(JSON.stringify({ event: 'stop' }));
            setTimeout(() => {
              try { ws.close(); } catch (_) {}
              resolve();
            }, 250);
          }
        }
      } catch (_) {}
    });

    ws.on('error', (err) => {
      console.error('  [WS Error]', err.message);
      clearTimeout(timer);
      resolve();
    });
  });

  assert(frames >= 25, `LIVE PRODUCTION Honey (wss://${CLOUD_RUN_HOST}/media-stream) synthesized ${frames} G.711u RTP audio frames (TTFA: ${ttfaMs}ms)!`);

  console.log('==================================================================');
  console.log(` PRODUCTION VERIFICATION: ${passed} / ${total} Passed (${Math.round((passed / total) * 100)}%)`);
  console.log('==================================================================');
  process.exit(passed === total ? 0 : 1);
}

verifyProduction().catch((err) => {
  console.error('Fatal production verification error:', err.message);
  process.exit(1);
});
