const path = require('path');
const fs = require('fs');

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
const ARTIFACT_DIR = 'C:/Users/mjrob/.gemini/antigravity/brain/0ea1d186-c0b7-4d42-8bc0-3cea6c384d14';
const VIDEO_DIR = path.join(ARTIFACT_DIR, 'videos');

if (!fs.existsSync(VIDEO_DIR)) {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
}

async function recordRhiveOsInputForm() {
  console.log('\n=============================================================');
  console.log('🎬 RECORDING VIDEO 1: RHIVE OS New Project Input Form (Port 5175)');
  console.log('=============================================================');

  const videoSubDir = path.join(VIDEO_DIR, 'os_input_temp');
  if (!fs.existsSync(videoSubDir)) fs.mkdirSync(videoSubDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: {
      dir: videoSubDir,
      size: { width: 1280, height: 800 }
    }
  });

  const page = await context.newPage();

  try {
    console.log('  -> Navigating to http://localhost:5175/...');
    await page.goto('http://localhost:5175/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);

    // 1. Fill Property Location
    console.log('  -> Step 1: Entering Property Location...');
    const addrInput = page.locator('input[name="address"]').first();
    await addrInput.click();
    await addrInput.type('9917 South 3200 West, South Jordan, UT 84095', { delay: 40 });
    await page.waitForTimeout(800);

    // 2. Fill Primary Contact Info
    console.log('  -> Step 2: Entering Primary Contact Information...');
    await page.locator('input[placeholder="Jane"]').type('Michael', { delay: 40 });
    await page.locator('input[placeholder="Doe"]').type('Robinson', { delay: 40 });
    await page.locator('input[placeholder="(555) 123-4567"]').type('(801) 449-1451', { delay: 40 });
    await page.locator('input[placeholder="jane@example.com"]').type('michael@rhiveconstruction.com', { delay: 40 });
    await page.waitForTimeout(600);

    // 3. Select Project Role: Residential Owner
    console.log('  -> Step 3: Selecting Project Role & Classification...');
    const resRoleBtn = page.locator('button:has-text("Residential")').first();
    if (await resRoleBtn.count() > 0) {
      await resRoleBtn.click();
    }
    await page.waitForTimeout(500);

    // Click Save Contact
    const saveContactBtn = page.locator('button:has-text("Save Contact")');
    if (await saveContactBtn.count() > 0) {
      await saveContactBtn.click();
      console.log('  -> Saved Contact');
      await page.waitForTimeout(800);
    }

    // Advance past Initial Screen
    const nextBtns = page.locator('button:has-text("Next")');
    if (await nextBtns.count() > 0) {
      await nextBtns.first().click();
      console.log('  -> Advanced to Project Type & Intent Screen');
      await page.waitForTimeout(1000);
    }

    // 4. Project Intent: Replacement vs Repair
    console.log('  -> Step 4: Selecting Project Intent (Replacement)...');
    const replacementBtn = page.locator('button:has-text("Replacement")');
    if (await replacementBtn.count() > 0) {
      await replacementBtn.click();
      await page.waitForTimeout(600);
    }

    // 5. Goal: Instant Estimate vs Certified Quote
    console.log('  -> Step 5: Selecting Goal (Instant Estimate)...');
    const estimateOption = page.locator('text=I want an Instant Estimate').first();
    if (await estimateOption.count() > 0) {
      await estimateOption.click();
      await page.waitForTimeout(800);
    }

    // Click Next to Project Details & Schedule
    const nextBtns2 = page.locator('button:has-text("Next")');
    if (await nextBtns2.count() > 0) {
      await nextBtns2.last().click();
      console.log('  -> Advanced to Project Details & Schedule');
      await page.waitForTimeout(1500);
    }

    // Scroll smoothly to show full anatomy details
    await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
    await page.waitForTimeout(1500);

    await page.evaluate(() => window.scrollBy({ top: -350, behavior: 'smooth' }));
    await page.waitForTimeout(1200);

    console.log('  ✅ Video 1 recording complete.');
  } finally {
    const videoObj = page.video();
    await context.close();
    await browser.close();

    if (videoObj) {
      const recordedPath = await videoObj.path();
      const finalDest = path.join(VIDEO_DIR, 'rhive_os_new_project_input_rpa.webm');
      fs.copyFileSync(recordedPath, finalDest);
      console.log(`  🎥 Video 1 saved to: ${finalDest}`);
    }
  }
}

async function recordRhiveDigitalQuoteForm() {
  console.log('\n=============================================================');
  console.log('🎬 RECORDING VIDEO 2: RHIVE Digital Quote Intake Form (Port 8996)');
  console.log('=============================================================');

  const videoSubDir = path.join(VIDEO_DIR, 'quote_form_temp');
  if (!fs.existsSync(videoSubDir)) fs.mkdirSync(videoSubDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 420, height: 880 },
    recordVideo: {
      dir: videoSubDir,
      size: { width: 420, height: 880 }
    }
  });

  const page = await context.newPage();

  try {
    const url = 'http://localhost:8996/verify?phone=8014491451&address=9917%20S%20State%20St%2C%20Sandy%2C%20UT&name=Michael%20Robinson';
    console.log(`  -> Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);

    // 1. Show Street View and Interactive Address Edit Drawer
    console.log('  -> Step 1: Demonstrating Street View & Inline Address Modification...');
    await page.locator('#btnToggleEditAddress').click();
    await page.waitForSelector('#addressEditDrawer', { state: 'visible' });
    await page.waitForTimeout(800);

    const editInput = page.locator('#editAddressInput');
    await editInput.fill('');
    await editInput.type('9917 South 3200 West, South Jordan, UT 84095', { delay: 35 });
    await page.waitForTimeout(600);

    await page.locator('#btnApplyAddressUpdate').click();
    await page.waitForSelector('#addressEditDrawer', { state: 'hidden' });
    console.log('  -> Address updated & Street View reloaded!');
    await page.waitForTimeout(1200);

    // 2. Demonstrate 15-Minute Remote Video Inspection Gating
    console.log('  -> Step 2: Demonstrating 15-Min Remote Video Call Triage Gating...');
    await page.locator('label[for="scope_repair"]').click();
    await page.waitForSelector('#inspectionGateBox', { state: 'visible' });
    console.log('  -> Gated 15-min video inspection triage revealed dynamically!');
    await page.waitForTimeout(1200);

    // Now select Full Roof Replacement (hides inspection box)
    await page.locator('label[for="scope_replace"]').click();
    await page.waitForSelector('#inspectionGateBox', { state: 'hidden' });
    console.log('  -> Selected Full Roof Replacement');
    await page.waitForTimeout(600);

    await page.locator('label[for="prop_res"]').click();
    await page.waitForTimeout(500);

    // Advance to Step 2
    await page.locator('#btnNext1').click();
    await page.waitForTimeout(1000);

    // 3. Step 2 Roof Anatomy (Simple Voice & Instant Estimate Parity)
    console.log('  -> Step 3: Answering Roof Anatomy Questions (Instant Estimate Parity)...');
    // Solar: Binary check
    await page.locator('label[for="solar_yes"]').click();
    await page.waitForTimeout(500);

    // Skylights
    await page.locator('label[for="sky_12"]').click();
    await page.waitForTimeout(400);

    // Equipment Removal
    await page.locator('label[for="equip_none"]').click();
    await page.waitForTimeout(400);

    // Layers
    await page.locator('label[for="layer_1"]').click();
    await page.waitForTimeout(400);

    // Gutters
    await page.locator('label[for="gutters_around"]').click();
    await page.waitForTimeout(400);

    // Ice Dams
    await page.locator('label[for="ice_no"]').click();
    await page.waitForTimeout(600);

    // Advance to Step 3
    await page.locator('#btnNext2').click();
    await page.waitForTimeout(1000);

    // 4. Step 3 Delivery & Priorities
    console.log('  -> Step 4: Setting Delivery & Warranty Priorities...');
    await page.locator('label[for="prio2"]').click(); // Max Warranty
    await page.waitForTimeout(500);

    const emailInput = page.locator('#emailInput');
    await emailInput.fill('');
    await emailInput.type('michael@rhiveconstruction.com', { delay: 35 });
    await page.waitForTimeout(500);

    const phoneInput = page.locator('#phoneInput');
    await phoneInput.fill('');
    await phoneInput.type('(801) 449-1451', { delay: 35 });
    await page.waitForTimeout(500);

    const notesInput = page.locator('#notesInput');
    await notesInput.type('Special notes: Please provide aerial CAD measurement with 50-year warranty options.', { delay: 25 });
    await page.waitForTimeout(800);

    // 5. Submit Form
    console.log('  -> Step 5: Submitting Form & Displaying Chamfered Success Card...');
    await page.locator('#submitBtn').click();
    await page.waitForSelector('#successCard', { state: 'visible', timeout: 6000 });
    await page.waitForTimeout(1500);

    // Scroll down to show direct contact actions
    await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
    await page.waitForTimeout(1200);

    // Test clipboard copy
    await page.locator('#btnCopyNumber').click();
    await page.waitForTimeout(1000);

    await page.evaluate(() => window.scrollBy({ top: -350, behavior: 'smooth' }));
    await page.waitForTimeout(1500);

    console.log('  ✅ Video 2 recording complete.');
  } finally {
    const videoObj = page.video();
    await context.close();
    await browser.close();

    if (videoObj) {
      const recordedPath = await videoObj.path();
      const finalDest = path.join(VIDEO_DIR, 'rhive_digital_quote_form_rpa.webm');
      fs.copyFileSync(recordedPath, finalDest);
      console.log(`  🎥 Video 2 saved to: ${finalDest}`);
    }
  }
}

async function main() {
  console.log('=============================================================');
  console.log('🚀 EXECUTING DUAL RPA VIDEO RECORDING SUITE');
  console.log('=============================================================');

  await recordRhiveOsInputForm();
  await recordRhiveDigitalQuoteForm();

  console.log('\n🎉 BOTH RPA VIDEOS RECORDED SUCCESSFULLY!');
  console.log(`📁 Video Directory: ${VIDEO_DIR}`);
}

main().catch(err => {
  console.error('\n❌ VIDEO RECORDING FAILED:', err);
  process.exit(1);
});
