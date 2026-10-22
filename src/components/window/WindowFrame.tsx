import React, { useRef, useState, useEffect } from 'react';
import { Minus, Square, X, Copy } from 'lucide-react';
import { WindowInstance } from '../../types/os';
import { useOS } from '../../context/OSContext';
import { useExtensions } from '../../context/ExtensionsContext';
import { getAssetUrl } from '../../utils/assetHelper';

interface WindowFrameProps {
  window: WindowInstance;
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({ window: win, children }) => {
  const {
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    updateWindowBounds,
    snapWindow,
    setSnapPreview,
    activeWindowId,
    settings,
  } = useOS();

  const isFocused = activeWindowId === win.id;
  const isMax = win.isMaximized;

  const { isExtensionEnabled } = useExtensions();
  const [isGenieMinimizing, setIsGenieMinimizing] = useState(false);

  const handleMinimize = () => {
    if (isExtensionEnabled('mac-genie-minimizer')) {
      setIsGenieMinimizing(true);
      setTimeout(() => {
        minimizeWindow(win.id);
        setIsGenieMinimizing(false);
      }, 420);
    } else {
      minimizeWindow(win.id);
    }
  };

  const windowRef = useRef<HTMLDivElement>(null);

  // Position and bounds tracking
  const currentPos  = useRef({ x: win.x, y: win.y });
  const currentSize = useRef({ width: win.width, height: win.height });

  useEffect(() => {
    if (!isDragging.current && !isResizing.current) {
      currentPos.current  = { x: win.x, y: win.y };
      currentSize.current = { width: win.width, height: win.height };
      if (windowRef.current) {
        if (isMax) {
          windowRef.current.style.transform = 'translate3d(0px, 0px, 0px)';
          windowRef.current.style.width     = '100vw';
          windowRef.current.style.height    = '100vh';
        } else {
          windowRef.current.style.transform = `translate3d(${win.x}px, ${win.y}px, 0px)`;
          windowRef.current.style.width     = `${win.width}px`;
          windowRef.current.style.height    = `${win.height}px`;
        }
      }
    }
  }, [win.x, win.y, win.width, win.height, isMax]);

  const isDragging      = useRef(false);
  const dragStartMouse  = useRef({ x: 0, y: 0 });
  const dragStartWindow = useRef({ x: 0, y: 0 });
  const lastMousePos    = useRef({ x: 0, y: 0 });

  const isResizing     = useRef(false);
  const resizeDir      = useRef<string | null>(null);
  const initialResize  = useRef({ x: 0, y: 0, width: 0, height: 0, mouseX: 0, mouseY: 0 });

  const [isInteracting,    setIsInteracting]    = useState(false);
  const [controlsHovered,  setControlsHovered]  = useState(false);

  // 120 FPS GPU-accelerated dragging
  const handleTitlePointerDown = (e: React.PointerEvent) => {
    if (isMax) return;
    if ((e.target as HTMLElement).closest('.window-control-btn')) return;

    focusWindow(win.id);
    isDragging.current      = true;
    setIsInteracting(true);
    dragStartMouse.current  = { x: e.clientX, y: e.clientY };
    dragStartWindow.current = { x: currentPos.current.x, y: currentPos.current.y };
    lastMousePos.current    = { x: e.clientX, y: e.clientY };

    const onPointerMove = (moveEvt: PointerEvent) => {
      if (!isDragging.current) return;
      lastMousePos.current = { x: moveEvt.clientX, y: moveEvt.clientY };
      const dx = moveEvt.clientX - dragStartMouse.current.x;
      const dy = moveEvt.clientY - dragStartMouse.current.y;

      const newX = Math.max(-currentSize.current.width + 100, Math.min(window.innerWidth - 100, dragStartWindow.current.x + dx));
      const newY = Math.max(0, Math.min(window.innerHeight - 80, dragStartWindow.current.y + dy));

      currentPos.current = { x: newX, y: newY };

      if (windowRef.current) {
        windowRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0px)`;
      }

      if (settings.windowSnapping) {
        if (moveEvt.clientX <= 28)                        setSnapPreview('left');
        else if (moveEvt.clientX >= window.innerWidth - 28) setSnapPreview('right');
        else if (moveEvt.clientY <= 22)                   setSnapPreview('top');
        else                                              setSnapPreview('none');
      }
    };

    const onPointerUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      setIsInteracting(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      if (settings.windowSnapping) {
        let finalSnap: 'none' | 'left' | 'right' | 'top' = 'none';
        if (lastMousePos.current.x <= 28)                          finalSnap = 'left';
        else if (lastMousePos.current.x >= window.innerWidth - 28) finalSnap = 'right';
        else if (lastMousePos.current.y <= 22)                     finalSnap = 'top';

        if (finalSnap !== 'none') {
          snapWindow(win.id, finalSnap);
          return;
        }
      }

      setSnapPreview('none');
      updateWindowBounds(win.id, { x: currentPos.current.x, y: currentPos.current.y });
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup',   onPointerUp,   { passive: true });
  };

  // 120 FPS GPU-accelerated resizing
  const handleResizeStart = (e: React.PointerEvent, dir: string) => {
    if (isMax) return;
    e.stopPropagation();
    e.preventDefault();
    focusWindow(win.id);

    isResizing.current   = true;
    setIsInteracting(true);
    resizeDir.current    = dir;
    initialResize.current = {
      x: currentPos.current.x,
      y: currentPos.current.y,
      width:  currentSize.current.width,
      height: currentSize.current.height,
      mouseX: e.clientX,
      mouseY: e.clientY,
    };

    const onResizeMove = (moveEvt: PointerEvent) => {
      if (!isResizing.current) return;
      const dx  = moveEvt.clientX - initialResize.current.mouseX;
      const dy  = moveEvt.clientY - initialResize.current.mouseY;
      const dir = resizeDir.current;

      let newW = initialResize.current.width;
      let newH = initialResize.current.height;
      let newX = initialResize.current.x;
      let newY = initialResize.current.y;

      if (dir?.includes('right'))  newW = Math.max(380, initialResize.current.width  + dx);
      if (dir?.includes('bottom')) newH = Math.max(260, initialResize.current.height + dy);
      if (dir?.includes('left')) {
        const calcW = initialResize.current.width - dx;
        if (calcW >= 380) { newW = calcW; newX = initialResize.current.x + dx; }
      }
      if (dir?.includes('top')) {
        const calcH = initialResize.current.height - dy;
        if (calcH >= 260) { newH = calcH; newY = initialResize.current.y + dy; }
      }

      currentPos.current  = { x: newX, y: newY };
      currentSize.current = { width: newW, height: newH };

      if (windowRef.current) {
        windowRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0px)`;
        windowRef.current.style.width     = `${newW}px`;
        windowRef.current.style.height    = `${newH}px`;
      }
    };

    const onResizeEnd = () => {
      if (!isResizing.current) return;
      isResizing.current = false;
      setIsInteracting(false);
      resizeDir.current  = null;
      window.removeEventListener('pointermove', onResizeMove);
      window.removeEventListener('pointerup',   onResizeEnd);

      updateWindowBounds(win.id, {
        x:      currentPos.current.x,
        y:      currentPos.current.y,
        width:  currentSize.current.width,
        height: currentSize.current.height,
      });
    };

    window.addEventListener('pointermove', onResizeMove, { passive: true });
    window.addEventListener('pointerup',   onResizeEnd,  { passive: true });
  };

  if (win.isMinimized) return null;

  return (
    <div
      ref={windowRef}
      onPointerDown={() => focusWindow(win.id)}
      className={`window-frame-container flex flex-col overflow-hidden transition-[border-radius,box-shadow] duration-200 animate-window-open ${
        isMax || (win.isSnapped && win.isSnapped !== 'none') ? 'rounded-none' : 'rounded-[18px]'
      } ${isGenieMinimizing ? 'genie-minimizing' : ''} ${
        isFocused && isExtensionEnabled('cyberpunk-rgb-aura') ? 'window-focused-glow' : ''
      }`}
      style={{
        position:  'absolute',
        top:       0,
        left:      0,
        transform: isMax ? 'translate3d(0px, 0px, 0px)' : `translate3d(${win.x}px, ${win.y}px, 0px)`,
        width:     isMax ? '100vw'  : `${win.width}px`,
        height:    isMax ? '100vh'  : `${win.height}px`,
        zIndex:    win.zIndex,
        willChange: isInteracting ? 'transform, width, height' : 'auto',
        background: isFocused ? 'rgba(8,8,14,0.88)' : 'rgba(8,8,14,0.80)',
        backdropFilter: 'blur(52px) saturate(180%)',
        WebkitBackdropFilter: 'blur(52px) saturate(180%)',
        border: `1px solid ${isFocused ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.08)'}`,
        boxShadow: isFocused
          ? '0 32px 80px rgba(0,0,0,0.85), 0 0 32px rgba(139,92,246,0.20), inset 0 1px 0 rgba(255,255,255,0.09)'
          : '0 20px 60px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      {/* ── Title Bar ── */}
      <div
        onPointerDown={handleTitlePointerDown}
        onDoubleClick={() => maximizeWindow(win.id)}
        className="h-[38px] flex items-center justify-between px-4 flex-shrink-0 relative select-none"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.038) 0%, rgba(255,255,255,0.01) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.055)',
          cursor: 'default',
        }}
      >
        {/* Traffic lights */}
        <div
          onMouseEnter={() => setControlsHovered(true)}
          onMouseLeave={() => setControlsHovered(false)}
          className="flex items-center gap-1.5 window-control-btn z-10"
        >
          <button
            onClick={() => closeWindow(win.id)}
            className="w-3 h-3 rounded-full traffic-light-close flex items-center justify-center transition-all hover:scale-110 active:scale-90"
            title="Close"
          >
            <X size={7} strokeWidth={2.5} className={`transition-opacity ${controlsHovered ? 'opacity-100' : 'opacity-0'}`} style={{ color: 'rgba(0,0,0,0.7)' }} />
          </button>
          <button
            onClick={handleMinimize}
            className="w-3 h-3 rounded-full traffic-light-min flex items-center justify-center transition-all hover:scale-110 active:scale-90"
            title="Minimize"
          >
            <Minus size={7} strokeWidth={2.5} className={`transition-opacity ${controlsHovered ? 'opacity-100' : 'opacity-0'}`} style={{ color: 'rgba(0,0,0,0.7)' }} />
          </button>
          <button
            onClick={() => maximizeWindow(win.id)}
            className="w-3 h-3 rounded-full traffic-light-max flex items-center justify-center transition-all hover:scale-110 active:scale-90"
            title={isMax ? 'Restore' : 'Maximize'}
          >
            {isMax ? (
              <Copy size={6} strokeWidth={2.5} className={`transition-opacity ${controlsHovered ? 'opacity-100' : 'opacity-0'}`} style={{ color: 'rgba(0,0,0,0.7)' }} />
            ) : (
              <Square size={6} strokeWidth={2.5} className={`transition-opacity ${controlsHovered ? 'opacity-100' : 'opacity-0'}`} style={{ color: 'rgba(0,0,0,0.7)' }} />
            )}
          </button>
        </div>

        {/* Centered title */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-20">
          <div className="flex items-center gap-1.5 min-w-0">
            <img
              src={getAssetUrl(win.icon)}
              alt=""
              className="w-3.5 h-3.5 rounded-md object-cover flex-shrink-0"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
            />
            <span
              className="text-[12px] font-medium truncate tracking-tight"
              style={{ color: isFocused ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.45)' }}
            >
              {win.title}
            </span>
          </div>
        </div>

        {/* Right: live indicator */}
        <div className="flex items-center gap-1.5 z-10">
          <span
            className={`w-1.5 h-1.5 rounded-full transition-all ${isFocused ? 'glow-pulse' : 'opacity-20'}`}
            style={{
              background: isFocused ? '#10b981' : 'rgba(255,255,255,0.3)',
              boxShadow: isFocused ? '0 0 6px rgba(16,185,129,0.6)' : 'none',
            }}
          />
        </div>
      </div>

      {/* ── Window Body ── */}
      <div
        className={`flex-1 w-full overflow-hidden relative ${isInteracting ? 'pointer-events-none select-none' : ''}`}
        style={{ background: 'rgba(6,6,12,0.45)' }}
      >
        {children}
      </div>

      {/* Drag overlay */}
      {isInteracting && (
        <div className="absolute inset-0 z-50 cursor-move bg-transparent" />
      )}

      {/* Resize handles */}
      {!isMax && (
        <>
          <div onPointerDown={(e) => handleResizeStart(e, 'top')}         className="absolute top-0 left-2 right-2 h-1 cursor-ns-resize z-40" />
          <div onPointerDown={(e) => handleResizeStart(e, 'bottom')}      className="absolute bottom-0 left-2 right-2 h-1.5 cursor-ns-resize z-40" />
          <div onPointerDown={(e) => handleResizeStart(e, 'left')}        className="absolute left-0 top-2 bottom-2 w-1.5 cursor-ew-resize z-40" />
          <div onPointerDown={(e) => handleResizeStart(e, 'right')}       className="absolute right-0 top-2 bottom-2 w-1.5 cursor-ew-resize z-40" />
          <div onPointerDown={(e) => handleResizeStart(e, 'top-left')}    className="absolute top-0 left-0 w-3 h-3 cursor-nwse-resize z-40" />
          <div onPointerDown={(e) => handleResizeStart(e, 'top-right')}   className="absolute top-0 right-0 w-3 h-3 cursor-nesw-resize z-40" />
          <div onPointerDown={(e) => handleResizeStart(e, 'bottom-left')} className="absolute bottom-0 left-0 w-3 h-3 cursor-nesw-resize z-40" />
          <div onPointerDown={(e) => handleResizeStart(e, 'bottom-right')}className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize z-40" />
        </>
      )}
    </div>
  );
};
