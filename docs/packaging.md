# Packaging Guide

This guide explains how to build and package Narravo for distribution.

---

## Prerequisites

- Node.js 18.x or later
- All changes committed and tagged (e.g., `git tag v1.0.0`)

## Version Check

Before packaging, verify the version in `package.json`. WXT automatically copies this value into the extension manifest:

```json
{
  "version": "1.0.0"
}
```

If you need to bump the version, edit `package.json`, rebuild, and commit the change.

---

## Package for Chrome

Build the production bundle and create a store-ready ZIP:

```bash
npm run build
npm run zip
```

**Output:**

```
.output/narravo-1.0.0-chrome.zip
```

This file is ready for upload to the Chrome Web Store.

---

## Package for Firefox

Build and package the Firefox-compatible bundle:

```bash
npm run build:firefox
npm run zip:firefox
```

**Outputs:**

```
.output/narravo-1.0.0-firefox.zip       # Extension bundle
.output/narravo-1.0.0-sources.zip      # Source code (required by Mozilla)
```

Mozilla requires the source archive for review when the extension uses a build tool like WXT. Keep both files.

---

## Verify the Package

Unzip the archive and confirm it contains:

- `manifest.json`
- `background.js`
- `content-scripts/content.js`
- `popup.html`, `options.html`, `onboarding.html`
- `assets/` (icons and images)
- `_locales/` (i18n messages)

Do **not** include:

- `node_modules/`
- `src/` (source code)
- `.env` files
- `.output/`, `.wxt/`, or other build artifacts

These are already excluded by `.gitignore` and WXT's build process.

---

## Next Steps

See [Distribution Guide](distribution.md) for uploading to the Chrome Web Store and Firefox Add-ons.
