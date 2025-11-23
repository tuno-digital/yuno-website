// =======================================================
// YUNO 10.3 — RATE LIMIT MIDDLEWARE (ESM VERSION)
// =======================================================

export default function rateLimitMiddleware(req, res, next) {
    const ip = req.ip;
    const now = Date.now();

    if (!global.rateLimitStore) {
        global.rateLimitStore = {};
    }

    if (!global.rateLimitStore[ip]) {
        global.rateLimitStore[ip] = [];
    }

    global.rateLimitStore[ip] = global.rateLimitStore[ip].filter(
        t => now - t < 60_000
    );

    if (global.rateLimitStore[ip].length > 60) {
        return res.status(429).json({
            erro: true,
            message: "⚠️ Excesso de pedidos. Tenta de novo em instantes."
        });
    }

    global.rateLimitStore[ip].push(now);

    next();
}
