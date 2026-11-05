# JustCall -> Twilio Zero-Downtime Canary Port Execution Kit (`+17438876637`)

## 1. Selected Non-Critical Canary Line (Verified via Live JustCall v2.1 API)
- **Phone Number**: `+17438876637` (`(743) 887-6637`)
- **JustCall Phone ID**: `164045`
- **Friendly Label**: `Hunni Emergency` (`Local`, `US`, `Available`)
- **Why This Line First**: Proves end-to-end carrier porting, FOC cutover, A2P 10DLC (`CQRSSYM`), CNAM (`RHIVE ROOFING`), and STIR/SHAKEN (`Attestation A`) with **zero risk** to Main Office (`+14354176637`), Michael Mobile (`+18014491451`), or Kara Mobile (`+18014410024`).

---

## 2. Day 0 Copy-Paste Email to JustCall Support (`help@justcall.io`)
- **To**: `help@justcall.io`
- **Subject**: `Port-Out CSR, Account Number & PIN Request — +17438876637 (JustCall ID: 164045)`
- **Body**:

```text
Hi JustCall Porting & Carrier Team,

Please provide the Customer Service Record (CSR), underlying Carrier Account Number, Port-Out PIN, and registered Service Address on file to port out the following single number from our RHIVE Construction workspace:

- Phone Number: +1-743-887-6637 (JustCall Number ID: 164045, Label: "Hunni Emergency")

IMPORTANT: Please keep +1-743-887-6637 active in our JustCall account until the gaining carrier (Twilio) completes Firm Order Commitment (FOC) cutover, and do NOT modify or release any of our other 5 active JustCall numbers.

Thank you,
Michael Robinson
R-HIVE Construction LLC
michael@rhiveconstruction.com
```

---

## 3. Day 1 Twilio Console Port-In Submission (`Phone Numbers -> Port & Host -> Port in`)
Submit the CSR values returned by JustCall alongside RHIVE's pre-approved Twilio TrustHub Business Profile:
- **Target Number**: `+17438876637`
- **Approved Customer Profile SID**: `BU536e42c36bc0cb09c3e1fe4698ae5b86` (`R-HIVE Construction LLC`)
- **Authorized Signer**: `Michael Robinson` (`michael@rhiveconstruction.com`)
- **Losing Carrier**: Underlying carrier listed on JustCall CSR (typically Twilio/Bandwidth/Sinch wholesale)

---

## 4. FOC Day (< 60 Seconds): Single-Command Carrier Shield & Honey Cutover
The moment Twilio emails FOC completion (typically **5–7 business days** for clean single-DID local ports), run this single command from `RHIVE-Telephony`:

```powershell
node scripts/register_ported_number.js +17438876637
```

### What `register_ported_number.js` Binds Automatically (`< 5s`, Zero Approval Wait)
1. **Honey `gemini-3.8-live` Voice & Zero-Dead-Air Fallback**:
   - `VoiceUrl` -> `https://rhive-voice-live-bridge-910835773728.us-central1.run.app/twiml`
   - `VoiceFallbackUrl` -> `https://rhive-voice-live-bridge-910835773728.us-central1.run.app/voice-stream-fallback`
   - `StatusCallback` -> `https://rhive-voice-live-bridge-910835773728.us-central1.run.app/status-callback`
2. **Inbound & Outbound SMS + Verified A2P 10DLC**:
   - `SmsUrl` & `SmsFallbackUrl` -> `https://rhive-voice-live-bridge-910835773728.us-central1.run.app/incoming-sms`
   - Attaches `PhoneNumberSid` to Messaging Service `MG9e8bff30d3f2a2807c01157822c3a16d` (Verified Campaign `CQRSSYM`, Brand `BN628914fd080cadd8f61036d804b9c030`).
3. **Outbound CNAM (`RHIVE ROOFING`)**:
   - Assigns `ChannelEndpointAssignments` on approved TrustProduct `BUaac79dc903c3df8f45cf00d61a376d36` (propagates across Neustar / First Orion / TNS / Transaction Network Services within **24–48 hours** post-FOC).
4. **STIR/SHAKEN A-Level Attestation**:
   - Assigns `ChannelEndpointAssignments` on approved TrustProduct `BU96ef4404d77db00764afed35e5067aad` (`Attestation A` active immediately).

Verify post-FOC binding anytime with:
```powershell
node scripts/register_ported_number.js +17438876637 --verify-only
```
