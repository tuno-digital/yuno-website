/* ==========================================================
   YUNO 10.3 — SERVICE WORKER (ULTRA OTIMIZADO)
   Offline total • Cache inteligente • Atualização automática
========================================================== */

const CACHE_VERSION = "yuno-v10-3";
const CACHE_STATIC = `${CACHE_VERSION}-static`;
const CACHE_DYNAMIC = `${CACHE_VERSION}-dynamic`;

const OFFLINE_URL = "/offline.html";

/* ---------------------------
   ASSETS ESSENCIAIS PARA PWA
---------------------------- */
const ASSETS = [
    "/", 
    "/index.html",
    "/offline.html",

    /* CSS */
    "/ativos/css/style.css",
    "/ativos/css/style-yuno.css",
    "/ativos/css/style-3d.css",
    "/ativos/css/utilities.css",
    "/ativos/css/pages.css",

    /* JS */
    "/ativos/js/main.js",
    "/ativos/js/ui-effects.js",
    "/ativos/js/yuno-client.js",
    "/ativos/js/three-init.js",

    /* IMAGENS */
    "/ativos/img/logos/logo-yuno-completa.png",
    "/ativos/img/logos/favicon.png",

    /* MANIFESTO */
    "/manifest.json"
];

/* --------------------- */
/* INSTALL               */
/* --------------------- */
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_STATIC).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting(); // Atualiza na hora
});

/* --------------------- */
/* ACTIVATE              */
/* --------------------- */
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(k => k !== CACHE_STATIC && k !== CACHE_DYNAMIC)
                    .map(k => caches.delete(k))
            )
        )
    );
    self.clients.claim(); // SW novo assume controlo imediato
});

/* =======================================================
   FETCH HANDLER — Estratégias:
   - Navegação: network-first → offline
   - Assets: cache-first + atualização silenciosa
   - Outros: fallback total
======================================================= */
self.addEventListener("fetch", event => {

    const req = event.request;

    /* 1. NAVEGAÇÃO — (HTML) */
    if (req.mode === "navigate") {
        event.respondWith(
            fetch(req)
                .then(res => addToDynamic(req, res))
                .catch(() => caches.match(OFFLINE_URL))
        );
        return;
    }

    /* 2. STATIC ASSETS — cache-first + update */
    if (ASSETS.includes(new URL(req.url).pathname)) {
        event.respondWith(
            caches.match(req).then(cacheRes => {
                const fetchPromise = fetch(req)
                    .then(networkRes => addToStatic(req, networkRes))
                    .catch(() => cacheRes);

                return cacheRes || fetchPromise;
            })
        );
        return;
    }

    /* 3. RESTO — network-first → cache → offline */
    event.respondWith(
        fetch(req)
            .then(res => addToDynamic(req, res))
            .catch(() =>
                caches.match(req)
                    .then(res => res || caches.match(OFFLINE_URL))
            )
    );
});

/* ---------------------
   Helpers de Cache
---------------------- */

function addToStatic(req, res) {
    if (!res || res.status !== 200) return res;
    caches.open(CACHE_STATIC).then(cache => cache.put(req, res.clone()));
    return res;
}

function addToDynamic(req, res) {
    if (!res || res.status !== 200) return res;
    caches.open(CACHE_DYNAMIC).then(cache => cache.put(req, res.clone()));
    return res;
}
