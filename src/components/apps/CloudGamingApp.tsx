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
  Info
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

export const CloudGamingApp: React.FC = () => {
  const [activeSource, setActiveSource] = useState<'cloudmoon' | 'stratus'>('cloudmoon');
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [stratusGames, setStratusGames] = useState<StratusCloudGame[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeGameUrl, setActiveGameUrl] = useState<string | null>(null);
  const [activeGameTitle, setActiveGameTitle] = useState<string>('CloudMoon Gaming');
  const [streamMode, setStreamMode] = useState<'direct' | 'proxy'>('direct');
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Load 225 Stratus cloud games
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

  const handleLaunchStratusGame = (game: StratusCloudGame) => {
    sound.playOpen();
    setActiveGameTitle(game.name);
    // Direct RaccoonGame WebRTC runner url
    setActiveGameUrl(`https://www.raccoongame.com/#/game-detail?gameKey=${game.game_key}`);
    setRefreshKey((k) => k + 1);
  };

  const handleLaunchCloudMoon = () => {
    sound.playOpen();
    setActiveSource('cloudmoon');
    setActiveGameTitle('CloudMoon Web Cloud Gaming');
    setActiveGameUrl('https://web.cloudmoonapp.com/');
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

  const currentEmbedUrl = activeSource === 'cloudmoon' && !activeGameUrl
    ? 'https://web.cloudmoonapp.com/'
    : activeGameUrl;

  return (
    <div className="w-full h-full flex flex-col bg-[#070913] text-white select-none overflow-hidden font-sans">
      {/* Top Header & Navigation Bar */}
      <div className="h-14 px-4 bg-gradient-to-r from-[#0d1326]/95 via-[#0a0f1d]/95 to-[#080b16]/95 border-b border-white/10 flex items-center justify-between shrink-0 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-950/40 flex items-center justify-center">
            <div className="w-full h-full rounded-[10px] bg-[#070d18] flex items-center justify-center">
              <Cloud size={18} className="text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-tight text-white">Cloudgaming</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                v2.0
              </span>
            </div>
            <p className="text-[10px] text-white/40 hidden sm:block">
              CloudMoon &amp; Stratus 225 AAA WebRTC Cloud Games
            </p>
          </div>
        </div>

        {/* Source Switcher Tabs */}
        <div className="flex items-center bg-white/[0.04] p-1 rounded-xl border border-white/10">
          <button
            onClick={() => {
              sound.playClick();
              setActiveSource('cloudmoon');
              setActiveGameUrl('https://web.cloudmoonapp.com/');
              setActiveGameTitle('CloudMoon Gaming');
              setRefreshKey((k) => k + 1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSource === 'cloudmoon'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-cyan-950/40'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <span>🌙</span> CloudMoon
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveSource('stratus');
              setActiveGameUrl(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSource === 'stratus'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-indigo-950/40'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <span>⚡</span> Stratus AAA (225)
          </button>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2">
          {currentEmbedUrl && (
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
                href={currentEmbedUrl}
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
      <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col" ref={playerContainerRef}>
        {/* VIEW 1: CLOUDMOON STREAM PLAYER */}
        {activeSource === 'cloudmoon' && (
          <div className="flex-1 w-full h-full relative bg-black flex flex-col">
            <div className="flex-1 w-full h-full relative">
              {streamMode === 'direct' ? (
                <iframe
                  key={`cloudmoon-direct-${refreshKey}`}
                  src="https://web.cloudmoonapp.com/"
                  title="CloudMoon Gaming"
                  className="w-full h-full border-0 bg-black"
                  allow="autoplay; fullscreen; gamepad; clipboard-write; encrypted-media; accelerometer; gyroscope; camera; microphone; display-capture"
                  allowFullScreen
                  sandbox="allow-scripts allow-forms allow-pointer-lock allow-same-origin allow-modals allow-popups"
                />
              ) : (
                <ServiceWorkerAppView
                  key={`cloudmoon-proxy-${refreshKey}`}
                  url="https://web.cloudmoonapp.com/"
                  appName="CloudMoon Web Gaming"
                  fallbackUrl="https://web.cloudmoonapp.com/"
                  fallbackName="CloudMoon Gaming"
                />
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: STRATUS CLOUD CATALOG OR STREAM */}
        {activeSource === 'stratus' && (
          <div className="flex-1 w-full h-full relative flex flex-col overflow-hidden">
            {activeGameUrl ? (
              // Active Stratus Stream Player
              <div className="flex-1 w-full h-full relative bg-black flex flex-col">
                <div className="h-10 px-4 bg-[#0a0f1d] border-b border-white/10 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        sound.playClick();
                        setActiveGameUrl(null);
                      }}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      ← Back to 225 Titles
                    </button>
                    <span className="text-white/30">•</span>
                    <span className="text-xs font-bold text-white truncate max-w-sm">
                      {activeGameTitle}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-white/40">
                    RaccoonGame WebRTC Engine
                  </span>
                </div>
                <div className="flex-1 w-full h-full relative">
                  {streamMode === 'direct' ? (
                    <iframe
                      key={`stratus-direct-${refreshKey}-${activeGameUrl}`}
                      src={activeGameUrl}
                      title={activeGameTitle}
                      className="w-full h-full border-0 bg-black"
                      allow="autoplay; fullscreen; gamepad; clipboard-write; encrypted-media; accelerometer; gyroscope"
                      allowFullScreen
                      sandbox="allow-scripts allow-forms allow-pointer-lock allow-same-origin allow-modals allow-popups"
                    />
                  ) : (
                    <ServiceWorkerAppView
                      key={`stratus-proxy-${refreshKey}-${activeGameUrl}`}
                      url={activeGameUrl}
                      appName={activeGameTitle}
                      fallbackUrl={activeGameUrl}
                      fallbackName="Stratus Stream"
                    />
                  )}
                </div>
              </div>
            ) : (
              // Stratus Catalog Browser
              <div className="flex-1 w-full h-full flex flex-col overflow-hidden">
                {/* Search & Tag Filter Bar */}
                <div className="p-4 sm:p-5 border-b border-white/[0.08] bg-gradient-to-r from-[#0d1629]/80 via-[#0a1020]/80 to-[#070b14]/80 shrink-0 backdrop-blur-xl flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-black text-white">
                        Stratus 225 AAA Cloud Library
                      </h2>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                        {filteredStratusGames.length} Available
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
                          onClick={() => handleLaunchStratusGame(game)}
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

                          <div className="p-3 flex flex-col justify-between flex-1 gap-1.5">
                            <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                              {game.name}
                            </h4>
                            <div className="flex items-center gap-1 flex-wrap">
                              {game.tags.slice(0, 2).map((t) => (
                                <span
                                  key={t}
                                  className="text-[9px] px-1.5 py-0.2 rounded-md bg-white/[0.04] text-white/60 border border-white/[0.06]"
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
        )}
      </div>
    </div>
  );
};
