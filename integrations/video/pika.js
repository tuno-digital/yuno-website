// ========================================================================
// YUNO IA — Integração PIKA Labs (v10.3 Oficial)
// Geração de vídeo avançada • Tratamento seguro • Logs integrados
// ========================================================================

const fetch = require("node-fetch");
const logger = require("../../utils/logger");
const validator = require("../../utils/validator");
const security = require("../../utils/security");

const PIKA_API_KEY = process.env.PIKA_API_KEY;
const PIKA_ENDPOINT = "https://api.pika.art/v1/video/generate";

// Timeout de segurança (25 segundos)
const FETCH_TIMEOUT = 25000;


async function generateVideo(prompt) {

    // ---------------------------------------------------
    // 1) Validar API Key
    // ---------------------------------------------------
    if (!PIKA_API_KEY) {
        logger.error("PIKA_API_KEY não encontrada no .env");
        return { erro: true, message: "API key ausente" };
    }

    // ---------------------------------------------------
    // 2) Validar prompt
    // ---------------------------------------------------
    if (!validator.isValidPrompt(prompt)) {
        logger.warn("Prompt inválido recebido no PIKA.");
        return { erro: true, message: "Prompt inválido" };
    }

    // Sanitização preventiva
    const cleanPrompt = security.sanitizeText(prompt);

    logger.info("Enviando prompt para PIKA → " + cleanPrompt.substring(0, 60));

    try {
        // ---------------------------------------------------
        // 3) Timeout de proteção
        // ---------------------------------------------------
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

        // ---------------------------------------------------
        // 4) Requisição principal
        // ---------------------------------------------------
        const response = await fetch(PIKA_ENDPOINT, {
            method: "POST",
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${PIKA_API_KEY}`
            },
            body: JSON.stringify({
                prompt: cleanPrompt,
                aspect_ratio: "16:9",
                motion: "smooth",
                duration: 4
            })
        });

        clearTimeout(timeout);

        // ---------------------------------------------------
        // 5) Validar resposta
        // ---------------------------------------------------
        if (!response.ok) {
            const txt = await response.text().catch(() => "");
            logger.error(`PIKA API ERROR ${response.status}: ${txt}`);

            return {
                erro: true,
                status: response.status,
                message: "Erro ao gerar vídeo no PIKA"
            };
        }

        const data = await response.json();

        // ---------------------------------------------------
        // 6) Extrair URL correta
        // ---------------------------------------------------
        const videoUrl =
            data.video_url ||
            data?.result?.video_url ||
            data?.output?.video ||
            null;

        if (!videoUrl) {
            logger.error("PIKA: Resposta sem video_url válida:");
            logger.error(JSON.stringify(data));

            return { erro: true, message: "Resposta inválida da API PIKA" };
        }

        // ---------------------------------------------------
        // 7) Retorno padronizado 10.3
        // ---------------------------------------------------
        logger.success("Vídeo PIKA gerado com sucesso!");

        return {
            erro: false,
            engine: "pika",
            url: videoUrl,
            raw: data
        };

    } catch (erro) {

        if (erro.name === "AbortError") {
            logger.error("PIKA TIMEOUT — API demorou demasiado.");
            return { erro: true, message: "Timeout na API PIKA" };
        }

        logger.error("PIKA ERROR — Falha de conexão:");
        logger.error(erro);

        return { erro: true, message: "Erro interno ao comunicar com PIKA" };
    }
}

module.exports = { generateVideo };
