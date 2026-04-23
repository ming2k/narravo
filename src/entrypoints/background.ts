import { getSettings } from "../utils/settingsStorage";
import { defaultSettings } from "../types/storage";

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

  // Auto-complete onboarding in development if credentials are in ENV
  if (import.meta.env.DEV) {
    const envKey = import.meta.env.VITE_AZURE_SPEECH_KEY;
    const envRegion = import.meta.env.VITE_AZURE_REGION;

    if (envKey && envRegion) {
      console.log("[Narravo] Dev mode: Found Azure credentials in environment variables");
      getSettings().then(async (settings) => {
        if (!settings.azureKey || !settings.azureRegion) {
          await browser.storage.local.set({
            settings: {
              ...settings,
              azureKey: settings.azureKey || envKey,
              azureRegion: settings.azureRegion || envRegion,
            },
            onboardingCompleted: true,
          });
          console.log("[Narravo] Dev mode: Auto-initialized settings and completed onboarding");
        } else {
          // Even if settings already exist, ensure onboarding is marked completed
          const { onboardingCompleted } = await browser.storage.local.get("onboardingCompleted");
          if (!onboardingCompleted) {
            await browser.storage.local.set({ onboardingCompleted: true });
            console.log("[Narravo] Dev mode: Marked onboarding as completed");
          }
        }
      });
    }
  }

  // Keep the onInstalled listener for other initialization tasks
  browser.runtime.onInstalled.addListener(async (details) => {
    await createContextMenu();

    if (details.reason === "install") {
      const initialSettings = {
        ...defaultSettings,
        azureKey: (import.meta.env.VITE_AZURE_SPEECH_KEY as string) || "",
        azureRegion: (import.meta.env.VITE_AZURE_REGION as string) || "",
      };

      await browser.storage.local.set({
        settings: initialSettings,
        onboardingCompleted: false,
      });

      // Set badge to indicate setup needed if no Azure credentials
      if (!initialSettings.azureKey || !initialSettings.azureRegion) {
        try {
          const actionAPI = browser.action || browser.browserAction;
          if (actionAPI) {
            actionAPI.setBadgeText({ text: "!" });
            actionAPI.setBadgeBackgroundColor({ color: "#F59E0B" });
          }
        } catch (error: any) {
          console.log("Could not set badge:", error.message);
        }
      }

      const isDevelopmentWithCreds =
        import.meta.env.DEV &&
        initialSettings.azureKey &&
        initialSettings.azureRegion;

      if (isDevelopmentWithCreds) {
        await browser.storage.local.set({ onboardingCompleted: true });
      } else {
        browser.tabs.create({
          url: browser.runtime.getURL("/onboarding.html"),
        });
      }
    }
  });

  // Listen for messages from popup to open options
  browser.runtime.onMessage.addListener((message) => {
    if (message.type === "OPEN_OPTIONS") {
      browser.tabs.create({
        url: browser.runtime.getURL("/options.html"),
      });
    }
  });

  // Unified function to handle TTS requests
  async function processTTS(text: string, tabId: number) {
    try {
      const settings = await getSettings();

      if (!settings.azureKey || !settings.azureRegion) {
        await showNotification(
          "Configuration Error",
          "Azure credentials not configured. Please check your settings.",
        );
        return;
      }

      // Ensure content script is ready
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
        }
      });
    } catch (error: any) {
      console.error("TTS process error:", error);
      if (!error.message.includes('No tab with id')) {
        await showNotification("TTS Error", error.message);
      }
    }
  }

  // Command listener for shortcuts
  browser.commands.onCommand.addListener(async (command) => {
    console.log(`[Narravo] Command received: ${command}`);

    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];
    if (!activeTab?.id) return;

    if (command === "read-selected") {
      try {
        // Ensure content script is ready (it's already injected via manifest,
        // but we verify it's responsive before sending messages)
        await ensureContentScriptLoaded(activeTab.id);

        // Ask the content script for the current selection
        const response = await browser.tabs.sendMessage(activeTab.id, {
          type: "GET_SELECTED_TEXT",
        });

        const selectedText = response?.text;
        if (selectedText && selectedText.trim()) {
          await processTTS(selectedText.trim(), activeTab.id);
        } else {
          await showNotification("Narravo", "No text selected to read.");
        }
      } catch (err) {
        console.error("Failed to get selection via shortcut:", err);
      }
    } else if (command === "stop-audio") {
      try {
        await browser.tabs.sendMessage(activeTab.id, { type: "STOP_AUDIO" });
      } catch (err) {
        // Content script might not be loaded
      }
    }
  });

  // Context menu click handler
  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "translate-selected-text" && info.selectionText && tab?.id) {
      console.log("Processing context menu TTS");
      await processTTS(info.selectionText, tab.id);
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
        const response = await browser.tabs.sendMessage(tabId, { type: "PING" });
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

      if (!tab || !tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('moz-extension://')) {
        throw new Error('Cannot inject into system pages');
      }

      if (tab.discarded) {
        throw new Error('Tab is discarded');
      }

      try {
        // In WXT, content script output is content.js by default
        await browser.scripting.executeScript({
          target: { tabId: tabId },
          files: ['/content-scripts/content.js']
        });
      } catch (scriptError: any) {
        if (scriptError.message.includes('No tab with id') || scriptError.message.includes('Invalid tab ID')) {
          throw new Error(`Tab ${tabId} was closed.`);
        }
        throw scriptError;
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      try {
        const response = await browser.tabs.sendMessage(tabId, { type: "PING" });
        if (response && response.pong) {
          return true;
        }
        throw new Error('Content script not responding');
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
