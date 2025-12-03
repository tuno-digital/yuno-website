// ===========================================================
// YUNO 13.1 — SANITIZER ULTRA-BLINDADO (VERSÃO FINAL)
// ===========================================================

const logger = require("../core/logger");
const audit = require("./audit-log");
const path = require("path");

// Limites reforçados
const MAX_PAYLOAD_CHARS = 200_000;
const MAX_STRING_LENGTH = 50_000;
const MAX_DEPTH = 12;

// ===========================================================
// Padrões perigosos — versão estável final
// ===========================================================
const DANGEROUS_PATTERNS = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /\son\w+\s*=\s*(['"`]).*?\1/gi,
  /javascript:/gi,
  /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
  /<object[\s\S]*?>[\s\S]*?<\/object>/gi,
  /\u0000/g,
  /&#x0+;/gi,
  /process\.[a-zA-Z]+/gi,
  /require\(/gi,
  /eval\(/gi,
  /new Function\(/gi,
  /document\.[a-zA-Z]+/gi,
  /window\.[a-zA-Z]+/gi
];

// ===========================================================
// sanitizeString — versão blindada
// ===========================================================
function sanitizeString(input) {
  if (typeof input !== "string") return input;

  if (input.length > MAX_STRING_LENGTH) {
    input = input.slice(0, MAX_STRING_LENGTH);
  }

  let safe = input;

  safe = safe.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
  safe = safe.replace(/\son\w+\s*=\s*(['"`]).*?\1/gi, "");
  safe = safe.replace(/javascript:/gi, "");
  safe = safe.replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "");
  safe = safe.replace(/<object[\s\S]*?>[\s\S]*?<\/object>/gi, "");
  safe = safe.replace(/\u0000/g, "");
  safe = safe.replace(/&#x0+;/gi, "");

  // Escape HTML residual
  safe = safe.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Padrões finais
  for (const re of DANGEROUS_PATTERNS) {
    safe = safe.replace(re, "");
  }

  return safe.trim();
}

// ===========================================================
// sanitizeFilename — seguro
// ===========================================================
function sanitizeFilename(filename) {
  if (typeof filename !== "string") return filename;

  let base = path.basename(filename).normalize("NFKC");

  if (/\.(js|mjs|cjs|ts|php|sh|bat|exe|dll)$/i.test(base)) {
    base = base.replace(/\.[^.]+$/, ".txt");
  }

  base = base.replace(/[^a-zA-Z0-9\-_.]/g, "_");

  if (base.length > 255) base = base.slice(0, 255);

  return base;
}

// ===========================================================
// sanitizeObject — com ciclo detection e rejeição segura
// ===========================================================
const BLOCKED_KEYS = ["__proto__", "prototype", "constructor"];

function sanitizeObject(obj, depth = 0, ctx = {}, seen = new WeakSet()) {
  if (depth > MAX_DEPTH) {
    audit.writeAudit("SANITIZER_DEPTH_EXCEEDED", ctx);
    return null;
  }

  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "string") return sanitizeString(obj);
  if (typeof obj === "number" || typeof obj === "boolean") return obj;

  if (typeof obj === "function" || typeof obj === "symbol") {
    audit.writeAudit("SANITIZER_UNSUPPORTED_TYPE_REMOVED", ctx);
    return null;
  }

  // Arrays
  if (Array.isArray(obj)) {
    if (seen.has(obj)) {
      audit.writeAudit("SANITIZER_CIRCULAR_ARRAY", ctx);
      return null;
    }
    seen.add(obj);

    return obj.map(v => sanitizeObject(v, depth + 1, ctx, seen));
  }

  // Objects
  if (typeof obj === "object") {
    if (seen.has(obj)) {
      audit.writeAudit("SANITIZER_CIRCULAR_OBJECT", ctx);
      return null;
    }

    seen.add(obj);

    const clean = {};
    const usedKeys = new Set();

    for (const key of Object.keys(obj)) {
      if (BLOCKED_KEYS.includes(key)) {
        audit.writeAudit("BLOCKED_PROTOTYPE_POLLUTION", { ...ctx, key });
        return null;
      }

      const safeKey = String(key).replace(/[^\w\-]/g, "_");

      if (!safeKey) {
        audit.writeAudit("EMPTY_KEY_BLOCKED", { ...ctx, key });
        return null;
      }

      if (usedKeys.has(safeKey)) {
        audit.writeAudit("KEY_COLLISION", { ...ctx, key, safeKey });
        return null;
      }

      usedKeys.add(safeKey);

      const sanitized = sanitizeObject(obj[key], depth + 1, ctx, seen);

      if (sanitized === null && sanitized !== obj[key]) {
        audit.writeAudit("FIELD_REJECTED", { ...ctx, key });
        return null;
      }

      clean[safeKey] = sanitized;
    }

    return clean;
  }

  return null;
}

// ===========================================================
// validateBlueprint — sem stringify assassino
// ===========================================================
function validateBlueprint(bp, ctx) {
  if (!bp) return { ok: false, error: "Blueprint vazio" };

  let approx;
  try {
    approx = JSON.stringify(bp).length;
  } catch {
    audit.writeAudit("BLUEPRINT_INVALID_JSON", ctx);
    return { ok: false, error: "Blueprint inválido" };
  }

  if (approx > MAX_PAYLOAD_CHARS) {
    audit.writeAudit("BLUEPRINT_TOO_LARGE", ctx);
    return { ok: false, error: "Blueprint demasiado grande" };
  }

  // Verificação leve
  const text = JSON.stringify(bp, (_, v) =>
    typeof v === "string" && v.length > 5000 ? v.slice(0, 5000) : v
  );

  for (const re of DANGEROUS_PATTERNS) {
    if (re.test(text)) {
      audit.writeAudit("BLUEPRINT_DANGEROUS", ctx);
      return { ok: false, error: "Blueprint inseguro" };
    }
  }

  return { ok: true };
}

// ===========================================================
// cleanInput — middleware final
// ===========================================================
async function cleanInput(req, res, next) {
  const ctx = {
    ip: req.ip,
    route: req.originalUrl,
    requestId: req.headers["x-request-id"] || null,
    user: req.user?.id || null
  };

  try {
    let approx;
    try {
      approx = JSON.stringify(req.body || {});
    } catch {
      return res.status(400).json({ ok: false, error: "Payload inválido" });
    }

    if (approx.length > MAX_PAYLOAD_CHARS) {
      audit.writeAudit("PAYLOAD_TOO_LARGE", ctx);
      return res.status(413).json({ ok: false, error: "Payload demasiado grande" });
    }

    req.body = sanitizeObject(req.body, 0, ctx);
    if (req.body === null) {
      return res.status(422).json({ ok: false, error: "Payload rejeitado por segurança" });
    }

    req.query = sanitizeObject(req.query, 0, ctx);
    req.params = sanitizeObject(req.params, 0, ctx);

    if (req.body?.blueprint) {
      const bp = validateBlueprint(req.body.blueprint, ctx);
      if (!bp.ok) return res.status(422).json({ ok: false, error: bp.error });
    }

    next();
  } catch (err) {
    logger.error("cleanInput erro", err);
    audit.writeAudit("SANITIZER_CRASH", ctx);
    return res.status(500).json({ ok: false, error: "Erro interno no sanitizador" });
  }
}

// ===========================================================
// EXPORTAÇÃO FINAL
// ===========================================================
module.exports = {
  cleanInput,
  sanitizeString,
  sanitizeFilename,
  sanitizeObject,
  validateBlueprint
};
