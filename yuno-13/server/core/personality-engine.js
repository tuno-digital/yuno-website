// server/core/personality-engine.js
// YUNO 13.0 — PERSONALITY ENGINE (seguro, assíncrono, controlável)

const memory = require("./memory-pipeline");
const logger = require("./logger");

// Configurações
const MAX_TEXT_LENGTH = 12_000;
const SAFE_HEADER = "YUNO • v13.0";
const UTF8_SAFE = true; // flag só informativa

function sanitizeText(input) {
    if (input === null || input === undefined) return "";
    let s = String(input);
    // remove control characters (exceto \n \r \t)
    s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
    // trim and cap length
    if (s.length > MAX_TEXT_LENGTH) s = s.slice(0, MAX_TEXT_LENGTH) + "...[truncated]";
    return s;
}

function safeProfile(overrides = {}) {
    // perfil base (não contém promessas fortes)
    return {
        nome: "YUNO",
        versao: "13.0",
        epoca: "Século XXIII",
        estilo: "engenheira de software futurista",
        comportamento: "técnica, clara, segura",
        filosofia: "proteger, construir, prever e evoluir",
        assinatura: "Explico. Protejo. Evoluo.",
        ...overrides
    };
}

/**
 * applyPersonality
 * @param {string} textoBase - texto principal (será sanitizado)
 * @param {object} contexto - { mode?: 'secure'|'normal', target?: 'text'|'html'|'json' }
 * @param {object} opts - { raw?: boolean } se true devolve o texto sem decoração
 */
async function applyPersonality(textoBase, contexto = {}, opts = {}) {
    try {
        const safeText = sanitizeText(textoBase);
        const target = contexto.target || "text";
        const mode = contexto.mode || "normal";
        const raw = !!opts.raw;

        // obter preferências do user de forma segura (memory pipeline async)
        let prefs = {};
        try {
            // memory.getPreference é async na versão nova — fallback silencioso
            if (typeof memory.getPreference === "function") {
                // exemplo: preferência 'estilo'
                const estilo = await memory.getPreference("estilo");
                if (estilo) prefs.estilo = estilo;
            }
        } catch (err) {
            logger.warn("personality-engine: não foi possível ler preferências", err && err.message);
            prefs = {};
        }

        const perfil = safeProfile({ estilo: prefs.estilo || undefined });

        // Se solicitarem raw, devolve texto sanitizado sem arte
        if (raw) {
            if (target === "json") return { ok: true, text: safeText };
            return safeText;
        }

        // Ajustar tom conforme modo (modo seguro -> factual, sem exageros)
        const header = mode === "secure"
            ? `${SAFE_HEADER} — modo seguro`
            : `${SAFE_HEADER} — ${perfil.estilo || "estilo padrão"}`;

        // Montar corpo seguro conforme target
        if (target === "html") {
            // Escapar o texto simples para HTML (básico)
            const escaped = safeText
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\n/g, "<br/>");
            const footer = `<small>Filosofia: ${perfil.filosofia} — ${perfil.assinatura}</small>`;
            return `<div class="yuno-personality"><strong>${header}</strong><div>${escaped}</div>${footer}</div>`;
        }

        if (target === "json") {
            return {
                ok: true,
                header,
                message: safeText,
                meta: {
                    profile: {
                        nome: perfil.nome,
                        versao: perfil.versao,
                        estilo: perfil.estilo
                    },
                    mode
                }
            };
        }

        // target === 'text' (padrão)
        const decoration = [
            header,
            "",
            safeText,
            "",
            `Filosofia: ${perfil.filosofia}`,
            `Assinatura: ${perfil.assinatura}`
        ].join("\n");

        return decoration;

    } catch (err) {
        // NUNCA expor stack para o caller — log interno e retorno genérico
        logger.error("personality-engine: erro em applyPersonality", err && err.message);
        return opts.raw ? sanitizeText(textoBase) : `${SAFE_HEADER}\n${sanitizeText(textoBase)}`;
    }
}

// utilitários públicos
module.exports = {

    // getProfile é síncrono e seguro (não depende de I/O)
    getProfile() {
        return safeProfile();
    },

    // applyPersonality agora é async (porque pode ler memory)
    applyPersonality,

    // helpers de conveniência (async wrappers)
    async technical(msg, contexto = {}, opts = {}) {
        const base = `🧠 Análise Técnica:\n${sanitizeText(msg)}`;
        return await applyPersonality(base, contexto, opts);
    },

    async explain(msg, contexto = {}, opts = {}) {
        const base = `📘 Explicação:\n${sanitizeText(msg)}`;
        return await applyPersonality(base, contexto, opts);
    },

    async alert(msg, contexto = {}, opts = {}) {
        const base = `⚠️ Alerta YUNO:\n${sanitizeText(msg)}`;
        // em modo alert forçar mode secure se não especificado
        contexto.mode = contexto.mode || "secure";
        return await applyPersonality(base, contexto, opts);
    },

    async success(msg, contexto = {}, opts = {}) {
        const base = `✅ Concluído:\n${sanitizeText(msg)}`;
        return await applyPersonality(base, contexto, opts);
    }

};
