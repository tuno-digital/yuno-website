// ===============================================
// YUNO IA — Servidor Principal (v10.3 Híbrida)
// API Core + Integrações + Segurança + Logs
// ===============================================

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

// Rotas externas
const videoRouter = require("./routes/video-router");

// Inicialização servidor
const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// ==============================
// CRIA PASTAS AUTOMATICAMENTE
// ==============================
const TMP_DIR = path.join(__dirname, "..", "tmp");
const TMP_VIDEOS = path.join(TMP_DIR, "videos");

if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);
if (!fs.existsSync(TMP_VIDEOS)) fs.mkdirSync(TMP_VIDEOS);

// ==============================
// LOGS INICIAIS DA YUNO
// ==============================
console.log("====================================");
console.log("   🚀 YUNO IA — Servidor v10.3 ON   ");
console.log("====================================");

console.log("[INFO] Modo:", process.env.NODE_ENV || "development");
console.log("[INFO] Porta:", process.env.PORT || 3001);
console.log("[INFO] Pasta tmp/videos verificada.");
console.log("====================================");

// ==============================
// ROTA DE SAÚDE (HEALTH CHECK)
// ==============================
app.get("/api/estado", (req, res) => {
    return res.json({
        status: "online",
        version: "10.3",
        message: "YUNO IA server running 🚀"
    });
});

// ==============================
// SISTEMA DE PROTEÇÃO BÁSICA
// ==============================
app.use((req, res, next) => {
    // No futuro: validação de token, rate limit, anti-bot...
    console.log(`[REQ] ${req.method} ${req.url}`);
    next();
});

// ==============================
// ROTAS PRINCIPAIS
// ==============================
app.use("/api/video", videoRouter);

// Placeholder para futuras rota IA
// app.use("/api/ia", iaRouter);
// app.use("/api/admin", adminRouter);
// app.use("/api/auth", authRouter);

// ==============================
// ROTA 404 PADRÃO
// ==============================
app.use((req, res) => {
    res.status(404).json({
        erro: true,
        message: "Rota não encontrada na API da YUNO."
    });
});

// ==============================
// INICIAR SERVIDOR
// ==============================
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log("🔥 Servidor YUNO ativo na porta " + PORT);
});

