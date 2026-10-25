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
  ArrowRight,
  Gamepad2,
  Globe,
  Radio,
  Download,
  Settings,
  Tv
} from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { WALLPAPERS, CLOAK_PRESETS } from '../../constants/assets';
import { AppId } from '../../types/os';
import { sound } from '../../utils/sound';
import { getAssetUrl } from '../../utils/assetHelper';

export type FilterCategory = 'all' | 'apps' | 'games' | 'system' | 'web';

interface PaletteItem {
  id: string;
  group: 'Applications' | 'Games & Arcade' | 'Web Search' | 'Wallpapers' | 'Stealth & Cloaking' | 'System' | 'Music';
  categoryType: 'apps' | 'games' | 'system' | 'web';
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  keywords?: string;
  action: () => void;
}

interface GameCatalogItem {
  id: string;
  title: string;
  category?: string;
  url: string;
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
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('all');
  const [gamesCatalog, setGamesCatalog] = useState<GameCatalogItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Asynchronously load the 4,000+ games index from local_games.json & gn_math_games.json
  useEffect(() => {
    let mounted = true;
    const fetchGames = async () => {
      try {
        const [resLocal, resGn] = await Promise.all([
          fetch(getAssetUrl('local_games.json')).catch(() => null),
          fetch(getAssetUrl('gn_math_games.json')).catch(() => null),
        ]);

        const localList = resLocal && resLocal.ok ? await resLocal.json() : [];
        const gnList = resGn && resGn.ok ? await resGn.json() : [];

        if (mounted) {
          const combined: GameCatalogItem[] = [
            ...(Array.isArray(localList)
              ? localList.map((g: any) => ({
                  id: 'vault-' + (g.id || g.title),
                  title: g.title,
                  category: g.category || 'Game Vault',
                  url: g.url,
                }))
              : []),
            ...(Array.isArray(gnList)
              ? gnList.map((g: any) => ({
                  id: 'gn-' + (g.id || g.title),
                  title: g.title,
                  category: 'GN-Math Game',
                  url: g.url,
                }))
              : []),
          ];
          setGamesCatalog(combined);
        }
      } catch (err) {
        console.warn('[CommandPalette] Game catalog indexing error:', err);
      }
    };

    fetchGames();
    return () => {
      mounted = false;
    };
  }, []);

  // Focus input on open
  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setSelectedFilter('all');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  const baseItems: PaletteItem[] = useMemo(() => {
    const list: PaletteItem[] = [];

    // 1. Applications
    const apps: { id: AppId; name: string; desc: string; icon: string }[] = [
      { id: 'zen', name: 'Godly Browser', desc: 'Vertical tabs, multi-search proxy engine (DuckDuckGo, Brave, Google)', icon: getAssetUrl('assets/icons/zen.jpg') },
      { id: 'games', name: 'Godly Arcade', desc: '4,000+ titles across Vault, GN-Math, Zen GS & P2P', icon: getAssetUrl('assets/icons/games.jpg') },
      { id: 'eaglercraft', name: 'Eaglercraft Studio', desc: '12 playable Eaglercraft & Minecraft web editions (1.8.8, 1.12.2, Beta, Alpha, Resent PvP)', icon: getAssetUrl('assets/icons/eaglercraft.jpg') },
      { id: 'emulator', name: 'Web Emulator Hub', desc: 'Lightweight RetroArch WASM core for GBA, NES, SNES, GB, GBC & Genesis', icon: getAssetUrl('assets/icons/emulator.png') },
      { id: 'multiplayer', name: 'P2P Multiplayer Arena', desc: 'Serverless WebRTC direct room multiplayer, chat & screen streaming', icon: getAssetUrl('assets/icons/multiplayer.jpg') },
      { id: 'terminal', name: 'Terminal', desc: 'Interactive Godly OS command shell & network tools', icon: getAssetUrl('assets/icons/terminal.jpg') },
      { id: 'virtual-machine', name: 'Virtual Machine', desc: 'In-browser x86 Linux VM & CheerpX WebAssembly sandbox', icon: getAssetUrl('assets/icons/vm.png') },
      { id: 'widgets', name: 'Widgets Studio', desc: 'Add, remove, configure, and customize desktop widgets & layouts', icon: getAssetUrl('assets/icons/widgets.jpeg') },
      { id: 'app-store', name: 'Godly Store', desc: 'Browse games, proxies & dev utilities', icon: getAssetUrl('assets/icons/app-store.jpg') },
      { id: 'extensions', name: 'Desktop Extensions Hub', desc: 'Genie minimize, physics, particle trails & custom mods', icon: getAssetUrl('assets/icons/extensions.jpg') },
      { id: 'theme-studio', name: 'Theme Studio & Custom Cursors', desc: 'System-wide visual themes, Frosted Glass, hardware cursors & accents', icon: getAssetUrl('assets/icons/themes.png') },
      { id: 'voice-memos', name: 'Voice Memos Studio', desc: 'Voice recording, audio waveforms & studio memos', icon: getAssetUrl('assets/icons/voice-memos.jpg') },
      { id: 'notes', name: 'Notes Studio', desc: 'Rich markdown and code notepad', icon: getAssetUrl('assets/icons/notes.jpg') },
      { id: 'spotify', name: 'Spotify Ambient', desc: 'Web audio harmonic synthesizer player', icon: getAssetUrl('assets/icons/spotify.jpg') },
      { id: 'file-manager', name: 'File Manager', desc: 'Local simulated storage filesystem', icon: getAssetUrl('assets/icons/file-manager.jpg') },
      { id: 'calculator', name: 'Calculator Pro', desc: 'Scientific & graph calculator', icon: getAssetUrl('assets/icons/calculator.jpg') },
      { id: 'settings', name: 'Settings', desc: 'Personalization, cloud sync, themes, cloaking & sound', icon: getAssetUrl('assets/icons/settings.jpg') },
    ];

    apps.forEach((app) => {
      list.push({
        id: `app-${app.id}`,
        group: 'Applications',
        categoryType: 'apps',
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
          categoryType: 'apps',
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
      categoryType: 'system',
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
      categoryType: 'system',
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
        categoryType: 'system',
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
      categoryType: 'system',
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
      categoryType: 'system',
      title: 'Open in Unblockable about:blank Pop-up',
      subtitle: 'NautilusOS stealth browser popup wrapper',
      keywords: 'about blank unblock bypass stealth popup',
      icon: <ExternalLink size={18} className="text-sky-400" />,
      action: () => {
        openAboutBlankCloak();
        setCommandPaletteOpen(false);
      },
    });

    // 4. System Settings & Toggles
    list.push({
      id: 'sys-theme',
      group: 'System',
      categoryType: 'system',
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
      categoryType: 'system',
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
      id: 'sys-toggle-snapping',
      group: 'System',
      categoryType: 'system',
      title: `${settings.windowSnapping ? 'Disable' : 'Enable'} FancyZones Window Snapping`,
      subtitle: 'Magnetic 50/50, 70/30, 3-column & quad tiling presets',
      keywords: 'fancyzones window snapping snap edge magnet grid tiling layout',
      icon: <LayoutGrid size={18} className="text-cyan-400" />,
      action: () => {
        updateSettings({ windowSnapping: !settings.windowSnapping });
        setCommandPaletteOpen(false);
      },
    });

    list.push({
      id: 'sys-toggle-sound',
      group: 'System',
      categoryType: 'system',
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
    WALLPAPERS.slice(0, 8).forEach((wp) => {
      list.push({
        id: `wp-${wp.id}`,
        group: 'Wallpapers',
        categoryType: 'system',
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
    setCommandPaletteOpen,
  ]);

  // Combined Search & Filtering Engine
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result: PaletteItem[] = [];

    // Filter base items
    const baseMatches = baseItems
      .filter((item) => {
        if (selectedFilter !== 'all' && item.categoryType !== selectedFilter) return false;
        if (!q) return true;
        const titleMatch = item.title.toLowerCase().includes(q);
        const subMatch = item.subtitle?.toLowerCase().includes(q);
        const keyMatch = item.keywords?.toLowerCase().includes(q);
        return titleMatch || subMatch || keyMatch;
      });

    result.push(...baseMatches);

    // Search 4,000+ Games catalog if searching or if 'games' filter selected
    if ((q.length >= 2 || selectedFilter === 'games') && (selectedFilter === 'all' || selectedFilter === 'games')) {
      const matchingGames = gamesCatalog
        .filter((g) => {
          if (!q) return true;
          return g.title.toLowerCase().includes(q) || (g.category && g.category.toLowerCase().includes(q));
        })
        .slice(0, 30); // Limit to top 30 games for instant 120 FPS rendering

      matchingGames.forEach((g) => {
        result.push({
          id: `game-${g.id}`,
          group: 'Games & Arcade',
          categoryType: 'games',
          title: g.title,
          subtitle: `${g.category || 'Arcade Game'} • Click to launch instantly`,
          keywords: `${g.title} game play arcade vault`,
          icon: <Gamepad2 size={18} className="text-purple-400" />,
          action: () => {
            sound.playClick();
            openWebApp(g.title, g.url, getAssetUrl('assets/icons/games.jpg'));
            setCommandPaletteOpen(false);
          },
        });
      });
    }

    // Web Search Engine Fallbacks (DuckDuckGo, Google, Brave)
    if (q.length > 0 && (selectedFilter === 'all' || selectedFilter === 'web')) {
      result.push({
        id: 'web-duckduckgo',
        group: 'Web Search',
        categoryType: 'web',
        title: `DuckDuckGo: "${query.trim()}"`,
        subtitle: 'Search the private web in Godly Browser',
        keywords: 'duckduckgo web search query',
        icon: <Globe size={18} className="text-orange-400" />,
        action: () => {
          sound.playClick();
          openWebApp('DuckDuckGo', `https://duckduckgo.com/?q=${encodeURIComponent(query.trim())}`, getAssetUrl('assets/icons/zen.jpg'));
          setCommandPaletteOpen(false);
        },
      });

      result.push({
        id: 'web-google',
        group: 'Web Search',
        categoryType: 'web',
        title: `Google: "${query.trim()}"`,
        subtitle: 'Search Google in Godly Browser',
        keywords: 'google web search query',
        icon: <Search size={18} className="text-blue-400" />,
        action: () => {
          sound.playClick();
          openWebApp('Google', `https://www.google.com/search?q=${encodeURIComponent(query.trim())}`, getAssetUrl('assets/icons/zen.jpg'));
          setCommandPaletteOpen(false);
        },
      });

      result.push({
        id: 'web-brave',
        group: 'Web Search',
        categoryType: 'web',
        title: `Brave Search: "${query.trim()}"`,
        subtitle: 'Search independent Brave web index',
        keywords: 'brave search web query',
        icon: <Shield size={18} className="text-rose-400" />,
        action: () => {
          sound.playClick();
          openWebApp('Brave', `https://search.brave.com/search?q=${encodeURIComponent(query.trim())}`, getAssetUrl('assets/icons/zen.jpg'));
          setCommandPaletteOpen(false);
        },
      });
    }

    // Sort items by relevance to query
    if (q) {
      return result.sort((a, b) => {
        const aTitleLower = a.title.toLowerCase();
        const bTitleLower = b.title.toLowerCase();
        const aStarts = aTitleLower.startsWith(q) ? 1 : 0;
        const bStarts = bTitleLower.startsWith(q) ? 1 : 0;
        if (aStarts !== bStarts) return bStarts - aStarts;

        const aExact = aTitleLower === q ? 1 : 0;
        const bExact = bTitleLower === q ? 1 : 0;
        if (aExact !== bExact) return bExact - aExact;

        return 0;
      });
    }

    return result;
  }, [baseItems, gamesCatalog, query, selectedFilter, openWebApp, setCommandPaletteOpen]);

  // Keep selected index within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, selectedFilter]);

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
            paddingTop: '9vh',
            background: 'rgba(0,0,0,0.76)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
          onClick={() => setCommandPaletteOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, y: -16, filter: 'blur(8px)' }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl flex flex-col overflow-hidden"
            style={{
              borderRadius: 22,
              background: 'rgba(9, 10, 18, 0.96)',
              backdropFilter: 'blur(56px) saturate(190%)',
              WebkitBackdropFilter: 'blur(56px) saturate(190%)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 40px 100px rgba(0,0,0,0.95), 0 0 50px rgba(168,85,247,0.22), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            {/* Ambient accent strip at top */}
            <div
              style={{
                height: 2,
                background: 'linear-gradient(90deg, transparent 0%, rgba(168,85,247,0.8) 35%, rgba(6,182,212,0.8) 65%, transparent 100%)',
              }}
            />

            {/* ── Search Bar ── */}
            <div
              className="relative flex items-center px-4 py-3.5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Search size={19} className="shrink-0 mr-3.5 text-purple-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search across 4,000+ games, apps, settings, and the web..."
                className="flex-1 bg-transparent outline-none"
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  letterSpacing: '-0.01em',
                  color: 'rgba(255,255,255,0.92)',
                }}
              />
              <kbd
                className="shrink-0 ml-3 px-2 py-0.5 rounded-lg text-[10px] font-mono"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.4)',
                }}
              >
                ESC
              </kbd>
            </div>

            {/* ── Filter Pills / Categories Bar ── */}
            <div className="flex items-center gap-1.5 px-4 py-2 border-b border-white/[0.06] bg-black/25 overflow-x-auto select-none">
              {[
                { id: 'all', label: 'All', icon: Sparkles },
                { id: 'apps', label: 'Apps', icon: LayoutGrid },
                { id: 'games', label: `Games (${gamesCatalog.length > 0 ? gamesCatalog.length : '4,000+'})`, icon: Gamepad2 },
                { id: 'system', label: 'Settings & Cloaks', icon: Settings },
                { id: 'web', label: 'Web Search', icon: Globe },
              ].map((pill) => {
                const Icon = pill.icon;
                const isCur = selectedFilter === pill.id;
                return (
                  <button
                    key={pill.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedFilter(pill.id as FilterCategory);
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      isCur
                        ? 'bg-purple-600 text-white shadow-sm border border-purple-400/30'
                        : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    <Icon size={12} />
                    <span>{pill.label}</span>
                  </button>
                );
              })}
            </div>

            {/* ── Results List ── */}
            <div
              ref={listRef}
              className="overflow-y-auto p-2"
              style={{ maxHeight: '52vh' }}
            >
              {filteredItems.length === 0 ? (
                <div className="py-16 text-center">
                  <Search size={30} className="mx-auto mb-3 opacity-15 text-purple-400" />
                  <p className="text-[13px] font-medium text-slate-400">
                    No results for &ldquo;{query}&rdquo;
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Try searching for game titles like &ldquo;Zelda&rdquo;, &ldquo;Mario&rdquo;, or &ldquo;RetroArch&rdquo;
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
                        <div className="px-3 pt-3.5 pb-1.5 label-section font-semibold text-[11px] text-purple-300/80 tracking-wider uppercase font-mono">
                          {item.group}
                        </div>
                      )}
                      <button
                        type="button"
                        data-selected={isSelected}
                        onClick={() => item.action()}
                        onMouseMove={() => setSelectedIndex(idx)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all duration-100 group"
                        style={{
                          background: isSelected ? 'rgba(168,85,247,0.18)' : 'transparent',
                          border: `1px solid ${isSelected ? 'rgba(168,85,247,0.4)' : 'transparent'}`,
                          boxShadow: isSelected ? '0 0 18px rgba(168,85,247,0.18)' : 'none',
                        }}
                      >
                        {/* Icon badge */}
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all"
                          style={{
                            background: isSelected ? 'rgba(168,85,247,0.25)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${isSelected ? 'rgba(168,85,247,0.35)' : 'rgba(255,255,255,0.08)'}`,
                          }}
                        >
                          {item.icon}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <div
                            className="text-[13px] font-medium tracking-tight truncate"
                            style={{ color: isSelected ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.8)' }}
                          >
                            {item.title}
                          </div>
                          {item.subtitle && (
                            <div
                              className="text-[11px] truncate mt-0.5"
                              style={{ color: isSelected ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.38)' }}
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
                              background: 'rgba(168,85,247,0.25)',
                              border: '1px solid rgba(168,85,247,0.4)',
                              color: 'rgba(255,255,255,0.7)',
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
                borderTop: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <div className="flex items-center gap-3.5 text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/[0.07]">↑</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/[0.07]">↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/[0.07]">↵</kbd>
                  Launch
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/[0.07]">ESC</kbd>
                  Close
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-purple-300">
                <Command size={11} />
                Ctrl + K / Cmd + Space
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
