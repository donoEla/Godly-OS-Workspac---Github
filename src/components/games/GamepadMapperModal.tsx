import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, X, RefreshCw, Check, Keyboard, Disc } from 'lucide-react';
import { sound } from '../../utils/sound';

interface GamepadMapping {
  [buttonIndex: number]: string; // buttonIndex -> KeyboardEvent.key (e.g. 0 -> 'Space', 12 -> 'ArrowUp')
}

const DEFAULT_MAPPING: GamepadMapping = {
  0: 'Space',     // A / Cross
  1: 'Shift',     // B / Circle
  2: 'KeyX',      // X / Square
  3: 'KeyY',      // Y / Triangle
  4: 'KeyQ',      // LB / L1
  5: 'KeyE',      // RB / R1
  8: 'Escape',    // Select / Share
  9: 'Enter',     // Start / Options
  12: 'ArrowUp',   // Dpad Up
  13: 'ArrowDown', // Dpad Down
  14: 'ArrowLeft', // Dpad Left
  15: 'ArrowRight',// Dpad Right
};

const BUTTON_LABELS: Record<number, string> = {
  0: 'A / Cross',
  1: 'B / Circle',
  2: 'X / Square',
  3: 'Y / Triangle',
  4: 'LB / L1',
  5: 'RB / R1',
  6: 'LT / L2',
  7: 'RT / R2',
  8: 'Select / Back',
  9: 'Start / Menu',
  10: 'L3 / Stick Left',
  11: 'R3 / Stick Right',
  12: 'D-Pad Up',
  13: 'D-Pad Down',
  14: 'D-Pad Left',
  15: 'D-Pad Right',
};

export const GamepadMapperModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [detectedGamepad, setDetectedGamepad] = useState<string | null>(null);
  const [controllerType, setControllerType] = useState<'xbox' | 'playstation' | 'switch'>('xbox');
  const [selectedButtonIdx, setSelectedButtonIdx] = useState<number | null>(null);
  const [mappings, setMappings] = useState<GamepadMapping>(() => {
    try {
      const saved = localStorage.getItem('godly_gamepad_bindings');
      return saved ? JSON.parse(saved) : DEFAULT_MAPPING;
    } catch {
      return DEFAULT_MAPPING;
    }
  });

  const prevButtonsRef = useRef<Record<number, boolean>>({});

  // Poll for Gamepad connection
  useEffect(() => {
    let animId: number;
    const poll = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = gamepads[0] || gamepads[1];
      if (gp) {
        setDetectedGamepad(gp.id);
        const lower = gp.id.toLowerCase();
        if (lower.includes('playstation') || lower.includes('dualshock') || lower.includes('dualsense')) {
          setControllerType('playstation');
        } else if (lower.includes('switch') || lower.includes('nintendo')) {
          setControllerType('switch');
        } else {
          setControllerType('xbox');
        }

        // Active button polling -> dispatch synthetic keyboard events
        gp.buttons.forEach((btn, idx) => {
          const isPressed = btn.pressed || btn.value > 0.5;
          const wasPressed = prevButtonsRef.current[idx] || false;
          const boundKey = mappings[idx];

          if (isPressed && !wasPressed && boundKey) {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: boundKey, code: boundKey, bubbles: true }));
          } else if (!isPressed && wasPressed && boundKey) {
            window.dispatchEvent(new KeyboardEvent('keyup', { key: boundKey, code: boundKey, bubbles: true }));
          }

          prevButtonsRef.current[idx] = isPressed;
        });
      } else {
        setDetectedGamepad(null);
      }
      animId = requestAnimationFrame(poll);
    };

    animId = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(animId);
  }, [mappings]);

  // Key press listener when rebinding
  useEffect(() => {
    if (selectedButtonIdx === null) return;

    const handleKey = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const newKey = e.code || e.key;
      setMappings((prev) => {
        const updated = { ...prev, [selectedButtonIdx]: newKey };
        localStorage.setItem('godly_gamepad_bindings', JSON.stringify(updated));
        return updated;
      });
      setSelectedButtonIdx(null);
      sound.playSnap();
    };

    window.addEventListener('keydown', handleKey, { capture: true, once: true });
    return () => window.removeEventListener('keydown', handleKey, { capture: true });
  }, [selectedButtonIdx]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-[620px] rounded-3xl bg-[#0c0d18] border border-white/15 p-6 shadow-2xl flex flex-col text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Gamepad2 size={22} className="text-purple-400" />
            <div>
              <h2 className="text-sm font-bold tracking-tight">Gamepad / Controller Remapper</h2>
              <p className="text-[11px] text-white/50">
                {detectedGamepad ? `Connected: ${detectedGamepad}` : 'No hardware detected. Connect via USB or Bluetooth.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-white/60 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* Controller Visual Preview Diagram */}
        <div className="my-5 p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col items-center justify-center relative">
          <div className="flex items-center gap-2 mb-3">
            {(['xbox', 'playstation', 'switch'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setControllerType(type)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-all ${
                  controllerType === type
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-white/5 text-white/40 hover:bg-white/10'
                }`}
              >
                {type} Layout
              </button>
            ))}
          </div>

          <div className="text-center py-4">
            <div className="w-48 h-28 rounded-3xl border-2 border-white/20 bg-white/5 flex flex-col items-center justify-between p-3 relative mx-auto shadow-inner">
              <div className="flex justify-between w-full">
                <span className="text-[10px] text-purple-300 font-mono">LB / L1</span>
                <span className="text-[10px] text-purple-300 font-mono">RB / R1</span>
              </div>
              <div className="flex justify-between w-full items-center px-2">
                <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-[10px] font-bold text-white/70">
                  D-Pad
                </div>
                <Disc size={20} className="text-white/20" />
                <div className="w-8 h-8 rounded-full border border-purple-400 bg-purple-500/20 flex items-center justify-center text-[10px] font-bold text-purple-300">
                  {controllerType === 'playstation' ? '✕ ○ □ △' : controllerType === 'switch' ? 'B A Y X' : 'A B X Y'}
                </div>
              </div>
              <span className="text-[9px] text-white/40 font-mono">Auto-Dispatch Engine (60 FPS)</span>
            </div>
          </div>
        </div>

        {/* Bindings Matrix */}
        <div className="flex-1 max-h-56 overflow-y-auto pr-1 grid grid-cols-2 gap-2">
          {Object.entries(BUTTON_LABELS).map(([btnIdxStr, label]) => {
            const btnIdx = Number(btnIdxStr);
            const isRebinding = selectedButtonIdx === btnIdx;
            const currentKey = mappings[btnIdx] || 'None';

            return (
              <button
                key={btnIdx}
                onClick={() => setSelectedButtonIdx(btnIdx)}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-left transition-all ${
                  isRebinding
                    ? 'border-purple-400 bg-purple-500/20 text-purple-200 animate-pulse'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 text-white/80'
                }`}
              >
                <span className="text-xs font-medium">{label}</span>
                <span className="px-2 py-0.5 rounded-lg bg-black/60 border border-white/10 text-[11px] font-mono text-purple-300">
                  {isRebinding ? 'Press Key...' : currentKey}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={() => {
              setMappings(DEFAULT_MAPPING);
              localStorage.setItem('godly_gamepad_bindings', JSON.stringify(DEFAULT_MAPPING));
              sound.playSnap();
            }}
            className="text-xs text-white/50 hover:text-white flex items-center gap-1.5"
          >
            <RefreshCw size={12} />
            <span>Reset to Default</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all active:scale-95 shadow-lg"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
