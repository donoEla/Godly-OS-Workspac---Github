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

  if (path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }

  // If path contains internal assets/ or local-games/, extract relative path to repair any stored duplicated subpaths
  const internalFolders = [
    'assets/',
    'local-games/',
    'uv/',
    'baremux/',
    'epoxy/',
    'scramjet/',
    'scramjet-engine/',
    'scramjet-transport/',
    'transport/',
  ];
  let assetRelPath: string | null = null;
  for (const folder of internalFolders) {
    const idx = path.indexOf('/' + folder);
    if (idx !== -1) {
      assetRelPath = path.slice(idx + 1);
      break;
    } else if (path.startsWith(folder)) {
      assetRelPath = path;
      break;
    }
  }

  // If external URL without internal asset path (e.g. Unsplash, external CDN), return as-is
  if (!assetRelPath && (path.startsWith('http://') || path.startsWith('https://'))) {
    return path;
  }

  const target = assetRelPath || path;
  const [basePath, query] = target.split('?');
  let cleanPath = basePath.startsWith('/') ? basePath.slice(1) : basePath;

  // Prevent duplicating repo subpath if path already contains it (from storage or nested calls)
  const repoName = 'Godly-OS-Workspac---Github';
  while (cleanPath.startsWith(`${repoName}/`)) {
    cleanPath = cleanPath.slice(repoName.length + 1);
  }

  // If document.baseURI is set (e.g. GitHub Pages or SVG iframe loader with <base href="...">), resolve against it
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
