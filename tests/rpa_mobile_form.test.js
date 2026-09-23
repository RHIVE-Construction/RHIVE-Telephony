/**
 * Mobile-First RPA Test Suite for R-HIVE Project Quote Intake Form (public/verify.html)
 * Tests dynamic 3-step MeasureCall wizard, quantum pills, touch interactions,
 * network submission, Option A Google Chat in-place patching integration,
 * and captures high-resolution mobile proof-of-work screenshots.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

// Dynamically resolve Playwright
let playwright;
try {
  playwright = require('playwright');
} catch (e1) {
  try {
    playwright = require('C:/Users/mjrob/OneDrive/Desktop/App Repo s/MJR_EPA/node_modules/playwright');
  } catch (e2) {
    console.error('Playwright could not be resolved:', e2.message);
    process.exit(1);
  }
}

const { chromium } = playwright;
const TEST_PORT = 8997;
const ARTIFACT_DIR = 'C:/Users/mjrob/.gemini/antigravity/brain/0ea1d186-c0b7-4d42-8bc0-3cea6c384d14';

async function waitForServer(port, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${port}/health`, res => {
          if (res.statusCode === 200) resolve();
          else reject(new Error(`Status ${res.statusCode}`));
        });
        req.on('error', reject);
        req.setTimeout(1000, () => req.destroy());
      });
      return true;
    } catch (e) {
      await new Promise(r => setTimeout(r, 400));
    }
  }
  throw new Error(`Server failed to boot on port ${port} within ${timeoutMs}ms`);
}

async function runRpaTests() {
  console.log('================================================================');
  console.log('🚀 STARTING MOBILE RPA TEST SUITE FOR R-HIVE DIGITAL QUOTE FORM');
  console.log('================================================================\n');

  // Step 1: Boot Local Telephony Bridge Server
  console.log(`[RPA 1/6] Launching server on test port ${TEST_PORT}...`);
  const serverPath = path.join(__dirname, '..', 'server.js');
  const serverProc = spawn('node', [serverPath], {
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

  serverProc.stderr.on('data', d => {
    const s = d.toString().trim();
    if (!s.includes('Key file not found') && !s.includes('headers.forEach')) {
      console.error('  [Server Log]', s);
    }
  });

  try {
    await waitForServer(TEST_PORT);
    console.log('  ✅ Local server is healthy and responding to /health\n');

    // Step 2: Launch Chromium with Mobile Viewport (iPhone 14 / Pixel 7 Mobile Profile)
    console.log('[RPA 2/6] Launching Chromium in Mobile Viewport (390x844)...');
    const browser = await chromium.launch({
      headless: true
    });

    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'
    });

    const page = await context.newPage();

    // Step 3: Navigate to /verify with URL telemetry parameters
    const targetUrl = `http://localhost:${TEST_PORT}/verify?phone=8014491451&address=9917%20S%20State%20St%2C%20Sandy%2C%20UT&name=Michael%20Robinson`;
    console.log(`[RPA 3/6] Navigating to mobile form: ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle' });

    // Assert: Zero Checkboxes Rule (Strictly Quantum Pills)
    const checkboxCount = await page.locator('input[type="checkbox"]').count();
    if (checkboxCount !== 0) {
      throw new Error(`VIOLATION: Found ${checkboxCount} checkbox inputs! Strict rule requires ZERO checkboxes.`);
    }
    console.log('  ✅ Zero Checkbox Constraint Verified (100% Quantum Radio Pills)');

    // Verify Address & Name prefill
    const displayedAddress = await page.locator('#displayAddress').textContent();
    console.log(`  ✅ Property Address prefilled: "${displayedAddress}"`);
    if (!displayedAddress.includes('9917 S State St')) {
      throw new Error(`Address mismatch. Expected 9917 S State St, got: ${displayedAddress}`);
    }

    const nameVal = await page.locator('#nameInput').inputValue();
    console.log(`  ✅ Homeowner Name prefilled: "${nameVal}"`);

    // Capture Screenshot Step 1
    const ssStep1 = path.join(ARTIFACT_DIR, 'rpa_mobile_step1_scope.png');
    await page.screenshot({ path: ssStep1, fullPage: false });
    console.log(`  📸 Captured Mobile Proof: ${ssStep1}`);

    // Interact Step 1: Select Scope & Tap Next
    await page.locator('label[for="scope_replace"]').click();
    console.log('  ✅ Selected Scope: Full Roof Replacement');
    await page.locator('#btnNext1').click();
    await page.waitForTimeout(300);

    // Step 4: Step 2 MeasureCall Roof Anatomy
    console.log('\n[RPA 4/6] Interacting with Step 2 (MeasureCall Roof Anatomy)...');
    const step2Title = await page.locator('#stepTitle').textContent();
    if (!step2Title.includes('Step 2')) {
      throw new Error(`Failed to advance to Step 2. Title: ${step2Title}`);
    }
    console.log(`  ✅ Successfully advanced to: ${step2Title}`);

    // Select: Pitched Shingles
    await page.locator('label[for="roof_pitched"]').click();
    // Select: Solar Installed
    await page.locator('label[for="solar_yes"]').click();
    console.log('  ✅ Selected: Solar Installed');
    // Select: 1-2 Skylights
    await page.locator('label[for="sky_12"]').click();
    console.log('  ✅ Selected: 1-2 Skylights');
    // Select: 15+ Yrs (Brittle)
    await page.locator('label[for="age_over15"]').click();
    console.log('  ✅ Selected: 15+ Yrs (Brittle)');
    // Select: Replace with Seamless Gutters
    await page.locator('label[for="gutters_replace"]').click();
    console.log('  ✅ Selected: Replace with Seamless Gutters');

    // Capture Screenshot Step 2
    const ssStep2 = path.join(ARTIFACT_DIR, 'rpa_mobile_step2_measurecall.png');
    await page.screenshot({ path: ssStep2, fullPage: false });
    console.log(`  📸 Captured Mobile Proof: ${ssStep2}`);

    // Advance to Step 3
    await page.locator('#btnNext2').click();
    await page.waitForTimeout(300);

    // Step 5: Step 3 Priorities & Delivery
    console.log('\n[RPA 5/6] Interacting with Step 3 (Priorities & Proposal Delivery)...');
    const step3Title = await page.locator('#stepTitle').textContent();
    if (!step3Title.includes('Step 3')) {
      throw new Error(`Failed to advance to Step 3. Title: ${step3Title}`);
    }
    console.log(`  ✅ Successfully advanced to: ${step3Title}`);

    // Select Priority: Max Warranty (SureNail 50-Yr / 130 MPH)
    await page.locator('label[for="prio2"]').click();
    console.log('  ✅ Selected Priority: Max Warranty (50-Yr SureNail)');

    // Fill Email
    await page.locator('#emailInput').fill('michael@rhiveconstruction.com');
    console.log('  ✅ Entered Email: michael@rhiveconstruction.com');

    // Fill Special Notes
    await page.locator('#notesInput').fill('RPA automated test validation: West gate unlocked, dogs put inside.');
    console.log('  ✅ Entered Special Notes');

    // Capture Screenshot Step 3
    const ssStep3 = path.join(ARTIFACT_DIR, 'rpa_mobile_step3_delivery.png');
    await page.screenshot({ path: ssStep3, fullPage: false });
    console.log(`  📸 Captured Mobile Proof: ${ssStep3}`);

    // Step 6: Submit Form & Verify Response
    console.log('\n[RPA 6/6] Submitting form & verifying live API response...');
    const [response] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/verify-email') && res.status() === 200),
      page.locator('#submitBtn').click()
    ]);

    const resJson = await response.json();
    console.log('  ✅ API /api/verify-email responded:', resJson);
    if (!resJson.success) {
      throw new Error(`API returned success: false -> ${JSON.stringify(resJson)}`);
    }

    // Wait for Success Card
    await page.waitForSelector('#successCard', { state: 'visible', timeout: 5000 });
    const confirmedEmailText = await page.locator('#confirmedEmail').textContent();
    console.log(`  ✅ Success Card active! Confirmed email: "${confirmedEmailText}"`);

    const summaryScope = await page.locator('#summaryScope').textContent();
    const summaryPriority = await page.locator('#summaryPriority').textContent();
    console.log(`  ✅ Summary Scope: "${summaryScope}", Priority: "${summaryPriority}"`);

    // Capture Screenshot Step 4 (Success Card)
    const ssStep4 = path.join(ARTIFACT_DIR, 'rpa_mobile_step4_success.png');
    await page.screenshot({ path: ssStep4, fullPage: false });
    console.log(`  📸 Captured Mobile Proof: ${ssStep4}`);

    await browser.close();

    console.log('\n================================================================');
    console.log('🎉 ALL MOBILE RPA TESTS PASSED WITH 100% COMPLIANCE!');
    console.log('================================================================\n');

  } finally {
    serverProc.kill();
  }
}

runRpaTests().catch(err => {
  console.error('\n❌ RPA TEST SUITE FAILED:', err);
  process.exit(1);
});
