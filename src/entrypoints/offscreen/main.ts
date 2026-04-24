import { AudioService } from "../../services/audioService";
import { createTTSStream } from "../../utils/audioPlayer";

const audioService = new AudioService({
  onStateChange: (state, hasCache) => {
    try {
      chrome.runtime.sendMessage({ type: "AUDIO_STATE", state, hasCache });
    } catch {
      // Ignore
    }
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
        try {
          const response = await createTTSStream(
            request.text,
            request.settings,
            request.credentials
          );
          await audioService.playStreamingResponse(
            response,
            request.settings.rate || 1
          );
          // Playback finished or was aborted; state already broadcast by AudioService
        } catch (err: any) {
          if (err?.name !== "AbortError") {
            console.error("[Offscreen] Play error:", err);
          }
        }
        sendResponse({ success: true });
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
        await audioService.stopAudio();
        audioService.clearCache();
        // Explicitly broadcast idle with no cache since clearCache happened after stopAudio
        try {
          chrome.runtime.sendMessage({ type: "AUDIO_STATE", state: "idle", hasCache: false });
        } catch {
          // Ignore
        }
        sendResponse({ success: true });
        break;
      }

      case "REPLAY": {
        try {
          await audioService.replayFromCache();
          // Playback finished or was aborted; state already broadcast by AudioService
        } catch (err: any) {
          if (err?.name !== "AbortError") {
            console.error("[Offscreen] Replay error:", err);
          }
        }
        sendResponse({ success: true });
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
