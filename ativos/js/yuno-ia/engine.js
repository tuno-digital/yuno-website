// yuno-ia/engine.js
// Motor principal da IA — controla o fluxo: input → inferência → renderização (v10.2 Hybrid)

import { YUNO_RENDER } from "./render.js";
import { YUNO_INFERENCE } from "./inference.js";
import { YUNO_MEMORY } from "./memory.js";
import { YUNO_ANALYTICS } from "./analytics.js";   // Analytics personalizado

export const YUNO_ENGINE = {

    initialized: false,

    async init() {
        if (this.initialized) return;

        console.log("%c[YUNO_ENGINE] Iniciar IA YUNO 10.2 Hybrid", "color:#00f0ff");

        YUNO_RENDER.init();
        YUNO_MEMORY.init();

        // Ouve evento global de nova mensagem do utilizador
        window.addEventListener("yuno:user_message", async (e) => {
            const text = e.detail.text;
            await this.pipeline(text);
        });

        this.initialized = true;
    },

    // ==================================================
    // PIPELINE COMPLETO (versão 10.2 SAFE MODE)
    // ==================================================
    async pipeline(userText) {
        try {
            console.log("[YUNO_ENGINE] Pipeline iniciado…");

            // ===============================
            // 🔥 Analytics — mensagem do user
            // ===============================
            YUNO_ANALYTICS.track("mensagem_user", { texto: userText });

            // Renderiza mensagem do utilizador
            YUNO_RENDER.userMessage(userText);

            // Mostra animação "Yuno está a escrever..."
            YUNO_RENDER.showTyping();

            // Guarda na memória de curto prazo
            YUNO_MEMORY.storeShort(userText);

            // Inferência: decide resposta final (inclui auto-programação 10.2)
            const response = await YUNO_INFERENCE.process(userText);

            // Esconde animação
            YUNO_RENDER.hideTyping();

            // Renderiza resposta da IA
            await YUNO_RENDER.aiMessage(response);

            // Guarda a resposta na memória
            YUNO_MEMORY.storeShort(response);

            // ===============================
            // 🔥 Analytics — resposta da IA
            // ===============================
            YUNO_ANALYTICS.track("resposta_ia", { texto: response });

            // ===============================
            // 🔥 Analytics — Auto-Programação 10.2
            // ===============================
            if (response.includes("AUTO-PROGRAMAÇÃO 10.2")) {
                YUNO_ANALYTICS.track("auto_programacao_detectada", {
                    input: userText,
                    resposta: response
                });
            }

        } catch (err) {
            console.error("⚠️ ERRO NO PIPELINE YUNO:", err);

            YUNO_RENDER.hideTyping();

            // Mensagem de erro ao usuário
            await YUNO_RENDER.aiMessage(
                "Opa, deu um erro interno aqui 😅 mas já estou a recuperar!"
            );

            // ===============================
            // 🔥 Analytics — erro no pipeline
            // ===============================
            YUNO_ANALYTICS.track("erro_pipeline", {
                erro: err.toString(),
                input: userText
            });
        }
    }
};
