// ========================================================================
// YUNO IA — Integração HEYGEN (v10.3 Oficial)
// Geração de vídeo otimizada • Logs avançados • Tratamento seguro
// ========================================================================

const fetch = require("node-fetch");
const logger = require("../../utils/logger");
const validator = require("../../utils/validator");
const security = require("../../utils/security");

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

// Timeout de segurança (em ms)
const FETCH_TIMEOUT = 25000;

async function generateVideo(prompt) {

    // ---------------------------------------------------
    // 1) Validar API Key
    // ---------------------------------------------------
    if (!HEYGEN_API_KEY) {
        logger.error("HEYGEN_API_KEY não configurada no .env");
        return { erro: true, message: "API key ausente" };
    }

    // ---------------------------------------------------
    // 2) Validar prompt
    // ---------------------------------------------------
    if (!validator.isValidPrompt(prompt)) {
        logger.warn("Prompt inválido recebido na integração HEYGEN.");
        return { erro: true, message: "Prompt inválido" };
    }

    // Limpeza e segurança
    const cleanPrompt = security.sanitizeText(prompt);

    logger.info("Enviando prompt para HEYGEN → " + cleanPrompt.substring(0, 60));

    try {
        // ---------------------------------------------------
        // 3) Requisição com timeout
        // ---------------------------------------------------
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

        const response = await fetch("https://api.heygen.com/v1/video/generate", {
            method: "POST",
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${HEYGEN_API_KEY}`
            },
            body: JSON.stringify({
                prompt: cleanPrompt,
                duration: 5,
                resolution: "720p"
            })
        });

        clearTimeout(timeout);

        // ---------------------------------------------------
        // 4) Validar resposta
        // ---------------------------------------------------
        if (!response.ok) {
            const txt = await response.text().catch(() => "");
            logger.error(`HEYGEN API ERROR ${response.status}: ${txt}`);
            return { erro: true, status: response.status, message: "Erro ao gerar vídeo" };
        }

        const data = await response.json();

        // ---------------------------------------------------
        // 5) Extrair URL correta (compatível com diferentes formatos)
        // ---------------------------------------------------
        const videoUrl =
            data.video_url ||
            data?.result?.video_url ||
            data?.data?.video ||
            null;

        if (!videoUrl) {
            logger.error("HEYGEN → Resposta recebida sem video_url válido:");
            logger.error(JSON.stringify(data, null, 2));
            return { erro: true, message: "Resposta inválida da API" };
        }

        // ---------------------------------------------------
        // 6) Retorno padronizado 10.3
        // ---------------------------------------------------
        logger.success("Vídeo HEYGEN gerado com sucesso!");
        return {
            erro: false,
            engine: "heygen",
            url: videoUrl,
            raw: data
        };

    } catch (erro) {

        if (erro.name === "AbortError") {
            logger.error("HEYGEN TIMEOUT — API demorou demasiado.");
            return { erro: true, message: "Timeout na API HeyGen" };
        }

        logger.error("HEYGEN ERROR — Falha de conexão / fetch:");
        logger.error(erro);

        return { erro: true, message: "Erro interno ao comunicar com HEYGEN" };
    }
}

module.exports = { generateVideo };
