import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useOS } from '../../context/OSContext';
import { useExtensions } from '../../context/ExtensionsContext';
import {
  Search,
  Globe,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Plus,
  X,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Server,
  Zap,
  Star,
  Check,
  Columns,
  Eye,
  Sliders,
  Settings,
  Palette,
  Puzzle,
  Download,
  Radio,
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { getAssetUrl } from '../../utils/assetHelper';
import {
  initUvProxy,
  encodeUvUrl,
  initSwBridgeProxy,
  encodeSwBridgeUrl,
  getActiveWispUrl,
  setActiveWispUrl,
  WISP_ENDPOINTS,
  SEARCH_ENGINES,
  SearchEngineId,
  formatSearchOrUrl
} from '../../utils/uvProxy';
import {
  initScramjetProxy,
  encodeScramjetUrl
} from '../../utils/scramjetProxy';
import { useAppSettings } from '../../utils/appSettings';
import { GODLY_BROWSER_BACKGROUNDS, BrowserBackground } from '../../constants/browserAssets';
import { BrandFavicon } from '../common/BrandFavicons';
import { ZenProxySuiteModal } from '../browser/ZenProxySuiteModal';
import { adBlockShield } from '../../utils/adBlocker';

export interface ZenTab {
  id: string;
  title: string;
  url: string;
  displayUrl?: string;
  icon?: string;
  workspaceId: string;
  tunnelMode: 'scramjet' | 'uv' | 'sw';
  isLoading: boolean;
  isPinned?: boolean;
  containerId?: 'default' | 'personal' | 'work' | 'banking' | 'shopping';
  folderId?: string;
  history: string[];
  historyIndex: number;
}

export interface ZenBookmark {
  id: string;
  title: string;
  url: string;
  icon?: string;
  category: string;
}

export interface ZenWorkspace {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const DEFAULT_WORKSPACES: ZenWorkspace[] = [
  { id: 'personal', name: 'Personal', icon: '😴', color: '#a855f7' },
  { id: 'work', name: 'Work', icon: '💼', color: '#f59e0b' },
  { id: 'gaming', name: 'Gaming', icon: '🎮', color: '#10b981' },
  { id: 'privacy', name: 'Privacy', icon: '🔒', color: '#06b6d4' },
];

const CONTAINERS: Record<string, { name: string; color: string }> = {
  default: { name: 'Default', color: '#a855f7' },
  personal: { name: 'Personal', color: '#06b6d4' },
  work: { name: 'Work', color: '#f59e0b' },
  banking: { name: 'Banking', color: '#10b981' },
  shopping: { name: 'Shopping', color: '#ec4899' },
};

// 6 Featured Hubs for the 3x2 Grid in Sidebar (matches reference screenshots)
const SIDEBAR_HUBS = [
  { id: 'hub-discord', name: 'Discord', url: 'https://discord.com', bg: '#5865F2' },
  { id: 'hub-spotify', name: 'Spotify', url: 'https://open.spotify.com', bg: '#1DB954' },
  { id: 'hub-chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com', bg: '#10A37F' },
  { id: 'hub-reddit', name: 'Reddit', url: 'https://reddit.com', bg: '#FF4500' },
  { id: 'hub-github', name: 'GitHub', url: 'https://github.com', bg: '#181717' },
  { id: 'hub-youtube', name: 'YouTube', url: 'https://youtube.com', bg: '#FF0000' },
];

const DEFAULT_BOOKMARKS: ZenBookmark[] = [
  { id: 'discord', title: 'Discord', url: 'https://discord.com', category: 'Social' },
  { id: 'spotify', title: 'Spotify', url: 'https://open.spotify.com', category: 'Music' },
  { id: 'chatgpt', title: 'ChatGPT', url: 'https://chatgpt.com', category: 'AI' },
  { id: 'reddit', title: 'Reddit', url: 'https://reddit.com', category: 'Social' },
  { id: 'github', title: 'GitHub', url: 'https://github.com', category: 'Dev' },
  { id: 'youtube', title: 'YouTube', url: 'https://youtube.com', category: 'Media' },
  { id: 'ddg', title: 'DuckDuckGo', url: 'https://duckduckgo.com', category: 'Search' },
  { id: 'brave', title: 'Brave Search', url: 'https://search.brave.com', category: 'Search' },
  { id: 'google', title: 'Google', url: 'https://google.com', category: 'Search' },
  { id: 'wikipedia', title: 'Wikipedia', url: 'https://wikipedia.org', category: 'Knowledge' },
  { id: 'twitch', title: 'Twitch', url: 'https://twitch.tv', category: 'Media' },
  { id: 'nowgg', title: 'NowGG Cloud Games', url: 'https://nowgg.fun', category: 'Games' },
];

export interface ZenBrowserAppProps {
  initialUrl?: string;
  windowId?: string;
  initialTab?: ZenTab;
}

export const ZenBrowserApp: React.FC<ZenBrowserAppProps> = ({
  initialUrl,
  windowId,
  initialTab,
}) => {
  const { openNewBrowserWindow, openApp } = useOS();
  const { extensions, toggleExtension } = useExtensions();
  const [appSettings] = useAppSettings();
  const [showExtensionsMenu, setShowExtensionsMenu] = useState(false);

  // Search Engine Preference
  const [selectedEngine, setSelectedEngine] = useState<SearchEngineId>(() => {
    try {
      const saved = localStorage.getItem('godly_zen_engine');
      if (saved && (saved === 'duckduckgo' || saved === 'brave' || saved === 'google')) {
        return saved as SearchEngineId;
      }
      return (appSettings.zen.defaultSearchEngine as SearchEngineId) || 'duckduckgo';
    } catch {
      return 'duckduckgo';
    }
  });

  useEffect(() => {
    if (appSettings.zen.defaultSearchEngine) {
      setSelectedEngine(appSettings.zen.defaultSearchEngine as SearchEngineId);
    }
  }, [appSettings.zen.defaultSearchEngine]);

  // Browser Background Image State: ROTATES AUTOMATICALLY on each open/launch
  const [browserBg, setBrowserBg] = useState<string>(() => {
    try {
      const lastIndexStr = localStorage.getItem('godly_browser_bg_rotation_index');
      let nextIndex = 0;
      if (lastIndexStr !== null) {
        const parsed = parseInt(lastIndexStr, 10);
        if (!isNaN(parsed)) {
          nextIndex = (parsed + 1) % GODLY_BROWSER_BACKGROUNDS.length;
        }
      }
      localStorage.setItem('godly_browser_bg_rotation_index', nextIndex.toString());
      const selected = GODLY_BROWSER_BACKGROUNDS[nextIndex] || GODLY_BROWSER_BACKGROUNDS[0];
      localStorage.setItem('godly_browser_background', selected.path);
      return selected.path;
    } catch {
      return GODLY_BROWSER_BACKGROUNDS[0].path;
    }
  });

  const [showBackgroundModal, setShowBackgroundModal] = useState(false);

  const handleSelectBackground = (bgPath: string) => {
    sound.playClick();
    setBrowserBg(bgPath);
    try {
      localStorage.setItem('godly_browser_background', bgPath);
      const idx = GODLY_BROWSER_BACKGROUNDS.findIndex((b) => b.path === bgPath);
      if (idx !== -1) {
        localStorage.setItem('godly_browser_bg_rotation_index', idx.toString());
      }
    } catch {}
  };

  const [workspaces, setWorkspaces] = useState<ZenWorkspace[]>(() => {
    try {
      const saved = localStorage.getItem('godly_zen_workspaces');
      if (saved) return JSON.parse(saved);
      return DEFAULT_WORKSPACES;
    } catch {
      return DEFAULT_WORKSPACES;
    }
  });

  const [activeWorkspace, setActiveWorkspace] = useState('personal');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(() => appSettings.zen.compactModeDefault);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  useEffect(() => {
    setIsCompactMode(appSettings.zen.compactModeDefault);
  }, [appSettings.zen.compactModeDefault]);

  // Split View State
  const [isSplitView, setIsSplitView] = useState(false);
  const [secondaryTabId, setSecondaryTabId] = useState<string | null>(null);

  // Glance Peek Preview
  const [glanceUrl, setGlanceUrl] = useState<string | null>(null);
  const [glanceTitle, setGlanceTitle] = useState<string>('Quick Preview');

  // Preferences & Mods
  const [zenMods, setZenMods] = useState({
    arcGradient: true,
    glowingTabs: true,
    compactMode: false,
    containerDots: true,
    floatingOmnibar: true,
    trackingProtection: true,
  });

  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [showEngineMenu, setShowEngineMenu] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [showProxySuite, setShowProxySuite] = useState(false);

  const [bookmarks, setBookmarks] = useState<ZenBookmark[]>(() => {
    try {
      const saved = localStorage.getItem('godly_zen_bookmarks');
      if (saved) return JSON.parse(saved);
      return DEFAULT_BOOKMARKS;
    } catch {
      return DEFAULT_BOOKMARKS;
    }
  });

  const [historyEntries, setHistoryEntries] = useState<any[]>(() => {
    try {
      const s = localStorage.getItem('godly_zen_history');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  const [activeWisp, setActiveWisp] = useState<string>(getActiveWispUrl());
  const [ping, setPing] = useState(14);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);

  // Initial tabs state (respects initialTab if dragged from another window)
  const [tabs, setTabs] = useState<ZenTab[]>(() => {
    if (initialTab) {
      return [
        {
          ...initialTab,
          id: initialTab.id || `tab-${Date.now()}`,
          isPinned: false,
          isLoading: !!initialTab.url,
        },
      ];
    }
    const firstTabUrl = initialUrl || '';
    const initialTitle = firstTabUrl
      ? (firstTabUrl.replace(/^https?:\/\//i, '').split('/')[0] || 'Web Page')
      : 'New Tab';

    return [
      {
        id: 'tab-pinned-chatgpt',
        title: 'ChatGPT',
        url: 'https://chatgpt.com',
        displayUrl: 'chatgpt.com',
        workspaceId: 'personal',
        tunnelMode: 'uv',
        isLoading: false,
        isPinned: true,
        containerId: 'default',
        history: ['https://chatgpt.com'],
        historyIndex: 0,
      },
      {
        id: 'tab-pinned-youtube',
        title: 'YouTube',
        url: 'https://youtube.com',
        displayUrl: 'youtube.com',
        workspaceId: 'personal',
        tunnelMode: 'uv',
        isLoading: false,
        isPinned: true,
        containerId: 'default',
        history: ['https://youtube.com'],
        historyIndex: 0,
      },
      {
        id: 'tab-active',
        title: initialTitle,
        url: firstTabUrl,
        displayUrl: firstTabUrl,
        workspaceId: 'personal',
        tunnelMode: 'uv',
        isLoading: !!firstTabUrl,
        isPinned: false,
        containerId: 'default',
        history: firstTabUrl ? [firstTabUrl] : [],
        historyIndex: firstTabUrl ? 0 : -1,
      },
    ];
  });

  const [activeTabId, setActiveTabId] = useState<string>(() => {
    if (initialTab?.id) return initialTab.id;
    return 'tab-active';
  });
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const secondaryTab = tabs.find((t) => t.id === secondaryTabId);

  // Address bar input state
  const [sidebarOmnibarInput, setSidebarOmnibarInput] = useState<string>(activeTab?.url || '');
  const [newTabSearchInput, setNewTabSearchInput] = useState<string>('');

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const secondaryIframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutTimerRef = useRef<number | null>(null);

  const sidebarRef = useRef<HTMLDivElement>(null);

  // Tab Tear-Off / Drag-to-Window & Split Screen
  const [dragState, setDragState] = useState<{
    tab: ZenTab;
    cursor: { x: number; y: number };
    snapRegion: 'none' | 'left' | 'right';
    isOutside: boolean;
  } | null>(null);

  const handleTabPointerDown = (e: React.PointerEvent, tab: ZenTab) => {
    // Ignore clicks on buttons inside tab (close, pin, glance)
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    if (e.button !== 0) return; // primary left click only

    const startX = e.clientX;
    const startY = e.clientY;
    let hasStartedDrag = false;

    const onPointerMove = (moveEv: PointerEvent) => {
      const dist = Math.hypot(moveEv.clientX - startX, moveEv.clientY - startY);
      if (!hasStartedDrag) {
        if (dist > 8) {
          hasStartedDrag = true;
        } else {
          return;
        }
      }

      const screenW = window.innerWidth;
      let snapRegion: 'none' | 'left' | 'right' = 'none';

      // Split-screen dock zones: left or right edge within 140px
      if (moveEv.clientX < 140) {
        snapRegion = 'left';
      } else if (moveEv.clientX > screenW - 140) {
        snapRegion = 'right';
      }

      let isOutside = false;
      if (sidebarRef.current) {
        const rect = sidebarRef.current.getBoundingClientRect();
        if (
          moveEv.clientX > rect.right + 15 ||
          moveEv.clientX < rect.left - 15 ||
          moveEv.clientY < rect.top - 15 ||
          moveEv.clientY > rect.bottom + 15
        ) {
          isOutside = true;
        }
      } else {
        isOutside = moveEv.clientX > 260;
      }

      setDragState({
        tab,
        cursor: { x: moveEv.clientX, y: moveEv.clientY },
        snapRegion,
        isOutside,
      });
    };

    const onPointerUp = (upEv: PointerEvent) => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);

      if (!hasStartedDrag) {
        sound.playClick();
        setActiveTabId(tab.id);
        return;
      }

      const screenW = window.innerWidth;
      let snapRegion: 'none' | 'left' | 'right' = 'none';
      if (upEv.clientX < 140) {
        snapRegion = 'left';
      } else if (upEv.clientX > screenW - 140) {
        snapRegion = 'right';
      }

      let isOutside = false;
      if (sidebarRef.current) {
        const rect = sidebarRef.current.getBoundingClientRect();
        if (
          upEv.clientX > rect.right + 15 ||
          upEv.clientX < rect.left - 15 ||
          upEv.clientY < rect.top - 15 ||
          upEv.clientY > rect.bottom + 15
        ) {
          isOutside = true;
        }
      } else {
        isOutside = upEv.clientX > 260;
      }

      setDragState(null);

      // If dragged to edge (split screen) or dragged outside the sidebar:
      if (snapRegion !== 'none' || isOutside) {
        openNewBrowserWindow({
          tab,
          snapRegion: snapRegion !== 'none' ? snapRegion : undefined,
          position: snapRegion === 'none' ? { x: upEv.clientX, y: upEv.clientY } : undefined,
          sourceWindowId: windowId,
        });

        // Remove tab from source window
        setTabs((prev) => {
          const remaining = prev.filter((t) => t.id !== tab.id);
          if (remaining.length === 0) {
            const freshTab: ZenTab = {
              id: `tab-${Date.now()}`,
              title: 'New Tab',
              url: '',
              displayUrl: '',
              workspaceId: activeWorkspace,
              tunnelMode: 'uv',
              isLoading: false,
              isPinned: false,
              containerId: 'default',
              history: [],
              historyIndex: -1,
            };
            setActiveTabId(freshTab.id);
            return [freshTab];
          }

          if (activeTabId === tab.id) {
            setActiveTabId(remaining[remaining.length - 1].id);
          }
          return remaining;
        });

        sound.playSnap();
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  // Sync omnibar input when active tab changes
  useEffect(() => {
    if (activeTab) {
      setSidebarOmnibarInput(activeTab.url || '');
      setShowTroubleshoot(false);
    }
  }, [activeTabId, activeTab?.url]);

  // Dynamic Ping Simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setPing(Math.floor(12 + Math.random() * 8));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Initialize Proxies (Ultraviolet & Scramjet)
  useEffect(() => {
    initUvProxy().catch((err) => console.warn('[Godly Browser] UV Init note:', err));
    initScramjetProxy().catch((err) => console.warn('[Godly Browser] Scramjet Init note:', err));
  }, [activeWisp]);

  // Set active search engine
  const handleSelectEngine = (engine: SearchEngineId) => {
    sound.playClick();
    setSelectedEngine(engine);
    setShowEngineMenu(false);
    try {
      localStorage.setItem('godly_zen_engine', engine);
    } catch {}
  };

  // Cycle Wisp Relay
  const handleCycleWisp = async () => {
    sound.playClick();
    const currentIndex = WISP_ENDPOINTS.findIndex((w) => w.url === activeWisp);
    const nextIndex = (currentIndex + 1) % WISP_ENDPOINTS.length;
    const nextWisp = WISP_ENDPOINTS[nextIndex].url;
    await setActiveWispUrl(nextWisp);
    setActiveWisp(nextWisp);
    handleReloadTab();
  };

  // Create New Tab
  const handleCreateTab = (url = '', title = 'New Tab', isPinned = false) => {
    sound.playClick();
    const newId = 'tab-' + Date.now();
    const newTab: ZenTab = {
      id: newId,
      title: title || 'New Tab',
      url: url,
      displayUrl: url,
      workspaceId: activeWorkspace,
      tunnelMode: 'uv',
      isLoading: !!url,
      isPinned: isPinned,
      containerId: 'default',
      history: url ? [url] : [],
      historyIndex: url ? 0 : -1,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
    setSidebarOmnibarInput(url);
  };

  // Close Tab
  const handleCloseTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    sound.playClick();
    if (tabs.length === 1) {
      setTabs([
        {
          id: 'tab-' + Date.now(),
          title: 'New Tab',
          url: '',
          workspaceId: activeWorkspace,
          tunnelMode: 'uv',
          isLoading: false,
          history: [],
          historyIndex: -1,
        },
      ]);
      setSidebarOmnibarInput('');
      return;
    }

    const nextTabs = tabs.filter((t) => t.id !== id);
    setTabs(nextTabs);
    if (activeTabId === id) {
      setActiveTabId(nextTabs[nextTabs.length - 1].id);
    }
    if (secondaryTabId === id) {
      setSecondaryTabId(null);
      setIsSplitView(false);
    }
  };

  // Toggle Tab Pinned State
  const handleTogglePinTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    sound.playClick();
    setTabs((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isPinned: !t.isPinned } : t))
    );
  };

  // Navigate Tab to a URL or Search Query
  const handleNavigate = (rawQuery: string, forcedEngine?: SearchEngineId) => {
    if (!rawQuery.trim()) return;
    sound.playClick();
    const engineToUse = forcedEngine || selectedEngine;
    const destinationUrl = formatSearchOrUrl(rawQuery, engineToUse);

    // Derive a clean title
    let displayTitle = 'Search';
    try {
      if (destinationUrl.includes('duckduckgo.com')) {
        displayTitle = 'DuckDuckGo';
      } else if (destinationUrl.includes('search.brave.com')) {
        displayTitle = 'Brave Search';
      } else if (destinationUrl.includes('google.com/search')) {
        displayTitle = 'Google Search';
      } else {
        const u = new URL(destinationUrl);
        displayTitle = u.hostname.replace(/^www\./, '');
      }
    } catch {
      displayTitle = rawQuery;
    }

    setTabs((prev) =>
      prev.map((t) => {
        if (t.id === activeTabId) {
          const nextHistory = [...t.history.slice(0, t.historyIndex + 1), destinationUrl];
          return {
            ...t,
            url: destinationUrl,
            displayUrl: destinationUrl,
            title: displayTitle,
            isLoading: true,
            history: nextHistory,
            historyIndex: nextHistory.length - 1,
          };
        }
        return t;
      })
    );

    setSidebarOmnibarInput(destinationUrl);
    setShowTroubleshoot(false);

    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    timeoutTimerRef.current = window.setTimeout(() => {
      setShowTroubleshoot(true);
    }, 4500);
  };

  // Reload current active tab
  const handleReloadTab = () => {
    sound.playClick();
    if (!activeTab || !activeTab.url) return;
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, isLoading: true } : t))
    );
    setShowTroubleshoot(false);

    if (iframeRef.current) {
      if (activeTab.tunnelMode === 'scramjet') {
        iframeRef.current.src = `${encodeScramjetUrl(activeTab.url)}#${Date.now()}`;
      } else if (activeTab.tunnelMode === 'sw') {
        iframeRef.current.src = `${encodeSwBridgeUrl(activeTab.url)}#${Date.now()}`;
      } else {
        iframeRef.current.src = `${encodeUvUrl(activeTab.url)}#${Date.now()}`;
      }
    }

    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    timeoutTimerRef.current = window.setTimeout(() => {
      setShowTroubleshoot(true);
    }, 4500);
  };

  // History Navigation Back / Forward
  const handleHistoryBack = () => {
    sound.playClick();
    if (!activeTab || activeTab.historyIndex <= 0) return;
    const nextIndex = activeTab.historyIndex - 1;
    const targetUrl = activeTab.history[nextIndex];
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? {
              ...t,
              url: targetUrl,
              displayUrl: targetUrl,
              historyIndex: nextIndex,
              isLoading: true,
            }
          : t
      )
    );
    setSidebarOmnibarInput(targetUrl);
  };

  const handleHistoryForward = () => {
    sound.playClick();
    if (!activeTab || activeTab.historyIndex >= activeTab.history.length - 1) return;
    const nextIndex = activeTab.historyIndex + 1;
    const targetUrl = activeTab.history[nextIndex];
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? {
              ...t,
              url: targetUrl,
              displayUrl: targetUrl,
              historyIndex: nextIndex,
              isLoading: true,
            }
          : t
      )
    );
    setSidebarOmnibarInput(targetUrl);
  };

  // Toggle Tab Tunnel Mode (Scramjet vs UV vs Root SW)
  const handleSetTabTunnelMode = (mode: 'scramjet' | 'uv' | 'sw') => {
    sound.playClick();
    if (mode === 'scramjet') {
      initScramjetProxy();
    } else if (mode === 'sw') {
      initSwBridgeProxy();
    } else if (mode === 'uv') {
      initUvProxy();
    }
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, tunnelMode: mode, isLoading: true } : t))
    );
    setShowModeMenu(false);
    setShowTroubleshoot(false);
  };

  // Open Glance Peek on a URL
  const handleOpenGlance = (url: string, title?: string) => {
    sound.playOpen();
    setGlanceUrl(url);
    setGlanceTitle(title || url);
  };

  // Toggle Split View
  const handleToggleSplitView = () => {
    sound.playClick();
    if (isSplitView) {
      setIsSplitView(false);
      setSecondaryTabId(null);
    } else {
      const otherTab = tabs.find((t) => t.id !== activeTabId);
      if (otherTab) {
        setSecondaryTabId(otherTab.id);
      } else {
        const newId = 'tab-split-' + Date.now();
        const splitTab: ZenTab = {
          id: newId,
          title: 'Split Tab',
          url: 'https://duckduckgo.com',
          workspaceId: activeWorkspace,
          tunnelMode: 'scramjet',
          isLoading: true,
          history: ['https://duckduckgo.com'],
          historyIndex: 0,
        };
        setTabs((prev) => [...prev, splitTab]);
        setSecondaryTabId(newId);
      }
      setIsSplitView(true);
    }
  };

  // Frame source calculation
  const getComputedFrameSrc = (tab: ZenTab | undefined) => {
    if (!tab || !tab.url) return '';
    if (tab.tunnelMode === 'scramjet') {
      return encodeScramjetUrl(tab.url);
    }
    if (tab.tunnelMode === 'sw') {
      return encodeSwBridgeUrl(tab.url);
    }
    return encodeUvUrl(tab.url);
  };

  const currentEngineMeta = SEARCH_ENGINES[selectedEngine];
  const activeWorkspaceObj = workspaces.find((w) => w.id === activeWorkspace) || workspaces[0];

  // Derive display text for the sidebar omnibar
  const displayOmnibarValue = activeTab?.url
    ? activeTab.url.replace(/^https?:\/\//i, '').replace(/\/$/, '')
    : '';

  return (
    <div
      className="flex h-full w-full text-slate-100 select-none overflow-hidden font-sans relative bg-cover bg-center"
      style={{
        backgroundImage: `url(${getAssetUrl(browserBg)})`,
      }}
    >
      {/* ========================================================================= */}
      {/* 1. TRANSLUCENT FROSTED GLASS SIDEBAR (THE ONLY TRANSLUCENT PART)          */}
      {/* ========================================================================= */}
      <div
        ref={sidebarRef}
        onMouseEnter={() => isCompactMode && setIsSidebarHovered(true)}
        onMouseLeave={() => isCompactMode && setIsSidebarHovered(false)}
        className={`h-full flex flex-col backdrop-blur-3xl bg-[#14121a]/65 border-r border-white/10 transition-all duration-300 z-30 flex-shrink-0 shadow-[4px_0_30px_rgba(0,0,0,0.5)] ${
          isCompactMode
            ? isSidebarHovered
              ? 'absolute left-0 top-0 bottom-0 w-64 shadow-2xl z-50'
              : 'w-2 bg-purple-500/10 hover:bg-purple-500/30 cursor-pointer overflow-hidden'
            : sidebarCollapsed
            ? 'w-16'
            : 'w-64'
        }`}
      >
        {(!isCompactMode || isSidebarHovered) && (
          <>
            {/* Top Row: Browser Navigation Controls (NO close, minimize, or fullscreen buttons) */}
            <div className="flex items-center justify-between px-3.5 pt-3 pb-2 text-slate-300">
              <div className="flex items-center gap-1">
                <button
                  onClick={handleHistoryBack}
                  disabled={!activeTab || activeTab.historyIndex <= 0}
                  className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="Back"
                >
                  <ArrowLeft size={14} />
                </button>
                <button
                  onClick={handleHistoryForward}
                  disabled={!activeTab || activeTab.historyIndex >= activeTab.history.length - 1}
                  className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="Forward"
                >
                  <ArrowRight size={14} />
                </button>
                <button
                  onClick={handleReloadTab}
                  className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                  title="Reload"
                >
                  <RotateCcw
                    size={14}
                    className={activeTab?.isLoading ? 'animate-spin text-purple-300' : ''}
                  />
                </button>
              </div>

              <div className="flex items-center gap-1 relative">
                <button
                  onClick={() => {
                    sound.playClick();
                    setShowExtensionsMenu(!showExtensionsMenu);
                  }}
                  className={`p-1.5 rounded-lg transition-colors ${
                    showExtensionsMenu ? 'bg-purple-600/30 text-purple-300' : 'hover:bg-white/10 hover:text-white'
                  }`}
                  title="Zen Extensions"
                >
                  <Puzzle size={14} />
                </button>
                <button
                  onClick={() => handleCreateTab()}
                  className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                  title="New Tab"
                >
                  <Plus size={14} />
                </button>

                {/* Quick Extensions Dropdown */}
                {showExtensionsMenu && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-[#0c0c16]/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <Puzzle size={13} className="text-purple-400" />
                        <span>Zen Extensions</span>
                      </div>
                      <span className="text-[10px] text-white/40 font-mono">
                        {extensions.filter((e) => e.enabled).length} active
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {extensions.map((ext) => (
                        <div
                          key={ext.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] transition-all"
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <span className="text-base select-none">{ext.icon}</span>
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-white/90 truncate">{ext.name}</div>
                              <div className="text-[10px] text-white/40 truncate">{ext.category}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              sound.playClick();
                              toggleExtension(ext.id);
                            }}
                            className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${
                              ext.enabled ? 'bg-purple-600' : 'bg-white/15'
                            }`}
                          >
                            <div
                              className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.75 ${
                                ext.enabled ? 'translate-x-4.5' : 'translate-x-0.75'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        sound.playOpen();
                        openApp('extensions');
                        setShowExtensionsMenu(false);
                      }}
                      className="w-full mt-2.5 py-1.5 px-3 rounded-xl bg-purple-600/25 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <span>Open Extensions Hub</span>
                      <ExternalLink size={11} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Omnibar Pill (Inside Sidebar - matches Image 1 & Image 2) */}
            <div className="px-3 py-1">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleNavigate(sidebarOmnibarInput);
                }}
                className="w-full"
              >
                <div className="relative flex items-center bg-white/[0.08] hover:bg-white/[0.12] focus-within:bg-black/60 focus-within:border-white/30 border border-white/10 rounded-2xl px-3 py-1.5 transition-all shadow-inner">
                  <input
                    type="text"
                    value={sidebarOmnibarInput}
                    onChange={(e) => setSidebarOmnibarInput(e.target.value)}
                    placeholder={displayOmnibarValue || `Search with ${currentEngineMeta.name}...`}
                    className="w-full bg-transparent text-xs text-white placeholder-slate-400 outline-none font-sans truncate"
                  />
                  {sidebarOmnibarInput && (
                    <button
                      type="button"
                      onClick={() => setSidebarOmnibarInput('')}
                      className="p-0.5 rounded text-slate-400 hover:text-white ml-1"
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* 3x2 Grid of Squircles: Speed Dial & Hubs (matches Image 1 & Image 2) */}
            <div className="px-3 py-2">
              <div className="grid grid-cols-3 gap-2">
                {SIDEBAR_HUBS.map((hub) => (
                  <button
                    key={hub.id}
                    onClick={() => {
                      sound.playClick();
                      handleNavigate(hub.url);
                    }}
                    className="group aspect-square rounded-2xl flex items-center justify-center bg-white/[0.08] hover:bg-white/[0.16] border border-white/10 hover:border-white/25 hover:scale-105 active:scale-95 transition-all shadow-md"
                    title={`Open ${hub.name}`}
                  >
                    <BrandFavicon url={hub.url} title={hub.name} size={22} />
                  </button>
                ))}
              </div>
            </div>

            {/* Workspace Heading (matches Image 1 & Image 2: "😴 Personal") */}
            <div className="px-3.5 pt-2 pb-1 relative">
              <button
                onClick={() => {
                  sound.playClick();
                  setShowWorkspaceMenu(!showWorkspaceMenu);
                }}
                className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                <span className="text-sm">{activeWorkspaceObj.icon}</span>
                <span>{activeWorkspaceObj.name}</span>
                <ChevronDown size={11} className="text-slate-400 ml-0.5" />
              </button>

              {/* Workspace Switcher Popover */}
              {showWorkspaceMenu && (
                <div className="absolute top-full left-3.5 mt-1 w-48 rounded-2xl bg-[#14121f]/95 backdrop-blur-2xl border border-white/15 p-1.5 shadow-2xl z-50 flex flex-col gap-1">
                  <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-white/10">
                    Switch Workspace
                  </div>
                  {workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      onClick={() => {
                        sound.playClick();
                        setActiveWorkspace(ws.id);
                        setShowWorkspaceMenu(false);
                      }}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-left transition-all ${
                        activeWorkspace === ws.id
                          ? 'bg-purple-600/30 text-white font-semibold border border-purple-500/40'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{ws.icon}</span>
                        <span>{ws.name}</span>
                      </div>
                      {activeWorkspace === ws.id && <Check size={12} className="text-purple-400" />}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      const name = prompt('New Workspace Name:');
                      if (name) {
                        const newWs: ZenWorkspace = {
                          id: 'ws-' + Date.now(),
                          name,
                          icon: '📁',
                          color: '#a855f7',
                        };
                        const updated = [...workspaces, newWs];
                        setWorkspaces(updated);
                        localStorage.setItem('godly_zen_workspaces', JSON.stringify(updated));
                        setActiveWorkspace(newWs.id);
                        setShowWorkspaceMenu(false);
                      }
                    }}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/10 border-t border-white/10 mt-1"
                  >
                    <Plus size={12} />
                    <span>Add Workspace</span>
                  </button>
                </div>
              )}
            </div>

            {/* Pinned Tabs List (matches Image 1 & 2: ChatGPT, YouTube with real brand favicons) */}
            <div className="px-2 py-1 flex flex-col gap-0.5">
              {tabs
                .filter((t) => t.isPinned)
                .map((pinTab) => {
                  const isActive = pinTab.id === activeTabId;
                  return (
                    <div
                      key={pinTab.id}
                      onPointerDown={(e) => handleTabPointerDown(e, pinTab)}
                      className={`group flex items-center justify-between px-3 py-1.5 rounded-xl text-xs cursor-pointer select-none transition-all active:scale-[0.98] touch-none ${
                        isActive
                          ? 'bg-white/15 backdrop-blur-md text-white font-medium shadow-sm border border-white/10'
                          : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
                      }`}
                      title={`${pinTab.title} — Drag out to split-screen or create a new window`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <BrandFavicon url={pinTab.url} title={pinTab.title} size={16} />
                        <span className="truncate">{pinTab.title}</span>
                      </div>
                      <button
                        onClick={(e) => handleTogglePinTab(e, pinTab.id)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-400 hover:text-white transition-opacity"
                        title="Unpin Tab"
                      >
                        <Star size={11} fill="currentColor" className="text-amber-400" />
                      </button>
                    </div>
                  );
                })}
            </div>

            {/* Subtle Divider (matches Image 1 & Image 2) */}
            <div className="mx-3 my-1.5 border-t border-white/10" />

            {/* + New Tab Action (matches Image 1 & Image 2) */}
            <div className="px-2">
              <button
                onClick={() => handleCreateTab()}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Open New Tab"
              >
                <Plus size={13} className="text-slate-300" />
                <span className="font-medium">New Tab</span>
              </button>
            </div>

            {/* Vertical Tabs List (matches Image 1 & 2 with active pill highlight) */}
            <div className="flex-1 overflow-y-auto px-2 py-1 flex flex-col gap-1 custom-scrollbar">
              {tabs
                .filter(
                  (t) =>
                    !t.isPinned &&
                    (sidebarCollapsed || t.workspaceId === activeWorkspace || tabs.length <= 1)
                )
                .map((tab) => {
                  const isActive = tab.id === activeTabId;
                  const containerMeta = CONTAINERS[tab.containerId || 'default'];

                  return (
                    <div
                      key={tab.id}
                      onPointerDown={(e) => handleTabPointerDown(e, tab)}
                      className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer select-none transition-all active:scale-[0.98] touch-none ${
                        isActive
                          ? 'bg-white/15 backdrop-blur-md text-white font-medium border border-white/15 shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-white/[0.08] border border-transparent'
                      } ${zenMods.glowingTabs && isActive ? 'shadow-[0_0_12px_rgba(255,255,255,0.1)]' : ''}`}
                      title={`${tab.title || 'New Tab'} — Drag out to split-screen or create a new window`}
                    >
                      {/* Container Stripe Accent */}
                      {zenMods.containerDots && (
                        <div
                          className="absolute left-1 top-2 bottom-2 w-0.5 rounded-full"
                          style={{ backgroundColor: containerMeta.color }}
                        />
                      )}

                      <div className="flex items-center gap-2.5 truncate min-w-0 pr-1">
                        <BrandFavicon url={tab.url} title={tab.title} size={16} />
                        <span className="truncate">{tab.title || 'New Tab'}</span>
                      </div>

                      {/* Actions: Glance & Pin & Close */}
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                        {tab.url && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenGlance(tab.url, tab.title);
                            }}
                            className="p-0.5 rounded text-slate-400 hover:text-white"
                            title="Glance Peek"
                          >
                            <Eye size={11} />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleTogglePinTab(e, tab.id)}
                          className="p-0.5 rounded text-slate-400 hover:text-white"
                          title="Pin Tab"
                        >
                          <Star size={11} fill={tab.isPinned ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          onClick={(e) => handleCloseTab(e, tab.id)}
                          className="p-0.5 rounded text-slate-400 hover:text-white"
                          title="Close Tab"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Sidebar Bottom Toolbar (matches Image 1: Settings, Wallpaper, Split, Downloads) */}
            <div className="p-2.5 border-t border-white/10 flex items-center justify-between text-slate-300 bg-black/20">
              <button
                onClick={() => {
                  sound.playClick();
                  setShowPreferencesModal(true);
                }}
                className="p-1.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
                title="Settings & Godly Mods"
              >
                <Settings size={14} />
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setShowBackgroundModal(true);
                }}
                className="p-1.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors relative"
                title="Change Browser Background Wallpaper"
              >
                <Palette size={14} />
              </button>

              <button
                onClick={handleToggleSplitView}
                className={`p-1.5 rounded-xl transition-colors ${
                  isSplitView ? 'bg-purple-600/30 text-purple-200' : 'hover:bg-white/10 hover:text-white'
                }`}
                title="Split View"
              >
                <Columns size={14} />
              </button>

              <button
                onClick={() => sound.playClick()}
                className="p-1.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
                title="Downloads"
              >
                <Download size={14} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN BROWSER CONTENT VIEWPORT (BACKGROUND VISIBLE, NOT BLURRED)       */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden p-2 sm:p-3 relative z-10">
        {activeTab?.url ? (
          /* When viewing a webpage: inside solid dark rounded frame */
          <div className="flex-1 rounded-2xl border border-white/15 overflow-hidden shadow-2xl relative flex flex-col bg-[#08090f]">
            {/* Top Loading Progress Line */}
            {activeTab?.isLoading && (
              <div className="absolute top-0 left-0 right-0 h-[2px] z-30 pointer-events-none overflow-hidden bg-white/5">
                <div className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-emerald-400 animate-[loading-bar_1.2s_ease-in-out_infinite]" />
              </div>
            )}

            {/* Minimal Controls Bar for Proxied Tab View */}
            <div className="px-3 py-1.5 bg-[#0b0c14]/90 border-b border-white/10 flex items-center justify-between text-xs z-20">
              <div className="flex items-center gap-2 truncate">
                <button
                  onClick={() => {
                    sound.playClick();
                    setShowProxySuite(true);
                  }}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg border border-purple-500/30 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-[11px] font-semibold transition-all shrink-0 active:scale-95 shadow-sm"
                  title="Wisp Latency Benchmark, AdBlock & AES-256 Sync"
                >
                  <ShieldCheck size={12} className="text-emerald-400" />
                  <span>Privacy Shield & Suite</span>
                </button>
                <span className="truncate text-slate-300 font-mono text-[11px]">
                  {activeTab.url}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Proxy Mode Selector Pill (Scramjet vs SW Bridge vs UV vs Direct) */}
                <div className="relative">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setShowModeMenu(!showModeMenu);
                    }}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[11px] transition-all ${
                      activeTab?.tunnelMode === 'scramjet'
                        ? 'bg-violet-600/20 border-violet-500/40 text-violet-300'
                        : activeTab?.tunnelMode === 'sw'
                        ? 'bg-teal-600/20 border-teal-500/40 text-teal-300'
                        : 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300'
                    }`}
                    title="Proxy Engine Pipeline"
                  >
                    <Zap size={10} />
                    <span className="hidden sm:inline font-semibold">
                      {activeTab?.tunnelMode === 'scramjet' ? 'Scramjet v2.0' :
                       activeTab?.tunnelMode === 'sw' ? 'SW Bridge (sw.js)' : 'Ultraviolet Proxy'}
                    </span>
                    <ChevronDown size={9} />
                  </button>

                  {showModeMenu && (
                    <div className="absolute top-full right-0 mt-1 w-64 rounded-2xl bg-[#10121d]/98 backdrop-blur-2xl border border-white/15 shadow-2xl p-1.5 z-50 flex flex-col gap-1">
                      <div className="px-2.5 py-1 text-[10px] uppercase text-slate-400 font-bold border-b border-white/10 font-mono">
                        Proxy Engine Pipeline
                      </div>

                      {/* Scramjet Static Option */}
                      <button
                        onClick={() => handleSetTabTunnelMode('scramjet')}
                        className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-left transition-all ${
                          activeTab?.tunnelMode === 'scramjet'
                            ? 'bg-violet-500/20 text-violet-200 border border-violet-500/40 font-semibold'
                            : 'text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium">Scramjet Static v2.0</span>
                            <span className="text-[9px] bg-violet-500/20 text-violet-300 px-1 rounded font-mono">WASM ⚡</span>
                          </div>
                          <div className="text-[9px] text-slate-400">Fast WASM engine + BareWorker Wisp</div>
                        </div>
                        {activeTab?.tunnelMode === 'scramjet' && <Check size={12} className="text-violet-400 flex-shrink-0" />}
                      </button>

                      {/* Service Worker Bridge Option */}
                      <button
                        onClick={() => handleSetTabTunnelMode('sw')}
                        className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-left transition-all ${
                          activeTab?.tunnelMode === 'sw'
                            ? 'bg-teal-500/20 text-teal-200 border border-teal-500/40 font-semibold'
                            : 'text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium">Service Worker Bridge</span>
                            <span className="text-[9px] bg-teal-500/20 text-teal-300 px-1 rounded font-mono">sw.js</span>
                          </div>
                          <div className="text-[9px] text-slate-400">Root sw.js + bareworker.js tunnel</div>
                        </div>
                        {activeTab?.tunnelMode === 'sw' && <Check size={12} className="text-teal-400 flex-shrink-0" />}
                      </button>

                      {/* Ultraviolet Proxy Option */}
                      <button
                        onClick={() => handleSetTabTunnelMode('uv')}
                        className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-left transition-all ${
                          activeTab?.tunnelMode === 'uv'
                            ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 font-semibold'
                            : 'text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium">Ultraviolet Proxy</span>
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-mono">Epoxy</span>
                          </div>
                          <div className="text-[9px] text-slate-400">UV Service Worker + Epoxy Wisp</div>
                        </div>
                        {activeTab?.tunnelMode === 'uv' && <Check size={12} className="text-emerald-400 flex-shrink-0" />}
                      </button>
                    </div>
                  )}
                </div>

                {/* Diagnostics Trigger */}
                <button
                  onClick={() => {
                    sound.playClick();
                    setShowTroubleshoot(!showTroubleshoot);
                  }}
                  className="p-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-300 hover:text-white"
                  title="Diagnostics & Proxy Fallbacks"
                >
                  <Sparkles size={12} />
                </button>

                {/* Open in External Tab */}
                <button
                  onClick={() => {
                    sound.playClick();
                    window.open(activeTab.url, '_blank');
                  }}
                  className="p-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-300 hover:text-white"
                  title="Open in new browser tab"
                >
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>

            {/* Split View vs Single Tab View */}
            <div className="flex-1 relative overflow-hidden bg-transparent">
              {isSplitView ? (
                <div className="w-full h-full flex flex-row overflow-hidden relative">
                  <div className="flex-1 h-full border-r border-white/10 relative">
                    <iframe
                      ref={iframeRef}
                      src={getComputedFrameSrc(activeTab)}
                      onLoad={() => {
                        setTabs((prev) =>
                          prev.map((t) => (t.id === activeTabId ? { ...t, isLoading: false } : t))
                        );
                      }}
                      className="w-full h-full border-none block bg-transparent"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    />
                  </div>
                  <div className="flex-1 h-full relative">
                    <iframe
                      ref={secondaryIframeRef}
                      src={getComputedFrameSrc(secondaryTab)}
                      className="w-full h-full border-none block bg-transparent"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    />
                  </div>
                </div>
              ) : (
                <div className="w-full h-full relative">
                  <iframe
                    ref={iframeRef}
                    src={getComputedFrameSrc(activeTab)}
                    onLoad={() => {
                      setTabs((prev) =>
                        prev.map((t) => (t.id === activeTabId ? { ...t, isLoading: false } : t))
                      );
                    }}
                    className="w-full h-full border-none block bg-transparent"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  />

                  {/* Troubleshoot Helper */}
                  {showTroubleshoot && (
                    <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 rounded-2xl bg-[#0f121ecc]/95 backdrop-blur-2xl border border-purple-500/30 p-3.5 shadow-2xl z-40 text-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5 text-purple-300 font-semibold font-mono">
                          <Sparkles size={13} className="text-purple-400" />
                          <span>Connection Diagnostics</span>
                        </div>
                        <button
                          onClick={() => setShowTroubleshoot(false)}
                          className="text-slate-400 hover:text-white px-1.5 py-0.5 rounded-lg text-xs"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-300 mb-3 leading-relaxed font-sans">
                        Page slow or blank? Switch engine pipeline or cycle to another high-speed Wisp relay:
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => handleSetTabTunnelMode('scramjet')}
                          className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-violet-600/25 hover:bg-violet-600/40 border border-violet-500/40 text-violet-200 text-[11px] font-semibold transition-all"
                        >
                          <Zap size={12} className="text-violet-400" />
                          Scramjet Static ⚡
                        </button>
                        <button
                          onClick={() => handleSetTabTunnelMode('sw')}
                          className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-teal-600/25 hover:bg-teal-600/40 border border-teal-500/40 text-teal-200 text-[11px] font-semibold transition-all"
                        >
                          <Radio size={12} className="text-teal-400" />
                          SW Bridge (sw.js)
                        </button>
                        <button
                          onClick={handleCycleWisp}
                          className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-purple-600/25 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 text-[11px] font-semibold transition-all"
                        >
                          <Server size={12} className="text-purple-400" />
                          Next Wisp Relay
                        </button>
                        <button
                          onClick={() => handleNavigate('https://duckduckgo.com')}
                          className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-amber-600/25 hover:bg-amber-600/40 border border-amber-500/40 text-amber-200 text-[11px] font-semibold transition-all"
                        >
                          <span className="text-xs">🦆</span>
                          DuckDuckGo
                        </button>
                        <button
                          onClick={() => {
                            sound.playClick();
                            window.open(activeTab.url, '_blank');
                          }}
                          className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 text-[11px] font-semibold transition-all"
                        >
                          <ExternalLink size={12} />
                          Open in Tab
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* WHEN ON NEW TAB: BACKGROUND IS VISIBLE AND NOT BLURRED    */
          /* ======================================================== */
          <div className="flex-1 rounded-2xl overflow-hidden relative flex flex-col">
            <div className="h-full w-full overflow-y-auto flex flex-col items-center justify-between p-6 sm:p-10 relative">
              <div className="w-full max-w-3xl flex flex-col items-center my-auto z-10">
                {/* Brand Title */}
                <div className="flex flex-col items-center mb-6 text-center animate-in fade-in duration-500">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-2xl shadow-purple-600/40 border border-purple-400/50 mb-3 p-0.5 bg-gradient-to-tr from-purple-500 via-indigo-500 to-cyan-400">
                    <img
                      src={getAssetUrl('assets/icons/zen.jpg')}
                      alt="Godly Browser"
                      className="w-full h-full object-cover rounded-[14px]"
                    />
                  </div>
                  <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                    Godly Browser
                  </h1>
                  <p className="text-xs text-white/90 mt-1 max-w-md drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)] font-medium">
                    Calm, private, proxy-powered web with vertical tabs and rotating classical sceneries.
                  </p>
                </div>

                {/* Multi Search Engine Selector Pills */}
                <div className="flex items-center gap-2 mb-3 bg-black/60 p-1.5 rounded-2xl border border-white/20 shadow-2xl">
                  {(Object.keys(SEARCH_ENGINES) as SearchEngineId[]).map((eId) => {
                    const engine = SEARCH_ENGINES[eId];
                    const isSelected = selectedEngine === eId;
                    return (
                      <button
                        key={eId}
                        onClick={() => handleSelectEngine(eId)}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-purple-600/70 text-white border border-purple-400/80 shadow-md'
                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="text-sm">
                          {eId === 'duckduckgo' ? '🦆' : eId === 'brave' ? '🦁' : '🌐'}
                        </span>
                        <span>{engine.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Central Omnibar Search Input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleNavigate(newTabSearchInput);
                  }}
                  className="w-full relative mb-8"
                >
                  <div className="relative flex items-center bg-black/65 border border-white/25 hover:border-purple-400 focus-within:border-purple-400 rounded-3xl px-5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.7)] transition-all">
                    <Search size={18} className="text-purple-400 mr-3 shrink-0" />
                    <input
                      type="text"
                      value={newTabSearchInput}
                      onChange={(e) => setNewTabSearchInput(e.target.value)}
                      placeholder={`Search with ${currentEngineMeta.name} or type web address...`}
                      autoFocus
                      className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-300 outline-none font-sans"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold tracking-wider uppercase shadow-lg shadow-purple-600/30 transition-all shrink-0 ml-2"
                    >
                      Search
                    </button>
                  </div>
                </form>

                {/* Curated Speed Dial Tiles with REAL Brand Favicons */}
                <div className="w-full">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-xs uppercase font-bold text-white tracking-wider drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
                      Speed Dial & Hubs
                    </span>
                    <button
                      onClick={() => setShowBackgroundModal(true)}
                      className="text-xs text-purple-200 hover:text-white flex items-center gap-1 font-semibold transition-colors bg-black/55 px-2.5 py-1 rounded-xl border border-white/20 shadow-md"
                    >
                      <Palette size={12} />
                      <span>Change Wallpaper</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                    {bookmarks.slice(0, 12).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          sound.playClick();
                          handleNavigate(item.url);
                        }}
                        className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-black/55 hover:bg-black/80 border border-white/20 hover:border-purple-400/60 shadow-lg transition-all hover:scale-105"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center mb-2 group-hover:border-purple-400/50 transition-colors">
                          <BrandFavicon url={item.url} title={item.title} size={24} />
                        </div>
                        <span className="text-xs font-medium text-white truncate max-w-full font-sans">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-slate-300 truncate max-w-full">
                          {item.category}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Network Status */}
              <div className="w-full max-w-2xl mt-6 pt-3 border-t border-white/20 flex items-center justify-between text-xs text-slate-200 font-mono z-10 bg-black/50 px-4 py-2 rounded-2xl shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  <span>Ultraviolet Tunnel: Connected ({ping}ms)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>Engine: {currentEngineMeta.name}</span>
                  <span>•</span>
                  <span>Auto-Rotating Sceneries</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 3. WALLPAPER / BACKGROUND SELECTOR MODAL                  */}
      {/* ======================================================== */}
      {showBackgroundModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[85vh] bg-[#0e101a]/95 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Palette size={20} className="text-purple-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Godly Browser 4K/5K Backgrounds</h3>
                  <p className="text-xs text-slate-400">
                    17 authentic 4K/5K Ultra-HD sceneries from Godly Browser Backgrounds (rotates automatically on launch)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBackgroundModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Gallery Grid */}
            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 custom-scrollbar">
              {GODLY_BROWSER_BACKGROUNDS.map((bg) => {
                const isSelected = browserBg === bg.path;
                return (
                  <button
                    key={bg.id}
                    onClick={() => handleSelectBackground(bg.path)}
                    className={`group relative rounded-2xl overflow-hidden border transition-all text-left flex flex-col ${
                      isSelected
                        ? 'border-purple-400 ring-2 ring-purple-500/50 shadow-lg scale-[1.02]'
                        : 'border-white/10 hover:border-white/30 hover:scale-[1.01]'
                    }`}
                  >
                    <div className="aspect-[16/10] w-full overflow-hidden relative bg-black/40">
                      <img
                        src={getAssetUrl(bg.path)}
                        alt={bg.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md">
                          <Check size={14} />
                        </div>
                      )}
                    </div>
                    <div className="p-2 bg-[#121422] flex-1 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                        {bg.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10">
              <button
                onClick={() => handleSelectBackground(GODLY_BROWSER_BACKGROUNDS[0].path)}
                className="text-xs text-purple-400 hover:text-purple-300 underline font-medium"
              >
                Reset to Twilight Alpine Lake (5K)
              </button>
              <button
                onClick={() => setShowBackgroundModal(false)}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. GODLY GLANCE (PEEK PREVIEW) MODAL                     */}
      {/* ======================================================== */}
      {glanceUrl && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full max-w-4xl h-[80%] bg-[#0e101a] border border-purple-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-2.5 bg-black/40 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Eye size={14} className="text-purple-400" />
                <span className="text-xs font-bold text-white truncate max-w-md">{glanceTitle}</span>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-mono">
                  Glance Peek
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    handleCreateTab(glanceUrl, glanceTitle);
                    setGlanceUrl(null);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-semibold"
                >
                  Open in Full Tab
                </button>
                <button
                  onClick={() => setGlanceUrl(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
            <iframe
              src={encodeUvUrl(glanceUrl)}
              className="w-full flex-1 border-none bg-white"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            />
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. GODLY BROWSER PREFERENCES & MODS MODAL                 */}
      {/* ======================================================== */}
      {showPreferencesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0e101a] border border-white/15 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sliders size={18} className="text-purple-400" />
                <h3 className="text-base font-bold text-white">Godly Browser Preferences & Mods</h3>
              </div>
              <button
                onClick={() => setShowPreferencesModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {/* Quick Wallpaper Picker Button */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                <div>
                  <h4 className="text-xs font-bold text-white">Browser Scenery Wallpaper</h4>
                  <p className="text-[11px] text-slate-400">17 authentic 4K/5K wallpapers from Godly Browser Backgrounds</p>
                </div>
                <button
                  onClick={() => {
                    setShowPreferencesModal(false);
                    setShowBackgroundModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Palette size={13} />
                  <span>Choose</span>
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                <div>
                  <h4 className="text-xs font-bold text-white">Arc Dynamic Ambient Lighting</h4>
                  <p className="text-[11px] text-slate-400">Lush ambient lighting behind vertical tabs</p>
                </div>
                <button
                  onClick={() => setZenMods((p) => ({ ...p, arcGradient: !p.arcGradient }))}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                    zenMods.arcGradient ? 'bg-purple-600' : 'bg-white/15'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      zenMods.arcGradient ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                <div>
                  <h4 className="text-xs font-bold text-white">Glowing Tab Aura</h4>
                  <p className="text-[11px] text-slate-400">Active tab radiates glowing neon illumination</p>
                </div>
                <button
                  onClick={() => setZenMods((p) => ({ ...p, glowingTabs: !p.glowingTabs }))}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                    zenMods.glowingTabs ? 'bg-purple-600' : 'bg-white/15'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      zenMods.glowingTabs ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                <div>
                  <h4 className="text-xs font-bold text-white">Enhanced Tracking Protection</h4>
                  <p className="text-[11px] text-slate-400">Strip telemetry and block intrusive scripts</p>
                </div>
                <button
                  onClick={() => setZenMods((p) => ({ ...p, trackingProtection: !p.trackingProtection }))}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                    zenMods.trackingProtection ? 'bg-purple-600' : 'bg-white/15'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      zenMods.trackingProtection ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-4 mt-2 border-t border-white/10">
              <button
                onClick={() => setShowPreferencesModal(false)}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB TEAR-OFF / SPLIT-SCREEN DRAG PORTAL OVERLAY                        */}
      {/* ========================================================================= */}
      {dragState &&
        createPortal(
          <div className="fixed inset-0 z-[999999] pointer-events-auto select-none cursor-grabbing">
            {/* Split Screen Snap Preview: Left Half */}
            {dragState.snapRegion === 'left' && (
              <>
                <div className="fixed left-0 top-0 bottom-[52px] w-1/2 bg-purple-600/25 border-2 border-purple-400 backdrop-blur-md rounded-r-3xl z-[1000000] flex flex-col items-center justify-center pointer-events-none shadow-[0_0_60px_rgba(168,85,247,0.4)] animate-pulse">
                  <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-[#0e0c18]/85 border border-purple-400/40 backdrop-blur-2xl shadow-2xl max-w-sm text-center">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
                      <Columns size={26} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white tracking-wide">
                        Split Screen: Left Half
                      </div>
                      <div className="text-xs text-purple-200/80 mt-1">
                        Release to dock &ldquo;{dragState.tab.title || 'Tab'}&rdquo; on the left &amp; source window on the right
                      </div>
                    </div>
                  </div>
                </div>
                {/* Source Window Destination indicator on opposite half */}
                <div className="fixed right-0 top-0 bottom-[52px] w-1/2 bg-white/[0.03] border-2 border-dashed border-white/20 rounded-l-3xl z-[1000000] flex items-center justify-center pointer-events-none">
                  <span className="text-xs text-slate-300/80 bg-black/60 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                    Source Window will snap to Right Half
                  </span>
                </div>
              </>
            )}

            {/* Split Screen Snap Preview: Right Half */}
            {dragState.snapRegion === 'right' && (
              <>
                <div className="fixed right-0 top-0 bottom-[52px] w-1/2 bg-purple-600/25 border-2 border-purple-400 backdrop-blur-md rounded-l-3xl z-[1000000] flex flex-col items-center justify-center pointer-events-none shadow-[0_0_60px_rgba(168,85,247,0.4)] animate-pulse">
                  <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-[#0e0c18]/85 border border-purple-400/40 backdrop-blur-2xl shadow-2xl max-w-sm text-center">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
                      <Columns size={26} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white tracking-wide">
                        Split Screen: Right Half
                      </div>
                      <div className="text-xs text-purple-200/80 mt-1">
                        Release to dock &ldquo;{dragState.tab.title || 'Tab'}&rdquo; on the right &amp; source window on the left
                      </div>
                    </div>
                  </div>
                </div>
                {/* Source Window Destination indicator on opposite half */}
                <div className="fixed left-0 top-0 bottom-[52px] w-1/2 bg-white/[0.03] border-2 border-dashed border-white/20 rounded-r-3xl z-[1000000] flex items-center justify-center pointer-events-none">
                  <span className="text-xs text-slate-300/80 bg-black/60 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                    Source Window will snap to Left Half
                  </span>
                </div>
              </>
            )}

            {/* Floating Dragged Tab Card following cursor */}
            <div
              className="fixed pointer-events-none z-[1000002] -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
              style={{ left: dragState.cursor.x, top: dragState.cursor.y }}
            >
              <div
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border backdrop-blur-2xl transition-all shadow-[0_15px_35px_rgba(0,0,0,0.6)] ${
                  dragState.snapRegion !== 'none'
                    ? 'bg-purple-900/90 border-purple-400/80 shadow-[0_0_30px_rgba(168,85,247,0.6)]'
                    : dragState.isOutside
                    ? 'bg-[#12101c]/95 border-emerald-400/70 shadow-[0_0_30px_rgba(16,185,129,0.35)] ring-2 ring-emerald-500/20'
                    : 'bg-[#14121a]/95 border-white/20'
                }`}
              >
                <BrandFavicon url={dragState.tab.url} title={dragState.tab.title} size={18} />
                <span className="text-xs font-semibold text-white max-w-[160px] truncate">
                  {dragState.tab.title || 'New Tab'}
                </span>

                {dragState.snapRegion !== 'none' ? (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/40">
                    Split {dragState.snapRegion}
                  </span>
                ) : dragState.isOutside ? (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 flex items-center gap-1">
                    <ExternalLink size={10} /> Separate Window
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">Drag out</span>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
      <ZenProxySuiteModal
        isOpen={showProxySuite}
        onClose={() => setShowProxySuite(false)}
        activeWisp={activeWisp}
        onWispChange={(url) => {
          setActiveWisp(url);
          handleReloadTab();
        }}
        currentHost={(() => {
          try {
            return activeTab?.url ? new URL(activeTab.url).hostname : 'godly-browser';
          } catch {
            return 'godly-browser';
          }
        })()}
        bookmarks={bookmarks}
        history={historyEntries}
        onRestoreBookmarks={(b) => setBookmarks(b)}
        onRestoreHistory={(h) => setHistoryEntries(h)}
      />
    </div>
  );
};

export const GodlyBrowserApp = ZenBrowserApp;
