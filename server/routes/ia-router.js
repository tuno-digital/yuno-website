// ============================================================
// YUNO IA — IA ROUTER 10.3
// ============================================================

import express from "express";
const router = express.Router();

import logger from "../utils/logger.js";
import sanitize from "../utils/validate-text.js";

// NOVO ENGINE
import { YunoEngine } from "../ia/yuno-engine.js";

// ============================================================
// HEALTH CHECK
// ============================================================
router.get("/", (req, res) => {
    res.json({
        ok: true,
        ia: "Yuno 10.3",
        status: "online"
    });
});

// ============================================================
// PROCESSAR MENSAGEM
// ============================================================
router.post("/process", async (req, res) => {
    try {
        const { prompt } = req.body;

        const clean = sanitize(prompt);
        if (!clean) {
            return res.status(400).json({
                ok: false,
                erro: "Mensagem vazia."
            });
        }

        const resposta = await YunoEngine.process(clean);

        res.json({
            ok: true,
            resposta
        });

    } catch (e) {
        logger.error(e);
        res.status(500).json({
            ok: false,
            erro: "Erro interno da IA."
        });
    }
});

export default router;
