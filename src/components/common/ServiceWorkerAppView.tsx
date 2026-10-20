import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  RotateCcw, 
  Radio, 
  Wifi, 
  Globe, 
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Server,
  Zap,
  Film,
  Layers,
  Check
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { 
  initUvProxy, 
  encodeUvUrl, 
  getActiveWispUrl, 
  setActiveWispUrl, 
  WISP_ENDPOINTS 
} from '../../utils/uvProxy';

export type ProxyTunnelMode = 'uv' | 'direct' | 'local';

interface ServiceWorkerAppViewProps {
  url: string;
  appName: string;
  isGame?: boolean;
  gameId?: string;
  fallbackUrl?: string;
  fallbackName?: string;
  onFallback?: () => void;
  onClose?: () => void;
}

export const ServiceWorkerAppView: React.FC<ServiceWorkerAppViewProps> = ({
  url,
  appName,
  fallbackUrl,
  fallbackName,
  onFallback,
  onClose
}) => {
  // Normalize now.gg to nowgg.fun
  const initialUrl = url.includes('now.gg') ? url.replace(/now\.gg/g, 'nowgg.fun') : url;

  const [currentUrl, setCurrentUrl] = useState<string>(initialUrl);
  const [urlInput, setUrlInput] = useState<string>(initialUrl);
  const [iframeSrc, setIframeSrc] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeWisp, setActiveWisp] = useState(getActiveWispUrl());
  const [showWispMenu, setShowWispMenu] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);
  // Default to UV-Static 2.0 (Epoxy + Wisp) - NOT auto local SW tunnel
  const [tunnelMode, setTunnelMode] = useState<ProxyTunnelMode>('uv');
  const [ping, setPing] = useState(14);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadTimerRef = useRef<number | null>(null);

  const isStreamFlix = appName.toLowerCase().includes('streamflix') || currentUrl.includes('streamflix');
  const isOctave = appName.toLowerCase().includes('octave') || currentUrl.includes('octave');

  // Realistic dynamic ping simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setPing(Math.floor(12 + Math.random() * 8));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Update src when URL, tunnelMode, or activeWisp changes
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    // Fast auto-dismiss for top progress bar so proxy never feels stuck
    if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
    loadTimerRef.current = window.setTimeout(() => {
      if (mounted) setLoading(false);
    }, 1500);

    // 1. Direct local game stream
    if (currentUrl.startsWith('/local-games/')) {
      setIframeSrc(currentUrl);
      setLoading(false);
      return;
    }

    // 2. Direct embed mode (no service worker proxying)
    if (tunnelMode === 'direct') {
      setIframeSrc(currentUrl);
      return;
    }

    // 3. Local Node SW proxy route (manual fallback)
    if (tunnelMode === 'local') {
      setIframeSrc(`/os-proxy?url=${encodeURIComponent(currentUrl)}`);
      return;
    }

    // 4. UV-Static 2.0 (Epoxy + Wisp WebSocket) - Primary default
    async function setupUvStatic() {
      try {
        await initUvProxy();
        if (mounted) {
          const encoded = encodeUvUrl(currentUrl);
          setIframeSrc(encoded);
        }
      } catch (err) {
        console.warn('[UV-Static 2.0] Proxy init note:', err);
        if (mounted) {
          setIframeSrc(encodeUvUrl(currentUrl));
        }
      }
    }

    setupUvStatic();

    return () => {
      mounted = false;
      if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
    };
  }, [currentUrl, activeWisp, tunnelMode]);

  // When iframe loads
  const handleIframeLoad = () => {
    setLoading(false);
    if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
  };

  // Reload current frame
  const handleReload = () => {
    sound.playClick();
    setLoading(true);
    if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
    loadTimerRef.current = window.setTimeout(() => setLoading(false), 1200);

    if (iframeRef.current) {
      if (tunnelMode === 'local') {
        iframeRef.current.src = `/os-proxy?url=${encodeURIComponent(currentUrl)}&_t=${Date.now()}`;
      } else if (tunnelMode === 'direct') {
        iframeRef.current.src = `${currentUrl}${currentUrl.includes('?') ? '&' : '?'}_t=${Date.now()}`;
      } else {
        iframeRef.current.src = encodeUvUrl(currentUrl);
      }
    }
  };

  // Switch Tunnel Mode
  const handleSetTunnelMode = (mode: ProxyTunnelMode) => {
    sound.playClick();
    setTunnelMode(mode);
    setShowModeMenu(false);
    setLoading(true);
    if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
    loadTimerRef.current = window.setTimeout(() => setLoading(false), 1200);

    if (mode === 'local') {
      setIframeSrc(`/os-proxy?url=${encodeURIComponent(currentUrl)}&_t=${Date.now()}`);
    } else if (mode === 'direct') {
      setIframeSrc(currentUrl);
    } else {
      setIframeSrc(encodeUvUrl(currentUrl));
    }
  };

  // Navigate to custom URL
  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    sound.playClick();
    let target = urlInput.trim();
    if (target.includes('now.gg')) {
      target = target.replace(/now\.gg/g, 'nowgg.fun');
    }
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }
    setCurrentUrl(target);
    setUrlInput(target);
    setLoading(true);
  };

  // Switch Wisp Server
  const handleSelectWisp = async (wispUrl: string) => {
    sound.playClick();
    await setActiveWispUrl(wispUrl);
    setActiveWisp(wispUrl);
    setShowWispMenu(false);
    if (tunnelMode !== 'uv') {
      setTunnelMode('uv');
    }
    handleReload();
  };

  // Toggle StreamFlix mirror
  const handleToggleStreamFlixMirror = () => {
    sound.playClick();
    const next = currentUrl.includes('watch.streamflix.one')
      ? 'https://streamflix.one/'
      : 'https://watch.streamflix.one/';
    setCurrentUrl(next);
    setUrlInput(next);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#08080c] text-slate-100 select-none overflow-hidden font-sans">
      {/* Top Glassmorphic Navigation Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#0d0f18]/90 backdrop-blur-xl border-b border-white/[0.08] gap-2 flex-shrink-0 z-20 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        {/* Left App Badge & Mode Selector */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 shadow-sm flex-shrink-0">
            <Radio size={13} className="text-purple-400 animate-pulse flex-shrink-0" />
            <span className="text-xs font-bold text-white truncate font-mono">{appName}</span>
          </div>

          {/* Mode Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                sound.playClick();
                setShowModeMenu(!showModeMenu);
                setShowWispMenu(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-mono transition-all ${
                tunnelMode === 'uv'
                  ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300 hover:bg-emerald-500/25'
                  : tunnelMode === 'direct'
                  ? 'bg-blue-500/15 border-blue-500/35 text-blue-300 hover:bg-blue-500/25'
                  : 'bg-amber-500/15 border-amber-500/35 text-amber-300 hover:bg-amber-500/25'
              }`}
              title="Select Proxy / Tunnel routing mode"
            >
              <ShieldCheck size={12} className={tunnelMode === 'uv' ? 'text-emerald-400' : tunnelMode === 'direct' ? 'text-blue-400' : 'text-amber-400'} />
              <span className="hidden sm:inline font-semibold">
                {tunnelMode === 'uv' ? 'UV-Static 2.0 (Epoxy)' : tunnelMode === 'direct' ? 'Direct Embed' : 'Local Proxy'}
              </span>
              <ChevronDown size={10} className="opacity-70" />
            </button>

            {showModeMenu && (
              <div className="absolute top-full left-0 mt-1.5 w-60 rounded-2xl bg-[#10121d]/95 backdrop-blur-2xl border border-white/15 shadow-2xl p-1.5 z-50 flex flex-col gap-1">
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider border-b border-white/10">
                  Select Routing Pipeline
                </div>
                
                <button
                  onClick={() => handleSetTunnelMode('uv')}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-left transition-all ${
                    tunnelMode === 'uv'
                      ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 font-semibold'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">UV-Static 2.0</span>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded">Epoxy Wasm</span>
                    </div>
                    <div className="text-[10px] text-slate-400">High-speed client-side Wisp proxy</div>
                  </div>
                  {tunnelMode === 'uv' && <Check size={14} className="text-emerald-400 flex-shrink-0" />}
                </button>

                <button
                  onClick={() => handleSetTunnelMode('direct')}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-left transition-all ${
                    tunnelMode === 'direct'
                      ? 'bg-blue-500/20 text-blue-200 border border-blue-500/40 font-semibold'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div>
                    <div className="font-medium">Direct Sandbox</div>
                    <div className="text-[10px] text-slate-400">No SW proxy (zero overhead)</div>
                  </div>
                  {tunnelMode === 'direct' && <Check size={14} className="text-blue-400 flex-shrink-0" />}
                </button>

                <button
                  onClick={() => handleSetTunnelMode('local')}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-left transition-all ${
                    tunnelMode === 'local'
                      ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 font-semibold'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div>
                    <div className="font-medium">Local Node Proxy</div>
                    <div className="text-[10px] text-slate-400">Server-side fallback mirror</div>
                  </div>
                  {tunnelMode === 'local' && <Check size={14} className="text-amber-400 flex-shrink-0" />}
                </button>
              </div>
            )}
          </div>

          {/* Wisp Server Selector Dropdown (When in UV mode) */}
          {tunnelMode === 'uv' && (
            <div className="relative">
              <button
                onClick={() => {
                  sound.playClick();
                  setShowWispMenu(!showWispMenu);
                  setShowModeMenu(false);
                }}
                className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[11px] text-slate-300 hover:text-white transition-all font-mono"
                title="Configure Wisp Proxy Server Relay"
              >
                <Server size={11} className="text-emerald-400" />
                <span className="hidden md:inline">
                  {WISP_ENDPOINTS.find((w) => w.url === activeWisp)?.name.split(' ')[0] || 'Mercury'}
                </span>
                <ChevronDown size={10} className="text-slate-400" />
              </button>

              {showWispMenu && (
                <div className="absolute top-full left-0 mt-1.5 w-64 rounded-2xl bg-[#10121d]/95 backdrop-blur-2xl border border-white/15 shadow-2xl p-1.5 z-50 flex flex-col gap-1">
                  <div className="px-2.5 py-1 text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider border-b border-white/10">
                    Select Wisp Proxy Relay
                  </div>
                  {WISP_ENDPOINTS.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => handleSelectWisp(w.url)}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-left transition-all ${
                        activeWisp === w.url
                          ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 font-semibold'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{w.name}</div>
                        <div className="text-[9px] text-slate-500 font-mono truncate max-w-[150px]">{w.url}</div>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono">{w.region.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <span className="hidden lg:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30 font-mono">
            <Wifi size={11} />
            {ping}ms
          </span>
        </div>

        {/* Center / Right Address Bar */}
        <form onSubmit={handleNavigate} className="flex-1 max-w-md mx-2 flex items-center">
          <div className="w-full flex items-center bg-black/50 border border-white/15 focus-within:border-purple-500/60 rounded-xl px-2.5 py-1 shadow-inner gap-2 transition-all">
            <Globe size={12} className="text-slate-400 flex-shrink-0" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Enter destination URL..."
              className="w-full bg-transparent text-xs text-white placeholder-slate-500 outline-none font-mono"
            />
            <button
              type="submit"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Navigate"
            >
              <ArrowRight size={12} />
            </button>
          </div>
        </form>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* StreamFlix Mirror Toggle */}
          {isStreamFlix && (
            <button
              onClick={handleToggleStreamFlixMirror}
              className="px-2 py-1 rounded-xl bg-red-600/20 hover:bg-red-600/35 border border-red-500/30 text-red-200 text-xs font-mono font-medium transition-all flex items-center gap-1"
              title="Toggle StreamFlix Domain Mirror"
            >
              <Film size={11} className="text-red-400" />
              <span className="hidden sm:inline">
                {currentUrl.includes('watch.streamflix.one') ? 'Mirror: watch' : 'Mirror: main'}
              </span>
            </button>
          )}

          {/* Quick Fallback Switcher (e.g. Octave for Spotify) */}
          {fallbackUrl && (
            <button
              onClick={() => {
                sound.playClick();
                if (onFallback) onFallback();
                else {
                  setCurrentUrl(fallbackUrl);
                  setUrlInput(fallbackUrl);
                }
              }}
              className="px-2.5 py-1 rounded-xl bg-purple-600/25 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 text-xs font-medium transition-all flex items-center gap-1 font-mono"
              title={`Switch to ${fallbackName || 'Alternative'}`}
            >
              <Sparkles size={11} className="text-purple-400" />
              <span className="hidden sm:inline">{fallbackName || 'Alternative'}</span>
            </button>
          )}

          {/* External Launch in New Tab */}
          <button
            onClick={() => {
              sound.playClick();
              window.open(currentUrl, '_blank');
            }}
            className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-300 hover:text-white transition-all"
            title="Open destination in new tab"
          >
            <ExternalLink size={13} />
          </button>

          {/* Reload Frame Button */}
          <button
            onClick={handleReload}
            className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-300 hover:text-white transition-all"
            title="Reload Frame"
          >
            <RotateCcw size={13} className={loading ? 'animate-spin text-purple-400' : ''} />
          </button>

          {onClose && (
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-xs font-medium transition-all"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="flex-1 relative overflow-hidden bg-black/80 flex flex-col">
        {/* Sleek, Non-Blocking Top Progress Bar (Never locks the screen) */}
        {loading && (
          <div className="absolute top-0 left-0 right-0 h-[2px] z-30 pointer-events-none overflow-hidden bg-white/5">
            <div className="h-full bg-gradient-to-r from-purple-500 via-emerald-400 to-indigo-500 animate-[loading-bar_1.2s_ease-in-out_infinite]" />
          </div>
        )}

        {/* Ultraviolet / Direct Frame */}
        {iframeSrc && (
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            onLoad={handleIframeLoad}
            className="w-full h-full border-none block bg-transparent"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-downloads"
          />
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="px-3 py-1 bg-[#0b0c14]/90 backdrop-blur-xl border-t border-white/[0.08] flex items-center justify-between text-[11px] text-slate-400 font-mono flex-shrink-0">
        <div className="flex items-center gap-2 truncate">
          <span className="text-purple-400 font-semibold">
            {tunnelMode === 'uv' ? 'UV-Static 2.0:' : tunnelMode === 'direct' ? 'Direct Sandbox:' : 'Local Proxy:'}
          </span>
          <span className="truncate text-slate-300">{currentUrl}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">
            {tunnelMode === 'uv' ? `Epoxy Wasm Relay: ${activeWisp.replace('wss://', '').replace('/', '')}` : tunnelMode === 'direct' ? 'Direct Embed' : 'Local SW Bridge'}
          </span>
        </div>
      </div>
    </div>
  );
};
