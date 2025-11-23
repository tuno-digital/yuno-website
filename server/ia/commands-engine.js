// ============================================================
// YUNO IA — COMMAND ENGINE 10.3
// Interpreta e executa comandos antes do THINK
// ============================================================

const { think } = require("./yuno-think");
const memory = require("./memory-system");

module.exports = {
    async execute(input) {
        if (!input) return "Nenhum comando recebido.";

        const msg = input.toLowerCase().trim();

        // Comandos internos
        if (msg === "limpar memoria") {
            memory.short = [];
            return "🧹 Memória temporária limpa!";
        }

        if (msg === "versao" || msg === "versão") {
            return "Yuno IA — versão 10.3 híbrida.";
        }

        if (msg === "estado") {
            return "Tudo operacional — Yuno 10.3 online 🚀";
        }

        // Se não for comando → THINK
        return await think(input);
    }
};
