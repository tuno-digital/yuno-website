// ============================================================
// YUNO IA — CONFIG LOADER 10.3
// Carrega configs internas da Yuno + validações
// ============================================================

const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");

const CONFIG_PATH = path.join(__dirname, "../config/yuno-config.json");

function loadConfig() {
    try {
        const file = fs.readFileSync(CONFIG_PATH, "utf8");
        const json = JSON.parse(file);

        logger.success("Config interna carregada ✔");
        return json;

    } catch (e) {
        logger.error("Erro ao carregar yuno-config.json");
        logger.error(e);
        return null;
    }
}

module.exports = loadConfig();
