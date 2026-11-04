# ==============================================================================
# RHIVE TELEPHONY V5.0 - 1-COMMAND HONEY LIVE CLOUD RUN RESTORE & AUDIO VERIFIER
# Project: rhive-quantum-quoter (910835773728) | Region: us-central1
# Service: rhive-voice-live-bridge
# ==============================================================================
$ErrorActionPreference = "Stop"

Write-Host "`n==================================================================" -ForegroundColor Cyan
Write-Host " RHIVE TELEPHONY V5.0 - HONEY LIVE CLOUD RUN DEPLOYMENT & CANARY" -ForegroundColor Cyan
Write-Host "==================================================================`n" -ForegroundColor Cyan

# 1. Verify gcloud authentication
Write-Host "[1/4] Verifying Google Cloud authentication..." -ForegroundColor Yellow
try {
    $activeToken = gcloud auth print-access-token 2>$null
    if (-not $activeToken) { throw "Token expired" }
    Write-Host "  ✅ Authenticated with Google Cloud CLI." -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  gcloud session expired. Launching interactive login..." -ForegroundColor Yellow
    gcloud auth login
}

# 2. Load verified local .env keys safely (preserving any extra Cloud Run vars via ^@^ delimiter)
if (-not (Test-Path ".env")) {
    throw ".env file not found in repository root!"
}

$envPairs = @("LIVE_VOICE_MODEL=gemini-3.8-live")
$syncKeys = @(
    "PROJECT_ID",
    "GEMINI_API_KEY",
    "TWILIO_ACCOUNT_SID",
    "TWILIO_API_KEY_SID",
    "TWILIO_API_SECRET",
    "MICHAEL_CELL",
    "KARA_CELL",
    "TWILIO_PHONE_NUMBER",
    "JUSTCALL_API_KEY",
    "JUSTCALL_API_SECRET",
    "GOOGLE_CHAT_WEBHOOK_URL",
    "TWILIO_TWIML_APP_SID"
)

Get-Content ".env" | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
        $idx = $line.IndexOf("=")
        $k = $line.Substring(0, $idx).Trim()
        $v = $line.Substring($idx + 1).Trim().Trim('"').Trim("'")
        if ($syncKeys -contains $k -and $v) {
            $envPairs += "$k=$v"
        }
    }
}

$updateEnvArg = "^@^" + ($envPairs -join "@")

# 3. Deploy Cloud Run with --min-instances 1 (0ms cold start), --timeout 3600 & --session-affinity
Write-Host "`n[2/4] Deploying rhive-voice-live-bridge (Rev 67 / v1.7.0) to Cloud Run..." -ForegroundColor Yellow
gcloud run deploy rhive-voice-live-bridge `
    --source . `
    --project rhive-quantum-quoter `
    --region us-central1 `
    --allow-unauthenticated `
    --min-instances 1 `
    --timeout 3600 `
    --session-affinity `
    --update-env-vars="$updateEnvArg"

# 4. Sync Firebase Hosting rewrites (/voice-stream-fallback + UI)
Write-Host "`n[3/4] Syncing Firebase Hosting rewrites..." -ForegroundColor Yellow
npx firebase deploy --only hosting --project rhive-quantum-quoter

# 5. Live Production AQuA Canary & Honey RTP Audio Frame Proof
Write-Host "`n[4/4] Running Live Production AQuA Health & WSS Audio Stream Verification..." -ForegroundColor Yellow
node -e '
const axios = require("axios");
const { WebSocket } = require("ws");
(async () => {
  const host = "rhive-voice-live-bridge-910835773728.us-central1.run.app";
  const health = await axios.get("https://" + host + "/api/telephony/aqua-health");
  console.log("  ✅ Production AQuA Status:", health.data.agentStatus, "| Persona:", health.data.voicePersona, "| Model:", health.data.voiceModel);

  let frames = 0;
  let ttfa = null;
  const t0 = Date.now();
  await new Promise((resolve) => {
    const ws = new WebSocket("wss://" + host + "/media-stream");
    const timer = setTimeout(() => { try { ws.close(); } catch {} resolve(); }, 8500);
    ws.on("open", () => {
      ws.send(JSON.stringify({
        event: "start",
        start: {
          streamSid: "MZ_PROD_CANARY_TEST",
          callSid: "CA_PROD_CANARY_TEST",
          customParameters: { caller: "+18015550199", callSid: "CA_PROD_CANARY_TEST", agentType: "intake", ambient: "none" }
        }
      }));
    });
    ws.on("message", (raw) => {
      const msg = JSON.parse(raw.toString());
      if (msg.event === "media" && msg.media?.payload) {
        frames++;
        if (ttfa === null) ttfa = Date.now() - t0;
        if (frames >= 25) {
          clearTimeout(timer);
          ws.send(JSON.stringify({ event: "stop" }));
          setTimeout(() => { try { ws.close(); } catch {} resolve(); }, 200);
        }
      }
    });
    ws.on("error", () => { clearTimeout(timer); resolve(); });
  });

  if (frames < 15) {
    console.error("  ❌ Production Honey stream returned insufficient audio frames:", frames);
    process.exit(1);
  }
  console.log("  ✅ LIVE HONEY VERIFIED ANSWERING: Synthesized", frames, "G.711u RTP audio frames (TTFA:", ttfa + "ms)!");
})();
'

Write-Host "`n==================================================================" -ForegroundColor Green
Write-Host " 🎉 HONEY IS LIVE, WARM (--min-instances 1), AND ANSWERING CALLS!" -ForegroundColor Green
Write-Host "==================================================================`n" -ForegroundColor Green
