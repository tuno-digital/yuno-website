// ==============================================================
// YUNO 13.0 — AWARENESS ENGINE (VERSÃO CORRIGIDA)
// Consciência operacional: estado atual, telemetria, módulos,
// previsões e autoconsciência técnica.
// ==============================================================

const os = require("os");
const memoryPipeline = require("./memory-pipeline");
const logger = require("./logger");

module.exports = {

    // ==========================================================
    // Estado geral da YUNO
    // ==========================================================
    getSystemStatus() {
        let mem = null;

        try {
            mem = memoryPipeline.read();
        } catch (err) {
            logger.error("AWARENESS: Falha ao ler memoryPipeline:", err);
            mem = {}; // fallback seguro
        }

        // validação básica
        const sistema = mem?.sistema || {};
        const historico = Array.isArray(mem?.historico) ? mem.historico.length : 0;
        const tarefas = Array.isArray(mem?.tarefas) ? mem.tarefas.length : 0;

        return {
            versao: "13.0",
            modo: sistema.modo || "híbrido",
            uptime: process?.uptime ? process.uptime() : 0,
            timestamp: Date.now(),
            memoria: this._systemMemory(),
            cpu: this._systemCPU(),
            tarefas,
            historico,
            ultimaAcao: mem?.ultimaAcao || null
        };
    },

    // ==========================================================
    // Estado dos módulos internos (PLACEHOLDER SEGURO)
    // ==========================================================
    getModulesStatus() {
        // Mantém o comportamento original — módulos "operacionais"
        // (sem alterar lógica nem adicionar health-checks automáticos)
        return {
            intentEngine: "operacional",
            iaEngine: "operacional",
            previewEngine: "operacional",
            pathAdvisor: "operacional",
            personalityEngine: "operacional",
            thinkerEngine: "operacional",
            riskAnalyzer: "operacional",
            analyzerPro: "operacional",
            memoryPipeline: "operacional",
            securityTester: "operacional",
            awarenessEngine: "operacional"
        };
    },

    // ==========================================================
    // Previsão de estabilidade
    // ==========================================================
    predictStability() {
        let mem = null;

        try {
            mem = memoryPipeline.read();
        } catch (err) {
            logger.error("AWARENESS: Falha ao ler histórico para previsão:", err);
            return "indefinido";
        }

        const historico = Array.isArray(mem?.historico) ? mem.historico.length : 0;

        if (historico < 20) return "estável";
        if (historico < 100) return "estável (monitorar)";
        if (historico < 300) return "carga elevada — risco médio";
        return "sobrecarga — risco alto";
    },

    // ==========================================================
    // Telemetria completa
    // ==========================================================
    getAwarenessReport() {
        try {
            logger.info("AWARENESS: relatório solicitado.");

            return {
                estado: this.getSystemStatus(),
                modulos: this.getModulesStatus(),
                estabilidade: this.predictStability(),
                resumo: this._buildSummary()
            };

        } catch (err) {
            logger.error("Erro no awareness-engine", err);

            return {
                erro: true,
                mensagem: "Falha ao gerar relatório interno."
            };
        }
    },

    // ==========================================================
    // Resumo técnico (mantido conforme original)
    // ==========================================================
    _buildSummary() {
        return {
            mensagem: "Consciência operacional ativa.",
            foco: "construção segura",
            energia: this._energyLevel(),
            alerta: "nenhuma anomalia detetada",
            fluxo: "raciocínio fluido",
            status: "pronta para instruções"
        };
    },

    // ==========================================================
    // Energia interna baseada na carga
    // ==========================================================
    _energyLevel() {
        const cpu = this._systemCPU();

        if (cpu.usage > 85) return "sobrecarga";
        if (cpu.usage > 60) return "elevado";
        if (cpu.usage > 30) return "moderado";
        return "leve";
    },

    // ==========================================================
    // CPU stats (corrigido para fallback seguro)
    // ==========================================================
    _systemCPU() {
        const cores = os?.cpus()?.length || 1;

        let load = 0;
        try {
            load = os.loadavg()[0] || 0;
        } catch {
            load = 0;
        }

        // cálculo safe
        const usage = cores > 0
            ? Number(((load / cores) * 100).toFixed(2))
            : 0;

        return {
            cores,
            load,
            usage
        };
    },

    // ==========================================================
    // System memory stats (corrigido para prevenir NaN)
    // ==========================================================
    _systemMemory() {
        const total = os.totalmem?.() || 0;
        const free = os.freemem?.() || 0;
        const used = total > 0 ? (total - free) : 0;

        const usagePercent =
            total > 0
                ? Number(((used / total) * 100).toFixed(2))
                : 0;

        return {
            total,
            used,
            free,
            usagePercent
        };
    }
};
