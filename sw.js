// Service Worker for Ahmed M. Abdelmoneim Portfolio
// Version 1.0.0

const CACHE_NAME = 'ahmed-portfolio-v1.0';
const STATIC_CACHE = 'static-cache-v1.0';
const DYNAMIC_CACHE = 'dynamic-cache-v1.0';

// Assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/script-optimized.js',
    '/manifest.json',
    '/Ahmed_M__Abdelmoneim.pdf',
    // Local images
    '/Pictures/profile.jpg',
    '/Pictures/1.jpg',
    '/Pictures/2.jpg',
    '/Pictures/3.jpg',
    '/Pictures/4.jpg',
    '/Pictures/5.jpg',
    '/Pictures/6.jpg',
    '/Pictures/7.jpg',
    '/Pictures/8.jpg',
    '/Pictures/9.jpg',
    '/Pictures/10.jpg',
    '/Pictures/11.jpg'
];

// External resources to cache dynamically
const EXTERNAL_ASSETS = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://fonts.gstatic.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Install Service Worker
self.addEventListener('install', event => {
    console.log('[SW] Installing Service Worker v1.0');
    event.waitUntil(
        Promise.all([
            caches.open(STATIC_CACHE).then(cache => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            }),
            caches.open(DYNAMIC_CACHE).then(cache => {
                console.log('[SW] Pre-caching external assets');
                return cache.addAll(EXTERNAL_ASSETS.map(url => new Request(url, { mode: 'cors' })))
                    .catch(err => console.log('[SW] External assets pre-cache failed:', err));
            })
        ])
    );
    self.skipWaiting(); // Force activation
});

// Activate Service Worker
self.addEventListener('activate', event => {
    console.log('[SW] Activating Service Worker v1.0');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE) {
                        console.log('[SW] Clearing old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => {
            console.log('[SW] Service Worker activated and controlling all pages');
            return self.clients.claim();
        })
    );
});

// Fetch Event - Network First with Cache Fallback
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip Chrome extensions and dev tools
    if (url.protocol === 'chrome-extension:' || url.protocol === 'devtools:') return;

    // Handle different resource types
    if (isStaticAsset(request)) {
        // Static assets: Cache First strategy
        event.respondWith(cacheFirst(request));
    } else if (isExternalAsset(request)) {
        // External assets: Stale While Revalidate
        event.respondWith(staleWhileRevalidate(request));
    } else if (isHTMLRequest(request)) {
        // HTML pages: Network First with cache fallback
        event.respondWith(networkFirst(request));
    } else {
        // Other requests: Network with cache fallback
        event.respondWith(networkWithCacheFallback(request));
    }
});

// Cache Strategies
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.status === 200) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('[SW] Cache first failed:', error);
        return new Response('Offline content unavailable', { status: 503 });
    }
}

async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('[SW] Network first fallback to cache:', error);
        const cachedResponse = await caches.match(request);
        return cachedResponse || new Response('Offline', { 
            status: 503, 
            statusText: 'Offline' 
        });
    }
}

async function staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(() => cachedResponse);
    
    return cachedResponse || fetchPromise;
}

async function networkWithCacheFallback(request) {
    try {
        const networkResponse = await fetch(request);
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        return cachedResponse || new Response('Offline', { status: 503 });
    }
}

// Helper functions
function isStaticAsset(request) {
    const url = new URL(request.url);
    return STATIC_ASSETS.some(asset => url.pathname === asset) ||
           url.pathname.startsWith('/Pictures/') ||
           url.pathname.endsWith('.css') ||
           url.pathname.endsWith('.js') ||
           url.pathname.endsWith('.pdf');
}

function isExternalAsset(request) {
    const url = new URL(request.url);
    return url.origin !== self.location.origin &&
           (url.hostname.includes('googleapis.com') ||
            url.hostname.includes('gstatic.com') ||
            url.hostname.includes('cdnjs.cloudflare.com'));
}

function isHTMLRequest(request) {
    return request.headers.get('accept').includes('text/html');
}

// Background Sync for offline form submissions
self.addEventListener('sync', event => {
    console.log('[SW] Background sync event:', event.tag);
    
    if (event.tag === 'contact-form-sync') {
        event.waitUntil(syncContactForm());
    }
});

async function syncContactForm() {
    try {
        // Get pending form submissions from IndexedDB
        console.log('[SW] Syncing offline form submissions');
        // Implementation would depend on your form handling
        return Promise.resolve();
    } catch (error) {
        console.error('[SW] Form sync failed:', error);
        throw error;
    }
}

// Push notification handler
self.addEventListener('push', event => {
    console.log('[SW] Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'Portfolio update available',
        icon: '/Pictures/profile.jpg',
        badge: '/Pictures/profile.jpg',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 'portfolio-update'
        },
        actions: [
            {
                action: 'view',
                title: 'View Portfolio',
                icon: '/Pictures/profile.jpg'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/Pictures/profile.jpg'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Ahmed Portfolio Update', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
    console.log('[SW] Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Cache cleanup on quota exceeded
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'CACHE_CLEANUP') {
        event.waitUntil(cleanupCaches());
    }
});

async function cleanupCaches() {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => 
        name !== STATIC_CACHE && name !== DYNAMIC_CACHE
    );
    
    return Promise.all(
        oldCaches.map(cache => caches.delete(cache))
    );
}
