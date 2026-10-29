import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Cloud,
  Gamepad2,
  Search,
  ExternalLink,
  RotateCcw,
  Maximize2,
  Minimize2,
  Play,
  Shield,
  Zap,
  Sparkles,
  Flame,
  Globe,
  SlidersHorizontal,
  ChevronRight,
  Info,
  X,
  Radio,
  Tv,
  Monitor,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { getAssetUrl } from '../../utils/assetHelper';
import { ServiceWorkerAppView } from '../common/ServiceWorkerAppView';

export interface StratusCloudGame {
  name: string;
  game_key: string;
  description: string;
  image: string;
  cover: string;
  tags: string[];
}

export interface QuickCloudGame {
  title: string;
  category: string;
  thumbnail: string;
  cloudmoonUrl: string;
  nowggUrl?: string;
  desc: string;
}

// Unblocked CloudMoon InPlay worker & direct fallbacks
export const CLOUDMOON_UNBLOCKER_URL = 'https://google-classroom.sriail.workers.dev/';
export const CLOUDMOON_DIRECT_URL = 'https://web.cloudmoonapp.com/';

const FEATURED_CLOUD_GAMES: QuickCloudGame[] = [
  {
    title: 'Roblox',
    category: 'Sandbox MMO',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop',
    cloudmoonUrl: CLOUDMOON_UNBLOCKER_URL,
    nowggUrl: 'https://nowgg.nl/play/roblox-corporation/5349/roblox',
    desc: 'Infinite worlds, multiplayer obbies, roleplay and battlegrounds in 60 FPS cloud.'
  },
  {
    title: 'Free Fire MAX',
    category: 'Battle Royale',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop',
    cloudmoonUrl: CLOUDMOON_UNBLOCKER_URL,
    nowggUrl: 'https://nowgg.nl/play/garena-international-i-private-limited/8172/free-fire-max',
    desc: '50-player battle royale with high-octane gunplay and ultra graphics.'
  },
  {
    title: 'Brawl Stars',
    category: 'Multiplayer Action',
    thumbnail: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=500&auto=format&fit=crop',
    cloudmoonUrl: CLOUDMOON_UNBLOCKER_URL,
    nowggUrl: 'https://nowgg.nl/play/supercell/8505/brawl-stars',
    desc: 'Fast-paced 3v3 multiplayer and battle royale combat.'
  },
  {
    title: 'Subway Surfers',
    category: 'Arcade Runner',
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&auto=format&fit=crop',
    cloudmoonUrl: CLOUDMOON_UNBLOCKER_URL,
    nowggUrl: 'https://nowgg.nl/play/sybo-games/5691/subway-surfers',
    desc: 'Dash as fast as you can through subway train tracks.'
  },
  {
    title: 'Call of Duty: Mobile',
    category: 'Tactical FPS',
    thumbnail: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500&auto=format&fit=crop',
    cloudmoonUrl: CLOUDMOON_UNBLOCKER_URL,
    nowggUrl: 'https://nowgg.nl/play/activision-publishing-inc/2358/call-of-duty-mobile',
    desc: 'Iconic multiplayer maps and modes with low input latency.'
  },
  {
    title: 'Genshin Impact',
    category: 'Open World RPG',
    thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop',
    cloudmoonUrl: CLOUDMOON_UNBLOCKER_URL,
    desc: 'Step into Teyvat, a vast world teeming with elemental energy.'
  }
];

export const CloudGamingApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'runner' | 'stratus' | 'featured'>('runner');
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [stratusGames, setStratusGames] = useState<StratusCloudGame[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Active Runner State
  const [activeRunningUrl, setActiveRunningUrl] = useState<string>(CLOUDMOON_UNBLOCKER_URL);
  const [activeRunningTitle, setActiveRunningTitle] = useState<string>('CloudMoon InPlay');
  const [streamEngine, setStreamEngine] = useState<'unblocker' | 'direct' | 'proxy'>('unblocker');
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [gamepadConnected, setGamepadConnected] = useState<string | null>(null);
  const [selectedGameForModal, setSelectedGameForModal] = useState<StratusCloudGame | null>(null);

  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Gamepad API Detection
  useEffect(() => {
    const handleGamepadConnect = (e: GamepadEvent) => {
      setGamepadConnected(e.gamepad.id);
      sound.playSuccess();
    };
    const handleGamepadDisconnect = () => {
      setGamepadConnected(null);
    };

    window.addEventListener('gamepadconnected', handleGamepadConnect);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnect);

    // Initial check
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const pad of pads) {
      if (pad) {
        setGamepadConnected(pad.id);
        break;
      }
    }

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnect);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnect);
    };
  }, []);

  // Load Stratus 225 games catalog
  useEffect(() => {
    let isMounted = true;
    const loadStratus = async () => {
      try {
        const url = getAssetUrl('stratus_cloud_games.json');
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setStratusGames(data);
          }
        }
      } catch (err) {
        console.warn('Failed to load stratus_cloud_games.json:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadStratus();
    return () => {
      isMounted = false;
    };
  }, []);

  const launchRunner = (url: string, title: string) => {
    sound.playClick();
    setActiveRunningUrl(url);
    setActiveRunningTitle(title);
    setActiveTab('runner');
    setRefreshKey((k) => k + 1);
  };

  const handleToggleFullscreen = () => {
    sound.playClick();
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const filteredStratusGames = useMemo(() => {
    return stratusGames.filter((g) => {
      const matchesSearch =
        !search.trim() ||
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.description?.toLowerCase().includes(search.toLowerCase()) ||
        g.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

      if (!matchesSearch) return false;
      if (selectedTag === 'All') return true;
      return g.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase());
    });
  }, [stratusGames, search, selectedTag]);

  // Compute active iframe source based on engine
  const resolvedFrameUrl = useMemo(() => {
    if (streamEngine === 'unblocker') {
      // If runner URL is standard CloudMoon, route through the verified Cloudflare Worker unblocker
      if (activeRunningUrl.includes('cloudmoonapp.com')) {
        return CLOUDMOON_UNBLOCKER_URL;
      }
      return activeRunningUrl;
    }
    if (streamEngine === 'direct') {
      return activeRunningUrl;
    }
    return activeRunningUrl;
  }, [activeRunningUrl, streamEngine]);

  return (
    <div className="w-full h-full flex flex-col bg-[#070914] text-white select-none overflow-hidden font-sans">
      {/* Top Application Bar */}
      <div className="h-14 px-4 bg-[#0a0d1d] border-b border-white/10 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-950/40 flex items-center justify-center">
            <div className="w-full h-full rounded-[14px] bg-[#0c1022] flex items-center justify-center">
              <Gamepad2 size={18} className="text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black text-white tracking-tight">
                Cloud Gaming
              </h1>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                WebRTC &bull; 60 FPS
              </span>
            </div>
            <p className="text-[10px] text-white/50 hidden sm:block">
              CloudMoon InPlay &bull; Stratus 225 AAA &bull; Zero Install
            </p>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-2xl border border-white/10">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('runner');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'runner'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/50'
                : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Tv size={13} />
            <span>Active Stream</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('stratus');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'stratus'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/50'
                : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Flame size={13} className="text-amber-400" />
            <span>Stratus 225 AAA</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('featured');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'featured'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/50'
                : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Sparkles size={13} className="text-yellow-400" />
            <span>Arcade Hub</span>
          </button>
        </div>

        {/* Action Controls & Gamepad Status */}
        <div className="flex items-center gap-2">
          {gamepadConnected ? (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono text-emerald-300">
              <CheckCircle2 size={12} />
              <span className="truncate max-w-[120px]">Gamepad: {gamepadConnected}</span>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-[10px] font-mono text-white/40">
              <Gamepad2 size={12} />
              <span>Gamepad Ready</span>
            </div>
          )}

          <button
            onClick={() => {
              sound.playClick();
              setRefreshKey((k) => k + 1);
            }}
            title="Reload Active Stream"
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-white/70 hover:text-white transition-all"
          >
            <RotateCcw size={14} />
          </button>

          <button
            onClick={handleToggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-white/70 hover:text-white transition-all"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div
        className="flex-1 w-full h-full relative overflow-hidden flex flex-col"
        ref={playerContainerRef}
      >
        {/* VIEW 1: ACTIVE CLOUD STREAM RUNNER */}
        {activeTab === 'runner' && (
          <div className="flex-1 w-full h-full relative bg-black flex flex-col overflow-hidden">
            {/* Runner Control & Quick-switch Toolbar */}
            <div className="px-4 py-2 bg-[#080b18] border-b border-white/[0.08] flex items-center justify-between gap-3 shrink-0 flex-wrap">
              <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar">
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
                  <Flame size={12} className="text-amber-400" /> Instant Launch:
                </span>
                {FEATURED_CLOUD_GAMES.map((fg) => (
                  <button
                    key={fg.title}
                    onClick={() => {
                      if (fg.nowggUrl) {
                        launchRunner(fg.nowggUrl, `${fg.title} (Cloud Runner)`);
                      } else {
                        launchRunner(CLOUDMOON_UNBLOCKER_URL, `${fg.title} (CloudMoon)`);
                      }
                    }}
                    className="px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 hover:border-cyan-500/40 text-[11px] font-semibold whitespace-nowrap flex items-center gap-1 transition-all text-white/80 hover:text-white"
                  >
                    <span>{fg.title}</span>
                  </button>
                ))}
              </div>

              {/* Stream Engine Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-white/40 hidden sm:inline">Engine:</span>
                <button
                  onClick={() => {
                    sound.playClick();
                    setStreamEngine('unblocker');
                    setRefreshKey((k) => k + 1);
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-semibold transition-all border ${
                    streamEngine === 'unblocker'
                      ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300'
                      : 'bg-white/[0.03] border-white/10 text-white/50'
                  }`}
                >
                  CloudMoon InPlay
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    setStreamEngine('direct');
                    setRefreshKey((k) => k + 1);
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-semibold transition-all border ${
                    streamEngine === 'direct'
                      ? 'bg-purple-500/25 border-purple-400 text-purple-300'
                      : 'bg-white/[0.03] border-white/10 text-white/50'
                  }`}
                >
                  Direct WebRTC
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    setStreamEngine('proxy');
                    setRefreshKey((k) => k + 1);
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-semibold transition-all border ${
                    streamEngine === 'proxy'
                      ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300'
                      : 'bg-white/[0.03] border-white/10 text-white/50'
                  }`}
                >
                  UV Proxy
                </button>
              </div>
            </div>

            {/* In-Frame Stream Banner (Advising on Login) */}
            <div className="px-4 py-1.5 bg-[#0e1326] border-b border-cyan-500/20 flex items-center justify-between text-[11px] text-cyan-200">
              <div className="flex items-center gap-2">
                <Info size={13} className="text-cyan-400 shrink-0" />
                <span>
                  <strong>Tip:</strong> In CloudMoon, use <strong>Email &amp; Password</strong> to sign in (Google sign-in is blocked in iframe proxies).
                </span>
              </div>
              <a
                href={activeRunningUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center gap-1 shrink-0 ml-2"
              >
                <span>Pop-out Window</span>
                <ExternalLink size={10} />
              </a>
            </div>

            {/* Embedded Stream View */}
            <div className="flex-1 w-full h-full relative">
              {streamEngine === 'proxy' ? (
                <ServiceWorkerAppView
                  key={`cloud-proxy-${refreshKey}-${resolvedFrameUrl}`}
                  url={resolvedFrameUrl}
                  appName={activeRunningTitle}
                  fallbackUrl={CLOUDMOON_UNBLOCKER_URL}
                  fallbackName="CloudMoon InPlay"
                />
              ) : (
                <iframe
                  key={`cloud-stream-${refreshKey}-${resolvedFrameUrl}`}
                  src={resolvedFrameUrl}
                  title={activeRunningTitle}
                  className="w-full h-full border-0 bg-black"
                  allow="autoplay; fullscreen; gamepad; clipboard-read; clipboard-write; encrypted-media; accelerometer; gyroscope; camera; microphone; display-capture"
                  allowFullScreen
                  sandbox="allow-scripts allow-forms allow-pointer-lock allow-same-origin allow-modals allow-popups allow-downloads allow-presentation"
                />
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: STRATUS 225 AAA TITLES CATALOG */}
        {activeTab === 'stratus' && (
          <div className="flex-1 w-full h-full flex flex-col overflow-hidden">
            {/* Search & Tag Filter Bar */}
            <div className="p-4 sm:p-5 border-b border-white/[0.08] bg-gradient-to-r from-[#0d1629]/90 via-[#0a1020]/90 to-[#070b14]/90 shrink-0 backdrop-blur-xl flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-white">
                    Stratus 225 AAA Cloud Catalog
                  </h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                    {filteredStratusGames.length} Titles
                  </span>
                </div>

                <div className="relative w-full sm:w-80">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search GTA, Cyberpunk, Wukong, Elden Ring..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-white/[0.05] border border-white/10 text-white placeholder-white/30 outline-none focus:border-cyan-500/60"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 custom-scrollbar">
                {['All', '3A', 'Action', 'RPG', 'Fighting', 'Adventure', 'Racing', 'Anime', 'Horror', 'Open World'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      sound.playClick();
                      setSelectedTag(tag);
                    }}
                    className={`px-3 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all border ${
                      selectedTag === tag
                        ? 'bg-cyan-600 border-cyan-400 text-white shadow-md shadow-cyan-950/30'
                        : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 text-white/70 hover:text-white'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
              {loading ? (
                <div className="w-full h-64 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
                  <p className="text-xs font-mono text-cyan-300">Loading 225 cloud titles...</p>
                </div>
              ) : filteredStratusGames.length === 0 ? (
                <div className="w-full h-64 flex flex-col items-center justify-center gap-2 text-white/40 text-center">
                  <Gamepad2 size={36} className="opacity-40" />
                  <p className="text-sm font-semibold">No cloud titles match your search.</p>
                  <button
                    onClick={() => {
                      setSearch('');
                      setSelectedTag('All');
                    }}
                    className="text-xs text-cyan-400 hover:underline mt-1"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredStratusGames.map((game) => (
                    <div
                      key={game.game_key}
                      onClick={() => {
                        sound.playClick();
                        setSelectedGameForModal(game);
                      }}
                      className="group relative flex flex-col rounded-2xl border border-white/10 hover:border-cyan-400/50 bg-[#080f1a] hover:bg-[#0c1626] overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-sm hover:shadow-xl hover:shadow-cyan-950/40"
                    >
                      <div className="relative aspect-[16/10] w-full bg-black/60 overflow-hidden">
                        <img
                          src={game.cover || game.image}
                          alt={game.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#080f1a] via-transparent to-transparent opacity-80" />
                        <span className="absolute top-2 left-2 text-[9px] px-2 py-0.5 rounded-full font-mono font-bold bg-black/70 backdrop-blur-md border border-white/10 text-cyan-300 uppercase">
                          STRATUS
                        </span>

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs">
                          <div className="w-10 h-10 rounded-full bg-cyan-600 text-white flex items-center justify-center shadow-lg shadow-cyan-600/40 transform scale-75 group-hover:scale-100 transition-transform">
                            <Play size={16} className="ml-0.5 fill-white" />
                          </div>
                        </div>
                      </div>

                      <div className="p-3 flex flex-col flex-1 justify-between">
                        <div>
                          <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                            {game.name}
                          </h3>
                          <p className="text-[10px] text-white/50 line-clamp-2 mt-1">
                            {game.description || 'Full AAA cloud streamed title'}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {game.tags.slice(0, 2).map((t) => (
                            <span
                              key={t}
                              className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08] text-white/60"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: ARCADE HUB (FEATURED DIRECT GAMES) */}
        {activeTab === 'featured' && (
          <div className="flex-1 w-full h-full overflow-y-auto p-5 sm:p-7 custom-scrollbar">
            <div className="max-w-5xl mx-auto space-y-6">
              <div>
                <h2 className="text-lg font-black text-white">
                  Arcade &amp; Multiplayer Cloud Hub
                </h2>
                <p className="text-xs text-white/60 mt-0.5">
                  Pre-configured high-framerate cloud streaming titles running unblocked on CloudMoon &amp; NowGG
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {FEATURED_CLOUD_GAMES.map((game) => (
                  <div
                    key={game.title}
                    className="p-4 rounded-3xl bg-[#0c1020] border border-white/10 hover:border-cyan-500/40 flex flex-col justify-between transition-all group shadow-lg"
                  >
                    <div>
                      <div className="relative aspect-video w-full rounded-2xl overflow-hidden mb-3.5 bg-black/50">
                        <img
                          src={game.thumbnail}
                          alt={game.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-black/70 backdrop-blur-md border border-white/15 text-cyan-300 uppercase">
                          {game.category}
                        </span>
                      </div>

                      <h3 className="text-sm font-black text-white group-hover:text-cyan-300 transition-colors">
                        {game.title}
                      </h3>
                      <p className="text-xs text-white/60 line-clamp-2 mt-1">
                        {game.desc}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/[0.08]">
                      <button
                        onClick={() => {
                          launchRunner(CLOUDMOON_UNBLOCKER_URL, `${game.title} (CloudMoon InPlay)`);
                        }}
                        className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-xs text-white transition-all shadow-md shadow-cyan-950/40 flex items-center justify-center gap-1.5"
                      >
                        <Play size={13} className="fill-white" />
                        <span>CloudMoon</span>
                      </button>

                      {game.nowggUrl && (
                        <button
                          onClick={() => {
                            launchRunner(game.nowggUrl!, `${game.title} (NowGG Cloud)`);
                          }}
                          className="px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 font-bold text-xs text-white/80 hover:text-white transition-all"
                        >
                          NowGG
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stratus Game Launch Dialog */}
      {selectedGameForModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0c1020] border border-cyan-500/30 shadow-2xl p-6 text-white">
            <button
              onClick={() => setSelectedGameForModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              <X size={16} />
            </button>

            <div className="flex gap-4 items-start mb-5">
              <img
                src={selectedGameForModal.cover || selectedGameForModal.image}
                alt={selectedGameForModal.name}
                className="w-24 h-24 object-cover rounded-2xl border border-white/20 shadow-lg shrink-0"
              />
              <div className="flex-1">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                  Stratus AAA Title
                </span>
                <h3 className="text-lg font-black text-white mt-1 leading-snug">
                  {selectedGameForModal.name}
                </h3>
                <p className="text-xs text-white/60 line-clamp-2 mt-1 font-sans">
                  {selectedGameForModal.description || 'WebRTC cloud streaming with full gamepad and keyboard input.'}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 mb-4">
              <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-300">
                Launch via Cloud Runner:
              </h4>

              {/* Launch on CloudMoon InPlay Unblocker */}
              <button
                onClick={() => {
                  setSelectedGameForModal(null);
                  launchRunner(CLOUDMOON_UNBLOCKER_URL, `${selectedGameForModal.name} (CloudMoon InPlay)`);
                }}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-blue-900/50 to-cyan-900/40 hover:from-blue-800/70 hover:to-cyan-800/60 border border-cyan-500/40 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300 text-lg">
                    🌙
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black text-white group-hover:text-cyan-300 transition-colors">
                      Launch on CloudMoon InPlay Engine
                    </p>
                    <span className="text-[10px] text-white/50">
                      Unblocked direct browser streaming with gamepad support &amp; adblocking
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-cyan-400" />
              </button>

              {/* Direct WebRTC Session Runner */}
              <button
                onClick={() => {
                  setSelectedGameForModal(null);
                  const webrtcUrl = `https://nowgg.nl/play/search?q=${encodeURIComponent(selectedGameForModal.name)}`;
                  launchRunner(webrtcUrl, `${selectedGameForModal.name} (WebRTC Stream)`);
                }}
                className="w-full p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 text-lg">
                    ⚡
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black text-white group-hover:text-purple-300 transition-colors">
                      WebRTC Direct Stream Relay
                    </p>
                    <span className="text-[10px] text-white/50">
                      Tunnel stream through Godly OS low-latency WebRTC frame
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-purple-400" />
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={() => setSelectedGameForModal(null)}
                className="text-xs text-white/40 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
