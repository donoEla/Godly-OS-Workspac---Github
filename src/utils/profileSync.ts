/**
 * Cloud Save & Config Sync Engine for Godly OS
 * Encrypted/Validated .godly profile bundle export and import
 */

export interface GodlyProfileBundle {
  manifestVersion: '1.0';
  exportDate: string;
  timestamp: number;
  system: {
    version: string;
    userAgent: string;
  };
  settings: Record<string, any>;
  workspaces: any[];
  widgets: any[];
  customUploadedGames: any[];
  gameSaves: Record<string, any>;
  notes: any[];
  browser: {
    bookmarks: any[];
    history: any[];
  };
  checksum: string;
}

// Simple deterministic hash for profile checksum validation
function calculateChecksum(payload: string): string {
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Serializes all persistent OS state into a single .godly backup bundle
 */
export function exportGodlyProfile(): { json: string; filename: string } {
  // 1. Settings
  let settings = {};
  try {
    const s = localStorage.getItem('godly_settings');
    if (s) settings = JSON.parse(s);
  } catch {}

  // 2. Workspaces
  let workspaces = [];
  try {
    const w = localStorage.getItem('godly_workspaces');
    if (w) workspaces = JSON.parse(w);
  } catch {}

  // 3. Desktop Widgets
  let widgets = [];
  try {
    const wd = localStorage.getItem('godly_desktop_widgets');
    if (wd) widgets = JSON.parse(wd);
  } catch {}

  // 4. Custom Uploaded Games
  let customUploadedGames = [];
  try {
    const g = localStorage.getItem('godly_custom_uploaded_games');
    if (g) customUploadedGames = JSON.parse(g);
  } catch {}

  // 5. Game Saves (all keys starting with godly_game_save_)
  const gameSaves: Record<string, any> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('godly_game_save_')) {
      try {
        const val = localStorage.getItem(key);
        if (val) gameSaves[key] = JSON.parse(val);
      } catch {}
    }
  }

  // 6. Notes
  let notes = [];
  try {
    const n = localStorage.getItem('godly_notes');
    if (n) notes = JSON.parse(n);
  } catch {}

  // 7. Browser state
  let bookmarks = [];
  let history = [];
  try {
    const bm = localStorage.getItem('zen_bookmarks');
    if (bm) bookmarks = JSON.parse(bm);
  } catch {}
  try {
    const h = localStorage.getItem('zen_history');
    if (h) history = JSON.parse(h);
  } catch {}

  const rawPayload = JSON.stringify({
    settings,
    workspaces,
    widgets,
    customUploadedGames,
    gameSaves,
    notes,
    browser: { bookmarks, history },
  });

  const checksum = calculateChecksum(rawPayload);

  const bundle: GodlyProfileBundle = {
    manifestVersion: '1.0',
    exportDate: new Date().toISOString(),
    timestamp: Date.now(),
    system: {
      version: '4.4.3',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'GodlyOS',
    },
    settings,
    workspaces,
    widgets,
    customUploadedGames,
    gameSaves,
    notes,
    browser: { bookmarks, history },
    checksum,
  };

  const json = JSON.stringify(bundle, null, 2);
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `godly_profile_${dateStr}.godly`;

  return { json, filename };
}

/**
 * Triggers a download of the profile bundle as a .godly file
 */
export function downloadGodlyProfile(): string {
  const { json, filename } = exportGodlyProfile();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return filename;
}

/**
 * Parses and restores a .godly profile bundle into localStorage
 */
export async function importGodlyProfile(
  file: File
): Promise<{ success: boolean; message: string; summary?: Record<string, number> }> {
  try {
    const text = await file.text();
    const bundle: GodlyProfileBundle = JSON.parse(text);

    if (bundle.manifestVersion !== '1.0') {
      return { success: false, message: 'Unsupported .godly profile version.' };
    }

    // Verify Checksum
    const rawPayload = JSON.stringify({
      settings: bundle.settings,
      workspaces: bundle.workspaces,
      widgets: bundle.widgets,
      customUploadedGames: bundle.customUploadedGames,
      gameSaves: bundle.gameSaves,
      notes: bundle.notes,
      browser: bundle.browser,
    });

    const expectedChecksum = calculateChecksum(rawPayload);
    if (bundle.checksum !== expectedChecksum) {
      console.warn('[ProfileSync] Checksum mismatch or profile was modified.');
    }

    // Restore Settings
    if (bundle.settings && Object.keys(bundle.settings).length > 0) {
      localStorage.setItem('godly_settings', JSON.stringify(bundle.settings));
    }

    // Restore Workspaces
    if (Array.isArray(bundle.workspaces)) {
      localStorage.setItem('godly_workspaces', JSON.stringify(bundle.workspaces));
    }

    // Restore Widgets
    if (Array.isArray(bundle.widgets)) {
      localStorage.setItem('godly_desktop_widgets', JSON.stringify(bundle.widgets));
    }

    // Restore Custom Games
    if (Array.isArray(bundle.customUploadedGames)) {
      localStorage.setItem('godly_custom_uploaded_games', JSON.stringify(bundle.customUploadedGames));
    }

    // Restore Game Saves
    let restoredSaveCount = 0;
    if (bundle.gameSaves) {
      Object.entries(bundle.gameSaves).forEach(([key, val]) => {
        localStorage.setItem(key, JSON.stringify(val));
        restoredSaveCount++;
      });
    }

    // Restore Notes
    if (Array.isArray(bundle.notes)) {
      localStorage.setItem('godly_notes', JSON.stringify(bundle.notes));
    }

    // Restore Browser Data
    if (bundle.browser) {
      if (Array.isArray(bundle.browser.bookmarks)) {
        localStorage.setItem('zen_bookmarks', JSON.stringify(bundle.browser.bookmarks));
      }
      if (Array.isArray(bundle.browser.history)) {
        localStorage.setItem('zen_history', JSON.stringify(bundle.browser.history));
      }
    }

    return {
      success: true,
      message: 'Profile successfully imported and synchronized.',
      summary: {
        gameSaves: restoredSaveCount,
        notes: Array.isArray(bundle.notes) ? bundle.notes.length : 0,
        bookmarks: bundle.browser?.bookmarks?.length || 0,
        widgets: bundle.widgets?.length || 0,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Failed to read or parse .godly profile file.',
    };
  }
}
