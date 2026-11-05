/**
 * ============================================================================
 * RHIVE TELEPHONY V6.1 - AVALON-STYLE WASATCH GRID & ROOFING PHONETIC LEXICON
 * + GOOGLE ADK MODULAR SPECIALIST SUB-AGENT MANIFESTS
 * ============================================================================
 * Sub-millisecond domain homophone correction for Utah street coordinates,
 * Wasatch Front municipalities, roofing systems, and trade partners, plus
 * IPA-anchored vocal token ("R-hive" / "R-hive's" /ˈɑɹˌhaɪvz/) -> written brand ("R-HIVE") mapping.
 */

const LEXICON_REPLACEMENTS = [
  // 1. Brand Phonetics ("R-hive" / "R-hive's" vocal token -> crisp "R-HIVE" written transcript)
  { pattern: /\b(?:r[\s-]+hive'?s|are[\s-]+hive'?s|arhive'?s|archive'?s|rive'?s|rye[\s-]*hive'?s|ry[\s-]*hive'?s|re[\s-]*hive'?s)(?=\s+(?:ai\s+roof(?:ing)?|roof(?:ing)?|construction|project|specialist|team|certified))/gi, replacement: "R-HIVE's" },
  { pattern: /\bai\s+roofing\s+specialist\b/gi, replacement: 'AI Roof Specialist' },
  { pattern: /\b(?:arhive|archive|r[\s-]+hive|are[\s-]+hive|rye[\s-]*hive|ry[\s-]*hive|re[\s-]*hive)\s+(?:roofing|construction)\b/gi, replacement: 'R-HIVE Construction' },
  { pattern: /\b(?:r-hive's|are[\s-]+hive'?s)\b/gi, replacement: "R-HIVE's" },
  { pattern: /\b(?:r-hive|are[\s-]+hive|arhive|rye[\s-]*hive|ry[\s-]*hive|re[\s-]*hive)\b/gi, replacement: 'R-HIVE' },

  // 2. Roofing Materials & Engineering Systems
  { pattern: /\b(?:owens|owen'?s|owns)\s+(?:corning|cornering)\s+duration\s+flex\b/gi, replacement: 'Owens Corning Duration FLEX' },
  { pattern: /\b(?:owens|owen'?s|owns)\s+(?:corning|cornering)\s+duration\b/gi, replacement: 'Owens Corning Duration' },
  { pattern: /\b(?:owens|owen'?s|owns)\s+(?:corning|cornering)\b/gi, replacement: 'Owens Corning' },
  { pattern: /\b(?:sure[\s-]*nail|shore[\s-]*nail|shure[\s-]*nail|sheer[\s-]*nail)\b/gi, replacement: 'SureNail' },
  { pattern: /\b(?:t\.?\s*p\.?\s*o\.?|tee\s+pee\s+oh)\s+(?:membrane|roof|roofing|flat\s+roof)?\b/gi, replacement: (m) => m.toLowerCase().includes('membrane') ? 'TPO membrane' : (m.toLowerCase().includes('roof') ? 'TPO roof' : 'TPO') },
  { pattern: /\be\.?\s*p\.?\s*d\.?\s*m\.?\b/gi, replacement: 'EPDM' },
  { pattern: /\bice\s+(?:and|&|n)\s+water\s+shield\b/gi, replacement: 'ice and water shield' },
  { pattern: /\bcounter\s+flashing\b/gi, replacement: 'counter-flashing' },
  { pattern: /\bdrip[\s-]+edge\b/gi, replacement: 'drip edge' },
  { pattern: /\bridge[\s-]+vent\b/gi, replacement: 'ridge vent' },
  { pattern: /\b(?:saw\s*fit|soft\s*it)\b/gi, replacement: 'soffit' },
  { pattern: /\b(?:face\s*ya|fay\s*sha)\b/gi, replacement: 'fascia' },

  // 3. Wasatch Front Cities, Canyons & Street Grid Homophones
  { pattern: /\b(?:gentle|genteel)\s+(?:st|street|rd|road)\b/gi, replacement: 'Gentile Street' },
  { pattern: /\b(?:too\s*illa|tuesday\s*la|twilla|to\s*willa|tooele)\b/gi, replacement: 'Tooele' },
  { pattern: /\b(?:oak\s*er|oh\s*ker|oquirrh)\b/gi, replacement: 'Oquirrh' },
  { pattern: /\b(?:wah\s*satch|watch\s*atch|wasatch)\b/gi, replacement: 'Wasatch' },
  { pattern: /\b(?:holiday)\s*,\s*(?:ut|utah)\b/gi, replacement: 'Holladay, UT' },
  { pattern: /\b(?:lee\s*high)\b/gi, replacement: 'Lehi' },
  { pattern: /\b(?:bountiful)\b/gi, replacement: 'Bountiful' },

  // 4. Trade Partners & Executive Names
  { pattern: /\bu\.?\s*n\.?\s*p\.?\s*h\.?\s*c\.?\b/gi, replacement: 'UNPHC' },
  { pattern: /\ba\.?\s*b\.?\s*c\.?\s+supply\b/gi, replacement: 'ABC Supply' },
  { pattern: /\bs\.?\s*r\.?\s*s\.?\s+distribution\b/gi, replacement: 'SRS Distribution' }
];

function normalizeRoofingTranscript(input) {
  if (!input || typeof input !== 'string') return input || '';
  let out = input;
  for (const rule of LEXICON_REPLACEMENTS) {
    if (rule.pattern.test(out)) {
      rule.pattern.lastIndex = 0;
      out = out.replace(rule.pattern, rule.replacement);
    }
    rule.pattern.lastIndex = 0;
  }
  return out;
}

function normalizeRoofingWithReport(input) {
  const raw = String(input || '');
  let out = raw;
  const corrections = [];
  for (const rule of LEXICON_REPLACEMENTS) {
    rule.pattern.lastIndex = 0;
    const matches = out.match(rule.pattern);
    if (matches && matches.length > 0) {
      const next = out.replace(rule.pattern, rule.replacement);
      if (next !== out) {
        corrections.push({ matched: matches[0], normalizedTo: typeof rule.replacement === 'string' ? rule.replacement : 'TPO' });
        out = next;
      }
    }
    rule.pattern.lastIndex = 0;
  }
  return {
    original: raw,
    normalized: out,
    changed: out !== raw,
    corrections
  };
}

// Google ADK transferAgent-style Specialist Sub-Agent Manifests (Zero-Drop Mid-Call Context Specialization)
const SPECIALIST_SUBAGENTS = {
  intake_greeter: {
    id: 'intake_greeter',
    title: 'Front-Desk AI Roof Specialist',
    focus: 'Sub-20-word warm greeting ("R-hive\'s AI Roof Specialist" /ˈɑɹˌhaɪvz/), rapid caller intent classification, and zero-friction routing.',
    directive: 'Keep turns <= 18 words, pronounce "R-hive" (/ˈɑɹˌhaɪv/) and "R-hive\'s" (/ˈɑɹˌhaɪvz/) crisply (never "rive"), use official title "AI Roof Specialist", classify caller intent within 1 turn, and transition seamlessly into estimator, emergency storm, or commercial/AP-AR specialist focus.'
  },
  residential_storm_estimator: {
    id: 'residential_storm_estimator',
    title: 'Residential & Owens Corning Certified Quote Specialist',
    focus: 'Utah Grid GIS verification, Owens Corning Duration / SureNail 130-MPH wind protection, and remote aerial quote intake.',
    directive: 'Verify first name spelling first, read back address digit-by-digit via verify_address (NON_BLOCKING), never ask preferred material, never speak slat-deck dollar figures aloud, and complete MeasureCall intake by voice.'
  },
  emergency_leak_dispatch: {
    id: 'emergency_leak_dispatch',
    title: 'Rapid-Response Leak & Tarping Triage Specialist',
    focus: 'Immediate reassurance, active interior water intrusion triage, and 3-hour rapid tarping mobilization ($150 credited 100% toward repair or covered by insurance mitigation).',
    directive: 'Lead with calm urgency, never pitch shingle upgrades on active leaks, verify exact property address first, state insurance mitigation or $150 100%-credited mobilization, and invoke dispatch_emergency_crew.'
  },
  commercial_ap_ar: {
    id: 'commercial_ap_ar',
    title: 'Commercial Flat-Roof & Trade Accounting Coordinator',
    focus: 'TPO/EPDM commercial properties, HOA/GC bids, and supplier/invoice transfers (UNPHC, ABC Supply, Beacon) to Operations & Accounting.',
    directive: 'Capture caller full name, company, and PO/invoice reference once without repeating questions, never name-drop executives before answer, update_caller_profile silently, and execute screened whisper transfer_to_specialist.'
  }
};

const NON_BLOCKING_TOOL_SCHEDULING = {
  update_caller_profile: 'SILENT',
  switch_specialist_subagent: 'SILENT',
  verify_address: 'WHEN_IDLE',
  get_available_windows: 'WHEN_IDLE',
  check_specialist_availability: 'WHEN_IDLE',
  send_quote_verification_sms: 'WHEN_IDLE',
  send_photo_upload_sms: 'WHEN_IDLE',
  send_ballpark_sms: 'WHEN_IDLE'
};

module.exports = {
  normalizeRoofingTranscript,
  normalizeRoofingWithReport,
  SPECIALIST_SUBAGENTS,
  NON_BLOCKING_TOOL_SCHEDULING
};
