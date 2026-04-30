# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.0.4] - 2026-04-30

### Security

- **Remove hard-coded Azure credentials from build output** — Eliminated all `import.meta.env.VITE_AZURE_SPEECH_KEY` / `VITE_AZURE_REGION` references from the source. Vite's compile-time string replacement was silently embedding the developer's Azure key into every production bundle and distributed ZIP. Credentials are now read exclusively from `browser.storage.local` at runtime.

### Fixed

- **Options page blocked by voice-loading error** — When the stored Azure key was invalid or expired, the options UI rendered only an error Alert and hid the API-key input fields, preventing users from correcting their credentials. The error is now displayed non-destructively at the top of the form while keeping all inputs accessible.
- **Setup badge "!" persists after configuration** — The toolbar icon's orange exclamation badge was set on install but never cleared. It now auto-removes as soon as both `azureKey` and `azureRegion` are saved, and re-appears if either is removed.

## [1.0.3] - 2026-04-24

### Changed

- **AudioService state management refactored** — Playback state (`idle`/`loading`/`playing`/`paused`/`ended`/`error`) is now managed internally by `AudioService` via a constructor `onStateChange` callback. Event listeners are attached synchronously when the `<audio>` element is created, eliminating the race condition that caused cached replay to display a red error border.

### Fixed

- **Cached replay error state** — Replaying audio from the local cache no longer incorrectly triggers the red error border and exclamation button. The previous `setTimeout(..., 50)` delay for attaching event listeners has been removed; state transitions are now immediate and reliable.

## [1.0.2] - 2026-04-23

### Added

- **Offscreen Document audio playback** (Chrome MV3) — Audio is now played inside a dedicated offscreen document instead of the page's content script. This eliminates playback failures on CSP-strict sites (e.g., GitHub, Twitter/X) and avoids page-environment restrictions entirely.
- **Cross-browser audio bridge** — Background script routes all playback commands to the offscreen document on Chrome, while Firefox/MV2 continues to use the legacy content-script-based playback as a fallback.

### Changed

- **Mini Window is now a pure remote control** — The floating UI no longer creates `HTMLAudioElement` or `MediaSource` directly. It sends control commands (`PLAY_AUDIO`, `PAUSE_AUDIO`, `RESUME_AUDIO`, `STOP_AUDIO`, `REPLAY_AUDIO`) to the background script and updates its visual state based on broadcasted `AUDIO_STATE` / `UPDATE_UI_STATE` messages.
- **Popup playback is unified** — The popup no longer instantiates its own `AudioService`. It reuses the same offscreen (or fallback) player as the mini window, ensuring state consistency across all surfaces.
- **Manifest permissions** — Added `'offscreen'` permission for Chrome; automatically excluded for Firefox builds.

### Fixed

- **Context menu missing content-script injection** — Right-click "Read selected text" now ensures the content script is loaded before requesting UI display, preventing the mini window from silently failing to appear.
- **Mini window mount race condition** — Added safeguard for `document.body` not being ready at the moment of mount; the observer now waits for `<body>` to exist before appending the floating widget.

## [1.0.1] - 2026-04-23

### Changed

- **Remove broad host permissions** — Eliminated declarative `content_scripts` with `matches: ["<all_urls>"]` from the manifest. The content script is now injected on-demand via `activeTab` + `scripting` when the user triggers a keyboard shortcut or context menu, avoiding Chrome Web Store's broad-permission warning.
- **Update project description** — Changed to "A refined text-to-speech solution" across the manifest, README, and package metadata.
- **Update Azure setup docs** — Replaced outdated Azure Voice Gallery references and screenshots in Options pages (About, Document) with the current [Azure AI Foundry](https://ai.azure.com) portal guidance.

### Fixed

- Broken image references in About and Document tabs now point to the correct `where-are-key-and-region.png` asset.

## [1.0.0] - 2026-04-23

### Added

- **Onboarding flow** — Multi-step setup wizard for first-time users to configure Azure Speech credentials.
- **Keyboard shortcuts** — `Alt+Shift+L` to read selected text, `Alt+Shift+S` to stop audio playback.
- **Help modal** — In-app guidance showing how to obtain Azure Speech credentials, accessible from the onboarding configuration step.
- **Unified design system** — New `theme.css` with CSS custom properties for light/dark mode, consistent across all surfaces.
- **New UI components** — `Button`, `Input`, `Select`, `Card`, `Slider`, `Badge`, `Alert`, `Icon`, `StepIndicator`, `Modal`.
- **Options page tabs** — Reorganized into General, Audio, API, Help, About, and Sponsor tabs.
- **Icon set expansion** — Added 16px and 32px variants for sharper rendering across contexts.

### Changed

- **Complete UI overhaul** — Unified styling across Popup, Options, Onboarding, and Mini Window.
- **Azure documentation updated** — Help content now points to the new [Azure AI Foundry](https://ai.azure.com) portal with updated screenshots and instructions.
- **Mini Window** — Improved drag-and-drop positioning with localStorage persistence and refined playback state visuals.
- **Background script** — Shortcut handler now queries the already-injected content script instead of dynamically injecting code, improving Chrome MV3 reliability.

### Removed

- Legacy CSS files: `apple-theme.css`, `settings.css`, `popup.css`.
- Outdated Azure Voice Gallery screenshot.
