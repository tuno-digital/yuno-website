// ==============================================================
// YUNO 13.0 — LOGGER OFICIAL (VERSÃO CORRIGIDA, ASSÍNCRONA E SEGURA)
// ==============================================================

const fs = require("fs");
const path = require("path");

// --------------------------------------------------------------
// 1) DEFINIR ROOT DO PROJETO DE FORMA CORRETA E ESTÁVEL
// --------------------------------------------------------------
const ROOT = path.resolve(__dirname, "../../../");
const LOG_DIR = path.join(ROOT, "logs");
const LOG_FILE = path.join(LOG_DIR, "yuno.log");
const AUDIT_FILE = path.join(LOG_DIR, "audit.log");

// --------------------------------------------------------------
// 2) CRIAR DIRETÓRIO DE LOGS ASSÍNCRONO
// --------------------------------------------------------------
async function ensureDirs() {
    try {
        await fs.promises.mkdir(LOG_DIR, { recursive: true });
        await fs.promises.appendFile(LOG_FILE, "");
        await fs.promises.appendFile(AUDIT_FILE, "");
    } catch (err) {
        console.error("❌ LOGGER: Falha ao preparar diretórios de log", err);
    }
}
ensureDirs();

// --------------------------------------------------------------
// 3) FUNÇÃO DE SANITIZAÇÃO SEGURA
// --------------------------------------------------------------
function safeStringify(data) {
    try {
        return JSON.stringify(data);
    } catch {
        return `"__erro_stringify__"`;
    }
}

function sanitize(input) {
    if (!input) return null;

    if (typeof input === "string") {
        // remove caracteres perigosos
        return input
            .replace(/\n/g, " ")
            .replace(/\r/g, " ")
            .replace(/\t/g, " ")
            .trim();
    }

    return input;
}

// --------------------------------------------------------------
// 4) MÓDULO DE ESCRITA ASSÍNCRONA
// --------------------------------------------------------------
async function writeLog(file, entry) {
    const line = safeStringify(entry) + "\n";

    try {
        await fs.promises.appendFile(file, line);
    } catch (err) {
        console.error("❌ LOGGER: Erro ao escrever log:", err);
    }
}

// --------------------------------------------------------------
// 5) CRIAR ENTRY PADRONIZADO
// --------------------------------------------------------------
function createEntry(level, message, meta) {
    return {
        timestamp: new Date().toISOString(),
        level,
        message: sanitize(message),
        meta: sanitize(meta)
    };
}

// --------------------------------------------------------------
// 6) EXPORTAÇÃO DA API DO LOGGER
// --------------------------------------------------------------
module.exports = {

    async info(message, meta) {
        const entry = createEntry("info", message, meta);
        await writeLog(LOG_FILE, entry);
        return entry;
    },

    async warn(message, meta) {
        const entry = createEntry("warning", message, meta);
        await writeLog(LOG_FILE, entry);
        return entry;
    },

    async error(message, meta) {
        const entry = createEntry("error", message, meta);
        await writeLog(LOG_FILE, entry);
        return entry;
    },

    async security(message, meta) {
        const entry = createEntry("security", message, meta);
        await writeLog(AUDIT_FILE, entry);
        return entry;
    },

    async custom(level, message, meta) {
        const entry = createEntry(level, message, meta);
        await writeLog(LOG_FILE, entry);
        return entry;
    }
};
