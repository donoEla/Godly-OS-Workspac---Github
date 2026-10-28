import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOS } from '../../context/OSContext';
import {
  Search,
  Power,
  RotateCcw,
  Lock,
  Sparkles,
  FileText,
  Terminal as TerminalIcon,
  Shield,
} from 'lucide-react';
import { AppId } from '../../types/os';
import { sound } from '../../utils/sound';
import { getAssetUrl } from '../../utils/assetHelper';

const PINNED_APPS: { id: AppId; name: string; category: string; icon: string }[] = [
  { id: 'zen',             name: 'Godly Browser',   category: 'Web',     icon: getAssetUrl('assets/icons/zen.jpg') },
  { id: 'virtual-machine', name: 'Virtual Machine', category: 'Dev',     icon: getAssetUrl('assets/icons/vm.png') },
  { id: 'widgets',         name: 'Widgets Studio',  category: 'Utility', icon: getAssetUrl('assets/icons/widgets.jpeg') },
  { id: 'app-store',       name: 'Godly Store',     category: 'Hub',     icon: getAssetUrl('assets/icons/app-store.jpg') },
  { id: 'extensions',      name: 'Extensions',      category: 'System',  icon: getAssetUrl('assets/icons/extensions.jpg') },
  { id: 'theme-studio',    name: 'Theme Studio',    category: 'System',  icon: getAssetUrl('assets/icons/themes.png') },
  { id: 'voice-memos',     name: 'Voice Memos',     category: 'Utility', icon: getAssetUrl('assets/icons/voice-memos.jpg') },
  { id: 'terminal',        name: 'Terminal',        category: 'Dev',     icon: getAssetUrl('assets/icons/terminal.jpg') },
  { id: 'notes',           name: 'Notes Studio',    category: 'Work',    icon: getAssetUrl('assets/icons/notes.jpg') },
  { id: 'spotify',         name: 'Music',           category: 'Media',   icon: getAssetUrl('assets/icons/spotify.jpg') },
  { id: 'movies',          name: 'StreamFlix',      category: 'Media',   icon: getAssetUrl('assets/icons/movies.png') },
  { id: 'manga',           name: 'Godly Manga',     category: 'Media',   icon: getAssetUrl('assets/icons/manga.svg') },
  { id: 'file-manager',    name: 'Files',           category: 'System',  icon: getAssetUrl('assets/icons/file-manager.jpg') },
  { id: 'games',           name: 'Arcade',          category: 'Gaming',  icon: getAssetUrl('assets/icons/games.jpg') },
  { id: 'calculator',      name: 'Calculator',      category: 'Utility', icon: getAssetUrl('assets/icons/calculator.jpg') },
  { id: 'settings',        name: 'Settings',        category: 'System',  icon: getAssetUrl('assets/icons/settings.jpg') },
];

export const StartMenu: React.FC = () => {
  const {
    startMenuOpen,
    setStartMenuOpen,
    openApp,
    openWebApp,
    installedApps,
    setCommandPaletteOpen,
    panicCloak,
    settings,
    addNotification,
  } = useOS();

  const [search, setSearch] = useState('');

  const allAvailableApps = [
    ...PINNED_APPS,
    ...installedApps
      .filter((inst) => !PINNED_APPS.some((p) => (inst.appId && p.id === inst.appId) || p.id === inst.id))
      .map((inst) => ({
        id: (inst.appId || inst.id) as any,
        name: inst.name,
        category: inst.category || 'App',
        icon: inst.icon,
        url: inst.url,
        appId: inst.appId,
      })),
  ];

  const filteredApps = allAvailableApps.filter((app) =>
    app.name.toLowerCase().includes(search.toLowerCase()) ||
    app.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleLaunchItem = (app: any) => {
    sound.playClick();
    if (app.url) {
      openWebApp(app.name, app.url, app.icon);
    } else if (app.appId) {
      openApp(app.appId);
    } else {
      openApp(app.id);
    }
    setStartMenuOpen(false);
  };

  const isTop = settings.taskbarPosition === 'top';

  return (
    <AnimatePresence>
      {startMenuOpen && (
        <motion.div
          initial={settings.animationsEnabled ? { opacity: 0, y: isTop ? -16 : 16, scale: 0.97, filter: 'blur(6px)' } : undefined}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={settings.animationsEnabled ? { opacity: 0, y: isTop ? -12 : 12, scale: 0.97, filter: 'blur(4px)' } : undefined}
          transition={{ type: 'spring', damping: 28, stiffness: 400 }}
          onClick={(e) => e.stopPropagation()}
        className={`fixed ${isTop ? 'top-14' : 'bottom-14'} left-1/2 -translate-x-1/2 z-50 w-[480px] max-w-[95vw] select-none overflow-hidden`}
        style={{
          borderRadius: 24,
          background: 'var(--glass-panel, rgba(8, 8, 14, 0.94))',
          backdropFilter: 'blur(var(--glass-blur, 52px)) saturate(180%)',
          WebkitBackdropFilter: 'blur(var(--glass-blur, 52px)) saturate(180%)',
          border: '1px solid var(--border-default, rgba(255,255,255,0.09))',
          boxShadow: 'var(--shadow-lg, 0 32px 80px rgba(0,0,0,0.85)), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        {/* Top ambient glow strip */}
        <div
          className="absolute top-0 left-1/4 right-1/4 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent)' }}
        />

        {/* ── Search Header ── */}
        <div className="p-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3.5 pointer-events-none" style={{ color: 'rgba(255,255,255,0.3)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search apps..."
              autoFocus
              id="start-menu-search"
              className="w-full pl-10 pr-14 py-2.5 rounded-xl text-[13px] font-medium tracking-tight outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.90)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(139,92,246,0.45)';
                e.currentTarget.style.background = 'rgba(139,92,246,0.06)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              }}
            />
            <button
              onClick={() => { setStartMenuOpen(false); setCommandPaletteOpen(true); }}
              className="absolute right-3 px-1.5 py-0.5 rounded-lg text-[10px] font-mono transition-colors"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.35)',
              }}
            >
              ⌘K
            </button>
          </div>
        </div>

        {/* ── Apps Grid ── */}
        <div className="p-4 pb-3">
          <div className="flex items-center justify-between mb-3 px-0.5">
            <span className="label-section">Applications</span>
            <span className="accent-badge">{allAvailableApps.length} apps</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {filteredApps.map((app) => (
              <button
                key={app.id}
                onClick={() => handleLaunchItem(app)}
                className="group flex flex-col items-center p-2.5 rounded-2xl transition-all duration-150 active:scale-95"
                style={{ background: 'transparent' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div
                  className="w-12 h-12 rounded-2xl overflow-hidden mb-2 transition-all duration-150 group-hover:scale-105"
                  style={{
                    boxShadow: '0 4px 16px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(255,255,255,0.10)',
                  }}
                >
                  <img src={getAssetUrl(app.icon)} alt={app.name} className="w-full h-full object-cover" draggable={false} />
                </div>
                <span className="text-[11px] font-medium text-center leading-tight truncate max-w-full" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  {app.name}
                </span>
                <span className="text-[9px] font-mono mt-0.5 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.28)' }}>
                  {app.category}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Quick Launch Strip ── */}
        <div className="px-4 pb-3">
          <div
            className="flex items-center gap-1 p-1.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <button
              onClick={() => handleLaunchItem({ id: 'terminal', appId: 'terminal', name: 'Terminal' })}
              className="flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
              style={{ color: 'rgba(255,255,255,0.65)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <TerminalIcon size={13} className="text-emerald-400" />
              Shell
            </button>
            <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <button
              onClick={() => handleLaunchItem({ id: 'notes', appId: 'notes', name: 'Notes Studio' })}
              className="flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
              style={{ color: 'rgba(255,255,255,0.65)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <FileText size={13} className="text-amber-400" />
              Notes
            </button>
            <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <button
              onClick={() => { sound.playMinimize(); panicCloak(); setStartMenuOpen(false); }}
              className="flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
              style={{ color: 'rgba(239,68,68,0.7)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Shield size={13} className="text-red-400" />
              Panic
            </button>
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.018)' }}
        >
          <div className="flex items-center gap-2.5">
            {/* Avatar */}
            <div
              className="relative w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                boxShadow: '0 4px 14px rgba(124,58,237,0.4)',
              }}
            >
              <Sparkles size={13} className="text-white" />
              <span
                className="absolute bottom-0 right-0 w-2 h-2 rounded-full ring-2"
                style={{ background: '#10b981', outline: '2px solid #050508', outlineOffset: '0px' }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] font-semibold" style={{ color: 'rgba(255,255,255,0.90)' }}>
                  Godly User
                </span>
                <span className="accent-badge text-[9px]">PRO</span>
              </div>
              <div className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.30)' }}>
                Celestial Workspace
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                sound.playClick();
                setStartMenuOpen(false);
                window.dispatchEvent(new CustomEvent('godly-open-tutorial'));
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all mr-1"
              style={{
                background: 'var(--accent-dim)',
                color: 'var(--accent-text)',
                border: '1px solid var(--accent-border)',
              }}
              title="Interactive Tour of Godly OS"
            >
              <Sparkles size={11} />
              Tour
            </button>
            <button
              onClick={() => { sound.playClick(); openApp('settings'); setStartMenuOpen(false); }}
              className="btn-ghost w-8 h-8 rounded-xl"
              title="Settings"
            >
              ⚙
            </button>
            <button
              onClick={() => {
                sound.playClick();
                addNotification('Session Locked', 'Desktop locked. Press any key to resume.', 'info');
                setStartMenuOpen(false);
              }}
              className="btn-ghost w-8 h-8 rounded-xl"
              title="Lock"
            >
              <Lock size={13} />
            </button>
            <button
              onClick={() => {
                sound.playClick();
                if (confirm('Reboot Godly OS?')) window.location.reload();
              }}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-[13px] transition-all"
              style={{ color: 'rgba(239,68,68,0.65)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                e.currentTarget.style.color = '#ef4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'rgba(239,68,68,0.65)';
              }}
              title="Restart"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
  );
};
