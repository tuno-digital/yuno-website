// ===============================================================
// 🧠 YUNO CORE — Motor Central de IA (v10.3 Híbrida)
// Processamento → Raciocínio → Execução → Resposta
// ===============================================================

const fetch = require("node-fetch");
const logger = require("../../utils/logger");
const memory = require("./memory-system");
const commands = require("./command-engine");
const { YUNO_CONFIG } = require("./yuno-config-loader");

// ===============================================================
// 🔹 Função principal da IA — Onde a YUNO PENSA
// ===============================================================

async function yunoThink(input, userId = "anon") {
    try {
        logger.info(`Nova mensagem recebida: "${input}"`);

        // ------------------------------
        // 1) VALIDAR INPUT
        // ------------------------------
        if (!input || typeof input !== "string") {
            return sendError("Entrada inválida. Envia uma mensagem em texto.");
        }

        const cleanInput = input.trim();
        if (!cleanInput) {
            return sendError("Mensagem vazia.");
        }

        // Guardar na memória curta
        memory.shortTermAdd({ userId, text: cleanInput });

        // ------------------------------
        // 2) DETECTAR COMANDOS DA IA
        // Ex.: /post, /funil, /automacao, /video, etc.
        // ------------------------------
        const detected = commands.detectCommand(cleanInput);

        if (detected.isCommand) {
            logger.system(`Comando detectado: ${detected.command}`);
            return await commands.execute(detected, userId);
        }

        // ------------------------------
        // 3) GERAÇÃO DE RESPOSTA INTELIGENTE
        // via OpenAI, YUNO-MODEL ou fallback interno
        // ------------------------------
        const respostaIA = await generateAIResponse(cleanInput, userId);

        // Guardar memória longa
        memory.longTermMaybeStore(cleanInput, respostaIA);

        return {
            sucesso: true,
            tipo: "resposta_ia",
            resposta: respostaIA
        };

    } catch (err) {
        logger.error("Erro no yunoThink:");
        console.error(err);
        return sendError("Erro interno ao processar pensamento da Yuno.");
    }
}

// ===============================================================
// 🔹 MOTOR DE RESPOSTA — LIGAÇÃO COM OPENAI / YUNO MODEL
// ===============================================================

async function generateAIResponse(text, userId) {
    try {
        const prompt = buildPrompt(text, userId);

        const response = await fetch(YUNO_CONFIG.ai.endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${YUNO_CONFIG.ai.key}`
            },
            body: JSON.stringify({
                model: YUNO_CONFIG.ai.model,
                temperature: YUNO_CONFIG.ai.temperature,
                max_tokens: YUNO_CONFIG.ai.maxTokens,
                messages: prompt
            })
        });

        const data = await response.json();

        if (!data?.choices?.length) {
            logger.warn("IA não devolveu resposta.");
            return "Não consegui gerar uma resposta. Tenta reformular.";
        }

        return data.choices[0].message.content;

    } catch (err) {
        logger.error("Erro ao contactar modelo de IA:");
        console.error(err);
        return "Ocorreu um erro ao falar com o motor de IA.";
    }
}

// ===============================================================
// 🔹 Construção do prompt — Personalidade + contexto + memória
// ===============================================================

function buildPrompt(input, userId) {
    const memoriaCurta = memory.shortTermGet(userId);
    const personalidade = YUNO_CONFIG.personality;

    return [
        {
            role: "system",
            content:
                `Tu és a YUNO IA versão 10.3 — inteligente, rápida, profissional, 
                 futurista e com personalidade forte. 
                 Usa linguagem clara, objetiva, leal e confiante.`
        },
        {
            role: "system",
            content: `Comportamento: ${personalidade.comportamento}`
        },
        {
            role: "system",
            content: `Objetivo: ${personalidade.objetivo}`
        },
        {
            role: "system",
            content: `Memória curta: ${JSON.stringify(memoriaCurta)}`
        },
        {
            role: "user",
            content: input
        }
    ];
}

// ===============================================================
// 🔹 Utilidade
// ===============================================================

function sendError(msg) {
    return {
        sucesso: false,
        erro: true,
        mensagem: msg
    };
}

module.exports = {
    yunoThink
};
