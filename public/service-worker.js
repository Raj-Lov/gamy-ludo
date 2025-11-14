const CACHE_VERSION = "gamy-ludo-v1";
const PRECACHE_URLS = ["/", "/dashboard", "/manifest.json", "/icons/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") {
    return;
  }

  if (new URL(request.url).pathname === "/dashboard") {
    event.respondWith(
      caches.open(CACHE_VERSION).then(async (cache) => {
        try {
          const networkResponse = await fetch(request);
          cache.put(request, networkResponse.clone());
          return networkResponse;
        } catch (error) {
          const cachedResponse = await cache.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          throw error;
        }
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  const payload = event.data.json();
  event.waitUntil(
    self.registration.showNotification(payload.title ?? "Gamy Ludo", {
      body: payload.body ?? "Stay sharp! New activity detected.",
      icon: "/icons/icon.svg",
      data: payload.data ?? {}
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  const targetUrl = event.notification?.data?.url ?? "/dashboard";
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientsArr) => {
      const matchingClient = clientsArr.find((client) => client.url === targetUrl);
      if (matchingClient) {
        return matchingClient.focus();
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
