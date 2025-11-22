// ===============================================
// YUNO IA — Video Router (v10.3)
// Conecta HeyGen, Pika Labs e RunwayML
// ===============================================

const express = require("express");
const router = express.Router();

// Motores de vídeo
const heygen = require("../../integrations/video/heygen");
const pika = require("../../integrations/video/pika");
const runway = require("../../integrations/video/runwayml");

// Logs padronizados
const log = (msg) => console.log(`[VIDEO ROUTER] ${msg}`);

router.post("/generate", async (req, res) => {
    try {
        const { prompt, engine } = req.body;

        log(`Pedido recebido → Engine: ${engine} | Prompt: ${prompt}`);

        if (!prompt || prompt.trim() === "") {
            return res.status(400).json({
                erro: true,
                mensagem: "O prompt é obrigatório."
            });
        }

        if (!engine) {
            return res.status(400).json({
                erro: true,
                mensagem: "É necessário escolher uma engine: heygen | pika | runway"
            });
        }

        let resultado = null;

        // ===========================
        // SELECTOR DE ENGINE
        // ===========================
        switch (engine.toLowerCase()) {
            case "heygen":
                resultado = await heygen.generateVideo(prompt);
                break;

            case "pika":
                resultado = await pika.generateVideo(prompt);
                break;

            case "runway":
                resultado = await runway.generateVideo(prompt);
                break;

            default:
                return res.status(400).json({
                    erro: true,
                    mensagem: "Engine inválida. Use: heygen | pika | runway"
                });
        }

        // ===========================
        // RESPOSTA FINAL
        // ===========================
        log(`Vídeo criado com sucesso usando ${engine}.`);

        return res.status(200).json({
            erro: false,
            engine,
            video: resultado
        });

    } catch (err) {
        log("🔥 ERRO GRAVE: " + err.message);

        return res.status(500).json({
            erro: true,
            mensagem: "Erro interno ao gerar vídeo.",
            detalhes: err.message
        });
    }
});

module.exports = router;
