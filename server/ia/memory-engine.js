
// ===========================================================
// YUNO IA — MEMORY ENGINE (v10.3 HÍBRIDA)
// Memória curta, memória longa, persistente e compressão
// ===========================================================

const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");

class MemoryEngine {

    constructor() {
        this.version = "10.3";

        // Memória curta (RAM)
        this.shortTerm = [];

        // Memória longa (RAM + disco)
        this.longTerm = [];

        // Caminho da memória persistente
        this.filePath = path.join(__dirname, "..", "..", "data", "memory.json");

        // Carregar memória persistente se existir
        this.loadPersistentMemory();
    }

    // ============================================================
    // MEMÓRIA CURTA — últimas mensagens recentes
    // ============================================================
    pushShortTerm(userText) {
        this.shortTerm.push({
            text: userText,
            timestamp: Date.now()
        });

        // Limitar para não crescer demais
        if (this.shortTerm.length > 20) {
            this.shortTerm.shift(); // remove o mais antigo
        }
    }

    getShortTermSlice(limit = 6) {
        return this.shortTerm.slice(-limit);
    }

    // ============================================================
    // MEMÓRIA LONGA — coisas que importam
    // ============================================================
    pushLongTerm(input, response) {
        const entry = {
            input,
            response,
            timestamp: Date.now()
        };

        this.longTerm.push(entry);
        this.savePersistentMemory();
    }

    getLongTermSlice(limit = 3) {
        return this.longTerm.slice(-limit);
    }

    // ============================================================
    // MEMÓRIA PERSISTENTE — salva em disco
    // ============================================================
    loadPersistentMemory() {
        try {
            if (fs.existsSync(this.filePath)) {
                const raw = fs.readFileSync(this.filePath, "utf8");
                const json = JSON.parse(raw);

                this.longTerm = json.longTerm || [];

                logger.success("Memória persistente carregada.");
            }
        } catch (err) {
            logger.error("Erro ao carregar memória persistente:");
            console.error(err);
        }
    }

    savePersistentMemory() {
        try {
            const data = {
                longTerm: this.longTerm
            };

            fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf8");
        } catch (err) {
            logger.error("Erro ao salvar memória persistente:");
            console.error(err);
        }
    }

    // ============================================================
    // COMPACTAÇÃO INTELIGENTE 10.3
    // ============================================================
    compress() {
        if (this.longTerm.length < 10) return;

        const compactado = [];

        for (let i = 0; i < this.longTerm.length; i += 2) {
            const atual = this.longTerm[i];
            const prox = this.longTerm[i + 1];

            const block = {
                input: `${atual.input} / ${prox?.input || ""}`,
                response: `${atual.response} / ${prox?.response || ""}`,
                timestamp: atual.timestamp
            };

            compactado.push(block);
        }

        this.longTerm = compactado;
        this.savePersistentMemory();

        logger.system("Memória longa compactada (10.3).");
    }

    // ============================================================
    // LIMPEZA AUTOMÁTICA
    // ============================================================
    cleanup() {
        const limite = 100;

        if (this.longTerm.length > limite) {
            this.longTerm = this.longTerm.slice(-limite);
            this.savePersistentMemory();

            logger.warn("Memória longa limpa (limite excedido).");
        }
    }

}

module.exports = MemoryEngine;
