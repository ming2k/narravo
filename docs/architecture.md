# Architecture Overview

This project is built using the **WXT (Web Extension Toolbox)** framework, which provides a modern developer experience for building cross-browser extensions.

## Core Structure

The extension follows a modular architecture centered around WXT's entrypoints system:

### 1. Entrypoints (`src/entrypoints/`)
- **Background (`background.ts`)**: The brain of the extension. Manages context menus, installation logic, and coordinates communication between the popup and content scripts.
- **Content Script (`content.ts`)**: Injected into web pages. It renders the `miniWindow` and interacts with the DOM to provide in-page TTS playback.
- **Popup (`popup/`)**: The main interface accessible via the browser toolbar. Built with React.
- **Options (`options/`)**: The settings page (Options UI). Manages API keys, voice selection, and audio preferences.
- **Onboarding (`onboarding/`)**: A dedicated page for first-time setup and Azure credential verification.

### 2. Services (`src/services/`)
- **`ttsService.ts`**: Handles direct communication with the Azure Speech API, including SSML generation and voice listing.
- **`audioService.ts`**: A robust wrapper around the `MediaSource` API for handling real-time audio streaming and caching.

### 3. Utilities (`src/utils/`)
- **`settingsStorage.ts`**: Unified abstraction for `browser.storage.local`, including automatic schema migration.
- **`audioPlayer.js`**: High-level helpers for creating TTS streams and testing voices.
- **`miniWindow.ts`**: Pure TypeScript logic for creating and managing the UI overlay in the content script.

## Communication Flow

1. **User Action**: User selects text and clicks "Read selected text" in the context menu.
2. **Background**: Captures the request, fetches credentials, and sends a `PLAY_STREAMING_TTS` message to the active tab.
3. **Content Script**: Receives the message, invokes `TTSService` via `createTTSStream`, and pipes the result into `AudioService`.
4. **Playback**: `AudioService` uses the `MediaSource` API to play the stream as it downloads.
