// ===========================================================
// YUNO 13.0 — STATUS ROUTER (CORRIGIDO)
// Verifica saúde do sistema, motores da IA e telemetria básica
// ===========================================================

const express = require("express");
const router = express.Router();

// Controller correto
const statusController = require("../controllers/status-controller");

// Logger
const logger = require("../core/logger");

// ===========================================================
// GET /api/status
// Healthcheck completo da YUNO 13.0
// ===========================================================
router.get("/", async (req, res) => {
    try {
        logger.info("STATUS CHECK solicitado");

        // CORREÇÃO: statusController.status() NÃO EXISTE
        const status = await statusController.health();

        return res.status(200).json({
            ok: true,
            message: "Status operacional",
            data: status,
            timestamp: Date.now()
        });

    } catch (err) {
        logger.error("Erro em GET /api/status", err);

        // CORREÇÃO — NÃO EXPOR err.message
        return res.status(500).json({
            ok: false,
            error: "Erro interno ao verificar status.",
            timestamp: Date.now()
        });
    }
});

// ===========================================================
// EXPORTAR ROUTER
// ===========================================================
module.exports = router;
