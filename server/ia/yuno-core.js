
// ===========================================================
// YUNO IA — CORE ENGINE (v10.3 HÍBRIDA)
// Núcleo central responsável por: 
// - interpretar comandos
// - gerar respostas
// - acionar automações internas
// - ligar memória + prompts + motores externos
// ===========================================================

const PromptEngine = require("./prompt-engine");
const MemoryEngine = require("./memory-engine");
const CommandsEngine = require("./commands-engine");
const logger = require("../utils/logger");

class YunoCore {

    constructor() {
        this.version = "10.3";
        this.memory = new MemoryEngine();
        this.prompt = new PromptEngine();
        this.commands = new CommandsEngine(this);

        logger.system("YUNO CORE iniciado (v10.3)");
    }

    // =====================================================
    // PROCESSAR TEXTO DO UTILIZADOR
    // =====================================================
    async process(input, userId = null) {
        try {
            const cleaned = String(input || "").trim();
            if (!cleaned) return "⚠️ Nada para processar.";

            // Guardar memória curta
            this.memory.saveShortTerm({
                userId,
                text: cleaned,
                timestamp: Date.now()
            });

            // Detectar comandos internos da YUNO
            const cmdResult = this.commands.check(cleaned);
            if (cmdResult) return cmdResult;

            // Criar prompt optimizado
            const finalPrompt = this.prompt.build(cleaned, this.memory);

            // (no futuro aqui entra a chamada ao modelo local/externo)
            const simulatedResponse = 
                "🤖 *Simulação de resposta IA 10.3 (motor ainda não ativado)*\n" +
                "Prompt otimizado: " + finalPrompt;

            // Guardar memória longa
            this.memory.saveLongTerm({
                userId,
                input: cleaned,
                response: simulatedResponse
            });

            return simulatedResponse;

        } catch (err) {
            logger.error("Erro no YUNO CORE:");
            console.error(err);
            return "❌ Erro interno no núcleo da IA.";
        }
    }
}

module.exports = YunoCore;
