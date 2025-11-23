// =============================================================
// 🟦 YUNO IA — VIDEO GENERATOR CORE (v10.3 Híbrida)
// Handler unificado para gerar vídeos com HeyGen, Pika Labs,
// RunwayML e futuras engines de geração multimodal.
// =============================================================

const logger = require("../utils/logger");

// Importar integrações já criadas
const heygen = require("../integrations/video/heygen");
const pika = require("../integrations/video/pika");
const runway = require("../integrations/video/runwayml");

// Lista de engines suportadas
const SUPPORTED_ENGINES = ["heygen", "pika", "runway"];

/**
 * Gera um vídeo usando a engine escolhida.
 * @param {string} prompt - O texto que descreve o vídeo.
 * @param {string} engine - Nome da engine de vídeo.
 * @returns {Promise<string|null>} URL do vídeo ou null.
 */
async function generateVideo(prompt, engine) {
    try {
        // 1) Validar engine
        if (!engine || !SUPPORTED_ENGINES.includes(engine)) {
            logger.error(`Engine inválida: ${engine}`);
            return null;
        }

        // 2) Validar prompt
        if (!prompt || typeof prompt !== "string" || prompt.trim().length < 3) {
            logger.warn("Prompt inválido fornecido ao gerador de vídeo.");
            return null;
        }

        const cleanPrompt = prompt.trim();
        logger.info(`🎬 Gerando vídeo via ${engine.toUpperCase()}...`);

        // 3) Selecionar engine correta
        let result = null;

        if (engine === "heygen") result = await heygen.generateVideo(cleanPrompt);
        if (engine === "pika") result = await pika.generateVideo(cleanPrompt);
        if (engine === "runway") result = await runway.generateVideo(cleanPrompt);

        // 4) Validar resposta
        if (!result) {
            logger.error(`❌ Falha ao gerar vídeo na engine: ${engine}`);
            return null;
        }

        // 5) Sucesso!
        logger.success(`🎥 Vídeo gerado com sucesso pela ${engine.toUpperCase()}`);
        return result;

    } catch (err) {
        logger.error("Erro interno no módulo generateVideo:");
        console.error(err);
        return null;
    }
}

module.exports = { generateVideo };
