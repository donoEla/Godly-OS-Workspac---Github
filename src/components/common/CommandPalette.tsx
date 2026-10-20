import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  LayoutGrid,
  Image as ImageIcon,
  Shield,
  Sliders,
  Music2,
  Minimize2,
  SunMoon,
  ExternalLink,
  Volume2,
  Sparkles,
  Command,
  ArrowRight
} from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { WALLPAPERS, CLOAK_PRESETS } from '../../constants/assets';
import { AppId } from '../../types/os';
import { sound } from '../../utils/sound';

interface PaletteItem {
  id: string;
  group: 'Applications' | 'Wallpapers' | 'Stealth & Cloaking' | 'System' | 'Music';
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  keywords?: string;
  action: () => void;
}

export const CommandPalette: React.FC = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    openApp,
    openWebApp,
    installedApps,
    setWallpaper,
    toggleTheme,
    minimizeAll,
    settings,
    updateSettings,
    togglePlayPauseNowPlaying,
    nextTrackNowPlaying,
    nowPlaying,
    applyCloak,
    openAboutBlankCloak,
    panicCloak,
  } = useOS();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input on open
  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  const items: PaletteItem[] = useMemo(() => {
    const list: PaletteItem[] = [];

    // 1. Applications
    const apps: { id: AppId; name: string; desc: string; icon: string }[] = [
      { id: 'zen', name: 'Zen Browser', desc: 'Vertical tabs, multi-search proxy engine (DuckDuckGo, Brave, Google)', icon: '/assets/icons/zen.jpg' },
      { id: 'app-store', name: 'Godly Store', desc: 'Browse games, proxies & dev utilities', icon: '/assets/icons/app-store.jpg' },
      { id: 'terminal', name: 'Terminal', desc: 'Interactive Godly OS command shell & network tools', icon: '/assets/icons/terminal.jpg' },
      { id: 'notes', name: 'Notes Studio', desc: 'Rich markdown and code notepad', icon: '/assets/icons/notes.jpg' },
      { id: 'spotify', name: 'Spotify Ambient', desc: 'Web audio harmonic synthesizer player', icon: '/assets/icons/spotify.jpg' },
      { id: 'file-manager', name: 'File Manager', desc: 'Local simulated storage filesystem', icon: '/assets/icons/file-manager.jpg' },
      { id: 'games', name: 'Godly Arcade', desc: 'nowgg.fun cloud gaming hub & classic emulators', icon: '/assets/icons/games.jpg' },
      { id: 'calculator', name: 'Calculator Pro', desc: 'Scientific & graph calculator', icon: '/assets/icons/calculator.jpg' },
      { id: 'settings', name: 'Settings', desc: 'Personalization, themes, cloaking & sound', icon: '/assets/icons/settings.jpg' },
    ];

    apps.forEach((app) => {
      list.push({
        id: `app-${app.id}`,
        group: 'Applications',
        title: app.name,
        subtitle: app.desc,
        keywords: `${app.name} ${app.desc} launch open app`,
        icon: (
          <img
            src={app.icon}
            alt=""
            className="w-5 h-5 rounded-md object-cover ring-1 ring-white/10"
          />
        ),
        action: () => {
          openApp(app.id);
          setCommandPaletteOpen(false);
        },
      });
    });

    installedApps
      .filter((inst) => !apps.some((a) => a.id === inst.appId || a.id === inst.id))
      .forEach((inst) => {
        list.push({
          id: `installed-${inst.id}`,
          group: 'Applications',
          title: inst.name,
          subtitle: inst.category || 'Installed Web App',
          keywords: `${inst.name} ${inst.category} installed web app`,
          icon: (
            <img
              src={inst.icon}
              alt=""
              className="w-5 h-5 rounded-md object-cover ring-1 ring-white/10"
            />
          ),
          action: () => {
            if (inst.url) {
              openWebApp(inst.name, inst.url, inst.icon);
            } else if (inst.appId) {
              openApp(inst.appId);
            } else {
              openApp(inst.id as any);
            }
            setCommandPaletteOpen(false);
          },
        });
      });

    // 2. Music Actions
    list.push({
      id: 'music-play-pause',
      group: 'Music',
      title: nowPlaying.isPlaying ? 'Pause Ambient Synth' : 'Play Ambient Synth',
      subtitle: `${nowPlaying.title} • ${nowPlaying.artist}`,
      keywords: 'music audio play pause sound spotify song synth',
      icon: <Music2 size={18} className="text-emerald-400" />,
      action: () => {
        togglePlayPauseNowPlaying();
        setCommandPaletteOpen(false);
      },
    });

    list.push({
      id: 'music-next',
      group: 'Music',
      title: 'Next Ambient Track',
      subtitle: 'Skip to next relaxing soundscape chord',
      keywords: 'music next skip track song',
      icon: <ArrowRight size={18} className="text-emerald-400" />,
      action: () => {
        nextTrackNowPlaying();
        setCommandPaletteOpen(false);
      },
    });

    // 3. Stealth & Cloaking
    CLOAK_PRESETS.forEach((preset) => {
      list.push({
        id: `cloak-${preset.id}`,
        group: 'Stealth & Cloaking',
        title: `Cloak: ${preset.name}`,
        subtitle: `Disguise browser tab as ${preset.title}`,
        keywords: `cloak disguise stealth school hide tab ${preset.name} ${preset.title}`,
        icon: (
          <img
            src={preset.faviconUrl}
            alt=""
            className="w-4 h-4 rounded-sm object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
        ),
        action: () => {
          applyCloak(preset.id);
          setCommandPaletteOpen(false);
        },
      });
    });

    list.push({
      id: 'cloak-panic',
      group: 'Stealth & Cloaking',
      title: 'Emergency Panic Cloak (~ or Double Esc)',
      subtitle: 'Instantly minimize all windows and cloak tab as Google Classroom',
      keywords: 'panic boss hide emergency cloak classroom',
      icon: <Shield size={18} className="text-red-400" />,
      action: () => {
        panicCloak();
        setCommandPaletteOpen(false);
      },
    });

    list.push({
      id: 'cloak-about-blank',
      group: 'Stealth & Cloaking',
      title: 'Open in Unblockable about:blank Pop-up',
      subtitle: 'NautilusOS stealth browser popup wrapper',
      keywords: 'about blank unblock bypass stealth popup',
      icon: <ExternalLink size={18} className="text-sky-400" />,
      action: () => {
        openAboutBlankCloak();
        setCommandPaletteOpen(false);
      },
    });

    list.push({
      id: 'cloak-reset',
      group: 'Stealth & Cloaking',
      title: 'Reset Tab Cloaking to Default Godly OS',
      subtitle: 'Restore native Godly OS tab title and badge',
      keywords: 'reset cloak title uncloak default',
      icon: <Shield size={18} className="text-purple-400" />,
      action: () => {
        applyCloak('default');
        setCommandPaletteOpen(false);
      },
    });

    // 4. System Settings & Toggles
    list.push({
      id: 'sys-theme',
      group: 'System',
      title: `Toggle Theme (Current: ${settings.theme})`,
      subtitle: 'Switch between dark cyber glass and modern light glass',
      keywords: 'theme dark light mode switch color',
      icon: <SunMoon size={18} className="text-amber-400" />,
      action: () => {
        toggleTheme();
        setCommandPaletteOpen(false);
      },
    });

    list.push({
      id: 'sys-minimize-all',
      group: 'System',
      title: 'Minimize All Windows',
      subtitle: 'Show clean desktop wallpaper',
      keywords: 'minimize all hide windows desktop',
      icon: <Minimize2 size={18} className="text-blue-400" />,
      action: () => {
        minimizeAll();
        setCommandPaletteOpen(false);
      },
    });

    list.push({
      id: 'sys-toggle-particles',
      group: 'System',
      title: `${settings.particleBackground ? 'Disable' : 'Enable'} Particle Canvas Mesh`,
      subtitle: 'Achroma interactive particle background grid',
      keywords: 'particle mesh background stars dots effect grid',
      icon: <Sparkles size={18} className="text-fuchsia-400" />,
      action: () => {
        updateSettings({ particleBackground: !settings.particleBackground });
        setCommandPaletteOpen(false);
      },
    });

    list.push({
      id: 'sys-toggle-snapping',
      group: 'System',
      title: `${settings.windowSnapping ? 'Disable' : 'Enable'} Window Snapping`,
      subtitle: 'NautilusOS left / right / top edge window latching',
      keywords: 'window snapping snap edge magnet grid',
      icon: <LayoutGrid size={18} className="text-cyan-400" />,
      action: () => {
        updateSettings({ windowSnapping: !settings.windowSnapping });
        setCommandPaletteOpen(false);
      },
    });

    list.push({
      id: 'sys-toggle-sound',
      group: 'System',
      title: `${settings.soundEnabled ? 'Mute' : 'Enable'} System Sounds`,
      subtitle: 'Harmonic chords and tactile audio feedback',
      keywords: 'sound audio volume mute unmute chimes click',
      icon: <Volume2 size={18} className="text-indigo-400" />,
      action: () => {
        updateSettings({ soundEnabled: !settings.soundEnabled });
        setCommandPaletteOpen(false);
      },
    });

    // 5. Featured Wallpapers
    WALLPAPERS.slice(0, 10).forEach((wp) => {
      list.push({
        id: `wp-${wp.id}`,
        group: 'Wallpapers',
        title: `Wallpaper: ${wp.name}`,
        subtitle: `${wp.category} background`,
        keywords: `wallpaper background image desktop ${wp.name} ${wp.category}`,
        icon: (
          <img
            src={wp.path}
            alt=""
            className="w-5 h-5 rounded object-cover ring-1 ring-white/10"
          />
        ),
        action: () => {
          setWallpaper(wp.path);
          setCommandPaletteOpen(false);
        },
      });
    });

    return list;
  }, [
    openApp,
    setWallpaper,
    toggleTheme,
    minimizeAll,
    settings,
    updateSettings,
    togglePlayPauseNowPlaying,
    nextTrackNowPlaying,
    nowPlaying,
    applyCloak,
    openAboutBlankCloak,
    panicCloak,
    setCommandPaletteOpen,
  ]);

  // Filtered items based on search query
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;

    return items
      .map((item) => {
        let score = 0;
        const titleLower = item.title.toLowerCase();
        if (titleLower.startsWith(q)) score = 100;
        else if (titleLower.includes(q)) score = 70;
        else if (item.keywords?.toLowerCase().includes(q)) score = 40;
        else if (item.subtitle?.toLowerCase().includes(q)) score = 30;
        else if (item.group.toLowerCase().includes(q)) score = 20;

        return { item, score };
      })
      .filter((res) => res.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((res) => res.item);
  }, [items, query]);

  // Keep index within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Auto-scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setCommandPaletteOpen(false);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(filteredItems.length - 1, prev + 1));
      sound.playClick();
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(0, prev - 1));
      sound.playClick();
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const current = filteredItems[selectedIndex];
      if (current) {
        current.action();
      }
    }
  };

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-start justify-center px-4"
          style={{
            paddingTop: '10vh',
          background: 'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
        onClick={() => setCommandPaletteOpen(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -16, filter: 'blur(8px)' }}
          animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.96, y: -12, filter: 'blur(6px)' }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl flex flex-col overflow-hidden"
          style={{
            borderRadius: 20,
            background: 'rgba(7, 7, 12, 0.97)',
            backdropFilter: 'blur(56px) saturate(180%)',
            WebkitBackdropFilter: 'blur(56px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.09)',
            boxShadow: '0 40px 100px rgba(0,0,0,0.90), 0 0 48px rgba(139,92,246,0.18), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          {/* Accent strip at top */}
          <div
            style={{
              height: 1,
              background: 'linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.6) 40%, rgba(99,102,241,0.6) 60%, transparent 100%)',
            }}
          />

          {/* ── Search Bar ── */}
          <div
            className="relative flex items-center px-4 py-3.5"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
          >
            <Search size={18} className="shrink-0 mr-3.5" style={{ color: 'rgba(255,255,255,0.30)' }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search apps, wallpapers, cloaks, commands..."
              className="flex-1 bg-transparent outline-none"
              style={{
                fontSize: 15,
                fontWeight: 500,
                letterSpacing: '-0.01em',
                color: 'rgba(255,255,255,0.88)',
              }}
            />
            <kbd
              className="shrink-0 ml-3 px-2 py-0.5 rounded-lg text-[10px] font-mono"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.09)',
                color: 'rgba(255,255,255,0.30)',
              }}
            >
              ESC
            </kbd>
          </div>

          {/* ── Results List ── */}
          <div
            ref={listRef}
            className="overflow-y-auto p-2"
            style={{ maxHeight: '54vh' }}
          >
            {filteredItems.length === 0 ? (
              <div className="py-16 text-center">
                <Search size={28} className="mx-auto mb-3 opacity-10" />
                <p className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  No results for &ldquo;{query}&rdquo;
                </p>
              </div>
            ) : (
              filteredItems.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const prevItem = filteredItems[idx - 1];
                const showGroupHeader = !prevItem || prevItem.group !== item.group;

                return (
                  <React.Fragment key={item.id}>
                    {showGroupHeader && (
                      <div
                        className="px-3 pt-3.5 pb-1.5 label-section"
                      >
                        {item.group}
                      </div>
                    )}
                    <button
                      type="button"
                      data-selected={isSelected}
                      onClick={() => item.action()}
                      onMouseMove={() => setSelectedIndex(idx)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-100 group"
                      style={{
                        background: isSelected ? 'rgba(139,92,246,0.14)' : 'transparent',
                        border: `1px solid ${isSelected ? 'rgba(139,92,246,0.35)' : 'transparent'}`,
                        boxShadow: isSelected ? '0 0 16px rgba(139,92,246,0.14)' : 'none',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      {/* Icon badge */}
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all"
                        style={{
                          background: isSelected ? 'rgba(139,92,246,0.20)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${isSelected ? 'rgba(139,92,246,0.30)' : 'rgba(255,255,255,0.06)'}`,
                        }}
                      >
                        {item.icon}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-[13px] font-medium tracking-tight truncate"
                          style={{ color: isSelected ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.75)' }}
                        >
                          {item.title}
                        </div>
                        {item.subtitle && (
                          <div
                            className="text-[11px] truncate mt-0.5"
                            style={{ color: 'rgba(255,255,255,0.32)' }}
                          >
                            {item.subtitle}
                          </div>
                        )}
                      </div>

                      {/* Enter badge */}
                      {isSelected && (
                        <kbd
                          className="shrink-0 px-1.5 py-0.5 rounded-lg text-[10px] font-mono"
                          style={{
                            background: 'rgba(139,92,246,0.20)',
                            border: '1px solid rgba(139,92,246,0.30)',
                            color: 'rgba(255,255,255,0.55)',
                          }}
                        >
                          ↵
                        </kbd>
                      )}
                    </button>
                  </React.Fragment>
                );
              })
            )}
          </div>

          {/* ── Footer ── */}
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{
              borderTop: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.015)',
            }}
          >
            <div className="flex items-center gap-3.5 text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.28)' }}>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.07]">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.07]">↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.07]">↵</kbd>
                Execute
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.07]">ESC</kbd>
                Close
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.20)' }}>
              <Command size={11} />
              Godly Cmdk
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
  );
};
