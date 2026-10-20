// Ultraviolet & BareMux Proxy Integration for Godly OS
// Provides high-performance Service Worker proxying with Wisp WebSocket transport

declare global {
  interface Window {
    BareMux?: {
      BareMuxConnection: new (workerPath: string) => {
        getTransport: () => Promise<string | undefined>;
        setTransport: (path: string, args: any[]) => Promise<void>;
      };
    };
    __uv$config?: {
      prefix: string;
      encodeUrl: (url: string) => string;
      decodeUrl: (url: string) => string;
      handler: string;
      client: string;
      bundle: string;
      config: string;
      sw: string;
      loc?: string;
    };
    Ultraviolet?: {
      codec: {
        xor: {
          encode: (url: string) => string;
          decode: (url: string) => string;
        };
      };
    };
  }
}

export interface WispEndpoint {
  id: string;
  name: string;
  url: string;
  region: string;
}

export const WISP_ENDPOINTS: WispEndpoint[] = [
  { id: 'mercury', name: 'Mercury Workshop (Official)', url: 'wss://wisp.mercurywork.shop/', region: 'Global Fast (Active 101)' },
  { id: 'anura', name: 'Anura OS Wisp (High-Speed)', url: 'wss://anura.pro/wisp/', region: 'US/EU (Active 101)' },
  { id: 'ruby', name: 'Ruby Flamz Wisp', url: 'wss://ruby.flamz.dev/wisp/', region: 'Global' },
  { id: 'nebula', name: 'Nebula Squid Wisp', url: 'wss://nebula.squid.ink/wisp/', region: 'Global Fast' },
];

const DEFAULT_WISP = WISP_ENDPOINTS[0].url;

let connectionInstance: any = null;
let isInitializing = false;
let isReady = false;

export function getActiveWispUrl(): string {
  try {
    const saved = localStorage.getItem('godly_wisp_url');
    // Migrate old dead/broken endpoints to the new active default
    if (
      saved &&
      (saved.includes('rhw.one') ||
        saved.includes('codd70') ||
        saved.includes('tar.black') ||
        saved.includes('unblocker.cc') ||
        saved.includes('tomp.app'))
    ) {
      localStorage.setItem('godly_wisp_url', DEFAULT_WISP);
      return DEFAULT_WISP;
    }
    return saved || DEFAULT_WISP;
  } catch {
    return DEFAULT_WISP;
  }
}

export function getBasePrefix(): string {
  if (typeof window !== 'undefined') {
    if (window.__uv$config?.loc) {
      return window.__uv$config.loc.replace(/\/$/, '');
    }
    const path = window.location.pathname;
    const parts = path.split('/').filter(Boolean);
    // If running under GitHub Pages subpath e.g. /Godly-OS-Workspac---Github/
    if (parts.length > 0 && !['uv', 'assets', 'local-games', 'epoxy', 'baremux', 'index.html'].includes(parts[0])) {
      return '/' + parts[0];
    }
  }
  return '';
}

export async function setActiveWispUrl(url: string) {
  try {
    localStorage.setItem('godly_wisp_url', url);
  } catch {}
  if (connectionInstance) {
    const base = getBasePrefix();
    try {
      await connectionInstance.setTransport(`${base}/epoxy/index.mjs`, [{ wisp: url }]);
      console.log('[Godly UV-Static 2.0] Switched Epoxy transport to:', url);
    } catch {
      try {
        await connectionInstance.setTransport(`${base}/libcurl/index.mjs`, [{ websocket: url, wisp: url }]);
      } catch (err) {
        console.warn('[Godly UV] Failed to re-bind transport:', err);
      }
    }
  }
}

export async function initUvProxy(): Promise<boolean> {
  if (isReady) return true;
  if (isInitializing) {
    // Wait for ongoing init
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if (isReady) {
          clearInterval(check);
          resolve(true);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(check);
        resolve(isReady);
      }, 3000);
    });
  }

  isInitializing = true;
  const base = getBasePrefix();

  try {
    // 1. Register Ultraviolet Service Worker from UV-Static-2.0
    if ('serviceWorker' in navigator) {
      try {
        const swPath = `${base}/uv/sw.js`;
        const swScope = `${base}/uv/`;
        const reg = await navigator.serviceWorker.register(swPath, {
          scope: swScope,
        });
        console.log('[Godly UV-Static 2.0] Service Worker registered:', reg.scope);
      } catch (swErr) {
        console.warn('[Godly UV-Static 2.0] Service Worker registration note:', swErr);
      }
    }

    // 2. Initialize BareMux Connection with Epoxy Transport (UV-Static 2.0)
    if (window.BareMux) {
      const workerPath = `${base}/baremux/worker.js`;
      connectionInstance = new window.BareMux.BareMuxConnection(workerPath);
      const wisp = getActiveWispUrl();
      const epoxyPath = `${base}/epoxy/index.mjs`;
      try {
        const currentTransport = await connectionInstance.getTransport();
        if (currentTransport !== epoxyPath) {
          await connectionInstance.setTransport(epoxyPath, [{ wisp }]);
        }
        console.log('[Godly UV-Static 2.0] BareMux connected with Epoxy transport to:', wisp);
      } catch (epoxyErr) {
        console.warn('[Godly UV-Static 2.0] Epoxy transport failed, falling back to libcurl:', epoxyErr);
        try {
          const curlPath = `${base}/libcurl/index.mjs`;
          await connectionInstance.setTransport(curlPath, [{ websocket: wisp, wisp }]);
        } catch (curlErr) {
          console.warn('[Godly UV-Static 2.0] Libcurl fallback failed:', curlErr);
        }
      }
      isReady = true;
      isInitializing = false;
      return true;
    } else {
      console.warn('[Godly UV] BareMux global not available yet, retrying in 300ms...');
      setTimeout(() => {
        isInitializing = false;
        initUvProxy();
      }, 300);
      return false;
    }
  } catch (err) {
    console.warn('[Godly UV] Init error:', err);
    isInitializing = false;
    return false;
  }
}

// Ultraviolet XOR encoder fallback
function fallbackXorEncode(str: string): string {
  return encodeURIComponent(
    str
      .split('')
      .map((char, ind) => (ind % 2 ? String.fromCharCode(char.charCodeAt(0) ^ 2) : char))
      .join('')
  );
}

export function encodeUvUrl(rawUrl: string): string {
  let url = rawUrl.trim();
  if (url.includes('now.gg')) {
    url = url.replace(/now\.gg/g, 'nowgg.fun');
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  const base = getBasePrefix();
  const defaultPrefix = `${base}/uv/service/`;

  try {
    if (window.__uv$config && typeof window.__uv$config.encodeUrl === 'function') {
      const prefix = window.__uv$config.prefix || defaultPrefix;
      return prefix + window.__uv$config.encodeUrl(url);
    }
    if (window.Ultraviolet?.codec?.xor?.encode) {
      return defaultPrefix + window.Ultraviolet.codec.xor.encode(url);
    }
  } catch (e) {
    console.warn('[Godly UV] Encoder fallback invoked', e);
  }

  return defaultPrefix + fallbackXorEncode(url);
}

export function decodeUvUrl(encodedPath: string): string {
  try {
    const stripped = encodedPath.replace(/^\/uv\/service\//, '');
    if (window.__uv$config && typeof window.__uv$config.decodeUrl === 'function') {
      return window.__uv$config.decodeUrl(stripped);
    }
    if (window.Ultraviolet?.codec?.xor?.decode) {
      return window.Ultraviolet.codec.xor.decode(stripped);
    }
  } catch {}
  return encodedPath;
}
