import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { 
  Gamepad2, 
  RotateCcw, 
  Sparkles, 
  Layers,
  Play,
  Cloud,
  Search,
  Users,
  Maximize2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
  X,
  Volume2,
  Zap,
  Star,
  Compass,
  Save,
  Upload,
  Download,
  Gauge,
  Bookmark,
  Radio,
  Box,
  ChevronDown,
  Rocket,
  Target,
  Globe,
  Flame,
  ArrowRight,
  ArrowUpDown,
  SlidersHorizontal,
  Tag,
  FolderGit2
} from 'lucide-react';
import { fetchPlayableGameHtml, CatalogGame } from '../../utils/catalogGameLoader';
import sixKhoCatalogData from '../../data/sixKho_games.json';
import ynrbsuCatalogData from '../../data/ynrbsu_games.json';
import { sound } from '../../utils/sound';
import { ServiceWorkerAppView } from '../common/ServiceWorkerAppView';
import { encodeUvUrl } from '../../utils/uvProxy';
import { fetchGameHtml } from '../../utils/gameLoader';
import { getAssetUrl } from '../../utils/assetHelper';
import { GameSaveManager, GameSaveSlot } from '../../utils/gameSaveManager';
import { GamepadMapperModal } from '../games/GamepadMapperModal';
import { EmulatorHubApp } from './EmulatorHubApp';
import { EaglercraftApp } from './EaglercraftApp';
import { useOS } from '../../context/OSContext';

declare global {
  interface Window {
    Lumin?: {
      init: (options: { container: string; theme: string }) => void;
      [key: string]: any;
    };
    ZenGS?: {
      play: (item: any, target: string | HTMLElement, opts?: any) => HTMLIFrameElement;
      playUrl?: (item: any) => string;
      decodeTitle?: (item: any) => string;
      items?: any[];
      classes?: Record<string, string>;
      [key: string]: any;
    };
  }
}

interface ZenGSGameSelection {
  id: string;
  title: string;
  url: string;
  item: any;
}

interface LocalGame {
  id: string;
  folder: string;
  file: string;
  title: string;
  category: string;
  url: string;
}

interface GNMathGame {
  id: number;
  title: string;
  cover: string;
  url: string;
  author: string;
}

interface NowGGGame {
  id: string;
  title: string;
  developer: string;
  category: string;
  rating: number;
  players: string;
  banner: string;
  icon: string;
  url: string;
  description: string;
}

const NOWGG_GAMES: NowGGGame[] = [
  {
    id: 'roblox',
    title: 'Roblox',
    developer: 'Roblox Corporation',
    category: 'Metaverse / Adventure',
    rating: 4.9,
    players: '12M+ active',
    banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=300&fit=crop',
    icon: 'https://images.unsplash.com/photo-1612287232269-231a44c74ea0?w=120&h=120&fit=crop',
    url: 'https://nowgg.fun/apps/roblox-corporation/5349/roblox.html',
    description: 'Explore millions of user-created 3D worlds, play with friends across devices without any downloads.',
  },
  {
    id: 'subway-surfers',
    title: 'Subway Surfers',
    developer: 'SYBO Games',
    category: 'Endless Runner',
    rating: 4.8,
    players: '8.5M+ active',
    banner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=300&fit=crop',
    icon: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=120&h=120&fit=crop',
    url: 'https://nowgg.fun/apps/sybo-games/subway-surfers.html',
    description: 'Dash and dodge oncoming trains in the world-tour subway cities at butter-smooth 60fps cloud streaming.',
  },
  {
    id: 'among-us',
    title: 'Among Us',
    developer: 'Innersloth LLC',
    category: 'Social Deduction',
    rating: 4.7,
    players: '4.2M+ active',
    banner: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&h=300&fit=crop',
    icon: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=120&h=120&fit=crop',
    url: 'https://nowgg.fun/apps/innersloth-llc/among-us.html',
    description: 'Prepare your spaceship for departure, but beware the impostor bent on sabotaging the crew.',
  },
  {
    id: 'minecraft-trial',
    title: 'Minecraft Trial',
    developer: 'Mojang Studios',
    category: 'Sandbox / Survival',
    rating: 4.9,
    players: '15M+ active',
    banner: 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?w=600&h=300&fit=crop',
    icon: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=120&h=120&fit=crop',
    url: 'https://nowgg.fun/apps/mojang/minecraft-trial.html',
    description: 'Explore infinite blocky terrains, craft tools, build shelters, and survive the night.',
  },
  {
    id: 'geometry-dash',
    title: 'Geometry Dash Lite',
    developer: 'RobTop Games',
    category: 'Rhythm Platformer',
    rating: 4.8,
    players: '3.1M+ active',
    banner: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&h=300&fit=crop',
    icon: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=120&h=120&fit=crop',
    url: 'https://nowgg.fun/apps/robtop-games/geometry-dash-lite.html',
    description: 'Jump and fly your way through danger in this rhythm-based action platformer directly streamed.',
  },
  {
    id: 'brawl-stars',
    title: 'Brawl Stars',
    developer: 'Supercell',
    category: 'Action / MOBA',
    rating: 4.8,
    players: '6.4M+ active',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=300&fit=crop',
    icon: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=120&h=120&fit=crop',
    url: 'https://nowgg.fun/apps/supercell/brawl-stars.html',
    description: 'Fast-paced 3v3 battle royale multiplayer matches streamed with zero latency.',
  },
  {
    id: 'free-fire',
    title: 'Garena Free Fire',
    developer: 'Garena International',
    category: 'Battle Royale',
    rating: 4.7,
    players: '9.8M+ active',
    banner: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=600&h=300&fit=crop',
    icon: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=120&h=120&fit=crop',
    url: 'https://nowgg.fun/apps/garena-international/free-fire.html',
    description: '10-minute survival shooter game where you compete against 49 other players on a remote island.',
  },
];

const LETTERS = ['ALL', '#', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

const CATEGORIES = [
  'All',
  'Action & Shooter',
  'Arcade Favorites',
  'Puzzle & Logic',
  'Racing & Vehicles',
  'Retro & Classic',
  'Runner & Platform',
  'Sports & Skill',
];

const P2P_LOADER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>P2P GameWebSight Loader</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #0d0e12;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        #loader-container { text-align: center; }
        svg.spinner {
            width: 100px;
            height: 100px;
            margin-bottom: 20px;
            animation: spin 2s linear infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .loader-text {
            font-size: 15px;
            color: #f97316;
            letter-spacing: 2px;
            font-weight: 600;
        }
        .loader-sub {
            font-size: 12px;
            color: #94a3b8;
            margin-top: 8px;
        }
    </style>
</head>
<body>
    <div id="loader-container">
        <svg class="spinner" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" stroke-width="2"/>
            <circle cx="50" cy="50" r="30" fill="none" stroke="#f97316" stroke-width="1.5" opacity="0.5"/>
            <path d="M 50 10 A 40 40 0 0 1 90 50" fill="none" stroke="#f97316" stroke-width="3.5" stroke-linecap="round"/>
        </svg>
        <p class="loader-text">CONNECTING TO P2P WEBSIGHT...</p>
        <p class="loader-sub">Bitbucket Raw Mirror • 500+ Games & Playables</p>
    </div>

    <script>
        (async () => {
            const url = "https://bitbucket.org/p2p-alt-public/p2p-emis/raw/main/GameWebSight";
            try {
                const response = await fetch(url, { credentials: "omit" });
                if (!response.ok) {
                    throw new Error("HTTP " + response.status);
                }
                const html = await response.text();
                const parser = new DOMParser();
                const remote = parser.parseFromString(html, "text/html");

                const base = document.createElement("base");
                base.href = new URL("./", url).href;

                document.head.replaceChildren(base);
                document.body.replaceChildren();

                for (const node of [...remote.head.childNodes]) {
                    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === "SCRIPT") continue;
                    document.head.appendChild(document.importNode(node, true));
                }

                const scripts = [];
                for (const node of [...remote.body.childNodes]) {
                    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === "SCRIPT") {
                        scripts.push(node);
                    } else {
                        document.body.appendChild(document.importNode(node, true));
                    }
                }

                for (const original of scripts) {
                    const script = document.createElement("script");
                    for (const attr of original.attributes) {
                        script.setAttribute(attr.name, attr.value);
                    }
                    if (original.src) {
                        script.src = new URL(original.getAttribute("src"), url).href;
                        await new Promise((resolve, reject) => {
                            script.onload = resolve;
                            script.onerror = () => reject(new Error("Failed: " + script.src));
                            document.body.appendChild(script);
                        });
                    } else {
                        script.textContent = original.textContent;
                        document.body.appendChild(script);
                    }
                }
            } catch (error) {
                console.error("P2P GameWebSight loader failed:", error);
                document.body.replaceChildren();
                const errBox = document.createElement('div');
                errBox.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px;color:#f97316;font-family:system-ui,sans-serif;gap:14px;';
                const icon = document.createElement('div');
                icon.style.fontSize = '32px';
                icon.textContent = '⚠️';
                const title = document.createElement('div');
                title.style.cssText = 'font-size:16px;font-weight:700;';
                title.textContent = 'Failed to connect to P2P GameWebSight';
                const desc = document.createElement('div');
                desc.style.cssText = 'font-size:12px;color:#94a3b8;max-width:400px;';
                desc.textContent = String(error.message || 'Please check your connection and reload.');
                const btn = document.createElement('button');
                btn.style.cssText = 'padding:8px 16px;background:#f97316;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;';
                btn.textContent = 'Retry';
                btn.onclick = () => location.reload();
                errBox.appendChild(icon);
                errBox.appendChild(title);
                errBox.appendChild(desc);
                errBox.appendChild(btn);
                document.body.appendChild(errBox);
            }
        })();
    </script>
</body>
</html>`;

export type GameSourceTab = 
  | 'all'
  // Major catalog sources:
  | 'nebula'
  | 'ugs'
  | 'js13kgames'
  | 'cvk'
  | 'hydra'
  | 'lumin'
  | 'diesmos'
  | 'gnmath'
  | 'ghostproxy'
  | 'alexr'
  | 'gamezone'
  | 'petezah'
  | 'daknux'
  | 'seraph'
  | 'truffled'
  | 'duckmath'
  // Core Godly OS platforms:
  | 'vault'
  | 'zengs'
  | 'sixkho'
  | 'ynrbsu'
  | 'nettleweb'
  | 'nowgg'
  | 'p2p'
  | 'emulator'
  | 'eaglercraft'
  // Other smaller sources combined:
  | 'other';

export interface MajorSourceMeta {
  id: GameSourceTab;
  sourceKey: string;
  name: string;
  badge: string;
  count: number;
  repo: string;
  repoUrl: string;
  color: string;
  desc: string;
}

export const MAJOR_SOURCES_CONFIG: MajorSourceMeta[] = [
  { id: 'nebula', sourceKey: 'Nebula', name: 'Nebula CDN', badge: '3,062 Games', count: 3062, repo: 'GoatTech-42/NEBULA-CDN', repoUrl: 'https://github.com/GoatTech-42/NEBULA-CDN', color: '#818cf8', desc: 'Massive unblocked HTML5 game repository & CDN mirror' },
  { id: 'ugs', sourceKey: 'UGS', name: 'UGS Library', badge: '2,823 Games', count: 2823, repo: 'bubbls/ugs-singlefile', repoUrl: 'https://github.com/bubbls/ugs-singlefile', color: '#38bdf8', desc: 'Single-file optimized unblocked games archive' },
  { id: 'js13kgames', sourceKey: 'js13kGames', name: 'js13kGames', badge: '2,800 Games', count: 2800, repo: 'js13kGames/games', repoUrl: 'https://github.com/js13kGames/games', color: '#facc15', desc: 'Ultra-lightweight 13kB game jam masterpieces' },
  { id: 'cvk', sourceKey: 'CVK', name: "Chicken King's Vault", badge: '1,655 Games', count: 1655, repo: 'WanoCapy/ChickenKingsVault', repoUrl: 'https://github.com/WanoCapy/ChickenKingsVault', color: '#fb923c', desc: 'Comprehensive unblocked vault with full thumbnails' },
  { id: 'hydra', sourceKey: 'Hydra', name: 'Hydra Network', badge: '1,643 Games', count: 1643, repo: 'zennedu/hydra', repoUrl: 'https://github.com/zennedu/hydra', color: '#4ade80', desc: 'Hydra unblocked game mirror collection' },
  { id: 'lumin', sourceKey: 'Lumin', name: 'Lumin Engine', badge: '1,249 Games', count: 1249, repo: '3kh0/3kh0-lite + seraph', repoUrl: 'https://github.com/3kh0/3kh0-lite', color: '#a78bfa', desc: 'Lumin retro arcade and waflash collection' },
  { id: 'diesmos', sourceKey: 'Diesmos', name: 'Diesmos HTML Files', badge: '1,038 Games', count: 1038, repo: 'aDiesmos/HTMLFILES', repoUrl: 'https://github.com/aDiesmos/HTMLFILES', color: '#ec4899', desc: 'Complete HTML5 standalone game preservation files' },
  { id: 'gnmath', sourceKey: 'GN-Math', name: 'GN-Math Archive', badge: '840 Games', count: 840, repo: 'freebuisness/html', repoUrl: 'https://github.com/freebuisness/html', color: '#06b6d4', desc: 'School-unblocked math disguise library' },
  { id: 'ghostproxy', sourceKey: 'GhostProxy', name: 'GhostProxy Hub', badge: '760 Games', count: 760, repo: 'freebuisness/html', repoUrl: 'https://github.com/freebuisness/html', color: '#94a3b8', desc: 'Ghost unblocked game releases and proxies' },
  { id: 'alexr', sourceKey: 'Alexr', name: "Alexr's World", badge: '676 Games', count: 676, repo: 'dskjfoisjfsjio/alexrsworld', repoUrl: 'https://github.com/dskjfoisjfsjio/alexrsworld', color: '#f43f5e', desc: 'Standalone games from Alexr World' },
  { id: 'gamezone', sourceKey: 'GameZone', name: 'GameZone Library', badge: '607 Games', count: 607, repo: 'pavitraag/GameZone_gssoc', repoUrl: 'https://github.com/pavitraag/GameZone_gssoc', color: '#2dd4bf', desc: 'Open-source web games curated archive' },
  { id: 'petezah', sourceKey: 'Petezah', name: 'PeteZah Games', badge: '570 Games', count: 570, repo: 'PeteZah-Games/PeteZahGames', repoUrl: 'https://github.com/PeteZah-Games/PeteZahGames', color: '#f59e0b', desc: 'Classic PeteZah unblocked library mirror' },
  { id: 'daknux', sourceKey: 'Daknux', name: 'Daknux HTML', badge: '521 Games', count: 521, repo: 'daknux/html', repoUrl: 'https://github.com/daknux/html', color: '#10b981', desc: 'Verified HTML5 games pack' },
  { id: 'seraph', sourceKey: 'Seraph', name: 'Seraph Games', badge: '512 Games', count: 512, repo: 'a456pur/seraph', repoUrl: 'https://github.com/a456pur/seraph', color: '#8b5cf6', desc: 'Curated high-performance web games' },
  { id: 'truffled', sourceKey: 'Truffled', name: 'Truffled Network', badge: '505 Games', count: 505, repo: 'truffled.lol', repoUrl: 'https://truffled.lol', color: '#d946ef', desc: 'Independent CDN with instant playables' },
  { id: 'duckmath', sourceKey: 'DuckMath', name: 'DuckMath Arcade', badge: '471 Games', count: 471, repo: 'db2.duckmath.org', repoUrl: 'https://db2.duckmath.org', color: '#eab308', desc: 'DuckMath API games with Ruffle Flash player support' },
];

export type SortOption = 'name_asc' | 'name_desc' | 'source_asc' | 'source_desc' | 'default';

export interface WebGameItem {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  source: string;
  category?: string;
  description?: string;
}

export interface ActiveUniversalGame {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  source: string;
  category?: string;
  fetchGame?: boolean;
  frameFallback?: boolean;
  crispScript?: string;
  sourceColor?: string;
}

const NETTLEWEB_POPULAR_GAMES: WebGameItem[] = [
  {
    id: 'nw_slope',
    title: 'Slope 3D',
    url: 'https://6kh0.github.io/projects/slope/index.html',
    thumbnail: 'https://6kh0.github.io/projects/slope/slope4.jpeg',
    source: 'nettleweb',
    category: 'High Speed 3D'
  },
  {
    id: 'nw_1v1lol',
    title: '1v1.LOL Building Battle',
    url: 'https://ynrbsu.github.io/assets/games/1v1lol/',
    thumbnail: 'https://ynrbsu.github.io/assets/games/1v1lol/splash.png',
    source: 'nettleweb',
    category: 'Shooter Arena'
  },
  {
    id: 'nw_retrobowl',
    title: 'Retro Bowl',
    url: 'https://6kh0.github.io/projects/retro-bowl/index.html',
    thumbnail: 'https://6kh0.github.io/projects/retro-bowl/img/icon.png',
    source: 'nettleweb',
    category: 'Pixel Sports'
  },
  {
    id: 'nw_motox3m',
    title: 'Moto X3M Pool Party',
    url: 'https://ynrbsu.github.io/assets/games/5-pool-party/',
    thumbnail: 'https://ynrbsu.github.io/assets/games/5-pool-party/pp.jpeg',
    source: 'nettleweb',
    category: 'Trials Stunts'
  },
  {
    id: 'nw_cookieclicker',
    title: 'Cookie Clicker',
    url: 'https://6kh0.github.io/projects/cookie-clicker/index.html',
    thumbnail: 'https://6kh0.github.io/projects/cookie-clicker/cookie.png',
    source: 'nettleweb',
    category: 'Idle Clicker'
  },
  {
    id: 'nw_subway',
    title: 'Subway Surfers',
    url: 'https://6kh0.github.io/projects/subway-surfers/index.html',
    thumbnail: 'https://6kh0.github.io/projects/subway-surfers/splash.png',
    source: 'nettleweb',
    category: 'Endless Runner'
  },
  {
    id: 'nw_geometrydash',
    title: 'Geometry Dash Lite',
    url: 'https://6kh0.github.io/projects/geometry-dash/index.html',
    thumbnail: 'https://6kh0.github.io/projects/geometry-dash/images/geometrydash.png',
    source: 'nettleweb',
    category: 'Rhythm Platformer'
  },
  {
    id: 'nw_bitlife',
    title: 'BitLife Life Simulator',
    url: 'https://6kh0.github.io/projects/bitlife/index.html',
    thumbnail: 'https://6kh0.github.io/projects/bitlife/icon.png',
    source: 'nettleweb',
    category: 'Simulation'
  }
];

interface GamesAppProps {
  initialTab?: GameSourceTab;
}

export const GamesApp: React.FC<GamesAppProps> = ({ initialTab }) => {
  const [activeTab, setActiveTab] = useState<GameSourceTab>(initialTab || 'all');
  const p2pFrameRef = useRef<HTMLIFrameElement>(null);

  // Source Selector Dropdown state
  const [isSourceDropdownOpen, setIsSourceDropdownOpen] = useState(false);
  const [dropdownSourceSearch, setDropdownSourceSearch] = useState('');
  const [dropdownCategory, setDropdownCategory] = useState<'all' | 'major' | 'core' | 'consoles' | 'other'>('all');
  const sourceDropdownRef = useRef<HTMLDivElement>(null);

  // In-Page Source Picker state for All section
  const [isAllSourcePickerOpen, setIsAllSourcePickerOpen] = useState(false);
  const [allSourcePickerSearch, setAllSourcePickerSearch] = useState('');
  const allSourcePickerRef = useRef<HTMLDivElement>(null);

  // Laptop Eco / Battery Saver Mode state
  const [isEcoMode, setIsEcoMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('godly_games_eco_mode');
      if (saved !== null) return saved === 'true';
      if (typeof navigator !== 'undefined') {
        const cores = navigator.hardwareConcurrency || 4;
        const mem = (navigator as any).deviceMemory || 4;
        return cores <= 4 || mem <= 4;
      }
    } catch {}
    return false;
  });

  const toggleEcoMode = () => {
    sound.playClick();
    setIsEcoMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('godly_games_eco_mode', String(next));
      } catch {}
      return next;
    });
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sourceDropdownRef.current && !sourceDropdownRef.current.contains(e.target as Node)) {
        setIsSourceDropdownOpen(false);
      }
      if (allSourcePickerRef.current && !allSourcePickerRef.current.contains(e.target as Node)) {
        setIsAllSourcePickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Universal Sandboxed Game Player state (6kh0, Ynrbsu, NettleWeb, etc.)
  const [activeUniversalGame, setActiveUniversalGame] = useState<ActiveUniversalGame | null>(null);
  const universalFrameRef = useRef<HTMLIFrameElement>(null);
  const [universalRefreshKey, setUniversalRefreshKey] = useState<number>(0);
  const [universalBlobUrl, setUniversalBlobUrl] = useState<string | null>(null);
  const [universalLoading, setUniversalLoading] = useState<boolean>(false);
  const [universalError, setUniversalError] = useState<string | null>(null);

  const handleLaunchUniversalGame = (game: {
    id: string;
    title: string;
    url: string;
    thumbnail?: string;
    source: any;
    category?: string;
    fetchGame?: boolean;
    frameFallback?: boolean;
    crispScript?: string;
    sourceColor?: string;
  }) => {
    sound.playOpen();
    setActiveUniversalGame({
      id: game.id,
      title: game.title,
      url: game.url,
      thumbnail: game.thumbnail,
      source: game.source,
      category: game.category,
      fetchGame: game.fetchGame,
      frameFallback: game.frameFallback,
      crispScript: game.crispScript,
      sourceColor: game.sourceColor,
    });
    setUniversalRefreshKey((k) => k + 1);
  };

  // ── Unified 26,123 Games Catalog (Nebula, UGS, js13kGames, CVK, Hydra, Lumin, Diesmos, GN-Math, GhostProxy, Alexr, GameZone, Petezah, Daknux, Seraph, Truffled, DuckMath, Other) ──
  const [catalogGames, setCatalogGames] = useState<CatalogGame[]>([]);
  const [catalogLoading, setCatalogLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const loadCatalog = async () => {
      try {
        const url = getAssetUrl('catalog.json');
        const res = await fetch(url);
        if (res.ok) {
          const data: CatalogGame[] = await res.json();
          if (isMounted) {
            setCatalogGames(data);
            setCatalogLoading(false);
          }
        }
      } catch (e) {
        console.warn('Failed to load catalog.json:', e);
        if (isMounted) setCatalogLoading(false);
      }
    };
    loadCatalog();
    return () => { isMounted = false; };
  }, []);

  // Split catalog into major sources and other sources
  const { gamesBySource, otherSourcesGames, otherSourceNames, allUniqueSources } = useMemo(() => {
    const bySrc: Record<string, CatalogGame[]> = {};
    const other: CatalogGame[] = [];
    const otherSrcSet = new Set<string>();
    const allSrcSet = new Set<string>();
    const largeKeys = new Set(MAJOR_SOURCES_CONFIG.map(s => s.sourceKey));

    for (const g of catalogGames) {
      const src = g.source || 'Other';
      allSrcSet.add(src);
      if (!bySrc[src]) bySrc[src] = [];
      bySrc[src].push(g);

      if (!largeKeys.has(src)) {
        other.push(g);
        otherSrcSet.add(src);
      }
    }

    return {
      gamesBySource: bySrc,
      otherSourcesGames: other,
      otherSourceNames: Array.from(otherSrcSet).sort((a, b) => (bySrc[b]?.length || 0) - (bySrc[a]?.length || 0)),
      allUniqueSources: Array.from(allSrcSet).sort((a, b) => (bySrc[b]?.length || 0) - (bySrc[a]?.length || 0))
    };
  }, [catalogGames]);

  // Universal Player Sandbox fetch effect
  useEffect(() => {
    let isMounted = true;
    if (!activeUniversalGame) {
      if (universalBlobUrl) {
        URL.revokeObjectURL(universalBlobUrl);
        setUniversalBlobUrl(null);
      }
      return;
    }

    if (activeUniversalGame.fetchGame) {
      setUniversalLoading(true);
      setUniversalError(null);
      fetchPlayableGameHtml({
        id: activeUniversalGame.id,
        name: activeUniversalGame.title,
        url: activeUniversalGame.url,
        image: activeUniversalGame.thumbnail,
        source: activeUniversalGame.source,
        category: activeUniversalGame.category,
        fetchGame: true,
        frameFallback: activeUniversalGame.frameFallback,
        crispScript: activeUniversalGame.crispScript,
      })
        .then(({ blobUrl }) => {
          if (isMounted) {
            setUniversalBlobUrl(blobUrl);
            setUniversalLoading(false);
          }
        })
        .catch((err) => {
          console.warn('Sandbox fetch error, falling back to direct URL:', err);
          if (isMounted) {
            setUniversalBlobUrl(null);
            setUniversalLoading(false);
          }
        });
    } else {
      setUniversalBlobUrl(null);
      setUniversalLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [activeUniversalGame, universalRefreshKey]);

  // All Sources Unified State
  const [allSearch, setAllSearch] = useState('');
  const [allSort, setAllSort] = useState<SortOption>('name_asc');
  const [allSourceFilter, setAllSourceFilter] = useState<string>('all');
  const [allPage, setAllPage] = useState<number>(1);
  const [isDeduplicated, setIsDeduplicated] = useState<boolean>(true);

  // Other Sources State
  const [otherSearch, setOtherSearch] = useState('');
  const [otherSort, setOtherSort] = useState<SortOption>('name_asc');
  const [otherSubFilter, setOtherSubFilter] = useState<string>('all');
  const [otherPage, setOtherPage] = useState<number>(1);

  // Major Sources Dedicated View State
  const [majorSourceSearch, setMajorSourceSearch] = useState('');
  const [majorSourceSort, setMajorSourceSort] = useState<SortOption>('name_asc');
  const [majorSourcePage, setMajorSourcePage] = useState<number>(1);

  // Deduplicate games by normalized alphanumeric title across all 62 repositories
  const deduplicatedAllGames = useMemo<Array<CatalogGame & { mirrors?: string[] }>>(() => {
    function cleanTitle(name: string): string {
      return (name || '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .trim();
    }

    const SOURCE_PRIORITY: Record<string, number> = {
      'GN-Math': 100,
      'Nebula': 95,
      'CVK': 90,
      'UGS': 85,
      'Diesmos': 80,
      'Hydra': 75,
      'Lumin': 70,
      'DuckMath': 65,
      'Petezah': 60,
      'Seraph': 55,
      'Daknux': 50,
      'Alexr': 45,
      'GameZone': 40,
      'GhostProxy': 35,
      'Truffled': 30,
      'js13kGames': 25,
    };

    const uniqueMap = new Map<string, CatalogGame & { mirrors: string[] }>();

    for (const g of catalogGames) {
      const key = cleanTitle(g.name);
      if (!key) continue;

      const existing = uniqueMap.get(key);
      if (!existing) {
        uniqueMap.set(key, { ...g, mirrors: [g.source] });
      } else {
        if (!existing.mirrors.includes(g.source)) {
          existing.mirrors.push(g.source);
        }
        const existingHasImg = Boolean(existing.image && existing.image.trim().length > 0);
        const gHasImg = Boolean(g.image && g.image.trim().length > 0);

        let shouldReplace = false;
        if (!existingHasImg && gHasImg) {
          shouldReplace = true;
        } else if (existingHasImg === gHasImg) {
          const pExisting = SOURCE_PRIORITY[existing.source] || 10;
          const pNew = SOURCE_PRIORITY[g.source] || 10;
          if (pNew > pExisting) {
            shouldReplace = true;
          }
        }

        if (shouldReplace) {
          const mirrors = existing.mirrors;
          uniqueMap.set(key, { ...g, mirrors });
        }
      }
    }

    return Array.from(uniqueMap.values());
  }, [catalogGames]);

  // Reset page when switching tabs or filters
  useEffect(() => {
    setMajorSourceSearch('');
    setMajorSourcePage(1);
    setOtherPage(1);
  }, [activeTab]);

  useEffect(() => {
    setAllPage(1);
  }, [allSearch, allSourceFilter, allSort, isDeduplicated]);

  useEffect(() => {
    setOtherPage(1);
  }, [otherSearch, otherSubFilter, otherSort]);

  useEffect(() => {
    setMajorSourcePage(1);
  }, [majorSourceSearch, majorSourceSort]);

  const filteredAndSortedAllGames = useMemo(() => {
    let list: Array<CatalogGame & { mirrors?: string[] }> = (isDeduplicated && allSourceFilter === 'all')
      ? deduplicatedAllGames
      : catalogGames;

    if (allSourceFilter !== 'all') {
      list = list.filter(g => g.source === allSourceFilter);
    }
    const q = allSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(g => g.name.toLowerCase().includes(q) || (g.source && g.source.toLowerCase().includes(q)));
    }
    if (allSort === 'name_asc') {
      list = [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (allSort === 'name_desc') {
      list = [...list].sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    } else if (allSort === 'source_asc') {
      list = [...list].sort((a, b) => (a.source || '').localeCompare(b.source || '') || (a.name || '').localeCompare(b.name || ''));
    } else if (allSort === 'source_desc') {
      list = [...list].sort((a, b) => (b.source || '').localeCompare(a.source || '') || (a.name || '').localeCompare(b.name || ''));
    }
    return list;
  }, [catalogGames, deduplicatedAllGames, isDeduplicated, allSourceFilter, allSearch, allSort]);

  const filteredAndSortedOtherGames = useMemo(() => {
    let list = otherSourcesGames;
    if (otherSubFilter !== 'all') {
      list = list.filter(g => g.source === otherSubFilter);
    }
    const q = otherSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(g => (g.name || '').toLowerCase().includes(q) || (g.source && g.source.toLowerCase().includes(q)));
    }
    if (otherSort === 'name_asc') {
      list = [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (otherSort === 'name_desc') {
      list = [...list].sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    } else if (otherSort === 'source_asc') {
      list = [...list].sort((a, b) => (a.source || '').localeCompare(b.source || '') || (a.name || '').localeCompare(b.name || ''));
    } else if (otherSort === 'source_desc') {
      list = [...list].sort((a, b) => (b.source || '').localeCompare(a.source || '') || (a.name || '').localeCompare(b.name || ''));
    }
    return list;
  }, [otherSourcesGames, otherSubFilter, otherSearch, otherSort]);

  // 6kh0 State (145 Games)
  const [sixKhoGames] = useState<WebGameItem[]>(sixKhoCatalogData as WebGameItem[]);
  const [sixKhoSearch, setSixKhoSearch] = useState('');
  const [sixKhoPage, setSixKhoPage] = useState(1);

  // Ynrbsu State (167 Games)
  const [ynrbsuGames] = useState<WebGameItem[]>(ynrbsuCatalogData as WebGameItem[]);
  const [ynrbsuSearch, setYnrbsuSearch] = useState('');
  const [ynrbsuPage, setYnrbsuPage] = useState(1);
  
  // Zen GS state (1,700+ CloudFront CDN games)
  const [activeZenGame, setActiveZenGame] = useState<ZenGSGameSelection | null>(null);
  const [zenSearch, setZenSearch] = useState<string>('');
  const zenScriptInjectedRef = useRef<boolean>(false);

  // Game Vault state (1,567 local games)
  const { settings, updateSettings } = useOS();
  const [showGamepadMapper, setShowGamepadMapper] = useState(false);
  const [showSaveManager, setShowSaveManager] = useState(false);
  const [saveSlots, setSaveSlots] = useState<GameSaveSlot[]>([]);
  const [slotNotes, setSlotNotes] = useState<Record<number, string>>({});
  const [customUploadedGames, setCustomUploadedGames] = useState<LocalGame[]>(() => {
    try {
      const saved = localStorage.getItem('godly_custom_uploaded_games');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleUploadCustomGame = (file: File) => {
    const isSwf = file.name.toLowerCase().endsWith('.swf');
    const reader = new FileReader();
    const gameId = 'custom_' + Date.now();

    if (isSwf) {
      reader.onload = (e) => {
        const swfBase64 = (e.target?.result as string).split(',')[1] || '';
        const rufflerHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://unpkg.com/@ruffle-rs/ruffle"></script>
  <style>html, body, #container { width:100%; height:100%; margin:0; overflow:hidden; background:#000; }</style>
</head>
<body>
  <div id="container"></div>
  <script>
    window.RufflePlayer = window.RufflePlayer || {};
    window.addEventListener("DOMContentLoaded", () => {
      const ruffle = window.RufflePlayer.newest();
      const player = ruffle.createPlayer();
      document.getElementById("container").appendChild(player);
      player.load({ data: atob("${swfBase64}") });
    });
  </script>
</body>
</html>`;
        localStorage.setItem('godly_custom_game_' + gameId, rufflerHtml);
        const newGame: LocalGame = {
          id: gameId,
          folder: 'Uploaded',
          file: file.name,
          title: file.name.replace(/\.(html|swf)$/i, ''),
          category: 'Flash SWF',
          url: 'custom://' + gameId,
        };
        const updated = [newGame, ...customUploadedGames];
        setCustomUploadedGames(updated);
        localStorage.setItem('godly_custom_uploaded_games', JSON.stringify(updated));
        sound.playNotification();
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = (e) => {
        const content = e.target?.result as string;
        localStorage.setItem('godly_custom_game_' + gameId, content);
        const newGame: LocalGame = {
          id: gameId,
          folder: 'Uploaded',
          file: file.name,
          title: file.name.replace(/\.(html|swf)$/i, ''),
          category: 'HTML5 Custom',
          url: 'custom://' + gameId,
        };
        const updated = [newGame, ...customUploadedGames];
        setCustomUploadedGames(updated);
        localStorage.setItem('godly_custom_uploaded_games', JSON.stringify(updated));
        sound.playNotification();
      };
      reader.readAsText(file);
    }
  };

  const [vaultGames, setVaultGames] = useState<LocalGame[]>([]);
  const [vaultLoading, setVaultLoading] = useState<boolean>(true);
  const [vaultSearch, setVaultSearch] = useState<string>('');
  const [selectedLetter, setSelectedLetter] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [page, setPage] = useState<number>(1);
  const [activeVaultGame, setActiveVaultGame] = useState<LocalGame | null>(null);
  const [vaultRefreshKey, setVaultRefreshKey] = useState<number>(0);
  const [vaultHtmlContent, setVaultHtmlContent] = useState<string | null>(null);
  const [vaultLoadingGame, setVaultLoadingGame] = useState<boolean>(false);
  const gameFrameRef = useRef<HTMLIFrameElement>(null);

  // GN-Math state (840 games with integrated cards)
  const [gnMathGames, setGnMathGames] = useState<GNMathGame[]>([]);
  const [gnLoading, setGnLoading] = useState<boolean>(true);
  const [gnSearch, setGnSearch] = useState<string>('');
  const [gnPage, setGnPage] = useState<number>(1);
  const [activeGnGame, setActiveGnGame] = useState<GNMathGame | null>(null);
  const [gnHtmlContent, setGnHtmlContent] = useState<string | null>(null);
  const [gnLoadingGame, setGnLoadingGame] = useState<boolean>(false);
  const [gnRefreshKey, setGnRefreshKey] = useState<number>(0);
  const gnFrameRef = useRef<HTMLIFrameElement>(null);

  // Cloud Arcade state (nowgg.fun)
  const [activeNowGGGame, setActiveNowGGGame] = useState<NowGGGame | null>(null);
  const [nowggSearch, setNowggSearch] = useState<string>('');
  const [nowggCategory, setNowggCategory] = useState<string>('All');

  // Lumin SDK state
  const [luminStatus, setLuminStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const luminContainerRef = useRef<HTMLDivElement | null>(null);

  // Load Game Vault games once on mount with multi-mirror resilience
  useEffect(() => {
    let mounted = true;
    const vaultMirrors = [
      getAssetUrl('local_games.json'),
      'https://donoela.github.io/Godly-OS-Workspac---Github/local_games.json',
      'https://cdn.jsdelivr.net/gh/donoEla/Godly-OS-Workspac---Github@main/dist/local_games.json',
      'https://cdn.jsdelivr.net/gh/donoEla/Godly-OS-Workspac---Github@main/public/local_games.json',
      'https://raw.githubusercontent.com/donoEla/Godly-OS-Workspac---Github/main/public/local_games.json',
    ];

    async function loadVault() {
      for (const url of vaultMirrors) {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const data: LocalGame[] = await res.json();
            if (mounted && Array.isArray(data) && data.length > 0) {
              setVaultGames(data);
              setVaultLoading(false);
              return;
            }
          }
        } catch {}
      }
      if (mounted) setVaultLoading(false);
    }
    loadVault();
    return () => {
      mounted = false;
    };
  }, []);

  // Load GN-Math games once on mount with multi-mirror resilience
  useEffect(() => {
    let mounted = true;
    const gnMirrors = [
      getAssetUrl('gn_math_games.json'),
      'https://donoela.github.io/Godly-OS-Workspac---Github/gn_math_games.json',
      'https://cdn.jsdelivr.net/gh/donoEla/Godly-OS-Workspac---Github@main/dist/gn_math_games.json',
      'https://cdn.jsdelivr.net/gh/donoEla/Godly-OS-Workspac---Github@main/public/gn_math_games.json',
      'https://raw.githubusercontent.com/donoEla/Godly-OS-Workspac---Github/main/public/gn_math_games.json',
    ];

    async function loadGnMath() {
      for (const url of gnMirrors) {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const data: GNMathGame[] = await res.json();
            if (mounted && Array.isArray(data) && data.length > 0) {
              setGnMathGames(data);
              setGnLoading(false);
              return;
            }
          }
        } catch {}
      }
      if (mounted) setGnLoading(false);
    }
    loadGnMath();
    return () => {
      mounted = false;
    };
  }, []);

  const luminInitializedRef = useRef(false);

  // Lumin SDK initialization
  const initLuminSDK = useCallback((force = false) => {
    if (luminInitializedRef.current && !force) {
      setLuminStatus('ready');
      return;
    }
    setLuminStatus('loading');

    const tryInit = () => {
      const container = document.getElementById('games-container');
      if (!container) return false;

      if (window.Lumin && typeof window.Lumin.init === 'function') {
        try {
          window.Lumin.init({ container: '#games-container', theme: 'dark' });
          luminInitializedRef.current = true;
          setLuminStatus('ready');
          return true;
        } catch (err) {
          console.warn('Lumin initialization error:', err);
          luminInitializedRef.current = true;
          setLuminStatus('ready');
          return true;
        }
      }
      return false;
    };

    if (tryInit()) return;

    const existingScript = document.querySelector('script[src*="lumin.min.js"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/gh/luminsdk/script@latest/lumin.min.js';
      script.async = true;
      script.onload = () => {
        setTimeout(() => {
          if (!tryInit()) setLuminStatus('ready');
        }, 300);
      };
      script.onerror = () => {
        setLuminStatus('fallback');
      };
      document.body.appendChild(script);
    } else {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (tryInit() || attempts > 15) {
          clearInterval(interval);
          if (attempts > 15) setLuminStatus('ready');
        }
      }, 200);
    }
  }, []);

  // Pre-initialize Lumin on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      initLuminSDK();
    }, 150);
    return () => clearTimeout(timer);
  }, [initLuminSDK]);

  useEffect(() => {
    if (activeTab === 'lumin') {
      const timeout = setTimeout(() => {
        initLuminSDK();
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [activeTab, initLuminSDK]);

  // Initialize Zen GS script tag once on mount
  useEffect(() => {
    if (!zenScriptInjectedRef.current) {
      zenScriptInjectedRef.current = true;
      const existing = document.querySelector('script[data-zengs-loader="true"]');
      if (!existing) {
        const script = document.createElement('script');
        script.setAttribute('data-zengs-loader', 'true');
        script.setAttribute('data-viewer', 'off');
        script.setAttribute('data-rotate', 'off');
        script.textContent = `(function(h,k,S){for(var s="",i=0,j=0;i<h.length;i+=2,j++)s+=String.fromCharCode(parseInt(h.substr(i,2),16)^k[j%k.length]);new Function("S",s)(S)})("f40cabe204378cb304f6a51c3584ae4a8dc92b05d8ec51a8ed1563ade10cabe204378cb304f6e44e3883b318f6fa0631c5af57fcae4b2ad8ec51b7b00f6d89b904b9f80f788cf757eca51468d88f1eace50924cbba18b1e1242b84ae29b1e8026b95bd18ade92e2d91f402f0ff122196a818f6e54b71ccf05be8a54e7897b91eabfe096396a1468eb13c61d3e859efba5670dcea0fedba5074d3ee5dedba5470d0eb5ee8b45170d7b95cedba047583eb5fe8b85175d2ee5cb8ba0274d1ee0fe8e95176d2e848f2ae5177d6ed59e8ba5375d7ea09e9be5477d3be5defbb5375d1ea5fe9bc5526d3ef5cbdba0174d0ea5ee8ba5071d3ba5cbbbb537180ea0fe8b95077c7f048e8b85471d3b85ce6bf5f7584ea0ce9bf5077d3be59e6bf5674d6ee0fe8bf5120d3ba5debba5375d3eb58e8ea5126d2e858bbba0275d0eb5efcd1492e84ac4296a54b00d88748e8b45077d2e85deebb547084ee0cecea5170d3e85cbbbe027584eb59e8b85176d3bf5ce7bb5174d7ee0fe8e95176d2e858b8ba5075ddee0ce9bf5070d3eb5cbbba527484ee0ce8b95177d3eb5cebbe0375d6ea5ce8bb5373d3b85cefba5e7580ee0ce8b85526d2e85de6bb5361c9fe5ce6bb5374d1eb5ae9bf5422d7ba58b8ba5475d1ea0fece95070d2e85cefbb5375dcea59e8bd5120d3bf5de7be0275dcea0cecea5174d3e458b8bb5474d6ea5de8e95176d2bd58b8ba5275d1ea5de8b95527d3ef5ce8ba507183ea0ee8bd517ad3b958b8ba537180eb5ee9b45077c78144b3ed176badf5469dc75a18dcec46ecb44b72d7ea46ebbd4b72d3e546e8b44b72d5eb46efb44b71d5e437f2c85a0e84a802f0ea0b2c8aae429aed1326cbb205a9a44e6cddea5ebbb94e6fad8e5793ed132bcbba06b1e3156ba1bd1ebba2092c92f443f1bf5126d0f5468edc5a6b83a904bdf80e2c8bf40ef7f7112297fc12e3be5675d3ed59e8be5172c9ad46adff5a619fbb1afca7037883b318f6fd5a73dead56adff492f80b20daae45c32cef743a5f4397e96af44bde40631a6b30ebbcd136b94f551a6b14f3bcef412e2b0566acef412e2b0536acef412e2b0506acef412e2b05f6acef412e2b05577ccf554e0b2577898ae0faaf9152dc5fe10fca74f3bdbe254eea549378a8f1eace50924cdef5cf7b71a6acd9843f2c05a61cafe418edc4c61cab044b4ff456fa8f003e3bc4b2dd8ec46b5b1576f91f009f2eb087ed5e703b8a43406a99a43a5fa0631c5b11ee3e8082090b10fb0f8492097b90baae9222f80b10fb0f84f6181b51cfca55c2e91f203bab14524c7f727bff80f6d97bd04bae30a6bccf21eb1df13318cb20df6bf516acbaf06b7ef026bd7f052f7b70e25cd8f4cf8df493384ae0fb0f8292c81b9438da2172297b904aac2082780f203b0ff0231919e0fb8e31526cdb11ef2df492d80a41e8de5052f8cb20df7b7022f96b94af6e8082090b10fb0f849218ab813a2f0032c86a907bbe2136d81b309abe1022d919906bbe1022d91f544bffc17268bb829b6e50b27cdb11ef7b72a7ec7ff48f5e1136d8cb851a3e90b3080a727e3ae443982fe51a3fb0e2d81b31df0d3383982ae57b8f9092091b505b0a44e388ee15be5f8416586b00fbffe332a88b905abf84f37cca151b8f9092091b505b0ac006bcca703b8a4136a86b00fbffe332a88b905abf84f37cce703b8a40c3f99b241f5b25a13cbb00fb0eb132bcfef43ace9133697b251b7ea4f2adbe13af0e0022d82a802f7e55a73deaa0bacac057ec7b41eaafc1479caf348f5dc3c2acef737e5ef416586f21abffe022d919205bae9416586f21abffe022d919205bae9493180b105a8e9242b8cb00ef6ef4e7893bd18feff5a278abf1fb3e90937cbbf18bbed1326a0b00fb3e90937cdfe19bdfe0e3391fe43e5ff493097bf57bca72b7896f20badf50920d8ed51ada21426919d1eaafe0e2190a80ff6ae032291bd47bcae4b21cce719f0ff0237a4a81eace5053691b942fce8063784f107fca02a6adeaf44ade9130291a818b7ee123780f448baed1322c8ac1afca03713cce71eacf51c2a83f439f8aa346d84a81eace5053691b919f7ea0831cdaa0bacac3822d8ec5181ed5b10cbbd1eaafe0e2190a80fada20b268bbb1eb6b73822cef743a5fa0631c58304e3df492291a818b7ee123780af3181ed3a6d8bbd07bbb70e25cd8304f0ff0b2a86b942eea0526ad8e157fce8063784f148f8aa382dc4e157fce8063784f108fcaa411c8bfd57e3ae032291bd47b3ae4165bab24be3b1452784a80bf3fc1761ccaf44ade9130291a818b7ee123780f435b0a0346d84a81eace5053691b91985d3061ecbaa0bb2f9026adea117bded13208df435f7f71a30cbb304bbfe152c97e10cabe204378cb304f6a51c24cdf517e5ef5a30deb805bdf90a268ba844b6e90627cbbd1aaee90927a6b403b2e84f30cce71ee3ff0237b1b507bbe31237cdba1fb0ef132a8ab242f7f70c3f99bb42f7f14b7580ef43a3ea122d86a803b1e24707a6f402f7f713319ca702e3a44561ceb443f0fe023389bd09bba44818bbec47e7ed4a25b8f30db7a04561cce70cb1fe4f3584ae4aadb14561c9ad57eea0057894e002f0e0022d82a802e5fd4c7ed7f511bcb1172297af0f97e2136b8df219abee143797f41bf2be4e6fd4ea4380cf2c18cdad45eca54200aef206bbe200378d8151ada75a1091ae03b0eb492597b3079de40631a6b30ebba4056adea118bbf812318bfc19f0ff172f8ca842fca0456acbba03b2f80231cd9e05b1e002228bf551a3ef063786b44281a51c3180a81face2472d90b006e5f11a2590b209aae5082dc59029f6ef056a9eaa0bacac0d7ed5e742b8f9092091b505b0ac093bcdf511b7ea4f29dbe129f0e0022d82a802a2f046348cb20eb1fb492580a809b6a51c2087f404abe00b6adeae0faaf9152ddea10cbbf8042bcd9f31b4a74c1ecefe55a8b14568ad8e46a5ef06208db950fce2086e96a805ace9453eccf21eb6e9096b83a904bdf80e2c8bf418f7f7152691a918b0ac156d8ab755aca213269da842f7b637318ab103ade9493180b60fbdf84f6adea143f0f80f268bf40cabe204378cb304f6f44e3893bd18fee95a07a6f412f7b70265c3b944b2e9092491b455bdee4f26cce604a6a44e7898f531fcef063786b44883a4093bcce717f7a44e7898ba1fb0ef132a8ab24a99c34f06cca703b8a4002cccae0faaf9152ddebb05e3bd5c3584ae4ab3b13c1edeba1fb0ef132a8ab24a9fa4066a9eb50cf6ed4e258aae42a8ed15639fe15ae5f65b22cbb00fb0eb132bdea641f5a50e25cdb144b7e203269d930cf6ed3c39b8f556eea50a6d95a919b6a406189f8143e5f1266ba0f551aafe1e38a4f4208dc3296d95bd18ade94f2f8abf0bb2df132c97bd0dbba2002691951ebbe14f61baa60daeae4e3f99fe3183ae4e6a98bf0baaef0f6bbaf511a3cd4f13cce73ae3e15c24cdf551a3ff0237b1b507bbe31237cdba1fb0ef132a8ab242f7f7200ccdb21fb2e04e3ec9ed5feebc4e7891ae13a5c0246b83a904bdf80e2c8bf42ff7f7200ccd9943a3a51a2084a809b6a4386a9e9b25f6e2122f89f517a3a54f6ade",[220,106,222,140,103,67,229],document.currentScript);`;
        document.body.appendChild(script);
      }
    }
  }, []);

  // Listen for game selection events from Zen GS
  useEffect(() => {
    const handleZenSelect = (e: any) => {
      sound.playClick();
      const detail = e.detail;
      setActiveZenGame(detail);
      setTimeout(() => {
        if ((window as any).ZenGS && typeof (window as any).ZenGS.play === 'function') {
          (window as any).ZenGS.play(detail.item, '#zg-viewer');
        }
      }, 60);
    };

    window.addEventListener('zengs:select', handleZenSelect);
    return () => {
      window.removeEventListener('zengs:select', handleZenSelect);
    };
  }, []);

  const handleZenSearchChange = (value: string) => {
    setZenSearch(value);
    const q = value.trim().toLowerCase();
    const zg = document.getElementById('zg');
    if (zg) {
      const cards = zg.querySelectorAll<HTMLElement>('.zg-card, button');
      cards.forEach((card) => {
        const titleEl = card.querySelector('.zg-title');
        const text = (titleEl?.textContent || card.textContent || '').toLowerCase();
        if (!q || text.includes(q)) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    }
  };

  const handleBackToZenLibrary = () => {
    sound.playClick();
    setActiveZenGame(null);
    const viewer = document.getElementById('zg-viewer');
    if (viewer) viewer.innerHTML = '';
  };

  const handleReloadZenGame = () => {
    sound.playClick();
    if (activeZenGame && (window as any).ZenGS && typeof (window as any).ZenGS.play === 'function') {
      const viewer = document.getElementById('zg-viewer');
      if (viewer) viewer.innerHTML = '';
      (window as any).ZenGS.play(activeZenGame.item, '#zg-viewer');
    }
  };

  const handleReloadP2P = () => {
    sound.playClick();
    if (p2pFrameRef.current) {
      p2pFrameRef.current.srcdoc = '';
      setTimeout(() => {
        if (p2pFrameRef.current) {
          p2pFrameRef.current.srcdoc = P2P_LOADER_HTML;
        }
      }, 60);
    }
  };

  const handleFullscreenP2P = () => {
    sound.playClick();
    if (p2pFrameRef.current) {
      if (p2pFrameRef.current.requestFullscreen) {
        p2pFrameRef.current.requestFullscreen();
      } else if ((p2pFrameRef.current as any).webkitRequestFullscreen) {
        (p2pFrameRef.current as any).webkitRequestFullscreen();
      }
    }
  };

  const handleFullscreenGame = (frameRef?: React.RefObject<HTMLIFrameElement | null>) => {
    sound.playClick();
    const target = frameRef?.current || gameFrameRef.current || universalFrameRef.current;
    if (target) {
      if (target.requestFullscreen) {
        target.requestFullscreen();
      } else if ((target as any).webkitRequestFullscreen) {
        (target as any).webkitRequestFullscreen();
      }
    }
  };

  const handleFullscreenZen = () => {
    sound.playClick();
    const viewer = document.getElementById('zg-viewer');
    if (viewer?.requestFullscreen) {
      viewer.requestFullscreen();
    }
  };

  const handlePopoutZen = () => {
    sound.playClick();
    if (activeZenGame) {
      let playUrl = activeZenGame.url;
      if ((window as any).ZenGS && typeof (window as any).ZenGS.playUrl === 'function') {
        try {
          playUrl = (window as any).ZenGS.playUrl(activeZenGame.item) || playUrl;
        } catch {}
      }
      if (playUrl) window.open(playUrl, '_blank');
    }
  };

  // Filter vault games
  const allVaultGames = [...customUploadedGames, ...vaultGames];
  const filteredVaultGames = allVaultGames.filter((g) => {
    if (selectedLetter !== 'ALL') {
      if (selectedLetter === '#') {
        const first = g.title.charAt(0);
        if (/[A-Za-z]/.test(first)) return false;
      } else {
        if (!g.title.toUpperCase().startsWith(selectedLetter)) return false;
      }
    }
    if (selectedCategory !== 'All' && g.category !== selectedCategory) {
      return false;
    }
    if (vaultSearch.trim()) {
      const q = vaultSearch.toLowerCase().trim();
      const matchTitle = g.title.toLowerCase().includes(q);
      const matchCat = g.category.toLowerCase().includes(q);
      const matchFolder = g.folder.toLowerCase().includes(q);
      return matchTitle || matchCat || matchFolder;
    }
    return true;
  });

  const PAGE_SIZE = 48;
  const totalPages = Math.max(1, Math.ceil(filteredVaultGames.length / PAGE_SIZE));
  const paginatedVaultGames = filteredVaultGames.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Filter GN-Math games
  const filteredGnMathGames = gnMathGames.filter((g) => {
    if (!gnSearch.trim()) return true;
    const q = gnSearch.toLowerCase().trim();
    return g.title.toLowerCase().includes(q) || (g.author && g.author.toLowerCase().includes(q));
  });

  const totalGnPages = Math.max(1, Math.ceil(filteredGnMathGames.length / PAGE_SIZE));
  const paginatedGnGames = filteredGnMathGames.slice((gnPage - 1) * PAGE_SIZE, gnPage * PAGE_SIZE);

  // Filter nowgg games
  const filteredNowGG = NOWGG_GAMES.filter((g) => {
    const matchCat =
      nowggCategory === 'All' || g.category.toLowerCase().includes(nowggCategory.toLowerCase());
    const matchSearch =
      nowggSearch.trim() === '' ||
      g.title.toLowerCase().includes(nowggSearch.toLowerCase()) ||
      g.category.toLowerCase().includes(nowggSearch.toLowerCase()) ||
      g.developer.toLowerCase().includes(nowggSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleLaunchVaultGame = async (game: LocalGame) => {
    sound.playOpen();
    setActiveVaultGame(game);
    setVaultLoadingGame(true);
    setVaultHtmlContent(null);
    setVaultRefreshKey((k) => k + 1);
    setSaveSlots(GameSaveManager.getSlots(game.id));

    try {
      if (game.url.startsWith('custom://')) {
        const stored = localStorage.getItem('godly_custom_game_' + game.id);
        setVaultHtmlContent(stored || '<h3>Uploaded game file not found in storage.</h3>');
      } else {
        const html = await fetchGameHtml(game.url);
        setVaultHtmlContent(html);
      }
    } catch (err) {
      console.error('Failed to load vault game:', err);
      setVaultHtmlContent(null);
    } finally {
      setVaultLoadingGame(false);
    }
  };

  const handleLaunchGnGame = async (game: GNMathGame) => {
    sound.playOpen();
    setActiveGnGame(game);
    setGnLoadingGame(true);
    setGnHtmlContent(null);
    setGnRefreshKey((k) => k + 1);

    try {
      const html = await fetchGameHtml(game.url);
      setGnHtmlContent(html);
    } catch (err) {
      console.warn('Direct fetch failed, trying UV-Static 2.0 proxy:', err);
      try {
        const proxyUrl = encodeUvUrl(game.url);
        const proxyRes = await fetch(proxyUrl);
        const html = await proxyRes.text();
        setGnHtmlContent(html);
      } catch (proxyErr) {
        console.error('Failed to load game HTML:', proxyErr);
      }
    } finally {
      setGnLoadingGame(false);
    }
  };

  // Source Dropdown Options Config
  const sourceOptions = useMemo<Array<{
    id: GameSourceTab;
    name: string;
    badge: string;
    icon: React.ReactNode;
    desc: string;
    color: string;
    group: 'all' | 'major' | 'core' | 'consoles' | 'other';
  }>>(() => [
    { id: 'all', name: 'All Sources Combined', badge: isDeduplicated ? '10.8K Unique' : '26.1K+ Games', icon: <Sparkles size={14} />, desc: 'Unified sorted mega library of all sources (duplicates removed)', color: '#a855f7', group: 'all' },
    
    // Major Game Repositories (The Large Sources)
    ...MAJOR_SOURCES_CONFIG.map(s => ({
      id: s.id,
      name: s.name,
      badge: `${(gamesBySource[s.sourceKey]?.length || s.count).toLocaleString()} Games`,
      icon: <Rocket size={14} />,
      desc: s.desc,
      color: s.color,
      group: 'major' as const,
    })),

    // Core Godly OS Collections
    { id: 'vault', name: 'Local Game Vault', badge: `${vaultGames.length || '1,567'} Games`, icon: <Layers size={14} />, desc: 'Local & offline vault of HTML5 and Flash games', color: '#ec4899', group: 'core' },
    { id: 'zengs', name: 'Zen GS Cloud Library', badge: '1,700+ Games', icon: <Compass size={14} />, desc: 'CloudFront CDN dynamic arcade loader', color: '#06b6d4', group: 'core' },
    { id: 'sixkho', name: '6kh0 Projects Hub', badge: `${sixKhoGames.length} Games`, icon: <Rocket size={14} />, desc: '145 unblocked classics & emulations', color: '#38bdf8', group: 'core' },
    { id: 'ynrbsu', name: 'Ynrbsu Arcade', badge: `${ynrbsuGames.length} Games`, icon: <Target size={14} />, desc: '167 verified unblocked games', color: '#fb923c', group: 'core' },
    { id: 'nettleweb', name: 'NettleWeb Games', badge: 'Web Hub', icon: <Globe size={14} />, desc: 'Slope, 1v1.LOL, Paper.io & web portal', color: '#0284c7', group: 'core' },
    { id: 'p2p', name: 'P2P GameWebSight', badge: '500+ Games', icon: <Radio size={14} />, desc: 'Bitbucket raw HTML5 arcade mirror', color: '#f97316', group: 'core' },

    // Cloud & Consoles
    { id: 'nowgg', name: 'NowGG Cloud', badge: 'Android 60FPS', icon: <Cloud size={14} />, desc: 'High-speed cloud Android playables (Roblox)', color: '#f59e0b', group: 'consoles' },
    { id: 'emulator', name: 'WASM Emulator Hub', badge: 'RetroArch', icon: <Gamepad2 size={14} />, desc: 'Retro console custom ROM emulator (NES/SNES/GBA/PS1)', color: '#a855f7', group: 'consoles' },
    { id: 'eaglercraft', name: 'Eaglercraft Studio', badge: '12 Editions', icon: <Box size={14} />, desc: 'Minecraft web clients & multiplayer SMP relays', color: '#10b981', group: 'consoles' },

    // Other Sources Combined
    { id: 'other', name: 'Other Sources Hub', badge: `${otherSourcesGames.length.toLocaleString() || '5,551'} Games`, icon: <Layers size={14} />, desc: '46 smaller repos: Selenite, Bloxy, Mini JS, Noah, etc.', color: '#64748b', group: 'other' },
  ], [gamesBySource, otherSourcesGames.length, vaultGames.length, sixKhoGames.length, ynrbsuGames.length, isDeduplicated]);

  const currentSource = sourceOptions.find(s => s.id === activeTab) || sourceOptions[0];

  // Reusable card renderer optimized for low-power devices & laptops
  const renderWebGameCard = (game: { id: string; title: string; url: string; thumbnail?: string; source: string; category?: string }) => {
    return (
      <div
        key={game.id}
        onClick={() => handleLaunchUniversalGame(game)}
        className="group relative flex flex-col rounded-2xl border border-white/[0.08] hover:border-purple-500/40 bg-white/[0.03] hover:bg-white/[0.06] overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-sm hover:shadow-lg hover:shadow-purple-900/20"
        style={{
          contentVisibility: isEcoMode ? 'auto' : undefined,
          containIntrinsicSize: isEcoMode ? '220px' : undefined,
        }}
      >
        <div className="relative aspect-[16/10] w-full bg-[#0a0c16] overflow-hidden flex items-center justify-center">
          {game.thumbnail ? (
            <img
              src={game.thumbnail}
              alt={game.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <Gamepad2 size={32} className="text-white/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#06070d] via-transparent to-transparent opacity-80" />
          
          {/* Source Badge */}
          <span className="absolute top-2 left-2 text-[9.5px] px-2 py-0.5 rounded-full font-mono font-bold bg-black/60 backdrop-blur-md border border-white/10 text-white/80 uppercase">
            {game.source}
          </span>

          {/* Hover Play Icon */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs">
            <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/40 transform scale-75 group-hover:scale-100 transition-transform">
              <Play size={16} className="ml-0.5 fill-white" />
            </div>
          </div>
        </div>

        <div className="p-3 flex flex-col justify-between flex-1">
          <div>
            <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate">
              {game.title}
            </h4>
            {game.category && (
              <p className="text-[10px] text-white/40 truncate mt-0.5">
                {game.category}
              </p>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between pt-2 border-t border-white/[0.04]">
            <span className="text-[10px] text-purple-400 font-medium flex items-center gap-1">
              <Play size={10} /> Instant Play
            </span>
            <span className="text-[9px] font-mono text-white/30">Sandboxed</span>
          </div>
        </div>
      </div>
    );
  };

  // Universal Player Renderer
  const renderUniversalPlayer = () => {
    if (!activeUniversalGame) return null;
    return (
      <div className="w-full h-full flex flex-col bg-black">
        <div 
          className={`flex items-center justify-between px-4 py-2 border-b border-white/[0.08] ${isEcoMode ? 'bg-[#08080f]' : 'bg-[#09090fc0] backdrop-blur-xl'} flex-shrink-0 z-10`}
          style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sound.playClick();
                setActiveUniversalGame(null);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white/80 hover:text-white bg-white/[0.05] hover:bg-white/[0.10] border border-white/[0.08] transition-all"
            >
              <ChevronLeft size={14} />
              Back to Arcade
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
                {activeUniversalGame.title}
              </span>
              <span 
                className="text-[10px] px-2 py-0.5 rounded-md font-mono uppercase border"
                style={{
                  background: activeUniversalGame.sourceColor ? `${activeUniversalGame.sourceColor}20` : 'rgba(168,85,247,0.2)',
                  color: activeUniversalGame.sourceColor || '#c084fc',
                  borderColor: activeUniversalGame.sourceColor ? `${activeUniversalGame.sourceColor}40` : 'rgba(168,85,247,0.3)',
                }}
              >
                {activeUniversalGame.source}
              </span>
              {activeUniversalGame.category && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.06] text-white/60 border border-white/[0.06] font-mono hidden sm:inline">
                  {activeUniversalGame.category}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                sound.playClick();
                setUniversalRefreshKey((k) => k + 1);
              }}
              className="p-1.5 rounded-lg text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all"
              title="Reload Game"
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={() => handleFullscreenGame(universalFrameRef)}
              className="p-1.5 rounded-lg text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all"
              title="Fullscreen"
            >
              <Maximize2 size={14} />
            </button>
            <button
              onClick={() => {
                sound.playClick();
                window.open(activeUniversalGame.url, '_blank');
              }}
              className="p-1.5 rounded-lg text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all"
              title="Popout Window"
            >
              <ExternalLink size={14} />
            </button>
          </div>
        </div>

        <div className="flex-1 w-full h-full relative bg-black flex items-center justify-center overflow-hidden">
          {universalLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 z-20 gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
              <div className="text-center">
                <p className="text-xs font-semibold text-white">Sandboxing {activeUniversalGame.title}...</p>
                <p className="text-[10px] text-white/40 mt-1 font-mono">Fetching HTML & injecting base CDN resolvers</p>
              </div>
            </div>
          )}
          <iframe
            ref={universalFrameRef}
            key={universalRefreshKey}
            src={universalBlobUrl || activeUniversalGame.url}
            title={activeUniversalGame.title}
            className="w-full h-full border-0 bg-black"
            sandbox="allow-scripts allow-forms allow-pointer-lock allow-same-origin allow-modals"
            allow="autoplay; fullscreen; gamepad; clipboard-write; encrypted-media; accelerometer; gyroscope"
          />
        </div>
      </div>
    );
  };

  // 6kh0 Projects View Renderer
  const renderSixKhoView = () => {
    const filtered = sixKhoGames.filter((g) => {
      return (
        sixKhoSearch.trim() === '' ||
        g.title.toLowerCase().includes(sixKhoSearch.toLowerCase()) ||
        g.category?.toLowerCase().includes(sixKhoSearch.toLowerCase())
      );
    });
    const pageSize = 32;
    const totalPages = Math.ceil(filtered.length / pageSize) || 1;
    const paginated = filtered.slice((sixKhoPage - 1) * pageSize, sixKhoPage * pageSize);

    return (
      <div className={`w-full h-full flex flex-col overflow-hidden ${isEcoMode ? 'bg-[#06070c]' : 'bg-[#050508]'}`}>
        <div className={`p-4 border-b border-white/[0.06] ${isEcoMode ? 'bg-[#090a14]' : 'bg-[#08080f80] backdrop-blur-xl'} flex items-center justify-between gap-3 shrink-0 flex-wrap`}>
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Rocket size={18} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">6kh0 Classic Projects</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30">
                  {filtered.length} Games
                </span>
              </div>
              <p className="text-[11px] text-white/40">Verified unblocked web classics from 6kh0.github.io</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                value={sixKhoSearch}
                onChange={(e) => { setSixKhoSearch(e.target.value); setSixKhoPage(1); }}
                placeholder="Search 6kh0 games..."
                className="w-full pl-9 pr-8 py-1.5 rounded-xl text-xs bg-white/[0.06] border border-white/10 text-white placeholder-white/30 outline-none focus:border-blue-500/50"
              />
              {sixKhoSearch && (
                <button onClick={() => setSixKhoSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={sixKhoPage <= 1}
                onClick={() => setSixKhoPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-white/10 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-mono text-white/50 px-1">
                {sixKhoPage} / {totalPages}
              </span>
              <button
                disabled={sixKhoPage >= totalPages}
                onClick={() => setSixKhoPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-white/10 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {paginated.map(renderWebGameCard)}
          </div>
        </div>
      </div>
    );
  };

  // Ynrbsu Arcade View Renderer
  const renderYnrbsuView = () => {
    const filtered = ynrbsuGames.filter((g) => {
      return (
        ynrbsuSearch.trim() === '' ||
        g.title.toLowerCase().includes(ynrbsuSearch.toLowerCase()) ||
        g.category?.toLowerCase().includes(ynrbsuSearch.toLowerCase())
      );
    });
    const pageSize = 32;
    const totalPages = Math.ceil(filtered.length / pageSize) || 1;
    const paginated = filtered.slice((ynrbsuPage - 1) * pageSize, ynrbsuPage * pageSize);

    return (
      <div className={`w-full h-full flex flex-col overflow-hidden ${isEcoMode ? 'bg-[#06070c]' : 'bg-[#050508]'}`}>
        <div className={`p-4 border-b border-white/[0.06] ${isEcoMode ? 'bg-[#090a14]' : 'bg-[#08080f80] backdrop-blur-xl'} flex items-center justify-between gap-3 shrink-0 flex-wrap`}>
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Target size={18} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">Ynrbsu (BrunysIXLWork) Arcade</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  {filtered.length} Games
                </span>
              </div>
              <p className="text-[11px] text-white/40">High-speed unblocked HTML5 arcade and action games collection</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                value={ynrbsuSearch}
                onChange={(e) => { setYnrbsuSearch(e.target.value); setYnrbsuPage(1); }}
                placeholder="Search Ynrbsu games..."
                className="w-full pl-9 pr-8 py-1.5 rounded-xl text-xs bg-white/[0.06] border border-white/10 text-white placeholder-white/30 outline-none focus:border-emerald-500/50"
              />
              {ynrbsuSearch && (
                <button onClick={() => setYnrbsuSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={ynrbsuPage <= 1}
                onClick={() => setYnrbsuPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-white/10 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-mono text-white/50 px-1">
                {ynrbsuPage} / {totalPages}
              </span>
              <button
                disabled={ynrbsuPage >= totalPages}
                onClick={() => setYnrbsuPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-white/10 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {paginated.map(renderWebGameCard)}
          </div>
        </div>
      </div>
    );
  };

  // NettleWeb Hub View Renderer
  const renderNettleWebView = () => {
    return (
      <div className={`w-full h-full flex flex-col overflow-y-auto p-6 gap-6 ${isEcoMode ? 'bg-[#06070c]' : 'bg-[#050508]'} custom-scrollbar`}>
        {/* NettleWeb Hero Launcher Card */}
        <div className="relative rounded-2xl border border-sky-500/30 bg-gradient-to-r from-sky-950/40 via-[#070b18] to-black p-6 shadow-xl overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <Globe size={16} />
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono font-bold">
                NETTLEWEB INTEGRATION
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">NettleWeb Gaming & Apps Portal</h2>
            <p className="text-xs text-white/60 mt-1.5 leading-relaxed">
              Play web games, access proxy tools, and launch unblocked HTML5 applications. NettleWeb is sandboxed inside Godly OS with full window control and low-latency execution.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                sound.playClick();
                handleLaunchUniversalGame({
                  id: 'nettleweb_portal',
                  title: 'NettleWeb Portal',
                  url: encodeUvUrl('https://nettleweb.com/'),
                  source: 'nettleweb',
                  category: 'Web Portal'
                });
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 transition-all hover:scale-105"
            >
              <Play size={14} className="fill-white" />
              Launch Sandboxed Portal
            </button>
            <button
              onClick={() => {
                sound.playClick();
                window.open('https://nettleweb.com/', '_blank');
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.04] text-white/80 hover:text-white font-semibold text-xs transition-all"
            >
              <ExternalLink size={14} />
              Open Direct
            </button>
          </div>
        </div>

        {/* Curated NettleWeb Games */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Popular NettleWeb Playables</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono">
                  {NETTLEWEB_POPULAR_GAMES.length} Highlights
                </span>
              </h3>
              <p className="text-[11px] text-white/40">Verified high-speed HTML5 games playable instantly</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {NETTLEWEB_POPULAR_GAMES.map(renderWebGameCard)}
          </div>
        </div>
      </div>
    );
  };

  // Source Theme Colors Mapping
  const SOURCE_COLOR_MAP: Record<string, string> = {
    Nebula: '#818cf8',
    UGS: '#38bdf8',
    js13kGames: '#facc15',
    CVK: '#fb923c',
    Hydra: '#4ade80',
    Lumin: '#a78bfa',
    Diesmos: '#ec4899',
    'GN-Math': '#06b6d4',
    modifiedgnmath: '#06b6d4',
    GhostProxy: '#94a3b8',
    Alexr: '#f43f5e',
    GameZone: '#2dd4bf',
    Petezah: '#f59e0b',
    Daknux: '#10b981',
    Seraph: '#8b5cf6',
    Truffled: '#d946ef',
    DuckMath: '#eab308',
    Selenite: '#6366f1',
    Bloxy: '#ef4444',
    'Mini JS Games Hub': '#14b8a6',
    Noah: '#3b82f6',
    '3kh0 Assets': '#f97316',
    'Offline HTML Games Pack': '#84cc16',
    Elite: '#06b6d4',
    SFoolsOS: '#a855f7',
    'Space-proxy': '#ec4899',
    'Tiny Arcade': '#f59e0b',
    STORM0S: '#3b82f6',
    'Unblocked Zone': '#10b981',
    'Frogie Arcade': '#22c55e',
    'Crisp Games': '#e11d48',
    '3kh0': '#0ea5e9',
    CCPorted: '#6366f1',
    'Google Class': '#eab308',
    'Games Hub': '#d946ef',
    'Mini Browser Games': '#14b8a6',
    Blox: '#f97316',
    '100 HTML Games': '#f43f5e',
    'YouTube Playables': '#ef4444',
    'Void Network': '#8b5cf6',
    'JavaScript Games for Beginners': '#facc15',
    'LittleJS Arcade': '#ec4899',
    'Browser Game Arcade': '#38bdf8',
    'Web Games': '#4ade80',
    'StrataMind Game Zone': '#a78bfa',
    'One Page Games': '#fb923c',
    'ZLostTK Games': '#06b6d4',
    'WYF Games': '#10b981',
    'Fable Arcade': '#f59e0b',
    'One File Games': '#818cf8',
    'Yahayuta Mini Games': '#d946ef',
    MicroGames: '#2dd4bf',
    'Nanhopper Mini Games': '#64748b',
    'HTML Minigames': '#94a3b8',
    LittleJS: '#e11d48',
    'Chandrakant Games': '#38bdf8',
    'PICO-8 Gallery': '#ec4899',
    'Web Arcade': '#f59e0b',
    'Clumsy Bird': '#10b981',
    Tundra: '#38bdf8',
    Extra: '#8b5cf6',
  };

  const getSourceColor = (src?: string): string => {
    if (!src) return '#818cf8';
    if (SOURCE_COLOR_MAP[src]) return SOURCE_COLOR_MAP[src];
    let hash = 0;
    for (let i = 0; i < src.length; i++) {
      hash = src.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash % 360);
    return `hsl(${h}, 75%, 60%)`;
  };

  // Reusable Catalog Game Card (Supports Lazy Loading & Weak Device Optimization)
  const renderCatalogGameCard = (game: CatalogGame) => {
    const color = getSourceColor(game.source);
    return (
      <div
        key={`${game.source}_${game.id}_${game.name}`}
        onClick={() => {
          sound.playClick();
          handleLaunchUniversalGame({
            id: `${game.source}_${game.id}`,
            title: game.name,
            url: game.url,
            thumbnail: game.image,
            source: game.source,
            category: game.kind || game.source,
            fetchGame: game.fetchGame ?? true,
            frameFallback: game.frameFallback,
            crispScript: game.crispScript,
            sourceColor: color,
          });
        }}
        className="group relative flex flex-col rounded-2xl border border-white/[0.08] hover:border-purple-500/50 bg-white/[0.03] hover:bg-white/[0.07] overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-sm hover:shadow-xl hover:shadow-purple-950/30"
        style={{
          contentVisibility: isEcoMode ? 'auto' : undefined,
          containIntrinsicSize: isEcoMode ? '220px' : undefined,
        }}
      >
        <div className="relative aspect-[16/10] w-full bg-[#0a0c16] overflow-hidden flex items-center justify-center">
          {game.image ? (
            <img
              src={game.image}
              alt={game.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div 
              className="w-full h-full flex flex-col items-center justify-center p-3 text-center transition-all group-hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${color}20 0%, #0a0b14 100%)`,
                borderBottom: `1px solid ${color}30`
              }}
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-1 text-white shadow-md border"
                style={{
                  background: `${color}30`,
                  borderColor: `${color}60`,
                  color: color
                }}
              >
                <Gamepad2 size={20} />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 truncate max-w-full">
                {game.source}
              </span>
            </div>
          )}

          {/* Source Badge Pill */}
          <div className="absolute top-2 left-2 z-10 pointer-events-none">
            <span 
              className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border backdrop-blur-md shadow-sm"
              style={{
                background: `${color}30`,
                color: color,
                borderColor: `${color}60`
              }}
            >
              {game.source}
            </span>
          </div>

          {/* Hover play icon overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
            <div className="w-10 h-10 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
              <Play size={18} className="fill-white ml-0.5" />
            </div>
          </div>
        </div>

        {/* Card Info */}
        <div className="p-3 flex flex-col flex-1 justify-between bg-white/[0.01]">
          <div>
            <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1 leading-snug" title={game.name}>
              {game.name}
            </h4>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="text-[10px] text-white/40 truncate">
                {game.kind || 'Arcade Game'}
              </span>
              {game.fetchGame && (
                <span className="text-[9px] text-emerald-400 font-mono font-medium">
                  • Blob
                </span>
              )}
              {(game as any).mirrors && (game as any).mirrors.length > 1 && (
                <span 
                  className="text-[9px] text-purple-300 font-mono font-bold bg-purple-500/15 border border-purple-500/30 px-1.5 py-0.2 rounded-md" 
                  title={`Available across ${(game as any).mirrors.length} sources: ${(game as any).mirrors.join(', ')}`}
                >
                  +{(game as any).mirrors.length - 1} mirrors
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Reusable Pagination Component
  const renderCatalogPagination = (
    currentPage: number,
    totalPages: number,
    setPage: React.Dispatch<React.SetStateAction<number>>,
    totalItems: number,
    pageSize: number = 48
  ) => {
    if (totalPages <= 1) return null;
    const startIdx = (currentPage - 1) * pageSize + 1;
    const endIdx = Math.min(currentPage * pageSize, totalItems);

    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 pb-8 border-t border-white/[0.06] text-xs">
        <div className="text-white/40 font-mono text-[11px]">
          Showing <span className="text-white font-bold">{startIdx.toLocaleString()}–{endIdx.toLocaleString()}</span> of <span className="text-white font-bold">{totalItems.toLocaleString()}</span> items
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          <button
            onClick={() => { sound.playClick(); setPage(p => Math.max(1, p - 1)); }}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none text-white/80 transition-all font-medium text-xs flex items-center gap-1"
          >
            <ChevronLeft size={13} /> Prev
          </button>
          {pages.map((p, idx) => {
            if (p === '...') {
              return <span key={`el_${idx}`} className="px-2 text-white/30 font-mono">…</span>;
            }
            const num = p as number;
            const isActive = num === currentPage;
            return (
              <button
                key={num}
                onClick={() => { sound.playClick(); setPage(num); }}
                className={`w-8 h-8 rounded-xl font-mono text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40 border border-purple-400'
                    : 'border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-white/70'
                }`}
              >
                {num}
              </button>
            );
          })}
          <button
            onClick={() => { sound.playClick(); setPage(p => Math.min(totalPages, p + 1)); }}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none text-white/80 transition-all font-medium text-xs flex items-center gap-1"
          >
            Next <ChevronRight size={13} />
          </button>
        </div>
      </div>
    );
  };

  // ── DEDICATED VIEW FOR EACH MAJOR SOURCE ──
  const renderMajorSourceView = (meta: MajorSourceMeta) => {
    const rawGames = gamesBySource[meta.sourceKey] || [];
    const searchLower = majorSourceSearch.trim().toLowerCase();
    
    let filtered = rawGames;
    if (searchLower) {
      filtered = filtered.filter(g => g.name.toLowerCase().includes(searchLower));
    }

    if (majorSourceSort === 'name_asc') {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    } else if (majorSourceSort === 'name_desc') {
      filtered = [...filtered].sort((a, b) => b.name.localeCompare(a.name));
    }

    const pageSize = 48;
    const totalPages = Math.ceil(filtered.length / pageSize) || 1;
    const pagedGames = filtered.slice((majorSourcePage - 1) * pageSize, majorSourcePage * pageSize);

    return (
      <div className={`w-full h-full flex flex-col overflow-y-auto ${isEcoMode ? 'bg-[#06070c]' : 'bg-[#050508]'} custom-scrollbar`}>
        {/* Banner */}
        <div 
          className={`p-6 border-b border-white/[0.08] shrink-0 ${isEcoMode ? 'bg-[#090b14]' : 'backdrop-blur-2xl'}`}
          style={{
            background: isEcoMode ? undefined : `linear-gradient(180deg, ${meta.color}15 0%, rgba(10,8,24,0.4) 60%, transparent 100%)`
          }}
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span 
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border flex items-center gap-1.5"
                  style={{
                    background: `${meta.color}20`,
                    color: meta.color,
                    borderColor: `${meta.color}40`
                  }}
                >
                  <Rocket size={11} /> {meta.name.toUpperCase()} REPOSITORY
                </span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  {rawGames.length.toLocaleString()} Playable Games
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>{meta.name}</span>
              </h1>
              <p className="text-xs text-white/50 mt-1 max-w-xl">
                {meta.desc}
              </p>
            </div>

            {/* Actions: GitHub Link & Live Search */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => {
                  sound.playClick();
                  window.open(meta.repoUrl, '_blank');
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.04] text-white/80 hover:text-white font-semibold text-xs transition-all"
                title={`Open repository ${meta.repo} on GitHub`}
              >
                <FolderGit2 size={13} />
                <span>GitHub Repo</span>
                <ExternalLink size={12} className="text-white/40" />
              </button>

              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={majorSourceSearch}
                  onChange={(e) => setMajorSourceSearch(e.target.value)}
                  placeholder={`Search ${rawGames.length.toLocaleString()} ${meta.name} games...`}
                  className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-white/[0.06] border border-white/10 text-white placeholder-white/30 outline-none focus:border-purple-500/50 transition-all"
                />
                {majorSourceSearch && (
                  <button
                    onClick={() => setMajorSourceSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white/70">
                <ArrowUpDown size={13} className="text-white/40" />
                <select
                  value={majorSourceSort}
                  onChange={(e) => setMajorSourceSort(e.target.value as SortOption)}
                  className="bg-transparent border-0 outline-none text-white text-xs cursor-pointer font-medium"
                >
                  <option value="name_asc" className="bg-[#0b0c1c] text-white">Title (A → Z)</option>
                  <option value="name_desc" className="bg-[#0b0c1c] text-white">Title (Z → A)</option>
                  <option value="default" className="bg-[#0b0c1c] text-white">Catalog Default</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="p-6 max-w-7xl mx-auto w-full flex-1 flex flex-col">
          {pagedGames.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center bg-white/[0.02] border border-white/[0.06] rounded-2xl my-auto">
              <Search size={32} className="text-white/20 mb-3" />
              <p className="text-sm font-semibold text-white">No games matched "{majorSourceSearch}" in {meta.name}</p>
              <button
                onClick={() => setMajorSourceSearch('')}
                className="mt-3 text-xs text-purple-400 hover:text-purple-300 font-medium"
              >
                Clear search filter
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 mb-6">
                {pagedGames.map(renderCatalogGameCard)}
              </div>
              {renderCatalogPagination(majorSourcePage, totalPages, setMajorSourcePage, filtered.length, pageSize)}
            </>
          )}
        </div>
      </div>
    );
  };

  // ── DEDICATED VIEW FOR "OTHER" COMBINED SOURCES (46 Repositories, 5,551 Games) ──
  const renderOtherSourcesView = () => {
    const pageSize = 48;
    const totalPages = Math.ceil(filteredAndSortedOtherGames.length / pageSize) || 1;
    const pagedGames = filteredAndSortedOtherGames.slice((otherPage - 1) * pageSize, otherPage * pageSize);

    return (
      <div className={`w-full h-full flex flex-col overflow-y-auto ${isEcoMode ? 'bg-[#06070c]' : 'bg-[#050508]'} custom-scrollbar`}>
        {/* Banner */}
        <div className={`p-6 border-b border-white/[0.08] shrink-0 ${isEcoMode ? 'bg-[#090b14]' : 'bg-gradient-to-b from-[#15132d]/60 via-[#0a0818]/40 to-transparent backdrop-blur-xl'}`}>
          <div className="max-w-7xl mx-auto flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-slate-500/20 text-slate-300 border border-slate-500/30 flex items-center gap-1.5">
                    <Layers size={11} /> OTHER SOURCES COLLECTION
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    {otherSourcesGames.length.toLocaleString()} Games • {otherSourceNames.length} Smaller Repositories
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Other Unblocked Game Repositories
                </h1>
                <p className="text-xs text-white/50 mt-1 max-w-xl">
                  Combined collection of 46 smaller game repositories including Selenite, Bloxy, Mini JS Games Hub, Noah, Offline HTML Pack, Space-proxy, STORM0S, Tiny Arcade, Frogie Arcade, and more.
                </p>
              </div>

              {/* Search & Sort Controls */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    value={otherSearch}
                    onChange={(e) => setOtherSearch(e.target.value)}
                    placeholder="Search across other sources..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-white/[0.06] border border-white/10 text-white placeholder-white/30 outline-none focus:border-purple-500/50 transition-all"
                  />
                  {otherSearch && (
                    <button
                      onClick={() => setOtherSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white/70">
                  <ArrowUpDown size={13} className="text-white/40" />
                  <select
                    value={otherSort}
                    onChange={(e) => setOtherSort(e.target.value as SortOption)}
                    className="bg-transparent border-0 outline-none text-white text-xs cursor-pointer font-medium"
                  >
                    <option value="name_asc" className="bg-[#0b0c1c] text-white">Title (A → Z)</option>
                    <option value="name_desc" className="bg-[#0b0c1c] text-white">Title (Z → A)</option>
                    <option value="source_asc" className="bg-[#0b0c1c] text-white">Source (A → Z)</option>
                    <option value="source_desc" className="bg-[#0b0c1c] text-white">Source (Z → A)</option>
                    <option value="default" className="bg-[#0b0c1c] text-white">Catalog Default</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sub-Filter Chips for Smaller Repositories */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
              <span className="text-[10px] font-mono uppercase text-white/30 tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <Filter size={11} /> Filter:
              </span>
              <button
                onClick={() => { sound.playClick(); setOtherSubFilter('all'); }}
                className={`px-3 py-1 rounded-xl font-medium text-[11px] shrink-0 transition-all border ${
                  otherSubFilter === 'all'
                    ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
                    : 'bg-white/[0.04] text-white/70 hover:text-white border-white/10'
                }`}
              >
                All Smaller Sources ({otherSourcesGames.length})
              </button>
              {otherSourceNames.map((name) => {
                const count = gamesBySource[name]?.length || 0;
                const isSelected = otherSubFilter === name;
                const col = getSourceColor(name);
                return (
                  <button
                    key={name}
                    onClick={() => { sound.playClick(); setOtherSubFilter(name); }}
                    className={`flex items-center gap-1 px-3 py-1 rounded-xl font-medium text-[11px] shrink-0 transition-all border ${
                      isSelected
                        ? 'text-white border-white/40 shadow-sm'
                        : 'text-white/70 hover:text-white border-white/10 bg-white/[0.03]'
                    }`}
                    style={{
                      background: isSelected ? `${col}40` : undefined,
                      borderColor: isSelected ? col : undefined,
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: col }} />
                    <span>{name}</span>
                    <span className="text-[9.5px] font-mono text-white/40">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="p-6 max-w-7xl mx-auto w-full flex-1 flex flex-col">
          {pagedGames.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center bg-white/[0.02] border border-white/[0.06] rounded-2xl my-auto">
              <Search size={32} className="text-white/20 mb-3" />
              <p className="text-sm font-semibold text-white">No games matched "{otherSearch}"</p>
              <button
                onClick={() => { setOtherSearch(''); setOtherSubFilter('all'); }}
                className="mt-3 text-xs text-purple-400 hover:text-purple-300 font-medium"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 mb-6">
                {pagedGames.map(renderCatalogGameCard)}
              </div>
              {renderCatalogPagination(otherPage, totalPages, setOtherPage, filteredAndSortedOtherGames.length, pageSize)}
            </>
          )}
        </div>
      </div>
    );
  };

  // ── "ALL" SECTION: VIEW ALL 26,123+ GAMES FROM ALL SOURCES COMBINED & SORTED ──
  const renderAllSourcesView = () => {
    const pageSize = 48;
    const totalPages = Math.ceil(filteredAndSortedAllGames.length / pageSize) || 1;
    const pagedGames = filteredAndSortedAllGames.slice((allPage - 1) * pageSize, allPage * pageSize);

    return (
      <div className={`w-full h-full flex flex-col overflow-y-auto ${isEcoMode ? 'bg-[#06070c]' : 'bg-[#050508]'} custom-scrollbar`}>
        {/* Hero Banner & Search Area */}
        <div className={`p-6 border-b border-white/[0.06] ${isEcoMode ? 'bg-[#090b14]' : 'bg-gradient-to-b from-[#120d28]/60 via-[#0a0818]/40 to-transparent backdrop-blur-xl'} shrink-0`}>
          <div className="max-w-7xl mx-auto flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                    <Sparkles size={11} /> UNIFIED MASTER ARCHIVE
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    {catalogGames.length > 0 ? catalogGames.length.toLocaleString() : '26,123'}+ Games Combined
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  All Game Sources Combined &amp; Sorted
                </h1>
                <p className="text-xs text-white/50 mt-1 max-w-xl">
                  Unified library from all 62 game repositories. Filter by source, search across all titles, or sort alphabetically by name or repository.
                </p>
              </div>

              {/* Controls: Search, Source Select, Sort Select */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Search Input */}
                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    value={allSearch}
                    onChange={(e) => setAllSearch(e.target.value)}
                    placeholder="Search 26,000+ games..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-white/[0.06] border border-white/10 text-white placeholder-white/30 outline-none focus:border-purple-500/50 transition-all"
                  />
                  {allSearch && (
                    <button
                      onClick={() => setAllSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Deduplication Mode Toggle Button */}
                <button
                  onClick={() => {
                    sound.playClick();
                    setIsDeduplicated(!isDeduplicated);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-sm ${
                    isDeduplicated
                      ? 'bg-purple-600/25 border-purple-400/60 text-purple-200 hover:bg-purple-600/35'
                      : 'bg-white/[0.04] border-white/10 text-white/60 hover:text-white hover:bg-white/[0.08]'
                  }`}
                  title={
                    isDeduplicated
                      ? 'Duplicates removed across all 62 repositories (10,854 unique titles). Click to view all 26,123 copies.'
                      : 'Showing all mirror copies (26,123 games). Click to deduplicate.'
                  }
                >
                  <Sparkles size={13} className={isDeduplicated ? 'text-purple-300' : 'text-white/40'} />
                  <span>{isDeduplicated ? '10.8K Unique' : 'All 26.1K Mirrors'}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-md font-mono font-bold ${
                      isDeduplicated
                        ? 'bg-purple-500/30 text-purple-200 border border-purple-400/40'
                        : 'bg-white/10 text-white/50'
                    }`}
                  >
                    {isDeduplicated ? 'NO DUPES' : 'ALL'}
                  </span>
                </button>

                {/* Modern Custom Source Filter Selector Popover */}
                <div className="relative" ref={allSourcePickerRef}>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsAllSourcePickerOpen(!isAllSourcePickerOpen);
                    }}
                    className="flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-purple-500/40 rounded-xl px-3 py-1.5 text-xs text-white font-medium transition-all shadow-sm"
                  >
                    <Filter size={13} className="text-purple-400 shrink-0" />
                    <span className="truncate max-w-[130px]">
                      {allSourceFilter === 'all'
                        ? `All Sources (${isDeduplicated ? '10.8K' : '26.1K'})`
                        : `${allSourceFilter} (${(gamesBySource[allSourceFilter]?.length || 0).toLocaleString()})`}
                    </span>
                    <ChevronDown
                      size={13}
                      className={`text-white/40 transition-transform duration-200 shrink-0 ${
                        isAllSourcePickerOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isAllSourcePickerOpen && (
                    <div
                      className={`absolute left-0 sm:right-0 sm:left-auto mt-2 w-72 sm:w-80 max-h-96 flex flex-col rounded-2xl border border-white/10 shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                        isEcoMode ? 'bg-[#0d0e1a]' : 'bg-[#0b0c1ce8] backdrop-blur-2xl'
                      }`}
                    >
                      {/* Search inside picker */}
                      <div className="relative mb-2">
                        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
                        <input
                          type="text"
                          value={allSourcePickerSearch}
                          onChange={(e) => setAllSourcePickerSearch(e.target.value)}
                          placeholder="Filter sources (62 total)..."
                          className="w-full pl-8 pr-7 py-1.5 rounded-xl text-xs bg-white/[0.06] border border-white/10 text-white placeholder-white/30 outline-none focus:border-purple-500/50"
                          autoFocus
                        />
                        {allSourcePickerSearch && (
                          <button
                            onClick={() => setAllSourcePickerSearch('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>

                      {/* Sources list */}
                      <div className="overflow-y-auto space-y-1 pr-1 custom-scrollbar max-h-64">
                        <button
                          onClick={() => {
                            sound.playClick();
                            setAllSourceFilter('all');
                            setIsAllSourcePickerOpen(false);
                            setAllSourcePickerSearch('');
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all text-left ${
                            allSourceFilter === 'all'
                              ? 'bg-purple-600/30 text-white border border-purple-500/40 font-semibold'
                              : 'text-white/80 hover:bg-white/[0.06] hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Sparkles size={14} className="text-purple-400" />
                            <span>All Sources Combined</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono text-white/40">
                              {isDeduplicated ? '10,854' : catalogGames.length.toLocaleString()}
                            </span>
                            {allSourceFilter === 'all' && <Check size={13} className="text-purple-400" />}
                          </div>
                        </button>

                        {allUniqueSources
                          .filter((src) =>
                            src.toLowerCase().includes(allSourcePickerSearch.toLowerCase().trim())
                          )
                          .map((src) => {
                            const count = gamesBySource[src]?.length || 0;
                            const isSelected = allSourceFilter === src;
                            return (
                              <button
                                key={src}
                                onClick={() => {
                                  sound.playClick();
                                  setAllSourceFilter(src);
                                  setIsAllSourcePickerOpen(false);
                                  setAllSourcePickerSearch('');
                                }}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all text-left ${
                                  isSelected
                                    ? 'bg-purple-600/30 text-white border border-purple-500/40 font-semibold'
                                    : 'text-white/80 hover:bg-white/[0.06] hover:text-white'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                                  <span className="truncate">{src}</span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-[10px] font-mono text-white/40">
                                    {count.toLocaleString()}
                                  </span>
                                  {isSelected && <Check size={13} className="text-purple-400" />}
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sort Order Dropdown */}
                <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white/70">
                  <ArrowUpDown size={13} className="text-white/40" />
                  <select
                    value={allSort}
                    onChange={(e) => setAllSort(e.target.value as SortOption)}
                    className="bg-transparent border-0 outline-none text-white text-xs cursor-pointer font-medium"
                  >
                    <option value="name_asc" className="bg-[#0b0c1c] text-white">Title (A → Z)</option>
                    <option value="name_desc" className="bg-[#0b0c1c] text-white">Title (Z → A)</option>
                    <option value="source_asc" className="bg-[#0b0c1c] text-white">Source (A → Z)</option>
                    <option value="source_desc" className="bg-[#0b0c1c] text-white">Source (Z → A)</option>
                    <option value="default" className="bg-[#0b0c1c] text-white">Catalog Default</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Filter Chips to Big Sources */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
              <span className="text-[10px] font-mono uppercase text-white/30 tracking-wider shrink-0 mr-1">Quick Select:</span>
              <button
                onClick={() => { sound.playClick(); setAllSourceFilter('all'); }}
                className={`px-3 py-1 rounded-xl font-medium text-[11px] shrink-0 transition-all border ${
                  allSourceFilter === 'all'
                    ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
                    : 'bg-white/[0.04] text-white/70 hover:text-white border-white/10'
                }`}
              >
                All Combined ({isDeduplicated ? '10.8K' : '26.1K'})
              </button>
              {MAJOR_SOURCES_CONFIG.slice(0, 8).map((s) => {
                const count = gamesBySource[s.sourceKey]?.length || s.count;
                const isSelected = allSourceFilter === s.sourceKey;
                return (
                  <button
                    key={s.id}
                    onClick={() => { sound.playClick(); setAllSourceFilter(s.sourceKey); }}
                    className={`flex items-center gap-1 px-3 py-1 rounded-xl font-medium text-[11px] shrink-0 transition-all border ${
                      isSelected
                        ? 'text-white border-white/40 shadow-sm'
                        : 'text-white/70 hover:text-white border-white/10 bg-white/[0.03]'
                    }`}
                    style={{
                      background: isSelected ? `${s.color}35` : undefined,
                      borderColor: isSelected ? s.color : undefined,
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                    <span>{s.name}</span>
                    <span className="text-[9.5px] font-mono text-white/40">({count.toLocaleString()})</span>
                  </button>
                );
              })}
              <button
                onClick={() => { sound.playClick(); setActiveTab('other'); }}
                className="flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 text-slate-300 border border-slate-500/30 shrink-0 transition-all font-medium text-[11px]"
              >
                <Layers size={11} /> View Other Sources ({otherSourcesGames.length.toLocaleString()})
              </button>
            </div>
          </div>
        </div>

        {/* Catalog Grid & Pagination */}
        <div className="p-6 max-w-7xl mx-auto w-full flex-1 flex flex-col">
          {pagedGames.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center bg-white/[0.02] border border-white/[0.06] rounded-2xl my-auto">
              <Search size={32} className="text-white/20 mb-3" />
              <p className="text-sm font-semibold text-white">No games matched your search</p>
              <p className="text-xs text-white/40 mt-1">Try another keyword or reset source filter.</p>
              <button
                onClick={() => { setAllSearch(''); setAllSourceFilter('all'); }}
                className="mt-3 text-xs text-purple-400 hover:text-purple-300 font-medium"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 mb-6">
                {pagedGames.map(renderCatalogGameCard)}
              </div>
              {renderCatalogPagination(allPage, totalPages, setAllPage, filteredAndSortedAllGames.length, pageSize)}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full w-full ${isEcoMode ? 'bg-[#06070c]' : 'bg-[#050508]'} text-[#f4f4f8] select-none overflow-hidden font-sans`}>
      {/* ── Top Header Toolbar with Frosted Glass & Dynamic Accent ── */}
      <div 
        className={`flex items-center justify-between px-4 py-2.5 border-b border-white/[0.08] ${isEcoMode ? 'bg-[#08080f]' : 'bg-[#08080eb8] backdrop-blur-2xl'} flex-shrink-0 z-20`}
        style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white border border-white/20 transition-all shrink-0"
            style={{
              background: 'linear-gradient(135deg, var(--accent), #4338ca)',
              boxShadow: isEcoMode ? 'none' : '0 4px 16px var(--accent-glow)',
            }}
          >
            <Gamepad2 size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold tracking-tight text-white">Godly Arcade</span>
              <span 
                className="flex items-center gap-1 text-[9.5px] px-2 py-0.5 rounded-full font-mono font-medium border"
                style={{
                  background: 'var(--accent-dim)',
                  color: 'var(--accent-text)',
                  borderColor: 'var(--accent-border)',
                }}
              >
                {!isEcoMode && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />}
                {activeTab === 'all' && `${(catalogGames.length || 26123).toLocaleString()}+ All Sources Combined`}
                {activeTab === 'other' && `${(otherSourcesGames.length || 5551).toLocaleString()} Other Playables (${otherSourceNames.length} Sources)`}
                {MAJOR_SOURCES_CONFIG.some(s => s.id === activeTab) && (
                  `${(gamesBySource[MAJOR_SOURCES_CONFIG.find(s => s.id === activeTab)!.sourceKey]?.length || MAJOR_SOURCES_CONFIG.find(s => s.id === activeTab)!.count).toLocaleString()} Games • ${MAJOR_SOURCES_CONFIG.find(s => s.id === activeTab)!.name}`
                )}
                {activeTab === 'sixkho' && `${sixKhoGames.length} 6kh0 Projects`}
                {activeTab === 'ynrbsu' && `${ynrbsuGames.length} Ynrbsu Arcade`}
                {activeTab === 'vault' && `${vaultGames.length > 0 ? vaultGames.length : '1,567'} Vault`}
                {activeTab === 'zengs' && '1,700+ Zen GS Cloud'}
                {activeTab === 'nettleweb' && 'NettleWeb Web Hub'}
                {activeTab === 'nowgg' && 'nowgg.fun 60FPS'}
                {activeTab === 'p2p' && '500+ P2P GameWebSight'}
                {activeTab === 'emulator' && 'WASM Emulator Hub'}
                {activeTab === 'eaglercraft' && '12 Eaglercraft Editions'}
              </span>
            </div>
            <p className="text-[10px] text-white/40 tracking-tight">
              Achroma OS Engine • Sandboxed Performance • {isEcoMode ? '⚡ Eco Mode Active' : 'Full Glassmorphism'}
            </p>
          </div>
        </div>

        {/* ── Controls: Laptop Eco Mode & Modern Source Selector Dropdown ── */}
        <div className="flex items-center gap-2">
          {/* Laptop / Low-Power Eco Mode Toggle */}
          <button
            onClick={toggleEcoMode}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isEcoMode
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                : 'bg-white/[0.04] border-white/10 text-white/50 hover:text-white hover:bg-white/[0.08]'
            }`}
            title="Toggle Eco Mode: optimizes performance on laptops & Chromebooks by disabling GPU blurs, enabling lazy rendering, and reducing background overhead"
          >
            <Zap size={13} className={isEcoMode ? 'text-amber-400 fill-amber-400' : ''} />
            <span className="hidden sm:inline">{isEcoMode ? 'Eco Mode ON' : 'Eco Mode'}</span>
          </button>

          {/* Source Dropdown Selector */}
          <div className="relative" ref={sourceDropdownRef}>
            <button
              onClick={() => {
                sound.playClick();
                setIsSourceDropdownOpen(!isSourceDropdownOpen);
              }}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-white/10 hover:border-purple-500/40 bg-white/[0.04] hover:bg-white/[0.08] transition-all text-xs font-semibold text-white shadow-sm"
            >
              <span 
                className="w-6 h-6 rounded-lg border text-white flex items-center justify-center shrink-0"
                style={{
                  background: `${currentSource.color}25`,
                  borderColor: `${currentSource.color}50`,
                  color: currentSource.color
                }}
              >
                {currentSource.icon}
              </span>
              <div className="flex flex-col text-left">
                <span className="text-[8.5px] text-white/40 uppercase tracking-wider font-mono">Source</span>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  {currentSource.name}
                  <span 
                    className="text-[9px] px-1.5 py-0.2 rounded-full font-mono font-medium border"
                    style={{
                      background: `${currentSource.color}15`,
                      color: currentSource.color,
                      borderColor: `${currentSource.color}35`,
                    }}
                  >
                    {currentSource.badge}
                  </span>
                </span>
              </div>
              <ChevronDown size={14} className={`text-white/40 ml-1 transition-transform duration-200 ${isSourceDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isSourceDropdownOpen && (() => {
              const q = dropdownSourceSearch.trim().toLowerCase();
              const filteredSources = sourceOptions.filter((opt) => {
                if (opt.id === 'all') return false;
                if (dropdownCategory !== 'all' && opt.group !== dropdownCategory) return false;
                if (!q) return true;
                return (
                  opt.name.toLowerCase().includes(q) ||
                  opt.desc.toLowerCase().includes(q) ||
                  opt.badge.toLowerCase().includes(q)
                );
              });

              const counts = {
                all: sourceOptions.filter((s) => s.id !== 'all').length,
                major: sourceOptions.filter((s) => s.group === 'major').length,
                core: sourceOptions.filter((s) => s.group === 'core').length,
                consoles: sourceOptions.filter((s) => s.group === 'consoles').length,
                other: sourceOptions.filter((s) => s.group === 'other').length,
              };

              const showAllCard =
                (dropdownCategory === 'all' || dropdownCategory === 'major') &&
                (!q || 'all sources combined deduplicated'.includes(q));

              return (
                <div
                  className={`absolute right-0 mt-2 w-80 sm:w-[500px] max-h-[82vh] flex flex-col rounded-2xl border border-white/10 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                    isEcoMode ? 'bg-[#0d0e1a]' : 'bg-[#0b0c1ce8] backdrop-blur-2xl'
                  }`}
                >
                  {/* Search Bar */}
                  <div className="relative mb-2.5">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="text"
                      value={dropdownSourceSearch}
                      onChange={(e) => setDropdownSourceSearch(e.target.value)}
                      placeholder="Search repositories (Nebula, UGS, Hydra, Selenite...)"
                      className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-white/[0.06] border border-white/10 text-white placeholder-white/30 outline-none focus:border-purple-500/50 transition-all"
                      autoFocus
                    />
                    {dropdownSourceSearch && (
                      <button
                        onClick={() => setDropdownSourceSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  {/* Category Filter Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar border-b border-white/[0.08] mb-2.5 shrink-0">
                    {(
                      [
                        { id: 'all', label: `All (${counts.all})` },
                        { id: 'major', label: `Major (${counts.major})` },
                        { id: 'core', label: `Core (${counts.core})` },
                        { id: 'consoles', label: `Consoles (${counts.consoles})` },
                        { id: 'other', label: `Other (${counts.other})` },
                      ] as const
                    ).map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          sound.playClick();
                          setDropdownCategory(cat.id);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium shrink-0 transition-all border ${
                          dropdownCategory === cat.id
                            ? 'bg-purple-600/30 text-white border-purple-400/50 shadow-sm'
                            : 'bg-white/[0.03] text-white/60 hover:text-white border-white/10'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Scrollable Content Container */}
                  <div className="overflow-y-auto space-y-2 pr-1 custom-scrollbar max-h-[52vh]">
                    {/* All Sources Combined Featured Card */}
                    {showAllCard && (
                      <button
                        onClick={() => {
                          sound.playClick();
                          setActiveTab('all');
                          setIsSourceDropdownOpen(false);
                          setDropdownSourceSearch('');
                          setActiveVaultGame(null);
                          setActiveUniversalGame(null);
                          setActiveNowGGGame(null);
                          setActiveGnGame(null);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left mb-1.5 ${
                          activeTab === 'all'
                            ? 'bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border-purple-500/50 shadow-md shadow-purple-950/30'
                            : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/[0.06]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center shrink-0">
                            <Sparkles size={16} />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-white">All Sources Combined</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono font-bold">
                                {isDeduplicated ? '10.8K Unique' : '26.1K Mirrors'}
                              </span>
                              {isDeduplicated && (
                                <span className="text-[8.5px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-medium">
                                  No Dupes
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-white/50">Unified library across all 62 repos with duplicates cleaned</p>
                          </div>
                        </div>
                        {activeTab === 'all' && <Check size={14} className="text-purple-400 shrink-0 ml-2" />}
                      </button>
                    )}

                    {/* Sources Grid */}
                    {filteredSources.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {filteredSources.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => {
                              sound.playClick();
                              setActiveTab(opt.id);
                              setIsSourceDropdownOpen(false);
                              setDropdownSourceSearch('');
                              setActiveVaultGame(null);
                              setActiveUniversalGame(null);
                              setActiveNowGGGame(null);
                              setActiveGnGame(null);
                            }}
                            className={`flex items-center justify-between p-2 rounded-xl transition-all text-left border ${
                              activeTab === opt.id
                                ? 'bg-white/[0.10] text-white border-purple-500/50 shadow-sm'
                                : 'hover:bg-white/[0.06] text-white/80 hover:text-white border-white/[0.06] bg-white/[0.02]'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className="w-7 h-7 rounded-lg border flex items-center justify-center shrink-0"
                                style={{
                                  background: `${opt.color}20`,
                                  borderColor: `${opt.color}40`,
                                  color: opt.color,
                                }}
                              >
                                {opt.icon}
                              </div>
                              <div className="truncate">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-semibold text-white truncate">{opt.name}</span>
                                </div>
                                <span
                                  className="inline-block text-[8.5px] px-1.5 py-0.2 rounded-md font-mono font-medium border mt-0.5"
                                  style={{
                                    background: `${opt.color}15`,
                                    borderColor: `${opt.color}35`,
                                    color: opt.color,
                                  }}
                                >
                                  {opt.badge}
                                </span>
                              </div>
                            </div>
                            {activeTab === opt.id && (
                              <Check size={13} className="text-purple-400 shrink-0 ml-1.5" />
                            )}
                          </button>
                        ))}
                      </div>
                    ) : !showAllCard ? (
                      <div className="p-6 text-center text-white/40 text-xs">
                        No game sources matching "{dropdownSourceSearch}"
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* ── Main App Content ── */}
      <div className={`flex-1 w-full h-full relative overflow-hidden ${isEcoMode ? 'bg-[#06070c]' : 'bg-[#050508]'}`}>
        {/* Universal Sandboxed Game Player (Active Game from 6kh0, Ynrbsu, NettleWeb, or Catalog) */}
        {activeUniversalGame ? (
          renderUniversalPlayer()
        ) : (
          <>
            {activeTab === 'all' && renderAllSourcesView()}
            {activeTab === 'other' && renderOtherSourcesView()}
            {MAJOR_SOURCES_CONFIG.some(s => s.id === activeTab) && (
              renderMajorSourceView(MAJOR_SOURCES_CONFIG.find(s => s.id === activeTab)!)
            )}
            {activeTab === 'sixkho' && renderSixKhoView()}
            {activeTab === 'ynrbsu' && renderYnrbsuView()}
            {activeTab === 'nettleweb' && renderNettleWebView()}

            {/* =========================================================================
                TAB 1: LOCAL GAME VAULT (1,567 Games from /home/dono/Downloads/Game Files/)
               ========================================================================= */}
            {activeTab === 'vault' && (
          <div className="w-full h-full flex flex-col overflow-hidden">
            {activeVaultGame ? (
              /* Active Game Player View */
              <div className="w-full h-full flex flex-col bg-black">
                <div 
                  className="flex items-center justify-between px-4 py-2 border-b border-white/[0.08] bg-[#09090fc0] backdrop-blur-xl flex-shrink-0 z-10"
                  style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' }}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        sound.playClick();
                        setActiveVaultGame(null);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white/80 hover:text-white bg-white/[0.05] hover:bg-white/[0.10] border border-white/[0.08] transition-all"
                    >
                      <ChevronLeft size={14} />
                      Back to Vault
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
                        {activeVaultGame.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.06] text-white/60 border border-white/[0.06] font-mono">
                        {activeVaultGame.category}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono hidden sm:inline">
                        Folder: {activeVaultGame.folder}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        sound.playClick();
                        setShowSaveManager(!showSaveManager);
                      }}
                      className={`p-1.5 rounded-lg border transition-all ${
                        showSaveManager
                          ? 'bg-purple-600/30 border-purple-500/50 text-purple-300'
                          : 'text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.06]'
                      }`}
                      title="Quick Save State Manager (3 Slots)"
                    >
                      <Save size={14} />
                    </button>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setShowGamepadMapper(true);
                      }}
                      className="p-1.5 rounded-lg text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all"
                      title="Gamepad Controller Mapper"
                    >
                      <Gamepad2 size={14} />
                    </button>
                    <button
                      onClick={() => {
                        sound.playClick();
                        updateSettings({ fpsOverlayEnabled: !settings.fpsOverlayEnabled });
                      }}
                      className={`p-1.5 rounded-lg border transition-all ${
                        settings.fpsOverlayEnabled
                          ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-300'
                          : 'text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.06]'
                      }`}
                      title="FPS Counter & Performance Overlay (F3)"
                    >
                      <Gauge size={14} />
                    </button>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setVaultRefreshKey((k) => k + 1);
                      }}
                      className="p-1.5 rounded-lg text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all"
                      title="Reload Game"
                    >
                      <RotateCcw size={14} />
                    </button>
                    <button
                      onClick={() => handleFullscreenGame(gameFrameRef)}
                      className="p-1.5 rounded-lg text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all"
                      title="Fullscreen"
                    >
                      <Maximize2 size={14} />
                    </button>
                    <button
                      onClick={() => {
                        sound.playClick();
                        if (vaultHtmlContent) {
                          const blob = new Blob([vaultHtmlContent], { type: 'text/html; charset=utf-8' });
                          const blobUrl = URL.createObjectURL(blob);
                          window.open(blobUrl, '_blank');
                        } else {
                          window.open(getAssetUrl(activeVaultGame.url), '_blank');
                        }
                      }}
                      className="p-1.5 rounded-lg text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all"
                      title="Popout Window"
                    >
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 w-full h-full relative bg-black flex items-center justify-center overflow-hidden">
                  {vaultLoadingGame && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#07070d] z-20">
                      <div className="w-10 h-10 border-2 border-white/20 border-t-purple-400 rounded-full animate-spin mb-3" />
                      <span className="text-xs font-mono text-white/80 font-bold">Launching {activeVaultGame.title}...</span>
                      <span className="text-[11px] font-mono text-white/40 mt-1">Initializing Canvas &amp; WebGL Engine</span>
                    </div>
                  )}
                  {vaultHtmlContent ? (
                    <iframe
                      ref={gameFrameRef}
                      key={vaultRefreshKey}
                      srcDoc={vaultHtmlContent}
                      title={activeVaultGame.title}
                      className="w-full h-full border-0 bg-black"
                      sandbox="allow-scripts allow-forms allow-pointer-lock"
                      allow="autoplay; fullscreen; gamepad; clipboard-write; encrypted-media; accelerometer; gyroscope"
                    />
                  ) : !vaultLoadingGame ? (
                    <div className="flex flex-col items-center justify-center text-center p-6 bg-[#07070d]">
                      <Gamepad2 size={36} className="text-white/20 mb-3" />
                      <span className="text-sm font-semibold text-white/90">Could not initialize game canvas</span>
                      <span className="text-xs text-white/40 mt-1 max-w-sm">
                        The game asset could not be loaded from CDN mirrors.
                      </span>
                      <button
                        onClick={() => handleLaunchVaultGame(activeVaultGame)}
                        className="mt-4 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white flex items-center gap-1.5 transition-all"
                      >
                        <RotateCcw size={13} />
                        <span>Retry Loading</span>
                      </button>
                    </div>
                  ) : null}

                  {/* 3a. Quick-Save Slide-Up Bar */}
                  {showSaveManager && (
                    <div className="absolute bottom-0 inset-x-0 bg-[#0d0e1b]/95 backdrop-blur-2xl border-t border-purple-500/40 p-4 z-40 shadow-2xl select-none animate-in slide-in-from-bottom duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Bookmark size={15} className="text-purple-400" />
                          <span className="text-xs font-bold text-white tracking-wide">
                            Local Save State Manager — {activeVaultGame.title}
                          </span>
                        </div>
                        <button onClick={() => setShowSaveManager(false)} className="text-white/50 hover:text-white p-1">
                          <X size={14} />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {[1, 2, 3].map((slotNum) => {
                          const slot = saveSlots.find((s) => s.slotNumber === slotNum);
                          const hasData = slot && slot.timestamp > 0;
                          return (
                            <div key={slotNum} className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between gap-2 shadow-inner">
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-white">Save Slot {slotNum}</span>
                                  {hasData && (
                                    <span className="text-[10px] text-emerald-400 font-mono">
                                      {new Date(slot.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  )}
                                </div>
                                <input
                                  type="text"
                                  value={slotNotes[slotNum] !== undefined ? slotNotes[slotNum] : (slot?.userNote || '')}
                                  onChange={(e) => setSlotNotes((prev) => ({ ...prev, [slotNum]: e.target.value }))}
                                  placeholder="Slot label / note..."
                                  className="w-full mt-1.5 px-2.5 py-1 bg-black/40 border border-white/10 rounded-lg text-[10px] text-white focus:outline-none focus:border-purple-400"
                                />
                              </div>

                              <div className="flex items-center gap-1.5 pt-1 border-t border-white/5">
                                <button
                                  onClick={async () => {
                                    const note = slotNotes[slotNum] || `Save Slot ${slotNum}`;
                                    await GameSaveManager.saveSlot(activeVaultGame.id, activeVaultGame.title, slotNum as any, note);
                                    setSaveSlots(GameSaveManager.getSlots(activeVaultGame.id));
                                    sound.playSnap();
                                  }}
                                  className="flex-1 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-[10px] font-bold text-white flex items-center justify-center gap-1 shadow-md active:scale-95 transition-all"
                                >
                                  <Save size={10} />
                                  <span>Save</span>
                                </button>

                                <button
                                  onClick={async () => {
                                    const restored = await GameSaveManager.loadSlot(activeVaultGame.id, slotNum as any);
                                    if (restored) {
                                      setVaultRefreshKey((k) => k + 1);
                                      sound.playNotification();
                                    }
                                  }}
                                  disabled={!hasData}
                                  className="flex-1 py-1 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 text-[10px] font-bold text-white flex items-center justify-center gap-1 active:scale-95 transition-all"
                                >
                                  <Play size={10} />
                                  <span>Load</span>
                                </button>

                                {hasData && (
                                  <button
                                    onClick={() => GameSaveManager.exportSlotAsJson(activeVaultGame.id, slotNum as any)}
                                    className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
                                    title="Export JSON"
                                  >
                                    <Download size={11} />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Game Vault Catalog View */
              <div className="flex-1 w-full h-full flex flex-col overflow-hidden">
                <div className="p-4 pb-2 border-b border-white/[0.06] bg-[#08080f80] backdrop-blur-xl flex flex-col gap-3 flex-shrink-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                      <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                      <input
                        type="text"
                        value={vaultSearch}
                        onChange={(e) => {
                          setVaultSearch(e.target.value);
                          setPage(1);
                        }}
                        placeholder="Search 1,567 local games (e.g. 2048, Bloons, Papa, Sonic)..."
                        className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-white/20 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-white/30 outline-none transition-all"
                      />
                      {vaultSearch && (
                        <button
                          onClick={() => {
                            setVaultSearch('');
                            setPage(1);
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-0.5"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-md">
                        <Upload size={13} />
                        <span>Upload .HTML / .SWF</span>
                        <input
                          type="file"
                          accept=".html,.htm,.swf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            handleUploadCustomGame(file);
                          }}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] font-mono text-white/50 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.06]">
                        {filteredVaultGames.length.toLocaleString()} / {allVaultGames.length.toLocaleString()} Games
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                    {LETTERS.map((ltr) => {
                      const isSelected = selectedLetter === ltr;
                      return (
                        <button
                          key={ltr}
                          onClick={() => {
                            sound.playClick();
                            setSelectedLetter(ltr);
                            setPage(1);
                          }}
                          className="px-2 py-1 rounded-md text-[10.5px] font-mono font-medium transition-all flex-shrink-0"
                          style={
                            isSelected
                              ? {
                                  background: 'var(--accent)',
                                  color: '#ffffff',
                                  fontWeight: 700,
                                  boxShadow: '0 0 10px var(--accent-glow)',
                                }
                              : {
                                  background: 'rgba(255, 255, 255, 0.03)',
                                  color: 'rgba(255, 255, 255, 0.50)',
                                  border: '1px solid rgba(255, 255, 255, 0.04)',
                                }
                          }
                        >
                          {ltr}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {CATEGORIES.map((cat) => {
                      const isSelected = selectedCategory === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => {
                            sound.playClick();
                            setSelectedCategory(cat);
                            setPage(1);
                          }}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap flex-shrink-0"
                          style={
                            isSelected
                              ? {
                                  background: 'var(--accent-dim)',
                                  color: 'var(--accent-text)',
                                  border: '1px solid var(--accent-border)',
                                  fontWeight: 600,
                                }
                              : {
                                  background: 'rgba(255, 255, 255, 0.03)',
                                  color: 'rgba(255, 255, 255, 0.50)',
                                  border: '1px solid rgba(255, 255, 255, 0.05)',
                                }
                          }
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {vaultLoading ? (
                    <div className="w-full h-full flex flex-col items-center justify-center py-20 text-white/50">
                      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-3" />
                      <p className="text-xs font-mono">Indexing 1,567 Game Vault files...</p>
                    </div>
                  ) : filteredVaultGames.length === 0 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center py-20 text-center text-white/50">
                      <Gamepad2 size={36} className="text-white/20 mb-3" />
                      <p className="text-sm font-semibold text-white/80">No games found</p>
                      <button
                        onClick={() => {
                          setVaultSearch('');
                          setSelectedLetter('ALL');
                          setSelectedCategory('All');
                        }}
                        className="mt-4 px-3.5 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-xs font-medium text-white transition-all"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {paginatedVaultGames.map((game) => (
                        <div
                          key={game.id}
                          onClick={() => handleLaunchVaultGame(game)}
                          className="group relative flex flex-col justify-between p-3.5 rounded-2xl cursor-pointer transition-all duration-200 border"
                          style={{
                            background: 'rgba(255, 255, 255, 0.025)',
                            borderColor: 'rgba(255, 255, 255, 0.07)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.borderColor = 'var(--accent-border)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.025)';
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded text-white/50 bg-white/[0.04] border border-white/[0.05]">
                              Folder {game.folder}
                            </span>
                            <span className="text-[9px] font-mono text-white/40 truncate max-w-[90px]">
                              {game.category.split(' ')[0]}
                            </span>
                          </div>

                          <div 
                            className="w-full aspect-video rounded-xl flex items-center justify-center mb-3 relative overflow-hidden transition-all group-hover:scale-[1.02]"
                            style={{
                              background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
                              border: '1px solid rgba(255,255,255,0.05)',
                            }}
                          >
                            <span className="text-xl font-bold font-mono text-white/20 group-hover:text-white/60 transition-colors">
                              {game.title.slice(0, 2).toUpperCase()}
                            </span>

                            <div 
                              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(3px)' }}
                            >
                              <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110"
                                style={{ background: 'var(--accent)', boxShadow: '0 0 16px var(--accent-glow)' }}
                              >
                                <Play size={13} fill="currentColor" className="ml-0.5" />
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-[12px] font-medium text-white/90 group-hover:text-white line-clamp-2 leading-tight">
                              {game.title}
                            </h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="px-4 py-2.5 border-t border-white/[0.06] bg-[#08080eb8] backdrop-blur-xl flex items-center justify-between flex-shrink-0">
                    <span className="text-[11px] font-mono text-white/40">
                      Showing {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, filteredVaultGames.length)} of {filteredVaultGames.length}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => { sound.playClick(); setPage(1); }}
                        disabled={page === 1}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-mono text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none transition-all"
                      >
                        First
                      </button>
                      <button
                        onClick={() => { sound.playClick(); setPage((p) => Math.max(1, p - 1)); }}
                        disabled={page === 1}
                        className="p-1 rounded-lg text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none transition-all"
                      >
                        <ChevronLeft size={15} />
                      </button>
                      <span className="text-[11px] font-mono px-3 py-1 text-white/80">
                        Page {page} of {totalPages}
                      </span>
                      <button
                        onClick={() => { sound.playClick(); setPage((p) => Math.min(totalPages, p + 1)); }}
                        disabled={page === totalPages}
                        className="p-1 rounded-lg text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none transition-all"
                      >
                        <ChevronRight size={15} />
                      </button>
                      <button
                        onClick={() => { sound.playClick(); setPage(totalPages); }}
                        disabled={page === totalPages}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-mono text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none transition-all"
                      >
                        Last
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 2: GN-MATH SECONDARY GAME SOURCE (840 Integrated Cards)
           ========================================================================= */}
        {activeTab === 'gnmath' && (
          <div className="w-full h-full flex flex-col overflow-hidden">
            {activeGnGame ? (
              /* Active GN-Math Game Player */
              <div className="w-full h-full flex flex-col bg-black">
                <div 
                  className="flex items-center justify-between px-4 py-2 border-b border-white/[0.08] bg-[#09090fc0] backdrop-blur-xl flex-shrink-0 z-10"
                  style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' }}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        sound.playClick();
                        setActiveGnGame(null);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white/80 hover:text-white bg-white/[0.05] hover:bg-white/[0.10] border border-white/[0.08] transition-all"
                    >
                      <ChevronLeft size={14} />
                      Back to GN-Math Library
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
                        {activeGnGame.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.06] text-white/60 border border-white/[0.06] font-mono">
                        {activeGnGame.author}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono hidden sm:inline">
                        ● 60FPS Hardware Accel
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        sound.playClick();
                        if (activeGnGame) {
                          handleLaunchGnGame(activeGnGame);
                        }
                      }}
                      className="p-1.5 rounded-lg text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all"
                      title="Reload Game"
                    >
                      <RotateCcw size={14} />
                    </button>
                    <button
                      onClick={() => handleFullscreenGame(gnFrameRef)}
                      className="p-1.5 rounded-lg text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all"
                      title="Fullscreen"
                    >
                      <Maximize2 size={14} />
                    </button>
                    <button
                      onClick={() => {
                        sound.playClick();
                        if (gnHtmlContent) {
                          const blob = new Blob([gnHtmlContent], { type: 'text/html; charset=utf-8' });
                          const blobUrl = URL.createObjectURL(blob);
                          window.open(blobUrl, '_blank');
                        } else {
                          window.open(encodeUvUrl(activeGnGame.url), '_blank');
                        }
                      }}
                      className="p-1.5 rounded-lg text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all"
                      title="Popout Window"
                    >
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 w-full h-full relative bg-black flex items-center justify-center">
                  {gnLoadingGame && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#07070d] z-20">
                      <div className="w-10 h-10 border-2 border-white/20 border-t-purple-400 rounded-full animate-spin mb-3" />
                      <span className="text-xs font-mono text-white/80 font-bold">Launching {activeGnGame.title}...</span>
                      <span className="text-[11px] font-mono text-white/40 mt-1">Initializing Canvas &amp; WebGL Engine</span>
                    </div>
                  )}
                  <iframe
                    ref={gnFrameRef}
                    key={gnRefreshKey}
                    srcDoc={gnHtmlContent || undefined}
                    src={!gnHtmlContent && !gnLoadingGame ? encodeUvUrl(activeGnGame.url) : undefined}
                    title={activeGnGame.title}
                    className="w-full h-full border-0 bg-black"
                    sandbox="allow-scripts allow-forms allow-pointer-lock"
                    allow="autoplay; fullscreen; gamepad; clipboard-write; encrypted-media; accelerometer; gyroscope"
                  />
                </div>
              </div>
            ) : (
              /* GN-Math Catalog View with Integrated Cards */
              <div className="flex-1 w-full h-full flex flex-col overflow-hidden">
                <div className="p-4 pb-3 border-b border-white/[0.06] bg-[#08080f80] backdrop-blur-xl flex items-center justify-between gap-3 flex-shrink-0">
                  <div className="relative flex-1 max-w-md">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="text"
                      value={gnSearch}
                      onChange={(e) => {
                        setGnSearch(e.target.value);
                        setGnPage(1);
                      }}
                      placeholder="Search 840 GN-Math games (e.g. OvO, Bowmasters, Drive Mad)..."
                      className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-white/20 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-white/30 outline-none transition-all"
                    />
                    {gnSearch && (
                      <button
                        onClick={() => {
                          setGnSearch('');
                          setGnPage(1);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-0.5"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-white/50 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.06]">
                      {filteredGnMathGames.length.toLocaleString()} / {gnMathGames.length.toLocaleString()} GN-Math Games
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {gnLoading ? (
                    <div className="w-full h-full flex flex-col items-center justify-center py-20 text-white/50">
                      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-3" />
                      <p className="text-xs font-mono">Loading GN-Math Game Library...</p>
                    </div>
                  ) : filteredGnMathGames.length === 0 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center py-20 text-center text-white/50">
                      <Sparkles size={36} className="text-white/20 mb-3" />
                      <p className="text-sm font-semibold text-white/80">No GN-Math games found</p>
                      <button
                        onClick={() => setGnSearch('')}
                        className="mt-4 px-3.5 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-xs font-medium text-white transition-all"
                      >
                        Clear Search
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {paginatedGnGames.map((game) => (
                        <div
                          key={game.id}
                          onClick={() => handleLaunchGnGame(game)}
                          className="group relative flex flex-col justify-between p-2.5 rounded-2xl cursor-pointer transition-all duration-200 border"
                          style={{
                            background: 'rgba(255, 255, 255, 0.025)',
                            borderColor: 'rgba(255, 255, 255, 0.07)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.borderColor = 'var(--accent-border)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.025)';
                          }}
                        >
                          {/* Game Cover Art Image */}
                          <div 
                            className="w-full aspect-square rounded-xl flex items-center justify-center mb-2 relative overflow-hidden transition-all group-hover:scale-[1.02] bg-white/[0.02]"
                          >
                            <img
                              src={game.cover}
                              alt={game.title}
                              loading="lazy"
                              onError={(e) => {
                                // Fallback if cover fails
                                e.currentTarget.style.display = 'none';
                              }}
                              className="w-full h-full object-cover"
                            />

                            <div 
                              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(3px)' }}
                            >
                              <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110"
                                style={{ background: 'var(--accent)', boxShadow: '0 0 16px var(--accent-glow)' }}
                              >
                                <Play size={13} fill="currentColor" className="ml-0.5" />
                              </div>
                            </div>
                          </div>

                          {/* Game Info */}
                          <div>
                            <h4 className="text-[12px] font-medium text-white/90 group-hover:text-white line-clamp-1 leading-tight">
                              {game.title}
                            </h4>
                            <p className="text-[10px] text-white/40 truncate mt-0.5 font-mono">
                              {game.author}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {totalGnPages > 1 && (
                  <div className="px-4 py-2.5 border-t border-white/[0.06] bg-[#08080eb8] backdrop-blur-xl flex items-center justify-between flex-shrink-0">
                    <span className="text-[11px] font-mono text-white/40">
                      Showing {(gnPage - 1) * PAGE_SIZE + 1} - {Math.min(gnPage * PAGE_SIZE, filteredGnMathGames.length)} of {filteredGnMathGames.length}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => { sound.playClick(); setGnPage(1); }}
                        disabled={gnPage === 1}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-mono text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none transition-all"
                      >
                        First
                      </button>
                      <button
                        onClick={() => { sound.playClick(); setGnPage((p) => Math.max(1, p - 1)); }}
                        disabled={gnPage === 1}
                        className="p-1 rounded-lg text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none transition-all"
                      >
                        <ChevronLeft size={15} />
                      </button>
                      <span className="text-[11px] font-mono px-3 py-1 text-white/80">
                        Page {gnPage} of {totalGnPages}
                      </span>
                      <button
                        onClick={() => { sound.playClick(); setGnPage((p) => Math.min(totalGnPages, p + 1)); }}
                        disabled={gnPage === totalGnPages}
                        className="p-1 rounded-lg text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none transition-all"
                      >
                        <ChevronRight size={15} />
                      </button>
                      <button
                        onClick={() => { sound.playClick(); setGnPage(totalGnPages); }}
                        disabled={gnPage === totalGnPages}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-mono text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none transition-all"
                      >
                        Last
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB: ZEN GS (1,700+ Cloud Games Wall & Player)
           ========================================================================= */}
        <div
          className="w-full h-full flex flex-col"
          style={{ display: activeTab === 'zengs' ? 'flex' : 'none' }}
        >
          {/* Header when playing a Zen GS game */}
          {activeZenGame && (
            <div className="h-12 border-b border-white/[0.08] bg-[#0c0c14]/90 backdrop-blur-xl px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToZenLibrary}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium text-white/80 hover:text-white transition-all border border-white/[0.08]"
                >
                  <ChevronLeft size={14} />
                  Back to Zen GS Library
                </button>
                <div className="h-4 w-px bg-white/10" />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white tracking-tight">
                    {activeZenGame.title || 'Zen GS Game'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-medium">
                    Zen GS Cloud CDN
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleReloadZenGame}
                  title="Reload Game"
                  className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white transition-all border border-white/[0.06]"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  onClick={handleFullscreenZen}
                  title="Fullscreen"
                  className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white transition-all border border-white/[0.06]"
                >
                  <Maximize2 size={14} />
                </button>
                <button
                  onClick={handlePopoutZen}
                  title="Open in New Tab"
                  className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white transition-all border border-white/[0.06]"
                >
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Subheader when browsing the library wall */}
          {!activeZenGame && (
            <div className="px-5 py-3 border-b border-white/[0.06] bg-[#08080f]/70 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 flex-1 max-w-md">
                <div className="relative w-full">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={zenSearch}
                    onChange={(e) => handleZenSearchChange(e.target.value)}
                    placeholder="Search 1,700+ Zen GS games..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.08] border border-white/[0.08] focus:border-violet-500/50 text-xs text-white placeholder-white/30 outline-none transition-all"
                  />
                  {zenSearch && (
                    <button
                      onClick={() => handleZenSearchChange('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>1,704 Games in CDN Rotation</span>
                </div>
                <div className="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/50 font-mono">
                  CloudFront CDN • Auto-Decoded
                </div>
              </div>
            </div>
          )}

          {/* Container for #zg wall */}
          <div
            className="flex-1 w-full h-full overflow-y-auto"
            style={{ display: activeZenGame ? 'none' : 'block' }}
          >
            <div id="zg"></div>
          </div>

          {/* Container for #zg-viewer player */}
          <div
            id="zg-viewer"
            className="flex-1 w-full h-full relative bg-black"
            style={{ display: activeZenGame ? 'flex' : 'none' }}
          ></div>
        </div>

        {/* =========================================================================
            TAB 3: CLOUD ARCADE (nowgg.fun Cloud Streaming)
           ========================================================================= */}
        {activeTab === 'nowgg' && (
          <div className="w-full h-full flex flex-col">
            {activeNowGGGame ? (
              <ServiceWorkerAppView
                key={activeNowGGGame.id}
                url={activeNowGGGame.url}
                appName={activeNowGGGame.title}
                isGame={true}
                gameId={activeNowGGGame.id}
                onClose={() => setActiveNowGGGame(null)}
              />
            ) : (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div 
                  className="relative rounded-3xl overflow-hidden p-7 flex items-center justify-between border"
                  style={{
                    background: 'linear-gradient(135deg, rgba(15, 15, 25, 0.95), rgba(8, 8, 14, 0.98))',
                    borderColor: 'var(--accent-border)',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.8), 0 0 32px var(--accent-dim)',
                  }}
                >
                  <div className="relative z-10 max-w-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/40 font-mono flex items-center gap-1.5 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        nowgg.fun Cloud Stream
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-500/20 px-2.5 py-1 rounded-full border border-purple-500/30 font-mono">
                        60 FPS Ultra
                      </span>
                    </div>

                    <h3 className="text-3xl font-black text-white tracking-tight drop-shadow-md">
                      Roblox Cloud Edition
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-md">
                      Instant 60fps cloud streaming of Roblox directly on nowgg.fun inside Godly OS. No downloads or installations required, sandboxed securely via Service Worker.
                    </p>

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={() => {
                          sound.playOpen();
                          setActiveNowGGGame(NOWGG_GAMES[0]);
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 text-white rounded-2xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-95 border border-white/20"
                        style={{
                          background: 'var(--accent)',
                          boxShadow: '0 8px 24px var(--accent-glow)',
                        }}
                      >
                        <Play size={14} fill="currentColor" />
                        Play Now on nowgg.fun
                      </button>
                      <span className="text-[11px] text-slate-400 font-mono">
                        ⭐ 4.9 • 12M+ Players
                      </span>
                    </div>
                  </div>

                  <div className="relative z-10 hidden md:block w-52 h-36 rounded-2xl overflow-hidden border border-white/20 shadow-2xl group">
                    <img 
                      src={NOWGG_GAMES[0].banner} 
                      alt="Roblox" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-mono text-emerald-400">
                      nowgg.fun Live
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredNowGG.map((game) => (
                    <div
                      key={game.id}
                      className="rounded-2xl overflow-hidden border border-white/[0.08] flex flex-col justify-between transition-all duration-300 hover:border-white/20 hover:-translate-y-1 group"
                      style={{ background: 'rgba(255, 255, 255, 0.03)' }}
                    >
                      <div className="h-36 w-full overflow-hidden relative">
                        <img
                          src={game.banner}
                          alt={game.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[9px] font-mono text-emerald-400 font-bold">
                          nowgg.fun
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <h5 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                            {game.title}
                          </h5>
                          <p className="text-[11px] font-medium" style={{ color: 'var(--accent-text)' }}>{game.developer}</p>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {game.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
                          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                            <Users size={12} className="text-emerald-400" /> {game.players}
                          </span>
                          <button
                            onClick={() => {
                              sound.playOpen();
                              setActiveNowGGGame(game);
                            }}
                            className="px-3 py-1.5 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 border border-white/10"
                            style={{
                              background: 'var(--accent)',
                              boxShadow: '0 4px 14px var(--accent-glow)',
                            }}
                          >
                            <Play size={11} fill="currentColor" /> Stream
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 4: LUMIN GAMES SDK
           ========================================================================= */}
        <div className={`w-full h-full flex flex-col relative ${activeTab === 'lumin' ? 'flex' : 'hidden'}`}>
          {/* Scrollable Lumin games container */}
          <div className="flex-1 w-full overflow-y-auto overflow-x-hidden custom-scrollbar min-h-0 relative p-4">
            <div
              id="games-container"
              ref={luminContainerRef}
              className="w-full text-white min-h-[420px]"
              style={{ minHeight: '100%', height: 'auto', overflowY: 'visible' }}
            >
              {luminStatus === 'loading' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/70 backdrop-blur-md z-10">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 animate-bounce shadow-xl border border-white/20"
                    style={{ background: 'var(--accent)', boxShadow: '0 8px 32px var(--accent-glow)' }}
                  >
                    <Gamepad2 size={28} className="text-white" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">Initializing Lumin Games SDK...</h4>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Connecting to jsDelivr Lumin engine with dark theme container...
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="px-5 py-2.5 bg-black/60 backdrop-blur-xl border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 flex-shrink-0 z-10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Lumin Engine Active (#games-container)</span>
            </div>
            <div className="flex items-center gap-3 font-mono">
              <span>Theme: Dark</span>
              <span>Container: #games-container</span>
              <button
                onClick={() => {
                  sound.playClick();
                  initLuminSDK(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-1.5"
              >
                <RotateCcw size={12} /> Reload SDK
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            TAB 6: P2P WEBSIGHT / GAMEWEBSIGHT ENGINE (Bitbucket Raw Mirror)
            ========================================================================= */}
        <div className={`w-full h-full flex flex-col relative ${activeTab === 'p2p' ? 'flex' : 'hidden'}`}>
          {/* Header Toolbar */}
          <div className="h-12 border-b border-white/[0.08] bg-[#0c0c14]/90 backdrop-blur-xl px-4 flex items-center justify-between shrink-0 z-20">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-sm font-semibold text-white tracking-tight">
                  P2P GameWebSight Library
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 font-mono">
                  Bitbucket Raw Mirror • 500+ Games & Playables
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReloadP2P}
                title="Reload P2P Library"
                className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/10 text-xs flex items-center gap-1.5 transition-all"
              >
                <RotateCcw size={13} />
                <span>Reload</span>
              </button>
              <button
                onClick={handleFullscreenP2P}
                title="Fullscreen"
                className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/10 transition-all"
              >
                <Maximize2 size={14} />
              </button>
              <a
                href="https://bitbucket.org/p2p-alt-public/p2p-emis/raw/main/GameWebSight"
                target="_blank"
                rel="noopener noreferrer"
                title="Direct Bitbucket Raw Source"
                className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/10 text-xs flex items-center gap-1.5 transition-all"
              >
                <ExternalLink size={13} />
                <span>Direct Source</span>
              </a>
            </div>
          </div>

          {/* Sandboxed P2P Frame Container */}
          <div className="flex-1 w-full h-full relative bg-[#0d0e12] overflow-hidden">
            <iframe
              ref={p2pFrameRef}
              id="p2p-websight-frame"
              className="w-full h-full border-0 block"
              srcDoc={P2P_LOADER_HTML}
              sandbox="allow-scripts allow-forms allow-pointer-lock"
              allow="autoplay; fullscreen; gamepad; clipboard-read; clipboard-write; keyboard-map"
              allowFullScreen
              title="P2P GameWebSight"
            />
          </div>
        </div>

        {/* =========================================================================
            TAB 7: WASM EMULATOR HUB (GBA / NES / SNES / N64 / NDS / PS1)
            ========================================================================= */}
        <div className={`w-full h-full flex flex-col relative ${activeTab === 'emulator' ? 'flex' : 'hidden'}`}>
          <EmulatorHubApp />
        </div>

        {/* =========================================================================
            TAB 8: EAGLERCRAFT STUDIO (12 Full HTML5/WASM Minecraft Editions)
            ========================================================================= */}
        <div className={`w-full h-full flex flex-col relative ${activeTab === 'eaglercraft' ? 'flex' : 'hidden'}`}>
          <EaglercraftApp />
        </div>
          </>
        )}
      </div>
      <GamepadMapperModal isOpen={showGamepadMapper} onClose={() => setShowGamepadMapper(false)} />
    </div>
  );
};

