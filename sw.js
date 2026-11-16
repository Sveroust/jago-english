const CACHE_NAME = "jago-english-v3";
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./fonts/lato-400-normal.woff2",
  "./fonts/lato-700-normal.woff2",
  "./fonts/lato-900-normal.woff2",
  "./favicon.svg",
  "./og-cover.svg",
  "./manifest.json",
  "./curriculum-data.js",
  "./vocab-bank-1.js",
  "./vocab-bank-2.js",
  "./translate-data.js",
  "./topics-data-1.js",
  "./topics-data-2.js",
  "./conversation-data.js",
  "./speech-engine.js",
  "./app.js",
  "./coach-data.js",
  "./coach-core.js",
  "./coach.js",
  "./translate.js",
  "./topics.js",
  "./conversation.js"
];

self.addEventListener("install", function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(STATIC_ASSETS).catch(function () {});
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) {
          return caches.delete(k);
        })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.indexOf("/api/") === 0 || url.pathname === "/__version") return;

  event.respondWith(
    fetch(req)
      .then(function (networkRes) {
        if (networkRes && networkRes.status === 200) {
          var copy = networkRes.clone();
          caches.open(CACHE_NAME).then(function (cache) { cache.put(req, copy); });
        }
        return networkRes;
      })
      .catch(function () {
        return caches.match(req);
      })
  );
});
