
// ===================================================
// VALIDATE ENV — YUNO IA 10.3
// Confirma que o .env está completo antes do servidor iniciar
// ===================================================
const logger = require("./logger");

module.exports = function validateEnv() {
    const required = [
        "HEYGEN_API_KEY",
        "PIKA_API_KEY",
        "RUNWAY_API_KEY",
        "PORT"
    ];

    let missing = [];

    required.forEach(key => {
        if (!process.env[key]) missing.push(key);
    });

    if (missing.length > 0) {
        logger.error("Variáveis .env em falta:");
        missing.forEach(m => logger.error(` → ${m}`));

        process.exit(1); // impede o servidor de arrancar
    }

    logger.success("Todas as variáveis .env carregadas com sucesso.");
};
