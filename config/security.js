// ========================================================
// SECURITY — YUNO IA 10.3
// Anti-bot, headers, proteções básicas
// ========================================================

import crypto from "crypto";

export const Security = {
    gerarTokenInterno() {
        return crypto.randomBytes(32).toString("hex");
    },

    validarToken(token, referencia) {
        return token && referencia && token === referencia;
    },

    headersSeguros(req, res, next) {
        res.setHeader("X-Frame-Options", "DENY");
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        res.setHeader("X-XSS-Protection", "1; mode=block");
        next();
    }
};
