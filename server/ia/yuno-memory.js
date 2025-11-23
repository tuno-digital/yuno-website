// ======================================================
// YUNO MEMORY — Sistema de Memória 10.3
// ======================================================

export const YunoMemory = {
    short: [],     // Memória da conversa (volátil)
    long: [],      // Memória importante
    persistent: [], // Guardada em disco futuramente

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
