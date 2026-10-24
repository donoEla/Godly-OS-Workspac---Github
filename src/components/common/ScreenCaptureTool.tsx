import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { Camera, Video, Square, Download, X } from 'lucide-react';
import { sound } from '../../utils/sound';

export const ScreenCaptureTool: React.FC = () => {
  const [isSnipping, setIsSnipping] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordSecs, setRecordSecs] = useState<number>(0);

  const snipStart = useRef<{ x: number; y: number } | null>(null);
  const [snipRect, setSnipRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Listen for global screenshot or record triggers
  useEffect(() => {
    const handleSnipTrigger = () => {
      setIsSnipping(true);
      sound.playClick();
    };
    window.addEventListener('godly-start-snip', handleSnipTrigger);
    return () => window.removeEventListener('godly-start-snip', handleSnipTrigger);
  }, []);

  // Snip selection mouse down
  const handleMouseDown = (e: React.MouseEvent) => {
    snipStart.current = { x: e.clientX, y: e.clientY };
    setSnipRect({ x: e.clientX, y: e.clientY, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!snipStart.current) return;
    const x = Math.min(snipStart.current.x, e.clientX);
    const y = Math.min(snipStart.current.y, e.clientY);
    const width = Math.abs(e.clientX - snipStart.current.x);
    const height = Math.abs(e.clientY - snipStart.current.y);
    setSnipRect({ x, y, width, height });
  };

  const handleMouseUp = async () => {
    if (!snipRect || snipRect.width < 10 || snipRect.height < 10) {
      setIsSnipping(false);
      snipStart.current = null;
      setSnipRect(null);
      return;
    }

    const { x, y, width, height } = snipRect;
    setIsSnipping(false);
    snipStart.current = null;
    setSnipRect(null);

    sound.playSnap();

    try {
      const rootEl = document.getElementById('root') || document.body;
      const canvas = await html2canvas(rootEl, {
        x,
        y,
        width,
        height,
        useCORS: true,
        allowTaint: true,
      });

      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `godly_screenshot_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Screenshot capture failed', err);
    }
  };

  // Screen Recording via getDisplayMedia
  const startScreenRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser' } as any,
        audio: true,
      });

      recordedChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `godly_recording_${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
        stream.getTracks().forEach((track) => track.stop());
        sound.playNotification();
      };

      stream.getVideoTracks()[0].onended = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordSecs(0);
      sound.playClick();

      timerRef.current = window.setInterval(() => {
        setRecordSecs((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.warn('Screen recording cancelled or failed', err);
    }
  };

  const stopScreenRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      sound.playClick();
    }
  };

  const formatSecs = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <>
      {/* Active Screen Recording Live Floating Pill */}
      {isRecording && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[99999] px-4 py-2 rounded-2xl bg-black/80 backdrop-blur-xl border border-rose-500/50 shadow-2xl flex items-center gap-3 select-none">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <span className="text-xs font-mono font-bold text-white">REC {formatSecs(recordSecs)}</span>
          <button
            onClick={stopScreenRecording}
            className="px-2.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold flex items-center gap-1 transition-all active:scale-95 shadow-md"
          >
            <Square size={10} fill="currentColor" />
            <span>Stop & Save</span>
          </button>
        </div>
      )}

      {/* Snipping Tool Overlay */}
      {isSnipping && (
        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="fixed inset-0 z-[99999] bg-black/55 cursor-crosshair select-none"
        >
          {snipRect && (
            <div
              className="absolute border-2 border-purple-400 bg-purple-500/15 backdrop-blur-[1px] shadow-[0_0_25px_rgba(168,85,247,0.5)]"
              style={{
                left: snipRect.x,
                top: snipRect.y,
                width: snipRect.width,
                height: snipRect.height,
              }}
            >
              <div className="absolute top-1 left-2 text-[10px] font-mono text-purple-200 bg-black/70 px-1.5 py-0.5 rounded">
                {Math.round(snipRect.width)} × {Math.round(snipRect.height)}
              </div>
            </div>
          )}

          <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-black/80 border border-white/20 text-white text-xs font-medium backdrop-blur-md pointer-events-none shadow-2xl">
            Drag to define region. Release to capture. Press Esc to cancel.
          </div>
        </div>
      )}
    </>
  );
};
