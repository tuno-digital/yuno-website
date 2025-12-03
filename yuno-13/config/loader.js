// ===========================================================
// YUNO 13.0 — CONFIG LOADER (VERSÃO FINAL CORRIGIDA)
// Caminhos perfeitos • Sem duplicações • Sem erros de root
// ===========================================================

const fs = require("fs");
const path = require("path");
const logger = require("../server/core/logger");

// -----------------------------------------------------------
// PATHS CORRETOS
// loader.js está em: /yuno-13/config
// __dirname = .../yuno-13/config
// -----------------------------------------------------------
const CONFIG_ROOT = __dirname;                       // pasta atual
const PROJECT_ROOT = path.resolve(__dirname, "..");  // /yuno-13

// -----------------------------------------------------------
// Aviso importante: detectar se existe ".Env" (maiúsculo)
// Isto ajuda a evitar erro de dotenv não carregar
// -----------------------------------------------------------
const wrongEnv = path.join(PROJECT_ROOT, ".Env");
if (fs.existsSync(wrongEnv)) {
    logger.warn("⚠️ Ficheiro .Env encontrado — dotenv NÃO carrega este nome. Renomeia para .env");
}

// -----------------------------------------------------------
// Função segura para ler JSON
// -----------------------------------------------------------
function loadJSON(file, fallback = {}) {
    try {
        const raw = fs.readFileSync(file, "utf8");
        return JSON.parse(raw);
    } catch (err) {
        logger.error(`Erro ao carregar ${file}`, err);
        return fallback;
    }
}

// -----------------------------------------------------------
// Carregar ficheiros reais dentro de /config
// -----------------------------------------------------------
const CONFIG_FILE = path.join(CONFIG_ROOT, "config.json");
const ENV_FILE = path.join(CONFIG_ROOT, "environment.json");

const configBase = loadJSON(CONFIG_FILE, {});
const envConfig = loadJSON(ENV_FILE, {});

// -----------------------------------------------------------
// API KEY vinda exclusivamente do .env
// (NÃO EXPOSTA diretamente no objeto final)
// -----------------------------------------------------------
const ENV_API_KEY =
    process.env.YUNO_API_KEY ||
    process.env.OPENAI_API_KEY ||
    null;

// Logs seguros (sem mostrar chave real)
if (!ENV_API_KEY) {
    logger.warn("⚠️ Nenhuma API-KEY encontrada no .env");
} else {
    logger.info("API-KEY carregada com sucesso (oculta)");
}

// -----------------------------------------------------------
// Config final unificada
// -----------------------------------------------------------
const finalConfig = {
    ...configBase,

    environment: envConfig.environment || "development",
    debug: envConfig.debug ?? true,

    // 🔒 Chave nunca exposta diretamente
    getApiKey() {
        return ENV_API_KEY;
    },

    mode: envConfig.mode || { safe: true, autoExecute: false },

    loggingLevel: envConfig.loggingLevel || "info",

    paths: {
        project: PROJECT_ROOT,       // /yuno-13
        config: CONFIG_ROOT          // /yuno-13/config
    }
};

module.exports = finalConfig;
