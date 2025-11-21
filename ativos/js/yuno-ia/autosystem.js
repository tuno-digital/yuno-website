// yuno-ia/autosystem.js
// Sistema autónomo da YUNO IA — manutenção, rotinas, auto-correção e auto-programação REAL MODE (10.3)

import { YUNO_ENGINE } from "./engine.js";
import { YUNO_MEMORY } from "./memory.js";
import { YUNO_PERSONALITY } from "./personality.js";
import { YUNO_ANALYTICS } from "./analytics.js";
import { YUNO_REBUILD } from "./auto-rebuild.js";

export const YUNO_AUTOSYSTEM = {

    status: "idle",              // idle | running | sleep | error | recovering
    heartbeat: null,             // ciclo vital
    interval: 3500,              // frequência de checagem
    lastEvent: Date.now(),
    autoProgrammingLogs: [],     // logs de auto-programação REAL 10.3

    init() {
        console.log("%c[YUNO_AUTOSYSTEM] Iniciado — Sistema Autónomo 10.3 REAL MODE", "color:#00ff9d");

        this.startHeartbeat();      
        this.monitorActivity();     
        this.listenAutoProgramming();

        setTimeout(() => {
            this.systemLog("Sistema operacional carregado (Auto-Programação REAL 10.3 ✓)");
        }, 1200);
    },

    // ==========================================================
    // CICLO AUTOMÁTICO — SELF CHECK
    // ==========================================================
    startHeartbeat() {
        if (this.heartbeat) return;
        this.heartbeat = setInterval(() => this.selfCheck(), this.interval);
    },

    selfCheck() {

        // Memória curta: auto limpeza
        if (YUNO_MEMORY.short.length > 40) {
            YUNO_MEMORY.flushShort();
            this.systemLog("Memória curta limpa automaticamente.");
        }

        // ENGINE
        if (!YUNO_ENGINE.initialized) {
            this.recover("ENGINE não iniciado — a recuperar…");
            YUNO_ENGINE.init();
        }

        // PERSONALIDADE
        if (!YUNO_PERSONALITY.loaded) {
            this.recover("Personalidade não carregada — a reiniciar…");
            YUNO_PERSONALITY.init();
        }

        // Estado operacional
        this.status = "running";
    },

    // ==========================================================
    // MONITOR DE INATIVIDADE
    // ==========================================================
    monitorActivity() {

        window.addEventListener("yuno:user_message", () => {
            this.lastEvent = Date.now();
        });

        setInterval(() => {

            const diff = Date.now() - this.lastEvent;

            // Entrar em sleep mode
            if (diff > this.interval * 10 && this.status !== "sleep") {
                this.status = "sleep";
                this.systemLog("Modo sleep ativado (inatividade).");
            }

            // Sair do sleep
            if (diff <= this.interval * 10 && this.status === "sleep") {
                this.status = "running";
                this.systemLog("Modo sleep desativado — atividade retomada.");
            }

        }, this.interval);
    },

    // ==========================================================
    // AUTO-PROGRAMAÇÃO REAL 10.3 — PATCH APLICADO
    // ==========================================================
    listenAutoProgramming() {

        // Quando o executor aplica patch real:
        window.addEventListener("yuno:patch_applied", (e) => {

            const patchInfo = e.detail;

            const log = {
                evento: "patch_aplicado",
                patch: patchInfo,
                time: Date.now()
            };

            this.autoProgrammingLogs.push(log);

            this.systemLog(`Patch aplicado em: ${patchInfo.path}`);
            YUNO_ANALYTICS.track("patch_aplicado", patchInfo);

            // Rebuild automático
            setTimeout(() => {
                this.systemLog("A iniciar REBUILD automático…");
                YUNO_REBUILD.reload();
            }, 600);
        });

        this.systemLog("Listener de Auto-Programação (10.3 REAL MODE) ativo.");
    },

    // ==========================================================
    // RECUPERAÇÃO DO SISTEMA
    // ==========================================================
    recover(message) {
        this.status = "recovering";
        this.systemLog(message);

        setTimeout(() => {
            this.status = "running";
            this.systemLog("Estado operacional restaurado.");
        }, 900);
    },

    // ==========================================================
    // LOG INTERNO
    // ==========================================================
    systemLog(message) {
        console.log(`%c[YUNO_AUTOSYSTEM] ${message}`, "color:#00ff9d");

        window.dispatchEvent(
            new CustomEvent("yuno:system_log", {
                detail: { message, time: Date.now() }
            })
        );
    },

    // ==========================================================
    // CONSULTAR LOGS DE AUTO-PROGRAMAÇÃO
    // ==========================================================
    getAutoProgrammingLogs() {
        return this.autoProgrammingLogs;
    }
};
