// ======================================================
// YUNO MEMORY — Memória Curta, Longa e Formatação 10.3
// ======================================================

export const YunoMemory = {

    short: [],        // histórico de mensagens recentes
    long: [],         // aprendizagens importantes
    persistent: [],   // futura memória em disco

    saveLong(text) {
        this.long.push({
            text,
            time: Date.now()
        });
    },

    clearShort() {
        this.short = [];
    },

    // Formato compatível com GPT (system + assistant)
    formatForAI() {
        return [
            ...this.long.map(m => ({
                role: "system",
                content: m.text
            })),
            ...this.short.map(m => ({
                role: "assistant",
                content: m.content || m.text
            }))
        ];
    }
};
