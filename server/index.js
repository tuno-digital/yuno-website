// =====================================================
// YUNO IA — Servidor Principal (v10.3 Híbrida Oficial)
// Core API • Integrações • Segurança Básica • Logs
// =====================================================

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

// Rotas externas
const videoRouter = require("./routes/video-router");

// Inicializar servidor
const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// =====================================================
// CRIAR PASTAS AUTOMÁTICAS (tmp/ e tmp/videos)
// =====================================================
const TMP_DIR = path.join(__dirname, "tmp");
const TMP_VIDEOS = path.join(TMP_DIR, "videos");

if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR);
    console.log("[DIR] Criado: /server/tmp");
}

if (!fs.existsSync(TMP_VIDEOS)) {
    fs.mkdirSync(TMP_VIDEOS);
    console.log("[DIR] Criado: /server/tmp/videos");
}

// =====================================================
// LOGS INICIAIS DO SERVIDOR
// =====================================================
console.log("========================================");
console.log("   🚀 YUNO IA — Servidor v10.3 ATIVO     ");
console.log("========================================");
console.log("[INFO] Ambiente:", process.env.NODE_ENV || "development");
console.log("[INFO] Porta:", process.env.PORT || 3001);
console.log("[INFO] Pasta tmp/videos verificada.");
console.log("========================================");

// =====================================================
// HEALTH CHECK (rota de status do servidor)
// =====================================================
app.get("/api/estado", (req, res) => {
    return res.json({
        status: "online",
        version: "10.3",
        message: "Servidor YUNO IA operacional 🚀"
    });
});

// =====================================================
// SISTEMA DE PROTEÇÃO BÁSICA 10.3
// =====================================================
app.use((req, res, next) => {
    // Futuro: token, rate limit, firewall, anti-bot
    console.log(`[REQ] ${req.method} → ${req.url}`);
    next();
});

// =====================================================
// ROTAS PRINCIPAIS
// =====================================================
app.use("/api/video", videoRouter);

// Futuras rotas oficiais:
// app.use("/api/ia", iaRouter);
// app.use("/api/auth", authRouter);
// app.use("/api/admin", adminRouter);
// app.use("/api/integrations", integrationsRouter);

// =====================================================
// ROTA 404 PADRÃO DA API
// =====================================================
app.use((req, res) => {
    res.status(404).json({
        erro: true,
        message: "Rota não encontrada na API YUNO."
    });
});

// =====================================================
// INICIAR SERVIDOR
// =====================================================
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log("🔥 Servidor YUNO IA 10.3 iniciado na porta " + PORT);
});
