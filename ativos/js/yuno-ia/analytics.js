// ======================================================
// YUNO IA — ANALYTICS MODULE (v10.1 Hybrid Neon)
// Monitorização avançada de eventos, interação e IA
// ======================================================

export const YUNO_ANALYTICS = {

    ativo: true,

    // ============================
    // REGISTAR EVENTO
    // ============================
    track(eventName, payload = {}) {
        if (!this.ativo) return;

        const evento = {
            nome: eventName,
            dados: payload,
            timestamp: Date.now(),
            origem: "yuno-ia"
        };

        console.log("%c[YUNO ANALYTICS]", "color:#00eaff", evento);

        // Guardar localmente para futura IA/diagnóstico
        this._guardarLocal(evento);

        // Enviar para o Analytics global (se existir)
        if (window.YunoGlobalAnalytics?.track) {
            window.YunoGlobalAnalytics.track(evento.nome, evento);
        }
    },

    // ============================
    // GUARDAR EVENTOS LOCALMENTE
    // ============================
    _guardarLocal(evento) {
        try {
            const historico = JSON.parse(localStorage.getItem("yunoIA_analytics") || "[]");
            historico.push(evento);

            // Mantém só os últimos 500 eventos
            if (historico.length > 500) historico.shift();

            localStorage.setItem("yunoIA_analytics", JSON.stringify(historico));

        } catch (err) {
            console.warn("Analytics local falhou:", err);
        }
    },

    // ============================
    // OBTÉM HISTÓRICO
    // ============================
    getHistorico() {
        try {
            return JSON.parse(localStorage.getItem("yunoIA_analytics") || "[]");
        } catch {
            return [];
        }
    },

    // ============================
    // LIMPAR HISTÓRICO
    // ============================
    limpar() {
        localStorage.removeItem("yunoIA_analytics");
        console.log("%c[YUNO ANALYTICS] Histórico apagado", "color:red");
        return true;
    },

    // ============================
    // DESATIVAR / ATIVAR TRACKING
    // ============================
    toggle(estado) {
        this.ativo = estado;
        console.log(`[YUNO ANALYTICS] Tracking ${estado ? "ativado" : "desativado"}`);
    }
};
