# Development Guide

## Commands

- `npm run dev`: Start development mode (Chrome by default).
- `npm run dev:firefox`: Start development mode in Firefox.
- `npm run build`: Build production versions.
- `npm run zip`: Package the extension for store submission.
- `npm run lint`: Run ESLint checks.

## Best Practices

### 1. Browser API
Always use the global `browser` object. WXT provides it cross-browser, and it's backed by `webextension-polyfill` automatically in the build process.

### 2. Styles
- **Popup/Options**: Use `styled-components` or standard CSS.
- **Content Script**: Be extremely careful with styles. Use a unique prefix (like `.narravo-*`) to avoid clashing with the host website's styles.

### 3. Entrypoints
When adding a new page (e.g., a dashboard):
1. Create a folder in `src/entrypoints/my-page/`.
2. Add `index.html` and `index.tsx`.
3. WXT will automatically detect it and generate the corresponding manifest entry.

### 4. Manifest Configuration
Do not edit `manifest.json` directly. Use `wxt.config.ts` to add permissions, host permissions, or web-accessible resources.

## Debugging the Extension

Debugging a browser extension is different from a standard web app because logic runs in different contexts.

### 1. Background Script
- **Where**: Open `chrome://extensions`, find Narravo, and click on **"service worker"** or **"background page"**.
- **What**: This is where you see logs from `background.ts`, network requests to Azure, and context menu events.

### 2. Popup UI
- **Where**: Right-click the extension icon in the toolbar and select **"Inspect"**.
- **Tip**: If the popup closes, the inspector might close. In Chrome, you can keep the inspector open by clicking the "device" icon or inspecting it as a standalone tab via its URL (found in the inspector).

### 3. Content Scripts
- **Where**: Open the **DevTools (F12)** on any regular website.
- **Context**: In the "Console" tab, look for the dropdown that says `top` and change it to `Narravo` (or the extension's ID) to access the extension's environment. Logs from `content.ts` will appear here.

### 4. Options & Onboarding Pages
- These are standard HTML pages. Just right-click anywhere on the page and select **"Inspect"**.

### 5. WXT Dev Server Logs
- Check your **terminal** where `npm run dev` is running. WXT will report build errors, manifest issues, and file system events there.


## Testing & Quality Assurance

All verification procedures, including manual testing checklists and automated Vitest testing instructions, have been moved to:

- [Testing & Verification Guide](testing.md)
