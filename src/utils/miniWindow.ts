type PlaybackState = "idle" | "loading" | "playing" | "paused" | "ended" | "error";

interface SavedPosition {
  bottom?: string;
  right?: string;
  transform?: string;
  xOffset?: number;
  yOffset?: number;
}

export interface MiniWindowStatusArgs {
  state: PlaybackState;
  canReplay: boolean;
}

export interface MiniWindowControls {
  container: HTMLDivElement;
  logoContainer: HTMLDivElement;
  replayButton: HTMLButtonElement;
  closeButton: HTMLButtonElement;
  updateStatus(args: MiniWindowStatusArgs): void;
  destroy(): void;
}

const STYLE_ID = "narravo-mini-window-style";
const STORAGE_KEY = "tts-window-position";

function createSvgIcon(svgString: string): SVGSVGElement {
  const template = document.createElement("template");
  template.innerHTML = svgString.trim();
  const svg = template.content.firstElementChild;
  if (!(svg instanceof SVGSVGElement)) {
    throw new Error("Invalid mini window icon");
  }
  return svg;
}

function getRuntimeAssetUrl(path: string): string | null {
  const runtime =
    (globalThis as any).browser?.runtime ?? (globalThis as any).chrome?.runtime;
  try {
    return runtime?.getURL?.(path) ?? null;
  } catch {
    return null;
  }
}

const ICONS = {
  play: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 4l14 8-14 8V4z" fill="currentColor"/></svg>`,
  pause: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/></svg>`,
  replay: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5a7 7 0 1 1-6.63 9.12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M5 5v4h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  spinner: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="tts-spinner"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" stroke-dasharray="56" stroke-dashoffset="20" fill="none"/></svg>`,
  error: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 8v5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg>`,
  close: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
};

function injectStyles(): void {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    #tts-mini-window {
      position: fixed;
      z-index: 2147483647;
      background: var(--bg-surface, #FFFFFF);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      padding: 6px 8px;
      border-radius: var(--radius-pill, 999px);
      border: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
      box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0,0,0,0.1));
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
      cursor: grab;
      user-select: none;
      touch-action: none;
      opacity: 0;
      transform: translateY(10px) scale(0.95);
      transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                  transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                  border-color 0.2s, box-shadow 0.2s;
      pointer-events: none;
    }

    @media (prefers-color-scheme: dark) {
      #tts-mini-window {
        background: var(--bg-surface, #18181B);
        border-color: var(--border-color, rgba(255, 255, 255, 0.1));
        box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0,0,0,0.3));
      }
    }

    #tts-mini-window.is-visible {
      opacity: 1;
      transform: translateY(0) scale(1) translate(var(--tw-x, 0), var(--tw-y, 0));
      pointer-events: auto;
    }

    #tts-mini-window.is-active {
      border-color: var(--system-blue, #2563EB);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.25), var(--shadow-lg, 0 10px 15px -3px rgba(0,0,0,0.1));
    }

    #tts-mini-window.is-error {
      border-color: var(--system-red, #DC2626);
      box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.25), var(--shadow-lg, 0 10px 15px -3px rgba(0,0,0,0.1));
    }

    #tts-mini-window.is-dragging {
      cursor: grabbing;
      transition: opacity 0.3s, border-color 0.2s;
    }

    #tts-mini-window * {
      box-sizing: border-box;
    }

    #tts-mini-window .tts-logo-container {
      position: relative;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    #tts-mini-window .tts-logo {
      width: 20px;
      height: 20px;
      display: block;
      border-radius: 5px;
      transition: opacity 0.2s;
    }

    #tts-mini-window .tts-logo-fallback {
      color: var(--system-blue, #2563EB);
      font-weight: 700;
      font-size: 14px;
      line-height: 20px;
      text-align: center;
    }

    .tts-wave-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: none;
      align-items: center;
      justify-content: center;
      gap: 2px;
    }

    #tts-mini-window.is-active .tts-wave-container {
      display: flex;
    }
    #tts-mini-window.is-active .tts-logo {
      opacity: 0;
    }

    .tts-wave-bar {
      width: 2px;
      height: 8px;
      background: var(--system-blue, #2563EB);
      border-radius: 1px;
      animation: tts-wave 1s ease-in-out infinite;
    }
    .tts-wave-bar:nth-child(2) { animation-delay: 0.2s; height: 12px; }
    .tts-wave-bar:nth-child(3) { animation-delay: 0.4s; }

    @keyframes tts-wave {
      0%, 100% { transform: scaleY(1); }
      50% { transform: scaleY(1.8); }
    }

    #tts-mini-window button {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      border-radius: 50%;
      cursor: pointer;
      color: var(--text-secondary, #71717A);
      transition: all 0.15s ease;
      outline: none;
      padding: 0;
    }

    #tts-mini-window button:hover:not(:disabled) {
      background: var(--bg-secondary, #F4F4F5);
      color: var(--text-primary, #18181B);
    }

    #tts-mini-window button:active:not(:disabled) {
      transform: scale(0.95);
    }

    #tts-mini-window button:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    #tts-mini-window button.is-accent {
      color: var(--system-blue, #2563EB);
    }

    #tts-mini-window button svg {
      width: 16px;
      height: 16px;
      display: block;
      flex-shrink: 0;
      color: currentColor;
      pointer-events: none;
    }

    #tts-mini-window button.is-loading svg {
      animation: tts-spin 1s linear infinite;
    }

    @keyframes tts-spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

function loadPosition(): SavedPosition {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePosition(pos: SavedPosition): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
  } catch {
    // Ignore
  }
}

interface ButtonConfig {
  icon: string;
  title: string;
  disabled: boolean;
  loading: boolean;
  accent: boolean;
  error: boolean;
}

function getButtonConfig(state: PlaybackState, canReplay: boolean): ButtonConfig {
  switch (state) {
    case "loading":
      return { icon: ICONS.spinner, title: "Loading...", disabled: true, loading: true, accent: true, error: false };
    case "playing":
      return { icon: ICONS.pause, title: "Pause", disabled: false, loading: false, accent: true, error: false };
    case "paused":
      return { icon: ICONS.play, title: "Resume", disabled: false, loading: false, accent: true, error: false };
    case "ended":
      return { icon: canReplay ? ICONS.replay : ICONS.play, title: canReplay ? "Replay" : "Play", disabled: !canReplay, loading: false, accent: canReplay, error: false };
    case "error":
      return { icon: ICONS.error, title: "Error", disabled: !canReplay, loading: false, accent: false, error: true };
    default: // idle
      return { icon: ICONS.play, title: "Play", disabled: !canReplay, loading: false, accent: false, error: false };
  }
}

export function createMiniWindow(): MiniWindowControls {
  injectStyles();

  const saved = loadPosition();
  let offsetX = saved.xOffset ?? 0;
  let offsetY = saved.yOffset ?? 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let hideTimeout: any = null;

  // Container
  const container = document.createElement("div");
  container.id = "tts-mini-window";
  container.style.bottom = saved.bottom ?? "20px";
  container.style.right = saved.right ?? "20px";
  container.style.setProperty('--tw-x', `${offsetX}px`);
  container.style.setProperty('--tw-y', `${offsetY}px`);

  // Logo Container
  const logoContainer = document.createElement("div");
  logoContainer.className = "tts-logo-container";

  const logoUrl = getRuntimeAssetUrl("assets/icons/icon-32.png");
  const logo = logoUrl ? document.createElement("img") : document.createElement("div");
  logo.className = logoUrl ? "tts-logo" : "tts-logo tts-logo-fallback";
  if (logo instanceof HTMLImageElement) {
    logo.src = logoUrl;
    logo.alt = "";
    logo.draggable = false;
  } else {
    logo.textContent = "N";
  }

  const waveContainer = document.createElement("div");
  waveContainer.className = "tts-wave-container";
  for (let i = 0; i < 3; i++) {
    const bar = document.createElement("div");
    bar.className = "tts-wave-bar";
    waveContainer.appendChild(bar);
  }

  logoContainer.append(logo, waveContainer);

  // Control button
  const replayButton = document.createElement("button");
  replayButton.type = "button";
  replayButton.className = "tts-control";
  replayButton.appendChild(createSvgIcon(ICONS.play));

  // Close button
  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "tts-close";
  closeButton.appendChild(createSvgIcon(ICONS.close));
  closeButton.title = "Close";

  container.append(logoContainer, replayButton, closeButton);

  const applyTransform = () => {
    container.style.setProperty('--tw-x', `${offsetX}px`);
    container.style.setProperty('--tw-y', `${offsetY}px`);
  };

  const startAutoHide = () => {
    stopAutoHide();
    hideTimeout = setTimeout(() => {
      container.classList.remove("is-visible");
    }, 10000); // 10 seconds auto-hide
  };

  const stopAutoHide = () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
  };

  const handlePointerDown = (e: PointerEvent) => {
    if ((e.target as Element)?.closest("button")) return;
    isDragging = true;
    dragStartX = e.clientX - offsetX;
    dragStartY = e.clientY - offsetY;
    container.classList.add("is-dragging");
    container.setPointerCapture(e.pointerId);
    stopAutoHide();
    e.preventDefault();
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging) return;
    offsetX = e.clientX - dragStartX;
    offsetY = e.clientY - dragStartY;
    requestAnimationFrame(applyTransform);
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (!isDragging) return;
    isDragging = false;
    container.classList.remove("is-dragging");
    try { container.releasePointerCapture(e.pointerId); } catch {}
    savePosition({
      bottom: container.style.bottom,
      right: container.style.right,
      transform: container.style.transform,
      xOffset: offsetX,
      yOffset: offsetY
    });
    startAutoHide();
  };

  container.addEventListener("pointerdown", handlePointerDown);
  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerUp);
  window.addEventListener("pointercancel", handlePointerUp);

  const stopProp = (e: Event) => {
    e.stopPropagation();
    stopAutoHide();
    startAutoHide();
  };
  replayButton.addEventListener("pointerdown", stopProp);
  closeButton.addEventListener("pointerdown", stopProp);

  const updateStatus = ({ state, canReplay }: MiniWindowStatusArgs) => {
    const config = getButtonConfig(state, canReplay);

    replayButton.replaceChildren(createSvgIcon(config.icon));
    replayButton.title = config.title;
    replayButton.disabled = config.disabled;
    replayButton.classList.toggle("is-accent", config.accent && !config.disabled);
    replayButton.classList.toggle("is-error", config.error);
    replayButton.classList.toggle("is-loading", config.loading);

    container.classList.toggle("is-active", state === "playing");
    container.classList.toggle("is-error", state === "error");

    // Auto show/hide logic
    if (state === "loading" || state === "playing") {
      container.classList.add("is-visible");
      stopAutoHide();
    } else if (state === "ended" || state === "idle" || state === "error") {
      startAutoHide();
    }
  };

  const destroy = () => {
    stopAutoHide();
    container.removeEventListener("pointerdown", handlePointerDown);
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
    window.removeEventListener("pointercancel", handlePointerUp);
    replayButton.removeEventListener("pointerdown", stopProp);
    closeButton.removeEventListener("pointerdown", stopProp);
  };

  return { container, logoContainer, replayButton, closeButton, updateStatus, destroy };
}
