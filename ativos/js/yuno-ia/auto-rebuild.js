// yuno-ia/auto-rebuild.js
// Sistema de recarregamento interno — YUNO 10.3 REAL MODE
// Reinicia core + engine após aplicação de patch

import { YUNO_ENGINE } from "./engine.js";
import { YUNO_CORE } from "./core.js";

export const YUNO_REBUILD = {

    reloading: false,

    async reload() {

        if (this.reloading) {
            console.warn("[YUNO_REBUILD] Já estou a recarregar, espera...");
            return "A recarregar…";
        }

        this.reloading = true;

        console.log("%c[YUNO_REBUILD] A recarregar sistema YUNO 10.3…", 
            "color:#00ffaa; font-weight:bold;");

        try {

            // ============================
            // 1) Reiniciar ENGINE
            // ============================
            YUNO_ENGINE.initialized = false;
            await YUNO_ENGINE.init();

            // ============================
            // 2) Reiniciar CORE
            // ============================
            YUNO_CORE.started = false;
            await YUNO_CORE.start();

            console.log("%c[YUNO_REBUILD] Sistema recarregado com sucesso!", 
                "color:#00ff99; font-weight:bold;");

            this.reloading = false;

            return "Sistema recarregado com sucesso!";

        } catch (err) {

            console.error("[YUNO_REBUILD] Erro ao recarregar:", err);

            this.reloading = false;

            return "Erro ao recarregar sistema: " + err.toString();
        }
    }
};
