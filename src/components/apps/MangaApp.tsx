import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BookOpen,
  Search,
  Sparkles,
  Star,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Bookmark,
  Layers,
  Flame,
  Clock,
  Eye,
  ExternalLink,
  RotateCcw,
  SlidersHorizontal,
  ArrowLeft
} from 'lucide-react';
import { sound } from '../../utils/sound';

export interface MangaItem {
  id: string;
  title: string;
  altTitle?: string;
  cover: string;
  rating: number;
  status: 'ongoing' | 'completed';
  chaptersCount: number;
  tags: string[];
  author: string;
  year: number;
  description: string;
  readerUrl?: string;
  samplePages?: string[];
}

export const CURATED_MANGA_COLLECTION: MangaItem[] = [
  {
    id: 'solo-leveling',
    title: 'Solo Leveling',
    altTitle: 'Na Honjaman Rebeleop',
    cover: 'https://uploads.mangadex.org/covers/32d76d19-8a05-4db0-9fc2-e0b0648fe9d0/d814ec96-1c49-43c2-8fe0-c9771e8a4d46.jpg',
    rating: 9.8,
    status: 'completed',
    chaptersCount: 179,
    tags: ['Action', 'Fantasy', 'Supernatural', 'Monsters', 'System'],
    author: 'Chugong & DUBU',
    year: 2018,
    description: '10 years ago, the Gates opened connecting our world to monster dungeons. Sung Jin-woo, known as the weakest E-rank hunter, is brutally slaughtered in a high-rank double dungeon, but awakes to a mysterious quest system granting him limitless growth.',
    readerUrl: 'https://mangadex.org/title/32d76d19-8a05-4db0-9fc2-e0b0648fe9d0/solo-leveling',
    samplePages: [
      'https://mangadex.org/covers/32d76d19-8a05-4db0-9fc2-e0b0648fe9d0/d814ec96-1c49-43c2-8fe0-c9771e8a4d46.jpg'
    ]
  },
  {
    id: 'one-piece',
    title: 'One Piece',
    altTitle: 'WAN PĪSU',
    cover: 'https://uploads.mangadex.org/covers/a1c7c817-4e59-43b7-9365-09675a149a6f/1d0a5148-18e0-47b2-b13c-53f08ca6fae6.jpg',
    rating: 9.9,
    status: 'ongoing',
    chaptersCount: 1130,
    tags: ['Action', 'Adventure', 'Pirates', 'Superpowers', 'Shounen'],
    author: 'Eiichiro Oda',
    year: 1997,
    description: 'Gol D. Roger, the legendary King of the Pirates, reveals the existence of the ultimate treasure One Piece right before his execution. Monkey D. Luffy sets sail with his crew, the Straw Hat Pirates, to conquer the Grand Line and claim the title.',
    readerUrl: 'https://mangadex.org/title/a1c7c817-4e59-43b7-9365-09675a149a6f/one-piece',
  },
  {
    id: 'jujutsu-kaisen',
    title: 'Jujutsu Kaisen',
    altTitle: 'Sorcery Fight',
    cover: 'https://uploads.mangadex.org/covers/c52b2ce3-7f95-469c-96b0-479524fb7a1a/40b3341b-4395-4ef5-83e9-a3b04396b2ea.jpg',
    rating: 9.7,
    status: 'completed',
    chaptersCount: 271,
    tags: ['Action', 'Dark Fantasy', 'Supernatural', 'Curse', 'Shounen'],
    author: 'Gege Akutami',
    year: 2018,
    description: 'High schooler Yuji Itadori swallows a cursed talisman—the finger of the King of Curses Sukuna—to save his friends. Under the guidance of Satoru Gojo, Yuji enters Tokyo Jujutsu High to exorcise curses and find Sukuna\'s remaining fingers.',
    readerUrl: 'https://mangadex.org/title/c52b2ce3-7f95-469c-96b0-479524fb7a1a/jujutsu-kaisen',
  },
  {
    id: 'chainsaw-man',
    title: 'Chainsaw Man',
    altTitle: 'Chainsaw Man Part 2',
    cover: 'https://uploads.mangadex.org/covers/a77742c1-fda2-40e3-980a-019349ff7e28/97cf6741-285d-4f18-bb9d-922dfb420ee9.jpg',
    rating: 9.6,
    status: 'ongoing',
    chaptersCount: 180,
    tags: ['Action', 'Gore', 'Dark Fantasy', 'Demons', 'Comedy'],
    author: 'Tatsuki Fujimoto',
    year: 2018,
    description: 'Denji is a teenage boy living in extreme poverty, working as a devil hunter alongside his chainsaw-dog Pochita to pay off his late father\'s debt. After a betrayal, Denji is revived as the devil-human hybrid Chainsaw Man.',
    readerUrl: 'https://mangadex.org/title/a77742c1-fda2-40e3-980a-019349ff7e28/chainsaw-man',
  },
  {
    id: 'berserk',
    title: 'Berserk',
    altTitle: 'Beruseruku',
    cover: 'https://uploads.mangadex.org/covers/801513ba-a712-498b-8f57-415b86f79b5f/2f3a4794-5cb8-477c-a496-e7e2c9066668.jpg',
    rating: 10.0,
    status: 'ongoing',
    chaptersCount: 376,
    tags: ['Dark Fantasy', 'Seinen', 'Psychological', 'Military', 'Demons'],
    author: 'Kentaro Miura',
    year: 1989,
    description: 'Guts, known as the Black Swordsman, seeks sanctuary from the demonic forces that pursue him and his lover, and vengeance against the man who branded him as an unholy sacrifice: his former commander and friend, Griffith.',
    readerUrl: 'https://mangadex.org/title/801513ba-a712-498b-8f57-415b86f79b5f/berserk',
  },
  {
    id: 'dandadan',
    title: 'Dandadan',
    altTitle: 'Dan Da Dan',
    cover: 'https://uploads.mangadex.org/covers/4e8b0906-897e-428b-ab29-430347607736/6f75db19-c1bb-45b7-a3cf-bc8bc4e86a5d.jpg',
    rating: 9.6,
    status: 'ongoing',
    chaptersCount: 172,
    tags: ['Action', 'Comedy', 'Supernatural', 'Aliens', 'Ghosts', 'Romance'],
    author: 'Yukinobu Tatsu',
    year: 2021,
    description: 'Momo Ayase believes in ghosts but rejects aliens; Okarun believes in aliens but rejects ghosts. To prove each other wrong, they visit paranormal hotspots and awaken terrifying extraterrestrial and occult curses.',
    readerUrl: 'https://mangadex.org/title/4e8b0906-897e-428b-ab29-430347607736/dandadan',
  },
  {
    id: 'frieren',
    title: 'Frieren: Beyond Journey\'s End',
    altTitle: 'Sousou no Frieren',
    cover: 'https://uploads.mangadex.org/covers/b0b721ff-c388-4486-aa0f-c8b0e921824b/cb2e8318-774f-4d26-b186-b481615a6bfa.jpg',
    rating: 9.8,
    status: 'ongoing',
    chaptersCount: 135,
    tags: ['Adventure', 'Drama', 'Fantasy', 'Magic', 'Slice of Life'],
    author: 'Kanehito Yamada & Tsukasa Abe',
    year: 2020,
    description: 'The hero party defeated the Demon King, bringing peace to the realm. For the elven mage Frieren, fifty years pass in the blink of an eye. After attending the funeral of hero Himmel, she embarks on a journey to truly understand humans.',
    readerUrl: 'https://mangadex.org/title/b0b721ff-c388-4486-aa0f-c8b0e921824b/frieren-at-the-funeral',
  },
  {
    id: 'spy-x-family',
    title: 'Spy x Family',
    altTitle: 'SPY×FAMILY',
    cover: 'https://uploads.mangadex.org/covers/64562060-4965-4f46-993d-d557342721f4/ec48e7e1-8857-4186-b605-2b47e2ecdb34.jpg',
    rating: 9.5,
    status: 'ongoing',
    chaptersCount: 105,
    tags: ['Comedy', 'Action', 'Family', 'Espionage', 'Shounen'],
    author: 'Tatsuya Endo',
    year: 2019,
    description: 'Master spy Twilight must build a sham family to infiltrate an elite academy. Unbeknownst to him, his adopted daughter Anya is a telepath, and his fabricated wife Yor is a lethal assassin—with only Anya knowing all three secrets.',
    readerUrl: 'https://mangadex.org/title/64562060-4965-4f46-993d-d557342721f4/spy-x-family',
  },
  {
    id: 'blue-lock',
    title: 'Blue Lock',
    altTitle: 'BURŪ ROKKU',
    cover: 'https://uploads.mangadex.org/covers/71239c0d-beee-43ea-9477-94d13f9f4a01/47aeae68-3e40-4fe7-8ae3-9d48b783f6f1.jpg',
    rating: 9.4,
    status: 'ongoing',
    chaptersCount: 280,
    tags: ['Sports', 'Psychological', 'Soccer', 'Competition', 'Shounen'],
    author: 'Muneyuki Kaneshiro & Yusuke Nomura',
    year: 2018,
    description: 'After a disastrous 2018 World Cup exit, the Japan Football Union hires eccentric coach Jinpachi Ego. He gathers 300 high school forwards in the prison-like Blue Lock facility, aiming to forge the most egotistical striker on Earth.',
    readerUrl: 'https://mangadex.org/title/71239c0d-beee-43ea-9477-94d13f9f4a01/blue-lock',
  },
  {
    id: 'kaiju-no-8',
    title: 'Kaiju No. 8',
    altTitle: 'Monster #8',
    cover: 'https://uploads.mangadex.org/covers/c11a083d-3b7c-4740-9e6b-60a63fa54e56/67634ca3-d28f-4ca6-a212-6893fa91bb44.jpg',
    rating: 9.3,
    status: 'ongoing',
    chaptersCount: 116,
    tags: ['Action', 'Sci-Fi', 'Monsters', 'Military', 'Shounen'],
    author: 'Naoya Matsumoto',
    year: 2020,
    description: 'Kafka Hibino, a 32-year-old monster corpse cleaner who gave up his dream of joining the Defense Force, suddenly gains the power to transform into a devastating humanoid monster codenamed Kaiju No. 8.',
    readerUrl: 'https://mangadex.org/title/c11a083d-3b7c-4740-9e6b-60a63fa54e56/kaiju-no-8',
  },
  {
    id: 'attack-on-titan',
    title: 'Attack on Titan',
    altTitle: 'Shingeki no Kyojin',
    cover: 'https://uploads.mangadex.org/covers/30465500-98b3-43da-9eff-f9746e336e4f/bf0df841-ba95-4673-95b8-508bfae830d9.jpg',
    rating: 9.8,
    status: 'completed',
    chaptersCount: 139,
    tags: ['Dark Fantasy', 'Post-Apocalyptic', 'Military', 'Titans', 'Mystery'],
    author: 'Hajime Isayama',
    year: 2009,
    description: 'Humankind lives inside gigantic walled cities to shelter from colossal man-eating Titans. When the outermost wall falls, Eren Yeager vows to eradicate every Titan from the face of the Earth.',
    readerUrl: 'https://mangadex.org/title/30465500-98b3-43da-9eff-f9746e336e4f/attack-on-titan',
  },
  {
    id: 'demon-slayer',
    title: 'Demon Slayer: Kimetsu no Yaiba',
    altTitle: 'Kimetsu no Yaiba',
    cover: 'https://uploads.mangadex.org/covers/0e227a92-f0b4-4b55-a22a-cf0a931327c1/a1d3fe6b-950c-4fa2-b25c-0cfbd6652cb6.jpg',
    rating: 9.6,
    status: 'completed',
    chaptersCount: 205,
    tags: ['Action', 'Historical', 'Demons', 'Swords', 'Supernatural'],
    author: 'Koyoharu Gotouge',
    year: 2016,
    description: 'Tanjiro Kamado returns home from selling charcoal to discover his entire family slaughtered by demons, and his sister Nezuko turned into a demon. Tanjiro trains to join the Demon Slayer Corps and cure his sister.',
    readerUrl: 'https://mangadex.org/title/0e227a92-f0b4-4b55-a22a-cf0a931327c1/demon-slayer-kimetsu-no-yaiba',
  }
];

export const ALL_MANGA_TAGS = [
  'All',
  'Action',
  'Fantasy',
  'Shounen',
  'Dark Fantasy',
  'Supernatural',
  'Comedy',
  'Adventure',
  'Sci-Fi',
  'Sports',
  'Romance'
];

export const MangaApp: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [selectedManga, setSelectedManga] = useState<MangaItem | null>(null);
  const [readingChapter, setReadingChapter] = useState<{ number: number; title: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'trending' | 'popular' | 'library'>('trending');
  const [readerZoom, setReaderZoom] = useState<number>(100);
  const [readerMode, setReaderMode] = useState<'webtoon' | 'direct-embed'>('direct-embed');
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('godly_manga_bookmarks');
      return saved ? JSON.parse(saved) : ['solo-leveling', 'one-piece'];
    } catch {
      return ['solo-leveling', 'one-piece'];
    }
  });

  const toggleBookmark = (id: string) => {
    sound.playClick();
    setBookmarks(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('godly_manga_bookmarks', JSON.stringify(next));
      return next;
    });
  };

  const filteredManga = useMemo(() => {
    return CURATED_MANGA_COLLECTION.filter((m) => {
      if (activeTab === 'library') {
        if (!bookmarks.includes(m.id)) return false;
      }
      const matchesSearch =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.altTitle && m.altTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        m.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTag = selectedTag === 'All' || m.tags.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [searchQuery, selectedTag, activeTab, bookmarks]);

  // Reader Window View
  if (selectedManga && readingChapter) {
    const embedUrl = selectedManga.readerUrl || `https://mangadex.org/title/${selectedManga.id}`;

    return (
      <div className="w-full h-full flex flex-col bg-[#06070c] text-white select-none">
        {/* Reader Top Navigation Bar */}
        <div className="h-14 px-4 bg-[#0a0c16]/95 border-b border-white/10 flex items-center justify-between shrink-0 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sound.playClick();
                setReadingChapter(null);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-white/90 hover:text-white transition-all"
            >
              <ArrowLeft size={14} /> Back to Chapters
            </button>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white truncate max-w-[240px] sm:max-w-md">
                {selectedManga.title}
              </span>
              <span className="text-[10px] text-purple-400 font-mono">
                Chapter {readingChapter.number}: {readingChapter.title}
              </span>
            </div>
          </div>

          {/* Reader Controls */}
          <div className="flex items-center gap-2">
            <button
              disabled={readingChapter.number <= 1}
              onClick={() => {
                sound.playClick();
                setReadingChapter(prev => prev ? { number: prev.number - 1, title: `Chapter ${prev.number - 1}` } : null);
              }}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 disabled:opacity-30 disabled:pointer-events-none text-white transition-all"
              title="Previous Chapter"
            >
              <ChevronLeft size={15} />
            </button>

            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/30 rounded-xl">
              Ch. {readingChapter.number}
            </span>

            <button
              disabled={readingChapter.number >= selectedManga.chaptersCount}
              onClick={() => {
                sound.playClick();
                setReadingChapter(prev => prev ? { number: prev.number + 1, title: `Chapter ${prev.number + 1}` } : null);
              }}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 disabled:opacity-30 disabled:pointer-events-none text-white transition-all"
              title="Next Chapter"
            >
              <ChevronRight size={15} />
            </button>

            <a
              href={embedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-white/80 hover:text-white transition-all"
              title="Open in MangaDex"
            >
              <ExternalLink size={15} />
            </a>

            <button
              onClick={() => {
                sound.playClick();
                setSelectedManga(null);
                setReadingChapter(null);
              }}
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 transition-all ml-1"
              title="Close Reader"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Reader Frame Content */}
        <div className="flex-1 w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
          <iframe
            src={embedUrl}
            title={`${selectedManga.title} - Chapter ${readingChapter.number}`}
            className="w-full h-full border-none"
            allow="fullscreen; autoplay; clipboard-read; clipboard-write"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#070810] text-white select-none overflow-hidden font-sans">
      {/* Top Header Bar */}
      <div className="p-4 sm:p-5 border-b border-white/[0.08] bg-gradient-to-r from-[#140b2b]/80 via-[#0d0e1c]/80 to-[#0a0818]/80 shrink-0 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 p-0.5 shadow-lg shadow-purple-950/40 flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] bg-[#0c0d18] flex items-center justify-center">
                <BookOpen size={20} className="text-pink-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  Godly Manga <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-mono border border-pink-500/30">MangaDex v5 API</span>
                </h1>
              </div>
              <p className="text-[11px] text-white/50">
                Immersive reader for thousands of trending manga series & high-res chapters.
              </p>
            </div>
          </div>

          {/* Search & Navigation Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search series, authors, tags..."
                className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-white/[0.05] border border-white/10 text-white placeholder-white/30 outline-none focus:border-purple-500/60 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Library / Bookmarks Tabs */}
            <div className="flex items-center bg-white/[0.04] p-0.5 rounded-xl border border-white/10">
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab('trending');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'trending'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Flame size={12} /> Trending
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab('library');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'library'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Bookmark size={12} /> Bookmarks ({bookmarks.length})
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-0.5 custom-scrollbar">
          {ALL_MANGA_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                sound.playClick();
                setSelectedTag(tag);
              }}
              className={`px-3 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all border ${
                selectedTag === tag
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 border-pink-400 text-white shadow-md shadow-pink-950/30'
                  : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 text-white/70 hover:text-white'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid & Detail Split */}
      <div className="flex-1 w-full min-h-0 flex overflow-hidden">
        {/* Manga Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {filteredManga.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center">
                <BookOpen size={48} className="text-white/20 mb-3" />
                <h3 className="text-base font-bold text-white">No Manga Series Found</h3>
                <p className="text-xs text-white/40 mt-1 max-w-sm">
                  Try adjusting your search terms or clearing category filters.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTag('All');
                    setActiveTab('trending');
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition-all"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredManga.map((manga) => {
                  const isBookmarked = bookmarks.includes(manga.id);
                  const isSelected = selectedManga?.id === manga.id;

                  return (
                    <div
                      key={manga.id}
                      onClick={() => {
                        sound.playClick();
                        setSelectedManga(manga);
                      }}
                      className={`group relative flex flex-col rounded-2xl overflow-hidden border cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-purple-500 ring-2 ring-purple-500/30 shadow-xl shadow-purple-950/40 scale-[1.02] bg-[#121424]'
                          : 'border-white/10 hover:border-purple-400/40 bg-[#0c0d18] hover:bg-[#111322] hover:-translate-y-1 hover:shadow-lg'
                      }`}
                    >
                      {/* Manga Cover Aspect Ratio Box */}
                      <div className="relative w-full aspect-[3/4] overflow-hidden bg-black/60">
                        <img
                          src={manga.cover}
                          alt={manga.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            // Fallback gradient if hotlink fails
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d18] via-transparent to-black/30" />

                        {/* Top Rating Badge */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-bold text-amber-300">
                          <Star size={10} className="fill-amber-400 text-amber-400" />
                          <span>{manga.rating}</span>
                        </div>

                        {/* Bookmark Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(manga.id);
                          }}
                          className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg backdrop-blur-md border transition-all ${
                            isBookmarked
                              ? 'bg-purple-600 border-purple-400 text-white'
                              : 'bg-black/60 border-white/15 text-white/60 hover:text-white'
                          }`}
                          title={isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
                        >
                          <Bookmark size={12} className={isBookmarked ? 'fill-white' : ''} />
                        </button>

                        {/* Chapter Count Pill */}
                        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-mono font-medium text-white/80">
                          <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/10">
                            {manga.chaptersCount} Chs
                          </span>
                          <span className={`px-1.5 py-0.5 rounded uppercase font-bold text-[9px] ${
                            manga.status === 'ongoing' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}>
                            {manga.status}
                          </span>
                        </div>
                      </div>

                      {/* Info Area */}
                      <div className="p-3 flex flex-col flex-1 justify-between gap-1.5">
                        <div>
                          <h3 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                            {manga.title}
                          </h3>
                          <p className="text-[10px] text-white/40 line-clamp-1">
                            {manga.author} • {manga.year}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-wrap">
                          {manga.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-[9px] px-1.5 py-0.2 rounded-md bg-white/[0.04] text-white/60 border border-white/[0.06]"
                            >
                              {tag}
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

        {/* Selected Manga Detail Sidebar Modal */}
        {selectedManga && (
          <div className="w-80 sm:w-96 border-l border-white/10 bg-[#0a0c16]/95 backdrop-blur-xl flex flex-col shrink-0 overflow-y-auto custom-scrollbar p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                Series Overview
              </span>
              <button
                onClick={() => setSelectedManga(null)}
                className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Poster & Title Header */}
            <div className="flex gap-4 mb-4">
              <img
                src={selectedManga.cover}
                alt={selectedManga.title}
                className="w-24 aspect-[3/4] object-cover rounded-xl border border-white/15 shadow-md shadow-black/50 shrink-0"
              />
              <div className="flex flex-col justify-between">
                <div>
                  <h2 className="text-sm font-black text-white leading-tight">
                    {selectedManga.title}
                  </h2>
                  {selectedManga.altTitle && (
                    <p className="text-[10px] text-white/40 italic mt-0.5">
                      {selectedManga.altTitle}
                    </p>
                  )}
                  <p className="text-[11px] text-purple-300 font-medium mt-1">
                    By {selectedManga.author}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-300 px-2 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/20">
                    <Star size={11} className="fill-amber-400 text-amber-400" />
                    {selectedManga.rating} / 10
                  </span>
                  <span className="text-[10px] text-white/50 font-mono">
                    {selectedManga.year}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Read / Bookmark Actions */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  sound.playClick();
                  setReadingChapter({ number: 1, title: 'Chapter 1: The Beginning' });
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-950/40 flex items-center justify-center gap-2 transition-all"
              >
                <BookOpen size={14} /> Start Reading Ch. 1
              </button>
              <button
                onClick={() => toggleBookmark(selectedManga.id)}
                className={`p-2.5 rounded-xl border transition-all ${
                  bookmarks.includes(selectedManga.id)
                    ? 'bg-purple-600/30 border-purple-400 text-purple-200'
                    : 'bg-white/[0.04] border-white/10 text-white/60 hover:text-white'
                }`}
                title="Bookmark series"
              >
                <Bookmark size={16} className={bookmarks.includes(selectedManga.id) ? 'fill-purple-400' : ''} />
              </button>
            </div>

            {/* Tags list */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {selectedManga.tags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08] text-[10px] text-white/70"
                >
                  {t}
                </span>
              ))}
            </div>

            {/* Synopsis */}
            <div className="mb-5">
              <h4 className="text-xs font-bold text-white/80 uppercase tracking-wider mb-1.5 font-mono">
                Synopsis
              </h4>
              <p className="text-xs text-white/60 leading-relaxed font-sans">
                {selectedManga.description}
              </p>
            </div>

            {/* Chapters list */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-white/80 uppercase tracking-wider font-mono">
                  Chapters ({selectedManga.chaptersCount})
                </h4>
                <span className="text-[10px] text-purple-400 font-mono">English</span>
              </div>

              <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                {Array.from({ length: Math.min(30, selectedManga.chaptersCount) }, (_, i) => i + 1).map((chNum) => (
                  <button
                    key={chNum}
                    onClick={() => {
                      sound.playClick();
                      setReadingChapter({ number: chNum, title: `Chapter ${chNum}` });
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl bg-white/[0.03] hover:bg-purple-600/20 border border-white/[0.06] hover:border-purple-500/40 text-left text-xs transition-all group"
                  >
                    <span className="font-semibold text-white/80 group-hover:text-white">
                      Chapter {chNum}
                    </span>
                    <span className="text-[10px] text-white/40 group-hover:text-purple-300 font-mono flex items-center gap-1">
                      Read <ChevronRight size={12} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
