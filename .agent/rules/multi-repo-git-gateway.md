# MULTI-REPO & MULTI-ORGANIZATION GIT GATEWAY INVARIANTS

## 1. Turn 0 Domain & Directory Resolution
Before running any `git commit`, `git push`, branch creation, or editing code, the agent MUST resolve the intended repository domain and physical working directory from the user's task context:
- **Omni-Clone / Digital Twin / Sovereign Cockpit:** `Michaelrhive/michael-omni-clone` (branch: `master`)
  * Local Path: `C:\Users\mjrob\OneDrive\Desktop\App Repo s\MJR_EPA`
- **Telephony / Voice Swarm / WebSockets:** `RHIVE-Construction/RHIVE-Telephony` (branch: `michael` / `main`)
  * Local Path: `C:\Users\mjrob\OneDrive\Desktop\App Repo s\RHIVE-Construction\RHIVE-Telephony`
- **Roofing OS / Customer Website / CRM:** `RHIVE-Construction/rhive-os` (branch: `Michael-Branch` / `main`)
  * Local Path: `C:\Users\mjrob\OneDrive\Desktop\App Repo s\RHIVE-Construction\rhive-os`
- **Commercial Quotes & Bids:** `Michaelrhive/Commercial-Quote-Builder` (branch: `main`)
  * Local Path: `C:\Users\mjrob\OneDrive\Desktop\App Repo s\rhive-commercial-quote-system`
- **AI Learning / Skills / Benchmarks:** `RHIVE-AI-LEARNING/ai-learning` (branch: `antigravity/add-v8-standards` / `main`)
  * Local Path: `C:\Users\mjrob\OneDrive\Desktop\App Repo s\ai-learning`
- **Instant Estimator / Solar / Photos:** `Michaelrhive/instant-estimate-with-photos` (branch: `main`)
  * Local Path: `C:\Users\mjrob\Desktop\app repos\instant-estimate-with-photos`

*MANDATORY DIRECTORY ISOLATION:* If your current working directory (`Cwd`) does not match the target project path above, DO NOT execute code or git commands in `MJR_EPA`. Run all commands strictly inside that satellite's dedicated folder.

## 2. Upstream & Remote Pre-Flight Verification
- Never commit blindly to the currently checked-out branch without verifying its target remote.
- Run `git remote -v` and `git branch --show-current` before staging or committing.
- If the current branch belongs to a different domain (e.g. `sheenav2` from `rhive-os` when doing an Omni-Clone or General task), STOP immediately and switch/branch to the appropriate target repository branch.

## 3. Banned Bare Push Invariant
- **BANNED:** Bare `git push` with no arguments.
- **MANDATORY:** Always specify the explicit target remote and branch:
  `git push <remote> <branch>` (e.g. `git push origin master` or `git push rhive-os main`).

## 4. Secret Push Protection Pre-Audit
- Never stage or commit `.env`, `*service-account*.json`, `token.json`, Twilio auth tokens, or private keys.
- Always inspect staged files before committing: `git diff --cached --name-only`.

## 5. Master Deduplicated 32-Repository Catalog (Personal & Work Accounts)
Counted once per unique repository across `mjrob14repos` and `Michaelrhive`:

| Unique Repository (`owner/repo`) | Primary Account / Org | Mounted Local Path | Scope & Status |
| :--- | :--- | :--- | :--- |
| `Michaelrhive/michael-omni-clone` | Work (`Michaelrhive`) | `C:\Users\mjrob\OneDrive\Desktop\App Repo s\MJR_EPA` | **Hub: Sovereign Cockpit** |
| `RHIVE-Construction/RHIVE-Telephony` | Work (`RHIVE-Construction`) | `C:\Users\mjrob\OneDrive\Desktop\App Repo s\RHIVE-Construction\RHIVE-Telephony` | **Sat 1: Telephony Swarm** |
| `RHIVE-Construction/rhive-os` | Work (`RHIVE-Construction`) | `C:\Users\mjrob\OneDrive\Desktop\App Repo s\RHIVE-Construction\rhive-os` | **Sat 2: Roofing OS & CRM** |
| `Michaelrhive/Commercial-Quote-Builder` | Work (`Michaelrhive`) | `C:\Users\mjrob\OneDrive\Desktop\App Repo s\rhive-commercial-quote-system` | **Sat 3: Commercial Quotes** |
| `RHIVE-AI-LEARNING/ai-learning` | Work (`RHIVE-AI-LEARNING`) | `C:\Users\mjrob\OneDrive\Desktop\App Repo s\ai-learning` | **Sat 4: AI Learning** |
| `Michaelrhive/instant-estimate-with-photos` | Work (`Michaelrhive`) | `C:\Users\mjrob\Desktop\app repos\instant-estimate-with-photos` | **Sat 5: Instant Estimator** |
| `Michaelrhive/Design-Coding` | Work (`Michaelrhive`) | `C:\Users\mjrob\Documents\Design-Coding` | Brand Design System |
| `mjrob14repos/testwebsitedelete` | Personal (`mjrob14repos`) | Cloud / On-Demand | Personal Test Sandbox |
| `Michaelrhive/Canvas-Tool` | Work (`Michaelrhive`) | Cloud / On-Demand | Canvas Map Lead Gen |
| `Michaelrhive/Commercial-Quote-Builder1.001` | Work (`Michaelrhive`) | Cloud / On-Demand | Quote V1 Archive |
| `Michaelrhive/Commission-Compass` | Work (`Michaelrhive`) | Cloud / On-Demand | Commission Tracker |
| `Michaelrhive/Copy-of-input-1.1` | Work (`Michaelrhive`) | Cloud / On-Demand | Input Function Sandbox |
| `Michaelrhive/Email-Triage-idea-1-` | Work (`Michaelrhive`) | Cloud / On-Demand | AI Email Triage |
| `Michaelrhive/Hunni-RHIVE-ASSISTANT-1.0000` | Work (`Michaelrhive`) | Cloud / On-Demand | Honey Assistant V1 |
| `Michaelrhive/Income-Actionator` | Work (`Michaelrhive`) | Cloud / On-Demand | Income Pipeline Tool |
| `Michaelrhive/insprprtcntagmtQTtool` | Work (`Michaelrhive`) | Cloud / On-Demand | Inspection Quote Tool |
| `Michaelrhive/Instant-Estimate-` | Work (`Michaelrhive`) | Cloud / On-Demand | Instant Estimate Landing |
| `Michaelrhive/MJR-EPA` | Work (`Michaelrhive`) | Cloud / On-Demand | EPA Legacy Repo |
| `Michaelrhive/New-Intake` | Work (`Michaelrhive`) | Cloud / On-Demand | Customer Intake Form |
| `Michaelrhive/QUOTE-TOOL-INPUT-ITEM-CATOLOG` | Work (`Michaelrhive`) | Cloud / On-Demand | Quote Tool Catalog |
| `Michaelrhive/Repo-1-Test` | Work (`Michaelrhive`) | Cloud / On-Demand | Sandbox Repo |
| `Michaelrhive/RHIVE-OS-` | Work (`Michaelrhive`) | Cloud / On-Demand | Roofing CRM Archive |
| `Michaelrhive/RHIVE-OS-1.0-Antigravity-1` | Work (`Michaelrhive`) | Cloud / On-Demand | Antigravity 1.0 OS |
| `Michaelrhive/RHIVE-OS-Layout` | Work (`Michaelrhive`) | Cloud / On-Demand | OS Layout Design |
| `Michaelrhive/RHIVE-QOS` | Work (`Michaelrhive`) | Cloud / On-Demand | Quantum OS Data |
| `Michaelrhive/rhiveassistant` | Work (`Michaelrhive`) | Cloud / On-Demand | Assistant Public Repo |
| `Michaelrhive/Roof-Measurement-Pro` | Work (`Michaelrhive`) | Cloud / On-Demand | PDF Roof Measurement |
| `Michaelrhive/testrep1` | Work (`Michaelrhive`) | Cloud / On-Demand | Historical Test Repo |
| `Michaelrhive/https-github.com-Michaelrhive-michael-omni-clone` | Work (`Michaelrhive`) | Cloud / On-Demand | Clone Sync Utility |
| `MJR-Omni/demo-repository` | Work (`MJR-Omni`) | Cloud / On-Demand | Demo Repository |
| `MJR-Omni/Michaelrhive-michael-omni-clone` | Work (`MJR-Omni`) | Cloud / On-Demand | Omni Mirror |
| `jamesgimena/rhive-os` | Partner Collaboration | Cloud / On-Demand | Partner Branch |

