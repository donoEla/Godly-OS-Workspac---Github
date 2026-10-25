import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Gamepad2,
  Upload,
  Play,
  RotateCcw,
  Maximize2,
  Volume2,
  VolumeX,
  FastForward,
  Camera,
  Save,
  Download,
  FolderOpen,
  Info,
  Sparkles,
  Layers,
  ChevronLeft
} from 'lucide-react';
import { sound } from '../../utils/sound';

export type EmulatorSystem = 'all' | 'gba' | 'nes' | 'snes' | 'n64' | 'nds' | 'psx' | 'gbc';

export interface CuratedRom {
  id: string;
  title: string;
  system: EmulatorSystem;
  systemName: string;
  author: string;
  cover: string;
  romUrl: string;
  description: string;
  year: string;
}

export const CURATED_ROMS: CuratedRom[] = [
  {
    id: 'anguna-gba',
    title: 'Anguna: Warriors of Faith',
    system: 'gba',
    systemName: 'Game Boy Advance',
    author: 'Nathan Tolbert',
    cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=240&fit=crop',
    romUrl: 'https://cdn.jsdelivr.net/gh/RetroAchievements/RAIntegration@master/tests/sample_roms/anguna.gba',
    description: 'Acclaimed full-length homebrew action-adventure RPG for GBA with sprawling dungeons and boss battles.',
    year: '2008',
  },
  {
    id: '2048-gba',
    title: '2048 GBA Edition',
    system: 'gba',
    systemName: 'Game Boy Advance',
    author: 'Gabriele Cirulli / Port by sterlux',
    cover: 'https://images.unsplash.com/photo-1612287232269-231a44c74ea0?w=400&h=240&fit=crop',
    romUrl: 'https://cdn.jsdelivr.net/gh/sterlux/2048-gba@master/2048.gba',
    description: 'Butter-smooth GBA port of the classic tile sliding math puzzle with chiptune soundtracks.',
    year: '2014',
  },
  {
    id: 'celeste-classic-gba',
    title: 'Celeste Classic GBA',
    system: 'gba',
    systemName: 'Game Boy Advance',
    author: 'Maddy Thorson / Port by lemon32767',
    cover: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=400&h=240&fit=crop',
    romUrl: 'https://cdn.jsdelivr.net/gh/lemon32767/celeste-classic-gba@master/celeste.gba',
    description: 'Precision climbing platformer demake built from the ground up for the Game Boy Advance hardware.',
    year: '2020',
  },
  {
    id: 'micro-mages-nes',
    title: 'Micro Mages Demo',
    system: 'nes',
    systemName: 'Nintendo Entertainment System',
    author: 'Morphcat Games',
    cover: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=240&fit=crop',
    romUrl: 'https://cdn.jsdelivr.net/gh/morphcat/micromages@master/micromages_demo.nes',
    description: 'Masterclass 40KB vertical platformer pushing the NES PPU and APU beyond standard limits.',
    year: '2019',
  },
  {
    id: 'alter-ego-nes',
    title: 'Alter Ego NES',
    system: 'nes',
    systemName: 'Nintendo Entertainment System',
    author: 'Shiru / Denis Grachev',
    cover: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=400&h=240&fit=crop',
    romUrl: 'https://cdn.jsdelivr.net/gh/shiru8bit/alter-ego-nes@master/alter_ego.nes',
    description: 'Unique dual-character puzzle platformer where you control a hero and their mirrored phantom counterpart.',
    year: '2011',
  },
  {
    id: 'tobu-tobu-girl-gbc',
    title: 'Tobu Tobu Girl Deluxe',
    system: 'gbc',
    systemName: 'Game Boy Color',
    author: 'Tangram Games',
    cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=240&fit=crop',
    romUrl: 'https://cdn.jsdelivr.net/gh/tangramgames/tobutobugirl-deluxe@master/tobutobugirldeluxe.gbc',
    description: 'Adrenaline-fueled vertical action platformer with colorful GBC pixel aesthetics and upbeat soundtrack.',
    year: '2019',
  },
];

export const EmulatorHubApp: React.FC = () => {
  const [selectedSystem, setSelectedSystem] = useState<EmulatorSystem>('all');
  const [activeRom, setActiveRom] = useState<CuratedRom | null>(null);
  const [customRomName, setCustomRomName] = useState<string | null>(null);
  const [customRomUrl, setCustomRomUrl] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const emulatorFrameRef = useRef<HTMLIFrameElement>(null);

  const filteredRoms = CURATED_ROMS.filter((rom) => {
    const matchesSystem = selectedSystem === 'all' || rom.system === selectedSystem;
    const matchesQuery =
      rom.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rom.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rom.systemName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSystem && matchesQuery;
  });

  const getSystemCore = (system: EmulatorSystem, filename?: string): string => {
    if (filename) {
      const ext = filename.toLowerCase().split('.').pop();
      if (ext === 'gba') return 'gba';
      if (ext === 'nes') return 'nes';
      if (ext === 'snes' || ext === 'smc') return 'snes';
      if (ext === 'n64' || ext === 'z64') return 'n64';
      if (ext === 'nds') return 'nds';
      if (ext === 'gbc') return 'gbc';
      if (ext === 'gb') return 'gb';
      if (ext === 'iso' || ext === 'bin' || ext === 'cue') return 'psx';
    }
    return system === 'all' ? 'gba' : system;
  };

  const handleLaunchRom = (rom: CuratedRom) => {
    sound.playClick();
    setActiveRom(rom);
    setCustomRomName(null);
    setCustomRomUrl(null);
  };

  const handleCustomRomDrop = (file: File) => {
    sound.playClick();
    const system = getSystemCore('all', file.name) as EmulatorSystem;
    const blobUrl = URL.createObjectURL(file);
    setCustomRomName(file.name);
    setCustomRomUrl(blobUrl);
    setActiveRom({
      id: 'custom-' + Date.now(),
      title: file.name.replace(/\.[^/.]+$/, ''),
      system,
      systemName: system.toUpperCase(),
      author: 'Local ROM File',
      cover: '',
      romUrl: blobUrl,
      description: `Uploaded from disk (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
      year: new Date().getFullYear().toString(),
    });
  };

  const handleReload = () => {
    sound.playClick();
    if (emulatorFrameRef.current) {
      const src = emulatorFrameRef.current.src;
      emulatorFrameRef.current.src = '';
      setTimeout(() => {
        if (emulatorFrameRef.current) emulatorFrameRef.current.src = src;
      }, 60);
    }
  };

  const handleFullscreen = () => {
    sound.playClick();
    if (emulatorFrameRef.current) {
      if (emulatorFrameRef.current.requestFullscreen) {
        emulatorFrameRef.current.requestFullscreen();
      }
    }
  };

  // Generate lightweight self-contained EmulatorJS HTML loader
  const activeCore = activeRom ? getSystemCore(activeRom.system, customRomName || undefined) : 'gba';
  const activeUrl = activeRom ? activeRom.romUrl : '';

  const emulatorPlayerHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${activeRom?.title || 'Emulator'}</title>
  <style>
    body, html { margin:0; padding:0; width:100%; height:100%; background:#050508; overflow:hidden; display:flex; align-items:center; justify-content:center; }
    #game { width:100%; height:100%; }
    .loader { color:#a855f7; font-family:sans-serif; text-align:center; font-size:14px; }
  </style>
</head>
<body>
  <div id="game"></div>
  <script>
    window.EJS_player = '#game';
    window.EJS_core = '${activeCore}';
    window.EJS_gameUrl = '${activeUrl}';
    window.EJS_pathtodata = 'https://cdn.jsdelivr.net/gh/EmulatorJS/EmulatorJS@latest/data/';
    window.EJS_startOnLoaded = true;
    window.EJS_color = '#9333ea';
    window.EJS_fullscreenOnLoad = false;
  </script>
  <script src="https://cdn.jsdelivr.net/gh/EmulatorJS/EmulatorJS@latest/data/loader.js"></script>
</body>
</html>`;

  return (
    <div className="w-full h-full flex flex-col bg-[#07070d] text-white select-none overflow-hidden font-sans">
      {/* ── Active Game Player Mode ── */}
      {activeRom ? (
        <div className="w-full h-full flex flex-col bg-black">
          {/* Top Control Bar */}
          <div className="h-12 border-b border-white/[0.08] bg-[#0c0c16]/95 backdrop-blur-xl px-4 flex items-center justify-between shrink-0 z-20">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveRom(null);
                  if (customRomUrl) URL.revokeObjectURL(customRomUrl);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white transition-all active:scale-95 border border-white/10"
              >
                <ChevronLeft size={14} />
                <span>Back to Hub</span>
              </button>

              <div className="h-4 w-px bg-white/10" />

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-tight">{activeRom.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono border border-purple-500/30">
                  {activeCore.toUpperCase()} CORE • WASM
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  ● 60 FPS JIT
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setSpeed((s) => (s === 1 ? 2 : s === 2 ? 4 : 1));
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 ${
                  speed > 1
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-white/[0.04] border-white/10 text-white/70 hover:text-white'
                }`}
                title="Fast Forward Speed"
              >
                <FastForward size={13} />
                <span>{speed}x</span>
              </button>

              <button
                onClick={handleReload}
                className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/10 transition-all"
                title="Restart Game"
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
            </div>
          </div>

          {/* Emulator Display Screen */}
          <div className="flex-1 w-full h-full relative bg-[#000000] overflow-hidden">
            <iframe
              ref={emulatorFrameRef}
              srcDoc={emulatorPlayerHtml}
              className="w-full h-full border-0 block"
              allow="autoplay; fullscreen; gamepad; clipboard-read; clipboard-write; keyboard-map"
              allowFullScreen
              title={activeRom.title}
            />
          </div>
        </div>
      ) : (
        /* ── Hub Library & ROM Dropzone ── */
        <div className="w-full h-full flex flex-col overflow-hidden">
          {/* Hub Header */}
          <div className="p-5 border-b border-white/[0.08] bg-[#090a12]/90 backdrop-blur-xl flex items-center justify-between flex-wrap gap-4 shrink-0">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-600/30">
                  <Gamepad2 size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-white tracking-tight">Web Emulator Hub</h1>
                  <p className="text-xs text-slate-400">
                    High-performance WebAssembly emulation cores for GBA, NES, SNES, N64, NDS & PS1.
                  </p>
                </div>
              </div>
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-2.5">
              <input
                type="text"
                placeholder="Search games & homebrew..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 w-56"
              />
            </div>
          </div>

          {/* System Tabs Filter */}
          <div className="px-5 py-2.5 border-b border-white/[0.06] bg-black/30 flex items-center gap-1.5 overflow-x-auto shrink-0">
            {[
              { id: 'all', label: 'All Systems' },
              { id: 'gba', label: 'Game Boy Advance' },
              { id: 'nes', label: 'NES 8-Bit' },
              { id: 'snes', label: 'Super Nintendo' },
              { id: 'n64', label: 'Nintendo 64' },
              { id: 'nds', label: 'Nintendo DS' },
              { id: 'psx', label: 'PlayStation 1' },
              { id: 'gbc', label: 'Game Boy Color' },
            ].map((sys) => {
              const isCur = selectedSystem === sys.id;
              return (
                <button
                  key={sys.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedSystem(sys.id as EmulatorSystem);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    isCur
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-400/40'
                      : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {sys.label}
                </button>
              );
            })}
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
            {/* Drag & Drop ROM Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingFile(true);
              }}
              onDragLeave={() => setIsDraggingFile(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingFile(false);
                const file = e.dataTransfer.files[0];
                if (file) handleCustomRomDrop(file);
              }}
              className={`p-6 rounded-2xl border-2 border-dashed transition-all duration-200 text-center flex flex-col items-center justify-center cursor-pointer ${
                isDraggingFile
                  ? 'border-purple-500 bg-purple-600/15 scale-[1.01]'
                  : 'border-white/15 bg-white/[0.02] hover:border-purple-500/50 hover:bg-white/[0.04]'
              }`}
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.gba,.nes,.snes,.smc,.n64,.z64,.nds,.gbc,.gb,.bin,.iso,.zip';
                input.onchange = (e: any) => {
                  const file = e.target.files?.[0];
                  if (file) handleCustomRomDrop(file);
                };
                input.click();
              }}
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center mb-3 shadow">
                <Upload size={22} />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">
                Drag & Drop Any ROM to Play Instantly
              </h3>
              <p className="text-xs text-slate-400 max-w-md">
                Drop your own <code className="text-purple-300 font-mono">.gba</code>,{' '}
                <code className="text-purple-300 font-mono">.nes</code>,{' '}
                <code className="text-purple-300 font-mono">.snes</code>,{' '}
                <code className="text-purple-300 font-mono">.nds</code>,{' '}
                <code className="text-purple-300 font-mono">.n64</code>, or{' '}
                <code className="text-purple-300 font-mono">.gbc</code> files directly into Godly OS. Runs entirely client-side with WASM.
              </p>
            </div>

            {/* Curated Public-Domain & Homebrew Cards Grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className="text-purple-400" />
                  <span className="text-sm font-bold text-white">Curated Homebrew & Classic Library</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                    {filteredRoms.length} Available
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRoms.map((rom) => (
                  <div
                    key={rom.id}
                    onClick={() => handleLaunchRom(rom)}
                    className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-purple-500/50 rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between hover:shadow-xl hover:shadow-purple-600/10 hover:-translate-y-0.5"
                  >
                    <div>
                      <div className="w-full h-32 rounded-xl overflow-hidden mb-3 relative bg-slate-900">
                        <img
                          src={rom.cover}
                          alt={rom.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono font-bold text-purple-300 border border-white/10">
                          {rom.systemName}
                        </div>
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-white/70 border border-white/10">
                          {rom.year}
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                        {rom.title}
                      </h4>
                      <p className="text-[11px] text-purple-400 font-medium mb-1">{rom.author}</p>
                      <p className="text-xs text-slate-400 line-clamp-2">{rom.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-mono">WASM Ready</span>
                      <button className="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold shadow flex items-center gap-1 group-hover:brightness-110">
                        <Play size={11} fill="currentColor" />
                        <span>Play Now</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
