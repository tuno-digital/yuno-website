// ===========================================================
// YUNO 13.0 — GOVERNANCE CONTROLLER (OFICIAL DA VERSÃO 13.0)
// ===========================================================

const logger = require("../core/logger");

// -----------------------------------------------------------
// GET — devolve políticas internas básicas
// -----------------------------------------------------------
exports.getPolicies = (req, res) => {
  try {
    return res.json({
      ok: true,
      governanceVersion: "13.0",
      policies: {
        roles: ["admin", "dev", "system", "deployer", "user"],
        securityLevel: process.env.YUNO_SECURITY_LEVEL || 2,
        builderMode: process.env.YUNO_BUILDER_MODE || 1
      }
    });
  } catch (err) {
    logger.error("governance.getPolicies", err);
    return res.status(500).json({ ok: false, error: "Erro interno" });
  }
};

// -----------------------------------------------------------
// POST — atualização (ainda não implementado na 13.0)
// -----------------------------------------------------------
exports.updatePolicy = (req, res) => {
  return res.status(501).json({
    ok: false,
    error: "updatePolicy não implementado na versão 13.0"
  });
};
