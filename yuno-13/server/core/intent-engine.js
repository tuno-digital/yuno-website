// ==============================================================
// YUNO 13.0 — INTENT ENGINE (VERSÃO CORRIGIDA E BLINDADA)
// Interpretação natural → comandos estruturados para o IA-ENGINE
// ==============================================================

const memory = require("./memory-pipeline");
const logger = require("./logger");

module.exports = {

    // ==========================================================
    // Função principal: processar linguagem natural
    // ==========================================================
    async parse(comandoRaw) {

        const operacaoId = Date.now();

        try {
            // ------------------------------------------------------
            // 1) Validar tipo do comando
            // ------------------------------------------------------
            const comando = this._sanitizeCommand(comandoRaw);

            logger.info(`INTENT(${operacaoId}): A interpretar → "${comando}"`);

            // Guardar histórico com segurança
            try {
                memory.addHistory({
                    tipo: "intent",
                    entrada: comando,
                    data: new Date().toISOString()
                });
            } catch (err) {
                logger.warn("INTENT: Falha ao guardar histórico", err);
            }

            // ------------------------------------------------------
            // INTENTS PRINCIPAIS (compatíveis com IA-ENGINE)
            // ------------------------------------------------------

            // 1) Health / Ping
            if (this._match(comando, ["ping", "yuno estas ai", "yuno está ai", "yuno está aí"])) {
                return { type: "diagnostico" };
            }

            // 2) Ajuda
            if (this._match(comando, ["ajuda", "help", "o que tu consegues fazer"])) {
                return { type: "explicar", target: "ajuda" };
            }

            // 3) Preview
            if (this._match(comando, ["preview", "gerar preview", "mostrar preview"])) {
                return { 
                    type: "preview",
                    target: this._extrairAlvo(comando)
                };
            }

            // 4) Construir (mapear para "construir" do IA-Engine)
            if (this._match(comando, ["construir", "criar", "montar", "fazer"])) {
                return { 
                    type: "construir",
                    target: this._extrairAlvo(comando)
                };
            }

            // 5) Pentest
            if (this._match(comando, ["pentest", "analisa segurança", "verifica segurança"])) {
                return { type: "pentest" };
            }

            // 6) Diagnóstico
            if (this._match(comando, ["diagnostico", "diagnóstico", "estado do sistema"])) {
                return { type: "diagnostico" };
            }

            // 7) Explicação
            if (this._match(comando, ["explica", "explicar", "detalha isso"])) {
                return { 
                    type: "explicar",
                    target: this._extrairAlvo(comando)
                };
            }

            // ------------------------------------------------------
            // INTENTS ESPECIAIS 13.0
            // (Todos convertidos para tipos reconhecidos pelo IA-ENGINE)
            // ------------------------------------------------------

            // impacto → explicar
            if (this._match(comando, ["analisa impacto", "impacto desta ação"])) {
                return { type: "explicar", target: "impacto" };
            }

            // risco → pentest (modo leve)
            if (this._match(comando, ["analisa risco", "verifica risco"])) {
                return { type: "pentest" };
            }

            if (this._match(comando, ["modo jarvis", "ativar jarvis"])) {
                return { type: "explicar", target: "modo jarvis" };
            }

            if (this._match(comando, ["caminho completo", "explica caminho"])) {
                return { type: "explicar", target: "caminho completo" };
            }

            // ------------------------------------------------------
            // FALLBACK INTELIGENTE
            // ------------------------------------------------------
            logger.warn(`INTENT(${operacaoId}): Nenhuma intenção clara para "${comando}"`);

            return {
                type: "explicar",
                target: `desconhecido: ${comando}`
            };

        } catch (err) {
            logger.error(`INTENT(${operacaoId}): ERRO CRÍTICO`, err);

            return {
                type: "erro",
                mensagem: "Falha ao interpretar comando.",
                detalhe: err.message,
                operacaoId
            };
        }
    },

    // ==========================================================
    // Sanitização do comando
    // ==========================================================
    _sanitizeCommand(input) {
        if (!input) return "";
        if (typeof input !== "string") input = String(input);

        return input
            .normalize("NFD")                           // remover acentos
            .replace(/[\u0300-\u036f]/g, "")            // limpar acentos remanescentes
            .replace(/[\n\r\t]/g, " ")                  // linhas e tabs
            .replace(/\s+/g, " ")                       // espaços repetidos
            .trim()
            .toLowerCase();
    },

    // ==========================================================
    // Matching seguro
    // ==========================================================
    _match(text, lista) {
        return lista.some(item => text.includes(item));
    },

    // ==========================================================
    // Extrair alvo
    // ==========================================================
    _extrairAlvo(text) {
        const removers = ["construir", "criar", "montar", "fazer", "preview", "explicar"];

        let result = text;
        removers.forEach(r => {
            result = result.replace(r, "");
        });

        result = result.trim();
        if (!result || result.length < 2) return null;

        return result;
    }
};
