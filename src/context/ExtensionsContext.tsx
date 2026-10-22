import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DesktopExtension, ExtensionsContextType } from '../types/extensions';
import { sound } from '../utils/sound';

export const BUILTIN_EXTENSIONS: DesktopExtension[] = [
  {
    id: 'mac-genie-minimizer',
    name: 'macOS Genie Minimizer',
    author: 'Godly Core',
    version: '1.2.0',
    description: 'Replicates the fluid macOS liquid curved suction animation when minimizing windows into the dock.',
    icon: '✨',
    category: 'Animations',
    enabled: true,
    isBuiltIn: true,
    customCss: `
      .genie-minimizing {
        animation: macGenieWarp 0.45s cubic-bezier(0.2, 0.9, 0.3, 1) forwards !important;
        transform-origin: bottom center !important;
      }
      @keyframes macGenieWarp {
        0% { transform: scale(1) translate3d(0, 0, 0); opacity: 1; filter: blur(0px); }
        45% { transform: scale(0.7, 0.4) translate3d(0, 180px, 0); opacity: 0.9; filter: blur(1px); }
        100% { transform: scale(0.05, 0.05) translate3d(0, 480px, 0); opacity: 0; filter: blur(3px); }
      }
    `,
    tags: ['macOS', 'Fluid', 'Window Motion']
  },
  {
    id: 'bouncy-spring-physics',
    name: 'Bouncy Spring Physics',
    author: 'Motion Lab',
    version: '1.0.4',
    description: 'Injects playful elastic spring damping on window interactions, button clicks, and modal entrances.',
    icon: '🎈',
    category: 'Animations',
    enabled: true,
    isBuiltIn: true,
    customCss: `
      .window-frame-container {
        transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease !important;
      }
      .dock-item, .traffic-light-btn, .action-pill {
        transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
      }
      .dock-item:active, .traffic-light-btn:active {
        transform: scale(0.82) !important;
      }
    `,
    tags: ['Physics', 'Springs', 'Elastic']
  },
  {
    id: 'cyberpunk-rgb-aura',
    name: 'Cyberpunk Chroma RGB Glow',
    author: 'Neo Tokyo',
    version: '2.1.0',
    description: 'Surrounds the currently focused window with a shifting multi-color RGB laser border aura.',
    icon: '🌈',
    category: 'Visuals',
    enabled: true,
    isBuiltIn: true,
    customCss: `
      .window-focused-glow {
        box-shadow: 0 0 25px rgba(168, 85, 247, 0.4), 0 0 50px rgba(59, 130, 246, 0.25), 0 0 0 1.5px rgba(236, 72, 153, 0.5) !important;
        animation: chromaPulse 6s linear infinite alternate !important;
      }
      @keyframes chromaPulse {
        0% { box-shadow: 0 0 30px rgba(168, 85, 247, 0.5), 0 0 0 1.5px rgba(168, 85, 247, 0.7); }
        50% { box-shadow: 0 0 30px rgba(6, 182, 212, 0.5), 0 0 0 1.5px rgba(6, 182, 212, 0.7); }
        100% { box-shadow: 0 0 30px rgba(236, 72, 153, 0.5), 0 0 0 1.5px rgba(236, 72, 153, 0.7); }
      }
    `,
    tags: ['Glow', 'Chroma', 'RGB', 'Cyberpunk']
  },
  {
    id: 'celestial-cursor-trail',
    name: 'Celestial Particle Cursor Trail',
    author: 'Aura Studio',
    version: '1.1.2',
    description: 'Generates sparkling violet stardust particles trailing smoothly behind the mouse pointer.',
    icon: '✨',
    category: 'Visuals',
    enabled: false,
    isBuiltIn: true,
    tags: ['Cursor', 'Particles', 'Stardust']
  },
  {
    id: 'crt-scanline-shimmer',
    name: 'Retro CRT Scanline Shimmer',
    author: 'Vapor Wave Labs',
    version: '1.0.0',
    description: 'Overlays subtle nostalgic arcade CRT monitor scanlines, phosphor bloom, and screen curvature.',
    icon: '📺',
    category: 'Visuals',
    enabled: false,
    isBuiltIn: true,
    customCss: `
      body::after {
        content: " ";
        display: block;
        position: fixed;
        top: 0; left: 0; bottom: 0; right: 0;
        background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03));
        z-index: 99999;
        background-size: 100% 3px, 6px 100%;
        pointer-events: none;
        opacity: 0.85;
      }
    `,
    tags: ['Retro', 'CRT', 'Arcade']
  },
  {
    id: 'tactile-mechanical-audio',
    name: 'Mechanical Click Synthesizer',
    author: 'Tactile Sound',
    version: '1.3.0',
    description: 'Simulates genuine Cherry MX Blue clicky mechanical switch frequencies for all desktop interactions.',
    icon: '🔊',
    category: 'Audio',
    enabled: true,
    isBuiltIn: true,
    tags: ['Audio', 'Mechanical', 'Switch']
  },
  {
    id: 'zen-glance-everywhere',
    name: 'Zen Universal Glance (Peek)',
    author: 'Zen Browser Team',
    version: '1.0.0',
    description: 'Hold Alt key or click preview eye on any file or tab to inspect it in a floating glass Glance peek modal.',
    icon: '👁',
    category: 'Productivity',
    enabled: true,
    isBuiltIn: true,
    tags: ['Zen', 'Arc', 'Glance', 'Peek']
  }
];

const STORAGE_KEY = 'godly_desktop_extensions';

const ExtensionsContext = createContext<ExtensionsContextType | null>(null);

export const ExtensionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [extensions, setExtensions] = useState<DesktopExtension[]>(() => {
    try {
      // 1. Check if extensions are embedded in URL hash e.g. #extensions=...
      if (typeof window !== 'undefined' && window.location.hash.includes('extensions=')) {
        try {
          const hashParam = window.location.hash.split('extensions=')[1];
          const decoded = decodeURIComponent(hashParam);
          const parsed: DesktopExtension[] = JSON.parse(decoded);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log('[Extensions] Loaded shared extensions from URL hash');
            // Merge with builtins
            const merged = [...BUILTIN_EXTENSIONS];
            parsed.forEach((p) => {
              const idx = merged.findIndex((m) => m.id === p.id);
              if (idx >= 0) merged[idx] = { ...merged[idx], ...p };
              else merged.push(p);
            });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            return merged;
          }
        } catch (e) {
          console.warn('[Extensions] Hash parse note:', e);
        }
      }

      // 2. Load from localStorage
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: DesktopExtension[] = JSON.parse(saved);
        // Ensure all built-in extensions exist
        const map = new Map<string, DesktopExtension>();
        BUILTIN_EXTENSIONS.forEach((b) => map.set(b.id, b));
        parsed.forEach((p) => map.set(p.id, p));
        return Array.from(map.values());
      }
      return BUILTIN_EXTENSIONS;
    } catch {
      return BUILTIN_EXTENSIONS;
    }
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(extensions));
    } catch {}
  }, [extensions]);

  // Inject Custom CSS dynamically for all enabled extensions
  useEffect(() => {
    let styleTag = document.getElementById('godly-extensions-styles') as HTMLStyleElement;
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'godly-extensions-styles';
      document.head.appendChild(styleTag);
    }

    const cssContent = extensions
      .filter((e) => e.enabled && e.customCss)
      .map((e) => `/* Extension: ${e.name} */\n${e.customCss}`)
      .join('\n\n');

    styleTag.innerHTML = cssContent;
  }, [extensions]);

  // Particle Cursor Trail Effect (when enabled)
  useEffect(() => {
    const trailExt = extensions.find((e) => e.id === 'celestial-cursor-trail' && e.enabled);
    if (!trailExt) return;

    const particles: HTMLDivElement[] = [];
    const maxParticles = 18;

    const handlePointerMove = (e: PointerEvent) => {
      const p = document.createElement('div');
      p.className = 'pointer-events-none fixed z-[999999] rounded-full';
      p.style.width = '6px';
      p.style.height = '6px';
      p.style.left = `${e.clientX}px`;
      p.style.top = `${e.clientY}px`;
      p.style.background = 'radial-gradient(circle, #c084fc 20%, #7e22ce 80%)';
      p.style.boxShadow = '0 0 8px #a855f7, 0 0 16px #6366f1';
      p.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
      p.style.opacity = '1';
      p.style.transform = 'translate(-50%, -50%) scale(1)';

      document.body.appendChild(p);
      particles.push(p);

      requestAnimationFrame(() => {
        p.style.transform = `translate(-50%, -50%) translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px) scale(0)`;
        p.style.opacity = '0';
      });

      setTimeout(() => {
        p.remove();
        const idx = particles.indexOf(p);
        if (idx >= 0) particles.splice(idx, 1);
      }, 600);

      if (particles.length > maxParticles) {
        const old = particles.shift();
        old?.remove();
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      particles.forEach((p) => p.remove());
    };
  }, [extensions]);

  const toggleExtension = useCallback((id: string) => {
    sound.playClick();
    setExtensions((prev) =>
      prev.map((e) => (e.id === id ? { ...e, enabled: !e.enabled } : e))
    );
  }, []);

  const installExtension = useCallback((ext: DesktopExtension) => {
    sound.playClick();
    setExtensions((prev) => {
      const exists = prev.some((e) => e.id === ext.id);
      if (exists) {
        return prev.map((e) => (e.id === ext.id ? { ...ext, enabled: true } : e));
      }
      return [...prev, { ...ext, enabled: true }];
    });
  }, []);

  const uninstallExtension = useCallback((id: string) => {
    sound.playClick();
    setExtensions((prev) => prev.filter((e) => e.id !== id || e.isBuiltIn));
  }, []);

  const updateExtension = useCallback((id: string, updates: Partial<DesktopExtension>) => {
    setExtensions((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  }, []);

  const exportExtensions = useCallback(() => {
    return JSON.stringify(extensions, null, 2);
  }, [extensions]);

  const importExtensions = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        setExtensions((prev) => {
          const map = new Map<string, DesktopExtension>();
          prev.forEach((e) => map.set(e.id, e));
          parsed.forEach((p: DesktopExtension) => {
            if (p.id && p.name) map.set(p.id, p);
          });
          return Array.from(map.values());
        });
        sound.playOpen();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const getShareableLink = useCallback(() => {
    const encoded = encodeURIComponent(JSON.stringify(extensions));
    const url = new URL(window.location.href);
    url.hash = `extensions=${encoded}`;
    return url.toString();
  }, [extensions]);

  const isExtensionEnabled = useCallback(
    (id: string) => {
      return extensions.some((e) => e.id === id && e.enabled);
    },
    [extensions]
  );

  return (
    <ExtensionsContext.Provider
      value={{
        extensions,
        toggleExtension,
        installExtension,
        uninstallExtension,
        updateExtension,
        exportExtensions,
        importExtensions,
        getShareableLink,
        isExtensionEnabled,
      }}
    >
      {children}
    </ExtensionsContext.Provider>
  );
};

export const useExtensions = (): ExtensionsContextType => {
  const ctx = useContext(ExtensionsContext);
  if (!ctx) throw new Error('useExtensions must be used within an ExtensionsProvider');
  return ctx;
};
