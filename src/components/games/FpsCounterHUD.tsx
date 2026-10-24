import React, { useState, useEffect, useRef } from 'react';
import { Gauge, Cpu, Eye } from 'lucide-react';
import { useOS } from '../../context/OSContext';

export const FpsCounterHUD: React.FC = () => {
  const { settings } = useOS();
  const [fps, setFps] = useState<number>(60);
  const [memHeap, setMemHeap] = useState<string>('32 MB');
  const [renderer, setRenderer] = useState<string>('Hardware WebGL2');

  const frameCount = useRef<number>(0);
  const lastTime = useRef<number>(performance.now());
  const animId = useRef<number | null>(null);

  useEffect(() => {
    // Get WebGL renderer string
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const rend = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          if (rend) {
            setRenderer(rend.length > 25 ? rend.substring(0, 25) + '...' : rend);
          }
        }
      }
    } catch {}

    const loop = () => {
      frameCount.current++;
      const now = performance.now();
      if (now - lastTime.current >= 1000) {
        setFps(Math.round((frameCount.current * 1000) / (now - lastTime.current)));
        frameCount.current = 0;
        lastTime.current = now;

        const perfMem = (performance as any).memory;
        if (perfMem) {
          const mb = Math.round(perfMem.usedJSHeapSize / (1024 * 1024));
          setMemHeap(`${mb} MB`);
        }
      }
      animId.current = requestAnimationFrame(loop);
    };

    animId.current = requestAnimationFrame(loop);
    return () => {
      if (animId.current) cancelAnimationFrame(animId.current);
    };
  }, []);

  if (!settings.fpsOverlayEnabled) return null;

  return (
    <div className="absolute top-3 right-3 z-50 pointer-events-none px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/15 text-white shadow-2xl flex items-center gap-3 font-mono text-[11px] select-none">
      <div className="flex items-center gap-1.5">
        <Gauge size={13} className={fps >= 55 ? 'text-emerald-400' : fps >= 30 ? 'text-amber-400' : 'text-rose-400'} />
        <span className={fps >= 55 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>{fps} FPS</span>
      </div>

      <div className="w-[1px] h-3 bg-white/20" />

      <div className="flex items-center gap-1 text-white/70">
        <Cpu size={12} className="text-purple-400" />
        <span>{memHeap}</span>
      </div>

      <div className="w-[1px] h-3 bg-white/20" />

      <span className="text-[10px] text-white/40 truncate max-w-[120px]">{renderer}</span>
    </div>
  );
};
