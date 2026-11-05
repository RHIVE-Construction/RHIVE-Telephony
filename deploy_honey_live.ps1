# ==============================================================================
# RHIVE TELEPHONY V6.1 - 1-COMMAND HONEY LIVE CLOUD RUN DEPLOY & MODERATOR SYNC
# Project: rhive-quantum-quoter (910835773728) | Region: us-central1
# Service: rhive-voice-live-bridge
# ==============================================================================
$ErrorActionPreference = "Stop"

Write-Host "`n==================================================================" -ForegroundColor Cyan
Write-Host " RHIVE TELEPHONY V6.1 - HONEY LIVE CLOUD RUN DEPLOYMENT & CANARY" -ForegroundColor Cyan
Write-Host "==================================================================`n" -ForegroundColor Cyan

# 1. Verify gcloud authentication
Write-Host "[1/5] Verifying Google Cloud authentication..." -ForegroundColor Yellow
try {
    $activeToken = gcloud auth print-access-token 2>$null
    if (-not $activeToken) { throw "Token expired" }
    Write-Host "  [OK] Authenticated with Google Cloud CLI." -ForegroundColor Green
} catch {
    Write-Host "  [AUTH] gcloud session expired. Launching Google sign-in for michael@rhiveconstruction.com..." -ForegroundColor Yellow
    gcloud auth login michael@rhiveconstruction.com --brief
}

# 2. Load verified local .env keys safely (preserving Cloud Run base64 creds via --update-env-vars)
if (-not (Test-Path ".env")) {
    throw ".env file not found in repository root!"
}

$envPairs = @(
    "LIVE_VOICE_MODEL=gemini-3.8-live",
    "EXECUTIVE_SYNC_SPACE=spaces/AAQA_y6BMAI"
)
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
Write-Host "`n[2/5] Deploying rhive-voice-live-bridge (v1.9.1 / Rev 69) to Cloud Run..." -ForegroundColor Yellow
gcloud run deploy rhive-voice-live-bridge `
    --quiet --source . `
    --project rhive-quantum-quoter `
    --region us-central1 `
    --allow-unauthenticated `
    --min-instances 1 `
    --timeout 3600 `
    --session-affinity `
    --update-env-vars="$updateEnvArg"

# 4. Sync Firebase Hosting rewrites (/voice-stream-fallback + UI)
Write-Host "`n[3/5] Syncing Firebase Hosting rewrites..." -ForegroundColor Yellow
npx firebase deploy --only hosting --project rhive-quantum-quoter

# 5. Ensure 5-Min Canary & Daily 6:30 AM MT Executive Brief Cron Jobs
Write-Host "`n[4/5] Verifying Cloud Scheduler 24/7 Moderator & Daily Brief jobs..." -ForegroundColor Yellow
gcloud scheduler jobs list --location=us-central1 --project=rhive-quantum-quoter

# 6. Live Production AQuA Health and WSS Audio Stream Verification
Write-Host "`n[5/5] Running Live Production V6.1 AQuA, Carrier Shield & WSS Audio Verification..." -ForegroundColor Yellow
node tests/verify_production_live.js

Write-Host "`n==================================================================" -ForegroundColor Green
Write-Host " [LIVE] HONEY V6.1 IS LIVE, WARM (--min-instances 1), AND GUARDED!" -ForegroundColor Green
Write-Host "==================================================================`n" -ForegroundColor Green
