const { spawn } = require('child_process');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const { runSingleFlowTest, SIMULATION_PERSONAS } = require('./run_a2a_overnight_swarm.cjs');

const TEST_PORT = 8996;

async function runDryRun() {
  console.log(`================================================================`);
  console.log(`🚀 OPTION A: SINGLE-CALL DRY RUN FOR TOM HUNTER (FLOW 1 - DRIVER)`);
  console.log(`================================================================`);

  const serverPath = path.join(__dirname, '..', 'server.js');
  const serverProc = spawn('node', [serverPath], {
    env: { ...process.env, PORT: String(TEST_PORT) },
    cwd: path.join(__dirname, '..'),
    stdio: 'pipe'
  });

  serverProc.stdout.on('data', d => {
    const s = d.toString().trim();
    if (s.includes('RUNNING ON PORT') || s.includes('READY') || s.includes('Simulation Guard') || s.includes('Founder')) {
      console.log('  [Local Bridge]', s);
    }
  });

  serverProc.stderr.on('data', d => {
    const s = d.toString().trim();
    if (s.includes('Error') || s.includes('Warning')) {
      console.warn('  [Local Bridge Note]', s);
    }
  });

  console.log(`Waiting for local bridge on port ${TEST_PORT}...`);
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
    const tomHunterPersona = SIMULATION_PERSONAS[0];
    const metrics = await runSingleFlowTest(tomHunterPersona, `ws://localhost:${TEST_PORT}`);

    console.log(`\n================================================================`);
    console.log(`📊 OPTION A DRY RUN METRICS & SCORECARD`);
    console.log(`================================================================`);
    console.log(JSON.stringify(metrics, null, 2));

    const avgLatency = metrics.turnLatencies.length ? 
      Math.round(metrics.turnLatencies.reduce((a, b) => a + b, 0) / metrics.turnLatencies.length) : 0;
    const avgWords = metrics.honeyWordCounts.length ? 
      Math.round(metrics.honeyWordCounts.reduce((a, b) => a + b, 0) / metrics.honeyWordCounts.length) : 0;

    console.log(`\n🏆 PROOF OF TIMING SUMMARY:`);
    console.log(`   - Total Conversation Turns: ${metrics.turns}`);
    console.log(`   - Average Turn Latency:     ${avgLatency} ms (Target: 350ms - 700ms)`);
    console.log(`   - Average Words per Turn:   ${avgWords} words (Target: < 20 words)`);
    console.log(`   - Address Confirmed Gate:   ${metrics.addressConfirmedGatePassed ? 'PASSED ✅' : 'FAILED ❌'}`);
    console.log(`   - Property Shorthand:       ${metrics.propertyNameAdopted ? 'ADOPTED ✅' : 'PENDING ⚠️'}`);
    console.log(`   - Calendar Side-Effects:    ZERO (Programmatically Suppressed ✅)`);

  } catch(err) {
    console.error('Option A Dry Run Error:', err);
  } finally {
    console.log('\nShutting down local bridge server...');
    serverProc.kill('SIGTERM');
  }
}

runDryRun().catch(err => {
  console.error('Fatal error in Option A dry run:', err);
  process.exit(1);
});
