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
  initSwBridgeProxy,
  encodeSwBridgeUrl,
  getActiveWispUrl, 
  setActiveWispUrl, 
  WISP_ENDPOINTS 
} from '../../utils/uvProxy';
import { 
  initScramjetProxy, 
  encodeScramjetUrl 
} from '../../utils/scramjetProxy';
import { getAssetUrl } from '../../utils/assetHelper';
import { fetchGameHtml } from '../../utils/gameLoader';

import { useOS } from '../../context/OSContext';

export type ProxyTunnelMode = 'scramjet' | 'uv' | 'sw' | 'direct' | 'local';

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
  const { openApp } = useOS();
  // Normalize now.gg to nowgg.fun
  const initialUrl = url.includes('now.gg') ? url.replace(/now\.gg/g, 'nowgg.fun') : url;

  const [currentUrl, setCurrentUrl] = useState<string>(initialUrl);
  const [urlInput, setUrlInput] = useState<string>(initialUrl);
  const [iframeSrc, setIframeSrc] = useState<string>('');
  const [localGameSrcDoc, setLocalGameSrcDoc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);
  const [activeWisp, setActiveWisp] = useState(getActiveWispUrl());
  const [showWispMenu, setShowWispMenu] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);
  // Default to UV-Static 2.0 (Epoxy + Wisp)
  const [tunnelMode, setTunnelMode] = useState<ProxyTunnelMode>('uv');
  const [ping, setPing] = useState(14);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadTimerRef = useRef<number | null>(null);
  const timeoutTimerRef = useRef<number | null>(null);

  const MOVIES_MIRRORS = [
    'https://1337x.to/',
    'https://1337x.st/',
    'https://x1337x.ws/',
    'https://x1337x.eu/',
    'https://x1337x.se/',
    'https://x1337x.cc/',
  ];

  const isMovies =
    appName.toLowerCase().includes('movies') ||
    appName.toLowerCase().includes('streamflix') ||
    currentUrl.includes('1337x') ||
    currentUrl.includes('streamflix');
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
    setIframeLoaded(false);
    setShowTroubleshoot(false);

    // Fast progress bar dismissal
    if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
    loadTimerRef.current = window.setTimeout(() => {
      if (mounted) setLoading(false);
    }, 2000);

    // Auto-detect if app might be blocked or taking too long (e.g. 4 seconds)
    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    timeoutTimerRef.current = window.setTimeout(() => {
      if (mounted && !iframeLoaded) {
        setShowTroubleshoot(true);
      }
    }, 4500);

    // 1. Direct local game stream (fetched and unwrapped via srcDoc)
    if (currentUrl.startsWith('/local-games/') || currentUrl.includes('/local-games/')) {
      fetchGameHtml(currentUrl)
        .then((html) => {
          if (mounted) {
            setLocalGameSrcDoc(html);
            setIframeSrc('');
            setLoading(false);
            setIframeLoaded(true);
          }
        })
        .catch((err) => {
          console.error('Failed to load local game in ServiceWorkerAppView:', err);
          if (mounted) {
            setLocalGameSrcDoc(null);
            setLoading(false);
            setIframeLoaded(true);
          }
        });
      return () => {
        mounted = false;
      };
    }
    setLocalGameSrcDoc(null);

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

    // 4. Scramjet Static v2.0 (Fast WASM + BareWorker / Wisp)
    if (tunnelMode === 'scramjet') {
      async function setupScramjet() {
        try {
          await initScramjetProxy(activeWisp);
          if (mounted) {
            setIframeSrc(encodeScramjetUrl(currentUrl));
          }
        } catch (err) {
          console.warn('[Scramjet Static] Proxy init error:', err);
          if (mounted) {
            setIframeSrc(encodeScramjetUrl(currentUrl));
          }
        }
      }
      setupScramjet();
      return () => {
        mounted = false;
        if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
        if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
      };
    }

    // 5. Root Service Worker Bridge (sw.js & bareworker.js)
    if (tunnelMode === 'sw') {
      async function setupSwBridge() {
        try {
          await initSwBridgeProxy();
          if (mounted) {
            setIframeSrc(encodeSwBridgeUrl(currentUrl));
          }
        } catch (err) {
          console.warn('[SW Bridge] Proxy init error:', err);
          if (mounted) {
            setIframeSrc(encodeSwBridgeUrl(currentUrl));
          }
        }
      }
      setupSwBridge();
      return () => {
        mounted = false;
        if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
        if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
      };
    }

    // 6. UV-Static 2.0 (Epoxy + Wisp WebSocket)
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
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    };
  }, [currentUrl, activeWisp, tunnelMode]);

  // When iframe loads
  const handleIframeLoad = () => {
    setLoading(false);
    setIframeLoaded(true);
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
      } else if (tunnelMode === 'scramjet') {
        iframeRef.current.src = encodeScramjetUrl(currentUrl);
      } else if (tunnelMode === 'sw') {
        iframeRef.current.src = encodeSwBridgeUrl(currentUrl);
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
    } else if (mode === 'scramjet') {
      setIframeSrc(encodeScramjetUrl(currentUrl));
    } else if (mode === 'sw') {
      setIframeSrc(encodeSwBridgeUrl(currentUrl));
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

  // Cycle Movies / 1337x mirror
  const handleCycleMoviesMirror = () => {
    sound.playClick();
    const curr = currentUrl.toLowerCase();
    const currentIndex = MOVIES_MIRRORS.findIndex((m) => {
      try {
        return curr.includes(new URL(m).hostname);
      } catch {
        return false;
      }
    });
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % MOVIES_MIRRORS.length : 0;
    const next = MOVIES_MIRRORS[nextIndex];
    setCurrentUrl(next);
    setUrlInput(next);
  };

  // Cycle Wisp Relay
  const handleCycleWisp = async () => {
    sound.playClick();
    const currentIndex = WISP_ENDPOINTS.findIndex((w) => w.url === activeWisp);
    const nextIndex = (currentIndex + 1) % WISP_ENDPOINTS.length;
    const nextWisp = WISP_ENDPOINTS[nextIndex].url;
    await setActiveWispUrl(nextWisp);
    setActiveWisp(nextWisp);
    handleReload();
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
                tunnelMode === 'scramjet'
                  ? 'bg-violet-500/15 border-violet-500/35 text-violet-300 hover:bg-violet-500/25'
                  : tunnelMode === 'sw'
                  ? 'bg-teal-500/15 border-teal-500/35 text-teal-300 hover:bg-teal-500/25'
                  : tunnelMode === 'uv'
                  ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300 hover:bg-emerald-500/25'
                  : tunnelMode === 'direct'
                  ? 'bg-blue-500/15 border-blue-500/35 text-blue-300 hover:bg-blue-500/25'
                  : 'bg-amber-500/15 border-amber-500/35 text-amber-300 hover:bg-amber-500/25'
              }`}
              title="Select Proxy / Tunnel routing mode"
            >
              <ShieldCheck size={12} className={
                tunnelMode === 'scramjet' ? 'text-violet-400' :
                tunnelMode === 'sw' ? 'text-teal-400' :
                tunnelMode === 'uv' ? 'text-emerald-400' :
                tunnelMode === 'direct' ? 'text-blue-400' : 'text-amber-400'
              } />
              <span className="hidden sm:inline font-semibold">
                {tunnelMode === 'scramjet' ? 'Scramjet v2.0' :
                 tunnelMode === 'sw' ? 'SW Bridge (sw.js)' :
                 tunnelMode === 'uv' ? 'UV-Static 2.0' :
                 tunnelMode === 'direct' ? 'Direct Embed' : 'Local Proxy'}
              </span>
              <ChevronDown size={10} className="opacity-70" />
            </button>

            {showModeMenu && (
              <div className="absolute top-full left-0 mt-1.5 w-64 rounded-2xl bg-[#10121d]/95 backdrop-blur-2xl border border-white/15 shadow-2xl p-1.5 z-50 flex flex-col gap-1">
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider border-b border-white/10">
                  Select Routing Pipeline
                </div>

                {/* Scramjet Static Option */}
                <button
                  onClick={() => handleSetTunnelMode('scramjet')}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-left transition-all ${
                    tunnelMode === 'scramjet'
                      ? 'bg-violet-500/20 text-violet-200 border border-violet-500/40 font-semibold'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">Scramjet Static v2.0</span>
                      <span className="text-[9px] bg-violet-500/20 text-violet-300 px-1 rounded font-mono">WASM ⚡</span>
                    </div>
                    <div className="text-[10px] text-slate-400">High-speed WASM engine + BareWorker Wisp</div>
                  </div>
                  {tunnelMode === 'scramjet' && <Check size={14} className="text-violet-400 flex-shrink-0" />}
                </button>

                {/* Service Worker Bridge Option */}
                <button
                  onClick={() => handleSetTunnelMode('sw')}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-left transition-all ${
                    tunnelMode === 'sw'
                      ? 'bg-teal-500/20 text-teal-200 border border-teal-500/40 font-semibold'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">Service Worker Bridge</span>
                      <span className="text-[9px] bg-teal-500/20 text-teal-300 px-1 rounded font-mono">sw.js</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Root sw.js + bareworker.js tunnel</div>
                  </div>
                  {tunnelMode === 'sw' && <Check size={14} className="text-teal-400 flex-shrink-0" />}
                </button>
                
                {/* Ultraviolet Proxy Option */}
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
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-mono">Epoxy</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Ultraviolet with Epoxy Wisp transport</div>
                  </div>
                  {tunnelMode === 'uv' && <Check size={14} className="text-emerald-400 flex-shrink-0" />}
                </button>

                {/* Direct Sandbox Option */}
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
                    <div className="text-[10px] text-slate-400">No SW proxy (bypasses SW blocks)</div>
                  </div>
                  {tunnelMode === 'direct' && <Check size={14} className="text-blue-400 flex-shrink-0" />}
                </button>

                {/* Local Proxy Option */}
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

          {/* Wisp Server Selector Dropdown (When proxy modes active) */}
          {(tunnelMode === 'scramjet' || tunnelMode === 'sw' || tunnelMode === 'uv') && (
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
          {/* Movies 1337x Mirror Toggle */}
          {isMovies && (
            <button
              onClick={handleCycleMoviesMirror}
              className="px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-200 text-xs font-mono font-medium transition-all flex items-center gap-1.5 shadow-sm"
              title="Cycle 1337x Mirrors (1337x.to, 1337x.st, x1337x.ws, x1337x.eu, x1337x.se, x1337x.cc)"
            >
              <Film size={12} className="text-amber-400" />
              <span className="hidden sm:inline font-semibold text-white">Mirror:</span>
              <span className="text-amber-300">
                {(() => {
                  try {
                    return new URL(currentUrl).hostname.replace('www.', '');
                  } catch {
                    return '1337x.to';
                  }
                })()}
              </span>
              <span className="text-[10px] text-amber-400/80">↺</span>
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

          {/* Diagnostics toggle */}
          <button
            onClick={() => {
              sound.playClick();
              setShowTroubleshoot(!showTroubleshoot);
            }}
            className={`p-1.5 rounded-xl border transition-all ${
              showTroubleshoot
                ? 'bg-purple-600/30 border-purple-500/50 text-purple-300'
                : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/10 text-slate-300 hover:text-white'
            }`}
            title="Smart Proxy Diagnostics & Fallbacks"
          >
            <Sparkles size={13} />
          </button>

          {/* External Launch in New Tab */}
          <button
            onClick={() => {
              sound.playClick();
              if (localGameSrcDoc) {
                const blob = new Blob([localGameSrcDoc], { type: 'text/html; charset=utf-8' });
                const blobUrl = URL.createObjectURL(blob);
                window.open(blobUrl, '_blank');
              } else {
                window.open(currentUrl, '_blank');
              }
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
      <div className="flex-1 relative overflow-hidden bg-black/90 flex flex-col">
        {/* Sleek, Non-Blocking Top Progress Bar */}
        {loading && (
          <div className="absolute top-0 left-0 right-0 h-[2px] z-30 pointer-events-none overflow-hidden bg-white/5">
            <div className="h-full bg-gradient-to-r from-purple-500 via-emerald-400 to-indigo-500 animate-[loading-bar_1.2s_ease-in-out_infinite]" />
          </div>
        )}

        {/* Ultraviolet / Direct / Local Game Frame */}
        {(iframeSrc || localGameSrcDoc) && (
          <iframe
            ref={iframeRef}
            src={iframeSrc || undefined}
            srcDoc={localGameSrcDoc || undefined}
            onLoad={handleIframeLoad}
            className="w-full h-full border-none block bg-transparent"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-downloads"
          />
        )}

        {/* Floating Diagnostics & Recovery Card (Fixes Black Screen Feedback) */}
        {showTroubleshoot && (
          <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 rounded-2xl bg-[#0f121ecc]/95 backdrop-blur-2xl border border-purple-500/30 p-3.5 shadow-2xl z-40 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-purple-300 font-semibold font-mono">
                <Sparkles size={13} className="text-purple-400" />
                <span>Smart Proxy Diagnostics</span>
              </div>
              <button
                onClick={() => setShowTroubleshoot(false)}
                className="text-slate-400 hover:text-white px-1.5 py-0.5 rounded-lg text-xs"
              >
                ✕
              </button>
            </div>
            {isMovies && (
              <div className="mb-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="text-[11px] font-semibold text-amber-300 mb-1.5 flex items-center gap-1.5 font-mono">
                  <Film size={12} className="text-amber-400" />
                  1337x Official Mirror Cluster:
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {MOVIES_MIRRORS.map((mirror) => {
                    const host = new URL(mirror).hostname;
                    const isActive = currentUrl.includes(host);
                    return (
                      <button
                        key={mirror}
                        onClick={() => {
                          sound.playClick();
                          setCurrentUrl(mirror);
                          setUrlInput(mirror);
                        }}
                        className={`px-2 py-1 rounded-lg text-[10.5px] font-mono font-medium transition-all text-center truncate ${
                          isActive
                            ? 'bg-amber-500 text-black font-bold shadow-sm'
                            : 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/5'
                        }`}
                      >
                        {host}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">
              Black screen? If your current hosting environment (e.g. Wasmer or another web proxy) restricts nested Service Workers, use 1-click fallback:
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleSetTunnelMode('direct')}
                className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-blue-600/25 hover:bg-blue-600/40 border border-blue-500/40 text-blue-200 font-mono text-[11px] font-semibold transition-all"
                title="Bypass Service Worker proxy and load iframe directly"
              >
                <Zap size={12} className="text-blue-400" />
                Direct Sandbox
              </button>
              <button
                onClick={handleCycleWisp}
                className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-purple-600/25 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 font-mono text-[11px] font-semibold transition-all"
                title="Cycle to next verified Wisp relay"
              >
                <Server size={12} className="text-purple-400" />
                Next Wisp Relay
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  openApp('zen', 'Godly Browser', currentUrl);
                }}
                className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-emerald-600/25 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-200 font-mono text-[11px] font-semibold transition-all"
                title="Open inside the new Godly Browser with search engines"
              >
                <Globe size={12} className="text-emerald-400" />
                Godly Browser
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  window.open(currentUrl, '_blank');
                }}
                className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 font-mono text-[11px] font-semibold transition-all"
                title="Launch directly in a new browser tab"
              >
                <ExternalLink size={12} />
                Open in Tab
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="px-3 py-1 bg-[#0b0c14]/90 backdrop-blur-xl border-t border-white/[0.08] flex items-center justify-between text-[11px] text-slate-400 font-mono flex-shrink-0">
        <div className="flex items-center gap-2 truncate">
          <span className="text-purple-400 font-semibold">
            {tunnelMode === 'scramjet' ? 'Scramjet v2.0:' :
             tunnelMode === 'sw' ? 'SW Bridge (sw.js):' :
             tunnelMode === 'uv' ? 'UV-Static 2.0:' :
             tunnelMode === 'direct' ? 'Direct Sandbox:' : 'Local Proxy:'}
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
            {tunnelMode === 'scramjet'
              ? `Scramjet WASM + libcurl (${activeWisp.replace('wss://', '').replace('/', '')})`
              : tunnelMode === 'sw'
              ? `Root sw.js + bareworker.js (${activeWisp.replace('wss://', '').replace('/', '')})`
              : tunnelMode === 'uv'
              ? `Epoxy Wasm Relay: ${activeWisp.replace('wss://', '').replace('/', '')}`
              : tunnelMode === 'direct'
              ? 'Direct Embed'
              : 'Local Node Proxy'}
          </span>
        </div>
      </div>
    </div>
  );
};
