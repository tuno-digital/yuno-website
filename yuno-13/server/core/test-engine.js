/* ===============================================================
   YUNO 13.0 — TEST ENGINE (VERSÃO CORRIGIDA / BLINDADA)
   - Tipo seguro
   - Anti-DoS
   - Compatível com risk-analyzer 13.0
   - Saída normalizada
   - Zero crash
   ============================================================== */

const risk = require("./risk-analyzer");
const logger = require("./logger");

// limite de segurança para prevenir DoS
const MAX_INPUT = 200_000;

module.exports = {

    // ==========================================================
    // EXECUTAR TESTES
    // ==========================================================
    async testar(content = "", filePath = "") {
        logger.info("TEST-ENGINE: A executar testes automáticos…");

        const resultados = [];

        // 0 — Sanitização + Anti-DoS
        const code = this._prepareContent(content);

        // 1 — Sintaxe
        resultados.push(await this._safeCall(() => this._testarSintaxe(code), "sintaxe"));

        // 2 — Imports proibidos
        resultados.push(await this._safeCall(() => this._testarImports(code), "imports"));

        // 3 — Loops perigosos
        resultados.push(await this._safeCall(() => this._testarLoops(code), "loops"));

        // 4 — Estrutura de preview
        resultados.push(await this._safeCall(() => this._testarEstruturaPreview(code), "preview"));

        // 5 — Risco — compatível com risk-analyzer 13.0
        resultados.push(await this._safeCall(async () => {
            const out = await risk.analyze({ html: code, css: "", js: "" });
            // normalizar saída para o motor de testes
            if (out.level !== "baixo") {
                return { ok: false, tipo: "risk", erro: "Riscos detectados", detalhes: out };
            }
            return { ok: true, tipo: "risk" };
        }, "risk-analyzer"));

        // ======================================================
        // Consolidar relatório final
        // ======================================================
        const falhas = resultados.filter(r => r.ok === false);

        if (falhas.length > 0) {
            logger.warn("TEST-ENGINE: FALHAS DETECTADAS.");
            return {
                ok: false,
                mensagem: "❌ Testes falharam. Preview ou patch recusado.",
                falhas,
                resultados
            };
        }

        logger.info("TEST-ENGINE: Todos os testes passaram.");
        return {
            ok: true,
            mensagem: "✅ Todos os testes passaram com sucesso.",
            resultados
        };
    },

    // ==========================================================
    // Sanitização + anti-DoS
    // ==========================================================
    _prepareContent(content) {
        if (typeof content !== "string") {
            try { content = String(content ?? ""); }
            catch { return ""; }
        }
        if (content.length > MAX_INPUT) {
            return content.slice(0, MAX_INPUT);
        }
        return content;
    },

    // ==========================================================
    // Execução segura de cada teste — nunca crasha o motor
    // ==========================================================
    async _safeCall(fn, tipo) {
        try {
            const res = await fn();
            // Normalização caso o teste devolva algo inesperado
            if (!res || typeof res !== "object" || typeof res.ok !== "boolean") {
                return { ok: false, tipo, erro: "Resultado inválido do teste." };
            }
            return res;
        } catch (err) {
            logger.error("TEST-ENGINE: erro interno no teste", { tipo, erro: err.message });
            return { ok: false, tipo, erro: err.message };
        }
    },

    // ==========================================================
    // TESTE DE SINTAXE JS (protegido)
    // ==========================================================
    _testarSintaxe(code) {
        try {
            new Function(code); // apenas compila, não executa
            return { ok: true, tipo: "sintaxe" };
        } catch (err) {
            return { ok: false, tipo: "sintaxe", erro: err.message };
        }
    },

    // ==========================================================
    // IMPORTS SUSPEITOS (reforçado)
    // ==========================================================
    _testarImports(code) {
        const padroes = [
            /\brequire\s*\(\s*['"]fs['"]\s*\)/i,
            /\bchild_process\b/i,
            /\bprocess\./i,
            /\bexec\s*\(/i,
            /\bspawn\s*\(/i,
            /rm\s+-rf/i
        ];

        const encontrados = padroes.filter(r => r.test(code));

        if (encontrados.length > 0) {
            return {
                ok: false,
                tipo: "imports",
                erro: "Importações suspeitas detectadas",
                encontrados: encontrados.map(x => x.toString())
            };
        }

        return { ok: true, tipo: "imports" };
    },

    // ==========================================================
    // LOOPS PERIGOSOS (melhorado)
    // ==========================================================
    _testarLoops(code) {
        const padroes = [
            /\bwhile\s*\(\s*true\s*\)/i,
            /\bfor\s*\(\s*;\s*;\s*\)/i
        ];

        const encontrados = padroes.filter(r => r.test(code));

        if (encontrados.length > 0) {
            return {
                ok: false,
                tipo: "loops",
                erro: "Loop infinito detectado",
                encontrados: encontrados.map(x => x.toString())
            };
        }

        return { ok: true, tipo: "loops" };
    },

    // ==========================================================
    // PREVIEW VALIDAÇÃO (corrigido)
    // ==========================================================
    _testarEstruturaPreview(code) {
        // Não permitir JS ativo dentro de HTML pré-view
        if (/<script/i.test(code) && /fetch\s*\(/i.test(code)) {
            return {
                ok: false,
                tipo: "preview",
                erro: "JS externo (fetch) não permitido dentro do preview"
            };
        }
        return { ok: true, tipo: "preview" };
    }
};
