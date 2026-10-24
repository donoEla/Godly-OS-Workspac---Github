import { getAssetUrl } from './assetHelper';
import { encodeUvUrl } from './uvProxy';

/**
 * Universal Game HTML Fetcher & Sanitizer
 * Fetches HTML5/WebGL games from multiple fallback CDN mirrors,
 * handles external URLs (GN-Math) with CORS proxy fallbacks & UV proxy,
 * unwraps Google Module CDATA wrappers, injects absolute <base>,
 * resolves root-relative asset URLs, stubs service worker errors in iframes,
 * and returns clean, executable HTML for native srcDoc iframe execution.
 */
export async function fetchGameHtml(rawUrl: string): Promise<string> {
  // Case A: External URL (e.g. GN-Math or external CDN game)
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    let rawContent: string | null = null;
    let successfulBase: string = rawUrl.substring(0, rawUrl.lastIndexOf('/') + 1);

    // 1. Direct fetch
    try {
      const res = await fetch(rawUrl);
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim().length > 0 && !text.includes('Failed to resolve the requested file')) {
          rawContent = text;
        }
      }
    } catch {}

    // 2. CORS Proxy Fallbacks if direct fetch is blocked
    if (!rawContent) {
      const corsProxies = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(rawUrl)}`,
        `https://corsproxy.io/?url=${encodeURIComponent(rawUrl)}`,
      ];
      for (const pUrl of corsProxies) {
        try {
          const res = await fetch(pUrl);
          if (res.ok) {
            const text = await res.text();
            if (text && text.trim().length > 0) {
              rawContent = text;
              break;
            }
          }
        } catch {}
      }
    }

    // 3. Fallback via Ultraviolet Proxy if direct and public CORS proxies fail
    if (!rawContent) {
      try {
        const proxyUrl = encodeUvUrl(rawUrl);
        const res = await fetch(proxyUrl);
        if (res.ok) {
          const text = await res.text();
          if (text && text.trim().length > 0) {
            rawContent = text;
          }
        }
      } catch {}
    }

    if (rawContent) {
      return sanitizeGameHtml(rawContent, successfulBase);
    }
  }

  // Case B: Local Game Path (e.g. /local-games/W/clwordle.html)
  const cleanPath = rawUrl.startsWith('/') ? rawUrl.slice(1) : rawUrl;
  const rel = cleanPath.startsWith('local-games/')
    ? cleanPath
    : `local-games/${cleanPath.replace(/^.*local-games\//, '')}`;

  // Candidate mirror URLs in priority order
  const candidates: string[] = [
    getAssetUrl(rawUrl),
    getAssetUrl(rel),
    `https://donoela.github.io/Godly-OS-Workspac---Github/${rel}`,
    `https://cdn.jsdelivr.net/gh/donoEla/Godly-OS-Workspac---Github@main/dist/${rel}`,
    `https://cdn.jsdelivr.net/gh/donoEla/Godly-OS-Workspac---Github@main/public/${rel}`,
    `https://raw.githubusercontent.com/donoEla/Godly-OS-Workspac---Github/main/public/${rel}`,
    `https://raw.githubusercontent.com/donoEla/Godly-OS-Workspac---Github/main/dist/${rel}`,
  ];

  let rawContent: string | null = null;
  let successfulBase: string = '';

  for (const url of candidates) {
    if (!url) continue;
    try {
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim().length > 0 && !text.includes('Failed to resolve the requested file') && !text.includes('Cannot find module')) {
          rawContent = text;
          successfulBase = url.substring(0, url.lastIndexOf('/') + 1);
          break;
        }
      }
    } catch {}
  }

  if (!rawContent) {
    throw new Error(`Failed to load game assets for: ${rawUrl}`);
  }

  return sanitizeGameHtml(rawContent, successfulBase);
}

export function sanitizeGameHtml(raw: string, successfulBase: string): string {
  let html = raw;

  // 1. Unwrap Google Sites / Module CDATA container
  if (html.includes('<![CDATA[')) {
    const start = html.indexOf('<![CDATA[');
    const end = html.lastIndexOf(']]>');
    if (start !== -1 && end !== -1) {
      html = html.substring(start + 9, end);
    }
  }

  // 2. Strip Google Module XML tags and legacy wrapper comments
  html = html
    .replace(/<ModulePrefs[^>]*>/gi, '')
    .replace(/<Module[^>]*>/gi, '')
    .replace(/<\/Module>/gi, '')
    .replace(/<Content[^>]*>/gi, '')
    .replace(/<\/Content>/gi, '')
    .trim();

  // 3. Clean up stray closing tags before <head> or <body> (e.g. clpolytrackalt.html)
  const headIdx = html.search(/<(head|body)[\s>]/i);
  if (headIdx > 0) {
    const prefix = html.substring(0, headIdx).replace(/<\/(html|head|body)>/gi, '');
    html = prefix + html.substring(headIdx);
  }

  // 4. Extract existing <base href="..."> if present
  let effectiveBase = successfulBase;
  const existingBaseMatch = html.match(/<base\s+[^>]*href\s*=\s*["']([^"']+)["'][^>]*>/i);
  if (existingBaseMatch && existingBaseMatch[1]) {
    const existingHref = existingBaseMatch[1].trim();
    if (existingHref.startsWith('http://') || existingHref.startsWith('https://')) {
      effectiveBase = existingHref;
    }
  }

  // Remove existing <base> tag to avoid duplicates or invalid locations
  html = html.replace(/<base\s+[^>]*>/gi, '');

  // 5. Rewrite root-relative URLs (src="/..." and href="/...") to relative paths so they resolve via <base>
  // Preserves protocol-relative URLs (//) and absolute URLs (http://, https://, data:, blob:)
  html = html.replace(/\b(src|href)=["']\/([^\/"'][^"']*)["']/gi, '$1="$2"');

  // 6. Neutralize legacy Google gadget parent calls
  html = html.replace(/window\.parent\.maeExportApis_\(\);?/g, '/* maeExportApis_ */');

  // 7. Universal Compatibility Companion Script
  const companionShim = `
<script>
// Godly OS Game Compatibility & Sandbox Companion
try {
  window.maeExportApis_ = function() {};
  if (window.parent) {
    try { window.parent.maeExportApis_ = window.parent.maeExportApis_ || function() {}; } catch(e) {}
  }
} catch(e) {}
try {
  if (navigator.serviceWorker) {
    navigator.serviceWorker.register = function() {
      return Promise.reject(new Error('ServiceWorker disabled in sandboxed embed'));
    };
  }
} catch(e) {}
window.ytgame = window.ytgame || {
  game: {
    firstFrameReady: function() {},
    gameReady: function() {},
    onPause: function() {},
    onResume: function() {},
    loadData: function() { return Promise.resolve(''); },
    saveData: function() { return Promise.resolve(); }
  },
  healthMonitor: { setHealth: function() {} }
};
window.ytgamehelper = window.ytgamehelper || { myConsoleLog: function() {} };
window.google = window.google || {
  jsapi: {},
  csi: function() {
    return {
      reset_: function(){},
      report_: function(){},
      tickPrtAndReport: function(){},
      tickDl: function(){}
    };
  }
};
window.gtag = window.gtag || function() {};
window.ga = window.ga || function() {};
window.SDK_OPTIONS = window.SDK_OPTIONS || {};
window.C2_RegisterSW = function() {};
</script>
`;

  // 8. Inject base tag and companion shim into <head> or start of document
  const baseTag = effectiveBase ? `<base href="${effectiveBase}">\n` : '';
  const injection = `${baseTag}${companionShim}`;

  if (html.includes('<head>')) {
    html = html.replace('<head>', `<head>\n${injection}`);
  } else if (html.includes('<HEAD>')) {
    html = html.replace('<HEAD>', `<HEAD>\n${injection}`);
  } else if (html.includes('<body>')) {
    html = html.replace('<body>', `<head>\n${injection}</head>\n<body>`);
  } else if (html.includes('<BODY>')) {
    html = html.replace('<BODY>', `<head>\n${injection}</head>\n<BODY>`);
  } else {
    html = `<head>\n${injection}</head>\n` + html;
  }

  return html;
}
