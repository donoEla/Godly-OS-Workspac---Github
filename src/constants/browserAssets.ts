import React from 'react';
import { getAssetUrl } from '../utils/assetHelper';

export interface BrowserBackground {
  id: string;
  name: string;
  fileName: string;
  path: string;
}

export const GODLY_BROWSER_BACKGROUNDS: BrowserBackground[] = [
  { id: 'bg-alpine-lake-5k', name: 'Twilight Alpine Lake (5K Ultra-HD)', fileName: 'wp9024400.jpg', path: 'assets/browser-backgrounds/wp9024400.jpg' },
  { id: 'bg-glacier-sunrise-4k', name: 'Glacier National Park Sunrise (4K Ultra-HD)', fileName: 'wallpapersden.com_glacier-national-park-sunrise_4000x2667.jpg', path: 'assets/browser-backgrounds/wallpapersden.com_glacier-national-park-sunrise_4000x2667.jpg' },
  { id: 'bg-distant-mist-4k', name: 'Distant Mountain Mist (4K Cinema)', fileName: '2733947.jpg', path: 'assets/browser-backgrounds/2733947.jpg' },
  { id: 'bg-turquoise-waters-4k', name: 'Turquoise Alpine Waters (4K Ultra-HD)', fileName: '31201.jpg', path: 'assets/browser-backgrounds/31201.jpg' },
  { id: 'bg-sunset-forest-4k', name: 'Golden Sunset Forest (4K Ultra-HD)', fileName: 'wp2506793.jpg', path: 'assets/browser-backgrounds/wp2506793.jpg' },
  { id: 'bg-emerald-stream-4k', name: 'Lush Emerald Stream (4K Ultra-HD)', fileName: 'wp2506811.jpg', path: 'assets/browser-backgrounds/wp2506811.jpg' },
  { id: 'bg-misty-pines-4k', name: 'Misty Alpine Pines (4K Ultra-HD)', fileName: 'wp2506817.jpg', path: 'assets/browser-backgrounds/wp2506817.jpg' },
  { id: 'bg-mystic-river-4k', name: 'Mystic River Mist (4K Ultra-HD)', fileName: 'wp2506846.jpg', path: 'assets/browser-backgrounds/wp2506846.jpg' },
  { id: 'bg-twilight-haven-4k', name: 'Twilight Coastal Haven (4K Ultra-HD)', fileName: 'wp2767312.jpg', path: 'assets/browser-backgrounds/wp2767312.jpg' },
  { id: 'bg-autumn-glow-4k', name: 'Warm Autumn Glow (4K Ultra-HD)', fileName: 'wp3162131.jpg', path: 'assets/browser-backgrounds/wp3162131.jpg' },
  { id: 'bg-peaks-cloudscape-4k', name: 'Distant Peaks Cloudscape (4K Ultra-HD)', fileName: 'wp5156379.jpg', path: 'assets/browser-backgrounds/wp5156379.jpg' },
  { id: 'bg-mountain-valley-4k', name: 'Serene Mountain Valley (4K Ultra-HD)', fileName: 'wp9161604.jpg', path: 'assets/browser-backgrounds/wp9161604.jpg' },
  { id: 'bg-nordic-panorama', name: 'Nordic Fjords Panorama (Ultrawide 3.7K)', fileName: 'wp2506849.jpg', path: 'assets/browser-backgrounds/wp2506849.jpg' },
  { id: 'bg-cascade-glade-2k', name: 'Emerald Cascade Glade (Retina 2.8K)', fileName: 'wp6844174.jpg', path: 'assets/browser-backgrounds/wp6844174.jpg' },
  { id: 'bg-seljalandsfoss-hd', name: 'Seljalandsfoss Waterfall Iceland (2.7K HD)', fileName: 'seljalandsfoss-waterfall-iceland-jc-1366x768.jpg', path: 'assets/browser-backgrounds/seljalandsfoss-waterfall-iceland-jc-1366x768.jpg' },
  { id: 'bg-romantic-vista', name: 'Romantic Painterly Vista (Full HD)', fileName: 'wp2506865.jpg', path: 'assets/browser-backgrounds/wp2506865.jpg' },
  { id: 'bg-autumn-reflections', name: 'Autumn River Reflections (Full HD)', fileName: 'wp2506836.jpg', path: 'assets/browser-backgrounds/wp2506836.jpg' },
];

/**
 * Returns a high-res authentic favicon URL or SVG representation
 */
export function getDomainFromUrl(url: string): string {
  try {
    if (!url) return '';
    let clean = url.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'https://' + clean;
    }
    const parsed = new URL(clean);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function getFaviconUrl(url: string): string {
  const domain = getDomainFromUrl(url);
  if (!domain) return '';
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
}
