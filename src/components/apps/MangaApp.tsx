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
  List,
  Loader2,
  CheckCircle2,
  Settings,
  Tv,
  Globe,
  Compass,
  TrendingUp,
  Share2,
  ShieldCheck,
  Zap,
  Info,
  Radio,
  FileText
} from 'lucide-react';
import { sound } from '../../utils/sound';

export type MangaEngine = 'cubari' | 'mangapill' | 'manganato' | 'custom';

export interface MangaItem {
  id: string;
  title: string;
  altTitle?: string;
  cover: string;
  rating: number;
  rank?: number;
  status: 'ongoing' | 'completed';
  chaptersCount: number | string;
  tags: string[];
  author: string;
  year: number;
  description: string;
  mangadexId: string;
  pillSlug?: string;
}

// 18 Top Verified Manga & Manhwa Series with working MangaDex IDs for Cubari
export const FLAGSHIP_MANGA_CATALOG: MangaItem[] = [
  {
    id: 'solo-leveling',
    title: 'Solo Leveling',
    altTitle: 'Na Honjaman Rebeleop',
    cover: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=700&auto=format&fit=crop&q=85',
    rating: 9.88,
    rank: 1,
    status: 'completed',
    chaptersCount: 179,
    tags: ['Action', 'Fantasy', 'Monsters', 'System', 'Manhwa'],
    author: 'Chugong & DUBU',
    year: 2018,
    mangadexId: '32d76d19-8a05-4db0-9fc2-e0b0648fe9d0',
    description: '10 years ago, after the Gate connected our world with the monster world, ordinary people awakened superhuman powers. Sung Jin-woo, the weakest E-rank hunter, discovers a hidden dual-dungeon that grants him the ability to level up infinitely.'
  },
  {
    id: 'jujutsu-kaisen',
    title: 'Jujutsu Kaisen',
    altTitle: 'Sorcery Fight',
    cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=700&auto=format&fit=crop&q=85',
    rating: 9.78,
    rank: 2,
    status: 'completed',
    chaptersCount: 271,
    tags: ['Action', 'Supernatural', 'Curse', 'Shounen'],
    author: 'Gege Akutami',
    year: 2018,
    mangadexId: 'c52b2ce3-7f95-469c-96b0-479524fb7a1a',
    description: 'Yuji Itadori is an athletically gifted high school student. To rescue friends attacked by curses, he swallows a rotting talisman finger belonging to Ryomen Sukuna, king of curses, drawing himself into the lethal jujutsu world.'
  },
  {
    id: 'one-piece',
    title: 'One Piece',
    altTitle: 'Wan Pīsu',
    cover: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=700&auto=format&fit=crop&q=85',
    rating: 9.92,
    rank: 3,
    status: 'ongoing',
    chaptersCount: '1125+',
    tags: ['Adventure', 'Pirates', 'Shounen', 'Action'],
    author: 'Eiichiro Oda',
    year: 1997,
    mangadexId: 'a1c7c817-4e59-43b7-9365-09675a149a6f',
    description: 'Gol D. Roger, the legendary Pirate King, announced the existence of the supreme treasure One Piece. Monkey D. Luffy sets out on the Grand Line with the Straw Hat crew to claim the title of Pirate King.'
  },
  {
    id: 'berserk',
    title: 'Berserk',
    altTitle: 'Beruseruku',
    cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=700&auto=format&fit=crop&q=85',
    rating: 9.95,
    rank: 4,
    status: 'ongoing',
    chaptersCount: 376,
    tags: ['Dark Fantasy', 'Tragedy', 'Seinen', 'Action'],
    author: 'Kentaro Miura',
    year: 1989,
    mangadexId: '801513ba-a712-498c-8f57-cae55b38cc92',
    description: 'Born from a corpse beneath a hanging tree, Guts is the Black Swordsman, armed with the massive Dragonslayer sword, struggling against fate, demons, and the Apostles of the God Hand.'
  },
  {
    id: 'chainsaw-man',
    title: 'Chainsaw Man',
    altTitle: 'Chensō Man',
    cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=700&auto=format&fit=crop&q=85',
    rating: 9.74,
    rank: 5,
    status: 'ongoing',
    chaptersCount: '180+',
    tags: ['Action', 'Demons', 'Psychological', 'Shounen'],
    author: 'Tatsuki Fujimoto',
    year: 2018,
    mangadexId: 'a77742c1-fda2-40e3-980a-019349ff7e28',
    description: 'Denji lives at rock bottom paying off his deceased father\'s mob debts with his chainsaw dog Pochita. Following a betrayal, Pochita fuses with Denji, transforming him into Chainsaw Man.'
  },
  {
    id: 'spy-x-family',
    title: 'Spy x Family',
    cover: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=700&auto=format&fit=crop&q=85',
    rating: 9.65,
    rank: 6,
    status: 'ongoing',
    chaptersCount: '100+',
    tags: ['Comedy', 'Action', 'Spy', 'Family'],
    author: 'Tatsuya Endo',
    year: 2019,
    mangadexId: '93427f71-2679-42b3-8d6d-62025e14309b',
    description: 'Master spy Twilight adopts telepathic Anya and marries assassin Yor to infiltrate an elite academy, with none of them revealing their true identities to each other.'
  },
  {
    id: 'demon-slayer',
    title: 'Demon Slayer',
    altTitle: 'Kimetsu no Yaiba',
    cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=700&auto=format&fit=crop&q=85',
    rating: 9.71,
    rank: 7,
    status: 'completed',
    chaptersCount: 205,
    tags: ['Action', 'Demons', 'Historical', 'Shounen'],
    author: 'Koyoharu Gotouge',
    year: 2016,
    mangadexId: '4f3bcae4-2d96-419d-933e-18e867ed9096',
    description: 'Tanjiro Kamado\'s family is slaughtered by demons, leaving only his sister Nezuko alive but transformed into a demon. Tanjiro embarks on a quest to become a Demon Slayer and cure her.'
  },
  {
    id: 'attack-on-titan',
    title: 'Attack on Titan',
    altTitle: 'Shingeki no Kyojin',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=700&auto=format&fit=crop&q=85',
    rating: 9.82,
    rank: 8,
    status: 'completed',
    chaptersCount: 139,
    tags: ['Military', 'Mystery', 'Survival', 'Shounen'],
    author: 'Hajime Isayama',
    year: 2009,
    mangadexId: '304ceac3-8cdb-492c-8864-e14a20b359ed',
    description: 'Centuries ago, mankind was nearly exterminated by monstrous giant humanoids known as Titans. Eren Yeager pledges to eliminate every Titan from the earth after his hometown falls.'
  },
  {
    id: 'tokyo-ghoul',
    title: 'Tokyo Ghoul',
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=700&auto=format&fit=crop&q=85',
    rating: 9.69,
    rank: 9,
    status: 'completed',
    chaptersCount: 143,
    tags: ['Dark Fantasy', 'Psychological', 'Horror', 'Seinen'],
    author: 'Sui Ishida',
    year: 2011,
    mangadexId: '4309a473-b3c1-4b1d-8729-ec452778644e',
    description: 'Ken Kaneki survives a deadly encounter with a flesh-eating ghoul, only to be turned into a half-ghoul who must navigate the treacherous underground ghoul society of Tokyo.'
  },
  {
    id: 'vinland-saga',
    title: 'Vinland Saga',
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=700&auto=format&fit=crop&q=85',
    rating: 9.87,
    rank: 10,
    status: 'ongoing',
    chaptersCount: '210+',
    tags: ['Historical', 'Vikings', 'Seinen', 'Action'],
    author: 'Makoto Yukimura',
    year: 2005,
    mangadexId: '5d61540f-7b79-4286-8d59-69b76c8e3bf5',
    description: 'Thorfinn seeks revenge against Askeladd, the mercenary leader who killed his father, leading him into the bloody Viking conflicts of 11th-century Europe and a search for peace.'
  },
  {
    id: 'vagabond',
    title: 'Vagabond',
    cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=700&auto=format&fit=crop&q=85',
    rating: 9.93,
    rank: 11,
    status: 'ongoing',
    chaptersCount: 327,
    tags: ['Martial Arts', 'Historical', 'Samurai', 'Seinen'],
    author: 'Takehiko Inoue',
    year: 1998,
    mangadexId: 'd3eb2179-c5c2-49e0-8278-cc853d9f0a20',
    description: 'A masterwork retelling of the life of legendary swordsman Miyamoto Musashi, exploring sword mastery, spiritual growth, and human enlightenment.'
  },
  {
    id: 'dandadan',
    title: 'Dandadan',
    cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=700&auto=format&fit=crop&q=85',
    rating: 9.66,
    rank: 12,
    status: 'ongoing',
    chaptersCount: '160+',
    tags: ['Sci-Fi', 'Aliens', 'Ghosts', 'Comedy', 'Shounen'],
    author: 'Yukinobu Tatsu',
    year: 2021,
    mangadexId: 'b3531b7e-976e-4f51-b883-fa4c22a5789a',
    description: 'Momo Ayase believes in ghosts but not aliens; Ken Takakura believes in aliens but not ghosts. A dare to visit occult hot spots leads to an encounter with both alien and yokai threats.'
  },
  {
    id: 'kaiju-no-8',
    title: 'Kaiju No. 8',
    cover: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=700&auto=format&fit=crop&q=85',
    rating: 9.58,
    rank: 13,
    status: 'ongoing',
    chaptersCount: '110+',
    tags: ['Monsters', 'Action', 'Sci-Fi', 'Military'],
    author: 'Naoya Matsumoto',
    year: 2020,
    mangadexId: '11c6d1e5-8296-492b-9285-3e284ef75574',
    description: 'Kafka Hibino cleans up kaiju corpses for a living. After unexpectedly ingesting a miniature kaiju, he gains monstrous power and attempts to join the elite Defense Force.'
  },
  {
    id: 'blue-lock',
    title: 'Blue Lock',
    cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=700&auto=format&fit=crop&q=85',
    rating: 9.62,
    rank: 14,
    status: 'ongoing',
    chaptersCount: '275+',
    tags: ['Sports', 'Soccer', 'Psychological', 'Shounen'],
    author: 'Muneyuki Kaneshiro',
    year: 2018,
    mangadexId: 'd3f6630a-d820-43be-ba55-9dcb80e46114',
    description: '300 high school strikers are locked inside the revolutionary Blue Lock training facility to create the ultimate egoist striker who can lead Japan to World Cup glory.'
  },
  {
    id: 'death-note',
    title: 'Death Note',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=700&auto=format&fit=crop&q=85',
    rating: 9.77,
    rank: 15,
    status: 'completed',
    chaptersCount: 108,
    tags: ['Psychological', 'Supernatural', 'Thriller', 'Mystery'],
    author: 'Tsugumi Ohba & Takeshi Obata',
    year: 2003,
    mangadexId: 'b4c93297-b363-4390-84b7-874f676c6b42',
    description: 'Light Yagami finds a supernatural notebook dropped by a Shinigami that kills anyone whose name is written in it. A deadly game of cat and mouse begins with the eccentric detective L.'
  },
  {
    id: 'bleach',
    title: 'Bleach',
    cover: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=700&auto=format&fit=crop&q=85',
    rating: 9.68,
    rank: 16,
    status: 'completed',
    chaptersCount: 686,
    tags: ['Action', 'Supernatural', 'Shounen', 'Sword'],
    author: 'Tite Kubo',
    year: 2001,
    mangadexId: 'b14beab2-780c-4860-bb4b-32bc8d91f868',
    description: 'Ichigo Kurosaki gains the abilities of a Soul Reaper after meeting Rukia Kuchiki and takes on the duty of defending humans from evil spirits known as Hollows.'
  },
  {
    id: 'hells-paradise',
    title: "Hell's Paradise: Jigokuraku",
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=700&auto=format&fit=crop&q=85',
    rating: 9.64,
    rank: 17,
    status: 'completed',
    chaptersCount: 127,
    tags: ['Action', 'Historical', 'Ninja', 'Supernatural'],
    author: 'Yuji Kaku',
    year: 2018,
    mangadexId: '2b23a9d7-83eb-460b-80fb-4054238e8ec7',
    description: 'Gabimaru the Hollow, an unkillable ninja on death row, is offered a full pardon if he retrieves the Elixir of Life from a mythical island teeming with grotesque monsters.'
  },
  {
    id: 'oshi-no-ko',
    title: 'Oshi no Ko',
    cover: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=700&auto=format&fit=crop&q=85',
    rating: 9.69,
    rank: 18,
    status: 'completed',
    chaptersCount: 166,
    tags: ['Drama', 'Mystery', 'Reincarnation', 'Entertainment'],
    author: 'Aka Akasaka & Mengo Yokoyari',
    year: 2020,
    mangadexId: '2961b79e-4ddc-461f-947a-e386f9a1bda5',
    description: 'A rural gynecologist is murdered and reincarnated as the child of his favorite pop idol Ai Hoshino, plunging into the dark realities of the entertainment industry.'
  }
];

export const GENRE_TAGS = [
  'All',
  'Action',
  'Adventure',
  'Fantasy',
  'Manhwa',
  'Dark Fantasy',
  'Shounen',
  'Supernatural',
  'Seinen',
  'Psychological',
  'Mystery',
  'Comedy'
];

export const MangaApp: React.FC = () => {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<'catalog' | 'reader' | 'hub' | 'bookmarks'>('catalog');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeEngine, setActiveEngine] = useState<MangaEngine>('cubari');

  // Reader State
  const [activeManga, setActiveManga] = useState<MangaItem>(FLAGSHIP_MANGA_CATALOG[0]);
  const [customReaderUrl, setCustomReaderUrl] = useState<string>('');
  const [customInputVal, setCustomInputVal] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [iframeKey, setIframeKey] = useState<number>(0);

  // Bookmarks State in localStorage
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('godly_manga_bookmarks');
      return saved ? JSON.parse(saved) : ['solo-leveling', 'jujutsu-kaisen', 'berserk'];
    } catch {
      return ['solo-leveling'];
    }
  });

  // Recent reads
  const [recentReads, setRecentReads] = useState<{ id: string; title: string; cover: string; timestamp: number }[]>(() => {
    try {
      const saved = localStorage.getItem('godly_manga_recents');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const readerFrameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('godly_manga_bookmarks', JSON.stringify(bookmarks));
    } catch {}
  }, [bookmarks]);

  useEffect(() => {
    try {
      localStorage.setItem('godly_manga_recents', JSON.stringify(recentReads.slice(0, 20)));
    } catch {}
  }, [recentReads]);

  const toggleBookmark = (id: string) => {
    sound.playClick();
    setBookmarks((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const openReaderForManga = (manga: MangaItem) => {
    sound.playClick();
    setActiveManga(manga);
    setCustomReaderUrl('');
    setActiveTab('reader');

    // Add to recent reads
    setRecentReads((prev) => {
      const filtered = prev.filter((r) => r.id !== manga.id);
      return [{ id: manga.id, title: manga.title, cover: manga.cover, timestamp: Date.now() }, ...filtered];
    });
  };

  const handleLaunchCustomManga = () => {
    if (!customInputVal.trim()) return;
    sound.playSuccess();
    const val = customInputVal.trim();

    // If user entered a full URL or MangaDex ID
    if (val.startsWith('http://') || val.startsWith('https://')) {
      if (val.includes('cubari.moe')) {
        setCustomReaderUrl(val);
      } else if (val.includes('mangadex.org/title/')) {
        const id = val.split('/title/')[1]?.split('/')[0];
        setCustomReaderUrl(`https://cubari.moe/read/mangadex/${id}/`);
      } else {
        // Route through Cloudmoon Unblocker worker
        setCustomReaderUrl(`https://google-classroom.sriail.workers.dev/?url=${encodeURIComponent(val)}`);
      }
    } else if (val.length === 36 && val.includes('-')) {
      // Looks like a MangaDex UUID
      setCustomReaderUrl(`https://cubari.moe/read/mangadex/${val}/`);
    } else {
      // Search term: search MangaPill via unblocker
      setCustomReaderUrl(`https://google-classroom.sriail.workers.dev/?url=https://mangapill.com/search?q=${encodeURIComponent(val)}`);
    }

    setActiveTab('reader');
  };

  // Filtered Catalog
  const filteredCatalog = useMemo(() => {
    return FLAGSHIP_MANGA_CATALOG.filter((m) => {
      const matchesTag = selectedTag === 'All' || m.tags.includes(selectedTag);
      const matchesSearch =
        !searchQuery ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.altTitle && m.altTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        m.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTag && matchesSearch;
    });
  }, [selectedTag, searchQuery]);

  // Reader Target URL
  const currentReaderSrc = useMemo(() => {
    if (customReaderUrl) return customReaderUrl;

    if (activeEngine === 'cubari') {
      return `https://cubari.moe/read/mangadex/${activeManga.mangadexId}/`;
    }
    if (activeEngine === 'mangapill') {
      return `https://google-classroom.sriail.workers.dev/?url=https://mangapill.com/search?q=${encodeURIComponent(activeManga.title)}`;
    }
    if (activeEngine === 'manganato') {
      return `https://google-classroom.sriail.workers.dev/?url=https://chapmanganato.to/search/story/${encodeURIComponent(activeManga.title.replace(/\s+/g, '_'))}`;
    }
    return `https://cubari.moe/read/mangadex/${activeManga.mangadexId}/`;
  }, [customReaderUrl, activeEngine, activeManga]);

  return (
    <div className="flex flex-col h-full w-full bg-[#05060f] text-slate-100 select-none overflow-hidden font-sans">
      {/* TOP HEADER / APP BAR */}
      <header className="h-14 border-b border-white/[0.08] bg-[#070918]/90 backdrop-blur-xl px-5 flex items-center justify-between shrink-0 z-20 shadow-md">
        {/* Left: Brand + Navigation Tabs */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-600 via-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
              <BookOpen size={16} className="text-white" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                Godly Manga
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-mono font-bold">
                  CUBARI HD
                </span>
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-white/[0.05] p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('catalog');
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'catalog' ? 'bg-pink-600 text-white shadow-md' : 'text-white/60 hover:text-white'
              }`}
            >
              Top Catalog
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('reader');
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'reader' ? 'bg-pink-600 text-white shadow-md' : 'text-white/60 hover:text-white'
              }`}
            >
              <Eye size={13} /> Active Reader
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('hub');
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'hub' ? 'bg-pink-600 text-white shadow-md' : 'text-white/60 hover:text-white'
              }`}
            >
              <Globe size={13} /> Unblocked Hub
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('bookmarks');
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'bookmarks' ? 'bg-pink-600 text-white shadow-md' : 'text-white/60 hover:text-white'
              }`}
            >
              Bookmarks ({bookmarks.length})
            </button>
          </div>
        </div>

        {/* Right: Quick Manga / Cubari / URL Bar */}
        <div className="flex items-center gap-3">
          <div className="relative w-72 hidden md:block">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Paste MangaDex link, UUID, or title..."
              value={customInputVal}
              onChange={(e) => setCustomInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLaunchCustomManga();
              }}
              className="w-full bg-white/[0.06] border border-white/10 rounded-full pl-8 pr-16 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-pink-500 transition-all"
            />
            <button
              onClick={handleLaunchCustomManga}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-0.5 rounded-full bg-pink-600 hover:bg-pink-500 text-[10px] font-bold text-white shadow-sm"
            >
              Read
            </button>
          </div>

          {activeTab === 'reader' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIframeKey((prev) => prev + 1)}
                title="Reload Reader"
                className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-white/10 text-white/70 hover:text-white"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                title="Toggle Fullscreen"
                className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-white/10 text-white/70 hover:text-white"
              >
                {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* VIEW: CATALOG VIEW */}
      {activeTab === 'catalog' && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Hero Spotlight Banner */}
          <div className="relative rounded-3xl overflow-hidden p-8 bg-gradient-to-r from-pink-950 via-purple-950 to-slate-950 border border-white/10 shadow-2xl">
            <div className="relative z-10 max-w-xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/30 text-pink-300 text-[11px] font-bold">
                <Sparkles size={13} /> Official Cubari Moe Engine
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                Solo Leveling &bull; Full Scanlation
              </h1>
              <p className="text-xs text-white/70 leading-relaxed">
                Experience real, high-resolution manga and manhwa chapters directly via MangaDex & Cubari with zero ads, true multi-page flip, and vertical webtoon scrolling.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => openReaderForManga(FLAGSHIP_MANGA_CATALOG[0])}
                  className="px-6 py-2.5 rounded-2xl bg-white text-black font-extrabold text-xs hover:bg-pink-200 transition-all shadow-xl flex items-center gap-2"
                >
                  <Eye size={15} /> Start Reading Ch. 1
                </button>
                <button
                  onClick={() => toggleBookmark(FLAGSHIP_MANGA_CATALOG[0].id)}
                  className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/10 flex items-center gap-1.5"
                >
                  <Bookmark
                    size={14}
                    className={bookmarks.includes(FLAGSHIP_MANGA_CATALOG[0].id) ? 'fill-pink-400 text-pink-400' : ''}
                  />
                  {bookmarks.includes(FLAGSHIP_MANGA_CATALOG[0].id) ? 'Bookmarked' : 'Bookmark'}
                </button>
              </div>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-35 pointer-events-none">
              <img
                src={FLAGSHIP_MANGA_CATALOG[0].cover}
                alt="Banner Cover"
                className="w-full h-full object-cover mask-gradient"
              />
            </div>
          </div>

          {/* Search & Tag Filter Bar */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full custom-scrollbar pb-1">
                {GENRE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSelectedTag(tag);
                      sound.playClick();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                      selectedTag === tag
                        ? 'bg-pink-600 text-white shadow-md'
                        : 'bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="relative w-full sm:w-56 shrink-0">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Filter catalog titles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>
          </div>

          {/* Manga Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredCatalog.map((manga) => (
              <div
                key={manga.id}
                onClick={() => openReaderForManga(manga)}
                className="bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.05] rounded-3xl p-3 cursor-pointer group transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-2.5 shadow-xl">
                    <img
                      src={manga.cover}
                      alt={manga.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-mono text-amber-400 border border-white/10 flex items-center gap-1">
                      <Star size={11} className="fill-amber-400" />
                      {manga.rating}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(manga.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 backdrop-blur-md text-white/70 hover:text-pink-400 transition-colors"
                    >
                      <Bookmark
                        size={13}
                        className={bookmarks.includes(manga.id) ? 'fill-pink-400 text-pink-400' : ''}
                      />
                    </button>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                      <span className="w-full py-1.5 rounded-xl bg-pink-600 text-center font-bold text-xs text-white shadow-lg flex items-center justify-center gap-1.5">
                        <Eye size={13} /> Read Now
                      </span>
                    </div>
                  </div>
                  <h3 className="text-xs font-bold text-white group-hover:text-pink-300 truncate">
                    {manga.title}
                  </h3>
                  <p className="text-[10px] text-white/50 truncate mt-0.5">
                    {manga.author} &bull; {manga.year}
                  </p>
                </div>
                <div className="flex items-center justify-between text-[10px] text-white/40 font-mono mt-2 pt-2 border-t border-white/[0.04]">
                  <span className="text-pink-400 font-bold">{manga.chaptersCount} Ch.</span>
                  <span className="capitalize">{manga.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: ACTIVE READER VIEW (Cubari Moe Native Scans Engine) */}
      {activeTab === 'reader' && (
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Reader Sub-Bar: Switch Engines & Series Info */}
          <div className="h-11 bg-[#090c20] border-b border-white/[0.08] px-5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('catalog')}
                className="flex items-center gap-1 text-xs font-bold text-white/60 hover:text-white"
              >
                <ChevronLeft size={16} /> Catalog
              </button>
              <div className="h-4 w-[1px] bg-white/20"></div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-white truncate max-w-xs">
                  {customReaderUrl ? 'Custom Source Stream' : activeManga.title}
                </span>
                {!customReaderUrl && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-mono font-bold">
                    MangaDex Verified
                  </span>
                )}
              </div>
            </div>

            {/* Engine Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-white/40 uppercase">Reader Engine:</span>
              <div className="flex items-center gap-1 bg-white/[0.06] p-0.5 rounded-xl border border-white/10">
                <button
                  onClick={() => {
                    setActiveEngine('cubari');
                    setCustomReaderUrl('');
                    sound.playClick();
                  }}
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                    activeEngine === 'cubari' && !customReaderUrl
                      ? 'bg-pink-600 text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Cubari HD (Official)
                </button>
                <button
                  onClick={() => {
                    setActiveEngine('mangapill');
                    setCustomReaderUrl('');
                    sound.playClick();
                  }}
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                    activeEngine === 'mangapill' && !customReaderUrl
                      ? 'bg-pink-600 text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  MangaPill Cloud
                </button>
              </div>
            </div>
          </div>

          {/* Embedded Full High-Res Reader IFrame */}
          <div className="flex-1 w-full h-full bg-black relative">
            <iframe
              key={iframeKey}
              ref={readerFrameRef}
              src={currentReaderSrc}
              title="Godly Manga Reader"
              allow="autoplay; fullscreen; clipboard-read; clipboard-write; cross-origin-isolated"
              className="w-full h-full border-0 bg-black"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
            />
          </div>
        </div>
      )}

      {/* VIEW: UNBLOCKED MANGA HUB (MangaPill / Online Search) */}
      {activeTab === 'hub' && (
        <div className="flex-1 flex flex-col overflow-hidden bg-black">
          <div className="h-10 bg-[#090c20] border-b border-white/10 px-5 flex items-center justify-between text-xs text-white/60 shrink-0">
            <span className="flex items-center gap-2">
              <Globe size={14} className="text-pink-400" />
              Unblocked Manga Discovery Hub &bull; Powered by Cloudmoon Edge Worker
            </span>
            <span className="text-[10px] font-mono text-emerald-400">0 CORS Restrictions &bull; 10,000+ Series</span>
          </div>
          <iframe
            src="https://google-classroom.sriail.workers.dev/?url=https://mangapill.com/mangas"
            title="Manga Hub"
            allow="autoplay; fullscreen; clipboard-read; clipboard-write; cross-origin-isolated"
            className="w-full h-full border-0 bg-black"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
          />
        </div>
      )}

      {/* VIEW: BOOKMARKS VIEW */}
      {activeTab === 'bookmarks' && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <div>
            <h1 className="text-2xl font-black text-white">Your Bookmarks</h1>
            <p className="text-xs text-white/50">Manga and manhwa series saved to your local browser storage.</p>
          </div>

          {bookmarks.length === 0 ? (
            <div className="py-20 text-center text-xs text-white/40">
              No bookmarked manga yet. Click the bookmark icon on any manga card in the catalog to save it here!
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {FLAGSHIP_MANGA_CATALOG.filter((m) => bookmarks.includes(m.id)).map((manga) => (
                <div
                  key={manga.id}
                  onClick={() => openReaderForManga(manga)}
                  className="bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.05] rounded-3xl p-3 cursor-pointer group transition-all"
                >
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-2.5 shadow-xl">
                    <img src={manga.cover} alt={manga.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(manga.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 backdrop-blur-md text-pink-400"
                    >
                      <Bookmark size={13} className="fill-pink-400" />
                    </button>
                  </div>
                  <h3 className="text-xs font-bold text-white group-hover:text-pink-300 truncate">{manga.title}</h3>
                  <p className="text-[10px] text-white/50 truncate mt-0.5">{manga.author}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
