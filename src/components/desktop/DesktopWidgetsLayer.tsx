import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  CloudSun,
  Cpu,
  StickyNote,
  Music,
  Lock,
  Unlock,
  X,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Sliders,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  LayoutGrid,
  Trash2,
  Wind,
  Droplets,
  Sun,
  Plus,
  CheckSquare,
  Square,
  Activity,
  Quote,
  Compass,
  RefreshCw,
} from 'lucide-react';
import { DesktopWidget, AppId } from '../../types/os';
import { useOS, getDefaultWidgets } from '../../context/OSContext';
import { sound } from '../../utils/sound';
import { getAssetUrl } from '../../utils/assetHelper';

export const DesktopWidgetsLayer: React.FC = () => {
  const {
    widgets,
    openApp,
    updateWidgetBounds,
    toggleWidgetLock,
    toggleWidgetVisibility,
    updateWidgetData,
    nowPlaying,
    togglePlayPauseNowPlaying,
    nextTrackNowPlaying,
  } = useOS();

  const [deckOpen, setDeckOpen] = useState(false);

  // Listen for context menu or global trigger
  useEffect(() => {
    const handleToggleDeck = () => setDeckOpen((prev) => !prev);
    window.addEventListener('godly-toggle-widget-deck', handleToggleDeck);
    return () => window.removeEventListener('godly-toggle-widget-deck', handleToggleDeck);
  }, []);

  const handleAlignSidebar = () => {
    sound.playClick();
    const isBrowser = typeof window !== 'undefined';
    const screenWidth = isBrowser ? window.innerWidth : 1280;
    const startX = Math.max(680, screenWidth - 320);
    let currentY = 28;
    widgets.forEach((w) => {
      if (w.isVisible) {
        updateWidgetBounds(w.id, { x: startX, y: currentY, width: 290 });
        currentY += w.height + 16;
      }
    });
  };

  const handleAlignTopDock = () => {
    sound.playClick();
    let currentX = 24;
    const currentY = 24;
    widgets.forEach((w) => {
      if (w.isVisible) {
        updateWidgetBounds(w.id, { x: currentX, y: currentY });
        currentX += w.width + 16;
      }
    });
  };

  const handleResetDefaults = () => {
    sound.playClick();
    const defaults = getDefaultWidgets();
    defaults.forEach((dw: DesktopWidget) => {
      updateWidgetBounds(dw.id, { x: dw.x, y: dw.y, width: dw.width, height: dw.height });
    });
  };

  const activeWidgetCount = widgets.filter((w) => w.isVisible).length;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden select-none">
      {/* SVG Optical Refraction & Lens Distortion Filter Definition */}
      <svg
        className="absolute w-0 h-0 pointer-events-none"
        style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
        aria-hidden="true"
      >
        <defs>
          <filter id="godly-ios-warp" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.015 0.015" numOctaves="2" result="warpMap" />
            <feDisplacementMap in="SourceGraphic" in2="warpMap" scale="8" xChannelSelector="R" yChannelSelector="G" result="displaced" />
            <feGaussianBlur in="displaced" stdDeviation="0.3" />
          </filter>
        </defs>
      </svg>
      {/* Floating Widget Deck Trigger Button */}
      <div className="absolute top-4 right-16 pointer-events-auto z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            sound.playClick();
            setDeckOpen(!deckOpen);
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-2xl border transition-all text-xs font-medium shadow-xl ${
            deckOpen
              ? 'bg-purple-600/35 border-purple-400/60 text-purple-200 shadow-purple-500/25 ring-2 ring-purple-500/30'
              : 'bg-black/60 hover:bg-black/80 border-white/15 hover:border-white/30 text-white/80 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span className="tracking-wide">Widgets</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-white/90 font-mono font-bold">
            {activeWidgetCount}
          </span>
        </motion.button>
      </div>

      {/* Widget Deck Flyout Panel */}
      <AnimatePresence>
        {deckOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 26, stiffness: 360 }}
            className="absolute top-14 right-16 w-84 pointer-events-auto bg-[#0a0c16]/95 backdrop-blur-3xl border border-white/20 rounded-3xl p-4 shadow-[0_25px_60px_rgba(0,0,0,0.85)] z-40 flex flex-col gap-3 text-white"
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold tracking-wide uppercase text-white/90">
                  Desktop Widgets Deck
                </span>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  setDeckOpen(false);
                }}
                className="p-1 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Layout Presets */}
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={handleAlignSidebar}
                className="flex items-center justify-center gap-1 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-medium text-white/80 hover:text-white transition-all"
                title="Align widgets in right-hand column"
              >
                <LayoutGrid className="w-3 h-3 text-purple-400" />
                <span>Snap Right</span>
              </button>
              <button
                onClick={handleAlignTopDock}
                className="flex items-center justify-center gap-1 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-medium text-white/80 hover:text-white transition-all"
                title="Align widgets along top dock"
              >
                <Sliders className="w-3 h-3 text-cyan-400" />
                <span>Snap Top</span>
              </button>
              <button
                onClick={handleResetDefaults}
                className="flex items-center justify-center gap-1 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-medium text-white/80 hover:text-white transition-all"
                title="Reset widgets to defaults"
              >
                <RotateCcw className="w-3 h-3 text-amber-400" />
                <span>Reset</span>
              </button>
            </div>

            {/* Toggle Widgets Switcher List */}
            <div className="flex flex-col gap-1.5 mt-1">
              {widgets.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-1.5 rounded-xl border ${
                        w.type === 'clock'
                          ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                          : w.type === 'weather'
                          ? 'bg-sky-500/10 border-sky-500/20 text-sky-400'
                          : w.type === 'system'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : w.type === 'notes'
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          : 'bg-pink-500/10 border-pink-500/20 text-pink-400'
                      }`}
                    >
                      {w.type === 'clock' && <Clock size={13} />}
                      {w.type === 'weather' && <CloudSun size={13} />}
                      {w.type === 'system' && <Cpu size={13} />}
                      {w.type === 'notes' && <StickyNote size={13} />}
                      {w.type === 'media' && <Music size={13} />}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white/90">{w.title}</div>
                      <div className="text-[10px] text-white/40 capitalize">{w.type} Widget</div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleWidgetVisibility(w.id)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                      w.isVisible
                        ? 'bg-purple-500/25 text-purple-200 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                        : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {w.isVisible ? 'Active' : 'Hidden'}
                  </button>
                </div>
              ))}
            </div>

            {/* Launch Widgets Studio Button */}
            <button
              onClick={() => {
                sound.playClick();
                setDeckOpen(false);
                openApp('widgets');
              }}
              className="mt-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600/40 to-indigo-600/40 hover:from-purple-600/60 hover:to-indigo-600/60 border border-purple-500/40 text-xs font-semibold text-purple-200 shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Open Widgets Studio App ↗</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render Active Widgets */}
      {widgets.map((widget) => {
        if (!widget.isVisible) return null;
        return (
          <WidgetCard
            key={widget.id}
            widget={widget}
            updateBounds={updateWidgetBounds}
            toggleLock={toggleWidgetLock}
            toggleVisibility={toggleWidgetVisibility}
            updateData={updateWidgetData}
            openApp={openApp}
            nowPlaying={nowPlaying}
            toggleMusic={togglePlayPauseNowPlaying}
            nextTrack={nextTrackNowPlaying}
          />
        );
      })}
    </div>
  );
};

interface WidgetCardProps {
  widget: DesktopWidget;
  updateBounds: (id: string, bounds: Partial<Pick<DesktopWidget, 'x' | 'y' | 'width' | 'height'>>) => void;
  toggleLock: (id: string) => void;
  toggleVisibility: (id: string) => void;
  updateData: (id: string, data: any) => void;
  openApp?: (appId: AppId) => void;
  nowPlaying: any;
  toggleMusic: () => void;
  nextTrack: () => void;
}

const WidgetCard: React.FC<WidgetCardProps> = ({
  widget,
  updateBounds,
  toggleLock,
  toggleVisibility,
  updateData,
  openApp,
  nowPlaying,
  toggleMusic,
  nextTrack,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startMouseRef = useRef({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 20 });

  const handlePointerMoveCapture = (e: React.PointerEvent<HTMLDivElement>) => {
    if (cardRef.current && !isDraggingRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = Math.round(((e.clientX - rect.left) / Math.max(1, rect.width)) * 100);
      const y = Math.round(((e.clientY - rect.top) / Math.max(1, rect.height)) * 100);
      setMousePos({ x, y });
    }
  };

  // High-Performance Zero-Rerender Pointer Drag Controller
  const handlePointerDown = (e: React.PointerEvent) => {
    if (widget.isLocked) return;
    const target = e.target as HTMLElement;
    // Don't drag when interacting with controls or inputs
    if (target.closest('button, input, textarea, a, select, [data-interactive="true"]')) return;

    e.preventDefault();
    isDraggingRef.current = true;
    startPosRef.current = { x: widget.x, y: widget.y };
    startMouseRef.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!isDraggingRef.current || !cardRef.current) return;
      const dx = moveEvent.clientX - startMouseRef.current.x;
      const dy = moveEvent.clientY - startMouseRef.current.y;
      // Direct GPU transform manipulation - ZERO React state overhead during drag
      cardRef.current.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(1.03)`;
      cardRef.current.style.transition = 'none';
      cardRef.current.style.zIndex = '50';
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsDragging(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);

      const dx = upEvent.clientX - startMouseRef.current.x;
      const dy = upEvent.clientY - startMouseRef.current.y;
      let targetX = startPosRef.current.x + dx;
      let targetY = startPosRef.current.y + dy;

      const screenW = window.innerWidth;
      const screenH = window.innerHeight;

      // Magnetic screen-edge snapping
      if (targetX < 40) targetX = 24;
      else if (targetX + widget.width > screenW - 40) targetX = screenW - widget.width - 24;

      if (targetY < 40) targetY = 24;
      else if (targetY + widget.height > screenH - 100) targetY = screenH - widget.height - 76;

      if (cardRef.current) {
        cardRef.current.style.transform = '';
        cardRef.current.style.transition = 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
        cardRef.current.style.zIndex = '10';
      }

      updateBounds(widget.id, { x: targetX, y: targetY });
      sound.playSnap();
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const getAccentGlow = () => {
    switch (widget.type) {
      case 'clock':
        return 'hover:border-purple-400/50 hover:shadow-[0_20px_50px_rgba(168,85,247,0.25)]';
      case 'weather':
        return 'hover:border-sky-400/50 hover:shadow-[0_20px_50px_rgba(56,189,248,0.25)]';
      case 'system':
        return 'hover:border-emerald-400/50 hover:shadow-[0_20px_50px_rgba(52,211,153,0.25)]';
      case 'notes':
        return 'hover:border-amber-400/50 hover:shadow-[0_20px_50px_rgba(251,191,36,0.25)]';
      case 'media':
        return 'hover:border-pink-400/50 hover:shadow-[0_20px_50px_rgba(236,72,153,0.25)]';
      case 'quote':
        return 'hover:border-fuchsia-400/50 hover:shadow-[0_20px_50px_rgba(217,70,239,0.25)]';
      case 'launcher':
        return 'hover:border-cyan-400/50 hover:shadow-[0_20px_50px_rgba(6,182,212,0.25)]';
      default:
        return 'hover:border-white/40';
    }
  };

  return (
    <div
      ref={cardRef}
      onPointerDown={handlePointerDown}
      onPointerMoveCapture={handlePointerMoveCapture}
      style={{
        position: 'absolute',
        top: widget.y,
        left: widget.x,
        width: widget.width,
        height: widget.height,
        opacity: widget.opacity ?? 1,
        transform: isDragging ? undefined : widget.scale && widget.scale !== 1 ? `scale(${widget.scale})` : undefined,
        transformOrigin: 'top left',
        zIndex: isDragging ? 50 : 10,
        transition: isDragging ? 'none' : 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className={`desktop-widget pointer-events-auto rounded-[28px] p-3.5 flex flex-col group overflow-hidden select-none ${getAccentGlow()}`}
    >
      {/* 1. iOS Liquid Glass Base Translucent Plate with High-Vibrancy Blur & Optical Refraction */}
      <div
        className="absolute inset-0 rounded-[28px] pointer-events-none transition-all duration-300"
        style={{
          background:
            widget.theme === 'cyber'
              ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.16) 0%, rgba(14, 165, 233, 0.04) 45%, rgba(3, 105, 161, 0.20) 100%)'
              : widget.theme === 'gold'
              ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.16) 0%, rgba(245, 158, 11, 0.04) 45%, rgba(180, 83, 9, 0.20) 100%)'
              : widget.theme === 'obsidian'
              ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 45%, rgba(10, 12, 18, 0.32) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.05) 42%, rgba(15, 23, 42, 0.22) 100%)',
          backdropFilter: `blur(${widget.blur ?? 32}px) saturate(220%) contrast(108%) brightness(112%)`,
          WebkitBackdropFilter: `blur(${widget.blur ?? 32}px) saturate(220%) contrast(108%) brightness(112%)`,
          border: '1px solid rgba(255, 255, 255, 0.22)',
          boxShadow: isDragging
            ? '0 32px 70px -10px rgba(0,0,0,0.7), 0 0 30px rgba(168,85,247,0.35), inset 0 2px 2px rgba(255,255,255,0.75), inset 0 -2px 2px rgba(0,0,0,0.35)'
            : '0 20px 45px -10px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.15), inset 0 1.5px 2px rgba(255,255,255,0.75), inset 0 -1.5px 2px rgba(0,0,0,0.35)',
        }}
      />

      {/* 2. Optical Lens Refraction Ring (Beveled edge bending and warping background) */}
      <div
        className="absolute inset-0 rounded-[28px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(255,255,255,0.06) 82%, rgba(255,255,255,0.22) 100%)',
          boxShadow: 'inset 0 0 14px 2px rgba(255,255,255,0.12)',
          mixBlendMode: 'overlay',
        }}
      />

      {/* 3. Liquid Glass Curvature Caustics Sheen (Curved specular highlight) */}
      <div
        className="absolute inset-0 rounded-[28px] pointer-events-none"
        style={{
          background: `radial-gradient(circle 240px at ${mousePos.x}% ${mousePos.y}%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.08) 40%, transparent 75%)`,
          mixBlendMode: 'overlay',
          transition: 'background 0.15s ease-out',
        }}
      />

      {/* 4. Diagonal Glass Prism Split Highlight */}
      <div
        className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] pointer-events-none opacity-25"
        style={{
          background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.4) 0%, transparent 45%)',
          transform: 'rotate(-20deg)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Header Bar */}
      <div className="relative z-10 h-5 flex items-center justify-between text-white/70 text-[10px] mb-2 cursor-grab active:cursor-grabbing drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-1.5 font-semibold text-white/80">
          {widget.type === 'clock' && <Clock size={11} className="text-purple-400" />}
          {widget.type === 'weather' && <CloudSun size={11} className="text-sky-400" />}
          {widget.type === 'system' && <Cpu size={11} className="text-emerald-400" />}
          {widget.type === 'notes' && <StickyNote size={11} className="text-amber-400" />}
          {widget.type === 'media' && <Music size={11} className="text-pink-400" />}
          {widget.type === 'quote' && <Quote size={11} className="text-fuchsia-400" />}
          {widget.type === 'launcher' && <Compass size={11} className="text-cyan-400" />}
          <span className="tracking-wide text-white/90">{widget.title}</span>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {openApp && (
            <button
              onClick={() => {
                sound.playClick();
                openApp('widgets');
              }}
              className="p-1 rounded-md hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              title="Customize in Widgets Studio"
            >
              <Sliders size={10} />
            </button>
          )}
          <button
            onClick={() => toggleLock(widget.id)}
            className="p-1 rounded-md hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            title={widget.isLocked ? 'Unlock widget' : 'Lock position'}
          >
            {widget.isLocked ? <Lock size={10} className="text-amber-400" /> : <Unlock size={10} />}
          </button>
          <button
            onClick={() => toggleVisibility(widget.id)}
            className="p-1 rounded-md hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
            title="Hide widget"
          >
            <X size={10} />
          </button>
        </div>
      </div>

      {/* Widget Content Body */}
      <div className="relative z-10 flex-1 overflow-hidden">
        {widget.type === 'clock' && <ClockWidgetBody />}
        {widget.type === 'weather' && <WeatherWidgetBody />}
        {widget.type === 'system' && <SystemWidgetBody />}
        {widget.type === 'notes' && <NotesWidgetBody widget={widget} updateData={updateData} />}
        {widget.type === 'media' && (
          <MediaWidgetBody nowPlaying={nowPlaying} toggleMusic={toggleMusic} nextTrack={nextTrack} />
        )}
        {widget.type === 'quote' && <QuoteWidgetBody widget={widget} updateData={updateData} />}
        {widget.type === 'launcher' && <LauncherWidgetBody widget={widget} openApp={openApp} />}
      </div>
    </div>
  );
};

// 1. Astronomical Chronometer (Ultra-Smooth 60fps Continuous Dial with Zero Parent State Thrashing)
const ClockWidgetBody: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const digitalRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animId: number;
    let lastSecond = -1;

    const render = () => {
      const now = new Date();
      const canvas = canvasRef.current;

      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const cx = canvas.width / 2;
          const cy = canvas.height / 2;
          const r = canvas.width / 2 - 4;

          // Dial background glow
          const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, r);
          grad.addColorStop(0, 'rgba(168, 85, 247, 0.18)');
          grad.addColorStop(1, 'rgba(255, 255, 255, 0.04)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();

          // Outer ring
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();

          // Hour and minute tick marks
          for (let i = 0; i < 12; i++) {
            const angle = (i * Math.PI) / 6;
            const isMajor = i % 3 === 0;
            const innerR = isMajor ? r - 6 : r - 3;
            ctx.strokeStyle = isMajor ? '#c084fc' : 'rgba(255, 255, 255, 0.25)';
            ctx.lineWidth = isMajor ? 2 : 1;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
            ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
            ctx.stroke();
          }

          // Center concentric circles
          ctx.fillStyle = '#a855f7';
          ctx.beginPath();
          ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
          ctx.fill();

          const ms = now.getMilliseconds();
          const s = now.getSeconds() + ms / 1000;
          const m = now.getMinutes() + s / 60;
          const h = (now.getHours() % 12) + m / 60;

          // Hour Hand (White)
          const hAngle = (h * Math.PI) / 6 - Math.PI / 2;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(hAngle) * (r * 0.5), cy + Math.sin(hAngle) * (r * 0.5));
          ctx.stroke();

          // Minute Hand (Purple Neon)
          const mAngle = (m * Math.PI) / 30 - Math.PI / 2;
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(mAngle) * (r * 0.72), cy + Math.sin(mAngle) * (r * 0.72));
          ctx.stroke();

          // Second Hand (Cyan sweep with counter-balance tail)
          const sAngle = (s * Math.PI) / 30 - Math.PI / 2;
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.2;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(cx - Math.cos(sAngle) * (r * 0.22), cy - Math.sin(sAngle) * (r * 0.22));
          ctx.lineTo(cx + Math.cos(sAngle) * (r * 0.86), cy + Math.sin(sAngle) * (r * 0.86));
          ctx.stroke();
        }
      }

      // Update text directly on second ticks without triggering React component re-renders
      const curSec = now.getSeconds();
      if (curSec !== lastSecond) {
        lastSecond = curSec;
        if (digitalRef.current) {
          digitalRef.current.textContent = now.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
        }
        if (dateRef.current) {
          dateRef.current.textContent = now.toLocaleDateString([], {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          });
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop()?.replace(/_/g, ' ') || 'Local';

  return (
    <div className="h-full flex items-center justify-around gap-2 px-1">
      <canvas ref={canvasRef} width={74} height={74} className="flex-none rounded-full shadow-lg" />
      <div className="text-left min-w-0 flex-1 pl-1">
        <div
          ref={digitalRef}
          className="text-2xl font-mono font-bold text-white tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] truncate"
        >
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <div
          ref={dateRef}
          className="text-[11px] text-purple-300 font-medium tracking-wide mt-0.5 drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]"
        >
          {new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(56,189,248,0.8)]" />
          <span className="text-[9px] text-white/50 font-mono tracking-wider uppercase truncate">
            {tz}
          </span>
        </div>
      </div>
    </div>
  );
};

// 2. Global Weather Radar (Forecast & Sensor Telemetry)
const WeatherWidgetBody: React.FC = () => {
  const [weather, setWeather] = useState<{
    temp: number;
    wind: number;
    condition: string;
    city: string;
    humidity: number;
  }>({
    temp: 22,
    wind: 11,
    condition: 'Clear Sky',
    city: 'New York, US',
    humidity: 56,
  });
  const [isFahrenheit, setIsFahrenheit] = useState(false);

  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=40.71&longitude=-74.01&current_weather=true&hourly=relativehumidity_2m')
      .then((res) => res.json())
      .then((data) => {
        if (data?.current_weather) {
          const tempC = Math.round(data.current_weather.temperature);
          const windKmh = Math.round(data.current_weather.windspeed);
          const code = data.current_weather.weathercode;
          let cond = 'Clear Sky';
          if (code >= 1 && code <= 3) cond = 'Partly Cloudy';
          else if (code >= 51 && code <= 67) cond = 'Light Rain';
          else if (code >= 71) cond = 'Snow Showers';
          else if (code >= 95) cond = 'Thunderstorm';

          setWeather({
            temp: tempC,
            wind: windKmh,
            condition: cond,
            city: 'New York, US',
            humidity: data.hourly?.relativehumidity_2m?.[0] || 56,
          });
        }
      })
      .catch(() => {});
  }, []);

  const displayTemp = isFahrenheit ? Math.round((weather.temp * 9) / 5 + 32) : weather.temp;

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold font-mono text-white tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
              {displayTemp}°
            </span>
            <button
              onClick={() => {
                sound.playClick();
                setIsFahrenheit(!isFahrenheit);
              }}
              className="text-[10px] font-mono text-sky-400 hover:text-sky-300 uppercase underline px-1 py-0.5 rounded hover:bg-sky-500/10 transition-colors"
            >
              {isFahrenheit ? 'F' : 'C'}
            </button>
          </div>
          <div className="text-[11px] text-sky-300 font-semibold tracking-wide drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            {weather.condition}
          </div>
        </div>

        <div className="text-right text-[10px] text-white/50 space-y-0.5">
          <div className="font-semibold text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">{weather.city}</div>
          <div className="flex items-center justify-end gap-1">
            <Wind size={10} className="text-sky-400" />
            <span>{weather.wind} km/h</span>
          </div>
          <div className="flex items-center justify-end gap-1">
            <Droplets size={10} className="text-cyan-400" />
            <span>{weather.humidity}% hum</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5 pt-1.5 border-t border-white/10 text-center text-[10px] text-white/70">
        <div className="p-1 rounded-xl bg-white/[0.08] backdrop-blur-md border border-white/15 shadow-sm">
          <div className="text-[9px] text-white/40">Today</div>
          <div className="font-semibold text-sky-300">{displayTemp}°</div>
        </div>
        <div className="p-1 rounded-xl bg-white/[0.08] backdrop-blur-md border border-white/15 shadow-sm">
          <div className="text-[9px] text-white/40">Tomorrow</div>
          <div className="font-semibold text-white/80">{displayTemp + 1}°</div>
        </div>
        <div className="p-1 rounded-xl bg-white/[0.08] backdrop-blur-md border border-white/15 shadow-sm">
          <div className="text-[9px] text-white/40">Sun</div>
          <div className="font-semibold text-white/80">{displayTemp - 2}°</div>
        </div>
      </div>
    </div>
  );
};

// 3. Resource Telemetry HUD (Live Real-Time SVG Sparkline Compute Wave)
const SystemWidgetBody: React.FC = () => {
  const [cpuUsage, setCpuUsage] = useState<number>(18);
  const [ramUsage, setRamUsage] = useState<number>(42);
  const [history, setHistory] = useState<number[]>([15, 20, 18, 25, 22, 19, 28, 24, 30, 22, 26, 19]);

  useEffect(() => {
    const timer = setInterval(() => {
      let mem = 42;
      const perfMem = (performance as any).memory;
      if (perfMem) {
        mem = Math.round((perfMem.usedJSHeapSize / perfMem.jsHeapSizeLimit) * 100);
      } else {
        mem = 38 + Math.round(Math.random() * 8);
      }
      const newCpu = Math.floor(10 + Math.random() * 26);
      setRamUsage(mem);
      setCpuUsage(newCpu);
      setHistory((prev) => [...prev.slice(1), newCpu]);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const points = history
    .map((val, idx) => {
      const x = (idx / (history.length - 1)) * 240;
      const y = 30 - (val / 100) * 26;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="h-full flex flex-col justify-between text-xs">
      {/* Live Compute Wave Chart with Translucent Glass */}
      <div className="relative h-9 w-full rounded-xl bg-white/[0.06] backdrop-blur-md border border-white/15 overflow-hidden flex items-center px-1">
        <svg viewBox="0 0 240 32" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="sysWaveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <polygon points={`0,32 ${points} 240,32`} fill="url(#sysWaveGrad)" />
          <polyline points={points} fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <div className="absolute right-2 top-1 text-[9px] font-mono text-purple-300 font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
          <span>{cpuUsage}% JIT</span>
        </div>
      </div>

      {/* Compute & RAM Dual Progress Gauges */}
      <div className="space-y-1.5 mt-1">
        <div>
          <div className="flex justify-between text-[10px] text-white/70 mb-0.5">
            <span className="flex items-center gap-1">
              <span>CPU Compute Load</span>
              <span className="text-[9px] text-white/30 font-mono">(3.8 GHz • 8 Cores)</span>
            </span>
            <span className="font-mono text-purple-400 font-semibold">{cpuUsage}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]"
              style={{ width: `${cpuUsage}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[10px] text-white/70 mb-0.5">
            <span className="flex items-center gap-1">
              <span>JS Memory Pool</span>
              <span className="text-[9px] text-white/30 font-mono">(1.4 GB / 4.0 GB)</span>
            </span>
            <span className="font-mono text-emerald-400 font-semibold">{ramUsage}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
              style={{ width: `${ramUsage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// 4. Quick Scratchpad & Task Checklist
const NotesWidgetBody: React.FC<{
  widget: DesktopWidget;
  updateData: (id: string, data: any) => void;
}> = ({ widget, updateData }) => {
  const [tab, setTab] = useState<'notes' | 'tasks'>('notes');
  const [newTaskInput, setNewTaskInput] = useState('');
  const text = widget.data?.text || '';
  const tasks = widget.data?.tasks || [
    { id: '1', text: 'Explore WebVM x86 Terminal', done: true },
    { id: '2', text: 'Configure custom glass theme', done: false },
  ];
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const handleToggleTask = (taskId: string) => {
    sound.playClick();
    const updated = tasks.map((t: any) => (t.id === taskId ? { ...t, done: !t.done } : t));
    updateData(widget.id, { tasks: updated });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    sound.playClick();
    const newTask = { id: Date.now().toString(), text: newTaskInput.trim(), done: false };
    updateData(widget.id, { tasks: [...tasks, newTask] });
    setNewTaskInput('');
  };

  const handleDeleteTask = (taskId: string) => {
    sound.playClick();
    const updated = tasks.filter((t: any) => t.id !== taskId);
    updateData(widget.id, { tasks: updated });
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="h-full flex flex-col justify-between" data-interactive="true">
      {/* Mode Switcher */}
      <div className="flex items-center justify-between pb-1 mb-1 border-b border-white/10">
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              sound.playClick();
              setTab('notes');
            }}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all ${
              tab === 'notes' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-white/40 hover:text-white'
            }`}
          >
            Scratchpad
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setTab('tasks');
            }}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all ${
              tab === 'tasks' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-white/40 hover:text-white'
            }`}
          >
            Tasks ({tasks.filter((t: any) => !t.done).length})
          </button>
        </div>

        {tab === 'notes' && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/15 text-[10px] text-white/70 hover:text-white transition-all"
            title="Copy Note"
          >
            {copied ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        )}
      </div>

      {/* Tab Body */}
      {tab === 'notes' ? (
        <div className="flex-1 flex flex-col justify-between">
          <textarea
            value={text}
            onChange={(e) => updateData(widget.id, { text: e.target.value })}
            placeholder="Type quick thoughts, code snippets, or notes..."
            className="w-full flex-1 bg-transparent resize-none text-xs text-amber-100/90 focus:outline-none placeholder:text-white/20 select-text leading-relaxed font-sans"
          />
          <div className="text-[10px] text-white/40 pt-1 border-t border-white/5">
            {wordCount} words | {text.length} chars
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {tasks.map((task: any) => (
              <div
                key={task.id}
                className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-xs transition-colors"
              >
                <div
                  onClick={() => handleToggleTask(task.id)}
                  className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                >
                  {task.done ? (
                    <CheckSquare size={13} className="text-emerald-400 flex-none" />
                  ) : (
                    <Square size={13} className="text-white/40 flex-none" />
                  )}
                  <span className={`truncate text-xs ${task.done ? 'line-through text-white/40' : 'text-white/90'}`}>
                    {task.text}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-white/30 hover:text-red-400 p-0.5 rounded"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddTask} className="flex items-center gap-1 pt-1.5 border-t border-white/10">
            <input
              type="text"
              value={newTaskInput}
              onChange={(e) => setNewTaskInput(e.target.value)}
              placeholder="Add new task..."
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-500/50"
            />
            <button
              type="submit"
              className="p-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/30"
            >
              <Plus size={12} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

// 5. Aura Media Controller (Equalizer Waves, Vinyl Spin & Track Scrubber)
const MediaWidgetBody: React.FC<{
  nowPlaying: any;
  toggleMusic: () => void;
  nextTrack: () => void;
}> = ({ nowPlaying, toggleMusic, nextTrack }) => {
  const isPlaying = !!nowPlaying?.isPlaying;

  return (
    <div className="h-full flex flex-col justify-between" data-interactive="true">
      <div className="flex items-center gap-3">
        {/* Animated Vinyl Record Disc */}
        <div className="relative flex-none">
          <img
            src={nowPlaying?.cover || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop'}
            alt=""
            className={`w-12 h-12 rounded-2xl object-cover shadow-xl border border-white/20 ${
              isPlaying ? 'animate-[spin_6s_linear_infinite]' : ''
            }`}
          />
          {isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-3 h-3 rounded-full bg-black/90 border border-white/50 shadow-inner" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-white truncate drop-shadow-sm">
            {nowPlaying?.title || 'Celestial Harmony'}
          </div>
          <div className="text-[10px] text-pink-300 font-medium truncate mt-0.5">
            {nowPlaying?.artist || 'Godly OS Ambient'}
          </div>

          {/* Equalizer Visualizer Bars */}
          <div className="flex items-end gap-1 h-3.5 mt-1.5">
            {[40, 85, 55, 100, 65, 90].map((h, i) => (
              <div
                key={i}
                className="w-1 bg-gradient-to-t from-pink-500 to-purple-400 rounded-full transition-all duration-200"
                style={{
                  height: isPlaying ? `${Math.max(25, (h + (i % 2 === 0 ? 15 : -10)) % 100)}%` : '20%',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Player Controls & Scrubber */}
      <div className="flex items-center justify-between pt-1.5 border-t border-white/10">
        <div className="text-[10px] font-mono text-white/50">
          {isPlaying ? '0:42 / 3:18' : 'Paused'}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              toggleMusic();
            }}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 hover:scale-105 active:scale-95 text-white flex items-center justify-center shadow-lg transition-transform"
          >
            {isPlaying ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
          </button>
          <button
            onClick={() => {
              sound.playClick();
              nextTrack();
            }}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <SkipForward size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

// 6. Celestial Wisdom Quote Widget
interface QuoteWidgetBodyProps {
  widget: DesktopWidget;
  updateData: (id: string, data: any) => void;
}

const QuoteWidgetBody: React.FC<QuoteWidgetBodyProps> = ({ widget, updateData }) => {
  const quote = widget.data?.quote || 'The soul becomes dyed with the color of its thoughts.';
  const author = widget.data?.author || 'Marcus Aurelius';

  const handleShuffle = () => {
    sound.playClick();
    const quotes = [
      { quote: 'We suffer more often in imagination than in reality.', author: 'Seneca' },
      { quote: 'The obstacle is the way.', author: 'Marcus Aurelius' },
      { quote: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci' },
      { quote: 'Look up at the stars and not down at your feet.', author: 'Stephen Hawking' },
      { quote: 'The mind is everything. What you think you become.', author: 'Buddha' },
      { quote: 'Order and simplification are the first steps toward the mastery of a subject.', author: 'Thomas Mann' },
    ];
    const nextQ = quotes[Math.floor(Math.random() * quotes.length)];
    updateData(widget.id, nextQ);
  };

  return (
    <div className="h-full flex flex-col justify-between p-1 select-none">
      <div className="flex items-start gap-2">
        <Quote className="w-4 h-4 text-fuchsia-400/80 shrink-0 mt-0.5" />
        <p className="text-xs italic text-white/90 leading-snug line-clamp-3 font-serif">
          "{quote}"
        </p>
      </div>

      <div className="flex items-center justify-between pt-1.5 border-t border-white/10 mt-1">
        <span className="text-[10px] font-mono text-fuchsia-300/80 tracking-wide font-semibold">
          — {author}
        </span>
        <button
          onClick={handleShuffle}
          className="p-1 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          title="New Quote"
        >
          <RefreshCw size={11} />
        </button>
      </div>
    </div>
  );
};

// 7. Quick App Dock Widget
interface LauncherWidgetBodyProps {
  widget: DesktopWidget;
  openApp?: (id: AppId) => void;
}

const LauncherWidgetBody: React.FC<LauncherWidgetBodyProps> = ({ openApp }) => {
  const dockApps: { id: AppId; name: string; icon: string }[] = [
    { id: 'zen', name: 'Browser', icon: 'assets/icons/zen.jpg' },
    { id: 'virtual-machine', name: 'VM', icon: 'assets/icons/vm.png' },
    { id: 'code-editor', name: 'Code', icon: 'assets/icons/terminal.jpg' },
    { id: 'widgets', name: 'Widgets', icon: 'assets/icons/widgets.jpeg' },
    { id: 'games', name: 'Arcade', icon: 'assets/icons/games.jpg' },
  ];

  return (
    <div className="h-full flex items-center justify-around px-1 select-none">
      {dockApps.map((app) => (
        <button
          key={app.id}
          onClick={() => {
            sound.playClick();
            openApp?.(app.id);
          }}
          className="flex flex-col items-center gap-1 p-1 rounded-xl hover:bg-white/15 transition-transform hover:scale-110 active:scale-95 group"
          title={`Launch ${app.name}`}
        >
          <img
            src={getAssetUrl(app.icon)}
            alt={app.name}
            className="w-7 h-7 rounded-xl object-cover ring-1 ring-white/20 shadow-md shadow-black/40"
          />
          <span className="text-[9px] font-medium text-white/70 group-hover:text-white truncate max-w-[44px]">
            {app.name}
          </span>
        </button>
      ))}
    </div>
  );
};
