/**
 * security.js — YUNO 9.0 AUDITADA
 * Camadas de segurança no lado do cliente:
 *  - Sanitização de inputs
 *  - Bloqueio de scripts maliciosos
 *  - Anti-clickjacking
 *  - Proteções contra bots simples
 *  - Monitorização de anomalias
 */

console.log("🛡️ security.js carregado — YUNO 9.0 Auditada");


// =============================================================
// 1 — Sanitização universal de inputs (anti XSS simples)
// =============================================================
export function sanitize(input) {
    if (!input || typeof input !== "string") return "";
    return input
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .trim();
}


// =============================================================
// 2 — Bloqueio de scripts injetados no DOM
// =============================================================
document.addEventListener("DOMContentLoaded", () => {
    const scripts = document.querySelectorAll("script:not([src])");

    scripts.forEach(sc => {
        if (sc.innerHTML.includes("<") || sc.innerHTML.includes("javascript:")) {
            console.warn("⚠️ Script inline bloqueado por segurança.");
            sc.innerHTML = "";
        }
    });
});


// =============================================================
// 3 — Anti-clickjacking (impede site dentro de iframe externo)
// =============================================================
if (window.top !== window.self) {
    console.warn("🚨 Tentativa de clickjacking bloqueada!");
    window.top.location = window.location;
}


// =============================================================
// 4 — Bot Detection simples (anti automações baratas)
// =============================================================
let botScore = 0;

function randomBotCheck() {
    const moves = window.performance?.timing;
    if (!moves) return;

    // Se o navegador demorar menos de 50ms -> provavelmente automação
    if (performance.now() < 50) botScore++;

    if (botScore > 2) {
        console.warn("🤖 Bot detectado! Algumas funções serão limitadas.");
        document.body.classList.add("bot-detected");
    }
}

setTimeout(randomBotCheck, 200);
setInterval(randomBotCheck, 800);


// =============================================================
// 5 — Proteção de formulários (impede spam e duplicação)
// =============================================================
export function protectForm(form) {
    if (!form) return;

    form.addEventListener("submit", () => {
        const btn = form.querySelector("button[type='submit']");
        if (btn) {
            btn.disabled = true;
            btn.innerText = "A enviar...";
        }
    });
}


// =============================================================
// 6 — Monitorização de anomalias
// =============================================================
window.addEventListener("error", (err) => {
    console.warn("⚠️ Erro capturado:", err.message);
});

window.addEventListener("keydown", (e) => {
    if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key === "I")) {
        console.warn("🛡️ Acesso DevTools detectado.");
    }
});


// =============================================================
// 7 — Hash fácil (não criptografia real, apenas proteção leve)
// =============================================================
export function quickHash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(31, h) + str.charCodeAt(i) | 0;
    }
    return h.toString(16);
}