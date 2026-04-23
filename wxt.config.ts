import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: '__MSG_extName__',
    description: '__MSG_extensionDescription__',
    default_locale: 'en',
    permissions: [
      'storage',
      'contextMenus',
      'notifications',
      'activeTab',
      'scripting',
    ],
    host_permissions: ['https://*.tts.speech.microsoft.com/*'],
    commands: {
      "read-selected": {
        "suggested_key": {
          "default": "Alt+Shift+L",
          "mac": "Alt+Shift+L"
        },
        "description": "Read selected text"
      },
      "stop-audio": {
        "suggested_key": {
          "default": "Alt+Shift+S",
          "mac": "Alt+Shift+S"
        },
        "description": "Stop audio playback"
      }
    },
    icons: {
      16: 'assets/icons/icon-16.png',
      32: 'assets/icons/icon-32.png',
      48: 'assets/icons/icon-48.png',
      128: 'assets/icons/icon-128.png',
    },
    web_accessible_resources: [
      {
        resources: ['assets/icons/*.png', 'assets/icons/*.svg'],
        matches: ['<all_urls>'],
      },
    ],
  },
  hooks: {
    'build:manifestGenerated': (_wxt, manifest) => {
      // Remove declarative content_scripts to avoid broad host permissions.
      // The content script is injected on-demand via activeTab + scripting
      // when the user triggers a keyboard shortcut or context menu.
      delete (manifest as any).content_scripts;
    },
  },
  // WXT 0.20+ uses 'webExt' for browser execution control.
  // 'disabled: true' stops WXT from trying to find/launch a browser,
  // avoiding "File path cannot be resolved" errors especially with Flatpak/Snap.
  webExt: {
    disabled: true,
  },
});
