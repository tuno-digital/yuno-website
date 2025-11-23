// ============================================================
// 🔥 YUNO IA — Rota Oficial de Comunicação (v10.3 Híbrida)
// Unifica /process + /message + suporte ao YUNO_CORE completo
// ============================================================

// IMPORTS
const express = require("express");
const router = express.Router();

const logger = require("../utils/logger");
const sanitize = require("../utils/validate-text"); // sanitização opcional (10.3)
const YUNO_CORE = require("../ia/yuno-core");
const memory = require("../ia/memory-system");
const commands = require("../ia/command-engine");

// ============================================================
// 🧪 HEALTH CHECK LOCAL DA IA
// ============================================================
router.get("/", (req, res) => {
    return res.json({
        ok: true,
        message: "YUNO IA 10.3 — IA Router online",
        version: "10.3"
    });
});

// ============================================================
// POST /api/ia/process
// Entrada principal da Inteligência Artificial
// ============================================================
router.post("/process", async (req, res) => {
    try {
        const { prompt, message, userId = "anon" } = req.body;

        const text = sanitize(prompt || message);

        if (!text) {
            return res.status(400).json({
                ok: false,
                erro: "Mensagem inválida ou vazia."
            });
        }

        logger.info(`📥 Entrada IA › ${text}`);

        // 🔥 Guardar memória curta
        memory.shortTermPush({
            user: userId,
            message: text,
            timestamp: Date.now()
        });

        // 🔐 Verificar se é comando de criador
        if (commands.isCreatorCommand(text)) {
            logger.system("🔐 Comando do criador detectado.");
            const resp = await commands.execute(text);
            return res.json({ ok: true, resposta: resp });
        }

        // 🧠 PROCESSAMENTO IA
        const resposta = await YUNO_CORE.process(text, userId);

        logger.success("🤖 Resposta gerada com sucesso.");

        return res.json({
            ok: true,
            resposta
        });

    } catch (e) {
        logger.error("ERRO INTERNO IA /process: " + e);
        return res.status(500).json({
            ok: false,
            erro: "Falha interna na YUNO 10.3."
        });
    }
});

// ============================================================
// POST /api/ia/message (compatibilidade legacy)
// ============================================================
router.post("/message", async (req, res) => {
    try {
        const { message, userId = "anon" } = req.body;

        const text = sanitize(message);

        if (!text) {
            return res.status(400).json({
                ok: false,
                erro: "Mensagem inválida."
            });
        }

        logger.info(`📥 Entrada IA (legacy) › ${text}`);

        // 🔐 criador?
        if (commands.isCreatorCommand(text)) {
            const resp = await commands.execute(text);
            return res.json({ ok: true, resposta: resp });
        }

        const resposta = await YUNO_CORE.process(text, userId);

        return res.json({ ok: true, resposta });

    } catch (e) {
        logger.error("ERRO INTERNO IA /message: " + e);
        return res.status(500).json({
            ok: false,
            erro: "Erro interno na rota IA legacy."
        });
    }
});

// ============================================================
// EXPORTAÇÃO
// ============================================================
module.exports = router;
