// ============================================================
// YUNO IA — Rota de comunicação principal (10.3)
// ============================================================

const express = require("express");
const router = express.Router();

const yunoCore = require("../ia/yuno-core");

router.post("/message", async (req, res) => {
    try {
        const { message, userId } = req.body;

        if (!message) {
            return res.status(400).json({ erro: "Mensagem é obrigatória." });
        }

        const resposta = await yunoCore.process(message, userId);

        res.json({
            ok: true,
            resposta
        });

    } catch (e) {
        console.error("ERRO /api/ia/message:", e);
        res.status(500).json({ erro: "Falha interna na Yuno IA" });
    }
});

module.exports = router;

