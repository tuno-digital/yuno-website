// ===============================================================
// 🔁 YUNO AUTOSYSTEM — AUTO-PROGRAMAÇÃO v10.3
// Yuno analisa, sugere, corrige e prepara upgrades internos
// ===============================================================

const fs = require("fs");
const path = require("path");
const logger = require("../../utils/logger");
const { YUNO_CONFIG } = require("../core/yuno-config-loader");
const { generateFix } = require("./auto-fix-engine");
const { proposeUpgrade } = require("./auto-upgrade-engine");
const { saveAutoReport } = require("./auto-reports");

// Diretório-base do sistema
const ROOT = path.join(__dirname, "../../..");

module.exports = {

    status: "idle",     // idle | scanning | fixing | upgrading
    lastScan: null,
    queue: [],           // lista de upgrades pendentes

    // ===========================================================
    // 🔍 1) SCAN — ANALISAR CÓDIGO DO PROJETO
    // ===========================================================
    scanProject() {
        this.status = "scanning";
        this.lastScan = Date.now();

        const report = {
            time: new Date().toISOString(),
            warnings: [],
            files: [],
            suggestions: []
        };

        const foldersToScan = ["server", "ativos/js", "yuno-ia", "data"];

        foldersToScan.forEach(folder => {
            const dir = path.join(ROOT, folder);
            if (!fs.existsSync(dir)) return;

            const files = fs.readdirSync(dir)
                .filter(f => f.endsWith(".js") || f.endsWith(".json"));

            files.forEach(file => {
                const fp = path.join(dir, file);
                try {
                    const content = fs.readFileSync(fp, "utf8");
                    report.files.push(fp);

                    // Heurística simples de aviso
                    if (content.includes("TODO") || content.includes("FIXME")) {
                        report.warnings.push({
                            file: fp,
                            message: "Encontrado TODO no código."
                        });
                    }
                } catch (e) {}
            });
        });

        saveAutoReport(report);
        logger.system("SCAN completo — relatório salvo.");

        return report;
    },

    // ===========================================================
    // 🛠️ 2) FIX — GERAR CORREÇÃO DE UM TRECHO DE CÓDIGO
    // ===========================================================
    async fixCode(codeSnippet, description) {
        this.status = "fixing";

        const fix = await generateFix(codeSnippet, description);

        this.queue.push({
            tipo: "fix",
            descricao: description,
            code: fix
        });

        logger.success("Correção gerada e guardada na fila.");
        return fix;
    },

    // ===========================================================
    // 🚀 3) UPGRADE — PROPOR MELHORIAS DE SISTEMA
    // ===========================================================
    async proposeUpgrade(section) {
        this.status = "upgrading";

        const upgrade = await proposeUpgrade(section);

        this.queue.push({
            tipo: "upgrade",
            alvo: section,
            detalhes: upgrade
        });

        logger.success("Upgrade proposto e guardado na fila.");
        return upgrade;
    }
};
