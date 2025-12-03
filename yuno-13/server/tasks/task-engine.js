// ===========================================================
// YUNO 13.0 — TASK ENGINE (VERSÃO FINAL, BLINDADA, CORRIGIDA)
// ===========================================================

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const logger = require("../core/logger");
const audit = require("../security/audit-log");

// ROOT FIXO
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const STORE_PATH = path.join(PROJECT_ROOT, "server", "tasks", "task-store.json");
const LOCK_PATH = STORE_PATH + ".lock";

// ===========================================================
// 1 — LOCKFILE COM TTL + TAKEOVER + BACKOFF
// ===========================================================
const LOCK_TTL_MS = 8000;

function safeNow() {
    return Date.now();
}

function readLockMeta() {
    try {
        const raw = fs.readFileSync(LOCK_PATH, "utf8");
        const [pid, ts] = raw.split(":");
        return { pid: Number(pid), ts: Number(ts) };
    } catch {
        return null;
    }
}

function processAlive(pid) {
    try {
        return process.kill(pid, 0);
    } catch {
        return false;
    }
}

function acquireLock() {
    const start = safeNow();
    const maxWait = 5000;

    while (safeNow() - start < maxWait) {
        try {
            const fd = fs.openSync(LOCK_PATH, "wx");
            fs.writeFileSync(fd, `${process.pid}:${safeNow()}`, "utf8");
            fs.closeSync(fd);
            return true;
        } catch {
            const meta = readLockMeta();
            if (!meta) {
                try { fs.unlinkSync(LOCK_PATH); } catch {}
                continue;
            }

            const expired = safeNow() - meta.ts > LOCK_TTL_MS;
            const ownerDead = !processAlive(meta.pid);

            if (expired || ownerDead) {
                try { fs.unlinkSync(LOCK_PATH); } catch {}
                continue;
            }

            Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 40);
        }
    }

    throw new Error("TaskEngine: não foi possível obter lock.");
}

function releaseLock() {
    try { fs.unlinkSync(LOCK_PATH); } catch {}
}

// ===========================================================
// 2 — EnsureStore + Anti-TOCTOU + Copia corrupta
// ===========================================================
function ensureStore() {
    const dir = path.dirname(STORE_PATH);

    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    if (!fs.existsSync(STORE_PATH)) {
        const initial = {
            version: "13.0",
            schemaVersion: 1,
            lastUpdate: null,
            tasks: []
        };
        fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 4), "utf8");
        return;
    }

    try {
        const raw = fs.readFileSync(STORE_PATH, "utf8");
        JSON.parse(raw);
    } catch {
        const backup = STORE_PATH + `.corrupt-${Date.now()}.json`;
        fs.renameSync(STORE_PATH, backup);

        const initial = {
            version: "13.0",
            schemaVersion: 1,
            lastUpdate: null,
            tasks: []
        };
        fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 4), "utf8");

        audit.writeAudit("TASK_STORE_CORRUPT_RECOVER", { backup });
    }
}

ensureStore();

// ===========================================================
// 3 — Escrita atômica + fsync + NOFOLLOW (anti-symlink)
// ===========================================================
function atomicWrite(filePath, data) {
    const tmp = filePath + ".tmp";

    const fd = fs.openSync(tmp, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_TRUNC | fs.constants.O_NOFOLLOW, 0o600);
    fs.writeSync(fd, data);
    fs.fsyncSync(fd);
    fs.closeSync(fd);

    fs.renameSync(tmp, filePath);

    const dirFd = fs.openSync(path.dirname(filePath), "r");
    fs.fsyncSync(dirFd);
    fs.closeSync(dirFd);
}

// ===========================================================
// 4 — Schema mínimo + loadStore seguro
// ===========================================================
function validateStore(store) {
    if (typeof store !== "object") return false;
    if (!Array.isArray(store.tasks)) return false;
    if (typeof store.schemaVersion !== "number") return false;

    return true;
}

function loadStore() {
    try {
        const raw = fs.readFileSync(STORE_PATH, "utf8");
        const json = JSON.parse(raw);

        if (!validateStore(json)) throw new Error("Schema inválido.");
        return json;

    } catch (err) {
        const backup = STORE_PATH + `.corrupt-load-${Date.now()}.json`;
        try { fs.renameSync(STORE_PATH, backup); } catch {}
        audit.writeAudit("TASK_STORE_LOAD_CORRUPT", { backup });

        const clean = {
            version: "13.0",
            schemaVersion: 1,
            lastUpdate: null,
            tasks: []
        };
        atomicWrite(STORE_PATH, JSON.stringify(clean, null, 4));
        return clean;
    }
}

// ===========================================================
// 5 — saveStore (com lock e atomicidade real)
// ===========================================================
function saveStore(store) {
    acquireLock();
    try {
        store.lastUpdate = new Date().toISOString();
        atomicWrite(STORE_PATH, JSON.stringify(store, null, 4));
    } finally {
        releaseLock();
    }
}

// ===========================================================
// 6 — UUID seguro
// ===========================================================
function newId() {
    return "tsk-" + crypto.randomUUID();
}

// ===========================================================
// 7 — State Machine Completa
// ===========================================================
const VALID_STATES = ["pending", "in-progress", "done"];
const TRANSITIONS = {
    pending: ["in-progress"],
    "in-progress": ["done"],
    done: []
};

function validateTransition(current, next) {
    return TRANSITIONS[current]?.includes(next);
}

// ===========================================================
// 8 — Criar Task
// ===========================================================
function createTask({ title, description = "", dependsOn = [] }) {
    if (typeof title !== "string" || !title.trim()) {
        throw new Error("TaskEngine: title inválido.");
    }

    if (!Array.isArray(dependsOn)) dependsOn = [dependsOn];

    const store = loadStore();

    const id = newId();

    const task = {
        id,
        title,
        description,
        dependsOn,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: null,
        blueprint: null,
        report: []
    };

    store.tasks.push(task);
    saveStore(store);

    audit.writeAudit("TASK_CREATE", { id });

    return JSON.parse(JSON.stringify(task));
}

// ===========================================================
// 9 — Listar
// ===========================================================
function listTasks() {
    return loadStore().tasks.map(t => ({ ...t }));
}

// ===========================================================
// 10 — Atualizar Task
// ===========================================================
function updateTask(id, updates = {}) {
    const store = loadStore();
    const t = store.tasks.find(x => x.id === id);
    if (!t) return null;

    if (updates.status && !VALID_STATES.includes(updates.status)) {
        throw new Error("Estado inválido.");
    }

    if (updates.status && !validateTransition(t.status, updates.status)) {
        throw new Error("Transição de estado não permitida.");
    }

    const ALLOWED = ["title", "description", "dependsOn", "status", "blueprint", "report"];

    for (const k of Object.keys(updates)) {
        if (ALLOWED.includes(k)) t[k] = updates[k];
    }

    t.updatedAt = new Date().toISOString();

    saveStore(store);
    audit.writeAudit("TASK_UPDATE", { id });

    return JSON.parse(JSON.stringify(t));
}

// ===========================================================
// 11 — Completar
// ===========================================================
function completeTask(id) {
    return updateTask(id, { status: "done" });
}

// ===========================================================
// 12 — Remover
// ===========================================================
function removeTask(id) {
    const store = loadStore();
    const before = store.tasks.length;

    store.tasks = store.tasks.filter(t => t.id !== id);
    const removed = store.tasks.length !== before;

    saveStore(store);

    if (removed) audit.writeAudit("TASK_REMOVE", { id });

    return removed;
}

// ===========================================================
// 13 — Blueprint
// ===========================================================
function generateBlueprint(task) {
    return `
📘 BLUEPRINT — ${task.title}

Objetivo:
${task.description}

Dependências:
${task.dependsOn?.join(", ") || "Nenhuma"}

Passos:
1. Analisar contexto
2. Preparar módulos
3. Executar motores
4. Validar impacto
5. Gerar relatório
`;
}

// ===========================================================
// 14 — Report
// ===========================================================
function generateReport(task, info) {
    const entry = { ts: new Date().toISOString(), info };
    updateTask(task.id, { report: [...(task.report || []), entry] });

    audit.writeAudit("TASK_REPORT", { id: task.id });

    return entry;
}

// ===========================================================
// EXPORT
// ===========================================================
module.exports = {
    createTask,
    listTasks,
    updateTask,
    removeTask,
    completeTask,
    generateBlueprint,
    generateReport,
    STORE_PATH,
    PROJECT_ROOT
};
