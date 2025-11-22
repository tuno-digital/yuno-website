// ========================================================
// CONFIG GLOBAL — YUNO IA 10.3 HÍBRIDA
// Auto-load do .env + fallback + segurança
// ========================================================

import dotenv from "dotenv";
dotenv.config();

import { validateEnv } from "./env.js";

validateEnv(); // garante .env carregado antes de exportar config

export const CONFIG = {

    // 🔐 CHAVES DE API
    heygen: process.env.HEYGEN_API_KEY || null,
    pika: process.env.PIKA_API_KEY || null,
    runway: process.env.RUNWAY_API_KEY || null,
    aiKey: process.env.YUNO_AI_KEY || null,

    // ⚙️ SERVIDOR
    port: Number(process.env.PORT) || 3001,
    env: process.env.NODE_ENV || "development",

    // 🌐 SITE / PWA
    siteUrl: process.env.SITE_URL || "https://yunosite.com",
    serviceWorker: process.env.SERVICE_WORKER || "/service-worker.js",

    // 🧠 SISTEMA YUNO INTERNO
    debug: process.env.YUNO_DEBUG === "true",
    version: process.env.YUNO_VERSION || "10.3",
    internalToken: process.env.YUNO_INTERNAL_TOKEN || "yuno_internal_dev",

    // ⚡ AUTOMAÇÕES
    apiUrl: process.env.YUNO_API_URL || "https://api.yunosite.com",
    automationsEnabled: process.env.YUNO_AUTOMATIONS_ENABLED === "true"
};
