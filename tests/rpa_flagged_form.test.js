const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let playwright;
try {
  playwright = require('playwright');
} catch (e1) {
  playwright = require('C:/Users/mjrob/OneDrive/Desktop/App Repo s/MJR_EPA/node_modules/playwright');
}

const { chromium } = playwright;
const TEST_PORT = 8998;
const ARTIFACT_DIR = 'C:/Users/mjrob/.gemini/antigravity/brain/0ea1d186-c0b7-4d42-8bc0-3cea6c384d14';

async function waitForServer(port, timeoutMs = 20000) {
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
  throw new Error(`Server failed to boot on port ${port}`);
}

async function runFlaggedRpaTest() {
  console.log('--- Testing Flag & Skip Pre-Populated View in Mobile Browser ---');
  const serverPath = path.join(__dirname, '..', 'server.js');
  const serverProc = spawn('node', [serverPath], {
    env: { ...process.env, PORT: String(TEST_PORT) },
    cwd: path.join(__dirname, '..'),
    stdio: 'pipe'
  });

  try {
    await waitForServer(TEST_PORT);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15'
    });

    const page = await context.newPage();

    // URL simulates Honey's Flag & Skip SMS with flagged=skylights
    const testUrl = `http://localhost:${TEST_PORT}/verify?phone=8014491451&name=Michael%20Robinson&address=9917%20S%20State%20St%2C%20Sandy%2C%20UT&propertyType=Residential%20Home&projectScope=Full%20Roof%20Replacement&solarStatus=yes&skylights=replace&shingleLayers=1&flagged=skylights`;
    console.log(`Navigating to: ${testUrl}`);
    await page.goto(testUrl, { waitUntil: 'networkidle' });

    // 1. Verify Flagged Banner is visible
    const bannerVisible = await page.locator('#flaggedBanner').isVisible();
    console.log(`  Flagged Banner Visible: ${bannerVisible}`);
    if (!bannerVisible) throw new Error('Expected #flaggedBanner to be visible');

    // 2. Verify auto-advance to Step 2 (since Step 1 is clean and skylights is in Step 2)
    const step2Active = await page.locator('#step2.active').isVisible();
    console.log(`  Auto-advanced to Step 2: ${step2Active}`);
    if (!step2Active) throw new Error('Expected Step 2 to be active automatically');

    // 3. Verify skylights question has flagged highlight and badge
    const skylightHighlight = await page.locator('#groupSkylights.flagged-highlight').isVisible();
    const skylightBadge = await page.locator('#groupSkylights .flagged-badge').isVisible();
    console.log(`  Skylights Highlight: ${skylightHighlight}, Badge: ${skylightBadge}`);
    if (!skylightHighlight || !skylightBadge) throw new Error('Expected Skylights question to have flagged highlight and badge');

    // 4. Verify pre-populated values
    const solarChecked = await page.locator('#solar_yes').isChecked();
    const skyReplaceChecked = await page.locator('#sky_replace').isChecked();
    const layer1Checked = await page.locator('#layer_1').isChecked();
    console.log(`  Pre-filled: Solar=${solarChecked}, Skylights=${skyReplaceChecked}, Layers=${layer1Checked}`);
    if (!solarChecked || !skyReplaceChecked || !layer1Checked) throw new Error('Pre-filled radio pills not correctly selected');

    // 5. Capture Proof Screenshot
    const ssFlagged = path.join(ARTIFACT_DIR, 'rpa_mobile_flagged_step2.png');
    await page.screenshot({ path: ssFlagged, fullPage: false });
    console.log(`  📸 Proof captured: ${ssFlagged}`);

    await browser.close();
    console.log('✅ Flag & Skip RPA Test Passed 100%!');
  } finally {
    serverProc.kill();
  }
}

runFlaggedRpaTest().catch(err => {
  console.error('❌ Flag & Skip RPA Test Failed:', err);
  process.exit(1);
});
