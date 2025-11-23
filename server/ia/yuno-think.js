// ============================================================
// 🔥 YUNO THINK ENGINE — v10.3 (ESM VERSION)
// ============================================================

import fetch from "node-fetch";
import memory from "./memory-system.js";
import logger from "../utils/logger.js";
import YUNO_CONFIG from "./config/yuno-config.json" with { type: "json" };
// Chave de API
const AI_KEY = process.env.YUNO_AI_KEY || null;

if (!AI_KEY) logger.error("⚠️ YUNO_AI_KEY não encontrada! Modo offline ativado.");

export async function think(prompt, options = {}) {
    if (!prompt || typeof prompt !== "string") {
        logger.warn("Prompt inválido recebido");
        return "Desculpa, não percebi o que disseste.";
    }

    // Salvar memória curta
    memory.addShort(prompt);

    if (!AI_KEY) {
        return internalThink(prompt);
    }

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

        const data = await response.json();
        const answer =
            data?.choices?.[0]?.message?.content ||
            "Não consegui gerar resposta.";

        memory.addShort(answer);
        return answer;

    } catch (e) {
        logger.error("ERRO THINK ENGINE 10.3 → ", e);
        return internalThink(prompt);
    }
}

function internalThink(text) {
    return `Recebi: ${text}. Pensando com YUNO_ENGINE_10.3 (offline).`;
}
