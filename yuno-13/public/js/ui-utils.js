/* ============================================================
   YUNO 13.0 — UI UTILS (CORRIGIDO)
   Funções auxiliares globais para o cockpit
   Estável • Seguro • Reutilizável
============================================================ */

/* -----------------------------
   LOG VISUAL (UI) — corrigido ID
----------------------------- */
export function uiLog(msg, type = "info") {
    const logs = document.getElementById("logs-box"); // CORRIGIDO
    if (!logs) return;

    const color =
        type === "error" ? "red" :
        type === "warn"  ? "#ffcc00" :
        type === "sys"   ? "#00eaff" :
        "#8be4ff";

    const div = document.createElement("div");
    div.style.color = color;
    div.textContent = `[${type.toUpperCase()}] ${msg}`;

    logs.appendChild(div);
    logs.scrollTop = logs.scrollHeight;
}

/* -----------------------------
   NOTIFICAÇÃO CURTA (mantido, seguro)
----------------------------- */
export function notify(msg, type = "info") {
    const div = document.createElement("div");

    div.className = "yuno-toast";
    div.textContent = msg;

    // Mantido: estilo inline é permitido, mas isolado
    div.style.position = "fixed";
    div.style.bottom = "20px";
    div.style.right = "20px";
    div.style.padding = "12px 16px";
    div.style.background = "rgba(0,0,0,0.75)";
    div.style.border = "1px solid #222";
    div.style.borderLeft =
        type === "error" ? "4px solid #ff0033" :
        type === "warn"  ? "4px solid #ffcc00" :
        "4px solid #00eaff";
    div.style.color = "#fff";
    div.style.fontSize = "14px";
    div.style.borderRadius = "6px";
    div.style.backdropFilter = "blur(4px)";
    div.style.zIndex = "99999";
    div.style.transition = "all .4s ease";

    document.body.appendChild(div);

    setTimeout(() => {
        div.style.opacity = "0";
        div.style.transform = "translateY(10px)";
        setTimeout(() => div.remove(), 400);
    }, 2500);
}

/* -----------------------------
   DARK MODE — protegido
----------------------------- */
export function toggleDarkMode(on) {
    try {
        const body = document.body;
        if (!body) return;

        if (on) {
            body.classList.add("yuno-dark");
            localStorage.setItem("yunoDark", "1");
        } else {
            body.classList.remove("yuno-dark");
            localStorage.setItem("yunoDark", "0");
        }
    } catch {
        // fallback silencioso
    }
}

/* -----------------------------
   LOADING MINI — idempotente
----------------------------- */
export function startMiniLoading(targetId) {
    const el = document.getElementById(targetId);
    if (!el) return;

    if (!el.dataset.original) {
        el.dataset.original = el.innerHTML;
    }

    el.innerHTML = "⏳ ...";
}

export function stopMiniLoading(targetId) {
    const el = document.getElementById(targetId);
    if (!el) return;

    if (el.dataset.original) {
        el.innerHTML = el.dataset.original;
    }
}

/* -----------------------------
   SANITIZAÇÃO SIMPLES (melhorado)
----------------------------- */
export function cleanText(txt) {
    if (!txt) return "";

    let s = String(txt);
    s = s.replace(/<script/gi, "&lt;script");
    s = s.replace(/<\/script>/gi, "");
    s = s.replace(/javascript:/gi, "");

    return s;
}

/* -----------------------------
   FORMATAÇÃO DE JSON — circular safe
----------------------------- */
export function prettyJSON(obj) {
    try {
        const seen = new WeakSet();
        return JSON.stringify(
            obj,
            (key, value) => {
                if (typeof value === "object" && value !== null) {
                    if (seen.has(value)) return "[circular]";
                    seen.add(value);
                }
                return value;
            },
            2
        );
    } catch {
        return String(obj);
    }
}

/* -----------------------------
   ANIMAÇÃO DO CHAT — fallback
----------------------------- */
export function smoothScroll(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;

    try {
        el.scrollTo({
            top: el.scrollHeight,
            behavior: "smooth",
        });
    } catch {
        // fallback sem smooth
        el.scrollTop = el.scrollHeight;
    }
}
