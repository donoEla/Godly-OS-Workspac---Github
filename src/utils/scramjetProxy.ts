// Scramjet Static v2.0 Proxy Integration for Godly OS
// MercuryWorkshop Scramjet Engine (WASM + libcurl/epoxy Wisp transport)
// Source: https://github.com/hahahah67-pixel/scramjet-static

import { getActiveWispUrl, getBasePrefix, isServiceWorkerActive } from './uvProxy';

declare global {
  interface Window {
    $scramjetLoadController?: () => {
      ScramjetController: new (options: {
        prefix: string;
        files: {
          wasm: string;
          all: string;
          sync: string;
        };
      }) => {
        init: () => Promise<void>;
        encodeUrl: (url: string) => string;
        decodeUrl: (path: string) => string;
      };
      ScramjetFrame?: any;
    };
  }
}

export type ScramjetTransportType = 'libcurl' | 'epoxy';

let scramjetInstance: any = null;
let isScramjetReady = false;
let isScramjetInitializing = false;
let activeScramjetTransport: ScramjetTransportType = 'libcurl';

export function isScramjetActive(): boolean {
  return isScramjetReady && isServiceWorkerActive();
}

export function getActiveScramjetTransport(): ScramjetTransportType {
  try {
    const saved = localStorage.getItem('godly_scramjet_transport');
    if (saved === 'epoxy' || saved === 'libcurl') return saved;
  } catch {}
  return activeScramjetTransport;
}

export function setActiveScramjetTransport(transport: ScramjetTransportType) {
  activeScramjetTransport = transport;
  try {
    localStorage.setItem('godly_scramjet_transport', transport);
  } catch {}
}

export async function initScramjetProxy(
  wispUrl?: string,
  preferredTransport?: ScramjetTransportType
): Promise<boolean> {
  if (isScramjetReady && scramjetInstance && isServiceWorkerActive()) {
    return true;
  }

  if (isScramjetInitializing) {
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if (isScramjetReady) {
          clearInterval(check);
          resolve(true);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(check);
        resolve(isScramjetReady);
      }, 4000);
    });
  }

  isScramjetInitializing = true;
  const base = getBasePrefix();
  const transport = preferredTransport || getActiveScramjetTransport();
  const targetWisp = wispUrl || getActiveWispUrl();

  try {
    // 1. Register unified root Service Worker (/sw.js)
    if ('serviceWorker' in navigator) {
      try {
        const swPath = `${base}/sw.js`;
        const swScope = `${base}/`;
        const reg = await navigator.serviceWorker.register(swPath, {
          scope: swScope,
        });
        console.log('[Godly Scramjet] Root Service Worker registered:', reg.scope);

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
        console.warn('[Godly Scramjet] Service Worker registration note:', swErr);
      }
    }

    // 2. Load Scramjet controller script dynamically
    if (!window.$scramjetLoadController) {
      try {
        // @ts-ignore dynamic import from public directory
        await import(/* @vite-ignore */ `${base}/scramjet-engine/scramjet.js`);
      } catch (importErr) {
        // Fallback: inject script element
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.type = 'module';
          script.src = `${base}/scramjet-engine/scramjet.js`;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load scramjet.js script'));
          document.head.appendChild(script);
        });
      }
    }

    if (!window.$scramjetLoadController) {
      throw new Error('window.$scramjetLoadController is not available after loading scramjet.js');
    }

    // 3. Instantiate ScramjetController and write IDB config
    const { ScramjetController } = window.$scramjetLoadController();
    const prefix = `${base}/scramjet/`;
    scramjetInstance = new ScramjetController({
      prefix,
      files: {
        wasm: `${base}/scramjet-engine/scramjet.wasm`,
        all: `${base}/scramjet-engine/scramjet-all.js`,
        sync: `${base}/scramjet-engine/scramjet-sync.js`,
      },
    });

    await scramjetInstance.init();
    console.log('[Godly Scramjet] Controller initialized with prefix:', prefix);

    // 4. Connect BareMux to /bareworker.js with transport (libcurl / epoxy)
    if (window.BareMux) {
      const workerPath = `${base}/bareworker.js`;
      const conn = new window.BareMux.BareMuxConnection(workerPath);
      const transportPath = `${base}/scramjet-transport/${transport}.mjs`;

      try {
        await conn.setTransport(transportPath, [{ wisp: targetWisp }]);
        console.log(`[Godly Scramjet] BareMux connected to ${transport} transport via:`, targetWisp);
      } catch (tErr) {
        console.warn(`[Godly Scramjet] Primary transport (${transport}) failed, falling back:`, tErr);
        const fallback = transport === 'libcurl' ? 'epoxy' : 'libcurl';
        const fallbackPath = `${base}/scramjet-transport/${fallback}.mjs`;
        try {
          await conn.setTransport(fallbackPath, [{ wisp: targetWisp }]);
          setActiveScramjetTransport(fallback);
          console.log(`[Godly Scramjet] BareMux connected to fallback ${fallback} transport`);
        } catch (fbErr) {
          console.warn('[Godly Scramjet] Fallback transport also failed:', fbErr);
        }
      }
    }

    isScramjetReady = true;
    isScramjetInitializing = false;
    return true;
  } catch (err) {
    console.warn('[Godly Scramjet] Initialization error:', err);
    isScramjetInitializing = false;
    return false;
  }
}

export function encodeScramjetUrl(rawUrl: string): string {
  let url = rawUrl.trim();
  if (url.includes('now.gg')) {
    url = url.replace(/now\.gg/g, 'nowgg.fun');
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  const base = getBasePrefix();
  const prefix = `${base}/scramjet/`;

  try {
    if (scramjetInstance && typeof scramjetInstance.encodeUrl === 'function') {
      return scramjetInstance.encodeUrl(url);
    }
  } catch (e) {
    console.warn('[Godly Scramjet] Controller encoder note:', e);
  }

  // Safe standard URI encode fallback
  return `${prefix}${encodeURIComponent(url)}`;
}

export function decodeScramjetUrl(encodedPath: string): string {
  try {
    const base = getBasePrefix();
    const prefix = `${base}/scramjet/`;
    if (scramjetInstance && typeof scramjetInstance.decodeUrl === 'function') {
      return scramjetInstance.decodeUrl(encodedPath);
    }
    if (encodedPath.startsWith(prefix)) {
      return decodeURIComponent(encodedPath.slice(prefix.length));
    }
  } catch {}
  return encodedPath;
}
