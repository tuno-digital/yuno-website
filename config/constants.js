
// ========================================================
// CONSTANTES — YUNO IA 10.3
// Valores fixos usados no core da IA e integrações
// ========================================================

export const CONSTANTS = {
    VERSION: "10.3",
    AI_MODEL: "YUNO-CORE-10.3",
    MAX_VIDEO_DURATION: 15,
    ALLOWED_ENGINES: ["heygen", "pika", "runway"],
    RATE_LIMIT: {
        windowMs: 60 * 1000, // 1 minuto
        max: 120
    }
};
