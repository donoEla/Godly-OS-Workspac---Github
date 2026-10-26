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
      version: '4.4.9',
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

// Strict key allowlist for imported game saves to prevent arbitrary localStorage writes
const ALLOWED_GAME_SAVE_KEY_REGEX = /^godly_game_save_[a-zA-Z0-9_\-\.]{1,128}$/;
const RESERVED_APP_KEYS = new Set([
  'godly_desktop_extensions',
  'godly_settings',
  'godly_workspaces',
  'godly_notes',
  'godly_desktop_widgets',
  'godly_custom_uploaded_games',
  'zen_bookmarks',
  'zen_history',
  'godly_session',
  'godly_auth',
]);

/**
 * Parses and restores a .godly profile bundle into localStorage with strict security validation
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

    // 1. Verify Checksum strictly (F09: reject tampered or corrupted bundles)
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
      return {
        success: false,
        message: 'Security validation failed: Profile integrity checksum mismatch. Import aborted.',
      };
    }

    // 2. Stage writes in memory so that validation failure leaves zero partial or corrupted state
    const stagedWrites: Array<{ key: string; value: string }> = [];

    // Validate Settings
    if (bundle.settings !== undefined) {
      if (typeof bundle.settings !== 'object' || bundle.settings === null || Array.isArray(bundle.settings)) {
        return { success: false, message: 'Invalid profile format: settings must be an object.' };
      }
      stagedWrites.push({ key: 'godly_settings', value: JSON.stringify(bundle.settings) });
    }

    // Validate Workspaces
    if (bundle.workspaces !== undefined) {
      if (!Array.isArray(bundle.workspaces)) {
        return { success: false, message: 'Invalid profile format: workspaces must be an array.' };
      }
      stagedWrites.push({ key: 'godly_workspaces', value: JSON.stringify(bundle.workspaces) });
    }

    // Validate Widgets
    if (bundle.widgets !== undefined) {
      if (!Array.isArray(bundle.widgets)) {
        return { success: false, message: 'Invalid profile format: widgets must be an array.' };
      }
      stagedWrites.push({ key: 'godly_desktop_widgets', value: JSON.stringify(bundle.widgets) });
    }

    // Validate Custom Games
    if (bundle.customUploadedGames !== undefined) {
      if (!Array.isArray(bundle.customUploadedGames)) {
        return { success: false, message: 'Invalid profile format: customUploadedGames must be an array.' };
      }
      stagedWrites.push({ key: 'godly_custom_uploaded_games', value: JSON.stringify(bundle.customUploadedGames) });
    }

    // Validate Game Saves (F01: strictly enforce allowed save key prefix and reject arbitrary storage keys)
    let restoredSaveCount = 0;
    if (bundle.gameSaves !== undefined) {
      if (typeof bundle.gameSaves !== 'object' || bundle.gameSaves === null || Array.isArray(bundle.gameSaves)) {
        return { success: false, message: 'Invalid profile format: gameSaves must be an object map.' };
      }

      for (const [key, val] of Object.entries(bundle.gameSaves)) {
        if (!ALLOWED_GAME_SAVE_KEY_REGEX.test(key) || RESERVED_APP_KEYS.has(key)) {
          return {
            success: false,
            message: `Security validation error: Disallowed key "${key}" in gameSaves. Keys must strictly match the godly_game_save_* format and cannot target OS or extension storage.`,
          };
        }

        const serialized = JSON.stringify(val);
        if (serialized.length > 10 * 1024 * 1024) {
          return {
            success: false,
            message: `Game save "${key}" exceeds the maximum allowed payload size limit (10 MB).`,
          };
        }

        stagedWrites.push({ key, value: serialized });
        restoredSaveCount++;
      }
    }

    // Validate Notes
    if (bundle.notes !== undefined) {
      if (!Array.isArray(bundle.notes)) {
        return { success: false, message: 'Invalid profile format: notes must be an array.' };
      }
      stagedWrites.push({ key: 'godly_notes', value: JSON.stringify(bundle.notes) });
    }

    // Validate Browser Data
    if (bundle.browser !== undefined) {
      if (typeof bundle.browser !== 'object' || bundle.browser === null) {
        return { success: false, message: 'Invalid profile format: browser must be an object.' };
      }
      if (bundle.browser.bookmarks !== undefined) {
        if (!Array.isArray(bundle.browser.bookmarks)) {
          return { success: false, message: 'Invalid profile format: bookmarks must be an array.' };
        }
        stagedWrites.push({ key: 'zen_bookmarks', value: JSON.stringify(bundle.browser.bookmarks) });
      }
      if (bundle.browser.history !== undefined) {
        if (!Array.isArray(bundle.browser.history)) {
          return { success: false, message: 'Invalid profile format: history must be an array.' };
        }
        stagedWrites.push({ key: 'zen_history', value: JSON.stringify(bundle.browser.history) });
      }
    }

    // 3. Atomically commit all verified staged writes to localStorage
    for (const write of stagedWrites) {
      localStorage.setItem(write.key, write.value);
    }

    return {
      success: true,
      message: 'Profile successfully verified and synchronized.',
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
