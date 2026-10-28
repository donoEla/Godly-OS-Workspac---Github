import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  AppId,
  WindowInstance,
  WindowTab,
  SystemSettings,
  AccentColor,
  FileItem,
  NotificationItem,
  SnapRegion,
  InstalledApp,
  Workspace,
  DesktopWidget,
  WidgetType,
  ThemePreset,
} from '../types/os';
import { WALLPAPERS, INITIAL_FILESYSTEM, ACCENT_CONFIGS, CLOAK_PRESETS } from '../constants/assets';
import { sound } from '../utils/sound';
import { getAssetUrl } from '../utils/assetHelper';
import { applyCursorStyle } from '../constants/cursorPresets';

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

export const DEFAULT_WORKSPACES: Workspace[] = [
  { id: 'browsing', name: 'Browsing', icon: '🌐', color: '#3b82f6' },
  { id: 'gaming', name: 'Gaming', icon: '🎮', color: '#ec4899' },
  { id: 'dev', name: 'Dev/Terminal', icon: '💻', color: '#10b981' },
];

export const getDefaultWidgets = (): DesktopWidget[] => {
  const isBrowser = typeof window !== 'undefined';
  const screenWidth = isBrowser ? window.innerWidth : 1280;
  const rightX = Math.max(680, screenWidth - 320);

  return [
    {
      id: 'widget-clock',
      type: 'clock',
      title: 'Astronomical Chronometer',
      x: rightX,
      y: 28,
      width: 290,
      height: 154,
      isLocked: false,
      isVisible: true,
    },
    {
      id: 'widget-weather',
      type: 'weather',
      title: 'Global Weather Radar',
      x: rightX,
      y: 196,
      width: 290,
      height: 154,
      isLocked: false,
      isVisible: true,
    },
    {
      id: 'widget-system',
      type: 'system',
      title: 'Resource Telemetry HUD',
      x: rightX,
      y: 364,
      width: 290,
      height: 160,
      isLocked: false,
      isVisible: true,
    },
    {
      id: 'widget-notes',
      type: 'notes',
      title: 'Quick Scratchpad & Tasks',
      x: rightX,
      y: 538,
      width: 290,
      height: 190,
      isLocked: false,
      isVisible: false,
      data: {
        text: 'Godly OS — Redefining the browser operating system.',
        tasks: [
          { id: '1', text: 'Explore WebVM x86 Terminal', done: true },
          { id: '2', text: 'Configure custom glass theme', done: false }
        ]
      },
    },
    {
      id: 'widget-media',
      type: 'media',
      title: 'Aura Media Controller',
      x: rightX,
      y: 538,
      width: 290,
      height: 160,
      isLocked: false,
      isVisible: false,
    },
    {
      id: 'widget-quote',
      type: 'quote',
      title: 'Celestial Wisdom',
      x: rightX,
      y: 538,
      width: 290,
      height: 130,
      isLocked: false,
      isVisible: false,
      data: {
        category: 'stoic',
        quote: 'The soul becomes dyed with the color of its thoughts.',
        author: 'Marcus Aurelius',
      },
    },
    {
      id: 'widget-launcher',
      type: 'launcher',
      title: 'Quick App Dock',
      x: rightX,
      y: 680,
      width: 290,
      height: 110,
      isLocked: false,
      isVisible: false,
      data: {
        apps: ['zen', 'virtual-machine', 'code-editor', 'widgets', 'terminal'],
      },
    },
  ];
};

export const DEFAULT_WIDGETS: DesktopWidget[] = getDefaultWidgets();

export { BUILTIN_THEME_PRESETS } from '../constants/themePresets';
import { BUILTIN_THEME_PRESETS } from '../constants/themePresets';

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

  // Window Grouping & Tabs
  mergeWindows: (targetWindowId: string, sourceWindowId: string) => void;
  detachWindowTab: (windowId: string, tabId: string, clientPos?: { x: number; y: number }) => void;
  switchWindowTab: (windowId: string, tabId: string) => void;

  // Picture-in-Picture (PiP)
  toggleWindowPip: (windowId: string) => void;
  setPipCorner: (windowId: string, corner: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left') => void;

  // Workspaces (Spaces)
  workspaces: Workspace[];
  activeWorkspaceId: string;
  switchWorkspace: (workspaceId: string) => void;
  addWorkspace: (name: string, icon?: string, color?: string) => void;
  removeWorkspace: (workspaceId: string) => void;
  moveWindowToWorkspace: (windowId: string, workspaceId: string) => void;

  // Desktop Widgets
  widgets: DesktopWidget[];
  updateWidgetBounds: (id: string, bounds: Partial<Pick<DesktopWidget, 'x' | 'y' | 'width' | 'height'>>) => void;
  toggleWidgetLock: (id: string) => void;
  toggleWidgetVisibility: (id: string) => void;
  updateWidgetData: (id: string, data: any) => void;
  addWidget: (widget: Partial<DesktopWidget> & { type: WidgetType; title: string }) => void;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, updates: Partial<DesktopWidget>) => void;
  resetWidgetsToDefault: () => void;
  setAllWidgetsVisibility: (visible: boolean) => void;
  lockAllWidgets: (locked: boolean) => void;
  alignWidgets: (mode: 'sidebar' | 'top' | 'grid') => void;

  // Installed Apps & Desktop
  installedApps: InstalledApp[];
  installApp: (app: InstalledApp) => void;
  uninstallApp: (appId: string) => void;

  // Window Snapping
  snapPreview: SnapRegion;
  setSnapPreview: (snap: SnapRegion) => void;
  snapWindow: (id: string, region: SnapRegion) => void;

  // Command Palette
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  toggleCommandPalette: () => void;

  // Dynamic Island / Media Pill
  nowPlaying: NowPlayingState;
  setNowPlaying: React.Dispatch<React.SetStateAction<NowPlayingState>>;
  togglePlayPauseNowPlaying: () => void;
  nextTrackNowPlaying: () => void;

  // Stealth & Cloaking
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

  // System Settings & Themes
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  setWallpaper: (path: string) => void;
  setAccentColor: (color: AccentColor) => void;
  toggleTheme: () => void;
  applyThemePreset: (preset: ThemePreset) => void;

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
  glassBlur: 38,
  animationsEnabled: true,
  taskbarPosition: 'bottom',
  windowSnapping: true,
  particleBackground: true,
  mediaPillEnabled: true,
  activeCloak: null,
  liveWallpaper: 'none',
  soundTheme: 'cyberpunk',
  activeWorkspaceId: 'browsing',
  workspaces: DEFAULT_WORKSPACES,
  widgets: DEFAULT_WIDGETS,
  fpsOverlayEnabled: false,
  themePreset: BUILTIN_THEME_PRESETS[0],
  customCursor: 'default',
};

export const DEFAULT_INSTALLED_APPS: InstalledApp[] = [
  { id: 'zen-browser', name: 'Godly Browser', icon: getAssetUrl('assets/icons/zen.jpg'), category: 'Productivity', appId: 'zen' },
  { id: 'code-editor', name: 'Code Studio', icon: getAssetUrl('assets/icons/terminal.jpg'), category: 'Utilities', appId: 'code-editor' },
  { id: 'spotify-app', name: 'Spotify Cloud', icon: getAssetUrl('assets/icons/spotify.jpg'), category: 'Media', appId: 'spotify' },
  { id: 'octave-stream', name: 'Octave Streaming', icon: getAssetUrl('assets/icons/octave.png?v=3'), category: 'Media', url: 'https://octavestreaming.com/' },
  { id: 'movies', name: 'StreamFlix', icon: getAssetUrl('assets/icons/movies.png'), category: 'Media', appId: 'movies' },
  { id: 'godly-manga', name: 'Godly Manga', icon: getAssetUrl('assets/icons/manga.svg'), category: 'Media', appId: 'manga' },
  { id: 'stratus-music', name: 'Stratus Music', icon: getAssetUrl('assets/icons/music.svg'), category: 'Media', appId: 'music' },
  { id: 'games-arcade', name: 'Godly Arcade', icon: getAssetUrl('assets/icons/games.jpg'), category: 'Games', appId: 'games' },
  { id: 'terminal', name: 'Terminal', icon: getAssetUrl('assets/icons/terminal.jpg'), category: 'Utilities', appId: 'terminal' },
  { id: 'voice-memos', name: 'Voice Memos', icon: getAssetUrl('assets/icons/voice-memos.jpg'), category: 'Utilities', appId: 'voice-memos' },
  { id: 'notes-studio', name: 'Notes Studio', icon: getAssetUrl('assets/icons/notes.jpg'), category: 'Productivity', appId: 'notes' },
  { id: 'theme-studio', name: 'Theme Studio', icon: getAssetUrl('assets/icons/themes.png'), category: 'System', appId: 'theme-studio' },
  { id: 'calculator-pro', name: 'Calculator Pro', icon: getAssetUrl('assets/icons/calculator.jpg'), category: 'Utilities', appId: 'calculator' },
  { id: 'file-manager', name: 'File Manager', icon: getAssetUrl('assets/icons/file-manager.jpg'), category: 'System', appId: 'file-manager' },
  { id: 'app-store', name: 'Godly Store', icon: getAssetUrl('assets/icons/app-store.jpg'), category: 'System', appId: 'app-store' },
  { id: 'extensions-hub', name: 'Extensions Hub', icon: getAssetUrl('assets/icons/extensions.jpg'), category: 'System', appId: 'extensions' },
  { id: 'virtual-machine', name: 'Virtual Machine', icon: getAssetUrl('assets/icons/vm.png'), category: 'Utilities', appId: 'virtual-machine' },
  { id: 'widgets-studio', name: 'Widgets Studio', icon: getAssetUrl('assets/icons/widgets.jpeg'), category: 'Utilities', appId: 'widgets' },
  { id: 'web-emulator', name: 'Web Emulator Hub', icon: getAssetUrl('assets/icons/emulator.png'), category: 'Games', appId: 'emulator' },
  { id: 'p2p-multiplayer', name: 'Multiplayer Arena', icon: getAssetUrl('assets/icons/multiplayer.jpg'), category: 'Games', appId: 'multiplayer' },
  { id: 'eaglercraft-studio', name: 'Eaglercraft Studio', icon: getAssetUrl('assets/icons/eaglercraft.jpg'), category: 'Games', appId: 'eaglercraft' },
  { id: 'settings', name: 'Settings', icon: getAssetUrl('assets/icons/settings.jpg'), category: 'System', appId: 'settings' },
];

export const APP_META: Record<AppId, { title: string; icon: string; width: number; height: number }> = {
  'app-store': { title: 'Godly Store', icon: getAssetUrl('assets/icons/app-store.jpg'), width: 920, height: 640 },
  'calculator': { title: 'Calculator Pro', icon: getAssetUrl('assets/icons/calculator.jpg'), width: 440, height: 600 },
  'extensions': { title: 'Extensions Hub', icon: getAssetUrl('assets/icons/extensions.jpg'), width: 980, height: 640 },
  'file-manager': { title: 'File Manager', icon: getAssetUrl('assets/icons/file-manager.jpg'), width: 880, height: 580 },
  'games': { title: 'Godly Arcade', icon: getAssetUrl('assets/icons/games.jpg'), width: 920, height: 670 },
  'emulator': { title: 'Web Emulator Hub', icon: getAssetUrl('assets/icons/emulator.png'), width: 1040, height: 680 },
  'multiplayer': { title: 'P2P Multiplayer Arena', icon: getAssetUrl('assets/icons/multiplayer.jpg'), width: 920, height: 620 },
  'eaglercraft': { title: 'Eaglercraft Studio', icon: getAssetUrl('assets/icons/eaglercraft.jpg'), width: 1060, height: 700 },
  'manga': { title: 'Godly Manga & Anime Reader', icon: getAssetUrl('assets/icons/manga.svg'), width: 1040, height: 700 },
  'movies': { title: 'StreamFlix Cinema & TV', icon: getAssetUrl('assets/icons/movies.png'), width: 1060, height: 720 },
  'music': { title: 'Stratus Music Studio', icon: getAssetUrl('assets/icons/music.svg'), width: 940, height: 650 },
  'notes': { title: 'Notes Studio', icon: getAssetUrl('assets/icons/notes.jpg'), width: 880, height: 600 },
  'settings': { title: 'Settings', icon: getAssetUrl('assets/icons/settings.jpg'), width: 880, height: 640 },
  'spotify': { title: 'Spotify Cloud', icon: getAssetUrl('assets/icons/spotify.jpg'), width: 920, height: 640 },
  'terminal': { title: 'Terminal', icon: getAssetUrl('assets/icons/terminal.jpg'), width: 780, height: 520 },
  'web-app': { title: 'Web App', icon: getAssetUrl('assets/icons/settings.jpg'), width: 960, height: 660 },
  'zen': { title: 'Godly Browser', icon: getAssetUrl('assets/icons/zen.jpg'), width: 1080, height: 720 },
  'code-editor': { title: 'Code Studio & Shell', icon: getAssetUrl('assets/icons/terminal.jpg'), width: 1040, height: 680 },
  'voice-memos': { title: 'Voice Memos Studio', icon: getAssetUrl('assets/icons/voice-memos.jpg'), width: 560, height: 620 },
  'screen-recorder': { title: 'Screen Capture', icon: getAssetUrl('assets/icons/settings.jpg'), width: 480, height: 380 },
  'theme-studio': { title: 'Glassmorphism Theme Studio', icon: getAssetUrl('assets/icons/themes.png'), width: 840, height: 640 },
  'virtual-machine': { title: 'Virtual Machine (WebVM & CheerpX)', icon: getAssetUrl('assets/icons/vm.png'), width: 1040, height: 680 },
  'widgets': { title: 'Widgets Studio', icon: getAssetUrl('assets/icons/widgets.jpeg'), width: 880, height: 620 },
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

  // Workspaces (Spaces) state
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
    try {
      const saved = localStorage.getItem('godly_workspaces');
      return saved ? JSON.parse(saved) : DEFAULT_WORKSPACES;
    } catch {
      return DEFAULT_WORKSPACES;
    }
  });

  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(() => {
    try {
      return localStorage.getItem('godly_active_workspace') || 'browsing';
    } catch {
      return 'browsing';
    }
  });

  // Desktop Widgets state with versioned layout migration to avoid icon overlap
  const [widgets, setWidgets] = useState<DesktopWidget[]>(() => {
    try {
      const v = localStorage.getItem('godly_widgets_v5');
      const saved = localStorage.getItem('godly_desktop_widgets');
      if (saved && v) {
        const parsed: DesktopWidget[] = JSON.parse(saved);
        const defaults = getDefaultWidgets();
        defaults.forEach((dw) => {
          if (!parsed.some((pw) => pw.id === dw.id)) {
            parsed.push(dw);
          }
        });
        return parsed;
      }
      localStorage.setItem('godly_widgets_v5', 'true');
      return getDefaultWidgets();
    } catch {
      return DEFAULT_WIDGETS;
    }
  });

  // Windows state
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [highestZ, setHighestZ] = useState<number>(100);

  // Installed Apps State
  const [installedApps, setInstalledApps] = useState<InstalledApp[]>(() => {
    try {
      const version = localStorage.getItem('godly_apps_version');
      const saved = localStorage.getItem('godly_installed_apps');

      let apps: InstalledApp[] = DEFAULT_INSTALLED_APPS;
      if (saved && version === '4.5.6') {
        apps = JSON.parse(saved);
      }

      // Always update known apps with latest icons from DEFAULT_INSTALLED_APPS
      const updated = apps.map((app) => {
        const defaultApp = DEFAULT_INSTALLED_APPS.find(
          (d) => d.id === app.id || (d.appId && d.appId === app.appId) || d.name === app.name
        );
        if (defaultApp) {
          return {
            ...app,
            icon: defaultApp.icon,
            name: defaultApp.name,
          };
        }
        return app;
      });

      // Ensure newly added default apps exist
      DEFAULT_INSTALLED_APPS.forEach((d) => {
        if (!updated.some((u) => u.id === d.id || (u.appId && u.appId === d.appId))) {
          updated.push(d);
        }
      });

      localStorage.setItem('godly_apps_version', '4.5.6');
      localStorage.setItem('godly_installed_apps', JSON.stringify(updated));
      return updated;
    } catch {
      return DEFAULT_INSTALLED_APPS;
    }
  });

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
      title: 'Godly OS v4.2 Celestial Edition',
      message: 'Spaces, Aero Snap Grids, Sound Themes, and Glassmorphism Studio active.',
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

  // Sync settings & CSS variables to DOM
  useEffect(() => {
    try {
      localStorage.setItem('godly_settings', JSON.stringify(settings));
    } catch {}

    const root = document.documentElement;
    const preset = settings.themePreset || BUILTIN_THEME_PRESETS[0];

    // Theme identification & mode on root DOM
    root.setAttribute('data-theme', preset.id);
    root.setAttribute('data-theme-mode', preset.mode || settings.theme);

    if (preset.mode === 'light' || settings.theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }

    // Palette tokens
    if (preset.bgBase) root.style.setProperty('--bg-base', preset.bgBase);
    if (preset.bgSurface) root.style.setProperty('--bg-surface', preset.bgSurface);
    if (preset.bgOverlay) root.style.setProperty('--bg-overlay', preset.bgOverlay);
    if (preset.bgRaised) root.style.setProperty('--bg-raised', preset.bgRaised);

    if (preset.textPrimary) root.style.setProperty('--text-primary', preset.textPrimary);
    if (preset.textSecondary) root.style.setProperty('--text-secondary', preset.textSecondary);
    if (preset.textMuted) root.style.setProperty('--text-muted', preset.textMuted);

    // Accent & Highlights
    const accentVal = preset.accent || (ACCENT_CONFIGS[settings.accentColor]?.hex ?? '#8b5cf6');
    root.style.setProperty('--accent', accentVal);
    root.style.setProperty('--accent-color', accentVal);
    root.style.setProperty('--accent-glow', preset.accentGlow || `${accentVal}55`);
    root.style.setProperty('--accent-dim', preset.accentDim || `${accentVal}1f`);
    root.style.setProperty('--accent-subtle', preset.accentDim || `${accentVal}1f`);
    root.style.setProperty('--accent-border', preset.accentBorder || `${accentVal}66`);
    root.style.setProperty('--accent-soft', preset.accentDim || `${accentVal}14`);
    root.style.setProperty('--accent-text', preset.accentText || accentVal);

    // Glass & Surfaces
    if (preset.glassWindow) {
      root.style.setProperty('--glass-window', preset.glassWindow);
      root.style.setProperty('--window-glass', preset.glassWindow);
      root.style.setProperty('--window-bg', preset.glassWindow);
    }
    if (preset.glassWindowFocused) {
      root.style.setProperty('--glass-window-focused', preset.glassWindowFocused);
      root.style.setProperty('--window-bg-focused', preset.glassWindowFocused);
    } else if (preset.glassWindow) {
      root.style.setProperty('--glass-window-focused', preset.glassWindow);
      root.style.setProperty('--window-bg-focused', preset.glassWindow);
    }
    if (preset.glassPanel) root.style.setProperty('--glass-panel', preset.glassPanel);
    if (preset.glassCard) root.style.setProperty('--glass-card', preset.glassCard);
    if (preset.glassDock) {
      root.style.setProperty('--glass-dock', preset.glassDock);
      root.style.setProperty('--dock-glass', preset.glassDock);
    }

    // Windows & Dock Tokens
    if (preset.windowHeaderBg) root.style.setProperty('--window-header-bg', preset.windowHeaderBg);
    if (preset.windowHeaderBorder) root.style.setProperty('--window-header-border', preset.windowHeaderBorder);
    if (preset.windowBorder) {
      root.style.setProperty('--window-border', preset.windowBorder);
      root.style.setProperty('--dock-border', preset.dockBorder || preset.windowBorder);
    }
    if (preset.windowBorderFocused) root.style.setProperty('--window-border-focused', preset.windowBorderFocused);
    if (preset.windowShadow) root.style.setProperty('--window-shadow', preset.windowShadow);
    if (preset.windowShadowFocused) root.style.setProperty('--window-shadow-focused', preset.windowShadowFocused);
    if (preset.windowBodyBg) root.style.setProperty('--window-body-bg', preset.windowBodyBg);

    // Borders & Bevels
    if (preset.borderSubtle) root.style.setProperty('--border-subtle', preset.borderSubtle);
    if (preset.borderDefault) root.style.setProperty('--border-default', preset.borderDefault);
    if (preset.borderStrong) root.style.setProperty('--border-strong', preset.borderStrong);
    if (preset.borderBevel) root.style.setProperty('--border-bevel', preset.borderBevel);

    // Layout & Geometry
    root.style.setProperty('--glass-blur', `${preset.glassBlur ?? settings.glassBlur}px`);
    root.style.setProperty('--border-color', preset.neonColor || accentVal);
    root.style.setProperty('--radius', `${preset.radius ?? 18}px`);
    root.style.setProperty('--font-family', preset.fontFamily || 'Inter');
    root.style.setProperty('--ui-brightness', `${preset.brightness ?? 100}%`);
    root.style.setProperty('--ui-contrast', `${preset.contrast ?? 100}%`);
    root.style.setProperty('--wallpaper-filter', preset.wallpaperFilter || 'none');

    sound.setEnabled(settings.soundEnabled);
    sound.setVolume(settings.volume);
    if (settings.soundTheme) {
      sound.setTheme(settings.soundTheme);
    }

    // Hardware-accelerated custom cursor preset
    applyCursorStyle(settings.customCursor || 'default');
  }, [settings]);

  // Sync workspaces, widgets, filesystem to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('godly_workspaces', JSON.stringify(workspaces));
    } catch {}
  }, [workspaces]);

  useEffect(() => {
    try {
      localStorage.setItem('godly_active_workspace', activeWorkspaceId);
    } catch {}
  }, [activeWorkspaceId]);

  useEffect(() => {
    try {
      localStorage.setItem('godly_desktop_widgets', JSON.stringify(widgets));
    } catch {}
  }, [widgets]);

  useEffect(() => {
    try {
      localStorage.setItem('godly_fs', JSON.stringify(fileSystem));
    } catch {}
  }, [fileSystem]);

  // Startup chime
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

  const applyThemePreset = useCallback((preset: ThemePreset) => {
    updateSettings({
      themePreset: preset,
      theme: preset.mode,
      glassBlur: preset.glassBlur,
    });
    sound.playEvent('notification');
  }, [updateSettings]);

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

  // Stealth & Cloak
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

  // Workspaces logic
  const switchWorkspace = useCallback((workspaceId: string) => {
    if (workspaceId === activeWorkspaceId) return;
    setActiveWorkspaceId(workspaceId);
    sound.playEvent('window-drag');
    // Set active window to top window in that workspace
    const workspaceWindows = windows.filter((w) => (w.workspaceId || 'browsing') === workspaceId && !w.isMinimized);
    if (workspaceWindows.length > 0) {
      const topWin = workspaceWindows.reduce((max, w) => (w.zIndex > max.zIndex ? w : max), workspaceWindows[0]);
      setActiveWindowId(topWin.id);
    } else {
      setActiveWindowId(null);
    }
  }, [activeWorkspaceId, windows]);

  const addWorkspace = useCallback((name: string, icon: string = '🚀', color: string = '#8b5cf6') => {
    const newWs: Workspace = {
      id: `ws-${Date.now()}`,
      name: name.trim() || 'New Space',
      icon,
      color,
    };
    setWorkspaces((prev) => [...prev, newWs]);
    sound.playClick();
  }, []);

  const removeWorkspace = useCallback((workspaceId: string) => {
    if (workspaces.length <= 1) return; // Must have at least 1 workspace
    setWorkspaces((prev) => prev.filter((w) => w.id !== workspaceId));
    // Move any windows in that workspace to first remaining workspace
    const remaining = workspaces.filter((w) => w.id !== workspaceId);
    const fallbackId = remaining[0].id;
    setWindows((prev) => prev.map((w) => (w.workspaceId === workspaceId ? { ...w, workspaceId: fallbackId } : w)));
    if (activeWorkspaceId === workspaceId) {
      switchWorkspace(fallbackId);
    }
  }, [workspaces, activeWorkspaceId, switchWorkspace]);

  const moveWindowToWorkspace = useCallback((windowId: string, workspaceId: string) => {
    setWindows((prev) => prev.map((w) => (w.id === windowId ? { ...w, workspaceId } : w)));
    sound.playClick();
  }, []);

  // Keyboard shortcut: Ctrl + Alt + Left / Right for Workspaces
  useEffect(() => {
    const handleWorkspaceKeys = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.altKey) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const currentIndex = workspaces.findIndex((w) => w.id === activeWorkspaceId);
          if (currentIndex !== -1) {
            let nextIndex = e.key === 'ArrowRight' ? currentIndex + 1 : currentIndex - 1;
            if (nextIndex >= workspaces.length) nextIndex = 0;
            if (nextIndex < 0) nextIndex = workspaces.length - 1;
            switchWorkspace(workspaces[nextIndex].id);
          }
        }
      }
    };
    window.addEventListener('keydown', handleWorkspaceKeys);
    return () => window.removeEventListener('keydown', handleWorkspaceKeys);
  }, [workspaces, activeWorkspaceId, switchWorkspace]);

  // Global Keybindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F3: Toggle FPS Counter HUD
      if (e.key === 'F3') {
        e.preventDefault();
        setSettings((prev) => ({ ...prev, fpsOverlayEnabled: !prev.fpsOverlayEnabled }));
        sound.playClick();
        return;
      }
      // Global Spotlight Command Palette: Ctrl + K, Cmd + K, Cmd + Space, or Ctrl + Space
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'k' || e.code === 'Space')) {
        e.preventDefault();
        toggleCommandPalette();
        return;
      }

      // FancyZones Keyboard-Driven Window Tiling (Win/Meta/Alt + Arrow Keys or Ctrl+Alt+1-8)
      if (activeWindowId) {
        if ((e.metaKey || e.altKey) && !e.ctrlKey) {
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            snapWindow(activeWindowId, e.shiftKey ? 'split-70' : 'left');
            return;
          }
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            snapWindow(activeWindowId, e.shiftKey ? 'split-30' : 'right');
            return;
          }
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            maximizeWindow(activeWindowId);
            return;
          }
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            minimizeWindow(activeWindowId);
            return;
          }
        }

        // Quick Layout Number Presets (Ctrl + Alt + [1-6])
        if (e.ctrlKey && e.altKey) {
          if (e.key === '1') { e.preventDefault(); snapWindow(activeWindowId, 'left'); return; }
          if (e.key === '2') { e.preventDefault(); snapWindow(activeWindowId, 'right'); return; }
          if (e.key === '3') { e.preventDefault(); snapWindow(activeWindowId, 'split-70'); return; }
          if (e.key === '4') { e.preventDefault(); snapWindow(activeWindowId, 'split-30'); return; }
          if (e.key === '5') { e.preventDefault(); snapWindow(activeWindowId, 'col-1-of-3'); return; }
          if (e.key === '6') { e.preventDefault(); snapWindow(activeWindowId, 'top-left'); return; }
        }
      }
      // Panic Key: Backquote / Tilde (~)
      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        panicCloak();
      }
      // Escape -> close flyouts
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

  // Window Focus
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

  // Open App
  const openApp = useCallback((appId: AppId, customTitle?: string, customUrl?: string, customIcon?: string) => {
    setStartMenuOpen(false);

    // If already exists in this workspace, focus
    const existing = windows.find((w) =>
      (customUrl ? w.customUrl === customUrl : w.appId === appId) &&
      (w.workspaceId === activeWorkspaceId || !w.workspaceId)
    );
    if (existing) {
      if (existing.isMinimized) {
        setWindows((prev) => prev.map((w) => (w.id === existing.id ? { ...w, isMinimized: false } : w)));
      }
      focusWindow(existing.id);
      sound.playClick();
      return;
    }

    const meta = APP_META[appId] || APP_META['web-app'];
    const newZ = highestZ + 1;
    setHighestZ(newZ);

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const w = Math.min(meta.width, screenW - 40);
    const h = Math.min(meta.height, screenH - 100);

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
      workspaceId: activeWorkspaceId,
    };

    setWindows((prev) => [...prev, newWindow]);
    setActiveWindowId(newWindow.id);
    sound.playOpen();
  }, [windows, highestZ, focusWindow, activeWorkspaceId]);

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
      workspaceId: activeWorkspaceId,
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
  }, [highestZ, windows.length, settings.taskbarPosition, activeWorkspaceId]);

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
        const remaining = filtered.filter((w) => !w.isMinimized && (w.workspaceId || 'browsing') === activeWorkspaceId);
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
  }, [activeWindowId, activeWorkspaceId]);

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
          const prevB = w.prevBounds || { x: 80, y: 40, width: 800, height: 500 };
          sound.playMaximize();
          return {
            ...w,
            isMaximized: false,
            isSnapped: 'none',
            x: prevB.x,
            y: prevB.y,
            width: prevB.width,
            height: prevB.height,
          };
        } else {
          sound.playMaximize();
          return {
            ...w,
            isMaximized: true,
            isSnapped: 'none',
            prevBounds: { x: w.x, y: w.y, width: w.width, height: w.height },
            x: 0,
            y: settings.taskbarPosition === 'top' ? 52 : 0,
            width: window.innerWidth,
            height: window.innerHeight - 52,
          };
        }
      })
    );
    focusWindow(id);
  }, [focusWindow, settings.taskbarPosition]);

  const updateWindowBounds = useCallback((id: string, bounds: Partial<Pick<WindowInstance, 'x' | 'y' | 'width' | 'height'>>) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        return {
          ...w,
          ...bounds,
          isMaximized: false,
          isSnapped: 'none',
        };
      })
    );
  }, []);

  const minimizeAll = useCallback(() => {
    setWindows((prev) => prev.map((w) => ({ ...w, isMinimized: true })));
    setActiveWindowId(null);
    sound.playMinimize();
  }, []);

  // Window Grouping & Tabs
  const mergeWindows = useCallback((targetWindowId: string, sourceWindowId: string) => {
    if (targetWindowId === sourceWindowId) return;

    setWindows((prev) => {
      const targetWin = prev.find((w) => w.id === targetWindowId);
      const sourceWin = prev.find((w) => w.id === sourceWindowId);
      if (!targetWin || !sourceWin) return prev;

      // Collect tabs
      const targetTabs: WindowTab[] = targetWin.tabs && targetWin.tabs.length > 0
        ? [...targetWin.tabs]
        : [{
            id: targetWin.id,
            appId: targetWin.appId,
            title: targetWin.title,
            icon: targetWin.icon,
            customUrl: targetWin.customUrl,
          }];

      const sourceTabs: WindowTab[] = sourceWin.tabs && sourceWin.tabs.length > 0
        ? [...sourceWin.tabs]
        : [{
            id: sourceWin.id,
            appId: sourceWin.appId,
            title: sourceWin.title,
            icon: sourceWin.icon,
            customUrl: sourceWin.customUrl,
          }];

      const mergedTabs = [...targetTabs, ...sourceTabs];

      const updatedTarget: WindowInstance = {
        ...targetWin,
        tabs: mergedTabs,
        activeTabId: sourceTabs[0].id,
        title: sourceTabs[0].title,
        icon: sourceTabs[0].icon,
        appId: sourceTabs[0].appId,
        customUrl: sourceTabs[0].customUrl,
      };

      return prev.filter((w) => w.id !== sourceWindowId).map((w) => (w.id === targetWindowId ? updatedTarget : w));
    });

    sound.playEvent('window-open');
  }, []);

  const detachWindowTab = useCallback((windowId: string, tabId: string, clientPos?: { x: number; y: number }) => {
    setWindows((prev) => {
      const win = prev.find((w) => w.id === windowId);
      if (!win || !win.tabs || win.tabs.length <= 1) return prev;

      const tabToDetach = win.tabs.find((t) => t.id === tabId);
      if (!tabToDetach) return prev;

      const remainingTabs = win.tabs.filter((t) => t.id !== tabId);
      const newActive = remainingTabs[0];

      const updatedParent: WindowInstance = {
        ...win,
        tabs: remainingTabs.length > 1 ? remainingTabs : undefined,
        activeTabId: newActive.id,
        title: newActive.title,
        icon: newActive.icon,
        appId: newActive.appId,
        customUrl: newActive.customUrl,
      };

      const posX = clientPos ? Math.max(20, clientPos.x - 180) : win.x + 40;
      const posY = clientPos ? Math.max(20, clientPos.y - 30) : win.y + 40;

      const detachedWin: WindowInstance = {
        id: `win-${tabToDetach.appId}-${Date.now()}`,
        appId: tabToDetach.appId,
        title: tabToDetach.title,
        icon: tabToDetach.icon,
        customUrl: tabToDetach.customUrl,
        x: posX,
        y: posY,
        width: Math.max(480, win.width - 60),
        height: Math.max(360, win.height - 60),
        isMinimized: false,
        isMaximized: false,
        zIndex: highestZ + 2,
        workspaceId: win.workspaceId || activeWorkspaceId,
      };

      return [...prev.map((w) => (w.id === windowId ? updatedParent : w)), detachedWin];
    });

    sound.playOpen();
  }, [highestZ, activeWorkspaceId]);

  const switchWindowTab = useCallback((windowId: string, tabId: string) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== windowId || !w.tabs) return w;
        const tab = w.tabs.find((t) => t.id === tabId);
        if (!tab) return w;
        return {
          ...w,
          activeTabId: tab.id,
          title: tab.title,
          icon: tab.icon,
          appId: tab.appId,
          customUrl: tab.customUrl,
        };
      })
    );
    sound.playClick();
  }, []);

  // Picture-in-Picture (PiP)
  const toggleWindowPip = useCallback((windowId: string) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== windowId) return w;
        if (w.isPip) {
          // Restore from PiP
          sound.playMaximize();
          const prevB = w.prevBounds || { x: 80, y: 60, width: 840, height: 560 };
          return {
            ...w,
            isPip: false,
            x: prevB.x,
            y: prevB.y,
            width: prevB.width,
            height: prevB.height,
          };
        } else {
          // Enter PiP
          sound.playMinimize();
          const screenW = window.innerWidth;
          const screenH = window.innerHeight;
          const corner = w.pipCorner || 'bottom-right';
          const taskbarH = 52;
          let px = screenW - 340;
          let py = screenH - 200 - taskbarH;
          if (corner === 'bottom-left') { px = 20; py = screenH - 200 - taskbarH; }
          else if (corner === 'top-left') { px = 20; py = 20; }
          else if (corner === 'top-right') { px = screenW - 340; py = 20; }

          return {
            ...w,
            isPip: true,
            pipCorner: corner,
            prevBounds: { x: w.x, y: w.y, width: w.width, height: w.height },
            x: px,
            y: py,
            width: 320,
            height: 180,
            isMaximized: false,
            isMinimized: false,
            zIndex: 9999, // Always on top
          };
        }
      })
    );
  }, []);

  const setPipCorner = useCallback((windowId: string, corner: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left') => {
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const taskbarH = 52;
    let px = screenW - 340;
    let py = screenH - 200 - taskbarH;
    if (corner === 'bottom-left') { px = 20; py = screenH - 200 - taskbarH; }
    else if (corner === 'top-left') { px = 20; py = 20; }
    else if (corner === 'top-right') { px = screenW - 340; py = 20; }

    setWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, pipCorner: corner, x: px, y: py } : w))
    );
    sound.playSnap();
  }, []);

  // Multi-Tile Aero Snapping (All 15 Regions)
  const snapWindow = useCallback((id: string, region: SnapRegion) => {
    if (region === 'none') return;
    if (region === 'top') {
      maximizeWindow(id);
      setSnapPreview('none');
      return;
    }
    sound.playSnap();

    const screenW = window.innerWidth;
    const isTopTaskbar = settings.taskbarPosition === 'top';
    const topOffset = isTopTaskbar ? 52 : 0;
    const availH = window.innerHeight - 52;
    const halfW = Math.floor(screenW / 2);
    const halfH = Math.floor(availH / 2);

    let x = 0;
    let y = topOffset;
    let width = screenW;
    let height = availH;

    switch (region) {
      case 'left':
        x = 0; y = topOffset; width = halfW; height = availH; break;
      case 'right':
        x = halfW; y = topOffset; width = screenW - halfW; height = availH; break;

      // 2x2 Quad Grid (Corners)
      case 'top-left':
        x = 0; y = topOffset; width = halfW; height = halfH; break;
      case 'top-right':
        x = halfW; y = topOffset; width = screenW - halfW; height = halfH; break;
      case 'bottom-left':
        x = 0; y = topOffset + halfH; width = halfW; height = availH - halfH; break;
      case 'bottom-right':
        x = halfW; y = topOffset + halfH; width = screenW - halfW; height = availH - halfH; break;

      // 3-Column Equal Split
      case 'col-1-of-3':
        x = 0; y = topOffset; width = Math.floor(screenW / 3); height = availH; break;
      case 'col-2-of-3':
        x = Math.floor(screenW / 3); y = topOffset; width = Math.floor(screenW / 3); height = availH; break;
      case 'col-3-of-3':
        x = Math.floor(screenW * 2 / 3); y = topOffset; width = screenW - Math.floor(screenW * 2 / 3); height = availH; break;

      // Zen 70/20/10 Split
      case 'zen-70':
        x = 0; y = topOffset; width = Math.floor(screenW * 0.70); height = availH; break;
      case 'zen-20':
        x = Math.floor(screenW * 0.70); y = topOffset; width = Math.floor(screenW * 0.20); height = availH; break;
      case 'zen-10':
        x = Math.floor(screenW * 0.90); y = topOffset; width = screenW - Math.floor(screenW * 0.90); height = availH; break;

      // 70/30 Code-Browser Split
      case 'split-70':
        x = 0; y = topOffset; width = Math.floor(screenW * 0.70); height = availH; break;
      case 'split-30':
        x = Math.floor(screenW * 0.70); y = topOffset; width = screenW - Math.floor(screenW * 0.70); height = availH; break;
    }

    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        return {
          ...w,
          isMaximized: false,
          isSnapped: region,
          prevBounds: w.prevBounds || { x: w.x, y: w.y, width: w.width, height: w.height },
          x,
          y,
          width,
          height,
        };
      })
    );
    focusWindow(id);
    setSnapPreview('none');
  }, [maximizeWindow, focusWindow, settings.taskbarPosition]);

  // Desktop Widgets Actions
  const updateWidgetBounds = useCallback((id: string, bounds: Partial<Pick<DesktopWidget, 'x' | 'y' | 'width' | 'height'>>) => {
    setWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, ...bounds } : w)));
  }, []);

  const toggleWidgetLock = useCallback((id: string) => {
    setWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, isLocked: !w.isLocked } : w)));
    sound.playClick();
  }, []);

  const toggleWidgetVisibility = useCallback((id: string) => {
    setWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, isVisible: !w.isVisible } : w)));
    sound.playClick();
  }, []);

  const updateWidgetData = useCallback((id: string, data: any) => {
    setWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, data: { ...w.data, ...data } } : w)));
  }, []);

  const addWidget = useCallback((widgetConfig: Partial<DesktopWidget> & { type: WidgetType; title: string }) => {
    const isBrowser = typeof window !== 'undefined';
    const screenWidth = isBrowser ? window.innerWidth : 1280;
    const defaultX = Math.max(680, screenWidth - 320);

    const newWidget: DesktopWidget = {
      id: `widget-${widgetConfig.type}-${Date.now().toString(36)}`,
      type: widgetConfig.type,
      title: widgetConfig.title,
      x: widgetConfig.x ?? defaultX,
      y: widgetConfig.y ?? 100,
      width: widgetConfig.width ?? 290,
      height: widgetConfig.height ?? 160,
      isLocked: false,
      isVisible: true,
      scale: widgetConfig.scale ?? 1,
      opacity: widgetConfig.opacity ?? 1,
      blur: widgetConfig.blur ?? 28,
      theme: widgetConfig.theme ?? 'glass',
      config: widgetConfig.config ?? {},
      data: widgetConfig.data ?? {},
    };

    setWidgets((prev) => [...prev, newWidget]);
    sound.playClick();
  }, []);

  const removeWidget = useCallback((id: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
    sound.playClick();
  }, []);

  const updateWidget = useCallback((id: string, updates: Partial<DesktopWidget>) => {
    setWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)));
  }, []);

  const resetWidgetsToDefault = useCallback(() => {
    setWidgets(getDefaultWidgets());
    sound.playSnap();
  }, []);

  const setAllWidgetsVisibility = useCallback((visible: boolean) => {
    setWidgets((prev) => prev.map((w) => ({ ...w, isVisible: visible })));
    sound.playClick();
  }, []);

  const lockAllWidgets = useCallback((locked: boolean) => {
    setWidgets((prev) => prev.map((w) => ({ ...w, isLocked: locked })));
    sound.playClick();
  }, []);

  const alignWidgets = useCallback((mode: 'sidebar' | 'top' | 'grid') => {
    const isBrowser = typeof window !== 'undefined';
    const screenW = isBrowser ? window.innerWidth : 1280;

    setWidgets((prev) => {
      let curX = 24;
      let curY = 28;
      const rightX = Math.max(680, screenW - 320);

      return prev.map((w) => {
        if (!w.isVisible) return w;

        if (mode === 'sidebar') {
          const res = { ...w, x: rightX, y: curY, width: 290 };
          curY += w.height + 16;
          return res;
        } else if (mode === 'top') {
          const res = { ...w, x: curX, y: 24 };
          curX += w.width + 16;
          return res;
        } else {
          const res = { ...w, x: curX, y: curY };
          curX += w.width + 16;
          if (curX + w.width > screenW - 40) {
            curX = 24;
            curY += 180;
          }
          return res;
        }
      });
    });
    sound.playSnap();
  }, []);

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
        mergeWindows,
        detachWindowTab,
        switchWindowTab,
        toggleWindowPip,
        setPipCorner,
        workspaces,
        activeWorkspaceId,
        switchWorkspace,
        addWorkspace,
        removeWorkspace,
        moveWindowToWorkspace,
        widgets,
        updateWidgetBounds,
        toggleWidgetLock,
        toggleWidgetVisibility,
        updateWidgetData,
        addWidget,
        removeWidget,
        updateWidget,
        resetWidgetsToDefault,
        setAllWidgetsVisibility,
        lockAllWidgets,
        alignWidgets,
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
        applyThemePreset,
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
