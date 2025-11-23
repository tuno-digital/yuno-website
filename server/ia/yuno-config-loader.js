// ============================================================
// YUNO IA — CONFIG LOADER 10.3 (ESM)
// ============================================================

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import logger from "../utils/logger.js";

// Corrigir __dirname (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATH = path.join(__dirname, "config", "yuno-config.json");

export function loadConfig() {
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

export default loadConfig();
