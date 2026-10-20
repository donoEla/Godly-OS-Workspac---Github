import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Repeat, 
  Shuffle, 
  Heart, 
  ListMusic, 
  Sparkles, 
  Radio,
  Sliders,
  Search,
  Music2,
  Mic2,
  Disc3,
  Clock,
  Zap,
  Globe,
  Headphones,
  RotateCcw
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { useOS } from '../../context/OSContext';
import { ServiceWorkerAppView } from '../common/ServiceWorkerAppView';
import { getAssetUrl } from '../../utils/assetHelper';

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  cover: string;
  genre: string;
  frequencies: number[]; // chord progression for synth audio
  lyrics: string[];
}

const PLAYLIST: Track[] = [
  {
    id: 'track-1',
    title: 'Divine Astral Resonance',
    artist: 'Godly OS Ensemble',
    album: 'Ascension Vol. 1',
    duration: 184,
    cover: getAssetUrl('assets/backgrounds/kali-ferrofluid-1298846866.jpg'),
    genre: 'Ambient Synth',
    frequencies: [220, 277.18, 329.63, 440],
    lyrics: [
      'Entering the divine void of cyberspace...',
      'Harmonics resonate through the silicon ether',
      'Whispers of ferrofluid rising in the dark',
      'A digital cosmos awakening in harmony',
      'Ascension through frequencies unseen',
      'The godly journey begins now'
    ],
  },
  {
    id: 'track-2',
    title: 'Supernova Horizon',
    artist: 'Celestial Echoes',
    album: 'Starlight Dreamer',
    duration: 210,
    cover: getAssetUrl('assets/backgrounds/wp4906049-566896159.jpg'),
    genre: 'Synthwave',
    frequencies: [261.63, 329.63, 392.00, 523.25],
    lyrics: [
      'Neon flares across the dark abyss',
      'Speeds exceeding the speed of thought',
      'Glow of purple horizons shining ahead',
      'Cruising down the endless highway',
      'Lost inside the supernova glow',
      'Never fading into the night'
    ],
  },
  {
    id: 'track-3',
    title: 'Midnight Ferrofluid',
    artist: 'Void Walker',
    album: 'Deep Frequency',
    duration: 165,
    cover: getAssetUrl('assets/backgrounds/Cr2viQw-255237102.jpg'),
    genre: 'Cyber Lo-Fi',
    frequencies: [174.61, 220.00, 261.63, 349.23],
    lyrics: [
      'Low frequencies hum through the rainy night',
      'Coffee brewing by the terminal screen',
      'Subtle drops tap against frosted glass',
      'Smooth beats keeping the mind serene',
      'Night owls drifting in deep flow',
      'Code and thoughts aligning as one'
    ],
  },
  {
    id: 'track-4',
    title: 'Neon Nebula Odyssey',
    artist: 'Prism Velocity',
    album: 'Hyperlight 2049',
    duration: 198,
    cover: getAssetUrl('assets/backgrounds/KwLOdlh-2592565610.jpg'),
    genre: 'Retrowave',
    frequencies: [329.63, 415.30, 493.88, 659.25],
    lyrics: [
      'Beams of starlight through the visor',
      'Zero gravity pulse in our veins',
      'Distant galaxies calling out names',
      'Synths ignite the engine flares',
      'Rushing into the neon sea',
      'Boundless, weightless, wild and free'
    ],
  },
  {
    id: 'track-5',
    title: 'Quantum Cathedral',
    artist: 'Antigravity Architect',
    album: 'Singularity Hymns',
    duration: 240,
    cover: getAssetUrl('assets/backgrounds/50694-1188339185.jpg'),
    genre: 'Chamber Ambient',
    frequencies: [196.00, 246.94, 293.66, 392.00],
    lyrics: [
      'Pillars of quantum logic rise high',
      'Cathedrals forged in pure light and code',
      'Echoes of prayers to the silicon sky',
      'Where dreams and realities erode',
      'Forever standing in divine grace',
      'Sanctuary in the infinite space'
    ],
  },
];

type AppMode = 'nowgg' | 'octave' | 'synth';
type VisualizerMode = 'bars' | 'wave' | 'aura';

export const SpotifyApp: React.FC = () => {
  const { setNowPlaying } = useOS();

  // Mode: Default to nowgg.fun Spotify page via Ultraviolet proxy
  const [appMode, setAppMode] = useState<AppMode>('nowgg');

  // Synth state
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [likedTrackIds, setLikedTrackIds] = useState<string[]>(['track-1', 'track-2']);
  const [synthTab, setSynthTab] = useState<'player' | 'lyrics' | 'queue'>('player');
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>('bars');
  const [searchFilter, setSearchFilter] = useState('');

  // Web Audio Synthesizer Engine
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const currentTrack = PLAYLIST[currentTrackIdx];
  const isLiked = likedTrackIds.includes(currentTrack.id);

  // Initialize Web Audio Synth
  useEffect(() => {
    return () => {
      stopSynthAudio();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const ensureAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const master = ctx.createGain();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      master.gain.value = volume;
      master.connect(analyser);
      analyser.connect(ctx.destination);
      audioCtxRef.current = ctx;
      masterGainRef.current = master;
      analyserRef.current = analyser;
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const startSynthAudio = () => {
    ensureAudioContext();
    stopSynthAudio();

    const ctx = audioCtxRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master) return;

    const oscs: OscillatorNode[] = [];
    currentTrack.frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = idx === 0 ? 'sine' : idx === 1 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.2 + idx * 0.15;
      lfoGain.gain.value = 1.5;
      lfo.connect(osc.frequency);
      lfo.start();

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12 / (idx + 1), ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(master);
      osc.start();
      oscs.push(osc);
    });

    oscillatorsRef.current = oscs;
  };

  const stopSynthAudio = () => {
    oscillatorsRef.current.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    oscillatorsRef.current = [];
  };

  const togglePlay = () => {
    sound.playClick();
    if (isPlaying) {
      stopSynthAudio();
      setIsPlaying(false);
    } else {
      startSynthAudio();
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    sound.playClick();
    stopSynthAudio();
    let nextIdx = (currentTrackIdx + 1) % PLAYLIST.length;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * PLAYLIST.length);
    }
    setCurrentTrackIdx(nextIdx);
    setCurrentTime(0);
    if (isPlaying) {
      setTimeout(startSynthAudio, 50);
    }
  };

  const handlePrev = () => {
    sound.playClick();
    stopSynthAudio();
    const prevIdx = (currentTrackIdx - 1 + PLAYLIST.length) % PLAYLIST.length;
    setCurrentTrackIdx(prevIdx);
    setCurrentTime(0);
    if (isPlaying) {
      setTimeout(startSynthAudio, 50);
    }
  };

  const toggleLike = () => {
    sound.playClick();
    if (isLiked) {
      setLikedTrackIds((prev) => prev.filter((id) => id !== currentTrack.id));
    } else {
      setLikedTrackIds((prev) => [...prev, currentTrack.id]);
    }
  };

  // Sync to global OS nowPlaying for MediaPill island
  useEffect(() => {
    setNowPlaying({
      title: currentTrack.title,
      artist: currentTrack.artist,
      album: currentTrack.album,
      duration: currentTrack.duration,
      cover: currentTrack.cover,
      isPlaying,
      progress: Math.floor((currentTime / currentTrack.duration) * 100),
    });
  }, [currentTrack, isPlaying, currentTime, setNowPlaying]);

  // Track playback time ticker
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= currentTrack.duration) {
          if (isRepeat) return 0;
          handleNext();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack.duration, isRepeat]);

  // Master volume change
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(
        isMuted ? 0 : volume,
        audioCtxRef.current.currentTime
      );
    }
  }, [volume, isMuted]);

  // Spectrum visualizer animation
  useEffect(() => {
    if (appMode !== 'synth' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      if (analyserRef.current && isPlaying) {
        const bufferLen = analyserRef.current.frequencyBinCount;
        const dataArr = new Uint8Array(bufferLen);
        analyserRef.current.getByteFrequencyData(dataArr);

        if (visualizerMode === 'bars') {
          const barWidth = (w / bufferLen) * 2.2;
          let x = 0;
          for (let i = 0; i < bufferLen; i++) {
            const barHeight = (dataArr[i] / 255) * h * 0.85;
            const grad = ctx.createLinearGradient(0, h, 0, h - barHeight);
            grad.addColorStop(0, '#10b981');
            grad.addColorStop(0.6, '#38bdf8');
            grad.addColorStop(1, '#a855f7');
            ctx.fillStyle = grad;
            ctx.fillRect(x, h - barHeight, barWidth - 2, barHeight);
            x += barWidth;
          }
        } else if (visualizerMode === 'wave') {
          ctx.beginPath();
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = '#38bdf8';
          const sliceWidth = w / bufferLen;
          let x = 0;
          for (let i = 0; i < bufferLen; i++) {
            const v = dataArr[i] / 128.0;
            const y = (v * h) / 2;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            x += sliceWidth;
          }
          ctx.stroke();
        } else {
          // Aura
          const cx = w / 2;
          const cy = h / 2;
          const avg = dataArr.reduce((a, b) => a + b, 0) / bufferLen;
          const radius = (avg / 255) * (h / 2.2);
          const radGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, radius + 20);
          radGrad.addColorStop(0, 'rgba(168, 85, 247, 0.8)');
          radGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.4)');
          radGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = radGrad;
          ctx.beginPath();
          ctx.arc(cx, cy, radius + 20, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Idle ambient line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();
      }

      animFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrame);
  }, [appMode, isPlaying, visualizerMode]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const filteredPlaylist = PLAYLIST.filter(
    (t) =>
      t.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.genre.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full w-full bg-[var(--window-glass)] backdrop-blur-2xl text-slate-100 select-none overflow-hidden font-sans">
      {/* Top Glass Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-black/40 backdrop-blur-xl border-b border-white/10 flex-shrink-0 z-20 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        {/* Left Branding */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 border border-white/20">
            <Radio size={16} className="text-black stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-white font-mono uppercase">Spotify Music</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                SW Tunnel Active
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Proxied Cloud Player & Bespoke Audio Engine</span>
          </div>
        </div>

        {/* Center / Right Mode Selector Switcher */}
        <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-2xl border border-white/10 shadow-inner">
          <button
            onClick={() => {
              sound.playClick();
              setAppMode('nowgg');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              appMode === 'nowgg'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/30 border border-white/20'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Globe size={13} />
            <span>nowgg.fun Spotify</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setAppMode('octave');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              appMode === 'octave'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-600/30 border border-white/20'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Zap size={13} className="text-amber-400" />
            <span>Octave Streaming</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setAppMode('synth');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              appMode === 'synth'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold shadow-md shadow-teal-600/30 border border-white/20'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Headphones size={13} />
            <span>Offline Synth</span>
          </button>
        </div>
      </div>

      {/* Main View Body */}
      <div className="flex-1 relative overflow-hidden bg-black/30">
        {/* Mode 1: nowgg.fun Spotify Cloud Page via Ultraviolet SW Proxy */}
        {appMode === 'nowgg' && (
          <ServiceWorkerAppView
            url="https://nowgg.fun/apps/spotify-ab/3947/spotify-music-and-podcasts.html"
            appName="Spotify (nowgg.fun)"
            fallbackUrl="https://octavestreaming.com/"
            fallbackName="Octave Streaming"
            onFallback={() => setAppMode('octave')}
          />
        )}

        {/* Mode 2: Octave Streaming (Fallback / Alternative requested by user) */}
        {appMode === 'octave' && (
          <ServiceWorkerAppView
            url="https://octavestreaming.com/"
            appName="Octave Streaming"
            fallbackUrl="https://nowgg.fun/apps/spotify-ab/3947/spotify-music-and-podcasts.html"
            fallbackName="nowgg Spotify"
            onFallback={() => setAppMode('nowgg')}
          />
        )}

        {/* Mode 3: Offline Synth Studio with Spectrum Visualizer */}
        {appMode === 'synth' && (
          <div className="flex flex-col h-full w-full">
            {/* Synth Subheader Tabs */}
            <div className="flex items-center justify-between px-5 py-2 bg-white/[0.03] backdrop-blur-md border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300 font-mono">Bespoke Synth Studio</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
                  Realtime Audio Nodes
                </span>
              </div>
              <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 text-xs shadow-inner">
                <button
                  onClick={() => setSynthTab('player')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    synthTab === 'player' ? 'bg-white/15 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Studio
                </button>
                <button
                  onClick={() => setSynthTab('lyrics')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    synthTab === 'lyrics' ? 'bg-white/15 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Lyrics
                </button>
                <button
                  onClick={() => setSynthTab('queue')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    synthTab === 'queue' ? 'bg-white/15 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Queue
                </button>
              </div>
            </div>

            {/* Main Synth Body */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-y-auto">
                {synthTab === 'player' && (
                  <>
                    {/* Audio Spectrum Visualizer */}
                    <div className="w-full max-w-md h-24 mb-5 rounded-3xl overflow-hidden bg-black/60 p-2.5 border border-white/15 shadow-2xl relative flex flex-col justify-end backdrop-blur-xl">
                      <canvas ref={canvasRef} width={420} height={80} className="w-full h-full block" />
                      <div className="absolute top-2.5 right-3 flex gap-1.5">
                        {(['bars', 'wave', 'aura'] as VisualizerMode[]).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setVisualizerMode(mode)}
                            className={`px-2 py-0.5 text-[9px] rounded-lg uppercase font-mono font-bold transition-all ${
                              visualizerMode === mode
                                ? 'bg-emerald-500 text-black shadow-md'
                                : 'bg-white/10 text-slate-400 hover:text-white'
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Album Cover & Rotating Vinyl Disc */}
                    <div className="relative group w-44 h-44 md:w-52 md:h-52 mb-4">
                      <div
                        className={`absolute -right-6 top-1/2 -translate-y-1/2 w-40 h-40 md:w-48 md:h-48 rounded-full bg-zinc-950 border-4 border-zinc-900 shadow-2xl flex items-center justify-center transition-transform duration-500 ${
                          isPlaying ? 'animate-[spin_4s_linear_infinite] translate-x-8' : 'translate-x-0'
                        }`}
                        style={{
                          background: 'radial-gradient(circle, #1a1a1a 20%, #0d0d0d 40%, #262626 60%, #000 80%)',
                        }}
                      >
                        <div className="w-14 h-14 rounded-full border-2 border-emerald-500/40 bg-zinc-900 flex items-center justify-center">
                          <div className="w-4 h-4 rounded-full bg-black border border-white/20" />
                        </div>
                      </div>

                      <div className="relative z-10 w-full h-full rounded-3xl overflow-hidden border border-white/20 shadow-2xl shadow-black/90">
                        <img src={getAssetUrl(currentTrack.cover)} alt={currentTrack.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </div>
                    </div>

                    {/* Track Info */}
                    <div className="text-center mb-4 max-w-sm">
                      <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">{currentTrack.title}</h2>
                      <p className="text-xs text-slate-300 font-medium">{currentTrack.artist} • {currentTrack.album}</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full max-w-md flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                      <span>{formatTime(currentTime)}</span>
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden relative group cursor-pointer">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                          style={{ width: `${(currentTime / currentTrack.duration) * 100}%` }}
                        />
                      </div>
                      <span>{formatTime(currentTrack.duration)}</span>
                    </div>

                    {/* Primary Controls */}
                    <div className="flex items-center gap-6 mt-4">
                      <button
                        onClick={() => setIsShuffle(!isShuffle)}
                        className={`transition-colors ${isShuffle ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}`}
                      >
                        <Shuffle size={18} />
                      </button>
                      <button onClick={handlePrev} className="text-slate-200 hover:text-white active:scale-95 transition-transform">
                        <SkipBack size={22} />
                      </button>
                      <button
                        onClick={togglePlay}
                        className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shadow-lg shadow-emerald-500/30 active:scale-95 transition-all"
                      >
                        {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
                      </button>
                      <button onClick={handleNext} className="text-slate-200 hover:text-white active:scale-95 transition-transform">
                        <SkipForward size={22} />
                      </button>
                      <button
                        onClick={() => setIsRepeat(!isRepeat)}
                        className={`transition-colors ${isRepeat ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}`}
                      >
                        <Repeat size={18} />
                      </button>
                    </div>
                  </>
                )}

                {synthTab === 'lyrics' && (
                  <div className="w-full max-w-lg h-full overflow-y-auto space-y-4 p-4 text-center">
                    <h3 className="text-sm font-bold text-emerald-400 font-mono uppercase tracking-wider mb-4">
                      Synchronized Astral Lyrics
                    </h3>
                    {currentTrack.lyrics.map((line, idx) => (
                      <p
                        key={idx}
                        className={`text-base md:text-lg transition-all duration-300 ${
                          idx === Math.floor((currentTime / currentTrack.duration) * currentTrack.lyrics.length)
                            ? 'text-white font-bold scale-105 drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]'
                            : 'text-slate-500'
                        }`}
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                )}

                {synthTab === 'queue' && (
                  <div className="w-full max-w-lg h-full overflow-y-auto space-y-2 p-4">
                    <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-3">
                      Upcoming Tracks
                    </h3>
                    {PLAYLIST.map((track, idx) => (
                      <div
                        key={track.id}
                        onClick={() => {
                          setCurrentTrackIdx(idx);
                          setCurrentTime(0);
                        }}
                        className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                          idx === currentTrackIdx
                            ? 'bg-emerald-500/20 border border-emerald-500/40 text-white font-semibold'
                            : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img src={getAssetUrl(track.cover)} alt="" className="w-10 h-10 rounded-xl object-cover" />
                          <div>
                            <div className="text-xs text-white">{track.title}</div>
                            <div className="text-[10px] text-slate-400">{track.artist}</div>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-slate-400">{formatTime(track.duration)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Playlist Sidebar */}
              <div className="w-full md:w-72 bg-black/40 backdrop-blur-2xl border-t md:border-t-0 md:border-l border-white/10 flex flex-col p-3 shadow-inner">
                <div className="flex items-center gap-2 px-2 py-1.5 bg-black/50 rounded-xl border border-white/10 mb-3">
                  <Search size={14} className="text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search synth library..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full bg-transparent text-xs text-slate-200 outline-none placeholder-slate-500 font-mono"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                  {filteredPlaylist.map((t, idx) => {
                    const active = PLAYLIST.indexOf(t) === currentTrackIdx;
                    return (
                      <div
                        key={t.id}
                        onClick={() => {
                          sound.playClick();
                          setCurrentTrackIdx(PLAYLIST.indexOf(t));
                          setCurrentTime(0);
                          if (isPlaying) setTimeout(startSynthAudio, 50);
                        }}
                        className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-all ${
                          active
                            ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 text-white font-semibold shadow-sm'
                            : 'hover:bg-white/[0.06] text-slate-300 border border-transparent'
                        }`}
                      >
                        <img src={getAssetUrl(t.cover)} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs truncate">{t.title}</div>
                          <div className="text-[10px] text-slate-400 truncate">{t.artist}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
