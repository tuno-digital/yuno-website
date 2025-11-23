// ======================================================
// YUNO COMMANDS — Execução de Comandos da IA (v10.3)
// ======================================================

export const YunoCommands = {
    prefixes: ["!", "/", "yuno."], 

    async tryExecute(prompt) {
        const text = prompt.toLowerCase().trim();

        // Comando: limpar memória curta
        if (text === "/limpar" || text === "!limpar") {
            return "🧹 Memória curta limpa!";
        }

        // Comando: verificar estado
        if (text === "/estado") {
            return "⚙️ Yuno 10.3 operacional e estável.";
        }

        return null; // não é comando
    }
};
