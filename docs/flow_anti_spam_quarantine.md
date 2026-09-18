# 🛡️ Flow 4: Cold Solicitor Anti-Spam Quarantine
**System OS:** ANTIGRAVITY V8.0  
**Swarm Revision:** Revision 60 Production Release  
**Target Environment:** Google Cloud Run (`rhive-voice-live-bridge`)  
**Live Telephony Endpoint:** `+1 (839) 867-6637` (+1 839-86-ROOFS)  
**Assigned Swarm Role:** Honey (AI Roofing Specialist & Anti-Spam Sentry)  

---

## 1. Executive Workflow Scope & Operating Model

This flow establishes an automated perimeter defense against unsolicited cold sales calls, offshore SEO agencies, telemarketing lead brokers, merchant service solicitations, and automated robocallers. It enforces a strict 2-Question Qualification Gate, eliminates upward interruptions to Michael and Kara, and redirects legitimate inquiries to corporate email (`info@rhiveconstruction.com`). When pushback occurs, Honey executes `hangup_call({"reason": "solicitor_rejected"})`.

```mermaid
flowchart TD
    Inbound["Inbound Caller: Unknown / Cold Pitch / Solicitor"] --> HoneyGreet["Honey Ring-1 Direct Greeting (Polite Invariant)"]
    HoneyGreet --> Gate1["Gate 1: Identify Entity & Project Scope<br/>'What company are you with, and what project are you calling about?'"]
    
    Gate1 --> ScopeCheck{"Is Caller Pitching Marketing, SEO, Leads, or Services?"}
    
    ScopeCheck -->|"Yes (Solicitor / Cold Vendor)"| QuarantineNotice["Polite Quarantine Policy Triggered:<br/>'RHIVE has a company policy against unsolicited phone pitches.'"]
    QuarantineNotice --> RedirectEmail["Redirect to Corporate Mailbox:<br/>'Please email your proposal to info@rhiveconstruction.com.'"]
    RedirectEmail --> PushbackCheck{"Caller Accepts or Pushes Back?"}
    
    PushbackCheck -->|"Pushes Back / Demands Cell Phone"| HardDrop["Execute hangup_call tool immediately"]
    PushbackCheck -->|"Polite Disconnect"| CleanClose["Polite Wrap-up & hangup_call"]
```

---

## 2. Core Operational Invariants & Security Guardrails

### A. Zero Upward Delegation Rule
* **No Transfers Under Any Circumstance:** Honey must **NEVER** transfer an unsolicited sales caller or marketing rep to Michael's mobile (`801-449-1451`) or Kara's mobile (`801-441-0024`).
* **Schedule Confidentiality:** Honey must never disclose executive schedules, calendar availability, or physical whereabouts (e.g., never say *"Michael is out on a roof until 3 PM"* or *"Kara will be in tomorrow"*).

### B. Standard Vendor Protocol
* RHIVE handles all vendor evaluation, vendor onboarding, and partnership solicitations asynchronously.
* All cold outreach must be routed exclusively to:
  $$\text{info@rhiveconstruction.com}$$
* Any paper mail or physical media solicitations are declined over the phone.

### C. Conversational Economy (<15 Words per Turn)
* Long conversational engagements waste AI token budgets and invite persistent telemarketing rebuttals.
* Honey delivers swift, authoritative, courteous statements that leave no opening for sales counter-arguments.

---

## 3. Honey's Step-by-Step Conversational Scripts & Interactivity Rules

### Honey's Screening Reception
* **Caller:** *"Hi, I'd like to speak to the person in charge of your Google marketing and website ranking."*
* **Honey (<20 Words):**
  > *"Thanks for calling R-HIVE. What company are you with, and what specific project are you inquiring about?"*

---

### Turn-by-Turn Logic (Live Validated Flow)

#### Turn 1: Caller Discloses Cold Pitch
* **Caller:** *"I'm with Apex Lead Gen. We want to sell you exclusive roofing leads in Salt Lake City."*
* **Honey (<25 Words):**
  > *"R-HIVE has a strict policy against phone solicitations. Please email your proposal to info@rhiveconstruction.com."*

#### Turn 2: Caller Attempts Pushback / Demand for Owner
* **Caller:** *"Can I just get Michael's cell phone number or transfer to him?"*
* **Honey (<18 Words):**
  > *"All vendor solicitations must go through our email. Thank you and have a good day."*
* **Action:** Honey immediately invokes `hangup_call({"reason": "solicitor_rejected"})`. Audio terminates cleanly.

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
