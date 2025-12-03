// ===========================================================
// YUNO 13.0 — SECURITY ROUTER (CORRIGIDO CIRURGICAMENTE)
// ===========================================================

const express = require("express");
const router = express.Router();

// Segurança interna
const sanitizer = require("../security/sanitizer");
const permissions = require("../security/permissions");
const cage = require("../security/cage-engine");

// Controladores
const securityController = require("../controllers/security-controller");

// Logger
const logger = require("../core/logger");

// ===========================================================
// UTIL: Resposta padrão (corrigido para não vazar err.message)
// ===========================================================
function sendResponse(res, payload = {}) {
    const status = typeof payload.status === "number"
        ? payload.status
        : (payload.ok ? 200 : 400);

    return res.status(status).json({
        ok: payload.ok ?? false,
        message: payload.message || null,
        data: payload.data || null,
        report: payload.report || null,
        error: payload.error ? "Erro interno." : null,
        timestamp: Date.now()
    });
}

// ===========================================================
// GET /api/security/status
// ===========================================================
router.get("/status", async (req, res) => {
    try {
        const result = await securityController.status();
        return sendResponse(res, { ok: true, data: result });
    } catch (err) {
        logger.error("Erro em GET /api/security/status", err);
        return sendResponse(res, { ok: false, status: 500, error: true });
    }
});

// ===========================================================
// POST /api/security/scan
// ===========================================================
router.post("/scan", sanitizer.cleanInput, permissions.requireAdmin, async (req, res) => {
    try {
        logger.info("SECURITY SCAN solicitado");

        const { scope } = req.body || {};
        const result = await securityController.scan(scope);

        return sendResponse(res, {
            ok: true,
            message: "Scan de segurança concluído.",
            report: result
        });

    } catch (err) {
        logger.error("Erro em POST /api/security/scan", err);
        return sendResponse(res, { ok: false, status: 500, error: true });
    }
});

// ===========================================================
// POST /api/security/cage
// ===========================================================
router.post("/cage", permissions.requireAdmin, async (req, res) => {
    try {
        const enabled = cage.toggle();

        return sendResponse(res, {
            ok: true,
            message: enabled
                ? "Modo GAIOLA ativado — IA limitada."
                : "Modo GAIOLA desativado — IA liberada.",
            data: { cageEnabled: enabled }
        });

    } catch (err) {
        logger.error("Erro em POST /api/security/cage", err);
        return sendResponse(res, { ok: false, status: 500, error: true });
    }
});

// ===========================================================
// GET /api/security/audit
// ===========================================================
router.get("/audit", permissions.requireAdmin, async (req, res) => {
    try {
        const result = await securityController.getAuditLogs();
        return sendResponse(res, { ok: true, data: result });
    } catch (err) {
        logger.error("Erro em GET /api/security/audit", err);
        return sendResponse(res, { ok: false, status: 500, error: true });
    }
});

// ===========================================================
// POST /api/security/clear-audit
// ===========================================================
router.post("/clear-audit", permissions.requireAdmin, async (req, res) => {
    try {
        const result = await securityController.clearAudit();

        return sendResponse(res, {
            ok: true,
            message: "Logs de auditoria apagados.",
            data: result
        });

    } catch (err) {
        logger.error("Erro em POST /api/security/clear-audit", err);
        return sendResponse(res, { ok: false, status: 500, error: true });
    }
});

// ===========================================================
// EXPORT
// ===========================================================
module.exports = router;
