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
  ChevronLeft,
  Pause,
  Key
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { getAssetUrl } from '../../utils/assetHelper';

export type EmulatorSystem = 'all' | 'gba' | 'nes' | 'snes' | 'gbc' | 'genesis' | 'n64' | 'psx';

export interface CuratedRom {
  id: string;
  title: string;
  system: EmulatorSystem;
  core: string;
  systemName: string;
  author: string;
  cover: string;
  romUrl: string;
  description: string;
  year: string;
}

export const CURATED_ROMS: CuratedRom[] = [
  {
    id: 'celeste-classic-gba',
    title: 'Celeste Classic GBA',
    system: 'gba',
    core: 'mgba',
    systemName: 'Game Boy Advance',
    author: 'Maddy Thorson / Port by lemon32767',
    cover: getAssetUrl('assets/covers/emulator_celeste.jpg'),
    romUrl: 'https://buildbot.libretro.com/assets/cores/Nintendo%20-%20GameBoy%20Advance/Celeste%20Classic%20%28v1.0%29.zip',
    description: 'Precision climbing platformer demake built from the ground up for the Game Boy Advance hardware.',
    year: '2020',
  },
  {
    id: 'super-tilt-bro-nes',
    title: 'Super Tilt Bro',
    system: 'nes',
    core: 'fceumm',
    systemName: 'NES 8-Bit',
    author: 'RogerBidon',
    cover: getAssetUrl('assets/covers/emulator_tilt_bro.jpg'),
    romUrl: 'https://buildbot.libretro.com/assets/cores/Nintendo%20-%20Nintendo%20Entertainment%20System/Super%20Tilt%20Bro%20%28USA%29.nes',
    description: 'Acclaimed 8-bit platform brawler with fluid physics and fast-paced competitive arena fighting.',
    year: '2022',
  },
  {
    id: 'alter-ego-nes',
    title: 'Alter Ego NES',
    system: 'nes',
    core: 'fceumm',
    systemName: 'NES 8-Bit',
    author: 'Shiru / Denis Grachev',
    cover: getAssetUrl('assets/covers/emulator_tilt_bro.jpg'),
    romUrl: 'https://buildbot.libretro.com/assets/cores/Nintendo%20-%20Nintendo%20Entertainment%20System/Alter%20Ego.nes',
    description: 'Unique dual-character puzzle platformer where you control a hero and their mirrored phantom counterpart.',
    year: '2011',
  },
  {
    id: 'spacegulls-nes',
    title: 'Spacegulls NES',
    system: 'nes',
    core: 'fceumm',
    systemName: 'NES 8-Bit',
    author: 'Morphcat Games',
    cover: getAssetUrl('assets/covers/emulator_tilt_bro.jpg'),
    romUrl: 'https://buildbot.libretro.com/assets/cores/Nintendo%20-%20Nintendo%20Entertainment%20System/Spacegulls%20%28v1.1%29.nes',
    description: 'High-octane platform adventure from the creators of Micro Mages with colorful 8-bit sprite art.',
    year: '2021',
  },
  {
    id: 'super-boss-gaiden-snes',
    title: 'Super Boss Gaiden SNES',
    system: 'snes',
    core: 'snes9x',
    systemName: 'Super Nintendo',
    author: 'ChronoMoogle',
    cover: getAssetUrl('assets/covers/emulator_snes_boss.jpg'),
    romUrl: 'https://buildbot.libretro.com/assets/cores/Nintendo%20-%20Super%20Nintendo%20Entertainment%20System/Super%20Boss%20Gaiden%20%28Japan%29.zip',
    description: 'Hilarious and action-packed satirical 16-bit beat em up built exclusively for the Super Nintendo.',
    year: '2016',
  },
  {
    id: 'tobu-tobu-girl-gbc',
    title: 'Tobu Tobu Girl Deluxe',
    system: 'gbc',
    core: 'gambatte',
    systemName: 'Game Boy Color',
    author: 'Tangram Games',
    cover: getAssetUrl('assets/covers/emulator_gameboy.jpg'),
    romUrl: 'https://buildbot.libretro.com/assets/cores/Nintendo%20-%20GameBoy/Tobu%20Tobu%20Girl.zip',
    description: 'Adrenaline-fueled vertical action platformer with vibrant GBC pixel aesthetics and upbeat chiptune soundtrack.',
    year: '2019',
  },
  {
    id: 'deadeus-gb',
    title: 'Deadeus Horror RPG',
    system: 'gbc',
    core: 'gambatte',
    systemName: 'Game Boy Classic',
    author: 'IZMA / Chris Beach',
    cover: getAssetUrl('assets/covers/emulator_gameboy.jpg'),
    romUrl: 'https://buildbot.libretro.com/assets/cores/Nintendo%20-%20GameBoy/Deadeus.gb',
    description: 'Critically acclaimed atmospheric psychological horror adventure featuring multiple branching endings.',
    year: '2020',
  },
];

export const generateEmulatorSrcDoc = (core: string, romUrl?: string, fileName?: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RetroArch WebAssembly Runner</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body, html { width: 100%; height: 100%; overflow: hidden; background: #07090e; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #f1f5f9; }
    #canvas-container { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; position: relative; }
    canvas { width: 100% !important; height: 100% !important; object-fit: contain; image-rendering: pixelated; outline: none; }
    #loading-overlay { position: absolute; inset: 0; background: #07090ef2; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 50; transition: opacity 0.3s ease; }
    .spinner { width: 44px; height: 44px; border: 3px solid rgba(139, 92, 246, 0.2); border-top-color: #a855f7; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .status-text { font-size: 14px; font-weight: 500; color: #cbd5e1; }
    .sub-text { font-size: 12px; color: #64748b; margin-top: 6px; }
    #error-box { display: none; position: absolute; inset: 20px; background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 12px; padding: 24px; color: #fca5a5; font-size: 13px; z-index: 60; overflow: auto; }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/nostalgist@0.9.1/dist/nostalgist.umd.js"></script>
</head>
<body>
  <div id="canvas-container">
    <div id="loading-overlay">
      <div class="spinner"></div>
      <div id="status" class="status-text">Booting RetroArch Core...</div>
      <div class="sub-text">Extracting WebAssembly shaders and memory mapping</div>
    </div>
    <div id="error-box"></div>
  </div>

  <script>
    let nostalgist = null;
    const loadingOverlay = document.getElementById('loading-overlay');
    const statusText = document.getElementById('status');
    const errorBox = document.getElementById('error-box');

    function showError(err) {
      loadingOverlay.style.display = 'none';
      errorBox.style.display = 'block';
      errorBox.innerHTML = '<strong>Emulator Error:</strong><br><pre style="margin-top:8px; white-space:pre-wrap;">' + (err.stack || err.message || err) + '</pre>';
      window.parent.postMessage({ type: 'EMULATOR_ERROR', error: String(err) }, '*');
    }

    async function launchGame(core, romUrl, fileName, romBuffer) {
      try {
        if (nostalgist) {
          await nostalgist.exit({ removeCanvas: true });
          nostalgist = null;
        }

        loadingOverlay.style.display = 'flex';
        loadingOverlay.style.opacity = '1';
        errorBox.style.display = 'none';
        statusText.textContent = 'Spinning up ' + core.toUpperCase() + ' core...';

        let romSource = romUrl;
        if (romBuffer) {
          romSource = {
            fileName: fileName || ('game.' + (core === 'mgba' ? 'gba' : core === 'snes9x' ? 'sfc' : 'nes')),
            fileContent: new Blob([romBuffer])
          };
        }

        nostalgist = await Nostalgist.launch({
          core: core,
          rom: romSource,
          element: '#canvas-container',
          style: { width: '100%', height: '100%' },
          retroarchCoreConfig: {
            video_smooth: false,
            video_scale_integer: false,
          },
          onStatusChange: (status) => {
            statusText.textContent = status;
          }
        });

        loadingOverlay.style.opacity = '0';
        setTimeout(() => { loadingOverlay.style.display = 'none'; }, 300);
        window.parent.postMessage({ type: 'EMULATOR_READY', core: core }, '*');
      } catch (err) {
        showError(err);
      }
    }

    window.addEventListener('message', async (e) => {
      if (!e.data || !e.data.type) return;

      if (e.data.type === 'LAUNCH') {
        const { core, romUrl, fileName } = e.data;
        launchGame(core, romUrl, fileName, null);
      } else if (e.data.type === 'LAUNCH_BUFFER') {
        const { core, fileName, buffer } = e.data;
        launchGame(core, null, fileName, buffer);
      } else if (e.data.type === 'SAVE_STATE') {
        if (!nostalgist) return;
        try {
          const state = await nostalgist.saveState();
          window.parent.postMessage({ type: 'STATE_SAVED', state: state }, '*');
        } catch (err) {
          window.parent.postMessage({ type: 'EMULATOR_ERROR', error: err.message }, '*');
        }
      } else if (e.data.type === 'LOAD_STATE') {
        if (!nostalgist || !e.data.state) return;
        try {
          await nostalgist.loadState(e.data.state);
        } catch (err) {
          window.parent.postMessage({ type: 'EMULATOR_ERROR', error: err.message }, '*');
        }
      } else if (e.data.type === 'PAUSE') {
        if (nostalgist) nostalgist.pause();
      } else if (e.data.type === 'RESUME') {
        if (nostalgist) nostalgist.resume();
      } else if (e.data.type === 'RESTART') {
        if (nostalgist) nostalgist.restart();
      }
    });

    ${romUrl ? `window.addEventListener('load', () => { launchGame(${JSON.stringify(core)}, ${JSON.stringify(romUrl)}, ${JSON.stringify(fileName || 'game')}, null); });` : `window.parent.postMessage({ type: 'EMULATOR_PAGE_LOADED' }, '*');`}
  </script>
</body>
</html>`;

export const EmulatorHubApp: React.FC = () => {
  const [selectedSystem, setSelectedSystem] = useState<EmulatorSystem>('all');
  const [activeRom, setActiveRom] = useState<CuratedRom | null>(null);
  const [customBuffer, setCustomBuffer] = useState<{ buffer: ArrayBuffer; filename: string; core: string } | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [showKeybindings, setShowKeybindings] = useState(false);

  const emulatorFrameRef = useRef<HTMLIFrameElement>(null);

  const filteredRoms = CURATED_ROMS.filter((rom) => {
    const matchesSystem = selectedSystem === 'all' || rom.system === selectedSystem;
    const matchesQuery =
      rom.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rom.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rom.systemName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSystem && matchesQuery;
  });

  const getSystemCore = (filename: string): { system: EmulatorSystem; core: string } => {
    const ext = filename.toLowerCase().split('.').pop();
    if (ext === 'gba') return { system: 'gba', core: 'mgba' };
    if (ext === 'nes') return { system: 'nes', core: 'fceumm' };
    if (ext === 'snes' || ext === 'smc' || ext === 'sfc') return { system: 'snes', core: 'snes9x' };
    if (ext === 'gb' || ext === 'gbc') return { system: 'gbc', core: 'gambatte' };
    if (ext === 'md' || ext === 'gen' || ext === 'bin') return { system: 'genesis', core: 'genesis_plus_gx' };
    if (ext === 'n64' || ext === 'z64') return { system: 'n64', core: 'mupen64plus_next' };
    if (ext === 'iso' || ext === 'chd') return { system: 'psx', core: 'pcsx_rearmed' };
    return { system: 'gba', core: 'mgba' };
  };

  const handleLaunchRom = (rom: CuratedRom) => {
    sound.playClick();
    setCustomBuffer(null);
    setActiveRom(rom);
  };

  const handleCustomRomDrop = async (file: File) => {
    sound.playClick();
    const { system, core } = getSystemCore(file.name);
    try {
      const buffer = await file.arrayBuffer();
      setCustomBuffer({ buffer, filename: file.name, core });
      setActiveRom({
        id: 'custom-' + Date.now(),
        title: file.name.replace(/\.[^/.]+$/, ''),
        system,
        core,
        systemName: system.toUpperCase(),
        author: 'Local File',
        cover: '',
        romUrl: '',
        description: `Loaded from disk (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
        year: new Date().getFullYear().toString(),
      });
    } catch (err) {
      console.error('Error reading custom ROM file:', err);
    }
  };

  // Post buffer when frame loads custom ROM
  const handleIframeLoad = () => {
    if (customBuffer && emulatorFrameRef.current?.contentWindow) {
      emulatorFrameRef.current.contentWindow.postMessage(
        {
          type: 'LAUNCH_BUFFER',
          core: customBuffer.core,
          buffer: customBuffer.buffer,
          filename: customBuffer.filename,
        },
        '*'
      );
    }
  };

  // Listen for save states from emulator
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'STATE_SAVED') {
        const key = `godly_game_save_emulator_${activeRom?.title || 'game'}`;
        try {
          localStorage.setItem(key, JSON.stringify(e.data.state));
          setSaveStatus('Game state saved to local storage!');
          sound.playSuccess();
          setTimeout(() => setSaveStatus(null), 3000);
        } catch (err) {
          console.warn('Failed to save state to localStorage:', err);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [activeRom]);

  const handleSaveState = () => {
    sound.playClick();
    emulatorFrameRef.current?.contentWindow?.postMessage({ type: 'SAVE_STATE' }, '*');
  };

  const handleLoadState = () => {
    sound.playClick();
    const key = `godly_game_save_emulator_${activeRom?.title || 'game'}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const state = JSON.parse(raw);
        emulatorFrameRef.current?.contentWindow?.postMessage({ type: 'LOAD_STATE', state }, '*');
        setSaveStatus('Restored save state!');
        sound.playSuccess();
        setTimeout(() => setSaveStatus(null), 3000);
      } catch (err) {
        console.warn('Failed to parse save state:', err);
      }
    } else {
      setSaveStatus('No save state found for this title.');
      setTimeout(() => setSaveStatus(null), 2500);
    }
  };

  const handlePauseResume = () => {
    sound.playClick();
    if (isPaused) {
      emulatorFrameRef.current?.contentWindow?.postMessage({ type: 'RESUME' }, '*');
      setIsPaused(false);
    } else {
      emulatorFrameRef.current?.contentWindow?.postMessage({ type: 'PAUSE' }, '*');
      setIsPaused(true);
    }
  };

  const handleReload = () => {
    sound.playClick();
    emulatorFrameRef.current?.contentWindow?.postMessage({ type: 'RESTART' }, '*');
  };

  const handleFullscreen = () => {
    sound.playClick();
    if (emulatorFrameRef.current?.requestFullscreen) {
      emulatorFrameRef.current.requestFullscreen();
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#07070d] text-white select-none overflow-hidden font-sans">
      {/* ── Active Game Player Screen ── */}
      {activeRom ? (
        <div className="w-full h-full flex flex-col bg-black">
          {/* Top Control Bar */}
          <div className="h-12 border-b border-white/[0.08] bg-[#0c0c16]/95 backdrop-blur-xl px-4 flex items-center justify-between shrink-0 z-20">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveRom(null);
                  setCustomBuffer(null);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white transition-all active:scale-95 border border-white/10"
              >
                <ChevronLeft size={14} />
                <span>Exit to Hub</span>
              </button>

              <div className="h-4 w-px bg-white/10" />

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-tight">{activeRom.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono border border-purple-500/30">
                  {activeRom.core.toUpperCase()} • RETROARCH WASM
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  ● 60 FPS JIT
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {saveStatus && (
                <span className="text-xs text-emerald-400 font-mono bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30 animate-pulse">
                  {saveStatus}
                </span>
              )}

              <button
                onClick={handleSaveState}
                className="px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-purple-600/30 border border-white/10 text-white text-xs font-semibold flex items-center gap-1 transition-all"
                title="Quick Save State (F2 / Click)"
              >
                <Save size={13} className="text-purple-400" />
                <span>Save</span>
              </button>

              <button
                onClick={handleLoadState}
                className="px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-purple-600/30 border border-white/10 text-white text-xs font-semibold flex items-center gap-1 transition-all"
                title="Load Save State (F4 / Click)"
              >
                <Download size={13} className="text-cyan-400" />
                <span>Load</span>
              </button>

              <button
                onClick={handlePauseResume}
                className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/10 transition-all"
                title={isPaused ? 'Resume Game' : 'Pause Game'}
              >
                {isPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} />}
              </button>

              <button
                onClick={handleReload}
                className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/10 transition-all"
                title="Restart ROM"
              >
                <RotateCcw size={14} />
              </button>

              <button
                onClick={() => setShowKeybindings((k) => !k)}
                className={`p-1.5 rounded-lg border transition-all ${
                  showKeybindings ? 'bg-purple-600 border-purple-400 text-white' : 'bg-white/[0.04] border-white/10 text-white/70 hover:text-white'
                }`}
                title="Controls & Keybindings"
              >
                <Key size={14} />
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

          {/* Controls overlay guide */}
          {showKeybindings && (
            <div className="bg-[#0b0c16]/95 border-b border-white/10 px-5 py-2.5 flex items-center justify-between text-xs text-slate-300 z-20">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="font-bold text-purple-300">Retro Controls:</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[11px]">Arrow Keys</kbd> Move / D-Pad</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[11px]">Z</kbd> A Button</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[11px]">X</kbd> B Button</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[11px]">A</kbd> L Trigger</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[11px]">S</kbd> R Trigger</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[11px]">Enter</kbd> Start</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[11px]">Shift</kbd> Select</span>
              </div>
              <button onClick={() => setShowKeybindings(false)} className="text-white/50 hover:text-white text-xs">✕</button>
            </div>
          )}

          {/* Emulator Display Screen */}
          <div className="flex-1 w-full h-full relative bg-[#000000] overflow-hidden">
            <iframe
              ref={emulatorFrameRef}
              srcDoc={
                activeRom
                  ? generateEmulatorSrcDoc(activeRom.core, activeRom.romUrl, activeRom.title)
                  : customBuffer
                  ? generateEmulatorSrcDoc(customBuffer.core, undefined, customBuffer.filename)
                  : undefined
              }
              onLoad={handleIframeLoad}
              className="w-full h-full border-0 block"
              allow="autoplay; fullscreen; gamepad; clipboard-read; clipboard-write; keyboard-map"
              allowFullScreen
              title={activeRom?.title || 'RetroArch Runner'}
            />
          </div>
        </div>
      ) : (
        /* ── Hub Library & Drag-and-Drop Dropzone ── */
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
                    High-performance WebAssembly RetroArch cores for GBA, NES, SNES, N64, NDS, PS1 & GBC.
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
              { id: 'gbc', label: 'Game Boy Color' },
              { id: 'genesis', label: 'Sega Genesis' },
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
            {/* Retro Gaming Showcase Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl p-6 border border-purple-500/30 shadow-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-[#07090e]">
              <img
                src={getAssetUrl('assets/covers/emulator_retro_hub.jpg')}
                alt="Retro Arcade Hub"
                className="absolute inset-0 w-full h-full object-cover object-center opacity-40 brightness-90 hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#090a12] via-[#090a12]/80 to-transparent" />
              <div className="relative z-10 max-w-lg space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles size={11} />
                  RetroArch WebAssembly Engine
                </div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  Play Authentic Classics & Drag-and-Drop ROMs
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Smooth 60 FPS hardware emulation running entirely in-browser with instantaneous save states, gamepad support, audio synth shaders, and zero latency.
                </p>
              </div>
            </div>

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
                input.accept = '.gba,.nes,.snes,.smc,.sfc,.n64,.z64,.nds,.gbc,.gb,.bin,.iso,.chd,.zip';
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
                <code className="text-purple-300 font-mono">.gbc</code> files directly into Godly OS. Runs entirely client-side with WebAssembly.
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
                      <span className="text-[10px] text-emerald-400 font-mono">● WASM Verified</span>
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
