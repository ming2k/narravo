# Distribution Guide

This guide covers publishing Narravo to browser extension stores.

---

## Chrome Web Store

### 1. Register as a Developer

- Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/).
- Sign in with a Google account.
- Pay the one-time **$5 registration fee**.

### 2. Create a New Item

1. Click **"New Item"**.
2. Upload `.output/narravo-x.x.x-chrome.zip`.

### 3. Fill in Store Listing Details

| Field | Guidance |
|-------|----------|
| **Description** | Use the text from `public/_locales/en/messages.json` or README. Keep it concise. |
| **Category** | Recommended: **Productivity** or **Accessibility**. |
| **Language** | English (default). Add more if you localize. |

### 4. Upload Screenshots

Chrome requires at least one screenshot. Recommended sizes:

- **1280×800** (preferred)
- **640×400** (minimum)

Capture the popup, options page, and the mini-window in action. A short **promotional tile** (440×280) is optional but improves visibility.

### 5. Privacy Policy

Narravo processes all data locally and only communicates with Microsoft Azure's Speech API. A simple privacy policy is required. Example:

> Narravo does not collect, store, or share any user data. Text selections and Azure API keys remain on the user's device. Audio is streamed directly to Microsoft Azure Speech Services.

Host this on a public URL (e.g., GitHub Pages) and link it in the listing.

### 6. Submit for Review

Click **"Submit for Review"**. Approval typically takes **1–3 business days**. You will receive an email when the status changes.

---

## Firefox Add-ons (AMO)

### 1. Register an Account

- Go to the [Firefox Extension Developer Hub](https://addons.mozilla.org/developers/).
- Sign in with a Mozilla account.

### 2. Submit a New Add-on

1. Click **"Submit a New Add-on"**.
2. Choose **"On this site"** (listed).
3. Upload `.output/narravo-x.x.x-firefox.zip`.

### 3. Upload Source Code

Because Narravo uses WXT (a build step), Mozilla requires the source code:

1. When prompted, check **"Yes"** for "Do you use a build tool?"
2. Upload `.output/narravo-x.x.x-sources.zip`.
3. Add build instructions:
   ```
   npm install
   npm run build:firefox
   ```

### 4. Fill in Listing Details

Same guidance as Chrome: description, screenshots, category, and privacy policy.

### 5. Submit for Review

Firefox reviews are usually faster than Chrome, often within **a few hours to one day**.

---

## Updating an Existing Extension

1. Bump the version in `package.json` (e.g., `1.0.0` → `1.0.1`).
2. Update `CHANGELOG.md`.
3. Commit and tag: `git tag v1.0.1`.
4. Rebuild and re-package: `npm run zip` (and `npm run zip:firefox`).
5. Upload the new ZIP in the respective developer dashboard.
6. Submit for review.

---

## Multi-Browser Publishing Checklist

- [ ] Version bumped in `package.json`
- [ ] `CHANGELOG.md` updated
- [ ] Git tag created (`git tag vX.X.X`)
- [ ] Chrome ZIP generated and tested
- [ ] Firefox ZIP + sources generated
- [ ] Screenshots ready (1280×800)
- [ ] Privacy policy URL live
- [ ] Store descriptions proofread
- [ ] Submitted to Chrome Web Store
- [ ] Submitted to Firefox Add-ons
