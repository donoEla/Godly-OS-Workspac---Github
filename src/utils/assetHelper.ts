/**
 * Universal Asset URL Resolver
 * Resolves static assets correctly across:
 * - GitHub Pages with subpath (e.g. /Godly-OS-Workspac---Github/)
 * - Custom domains / Wasmer / Cloudflare Pages (root /)
 * - Local development Vite dev server
 * - jsDelivr / CDNs
 */
export function getAssetUrl(path: string | undefined | null): string {
  if (!path) return '';

  // Return external/data/blob protocols as-is
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }

  // Preserve query string if present (e.g. ?v=3)
  const [basePath, query] = path.split('?');
  const cleanPath = basePath.startsWith('/') ? basePath.slice(1) : basePath;

  // If document.baseURI is set (e.g. SVG iframe loader with <base href="...">), resolve against it
  if (typeof document !== 'undefined' && document.baseURI && !document.baseURI.startsWith('about:')) {
    try {
      const url = new URL(cleanPath, document.baseURI).href;
      return query ? (url.includes('?') ? url : `${url}?${query}`) : url;
    } catch {}
  }

  let resolved = cleanPath;

  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    const segments = pathname.split('/').filter(Boolean);

    // If the last segment is an html file or file with extension, pop it
    if (segments.length > 0 && segments[segments.length - 1].includes('.')) {
      segments.pop();
    }

    if (segments.length > 0) {
      // Subpath deployment (e.g. GitHub Pages: /Godly-OS-Workspac---Github/)
      const subpath = segments.join('/');
      // Avoid duplicating subpath if cleanPath already starts with it
      if (!cleanPath.startsWith(subpath)) {
        resolved = `/${subpath}/${cleanPath}`;
      } else {
        resolved = `/${cleanPath}`;
      }
      return query ? `${resolved}?${query}` : resolved;
    }
  }

  const base = import.meta.env.BASE_URL || './';
  if (base === './' || base === '') {
    resolved = `./${cleanPath}`;
  } else if (base.endsWith('/')) {
    resolved = `${base}${cleanPath}`;
  } else {
    resolved = `${base}/${cleanPath}`;
  }

  return query ? `${resolved}?${query}` : resolved;
}
