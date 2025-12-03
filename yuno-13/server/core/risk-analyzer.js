/* ==============================================================
   YUNO 13.0 — RISK ANALYZER (VERSÃO CORRIGIDA / BLINDADA)
   Validação completa • Anti-DoS • Níveis consistentes • Saída estável
   ============================================================== */

const logger = require("./logger");

const MAX_INPUT_SIZE = 200_000; // 200 KB — evita DoS por payload gigante
const SAFE_LEVELS = ["baixo", "médio", "alto", "crítico"];

module.exports = {

    // ==========================================================
    // FUNÇÃO PRINCIPAL — CORRIGIDA
    // ==========================================================
    async analyze(input) {
        logger.info("RISK ANALYZER: Início da análise de risco.");

        const { html, css, js } = this._sanitizeInput(input);

        const risks = [];

        try {
            risks.push(...this._checkHTML(html));
        } catch (err) {
            logger.error("RISK ANALYZER: Falha no _checkHTML", { erro: err.message });
        }

        try {
            risks.push(...this._checkCSS(css));
        } catch (err) {
            logger.error("RISK ANALYZER: Falha no _checkCSS", { erro: err.message });
        }

        try {
            risks.push(...this._checkJS(js));
        } catch (err) {
            logger.error("RISK ANALYZER: Falha no _checkJS", { erro: err.message });
        }

        const finalLevel = this._calculateRiskLevel(risks);

        logger.info("RISK ANALYZER: Análise concluída.", { finalLevel });

        return {
            level: finalLevel,
            riscos: risks.length ? risks : []
        };
    },

    // ==========================================================
    // VALIDAÇÃO DE INPUT (CORRIGIDO)
    // ==========================================================
    _sanitizeInput(input) {
        const defaults = { html: "", css: "", js: "" };

        if (!input || typeof input !== "object") return defaults;

        const sanitizeString = str => {
            if (typeof str !== "string") return "";
            if (str.length > MAX_INPUT_SIZE) {
                return str.slice(0, MAX_INPUT_SIZE);
            }
            return str;
        };

        return {
            html: sanitizeString(input.html),
            css: sanitizeString(input.css),
            js: sanitizeString(input.js)
        };
    },

    // ==========================================================
    // HTML — DETECÇÃO (COM LOCALIZAÇÃO)
    // ==========================================================
    _checkHTML(html) {
        if (typeof html !== "string" || !html.length) return [];

        const risks = [];

        const patterns = [
            { regex: /<script/gi, msg: "Uso de <script> detectado.", nivel: "alto" },
            { regex: /onerror\s*=/gi, msg: "Atributo onerror — possível XSS.", nivel: "alto" },
            { regex: /onload\s*=/gi, msg: "Atributo onload — execução automática.", nivel: "alto" },
            { regex: /javascript:/gi, msg: "Uso de javascript: em links.", nivel: "alto" }
        ];

        for (const p of patterns) {
            let match;
            while ((match = p.regex.exec(html)) !== null) {
                risks.push({
                    tipo: "HTML",
                    problema: p.msg,
                    nivel: p.nivel,
                    offset: match.index
                });
            }
        }

        return risks;
    },

    // ==========================================================
    // CSS — DETECÇÃO (PADRÕES ESTABILIZADOS)
    // ==========================================================
    _checkCSS(css) {
        if (typeof css !== "string" || !css.length) return [];

        const risks = [];

        const patterns = [
            { regex: /\*\s*\{/gi, msg: "Selector global '*' — impacto massivo.", nivel: "médio" },
            { regex: /position:\s*fixed/gi, msg: "Uso de fixed — pode quebrar layout.", nivel: "médio" },
            { regex: /opacity:\s*0/gi, msg: "Elementos invisíveis — risco oculto.", nivel: "médio" },
            { regex: /z-index:\s*9999/gi, msg: "z-index extremo.", nivel: "médio" }
        ];

        for (const p of patterns) {
            let match;
            while ((match = p.regex.exec(css)) !== null) {
                risks.push({
                    tipo: "CSS",
                    problema: p.msg,
                    nivel: p.nivel,
                    offset: match.index
                });
            }
        }

        return risks;
    },

    // ==========================================================
    // JS — DETECÇÃO (DEFENSIVA)
    // ==========================================================
    _checkJS(js) {
        if (typeof js !== "string" || !js.length) return [];

        const risks = [];

        const patterns = [
            { regex: /while\s*\(\s*true\s*\)/gi, msg: "Loop infinito.", nivel: "alto" },
            { regex: /eval\s*\(/gi, msg: "Uso de eval().", nivel: "crítico" },
            { regex: /innerHTML\s*=/gi, msg: "Manipulação direta de innerHTML.", nivel: "alto" },
            { regex: /document\.write/gi, msg: "document.write inseguro.", nivel: "alto" },
            { regex: /fetch\s*\(/gi, msg: "fetch detectado — verificar confiança da URL.", nivel: "médio" }
        ];

        for (const p of patterns) {
            let match;
            while ((match = p.regex.exec(js)) !== null) {
                risks.push({
                    tipo: "JS",
                    problema: p.msg,
                    nivel: p.nivel,
                    offset: match.index
                });
            }
        }

        return risks;
    },

    // ==========================================================
    // NÍVEL FINAL DE RISCO (CONSISTENTE)
    // ==========================================================
    _calculateRiskLevel(risks) {
        if (!Array.isArray(risks) || !risks.length) return "baixo";

        let critical = 0, high = 0, medium = 0;

        for (const r of risks) {
            const lvl = SAFE_LEVELS.includes(r.nivel) ? r.nivel : "baixo";
            if (lvl === "crítico") critical++;
            if (lvl === "alto") high++;
            if (lvl === "médio") medium++;
        }

        if (critical > 0 || high >= 3) return "crítico";
        if (high > 0) return "alto";
        if (medium > 0) return "médio";

        return "baixo";
    }
};
