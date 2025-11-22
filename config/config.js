// ================================================
// CONFIG GLOBAL YUNO 10.3 — Auto-carregamento .env
// ================================================

import dotenv from "dotenv";
dotenv.config();

export const CONFIG = {
    
    // 🔐 API KEYS
    heygen: process.env.HEYGEN_API_KEY,
    pika: process.env.PIKA_API_KEY,
    runway: process.env.RUNWAY_API_KEY,
    aiKey: process.env.YUNO_AI_KEY,

    // ⚙️ SERVIDOR
    port: process.env.PORT || 3001,
    env: process.env.NODE_ENV || "development",

    // 🌐 SITE & PWA
    siteUrl: process.env.SITE_URL,
    serviceWorker: process.env.SERVICE_WORKER,

    // 🧩 SISTEMA INTERNO YUNO
    debug: process.env.YUNO_DEBUG === "true",
    version: process.env.YUNO_VERSION,
    internalToken: process.env.YUNO_INTERNAL_TOKEN,

    // 📡 AUTOMAÇÕES
    apiUrl: process.env.YUNO_API_URL,
    automationsEnabled: process.env.YUNO_AUTOMATIONS_ENABLED === "true"
};
