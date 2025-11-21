// yuno-ia/security.js
// Sistema de segurança interno da YUNO IA — validação, filtros, permissões e anti-abuso

export const YUNO_SECURITY = {

    enabled: true,
    floodLimit: 6,
    floodWindow: 4000,
    recentMessages: [],
    blockedPatterns: [
        "<script", 
        "</script>",
        "onerror=",
        "onload=",
        "javascript:",
        "fetch(",
        "xmlhttprequest",
        "document.cookie",
        "localstorage",
        "sessionstorage",
        "eval(",
        "new Function(",
        "base64",
        "token=",
        "select * from",
        "drop table",
        "{",
        "}"
    ],

    // ==================================================
    // INICIALIZA PROTEÇÕES
    // ==================================================
    init() {
        console.log("%c[YUNO_SECURITY] Sistema de segurança ativado 10.1", "color:#ff3e6f");

        // proteção contra flood
        window.addEventListener("yuno:user_message", (e) => {
            this.registerFlood();
        });
    },

    // ==================================================
    // SANITIZA TEXTO DO UTILIZADOR
    // ==================================================
    sanitize(text) {
        if (!text) return "";

        let clean = text.trim();

        // remove tags HTML
        clean = clean.replace(/<\/?[^>]+(>|$)/g, "");

        // remove caracteres perigosos
        clean = clean
            .replace(/</g, "")
            .replace(/>/g, "")
            .replace(/"/g, "'")
            .replace(/`/g, "'");

        // bloqueia padrões maliciosos
        for (const block of this.blockedPatterns) {
            if (clean.toLowerCase().includes(block)) {
                console.warn("[YUNO_SECURITY] Tentativa bloqueada:", block);
                return "[AVISO] Conteúdo bloqueado por segurança.";
            }
        }

        return clean;
    },

    // ==================================================
    // ANTI-FLOOD
    // ==================================================
    registerFlood() {
        const now = Date.now();
        this.recentMessages.push(now);

        // remove mensagens antigas fora da janela
        this.recentMessages = this.recentMessages.filter(
            (t) => now - t < this.floodWindow
        );

        if (this.recentMessages.length > this.floodLimit) {
            console.warn("[YUNO_SECURITY] Flood detectado!");
            this.recentMessages = [];
            window.dispatchEvent(new CustomEvent("yuno:flood_warning"));
        }
    },

    // ==================================================
    // VERIFICA PERMISSÃO DO ADMIN
    // ==================================================
    validateAdminToken(token) {
        if (!token) return false;

        // v10.1: placeholder — token fixa temporária
        return token === "YUNO-ADMIN-10.1";
    },

    // ==================================================
    // CRIA TOKEN ÚNICO INTERNO
    // ==================================================
    generateToken() {
        return (
            "YUNO-" +
            Math.random().toString(36).substring(2, 9) +
            "-" +
            Date.now().toString(36).toUpperCase()
        );
    },

    // ==================================================
    // REGISTA ATIVIDADE SUSPEITA
    // ==================================================
    reportSuspicious(detail) {
        console.warn("[YUNO_SECURITY] Atividade suspeita:", detail);

        window.dispatchEvent(
            new CustomEvent("yuno:security_alert", {
                detail: { message: detail, time: Date.now() }
            })
        );
    }
};
