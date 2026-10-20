import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOS } from '../../context/OSContext';
import {
  Wifi,
  Bluetooth,
  Moon,
  Sun,
  Volume2,
  SunMedium,
  BellOff,
  Battery,
  Settings,
} from 'lucide-react';
import { sound } from '../../utils/sound';

interface ToggleProps {
  on: boolean;
  onToggle: () => void;
}

const Toggle: React.FC<ToggleProps> = ({ on, onToggle }) => (
  <button onClick={onToggle} className={`toggle-track ${on ? 'on' : 'off'}`} type="button">
    <span className="toggle-thumb" />
  </button>
);

interface QuickTileProps {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  on: boolean;
  onToggle: () => void;
}

const QuickTile: React.FC<QuickTileProps> = ({ icon, label, sublabel, on, onToggle }) => (
  <button
    onClick={onToggle}
    className="flex items-center gap-3 p-3 rounded-2xl text-left w-full transition-all duration-150 active:scale-95"
    style={{
      background: on ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${on ? 'rgba(139,92,246,0.35)' : 'rgba(255,255,255,0.06)'}`,
    }}
    onMouseEnter={(e) => {
      if (!on) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = on ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.03)';
    }}
  >
    <div
      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
      style={{
        background: on ? 'var(--accent)' : 'rgba(255,255,255,0.07)',
        boxShadow: on ? '0 4px 14px rgba(139,92,246,0.4)' : 'none',
      }}
    >
      <span style={{ color: on ? 'white' : 'rgba(255,255,255,0.45)' }}>{icon}</span>
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-[12px] font-semibold" style={{ color: on ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.55)' }}>
        {label}
      </div>
      <div className="text-[10px] font-mono mt-0.5" style={{ color: 'rgba(255,255,255,0.30)' }}>
        {sublabel}
      </div>
    </div>
  </button>
);

export const QuickSettingsPanel: React.FC = () => {
  const {
    quickSettingsOpen,
    setQuickSettingsOpen,
    settings,
    updateSettings,
    toggleTheme,
    openApp,
    addNotification,
  } = useOS();

  const [wifiOn, setWifiOn] = useState(true);
  const [bluetoothOn, setBluetoothOn] = useState(true);
  const [dndOn, setDndOn] = useState(false);
  const [brightness, setBrightness] = useState(100);

  return (
    <AnimatePresence>
      {quickSettingsOpen && (
        <motion.div
      initial={settings.animationsEnabled ? { opacity: 0, y: 20, scale: 0.96, filter: 'blur(6px)' } : undefined}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: 14, scale: 0.97, filter: 'blur(4px)' }}
      transition={{ type: 'spring', damping: 28, stiffness: 420 }}
      onClick={(e) => e.stopPropagation()}
      className="fixed bottom-14 right-4 z-50 w-80 select-none overflow-hidden"
      style={{
        borderRadius: 22,
        background: 'rgba(8, 8, 14, 0.94)',
        backdropFilter: 'blur(52px) saturate(180%)',
        WebkitBackdropFilter: 'blur(52px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: '0 28px 70px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      {/* Accent strip */}
      <div
        className="absolute top-0 left-1/3 right-1/3 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.4), transparent)' }}
      />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="label-section">Control Center</span>
          <button
            onClick={() => { sound.playClick(); openApp('settings'); setQuickSettingsOpen(false); }}
            className="btn-ghost h-7 w-7 rounded-xl p-0"
            title="All Settings"
          >
            <Settings size={13} />
          </button>
        </div>

        {/* Quick Toggles Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <QuickTile
            icon={<Wifi size={15} />}
            label="Wi-Fi"
            sublabel={wifiOn ? 'Godly-Network' : 'Off'}
            on={wifiOn}
            onToggle={() => {
              sound.playClick();
              setWifiOn(!wifiOn);
              addNotification('Wi-Fi', wifiOn ? 'Wi-Fi disabled' : 'Connected to Godly-Network 6GHz', 'info');
            }}
          />
          <QuickTile
            icon={<Bluetooth size={15} />}
            label="Bluetooth"
            sublabel={bluetoothOn ? 'Active' : 'Off'}
            on={bluetoothOn}
            onToggle={() => { sound.playClick(); setBluetoothOn(!bluetoothOn); }}
          />
          <QuickTile
            icon={settings.theme === 'dark' ? <Moon size={15} /> : <Sun size={15} />}
            label="Appearance"
            sublabel={settings.theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            on={true}
            onToggle={() => toggleTheme()}
          />
          <QuickTile
            icon={<BellOff size={15} />}
            label="Focus"
            sublabel={dndOn ? 'Silent' : 'Off'}
            on={dndOn}
            onToggle={() => { sound.playClick(); setDndOn(!dndOn); }}
          />
        </div>

        {/* Sliders */}
        <div
          className="rounded-2xl p-3.5 space-y-4"
          style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Brightness */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2 text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>
                <SunMedium size={13} className="text-amber-400" />
                Brightness
              </div>
              <span className="accent-badge">{brightness}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={brightness}
              onChange={(e) => setBrightness(parseInt(e.target.value, 10))}
              className="w-full cursor-pointer"
              style={{
                accentColor: 'var(--accent)',
              }}
            />
          </div>

          {/* Volume */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2 text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>
                <Volume2 size={13} className="text-violet-400" />
                Volume
              </div>
              <span className="accent-badge">{Math.round(settings.volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.volume}
              onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })}
              className="w-full cursor-pointer"
              style={{ accentColor: 'var(--accent)' }}
            />
          </div>
        </div>

        {/* Battery Footer */}
        <div
          className="mt-3 pt-3 flex items-center justify-between"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-2 text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.50)' }}>
            <Battery size={14} className="text-emerald-400" />
            <span>100% — Fully Charged</span>
          </div>
        </div>
      </div>
    </motion.div>
      )}
    </AnimatePresence>
  );
};
