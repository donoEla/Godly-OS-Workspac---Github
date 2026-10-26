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
import { ExtensionsStoreApp } from '../apps/ExtensionsStoreApp';
import { CodeEditorApp } from '../apps/CodeEditorApp';
import { VoiceMemosApp } from '../apps/VoiceMemosApp';
import { ThemeStudioApp } from '../apps/ThemeStudioApp';
import { VirtualMachineApp } from '../apps/VirtualMachineApp';
import { WidgetsApp } from '../apps/WidgetsApp';
import { EmulatorHubApp } from '../apps/EmulatorHubApp';
import { MultiplayerLobbyApp } from '../apps/MultiplayerLobbyApp';
import { EaglercraftApp } from '../apps/EaglercraftApp';

import { ServiceWorkerAppView } from '../common/ServiceWorkerAppView';

export const WindowManager: React.FC = () => {
  const { windows, activeWorkspaceId } = useOS();

  const renderAppContent = (win: any) => {
    if (win.appId === 'zen') {
      return (
        <ZenBrowserApp
          initialUrl={win.customUrl}
          windowId={win.id}
          initialTab={win.initialTab}
        />
      );
    }

    if (win.appId === 'virtual-machine') {
      return <VirtualMachineApp />;
    }

    if (win.appId === 'code-editor') {
      return <CodeEditorApp />;
    }

    if (win.appId === 'voice-memos') {
      return <VoiceMemosApp />;
    }

    if (win.appId === 'theme-studio') {
      return <ThemeStudioApp />;
    }

    if (win.appId === 'extensions') {
      return <ExtensionsStoreApp />;
    }

    if (
      win.appId === 'games' ||
      win.appId === 'lumin' ||
      win.appId === 'gnmath' ||
      win.appId === 'zengs' ||
      win.appId === 'sixkho' ||
      win.appId === 'ynrbsu' ||
      win.appId === 'nettleweb' ||
      win.customUrl === 'lumin' ||
      win.customUrl === 'gnmath' ||
      win.customUrl === 'zengs' ||
      win.customUrl === 'vault' ||
      win.customUrl === 'nowgg' ||
      win.customUrl === 'sixkho' ||
      win.customUrl === 'ynrbsu' ||
      win.customUrl === 'nettleweb'
    ) {
      const tab =
        win.appId === 'lumin' || win.customUrl === 'lumin'
          ? 'lumin'
          : win.appId === 'gnmath' || win.customUrl === 'gnmath'
          ? 'gnmath'
          : win.appId === 'zengs' || win.customUrl === 'zengs'
          ? 'zengs'
          : win.appId === 'sixkho' || win.customUrl === 'sixkho'
          ? 'sixkho'
          : win.appId === 'ynrbsu' || win.customUrl === 'ynrbsu'
          ? 'ynrbsu'
          : win.appId === 'nettleweb' || win.customUrl === 'nettleweb'
          ? 'nettleweb'
          : win.customUrl === 'vault' || win.customUrl === 'nowgg'
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
      case 'widgets':
        return <WidgetsApp />;
      case 'emulator':
        return <EmulatorHubApp />;
      case 'multiplayer':
        return <MultiplayerLobbyApp />;
      case 'eaglercraft':
        return <EaglercraftApp />;
      default:
        return (
          <div className="p-6 text-white text-center">
            Unknown Application: {win.appId}
          </div>
        );
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {/* NautilusOS-grade Snapping Preview Ghost */}
      <SnapOverlay />

      <AnimatePresence>
        {windows.map((win) => {
          // Virtual Desktops (Spaces): Pure DOM show/hide preserving all iframe/audio state
          const isVisible = win.isPip || !win.workspaceId || win.workspaceId === activeWorkspaceId;

          return (
            <div
              key={win.id}
              className="pointer-events-auto"
              style={{ display: isVisible ? 'block' : 'none' }}
            >
              <WindowFrame window={win}>
                {renderAppContent(win)}
              </WindowFrame>
            </div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
