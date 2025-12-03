// ===========================================================
// YUNO 13.0 — AUDIT LOG (VERSÃO BLINDADA E CORRIGIDA)
// Mantém estrutura original — apenas corrige erros críticos
// ===========================================================

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const logger = require("../core/logger");

// ===========================================================
// ROOT REAL DO PROJETO
// ===========================================================
const PROJECT_ROOT = path.resolve(__dirname, "../..");

// Caminho final correto
const AUDIT_PATH = path.join(PROJECT_ROOT, "logs", "audit.log");

// ===========================================================
// GARANTIR EXISTÊNCIA DO DIRETÓRIO E DO FICHEIRO
// ===========================================================
function ensureAuditFile() {
    const dir = path.dirname(AUDIT_PATH);

    try {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        if (!fs.existsSync(AUDIT_PATH)) {
            fs.writeFileSync(AUDIT_PATH, "", "utf8");
        }

        // ✔ PERMISSÕES SEGURAS
        try {
            fs.chmodSync(AUDIT_PATH, 0o600);
        } catch (_) {
            // Em Windows ignora, pois chmod não funciona igual
        }

    } catch (err) {
        logger.error("Erro ao garantir audit.log:", err);
    }
}
ensureAuditFile();

// ===========================================================
// CHECKSUM SHA256
// ===========================================================
function generateChecksum(data) {
    return crypto.createHash("sha256").update(data).digest("hex");
}

// ===========================================================
// Sanitização mínima do META (evita crash com circular refs)
// ===========================================================
function safeMeta(meta) {
    try {
        return JSON.parse(JSON.stringify(meta));
    } catch (err) {
        return { warn: "META_INVALIDO_NÃO_SERIALIZAVEL" };
    }
}

// ===========================================================
// ESCREVER LINHA DE AUDITORIA
// ===========================================================
function writeAudit(event, meta = {}) {
    try {
        const timestamp = new Date().toISOString();

        const cleanMeta = safeMeta(meta);

        const entryObject = { timestamp, event, meta: cleanMeta };
        const entryString = JSON.stringify(entryObject);

        const checksum = generateChecksum(entryString);

        const finalLine = `${entryString} | checksum:${checksum}\n`;

        fs.appendFileSync(AUDIT_PATH, finalLine, "utf8");

        return true;

    } catch (err) {
        logger.error("Erro ao escrever audit log:", err);
        return false;
    }
}

// ===========================================================
// ROTATION AUTOMÁTICA
// ===========================================================
function rotateIfLarge(maxMB = 5) {
    try {
        if (!fs.existsSync(AUDIT_PATH)) return;

        const sizeMB = fs.statSync(AUDIT_PATH).size / (1024 * 1024);

        if (sizeMB < maxMB) return;

        const backupName = `audit-${Date.now()}.log`;
        const backupPath = path.join(path.dirname(AUDIT_PATH), backupName);

        fs.renameSync(AUDIT_PATH, backupPath);
        fs.writeFileSync(AUDIT_PATH, "", "utf8");

        try {
            fs.chmodSync(AUDIT_PATH, 0o600);
        } catch (_) {}

    } catch (err) {
        logger.error("Erro na rotação de audit log:", err);
    }
}

// ===========================================================
// ALIAS — compatibilidade com controllers antigos
// ===========================================================
function registrar(event, meta = {}) {
    return writeAudit(event, meta);
}

// ===========================================================
// EXPORTAÇÃO
// ===========================================================
module.exports = {
    writeAudit,
    registrar,     // ✔ necessário para não quebrar o projecto
    rotateIfLarge,
    AUDIT_PATH,
    PROJECT_ROOT
};
