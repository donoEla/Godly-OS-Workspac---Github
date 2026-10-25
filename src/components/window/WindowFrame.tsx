import React, { useRef, useState, useEffect } from 'react';
import { Minus, Square, X, Copy, PictureInPicture2, Maximize2, Plus, LayoutGrid } from 'lucide-react';
import { WindowInstance, SnapRegion } from '../../types/os';
import { useOS } from '../../context/OSContext';
import { useExtensions } from '../../context/ExtensionsContext';
import { getAssetUrl } from '../../utils/assetHelper';
import { sound } from '../../utils/sound';

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
    mergeWindows,
    detachWindowTab,
    switchWindowTab,
    toggleWindowPip,
    setPipCorner,
  } = useOS();

  const isFocused = activeWindowId === win.id;
  const isMax = win.isMaximized;
  const isPip = win.isPip;

  const { isExtensionEnabled } = useExtensions();
  const [isGenieMinimizing, setIsGenieMinimizing] = useState(false);
  const [mergeTargetWindowId, setMergeTargetWindowId] = useState<string | null>(null);
  const [showFancyZones, setShowFancyZones] = useState(false);
  const fancyZonesTimerRef = useRef<any>(null);

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
  const currentPos = useRef({ x: win.x, y: win.y });
  const currentSize = useRef({ width: win.width, height: win.height });

  useEffect(() => {
    if (!isDragging.current && !isResizing.current) {
      currentPos.current = { x: win.x, y: win.y };
      currentSize.current = { width: win.width, height: win.height };
      if (windowRef.current) {
        if (isPip) {
          windowRef.current.style.transform = `translate3d(${win.x}px, ${win.y}px, 0px)`;
          windowRef.current.style.width = '320px';
          windowRef.current.style.height = '180px';
        } else if (isMax) {
          windowRef.current.style.transform = 'translate3d(0px, 0px, 0px)';
          windowRef.current.style.width = '100vw';
          windowRef.current.style.height = `${window.innerHeight - 52}px`;
        } else {
          windowRef.current.style.transform = `translate3d(${win.x}px, ${win.y}px, 0px)`;
          windowRef.current.style.width = `${win.width}px`;
          windowRef.current.style.height = `${win.height}px`;
        }
      }
    }
  }, [win.x, win.y, win.width, win.height, isMax, isPip]);

  const isDragging = useRef(false);
  const dragStartMouse = useRef({ x: 0, y: 0 });
  const dragStartWindow = useRef({ x: 0, y: 0 });
  const lastMousePos = useRef({ x: 0, y: 0 });

  const isResizing = useRef(false);
  const resizeDir = useRef<string | null>(null);
  const initialResize = useRef({ x: 0, y: 0, width: 0, height: 0, mouseX: 0, mouseY: 0 });

  const [isInteracting, setIsInteracting] = useState(false);
  const [controlsHovered, setControlsHovered] = useState(false);

  // Tab dragging out logic
  const draggingTabId = useRef<string | null>(null);
  const tabDragStart = useRef<{ x: number; y: number } | null>(null);

  // 120 FPS GPU-accelerated dragging with Multi-Tile Snapping & Window Merge
  const handleTitlePointerDown = (e: React.PointerEvent) => {
    if (isMax || isPip) return;
    if ((e.target as HTMLElement).closest('.window-control-btn') || (e.target as HTMLElement).closest('.window-tab-btn')) return;

    focusWindow(win.id);
    isDragging.current = true;
    setIsInteracting(true);
    dragStartMouse.current = { x: e.clientX, y: e.clientY };
    dragStartWindow.current = { x: currentPos.current.x, y: currentPos.current.y };
    lastMousePos.current = { x: e.clientX, y: e.clientY };

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

      // Check for window merge candidate under cursor
      const elementsUnder = document.elementsFromPoint(moveEvt.clientX, moveEvt.clientY);
      let foundMergeTarget: string | null = null;
      for (const el of elementsUnder) {
        const frameEl = el.closest('[data-window-id]');
        if (frameEl) {
          const targetId = frameEl.getAttribute('data-window-id');
          if (targetId && targetId !== win.id) {
            foundMergeTarget = targetId;
            break;
          }
        }
      }
      setMergeTargetWindowId(foundMergeTarget);

      // Multi-Tile Snapping Grid Zones
      if (settings.windowSnapping && !foundMergeTarget) {
        const cx = moveEvt.clientX;
        const cy = moveEvt.clientY;
        const w = window.innerWidth;
        const h = window.innerHeight;

        // 1. 2x2 Quad Grid (Corners)
        if (cx <= 40 && cy <= 45) {
          setSnapPreview('top-left');
        } else if (cx >= w - 40 && cy <= 45) {
          setSnapPreview('top-right');
        } else if (cx <= 40 && cy >= h - 65) {
          setSnapPreview('bottom-left');
        } else if (cx >= w - 40 && cy >= h - 65) {
          setSnapPreview('bottom-right');
        }
        // 2. Top Edge Multi-Zone
        else if (cy <= 26) {
          if (cx < w * 0.33) {
            setSnapPreview('col-1-of-3');
          } else if (cx > w * 0.66) {
            setSnapPreview('col-3-of-3');
          } else {
            setSnapPreview('top');
          }
        }
        // 3. Side Splits
        else if (cx <= 26) {
          setSnapPreview('left');
        } else if (cx >= w - 26) {
          setSnapPreview('right');
        } else {
          setSnapPreview('none');
        }
      } else {
        setSnapPreview('none');
      }
    };

    const onPointerUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      setIsInteracting(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      // Handle Tab Merge Drop
      if (mergeTargetWindowId) {
        mergeWindows(mergeTargetWindowId, win.id);
        setMergeTargetWindowId(null);
        setSnapPreview('none');
        return;
      }

      // Handle Aero Snapping Drop
      if (settings.windowSnapping) {
        const cx = lastMousePos.current.x;
        const cy = lastMousePos.current.y;
        const w = window.innerWidth;
        const h = window.innerHeight;
        let finalSnap: SnapRegion = 'none';

        if (cx <= 40 && cy <= 45) finalSnap = 'top-left';
        else if (cx >= w - 40 && cy <= 45) finalSnap = 'top-right';
        else if (cx <= 40 && cy >= h - 65) finalSnap = 'bottom-left';
        else if (cx >= w - 40 && cy >= h - 65) finalSnap = 'bottom-right';
        else if (cy <= 26) {
          if (cx < w * 0.33) finalSnap = 'col-1-of-3';
          else if (cx > w * 0.66) finalSnap = 'col-3-of-3';
          else finalSnap = 'top';
        } else if (cx <= 26) finalSnap = 'left';
        else if (cx >= w - 26) finalSnap = 'right';

        if (finalSnap !== 'none') {
          snapWindow(win.id, finalSnap);
          return;
        }
      }

      setSnapPreview('none');
      updateWindowBounds(win.id, { x: currentPos.current.x, y: currentPos.current.y });
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
  };

  // PiP Dragging Between 4 Corners
  const handlePipPointerDown = (e: React.PointerEvent) => {
    if (!isPip) return;
    e.stopPropagation();
    isDragging.current = true;
    dragStartMouse.current = { x: e.clientX, y: e.clientY };

    const onPipMove = (moveEvt: PointerEvent) => {
      if (!isDragging.current) return;
      const dx = moveEvt.clientX - dragStartMouse.current.x;
      const dy = moveEvt.clientY - dragStartMouse.current.y;
      if (windowRef.current) {
        windowRef.current.style.transform = `translate3d(${win.x + dx}px, ${win.y + dy}px, 0px)`;
      }
    };

    const onPipUp = (upEvt: PointerEvent) => {
      isDragging.current = false;
      window.removeEventListener('pointermove', onPipMove);
      window.removeEventListener('pointerup', onPipUp);

      const midX = window.innerWidth / 2;
      const midY = window.innerHeight / 2;
      let targetCorner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' = 'bottom-right';

      if (upEvt.clientX < midX && upEvt.clientY < midY) targetCorner = 'top-left';
      else if (upEvt.clientX >= midX && upEvt.clientY < midY) targetCorner = 'top-right';
      else if (upEvt.clientX < midX && upEvt.clientY >= midY) targetCorner = 'bottom-left';
      else targetCorner = 'bottom-right';

      setPipCorner(win.id, targetCorner);
    };

    window.addEventListener('pointermove', onPipMove);
    window.addEventListener('pointerup', onPipUp);
  };

  // 120 FPS GPU-accelerated resizing
  const handleResizeStart = (e: React.PointerEvent, dir: string) => {
    if (isMax || isPip) return;
    e.stopPropagation();
    e.preventDefault();
    focusWindow(win.id);

    isResizing.current = true;
    setIsInteracting(true);
    resizeDir.current = dir;
    initialResize.current = {
      x: currentPos.current.x,
      y: currentPos.current.y,
      width: currentSize.current.width,
      height: currentSize.current.height,
      mouseX: e.clientX,
      mouseY: e.clientY,
    };

    const onResizeMove = (moveEvt: PointerEvent) => {
      if (!isResizing.current) return;
      const dx = moveEvt.clientX - initialResize.current.mouseX;
      const dy = moveEvt.clientY - initialResize.current.mouseY;
      const dirStr = resizeDir.current;

      let newW = initialResize.current.width;
      let newH = initialResize.current.height;
      let newX = initialResize.current.x;
      let newY = initialResize.current.y;

      if (dirStr?.includes('right')) newW = Math.max(380, initialResize.current.width + dx);
      if (dirStr?.includes('bottom')) newH = Math.max(260, initialResize.current.height + dy);
      if (dirStr?.includes('left')) {
        const calcW = initialResize.current.width - dx;
        if (calcW >= 380) { newW = calcW; newX = initialResize.current.x + dx; }
      }
      if (dirStr?.includes('top')) {
        const calcH = initialResize.current.height - dy;
        if (calcH >= 260) { newH = calcH; newY = initialResize.current.y + dy; }
      }

      currentPos.current = { x: newX, y: newY };
      currentSize.current = { width: newW, height: newH };

      if (windowRef.current) {
        windowRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0px)`;
        windowRef.current.style.width = `${newW}px`;
        windowRef.current.style.height = `${newH}px`;
      }
    };

    const onResizeEnd = () => {
      if (!isResizing.current) return;
      isResizing.current = false;
      setIsInteracting(false);
      resizeDir.current = null;
      window.removeEventListener('pointermove', onResizeMove);
      window.removeEventListener('pointerup', onResizeEnd);

      updateWindowBounds(win.id, {
        x: currentPos.current.x,
        y: currentPos.current.y,
        width: currentSize.current.width,
        height: currentSize.current.height,
      });
    };

    window.addEventListener('pointermove', onResizeMove, { passive: true });
    window.addEventListener('pointerup', onResizeEnd, { passive: true });
  };

  // Tab Header Pointer Down with detach on drag
  const handleTabPointerDown = (e: React.PointerEvent, tabId: string) => {
    e.stopPropagation();
    switchWindowTab(win.id, tabId);
    draggingTabId.current = tabId;
    tabDragStart.current = { x: e.clientX, y: e.clientY };

    const onTabMove = (moveEvt: PointerEvent) => {
      if (!tabDragStart.current) return;
      const dy = Math.abs(moveEvt.clientY - tabDragStart.current.y);
      const dx = Math.abs(moveEvt.clientX - tabDragStart.current.x);
      if (dy > 38 || dx > 70) {
        // Detach tab into its own standalone window
        window.removeEventListener('pointermove', onTabMove);
        window.removeEventListener('pointerup', onTabUp);
        detachWindowTab(win.id, tabId, { x: moveEvt.clientX, y: moveEvt.clientY });
        tabDragStart.current = null;
        draggingTabId.current = null;
      }
    };

    const onTabUp = () => {
      tabDragStart.current = null;
      draggingTabId.current = null;
      window.removeEventListener('pointermove', onTabMove);
      window.removeEventListener('pointerup', onTabUp);
    };

    window.addEventListener('pointermove', onTabMove);
    window.addEventListener('pointerup', onTabUp);
  };

  if (win.isMinimized) return null;

  const isRgbGlow = isFocused && isExtensionEnabled('cyberpunk-rgb-aura');
  const hasTabs = win.tabs && win.tabs.length > 1;

  // ── Render Picture-in-Picture Floating Mode ──
  if (isPip) {
    return (
      <div
        ref={windowRef}
        data-window-id={win.id}
        onPointerDown={handlePipPointerDown}
        className="fixed z-[9999] rounded-2xl overflow-hidden shadow-2xl backdrop-blur-2xl border border-white/20 select-none group cursor-move transition-transform duration-200 hover:scale-[1.02]"
        style={{
          width: '320px',
          height: '180px',
          transform: `translate3d(${win.x}px, ${win.y}px, 0px)`,
          background: 'rgba(10, 10, 18, 0.92)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.85), 0 0 25px rgba(139,92,246,0.3)',
        }}
      >
        {/* Floating PiP Header */}
        <div className="absolute top-0 inset-x-0 h-7 bg-black/60 backdrop-blur-md px-3 flex items-center justify-between z-30 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1.5 min-w-0">
            <img src={getAssetUrl(win.icon)} alt="" className="w-3.5 h-3.5 rounded object-cover" />
            <span className="text-[11px] font-medium text-white/90 truncate">{win.title}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleWindowPip(win.id)}
              className="p-1 rounded hover:bg-white/10 text-white/80 transition-colors"
              title="Expand back to window"
            >
              <Maximize2 size={12} />
            </button>
            <button
              onClick={() => closeWindow(win.id)}
              className="p-1 rounded hover:bg-red-500/30 text-white/80 hover:text-red-400 transition-colors"
              title="Close"
            >
              <X size={12} />
            </button>
          </div>
        </div>

        {/* Scaled-down App Viewport */}
        <div className="w-full h-full overflow-hidden pointer-events-none transform origin-top-left scale-[0.62]" style={{ width: '516px', height: '290px' }}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={windowRef}
      data-window-id={win.id}
      onPointerDown={() => focusWindow(win.id)}
      className={`window-frame-container ${isInteracting ? 'is-interacting' : ''} flex flex-col overflow-hidden transition-[border-radius,box-shadow] duration-200 animate-window-open ${
        isMax || (win.isSnapped && win.isSnapped !== 'none') ? 'rounded-none' : 'rounded-[var(--radius,18px)]'
      } ${isGenieMinimizing ? 'genie-minimizing' : ''} ${isRgbGlow ? 'window-focused-glow' : ''}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        transform: isMax ? 'translate3d(0px, 0px, 0px)' : `translate3d(${win.x}px, ${win.y}px, 0px)`,
        width: isMax ? '100vw' : `${win.width}px`,
        height: isMax ? `${window.innerHeight - 52}px` : `${win.height}px`,
        zIndex: win.zIndex,
        willChange: isInteracting ? 'transform, width, height' : 'auto',
        background: isFocused ? 'var(--window-bg-focused, var(--window-bg, rgba(8,8,14,0.88)))' : 'var(--window-bg, rgba(8,8,14,0.80))',
        backdropFilter: `blur(var(--glass-blur, 38px)) saturate(180%)`,
        WebkitBackdropFilter: `blur(var(--glass-blur, 38px)) saturate(180%)`,
        border: mergeTargetWindowId
          ? '2px solid rgba(59, 130, 246, 0.9)'
          : isRgbGlow
          ? '1.5px solid rgba(236, 72, 153, 0.8)'
          : `1px solid ${isFocused ? 'var(--window-border-focused, var(--accent-border, rgba(139,92,246,0.4)))' : 'var(--window-border, rgba(255,255,255,0.08))'}`,
        boxShadow: mergeTargetWindowId
          ? '0 0 40px rgba(59, 130, 246, 0.7), inset 0 0 20px rgba(59, 130, 246, 0.3)'
          : isRgbGlow
          ? '0 0 35px rgba(168, 85, 247, 0.65), 0 0 70px rgba(59, 130, 246, 0.35), 0 0 0 2px rgba(236, 72, 153, 0.7), 0 32px 80px rgba(0,0,0,0.85)'
          : isFocused
          ? 'var(--window-shadow-focused, 0 32px 80px rgba(0,0,0,0.85))'
          : 'var(--window-shadow, 0 20px 60px rgba(0,0,0,0.75))',
      }}
    >
      {/* ── Window Group Tab Bar (When multiple apps merged) ── */}
      {hasTabs && (
        <div
          className="h-8 bg-black/40 border-b border-white/10 flex items-center px-2 gap-1.5 overflow-x-auto select-none"
          style={{ scrollbarWidth: 'none' }}
        >
          {win.tabs!.map((tab) => {
            const isActive = tab.id === (win.activeTabId || win.id);
            return (
              <div
                key={tab.id}
                onPointerDown={(e) => handleTabPointerDown(e, tab.id)}
                className={`window-tab-btn px-3 py-1 rounded-lg flex items-center gap-2 cursor-pointer transition-all ${
                  isActive
                    ? 'bg-white/15 text-white border border-white/20 shadow-md'
                    : 'text-white/60 hover:bg-white/5 hover:text-white/90'
                }`}
              >
                <img src={getAssetUrl(tab.icon)} alt="" className="w-3 h-3 rounded object-cover" />
                <span className="text-[11px] font-medium truncate max-w-[140px]">{tab.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    detachWindowTab(win.id, tab.id);
                  }}
                  className="opacity-40 hover:opacity-100 hover:text-red-400 p-0.5 rounded transition-opacity"
                  title="Detach Tab"
                >
                  <X size={10} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Title Bar ── */}
      <div
        onPointerDown={handleTitlePointerDown}
        onDoubleClick={() => maximizeWindow(win.id)}
        className="h-[38px] flex items-center justify-between px-4 flex-shrink-0 relative select-none"
        style={{
          background: 'var(--window-header-bg, linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%))',
          borderBottom: 'var(--window-header-border, 1px solid rgba(255,255,255,0.06))',
          cursor: 'default',
        }}
      >
        {/* Left Traffic Lights */}
        <div
          onMouseEnter={() => setControlsHovered(true)}
          onMouseLeave={() => setControlsHovered(false)}
          className="flex items-center gap-1.5 window-control-btn z-10"
        >
          <button
            onClick={() => closeWindow(win.id)}
            className="w-3 h-3 rounded-full traffic-light-btn traffic-light-close flex items-center justify-center transition-all hover:scale-110 active:scale-90"
            title="Close"
          >
            <X size={7} strokeWidth={2.5} className={`transition-opacity ${controlsHovered ? 'opacity-100' : 'opacity-0'}`} style={{ color: 'rgba(0,0,0,0.7)' }} />
          </button>
          <button
            onClick={handleMinimize}
            className="w-3 h-3 rounded-full traffic-light-btn traffic-light-min flex items-center justify-center transition-all hover:scale-110 active:scale-90"
            title="Minimize"
          >
            <Minus size={7} strokeWidth={2.5} className={`transition-opacity ${controlsHovered ? 'opacity-100' : 'opacity-0'}`} style={{ color: 'rgba(0,0,0,0.7)' }} />
          </button>
          <div
            className="relative"
            onMouseEnter={() => {
              fancyZonesTimerRef.current = setTimeout(() => setShowFancyZones(true), 300);
            }}
            onMouseLeave={() => {
              if (fancyZonesTimerRef.current) clearTimeout(fancyZonesTimerRef.current);
              fancyZonesTimerRef.current = setTimeout(() => setShowFancyZones(false), 400);
            }}
          >
            <button
              onClick={() => maximizeWindow(win.id)}
              className="w-3 h-3 rounded-full traffic-light-btn traffic-light-max flex items-center justify-center transition-all hover:scale-110 active:scale-90"
              title={isMax ? 'Restore' : 'Maximize (Hover for FancyZones)'}
            >
              {isMax ? (
                <Copy size={6} strokeWidth={2.5} className={`transition-opacity ${controlsHovered ? 'opacity-100' : 'opacity-0'}`} style={{ color: 'rgba(0,0,0,0.7)' }} />
              ) : (
                <Square size={6} strokeWidth={2.5} className={`transition-opacity ${controlsHovered ? 'opacity-100' : 'opacity-0'}`} style={{ color: 'rgba(0,0,0,0.7)' }} />
              )}
            </button>
          </div>
        </div>

        {/* FancyZones Magnetic Tiling Popover Overlay */}
        {showFancyZones && (
          <div
            onMouseEnter={() => {
              if (fancyZonesTimerRef.current) clearTimeout(fancyZonesTimerRef.current);
            }}
            onMouseLeave={() => setShowFancyZones(false)}
            className="absolute top-10 left-3 z-[100] bg-[#0c0d18]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-3 shadow-2xl shadow-black/80 flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-150"
            style={{ minWidth: '240px' }}
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
              <span className="text-[11px] font-bold text-white tracking-tight flex items-center gap-1.5">
                <LayoutGrid size={12} className="text-purple-400" />
                FancyZones Magnetic Layouts
              </span>
              <span className="text-[9px] text-white/40 font-mono">Win + Arrows</span>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 gap-2">
              {/* 50 / 50 Split */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-white/60 font-medium">Split 50/50</span>
                <div className="h-10 rounded-lg bg-black/40 border border-white/10 p-1 flex gap-1">
                  <button
                    onClick={() => { snapWindow(win.id, 'left'); setShowFancyZones(false); }}
                    className="flex-1 rounded bg-white/10 hover:bg-purple-500/50 transition-colors border border-white/5 hover:border-purple-400"
                    title="Snap Left 50%"
                  />
                  <button
                    onClick={() => { snapWindow(win.id, 'right'); setShowFancyZones(false); }}
                    className="flex-1 rounded bg-white/10 hover:bg-purple-500/50 transition-colors border border-white/5 hover:border-purple-400"
                    title="Snap Right 50%"
                  />
                </div>
              </div>

              {/* 70 / 30 Focus */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-white/60 font-medium">Focus 70/30</span>
                <div className="h-10 rounded-lg bg-black/40 border border-white/10 p-1 flex gap-1">
                  <button
                    onClick={() => { snapWindow(win.id, 'split-70'); setShowFancyZones(false); }}
                    style={{ flex: 7 }}
                    className="rounded bg-white/10 hover:bg-purple-500/50 transition-colors border border-white/5 hover:border-purple-400"
                    title="Snap Left 70%"
                  />
                  <button
                    onClick={() => { snapWindow(win.id, 'split-30'); setShowFancyZones(false); }}
                    style={{ flex: 3 }}
                    className="rounded bg-white/10 hover:bg-purple-500/50 transition-colors border border-white/5 hover:border-purple-400"
                    title="Snap Right 30%"
                  />
                </div>
              </div>

              {/* 3-Column Split */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-white/60 font-medium">3-Column Split</span>
                <div className="h-10 rounded-lg bg-black/40 border border-white/10 p-1 flex gap-1">
                  <button
                    onClick={() => { snapWindow(win.id, 'col-1-of-3'); setShowFancyZones(false); }}
                    className="flex-1 rounded bg-white/10 hover:bg-purple-500/50 transition-colors border border-white/5 hover:border-purple-400"
                    title="Column 1 of 3"
                  />
                  <button
                    onClick={() => { snapWindow(win.id, 'col-2-of-3'); setShowFancyZones(false); }}
                    className="flex-1 rounded bg-white/10 hover:bg-purple-500/50 transition-colors border border-white/5 hover:border-purple-400"
                    title="Column 2 of 3"
                  />
                  <button
                    onClick={() => { snapWindow(win.id, 'col-3-of-3'); setShowFancyZones(false); }}
                    className="flex-1 rounded bg-white/10 hover:bg-purple-500/50 transition-colors border border-white/5 hover:border-purple-400"
                    title="Column 3 of 3"
                  />
                </div>
              </div>

              {/* 2x2 Quad Grid */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-white/60 font-medium">2x2 Quad Grid</span>
                <div className="h-10 rounded-lg bg-black/40 border border-white/10 p-1 grid grid-cols-2 grid-rows-2 gap-1">
                  <button
                    onClick={() => { snapWindow(win.id, 'top-left'); setShowFancyZones(false); }}
                    className="rounded bg-white/10 hover:bg-purple-500/50 transition-colors border border-white/5 hover:border-purple-400"
                    title="Top-Left Quad"
                  />
                  <button
                    onClick={() => { snapWindow(win.id, 'top-right'); setShowFancyZones(false); }}
                    className="rounded bg-white/10 hover:bg-purple-500/50 transition-colors border border-white/5 hover:border-purple-400"
                    title="Top-Right Quad"
                  />
                  <button
                    onClick={() => { snapWindow(win.id, 'bottom-left'); setShowFancyZones(false); }}
                    className="rounded bg-white/10 hover:bg-purple-500/50 transition-colors border border-white/5 hover:border-purple-400"
                    title="Bottom-Left Quad"
                  />
                  <button
                    onClick={() => { snapWindow(win.id, 'bottom-right'); setShowFancyZones(false); }}
                    className="rounded bg-white/10 hover:bg-purple-500/50 transition-colors border border-white/5 hover:border-purple-400"
                    title="Bottom-Right Quad"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Centered Title */}
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
              style={{ color: isFocused ? 'var(--text-primary, rgba(255,255,255,0.85))' : 'var(--text-secondary, rgba(255,255,255,0.45))' }}
            >
              {win.title}
            </span>
          </div>
        </div>

        {/* Right Tools: FancyZones button, PiP and Live Status Indicator */}
        <div className="flex items-center gap-1.5 z-10 window-control-btn">
          <button
            onClick={() => setShowFancyZones((prev) => !prev)}
            className="p-1 rounded-md hover:bg-white/10 text-white/50 hover:text-white/90 transition-colors"
            title="FancyZones Magnetic Window Tiling"
          >
            <LayoutGrid size={13} />
          </button>
          <button
            onClick={() => toggleWindowPip(win.id)}
            className="p-1 rounded-md hover:bg-white/10 text-white/50 hover:text-white/90 transition-colors"
            title="Picture-in-Picture Mini Widget"
          >
            <PictureInPicture2 size={13} />
          </button>
          <span
            className={`w-1.5 h-1.5 rounded-full transition-all ${isFocused ? 'glow-pulse' : 'opacity-20'}`}
            style={{
              background: isFocused ? 'var(--accent, #10b981)' : 'var(--border-subtle, rgba(255,255,255,0.3))',
              boxShadow: isFocused ? '0 0 6px var(--accent-glow, rgba(16,185,129,0.6))' : 'none',
            }}
          />
        </div>
      </div>

      {/* ── Window Body ── */}
      <div
        className={`flex-1 w-full overflow-hidden relative ${isInteracting ? 'pointer-events-none select-none' : ''}`}
        style={{ background: 'var(--window-body-bg, rgba(6,6,12,0.45))' }}
      >
        {children}
      </div>

      {/* Drag overlay */}
      {isInteracting && (
        <div className="absolute inset-0 z-50 cursor-move bg-transparent" />
      )}

      {/* Resize handles */}
      {!isMax && !isPip && (
        <>
          <div onPointerDown={(e) => handleResizeStart(e, 'top')} className="absolute top-0 left-2 right-2 h-1 cursor-ns-resize z-40" />
          <div onPointerDown={(e) => handleResizeStart(e, 'bottom')} className="absolute bottom-0 left-2 right-2 h-1.5 cursor-ns-resize z-40" />
          <div onPointerDown={(e) => handleResizeStart(e, 'left')} className="absolute left-0 top-2 bottom-2 w-1.5 cursor-ew-resize z-40" />
          <div onPointerDown={(e) => handleResizeStart(e, 'right')} className="absolute right-0 top-2 bottom-2 w-1.5 cursor-ew-resize z-40" />
          <div onPointerDown={(e) => handleResizeStart(e, 'top-left')} className="absolute top-0 left-0 w-3 h-3 cursor-nwse-resize z-40" />
          <div onPointerDown={(e) => handleResizeStart(e, 'top-right')} className="absolute top-0 right-0 w-3 h-3 cursor-nesw-resize z-40" />
          <div onPointerDown={(e) => handleResizeStart(e, 'bottom-left')} className="absolute bottom-0 left-0 w-3 h-3 cursor-nesw-resize z-40" />
          <div onPointerDown={(e) => handleResizeStart(e, 'bottom-right')} className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize z-40" />
        </>
      )}
    </div>
  );
};
