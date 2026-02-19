// Service Worker para notificaciones push

const CACHE_NAME = "barber-saas-v1";
const urlsToCache = [
    "/",
    "/offline.html",
];

// Instalación del Service Worker
self.addEventListener("install", (event) => {
    console.log("[SW] Installing...");

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("[SW] Caching files");
            return cache.addAll(urlsToCache);
        })
    );

    self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener("activate", (event) => {
    console.log("[SW] Activating...");

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log("[SW] Deleting old cache:", cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

// Interceptar solicitudes de red
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // Devolver desde caché si existe, sino hacer petición de red
            return response || fetch(event.request);
        }).catch(() => {
            // Si falla todo, mostrar página offline
            if (event.request.mode === "navigate") {
                return caches.match("/offline.html");
            }
        })
    );
});

// Manejar notificaciones push
self.addEventListener("push", (event) => {
    console.log("[SW] Push received:", event);

    const data = event.data ? event.data.json() : {};

    const options = {
        body: data.body || "Tienes una nueva notificación",
        icon: data.icon || "/icon-192x192.png",
        badge: data.badge || "/badge-72x72.png",
        tag: data.tag || "default-tag",
        data: data.data || {},
        actions: data.actions || [],
        vibrate: [200, 100, 200],
        requireInteraction: false,
    };

    event.waitUntil(
        self.registration.showNotification(data.title || "Barbershop", options)
    );
});

// Manejar clicks en notificaciones
self.addEventListener("notificationclick", (event) => {
    console.log("[SW] Notification click:", event);

    event.notification.close();

    const urlToOpen = event.notification.data?.url || "/";

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
            // Buscar si ya hay una ventana abierta
            for (const client of clientList) {
                if (client.url === urlToOpen && "focus" in client) {
                    return client.focus();
                }
            }

            // Si no, abrir nueva ventana
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// Manejar cierre de notificaciones
self.addEventListener("notificationclose", (event) => {
    console.log("[SW] Notification closed:", event);
});
