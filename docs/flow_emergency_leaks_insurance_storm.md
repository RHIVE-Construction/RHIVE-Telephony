# 🚨 Flow 2: Emergency Active Leaks & Insurance Storm Damage Restoration
**System OS:** ANTIGRAVITY V8.0  
**Swarm Revision:** Revision 60 Production Release  
**Target Environment:** Google Cloud Run (`rhive-voice-live-bridge`)  
**Live Telephony Endpoint:** `+1 (839) 867-6637` (+1 839-86-ROOFS)  
**Assigned Swarm Role:** Honey (AI Executive Concierge) & Emergency Dispatch / Insurance Restoration Swarm  

---

## 1. Executive Workflow Scope & Operating Model

This flow unifies all urgent distress calls, active water intrusions, and insurance storm damage restoration inquiries across the Wasatch Front. It eliminates IVR delays by answering directly on Ring 1, implements the mandatory **Address Audio Confirmation Gate**, derives the colloquial **`propertyName` shorthand**, and strictly complies with UPPA statutory requirements.

```mermaid
flowchart TD
    Inbound["Caller Inbound: Active Leak or Storm/Hail Damage"] --> HoneyGreet["Honey Ring-1 Direct Greeting (Empathetic Triage)"]
    HoneyGreet --> AddressCapture["Address Capture & GIS Polygon Check (Utah County & Salt Lake County)"]
    
    AddressCapture --> AddressGate["Mandatory Address Audio Confirmation Gate:<br/>Honey reads back geocoded address, pauses, and awaits caller confirmation"]
    
    AddressGate --> DeriveShorthand["Derive & Adopt propertyName Shorthand:<br/>(e.g., 'the 4500 South property' or 'the 9820 South property')"]
    
    DeriveShorthand --> TriageBranch{"Distress Classification"}
    
    TriageBranch -->|"Active Water Intrusion / Deluge"| EmergencyTarp["Emergency Dispatch Protocol:<br/>$150 Fee Per Tarp Location Credited 100%"]
    EmergencyTarp --> CalcWindow["Calculate 3-Hour Arrival Cushion:<br/>(Next 1-Hr Calendar Slot via get_available_windows + 1 Hr Before/After)"]
    CalcWindow --> FeeAck{"Caller Acknowledges $150 Credited Fee?"}
    FeeAck -->|"Yes"| BookTarp["Lock 3-Hour Window in Google Calendar via book_inspection & Dispatch Crew Lead SMS"]
    BookTarp --> ClosingProtocol["4-Step Closing Protocol & hangup_call"]
    FeeAck -->|"No / Dispute"| FallbackExplain["Explain 100% Credit to Repair -> If declined, offer business-hours inspection"]
    
    TriageBranch -->|"Insurance Storm / Wind / Hail Damage"| ForensicAudit["Forensic Scope Detail Damage Inspection:<br/>Document visible storm damage & build scope for adjuster to provide informed baseline"]
    ForensicAudit --> AdjusterTime{"Adjuster Already Scheduled?"}
    AdjusterTime -->|"Yes"| MatchAdjuster["Sync Specialist On-Site Meeting with Adjuster Window"]
    AdjusterTime -->|"No / Undecided"| PreClaimAudit["Schedule Forensic Inspection Prior to Filing Claim"]
    MatchAdjuster --> CalcWindowIns["Calculate 3-Hour Arrival Window"]
    PreClaimAudit --> CalcWindowIns
    CalcWindowIns --> ProductStance["Owens Corning Duration Baseline<br/>(Duration FLEX Class 4 SBS presented strictly as optional upgrade, NOT pushed)"]
    ProductStance --> BookIns["Lock Appointment in 'RHIVE Project Inspections' Calendar"]
    BookIns --> ClosingProtocol
```

---

## 2. Core Business Invariants & Triage Logic

### A. Mandatory Address Audio Confirmation Gate & Property Name Shorthand
1. **Audio Confirmation Gate:**
   * When the caller mentions an address or city for an emergency leak or storm damage, Honey calls `verify_address` in the background.
   * Honey **MUST NOT** book a window or ask inspection questions until she audibly reads back the geocoded address (House Number, Street, City, Zip) and pauses:
     > *"Hi [Name], I have [Full Geocoded Address]—does that match your property?"*
   * Honey waits for verbal confirmation (*"Yes"*, *"That's it"*, *"Correct"*).
2. **Colloquial `propertyName` Adoption:**
   * Upon confirmation, the system derives the property shorthand:
     * Utah Grids: `the [Grid Coordinate] property` (e.g., `4500 South 700 East` $\rightarrow$ `the 4500 South property`).
     * Named Streets: `the [Number] [Street] property` (e.g., `9820 South 1300 East` $\rightarrow$ `the 9820 South property`).
   * Honey immediately adopts this shorthand on the very next turn and throughout the call:
     > *"Got it, Elena. To get our rapid crew scheduled for the 4500 South property right away, our emergency mobilization starts at one-fifty..."*

### B. Emergency Active Leak Dispatch & Tarping Policy
* **$150+ Standard Mobilization Fee (100% Credited):**
  * Standard emergency leak tarping starts at **$150+**, which covers a basic single-location rapid tarp and is **100% credited** directly toward the permanent repair or insurance restoration contract.
  * Fees scale upfront based on site complexity:
    - Multiple active leak locations across separate roof planes.
    - Steep roof pitch access requiring safety harness/anchor rigging.
    - Complex structural transitions (roof-to-wall step flashing failure, chimney cricket damage).
  * Honey clearly states and verifies caller acknowledgment before locking in dispatch:
    > *"Standard emergency mobilization starts at one-fifty, which is one hundred percent credited toward your repair. If our crew finds multiple leak spots or steep pitch access, they will go over any additional cost upfront before tarping. May I lock in the dispatch window?"*
* **Calculated 3-Hour Arrival Cushion Algorithm:**
  * Honey does not guess arrival times or quote static slots.
  * Queries Google Calendar API via DWD for the **next available 1-hour service slot** via `get_available_windows`.
  * Generates a **3-hour arrival cushion** (1 hour before to 1 hour after the slot).
  * Honey verbalizes: *"I can lock in our crew lead for an arrival between twelve noon and three PM today. Does that work for you?"*

### C. Insurance Storm & Hail Damage Restoration Policy (Strict UPPA Statutory Compliance)
* **UPPA Regulatory Invariant (Utah Code § 31A-26):**
  * Under Utah and federal statutes governing the **Unauthorized Practice of Public Adjusting (UPPA)**, roofing contractors, estimators, and AI agents are legally forbidden from stating whether damage "qualifies for a claim", making claim coverage determinations, or negotiating claim payouts on behalf of property owners.
  * What RHIVE **does**: Our Project Specialist conducts an **on-site forensic scope detail damage inspection** to document visible physical storm damage (impact hail hits, wind-creased or torn shingles, collateral gutter/vent damage) and prepare a detailed, objective contractor scope of work.
  * The property owner can then share this factual damage documentation directly with their insurance adjuster, giving them an informed baseline of physical conditions before making decisions.
* **Product Positioning Invariant (No Aggressive Upselling):**
  * Baseline specification is **Owens Corning Duration** architectural shingles.
  * **Duration FLEX Class 4 SBS polymer-modified shingles** is an available upgrade option, but Honey **must NOT push it** just because a storm or hail event occurred. It is offered neutrally if the caller inquires about maximum impact resistance.

---

## 3. Honey's Step-by-Step Conversational Scripts & Interactivity Rules

### Honey's Opening Lines & Variations (Empathetic Triage)
* **Standard Panic Response (Active Deluge):**
  > *"Oh no! Let us get an emergency tarp crew rolling to protect your home. What is your street address where water is coming in?"*
* **Storm Inquiry Response (Wind/Hail - UPPA Compliant):**
  > *"We specialize in forensic storm damage evaluations along the Wasatch Front. What city is your property located in?"*
* **Acoustic Rule:** Immediate empathy, <20 words per turn.

---

### Turn-by-Turn Logic (Live Validated Flow)

#### Turn 1: Emergency Address Capture
* **Caller:** *"Water is dripping through our ceiling right now from the rain! We need someone out to tarp it at 4500 South 700 East in Salt Lake City."*
* **Honey (<20 Words):**
  > *"Oh no! Let us get our crew out. I have 700 East, Salt Lake City, Utah 84102—does that match your property?"*
* **Action:** Honey calls `verify_address` and executes the mandatory audio confirmation gate.

#### Turn 2: Address Confirmation & Shorthand Adoption + Fee Disclosure
* **Caller:** *"Yes, that is accurate."*
* **Honey (<25 Words):**
  > *"Got it! To get our rapid crew scheduled for the 4500 South property right away, our emergency mobilization starts at one-fifty, fully credited toward repair. May I check the next arrival window?"*
* **Action:** Honey adopts shorthand `"the 4500 South property"` and calls `get_available_windows`.

#### Turn 3: 3-Hour Arrival Cushion Offer
* **Caller:** *"Yes, please check."*
* **Honey (<25 Words):**
  > *"I can lock in our crew lead for an arrival between twelve noon and three PM today. Does that window work for you?"*

#### Turn 4: Dispatch Lock & Closing Protocol
* **Caller:** *"Yes, please get them here as fast as possible!"*
* **Honey (<20 Words):**
  > *"Dispatch locked for twelve-to-three! Our crew lead will text you en route. Is there anything else I can assist with?"*
* **Action:** Honey calls `book_inspection`, triggers dispatch notifications, and executes `hangup_call`.

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
