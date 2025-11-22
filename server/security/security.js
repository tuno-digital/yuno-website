
// =====================================================
// 🔐 YUNO IA — SECURITY ENGINE (v10.3)
// Proteções internas, validação de requests, anti-abuso
// =====================================================

const crypto = require("crypto");
const logger = require("../utils/logger");

// =========================================
// 🔹 1) KEY VALIDATION — valida API interna
// =========================================
function validateInternalKey(req, res, next) {
    const clientKey = req.headers["x-yuno-key"];
    const serverKey = process.env.YUNO_INTERNAL_KEY;

    if (!serverKey) {
        logger.warn("YUNO_INTERNAL_KEY não configurada no .env");
        return next();
    }

    if (!clientKey || clientKey !== serverKey) {
        logger.warn("Tentativa de acesso sem key interna.");
        return res.status(401).json({ erro: "Acesso não autorizado." });
    }

    next();
}

// ======================================================
// 🔹 2) RATE LIMIT (Simples, interno, leve)
// ======================================================
const RATE_LIMIT = {};
const WINDOW = 10 * 1000; // 10 segundos
const MAX_REQUESTS = 30;  // por IP

function rateLimiter(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;

    if (!RATE_LIMIT[ip]) {
        RATE_LIMIT[ip] = { count: 1, last: Date.now() };
    } else {
        RATE_LIMIT[ip].count++;
    }

    // reset da janela
    if (Date.now() - RATE_LIMIT[ip].last > WINDOW) {
        RATE_LIMIT[ip].count = 1;
        RATE_LIMIT[ip].last = Date.now();
    }

    if (RATE_LIMIT[ip].count > MAX_REQUESTS) {
        logger.warn(`Rate limit excedido pelo IP ${ip}`);
        return res.status(429).json({
            erro: "Muitas requisições. Tente novamente em instantes."
        });
    }

    next();
}

// ======================================================
// 🔹 3) SIGNATURE VALIDATION — garante integridade
// ======================================================
function validateSignature(req, res, next) {
    const payload = JSON.stringify(req.body || {});
    const signature = req.headers["x-yuno-signature"];
    const secret = process.env.YUNO_SIGNATURE_SECRET;

    if (!secret) return next(); // assinatura desativada

    const expected = crypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest("hex");

    if (signature !== expected) {
        logger.error("Assinatura inválida detectada.");
        return res.status(403).json({ erro: "Assinatura inválida." });
    }

    next();
}

// ======================================================
// 🔹 4) ANTI BOT / ANTI AUTOMATION
// ======================================================
function antiBot(req, res, next) {
    const userAgent = req.headers["user-agent"] || "";

    const botList = [
        "curl",
        "python",
        "wget",
        "bot",
        "crawler",
        "spider",
        "scan",
        "scraper"
    ];

    const isBot = botList.some(b => userAgent.toLowerCase().includes(b));

    if (isBot) {
        logger.warn("Request bloqueado por suspeita de BOT.");
        return res.status(403).json({ erro: "Acesso negado." });
    }

    next();
}

// ======================================================
// 🔹 5) EXPORTA TUDO COMO MIDDLEWARE
// ======================================================
module.exports = {
    validateInternalKey,
    rateLimiter,
    validateSignature,
    antiBot
};
