import { vi } from 'vitest';

// Mock the webextension-polyfill/browser API
const browserMock = {
  storage: {
    local: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn().mockResolvedValue(undefined),
    },
  },
  runtime: {
    getURL: vi.fn((path) => path),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    sendMessage: vi.fn().mockResolvedValue(undefined),
    openOptionsPage: vi.fn(),
  },
  tabs: {
    create: vi.fn(),
    query: vi.fn().mockResolvedValue([]),
    sendMessage: vi.fn().mockResolvedValue(undefined),
  },
  i18n: {
    getMessage: vi.fn((key) => key),
  },
  contextMenus: {
    create: vi.fn(),
    removeAll: vi.fn().mockResolvedValue(undefined),
    onClicked: {
      addListener: vi.fn(),
    },
  },
  notifications: {
    create: vi.fn().mockResolvedValue('notification-id'),
  },
};

// Globally mock the browser object provided by WXT
vi.stubGlobal('browser', browserMock);

// Also mock chrome for compatibility if needed
vi.stubGlobal('chrome', browserMock);
