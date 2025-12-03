/* ===============================================================
   YUNO 13.0 — THINKER ENGINE (VERSÃO CORRIGIDA / BLINDADA)
   Raciocínio interno com validações, proteções e sem alterar
   nenhuma função original. Apenas correções de segurança.
   ============================================================== */

const memory = require("./memory-pipeline");
const logger = require("./logger");
const pathAdvisor = require("./yuno-path-advisor");

module.exports = {

    // ==========================================================
    // Ponto central: pensar antes de agir
    // ==========================================================
    async processar(intent, estadoGlobal = {}) {
        try {

            // ------------------------------
            // 1 — Validar intent
            // ------------------------------
            if (!intent || typeof intent !== "object") {
                return this._respostaBase("❗ Intent inválida ou ausente.");
            }

            const tipo = typeof intent.tipo === "string" ? intent.tipo : "desconhecido";

            logger.info("THINKER: A processar intenção", { tipo });

            // ------------------------------
            // 2 — Gravar histórico (protegido)
            // ------------------------------
            try {
                memory.addHistory({
                    tipo: "pensamento",
                    intent: tipo,
                    contexto: this._sanearContexto(estadoGlobal),
                    data: new Date().toISOString()
                });
            } catch (e) {
                logger.error("THINKER: Falha ao gravar histórico", { erro: e.message });
            }

            // ------------------------------
            // 3 — Roteamento principal
            // ------------------------------
            switch (tipo) {

                case "ping":
                    return this._respostaBase("🏓 Estou operacional, modo 13.0 ativo.");

                case "help":
                    return this._help();

                case "preview":
                    return this._raciocinarPreview(intent);

                case "build":
                    return this._raciocinarConstrucao(intent);

                case "aprovar":
                    return this._respostaBase("🔐 Patch aprovado. A aplicar mudanças...");

                case "recusar":
                    return this._respostaBase("❎ Patch recusado. Preview eliminado.");

                case "listar_tarefas":
                    return this._respostaBase("📘 Lista de tarefas carregada. Queres que eu detalhe alguma?");

                case "adicionar_tarefa":
                    return this._raciocinarNovaTarefa(intent);

                case "explicar_tarefa":
                    return this._respostaBase(`📘 Vou explicar a tarefa ${intent.tarefa}.`);

                case "impacto":
                    return this._respostaBase("📊 Analisando impacto da operação...");

                case "risco":
                    return this._respostaBase("🛑 Avaliando risco do sistema...");

                case "modo_jarvis":
                    return this._ativarJarvisMode();

                case "caminho_completo":
                    return this._raciocinarCaminhoCompleto();

                case "desconhecido":
                    return this._respostaBase("🤖 Não consegui interpretar isso. Queres reformular?");

                default:
                    return this._respostaBase("⚠ Intenção não mapeada, precisa ser revisada no intent-engine.");
            }

        } catch (err) {
            logger.error("THINKER: Erro crítico no processar()", { erro: err.message });
            return this._respostaBase("❗ Erro interno ao processar intenção.");
        }
    },

    // ==========================================================
    // Respostas estruturadas padrão
    // ==========================================================
    _respostaBase(mensagem) {
        return {
            ok: true,
            mensagem,
            estilo: "yuno-13",
            timestamp: Date.now()
        };
    },

    // ==========================================================
    // Pensamento sobre preview
    // ==========================================================
    _raciocinarPreview(intent) {
        const alvo = intent?.alvo;
        if (!alvo || typeof alvo !== "string") {
            return this._respostaBase("📄 Para gerar preview, preciso do alvo. Ex: 'preview index'.");
        }

        let caminho = null;
        try {
            caminho = pathAdvisor.gerarCaminho("preview", alvo);
        } catch (e) {
            logger.error("THINKER: gerarCaminho preview falhou", { erro: e.message });
            return this._respostaBase("❗ Erro ao gerar caminho de preview.");
        }

        return {
            ok: true,
            mensagem: `🎨 A gerar preview para: ${alvo}`,
            caminho,
            tipo: "preview"
        };
    },

    // ==========================================================
    // Pensamento sobre construção / auto-builder
    // ==========================================================
    _raciocinarConstrucao(intent) {
        const alvo = intent?.alvo;
        if (!alvo || typeof alvo !== "string") {
            return this._respostaBase("📐 Preciso saber o que queres construir. Ex: 'construir navbar'.");
        }

        let blueprint = null;
        try {
            blueprint = pathAdvisor.gerarCaminho("build", alvo);
        } catch (e) {
            logger.error("THINKER: gerarCaminho build falhou", { erro: e.message });
            return this._respostaBase("❗ Erro ao gerar caminho de construção.");
        }

        return {
            ok: true,
            mensagem: `🧩 A preparar construção de: ${alvo}`,
            blueprint,
            tipo: "build"
        };
    },

    // ==========================================================
    // Pensamento sobre nova tarefa
    // ==========================================================
    _raciocinarNovaTarefa(intent) {

        const descricao = intent?.descricao;
        if (!descricao || typeof descricao !== "string") {
            return this._respostaBase("📘 Preciso da descrição da tarefa para adicionar.");
        }

        return {
            ok: true,
            mensagem: `📝 Nova tarefa registada: ${descricao}`,
            tarefa: descricao,
            tipo: "nova_tarefa"
        };
    },

    // ==========================================================
    // Pensamento sobre caminho completo
    // ==========================================================
    _raciocinarCaminhoCompleto() {

        let caminho = null;
        try {
            caminho = pathAdvisor.gerarCaminhoCompleto();
        } catch (e) {
            logger.error("THINKER: gerarCaminhoCompleto falhou", { erro: e.message });
            return this._respostaBase("❗ Erro ao gerar caminho completo.");
        }

        return {
            ok: true,
            mensagem: "📡 Caminho completo gerado.",
            caminho
        };
    },

    // ==========================================================
    // Jarvis Mode
    // ==========================================================
    _ativarJarvisMode() {
        return {
            ok: true,
            mensagem: "🛰 Modo Jarvis ativado — respostas avançadas, raciocínio extendido, parâmetros de autonomia elevados.",
            novoModo: "jarvis-13"
        };
    },

    // ==========================================================
    // Sanitização leve do estado
    // ==========================================================
    _sanearContexto(ctx) {
        if (!ctx || typeof ctx !== "object") return {};
        const seguro = {};
        for (const k of Object.keys(ctx)) {
            const v = ctx[k];
            if (typeof v === "string" || typeof v === "number" || typeof v === "boolean" || (v && typeof v === "object")) {
                seguro[k] = v;
            }
        }
        return seguro;
    }
};
