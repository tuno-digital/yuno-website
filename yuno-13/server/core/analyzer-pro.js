// ===========================================================
// YUNO 13.0 — ANALYZER PRO  (VERSÃO CORRIGIDA)
// Analista avançado do sistema: estrutura, integridade, erros
// ===========================================================

const fs = require("fs");
const path = require("path");
const logger = require("./logger");

// Diretórios importantes
const REQUIRED_DIRS = [
    "server/core",
    "server/controllers",
    "server/routes",
    "server/builder",
    "server/security",
    "server/previews",
    "server/memory",
    "public"
];

// Ficheiros essenciais do núcleo
const REQUIRED_FILES = [
    "server/core/ia-engine.js",
    "server/core/intent-engine.js",
    "server/core/logger.js",
    "server/core/preview-engine.js",
    "server/core/yuno-core.js",
    "server/core/yuno-path-advisor.js",
    "server/core/security-tester.js",
    "server/core/analyzer-pro.js"
];

// Resolve root do projeto verdadeiro
const ROOT = path.resolve(__dirname, "../../");

module.exports = {

    // =======================================================
    // Função principal
    // =======================================================
    async scan() {
        try {
            logger.info("ANALYZER-PRO: Scan iniciado.");

            return {
                integridadeEstrutura: this._checkStructure(),
                modulosCriticos: this._checkFiles(),
                ficheirosVazios: this._checkEmptyFiles(),
                loopsSuspeitos: this._checkLoops(),
                importsQuebrados: this._checkImports(),
                estado: "Analyzer Pro concluído"
            };

        } catch (err) {
            logger.error("Erro no Analyzer Pro", err);
            return {
                estado: "Erro no analyzer-pro",
                erro: err.message
            };
        }
    },

    // =======================================================
    // 1 — Verificar diretórios essenciais
    // =======================================================
    _checkStructure() {
        const results = [];

        for (const dir of REQUIRED_DIRS) {
            try {
                const full = path.join(ROOT, dir);

                if (!fs.existsSync(full)) {
                    results.push({ diretoria: dir, ok: false, problema: "Diretoria inexistente" });
                } else {
                    results.push({ diretoria: dir, ok: true });
                }

            } catch (err) {
                results.push({ diretoria: dir, ok: false, problema: "Erro ao verificar diretoria" });
            }
        }

        return results;
    },

    // =======================================================
    // 2 — Verificar módulos essenciais
    // =======================================================
    _checkFiles() {
        const results = [];

        for (const file of REQUIRED_FILES) {
            try {
                const full = path.join(ROOT, file);

                if (!fs.existsSync(full)) {
                    results.push({ ficheiro: file, ok: false, problema: "Ficheiro essencial não encontrado" });
                } else {
                    results.push({ ficheiro: file, ok: true });
                }

            } catch (err) {
                results.push({ ficheiro: file, ok: false, problema: "Erro ao verificar ficheiro" });
            }
        }

        return results;
    },

    // =======================================================
    // 3 — Verificar ficheiros vazios
    // =======================================================
    _checkEmptyFiles() {
        const baseDir = path.join(ROOT, "server/core");
        const results = [];

        try {
            const files = fs.readdirSync(baseDir);

            for (const f of files) {
                const full = path.join(baseDir, f);

                try {
                    const stat = fs.statSync(full);
                    if (!stat.isFile()) continue;

                    if (stat.size === 0) {
                        results.push({ ficheiro: f, problema: "Ficheiro vazio" });
                    }

                } catch {
                    results.push({ ficheiro: f, problema: "Erro ao ler ficheiro" });
                }
            }

        } catch {
            return [{ ok: false, problema: "Erro ao ler diretoria base 'core'" }];
        }

        return results.length
            ? results
            : [{ ok: true, mensagem: "Nenhum ficheiro vazio encontrado" }];
    },

    // =======================================================
    // 4 — Verificar padrões de loops infinitos
    // =======================================================
    _checkLoops() {
        const results = [];
        const codeDir = __dirname;

        let files = [];
        try {
            files = fs.readdirSync(codeDir);
        } catch {
            return [{ ok: false, problema: "Erro ao ler diretoria core" }];
        }

        for (const f of files) {
            const full = path.join(codeDir, f);

            try {
                const stat = fs.statSync(full);
                if (!stat.isFile()) continue;

                const content = fs.readFileSync(full, "utf8");

                if (/while\s*\(\s*true\s*\)/i.test(content)) {
                    results.push({ ficheiro: f, problema: "Possível loop infinito detectado" });
                }

            } catch {
                results.push({ ficheiro: f, problema: "Erro ao analisar ficheiro" });
            }
        }

        return results.length
            ? results
            : [{ ok: true, mensagem: "Nenhum loop suspeito" }];
    },

    // =======================================================
    // 5 — Verificar imports quebrados
    // =======================================================
    _checkImports() {
        const results = [];
        const coreDir = __dirname;

        let files = [];
        try {
            files = fs.readdirSync(coreDir);
        } catch {
            return [{ ok: false, problema: "Erro ao ler diretoria core" }];
        }

        for (const f of files) {
            const full = path.join(coreDir, f);

            try {
                const stat = fs.statSync(full);
                if (!stat.isFile()) continue;

                const content = fs.readFileSync(full, "utf8");
                const imports = content.match(/require\(.+?\)/g) || [];

                for (const imp of imports) {
                    const clean = imp.replace("require(", "")
                        .replace(")", "")
                        .replace(/['"`]/g, "")
                        .trim();

                    // só verifica imports relativos
                    if (!clean.startsWith(".")) continue;

                    const resolved = path.resolve(coreDir, clean);

                    const exists =
                        fs.existsSync(resolved) ||
                        fs.existsSync(resolved + ".js") ||
                        fs.existsSync(path.join(resolved, "index.js"));

                    if (!exists) {
                        results.push({
                            ficheiro: f,
                            import: clean,
                            problema: "Import quebrado: ficheiro não encontrado"
                        });
                    }
                }

            } catch {
                results.push({ ficheiro: f, problema: "Erro ao verificar imports" });
            }
        }

        return results.length
            ? results
            : [{ ok: true, mensagem: "Nenhum import quebrado" }];
    }
};
