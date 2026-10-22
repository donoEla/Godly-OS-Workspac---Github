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

export type SearchEngineId = 'duckduckgo' | 'brave' | 'google';

export interface SearchEngineMeta {
  id: SearchEngineId;
  name: string;
  queryUrl: string;
  homeUrl: string;
  tagline: string;
  badgeColor: string;
}

export const SEARCH_ENGINES: Record<SearchEngineId, SearchEngineMeta> = {
  duckduckgo: {
    id: 'duckduckgo',
    name: 'DuckDuckGo',
    queryUrl: 'https://duckduckgo.com/?q=',
    homeUrl: 'https://duckduckgo.com',
    tagline: 'Privacy, simplified. No tracking or profile building.',
    badgeColor: '#DE5833',
  },
  brave: {
    id: 'brave',
    name: 'Brave Search',
    queryUrl: 'https://search.brave.com/search?q=',
    homeUrl: 'https://search.brave.com',
    tagline: 'Independent index, private AI answers, zero bias.',
    badgeColor: '#FB542B',
  },
  google: {
    id: 'google',
    name: 'Google',
    queryUrl: 'https://www.google.com/search?q=',
    homeUrl: 'https://www.google.com',
    tagline: 'Comprehensive global search and real-time knowledge.',
    badgeColor: '#4285F4',
  },
};

export function formatSearchOrUrl(input: string, engine: SearchEngineId = 'duckduckgo'): string {
  const trimmed = input.trim();
  if (!trimmed) return SEARCH_ENGINES[engine].homeUrl;

  // Check if it's already an explicit URL
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Check if it's a domain or IP e.g. "github.com", "sub.domain.org/path", "localhost:3000"
  const isDomainPattern = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/\S*)?$/i.test(trimmed);
  const isLocalhost = /^localhost(:\d+)?(\/\S*)?$/i.test(trimmed);

  if (isDomainPattern || isLocalhost) {
    return 'https://' + trimmed;
  }

  // Treat as search query
  const meta = SEARCH_ENGINES[engine] || SEARCH_ENGINES.duckduckgo;
  return `${meta.queryUrl}${encodeURIComponent(trimmed)}`;
}

export function isServiceWorkerActive(): boolean {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return false;
  return !!navigator.serviceWorker.controller;
}

export interface WispEndpoint {
  id: string;
  name: string;
  url: string;
  region: string;
}

export const WISP_ENDPOINTS: WispEndpoint[] = [
  { id: 'anura', name: 'Anura Pro High-Speed (Ultra Fast ⚡)', url: 'wss://anura.pro/wisp/', region: 'Global Fast ⚡' },
  { id: 'mercury', name: 'Mercury Workshop (Official)', url: 'wss://wisp.mercurywork.shop/', region: 'Global Fast (101 Active)' },
  { id: 'flow', name: 'Flow Works Wisp', url: 'wss://wisp.flow-works.me/', region: 'Global Fast' },
  { id: 'phantom', name: 'Phantom Fun Wisp', url: 'wss://phantom.fun/wisp/', region: 'US/EU' },
  { id: 'anura-mw', name: 'Mercury Anura Relay', url: 'wss://anura.mercurywork.shop/wisp/', region: 'Failover' },
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
        saved.includes('ruby.flamz') ||
        saved.includes('nebula.squid') ||
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
  if (isReady && isServiceWorkerActive()) return true;
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
      }, 3500);
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
        
        // Ensure worker is activated
        if (reg.installing) {
          await new Promise<void>((resolve) => {
            const worker = reg.installing;
            if (!worker) return resolve();
            worker.addEventListener('statechange', () => {
              if (worker.state === 'activated') resolve();
            });
            setTimeout(resolve, 1500);
          });
        }
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

// ── Root Service Worker Bridge (sw.js & bareworker.js) ─────────────────────────
let isSwBridgeReady = false;
let isSwBridgeInitializing = false;

export async function initSwBridgeProxy(): Promise<boolean> {
  if (isSwBridgeReady && isServiceWorkerActive()) return true;
  if (isSwBridgeInitializing) {
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if (isSwBridgeReady) {
          clearInterval(check);
          resolve(true);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(check);
        resolve(isSwBridgeReady);
      }, 3500);
    });
  }

  isSwBridgeInitializing = true;
  const base = getBasePrefix();

  try {
    // 1. Register root sw.js
    if ('serviceWorker' in navigator) {
      try {
        const swPath = `${base}/sw.js`;
        const swScope = `${base}/`;
        const reg = await navigator.serviceWorker.register(swPath, {
          scope: swScope,
        });
        console.log('[Godly SW Bridge] Root Service Worker (sw.js) registered:', reg.scope);

        if (reg.installing) {
          await new Promise<void>((resolve) => {
            const worker = reg.installing;
            if (!worker) return resolve();
            worker.addEventListener('statechange', () => {
              if (worker.state === 'activated') resolve();
            });
            setTimeout(resolve, 1500);
          });
        }
      } catch (swErr) {
        console.warn('[Godly SW Bridge] SW registration note:', swErr);
      }
    }

    // 2. Initialize BareMux using /bareworker.js
    if (window.BareMux) {
      const workerPath = `${base}/bareworker.js`;
      const conn = new window.BareMux.BareMuxConnection(workerPath);
      const wisp = getActiveWispUrl();
      const epoxyPath = `${base}/epoxy/index.mjs`;

      try {
        await conn.setTransport(epoxyPath, [{ wisp }]);
        console.log('[Godly SW Bridge] BareMux connected to /bareworker.js with Epoxy transport to:', wisp);
      } catch {
        try {
          const curlPath = `${base}/scramjet-transport/libcurl.mjs`;
          await conn.setTransport(curlPath, [{ wisp }]);
          console.log('[Godly SW Bridge] BareMux connected to /bareworker.js with Libcurl transport to:', wisp);
        } catch (curlErr) {
          console.warn('[Godly SW Bridge] Libcurl fallback note:', curlErr);
        }
      }
      isSwBridgeReady = true;
      isSwBridgeInitializing = false;
      return true;
    }
    isSwBridgeInitializing = false;
    return false;
  } catch (err) {
    console.warn('[Godly SW Bridge] Init error:', err);
    isSwBridgeInitializing = false;
    return false;
  }
}

export function encodeSwBridgeUrl(rawUrl: string): string {
  let url = rawUrl.trim();
  if (url.includes('now.gg')) {
    url = url.replace(/now\.gg/g, 'nowgg.fun');
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  const base = getBasePrefix();
  const prefix = `${base}/sw-service/`;

  try {
    if (window.__uv$config && typeof window.__uv$config.encodeUrl === 'function') {
      return prefix + window.__uv$config.encodeUrl(url);
    }
    if (window.Ultraviolet?.codec?.xor?.encode) {
      return prefix + window.Ultraviolet.codec.xor.encode(url);
    }
  } catch (e) {
    console.warn('[Godly SW Bridge] Encoder fallback invoked', e);
  }

  return prefix + fallbackXorEncode(url);
}

export function decodeSwBridgeUrl(encodedPath: string): string {
  try {
    const stripped = encodedPath.replace(/^\/sw-service\//, '');
    if (window.__uv$config && typeof window.__uv$config.decodeUrl === 'function') {
      return window.__uv$config.decodeUrl(stripped);
    }
    if (window.Ultraviolet?.codec?.xor?.decode) {
      return window.Ultraviolet.codec.xor.decode(stripped);
    }
  } catch {}
  return encodedPath;
}

