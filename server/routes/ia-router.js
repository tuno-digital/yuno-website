// ============================================================
// 🔥 YUNO IA — Rota Oficial de Comunicação (v10.3 Híbrida)
// Unifica /process + /message + suporte total YUNO_CORE
// ============================================================

// Compatibilidade híbrida
const isNode = typeof module !== "undefined" && module.exports;

// ==========================
// IMPORTS (ESM ou CJS)
// ==========================
let express;
let YUNO_CORE;

if (isNode) {
    express = require("express");
    YUNO_CORE = require("../ia/yuno-core");
} else {
    // Browser (raro, mas mantido para Next/SSR)
    express = window.express;
    YUNO_CORE = window.YUNO_CORE;
}

const router = express.Router();

// ==================================================================
// POST /api/ia/process
// Aceita prompt OU message, em formato flexível
// ==================================================================
router.post("/process", async (req, res) => {
    try {
        const { prompt, message, userId } = req.body;

        const text = prompt || message;

        if (!text)
            return res.status(400).json({ erro: "Mensagem ou prompt obrigatório." });

        // Pipeline central do motor 10.3
        const resposta = await YUNO_CORE.process(text, userId);

        res.json({ ok: true, resposta });

    } catch (e) {
        console.error("ERRO /api/ia/process:", e);
        res.status(500).json({ erro: "Falha interna na Yuno IA 10.3" });
    }
});

// ==================================================================
// POST /api/ia/message
// Mantido por compatibilidade com versões anteriores
// ==================================================================
router.post("/message", async (req, res) => {
    try {
        const { message, userId } = req.body;

        if (!message)
            return res.status(400).json({ erro: "Mensagem é obrigatória." });

        const resposta = await YUNO_CORE.process(message, userId);

        res.json({ ok: true, resposta });

    } catch (e) {
        console.error("ERRO /api/ia/message:", e);
        res.status(500).json({ erro: "Falha interna na Yuno IA 10.3" });
    }
});

// ==========================
// EXPORTAÇÃO HÍBRIDA
// ==========================
if (isNode) {
    module.exports = router;
} else {
    window.YUNO_IA_ROUTER = router;
}
