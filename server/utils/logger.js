
// =============================================================
// YUNO LOGGER v10.3 — Sistema de Logs Bonito e Organizado
// =============================================================

function timestamp() {
    return new Date().toISOString().replace("T", " ").split(".")[0];
}

function color(code, text) {
    return `\x1b[${code}m${text}\x1b[0m`;
}

function log(type, colorCode, msg) {
    console.log(color(colorCode, `[${timestamp()}] [${type}]`), msg);
}

const logger = {
    info(msg) {
        log("INFO", "36", msg); // Ciano
    },

    success(msg) {
        log("SUCCESS", "32", msg); // Verde
    },

    warn(msg) {
        log("WARN", "33", msg); // Amarelo
    },

    error(msg) {
        log("ERROR", "31", msg); // Vermelho
    },

    system(msg) {
        log("SYSTEM", "35", msg); // Magenta
    }
};

export default logger;
