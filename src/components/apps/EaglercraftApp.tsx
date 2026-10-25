import React, { useState, useRef } from 'react';
import {
  Box,
  Play,
  RotateCcw,
  Maximize2,
  ChevronLeft,
  Sparkles,
  Search,
  Wifi,
  ExternalLink,
  Shield,
  Layers,
  Cpu,
  Star,
  Upload
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { getAssetUrl } from '../../utils/assetHelper';

export interface EaglercraftVersion {
  id: string;
  name: string;
  versionTag: string;
  category: 'modern' | 'classic' | 'client';
  categoryLabel: string;
  banner: string;
  url: string;
  description: string;
  year: string;
  features: string[];
  isFeatured?: boolean;
}

export const EAGLERCRAFT_VERSIONS: EaglercraftVersion[] = [
  {
    id: 'eagler-1-8-8',
    name: 'EaglercraftX 1.8.8',
    versionTag: 'v1.8.8 • Flagship Client',
    category: 'modern',
    categoryLabel: 'Modern Release',
    banner: getAssetUrl('assets/covers/eaglercraft_banner.jpg'),
    url: 'https://yummyfiles.github.io/Minecraft-Launcher/mc/1.8.8/',
    description: 'The definitive modern HTML5 Minecraft client. Supports cross-platform WebSocket multiplayer (ArchMC, Asspixel, Ayunboom, Zentic), OptiFine shaders, 3D capes, and 60 FPS JIT.',
    year: '2023',
    features: ['Multiplayer (WSS)', 'OptiFine Shaders', 'Custom Skins', 'Voice Chat'],
    isFeatured: true,
  },
  {
    id: 'eagler-1-8-8-wasm',
    name: 'EaglercraftX 1.8.8 WASM JIT',
    versionTag: 'v1.8.8 • WebAssembly',
    category: 'modern',
    categoryLabel: 'Modern Release',
    banner: getAssetUrl('assets/covers/eaglercraft_banner.jpg'),
    url: 'https://yummyfiles.github.io/Minecraft-Launcher/mc/1.8.8-wasm/',
    description: 'Pure WebAssembly compilation for ultra-low latency, smooth chunk loading, and optimized execution on low-end Chromebooks.',
    year: '2024',
    features: ['WASM JIT Engine', 'Low Latency', 'Chunk Boost', '60 FPS'],
    isFeatured: true,
  },
  {
    id: 'eagler-1-5-2',
    name: 'Eaglercraft 1.5.2',
    versionTag: 'v1.5.2 • Redstone Update',
    category: 'modern',
    categoryLabel: 'Modern Release',
    banner: getAssetUrl('assets/covers/eaglercraft_classic.jpg'),
    url: 'https://yummyfiles.github.io/Minecraft-Launcher/mc/1.5.2/',
    description: 'The historic Redstone Update with original hopper and comparator mechanics, quartz blocks, nether fortresses, and classic pre-1.9 spam PvP.',
    year: '2022',
    features: ['Original Redstone', 'Pre-1.9 PvP', 'Nether Quests', 'Survival'],
  },
  {
    id: 'eagler-1-12-2',
    name: 'Eaglercraft 1.12.2',
    versionTag: 'v1.12.2 • World of Color',
    category: 'modern',
    categoryLabel: 'Modern Release',
    banner: getAssetUrl('assets/covers/eaglercraft_color.jpg'),
    url: 'https://yummyfiles.github.io/Minecraft-Launcher/mc/1.12.2/',
    description: 'The World of Color update featuring concrete, glazed terracotta, colored beds, parrots, illusioners, and advanced crafting recipe book.',
    year: '2024',
    features: ['Concrete & Terracotta', 'Parrots', 'Recipe Book', 'New Colors'],
    isFeatured: true,
  },
  {
    id: 'eagler-1-12-2-wasm',
    name: 'Eaglercraft 1.12.2 WASM Edition',
    versionTag: 'v1.12.2 • WebAssembly',
    category: 'modern',
    categoryLabel: 'Modern Release',
    banner: getAssetUrl('assets/covers/eaglercraft_color.jpg'),
    url: 'https://yummyfiles.github.io/Minecraft-Launcher/mc/1.12.2-wasm/',
    description: 'Hardware accelerated WebAssembly compiler build for 1.12.2 featuring improved memory management.',
    year: '2024',
    features: ['WASM Compiler', 'Optimized Heap', 'World of Color', 'Fast Chunks'],
  },
  {
    id: 'eagler-b1-3',
    name: 'Eaglercraft Beta 1.3',
    versionTag: 'Beta 1.3 • Golden Era',
    category: 'classic',
    categoryLabel: 'Classic & Beta',
    banner: getAssetUrl('assets/covers/eaglercraft_classic.jpg'),
    url: 'https://yummyfiles.github.io/Minecraft-Launcher/mc/b1.3/',
    description: 'Pure 2011 Golden Age nostalgia. Classic neon green grass, old cobblestone, no hunger bar, old punch-tree physics, and C418 ambient music.',
    year: '2022',
    features: ['Neon Grass', 'No Hunger Bar', 'C418 Soundtrack', 'Classic Terrain'],
    isFeatured: true,
  },
  {
    id: 'eagler-b1-7-3',
    name: 'Eaglercraft Beta 1.7.3',
    versionTag: 'Beta 1.7.3 • Adventure Era',
    category: 'classic',
    categoryLabel: 'Classic & Beta',
    banner: getAssetUrl('assets/covers/eaglercraft_classic.jpg'),
    url: 'https://yummyfiles.github.io/Minecraft-Launcher/mc/b1.7.3/',
    description: 'The fan-favorite Minecraft Beta version. Introduces piston mechanics, shears, tall grass, and authentic beta world generation.',
    year: '2023',
    features: ['Piston Redstone', 'Pre-Adventure Combat', 'Old World Gen', 'Shears'],
  },
  {
    id: 'eagler-a1-2-6',
    name: 'Eaglercraft Alpha 1.2.6',
    versionTag: 'Alpha 1.2.6 • Halloween',
    category: 'classic',
    categoryLabel: 'Classic & Beta',
    banner: getAssetUrl('assets/covers/eaglercraft_nether.jpg'),
    url: 'https://yummyfiles.github.io/Minecraft-Launcher/mc/a1.2.6/',
    description: 'The eerie Alpha update that introduced the Nether dimension, portals, Ghasts, Zombie Pigmen, and Jack-o-Lanterns.',
    year: '2023',
    features: ['The Nether', 'Ghasts & Portals', 'Retro Alpha Lighting', 'Spooky Vibe'],
  },
  {
    id: 'eagler-c0-30',
    name: 'Eaglercraft Classic 0.30',
    versionTag: 'Classic 0.30 • InDev',
    category: 'classic',
    categoryLabel: 'Classic & Beta',
    banner: getAssetUrl('assets/covers/eaglercraft_classic.jpg'),
    url: 'https://yummyfiles.github.io/Minecraft-Launcher/mc/c0.30/',
    description: 'The original 2009 creative sandbox mode. 32 building blocks, instant block breaking, floating islands, and simple building.',
    year: '2022',
    features: ['32 Classic Blocks', 'Instant Mining', 'Creative Sandboxing', 'Human Test Mobs'],
  },
  {
    id: 'resent-client',
    name: 'Resent Client (PvP Tournament)',
    versionTag: '1.8.8 • Competitive PvP',
    category: 'client',
    categoryLabel: 'Modded & PvP',
    banner: getAssetUrl('assets/covers/eaglercraft_pvp.jpg'),
    url: 'https://yummyfiles.github.io/Minecraft-Launcher/mc/resentclient/',
    description: 'Competitive PvP edition with keystrokes HUD, CPS counter, reach indicator, custom crosshairs, toggle sprint, and performance boosts.',
    year: '2024',
    features: ['Keystrokes HUD', 'CPS Counter', 'Toggle Sprint', 'FPS Booster'],
    isFeatured: true,
  },
  {
    id: 'astra-client',
    name: 'Astra Client (Cosmetic & Shaders)',
    versionTag: '1.8.8 • Shaders & Capes',
    category: 'client',
    categoryLabel: 'Modded & PvP',
    banner: getAssetUrl('assets/covers/eaglercraft_pvp.jpg'),
    url: 'https://yummyfiles.github.io/Minecraft-Launcher/mc/astraclient/',
    description: 'Aesthetic cosmetic client featuring animated cape physics, dragon wings, motion blur, and integrated aesthetic shader presets.',
    year: '2024',
    features: ['Cosmetic Wings & Capes', 'Motion Blur', 'Shader Presets', 'Minimal UI'],
  },
  {
    id: 'eagler-forge',
    name: 'EaglerForge (Plugin Loader)',
    versionTag: 'Modded • JavaScript API',
    category: 'client',
    categoryLabel: 'Modded & PvP',
    banner: getAssetUrl('assets/covers/eaglercraft_color.jpg'),
    url: 'https://yummyfiles.github.io/Minecraft-Launcher/mc/eaglerforge/',
    description: 'Community mod loading client enabling custom client-side JavaScript mods, resource packs, mini-maps, and HUD customization.',
    year: '2024',
    features: ['Mod API Loader', 'Custom Addons', 'Resource Packs', 'Extensible'],
  },
];

export const EaglercraftApp: React.FC = () => {
  const [activeVersion, setActiveVersion] = useState<EaglercraftVersion | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'modern' | 'classic' | 'client'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDraggingHtml, setIsDraggingHtml] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const filteredVersions = EAGLERCRAFT_VERSIONS.filter((v) => {
    const matchesFilter = selectedFilter === 'all' || v.category === selectedFilter;
    const matchesQuery =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.versionTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.features.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesQuery;
  });

  const handleLaunch = (version: EaglercraftVersion) => {
    sound.playOpen();
    setActiveVersion(version);
  };

  const handleExit = () => {
    sound.playClick();
    setActiveVersion(null);
  };

  const handleReload = () => {
    sound.playClick();
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const handleFullscreen = () => {
    sound.playClick();
    if (iframeRef.current && iframeRef.current.requestFullscreen) {
      iframeRef.current.requestFullscreen();
    }
  };

  const handleCustomHtmlUpload = (file: File) => {
    sound.playOpen();
    const blobUrl = URL.createObjectURL(file);
    const customVersion: EaglercraftVersion = {
      id: 'custom-uploaded-' + Date.now(),
      name: file.name.replace(/\.html$/i, ''),
      versionTag: 'Custom Offline Build',
      category: 'client',
      categoryLabel: 'Custom File',
      banner: getAssetUrl('assets/covers/eaglercraft_banner.jpg'),
      url: blobUrl,
      description: `Loaded from your local machine: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB). Full offline execution.`,
      year: 'Local',
      features: ['Offline HTML', 'Local Saves', 'Full Performance', 'Single-File'],
      isFeatured: true,
    };
    setActiveVersion(customVersion);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#07090e] text-slate-100 select-none overflow-hidden font-sans">
      {activeVersion ? (
        <div className="flex flex-col h-full w-full">
          {/* Active Game Top Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.08] bg-[#0c1018]/95 backdrop-blur-xl shrink-0 z-20">
            <div className="flex items-center gap-3">
              <button
                onClick={handleExit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/80 hover:text-white border border-white/10 text-xs font-semibold transition-all"
              >
                <ChevronLeft size={14} />
                <span>Launcher Hub</span>
              </button>
              <div className="h-4 w-[1px] bg-white/10" />
              <div className="flex items-center gap-2">
                <Box size={16} className="text-emerald-400" />
                <span className="text-xs font-bold text-white">{activeVersion.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-mono border border-emerald-500/30">
                  {activeVersion.versionTag}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReload}
                className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/10 transition-all"
                title="Reload Client"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={handleFullscreen}
                className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/10 transition-all"
                title="Fullscreen"
              >
                <Maximize2 size={14} />
              </button>
              <a
                href={activeVersion.url}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/10 transition-all"
                title="Open in Tab"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {/* Unblocked Game Frame with Pointer-Lock & Full WebGL */}
          <div className="flex-1 w-full h-full relative bg-black overflow-hidden">
            <iframe
              ref={iframeRef}
              src={activeVersion.url}
              className="w-full h-full border-0 block"
              allow="autoplay; fullscreen; gamepad; pointer-lock; keyboard-map; clipboard-read; clipboard-write; cross-origin-isolated; microphone; camera"
              allowFullScreen
              title={activeVersion.name}
            />
          </div>
        </div>
      ) : (
        /* ── Eaglercraft Hub & Version Catalog ── */
        <div className="w-full h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-white/[0.08] bg-[#090b14]/90 backdrop-blur-xl flex items-center justify-between flex-wrap gap-4 shrink-0">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Box size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    Eaglercraft Studio
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                      12 Versions Available
                    </span>
                  </h1>
                  <p className="text-xs text-slate-400">
                    Full HTML5 & WebAssembly Minecraft clients running directly in Godly OS with WSS multiplayer servers.
                  </p>
                </div>
              </div>
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-2.5">
              <input
                type="text"
                placeholder="Search versions, mods, clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 w-56"
              />
            </div>
          </div>

          {/* Filter Pills Bar */}
          <div className="px-5 py-2.5 border-b border-white/[0.06] bg-black/30 flex items-center gap-1.5 overflow-x-auto shrink-0">
            {[
              { id: 'all', label: 'All Versions (12)' },
              { id: 'modern', label: 'Modern (1.8 - 1.12)' },
              { id: 'classic', label: 'Classic & Beta Nostalgia' },
              { id: 'client', label: 'PvP & Modded Clients' },
            ].map((f) => {
              const isCur = selectedFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedFilter(f.id as any);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    isCur
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 border border-emerald-400/40'
                      : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
            {/* Cinematic Minecraft Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl p-6 border border-emerald-500/30 shadow-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-[#07090e]">
              <img
                src={getAssetUrl('assets/covers/eaglercraft_banner.jpg')}
                alt="Minecraft Landscape"
                className="absolute inset-0 w-full h-full object-cover object-center opacity-40 brightness-90 hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#090b14] via-[#090b14]/80 to-transparent" />
              <div className="relative z-10 max-w-lg space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles size={11} />
                  Godly OS Minecraft Hub
                </div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  12 Playable Eaglercraft & Minecraft Editions
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Play full Java Edition builds directly in your browser with cross-server WebSocket multiplayer, OptiFine shaders, 60 FPS JIT engines, and retro terrain generation.
                </p>
              </div>
            </div>

            {/* Custom File Upload Dropzone for local HTML builds */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingHtml(true);
              }}
              onDragLeave={() => setIsDraggingHtml(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingHtml(false);
                const file = e.dataTransfer.files[0];
                if (file) handleCustomHtmlUpload(file);
              }}
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.html,.htm';
                input.onchange = (e: any) => {
                  const file = e.target.files?.[0];
                  if (file) handleCustomHtmlUpload(file);
                };
                input.click();
              }}
              className={`p-4 rounded-2xl border border-dashed transition-all duration-200 text-center flex items-center justify-between cursor-pointer ${
                isDraggingHtml
                  ? 'border-emerald-500 bg-emerald-600/15 scale-[1.01]'
                  : 'border-white/15 bg-white/[0.02] hover:border-emerald-500/50 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                  <Upload size={18} />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-bold text-white">Have your own Eaglercraft HTML or Offline Build?</h4>
                  <p className="text-[11px] text-slate-400">Drag & drop any single-file Eaglercraft (.html) build or click to browse</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 text-xs font-semibold">
                Upload & Play
              </span>
            </div>

            {/* Versions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVersions.map((v) => (
                <div
                  key={v.id}
                  onClick={() => handleLaunch(v)}
                  className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-emerald-500/50 rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between hover:shadow-xl hover:shadow-emerald-600/10 hover:-translate-y-0.5"
                >
                  <div>
                    <div className="w-full h-36 rounded-xl overflow-hidden mb-3 relative bg-slate-900">
                      <img
                        src={v.banner}
                        alt={v.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-mono font-bold text-emerald-300 border border-white/10">
                        {v.versionTag}
                      </div>
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-mono text-white/70 border border-white/10">
                        {v.year}
                      </div>
                      {v.isFeatured && (
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-emerald-600/90 backdrop-blur-md text-[9px] font-bold text-white uppercase tracking-wider flex items-center gap-1 shadow">
                          <Star size={10} fill="currentColor" />
                          <span>Popular</span>
                        </div>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {v.name}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 mb-3">{v.description}</p>

                    {/* Features Badges */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {v.features.map((feat, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-slate-300 border border-white/5"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <Wifi size={10} />
                      <span>Ready to Play</span>
                    </span>
                    <button className="px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-semibold shadow flex items-center gap-1 group-hover:brightness-110">
                      <Play size={11} fill="currentColor" />
                      <span>Launch</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
