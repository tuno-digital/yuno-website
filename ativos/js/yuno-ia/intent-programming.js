// yuno-ia/intent-programming.js
// Interpretação de intenções relacionadas à programação (v10.2)

export const YUNO_INTENT_PROGRAMMING = {

    detectarIntencao(texto) {
        texto = texto.toLowerCase();

        if (texto.includes("cria um módulo") || texto.includes("novo módulo"))
            return "criar_modulo";

        if (texto.includes("atualiza") || texto.includes("modifica"))
            return "modificar_codigo";

        if (texto.includes("corrige") || texto.includes("bug"))
            return "corrigir_bug";

        if (texto.includes("reescreve") || texto.includes("refaz"))
            return "reescrever_parcial";

        return null;
    },

    gerarBlueprint(intencao, texto) {

        if (intencao === "criar_modulo") {
            return {
                tipo: "modulo",
                nome: this._extrairNome(texto),
                codigoBase: `
export const ${this._extrairNome(texto)} = {
    init() {},
    executar() {}
};
                `.trim()
            };
        }

        if (intencao === "corrigir_bug") {
            return {
                tipo: "patch",
                descricao: "Correção automática solicitada pelo utilizador.",
                instrucao: texto
            };
        }

        if (intencao === "modificar_codigo" || intencao === "reescrever_parcial") {
            return {
                tipo: "alteracao",
                descricao: "Pedido de modificação detectado.",
                instrucao: texto
            };
        }

        return null;
    },

    _extrairNome(texto) {
        const match = texto.match(/m[oó]dulo\s+([a-z0-9-_]+)/i);
        return match ? match[1].replace(/-/g, "_") : "yuno_modulo_auto";
    }
};
