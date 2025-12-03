// ===========================================================
// YUNO 13.0 — SERVER ENTRYPOINT ULTRA-MAX HARDENED (ATUALIZADO)
// Auditoria aplicada: correções trust-proxy + rate-limit + hardening
// ===========================================================

"use strict";

const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const crypto = require("crypto");

// -------------------------------
// ENV LOAD (FORÇADO E PADRONIZADO)
// -------------------------------
require("dotenv").config({
    path: path.join(__dirname, "../.env")
});

// FAIL-FAST SE FALTAR VARIÁVEIS CRÍTICAS
const REQUIRED_ENV = ["YUNO_API_KEY", "NODE_ENV"];
for (const variable of REQUIRED_ENV) {
    if (!process.env[variable]) {
        console.error(`❌ ERRO: Variável obrigatória faltando: ${variable}`);
        process.exit(1);
    }
}

// -------------------------------
// CORE
// -------------------------------
const logger = require("./core/logger");
const audit = require("./security/audit-log");
const { requireApiKey } = require("./security/auth");
const routes = require("./routes");

const app = express();

// ===========================================================
// TRUST PROXY (Nginx/Cloudflare/K8s) — segura e configurável
// - Nunca definir como `true` sem especificar a lista de proxies.
// - Se não configurado, assume `false` (desenvolvimento local).
// - Permite valores: numeric string (e.g. "1"), 'loopback', 'linklocal', etc.
// ===========================================================
const rawTrustProxy = process.env.TRUST_PROXY; // exemplo: "1" or "loopback" or undefined
let trustProxyValue = false; // safe default for local dev
if (typeof rawTrustProxy !== "undefined") {
    // numeric -> number; "true" -> 1 (safe mapping); other strings pass through
    if (/^[0-9]+$/.test(String(rawTrustProxy).trim())) {
        trustProxyValue = Number(rawTrustProxy);
    } else if (String(rawTrustProxy).toLowerCase() === "true") {
        // map literal true to 1 instead of boolean true to avoid express-rate-limit permissive check
        trustProxyValue = 1;
    } else {
        trustProxyValue = rawTrustProxy;
    }
}
app.set("trust proxy", trustProxyValue);
logger.info(`trust proxy configurado: ${String(trustProxyValue)}`);

// ===========================================================
// REQUEST-ID MID
// ===========================================================
app.use((req, res, next) => {
    try {
        req.id = crypto.randomUUID();
    } catch (e) {
        // fallback for older node versions
        req.id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    }
    res.set("X-Request-ID", req.id);
    next();
});

// ===========================================================
// HELMET + CSP (blindagem)
// ===========================================================
app.use(
    helmet({
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                "default-src": ["'self'"],
                "img-src": ["'self'", "data:"],
                "script-src": ["'self'"],
                "style-src": ["'self'", "'unsafe-inline'"],
                "connect-src": ["'self'"],
                "frame-ancestors": ["'none'"],
                "object-src": ["'none'"]
            }
        },
        referrerPolicy: { policy: "no-referrer" },
        frameguard: { action: "deny" },
        noSniff: true,
        xssFilter: true
    })
);

// ===========================================================
// CORS — SÓ ORIGENS PERMITIDAS
// ===========================================================
app.use(
    cors({
        origin: function (origin, callback) {
            const allowed = [
                "http://localhost:4455",
                "http://127.0.0.1:4455"
                // adicionar frontend oficial aqui
            ];

            if (!origin || allowed.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error("Origem não permitida pelo CORS."));
        }
    })
);

// ===========================================================
// BODY PARSER + PROTEÇÕES
// ===========================================================
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));

// ===========================================================
// RATE LIMIT GLOBAL (SAFE DEFAULTS)
// - Melhor prática: priorizar rate-limit por API key quando disponível
// - keyGenerator dá prioridade ao header x-api-key, senão cai para ip
// ===========================================================
const globalLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 2000,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        const headerKey = (req.headers["x-api-key"] || req.headers["X-API-KEY"] || "").toString().trim();
        if (headerKey) return `apiKey:${headerKey}`;

        // fallback: prefer x-forwarded-for first if trust proxy is set to a numeric or string
        const xff = req.headers["x-forwarded-for"] || req.headers["X-Forwarded-For"];
        if (xff && typeof xff === "string") {
            return `ip:${xff.split(",")[0].trim()}`;
        }

        return `ip:${req.ip}`;
    },
    handler: function (req, res) {
        logger.warn("RATE-LIMIT TRIGGERED", { ip: req.ip, reqId: req.id });
        res.status(429).json({
            ok: false,
            error: "Limite de requisições excedido.",
            requestId: req.id
        });
    }
});

// Apply global limiter to /api only (keeps static and health endpoints free from heavy limiting)
app.use('/api', globalLimiter);

// ===========================================================
// LOG DE REQ (SANITIZADO SEM QUERY/PAYLOAD)
// ===========================================================
app.use((req, res, next) => {
    logger.info("REQ", {
        method: req.method,
        url: req.path,
        ip: req.ip,
        reqId: req.id
    });
    next();
});

// ===========================================================
// HEALTH / READY ENDPOINTS (Oros óbvio / K8s)
// ===========================================================
app.get("/healthz", (req, res) =>
    res.status(200).json({ ok: true, status: "healthy", timestamp: Date.now() })
);

app.get("/readyz", (req, res) =>
    res.status(200).json({ ok: true, status: "ready", timestamp: Date.now() })
);

// ===========================================================
// STATIC FILES (PÚBLICO SEGURO)
// ===========================================================
app.use(
    express.static(path.join(__dirname, "../public"), {
        maxAge: "7d",
        index: false
    })
);

// ===========================================================
// AUTENTICAÇÃO: API-KEY OBRIGATÓRIA
// - requireApiKey deve validar x-api-key e deixar as rotas seguras
// ===========================================================
app.use("/api", requireApiKey);

// ===========================================================
// ROTAS PRINCIPAIS
// ===========================================================
app.use("/api", routes);

// ===========================================================
// ERRO GLOBAL (CLEAN + SAFE)
// ===========================================================
app.use((err, req, res, next) => {
    try {
        logger.error("ERRO GLOBAL", { err: err && err.message ? err.message : err, reqId: req.id });
        audit.writeAudit("SERVER_ERROR", { reqId: req.id, message: err && err.message ? err.message : String(err) });
    } catch (auditErr) {
        // não deixar a falha de auditoria quebrar a resposta
        logger.error("AUDIT_FAIL", { err: auditErr && auditErr.message ? auditErr.message : auditErr });
    }

    res.status(500).json({
        ok: false,
        error: "Erro interno no servidor.",
        requestId: req.id
    });
});

// ===========================================================
// GRACEFUL SHUTDOWN (SEM CORRUPÇÃO / LOCKS ORFÃOS)
// ===========================================================
function shutdown(signal) {
    console.log(`\n🔻 Recebido ${signal}, encerrando com segurança...`);

    try {
        audit.writeAudit("SERVER_SHUTDOWN", { signal });
    } catch (e) {
        logger.warn("Falha ao gravar audit shutdown", { err: e && e.message ? e.message : e });
    }

    server.close(() => {
        console.log("🛑 Servidor fechado.");
        process.exit(0);
    });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// ===========================================================
// INICIAR SERVIDOR
// ===========================================================
const PORT = process.env.PORT || 4455;
const server = app.listen(PORT, () => {
    logger.info(`🚀 YUNO 13.0 ativo na porta ${PORT}`);
    console.log(`🚀 Servidor YUNO 13.0 ativo na porta ${PORT}`);

    if (process.env.YUNO_API_KEY) {
        console.log("🔑 YUNO_API_KEY carregada");
    }
});
