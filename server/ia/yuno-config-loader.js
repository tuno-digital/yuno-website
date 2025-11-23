// ============================================================
// YUNO IA — CONFIG LOADER 10.3 (ESM VERSION)
// Carrega configurações internas da IA
// ============================================================

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import logger from "../utils/logger.js";

// Corrigir __dirname no ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho para o ficheiro de configuração
const CONFIG_PATH = path.join(__dirname, "yuno-config.json");

// ============================================================
// Função principal
// ============================================================
export default function loadConfig() {
    try {
        const raw = fs.readFileSync(CONFIG_PATH, "utf8");
        const json = JSON.parse(raw);

        logger.success("✔ Config interna carregada");
        return json;

    } catch (err) {
        logger.error("❌ Erro ao carregar yuno-config.json:");
        logger.error(err);

        return {
            ai: {
                model: "gpt-5.1",
                endpoint: "https://api.openai.com/v1/chat/completions",
                temperature: 0.6,
                maxTokens: 300,
                systemPrompt: "Tu és a Yuno IA 10.3."
            }
        };
    }
}
