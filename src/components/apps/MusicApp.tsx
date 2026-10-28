import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Music,
  Radio,
  ListMusic,
  Search,
  Sparkles,
  Disc,
  Heart,
  Plus,
  ExternalLink,
  Sliders,
  Check
} from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { sound } from '../../utils/sound';

export interface TrackItem {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  cover: string;
  streamUrl: string;
  genre: string;
}

export const CURATED_MUSIC_CATALOG: TrackItem[] = [
  {
    id: 'lofi-astral',
    title: 'Midnight Coffee & Starlight',
    artist: 'Lofi Celestial',
    album: 'Astral Chill Sessions',
    duration: 174,
    cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
    streamUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    genre: 'Lofi Chill'
  },
  {
    id: 'cyberpunk-overdrive',
    title: 'Neon Horizon 2099',
    artist: 'CyberMatrix',
    album: 'Megacity Syndicate',
    duration: 218,
    cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80',
    streamUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=cyberpunk-2099-10701.mp3',
    genre: 'Synthwave'
  },
  {
    id: 'gaming-arcade-hero',
    title: 'Level 99 Boss Fight',
    artist: 'Chiptune Brigade',
    album: '8-Bit Odyssey',
    duration: 156,
    cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=80',
    streamUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=retro-game-arcade-236130.mp3',
    genre: 'Chiptune'
  },
  {
    id: 'anime-shounen-rush',
    title: 'Limit Break Awakening',
    artist: 'Kenji Takahashi',
    album: 'Shounen Symphony',
    duration: 195,
    cover: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80',
    streamUrl: 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_c93a0a38b5.mp3?filename=action-rock-124673.mp3',
    genre: 'Anime OST'
  },
  {
    id: 'deep-ambient-void',
    title: 'Cosmic Drift & Nebula Meditation',
    artist: 'Astral Frequency',
    album: 'Ethereal Planes',
    duration: 242,
    cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80',
    streamUrl: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_9242967117.mp3?filename=space-ambient-meditation-10114.mp3',
    genre: 'Ambient'
  },
  {
    id: 'acoustic-sunset',
    title: 'Golden Hour Reflections',
    artist: 'Ember & Strings',
    album: 'Acoustic Sanctuary',
    duration: 168,
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    streamUrl: 'https://cdn.pixabay.com/download/audio/2022/01/26/audio_d0c6ff1e01.mp3?filename=acoustic-guitars-ambient-chill-10762.mp3',
    genre: 'Acoustic'
  }
];

export const MUSIC_STATIONS = [
  { id: 'all', name: 'All Tracks' },
  { id: 'lofi', name: 'Lofi Chill' },
  { id: 'synth', name: 'Synthwave' },
  { id: 'chiptune', name: 'Chiptune' },
  { id: 'anime', name: 'Anime OST' },
  { id: 'ambient', name: 'Ambient' },
  { id: 'acoustic', name: 'Acoustic' },
];

export const MusicApp: React.FC = () => {
  const { setNowPlaying } = useOS();
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(180);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [selectedStation, setSelectedStation] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [playlist, setPlaylist] = useState<TrackItem[]>(CURATED_MUSIC_CATALOG);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = playlist[currentTrackIndex] || CURATED_MUSIC_CATALOG[0];

  // Update OS Taskbar Now Playing State
  useEffect(() => {
    if (currentTrack) {
      setNowPlaying({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album,
        duration: currentTrack.duration,
        cover: currentTrack.cover,
        isPlaying: isPlaying,
        progress: duration > 0 ? (currentTime / duration) * 100 : 0,
      });
    }
  }, [currentTrack, isPlaying, currentTime, duration, setNowPlaying]);

  // Audio Playback Controller
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    sound.playClick();
    setIsPlaying(!isPlaying);
  };

  const playTrack = (index: number) => {
    sound.playClick();
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    setCurrentTime(0);
  };

  const handleNext = () => {
    sound.playClick();
    if (isShuffle) {
      const nextIndex = Math.floor(Math.random() * playlist.length);
      setCurrentTrackIndex(nextIndex);
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
    }
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    sound.playClick();
    if (currentTime > 4) {
      if (audioRef.current) audioRef.current.currentTime = 0;
      setCurrentTime(0);
    } else {
      setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
      setCurrentTime(0);
    }
    setIsPlaying(true);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const handleAddCustomStream = () => {
    if (!customUrlInput.trim()) return;
    sound.playSuccess();
    const newTrack: TrackItem = {
      id: `custom-${Date.now()}`,
      title: 'Custom Audio Stream',
      artist: 'Live Web Stream',
      album: 'Direct Audio Source',
      duration: 300,
      cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
      streamUrl: customUrlInput.trim(),
      genre: 'Custom'
    };
    setPlaylist([newTrack, ...playlist]);
    setCurrentTrackIndex(0);
    setIsPlaying(true);
    setCustomUrlInput('');
    setShowCustomInput(false);
  };

  const filteredPlaylist = useMemo(() => {
    return playlist.filter((t) => {
      if (selectedStation !== 'all') {
        if (!t.genre.toLowerCase().includes(selectedStation.toLowerCase())) return false;
      }
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q)
      );
    });
  }, [playlist, selectedStation, search]);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-[#080812] text-white select-none overflow-hidden font-sans">
      <audio
        ref={audioRef}
        src={currentTrack.streamUrl}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            if (audioRef.current.duration) {
              setDuration(audioRef.current.duration);
            }
          }
        }}
        onEnded={() => {
          if (isRepeat) {
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play();
            }
          } else {
            handleNext();
          }
        }}
      />

      {/* Left Main Player View */}
      <div className="flex-1 flex flex-col items-center justify-between p-6 sm:p-8 bg-gradient-to-b from-[#140b28]/60 via-[#0a0718]/80 to-[#070610] border-r border-white/10 overflow-y-auto custom-scrollbar">
        {/* Top App Header */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-purple-950/40 flex items-center justify-center">
              <div className="w-full h-full rounded-[10px] bg-[#0c0d18] flex items-center justify-center">
                <Music size={18} className="text-purple-400" />
              </div>
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight text-white flex items-center gap-2">
                Stratus Music <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">Hi-Fi Audio</span>
              </h2>
              <p className="text-[10px] text-white/50">Lossless streaming player &amp; curated radio channels</p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setShowCustomInput(!showCustomInput);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-white/80 hover:text-white transition-all"
          >
            <Plus size={13} /> Custom Stream
          </button>
        </div>

        {/* Custom Stream Input Modal Dropdown */}
        {showCustomInput && (
          <div className="w-full my-3 p-3 rounded-2xl bg-[#0f1122] border border-white/15 shadow-xl flex items-center gap-2">
            <input
              type="text"
              value={customUrlInput}
              onChange={(e) => setCustomUrlInput(e.target.value)}
              placeholder="Paste direct audio URL (e.g. .mp3, .m4a, or online radio stream)..."
              className="flex-1 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-white/40 outline-none focus:border-purple-500/60"
            />
            <button
              onClick={handleAddCustomStream}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition-all shrink-0"
            >
              Play Stream
            </button>
          </div>
        )}

        {/* Album Artwork Display */}
        <div className="my-auto py-6 flex flex-col items-center">
          <div className="relative group">
            {/* Ambient Glow */}
            <div
              className={`absolute -inset-4 rounded-3xl blur-2xl opacity-40 transition-all duration-700 ${
                isPlaying ? 'bg-gradient-to-tr from-pink-600 via-purple-600 to-indigo-600 scale-105' : 'bg-transparent'
              }`}
            />
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-3xl overflow-hidden border border-white/20 shadow-2xl shadow-black/80">
              <img
                src={currentTrack.cover}
                alt={currentTrack.title}
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  isPlaying ? 'scale-105' : 'scale-100'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>
          </div>

          {/* Track Meta Details */}
          <div className="text-center mt-6 max-w-sm">
            <h1 className="text-base sm:text-lg font-black text-white tracking-tight truncate">
              {currentTrack.title}
            </h1>
            <p className="text-xs text-purple-300 font-semibold mt-1 truncate">
              {currentTrack.artist}
            </p>
            <p className="text-[10px] text-white/40 font-mono mt-0.5 truncate">
              {currentTrack.album} • <span className="text-white/60">{currentTrack.genre}</span>
            </p>
          </div>
        </div>

        {/* Audio Scrubber & Controls */}
        <div className="w-full max-w-md flex flex-col gap-3">
          {/* Progress Slider */}
          <div className="w-full flex items-center gap-3">
            <span className="text-[10px] font-mono text-white/50 w-8 text-right">
              {formatSeconds(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500 outline-none"
            />
            <span className="text-[10px] font-mono text-white/50 w-8">
              {formatSeconds(duration)}
            </span>
          </div>

          {/* Playback Button Controls */}
          <div className="flex items-center justify-between px-4">
            <button
              onClick={() => {
                sound.playClick();
                setIsShuffle(!isShuffle);
              }}
              className={`p-2 rounded-xl transition-all ${
                isShuffle ? 'text-purple-400 bg-purple-500/20' : 'text-white/40 hover:text-white'
              }`}
              title="Shuffle"
            >
              <Shuffle size={16} />
            </button>

            <button
              onClick={handlePrev}
              className="p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.1] text-white transition-all"
              title="Previous"
            >
              <SkipBack size={18} />
            </button>

            <button
              onClick={togglePlay}
              className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white flex items-center justify-center shadow-xl shadow-purple-950/60 transform hover:scale-105 active:scale-95 transition-all"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={24} className="fill-white" /> : <Play size={24} className="fill-white ml-1" />}
            </button>

            <button
              onClick={handleNext}
              className="p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.1] text-white transition-all"
              title="Next"
            >
              <SkipForward size={18} />
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setIsRepeat(!isRepeat);
              }}
              className={`p-2 rounded-xl transition-all ${
                isRepeat ? 'text-purple-400 bg-purple-500/20' : 'text-white/40 hover:text-white'
              }`}
              title="Repeat"
            >
              <Repeat size={16} />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={() => {
                sound.playClick();
                setIsMuted(!isMuted);
              }}
              className="text-white/40 hover:text-white p-1"
            >
              {isMuted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(Number(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-28 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Right Playlist & Stations View */}
      <div className="w-full md:w-80 lg:w-96 flex flex-col bg-[#070814]/90 backdrop-blur-xl shrink-0 overflow-hidden">
        {/* Search & Stations Header */}
        <div className="p-4 border-b border-white/[0.08] space-y-3 shrink-0">
          <div className="relative w-full">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search playlist tracks & artists..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white/[0.04] border border-white/10 text-white placeholder-white/30 outline-none focus:border-purple-500/50"
            />
          </div>

          {/* Station Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 custom-scrollbar">
            {MUSIC_STATIONS.map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedStation(st.id);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all border ${
                  selectedStation === st.id
                    ? 'bg-purple-600 border-purple-400 text-white shadow-sm'
                    : 'bg-white/[0.03] border-white/10 text-white/60 hover:text-white'
                }`}
              >
                {st.name}
              </button>
            ))}
          </div>
        </div>

        {/* Playlist Queue Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
          <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase font-mono text-white/40 tracking-wider">
            <span>Track Queue ({filteredPlaylist.length})</span>
            <span>Duration</span>
          </div>

          {filteredPlaylist.map((track, idx) => {
            const isCurrent = currentTrack.id === track.id;

            return (
              <div
                key={track.id}
                onClick={() => playTrack(playlist.findIndex(t => t.id === track.id))}
                className={`group flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-purple-600/25 border-purple-400/50 text-white shadow-md shadow-purple-950/30'
                    : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/[0.05] text-white/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 truncate pr-2">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-black/40">
                    <img
                      src={track.cover}
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                    {isCurrent && isPlaying && (
                      <div className="absolute inset-0 bg-purple-950/60 flex items-center justify-center">
                        <div className="flex items-end gap-0.5 h-3">
                          <span className="w-0.5 bg-white animate-pulse h-3" />
                          <span className="w-0.5 bg-white animate-pulse h-2" />
                          <span className="w-0.5 bg-white animate-pulse h-3" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col truncate">
                    <span className="text-xs font-bold truncate group-hover:text-purple-300 transition-colors">
                      {track.title}
                    </span>
                    <span className="text-[10px] text-white/40 truncate">
                      {track.artist}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-white/40 shrink-0">
                  {formatSeconds(track.duration)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
