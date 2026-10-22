import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppId, WindowInstance, SystemSettings, AccentColor, FileItem, NotificationItem, SnapRegion, InstalledApp } from '../types/os';
import { WALLPAPERS, INITIAL_FILESYSTEM, ACCENT_CONFIGS, CLOAK_PRESETS } from '../constants/assets';
import { sound } from '../utils/sound';
import { getAssetUrl } from '../utils/assetHelper';

interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  type: 'desktop' | 'item';
  data?: any;
}

export interface NowPlayingState {
  title: string;
  artist: string;
  album: string;
  duration: number;
  cover: string;
  isPlaying: boolean;
  progress: number;
}

interface OSContextType {
  // Windows
  windows: WindowInstance[];
  activeWindowId: string | null;
  openApp: (appId: AppId, customTitle?: string, customUrl?: string, customIcon?: string) => void;
  openWebApp: (title: string, url: string, icon?: string) => void;
  openNewBrowserWindow: (options?: {
    tab?: any;
    customUrl?: string;
    position?: { x: number; y: number };
    snapRegion?: SnapRegion;
    sourceWindowId?: string;
  }) => string;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowBounds: (id: string, bounds: Partial<Pick<WindowInstance, 'x' | 'y' | 'width' | 'height'>>) => void;
  minimizeAll: () => void;

  // Installed Apps & Desktop
  installedApps: InstalledApp[];
  installApp: (app: InstalledApp) => void;
  uninstallApp: (appId: string) => void;

  // Window Snapping (NautilusOS-style)
  snapPreview: SnapRegion;
  setSnapPreview: (snap: SnapRegion) => void;
  snapWindow: (id: string, region: SnapRegion) => void;

  // Command Palette (Achroma-style cmdk)
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  toggleCommandPalette: () => void;

  // Dynamic Island / Media Pill (Achroma-style)
  nowPlaying: NowPlayingState;
  setNowPlaying: React.Dispatch<React.SetStateAction<NowPlayingState>>;
  togglePlayPauseNowPlaying: () => void;
  nextTrackNowPlaying: () => void;

  // Stealth & Cloaking (NautilusOS-style)
  applyCloak: (presetId: string | null) => void;
  openAboutBlankCloak: () => void;
  panicCloak: () => void;

  // UI Panels
  startMenuOpen: boolean;
  setStartMenuOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  quickSettingsOpen: boolean;
  setQuickSettingsOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  calendarOpen: boolean;
  setCalendarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  notificationCenterOpen: boolean;
  setNotificationCenterOpen: (open: boolean | ((prev: boolean) => boolean)) => void;

  // Context Menu
  contextMenu: ContextMenuState;
  openContextMenu: (e: React.MouseEvent, type?: 'desktop' | 'item', data?: any) => void;
  closeContextMenu: () => void;

  // System Settings
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  setWallpaper: (path: string) => void;
  setAccentColor: (color: AccentColor) => void;
  toggleTheme: () => void;

  // Notifications
  notifications: NotificationItem[];
  addNotification: (title: string, message: string, type?: NotificationItem['type'], icon?: string) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  // File System
  fileSystem: FileItem[];
  createFile: (parentId: string | null, name: string, content?: string, extension?: string, imageUrl?: string) => FileItem;
  createFolder: (parentId: string | null, name: string) => FileItem;
  deleteFileItem: (id: string) => void;
  updateFileContent: (id: string, content: string) => void;
  renameFileItem: (id: string, newName: string) => void;
}

const OSContext = createContext<OSContextType | null>(null);

const DEFAULT_SETTINGS: SystemSettings = {
  theme: 'dark',
  accentColor: 'violet',
  wallpaper: getAssetUrl(WALLPAPERS[0].path),
  wallpaperBlur: 0,
  soundEnabled: true,
  volume: 0.6,
  glassBlur: 28,
  animationsEnabled: true,
  taskbarPosition: 'bottom',
  windowSnapping: true,
  particleBackground: true,
  mediaPillEnabled: true,
  activeCloak: null,
};

export const DEFAULT_INSTALLED_APPS: InstalledApp[] = [
  { id: 'zen-browser', name: 'Godly Browser', icon: getAssetUrl('assets/icons/zen.jpg'), category: 'Productivity', appId: 'zen' },
  { id: 'spotify-app', name: 'Spotify Cloud', icon: getAssetUrl('assets/icons/spotify.jpg'), category: 'Media', appId: 'spotify' },
  { id: 'octave-stream', name: 'Octave Streaming', icon: getAssetUrl('assets/icons/octave.png?v=3'), category: 'Media', url: 'https://octavestreaming.com/' },
  { id: 'movies', name: 'Movies', icon: getAssetUrl('assets/icons/movies.png'), category: 'Media', url: 'https://1337x.to/' },
  { id: 'games-arcade', name: 'Godly Arcade', icon: getAssetUrl('assets/icons/games.jpg'), category: 'Games', appId: 'games' },
  { id: 'terminal', name: 'Terminal', icon: getAssetUrl('assets/icons/terminal.jpg'), category: 'Utilities', appId: 'terminal' },
  { id: 'notes-studio', name: 'Notes Studio', icon: getAssetUrl('assets/icons/notes.jpg'), category: 'Productivity', appId: 'notes' },
  { id: 'calculator-pro', name: 'Calculator Pro', icon: getAssetUrl('assets/icons/calculator.jpg'), category: 'Utilities', appId: 'calculator' },
  { id: 'file-manager', name: 'File Manager', icon: getAssetUrl('assets/icons/file-manager.jpg'), category: 'System', appId: 'file-manager' },
  { id: 'app-store', name: 'Godly Store', icon: getAssetUrl('assets/icons/app-store.jpg'), category: 'System', appId: 'app-store' },
  { id: 'extensions-hub', name: 'Extensions Hub', icon: getAssetUrl('assets/icons/app-store.jpg'), category: 'System', appId: 'extensions' },
  { id: 'settings', name: 'Settings', icon: getAssetUrl('assets/icons/settings.jpg'), category: 'System', appId: 'settings' },
];

const APP_META: Record<AppId, { title: string; icon: string; width: number; height: number }> = {
  'app-store': { title: 'Godly Store', icon: getAssetUrl('assets/icons/app-store.jpg'), width: 920, height: 640 },
  'calculator': { title: 'Calculator Pro', icon: getAssetUrl('assets/icons/calculator.jpg'), width: 440, height: 600 },
  'extensions': { title: 'Extensions Hub', icon: getAssetUrl('assets/icons/app-store.jpg'), width: 980, height: 640 },
  'file-manager': { title: 'File Manager', icon: getAssetUrl('assets/icons/file-manager.jpg'), width: 880, height: 580 },
  'games': { title: 'Godly Arcade', icon: getAssetUrl('assets/icons/games.jpg'), width: 860, height: 640 },
  'notes': { title: 'Notes Studio', icon: getAssetUrl('assets/icons/notes.jpg'), width: 880, height: 600 },
  'settings': { title: 'Settings', icon: getAssetUrl('assets/icons/settings.jpg'), width: 860, height: 620 },
  'spotify': { title: 'Spotify Cloud', icon: getAssetUrl('assets/icons/spotify.jpg'), width: 920, height: 640 },
  'terminal': { title: 'Terminal', icon: getAssetUrl('assets/icons/terminal.jpg'), width: 780, height: 520 },
  'web-app': { title: 'Web App', icon: getAssetUrl('assets/icons/settings.jpg'), width: 960, height: 660 },
  'zen': { title: 'Godly Browser', icon: getAssetUrl('assets/icons/zen.jpg'), width: 1060, height: 720 },
};

export const OSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial settings
  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem('godly_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.wallpaper) {
          parsed.wallpaper = getAssetUrl(parsed.wallpaper);
        }
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Windows state
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [highestZ, setHighestZ] = useState<number>(100);

  // Installed Apps State (synced to localStorage with automatic version reconciliation)
  const [installedApps, setInstalledApps] = useState<InstalledApp[]>(() => {
    try {
      const version = localStorage.getItem('godly_apps_version');
      const saved = localStorage.getItem('godly_installed_apps');
      
      if (saved && version === '3.6') {
        const list: InstalledApp[] = JSON.parse(saved);
        return list
          .filter((a: any) => a.id !== 'gnmath-leonard')
          .map((app) => {
            if (app.id === 'streamflix' || app.id === 'movies') {
              const def = DEFAULT_INSTALLED_APPS.find((d) => d.id === 'movies');
              if (def) return def;
            }
            const def = DEFAULT_INSTALLED_APPS.find((d) => d.id === app.id);
            if (def) {
              return { ...app, icon: def.icon, name: def.name, url: def.url };
            }
            return { ...app, icon: getAssetUrl(app.icon) };
          });
      }
      // Migrate old storage: force update default icons and set version
      localStorage.setItem('godly_apps_version', '3.6');
      localStorage.setItem('godly_installed_apps', JSON.stringify(DEFAULT_INSTALLED_APPS));
      return DEFAULT_INSTALLED_APPS;
    } catch {
      return DEFAULT_INSTALLED_APPS;
    }
  });

  // Always keep default app icons up to date even if user had older localStorage
  useEffect(() => {
    setInstalledApps((prev) => {
      let changed = false;
      let updated = prev.map((app) => {
        if (app.id === 'streamflix') {
          changed = true;
          const def = DEFAULT_INSTALLED_APPS.find((d) => d.id === 'movies');
          if (def) return def;
        }
        const def = DEFAULT_INSTALLED_APPS.find((d) => d.id === app.id);
        if (def && (app.icon !== def.icon || app.name !== def.name || app.url !== def.url)) {
          changed = true;
          return { ...app, icon: def.icon, name: def.name, url: def.url };
        }
        return app;
      });

      // Ensure Movies app is present
      if (!updated.some((a) => a.id === 'movies')) {
        const moviesDef = DEFAULT_INSTALLED_APPS.find((d) => d.id === 'movies');
        if (moviesDef) {
          updated = [...updated, moviesDef];
          changed = true;
        }
      }

      // Ensure Zen Browser is present
      if (!updated.some((a) => a.id === 'zen-browser')) {
        const zenDef = DEFAULT_INSTALLED_APPS.find((d) => d.id === 'zen-browser');
        if (zenDef) {
          updated = [zenDef, ...updated];
          changed = true;
        }
      }

      if (changed) {
        try {
          localStorage.setItem('godly_installed_apps', JSON.stringify(updated));
          localStorage.setItem('godly_apps_version', '3.6');
        } catch {}
        return updated;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('godly_installed_apps', JSON.stringify(installedApps));
    } catch {}
  }, [installedApps]);

  // Panels
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [quickSettingsOpen, setQuickSettingsOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);

  // Command Palette & Snapping & Dynamic Island
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [snapPreview, setSnapPreview] = useState<SnapRegion>('none');
  const [nowPlaying, setNowPlaying] = useState<NowPlayingState>({
    title: 'Divine Astral Resonance',
    artist: 'Godly OS Ensemble',
    album: 'Ascension Vol. 1',
    duration: 184,
    cover: getAssetUrl('assets/backgrounds/kali-ferrofluid-1298846866.jpg'),
    isPlaying: false,
    progress: 42,
  });

  const lastEscapeRef = useRef<number>(0);

  // Context Menu
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    type: 'desktop',
  });

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'welcome-notif',
      title: 'Welcome to Godly OS',
      message: 'Luxury browser operating system loaded with full fluid desktop features.',
      time: 'Just now',
      type: 'info',
      icon: getAssetUrl('assets/icons/settings.jpg'),
    },
  ]);

  // File System
  const [fileSystem, setFileSystem] = useState<FileItem[]>(() => {
    try {
      const saved = localStorage.getItem('godly_fs');
      return saved ? JSON.parse(saved) : INITIAL_FILESYSTEM;
    } catch {
      return INITIAL_FILESYSTEM;
    }
  });

  // Sync settings to localStorage and DOM
  useEffect(() => {
    try {
      localStorage.setItem('godly_settings', JSON.stringify(settings));
    } catch {}

    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    const accent = ACCENT_CONFIGS[settings.accentColor];
    if (accent) {
      root.style.setProperty('--accent', accent.hex);
      root.style.setProperty('--accent-color', accent.hex);
      root.style.setProperty('--accent-glow', accent.glow);
      root.style.setProperty('--accent-dim', accent.subtle);
      root.style.setProperty('--accent-subtle', accent.subtle);
      root.style.setProperty('--accent-border', accent.hex + '66');
      root.style.setProperty('--accent-soft', accent.hex + '18');
      root.style.setProperty('--accent-text', accent.text);
    }

    sound.setEnabled(settings.soundEnabled);
    sound.setVolume(settings.volume);
  }, [settings]);

  // Sync filesystem to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('godly_fs', JSON.stringify(fileSystem));
    } catch {}
  }, [fileSystem]);

  // Play startup chime once
  useEffect(() => {
    const timer = setTimeout(() => {
      sound.playStartup();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const setWallpaper = useCallback((path: string) => {
    updateSettings({ wallpaper: path });
    sound.playClick();
  }, [updateSettings]);

  const setAccentColor = useCallback((color: AccentColor) => {
    updateSettings({ accentColor: color });
    sound.playClick();
  }, [updateSettings]);

  const toggleTheme = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
    sound.playClick();
  }, []);

  const toggleCommandPalette = useCallback(() => {
    sound.playClick();
    setCommandPaletteOpen((prev) => !prev);
    setStartMenuOpen(false);
    setQuickSettingsOpen(false);
    setCalendarOpen(false);
    setNotificationCenterOpen(false);
  }, []);

  const togglePlayPauseNowPlaying = useCallback(() => {
    sound.playClick();
    setNowPlaying((prev) => {
      const next = !prev.isPlaying;
      window.dispatchEvent(new CustomEvent('godly-music-toggle', { detail: { isPlaying: next } }));
      return { ...prev, isPlaying: next };
    });
  }, []);

  const nextTrackNowPlaying = useCallback(() => {
    sound.playClick();
    window.dispatchEvent(new CustomEvent('godly-music-next'));
  }, []);

  const applyCloak = useCallback((presetId: string | null) => {
    if (!presetId || presetId === 'default') {
      document.title = 'Godly OS — Celestial Desktop';
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = getAssetUrl('assets/icons/app-store.jpg');
      updateSettings({ activeCloak: null });
      return;
    }
    const preset = CLOAK_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      document.title = preset.title;
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = preset.faviconUrl;
      updateSettings({ activeCloak: presetId });
    }
  }, [updateSettings]);

  const openAboutBlankCloak = useCallback(() => {
    sound.playClick();
    try {
      const win = window.open('about:blank', '_blank');
      if (win) {
        win.document.title = 'My Drive - Google Drive';
        const link = win.document.createElement('link');
        link.rel = 'icon';
        link.href = 'https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png';
        win.document.head.appendChild(link);
        const embed = win.document.createElement('embed');
        embed.src = window.location.href;
        embed.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;border:none;';
        win.document.body.style.cssText = 'margin:0;overflow:hidden;background:#000;';
        win.document.body.appendChild(embed);
      }
    } catch (err) {
      console.warn('About:blank popup blocked', err);
    }
  }, []);

  const panicCloak = useCallback(() => {
    sound.playMinimize();
    setWindows((prev) => prev.map((w) => ({ ...w, isMinimized: true })));
    setActiveWindowId(null);
    applyCloak('classroom');
    setStartMenuOpen(false);
    setQuickSettingsOpen(false);
    setCalendarOpen(false);
    setNotificationCenterOpen(false);
    setCommandPaletteOpen(false);
  }, [applyCloak]);

  // Global keybindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Space -> toggle start menu
      if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
        e.preventDefault();
        setStartMenuOpen((prev) => !prev);
        sound.playClick();
      }
      // Ctrl + K or Cmd + K -> toggle Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      }
      // Panic Key: Backquote / Tilde (~)
      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        panicCloak();
      }
      // Escape -> close flyouts or double-escape panic
      if (e.key === 'Escape') {
        const now = Date.now();
        if (now - lastEscapeRef.current < 380) {
          panicCloak();
        }
        lastEscapeRef.current = now;
        setStartMenuOpen(false);
        setQuickSettingsOpen(false);
        setCalendarOpen(false);
        setNotificationCenterOpen(false);
        setCommandPaletteOpen(false);
        setContextMenu((prev) => ({ ...prev, isOpen: false }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCommandPalette, panicCloak]);

  // Notifications
  const addNotification = useCallback((title: string, message: string, type: NotificationItem['type'] = 'info', icon?: string) => {
    const newItem: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      message,
      time: 'Just now',
      type,
      icon,
    };
    setNotifications((prev) => [newItem, ...prev]);
    sound.playNotification();

    // Auto dismiss after 6s
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== newItem.id));
    }, 6000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Context Menu
  const openContextMenu = useCallback((e: React.MouseEvent, type: 'desktop' | 'item' = 'desktop', data?: any) => {
    e.preventDefault();
    e.stopPropagation();
    const x = Math.min(e.clientX, window.innerWidth - 220);
    const y = Math.min(e.clientY, window.innerHeight - 260);
    setContextMenu({ isOpen: true, x, y, type, data });
  }, []);

  const closeContextMenu = useCallback(() => {
    if (contextMenu.isOpen) {
      setContextMenu((prev) => ({ ...prev, isOpen: false }));
    }
  }, [contextMenu.isOpen]);

  // Window Management
  const focusWindow = useCallback((id: string) => {
    setHighestZ((prev) => {
      const nextZ = prev + 1;
      setWindows((prevWindows) =>
        prevWindows.map((w) => (w.id === id ? { ...w, zIndex: nextZ, isMinimized: false } : w))
      );
      return nextZ;
    });
    setActiveWindowId(id);
  }, []);

  const openApp = useCallback((appId: AppId, customTitle?: string, customUrl?: string, customIcon?: string) => {
    // Close start menu
    setStartMenuOpen(false);

    // Check if an instance of this app or URL already exists
    const existing = windows.find((w) => customUrl ? w.customUrl === customUrl : w.appId === appId);
    if (existing) {
      if (existing.isMinimized) {
        setWindows((prev) => prev.map((w) => (w.id === existing.id ? { ...w, isMinimized: false } : w)));
      }
      focusWindow(existing.id);
      sound.playClick();
      return;
    }

    // Otherwise create new instance
    const meta = APP_META[appId] || APP_META['web-app'];
    const newZ = highestZ + 1;
    setHighestZ(newZ);

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const w = Math.min(meta.width, screenW - 40);
    const h = Math.min(meta.height, screenH - 100);

    // Stagger slightly based on number of open windows
    const offset = (windows.length % 6) * 28;
    const x = Math.max(20, Math.min(screenW - w - 20, (screenW - w) / 2 + offset));
    const y = Math.max(20, Math.min(screenH - h - 70, (screenH - h) / 2 - 20 + offset));

    const newWindow: WindowInstance = {
      id: `win-${appId}-${Date.now()}`,
      appId,
      title: customTitle || meta.title,
      icon: customIcon || meta.icon,
      customUrl,
      x,
      y,
      width: w,
      height: h,
      isMinimized: false,
      isMaximized: false,
      zIndex: newZ,
    };

    setWindows((prev) => [...prev, newWindow]);
    setActiveWindowId(newWindow.id);
    sound.playOpen();
  }, [windows, highestZ, focusWindow]);

  const openWebApp = useCallback((title: string, url: string, icon?: string) => {
    openApp('web-app', title, url, icon);
  }, [openApp]);

  const openNewBrowserWindow = useCallback((options?: {
    tab?: any;
    customUrl?: string;
    position?: { x: number; y: number };
    snapRegion?: SnapRegion;
    sourceWindowId?: string;
  }) => {
    const meta = APP_META['zen'];
    const newZ = highestZ + 1;
    setHighestZ(newZ);

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const taskbarOffset = settings.taskbarPosition === 'top' ? 52 : 0;
    const availH = screenH - 52;
    let w = Math.min(meta.width, screenW - 40);
    let h = Math.min(meta.height, availH - 40);

    let x = Math.max(20, Math.min(screenW - w - 20, (screenW - w) / 2 + (windows.length % 5) * 32));
    let y = Math.max(20, Math.min(availH - h - 20, (availH - h) / 2 - 20 + taskbarOffset + (windows.length % 5) * 32));
    let snap: SnapRegion = options?.snapRegion || 'none';

    // Handle Split-Screen side by side
    if (options?.snapRegion === 'left') {
      const halfW = Math.floor(screenW / 2);
      x = 0;
      y = taskbarOffset;
      w = halfW;
      h = availH;
      snap = 'left';
    } else if (options?.snapRegion === 'right') {
      const halfW = Math.floor(screenW / 2);
      x = halfW;
      y = taskbarOffset;
      w = screenW - halfW;
      h = availH;
      snap = 'right';
    } else if (options?.position) {
      x = Math.max(20, Math.min(screenW - w - 20, options.position.x - 140));
      y = Math.max(20, Math.min(availH - h - 20, options.position.y - 40));
    }

    const newWindow: WindowInstance = {
      id: `win-zen-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      appId: 'zen',
      title: options?.tab?.title ? `Godly Browser — ${options.tab.title}` : 'Godly Browser',
      icon: meta.icon,
      customUrl: options?.customUrl || options?.tab?.url,
      initialTab: options?.tab,
      x,
      y,
      width: w,
      height: h,
      isMinimized: false,
      isMaximized: false,
      isSnapped: snap,
      zIndex: newZ,
    };

    setWindows((prev) => {
      let updated = prev;
      if (options?.snapRegion === 'left' && options.sourceWindowId) {
        const halfW = Math.floor(screenW / 2);
        updated = updated.map((wItem) =>
          wItem.id === options.sourceWindowId
            ? {
                ...wItem,
                isMaximized: false,
                isSnapped: 'right',
                prevBounds: wItem.prevBounds || { x: wItem.x, y: wItem.y, width: wItem.width, height: wItem.height },
                x: halfW,
                y: taskbarOffset,
                width: screenW - halfW,
                height: availH,
              }
            : wItem
        );
      } else if (options?.snapRegion === 'right' && options.sourceWindowId) {
        const halfW = Math.floor(screenW / 2);
        updated = updated.map((wItem) =>
          wItem.id === options.sourceWindowId
            ? {
                ...wItem,
                isMaximized: false,
                isSnapped: 'left',
                prevBounds: wItem.prevBounds || { x: wItem.x, y: wItem.y, width: wItem.width, height: wItem.height },
                x: 0,
                y: taskbarOffset,
                width: halfW,
                height: availH,
              }
            : wItem
        );
      }
      return [...updated, newWindow];
    });

    setActiveWindowId(newWindow.id);
    sound.playOpen();
    return newWindow.id;
  }, [highestZ, windows.length, settings.taskbarPosition]);

  const installApp = useCallback((app: InstalledApp) => {
    setInstalledApps((prev) => {
      if (prev.some((a) => a.id === app.id)) return prev;
      return [...prev, app];
    });
    addNotification('App Installed', `${app.name} is now available on your Desktop.`, 'success', app.icon);
    sound.playNotification();
  }, [addNotification]);

  const uninstallApp = useCallback((appId: string) => {
    setInstalledApps((prev) => prev.filter((a) => a.id !== appId));
    sound.playClick();
  }, []);

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => {
      const filtered = prev.filter((w) => w.id !== id);
      if (activeWindowId === id) {
        const remaining = filtered.filter((w) => !w.isMinimized);
        if (remaining.length > 0) {
          const top = remaining.reduce((max, w) => (w.zIndex > max.zIndex ? w : max), remaining[0]);
          setActiveWindowId(top.id);
        } else {
          setActiveWindowId(null);
        }
      }
      return filtered;
    });
    sound.playClick();
  }, [activeWindowId]);

  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))
    );
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
    sound.playMinimize();
  }, [activeWindowId]);

  const maximizeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        if (w.isMaximized) {
          // Restore
          const prevB = w.prevBounds || { x: 80, y: 40, width: 800, height: 500 };
          sound.playMaximize();
          return {
            ...w,
            isMaximized: false,
            x: prevB.x,
            y: prevB.y,
            width: prevB.width,
            height: prevB.height,
          };
        } else {
          // Maximize to full desktop minus taskbar
          sound.playMaximize();
          return {
            ...w,
            isMaximized: true,
            prevBounds: { x: w.x, y: w.y, width: w.width, height: w.height },
            x: 0,
            y: 0,
            width: window.innerWidth,
            height: window.innerHeight - 52, // 52px taskbar
          };
        }
      })
    );
    focusWindow(id);
  }, [focusWindow]);

  const updateWindowBounds = useCallback((id: string, bounds: Partial<Pick<WindowInstance, 'x' | 'y' | 'width' | 'height'>>) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        return {
          ...w,
          ...bounds,
          isMaximized: false, // moving or resizing un-maximizes
        };
      })
    );
  }, []);

  const minimizeAll = useCallback(() => {
    setWindows((prev) => prev.map((w) => ({ ...w, isMinimized: true })));
    setActiveWindowId(null);
    sound.playMinimize();
  }, []);

  const snapWindow = useCallback((id: string, region: SnapRegion) => {
    if (region === 'none') return;
    if (region === 'top') {
      maximizeWindow(id);
      setSnapPreview('none');
      return;
    }
    sound.playSnap();
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        const halfW = Math.floor(window.innerWidth / 2);
        const taskbarOffset = settings.taskbarPosition === 'top' ? 52 : 0;
        const h = window.innerHeight - 52;
        const x = region === 'left' ? 0 : halfW;
        const y = taskbarOffset;
        return {
          ...w,
          isMaximized: false,
          isSnapped: region,
          prevBounds: w.prevBounds || { x: w.x, y: w.y, width: w.width, height: w.height },
          x,
          y,
          width: region === 'left' ? halfW : window.innerWidth - halfW,
          height: h,
        };
      })
    );
    focusWindow(id);
    setSnapPreview('none');
  }, [maximizeWindow, focusWindow, settings.taskbarPosition]);

  // File System methods
  const createFile = useCallback((parentId: string | null, name: string, content: string = '', extension: string = 'txt', imageUrl?: string): FileItem => {
    const ext = extension || (name.includes('.') ? name.split('.').pop() || 'txt' : 'txt');
    const computedSize = imageUrl 
      ? `${Math.max(1, Math.round((imageUrl.length * 0.75) / 1024))} KB`
      : `${Math.max(1, Math.round(content.length / 1024 * 10) / 10)} KB`;
    const newItem: FileItem = {
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.includes('.') ? name : `${name}.${ext}`,
      parentId,
      type: 'file',
      extension: ext,
      size: computedSize,
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      content,
      imageUrl,
    };
    setFileSystem((prev) => [...prev, newItem]);
    sound.playClick();
    return newItem;
  }, []);

  const createFolder = useCallback((parentId: string | null, name: string): FileItem => {
    const newItem: FileItem = {
      id: `folder-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      parentId,
      type: 'folder',
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    setFileSystem((prev) => [...prev, newItem]);
    sound.playClick();
    return newItem;
  }, []);

  const deleteFileItem = useCallback((id: string) => {
    setFileSystem((prev) => prev.filter((item) => item.id !== id && item.parentId !== id));
    sound.playClick();
  }, []);

  const updateFileContent = useCallback((id: string, content: string) => {
    setFileSystem((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              content,
              size: `${Math.max(1, Math.round(content.length / 1024 * 10) / 10)} KB`,
              updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
            }
          : item
      )
    );
  }, []);

  const renameFileItem = useCallback((id: string, newName: string) => {
    setFileSystem((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name: newName } : item))
    );
    sound.playClick();
  }, []);

  return (
    <OSContext.Provider
      value={{
        windows,
        activeWindowId,
        openApp,
        openWebApp,
        openNewBrowserWindow,
        closeWindow,
        minimizeWindow,
        maximizeWindow,
        focusWindow,
        updateWindowBounds,
        minimizeAll,
        installedApps,
        installApp,
        uninstallApp,
        snapPreview,
        setSnapPreview,
        snapWindow,
        commandPaletteOpen,
        setCommandPaletteOpen,
        toggleCommandPalette,
        nowPlaying,
        setNowPlaying,
        togglePlayPauseNowPlaying,
        nextTrackNowPlaying,
        applyCloak,
        openAboutBlankCloak,
        panicCloak,
        startMenuOpen,
        setStartMenuOpen,
        quickSettingsOpen,
        setQuickSettingsOpen,
        calendarOpen,
        setCalendarOpen,
        notificationCenterOpen,
        setNotificationCenterOpen,
        contextMenu,
        openContextMenu,
        closeContextMenu,
        settings,
        updateSettings,
        setWallpaper,
        setAccentColor,
        toggleTheme,
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
        fileSystem,
        createFile,
        createFolder,
        deleteFileItem,
        updateFileContent,
        renameFileItem,
      }}
    >
      {children}
    </OSContext.Provider>
  );
};

export const useOS = () => {
  const ctx = useContext(OSContext);
  if (!ctx) throw new Error('useOS must be used within an OSProvider');
  return ctx;
};
