import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useOS } from '../../context/OSContext';
import { WindowFrame } from './WindowFrame';
import { SnapOverlay } from './SnapOverlay';

// App components
import { AppStoreApp } from '../apps/AppStoreApp';
import { CalculatorApp } from '../apps/CalculatorApp';
import { FileManagerApp } from '../apps/FileManagerApp';
import { GamesApp } from '../apps/GamesApp';
import { NotesApp } from '../apps/NotesApp';
import { SettingsApp } from '../apps/SettingsApp';
import { SpotifyApp } from '../apps/SpotifyApp';
import { TerminalApp } from '../apps/TerminalApp';
import { ZenBrowserApp } from '../apps/ZenBrowserApp';

import { ServiceWorkerAppView } from '../common/ServiceWorkerAppView';

export const WindowManager: React.FC = () => {
  const { windows } = useOS();

  const renderAppContent = (win: any) => {
    if (win.appId === 'zen') {
      return <ZenBrowserApp initialUrl={win.customUrl} />;
    }

    if (win.appId === 'games' || win.appId === 'lumin' || win.appId === 'gnmath' || win.appId === 'zengs' || win.customUrl === 'lumin' || win.customUrl === 'gnmath' || win.customUrl === 'zengs' || win.customUrl === 'vault' || win.customUrl === 'nowgg' || win.customUrl === 'retro') {
      const tab =
        win.appId === 'lumin' || win.customUrl === 'lumin'
          ? 'lumin'
          : win.appId === 'gnmath' || win.customUrl === 'gnmath'
          ? 'gnmath'
          : win.appId === 'zengs' || win.customUrl === 'zengs'
          ? 'zengs'
          : win.customUrl === 'vault' || win.customUrl === 'nowgg' || win.customUrl === 'retro'
          ? (win.customUrl as any)
          : undefined;
      return <GamesApp initialTab={tab} />;
    }

    if (win.appId === 'web-app' || win.customUrl) {
      return (
        <ServiceWorkerAppView
          url={win.customUrl || 'https://nowgg.fun'}
          appName={win.title}
        />
      );
    }

    switch (win.appId) {
      case 'app-store':
        return <AppStoreApp />;
      case 'calculator':
        return <CalculatorApp />;
      case 'file-manager':
        return <FileManagerApp />;
      case 'games':
        return <GamesApp />;
      case 'notes':
        return <NotesApp />;
      case 'settings':
        return <SettingsApp />;
      case 'spotify':
        return <SpotifyApp />;
      case 'terminal':
        return <TerminalApp />;
      default:
        return (
          <div className="p-6 text-white text-center">
            Unknown Application: {win.appId}
          </div>
        );
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* NautilusOS-grade Snapping Preview Ghost */}
      <SnapOverlay />

      <AnimatePresence>
        {windows.map((win) => (
          <div key={win.id} className="pointer-events-auto">
            <WindowFrame window={win}>
              {renderAppContent(win)}
            </WindowFrame>
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};
