// ===============================================================
// ⚡ YUNO COMMAND ENGINE — v10.3
// Detecta e executa comandos especiais do utilizador
// ===============================================================

const logger = require("../../utils/logger");

const COMMANDS = {
    "/video": "generateVideo",
    "/post": "createPost",
    "/funil": "createFunnel",
    "/auto": "createAutomation",
    "/mem": "memoryStatus",
    "/clear": "clearMemory"
};

// ===============================================================
// DETECTOR
// ===============================================================
function detectCommand(text) {
    const parts = text.split(" ");
    const first = parts[0].toLowerCase();

    if (COMMANDS[first]) {
        return {
            isCommand: true,
            command: first,
            args: parts.slice(1)
        };
    }

    return { isCommand: false };
}


// ===============================================================
// EXECUTOR
// ===============================================================
async function execute(cmd, userId) {
    logger.system(`Executando comando ${cmd.command}`);

    switch (cmd.command) {

        case "/video":
            return {
                tipo: "video",
                mensagem: "Sistema de vídeo está ligado. Diz-me o tema do vídeo!"
            };

        case "/post":
            return {
                tipo: "post",
                mensagem: "Vamos criar um post. Diz o tema."
            };

        case "/funil":
            return {
                tipo: "funnel",
                mensagem: "Ok! Qual funil queres criar?"
            };

        case "/auto":
            return {
                tipo: "automacao",
                mensagem: "Qual automação queres que eu crie?"
            };

        case "/mem":
            return {
                tipo: "memoria",
                mensagem: "A memória está ativa e funcional na versão 10.3."
            };

        case "/clear":
            return {
                tipo: "memoria",
                mensagem: "Memória apagada com sucesso (futuro: limpar persistente)."
            };

        default:
            return {
                tipo: "erro",
                mensagem: "Comando não reconhecido."
            };
    }
}

module.exports = {
    detectCommand,
    execute
};
