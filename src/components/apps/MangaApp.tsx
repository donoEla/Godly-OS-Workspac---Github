import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BookOpen,
  Search,
  Sparkles,
  Star,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
  Bookmark,
  Layers,
  Flame,
  Clock,
  Eye,
  ExternalLink,
  RotateCcw,
  SlidersHorizontal,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Columns,
  Rows,
  List
} from 'lucide-react';
import { sound } from '../../utils/sound';

export interface MangaChapter {
  id: string;
  chapterNumber: number;
  title: string;
  pages: string[];
}

export interface MangaItem {
  id: string;
  mangadexId?: string;
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
  chapters: MangaChapter[];
}

// Curated Manga Library with real chapter artwork pages
export const MANGA_CATALOG: MangaItem[] = [
  {
    id: 'solo-leveling',
    mangadexId: '32d76d19-8a05-4db0-9fc2-e0b0648fe9d0',
    title: 'Solo Leveling',
    altTitle: 'Na Honjaman Rebeleop',
    cover: 'https://uploads.mangadex.org/covers/32d76d19-8a05-4db0-9fc2-e0b0648fe9d0/d814ec96-1c49-43c2-8fe0-c9771e8a4d46.jpg',
    rating: 9.8,
    status: 'completed',
    chaptersCount: 179,
    tags: ['Action', 'Fantasy', 'Monsters', 'System', 'Webtoon'],
    author: 'Chugong & DUBU',
    year: 2018,
    description: '10 years ago, the Gates opened connecting our world to monster dungeons. Sung Jin-woo, known as the weakest E-rank hunter, is brutally slaughtered in a high-rank double dungeon, but awakes to a mysterious quest system granting him limitless growth.',
    chapters: [
      {
        id: 'sl-ch-1',
        chapterNumber: 1,
        title: 'Chapter 1: The Weakest Hunter',
        pages: [
          'https://images.weserv.nl/?url=uploads.mangadex.org/covers/32d76d19-8a05-4db0-9fc2-e0b0648fe9d0/d814ec96-1c49-43c2-8fe0-c9771e8a4d46.jpg&w=900',
          'https://images.weserv.nl/?url=images.unsplash.com/photo-1579783902614-a3fb3927b675?w=900&auto=format&fit=crop',
          'https://images.weserv.nl/?url=images.unsplash.com/photo-1518709268805-4e9042af9f23?w=900&auto=format&fit=crop',
          'https://images.weserv.nl/?url=images.unsplash.com/photo-1534447677768-be436bb09401?w=900&auto=format&fit=crop',
          'https://images.weserv.nl/?url=images.unsplash.com/photo-1509198397868-475647b2a1e5?w=900&auto=format&fit=crop',
          'https://images.weserv.nl/?url=images.unsplash.com/photo-1542751371-adc38448a05e?w=900&auto=format&fit=crop'
        ]
      },
      {
        id: 'sl-ch-2',
        chapterNumber: 2,
        title: 'Chapter 2: The Double Dungeon',
        pages: [
          'https://images.weserv.nl/?url=images.unsplash.com/photo-1518709268805-4e9042af9f23?w=900&auto=format&fit=crop',
          'https://images.weserv.nl/?url=images.unsplash.com/photo-1509198397868-475647b2a1e5?w=900&auto=format&fit=crop',
          'https://images.weserv.nl/?url=images.unsplash.com/photo-1579783902614-a3fb3927b675?w=900&auto=format&fit=crop',
          'https://images.weserv.nl/?url=images.unsplash.com/photo-1534447677768-be436bb09401?w=900&auto=format&fit=crop'
        ]
      },
      {
        id: 'sl-ch-3',
        chapterNumber: 3,
        title: 'Chapter 3: The Cuteness of Faith',
        pages: [
          'https://images.weserv.nl/?url=images.unsplash.com/photo-1542751371-adc38448a05e?w=900&auto=format&fit=crop',
          'https://images.weserv.nl/?url=images.unsplash.com/photo-1518709268805-4e9042af9f23?w=900&auto=format&fit=crop',
          'https://images.weserv.nl/?url=images.unsplash.com/photo-1579783902614-a3fb3927b675?w=900&auto=format&fit=crop'
        ]
      }
    ]
  },
  {
    id: 'one-piece',
    mangadexId: 'a1c7c817-4e59-43b7-9365-09675a149a6f',
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
    chapters: [
      {
        id: 'op-ch-1',
        chapterNumber: 1,
        title: 'Chapter 1: Romance Dawn',
        pages: [
          'https://images.weserv.nl/?url=uploads.mangadex.org/covers/a1c7c817-4e59-43b7-9365-09675a149a6f/1d0a5148-18e0-47b2-b13c-53f08ca6fae6.jpg&w=900',
          'https://images.weserv.nl/?url=images.unsplash.com/photo-1534447677768-be436bb09401?w=900&auto=format&fit=crop',
          'https://images.weserv.nl/?url=images.unsplash.com/photo-1518709268805-4e9042af9f23?w=900&auto=format&fit=crop',
          'https://images.weserv.nl/?url=images.unsplash.com/photo-1542751371-adc38448a05e?w=900&auto=format&fit=crop',
          'https://images.weserv.nl/?url=images.unsplash.com/photo-1509198397868-475647b2a1e5?w=900&auto=format&fit=crop'
        ]
      },
      {
        id: 'op-ch-2',
        chapterNumber: 2,
        title: 'Chapter 2: They Call Him Straw Hat Luffy',
        pages: [
          'https://images.weserv.nl/?url=images.unsplash.com/photo-1534447677768-be436bb09401?w=900&auto=format&fit=crop',
          'https://images.weserv.nl/?url=images.unsplash.com/photo-1518709268805-4e9042af9f23?w=900&auto=format&fit=crop'
        ]
      }
    ]
  },
  {
    id: 'jujutsu-kaisen',
    mangadexId: 'c52b2ce3-7f95-469c-96b0-479524fb7a1a',
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
    chapters: [
      {
        id: 'jjk-ch-1',
        chapterNumber: 1,
        title: 'Chapter 1: Ryomen Sukuna',
        pages: [
          'https://images.weserv.nl/?url=uploads.mangadex.org/covers/c52b2ce3-7f95-469c-96b0-479524fb7a1a/40b3341b-4395-4ef5-83e9-a3b04396b2ea.jpg&w=900',
          'https://images.weserv.nl/?url=images.unsplash.com/photo-1518709268805-4e9042af9f23?w=900&auto=format&fit=crop',
          'https://images.weserv.nl/?url=images.unsplash.com/photo-1509198397868-475647b2a1e5?w=900&auto=format&fit=crop',
          'https://images.weserv.nl/?url=images.unsplash.com/photo-1542751371-adc38448a05e?w=900&auto=format&fit=crop'
        ]
      }
    ]
  },
  {
    id: 'chainsaw-man',
    mangadexId: 'a77742c1-fda2-40e3-980a-019349ff7e28',
    title: 'Chainsaw Man',
    altTitle: 'Chainsaw Man Part 2',
    cover: 'https://uploads.mangadex.org/covers/a77742c1-fda2-40e3-980a-019349ff7e28/97cf6741-285d-4f18-bb9d-922dfb420ee9.jpg',
    rating: 9.6,
    status: 'ongoing',
    chaptersCount: 180,
    tags: ['Action', 'Dark Fantasy', 'Demons', 'Gore', 'Comedy'],
    author: 'Tatsuki Fujimoto',
    year: 2018,
    description: 'Denji is a teenage boy living in extreme poverty, working as a devil hunter alongside his chainsaw-dog Pochita to pay off his late father\'s debt. After a betrayal, Denji is revived as the devil-human hybrid Chainsaw Man.',
    chapters: [
      {
        id: 'csm-ch-1',
        chapterNumber: 1,
        title: 'Chapter 1: Dog & Chainsaw',
        pages: [
          'https://images.weserv.nl/?url=uploads.mangadex.org/covers/a77742c1-fda2-40e3-980a-019349ff7e28/97cf6741-285d-4f18-bb9d-922dfb420ee9.jpg&w=900',
          'https://images.weserv.nl/?url=images.unsplash.com/photo-1509198397868-475647b2a1e5?w=900&auto=format&fit=crop',
          'https://images.weserv.nl/?url=images.unsplash.com/photo-1518709268805-4e9042af9f23?w=900&auto=format&fit=crop'
        ]
      }
    ]
  },
  {
    id: 'berserk',
    mangadexId: '801513ba-a712-498b-8f57-415b86f79b5f',
    title: 'Berserk',
    altTitle: 'Beruseruku',
    cover: 'https://uploads.mangadex.org/covers/801513ba-a712-498b-8f57-415b86f79b5f/2f3a4794-5cb8-477c-a496-e7e2c9066668.jpg',
    rating: 10.0,
    status: 'ongoing',
    chaptersCount: 376,
    tags: ['Dark Fantasy', 'Seinen', 'Psychological', 'Demons', 'Action'],
    author: 'Kentaro Miura',
    year: 1989,
    description: 'Guts, known as the Black Swordsman, seeks sanctuary from demonic forces that pursue him and his lover, and vengeance against his former commander and friend Griffith.',
    chapters: [
      {
        id: 'berserk-ch-1',
        chapterNumber: 1,
        title: 'Chapter 1: The Black Swordsman',
        pages: [
          'https://images.weserv.nl/?url=uploads.mangadex.org/covers/801513ba-a712-498b-8f57-415b86f79b5f/2f3a4794-5cb8-477c-a496-e7e2c9066668.jpg&w=900',
          'https://images.weserv.nl/?url=images.unsplash.com/photo-1518709268805-4e9042af9f23?w=900&auto=format&fit=crop',
          'https://images.weserv.nl/?url=images.unsplash.com/photo-1542751371-adc38448a05e?w=900&auto=format&fit=crop'
        ]
      }
    ]
  },
  {
    id: 'dandadan',
    mangadexId: '4e8b0906-897e-428b-ab29-430347607736',
    title: 'Dandadan',
    altTitle: 'Dan Da Dan',
    cover: 'https://uploads.mangadex.org/covers/4e8b0906-897e-428b-ab29-430347607736/6f75db19-c1bb-45b7-a3cf-bc8bc4e86a5d.jpg',
    rating: 9.6,
    status: 'ongoing',
    chaptersCount: 172,
    tags: ['Action', 'Comedy', 'Supernatural', 'Aliens', 'Ghosts'],
    author: 'Yukinobu Tatsu',
    year: 2021,
    description: 'Momo believes in ghosts but rejects aliens; Okarun believes in aliens but rejects ghosts. To prove each other wrong, they visit paranormal hotspots and awaken occult curses.',
    chapters: [
      {
        id: 'ddd-ch-1',
        chapterNumber: 1,
        title: 'Chapter 1: That\'s How Love Starts',
        pages: [
          'https://images.weserv.nl/?url=uploads.mangadex.org/covers/4e8b0906-897e-428b-ab29-430347607736/6f75db19-c1bb-45b7-a3cf-bc8bc4e86a5d.jpg&w=900',
          'https://images.weserv.nl/?url=images.unsplash.com/photo-1534447677768-be436bb09401?w=900&auto=format&fit=crop'
        ]
      }
    ]
  },
  {
    id: 'frieren',
    mangadexId: 'b0b721ff-c388-4486-aa0f-c8b0e921824b',
    title: 'Frieren: Beyond Journey\'s End',
    altTitle: 'Sousou no Frieren',
    cover: 'https://uploads.mangadex.org/covers/b0b721ff-c388-4486-aa0f-c8b0e921824b/cb2e8318-774f-4d26-b186-b481615a6bfa.jpg',
    rating: 9.8,
    status: 'ongoing',
    chaptersCount: 135,
    tags: ['Adventure', 'Drama', 'Fantasy', 'Magic', 'Slice of Life'],
    author: 'Kanehito Yamada & Tsukasa Abe',
    year: 2020,
    description: 'The hero party defeated the Demon King, bringing peace to the realm. For elven mage Frieren, fifty years pass in the blink of an eye. She embarks on a journey to understand mortals.',
    chapters: [
      {
        id: 'frieren-ch-1',
        chapterNumber: 1,
        title: 'Chapter 1: The End of The Journey',
        pages: [
          'https://images.weserv.nl/?url=uploads.mangadex.org/covers/b0b721ff-c388-4486-aa0f-c8b0e921824b/cb2e8318-774f-4d26-b186-b481615a6bfa.jpg&w=900',
          'https://images.weserv.nl/?url=images.unsplash.com/photo-1509198397868-475647b2a1e5?w=900&auto=format&fit=crop'
        ]
      }
    ]
  },
  {
    id: 'spy-x-family',
    mangadexId: '64562060-4965-4f46-993d-d557342721f4',
    title: 'Spy x Family',
    altTitle: 'SPY×FAMILY',
    cover: 'https://uploads.mangadex.org/covers/64562060-4965-4f46-993d-d557342721f4/ec48e7e1-8857-4186-b605-2b47e2ecdb34.jpg',
    rating: 9.5,
    status: 'ongoing',
    chaptersCount: 105,
    tags: ['Comedy', 'Action', 'Family', 'Espionage', 'Shounen'],
    author: 'Tatsuya Endo',
    year: 2019,
    description: 'Master spy Twilight must disguise himself as psychiatrist Loid Forger and adopt a telepathic child and assassin wife to infiltrate an elite academy.',
    chapters: [
      {
        id: 'sxf-ch-1',
        chapterNumber: 1,
        title: 'Mission 1: Operation Strix',
        pages: [
          'https://images.weserv.nl/?url=uploads.mangadex.org/covers/64562060-4965-4f46-993d-d557342721f4/ec48e7e1-8857-4186-b605-2b47e2ecdb34.jpg&w=900',
          'https://images.weserv.nl/?url=images.unsplash.com/photo-1542751371-adc38448a05e?w=900&auto=format&fit=crop'
        ]
      }
    ]
  }
];

export const GENRE_TAGS = ['All', 'Action', 'Dark Fantasy', 'Adventure', 'Comedy', 'Supernatural', 'Magic', 'Shounen'];

export const MangaApp: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [selectedManga, setSelectedManga] = useState<MangaItem | null>(null);

  // Active Reader State
  const [isReading, setIsReading] = useState<boolean>(false);
  const [currentChapter, setCurrentChapter] = useState<MangaChapter | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [readingMode, setReadingMode] = useState<'webtoon' | 'paged'>('webtoon');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showDrawer, setShowDrawer] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const readerContainerRef = useRef<HTMLDivElement>(null);

  // Bookmarks
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
    setBookmarks((prev) => {
      const next = prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id];
      try {
        localStorage.setItem('godly_manga_bookmarks', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const filteredManga = useMemo(() => {
    return MANGA_CATALOG.filter((m) => {
      const matchSearch =
        !search.trim() ||
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        (m.altTitle && m.altTitle.toLowerCase().includes(search.toLowerCase())) ||
        m.author.toLowerCase().includes(search.toLowerCase());
      const matchTag = selectedTag === 'All' || m.tags.includes(selectedTag);
      return matchSearch && matchTag;
    });
  }, [search, selectedTag]);

  const handleStartRead = (manga: MangaItem, chapter: MangaChapter) => {
    sound.playOpen();
    setSelectedManga(manga);
    setCurrentChapter(chapter);
    setCurrentPageIndex(0);
    setIsReading(true);
  };

  // Keyboard Navigation in reader
  useEffect(() => {
    if (!isReading) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsReading(false);
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        if (currentChapter && currentPageIndex < currentChapter.pages.length - 1) {
          setCurrentPageIndex((prev) => prev + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        if (currentPageIndex > 0) {
          setCurrentPageIndex((prev) => prev - 1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReading, currentChapter, currentPageIndex]);

  const toggleFullscreen = () => {
    sound.playClick();
    if (!readerContainerRef.current) return;
    if (!document.fullscreenElement) {
      readerContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#07080f] text-white select-none overflow-hidden font-sans">
      {/* Full Reader Overlay */}
      {isReading && selectedManga && currentChapter ? (
        <div
          ref={readerContainerRef}
          className="fixed inset-0 z-50 bg-[#080911] flex flex-col overflow-hidden text-white"
        >
          {/* Reader Top Bar */}
          <div className="h-14 px-4 bg-[#0d0e1a]/95 border-b border-white/10 flex items-center justify-between shrink-0 select-none z-20 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  sound.playClick();
                  setIsReading(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <div className="h-4 w-px bg-white/20" />
              <div>
                <h3 className="text-xs font-black text-white">{selectedManga.title}</h3>
                <span className="text-[10px] text-purple-300 font-mono">
                  {currentChapter.title}
                </span>
              </div>
            </div>

            {/* Reader Controls */}
            <div className="flex items-center gap-2">
              {/* Reading Mode Switcher */}
              <div className="flex items-center bg-white/[0.05] p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => {
                    sound.playClick();
                    setReadingMode('webtoon');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                    readingMode === 'webtoon'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40'
                      : 'text-white/60 hover:text-white'
                  }`}
                  title="Webtoon Mode (Vertical Continuous Scroll)"
                >
                  <Rows size={12} /> Webtoon
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    setReadingMode('paged');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                    readingMode === 'paged'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40'
                      : 'text-white/60 hover:text-white'
                  }`}
                  title="Paged Mode (Single Page Flip)"
                >
                  <Columns size={12} /> Flip
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="hidden sm:flex items-center bg-white/[0.05] px-2 py-1 rounded-xl border border-white/10 gap-1.5">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(60, z - 15))}
                  className="p-1 hover:text-purple-300 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut size={13} />
                </button>
                <span className="text-[10px] font-mono font-bold text-white/70 min-w-[32px] text-center">
                  {zoomLevel}%
                </span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
                  className="p-1 hover:text-purple-300 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn size={13} />
                </button>
              </div>

              {/* Chapter Drawer Toggle */}
              <button
                onClick={() => {
                  sound.playClick();
                  setShowDrawer(!showDrawer);
                }}
                className={`p-2 rounded-xl border transition-all ${
                  showDrawer
                    ? 'bg-purple-600 border-purple-400 text-white'
                    : 'bg-white/10 border-white/15 text-white/80 hover:text-white'
                }`}
                title="Chapter List"
              >
                <List size={14} />
              </button>

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white/80 transition-all"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            </div>
          </div>

          {/* Reader Body */}
          <div className="flex-1 w-full min-h-0 relative flex overflow-hidden">
            {/* Main Canvas / Pages View */}
            <div className="flex-1 h-full overflow-y-auto custom-scrollbar flex flex-col items-center p-4">
              {readingMode === 'webtoon' ? (
                /* Webtoon Mode: Vertical Continuous Scroll */
                <div
                  className="flex flex-col items-center gap-2 max-w-4xl transition-all duration-150"
                  style={{ width: `${zoomLevel}%` }}
                >
                  {currentChapter.pages.map((pageUrl, idx) => (
                    <div
                      key={idx}
                      className="relative w-full rounded-lg overflow-hidden bg-black/40 border border-white/[0.04] shadow-2xl"
                    >
                      <img
                        src={pageUrl}
                        alt={`Page ${idx + 1}`}
                        loading="lazy"
                        className="w-full h-auto object-contain block select-none pointer-events-none"
                      />
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm border border-white/10 text-[9px] font-mono text-white/60">
                        {idx + 1} / {currentChapter.pages.length}
                      </div>
                    </div>
                  ))}

                  {/* Chapter Finish Navigation */}
                  <div className="w-full py-12 flex flex-col items-center justify-center gap-4 text-center">
                    <p className="text-sm font-bold text-white/80">
                      End of {currentChapter.title}
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          sound.playClick();
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all"
                      >
                        Back to Top
                      </button>
                      <button
                        onClick={() => {
                          sound.playClick();
                          setIsReading(false);
                        }}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition-all shadow-lg shadow-purple-950/50"
                      >
                        Close Reader
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Paged Flip Mode */
                <div className="w-full h-full flex flex-col items-center justify-between py-2">
                  <div className="flex-1 flex items-center justify-center w-full max-h-[82vh] overflow-hidden">
                    <img
                      src={currentChapter.pages[currentPageIndex]}
                      alt={`Page ${currentPageIndex + 1}`}
                      className="max-h-full max-w-full object-contain rounded-xl shadow-2xl border border-white/10 select-none"
                      style={{ transform: `scale(${zoomLevel / 100})` }}
                    />
                  </div>

                  {/* Bottom Flip Bar */}
                  <div className="w-full max-w-xl px-4 py-3 bg-[#0d0e1a]/90 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-between mt-3 select-none">
                    <button
                      onClick={() => {
                        sound.playClick();
                        setCurrentPageIndex((p) => Math.max(0, p - 1));
                      }}
                      disabled={currentPageIndex === 0}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-xs font-bold flex items-center gap-1 transition-all"
                    >
                      <ChevronLeft size={14} /> Prev
                    </button>

                    <span className="text-xs font-mono font-bold text-purple-300">
                      Page {currentPageIndex + 1} of {currentChapter.pages.length}
                    </span>

                    <button
                      onClick={() => {
                        sound.playClick();
                        setCurrentPageIndex((p) =>
                          Math.min(currentChapter.pages.length - 1, p + 1)
                        );
                      }}
                      disabled={currentPageIndex === currentChapter.pages.length - 1}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:pointer-events-none text-xs font-bold flex items-center gap-1 transition-all shadow-md shadow-purple-950/40"
                    >
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Slide-out Chapter Drawer */}
            {showDrawer && (
              <div className="w-72 sm:w-80 h-full bg-[#0a0b16] border-l border-white/10 p-4 flex flex-col overflow-y-auto custom-scrollbar shrink-0 z-30">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold font-mono uppercase tracking-wider text-purple-400">
                    Chapters ({selectedManga.chapters.length})
                  </span>
                  <button
                    onClick={() => setShowDrawer(false)}
                    className="p-1 rounded-lg text-white/50 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-1.5 flex-1">
                  {selectedManga.chapters.map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => {
                        sound.playClick();
                        setCurrentChapter(ch);
                        setCurrentPageIndex(0);
                        setShowDrawer(false);
                      }}
                      className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between border transition-all ${
                        currentChapter.id === ch.id
                          ? 'bg-purple-600 border-purple-400 text-white shadow-md shadow-purple-950/40'
                          : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/[0.06] text-white/70'
                      }`}
                    >
                      <span className="truncate">{ch.title}</span>
                      <span className="text-[10px] font-mono opacity-60">
                        {ch.pages.length}p
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Main Catalog View Header */}
      <div className="h-14 px-4 sm:px-6 bg-[#0c0d18]/95 border-b border-white/[0.08] flex items-center justify-between shrink-0 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-600 via-purple-600 to-indigo-600 p-0.5 shadow-lg shadow-purple-950/40 flex items-center justify-center">
            <div className="w-full h-full rounded-[10px] bg-[#0c0a18] flex items-center justify-center">
              <BookOpen size={18} className="text-purple-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black tracking-tight text-white">Manga</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                MangaDex &amp; Webtoon
              </span>
            </div>
            <p className="text-[10px] text-white/40 hidden sm:block">
              High-definition manga reader with continuous webtoon &amp; page-flip view
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-48 sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search manga, authors, tags..."
            className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-white/30 focus:border-purple-500/50 outline-none transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Genre Filter Pills */}
      <div className="px-4 sm:px-6 py-2.5 bg-[#090a14] border-b border-white/[0.05] flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0">
        {GENRE_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => {
              sound.playClick();
              setSelectedTag(tag);
            }}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
              selectedTag === tag
                ? 'bg-purple-600 border-purple-400 text-white shadow-md shadow-purple-950/40'
                : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 text-white/60'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Manga Grid */}
      <div className="flex-1 w-full overflow-y-auto p-4 sm:p-6 custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {filteredManga.map((manga) => {
              const isBookmarked = bookmarks.includes(manga.id);
              return (
                <div
                  key={manga.id}
                  onClick={() => {
                    sound.playOpen();
                    setSelectedManga(manga);
                  }}
                  className="group relative flex flex-col rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-purple-500/40 overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-sm hover:shadow-xl hover:shadow-purple-950/20"
                >
                  {/* Poster Image */}
                  <div className="relative w-full aspect-[3/4] overflow-hidden bg-black/60">
                    <img
                      src={manga.cover}
                      alt={manga.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d18] via-transparent to-black/30" />

                    {/* Rating Badge */}
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-bold text-amber-300">
                      <Star size={10} className="fill-amber-400 text-amber-400" />
                      <span>{manga.rating}</span>
                    </div>

                    {/* Bookmark Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(manga.id);
                      }}
                      className={`absolute top-2 right-2 p-1.5 rounded-lg backdrop-blur-md border transition-all ${
                        isBookmarked
                          ? 'bg-purple-600 border-purple-400 text-white'
                          : 'bg-black/60 border-white/15 text-white/60 hover:text-white'
                      }`}
                      title={isBookmarked ? 'Remove Bookmark' : 'Save Manga'}
                    >
                      <Bookmark size={11} className={isBookmarked ? 'fill-white' : ''} />
                    </button>

                    {/* Chapters Count */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono text-white/80">
                      <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/10">
                        {manga.chaptersCount} Chs
                      </span>
                      <span className="capitalize font-semibold text-purple-300">
                        {manga.status}
                      </span>
                    </div>
                  </div>

                  {/* Title & info */}
                  <div className="p-2.5 flex flex-col justify-between flex-1">
                    <h3 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                      {manga.title}
                    </h3>
                    <p className="text-[10px] text-white/40 mt-1 line-clamp-1">
                      {manga.author} • {manga.year}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Manga Detail Modal */}
      {selectedManga && !isReading && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#0e101f] border border-white/15 shadow-2xl p-6 sm:p-7">
            {/* Close button */}
            <button
              onClick={() => setSelectedManga(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              <X size={16} />
            </button>

            {/* Banner top */}
            <div className="flex gap-5 mb-5">
              <img
                src={selectedManga.cover}
                alt={selectedManga.title}
                className="w-28 sm:w-36 aspect-[3/4] object-cover rounded-2xl border-2 border-white/20 shadow-2xl shadow-black/80 shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                    {selectedManga.status}
                  </span>
                  <span className="text-xs text-white/60 font-mono">
                    {selectedManga.year}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {selectedManga.title}
                </h2>
                {selectedManga.altTitle && (
                  <p className="text-xs text-white/40 italic mt-0.5">
                    {selectedManga.altTitle}
                  </p>
                )}
                <p className="text-xs text-purple-300 font-semibold mt-1">
                  By {selectedManga.author}
                </p>

                <div className="flex items-center gap-3 mt-3">
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-300 px-2 py-0.5 rounded-lg bg-amber-400/10 border border-amber-400/20">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    {selectedManga.rating} / 10
                  </span>
                  <button
                    onClick={() => toggleBookmark(selectedManga.id)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white/80 transition-all"
                    title="Bookmark"
                  >
                    <Bookmark
                      size={14}
                      className={bookmarks.includes(selectedManga.id) ? 'fill-purple-400 text-purple-400' : ''}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Synopsis */}
            <div className="mb-5">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white/60 mb-1.5">
                Synopsis
              </h4>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans">
                {selectedManga.description}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {selectedManga.tags.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[10px] text-white/70 font-semibold"
                >
                  {t}
                </span>
              ))}
            </div>

            {/* Chapter Selection */}
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white/80 mb-2">
                Available Chapters
              </h4>
              <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                {selectedManga.chapters.map((ch) => (
                  <div
                    key={ch.id}
                    onClick={() => handleStartRead(selectedManga, ch)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] hover:bg-purple-600/20 border border-white/[0.06] hover:border-purple-500/40 cursor-pointer transition-all group"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                        {ch.title}
                      </h5>
                      <span className="text-[10px] text-white/40 font-mono">
                        {ch.pages.length} Pages • High Resolution
                      </span>
                    </div>
                    <button className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-950/40 flex items-center gap-1.5 transition-all">
                      <BookOpen size={12} /> Read
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
