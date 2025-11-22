// ========================================================
// CONSTANTES — YUNO IA 10.3
// Estado, limites, padrões internos
// ========================================================

export const CONSTANTS = {
    VERSION: "10.3",
    AI_MODEL: "YUNO-CORE-10.3",

    RATE_LIMIT: {
        windowMs: 60 * 1000,
        max: 120
    },

    ALLOWED_ENGINES: ["heygen", "pika", "runway"],

    VIDEO: {
        MAX_DURATION: 15,
        DEFAULT_RESOLUTION: "720p"
    },

    SECURITY: {
        MIN_TOKEN_SIZE: 32,
        MAX_LOGIN_ATTEMPTS: 5
    }
};
