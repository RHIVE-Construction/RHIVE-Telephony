# 🏗️ RHIVE Master Telephony Swarm: Technical Workflow Specification
**System OS:** ANTIGRAVITY V8.0 (Sovereign Execution Builder)  
**Swarm Revision:** Revision 67 Production Release  
**Target Environment:** Google Cloud Run (`rhive-voice-live-bridge`)  
**Live Telephony Endpoint:** `+1 (839) 867-6637` (+1 839-86-ROOFS) *(All calls to RHIVE Main are forwarded here via JustCall for Honey to answer directly)*  
**Assigned Swarm Roles:** Honey (AI Roofing Specialist), Kara Robinson (VP Operations), Michael Robinson (General Contractor)  
**Core Voice Engine:** Google Gemini 3.8 Live (`gemini-3.8-live` & `gemini-3.8-live-extended-thinking`)  

---

## 1. Architectural Topology & Inbound Routing

The RHIVE telephony swarm operates on a unified, high-speed multimodal pipeline connecting Twilio Media Streams to **Google Gemini 3.8 Live** (`gemini-3.8-live` and `gemini-3.8-live-extended-thinking`) over full-duplex WebSockets.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   RHIVE INBOUND TELEPHONY ROUTING MATRIX                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ Inbound Call -> Forwarded via JustCall -> Ring-1 Direct Answer (No IVR)      │
│ Honey Greeting: "Hi! This is Honey! R-hive's AI Roofing Specialist,         │
│                  how may I assist your call today?"                         │
│                  (+150ms carrier settle pause + radiant vocal smile)        │
├─────────────────────────────────────────────────────────────────────────────┤
│ First Name Spelling Verification Gate:                                      │
│ -> "Hi Sarah! Is that spelled S-A-R-A-H?"                                   │
│ -> Honey pauses and waits for confirmation right there.                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ Address Audio Confirmation Gate:                                            │
│ -> Geocodes via verify_address, reads back full address digit-by-digit,     │
│    pauses and awaits verbal confirmation.                                   │
│ -> Immediately derives & adopts colloquial propertyName shorthand           │
│    (e.g., 'the 9917 South property' or 'the 10437 Shady Plum property').    │
├─────────────────────────────────────────────────────────────────────────────┤
│ Intent Triage -> Instant Dynamic Branching:                                 │
│ ├── 1. Quotes & Replacements -> Flow 1 (Certified Aerial Remote Quote)      │
│ ├── 2. Active Leak / Tarping  -> Flow 2 (Emergency Dispatch, Insurance/Cred) │
│ ├── 3. Insurance Storm Claim  -> Flow 2 (UPPA Scope of Work Assessment)     │
│ ├── 4. Trades & Suppliers     -> Flow 3 (Kara Screened Warm Whisper Bridge) │
│ └── 5. Cold Pitch / Solicit   -> Flow 4 (Anti-Spam Quarantine & Disconnect) │
└─────────────────────────────────────────────────────────────────────────────┘
```

> [!NOTE]
> **JustCall Forwarding Infrastructure:**
> Inbound calls dialed to RHIVE Main numbers are seamlessly forwarded to `+1 (839) 867-6637` within the JustCall carrier configuration. Honey answers directly on the first ring, completely eliminating robotic touch-tone menus while keeping JustCall's central CDR records and call logs synchronized.

---

## 2. Dedicated Standalone Flow Specifications (The 4 Pillars)

Each canonical flow has been architected into a comprehensive standalone deep-dive artifact containing step-by-step turn-by-turn conversational scripts, tone modulation formulas, and broad operator test script variations:

| Pillar | Dedicated Master Artifact | Primary Swarm Role | Target Outcome |
| :--- | :--- | :--- | :--- |
| **Flow 1** | [flow_quotes_residential_commercial.md](file:///c:/Users/mjrob/OneDrive/Desktop/App%20Repo%20s/RHIVE-Construction/RHIVE-Telephony/docs/flow_quotes_residential_commercial.md) | Honey & Project Specialist Team | Certified Aerial CAD Quote Requested, Google Solar Stamped, or On-Site Window Booked |
| **Flow 2** | [flow_emergency_leaks_insurance_storm.md](file:///c:/Users/mjrob/OneDrive/Desktop/App%20Repo%20s/RHIVE-Construction/RHIVE-Telephony/docs/flow_emergency_leaks_insurance_storm.md) | Honey & Emergency Dispatch / Claim Swarm | Calculated 3-Hour Arrival Cushion Booked (Insurance Tarping Approved / 100% Credited) |
| **Flow 3** | [flow_trade_suppliers_permitting_compliance.md](file:///c:/Users/mjrob/OneDrive/Desktop/App%20Repo%20s/RHIVE-Construction/RHIVE-Telephony/docs/flow_trade_suppliers_permitting_compliance.md) | Honey & Kara (VP Operations) | Screened Warm Whisper PBX Transfer to Kara (+150ms Settle, Say 1/2 or Press 1/2, 25s Timeout) |
| **Flow 4** | [flow_anti_spam_quarantine.md](file:///c:/Users/mjrob/OneDrive/Desktop/App%20Repo%20s/RHIVE-Construction/RHIVE-Telephony/docs/flow_anti_spam_quarantine.md) | Honey (Anti-Spam Sentry) | 2-Question Qualification Gate -> Polite Quarantine to info@rhiveconstruction.com (Zero Upward Transfer) |

---

## 3. Universal Business Invariants & Algorithmic Rules

### A. The Mandatory First Name Spelling & Address Audio Confirmation Gates
1. **First Name Spelling Verification Gate:**
   * As soon as the caller provides their first name, Honey verifies the spelling immediately:
     > *"Awesome! Is that spelled S-A-R-A-H?"*
   * Honey pauses and waits for verbal confirmation (*"Yes"*, *"That's it"*) before proceeding.
2. **Audio Confirmation Gate:**
   * When the caller states an address or location, Honey calls `verify_address` in the background.
   * Honey **MUST NOT** proceed to MeasureCall questions or booking until she audibly reads back the geocoded address (House Number digit-by-digit, Street, City, Zip) and pauses:
     > *"I have one, zero, four, three, seven Shady Plum Way in South Jordan, Utah eight, four, zero, zero, nine—does that match your property?"*
   * Honey waits for verbal confirmation (*"Yes"*, *"That is correct"*, *"That's our house"*).
3. **Colloquial `propertyName` Shorthand:**
   * Upon confirmation, the system derives the property shorthand:
     * Utah Grids: `the [Grid Coordinate] property` (e.g., `9917 S 3200 W` $\rightarrow$ `the 9917 South property`).
     * Named Streets: `the [Number] [Street] property` (e.g., `10437 Shady Plum Way` $\rightarrow$ `the 10437 Shady Plum property`).
   * Honey immediately adopts this shorthand on the very next turn and throughout the call:
     > *"Perfect! For the 10437 Shady Plum property, is this for storm or insurance damage or an active leak inside the house right now?"*
   * The shorthand is stamped into Google Chat and Google Drive lead dossiers as `🏷️ Property Name: [propertyName]`.

### B. Remote Aerial CAD Precision & 15-Minute Smartphone Video Stream
* A certified quote has a **Project Specialist** order custom high-resolution aerial CAD measurements (via Google Solar and satellite CAD tools) and build out the complete engineering scope. 
* We do **NOT** need to be physically at the address to engineer a full certified replacement quote.
* Initial Google Solar measurements (pitches, SQ per pitch, facet count, total squares with waste factor) are stamped into customer records upon address confirmation.
* For roofs visible from the ground and minor repairs, Honey offers a **15-Minute Remote Phone Video Call Inspection** conducted via **Google Meet / Google Calendar** invitations sent directly to the homeowner's phone.

### C. The ONLY 5 Exceptions Requiring An On-Site Physical Inspection:
1. **Commercial Roofing:** Applies to commercial properties—both low-slope/flat single-ply membrane (TPO/PVC) and steep-pitch commercial roofs—requiring commercial core sampling, rooftop HVAC curb diagnostics, parapet wall flashing inspection, or structural engineering review.
2. **Active Water Intrusion Tarping:** Emergency leak stabilization. If filing an insurance claim, emergency mitigation in our experience has always been approved by insurance; if not using insurance, standard mobilization is $150 (covering all leaks from a single weather event, 100% credited to permanent repair). *(Routes to Flow 2)*.
3. **Roof Older Than 15 Years (Repair Request):** Shingles have reached asphalt embrittlement (loss of volatile plasticizers); physical evaluation is required to diagnose whether a spot repair will hold or if a partial/full replacement is necessary.
4. **Insurance Damage / Storm Claim (Strict UPPA Statutory Compliance):** Under Utah Code § 31A-26 (UPPA), RHIVE conducts an **on-site roof damage inspection** to document visible storm damage and prepare an objective **scope of work report**, giving the property owner an informed baseline before meeting their adjuster. *(Routes to Flow 2)*.
5. **Explicit Homeowner Request:** Homeowner or commercial property manager explicitly requests an on-site physical walk.

> [!NOTE]
> **Slat Board Decking Is NOT an On-Site Inspection Trigger:**
> If slat board decking is likely (pre-1972 homes), we do **NOT** schedule an on-site inspection for that. Slat board decking cannot be inspected from the ground or outside anyway. It serves simply as a custom talking point about their roof (unless a public municipal permit for a re-deck was found on the parcel since then), and goes directly into our **unforeseen expenses** in the written terms and agreement.

### D. The 4 Asphalt Shingle Tiers & RHIVE Commercial Baseline (Do NOT Ask for Preferred Material)
* **We do NOT ask callers what material they prefer!** Owens Corning Duration is RHIVE's standard commercial baseline.
* The 4-tier manufacturer hierarchy is an educational reference only explained if the caller asks about shingle lines:
  1. **Standard / Contractor-Grade Architectural Shingles:** Installed on spec new builds; lowest quality architectural shingle.
  2. **Performance / Commercial Grade (Owens Corning Duration with SureNail):** **THIS IS WHERE RHIVE STARTS AS OUR STANDARD BASELINE!** SureNail triple-layer woven fabric strip, 130 mph wind resistance, and Class 3/4 tear defense.
  3. **Impact Resistant / Class 4 SBS Polymer-Modified (Duration FLEX):** Rubberized polymer-modified asphalt for hail armor and cold-weather flexibility (offered optionally, never pushed).
  4. **Designer / Luxury Craftsman (Woodcrest & Woodmoor):** Thick luxury craftsman shake profiles for high-end curb appeal.

### E. Gutter Scope Philosophy (Simple "Suit to the Body" Metaphor)
* The most cost-effective route is keeping the existing gutter system.
* However, every gutter system is tailored to the roof like a suit to the body—altering roof layers can affect water runoff patterns.
* If similar materials and thickness go back on, the old system usually supports the new roof fine.
* If the customer wants a full new system custom tailored, evaluating and getting new gutters is the easiest way to accomplish that.

### F. Simplified Customer Priority & DISC Question (<20 Words)
* Honey asks simply:
  > *"When it comes to your new roof, what matters most to you: getting on the schedule quickly, keeping costs down, or maximum warranty protection?"*
* Speed = D; Cost = C; Warranty = S/I.

### G. Kara Warm Whisper Protocol Specification
* **Target:** Kara Robinson (`+1 801-441-0024`).
* **+150ms Settle Delay:** `<break time="150ms"/>` immediately upon Kara answering her phone to prevent carrier audio clipping.
* **Spoken Briefing:** Honey announces caller name, organization, job site/permit/invoice number, and topic.
* **Dual Input Modes:** Kara can either **speak ("One" / "Two")** or **press DTMF ("1" / "2")**:
  - Say "1" or press 1: Accept call and bridge audio.
  - Say "2" or press 2: Send caller to priority memo & trigger intelligent two-way fallback SMS.
* **Screening Timeout:** 25 seconds.
* **Carrier PBX Greeting Filter:** Server actively filters out carrier PBX greetings (*"connecting to kara at our hive construction..."*), preventing voicemail or automated answering messages from false-triggering conference connection.
* **Fallback Protocol:** If Kara declines or does not answer within 25 seconds, Twilio redirects to `/transfer-fallback`, immediately reconnecting the caller to Honey Live and dispatching a proactive interactive SMS from Kara's line (`801-441-0024`).

### H. Graceful Hangup & Transfer Fallback Invariants
* **Closing Phrasing:** Always ask: *"Is there anything else I can assist you with today?"*.
* **1500ms Audio Buffer Drain:** `onTurnCompleteForHangup` waits 1500ms after speech generation finishes to allow Twilio's RTP jitter buffer to completely drain.
* **Immediate Drain When Speech Complete:** If `armGracefulHangup` is called when speech is already finished, drain begins immediately without a 20-second stall.
* **Farewell Barge-In Intercept:** If the caller speaks during the 1500ms farewell drain, the disconnect timer is cancelled immediately and the line remains open with Honey listening.
* **Zero Upward Delegation for Solicitors & Complaints:** Cold sales pitches, unverified threats, and angry roadside sign complaints are strictly quarantined to written review (`info@rhiveconstruction.com`) and never transferred live to Michael or Kara.

---

## 4. Master Telephony Swarm Cross-Flow Artifact Links

| Swarm Node | Scope & Function | Document Link |
| :--- | :--- | :--- |
| **Flow 1** | Residential & Commercial Certified Quotes, Repairs & Maintenance | [flow_quotes_residential_commercial.md](file:///c:/Users/mjrob/OneDrive/Desktop/App%20Repo%20s/RHIVE-Construction/RHIVE-Telephony/docs/flow_quotes_residential_commercial.md) |
| **Flow 2** | Emergency Active Leak Tarping ($150+ Credited) & Insurance Restoration | [flow_emergency_leaks_insurance_storm.md](file:///c:/Users/mjrob/OneDrive/Desktop/App%20Repo%20s/RHIVE-Construction/RHIVE-Telephony/docs/flow_emergency_leaks_insurance_storm.md) |
| **Flow 3** | Trade Partners, Material Suppliers, Municipal Permitting & Compliance | [flow_trade_suppliers_permitting_compliance.md](file:///c:/Users/mjrob/OneDrive/Desktop/App%20Repo%20s/RHIVE-Construction/RHIVE-Telephony/docs/flow_trade_suppliers_permitting_compliance.md) |
| **Flow 4** | Cold Solicitor & Unsolicited Marketing Anti-Spam Perimeter Quarantine | [flow_anti_spam_quarantine.md](file:///c:/Users/mjrob/OneDrive/Desktop/App%20Repo%20s/RHIVE-Construction/RHIVE-Telephony/docs/flow_anti_spam_quarantine.md) |
| **Master Spec** | Complete Master Telephony System Specifications & Swarm Architecture | [master_telephony_workflow_specification.md](file:///c:/Users/mjrob/OneDrive/Desktop/App%20Repo%20s/RHIVE-Construction/RHIVE-Telephony/docs/master_telephony_workflow_specification.md) |
| **Flowchart** | Visual End-to-End Decision Flowchart & Script Matrix | [customer_telephony_flowchart.md](file:///c:/Users/mjrob/OneDrive/Desktop/App%20Repo%20s/RHIVE-Construction/RHIVE-Telephony/docs/customer_telephony_flowchart.md) |
| **Live Bridge** | Production GCP Cloud Run Speech-to-Speech WebSocket Implementation | [server.js](file:///c:/Users/mjrob/OneDrive/Desktop/App%20Repo%20s/RHIVE-Construction/RHIVE-Telephony/server.js) |
