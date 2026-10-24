import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
// Safe storage fallback for sandboxed iframes, null origins, and private browsing modes
if (typeof window !== 'undefined') {
  (window as any).maeExportApis_ = () => {};
  try {
    const probe = '__godly_probe__';
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
  } catch (e) {
    const memoryStore: Record<string, string> = {};
    const safeStore = {
      getItem: (k: string) => (Object.prototype.hasOwnProperty.call(memoryStore, k) ? memoryStore[k] : null),
      setItem: (k: string, v: string) => { memoryStore[k] = String(v); },
      removeItem: (k: string) => { delete memoryStore[k]; },
      clear: () => { for (const k in memoryStore) delete memoryStore[k]; },
      key: (i: number) => Object.keys(memoryStore)[i] || null,
      get length() { return Object.keys(memoryStore).length; },
    };
    try {
      Object.defineProperty(window, 'localStorage', {
        value: safeStore,
        configurable: true,
        enumerable: true,
        writable: true,
      });
    } catch {}
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
