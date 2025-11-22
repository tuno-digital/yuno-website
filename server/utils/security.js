
// ===================================================
// SECURITY UTILS — YUNO IA 10.3
// Proteções básicas contra abuso
// ===================================================

const rateLimitMap = new Map();

module.exports = {
    sanitize(text) {
        if (!text) return "";
        return text.replace(/[<>$]/g, "");
    },

    rateLimit(ip, limit = 20, windowMs = 60000) {
        const current = rateLimitMap.get(ip) || { count: 0, last: Date.now() };

        if (Date.now() - current.last > windowMs) {
            current.count = 0;
            current.last = Date.now();
        }

        current.count++;
        rateLimitMap.set(ip, current);

        return current.count <= limit;
    }
};
