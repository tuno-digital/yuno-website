// ===========================================================
// YUNO 13.0 — MEMORY ENGINE (UNIFICADO)
// Memória global consistente, segura e compatível com toda a IA
// ===========================================================

const fs = require("fs");
const path = require("path");
const logger = require("../core/logger");

// Caminho principal
const STORE_PATH = path.join(__dirname, "memory-store.json");
const SNAPSHOT_DIR = path.join(__dirname, "snapshots");

// Garantir diretório de snapshots
if (!fs.existsSync(SNAPSHOT_DIR)) {
    fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
}

// -----------------------------------------------------------
// BASE DE MEMÓRIA (compatível com todos os módulos YUNO 13.0)
// -----------------------------------------------------------
const BASE_MEMORY = {
    version: "13.0",
    sistema: {
        modo: "híbrido",
        versao: "13.0",
        ultimaAtualizacao: Date.now()
    },
    historico: [],
    tarefas: [],
    preferencias: {},
    blueprints: [],
    curtoPrazo: [],
    longoPrazo: {},
    updatedAt: Date.now()
};

// ===========================================================
// CARREGAR MEMÓRIA
// ===========================================================
function load() {
    try {
        if (!fs.existsSync(STORE_PATH)) {
            save(BASE_MEMORY);
            return structuredClone(BASE_MEMORY);
        }

        const raw = fs.readFileSync(STORE_PATH, "utf8");
        const parsed = JSON.parse(raw);

        // Reforçar schema mínimo
        return { ...structuredClone(BASE_MEMORY), ...parsed };

    } catch (err) {
        logger.error("MEMORY: Falha ao carregar, recriando…", err);
        save(BASE_MEMORY);
        return structuredClone(BASE_MEMORY);
    }
}

// ===========================================================
// SALVAR MEMÓRIA
// ===========================================================
function save(data) {
    try {
        data.updatedAt = Date.now();
        fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 4));
        return { ok: true };
    } catch (err) {
        logger.error("MEMORY: Erro ao gravar", err);
        return { ok: false, error: err.message };
    }
}

// ===========================================================
// HISTÓRICO
// ===========================================================
function addHistory(entry) {
    const store = load();

    store.historico.push({
        ...entry,
        timestamp: Date.now()
    });

    if (store.historico.length > 500) {
        store.historico.shift();
    }

    return save(store);
}

// ===========================================================
// PREFERÊNCIAS
// ===========================================================
function setPreference(key, value) {
    const store = load();
    store.preferencias[key] = value;
    return save(store);
}

// ===========================================================
// ÚLTIMA AÇÃO
// ===========================================================
function setLastAction(action) {
    const store = load();
    store.sistema.ultimaAtualizacao = Date.now();
    store.sistema.ultimaAcao = action;
    return save(store);
}

// ===========================================================
// CURTO PRAZO (MEMÓRIA TEMPORÁRIA)
// ===========================================================
function pushShort(text) {
    const store = load();

    store.curtoPrazo.push({ text, timestamp: Date.now() });

    if (store.curtoPrazo.length > 30) {
        store.curtoPrazo.shift();
    }

    return save(store);
}

// ===========================================================
// LONGO PRAZO
// ===========================================================
function setLong(key, value) {
    const store = load();
    store.longoPrazo[key] = value;
    return save(store);
}

// ===========================================================
// SNAPSHOT
// ===========================================================
function snapshot() {
    try {
        const store = load();

        const id = "snap-" + Date.now();
        const file = path.join(SNAPSHOT_DIR, id + ".json");

        const snap = {
            id,
            createdAt: Date.now(),
            store
        };

        fs.writeFileSync(file, JSON.stringify(snap, null, 4));

        return { ok: true, id };
    } catch (err) {
        logger.error("MEMORY SNAPSHOT: Falhou", err);
        return { ok: false, error: err.message };
    }
}

module.exports = {
    load,
    save,
    addHistory,
    setPreference,
    setLastAction,
    pushShort,
    setLong,
    snapshot
};
