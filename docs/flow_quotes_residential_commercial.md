# Flow 1: Residential & Commercial Quotes, Repairs, Replacements & Maintenance
**Swarm Revision:** Revision 67 Master Alignment  
**Target Environment:** Google Cloud Run (`rhive-voice-live-bridge`)  
**Telephony Engine:** Google Gemini 3.8 Live Multimodal Speech-to-Speech (`gemini-3.8-live` & `gemini-3.8-live-extended-thinking`)  
**System Target Line:** +1 (839) 867-6637 (`839-86-ROOFS`) *(All calls to RHIVE Main are forwarded here for Honey to answer directly)*  
**Lead Architect:** Michael Robinson (RHIVE Construction)  
**Primary Review Document:** `flow_quotes_residential_commercial.md`

---

## 1. Executive Summary & Flow Topology

Flow 1 governs all residential and commercial roofing inquiries spanning full replacements, partial replacements, repairs, ongoing service agreements, and routine maintenance visits along the Wasatch Front. 

The core operational thesis of RHIVE is **remote aerial engineering precision**: a Certified Quote has a dedicated Project Specialist pull high-resolution satellite CAD scans (via precision Roofr or equivalent satellite engineering), county parcel tax rolls, municipal permit history, and manufacturer codes to calculate the exact engineering proposal. **We do not need to be at the address to build a certified quote.** For residential roofs visible from the ground and minor repairs, Honey offers a **15-Minute Remote Phone Video Call Inspection**, eliminating unnecessary truck rolls entirely. An in-person on-site roof inspection is strictly reserved for 5 explicit exceptions.

> [!TIP]
> **Clickable & Zoomable End-to-End Decision Architecture:**
> The vector diagram below maps every turn, logic branch, and tool call in Flow 1. It renders crisply at any zoom level in modern browsers.

```mermaid
flowchart TD
    A["Inbound Call / Forwarded from RHIVE Main"] --> B["Honey Ring 1 Answer (Zero IVR Menus / Pure Voice)<br/>150ms Settle Delay + Radiant Vocal Smile<br/>'Hi, this is Honey! R-hive's AI Roofing Specialist, how may I assist with your roofing project today!?'"]
    B --> C{Caller Stated Name?}
    C -- Yes --> D["Store Name & Adopt Casual First Name<br/>Data Field: callerName"]
    C -- No --> E["Capture First Name<br/>Data Field: callerName"]
    D --> F["Turn 2: Capture Property Address<br/>Data Field: propertyAddress"]
    E --> F
    F --> G["OpenStreetMap Geocoding & Utah County Parcel Query<br/>TOOL: verify_address"]
    G --> H{Address Valid & Wasatch Front?}
    H -- No / Misheard --> I["Address Reloop: Phonetic & Number Confirmation"]
    I --> G
    H -- Out of Service Area --> J["Polite Out-of-Area Referral & Clean Disconnect"]
    H -- Yes --> H1["Turn 3: Mandatory Audio Verification Gate<br/>'I have [Address], [City], Utah [Zip]—does that match your property?'<br/>Honey PAUSES & WAITS for verbal confirmation"]
    H1 --> H2{"Caller Confirms Audio Accuracy?"}
    H2 -- No / Correction --> I
    H2 -- Yes --> H3["Derive propertyName Shorthand:<br/>'the 9917 South property'<br/>Honey: 'I have your property details pulled up right here on our cloud server.'<br/>Data Field: propertyName"]
    H3 --> K["Trigger Precision Roofr Aerial CAD & County Tax Roll Query<br/>Data Field: parcelId, yearBuilt, decadeBuilt"]
    K --> L["Calculate 3D Surface Area, Facet Aggregation & Pitch Multipliers<br/>Data Field: roofSquares, facetCount, pitchMatrix"]
    L --> M{"Intent Triage Gate:<br/>'For the [propertyName], are you looking for a certified quote on an aging roof...'"}
    
    M -- Ballpark / Tire-Kicker --> N["Instant Ballpark Estimator vs Certified Quote Choice<br/>Data Field: quoteTier"]
    N --> O{Wants Certified Quote?}
    O -- Yes --> P["Advance to Remote Aerial CAD / MeasureCall Ping-Pong"]
    O -- No --> Q["Educate on Instant Estimator & Text Link to Cell ending in [last 4]"]

    M -- Commercial All Types --> R["Schedule On-Site Commercial Roof Inspection: 60/80 TPO/PVC<br/>TOOL: get_available_windows"]
    M -- Active Leak Tarping --> S["Schedule Emergency Tarp: $150 Mobilization Fee 100% Credited<br/>Covers ALL leaks from single weather event"]
    
    %% Repair & Replacement Ground Visibility Triage
    M -- Residential Roof Replacement / Repair --> V_Option{"Visible from Ground?<br/>Offer 15-Minute Remote Phone Video Call"}
    V_Option -- Yes / Ground Visible --> V_Video["Schedule 15-Minute Remote Phone Video Call Inspection<br/>Specialist inspects live via homeowner smartphone stream"]
    V_Option -- No / Aerial Only --> P
    
    M -- Repair >15yo Roof (No Video) --> T["Schedule On-Site Roof Damage Inspection: Embrittlement Check<br/>Plasticizers evaporated; evaluate spot repair vs south/west partial replacement"]
    M -- Repair <15yo Roof --> U{"Caller Has Exterior Roof Photos?"}
    U -- Yes --> U1["Dispatch Photo Triage SMS to Number Ending in [last 4]<br/>Specialist evaluates repairability within 24 hours"]
    U -- No --> V_Option
    M -- Specialty Material --> V0["Consultative Specialty Partner Referral: Metal/Tile/Slate/Euroshield<br/>Managed under RHIVE Prime Contractor Warranty"]

    subgraph MeasureCall ["MeasureCall Ping-Pong Sequence (1 Question / Turn)"]
        P --> V1["Q1: Additions, Solar Panels & Detach Warranty (Subcontracted Specialists vs Installer)<br/>Data Field: solarStatus, solarDetachParty"]
        V1 --> V2["Q2: Skylights, Swamp Coolers & Satellite Removals<br/>Data Field: skylights_count, swamp_cooler_removal, satellite_removal"]
        V2 --> V3{"Slope Check: Flat vs Pitched?"}
        V3 -- Pitch <= 2/12 --> V3A["Q3A: Flat Membrane Layers: 1, 2, 3+ (TPO/PVC)<br/>Data Field: membraneLayers"]
        V3 -- Pitch >= 3/12 --> V3B["Q3B: Shingle Layers: 1, 2, 3+ & Tear-off Weight Load<br/>Data Field: shingleLayers"]
        V3 -- Mixed Pitch --> V3C["Q3C: Combined Multi-Plane Layer Evaluation"]
        V3A --> V4
        V3B --> V4
        V3C --> V4
        V4["Q4: Decking Substrate (Plywood vs 1x6 Slat Boards) & Eave Ventilation<br/>Data Field: deckingType, eaveIntake"]
        V4 --> V5["Q5: Shingle Age & Embrittlement Check (>15yo Plasticizer Loss)<br/>Data Field: shingleAgeRisk"]
        V5 --> V6["Q6: Gutters: New vs Replacement & Location (Front, Back, All-Around)<br/>Data Field: gutterScope, gutterLocations"]
        V6 --> V7["Q7: Winter Ice Dams & Snowpack Hotspots<br/>Data Field: heatTraceAreas"]
        V7 --> V8["Q8: Owens Corning Duration Performance Specification (SureNail Baseline)<br/>Data Field: materialPreference"]
        V8 --> V9["Q9: Customer Profile Transition & DISC Psychometrics (D / I / S / C)<br/>Data Field: discProfile, customerPriority"]
    end

    V_Video --> W
    U1 --> W
    V9 --> W["4-Step Closing Protocol"]
    subgraph ClosingProtocol ["4-Step Closing Protocol & Multi-Channel Dispatch"]
        W --> X1["1. Authentic Gratitude & Verbal Smile"]
        X1 --> X2["2. Complete Scope of Work Recap & Phonetic Verification"]
        X2 --> X3["3. Communication Channel Confirmation to Number Ending in [last 4]"]
        X3 --> X4["4. Natural Voice Termination Doublet:<br/>Pause 600ms -> 'You are so welcome! Have a wonderful day! Goodbye!' -> 150ms Flush -> Disconnect"]
    end
```

---

## 2. Honey Greeting, Acoustic Prosody & Latency Architecture

### 2.1 Canonical Greeting & Telephony Timing Parameters

Honey answers directly on **Ring 1** with zero robotic IVR switchboards:
> *"Hi, this is Honey! R-hive's AI Roofing Specialist, how may I assist with your roofing project today!?"*

> [!IMPORTANT]
> **Branding & Spoken Pronunciation Rules:** 
> - **Spoken Branding (Voice Agents):** For proper TTS phonetics over the phone, the company name is strictly spoken as `"R-hive Construction roofing specialists!"` (pronounced `"R-hive"`, using strictly the letter "R", never "Are"). Always maintain singular brand identity.
> - **Written Branding (Customer & Marketing Copy):** In transcription, proposals, and customer-facing writing, it is strictly official `"RHIVE Construction Roofing Specialists"` (or `"RHIVE Construction"`).
> - **Office Line Forwarding:** All incoming calls to the RHIVE Main office line are seamlessly forwarded directly to `+1 (839) 867-6637` (`839-86-ROOFS`), where Honey answers immediately for the entire company.
> - **Role Title:** Never use "concierge". Honey is the `"AI Roofing Specialist"` or `"Executive Project Specialist"`.
> - **Phone Number Verification Rule:** Never recite full 10-digit telephone numbers over voice calls. Confirm caller identity and refer to the contact number strictly as `"the number ending in [last 4 digits]"` (e.g. `"We will text the certified scope to the number ending in 4434"`).
> - **Device & Data Context:** Honey speaks as having data access via our live cloud server ("I have your property details pulled up right here on our cloud server" or "visualized on our cloud portal"), never "on my phone" or "on my screen".

#### Telephony Timing & Settle Delay Configuration
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TELEPHONY TIMING & SETTLE DELAY MATRIX                   │
├──────────────────────────┬───────────┬──────────────────────────────────────┤
│ Parameter                │ Target    │ Engineering Function                 │
├──────────────────────────┼───────────┼──────────────────────────────────────┤
│ Carrier Settle Delay     │ 150ms     │ Injected into initial audio frame.   │
│                          │           │ Prevents carrier clipping on greeting│
├──────────────────────────┼───────────┼──────────────────────────────────────┤
│ RTP Packetization        │ 20ms      │ 160-byte mulaw / 640-byte 16kHz PCM  │
│                          │           │ frames stream bidirectionally.       │
├──────────────────────────┼───────────┼──────────────────────────────────────┤
│ VAD Silence Cushion      │ 900–1100ms│ Prevents Honey from interrupting     │
│                          │           │ thoughtful or pausing callers.       │
├──────────────────────────┼───────────┼──────────────────────────────────────┤
│ Barge-in Interrupt Delta │ <80ms     │ Inbound caller speech clears active  │
│                          │           │ Twilio playback buffer immediately.  │
├──────────────────────────┼───────────┼──────────────────────────────────────┤
│ Disconnect Speech Buffer │ 1200ms    │ Event-driven carrier drain cushion   │
│                          │           │ guarantees zero clipping on '-bye!'. │
├──────────────────────────┼───────────┼──────────────────────────────────────┤
│ Async Tool Interleaving  │ 0ms       │ Gemini 3.8 Live reasoning-while-talk │
│                          │           │ executes background tools in parallel│
└──────────────────────────┴───────────┴──────────────────────────────────────┘
```

---

### 2.2 Acoustic Physics & Prosody: Prebuilt Voice 'Leda' (Gemini 3.8 Live)

Honey is powered by Google's native **Gemini 3.8 Live Multimodal Speech-to-Speech** engine using the prebuilt voice **Leda**.

#### 1. Acoustic Physics of the "Vocal Smile" (Formant Engineering)
* When a human smiles while speaking, the zygomaticus major and risorius muscles retract the lip corners, shortening the acoustic vocal tract by 10% to 15%.
* In physical acoustics, this shifts the fundamental resonant formant frequencies higher:
  - Formant $F_1$ increases by $\approx 150\,\text{Hz}$ (producing bright, open vowel coloring).
  - Formant $F_2$ increases by $\approx 250\,\text{Hz}$ (producing crisp, hospitable resonance).
* Gemini 3.8 Live synthesizes this acoustic smile directly at the neural audio layer without intermediate text transformations.

#### 2. The Anti-Cliché Rule: Banned Words Purged
* **The Psychological Trap:** Uttering corporate clichés like *"I am so happy to help you today"* or *"I'd be glad to assist you"* destroys customer trust. Callers perceive it as robotic and disingenuous.
* **The Strict Banned List:** Honey is **strictly forbidden** from saying `"help"`, `"happy"`, `"glad"`, `"assist"`, `"as an AI"`, or `"I apologize"`.
* **High-Frequency Action Verbs:** Honey communicates capability and confidence through active verbs: `"take care of"`, `"protect"`, `"handle"`, `"coordinate"`, `"ensure"`, `"inspect"`, `"measure"`.
* **The Result:** 100% of Honey's warmth is experienced organically through **formant brightness, active listening cadence, buoyant vocal inflections, and immediate responsiveness**.

---

## 3. Standardized Stages, Terminology & The Quote Bucket

```
├── 1. ESTIMATE STAGE
│   └── Ballpark Estimate: Instant self-serve online pricing tool for rough budget planning.
│
└── 2. CERTIFIED QUOTE REQUESTED STAGE (The Quote Bucket)
    ├── Certified Quote: Precision engineering proposal calculated from high-res aerial CAD scans (via Roofr).
    ├── Scope of Work Report: Formal engineering report determining whether the roof requires:
    │   1. Localized Spot Repair
    │   2. Partial Facet Replacement (south/west slopes wear 3x faster than north/east)
    │   3. Full System Replacement
    │   4. Ongoing Service Agreement
    ├── Service Agreement: Governs recurring commercial/residential maintenance & multi-year penetration seals.
    └── Maintenance Visit: A one-time routine tune-up, debris clear, and penetration seal.
```

---

## 4. Remote Aerial Precision, 15-Minute Video Call & On-Site Exceptions

For standard replacements and residential inquiries, a Certified Quote is engineered remotely via aerial CAD scans and county parcel data—**no truck roll is needed**.

> [!TIP]
> **15-Minute Remote Phone Video Call Inspection:**
> For residential roofs visible from the ground and minor repairs, Honey offers a **15-Minute Remote Phone Video Call Inspection** with a dedicated Project Specialist. The homeowner steps outside with their smartphone, points the camera at the eaves, valleys, or shingles, and the specialist reviews conditions live in 15 minutes. This eliminates unnecessary truck rolls, respects the customer's time, and delivers same-day certified quote turnaround.

### The 5 Explicit Exceptions Requiring an In-Person On-Site Roof Inspection
An in-person truck roll is scheduled **only** under these 5 explicit conditions:

1. **Active Water Intrusion Tarping:** Requires emergency leak stabilization. Standard mobilization is **$150**, which **covers all leaks from a single weather event** and is **100% credited** toward the permanent repair or restoration contract. Escalates only for catastrophic multi-plane structural damage or steep rope/harness rigging ($\ge 8:12$).
2. **Roof Older Than 15 Years (Repair Request):** Shingles have reached asphalt embrittlement; physical evaluation is required to diagnose whether a spot repair will hold or if a partial/full replacement is necessary.
3. **Commercial Roofing (All Types):** Applies to **all** commercial projects—both low-slope/flat single-ply membranes (60-mil/80-mil TPO and PVC) and pitched commercial roofs—requiring core sampling, parapet flashing analysis, and commercial rooftop HVAC curb inspection.
4. **Insurance Storm Damage (Strict UPPA Statutory Compliance):** 
   * **The Law:** Under Utah Code § 31A-26 (Unauthorized Practice of Public Adjusting), roofing contractors and AI agents are legally prohibited from stating whether damage "qualifies for a claim" or negotiating claim payouts.
   * **The Role:** RHIVE conducts an **on-site roof damage inspection** to document visible physical storm damage and prepare an objective **scope of work report to know what it will take to get either the repair or replacement taken care of**, giving the homeowner an informed baseline before sharing with their insurance adjuster.
5. **Homeowner Explicit Request:** The customer explicitly asks for a specialist to physically walk the property in person.

---

## 5. Asphalt Shingle Embrittlement Research (>15 Years Old)

### The Material Science of Asphalt Degradation in Utah
* In Utah's intermountain climate (4,500+ ft altitude, intense solar UV radiation, single-digit relative humidity in summer, and rapid freeze-thaw cycles in winter), asphalt shingles age through **photochemical oxidation and volatilization**.
* Over 15 to 20 years, volatile lighter hydrocarbon fractions (maltenes and plasticizers) evaporate from the asphalt binder matrix.
* As plasticizers deplete, the shingle matrix transforms from a flexible, elastomeric material into a rigid, brittle state. The fiberglass reinforcement mat loses its tensile elongation capability.

### Why Spot Repairs Fail on Aging Roofs
* When a technician attempts a localized "spot repair" on a roof older than 15 years, they must physically pry up the shingles in the course directly above the damaged area to expose and remove the original fasteners.
* Breaking the thermal sealant bond and bending brittle shingles exceeding $45^\circ$ causes **transverse micro-fracturing along the nail line and mat tears** across adjacent shingles.
* Consequently, sliding in a new tab often cracks 3 to 5 adjacent shingles, creating secondary leak paths that fail during the next rain or snowpack melt.

### Honey's Spoken Technical Explanation
> *"With shingles over 15 years old in Utah, the natural oils dry out and shingles become brittle. Prying them up to slip in replacement shingles often cracks the surrounding ones, so our specialist evaluates whether a spot repair can hold or if a partial replacement is best."*

---

## 6. Precision Aerial Geometry & Mathematical Formulas

When Honey verifies the property address, precision aerial CAD geometry (via Roofr or equivalent satellite engineering) extracts true 3D surface area, facet counts, and pitch segmentation.

### 6.1 Mathematical Formulations
1. **Total Facet Count Aggregation:**
   $$N_{\text{facets}} = \sum_{i=1}^{k} \text{Facet}_i$$
   Measures roof complexity; high facet counts ($>18$) require increased valley metal, hip and ridge cap shingle volume, and cut-waste adjustments.

2. **Pitch Rise-Over-Run Multiplier:**
   $$M_{\text{pitch}} = \sqrt{1 + \left(\frac{\text{rise}}{12}\right)^2} = \sec\left(\arctan\left(\frac{\text{rise}}{12}\right)\right)$$
   *(Example: For a 6/12 pitch, $M_{\text{pitch}} = \sqrt{1 + (0.5)^2} = \sqrt{1.25} \approx 1.1180$).*

3. **True 3D Surface Area & Roofing Squares:**
   $$A_{3D} = \sum_{i=1}^{k} \left( A_{\text{footprint}, i} \times \sqrt{1 + \left(\frac{\text{rise}_i}{12}\right)^2} \right) \times (1 + W_{\text{waste}})$$
   $$\text{Roofing Squares (SQ)} = \frac{A_{3D}}{100}$$
   where $W_{\text{waste}}$ ranges from $0.10$ (simple gable) to $0.18$ (complex hip and valley layout).

---

## 7. Pre-1972 Slat Board Decking & Decking Substrate Inquiry

In Utah, homes constructed prior to 1972 heavily utilized **1x6 or 1x8 spaced slat board sheathing** (dimensional lumber installed with 1" to 3" gaps) originally designed for cedar shake roofs.

* **The Code Requirement:** Modern asphalt shingles require a continuous solid decking substrate per **IRC R905.2.1** and manufacturer specifications (Owens Corning / GAF). Fasteners driven into gaps fail to hold, voiding wind warranties.
* **The Decking Inquiry Turn:** Honey proactively inquires:
  > *"Do you happen to know if your roof decking is plywood sheets or older one-by-six slat boards?"*
  - **Data Field:** `deckingType` (`plywood_osb`, `slat_board`, `unknown`).
* **Re-Decking Budget Transparency:** If pre-1972 slat boards are confirmed or suspected, Honey sets expectations:
  > *"Because the home was built in 1968, there's a good chance of 1x6 slat boards under the shingles. We budget for that upfront at seventy-eight dollars a sheet so there are never surprises during tear-off."*

---

## 8. The Streamlined MeasureCall Ping-Pong Sequence (1 Question / Turn)

Honey asks **strictly one question per turn**, maintaining turn lengths under 25 words:

### Q1: Additions, Solar Panels & Detach Warranty
* **Honey (<25 words):**
  > *"Have there been any recent structural additions to the roof—and do you currently have solar panels installed on the roof?"*
* **If Solar Panels are Present:**
  > *"Got it! Are those under an active installer warranty, or would you like R-hive to coordinate with our trusted subcontracted solar specialists for the detach and reset?"*
* **Data Fields:** `solarStatus: "Present (16 Panels)"`, `solarDetachParty: "Subcontracted Solar Specialist"` (or `"Original Installer"`).

### Q2: Skylights, Swamp Coolers & Satellite Dishes
* **Honey (<25 words):**
  > *"Looking at your roof layout—do you have any skylights, or an old swamp cooler or satellite dish you'd like removed, or is everything staying?"*
* **Data Fields:** `skylights_count: 2`, `swamp_cooler_removal: true`, `satellite_removal: true`.

### Q3: Existing Roof Layers (Slope-Aware)
* **If Flat Roof ($\le 2/12$):**
  > *"Looking at your flat roof section—is this a single layer of membrane, or has it ever been roofed over with an additional layer?"*
* **If Pitched Roof ($\ge 3/12$):**
  > *"Is this the original single layer of shingles, or has it ever been roofed over with a second layer?"*
* **Data Field:** `shingleLayers: "1 Layer"` (or `"2 Layers"`, `"3+ Historic Build-up"`).

### Q4: Decking Substrate & Pre-1972 Slat Board Check
* **Honey (<25 words):**
  > *"Do you happen to know if your roof decking is plywood sheets or older one-by-six slat boards?"*
* **Data Field:** `deckingType: "plywood_osb"` / `"slat_board"` / `"unknown"`.

### Q5: Shingle Age & Embrittlement Check (>15yo)
* **Honey (<25 words):**
  > *"With shingles over 15 years old in Utah, plasticizers dry out and spot repairs often crack adjacent shingles. Our specialist evaluates whether a spot repair can hold or if a partial replacement is best."*
* **Data Field:** `shingleAgeRisk: "Over 15 Years - Embrittlement Risk Flagged"`.

### Q6: Gutters: New vs Replacement & Location
* **Honey (<25 words):**
  > *"For gutters, are you looking for a replacement or a brand-new installation—and is that front, back, or all the way around?"*
* **Data Fields:** `gutterScope: "replacement"` / `"new_install"` / `"keep_existing"`, `gutterLocations: "all_around"` / `"front_only"` / `"back_only"`.

### Q7: Winter Ice Dams & Snowpack Hotspots
* **Honey (<25 words):**
  > *"During heavy winter snows, do you notice large icicles forming or thick ice dams building up along your gutters—especially over walkways or in roof valleys?"*
* **Data Field:** `heatTraceAreas: "Valley & Front Walkway"`.

### Q8: Owens Corning Duration Performance Specification
* **The RHIVE Standard:** Positioned as our **upgraded commercial-grade performance line featuring SureNail Technology**, never as "standard" shingles.
* **Duration FLEX Class 4 SBS:** Offered neutrally for impact resistance.
* **Data Field:** `materialPreference: "Owens Corning Duration Commercial-Grade"`.

### Q9: Specialty Materials Consultative Flow (Metal, Tile, Slate, Euroshield)
* If the caller requests standing seam metal, clay tile, or synthetic composite:
  > *"We manage full architectural scopes including standing seam metal and tile through our certified specialist craftsmen under R-hive's prime warranty. I can collect your specs for our specialist to coordinate your proposal!"*
* **Data Field:** `materialPreference: "Standing Seam Metal (RHIVE Prime Managed)"`.

### Q10: Customer Profile & DISC Psychometrics
* **Scripted Smooth Transition (<20 words):**
  > *"Just a quick question so our specialist tailors your proposal to what matters most to you—ready?"*
* **The 4 DISC Quadrants:**
  * **D (Driver):** *"Do you need this installed on the fastest possible timeline, or are you focused on bottom-line numbers?"*
  * **I (Expressive):** *"Are you looking to maximize neighborhood curb appeal and premium architectural color blends?"*
  * **S (Relational):** *"Is your main goal a completely zero-leak lifetime guarantee with zero disruption to your home and daily life?"*
  * **C (Analytical):** *"Do you prefer a full line-item engineering breakdown with all the technical manufacturer specifications?"*
* **Data Fields:** `discProfile: "S"`, `customerPriority: "Lifetime Zero-Leak Protection"`.

---

## 9. The 4-Step Closing Protocol & Phone Privacy

Once the MeasureCall sequence is complete, Honey executes the mandatory 4-step closing protocol:

### Step 1: Authentic Gratitude & Warm Acknowledgement
> *"Awesome, Greg! We have everything we need to complete your certified quote request."*

### Step 2: Complete Scope of Work Recap & Phonetic Verification
* **Name Spelling:** *"G-R-E-G S-M-I-T-H, did I get that right?"*
* **Phonetic Email Verification:** Honey spells the username letter-by-letter, then pronounces `"at"` [domain] `"dot com"`:
  > *"And to verify your email, that's G-R-E-G at example dot com—is that correct?"*
* **Scope of Work Playback:**
  > *"Our Scope of Work Report will determine whether a spot repair, partial replacement, or full replacement is optimal for the 9917 South property."*

### Step 3: Dedicated Specialist Channel to Number Ending in [Last 4]
* **Honey (<25 words):**
  > *"Our specialist will review the engineering data on our live cloud server and text your proposal to the number ending in 4434 within 24 business hours."*

### Step 4: Natural Voice Termination Doublet & Carrier Buffer Flush
* **Secondary Assistance Check:**
  * *Honey:* *"Is there anything else I can check for you today?"*
  * *Caller:* *"Nope, that's everything! Thanks Honey!"*
* **Natural Voice Termination Doublet:**
  * *Honey:*
    > *"You are so welcome! Have a wonderful day! Goodbye!"*
* **Carrier Buffer Flush:**
  - Honey invokes `hangup_call`.
  - The server waits for Gemini Live's `turnComplete: true` plus a 1200ms audio buffer drain before terminating the carrier socket, preventing syllable clipping.

---

## 10. Master Field Variables Matrix & Call Summary Ledger

| Category | Field Name | Variable Key | Source | Required | Example Value | Business Impact |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Identity** | Caller Name | `callerName` | Spoken / STT | Required | `Greg Smith` | Personalizes greetings, calendar invites, and CRM contact creation. |
| **Identity** | Customer Phone | `customerPhone` | Twilio Inbound | Required | `+18019284434` | Unique identity key; confirmed as "the number ending in 4434". |
| **Identity** | Customer Email | `customerEmail` | Spoken (Phonetic) | Required | `gsmith@test.com` | Receives certified proposal PDF and calendar invite. |
| **Property** | Property Type | `propertyType` | Spoken / Scope | Required | `Residential` | Distinguishes residential homes from commercial structures. |
| **Property** | Formatted Address | `propertyAddress` | OpenStreetMap/GIS | Required | `9917 S 3200 W, South Jordan, UT 84095` | Authoritative address anchoring all aerial scans and permits. |
| **Property** | Address Confirmed | `addressConfirmed` | Verbal Gate | Required | `true` | Explicit audio confirmation before proceeding. |
| **Property** | Property Shorthand | `propertyName` | Derived | Required | `the 9917 South property` | Conversational shorthand used throughout call and dossiers. |
| **Assessor** | Parcel ID | `parcelId` | Utah County GIS | Automatic | `27182760590000` | Authoritative parcel number for permits and deed lookup. |
| **Assessor** | Year Built | `yearBuilt` | County Tax Roll | Automatic | `1968` | Flags pre-1972 slat board decking risks. |
| **Assessor** | Decade Built | `decadeBuilt` | Derived | Automatic | `1960s` | Conversational shorthand used during eave ventilation check. |
| **Assessor** | Building Sqft | `bldgSqft` | County Tax Roll | Automatic | `2507 sqft` | Interior square footage validating property scale. |
| **Decking** | Decking Type | `deckingType` | Spoken (Honey Q4) | Required | `slat_board` | Flags 1x6 slat boards requiring \$78.13/sheet re-decking. |
| **Embrittlement** | Shingle Age Risk | `shingleAgeRisk` | Evaluated / Spoken | Required | `Over 15 Years (Brittle)` | Explains why spot repairs fail and partial replacement is needed. |
| **Aerial** | Roofing Squares | `roofSquares` | Aerial CAD CAD (Roofr) | Automatic | `32.4 SQ` | True 3D surface area ($100\,\text{sq ft} = 1\,\text{SQ}$). |
| **Aerial** | Total Facet Count | `facetCount` | Aerial CAD CAD (Roofr) | Automatic | `14 Facets` | Measures geometric complexity and cut-waste factor. |
| **Aerial** | Pitch Matrix | `pitchMatrix` | Aerial CAD CAD (Roofr) | Automatic | `6/12 (26.5°)` | Identifies walkable vs steep pitch harness requirements. |
| **Scope** | Scope of Work | `projectScope` | Scope Evaluation | Required | `Scope of Work Report` | Determines spot repair, partial replacement, or full replacement. |
| **Solar** | Solar Status | `solarStatus` | Spoken (Honey Q1) | Required | `Present (16 Panels)` | Identifies solar arrays requiring detach before tear-off. |
| **Solar** | Solar Detach Party | `solarDetachParty` | Spoken (Honey Q1) | Conditional | `Subcontracted Specialist`| Subcontracted solar crew vs original installer. |
| **Rooftop** | Skylight Count | `skylights_count` | Spoken (Honey Q2) | Optional | `2 Skylights` | Establishes re-flashing kit scope. |
| **Rooftop** | Swamp Cooler Removal | `swamp_cooler_removal`| Spoken (Honey Q2) | Optional | `true` | Mechanical decommissioning and deck patch scope. |
| **Rooftop** | Satellite Removal | `satellite_removal` | Spoken (Honey Q2) | Optional | `true` | Removal of obsolete dishes and penetrations. |
| **Layers** | Shingle Layers | `shingleLayers` | Spoken (Honey Q3) | Required | `1 Layer` | Determines tear-off labor and weight load. |
| **Gutters** | Gutter Scope | `gutterScope` | Spoken (Honey Q6) | Required | `replacement` | New installation vs replacement vs keep existing. |
| **Gutters** | Gutter Locations | `gutterLocations` | Spoken (Honey Q6) | Required | `all_around` | Front, back, or all around. |
| **Ice Dams** | Heat Trace Areas | `heatTraceAreas` | Spoken (Honey Q7) | Required | `Valley & Walkway` | High-risk winter ice dam zones. |
| **Material** | Primary Material | `materialPreference` | Spoken (Honey Q8) | Required | `Owens Corning Duration` | Upgraded commercial-grade performance line with SureNail. |
| **DISC** | DISC Quadrant | `discProfile` | Conversational | Required | `S (Relational)` | Calibrates proposal tone (D, I, S, C). |
| **DISC** | Customer Priority | `customerPriority` | Spoken (Honey Q10)| Required | `Zero-Leak Protection` | Customer's primary value driver. |
| **Quoting** | Quoting Tier | `quoteTier` | Logic Gate | Required | `Certified Quote` | Ballpark estimate vs certified aerial engineering quote. |
| **Emergency** | Mobilization Fee | `emergencyFee` | Logic Gate | Conditional | `$150.00 (Credited 100%)` | Standard emergency mobilization fee covering all leaks. |
| **Drive Vault**| Transcript Link | `transcriptDriveUrl` | Drive Archival | Automatic | `https://drive.google.com/...` | Verbatim markdown transcript in customer phone folder. |
| **Drive Vault**| Call Audio Link | `callRecordingUrl` | Twilio Media | Automatic | `https://drive.google.com/...` | Dual-channel call audio recording. |

---

## 11. Master Telephony Swarm Cross-Flow Artifact Links

| Swarm Node | Scope & Function | Document Link |
| :--- | :--- | :--- |
| **Flow 1** | Residential & Commercial Certified Quotes, Repairs & Maintenance | [flow_quotes_residential_commercial.md](file:///C:/Users/mjrob/.gemini/antigravity/brain/0ea1d186-c0b7-4d42-8bc0-3cea6c384d14/flow_quotes_residential_commercial.md) |
| **Flow 2** | Emergency Active Leak Tarping ($150+ Credited) & Insurance Restoration | [flow_emergency_leaks_insurance_storm.md](file:///C:/Users/mjrob/.gemini/antigravity/brain/0ea1d186-c0b7-4d42-8bc0-3cea6c384d14/flow_emergency_leaks_insurance_storm.md) |
| **Flow 3** | Trade Partners, Material Suppliers, Municipal Permitting & Compliance | [flow_trade_suppliers_permitting_compliance.md](file:///C:/Users/mjrob/.gemini/antigravity/brain/0ea1d186-c0b7-4d42-8bc0-3cea6c384d14/flow_trade_suppliers_permitting_compliance.md) |
| **Flow 4** | Cold Solicitor & Unsolicited Marketing Anti-Spam Perimeter Quarantine | [flow_anti_spam_quarantine.md](file:///C:/Users/mjrob/.gemini/antigravity/brain/0ea1d186-c0b7-4d42-8bc0-3cea6c384d14/flow_anti_spam_quarantine.md) |
| **Master Spec** | Complete Master Telephony System Specifications & Swarm Architecture | [master_telephony_workflow_specification.md](file:///C:/Users/mjrob/.gemini/antigravity/brain/0ea1d186-c0b7-4d42-8bc0-3cea6c384d14/master_telephony_workflow_specification.md) |
| **Flowchart** | Visual End-to-End Decision Flowchart & Script Matrix | [customer_telephony_flowchart.md](file:///C:/Users/mjrob/.gemini/antigravity/brain/0ea1d186-c0b7-4d42-8bc0-3cea6c384d14/customer_telephony_flowchart.md) |
| **Live Bridge** | Production GCP Cloud Run Speech-to-Speech WebSocket Implementation | [server.js](file:///c:/Users/mjrob/OneDrive/Desktop/App%20Repo%20s/RHIVE-Construction/RHIVE-Telephony/server.js) |
