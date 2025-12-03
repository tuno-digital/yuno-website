// ===========================================================
// YUNO 13.0 — MASTER ROUTER (VERSÃO CORRIGIDA E ESTÁVEL)
// ===========================================================

const express = require("express");
const router = express.Router();

// IMPORTS
const permissions = require("./security/permissions");
const audit = require("./security/audit-log");
const rateLimit = require("express-rate-limit");

// ===========================================================
// RATE LIMITS
// ===========================================================
const strictLimit = rateLimit({ windowMs: 60000, max: 30 });
const builderLimit = rateLimit({ windowMs: 60000, max: 10 });
const adminLimit = rateLimit({ windowMs: 60000, max: 5 });

// ===========================================================
// MIDDLEWARE BASE
// ===========================================================

// JSON BODY PARSER (correção essencial)
router.use(express.json());

// AUDITORIA GLOBAL
router.use((req, res, next) => {
    try {
        audit.writeAudit("ROUTE_HIT", {
            route: req.originalUrl,
            method: req.method,
            ip: req.ip,
            reqId: req.requestId || null
        });
    } catch (_) {}

    next();
});

// ⚠️ IMPORTANTE — remover o sanitizador destrutivo
// ❌ NÃO usar sanitize.cleanInput mundialmente
// router.use((req, res, next) => sanitize.cleanInput(req, res, next));
// Ele apagava o req.body e quebrava /api/ia/process

// ===========================================================
// IMPORTAÇÃO DAS ROTAS INDIVIDUAIS
// ===========================================================
const iaRouter = require("./routes/ia");
const builderRouter = require("./routes/builder");
const previewRouter = require("./routes/preview-frame");
const securityRouter = require("./routes/security");
const statusRouter = require("./routes/status");
const governanceRouter = require("./routes/governance");

// ===========================================================
// ROTAS REGISTRADAS
// ===========================================================

// IA — rota mais usada — tem limite suave
router.use("/ia", strictLimit, iaRouter);

// BUILDER — apenas admins/devs
router.use(
    "/builder",
    builderLimit,
    permissions.requireAnyRole(["admin", "dev", "system"]),
    builderRouter
);

// PREVIEW — somente equipa técnica
router.use(
    "/preview",
    permissions.requireAnyRole(["admin", "dev"]),
    previewRouter
);

// SECURITY — apenas system / admin
router.use(
    "/security",
    adminLimit,
    permissions.requireAnyRole(["system", "admin"]),
    securityRouter
);

// STATUS — livre
router.use("/status", statusRouter);

// GOVERNANCE — admins/system
router.use(
    "/governance",
    adminLimit,
    permissions.requireAnyRole(["admin", "system"]),
    governanceRouter
);

// ===========================================================
// EXPORTAR
// ===========================================================
module.exports = router;
