// ==============================================================
// YUNO 13.0 — STATUS CONTROLLER (VERSÃO FINAL CORRIGIDA)
// Telemetria, estado interno, dependências e healthcheck.
// ==============================================================

const state = require("../core/yuno-state");
const logger = require("../core/logger");

// Util para criar timestamp seguro e legível
const now = () => new Date().toISOString();

// Cria um state seguro e filtrado
function getSafeState() {
    try {
        const full = state.getAll();

        // Nunca devolver state bruto!
        // Filtra e devolve apenas o que é SEGURO
        return {
            modo: full?.modo ?? null,
            autonomia: full?.autonomia ?? null,
            memoria: full?.memoria?.snapshots ?? null,
            versao: "13.0",
            ultimaIntent: full?.ultimaIntent ?? null,
            ultimaExecucao: full?.ultimaExecucao ?? null
        };

    } catch {
        return {
            modo: state?.modo ?? null,
            autonomia: state?.autonomia ?? null,
            versao: "13.0"
        };
    }
}

module.exports = {

    // ==========================================================
    // 1) HEALTHCHECK COMPLETO
    // Rota: /api/status/health
    // ==========================================================
    async health(req, res) {
        try {
            logger.info("STATUS: Healthcheck solicitado.");

            return res.json({
                ok: true,
                status: "YUNO 13.0 operacional",
                modo: state?.modo ?? null,
                autonomia: state?.autonomia ?? null,
                timestamp: now()
            });

        } catch (err) {
            logger.error("ERRO no status-controller (health):", err);

            return res.status(500).json({
                ok: false,
                erro: "Falha no healthcheck."
            });
        }
    },

    // ==========================================================
    // 2) STATUS COMPLETO DO SISTEMA (SEGURO)
    // Rota: /api/status/full
    // ==========================================================
    async full(req, res) {
        try {
            logger.info("STATUS: Estado completo solicitado.");

            // FILTRADO — sem expor credenciais, paths, keys, memórias internas
            const seguro = getSafeState();

            return res.json({
                ok: true,
                estadoGlobal: seguro,
                timestamp: now()
            });

        } catch (err) {
            logger.error("ERRO no status-controller (full):", err);

            return res.status(500).json({
                ok: false,
                erro: "Erro ao obter status completo."
            });
        }
    },

    // ==========================================================
    // 3) DEPENDÊNCIAS INTERNAS (CHECK REAL)
    // Rota: /api/status/deps
    // ==========================================================
    async deps(req, res) {
        try {
            logger.info("STATUS: Dependências internas solicitadas.");

            // Mantém comportamento original,
            // mas agora "pingamos" só para garantir que os módulos existem
            const deps = {
                ia_engine: typeof require("../core/ia-engine") === "object",
                intent_engine: typeof require("../core/intent-engine") === "object",
                thinker_engine: typeof require("../core/thinker-engine") === "object",
                preview_engine: typeof require("../core/preview-engine") === "object",
                builder_engine: typeof require("../builder/builder-engine") === "object",
                memory_pipeline: !!state?.memoria,
                risk_analyzer: typeof require("../core/risk-analyzer") === "object",
                test_engine: typeof require("../core/test-engine") === "object",
                logger: !!logger
            };

            return res.json({
                ok: true,
                dependencias: deps,
                timestamp: now()
            });

        } catch (err) {
            logger.error("ERRO no status-controller (deps):", err);

            return res.status(500).json({
                ok: false,
                erro: "Erro ao obter dependências."
            });
        }
    }
};
