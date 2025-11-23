// ============================================================
// YUNO IA — MEMORY SYSTEM 10.3
// Memória curta, longa, persistente e formatação para IA
// ============================================================

const fs = require("fs");
const path = require("path");

const MEMORY_PATH = path.join(__dirname, "../data/yuno-memory.json");

let memory = {
    short: [],
    long: [],
    persistent: []
};

if (fs.existsSync(MEMORY_PATH)) {
    try {
        memory = JSON.parse(fs.readFileSync(MEMORY_PATH, "utf8"));
    } catch {
        console.warn("Erro ao carregar memória, criando nova...");
    }
}

function savePersistent() {
    fs.writeFileSync(MEMORY_PATH, JSON.stringify(memory, null, 2));
}

module.exports = {
    addShort(text) {
        memory.short.push({ text, ts: Date.now() });
        if (memory.short.length > 12) memory.short.shift();
    },

    addLong(text) {
        memory.long.push({ text, ts: Date.now() });
        savePersistent();
    },

    addPersistent(obj) {
        memory.persistent.push(obj);
        savePersistent();
    },

    formatForAI() {
        return [
            ...memory.long.map(m => ({ role: "system", content: m.text })),
            ...memory.short.map(m => ({ role: "assistant", content: m.text }))
        ];
    }
};
