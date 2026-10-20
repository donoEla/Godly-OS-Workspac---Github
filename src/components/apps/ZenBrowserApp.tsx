import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Globe,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Home,
  Plus,
  X,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Server,
  Zap,
  Star,
  Layers,
  Check,
  PanelLeftClose,
  PanelLeft,
  Compass,
  Bookmark,
  Volume2
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { getAssetUrl } from '../../utils/assetHelper';
import {
  initUvProxy,
  encodeUvUrl,
  getActiveWispUrl,
  setActiveWispUrl,
  WISP_ENDPOINTS,
  SEARCH_ENGINES,
  SearchEngineId,
  formatSearchOrUrl
} from '../../utils/uvProxy';

export interface ZenTab {
  id: string;
  title: string;
  url: string;
  displayUrl?: string;
  icon?: string;
  workspaceId: string;
  tunnelMode: 'uv' | 'direct';
  isLoading: boolean;
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

const DEFAULT_BOOKMARKS: ZenBookmark[] = [
  { id: 'ddg', title: 'DuckDuckGo', url: 'https://duckduckgo.com', category: 'Search' },
  { id: 'brave', title: 'Brave Search', url: 'https://search.brave.com', category: 'Search' },
  { id: 'google', title: 'Google', url: 'https://google.com', category: 'Search' },
  { id: 'youtube', title: 'YouTube', url: 'https://youtube.com', category: 'Media' },
  { id: 'github', title: 'GitHub', url: 'https://github.com', category: 'Dev' },
  { id: 'reddit', title: 'Reddit', url: 'https://reddit.com', category: 'Social' },
  { id: 'wikipedia', title: 'Wikipedia', url: 'https://wikipedia.org', category: 'Knowledge' },
  { id: 'twitch', title: 'Twitch', url: 'https://twitch.tv', category: 'Media' },
  { id: 'discord', title: 'Discord', url: 'https://discord.com', category: 'Social' },
  { id: 'streamflix', title: 'StreamFlix Cinema', url: 'https://watch.streamflix.one/', category: 'Media' },
  { id: 'octave', title: 'Octave Music', url: 'https://octavestreaming.com/', category: 'Media' },
  { id: 'nowgg', title: 'NowGG Cloud Games', url: 'https://nowgg.fun', category: 'Games' },
];

const WORKSPACES = [
  { id: 'personal', name: 'Personal', icon: '🔮' },
  { id: 'work', name: 'Work', icon: '💼' },
  { id: 'gaming', name: 'Gaming', icon: '🎮' },
  { id: 'privacy', name: 'Privacy', icon: '🔒' },
];

interface ZenBrowserAppProps {
  initialUrl?: string;
}

export const ZenBrowserApp: React.FC<ZenBrowserAppProps> = ({ initialUrl }) => {
  // Search Engine Preference (synced to localStorage)
  const [selectedEngine, setSelectedEngine] = useState<SearchEngineId>(() => {
    try {
      const saved = localStorage.getItem('godly_zen_engine');
      if (saved && (saved === 'duckduckgo' || saved === 'brave' || saved === 'google')) {
        return saved as SearchEngineId;
      }
      return 'duckduckgo';
    } catch {
      return 'duckduckgo';
    }
  });

  const [activeWorkspace, setActiveWorkspace] = useState('personal');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showEngineMenu, setShowEngineMenu] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [showWispMenu, setShowWispMenu] = useState(false);
  const [showBookmarksDrawer, setShowBookmarksDrawer] = useState(false);
  const [bookmarks, setBookmarks] = useState<ZenBookmark[]>(() => {
    try {
      const saved = localStorage.getItem('godly_zen_bookmarks');
      if (saved) return JSON.parse(saved);
      return DEFAULT_BOOKMARKS;
    } catch {
      return DEFAULT_BOOKMARKS;
    }
  });

  const [activeWisp, setActiveWisp] = useState<string>(getActiveWispUrl());
  const [ping, setPing] = useState(14);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);

  // Initial tabs state
  const [tabs, setTabs] = useState<ZenTab[]>(() => {
    const firstTabUrl = initialUrl || '';
    const initialTitle = firstTabUrl ? (firstTabUrl.replace(/^https?:\/\//i, '').split('/')[0] || 'Web Page') : 'New Tab';
    return [
      {
        id: 'tab-1',
        title: initialTitle,
        url: firstTabUrl,
        displayUrl: firstTabUrl,
        workspaceId: 'personal',
        tunnelMode: 'uv',
        isLoading: !!firstTabUrl,
        history: firstTabUrl ? [firstTabUrl] : [],
        historyIndex: firstTabUrl ? 0 : -1,
      },
    ];
  });

  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // Address bar input state
  const [omnibarInput, setOmnibarInput] = useState<string>(activeTab?.url || '');
  const [newTabSearchInput, setNewTabSearchInput] = useState<string>('');

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutTimerRef = useRef<number | null>(null);

  // Sync omnibar input when active tab changes
  useEffect(() => {
    if (activeTab) {
      setOmnibarInput(activeTab.url || '');
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

  // Initialize Ultraviolet Proxy
  useEffect(() => {
    initUvProxy().catch((err) => console.warn('[Zen Browser] UV Init note:', err));
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

  // Switch Wisp Relay
  const handleSelectWisp = async (wispUrl: string) => {
    sound.playClick();
    await setActiveWispUrl(wispUrl);
    setActiveWisp(wispUrl);
    setShowWispMenu(false);
    handleReloadTab();
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
  const handleCreateTab = (url = '', title = 'New Tab') => {
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
      history: url ? [url] : [],
      historyIndex: url ? 0 : -1,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
    setOmnibarInput(url);
  };

  // Close Tab
  const handleCloseTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    sound.playClick();
    if (tabs.length === 1) {
      // Don't close last tab, just reset to home
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
      setOmnibarInput('');
      return;
    }

    const nextTabs = tabs.filter((t) => t.id !== id);
    setTabs(nextTabs);
    if (activeTabId === id) {
      setActiveTabId(nextTabs[nextTabs.length - 1].id);
    }
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
        displayTitle = 'DuckDuckGo Search';
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

    setOmnibarInput(destinationUrl);
    setShowTroubleshoot(false);

    // Diagnostics timeout if slow or blocked
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
      if (activeTab.tunnelMode === 'direct') {
        const sep = activeTab.url.includes('?') ? '&' : '?';
        iframeRef.current.src = `${activeTab.url}${sep}_t=${Date.now()}`;
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
    setOmnibarInput(targetUrl);
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
    setOmnibarInput(targetUrl);
  };

  // Toggle Tab Tunnel Mode (UV Epoxy Proxy vs Direct Sandbox)
  const handleSetTabTunnelMode = (mode: 'uv' | 'direct') => {
    sound.playClick();
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, tunnelMode: mode, isLoading: true } : t))
    );
    setShowModeMenu(false);
    setShowTroubleshoot(false);
  };

  // Bookmark active tab
  const handleToggleBookmark = () => {
    sound.playClick();
    if (!activeTab || !activeTab.url) return;
    const exists = bookmarks.some((b) => b.url === activeTab.url);
    let updated: ZenBookmark[];
    if (exists) {
      updated = bookmarks.filter((b) => b.url !== activeTab.url);
    } else {
      updated = [
        ...bookmarks,
        {
          id: 'bm-' + Date.now(),
          title: activeTab.title || 'Saved Bookmark',
          url: activeTab.url,
          category: 'Personal',
        },
      ];
    }
    setBookmarks(updated);
    try {
      localStorage.setItem('godly_zen_bookmarks', JSON.stringify(updated));
    } catch {}
  };

  const isBookmarked = activeTab && bookmarks.some((b) => b.url === activeTab.url);

  // Search Engine metadata
  const currentEngineMeta = SEARCH_ENGINES[selectedEngine] || SEARCH_ENGINES.duckduckgo;

  // Frame source calculation
  const getComputedFrameSrc = () => {
    if (!activeTab || !activeTab.url) return '';
    if (activeTab.tunnelMode === 'direct') {
      return activeTab.url;
    }
    return encodeUvUrl(activeTab.url);
  };

  return (
    <div className="flex h-full w-full bg-[#0a0a10] text-slate-100 select-none overflow-hidden font-sans">
      {/* 1. Left Vertical Tab Sidebar (Zen Browser Signature Layout) */}
      <div
        className={`h-full flex flex-col bg-[#0c0d16]/95 backdrop-blur-2xl border-r border-white/[0.08] transition-all duration-300 z-30 flex-shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.5)] ${
          sidebarCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        {/* Sidebar Brand & Top Actions */}
        <div className="flex items-center justify-between p-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="relative w-8 h-8 rounded-xl overflow-hidden shadow-lg shadow-purple-600/30 border border-purple-400/40 flex-shrink-0 group">
              <img
                src={getAssetUrl('assets/icons/zen.jpg')}
                alt="Zen Browser"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 to-transparent pointer-events-none" />
            </div>

            {!sidebarCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm tracking-tight text-white font-mono">ZEN</span>
                  <span className="text-[10px] bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider">
                    Proxy
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono truncate">Divine Navigator</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                sound.playClick();
                setSidebarCollapsed(!sidebarCollapsed);
              }}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title={sidebarCollapsed ? 'Expand Vertical Tabs' : 'Collapse Vertical Tabs'}
            >
              {sidebarCollapsed ? <PanelLeft size={15} /> : <PanelLeftClose size={15} />}
            </button>
          </div>
        </div>

        {/* Workspaces Pill Selector */}
        {!sidebarCollapsed && (
          <div className="p-2 border-b border-white/[0.06]">
            <div className="flex items-center justify-between bg-black/40 rounded-xl p-1 border border-white/[0.08]">
              {WORKSPACES.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    sound.playClick();
                    setActiveWorkspace(ws.id);
                  }}
                  className={`flex-1 flex items-center justify-center py-1 rounded-lg text-xs transition-all ${
                    activeWorkspace === ws.id
                      ? 'bg-purple-600/30 text-white font-semibold shadow-sm border border-purple-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                  title={`Workspace: ${ws.name}`}
                >
                  <span className="text-xs mr-1">{ws.icon}</span>
                  <span className="text-[10px] font-mono truncate">{ws.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Vertical Tabs List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 flex flex-col gap-1 custom-scrollbar">
          {tabs
            .filter((t) => sidebarCollapsed || t.workspaceId === activeWorkspace || tabs.length <= 1)
            .map((tab) => {
              const isActive = tab.id === activeTabId;
              return (
                <div
                  key={tab.id}
                  onClick={() => {
                    sound.playClick();
                    setActiveTabId(tab.id);
                  }}
                  className={`group relative flex items-center gap-2.5 px-2.5 py-2 rounded-xl cursor-pointer transition-all border ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600/25 to-indigo-600/15 border-purple-500/40 text-white shadow-md'
                      : 'border-transparent text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'
                  }`}
                  title={tab.title}
                >
                  {/* Tab Icon */}
                  <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/5 border border-white/10 text-xs">
                    {tab.url ? (
                      tab.url.includes('duckduckgo') ? (
                        <span className="text-xs">🦆</span>
                      ) : tab.url.includes('brave') ? (
                        <span className="text-xs">🦁</span>
                      ) : tab.url.includes('google') ? (
                        <span className="text-xs font-bold text-blue-400">G</span>
                      ) : (
                        <Globe size={12} className="text-purple-400" />
                      )
                    ) : (
                      <Compass size={12} className="text-purple-300" />
                    )}
                  </div>

                  {/* Tab Title */}
                  {!sidebarCollapsed && (
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium truncate block font-sans">
                        {tab.title || 'New Tab'}
                      </span>
                    </div>
                  )}

                  {/* Close Tab Button */}
                  {!sidebarCollapsed && (
                    <button
                      onClick={(e) => handleCloseTab(e, tab.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-white/20 text-slate-400 hover:text-white transition-all flex-shrink-0"
                      title="Close Tab"
                    >
                      <X size={12} />
                    </button>
                  )}

                  {/* Active Indicator Bar */}
                  {isActive && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-purple-400 shadow-[0_0_8px_#a855f7]" />
                  )}
                </div>
              );
            })}

          {/* New Tab Button */}
          <button
            onClick={() => handleCreateTab()}
            className={`flex items-center gap-2 mt-1 px-2.5 py-2 rounded-xl border border-dashed border-white/15 text-slate-400 hover:text-white hover:border-purple-500/50 hover:bg-purple-500/10 transition-all ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            title="Open New Tab (Ctrl+T)"
          >
            <Plus size={14} className="text-purple-400 flex-shrink-0" />
            {!sidebarCollapsed && (
              <span className="text-xs font-medium font-mono">New Tab</span>
            )}
          </button>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-2 border-t border-white/[0.08] flex flex-col gap-1.5 bg-black/20">
          {/* Active Search Engine Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => {
                sound.playClick();
                setShowEngineMenu(!showEngineMenu);
                setShowWispMenu(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs transition-all ${
                sidebarCollapsed ? 'justify-center p-2' : ''
              }`}
              title={`Active Search Engine: ${currentEngineMeta.name}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm">
                  {selectedEngine === 'duckduckgo' ? '🦆' : selectedEngine === 'brave' ? '🦁' : '🌐'}
                </span>
                {!sidebarCollapsed && (
                  <div className="flex flex-col text-left truncate">
                    <span className="text-[11px] font-bold text-white font-mono truncate">
                      {currentEngineMeta.name}
                    </span>
                  </div>
                )}
              </div>
              {!sidebarCollapsed && <ChevronDown size={11} className="text-slate-400 ml-1" />}
            </button>

            {/* Engine Picker Popover */}
            {showEngineMenu && (
              <div className="absolute bottom-full left-0 mb-2 w-64 rounded-2xl bg-[#121422]/95 backdrop-blur-2xl border border-purple-500/30 p-2 shadow-2xl z-50 flex flex-col gap-1 font-sans">
                <div className="px-2 py-1 text-[10px] font-mono uppercase text-purple-300 font-bold tracking-wider border-b border-white/10 flex items-center justify-between">
                  <span>Default Search Engine</span>
                  <Sparkles size={11} className="text-purple-400" />
                </div>
                {(Object.keys(SEARCH_ENGINES) as SearchEngineId[]).map((eId) => {
                  const item = SEARCH_ENGINES[eId];
                  const isCur = selectedEngine === eId;
                  return (
                    <button
                      key={eId}
                      onClick={() => handleSelectEngine(eId)}
                      className={`flex items-start gap-2.5 p-2 rounded-xl text-left transition-all ${
                        isCur
                          ? 'bg-purple-600/25 border border-purple-500/40 text-white'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white border border-transparent'
                      }`}
                    >
                      <span className="text-base mt-0.5">
                        {eId === 'duckduckgo' ? '🦆' : eId === 'brave' ? '🦁' : '🌐'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{item.name}</span>
                          {isCur && <Check size={12} className="text-purple-400" />}
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                          {item.tagline}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bookmarks Toggle & Wisp Status */}
          {!sidebarCollapsed && (
            <div className="flex items-center justify-between px-1 text-[10px] font-mono text-slate-400">
              <button
                onClick={() => {
                  sound.playClick();
                  setShowBookmarksDrawer(!showBookmarksDrawer);
                }}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <Bookmark size={11} className={showBookmarksDrawer ? 'text-purple-400' : ''} />
                <span>Bookmarks</span>
              </button>
              <div className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{ping}ms</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Browser Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#07070b] relative">
        {/* Floating Omnibar Navigation Bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#0d0f1a]/95 backdrop-blur-2xl border-b border-white/[0.08] gap-2 flex-shrink-0 z-20 shadow-md">
          {/* History Controls */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={handleHistoryBack}
              disabled={!activeTab || activeTab.historyIndex <= 0}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
              title="Back"
            >
              <ArrowLeft size={14} />
            </button>
            <button
              onClick={handleHistoryForward}
              disabled={!activeTab || activeTab.historyIndex >= activeTab.history.length - 1}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
              title="Forward"
            >
              <ArrowRight size={14} />
            </button>
            <button
              onClick={handleReloadTab}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-all"
              title="Reload (Ctrl+R)"
            >
              <RotateCcw
                size={14}
                className={activeTab?.isLoading ? 'animate-spin text-purple-400' : ''}
              />
            </button>
            <button
              onClick={() => {
                sound.playClick();
                handleNavigate('');
              }}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-all"
              title="Zen Home"
            >
              <Home size={14} />
            </button>
          </div>

          {/* Center Floating Omnibar Pill */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleNavigate(omnibarInput);
            }}
            className="flex-1 max-w-2xl mx-1"
          >
            <div className="w-full flex items-center bg-black/60 border border-white/15 focus-within:border-purple-500/80 rounded-2xl px-3 py-1.5 shadow-inner gap-2 transition-all">
              {/* Engine Selector Dropdown Pill */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEngineMenu(!showEngineMenu)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all font-mono"
                  title="Change Search Engine"
                >
                  <span>
                    {selectedEngine === 'duckduckgo' ? '🦆' : selectedEngine === 'brave' ? '🦁' : '🌐'}
                  </span>
                  <span className="hidden sm:inline text-[11px] font-semibold">{currentEngineMeta.name}</span>
                  <ChevronDown size={10} className="text-slate-400" />
                </button>
              </div>

              {/* Padlock / Security Status */}
              <ShieldCheck size={13} className="text-emerald-400 flex-shrink-0" />

              {/* Omnibar Input */}
              <input
                type="text"
                value={omnibarInput}
                onChange={(e) => setOmnibarInput(e.target.value)}
                placeholder={`Search with ${currentEngineMeta.name} or type URL...`}
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 outline-none font-mono tracking-tight"
              />

              {/* Clear / Bookmark / Submit */}
              {omnibarInput && (
                <button
                  type="button"
                  onClick={() => setOmnibarInput('')}
                  className="p-1 rounded-md text-slate-400 hover:text-white transition-colors"
                >
                  <X size={12} />
                </button>
              )}

              <button
                type="button"
                onClick={handleToggleBookmark}
                className={`p-1 rounded-md transition-colors ${
                  isBookmarked ? 'text-amber-400' : 'text-slate-400 hover:text-amber-300'
                }`}
                title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Page'}
              >
                <Star size={13} fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>

              <button
                type="submit"
                className="p-1 px-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-semibold font-mono transition-all flex items-center gap-1"
              >
                <Search size={11} />
                <span className="hidden md:inline">Go</span>
              </button>
            </div>
          </form>

          {/* Right Toolbar Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Mode Selector Pill (UV Epoxy vs Direct) */}
            <div className="relative">
              <button
                onClick={() => {
                  sound.playClick();
                  setShowModeMenu(!showModeMenu);
                  setShowWispMenu(false);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[11px] font-mono transition-all ${
                  activeTab?.tunnelMode === 'direct'
                    ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                    : 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300'
                }`}
                title="Proxy Pipeline Engine"
              >
                <Zap size={11} />
                <span className="hidden sm:inline font-semibold">
                  {activeTab?.tunnelMode === 'direct' ? 'Direct Sandbox' : 'UV Proxy'}
                </span>
                <ChevronDown size={9} />
              </button>

              {showModeMenu && (
                <div className="absolute top-full right-0 mt-1.5 w-56 rounded-2xl bg-[#10121d]/95 backdrop-blur-2xl border border-white/15 shadow-2xl p-1.5 z-50 flex flex-col gap-1">
                  <div className="px-2.5 py-1 text-[10px] font-mono uppercase text-slate-400 font-bold border-b border-white/10">
                    Proxy Routing Mode
                  </div>
                  <button
                    onClick={() => handleSetTabTunnelMode('uv')}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-left transition-all ${
                      activeTab?.tunnelMode === 'uv'
                        ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 font-semibold'
                        : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div>
                      <div className="font-medium">Ultraviolet Proxy</div>
                      <div className="text-[9px] text-slate-400">Wisp WebSocket Tunnel</div>
                    </div>
                    {activeTab?.tunnelMode === 'uv' && <Check size={12} className="text-emerald-400" />}
                  </button>

                  <button
                    onClick={() => handleSetTabTunnelMode('direct')}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-left transition-all ${
                      activeTab?.tunnelMode === 'direct'
                        ? 'bg-blue-500/20 text-blue-200 border border-blue-500/40 font-semibold'
                        : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div>
                      <div className="font-medium">Direct Sandbox</div>
                      <div className="text-[9px] text-slate-400">Zero overhead (no SW)</div>
                    </div>
                    {activeTab?.tunnelMode === 'direct' && <Check size={12} className="text-blue-400" />}
                  </button>
                </div>
              )}
            </div>

            {/* Wisp Relay Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  sound.playClick();
                  setShowWispMenu(!showWispMenu);
                  setShowModeMenu(false);
                }}
                className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-300 hover:text-white transition-all"
                title="Wisp WebSocket Server"
              >
                <Server size={13} className="text-purple-400" />
              </button>

              {showWispMenu && (
                <div className="absolute top-full right-0 mt-1.5 w-60 rounded-2xl bg-[#10121d]/95 backdrop-blur-2xl border border-white/15 shadow-2xl p-1.5 z-50 flex flex-col gap-1">
                  <div className="px-2.5 py-1 text-[10px] font-mono uppercase text-slate-400 font-bold border-b border-white/10">
                    Wisp WebSocket Relay
                  </div>
                  {WISP_ENDPOINTS.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => handleSelectWisp(w.url)}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-left transition-all ${
                        activeWisp === w.url
                          ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 font-semibold'
                          : 'text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{w.name}</div>
                        <div className="text-[9px] text-slate-500 font-mono truncate max-w-[130px]">{w.url}</div>
                      </div>
                      <span className="text-[9px] text-emerald-400 font-mono">{w.region.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Smart Diagnostics Trigger */}
            <button
              onClick={() => {
                sound.playClick();
                setShowTroubleshoot(!showTroubleshoot);
              }}
              className={`p-1.5 rounded-xl border transition-all ${
                showTroubleshoot
                  ? 'bg-purple-600/30 border-purple-500/50 text-purple-300'
                  : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/10 text-slate-300 hover:text-white'
              }`}
              title="Connection Diagnostics & Fallbacks"
            >
              <Sparkles size={13} />
            </button>

            {/* External Window */}
            {activeTab?.url && (
              <button
                onClick={() => {
                  sound.playClick();
                  window.open(activeTab.url, '_blank');
                }}
                className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-300 hover:text-white transition-all"
                title="Open in new browser tab"
              >
                <ExternalLink size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Bookmarks Bar Drawer (Optional dropdown/drawer) */}
        {showBookmarksDrawer && (
          <div className="px-3 py-1.5 bg-[#0d0f1a]/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center gap-2 overflow-x-auto z-10 custom-scrollbar">
            <span className="text-[10px] font-mono text-purple-300 font-bold uppercase mr-1">Favorites:</span>
            {bookmarks.map((bm) => (
              <button
                key={bm.id}
                onClick={() => {
                  sound.playClick();
                  handleNavigate(bm.url);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-xs text-slate-200 hover:text-white transition-all flex-shrink-0"
              >
                <Globe size={11} className="text-purple-400" />
                <span className="truncate max-w-[120px] font-sans">{bm.title}</span>
              </button>
            ))}
          </div>
        )}

        {/* Viewport: Either Zen New Tab Page or Proxied Frame */}
        <div className="flex-1 relative overflow-hidden bg-[#07070b]">
          {/* Top Loading Progress Line */}
          {activeTab?.isLoading && (
            <div className="absolute top-0 left-0 right-0 h-[2px] z-30 pointer-events-none overflow-hidden bg-white/5">
              <div className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-emerald-400 animate-[loading-bar_1.2s_ease-in-out_infinite]" />
            </div>
          )}

          {!activeTab?.url ? (
            /* ======================================================== */
            /* ZEN BROWSER SPEED DIAL / NEW TAB DASHBOARD (THE ZEN HOME) */
            /* ======================================================== */
            <div className="h-full w-full overflow-y-auto flex flex-col items-center justify-between p-6 sm:p-10 relative">
              {/* Ambient Glowing Background Aura */}
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-purple-600/15 via-indigo-600/10 to-transparent rounded-full blur-[110px] pointer-events-none" />

              <div className="w-full max-w-3xl flex flex-col items-center my-auto z-10">
                {/* Zen Logo & Heading */}
                <div className="flex flex-col items-center mb-8 text-center animate-in fade-in duration-500">
                  <div className="relative w-20 h-20 rounded-3xl overflow-hidden shadow-2xl shadow-purple-600/40 border border-purple-400/50 mb-4 p-0.5 bg-gradient-to-tr from-purple-500 via-indigo-500 to-cyan-400">
                    <img
                      src={getAssetUrl('assets/icons/zen.jpg')}
                      alt="Zen Browser"
                      className="w-full h-full object-cover rounded-[22px]"
                    />
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
                    Zen Browser
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md">
                    Calm, private, and proxy-powered browsing with multi-engine search.
                  </p>
                </div>

                {/* Search Engine Selector Pills */}
                <div className="flex items-center gap-2 mb-3 bg-black/40 backdrop-blur-xl p-1 rounded-2xl border border-white/10 shadow-lg">
                  {(Object.keys(SEARCH_ENGINES) as SearchEngineId[]).map((eId) => {
                    const engine = SEARCH_ENGINES[eId];
                    const isSelected = selectedEngine === eId;
                    return (
                      <button
                        key={eId}
                        onClick={() => handleSelectEngine(eId)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all ${
                          isSelected
                            ? 'bg-purple-600/35 text-white border border-purple-500/50 shadow-md'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
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

                {/* Central Zen Omnibar Search Input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleNavigate(newTabSearchInput);
                  }}
                  className="w-full relative mb-8"
                >
                  <div className="relative flex items-center bg-[#101322]/90 backdrop-blur-2xl border border-purple-500/40 hover:border-purple-500/70 focus-within:border-purple-400 focus-within:shadow-[0_0_30px_rgba(168,85,247,0.25)] rounded-3xl px-5 py-3.5 shadow-2xl transition-all">
                    <Search size={18} className="text-purple-400 mr-3 flex-shrink-0" />
                    <input
                      type="text"
                      value={newTabSearchInput}
                      onChange={(e) => setNewTabSearchInput(e.target.value)}
                      placeholder={`Search with ${currentEngineMeta.name} or type web address...`}
                      autoFocus
                      className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 outline-none font-sans"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold font-mono tracking-wider uppercase shadow-lg shadow-purple-600/30 transition-all flex items-center gap-1.5 flex-shrink-0 ml-2"
                    >
                      <span>Search</span>
                    </button>
                  </div>
                </form>

                {/* Curated Speed Dial Tiles */}
                <div className="w-full">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider">
                      Speed Dial & Hubs
                    </span>
                    <span className="text-[11px] text-purple-400 font-mono">
                      Proxy: Ultraviolet + Epoxy 101
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                    {bookmarks.slice(0, 12).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          sound.playClick();
                          handleNavigate(item.url);
                        }}
                        className="group flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.12] border border-white/[0.08] hover:border-purple-500/40 shadow-md transition-all hover:scale-105"
                      >
                        <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center mb-2 group-hover:border-purple-400/50 transition-colors">
                          {item.url.includes('duckduckgo') ? (
                            <span className="text-xl">🦆</span>
                          ) : item.url.includes('brave') ? (
                            <span className="text-xl">🦁</span>
                          ) : item.url.includes('google') ? (
                            <span className="text-lg font-bold text-blue-400">G</span>
                          ) : item.url.includes('youtube') ? (
                            <span className="text-lg text-red-500 font-bold">▶</span>
                          ) : item.url.includes('github') ? (
                            <span className="text-lg text-white font-bold">⌨</span>
                          ) : (
                            <Globe size={18} className="text-purple-400" />
                          )}
                        </div>
                        <span className="text-xs font-medium text-slate-200 group-hover:text-white truncate max-w-full font-sans">
                          {item.title}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono truncate max-w-full">
                          {item.category}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Network Status Ribbon */}
              <div className="w-full max-w-2xl mt-8 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400 font-mono z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  <span>Wisp Tunnel: Connected ({ping}ms)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>Engine: {currentEngineMeta.name}</span>
                  <span>•</span>
                  <span>Relay: Mercury Workshop</span>
                </div>
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* PROXIED VIEWPORT EMBED (ULTRAVIOLET / DIRECT SANDBOX)    */
            /* ======================================================== */
            <div className="w-full h-full relative">
              <iframe
                ref={iframeRef}
                src={getComputedFrameSrc()}
                onLoad={() => {
                  setTabs((prev) =>
                    prev.map((t) => (t.id === activeTabId ? { ...t, isLoading: false } : t))
                  );
                }}
                className="w-full h-full border-none block bg-transparent"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-downloads"
              />

              {/* Floating Smart Recovery Helper (Fixes Black Screen Feedback) */}
              {showTroubleshoot && (
                <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 rounded-2xl bg-[#0f121ecc]/95 backdrop-blur-2xl border border-purple-500/30 p-3.5 shadow-2xl z-40 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 text-purple-300 font-semibold font-mono">
                      <Sparkles size={13} className="text-purple-400" />
                      <span>Zen Proxy Diagnostics</span>
                    </div>
                    <button
                      onClick={() => setShowTroubleshoot(false)}
                      className="text-slate-400 hover:text-white px-1.5 py-0.5 rounded-lg text-xs"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-300 mb-3 leading-relaxed font-sans">
                    Black screen or slow page? If your host restricts service workers, switch to direct sandbox or alternate Wisp relay:
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleSetTabTunnelMode('direct')}
                      className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-blue-600/25 hover:bg-blue-600/40 border border-blue-500/40 text-blue-200 font-mono text-[11px] font-semibold transition-all"
                    >
                      <Zap size={12} className="text-blue-400" />
                      Direct Sandbox
                    </button>
                    <button
                      onClick={handleCycleWisp}
                      className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-purple-600/25 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 font-mono text-[11px] font-semibold transition-all"
                    >
                      <Server size={12} className="text-purple-400" />
                      Next Wisp Relay
                    </button>
                    <button
                      onClick={() => handleNavigate('https://duckduckgo.com')}
                      className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-amber-600/25 hover:bg-amber-600/40 border border-amber-500/40 text-amber-200 font-mono text-[11px] font-semibold transition-all"
                    >
                      <span className="text-xs">🦆</span>
                      DuckDuckGo
                    </button>
                    <button
                      onClick={() => {
                        sound.playClick();
                        window.open(activeTab.url, '_blank');
                      }}
                      className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 font-mono text-[11px] font-semibold transition-all"
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

        {/* Bottom Status Bar */}
        <div className="px-3 py-1 bg-[#0b0c14]/90 backdrop-blur-xl border-t border-white/[0.08] flex items-center justify-between text-[11px] text-slate-400 font-mono flex-shrink-0">
          <div className="flex items-center gap-2 truncate">
            <span className="text-purple-400 font-semibold">
              {activeTab?.tunnelMode === 'direct' ? 'Direct Sandbox:' : 'Ultraviolet 2.0:'}
            </span>
            <span className="truncate text-slate-300">
              {activeTab?.url || 'Zen Start Page (Multi-Engine)'}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-slate-400">Search Engine: {currentEngineMeta.name}</span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Wisp Active ({ping}ms)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
