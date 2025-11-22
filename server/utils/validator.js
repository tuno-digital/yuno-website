
// =====================================================
// YUNO IA — VALIDATOR ENGINE (v10.3)
// Validação de inputs, sanitização e regras internas
// =====================================================

const validator = {};

// =====================================================
// 🧼 Sanitizar Strings (remove caracteres perigosos)
// =====================================================
validator.sanitize = function (str = "") {
    if (typeof str !== "string") return "";
    return str
        .replace(/<script.*?>.*?<\/script>/gi, "") // remove scripts
        .replace(/[<>]/g, "")                     // remove tags HTML simples
        .replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, c => {
            // escape básico
            const map = {
                "\0": "",
                "\x08": "",
                "\x09": "",
                "\x1a": "",
                "\n": " ",
                "\r": " ",
                "\"": "",
                "'": "",
                "\\": "",
                "%": ""
            };
            return map[c] || "";
        })
        .trim();
};

// =====================================================
// 🔤 Validar texto mínimo/máximo
// =====================================================
validator.validateLength = function (str, min = 1, max = 5000) {
    if (typeof str !== "string") return false;
    const s = str.trim();
    return s.length >= min && s.length <= max;
};

// =====================================================
// 🔗 Validar URL
// =====================================================
validator.isURL = function (url = "") {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

// =====================================================
// 📧 Validar email
// =====================================================
validator.isEmail = function (email = "") {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email.trim());
};

// =====================================================
// 🔑 Validar engines de vídeo
// =====================================================
validator.isValidEngine = function (engine) {
    const allowed = ["heygen", "pika", "runway"];
    return allowed.includes(engine);
};

// =====================================================
// 💬 Validar prompt
// =====================================================
validator.validatePrompt = function (prompt) {
    if (!prompt) return false;
    if (typeof prompt !== "string") return false;

    const clean = prompt.trim();
    if (clean.length < 3) return false;
    if (clean.length > 2000) return false;

    return true;
};

// =====================================================
// 📦 Validar JSON seguro
// =====================================================
validator.safeJSON = function (data) {
    try {
        return JSON.parse(data);
    } catch {
        return null;
    }
};

// =====================================================
// 🔒 Validar Key (ex: API interna)
// =====================================================
validator.hasKey = function (req, header = "x-yuno-key") {
    const key = req.headers[header];
    return key && typeof key === "string" && key.length > 5;
};

// =====================================================
// 🧪 Validar números
// =====================================================
validator.isNumber = function (value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
};

// =====================================================
// 🔥 Exportar
// =====================================================
module.exports = validator;
