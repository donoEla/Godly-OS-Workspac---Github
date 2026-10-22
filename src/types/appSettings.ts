export interface BuiltInAppSettings {
  calculator: {
    angleMode: 'rad' | 'deg';
    defaultMode: 'standard' | 'scientific' | 'graphing';
    precision: number;
    soundEnabled: boolean;
  };
  notes: {
    fontFamily: string;
    fontSize: number;
    showLineNumbers: boolean;
    wordWrap: boolean;
    tabSize: number;
  };
  zen: {
    defaultSearchEngine: 'duckduckgo' | 'brave' | 'google';
    compactModeDefault: boolean;
    glanceEnabled: boolean;
    pinnedTabsVisible: boolean;
  };
  terminal: {
    theme: 'obsidian' | 'matrix' | 'cyberpunk' | 'amber';
    fontSize: number;
    cursorStyle: 'block' | 'underline' | 'bar';
    autoFetch: boolean;
  };
  games: {
    proxyBackend: 'direct' | 'wisp' | 'scramjet';
    showFps: boolean;
    smoothing: boolean;
  };
}

export const DEFAULT_APP_SETTINGS: BuiltInAppSettings = {
  calculator: {
    angleMode: 'rad',
    defaultMode: 'scientific',
    precision: 8,
    soundEnabled: true,
  },
  notes: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 14,
    showLineNumbers: true,
    wordWrap: true,
    tabSize: 2,
  },
  zen: {
    defaultSearchEngine: 'duckduckgo',
    compactModeDefault: false,
    glanceEnabled: true,
    pinnedTabsVisible: true,
  },
  terminal: {
    theme: 'obsidian',
    fontSize: 13,
    cursorStyle: 'block',
    autoFetch: true,
  },
  games: {
    proxyBackend: 'wisp',
    showFps: false,
    smoothing: true,
  },
};
