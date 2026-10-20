import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Gamepad2, 
  Command, 
  Maximize2, 
  Palette, 
  Shield, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  X, 
  Play,
  Layers,
  Search,
  Compass,
  Monitor
} from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { sound } from '../../utils/sound';

interface Step {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  highlights: string[];
  actionLabel?: string;
  onAction?: () => void;
}

export const OnboardingTutorial: React.FC = () => {
  const { 
    openApp, 
    setCommandPaletteOpen, 
    setStartMenuOpen, 
    settings,
    updateSettings 
  } = useOS();

  const [isOpen, setIsOpen] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('godly_onboarding_completed');
    } catch {
      return false;
    }
  });

  const [currentStep, setCurrentStep] = useState(0);

  // Allow reopening tutorial via custom event
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

  const STEPS: Step[] = [
    {
      id: 'welcome',
      badge: 'Welcome to Godly OS',
      title: 'Celestial Desktop Experience',
      subtitle: 'Engineered for luxury, ultra-smooth motion, and pure dark aesthetics.',
      description: 'Godly OS is a handcrafted web operating system designed with near-black Achroma tones, fluid window physics, and privacy-focused proxy tunnels.',
      icon: <Sparkles size={28} className="text-violet-400" />,
      highlights: [
        'Near-black pitch canvas (#030305) with micro glass specular sheen',
        'Dynamic reactive accent theming across all apps and windows',
        'Zero tracking, zero raw iframes — pure Service Worker architecture'
      ]
    },
    {
      id: 'dock',
      badge: 'Navigation & Launcher',
      title: 'Floating Glass Dock',
      subtitle: 'Everything you need, positioned at the center of your flow.',
      description: 'The dock houses your favorite applications, live window activity pips, and system indicators.',
      icon: <Monitor size={28} className="text-cyan-400" />,
      highlights: [
        'Click the Sparkles button or press Ctrl + Space to open the Start Launcher',
        'Command Pill (⌘K) for instant fuzzy search across all files and apps',
        'Control Center and System Tray for audio, network, and live clock'
      ],
      actionLabel: 'Preview Start Launcher',
      onAction: () => {
        setStartMenuOpen(true);
      }
    },
    {
      id: 'windows',
      badge: 'Fluid Window Physics',
      title: '120 FPS Window Management',
      subtitle: 'Desktop-grade dragging, edge snapping, and traffic light controls.',
      description: 'Organize your workspace with seamless GPU acceleration and intelligent window management.',
      icon: <Maximize2 size={28} className="text-emerald-400" />,
      highlights: [
        'Edge Snapping: Drag any window to the left, right, or top edge to snap',
        'Double-click any window title bar to maximize or restore',
        'Click the discreet slit on the right corner of the dock to minimize all windows'
      ],
      actionLabel: 'Open Terminal App',
      onAction: () => {
        openApp('terminal');
      }
    },
    {
      id: 'games',
      badge: 'Game Vault & Arcade',
      title: 'Over 1,500+ Games Built In',
      subtitle: 'The ultimate unblocked gaming catalog across multiple sources.',
      description: 'Godly Arcade unites three high-speed game libraries directly within the OS:',
      icon: <Gamepad2 size={28} className="text-amber-400" />,
      highlights: [
        'Local Game Vault: 1,500+ standalone classic HTML5 and waflash games',
        'Cloud Arcade: nowgg.fun titles streamed with zero-install latency',
        'GN-Math Library: Curated educational and strategy logic games'
      ],
      actionLabel: 'Launch Godly Arcade',
      onAction: () => {
        openApp('games');
      }
    },
    {
      id: 'stealth',
      badge: 'Stealth & Cloaking',
      title: 'Panic Key & Tab Cloaking',
      subtitle: 'Instant privacy disguises whenever you need to blend in.',
      description: 'Advanced disguise tools protect your privacy in school or office environments.',
      icon: <Shield size={28} className="text-rose-400" />,
      highlights: [
        'Panic Key: Press ~ (tilde) or double-tap Escape to instantly cloak everything',
        'Tab Cloak: Disguise your tab icon & title as Google Classroom or Drive',
        'About:Blank runner: Open Godly OS in a stealth about:blank container'
      ],
      actionLabel: 'Try Command Palette (⌘K)',
      onAction: () => {
        setCommandPaletteOpen(true);
      }
    },
    {
      id: 'personalize',
      badge: 'Personalization & Synth',
      title: 'Ambient Music & Custom Accents',
      subtitle: 'Make Godly OS uniquely yours with live ambient chords and themes.',
      description: 'Enjoy harmonic chord synthesizers and fine-tune your desktop visual style.',
      icon: <Palette size={28} className="text-fuchsia-400" />,
      highlights: [
        'Top Floating Media Island playing ambient chord soundscapes',
        '8 dynamic accent color themes that illuminate windows and buttons',
        '15+ curated 4K dark wallpapers with adjustable blur and particles'
      ],
      actionLabel: 'Open Settings Studio',
      onAction: () => {
        openApp('settings');
      }
    }
  ];

  const step = STEPS[currentStep];

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="onboarding-tutorial-modal"
          className="fixed inset-0 z-[9990] flex items-center justify-center p-4 select-none"
          style={{
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 360 }}
            className="relative w-full max-w-xl overflow-hidden rounded-[26px] flex flex-col"
            style={{
              background: 'rgba(8, 8, 14, 0.96)',
              border: '1px solid rgba(255, 255, 255, 0.10)',
              boxShadow: '0 32px 90px rgba(0, 0, 0, 0.90), 0 0 40px var(--accent-glow), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
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
            <div className="flex items-center justify-between px-6 pt-6 pb-2">
              <div className="flex items-center gap-2">
                <span className="accent-badge text-[10px] tracking-wider uppercase font-mono">
                  {step.badge}
                </span>
                <span className="text-[11px] font-mono text-white/35">
                  {currentStep + 1} / {STEPS.length}
                </span>
              </div>
              <button
                onClick={handleClose}
                className="w-7 h-7 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10 text-white/40 hover:text-white"
                title="Skip Tour"
              >
                <X size={15} />
              </button>
            </div>

            {/* Main Content Body */}
            <div className="px-6 py-4 flex-1">
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300"
                  style={{
                    background: 'var(--accent-dim)',
                    border: '1px solid var(--accent-border)',
                    boxShadow: '0 8px 24px var(--accent-glow)',
                  }}
                >
                  {step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold tracking-tight text-white mb-1">
                    {step.title}
                  </h2>
                  <p className="text-[13px] font-medium text-white/60 leading-snug">
                    {step.subtitle}
                  </p>
                </div>
              </div>

              <p className="text-[12.5px] text-white/50 leading-relaxed mb-4">
                {step.description}
              </p>

              {/* Highlights Card */}
              <div
                className="p-3.5 rounded-2xl mb-4 space-y-2"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                {step.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-[12px] text-white/80">
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
                    >
                      <Check size={10} strokeWidth={3} />
                    </div>
                    <span className="leading-snug">{h}</span>
                  </div>
                ))}
              </div>

              {/* Optional Quick Interactive Action */}
              {step.actionLabel && step.onAction && (
                <div className="flex justify-start">
                  <button
                    onClick={() => {
                      sound.playClick();
                      step.onAction?.();
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all active:scale-95"
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: 'var(--accent-text)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--accent-dim)';
                      e.currentTarget.style.borderColor = 'var(--accent-border)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                    }}
                  >
                    <Play size={11} className="fill-current" />
                    <span>{step.actionLabel}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Progress Dots & Nav Buttons */}
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.07)',
                background: 'rgba(0, 0, 0, 0.35)',
              }}
            >
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
                      width: idx === currentStep ? 20 : 6,
                      background: idx === currentStep ? 'var(--accent)' : 'rgba(255, 255, 255, 0.15)',
                      boxShadow: idx === currentStep ? '0 0 8px var(--accent-glow)' : 'none',
                    }}
                    title={`Step ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Navigation Action Buttons */}
              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrev}
                    className="btn-ghost flex items-center gap-1 px-3 py-1.5 text-xs font-medium"
                  >
                    <ArrowLeft size={13} />
                    <span>Back</span>
                  </button>
                )}

                <button
                  onClick={handleNext}
                  className="btn-accent flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl"
                  style={{
                    background: 'var(--accent)',
                    boxShadow: '0 4px 16px var(--accent-glow)',
                  }}
                >
                  <span>{currentStep === STEPS.length - 1 ? 'Start Exploring' : 'Continue'}</span>
                  {currentStep === STEPS.length - 1 ? (
                    <Check size={13} strokeWidth={2.5} />
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
