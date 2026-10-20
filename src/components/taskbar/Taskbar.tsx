import React, { useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import {
  Wifi,
  Volume2,
  VolumeX,
  Battery,
  Bell,
  Sparkles,
  Search,
} from 'lucide-react';
import { AppId } from '../../types/os';
import { sound } from '../../utils/sound';

interface PinnedTaskbarItem {
  id: AppId;
  name: string;
  icon: string;
}

const PINNED_ITEMS: PinnedTaskbarItem[] = [
  { id: 'app-store',    name: 'Godly Store',  icon: '/assets/icons/app-store.jpg' },
  { id: 'terminal',     name: 'Terminal',     icon: '/assets/icons/terminal.jpg' },
  { id: 'notes',        name: 'Notes',        icon: '/assets/icons/notes.jpg' },
  { id: 'spotify',      name: 'Music',        icon: '/assets/icons/spotify.jpg' },
  { id: 'file-manager', name: 'Files',        icon: '/assets/icons/file-manager.jpg' },
  { id: 'games',        name: 'Arcade',       icon: '/assets/icons/games.jpg' },
  { id: 'calculator',   name: 'Calculator',   icon: '/assets/icons/calculator.jpg' },
  { id: 'settings',     name: 'Settings',     icon: '/assets/icons/settings.jpg' },
];

export const Taskbar: React.FC = () => {
  const {
    windows,
    activeWindowId,
    openApp,
    focusWindow,
    minimizeWindow,
    minimizeAll,
    startMenuOpen,
    setStartMenuOpen,
    quickSettingsOpen,
    setQuickSettingsOpen,
    calendarOpen,
    setCalendarOpen,
    notificationCenterOpen,
    setNotificationCenterOpen,
    setCommandPaletteOpen,
    notifications,
    settings,
  } = useOS();

  const [time, setTime] = useState(new Date());
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const dateStr = time.toLocaleDateString([], { month: 'short', day: 'numeric' });

  const handleAppClick = (appId: AppId) => {
    sound.playClick();
    const existing = windows.find((w) => w.appId === appId);
    if (!existing) {
      openApp(appId);
    } else if (existing.id === activeWindowId && !existing.isMinimized) {
      minimizeWindow(existing.id);
    } else {
      focusWindow(existing.id);
    }
  };

  const handleStartToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    setStartMenuOpen((prev) => !prev);
    setQuickSettingsOpen(false);
    setCalendarOpen(false);
    setNotificationCenterOpen(false);
  };

  const handleQuickSettingsToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    setQuickSettingsOpen((prev) => !prev);
    setStartMenuOpen(false);
    setCalendarOpen(false);
    setNotificationCenterOpen(false);
  };

  const handleCalendarToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    setCalendarOpen((prev) => !prev);
    setStartMenuOpen(false);
    setQuickSettingsOpen(false);
    setNotificationCenterOpen(false);
  };

  const handleNotificationToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    setNotificationCenterOpen((prev) => !prev);
    setStartMenuOpen(false);
    setQuickSettingsOpen(false);
    setCalendarOpen(false);
  };

  const isTop = settings.taskbarPosition === 'top';

  return (
    <footer
      onClick={(e) => e.stopPropagation()}
      className={`fixed ${isTop ? 'top-2.5' : 'bottom-2.5'} left-1/2 -translate-x-1/2 z-50 select-none`}
    >
      {/* Ambient glow beneath dock */}
      <div
        className="absolute inset-x-4 -bottom-3 h-8 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.18) 0%, transparent 75%)',
          filter: 'blur(8px)',
        }}
      />

      <div
        className="relative glass-dock rounded-2xl flex items-center gap-0.5 px-2 py-1.5"
        style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.75), 0 0 0 0.5px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.09)' }}
      >
        {/* ── Start / Launcher Button ── */}
        <button
          onClick={handleStartToggle}
          id="taskbar-start-btn"
          className={`group relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 ${
            startMenuOpen
              ? 'bg-violet-600/25 ring-1 ring-violet-500/50'
              : 'hover:bg-white/[0.07]'
          }`}
          title="Godly Launcher (Ctrl+Space)"
        >
          <div
            className="w-[26px] h-[26px] rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110 group-active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #8b5cf6 100%)',
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.5), inset 0 1px 0 rgba(255,255,255,0.25)',
            }}
          >
            <Sparkles size={12} className="text-white" />
          </div>
          {startMenuOpen && (
            <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-400" style={{ boxShadow: '0 0 6px rgba(167,139,250,0.8)' }} />
          )}
        </button>

        {/* ── Search / Command Pill ── */}
        <button
          onClick={() => { sound.playClick(); setCommandPaletteOpen(true); }}
          id="taskbar-search-btn"
          className="flex items-center gap-2 h-8 px-2.5 rounded-xl transition-all duration-150 hover:bg-white/[0.07] border border-transparent hover:border-white/[0.08]"
          title="Command Palette (Ctrl+K)"
        >
          <Search size={12} className="text-white/35" />
          <span className="text-[11px] font-medium text-white/25 hidden sm:block tracking-tight">Search...</span>
          <span
            className="hidden sm:flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-mono text-white/30 border"
            style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)' }}
          >
            ⌘K
          </span>
        </button>

        {/* ── Divider ── */}
        <div className="w-px h-5 mx-1" style={{ background: 'rgba(255,255,255,0.08)' }} />

        {/* ── Pinned App Icons ── */}
        <div className="flex items-center gap-0.5">
          {PINNED_ITEMS.map((item) => {
            const openWin = windows.find((w) => w.appId === item.id);
            const isOpen = Boolean(openWin);
            const isActive = openWin?.id === activeWindowId && !openWin.isMinimized;
            const isHovered = hoveredId === item.id;

            return (
              <button
                key={item.id}
                id={`taskbar-${item.id}`}
                onClick={() => handleAppClick(item.id)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`group relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 active:scale-90 hover:-translate-y-0.5 hover:scale-110 ${
                  isActive
                    ? 'bg-white/[0.10]'
                    : isHovered
                    ? 'bg-white/[0.07]'
                    : ''
                }`}
                title={item.name}
              >
                <div
                  className="w-[26px] h-[26px] rounded-lg overflow-hidden"
                  style={{
                    boxShadow: isActive
                      ? '0 4px 16px rgba(139,92,246,0.35), 0 0 0 1px rgba(139,92,246,0.4)'
                      : '0 2px 8px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.08)',
                  }}
                >
                  <img
                    src={item.icon}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </div>
                {/* App pip indicator */}
                {isOpen && (
                  isActive ? (
                    <span className="dock-pip-active" />
                  ) : (
                    <span className="dock-pip opacity-40" />
                  )
                )}
                {/* Tooltip */}
                {isHovered && (
                  <span
                    className="absolute -top-8 left-1/2 px-2 py-1 rounded-lg text-[11px] font-medium text-white whitespace-nowrap pointer-events-none dock-tooltip"
                    style={{
                      background: 'rgba(10,10,18,0.95)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                    }}
                  >
                    {item.name}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Divider ── */}
        <div className="w-px h-5 mx-1" style={{ background: 'rgba(255,255,255,0.08)' }} />

        {/* ── System Tray ── */}
        <div className="flex items-center gap-0.5">
          {/* Control Center */}
          <button
            onClick={handleQuickSettingsToggle}
            id="taskbar-quick-settings-btn"
            className={`flex items-center gap-1.5 h-8 px-2 rounded-xl transition-all duration-150 ${
              quickSettingsOpen
                ? 'bg-white/[0.12] ring-1 ring-white/[0.15]'
                : 'hover:bg-white/[0.07]'
            }`}
            title="Control Center"
          >
            <Wifi size={12} className="text-white/60" />
            {settings.volume > 0 && settings.soundEnabled ? (
              <Volume2 size={12} className="text-white/60" />
            ) : (
              <VolumeX size={12} className="text-white/30" />
            )}
            <Battery size={12} className="text-emerald-400/80" />
          </button>

          {/* Notification Bell */}
          <button
            onClick={handleNotificationToggle}
            id="taskbar-notifications-btn"
            className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-150 ${
              notificationCenterOpen
                ? 'bg-white/[0.12] ring-1 ring-white/[0.15]'
                : 'hover:bg-white/[0.07]'
            }`}
            title="Notifications"
          >
            <Bell size={13} className="text-white/55" />
            {notifications.length > 0 && (
              <span
                className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full glow-pulse"
                style={{ background: 'var(--accent)', boxShadow: '0 0 6px var(--accent-glow)' }}
              />
            )}
          </button>

          {/* Clock */}
          <button
            onClick={handleCalendarToggle}
            id="taskbar-clock-btn"
            className={`flex flex-col items-center justify-center h-8 px-2.5 rounded-xl transition-all duration-150 ${
              calendarOpen
                ? 'bg-white/[0.12] ring-1 ring-white/[0.15]'
                : 'hover:bg-white/[0.07]'
            }`}
            title="Calendar"
          >
            <span className="text-[11px] font-semibold text-white/85 font-mono tracking-tight leading-none">
              {timeStr}
            </span>
            <span className="text-[9px] text-white/30 font-mono leading-none mt-0.5">
              {dateStr}
            </span>
          </button>

          {/* Show Desktop Slit */}
          <button
            onClick={() => minimizeAll()}
            className="w-1 h-6 rounded-full ml-0.5 transition-colors"
            style={{ background: 'rgba(255,255,255,0.14)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.35)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.14)')}
            title="Show Desktop"
          />
        </div>
      </div>
    </footer>
  );
};
