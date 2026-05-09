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
    let lastRequest: any = null;
    let lastRequestCacheKey: string | null = null;
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
      lastRequest = null;
      lastRequestCacheKey = null;
      abortController = null;
      state = "idle";
    }

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

    function getAudioService() {
      if (!audioService) {
        audioService = new AudioService({
          onStateChange: (newState) => setState(newState),
        });
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

      setState("idle");
    }

    async function playFromRequest(request: any) {
      const player = getAudioService();

      if (abortController) {
        abortController.abort();
      }
      abortController = new AbortController();

      try {
        const response = await createTTSStream(
          request.text,
          request.settings,
          request.credentials,
          abortController.signal
        );

        await player.playStreamingResponse(
          response,
          request.settings.rate || 1
        );
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

      try {
        await player.replayFromCache();
      } catch (err: any) {
        if (err.name === "AbortError") {
          setState("idle");
          return;
        }
        console.error("[Narravo] Replay failed:", err);
        setState("error");
      }
    }

    async function handleRuntimeMessage(request: any) {
      switch (request.type) {
        case "PING":
          return { pong: true };

        case "GET_SELECTED_TEXT":
          return { text: window.getSelection()?.toString() || "" };

        // --- Offscreen UI messages ---
        case "SHOW_UI": {
          console.log("[Narravo] SHOW_UI received");
          showMiniWindow();
          try {
            const current = await browser.runtime.sendMessage({
              type: "GET_AUDIO_STATE",
            });
            if (current?.state) {
              offscreenHasCache = current.hasCache ?? offscreenHasCache;
              setState(current.state);
            }
          } catch {
            // Ignore state sync errors; future broadcasts will update the UI.
          }
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
            if (request.showMiniWindow) {
              showMiniWindow();
              await new Promise((r) => setTimeout(r, 50));
            }

            const nextRequest = {
              text: request.text,
              settings: request.settings,
              credentials: request.credentials,
            };
            const cacheKey = createRequestCacheKey(nextRequest);
            const player = getAudioService();

            lastRequest = nextRequest;

            if (lastRequestCacheKey === cacheKey && player.hasCachedAudio()) {
              await replayFromCache();
              return { success: true };
            }

            lastRequestCacheKey = null;
            await playFromRequest(nextRequest);
            if (state === "ended" && player.hasCachedAudio()) {
              lastRequestCacheKey = cacheKey;
            }
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
          if (!lastRequestCacheKey && audioService) {
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
    }

    // Chrome does not reliably use Promise return values from onMessage listeners.
    browser.runtime.onMessage.addListener((request, _sender, sendResponse) => {
      handleRuntimeMessage(request)
        .then((response) => sendResponse(response))
        .catch((err: any) => {
          console.error("[Narravo] Message handler failed:", err);
          sendResponse({ success: false, error: err.message || String(err) });
        });
      return true;
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
