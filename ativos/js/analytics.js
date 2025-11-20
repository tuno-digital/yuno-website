// ativos/js/analytics.js
// YUNO — analytics minimal (versão segura p/ incluir sem emojis)
// Regista pageviews básicos e eventos locais; envia a um endpoint opcional.

(function () {
  'use strict';

  const ANALYTICS_ENDPOINT = '/api/analytics'; // se tiveres backend, senão fica só em localStorage
  const STORAGE_KEY = 'yuno_analytics_queue_v1';

  function now() { return new Date().toISOString(); }

  function safeJsonParse(s) {
    try { return JSON.parse(s); } catch(e) { return null; }
  }

  // push event to queue (local)
  function queueEvent(evt) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const queue = safeJsonParse(raw) || [];
      queue.push(evt);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    } catch (err) {
      // fallback silencioso
      console.warn('analytics: não foi possível gravar no localStorage', err);
    }
  }

  // try to flush queue to endpoint (if exists)
  async function flushQueue() {
    if (!navigator.onLine) return; // espera estar online
    const raw = localStorage.getItem(STORAGE_KEY);
    const queue = safeJsonParse(raw) || [];
    if (!queue.length) return;

    try {
      // envia como batch
      const res = await fetch(ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: queue, ts: now() }),
      });
      if (res && (res.status === 200 || res.status === 201)) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        // não apagamos; tenta mais tarde
        console.warn('analytics: endpoint respondeu com status', res.status);
      }
    } catch (err) {
      // network error — mantém no localStorage
      console.warn('analytics: erro ao enviar eventos', err);
    }
  }

  // regista pageview
  function trackPageview() {
    const evt = {
      type: 'pageview',
      path: location.pathname + location.search,
      title: document.title || null,
      ts: now(),
      userAgent: navigator.userAgent || null,
      viewport: { w: window.innerWidth, h: window.innerHeight }
    };
    queueEvent(evt);
    // tenta enviar em background (não trava nada)
    flushQueue();
  }

  // regista event manual
  window.YunoAnalytics = {
    track: function(name, data) {
      try {
        const evt = { type: 'event', name: String(name), data: data || null, ts: now() };
        queueEvent(evt);
        flushQueue();
      } catch (err) {
        console.warn('analytics.track erro', err);
      }
    },
    flush: flushQueue
  };

  // inicia
  document.addEventListener('DOMContentLoaded', function () {
    try {
      trackPageview();
      // flush periódico
      setInterval(flushQueue, 30_000); // a cada 30s
      // tenta flush quando volta online
      window.addEventListener('online', flushQueue);
    } catch (err) {
      console.error('analytics init erro', err);
    }
  });
})();