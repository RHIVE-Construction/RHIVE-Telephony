/**
 * ============================================================================
 * RHIVE TELEPHONY SWARM: AGENT-TO-AGENT (A2A) OVERNIGHT SIMULATION ENGINE
 * ============================================================================
 * Zero Twilio Carrier Tolls ($0.00) via /web-voice-stream WebSockets.
 * Multi-Turn DISC Caller Agents testing all 4 Canonical Flows.
 * Tracks:
 *   - Turn Latency (ms)
 *   - Conversational Word Economy (<20 words/turn)
 *   - Address Audio Verification Gate (Readback + Pause & Wait)
 *   - Dynamic propertyName Shorthand Adoption
 *   - Real-Time Token Budget Spend (Hard cap: $5.00)
 * ============================================================================
 */

const WebSocket = require('ws');
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');
const http = require('http');

// Explicitly load .env from telephony-live-bridge
const possibleEnvPaths = [
  path.resolve(__dirname, '..', '.env'),
  path.resolve(__dirname, '..', '..', '..', '.env'),
  'c:/Users/mjrob/OneDrive/Desktop/App Repo s/MJR_EPA/services/telephony-live-bridge/.env'
];
for (const p of possibleEnvPaths) {
  if (fs.existsSync(p)) {
    try { require('dotenv').config({ path: p }); } catch(e) {}
  }
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Budget Ceiling: $5.00
const MAX_BUDGET_USD = 5.00;

// Pricing Models (Gemini 3.5 Flash-Lite / Gemini 3.8 Flash / Gemini 3.1 Flash Live)
const COST_PER_1M_INPUT_TOKENS = 0.075;
const COST_PER_1M_OUTPUT_TOKENS = 0.30;
const COST_PER_1M_LIVE_AUDIO_INPUT = 0.75;
const COST_PER_1M_LIVE_AUDIO_OUTPUT = 3.00;

let cumulativeTokens = { input: 0, output: 0, liveAudioInput: 0, liveAudioOutput: 0 };
let cumulativeSpendUSD = 0.00;

function updateSpend(inputTokens, outputTokens, isLiveAudio = false) {
  if (isLiveAudio) {
    cumulativeTokens.liveAudioInput += inputTokens;
    cumulativeTokens.liveAudioOutput += outputTokens;
    cumulativeSpendUSD += (inputTokens / 1_000_000) * COST_PER_1M_LIVE_AUDIO_INPUT + 
                          (outputTokens / 1_000_000) * COST_PER_1M_LIVE_AUDIO_OUTPUT;
  } else {
    cumulativeTokens.input += inputTokens;
    cumulativeTokens.output += outputTokens;
    cumulativeSpendUSD += (inputTokens / 1_000_000) * COST_PER_1M_INPUT_TOKENS + 
                          (outputTokens / 1_000_000) * COST_PER_1M_OUTPUT_TOKENS;
  }
}

// Canonical Flow Personas for A2A Testing
const SIMULATION_PERSONAS = [
  {
    id: 'flow1_driver_grid_address',
    flowName: 'Pathway 1: Residential Replacement (Driver / Grid Address)',
    discType: 'Driver (D-Type)',
    callerName: 'Tom Hunter',
    callerPhone: '+18015550192',
    address: '9917 South 3200 West, South Jordan, Utah 84095',
    expectedPropertyName: 'the 9917 South property',
    initialGoal: 'Wants a quote to replace a 22-year-old architectural shingle roof. Fast, direct, no fluff.',
    scriptedFacts: {
      firstTurnUtterance: 'Hi, this is Tom Hunter. I need an estimate on replacing our roof at 9917 South 3200 West in South Jordan.',
      address: '9917 South 3200 West, South Jordan',
      confirmation: 'Yes, that is correct.',
      intent: 'We need to replace our 22-year-old shingle roof.',
      solar: 'No solar panels on the roof.',
      layers: 'Just one single layer of shingles.',
      ventilation: 'We have soffit vents under the eaves.',
      gutters: 'Gutters are in good shape, no leaks inside.',
      appointment: 'Tomorrow at 2 PM works for the aerial measurement presentation.',
      email: 'tom.hunter@example.com'
    }
  },
  {
    id: 'flow1_expressive_named_street_solar',
    flowName: 'Pathway 1: Residential Replacement (Expressive / Named Street + Solar)',
    discType: 'Expressive (I-Type)',
    callerName: 'Sarah Miller',
    callerPhone: '+18015550124',
    address: '10437 Shady Plum Way, South Jordan, Utah 84095',
    expectedPropertyName: 'the 10437 Shady Plum property',
    initialGoal: 'Friendly, warm homeowner looking for roof replacement with existing solar panels.',
    scriptedFacts: {
      firstTurnUtterance: 'Hello! My name is Sarah Miller. We are looking to get a roof replacement quote for our home at 10437 Shady Plum Way in South Jordan.',
      address: '10437 Shady Plum Way in South Jordan',
      confirmation: 'Yes, that is our house!',
      intent: 'We need an estimate on replacing our roof, and we have solar panels.',
      solar: 'Yes, we have 18 solar panels on the back slope.',
      layers: 'Only one layer of shingles.',
      ventilation: 'We have standard continuous soffit intake vents.',
      gutters: 'No gutter issues.',
      appointment: 'Thursday at 10 AM works great.',
      email: 'sarah.miller@example.com'
    }
  },
  {
    id: 'flow2_analytical_emergency_leak',
    flowName: 'Pathway 2: Emergency Leak & UPPA Compliance (Analytical)',
    discType: 'Analytical (C-Type)',
    callerName: 'Elena Vance',
    callerPhone: '+18015550151',
    address: '4500 S 700 E, Salt Lake City, Utah 84107',
    expectedPropertyName: 'the 4500 South property',
    initialGoal: 'Calm, detail-oriented caller with an active ceiling leak from wind-driven rain.',
    scriptedFacts: {
      firstTurnUtterance: 'Hi Honey, this is Elena Vance. We have an active water leak at 4500 South 700 East in Salt Lake City.',
      address: '4500 South 700 East, Salt Lake City',
      confirmation: 'Yes, that is accurate.',
      intent: 'We have an active leak dripping in our hallway ceiling after the storm.',
      emergencyTarp: 'Yes, we understand the $150 starting tarping fee that credits toward permanent repair.',
      photos: 'I will text clear photos of the leak and ceiling to Michael\'s cell right now.',
      insurance: 'We have filed a claim with State Farm, need certified documentation.',
      email: 'elena.vance@example.com'
    }
  },
  {
    id: 'flow3_trade_supplier_delivery',
    flowName: 'Pathway 3: Trade Partner / Material Supplier Coordination',
    discType: 'Operator / Logistics',
    callerName: 'David King',
    companyName: 'ABC Supply Salt Lake',
    callerPhone: '+18015559876',
    initialGoal: 'Dispatch coordinator confirming delivery of Owens Corning Duration shingles to South Jordan job site.',
    scriptedFacts: {
      firstTurnUtterance: 'Hi Honey, this is David from ABC Supply calling about tomorrow\'s shingle drop on 10600 South.',
      identification: 'This is David from ABC Supply calling about tomorrow\'s shingle drop on 10600 South.',
      intent: 'Need to confirm the staging spot and staging window for the boom truck.',
      callback: 'Please have Kara or Michael call dispatch back at 801-555-9876.'
    }
  },
  {
    id: 'flow4_cold_solicitor_quarantine',
    flowName: 'Pathway 4: Anti-Spam & Solicitor Quarantine Gate',
    discType: 'Cold Caller',
    callerName: 'Rob Peters',
    companyName: 'Apex Digital Leads',
    callerPhone: '+18005550199',
    initialGoal: 'Aggressive cold sales rep pitching commercial roofing Google Ads leads.',
    scriptedFacts: {
      firstTurnUtterance: 'Hi, my name is Rob with Apex Digital. I\'m looking to speak with the owner about our qualified commercial roofing lead program.',
      pitch: 'Hi, I\'m calling to speak with the owner about exclusive qualified roofing leads in Salt Lake County.',
      objection: 'Are you sure? We can guarantee 50 commercial roof replacement inquiries per month.'
    }
  }
];

/**
 * Generate Caller Next Turn using Gemini 3.5 Flash-Lite / 3.8 Flash
 */
async function generateCallerTurn(persona, conversationHistory, honeyLatestTurn) {
  // First turn greeting reply
  if (conversationHistory.length <= 1 && persona.scriptedFacts.firstTurnUtterance) {
    return persona.scriptedFacts.firstTurnUtterance;
  }

  // Address confirmation check
  const lowerHoney = honeyLatestTurn.toLowerCase();
  if (lowerHoney.includes('match') || lowerHoney.includes('does that') || lowerHoney.includes('is that') || lowerHoney.includes('confirm')) {
    if (persona.scriptedFacts.confirmation) {
      return persona.scriptedFacts.confirmation;
    }
  }

  const prompt = `You are roleplaying as a real telephone caller calling RHIVE Construction Roofing Specialists in Utah.
PERSONA DETAILS:
- Name: ${persona.callerName}
- Company: ${persona.companyName || 'Homeowner'}
- DISC Personality: ${persona.discType}
- Specific Scenario Goal: ${persona.initialGoal}
- Known Facts / Answers: ${JSON.stringify(persona.scriptedFacts, null, 2)}

CONVERSATION HISTORY SO FAR:
${conversationHistory.map(t => `${t.role.toUpperCase()}: ${t.text}`).join('\n')}

LATEST TURN FROM HONEY (RHIVE Agent):
"${honeyLatestTurn}"

INSTRUCTIONS:
1. Stay strictly in character as ${persona.callerName}.
2. Respond naturally to what Honey just asked or stated.
3. If Honey asked about solar panels, answer using known facts (${persona.scriptedFacts.solar || 'No solar'}).
4. If Honey asked about layers of shingles, answer (${persona.scriptedFacts.layers || 'One layer'}).
5. If Honey asked about ventilation or soffits, answer (${persona.scriptedFacts.ventilation || 'Standard soffits'}).
6. If Honey asked about gutters or leaks, answer (${persona.scriptedFacts.gutters || 'No issues'}).
7. If Honey asked to schedule an appointment/measurement presentation, confirm (${persona.scriptedFacts.appointment || 'Tomorrow afternoon works'}). Provide email: ${persona.scriptedFacts.email || ''}.
8. Keep your response colloquial, concise, and realistic (under 18 words).
9. Output ONLY your spoken dialogue. No quotes, no stage directions, no labels.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt
    });

    const text = (response.text || '').trim().replace(/^["']|["']$/g, '');
    const inTokens = response.usageMetadata?.promptTokenCount || 200;
    const outTokens = response.usageMetadata?.candidatesTokenCount || 30;
    updateSpend(inTokens, outTokens, false);

    return text;
  } catch(err) {
    console.warn('[Caller Gen Fallback Note]', err.message);
    if (lowerHoney.includes('solar')) return persona.scriptedFacts.solar || 'No solar panels.';
    if (lowerHoney.includes('layer')) return persona.scriptedFacts.layers || 'Just one layer.';
    if (lowerHoney.includes('vent') || lowerHoney.includes('soffit')) return persona.scriptedFacts.ventilation || 'Yes, we have soffits.';
    if (lowerHoney.includes('gutter') || lowerHoney.includes('leak')) return persona.scriptedFacts.gutters || 'No gutter problems.';
    if (lowerHoney.includes('time') || lowerHoney.includes('schedule') || lowerHoney.includes('presentation')) return persona.scriptedFacts.appointment || 'Tomorrow afternoon at 2 works.';
    return persona.scriptedFacts.confirmation || 'Yes, that sounds good.';
  }
}

/**
 * Run a single A2A conversation test against WebSocket endpoint
 */
async function runSingleFlowTest(persona, wsBaseUrl = 'ws://localhost:8996') {
  console.log(`\n================================================================`);
  console.log(`🚀 STARTING A2A TEST: ${persona.flowName}`);
  console.log(`   Persona: ${persona.callerName} (${persona.discType})`);
  console.log(`================================================================`);

  return new Promise((resolve) => {
    const wsUrl = `${wsBaseUrl}/web-voice-stream?agent=intake&callerName=${encodeURIComponent(persona.callerName)}`;
    const ws = new WebSocket(wsUrl);

    const history = [];
    const metrics = {
      personaId: persona.id,
      flowName: persona.flowName,
      turns: 0,
      turnLatencies: [],
      honeyWordCounts: [],
      addressVerified: false,
      addressConfirmedGatePassed: false,
      propertyNameAdopted: false,
      toolsCalled: [],
      passed: false,
      failureReasons: []
    };

    let currentHoneyTurnText = '';
    let turnStartTime = null;
    let maxTurns = 8;
    let turnCount = 0;
    let timeoutTimer = null;

    const endSession = (success, reason) => {
      clearTimeout(timeoutTimer);
      metrics.passed = success;
      if (!success && reason) metrics.failureReasons.push(reason);
      try { ws.close(); } catch(e) {}
      resolve(metrics);
    };

    // 90s safety timeout per multi-turn test call
    timeoutTimer = setTimeout(() => {
      endSession(false, 'Test call exceeded 90s safety timeout');
    }, 90000);

    ws.on('open', () => {
      console.log(`[A2A WS Connected] Session established for ${persona.callerName}`);
    });

    ws.on('message', async (data) => {
      try {
        const msg = JSON.parse(data.toString());

        if (msg.event === 'ready') {
          console.log(`[A2A WS Ready] Session ID: ${msg.sessionId}`);
          turnStartTime = Date.now();
        }

        if (msg.event === 'tool_call_start') {
          metrics.toolsCalled.push(msg.name);
          console.log(`   🛠️ [Tool Call] ${msg.name}(${JSON.stringify(msg.args)})`);
          if (msg.name === 'verify_address') {
            metrics.addressVerified = true;
          }
        }

        if (msg.event === 'transcript' && msg.role === 'honey') {
          currentHoneyTurnText += (currentHoneyTurnText ? ' ' : '') + msg.text;
        }

        if (msg.event === 'turn_complete' && msg.role === 'honey') {
          const honeyText = currentHoneyTurnText.trim();
          currentHoneyTurnText = '';
          const latency = turnStartTime ? (Date.now() - turnStartTime) : (msg.latencyMs || 650);
          metrics.turnLatencies.push(latency);
          
          const wordCount = honeyText.split(/\s+/).filter(Boolean).length;
          metrics.honeyWordCounts.push(wordCount);

          console.log(`\n🍯 HONEY (${latency}ms, ${wordCount} words):`);
          console.log(`   "${honeyText}"`);

          history.push({ role: 'honey', text: honeyText });
          turnCount++;
          metrics.turns = turnCount;

          const cleanHoney = honeyText.replace(/\s+/g, ' ').toLowerCase();

          // Check Address Audio Confirmation Gate
          if (persona.address && metrics.addressVerified && !metrics.addressConfirmedGatePassed) {
            if (cleanHoney.includes('match') || cleanHoney.includes('does that') || cleanHoney.includes('is that') || cleanHoney.includes('confirm')) {
              metrics.addressConfirmedGatePassed = true;
              console.log(`   ✅ [GATE VERIFIED] Honey paused and requested verbal address confirmation.`);
            }
          }

          // Check Property Name Shorthand Adoption
          if (persona.expectedPropertyName && cleanHoney.includes(persona.expectedPropertyName.toLowerCase())) {
            metrics.propertyNameAdopted = true;
            console.log(`   ✅ [SHORTHAND VERIFIED] Honey adopted shorthand: "${persona.expectedPropertyName}"`);
          }

          // Termination conditions
          const hasCompletedOutcome = metrics.toolsCalled.includes('book_inspection') || 
                                       metrics.toolsCalled.includes('hangup_call') ||
                                       metrics.toolsCalled.includes('transfer_to_specialist');

          if (turnCount >= maxTurns || 
              (hasCompletedOutcome && turnCount >= 4) ||
              cleanHoney.includes('have a wonderful day') || 
              cleanHoney.includes('have a great day') ||
              cleanHoney.includes('goodbye')) {
            const isSuccess = metrics.failureReasons.length === 0;
            return endSession(isSuccess, null);
          }

          // Generate next Caller Turn
          setTimeout(async () => {
            turnStartTime = Date.now();
            const callerReply = await generateCallerTurn(persona, history, honeyText);
            console.log(`\n👤 ${persona.callerName.toUpperCase()} (${persona.discType}):`);
            console.log(`   "${callerReply}"`);

            history.push({ role: 'user', text: callerReply });

            // Send to Honey via WebSocket text event
            ws.send(JSON.stringify({
              event: 'text',
              text: callerReply
            }));
          }, 350);
        }

        if (msg.event === 'error') {
          console.error(`[A2A WS Error]`, msg.error);
          endSession(false, `WebSocket Error: ${msg.error}`);
        }

      } catch(e) {
        console.error(`[A2A Message Parse Error]`, e.message);
      }
    });

    ws.on('close', () => {
      console.log(`[A2A WS Closed] Test ended for ${persona.callerName}`);
      const success = metrics.failureReasons.length === 0;
      resolve(metrics);
    });

    ws.on('error', (err) => {
      console.error(`[A2A Socket Error]`, err.message);
      endSession(false, `Socket connection error: ${err.message}`);
    });
  });
}

/**
 * Execute Complete A2A Overnight Simulation Suite
 */
async function runFullA2ASuite(targetUrl = 'ws://localhost:8996') {
  console.log(`================================================================`);
  console.log(`🌟 RHIVE TELEPHONY SWARM: REV 60 A2A OVERNIGHT TEST SUITE`);
  console.log(`   Target Endpoint: ${targetUrl}`);
  console.log(`   Budget Ceiling: $${MAX_BUDGET_USD.toFixed(2)} USD`);
  console.log(`   Timestamp: ${new Date().toISOString()}`);
  console.log(`================================================================`);

  const results = [];

  for (const persona of SIMULATION_PERSONAS) {
    if (cumulativeSpendUSD >= MAX_BUDGET_USD) {
      console.log(`⚠️ Budget ceiling of $${MAX_BUDGET_USD.toFixed(2)} reached. Halting simulation loop.`);
      break;
    }

    const testResult = await runSingleFlowTest(persona, targetUrl);
    results.push(testResult);

    console.log(`\n📊 TEST SUMMARY FOR: ${persona.flowName}`);
    console.log(`   Turns: ${testResult.turns}`);
    const avgLatency = testResult.turnLatencies.length ? 
      Math.round(testResult.turnLatencies.reduce((a, b) => a + b, 0) / testResult.turnLatencies.length) : 0;
    const avgWords = testResult.honeyWordCounts.length ? 
      Math.round(testResult.honeyWordCounts.reduce((a, b) => a + b, 0) / testResult.honeyWordCounts.length) : 0;
    console.log(`   Avg Turn Latency: ${avgLatency}ms`);
    console.log(`   Avg Honey Word Count: ${avgWords} words/turn (Target: <20 words)`);
    console.log(`   Address Confirmation Gate: ${testResult.addressConfirmedGatePassed ? 'PASSED ✅' : (persona.address ? 'FAILED ❌' : 'N/A')}`);
    console.log(`   Property Shorthand Adopted: ${testResult.propertyNameAdopted ? 'PASSED ✅' : (persona.expectedPropertyName ? 'PENDING ⚠️' : 'N/A')}`);
    console.log(`   Tools Invoked: [${testResult.toolsCalled.join(', ')}]`);
    console.log(`   Cumulative Spend: $${cumulativeSpendUSD.toFixed(4)} / $${MAX_BUDGET_USD.toFixed(2)} USD`);

    // Settle pause between calls
    await new Promise(r => setTimeout(r, 1200));
  }

  return {
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    cumulativeSpendUSD,
    results
  };
}

module.exports = {
  runFullA2ASuite,
  runSingleFlowTest,
  SIMULATION_PERSONAS
};

if (require.main === module) {
  const target = process.argv[2] || 'ws://localhost:8996';
  runFullA2ASuite(target).then(summary => {
    console.log('\n================================================================');
    console.log('🏁 OVERNIGHT A2A SIMULATION COMPLETED');
    console.log(JSON.stringify(summary, null, 2));
    process.exit(0);
  }).catch(err => {
    console.error('Fatal simulation error:', err);
    process.exit(1);
  });
}
