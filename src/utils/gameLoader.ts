import { getAssetUrl } from './assetHelper';

/**
 * Universal Game HTML Fetcher & Sanitizer
 * Fetches HTML5/WebGL games from multiple fallback CDN mirrors,
 * unwraps Google Module CDATA wrappers, injects absolute <base>,
 * and returns clean HTML for native srcDoc iframe execution.
 */
export async function fetchGameHtml(rawUrl: string): Promise<string> {
  const cleanPath = rawUrl.startsWith('/') ? rawUrl.slice(1) : rawUrl;
  const rel = cleanPath.startsWith('local-games/')
    ? cleanPath
    : `local-games/${cleanPath.replace(/^.*local-games\//, '')}`;

  // Candidate mirror URLs in priority order
  const candidates: string[] = [
    getAssetUrl(rawUrl),
    `https://donoela.github.io/Godly-OS-Workspac---Github/${rel}`,
    `https://cdn.jsdelivr.net/gh/donoEla/Godly-OS-Workspac---Github@main/dist/${rel}`,
    `https://cdn.jsdelivr.net/gh/donoEla/Godly-OS-Workspac---Github@main/public/${rel}`,
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
        if (text && text.trim().length > 0 && !text.includes('Failed to resolve the requested file')) {
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

  let html = rawContent;

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

  // 3. Inject base tag for relative scripts, images, audio, and wasm resolution
  if (!html.includes('<base ') && !html.includes('<BASE ') && successfulBase) {
    if (html.includes('<head>')) {
      html = html.replace('<head>', `<head>\n<base href="${successfulBase}">\n`);
    } else if (html.includes('<HEAD>')) {
      html = html.replace('<HEAD>', `<HEAD>\n<base href="${successfulBase}">\n`);
    } else {
      html = `<base href="${successfulBase}">\n` + html;
    }
  }

  return html;
}
