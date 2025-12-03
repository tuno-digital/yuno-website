// ==============================================================
// YUNO 13.0 — BUILDER CONTROLLER (AUDITADO E CORRIGIDO)
// Controla preview, patches, validação e fluxo de construção.
// ==============================================================

const builder = require("../builder/builder-engine");
const previewEngine = require("../core/preview-engine");
const testEngine = require("../core/test-engine");
const state = require("../core/yuno-state");
const logger = require("../core/logger");
const audit = require("../security/audit-log");

// Limites de segurança
const MAX_CODIGO_BYTES = 200_000;

// Sanitização básica do "alvo"
function validarAlvo(alvo) {
    if (!alvo) return false;
    if (typeof alvo !== "string") return false;
    if (alvo.includes("..")) return false;
    if (!/^[\w\-\/\.]+$/.test(alvo)) return false;
    return true;
}

module.exports = {

    // ==========================================================
    // 1) GERAR PREVIEW → /api/builder/preview
    // ==========================================================
    async gerarPreview(req, res) {
        try {
            const alvo = req.body?.alvo || null;
            const codigo = req.body?.codigo || "";

            logger.info(`BUILDER: Preview solicitado para "${alvo}"`);

            // 1. Validar alvo
            if (!validarAlvo(alvo)) {
                return res.status(400).json({
                    ok: false,
                    erro: "Alvo inválido."
                });
            }

            // 2. Limite de tamanho
            if (typeof codigo !== "string" || codigo.length > MAX_CODIGO_BYTES) {
                return res.status(400).json({
                    ok: false,
                    erro: "Código demasiado grande ou inválido."
                });
            }

            // 3. Gerar preview
            if (typeof previewEngine.gerar !== "function") {
                logger.error("previewEngine.gerar NÃO existe!");
                return res.status(500).json({
                    ok: false,
                    erro: "Módulo de preview indisponível."
                });
            }

            const preview = await previewEngine.gerar(alvo, codigo);

            if (!preview || !preview.html) {
                logger.error("PreviewEngine retornou preview inválido:", preview);
                return res.status(500).json({
                    ok: false,
                    erro: "Falha ao gerar preview."
                });
            }

            // 4. Testar preview
            const testes = await testEngine.testar(preview.html, alvo);

            if (!testes || !testes.ok) {
                logger.warn("BUILDER: Preview reprovado nos testes.");
                return res.status(422).json({
                    ok: false,
                    erro: "Preview contém problemas.",
                    testes
                });
            }

            // 5. Guardar estado
            state.setPreview(preview.id);

            return res.json({
                ok: true,
                mensagem: "Preview gerado com sucesso.",
                previewId: preview.id,
                html: preview.html,
                ficheiros: preview.ficheiros,
                relatorio: preview.relatorio,
                caminho: preview.caminho
            });

        } catch (err) {
            logger.error("ERRO no gerarPreview:", err);

            return res.status(500).json({
                ok: false,
                erro: "Erro interno ao gerar preview."
                // detalhe ocultado por segurança
            });
        }
    },

    // ==========================================================
    // 2) CRIAR PATCH (modo seguro) → /api/builder/patch
    // ==========================================================
    async gerarPatch(req, res) {
        try {
            const alvo = req.body?.alvo || null;
            const codigo = req.body?.codigo || "";

            logger.info(`BUILDER: Patch solicitado para "${alvo}"`);

            if (!validarAlvo(alvo)) {
                return res.status(400).json({ ok:false, erro:"Alvo inválido." });
            }

            if (codigo.length > MAX_CODIGO_BYTES) {
                return res.status(400).json({ ok:false, erro:"Código demasiado grande." });
            }

            if (typeof builder.gerarPatch !== "function") {
                logger.error("builder.gerarPatch NÃO existe!");
                return res.status(500).json({ ok:false, erro:"Builder indisponível." });
            }

            const patch = await builder.gerarPatch(alvo, codigo);

            // Salvar patch pendente
            state.setPatch(patch);

            audit.writeAudit("builder.patch.criado", {
                alvo,
                patchId: patch?.patchId,
                tamanho: codigo.length,
                user: req.user?.id || "desconhecido",
                ip: req.ip
            });

            return res.json({
                ok: true,
                mensagem: "Patch criado e aguardando aprovação.",
                patch
            });

        } catch(err) {
            logger.error("ERRO no gerarPatch:", err);
            return res.status(500).json({
                ok:false,
                erro:"Erro interno ao gerar patch."
            });
        }
    },

    // ==========================================================
    // 3) APLICAR PATCH → /api/builder/aplicar
    // ==========================================================
    async aplicar(req, res) {
        try {
            const patch = state.patchPendente;

            if (!patch) {
                return res.json({ ok:false, erro:"Nenhum patch pendente." });
            }

            if (typeof builder.aplicarPatch !== "function") {
                logger.error("builder.aplicarPatch NÃO existe!");
                return res.status(500).json({
                    ok:false,
                    erro:"Módulo de aplicação indisponível."
                });
            }

            logger.info("BUILDER: Aplicando patch aprovado...");

            const resultado = await builder.aplicarPatch(patch);

            if (!resultado?.ok) {
                audit.writeAudit("builder.patch.falha", {
                    patchId: patch.patchId,
                    motivo: resultado?.error || "desconhecido",
                    ip: req.ip
                });

                return res.json({
                    ok:false,
                    erro:"Falha ao aplicar patch.",
                    resultado
                });
            }

            // Limpar estado
            state.limparPreview();
            if (state.clearPatch) state.clearPatch();

            audit.writeAudit("builder.patch.aplicado", {
                patchId: patch.patchId,
                file: patch.file,
                ip: req.ip
            });

            return res.json({
                ok:true,
                mensagem:"Patch aplicado com sucesso.",
                resultado
            });

        } catch(err) {
            logger.error("ERRO no aplicarPatch:", err);
            return res.status(500).json({
                ok:false,
                erro:"Erro interno ao aplicar patch."
            });
        }
    },

    // ==========================================================
    // 4) CANCELAR PATCH → /api/builder/cancelar
    // ==========================================================
    async cancelar(req, res) {
        state.limparPreview();
        if (state.clearPatch) state.clearPatch();

        logger.warn("BUILDER: Patch cancelado.");

        audit.writeAudit("builder.patch.cancelado", {
            user: req.user?.id || "desconhecido",
            ip: req.ip
        });

        return res.json({
            ok:true,
            mensagem:"Patch cancelado com sucesso."
        });
    }
};
