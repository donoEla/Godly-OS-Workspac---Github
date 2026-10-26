import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu,
  Terminal,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  Layers,
  Copy,
  Check,
  Info,
  Server,
  Sparkles,
  Sliders,
  ChevronDown,
  Monitor,
  Code2,
  BookOpen,
  X,
  Play
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { initUvProxy, encodeUvUrl } from '../../utils/uvProxy';
import { initScramjetProxy, encodeScramjetUrl } from '../../utils/scramjetProxy';
import { VmIcon } from '../icons/VmIcon';

export type VmEnginePreset = 'webvm' | 'cheerpx-showcase' | 'custom';
export type VmTunnelMode = 'direct' | 'uv' | 'scramjet';

interface PresetConfig {
  id: VmEnginePreset;
  name: string;
  badge: string;
  description: string;
  url: string;
  defaultTunnel: VmTunnelMode;
}

const VM_PRESETS: PresetConfig[] = [
  {
    id: 'webvm',
    name: 'WebVM (Debian Linux x86)',
    badge: 'CheerpX x86',
    description: 'Full x86 Linux environment in WebAssembly with Xterm, gcc, node, python3, and apt.',
    url: 'https://webvm.io/',
    defaultTunnel: 'direct',
  },
  {
    id: 'cheerpx-showcase',
    name: 'CheerpX Labs Showcase',
    badge: 'LeaningTech',
    description: 'Interactive CheerpX showcases featuring Python 3, Node.js, and x86 virtualization modules.',
    url: 'https://labs.leaningtech.com/showcase?product=CheerpX',
    defaultTunnel: 'direct',
  },
];

interface CommandSnippet {
  category: string;
  cmd: string;
  desc: string;
}

const COMMAND_SNIPPETS: CommandSnippet[] = [
  { category: 'System Info', cmd: 'uname -a', desc: 'Display Linux kernel and CheerpX machine architecture' },
  { category: 'System Info', cmd: 'cat /proc/cpuinfo', desc: 'Inspect virtualized x86 CPU cores and flags' },
  { category: 'System Info', cmd: 'cat /etc/os-release', desc: 'View Debian distribution details and packages' },
  { category: 'Packages', cmd: 'sudo apt update', desc: 'Refresh Debian package index repositories' },
  { category: 'Packages', cmd: 'sudo apt install -y htop neofetch', desc: 'Install system monitoring and terminal art tools' },
  { category: 'Development', cmd: 'python3 -c "import sys; print(f\'Python {sys.version} on CheerpX\')"', desc: 'Run Python 3 script on x86 WebAssembly' },
  { category: 'Development', cmd: 'node -e "console.log(\'CheerpX Node runtime ready\')"', desc: 'Execute JavaScript under Node.js engine' },
  { category: 'Development', cmd: 'gcc --version', desc: 'Check GNU C Compiler installation' },
  { category: 'Network', cmd: 'curl -s wttr.in/NewYork?format=3', desc: 'Fetch weather report via WebVM HTTP stack' },
  { category: 'Network', cmd: 'curl -I https://www.google.com', desc: 'Test HTTP request reachability' },
];

export const VirtualMachineApp: React.FC = () => {
  const [activePreset, setActivePreset] = useState<VmEnginePreset>('webvm');
  const [tunnelMode, setTunnelMode] = useState<VmTunnelMode>('direct');
  const [customUrl, setCustomUrl] = useState<string>('https://webvm.io/');
  const [inputUrl, setInputUrl] = useState<string>('https://webvm.io/');
  const [iframeSrc, setIframeSrc] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [showDrawer, setShowDrawer] = useState<boolean>(false);
  const [showTunnelDropdown, setShowTunnelDropdown] = useState<boolean>(false);
  const [showPresetDropdown, setShowPresetDropdown] = useState<boolean>(false);
  const [ping, setPing] = useState<number>(16);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Initialize proxy listeners
  useEffect(() => {
    initUvProxy().catch(() => {});
    initScramjetProxy().catch(() => {});
  }, []);

  // Update dynamic ping simulator
  useEffect(() => {
    const timer = setInterval(() => {
      setPing(Math.floor(12 + Math.random() * 8));
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Compute final iframe source whenever preset, custom URL, or tunnel changes
  useEffect(() => {
    setLoading(true);
    let target = 'https://webvm.io/';

    if (activePreset === 'webvm') {
      target = 'https://webvm.io/';
    } else if (activePreset === 'cheerpx-showcase') {
      target = 'https://labs.leaningtech.com/showcase?product=CheerpX';
    } else {
      target = customUrl.trim() || 'https://webvm.io/';
    }

    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }

    let resolved = target;
    if (tunnelMode === 'uv') {
      resolved = encodeUvUrl(target);
    } else if (tunnelMode === 'scramjet') {
      resolved = encodeScramjetUrl(target);
    }

    setIframeSrc(resolved);
  }, [activePreset, tunnelMode, customUrl]);

  const handleSelectPreset = (preset: VmEnginePreset) => {
    sound.click();
    setActivePreset(preset);
    setShowPresetDropdown(false);
    if (preset === 'webvm') {
      setInputUrl('https://webvm.io/');
    } else if (preset === 'cheerpx-showcase') {
      setInputUrl('https://labs.leaningtech.com/showcase?product=CheerpX');
    }
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    sound.click();
    setActivePreset('custom');
    setCustomUrl(inputUrl);
  };

  const handleRefresh = () => {
    sound.click();
    setLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = iframeSrc;
    }
  };

  const handleOpenIsolatedWindow = () => {
    sound.click();
    let directTarget = 'https://webvm.io/';
    if (activePreset === 'cheerpx-showcase') {
      directTarget = 'https://labs.leaningtech.com/showcase?product=CheerpX';
    } else if (activePreset === 'custom') {
      directTarget = customUrl;
    }
    window.open(directTarget, '_blank', 'noopener,noreferrer');
  };

  const handleCopyCommand = (cmd: string) => {
    sound.click();
    navigator.clipboard.writeText(cmd).then(() => {
      setCopiedCmd(cmd);
      setTimeout(() => setCopiedCmd(null), 2000);
    });
  };

  const currentPresetData = VM_PRESETS.find((p) => p.id === activePreset);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#07090e] text-white select-none overflow-hidden font-sans">
      {/* Top Header / VM Control Deck */}
      <div className="flex-none flex items-center justify-between px-3 py-2 bg-black/60 backdrop-blur-xl border-b border-white/10 gap-3 z-30">
        {/* Preset Selector */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => {
                sound.click();
                setShowPresetDropdown(!showPresetDropdown);
                setShowTunnelDropdown(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold tracking-wide transition-all"
            >
              <VmIcon className="w-4 h-4 shadow-sm" />
              <span>{currentPresetData ? currentPresetData.name : 'Custom Machine'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-white/50" />
            </button>

            {showPresetDropdown && (
              <div className="absolute left-0 top-full mt-1.5 w-64 bg-[#0d1117]/95 backdrop-blur-2xl border border-white/15 rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-1">
                {VM_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`flex flex-col text-left px-3 py-2 rounded-lg transition-all ${
                      activePreset === preset.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'hover:bg-white/5 text-white/80'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>{preset.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/70">
                        {preset.badge}
                      </span>
                    </div>
                    <span className="text-[11px] text-white/50 line-clamp-1 mt-0.5">
                      {preset.description}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Architecture & JIT Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/5 text-[11px] text-white/60">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
            <span>x86 IA-32 JIT</span>
            <span className="text-white/20">|</span>
            <span>CheerpX Engine</span>
          </div>
        </div>

        {/* Address / Custom Target Bar */}
        <form
          onSubmit={handleApplyCustomUrl}
          className="flex-1 max-w-md hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 focus-within:border-cyan-500/50 transition-all text-xs"
        >
          <Terminal className="w-3.5 h-3.5 text-white/40 flex-none" />
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Target URL / WebVM disk..."
            className="w-full bg-transparent text-white/90 focus:outline-none font-mono text-[11px]"
          />
          {activePreset === 'custom' && (
            <button
              type="submit"
              className="px-2 py-0.5 rounded bg-cyan-500/30 text-cyan-300 text-[10px] hover:bg-cyan-500/50"
            >
              Load
            </button>
          )}
        </form>

        {/* Action Controls & Tunnel Selection */}
        <div className="flex items-center gap-1.5">
          {/* Tunnel Mode Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                sound.click();
                setShowTunnelDropdown(!showTunnelDropdown);
                setShowPresetDropdown(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/80 transition-all"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="capitalize">{tunnelMode}</span>
              <ChevronDown className="w-3 h-3 text-white/40" />
            </button>

            {showTunnelDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-[#0d1117]/95 backdrop-blur-2xl border border-white/15 rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-1">
                {(['direct', 'uv', 'scramjet'] as VmTunnelMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      sound.click();
                      setTunnelMode(mode);
                      setShowTunnelDropdown(false);
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs capitalize ${
                      tunnelMode === mode
                        ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                        : 'hover:bg-white/5 text-white/70'
                    }`}
                  >
                    <span>{mode === 'direct' ? 'Direct (Fastest)' : mode === 'uv' ? 'Ultraviolet SW' : 'Scramjet WASM'}</span>
                    {tunnelMode === mode && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reload / Reboot Machine */}
          <button
            onClick={handleRefresh}
            title="Reboot / Refresh VM"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Quick Commands & Cheatsheet Drawer Toggle */}
          <button
            onClick={() => {
              sound.click();
              setShowDrawer(!showDrawer);
            }}
            title="Terminal Cheatsheet & CheerpX Guide"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              showDrawer
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Cheatsheet</span>
          </button>

          {/* Open in Dedicated Window (Full Native Threaded SharedArrayBuffer throughput) */}
          <button
            onClick={handleOpenIsolatedWindow}
            title="Launch in Dedicated Tab (Maximum SharedArrayBuffer Performance)"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-cyan-300 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Execution Surface & Drawer Container */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex">
        {/* VM Sandbox Iframe Frame */}
        <div className="relative flex-1 w-full h-full bg-[#050608]">
          {loading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#07090e]/90 backdrop-blur-md">
              <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 mb-4 shadow-[0_0_30px_rgba(6,182,212,0.25)]">
                <Cpu className="w-8 h-8 text-cyan-400 animate-spin" />
              </div>
              <h3 className="text-base font-semibold tracking-wide text-white mb-1">
                Booting Virtual Machine
              </h3>
              <p className="text-xs text-white/50 mb-4">
                Instantiating CheerpX x86 JIT & WebAssembly runtime...
              </p>
              <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="w-full h-full bg-gradient-to-r from-cyan-500 to-indigo-500 animate-[pulse_1.5s_infinite]" />
              </div>
            </div>
          )}

          {iframeSrc && (
            <iframe
              ref={iframeRef}
              src={iframeSrc}
              title="Godly OS Virtual Machine"
              onLoad={() => setLoading(false)}
              allow="cross-origin-isolated; autoplay; clipboard-read; clipboard-write; fullscreen"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads"
              className="w-full h-full border-none bg-black"
            />
          )}
        </div>

        {/* Collapsible Quick Commands & Cheatsheet Sidebar */}
        {showDrawer && (
          <div className="w-80 flex-none bg-[#090d14]/95 backdrop-blur-2xl border-l border-white/10 flex flex-col z-30 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold tracking-wide uppercase text-white/90">
                  Command Cheatsheet
                </span>
              </div>
              <button
                onClick={() => {
                  sound.click();
                  setShowDrawer(false);
                }}
                className="p-1 rounded-md hover:bg-white/10 text-white/50 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* CheerpX Engine Info Card */}
            <div className="p-3 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex-none mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-medium text-white/90">CheerpX Virtualization</h4>
                  <p className="text-[11px] text-white/50 leading-relaxed mt-0.5">
                    Powered by Leaning Technologies. Executes unmodified x86 Linux binaries directly inside the browser using WebAssembly JIT compilation.
                  </p>
                </div>
              </div>
            </div>

            {/* Command Snippets List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {COMMAND_SNIPPETS.map((snippet, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-medium text-cyan-400 uppercase tracking-wider">
                      {snippet.category}
                    </span>
                    <button
                      onClick={() => handleCopyCommand(snippet.cmd)}
                      className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-all"
                    >
                      {copiedCmd === snippet.cmd ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="font-mono text-xs text-white/90 bg-black/40 px-2 py-1 rounded border border-white/5 select-all break-all">
                    {snippet.cmd}
                  </div>
                  <p className="text-[10px] text-white/40 mt-1 line-clamp-2">
                    {snippet.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Performance Footer Note */}
            <div className="p-3 border-t border-white/10 bg-black/40 text-[11px] text-white/50 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                In-Browser Sandboxed
              </span>
              <button
                onClick={handleOpenIsolatedWindow}
                className="text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Full Tab</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Deck */}
      <div className="flex-none h-6 px-3 bg-black/80 border-t border-white/10 flex items-center justify-between text-[11px] text-white/40 z-20">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-white/70">Machine Active</span>
          </span>
          <span className="text-white/20">|</span>
          <span>Target: {activePreset === 'webvm' ? 'webvm.io (Debian 12)' : activePreset === 'cheerpx-showcase' ? 'labs.leaningtech.com' : customUrl}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Tunnel: <strong className="text-white/60 uppercase">{tunnelMode}</strong></span>
          <span className="text-white/20">|</span>
          <span>Latency: <strong className="text-white/60">{ping}ms</strong></span>
        </div>
      </div>
    </div>
  );
};
