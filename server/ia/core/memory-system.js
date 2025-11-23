// ===============================================================
// 🧠 YUNO MEMORY SYSTEM — v10.3
// Memória Curta • Longa • Persistente Inteligente
// ===============================================================

const fs = require("fs");
const path = require("path");
const logger = require("../../utils/logger");

const MEMORY_FILE = path.join(__dirname, "../../..", "data", "memory.json");

// Estrutura base da memória persistente
let persistentMemory = {
    longTerm: [],
    system: []
};

// Carrega do ficheiro ao iniciar
try {
    if (fs.existsSync(MEMORY_FILE)) {
        const raw = fs.readFileSync(MEMORY_FILE, "utf8");
        persistentMemory = JSON.parse(raw);
        logger.success("Memória persistente carregada.");
    } else {
        savePersistent();
    }
} catch (e) {
    logger.error("Falha ao carregar memória persistente.");
}

// Memória curta por sessão (não persiste)
const shortTerm = {};


// ===============================================================
// 🔹 MÉTODOS
// ===============================================================

// ---- MEMÓRIA CURTA ----
function shortTermAdd(entry) {
    if (!shortTerm[entry.userId]) shortTerm[entry.userId] = [];
    shortTerm[entry.userId].push({
        text: entry.text,
        time: Date.now()
    });

    // mantém apenas as últimas 5 mensagens
    if (shortTerm[entry.userId].length > 5) {
        shortTerm[entry.userId].shift();
    }
}

function shortTermGet(userId) {
    return shortTerm[userId] || [];
}


// ---- MEMÓRIA LONGA ----
function longTermMaybeStore(input, output) {
    if (input.length < 20) return; // ignora mensagens curtas

    persistentMemory.longTerm.push({
        pergunta: input,
        resposta: output,
        time: Date.now()
    });

    savePersistent();
}


// ---- MEMÓRIA PERSISTENTE ----
function savePersistent() {
    try {
        fs.writeFileSync(MEMORY_FILE, JSON.stringify(persistentMemory, null, 2));
    } catch (e) {
        logger.error("Erro ao gravar memória persistente.");
    }
}


module.exports = {
    shortTermAdd,
    shortTermGet,
    longTermMaybeStore
};
