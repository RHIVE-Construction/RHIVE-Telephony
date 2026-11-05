/**
 * RHIVE Telephony V6.0 - Live Production Cloud Run, Carrier Shield & WSS Honey Audio Verifier
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
  console.log(' RHIVE V6.0 LIVE PRODUCTION CLOUD RUN & WSS AUDIO VERIFICATION');
  console.log('==================================================================');

  // 1. Live Cloud Run /health (v1.9.2 / Rev 70)
  const health = await axios.get(`https://${CLOUD_RUN_HOST}/health`);
  assert(
    health.status === 200 && health.data.version === '1.9.2' && health.data.revision === 'Rev 70' && health.data.spokenBrandPhonetic === 'R-hive (/ˈɑɹˌhaɪv/)' && health.data.agentTitle === 'AI Roof Specialist',
    `Cloud Run /health reports version: ${health.data.version} (${health.data.revision}, Spoken Brand: ${health.data.spokenBrandPhonetic}, Title: ${health.data.agentTitle})`
  );
  assert(
    health.data.zeroDeadAirFallback === true && health.data.geminiKeyConfigured === true,
    `Cloud Run /health confirms geminiKeyConfigured=true & zeroDeadAirFallback=true`
  );

  // 2. Live AQuA 13-Invariant Health + 24/7 Moderator + Live Canary
  const aquaHealth = await axios.get(`https://${CLOUD_RUN_HOST}/api/telephony/aqua-health`);
  assert(
    aquaHealth.status === 200 && aquaHealth.data.agentStatus === 'ANSWERING_READY' && aquaHealth.data.invariantsCount === 13 && aquaHealth.data.executiveSyncSpace === 'spaces/AAQA_y6BMAI',
    `GET /api/telephony/aqua-health verifies 13 Must Invariants & Executive Sync Moderator (${aquaHealth.data.executiveSyncSpace})`
  );

  const canary = await axios.post(`https://${CLOUD_RUN_HOST}/api/telephony/aqua-canary`, { testMode: true });
  assert(
    canary.status === 200 && canary.data.canaryStatus === 'LIVE_VOICE_VERIFIED',
    `POST /api/telephony/aqua-canary verified live Gemini 3.8 handshake in ${canary.data.handshakeLatencyMs}ms`
  );

  // 3. Live Daily Brief Preview + Google Drive `/Audits` Ledger + Carrier Shield Status
  const briefRes = await axios.post(`https://${CLOUD_RUN_HOST}/api/telephony/aqua-daily-brief`, { dispatchChat: false, archiveDrive: true });
  assert(
    briefRes.status === 200 && briefRes.data.success === true && briefRes.data.executiveSyncSpace === 'spaces/AAQA_y6BMAI' && briefRes.data.driveAuditLedger?.archived === true,
    `POST /api/telephony/aqua-daily-brief generates Executive Sync report (${briefRes.data.brief?.avgQualityPct}%) & archives ${briefRes.data.driveAuditLedger?.name} to Google Drive /Audits (${briefRes.data.driveAuditLedger?.id})`
  );

  const shieldRes = await axios.get(`https://${CLOUD_RUN_HOST}/api/telephony/carrier-shield`);
  assert(
    shieldRes.status === 200 && shieldRes.data.cnam?.displayName === 'RHIVE ROOFING' && shieldRes.data.shakenStir?.attestationLevel === 'A' && shieldRes.data.a2p10Dlc?.campaignStatus === 'VERIFIED',
    `GET /api/telephony/carrier-shield confirms CNAM ("RHIVE ROOFING"), SHAKEN/STIR ("A"), and 10DLC ("VERIFIED")`
  );

  // 4. Live Phonetic Normalization ("R-hive's AI Roof Specialist" -> "R-HIVE's AI Roof Specialist") & Active AQuA Clusters
  const lexRes = await axios.post(`${HOSTING_URL}/api/workspace/lexicon-normalize`, {
    text: "Hi! This is Honey! R-hive's AI Roof Specialist, how may I assist your call today?"
  });
  assert(
    lexRes.status === 200 && lexRes.data.normalized.includes("R-HIVE's AI Roof Specialist"),
    `Firebase Hosting lexicon proxy normalizes spoken "R-hive's AI Roof Specialist" -> "${lexRes.data.normalized}"`
  );

  const clustersRes = await axios.get(`https://${CLOUD_RUN_HOST}/api/telephony/aqua-clusters`);
  assert(
    clustersRes.status === 200 && Array.isArray(clustersRes.data.clusters) && clustersRes.data.clusters.length === 6 && clustersRes.data.sotaVoiceOptimizations?.languageCode === 'en-US',
    `GET /api/telephony/aqua-clusters returns 6 live semantic clusters & en-US SOTA voice telemetry`
  );

  // 5. Live /twiml Zero-Dead-Air Redirect Check
  const twiml = await axios.post(`https://${CLOUD_RUN_HOST}/twiml`, {
    CallSid: 'CA_TEST_PROD_TWIML_CHECK',
    From: '+18019284434',
    To: '+18398676637'
  });
  assert(
    twiml.status === 200 && twiml.data.includes('/voice-stream-fallback'),
    `Production POST /twiml arms Zero-Dead-Air <Redirect> to /voice-stream-fallback`
  );

  // 6. LIVE PRODUCTION WSS /media-stream HONEY VOICE AUDIO SYNTHESIS PROOF
  let frames = 0;
  let ttfaMs = null;
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
