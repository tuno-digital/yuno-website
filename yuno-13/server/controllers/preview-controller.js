// ==============================================================
// YUNO 13.0 — PREVIEW CONTROLLER (CORRIGIDO E SEGURO)
// Serve previews seguros para o iframe e cockpit.
// ==============================================================

const fs = require("fs/promises");
const path = require("path");
const logger = require("../core/logger");

const PREVIEW_DIR = path.join(__dirname, "..", "previews");

// Sanitizador simples (garante que scripts não executam)
function sanitize(content) {
    if (!content) return "";
    return String(content)
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
        .replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, "")
        .replace(/javascript:/gi, "")
        .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "");
}

// Normalizar ID (sem permitir ../ nem chars perigosos)
function normalizarId(id) {
    if (typeof id !== "string") return null;
    if (!/^[a-zA-Z0-9_\-]+$/.test(id)) return null;
    return id;
}

module.exports = {

    // ==========================================================
    // 1) SERVIR PREVIEW HTML PARA O IFRAME
    // Endpoint: /api/preview/frame?id=XXX
    // ==========================================================
    async servirFrame(req, res) {
        try {
            let id = normalizarId(req.query?.id);

            if (!id) {
                return res.status(400).send("Preview ID inválido.");
            }

            logger.info(`PREVIEW: A servir preview-frame para ID → ${id}`);

            const caminho = path.join(PREVIEW_DIR, `${id}.json`);

            // Garantir que não sai da pasta previews
            if (!caminho.startsWith(PREVIEW_DIR)) {
                return res.status(400).send("ID inválido.");
            }

            let raw;
            try {
                raw = await fs.readFile(caminho, "utf8");
            } catch {
                return res.status(404).send("Preview não encontrado.");
            }

            let previewData;
            try {
                previewData = JSON.parse(raw);
            } catch (e) {
                logger.error("Preview JSON corrompido:", e);
                return res.status(500).send("Preview inválido.");
            }

            const cssSeguro = sanitize(previewData.css || "");
            const htmlSeguro = sanitize(previewData.html || "");

            // HTML seguro, protegido com CSP e SEM executar JS
            const htmlFinal = `
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="
        default-src 'none';
        img-src data:;
        style-src 'self' 'unsafe-inline';
        font-src 'self';
        frame-ancestors 'none';
        base-uri 'none';
    ">
    <style>${cssSeguro}</style>
</head>
<body>
    ${htmlSeguro}
</body>
</html>
            `.trim();

            res.setHeader("Content-Type", "text/html; charset=utf-8");
            return res.status(200).send(htmlFinal);

        } catch (err) {
            logger.error("ERRO no preview-controller (servirFrame):", err);
            return res.status(500).send("Erro interno ao carregar o preview.");
        }
    },

    // ==========================================================
    // 2) OBTER METADADOS DO PREVIEW
    // Endpoint: /api/preview/info?id=XXX
    // ==========================================================
    async info(req, res) {
        try {
            let id = normalizarId(req.query?.id);

            if (!id) {
                return res.status(400).json({ ok: false, erro: "Preview ID inválido." });
            }

            const caminho = path.join(PREVIEW_DIR, `${id}.json`);

            if (!caminho.startsWith(PREVIEW_DIR)) {
                return res.status(400).json({ ok: false, erro: "ID inválido." });
            }

            let raw;
            try {
                raw = await fs.readFile(caminho, "utf8");
            } catch {
                return res.status(404).json({ ok: false, erro: "Preview não encontrado." });
            }

            let previewData;
            try {
                previewData = JSON.parse(raw);
            } catch (e) {
                logger.error("Preview JSON corrompido:", e);
                return res.status(500).json({ ok: false, erro: "Preview inválido." });
            }

            // Só devolvemos METADADOS — nunca paths internos
            return res.json({
                ok: true,
                previewId: id,
                ficheiros: previewData.ficheiros || [],
                relatorio: previewData.relatorio || [],
            });

        } catch (err) {
            logger.error("ERRO no preview-controller (info):", err);
            return res.status(500).json({
                ok: false,
                erro: "Erro interno ao obter informações do preview."
            });
        }
    }
};
