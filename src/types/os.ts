import React from 'react';

export type AppId =
  | 'app-store'
  | 'calculator'
  | 'extensions'
  | 'file-manager'
  | 'games'
  | 'notes'
  | 'settings'
  | 'spotify'
  | 'terminal'
  | 'web-app'
  | 'zen'
  | 'code-editor'
  | 'voice-memos'
  | 'screen-recorder'
  | 'theme-studio'
  | 'virtual-machine'
  | 'widgets'
  | 'emulator'
  | 'multiplayer'
  | 'eaglercraft';

export type AccentColor = 'violet' | 'gold' | 'cyan' | 'emerald' | 'rose' | 'amber' | 'electric' | 'obsidian';

export type SnapRegion =
  | 'none'
  | 'left'
  | 'right'
  | 'top'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'col-1-of-3'
  | 'col-2-of-3'
  | 'col-3-of-3'
  | 'zen-70'
  | 'zen-20'
  | 'zen-10'
  | 'split-70'
  | 'split-30';

export interface CloakPreset {
  id: string;
  name: string;
  title: string;
  icon: string;
  faviconUrl: string;
}

export interface InstalledApp {
  id: string;
  name: string;
  icon: string;
  category?: string;
  url?: string;
  appId?: AppId;
}

export interface AppConfig {
  id: AppId;
  name: string;
  icon: string;
  category: 'System' | 'Productivity' | 'Media' | 'Utilities' | 'Games';
  description: string;
  defaultWidth: number;
  defaultHeight: number;
  minWidth?: number;
  minHeight?: number;
  component: React.ComponentType<{ windowId: string; customUrl?: string }>;
  isPinned?: boolean;
}

export interface WindowTab {
  id: string;
  appId: AppId;
  title: string;
  icon: string;
  customUrl?: string;
}

export interface WindowInstance {
  id: string;
  appId: AppId;
  title: string;
  icon: string;
  customUrl?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isSnapped?: SnapRegion;
  prevBounds?: { x: number; y: number; width: number; height: number };
  zIndex: number;
  initialTab?: any;
  workspaceId?: string;
  isPip?: boolean;
  pipCorner?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  tabs?: WindowTab[];
  activeTabId?: string;
}

export interface Workspace {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export type LiveWallpaperType = 'none' | 'fluid' | 'matrix' | 'starfield' | 'visualizer';

export type SoundThemeType = 'cyberpunk' | 'sonoma' | 'win98' | 'silent' | 'custom';

export interface ThemePreset {
  id: string;
  name: string;
  category: 'Dark' | 'Light' | 'Material' | 'Special';
  description: string;
  mode: 'dark' | 'light';
  glassBlur: number;
  neonColor: string;
  radius: number;
  fontFamily: string;
  brightness: number;
  contrast: number;
  bgBase: string;
  bgSurface: string;
  bgOverlay: string;
  bgRaised: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentGlow: string;
  accentDim: string;
  accentBorder: string;
  accentText: string;
  glassWindow: string;
  glassWindowFocused?: string;
  glassPanel: string;
  glassCard: string;
  glassDock: string;
  windowHeaderBg: string;
  windowHeaderBorder: string;
  windowBorder: string;
  windowBorderFocused: string;
  windowShadow: string;
  windowShadowFocused: string;
  windowBodyBg: string;
  dockBorder: string;
  borderSubtle: string;
  borderDefault: string;
  borderStrong: string;
  borderBevel: string;
  wallpaperFilter?: string;
}

export type WidgetType = 'clock' | 'weather' | 'system' | 'notes' | 'media' | 'quote' | 'launcher';

export interface DesktopWidget {
  id: string;
  type: WidgetType;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isLocked: boolean;
  isVisible: boolean;
  scale?: number;
  opacity?: number;
  blur?: number;
  theme?: 'glass' | 'cyber' | 'obsidian' | 'gold' | 'neon';
  config?: Record<string, any>;
  data?: any;
}

export interface Wallpaper {
  id: string;
  name: string;
  fileName: string;
  path: string;
  category: 'Abstract' | 'Landscape' | 'Minimal' | 'Cyber' | 'Dark';
}

export interface FileItem {
  id: string;
  name: string;
  parentId: string | null;
  type: 'folder' | 'file';
  extension?: string;
  size?: string;
  updatedAt: string;
  content?: string;
  imageUrl?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  icon?: string;
  type?: 'info' | 'success' | 'warning' | 'alert';
}

export interface SystemSettings {
  theme: 'dark' | 'light';
  accentColor: AccentColor;
  wallpaper: string;
  wallpaperBlur: number;
  soundEnabled: boolean;
  volume: number;
  glassBlur: number; // in px
  animationsEnabled: boolean;
  taskbarPosition: 'bottom' | 'top';
  windowSnapping: boolean;
  particleBackground: boolean;
  mediaPillEnabled: boolean;
  activeCloak: string | null;
  wispUrl?: string;
  liveWallpaper?: LiveWallpaperType;
  activeWorkspaceId?: string;
  workspaces?: Workspace[];
  soundTheme?: SoundThemeType;
  themePreset?: ThemePreset;
  widgets?: DesktopWidget[];
  fpsOverlayEnabled?: boolean;
  customCursor?: string;
  username?: string;
}
