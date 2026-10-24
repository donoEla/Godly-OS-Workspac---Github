import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
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
  ChevronRight,
  Trash2,
  Activity,
  Wind,
  Droplets,
  Sun
} from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { DesktopWidget } from '../../types/os';
import { sound } from '../../utils/sound';

export const DesktopWidgetsLayer: React.FC = () => {
  const {
    widgets,
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
    const startX = window.innerWidth - 300;
    let currentY = 50;
    widgets.forEach((w) => {
      if (w.isVisible) {
        updateWidgetBounds(w.id, { x: startX, y: currentY, width: 270 });
        currentY += w.height + 16;
      }
    });
  };

  const handleAlignTopDock = () => {
    sound.playClick();
    let currentX = 40;
    const currentY = 40;
    widgets.forEach((w) => {
      if (w.isVisible) {
        updateWidgetBounds(w.id, { x: currentX, y: currentY });
        currentX += w.width + 16;
      }
    });
  };

  const activeWidgetCount = widgets.filter((w) => w.isVisible).length;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden select-none">
      {/* Floating Widget Deck Trigger Button */}
      <div className="absolute top-3.5 right-16 pointer-events-auto z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            sound.playClick();
            setDeckOpen(!deckOpen);
          }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-xl border transition-all text-xs font-medium shadow-lg ${
            deckOpen
              ? 'bg-purple-600/30 border-purple-500/50 text-purple-200 shadow-purple-500/20'
              : 'bg-black/50 hover:bg-black/70 border-white/10 hover:border-white/20 text-white/70 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Widgets</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-white/80 font-mono">
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
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="absolute top-12 right-16 w-80 pointer-events-auto bg-[#0a0c14]/95 backdrop-blur-3xl border border-white/15 rounded-3xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.85)] z-40 flex flex-col gap-3 text-white"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
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
                className="p-1 rounded-full hover:bg-white/10 text-white/50 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Arrangement Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleAlignSidebar}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-medium text-white/80 hover:text-white transition-all"
              >
                <LayoutGrid className="w-3 h-3 text-purple-400" />
                <span>Snap to Right</span>
              </button>
              <button
                onClick={handleAlignTopDock}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-medium text-white/80 hover:text-white transition-all"
              >
                <Sliders className="w-3 h-3 text-cyan-400" />
                <span>Snap to Top</span>
              </button>
            </div>

            {/* Toggle Individual Widgets List */}
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
                      <div className="text-xs font-medium text-white/90">{w.title}</div>
                      <div className="text-[10px] text-white/40 capitalize">{w.type} Widget</div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleWidgetVisibility(w.id)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                      w.isVisible
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {w.isVisible ? 'Active' : 'Hidden'}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render Active Widgets */}
      <AnimatePresence>
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
              nowPlaying={nowPlaying}
              toggleMusic={togglePlayPauseNowPlaying}
              nextTrack={nextTrackNowPlaying}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
};

interface WidgetCardProps {
  widget: DesktopWidget;
  updateBounds: (id: string, bounds: Partial<Pick<DesktopWidget, 'x' | 'y' | 'width' | 'height'>>) => void;
  toggleLock: (id: string) => void;
  toggleVisibility: (id: string) => void;
  updateData: (id: string, data: any) => void;
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
  nowPlaying,
  toggleMusic,
  nextTrack,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  // Magnetic Grid / Screen Edge Snapping
  const handleDragEnd = (_e: any, info: PanInfo) => {
    setIsDragging(false);
    if (widget.isLocked) return;

    let targetX = widget.x + info.offset.x;
    let targetY = widget.y + info.offset.y;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Left edge snap
    if (targetX < 30) targetX = 24;
    // Right edge snap
    else if (targetX + widget.width > screenWidth - 30) targetX = screenWidth - widget.width - 24;

    // Top edge snap
    if (targetY < 30) targetY = 24;
    // Bottom dock snap (leave 70px for taskbar)
    else if (targetY + widget.height > screenHeight - 90) targetY = screenHeight - widget.height - 76;

    updateBounds(widget.id, { x: targetX, y: targetY });
    sound.playSnap();
  };

  const getAccentGlow = () => {
    switch (widget.type) {
      case 'clock':
        return 'group-hover:border-purple-500/40 group-hover:shadow-[0_20px_50px_rgba(168,85,247,0.15)]';
      case 'weather':
        return 'group-hover:border-sky-500/40 group-hover:shadow-[0_20px_50px_rgba(56,189,248,0.15)]';
      case 'system':
        return 'group-hover:border-emerald-500/40 group-hover:shadow-[0_20px_50px_rgba(52,211,153,0.15)]';
      case 'notes':
        return 'group-hover:border-amber-500/40 group-hover:shadow-[0_20px_50px_rgba(251,191,36,0.15)]';
      case 'media':
        return 'group-hover:border-pink-500/40 group-hover:shadow-[0_20px_50px_rgba(236,72,153,0.15)]';
      default:
        return 'group-hover:border-white/30';
    }
  };

  return (
    <motion.div
      drag={!widget.isLocked}
      dragMomentum={false}
      dragElastic={0.07}
      onDragStart={() => {
        setIsDragging(true);
        sound.playSnap();
      }}
      onDragEnd={handleDragEnd}
      animate={{
        x: widget.x,
        y: widget.y,
        scale: isDragging ? 1.03 : 1,
      }}
      transition={{
        type: 'spring',
        damping: 28,
        stiffness: 380,
        mass: 0.8,
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: widget.width,
        height: widget.height,
        zIndex: isDragging ? 35 : 10,
      }}
      className={`pointer-events-auto rounded-3xl p-3.5 flex flex-col group overflow-hidden transition-all duration-300 ${getAccentGlow()}`}
    >
      {/* Luxury Glass Backdrop Container */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 18, 27, 0.78) 0%, rgba(8, 9, 14, 0.88) 100%)',
          backdropFilter: 'blur(36px) saturate(190%)',
          WebkitBackdropFilter: 'blur(36px) saturate(190%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: isDragging
            ? '0 30px 70px rgba(0,0,0,0.85), 0 0 25px rgba(168,85,247,0.25), inset 0 1px 0 rgba(255,255,255,0.2)'
            : '0 16px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      />

      {/* Widget Header Strip */}
      <div className="relative z-10 h-5 flex items-center justify-between text-white/50 text-[10px] mb-2 select-none">
        <div className="flex items-center gap-1.5 font-semibold text-white/80 cursor-grab active:cursor-grabbing">
          {widget.type === 'clock' && <Clock size={11} className="text-purple-400" />}
          {widget.type === 'weather' && <CloudSun size={11} className="text-sky-400" />}
          {widget.type === 'system' && <Cpu size={11} className="text-emerald-400" />}
          {widget.type === 'notes' && <StickyNote size={11} className="text-amber-400" />}
          {widget.type === 'media' && <Music size={11} className="text-pink-400" />}
          <span className="tracking-wide">{widget.title}</span>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
      </div>
    </motion.div>
  );
};

// 1. Astronomical Chronometer (Smooth 60fps Continuous Sweep Dial)
const ClockWidgetBody: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [digitalTime, setDigitalTime] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [tzStr, setTzStr] = useState<string>('');

  useEffect(() => {
    let animId: number;

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

          // Outer glowing ring
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();

          // Minute tick marks
          for (let i = 0; i < 12; i++) {
            const angle = (i * Math.PI) / 6;
            const isMajor = i % 3 === 0;
            const innerR = isMajor ? r - 6 : r - 3;
            ctx.strokeStyle = isMajor ? '#a855f7' : 'rgba(255, 255, 255, 0.2)';
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

          // Second Hand (Cyan sweep with counter-balance)
          const sAngle = (s * Math.PI) / 30 - Math.PI / 2;
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.2;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(cx - Math.cos(sAngle) * (r * 0.2), cy - Math.sin(sAngle) * (r * 0.2));
          ctx.lineTo(cx + Math.cos(sAngle) * (r * 0.86), cy + Math.sin(sAngle) * (r * 0.86));
          ctx.stroke();
        }
      }

      // Update digital label
      setDigitalTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setDateStr(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }));
      setTzStr(
        Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop()?.replace(/_/g, ' ') || 'Local'
      );

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="h-full flex items-center justify-around gap-2 px-1">
      <canvas ref={canvasRef} width={68} height={68} className="flex-none rounded-full" />
      <div className="text-left min-w-0">
        <div className="text-xl font-mono font-bold text-white tracking-tight drop-shadow-md truncate">
          {digitalTime || '12:00:00'}
        </div>
        <div className="text-[11px] text-purple-300/80 font-medium tracking-wide">
          {dateStr}
        </div>
        <div className="text-[9px] text-white/40 font-mono tracking-wider uppercase mt-0.5">
          {tzStr}
        </div>
      </div>
    </div>
  );
};

// 2. Global Weather Radar (Dynamic Forecast & Sensor Telemetry)
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
            <span className="text-2xl font-bold font-mono text-white tracking-tight">
              {displayTemp}°
            </span>
            <button
              onClick={() => {
                sound.playClick();
                setIsFahrenheit(!isFahrenheit);
              }}
              className="text-[10px] font-mono text-sky-400 hover:text-sky-300 uppercase underline"
            >
              {isFahrenheit ? 'F' : 'C'}
            </button>
          </div>
          <div className="text-[11px] text-sky-300 font-medium tracking-wide">
            {weather.condition}
          </div>
        </div>

        <div className="text-right text-[10px] text-white/50 space-y-0.5">
          <div className="font-semibold text-white/80">{weather.city}</div>
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
        <div className="p-1 rounded-lg bg-white/[0.03]">
          <div className="text-[9px] text-white/40">Today</div>
          <div className="font-semibold text-sky-300">{displayTemp}°</div>
        </div>
        <div className="p-1 rounded-lg bg-white/[0.03]">
          <div className="text-[9px] text-white/40">Tomorrow</div>
          <div className="font-semibold text-white/80">{displayTemp + 1}°</div>
        </div>
        <div className="p-1 rounded-lg bg-white/[0.03]">
          <div className="text-[9px] text-white/40">Sun</div>
          <div className="font-semibold text-white/80">{displayTemp - 2}°</div>
        </div>
      </div>
    </div>
  );
};

// 3. Resource Telemetry Monitor (Live Real-Time SVG Compute Graph)
const SystemWidgetBody: React.FC = () => {
  const [cpuUsage, setCpuUsage] = useState<number>(18);
  const [ramUsage, setRamUsage] = useState<number>(42);
  const [history, setHistory] = useState<number[]>([15, 20, 18, 25, 22, 19, 28, 24, 30, 22]);

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
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  // Compute SVG sparkline path
  const points = history
    .map((val, idx) => {
      const x = (idx / (history.length - 1)) * 200;
      const y = 30 - (val / 100) * 26;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="h-full flex flex-col justify-between text-xs">
      {/* Live Compute Wave Chart */}
      <div className="relative h-8 w-full rounded-lg bg-black/40 border border-white/5 overflow-hidden flex items-center px-1">
        <svg viewBox="0 0 200 32" className="w-full h-full">
          <defs>
            <linearGradient id="cpuGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <polygon points={`0,32 ${points} 200,32`} fill="url(#cpuGrad)" />
          <polyline points={points} fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <div className="absolute right-2 top-1 text-[9px] font-mono text-purple-300 font-bold">
          {cpuUsage}% JIT
        </div>
      </div>

      {/* Compute & RAM Dual Gauges */}
      <div className="space-y-1.5 mt-1">
        <div>
          <div className="flex justify-between text-[10px] text-white/70 mb-0.5">
            <span>CPU Compute Load</span>
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
            <span>JS Memory Pool</span>
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

// 4. Quick Scratchpad (Notes with Word Count & Copy Action)
const NotesWidgetBody: React.FC<{
  widget: DesktopWidget;
  updateData: (id: string, data: any) => void;
}> = ({ widget, updateData }) => {
  const text = widget.data?.text || '';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const handleClear = () => {
    sound.playClick();
    updateData(widget.id, { text: '' });
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="h-full flex flex-col justify-between">
      <textarea
        value={text}
        onChange={(e) => updateData(widget.id, { text: e.target.value })}
        placeholder="Type quick thoughts, code snippets, or notes..."
        className="w-full flex-1 bg-transparent resize-none text-xs text-amber-100/90 focus:outline-none placeholder:text-white/20 select-text leading-relaxed font-sans"
      />
      <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px] text-white/40">
        <span>{wordCount} words | {text.length} chars</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-all"
            title="Copy Note"
          >
            {copied ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handleClear}
            className="p-1 rounded hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors"
            title="Clear Note"
          >
            <Trash2 size={10} />
          </button>
        </div>
      </div>
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
    <div className="h-full flex flex-col justify-between">
      <div className="flex items-center gap-3">
        {/* Animated Vinyl Record Badge */}
        <div className="relative flex-none">
          <img
            src={nowPlaying?.cover || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop'}
            alt=""
            className={`w-11 h-11 rounded-xl object-cover shadow-lg border border-white/15 ${
              isPlaying ? 'animate-[spin_6s_linear_infinite]' : ''
            }`}
          />
          {isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-2.5 h-2.5 rounded-full bg-black/80 border border-white/40" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-white truncate drop-shadow-sm">
            {nowPlaying?.title || 'Celestial Harmony'}
          </div>
          <div className="text-[10px] text-pink-300/80 truncate">
            {nowPlaying?.artist || 'Godly OS Ambient'}
          </div>

          {/* Equalizer Visualizer Bars */}
          <div className="flex items-end gap-0.5 h-3 mt-1">
            {[40, 80, 50, 100, 60].map((h, i) => (
              <div
                key={i}
                className="w-1 bg-pink-400 rounded-full transition-all duration-200"
                style={{
                  height: isPlaying ? `${Math.max(20, (h + Math.random() * 40) % 100)}%` : '20%',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Player Controls & Scrubber */}
      <div className="flex items-center justify-between pt-1 border-t border-white/10">
        <div className="text-[9px] font-mono text-white/40">
          {isPlaying ? '0:42 / 3:18' : 'Ready'}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              toggleMusic();
            }}
            className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 hover:scale-105 active:scale-95 text-white flex items-center justify-center shadow-lg transition-transform"
          >
            {isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
          </button>
          <button
            onClick={() => {
              sound.playClick();
              nextTrack();
            }}
            className="p-1 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <SkipForward size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
