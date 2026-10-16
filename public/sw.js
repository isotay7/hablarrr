// Hablarrr service worker: works offline after the first visit.
// Pages: network first, falling back to the cached copy.
// Build assets (_next/static): cache first, they never change.

const VERSION = "v3";
const PAGES = `pages-${VERSION}`;
const ASSETS = `assets-${VERSION}`;

// "/" locally, "/<repo>/" on GitHub Pages.
const BASE = new URL("./", self.location).pathname;

const LESSONS = [
  ...["d01", "d02", "d03", "d04", "d05", "d06", "d07", "d08", "d09", "d10"],
  ...["t01", "t02", "t03", "t04", "t05", "t06"],
  ...["s01", "s02", "s03"],
];
const PRECACHE = [
  "",
  "empezar/",
  "chill/",
  "leer/",
  "repasar/",
  "repasar/sesion/",
  "progreso/",
  "enfoque/",
  "mision/",
  "ajustes/",
  ...LESSONS.map((id) => `leer/${id}/`),
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
].map((p) => BASE + p);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((c) => Promise.allSettled(PRECACHE.map((url) => c.add(url))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => ![PAGES, ASSETS].includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return;

  if (url.pathname.startsWith(BASE + "_next/static/") || url.pathname.startsWith(BASE + "icons/")) {
    event.respondWith(
      caches.open(ASSETS).then(async (c) => {
        const hit = await c.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) c.put(req, res.clone());
        return res;
      }),
    );
    return;
  }

  // Pages and RSC payloads: fresh when online, cached when not.
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(PAGES).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(async () => {
        const hit = await caches.match(req, { ignoreSearch: req.mode === "navigate" });
        if (hit) return hit;
        if (req.mode === "navigate") return (await caches.match(BASE)) ?? Response.error();
        return Response.error();
      }),
  );
});
