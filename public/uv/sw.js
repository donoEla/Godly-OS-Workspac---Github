importScripts('uv.bundle.js');
importScripts('uv.config.js');
importScripts(__uv$config.sw || 'uv.sw.js');

const uv = new UVServiceWorker();
let config = {
    blocklist: new Set(),
};

async function handleRequest(event) {
    if (uv.route(event)) {
        if (config.blocklist.size !== 0) {
            try {
                let decodedUrl = new URL(__uv$config.decodeUrl(new URL(event.request.url).pathname.slice(__uv$config.prefix.length)));
                if (config.blocklist.has(decodedUrl.hostname)) {
                    return new Response("Blocked by Godly OS", { status: 404 });
                }
            } catch (e) {}
        }
        return await uv.fetch(event);
    }
    
    return await fetch(event.request);
}

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
    try {
        const bc = new BroadcastChannel("UvServiceWorker");
        bc.postMessage("Active");
    } catch (e) {}
});

self.addEventListener('fetch', (event) => {
    event.respondWith(handleRequest(event));
});

self.addEventListener("message", (event) => {
    if (event.data) {
        config = event.data;
    }
});