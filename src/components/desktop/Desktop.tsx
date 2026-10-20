import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import { DesktopIcon } from './DesktopIcon';
import { DesktopContextMenu } from './DesktopContextMenu';
import { ParticleCanvas } from './ParticleCanvas';
import { getAssetUrl } from '../../utils/assetHelper';

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

  const wallpaperUrl = getAssetUrl(settings.wallpaper);

  return (
    <div
      onClick={handleDesktopClick}
      onContextMenu={handleDesktopContextMenu}
      className="relative w-full h-full overflow-hidden select-none"
      style={{
        backgroundImage: `url("${encodeURI(wallpaperUrl)}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Dynamic wallpaper blur overlay */}
      {settings.wallpaperBlur > 0 && (
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-300"
          style={{ backdropFilter: `blur(${settings.wallpaperBlur}px)` }}
        />
      )}

      {/* Subtle vignette shadow overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-black/20" />

      {/* Interactive particle dot canvas sampling dynamic wallpaper colors */}
      <ParticleCanvas />

      {/* Desktop Installed Apps Grid */}
      <div className="relative z-10 p-6 flex flex-col flex-wrap gap-4 max-h-[calc(100vh-80px)] w-fit overflow-x-auto select-none">
        {installedApps.map((app) => (
          <DesktopIcon
            key={app.id}
            id={app.id}
            name={app.name}
            icon={app.icon}
            isSelected={selectedIconId === app.id}
            onSelect={() => setSelectedIconId(app.id)}
            onOpen={() => {
              if (app.url) {
                openWebApp(app.name, app.url, app.icon);
              } else if (app.appId) {
                openApp(app.appId);
              } else {
                openApp(app.id as any);
              }
            }}
          />
        ))}
      </div>

      {/* Right Click Context Menu */}
      <DesktopContextMenu />
    </div>
  );
};
