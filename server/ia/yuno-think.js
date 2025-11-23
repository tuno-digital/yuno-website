// ============================================================
// 🔥 YUNO THINK ENGINE — v10.3 (ESM VERSION CORRIGIDA)
// ============================================================

import fetch from "node-fetch";                     // chamadas API
import { YunoMemory } from "./yuno-memory.js";      // memória
import logger from "../utils/logger.js";            // logs
import loadConfig from "./yuno-config-loader.js";   // config interna

// Carregar config
const YUNO_CONFIG = loadConfig();

// Chave de API externa da Yuno
const AI_KEY = process.env.YUNO_AI_KEY || null;

if (!AI_KEY) {
    logger.warn("⚠️ YUNO_AI_KEY não encontrada. Think Engine está em modo offline.");
}

// ============================================================
// FUNÇÃO PRINCIPAL — THINK (processamento cognitivo 10.3)
// ============================================================
export async function think(prompt, options = {}) {
    
    // Segurança
    if (!prompt || typeof prompt !== "string") {
        logger.warn("Prompt inválido recebido no THINK ENGINE.");
        return "Desculpa, não percebi o que disseste.";
    }

    // Guardar mensagem na memória curta
    YunoMemory.short.push({
        role: "user",
        content: prompt,
        ts: Date.now()
    });

    // ========================================================
    // 1. MODO OFFLINE — sem API KEY
    // ========================================================
    if (!AI_KEY) {
        return internalThink(prompt);
    }

    // ========================================================
    // 2. Corpo da requisição ao LLM (GPT / Yuno API)
    // ========================================================
    const body = {
        model: YUNO_CONFIG?.ai?.model || "gpt-5.1",
        temperature: options.temperature || YUNO_CONFIG?.ai?.temperature || 0.6,
        max_tokens: YUNO_CONFIG?.ai?.maxTokens || 300,
        messages: [
            { role: "system", content: YUNO_CONFIG?.ai?.systemPrompt || "Tu és a Yuno IA 10.3." },

            // Memória longa ❤️
            ...YunoMemory.long.map(m => ({
                role: "system",
                content: m.text
            })),

            // Memória curta 🧠
            ...YunoMemory.short.map(m => ({
                role: m.role,
                content: m.content
            })),

            // Pergunta do utilizador
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

        // Falha no servidor externo → fallback
        if (!response.ok) {
            logger.error(`THINK ENGINE API ERROR ${response.status}`);
            return internalThink(prompt);
        }

        const data = await response.json();

        const answer =
            data?.choices?.[0]?.message?.content ||
            "Não consegui gerar resposta.";

        // Guardar resposta na memória curta
        YunoMemory.short.push({
            role: "assistant",
            content: answer,
            ts: Date.now()
        });

        return answer;

    } catch (e) {
        logger.error("❌ ERRO THINK ENGINE FATAL:", e);
        return internalThink(prompt);
    }
}

// ============================================================
// THINK INTERNO (fallback sem API)
// ============================================================
function internalThink(text) {
    return `Recebi: ${text}. (YUNO_ENGINE_10.3 em modo offline)`;
}
