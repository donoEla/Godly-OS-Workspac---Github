import React, { useState, useMemo } from 'react';
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
  Sparkles
} from 'lucide-react';
import { sound } from '../../utils/sound';

export interface MediaItem {
  id: string;
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
  episodesPerSeason?: number;
}

export const CURATED_MOVIES_AND_SHOWS: MediaItem[] = [
  {
    id: 'dune-part-two',
    tmdbId: 693134,
    title: 'Dune: Part Two',
    type: 'movie',
    rating: 8.6,
    year: 2024,
    poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s5200bm.jpg',
    genres: ['Sci-Fi', 'Adventure', 'Action'],
    overview: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
  },
  {
    id: 'deadpool-and-wolverine',
    tmdbId: 533535,
    title: 'Deadpool & Wolverine',
    type: 'movie',
    rating: 8.1,
    year: 2024,
    poster: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/yDHYTfA3R0jFYba16jBB1jv8M97.jpg',
    genres: ['Action', 'Comedy', 'Sci-Fi'],
    overview: 'A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit up again.',
  },
  {
    id: 'oppenheimer',
    tmdbId: 872585,
    title: 'Oppenheimer',
    type: 'movie',
    rating: 8.8,
    year: 2023,
    poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/fm6K9vYQ79FGzOKmNavflvfImYv.jpg',
    genres: ['Drama', 'History', 'Biography'],
    overview: 'The story of J. Robert Oppenheimer\'s role in the development of the atomic bomb during World War II.',
  },
  {
    id: 'spider-man-across-the-spider-verse',
    tmdbId: 569094,
    title: 'Spider-Man: Across the Spider-Verse',
    type: 'movie',
    rating: 8.7,
    year: 2023,
    poster: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
    genres: ['Animation', 'Action', 'Sci-Fi'],
    overview: 'After reuniting with Gwen Stacy, Brooklyn\'s full-time friendly neighborhood Spider-Man is catapulted across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
  },
  {
    id: 'interstellar',
    tmdbId: 157336,
    title: 'Interstellar',
    type: 'movie',
    rating: 8.9,
    year: 2014,
    poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    genres: ['Sci-Fi', 'Drama', 'Adventure'],
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
  },
  {
    id: 'the-batman',
    tmdbId: 414906,
    title: 'The Batman',
    type: 'movie',
    rating: 8.4,
    year: 2022,
    poster: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/5P8SmMzSNYikXpxil6BYzJ16611.jpg',
    genres: ['Crime', 'Mystery', 'Action'],
    overview: 'In his second year of fighting crime, Batman uncovers corruption in Gotham City that connects to his own family while facing a serial killer known as the Riddler.',
  },
  {
    id: 'stranger-things',
    tmdbId: 66732,
    title: 'Stranger Things',
    type: 'tv',
    rating: 8.7,
    year: 2016,
    poster: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    genres: ['Sci-Fi', 'Mystery', 'Drama', 'Horror'],
    overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
    seasonsCount: 4,
    episodesPerSeason: 9,
  },
  {
    id: 'the-last-of-us',
    tmdbId: 100088,
    title: 'The Last of Us',
    type: 'tv',
    rating: 8.8,
    year: 2023,
    poster: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2V7JMrRI.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg',
    genres: ['Drama', 'Sci-Fi', 'Action'],
    overview: 'Twenty years after a fungal outbreak devastates humanity, hardened survivor Joel is tasked with escorting 14-year-old Ellie across a post-apocalyptic United States.',
    seasonsCount: 1,
    episodesPerSeason: 9,
  },
  {
    id: 'arcane',
    tmdbId: 94605,
    title: 'Arcane',
    type: 'tv',
    rating: 9.0,
    year: 2021,
    poster: 'https://image.tmdb.org/t/p/w500/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/q8eejuyEZPtJez4ikwK13b4k45x.jpg',
    genres: ['Animation', 'Sci-Fi', 'Action', 'Fantasy'],
    overview: 'Amid the stark discord of twin cities Piltover and Zaun, two sisters fight on rival sides of a brewing war between magic technologies and incompatible convictions.',
    seasonsCount: 2,
    episodesPerSeason: 9,
  },
  {
    id: 'breaking-bad',
    tmdbId: 1396,
    title: 'Breaking Bad',
    type: 'tv',
    rating: 9.5,
    year: 2008,
    poster: 'https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
    genres: ['Drama', 'Crime', 'Thriller'],
    overview: 'A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student in order to secure his family\'s financial future.',
    seasonsCount: 5,
    episodesPerSeason: 16,
  },
  {
    id: 'avatar-the-way-of-water',
    tmdbId: 76600,
    title: 'Avatar: The Way of Water',
    type: 'movie',
    rating: 8.1,
    year: 2022,
    poster: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg',
    genres: ['Sci-Fi', 'Adventure', 'Action'],
    overview: 'Set more than a decade after the events of the first film, learn the story of the Sully family, the trouble that follows them, the lengths they go to keep each other safe, the battles they fight to stay alive, and the tragedies they endure.',
  },
  {
    id: 'the-boys',
    tmdbId: 76479,
    title: 'The Boys',
    type: 'tv',
    rating: 8.6,
    year: 2019,
    poster: 'https://image.tmdb.org/t/p/w500/2zmTngn1tYC1AvfnrFLhxeD82hz.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/n6bUvigpRFqSwmPp1m2YADdbRBc.jpg',
    genres: ['Sci-Fi', 'Action', 'Comedy'],
    overview: 'A fun and irreverent take on what happens when superheroes—who are as popular as celebrities—abuse their superpowers rather than use them for good.',
    seasonsCount: 4,
    episodesPerSeason: 8,
  }
];

export const PROVIDERS = [
  { id: 'autoembed', name: 'AutoEmbed (Ultra HD)', getUrl: (m: MediaItem, s: number, e: number) => `https://player.autoembed.cc/embed/${m.type}/${m.tmdbId}${m.type === 'tv' ? `/${s}/${e}` : ''}` },
  { id: 'superembed', name: 'SuperEmbed (Fast)', getUrl: (m: MediaItem, s: number, e: number) => `https://multiembed.mov/?video_id=${m.tmdbId}&tmdb=1${m.type === 'tv' ? `&s=${s}&e=${e}` : ''}` },
  { id: 'vidlink', name: 'VidLink Pro', getUrl: (m: MediaItem, s: number, e: number) => `https://vidlink.pro/${m.type}/${m.tmdbId}${m.type === 'tv' ? `/${s}/${e}` : ''}` },
  { id: '2embed', name: '2Embed CDN', getUrl: (m: MediaItem, s: number, e: number) => `https://www.2embed.cc/embed/${m.type === 'tv' ? 'tv/' : ''}${m.tmdbId}${m.type === 'tv' ? `&s=${s}&e=${e}` : ''}` },
  { id: 'vidsrc', name: 'VidSrc Direct', getUrl: (m: MediaItem, s: number, e: number) => `https://vidsrc.to/embed/${m.type}/${m.tmdbId}${m.type === 'tv' ? `/${s}/${e}` : ''}` }
];

export const GENRES = ['All', 'Movies', 'TV Shows', 'Sci-Fi', 'Action', 'Drama', 'Comedy', 'Animation', 'Crime'];

export const MoviesApp: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
  const [activeProvider, setActiveProvider] = useState<string>('autoembed');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [streamUrlKey, setStreamUrlKey] = useState<number>(0);
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('godly_movies_bookmarks');
      return saved ? JSON.parse(saved) : ['dune-part-two', 'arcane'];
    } catch {
      return ['dune-part-two', 'arcane'];
    }
  });

  const toggleBookmark = (id: string) => {
    sound.playClick();
    setBookmarks(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('godly_movies_bookmarks', JSON.stringify(next));
      return next;
    });
  };

  const filteredMedia = useMemo(() => {
    return CURATED_MOVIES_AND_SHOWS.filter((m) => {
      if (selectedGenre === 'Movies' && m.type !== 'movie') return false;
      if (selectedGenre === 'TV Shows' && m.type !== 'tv') return false;
      if (selectedGenre !== 'All' && selectedGenre !== 'Movies' && selectedGenre !== 'TV Shows') {
        if (!m.genres.includes(selectedGenre)) return false;
      }
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        m.overview.toLowerCase().includes(q) ||
        m.genres.some(g => g.toLowerCase().includes(q))
      );
    });
  }, [search, selectedGenre]);

  const currentProviderObj = useMemo(() => {
    return PROVIDERS.find(p => p.id === activeProvider) || PROVIDERS[0];
  }, [activeProvider]);

  const currentEmbedUrl = useMemo(() => {
    if (!selectedMedia) return '';
    return currentProviderObj.getUrl(selectedMedia, selectedSeason, selectedEpisode);
  }, [selectedMedia, currentProviderObj, selectedSeason, selectedEpisode]);

  // Video Player View
  if (isPlaying && selectedMedia) {
    return (
      <div className="w-full h-full flex flex-col bg-black text-white select-none">
        {/* Player Header Bar */}
        <div className="h-14 px-4 bg-[#0a0a14]/95 border-b border-white/10 flex items-center justify-between shrink-0 backdrop-blur-md z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sound.playClick();
                setIsPlaying(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-white transition-all"
            >
              <X size={14} /> Exit Player
            </button>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-md">
                {selectedMedia.title}
              </span>
              <span className="text-[10px] text-amber-400 font-mono">
                {selectedMedia.type === 'tv'
                  ? `Season ${selectedSeason} • Episode ${selectedEpisode}`
                  : `${selectedMedia.year} • 4K HDR`}
              </span>
            </div>
          </div>

          {/* Provider / Server Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white/[0.04] p-1 rounded-xl border border-white/10 text-xs">
              <Server size={12} className="text-purple-400 ml-1.5" />
              <select
                value={activeProvider}
                onChange={(e) => {
                  sound.playClick();
                  setActiveProvider(e.target.value);
                  setStreamUrlKey(k => k + 1);
                }}
                className="bg-transparent text-white text-xs font-semibold outline-none cursor-pointer pr-2"
              >
                {PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#0f111a] text-white">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                setStreamUrlKey(k => k + 1);
              }}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-white/80 hover:text-white transition-all"
              title="Refresh Stream"
            >
              <RotateCcw size={14} />
            </button>

            <a
              href={currentEmbedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-white/80 hover:text-white transition-all"
              title="Open in new window"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Video Iframe Embed */}
        <div className="flex-1 w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
          <iframe
            key={`${currentEmbedUrl}-${streamUrlKey}`}
            src={currentEmbedUrl}
            title={selectedMedia.title}
            className="w-full h-full border-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#07070e] text-white select-none overflow-hidden font-sans">
      {/* Top Navigation & Search Bar */}
      <div className="p-4 sm:p-5 border-b border-white/[0.08] bg-gradient-to-r from-[#17091f]/80 via-[#0e0c1a]/80 to-[#0a0714]/80 shrink-0 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-rose-500 to-purple-600 p-0.5 shadow-lg shadow-rose-950/40 flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] bg-[#0c0a18] flex items-center justify-center">
                <Film size={20} className="text-rose-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  StreamFlix Cinema <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono border border-rose-500/30">TMDB &amp; AutoEmbed</span>
                </h1>
              </div>
              <p className="text-[11px] text-white/50">
                Lightweight high-definition movies &amp; television series streaming hub.
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search movies, TV shows, genres..."
                className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-white/[0.05] border border-white/10 text-white placeholder-white/30 outline-none focus:border-rose-500/60 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-0.5 custom-scrollbar">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => {
                sound.playClick();
                setSelectedGenre(g);
              }}
              className={`px-3 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all border ${
                selectedGenre === g
                  ? 'bg-gradient-to-r from-rose-600 to-amber-600 border-rose-400 text-white shadow-md shadow-rose-950/30'
                  : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 text-white/70 hover:text-white'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid & Details View */}
      <div className="flex-1 w-full min-h-0 flex overflow-hidden">
        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {filteredMedia.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center">
                <Film size={48} className="text-white/20 mb-3" />
                <h3 className="text-base font-bold text-white">No Movies or Shows Found</h3>
                <p className="text-xs text-white/40 mt-1 max-w-sm">
                  Try adjusting your search terms or genre filter.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredMedia.map((item) => {
                  const isBookmarked = bookmarks.includes(item.id);
                  const isSelected = selectedMedia?.id === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        sound.playClick();
                        setSelectedMedia(item);
                        setSelectedSeason(1);
                        setSelectedEpisode(1);
                      }}
                      className={`group relative flex flex-col rounded-2xl overflow-hidden border cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-rose-500 ring-2 ring-rose-500/30 shadow-xl shadow-rose-950/40 scale-[1.02] bg-[#140c16]'
                          : 'border-white/10 hover:border-rose-400/40 bg-[#0d0c14] hover:bg-[#13111c] hover:-translate-y-1 hover:shadow-lg'
                      }`}
                    >
                      {/* Poster Aspect Ratio Box */}
                      <div className="relative w-full aspect-[2/3] overflow-hidden bg-black/60">
                        <img
                          src={item.poster}
                          alt={item.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0c14] via-transparent to-black/30" />

                        {/* Top Rating */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-bold text-amber-300">
                          <Star size={10} className="fill-amber-400 text-amber-400" />
                          <span>{item.rating}</span>
                        </div>

                        {/* Type Badge */}
                        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/15 text-[9px] font-bold uppercase font-mono tracking-wider text-rose-300">
                          {item.type}
                        </div>

                        {/* Hover Quick Play Button */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs">
                          <div className="w-12 h-12 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg shadow-rose-950/50 transform scale-75 group-hover:scale-100 transition-transform">
                            <Play size={22} className="fill-white ml-1" />
                          </div>
                        </div>

                        {/* Year */}
                        <div className="absolute bottom-2 left-2.5 text-[10px] font-mono text-white/70">
                          {item.year}
                        </div>
                      </div>

                      {/* Info Area */}
                      <div className="p-3 flex flex-col flex-1 justify-between gap-1.5">
                        <h3 className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors line-clamp-1">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-1 flex-wrap">
                          {item.genres.slice(0, 2).map((g) => (
                            <span
                              key={g}
                              className="text-[9px] px-1.5 py-0.2 rounded-md bg-white/[0.04] text-white/60 border border-white/[0.06]"
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Selected Media Detail Sidebar */}
        {selectedMedia && (
          <div className="w-80 sm:w-96 border-l border-white/10 bg-[#0a0814]/95 backdrop-blur-xl flex flex-col shrink-0 overflow-y-auto custom-scrollbar p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                {selectedMedia.type === 'tv' ? 'TV Series Info' : 'Movie Premiere'}
              </span>
              <button
                onClick={() => setSelectedMedia(null)}
                className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Poster & Title Header */}
            <div className="flex gap-4 mb-4">
              <img
                src={selectedMedia.poster}
                alt={selectedMedia.title}
                className="w-24 aspect-[2/3] object-cover rounded-xl border border-white/15 shadow-md shadow-black/50 shrink-0"
              />
              <div className="flex flex-col justify-between">
                <div>
                  <h2 className="text-sm font-black text-white leading-tight">
                    {selectedMedia.title}
                  </h2>
                  <p className="text-[10px] text-white/50 font-mono mt-1">
                    {selectedMedia.year} • {selectedMedia.type.toUpperCase()}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-300 px-2 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/20">
                    <Star size={11} className="fill-amber-400 text-amber-400" />
                    {selectedMedia.rating} / 10
                  </span>
                  <button
                    onClick={() => toggleBookmark(selectedMedia.id)}
                    className={`p-1.5 rounded-md border text-xs transition-all ${
                      bookmarks.includes(selectedMedia.id)
                        ? 'bg-rose-600/30 border-rose-400 text-rose-200'
                        : 'bg-white/[0.04] border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    <Bookmark size={12} className={bookmarks.includes(selectedMedia.id) ? 'fill-rose-400' : ''} />
                  </button>
                </div>
              </div>
            </div>

            {/* TV Show Season & Episode Pickers */}
            {selectedMedia.type === 'tv' && (
              <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/[0.08] mb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white/80 font-mono">Season</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: selectedMedia.seasonsCount || 1 }, (_, i) => i + 1).map((sNum) => (
                      <button
                        key={sNum}
                        onClick={() => {
                          sound.playClick();
                          setSelectedSeason(sNum);
                          setSelectedEpisode(1);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all border ${
                          selectedSeason === sNum
                            ? 'bg-rose-600 border-rose-400 text-white shadow-sm'
                            : 'bg-white/[0.03] border-white/10 text-white/60 hover:text-white'
                        }`}
                      >
                        S{sNum}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-white/60 font-mono mb-1.5 block">
                    Episode (Season {selectedSeason})
                  </span>
                  <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto custom-scrollbar pr-1">
                    {Array.from({ length: selectedMedia.episodesPerSeason || 8 }, (_, i) => i + 1).map((epNum) => (
                      <button
                        key={epNum}
                        onClick={() => {
                          sound.playClick();
                          setSelectedEpisode(epNum);
                        }}
                        className={`py-1.5 px-2 rounded-lg text-xs font-mono font-semibold transition-all border text-center ${
                          selectedEpisode === epNum
                            ? 'bg-rose-600 border-rose-400 text-white shadow-sm'
                            : 'bg-white/[0.03] border-white/10 text-white/60 hover:text-white'
                        }`}
                      >
                        Ep {epNum}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Play Button */}
            <button
              onClick={() => {
                sound.playClick();
                setIsPlaying(true);
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm shadow-xl shadow-rose-950/40 flex items-center justify-center gap-2 mb-4 transition-all"
            >
              <Play size={18} className="fill-white" />
              <span>
                {selectedMedia.type === 'tv'
                  ? `Play S${selectedSeason} E${selectedEpisode}`
                  : 'Watch Movie Now'}
              </span>
            </button>

            {/* Genres */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {selectedMedia.genres.map((g) => (
                <span
                  key={g}
                  className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08] text-[10px] text-white/70"
                >
                  {g}
                </span>
              ))}
            </div>

            {/* Synopsis */}
            <div>
              <h4 className="text-xs font-bold text-white/80 uppercase tracking-wider mb-1.5 font-mono">
                Storyline
              </h4>
              <p className="text-xs text-white/60 leading-relaxed font-sans">
                {selectedMedia.overview}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
