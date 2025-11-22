
// =====================================================
// YUNO IA — LOGGER OFICIAL (v10.3)
// Logs avançados com timestamp, cores e níveis
// =====================================================

const COLORS = {
    reset: "\x1b[0m",
    cyan: "\x1b[36m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    magenta: "\x1b[35m",
    gray: "\x1b[90m"
};

const timestamp = () => {
    return new Date().toISOString().replace("T", " ").split(".")[0];
};

const logFormat = (color, label, message) => {
    console.log(
        `${COLORS.gray}[${timestamp()}]${COLORS.reset} ` +
        `${color}[${label}]${COLORS.reset} ${message}`
    );
};

module.exports = {
    info(message) {
        logFormat(COLORS.cyan, "INFO", message);
    },

    success(message) {
        logFormat(COLORS.green, "SUCCESS", message);
    },

    warn(message) {
        logFormat(COLORS.yellow, "WARN", message);
    },

    error(message) {
        logFormat(COLORS.red, "ERROR", message);
    },

    system(message) {
        logFormat(COLORS.magenta, "SYSTEM", message);
    }
};
