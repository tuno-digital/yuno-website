// ==============================================================
// YUNO 13.0 — SECURITY CONTROLLER (VERSÃO FINAL CORRIGIDA)
// Proteção, sanitização, auditoria, risco e pentest.
// ==============================================================

const sanitizer = require("../security/sanitizer");
const risk = require("../core/risk-analyzer");
const tester = require("../core/security-tester");
const state = require("../core/yuno-state");
const logger = require("../core/logger");
const audit = require("../security/audit-log");

// Util → validar texto curto
function textoValido(v) {
    return typeof v === "string" && v.length <= 200000;
}

// Util → proteger state.seguro de null/undefined
function garantirStateSeguro() {
    if (!state.seguro) state.seguro = {};
    if (typeof state.seguro.modoEstrito !== "boolean") state.seguro.modoEstrito = false;
    if (typeof state.seguro.cage !== "boolean") state.seguro.cage = false;
}

module.exports = {

    // ==========================================================
    // STATUS DE SEGURANÇA
    // GET /api/security/status
    // ==========================================================
    async status(req, res) {
        try {
            garantirStateSeguro();

            return res.json({
                ok: true,
                seguro: state.seguro.modoEstrito,
                cage: state.seguro.cage,
                memoria: state.memoria?.snapshots || 0,
                timestamp: Date.now()
            });

        } catch (err) {
            logger.error("ERRO em security-controller.status:", err);
            return res.status(500).json({ ok: false, erro: "Erro interno." });
        }
    },

    // ==========================================================
    // SCAN DE SEGURANÇA
    // POST /api/security/scan
    // ==========================================================
    async scan(req, res) {
        try {
            const scope = req.body?.scope || "";

            if (typeof scope !== "string") {
                return res.status(400).json({ ok: false, erro: "Scope inválido." });
            }

            const resultado = await risk.scanGlobal(scope);

            try { audit.registrar("security-scan", { scope, resultado }); } catch (_) {}

            return res.json({ ok: true, resultado });

        } catch (err) {
            logger.error("ERRO em security-controller.scan:", err);
            return res.status(500).json({ ok: false, erro: "Erro ao executar scan." });
        }
    },

    // ==========================================================
    // LISTAR LOGS DE AUDITORIA
    // GET /api/security/audit
    // ==========================================================
    async getAuditLogs(req, res) {
        try {
            const logs = await audit.listar();
            return res.json({ ok: true, logs });

        } catch (err) {
            logger.error("ERRO em security-controller.getAuditLogs:", err);
            return res.status(500).json({ ok: false, erro: "Erro ao obter logs." });
        }
    },

    // ==========================================================
    // APAGAR LOGS DE AUDITORIA
    // POST /api/security/clear-audit
    // ==========================================================
    async clearAudit(req, res) {
        try {
            await audit.limpar();
            return res.json({ ok: true, apagado: true });

        } catch (err) {
            logger.error("ERRO em security-controller.clearAudit:", err);
            return res.status(500).json({ ok: false, erro: "Erro ao limpar auditoria." });
        }
    },

    // ==========================================================
    // SANITIZAÇÃO DE TEXTO
    // POST /api/security/sanitize
    // ==========================================================
    async sanitize(req, res) {
        try {
            const input = req.body?.texto || "";

            if (!textoValido(input)) {
                return res.status(400).json({ ok: false, erro: "Texto inválido ou demasiado grande." });
            }

            const limpo = sanitizer.clean(input);

            try { audit.registrar("sanitize", { input, limpo }); } catch (_) {}

            return res.json({
                ok: true,
                original: input,
                limpo
            });

        } catch (err) {
            logger.error("ERRO em security-controller.sanitize:", err);
            return res.status(500).json({ ok: false, erro: "Erro na sanitização." });
        }
    },

    // ==========================================================
    // ANÁLISE DE RISCO DETALHADA
    // POST /api/security/risk
    // ==========================================================
    async risco(req, res) {
        try {
            const codigo = req.body?.codigo || "";
            const ficheiro = req.body?.ficheiro || "preview";

            if (!textoValido(codigo)) {
                return res.status(400).json({ ok: false, erro: "Código inválido." });
            }

            const resultado = await risk.analisar(codigo, ficheiro);

            try { audit.registrar("risk-analysis", resultado); } catch (_) {}

            return res.json({ ok: true, resultado });

        } catch (err) {
            logger.error("ERRO em security-controller.risco:", err);
            return res.status(500).json({ ok: false, erro: "Erro ao analisar risco." });
        }
    },

    // ==========================================================
    // PENTEST BÁSICO
    // POST /api/security/pentest
    // ==========================================================
    async pentest(req, res) {
        try {
            const codigo = req.body?.codigo || "";

            if (!textoValido(codigo)) {
                return res.status(400).json({ ok: false, erro: "Código demasiado grande ou inválido." });
            }

            const resultado = await tester.executar(codigo);

            try { audit.registrar("pentest", resultado); } catch (_) {}

            return res.json({ ok: true, resultado });

        } catch (err) {
            logger.error("ERRO em security-controller.pentest:", err);
            return res.status(500).json({ ok: false, erro: "Erro ao executar pentest." });
        }
    },

    // ==========================================================
    // MODO SEGURO ON/OFF
    // POST /api/security/safe-mode
    // ==========================================================
    async safeMode(req, res) {
        try {
            const ativo = req.body?.ativo;

            if (typeof ativo !== "boolean") {
                return res.status(400).json({
                    ok: false,
                    erro: "Envie true ou false."
                });
            }

            garantirStateSeguro();
            state.seguro.modoEstrito = ativo;

            try { audit.registrar("safe-mode", { ativo }); } catch (_) {}

            return res.json({
                ok: true,
                mensagem: `Modo seguro agora está: ${ativo ? "ATIVO" : "DESATIVADO"}`
            });

        } catch (err) {
            logger.error("ERRO em security-controller.safeMode:", err);
            return res.status(500).json({ ok: false, erro: "Erro ao alterar modo seguro." });
        }
    },

    // ==========================================================
    // VER LOGS DE AUDITORIA
    // GET /api/security/audit-log
    // ==========================================================
    async auditLog(req, res) {
        try {
            const logs = await audit.listar();

            return res.json({
                ok: true,
                logs
            });

        } catch (err) {
            logger.error("ERRO em security-controller.auditLog:", err);

            return res.status(500).json({
                ok: false,
                erro: "Erro ao obter logs."
            });
        }
    }
};
