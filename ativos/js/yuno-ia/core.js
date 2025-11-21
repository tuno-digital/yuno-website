// yuno-ia/core.js
// Núcleo da IA YUNO — controla todos os módulos e coordena o sistema completo
// Versão 10.3 REAL AUTO-PROGRAMMING

import { YUNO_ENGINE } from "./engine.js";
import { YUNO_SECURITY } from "./security.js";
import { YUNO_MEMORY } from "./memory.js";
import { YUNO_PERSONALITY } from "./personality.js";
import { YUNO_COMMANDS } from "./commands.js";
import { YUNO_AUTOSYSTEM } from "./autosystem.js";
import { YUNO_ANALYTICS } from "./analytics.js";

// 🧩 MÓDULOS 10.2 SAFE MODE
import { YUNO_INTENT_PROGRAMMING } from "./intent-programming.js";
import { YUNO_SANDBOX } from "./sandbox.js";
import { YUNO_AUTO_WRITER } from "./auto-writer.js";

// 🧩 NOVOS MÓDULOS 10.3 REAL MODE
import { YUNO_EXECUTOR } from "./executor.js";
import { YUNO_REBUILD } from "./auto-rebuild.js";

export const YUNO_CORE = {

    started: false,

    // 🔥 Referências dos módulos de auto-programação
    modulosAuto: {
        intent: YUNO_INTENT_PROGRAMMING,
        sandbox: YUNO_SANDBOX,
        writer: YUNO_AUTO_WRITER,
        executor: YUNO_EXECUTOR,  // 10.3 — aplicar patch real
        rebuild: YUNO_REBUILD     // 10.3 — recarregar engine/core
    },

    async start() {
        if (this.started) {
            console.warn("[YUNO_CORE] IA já está iniciada.");
            return;
        }

        console.log(
            "%c[YUNO_CORE] Inicializando YUNO 10.3 REAL AUTO-PROGRAMMING...",
            "color:#00eaff; font-weight:bold;"
        );

        // ================================
        // 1) Ativar segurança
        // ================================
        YUNO_SECURITY.init();

        // ================================
        // 2) Inicializar personalidade
        // ================================
        if (YUNO_PERSONALITY.init) {
            YUNO_PERSONALITY.init();
        }

        // ================================
        // 3) Inicializar memória
        // ================================
        YUNO_MEMORY.init();

        // ================================
        // 4) Sistema autónomo
        // ================================
        YUNO_AUTOSYSTEM.init();

        // ================================
        // 5) Engine
        // ================================
        await YUNO_ENGINE.init();

        // ================================
        // 6) Analytics
        // ================================
        if (YUNO_ANALYTICS.toggle) {
            YUNO_ANALYTICS.toggle(true);
        }
        console.log("%c[YUNO_CORE] Analytics ligado (módulo personalizado).", "color:#00eaff");

        // ================================
        // 7) Auto-Programação 10.2 SAFE MODE
        // ================================
        console.log(
            "%c[YUNO 10.2] SAFE MODE ativo (interpretação, blueprint e patch).",
            "color:#00ffaa; font-weight:bold;"
        );

        // ================================
        // 8) Auto-Programação REAL 10.3
        // ================================
        console.log(
            "%c[YUNO 10.3] WRITE MODE ativo (aplicar patch + rebuild).",
            "color:#00ff99; font-weight:bold;"
        );

        // ================================
        // 9) Listeners globais
        // ================================
        this.attachListeners();

        this.started = true;

        console.log(
            "%c[YUNO_CORE] 🚀 YUNO 10.3 carregada com sucesso!",
            "color:#64ffda; font-weight:bold;"
        );
    },

    // =====================================================
    // EVENTOS PRINCIPAIS DO SISTEMA
    // =====================================================
    attachListeners() {

        // Anti-flood
        window.addEventListener("yuno:flood_warning", () => {
            YUNO_ENGINE.pipeline("[⚠️] Estás a mandar mensagens muito rápido, acalma aí 😅");
        });

        // Logs internos (para painel admin)
        window.addEventListener("yuno:system_log", (e) => {
            console.log("%c[SYSTEM LOG]", "color:#8affc7", e.detail);
        });

        // Evento: patch aplicado (10.3 REAL)
        window.addEventListener("yuno:patch_applied", (e) => {
            console.log("%c[YUNO_CORE] Patch aplicado → rebuild disponível.", "color:#00ff99");
        });

        // Evento: mensagem do utilizador → pipeline correto
        window.addEventListener("yuno:user_message", (e) => {
            YUNO_ENGINE.pipeline(e.detail.text);
        });
    }
};
