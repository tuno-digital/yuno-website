// ============================================================
// YUNO IA — COMMAND ENGINE 10.3
// Sistema de comandos: interpreta ordens antes de enviar ao THINK
// ============================================================

const logger = require("../utils/logger");
const { think } = require("./yuno-think");

module.exports = {
    async execute(input) {
        if (!input) return "Nenhum comando recebido.";

        const text = input.toLowerCase().trim();

        // 🔹 Comando: limpar memória
        if (text === "limpar memoria" || text === "reset memória") {
            return "🎉 Memória limpa (temporária).";
        }

        // 🔹 Comando: pedir versão
        if (text === "versao" || text === "versão") {
            return "YUNO IA — versão 10.3 híbrida.";
        }

        // 🔹 Comando: estado
        if (text === "estado") {
            return "Tudo operacional, sistema 10.3 ativo 🚀";
        }

        // 🔹 Se não for comando → THINK processa
        const reply = await think(input);
        return reply;
    }
};
