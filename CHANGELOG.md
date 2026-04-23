# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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
