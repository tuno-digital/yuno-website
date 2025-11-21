// ======================================================
// YUNO IA — MEMORY ENGINE (v10.1 Hybrid Neon)
// Memória curta, longa, persistente e compressão inteligente
// ======================================================

export const YUNO_MEMORY = {

    // ============================
    // ARMAZENAMENTO BASE
    // ============================
    shortTerm: [],      // Memória da conversa — dura poucos minutos
    longTerm: [],       // Conhecimento permanente
    systemMemory: [],   // Logs críticos e decisões internas da IA

    maxShort: 20,
    maxLong: 500,

    // ============================
    // ADICIONAR À MEMÓRIA CURTA
    // ============================
    addShort(texto) {
        if (!texto) return;

        this.shortTerm.push({
            texto,
            timestamp: Date.now()
        });

        if (this.shortTerm.length > this.maxShort) {
            this.shortTerm.shift(); // remove o mais antigo
        }
    },

    // ============================
    // ADICIONAR À MEMÓRIA LONGA
    // ============================
    addLong(texto) {
        if (!texto) return;

        this.longTerm.push({
            texto,
            timestamp: Date.now()
        });

        this._guardarLocal();
        this._verificarCompressao();
    },

    // ============================
    // MEMÓRIA DO SISTEMA / IA
    // ============================
    addSystem(info) {
        this.systemMemory.push({
            info,
            timestamp: Date.now()
        });

        if (this.systemMemory.length > 300) {
            this.systemMemory.shift();
        }
    },

    // ============================
    // OBTER CONTEXTO COMPLETO
    // ============================
    getContexto() {
        return {
            short: this.shortTerm,
            long: this.longTerm.slice(-20), // últimos elementos relevantes
            system: this.systemMemory.slice(-50)
        };
    },

    // ============================
    // APRENDIZAGEM AUTOMÁTICA
    // ============================
    aprender(texto) {
        if (!texto) return;

        this.addLong(texto);
        this.addSystem(`Aprendeu: ${texto}`);
    },

    // ============================
    // LIMPAR MEMÓRIA TEMPORÁRIA
    // ============================
    limparShort() {
        this.shortTerm = [];
    },

    // ============================
    // LIMPAR TODA MEMÓRIA
    // ============================
    reset() {
        this.shortTerm = [];
        this.longTerm = [];
        this.systemMemory = [];
        localStorage.removeItem("yunoIA_memory");
    },

    // ============================
    // SALVAR MEMÓRIA LONGA
    // ============================
    _guardarLocal() {
        try {
            localStorage.setItem("yunoIA_memory", JSON.stringify(this.longTerm));
        } catch (e) {
            console.warn("Erro ao guardar memória", e);
        }
    },

    // ============================
    // CARREGAR MEMÓRIA NA INICIALIZAÇÃO
    // ============================
    carregar() {
        try {
            const data = localStorage.getItem("yunoIA_memory");
            if (data) this.longTerm = JSON.parse(data);
        } catch {
            this.longTerm = [];
        }
    },

    // ============================
    // COMPRESSÃO INTELIGENTE
    // ============================
    _verificarCompressao() {
        if (this.longTerm.length < this.maxLong) return;

        // Compressão básica: juntar memórias antigas em 1 resumo
        const resumo = this.longTerm.slice(0, 100)
            .map(m => m.texto)
            .join(" | ")
            .slice(0, 2000);

        this.longTerm = [
            { texto: `Resumo comprimido: ${resumo}`, timestamp: Date.now() },
            ...this.longTerm.slice(-200)
        ];

        this._guardarLocal();
    }
};

// Carregar memória ao iniciar
YUNO_MEMORY.carregar();

// Disponibilizar globalmente (opcional)
window.YUNO_MEMORY = YUNO_MEMORY;
