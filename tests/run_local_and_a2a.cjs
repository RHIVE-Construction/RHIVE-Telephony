const { spawn } = require('child_process');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const { runFullA2ASuite } = require('./run_a2a_overnight_swarm.cjs');

const TEST_PORT = 8996;

async function main() {
  console.log(`================================================================`);
  console.log(`🚀 LAUNCHING LOCAL TEST SERVER & A2A NIGHTLY SIMULATION ENGINE`);
  console.log(`================================================================`);

  const serverPath = path.join(__dirname, '..', 'server.js');
  const serverProc = spawn('node', [serverPath], {
    env: { ...process.env, PORT: String(TEST_PORT) },
    cwd: path.join(__dirname, '..'),
    stdio: 'pipe'
  });

  serverProc.stdout.on('data', d => {
    const s = d.toString().trim();
    if (s.includes('RUNNING ON PORT') || s.includes('READY')) {
      console.log('  [Local Bridge]', s);
    }
  });

  serverProc.stderr.on('data', d => {
    const s = d.toString().trim();
    if (s.includes('Error') || s.includes('Warning')) {
      console.warn('  [Local Bridge Note]', s);
    }
  });

  // Wait for health check
  console.log(`Waiting for local bridge to become healthy on port ${TEST_PORT}...`);
  await new Promise((resolve, reject) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        await axios.get(`http://localhost:${TEST_PORT}/health`);
        clearInterval(interval);
        console.log(`✅ Local bridge healthy on port ${TEST_PORT}!`);
        resolve();
      } catch (err) {
        if (attempts > 30) {
          clearInterval(interval);
          serverProc.kill();
          reject(new Error('Local bridge failed to start within 15 seconds'));
        }
      }
    }, 500);
  });

  try {
    const report = await runFullA2ASuite(`ws://localhost:${TEST_PORT}`);
    console.log(`\n================================================================`);
    console.log(`📈 A2A NIGHTLY SIMULATION RESULTS ACROSS ALL FLOWS`);
    console.log(`================================================================`);
    console.log(JSON.stringify(report, null, 2));

    // Save report to artifacts directory
    const artifactPath = 'C:/Users/mjrob/.gemini/antigravity/brain/0ea1d186-c0b7-4d42-8bc0-3cea6c384d14/rev60_a2a_simulation_results.json';
    fs.writeFileSync(artifactPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Saved detailed test results to: ${artifactPath}`);

  } catch(err) {
    console.error('A2A Test Execution Error:', err);
  } finally {
    console.log('Shutting down local bridge server...');
    serverProc.kill('SIGTERM');
  }
}

main().catch(err => {
  console.error('Fatal error in local A2A runner:', err);
  process.exit(1);
});
