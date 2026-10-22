// Godly OS Multi-Engine Service Worker v4.0
// Powered by:
// 1. Scramjet Static v2.0 (WASM + libcurl/epoxy Wisp transport)
// 2. Service Worker Bridge (sw.js & bareworker.js)
// 3. Ultraviolet Proxy (uv/sw.js + Epoxy)

importScripts('./scramjet-engine/scramjet-all.js');
importScripts('./uv/uv.bundle.js');
importScripts('./uv/uv.config.js');
importScripts('./uv/uv.sw.js');

let scramjet = null;
let uv = null;
let swBridge = null;

try {
  if (typeof $scramjetLoadWorker === 'function') {
    const { ScramjetServiceWorker } = $scramjetLoadWorker();
    scramjet = new ScramjetServiceWorker();
    console.log('[Godly SW] Scramjet Service Worker engine initialized');
  }
} catch (err) {
  console.warn('[Godly SW] Failed to initialize Scramjet engine:', err);
}

try {
  if (typeof UVServiceWorker === 'function') {
    uv = new UVServiceWorker();
    console.log('[Godly SW] Ultraviolet Service Worker engine initialized');

    // Root Service Worker Bridge (/sw-service/ prefix for explicit sw.js mode)
    const baseLoc = self.__uv$config?.loc || '';
    swBridge = new UVServiceWorker({
      ...self.__uv$config,
      prefix: baseLoc + '/sw-service/',
      sw: baseLoc + '/sw.js',
    });
    console.log('[Godly SW] Root Service Worker Bridge (sw.js + bareworker.js) initialized');
  }
} catch (err) {
  console.warn('[Godly SW] Failed to initialize UV/SW Bridge:', err);
}

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

async function handleRequest(event) {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) {
    return fetch(event.request);
  }

  const baseLoc = self.__uv$config?.loc || '';
  const relPath = baseLoc && pathname.startsWith(baseLoc)
    ? pathname.slice(baseLoc.length)
    : pathname;

  // Passthrough for Godly OS core assets, code, transports, and dev server files
  if (
    relPath.startsWith('/assets/') ||
    relPath.startsWith('/src/') ||
    relPath.startsWith('/@') ||
    relPath.startsWith('/node_modules/') ||
    relPath.startsWith('/scramjet-engine/') ||
    relPath.startsWith('/scramjet-transport/') ||
    relPath.startsWith('/transport/') ||
    relPath.startsWith('/epoxy/') ||
    relPath.startsWith('/libcurl/') ||
    relPath.startsWith('/baremux/') ||
    relPath.startsWith('/local-games/') ||
    relPath.startsWith('/os-proxy') ||
    relPath === '/bareworker.js' ||
    relPath === '/sw.js' ||
    relPath === '/favicon.svg' ||
    relPath === '/icons.svg' ||
    relPath === '/index.svg' ||
    relPath === '/gn_math_games.json' ||
    relPath === '/local_games.json' ||
    relPath === '/' ||
    relPath === '/index.html' ||
    relPath === ''
  ) {
    return fetch(event.request);
  }

  // 1. Scramjet Route Check
  if (scramjet) {
    try {
      await scramjet.loadConfig();
      if (scramjet.config && scramjet.route(event)) {
        return await scramjet.fetch(event);
      }
    } catch (err) {
      console.warn('[Godly SW] Scramjet route error:', err);
    }
  }

  // 2. Service Worker Bridge Route Check (/sw-service/)
  if (swBridge) {
    try {
      if (swBridge.route(event)) {
        return await swBridge.fetch(event);
      }
    } catch (err) {
      console.warn('[Godly SW] SW Bridge route error:', err);
    }
  }

  // 3. Ultraviolet Route Check (/uv/service/)
  if (uv) {
    try {
      if (uv.route(event)) {
        return await uv.fetch(event);
      }
    } catch (err) {
      console.warn('[Godly SW] UV route error:', err);
    }
  }

  // Fallback to network
  return fetch(event.request);
}

self.addEventListener('fetch', (event) => {
  if (new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(handleRequest(event));
});
