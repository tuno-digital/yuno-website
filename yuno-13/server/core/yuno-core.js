/* ===============================================================
   YUNO 13.0 — YUNO CORE (VERSÃO CORRIGIDA / BLINDADA)
   Intenção → Execução → Caminho → Relatório
   Correções aplicadas:
   - contratos alinhados (tipo / parse / executar)
   - pathAdvisor corrigido
   - memory seguro
   - validação total de prompt e result
   - logs sanitizados
   - estado protegido
   ============================================================== */

const intentEngine = require("./intent-engine");
const iaEngine = require("./ia-engine");
const pathAdvisor = require("./yuno-path-advisor");
const analyzer = require("./analyzer-pro");
const logger = require("./logger");
const memory = require("../memory/memory-engine");

module.exports = {

    // =======================================================
    // ESTADO INTERNO DA YUNO (protegido)
    // =======================================================
    state: {
        mode: "seguro", // alinhado com state-engine
        version: "13.0",
        personality: "XXIII",
        lastIntent: null,
        lastResult: null
    },

    // =======================================================
    // PROCESSAMENTO COMPLETO
    // =======================================================
    async processRawPrompt(prompt) {
        try {
            // --------------------------------------------------
            // 1 — Sanitizar prompt
            // --------------------------------------------------
            if (typeof prompt !== "string") {
                try { prompt = String(prompt); }
                catch { prompt = ""; }
            }

            const promptLog = prompt.slice(0, 500); // evitar log totalmente bruto
            logger.info("YUNO-CORE: Prompt recebido", { trecho: promptLog });

            // --------------------------------------------------
            // 2 — Guardar histórico (protegido)
            // --------------------------------------------------
            try {
                if (typeof memory.storeInteraction === "function") {
                    memory.storeInteraction(promptLog);
                } else {
                    // fallback compatível com memory-pipeline
                    memory.addHistory?.({
                        tipo: "interacao",
                        conteudo: promptLog,
                        data: Date.now()
                    });
                }
            } catch (e) {
                logger.error("YUNO-CORE: Falha ao gravar memória", { erro: e.message });
            }

            // --------------------------------------------------
            // 3 — Detectar intenção (alinhado com intent-engine)
            // --------------------------------------------------
            let intent = null;
            if (typeof intentEngine.detect === "function") {
                intent = await intentEngine.detect(prompt);
            } else if (typeof intentEngine.parse === "function") {
                intent = await intentEngine.parse(prompt);
            }

            if (!intent || !intent.tipo) {
                return this._wrapResponse({
                    ok: false,
                    message: "Não compreendi o que querias dizer.",
                    error: "Intent não reconhecida."
                });
            }

            this.state.lastIntent = intent;

            // --------------------------------------------------
            // 4 — Executar intenção no motor de IA (alinhado)
            // --------------------------------------------------
            let result = null;
            try {
                result = await iaEngine.execute(intent);
            } catch (e) {
                logger.error("YUNO-CORE: iaEngine.execute falhou", { erro: e.message });
                return this._wrapResponse({
                    ok: false,
                    message: "Erro ao executar intenção.",
                    error: e.message
                });
            }

            // Validar resultado para não quebrar o core
            const safeResult = {
                data: result?.data ?? null,
                preview: result?.preview ?? null,
                report: result?.report ?? null
            };

            this.state.lastResult = safeResult;

            // --------------------------------------------------
            // 5 — Gerar caminho completo (corrigido)
            // --------------------------------------------------
            let caminho = null;

            try {
                if (typeof pathAdvisor.generate === "function") {
                    caminho = await pathAdvisor.generate(intent, safeResult);
                } else if (typeof pathAdvisor.gerarCaminho === "function") {
                    caminho = pathAdvisor.gerarCaminho(intent.tipo, intent.alvo ?? intent.descricao ?? null);
                } else {
                    caminho = null;
                }
            } catch (e) {
                logger.error("YUNO-CORE: gerar caminho falhou", { erro: e.message });
                caminho = null;
            }

            // --------------------------------------------------
            // 6 — Análise rápida do sistema
            // --------------------------------------------------
            let analysis = null;
            try {
                analysis = await analyzer.scan();
            } catch (e) {
                logger.error("YUNO-CORE: analyzer.scan falhou", { erro: e.message });
                analysis = { erro: true, detalhe: e.message };
            }

            // --------------------------------------------------
            // 7 — Resposta final padronizada
            // --------------------------------------------------
            return this._wrapResponse({
                ok: true,
                message: "Comando processado com sucesso.",
                data: safeResult.data,
                preview: safeResult.preview,
                report: {
                    intent,
                    engine: safeResult.report,
                    caminho,
                    analise: analysis
                }
            });

        } catch (err) {
            logger.error("Erro crítico em YUNO-CORE", { erro: err.message });

            return this._wrapResponse({
                ok: false,
                message: "Erro interno no núcleo da YUNO.",
                error: err.message
            });
        }
    },

    // =======================================================
    // FORMATAÇÃO FINAL
    // =======================================================
    _wrapResponse({ ok, message, data, preview, report, error }) {
        return {
            ok,
            message,
            data: data || null,
            preview: preview || null,
            report: report || null,
            error: error || null,
            meta: {
                version: this.state.version,
                mode: this.state.mode,
                personality: this.state.personality,
                timestamp: Date.now()
            }
        };
    },

    // =======================================================
    // MUDAR MODO (alinhado com state-engine)
    // =======================================================
    setMode(newMode) {
        const modosValidos = ["seguro", "híbrido", "avançado"];

        if (!modosValidos.includes(newMode)) {
            logger.warn("YUNO-CORE: modo inválido", { newMode });
            return false;
        }

        this.state.mode = newMode;
        logger.info("YUNO-CORE: modo alterado", { newMode });
        return true;
    },

    // =======================================================
    // TELEMETRIA RESUMIDA
    // =======================================================
    getStatus() {
        return {
            version: this.state.version,
            mode: this.state.mode,
            personality: this.state.personality,
            lastIntent: this.state.lastIntent,
            lastResult: this.state.lastResult
        };
    }
};
