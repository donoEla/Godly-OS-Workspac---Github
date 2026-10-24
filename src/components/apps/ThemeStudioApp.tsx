import React, { useState } from 'react';
import { Sliders, Download, Upload, Check, Sparkles, RefreshCw } from 'lucide-react';
import { useOS, BUILTIN_THEME_PRESETS } from '../../context/OSContext';
import { ThemePreset } from '../../types/os';
import { sound } from '../../utils/sound';

export const ThemeStudioApp: React.FC = () => {
  const { settings, updateSettings, applyThemePreset } = useOS();

  const currentPreset: ThemePreset = settings.themePreset || BUILTIN_THEME_PRESETS[0];

  const [glassBlur, setGlassBlur] = useState<number>(currentPreset.glassBlur);
  const [neonColor, setNeonColor] = useState<string>(currentPreset.neonColor);
  const [radius, setRadius] = useState<number>(currentPreset.radius);
  const [fontFamily, setFontFamily] = useState<string>(currentPreset.fontFamily);
  const [brightness, setBrightness] = useState<number>(currentPreset.brightness);
  const [contrast, setContrast] = useState<number>(currentPreset.contrast);
  const [activePresetId, setActivePresetId] = useState<string>(currentPreset.id);

  // Instantly apply CSS variables to root and sync settings
  const applyLiveChanges = (updated: Partial<ThemePreset>) => {
    const next: ThemePreset = {
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
    setActivePresetId('custom');
  };

  const handleSelectPreset = (preset: ThemePreset) => {
    setGlassBlur(preset.glassBlur);
    setNeonColor(preset.neonColor);
    setRadius(preset.radius);
    setFontFamily(preset.fontFamily);
    setBrightness(preset.brightness);
    setContrast(preset.contrast);
    setActivePresetId(preset.id);
    applyThemePreset(preset);
  };

  const exportPreset = () => {
    const data: ThemePreset = {
      id: `theme-${Date.now()}`,
      name: 'Godly OS Custom Theme',
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
    downloadAnchor.setAttribute('download', `godly_theme_${Date.now()}.json`);
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
        if (parsed.glassBlur !== undefined && parsed.neonColor) {
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
    <div className="h-full w-full flex flex-col p-6 overflow-y-auto text-white select-none bg-black/40 backdrop-blur-2xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Sliders size={20} className="text-purple-400" />
            <h1 className="text-lg font-bold tracking-tight">Glassmorphism Theme Studio</h1>
          </div>
          <p className="text-xs text-white/50 mt-1">Real-time styling engine for window blur, neon accents, fonts, and ergonomics.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportPreset}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 shadow-lg"
          >
            <Download size={13} />
            <span>Export Theme</span>
          </button>
          <label className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/30 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-lg">
            <Upload size={13} />
            <span>Import JSON</span>
            <input type="file" accept=".json" onChange={importPreset} className="hidden" />
          </label>
        </div>
      </div>

      {/* Built-in Presets */}
      <div className="py-6 border-b border-white/10">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-3">Built-in Design Presets</h2>
        <div className="grid grid-cols-4 gap-3">
          {BUILTIN_THEME_PRESETS.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'border-purple-400 bg-purple-500/15 shadow-[0_0_25px_rgba(168,85,247,0.3)]'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white/90">{preset.name}</span>
                  {isSelected && <Check size={14} className="text-purple-400" />}
                </div>
                <div className="mt-2.5 flex items-center gap-2 text-[10px] text-white/50">
                  <span className="w-3 h-3 rounded-full border border-white/20" style={{ background: preset.neonColor }} />
                  <span>{preset.fontFamily}</span>
                  <span>•</span>
                  <span>{preset.glassBlur}px Blur</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-time Fine-Tuning Controls */}
      <div className="py-6 grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-5">
          {/* Blur Intensity */}
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-medium text-white/80">Glass Blur Intensity</label>
              <span className="text-xs font-mono text-purple-400 font-semibold">{glassBlur}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              value={glassBlur}
              onChange={(e) => {
                const val = Number(e.target.value);
                setGlassBlur(val);
                applyLiveChanges({ glassBlur: val });
              }}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          {/* Corner Roundness */}
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-medium text-white/80">Corner Roundness</label>
              <span className="text-xs font-mono text-purple-400 font-semibold">{radius}px</span>
            </div>
            <input
              type="range"
              min="4"
              max="36"
              value={radius}
              onChange={(e) => {
                const val = Number(e.target.value);
                setRadius(val);
                applyLiveChanges({ radius: val });
              }}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          {/* Typography Family */}
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <label className="text-xs font-medium text-white/80 block mb-2">Primary Font Family</label>
            <select
              value={fontFamily}
              onChange={(e) => {
                const val = e.target.value;
                setFontFamily(val);
                applyLiveChanges({ fontFamily: val });
              }}
              className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
            >
              <option value="Inter">Inter (Clean Modern UI)</option>
              <option value="JetBrains Mono">JetBrains Mono (Developer Pro)</option>
              <option value="system-ui">system-ui (Native Fluid OS)</option>
              <option value="Orbitron">Orbitron (Futuristic Cyberpunk)</option>
            </select>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Border Neon Glow Color */}
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-medium text-white/80">Border Neon Accent</label>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border border-white/20" style={{ background: neonColor }} />
                <span className="text-xs font-mono text-purple-400 uppercase font-semibold">{neonColor}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={neonColor}
                onChange={(e) => {
                  const val = e.target.value;
                  setNeonColor(val);
                  applyLiveChanges({ neonColor: val });
                }}
                className="w-10 h-8 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <div className="flex items-center gap-1.5 flex-1">
                {['#8b5cf6', '#3b82f6', '#10b981', '#ec4899', '#f59e0b', '#06b6d4', '#e2e8f0'].map((col) => (
                  <button
                    key={col}
                    onClick={() => {
                      setNeonColor(col);
                      applyLiveChanges({ neonColor: col });
                    }}
                    className="w-6 h-6 rounded-lg transition-transform hover:scale-110 border border-white/20"
                    style={{ background: col }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* UI Brightness */}
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-medium text-white/80">Display Brightness</label>
              <span className="text-xs font-mono text-purple-400 font-semibold">{brightness}%</span>
            </div>
            <input
              type="range"
              min="70"
              max="130"
              value={brightness}
              onChange={(e) => {
                const val = Number(e.target.value);
                setBrightness(val);
                applyLiveChanges({ brightness: val });
              }}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          {/* UI Contrast */}
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-medium text-white/80">Display Contrast</label>
              <span className="text-xs font-mono text-purple-400 font-semibold">{contrast}%</span>
            </div>
            <input
              type="range"
              min="80"
              max="140"
              value={contrast}
              onChange={(e) => {
                const val = Number(e.target.value);
                setContrast(val);
                applyLiveChanges({ contrast: val });
              }}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Live Preview Card */}
      <div className="mt-2 p-5 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="text-sm font-semibold">Real-time Theme Synchronized</div>
            <div className="text-xs text-white/50">All windows, taskbars, and menus now render with these active design tokens.</div>
          </div>
        </div>
        <button
          onClick={() => handleSelectPreset(BUILTIN_THEME_PRESETS[0])}
          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium flex items-center gap-1.5 transition-all"
        >
          <RefreshCw size={12} />
          <span>Reset Defaults</span>
        </button>
      </div>
    </div>
  );
};
