// ===========================================================
// YUNO 13.0 — SISTEMA DE PERMISSÕES / GOVERNANÇA (BLINDADO)
// ===========================================================

const logger = require("../core/logger");
const audit = require("./audit-log");

// Roles permitidas globalmente
const VALID_ROLES = ["admin", "dev", "deployer", "user", "system"];

// ===========================================================
// VALIDAR ROLE
// ===========================================================
function isValidRole(role) {
    return typeof role === "string" && VALID_ROLES.includes(role);
}

// ===========================================================
// ORDEM DE CONFIANÇA DE ROLE
// 1) req.user.role — vindo do AUTH ENGINE (fonte segura)
// 2) JAMAIS confiar automaticamente em header externo
// ===========================================================
function getRole(req) {
    try {
        // 1) ROLE segura vinda do AUTH ENGINE
        if (req.user && req.user.__verified === true && isValidRole(req.user.role)) {
            return req.user.role;
        }

        // 2) Header só é permitido se request for interna (trusted)
        const headerRole = req.headers["x-yuno-role"];

        if (headerRole) {
            const headerValue = Array.isArray(headerRole) ? headerRole[0] : String(headerRole).trim();

            // Reject qualquer role inválida
            if (!isValidRole(headerValue)) {
                audit.writeAudit("ROLE_HEADER_INVALID", {
                    ip: req.ip,
                    value: headerValue
                });

                return "anonymous";
            }

            // Só aceitar header se request for interna
            if (req.internalRequest === true) {
                return headerValue;
            }

            audit.writeAudit("ROLE_HEADER_REJECTED", {
                ip: req.ip,
                value: headerValue
            });

            return "anonymous";
        }

        // 3) Se não houver user autenticado → anonymous
        return "anonymous";

    } catch (err) {
        logger.error("permissions.getRole error", err);
        return "anonymous";
    }
}

// ===========================================================
// MIDDLEWARE — ADMIN / SYSTEM
// ===========================================================
function requireAdmin(req, res, next) {
    const role = getRole(req);

    if (role !== "admin" && role !== "system") {
        audit.writeAudit("ACCESS_DENIED_ADMIN", {
            role,
            ip: req.ip,
            route: req.originalUrl
        });

        return res.status(403).json({
            ok: false,
            error: "Permissão insuficiente."
        });
    }

    next();
}

// ===========================================================
// MIDDLEWARE — ROLE ESPECÍFICA
// ===========================================================
function requireRole(required) {
    return function (req, res, next) {
        const role = getRole(req);

        // Role inválida ou não autenticado
        if (!isValidRole(role) || role === "anonymous") {
            return res.status(403).json({
                ok: false,
                error: "Acesso não autorizado."
            });
        }

        if (role !== required) {
            audit.writeAudit("ACCESS_DENIED_ROLE", {
                role,
                required,
                ip: req.ip,
                route: req.originalUrl
            });

            return res.status(403).json({
                ok: false,
                error: "Permissão insuficiente."
            });
        }

        next();
    };
}

// ===========================================================
// MIDDLEWARE — QUALQUER ROLE PERMITIDA
// ===========================================================
function requireAnyRole(allowed = []) {
    return function (req, res, next) {
        const role = getRole(req);

        if (!allowed.includes(role)) {
            audit.writeAudit("ACCESS_DENIED_ANYROLE", {
                role,
                allowed,
                ip: req.ip,
                route: req.originalUrl
            });

            return res.status(403).json({
                ok: false,
                error: "Ação não permitida."
            });
        }

        next();
    };
}

// ===========================================================
// INTERNAL GUARD (USO INTERNO, NÃO É MIDDLEWARE)
// ===========================================================
function internalGuard(required = "system") {
    return function (role) {
        return role === required;
    };
}

// ===========================================================
// EXPORTAÇÃO
// ===========================================================
module.exports = {
    VALID_ROLES,
    getRole,
    requireAdmin,
    requireRole,
    requireAnyRole,
    internalGuard
};
