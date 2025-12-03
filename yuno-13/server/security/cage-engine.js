// ===========================================================
// YUNO 13.0 — CAGE ENGINE (JAULA DE SEGURANÇA MAX)
// Versão corrigida + blindada (sem mudar arquitetura)
// ===========================================================

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const riskAnalyzer = require("../core/risk-analyzer");
const logger = require("../core/logger");
const audit = require("./audit-log");

// ===========================================================
// ESTADO PERSISTENTE DA JAULA
// ===========================================================
const STATE_FILE = path.join(__dirname, "cage-state.json");

let cageEnabled = false;

// Escrita atômica — evita ficheiro corrompido
function atomicWriteFileSync(filePath, data) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const tmp = filePath + ".tmp";
    const fd = fs.openSync(tmp, "w");
    try {
        fs.writeSync(fd, data, null, "utf8");
        fs.fsyncSync(fd);
    } finally {
        fs.closeSync(fd);
    }
    fs.renameSync(tmp, filePath);

    const dirFd = fs.openSync(dir, "r");
    fs.fsyncSync(dirFd);
    fs.closeSync(dirFd);
}

// Carregar estado
function loadState() {
    try {
        if (!fs.existsSync(STATE_FILE)) return;

        const raw = fs.readFileSync(STATE_FILE, "utf8");
        const json = JSON.parse(raw);

        cageEnabled = json.enabled === true;
    } catch (err) {
        // backup de ficheiro corrompido
        try {
            const backup = STATE_FILE + ".corrupt-" + Date.now();
            fs.renameSync(STATE_FILE, backup);

            audit.writeAudit("CAGE_STATE_CORRUPT", { backup });
            logger.error("cage-state corrompido — backup criado", backup);
        } catch (e) {
            logger.error("Erro ao criar backup de cage-state", e);
        }
    }
}

loadState();

// Lock para evitar concorrência
const LOCK = STATE_FILE + ".lock";

function acquireLock() {
    try {
        const fd = fs.openSync(LOCK, "wx");
        fs.writeSync(fd, String(process.pid));
        fs.closeSync(fd);
        return true;
    } catch {
        return false;
    }
}

function releaseLock() {
    try { fs.unlinkSync(LOCK); } catch {}
}

function saveState() {
    try {
        atomicWriteFileSync(
            STATE_FILE,
            JSON.stringify({ enabled: cageEnabled }, null, 2)
        );
    } catch (err) {
        logger.error("Erro ao salvar cage-state.json", err);
    }
}

// ===========================================================
// PADRÕES PROIBIDOS — versão regex 13.0 sem upgrade
// ===========================================================
const BLOCKED_REGEX = [
    /\brequire\s*\(/i,
    /\bprocess\./i,
    /\bfs\./i,
    /child_process/i,
    /\bwhile\s*\(/i,
    /\bfor\s*\(\s*;\s*;\s*\)/i,
    /\beval\s*\(/i,
    /\bimport\s*\(/i,
    /<script\b/i,
    /<\/script>/i,
    /\bXMLHttpRequest\b/i,
    /\blocalstorage\b/i,
    /\bsessionstorage\b/i
];

// ===========================================================
// NORMALIZAÇÃO
// ===========================================================
function normalizeInput(str) {
    return str
        .normalize("NFKC")
        .replace(/[\u0000-\u001F\u007F\u200B-\u200F]/g, "");
}

// ===========================================================
// DETECÇÃO DE EVASÃO (ev + al, hex, fromCharCode)
// ===========================================================
function detectEvasion(content) {
    const f = [];

    if (/(["']?ev["']?\s*\+\s*["']?al["']?)/i.test(content))
        f.push("Concatenação suspeita: eval()");
    if (/string\.fromcharcode\s*\(/i.test(content))
        f.push("Uso de String.fromCharCode");
    if (/\\x[0-9a-f]{2}/i.test(content))
        f.push("Hexadecimal encoding detectado");

    return f;
}

// ===========================================================
// SCAN ESTÁTICO
// ===========================================================
function deepScan(content) {
    const errors = [];
    const norm = normalizeInput(content);

    for (const re of BLOCKED_REGEX) {
        if (re.test(norm)) {
            errors.push(`Padrão proibido detectado: ${re}`);
        }
    }

    errors.push(...detectEvasion(norm));
    return errors;
}

// ===========================================================
// ANALISADOR SEGURO
// ===========================================================
async function secureAnalyze(blueprint, ctx = {}) {
    try {
        if (!blueprint || typeof blueprint !== "string")
            return { ok: false, error: "Blueprint inválido" };

        if (blueprint.length > 250000)
            return { ok: false, error: "Blueprint demasiado grande." };

        const hash = crypto.createHash("sha256")
            .update(blueprint)
            .digest("hex");

        const staticBlocks = deepScan(blueprint);

        // Timeout real
        const riskReport = await Promise.race([
            riskAnalyzer.analyzeContent(blueprint),
            new Promise(res => setTimeout(() =>
                res({ timeout: true }), 2500))
        ]);

        const risks = riskReport?.risks || [];
        const timeout = riskReport?.timeout === true;

        const critical =
            staticBlocks.length > 0 ||
            risks.some(r => r.level === "critical") ||
            timeout;

        audit.writeAudit("CAGE_ANALYZE", {
            hash,
            blockedCount: staticBlocks.length,
            riskCount: risks.length,
            timeout,
            requestId: ctx.requestId || null,
            ip: ctx.ip || null,
            user: ctx.user || null,
            route: ctx.route || null
        });

        return {
            ok: !critical,
            blocked: staticBlocks,
            risks,
            recommendation: critical
                ? "Conteúdo bloqueado automaticamente."
                : "Conteúdo autorizado."
        };

    } catch (err) {
        logger.error("Erro no CAGE ENGINE", err);
        return { ok: false, error: "Erro interno no cage-engine." };
    }
}

// ===========================================================
// TOGGLE — com lock + auditoria
// ===========================================================
function toggle() {
    if (!acquireLock()) {
        audit.writeAudit("CAGE_TOGGLE_CONFLICT", { pid: process.pid });
        throw new Error("Operação concorrente detectada.");
    }

    try {
        cageEnabled = !cageEnabled;
        saveState();

        audit.writeAudit("CAGE_TOGGLE", {
            newState: cageEnabled,
            pid: process.pid
        });

        logger.warn(
            `CAGE ENGINE agora está ${cageEnabled ? "ATIVO" : "DESATIVADO"}.`
        );

        return cageEnabled;

    } finally {
        releaseLock();
    }
}

// ===========================================================
// EXPORTAÇÃO
// ===========================================================
module.exports = {
    secureAnalyze,
    toggle,
    isEnabled: () => cageEnabled
};
