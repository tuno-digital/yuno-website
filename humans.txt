/* ==========================================================
   YUNO 9.0 — SERVICE WORKER (AUDITADO E CORRIGIDO)
   Cache inteligente + fallback offline + atualização rápida
========================================================== */

const CACHE_VERSION = "yuno-v9-0-1";
const CACHE_STATIC = `${CACHE_VERSION}-static`;
const CACHE_DYNAMIC = `${CACHE_VERSION}-dynamic`;

const OFFLINE_URL = "/offline.html";

const ASSETS = [
    "/",
    "/index.html",
    "/offline.html",
    "/ativos/css/style.css",
    "/ativos/css/style-yuno.css",
    "/ativos/css/style-3d.css",
    "/ativos/css/utilities.css",
    "/ativos/js/main.js",
    "/ativos/js/ui-effects.js",
    "/ativos/js/yuno-client.js",
    "/ativos/js/three-init.js",
    "/ativos/img/logo-neon.png",
    "/ativos/img/favicon.png",
    "/manifest.json"
];

/* --------------------- */
/* INSTALL SW            */
/* --------------------- */
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_STATIC).then(cache => {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

/* --------------------- */
/* ACTIVATE SW           */
/* --------------------- */
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_STATIC && key !== CACHE_DYNAMIC)
                    .map(key => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

/* ---------------------
   FETCH (CACHE + FALLBACK)
   Estratégia: Network first → cache → offline
---------------------- */
self.addEventListener("fetch", event => {

    // Apenas navegação (HTML)
    if (event.request.mode === "navigate") {
        event.respondWith(
            fetch(event.request)
                .catch(() => caches.match(OFFLINE_URL))
        );
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Evitar errors de "opaque response"
                if (!response || response.status === 0) {
                    return response;
                }

                // Salvar no cache dinâmico
                return caches.open(CACHE_DYNAMIC).then(cache => {
                    cache.put(event.request, response.clone());
                    return response;
                });
            })
            .catch(() => {
                // fallback: cache → offline → null
                return caches.match(event.request)
                    .then(res => res || caches.match(OFFLINE_URL));
            })
    );
});
