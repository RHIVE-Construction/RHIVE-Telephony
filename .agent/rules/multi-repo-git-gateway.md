# MULTI-REPO & MULTI-ORGANIZATION GIT GATEWAY INVARIANTS

## 1. Turn 0 Domain Resolution
Before running any `git commit`, `git push`, or branch creation, the agent MUST resolve the intended repository domain from the user's task context:
- **Omni-Clone / Digital Twin / Executive Assistant:** `Michaelrhive/michael-omni-clone` (branch: `master`)
- **Telephony / Voice Swarm / WebSockets:** `RHIVE-Construction/RHIVE-Telephony` (branch: `main`)
- **Roofing OS / Customer Website / CRM:** `RHIVE-Construction/rhive-os` (branch: `main`)
- **Instant Estimator / Solar / Photos:** `Michaelrhive/instant-estimate-with-photos` (branch: `master`)
- **Commercial Quotes & Bids:** `Michaelrhive/Commercial-Quote-Builder` (branch: `main`)
- **AI Learning / Skills / Benchmarks:** `RHIVE-AI-LEARNING/ai-learning` (branch: `main`)

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
