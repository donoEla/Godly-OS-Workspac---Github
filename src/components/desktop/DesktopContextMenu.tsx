import React from 'react';
import { useOS } from '../../context/OSContext';
import {
  FolderPlus,
  FilePlus,
  Terminal,
  Image,
  SunMoon,
  RotateCw,
  Settings,
  Sparkles,
  Command,
  Shield,
} from 'lucide-react';
import { sound } from '../../utils/sound';

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, shortcut, onClick, variant = 'default' }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl transition-all duration-100 text-left group"
    style={{ color: variant === 'danger' ? 'rgba(239,68,68,0.75)' : 'rgba(255,255,255,0.72)' }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = variant === 'danger'
        ? 'rgba(239,68,68,0.10)'
        : 'rgba(255,255,255,0.06)';
      e.currentTarget.style.color = variant === 'danger' ? '#ef4444' : 'rgba(255,255,255,0.92)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.color = variant === 'danger' ? 'rgba(239,68,68,0.75)' : 'rgba(255,255,255,0.72)';
    }}
  >
    <div className="flex items-center gap-2.5">
      <span className="opacity-75 group-hover:opacity-100 transition-opacity">{icon}</span>
      <span className="text-[12px] font-medium">{label}</span>
    </div>
    {shortcut && (
      <kbd
        className="text-[10px] font-mono px-1.5 py-0.5 rounded-lg"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.30)',
        }}
      >
        {shortcut}
      </kbd>
    )}
  </button>
);

const MenuDivider = () => (
  <div className="h-px my-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
);

export const DesktopContextMenu: React.FC = () => {
  const {
    contextMenu,
    closeContextMenu,
    openApp,
    createFolder,
    createFile,
    toggleTheme,
    addNotification,
    setCommandPaletteOpen,
    panicCloak,
    settings,
    updateSettings,
  } = useOS();

  if (!contextMenu.isOpen) return null;

  const handleAction = (action: () => void) => {
    sound.playClick();
    action();
    closeContextMenu();
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        left: contextMenu.x,
        top: contextMenu.y,
        position: 'fixed',
        zIndex: 50,
        width: 220,
        borderRadius: 16,
        background: 'rgba(8, 8, 14, 0.96)',
        backdropFilter: 'blur(48px) saturate(180%)',
        WebkitBackdropFilter: 'blur(48px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.07)',
        padding: '6px',
      }}
      className="anim-in"
    >
      <MenuItem
        icon={<Command size={13} className="text-violet-400" />}
        label="Command Palette"
        shortcut="Ctrl+K"
        onClick={() => handleAction(() => setCommandPaletteOpen(true))}
      />
      <MenuItem
        icon={<Shield size={13} className="text-red-400" />}
        label="Panic Cloak"
        shortcut="~"
        onClick={() => handleAction(() => panicCloak())}
        variant="danger"
      />

      <MenuDivider />

      <MenuItem
        icon={<FolderPlus size={13} className="text-amber-400" />}
        label="New Folder"
        onClick={() => handleAction(() => {
          const folderName = prompt('Folder name:', 'New Folder');
          if (folderName) {
            createFolder('desktop', folderName);
            addNotification('Folder Created', `"${folderName}" added to Desktop`, 'success');
          }
        })}
      />
      <MenuItem
        icon={<FilePlus size={13} className="text-violet-400" />}
        label="New Note"
        onClick={() => handleAction(() => {
          const fileName = prompt('Note name:', 'Note.txt');
          if (fileName) {
            createFile('desktop', fileName, 'Created from Desktop context menu');
            addNotification('Note Created', `"${fileName}" added to Desktop`, 'success');
          }
        })}
      />

      <MenuDivider />

      <MenuItem
        icon={<Terminal size={13} className="text-emerald-400" />}
        label="Open Terminal"
        onClick={() => handleAction(() => openApp('terminal'))}
      />
      <MenuItem
        icon={<Image size={13} className="text-sky-400" />}
        label="Change Wallpaper..."
        onClick={() => handleAction(() => openApp('settings'))}
      />
      <MenuItem
        icon={<Sparkles size={13} className="text-fuchsia-400" />}
        label={`${settings.particleBackground ? 'Disable' : 'Enable'} Particles`}
        onClick={() => handleAction(() => updateSettings({ particleBackground: !settings.particleBackground }))}
      />
      <MenuItem
        icon={<SunMoon size={13} className="text-amber-300" />}
        label="Toggle Dark/Light"
        onClick={() => handleAction(() => toggleTheme())}
      />

      <MenuDivider />

      <MenuItem
        icon={<RotateCw size={13} style={{ color: 'rgba(255,255,255,0.35)' }} />}
        label="Refresh Desktop"
        onClick={() => handleAction(() => addNotification('Desktop', 'Refreshed desktop.', 'info'))}
      />
      <MenuItem
        icon={<Settings size={13} className="text-violet-400" />}
        label="System Settings"
        onClick={() => handleAction(() => openApp('settings'))}
      />
    </div>
  );
};
