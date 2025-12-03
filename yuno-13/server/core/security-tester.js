/* ===============================================================
   YUNO 13.0 — SECURITY TESTER (VERSÃO CORRIGIDA / BLINDADA)
   Pentest nível 1 • Não invasivo • Anti-DoS • Seguro
   ============================================================== */

const logger = require("./logger");

const MAX_INPUT_SIZE = 200_000; // 200 KB – evita DoS

module.exports = {

    // =======================================================
    // EXECUTAR SCAN DE SEGURANÇA — CORRIGIDO
    // =======================================================
    async run(input = "") {
        try {
            logger.security("SECURITY-TESTER: Executar análise.");

            const text = this._sanitizeInput(input);

            return {
                vulnerabilidades: this._scanVulnerabilities(text),
                riscos: this._scanRiskPatterns(text),
                perigos: this._scanDangerousFunctions(text),
                html: this._scanHTML(text),
                status: "Pentest concluído (nível 1 — seguro)"
            };

        } catch (err) {
            logger.error("Erro no Security Tester", { erro: err.message });
            return {
                status: "Erro no pentest",
                error: err.message
            };
        }
    },

    // =======================================================
    // INPUT VALIDATION (ANTI-DoS + tipo seguro)
    // =======================================================
    _sanitizeInput(input) {
        if (typeof input !== "string") {
            try {
                input = String(input ?? "");
            } catch {
                return "";
            }
        }

        // limite anti-DoS
        if (input.length > MAX_INPUT_SIZE) {
            return input.slice(0, MAX_INPUT_SIZE);
        }

        return input;
    },

    // =======================================================
    // 1 — Vulnerabilidades básicas
    // =======================================================
    _scanVulnerabilities(text) {
        const patterns = [
            { name: "Possível XSS", regex: /<script[\s>]/i },
            { name: "Evento inline perigoso", regex: /onerror=|onload=|onclick=/i },
            { name: "Injeção JavaScript (javascript:)", regex: /javascript:/i },
            { name: "Iframe/Embed/Object", regex: /<(iframe|embed|object|link)/i }
        ];

        return this._matchPatternsSafe(text, patterns);
    },

    // =======================================================
    // 2 — Padrões suspeitos
    // =======================================================
    _scanRiskPatterns(text) {
        const patterns = [
            { name: "Uso de innerHTML inseguro", regex: /innerHTML\s*=/i },
            { name: "Atribuição HTML em template literal", regex: /=\s*`[^`]*`/i },
            { name: "Tags HTML detectadas", regex: /<[^>\s]+[^>]*>/i }
        ];

        return this._matchPatternsSafe(text, patterns);
    },

    // =======================================================
    // 3 — Funções perigosas
    // =======================================================
    _scanDangerousFunctions(text) {
        const patterns = [
            { name: "eval()", regex: /\beval\s*\(/i },
            { name: "new Function()", regex: /new\s+Function\b/i },
            { name: "setTimeout com string", regex: /setTimeout\s*\(\s*['"`]/i },
            { name: "setInterval com string", regex: /setInterval\s*\(\s*['"`]/i }
        ];

        return this._matchPatternsSafe(text, patterns);
    },

    // =======================================================
    // 4 — HTML inseguro
    // =======================================================
    _scanHTML(text) {
        const patterns = [
            { name: "Scripts embutidos", regex: /<script[\s>]/i },
            { name: "Iframe inseguro", regex: /<iframe/i },
            { name: "CSS externo suspeito", regex: /<link[^>]*href=["']http/i }
        ];

        return this._matchPatternsSafe(text, patterns);
    },

    // =======================================================
    // MATCH UNIVERSAL, SEGURO E CONSISTENTE
    // =======================================================
    _matchPatternsSafe(text, patterns) {
        const results = [];

        for (const p of patterns) {
            try {
                const match = p.regex.exec(text); // sem /g — sem stateful
                if (match) {
                    results.push({
                        tipo: p.name,
                        ocorrencia: true,
                        offset: match.index,
                        exemplo: text.slice(match.index, match.index + 40),
                        nota: "Revisão recomendada."
                    });
                }
            } catch (err) {
                logger.error("SECURITY TESTER: regex falhou", {
                    pattern: p.name,
                    erro: err.message
                });
            }
        }

        // Saída homogénea SEMPRE: array vazio em vez de objetos heterogéneos
        return results;
    }

};
