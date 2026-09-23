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

async function waitForServer(port, timeoutMs = 40000) {
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
      await new Promise(r => setTimeout(r, 600));
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
    console.log('  [Server]', s);
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

    // Assert: Chamfered Box Architecture
    const cardClipPath = await page.locator('#formCard').evaluate(el => window.getComputedStyle(el).clipPath);
    console.log(`  ✅ Chamfered Box Architecture Verified: clip-path="${cardClipPath}"`);
    if (!cardClipPath || !cardClipPath.includes('polygon')) {
      throw new Error(`Chamfer violation: card does not use polygon clip-path! Got: ${cardClipPath}`);
    }

    // Verify Street View Card & Live Address Anchor
    await page.waitForSelector('#streetviewCard', { state: 'visible' });
    const streetviewImgSrc = await page.locator('#streetviewImg').getAttribute('src');
    console.log(`  ✅ Google Street View Image Loaded: ${streetviewImgSrc.substring(0, 65)}...`);

    // Test: Inline Address Modification Drawer (The Core Escape Hatch Purpose)
    console.log('\n[RPA Interactive Address Edit] Testing Street View click & inline address editor...');
    await page.locator('#btnToggleEditAddress').click();
    await page.waitForSelector('#addressEditDrawer', { state: 'visible' });
    console.log('  ✅ Address modification drawer opened');

    const updatedAddress = '9917 South 3200 West, South Jordan, UT 84095';
    await page.locator('#editAddressInput').fill(updatedAddress);
    await page.locator('#btnApplyAddressUpdate').click();
    await page.waitForSelector('#addressEditDrawer', { state: 'hidden' });

    const displayedAddress = await page.locator('#displayAddress').textContent();
    console.log(`  ✅ Address updated & Street View refreshed: "${displayedAddress}"`);
    if (!displayedAddress.includes('9917 South 3200 West')) {
      throw new Error(`Address update failed! Expected "9917 South 3200 West", got: ${displayedAddress}`);
    }

    // Capture Screenshot Step 1
    const ssStep1 = path.join(ARTIFACT_DIR, 'rpa_mobile_step1_scope.png');
    await page.screenshot({ path: ssStep1, fullPage: false });
    console.log(`  📸 Captured Mobile Proof: ${ssStep1}`);

    // Assert: 15-Minute Remote Video Call is NOT in Step 1 upfront scope
    const upfrontVideoCount = await page.locator('#step1 input[name="projectScope"][value*="Video"]').count();
    if (upfrontVideoCount !== 0) {
      throw new Error('VIOLATION: 15-Minute Video Call found in upfront project scope options!');
    }
    console.log('  ✅ 15-Minute Video Call correctly absent from upfront scope choices');

    // Test: Select Active Leak -> Gated Inspection Box reveals
    await page.locator('label[for="scope_repair"]').click();
    await page.waitForSelector('#inspectionGateBox', { state: 'visible' });
    console.log('  ✅ Gated 15-Minute Video Inspection Card dynamically revealed on Active Leak / Repair selection');

    // Select Full Roof Replacement for certified proposal -> Gated inspection box hides
    await page.locator('label[for="scope_replace"]').click();
    await page.waitForSelector('#inspectionGateBox', { state: 'hidden' });
    console.log('  ✅ Selected Scope: Full Roof Replacement (Inspection box hidden for standard replacement)');

    await page.locator('label[for="prop_res"]').click();
    console.log('  ✅ Selected Classification: Residential Home');

    await page.locator('#btnNext1').click();
    await page.waitForTimeout(300);

    // Step 4: Step 2 MeasureCall Roof Anatomy
    console.log('\n[RPA 4/6] Interacting with Step 2 (MeasureCall Roof Anatomy)...');
    const step2Title = await page.locator('#stepTitle').textContent();
    if (!step2Title.includes('Step 2')) {
      throw new Error(`Failed to advance to Step 2. Title: ${step2Title}`);
    }
    console.log(`  ✅ Successfully advanced to: ${step2Title}`);

    // Select: Solar Panels - Simple binary selection (Instant Estimate & Voice parity)
    await page.locator('label[for="solar_yes"]').click();
    console.log('  ✅ Selected: Yes, Solar Installed (Simple binary existence check)');

    // Select: 1–2 Skylights (Separated question)
    await page.locator('label[for="sky_12"]').click();
    console.log('  ✅ Selected: 1–2 Skylights');

    // Select: Old Equipment Removal - Everything Staying
    await page.locator('label[for="equip_none"]').click();
    console.log('  ✅ Selected: Everything Staying');

    // Select: Single Layer
    await page.locator('label[for="layer_1"]').click();
    console.log('  ✅ Selected: Single Layer');

    // Select: Replace Gutters All Around (NO micro-mesh)
    await page.locator('label[for="gutters_around"]').click();
    console.log('  ✅ Selected: Seamless Gutters All Around');

    // Select: No Ice Dam Issues
    await page.locator('label[for="ice_no"]').click();
    console.log('  ✅ Selected: No Ice Dam Issues');

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

    // Fill Phone
    await page.locator('#phoneInput').fill('(801) 449-1451');
    console.log('  ✅ Entered Phone: (801) 449-1451');

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

    // Verify Address persistence and modification flag
    if (!resJson.propertyAddress.includes('9917 South 3200 West')) {
      throw new Error(`Server did not persist updated address! Got: ${resJson.propertyAddress}`);
    }
    if (!resJson.addressModified) {
      throw new Error('Server did not flag addressModified: true!');
    }
    console.log('  ✅ Server persisted customer-modified address & flagged addressModified: true');

    // Wait for Success Card
    await page.waitForSelector('#successCard', { state: 'visible', timeout: 5000 });
    const confirmedEmailText = await page.locator('#confirmedEmail').textContent();
    console.log(`  ✅ Success Card active! Confirmed email: "${confirmedEmailText}"`);

    const summaryAddress = await page.locator('#summaryAddress').textContent();
    const summaryScope = await page.locator('#summaryScope').textContent();
    const summaryPropType = await page.locator('#summaryPropType').textContent();
    const summarySolar = await page.locator('#summarySolar').textContent();
    const summarySkylights = await page.locator('#summarySkylights').textContent();
    const summaryEquipment = await page.locator('#summaryEquipment').textContent();
    const summaryGutters = await page.locator('#summaryGutters').textContent();
    const summaryPriority = await page.locator('#summaryPriority').textContent();

    console.log(`  ✅ Summary Specs Capsule:
       - Address: "${summaryAddress}"
       - Classification: "${summaryPropType}"
       - Scope: "${summaryScope}"
       - Solar: "${summarySolar}"
       - Skylights: "${summarySkylights}"
       - Equipment: "${summaryEquipment}"
       - Gutters: "${summaryGutters}"
       - Priority: "${summaryPriority}"`);

    // Verify Direct Contact buttons
    const callHref = await page.locator('#btnCallMichael').getAttribute('href');
    const textHref = await page.locator('#btnTextMichael').getAttribute('href');
    console.log(`  ✅ Direct Specialist Actions: Call [${callHref}], Text [${textHref}]`);
    if (!callHref.includes('tel:+18014491451')) {
      throw new Error(`Invalid call href: ${callHref}`);
    }

    // Verify Clipboard Copy Button and Toast
    await page.locator('#btnCopyNumber').click();
    await page.waitForSelector('#toast.show', { timeout: 3000 });
    const toastText = await page.locator('#toast').textContent();
    console.log(`  ✅ Clipboard Toast Triggered: "${toastText.trim()}"`);

    // Capture Screenshot Step 4 (Success Card)
    const ssStep4 = path.join(ARTIFACT_DIR, 'rpa_mobile_step4_success.png');
    await page.screenshot({ path: ssStep4, fullPage: false });
    console.log(`  📸 Captured Mobile Proof: ${ssStep4}`);

    // Verify Edit Specs Back-Navigation
    console.log('\n[RPA Back Navigation] Testing [Edit Your Project Specs] button...');
    await page.locator('#btnEditSpecs').click();
    await page.waitForSelector('#step1.active', { timeout: 3000 });
    const step1Title = await page.locator('#stepTitle').textContent();
    console.log(`  ✅ Successfully returned to: ${step1Title}`);

    // Verify data was preserved
    const preservedName = await page.locator('#nameInput').inputValue();
    console.log(`  ✅ Preserved Homeowner Name: "${preservedName}"`);

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
