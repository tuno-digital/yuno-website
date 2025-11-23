// ==========================================================
// YUNO IA — AUTO SYSTEM 10.3
// Núcleo de auto-programação e auto-otimização controlada
// ==========================================================

const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");
const YunoCore = require("./yuno-core");
const YUNOCONFIG = require("./config/yuno-config.json");

module.exports = {
    status: "idle", // idle | running | optimizing | waiting_approval
    lastExecution: null,
    improvementsQueue: [],

    // ============================
    // 1. INICIAR SISTEMA
    // ============================
    init() {
        logger.system("AUTO-SYSTEM 10.3 carregado.");
        this.status = "idle";
        return true;
    },

    // ============================
    // 2. GERAR SUGESTÕES DE MELHORIA
    // ============================
    async generateImprovements(context = "") {
        this.status = "optimizing";

        logger.info("AUTO-SYSTEM: A gerar sugestões internas...");

        const prompt = `
        Analisa o seguinte contexto da Yuno IA e propõe melhorias internas:
        - Não alteres ficheiros diretamente.
        - Sugere mudanças, otimizações, melhorias.
        - Mantém a segurança 10.3.
        - Não faças nada sem aprovação.
        
        CONTEXTO:
        ${context}
        `;

        const response = await YunoCore.think(prompt);

        const suggestion = {
            id: Date.now(),
            text: response,
            approved: false,
            timestamp: new Date().toISOString()
        };

        this.improvementsQueue.push(suggestion);

        logger.success("Sugestão de melhoria adicionada à fila.");

        this.status = "waiting_approval";
        this.lastExecution = new Date();

        return suggestion;
    },

    // ============================
    // 3. LISTAR MELHORIAS PENDENTES
    // ============================
    listPending() {
        return this.improvementsQueue.filter(s => !s.approved);
    },

    // ============================
    // 4. APROVAR MELHORIA (MANUAL)
    // ============================
    approveImprovement(id) {
        const item = this.improvementsQueue.find(s => s.id === id);

        if (!item) return false;

        item.approved = true;

        // No futuro: a IA aplica a melhoria automaticamente
        logger.success(`Melhoria ${id} aprovada com sucesso.`);

        return true;
    },

    // ============================
    // 5. EXECUTAR ROTINA AUTOMÁTICA
    // ============================
    async autoRoutine() {
        if (!YUNOCONFIG.evolution.enabled) return;

        logger.system("AUTO-SYSTEM: A correr rotina automática...");

        const context = `
            Sistema: ${YUNOCONFIG.version}
            Memória ativa: ${YUNOCONFIG.memory.enabled}
            Limites: ${JSON.stringify(YUNOCONFIG.limits)}
            Pending improvements: ${this.listPending().length}
        `;

        await this.generateImprovements(context);

        logger.system("AUTO-SYSTEM rotina concluída.");
    },

    // ============================
    // 6. SALVAR LOG DE EVOLUÇÃO
    // ============================
    saveEvolutionLog(data) {
        const file = path.join(__dirname, "evolution-log.json");

        const logData = {
            date: new Date().toISOString(),
            ...data
        };

        let logs = [];
        if (fs.existsSync(file)) {
            try {
                logs = JSON.parse(fs.readFileSync(file, "utf8"));
            } catch (err) {
                logs = [];
            }
        }

        logs.push(logData);

        fs.writeFileSync(file, JSON.stringify(logs, null, 2));
        logger.info("AUTO-SYSTEM: Log de evolução salvo.");
    }
};
