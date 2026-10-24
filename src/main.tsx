import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
// Compatibility shim for legacy Google Gadgets and iframe game embeds
if (typeof window !== 'undefined') {
  (window as any).maeExportApis_ = () => {};
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
