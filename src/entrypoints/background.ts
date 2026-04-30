import { getSettings } from "../utils/settingsStorage";
import { defaultSettings } from "../types/storage";

const OFFSCREEN_PATH = "offscreen.html";
let creatingOffscreen: Promise<void> | null = null;
let currentAudioState = { state: "idle", hasCache: false };
let activeTabId: number | null = null;

const supportsOffscreen =
  typeof chrome !== "undefined" && !!chrome.offscreen;

async function hasOffscreenDocument(): Promise<boolean> {
  if ((chrome.runtime as any).getContexts) {
    const contexts = await (chrome.runtime as any).getContexts({
      contextTypes: ["OFFSCREEN_DOCUMENT"],
      documentUrls: [chrome.runtime.getURL(OFFSCREEN_PATH)],
    });
    return contexts.length > 0;
  }
  // Fallback for older Chrome versions
  try {
    await chrome.runtime.sendMessage({ type: "OFFSCREEN_PING" });
    return true;
  } catch {
    return false;
  }
}

async function setupOffscreenDocument(): Promise<void> {
  if (await hasOffscreenDocument()) return;
  if (creatingOffscreen) {
    await creatingOffscreen;
    return;
  }
  creatingOffscreen = chrome.offscreen
    .createDocument({
      url: OFFSCREEN_PATH,
      reasons: ["AUDIO_PLAYBACK"] as any,
      justification:
        "Play text-to-speech audio independently of page environments to avoid CSP and sandbox restrictions",
    })
    .then(() => {})
    .catch((err: any) => {
      if (err?.message?.includes("Only one offscreen document")) return;
      throw err;
    });
  await creatingOffscreen;
  creatingOffscreen = null;
}

function broadcastState(state: string, hasCache: boolean = false) {
  currentAudioState = { state, hasCache };
  if (activeTabId != null) {
    browser.tabs
      .sendMessage(activeTabId, {
        type: "UPDATE_UI_STATE",
        state,
        hasCache,
      })
      .catch(() => {});
  }
}

export default defineBackground(() => {
  console.log("[Narravo] Background script loaded/reloaded");

  // Separate function to create context menu
  async function createContextMenu() {
    try {
      await browser.contextMenus.removeAll();
      await browser.contextMenus.create({
        id: "translate-selected-text",
        title: "Read selected text",
        contexts: ["selection"],
      });
    } catch (error) {
      console.error("Failed to create context menu:", error);
    }
  }

  // Create context menu when extension starts
  createContextMenu();

  // Update badge based on current settings on startup
  getSettings().then((settings) => {
    updateBadge(settings);
  });

  // Listen for settings changes to update badge
  browser.storage.local.onChanged.addListener((changes) => {
    if (changes.settings) {
      const newSettings = changes.settings.newValue;
      updateBadge(newSettings);
    }
  });

  function updateBadge(settings: any) {
    try {
      const actionAPI = browser.action || browser.browserAction;
      if (!actionAPI) return;

      if (settings?.azureKey && settings?.azureRegion) {
        actionAPI.setBadgeText({ text: "" });
      } else {
        actionAPI.setBadgeText({ text: "!" });
        actionAPI.setBadgeBackgroundColor({ color: "#F59E0B" });
      }
    } catch (error: any) {
      console.log("Could not update badge:", error.message);
    }
  }

  // Keep the onInstalled listener for initialization tasks
  browser.runtime.onInstalled.addListener(async (details) => {
    await createContextMenu();

    if (details.reason === "install") {
      await browser.storage.local.set({
        settings: defaultSettings,
        onboardingCompleted: false,
      });

      // Set badge to indicate setup needed
      try {
        const actionAPI = browser.action || browser.browserAction;
        if (actionAPI) {
          actionAPI.setBadgeText({ text: "!" });
          actionAPI.setBadgeBackgroundColor({ color: "#F59E0B" });
        }
      } catch (error: any) {
        console.log("Could not set badge:", error.message);
      }

      browser.tabs.create({
        url: browser.runtime.getURL("/onboarding.html"),
      });
    }
  });

  // Unified message listener
  browser.runtime.onMessage.addListener(async (message, sender) => {
    switch (message.type) {
      case "AUDIO_STATE": {
        broadcastState(message.state, message.hasCache ?? false);
        return;
      }

      case "GET_AUDIO_STATE": {
        return {
          state: currentAudioState.state,
          hasCache: currentAudioState.hasCache,
        };
      }

      case "PLAY_AUDIO": {
        const text = message.text as string;
        const tabId =
          (message.tabId as number | undefined) ?? (sender.tab?.id ?? null);
        await processTTSAudio(text, tabId);
        return { success: true };
      }

      case "PAUSE_AUDIO":
      case "RESUME_AUDIO":
      case "STOP_AUDIO":
      case "REPLAY_AUDIO": {
        const action = message.type.replace(
          "_AUDIO",
          ""
        ) as "PAUSE" | "RESUME" | "STOP" | "REPLAY";
        await sendAudioControl(action);
        return { success: true };
      }

      case "OPEN_OPTIONS": {
        browser.tabs.create({
          url: browser.runtime.getURL("/options.html"),
        });
        return;
      }
    }
  });

  // Unified function to handle TTS requests
  async function processTTSAudio(text: string, tabId: number | null) {
    const settings = await getSettings();

    if (!settings.azureKey || !settings.azureRegion) {
      await showNotification(
        "Configuration Error",
        "Azure credentials not configured. Please check your settings."
      );
      return;
    }

    activeTabId = tabId;

    if (supportsOffscreen) {
      try {
        await setupOffscreenDocument();
        if (tabId != null) {
          try {
            await browser.tabs.sendMessage(tabId, { type: "SHOW_UI" });
          } catch (err: any) {
            console.error("[Narravo] Failed to show miniwindow:", err.message);
            // Tab may not have content script yet; try injecting and retry once
            try {
              await ensureContentScriptLoaded(tabId);
              await browser.tabs.sendMessage(tabId, { type: "SHOW_UI" });
            } catch (retryErr: any) {
              console.error("[Narravo] Retry show miniwindow failed:", retryErr.message);
            }
          }
        }
        await chrome.runtime.sendMessage({
          type: "PLAY",
          text,
          settings: {
            voice: settings.voice,
            rate: settings.rate,
            pitch: settings.pitch,
          },
          credentials: {
            azureKey: settings.azureKey,
            azureRegion: settings.azureRegion,
          },
        });
      } catch (error: any) {
        console.error("TTS offscreen error:", error);
        await showNotification("TTS Error", error.message);
      }
    } else {
      // Firefox fallback: use content script for playback
      if (tabId == null) return;
      await processTTSViaContentScript(text, tabId, settings);
    }
  }

  async function sendAudioControl(
    action: "PAUSE" | "RESUME" | "STOP" | "REPLAY"
  ) {
    if (supportsOffscreen) {
      try {
        await chrome.runtime.sendMessage({ type: action });
      } catch (err) {
        console.error(`Control ${action} failed:`, err);
      }
    } else if (activeTabId) {
      try {
        await browser.tabs.sendMessage(activeTabId, {
          type: `${action}_AUDIO`,
        });
      } catch {
        // Content script might not be loaded
      }
    }
  }

  // Legacy content-script-based TTS for Firefox/MV2
  async function processTTSViaContentScript(
    text: string,
    tabId: number,
    settings: any
  ) {
    try {
      await ensureContentScriptLoaded(tabId);

      // Stop previous audio
      try {
        await browser.tabs.sendMessage(tabId, { type: "STOP_AUDIO" });
      } catch (err) {
        // Ignore if failed
      }

      // Send TTS request
      await browser.tabs.sendMessage(tabId, {
        type: "PLAY_STREAMING_TTS",
        text: text,
        settings: {
          voice: settings.voice,
          rate: settings.rate,
          pitch: settings.pitch,
        },
        credentials: {
          azureKey: settings.azureKey,
          azureRegion: settings.azureRegion,
        },
      });
    } catch (error: any) {
      console.error("TTS process error:", error);
      if (!error.message?.includes("No tab with id")) {
        await showNotification("TTS Error", error.message);
      }
    }
  }

  // Command listener for shortcuts
  browser.commands.onCommand.addListener(async (command) => {
    console.log(`[Narravo] Command received: ${command}`);

    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    const activeTab = tabs[0];
    if (!activeTab?.id) return;

    if (command === "read-selected") {
      try {
        // Ensure content script is ready
        await ensureContentScriptLoaded(activeTab.id);

        // Ask the content script for the current selection
        const response = await browser.tabs.sendMessage(activeTab.id, {
          type: "GET_SELECTED_TEXT",
        });

        const selectedText = response?.text;
        if (selectedText && selectedText.trim()) {
          await processTTSAudio(selectedText.trim(), activeTab.id);
        } else {
          await showNotification("Narravo", "No text selected to read.");
        }
      } catch (err) {
        console.error("Failed to get selection via shortcut:", err);
      }
    } else if (command === "stop-audio") {
      await sendAudioControl("STOP");
    }
  });

  // Context menu click handler
  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (
      info.menuItemId === "translate-selected-text" &&
      info.selectionText &&
      tab?.id
    ) {
      console.log("Processing context menu TTS");
      try {
        await ensureContentScriptLoaded(tab.id);
        await processTTSAudio(info.selectionText, tab.id);
      } catch (err: any) {
        console.error("Context menu TTS failed:", err);
      }
    }
  });

  async function showNotification(title: string, message: string) {
    try {
      await browser.notifications.create({
        type: "basic",
        iconUrl: browser.runtime.getURL("/assets/icons/icon-48.png"),
        title,
        message,
      });
    } catch (error) {
      console.log(`Notification: ${title}: ${message}`);
    }
  }

  async function ensureContentScriptLoaded(tabId: number) {
    try {
      try {
        const response = await browser.tabs.sendMessage(tabId, {
          type: "PING",
        });
        if (response && response.pong) {
          return true;
        }
      } catch (pingError) {
        // Content script not loaded
      }

      let tab: chrome.tabs.Tab;
      try {
        tab = await browser.tabs.get(tabId);
      } catch (tabError) {
        throw new Error(`Tab ${tabId} no longer exists.`);
      }

      if (
        !tab ||
        !tab.url ||
        tab.url.startsWith("chrome://") ||
        tab.url.startsWith("chrome-extension://") ||
        tab.url.startsWith("moz-extension://")
      ) {
        throw new Error("Cannot inject into system pages");
      }

      if (tab.discarded) {
        throw new Error("Tab is discarded");
      }

      try {
        // In WXT, content script output is content.js by default
        await browser.scripting.executeScript({
          target: { tabId: tabId },
          files: ["/content-scripts/content.js"],
        });
      } catch (scriptError: any) {
        if (
          scriptError.message.includes("No tab with id") ||
          scriptError.message.includes("Invalid tab ID")
        ) {
          throw new Error(`Tab ${tabId} was closed.`);
        }
        throw scriptError;
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      try {
        const response = await browser.tabs.sendMessage(tabId, {
          type: "PING",
        });
        if (response && response.pong) {
          return true;
        }
        throw new Error("Content script not responding");
      } catch (verifyError: any) {
        throw new Error(`Injection failed: ${verifyError.message}`);
      }
    } catch (error: any) {
      console.error("Content script load error:", error.message);
      throw error;
    }
  }

  // Debug
  browser.storage.local.get(["settings"]).then((result) => {
    console.log("Current settings:", result.settings);
  });
});
