// ======================================================================
// ⚙️ YUNO COMMAND ENGINE — v10.3 Híbrida
// Sistema responsável por executar comandos internos da IA
// ======================================================================

const logger = require("../../utils/logger");

// Lista de comandos internos padrão
const COMMANDS = {
    "saudar": {
        descricao: "Yuno envia uma saudação",
        exec: async (input) => {
            return "Olá! 👋 Sou a Yuno IA, como posso ajudar?";
        }
    },

    "hora": {
        descricao: "Retorna a hora atual",
        exec: async () => {
            return `Agora são ${new Date().toLocaleTimeString("pt-PT")}.`;
        }
    },

    "limpar_memoria": {
        descricao: "Limpa memórias antigas",
        exec: async (_, ctx) => {
            ctx.memory.cleanup();
            return "🧹 Memória temporária limpa.";
        }
    },

    "estado": {
        descricao: "Retorna o estado da Yuno",
        exec: async () => {
            return {
                status: "online",
                version: "10.3",
                engine: "command-engine"
            };
        }
    }
};

// ======================================================================
// 🧠 Função principal: processCommand
// Recebe input da Yuno-Core e decide o que fazer
// ======================================================================
async function processCommand(texto, context = {}) {
    try {
        if (!texto || typeof texto !== "string") {
            return "Comando inválido.";
        }

        const input = texto.trim().toLowerCase();

        logger.info(`Recebido comando: ${input}`);

        // -------------------------------
        // 1️⃣ Verificar comandos internos
        // -------------------------------
        if (COMMANDS[input]) {
            logger.success(`Executando comando interno: ${input}`);
            return await COMMANDS[input].exec(texto, context);
        }

        // -------------------------------
        // 2️⃣ Comandos começados por "/"
        // -------------------------------
        if (input.startsWith("/")) {
            const cmd = input.replace("/", "");

            if (COMMANDS[cmd]) {
                logger.success(`Executando comando barra: /${cmd}`);
                return await COMMANDS[cmd].exec(texto, context);
            }

            return `❌ Comando /${cmd} não reconhecido.`;
        }

        // ----------------------------------------
        // 3️⃣ Caso não seja comando → resposta IA
        // ----------------------------------------
        logger.info("Sem comando correspondente → enviar para YUNO CORE");

        if (context.yunoCore) {
            return await context.yunoCore.generate(texto);
        }

        return "⚠️ Yuno-Core não está carregado.";

    } catch (err) {
        logger.error("Erro no command-engine: " + err);
        return "⚠️ Ocorreu um erro ao processar comando.";
    }
}

// ======================================================================
// EXPORTS
// ======================================================================
module.exports = {
    processCommand,
    COMMANDS
};
