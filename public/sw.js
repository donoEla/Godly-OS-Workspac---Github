// Godly OS Multi-Engine Service Worker v4.0
// Powered by:
// 1. Scramjet Static v2.0 (WASM + libcurl/epoxy Wisp transport)
// 2. Service Worker Bridge (sw.js & bareworker.js)
// 3. Ultraviolet Proxy (uv/sw.js + Epoxy)

try {
  importScripts('./scramjet-engine/scramjet-all.js');
} catch (e) {
  console.warn('[Godly SW] scramjet-all.js import:', e);
}

try {
  importScripts('./uv/uv.bundle.js');
  importScripts('./uv/uv.config.js');
  importScripts('./uv/uv.sw.js');
} catch (e) {
  console.warn('[Godly SW] UV scripts import:', e);
}

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
  try {
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) {
      return fetch(event.request);
    }

    const pathname = url.pathname;
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

    // 1. Scramjet Route Check (/scramjet/)
    if (relPath.startsWith('/scramjet/')) {
      const fullPrefix = (baseLoc || '') + '/scramjet/';
      if (scramjet) {
        try {
          if (!scramjet.config) {
            await scramjet.loadConfig().catch(() => {});
          }
          if (!scramjet.config) {
            scramjet.config = {
              prefix: fullPrefix,
              globals: {
                wrapfn: '$scramjet$wrap',
                wrappropertybase: '$scramjet__',
                wrappropertyfn: '$scramjet$prop',
                cleanrestfn: '$scramjet$clean',
                importfn: '$scramjet$import',
                rewritefn: '$scramjet$rewrite',
                metafn: '$scramjet$meta',
                setrealmfn: '$scramjet$setrealm',
                pushsourcemapfn: '$scramjet$pushsourcemap',
                trysetfn: '$scramjet$tryset',
                templocid: '$scramjet$temploc',
                tempunusedid: '$scramjet$tempunused',
              },
              files: {
                wasm: (baseLoc || '') + '/scramjet-engine/scramjet.wasm',
                all: (baseLoc || '') + '/scramjet-engine/scramjet-all.js',
                sync: (baseLoc || '') + '/scramjet-engine/scramjet-sync.js',
              },
              flags: {
                serviceworkers: false,
                syncxhr: false,
                strictRewrites: true,
                rewriterLogs: false,
                captureErrors: true,
                cleanErrors: false,
                scramitize: false,
                sourcemaps: true,
                destructureRewrites: false,
                interceptDownloads: false,
                allowInvalidJs: true,
                allowFailedIntercepts: true,
              },
              siteFlags: {},
              codec: {
                encode: 'e => e ? encodeURIComponent(e) : e',
                decode: 'e => e ? decodeURIComponent(e) : e',
              },
            };
          }
          return await scramjet.fetch(event);
        } catch (err) {
          console.warn('[Godly SW] Scramjet execution note, attempting UV fallback:', err);
        }
      }

      // Scramjet fallback to Ultraviolet
      if (uv) {
        try {
          const rawDest = decodeURIComponent(relPath.slice('/scramjet/'.length));
          if (rawDest.startsWith('http://') || rawDest.startsWith('https://')) {
            const uvEncoded = uv.codec.xor.encode(rawDest);
            const redirectPrefix = self.__uv$config?.prefix || ((baseLoc || '') + '/uv/service/');
            return Response.redirect(location.origin + redirectPrefix + uvEncoded, 302);
          }
        } catch {}
      }

      return new Response(
        `<!DOCTYPE html><html><body style="background:#0b0f19;color:#e2e8f0;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;"><div style="text-align:center;padding:24px;border:1px solid rgba(255,255,255,0.1);border-radius:16px;background:rgba(255,255,255,0.03);"><h3 style="color:#c084fc;margin-top:0;">Godly Scramjet Bridge Connecting...</h3><p style="font-size:13px;color:#94a3b8;">Re-establishing WASM worker proxy channel. Please reload or switch to Ultraviolet in browser settings.</p><button onclick="location.reload()" style="background:#9333ea;color:#fff;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;">Reload Frame</button></div></body></html>`,
        { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } }
      );
    }

    // 2. Service Worker Bridge Route Check (/sw-service/)
    if (relPath.startsWith('/sw-service/')) {
      if (swBridge) {
        try {
          return await swBridge.fetch(event);
        } catch (err) {
          console.warn('[Godly SW] SW Bridge route error:', err);
        }
      }
      if (uv) {
        try {
          return await uv.fetch(event);
        } catch {}
      }
      return new Response('SW Bridge routing failure', { status: 502 });
    }

    // 3. Ultraviolet Route Check (/uv/service/)
    if (relPath.startsWith('/uv/service/')) {
      if (uv) {
        try {
          return await uv.fetch(event);
        } catch (err) {
          console.warn('[Godly SW] UV route error:', err);
        }
      }
      return new Response('Ultraviolet routing failure', { status: 502 });
    }

    // Fallback to network
    return fetch(event.request);
  } catch (err) {
    console.error('[Godly SW] handleRequest unhandled error, falling back to network:', err);
    return fetch(event.request);
  }
}

self.addEventListener('fetch', (event) => {
  if (new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(handleRequest(event));
});
