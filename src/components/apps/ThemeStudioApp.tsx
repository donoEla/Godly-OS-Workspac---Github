import React, { useState } from 'react';
import {
  Sliders,
  Download,
  Upload,
  Check,
  Sparkles,
  RotateCcw,
  Layers,
  Palette,
  Sun,
  Moon,
  Droplets,
  Cpu,
  MousePointer,
} from 'lucide-react';
import { useOS, BUILTIN_THEME_PRESETS } from '../../context/OSContext';
import { ThemePreset } from '../../types/os';
import { sound } from '../../utils/sound';
import { CURSOR_PRESETS } from '../../constants/cursorPresets';

type CategoryFilter = 'All' | 'Dark' | 'Light' | 'Material' | 'Special';

export const ThemeStudioApp: React.FC = () => {
  const { settings, updateSettings, applyThemePreset } = useOS();

  const currentPreset: ThemePreset = settings.themePreset || BUILTIN_THEME_PRESETS[0];

  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');
  const [glassBlur, setGlassBlur] = useState<number>(currentPreset.glassBlur ?? 38);
  const [neonColor, setNeonColor] = useState<string>(currentPreset.neonColor ?? '#8b5cf6');
  const [radius, setRadius] = useState<number>(currentPreset.radius ?? 18);
  const [fontFamily, setFontFamily] = useState<string>(currentPreset.fontFamily ?? 'Inter');
  const [brightness, setBrightness] = useState<number>(currentPreset.brightness ?? 100);
  const [contrast, setContrast] = useState<number>(currentPreset.contrast ?? 100);

  const activePresetId = settings.themePreset?.id || BUILTIN_THEME_PRESETS[0].id;

  const filteredPresets = BUILTIN_THEME_PRESETS.filter((p) => {
    if (activeCategory === 'All') return true;
    return p.category === activeCategory;
  });

  const handleSelectPreset = (preset: ThemePreset) => {
    setGlassBlur(preset.glassBlur);
    setNeonColor(preset.neonColor);
    setRadius(preset.radius);
    setFontFamily(preset.fontFamily);
    setBrightness(preset.brightness);
    setContrast(preset.contrast);
    applyThemePreset(preset);
  };

  const handleResetDefault = () => {
    const defaultTheme = BUILTIN_THEME_PRESETS[0];
    handleSelectPreset(defaultTheme);
    sound.playClick();
  };

  // Instantly apply CSS variables to root and sync settings
  const applyLiveChanges = (updated: Partial<ThemePreset>) => {
    const base = settings.themePreset || BUILTIN_THEME_PRESETS[0];
    const next: ThemePreset = {
      ...base,
      id: 'custom',
      name: 'Custom User Theme',
      glassBlur: updated.glassBlur ?? glassBlur,
      neonColor: updated.neonColor ?? neonColor,
      radius: updated.radius ?? radius,
      fontFamily: updated.fontFamily ?? fontFamily,
      brightness: updated.brightness ?? brightness,
      contrast: updated.contrast ?? contrast,
    };

    const root = document.documentElement;
    root.style.setProperty('--glass-blur', `${next.glassBlur}px`);
    root.style.setProperty('--border-color', next.neonColor);
    root.style.setProperty('--radius', `${next.radius}px`);
    root.style.setProperty('--font-family', next.fontFamily);
    root.style.setProperty('--ui-brightness', `${next.brightness}%`);
    root.style.setProperty('--ui-contrast', `${next.contrast}%`);

    updateSettings({ themePreset: next });
  };

  const exportPreset = () => {
    const active = settings.themePreset || BUILTIN_THEME_PRESETS[0];
    const data: ThemePreset = {
      ...active,
      glassBlur,
      neonColor,
      radius,
      fontFamily,
      brightness,
      contrast,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `godly_theme_${data.id}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    sound.playClick();
  };

  const importPreset = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed: ThemePreset = JSON.parse(event.target?.result as string);
        if (parsed.id && parsed.name && parsed.glassBlur !== undefined) {
          handleSelectPreset(parsed);
          sound.playNotification();
        }
      } catch (err) {
        console.error('Invalid theme file', err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="h-full w-full flex flex-col p-6 overflow-y-auto select-none transition-colors duration-200" style={{ color: 'var(--text-primary)' }}>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div>
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--accent) 0%, rgba(99,102,241,0.8) 100%)',
                boxShadow: '0 4px 14px var(--accent-glow)',
              }}
            >
              <Palette size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Theme Studio & Visual Engine
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Full system-wide design tokens, materials, and atmospheric themes for godlyOS.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleResetDefault}
            className="px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 hover:brightness-110"
            style={{
              background: 'var(--surface-2)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
            title="Reset to Obsidian default"
          >
            <RotateCcw size={12} />
            <span>Reset Default</span>
          </button>
          <button
            onClick={exportPreset}
            className="px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 hover:brightness-110"
            style={{
              background: 'var(--surface-2)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            <Download size={12} />
            <span>Export Theme</span>
          </button>
          <label
            className="px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            style={{
              background: 'var(--accent-dim)',
              borderColor: 'var(--accent-border)',
              color: 'var(--accent-text)',
            }}
          >
            <Upload size={12} />
            <span>Import JSON</span>
            <input type="file" accept=".json" onChange={importPreset} className="hidden" />
          </label>
        </div>
      </div>

      {/* ── Category Filters Bar ── */}
      <div className="py-5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>
          {(['All', 'Dark', 'Light', 'Material', 'Special'] as CategoryFilter[]).map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  sound.playClick();
                }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  isActive ? 'shadow-sm font-semibold' : 'hover:opacity-100 opacity-70'
                }`}
                style={{
                  background: isActive ? 'var(--accent)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                }}
              >
                {cat === 'Material' && <Droplets size={11} className="inline mr-1" />}
                {cat === 'Special' && <Cpu size={11} className="inline mr-1" />}
                {cat} {cat === 'All' && `(${BUILTIN_THEME_PRESETS.length})`}
              </button>
            );
          })}
        </div>

        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Active Theme:{' '}
          <span className="font-semibold" style={{ color: 'var(--accent-text)' }}>
            {settings.themePreset?.name || 'Obsidian'}
          </span>
        </div>
      </div>

      {/* ── 10 Theme Preset Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 pb-6">
        {filteredPresets.map((preset) => {
          const isSelected = activePresetId === preset.id;
          return (
            <div
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative flex flex-col justify-between group ${
                isSelected ? 'ring-2' : 'hover:scale-[1.01]'
              }`}
              style={{
                background: preset.mode === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.03)',
                borderColor: isSelected ? preset.accent : 'var(--border-subtle)',
                boxShadow: isSelected ? `0 0 24px ${preset.accentGlow}` : 'none',
              }}
            >
              {/* Mini Desktop Preview Window */}
              <div
                className="w-full h-24 rounded-xl mb-3 overflow-hidden p-2 relative flex flex-col justify-between select-none"
                style={{
                  background: preset.bgBase,
                  border: `1px solid ${preset.borderDefault}`,
                }}
              >
                {/* Mini Window inside */}
                <div
                  className="rounded-lg p-1.5 w-full flex-1 flex flex-col justify-between overflow-hidden"
                  style={{
                    background: preset.glassWindow,
                    border: `1px solid ${preset.windowBorderFocused || preset.borderDefault}`,
                    boxShadow: preset.windowShadow,
                  }}
                >
                  {/* Mini Titlebar */}
                  <div
                    className="flex items-center justify-between pb-1 border-b"
                    style={{
                      background: preset.windowHeaderBg,
                      borderColor: preset.borderSubtle,
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    </div>
                    <span className="text-[8px] font-mono truncate opacity-60" style={{ color: preset.textPrimary }}>
                      {preset.name}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: preset.accent }} />
                  </div>

                  {/* Mini Window Body Content */}
                  <div className="flex-1 pt-1.5 flex flex-col gap-1">
                    <div className="w-2/3 h-1.5 rounded-full" style={{ background: preset.accent, opacity: 0.7 }} />
                    <div className="w-full h-1 rounded-full opacity-30" style={{ background: preset.textSecondary }} />
                    <div className="w-4/5 h-1 rounded-full opacity-20" style={{ background: preset.textMuted }} />
                  </div>
                </div>

                {/* Mini Dock */}
                <div
                  className="mt-1 h-3 self-center px-2 rounded-full flex items-center gap-1"
                  style={{
                    background: preset.glassDock,
                    border: `0.5px solid ${preset.dockBorder}`,
                  }}
                >
                  <span className="w-1 h-1 rounded-full" style={{ background: preset.accent }} />
                  <span className="w-1 h-1 rounded-full opacity-40" style={{ background: preset.textPrimary }} />
                  <span className="w-1 h-1 rounded-full opacity-40" style={{ background: preset.textPrimary }} />
                </div>
              </div>

              {/* Title & Category Badge */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold" style={{ color: preset.mode === 'light' ? '#0f172a' : '#ffffff' }}>
                    {preset.name}
                  </span>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold"
                    style={{
                      background: preset.category === 'Material' ? 'rgba(56,189,248,0.18)' : 'var(--surface-3)',
                      color: preset.category === 'Material' ? '#38bdf8' : 'var(--text-muted)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {preset.category}
                  </span>
                </div>

                <p
                  className="text-[11px] leading-relaxed line-clamp-2 mb-3"
                  style={{ color: preset.mode === 'light' ? '#475569' : 'var(--text-secondary)' }}
                >
                  {preset.description}
                </p>
              </div>

              {/* Meta specifications */}
              <div
                className="pt-2.5 border-t flex items-center justify-between text-[10px]"
                style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-white/20"
                    style={{ background: preset.accent, boxShadow: `0 0 6px ${preset.accent}` }}
                  />
                  <span>{preset.fontFamily.split(',')[0]}</span>
                  <span>•</span>
                  <span>{preset.glassBlur}px blur</span>
                </div>

                {isSelected ? (
                  <span
                    className="flex items-center gap-1 font-bold text-[10px]"
                    style={{ color: preset.accent }}
                  >
                    <Check size={12} strokeWidth={3} />
                    Active
                  </span>
                ) : (
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] underline">
                    Apply
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Real-time Fine-Tuning Controls ── */}
      <div className="mt-4 pt-6 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Sliders size={16} style={{ color: 'var(--accent)' }} />
          <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            Real-time Material & Ergonomics Calibration
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Glass Blur Intensity */}
          <div className="p-3.5 rounded-2xl border" style={{ background: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                Glass Blur Depth
              </label>
              <span className="text-xs font-mono font-bold" style={{ color: 'var(--accent-text)' }}>
                {glassBlur}px
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="70"
              value={glassBlur}
              onChange={(e) => {
                const val = Number(e.target.value);
                setGlassBlur(val);
                applyLiveChanges({ glassBlur: val });
              }}
              className="w-full cursor-pointer accent-violet-500"
            />
          </div>

          {/* Corner Roundness */}
          <div className="p-3.5 rounded-2xl border" style={{ background: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                Window Corner Radius
              </label>
              <span className="text-xs font-mono font-bold" style={{ color: 'var(--accent-text)' }}>
                {radius}px
              </span>
            </div>
            <input
              type="range"
              min="4"
              max="32"
              value={radius}
              onChange={(e) => {
                const val = Number(e.target.value);
                setRadius(val);
                applyLiveChanges({ radius: val });
              }}
              className="w-full cursor-pointer accent-violet-500"
            />
          </div>

          {/* Typography Family */}
          <div className="p-3.5 rounded-2xl border" style={{ background: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}>
            <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Primary Typography
            </label>
            <select
              value={fontFamily}
              onChange={(e) => {
                const val = e.target.value;
                setFontFamily(val);
                applyLiveChanges({ fontFamily: val });
              }}
              className="w-full rounded-xl px-2.5 py-1.5 text-xs outline-none border transition-colors"
              style={{
                background: 'var(--surface-2)',
                borderColor: 'var(--border-default)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="Inter">Inter (Clean Modern UI)</option>
              <option value="JetBrains Mono">JetBrains Mono (Developer Pro)</option>
              <option value="system-ui">system-ui (Native Fluid OS)</option>
              <option value="Outfit, sans-serif">Outfit (Editorial Luxury)</option>
            </select>
          </div>

          {/* UI Brightness */}
          <div className="p-3.5 rounded-2xl border" style={{ background: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                Surface Luminance
              </label>
              <span className="text-xs font-mono font-bold" style={{ color: 'var(--accent-text)' }}>
                {brightness}%
              </span>
            </div>
            <input
              type="range"
              min="80"
              max="125"
              value={brightness}
              onChange={(e) => {
                const val = Number(e.target.value);
                setBrightness(val);
                applyLiveChanges({ brightness: val });
              }}
              className="w-full cursor-pointer accent-violet-500"
            />
          </div>

          {/* Hardware Custom Cursor */}
          <div className="p-3.5 rounded-2xl border" style={{ background: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                <MousePointer size={12} style={{ color: 'var(--accent)' }} />
                <span>Hardware Cursor</span>
              </label>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-white/10" style={{ color: 'var(--accent-text)' }}>
                {(settings.customCursor || 'default').toUpperCase()}
              </span>
            </div>
            <select
              value={settings.customCursor || 'default'}
              onChange={(e) => {
                updateSettings({ customCursor: e.target.value });
                sound.playClick();
              }}
              className="w-full rounded-xl px-2.5 py-1.5 text-xs outline-none border transition-colors cursor-pointer"
              style={{
                background: 'var(--surface-2)',
                borderColor: 'var(--border-default)',
                color: 'var(--text-primary)',
              }}
            >
              {CURSOR_PRESETS.map((c) => (
                <option key={c.id} value={c.id} style={{ background: '#090d16', color: '#ffffff' }}>
                  {c.name} • {c.category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
