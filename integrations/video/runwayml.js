// ========================================================================
// YUNO IA — Integração RUNWAYML (v10.3 Oficial)
// Geração de vídeo avançada • Segurança • Logs • Timeout
// ========================================================================

const fetch = require("node-fetch");
const logger = require("../../utils/logger");
const validator = require("../../utils/validator");
const security = require("../../utils/security");

const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY;
const RUNWAY_ENDPOINT = "https://api.runwayml.com/v1/gen2";

// Timeout de segurança → 25 segundos
const FETCH_TIMEOUT = 25000;


async function generateVideo(prompt) {

    // ---------------------------------------------------
    // 1) Verificar API Key
    // ---------------------------------------------------
    if (!RUNWAY_API_KEY) {
        logger.error("RUNWAY_API_KEY está em falta no .env");
        return { erro: true, message: "API key ausente" };
    }

    // ---------------------------------------------------
    // 2) Validar prompt
    // ---------------------------------------------------
    if (!validator.isValidPrompt(prompt)) {
        logger.warn("Prompt inválido enviado para RUNWAYML.");
        return { erro: true, message: "Prompt inválido" };
    }

    const cleanPrompt = security.sanitizeText(prompt);

    logger.info("RUNWAY → Enviando prompt: " + cleanPrompt.substring(0, 60));

    try {
        // ---------------------------------------------------
        // 3) Timeout de segurança
        // ---------------------------------------------------
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

        // ---------------------------------------------------
        // 4) Requisição POST
        // ---------------------------------------------------
        const response = await fetch(RUNWAY_ENDPOINT, {
            method: "POST",
            signal: controller.signal,
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

        clearTimeout(timeout);

        // ---------------------------------------------------
        // 5) Validar resposta HTTP
        // ---------------------------------------------------
        if (!response.ok) {
            let errorText = "";
            try { errorText = await response.text(); } catch {}
            
            logger.error(`RUNWAY ERROR ${response.status}: ${errorText}`);
            
            return {
                erro: true,
                message: "Erro ao gerar vídeo na RUNWAY",
                status: response.status
            };
        }

        // ---------------------------------------------------
        // 6) Parse JSON
        // ---------------------------------------------------
        let data;
        try {
            data = await response.json();
        } catch (e) {
            logger.error("RUNWAY JSON ERROR:", e);
            return { erro: true, message: "Erro ao interpretar resposta da RUNWAY" };
        }

        // ---------------------------------------------------
        // 7) Compatibilidade com múltiplos formatos
        // ---------------------------------------------------
        const videoUrl =
            data?.output?.video_url ||
            data?.result?.video ||
            data?.video ||
            null;

        if (!videoUrl) {
            logger.error("RUNWAYML → resposta sem video_url válido:");
            logger.error(JSON.stringify(data));
            return { erro: true, message: "RUNWAY não retornou URL do vídeo" };
        }

        // ---------------------------------------------------
        // 8) Sucesso!
        // ---------------------------------------------------
        logger.success("Vídeo RUNWAYML gerado com sucesso!");

        return {
            erro: false,
            engine: "runway",
            url: videoUrl,
            raw: data
        };

    } catch (erro) {

        if (erro.name === "AbortError") {
            logger.error("RUNWAY TIMEOUT — API demorou muito.");
            return { erro: true, message: "Timeout ao contactar RUNWAY" };
        }

        logger.error("RUNWAYML ERROR (fetch falhou):");
        logger.error(erro);

        return { erro: true, message: "Erro interno ao contactar RUNWAY" };
    }
}


module.exports = { generateVideo };
