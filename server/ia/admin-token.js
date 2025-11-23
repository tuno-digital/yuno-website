
// ====================================================================
// YUNO IA — ADMIN TOKEN SYSTEM (v10.3 Híbrida)
// Sistema de autenticação segura para o Painel Admin + Backoffice Secreto
// ====================================================================

const crypto = require("crypto");
const logger = require("../utils/logger");

const ADMIN_TOKEN_EXPIRATION = 1000 * 60 * 60 * 12; // 12 horas

// Armazena tokens em memória (ideal para upgrade futuro com banco de dados)
const adminTokens = {};

// ====================================================================
// 🔹 Gera um token de administrador
// ====================================================================
function generateAdminToken(usuario = "admin") {
    const token = crypto.randomBytes(48).toString("hex");

    adminTokens[token] = {
        usuario,
        criado_em: Date.now(),
        expira_em: Date.now() + ADMIN_TOKEN_EXPIRATION,
        ativo: true
    };

    logger.system(`🔑 Token ADMIN criado para: ${usuario}`);

    return token;
}

// ====================================================================
// 🔹 Verifica se token é válido e não expirou
// ====================================================================
function validateAdminToken(token) {
    if (!token || !adminTokens[token]) return false;

    const data = adminTokens[token];

    if (!data.ativo) {
        logger.warn("Token admin encontrado mas está revogado.");
        return false;
    }

    if (Date.now() > data.expira_em) {
        logger.warn("Token admin expirado. Revogando automaticamente.");
        data.ativo = false;
        return false;
    }

    return true;
}

// ====================================================================
// 🔹 Revoga token manualmente
// ====================================================================
function revokeAdminToken(token) {
    if (adminTokens[token]) {
        adminTokens[token].ativo = false;
        logger.warn("🔐 Token admin revogado manualmente.");
    }
}

// ====================================================================
// 🔹 Middleware para proteger rotas admin
// ====================================================================
function adminProtector(req, res, next) {
    const token = req.headers["yuno-admin-token"];

    if (!validateAdminToken(token)) {
        return res.status(403).json({
            erro: true,
            message: "Acesso ao admin proibido."
        });
    }

    next();
}

// ====================================================================
// 🔹 Renova automaticamente token prestes a expirar
// ====================================================================
function autoRenewToken(token) {
    const data = adminTokens[token];
    if (!data) return null;

    const tempoRestante = data.expira_em - Date.now();

    // Se faltar menos de 3 horas, renova
    if (tempoRestante < 1000 * 60 * 60 * 3) {
        logger.info("Token admin prestes a expirar — renovado automaticamente.");

        const newToken = generateAdminToken(data.usuario);

        // Revoga o antigo
        revokeAdminToken(token);

        return newToken;
    }

    return token;
}

// ====================================================================
module.exports = {
    generateAdminToken,
    validateAdminToken,
    revokeAdminToken,
    adminProtector,
    autoRenewToken
};
