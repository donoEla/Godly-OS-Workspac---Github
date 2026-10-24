import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Palette, 
  Monitor, 
  Sliders, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Layout, 
  Check, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Play, 
  Flame, 
  Zap, 
  Sun, 
  Moon, 
  Clock, 
  CloudSun, 
  Cpu, 
  FileText, 
  Music, 
  Compass, 
  Quote, 
  Rocket,
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { sound } from '../../utils/sound';
import { WALLPAPERS, ACCENT_CONFIGS } from '../../constants/assets';
import { getAssetUrl } from '../../utils/assetHelper';
import { AccentColor, DesktopWidget } from '../../types/os';

interface WalkthroughStep {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

export const OnboardingTutorial: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    setAccentColor, 
    openApp, 
    updateWidget 
  } = useOS();

  const [isOpen, setIsOpen] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('godly_onboarding_completed');
    } catch {
      return false;
    }
  });

  const [currentStep, setCurrentStep] = useState(0);

  // Listen for custom event to reopen walkthrough from Settings, Start Menu, or Terminal
  useEffect(() => {
    const handleReopen = () => {
      setCurrentStep(0);
      setIsOpen(true);
    };
    window.addEventListener('godly-open-tutorial', handleReopen);
    return () => window.removeEventListener('godly-open-tutorial', handleReopen);
  }, []);

  const handleClose = () => {
    sound.playClick();
    setIsOpen(false);
    try {
      localStorage.setItem('godly_onboarding_completed', 'true');
    } catch {}
  };

  const handleNext = () => {
    sound.playClick();
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    sound.playClick();
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const STEPS: WalkthroughStep[] = [
    {
      id: 'welcome',
      badge: 'Step 1 • Welcome',
      title: 'Calibrate Your Workspace',
      subtitle: 'Tune core soundscapes, particle dynamics, and ambient motion.',
      icon: <Sparkles size={24} className="text-violet-400" />
    },
    {
      id: 'backgrounds',
      badge: 'Step 2 • Wallpaper',
      title: 'Select Celestial Canvas',
      subtitle: 'Choose your default cosmic desktop atmosphere with live wallpaper preview.',
      icon: <ImageIcon size={24} className="text-cyan-400" />
    },
    {
      id: 'accents',
      badge: 'Step 3 • Themes',
      title: 'Chromatic Accent Aura',
      subtitle: 'Choose the glowing neon energy that illuminates windows, buttons, and dials.',
      icon: <Palette size={24} className="text-fuchsia-400" />
    },
    {
      id: 'dock',
      badge: 'Step 4 • Navigation',
      title: 'Dock & Window Magnetics',
      subtitle: 'Position your command navigation deck and configure edge window snapping.',
      icon: <Layout size={24} className="text-emerald-400" />
    },
    {
      id: 'widgets',
      badge: 'Step 5 • Widgets',
      title: 'Desktop Widgets Setup',
      subtitle: 'Choose which live floating glass monitors live directly on your desktop.',
      icon: <Cpu size={24} className="text-amber-400" />
    },
    {
      id: 'ready',
      badge: 'Step 6 • Launch',
      title: 'Your Universe Is Ready',
      subtitle: 'All preferences are synchronized and saved to your local divine workspace.',
      icon: <Rocket size={24} className="text-rose-400" />
    }
  ];

  const current = STEPS[currentStep];

  // Helper for widget toggle in Step 5
  const activeWidgets = settings.widgets || [];
  const getWidget = (type: string) => activeWidgets.find(w => w.type === type);
  const toggleWidgetType = (type: string) => {
    const w = getWidget(type);
    if (w) {
      sound.playClick();
      updateWidget(w.id, { isVisible: !w.isVisible });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="onboarding-tutorial-modal"
          className="fixed inset-0 z-[9990] flex items-center justify-center p-3 sm:p-6 select-none"
          style={{
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 360 }}
            className="relative w-full max-w-2xl max-h-[88vh] overflow-hidden rounded-[26px] flex flex-col"
            style={{
              background: 'rgba(9, 10, 16, 0.96)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 32px 100px rgba(0, 0, 0, 0.95), 0 0 50px var(--accent-glow), inset 0 1px 0 rgba(255, 255, 255, 0.14)',
            }}
          >
            {/* Top Glowing Ambient Strip */}
            <div
              className="absolute top-0 inset-x-0 h-1"
              style={{
                background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
              }}
            />

            {/* Header with Step Indicator & Close */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/[0.07] bg-white/[0.01]">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                  style={{
                    background: 'var(--accent-dim)',
                    border: '1px solid var(--accent-border)',
                    boxShadow: '0 0 18px var(--accent-glow)'
                  }}
                >
                  {current.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="accent-badge text-[10px] tracking-wider uppercase font-mono">
                      {current.badge}
                    </span>
                    <span className="text-[11px] font-mono text-white/35">
                      {currentStep + 1} of {STEPS.length}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {current.title}
                  </h2>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10 text-white/40 hover:text-white"
                title="Skip Setup"
              >
                <X size={16} />
              </button>
            </div>

            {/* Interactive Step Body */}
            <div className="px-6 py-5 overflow-y-auto max-h-[58vh] space-y-5 custom-scrollbar">
              <p className="text-[12.5px] text-white/60 leading-relaxed">
                {current.subtitle}
              </p>

              {/* STEP 1: WELCOME & EXPERIENCE */}
              {current.id === 'welcome' && (
                <div className="space-y-3.5">
                  <div
                    className="p-4 rounded-2xl space-y-3"
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.07)'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                          {settings.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                        </div>
                        <div>
                          <div className="text-[13px] font-semibold text-white">Audio & Haptic Soundscapes</div>
                          <div className="text-[11px] text-white/40">Subtle synth clicks on window snap, click, and app launch</div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const next = !settings.soundEnabled;
                          updateSettings({ soundEnabled: next });
                          if (next) sound.playNotification();
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          settings.soundEnabled 
                            ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30' 
                            : 'bg-white/5 text-white/40 hover:bg-white/10'
                        }`}
                      >
                        {settings.soundEnabled ? 'Enabled' : 'Muted'}
                      </button>
                    </div>

                    <div className="h-px bg-white/[0.05]" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                          <Sparkles size={16} />
                        </div>
                        <div>
                          <div className="text-[13px] font-semibold text-white">Floating Particle Stars</div>
                          <div className="text-[11px] text-white/40">Interactive GPU stardust floating gently on the desktop</div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          sound.playClick();
                          updateSettings({ particleBackground: !settings.particleBackground });
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          settings.particleBackground 
                            ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30' 
                            : 'bg-white/5 text-white/40 hover:bg-white/10'
                        }`}
                      >
                        {settings.particleBackground ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>

                    <div className="h-px bg-white/[0.05]" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400">
                          <Music size={16} />
                        </div>
                        <div>
                          <div className="text-[13px] font-semibold text-white">Dynamic Media Pill</div>
                          <div className="text-[11px] text-white/40">Floating ambient synth sound generator at top center</div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          sound.playClick();
                          updateSettings({ mediaPillEnabled: !settings.mediaPillEnabled });
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          settings.mediaPillEnabled 
                            ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-600/30' 
                            : 'bg-white/5 text-white/40 hover:bg-white/10'
                        }`}
                      >
                        {settings.mediaPillEnabled ? 'Visible' : 'Hidden'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: WALLPAPERS */}
              {current.id === 'backgrounds' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {WALLPAPERS.slice(0, 8).map((w) => {
                      const fullUrl = getAssetUrl(w.path);
                      const isSelected = settings.wallpaper === fullUrl || settings.wallpaper.includes(w.fileName);
                      return (
                        <div
                          key={w.id}
                          onClick={() => {
                            sound.playClick();
                            updateSettings({ wallpaper: fullUrl });
                          }}
                          className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all border ${
                            isSelected 
                              ? 'border-white ring-2 ring-violet-500 shadow-xl scale-[1.02]' 
                              : 'border-white/10 hover:border-white/30 opacity-75 hover:opacity-100'
                          }`}
                          style={{ height: 86 }}
                        >
                          <img 
                            src={fullUrl} 
                            alt={w.name} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                            <span className="text-[10px] font-medium text-white/90 truncate">
                              {w.name}
                            </span>
                          </div>
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center text-white shadow-md">
                              <Check size={10} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Wallpaper Blur Adjuster */}
                  <div
                    className="p-3.5 rounded-2xl flex items-center justify-between gap-4"
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.07)'
                    }}
                  >
                    <div>
                      <div className="text-[12px] font-semibold text-white">Atmospheric Background Blur</div>
                      <div className="text-[10.5px] text-white/40">Defocus desktop wallpaper to bring open windows into high focus</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {[0, 8, 16, 24].map((blurVal) => (
                        <button
                          key={blurVal}
                          onClick={() => {
                            sound.playClick();
                            updateSettings({ wallpaperBlur: blurVal });
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-all ${
                            settings.wallpaperBlur === blurVal 
                              ? 'bg-white text-black font-bold' 
                              : 'bg-white/5 text-white/50 hover:bg-white/10'
                          }`}
                        >
                          {blurVal === 0 ? 'Crisp' : `${blurVal}px`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: ACCENTS & THEME */}
              {current.id === 'accents' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {(Object.keys(ACCENT_CONFIGS) as AccentColor[]).map((key) => {
                      const cfg = ACCENT_CONFIGS[key];
                      const isSelected = settings.accentColor === key;
                      return (
                        <div
                          key={key}
                          onClick={() => {
                            sound.playClick();
                            setAccentColor(key);
                          }}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 ${
                            isSelected 
                              ? 'border-white ring-2 ring-white/20 bg-white/[0.08] scale-[1.02]' 
                              : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div 
                              className="w-5 h-5 rounded-full shadow-md transition-transform" 
                              style={{ 
                                background: cfg.hex,
                                boxShadow: `0 0 12px ${cfg.hex}` 
                              }}
                            />
                            {isSelected && <Check size={12} className="text-white" />}
                          </div>
                          <div>
                            <div className="text-[12px] font-semibold text-white">{cfg.name}</div>
                            <div className="text-[10px] font-mono text-white/40 uppercase">{cfg.hex}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Glass Blur Intensity */}
                  <div
                    className="p-3.5 rounded-2xl flex items-center justify-between gap-4"
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.07)'
                    }}
                  >
                    <div>
                      <div className="text-[12px] font-semibold text-white">Glassmorphic Window Frost</div>
                      <div className="text-[10.5px] text-white/40">Adjust optical frosted glass refraction on window title bars</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {[16, 28, 40].map((blurVal) => (
                        <button
                          key={blurVal}
                          onClick={() => {
                            sound.playClick();
                            updateSettings({ glassBlur: blurVal });
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-all ${
                            settings.glassBlur === blurVal 
                              ? 'bg-white text-black font-bold' 
                              : 'bg-white/5 text-white/50 hover:bg-white/10'
                          }`}
                        >
                          {blurVal === 16 ? 'Subtle' : blurVal === 28 ? 'Standard' : 'Deep'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: DOCK & NAVIGATION */}
              {current.id === 'dock' && (
                <div className="space-y-4">
                  <div
                    className="p-4 rounded-2xl space-y-3"
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.07)'
                    }}
                  >
                    <div>
                      <div className="text-[13px] font-semibold text-white mb-2">Command Dock Position</div>
                      <div className="grid grid-cols-2 gap-2">
                        {(['bottom', 'top'] as const).map((pos) => (
                          <button
                            key={pos}
                            onClick={() => {
                              sound.playClick();
                              updateSettings({ taskbarPosition: pos });
                            }}
                            className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition-all ${
                              settings.taskbarPosition === pos 
                                ? 'bg-white text-black border-white shadow-lg' 
                                : 'bg-white/[0.04] text-white/60 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            {pos} Dock
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="h-px bg-white/[0.05]" />

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[13px] font-semibold text-white">Smart Edge Magnetism</div>
                        <div className="text-[11px] text-white/40">Snap windows to left, right, or top edge to tile workspaces</div>
                      </div>
                      <button
                        onClick={() => {
                          sound.playClick();
                          updateSettings({ windowSnapping: !settings.windowSnapping });
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          settings.windowSnapping 
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' 
                            : 'bg-white/5 text-white/40 hover:bg-white/10'
                        }`}
                      >
                        {settings.windowSnapping ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>

                    <div className="h-px bg-white/[0.05]" />

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[13px] font-semibold text-white">120 FPS Motion Physics</div>
                        <div className="text-[11px] text-white/40">Smooth spring animations on window drag, minimize, and open</div>
                      </div>
                      <button
                        onClick={() => {
                          sound.playClick();
                          updateSettings({ animationsEnabled: !settings.animationsEnabled });
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          settings.animationsEnabled 
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' 
                            : 'bg-white/5 text-white/40 hover:bg-white/10'
                        }`}
                      >
                        {settings.animationsEnabled ? 'Smooth' : 'Reduced'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: DESKTOP WIDGETS */}
              {current.id === 'widgets' && (
                <div className="space-y-3">
                  <div
                    className="p-4 rounded-2xl space-y-2.5"
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.07)'
                    }}
                  >
                    {[
                      { type: 'clock', title: 'Clock & Solar Calendar', icon: <Clock size={15} /> },
                      { type: 'weather', title: 'Weather & Atmosphere', icon: <CloudSun size={15} /> },
                      { type: 'system', title: 'System Performance HUD', icon: <Cpu size={15} /> },
                      { type: 'notes', title: 'Quick Notes Scratchpad', icon: <FileText size={15} /> },
                      { type: 'media', title: 'Aura Media Controller', icon: <Music size={15} /> },
                      { type: 'quote', title: 'Celestial Wisdom (Quotes)', icon: <Quote size={15} /> },
                      { type: 'launcher', title: 'Quick App Dock', icon: <Rocket size={15} /> },
                    ].map((wItem) => {
                      const target = getWidget(wItem.type);
                      const isVis = target ? target.isVisible : false;
                      return (
                        <div 
                          key={wItem.type}
                          className="flex items-center justify-between py-1.5 px-2 rounded-xl hover:bg-white/[0.02]"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="text-white/40">{wItem.icon}</div>
                            <span className="text-[12.5px] font-medium text-white/80">{wItem.title}</span>
                          </div>
                          <button
                            onClick={() => toggleWidgetType(wItem.type)}
                            className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition-all ${
                              isVis 
                                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25' 
                                : 'bg-white/5 text-white/40 hover:bg-white/10'
                            }`}
                          >
                            {isVis ? 'Pinned' : 'Hidden'}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-start">
                    <button
                      onClick={() => {
                        sound.playClick();
                        openApp('widgets');
                      }}
                      className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                    >
                      <Sliders size={13} />
                      <span>Open Widgets Studio App for deep tuning ↗</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 6: READY & SUMMARY */}
              {current.id === 'ready' && (
                <div className="space-y-4">
                  <div
                    className="p-4 rounded-2xl space-y-3"
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    <div className="text-[13px] font-semibold text-white flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      <span>Calibration Saved to Local Storage</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-mono">
                      <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                        <span className="text-white/40 block text-[9.5px]">ACCENT</span>
                        <span className="text-white font-semibold uppercase">{settings.accentColor}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                        <span className="text-white/40 block text-[9.5px]">DOCK</span>
                        <span className="text-white font-semibold uppercase">{settings.taskbarPosition}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                        <span className="text-white/40 block text-[9.5px]">AUDIO</span>
                        <span className="text-white font-semibold">{settings.soundEnabled ? 'ON' : 'MUTED'}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                        <span className="text-white/40 block text-[9.5px]">WIDGETS</span>
                        <span className="text-white font-semibold">
                          {(settings.widgets || []).filter(w => w.isVisible).length} ACTIVE
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() => {
                        sound.playClick();
                        handleClose();
                        openApp('settings');
                      }}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-white/15 bg-white/5 text-white hover:bg-white/10 transition-all flex items-center gap-2"
                    >
                      <Sliders size={13} />
                      <span>Open Full Settings Studio</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer with Step Progress & Actions */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.07] bg-black/40">
              {/* Pagination Dots */}
              <div className="flex items-center gap-1.5">
                {STEPS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      sound.playClick();
                      setCurrentStep(idx);
                    }}
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: idx === currentStep ? 22 : 6,
                      background: idx === currentStep ? 'var(--accent)' : 'rgba(255, 255, 255, 0.18)',
                      boxShadow: idx === currentStep ? '0 0 10px var(--accent-glow)' : 'none',
                    }}
                    title={`Step ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Navigation Action Buttons */}
              <div className="flex items-center gap-2.5">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrev}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <ArrowLeft size={13} />
                    <span>Back</span>
                  </button>
                )}

                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-xl text-white transition-all shadow-lg active:scale-95"
                  style={{
                    background: 'var(--accent)',
                    boxShadow: '0 4px 18px var(--accent-glow)',
                  }}
                >
                  <span>{currentStep === STEPS.length - 1 ? 'Enter Godly OS' : 'Continue'}</span>
                  {currentStep === STEPS.length - 1 ? (
                    <Rocket size={13} strokeWidth={2.5} />
                  ) : (
                    <ArrowRight size={13} />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
