# RHIVE WORKSPACE & GOOGLE CLOUD PERMISSIONS INVARIANTS

## 1. Multi-Account Identity Auto-Provisioning
Whenever creating or configuring Google Drive folders, Google Sheets, Google Docs, or Cloud Storage buckets for team, client, or contractor collaboration:
- **Dual-Account Writer Rule:** Always grant explicit `role: 'writer'` permissions to both:
  - Work Account: `michael@rhiveconstruction.com`
  - Personal Account: `mjrob14@gmail.com`
- This ensures Michael can upload, drag-and-drop, and edit files from whichever Google Chrome account profile is currently active without encountering permission denial blocks.

## 2. Link Sharing Invariants for Collaborative Deliverables
- **Spreadsheet Collaboration:** Any Google Sheet deployed for external collaboration or handoff (e.g. to David, field inspectors, or trade partners) MUST have permission set to:
  `{ role: 'writer', type: 'anyone' }` (Anyone with the link can edit).
  This eliminates Google sign-in friction for field personnel on mobile devices.
- **Evidence Vault & Photo Proof:** Any Google Drive folder holding photo evidence, documents, or asset records MUST have permission set to:
  `{ role: 'reader', type: 'anyone' }` (Anyone with the link can view).
  Additionally, every file inside the folder must inherit or have `anyoneWithLink` reader access so that thumbnail previews (`=IMAGE(...)`) and hyperlinks open seamlessly without login redirects.

## 3. Direct Cloud Drop Invariant (Banned Memory Scraping)
- Never attempt to scrape images, file buffers, or media assets from local browser process memory, LevelDB cache directories, or browser session storage.
- Provision a dedicated Google Drive folder, provide the link to the user for upload, and ingest all uploaded assets cleanly via the Google Drive API.
