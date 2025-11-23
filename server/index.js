// =============================================================
// 🟦 YUNO IA — Servidor Principal (v10.3 Híbrida Oficial)
// API Core + Integrações + Segurança + Logs + Middlewares
// =============================================================

// ENV
import dotenv from "dotenv";
dotenv.config();

// Core
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Utils & Segurança
import logger from "./utils/logger.js";
import validateEnv from "./utils/validate-env.js";   // <-- caminho corrigido
import rateLimitMiddleware from "./middlewares/rate-limit.js";

// Rotas principais
import videoRouter from "./routes/video-router.js";
import iaRouter from "./routes/ia-router.js";

// =============================================================
// 📌 Corrigir __dirname no ES Module
// =============================================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =============================================================
// 🔍 1. VALIDAR .env ANTES DE INICIAR
// =============================================================
validateEnv();

// =============================================================
// 🚀 2. CONFIGURAÇÃO DO SERVIDOR EXPRESS
// =============================================================
const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// =============================================================
// 📁 3. CRIAÇÃO AUTOMÁTICA DE PASTAS IMPORTANTES
// =============================================================
const TMP_DIR = path.join(__dirname, "..", "tmp");
const TMP_VIDEOS = path.join(TMP_DIR, "videos");
const LOG_DIR = path.join(__dirname, "logs");

if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });
if (!fs.existsSync(TMP_VIDEOS)) fs.mkdirSync(TMP_VIDEOS, { recursive: true });
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

logger.system("📁 Pastas verificadas: tmp/, tmp/videos/, logs/");

// =============================================================
// 🛡️ 4. MIDDLEWARE DE SEGURANÇA GLOBAL (YUNO 10.3)
// =============================================================
app.use(rateLimitMiddleware);

// =============================================================
// 📡 5. HEALTH CHECK
// =============================================================
app.get("/api/estado", (req, res) => {
    return res.json({
        status: "online",
        version: "10.3",
        uptime: process.uptime(),
        message: "YUNO IA server running 🚀"
    });
});

// =============================================================
// 🔗 6. ROTAS PRINCIPAIS DA API
// =============================================================
app.use("/api/video", videoRouter);
app.use("/api/ia", iaRouter);

// =============================================================
// ❌ 7. ROTA 404 PADRÃO DA API
// =============================================================
app.use((req, res) => {
    logger.warn(`Rota inexistente: ${req.method} ${req.url}`);

    res.status(404).json({
        erro: true,
        message: "Rota não encontrada na API da YUNO."
    });
});

// =============================================================
// 🔥 8. INICIAR SERVIDOR
// =============================================================
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    logger.success(`🔥 Servidor YUNO ativo na porta ${PORT}`);
    logger.info(`🌐 Ambiente: ${process.env.NODE_ENV || "development"}`);
    logger.info("🚀 API pronta para chamadas externas.");
});
