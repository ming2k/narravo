import { AudioService } from "../../services/audioService";
import { createTTSStream } from "../../utils/audioPlayer";

const audioService = new AudioService();
let currentAudio: HTMLAudioElement | null = null;

function broadcastState(state: string, hasCache: boolean = false) {
  try {
    chrome.runtime.sendMessage({ type: "AUDIO_STATE", state, hasCache });
  } catch {
    // Ignore
  }
}

function attachAudioListeners() {
  const audio = audioService.getCurrentAudio();
  if (!audio || audio === currentAudio) return;
  currentAudio = audio;

  audio.addEventListener("play", () => broadcastState("playing", audioService.hasCachedAudio()));
  audio.addEventListener("playing", () => broadcastState("playing", audioService.hasCachedAudio()));
  audio.addEventListener("pause", () => {
    broadcastState(audio.ended ? "ended" : "paused", audioService.hasCachedAudio());
  });
  audio.addEventListener("ended", () => broadcastState("ended", audioService.hasCachedAudio()));
  audio.addEventListener("waiting", () => broadcastState("loading", audioService.hasCachedAudio()));
  audio.addEventListener("error", () => broadcastState("error", audioService.hasCachedAudio()));
  audio.addEventListener("timeupdate", () => {
    if (
      Number.isFinite(audio.duration) &&
      audio.duration > 0 &&
      audio.currentTime >= audio.duration - 0.1
    ) {
      broadcastState("ended", audioService.hasCachedAudio());
    }
  });
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  (async () => {
    switch (request.type) {
      case "OFFSCREEN_PING": {
        sendResponse({ pong: true });
        break;
      }

      case "PLAY": {
        try {
          broadcastState("loading");
          await audioService.stopAudio();
          currentAudio = null;

          const response = await createTTSStream(
            request.text,
            request.settings,
            request.credentials
          );

          const playPromise = audioService.playStreamingResponse(
            response,
            request.settings.rate || 1
          );

          // Give AudioService a moment to create the <audio> element
          setTimeout(() => attachAudioListeners(), 50);

          await playPromise;
          // Playback finished or was aborted
        } catch (err: any) {
          if (err?.name === "AbortError") {
            broadcastState("idle");
          } else {
            console.error("[Offscreen] Play error:", err);
            broadcastState("error", audioService.hasCachedAudio());
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
          broadcastState("error", audioService.hasCachedAudio());
        }
        sendResponse({ success: true });
        break;
      }

      case "STOP": {
        await audioService.stopAudio();
        audioService.clearCache();
        currentAudio = null;
        broadcastState("idle", false);
        sendResponse({ success: true });
        break;
      }

      case "REPLAY": {
        try {
          broadcastState("loading", true);
          const replayPromise = audioService.replayFromCache();
          setTimeout(() => attachAudioListeners(), 50);
          await replayPromise;
        } catch (err: any) {
          if (err?.name === "AbortError") {
            broadcastState("idle");
          } else {
            console.error("[Offscreen] Replay error:", err);
            broadcastState("error", audioService.hasCachedAudio());
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
