/**
 * Universal Asset URL Resolver
 * Resolves static assets correctly across:
 * - GitHub Pages with subpath (e.g. /Godly-OS-Workspac---Github/)
 * - Custom domains / Wasmer.io edge deployment (root /)
 * - Local development Vite dev server
 * - jsDelivr CDN links & SVG embedded bootloaders
 * - about:srcdoc sandboxed frames
 */

const GITHUB_PAGES_ORIGIN = 'https://donoela.github.io/Godly-OS-Workspac---Github';
const JSDELIVR_DIST_ORIGIN = 'https://cdn.jsdelivr.net/gh/donoEla/Godly-OS-Workspac---Github@main/dist';

export function getAssetUrl(path: string | undefined | null): string {
  if (!path) return '';

  if (path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }

  // Extract relative path if string contains known internal subpaths
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

  // Prevent duplicating repo subpath if path already contains it
  const repoName = 'Godly-OS-Workspac---Github';
  while (cleanPath.startsWith(`${repoName}/`)) {
    cleanPath = cleanPath.slice(repoName.length + 1);
  }

  // Detect jsDelivr context
  const isJsDelivr =
    (typeof window !== 'undefined' && window.location.hostname === 'cdn.jsdelivr.net') ||
    (typeof document !== 'undefined' && document.baseURI && document.baseURI.includes('cdn.jsdelivr.net'));

  if (isJsDelivr) {
    // When on jsDelivr, all build output lives under /dist/
    const distPath = cleanPath.startsWith('dist/') ? cleanPath : `dist/${cleanPath}`;
    const url = `https://cdn.jsdelivr.net/gh/donoEla/Godly-OS-Workspac---Github@main/${distPath}`;
    return query ? `${url}?${query}` : url;
  }

  // Detect about:srcdoc sandboxed frame
  const isSrcDoc =
    typeof window !== 'undefined' &&
    (window.location.href.startsWith('about:') ||
      window.location.pathname === 'srcdoc' ||
      window.location.pathname.includes('/srcdoc'));

  if (isSrcDoc) {
    // Fall back to dedicated GitHub Pages mirror for stable HTTPS resolution
    const url = `${GITHUB_PAGES_ORIGIN}/${cleanPath}`;
    return query ? `${url}?${query}` : url;
  }

  // If document.baseURI is set to a valid HTTP(S) URL, resolve against it
  if (typeof document !== 'undefined' && document.baseURI && !document.baseURI.startsWith('about:')) {
    try {
      const url = new URL(cleanPath, document.baseURI).href;
      return query ? (url.includes('?') ? url : `${url}?${query}`) : url;
    } catch {}
  }

  let resolved = cleanPath;

  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    const segments = pathname
      .split('/')
      .filter((s) => Boolean(s) && s !== 'srcdoc' && !s.includes('.'));

    if (segments.length > 0) {
      // Subpath deployment (e.g. GitHub Pages: /Godly-OS-Workspac---Github/)
      const subpath = segments.join('/');
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
