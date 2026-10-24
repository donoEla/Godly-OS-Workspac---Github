import React from 'react';
import { OSProvider } from './context/OSContext';
import { ExtensionsProvider, useExtensions } from './context/ExtensionsContext';
import { Desktop } from './components/desktop/Desktop';
import { WindowManager } from './components/window/WindowManager';
import { Taskbar } from './components/taskbar/Taskbar';
import { StartMenu } from './components/taskbar/StartMenu';
import { QuickSettingsPanel } from './components/taskbar/QuickSettingsPanel';
import { CalendarFlyout } from './components/taskbar/CalendarFlyout';
import { NotificationCenter } from './components/taskbar/NotificationCenter';
import { MediaPill } from './components/taskbar/MediaPill';
import { CommandPalette } from './components/common/CommandPalette';
import { OnboardingTutorial } from './components/common/OnboardingTutorial';
import { ScreenCaptureTool } from './components/common/ScreenCaptureTool';
import { FpsCounterHUD } from './components/games/FpsCounterHUD';

function GodlyOS() {
  const { isExtensionEnabled } = useExtensions();

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black select-none font-sans">
      {/* 1. Desktop Wallpaper & Icons */}
      <Desktop />

      {/* 2. Window Manager Layer */}
      <WindowManager />

      {/* 3. Dynamic Floating Media Pill Island */}
      <MediaPill />

      {/* 4. Taskbar */}
      <Taskbar />

      {/* 5. Flyouts & Panels */}
      <StartMenu />
      <QuickSettingsPanel />
      <CalendarFlyout />
      <NotificationCenter />

      {/* 6. Command Palette (cmdk) */}
      <CommandPalette />

      {/* 7. Screen Recorder & Screenshot Snip Tool */}
      <ScreenCaptureTool />

      {/* 8. FPS & Performance Counter Overlay */}
      <FpsCounterHUD />

      {/* 9. Interactive Feature Showcase & First-Time Onboarding Tour */}
      <OnboardingTutorial />

      {/* 10. Retro CRT Scanline Shimmer Extension Overlay */}
      {isExtensionEnabled('crt-scanline-shimmer') && (
        <div
          id="godly-crt-overlay"
          className="pointer-events-none fixed inset-0 z-[999999] opacity-80 select-none"
          style={{
            background:
              'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.35) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.04), rgba(0, 255, 0, 0.02), rgba(0, 255, 0, 0.04))',
            backgroundSize: '100% 3px, 6px 100%',
            boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.65)',
          }}
        />
      )}
    </main>
  );
}

export default function App() {
  // Prevent recursive framing if an inner game inside Godly OS 404s and tries to load index.html
  const isRecursiveLoop = typeof window !== 'undefined' && (() => {
    try {
      if (window.name === 'godly-game-sandbox') {
        return true;
      }
      if (window.self !== window.top) {
        if (window.parent && window.parent.document && window.parent.document.querySelector('main.font-sans')) {
          return true;
        }
      }
    } catch {
      return false;
    }
    return false;
  })();

  if (isRecursiveLoop) {
    return (
      <div className="w-screen h-screen bg-[#07070d] text-white flex flex-col items-center justify-center p-6 text-center font-sans select-none">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3 text-lg font-bold font-mono">
          404
        </div>
        <h2 className="text-sm font-semibold text-white mb-1 font-mono">Game Asset Not Found</h2>
        <p className="text-xs text-slate-400 max-w-sm mb-4">
          The requested game file was not located on this host mirror.
        </p>
      </div>
    );
  }

  return (
    <OSProvider>
      <ExtensionsProvider>
        <GodlyOS />
      </ExtensionsProvider>
    </OSProvider>
  );
}
