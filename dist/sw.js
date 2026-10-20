// Godly OS Service Worker v3.0 - Auto Cleanup & Network Passthrough
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        await self.registration.unregister();
        console.log('[Godly OS] Root service worker self-unregistered');
      } catch (e) {}
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  // Never intercept /os-proxy or any assets - always pass through directly to network/server
  return;
});
