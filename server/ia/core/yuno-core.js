// ===============================================================
// 🧠 YUNO-CORE (v10.3 Híbrida)
// Motor central da inteligência artificial da YUNO IA
// Interpretação, raciocínio, modularidade e auto-programação
// ===============================================================

const fs = require("fs");
const path = require("path");
const logger = require("../../utils/logger");
const memory = require("../memory/memory-system");
const commands = require("../commands/command-engine");
const configLoader = require("../config/yuno-config-loader");

// Carregar configuração interna (regras, limites, comportamento…)
const YUNO_CONFIG = configLoader();

// ===============================================================
// 🔥 FUNÇÃO PRINCIPAL: interpretar prompt e gerar resposta
// ===============================================================
async function processPrompt(prompt, contexto = {}) {
    try {
        if (!prompt || typeof prompt !== "string") {
            return respostaErro("Prompt inválido.");
        }

        const cleanPrompt = prompt.trim();

        // Guardar na memória curta
        memory.saveShort(cleanPrompt);

        // =========================================================
        // 1️⃣ DETEÇÃO DE COMANDO ESPECIAL (auto programação)
        // =========================================================
        const isCommand = commands.detect(cleanPrompt);

        if (isCommand) {
            logger.system("Comando interno detetado → executando…");
            const cmdResponse = await commands.execute(cleanPrompt);
            return respostaSucesso(cmdResponse);
        }

        // =========================================================
        // 2️⃣ RESPOSTA NORMAL (IA sem comandos)
        // =========================================================
        const response = gerarRespostaInteligente(cleanPrompt, contexto);

        // Guardar memória longa se for importante
        memory.saveLong(cleanPrompt, response);

        return respostaSucesso(response);

    } catch (err) {
        logger.error("Erro no YUNO-CORE: " + err);
        return respostaErro("Erro interno no Yuno-Core.");
    }
}

// ===============================================================
// 🧠 Pequeno motor interno de geração de respostas (temporário)
// (Quando integrarmos o GPT/Yuno-LLM ele substitui esta função)
// ===============================================================
function gerarRespostaInteligente(prompt, contexto) {
    const lower = prompt.toLowerCase();

    if (lower.includes("oi") || lower.includes("olá")) {
        return "Olá! Aqui é a Yuno IA pronta para te ajudar. 💙";
    }

    if (lower.includes("quem és tu")) {
        return "Eu sou a Yuno IA — versão 10.3 — híbrida, modular e com capacidade futura de auto-programação.";
    }

    if (lower.includes("versão")) {
        return "Estou a correr na versão 10.3 Híbrida.";
    }

    if (lower.includes("ajuda")) {
        return "Podes pedir: automações, ideias, texto, comandos internos da IA ou gestão de conteúdo. 💡";
    }

    // Resposta padrão temporária
    return `Recebi: "${prompt}". Em breve darei respostas 100% inteligentes com o módulo YUNO-LLM.`;
}

// ===============================================================
// 📦 RESPOSTAS PADRONIZADAS
// ===============================================================
function respostaSucesso(msg) {
    return {
        status: "ok",
        resposta: msg,
        version: YUNO_CONFIG.version
    };
}

function respostaErro(msg) {
    return {
        status: "erro",
        resposta: msg,
        version: YUNO_CONFIG.version
    };
}

// ===============================================================
// EXPORTAÇÃO DO CÉREBRO
// ===============================================================
module.exports = {
    processPrompt,
    YUNO_CONFIG
};
