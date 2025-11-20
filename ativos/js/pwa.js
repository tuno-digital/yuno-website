/**
 * pwa.js — YUNO 9.0 Auditada
 * Ativa modo PWA (Progressive Web App)
 * - Regista o service worker
 * - Mostra botão "Instalar YUNO"
 * - Guarda evento de install
 */

console.log("📲 pwa.js carregado — YUNO 9.0");

// ==========================================================
// 1 — Registrar Service Worker
// ==========================================================
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/service-worker.js")
            .then(reg => {
                console.log("🟢 Service Worker registado:", reg.scope);
            })
            .catch(err => {
                console.warn("🔴 Falha ao registar SW:", err);
            });
    });
} else {
    console.warn("⚠️ PWA não suportado neste navegador.");
}

// ==========================================================
// 2 — Instalação (Add to Home Screen)
// ==========================================================
let deferredPrompt;
const installBtn = document.getElementById("install-yuno-btn");

window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;

    console.log("📦 PWA disponível para instalação.");

    if (installBtn) {
        installBtn.style.display = "block"; // mostra botão
    }
});

// Botão “Instalar YUNO”
if (installBtn) {
    installBtn.addEventListener("click", async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const result = await deferredPrompt.userChoice;

        console.log("📥 Instalação:", result);

        deferredPrompt = null;
        installBtn.style.display = "none";
    });
}

// ==========================================================
// 3 — Notificação de instalado
// ==========================================================
window.addEventListener("appinstalled", () => {
    console.log("🚀 YUNO instalada como aplicação PWA!");
});