// Basic Service Worker for PWA Case Study
const CACHE_NAME = "pwa-cs-cache-v1";
const OFFLINE_URL = "/";
const PRECACHE = [
  "/",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-192.png",
  "/icons/maskable-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  // Runtime caching: Network-first for JSON APIs, Cache-first for others
  if (req.headers.get("accept")?.includes("application/json")) {
    event.respondWith(
      fetch(req).then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        return res;
      }).catch(() => caches.match(req))
    );
  } else {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).catch(() => caches.match(OFFLINE_URL)))
    );
  }
});

// Background Sync for queued POSTs (simple example)
const QUEUE_STORE = "queued-posts";
self.addEventListener("sync", async (event) => {
  if (event.tag === "sync-posts") {
    event.waitUntil(flushQueue());
  }
});

async function flushQueue() {
  const db = await openDB();
  const tx = db.transaction(QUEUE_STORE, "readwrite");
  const store = tx.objectStore(QUEUE_STORE);
  const all = await store.getAll();
  for (const item of all) {
    try {
      await fetch(item.url, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(item.body) });
      await store.delete(item.id);
    } catch (e) {
      // keep in queue
    }
  }
  await tx.done;
}

// Push Notifications
self.addEventListener("push", (event) => {
  let data = { title: "Notificación", body: "Mensaje recibido.", url: "/" };
  try { if (event.data) data = event.data.json(); } catch {}
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: data.url || "/" }
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(clients.matchAll({ type: "window" }).then((clientsArr) => {
    const hadWindow = clientsArr.some((w) => (w.url === url ? (w.focus(), true) : false));
    if (!hadWindow) clients.openWindow(url);
  }));
});

// Minimal IndexedDB helper (no external lib in SW)
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("pwa-cs-db", 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
