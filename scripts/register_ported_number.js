#!/usr/bin/env node
/**
 * ============================================================================
 * RHIVE TELEPHONY - ZERO-DOWNTIME PORTED NUMBER CARRIER SHIELD PROVISIONER
 * ============================================================================
 * Usage:
 *   node scripts/register_ported_number.js +17438876637
 *   node scripts/register_ported_number.js +18398676637 --verify-only
 *
 * Instantly binds any newly ported (or existing) Twilio phone number to:
 *   1. Cloud Run Honey Gemini 3.8 Live Voice Webhooks (/twiml, /status-callback, /incoming-sms)
 *   2. Approved A2P 10DLC Messaging Service (MG9e8bff30d3f2a2807c01157822c3a16d - Campaign CQRSSYM)
 *   3. Approved CNAM TrustProduct (BUaac79dc903c3df8f45cf00d61a376d36 - "RHIVE ROOFING")
 *   4. Approved SHAKEN/STIR TrustProduct (BU96ef4404d77db00764afed35e5067aad - Attestation A)
 * ============================================================================
 */
require('dotenv').config();

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const API_KEY_SID = process.env.TWILIO_API_KEY_SID;
const API_SECRET = process.env.TWILIO_API_SECRET;

const CLOUD_RUN_BASE = 'https://rhive-voice-live-bridge-910835773728.us-central1.run.app';
const MESSAGING_SERVICE_SID = 'MG9e8bff30d3f2a2807c01157822c3a16d';
const CNAM_TRUST_PRODUCT_SID = 'BUaac79dc903c3df8f45cf00d61a376d36';
const SHAKEN_STIR_TRUST_PRODUCT_SID = 'BU96ef4404d77db00764afed35e5067aad';

function getAuthHeader() {
  if (!ACCOUNT_SID || !API_KEY_SID || !API_SECRET) {
    throw new Error('Missing TWILIO_ACCOUNT_SID, TWILIO_API_KEY_SID, or TWILIO_API_SECRET in .env');
  }
  return 'Basic ' + Buffer.from(`${API_KEY_SID}:${API_SECRET}`).toString('base64');
}

async function twilioJson(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: getAuthHeader(),
      ...(options.headers || {})
    }
  });
  const text = await res.text();
  let json = {};
  try { json = JSON.parse(text); } catch (_) { json = { raw: text }; }
  return { status: res.status, ok: res.ok, data: json };
}

async function run() {
  const rawArg = process.argv[2] || '+18398676637';
  const verifyOnly = process.argv.includes('--verify-only');
  const targetE164 = rawArg.startsWith('+') ? rawArg : `+1${rawArg.replace(/\D/g, '').slice(-10)}`;

  console.log(`[Carrier Shield] Inspecting ${targetE164} (verifyOnly=${verifyOnly})...`);

  // 1. Locate IncomingPhoneNumber SID
  const listUrl = `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/IncomingPhoneNumbers.json?PhoneNumber=${encodeURIComponent(targetE164)}`;
  const listRes = await twilioJson(listUrl);
  const phoneObj = (listRes.data.incoming_phone_numbers || [])[0];
  if (!phoneObj) {
    console.error(`[Carrier Shield] Phone number ${targetE164} is not active in Twilio yet (wait for FOC completion).`);
    process.exit(1);
  }
  const phoneSid = phoneObj.sid;
  console.log(`[OK] Found Twilio Phone SID: ${phoneSid} (${phoneObj.friendly_name})`);

  // 2. Check / Update Voice & SMS Webhooks
  if (!verifyOnly) {
    const whBody = new URLSearchParams({
      VoiceUrl: `${CLOUD_RUN_BASE}/twiml`,
      VoiceMethod: 'POST',
      VoiceFallbackUrl: `${CLOUD_RUN_BASE}/twiml`,
      VoiceFallbackMethod: 'POST',
      StatusCallback: `${CLOUD_RUN_BASE}/status-callback`,
      StatusCallbackMethod: 'POST',
      SmsUrl: `${CLOUD_RUN_BASE}/incoming-sms`,
      SmsMethod: 'POST'
    });
    const whRes = await twilioJson(
      `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/IncomingPhoneNumbers/${phoneSid}.json`,
      { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: whBody }
    );
    console.log(`[Webhooks] Updated (${whRes.status}): VoiceUrl=${whRes.data.voice_url}`);
  } else {
    console.log(`[Webhooks] VoiceUrl=${phoneObj.voice_url} | SmsUrl=${phoneObj.sms_url}`);
  }

  // 3. Check / Attach A2P 10DLC Messaging Service
  const msgCheck = await twilioJson(`https://messaging.twilio.com/v1/Services/${MESSAGING_SERVICE_SID}/PhoneNumbers`);
  const inMsgSvc = (msgCheck.data.phone_numbers || []).some(p => p.sid === phoneSid);
  if (inMsgSvc) {
    console.log(`[10DLC] Already bound to Verified Campaign CQRSSYM (${MESSAGING_SERVICE_SID})`);
  } else if (!verifyOnly) {
    const msgAdd = await twilioJson(
      `https://messaging.twilio.com/v1/Services/${MESSAGING_SERVICE_SID}/PhoneNumbers`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ PhoneNumberSid: phoneSid })
      }
    );
    console.log(`[10DLC] Attached (${msgAdd.status}): ${msgAdd.data.sid || JSON.stringify(msgAdd.data)}`);
  } else {
    console.log(`[10DLC] NOT YET BOUND to ${MESSAGING_SERVICE_SID}`);
  }

  // 4. Check / Attach CNAM ("RHIVE ROOFING")
  const cnamCheck = await twilioJson(`https://trusthub.twilio.com/v1/TrustProducts/${CNAM_TRUST_PRODUCT_SID}/ChannelEndpointAssignments`);
  const inCnam = (cnamCheck.data.results || []).some(r => r.channel_endpoint_sid === phoneSid);
  if (inCnam) {
    console.log(`[CNAM] Already bound to "RHIVE ROOFING" (${CNAM_TRUST_PRODUCT_SID})`);
  } else if (!verifyOnly) {
    const cnamAdd = await twilioJson(
      `https://trusthub.twilio.com/v1/TrustProducts/${CNAM_TRUST_PRODUCT_SID}/ChannelEndpointAssignments`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ ChannelEndpointType: 'phone-number', ChannelEndpointSid: phoneSid })
      }
    );
    console.log(`[CNAM] Attached (${cnamAdd.status}): ${cnamAdd.data.sid || JSON.stringify(cnamAdd.data)}`);
  } else {
    console.log(`[CNAM] NOT YET BOUND to ${CNAM_TRUST_PRODUCT_SID}`);
  }

  // 5. Check / Attach SHAKEN/STIR (A-Level Attestation)
  const stirCheck = await twilioJson(`https://trusthub.twilio.com/v1/TrustProducts/${SHAKEN_STIR_TRUST_PRODUCT_SID}/ChannelEndpointAssignments`);
  const inStir = (stirCheck.data.results || []).some(r => r.channel_endpoint_sid === phoneSid);
  if (inStir) {
    console.log(`[SHAKEN/STIR] Already bound to A-Level Attestation (${SHAKEN_STIR_TRUST_PRODUCT_SID})`);
  } else if (!verifyOnly) {
    const stirAdd = await twilioJson(
      `https://trusthub.twilio.com/v1/TrustProducts/${SHAKEN_STIR_TRUST_PRODUCT_SID}/ChannelEndpointAssignments`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ ChannelEndpointType: 'phone-number', ChannelEndpointSid: phoneSid })
      }
    );
    console.log(`[SHAKEN/STIR] Attached (${stirAdd.status}): ${stirAdd.data.sid || JSON.stringify(stirAdd.data)}`);
  } else {
    console.log(`[SHAKEN/STIR] NOT YET BOUND to ${SHAKEN_STIR_TRUST_PRODUCT_SID}`);
  }

  console.log(`[Carrier Shield] Complete for ${targetE164}.`);
}

run().catch(err => {
  console.error('[Carrier Shield Fatal]', err.message);
  process.exit(1);
});
