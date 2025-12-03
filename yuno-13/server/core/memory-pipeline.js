// server/core/memory-pipeline.js
// YUNO 13.0 — MEMORY PIPELINE (VERSão segura, assíncrona e atômica)

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const logger = require("./logger");

// Configuráveis
const STORE_DIR = path.join(__dirname, "../../server/memory");
const STORE_FILE = path.join(STORE_DIR, "memory-store.json");
const BACKUP_COUNT = 3;
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB max file
const MAX_HISTORY = 1000;
const MAX_TASKS = 2000;
const WRITE_TIMEOUT_MS = 5000;

// Mutex simples in-process (queue)
let writeQueue = Promise.resolve();

function withLock(fn) {
    // enqueue
    writeQueue = writeQueue.then(() => fn()).catch(err => {
        // swallow here so queue continues; caller sees error via thrown promise
        logger.error("memory-pipeline: erro no lock fn", err);
        throw err;
    });
    return writeQueue;
}

// safe stringify to avoid crashes com objetos circulares
function safeStringify(obj) {
    const seen = new WeakSet();
    try {
        return JSON.stringify(obj, (k, v) => {
            if (v && typeof v === "object") {
                if (seen.has(v)) return "[Circular]";
                seen.add(v);
            }
            // truncate big strings
            if (typeof v === "string" && v.length > 10000) {
                return v.slice(0, 10000) + "...[truncated]";
            }
            return v;
        }, 2);
    } catch (err) {
        return '"__stringify_error__"';
    }
}

function deepClone(obj) {
    // small and safe clone using stringify/parse with circular protection
    try {
        return JSON.parse(safeStringify(obj));
    } catch {
        return null;
    }
}

async function ensureStoreDir() {
    try {
        await fs.promises.mkdir(STORE_DIR, { recursive: true });
    } catch (err) {
        console.error("memory-pipeline: falha a criar store dir", err);
    }
}

async function readRawFile() {
    try {
        const stat = await fs.promises.stat(STORE_FILE).catch(() => null);
        if (!stat) return null;
        if (stat.size > MAX_BYTES) {
            logger.warn("memory-pipeline: store file demasiado grande, fazendo backup e reinit");
            // move to backup and signal empty
            await rotateBackups();
            return null;
        }
        const raw = await fs.promises.readFile(STORE_FILE, "utf8");
        return raw;
    } catch (err) {
        logger.error("memory-pipeline: erro ler ficheiro", err);
        return null;
    }
}

async function rotateBackups() {
    try {
        for (let i = BACKUP_COUNT - 1; i >= 0; --i) {
            const src = i === 0 ? STORE_FILE : `${STORE_FILE}.bak.${i}`;
            const dst = `${STORE_FILE}.bak.${i + 1}`;
            if (await exists(src)) {
                await fs.promises.rename(src, dst).catch(() => {});
            }
        }
    } catch (err) {
        logger.error("memory-pipeline: erro ao rotacionar backups", err);
    }
}

async function exists(p) {
    try {
        await fs.promises.access(p, fs.constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

function defaultMemory() {
    return {
        estilo: "neon-futurista",
        historico: [],
        preferencias: {},
        tarefas: [],
        blueprints: [],
        ultimaAcao: null,
        sistema: {
            versao: "13.0",
            modo: "híbrido"
        }
    };
}

// valida shape minimamente
function validateMemory(obj) {
    if (!obj || typeof obj !== "object") return false;
    if (!Array.isArray(obj.historico)) obj.historico = [];
    if (!obj.preferencias || typeof obj.preferencias !== "object") obj.preferencias = {};
    if (!Array.isArray(obj.tarefas)) obj.tarefas = [];
    if (!Array.isArray(obj.blueprints)) obj.blueprints = [];
    return true;
}

// escreve de forma atómica: tmp -> rename
async function atomicWrite(content) {
    const tmp = `${STORE_FILE}.${crypto.randomBytes(6).toString("hex")}.tmp`;
    const data = safeStringify(content);
    // small timeout wrapper
    const writePromise = fs.promises.writeFile(tmp, data, "utf8")
        .then(() => fs.promises.rename(tmp, STORE_FILE))
        .catch(async (err) => {
            // cleanup tmp if exists
            try { if (await exists(tmp)) await fs.promises.unlink(tmp); } catch {}
            throw err;
        });
    // enforce timeout
    const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error("write timeout")), WRITE_TIMEOUT_MS));
    return Promise.race([writePromise, timeout]);
}

// ---------------------------
// Public API (async)
// ---------------------------

module.exports = {

    async init() {
        await ensureStoreDir();
        // if file missing, create with default
        if (!await exists(STORE_FILE)) {
            try {
                await atomicWrite(defaultMemory());
                logger.info("memory-pipeline: store inicializado");
                return { ok: true };
            } catch (err) {
                logger.error("memory-pipeline: falha init", err);
                return { ok: false, error: String(err) };
            }
        }
        // if exists but invalid, try repair
        const raw = await readRawFile();
        if (!raw) {
            // create fresh
            try {
                await rotateBackups();
                await atomicWrite(defaultMemory());
                return { ok: true, repaired: true };
            } catch (err) {
                logger.error("memory-pipeline: init repair falhou", err);
                return { ok: false, error: String(err) };
            }
        }
        try {
            const parsed = JSON.parse(raw);
            if (!validateMemory(parsed)) throw new Error("invalid shape");
            return { ok: true };
        } catch (err) {
            logger.warn("memory-pipeline: store corrupto, recriando backup", err);
            try {
                await rotateBackups();
                await atomicWrite(defaultMemory());
                return { ok: true, repaired: true };
            } catch (e) {
                logger.error("memory-pipeline: nao conseguiu recriar store", e);
                return { ok: false, error: String(e) };
            }
        }
    },

    async read() {
        try {
            const raw = await readRawFile();
            if (!raw) return deepClone(defaultMemory());
            try {
                const parsed = JSON.parse(raw);
                validateMemory(parsed);
                return deepClone(parsed);
            } catch (err) {
                logger.error("memory-pipeline: JSON invalido ao ler, retornando default", err);
                return deepClone(defaultMemory());
            }
        } catch (err) {
            logger.error("memory-pipeline: erro read", err);
            return deepClone(defaultMemory());
        }
    },

    async save(obj) {
        // save via queue (withLock) to avoid concurrent writes
        return withLock(async () => {
            try {
                if (!obj || typeof obj !== "object") throw new Error("invalid data");
                // enforce limits: trim historico/tasks/blueprints
                if (Array.isArray(obj.historico) && obj.historico.length > MAX_HISTORY) {
                    obj.historico = obj.historico.slice(-MAX_HISTORY);
                }
                if (Array.isArray(obj.tarefas) && obj.tarefas.length > MAX_TASKS) {
                    obj.tarefas = obj.tarefas.slice(-MAX_TASKS);
                }
                await rotateBackups();
                await atomicWrite(obj);
                return { ok: true };
            } catch (err) {
                logger.error("memory-pipeline: erro ao salvar", err);
                return { ok: false, error: String(err) };
            }
        });
    },

    async addHistory(entry) {
        if (!entry) return { ok: false, error: "empty entry" };
        // guard payload size
        try {
            const mem = await this.read();
            mem.historico = mem.historico || [];
            mem.historico.push({
                timestamp: Date.now(),
                entry: (typeof entry === "string") ? entry.slice(0, 20000) : deepClone(entry)
            });
            if (mem.historico.length > MAX_HISTORY) mem.historico = mem.historico.slice(-MAX_HISTORY);
            return await this.save(mem);
        } catch (err) {
            logger.error("memory-pipeline: addHistory erro", err);
            return { ok: false, error: String(err) };
        }
    },

    async setPreference(key, value) {
        if (!key || typeof key !== "string") return { ok: false, error: "invalid key" };
        try {
            const mem = await this.read();
            mem.preferencias = mem.preferencias || {};
            mem.preferencias[key] = (typeof value === "string" && value.length > 20000) ? value.slice(0, 20000) : deepClone(value);
            return await this.save(mem);
        } catch (err) {
            logger.error("memory-pipeline: setPreference erro", err);
            return { ok: false, error: String(err) };
        }
    },

    async getPreference(key) {
        try {
            const mem = await this.read();
            return deepClone(mem.preferencias ? mem.preferencias[key] : null) || null;
        } catch (err) {
            logger.error("memory-pipeline: getPreference erro", err);
            return null;
        }
    },

    async addBlueprint(data) {
        if (!data) return { ok: false, error: "empty blueprint" };
        try {
            const mem = await this.read();
            mem.blueprints = mem.blueprints || [];
            mem.blueprints.push({
                timestamp: Date.now(),
                data: deepClone(data)
            });
            // keep recent only (safety)
            if (mem.blueprints.length > 200) mem.blueprints = mem.blueprints.slice(-200);
            return await this.save(mem);
        } catch (err) {
            logger.error("memory-pipeline: addBlueprint erro", err);
            return { ok: false, error: String(err) };
        }
    },

    async setLastAction(action) {
        try {
            const mem = await this.read();
            mem.ultimaAcao = {
                timestamp: Date.now(),
                action: deepClone(action)
            };
            return await this.save(mem);
        } catch (err) {
            logger.error("memory-pipeline: setLastAction erro", err);
            return { ok: false, error: String(err) };
        }
    },

    async getLastAction() {
        try {
            const mem = await this.read();
            return deepClone(mem.ultimaAcao) || null;
        } catch (err) {
            logger.error("memory-pipeline: getLastAction erro", err);
            return null;
        }
    },

    async addTask(task) {
        if (!task || typeof task !== "object") return { ok: false, error: "invalid task" };
        try {
            const mem = await this.read();
            mem.tarefas = mem.tarefas || [];
            mem.tarefas.push(Object.assign({ timestamp: Date.now() }, deepClone(task)));
            if (mem.tarefas.length > MAX_TASKS) mem.tarefas = mem.tarefas.slice(-MAX_TASKS);
            return await this.save(mem);
        } catch (err) {
            logger.error("memory-pipeline: addTask erro", err);
            return { ok: false, error: String(err) };
        }
    },

    async getTasks() {
        try {
            const mem = await this.read();
            return deepClone(mem.tarefas || []);
        } catch (err) {
            logger.error("memory-pipeline: getTasks erro", err);
            return [];
        }
    },

    // utilitário para administração
    async dump() {
        try {
            const mem = await this.read();
            return { ok: true, data: mem };
        } catch (err) {
            return { ok: false, error: String(err) };
        }
    }

};

// inicia automaticamente (não-bloqueante)
module.exports.init().catch(err => logger.error("memory-pipeline: init failed", err));
