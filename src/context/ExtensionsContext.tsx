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
        animation: macGenieWarp 0.42s cubic-bezier(0.2, 0.9, 0.3, 1) forwards !important;
        transform-origin: bottom center !important;
        pointer-events: none !important;
      }
      @keyframes macGenieWarp {
        0% { opacity: 1; filter: blur(0px); }
        45% { opacity: 0.85; filter: blur(1px); }
        100% { opacity: 0; filter: blur(3px); transform: translateY(380px) scale(0.08, 0.04) !important; }
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
      .window-frame-container:not(.is-interacting) {
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
      // Security (F03): Never auto-install or auto-execute extensions from URL fragment/hash
      if (typeof window !== 'undefined' && window.location.hash.includes('extensions=')) {
        try {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        } catch {}
      }

      // Load from localStorage
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: DesktopExtension[] = JSON.parse(saved);
        // Ensure all built-in extensions exist
        const map = new Map<string, DesktopExtension>();
        BUILTIN_EXTENSIONS.forEach((b) => map.set(b.id, b));
        parsed.forEach((p) => {
          if (p && p.id && p.name) map.set(p.id, p);
        });
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

    styleTag.textContent = cssContent;
  }, [extensions]);

  // Execute Custom JS dynamically for all enabled extensions safely
  useEffect(() => {
    const activeWithJs = extensions.filter((e) => e.enabled && e.customJs && e.customJs.trim());
    const cleanups: Array<() => void> = [];

    activeWithJs.forEach((ext) => {
      try {
        const runner = new Function('extension', 'window', 'document', `
          try {
            ${ext.customJs}
          } catch (err) {
            console.error('[Extension Runtime Error: ${ext.name}]', err);
          }
        `);
        const cleanup = runner(ext, window, document);
        if (typeof cleanup === 'function') {
          cleanups.push(cleanup);
        }
      } catch (err) {
        console.error('[Extension Compile Error: ' + ext.name + ']', err);
      }
    });

    return () => {
      cleanups.forEach((c) => {
        try {
          c();
        } catch {}
      });
    };
  }, [extensions]);

  // Particle Cursor Trail Effect (when enabled)
  useEffect(() => {
    const isTrailEnabled = extensions.some((e) => e.id === 'celestial-cursor-trail' && e.enabled);
    if (!isTrailEnabled) return;

    const particles: HTMLDivElement[] = [];
    const maxParticles = 24;

    const handlePointerMove = (e: MouseEvent) => {
      const p = document.createElement('div');
      p.className = 'pointer-events-none fixed rounded-full';
      p.style.zIndex = '9999999';
      p.style.width = '7px';
      p.style.height = '7px';
      p.style.left = `${e.clientX}px`;
      p.style.top = `${e.clientY}px`;
      p.style.background = 'radial-gradient(circle, #f472b6 0%, #c084fc 40%, #8b5cf6 100%)';
      p.style.boxShadow = '0 0 10px #ec4899, 0 0 20px #a855f7';
      p.style.transition = 'transform 0.55s ease-out, opacity 0.55s ease-out';
      p.style.opacity = '1';
      p.style.transform = 'translate(-50%, -50%) scale(1)';

      document.body.appendChild(p);
      particles.push(p);

      requestAnimationFrame(() => {
        p.style.transform = `translate(-50%, -50%) translate(${(Math.random() - 0.5) * 22}px, ${(Math.random() - 0.5) * 22}px) scale(0)`;
        p.style.opacity = '0';
      });

      setTimeout(() => {
        p.remove();
        const idx = particles.indexOf(p);
        if (idx >= 0) particles.splice(idx, 1);
      }, 550);

      if (particles.length > maxParticles) {
        const old = particles.shift();
        old?.remove();
      }
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      particles.forEach((p) => p.remove());
    };
  }, [extensions]);

  // Zen Universal Glance (Peek) Effect (when enabled)
  useEffect(() => {
    const isGlanceEnabled = extensions.some((e) => e.id === 'zen-glance-everywhere' && e.enabled);
    if (!isGlanceEnabled) return;

    let glanceCard: HTMLDivElement | null = null;
    let isAltDown = false;

    const createGlanceCard = (text: string, icon: string, x: number, y: number) => {
      if (glanceCard) glanceCard.remove();
      glanceCard = document.createElement('div');
      glanceCard.id = 'zen-glance-peek-modal';
      glanceCard.className = 'fixed z-[9999999] pointer-events-none transition-all duration-200 select-none';
      glanceCard.style.left = `${Math.min(x + 18, window.innerWidth - 280)}px`;
      glanceCard.style.top = `${Math.min(y + 18, window.innerHeight - 100)}px`;

      const cardBox = document.createElement('div');
      cardBox.style.cssText = 'background: rgba(15, 15, 26, 0.88); backdrop-filter: blur(28px) saturate(190%); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 14px; padding: 10px 14px; box-shadow: 0 16px 40px rgba(0,0,0,0.6), 0 0 20px rgba(168, 85, 247, 0.2); display: flex; align-items: center; gap: 10px; color: #fff; font-family: sans-serif; font-size: 12px; min-width: 180px; max-width: 260px;';

      const iconElem = document.createElement('div');
      iconElem.style.cssText = 'font-size: 18px; line-height: 1; flex-shrink: 0;';
      iconElem.textContent = icon;

      const textWrapper = document.createElement('div');
      textWrapper.style.overflow = 'hidden';

      const titleElem = document.createElement('div');
      titleElem.style.cssText = 'font-weight: 600; color: #f1f5f9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;';
      titleElem.textContent = text;

      const subElem = document.createElement('div');
      subElem.style.cssText = 'font-size: 10px; color: #a855f7; margin-top: 2px; font-family: monospace;';
      subElem.textContent = 'Zen Glance Peek ⚡';

      textWrapper.appendChild(titleElem);
      textWrapper.appendChild(subElem);
      cardBox.appendChild(iconElem);
      cardBox.appendChild(textWrapper);
      glanceCard.appendChild(cardBox);

      document.body.appendChild(glanceCard);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        isAltDown = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        isAltDown = false;
        if (glanceCard) {
          glanceCard.remove();
          glanceCard = null;
        }
      }
    };

    const handlePointerOver = (e: MouseEvent) => {
      if (!isAltDown) return;
      const target = (e.target as HTMLElement)?.closest('button, a, .dock-item, .window-tab-btn, [data-window-id], [title]') as HTMLElement;
      if (target) {
        const title = target.getAttribute('title') || target.innerText?.trim() || target.getAttribute('aria-label') || 'Interactive Element';
        createGlanceCard(title.slice(0, 40), '👁️', e.clientX, e.clientY);
      }
    };

    const handlePointerOut = () => {
      if (glanceCard) {
        glanceCard.remove();
        glanceCard = null;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mouseover', handlePointerOver);
    window.addEventListener('mouseout', handlePointerOut);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mouseover', handlePointerOver);
      window.removeEventListener('mouseout', handlePointerOut);
      if (glanceCard) glanceCard.remove();
    };
  }, [extensions]);


  const toggleExtension = useCallback((id: string) => {
    sound.playClick();
    setExtensions((prev) =>
      prev.map((e) => (e.id === id ? { ...e, enabled: !e.enabled } : e))
    );
  }, []);

  const sanitizeExtension = useCallback((ext: any): DesktopExtension | null => {
    if (!ext || typeof ext !== 'object') return null;
    const rawId = String(ext.id || '').trim();
    const rawName = String(ext.name || '').trim();
    if (!rawId || !rawName || !/^[a-zA-Z0-9_\-]{1,64}$/.test(rawId)) {
      return null;
    }
    const isBuiltIn = BUILTIN_EXTENSIONS.some((b) => b.id === rawId);
    return {
      id: rawId,
      name: rawName.slice(0, 100),
      author: String(ext.author || 'Custom Author').slice(0, 100),
      version: String(ext.version || '1.0.0').slice(0, 30),
      description: String(ext.description || '').slice(0, 500),
      icon: String(ext.icon || '✨').slice(0, 10),
      category: ['Animations', 'Visuals', 'Productivity', 'Audio', 'Custom'].includes(ext.category)
        ? ext.category
        : 'Custom',
      enabled: false, // Security (F02): Always default imported extensions to disabled!
      isBuiltIn: isBuiltIn,
      customCss: typeof ext.customCss === 'string' ? ext.customCss.slice(0, 50000) : undefined,
      customJs: typeof ext.customJs === 'string' ? ext.customJs.slice(0, 50000) : undefined,
      tags: Array.isArray(ext.tags) ? ext.tags.map((t: any) => String(t).slice(0, 30)) : [],
    };
  }, []);

  const installExtension = useCallback((ext: DesktopExtension) => {
    const sanitized = sanitizeExtension(ext);
    if (!sanitized) return;
    sound.playClick();
    setExtensions((prev) => {
      const idx = prev.findIndex((e) => e.id === sanitized.id);
      if (idx >= 0) {
        // Keep existing user preference if already installed
        const existing = prev[idx];
        const updated = [...prev];
        updated[idx] = { ...sanitized, enabled: existing.enabled };
        return updated;
      }
      return [...prev, sanitized];
    });
  }, [sanitizeExtension]);

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
          parsed.forEach((p: any) => {
            const sanitized = sanitizeExtension(p);
            if (sanitized) {
              const existing = map.get(sanitized.id);
              map.set(sanitized.id, {
                ...sanitized,
                enabled: existing ? existing.enabled : false, // Defaults to disabled
              });
            }
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
  }, [sanitizeExtension]);

  const getShareableLink = useCallback(() => {
    return JSON.stringify(extensions, null, 2);
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
