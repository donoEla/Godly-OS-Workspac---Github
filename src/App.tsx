import React from 'react';
import { OSProvider } from './context/OSContext';
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

function GodlyOS() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black select-none font-sans">
      {/* 1. Desktop Wallpaper & Icons */}
      <Desktop />

      {/* 2. Window Manager Layer */}
      <WindowManager />

      {/* 3. Dynamic Floating Media Pill Island (Achroma style) */}
      <MediaPill />

      {/* 4. Taskbar */}
      <Taskbar />

      {/* 5. Flyouts & Panels */}
      <StartMenu />
      <QuickSettingsPanel />
      <CalendarFlyout />
      <NotificationCenter />

      {/* 6. Achroma-grade Command Palette (cmdk) */}
      <CommandPalette />

      {/* 7. Interactive Feature Showcase & First-Time Onboarding Tour */}
      <OnboardingTutorial />
    </main>
  );
}

export default function App() {
  // Prevent recursive framing of Godly OS if a 404 or router redirect points to index.html inside an iframe
  if (typeof window !== 'undefined' && window.self !== window.top) {
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
      <GodlyOS />
    </OSProvider>
  );
}
