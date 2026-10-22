import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import { 
  Palette, 
  Image as ImageIcon, 
  Volume2, 
  Monitor, 
  Cpu, 
  Info, 
  Check, 
  Sun, 
  Moon, 
  Sliders, 
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Shield,
  LayoutGrid,
  ExternalLink,
  Layers,
  Server,
  Globe,
  Radio,
  Zap,
  Calculator,
  FileText,
  Terminal,
  Gamepad2
} from 'lucide-react';
import { WALLPAPERS, ACCENT_CONFIGS, CLOAK_PRESETS } from '../../constants/assets';
import { AccentColor } from '../../types/os';
import { sound } from '../../utils/sound';
import { getActiveWispUrl, setActiveWispUrl, WISP_ENDPOINTS } from '../../utils/uvProxy';
import { getAssetUrl } from '../../utils/assetHelper';
import { useAppSettings } from '../../utils/appSettings';

type SettingsSection = 'wallpapers' | 'appearance' | 'app-settings' | 'proxy' | 'desktop' | 'stealth' | 'display' | 'sound' | 'performance' | 'about';
type AppSettingsSubtab = 'calculator' | 'notes' | 'zen' | 'terminal' | 'games';

export const SettingsApp: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    setWallpaper, 
    setAccentColor, 
    toggleTheme, 
    addNotification,
    applyCloak,
    openAboutBlankCloak,
    panicCloak
  } = useOS();

  const [appSettings, updateAppSettings] = useAppSettings();
  const [activeAppSubtab, setActiveAppSubtab] = useState<AppSettingsSubtab>('calculator');
  const [activeSection, setActiveSection] = useState<SettingsSection>('wallpapers');
  const [selectedWallpaperCategory, setSelectedWallpaperCategory] = useState<string>('All');
  const [wallpaperSearch, setWallpaperSearch] = useState<string>('');
  const [currentWisp, setCurrentWisp] = useState<string>(() => getActiveWispUrl());
  const [customWispInput, setCustomWispInput] = useState<string>('');

  const wallpaperCategories = ['All', 'Dark', 'Abstract', 'Landscape', 'Cyber', 'Minimal'];

  const filteredWallpapers = WALLPAPERS.filter((w) => {
    const matchCat = selectedWallpaperCategory === 'All' || w.category === selectedWallpaperCategory;
    const matchSearch =
      wallpaperSearch.trim() === '' ||
      w.name.toLowerCase().includes(wallpaperSearch.toLowerCase()) ||
      w.fileName.toLowerCase().includes(wallpaperSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="flex h-full w-full bg-[var(--window-glass)] backdrop-blur-2xl text-slate-100 select-none overflow-hidden font-sans">
      {/* Luxury Glass Sidebar */}
      <div className="w-60 bg-black/45 backdrop-blur-2xl border-r border-white/10 flex flex-col p-3.5 flex-shrink-0 shadow-[inset_-1px_0_0_rgba(255,255,255,0.05)]">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-3 bg-white/[0.03] rounded-2xl border border-white/5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-purple-600/30 border border-white/20">
            ⚙
          </div>
          <div>
            <h2 className="text-xs font-bold text-white tracking-wide font-mono">System Settings</h2>
            <p className="text-[10px] text-slate-400">Godly OS Control Center</p>
          </div>
        </div>

        <div className="space-y-1 overflow-y-auto pr-1">
          {[
            { id: 'wallpapers', name: 'Wallpapers', icon: ImageIcon },
            { id: 'appearance', name: 'Colors & Theme', icon: Palette },
            { id: 'app-settings', name: 'Built-in Apps', icon: Sliders },
            { id: 'proxy', name: 'Wisp Proxy Server', icon: Server },
            { id: 'desktop', name: 'Window & Physics', icon: LayoutGrid },
            { id: 'stealth', name: 'Stealth & Cloaking', icon: Shield },
            { id: 'display', name: 'Display & Glass', icon: Monitor },
            { id: 'sound', name: 'Sound & Audio', icon: Volume2 },
            { id: 'performance', name: 'System & CPU', icon: Cpu },
            { id: 'about', name: 'About Godly OS', icon: Info },
          ].map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => {
                  sound.playClick();
                  setActiveSection(sec.id as SettingsSection);
                }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'text-white font-bold border'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
                style={
                  isActive
                    ? {
                        background: 'var(--accent-dim)',
                        borderColor: 'var(--accent-border)',
                        color: 'var(--accent-text)',
                        boxShadow: '0 4px 16px var(--accent-dim)',
                      }
                    : undefined
                }
              >
                <Icon size={15} style={isActive ? { color: 'var(--accent)' } : undefined} />
                <span>{sec.name}</span>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="mt-auto p-3 bg-white/[0.03] rounded-2xl border border-white/5 text-[10px] text-slate-500 text-center font-mono">
          Godly OS v2.4.0 • Build 2026.10
        </div>
      </div>

      {/* Main Settings Panel */}
      <div className="flex-1 p-7 overflow-y-auto bg-black/20">
        {/* Wallpapers Section */}
        {activeSection === 'wallpapers' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Desktop Wallpapers</span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono border border-purple-500/30 font-bold">
                    {WALLPAPERS.length} Wallpapers
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Select any authentic wallpaper from your local filesystem.</p>
              </div>

              {/* Wallpaper search input */}
              <div className="w-full sm:w-60">
                <input
                  type="text"
                  value={wallpaperSearch}
                  onChange={(e) => setWallpaperSearch(e.target.value)}
                  placeholder="Filter wallpapers..."
                  className="w-full bg-white/5 border border-white/10 focus:border-purple-500/50 rounded-2xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all backdrop-blur-md"
                />
              </div>
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap gap-2">
              {wallpaperCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    sound.playClick();
                    setSelectedWallpaperCategory(cat);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedWallpaperCategory === cat
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-400/40'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Thumbnail Grid of Real Backgrounds */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filteredWallpapers.map((wp) => {
                const isSelected = getAssetUrl(settings.wallpaper) === getAssetUrl(wp.path);
                return (
                  <div
                    key={wp.id}
                    onClick={() => {
                      setWallpaper(getAssetUrl(wp.path));
                      addNotification('Wallpaper Changed', `Applied "${wp.name}" to desktop.`, 'success');
                    }}
                    className={`group relative rounded-2xl overflow-hidden border cursor-pointer aspect-video transition-all duration-300 ${
                      isSelected
                        ? 'border-purple-500 ring-2 ring-purple-500/60 shadow-xl shadow-purple-600/30 scale-[1.03]'
                        : 'border-white/10 hover:border-purple-400/40 hover:scale-[1.02] hover:shadow-lg'
                    }`}
                  >
                    <img src={getAssetUrl(wp.path)} alt={wp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end p-2.5">
                      <span className="text-[11px] font-semibold text-white truncate drop-shadow-sm">{wp.name}</span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg border border-white/30">
                        <Check size={13} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Wallpaper Blur Slider */}
            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-white">Wallpaper Background Blur</span>
                <span className="text-xs font-mono font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-lg border border-purple-500/30">{settings.wallpaperBlur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="24"
                step="2"
                value={settings.wallpaperBlur}
                onChange={(e) => updateSettings({ wallpaperBlur: parseInt(e.target.value, 10) })}
                className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          </div>
        )}

        {/* Colors & Appearance Section */}
        {activeSection === 'appearance' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Appearance & Color Scheme</h3>
              <p className="text-xs text-slate-400">Configure visual themes, contrast, and luxury accents.</p>
            </div>

            {/* Theme Toggle Card */}
            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-lg">
              <div>
                <span className="text-sm font-semibold text-white block">Theme Mode</span>
                <span className="text-xs text-slate-400">Current mode: {settings.theme.toUpperCase()}</span>
              </div>
              <div className="flex bg-black/50 border border-white/10 rounded-2xl p-1 gap-1.5 shadow-inner">
                <button
                  onClick={() => {
                    updateSettings({ theme: 'dark' });
                    sound.playClick();
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    settings.theme === 'dark' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md border border-white/20' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Moon size={13} />
                  Dark
                </button>
                <button
                  onClick={() => {
                    updateSettings({ theme: 'light' });
                    sound.playClick();
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    settings.theme === 'light' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md border border-white/20' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sun size={13} />
                  Light
                </button>
              </div>
            </div>

            {/* Accent Color Palettes */}
            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg">
              <span className="text-sm font-semibold text-white block mb-1">System Accent Color</span>
              <p className="text-xs text-slate-400 mb-4">Highlights, glowing halos, active buttons, and cursor touches.</p>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                {(Object.keys(ACCENT_CONFIGS) as AccentColor[]).map((key) => {
                  const cfg = ACCENT_CONFIGS[key];
                  const isCur = settings.accentColor === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setAccentColor(key)}
                      className={`flex flex-col items-center p-3.5 rounded-2xl border transition-all duration-200 ${
                        isCur
                          ? 'border-purple-500 bg-purple-600/20 shadow-xl shadow-purple-600/20 scale-105'
                          : 'border-white/5 hover:border-white/20 bg-white/[0.03] hover:scale-[1.02]'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full mb-2.5 shadow-md border border-white/20"
                        style={{ backgroundColor: cfg.hex, boxShadow: `0 0 16px ${cfg.hex}80` }}
                      />
                      <span className="text-xs font-semibold text-white">{cfg.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Built-in Applications Settings Section */}
        {activeSection === 'app-settings' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Built-in App Preferences</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono border border-purple-500/30 font-bold">
                  5 Core Apps
                </span>
              </h3>
              <p className="text-xs text-slate-400">Configure custom defaults, rendering options, and engine behaviors for each native application.</p>
            </div>

            {/* Subtab Navigator */}
            <div className="flex bg-white/[0.04] p-1 rounded-2xl border border-white/10 gap-1 overflow-x-auto">
              {[
                { id: 'calculator', name: 'Calculator Pro', icon: Calculator },
                { id: 'notes', name: 'Notes Studio', icon: FileText },
                { id: 'zen', name: 'Godly Browser', icon: Globe },
                { id: 'terminal', name: 'Starship Terminal', icon: Terminal },
                { id: 'games', name: 'Games Vault', icon: Gamepad2 },
              ].map((sub) => {
                const Icon = sub.icon;
                const isCur = activeAppSubtab === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => {
                      sound.playClick();
                      setActiveAppSubtab(sub.id as AppSettingsSubtab);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      isCur
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{sub.name}</span>
                  </button>
                );
              })}
            </div>

            {/* 1. Calculator Pro Settings */}
            {activeAppSubtab === 'calculator' && (
              <div className="space-y-4">
                {/* Angle Mode */}
                <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                  <div>
                    <span className="text-xs font-semibold text-white block">Default Trigonometric Angle Mode</span>
                    <span className="text-[11px] text-slate-400">Trigonometric calculations (sin, cos, tan) calculate in radians or degrees.</span>
                  </div>
                  <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 gap-1">
                    <button
                      onClick={() => updateAppSettings({ calculator: { ...appSettings.calculator, angleMode: 'rad' } })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                        appSettings.calculator.angleMode === 'rad' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      RAD (Radians)
                    </button>
                    <button
                      onClick={() => updateAppSettings({ calculator: { ...appSettings.calculator, angleMode: 'deg' } })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                        appSettings.calculator.angleMode === 'deg' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      DEG (Degrees)
                    </button>
                  </div>
                </div>

                {/* Default Mode on Launch */}
                <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                  <div>
                    <span className="text-xs font-semibold text-white block">Initial Calculator Mode</span>
                    <span className="text-[11px] text-slate-400">Layout view displayed when opening Calculator Pro.</span>
                  </div>
                  <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 gap-1">
                    {(['standard', 'scientific', 'graphing'] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => updateAppSettings({ calculator: { ...appSettings.calculator, defaultMode: m } })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                          appSettings.calculator.defaultMode === m ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Decimal Precision */}
                <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                  <div>
                    <span className="text-xs font-semibold text-white block">Floating Point Precision</span>
                    <span className="text-[11px] text-slate-400">Maximum decimal places displayed for scientific results.</span>
                  </div>
                  <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 gap-1 font-mono text-xs">
                    {[2, 4, 8, 12].map((p) => (
                      <button
                        key={p}
                        onClick={() => updateAppSettings({ calculator: { ...appSettings.calculator, precision: p } })}
                        className={`px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                          appSettings.calculator.precision === p ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {p} Dec
                      </button>
                    ))}
                  </div>
                </div>

                {/* Audio Clicks */}
                <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                  <div>
                    <span className="text-xs font-semibold text-white block">Tactile Keypress Audio</span>
                    <span className="text-[11px] text-slate-400">Play responsive synthesized mechanical click audio on keypad presses.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateAppSettings({ calculator: { ...appSettings.calculator, soundEnabled: !appSettings.calculator.soundEnabled } })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      appSettings.calculator.soundEnabled ? 'bg-purple-600' : 'bg-white/10'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        appSettings.calculator.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* 2. Notes Studio Settings */}
            {activeAppSubtab === 'notes' && (
              <div className="space-y-4">
                {/* Font Family */}
                <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                  <div>
                    <span className="text-xs font-semibold text-white block">Editor Typography</span>
                    <span className="text-[11px] text-slate-400">Font face for text and markdown composition.</span>
                  </div>
                  <select
                    value={appSettings.notes.fontFamily}
                    onChange={(e) => updateAppSettings({ notes: { ...appSettings.notes, fontFamily: e.target.value } })}
                    className="bg-[#121624] border border-white/10 text-white rounded-xl px-3 py-1.5 text-xs outline-none"
                  >
                    <option value="Inter, system-ui, sans-serif">Inter (Modern Sans)</option>
                    <option value="'JetBrains Mono', monospace">JetBrains Mono (Developer)</option>
                    <option value="'Fira Code', monospace">Fira Code (Ligatures)</option>
                    <option value="Cinzel, serif">Cinzel (Celestial Serif)</option>
                  </select>
                </div>

                {/* Font Size */}
                <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                  <div>
                    <span className="text-xs font-semibold text-white block">Font Size</span>
                    <span className="text-[11px] text-slate-400">Editor text scaling in pixels.</span>
                  </div>
                  <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 gap-1 font-mono text-xs">
                    {[12, 14, 16, 18].map((size) => (
                      <button
                        key={size}
                        onClick={() => updateAppSettings({ notes: { ...appSettings.notes, fontSize: size } })}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                          appSettings.notes.fontSize === size ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {size}px
                      </button>
                    ))}
                  </div>
                </div>

                {/* Show Line Numbers */}
                <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                  <div>
                    <span className="text-xs font-semibold text-white block">Show Line Numbers</span>
                    <span className="text-[11px] text-slate-400">Display margin line count numbering in editor pane.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateAppSettings({ notes: { ...appSettings.notes, showLineNumbers: !appSettings.notes.showLineNumbers } })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      appSettings.notes.showLineNumbers ? 'bg-purple-600' : 'bg-white/10'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        appSettings.notes.showLineNumbers ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Word Wrap */}
                <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                  <div>
                    <span className="text-xs font-semibold text-white block">Soft Word Wrapping</span>
                    <span className="text-[11px] text-slate-400">Wrap long lines naturally to window edge without horizontal scrolling.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateAppSettings({ notes: { ...appSettings.notes, wordWrap: !appSettings.notes.wordWrap } })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      appSettings.notes.wordWrap ? 'bg-purple-600' : 'bg-white/10'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        appSettings.notes.wordWrap ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* 3. Zen Browser Settings */}
            {activeAppSubtab === 'zen' && (
              <div className="space-y-4">
                {/* Default Search Engine */}
                <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                  <div>
                    <span className="text-xs font-semibold text-white block">Default Search Engine</span>
                    <span className="text-[11px] text-slate-400">Default query engine for omnibar searches and new tab speed dials.</span>
                  </div>
                  <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 gap-1">
                    {[
                      { id: 'duckduckgo', name: 'DuckDuckGo', desc: 'Privacy' },
                      { id: 'brave', name: 'Brave', desc: 'Independent' },
                      { id: 'google', name: 'Google', desc: 'Global' },
                    ].map((eng) => (
                      <button
                        key={eng.id}
                        onClick={() => updateAppSettings({ zen: { ...appSettings.zen, defaultSearchEngine: eng.id as any } })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          appSettings.zen.defaultSearchEngine === eng.id ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {eng.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Compact Mode Default */}
                <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                  <div>
                    <span className="text-xs font-semibold text-white block">Compact Mode by Default</span>
                    <span className="text-[11px] text-slate-400">Auto-hide vertical sidebar and toolbar until hovering near the window edge.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateAppSettings({ zen: { ...appSettings.zen, compactModeDefault: !appSettings.zen.compactModeDefault } })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      appSettings.zen.compactModeDefault ? 'bg-purple-600' : 'bg-white/10'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        appSettings.zen.compactModeDefault ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Zen Glance */}
                <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                  <div>
                    <span className="text-xs font-semibold text-white block">Zen Glance (Floating Peek Preview)</span>
                    <span className="text-[11px] text-slate-400">Alt-click or eye icon to inspect links in a floating overlay modal without losing position.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateAppSettings({ zen: { ...appSettings.zen, glanceEnabled: !appSettings.zen.glanceEnabled } })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      appSettings.zen.glanceEnabled ? 'bg-purple-600' : 'bg-white/10'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        appSettings.zen.glanceEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* 4. Terminal Settings */}
            {activeAppSubtab === 'terminal' && (
              <div className="space-y-4">
                {/* Terminal Theme */}
                <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                  <div>
                    <span className="text-xs font-semibold text-white block">Terminal Color Scheme</span>
                    <span className="text-[11px] text-slate-400">Palette and phosphor styling for bash prompt and shell output.</span>
                  </div>
                  <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 gap-1">
                    {[
                      { id: 'obsidian', name: 'Obsidian' },
                      { id: 'matrix', name: 'Matrix' },
                      { id: 'cyberpunk', name: 'Cyberpunk' },
                      { id: 'amber', name: 'Amber CRT' },
                    ].map((th) => (
                      <button
                        key={th.id}
                        onClick={() => updateAppSettings({ terminal: { ...appSettings.terminal, theme: th.id as any } })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                          appSettings.terminal.theme === th.id ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {th.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                  <div>
                    <span className="text-xs font-semibold text-white block">Terminal Font Size</span>
                    <span className="text-[11px] text-slate-400">Font size for virtual shell buffer.</span>
                  </div>
                  <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 gap-1 font-mono text-xs">
                    {[12, 13, 14, 16].map((s) => (
                      <button
                        key={s}
                        onClick={() => updateAppSettings({ terminal: { ...appSettings.terminal, fontSize: s } })}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                          appSettings.terminal.fontSize === s ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {s}px
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cursor Style */}
                <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                  <div>
                    <span className="text-xs font-semibold text-white block">Shell Cursor Style</span>
                    <span className="text-[11px] text-slate-400">Blinking prompt indicator style.</span>
                  </div>
                  <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 gap-1 font-mono text-xs">
                    {[
                      { id: 'block', name: '█ Block' },
                      { id: 'underline', name: '_ Underline' },
                      { id: 'bar', name: '| Bar' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        onClick={() => updateAppSettings({ terminal: { ...appSettings.terminal, cursorStyle: c.id as any } })}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                          appSettings.terminal.cursorStyle === c.id ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. Arcade & Games Settings */}
            {activeAppSubtab === 'games' && (
              <div className="space-y-4">
                {/* Proxy Backend */}
                <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                  <div>
                    <span className="text-xs font-semibold text-white block">Cloud Game Proxy Backend</span>
                    <span className="text-[11px] text-slate-400">Tunnel engine for routing nowgg.fun and web arcade assets.</span>
                  </div>
                  <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 gap-1">
                    {[
                      { id: 'wisp', name: 'Wisp WebSocket' },
                      { id: 'direct', name: 'UltraViolet Direct' },
                      { id: 'scramjet', name: 'Scramjet Engine' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => updateAppSettings({ games: { ...appSettings.games, proxyBackend: p.id as any } })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          appSettings.games.proxyBackend === p.id ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Show FPS */}
                <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                  <div>
                    <span className="text-xs font-semibold text-white block">Real-time Performance HUD</span>
                    <span className="text-[11px] text-slate-400">Display framerate (FPS) and compositor latency overlay in arcade sessions.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateAppSettings({ games: { ...appSettings.games, showFps: !appSettings.games.showFps } })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      appSettings.games.showFps ? 'bg-purple-600' : 'bg-white/10'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        appSettings.games.showFps ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Desktop & Window Snapping Section */}
        {activeSection === 'desktop' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Window Snapping & Desktop Physics</h3>
              <p className="text-xs text-slate-400">NautilusOS-grade window edge magnetic docking & Achroma particle mesh.</p>
            </div>

            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg divide-y divide-white/5">
              <div className="flex items-center justify-between pb-4">
                <div>
                  <span className="text-xs font-semibold text-white block">Smart Window Snapping</span>
                  <span className="text-[11px] text-slate-400">Drag window to left/right edge (50% split) or top edge (maximize) with glowing ghost outline</span>
                </div>
                <button
                  type="button"
                  onClick={() => updateSettings({ windowSnapping: !settings.windowSnapping })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.windowSnapping ? 'bg-purple-600' : 'bg-white/10'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.windowSnapping ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="pt-4 flex items-center justify-between pb-4">
                <div>
                  <span className="text-xs font-semibold text-white block">Achroma Particle Canvas Grid</span>
                  <span className="text-[11px] text-slate-400">Interactive reactive dot grid that deflects away from your mouse cursor</span>
                </div>
                <button
                  type="button"
                  onClick={() => updateSettings({ particleBackground: !settings.particleBackground })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.particleBackground ? 'bg-purple-600' : 'bg-white/10'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.particleBackground ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="pt-4 flex items-center justify-between pb-4">
                <div>
                  <span className="text-xs font-semibold text-white block">Dynamic Media Island Pill</span>
                  <span className="text-[11px] text-slate-400">Floating top island with animated soundwave bars and Spotify ambient synthesizer controls</span>
                </div>
                <button
                  type="button"
                  onClick={() => updateSettings({ mediaPillEnabled: !settings.mediaPillEnabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.mediaPillEnabled ? 'bg-purple-600' : 'bg-white/10'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.mediaPillEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">Taskbar Placement</span>
                  <span className="text-[11px] text-slate-400">Dock taskbar to top or bottom edge of viewport</span>
                </div>
                <select
                  value={settings.taskbarPosition}
                  onChange={(e) => updateSettings({ taskbarPosition: e.target.value as 'bottom' | 'top' })}
                  className="bg-black/60 border border-white/20 text-white text-xs rounded-xl px-3 py-1.5 outline-none font-medium"
                >
                  <option value="bottom">Bottom Edge (Floating Dock)</option>
                  <option value="top">Top Edge (macOS Bar)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Proxy & Wisp Server Section */}
        {activeSection === 'proxy' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Ultraviolet & Wisp Proxy Engine</h3>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                  Active (SW + Wisp)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Configure the WebSocket transport (Wisp URL) used by Ultraviolet Service Worker to bypass frame restrictions and run apps seamlessly.
              </p>
            </div>

            {/* Architecture Card */}
            <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-2xl p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Proxy Architecture</span>
                <span className="text-[10px] font-mono text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-lg border border-purple-500/30">
                  Scramjet Static v2.0 + SW Bridge + Ultraviolet 2.0
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Godly OS features a unified multi-engine proxy stack: <b>Scramjet Static v2.0</b> (MercuryWorkshop WASM rewriter), <b>Service Worker Bridge</b> (root sw.js &amp; bareworker.js), and <b>Ultraviolet 2.0</b>. Select any engine per-tab or per-app, backed by high-speed WebSocket Wisp relays like Anura Pro.
              </p>
            </div>

            {/* Active Wisp Server Card */}
            <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg">
              <div>
                <span className="text-xs font-semibold text-white block mb-1">Active Wisp Server URL</span>
                <div className="flex items-center gap-2 px-3 py-2 bg-black/60 rounded-xl border border-white/10 font-mono text-xs text-emerald-300 select-text">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                  <span className="truncate">{currentWisp}</span>
                </div>
              </div>

              {/* Preset Selection */}
              <div>
                <span className="text-xs font-semibold text-slate-300 block mb-2">Verified High-Speed Wisp Presets:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {WISP_ENDPOINTS.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => {
                        sound.playClick();
                        setActiveWispUrl(w.url);
                        setCurrentWisp(w.url);
                        addNotification('Wisp Updated', `Proxy routed to ${w.name}`, 'success');
                      }}
                      className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                        currentWisp === w.url
                          ? 'bg-purple-600/30 border-purple-500/50 text-white shadow-md'
                          : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/10 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold text-white">{w.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{w.region}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono truncate max-w-full mt-1">{w.url}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Wisp Input */}
              <div className="pt-3 border-t border-white/10">
                <span className="text-xs font-semibold text-white block mb-2">Custom Wisp WebSocket URL:</span>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!customWispInput.trim()) return;
                    sound.playClick();
                    let url = customWispInput.trim();
                    if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
                      url = 'wss://' + url;
                    }
                    if (!url.endsWith('/')) url += '/';
                    setActiveWispUrl(url);
                    setCurrentWisp(url);
                    setCustomWispInput('');
                    addNotification('Custom Wisp Configured', `Connected to ${url}`, 'success');
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={customWispInput}
                    onChange={(e) => setCustomWispInput(e.target.value)}
                    placeholder="wss://your-wisp-server.example.com/"
                    className="flex-1 bg-black/50 border border-white/15 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-600 outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/30 border border-white/20 transition-all active:scale-95"
                  >
                    Save & Apply
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Stealth & Cloaking Section */}
        {activeSection === 'stealth' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Stealth & Tab Cloaking Engine</h3>
              <p className="text-xs text-slate-400">Disguise browser tab title, favicon, and URL bar from teacher or monitoring software.</p>
            </div>

            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-5 shadow-lg">
              <div>
                <span className="text-xs font-semibold text-white block mb-1">Preset Educational / Productivity Disguises</span>
                <span className="text-[11px] text-slate-400 block mb-3">Click any preset to instantly disguise current browser tab title & favicon:</span>

                <div className="grid grid-cols-2 gap-3">
                  {CLOAK_PRESETS.map((preset) => {
                    const isCurrent = settings.activeCloak === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => {
                          sound.playClick();
                          applyCloak(preset.id);
                          addNotification('Cloak Applied', `Tab disguised as ${preset.name}`, 'success');
                        }}
                        className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                          isCurrent
                            ? 'bg-purple-600/30 border-purple-500/50 text-white shadow-lg'
                            : 'bg-white/[0.03] border-white/10 text-white/80 hover:bg-white/[0.08]'
                        }`}
                      >
                        <img
                          src={preset.faviconUrl}
                          alt=""
                          className="w-5 h-5 rounded object-contain shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="min-w-0 flex-1 truncate">
                          <div className="text-xs font-semibold truncate text-white">{preset.name}</div>
                          <div className="text-[10px] text-white/40 truncate">{preset.title}</div>
                        </div>
                        {isCurrent && <Check size={14} className="text-purple-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">Restore Native Godly OS Identity</span>
                  <span className="text-[11px] text-slate-400">Revert browser tab title and app badge</span>
                </div>
                <button
                  onClick={() => {
                    sound.playClick();
                    applyCloak('default');
                    addNotification('Cloak Removed', 'Restored default Godly OS tab title.', 'info');
                  }}
                  className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/10 transition-colors"
                >
                  Uncloak Tab
                </button>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">Unblockable about:blank Pop-up Wrapper</span>
                  <span className="text-[11px] text-slate-400">Spawns about:blank tab with embedded proxy view to bypass school extensions</span>
                </div>
                <button
                  onClick={() => openAboutBlankCloak()}
                  className="px-4 py-2 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-sky-600/30 border border-white/10"
                >
                  <ExternalLink size={13} />
                  <span>Launch about:blank</span>
                </button>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between bg-red-950/30 p-4 rounded-2xl border border-red-500/20">
                <div>
                  <span className="text-xs font-semibold text-red-200 block">Emergency Panic Key (~ or Double Esc)</span>
                  <span className="text-[11px] text-red-300/70">Instantly closes all flyouts, minimizes every window, and cloaks tab as Google Classroom</span>
                </div>
                <button
                  onClick={() => panicCloak()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-600/30 shrink-0 border border-white/10"
                >
                  Trigger Panic Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Display & Glass Section */}
        {activeSection === 'display' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Display & Glassmorphism</h3>
              <p className="text-xs text-slate-400">Tune compositor blur intensity and fluid animations.</p>
            </div>

            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-5 shadow-lg">
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-xs font-semibold text-white">Window Glass Backdrop Blur</span>
                  <span className="text-xs font-mono font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-lg border border-purple-500/30">{settings.glassBlur}px</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="48"
                  step="4"
                  value={settings.glassBlur}
                  onChange={(e) => updateSettings({ glassBlur: parseInt(e.target.value, 10) })}
                  className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">Framer Motion Spring Physics</span>
                  <span className="text-[11px] text-slate-400">Silky window open/minimize physics</span>
                </div>
                <button
                  type="button"
                  onClick={() => updateSettings({ animationsEnabled: !settings.animationsEnabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.animationsEnabled ? 'bg-purple-600' : 'bg-white/10'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.animationsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sound & Audio Section */}
        {activeSection === 'sound' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Audio & Sound Cues</h3>
              <p className="text-xs text-slate-400">Configure tactile Web Audio feedback.</p>
            </div>

            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">System Sound Effects</span>
                  <span className="text-[11px] text-slate-400">Chimes on launch, clicks, and window events</span>
                </div>
                <button
                  type="button"
                  onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.soundEnabled ? 'bg-purple-600' : 'bg-white/10'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-xs font-semibold text-white">Master Sound Volume</span>
                  <span className="text-xs font-mono font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-lg border border-purple-500/30">{Math.round(settings.volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.volume}
                  onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              <button
                onClick={() => sound.playStartup()}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/30 border border-white/20 transition-all active:scale-95"
              >
                Test Startup Chime
              </button>
            </div>
          </div>
        )}

        {/* System & Performance Section */}
        {activeSection === 'performance' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">System Performance Monitor</h3>
              <p className="text-xs text-slate-400">Live hardware resource simulation.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg">
                <span className="text-xs font-semibold text-slate-400 block mb-1">CPU Load</span>
                <span className="text-2xl font-mono font-bold text-purple-400">14.8%</span>
                <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden mt-3 p-0.5">
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full w-[15%] rounded-full" />
                </div>
              </div>

              <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg">
                <span className="text-xs font-semibold text-slate-400 block mb-1">Memory Allocation</span>
                <span className="text-2xl font-mono font-bold text-emerald-400">4.1 GB / 16 GB</span>
                <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden mt-3 p-0.5">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full w-[26%] rounded-full" />
                </div>
              </div>
            </div>

            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-lg">
              <div>
                <span className="text-xs font-semibold text-white block">Flush System Cache & Storage</span>
                <span className="text-[11px] text-slate-400">Reset settings and files to defaults</span>
              </div>
              <button
                onClick={() => {
                  localStorage.clear();
                  addNotification('System Reset', 'All cached data cleared. Reloading...', 'info');
                  setTimeout(() => window.location.reload(), 1500);
                }}
                className="px-4 py-2 bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl text-xs font-bold border border-rose-500/30 transition-all shadow-md"
              >
                Reset Storage
              </button>
            </div>
          </div>
        )}

        {/* About Section */}
        {activeSection === 'about' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-950/80 via-indigo-950/70 to-slate-950/90 border border-white/15 rounded-3xl p-7 flex items-center gap-6 shadow-2xl shadow-purple-950/50 backdrop-blur-xl">
              <img src={getAssetUrl('assets/icons/settings.jpg')} alt="Godly OS" className="w-20 h-20 rounded-3xl shadow-2xl shadow-purple-500/30 border border-white/20" />
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Godly OS — Divine Edition</h2>
                <p className="text-xs text-purple-300 font-bold font-mono mt-0.5">Version 2.4.0 (Lux-Release)</p>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-lg">
                  Next-generation browser operating system built on glassmorphic tokens, Service Worker secure network proxies, and zero-iframe architecture.
                </p>
              </div>
            </div>

            {/* Interactive Tour & Showcase Launcher Card */}
            <div 
              className="rounded-2xl p-5 border flex items-center justify-between"
              style={{
                background: 'rgba(255, 255, 255, 0.035)',
                borderColor: 'var(--accent-border)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div className="space-y-1 max-w-md">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">Interactive OS Showcase & Tour</span>
                  <span 
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold"
                    style={{
                      background: 'var(--accent-dim)',
                      color: 'var(--accent-text)',
                      borderColor: 'var(--accent-border)',
                    }}
                  >
                    6 Interactive Slides
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Walk through all Godly OS capabilities: 120 FPS window snapping, floating dock, 1,567 Game Vault titles, Command ⌘K search, and proxy tunnels.
                </p>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  window.dispatchEvent(new CustomEvent('godly-open-tutorial'));
                }}
                className="flex items-center gap-2 px-4 py-2.5 text-white rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 border border-white/20 whitespace-nowrap"
                style={{
                  background: 'var(--accent)',
                  boxShadow: '0 4px 16px var(--accent-glow)',
                }}
              >
                <Sparkles size={14} />
                Launch OS Tour
              </button>
            </div>

            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 divide-y divide-white/5 text-xs shadow-lg">
              <div className="py-3 flex justify-between">
                <span className="text-slate-400 font-medium">Architecture</span>
                <span className="font-mono text-white font-semibold">x86_64-wasm / WebGL Compositor</span>
              </div>
              <div className="py-3 flex justify-between">
                <span className="text-slate-400 font-medium">Window Compositor</span>
                <span className="font-mono text-white font-semibold">Framer Spring Motion 11</span>
              </div>
              <div className="py-3 flex justify-between">
                <span className="text-slate-400 font-medium">Local Assets</span>
                <span className="font-mono text-white font-semibold">16 Wallpapers + 8 App Icons</span>
              </div>
              <div className="py-3 flex justify-between">
                <span className="text-slate-400 font-medium">Zero-iFrame Policy</span>
                <span className="font-mono text-emerald-400 font-bold">Enforced via Service Worker</span>
              </div>
              <div className="py-3 flex justify-between">
                <span className="text-slate-400 font-medium">Gaming Engine</span>
                <span className="font-mono text-purple-400 font-bold">Strictly nowgg.fun</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
