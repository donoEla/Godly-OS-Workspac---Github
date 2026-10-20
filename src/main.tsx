import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Ensure clean proxy pass-through to Vite backend by removing legacy root SW
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const reg of registrations) {
      if (!reg.scope.includes('/uv/')) {
        reg.unregister().then((success) => {
          if (success) console.log('[Godly OS] Unregistered legacy SW at scope:', reg.scope);
        });
      }
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
