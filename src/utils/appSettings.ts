import { useState, useEffect, useCallback } from 'react';
import { BuiltInAppSettings, DEFAULT_APP_SETTINGS } from '../types/appSettings';

const STORAGE_KEY = 'godly_builtin_app_settings';
const EVENT_NAME = 'godly_app_settings_changed';

export function getAppSettings(): BuiltInAppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_APP_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      calculator: { ...DEFAULT_APP_SETTINGS.calculator, ...parsed.calculator },
      notes: { ...DEFAULT_APP_SETTINGS.notes, ...parsed.notes },
      zen: { ...DEFAULT_APP_SETTINGS.zen, ...parsed.zen },
      terminal: { ...DEFAULT_APP_SETTINGS.terminal, ...parsed.terminal },
      games: { ...DEFAULT_APP_SETTINGS.games, ...parsed.games },
    };
  } catch {
    return DEFAULT_APP_SETTINGS;
  }
}

export function saveAppSettings(newSettings: Partial<BuiltInAppSettings>) {
  try {
    const current = getAppSettings();
    const merged: BuiltInAppSettings = {
      calculator: { ...current.calculator, ...(newSettings.calculator || {}) },
      notes: { ...current.notes, ...(newSettings.notes || {}) },
      zen: { ...current.zen, ...(newSettings.zen || {}) },
      terminal: { ...current.terminal, ...(newSettings.terminal || {}) },
      games: { ...current.games, ...(newSettings.games || {}) },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: merged }));
    return merged;
  } catch (err) {
    console.warn('Failed to save app settings', err);
    return getAppSettings();
  }
}

export function useAppSettings(): [BuiltInAppSettings, (partial: Partial<BuiltInAppSettings>) => void] {
  const [settings, setSettings] = useState<BuiltInAppSettings>(getAppSettings);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<BuiltInAppSettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
      } else {
        setSettings(getAppSettings());
      }
    };

    window.addEventListener(EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const update = useCallback((partial: Partial<BuiltInAppSettings>) => {
    const updated = saveAppSettings(partial);
    setSettings(updated);
  }, []);

  return [settings, update];
}
