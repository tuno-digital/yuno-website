
// ===================================================
// LOG DE REQUISIÇÕES — YUNO IA 10.3
// ===================================================
const logger = require("./logger");

module.exports = function requestLogger(req, res, next) {
    logger.info(`${req.method} ${req.url} — IP: ${req.ip}`);
    next();
};
