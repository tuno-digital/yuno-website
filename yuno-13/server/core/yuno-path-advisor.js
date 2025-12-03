/* ===============================================================
   YUNO 13.0 — PATH ADVISOR (VERSÃO CORRIGIDA / BLINDADA)
   Compatível com:
   - intent-engine (tipo / alvo / descricao)
   - thinker-engine (gerarCaminho / gerarCaminhoCompleto)
   - yuno-core (generate(intent, result))
   - preview-engine (preview-xxxx.json vs previews/id.json)
   ============================================================== */

const logger = require("./logger");

module.exports = {

    /* ==========================================================
       MÉTODO PRINCIPAL — UNIFICAÇÃO ENTRE GERAR CAMINHO E GENERATE
       ========================================================== */
    async generate(intent = {}, result = {}) {
        try {
            const tipo = intent.tipo || intent.type || "desconhecido";
            const alvo = intent.alvo || intent.target || intent.descricao || null;

            logger.info("PATH-ADVISOR: Gerar caminho", { tipo, alvo });

            switch (tipo) {
                case "construir":
                case "build":
                    return this._construirPath(alvo);

                case "preview":
                    return this._previewPath(alvo);

                case "explicar":
                case "explicar_tarefa":
                    return this._explicarPath(alvo);

                case "diagnostico":
                case "diagnóstico":
                    return this._diagnosticoPath();

                case "pentest":
                    return this._pentestPath();

                default:
                    return this._fallback("Tipo de intenção não suportado.");
            }

        } catch (err) {
            logger.error("PATH-ADVISOR: Erro crítico", { erro: err.message });
            return this._fallback("Erro ao gerar caminho.");
        }
    },

    /* ==========================================================
       MÉTODOS USADOS POR THINKER-ENGINE DIRETAMENTE
       ========================================================== */
    gerarCaminho(tipo, alvo = null) {
        return this.generate({ tipo, alvo });
    },

    gerarCaminhoCompleto() {
        return {
            titulo: "Fluxo completo de navegação do sistema",
            passos: [
                "1. Interpretar intenção → Intent Engine",
                "2. Raciocinar → Thinker Engine",
                "3. Executar → IA Engine",
                "4. Validar riscos → Risk Analyzer",
                "5. Validar estrutura → Analyzer Pro",
                "6. Gerar preview ou patch",
                "7. Aguardar aprovação humana",
                "8. Aplicar patch via Auto-Builder",
                "9. Registrar histórico e telemetria"
            ],
            modo: "documentação sintetizada",
            seguro: true
        };
    },

    /* ==========================================================
       CAMINHO: CONSTRUÇÃO
       ========================================================== */
    _construirPath(alvo) {
        const alvoSafe = this._clean(alvo, "componente");

        return {
            titulo: `Plano de construção para: ${alvoSafe}`,
            passos: [
                "1. Criar blueprint inicial no IA-Engine (modo seguro).",
                "2. Gerar preview visual usando preview-engine.",
                "3. Validar riscos com risk-analyzer.",
                "4. Validar impacto com analyzer-pro.",
                "5. Criar patch no auto-builder (modo seguro).",
                "6. Aguardar aprovação manual.",
                "7. Se aprovado: aplicar patch.",
                "8. Se rejeitado: remover preview temporário.",
                "9. Registrar histórico e memória interna."
            ],
            ficheirosPossiveis: [
                "server/core/*",
                "public/*",
                "server/builder/patches/*"
            ],
            riscos: [
                "Sobrescrita de ficheiro.",
                "Dependências quebradas.",
                "Impacto visual inesperado.",
                "Falhas de sintaxe antes do teste final."
            ],
            modo: "execução bloqueada"
        };
    },

    /* ==========================================================
       CAMINHO: PREVIEW
       ========================================================== */
    _previewPath(alvo) {
        const alvoSafe = this._clean(alvo, "elemento");

        return {
            titulo: `Plano para gerar preview de: ${alvoSafe}`,
            passos: [
                "1. Converter intenção em estrutura HTML segura.",
                "2. Gerar ficheiro preview-XXXX.json (compatível com preview-controller).",
                "3. Carregar sandbox HTML no iframe do cockpit.",
                "4. Executar análise de risco.",
                "5. Executar análise estrutural.",
                "6. Apresentar diff antes da aprovação.",
                "7. Aguardar decisão humana."
            ],
            ficheirosGerados: [
                "server/previews/preview-XXXX.json"
            ],
            recomenda: [
                "Evitar CSS complexo no preview.",
                "Usar HTML simples para validar estrutura.",
                "Comparar diffs antes de aprovar."
            ]
        };
    },

    /* ==========================================================
       CAMINHO: EXPLICAÇÃO
       ========================================================== */
    _explicarPath(tema) {
        const temaSafe = this._clean(tema, "tarefa");

        return {
            titulo: `Explicação técnica: ${temaSafe}`,
            passos: [
                "1. Analisar intenção original.",
                "2. Procurar contexto no histórico (memory-engine).",
                "3. Identificar dependências naturais.",
                "4. Avaliar riscos potenciais.",
                "5. Gerar explicação didática e técnica.",
                "6. Criar recomendações avançadas."
            ],
            estrutura: {
                descricao: "Descrição detalhada da lógica envolvida.",
                riscos: "Pontos críticos ou vulneráveis.",
                dependencias: "Arquitetura necessária.",
                fluxo: "Sequência técnica de operações."
            }
        };
    },

    /* ==========================================================
       CAMINHO: DIAGNÓSTICO
       ========================================================== */
    _diagnosticoPath() {
        return {
            titulo: "Plano de diagnóstico do sistema",
            passos: [
                "1. Análise completa do sistema.",
                "2. Coletar estado dos motores (IA, Intent, Preview).",
                "3. Avaliar possíveis erros.",
                "4. Identificar dependências quebradas.",
                "5. Verificar inconsistências entre módulos.",
                "6. Produzir relatório técnico."
            ]
        };
    },

    /* ==========================================================
       CAMINHO: PENTEST
       ========================================================== */
    _pentestPath() {
        return {
            titulo: "Plano de pentest YUNO 13.0 (não invasivo)",
            passos: [
                "1. Verificar padrões de vulnerabilidade.",
                "2. Testar sanitização.",
                "3. Avaliar entradas de dados.",
                "4. Validar rotas sensíveis.",
                "5. Detetar comportamentos suspeitos.",
                "6. Gerar relatório seguro.",
                "7. Nunca executar exploits."
            ],
            risco: "Baixo (modo seguro ativo)",
            etico: true
        };
    },

    /* ==========================================================
       FALLBACK
       ========================================================== */
    _fallback(msg) {
        return {
            titulo: "Caminho indisponível",
            motivo: msg,
            passos: ["Nenhum caminho pôde ser determinado."],
            seguro: true
        };
    },

    /* ==========================================================
       SANITIZAÇÃO DE STRINGS
       ========================================================== */
    _clean(value, fallback) {
        if (!value || typeof value !== "string") return fallback;
        return value.replace(/[^a-zA-Z0-9_\- ]/g, "").slice(0, 60) || fallback;
    }
};
