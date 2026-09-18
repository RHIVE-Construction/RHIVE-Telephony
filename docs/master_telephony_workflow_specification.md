# 🏗️ RHIVE Master Telephony Swarm: Technical Workflow Specification
**System OS:** ANTIGRAVITY V8.0 (Sovereign Execution Builder)  
**Swarm Revision:** Revision 60 Production Release  
**Target Environment:** Google Cloud Run (`rhive-voice-live-bridge`)  
**Live Telephony Endpoint:** `+1 (839) 867-6637` (+1 839-86-ROOFS)  
**Assigned Swarm Roles:** Honey (AI Roofing Specialist), Kara Robinson (VP Operations), Michael Robinson (General Contractor)  

---

## 1. Architectural Topology & Inbound Routing

The RHIVE telephony swarm operates on a unified, high-speed multimodal pipeline connecting Twilio Media Streams to **Google Gemini 3.1 Flash Live** (`gemini-3.1-flash-live-preview`) over full-duplex WebSockets.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   RHIVE INBOUND TELEPHONY ROUTING MATRIX                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ Inbound Call -> Direct Ring-1 Answer (No Robotic Menus / Zero IVR Delay)    │
│ Honey Greeting: "Thanks for calling R-hive Construction! I'm Honey,         │
│                  R-hive's AI specialist, how may I assist your call?"       │
│                  (+150ms carrier settle pause + audible vocal smile)        │
├─────────────────────────────────────────────────────────────────────────────┤
│ Address Audio Confirmation Gate:                                            │
│ -> Geocodes via verify_address, reads back full address, pauses and awaits   │
│    verbal confirmation.                                                     │
│ -> Immediately derives & adopts colloquial propertyName shorthand           │
│    (e.g., 'the 9917 South property' or 'the 10437 Shady Plum property').    │
├─────────────────────────────────────────────────────────────────────────────┤
│ Intent Triage -> Instant Dynamic Branching:                                 │
│ ├── 1. Quotes & Replacements -> Flow 1 (Certified Aerial Remote Quote)      │
│ ├── 2. Active Leak / Tarping  -> Flow 2 (Emergency Dispatch, $150+ Credited)│
│ ├── 3. Insurance Storm Claim  -> Flow 2 (UPPA Scope of Work Assessment)     │
│ ├── 4. Trades & Suppliers     -> Flow 3 (Kara Screened Warm Whisper Bridge) │
│ └── 5. Cold Pitch / Solicit   -> Flow 4 (Anti-Spam Quarantine & Disconnect) │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Dedicated Standalone Flow Specifications (The 4 Pillars)

Each canonical flow has been architected into a comprehensive standalone deep-dive artifact containing step-by-step turn-by-turn conversational scripts, tone modulation formulas, and broad operator test script variations:

| Pillar | Dedicated Master Artifact | Primary Swarm Role | Target Outcome |
| :--- | :--- | :--- | :--- |
| **Flow 1** | [flow_quotes_residential_commercial.md](file:///C:/Users/mjrob/.gemini/antigravity/brain/0ea1d186-c0b7-4d42-8bc0-3cea6c384d14/flow_quotes_residential_commercial.md) | Honey & Project Specialist Team | Certified Quote Requested & Project Specialist SMS Dispatched |
| **Flow 2** | [flow_emergency_leaks_insurance_storm.md](file:///C:/Users/mjrob/.gemini/antigravity/brain/0ea1d186-c0b7-4d42-8bc0-3cea6c384d14/flow_emergency_leaks_insurance_storm.md) | Honey & Emergency Dispatch / Claim Swarm | Calculated 3-Hour Arrival Cushion Booked ($150 Credited Fee Acknowledged) |
| **Flow 3** | [flow_trade_suppliers_permitting_compliance.md](file:///C:/Users/mjrob/.gemini/antigravity/brain/0ea1d186-c0b7-4d42-8bc0-3cea6c384d14/flow_trade_suppliers_permitting_compliance.md) | Honey & Kara (VP Operations) | Screened Warm Whisper PBX Transfer to Kara (+150ms Settle, Say 1/2 or Press 1/2) |
| **Flow 4** | [flow_anti_spam_quarantine.md](file:///C:/Users/mjrob/.gemini/antigravity/brain/0ea1d186-c0b7-4d42-8bc0-3cea6c384d14/flow_anti_spam_quarantine.md) | Honey (Anti-Spam Sentry) | 2-Question Qualification Gate -> Polite Quarantine to info@rhiveconstruction.com |

---

## 3. Universal Business Invariants & Algorithmic Rules

### A. The Mandatory Address Audio Confirmation Gate & Property Name Shorthand
1. **Audio Confirmation Gate:**
   * When the caller states an address or location, Honey calls `verify_address` in the background.
   * Honey **MUST NOT** proceed to MeasureCall questions or booking until she audibly reads back the geocoded address (House Number, Street, City, Zip) and pauses:
     > *"Hi [Name]! I have [Full Geocoded Address]—does that match your property?"*
   * Honey waits for verbal confirmation (*"Yes"*, *"That is correct"*, *"That's our house"*).
2. **Colloquial `propertyName` Shorthand:**
   * Upon confirmation, the system derives the property shorthand:
     * Utah Grids: `the [Grid Coordinate] property` (e.g., `9917 S 3200 W` $\rightarrow$ `the 9917 South property`).
     * Named Streets: `the [Number] [Street] property` (e.g., `10437 Shady Plum Way` $\rightarrow$ `the 10437 Shady Plum property`).
   * Honey immediately adopts this shorthand on the very next turn and throughout the call:
     > *"Perfect! For the 9917 South property, are you looking to replace an aging roof..."*
   * The shorthand is stamped into Google Chat and Google Drive lead dossiers as `🏷️ Property Name: [propertyName]`.

### B. Why Certified Quotes Do NOT Require On-Site Truck Rolls
* A certified quote has a **Project Design Specialist** order custom high-resolution aerial GIS measurements and build out the complete engineering quote. 
* We do **NOT** need to be physically at the address to engineer a full certified replacement quote.

### C. The ONLY 5 Exceptions Requiring An On-Site Physical Inspection:
1. **Active Leak Tarping:** We are tarping an active leak (Standard mobilization starts at $150+, credited 100% to permanent repair/claim; escalates for multi-leak locations, steep pitch access, or roof-to-wall damage). *(Routes to Flow 2)*.
2. **Roof Older Than 15 Years (Repair Request):** Shingles have reached asphalt embrittlement; physical evaluation is required to diagnose whether a repair will hold or if a full replacement is necessary.
3. **Commercial Roofing (All Types):** Applies to all commercial properties—both low-slope/flat single-ply membrane (TPO/PVC/EPDM) and steep-pitch commercial roofs—requiring commercial core sampling, rooftop HVAC curb diagnostics, parapet wall flashing inspection, or structural engineering review.
4. **Insurance Damage / Storm Claim (Strict UPPA Statutory Compliance):** 
   * Under Utah Code § 31A-26 (Unauthorized Practice of Public Adjusting), contractors cannot determine claim approval, advise whether damage qualifies for insurance coverage, or negotiate claim payouts.
   * RHIVE conducts an **on-site forensic scope damage inspection** to document visible storm damage and prepare an objective, factual contractor scope of work for the property owner to share with their insurance adjuster, giving them an informed baseline of physical conditions before making any decisions. *(Routes to Flow 2)*.
5. **Explicit Homeowner Request:** Homeowner or commercial property manager explicitly requests an on-site diagnostic consultation and walk.

### D. Standardized Stages & Quote Bucket Offerings
```
├── 1. ESTIMATE STAGE
│   └── Estimate: Used exclusively for rough ballpark figures or instant online pricing.
│
└── 2. CERTIFIED QUOTE REQUESTED STAGE (The Quote Bucket)
    ├── Certified Quote: Used exclusively for a full roof replacement.
    ├── Repair Plan: Covers a single leak, damaged slope, or specific targeted fix.
    ├── Service Agreement: Governs recurring commercial/residential maintenance & multi-year penetration seals.
    └── Maintenance Visit: A one-time routine tune-up, debris clear, and penetration seal.
```

### E. The Calculated 3-Hour Arrival Cushion Algorithm
Instead of quoting arbitrary time blocks, Honey calculates dynamic arrival windows via Google Calendar:
1. The system queries Google Calendar API via DWD for the **next available 1-hour service appointment** (e.g., 1:00 PM – 2:00 PM).
2. The engine injects a **1-hour cushion before and 1-hour cushion after**, generating a customer-facing 3-hour arrival cushion:
   $$\text{Arrival Window} = [\text{Start Time} - 1\,\text{hr},\; \text{End Time} + 1\,\text{hr}]$$
   *(Example: A 1:00 PM – 2:00 PM technician slot yields a promised customer arrival window of 12:00 PM – 3:00 PM).*
3. Honey verbalizes: *"I can lock in our crew lead for an arrival between twelve noon and three PM today. Does that work for you?"*

### F. Product Positioning Invariant (No Aggressive Upselling)
* Standard **Owens Corning Duration** architectural shingles is our baseline specification.
* **Duration FLEX Class 4 SBS polymer-modified shingles** is an available upgrade option, but Honey **must NOT push it** just because a storm or hail event occurred. It is offered neutrally if the caller inquires about maximum impact resistance.

### G. Kara Warm Whisper Protocol Specification
* **Target:** Kara Robinson (`+1 801-441-0024`).
* **+150ms Settle Delay:** `<break time="150ms"/>` immediately upon Kara answering her phone to prevent carrier audio clipping.
* **Spoken Briefing:** Honey announces caller name, organization, job site/permit/invoice number, and topic.
* **Dual Input Modes:** Kara can either **speak ("One" / "Two")** or **press DTMF ("1" / "2")**:
  - Say "1" or press 1: Accept call and bridge audio.
  - Say "2" or press 2: Send caller to priority memo.
* **Carrier PBX Greeting Filter:** Server actively filters out carrier PBX greetings (*"connecting to kara at our hive construction..."*), preventing voicemail or automated answering messages from false-triggering conference connection.
* **Fallback Protocol:** If Kara declines or does not answer within 18 seconds (4 rings), Honey takes a detailed memo and commits a priority callback within 30 minutes, dispatching an immediate SMS alert to Kara and Michael.

---

## 4. Master Telephony Swarm Cross-Flow Artifact Links

| Swarm Node | Scope & Function | Document Link |
| :--- | :--- | :--- |
| **Flow 1** | Residential & Commercial Certified Quotes, Repairs & Maintenance | [flow_quotes_residential_commercial.md](file:///C:/Users/mjrob/.gemini/antigravity/brain/0ea1d186-c0b7-4d42-8bc0-3cea6c384d14/flow_quotes_residential_commercial.md) |
| **Flow 2** | Emergency Active Leak Tarping ($150+ Credited) & Insurance Restoration | [flow_emergency_leaks_insurance_storm.md](file:///C:/Users/mjrob/.gemini/antigravity/brain/0ea1d186-c0b7-4d42-8bc0-3cea6c384d14/flow_emergency_leaks_insurance_storm.md) |
| **Flow 3** | Trade Partners, Material Suppliers, Municipal Permitting & Compliance | [flow_trade_suppliers_permitting_compliance.md](file:///C:/Users/mjrob/.gemini/antigravity/brain/0ea1d186-c0b7-4d42-8bc0-3cea6c384d14/flow_trade_suppliers_permitting_compliance.md) |
| **Flow 4** | Cold Solicitor & Unsolicited Marketing Anti-Spam Perimeter Quarantine | [flow_anti_spam_quarantine.md](file:///C:/Users/mjrob/.gemini/antigravity/brain/0ea1d186-c0b7-4d42-8bc0-3cea6c384d14/flow_anti_spam_quarantine.md) |
| **Master Spec** | Complete Master Telephony System Specifications & Swarm Architecture | [master_telephony_workflow_specification.md](file:///C:/Users/mjrob/.gemini/antigravity/brain/0ea1d186-c0b7-4d42-8bc0-3cea6c384d14/master_telephony_workflow_specification.md) |
| **Flowchart** | Visual End-to-End Decision Flowchart & Script Matrix | [customer_telephony_flowchart.md](file:///C:/Users/mjrob/.gemini/antigravity/brain/0ea1d186-c0b7-4d42-8bc0-3cea6c384d14/customer_telephony_flowchart.md) |
| **Live Bridge** | Production GCP Cloud Run Speech-to-Speech WebSocket Implementation | [server.js](file:///c:/Users/mjrob/OneDrive/Desktop/App%20Repo%20s/MJR_EPA/services/telephony-live-bridge/server.js) |
| **A2A Results** | Overnight Agent-to-Agent Simulation Test Suite & Performance Log | [rev60_a2a_simulation_results.json](file:///C:/Users/mjrob/.gemini/antigravity/brain/0ea1d186-c0b7-4d42-8bc0-3cea6c384d14/rev60_a2a_simulation_results.json) |
