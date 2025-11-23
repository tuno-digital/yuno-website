// ============================================================
// 🔥 YUNO THINK ENGINE — v10.3 HÍBRIDO
// Raciocínio, coerência, memória curta e integração com API
// Compatível com Browser (ESM) e Node (CJS)
// ============================================================

// Detecta ambiente automaticamente
const isNode = typeof window === "undefined";

// =============================
// IMPORTS — Browser / Node
// =============================
let fetchFn;
let memory;
let logger;
let YUNO_CONFIG;

// Browser (ESM)
if (!isNode) {
    fetchFn = fetch;
    memory = window.YUNO_MEMORY; // já carregado no sistema
    logger = console;
    YUNO_CONFIG = window.YUNO_CONFIG || {
        ai: {
            model: "gpt-5.1",
            temperature: 0.6,
            maxTokens: 300,
            endpoint: "https://api.openai.com/v1/chat/completions",
            systemPrompt: "Tu és a YUNO IA 10.3."
        }
    };
}

// Node (CJS)
else {
    fetchFn = require("node-fetch");
    memory = require("./memory-system");
    logger = require("../utils/logger");
    YUNO_CONFIG = require("./config/yuno-config.json");
}

// =============================
// CHAVE API
// =============================
const AI_KEY = isNode ? process.env.YUNO_AI_KEY : (window.YUNO_AI_KEY || null);

if (!AI_KEY) logger.error("⚠️ YUNO_AI_KEY não encontrada! A YUNO vai usar o motor interno simulado.");


// ============================================================
// MOTOR PRINCIPAL — THINK 10.3
// ============================================================
export async function YunoThink(prompt, options = {}) {

    // Segurança básica
    if (!prompt || typeof prompt !== "string") {
        logger.warn("Prompt inválido recebido no YunoThink()");
        return "Desculpa, não percebi o que disseste. Podes repetir? 🙏";
    }

    // Salva memória curta
    if (memory?.addShort) memory.addShort(prompt);

    // ----------------------------
    // Se não houver API key → modo offline (motor interno)
    // ----------------------------
    if (!AI_KEY) {
        return internalThink(prompt);
    }

    // ----------------------------
    // THINK MODE AI 10.3 (online)
    // ----------------------------
    const body = {
        model: YUNO_CONFIG.ai.model || "gpt-5.1",
        temperature: options.temperature || YUNO_CONFIG.ai.temperature,
        max_tokens: YUNO_CONFIG.ai.maxTokens,
        messages: [
            { role: "system", content: YUNO_CONFIG.ai.systemPrompt },
            ...(memory?.formatForAI?.() || []),
            { role: "user", content: prompt }
        ]
    };

    try {
        const response = await fetchFn(YUNO_CONFIG.ai.endpoint, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${AI_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errTxt = await response.text().catch(() => "");
            logger.error(`THINK API ERROR ${response.status}: ${errTxt}`);
            return internalThink(prompt);
        }

        const data = await response.json();

        const answer =
            data?.choices?.[0]?.message?.content ||
            data?.response ||
            "Não consegui gerar resposta.";

        // Guarda também a resposta na memória
        if (memory?.addShort) memory.addShort(answer);

        return answer;

    } catch (e) {
        logger.error("THINK ENGINE FATAL ERROR:");
        logger.error(e);
        return internalThink(prompt);
    }
}


// ============================================================
// THINK INTERNO (modo offline, sem API)
// ============================================================
function internalThink(input) {
    return (
        "Recebi: " +
        input +
        ". A pensar com o motor interno YUNO_ENGINE_10.3 (modo offline)."
    );
}


// ============================================================
// EXPORTAÇÃO HÍBRIDA
// ============================================================

// Browser
if (!isNode) {
    window.YunoThink = YunoThink;
}

// Node
else {
    module.exports = { YunoThink };
}
