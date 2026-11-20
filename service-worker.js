
/* =========================================================
   KERJIVA MALAYSIA
   SERVICE WORKER
========================================================= */

"use strict";

const CACHE_VERSION = "kerjiva-malaysia-v1";

const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGE_CACHE = `${CACHE_VERSION}-pages`;

const STATIC_ASSETS = [
  "./",
  "./index.html"
];

// INSTALL
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(function (cache) {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(function () {
        return self.skipWaiting();
      })
  );
});

// ACTIVATE
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (cacheNames) {
        return Promise.all(
          cacheNames.map(function (cacheName) {
            if (
              cacheName.startsWith("kerjiva-malaysia-") &&
              ![STATIC_CACHE, PAGE_CACHE].includes(cacheName)
            ) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

// FETCH
self.addEventListener("fetch", function (event) {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Jangan cache permintaan lintas domain
  if (url.origin !== self.location.origin) return;

  // Jangan cache API, autentikasi, atau penyimpanan Supabase
  if (
    url.hostname.includes("supabase.co") ||
    url.pathname.includes("/auth/") ||
    url.pathname.includes("/rest/") ||
    url.pathname.includes("/storage/") ||
    url.pathname.includes("/functions/")
  ) {
    return;
  }

  // HTML: Network First
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(function (response) {
          if (response.ok) {
            const copy = response.clone();

            caches.open(PAGE_CACHE).then(function (cache) {
              cache.put(request, copy);
            });
          }

          return response;
        })
        .catch(async function () {
          return (
            await caches.match(request) ||
            await caches.match(new URL("./index.html", self.registration.scope).href)
          );
        })
    );

    return;
  }

  // Aset statis: Cache First
  event.respondWith(
    caches.match(request)
      .then(function (cachedResponse) {
        if (cachedResponse) return cachedResponse;

        return fetch(request).then(function (response) {
          if (response.ok) {
            const copy = response.clone();

            caches.open(STATIC_CACHE).then(function (cache) {
              cache.put(request, copy);
            });
          }

          return response;
        });
      })
  );
});
