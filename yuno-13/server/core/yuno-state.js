/* ===============================================================
   YUNO 13.0 — GLOBAL STATE ENGINE (VERSÃO CORRIGIDA / BLINDADA)
   Estado global unificado, seguro e coerente com toda a arquitetura.
   Nenhuma função foi removida. Toda a lógica original foi preservada.
   ============================================================== */

const logger = require("./logger");

class YunoState {

    constructor() {
        // ESTADO PRINCIPAL (mantido)
        this.modo = "safe";                        // safe | jarvis | builder | analise | kids | restrito
        this.autonomia = 0;                        // 0 = mínima, 1 = média, 2 = elevada
        this.tarefaAtual = null;
        this.previewAtual = null;
        this.patchPendente = null;

        // ESTADOS DE SEGURANÇA (mantidos)
        this.seguro = {
            sandboxAtiva: true,
            bloquearFS: true,
            bloquearExec: true,
            modoEstrito: true,
            riscoMaximoPermitido: "baixo"
        };

        // CONTEXTO GLOBAL (mantido)
        this.contexto = {
            ultimoComando: null,
            ultimaIntent: null,
            estadoEmocional: "neutro",
            historico: []
        };

        logger.info("YUNO-STATE: Estado global inicializado.");
    }

    /* ==========================================================
       NORMALIZAÇÃO / VALIDAÇÃO BÁSICA
       ========================================================== */
    _sanitizeString(value, fallback = null) {
        if (!value || typeof value !== "string") return fallback;
        return value.slice(0, 200);
    }

    _sanitizeMode(modo) {
        const modosValidos = ["safe", "jarvis", "builder", "analise", "kids", "restrito"];
        return modosValidos.includes(modo) ? modo : "safe";
    }

    _sanitizeAutonomia(n) {
        return Number.isInteger(n) && n >= 0 && n <= 2 ? n : 0;
    }

    _capHistorico() {
        if (this.contexto.historico.length > 2000) {
            this.contexto.historico.splice(0, 1000);
        }
    }

    /* ==========================================================
       SETTERS CORRIGIDOS / BLINDADOS
       (mantêm toda a lógica original sem remover nada)
       ========================================================== */

    setModo(modo) {
        this.modo = this._sanitizeMode(modo);
        logger.info(`STATE: Modo alterado → ${this.modo}`);
    }

    setAutonomia(nivel) {
        this.autonomia = this._sanitizeAutonomia(nivel);
        logger.info(`STATE: Autonomia definida → ${this.autonomia}`);
    }

    setTarefa(tarefa) {
        this.tarefaAtual = this._sanitizeString(tarefa, null);
        logger.info("STATE: Tarefa atual atualizada.");
    }

    setPreview(id) {
        this.previewAtual = this._sanitizeString(id, null);
        logger.info("STATE: Preview atual atualizado.");
    }

    setPatch(patch) {
        // patch pode ser object → limitamos tamanho
        try {
            const s = JSON.stringify(patch);
            if (s.length > 50000) return; // proteção
            this.patchPendente = patch;
        } catch {
            this.patchPendente = null;
        }
        logger.info("STATE: Patch pendente atualizado.");
    }

    setIntent(intent) {
        if (intent && typeof intent === "object") {
            this.contexto.ultimaIntent = intent;
            this._guardarHistorico(`Intent: ${intent.tipo || intent.type || "desconhecida"}`);
        }
    }

    setComando(cmd) {
        this.contexto.ultimoComando = this._sanitizeString(cmd, null);
        this._guardarHistorico(`Comando: ${cmd}`);
    }

    setEmocao(tipo) {
        const tiposValidos = ["neutro", "alerta", "técnico", "amigável", "jarvis"];
        this.contexto.estadoEmocional = tiposValidos.includes(tipo) ? tipo : "neutro";
        logger.info(`STATE: Emoção definida → ${this.contexto.estadoEmocional}`);
    }

    atualizarContexto(data) {
        if (data && typeof data === "object") {
            Object.assign(this.contexto, data);
            this._capHistorico();
            logger.info("STATE: Contexto geral atualizado.");
        }
    }

    /* ==========================================================
       MÉTODOS AUXILIARES (mantidos, mas blindados)
       ========================================================== */

    limparPreview() {
        this.previewAtual = null;
        this.patchPendente = null;
        logger.info("STATE: Preview e patch limpos.");
    }

    resetar() {
        this.modo = "safe";
        this.autonomia = 0;
        this.tarefaAtual = null;
        this.previewAtual = null;
        this.patchPendente = null;
        this.contexto = {
            ultimoComando: null,
            ultimaIntent: null,
            estadoEmocional: "neutro",
            historico: []
        };
        logger.warn("STATE: Estado global RESETADO.");
    }

    _guardarHistorico(evento) {
        if (typeof evento === "string") {
            this.contexto.historico.push({
                evento: evento.slice(0, 200),
                data: new Date().toISOString()
            });
            this._capHistorico();
        }
    }

    /* ==========================================================
       EXPORTAÇÃO DO ESTADO (immutável)
       ========================================================== */
    getAll() {
        return {
            modo: this.modo,
            autonomia: this.autonomia,
            tarefaAtual: this.tarefaAtual,
            previewAtual: this.previewAtual,
            patchPendente: this.patchPendente,
            seguro: { ...this.seguro },          // cópia → evita mutação externa
            contexto: { ...this.contexto }       // cópia → evita corrupção
        };
    }
}

module.exports = new YunoState();
