import { AudioService } from "../services/audioService";
import { createTTSStream } from "../utils/audioPlayer";
import { createMiniWindow } from "../utils/miniWindow";

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    console.log("[Narravo] Content script loaded");

    // State
    let miniWindow: any = null;
    let audioService: AudioService | null = null;
    let currentAudio: HTMLAudioElement | null = null;
    let lastRequest: any = null;
    let abortController: AbortController | null = null;
    let state = "idle"; // idle | loading | playing | paused | ended | error
    let offscreenHasCache = false;

    // Initialize on load
    initMiniWindow();

    function initMiniWindow() {
      // Clean up existing
      const existing = document.getElementById("tts-mini-window");
      if (existing) {
        existing.remove();
      }
      if (miniWindow) {
        miniWindow.destroy();
      }

      // Clean up orphaned audio elements
      document.querySelectorAll("audio.narravo-audio").forEach((audio: any) => {
        audio.pause();
        audio.src = "";
        audio.remove();
      });

      // Reset state
      miniWindow = null;
      audioService = null;
      currentAudio = null;
      lastRequest = null;
      abortController = null;
      state = "idle";
    }

    function getAudioService() {
      if (!audioService) {
        audioService = new AudioService();
      }
      return audioService;
    }

    function setState(newState: string) {
      if (state === newState) return;
      state = newState;
      updateUI();
    }

    function updateUI() {
      if (!miniWindow) return;

      // For offscreen path, we rely on background telling us hasCache via UPDATE_UI_STATE.
      // For fallback path, we check the local player.
      const player = audioService;
      const hasCachedAudio = player?.hasCachedAudio?.() || false;
      const canReplay = hasCachedAudio || offscreenHasCache || Boolean(lastRequest);

      miniWindow.updateStatus({ state, canReplay });
    }

    function showMiniWindow() {
      if (!miniWindow) {
        miniWindow = createMiniWindow();
        miniWindow.replayButton.addEventListener("click", handleControlClick);
        miniWindow.closeButton.addEventListener("click", handleClose);

        if (document.body) {
          document.body.appendChild(miniWindow.container);
        } else {
          // Body not ready yet (rare), wait for it
          console.warn("[Narravo] document.body not ready, deferring miniwindow mount");
          const observer = new MutationObserver(() => {
            if (document.body) {
              observer.disconnect();
              if (miniWindow) {
                document.body.appendChild(miniWindow.container);
              }
            }
          });
          observer.observe(document.documentElement, { childList: true });
        }
      }
      if (miniWindow?.container) {
        miniWindow.container.style.display = "flex";
        miniWindow.container.classList.add("is-visible");
        updateUI();
      }
    }

    function hideMiniWindow() {
      if (miniWindow) {
        miniWindow.container.style.display = "none";
        miniWindow.container.classList.remove("is-visible");
      }
    }

    async function handleClose(e: MouseEvent) {
      e.stopPropagation();
      e.preventDefault();

      // Notify background to stop audio (works for both offscreen and fallback)
      await browser.runtime.sendMessage({ type: "STOP_AUDIO" });
      lastRequest = null;

      if (miniWindow) {
        miniWindow.destroy();
        miniWindow.container.remove();
        miniWindow = null;
      }
      state = "idle";
    }

    async function handleControlClick(e: MouseEvent) {
      e.stopPropagation();
      e.preventDefault();

      if (state === "loading") return;

      if (state === "playing") {
        await browser.runtime.sendMessage({ type: "PAUSE_AUDIO" });
        return;
      }

      if (state === "paused") {
        await browser.runtime.sendMessage({ type: "RESUME_AUDIO" });
        return;
      }

      // Ended / Idle -> Replay
      await browser.runtime.sendMessage({ type: "REPLAY_AUDIO" });
    }

    // --- Legacy Firefox fallback audio functions ---

    async function stopAudio() {
      if (abortController) {
        abortController.abort();
        abortController = null;
      }

      if (audioService) {
        try {
          await audioService.stopAudio();
        } catch (err) {
          // Ignore stop errors
        }
      }

      currentAudio = null;
      setState("idle");
    }

    async function playFromRequest(request: any) {
      const player = getAudioService();

      if (abortController) {
        abortController.abort();
      }
      abortController = new AbortController();

      setState("loading");

      try {
        const response = await createTTSStream(
          request.text,
          request.settings,
          request.credentials,
          abortController.signal
        );

        const playPromise = player.playStreamingResponse(
          response,
          request.settings.rate || 1
        );

        // Attach event listeners
        await attachAudioListeners(player);

        await playPromise;

        if (state === "playing" || state === "loading") {
          setState("ended");
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          setState("idle");
          return;
        }
        if (err.name === "NotAllowedError") {
          setState("paused");
          return;
        }
        console.error("[Narravo] Playback failed:", err);
        setState("error");
      } finally {
        if (abortController?.signal.aborted === false) {
          abortController = null;
        }
      }
    }

    async function replayFromCache() {
      const player = getAudioService();

      setState("loading");

      try {
        const replayPromise = player.replayFromCache();

        await attachAudioListeners(player);

        await replayPromise;

        if (state === "playing" || state === "loading") {
          setState("ended");
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          setState("idle");
          return;
        }
        console.error("[Narravo] Replay failed:", err);
        setState("error");
      }
    }

    async function attachAudioListeners(player: AudioService, retries = 5) {
      for (let i = 0; i < retries; i++) {
        const audio = player.getCurrentAudio();
        if (audio && audio !== currentAudio) {
          currentAudio = audio;

          audio.addEventListener("play", () => setState("playing"));
          audio.addEventListener("playing", () => setState("playing"));
          audio.addEventListener("pause", () => {
            if (audio.ended) {
              setState("ended");
            } else {
              setState("paused");
            }
          });
          audio.addEventListener("ended", () => setState("ended"));
          audio.addEventListener("waiting", () => {
            if (state !== "ended") setState("loading");
          });
          audio.addEventListener("error", () => {
            if (state === "loading" || state === "playing") {
              setState("error");
            }
          });
          audio.addEventListener("timeupdate", () => {
            // Fallback end detection for Firefox
            const duration = audio.duration;
            if (
              Number.isFinite(duration) &&
              duration > 0 &&
              audio.currentTime >= duration - 0.1
            ) {
              if (state !== "ended") {
                setState("ended");
              }
            }
          });

          // Set initial state based on audio element
          if (audio.ended) {
            setState("ended");
          } else if (!audio.paused) {
            setState("playing");
          }

          return true;
        }
        await new Promise((r) => setTimeout(r, 20));
      }
      return false;
    }

    // Message handler
    browser.runtime.onMessage.addListener(async (request) => {
      switch (request.type) {
        case "PING":
          return { pong: true };

        case "GET_SELECTED_TEXT":
          return { text: window.getSelection()?.toString() || "" };

        // --- Offscreen UI messages ---
        case "SHOW_UI": {
          console.log("[Narravo] SHOW_UI received");
          showMiniWindow();
          return { success: true };
        }

        case "AUDIO_STATE":
        case "UPDATE_UI_STATE": {
          setState(request.state);
          offscreenHasCache = request.hasCache ?? offscreenHasCache;
          if (request.state === "ended" || request.state === "error") {
            offscreenHasCache = true;
          }
          return { success: true };
        }

        // --- Firefox fallback: direct playback ---
        case "PLAY_STREAMING_TTS": {
          try {
            showMiniWindow();
            await new Promise((r) => setTimeout(r, 50));

            lastRequest = {
              text: request.text,
              settings: request.settings,
              credentials: request.credentials,
            };

            await playFromRequest(lastRequest);
            return { success: true };
          } catch (err: any) {
            if (err.name === "NotAllowedError") {
              return { success: true, requiresUserInteraction: true };
            }
            return { success: false, error: err.message };
          }
        }

        case "STOP_AUDIO": {
          await stopAudio();
          lastRequest = null;
          if (audioService) {
            audioService.clearCache();
          }
          hideMiniWindow();
          if (miniWindow) {
            miniWindow.destroy();
            miniWindow.container.remove();
            miniWindow = null;
          }
          return { success: true };
        }

        // Control commands from background (Firefox fallback path)
        case "PAUSE_AUDIO": {
          const player = getAudioService();
          player.pauseAudio();
          setState("paused");
          return { success: true };
        }

        case "RESUME_AUDIO": {
          const player = getAudioService();
          try {
            await player.resumeAudio();
            setState("playing");
          } catch (err) {
            console.error("[Narravo] Resume failed:", err);
            setState("error");
          }
          return { success: true };
        }

        case "REPLAY_AUDIO": {
          const player = getAudioService();
          if (player.hasCachedAudio()) {
            await replayFromCache();
          } else if (lastRequest) {
            await playFromRequest(lastRequest);
          }
          return { success: true };
        }
      }
    });

    // Cleanup on page exit
    let hasHandledExit = false;
    function handlePageExit() {
      if (hasHandledExit) return;
      hasHandledExit = true;
      stopAudio();
    }

    window.addEventListener("pagehide", handlePageExit);
    window.addEventListener("beforeunload", handlePageExit);
  },
});
