/* SiteTalk service worker — makes all lessons work offline.
 * App files: cache first, then refreshed in the background (stale-while-revalidate),
 *   so a new version arrives on the next visit after an online load.
 * Google Fonts: cached the first time they load.
 * AI (Gemini / any other host): always network — AI talk needs internet.
 * Bump VERSION whenever the app shell changes.
 */
const VERSION = "sitetalk-v3";
const SHELL = [
  "./", "./index.html", "./manifest.webmanifest",
  "./js/scenarios-1.js", "./js/scenarios-2.js", "./js/grammar.js", "./js/app.js",
  "./icons/icon-180.png", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/maskable-512.png",
];
const FONT_CACHE = "sitetalk-fonts";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== FONT_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Fonts: cache first, store on first use.
  if (url.host === "fonts.googleapis.com" || url.host === "fonts.gstatic.com") {
    e.respondWith(
      caches.open(FONT_CACHE).then((c) =>
        c.match(req).then((hit) => hit || fetch(req).then((res) => { if (res.ok || res.type === "opaque") c.put(req, res.clone()); return res; }))
      )
    );
    return;
  }

  // Only handle this site's own files; everything else (AI APIs) goes straight to the network.
  if (url.origin !== self.location.origin) return;

  // Page navigations (any #route): serve the cached app page.
  if (req.mode === "navigate") {
    e.respondWith(
      caches.open(VERSION).then((c) =>
        c.match("./index.html").then((hit) => {
          const net = fetch(req).then((res) => { if (res.ok) c.put("./index.html", res.clone()); return res; }).catch(() => hit);
          return hit || net;
        })
      )
    );
    return;
  }

  e.respondWith(
    caches.open(VERSION).then((c) =>
      c.match(req, { ignoreSearch: true }).then((hit) => {
        const net = fetch(req).then((res) => { if (res.ok) c.put(req, res.clone()); return res; }).catch(() => hit);
        return hit || net;
      })
    )
  );
});
