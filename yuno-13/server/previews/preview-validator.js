// ==============================================================
// YUNO 13.0 — PREVIEW VALIDATOR (VERSÃO BLINDADA)
// Validação de HTML altamente segura para sandbox do cockpit
// ==============================================================

const MAX_BYTES = 1_000_000; // 1 MB real

function byteSize(str) {
    return Buffer.byteLength(String(str || ""), "utf8");
}

module.exports = {

    validate(html) {

        // ============================
        // Validar tipo
        // ============================
        if (!html || typeof html !== "string") {
            return { ok: false, error: "Preview vazio ou inválido." };
        }

        // ============================
        // Tamanho máximo em BYTES reais
        // ============================
        if (byteSize(html) > MAX_BYTES) {
            return { ok: false, error: "Preview demasiado grande. Bloqueado." };
        }

        const lower = html.toLowerCase();

        // ============================
        // Bloquear script (incluindo evasions)
        // ============================
        if (/<script/gi.test(lower) || /&#x3c;script/gi.test(lower)) {
            return { ok: false, error: "Script detectado no preview. Bloqueado." };
        }

        // ============================
        // Bloquear iframe
        // ============================
        if (/<iframe/gi.test(lower)) {
            return { ok: false, error: "Iframe dentro do preview é proibido." };
        }

        // ============================
        // Eventos inline (case-insensitive)
        // ============================
        if (/on[a-z]+\s*=/gi.test(html)) {
            return { ok: false, error: "Eventos inline detectados (onclick/onload/etc.)." };
        }

        // ============================
        // Bloquear fontes externas
        // Inclui: http, https, //domain, javascript:, data:
        // ============================
        if (
            /\bhttps?:\/\//i.test(html) ||
            /src\s*=\s*["']?\s*\/\//i.test(html) ||
            /javascript:/i.test(html) ||
            /data:/i.test(html)
        ) {
            return { ok: false, error: "Links externos ou esquemas perigosos detectados." };
        }

        // ============================
        // Estrutura mínima obrigatória
        // ============================
        const required = ["<html", "<head", "<body"];

        for (const tag of required) {
            if (!lower.includes(tag)) {
                return { ok: false, error: `Preview sem estrutura base (${tag}).` };
            }
        }

        // ============================
        // SUCESSO — Preview válido
        // ============================
        return { ok: true };
    }
};
