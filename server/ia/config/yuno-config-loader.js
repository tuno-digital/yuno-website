// ==========================================================================
// 📦 YUNO CONFIG LOADER — v10.3 Híbrida
// Carrega e valida as configurações internas da IA
// ==========================================================================

const fs = require("fs");
const path = require("path");
const logger = require("../../utils/logger");

const CONFIG_PATH = path.join(__dirname, "yuno-config.json");

// --------------------------------------------------------------------------
// FUNÇÃO PRINCIPAL
// --------------------------------------------------------------------------
function loadYunoConfig() {
    logger.system("A carregar configurações internas da Yuno...");

    if (!fs.existsSync(CONFIG_PATH)) {
        logger.error("❌ yuno-config.json NÃO ENCONTRADO!");
        throw new Error("Configuração interna ausente.");
    }

    let raw = fs.readFileSync(CONFIG_PATH, "utf8");
    let config = null;

    try {
        config = JSON.parse(raw);
    } catch (err) {
        logger.error("❌ Erro ao ler yuno-config.json (JSON inválido)");
        throw new Error("Erro no ficheiro de config.");
    }

    // ----------------------------------------------------------------------
    // VALIDAÇÕES (v10.3 — ampliado e mais seguro)
    // ----------------------------------------------------------------------
    const required = [
        "version",
        "core",
        "limits",
        "processing",
        "memory",
        "security",
        "behaviour"
    ];

    let missing = required.filter(key => !config[key]);

    if (missing.length > 0) {
        logger.error("❌ Campos obrigatórios ausentes no yuno-config.json:");
        missing.forEach(f => logger.error(" → " + f));
        throw new Error("Configuração incompleta.");
    }

    // ----------------------------------------------------------------------
    // OVERRIDES via .env
    // ----------------------------------------------------------------------
    config.version = process.env.YUNO_VERSION || config.version;
    config.core.model = process.env.YUNO_MODEL || config.core.model;
    config.limits.maxTokens =
        process.env.YUNO_MAX_TOKENS || config.limits.maxTokens;

    logger.success("Configurações internas carregadas com sucesso ✓");

    return config;
}

// --------------------------------------------------------------------------
// EXPORT
// --------------------------------------------------------------------------
module.exports = {
    loadYunoConfig
};
