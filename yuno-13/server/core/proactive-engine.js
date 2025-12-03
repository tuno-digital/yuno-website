/* ==============================================================
   YUNO 13.0 — PROACTIVE ENGINE (VERSÃO CORRIGIDA / BLINDADA)
   Segurança máxima • Zero confiança cega • Fail-safe • Log completo
   ============================================================== */

const analyzerPro = require("./analyzer-pro");
const riskAnalyzer = require("./risk-analyzer");
const awareness = require("./awareness-engine");
const memory = require("./memory-pipeline");
const logger = require("./logger");

module.exports = {

    async run() {
        const operationId = `proactive_${Date.now()}_${Math.random().toString(36).slice(2)}`;

        logger.info("PROACTIVE: Início de ciclo proativo.", { operationId });

        try {
            // ========================================================
            // 1 — STATUS DO SISTEMA (VALIDAÇÃO TOTAL)
            // ========================================================
            let sys = {};
            try {
                const raw = awareness.getSystemStatus();
                sys = (raw && typeof raw === "object") ? raw : {};
            } catch (err) {
                logger.error("PROACTIVE: getSystemStatus falhou", { operationId, erro: err.message });
            }

            const memoria = (sys.memoria && typeof sys.memoria === "object") ? sys.memoria : {};
            const cpu = (sys.cpu && typeof sys.cpu === "object") ? sys.cpu : {};

            const usoMemoria = Number(memoria.usagePercent ?? 0);
            const usoCpu = Number(cpu.usage ?? 0);


            // ========================================================
            // 2 — ANALISAR ESTRUTURA (DEFENSIVO)
            // ========================================================
            let estrutura = { integridadeEstrutura: [], modulosCriticos: [] };

            try {
                const raw = await analyzerPro.scan();
                if (raw && typeof raw === "object") {
                    estrutura.integridadeEstrutura = Array.isArray(raw.integridadeEstrutura)
                        ? raw.integridadeEstrutura : [];
                    estrutura.modulosCriticos = Array.isArray(raw.modulosCriticos)
                        ? raw.modulosCriticos : [];
                }
            } catch (err) {
                logger.error("PROACTIVE: analyzerPro.scan falhou", { operationId, erro: err.message });
            }


            // ========================================================
            // 3 — RISCO DO SISTEMA (VALIDAÇÃO DO RETORNO)
            // ========================================================
            let risco = { level: "desconhecido", riscos: [] };

            try {
                const raw = await riskAnalyzer.analyze({
                    html: "",
                    css: "",
                    js: ""
                });

                if (raw && typeof raw === "object") {
                    risco.level = typeof raw.level === "string" ? raw.level : "desconhecido";
                    risco.riscos = Array.isArray(raw.riscos) ? raw.riscos : [];
                }
            } catch (err) {
                logger.error("PROACTIVE: riskAnalyzer.analyze falhou", { operationId, erro: err.message });
            }


            // ========================================================
            // 4 — PREVISÃO DE ESTABILIDADE (VALIDAÇÃO)
            // ========================================================
            let estabilidade = "desconhecido";
            try {
                const raw = awareness.predictStability();
                estabilidade = typeof raw === "string" ? raw : "desconhecido";
            } catch (err) {
                logger.error("PROACTIVE: predictStability falhou", { operationId, erro: err.message });
            }


            // ========================================================
            // 5 — RECOMENDAÇÕES (SEGURO)
            // ========================================================
            const recomendacoes = this._generateRecommendations(
                { memoria: usoMemoria, cpu: usoCpu },
                estrutura,
                risco,
                estabilidade
            );

            // ========================================================
            // 6 — GUARDAR NO HISTÓRICO (FAIL-SAFE)
            // ========================================================
            try {
                memory.addHistory({
                    operationId,
                    tipo: "cicloProativo",
                    resumo: recomendacoes
                });
            } catch (err) {
                logger.error("PROACTIVE: Falha ao escrever no histórico", {
                    operationId,
                    erro: err.message
                });
            }

            // ========================================================
            // 7 — RESPOSTA FINAL SEGURA
            // ========================================================
            return {
                operationId,
                estadoSistema: sys,
                estrutura,
                risco,
                estabilidade,
                recomendacoes
            };

        } catch (err) {
            logger.error("PROACTIVE ENGINE — erro crítico", { erro: err.message, operationId });
            return {
                erro: true,
                operationId,
                mensagem: "Falha no ciclo proativo",
                detalhe: err.message
            };
        }
    },


    // ==============================================================
    // Geração SEGURA de recomendações (não assume tipos)
    // ==============================================================
    _generateRecommendations(sys, estrutura, risco, estabilidade) {
        const rec = [];

        // 1 — Estrutura
        const falhasEstrutura = Array.isArray(estrutura.integridadeEstrutura)
            ? estrutura.integridadeEstrutura.filter(e => e && e.ok === false)
            : [];

        if (falhasEstrutura.length > 0) {
            rec.push({
                tipo: "estrutura",
                prioridade: "alta",
                mensagem: "Diretórios essenciais em falta.",
                detalhes: falhasEstrutura
            });
        }

        // 2 — Módulos críticos
        const modulosFalhos = Array.isArray(estrutura.modulosCriticos)
            ? estrutura.modulosCriticos.filter(e => e && e.ok === false)
            : [];

        if (modulosFalhos.length > 0) {
            rec.push({
                tipo: "core",
                prioridade: "alta",
                mensagem: "Módulos críticos em falta.",
                detalhes: modulosFalhos
            });
        }

        // 3 — Riscos do sistema
        if (["alto", "crítico"].includes(risco.level)) {
            rec.push({
                tipo: "segurança",
                prioridade: "alta",
                mensagem: `Risco elevado detectado (${risco.level}).`,
                detalhes: risco.riscos
            });
        }

        // 4 — Estabilidade
        if (typeof estabilidade === "string" && estabilidade.includes("risco")) {
            rec.push({
                tipo: "estabilidade",
                prioridade: "média",
                mensagem: "Sistema sob carga. Recomenda-se otimização."
            });
        }

        // 5 — Memória
        if (!isNaN(sys.memoria) && sys.memoria > 70) {
            rec.push({
                tipo: "memoria",
                prioridade: "média",
                mensagem: "Uso de memória elevado."
            });
        }

        // 6 — CPU
        if (!isNaN(sys.cpu) && sys.cpu > 65) {
            rec.push({
                tipo: "cpu",
                prioridade: "média",
                mensagem: "Uso de CPU elevado."
            });
        }

        // 7 — Nenhum problema
        if (rec.length === 0) {
            rec.push({
                tipo: "saudavel",
                prioridade: "baixa",
                mensagem: "Sistema estável. Nenhuma ação necessária."
            });
        }

        return rec;
    }

};
