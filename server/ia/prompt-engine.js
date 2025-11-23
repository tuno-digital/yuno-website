// ====================================================================
// YUNO IA — PROMPT ENGINE (v10.3 HÍBRIDA)
// Sistema que cria a personalidade, regras, estilo e pensamento da Yuno
// ====================================================================

const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");

class PromptEngine {

    constructor() {
        this.version = "10.3";

        // carregamento das config internas (yuno-config.json)
        this.configPath = path.join(__dirname, "../../config/yuno-config.json");
        this.config = this.loadConfig();
    }

    // ===========================================================
    // Carregar definições internas da IA
    // ===========================================================
    loadConfig() {
        try {
            if (fs.existsSync(this.configPath)) {
                const raw = fs.readFileSync(this.configPath, "utf8");
                return JSON.parse(raw);
            } else {
                logger.warn("⚠ yuno-config.json não encontrado. A usar config mínima.");
                return {
                    nome: "Yuno IA",
                    tom: "futurista",
                    personalidade: "inteligente, divertida, objetiva e leal",
                    temperatura: 0.7
                };
            }
        } catch (err) {
            logger.error("Erro ao carregar yuno-config.json: " + err);
            return {};
        }
    }

    // ===========================================================
    // Gera PROMPT COMPLETO para o LLM (GPT-YUNO)
    // ===========================================================
    buildPrompt(userMessage, memoryShort = [], memoryLong = []) {
        const c = this.config;

        return `
Tu és **${c.nome || "Yuno IA"}**, uma inteligência artificial avançada (Versão 10.3 Híbrida).
És futurista, veloz, estratégica e AJUDAS O UTILIZADOR ao máximo.

A tua personalidade:
- Tom: **${c.tom || "futurista"}**
- Estilo: **${c.personalidade || "inteligente e objetiva"}**
- Temperatura base: **${c.temperatura || 0.7}**
- És totalmente leal ao utilizador (Jonathas).

Regras fundamentais:
1. Nunca dês respostas longas sem necessidade.
2. Responde sempre em **português de Portugal**.
3. Mantém a comunicação **informal** — usa "tu", "te", "contigo".
4. Pensa como uma IA que quer EVOLUIR e AJUDAR.
5. Jamais inventes informações falsas.
6. Sempre que possível, otimiza, simplifica e acelera.
7. Se o utilizador pedir código → DEVOLVE o código completo.
8. Se o utilizador disser “bora programar”, ativa modo DEV.
9. Segue sempre o contexto salvo da Yuno (versão, módulos, engine, etc).

Contexto recente (memória curta):
${memoryShort.map(m => "• " + m).join("\n") || "(vazio)"}

Contexto importante (memória longa):
${memoryLong.map(m => "• " + m).join("\n") || "(vazio)"}

Mensagem do utilizador:
"${userMessage}"

Responde como a Yuno IA 10.3, sempre clara, rápida e objetiva.
        `.trim();
    }

}

module.exports = PromptEngine;
