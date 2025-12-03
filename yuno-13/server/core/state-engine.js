/* ===========================================================
   YUNO 13.0 — STATE ENGINE (VERSÃO CORRIGIDA)
   Estado em RAM + persistência segura + mutex + validações
   - Não faz I/O no require()
   - init() é async e deve ser chamada no arranque da app
   =========================================================== */

const memory = require("./memory-pipeline");
const logger = require("./logger");

// Valores permitidos para o modo (norma)
const ALLOWED_MODES = ["seguro", "híbrido", "avançado"];

// Estado interno (privado)
const _state = {
    modo: "híbrido",
    operacaoAtiva: null,
    bloqueado: false,
    ultimaMensagem: null,
    contexto: {},
    emConstrucao: false,
    emPreview: false,
    versao: "13.0",
    ultimaSincronizacaoTs: null
};

// Mutex simples baseado em cadeia de Promises para proteger read-modify-save
let _mutex = Promise.resolve();
function _withLock(fn) {
    _mutex = _mutex.then(() => fn()).catch(err => {
        // Garantir que erros não partem a cadeia
        logger.error("STATE ENGINE: erro na operação com lock", { erro: err?.message });
    });
    return _mutex;
}

// Helper para chamar memory.* de forma defensiva (sync ou async)
async function _callMemorySafe(fnName, ...args) {
    try {
        if (!memory || typeof memory[fnName] !== "function") {
            return undefined;
        }
        const res = memory[fnName](...args);
        if (res && typeof res.then === "function") {
            return await res;
        }
        return res;
    } catch (err) {
        logger.error("STATE ENGINE: memory." + fnName + " falhou", { fn: fnName, erro: err?.message });
        return undefined;
    }
}

// Deep clone simples (JSON) — suficiente para estado serializável
function _clone(obj) {
    try { return JSON.parse(JSON.stringify(obj)); } catch { return Object.assign({}, obj); }
}

module.exports = {

    // ==========================================================
    // Inicializar estado a partir do memory-store
    // ==========================================================
    // NOTA: não é chamado automaticamente. Chama explicitamente no bootstrap.
    async init() {
        try {
            const mem = await _callMemorySafe("read") || {};

            // Garantir schema mínimo
            if (!mem.sistema || typeof mem.sistema !== "object") {
                mem.sistema = {
                    modo: _state.modo,
                    versao: _state.versao,
                    ultimaAtualizacao: Date.now()
                };

                // Persistir esquema inicial (tenta, mas não falha o init)
                await _callMemorySafe("save", mem);
            }

            // Segurança: só usar campos válidos
            if (mem.sistema.modo && ALLOWED_MODES.includes(mem.sistema.modo)) {
                _state.modo = mem.sistema.modo;
            } else {
                _state.modo = _state.modo; // manter default
            }

            if (mem.sistema.versao && typeof mem.sistema.versao === "string") {
                _state.versao = mem.sistema.versao;
            }

            _state.ultimaSincronizacaoTs = Date.now();

            logger.info("STATE ENGINE: init concluído e sincronizado.", { modo: _state.modo });
            return true;
        } catch (err) {
            logger.error("STATE ENGINE: init falhou", { erro: err?.message });
            return false;
        }
    },

    // ==========================================================
    // Obter snapshot do estado (cópia profunda — imutável para o caller)
    // ==========================================================
    get() {
        return _clone(_state);
    },

    // ==========================================================
    // Mudar modo (persistente, validado) — protegido por mutex
    // ==========================================================
    async setMode(m) {
        if (typeof m !== "string" || !ALLOWED_MODES.includes(m)) {
            return false;
        }

        return _withLock(async () => {
            try {
                _state.modo = m;
                _state.ultimaMensagem = `Modo alterado para ${m}`;
                // Sincronizar no memory-store de forma defensiva
                const mem = await _callMemorySafe("read") || {};
                mem.sistema = mem.sistema && typeof mem.sistema === "object" ? mem.sistema : {};
                mem.sistema.modo = m;
                mem.sistema.versao = _state.versao;
                mem.sistema.ultimaAtualizacao = Date.now();
                await _callMemorySafe("save", mem);
                logger.info("STATE ENGINE: Modo alterado", { modo: m });
                return true;
            } catch (err) {
                logger.error("STATE ENGINE: setMode falhou", { erro: err?.message });
                return false;
            }
        });
    },

    // ==========================================================
    // Iniciar operação (validada e persistida em lastAction)
    // ==========================================================
    async beginOperation(name) {
        if (!_state.bloqueado && typeof name === "string" && name.trim().length > 0) {
            return _withLock(async () => {
                try {
                    _state.operacaoAtiva = name;
                    _state.ultimaMensagem = `Operação '${name}' iniciada.`;
                    await _callMemorySafe("setLastAction", { tipo: "inicio-operacao", name, ts: Date.now() });
                    logger.info("STATE ENGINE: beginOperation", { operacao: name });
                    return true;
                } catch (err) {
                    logger.error("STATE ENGINE: beginOperation falhou", { erro: err?.message, operacao: name });
                    return false;
                }
            });
        }
        return false;
    },

    // ==========================================================
    // Finalizar operação (persistente)
    // ==========================================================
    async endOperation() {
        return _withLock(async () => {
            try {
                const op = _state.operacaoAtiva || null;
                _state.operacaoAtiva = null;
                _state.ultimaMensagem = op ? `Operação '${op}' concluída.` : "Operação concluída.";
                await _callMemorySafe("setLastAction", { tipo: "fim-operacao", op, ts: Date.now() });
                logger.info("STATE ENGINE: endOperation", { operacao: op });
                return true;
            } catch (err) {
                logger.error("STATE ENGINE: endOperation falhou", { erro: err?.message });
                return false;
            }
        });
    },

    // ==========================================================
    // Bloqueios (persistidos para consistência)
    // ==========================================================
    async lock() {
        return _withLock(async () => {
            try {
                _state.bloqueado = true;
                _state.ultimaMensagem = "Sistema bloqueado.";
                const mem = await _callMemorySafe("read") || {};
                mem.sistema = mem.sistema && typeof mem.sistema === "object" ? mem.sistema : {};
                mem.sistema.bloqueado = true;
                await _callMemorySafe("save", mem);
                logger.info("STATE ENGINE: Sistema bloqueado (persistido).");
                return true;
            } catch (err) {
                logger.error("STATE ENGINE: lock falhou", { erro: err?.message });
                return false;
            }
        });
    },

    async unlock() {
        return _withLock(async () => {
            try {
                _state.bloqueado = false;
                _state.ultimaMensagem = "Sistema desbloqueado.";
                const mem = await _callMemorySafe("read") || {};
                mem.sistema = mem.sistema && typeof mem.sistema === "object" ? mem.sistema : {};
                mem.sistema.bloqueado = false;
                await _callMemorySafe("save", mem);
                logger.info("STATE ENGINE: Sistema desbloqueado (persistido).");
                return true;
            } catch (err) {
                logger.error("STATE ENGINE: unlock falhou", { erro: err?.message });
                return false;
            }
        });
    },

    // ==========================================================
    // Flags de construção / preview (validação simples + persistência opcional)
    // ==========================================================
    async setConstruction(flag) {
        const val = !!flag;
        _state.emConstrucao = val;
        _state.ultimaMensagem = `emConstrucao = ${val}`;
        // não persistir por defeito; fornece API se quiseres persistir
        return true;
    },

    async setPreview(flag) {
        const val = !!flag;
        _state.emPreview = val;
        _state.ultimaMensagem = `emPreview = ${val}`;
        return true;
    },

    // ==========================================================
    // Contexto (validação e persistência segura)
    // ==========================================================
    async setContext(data) {
        try {
            // Validar objecto simples e limitar tamanho para evitar DoS
            if (!data || typeof data !== "object") {
                throw new Error("Contexto inválido: object esperado.");
            }

            // Limitar número de chaves e tamanho aproximado
            const keys = Object.keys(data);
            if (keys.length > 200) throw new Error("Contexto demasiado grande.");

            // sanitização leve: só strings, números, booleanos e arrays/objects simples
            const safe = {};
            for (const k of keys) {
                const v = data[k];
                const t = typeof v;
                if (t === "string" || t === "number" || t === "boolean" || t === "object") {
                    safe[k] = v;
                } // ignora funções, símbolos, etc.
            }

            _state.contexto = safe;
            _state.ultimaMensagem = "Contexto atualizado.";
            // Persistir preferência com try/catch
            await _callMemorySafe("setPreference", "contextoAtual", safe);
            return true;
        } catch (err) {
            logger.error("STATE ENGINE: setContext falhou", { erro: err?.message });
            return false;
        }
    },

    getContext() {
        return _clone(_state.contexto);
    },

    // ==========================================================
    // Métodos utilitários
    // ==========================================================
    isBlocked() {
        return !!_state.bloqueado;
    },

    getOperation() {
        return _state.operacaoAtiva || null;
    },

    // Expor async init para bootstrap
    initAsync: async function() { return await this.init(); }
};
