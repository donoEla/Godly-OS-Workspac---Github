import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play, Pause, Trash2, Download, Radio, Volume2 } from 'lucide-react';
import { sound } from '../../utils/sound';

interface AudioRecording {
  id: string;
  name: string;
  timestamp: number;
  duration: number;
  blob: Blob;
  audioUrl?: string;
}

export const VoiceMemosApp: React.FC = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordings, setRecordings] = useState<AudioRecording[]>([]);
  const [activePlaybackId, setActivePlaybackId] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [hasMicPermission, setHasMicPermission] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);

  // Initialize Microphone & Web Audio Analyser
  useEffect(() => {
    let active = true;

    async function initAudio() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!active) return;
        streamRef.current = stream;
        setHasMicPermission(true);

        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;

        drawWaveform();
      } catch (err) {
        console.warn('Microphone permission denied or unavailable:', err);
      }
    }

    initAudio();
    loadRecordingsFromDB();

    return () => {
      active = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
    };
  }, []);

  // IndexedDB Storage
  const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('godly_voice_memos', 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('recordings')) {
          db.createObjectStore('recordings', { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  };

  const loadRecordingsFromDB = async () => {
    try {
      const db = await openDB();
      const tx = db.transaction('recordings', 'readonly');
      const store = tx.objectStore('recordings');
      const req = store.getAll();
      req.onsuccess = () => {
        const items = req.result as Array<{ id: string; name: string; timestamp: number; duration: number; blob: Blob }>;
        const formatted = items.map((item) => ({
          ...item,
          audioUrl: URL.createObjectURL(item.blob),
        }));
        setRecordings(formatted);
      };
    } catch (e) {
      console.error('Failed loading voice memos from IDB', e);
    }
  };

  const saveRecordingToDB = async (rec: AudioRecording) => {
    try {
      const db = await openDB();
      const tx = db.transaction('recordings', 'readwrite');
      const store = tx.objectStore('recordings');
      store.put({
        id: rec.id,
        name: rec.name,
        timestamp: rec.timestamp,
        duration: rec.duration,
        blob: rec.blob,
      });
    } catch (e) {
      console.error('Failed saving recording', e);
    }
  };

  const deleteRecordingFromDB = async (id: string) => {
    try {
      const db = await openDB();
      const tx = db.transaction('recordings', 'readwrite');
      tx.objectStore('recordings').delete(id);
      setRecordings((prev) => prev.filter((r) => r.id !== id));
      sound.playClick();
    } catch (e) {
      console.error('Failed deleting recording', e);
    }
  };

  // Draw Dynamic Live Audio Waveform Canvas
  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2.2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.85;

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
        gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.85)');
        gradient.addColorStop(1, '#38bdf8');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
  };

  // Start Audio Recording
  const startRecording = () => {
    if (!streamRef.current) return;
    audioChunksRef.current = [];
    try {
      const mediaRecorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const newRec: AudioRecording = {
          id: `memo-${Date.now()}`,
          name: `Voice Memo ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          timestamp: Date.now(),
          duration: elapsedTime,
          blob,
          audioUrl: URL.createObjectURL(blob),
        };
        setRecordings((prev) => [newRec, ...prev]);
        saveRecordingToDB(newRec);
        sound.playNotification();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setElapsedTime(0);
      sound.playClick();

      timerRef.current = window.setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  // Stop Audio Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      sound.playClick();
    }
  };

  // Play / Pause Recording
  const togglePlayback = (rec: AudioRecording) => {
    if (activePlaybackId === rec.id) {
      audioElementRef.current?.pause();
      setActivePlaybackId(null);
    } else {
      if (audioElementRef.current) audioElementRef.current.pause();
      const audio = new Audio(rec.audioUrl);
      audioElementRef.current = audio;
      audio.onended = () => setActivePlaybackId(null);
      audio.play();
      setActivePlaybackId(rec.id);
      sound.playClick();
    }
  };

  const exportRecording = (rec: AudioRecording) => {
    const a = document.createElement('a');
    a.href = rec.audioUrl!;
    a.download = `${rec.name.replace(/\s+/g, '_')}.webm`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    sound.playClick();
  };

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="h-full w-full flex flex-col p-6 bg-black/60 text-white select-none backdrop-blur-2xl">
      {/* Waveform Card */}
      <div className="p-5 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center shadow-2xl relative overflow-hidden">
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Radio size={16} className={isRecording ? 'text-rose-500 animate-pulse' : 'text-purple-400'} />
            <span className="text-xs font-semibold tracking-wide text-white/80">
              {isRecording ? 'Capturing High-Fidelity Audio' : 'Acoustic Microphone Stream'}
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-purple-300">
            {formatSecs(elapsedTime)}
          </span>
        </div>

        {/* Live Visualizer Canvas */}
        <canvas
          ref={canvasRef}
          width={460}
          height={90}
          className="w-full h-24 rounded-2xl bg-black/40 border border-white/5"
        />

        {/* Controls */}
        <div className="mt-5 flex items-center gap-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold tracking-wide flex items-center gap-2 shadow-[0_0_25px_rgba(225,29,72,0.4)] transition-all active:scale-95"
            >
              <Mic size={16} />
              <span>Record Memo</span>
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="px-6 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold tracking-wide flex items-center gap-2 border border-white/20 transition-all active:scale-95"
            >
              <Square size={16} fill="currentColor" />
              <span>Stop & Save</span>
            </button>
          )}
        </div>
      </div>

      {/* Recordings List */}
      <div className="flex-1 mt-6 flex flex-col overflow-hidden">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3">Saved Audio Archives</h3>

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {recordings.length === 0 ? (
            <div className="text-center py-10 text-white/30 text-xs">No recordings stored yet. Press record to capture audio.</div>
          ) : (
            recordings.map((rec) => {
              const isPlaying = activePlaybackId === rec.id;
              return (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => togglePlayback(rec)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                        isPlaying ? 'bg-purple-600 text-white shadow-lg' : 'bg-white/10 hover:bg-white/20 text-white/80'
                      }`}
                    >
                      {isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
                    </button>
                    <div>
                      <div className="text-xs font-semibold text-white/90">{rec.name}</div>
                      <div className="text-[10px] text-white/40">
                        {new Date(rec.timestamp).toLocaleDateString()} • {formatSecs(rec.duration)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => exportRecording(rec)}
                      className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                      title="Export .webm audio"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      onClick={() => deleteRecordingFromDB(rec.id)}
                      className="p-2 rounded-xl hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
                      title="Delete recording"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
