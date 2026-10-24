import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import { 
  ShoppingBag, 
  Search, 
  Star, 
  Sparkles, 
  Play, 
  Check, 
  Globe, 
  Zap, 
  X,
  RotateCcw,
  ShieldCheck,
  Film,
  Music,
  Gamepad2,
  Tv
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { ServiceWorkerAppView } from '../common/ServiceWorkerAppView';
import { getAssetUrl } from '../../utils/assetHelper';

interface StoreApp {
  id: string;
  name: string;
  category: 'Media' | 'Design' | 'Utilities' | 'Games' | 'Dev' | 'Productivity';
  developer: string;
  rating: number;
  reviews: string;
  icon: string;
  description: string;
  isInstalled: boolean;
  appId?: any;
  customUrl?: string;
  embedUrl?: string;
  features: string[];
}

const STORE_CATALOG: StoreApp[] = [
  {
    id: 'virtual-machine-app',
    name: 'Virtual Machine (WebVM & CheerpX)',
    category: 'Dev',
    developer: 'Leaning Technologies & Godly Core',
    rating: 5.0,
    reviews: '96.4K',
    icon: getAssetUrl('assets/icons/vm.jpg'),
    description: 'Full in-browser x86 virtualization machine powered by WebVM and CheerpX WebAssembly JIT with Debian Linux, python, gcc, node, and xterm.',
    isInstalled: true,
    appId: 'virtual-machine',
    features: ['Unmodified x86 Linux binary execution', 'WebAssembly CheerpX JIT virtualization', 'Direct, Ultraviolet & Scramjet tunnel support', 'Command cheatsheet & terminal tools'],
  },
  {
    id: 'widgets-studio-app',
    name: 'Widgets Studio',
    category: 'Utilities',
    developer: 'Godly Core Systems',
    rating: 5.0,
    reviews: '92.4K',
    icon: getAssetUrl('assets/icons/widgets.jpg'),
    description: 'Complete desktop widgets management suite. Add, remove, configure, and customize desktop chronometers, telemetry HUDs, and radar displays.',
    isInstalled: true,
    appId: 'widgets',
    features: ['7 live desktop widget templates', 'Scale, opacity & visionOS blur customization', 'Right sidebar & horizon dock snapping', 'JSON layout backup & restore'],
  },
  {
    id: 'zen-browser-app',
    name: 'Godly Browser',
    category: 'Productivity',
    developer: 'Zen Team & Godly Core',
    rating: 5.0,
    reviews: '128.5K',
    icon: getAssetUrl('assets/icons/zen.jpg'),
    description: 'Calm, private, multi-engine browser recreation with vertical tabs, workspaces, and proxy search engine selector (DuckDuckGo, Brave, Google).',
    isInstalled: true,
    appId: 'zen',
    features: ['Vertical tabs sidebar', 'DuckDuckGo, Brave & Google switcher', 'Ultraviolet & Direct fallback', 'Speed Dial bookmarks'],
  },
  {
    id: 'zengs-games-library',
    name: 'Zen GS Cloud Library',
    category: 'Games',
    developer: 'Zen GS Network',
    rating: 4.9,
    reviews: '84.2K',
    icon: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=120&h=120&fit=crop',
    description: 'Over 1,700 unblocked HTML5 and WebAssembly titles distributed via CloudFront CDN rotation.',
    isInstalled: true,
    appId: 'games',
    customUrl: 'zengs',
    features: ['1,700+ Cloud CDN Games', 'Direct in-viewer sandbox player', 'Auto domain rotation'],
  },
  {
    id: 'movies',
    name: 'Movies',
    category: 'Media',
    developer: '1337x Media Network',
    rating: 4.9,
    reviews: '124.8K',
    icon: getAssetUrl('assets/icons/movies.png'),
    description: 'Cinematic movies and multimedia portal powered by 1337x with automatic mirror failover.',
    isInstalled: true,
    embedUrl: 'https://1337x.to/',
    features: ['1337x.to official mirror cluster', 'Automatic mirror rotation', 'Ultraviolet SW proxy pipeline'],
  },
  {
    id: 'octave-stream',
    name: 'Octave Streaming',
    category: 'Media',
    developer: 'Octave Media',
    rating: 4.8,
    reviews: '31.2K',
    icon: getAssetUrl('assets/icons/octave.png?v=3'),
    description: 'High-fidelity audio streaming, albums, and curated playlists seamlessly routed through Ultraviolet SW.',
    isInstalled: true,
    embedUrl: 'https://octavestreaming.com/',
    features: ['Hi-Fi audio codec', 'Spotify alternative stream', 'Wisp WebSocket tunnel'],
  },
  {
    id: 'game-vault-source',
    name: 'Godly Game Vault & Arcade',
    category: 'Games',
    developer: 'Godly Core Archive',
    rating: 5.0,
    reviews: '98.4K',
    icon: getAssetUrl('assets/icons/games.jpg'),
    description: 'Vault of 1,567 unblocked standalone HTML5 and waflash games plus GN-Math integration.',
    isInstalled: true,
    appId: 'games',
    customUrl: 'vault',
    features: ['1,567 Local offline-ready games', 'Zero installs / instant launch', 'Integrated GN-Math source'],
  },
  {
    id: 'spotify-app',
    name: 'Spotify Cloud Player',
    category: 'Media',
    developer: 'Spotify / nowgg.fun',
    rating: 4.9,
    reviews: '128K',
    icon: getAssetUrl('assets/icons/spotify.jpg'),
    description: 'Stream music from nowgg.fun Spotify with instant Octave & Synth fallbacks.',
    isInstalled: true,
    appId: 'spotify',
    features: ['nowgg.fun proxy pipeline', 'Octave stream fallback', 'Offline synth visualizer'],
  },
  {
    id: 'yt-player',
    name: 'YouTube Cinematic',
    category: 'Media',
    developer: 'Google LLC',
    rating: 4.9,
    reviews: '24.2K',
    icon: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=120&h=120&fit=crop',
    description: 'Ultra-fast ambient YouTube player for cinematic 4K streaming directly in Godly OS.',
    isInstalled: true,
    embedUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1',
    features: ['4K Ultra HD playback', 'Picture-in-Picture mode', 'Ambient glow integration'],
  },
  {
    id: 'roblox-nowgg',
    name: 'Roblox Cloud Stream',
    category: 'Games',
    developer: 'Roblox Corporation',
    rating: 4.9,
    reviews: '92.1K',
    icon: 'https://images.unsplash.com/photo-1612287232269-231a44c74ea0?w=120&h=120&fit=crop',
    description: 'Instant cloud play on nowgg.fun. Explore millions of 3D virtual worlds streamed at 60fps.',
    isInstalled: true,
    embedUrl: 'https://nowgg.fun/apps/roblox-corporation/5349/roblox.html',
    features: ['nowgg.fun cloud stream', 'Zero downloads', 'Instant crossplay'],
  },
  {
    id: 'subway-nowgg',
    name: 'Subway Surfers Cloud',
    category: 'Games',
    developer: 'SYBO Games',
    rating: 4.8,
    reviews: '48.3K',
    icon: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=120&h=120&fit=crop',
    description: 'World tour subway tracks running directly in browser via nowgg.fun proxy tunnel.',
    isInstalled: true,
    embedUrl: 'https://nowgg.fun/apps/sybo-games/subway-surfers.html',
    features: ['nowgg.fun cloud stream', 'Keyboard & touch controls', '60fps gameplay'],
  },
  {
    id: 'photopea',
    name: 'Photopea Image Editor',
    category: 'Design',
    developer: 'Ivan Kutskir',
    rating: 4.8,
    reviews: '18.9K',
    icon: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=120&h=120&fit=crop',
    description: 'Advanced Photoshop alternative supporting PSD, AI, Sketch, and RAW vector designs.',
    isInstalled: false,
    embedUrl: 'https://www.photopea.com',
    features: ['PSD/XCF layer support', 'Vector mask tools', 'WebAssembly hardware acceleration'],
  },
  {
    id: 'calculator-pro',
    name: 'Calculator Pro & Grapher',
    category: 'Utilities',
    developer: 'Godly Core',
    rating: 4.7,
    reviews: '11.5K',
    icon: getAssetUrl('assets/icons/calculator.jpg'),
    description: 'Scientific calculator with live 2D Cartesian graphing and function analysis.',
    isInstalled: true,
    appId: 'calculator',
    features: ['Trigonometric functions', 'Canvas function plot', 'Calculus approximations'],
  },
  {
    id: 'vscode-web',
    name: 'VS Code Studio',
    category: 'Dev',
    developer: 'Microsoft',
    rating: 5.0,
    reviews: '55.3K',
    icon: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=120&h=120&fit=crop',
    description: 'Industry standard code editor in your browser with extensions and syntax highlighting.',
    isInstalled: false,
    embedUrl: 'https://vscode.dev',
    features: ['Full TypeScript/Python syntax', 'GitHub sync', 'Keyboard shortcut mapping'],
  },
  {
    id: 'wikipedia',
    name: 'Wikipedia Encyclopedia',
    category: 'Utilities',
    developer: 'Wikimedia Foundation',
    rating: 4.9,
    reviews: '89.4K',
    icon: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=120&h=120&fit=crop',
    description: 'The free encyclopedia with millions of articles across science, history, and culture.',
    isInstalled: true,
    embedUrl: 'https://en.wikipedia.org',
    features: ['Fast search', 'Ad-free reading', 'Multi-language knowledge base'],
  },
  {
    id: 'arcade-hub',
    name: 'Godly Arcade Hub',
    category: 'Games',
    developer: 'Lumin Games',
    rating: 4.9,
    reviews: '31.0K',
    icon: getAssetUrl('assets/icons/games.jpg'),
    description: 'Instant playable retro arcade games: 2048, Cyber Snake, and Minesweeper.',
    isInstalled: true,
    appId: 'games',
    features: ['Offline play', 'Zero load times', 'Global high scores'],
  },
];

export const AppStoreApp: React.FC = () => {
  const { openApp, openWebApp, installApp, uninstallApp, installedApps } = useOS();
  const [catalog, setCatalog] = useState<StoreApp[]>(() => {
    return STORE_CATALOG.map((item) => {
      const isInst = installedApps.some((inst) => inst.id === item.id || (item.appId && inst.appId === item.appId));
      return { ...item, isInstalled: isInst || item.isInstalled };
    });
  });

  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [activeAppModal, setActiveAppModal] = useState<StoreApp | null>(null);
  
  // Embedded proxy browser state
  const [embeddedApp, setEmbeddedApp] = useState<StoreApp | null>(null);
  const [activeProxyUrl, setActiveProxyUrl] = useState<string>('');

  const categories = ['All', 'Media', 'Design', 'Utilities', 'Games', 'Dev'];

  const filtered = catalog.filter((app) => {
    const matchCat = selectedCat === 'All' || app.category === selectedCat;
    const matchSearch =
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleInstallToggle = (targetApp: StoreApp) => {
    sound.playClick();
    const nextState = !targetApp.isInstalled;
    setCatalog((prev) =>
      prev.map((app) => (app.id === targetApp.id ? { ...app, isInstalled: nextState } : app))
    );

    if (nextState) {
      installApp({
        id: targetApp.id,
        name: targetApp.name,
        icon: targetApp.icon,
        category: targetApp.category,
        url: targetApp.embedUrl,
        appId: targetApp.appId,
      });
    } else {
      uninstallApp(targetApp.id);
    }
  };

  const handleLaunch = (app: StoreApp) => {
    sound.playOpen();
    if (app.appId) {
      openApp(app.appId, app.name, app.customUrl);
    } else if (app.embedUrl) {
      openWebApp(app.name, app.embedUrl, app.icon);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[var(--window-glass)] backdrop-blur-2xl text-slate-100 select-none overflow-hidden font-sans">
      {/* If viewing an embedded web app within the store */}
      {embeddedApp ? (
        <div className="flex-1 flex flex-col h-full w-full">
          {/* Top Bar with Frosted Glass */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-black/40 backdrop-blur-xl border-b border-white/10 flex-shrink-0 z-20">
            <div className="flex items-center gap-2">
              <img src={getAssetUrl(embeddedApp.icon)} alt="" className="w-5 h-5 rounded-md object-cover" />
              <span className="text-xs font-bold text-white font-mono">{embeddedApp.name}</span>
            </div>
            <button
              onClick={() => setEmbeddedApp(null)}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium transition-all"
            >
              Back to Store
            </button>
          </div>
          <div className="flex-1 w-full h-full overflow-hidden">
            <ServiceWorkerAppView
              url={activeProxyUrl}
              appName={embeddedApp.name}
              onClose={() => setEmbeddedApp(null)}
            />
          </div>
        </div>
      ) : (
        <>
          {/* Top Header Bar with Frosted Glass */}
          <div className="flex items-center justify-between px-6 py-3.5 bg-black/40 backdrop-blur-xl border-b border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-white/20">
                <ShoppingBag size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide font-mono">Godly Store</h2>
                <p className="text-[10px] text-slate-400">Discover and install verified apps directly to your desktop</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative w-64">
              <Search size={14} className="absolute left-3.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search apps, games, tools..."
                className="w-full bg-white/[0.06] border border-white/15 focus:border-purple-500/60 rounded-2xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all backdrop-blur-md"
              />
            </div>
          </div>

          {/* Main Browsable Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {/* Featured Showcase Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-950/70 via-indigo-950/60 to-slate-950/80 border border-white/15 p-7 flex items-center justify-between shadow-2xl backdrop-blur-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(168,85,247,0.25),transparent_60%)] pointer-events-none" />

              <div className="relative z-10 max-w-md space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30 font-mono inline-block">
                  Featured Streaming & Gaming
                </span>
                <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-md">
                  StreamFlix & GNMath Library
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Cinema on-demand and secondary massive game library running through the Ultraviolet Service Worker proxy.
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => handleLaunch(catalog[0])}
                    className="flex items-center gap-2 px-5 py-2.5 text-white rounded-2xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-95 border border-white/20"
                    style={{ background: 'var(--accent)', boxShadow: '0 8px 24px var(--accent-glow)' }}
                  >
                    <Tv size={14} />
                    Open StreamFlix
                  </button>
                  <button
                    onClick={() => { sound.playOpen(); openApp('games', 'vault'); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-semibold transition-all border border-white/10"
                  >
                    <Gamepad2 size={14} />
                    Open Game Vault (1,567)
                  </button>
                </div>
              </div>

              <div className="relative z-10 hidden sm:block w-36 h-36 rounded-3xl overflow-hidden border border-white/20 shadow-2xl shadow-purple-950/60 group">
                <img src={getAssetUrl(catalog[0].icon)} alt="Featured" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    sound.playClick();
                    setSelectedCat(cat);
                  }}
                  className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    selectedCat === cat
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-400/40'
                      : 'bg-white/[0.05] text-slate-400 hover:text-white hover:bg-white/[0.1] border border-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* App Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((app) => (
                <div
                  key={app.id}
                  className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 hover:border-purple-500/40 rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-purple-950/40 hover:-translate-y-1 hover:bg-white/[0.07] group shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                >
                  <div>
                    <div className="flex items-start gap-4">
                      <img
                        src={getAssetUrl(app.icon)}
                        alt={app.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-white/15 shadow-lg group-hover:scale-105 transition-transform duration-300 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors truncate">{app.name}</h4>
                        <p className="text-[11px] text-purple-400/90 font-medium">{app.developer}</p>
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-amber-400">
                          <Star size={12} fill="currentColor" />
                          <span className="font-bold">{app.rating}</span>
                          <span className="text-slate-500 text-[10px]">({app.reviews})</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300/80 mt-3.5 line-clamp-2 leading-relaxed">
                      {app.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-white/10">
                    <button
                      onClick={() => setActiveAppModal(app)}
                      className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                    >
                      More Info
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleInstallToggle(app)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          app.isInstalled
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-purple-600 text-white hover:bg-purple-500 shadow-md shadow-purple-600/20'
                        }`}
                      >
                        {app.isInstalled ? 'Installed' : 'Get'}
                      </button>

                      <button
                        onClick={() => handleLaunch(app)}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 border border-white/10"
                      >
                        Open
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Details Modal */}
          {activeAppModal && (
            <div
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-2xl flex items-center justify-center p-6"
              onClick={() => setActiveAppModal(null)}
            >
              <div
                className="relative max-w-lg w-full bg-zinc-900/95 border border-white/20 rounded-3xl shadow-2xl p-6 backdrop-blur-3xl"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setActiveAppModal(null)}
                  className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                >
                  <X size={16} />
                </button>

                <div className="flex items-center gap-4">
                  <img src={getAssetUrl(activeAppModal.icon)} alt="" className="w-16 h-16 rounded-2xl object-cover border border-white/20 shadow-xl" />
                  <div>
                    <h3 className="text-lg font-bold text-white">{activeAppModal.name}</h3>
                    <p className="text-xs text-purple-400">{activeAppModal.developer}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-400">
                      <Star size={12} fill="currentColor" />
                      <span className="font-bold">{activeAppModal.rating}</span>
                      <span className="text-slate-500">({activeAppModal.reviews} reviews)</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mt-4 leading-relaxed">{activeAppModal.description}</p>

                <div className="mt-4 space-y-1.5">
                  <h4 className="text-[11px] font-mono uppercase text-slate-400 font-bold">Key Features:</h4>
                  {activeAppModal.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                      <Check size={13} className="text-emerald-400" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                  <button
                    onClick={() => handleInstallToggle(activeAppModal)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/10"
                  >
                    {activeAppModal.isInstalled ? 'Uninstall from Desktop' : 'Install to Desktop'}
                  </button>
                  <button
                    onClick={() => {
                      handleLaunch(activeAppModal);
                      setActiveAppModal(null);
                    }}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30"
                  >
                    Launch Now
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
