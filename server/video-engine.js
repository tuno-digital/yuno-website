/**
 * ==========================================================
 *  YUNO IA — VIDEO ENGINE 10.3 (Auditado)
 *  Servidor de geração de vídeo unificado
 *  Integra HeyGen, Pika Labs e RunwayML
 * ==========================================================
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Middlewares de segurança
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

// Importar SDKs internos da YUNO
const heygen = require("../integrations/video/heygen");
const pika = require("../integrations/video/pika");
const runway = require("../integrations/video/runwayml");

// Inicialização do servidor
const app = express();
app.use(cors());
app.use(express.json());
app.use(helmet());

// Limite de requisições (proteção contra abuso)
app.use(
    rateLimit({
        windowMs: 60 * 1000, // 1 minuto
        max: 10,
        message: { erro: "Muitas requisições. Aguarde um momento." }
    })
);

// =============================
// 🟦 STATUS ROUTE (NOVO 10.3)
// =============================
app.get("/api/video/status", (req, res) => {
    return res.json({
        status: "online",
        engines: {
            heygen: !!process.env.HEYGEN_API_KEY,
            pika: !!process.env.PIKA_API_KEY,
            runway: !!process.env.RUNWAY_API_KEY
        },
        version: "10.3"
    });
});

// =============================
// 🟩 Rota principal de geração
// =============================
app.post("/api/video/generate", async (req, res) => {
    try {
        const { prompt, engine } = req.body;

        if (!prompt || !prompt.trim()) {
            return res.status(400).json({ erro: "Prompt é obrigatório." });
        }

        if (!["heygen", "pika", "runway"].includes(engine)) {
            return res.status(400).json({ erro: "Engine inválido. Use: heygen, pika ou runway." });
        }

        let result = null;

        switch (engine) {
            case "heygen":
                result = await heygen.generateVideo(prompt);
                break;

            case "pika":
                result = await pika.generateVideo(prompt);
                break;

            case "runway":
                result = await runway.generateVideo(prompt);
                break;
        }

        return res.status(200).json({
            sucesso: true,
            engine,
            video: result
        });

    } catch (erro) {
        console.error("❌ Erro no servidor de vídeo:", erro);
        return res.status(500).json({ erro: "Erro interno no servidor." });
    }
});

// =============================
// 🟨 Rota para listar engines
// =============================
app.get("/api/video/engines", (req, res) => {
    res.json({
        enginesDisponiveis: ["heygen", "pika", "runway"],
        total: 3
    });
});

// =====================================
// 🟥 Rota para logs (futuro — v11.0)
// =====================================
app.get("/api/video/logs", (req, res) => {
    res.json({
        message: "Logs serão adicionados na versão 11.0",
        status: "placeholder"
    });
});

// =============================
// 🟦 Inicialização do Servidor
// =============================
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`🚀 Servidor de vídeo YUNO 10.3 online na porta ${PORT}`);
});
