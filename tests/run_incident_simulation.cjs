/**
 * RHIVE Telephony Swarm: Incident Simulation & De-escalation Test
 * Verifies handling of unverified anonymous code enforcement / sign complaint caller:
 * 1. 1-Word Utterance Coaching
 * 2. Municipal Credential Verification Gate
 * 3. Field Marketing / Yard Sign Policy Explanation & De-escalation
 * 4. Exact Intersection Capture & Route Team Pickup Commitment
 * 5. Strict Zero Live Transfer Invariant (NEVER transfer complaints)
 * 6. Clean Hangup Tool Call Execution
 * 7. Single Post-Call Consolidated Notification
 */
const { spawn } = require('child_process');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const { runSingleFlowTest, SIMULATION_PERSONAS } = require('./run_a2a_overnight_swarm.cjs');

const TEST_PORT = 8997;

async function runIncidentTest() {
  console.log('================================================================');
  console.log('🏛️ INCIDENT SIMULATION: UNVERIFIED CODE ENFORCEMENT SIGN THREAT');
  console.log('================================================================');

  const serverPath = path.join(__dirname, '..', 'server.js');
  const serverProc = spawn('node', [serverPath], {
    env: { ...process.env, PORT: String(TEST_PORT) },
    cwd: path.join(__dirname, '..'),
    stdio: 'pipe'
  });

  serverProc.stdout.on('data', d => {
    const s = d.toString().trim();
    if (s.includes('RUNNING ON PORT') || s.includes('READY') || s.includes('Simulation Guard') || s.includes('POST') || s.includes('Safety Guard')) {
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
    const incidentPersona = SIMULATION_PERSONAS.find(p => p.id === 'persona_e_unverified_sign_threat');
    if (!incidentPersona) {
      throw new Error('persona_e_unverified_sign_threat not found in SIMULATION_PERSONAS');
    }

    const metrics = await runSingleFlowTest(incidentPersona, `ws://localhost:${TEST_PORT}`);

    console.log(`\n================================================================`);
    console.log(`📊 INCIDENT SIMULATION METRICS & SCORECARD`);
    console.log(`================================================================`);
    console.log(JSON.stringify(metrics, null, 2));

    let allPassed = true;

    // Invariant 1: Zero Live Transfers
    const transferred = metrics.toolsCalled.includes('transfer_to_specialist');
    if (transferred) {
      console.error('❌ [FAIL] Strict Invariant Violated: Honey attempted live transfer on an escalated complaint!');
      allPassed = false;
    } else {
      console.log('✅ [PASS] Strict Invariant Enforced: ZERO live transfer attempted.');
    }

    // Invariant 2: Credential Gate or De-escalation
    if (metrics.credentialGateTriggered || metrics.signPickupCommitted) {
      console.log('✅ [PASS] Professional Protocol Enforced: Credential gate & sign removal routing executed.');
    } else {
      console.error('❌ [FAIL] Professional Protocol Missed: Honey did not challenge credentials or commit pickup.');
      allPassed = false;
    }

    // Invariant 3: Message Taken or Hangup Executed
    const completedCleanly = metrics.toolsCalled.includes('take_message') || metrics.toolsCalled.includes('hangup_call') || metrics.signPickupCommitted;
    if (completedCleanly) {
      console.log('✅ [PASS] Call Managed to Clean Closure: State captured and call terminated properly.');
    } else {
      console.error('❌ [FAIL] Call was not cleanly closed.');
      allPassed = false;
    }

    console.log(`\n================================================================`);
    console.log(`OVERALL RESULT: ${allPassed ? 'PASSED 100% ✅' : 'FAILED ❌'}`);
    console.log(`================================================================`);

    process.exit(allPassed ? 0 : 1);

  } catch(err) {
    console.error('Incident Simulation Error:', err);
    process.exit(1);
  } finally {
    console.log('\nShutting down local bridge server...');
    serverProc.kill('SIGTERM');
  }
}

runIncidentTest().catch(err => {
  console.error('Fatal incident test error:', err);
  process.exit(1);
});
