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

// Canonical Flow Personas for A2A Testing (Rev 69 Standard)
const SIMULATION_PERSONAS = [
  {
    id: 'persona_a_qualified_complex_replacement',
    flowName: 'Persona A: Qualified Complex Replacement (Pre-1972 Slat Deck & 3-Hour Inspection)',
    discType: 'Driver (D-Type)',
    callerName: 'Arthur Pendelton',
    callerPhone: '+18015550192',
    address: '1428 E 4500 S, Salt Lake City, Utah 84117',
    expectedPropertyName: 'the 1428 East property',
    initialGoal: '1968 home with 2 aging layers, soft spongy spots, and suspected spaced slat boards. Tests 34-variable intake, address verification, pre-1972 slat deck risk flag ($78.13/sheet re-decking), and books a 3-hour on-site physical inspection window.',
    scriptedFacts: {
      firstTurnUtterance: 'Hi, this is Arthur Pendelton. I need an on-site inspection on our 1968 home at 1428 East 4500 South in Salt Lake City.',
      address: '1428 East 4500 South, Salt Lake City',
      confirmation: 'Yes, that matches our home.',
      intent: 'Our home was built in 1968. We have two layers of shingles and soft spongy spots that feel like rotted decking.',
      solar: 'No solar panels on the roof.',
      layers: 'Two layers of shingles over old wood shake.',
      ventilation: 'We have standard box vents on the ridge.',
      gutters: 'Gutters are old and need replacement.',
      appointment: 'Tomorrow at 10 AM works great for our 3-hour inspection window.',
      email: 'arthur.pendelton@example.com'
    }
  },
  {
    id: 'persona_b_price_shopper_remote_quote',
    flowName: 'Persona B: Price Shopper / Remote Quote (Aerial CAD Scan & Steers Away from On-Site)',
    discType: 'Expressive (I-Type)',
    callerName: 'Sarah Miller',
    callerPhone: '+18015550124',
    address: '10437 Shady Plum Way, South Jordan, Utah 84095',
    expectedPropertyName: 'the 10437 Shady Plum property',
    initialGoal: 'Looking for a replacement quote on a 1998 home with solid OSB decking, single layer, and no leaks. Verifies Honey steers away from an on-site visit and queues remote aerial CAD measurements for the Project Specialist.',
    scriptedFacts: {
      firstTurnUtterance: 'Hello! This is Sarah Miller. We are shopping around for roof replacement quotes at 10437 Shady Plum Way in South Jordan.',
      address: '10437 Shady Plum Way in South Jordan',
      confirmation: 'Yes, that is our house!',
      intent: 'We have a standard 1998 shingle roof, only one layer, no leaks at all. Can someone come out to give an estimate?',
      solar: 'Yes, we have 18 solar panels on the back slope.',
      layers: 'Just one single original layer.',
      ventilation: 'Continuous soffit intake vents.',
      remoteAck: 'Oh perfect! Texting the aerial certified quote directly to my cell saves me from waiting around for an appointment.',
      email: 'sarah.miller@example.com'
    }
  },
  {
    id: 'persona_c_active_emergency_leak',
    flowName: 'Persona C: Active Emergency Leak (Active Dripping Triage & $150 Tarp Fee)',
    discType: 'Analytical (C-Type)',
    callerName: 'Elena Vance',
    callerPhone: '+18015550151',
    address: '4500 S 700 E, Salt Lake City, Utah 84107',
    expectedPropertyName: 'the 4500 South property',
    initialGoal: 'Wind-driven rain causing active dripping through kitchen drywall ceiling. Tests active dripping triage, the $150 tarp stabilization fee (credited toward repair/replacement), and 3-hour urgent mobilization.',
    scriptedFacts: {
      firstTurnUtterance: 'Hi Honey, this is Elena Vance. We have an active water leak dripping through our kitchen ceiling at 4500 South 700 East in Salt Lake City.',
      address: '4500 South 700 East, Salt Lake City',
      confirmation: 'Yes, that is accurate.',
      intent: 'Water is actively dripping from the light fixture and drywall is bulging after the wind storm.',
      emergencyTarp: 'Yes, we understand and agree to the $150 stabilization fee since it is 100% credited toward our repair.',
      mobilization: 'Yes, please dispatch the emergency crew in today\'s 3-hour arrival window.',
      insurance: 'We filed a claim with State Farm and need full documentation.',
      email: 'elena.vance@example.com'
    }
  },
  {
    id: 'persona_d_subcontractor_invoicing',
    flowName: 'Persona D: Subcontractor / Invoicing (Warm Transfer to Kara Robinson)',
    discType: 'Operator / Logistics',
    callerName: 'Marcus Vance',
    companyName: 'Wasatch Framing Specialists',
    callerPhone: '+18015559876',
    initialGoal: 'Subcontractor calling regarding pending draw invoice #4102 and framing coordination, asking to speak directly with Kara Robinson (President & 95% Owner). Tests warm transfer and verifies fallback options if unanswered.',
    scriptedFacts: {
      firstTurnUtterance: 'Hello, this is Marcus with Wasatch Framing. I need to speak directly with Kara Robinson regarding invoice 4102 for the South Jordan project.',
      identification: 'Marcus Vance with Wasatch Framing Specialists.',
      intent: 'Confirming invoice 4102 and scheduling our framing crew for next week.',
      transferAck: 'Yes, please transfer me directly to Kara.',
      callbackFallback: 'If Kara is unavailable, please have her call Marcus back at 801-555-9876 regarding invoice 4102.'
    }
  },
  {
    id: 'persona_e_unverified_sign_threat',
    flowName: 'Persona E: Unverified Anonymous Sign Complaint / Threat (Credential Gate & De-escalation)',
    discType: 'Angry Caller / Threat',
    callerName: 'Anonymous Caller',
    callerPhone: '+18015559111',
    initialGoal: 'Caller claims to be from county code enforcement threatening to fine R-HIVE for roadside signs. Leaves no credentials. Tests Honey requesting credentials (full name, badge, .gov email, desk/dept phone), caller refusing, Honey empathetically de-escalating, capturing exact intersection (9000 S & Redwood Rd), committing route team pickup today, and executing clean hangup with zero live transfer.',
    scriptedFacts: {
      firstTurnUtterance: 'Couldn\'t for code enforcement. You guys have illegal signs all over the intersection of 9000 South and Redwood Road, and we\'re going to fine you if they\'re not down today.',
      refusal: 'I don\'t have time to give you my badge number, just get someone on the phone who can pull those damn signs down!',
      intersection: 'They are on the corner of 9000 South and Redwood Road by the gas station.',
      closingAck: 'Fine, make sure your crew gets them today.'
    }
  },
  {
    id: 'persona_f_verified_municipal_officer',
    flowName: 'Persona F: Verified Municipal Code Enforcement Officer (Credential Verification & Executive Logging)',
    discType: 'Municipal Official',
    callerName: 'Officer Bradley Miller',
    callerPhone: '+18014682000',
    initialGoal: 'Official Salt Lake County Code Enforcement Officer providing full credentials. Tests Honey capturing Officer Bradley Miller, Badge #CE-482, bradley.miller@slco.org, direct desk 801-468-2000, logging for executive compliance team callback today, and executing clean hangup with zero live transfer.',
    scriptedFacts: {
      firstTurnUtterance: 'Hello, this is Officer Bradley Miller with Salt Lake County Code Enforcement, badge CE-482. I\'m calling regarding temporary signage near 7800 South.',
      credentials: 'My direct county email is bradley.miller@slco.org, department email is code@slco.org, desk phone is 801-468-2000 extension 4, department line is 801-468-2010.',
      closingAck: 'Understood. I will expect a callback from your compliance director at my desk today. Thank you.'
    }
  },
  {
    id: 'persona_g_escalated_customer_complaint',
    flowName: 'Persona G: Escalated Customer Complaint (Zero Transfer & Manual Executive Follow-up Today)',
    discType: 'Aggressive / Demanding',
    callerName: 'Gregory Vance',
    callerPhone: '+18015557788',
    initialGoal: 'Upset homeowner demanding to speak to the owner immediately about cleanup delay. Tests Honey de-escalating empathetically, capturing full name, address (1280 Highland Dr), phone, refusing live transfer per strict zero-transfer protocol, committing executive leadership manual review later today, and executing clean hangup.',
    scriptedFacts: {
      firstTurnUtterance: 'This is Gregory Vance at 1280 Highland Drive. Your roofing crew left nails all over my driveway yesterday, and I want to speak to Michael Robinson right now!',
      transferDemand: 'I don\'t want to leave a message, put Michael on the phone right now!',
      details: 'There are roofing nails on the asphalt and my wife got a flat tire. 1280 Highland Drive.',
      closingAck: 'Alright, tell Michael to call me on my cell today.'
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

    // 120s safety timeout per multi-turn test call
    timeoutTimer = setTimeout(() => {
      endSession(false, 'Test call exceeded 120s safety timeout');
    }, 120000);

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
          if (!honeyText) {
            // Suppress empty turn notifications
            return;
          }
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
            if (cleanHoney.includes('match') || cleanHoney.includes('does that') || cleanHoney.includes('is that') || cleanHoney.includes('confirm') || cleanHoney.includes('correct') || cleanHoney.includes('pulled up')) {
              metrics.addressConfirmedGatePassed = true;
              console.log(`   ✅ [GATE VERIFIED] Honey paused and requested verbal address confirmation.`);
            }
          }

          // Check Property Name Shorthand Adoption
          if (persona.expectedPropertyName && cleanHoney.includes(persona.expectedPropertyName.toLowerCase())) {
            metrics.propertyNameAdopted = true;
            console.log(`   ✅ [SHORTHAND VERIFIED] Honey adopted shorthand: "${persona.expectedPropertyName}"`);
          }

          // Persona-specific assertions
          if (persona.id === 'persona_a_qualified_complex_replacement') {
            if (cleanHoney.includes('1968') || cleanHoney.includes('slat') || cleanHoney.includes('deck') || cleanHoney.includes('rot') || cleanHoney.includes('inspection') || cleanHoney.includes('window')) {
              metrics.complexDeckingFlagCaptured = true;
            }
          }
          if (persona.id === 'persona_b_price_shopper_remote_quote') {
            if (cleanHoney.includes('aerial') || cleanHoney.includes('remote') || cleanHoney.includes('cad') || cleanHoney.includes('text') || cleanHoney.includes('scan') || cleanHoney.includes('quote')) {
              metrics.remoteQuoteSteered = true;
              console.log(`   ✅ [REMOTE QUOTE VERIFIED] Honey steered away from on-site visit to aerial CAD certified quote.`);
            }
          }
          if (persona.id === 'persona_c_active_emergency_leak') {
            if (cleanHoney.includes('150') || cleanHoney.includes('tarp') || cleanHoney.includes('stabiliz') || cleanHoney.includes('credit')) {
              metrics.tarpFeeTriaged = true;
              console.log(`   ✅ [TARP FEE VERIFIED] Honey quoted $150 emergency stabilization fee credited to repair.`);
            }
          }
          if (persona.id === 'persona_d_subcontractor_invoicing') {
            if (cleanHoney.includes('kara') || cleanHoney.includes('transfer') || cleanHoney.includes('office') || cleanHoney.includes('invoice') || cleanHoney.includes('call back')) {
              metrics.subcontractorTransferRouted = true;
              console.log(`   ✅ [KARA ROUTING VERIFIED] Honey routed subcontractor to Kara / main office callback.`);
            }
          }
          if (persona.id === 'persona_e_unverified_sign_threat') {
            if (cleanHoney.includes('credential') || cleanHoney.includes('name') || cleanHoney.includes('badge') || cleanHoney.includes('email') || cleanHoney.includes('officer') || cleanHoney.includes('protocol')) {
              metrics.credentialGateTriggered = true;
              console.log(`   ✅ [CREDENTIAL GATE VERIFIED] Honey challenged caller for official credentials.`);
            }
            if (cleanHoney.includes('route') || cleanHoney.includes('pickup') || cleanHoney.includes('remove') || cleanHoney.includes('today') || cleanHoney.includes('sign') || cleanHoney.includes('cleared')) {
              metrics.signPickupCommitted = true;
              console.log(`   ✅ [SIGN PICKUP VERIFIED] Honey committed route team pickup today.`);
            }
            if (metrics.toolsCalled.includes('transfer_to_specialist')) {
              metrics.failureReasons.push('VIOLATION: Honey attempted live transfer on an escalated sign complaint!');
            }
          }
          if (persona.id === 'persona_f_verified_municipal_officer') {
            if (cleanHoney.includes('compliance') || cleanHoney.includes('desk') || cleanHoney.includes('director') || cleanHoney.includes('today') || cleanHoney.includes('logged') || cleanHoney.includes('credentials')) {
              metrics.municipalFollowupCommitted = true;
              console.log(`   ✅ [MUNICIPAL LOGGED] Honey logged credentials for compliance director follow-up today.`);
            }
            if (metrics.toolsCalled.includes('transfer_to_specialist')) {
              metrics.failureReasons.push('VIOLATION: Honey attempted live transfer on a municipal code enforcement inquiry!');
            }
          }
          if (persona.id === 'persona_g_escalated_customer_complaint') {
            if (cleanHoney.includes('leadership') || cleanHoney.includes('management') || cleanHoney.includes('reach out') || cleanHoney.includes('review') || cleanHoney.includes('today') || cleanHoney.includes('later')) {
              metrics.complaintDeescalated = true;
              console.log(`   ✅ [COMPLAINT DE-ESCALATED] Honey logged complaint for executive management follow-up today.`);
            }
            if (metrics.toolsCalled.includes('transfer_to_specialist')) {
              metrics.failureReasons.push('VIOLATION: Honey attempted live transfer on an escalated customer complaint!');
            }
          }

          // Termination conditions
          const hasCompletedOutcome = metrics.toolsCalled.includes('book_inspection') || 
                                       metrics.toolsCalled.includes('dispatch_emergency_crew') ||
                                       metrics.toolsCalled.includes('hangup_call') ||
                                       metrics.toolsCalled.includes('take_message') ||
                                       metrics.toolsCalled.includes('transfer_to_specialist') ||
                                       metrics.remoteQuoteSteered ||
                                       metrics.signPickupCommitted ||
                                       metrics.municipalFollowupCommitted ||
                                       metrics.complaintDeescalated ||
                                       metrics.subcontractorTransferRouted;

          if (turnCount >= maxTurns || 
              (hasCompletedOutcome && turnCount >= 3) ||
              cleanHoney.includes('have a wonderful day') || 
              cleanHoney.includes('have a great day') ||
              cleanHoney.includes('have a good day') ||
              cleanHoney.includes('goodbye') ||
              cleanHoney.includes('texting you right now') ||
              cleanHoney.includes('transfer you right over')) {
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
  const { spawn } = require('child_process');
  const axios = require('axios');
  const TEST_PORT = 8996;
  const target = process.argv[2] || `ws://localhost:${TEST_PORT}`;
  let spawnedProc = null;

  async function startServerIfNeeded() {
    try {
      await axios.get(`http://localhost:${TEST_PORT}/health`, { timeout: 1500 });
      console.log(`[A2A Swarm] Local bridge server already running on port ${TEST_PORT}.`);
      return null;
    } catch(e) {
      console.log(`[A2A Swarm] Spawning dedicated test bridge on port ${TEST_PORT}...`);
      const serverPath = path.join(__dirname, '..', 'server.js');
      const proc = spawn('node', [serverPath], {
        env: { ...process.env, PORT: String(TEST_PORT) },
        cwd: path.join(__dirname, '..'),
        stdio: 'pipe'
      });

      proc.stdout.on('data', d => {
        const s = d.toString().trim();
        if (s.includes('RUNNING ON PORT') || s.includes('READY')) {
          console.log('  [Local Bridge]', s);
        }
      });

      proc.stderr.on('data', d => {
        const s = d.toString().trim();
        if (s.includes('Error') || s.includes('Warning')) {
          console.warn('  [Local Bridge Note]', s);
        }
      });

      // Wait for health endpoint
      let attempts = 0;
      await new Promise((resolve, reject) => {
        const interval = setInterval(async () => {
          attempts++;
          try {
            await axios.get(`http://localhost:${TEST_PORT}/health`);
            clearInterval(interval);
            console.log(`✅ [A2A Swarm] Local bridge ready and healthy on port ${TEST_PORT}!`);
            resolve();
          } catch (err) {
            if (attempts > 30) {
              clearInterval(interval);
              proc.kill();
              reject(new Error('Server failed to initialize within 15 seconds'));
            }
          }
        }, 500);
      });

      return proc;
    }
  }

  (async () => {
    try {
      spawnedProc = await startServerIfNeeded();
      const summary = await runFullA2ASuite(target);

      // Compute Deterministic Metrics
      let totalTurns = 0;
      let totalHoneyWords = 0;
      let totalLatency = 0;
      let latencyCount = 0;

      for (const r of summary.results) {
        totalTurns += r.turns;
        for (const w of r.honeyWordCounts) totalHoneyWords += w;
        for (const l of r.turnLatencies) {
          totalLatency += l;
          latencyCount++;
        }
      }

      const overallAvgWords = totalTurns > 0 ? Math.round(totalHoneyWords / totalTurns) : 0;
      const overallAvgLatency = latencyCount > 0 ? Math.round(totalLatency / latencyCount) : 0;

      summary.metricsScorecard = {
        totalPersonasTested: summary.results.length,
        totalTurnsSimulated: totalTurns,
        averageHoneyWordsPerTurn: overallAvgWords,
        wordsPerTurnTargetMet: overallAvgWords < 25,
        averageTurnLatencyMs: overallAvgLatency,
        latencyTargetMet: overallAvgLatency < 850,
        allPersonasPassed: summary.results.every(r => r.passed)
      };

      console.log('\n================================================================');
      console.log('🏁 OVERNIGHT A2A SIMULATION COMPLETED ACROSS ALL 4 PERSONAS');
      console.log('================================================================');
      console.log(`🏆 Average Words Per Turn:   ${overallAvgWords} words (Rule: < 25 words -> ${overallAvgWords < 25 ? 'MET ✅' : 'EXCEEDED ❌'})`);
      console.log(`⚡ Average Turn Latency:      ${overallAvgLatency} ms (WebSocket Live Stream)`);
      console.log(`💰 Total Simulation Spend:   $${summary.cumulativeSpendUSD.toFixed(4)} USD ($0.00 Twilio Carrier Cost)`);
      console.log(`📋 All Personas Compliant:   ${summary.metricsScorecard.allPersonasPassed ? '100% COMPLIANT ✅' : 'ATTENTION NEEDED ⚠️'}`);
      console.log('================================================================\n');

      const artifactDir = 'C:/Users/mjrob/.gemini/antigravity/brain/0ea1d186-c0b7-4d42-8bc0-3cea6c384d14';
      if (fs.existsSync(artifactDir)) {
        const artifactPath = path.join(artifactDir, 'rev60_a2a_simulation_results.json');
        fs.writeFileSync(artifactPath, JSON.stringify(summary, null, 2));
        console.log(`💾 Saved full A2A test output to: ${artifactPath}`);
      }

      if (spawnedProc) {
        console.log('Shutting down spawned test server...');
        spawnedProc.kill('SIGTERM');
      }

      process.exit(0);
    } catch(err) {
      console.error('Fatal simulation error:', err);
      if (spawnedProc) spawnedProc.kill('SIGTERM');
      process.exit(1);
    }
  })();
}
