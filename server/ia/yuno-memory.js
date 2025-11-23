// ======================================================
// YUNO MEMORY — Memória Curta, Longa e Persistente (10.3)
// ======================================================

export const YunoMemory = {
    short: [],    // memória da conversa
    long: [],     // aprendizagens
    persistent: [], // gravação futura

    saveLong(text) {
        this.long.push({
            text,
            time: Date.now()
        });
    },

    clearShort() {
        this.short = [];
    }
};
