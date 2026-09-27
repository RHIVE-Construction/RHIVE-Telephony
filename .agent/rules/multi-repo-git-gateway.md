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
