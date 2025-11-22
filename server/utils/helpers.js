// ===================================================
// HELPERS — Funções gerais YUNO IA 10.3
// ===================================================

module.exports = {
    delay(ms) {
        return new Promise(res => setTimeout(res, ms));
    },

    randomId(size = 12) {
        return Math.random().toString(36).substring(2, 2 + size);
    },

    truncate(text, limit = 120) {
        return text.length > limit ? text.substring(0, limit) + "..." : text;
    },

    formatDate(date = new Date()) {
        return new Intl.DateTimeFormat("pt-PT", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }).format(date);
    }
};
