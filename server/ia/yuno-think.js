// ============================================================
// YUNO IA — THINK ENGINE (v10.3 Híbrida)
// Motor de raciocínio da IA: interpreta, processa e responde
// ============================================================

const fetch = require("node-fetch");
const memory = require("./memory-system");
const logger = require("../utils/logger");
const YUNO_CONFIG = require("./config/yuno-config.json");

// =============
// CHAVE API
// =============
const AI_KEY = process.env.YUNO_AI_KEY;
if (!AI_KEY) logger.error("⚠️ YUNO_AI_KEY não encontrada no .env");

// =============
// MOTOR THINK
// =============
async function think(prompt, options = {}) {
    if (!prompt || typeof prompt !== "string") {
        logger.warn("Prompt inválido no think()");
        return "Desculpa, não entendi o que quiseste dizer. 🙏";
    }

    // Salva no histórico
    memory.addShort(prompt);

    const body = {
        model: YUNO_CONFIG.ai.model || "gpt-5.1",
        temperature: options.temperature || YUNO_CONFIG.ai.temperature,
        max_tokens: YUNO_CONFIG.ai.maxTokens,
        messages: [
            { role: "system", content: YUNO_CONFIG.ai.systemPrompt },
            ...memory.formatForAI(),
            { role: "user", content: prompt }
        ]
    };

    try {
        const response = await fetch(YUNO_CONFIG.ai.endpoint, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${AI_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errText = await response.text().catch(() => "");
            logger.error(`THINK API ERROR ${response.status}: ${errText}`);
            return "Erro ao processar o pedido da IA. 😕";
        }

        const data = await response.json();

        const answer =
            data?.choices?.[0]?.message?.content ||
            data?.response ||
            "Não consegui gerar uma resposta.";

        // Guarda memória
        memory.addShort(answer);

        return answer;

    } catch (e) {
        logger.error("THINK ENGINE FATAL ERROR:");
        logger.error(e);
        return "Ocorreu um erro interno ao pensar.";
    }
}

module.exports = { think };
