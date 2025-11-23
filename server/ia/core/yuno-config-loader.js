// ===============================================================
// ⚙️ YUNO CONFIG LOADER — v10.3
// Carrega configurações internas da IA (JSON)
// ===============================================================

const fs = require("fs");
const path = require("path");
const logger = require("../../utils/logger");

const CONFIG_PATH = path.join(__dirname, "yuno-config.json");

let YUNO_CONFIG = {};

try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf8");
    YUNO_CONFIG = JSON.parse(raw);
    logger.success("YUNO CONFIG carregado com sucesso.");
} catch (e) {
    logger.error("Erro ao carregar yuno-config.json");
    YUNO_CONFIG = {};
}

module.exports = { YUNO_CONFIG };
