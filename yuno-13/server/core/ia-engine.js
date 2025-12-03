// ==============================================================
// YUNO 13.0 — IA ENGINE (VERSÃO CORRIGIDA E BLINDADA)
// Executor principal das intenções detectadas
// ==============================================================

const logger = require("./logger");
const previewEngine = require("./preview-engine");
const analyzer = require("./analyzer-pro");
const securityTester = require("./security-tester");

module.exports = {

    // =======================================================
    // EXECUTAR INTENÇÃO — ENTRADA SEGURA
    // =======================================================
    async execute(intentRaw) {

        // ID para rastreio (como no corretor)
        const operacaoId = Date.now();

        try {
            // ---------------------------------------------------
            // 1) Validar INTENT
            // ---------------------------------------------------
            const intent = this._safeIntent(intentRaw);

            if (!intent) {
                return {
                    ok: false,
                    message: "Intent inválida.",
                    error: "Formato incorreto.",
                    operacaoId
                };
            }

            logger.info(`IA-ENGINE(${operacaoId}): Executar intenção`, {
                type: intent.type || null
            });

            const type = String(intent.type || "").toLowerCase();

            // ---------------------------------------------------
            // 2) DISPATCH
            // ---------------------------------------------------
            switch (type) {

                case "construir":
                    return await this._safeCall("_handleConstruir", intent, operacaoId);

                case "preview":
                    return await this._safeCall("_handlePreview", intent, operacaoId);

                case "explicar":
                    return await this._safeCall("_handleExplicar", intent, operacaoId);

                case "diagnostico":
                    return await this._safeCall("_handleDiagnostico", intent, operacaoId);

                case "pentest":
                    return await this._safeCall("_handlePentest", intent, operacaoId);

                default:
                    return {
                        ok: false,
                        message: "Ação não permitida.",
                        error: "Tipo de intenção desconhecido.",
                        operacaoId
                    };
            }

        } catch (err) {
            logger.error(`ERRO CRÍTICO no IA-ENGINE(${operacaoId})`, err);

            return {
                ok: false,
                message: "Erro interno no IA-Engine.",
                operacaoId
            };
        }
    },

    // =======================================================
    // HANDLER PROTEGIDO — evita crash internos
    // =======================================================
    async _safeCall(handlerName, intent, operacaoId) {
        try {
            if (typeof this[handlerName] !== "function") {
                throw new Error(`Handler inexistente: ${handlerName}`);
            }

            return await this[handlerName](intent, operacaoId);

        } catch (err) {
            logger.error(`IA-ENGINE(${operacaoId}): Erro em ${handlerName}`, err);

            return {
                ok: false,
                message: "Erro interno.",
                handler: handlerName,
                operacaoId
            };
        }
    },

    // =======================================================
    // SANITIZAR E NORMALIZAR INTENT
    // =======================================================
    _safeIntent(intent) {
        if (!intent || typeof intent !== "object") return null;

        return {
            type: typeof intent.type === "string" ? intent.type.trim() : "",
            target: typeof intent.target === "string" ? intent.target.trim() : null,
            filePath: typeof intent.filePath === "string" ? intent.filePath.trim() : null,
            steps: Array.isArray(intent.steps) ? intent.steps : [],
            risks: Array.isArray(intent.risks) ? intent.risks : [],
            tips: Array.isArray(intent.tips) ? intent.tips : []
        };
    },

    // =======================================================
    // [1] AÇÃO: CONSTRUIR (modo seguro)
    // =======================================================
    async _handleConstruir(intent) {
        const alvo = intent.target || "componente";

        return {
            ok: true,
            data: {
                status: "execução bloqueada",
                mensagem: "Modo seguro ativo — blueprint gerado.",
                alvo
            },
            report: {
                tipo: "construir",
                blueprint: {
                    ficheiro: intent.filePath || null,
                    funcoesObrigatorias: [
                        "gerarPreview()",
                        "validarEstrutura()",
                        "aplicarSandbox()"
                    ],
                    motivo: "Construção gerada em ambiente seguro — aguarda aprovação."
                }
            }
        };
    },

    // =======================================================
    // [2] PREVIEW — SEGURO
    // =======================================================
    async _handlePreview(intent, operacaoId) {
        logger.info(`IA-ENGINE(${operacaoId}): Gerar preview`);

        try {
            const preview = await previewEngine.generatePreview(intent);

            return {
                ok: true,
                data: { status: "preview-gerado" },
                preview: preview?.html || null,
                report: {
                    tipo: "preview",
                    diagnostico: preview?.diagnostic || null
                },
                operacaoId
            };

        } catch (err) {
            logger.error(`IA-ENGINE(${operacaoId}): Falha no preview-engine`, err);

            return {
                ok: false,
                message: "Erro ao gerar preview.",
                operacaoId
            };
        }
    },

    // =======================================================
    // [3] EXPLICAR — MODO INFORMACIONAL
    // =======================================================
    async _handleExplicar(intent) {
        const tema = intent.target || "tarefa";

        return {
            ok: true,
            data: {
                explicacao: `Explicação técnica completa sobre: ${tema}`
            },
            report: {
                tipo: "explicacao",
                detalhes: {
                    passos: intent.steps,
                    riscos: intent.risks,
                    recomendacoes: intent.tips
                }
            }
        };
    },

    // =======================================================
    // [4] DIAGNÓSTICO — PROTEGIDO
    // =======================================================
    async _handleDiagnostico(intent, operacaoId) {
        logger.info(`IA-ENGINE(${operacaoId}): Diagnóstico solicitado`);

        try {
            const analysis = await analyzer.scan();

            return {
                ok: true,
                data: { status: "diagnostico-gerado" },
                report: {
                    tipo: "diagnostico",
                    analysis: analysis || {}
                },
                operacaoId
            };

        } catch (err) {
            logger.error(`IA-ENGINE(${operacaoId}): Falha no analyzer-pro`, err);

            return {
                ok: false,
                message: "Falha ao gerar diagnóstico.",
                operacaoId
            };
        }
    },

    // =======================================================
    // [5] PENTEST — SEGURO, NÍVEL 1
    // =======================================================
    async _handlePentest(intent, operacaoId) {
        logger.info(`IA-ENGINE(${operacaoId}): Pentest solicitado`);

        try {
            const result = await securityTester.run();

            return {
                ok: true,
                data: { status: "pentest-executado" },
                report: {
                    tipo: "pentest",
                    resultado: result || {}
                },
                operacaoId
            };

        } catch (err) {
            logger.error(`IA-ENGINE(${operacaoId}): Falha no security-tester`, err);

            return {
                ok: false,
                message: "Erro ao executar pentest.",
                operacaoId
            };
        }
    }

};
