import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Clock,
  CloudSun,
  Cpu,
  StickyNote,
  Music,
  Quote,
  LayoutGrid,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  RotateCcw,
  Sliders,
  SlidersHorizontal,
  Layers,
  Palette,
  Maximize2,
  Copy,
  Check,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckSquare,
  Square,
  Download,
  Upload,
  RefreshCw,
  Sun,
  Zap,
} from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { DesktopWidget, WidgetType } from '../../types/os';
import { sound } from '../../utils/sound';
import { WidgetsIcon } from '../icons/WidgetsIcon';

interface WidgetTemplate {
  type: WidgetType;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  borderColor: string;
  defaultWidth: number;
  defaultHeight: number;
  category: 'System' | 'Utility' | 'Media' | 'Lifestyle';
}

const WIDGET_TEMPLATES: WidgetTemplate[] = [
  {
    type: 'clock',
    title: 'Astronomical Chronometer',
    description: 'Continuous 60fps analog sweep chronometer with sub-second accuracy and local timezone.',
    icon: Clock,
    color: 'from-purple-500/20 to-indigo-500/10 text-purple-400',
    borderColor: 'border-purple-500/30',
    defaultWidth: 290,
    defaultHeight: 154,
    category: 'Utility',
  },
  {
    type: 'weather',
    title: 'Global Weather Radar',
    description: 'Atmospheric telemetry with °C/°F toggle, wind, humidity, and 3-day meteorological forecast.',
    icon: CloudSun,
    color: 'from-sky-500/20 to-blue-500/10 text-sky-400',
    borderColor: 'border-sky-500/30',
    defaultWidth: 290,
    defaultHeight: 154,
    category: 'Lifestyle',
  },
  {
    type: 'system',
    title: 'Resource Telemetry HUD',
    description: 'Real-time CPU compute sparkline wave chart, dual glowing RAM gauges, and system telemetry.',
    icon: Cpu,
    color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400',
    borderColor: 'border-emerald-500/30',
    defaultWidth: 290,
    defaultHeight: 160,
    category: 'System',
  },
  {
    type: 'notes',
    title: 'Quick Scratchpad & Tasks',
    description: 'Persistent desktop scratchpad with multi-line text vault and interactive checklist.',
    icon: StickyNote,
    color: 'from-amber-500/20 to-orange-500/10 text-amber-400',
    borderColor: 'border-amber-500/30',
    defaultWidth: 290,
    defaultHeight: 190,
    category: 'Utility',
  },
  {
    type: 'media',
    title: 'Aura Media Controller',
    description: 'Analog spinning vinyl record, real-time 5-band audio visualizer, and track scrubber.',
    icon: Music,
    color: 'from-pink-500/20 to-rose-500/10 text-pink-400',
    borderColor: 'border-pink-500/30',
    defaultWidth: 290,
    defaultHeight: 160,
    category: 'Media',
  },
  {
    type: 'quote',
    title: 'Celestial Wisdom',
    description: 'Inspirational reflections, daily stoic philosophy, and timeless celestial aphorisms.',
    icon: Quote,
    color: 'from-violet-500/20 to-fuchsia-500/10 text-fuchsia-400',
    borderColor: 'border-fuchsia-500/30',
    defaultWidth: 290,
    defaultHeight: 130,
    category: 'Lifestyle',
  },
  {
    type: 'launcher',
    title: 'Quick App Dock',
    description: 'Customizable desktop dock for lightning-fast one-click launches of your favorite apps.',
    icon: Compass,
    color: 'from-cyan-500/20 to-blue-500/10 text-cyan-400',
    borderColor: 'border-cyan-500/30',
    defaultWidth: 290,
    defaultHeight: 110,
    category: 'Utility',
  },
];

export const WidgetsApp: React.FC = () => {
  const {
    widgets,
    addWidget,
    removeWidget,
    updateWidget,
    resetWidgetsToDefault,
    setAllWidgetsVisibility,
    lockAllWidgets,
    alignWidgets,
  } = useOS();

  const [activeTab, setActiveTab] = useState<'manage' | 'gallery' | 'presets'>('manage');
  const [selectedWidgetId, setSelectedWidgetId] = useState<string>(widgets[0]?.id || '');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const selectedWidget = widgets.find((w) => w.id === selectedWidgetId) || widgets[0];

  const handleAddTemplate = (template: WidgetTemplate) => {
    sound.playClick();
    const isBrowser = typeof window !== 'undefined';
    const screenW = isBrowser ? window.innerWidth : 1280;
    const rightX = Math.max(680, screenW - 320);

    // Compute non-overlapping initial Y
    const activeWidgets = widgets.filter((w) => w.isVisible);
    const maxY = activeWidgets.reduce((max, w) => Math.max(max, w.y + w.height), 20);
    const startY = maxY + 16 > 700 ? 40 : maxY + 16;

    addWidget({
      type: template.type,
      title: template.title,
      width: template.defaultWidth,
      height: template.defaultHeight,
      x: rightX,
      y: startY,
      isVisible: true,
      scale: 1,
      opacity: 1,
      blur: 28,
      theme: 'glass',
    });

    setActiveTab('manage');
  };

  const handleCopyLayoutJson = () => {
    navigator.clipboard.writeText(JSON.stringify(widgets, null, 2));
    setCopiedId('export');
    setTimeout(() => setCopiedId(null), 2000);
    sound.playSnap();
  };

  return (
    <div className="flex h-full w-full bg-[#07090e] text-slate-100 font-sans select-none overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-64 border-r border-white/10 bg-black/40 backdrop-blur-2xl flex flex-col justify-between p-4">
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center gap-3 px-1 py-1">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
              <WidgetsIcon size={36} className="w-9 h-9" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white">Widgets Studio</h2>
              <p className="text-[11px] text-white/50 font-mono">Godly OS Desktop Engine</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-col gap-1 mt-2">
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('manage');
              }}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'manage'
                  ? 'bg-purple-600/25 text-purple-200 border border-purple-500/40 shadow-lg shadow-purple-500/10'
                  : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="w-4 h-4 text-purple-400" />
                <span>Active Widgets</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/10 font-mono font-bold text-white/90">
                {widgets.filter((w) => w.isVisible).length} / {widgets.length}
              </span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('gallery');
              }}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'gallery'
                  ? 'bg-purple-600/25 text-purple-200 border border-purple-500/40 shadow-lg shadow-purple-500/10'
                  : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Widget Gallery</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                +{WIDGET_TEMPLATES.length}
              </span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('presets');
              }}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'presets'
                  ? 'bg-purple-600/25 text-purple-200 border border-purple-500/40 shadow-lg shadow-purple-500/10'
                  : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <LayoutGrid className="w-4 h-4 text-amber-400" />
              <span>Layout & Presets</span>
            </button>
          </div>

          {/* Quick List of Configured Widgets */}
          {activeTab === 'manage' && (
            <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-white/10">
              <span className="text-[10px] uppercase tracking-wider font-bold text-white/40 px-1">
                Configured Widgets
              </span>
              <div className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1">
                {widgets.map((w) => {
                  const isSelected = selectedWidget?.id === w.id;
                  return (
                    <button
                      key={w.id}
                      onClick={() => {
                        sound.playClick();
                        setSelectedWidgetId(w.id);
                      }}
                      className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all text-left ${
                        isSelected
                          ? 'bg-white/15 text-white font-semibold border border-purple-400/40'
                          : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            w.isVisible ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-white/20'
                          }`}
                        />
                        <span className="truncate">{w.title}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {w.isLocked && <Lock className="w-3 h-3 text-amber-400/80" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Global Controls Footer */}
        <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setAllWidgetsVisibility(true)}
              className="py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-medium text-white/80 hover:text-white transition-all text-center"
            >
              Show All
            </button>
            <button
              onClick={() => setAllWidgetsVisibility(false)}
              className="py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-medium text-white/80 hover:text-white transition-all text-center"
            >
              Hide All
            </button>
          </div>
          <button
            onClick={resetWidgetsToDefault}
            className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-[11px] font-medium text-red-300 hover:text-red-200 transition-all"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Factory Layout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto p-6 bg-gradient-to-br from-[#0c0f1d] to-[#05060a]">
        <AnimatePresence mode="wait">
          {/* TAB 1: ACTIVE WIDGETS MANAGER & CUSTOMIZER */}
          {activeTab === 'manage' && selectedWidget && (
            <motion.div
              key="tab-manage"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              {/* Selected Widget Header Banner */}
              <div className="flex items-center justify-between p-5 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-2xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
                    {selectedWidget.type === 'clock' && <Clock className="w-6 h-6" />}
                    {selectedWidget.type === 'weather' && <CloudSun className="w-6 h-6" />}
                    {selectedWidget.type === 'system' && <Cpu className="w-6 h-6" />}
                    {selectedWidget.type === 'notes' && <StickyNote className="w-6 h-6" />}
                    {selectedWidget.type === 'media' && <Music className="w-6 h-6" />}
                    {selectedWidget.type === 'quote' && <Quote className="w-6 h-6" />}
                    {selectedWidget.type === 'launcher' && <Compass className="w-6 h-6" />}
                  </div>
                  <div>
                    <input
                      type="text"
                      value={selectedWidget.title}
                      onChange={(e) => updateWidget(selectedWidget.id, { title: e.target.value })}
                      className="text-base font-bold text-white bg-transparent border-b border-transparent hover:border-white/20 focus:border-purple-400 focus:outline-none transition-colors"
                      title="Click to rename widget"
                    />
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-mono text-purple-300 uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                        {selectedWidget.type}
                      </span>
                      <span className="text-xs text-white/40">ID: {selectedWidget.id}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateWidget(selectedWidget.id, { isVisible: !selectedWidget.isVisible })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                      selectedWidget.isVisible
                        ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                        : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                    }`}
                  >
                    {selectedWidget.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{selectedWidget.isVisible ? 'Visible' : 'Hidden'}</span>
                  </button>

                  <button
                    onClick={() => updateWidget(selectedWidget.id, { isLocked: !selectedWidget.isLocked })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                      selectedWidget.isLocked
                        ? 'bg-amber-500/20 border-amber-500/30 text-amber-300'
                        : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                    }`}
                  >
                    {selectedWidget.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    <span>{selectedWidget.isLocked ? 'Locked' : 'Unlocked'}</span>
                  </button>

                  <button
                    onClick={() => removeWidget(selectedWidget.id)}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-200 transition-colors"
                    title="Delete widget from desktop"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Customizer Grid */}
              <div className="grid grid-cols-2 gap-5">
                {/* Visual Styling Card */}
                <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col gap-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                    <Palette className="w-4 h-4 text-purple-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white/80">Visual Styling</h3>
                  </div>

                  {/* Scale Selector */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-white/70 font-medium">Widget Scale</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[0.85, 1.0, 1.15, 1.25].map((s) => (
                        <button
                          key={s}
                          onClick={() => updateWidget(selectedWidget.id, { scale: s })}
                          className={`py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            (selectedWidget.scale || 1) === s
                              ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                              : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {Math.round(s * 100)}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Opacity Slider */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs text-white/70 font-medium">
                      <span>Opacity</span>
                      <span className="font-mono text-purple-300">
                        {Math.round((selectedWidget.opacity ?? 1) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.3"
                      max="1"
                      step="0.05"
                      value={selectedWidget.opacity ?? 1}
                      onChange={(e) => updateWidget(selectedWidget.id, { opacity: parseFloat(e.target.value) })}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                  </div>

                  {/* Glass Blur Selector */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-white/70 font-medium">Glassmorphism Blur</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Crisp (12px)', val: 12 },
                        { label: 'Vision (28px)', val: 28 },
                        { label: 'Deep (45px)', val: 45 },
                      ].map((b) => (
                        <button
                          key={b.val}
                          onClick={() => updateWidget(selectedWidget.id, { blur: b.val })}
                          className={`py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            (selectedWidget.blur ?? 28) === b.val
                              ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                              : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Theme Accent Glow */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-white/70 font-medium">Aura Accent Theme</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'glass', label: 'Default', bg: 'bg-slate-700' },
                        { id: 'cyber', label: 'Cyber', bg: 'bg-cyan-500' },
                        { id: 'gold', label: 'Golden', bg: 'bg-amber-500' },
                        { id: 'obsidian', label: 'Obsidian', bg: 'bg-black' },
                      ].map((th) => (
                        <button
                          key={th.id}
                          onClick={() => updateWidget(selectedWidget.id, { theme: th.id as any })}
                          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            (selectedWidget.theme || 'glass') === th.id
                              ? 'bg-white/20 text-white border-purple-400 shadow-md'
                              : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${th.bg}`} />
                          <span>{th.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Geometry & Coordinates Card */}
                <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col gap-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                    <Maximize2 className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white/80">Position & Dimensions</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-white/60">Position X (px)</label>
                      <input
                        type="number"
                        value={selectedWidget.x}
                        onChange={(e) => updateWidget(selectedWidget.id, { x: parseInt(e.target.value) || 0 })}
                        className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-white/60">Position Y (px)</label>
                      <input
                        type="number"
                        value={selectedWidget.y}
                        onChange={(e) => updateWidget(selectedWidget.id, { y: parseInt(e.target.value) || 0 })}
                        className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-white/60">Width (px)</label>
                      <input
                        type="number"
                        value={selectedWidget.width}
                        onChange={(e) => updateWidget(selectedWidget.id, { width: parseInt(e.target.value) || 200 })}
                        className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-white/60">Height (px)</label>
                      <input
                        type="number"
                        value={selectedWidget.height}
                        onChange={(e) => updateWidget(selectedWidget.id, { height: parseInt(e.target.value) || 120 })}
                        className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  {/* Quick Snap Shortcuts */}
                  <div className="flex flex-col gap-1.5 mt-2">
                    <label className="text-xs text-white/70 font-medium">Quick Align Presets</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => {
                          const w = typeof window !== 'undefined' ? window.innerWidth : 1280;
                          updateWidget(selectedWidget.id, { x: Math.max(680, w - selectedWidget.width - 24), y: 28 });
                          sound.playSnap();
                        }}
                        className="py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-medium text-white/80 transition-all text-center"
                      >
                        Top Right
                      </button>
                      <button
                        onClick={() => {
                          const w = typeof window !== 'undefined' ? window.innerWidth : 1280;
                          const h = typeof window !== 'undefined' ? window.innerHeight : 800;
                          updateWidget(selectedWidget.id, {
                            x: Math.round((w - selectedWidget.width) / 2),
                            y: Math.round((h - selectedWidget.height) / 2),
                          });
                          sound.playSnap();
                        }}
                        className="py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-medium text-white/80 transition-all text-center"
                      >
                        Center
                      </button>
                      <button
                        onClick={() => {
                          updateWidget(selectedWidget.id, { x: 24, y: 28 });
                          sound.playSnap();
                        }}
                        className="py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-medium text-white/80 transition-all text-center"
                      >
                        Top Left
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Widget-Specific Settings Card */}
              <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col gap-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white/80">
                    {selectedWidget.type.toUpperCase()} Specific Settings
                  </h3>
                </div>

                {/* Clock Specifics */}
                {selectedWidget.type === 'clock' && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/70 font-medium">Time Format</label>
                      <select
                        value={selectedWidget.config?.format || '12h'}
                        onChange={(e) =>
                          updateWidget(selectedWidget.id, {
                            config: { ...selectedWidget.config, format: e.target.value },
                          })
                        }
                        className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none"
                      >
                        <option value="12h">12-Hour AM/PM</option>
                        <option value="24h">24-Hour Military</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/70 font-medium">Sweep Second Hand</label>
                      <select
                        value={selectedWidget.config?.showSeconds ?? 'true'}
                        onChange={(e) =>
                          updateWidget(selectedWidget.id, {
                            config: { ...selectedWidget.config, showSeconds: e.target.value === 'true' },
                          })
                        }
                        className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none"
                      >
                        <option value="true">Continuous 60fps Sweep</option>
                        <option value="false">Hidden (Battery Saver)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/70 font-medium">Timezone Mode</label>
                      <select
                        value={selectedWidget.config?.timezone || 'local'}
                        onChange={(e) =>
                          updateWidget(selectedWidget.id, {
                            config: { ...selectedWidget.config, timezone: e.target.value },
                          })
                        }
                        className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none"
                      >
                        <option value="local">Local System Time</option>
                        <option value="UTC">UTC Universal</option>
                        <option value="America/New_York">New York (EST)</option>
                        <option value="Asia/Tokyo">Tokyo (JST)</option>
                        <option value="Europe/London">London (GMT)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Weather Specifics */}
                {selectedWidget.type === 'weather' && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/70 font-medium">City Location</label>
                      <select
                        value={selectedWidget.config?.city || 'Tokyo'}
                        onChange={(e) =>
                          updateWidget(selectedWidget.id, {
                            config: { ...selectedWidget.config, city: e.target.value },
                          })
                        }
                        className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none"
                      >
                        <option value="Tokyo">Tokyo, Japan</option>
                        <option value="New York">New York, USA</option>
                        <option value="London">London, UK</option>
                        <option value="San Francisco">San Francisco, USA</option>
                        <option value="Paris">Paris, France</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/70 font-medium">Temperature Unit</label>
                      <select
                        value={selectedWidget.config?.unit || 'C'}
                        onChange={(e) =>
                          updateWidget(selectedWidget.id, {
                            config: { ...selectedWidget.config, unit: e.target.value },
                          })
                        }
                        className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none"
                      >
                        <option value="C">Celsius (°C)</option>
                        <option value="F">Fahrenheit (°F)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/70 font-medium">Forecast Mini Bar</label>
                      <select
                        value={selectedWidget.config?.showForecast ?? 'true'}
                        onChange={(e) =>
                          updateWidget(selectedWidget.id, {
                            config: { ...selectedWidget.config, showForecast: e.target.value === 'true' },
                          })
                        }
                        className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none"
                      >
                        <option value="true">Enabled (3-Day)</option>
                        <option value="false">Disabled (Minimalist)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* System HUD Specifics */}
                {selectedWidget.type === 'system' && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/70 font-medium">Sparkline Waveform Color</label>
                      <select
                        value={selectedWidget.config?.sparkColor || '#34d399'}
                        onChange={(e) =>
                          updateWidget(selectedWidget.id, {
                            config: { ...selectedWidget.config, sparkColor: e.target.value },
                          })
                        }
                        className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none"
                      >
                        <option value="#34d399">Emerald Matrix</option>
                        <option value="#38bdf8">Cyber Blue</option>
                        <option value="#a855f7">Neon Violet</option>
                        <option value="#fbbf24">Golden Plasma</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/70 font-medium">Telemetry Refresh Rate</label>
                      <select
                        value={selectedWidget.config?.refreshRate || 'balanced'}
                        onChange={(e) =>
                          updateWidget(selectedWidget.id, {
                            config: { ...selectedWidget.config, refreshRate: e.target.value },
                          })
                        }
                        className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none"
                      >
                        <option value="fast">Ultra (60fps live stream)</option>
                        <option value="balanced">Balanced (1s interval)</option>
                        <option value="eco">Eco Mode (3s interval)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/70 font-medium">RAM Telemetry Gauge</label>
                      <select
                        value={selectedWidget.config?.showRam ?? 'true'}
                        onChange={(e) =>
                          updateWidget(selectedWidget.id, {
                            config: { ...selectedWidget.config, showRam: e.target.value === 'true' },
                          })
                        }
                        className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none"
                      >
                        <option value="true">Show Dual Gauges</option>
                        <option value="false">CPU Only</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Notes & Scratchpad Specifics */}
                {selectedWidget.type === 'notes' && (
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-white/70 font-medium">Typography Style</label>
                        <select
                          value={selectedWidget.config?.fontFamily || 'Inter'}
                          onChange={(e) =>
                            updateWidget(selectedWidget.id, {
                              config: { ...selectedWidget.config, fontFamily: e.target.value },
                            })
                          }
                          className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none"
                        >
                          <option value="Inter">Modern Sans (Inter)</option>
                          <option value="JetBrains Mono">Cyber Monospace (JetBrains Mono)</option>
                          <option value="serif">Classic Editorial (Serif)</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-white/70 font-medium">Default Mode</label>
                        <select
                          value={selectedWidget.config?.defaultMode || 'notes'}
                          onChange={(e) =>
                            updateWidget(selectedWidget.id, {
                              config: { ...selectedWidget.config, defaultMode: e.target.value },
                            })
                          }
                          className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none"
                        >
                          <option value="notes">Text Scratchpad</option>
                          <option value="tasks">Interactive Checklist</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quote Specifics */}
                {selectedWidget.type === 'quote' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/70 font-medium">Quote Theme</label>
                      <select
                        value={selectedWidget.data?.category || 'stoic'}
                        onChange={(e) =>
                          updateWidget(selectedWidget.id, {
                            data: { ...selectedWidget.data, category: e.target.value },
                          })
                        }
                        className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none"
                      >
                        <option value="stoic">Stoic Philosophy</option>
                        <option value="cyber">Cyberpunk & Futurism</option>
                        <option value="universe">Cosmic & Astronomy</option>
                        <option value="wisdom">Ancient Wisdom</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={() => {
                          const quotes = [
                            { quote: 'We suffer more often in imagination than in reality.', author: 'Seneca' },
                            { quote: 'The obstacle is the way.', author: 'Marcus Aurelius' },
                            { quote: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci' },
                            { quote: 'Look up at the stars and not down at your feet.', author: 'Stephen Hawking' },
                            { quote: 'The mind is everything. What you think you become.', author: 'Buddha' },
                          ];
                          const randomQ = quotes[Math.floor(Math.random() * quotes.length)];
                          updateWidget(selectedWidget.id, {
                            data: { ...selectedWidget.data, ...randomQ },
                          });
                          sound.playClick();
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-xs font-semibold text-purple-200 transition-all"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Shuffle Random Quote</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 2: WIDGET GALLERY */}
          {activeTab === 'gallery' && (
            <motion.div
              key="tab-gallery"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-5"
            >
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Widget Gallery</h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Deploy interactive, real-time widgets directly onto your Godly OS desktop.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {WIDGET_TEMPLATES.map((tmpl) => {
                  const Icon = tmpl.icon;
                  const alreadyActive = widgets.some((w) => w.type === tmpl.type && w.isVisible);

                  return (
                    <div
                      key={tmpl.type}
                      className={`p-5 rounded-3xl bg-white/[0.03] hover:bg-white/[0.06] border ${tmpl.borderColor} transition-all flex flex-col justify-between gap-4 group`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-2xl bg-gradient-to-br ${tmpl.color} border border-white/10`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                              {tmpl.title}
                            </div>
                            <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
                              {tmpl.category} • {tmpl.defaultWidth}×{tmpl.defaultHeight}px
                            </span>
                          </div>
                        </div>

                        {alreadyActive && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                            Active
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-white/60 leading-relaxed">{tmpl.description}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <button
                          onClick={() => handleAddTemplate(tmpl)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Desktop</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 3: LAYOUT PRESETS & STUDIO CONTROLS */}
          {activeTab === 'presets' && (
            <motion.div
              key="tab-presets"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Desktop Layout Presets</h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Instantly snap and organize all desktop widgets into cohesive spatial formations.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col justify-between gap-4">
                  <div>
                    <div className="p-3 w-fit rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-3">
                      <LayoutGrid className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Right Sidebar Stack</h4>
                    <p className="text-xs text-white/50 mt-1">
                      Vertical stack anchored to the right screen margin. Zero overlap with left desktop icons.
                    </p>
                  </div>
                  <button
                    onClick={() => alignWidgets('sidebar')}
                    className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all"
                  >
                    Apply Sidebar Stack
                  </button>
                </div>

                <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col justify-between gap-4">
                  <div>
                    <div className="p-3 w-fit rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-3">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Top Horizon Dock</h4>
                    <p className="text-xs text-white/50 mt-1">
                      Horizontal banner array beneath the top screen edge for wide status overview.
                    </p>
                  </div>
                  <button
                    onClick={() => alignWidgets('top')}
                    className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all"
                  >
                    Apply Top Horizon
                  </button>
                </div>

                <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col justify-between gap-4">
                  <div>
                    <div className="p-3 w-fit rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
                      <Layers className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Adaptive Grid</h4>
                    <p className="text-xs text-white/50 mt-1">
                      Flows widgets into balanced rows and columns adapting dynamically to your monitor.
                    </p>
                  </div>
                  <button
                    onClick={() => alignWidgets('grid')}
                    className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all"
                  >
                    Apply Adaptive Grid
                  </button>
                </div>
              </div>

              {/* Master Locks & Layout Backup */}
              <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col gap-4 mt-2">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white/80">Security & Backups</h4>
                  </div>
                  <button
                    onClick={handleCopyLayoutJson}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/30 text-xs font-semibold text-purple-200 transition-all"
                  >
                    {copiedId === 'export' ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'export' ? 'Copied JSON!' : 'Export Layout JSON'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/30 border border-white/5">
                    <div>
                      <div className="text-xs font-semibold text-white">Lock All Widget Positions</div>
                      <div className="text-[11px] text-white/40">Prevents dragging widgets on desktop</div>
                    </div>
                    <button
                      onClick={() => lockAllWidgets(true)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/30 transition-all"
                    >
                      Lock All
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/30 border border-white/5">
                    <div>
                      <div className="text-xs font-semibold text-white">Unlock All Widget Positions</div>
                      <div className="text-[11px] text-white/40">Allows free moving and custom arranging</div>
                    </div>
                    <button
                      onClick={() => lockAllWidgets(false)}
                      className="px-3 py-1.5 rounded-xl bg-white/10 text-white/80 border border-white/10 text-xs font-semibold hover:bg-white/20 transition-all"
                    >
                      Unlock All
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
