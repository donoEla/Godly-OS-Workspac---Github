import React, { useState, useEffect, useRef } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { useOS } from '../../context/OSContext';
import { DesktopIcon } from './DesktopIcon';
import { DesktopContextMenu } from './DesktopContextMenu';
import { ParticleCanvas } from './ParticleCanvas';
import { LiveWallpaperCanvas } from './LiveWallpaperCanvas';
import { DesktopWidgetsLayer } from './DesktopWidgetsLayer';
import { getAssetUrl } from '../../utils/assetHelper';
import { sound } from '../../utils/sound';

const GRID_COL_WIDTH = 96;
const GRID_ROW_HEIGHT = 104;
const PADDING_X = 24;
const PADDING_Y = 24;
const POSITIONS_STORAGE_KEY = 'godly_desktop_icon_positions';

interface GridPos {
  col: number;
  row: number;
}

export const Desktop: React.FC = () => {
  const { 
    settings, 
    installedApps,
    openApp,
    openWebApp,
    openContextMenu, 
    closeContextMenu, 
    setStartMenuOpen, 
    setQuickSettingsOpen, 
    setCalendarOpen, 
    setNotificationCenterOpen 
  } = useOS();

  const [selectedIconId, setSelectedIconId] = useState<string | null>(null);
  const [draggingAppId, setDraggingAppId] = useState<string | null>(null);
  const dragDistanceRef = useRef(0);

  const getMaxRows = () => {
    if (typeof window === 'undefined') return 6;
    return Math.max(1, Math.floor((window.innerHeight - 120) / GRID_ROW_HEIGHT));
  };

  const [iconPositions, setIconPositions] = useState<Record<string, GridPos>>(() => {
    try {
      const saved = localStorage.getItem(POSITIONS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  // Calculate default grid position if not explicitly placed
  const getAppPosition = (appId: string, index: number): GridPos => {
    if (iconPositions[appId]) {
      return iconPositions[appId];
    }
    const maxRows = getMaxRows();
    const col = Math.floor(index / maxRows);
    const row = index % maxRows;
    return { col, row };
  };

  // Drag End handler with grid snapping
  const handleDragEnd = (appId: string, info: PanInfo, currentPos: GridPos) => {
    setDraggingAppId(null);
    const moved = Math.sqrt(info.offset.x * info.offset.x + info.offset.y * info.offset.y);
    dragDistanceRef.current = moved;

    // If practically didn't move, consider it a click rather than a drag
    if (moved < 8) {
      return;
    }

    const startX = PADDING_X + currentPos.col * GRID_COL_WIDTH;
    const startY = PADDING_Y + currentPos.row * GRID_ROW_HEIGHT;
    const finalX = startX + info.offset.x;
    const finalY = startY + info.offset.y;

    const maxCols = Math.max(0, Math.floor((window.innerWidth - 120) / GRID_COL_WIDTH));
    const maxRows = Math.max(0, Math.floor((window.innerHeight - 140) / GRID_ROW_HEIGHT));

    const newCol = Math.max(0, Math.min(maxCols, Math.round((finalX - PADDING_X) / GRID_COL_WIDTH)));
    const newRow = Math.max(0, Math.min(maxRows, Math.round((finalY - PADDING_Y) / GRID_ROW_HEIGHT)));

    sound.playSnap();

    setIconPositions((prev) => {
      const updated = { ...prev, [appId]: { col: newCol, row: newRow } };
      try {
        localStorage.setItem(POSITIONS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Reset desktop grid listener
  useEffect(() => {
    const handleReset = () => {
      localStorage.removeItem(POSITIONS_STORAGE_KEY);
      setIconPositions({});
      sound.playSnap();
    };
    window.addEventListener('godly-reset-desktop-grid', handleReset);
    return () => window.removeEventListener('godly-reset-desktop-grid', handleReset);
  }, []);

  const handleDesktopClick = () => {
    setSelectedIconId(null);
    closeContextMenu();
    setStartMenuOpen(false);
    setQuickSettingsOpen(false);
    setCalendarOpen(false);
    setNotificationCenterOpen(false);
  };

  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    openContextMenu(e, 'desktop');
  };

  const [effectiveWallpaperUrl, setEffectiveWallpaperUrl] = useState<string>(() => getAssetUrl(settings.wallpaper));

  useEffect(() => {
    const rawUrl = getAssetUrl(settings.wallpaper);
    if (!rawUrl) return;
    const img = new Image();
    img.src = rawUrl;
    img.onload = () => {
      setEffectiveWallpaperUrl(rawUrl);
    };
    img.onerror = () => {
      // Fallback to verified immutable release CDN wallpaper if local/pages path stalls
      const fallbackUrl = 'https://cdn.jsdelivr.net/gh/donoEla/Godly-OS-Workspac---Github@v4.7.3/dist/assets/backgrounds/kali-ferrofluid-1298846866.jpg';
      setEffectiveWallpaperUrl(fallbackUrl);
    };
  }, [settings.wallpaper]);

  return (
    <div
      onClick={handleDesktopClick}
      onContextMenu={handleDesktopContextMenu}
      className="relative w-full h-full overflow-hidden select-none z-0"
      style={{
        backgroundColor: '#060814',
        backgroundImage: effectiveWallpaperUrl ? `url("${encodeURI(effectiveWallpaperUrl)}")` : 'radial-gradient(ellipse at 50% 0%, #171038 0%, #060814 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        filter: 'var(--wallpaper-filter, none)',
      }}
    >
      {/* Dynamic wallpaper blur overlay */}
      {settings.wallpaperBlur > 0 && (
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-300"
          style={{ backdropFilter: `blur(${settings.wallpaperBlur}px)` }}
        />
      )}

      {/* Thematic Surface Overlay (Frosted tint, Neon Grid, Metal speculars) */}
      <div className="absolute inset-0 pointer-events-none theme-desktop-overlay transition-opacity duration-300" />

      {/* Subtle vignette shadow overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-black/20" />

      {/* Dynamic Live Wallpapers Engine (Fluid, Matrix, Starfield, Audio-reactive) */}
      <LiveWallpaperCanvas />

      {/* Interactive particle dot canvas */}
      {settings.particleBackground && <ParticleCanvas />}

      {/* Desktop Widgets Engine (Draggable glass panels pinned to desktop) */}
      <DesktopWidgetsLayer />

      {/* Desktop Draggable Icons with Magnetic Grid Snapping */}
      <div className="absolute inset-0 pointer-events-auto z-[2]">
        {installedApps.map((app, index) => {
          const pos = getAppPosition(app.id, index);
          const isDraggingThis = draggingAppId === app.id;
          const isSelected = selectedIconId === app.id;

          return (
            <motion.div
              key={app.id}
              drag
              dragMomentum={false}
              dragElastic={0.08}
              initial={false}
              animate={{
                x: PADDING_X + pos.col * GRID_COL_WIDTH,
                y: PADDING_Y + pos.row * GRID_ROW_HEIGHT,
                scale: isDraggingThis ? 1.08 : 1,
              }}
              transition={{
                type: 'spring',
                damping: 26,
                stiffness: 350,
                mass: 0.8,
              }}
              onDragStart={() => {
                setDraggingAppId(app.id);
                setSelectedIconId(app.id);
              }}
              onDragEnd={(_e, info) => handleDragEnd(app.id, info, pos)}
              className="absolute select-none cursor-grab active:cursor-grabbing"
              style={{
                zIndex: isDraggingThis ? 10 : isSelected ? 5 : 1,
              }}
            >
              <DesktopIcon
                id={app.id}
                name={app.name}
                icon={app.icon}
                isSelected={isSelected}
                onSelect={() => setSelectedIconId(app.id)}
                onOpen={() => {
                  if (dragDistanceRef.current > 10) return;
                  setSelectedIconId(null);
                  if (app.url) {
                    openWebApp(app.name, app.url, app.icon);
                  } else if (app.appId) {
                    openApp(app.appId);
                  } else {
                    openApp(app.id as any);
                  }
                }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Right Click Context Menu */}
      <DesktopContextMenu />
    </div>
  );
};
