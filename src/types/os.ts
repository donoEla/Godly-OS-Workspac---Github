import React from 'react';

export type AppId =
  | 'app-store'
  | 'calculator'
  | 'file-manager'
  | 'games'
  | 'notes'
  | 'settings'
  | 'spotify'
  | 'terminal'
  | 'web-app'
  | 'zen';

export type AccentColor = 'violet' | 'gold' | 'cyan' | 'emerald' | 'rose' | 'amber' | 'electric' | 'obsidian';

export type SnapRegion = 'none' | 'left' | 'right' | 'top';

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
}
