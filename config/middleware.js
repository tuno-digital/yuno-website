// ========================================================
// MIDDLEWARE — YUNO IA 10.3
// Logs, rate limit, proteção e validações
// ========================================================

import rateLimit from "express-rate-limit";
import { CONSTANTS } from "./constants.js";

export const Middleware = {
    
    requestLogger(req, res, next) {
        console.log(`[REQ] ${req.method} ${req.url}`);
        next();
    },

    limiter: rateLimit({
        windowMs: CONSTANTS.RATE_LIMIT.windowMs,
        max: CONSTANTS.RATE_LIMIT.max,
        message: {
            erro: "Muitas requisições. Aguarda um pouco."
        }
    })
};
