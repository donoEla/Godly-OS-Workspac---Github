import React, { useState, useEffect, useRef } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { Clock, CloudSun, Cpu, StickyNote, Music, Lock, Unlock, X, Play, Pause, SkipForward } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { DesktopWidget } from '../../types/os';
import { sound } from '../../utils/sound';

export const DesktopWidgetsLayer: React.FC = () => {
  const { widgets, updateWidgetBounds, toggleWidgetLock, toggleWidgetVisibility, updateWidgetData, nowPlaying, togglePlayPauseNowPlaying, nextTrackNowPlaying } = useOS();

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden select-none">
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
  const handleDragEnd = (_e: any, info: PanInfo) => {
    if (widget.isLocked) return;
    const newX = Math.max(10, Math.min(window.innerWidth - widget.width - 10, widget.x + info.offset.x));
    const newY = Math.max(10, Math.min(window.innerHeight - widget.height - 60, widget.y + info.offset.y));
    updateBounds(widget.id, { x: newX, y: newY });
    sound.playSnap();
  };

  return (
    <motion.div
      drag={!widget.isLocked}
      dragMomentum={false}
      dragElastic={0.06}
      onDragEnd={handleDragEnd}
      className="absolute pointer-events-auto rounded-3xl bg-black/45 backdrop-blur-2xl border border-white/10 p-3.5 shadow-2xl flex flex-col group overflow-hidden"
      style={{
        left: widget.x,
        top: widget.y,
        width: widget.width,
        height: widget.height,
        boxShadow: '0 16px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}
    >
      {/* Widget Mini Titlebar Header */}
      <div className="h-5 flex items-center justify-between text-white/50 text-[10px] mb-2 select-none">
        <div className="flex items-center gap-1.5 font-semibold text-white/70">
          {widget.type === 'clock' && <Clock size={11} className="text-purple-400" />}
          {widget.type === 'weather' && <CloudSun size={11} className="text-sky-400" />}
          {widget.type === 'system' && <Cpu size={11} className="text-emerald-400" />}
          {widget.type === 'notes' && <StickyNote size={11} className="text-amber-400" />}
          {widget.type === 'media' && <Music size={11} className="text-pink-400" />}
          <span>{widget.title}</span>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => toggleLock(widget.id)}
            className="p-0.5 rounded hover:bg-white/10 text-white/60 hover:text-white"
            title={widget.isLocked ? 'Unlock widget' : 'Lock position'}
          >
            {widget.isLocked ? <Lock size={10} /> : <Unlock size={10} />}
          </button>
          <button
            onClick={() => toggleVisibility(widget.id)}
            className="p-0.5 rounded hover:bg-red-500/20 text-white/60 hover:text-red-400"
            title="Hide widget"
          >
            <X size={10} />
          </button>
        </div>
      </div>

      {/* Widget Specific Body */}
      <div className="flex-1 overflow-hidden">
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

// 1. Clock Body (Analog Canvas + Digital)
const ClockWidgetBody: React.FC = () => {
  const [now, setNow] = useState(new Date());
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = canvas.width / 2 - 4;

    // Face
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Center dot
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();

    // Hands
    const h = now.getHours() % 12;
    const m = now.getMinutes();
    const s = now.getSeconds();

    // Hour hand
    const hAngle = ((h + m / 60) * Math.PI) / 6 - Math.PI / 2;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(hAngle) * (r * 0.5), cy + Math.sin(hAngle) * (r * 0.5));
    ctx.stroke();

    // Minute hand
    const mAngle = (m * Math.PI) / 30 - Math.PI / 2;
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(mAngle) * (r * 0.72), cy + Math.sin(mAngle) * (r * 0.72));
    ctx.stroke();

    // Second hand
    const sAngle = (s * Math.PI) / 30 - Math.PI / 2;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(sAngle) * (r * 0.85), cy + Math.sin(sAngle) * (r * 0.85));
    ctx.stroke();
  }, [now]);

  return (
    <div className="h-full flex items-center justify-around">
      <canvas ref={canvasRef} width={64} height={64} className="rounded-full" />
      <div className="text-left">
        <div className="text-xl font-mono font-bold text-white tracking-tight">
          {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="text-[10px] text-white/50 font-medium">
          {now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
      </div>
    </div>
  );
};

// 2. Weather Body (Open-Meteo API)
const WeatherWidgetBody: React.FC = () => {
  const [weather, setWeather] = useState<{ temp: number; wind: number; code: string }>({
    temp: 21,
    wind: 12,
    code: 'Clear Skies',
  });

  useEffect(() => {
    // Open-Meteo free API
    fetch('https://api.open-meteo.com/v1/forecast?latitude=40.71&longitude=-74.01&current_weather=true')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.current_weather) {
          setWeather({
            temp: Math.round(data.current_weather.temperature),
            wind: Math.round(data.current_weather.windspeed),
            code: 'Sunny / Clear',
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold font-mono text-white">{weather.temp}°C</div>
          <div className="text-[10px] text-sky-300 font-medium">{weather.code}</div>
        </div>
        <div className="text-right text-[10px] text-white/50">
          <div>New York, NY</div>
          <div>Wind: {weather.wind} km/h</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1 pt-1 border-t border-white/10 text-center text-[9px] text-white/60">
        <div>Today: {weather.temp}°</div>
        <div>Sat: {weather.temp + 1}°</div>
        <div>Sun: {weather.temp - 2}°</div>
      </div>
    </div>
  );
};

// 3. System CPU/RAM Body
const SystemWidgetBody: React.FC = () => {
  const [cpuUsage, setCpuUsage] = useState<number>(18);
  const [ramUsage, setRamUsage] = useState<number>(42);

  useEffect(() => {
    const timer = setInterval(() => {
      // Calculate estimated memory via performance.memory if available
      let mem = 42;
      const perfMem = (performance as any).memory;
      if (perfMem) {
        mem = Math.round((perfMem.usedJSHeapSize / perfMem.jsHeapSizeLimit) * 100);
      } else {
        mem = 38 + Math.round(Math.random() * 8);
      }
      setRamUsage(mem);
      setCpuUsage(12 + Math.round(Math.random() * 24));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-full flex flex-col justify-around text-xs">
      <div>
        <div className="flex justify-between text-[10px] text-white/70 mb-1">
          <span>CPU Compute Load</span>
          <span className="font-mono text-purple-400 font-bold">{cpuUsage}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${cpuUsage}%` }} />
        </div>
      </div>

      <div>
        <div className="flex justify-between text-[10px] text-white/70 mb-1">
          <span>JS Memory Pool</span>
          <span className="font-mono text-emerald-400 font-bold">{ramUsage}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${ramUsage}%` }} />
        </div>
      </div>
    </div>
  );
};

// 4. Notes Body
const NotesWidgetBody: React.FC<{ widget: DesktopWidget; updateData: (id: string, data: any) => void }> = ({ widget, updateData }) => {
  const text = widget.data?.text || '';
  return (
    <textarea
      value={text}
      onChange={(e) => updateData(widget.id, { text: e.target.value })}
      placeholder="Type sticky notes..."
      className="w-full h-full bg-transparent resize-none text-xs text-amber-200/90 focus:outline-none placeholder:text-white/20 select-text"
    />
  );
};

// 5. Media Player Body
const MediaWidgetBody: React.FC<{ nowPlaying: any; toggleMusic: () => void; nextTrack: () => void }> = ({ nowPlaying, toggleMusic, nextTrack }) => {
  return (
    <div className="h-full flex flex-col justify-between">
      <div className="flex items-center gap-3">
        <img src={nowPlaying.cover} alt="" className="w-10 h-10 rounded-xl object-cover shadow-md" />
        <div className="min-w-0">
          <div className="text-xs font-bold text-white truncate">{nowPlaying.title}</div>
          <div className="text-[10px] text-white/50 truncate">{nowPlaying.artist}</div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 pt-1">
        <button
          onClick={toggleMusic}
          className="w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-lg transition-transform active:scale-90"
        >
          {nowPlaying.isPlaying ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
        </button>
        <button
          onClick={nextTrack}
          className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
        >
          <SkipForward size={14} />
        </button>
      </div>
    </div>
  );
};
