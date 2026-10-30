import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Film,
  Tv,
  Search,
  Star,
  Play,
  RotateCcw,
  Maximize2,
  Bookmark,
  ExternalLink,
  ChevronRight,
  Flame,
  X,
  Server,
  Layers,
  Sparkles,
  SlidersHorizontal,
  Clock,
  Calendar,
  AlertCircle,
  Check,
  CheckCircle2,
  HardDrive,
  Activity,
  Zap
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { ServiceWorkerAppView } from '../common/ServiceWorkerAppView';

const TMDB_KEY = '4e44d9029b1270a757cddc766a1bcb63';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG = 'https://image.tmdb.org/t/p';

export interface MediaItem {
  id: string | number;
  tmdbId: number;
  imdbId?: string;
  title: string;
  type: 'movie' | 'tv';
  rating: number;
  year: number;
  poster: string;
  backdrop: string;
  genres: string[];
  overview: string;
  seasonsCount?: number;
  runtime?: number;
}

export interface TVEpisode {
  id: number;
  episode_number: number;
  season_number: number;
  name: string;
  overview: string;
  still_path?: string;
  air_date?: string;
}

export interface StreamProvider {
  id: string;
  name: string;
  badge: string;
  getUrl: (tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number) => string;
}

export const STREAM_PROVIDERS: StreamProvider[] = [
  {
    id: 'jellyfin',
    name: 'Jellyfin :8096',
    badge: 'Self-Hosted REST',
    getUrl: () => {
      const stored = localStorage.getItem('godly_movies_jellyfin') || 'http://localhost:8096';
      return stored;
    },
  },
  {
    id: 'autoembed',
    name: 'AutoEmbed',
    badge: 'Multi-Res Fast',
    getUrl: (id, type, s = 1, e = 1) =>
      type === 'movie'
        ? `https://player.autoembed.cc/embed/movie/${id}`
        : `https://player.autoembed.cc/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: 'vidsrc',
    name: 'VidSrc',
    badge: '1080p HD',
    getUrl: (id, type, s = 1, e = 1) =>
      type === 'movie'
        ? `https://vidsrc.to/embed/movie/${id}`
        : `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: 'superembed',
    name: 'SuperEmbed',
    badge: 'Multi-Server',
    getUrl: (id, type, s = 1, e = 1) =>
      type === 'movie'
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`,
  },
  {
    id: 'vidlink',
    name: 'VidLink',
    badge: 'HLS Stream',
    getUrl: (id, type, s = 1, e = 1) =>
      type === 'movie'
        ? `https://vidlink.pro/movie/${id}`
        : `https://vidlink.pro/tv/${id}/${s}/${e}`,
  },
  {
    id: 'embedsu',
    name: 'Embed.su',
    badge: 'Fast CDN',
    getUrl: (id, type, s = 1, e = 1) =>
      type === 'movie'
        ? `https://embed.su/embed/movie/${id}`
        : `https://embed.su/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: '2embed',
    name: '2Embed',
    badge: 'Classic Mirror',
    getUrl: (id, type, s = 1, e = 1) =>
      type === 'movie'
        ? `https://www.2embed.cc/embed/${id}`
        : `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
  },
  {
    id: 'smashystream',
    name: 'SmashyStream',
    badge: 'Fast VIP',
    getUrl: (id, type, s = 1, e = 1) =>
      type === 'movie'
        ? `https://player.smashystream.com/movie/${id}`
        : `https://player.smashystream.com/tv/${id}/${s}/${e}`,
  },
];

export const GENRE_FILTERS = [
  'All',
  'Action',
  'Sci-Fi',
  'Adventure',
  'Comedy',
  'Drama',
  'Horror',
  'Animation',
  'Thriller',
  'Fantasy',
];

export const MoviesApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trending' | 'movies' | 'tv' | 'bookmarks' | 'jellyfin'>('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Self-Hosted Jellyfin (:8096) & Radarr (:7878) Suite State
  const [jellyfinUrl, setJellyfinUrl] = useState<string>(() => localStorage.getItem('godly_movies_jellyfin') || 'http://localhost:8096');
  const [radarrUrl, setRadarrUrl] = useState<string>(() => localStorage.getItem('godly_movies_radarr') || 'http://localhost:7878');
  const [showJellyfinModal, setShowJellyfinModal] = useState<boolean>(false);
  const [jellyfinModalTab, setJellyfinModalTab] = useState<'jellyfin' | 'radarr' | 'dim'>('jellyfin');
  const [testStatus, setTestStatus] = useState<{ testing: boolean; message?: string; success?: boolean } | null>(null);

  const testJellyfinConnection = async () => {
    setTestStatus({ testing: true });
    try {
      const res = await fetch(`${jellyfinUrl}/System/Info/Public`, { mode: 'cors' });
      if (res.ok) {
        const data = await res.json();
        setTestStatus({
          testing: false,
          success: true,
          message: `Connected! Server: ${data.ServerName || 'Jellyfin'} (v${data.Version || '10.x'})`
        });
      } else {
        setTestStatus({
          testing: false,
          success: false,
          message: `HTTP ${res.status}: ${res.statusText}. Please verify URL & CORS.`
        });
      }
    } catch (err: any) {
      setTestStatus({
        testing: false,
        success: false,
        message: `Direct fetch blocked or offline (${err.message || 'CORS'}). If your Jellyfin is active on :8096, it will embed cleanly.`
      });
    }
  };

  // Detail Modal State
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [seasonsData, setSeasonsData] = useState<{ season_number: number; name: string }[]>([]);
  const [activeSeason, setActiveSeason] = useState<number>(1);
  const [episodes, setEpisodes] = useState<TVEpisode[]>([]);
  const [episodesLoading, setEpisodesLoading] = useState<boolean>(false);

  // Player State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playingMedia, setPlayingMedia] = useState<MediaItem | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
  const [selectedProvider, setSelectedProvider] = useState<string>('autoembed');
  const [streamMode, setStreamMode] = useState<'direct' | 'proxy'>('direct');
  const [streamKey, setStreamKey] = useState<number>(0);

  // Bookmarks State
  const [bookmarks, setBookmarks] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('godly_movies_bookmarks');
      return saved ? JSON.parse(saved) : [693134, 533535, 66732, 94605];
    } catch {
      return [693134, 533535, 66732, 94605];
    }
  });

  const toggleBookmark = (tmdbId: number) => {
    sound.playClick();
    setBookmarks((prev) => {
      const next = prev.includes(tmdbId) ? prev.filter((id) => id !== tmdbId) : [...prev, tmdbId];
      try {
        localStorage.setItem('godly_movies_bookmarks', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Fetch Media List
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        let endpoint = `${TMDB_BASE}/trending/all/week?api_key=${TMDB_KEY}`;

        if (searchQuery.trim()) {
          endpoint = `${TMDB_BASE}/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(
            searchQuery.trim()
          )}`;
        } else if (activeTab === 'movies') {
          endpoint = `${TMDB_BASE}/movie/popular?api_key=${TMDB_KEY}`;
        } else if (activeTab === 'tv') {
          endpoint = `${TMDB_BASE}/tv/popular?api_key=${TMDB_KEY}`;
        }

        const res = await fetch(endpoint);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const data = await res.json();

        if (isMounted && data.results) {
          const parsed: MediaItem[] = data.results
            .filter((item: any) => item.poster_path && (item.title || item.name))
            .map((item: any) => {
              const isMovie = item.media_type === 'movie' || (!item.media_type && item.title);
              const yearStr = item.release_date || item.first_air_date || '';
              const year = parseInt(yearStr.slice(0, 4), 10) || 2024;

              return {
                id: item.id,
                tmdbId: item.id,
                title: item.title || item.name || 'Untitled',
                type: isMovie ? 'movie' : 'tv',
                rating: Number((item.vote_average || 7.5).toFixed(1)),
                year,
                poster: `${TMDB_IMG}/w500${item.poster_path}`,
                backdrop: item.backdrop_path
                  ? `${TMDB_IMG}/w1280${item.backdrop_path}`
                  : `${TMDB_IMG}/w500${item.poster_path}`,
                genres: [],
                overview: item.overview || 'No synopsis available for this title.',
              };
            });

          setItems(parsed);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('TMDB Fetch Error:', err);
          setError('Could not load catalog. Check your network or try again.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }, searchQuery ? 400 : 0);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [activeTab, searchQuery]);

  // Load TV show details and seasons when a media is selected
  useEffect(() => {
    if (!selectedMedia) return;

    let isMounted = true;
    setDetailLoading(true);

    const loadDetails = async () => {
      try {
        const res = await fetch(
          `${TMDB_BASE}/${selectedMedia.type}/${selectedMedia.tmdbId}?api_key=${TMDB_KEY}`
        );
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (data.genres) {
              selectedMedia.genres = data.genres.map((g: any) => g.name);
            }
            if (data.runtime) {
              selectedMedia.runtime = data.runtime;
            }
            if (selectedMedia.type === 'tv' && data.seasons) {
              const validSeasons = data.seasons.filter((s: any) => s.season_number > 0);
              setSeasonsData(validSeasons);
              if (validSeasons.length > 0) {
                setActiveSeason(validSeasons[0].season_number);
              }
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load item detail:', err);
      } finally {
        if (isMounted) setDetailLoading(false);
      }
    };

    loadDetails();
    return () => {
      isMounted = false;
    };
  }, [selectedMedia]);

  // Load episodes when active season changes
  useEffect(() => {
    if (!selectedMedia || selectedMedia.type !== 'tv' || !activeSeason) return;

    let isMounted = true;
    setEpisodesLoading(true);

    const loadEpisodes = async () => {
      try {
        const res = await fetch(
          `${TMDB_BASE}/tv/${selectedMedia.tmdbId}/season/${activeSeason}?api_key=${TMDB_KEY}`
        );
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.episodes) {
            setEpisodes(data.episodes);
          }
        }
      } catch (err) {
        console.warn('Failed to load episodes:', err);
      } finally {
        if (isMounted) setEpisodesLoading(false);
      }
    };

    loadEpisodes();
    return () => {
      isMounted = false;
    };
  }, [selectedMedia, activeSeason]);

  // Keyboard shortcut listener (ESC to close player or detail)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isPlaying) {
          setIsPlaying(false);
        } else if (selectedMedia) {
          setSelectedMedia(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, selectedMedia]);

  const handleStartPlay = (media: MediaItem, season = 1, episode = 1) => {
    sound.playOpen();
    setPlayingMedia(media);
    setSelectedSeason(season);
    setSelectedEpisode(episode);
    setIsPlaying(true);
    setStreamKey((k) => k + 1);
  };

  const currentProviderObj =
    STREAM_PROVIDERS.find((p) => p.id === selectedProvider) || STREAM_PROVIDERS[0];

  const currentEmbedUrl = playingMedia
    ? currentProviderObj.getUrl(
        playingMedia.tmdbId,
        playingMedia.type,
        selectedSeason,
        selectedEpisode
      )
    : '';

  const filteredItems = useMemo(() => {
    if (activeTab === 'bookmarks') {
      return items.filter((item) => bookmarks.includes(item.tmdbId));
    }
    return items;
  }, [items, activeTab, bookmarks]);

  return (
    <div className="w-full h-full flex flex-col bg-[#07080f] text-white select-none overflow-hidden font-sans">
      {/* Top Navigation & Search Header */}
      <div className="h-14 px-4 sm:px-6 bg-[#0c0d18]/95 border-b border-white/[0.08] flex items-center justify-between shrink-0 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-amber-500 to-purple-600 p-0.5 shadow-lg shadow-rose-950/40 flex items-center justify-center">
            <div className="w-full h-full rounded-[10px] bg-[#0c0a18] flex items-center justify-center">
              <Film size={18} className="text-rose-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black tracking-tight text-white">Movies</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                TMDB &amp; AutoEmbed
              </span>
            </div>
            <p className="text-[10px] text-white/40 hidden sm:block">
              Free streaming movies &amp; TV series with multi-server playback
            </p>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="hidden md:flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/10">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('trending');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'trending'
                ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md shadow-rose-950/40'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Flame size={13} /> Trending
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('movies');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'movies'
                ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md shadow-rose-950/40'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Film size={13} /> Movies
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('tv');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'tv'
                ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md shadow-rose-950/40'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Tv size={13} /> TV Series
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('bookmarks');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'bookmarks'
                ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md shadow-rose-950/40'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Bookmark size={13} /> Saved ({bookmarks.length})
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('jellyfin');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'jellyfin'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/40'
                : 'text-white/60 hover:text-white'
            }`}
            title="Jellyfin Open Source Media Server (:8096)"
          >
            <Server size={13} className="text-purple-400" /> Jellyfin :8096
          </button>
        </div>

        {/* Right Header: Suite Launcher & Search */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setShowJellyfinModal(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            title="Jellyfin & Radarr Suite (:8096, :7878)"
          >
            <Server size={13} className="text-purple-400" />
            <span className="hidden sm:inline">Jellyfin Suite</span>
            <span className="text-[10px] font-mono opacity-60">:8096</span>
          </button>

          {/* Search input */}
          <div className="relative w-40 sm:w-60">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any title..."
              className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-white/30 focus:border-rose-500/50 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid View or Jellyfin Client */}
      {activeTab === 'jellyfin' ? (
        <div className="flex-1 w-full h-full flex flex-col bg-black relative">
          <div className="h-10 bg-[#0c0d18] border-b border-white/10 px-4 sm:px-6 flex items-center justify-between text-xs text-white/60 shrink-0">
            <div className="flex items-center gap-2">
              <Server size={14} className="text-purple-400" />
              <span className="font-bold text-white">Jellyfin Media Server</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {jellyfinUrl}
              </span>
              <span className="text-[10px] text-white/40 hidden md:inline">&bull; Free Hardware Transcoding &bull; Zero Phoning Home</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setShowJellyfinModal(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-all"
              >
                <SlidersHorizontal size={12} /> Configure Server
              </button>
              <a
                href={jellyfinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-[11px] font-bold flex items-center gap-1 transition-all"
              >
                <ExternalLink size={12} /> Open Full WebUI
              </a>
            </div>
          </div>
          <iframe
            src={jellyfinUrl}
            title="Jellyfin Web Client"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            className="flex-1 w-full h-full border-0 bg-black"
          />
        </div>
      ) : (
        <div className="flex-1 w-full overflow-y-auto p-4 sm:p-6 custom-scrollbar">
        {loading ? (
          <div className="w-full h-64 flex flex-col items-center justify-center gap-3 text-white/40">
            <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
            <span className="text-xs font-mono">Loading TMDB Catalog...</span>
          </div>
        ) : error ? (
          <div className="w-full py-20 flex flex-col items-center justify-center text-center gap-3">
            <AlertCircle size={36} className="text-amber-400/80" />
            <p className="text-sm font-semibold text-white/70">{error}</p>
            <button
              onClick={() => {
                sound.playClick();
                setSearchQuery('');
                setActiveTab('trending');
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-all"
            >
              Reload Trending
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="w-full py-24 flex flex-col items-center justify-center text-center gap-3 text-white/40">
            <Film size={40} className="text-white/20" />
            <p className="text-sm font-semibold">No results found for &ldquo;{searchQuery}&rdquo;</p>
            <p className="text-xs text-white/30">Try searching another movie, actor, or franchise.</p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-white/60">
                {searchQuery ? `Search Results for "${searchQuery}"` : activeTab.toUpperCase()}
              </span>
              <span className="text-xs font-mono text-white/40">
                {filteredItems.length} Titles
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {filteredItems.map((media) => {
                const isBookmarked = bookmarks.includes(media.tmdbId);
                return (
                  <div
                    key={`${media.type}-${media.tmdbId}`}
                    onClick={() => {
                      sound.playOpen();
                      setSelectedMedia(media);
                    }}
                    className="group relative flex flex-col rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-rose-500/40 overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-sm hover:shadow-xl hover:shadow-rose-950/20"
                  >
                    {/* Poster Image */}
                    <div className="relative w-full aspect-[2/3] overflow-hidden bg-black/60">
                      <img
                        src={media.poster}
                        alt={media.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d18] via-transparent to-black/30" />

                      {/* Rating Badge */}
                      <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-bold text-amber-300">
                        <Star size={10} className="fill-amber-400 text-amber-400" />
                        <span>{media.rating}</span>
                      </div>

                      {/* Bookmark button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(media.tmdbId);
                        }}
                        className={`absolute top-2 right-2 p-1.5 rounded-lg backdrop-blur-md border transition-all ${
                          isBookmarked
                            ? 'bg-rose-600 border-rose-400 text-white'
                            : 'bg-black/60 border-white/15 text-white/60 hover:text-white'
                        }`}
                        title={isBookmarked ? 'Remove Bookmark' : 'Save Title'}
                      >
                        <Bookmark size={11} className={isBookmarked ? 'fill-white' : ''} />
                      </button>

                      {/* Media type & year */}
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono text-white/80">
                        <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/10 uppercase">
                          {media.type}
                        </span>
                        <span className="font-semibold">{media.year}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="p-2.5 flex flex-col justify-between flex-1">
                      <h3 className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors line-clamp-1">
                        {media.title}
                      </h3>
                      <p className="text-[10px] text-white/40 mt-1 line-clamp-1">
                        {media.overview}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      )}

      {/* Detail Modal Overlay */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-3xl bg-[#0e101f] border border-white/15 shadow-2xl overflow-hidden my-8">
            {/* Backdrop Banner */}
            <div className="relative w-full h-64 sm:h-80 overflow-hidden bg-black/60">
              <img
                src={selectedMedia.backdrop}
                alt={selectedMedia.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e101f] via-[#0e101f]/60 to-black/30" />

              {/* Close Button */}
              <button
                onClick={() => setSelectedMedia(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white transition-all z-10"
              >
                <X size={18} />
              </button>

              {/* Banner Info */}
              <div className="absolute bottom-6 left-6 right-6 flex items-end gap-5">
                <img
                  src={selectedMedia.poster}
                  alt={selectedMedia.title}
                  className="w-28 sm:w-36 aspect-[2/3] object-cover rounded-2xl border-2 border-white/20 shadow-2xl shadow-black/80 hidden sm:block shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                      {selectedMedia.type}
                    </span>
                    <span className="text-xs text-white/60 font-mono">
                      {selectedMedia.year}
                    </span>
                    {selectedMedia.runtime && (
                      <span className="text-xs text-white/60 font-mono">
                        {selectedMedia.runtime} min
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {selectedMedia.title}
                  </h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-300 px-2 py-0.5 rounded-lg bg-amber-400/10 border border-amber-400/20">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      {selectedMedia.rating} / 10
                    </span>
                    <button
                      onClick={() => toggleBookmark(selectedMedia.tmdbId)}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white/80 transition-all"
                      title="Bookmark"
                    >
                      <Bookmark
                        size={14}
                        className={bookmarks.includes(selectedMedia.tmdbId) ? 'fill-rose-400 text-rose-400' : ''}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 flex flex-col gap-5">
              {/* Overview */}
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white/60 mb-1.5">
                  Synopsis
                </h4>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans">
                  {selectedMedia.overview}
                </p>
              </div>

              {/* Play Action for Movie */}
              {selectedMedia.type === 'movie' ? (
                <div className="pt-2">
                  <button
                    onClick={() => handleStartPlay(selectedMedia)}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-sm shadow-xl shadow-rose-950/50 flex items-center justify-center gap-2 transition-all"
                  >
                    <Play size={16} className="fill-white" /> Watch Movie Now
                  </button>
                </div>
              ) : (
                /* TV Seasons & Episode Picker */
                <div className="pt-2 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white/80">
                      Seasons &amp; Episodes
                    </h4>
                    <span className="text-[11px] text-white/40 font-mono">
                      {seasonsData.length} Seasons Available
                    </span>
                  </div>

                  {/* Season tabs */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                    {seasonsData.map((s) => (
                      <button
                        key={s.season_number}
                        onClick={() => {
                          sound.playClick();
                          setActiveSeason(s.season_number);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                          activeSeason === s.season_number
                            ? 'bg-rose-600 border-rose-400 text-white shadow-md shadow-rose-950/40'
                            : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white/70'
                        }`}
                      >
                        Season {s.season_number}
                      </button>
                    ))}
                  </div>

                  {/* Episode List */}
                  {episodesLoading ? (
                    <div className="py-10 text-center text-xs font-mono text-white/40">
                      Loading episodes...
                    </div>
                  ) : episodes.length === 0 ? (
                    <div className="py-6 text-center text-xs text-white/40">
                      No episodes found for this season.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                      {episodes.map((ep) => (
                        <div
                          key={ep.id}
                          onClick={() => handleStartPlay(selectedMedia, activeSeason, ep.episode_number)}
                          className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] hover:bg-rose-600/20 border border-white/[0.06] hover:border-rose-500/40 cursor-pointer transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-white/[0.05] flex items-center justify-center font-mono font-bold text-xs text-white/60 group-hover:text-white group-hover:bg-rose-600">
                              {ep.episode_number}
                            </span>
                            <div>
                              <h5 className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors">
                                {ep.name || `Episode ${ep.episode_number}`}
                              </h5>
                              <p className="text-[10px] text-white/40 line-clamp-1 mt-0.5">
                                {ep.overview || 'Select to stream this episode'}
                              </p>
                            </div>
                          </div>
                          <button className="px-3 py-1.5 rounded-xl bg-rose-600/20 text-rose-300 group-hover:bg-rose-600 group-hover:text-white text-xs font-bold font-mono transition-all flex items-center gap-1">
                            <Play size={10} className="fill-current" /> Play
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Player Overlay */}
      {isPlaying && playingMedia && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden">
          {/* Player Top Bar */}
          <div className="h-12 px-4 bg-[#0a0b14] border-b border-white/10 flex items-center justify-between shrink-0 select-none z-20">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  sound.playClick();
                  setIsPlaying(false);
                }}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-1.5 text-xs font-bold"
              >
                <X size={14} /> Close Player
              </button>
              <div className="h-4 w-px bg-white/20" />
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white">
                  {playingMedia.title}
                </span>
                {playingMedia.type === 'tv' && (
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    S{selectedSeason} : E{selectedEpisode}
                  </span>
                )}
              </div>
            </div>

            {/* Provider and controls */}
            <div className="flex items-center gap-2">
              {/* Server Dropdown */}
              <div className="flex items-center gap-1 bg-white/[0.04] px-2 py-1 rounded-xl border border-white/10">
                <Server size={12} className="text-white/40" />
                <select
                  value={selectedProvider}
                  onChange={(e) => {
                    sound.playClick();
                    setSelectedProvider(e.target.value);
                    setStreamKey((k) => k + 1);
                  }}
                  className="bg-transparent text-xs font-mono font-bold text-white outline-none cursor-pointer"
                >
                  {STREAM_PROVIDERS.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#0e101f] text-white">
                      {p.name} ({p.badge})
                    </option>
                  ))}
                </select>
              </div>

              {/* Direct vs UV Proxy Switcher */}
              <button
                onClick={() => {
                  sound.playClick();
                  setStreamMode((m) => (m === 'direct' ? 'proxy' : 'direct'));
                  setStreamKey((k) => k + 1);
                }}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  streamMode === 'direct'
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                    : 'bg-purple-500/15 border-purple-500/30 text-purple-300'
                }`}
                title="Switch between Direct Embed and Ultraviolet Proxy"
              >
                {streamMode === 'direct' ? '⚡ Direct' : '🛡️ Proxy'}
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setStreamKey((k) => k + 1);
                }}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
                title="Reload stream"
              >
                <RotateCcw size={14} />
              </button>

              <a
                href={currentEmbedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
                title="Open in new window"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {/* Embedded Stream Frame */}
          <div className="flex-1 w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
            {streamMode === 'direct' ? (
              <iframe
                key={`direct-${currentEmbedUrl}-${streamKey}`}
                src={currentEmbedUrl}
                title={`${playingMedia.title} Stream`}
                className="w-full h-full border-0 bg-black"
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer"
                allowFullScreen
                referrerPolicy="origin"
                sandbox="allow-scripts allow-forms allow-same-origin allow-presentation allow-pointer-lock"
              />
            ) : (
              <ServiceWorkerAppView
                key={`proxy-${currentEmbedUrl}-${streamKey}`}
                url={currentEmbedUrl}
                appName={`${playingMedia.title} (${currentProviderObj.name})`}
                fallbackUrl={currentEmbedUrl}
                fallbackName={currentProviderObj.name}
              />
            )}
          </div>
        </div>
      )}

      {/* JELLYFIN & RADARR SUITE MODAL */}
      {showJellyfinModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0c0d18] border border-purple-500/30 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="h-14 px-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <Server size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-white tracking-wide">Self-Hosted Movies &amp; TV Suite</h2>
                  <p className="text-[10px] text-purple-300/70 font-mono">Jellyfin (:8096) &bull; Radarr (:7878) &bull; Dim</p>
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  setShowJellyfinModal(false);
                }}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Server Tabs */}
            <div className="flex border-b border-white/10 bg-black/40 px-6 pt-3 gap-2">
              <button
                onClick={() => setJellyfinModalTab('jellyfin')}
                className={`px-4 py-2 text-xs font-extrabold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
                  jellyfinModalTab === 'jellyfin'
                    ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                <Server size={12} />
                <span>Jellyfin</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">:8096</span>
              </button>
              <button
                onClick={() => setJellyfinModalTab('radarr')}
                className={`px-4 py-2 text-xs font-extrabold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
                  jellyfinModalTab === 'radarr'
                    ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                <HardDrive size={12} />
                <span>Radarr</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">:7878</span>
              </button>
              <button
                onClick={() => setJellyfinModalTab('dim')}
                className={`px-4 py-2 text-xs font-extrabold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
                  jellyfinModalTab === 'dim'
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                <Zap size={12} />
                <span>Dim</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">Rust</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {jellyfinModalTab === 'jellyfin' && (
                <>
                  <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200/90 leading-relaxed">
                    <strong className="text-purple-300 font-bold block mb-1">Jellyfin — 100% Free &amp; Open Source Media System (Port 8096)</strong>
                    48k stars, 70+ client apps, hardware transcoding completely free (NVENC, VAAPI, QSV), zero phoning home or account lockouts. Full REST API ready to stream directly.
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-white/70 block mb-1.5">Jellyfin Server URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={jellyfinUrl}
                        onChange={(e) => setJellyfinUrl(e.target.value)}
                        placeholder="http://localhost:8096"
                        className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                      />
                      <button
                        onClick={testJellyfinConnection}
                        disabled={testStatus?.testing}
                        className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                        title="Test Public REST API"
                      >
                        <Activity size={13} className={testStatus?.testing ? 'animate-spin' : ''} />
                        Test API
                      </button>
                    </div>
                  </div>

                  {testStatus && (
                    <div
                      className={`p-2.5 rounded-xl text-[11px] font-mono flex items-center gap-2 ${
                        testStatus.success
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {testStatus.success ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                      <span>{testStatus.message}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1 text-[11px] text-white/40">
                    <span>Quick presets:</span>
                    <button
                      onClick={() => setJellyfinUrl('http://localhost:8096')}
                      className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-white/70 font-mono text-[10px]"
                    >
                      localhost:8096
                    </button>
                    <button
                      onClick={() => setJellyfinUrl('http://127.0.0.1:8096')}
                      className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-white/70 font-mono text-[10px]"
                    >
                      127.0.0.1:8096
                    </button>
                    <button
                      onClick={() => setJellyfinUrl('http://jellyfin.local:8096')}
                      className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-white/70 font-mono text-[10px]"
                    >
                      jellyfin.local
                    </button>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        localStorage.setItem('godly_movies_jellyfin', jellyfinUrl);
                        setActiveTab('jellyfin');
                        setShowJellyfinModal(false);
                        sound.playSuccess();
                      }}
                      className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all"
                    >
                      <Check size={14} /> Save &amp; Switch to Jellyfin Player
                    </button>
                  </div>
                </>
              )}

              {jellyfinModalTab === 'radarr' && (
                <>
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
                    <strong className="text-amber-300 font-bold block mb-1">Radarr — Automation &amp; Quality Management Layer (Port 7878)</strong>
                    Radarr monitors RSS feeds, grabs releases automatically, renames files cleanly, and upgrades movies to your desired quality (4K HDR, 1080p Remux). Runs upstream of Jellyfin.
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-white/70 block mb-1.5">Radarr Server URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={radarrUrl}
                        onChange={(e) => setRadarrUrl(e.target.value)}
                        placeholder="http://localhost:7878"
                        className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                      <a
                        href={radarrUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-600/20"
                      >
                        <ExternalLink size={13} /> Open
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 text-[11px] text-white/40">
                    <span>Quick presets:</span>
                    <button
                      onClick={() => setRadarrUrl('http://localhost:7878')}
                      className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-white/70 font-mono text-[10px]"
                    >
                      localhost:7878
                    </button>
                    <button
                      onClick={() => setRadarrUrl('http://127.0.0.1:7878')}
                      className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-white/70 font-mono text-[10px]"
                    >
                      127.0.0.1:7878
                    </button>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        localStorage.setItem('godly_movies_radarr', radarrUrl);
                        setShowJellyfinModal(false);
                        sound.playSuccess();
                      }}
                      className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
                    >
                      <Check size={14} /> Save Radarr URL
                    </button>
                  </div>
                </>
              )}

              {jellyfinModalTab === 'dim' && (
                <>
                  <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200/90 leading-relaxed">
                    <strong className="text-indigo-300 font-bold block mb-1">Dim — Rust-Based Lighter Alternative to Jellyfin</strong>
                    Written in Rust with an ultra-clean codebase, Dim is designed as an extremely lightweight self-hosted media server for minimal RAM footprint environments (Raspberry Pi, small VPS).
                  </div>
                  <div className="text-xs text-white/60 leading-relaxed">
                    If you are hosting on low-resource machines and prefer a lean Rust backend, Dim provides a nimble web client and fast direct stream playback.
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="h-12 px-6 border-t border-white/10 flex items-center justify-between bg-white/[0.02] text-[10px] text-white/40">
              <span>Saved locally in browser storage</span>
              <button
                onClick={() => {
                  sound.playClick();
                  setShowJellyfinModal(false);
                }}
                className="text-white/60 hover:text-white font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
