import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
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
  Search,
  Sparkles,
  Disc,
  Heart,
  Plus,
  ExternalLink,
  Sliders,
  Check,
  Flame,
  Globe,
  Headphones,
  Settings,
  Layers,
  X,
  RefreshCw,
  Loader2,
  ListMusic,
  ShieldCheck,
  Zap,
  Info,
  Library,
  Home,
  Compass,
  FolderPlus,
  Trash2,
  Clock,
  User,
  ListPlus,
  Maximize2,
  Minimize2,
  Share2,
  SlidersHorizontal,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { sound } from '../../utils/sound';

export type MusicSourceType = 'tidal' | 'ytm' | 'hifi' | 'radio' | 'custom';

export interface TrackItem {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  album: string;
  albumId?: string;
  duration: number; // seconds
  cover: string;
  streamUrl: string;
  genre: string;
  source: MusicSourceType;
  qualityBadge: string;
  releaseYear?: number;
  isLossless?: boolean;
  plays?: number;
}

export interface PlaylistFolder {
  id: string;
  name: string;
  description: string;
  cover: string;
  tracks: TrackItem[];
  isCustom?: boolean;
}

export interface AlbumItem {
  id: string;
  title: string;
  artist: string;
  cover: string;
  year: number;
  genre: string;
  tracks: TrackItem[];
}

export interface ArtistItem {
  id: string;
  name: string;
  picture: string;
  monthlyListeners: string;
  bio: string;
  popularTracks: TrackItem[];
}

// Built-in Tidal & HiFi Community Mirrors
export const DEFAULT_HIFI_MIRRORS: string[] = [
  'https://hifi.geeked.wtf',
  'https://eu-central.monochrome.tf',
  'https://us-west.monochrome.tf',
  'https://api.monochrome.tf',
  'https://maus.qqdl.site',
  'https://vogel.qqdl.site',
  'https://katze.qqdl.site',
  'https://hund.qqdl.site',
  'https://monochrome-api.samidy.com',
  'https://tidal.kinoplus.online',
  'https://wolf.qqdl.site'
];

// Rich Library Master Tracks Catalog (Kendrick, The Weeknd, Daft Punk, Billie Eilish, etc.)
export const MASTER_TRACKS_CATALOG: TrackItem[] = [
  {
    id: 'track-not-like-us',
    title: 'Not Like Us',
    artist: 'Kendrick Lamar',
    artistId: 'artist-kendrick',
    album: 'GNX',
    albumId: 'album-gnx',
    duration: 274,
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=640&auto=format&fit=crop&q=80',
    streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3',
    genre: 'Hip-Hop',
    source: 'tidal',
    qualityBadge: 'FLAC Lossless',
    releaseYear: 2024,
    isLossless: true,
    plays: 1420500
  },
  {
    id: 'track-luther',
    title: 'luther (feat. SZA)',
    artist: 'Kendrick Lamar',
    artistId: 'artist-kendrick',
    album: 'GNX',
    albumId: 'album-gnx',
    duration: 178,
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=640&auto=format&fit=crop&q=80',
    streamUrl: 'https://ice1.somafm.com/poptron-128-mp3',
    genre: 'Hip-Hop',
    source: 'hifi',
    qualityBadge: 'Hi-Res 24-bit',
    releaseYear: 2024,
    isLossless: true,
    plays: 980200
  },
  {
    id: 'track-blinding-lights',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    artistId: 'artist-the-weeknd',
    album: 'After Hours',
    albumId: 'album-after-hours',
    duration: 200,
    cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=640&auto=format&fit=crop&q=80',
    streamUrl: 'https://ice2.somafm.com/defcon-128-mp3',
    genre: 'Synthwave',
    source: 'hifi',
    qualityBadge: 'Hi-Res 24-bit',
    releaseYear: 2020,
    isLossless: true,
    plays: 3890000
  },
  {
    id: 'track-save-your-tears',
    title: 'Save Your Tears',
    artist: 'The Weeknd',
    artistId: 'artist-the-weeknd',
    album: 'After Hours',
    albumId: 'album-after-hours',
    duration: 215,
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=640&auto=format&fit=crop&q=80',
    streamUrl: 'https://ice1.somafm.com/vaporwaves-128-mp3',
    genre: 'Synthpop',
    source: 'tidal',
    qualityBadge: 'FLAC Lossless',
    releaseYear: 2020,
    isLossless: true,
    plays: 2450000
  },
  {
    id: 'track-get-lucky',
    title: 'Get Lucky (feat. Pharrell Williams)',
    artist: 'Daft Punk',
    artistId: 'artist-daft-punk',
    album: 'Random Access Memories',
    albumId: 'album-ram',
    duration: 369,
    cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=640&auto=format&fit=crop&q=80',
    streamUrl: 'https://ice1.somafm.com/vaporwaves-128-mp3',
    genre: 'Electronic',
    source: 'tidal',
    qualityBadge: 'Master MQA',
    releaseYear: 2013,
    isLossless: true,
    plays: 2100000
  },
  {
    id: 'track-instant-crush',
    title: 'Instant Crush (feat. Julian Casablancas)',
    artist: 'Daft Punk',
    artistId: 'artist-daft-punk',
    album: 'Random Access Memories',
    albumId: 'album-ram',
    duration: 337,
    cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=640&auto=format&fit=crop&q=80',
    streamUrl: 'https://ice6.somafm.com/synphaera-128-mp3',
    genre: 'Electronic',
    source: 'hifi',
    qualityBadge: 'FLAC Lossless',
    releaseYear: 2013,
    isLossless: true,
    plays: 1650000
  },
  {
    id: 'track-birds-of-a-feather',
    title: 'BIRDS OF A FEATHER',
    artist: 'Billie Eilish',
    artistId: 'artist-billie',
    album: 'HIT ME HARD AND SOFT',
    albumId: 'album-hmhas',
    duration: 196,
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=640&auto=format&fit=crop&q=80',
    streamUrl: 'https://ice6.somafm.com/synphaera-128-mp3',
    genre: 'Alternative',
    source: 'hifi',
    qualityBadge: 'FLAC Lossless',
    releaseYear: 2024,
    isLossless: true,
    plays: 1890000
  },
  {
    id: 'track-midnight-city',
    title: 'Midnight City',
    artist: 'M83',
    artistId: 'artist-m83',
    album: 'Hurry Up, We\'re Dreaming',
    albumId: 'album-m83',
    duration: 243,
    cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=640&auto=format&fit=crop&q=80',
    streamUrl: 'https://ice1.somafm.com/poptron-128-mp3',
    genre: 'Synthpop',
    source: 'hifi',
    qualityBadge: 'FLAC Lossless',
    releaseYear: 2011,
    isLossless: true,
    plays: 1350000
  },
  {
    id: 'track-time-inception',
    title: 'Time',
    artist: 'Hans Zimmer',
    artistId: 'artist-hans-zimmer',
    album: 'Inception (Original Soundtrack)',
    albumId: 'album-inception',
    duration: 275,
    cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=640&auto=format&fit=crop&q=80',
    streamUrl: 'https://ice4.somafm.com/dronezone-128-mp3',
    genre: 'Cinematic',
    source: 'tidal',
    qualityBadge: 'Hi-Res 96kHz',
    releaseYear: 2010,
    isLossless: true,
    plays: 1720000
  },
  {
    id: 'track-lofi-groove',
    title: 'Groove Salad: Ambient Beats',
    artist: 'SomaFM Syndicate',
    album: 'San Francisco Sessions',
    duration: 3600,
    cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=640&auto=format&fit=crop&q=80',
    streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3',
    genre: 'Lo-Fi Chill',
    source: 'radio',
    qualityBadge: 'Live 128k',
    releaseYear: 2026,
    plays: 430000
  },
  {
    id: 'track-defcon-radio',
    title: 'DEF CON Cyber Syndicate',
    artist: 'DEF CON Broadcast',
    album: 'Las Vegas Relay',
    duration: 3600,
    cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=640&auto=format&fit=crop&q=80',
    streamUrl: 'https://ice2.somafm.com/defcon-128-mp3',
    genre: 'Synthwave',
    source: 'radio',
    qualityBadge: 'Live 128k',
    releaseYear: 2026,
    plays: 380000
  }
];

// Curated Spotify / YTM Albums
export const CURATED_ALBUMS: AlbumItem[] = [
  {
    id: 'album-gnx',
    title: 'GNX',
    artist: 'Kendrick Lamar',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=640&auto=format&fit=crop&q=80',
    year: 2024,
    genre: 'Hip-Hop',
    tracks: [
      MASTER_TRACKS_CATALOG[0],
      MASTER_TRACKS_CATALOG[1]
    ]
  },
  {
    id: 'album-after-hours',
    title: 'After Hours',
    artist: 'The Weeknd',
    cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=640&auto=format&fit=crop&q=80',
    year: 2020,
    genre: 'Synthwave / R&B',
    tracks: [
      MASTER_TRACKS_CATALOG[2],
      MASTER_TRACKS_CATALOG[3]
    ]
  },
  {
    id: 'album-ram',
    title: 'Random Access Memories',
    artist: 'Daft Punk',
    cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=640&auto=format&fit=crop&q=80',
    year: 2013,
    genre: 'Electronic / Funk',
    tracks: [
      MASTER_TRACKS_CATALOG[4],
      MASTER_TRACKS_CATALOG[5]
    ]
  }
];

// Curated Artists
export const CURATED_ARTISTS: ArtistItem[] = [
  {
    id: 'artist-kendrick',
    name: 'Kendrick Lamar',
    picture: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=640&auto=format&fit=crop&q=80',
    monthlyListeners: '74,210,800 monthly listeners',
    bio: 'Pulitzer Prize-winning hip-hop artist from Compton, California.',
    popularTracks: [MASTER_TRACKS_CATALOG[0], MASTER_TRACKS_CATALOG[1]]
  },
  {
    id: 'artist-the-weeknd',
    name: 'The Weeknd',
    picture: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=640&auto=format&fit=crop&q=80',
    monthlyListeners: '112,500,000 monthly listeners',
    bio: 'Canadian singer, songwriter, and record producer known for sonic versatility and dark lyricism.',
    popularTracks: [MASTER_TRACKS_CATALOG[2], MASTER_TRACKS_CATALOG[3]]
  },
  {
    id: 'artist-daft-punk',
    name: 'Daft Punk',
    picture: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=640&auto=format&fit=crop&q=80',
    monthlyListeners: '23,100,000 monthly listeners',
    bio: 'Legendary French electronic music duo formed in 1993 in Paris.',
    popularTracks: [MASTER_TRACKS_CATALOG[4], MASTER_TRACKS_CATALOG[5]]
  }
];

export const GENRE_CARDS = [
  { id: 'hip-hop', name: 'Hip-Hop', color: 'from-orange-600 to-amber-700' },
  { id: 'synthwave', name: 'Synthwave', color: 'from-purple-600 to-pink-600' },
  { id: 'electronic', name: 'Electronic', color: 'from-cyan-600 to-blue-700' },
  { id: 'lo-fi', name: 'Lo-Fi Chill', color: 'from-emerald-600 to-teal-800' },
  { id: 'pop', name: 'Pop Hits', color: 'from-pink-500 to-rose-600' },
  { id: 'rock', name: 'Rock & Indie', color: 'from-red-600 to-amber-900' },
  { id: 'ambient', name: 'Ambient & Space', color: 'from-indigo-600 to-violet-900' },
  { id: 'cinematic', name: 'Cinematic OST', color: 'from-amber-600 to-yellow-700' }
];

export const MusicApp: React.FC = () => {
  const { setNowPlaying } = useOS();

  // Navigation state
  const [activeView, setActiveView] = useState<'home' | 'search' | 'library' | 'album' | 'artist' | 'playlist'>('home');
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumItem | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<ArtistItem | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<PlaylistFolder | null>(null);

  // Playback & Queue State
  const [queue, setQueue] = useState<TrackItem[]>(MASTER_TRACKS_CATALOG);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(274);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<'off' | 'all' | 'one'>('off');

  // Library & Saved State
  const [likedTrackIds, setLikedTrackIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('godly_music_liked');
      return saved ? JSON.parse(saved) : ['track-not-like-us', 'track-blinding-lights', 'track-get-lucky'];
    } catch {
      return ['track-not-like-us', 'track-blinding-lights'];
    }
  });

  const [customPlaylists, setCustomPlaylists] = useState<PlaylistFolder[]>(() => {
    try {
      const saved = localStorage.getItem('godly_music_playlists');
      return saved ? JSON.parse(saved) : [
        {
          id: 'pl-favorites',
          name: 'My Heavy Rotation',
          description: 'Daily mix of personal favorites',
          cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop',
          tracks: [MASTER_TRACKS_CATALOG[0], MASTER_TRACKS_CATALOG[2], MASTER_TRACKS_CATALOG[4]],
          isCustom: true
        }
      ];
    } catch {
      return [];
    }
  });

  // Search & Architecture configuration
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchingTidal, setIsSearchingTidal] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<TrackItem[]>([]);
  const [showQueueDrawer, setShowQueueDrawer] = useState<boolean>(false);
  const [showMirrorModal, setShowMirrorModal] = useState<boolean>(false);
  const [hifiMirrors, setHifiMirrors] = useState<string[]>(DEFAULT_HIFI_MIRRORS);
  const [activeMirrorIndex, setActiveMirrorIndex] = useState<number>(0);
  const [newPlaylistName, setNewPlaylistName] = useState<string>('');
  const [showNewPlaylistModal, setShowNewPlaylistModal] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrack = queue[currentTrackIndex] || MASTER_TRACKS_CATALOG[0];

  // Save liked songs & playlists to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('godly_music_liked', JSON.stringify(likedTrackIds));
    } catch {}
  }, [likedTrackIds]);

  useEffect(() => {
    try {
      localStorage.setItem('godly_music_playlists', JSON.stringify(customPlaylists));
    } catch {}
  }, [customPlaylists]);

  // Sync to OS Taskbar / Dynamic Island
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

  // Listen to OS Taskbar custom events
  useEffect(() => {
    const handleRemoteToggle = (e: any) => {
      if (e.detail?.isPlaying !== undefined) {
        setIsPlaying(e.detail.isPlaying);
      } else {
        setIsPlaying((prev) => !prev);
      }
    };
    const handleRemoteNext = () => {
      handleNextTrack();
    };

    window.addEventListener('godly-music-toggle', handleRemoteToggle);
    window.addEventListener('godly-music-next', handleRemoteNext);
    return () => {
      window.removeEventListener('godly-music-toggle', handleRemoteToggle);
      window.removeEventListener('godly-music-next', handleRemoteNext);
    };
  }, [queue.length, isShuffle]);

  // Audio Playback Controller
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          setIsPlaying(false);
        });
      }
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

  const playTrackFromList = (trackList: TrackItem[], index: number) => {
    sound.playClick();
    setQueue(trackList);
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    setCurrentTime(0);
  };

  const handleNextTrack = useCallback(() => {
    sound.playClick();
    if (isShuffle) {
      const rand = Math.floor(Math.random() * queue.length);
      setCurrentTrackIndex(rand);
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % queue.length);
    }
    setCurrentTime(0);
    setIsPlaying(true);
  }, [isShuffle, queue.length]);

  const handlePrevTrack = () => {
    sound.playClick();
    if (currentTime > 4) {
      if (audioRef.current) audioRef.current.currentTime = 0;
      setCurrentTime(0);
    } else {
      setCurrentTrackIndex((prev) => (prev - 1 + queue.length) % queue.length);
      setCurrentTime(0);
    }
    setIsPlaying(true);
  };

  const toggleLikeTrack = (trackId: string) => {
    sound.playSuccess();
    setLikedTrackIds((prev) =>
      prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId]
    );
  };

  // Live Tidal & YouTube Music search
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearchingTidal(true);
    sound.playClick();

    try {
      // 1. Try local music fastify backend if active
      let found: TrackItem[] = [];
      try {
        const res = await fetch(`http://localhost:2010/api/music/search?q=${encodeURIComponent(query)}&limit=15`, {
          signal: AbortSignal.timeout(3000)
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.items)) {
            found = data.items.map((it: any) => ({
              id: `tidal-${it.id}`,
              title: it.title,
              artist: it.artist,
              album: it.album || 'Tidal HiFi Studio',
              duration: it.duration || 210,
              cover: it.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop',
              streamUrl: `http://localhost:2010/api/music/stream?id=${it.id}&source=ytm`,
              genre: 'Tidal Master',
              source: 'tidal',
              qualityBadge: 'FLAC Lossless',
              isLossless: true
            }));
          }
        }
      } catch {}

      // 2. Query Piped / Invidious stream API
      if (found.length === 0) {
        try {
          const pipedRes = await fetch(`https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(query)}&filter=music_songs`, {
            signal: AbortSignal.timeout(3500)
          });
          if (pipedRes.ok) {
            const pData = await pipedRes.json();
            if (Array.isArray(pData.items)) {
              found = pData.items.slice(0, 10).map((p: any) => {
                const vidId = (p.url || '').replace('/watch?v=', '');
                return {
                  id: `ytm-${vidId}`,
                  title: p.title || query,
                  artist: p.uploaderName || 'Verified Artist',
                  album: 'YouTube Music Stream',
                  duration: p.duration || 220,
                  cover: p.thumbnail || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop',
                  streamUrl: `https://inv.tux.pizza/latest_version?id=${vidId}&itag=140`,
                  genre: 'YouTube Music',
                  source: 'ytm',
                  qualityBadge: '160kbps AAC',
                  isLossless: false
                };
              });
            }
          }
        } catch {}
      }

      // 3. Fallback: match inside Master tracks
      const localMatches = MASTER_TRACKS_CATALOG.filter(
        (t) =>
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          t.artist.toLowerCase().includes(query.toLowerCase()) ||
          t.album.toLowerCase().includes(query.toLowerCase())
      );

      const combined = [...found, ...localMatches];
      setSearchResults(combined.length > 0 ? combined : MASTER_TRACKS_CATALOG.slice(0, 5));
    } catch (err) {
      console.warn('Search error:', err);
    } finally {
      setIsSearchingTidal(false);
    }
  };

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;
    sound.playSuccess();
    const newPl: PlaylistFolder = {
      id: `pl-${Date.now()}`,
      name: newPlaylistName.trim(),
      description: 'Custom user playlist',
      cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop',
      tracks: [],
      isCustom: true
    };
    setCustomPlaylists([...customPlaylists, newPl]);
    setNewPlaylistName('');
    setShowNewPlaylistModal(false);
  };

  const likedTracksList = useMemo(() => {
    return MASTER_TRACKS_CATALOG.filter((t) => likedTrackIds.includes(t.id));
  }, [likedTrackIds]);

  const formatSeconds = (sec: number) => {
    if (!isFinite(sec) || sec <= 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#070812] text-white select-none overflow-hidden font-sans">
      {/* Hidden Audio Player Tag */}
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
          if (isRepeat === 'one') {
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play();
            }
          } else {
            handleNextTrack();
          }
        }}
        onError={() => {
          if (audioRef.current) {
            audioRef.current.src = 'https://ice1.somafm.com/groovesalad-128-mp3';
            audioRef.current.play().catch(() => {});
          }
        }}
      />

      {/* TOP & BODY SECTION: SIDEBAR + CONTENT + QUEUE */}
      <div className="flex-1 w-full flex overflow-hidden">
        {/* SPOTIFY-STYLE LEFT SIDEBAR */}
        <div className="w-56 sm:w-64 bg-[#0a0c1b] border-r border-white/[0.08] flex flex-col justify-between shrink-0 p-3 space-y-4">
          <div className="space-y-4">
            {/* App Brand */}
            <div className="flex items-center gap-2.5 px-3 py-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 p-0.5 flex items-center justify-center">
                <Music size={16} className="text-white" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                  Godly Music
                </h1>
                <span className="text-[9px] font-mono font-bold text-cyan-400">
                  Octave &bull; Lossless
                </span>
              </div>
            </div>

            {/* Main Primary Navigation */}
            <nav className="space-y-1">
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveView('home');
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeView === 'home'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-950/50'
                    : 'text-white/70 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Home size={16} />
                <span>Home</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveView('search');
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeView === 'search'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-950/50'
                    : 'text-white/70 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Search size={16} />
                <span>Search &amp; Explore</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveView('library');
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeView === 'library'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-950/50'
                    : 'text-white/70 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Library size={16} />
                <span>Your Library</span>
              </button>
            </nav>

            {/* Secondary Library Subsections */}
            <div className="pt-2 border-t border-white/[0.08] space-y-1">
              <div className="flex items-center justify-between px-3 py-1">
                <span className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-wider">
                  Playlists
                </span>
                <button
                  onClick={() => setShowNewPlaylistModal(true)}
                  className="p-1 rounded-md text-white/40 hover:text-white hover:bg-white/10"
                  title="Create Playlist"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Liked Songs Entry */}
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveView('library');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-white/80 hover:text-white hover:bg-white/[0.04] transition-all group"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shrink-0">
                  <Heart size={12} className="fill-white text-white" />
                </div>
                <div className="flex flex-col text-left truncate">
                  <span className="font-semibold truncate">Liked Songs</span>
                  <span className="text-[10px] text-white/40">{likedTrackIds.length} tracks</span>
                </div>
              </button>

              {/* Custom Playlists */}
              <div className="max-h-36 overflow-y-auto custom-scrollbar space-y-0.5">
                {customPlaylists.map((pl) => (
                  <button
                    key={pl.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedPlaylist(pl);
                      setActiveView('playlist');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-white/70 hover:text-white hover:bg-white/[0.04] text-left truncate"
                  >
                    <Disc size={13} className="text-purple-400 shrink-0" />
                    <span className="truncate">{pl.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Mirror Settings Indicator */}
          <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-cyan-300 font-bold flex items-center gap-1">
                <Globe size={11} /> HiFi Mirror
              </span>
              <button
                onClick={() => setShowMirrorModal(true)}
                className="text-[10px] text-purple-400 hover:underline"
              >
                Change
              </button>
            </div>
            <p className="text-[10px] font-mono text-white/50 truncate">
              {hifiMirrors[activeMirrorIndex].replace('https://', '')}
            </p>
          </div>
        </div>

        {/* CENTER MAIN SCROLLABLE VIEW */}
        <div className="flex-1 h-full overflow-y-auto custom-scrollbar bg-gradient-to-b from-[#101229]/60 via-[#080916] to-[#05060f] p-5 sm:p-7 space-y-8">
          {/* VIEW: HOME (DISCOVERY, HERO SPOTLIGHT, CHARTS) */}
          {activeView === 'home' && (
            <div className="space-y-8 max-w-6xl mx-auto">
              {/* Hero Spotlight Banner */}
              <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-r from-purple-900/60 via-indigo-900/40 to-black/80 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
                <div className="space-y-3 text-center sm:text-left z-10">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                    Featured Album &bull; Tidal Master
                  </span>
                  <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                    {CURATED_ALBUMS[0].title}
                  </h1>
                  <p className="text-sm text-purple-200 font-semibold">
                    {CURATED_ALBUMS[0].artist} &bull; {CURATED_ALBUMS[0].genre} &bull; {CURATED_ALBUMS[0].year}
                  </p>
                  <div className="flex items-center gap-3 pt-2 justify-center sm:justify-start">
                    <button
                      onClick={() => playTrackFromList(CURATED_ALBUMS[0].tracks, 0)}
                      className="px-6 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white shadow-lg shadow-purple-950/60 flex items-center gap-2 transition-all transform hover:scale-105"
                    >
                      <Play size={16} className="fill-white" />
                      <span>Play Album</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAlbum(CURATED_ALBUMS[0]);
                        setActiveView('album');
                      }}
                      className="px-4 py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 font-bold text-xs text-white/80 transition-all"
                    >
                      View Tracklist
                    </button>
                  </div>
                </div>

                <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden border border-white/20 shadow-2xl shrink-0 z-10">
                  <img
                    src={CURATED_ALBUMS[0].cover}
                    alt={CURATED_ALBUMS[0].title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Trending Top Tracks (Spotify Style Table) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <TrendingUp size={18} className="text-cyan-400" />
                    <span>Today's Top Hits &amp; Lossless Streams</span>
                  </h2>
                  <span className="text-xs text-white/40 font-mono">Top 50 Global</span>
                </div>

                <div className="bg-[#0b0d1e] rounded-3xl border border-white/[0.08] overflow-hidden p-2">
                  {MASTER_TRACKS_CATALOG.slice(0, 6).map((track, idx) => {
                    const isCurrent = currentTrack.id === track.id;
                    const isLiked = likedTrackIds.includes(track.id);

                    return (
                      <div
                        key={track.id}
                        className={`group flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-all ${
                          isCurrent
                            ? 'bg-purple-600/25 border border-purple-400/40 text-white'
                            : 'hover:bg-white/[0.05] text-white/80'
                        }`}
                      >
                        <div
                          onClick={() => playTrackFromList(MASTER_TRACKS_CATALOG, idx)}
                          className="flex items-center gap-3.5 flex-1 truncate pr-3"
                        >
                          <span className="w-5 text-center text-xs font-mono text-white/40 group-hover:text-cyan-300">
                            {idx + 1}
                          </span>
                          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-black/40">
                            <img src={track.cover} alt={track.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex flex-col truncate">
                            <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                              {track.title}
                            </span>
                            <span className="text-[10px] text-white/45 truncate">
                              {track.artist} &bull; {track.album}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-cyan-300 border border-white/[0.08] hidden sm:inline">
                            {track.qualityBadge}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLikeTrack(track.id);
                            }}
                            className={`p-1.5 rounded-lg transition-all ${
                              isLiked ? 'text-pink-500' : 'text-white/30 hover:text-white'
                            }`}
                          >
                            <Heart size={14} className={isLiked ? 'fill-pink-500' : ''} />
                          </button>
                          <span className="text-xs font-mono text-white/40 w-10 text-right">
                            {formatSeconds(track.duration)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Popular Albums Grid */}
              <div className="space-y-4">
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Disc size={18} className="text-purple-400" />
                  <span>Popular Albums</span>
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {CURATED_ALBUMS.map((alb) => (
                    <div
                      key={alb.id}
                      onClick={() => {
                        sound.playClick();
                        setSelectedAlbum(alb);
                        setActiveView('album');
                      }}
                      className="p-3.5 rounded-3xl bg-[#0b0d1e] hover:bg-[#10142c] border border-white/10 hover:border-purple-400/40 cursor-pointer transition-all duration-200 group flex flex-col justify-between shadow-lg"
                    >
                      <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-3 bg-black">
                        <img src={alb.cover} alt={alb.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playTrackFromList(alb.tracks, 0);
                          }}
                          className="absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-950/70 opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100"
                        >
                          <Play size={16} className="fill-white ml-0.5" />
                        </button>
                      </div>

                      <div>
                        <h3 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                          {alb.title}
                        </h3>
                        <p className="text-[10px] text-white/50 truncate">
                          {alb.artist} &bull; {alb.year}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified Artists Spotlight */}
              <div className="space-y-4">
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <User size={18} className="text-pink-400" />
                  <span>Top Artists</span>
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {CURATED_ARTISTS.map((art) => (
                    <div
                      key={art.id}
                      onClick={() => {
                        sound.playClick();
                        setSelectedArtist(art);
                        setActiveView('artist');
                      }}
                      className="p-4 rounded-3xl bg-[#0b0d1e] hover:bg-[#10142c] border border-white/10 hover:border-pink-400/40 cursor-pointer transition-all flex items-center gap-3.5 group shadow-lg"
                    >
                      <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border border-white/20">
                        <img src={art.picture} alt={art.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="flex flex-col truncate">
                        <h3 className="text-xs font-bold text-white group-hover:text-pink-300 transition-colors truncate">
                          {art.name}
                        </h3>
                        <span className="text-[10px] text-white/50 truncate">{art.monthlyListeners}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW: SEARCH & BROWSE GENRES */}
          {activeView === 'search' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              {/* Big Search Header */}
              <div className="relative w-full">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') performSearch(searchQuery);
                  }}
                  placeholder="What do you want to play? (Search tracks, artists, albums)..."
                  className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-white/[0.06] border border-white/15 text-sm text-white placeholder-white/40 outline-none focus:border-purple-500 shadow-xl"
                />
                {isSearchingTidal ? (
                  <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400 animate-spin" />
                ) : searchQuery ? (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                ) : null}
              </div>

              {/* Search Results Table if any */}
              {searchResults.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white">Search Results ({searchResults.length})</h3>
                  <div className="bg-[#0b0d1e] rounded-3xl border border-white/10 p-2">
                    {searchResults.map((tr, idx) => (
                      <div
                        key={tr.id}
                        onClick={() => playTrackFromList(searchResults, idx)}
                        className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/[0.05] cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 truncate pr-2">
                          <img src={tr.cover} alt={tr.title} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                          <div className="flex flex-col truncate">
                            <span className="text-xs font-bold text-white group-hover:text-purple-300 truncate">
                              {tr.title}
                            </span>
                            <span className="text-[10px] text-white/50 truncate">
                              {tr.artist} &bull; {tr.album}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-cyan-300">
                            {tr.qualityBadge}
                          </span>
                          <span className="text-xs font-mono text-white/40">
                            {formatSeconds(tr.duration)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Browse All Category Tiles (Spotify Style) */
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white">Browse All Categories</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {GENRE_CARDS.map((gc) => (
                      <div
                        key={gc.id}
                        onClick={() => {
                          setSearchQuery(gc.name);
                          performSearch(gc.name);
                        }}
                        className={`p-5 rounded-3xl bg-gradient-to-br ${gc.color} cursor-pointer hover:scale-[1.02] transition-transform shadow-lg h-28 flex flex-col justify-between`}
                      >
                        <h4 className="text-sm font-black text-white">{gc.name}</h4>
                        <span className="text-[10px] font-mono text-white/70">Explore &bull; 60+ Tracks</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW: YOUR LIBRARY (LIKED SONGS & PLAYLISTS) */}
          {activeView === 'library' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900/60 via-pink-900/30 to-black/70 border border-white/10 flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl shrink-0">
                  <Heart size={32} className="fill-white text-white" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-pink-300">Playlist</span>
                  <h1 className="text-2xl font-black text-white">Liked Songs</h1>
                  <p className="text-xs text-white/60 mt-1">
                    {likedTracksList.length} songs &bull; Auto-synced to your local device
                  </p>
                </div>
              </div>

              {/* Liked Songs List */}
              <div className="bg-[#0b0d1e] rounded-3xl border border-white/10 p-2 space-y-1">
                {likedTracksList.length === 0 ? (
                  <div className="py-12 text-center text-white/40 text-xs">
                    No liked songs yet. Click the heart icon on any song to save it here!
                  </div>
                ) : (
                  likedTracksList.map((tr, idx) => (
                    <div
                      key={tr.id}
                      onClick={() => playTrackFromList(likedTracksList, idx)}
                      className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/[0.05] cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 truncate pr-2">
                        <img src={tr.cover} alt={tr.title} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                        <div className="flex flex-col truncate">
                          <span className="text-xs font-bold text-white group-hover:text-purple-300 truncate">
                            {tr.title}
                          </span>
                          <span className="text-[10px] text-white/50 truncate">{tr.artist} &bull; {tr.album}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLikeTrack(tr.id);
                          }}
                          className="text-pink-500 p-1"
                        >
                          <Heart size={14} className="fill-pink-500" />
                        </button>
                        <span className="text-xs font-mono text-white/40">{formatSeconds(tr.duration)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* VIEW: ALBUM DETAIL */}
          {activeView === 'album' && selectedAlbum && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-3xl bg-[#0b0d1e] border border-white/10">
                <img src={selectedAlbum.cover} alt={selectedAlbum.title} className="w-44 h-44 rounded-2xl object-cover shadow-2xl shrink-0" />
                <div className="space-y-2 text-center sm:text-left">
                  <span className="text-[10px] font-mono text-cyan-300 uppercase">Album &bull; Hi-Res</span>
                  <h1 className="text-2xl font-black text-white">{selectedAlbum.title}</h1>
                  <p className="text-xs text-purple-300 font-semibold">{selectedAlbum.artist} &bull; {selectedAlbum.year}</p>
                  <button
                    onClick={() => playTrackFromList(selectedAlbum.tracks, 0)}
                    className="px-6 py-2 rounded-2xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white shadow-lg flex items-center gap-2 mt-2"
                  >
                    <Play size={15} className="fill-white" /> Play Album
                  </button>
                </div>
              </div>

              <div className="bg-[#0b0d1e] rounded-3xl border border-white/10 p-2">
                {selectedAlbum.tracks.map((tr, idx) => (
                  <div
                    key={tr.id}
                    onClick={() => playTrackFromList(selectedAlbum.tracks, idx)}
                    className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/[0.05] cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span className="w-5 text-xs font-mono text-white/40">{idx + 1}</span>
                      <div className="flex flex-col truncate">
                        <span className="text-xs font-bold text-white group-hover:text-purple-300 truncate">{tr.title}</span>
                        <span className="text-[10px] text-white/45 truncate">{tr.artist}</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-white/40">{formatSeconds(tr.duration)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: ARTIST DETAIL */}
          {activeView === 'artist' && selectedArtist && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex items-center gap-5 p-6 rounded-3xl bg-[#0b0d1e] border border-white/10">
                <img src={selectedArtist.picture} alt={selectedArtist.name} className="w-24 h-24 rounded-full object-cover border border-white/20 shrink-0" />
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-pink-400 uppercase">Verified Artist</span>
                  <h1 className="text-2xl font-black text-white">{selectedArtist.name}</h1>
                  <p className="text-xs text-white/50">{selectedArtist.monthlyListeners}</p>
                  <p className="text-xs text-white/70 max-w-xl">{selectedArtist.bio}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white">Popular Releases</h3>
                <div className="bg-[#0b0d1e] rounded-3xl border border-white/10 p-2">
                  {selectedArtist.popularTracks.map((tr, idx) => (
                    <div
                      key={tr.id}
                      onClick={() => playTrackFromList(selectedArtist.popularTracks, idx)}
                      className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/[0.05] cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <span className="w-5 text-xs font-mono text-white/40">{idx + 1}</span>
                        <img src={tr.cover} alt={tr.title} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                        <div className="flex flex-col truncate">
                          <span className="text-xs font-bold text-white group-hover:text-purple-300 truncate">{tr.title}</span>
                          <span className="text-[10px] text-white/45 truncate">{tr.album}</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-white/40">{formatSeconds(tr.duration)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW: PLAYLIST DETAIL */}
          {activeView === 'playlist' && selectedPlaylist && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex items-center gap-5 p-6 rounded-3xl bg-[#0b0d1e] border border-white/10">
                <img src={selectedPlaylist.cover} alt={selectedPlaylist.name} className="w-24 h-24 rounded-2xl object-cover shrink-0" />
                <div>
                  <span className="text-[10px] font-mono text-purple-400 uppercase">User Playlist</span>
                  <h1 className="text-2xl font-black text-white">{selectedPlaylist.name}</h1>
                  <p className="text-xs text-white/50">{selectedPlaylist.description}</p>
                </div>
              </div>

              <div className="bg-[#0b0d1e] rounded-3xl border border-white/10 p-2">
                {selectedPlaylist.tracks.length === 0 ? (
                  <div className="py-10 text-center text-xs text-white/40">This playlist is empty. Add tracks from Search or Home!</div>
                ) : (
                  selectedPlaylist.tracks.map((tr, idx) => (
                    <div
                      key={tr.id}
                      onClick={() => playTrackFromList(selectedPlaylist.tracks, idx)}
                      className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/[0.05] cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <img src={tr.cover} alt={tr.title} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                        <div className="flex flex-col truncate">
                          <span className="text-xs font-bold text-white group-hover:text-purple-300 truncate">{tr.title}</span>
                          <span className="text-[10px] text-white/45 truncate">{tr.artist}</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-white/40">{formatSeconds(tr.duration)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT DRAWER: NOW PLAYING & QUEUE DRAWER */}
        {showQueueDrawer && (
          <div className="w-80 bg-[#090b1a] border-l border-white/[0.08] flex flex-col justify-between shrink-0 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <ListMusic size={15} className="text-purple-400" /> Play Queue
              </h3>
              <button onClick={() => setShowQueueDrawer(false)} className="text-white/40 hover:text-white">
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
              <span className="text-[10px] font-mono text-cyan-300 uppercase">Now Playing</span>
              <div className="p-2.5 rounded-2xl bg-purple-600/20 border border-purple-400/40 flex items-center gap-3">
                <img src={currentTrack.cover} alt={currentTrack.title} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                <div className="flex flex-col truncate">
                  <span className="text-xs font-bold text-white truncate">{currentTrack.title}</span>
                  <span className="text-[10px] text-white/50 truncate">{currentTrack.artist}</span>
                </div>
              </div>

              <span className="text-[10px] font-mono text-white/40 uppercase pt-2 block">Next Up ({queue.length - 1})</span>
              {queue.slice(currentTrackIndex + 1).map((tr, i) => (
                <div
                  key={tr.id}
                  onClick={() => {
                    sound.playClick();
                    setCurrentTrackIndex(currentTrackIndex + 1 + i);
                  }}
                  className="p-2 rounded-xl hover:bg-white/[0.05] cursor-pointer flex items-center justify-between text-xs text-white/70"
                >
                  <span className="truncate pr-2">{tr.title}</span>
                  <span className="text-[10px] font-mono text-white/40">{formatSeconds(tr.duration)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM PERSISTENT PLAYER BAR (SPOTIFY / OCTAVE STYLE) */}
      <div className="h-20 bg-[#0c0e22] border-t border-white/10 px-4 sm:px-6 flex items-center justify-between shrink-0 z-30">
        {/* Left: Track Details */}
        <div className="flex items-center gap-3 w-1/4 min-w-[180px] truncate">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/15 bg-black/50">
            <img src={currentTrack.cover} alt={currentTrack.title} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col truncate">
            <span className="text-xs font-bold text-white truncate hover:underline cursor-pointer">
              {currentTrack.title}
            </span>
            <span className="text-[11px] text-white/50 truncate hover:underline cursor-pointer">
              {currentTrack.artist}
            </span>
          </div>
          <button
            onClick={() => toggleLikeTrack(currentTrack.id)}
            className={`p-1.5 rounded-lg transition-all ml-1 shrink-0 ${
              likedTrackIds.includes(currentTrack.id) ? 'text-pink-500' : 'text-white/30 hover:text-white'
            }`}
          >
            <Heart size={15} className={likedTrackIds.includes(currentTrack.id) ? 'fill-pink-500' : ''} />
          </button>
        </div>

        {/* Center: Playback Controls & Scrubber */}
        <div className="flex flex-col items-center gap-1.5 flex-1 max-w-xl px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                sound.playClick();
                setIsShuffle(!isShuffle);
              }}
              className={`p-1 rounded-lg transition-all ${
                isShuffle ? 'text-cyan-400' : 'text-white/40 hover:text-white'
              }`}
              title="Shuffle"
            >
              <Shuffle size={15} />
            </button>

            <button
              onClick={handlePrevTrack}
              className="p-1 rounded-lg text-white/70 hover:text-white transition-all"
              title="Previous Track"
            >
              <SkipBack size={18} />
            </button>

            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={18} className="fill-black" /> : <Play size={18} className="fill-black ml-0.5" />}
            </button>

            <button
              onClick={handleNextTrack}
              className="p-1 rounded-lg text-white/70 hover:text-white transition-all"
              title="Next Track"
            >
              <SkipForward size={18} />
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setIsRepeat(isRepeat === 'off' ? 'all' : isRepeat === 'all' ? 'one' : 'off');
              }}
              className={`p-1 rounded-lg transition-all relative ${
                isRepeat !== 'off' ? 'text-purple-400' : 'text-white/40 hover:text-white'
              }`}
              title="Repeat Mode"
            >
              <Repeat size={15} />
              {isRepeat === 'one' && (
                <span className="absolute -top-1 -right-1 text-[7px] font-bold px-0.5 rounded-full bg-purple-600 text-white">
                  1
                </span>
              )}
            </button>
          </div>

          {/* Progress Timeline */}
          <div className="w-full flex items-center gap-2.5">
            <span className="text-[10px] font-mono text-white/40 w-7 text-right">
              {formatSeconds(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={isFinite(duration) && duration > 0 ? duration : 100}
              value={isFinite(duration) ? currentTime : 100}
              disabled={!isFinite(duration) || duration <= 0}
              onChange={(e) => {
                const val = Number(e.target.value);
                setCurrentTime(val);
                if (audioRef.current) audioRef.current.currentTime = val;
              }}
              className="flex-1 h-1 bg-white/15 rounded-full appearance-none cursor-pointer accent-purple-500 outline-none"
            />
            <span className="text-[10px] font-mono text-white/40 w-7 text-left">
              {isFinite(duration) && duration > 0 ? formatSeconds(duration) : 'LIVE'}
            </span>
          </div>
        </div>

        {/* Right: Quality Badge, Queue & Volume */}
        <div className="flex items-center justify-end gap-3 w-1/4 min-w-[180px]">
          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-cyan-300 border border-white/[0.08] hidden sm:inline">
            {currentTrack.qualityBadge}
          </span>

          <button
            onClick={() => setShowQueueDrawer(!showQueueDrawer)}
            className={`p-1.5 rounded-lg transition-all ${
              showQueueDrawer ? 'text-purple-400 bg-purple-500/20' : 'text-white/40 hover:text-white'
            }`}
            title="Queue"
          >
            <ListMusic size={16} />
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsMuted(!isMuted)}
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
              className="w-16 sm:w-20 h-1 bg-white/15 rounded-full appearance-none cursor-pointer accent-purple-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* HiFi Mirror Selector Modal */}
      {showMirrorModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#0c0e22] border border-white/20 p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Globe size={16} className="text-cyan-400" /> Select HiFi / Tidal Mirror
              </h3>
              <button onClick={() => setShowMirrorModal(false)} className="text-white/40 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-white/60">
              Community Tidal mirrors configured via MUSIC_API_BASES for lossless FLAC streams:
            </p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
              {hifiMirrors.map((m, idx) => (
                <button
                  key={m}
                  onClick={() => {
                    sound.playClick();
                    setActiveMirrorIndex(idx);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left text-xs font-mono border flex items-center justify-between ${
                    activeMirrorIndex === idx
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                      : 'bg-white/[0.03] border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  <span className="truncate">{m}</span>
                  {activeMirrorIndex === idx && <Check size={14} className="text-cyan-400 shrink-0 ml-1" />}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowMirrorModal(false)}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white"
            >
              Confirm Mirror
            </button>
          </div>
        </div>
      )}

      {/* Create New Playlist Modal */}
      {showNewPlaylistModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#0c0e22] border border-white/20 p-5 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <FolderPlus size={16} className="text-purple-400" /> New Playlist
              </h3>
              <button onClick={() => setShowNewPlaylistModal(false)} className="text-white/40 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Playlist name..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-xs text-white outline-none focus:border-purple-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setShowNewPlaylistModal(false)} className="px-3 py-1.5 text-xs text-white/60">
                Cancel
              </button>
              <button onClick={handleCreatePlaylist} className="px-4 py-2 rounded-xl bg-purple-600 font-bold text-xs text-white">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
