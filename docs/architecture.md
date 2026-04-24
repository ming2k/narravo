# Architecture Overview

This project is built using the **WXT (Web Extension Toolbox)** framework, which provides a modern developer experience for building cross-browser extensions.

## Core Structure

The extension follows a modular architecture centered around WXT's entrypoints system:

### 1. Entrypoints (`src/entrypoints/`)
- **Background (`background.ts`)**: The brain of the extension. Manages context menus, keyboard shortcuts, installation logic, and coordinates communication between all other contexts. It routes audio commands to the offscreen document (Chrome) or the content script (Firefox).
- **Content Script (`content.ts`)**: Injected into web pages. Renders the `miniWindow` floating UI and acts as a pure state display — it no longer creates `HTMLAudioElement` or `MediaSource` directly (except as a Firefox fallback).
- **Offscreen (`offscreen/`)**: A dedicated offscreen document (Chrome MV3 only) that hosts `AudioService` and plays audio independently of page environments. This bypasses CSP restrictions on strict sites like GitHub or Twitter/X.
- **Popup (`popup/`)**: The main interface accessible via the browser toolbar. Built with React.
- **Options (`options/`)**: The settings page (Options UI). Manages API keys, voice selection, and audio preferences.
- **Onboarding (`onboarding/`)**: A dedicated page for first-time setup and Azure credential verification.

### 2. Services (`src/services/`)
- **`ttsService.ts`**: Handles direct communication with the Azure Speech API, including SSML generation and voice listing.
- **`audioService.ts`**: A robust wrapper around the `MediaSource` API for real-time audio streaming, caching, and replay. It now manages its own playback-state lifecycle via an `onStateChange` callback — event listeners are attached synchronously when the `<audio>` element is created, eliminating race conditions between playback and state broadcasting.

### 3. Utilities (`src/utils/`)
- **`settingsStorage.ts`**: Unified abstraction for `browser.storage.local`, including automatic schema migration.
- **`audioPlayer.js`**: High-level helpers for creating TTS streams and testing voices.
- **`miniWindow.ts`**: Pure TypeScript logic for creating and managing the UI overlay in the content script.

## Communication Flow

### Chrome MV3 (Offscreen Document)

1. **User Action**: User selects text and clicks "Read selected text" in the context menu (or presses `Alt+Shift+L`).
2. **Background**: Captures the request, fetches credentials, ensures the offscreen document exists, and sends `SHOW_UI` to the active tab's content script.
3. **Content Script**: Receives `SHOW_UI`, renders the mini window, and awaits state updates.
4. **Background**: Sends `PLAY` to the offscreen document with the text, voice settings, and Azure credentials.
5. **Offscreen**: Calls `TTSService` → `createStreamingResponse` → `AudioService.playStreamingResponse()`.
6. **Playback**: `AudioService` uses the `MediaSource` API (or Blob fallback) to play the stream as it downloads. Playback state (`loading` → `playing` → `ended`/`error`) is broadcast automatically via the `onStateChange` callback.
7. **State Sync**: The offscreen document sends `AUDIO_STATE` messages to the background, which forwards them as `UPDATE_UI_STATE` to the content script. The mini window updates its border color, button icon, and visibility accordingly.
8. **Controls**: Clicking the mini-window button sends `PAUSE_AUDIO` / `RESUME_AUDIO` / `REPLAY_AUDIO` / `STOP_AUDIO` to the background, which relays them to the offscreen document as `PAUSE` / `RESUME` / `REPLAY` / `STOP`.

### Firefox MV2 (Content-Script Fallback)

Firefox does not support offscreen documents. The flow is identical from the user's perspective, but audio playback happens inside the content script:

1. **Background**: Sends `PLAY_STREAMING_TTS` directly to the content script.
2. **Content Script**: Creates a local `AudioService` (with `onStateChange` wired to `setState`) and plays the stream directly.
3. **State Sync**: State updates happen locally within the content script; the mini window is updated synchronously.

## Key Design Decisions

- **AudioService owns its state**: Previously, event listeners were attached externally via `setTimeout(..., 50)`, which caused missed `ended` events during fast cached replay. Now `AudioService` attaches listeners synchronously inside `createAudio()` and broadcasts state through a constructor callback.
- **No duplicate audio elements**: `createAudio()` calls `cleanup()` first, which removes old listeners, revokes old Blob URLs, and nulls out the previous element before creating a new one.
- **Cross-browser abstraction**: The background script (`sendAudioControl`) transparently routes commands to either the offscreen document or the content script based on `chrome.offscreen` availability. The popup and mini window remain unaware of which backend is active.
