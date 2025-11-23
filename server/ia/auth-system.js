
// ===============================================================
// YUNO IA — AUTH SYSTEM (v10.3 Híbrida)
// Autorização interna da IA, tokens internos, permissões e segurança
// ===============================================================

const crypto = require("crypto");
const logger = require("../utils/logger");

// Memória interna de tokens e permissões
const internalTokens = {};
const internalPermissions = {
    "CORE_EXEC": ["admin", "system"],
    "MEMORY_WRITE": ["admin", "system"],
    "MEMORY_READ": ["admin", "system", "yuno"],
    "RUN_AUTOMATION": ["admin", "system", "automation"],
    "ADMIN_ONLY": ["admin"]
};

module.exports = {
    // ===============================================================
    // 🔹 Gera token interno da IA
    // ===============================================================
    generateInternalToken(tipo = "system") {
        const token = crypto.randomBytes(48).toString("hex");

        internalTokens[token] = {
            tipo,
            criado_em: Date.now(),
            ativo: true
        };

        logger.system(`Token interno criado: ${tipo}`);

        return token;
    },

    // ===============================================================
    // 🔹 Valida se token existe e está ativo
    // ===============================================================
    validateToken(token) {
        if (!token) return false;

        const data = internalTokens[token];
        if (!data || !data.ativo) return false;

        return true;
    },

    // ===============================================================
    // 🔹 Remove um token interno (revogação)
    // ===============================================================
    revokeToken(token) {
        if (internalTokens[token]) {
            internalTokens[token].ativo = false;
            logger.warn("Token interno revogado.");
        }
    },

    // ===============================================================
    // 🔹 Verifica permissão interna (IA -> Módulos)
    // ===============================================================
    hasPermission(token, acao) {
        if (!internalTokens[token]) return false;

        const tipo = internalTokens[token].tipo;
        const permitido = internalPermissions[acao];

        if (!permitido) return false;

        return permitido.includes(tipo);
    },

    // ===============================================================
    // 🔹 Middleware interno para proteger módulos da IA
    // ===============================================================
    protector(acao) {
        return (req, res, next) => {
            const token = req.headers["yuno-internal-token"];

            if (!token || !module.exports.validateToken(token)) {
                return res.status(403).json({
                    erro: true,
                    message: "Acesso interno negado."
                });
            }

            if (!module.exports.hasPermission(token, acao)) {
                return res.status(403).json({
                    erro: true,
                    message: "Permissão insuficiente para esta ação."
                });
            }

            next();
        };
    },

    // ===============================================================
    // 🔹 Utilizado pelos módulos internos da IA
    // ===============================================================
    verify(acao, token) {
        return module.exports.validateToken(token) &&
               module.exports.hasPermission(token, acao);
    }
};
