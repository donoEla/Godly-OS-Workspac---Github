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

export async function setActiveWispUrl(url: string) {
  try {
    localStorage.setItem('godly_wisp_url', url);
  } catch {}
  if (connectionInstance) {
    try {
      await connectionInstance.setTransport('/epoxy/index.mjs', [{ wisp: url }]);
      console.log('[Godly UV-Static 2.0] Switched Epoxy transport to:', url);
    } catch {
      try {
        await connectionInstance.setTransport('/libcurl/index.mjs', [{ websocket: url, wisp: url }]);
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

  try {
    // 1. Register Ultraviolet Service Worker from UV-Static-2.0
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.register('/uv/sw.js', {
          scope: '/uv/',
        });
        console.log('[Godly UV-Static 2.0] Service Worker registered:', reg.scope);
      } catch (swErr) {
        console.warn('[Godly UV-Static 2.0] Service Worker registration note:', swErr);
      }
    }

    // 2. Initialize BareMux Connection with Epoxy Transport (UV-Static 2.0)
    if (window.BareMux) {
      connectionInstance = new window.BareMux.BareMuxConnection('/baremux/worker.js');
      const wisp = getActiveWispUrl();
      try {
        const currentTransport = await connectionInstance.getTransport();
        if (currentTransport !== '/epoxy/index.mjs') {
          await connectionInstance.setTransport('/epoxy/index.mjs', [{ wisp }]);
        }
        console.log('[Godly UV-Static 2.0] BareMux connected with Epoxy transport to:', wisp);
      } catch (epoxyErr) {
        console.warn('[Godly UV-Static 2.0] Epoxy transport failed, falling back to libcurl:', epoxyErr);
        try {
          await connectionInstance.setTransport('/libcurl/index.mjs', [{ websocket: wisp, wisp }]);
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

  try {
    if (window.__uv$config && typeof window.__uv$config.encodeUrl === 'function') {
      const prefix = window.__uv$config.prefix || '/uv/service/';
      return prefix + window.__uv$config.encodeUrl(url);
    }
    if (window.Ultraviolet?.codec?.xor?.encode) {
      return '/uv/service/' + window.Ultraviolet.codec.xor.encode(url);
    }
  } catch (e) {
    console.warn('[Godly UV] Encoder fallback invoked', e);
  }

  return '/uv/service/' + fallbackXorEncode(url);
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
