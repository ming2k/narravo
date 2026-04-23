# Testing & Verification Guide

This guide covers how to verify that the extension is working correctly, both through manual steps and automated tests.

## Manual Testing

### 1. Loading the Extension
Depending on your environment, you may use automatic loading or manual loading.

#### A. Automatic (Standard Environments)
If your system allows WXT to launch a browser directly:
1. Run `npm run dev`.
2. WXT will build the extension and open a clean browser instance.

#### B. Manual "Load Unpacked" (Restricted Environments / Flatpak / Snap)
If you are using a browser installed via Flatpak, Snap, or in an environment where WXT cannot resolve the file path (throwing "File path cannot be resolved"):
1. Run `npm run dev`.
2. Look for the output: `ℹ Load ".output/chrome-mv3-dev" as an unpacked extension manually`.
3. Open your browser and navigate to `chrome://extensions` (Chrome) or `about:debugging` (Firefox).
4. Enable **"Developer mode"**.
5. Click **"Load unpacked"** and select the `.output/chrome-mv3-dev` folder.
6. **HMR Support**: Changes will still be watched. When you save a file, WXT will rebuild, and you can simply reload the page or click the "Reload" icon on the extension card in the browser.

---

### 2. Functional Verification Checklist
After loading the extension, perform the following tests to ensure stability:

#### A. Onboarding Flow
- [ ] If first-time install, the onboarding page should open automatically.
- [ ] Verify you can enter Azure API keys and save them.
- [ ] Test the "Speak" button on the onboarding page to confirm credentials work.

#### B. Context Menu
- [ ] Open any website (e.g., Wikipedia).
- [ ] Select a sentence.
- [ ] Right-click -> Select **"Read selected text"**.
- [ ] **Verification**: The mini-window should appear at the bottom, and audio should play.

#### C. Popup UI
- [ ] Click the extension icon in the toolbar.
- [ ] Type some text into the textarea.
- [ ] Click the "Speak" (Play) button.
- [ ] **Verification**: Status should change to "Generating...", and audio should play.
- [ ] Click the "Stop" button to ensure audio halts.

#### D. Options Page
- [ ] Right-click the extension icon -> **"Options"**.
- [ ] Change the voice, rate, or pitch.
- [ ] Save the settings.
- [ ] **Verification**: Go back to the popup/context menu and ensure the new settings are applied.

---

### 3. Cross-Browser Testing
- **Firefox**: Run `npm run dev:firefox`. Verify that the manifest V2 compatibility is handled correctly by WXT and that the UI renders properly in Firefox's sidebar/popup.

---

## Automated Testing

### Unit & Integration Tests
The project uses **Vitest**.
- **Run all tests**: `npm run test`
- **Watch mode**: `npm run test:watch`
- **UI Mode**: `npm run test:ui` (opens a browser-based test runner)
- **Coverage**: `npm run test:coverage`

Test files are located in `src/services/*.test.ts` or `src/__tests__/`. We use `jsdom` to simulate the browser environment.
