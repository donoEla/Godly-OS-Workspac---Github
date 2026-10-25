/**
 * Hardware-Accelerated Custom Cursor Engine for Godly OS
 * Uses encoded SVG data URIs with exact hotspot coordinates for 0-latency native rendering.
 */

export interface CursorPreset {
  id: string;
  name: string;
  category: 'Modern' | 'Gamer' | 'Cyber' | 'Aesthetic' | 'Classic';
  description: string;
  color: string;
  badge: string;
  svgPointer: string;
  svgPointerClick: string;
  hotspot: [number, number];
  hotspotClick: [number, number];
}

const encodeSvg = (svg: string): string => {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg.trim());
};

// 1. Cyber Neon
const CYBER_POINTER = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
  <defs>
    <filter id="glow-cyber" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#06b6d4" flood-opacity="0.7"/>
    </filter>
    <linearGradient id="grad-cyber" x1="4" y1="4" x2="24" y2="24" gradientUnits="userSpaceOnUse">
      <stop stop-color="#22d3ee"/>
      <stop offset="1" stop-color="#a855f7"/>
    </linearGradient>
  </defs>
  <path d="M3 3L13 27L17.5 17.5L27 13L3 3Z" fill="#080c18" stroke="#06b6d4" stroke-width="2" stroke-linejoin="round" filter="url(#glow-cyber)"/>
  <path d="M6 6L13.5 23L16.5 16.5L23 13.5L6 6Z" fill="url(#grad-cyber)"/>
  <circle cx="17" cy="17" r="1.5" fill="#ffffff"/>
</svg>`;

const CYBER_CLICK = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
  <defs>
    <filter id="glow-click" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#a855f7" flood-opacity="0.8"/>
    </filter>
  </defs>
  <path d="M10 2L14 14L26 14L16 21L20 31L10 23L4 28L6 18L1 12L10 11L10 2Z" fill="#090d16" stroke="#22d3ee" stroke-width="1.8" filter="url(#glow-click)"/>
  <circle cx="10" cy="11" r="3" fill="#a855f7" stroke="#ffffff" stroke-width="1.2"/>
</svg>`;

// 2. Godly Gold
const GOLD_POINTER = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
  <defs>
    <filter id="glow-gold" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#f59e0b" flood-opacity="0.75"/>
    </filter>
    <linearGradient id="grad-gold" x1="4" y1="4" x2="24" y2="24" gradientUnits="userSpaceOnUse">
      <stop stop-color="#fde047"/>
      <stop offset="0.5" stop-color="#eab308"/>
      <stop offset="1" stop-color="#b45309"/>
    </linearGradient>
  </defs>
  <path d="M3 3L13 27L17.5 17.5L27 13L3 3Z" fill="#181206" stroke="#fbbf24" stroke-width="2" stroke-linejoin="round" filter="url(#glow-gold)"/>
  <path d="M6 6L13.5 23L16.5 16.5L23 13.5L6 6Z" fill="url(#grad-gold)"/>
  <polygon points="12,12 16,10 14,14" fill="#ffffff" opacity="0.9"/>
</svg>`;

const GOLD_CLICK = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
  <defs>
    <filter id="glow-gold-click" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#f59e0b" flood-opacity="0.9"/>
    </filter>
  </defs>
  <circle cx="16" cy="16" r="10" fill="#181206" stroke="#fbbf24" stroke-width="2" filter="url(#glow-gold-click)"/>
  <circle cx="16" cy="16" r="5" fill="#f59e0b"/>
  <circle cx="16" cy="16" r="2" fill="#ffffff"/>
</svg>`;

// 3. Obsidian Stealth
const OBSIDIAN_POINTER = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
  <defs>
    <filter id="glow-obsidian" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#8b5cf6" flood-opacity="0.5"/>
    </filter>
  </defs>
  <path d="M3 3L13 27L17.5 17.5L27 13L3 3Z" fill="#0f172a" stroke="#8b5cf6" stroke-width="1.8" stroke-linejoin="round" filter="url(#glow-obsidian)"/>
  <path d="M6 6L13.5 23L16.5 16.5L23 13.5L6 6Z" fill="#1e1b4b"/>
  <path d="M6 6L13 13L16.5 16.5" stroke="#a78bfa" stroke-width="1.2" stroke-linecap="round"/>
</svg>`;

const OBSIDIAN_CLICK = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
  <defs>
    <filter id="glow-obs-click" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#8b5cf6" flood-opacity="0.7"/>
    </filter>
  </defs>
  <path d="M4 4L12 24L16 16L24 12L4 4Z" fill="#1e1b4b" stroke="#a78bfa" stroke-width="2" filter="url(#glow-obs-click)"/>
  <circle cx="16" cy="16" r="2.5" fill="#c084fc"/>
</svg>`;

// 4. Crystal Glass (iOS Liquid Glass)
const GLASS_POINTER = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
  <defs>
    <filter id="glow-glass" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#38bdf8" flood-opacity="0.45"/>
    </filter>
    <linearGradient id="grad-glass" x1="3" y1="3" x2="25" y2="25" gradientUnits="userSpaceOnUse">
      <stop stop-color="#ffffff" stop-opacity="0.85"/>
      <stop offset="0.6" stop-color="#38bdf8" stop-opacity="0.6"/>
      <stop offset="1" stop-color="#818cf8" stop-opacity="0.4"/>
    </linearGradient>
  </defs>
  <path d="M3 3L13 27L17.5 17.5L27 13L3 3Z" fill="url(#grad-glass)" stroke="#ffffff" stroke-width="1.6" stroke-linejoin="round" filter="url(#glow-glass)"/>
  <path d="M6 6L11 18L14 14L18 11L6 6Z" fill="#ffffff" fill-opacity="0.6"/>
</svg>`;

const GLASS_CLICK = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
  <defs>
    <filter id="glow-glass-click" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="0" dy="3" stdDeviation="3.5" flood-color="#38bdf8" flood-opacity="0.6"/>
    </filter>
  </defs>
  <circle cx="16" cy="16" r="9" fill="rgba(255,255,255,0.25)" stroke="#ffffff" stroke-width="2" filter="url(#glow-glass-click)"/>
  <circle cx="16" cy="16" r="4" fill="#38bdf8"/>
</svg>`;

// 5. Retro 8-Bit Pixel
const RETRO_POINTER = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" shape-rendering="crispEdges">
  <path d="M2 2h4v2h2v2h2v2h2v2h2v2h2v2h2v2h-4v2h-2v2h-2v4h-4v-4h-2v-4H2V2z" fill="#000000"/>
  <path d="M4 4h2v2h2v2h2v2h2v2h2v2h2v2h-2v2h-2v2h-2v2H6v-4H4V4z" fill="#ffffff"/>
  <rect x="6" y="8" width="2" height="6" fill="#ec4899"/>
</svg>`;

const RETRO_CLICK = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" shape-rendering="crispEdges">
  <path d="M8 2h4v8h4v4h4v8h-4v4h-8v-4H4v-8h4V2z" fill="#000000"/>
  <path d="M10 4h2v8h4v4h2v6h-4v2h-4v-2H6v-6h4V4z" fill="#ffffff"/>
  <rect x="10" y="8" width="2" height="6" fill="#3b82f6"/>
</svg>`;

// 6. Matrix Phosphor
const MATRIX_POINTER = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
  <defs>
    <filter id="glow-matrix" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#10b981" flood-opacity="0.8"/>
    </filter>
  </defs>
  <path d="M3 3L13 27L17.5 17.5L27 13L3 3Z" fill="#022c22" stroke="#10b981" stroke-width="2" stroke-linejoin="round" filter="url(#glow-matrix)"/>
  <path d="M6 6L13.5 23L16.5 16.5L23 13.5L6 6Z" fill="#059669"/>
  <line x1="8" y1="8" x2="16" y2="16" stroke="#34d399" stroke-width="1.5" stroke-linecap="round"/>
</svg>`;

const MATRIX_CLICK = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
  <defs>
    <filter id="glow-mat-click" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#10b981" flood-opacity="0.9"/>
    </filter>
  </defs>
  <rect x="6" y="6" width="20" height="20" rx="4" fill="#022c22" stroke="#10b981" stroke-width="2" filter="url(#glow-mat-click)"/>
  <path d="M11 16h10M16 11v10" stroke="#34d399" stroke-width="2" stroke-linecap="round"/>
</svg>`;

// 7. Hyper Crosshair
const CROSSHAIR_POINTER = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
  <defs>
    <filter id="glow-cross" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#ef4444" flood-opacity="0.7"/>
    </filter>
  </defs>
  <circle cx="16" cy="16" r="10" stroke="#ef4444" stroke-width="1.8" stroke-dasharray="4 3" filter="url(#glow-cross)"/>
  <line x1="16" y1="2" x2="16" y2="10" stroke="#f87171" stroke-width="2" stroke-linecap="round"/>
  <line x1="16" y1="22" x2="16" y2="30" stroke="#f87171" stroke-width="2" stroke-linecap="round"/>
  <line x1="2" y1="16" x2="10" y2="16" stroke="#f87171" stroke-width="2" stroke-linecap="round"/>
  <line x1="22" y1="16" x2="30" y2="16" stroke="#f87171" stroke-width="2" stroke-linecap="round"/>
  <circle cx="16" cy="16" r="2.5" fill="#ffffff"/>
</svg>`;

const CROSSHAIR_CLICK = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
  <defs>
    <filter id="glow-cross-click" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="0" dy="1" stdDeviation="2.5" flood-color="#ef4444" flood-opacity="0.9"/>
    </filter>
  </defs>
  <circle cx="16" cy="16" r="12" stroke="#ef4444" stroke-width="2" filter="url(#glow-cross-click)"/>
  <circle cx="16" cy="16" r="4" fill="#ef4444"/>
  <circle cx="16" cy="16" r="1.5" fill="#ffffff"/>
</svg>`;

// 8. Pastel Blossom
const PASTEL_POINTER = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
  <defs>
    <filter id="glow-pastel" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#ec4899" flood-opacity="0.6"/>
    </filter>
    <linearGradient id="grad-pastel" x1="4" y1="4" x2="24" y2="24" gradientUnits="userSpaceOnUse">
      <stop stop-color="#f472b6"/>
      <stop offset="1" stop-color="#c084fc"/>
    </linearGradient>
  </defs>
  <path d="M3 3L13 27L17.5 17.5L27 13L3 3Z" fill="#2e1065" stroke="#f472b6" stroke-width="2" stroke-linejoin="round" filter="url(#glow-pastel)"/>
  <path d="M6 6L13.5 23L16.5 16.5L23 13.5L6 6Z" fill="url(#grad-pastel)"/>
  <circle cx="16.5" cy="16.5" r="2" fill="#ffffff"/>
</svg>`;

const PASTEL_CLICK = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
  <defs>
    <filter id="glow-pas-click" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#f472b6" flood-opacity="0.8"/>
    </filter>
  </defs>
  <path d="M16 2L19 12L29 15L20 20L21 30L16 23L11 30L12 20L3 15L13 12L16 2Z" fill="#f472b6" stroke="#ffffff" stroke-width="1.5" filter="url(#glow-pas-click)"/>
</svg>`;

// 9. Ruby Blaze
const RUBY_POINTER = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
  <defs>
    <filter id="glow-ruby" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#dc2626" flood-opacity="0.75"/>
    </filter>
    <linearGradient id="grad-ruby" x1="4" y1="4" x2="24" y2="24" gradientUnits="userSpaceOnUse">
      <stop stop-color="#f97316"/>
      <stop offset="1" stop-color="#dc2626"/>
    </linearGradient>
  </defs>
  <path d="M3 3L13 27L17.5 17.5L27 13L3 3Z" fill="#1c0505" stroke="#ef4444" stroke-width="2" stroke-linejoin="round" filter="url(#glow-ruby)"/>
  <path d="M6 6L13.5 23L16.5 16.5L23 13.5L6 6Z" fill="url(#grad-ruby)"/>
  <circle cx="16.5" cy="16.5" r="1.8" fill="#fef08a"/>
</svg>`;

const RUBY_CLICK = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
  <defs>
    <filter id="glow-rub-click" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#ea580c" flood-opacity="0.85"/>
    </filter>
  </defs>
  <path d="M8 4L14 24L18 16L26 12L8 4Z" fill="#ea580c" stroke="#fef08a" stroke-width="1.8" filter="url(#glow-rub-click)"/>
  <circle cx="18" cy="16" r="2.5" fill="#ffffff"/>
</svg>`;

export const CURSOR_PRESETS: CursorPreset[] = [
  {
    id: 'default',
    name: 'Native Classic',
    category: 'Classic',
    description: 'System standard hardware cursor with zero overhead.',
    color: '#94a3b8',
    badge: 'Standard',
    svgPointer: '',
    svgPointerClick: '',
    hotspot: [0, 0],
    hotspotClick: [0, 0],
  },
  {
    id: 'cyber-neon',
    name: 'Cyber Neon',
    category: 'Cyber',
    description: 'Glowing cyan-violet futuristic pointer with luminous dropshadow.',
    color: '#06b6d4',
    badge: 'Popular',
    svgPointer: CYBER_POINTER,
    svgPointerClick: CYBER_CLICK,
    hotspot: [3, 3],
    hotspotClick: [10, 2],
  },
  {
    id: 'godly-gold',
    name: 'Godly Celestial',
    category: 'Modern',
    description: 'Luxurious 24K radiant gold dagger with amber shimmer halo.',
    color: '#f59e0b',
    badge: 'Luxury',
    svgPointer: GOLD_POINTER,
    svgPointerClick: GOLD_CLICK,
    hotspot: [3, 3],
    hotspotClick: [16, 16],
  },
  {
    id: 'obsidian-stealth',
    name: 'Obsidian Stealth',
    category: 'Modern',
    description: 'Matte carbon onyx pointer accented with deep violet spine.',
    color: '#8b5cf6',
    badge: 'Stealth',
    svgPointer: OBSIDIAN_POINTER,
    svgPointerClick: OBSIDIAN_CLICK,
    hotspot: [3, 3],
    hotspotClick: [4, 4],
  },
  {
    id: 'crystal-glass',
    name: 'Crystal Glass',
    category: 'Aesthetic',
    description: 'iOS liquid frosted glass pointer with luminous refraction edges.',
    color: '#38bdf8',
    badge: 'Glass',
    svgPointer: GLASS_POINTER,
    svgPointerClick: GLASS_CLICK,
    hotspot: [3, 3],
    hotspotClick: [16, 16],
  },
  {
    id: 'retro-8bit',
    name: '8-Bit Arcade',
    category: 'Gamer',
    description: 'Pixelated nostalgic arcade cursor with high-contrast borders.',
    color: '#ec4899',
    badge: 'Retro',
    svgPointer: RETRO_POINTER,
    svgPointerClick: RETRO_CLICK,
    hotspot: [2, 2],
    hotspotClick: [8, 2],
  },
  {
    id: 'matrix-green',
    name: 'Matrix Phosphor',
    category: 'Cyber',
    description: 'Terminal hacker phosphor-emerald pointer with CRT glow aura.',
    color: '#10b981',
    badge: 'Hacker',
    svgPointer: MATRIX_POINTER,
    svgPointerClick: MATRIX_CLICK,
    hotspot: [3, 3],
    hotspotClick: [16, 16],
  },
  {
    id: 'hyper-crosshair',
    name: 'Tactical Reticle',
    category: 'Gamer',
    description: 'Precision gamer HUD crosshair with center millimeter dot.',
    color: '#ef4444',
    badge: 'Tactical',
    svgPointer: CROSSHAIR_POINTER,
    svgPointerClick: CROSSHAIR_CLICK,
    hotspot: [16, 16],
    hotspotClick: [16, 16],
  },
  {
    id: 'pastel-blossom',
    name: 'Pastel Blossom',
    category: 'Aesthetic',
    description: 'Dreamy soft lavender & sakura pointer with sparkling starlight.',
    color: '#f472b6',
    badge: 'Cute',
    svgPointer: PASTEL_POINTER,
    svgPointerClick: PASTEL_CLICK,
    hotspot: [3, 3],
    hotspotClick: [16, 2],
  },
  {
    id: 'ruby-blaze',
    name: 'Ruby Blaze',
    category: 'Gamer',
    description: 'Incandescent crimson blaze pointer forged with solar flare edges.',
    color: '#ea580c',
    badge: 'Blaze',
    svgPointer: RUBY_POINTER,
    svgPointerClick: RUBY_CLICK,
    hotspot: [3, 3],
    hotspotClick: [8, 4],
  },
];

/**
 * Injects or updates a global style sheet for the selected cursor preset
 */
export function applyCursorStyle(cursorId: string): void {
  if (typeof document === 'undefined') return;

  const styleId = 'godly-custom-cursor-style';
  let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;

  if (cursorId === 'default' || !cursorId) {
    if (styleEl) styleEl.remove();
    document.documentElement.removeAttribute('data-cursor');
    return;
  }

  const preset = CURSOR_PRESETS.find((p) => p.id === cursorId);
  if (!preset || !preset.svgPointer) {
    if (styleEl) styleEl.remove();
    document.documentElement.removeAttribute('data-cursor');
    return;
  }

  document.documentElement.setAttribute('data-cursor', preset.id);

  const defaultUrl = `url('${encodeSvg(preset.svgPointer)}') ${preset.hotspot[0]} ${preset.hotspot[1]}, auto`;
  const clickUrl = `url('${encodeSvg(preset.svgPointerClick || preset.svgPointer)}') ${preset.hotspotClick[0]} ${preset.hotspotClick[1]}, pointer`;

  const css = `
    /* Godly OS Hardware-Accelerated Custom Cursor (${preset.name}) */
    html, body, [data-cursor="${preset.id}"], [data-cursor="${preset.id}"] * {
      cursor: ${defaultUrl} !important;
    }
    
    [data-cursor="${preset.id}"] a,
    [data-cursor="${preset.id}"] button,
    [data-cursor="${preset.id}"] [role="button"],
    [data-cursor="${preset.id}"] .cursor-pointer,
    [data-cursor="${preset.id}"] input[type="button"],
    [data-cursor="${preset.id}"] input[type="submit"],
    [data-cursor="${preset.id}"] select {
      cursor: ${clickUrl} !important;
    }

    [data-cursor="${preset.id}"] input[type="text"],
    [data-cursor="${preset.id}"] input[type="password"],
    [data-cursor="${preset.id}"] input[type="search"],
    [data-cursor="${preset.id}"] input[type="number"],
    [data-cursor="${preset.id}"] textarea,
    [data-cursor="${preset.id}"] [contenteditable="true"] {
      cursor: text !important;
    }

    [data-cursor="${preset.id}"] [class*="cursor-grab"],
    [data-cursor="${preset.id}"] .cursor-grab {
      cursor: grab !important;
    }

    [data-cursor="${preset.id}"] [class*="cursor-grabbing"],
    [data-cursor="${preset.id}"] .cursor-grabbing {
      cursor: grabbing !important;
    }
  `;

  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = css;
}
