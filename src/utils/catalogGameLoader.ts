/**
 * Catalog Game Loader
 * Fetches HTML from jsDelivr / GitHub, injects <base href="..."> for relative asset resolution,
 * handles crisp-game-lib scripts, and returns a playable Blob URL.
 */

export interface CatalogGame {
  id?: string;
  name: string;
  url: string;
  image?: string;
  source: string;
  category?: string;
  fetchGame?: boolean;
  frameFallback?: boolean;
  crispScript?: string;
  kind?: string;
  extra?: string;
}

export function withBaseTag(htmlText: string, baseUrl: string): string {
  try {
    const doc = new DOMParser().parseFromString(htmlText, 'text/html');
    if (!doc.querySelector('base')) {
      const base = doc.createElement('base');
      base.href = baseUrl;
      doc.head.prepend(base);
    }
    return '<!doctype html>\n' + doc.documentElement.outerHTML;
  } catch {
    return htmlText;
  }
}

export async function fetchPlayableGameHtml(game: CatalogGame): Promise<{ blobUrl: string; finalUrl: string }> {
  const list: string[] = [game.url];
  const m = game.url.match(/^https:\/\/cdn\.jsdelivr\.net\/gh\/([^/]+)\/([^/@]+)@([^/]+)\/(.*)$/);
  if (m) {
    list.push(`https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}/${m[4]}`);
  }

  let htmlText = '';
  let finalUrl = game.url;

  for (const u of list) {
    try {
      const res = await fetch(u, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) continue;
      const text = await res.text();
      if (!/<html|<!doctype|<script|<iframe/i.test(text)) continue;
      htmlText = text;
      finalUrl = res.url || u;
      break;
    } catch {}
  }

  if (!htmlText) {
    throw new Error('Unable to retrieve game HTML via direct fetch');
  }

  if (game.crispScript) {
    htmlText = htmlText.replace(
      'addGameScript();',
      `const gameScript=document.createElement("script");gameScript.src=${JSON.stringify(game.crispScript)};document.head.appendChild(gameScript);`
    );
  }

  if (game.source === 'Lumin') {
    const visited = new Set<string>([finalUrl]);
    for (let depth = 0; depth < 3; depth++) {
      try {
        const doc = new DOMParser().parseFromString(htmlText, 'text/html');
        const frames = doc.querySelectorAll('iframe[src]');
        if (frames.length !== 1 || doc.querySelector('canvas')) break;
        const raw = frames[0].getAttribute('src');
        if (!raw) break;
        const base = doc.querySelector('base[href]')?.getAttribute('href');
        const nextUrl = new URL(raw, base ? new URL(base, finalUrl).href : finalUrl).href;
        if (!/^https?:/.test(nextUrl) || !nextUrl.includes('jsdelivr.net/') || visited.has(nextUrl)) break;
        visited.add(nextUrl);
        const nextRes = await fetch(nextUrl, { signal: AbortSignal.timeout(15000) });
        if (nextRes.ok) {
          htmlText = await nextRes.text();
          finalUrl = nextRes.url || nextUrl;
        }
      } catch {
        break;
      }
    }
  }

  const processed = withBaseTag(htmlText, finalUrl);
  const blob = new Blob([processed], { type: 'text/html' });
  const blobUrl = URL.createObjectURL(blob);
  return { blobUrl, finalUrl };
}
