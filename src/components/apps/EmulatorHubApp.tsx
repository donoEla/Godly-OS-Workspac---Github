import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Gamepad2,
  Upload,
  Play,
  RotateCcw,
  Maximize2,
  Camera,
  Save,
  Download,
  FolderOpen,
  Info,
  Sparkles,
  Layers,
  ChevronLeft,
  Pause,
  Key,
  Clock,
  Trash2,
  Cpu,
  Monitor,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { getAssetUrl } from '../../utils/assetHelper';

export interface RecentRomEntry {
  id: string;
  name: string;
  system: string;
  core: string;
  size: string;
  timestamp: number;
}

export interface SystemCoreConfig {
  id: string;
  name: string;
  core: string;
  extensions: string[];
  color: string;
  accentBg: string;
  description: string;
  badge: string;
}

export const SUPPORTED_SYSTEMS: SystemCoreConfig[] = [
  {
    id: 'gba',
    name: 'Game Boy Advance',
    core: 'mgba',
    extensions: ['.gba'],
    color: 'from-purple-500 to-indigo-600',
    accentBg: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    description: '32-Bit ARM7TDMI • mGBA WebAssembly core with full 60 FPS audio & hardware scaling',
    badge: '32-Bit GBA',
  },
  {
    id: 'snes',
    name: 'Super Nintendo',
    core: 'snes9x',
    extensions: ['.sfc', '.smc', '.snes'],
    color: 'from-blue-500 to-purple-600',
    accentBg: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    description: '16-Bit Super Famicom • Snes9x core with multi-channel SPC700 stereo audio',
    badge: '16-Bit SNES',
  },
  {
    id: 'nes',
    name: 'NES / Famicom',
    core: 'fceumm',
    extensions: ['.nes', '.fam'],
    color: 'from-red-500 to-amber-600',
    accentBg: 'bg-red-500/10 text-red-300 border-red-500/30',
    description: '8-Bit Ricoh 2A03 • FCEUmm core with pixel-perfect scanline & mapper support',
    badge: '8-Bit NES',
  },
  {
    id: 'gbc',
    name: 'Game Boy & GBC',
    core: 'gambatte',
    extensions: ['.gb', '.gbc'],
    color: 'from-emerald-500 to-teal-600',
    accentBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    description: '8-Bit Z80 Handheld • Gambatte core with custom color palettes & LCD simulation',
    badge: 'Handheld GB/GBC',
  },
  {
    id: 'genesis',
    name: 'Sega Genesis / MD',
    core: 'genesis_plus_gx',
    extensions: ['.md', '.gen', '.smd', '.bin'],
    color: 'from-sky-500 to-blue-700',
    accentBg: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
    description: '16-Bit Motorola 68000 • Genesis Plus GX core with Blast Processing YM2612 FM synth',
    badge: '16-Bit Genesis',
  },
  {
    id: 'n64',
    name: 'Nintendo 64',
    core: 'mupen64plus_next',
    extensions: ['.z64', '.n64', '.v64'],
    color: 'from-amber-500 to-orange-600',
    accentBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    description: '64-Bit Reality Coprocessor • Mupen64Plus-Next WebAssembly hardware rasterizer',
    badge: '64-Bit N64',
  },
  {
    id: 'nds',
    name: 'Nintendo DS',
    core: 'melonds',
    extensions: ['.nds'],
    color: 'from-pink-500 to-rose-600',
    accentBg: 'bg-pink-500/10 text-pink-300 border-pink-500/30',
    description: 'Dual Screen ARM9/ARM7 • MelonDS core with touch simulation and dual displays',
    badge: 'Dual Screen NDS',
  },
];

export function detectCoreForFile(filename: string, preferredCore?: string): { core: string; systemName: string } {
  if (preferredCore) {
    const match = SUPPORTED_SYSTEMS.find((s) => s.core === preferredCore);
    if (match) return { core: match.core, systemName: match.name };
  }
  const ext = '.' + (filename.split('.').pop()?.toLowerCase() || '');
  for (const sys of SUPPORTED_SYSTEMS) {
    if (sys.extensions.includes(ext)) {
      return { core: sys.core, systemName: sys.name };
    }
  }
  return { core: 'mgba', systemName: 'Auto (Game Boy Advance)' };
}

export const generateEmulatorSrcDoc = (core: string, fileName?: string) => `<!DOCTYPE html>
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
    #loading-overlay { position: absolute; inset: 0; background: #07090ef5; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 50; transition: opacity 0.3s ease; }
    .spinner { width: 44px; height: 44px; border: 3px solid rgba(168, 85, 247, 0.2); border-top-color: #a855f7; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .status-text { font-size: 14px; font-weight: 600; color: #e2e8f0; }
    .sub-text { font-size: 12px; color: #94a3b8; margin-top: 6px; font-family: monospace; }
    #error-box { display: none; position: absolute; inset: 20px; background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 12px; padding: 24px; color: #fca5a5; font-size: 13px; z-index: 60; overflow: auto; }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/nostalgist@0.9.1/dist/nostalgist.umd.js"></script>
</head>
<body>
  <div id="canvas-container">
    <div id="loading-overlay">
      <div class="spinner"></div>
      <div id="status" class="status-text">Booting WebAssembly Core...</div>
      <div class="sub-text" id="sub-status">Allocating memory heap and shader pipeline</div>
    </div>
    <div id="error-box"></div>
  </div>

  <script>
    let nostalgist = null;
    const loadingOverlay = document.getElementById('loading-overlay');
    const statusText = document.getElementById('status');
    const subStatusText = document.getElementById('sub-status');
    const errorBox = document.getElementById('error-box');

    function showError(err) {
      loadingOverlay.style.display = 'none';
      errorBox.style.display = 'block';
      errorBox.innerHTML = '<strong>Emulator Error:</strong><br><pre style="margin-top:8px; white-space:pre-wrap;">' + (err.stack || err.message || err) + '</pre>';
      window.parent.postMessage({ type: 'EMULATOR_ERROR', error: String(err) }, '*');
    }

    async function launchGameBuffer(targetCore, fileName, romBuffer) {
      try {
        if (nostalgist) {
          await nostalgist.exit({ removeCanvas: true });
          nostalgist = null;
        }

        loadingOverlay.style.display = 'flex';
        loadingOverlay.style.opacity = '1';
        errorBox.style.display = 'none';
        statusText.textContent = 'Launching ' + (targetCore || 'Core').toUpperCase() + '...';
        subStatusText.textContent = 'Transmitting ' + (fileName || 'ROM') + ' (' + (romBuffer ? Math.round(romBuffer.byteLength / 1024) + ' KB' : '') + ')';

        nostalgist = await Nostalgist.launch({
          core: targetCore,
          rom: {
            fileName: fileName || ('game.' + targetCore),
            fileContent: new Blob([romBuffer])
          },
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
        window.parent.postMessage({ type: 'EMULATOR_READY', core: targetCore }, '*');
      } catch (err) {
        showError(err);
      }
    }

    window.addEventListener('message', async (e) => {
      if (!e.data || !e.data.type) return;

      if (e.data.type === 'LAUNCH_BUFFER') {
        const { core, fileName, buffer } = e.data;
        launchGameBuffer(core, fileName, buffer);
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
          window.parent.postMessage({ type: 'STATE_LOADED' }, '*');
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

    window.parent.postMessage({ type: 'EMULATOR_IFRAME_READY' }, '*');
  </script>
</body>
</html>`;

export const EmulatorHubApp: React.FC = () => {
  const [selectedCoreOverride, setSelectedCoreOverride] = useState<string>('auto');
  const [activeGame, setActiveGame] = useState<{
    buffer: ArrayBuffer;
    filename: string;
    core: string;
    systemName: string;
    size: string;
  } | null>(null);

  const [isPaused, setIsPaused] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [showKeybindings, setShowKeybindings] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [recentRoms, setRecentRoms] = useState<RecentRomEntry[]>([]);

  const emulatorFrameRef = useRef<HTMLIFrameElement>(null);

  // Load recent ROMs list from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('godly_recent_emulator_roms');
      if (stored) {
        setRecentRoms(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLaunchRomFile = useCallback((file: File, manualCore?: string) => {
    sound.playOpen();
    const coreInfo = detectCoreForFile(file.name, manualCore === 'auto' ? undefined : manualCore);
    const sizeStr = (file.size / (1024 * 1024) > 1)
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (!buffer) return;

      const newEntry: RecentRomEntry = {
        id: 'rom-' + Date.now(),
        name: file.name,
        system: coreInfo.systemName,
        core: coreInfo.core,
        size: sizeStr,
        timestamp: Date.now(),
      };

      setRecentRoms((prev) => {
        const filtered = prev.filter((r) => r.name !== file.name);
        const updated = [newEntry, ...filtered].slice(0, 8);
        try {
          localStorage.setItem('godly_recent_emulator_roms', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      setActiveGame({
        buffer: buffer,
        filename: file.name,
        core: coreInfo.core,
        systemName: coreInfo.systemName,
        size: sizeStr,
      });
      setIsPaused(false);
    };
    reader.readAsArrayBuffer(file);
  }, []);

  // Listen to messages from Nostalgist runner inside iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!e.data || !e.data.type) return;

      if (e.data.type === 'EMULATOR_IFRAME_READY') {
        if (activeGame && emulatorFrameRef.current?.contentWindow) {
          emulatorFrameRef.current.contentWindow.postMessage(
            {
              type: 'LAUNCH_BUFFER',
              core: activeGame.core,
              fileName: activeGame.filename,
              buffer: activeGame.buffer,
            },
            '*'
          );
        }
      } else if (e.data.type === 'STATE_SAVED') {
        sound.playSuccess();
        try {
          if (activeGame && e.data.state) {
            // Save state snapshot in memory / session
            (window as any)[`godly_savestate_${activeGame.filename}`] = e.data.state;
          }
        } catch {}
        showToast('Save state successfully captured in memory!');
      } else if (e.data.type === 'STATE_LOADED') {
        sound.playSuccess();
        showToast('Save state loaded successfully!');
      } else if (e.data.type === 'EMULATOR_ERROR') {
        showToast(`Emulator error: ${e.data.error || 'Failed to initialize core'}`);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [activeGame]);

  const handleIframeLoad = () => {
    if (activeGame && emulatorFrameRef.current?.contentWindow) {
      emulatorFrameRef.current.contentWindow.postMessage(
        {
          type: 'LAUNCH_BUFFER',
          core: activeGame.core,
          fileName: activeGame.filename,
          buffer: activeGame.buffer,
        },
        '*'
      );
    }
  };

  const handleSaveState = () => {
    sound.playClick();
    emulatorFrameRef.current?.contentWindow?.postMessage({ type: 'SAVE_STATE' }, '*');
  };

  const handleLoadState = () => {
    sound.playClick();
    if (activeGame) {
      const state = (window as any)[`godly_savestate_${activeGame.filename}`];
      if (state) {
        emulatorFrameRef.current?.contentWindow?.postMessage({ type: 'LOAD_STATE', state: state }, '*');
      } else {
        showToast('No save state found for this session yet. Press "Save State" first.');
      }
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

  const handleRestart = () => {
    sound.playClick();
    emulatorFrameRef.current?.contentWindow?.postMessage({ type: 'RESTART' }, '*');
  };

  const handleFullscreen = () => {
    sound.playClick();
    if (emulatorFrameRef.current && emulatorFrameRef.current.requestFullscreen) {
      emulatorFrameRef.current.requestFullscreen();
    }
  };

  const handleExitGame = () => {
    sound.playClick();
    setActiveGame(null);
    setIsPaused(false);
  };

  const handleClearRecent = () => {
    sound.playClick();
    setRecentRoms([]);
    try {
      localStorage.removeItem('godly_recent_emulator_roms');
    } catch {}
    showToast('Recent games history cleared');
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#07090e] text-slate-100 select-none overflow-hidden font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-900/90 border border-purple-400/40 text-purple-100 text-xs font-semibold shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <Sparkles size={14} className="text-purple-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {activeGame ? (
        /* ── Active Emulation Screen ── */
        <div className="flex flex-col h-full w-full">
          {/* In-Game Top Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.08] bg-[#090b14]/95 backdrop-blur-xl shrink-0 z-20">
            <div className="flex items-center gap-3">
              <button
                onClick={handleExitGame}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/80 hover:text-white border border-white/10 text-xs font-semibold transition-all"
              >
                <ChevronLeft size={14} />
                <span>Emulator Hub</span>
              </button>
              <div className="h-4 w-[1px] bg-white/10" />
              <div className="flex items-center gap-2">
                <Gamepad2 size={16} className="text-purple-400" />
                <span className="text-xs font-bold text-white max-w-[200px] sm:max-w-xs truncate">
                  {activeGame.filename}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 font-mono border border-purple-500/30">
                  {activeGame.systemName}
                </span>
              </div>
            </div>

            {/* In-Game Actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSaveState}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/10 text-xs font-semibold transition-all"
                title="Save State Snapshot"
              >
                <Save size={13} className="text-emerald-400" />
                <span className="hidden sm:inline">Save State</span>
              </button>
              <button
                onClick={handleLoadState}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/10 text-xs font-semibold transition-all"
                title="Load Saved State"
              >
                <Download size={13} className="text-cyan-400" />
                <span className="hidden sm:inline">Load State</span>
              </button>
              <button
                onClick={handlePauseResume}
                className={`p-1.5 rounded-lg border border-white/10 transition-all ${
                  isPaused
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white'
                }`}
                title={isPaused ? 'Resume Game' : 'Pause Game'}
              >
                {isPaused ? <Play size={14} /> : <Pause size={14} />}
              </button>
              <button
                onClick={handleRestart}
                className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/10 transition-all"
                title="Restart Game"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => setShowKeybindings((v) => !v)}
                className={`p-1.5 rounded-lg border border-white/10 transition-all ${
                  showKeybindings
                    ? 'bg-purple-600/30 text-purple-300 border-purple-400/40'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white'
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

          {/* Keybindings Overlay Banner */}
          {showKeybindings && (
            <div className="bg-[#0b0d18]/95 border-b border-purple-500/20 px-5 py-2.5 flex items-center justify-between text-xs text-slate-300 z-20 backdrop-blur-xl">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="font-bold text-purple-300 flex items-center gap-1.5">
                  <Key size={13} />
                  Gamepad Controls:
                </span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[11px] text-purple-200">Arrow Keys</kbd> Move / D-Pad</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[11px] text-purple-200">Z</kbd> A Button</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[11px] text-purple-200">X</kbd> B Button</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[11px] text-purple-200">A</kbd> L Trigger</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[11px] text-purple-200">S</kbd> R Trigger</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[11px] text-purple-200">Enter</kbd> Start</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[11px] text-purple-200">Shift</kbd> Select</span>
              </div>
              <button onClick={() => setShowKeybindings(false)} className="text-white/50 hover:text-white text-xs px-2 py-1">✕ Close</button>
            </div>
          )}

          {/* WebAssembly Nostalgist Canvas Display */}
          <div className="flex-1 w-full h-full relative bg-[#000000] overflow-hidden">
            <iframe
              ref={emulatorFrameRef}
              srcDoc={generateEmulatorSrcDoc(activeGame.core, activeGame.filename)}
              onLoad={handleIframeLoad}
              className="w-full h-full border-0 block"
              allow="autoplay; fullscreen; gamepad; clipboard-read; clipboard-write; keyboard-map"
              allowFullScreen
              title={activeGame.filename}
            />
          </div>
        </div>
      ) : (
        /* ── Modern ROM Drag & Drop Emulation Studio ── */
        <div className="w-full h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-white/[0.08] bg-[#090b14]/90 backdrop-blur-xl flex items-center justify-between flex-wrap gap-4 shrink-0">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-600/30">
                  <Gamepad2 size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    Web Emulator Studio
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono border border-purple-500/30">
                      RetroArch WASM
                    </span>
                  </h1>
                  <p className="text-xs text-slate-400">
                    Client-side WebAssembly emulator. Drag & drop any ROM file to play instantly with save states and gamepad support.
                  </p>
                </div>
              </div>
            </div>

            {/* Core Override Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Core:</span>
              <select
                value={selectedCoreOverride}
                onChange={(e) => setSelectedCoreOverride(e.target.value)}
                className="bg-white/[0.05] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="auto" className="bg-[#0b0d18]">Auto-Detect from Extension</option>
                {SUPPORTED_SYSTEMS.map((s) => (
                  <option key={s.id} value={s.core} className="bg-[#0b0d18]">
                    {s.name} ({s.core})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Scrollable Studio Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
            {/* Retro Showcase Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl p-6 border border-purple-500/30 shadow-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-[#07090e]">
              <img
                src={getAssetUrl('assets/covers/emulator_retro_hub.jpg')}
                alt="Retro Arcade Hub"
                className="absolute inset-0 w-full h-full object-cover object-center opacity-40 brightness-90 hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#090b14] via-[#090b14]/80 to-transparent" />
              <div className="relative z-10 max-w-lg space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles size={11} />
                  Native WebAssembly Core
                </div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  Drag & Drop Your Own ROMs
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Emulate Game Boy Advance, SNES, NES, Game Boy, Sega Genesis, N64, and NDS directly in Godly OS with 60 FPS pixel rendering, zero telemetry, and instant memory save states.
                </p>
              </div>
            </div>

            {/* Main Interactive Dropzone */}
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
                if (file) handleLaunchRomFile(file, selectedCoreOverride);
              }}
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.gba,.nes,.snes,.smc,.sfc,.n64,.z64,.nds,.gbc,.gb,.bin,.md,.gen,.zip';
                input.onchange = (e: any) => {
                  const file = e.target.files?.[0];
                  if (file) handleLaunchRomFile(file, selectedCoreOverride);
                };
                input.click();
              }}
              className={`p-8 rounded-2xl border-2 border-dashed transition-all duration-200 text-center flex flex-col items-center justify-center cursor-pointer shadow-lg ${
                isDraggingFile
                  ? 'border-purple-400 bg-purple-600/20 scale-[1.01] shadow-purple-600/20'
                  : 'border-white/15 bg-white/[0.02] hover:border-purple-500/50 hover:bg-white/[0.04]'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center mb-3.5 shadow-inner">
                <Upload size={26} />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">
                Drop Any Game ROM Here or Click to Browse
              </h3>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-3">
                Supports Game Boy Advance (.gba), Super Nintendo (.sfc, .smc), NES (.nes), Game Boy (.gb, .gbc), Sega Genesis (.md, .bin), Nintendo 64 (.z64), and Nintendo DS (.nds).
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs font-semibold">
                <FolderOpen size={13} />
                <span>Select ROM from Device</span>
              </div>
            </div>

            {/* Supported Systems Specifications */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Cpu size={14} className="text-purple-400" />
                  Supported Systems & WASM Cores
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">7 WebAssembly Engines Loaded</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SUPPORTED_SYSTEMS.map((sys) => (
                  <div
                    key={sys.id}
                    className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-purple-500/30 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-white">{sys.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium border ${sys.accentBg}`}>
                          {sys.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                        {sys.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
                      <span>Extensions:</span>
                      <span className="text-slate-300">{sys.extensions.join(', ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Local Emulations */}
            {recentRoms.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Clock size={14} className="text-purple-400" />
                    Recent Local Emulations
                  </h3>
                  <button
                    onClick={handleClearRecent}
                    className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 size={12} />
                    <span>Clear History</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {recentRoms.map((rom) => (
                    <div
                      key={rom.id}
                      onClick={() => {
                        // Prompt user to select file to replay
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.' + (rom.name.split('.').pop() || '*');
                        input.onchange = (e: any) => {
                          const file = e.target.files?.[0];
                          if (file) handleLaunchRomFile(file, rom.core);
                        };
                        input.click();
                      }}
                      className="group p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-purple-500/40 cursor-pointer transition-all flex flex-col justify-between shadow-sm"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                            {rom.system}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{rom.size}</span>
                        </div>
                        <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                          {rom.name}
                        </h4>
                      </div>

                      <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Click to Select &amp; Run</span>
                        <Play size={12} className="text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
