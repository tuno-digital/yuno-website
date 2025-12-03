// ===========================================================
// YUNO 13.0 — IA ROUTER v2 (FULL, ULTRA SAFE)
// Entrada oficial da IA — 100% compatível com processar(req,res)
// SAFE, ESTÁVEL, FUTURE-PROOF
// ===========================================================

const express = require("express");
const router = express.Router();

// Controllers
const iaController = require("../controllers/ia-controller");
const statusController = require("../controllers/status-controller");
const previewController = require("../controllers/preview-controller");

// Segurança
const sanitizer = require("../security/sanitizer");

// Logger
const logger = require("../core/logger");

// -----------------------------------------------------------
// Helper padrão
// -----------------------------------------------------------
function sendResponse(res, payload = {}) {
    const status = typeof payload.status === "number"
        ? payload.status
        : payload.ok ? 200 : 400;

    return res.status(status).json({
        ok: payload.ok ?? false,
        message: payload.message || null,
        data: payload.data || null,
        preview: payload.preview || null,
        report: payload.report || null,
        error: payload.error ? String(payload.error).slice(0, 200) : null,
        timestamp: Date.now()
    });
}

// ===========================================================
// GET /api/ia → Healthcheck da IA
// ===========================================================
router.get("/", async (req, res) => {
    try {
        if (typeof statusController.health === "function") {
            return statusController.health(req, res);
        }

        return sendResponse(res, {
            ok: true,
            message: "YUNO 13.0 operacional (fallback)",
            data: { status: "fallback" }
        });

    } catch (err) {
        logger.error("Erro em GET /api/ia", err);
        return sendResponse(res, {
            ok: false,
            status: 500,
            error: "Erro interno ao verificar status."
        });
    }
});

// ===========================================================
// POST /api/ia/process → Núcleo da IA
// Detecta automaticamente qual função existe no controller
// ===========================================================
router.post("/process", async (req, res) => {
    try {
        req.body = req.body || {};

        // normalizar entrada
        req.body.prompt = sanitizer.clean(
            String(req.body.prompt || req.body.comando || req.body.message || "")
        ).trim();

        if (!req.body.prompt) {
            return sendResponse(res, {
                ok: false,
                status: 400,
                message: "Comando vazio.",
                error: "Nenhum prompt fornecido."
            });
        }

        logger.info("IA PROCESSANDO (router):", {
            tamanho: req.body.prompt.length
        });

        // =====================================================
        // DETECÇÃO AUTOMÁTICA DO MÉTODO DO CONTROLLER
        // =====================================================
        const handler =
            iaController.processar ??
            iaController.process ??
            iaController.run ??
            iaController.execute ??
            null;

        if (!handler) {
            logger.error("Nenhum handler encontrado no iaController.");
            return sendResponse(res, {
                ok: false,
                status: 500,
                error: "Motor IA não possui métodos válidos."
            });
        }

        // Se handler tem assinatura (req,res) → Express controller
        if (handler.length >= 2) {
            return handler(req, res);
        }

        // Senão é função pura → recebe o prompt
        const result = await handler(req.body.prompt);

        return sendResponse(res, {
            ok: result?.ok ?? true,
            data: result?.data ?? result
        });

    } catch (err) {
        logger.error("Erro em POST /api/ia/process:", err);
        return sendResponse(res, {
            ok: false,
            status: 500,
            error: "Erro interno ao processar IA."
        });
    }
});

// ===========================================================
// POST /api/ia/preview → gerar preview
// ===========================================================
router.post("/preview", async (req, res) => {
    try {
        if (typeof previewController.generate === "function") {
            return previewController.generate(req, res);
        }

        return sendResponse(res, {
            ok: false,
            status: 501,
            error: "Preview não implementado no servidor."
        });

    } catch (err) {
        logger.error("Erro em POST /api/ia/preview:", err);
        return sendResponse(res, {
            ok: false,
            status: 500,
            error: "Erro interno ao gerar preview."
        });
    }
});

// ===========================================================
// GET /api/ia/preview-frame?id=xxxx → serve HTML seguro
// ===========================================================
router.get("/preview-frame", async (req, res) => {
    try {
        if (typeof previewController.servirFrame === "function") {
            return previewController.servirFrame(req, res);
        }

        return res.status(501).send("preview-frame não implementado.");

    } catch (err) {
        logger.error("Erro em GET /api/ia/preview-frame:", err);
        return res.status(500).send("Erro ao carregar preview.");
    }
});

// ===========================================================
// EXPORTAR
// ===========================================================
module.exports = router;
