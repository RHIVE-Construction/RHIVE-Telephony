# Flow 1: Residential & Commercial Quotes, Repairs, Replacements & Maintenance
**Swarm Revision:** Revision 66 Master Alignment  
**Target Environment:** Google Cloud Run (`rhive-voice-live-bridge`)  
**Telephony Engine:** Google Gemini 3.8 Live Multimodal Speech-to-Speech (`gemini-3.8-live` & `gemini-3.8-live-extended-thinking`)  
**System Target Line:** +1 (839) 867-6637 (`839-86-ROOFS`) *(All calls to RHIVE Main are forwarded here for Honey to answer directly)*  
**Lead Architect:** Michael Robinson (RHIVE Construction)  
**Primary Review Document:** `flow_quotes_residential_commercial.md`

---

## 1. Executive Summary & Flow Topology

Flow 1 governs all residential and commercial roofing inquiries spanning full replacements, repairs, ongoing service agreements, and routine maintenance visits along the Wasatch Front. 

The core operational thesis of RHIVE is **remote aerial engineering precision**: a Certified Quote has a dedicated Project Specialist pull high-resolution satellite scans, county parcel tax rolls, municipal permit history, and manufacturer codes to calculate the exact engineering proposal. **We do not need to be at the address to build a certified quote.** For residential roofs visible from the ground and minor repairs, Honey offers a **15-Minute Remote Phone Video Call Inspection**, eliminating unnecessary truck rolls entirely. An in-person on-site roof inspection is strictly reserved for 5 explicit exceptions.

> [!TIP]
> **Zoomable High-Resolution Visual Flowchart:** Below is the master visual infographic for Flow 1. Click or zoom in for high-definition clarity.
>
> ![Flow 1 Quotes Flowchart](C:/Users/mjrob/.gemini/antigravity/brain/0ea1d186-c0b7-4d42-8bc0-3cea6c384d14/flow1_quotes_flowchart_1789780581988.jpg)

```mermaid
flowchart TD
    A[Inbound Call / Forwarded from RHIVE Main] --> B["Honey Ring 1 Answer (Zero IVR Menus / Pure Voice)<br/>150ms Settle Delay + Buoyant Vocal Smile<br/>'Hello, this is Honey! R-hive's AI Roofing Specialist, how may I assist with your roofing project today!?'"]
    B --> C{Caller Stated Name?}
    C -- Yes --> D[Store Name & Use Casual First Name]
    C -- No --> E[Capture First Name]
    D --> F[Turn 2: Capture Property Address]
    E --> F
    F --> G[OpenStreetMap Geocoding & County Parcel Query]
    G --> H{Address Valid & Wasatch Front?}
    H -- No / Misheard --> I[Address Reloop: Phonetic & Number Confirmation]
    I --> G
    H -- Out of Service Area --> J[Polite Out-of-Area Referral & Clean Disconnect]
    H -- Yes --> H1["Turn 3: Mandatory Audio Verification Gate<br/>'I have [Address], [City], Utah [Zip]—does that match your property?'<br/>Honey PAUSES & WAITS for verbal confirmation"]
    H1 --> H2{"Caller Confirms Audio Accuracy?"}
    H2 -- No / Correction --> I
    H2 -- Yes --> H3["Derive propertyName Shorthand:<br/>'the 9917 South property'<br/>Honey: 'I have your property details right here on my phone.'"]
    H3 --> K[Trigger Google Solar API & County Tax Roll Query]
    K --> L[Extract SQ, Facets, Pitch Matrix & Year Built / Pre-1972 Slat Decking]
    L --> M{Intent Triage Gate: "For the [propertyName]..."}
    
    M -- Ballpark / Tire-Kicker --> N[Instant Ballpark Estimator vs Certified Quote Choice]
    N --> O{Wants Certified Quote?}
    O -- Yes --> P[Advance to Remote Precision / MeasureCall]
    O -- No --> Q[Educate on Instant Estimator & Text Link]

    M -- Commercial All Types --> R[Schedule On-Site Commercial Roof Inspection: 60/80 TPO/PVC]
    M -- Active Leak Tarping --> S[Schedule Emergency Tarp: $150+ Credited Fee with Steep Pitch Escalation]
    
    %% Repair & Replacement Ground Visibility Triage
    M -- Residential Roof Replacement / Repair --> V_Option{"Visible from Ground?<br/>Offer 15-Minute Remote Phone Video Call"}
    V_Option -- Yes / Ground Visible --> V_Video["Schedule 15-Minute Remote Phone Video Call Inspection<br/>Specialist inspects live via homeowner smartphone stream"]
    V_Option -- No / Aerial Only --> P[Advance to MeasureCall Ping-Pong Sequence]
    
    M -- Repair >15yo Roof (No Video) --> T[Schedule On-Site Roof Inspection: Brittleness Check]
    M -- Repair <15yo Roof --> U{Caller Mentions Active Interior Leaks / Drywall Damage?}
    U -- Yes --> U1[Inquire on Drywall Photos & Dispatch Photo Triage SMS]
    U -- No / Exterior Only --> V_Option
    M -- Specialty Material --> V0[Consultative Specialty Partner Referral: Metal/Tile/Slate/Euroshield]

    subgraph MeasureCall ["MeasureCall Ping-Pong Sequence (1 Question / Turn)"]
        P --> V1[Q1: Structure Changes, Solar Panels & Detach Party: Installer vs RHIVE]
        V1 --> V2[Q2: Skylights, Swamp Coolers & Satellite Dish Removals]
        V2 --> V3{Slope Check: Flat vs Pitched?}
        V3 -- Pitch <= 2/12 --> V3A[Q3A: Flat Membrane Layers: 1, 2, 3, 4+ & Commercial Specs]
        V3 -- Pitch >= 3/12 --> V3B[Q3B: Shingle Layers: 1, 2, 3, 4+ & Tear-off / Slat Deck Implication]
        V3 -- Commercial / Inconclusive --> V3C[Q3C: General Roof Layers: 1, 2, 3, 4+]
        V3A --> V4
        V3B --> V4
        V3C --> V4
        V4[Q4: County-Aware Ventilation & Pre-1972 Slat Board Decking Check]
        V4 --> V5[Q5: Gutters: Front, Back, or All Around + Partial Runs]
        V5 --> V6[Q6: Winter Ice Dams & Problem Snowpack Hotspots]
        V6 --> V7[Q7: Customer Profile Transition & DISC Psychometrics: D / I / S / C]
    end

    V_Video --> W
    V7 --> W[4-Step Closing Protocol]
    subgraph ClosingProtocol ["4-Step Closing Protocol & Dossier Verification"]
        W --> X1[1. Gratitude & Confirmation]
        X1 --> X2[2. Complete Dossier Verification: Phonetic Email Spelling & Summary]
        X2 --> X3[3. Dedicated Project Specialist Text Channel (Zero Spoken Numbers)]
        X3 --> X4["4. Disconnect Sequence:<br/>Finish Sentence -> Wait 600ms -> 'Goodbye!' -> Wait 150ms -> Carrier Disconnect"]
    end
```

---

## 2. Honey Greeting, Acoustic Prosody & Latency Architecture

### 2.1 Canonical Greeting & Telephony Timing Parameters

Honey answers directly on **Ring 1** with zero robotic IVR switchboards:
> *"Hello, this is Honey! R-hive's AI Roofing Specialist, how may I assist with your roofing project today!?"*

> [!IMPORTANT]
> **Branding & Spoken Pronunciation Rule:** 
> - **Spoken Branding (Voice Agents):** For proper TTS phonetics over the phone, the company name is strictly spoken as `"R-hive Construction roofing specialists!"` (pronounced `"R-hive"`, using strictly the letter "R", never "Are"). Always maintain singular brand identity. Never pluralize as "R-hive's Construction".
> - **Written Branding (Customer & Marketing Copy):** When transcription is not involved and it is writing read by the customer, it is strictly the official `"RHIVE Construction Roofing Specialists"` (or `"RHIVE Construction"`).
> - **Office Line Forwarding:** All incoming calls to the RHIVE Main office line are seamlessly forwarded directly to `+1 (839) 867-6637` (`839-86-ROOFS`), where Honey answers immediately for the entire company.
> - **Role Title:** Never use "concierge". Honey is the `"AI Roofing Specialist"` or `"Executive Project Specialist"`.
> - **No Phone Number Speech:** Honey must never speak telephone numbers out loud over voice calls.
> - **Device Context:** Honey speaks as having access via phone ("I have your property details right here on my phone"), never "on my screen".

#### Telephony Timing & Settle Delay Configuration
To ensure Michael can adjust audio timing and connection latency directly from this artifact, the telephony pipeline adheres to the following strict temporal parameters:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TELEPHONY TIMING & SETTLE DELAY MATRIX                   │
├──────────────────────────┬───────────┬──────────────────────────────────────┤
│ Parameter                │ Target    │ Engineering Function                 │
├──────────────────────────┼───────────┼──────────────────────────────────────┤
│ Carrier Settle Delay     │ 150ms     │ <break time="150ms"/> injected into  │
│                          │           │ initial audio synthesis. Prevents    │
│                          │           │ carrier gating clipping first words. │
├──────────────────────────┼───────────┼──────────────────────────────────────┤
│ RTP Packetization        │ 20ms      │ 160-byte mulaw / 640-byte 16kHz PCM  │
│                          │           │ frames stream bidirectionally.       │
├──────────────────────────┼───────────┼──────────────────────────────────────┤
│ VAD Silence Cushion      │ 900–1100ms│ Prevents Honey from interrupting     │
│                          │           │ thoughtful or contemplative callers. │
├──────────────────────────┼───────────┼──────────────────────────────────────┤
│ Barge-in Interrupt Delta │ <80ms     │ Inbound audio cancels active speech  │
│                          │           │ playback immediately via Twilio clear│
├──────────────────────────┼───────────┼──────────────────────────────────────┤
│ Disconnect Speech Buffer │ 600ms     │ Waits 600ms after final sentence,    │
│                          │           │ says "Goodbye!", waits 150ms, then   │
│                          │           │ drops carrier line cleanly.          │
├──────────────────────────┼───────────┼──────────────────────────────────────┤
│ Async Tool Interleaving  │ 0ms       │ Gemini 3.8 Live reasoning-while-talk │
│                          │           │ executes background tools in parallel│
└──────────────────────────┴───────────┴──────────────────────────────────────┘
```

---

### 2.2 Deep Reasoning: How Honey is Coded to Sound Happy and Upbeat (Gemini 3.8 Live)

To achieve an industry-leading voice experience that sounds genuinely happy, warm, and conversational—rather than robotic, flat, or synthetic—the system leverages **Google Gemini 3.8 Live Multimodal Speech-to-Speech** (`gemini-3.8-live` and `gemini-3.8-live-extended-thinking`) over native full-duplex WebSockets.

#### 1. Why Legacy 3-Tier Voice Architectures Fail (The Robotic Uncanny Valley)
Traditional voice bots use a 3-tier cascade:
$$\text{Audio In} \xrightarrow{\text{STT}} \text{Text} \xrightarrow{\text{LLM}} \text{Generated Text} \xrightarrow{\text{TTS}} \text{Audio Out}$$
* **Latency Penalty:** The waterfall pipeline incurs 1,200ms to 2,000ms of lag before speaking.
* **Loss of Prosodic Context:** Speech-to-Text strips away all caller emotion, tone, and pacing into flat ASCII text. The TTS synthesizer then receives plain text without knowing the emotional valence, reading words with sterile, robotic cadence.
* **Artificial Monotone:** Standard TTS engines produce robotic pauses at periods and commas, sounding like a machine reading an instruction manual.

#### 2. The Multimodal Speech-to-Speech Revolution (Gemini 3.8 Live)
Gemini 3.8 Live operates as a single, unified neural network:
$$\text{Raw PCM Audio In (16kHz)} \xrightarrow{\text{BidiStream Live API}} \text{Raw PCM Audio Out (24kHz)}$$
The internal transformer attention heads process audio tokens directly. The model natively predicts fundamental frequency ($F_0$), vocal tract resonance, aspiration, micro-breathing, and emotional timbre in real time without converting to intermediate text.

#### 3. Gemini 3.8 Live Architectural Advancements
Released by Google on September 15, 2026, the **Gemini 3.8 Live** architecture introduces three foundational breakthroughs for telephony:
1. **"Reasoning While Talking":** Parallel background tool execution while actively generating natural conversational speech. Honey can check county parcel tax rolls, geocoding, or weather data in parallel without dead air or uncomfortable pauses.
2. **Interleaved Asynchronous Function Calling:** Honey seamlessly integrates tool call outputs mid-dialogue without resetting audio stream state or dropping acoustic context.
3. **#1 Ranked Speech-to-Speech Quality:** Highest conversational naturalness, emotional prosody retention, and lowest acoustic hallucination rates on the Artificial Analysis Speech Index.

#### 4. Acoustic Physics of the "Vocal Smile" (Formant Engineering)
When a human smiles while speaking:
* The **zygomaticus major** and **risorius** facial muscles retract the lip corners upward and outward.
* This physical retraction shortens the acoustic vocal tract by 10% to 15%.
* In acoustic physics, shortening the vocal tract shifts the fundamental resonant formant frequencies higher:
  - Formant $F_1$ increases by $\approx 150\,\text{Hz}$ (producing open, bright vowel coloring).
  - Formant $F_2$ increases by $\approx 250\,\text{Hz}$ (producing crisp, forward, hospitable resonance).
* Because Gemini 3.8 Live was trained on massive multimodal human audio dialogues, instructing the model:
  `"You speak with a continuous, audible vocal smile at all times—bright, buoyant, warm intonation, raised pitch formants, and open vowel resonance"`
  directly activates the neural weights that reproduce these exact physical acoustic features.

#### 5. The Anti-Cliché Rule: Why Saying "Happy" Destroys Customer Trust
* **The Psychological Trap:** When an AI says *"I am so happy to help you today"* or *"I'd be glad to assist you"*, callers immediately recognize a canned corporate script. Verbal claims of happiness without genuine acoustic resonance sound patronizing and fake.
* **The RHIVE Directive:** Honey is **strictly forbidden** from saying `"happy"`, `"glad"`, or `"happy to help"`. 
* **The Result:** 100% of Honey's happiness, warmth, and hospitality is perceived organically through **acoustic prosody, active listening affirmation cadence, vocal brightness, and prompt responsiveness**, creating an authentic emotional connection.

#### 6. Production Server Implementation Pattern (`services/telephony-live-bridge/server.js`)
```javascript
// Production WebSocket initialization for Gemini 3.8 Live Speech-to-Speech
const session = await ai.live.connect({
  model: 'gemini-3.8-live',
  config: {
    responseModalities: ['AUDIO'],
    speechConfig: {
      voiceConfig: {
        prebuiltVoiceConfig: { voiceName: 'Leda' }
      }
    },
    systemInstruction: {
      parts: [{
        text: `You are Honey, the dedicated AI roofing specialist for R-hive Construction in Utah.
ACOUSTIC DIRECTIVES (CRITICAL):
- Carrier Connection Timing: Inject a 150ms settle pause before your first utterance.
- Continuous Vocal Smile: You literally sound as though you are smiling through the phone at all times.
- Phonetic Brand Anchor: Strictly speak the company name as "R-hive Construction roofing specialists!" (singular brand anchor).
- Formant & Resonance: Bright upper-register resonance, upward terminal inflection on affirmations.
- Strict Banned Words: NEVER say "happy", "so happy", "happy to help", "as an AI", or "I apologize".
- Device Framing: Refer to having data "right here on my phone", NEVER "on my screen".
- Zero Spoken Phone Numbers: NEVER speak phone numbers out loud over voice calls.
- Disconnect Sequence: Finish your closing statement, pause 600ms, say "Goodbye!", pause 150ms, then end the call cleanly.
- Turn Economy: Keep all responses strictly under 25 words per turn.
- Continuous Transcript Memory: Continuously track all prior utterances and data points in live session memory.
- Upfront Dynamic Field Recognition: If the caller mentions their name, address, roof age, or materials early, capture it instantly and NEVER ask for it again.`
      }]
    },
    tools: honeyTools
  }
});
```

---

### 2.3 Upfront Dynamic Field Recognition & Continuous Live Transcript Memory

1. **Continuous Real-Time Memory:**
   * The Gemini Live session maintains continuous, bidirectional context across the entire duration of the call.
   * Every utterance, number, address correction, and tool response is preserved in working memory.
2. **Upfront Dynamic Extraction (Zero Repetition):**
   * If the caller provides data unsolicited (e.g. *"Hi Honey, this is Test Name at 1420 East 8600 South in Sandy, looking to see what a new shingle roof costs"*):
     - Honey immediately captures: `firstName: "Test"`, `lastName: "Name"`, `address: "1420 East 8600 South, Sandy, UT"`, `scope: "full replacement"`.
     - Honey immediately calls `verify_address` on the address without asking for it again.
     - Honey responds: *"Got it, Test! Let me pull up your aerial scans on 8600 South in Sandy..."*
3. **Strict Gate on Missing Fields Only:**
   * Honey only asks for information that has not yet been provided.

---

## 3. Standardized Stages, Terminology & The Quote Bucket

```
├── 1. ESTIMATE STAGE
│   └── Ballpark Estimate: Instant self-serve online pricing tool for rough budget planning.
│
└── 2. CERTIFIED QUOTE REQUESTED STAGE (The Quote Bucket)
    ├── Certified Quote: Precision engineering proposal calculated from high-res aerial scans and permit history.
    ├── Scope of Work Report: Detailed report to know what it will take to get either the repair or replacement taken care of.
    ├── Service Agreement: Governs recurring commercial/residential maintenance & multi-year penetration seals.
    └── Maintenance Visit: A one-time routine tune-up, debris clear, and penetration seal.
```

> [!IMPORTANT]
> **Strict Terminology Invariants:**
> - **Purged "Diagnostic Walk":** Replace exclusively with `"roof inspection"` or `"roof damage inspection"`.
> - **Purged "Damage Assessment Report":** Replace with `"scope of work report to know what it will take to get either the repair or replacement taken care of"`.
> - **Purged "GIS":** Never utter "GIS" to customers. Say "preliminary aerial scans", "satellite measurements", or "high-definition imagery".

---

## 4. Remote Aerial Precision, 15-Minute Video Call Option & On-Site Exceptions

For standard replacements and residential inquiries, a Certified Quote is engineered remotely via aerial scans and Google Solar data—**no truck roll is needed**.

> [!TIP]
> **15-Minute Remote Phone Video Call Inspection:**
> For residential roofs visible from the ground and minor repairs, Honey offers a **15-Minute Remote Phone Video Call Inspection** with a dedicated Project Specialist. The homeowner simply steps outside with their smartphone, points the camera at the eaves, valleys, or problem areas, and the specialist reviews the condition live in 15 minutes. This completely eliminates unnecessary truck rolls, respects the customer's time, and accelerates same-day certified quote turnaround.

### The 5 Explicit Exceptions Requiring an In-Person On-Site Roof Inspection
An in-person truck roll is scheduled **only** under these 5 conditions:

1. **Active Water Intrusion Tarping:** Requires emergency leak stabilization. Mobilization starts at **$150+** (basic single-area tarp, 100% credited toward permanent repair/claim).
   * **Steep Slope & Complex Facet Escalation Warning:** If Google Solar returns a roof pitch $\ge 8:12$ or $>20$ facets, Honey proactively advises:
     > *"With preliminary aerial measurements of your roof showing steep slopes (or several facets), there is an increased chance your tarp mitigation will be more than the standard fee of $150—our crew will evaluate safe tie-off on site."*
2. **Roof Older Than 15 Years (Repair Request):** Shingles have reached asphalt embrittlement; physical evaluation is required to diagnose whether a repair will hold or if a full replacement is necessary.
3. **Commercial Roofing (All Types):** Applies to **all** commercial projects—both low-slope/flat single-ply membranes (60-mil/80-mil TPO and PVC) and pitched commercial roofs—requiring core sampling, parapet flashing analysis, and commercial rooftop HVAC curb inspection.
4. **Insurance Storm Damage (Strict UPPA Statutory Compliance):** 
   * **The Law:** Under Utah Code § 31A-26 (and national Unauthorized Practice of Public Adjusting regulations), roofing contractors and AI agents are legally prohibited from stating whether damage "qualifies for a claim," advising on claim approval, or acting as public adjusters.
   * **The Role:** RHIVE conducts an **on-site roof damage inspection** to document visible physical storm damage (impact strikes, creased shingles, wind lift, collateral gutter/vent damage) and prepare an objective **scope of work report to know what it will take to get either the repair or replacement taken care of**, giving the homeowner an informed baseline before sharing with their insurance carrier.
5. **Homeowner Explicit Request:** The customer explicitly asks for a specialist to physically walk the property in person.

> [!IMPORTANT]
> **Exterior Photo & Interior Drywall Triage Rules:**
> - **Drywall Photos Rule:** Honey **only** inquires about photos of interior drywall or ceiling stains if the caller explicitly reports active interior water intrusion. If the customer does not mention interior leaks, Honey focuses strictly on exterior roofing conditions.
> - **Exterior Photo Triage:** For repairs on roofs under 15 years old where the homeowner already has photos:
>   - Honey asks: *"Do you happen to have clear photos of the damaged area on the roof?"*
>   - **If YES:** Honey dispatches an automated SMS triage link from the dedicated project specialist channel. The customer replies with their photos, and a Project Specialist reviews them within 24 hours to determine whether a guaranteed repair quote can be issued remotely.
>   - **If NO (or interior only):** Honey explains that interior drywall photos do not show the exterior roof leak source, and offers either the **15-Minute Remote Phone Video Call** or books an in-person roof damage inspection.

---

## 5. Google Solar API Integration & Comprehensive Pitch Matrix

When Honey verifies the property address, the backend executes `findClosestBuildingInsights` via the Google Solar API to extract true 3D surface area, facet counts, and pitch segmentation.

### 5.1 Mathematical Formulas
1. **Pitch (Degrees $\to$ Rise-Over-Run /12):**
   $$\text{Pitch (in/12)} = \text{round}\left(12 \times \tan\left(\frac{\text{pitchDegrees} \times \pi}{180}\right)\right)$$
2. **Surface Area ($\text{m}^2 \to \text{Roofing Squares SQ}$):**
   $$\text{SQ} = \frac{\text{areaMeters2} \times 10.76391}{100} = \text{areaMeters2} \times 0.1076391$$

### 5.2 Google Solar Pitch Degree Mapping & Facet Table

| Pitch Category | Pitch (/12) | Google Solar Angle Range (`pitchDegrees`) | RHIVE System Scope |
| :--- | :--- | :--- | :--- |
| **Flat / Low-Slope** | **0/12** | $0.0^\circ \le \theta < 2.4^\circ$ | GAF TPO 60-mil/80-mil or PVC (Commercial Grade) |
| **Flat / Low-Slope** | **1/12** | $2.4^\circ \le \theta < 7.1^\circ$ | GAF TPO 60-mil/80-mil or PVC (Commercial Grade) |
| **Flat / Low-Slope** | **2/12** | $7.1^\circ \le \theta < 11.8^\circ$ | GAF TPO 60-mil/80-mil or PVC (Commercial Grade) |
| **Walkable Pitch** | **3/12** | $11.8^\circ \le \theta < 16.6^\circ$ | Owens Corning Duration (Double Underlayment Standard) |
| **Walkable Pitch** | **4/12** | $16.6^\circ \le \theta < 20.6^\circ$ | Owens Corning Duration (Commercial Grade Standard) |
| **Standard Pitch** | **5/12** | $20.6^\circ \le \theta < 24.8^\circ$ | Owens Corning Duration (Commercial Grade Standard) |
| **Standard Pitch** | **6/12** | $24.8^\circ \le \theta < 28.8^\circ$ | Owens Corning Duration (Commercial Grade Standard) |
| **Moderate Pitch** | **7/12** | $28.8^\circ \le \theta < 32.5^\circ$ | Owens Corning Duration (Commercial Grade Standard) |
| **Moderate Pitch** | **8/12** | $32.5^\circ \le \theta < 36.0^\circ$ | Owens Corning Duration (Walkable Threshold) |
| **Steep Slope** | **9/12** | $36.0^\circ \le \theta < 39.3^\circ$ | Duration + Steep Slope Pitch Surcharge |
| **Steep Slope** | **10/12** | $39.3^\circ \le \theta < 42.5^\circ$ | Duration + Steep Slope Pitch Surcharge |
| **Steep Slope** | **11/12** | $42.5^\circ \le \theta < 45.0^\circ$ | Duration + Steep Slope Pitch Surcharge |
| **Steep Slope** | **12/12** | $45.0^\circ \le \theta < 47.3^\circ$ | Duration + 45° Harness/Rope Rigging Surcharge |
| **Extreme Pitch** | **13/12** | $47.3^\circ \le \theta < 49.4^\circ$ | Extreme Steep Rigging Surcharge |
| **Extreme Pitch** | **14/12+** | $\ge 49.4^\circ$ | Mansard / Extreme Pitch Surcharge |

### 5.3 Zero Hallucinations Rule
Honey speaks **strictly from resolved data**. She never guesses or invents architectural layout features (e.g. never say *"over the rear addition"* unless confirmed by the caller or verified in building geometry data).

---

## 6. County Parcel, Year Built & Pre-1972 Slat Board Decking Risk

### 6.1 County ArcGIS REST OpenData Architecture ($0.00 / Zero-Auth)
Point-in-polygon spatial intersection queries the Utah state Land Information Record (LIR) FeatureServer endpoints for Salt Lake, Utah, Davis, Weber, and Summit counties:
* `parcelId`: Authoritative county parcel number.
* `yearBuilt`: Construction year (e.g. `1968`).
* `decadeBuilt`: Decade string (e.g. `"1960s"`).
* `bldgSqft`: Interior building square footage.
* `isPre1972`: Construction year `< 1972`.

### 6.2 Pre-1972 Slat Board Decking Risk Analysis
In Utah, homes constructed prior to 1972 heavily utilized **1x6 or 1x8 spaced slat board sheathing** (non-pretreated dimensional lumber installed with 1" to 3" gaps) designed originally for cedar shake roofs. 
* **The Engineering Problem:** Modern asphalt shingles require a continuous solid decking substrate per **IRC R905.2.1** and manufacturer warranty specifications (Owens Corning / GAF). When existing shakes or multiple shingle layers are torn off, the gaps between slat boards cause roofing nails to penetrate empty air or blow through brittle slat edges.
* **The Solution:** Homes built prior to 1972 carry a high probability of requiring full or partial re-decking with 7/16" OSB or 1/2" CDX plywood sheathing at **\$78.13 per 4x8 sheet**.
* **Proactive Transparency:** Honey notes this pre-1972 risk during intake so the customer is prepared for potential decking replacement in their proposal rather than facing a surprise change order during tear-off.

---

## 7. Tire-Kicker Defense: Ballpark Estimate vs Certified Quote

When a caller asks for a rough price or ballpark figure, Honey immediately clarifies whether they want an automated budget estimate or our project design specialist's certified quote:
* **Honey (<25 words):**
  > *"Are you looking for a quick automated ballpark estimate for budgeting, or would you prefer our project design specialist's certified quote to compare bids and get on the schedule?"*
* **If Ballpark Estimate (`leadType = 'estimate'`):**
  > *"Our instant online estimator provides a satellite ballpark figure with zero personal info required. I can text that link right over to your cell!"*
* **If Certified Quote (`leadType = 'certified_quote'`):**
  > *"Perfect! Your project design specialist will pull your high-definition aerial scans and engineering specs for a guaranteed certified quote. Just a few quick questions about your roof layout—ready?"*

---

## 8. The Streamlined MeasureCall Ping-Pong Sequence

Honey asks **strictly one question per turn**, maintaining turn lengths under 25 words:

### Q1: Structure Changes & Solar Panel Detach Party
* **Honey (<25 words):**
  > *"Do you have any recent additions or changes to the roof structure that wouldn't show up on satellite photos—or any solar panels on the roof?"*
* **If Solar Panels are Present:**
  > *"Got it! Are those under an active installer warranty, or would you like R-hive's certified crew to handle the detach and reset?"*
  * Data Field: `solarDetachParty` (`'installer'` vs `'rhive'`).

### Q2: Skylights, Swamp Coolers & Satellite Dishes
* **Honey (<25 words):**
  > *"Looking at your roof layout—do you have any skylights, or an old swamp cooler or satellite dish you'd like removed, or is everything staying?"*
* **Data Fields:** `skylights_count`, `swamp_cooler_removal: boolean`, `satellite_removal: boolean`.

### Q3: Existing Roof Layers & Tear-Off Implications
* **If Flat Roof ($\le 2/12$):**
  > *"Looking at your flat roof section—is this a single layer of membrane, or has it ever been roofed over with an additional layer?"*
* **If Pitched Roof ($\ge 3/12$):**
  > *"Is this the original single layer of shingles, or has it ever been roofed over with a second layer?"*
* **Layer Count Engineering Implication:**
  - `1 Layer`: Standard original roof; routine tear-off.
  - `2 Layers`: Maximum legal roof-over code limit; double tear-off labor.
  - `3 or 4+ Layers`: Historic multi-layer build-up (often cedar shake under multiple asphalt shingle layers) requiring heavy demolition tear-off, weight load inspection, and mandatory slat board redeck evaluation.

### Q4: Customer-Centric Ventilation & Pre-1972 Decking Check
* **County-Aware Prompt (When decadeBuilt is resolved, <25 words):**
  > *"Looking at county records, the home was built in the 1960s—under your roof eaves outside, do you have those little perforated vent panels, or is it solid wood under there?"*
* **Pre-1972 Explanation (if applicable):**
  > *"Because the home was built in 1968, there's a good chance of 1x6 slat board decking under the shingles. Your project specialist will note that for your sheathing evaluation."*

### Q5: Gutters (Location Only + Partial Repairs)
* **Honey (<25 words):**
  > *"For gutters, are you looking to do the front, back, or all the way around?"*
* **Handling Partial Runs:**
  * *Caller:* *"Just the back patio run where snow crushed it."*
  * *Honey:* *"Gotcha, just the back patio run—I've noted that specific section for your project design specialist's aerial measurement."*

### Q6: Winter Ice Dams & Snowpack Hotspots
* **Honey (<25 words):**
  > *"During our heavy winter snows, do you notice large icicles forming or thick ice dams building up along your gutters—especially over walkways, entryways, or in the roof valleys?"*
* **Data Field:** `heatTraceAreas` (valley, entryway, walkway, none).

### Q7: Single Standard & Commercial Packages
* **The RHIVE Standard:** Commercial-grade engineering across every system:
  * **Pitched:** Owens Corning Duration (baseline), Duration FLEX (Class 4 SBS hail armor), Woodcrest & Woodmoor (architectural shake).
  * **Flat Membrane Packages:** 
    - 60-mil TPO (standard commercial package upgrade).
    - 80-mil TPO (heavy-duty long-life commercial).
    - 60-mil / 80-mil PVC (kitchens, restaurants, and harsh chemical environments).
* **Purge "In-House Crews":** Refer strictly to *"certified installation crews"*, *"certified installer teams"*, or *"vetted specialist trade partners"*.
* **Consultative Specialty Referral (Metal, Tile, Slate, Euroshield):**
  * If the caller requests standing seam metal, clay tile, or synthetic composite:
    > *"We focus our certified installer crews on commercial-grade architectural shingles and TPO/PVC systems. However, our project design specialist consults and coordinates directly with vetted partner craftsmen for specialty systems like standing seam metal or tile. I can collect your project specs for our specialist to coordinate your proposal!"*

### Q8: Customer Profile & DISC Psychometrics
* **Scripted Smooth Transition:**
  > *"Just a few more questions to complete your quote request and ensure your project design specialist tailors your proposal exactly to what you're looking for—ready?"*
* **The 4 DISC Quadrants:**
  * **D (Driver):** *"Do you need this installed on the fastest possible timeline, or are you focused on bottom-line numbers?"*
  * **I (Expressive):** *"Are you looking to maximize neighborhood curb appeal and premium architectural color blends?"*
  * **S (Relational):** *"Is your main goal a completely zero-leak lifetime guarantee with zero disruption to your family?"*
  * **C (Analytical):** *"Do you prefer a full line-item engineering breakdown with all the technical manufacturer specifications?"*

---

## 9. The 4-Step Closing Protocol & Multi-Channel Dossier Dispatch

Once the MeasureCall sequence is complete, Honey executes the mandatory 4-step closing protocol:

### Step 1: Gratitude & Warm Acknowledgement
> *"Awesome, Test! We have everything we need to complete your certified quote request."*

### Step 2: Complete Dossier Verification & Phonetic Spelling
Honey confirms contact details with strict phonetic spelling:
* **Name Spelling:** *"T-E-S-T N-A-M-E, did I get that right?"*
* **Phonetic Email Verification:** Honey spells the username letter-by-letter, then pronounces `"at"` [domain] `"dot com"`:
  > *"And to verify your email, that's T-E-S-T at example dot com—is that correct?"*
* **MeasureCall Summary Playback:**
  > *"Perfect. So we have 1420 East 8600 South in Sandy—single layer, no additions, installer handling solar reset, front and back gutters, and prioritizing lifetime warranty protection. Did I get everything right?"*

### Step 3: Dedicated Specialist Text Channel Established
* Honey calls `send_quote_verification_sms` to dispatch the verification text from your dedicated project specialist channel (strictly zero spoken telephone numbers over the line).
* *Honey:* *"I just dispatched a text from your project design specialist with their direct channel. Did that pop through on your phone?"*
* *Honey:* *"Awesome! Feel free to message your project design specialist or call back anytime. Have a wonderful day!"*

### Step 4: Disconnect Sequence Timing Protocol & Multi-Channel Dossier Dispatch
* **Carrier Disconnect Sequence:** Honey finishes her closing statement -> pauses 600ms -> says *"Goodbye!"* -> pauses 150ms -> terminates carrier line cleanly via `armGracefulHangup()`.
* The instant `send_quote_verification_sms` or `book_inspection` fires, the production engine dispatches the full dossier across all three executive communication channels:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│               EXECUTIVE NOTIFICATION DISPATCH ARCHITECTURE                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Direct Carrier SMS to Michael & Kara                                     │
│    - Customer name, phone, verified address, county parcel ID, year built   │
│    - Pre-1972 slat board decking risk warning ($78.13/sheet budget note)    │
│    - Solar status & detach party (installer vs rhive)                       │
│    - Existing layers, eave ventilation, gutters, winter ice dam areas       │
│    - DISC personality quadrant & customer primary value priority            │
│    - Quoting tier (Automated Ballpark Estimate vs Certified Quote Request)   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. Direct Google Workspace Email to Michael & Kara                          │
│    - Dispatched via Google Calendar DWD with sendUpdates: 'all'             │
│    - Delivers full formatted HTML dossier directly into Michael & Kara's    │
│      Google Workspace email inboxes immediately.                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. Instant Google Chat Webhook Card                                         │
│    - Formatted HTML alert badge with clickable Drive folder link and direct │
│      phone dialing links for immediate desktop/mobile triage.               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Master Telephony Swarm Cross-Flow Artifact Links

| Swarm Node | Scope & Function | Document Link |
| :--- | :--- | :--- |
| **Flow 1** | Residential & Commercial Certified Quotes, Repairs & Maintenance | [flow_quotes_residential_commercial.md](file:///C:/Users/mjrob/.gemini/antigravity/brain/0ea1d186-c0b7-4d42-8bc0-3cea6c384d14/flow_quotes_residential_commercial.md) |
| **Flow 2** | Emergency Active Leak Tarping ($150+ Credited) & Insurance Restoration | [flow_emergency_leaks_insurance_storm.md](file:///C:/Users/mjrob/.gemini/antigravity/brain/0ea1d186-c0b7-4d42-8bc0-3cea6c384d14/flow_emergency_leaks_insurance_storm.md) |
| **Flow 3** | Trade Partners, Material Suppliers, Municipal Permitting & Compliance | [flow_trade_suppliers_permitting_compliance.md](file:///C:/Users/mjrob/.gemini/antigravity/brain/0ea1d186-c0b7-4d42-8bc0-3cea6c384d14/flow_trade_suppliers_permitting_compliance.md) |
| **Flow 4** | Cold Solicitor & Unsolicited Marketing Anti-Spam Perimeter Quarantine | [flow_anti_spam_quarantine.md](file:///C:/Users/mjrob/.gemini/antigravity/brain/0ea1d186-c0b7-4d42-8bc0-3cea6c384d14/flow_anti_spam_quarantine.md) |
| **Master Spec** | Complete Master Telephony System Specifications & Swarm Architecture | [master_telephony_workflow_specification.md](file:///C:/Users/mjrob/.gemini/antigravity/brain/0ea1d186-c0b7-4d42-8bc0-3cea6c384d14/master_telephony_workflow_specification.md) |
| **Master Index** | Unified Telephony Swarm Master Registry & Technical Asset Ledger | [master_telephony_artifact_registry.md](file:///C:/Users/mjrob/.gemini/antigravity/brain/0ea1d186-c0b7-4d42-8bc0-3cea6c384d14/master_telephony_artifact_registry.md) |
| **Flowchart** | Visual End-to-End Decision Flowchart & Script Matrix | [customer_telephony_flowchart.md](file:///C:/Users/mjrob/.gemini/antigravity/brain/0ea1d186-c0b7-4d42-8bc0-3cea6c384d14/customer_telephony_flowchart.md) |
| **Live Bridge** | Production GCP Cloud Run Speech-to-Speech WebSocket Implementation | [server.js](file:///c:/Users/mjrob/OneDrive/Desktop/App%20Repo%20s/RHIVE-Construction/RHIVE-Telephony/server.js) |
| **Walkthrough** | Live Deployment Logs, Validation Evidence & Verification Test Suite | [walkthrough.md](file:///C:/Users/mjrob/.gemini/antigravity/brain/0ea1d186-c0b7-4d42-8bc0-3cea6c384d14/walkthrough.md) |

---

## 11. Testing Scripts & AI Agent Simulation QA Matrix

To ensure mathematically proven conversational quality, zero regressions, and full compliance across all 4 DISC customer personas, the following dual-mode testing framework is established:

### 11.1 Operator Test Scripts ($0.00 Web Voice Cockpit Testing)
Operators can test Flow 1 in real time using the browser microphone with zero carrier toll charges:

```
Scenario 1: Residential Certified Quote (South Jordan, UT - DISC C Analytical)
Turn 1: "Hi Honey, this is Greg Smith. I need to get a quote on replacing my shingle roof."
Turn 2 (Address Provided): "The address is 9917 South 3200 West in South Jordan."
Turn 3 (Mandatory Audio Verification & Shorthand Adoption):
  Honey (<20 words): "I have 9917 South 3200 West in South Jordan, 84095—does that match your property?"
  Caller: "Yes, that's correct."
  Honey (<25 words): "Perfect! For the 9917 South property, do you have any recent changes to the roof structure, or any solar panels on the roof?"
Turn 4: "No additions, but we do have 16 solar panels installed 3 years ago."
Turn 5: "They're still under warranty with the solar company, so they'll do the detach."
Turn 6: "We have two skylights over the kitchen, but no swamp cooler."
Turn 7: "It's just the single original layer from when the house was built."
Turn 8: "Looking at county records, the home was built in the 1970s—it's solid wood under the eaves."
Turn 9: "We need gutters all the way around."
Turn 10: "Yes, we get bad icicles in the valley right over the front walkway every winter."
Turn 11: "I want the full engineering breakdown with all the technical shingle specs."
Turn 12: "Yes, gsmith at test dot com. That's all, thanks Honey!"
Verification Check: Verify that Michael & Kara receive Carrier SMS & Google Calendar email containing Parcel ID, Year Built, propertyName: "the 9917 South property", Address: "9917 S 3200 W, South Jordan, UT 84095 (Verified & Confirmed)", Solar Detach: Installer, Gutters: All, Ice Dams: Valley/Walkway, DISC: C.
```

### 11.2 Synthetic AI Caller Simulation QA Matrix (Automated Regression)
Executed via `POST /api/telephony/flows/simulate` using Gemini 3.5 Flash-Lite against Honey:

| Persona | DISC Type | Inbound Stimulus | Expected Honey Behavior & Tool Firing | Compliance Threshold |
| :--- | :--- | :--- | :--- | :--- |
| **Tom H.** | **D (Driver)** | "Hey Honey, I need a replacement quote for 10452 S Jordan Gateway fast. Cut the fluff." | Skips pleasantries, executes `verify_address`, moves rapidly through MeasureCall in <15 words/turn, fires `send_quote_verification_sms` with `discProfile: "D"`. | 100% |
| **Sarah M.** | **I (Expressive)**| "Hi! We just bought a home in Draper and want the prettiest designer shingles on the block!" | Matches high energy, affirms aesthetic options (Woodcrest/Woodmoor), records `discProfile: "I"`, captures gutter & ventilation details. | 100% |
| **Robert K.**| **S (Relational)**| "We've had a bad experience with contractors. Just want a roof that will protect my family forever." | Grounded calm vocal tone, emphasizes Lifetime Zero-Leak Guarantee & Owens Corning System Advantage, sets `discProfile: "S"`. | 100% |
| **Elena V.** | **C (Analytical)**| "I have a 1964 home in Holladay and want to know your exact decking fastening specs." | Accurately identifies 1964 Pre-1972 Slat Board Decking Risk, explains IRC R905 nailing code & \$78.13/sheet re-decking budget, sets `discProfile: "C"`. | 100% |
| **Greg P.**  | **Emergency** | "Water is pouring into my upstairs bedroom right now!" | Identifies Active Water Intrusion, checks slope, quotes \$150+ credited tarping with pitch warning, books immediate emergency dispatch. | 100% |

---

## 12. Master Field Variables Matrix & Call Summary Ledger (Fields Found & Addressed)

> [!IMPORTANT]
> **Canonical System Invariant:**  
> This final section serves as the **authoritative single source of truth** for all fields, variables, parameters, and payloads captured, inferred, and addressed across Flow 1. Every inbound voice interaction must resolve against this matrix before concluding a call.

### 12.1 Master Field Variables Matrix

```mermaid
flowchart LR
    A[Caller Audio & Speech] --> B[Gemini 3.8 Live Multimodal WebSockets]
    B --> C[Real-Time Tool Execution]
    C --> D[County ArcGIS REST OpenData]
    C --> E[Google Maps & Solar APIs]
    C --> F[Google Calendar FreeBusy]
    D & E & F --> G[(Live Session Data Matrix)]
    G --> H[RHIVE System SMS Channels]
    G --> I[Caller SMS from Dedicated Project Specialist Channel]
    G --> J[Google Chat Space 'JustCall Leads']
    G --> K[Google Calendar Invite & Workspace Email]
    G --> L[Google Drive Phone Folder Vault]
```

> [!NOTE]
> **Field Inclusion Rule in Summary:** The table below catalogs all 34 variables tracked across this flow. Every variable maps 1-to-1 to an explicit field placeholder in the Master Consolidated Dossier. In production runtime, fields that are empty, unpopulated, or negative defaults (`"None"`, `"Not specified"`, `"false"`) are omitted dynamically to keep the dispatch clean, high-signal, and actionable.

| Category | Field Name | Variable Key | Ingestion Engine / Source | Required / Optional | Example Value | Description & Downstream Business Impact |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Identity** | Caller First & Last Name | `callerName` | Spoken / Audio STT | Required | `Greg Smith` | Used for personalized greetings, SMS greetings, calendar invites, and CRM contact creation. |
| **Identity** | Customer Phone Number | `customerPhone` | Twilio / JustCall Inbound Caller ID | Required (Auto) | `+18019284434` | Unique identity key; routes direct SMS threads and binds Google Drive phone vaults. |
| **Identity** | Customer Email Address | `customerEmail` | Spoken (Phonetically Verified) | Required | `gsmith@test.com` | Receives RFC-5545 calendar invitations, certified aerial proposal PDFs, and quote links. |
| **Property** | Property Type | `propertyType` | Spoken / Scope Evaluation | Required | `Residential` / `Commercial` | Explicitly classifies residential homes vs commercial/multifamily/pitched commercial structures. |
| **Property** | Formatted Property Address| `propertyAddress`| Spoken $\to$ Google Maps Geocoding | Required | `10437 Shady Plum Way, South Jordan, UT 84009` | Authoritative USPS address; anchors all aerial imaging, permit searches, and county parcel data. |
| **Property** | Verbal Address Confirmed | `addressConfirmed` | Audio STT Verbal Verification | Required | `true` | Explicit audio confirmation from caller ("Yes, that's correct") verifying street, city, and zip before proceeding. |
| **Property** | Property Shorthand Name | `propertyName` | Shorthand Generator (on confirmation) | Required | `the 9917 South property` | Dynamic conversational shorthand derived upon address confirmation, used in dialogue and stamped on dossiers. |
| **County Assessor** | County Parcel ID | `parcelId` | County ArcGIS REST OpenData | Automatic | `27182760590000` | Authoritative tax roll parcel identifier for municipal permit lookups and deed verification. |
| **County Assessor** | Year Built | `yearBuilt` | County Tax Roll OpenData | Automatic | `2014` | Evaluates decking substrate risk and building code era without interrogating the caller. |
| **County Assessor** | Decade Built | `decadeBuilt` | Derived from `yearBuilt` | Automatic | `2010s` | Conversational shorthand used by Honey during the Question 4 ventilation check. |
| **County Assessor** | Interior Building Sqft | `bldgSqft` | County Tax Roll OpenData | Automatic | `2507` | Validates property scale and correlates with aerial roof footprint measurements. |
| **Risk Gate** | Pre-1972 Slat Deck Risk | `isPre1972` | Evaluated (`yearBuilt < 1972`)| Automatic | `false` | When `true`, flags high probability of spaced 1x6/1x8 slats requiring \$78.13/sheet re-decking. |
| **Code Gate** | Pre-1990s Soffit Code | `isPre1990sCode`| Evaluated (`yearBuilt < 1990`)| Automatic | `false` | When `true`, prompts Honey to check for perforated vs solid wood soffit under eaves. |
| **Aerial Geometry**| Roofing Squares (SQ) | `roofSquares` | Google Solar API | Automatic | `32.4 SQ` | Total 3D roof surface area ($100\,\text{sq ft} = 1\,\text{SQ}$) used for ballpark and certified quoting. |
| **Aerial Geometry**| Total Facet Count | `facetCount` | Google Solar API | Automatic | `14 Facets` | Measures roof complexity; high facet counts trigger steep slope and cut-waste adjustments. |
| **Aerial Geometry**| Pitch Matrix & Angle | `pitchMatrix` | Google Solar API | Automatic | `6/12 (26.5°)` | Identifies walkable vs steep slopes; triggers steep pitch harness surcharges if $\ge 9/12$. |
| **Scope of Work** | Project Scope of Work | `projectScope` | Spoken / Scope Evaluation | Required | `Certified Full Roof Replacement` | Specific scope of inspection or quote request (e.g. Full Replacement, Emergency Leak Tarping). |
| **MeasureCall Q1** | Solar Panel Status | `solarStatus` | Spoken (Honey Turn 3) | Required | `Present (16 Panels)`| Identifies whether solar arrays exist on the roof that must be detached before tear-off. |
| **MeasureCall Q1** | Solar Detach Party | `solarDetachParty` | Spoken (Honey Turn 3) | Conditional | `RHIVE Detach & Reset` | Tracks whether the original installer handles detach under warranty or if RHIVE handles it. |
| **MeasureCall Q2** | Skylight Count | `skylights_count` | Spoken (Honey Turn 4) | Optional | `2 Skylights` | Establishes re-flashing kit scope or skylight replacement requirements. |
| **MeasureCall Q2** | Swamp Cooler Removal | `swamp_cooler_removal`| Spoken (Honey Turn 4) | Optional | `Yes (Remove & Deck Over)` | Flags mechanical rooftop unit decommissioning, deck patching, and duct capping. |
| **MeasureCall Q2** | Satellite Dish Removal | `satellite_removal` | Spoken (Honey Turn 4) | Optional | `Yes (Remove & Dispose)` | Deletes outdated satellite dishes and disposes of obsolete coax penetrations. |
| **MeasureCall Q3** | Shingle Layer Count | `shingleLayers` | Spoken (Honey Turn 5) | Required | `1 Layer` | Determines tear-off labor: 1 layer = standard; 2 layers = double tear-off; 3+ = historic demo. |
| **MeasureCall Q4** | Eave Intake Ventilation | `eaveIntake` | Spoken (Honey Turn 6) | Required | `Perforated Panels` | Diagnoses attic airflow: solid wood soffits require edge vents or SmartVents for code balance. |
| **MeasureCall Q5** | Gutter Scope & Runs | `gutterAreas` | Spoken (Honey Turn 7) | Required | `All Around (Full Perimeter)` | Defines 5" or 6" seamless aluminum gutter replacement scope, downspouts, and leaf guards. |
| **MeasureCall Q6** | Winter Ice Dams & Heat Trace| `heatTraceAreas` | Spoken (Honey Turn 8) | Required | `None reported` | Identifies north-facing valleys or shadowed eaves needing heavy ice & water shield or heat tape. |
| **Customer Profile**| Primary Material Selection | `materialPreference` | Spoken (Honey Turn 9) | Required | `Owens Corning Duration` | Selects shingle line (Duration baseline, Duration FLEX Class 4, Woodcrest/Woodmoor, or TPO/PVC). |
| **Psychometrics** | DISC Personality Quadrant | `discProfile` | Conversational Inference | Required | `C (Analytical)` | Calibrates proposal presentation: D (Executive summary), I (Aesthetics), S (Warranty), C (Specs). |
| **Psychometrics** | Core Customer Priority | `customerPriority` | Spoken (Honey Turn 10) | Required | `Quote Request Comparison`| Establishes what the customer values most (lowest bid, fastest timeline, lifetime warranty, specs). |
| **Intake Outcome** | Flow Quoting Tier | `quoteTier` | Intake Logic Gate | Required | `Certified Quote` | Segregates Instant Ballpark Estimates vs Certified Aerial Engineering Proposals. |
| **Inspection Gate**| Inspection Slot Window | `inspectionSlot` | Calendar Engine (Turn 8)| Conditional | `Mid-Day (11 AM - 2 PM)` | 2-hour arrival window locked into Michael Robinson's calendar for on-site inspections. |
| **Inspection Gate**| Property Access Notes | `accessNotes` | Spoken / Default | Conditional | `Front & exterior access granted` | Informs specialist of gate codes, guard dogs, locked fences, or exterior-only permissions. |
| **Emergency Gate** | Emergency Tarping Fee | `emergencyFee` | Active Intrusion Gate | Conditional | `$150.00 (Credited 100%)` | \$150+ credited mobilization fee applied exclusively when active water intrusion requires a tarp. |
| **Live Telephony** | Drive Transcript & Call Audio Link | `transcriptDriveUrl` / `callRecordingUrl` | Google Drive Archival Engine & Twilio Media Storage | Automatic | `https://drive.google.com/file/d/1...` | Direct HTTPS links to the verbatim Markdown transcript and dual-channel MP3 recording archived inside the customer's Google Drive phone folder. |

---

### 12.2 Authoritative Single Consolidated Lead Dossier (Option B Master Format)

> [!IMPORTANT]
> **Single Dossier Invariant:** To eliminate duplicate notifications across channels, any call resulting in an inspection or quote request dispatches **EXACTLY ONE consolidated lead dossier** across SMS to Main Line (`+14354176637`), Google Chat (`spaces/AAQABQzOXI0`), and Google Calendar event description.
>
> **Architectural Rationale (Interim CRM State):** Because a live bidirectional CRM connection is not yet active for automated contact/deal pipelines, the telephony engine outputs all captured intelligence in this single, authoritative, highly-structured summary. This guarantees that every single field variable can be immediately referenced, pulled, or parsed programmatically by downstream scripts or human operators across SMS, Chat, and Calendar without data loss or fragmentation.
>
> **Field Parity Guarantee:** Every single field variable listed in the table in Section 12.1 is explicitly mapped to a corresponding field in the summary templates below. In live production runtime, fields that are empty or negative defaults (`"None"`, `"false"`, `"Not specified"`) are omitted dynamically to maintain a clean, high-signal dispatch.

#### Master Consolidated Dossier Format (Inspection Booked & Full MeasureCall Scope):
```text
================================================================================
📊 CALL SUMMARY & EXECUTIVE RATING
================================================================================
⭐ Lead Quality Rating: [leadRating]
📋 Call Objective & Outcome: [callOutcome]
📝 Executive Call Summary: [executiveCallSummary]
⏰ Call Timestamp & Duration: [callTimestamp] | Duration: [callDuration]

================================================================================
📋 EVERY FIELD COLLECTED (MASTER 34-VARIABLE INTAKE MATRIX)
================================================================================
👤 Customer Name: [callerName]
📞 Customer Phone: [customerPhone]
📧 Customer Email: [customerEmail]
🏢 Property Type: [propertyType]
📍 Property Address: [propertyAddress]
✅ Address Confirmed: [addressConfirmed]
🏷️ Property Name: [propertyName]
🏛️ County Parcel ID: [parcelId]
📅 Year Built: [yearBuilt]
⏳ Decade Built: [decadeBuilt]
📏 Interior Building Sqft: [bldgSqft] sqft
⚠️ Pre-1972 Slat Deck Risk: [isPre1972]
💨 Pre-1990s Soffit Code: [isPre1990sCode]
📐 Roof Squares: [roofSquares]
🔢 Total Facet Count: [facetCount]
📐 Pitch Matrix: [pitchMatrix]
🏠 Project Scope: [projectScope]
⏰ Inspection Window: [inspectionSlot]
🔑 Property Access Notes: [accessNotes]
☀️ Solar Panel Status: [solarStatus]
🔧 Solar Detach Party: [solarDetachParty]
🪟 Skylights Count: [skylights_count]
❄️ Swamp Cooler Removal: [swamp_cooler_removal]
📡 Satellite Dish Removal: [satellite_removal]
🧱 Shingle Layers: [shingleLayers]
💨 Eave Intake Ventilation: [eaveIntake]
🌧️ Gutter Scope & Runs: [gutterAreas]
❄️ Winter Ice Dams & Valleys: [heatTraceAreas]
🏠 Primary Material Selection: [materialPreference]
🎯 DISC Personality Quadrant: [discProfile]
⭐ Customer Primary Priority: [customerPriority]
📊 Quoting Tier: [quoteTier]
💵 Emergency Mobilization Fee: [emergencyFee]

================================================================================
💬 CONVERSATIONAL TRANSCRIPT (GOOGLE DRIVE)
================================================================================
📄 Transcript Link: [transcriptDriveUrl]

================================================================================
🎙️ CALL AUDIO RECORDING
================================================================================
🔗 Audio Recording Link: [callRecordingUrl]
```

#### Master Consolidated Dossier Format (Certified Quote Request Only):
```text
================================================================================
📊 CALL SUMMARY & EXECUTIVE RATING
================================================================================
⭐ Lead Quality Rating: [leadRating]
📋 Call Objective & Outcome: [callOutcome]
📝 Executive Call Summary: [executiveCallSummary]
⏰ Call Timestamp & Duration: [callTimestamp] | Duration: [callDuration]

================================================================================
📋 EVERY FIELD COLLECTED (MASTER 34-VARIABLE INTAKE MATRIX)
================================================================================
👤 Customer Name: [callerName]
📞 Customer Phone: [customerPhone]
📧 Customer Email: [customerEmail]
🏢 Property Type: [propertyType]
📍 Property Address: [propertyAddress]
✅ Address Confirmed: [addressConfirmed]
🏷️ Property Name: [propertyName]
🏛️ County Parcel ID: [parcelId]
📅 Year Built: [yearBuilt]
⏳ Decade Built: [decadeBuilt]
📏 Interior Building Sqft: [bldgSqft] sqft
⚠️ Pre-1972 Slat Deck Risk: [isPre1972]
💨 Pre-1990s Soffit Code: [isPre1990sCode]
📐 Roof Squares: [roofSquares]
🔢 Total Facet Count: [facetCount]
📐 Pitch Matrix: [pitchMatrix]
🏠 Project Scope: [projectScope]
☀️ Solar Panel Status: [solarStatus]
🔧 Solar Detach Party: [solarDetachParty]
🪟 Skylights Count: [skylights_count]
❄️ Swamp Cooler Removal: [swamp_cooler_removal]
📡 Satellite Dish Removal: [satellite_removal]
🧱 Shingle Layers: [shingleLayers]
💨 Eave Intake Ventilation: [eaveIntake]
🌧️ Gutter Scope & Runs: [gutterAreas]
❄️ Winter Ice Dams & Valleys: [heatTraceAreas]
🏠 Primary Material Selection: [materialPreference]
🎯 DISC Personality Quadrant: [discProfile]
⭐ Customer Primary Priority: [customerPriority]
📊 Quoting Tier: [quoteTier]

================================================================================
💬 CONVERSATIONAL TRANSCRIPT (GOOGLE DRIVE)
================================================================================
📄 Transcript Link: [transcriptDriveUrl]

================================================================================
🎙️ CALL AUDIO RECORDING
================================================================================
🔗 Audio Recording Link: [callRecordingUrl]
```

#### Master Format: Emergency Active Leak Tarping
```text
================================================================================
📊 CALL SUMMARY & EXECUTIVE RATING
================================================================================
⭐ Lead Quality Rating: [leadRating]
📋 Call Objective & Outcome: [callOutcome]
📝 Executive Call Summary: [executiveCallSummary]
⏰ Call Timestamp & Duration: [callTimestamp] | Duration: [callDuration]

================================================================================
📋 EVERY FIELD COLLECTED (MASTER 34-VARIABLE INTAKE MATRIX)
================================================================================
👤 Customer Name: [callerName]
📞 Customer Phone: [customerPhone]
📧 Customer Email: [customerEmail]
🏢 Property Type: [propertyType]
📍 Property Address: [propertyAddress]
✅ Address Confirmed: [addressConfirmed]
🏷️ Property Name: [propertyName]
🏛️ County Parcel ID: [parcelId]
📅 Year Built: [yearBuilt]
⏳ Decade Built: [decadeBuilt]
📏 Interior Building Sqft: [bldgSqft] sqft
⚠️ Pre-1972 Slat Deck Risk: [isPre1972]
📐 Roof Squares: [roofSquares]
🔢 Total Facet Count: [facetCount]
📐 Pitch Matrix: [pitchMatrix]
🏠 Project Scope: [projectScope]
⏰ Arrival Window: RAPID DISPATCH (Immediate Crew Mobilization)
💵 Emergency Mobilization Fee: [emergencyFee] ($150+ Credited 100%)
🔑 Property Access Notes: [accessNotes]

================================================================================
💬 CONVERSATIONAL TRANSCRIPT (GOOGLE DRIVE)
================================================================================
📄 Transcript Link: [transcriptDriveUrl]

================================================================================
🎙️ CALL AUDIO RECORDING
================================================================================
🔗 Audio Recording Link: [callRecordingUrl]
```

#### Ledger Format 4: Photo Triage Repair Link Dispatched (<15yo Roof)
```text
📸 PHOTO TRIAGE REPAIR LINK SENT:
👤 [callerName] ([customerPhone])
📍 [propertyAddress]
🏛️ Parcel: [parcelId] | Built: [yearBuilt] ([decadeBuilt])
🏠 Roof Age: Under 15 Years (Repair Candidate)
💬 SMS Thread: Active with Project Specialist (801-449-1451)
⏳ SLA: Specialist reviewing customer photos within 24 hours
```

#### Ledger Format 5: 15-Minute Specialist Callback Scheduled
```text
📅 NEW 15-MIN CALL SCHEDULED ON YOUR CALENDAR:
⭐ [eventTitle]
👤 [callerName] ([customerPhone])
🏢 Company: [companyName]
⏰ [slotSpoken]
📋 Topic: [reason]
📧 Email: [customerEmail]
```

