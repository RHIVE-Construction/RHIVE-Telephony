#!/usr/bin/env node
/**
 * ============================================================================
 * RHIVE TELEPHONY V6.2 - AQuA + GOLDFISH ADVERSARIAL & LIVE ACOUSTIC SUITE
 * ============================================================================
 * Validates:
 *   1. 1:1 Parity between `tests/aqua_invariants.json` and `AQUA_MUST_INVARIANTS` (13/13)
 *   2. 5 Synthetic Adversarial Caller Personas evaluated via 13-Invariant + Goldfish Judge
 *   3. Live Twilio Carrier Webhook & Messaging Service Zero-Drop Verification
 *   4. Live Production Cloud Run `wss://.../media-stream` G.711u RTP -> 8kHz PCM WAV
 *      Multimodal Acoustic Audit via fresh `gemini-3.8-flash` audio listener proving
 *      "R-hive's AI Roof Specialist" (/ˈɑɹˌhaɪvz/, NEVER "rive").
 * ============================================================================
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { WebSocket } = require('ws');
const { GoogleGenAI } = require('@google/genai');
const {
  AQUA_MUST_INVARIANTS,
  evaluateTrajectoryAgainst13Invariants
} = require('../services/aquaGoldfishLoop');

const CLOUD_RUN_HOST = 'rhive-voice-live-bridge-910835773728.us-central1.run.app';
const CLOUD_RUN_BASE = `https://${CLOUD_RUN_HOST}`;

/**
 * ITU-T G.711 mu-law byte -> signed 16-bit PCM sample
 */
function decodeMuLawSample(uVal) {
  let u = (~uVal) & 0xff;
  const sign = u & 0x80;
  const exponent = (u >> 4) & 0x07;
  const mantissa = u & 0x0f;
  let sample = ((mantissa << 3) + 0x84) << exponent;
  sample -= 0x84;
  return sign ? -sample : sample;
}

/**
 * Build standard 44-byte RIFF WAV container for 8000 Hz mono 16-bit PCM
 */
function muLawBufferToWav(muLawBuf) {
  const numSamples = muLawBuf.length;
  const pcmDataSize = numSamples * 2;
  const wav = Buffer.alloc(44 + pcmDataSize);

  wav.write('RIFF', 0);
  wav.writeUInt32LE(36 + pcmDataSize, 4);
  wav.write('WAVE', 8);
  wav.write('fmt ', 12);
  wav.writeUInt32LE(16, 16);      // PCM chunk size
  wav.writeUInt16LE(1, 20);       // AudioFormat = 1 (PCM)
  wav.writeUInt16LE(1, 22);       // NumChannels = 1 (Mono)
  wav.writeUInt32LE(8000, 24);    // SampleRate = 8000 Hz
  wav.writeUInt32LE(16000, 28);   // ByteRate = 8000 * 1 * 2
  wav.writeUInt16LE(2, 32);       // BlockAlign = 2
  wav.writeUInt16LE(16, 34);      // BitsPerSample = 16
  wav.write('data', 36);
  wav.writeUInt32LE(pcmDataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const pcm = decodeMuLawSample(muLawBuf[i]);
    wav.writeInt16LE(pcm, 44 + i * 2);
  }
  return wav;
}

async function runSuite() {
  let passed = 0;
  let total = 0;

  function assert(cond, msg) {
    total++;
    if (cond) {
      passed++;
      console.log(`  ✅ [PASS] ${msg}`);
    } else {
      console.error(`  ❌ [FAIL] ${msg}`);
    }
  }

  console.log('====================================================================');
  console.log(' RHIVE V6.2 AQuA + GOLDFISH ADVERSARIAL & LIVE ACOUSTIC SUITE');
  console.log('====================================================================');

  // 1. Canonical JSON Ledger Parity
  const ledgerPath = path.join(__dirname, 'aqua_invariants.json');
  const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
  assert(
    Array.isArray(ledger.invariants) && ledger.invariants.length === 13 && AQUA_MUST_INVARIANTS.length === 13,
    'tests/aqua_invariants.json defines all 13 Binary Must-Invariants (I-01 through I-13)'
  );
  const allIdsMatch = ledger.invariants.every((item, idx) => item.id === AQUA_MUST_INVARIANTS[idx].id && item.mustRule === AQUA_MUST_INVARIANTS[idx].mustRule);
  assert(allIdsMatch, 'tests/aqua_invariants.json rules match services/aquaGoldfishLoop.js 1:1');

  const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

  // 2. Synthetic Persona 1: Clean Arthur Residential (100% Quality Index)
  const cleanRes = await evaluateTrajectoryAgainst13Invariants({
    aiClient: null, // deterministic fast-path check first
    callSid: 'CA_AQUA_SYNTH_CLEAN',
    callerPhone: '+18015550101',
    honeyAudioChunksSent: 120,
    firstAudioLatencyMs: 620,
    durationSec: 45,
    turns: [
      { role: 'assistant', text: "Hi! This is Honey! R-hive's AI Roof Specialist, how may I assist your call today?" },
      { role: 'user', text: 'Hi, my name is Arthur and I need a roof replacement quote.' },
      { role: 'assistant', text: 'Is Arthur spelled A-R-T-H-U-R?' },
      { role: 'user', text: 'Yes, at 9917 South 2480 East in Sandy.' },
      { role: 'assistant', text: 'Just to confirm, is that nine, nine, one, seven South, two, four, eight, zero East in Sandy?' }
    ]
  });
  assert(cleanRes.qualityScorePct === 100 && cleanRes.anomalies.length === 0, `Persona 1 (Clean Arthur Residential) passes 13/13 invariants (Score: ${cleanRes.qualityScorePct}%)`);

  // 3. Synthetic Persona 2: Pre-1972 Slat-Deck $78 Price Leak Trap
  const slatTrap = await evaluateTrajectoryAgainst13Invariants({
    aiClient: ai,
    callSid: 'CA_AQUA_SYNTH_SLAT',
    callerPhone: '+18015550102',
    honeyAudioChunksSent: 80,
    durationSec: 38,
    turns: [
      { role: 'user', text: 'My house in Sugar House was built in 1958, what if it has slat boards?' },
      { role: 'assistant', text: 'If your 1958 home needs OSB sheathing over slat boards, it costs $78 per sheet.' }
    ]
  });
  assert(slatTrap.anomalies.some(v => v.invariantId === 'I-05'), 'Persona 2 (Pre-1972 Slat-Deck Trap) catches spoken "$78 per sheet" violation (I-05)');

  // 4. Synthetic Persona 3: Unsolicited Executive Name-Drop + Grouped Grid Readback Trap
  const gridExecTrap = await evaluateTrajectoryAgainst13Invariants({
    aiClient: ai,
    callSid: 'CA_AQUA_SYNTH_GRID_EXEC',
    callerPhone: '+18015550103',
    honeyAudioChunksSent: 75,
    durationSec: 32,
    turns: [
      { role: 'user', text: 'My address is 11400 South State Street.' },
      { role: 'assistant', text: 'Got it at eleven thousand four hundred South State, and Michael will review your file today.' }
    ]
  });
  assert(
    gridExecTrap.anomalies.some(v => v.invariantId === 'I-02') && gridExecTrap.anomalies.some(v => v.invariantId === 'I-11'),
    'Persona 3 catches grouped Utah Grid readback (I-02) & unsolicited executive name-drop (I-11)'
  );

  // 5. Synthetic Persona 4: Caller-Solicited Kara Transfer (Zero False Positive)
  const karaClean = await evaluateTrajectoryAgainst13Invariants({
    aiClient: ai,
    callSid: 'CA_AQUA_SYNTH_KARA_OK',
    callerPhone: '+18015550104',
    honeyAudioChunksSent: 60,
    durationSec: 22,
    isTransfer: true,
    turns: [
      { role: 'user', text: 'Hi, this is Tom from Beacon Supply, can I speak with Kara regarding an invoice?' },
      { role: 'assistant', text: 'Let me connect you with Kara right now.' }
    ]
  });
  assert(!karaClean.anomalies.some(v => v.invariantId === 'I-11'), 'Persona 4 allows executive name when caller explicitly requests Kara (0 false positives)');

  // 6. Synthetic Persona 5: Phonetic "Rive's" / "AI Roofing Specialist" / "happy to help" Drift Trap
  const phoneticTrap = await evaluateTrajectoryAgainst13Invariants({
    aiClient: ai,
    callSid: 'CA_AQUA_SYNTH_PHONETIC',
    callerPhone: '+18015550105',
    honeyAudioChunksSent: 45,
    durationSec: 18,
    turns: [
      { role: 'assistant', text: "Hi! This is Honey, Rive's AI Roofing Specialist, I am so happy to help today!" }
    ]
  });
  assert(phoneticTrap.anomalies.some(v => v.invariantId === 'I-13'), 'Persona 5 catches phonetic "Rive\'s" / "AI Roofing Specialist" / filler drift (I-13)');

  // 7. Live Twilio Carrier Webhook & Messaging Service Verification (+18017833317 & +18398676637)
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_API_KEY_SID && process.env.TWILIO_API_SECRET) {
    const auth = 'Basic ' + Buffer.from(`${process.env.TWILIO_API_KEY_SID}:${process.env.TWILIO_API_SECRET}`).toString('base64');
    for (const [sid, label] of [
      ['PNa11d967da2d1c199b7e9682ac273224c', '+18017833317'],
      ['PN0e8090bedadaf8bbfbe507a3bfdb4f27', '+18398676637']
    ]) {
      const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/IncomingPhoneNumbers/${sid}.json`, {
        headers: { Authorization: auth }
      });
      const d = await r.json();
      const ok =
        d.voice_url === `${CLOUD_RUN_BASE}/twiml` &&
        d.voice_fallback_url === `${CLOUD_RUN_BASE}/voice-stream-fallback` &&
        d.sms_url === `${CLOUD_RUN_BASE}/incoming-sms` &&
        d.status_callback === `${CLOUD_RUN_BASE}/status-callback`;
      assert(ok, `Live Twilio ${label} (${sid}) has zero-drop Voice, VoiceFallback, SMS & StatusCallback webhooks`);
    }
  }

  // 8. LIVE PRODUCTION CLOUD RUN G.711u RTP WAVEFORM -> WAV ACOUSTIC PHONETIC PROOF
  const muLawChunks = [];
  let ttfaMs = null;
  const t0 = Date.now();

  await new Promise((resolve) => {
    const ws = new WebSocket(`wss://${CLOUD_RUN_HOST}/media-stream`);
    let lastFrameAt = 0;
    let pollTimer = null;
    const hardTimeout = setTimeout(() => {
      if (pollTimer) clearInterval(pollTimer);
      try { ws.close(); } catch (_) {}
      resolve();
    }, 11000);

    ws.on('open', () => {
      ws.send(JSON.stringify({
        event: 'start',
        start: {
          streamSid: 'MZ_AQUA_ACOUSTIC_AUDIT',
          callSid: 'CA_AQUA_ACOUSTIC_AUDIT',
          customParameters: {
            caller: '+18015550188',
            callSid: 'CA_AQUA_ACOUSTIC_AUDIT',
            agentType: 'intake',
            selection: 'direct_switchboard',
            selectionLabel: 'direct executive switchboard',
            ambient: 'none'
          }
        }
      }));

      // Wait until full greeting finishes streaming (~900ms silence after >= 60 frames)
      pollTimer = setInterval(() => {
        if (muLawChunks.length >= 60 && lastFrameAt > 0 && Date.now() - lastFrameAt >= 900) {
          clearInterval(pollTimer);
          clearTimeout(hardTimeout);
          try { ws.send(JSON.stringify({ event: 'stop' })); } catch (_) {}
          setTimeout(() => {
            try { ws.close(); } catch (_) {}
            resolve();
          }, 200);
        }
      }, 150);
    });

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.event === 'media' && msg.media?.payload) {
          if (ttfaMs === null) ttfaMs = Date.now() - t0;
          lastFrameAt = Date.now();
          muLawChunks.push(Buffer.from(msg.media.payload, 'base64'));
        }
      } catch (_) {}
    });

    ws.on('error', () => {
      if (pollTimer) clearInterval(pollTimer);
      clearTimeout(hardTimeout);
      resolve();
    });
  });

  const combinedMuLaw = Buffer.concat(muLawChunks);
  const durationAudioSec = (combinedMuLaw.length / 8000).toFixed(2);
  assert(
    muLawChunks.length >= 60,
    `Captured full live Cloud Run opening greeting RTP stream (${muLawChunks.length} frames, ${durationAudioSec}s audio, TTFA: ${ttfaMs}ms)`
  );

  if (ai && combinedMuLaw.length > 4000) {
    const wavBuf = muLawBufferToWav(combinedMuLaw);
    const auditRes = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          inlineData: {
            mimeType: 'audio/wav',
            data: wavBuf.toString('base64')
          }
        },
        {
          text: `Listen carefully to this 8kHz telephony greeting spoken by Honey.
Return strict JSON only:
{
  "verbatimTranscript": "exact words heard",
  "pronouncedRLetterClearly": true or false (true if the speaker pronounces the letter R before hive like "R-hive's" / "Are-hive's", false if pronounced like "rive's" rhyming with five without the initial "ar" syllable),
  "heardAiRoofSpecialist": true or false
}`
        }
      ],
      config: { responseMimeType: 'application/json', temperature: 0 }
    });
    const parsed = JSON.parse(auditRes.text || '{}');
    assert(
      parsed.pronouncedRLetterClearly === true && parsed.heardAiRoofSpecialist === true,
      `Multimodal WAV Acoustic Listener verified crisp "R-hive's" (/ɑɹ haɪvz/) & "AI Roof Specialist": "${parsed.verbatimTranscript}"`
    );
  }

  console.log('====================================================================');
  console.log(` AQuA + GOLDFISH SUITE COMPLETE: ${passed} / ${total} Passed (${Math.round((passed / total) * 100)}%)`);
  console.log('====================================================================');
  await new Promise(r => setTimeout(r, 250));
  process.exitCode = passed === total ? 0 : 1;
}

runSuite().catch((err) => {
  console.error('[AQuA Suite Fatal]', err);
  process.exit(1);
});
