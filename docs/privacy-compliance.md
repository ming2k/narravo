# Privacy Compliance Guide

Use this document when filling out the **Privacy practices** tab on the Chrome Web Store and Firefox Add-ons submission pages. Copy the justifications directly into the store forms.

---

## Single Purpose Description

> A minimalist browser extension that reads selected text aloud using Azure's Neural Text-to-Speech API.

---

## Permission Justifications

### `activeTab`

> Narravo uses `activeTab` to identify the current browser tab when the user triggers a keyboard shortcut (Alt+Shift+L). The extension sends a message to the already-injected content script in that tab to retrieve the user's text selection and initiate playback. No browsing history or tab metadata is collected or transmitted.

### `contextMenus`

> Narravo adds a single context-menu item, "Read selected text", which appears only when the user right-clicks on a highlighted text selection. This is the primary user-initiated entry point for the extension's core feature. No menu items are injected without an explicit user selection.

### `scripting`

> Narravo uses `scripting` as a fallback mechanism to re-inject the content script (`content.js`) into the active tab only when the content script becomes unresponsive (for example, after a page refresh or when the tab was discarded). The injected file is bundled locally inside the extension package; no remote scripts are downloaded or executed.

### `storage`

> Narravo uses `storage.local` to persist user preferences (Azure Speech API key, region, voice, rate, pitch) and onboarding state entirely on the user's device. This data is never synced to external servers and is never shared with third parties.

### `notifications`

> Narravo uses notifications to display brief, non-intrusive alerts when required configuration is missing (e.g., Azure credentials not yet entered) or when a playback error occurs. No personal data is included in notification messages.

### Host Permission — `https://*.tts.speech.microsoft.com/*`

> This host permission is required for Narravo's sole external network call: sending the user's selected text (as SSML) to the Microsoft Azure Speech-to-Text API and receiving the synthesized audio stream in return. No other external domains are accessed. The text and API credentials are transmitted directly to Microsoft; Narravo does not proxy, log, or store the content on any intermediate server.

### Remote Code

> **Narravo does not use remote code.** All JavaScript is statically bundled at build time and ships inside the extension package. The extension does not use `eval()`, `new Function()`, dynamic `<script>` injection, or any mechanism to download and execute code from a remote source. Communication with `*.tts.speech.microsoft.com` is limited to standard HTTPS API requests that send text and receive audio data.

---

## Data Usage Certification

Use the following statement when certifying compliance with the Developer Program Policies:

> Narravo does not collect, sell, or share any user data. All settings are stored locally on the user's device via the browser's `storage.local` API. The only data transmitted off-device is the user's selected text and Azure API credentials, sent directly to Microsoft's Azure Speech Service endpoint (`*.tts.speech.microsoft.com`) over HTTPS for text-to-speech synthesis. No data is retained, logged, or processed by Narravo or any third party other than Microsoft Azure.

---

## Quick Reference Table (Copy-Paste)

| Field | Answer |
|-------|--------|
| **Single purpose** | Read selected text aloud using Azure Neural Text-to-Speech. |
| **activeTab** | Identify the current tab when a keyboard shortcut is pressed to request the selected text from the content script. |
| **contextMenus** | Provide the "Read selected text" right-click menu item on text selections. |
| **scripting** | Re-inject the local content script as a fallback when it becomes unresponsive after page refresh. |
| **storage** | Store user settings (API key, region, voice, rate, pitch) and onboarding state locally. |
| **notifications** | Alert the user about missing configuration or playback errors. |
| **Host permission** | Send selected text to `*.tts.speech.microsoft.com` and receive synthesized audio. |
| **Remote code** | Not used. All code is bundled locally; only standard HTTPS API calls to Azure are made. |
| **Data collection** | None. |
| **Data selling** | None. |
