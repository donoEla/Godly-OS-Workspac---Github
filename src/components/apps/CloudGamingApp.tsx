import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Gamepad2,
  Search,
  ExternalLink,
  RotateCcw,
  Maximize2,
  Minimize2,
  Play,
  Flame,
  Info,
  X,
  Tv,
  CheckCircle2,
  Layers,
  ChevronRight,
  Zap,
  Radio
} from 'lucide-react';
import { sound } from '../../utils/sound';

export interface CloudMoonGame {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  desc: string;
  rating?: number;
  players?: string;
}

// Official CloudMoon WebRTC SVG bootloader fallback
export const CLOUDMOON_URL = 'https://cdn.jsdelivr.net/gh/CloudMoonApp/web@main/261014.svg';
const PORTAL_HTML_URL = 'https://cdn.jsdelivr.net/gh/CloudMoonApp/web@main/portal-261014.html';

export const CLOUDMOON_GAMES: CloudMoonGame[] = [
  {
    id: 'cm-roblox',
    title: 'Roblox',
    category: 'Sandbox MMO',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
    desc: 'Infinite worlds, multiplayer obbies, roleplay, and anime battlegrounds in 60 FPS cloud.',
    rating: 4.8,
    players: '50M+ Online'
  },
  {
    id: 'cm-free-fire',
    title: 'Free Fire MAX',
    category: 'Battle Royale',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    desc: 'High-octane 50-player battle royale with ultra HD graphics and lightning fast gunplay.',
    rating: 4.6,
    players: '100M+ Plays'
  },
  {
    id: 'cm-brawl-stars',
    title: 'Brawl Stars',
    category: 'Multiplayer Action',
    thumbnail: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=600&auto=format&fit=crop&q=80',
    desc: 'Fast-paced 3v3 multiplayer and solo battle royale brawler by Supercell.',
    rating: 4.7,
    players: '20M+ Plays'
  },
  {
    id: 'cm-subway-surfers',
    title: 'Subway Surfers',
    category: 'Arcade Runner',
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
    desc: 'Dash, dodge trains, and grab coins in the most popular endless runner of all time.',
    rating: 4.9,
    players: '1B+ Downloads'
  },
  {
    id: 'cm-codm',
    title: 'Call of Duty: Mobile',
    category: 'Shooter',
    thumbnail: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=80',
    desc: 'Iconic multiplayer maps like Nuketown, Crash, and battle royale with tight FPS controls.',
    rating: 4.8,
    players: '10M+ Online'
  },
  {
    id: 'cm-genshin',
    title: 'Genshin Impact',
    category: 'Open World RPG',
    thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    desc: 'Step into Teyvat, a vast open world teeming with elemental magic, bosses, and quests.',
    rating: 4.9,
    players: '15M+ Online'
  },
  {
    id: 'cm-pubgm',
    title: 'PUBG Mobile',
    category: 'Battle Royale',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    desc: 'Realistic military battle royale with 100 players dropping into Erangel and Miramar.',
    rating: 4.6,
    players: '40M+ Online'
  },
  {
    id: 'cm-minecraft',
    title: 'Minecraft',
    category: 'Sandbox Survival',
    thumbnail: 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?w=600&auto=format&fit=crop&q=80',
    desc: 'Build anything imaginable, explore infinite biomes, survive the night, and conquer the Nether.',
    rating: 4.9,
    players: '140M+ Players'
  },
  {
    id: 'cm-honkai-star-rail',
    title: 'Honkai: Star Rail',
    category: 'Turn-Based RPG',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    desc: 'Board the Astral Express and travel across galaxies in cinematic turn-based tactical battles.',
    rating: 4.8,
    players: '12M+ Online'
  },
  {
    id: 'cm-ea-fc',
    title: 'EA SPORTS FC Mobile',
    category: 'Sports',
    thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&auto=format&fit=crop&q=80',
    desc: 'Compete with 15,000+ real licensed players, authentic UEFA Champions League tournament mode.',
    rating: 4.5,
    players: '30M+ Players'
  },
  {
    id: 'cm-wild-rift',
    title: 'League of Legends: Wild Rift',
    category: 'MOBA',
    thumbnail: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
    desc: 'High-skill 5v5 MOBA action re-engineered for smooth twin-stick touchscreen control.',
    rating: 4.7,
    players: '8M+ Online'
  },
  {
    id: 'cm-among-us',
    title: 'Among Us',
    category: 'Party / Deduction',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    desc: 'Work together as crewmates to prep your spaceship, or sabotage and eliminate as the Impostor.',
    rating: 4.6,
    players: '25M+ Players'
  },
  {
    id: 'cm-stumble-guys',
    title: 'Stumble Guys',
    category: 'Party Battle Royale',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    desc: 'Hilarious 32-player knockout party runner over wild obstacle courses and tricky hurdles.',
    rating: 4.5,
    players: '15M+ Online'
  },
  {
    id: 'cm-asphalt-9',
    title: 'Asphalt 9: Legends',
    category: 'Arcade Racing',
    thumbnail: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&auto=format&fit=crop&q=80',
    desc: 'Hypercars by Ferrari, Porsche, and Lamborghini with nitro drift boost over high-speed ramps.',
    rating: 4.7,
    players: '10M+ Online'
  },
  {
    id: 'cm-clash-of-clans',
    title: 'Clash of Clans',
    category: 'Strategy MMO',
    thumbnail: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=80',
    desc: 'Build your village, train troops, wage clan wars, and climb trophy leagues.',
    rating: 4.8,
    players: '80M+ Players'
  },
  {
    id: 'cm-clash-royale',
    title: 'Clash Royale',
    category: 'Card Strategy',
    thumbnail: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=600&auto=format&fit=crop&q=80',
    desc: 'Real-time head-to-head tower rush battle arena starring your favorite Clash characters.',
    rating: 4.7,
    players: '40M+ Online'
  },
  {
    id: 'cm-mobile-legends',
    title: 'Mobile Legends: Bang Bang',
    category: 'MOBA',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
    desc: '10-second matchmaking, 10-minute 5v5 matches. Laning, jungling, and team battles in real time.',
    rating: 4.6,
    players: '20M+ Online'
  },
  {
    id: 'cm-geometry-dash',
    title: 'Geometry Dash',
    category: 'Rhythm Platformer',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    desc: 'Jump, fly, and flip your way through dangerous passages and spiky obstacles in rhythm.',
    rating: 4.8,
    players: '5M+ Players'
  }
];

export const CloudGamingApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stream' | 'library'>('stream');
  // selectedGame is null on initial open so CloudMoon starts on the full library
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [activeGameTitle, setActiveGameTitle] = useState<string>('CloudMoon Library');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [gamepadConnected, setGamepadConnected] = useState<string | null>(null);
  const [portalHtml, setPortalHtml] = useState<string | null>(null);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load CloudMoon Portal HTML and inject bridge script for instant quick play launcher
  useEffect(() => {
    let isMounted = true;
    fetch(PORTAL_HTML_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.text();
      })
      .then((rawHtml) => {
        if (!isMounted) return;

        const bridgeScript = `
<script>
(function() {
  function selectGame(gameTitle) {
    if (!gameTitle) return;

    function tryLaunch() {
      try {
        const app = window.App;
        if (!app) return false;

        const searchInput = document.getElementById('search-input');
        if (searchInput) {
          searchInput.value = gameTitle;
          searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (typeof app.handleSearch === 'function') {
          app.handleSearch(gameTitle);
        }

        const games = (app.rawGames && app.rawGames.length)
          ? app.rawGames
          : (app.filteredGames && app.filteredGames.length)
            ? app.filteredGames
            : [];

        if (!games.length) return false;

        const clean = function(s) { return (s || '').toLowerCase().replace(/[^a-z0-9]/g, ''); };
        const targetClean = clean(gameTitle);

        const match = games.find(function(g) {
          const t = clean(g.title);
          const id = clean(g.id);
          return t.includes(targetClean) || targetClean.includes(t) || id.includes(targetClean);
        });

        if (match && match.id && typeof app.showGameDetails === 'function') {
          app.showGameDetails(match.id);
          return true;
        }

        const firstCard = document.querySelector('#game-grid .game-card-item');
        if (firstCard) {
          firstCard.click();
          return true;
        }
      } catch (err) {
        console.warn('[CloudMoon Bridge Error]', err);
      }
      return false;
    }

    if (!tryLaunch()) {
      var attempts = 0;
      var interval = setInterval(function() {
        attempts++;
        if (tryLaunch() || attempts > 30) {
          clearInterval(interval);
        }
      }, 200);
    }
  }

  function resetToAllLibrary() {
    try {
      const app = window.App;
      if (!app) return;
      if (typeof app.closeModal === 'function') {
        app.closeModal();
      }
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (typeof app.handleSearch === 'function') {
        app.handleSearch('');
      }
    } catch (e) {
      console.warn('[CloudMoon Reset Error]', e);
    }
  }

  window.addEventListener('message', function(evt) {
    if (!evt.data) return;
    if (evt.data.type === 'LAUNCH_GAME' && evt.data.title) {
      selectGame(evt.data.title);
    } else if (evt.data.type === 'RESET_LIBRARY' || evt.data.type === 'SHOW_ALL') {
      resetToAllLibrary();
    }
  });

  try {
    const params = new URLSearchParams(window.location.search);
    const g = params.get('game');
    if (g) selectGame(g);
  } catch (err) {}
})();
</script>
`;

        let modified = rawHtml;
        if (modified.includes('<head>')) {
          modified = modified.replace(
            '<head>',
            '<head><base href="https://cdn.jsdelivr.net/gh/CloudMoonApp/web@main/">'
          );
        }
        if (modified.includes('</body>')) {
          modified = modified.replace('</body>', `${bridgeScript}</body>`);
        } else {
          modified += bridgeScript;
        }

        setPortalHtml(modified);
      })
      .catch((err) => {
        console.warn('Direct CloudMoon portal fetch bypassed, using SVG bootloader fallback:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Gamepad Detection
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

  const handleLaunchGame = (title: string) => {
    sound.playClick();
    setSelectedGame(title);
    setActiveGameTitle(`${title} (CloudMoon)`);
    setActiveTab('stream');

    const sendLaunchMessage = () => {
      try {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          iframeRef.current.contentWindow.postMessage(
            { type: 'LAUNCH_GAME', title },
            '*'
          );
        }
      } catch (e) {}
    };

    sendLaunchMessage();
    setTimeout(sendLaunchMessage, 200);
    setTimeout(sendLaunchMessage, 600);
    setTimeout(sendLaunchMessage, 1200);
  };

  const handleShowAllGames = () => {
    sound.playClick();
    setSelectedGame(null);
    setActiveGameTitle('CloudMoon Library');
    setActiveTab('stream');

    const sendResetMessage = () => {
      try {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          iframeRef.current.contentWindow.postMessage(
            { type: 'RESET_LIBRARY' },
            '*'
          );
        }
      } catch (e) {}
    };

    sendResetMessage();
    setTimeout(sendResetMessage, 200);
    setTimeout(sendResetMessage, 600);
  };

  const handleIframeLoaded = () => {
    // Only dispatch specific game selection if user explicitly chose one
    if (selectedGame && iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          { type: 'LAUNCH_GAME', title: selectedGame },
          '*'
        );
      } catch (e) {}
    }
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

  const filteredGames = useMemo(() => {
    return CLOUDMOON_GAMES.filter((g) => {
      const matchesSearch =
        !search.trim() ||
        g.title.toLowerCase().includes(search.toLowerCase()) ||
        g.desc.toLowerCase().includes(search.toLowerCase()) ||
        g.category.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;
      if (selectedCategory === 'All') return true;
      return g.category.toLowerCase().includes(selectedCategory.toLowerCase());
    });
  }, [search, selectedCategory]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    CLOUDMOON_GAMES.forEach((g) => set.add(g.category));
    return ['All', ...Array.from(set)];
  }, []);

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
                CloudMoon Gaming
              </h1>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                WebRTC &bull; 60 FPS
              </span>
            </div>
            <p className="text-[10px] text-white/50 hidden sm:block">
              CloudMoon InPlay &bull; Official Web Engine &bull; Zero Install
            </p>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-2xl border border-white/10">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('stream');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'stream'
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
              setActiveTab('library');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'library'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/50'
                : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Layers size={13} className="text-cyan-400" />
            <span>Games Hub</span>
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
        {/* VIEW 1: ACTIVE CLOUDMOON STREAM */}
        {activeTab === 'stream' && (
          <div className="flex-1 w-full h-full relative bg-black flex flex-col overflow-hidden">
            {/* Quick Play Strip with All Games button + titles */}
            <div className="px-4 py-2 bg-[#080b18] border-b border-white/[0.08] flex items-center justify-between gap-3 shrink-0 flex-wrap">
              <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar">
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
                  <Flame size={12} className="text-amber-400" /> Quick Play:
                </span>

                {/* All Games (Whole Library) Button */}
                <button
                  onClick={handleShowAllGames}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                    !selectedGame
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border border-cyan-400 shadow-md shadow-cyan-950/60 ring-1 ring-cyan-400/40'
                      : 'bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 hover:border-cyan-500/40 text-white/80 hover:text-white'
                  }`}
                  title="Show all games in the CloudMoon library"
                >
                  <Layers size={11} className={!selectedGame ? 'text-white' : 'text-cyan-400'} />
                  <span>All Games</span>
                  {!selectedGame && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5 animate-pulse" />
                  )}
                </button>

                {CLOUDMOON_GAMES.slice(0, 8).map((fg) => {
                  const isSelected = selectedGame?.toLowerCase() === fg.title.toLowerCase();
                  return (
                    <button
                      key={fg.id}
                      onClick={() => handleLaunchGame(fg.title)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border border-cyan-400 shadow-md shadow-cyan-950/60 ring-1 ring-cyan-400/40'
                          : 'bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 hover:border-cyan-500/40 text-white/80 hover:text-white'
                      }`}
                      title={`Quick launch ${fg.title} in CloudMoon`}
                    >
                      <Zap size={11} className={isSelected ? 'text-amber-300 fill-amber-300' : 'text-cyan-400'} />
                      <span>{fg.title}</span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    sound.playClick();
                    window.open(CLOUDMOON_URL, '_blank');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-400/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                  title="Open CloudMoon in Native Window"
                >
                  <ExternalLink size={12} />
                  <span>Pop-out Window</span>
                </button>
              </div>
            </div>

            {/* In-Frame Tip / Status Banner */}
            <div className="px-4 py-1.5 bg-[#0e1326] border-b border-cyan-500/20 flex items-center justify-between text-[11px] text-cyan-200">
              <div className="flex items-center gap-2">
                <Info size={13} className="text-cyan-400 shrink-0" />
                <span>
                  {selectedGame ? (
                    <>
                      <strong>Quick Play Active:</strong> Target title is <strong>{selectedGame}</strong>. Sign in using <strong>Email &amp; Password</strong> inside CloudMoon.
                    </>
                  ) : (
                    <>
                      <strong>CloudMoon Library:</strong> Showing the complete 60 FPS cloud catalog. Click any game card or Quick Play title to launch.
                    </>
                  )}
                </span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 shrink-0 ml-2 hidden sm:inline flex items-center gap-1">
                <Radio size={11} className="text-emerald-400 animate-pulse" />
                {activeGameTitle}
              </span>
            </div>

            {/* Embedded CloudMoon IFrame with Smart Quick Launch Bridge */}
            <div className="flex-1 w-full h-full relative bg-black">
              {portalHtml ? (
                <iframe
                  ref={iframeRef}
                  key={`cloudmoon-srcdoc-${refreshKey}`}
                  srcDoc={portalHtml}
                  onLoad={handleIframeLoaded}
                  title="CloudMoon Gaming InPlay"
                  className="w-full h-full border-0 bg-black"
                  allow="autoplay; fullscreen; gamepad; clipboard-read; clipboard-write; encrypted-media; accelerometer; gyroscope; camera; microphone; display-capture"
                  allowFullScreen
                />
              ) : (
                <iframe
                  ref={iframeRef}
                  key={`cloudmoon-stream-${refreshKey}`}
                  src={CLOUDMOON_URL}
                  onLoad={handleIframeLoaded}
                  title="CloudMoon Gaming InPlay"
                  className="w-full h-full border-0 bg-black"
                  allow="autoplay; fullscreen; gamepad; clipboard-read; clipboard-write; encrypted-media; accelerometer; gyroscope; camera; microphone; display-capture"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: CLOUDMOON GAMES HUB */}
        {activeTab === 'library' && (
          <div className="flex-1 w-full h-full flex flex-col overflow-hidden bg-[#070914]">
            {/* Search & Tag Filter Bar */}
            <div className="p-4 sm:p-5 border-b border-white/[0.08] bg-gradient-to-r from-[#0d1629]/90 via-[#0a1020]/90 to-[#070b14]/90 shrink-0 backdrop-blur-xl flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-white">
                    CloudMoon Games Catalog
                  </h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                    {filteredGames.length} Cloud Titles
                  </span>
                </div>

                <div className="relative w-full sm:w-80">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search Roblox, Genshin, Free Fire, COD..."
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
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      sound.playClick();
                      setSelectedCategory(cat);
                    }}
                    className={`px-3 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all border ${
                      selectedCategory === cat
                        ? 'bg-cyan-600 border-cyan-400 text-white shadow-md shadow-cyan-950/30'
                        : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 text-white/70 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
              {filteredGames.length === 0 ? (
                <div className="w-full h-64 flex flex-col items-center justify-center gap-2 text-white/40 text-center">
                  <Gamepad2 size={36} className="opacity-40" />
                  <p className="text-sm font-semibold">No cloud titles match your search.</p>
                  <button
                    onClick={() => {
                      setSearch('');
                      setSelectedCategory('All');
                    }}
                    className="text-xs text-cyan-400 hover:underline mt-1"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredGames.map((game) => (
                    <div
                      key={game.id}
                      onClick={() => handleLaunchGame(game.title)}
                      className="group relative flex flex-col rounded-3xl border border-white/10 hover:border-cyan-400/50 bg-[#0c1224] hover:bg-[#101830] overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-md hover:shadow-2xl hover:shadow-cyan-950/50"
                    >
                      <div className="relative aspect-video w-full bg-black/60 overflow-hidden">
                        <img
                          src={game.thumbnail}
                          alt={game.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1224] via-transparent to-transparent opacity-80" />
                        <span className="absolute top-2.5 left-2.5 text-[9px] px-2 py-0.5 rounded-full font-mono font-bold bg-black/75 backdrop-blur-md border border-white/15 text-cyan-300 uppercase">
                          {game.category}
                        </span>

                        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLaunchGame(game.title);
                            }}
                            className="w-11 h-11 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center shadow-lg shadow-cyan-600/40 transform scale-75 group-hover:scale-100 transition-all hover:scale-110"
                            title={`Play ${game.title} in CloudMoon`}
                          >
                            <Play size={18} className="ml-0.5 fill-white" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              sound.playClick();
                              window.open(CLOUDMOON_URL, '_blank');
                            }}
                            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center shadow-md transform scale-75 group-hover:scale-100 transition-all hover:scale-110"
                            title="Open CloudMoon in Native Window"
                          >
                            <ExternalLink size={15} />
                          </button>
                        </div>
                      </div>

                      <div className="p-3.5 flex flex-col flex-1 justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                              {game.title}
                            </h3>
                            {game.rating && (
                              <span className="text-[10px] font-mono font-bold text-amber-400 flex items-center gap-0.5 shrink-0">
                                ★ {game.rating}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-white/50 line-clamp-2 mt-1">
                            {game.desc}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/[0.06]">
                          <span className="text-[9px] font-mono text-cyan-400">
                            {game.players || 'Instant 60 FPS'}
                          </span>
                          <span className="text-[9px] font-semibold text-white/40 group-hover:text-cyan-300 flex items-center gap-0.5">
                            Play Now <ChevronRight size={10} />
                          </span>
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
    </div>
  );
};
