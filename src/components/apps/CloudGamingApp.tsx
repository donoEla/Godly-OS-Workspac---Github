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
  Tv
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

const FEATURED_CLOUD_GAMES: QuickCloudGame[] = [
  {
    title: 'Roblox',
    category: 'Multiplayer Sandbox',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop',
    cloudmoonUrl: 'https://web.cloudmoonapp.com/',
    nowggUrl: 'https://nowgg.nl/play/roblox-corporation/5349/roblox',
    desc: 'Infinite worlds, multiplayer obbies, roleplay and battlegrounds in 60 FPS cloud.'
  },
  {
    title: 'Free Fire MAX',
    category: 'Battle Royale',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop',
    cloudmoonUrl: 'https://web.cloudmoonapp.com/',
    nowggUrl: 'https://nowgg.nl/play/garena-international-i-private-limited/8172/free-fire-max',
    desc: '50-player battle royale with high-octane gunplay and ultra graphics.'
  },
  {
    title: 'Call of Duty: Mobile',
    category: 'Action FPS',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop',
    cloudmoonUrl: 'https://web.cloudmoonapp.com/',
    desc: 'Iconic multiplayer maps like Crash and Nuketown with buttery cloud streaming.'
  },
  {
    title: 'Minecraft Bedrock Cloud',
    category: 'Survival & Sandbox',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop',
    cloudmoonUrl: 'https://web.cloudmoonapp.com/',
    desc: 'Survive the night, craft masterpieces, and mine deep underground.'
  },
  {
    title: 'Car Parking Multiplayer',
    category: 'Open World Driving',
    thumbnail: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&auto=format&fit=crop',
    cloudmoonUrl: 'https://web.cloudmoonapp.com/',
    nowggUrl: 'https://nowgg.nl/play/olzhass/6548/car-parking-multiplayer',
    desc: 'Free walking, open world with real gas stations, tuning and multiplayer.'
  },
  {
    title: 'Genshin Impact Cloud',
    category: 'Open World RPG',
    thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop',
    cloudmoonUrl: 'https://web.cloudmoonapp.com/',
    desc: 'Step into Teyvat, a vast world teeming with elemental energy.'
  }
];

export const CloudGamingApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cloudmoon' | 'stratus'>('cloudmoon');
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [stratusGames, setStratusGames] = useState<StratusCloudGame[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Active Runner State
  const [activeRunningUrl, setActiveRunningUrl] = useState<string | null>(null);
  const [activeRunningTitle, setActiveRunningTitle] = useState<string>('Cloud Gaming');
  const [streamMode, setStreamMode] = useState<'direct' | 'proxy'>('direct');
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Modal for launching a Stratus game
  const [selectedGameForModal, setSelectedGameForModal] = useState<StratusCloudGame | null>(null);

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

  const filteredStratusGames = useMemo(() => {
    return stratusGames.filter((g) => {
      const matchSearch =
        !search.trim() ||
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.description.toLowerCase().includes(search.toLowerCase());
      const matchTag =
        selectedTag === 'All' ||
        g.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase());
      return matchSearch && matchTag;
    });
  }, [stratusGames, search, selectedTag]);

  const launchRunner = (url: string, title: string) => {
    sound.playOpen();
    setActiveRunningUrl(url);
    setActiveRunningTitle(title);
    setSelectedGameForModal(null);
    setRefreshKey((k) => k + 1);
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    sound.playClick();
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#05070e] text-white select-none overflow-hidden font-sans">
      {/* Top Header */}
      <div className="h-14 px-4 bg-[#0a0d1a]/95 border-b border-white/[0.08] flex items-center justify-between shrink-0 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-950/40 flex items-center justify-center">
            <div className="w-full h-full rounded-[10px] bg-[#070d18] flex items-center justify-center">
              <Cloud size={18} className="text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black tracking-tight text-white">Cloud Gaming</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                CloudMoon &amp; Stratus 225
              </span>
            </div>
            <p className="text-[10px] text-white/40 hidden sm:block">
              WebRTC low-latency cloud gaming with gamepad &amp; 60 FPS streaming
            </p>
          </div>
        </div>

        {/* Source Switcher Tabs */}
        <div className="flex items-center bg-white/[0.04] p-1 rounded-xl border border-white/10">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('cloudmoon');
              if (!activeRunningUrl) {
                setActiveRunningUrl('https://web.cloudmoonapp.com/');
                setActiveRunningTitle('CloudMoon Gaming');
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'cloudmoon'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-cyan-950/40'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <span>🌙</span> CloudMoon
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('stratus');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'stratus'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-indigo-950/40'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <span>⚡</span> Stratus (225 AAA)
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {activeRunningUrl && (
            <>
              {/* Direct vs UV Proxy Switcher */}
              <button
                onClick={() => {
                  sound.playClick();
                  setStreamMode((m) => (m === 'direct' ? 'proxy' : 'direct'));
                  setRefreshKey((k) => k + 1);
                }}
                className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                  streamMode === 'direct'
                    ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
                    : 'bg-purple-500/15 border-purple-500/30 text-purple-300'
                }`}
                title="Toggle Direct 60FPS WebRTC vs Ultraviolet Service Worker Proxy"
              >
                {streamMode === 'direct' ? <Zap size={12} /> : <Shield size={12} />}
                <span>{streamMode === 'direct' ? 'Direct 60FPS' : 'UV Proxy'}</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setRefreshKey((k) => k + 1);
                }}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-white/80 hover:text-white transition-all"
                title="Refresh Stream"
              >
                <RotateCcw size={14} />
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-white/80 hover:text-white transition-all"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>

              <a
                href={activeRunningUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-white/80 hover:text-white transition-all"
                title="Popout Game into New Window"
              >
                <ExternalLink size={14} />
              </a>
            </>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div
        className="flex-1 w-full h-full relative overflow-hidden flex flex-col"
        ref={playerContainerRef}
      >
        {/* VIEW 1: CLOUDMOON HUB & LIVE WEBRTC RUNNER */}
        {activeTab === 'cloudmoon' && (
          <div className="flex-1 w-full h-full relative bg-black flex flex-col overflow-hidden">
            {/* Quick-play Bar */}
            <div className="px-4 py-2.5 bg-[#0b0e1d] border-b border-white/[0.08] flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0">
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
                <Flame size={12} className="text-amber-400" /> Quick Launch:
              </span>
              {FEATURED_CLOUD_GAMES.map((fg) => (
                <button
                  key={fg.title}
                  onClick={() => {
                    if (fg.nowggUrl) {
                      launchRunner(fg.nowggUrl, `${fg.title} (NowGG Cloud)`);
                    } else {
                      launchRunner(fg.cloudmoonUrl, `${fg.title} (CloudMoon)`);
                    }
                  }}
                  className="px-3 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 hover:border-cyan-500/40 text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all text-white/80 hover:text-white"
                >
                  <span>🎮</span>
                  <span>{fg.title}</span>
                </button>
              ))}
            </div>

            {/* Active CloudMoon WebRTC Stream */}
            <div className="flex-1 w-full h-full relative">
              {streamMode === 'direct' ? (
                <iframe
                  key={`cloudmoon-direct-${refreshKey}-${activeRunningUrl || 'default'}`}
                  src={activeRunningUrl || 'https://web.cloudmoonapp.com/'}
                  title={activeRunningTitle}
                  className="w-full h-full border-0 bg-black"
                  allow="autoplay; fullscreen; gamepad; clipboard-write; encrypted-media; accelerometer; gyroscope; camera; microphone; display-capture"
                  allowFullScreen
                  sandbox="allow-scripts allow-forms allow-pointer-lock allow-same-origin allow-modals allow-popups"
                />
              ) : (
                <ServiceWorkerAppView
                  key={`cloudmoon-proxy-${refreshKey}-${activeRunningUrl || 'default'}`}
                  url={activeRunningUrl || 'https://web.cloudmoonapp.com/'}
                  appName={activeRunningTitle}
                  fallbackUrl={activeRunningUrl || 'https://web.cloudmoonapp.com/'}
                  fallbackName="CloudMoon Gaming"
                />
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: STRATUS 225 AAA TITLES CATALOG */}
        {activeTab === 'stratus' && (
          <div className="flex-1 w-full h-full flex flex-col overflow-hidden">
            {/* Search & Tag Filter Bar */}
            <div className="p-4 sm:p-5 border-b border-white/[0.08] bg-gradient-to-r from-[#0d1629]/80 via-[#0a1020]/80 to-[#070b14]/80 shrink-0 backdrop-blur-xl flex flex-col gap-3">
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
                    className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white/[0.05] border border-white/10 text-white placeholder-white/30 outline-none focus:border-cyan-500/60"
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
                  {selectedGameForModal.description || 'WebRTC cloud streaming.'}
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-300">
                Choose Cloud Runner:
              </h4>

              {/* Option 1: CloudMoon Runner */}
              <button
                onClick={() => {
                  setActiveTab('cloudmoon');
                  launchRunner('https://web.cloudmoonapp.com/', `${selectedGameForModal.name} (CloudMoon)`);
                }}
                className="w-full p-3 rounded-2xl bg-gradient-to-r from-blue-900/40 to-cyan-900/30 hover:from-blue-800/60 hover:to-cyan-800/50 border border-cyan-500/40 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300 text-lg">
                    🌙
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black text-white group-hover:text-cyan-300 transition-colors">
                      Launch on CloudMoon WebRTC
                    </p>
                    <span className="text-[10px] text-white/50">
                      Unblocked direct browser streaming with gamepad support
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-cyan-400" />
              </button>

              {/* Option 2: RaccoonGame Official Portal */}
              <button
                onClick={() => {
                  const url = `https://www.raccoongame.com/#/game-detail?gameKey=${selectedGameForModal.game_key}`;
                  launchRunner(url, `${selectedGameForModal.name} (RaccoonGame)`);
                }}
                className="w-full p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 text-lg">
                    ⚡
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black text-white group-hover:text-purple-300 transition-colors">
                      RaccoonGame Official Portal
                    </p>
                    <span className="text-[10px] text-white/50">
                      Direct upstream Stratus WebRTC endpoint
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-white/40 group-hover:text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
