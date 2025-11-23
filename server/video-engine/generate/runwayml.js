
// ===============================================================
// 🟦 YUNO IA — RUNWAYML VIDEO ENGINE (v10.3 Híbrida)
// Integração oficial com RunwayML Gen-2 — text-to-video.
// Totalmente auditado, seguro e compatível com a arquitetura 10.3.
// ===============================================================

const fetch = require("node-fetch");
const logger = require("../../utils/logger");
const saveTempVideo = require("../../utils/saveTempVideo");

// Endpoint oficial Gen-2
const RUNWAY_ENDPOINT = "https://api.runwayml.com/v1/gen2";

// API KEY
const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY;

/**
 * Gera vídeo com RunwayML via texto.
 * @param {string} prompt 
 * @returns {Promise<string|null>} URL local ou externa do vídeo
 */
async function generateVideo(prompt) {
    // 1) Validação da chave
    if (!RUNWAY_API_KEY) {
        logger.error("RUNWAY_API_KEY não encontrada no .env");
        return null;
    }

    // 2) Validação do prompt
    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 3) {
        logger.warn("Prompt inválido enviado para RunwayML.");
        return null;
    }

    const cleanPrompt = prompt.trim();

    try {
        logger.info("🎬 Enviando prompt para RunwayML...");

        // 3) Requisição RunwayML
        const response = await fetch(RUNWAY_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${RUNWAY_API_KEY}`
            },
            body: JSON.stringify({
                prompt: cleanPrompt,
                mode: "text-to-video",
                duration: 5,
                size: "1280x720"
            })
        });

        // 4) Resposta inválida
        if (!response.ok) {
            const errTxt = await response.text().catch(() => "Erro desconhecido.");
            logger.error(`RUNWAY API ERROR (${response.status}): ${errTxt}`);
            return null;
        }

        // 5) Parse JSON
        const data = await response.json().catch(err => {
            logger.error("Erro ao fazer parse do JSON RunwayML:");
            console.error(err);
            return null;
        });

        if (!data) return null;

        // 6) Pegar URL do vídeo
        const videoUrl =
            data?.output?.video_url ||
            data?.result?.video_url ||
            null;

        if (!videoUrl) {
            logger.error("RunwayML retornou resposta sem video_url:");
            console.log(data);
            return null;
        }

        // 7) Guardar localmente automaticamente
        const savedPath = await saveTempVideo(videoUrl, "runway");

        if (!savedPath) {
            logger.error("Falha ao armazenar vídeo RunwayML localmente.");
            return videoUrl; // fallback externo
        }

        logger.success("🎥 Vídeo RunwayML gerado e salvo com sucesso!");
        return savedPath;

    } catch (err) {
        logger.error("Erro interno no módulo RunwayML:");
        console.error(err);
        return null;
    }
}

module.exports = { generateVideo };
