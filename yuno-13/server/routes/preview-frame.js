// ===========================================================
// YUNO 13.0 — PREVIEW FRAME ROUTER (CORRIGIDO)
// Serve HTML seguro gerado pelo preview-engine
// ===========================================================

const express = require("express");
const router = express.Router();

// Controller responsável pelo preview
const previewController = require("../controllers/preview-controller");

// Logger
const logger = require("../core/logger");

// ===========================================================
// GET /api/preview-frame?id=XXXX
// ===========================================================
router.get("/", async (req, res) => {
    try {
        const idRaw = String(req.query.id || "").trim();

        // ID ausente
        if (!idRaw) {
            return res.status(400).send("Preview ID não fornecido.");
        }

        // Sanitização simples (evita payload sujo)
        const id = idRaw.replace(/[^a-zA-Z0-9_\-]/g, "");

        logger.info("Carregando preview-frame", { id });

        // Verificar se o controller tem loadPreviewFrame
        if (!previewController || typeof previewController.loadPreviewFrame !== "function") {
            logger.error("previewController.loadPreviewFrame não implementado.");
            return res.status(500).send("Preview service indisponível.");
        }

        // Carregar HTML
        const html = await previewController.loadPreviewFrame(id);

        // Se o preview não existir → 404
        if (!html) {
            logger.warn("Preview não encontrado", { id });
            return res.status(404).send("Preview não encontrado.");
        }

        // Header correto
        res.setHeader("Content-Type", "text/html; charset=utf-8");

        return res.send(html);

    } catch (err) {
        logger.error("Erro em GET /api/preview-frame", err);

        if (err.code === "ENOENT") {
            return res.status(404).send("Preview não encontrado.");
        }

        return res.status(500).send("Erro ao carregar preview-frame.");
    }
});

// ===========================================================
// EXPORTAR ROUTER
// ===========================================================
module.exports = router;
