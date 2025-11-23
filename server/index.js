// =============================================================
// 🟦 YUNO IA — Servidor Principal (v10.3 Híbrida Oficial)
// API Core + Integrações + Segurança + Logs + Middlewares
// =============================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

// Utils & Segurança
const logger = require("./utils/logger");
const validateEnv = require("./utils/validateEnv");
const security = require("./middleware/security");
const rateLimitMiddleware = require("./middleware/rate-limit");

// Rotas principais
const videoRouter = require("./routes/video-router");

// 🔥 ROTA DA IA 10.3 (NOVO)
const iaRouter = require("./routes/ia-router");

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

if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);
if (!fs.existsSync(TMP_VIDEOS)) fs.mkdirSync(TMP_VIDEOS);
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);

logger.system("Pastas verificadas: tmp/, tmp/videos/, server/logs/");

// =============================================================
// 🛡️ 4. MIDDLEWARE DE SEGURANÇA GLOBAL (YUNO 10.3)
// =============================================================
app.use(security);            // Anti-bot / sanitização
app.use(rateLimitMiddleware); // Rate limit 10.3

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

// 🔥 NOVO — IA PRINCIPAL 10.3
app.use("/api/ia", iaRouter);

// Futuro:
// app.use("/api/admin", require("./routes/admin-router"));
// app.use("/api/auth", require("./routes/auth-router"));
// app.use("/api/automacoes", require("./routes/automacoes-router"));

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
