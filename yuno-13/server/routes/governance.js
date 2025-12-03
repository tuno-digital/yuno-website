// ==============================================================
// YUNO 13.0 — GOVERNANCE ROUTER (VERSÃO BLINDADA)
// Gestão de modos, políticas e estado global da YUNO
// ==============================================================

const express = require("express");
const router = express.Router();

// Segurança
const permissions = require("../security/permissions");

// Estado
const yunoState = require("../core/yuno-state");

// Controller correto para políticas
const governanceController = require("../controllers/governance-controller");

// Logger
const logger = require("../core/logger");

// ===========================================================
// Utilidade de resposta segura
// ===========================================================
function sendResponse(res, payload = {}) {

    const safeError =
        typeof payload.error === "string"
            ? payload.error.replace(/[\n\r]/g, "").slice(0, 300)
            : null;

    return res.status(payload.status || 200).json({
        ok: payload.ok ?? false,
        message: payload.message || null,
        data: payload.data || null,
        error: safeError,
        timestamp: Date.now()
    });
}

// ===========================================================
// GET /api/governance/state
// Estado global atual da YUNO
// ===========================================================
router.get("/state", permissions.requireAdmin, async (req, res) => {
    try {
        const state = yunoState.getAll();
        return sendResponse(res, { ok: true, data: state });

    } catch (err) {
        logger.error("Erro em GET /api/governance/state", err);
        return sendResponse(res, { ok: false, error: "Erro ao obter estado." });
    }
});

// ===========================================================
// POST /api/governance/mode
// Alterar modo principal da YUNO
// Body: { mode: "safe" }
// ===========================================================
router.post("/mode", permissions.requireAdmin, async (req, res) => {
    try {
        const { mode } = req.body;

        if (!mode) {
            return sendResponse(res, {
                ok: false,
                message: "Modo não enviado.",
                error: "Campo 'mode' ausente."
            });
        }

        const result = yunoState.setModo(mode);

        logger.info(`GOVERNANCE: modo alterado para ${mode}`);

        return sendResponse(res, {
            ok: true,
            message: `Modo alterado para ${mode}`,
            data: result || true
        });

    } catch (err) {
        logger.error("Erro em POST /api/governance/mode", err);
        return sendResponse(res, { ok: false, error: "Falha ao mudar modo." });
    }
});

// ===========================================================
// POST /api/governance/policy
// Atualizar política de operação
// Body: { key: "...", value: ... }
// ===========================================================
router.post("/policy", permissions.requireAdmin, async (req, res) => {
    try {
        const { key, value } = req.body;

        if (!key) {
            return sendResponse(res, {
                ok: false,
                message: "Nenhuma chave enviada.",
                error: "Campo 'key' ausente."
            });
        }

        const result = governanceController.updatePolicy(key, value);

        return sendResponse(res, {
            ok: true,
            message: "Política atualizada.",
            data: result || true
        });

    } catch (err) {
        logger.error("Erro em POST /api/governance/policy", err);
        return sendResponse(res, { ok: false, error: "Falha ao atualizar política." });
    }
});

// ===========================================================
// POST /api/governance/reset
// Resetar modo + políticas para estado inicial
// ===========================================================
router.post("/reset", permissions.requireAdmin, async (req, res) => {
    try {
        const result = yunoState.resetar();

        logger.warn("GOVERNANCE: RESET executado.");

        return sendResponse(res, {
            ok: true,
            message: "Governança resetada.",
            data: result || true
        });

    } catch (err) {
        logger.error("Erro em POST /api/governance/reset", err);
        return sendResponse(res, { ok: false, error: "Falha ao resetar governança." });
    }
});

module.exports = router;
