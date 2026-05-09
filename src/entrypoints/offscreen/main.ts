import { AudioService } from "../../services/audioService";
import { createTTSStream } from "../../utils/audioPlayer";

let lastAudioState = "idle";
let cachedRequestKey: string | null = null;
let activeRequestKey: string | null = null;
let playSequence = 0;

function createRequestCacheKey(request: any): string {
  return JSON.stringify({
    version: 1,
    text: request.text,
    voice: request.settings?.voice || "",
    rate: Number(request.settings?.rate ?? 1),
    pitch: Number(request.settings?.pitch ?? 1),
    azureRegion: request.credentials?.azureRegion || "",
    outputFormat: "webm-24khz-16bit-mono-opus",
  });
}

function hasValidCacheFor(key: string): boolean {
  return cachedRequestKey === key && audioService.hasCachedAudio();
}

function broadcastState(state: string, hasCache = audioService.hasCachedAudio()) {
  try {
    chrome.runtime.sendMessage({ type: "AUDIO_STATE", state, hasCache });
  } catch {
    // Ignore
  }
}

const audioService = new AudioService({
  onStateChange: (state, hasCache) => {
    lastAudioState = state;
    broadcastState(state, hasCache);
  },
});

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  (async () => {
    switch (request.type) {
      case "OFFSCREEN_PING": {
        sendResponse({ pong: true });
        break;
      }

      case "PLAY": {
        sendResponse({ success: true });
        const requestKey = createRequestCacheKey(request);
        const sequence = ++playSequence;

        (async () => {
          try {
            if (hasValidCacheFor(requestKey)) {
              activeRequestKey = null;
              await audioService.replayFromCache();
              return;
            }

            activeRequestKey = requestKey;
            cachedRequestKey = null;
            audioService.clearCache();
            broadcastState("loading", false);

            const response = await createTTSStream(
              request.text,
              request.settings,
              request.credentials
            );

            if (sequence !== playSequence) return;

            await audioService.playStreamingResponse(
              response,
              request.settings.rate || 1
            );

            if (
              sequence === playSequence &&
              activeRequestKey === requestKey &&
              lastAudioState === "ended" &&
              audioService.hasCachedAudio()
            ) {
              cachedRequestKey = requestKey;
            }
            if (activeRequestKey === requestKey) {
              activeRequestKey = null;
            }
            // Playback finished or was aborted; state already broadcast by AudioService
          } catch (err: any) {
            if (activeRequestKey === requestKey) {
              activeRequestKey = null;
            }
            if (err?.name !== "AbortError") {
              console.error("[Offscreen] Play error:", err);
              broadcastState("error", hasValidCacheFor(requestKey));
            }
          }
        })();
        break;
      }

      case "PAUSE": {
        audioService.pauseAudio();
        sendResponse({ success: true });
        break;
      }

      case "RESUME": {
        try {
          await audioService.resumeAudio();
        } catch (err) {
          console.error("[Offscreen] Resume failed:", err);
        }
        sendResponse({ success: true });
        break;
      }

      case "STOP": {
        playSequence++;
        const wasSynthesizing = activeRequestKey != null;
        activeRequestKey = null;
        await audioService.stopAudio();
        if (wasSynthesizing) {
          cachedRequestKey = null;
          audioService.clearCache();
        }
        broadcastState("idle", cachedRequestKey != null && audioService.hasCachedAudio());
        sendResponse({ success: true });
        break;
      }

      case "REPLAY": {
        sendResponse({ success: true });
        playSequence++;
        activeRequestKey = null;
        (async () => {
          try {
            if (!cachedRequestKey || !audioService.hasCachedAudio()) {
              audioService.clearCache();
              throw new Error("No cached audio available");
            }
            await audioService.replayFromCache();
            // Playback finished or was aborted; state already broadcast by AudioService
          } catch (err: any) {
            if (err?.name !== "AbortError") {
              console.error("[Offscreen] Replay error:", err);
              broadcastState("error", cachedRequestKey != null && audioService.hasCachedAudio());
            }
          }
        })();
        break;
      }

      default: {
        sendResponse({ success: false, error: "Unknown command" });
      }
    }
  })();

  // Return true to indicate we will call sendResponse asynchronously
  return true;
});

console.log("[Narravo] Offscreen document loaded");
