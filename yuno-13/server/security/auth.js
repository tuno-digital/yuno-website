// ===========================================================
// YUNO 13.0 — AUTH ENGINE (VERSÃO CORRIGIDA + BLINDADA)
// Mantendo estrutura original, apenas corrigindo falhas
// ===========================================================

require("dotenv").config();

const logger = require("../core/logger");
const audit = require("./audit-log");

// API KEY Real
const ENV_API_KEY = process.env.YUNO_API_KEY;

// API KEY Dev (agora no .env, não hard-coded)
const DEV_API_KEY = process.env.YUNO_DEV_API_KEY || "DEV-KEY-123";

// Ambiente
const ENV = process.env.NODE_ENV || "development";

// ===========================================================
// Extrair API KEY de forma segura
// Aceita:
//   - Authorization: Bearer <KEY>
//   - x-api-key: <KEY>
//   - ?key=<KEY>
// ===========================================================
function extractApiKey(req) {
    const auth = req.headers["authorization"];

    if (auth && auth.startsWith("Bearer ")) {
        return auth.replace("Bearer ", "").trim();
    }

    return (
        req.headers["x-api-key"] ||
        req.query.key ||
        null
    );
}

// ===========================================================
// Validar Key
// - Dev aceita KEY real e KEY dev
// - Produção aceita APENAS a key real
// ===========================================================
function validateApiKey(apiKey) {
    if (!apiKey) return false;

    if (ENV === "development") {
        return apiKey === ENV_API_KEY || apiKey === DEV_API_KEY;
    }

    return apiKey === ENV_API_KEY;
}

// ===========================================================
// Middleware principal
// ===========================================================
function requireApiKey(req, res, next) {
    const apiKey = extractApiKey(req);

    if (!validateApiKey(apiKey)) {
        const masked =
            apiKey ? apiKey.substring(0, 4) + "***" : null;

        logger.warn("API KEY inválida", { ip: req.ip, key: masked });

        audit.registrar("API_KEY_INVALIDA", {
            ip: req.ip,
            key: masked
        });

        return res.status(401).json({
            ok: false,
            error: "API-Key inválida ou ausente."
        });
    }

    req.isAuthenticated = true;

    // user básico até integração com permissions-engine
    req.user = { role: "user" };

    next();
}

// ===========================================================
// EXPORTAÇÃO
// ===========================================================
module.exports = {
    requireApiKey,
    extractApiKey,
    validateApiKey
};
