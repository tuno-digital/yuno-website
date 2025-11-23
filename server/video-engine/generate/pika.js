
// ===============================================================
// 🟦 YUNO IA — PIKA LABS VIDEO ENGINE (v10.3 Híbrida)
// Integração oficial com Pika Labs — text-to-video.
// Totalmente auditado, seguro e compatível com a arquitetura 10.3.
// ===============================================================

const fetch = require("node-fetch");
const logger = require("../../utils/logger");
const saveTempVideo = require("../../utils/saveTempVideo");

// Endpoint oficial Pika Labs
const PIKA_ENDPOINT = "https://api.pikavideo.ai/v1/video";

// API Key
const PIKA_API_KEY = process.env.PIKA_API_KEY;

/**
 * Gera um vídeo usando o Pika Labs via texto.
 * @param {string} prompt 
 * @returns {Promise<string|null>} URL local ou externa do vídeo
 */
async function generateVideo(prompt) {

    // 1) Validação da chave
    if (!PIKA_API_KEY) {
        logger.error("PIKA_API_KEY não encontrada no .env");
        return null;
    }

    // 2) Validação do prompt
    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 3) {
        logger.warn("Prompt inválido enviado para Pika Labs.");
        return null;
    }

    const cleanPrompt = prompt.trim();

    try {
        logger.info("🎬 Enviando prompt para Pika Labs...");

        // 3) Requisição para API
        const response = await fetch(PIKA_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${PIKA_API_KEY}`
            },
            body: JSON.stringify({
                prompt: cleanPrompt,
                duration: 5,
                resolution: "720p",
                aspect_ratio: "16:9"
            })
        });

        // 4) Tratar erro da API
        if (!response.ok) {
            const errText = await response.text().catch(() => "Erro desconhecido.");
            logger.error(`PIKA API ERROR (${response.status}): ${errText}`);
            return null;
        }

        // 5) Parse JSON
        const data = await response.json().catch(err => {
            logger.error("Erro ao fazer parse do JSON Pika Labs:");
            console.error(err);
            return null;
        });

        if (!data) return null;

        // 6) Pegar URL do vídeo
        const videoUrl =
            data?.video_url ||
            data?.output?.url ||
            data?.result?.video_url ||
            null;

        if (!videoUrl) {
            logger.error("Pika Labs retornou resposta sem video_url:");
            console.log(data);
            return null;
        }

        // 7) Guardar localmente automaticamente
        const savedPath = await saveTempVideo(videoUrl, "pika");

        if (!savedPath) {
            logger.error("Falha ao armazenar vídeo Pika Labs localmente.");
            return videoUrl; // fallback externo
        }

        logger.success("🎥 Vídeo Pika Labs gerado e salvo com sucesso!");
        return savedPath;

    } catch (err) {
        logger.error("Erro interno no módulo Pika Labs:");
        console.error(err);
        return null;
    }
}

module.exports = { generateVideo };
