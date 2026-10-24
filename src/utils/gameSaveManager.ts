// Game Save State Manager for Godly OS Game Vault
// Serializes localStorage and IndexedDB namespaces into 3 persistent slots per game.

export interface GameSaveSlot {
  slotNumber: 1 | 2 | 3;
  timestamp: number;
  userNote: string;
  gameId: string;
  gameTitle: string;
  data: {
    localStorageData: Record<string, string>;
    indexedDBData?: Record<string, any>;
  };
}

export interface GameSaveManifest {
  gameId: string;
  gameTitle: string;
  updatedAt: number;
  slots: { [key: number]: GameSaveSlot };
}

const STORAGE_PREFIX = 'godly_game_save_';

export class GameSaveManager {
  private static getStorageKey(gameId: string): string {
    return `${STORAGE_PREFIX}${gameId}`;
  }

  public static getManifest(gameId: string): GameSaveManifest {
    try {
      const raw = localStorage.getItem(this.getStorageKey(gameId));
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('[GameSaveManager] Failed to read manifest', e);
    }
    return {
      gameId,
      gameTitle: gameId,
      updatedAt: Date.now(),
      slots: {}
    };
  }

  public static getSlots(gameId: string): GameSaveSlot[] {
    const manifest = this.getManifest(gameId);
    return [1, 2, 3].map((slotNum) => {
      return (
        manifest.slots[slotNum] || {
          slotNumber: slotNum as 1 | 2 | 3,
          timestamp: 0,
          userNote: 'Empty Slot',
          gameId,
          gameTitle: manifest.gameTitle,
          data: { localStorageData: {} }
        }
      );
    });
  }

  public static async captureGameLocalStorage(gameId: string): Promise<Record<string, string>> {
    const captured: Record<string, string> = {};
    const lowerId = gameId.toLowerCase();

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      // Capture keys associated with game or embedded domain
      if (
        key.toLowerCase().includes(lowerId) ||
        key.startsWith('ruffle_') ||
        key.startsWith('wasm_') ||
        key.startsWith('save_') ||
        key.startsWith('game_')
      ) {
        captured[key] = localStorage.getItem(key) || '';
      }
    }
    return captured;
  }

  public static async captureIndexedDB(): Promise<Record<string, any>> {
    const idbData: Record<string, any> = {};
    if (typeof indexedDB === 'undefined' || !indexedDB.databases) {
      return idbData;
    }
    try {
      const dbs = await indexedDB.databases();
      for (const dbInfo of dbs) {
        if (!dbInfo.name || dbInfo.name.startsWith('godly_')) continue;
        try {
          const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const req = indexedDB.open(dbInfo.name!, dbInfo.version);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
          });

          const dbStores: Record<string, any[]> = {};
          const storeNames = Array.from(db.objectStoreNames);
          if (storeNames.length > 0) {
            const tx = db.transaction(storeNames, 'readonly');
            for (const storeName of storeNames) {
              const store = tx.objectStore(storeName);
              const items = await new Promise<any[]>((resolve) => {
                const getReq = store.getAll();
                getReq.onsuccess = () => resolve(getReq.result || []);
                getReq.onerror = () => resolve([]);
              });
              dbStores[storeName] = items;
            }
          }
          idbData[dbInfo.name] = dbStores;
          db.close();
        } catch {}
      }
    } catch {}
    return idbData;
  }

  public static async saveSlot(
    gameId: string,
    gameTitle: string,
    slotNumber: 1 | 2 | 3,
    userNote: string
  ): Promise<GameSaveSlot> {
    const lsData = await this.captureGameLocalStorage(gameId);
    const idbData = await this.captureIndexedDB();

    const slot: GameSaveSlot = {
      slotNumber,
      timestamp: Date.now(),
      userNote: userNote.trim() || `Save Slot ${slotNumber}`,
      gameId,
      gameTitle,
      data: {
        localStorageData: lsData,
        indexedDBData: idbData
      }
    };

    const manifest = this.getManifest(gameId);
    manifest.gameTitle = gameTitle;
    manifest.updatedAt = Date.now();
    manifest.slots[slotNumber] = slot;

    localStorage.setItem(this.getStorageKey(gameId), JSON.stringify(manifest));
    return slot;
  }

  public static async loadSlot(gameId: string, slotNumber: 1 | 2 | 3): Promise<boolean> {
    const manifest = this.getManifest(gameId);
    const slot = manifest.slots[slotNumber];
    if (!slot || !slot.timestamp) {
      console.warn('[GameSaveManager] Slot is empty', slotNumber);
      return false;
    }

    try {
      // Restore LocalStorage entries
      if (slot.data && slot.data.localStorageData) {
        for (const [key, value] of Object.entries(slot.data.localStorageData)) {
          localStorage.setItem(key, value);
        }
      }

      // Restore IndexedDB entries if present
      if (slot.data && slot.data.indexedDBData) {
        for (const [dbName, stores] of Object.entries(slot.data.indexedDBData)) {
          try {
            const db = await new Promise<IDBDatabase>((resolve, reject) => {
              const req = indexedDB.open(dbName);
              req.onsuccess = () => resolve(req.result);
              req.onerror = () => reject(req.error);
            });
            for (const [storeName, items] of Object.entries(stores as Record<string, any[]>)) {
              if (db.objectStoreNames.contains(storeName)) {
                const tx = db.transaction(storeName, 'readwrite');
                const store = tx.objectStore(storeName);
                store.clear();
                for (const item of items) {
                  store.put(item);
                }
              }
            }
            db.close();
          } catch (e) {
            console.error('[GameSaveManager] Failed restoring IDB store', dbName, e);
          }
        }
      }
      return true;
    } catch (e) {
      console.error('[GameSaveManager] Failed restoring slot', e);
      return false;
    }
  }

  public static deleteSlot(gameId: string, slotNumber: 1 | 2 | 3): void {
    const manifest = this.getManifest(gameId);
    delete manifest.slots[slotNumber];
    manifest.updatedAt = Date.now();
    localStorage.setItem(this.getStorageKey(gameId), JSON.stringify(manifest));
  }

  public static exportSlotAsJson(gameId: string, slotNumber: 1 | 2 | 3): void {
    const manifest = this.getManifest(gameId);
    const slot = manifest.slots[slotNumber];
    if (!slot) return;

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(slot, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${gameId}_slot_${slotNumber}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  public static async importSlotFromJson(
    gameId: string,
    slotNumber: 1 | 2 | 3,
    file: File
  ): Promise<boolean> {
    try {
      const text = await file.text();
      const parsed: GameSaveSlot = JSON.parse(text);
      if (!parsed.data) {
        throw new Error('Invalid save slot structure');
      }

      parsed.slotNumber = slotNumber;
      parsed.gameId = gameId;

      const manifest = this.getManifest(gameId);
      manifest.slots[slotNumber] = parsed;
      manifest.updatedAt = Date.now();
      localStorage.setItem(this.getStorageKey(gameId), JSON.stringify(manifest));
      return true;
    } catch (e) {
      console.error('[GameSaveManager] Import failed', e);
      return false;
    }
  }
}
