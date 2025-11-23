// ===============================================================
// 🧠 YUNO MEMORY SYSTEM (v10.3 Híbrida)
// Memória Curta • Longa • Persistente (JSON)
// ===============================================================

const fs = require("fs");
const path = require("path");
const logger = require("../../utils/logger");

// Caminhos dos ficheiros
const MEMORY_DIR = path.join(__dirname, "store");
const SHORT_FILE = path.join(MEMORY_DIR, "short-term.json");
const LONG_FILE = path.join(MEMORY_DIR, "long-term.json");

// Criar diretório se não existir
if (!fs.existsSync(MEMORY_DIR)) fs.mkdirSync(MEMORY_DIR);

// Criar ficheiros se estiverem em falta
if (!fs.existsSync(SHORT_FILE)) fs.writeFileSync(SHORT_FILE, "[]");
if (!fs.existsSync(LONG_FILE)) fs.writeFileSync(LONG_FILE, "[]");

// ===============================================================
// 📌 MEMÓRIA CURTA (Short-term)
// Dura apenas durante a sessão ou 30 minutos
// ===============================================================
function saveShort(prompt) {
    try {
        let data = JSON.parse(fs.readFileSync(SHORT_FILE, "utf8"));

        data.push({
            texto: prompt,
            timestamp: Date.now()
        });

        // Limite máximo: 25 mensagens
        if (data.length > 25) data.shift();

        fs.writeFileSync(SHORT_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        logger.error("Erro ao gravar memória curta: " + err);
    }
}

function getShort() {
    try {
        return JSON.parse(fs.readFileSync(SHORT_FILE, "utf8"));
    } catch (err) {
        return [];
    }
}

// ===============================================================
// 📌 MEMÓRIA LONGA (Long-term)
// Guarda informação relevante de forma persistente
// ===============================================================
function saveLong(prompt, resposta) {
    try {
        let data = JSON.parse(fs.readFileSync(LONG_FILE, "utf8"));

        data.push({
            prompt,
            resposta,
            timestamp: Date.now()
        });

        fs.writeFileSync(LONG_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        logger.error("Erro ao gravar memória longa: " + err);
    }
}

function getLong() {
    try {
        return JSON.parse(fs.readFileSync(LONG_FILE, "utf8"));
    } catch (err) {
        return [];
    }
}

// ===============================================================
// 🧼 LIMPEZA AUTOMÁTICA
// Apaga memórias antigas a cada X horas (prepara para 10.4)
// ===============================================================
function cleanup() {
    try {
        let short = getShort().filter(m => Date.now() - m.timestamp < 30 * 60 * 1000); // 30 min
        let long = getLong(); // futura limpeza inteligente

        fs.writeFileSync(SHORT_FILE, JSON.stringify(short, null, 2));
        fs.writeFileSync(LONG_FILE, JSON.stringify(long, null, 2));

        logger.system("Memória limpa.");
    } catch (err) {
        logger.error("Erro na limpeza de memória: " + err);
    }
}

// ===============================================================
// EXPORTAÇÃO DO MÓDULO
// ===============================================================
module.exports = {
    saveShort,
    getShort,
    saveLong,
    getLong,
    cleanup
};
