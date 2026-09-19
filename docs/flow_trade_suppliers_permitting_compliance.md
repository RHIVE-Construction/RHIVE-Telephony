# 🤝 Flow 3: Trade Partners, Suppliers, Permitting & Compliance
**System OS:** ANTIGRAVITY V8.0  
**Swarm Revision:** Revision 67 Master Alignment  
**Target Environment:** Google Cloud Run (`rhive-voice-live-bridge`)  
**Live Telephony Endpoint:** `+1 (839) 867-6637` (+1 839-86-ROOFS) *(All calls to RHIVE Main are forwarded to this line for Honey to answer directly)*  
**Telephony Engine:** Google Gemini 3.8 Live Multimodal Speech-to-Speech (`gemini-3.8-live` & `gemini-3.8-live-extended-thinking`)  
**Assigned Swarm Role:** Honey (AI Executive Switchboard) & Kara (RHIVE VP of Operations & Project Coordination)  
**Premier Subcontractor Partner:** Quality B Roofing  

---

## 1. Executive Workflow Scope & Operating Model

This pathway governs all operational, supply chain, municipal, and trade partner communications. Calls on this flow bypass retail sales triage and connect directly to Operations (Kara) via our low-latency **Warm Whisper Handoff Protocol** or execute `transfer_to_specialist({"targetSpecialist": "kara"})`. Zero IVR menu is used; Honey immediately identifies the commercial entity on Ring 1, maintaining the clean **600ms/150ms disconnect sequence** upon completion.

```mermaid
flowchart TD
    Inbound["Inbound Caller: Trade Partner, Supplier, City Inspector, Subcontractor"] --> HoneyGreet["Honey Ring-1 Direct Greeting (Operations Triage)"]
    HoneyGreet --> VipResolver["Dynamic Calendar & Gmail VIP Caller Resolver:<br/>Matches incoming caller against today's Google Calendar meetings & active Gmail threads"]
    VipResolver --> IdentifyOrg["Capture Entity, Contact Name & Jobsite / PO / Permit #"]
    
    IdentifyOrg --> ClassifyPartner{"Partner Classification"}
    
    ClassifyPartner -->|"Premier Subcontractor Partner (Quality B Roofing)"| WarmTransferKara["Warm Whisper Protocol to Kara (801-441-0024) via transfer_to_specialist"]
    ClassifyPartner -->|"Material Supplier (ABC Supply, SRS, QXO, Home Depot Pro, Lowe's Pro)"| WarmTransferKara
    ClassifyPartner -->|"City Building Official / Inspector (Sandy, Draper, SLC, Lehi, etc.)"| WarmTransferKara
    ClassifyPartner -->|"Specialty Crews (Gutters, Siding, Solar Detach, Framing)"| WarmTransferKara
    ClassifyPartner -->|"State DOPL / Compliance / Insurance COI"| WarmTransferKara
    ClassifyPartner -->|"Manufacturer Sales Rep (Owens Corning, GAF, Malarkey)"| WarmTransferKara
    
    WarmTransferKara --> SettlePause["+150ms Settle Pause (Carrier Anti-Clipping)"]
    SettlePause --> WhisperBrief["Honey Spoken Briefing to Kara:<br/>'Hi Kara, I have [Name] from [Company] regarding [Jobsite/PO].'"]
    WhisperBrief --> KaraDecision{"Kara Input:<br/>Dual Voice ('1'/'2') or DTMF (1/2)"}
    
    KaraDecision -->|"Press 1 or Say 'One' (Accept)"| BridgeCall["Live Two-Way Audio Bridge Established with Caller"]
    KaraDecision -->|"Press 2 or Say 'Two' (Decline/Busy)"| FallbackSMS["Intelligent Two-Way Fallback SMS Triggered from Kara's Line (801-441-0024)"]
    KaraDecision -->|"No Answer (18s Timeout)"| FallbackSMS
    
    FallbackSMS --> PriorityMemo["Honey Takes Detailed Spoken Memo & Dispatches Tri-Channel Push to Kara & Michael"]
    PriorityMemo --> ClosingProtocol["4-Step Closing Protocol & hangup_call"]
```

---

## 2. Core Operational Invariants & Entity Architecture

### A. Dynamic Calendar & Gmail VIP Caller Resolver
* **Automated Schedule & Thread Inspection:**
  * When a trade partner, supplier, or inspector calls from a known or unknown number, the telephony bridge queries Google Calendar DWD for today's active schedule and scans recent Gmail inbox threads for matching sender names or domain signatures.
  * If a city inspector or vendor has an inspection or delivery scheduled on today's calendar (e.g. "Sandy City Final Roof Inspection" or "ABC Supply Drop - 9917 South"), Honey instantly connects the context:
    > *"Hi Dave! Are you calling regarding the Sandy City inspection scheduled on 9917 South today? Let me connect you directly with Kara right now."*
  * This cuts triage latency to under 3 seconds and presents an elite enterprise partner experience.

### B. Recognized Trade & Institutional Entities
1. **Premier Roofing Subcontractor Partner:**
   * **Quality B Roofing** (RHIVE's premier roofing installation partner for residential and commercial crews)
2. **Material Supply Houses:**
   * **ABC Supply Co.** (Murray, Salt Lake City, Orem)
   * **SRS Distribution / Sunbelt Supplies** (Salt Lake City, West Valley)
   * **QXO** (formerly Bradco Supply / Building Products)
   * **Home Depot Pro Desk & Lowe's Commercial Pro**
3. **Municipal Permitting & Building Inspection Departments:**
   * Sandy City Community Development & Building Division
   * Draper City Building Department
   * Salt Lake City Building Services & Permitting
   * South Jordan Building & Safety Division
   * Lehi, West Jordan, Murray, and Utah County jurisdictions
4. **Specialty Trade Subcontractors:**
   * 5" & 6" Continuous Seamless Gutter & Downspout crews
   * Solar Detach & Reset engineering technicians
   * Soffit, Fascia, and Architectural Siding crews
   * Structural Framing & Decking replacement teams
5. **Regulatory & Compliance Entities:**
   * **Utah DOPL** (Division of Occupational and Professional Licensing)
   * General Contractor Insurance COI (Certificates of Insurance) coordinators
   * Worker's Compensation Fund (WCF) & safety compliance officers
6. **Manufacturer Territory Managers:**
   * Owens Corning Roofing Specialists & Area Sales Managers
   * GAF Commercial & Residential Territory Managers

---

## 3. Kara Warm Whisper Protocol Specification

When an operational caller is identified, Honey executes `transfer_to_specialist({"targetSpecialist": "kara", "reason": "material_delivery"})` to perform an outbound whisper leg to Kara's direct line while maintaining soft branded hold audio on the caller leg.

### A. The Acoustic Handshake & Settle Pause
* **Carrier Audio Clipping Defense:** Many mobile carriers (Verizon, AT&T, T-Mobile) truncate the initial 100ms–250ms of audio when a cell phone answers.
* **Invariant:** Honey injects a mandatory **+150ms settle pause** (`<break time="150ms"/>`) before speaking the whisper payload.
* **Carrier PBX Greeting Bypass:** The bridge automatically filters out carrier ringing, JustCall forwarding messages ("Connecting your call..."), and voicemail prompts before triggering whisper playback.

### B. Spoken Whisper Script Template
```text
<speak>
  <break time="150ms"/>
  Hi Kara, Honey here. I have [Contact Name] from [Organization] on the line regarding [Jobsite Address / PO / Permit Number].
  Press 1 or say "connect" to take this call. Press 2 or say "voicemail" to send to priority memo.
</speak>
```

### C. Fallback, Intelligent Two-Way SMS & Priority Dispatch
* If Kara declines or does not answer within 18 seconds (4 rings):
  1. **Intelligent Fallback SMS:** The system automatically fires an SMS to the caller from Kara's line (`801-441-0024`):
     > *"Hi [Contact Name], Kara here with RHIVE Construction. I'm currently on an active jobsite walk, but received your call regarding [Jobsite/PO]. Please reply directly to this text with your notes or questions and I'll respond immediately."*
  2. **Honey Informs Caller:**
     > *"Kara is currently walking an active jobsite. I just sent you a text directly from her mobile line so you can message her back in real time. Would you like me to take down a quick note for her as well?"*
  3. **Caller Note Capture & Tri-Channel Push:** Honey captures caller notes and mobile callback number, immediately dispatching a formatted card to Google Chat (`spaces/AAQABQzOXI0`) and SMS to Kara & Michael.

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
| **Live Bridge** | Production GCP Cloud Run Speech-to-Speech WebSocket Implementation | [server.js](file:///c:/Users/mjrob/OneDrive/Desktop/App%20Repo%20s/RHIVE-Construction/RHIVE-Telephony/server.js) |
