// ==============================================================
// YUNO 13.0 — BUILDER ROUTER (VERSÃO BLINDADA)
// Rotas do Auto-Builder com segurança avançada
// ==============================================================

const express = require("express");
const router = express.Router();

const builderController = require("../controllers/builder-controller");
const sanitizer = require("../security/sanitizer");
const logger = require("../core/logger");
const yunoState = require("../core/yuno-state");

// ===========================================================
// Helper — resposta padronizada e segura
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
        report: payload.report || null,
        previewId: payload.previewId || null,
        error: safeError,
        timestamp: Date.now()
    });
}

// ===========================================================
// Middleware — valida modo de segurança
// ===========================================================
function ensureSafeMode(req, res, next) {
    if (yunoState.seguro?.modoEstrito === false) {
        return sendResponse(res, {
            ok: false,
            message: "Operação bloqueada — modo seguro desativado.",
            error: "BlockedBySafeMode"
        });
    }
    next();
}

// ===========================================================
// Middleware — valida input mínimo
// ===========================================================
function validateBodyField(fieldName) {
    return (req, res, next) => {
        if (!req.body || !req.body[fieldName]) {
            return sendResponse(res, {
                ok: false,
                message: `${fieldName} ausente.`,
                error: `Campo ${fieldName} não encontrado.`
            });
        }
        next();
    };
}

// ===========================================================
// POST /api/builder/preview
// Gera preview SEM aplicar patch
// ===========================================================
router.post(
    "/preview",
    sanitizer.cleanInput,
    ensureSafeMode,
    validateBodyField("blueprint"),
    async (req, res) => {
        try {
            const { blueprint } = req.body;

            // Limite de tamanho do blueprint
            if (typeof blueprint !== "string" || blueprint.length > 100_000) {
                return sendResponse(res, {
                    ok: false,
                    message: "Blueprint demasiado grande ou inválido.",
                    error: "OversizedBlueprint"
                });
            }

            logger.info("BUILDER PREVIEW solicitado.");

            const result = await builderController.generatePreview(blueprint);

            return sendResponse(res, {
                ok: result.ok,
                message: "Preview gerado.",
                previewId: result.previewId,
                report: result.report
            });
        } catch (err) {
            logger.error("Erro em POST /builder/preview", err);
            return sendResponse(res, {
                ok: false,
                error: "Erro ao gerar preview."
            });
        }
    }
);

// ===========================================================
// POST /api/builder/apply
// Aplica patch APÓS aprovação humana
// ===========================================================
router.post(
    "/apply",
    sanitizer.cleanInput,
    ensureSafeMode,
    validateBodyField("patchId"),
    async (req, res) => {
        try {
            const { patchId } = req.body;

            if (typeof patchId !== "string" || patchId.length > 200) {
                return sendResponse(res, {
                    ok: false,
                    message: "Patch ID inválido.",
                    error: "InvalidPatchId"
                });
            }

            logger.info("APPLY PATCH solicitado.");

            const result = await builderController.applyPatch(patchId);

            return sendResponse(res, {
                ok: result.ok,
                message: result.message,
                report: result.report || null
            });
        } catch (err) {
            logger.error("Erro em POST /builder/apply", err);
            return sendResponse(res, { ok: false, error: "Erro ao aplicar patch." });
        }
    }
);

// ===========================================================
// POST /api/builder/reject
// Rejeita patch + remove preview
// ===========================================================
router.post(
    "/reject",
    sanitizer.cleanInput,
    ensureSafeMode,
    validateBodyField("previewId"),
    async (req, res) => {
        try {
            const { previewId } = req.body;

            if (typeof previewId !== "string" || previewId.length > 200) {
                return sendResponse(res, {
                    ok: false,
                    message: "Preview ID inválido.",
                    error: "InvalidPreviewId"
                });
            }

            logger.info("REJECT PATCH solicitado.");

            const result = await builderController.rejectPreview(previewId);

            return sendResponse(res, {
                ok: result.ok,
                message: "Preview rejeitado e removido.",
                report: result.report
            });
        } catch (err) {
            logger.error("Erro em POST /builder/reject", err);
            return sendResponse(res, { ok: false, error: "Erro ao rejeitar preview." });
        }
    }
);

// ===========================================================
// POST /api/builder/rollback
// Reverte alterações aplicadas
// ===========================================================
router.post(
    "/rollback",
    sanitizer.cleanInput,
    ensureSafeMode,
    validateBodyField("rollbackId"),
    async (req, res) => {
        try {
            const { rollbackId } = req.body;

            if (typeof rollbackId !== "string" || rollbackId.length > 200) {
                return sendResponse(res, {
                    ok: false,
                    message: "Rollback ID inválido.",
                    error: "InvalidRollbackId"
                });
            }

            logger.info("ROLLBACK solicitado.");

            const result = await builderController.rollback(rollbackId);

            return sendResponse(res, {
                ok: result.ok,
                message: result.message,
                report: result.report
            });
        } catch (err) {
            logger.error("Erro em POST /builder/rollback", err);
            return sendResponse(res, { ok: false, error: "Erro no rollback." });
        }
    }
);

module.exports = router;
