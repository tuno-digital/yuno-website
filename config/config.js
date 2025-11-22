// ========================================================
// CONFIG GLOBAL — YUNO IA 10.3 HÍBRIDA
// Auto-load do .env + validação + fallback
// ========================================================

import dotenv from "dotenv";
dotenv.config();

import { validateEnv } from "./env.js";

validateEnv();

export const CONFIG = {

    // 🔐 CHAVES DE API
    heygen: process.env.HEYGEN_API_KEY || null,
    pika: process.env.PIKA_API_KEY || null,
    runway: process.env.RUNWAY_API_KEY || null,
    aiKey: process.env.YUNO_AI_KEY || null,

    // ⚙️ SERVIDOR
    port: Number(process.env.PORT) || 3001,
    env: process.env.NODE_ENV || "development",

    // 🌐 SITE & PWA
    siteUrl: process.env.SITE_URL || "https://yuno.example",
    serviceWorker: process.env.SERVICE_WORKER || "/service-worker.js",

    // 🧠 SISTEMA INTERNO
    debug: process.env.YUNO_DEBUG === "true",
    version: process.env.YUNO_VERSION || "10.3",
    internalToken: process.env.YUNO_INTERNAL_TOKEN || "yuno_dev_internal",

    // ⚡ AUTOMAÇÕES
    apiUrl: process.env.YUNO_API_URL || "https://api.yuno.example",
    automationsEnabled: process.env.YUNO_AUTOMATIONS_ENABLED === "true"
};
