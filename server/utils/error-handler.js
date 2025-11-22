
// ===================================================
// HANDLER GLOBAL DE ERROS — YUNO IA 10.3
// ===================================================
const logger = require("./logger");

module.exports = function errorHandler(err, req, res, next) {
    logger.error(`Erro capturado: ${err.message}`);

    return res.status(err.status || 500).json({
        sucesso: false,
        erro: err.message || "Erro interno do servidor."
    });
};
