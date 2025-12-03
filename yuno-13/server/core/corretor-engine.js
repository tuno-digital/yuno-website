// ==============================================================
// YUNO 13.0 — CORRETOR ENGINE (VERSÃO CORRIGIDA)
// Auto-reparo seguro: corrige problemas simples, sugere soluções
// avançadas e previne falhas estruturais.
// ==============================================================

const analyzerPro = require("./analyzer-pro");
const riskAnalyzer = require("./risk-analyzer");
const logger = require("./logger");
const memory = require("./memory-pipeline");

module.exports = {

    // ==========================================================
    // Entrada principal do corretor
    // ==========================================================
    async run() {
        const operacaoId = Date.now(); // ID único para logs e rastreamento

        try {
            logger.info(`CORRETOR(${operacaoId}): Início do ciclo de auto-reparo seguro.`);

            // --------------------------------------------------
            // Execução dos módulos com proteção total
            // --------------------------------------------------
            let estrutura = null;
            let risco = null;

            try {
                estrutura = await analyzerPro.scan();
            } catch (err) {
                logger.error(`CORRETOR(${operacaoId}): Falha ao executar analyzerPro.scan()`, err);
                estrutura = {
                    integridadeEstrutura: [],
                    modulosCriticos: [],
                    ficheirosVazios: [],
                    loopsSuspeitos: [],
                    importsQuebrados: []
                };
            }

            try {
                risco = await riskAnalyzer.analyze({ html: "", css: "", js: "" });
            } catch (err) {
                logger.error(`CORRETOR(${operacaoId}): Falha ao executar riskAnalyzer.analyze()`, err);
                risco = { level: "desconhecido", riscos: [] };
            }

            // Normalização de formato — garante que nunca crasha
            const integridadeEstrutura =
                Array.isArray(estrutura.integridadeEstrutura)
                    ? estrutura.integridadeEstrutura
                    : [];

            const modulosCriticos =
                Array.isArray(estrutura.modulosCriticos)
                    ? estrutura.modulosCriticos
                    : [];

            const ficheirosVazios =
                Array.isArray(estrutura.ficheirosVazios)
                    ? estrutura.ficheirosVazios
                    : [];

            const relatorio = {
                estado: "OK",
                problemas: [],
                acoesRecomendadas: [],
                microCorrecoes: [],
                operacaoId
            };

            // --------------------------------------------------
            // 1 — Diretórios essenciais em falta
            // --------------------------------------------------
            const dirsFaltando = integridadeEstrutura.filter(d => !d.ok);

            if (dirsFaltando.length) {
                relatorio.problemas.push({
                    tipo: "estrutura",
                    mensagem: "Diretórios essenciais em falta.",
                    detalhes: dirsFaltando
                });

                relatorio.acoesRecomendadas.push(
                    "Criar os diretórios essenciais em falta (necessita aprovação manual)."
                );
            }

            // --------------------------------------------------
            // 2 — Ficheiros essenciais em falta
            // --------------------------------------------------
            const modFalhos = modulosCriticos.filter(m => !m.ok);

            if (modFalhos.length) {
                relatorio.problemas.push({
                    tipo: "core",
                    mensagem: "Ficheiros críticos em falta.",
                    detalhes: modFalhos
                });

                relatorio.acoesRecomendadas.push(
                    "Gerar estrutura mínima para os ficheiros faltantes (necessita aprovação)."
                );
            }

            // --------------------------------------------------
            // 3 — Ficheiros vazios
            // --------------------------------------------------
            if (ficheirosVazios.length > 0) {
                relatorio.problemas.push({
                    tipo: "vazio",
                    mensagem: "Ficheiros vazios encontrados.",
                    detalhes: ficheirosVazios
                });

                ficheirosVazios.forEach(f => {
                    if (f?.ficheiro) {
                        relatorio.microCorrecoes.push({
                            ficheiro: f.ficheiro,
                            acao: "Preencher com estrutura mínima."
                        });
                    }
                });
            }

            // --------------------------------------------------
            // 4 — Riscos altos ou críticos
            // --------------------------------------------------
            if (risco?.level === "alto" || risco?.level === "crítico") {
                relatorio.problemas.push({
                    tipo: "risco",
                    mensagem: `Risco elevado detectado (${risco.level}).`,
                    detalhes: risco?.riscos || []
                });

                relatorio.acoesRecomendadas.push(
                    "Rever manualmente os trechos de código suspeitos."
                );
            }

            // --------------------------------------------------
            // 5 — Guardar no histórico (protegido)
            // --------------------------------------------------
            try {
                memory.addHistory({
                    tipo: "corretor",
                    operacaoId,
                    relatorio
                });
            } catch (err) {
                logger.error(`CORRETOR(${operacaoId}): Falha ao gravar histórico`, err);
                // NÃO quebra — só loga
            }

            logger.info(`CORRETOR(${operacaoId}): Ciclo concluído.`);

            return {
                ok: true,
                relatorio
            };

        } catch (err) {
            logger.error(`CORRETOR(${operacaoId}): ERRO CRÍTICO`, err);

            return {
                ok: false,
                mensagem: "Falha interna no corretor.",
                erro: err.message || "Erro desconhecido",
                operacaoId
            };
        }
    },

    // ==========================================================
    // Micro-correção dedicada: ficheiros vazios
    // ==========================================================
    async fixEmptyFiles() {
        let estrutura = null;

        try {
            estrutura = await analyzerPro.scan();
        } catch (err) {
            logger.error("CORRETOR: Falha ao ler ficheiros vazios", err);
            return {
                ok: false,
                erro: "Falha ao analisar ficheiros vazios."
            };
        }

        const ficheirosVazios =
            Array.isArray(estrutura.ficheirosVazios)
                ? estrutura.ficheirosVazios
                : [];

        const sugestoes = ficheirosVazios
            .filter(v => v?.ficheiro)
            .map(v => ({
                ficheiro: v.ficheiro,
                acao: "Criar cabeçalho padrão (comentários e estrutura base)."
            }));

        return {
            ok: true,
            microCorrecoes: sugestoes
        };
    }
};
