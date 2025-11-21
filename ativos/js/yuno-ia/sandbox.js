// yuno-ia/sandbox.js
// Sandbox seguro para validar e testar código — YUNO 10.3 REAL MODE

export const YUNO_SANDBOX = {

    // ==========================================
    // 1) Testar ERROS DE SINTAXE
    // ==========================================
    testarCodigo(codigo) {
        try {
            new Function(codigo); // apenas verifica sintaxe
            return { ok: true, erro: null };
        } catch (err) {
            return { ok: false, erro: err.toString() };
        }
    },

    // ==========================================
    // 2) Execução controlada (isolada)
    //    Preparado para 10.4, mas já funciona
    // ==========================================
    testarExecucao(codigo) {
        try {
            const fn = new Function(`
                "use strict";
                try {
                    ${codigo}
                    return true;
                } catch(e) {
                    return e.toString();
                }
            `);

            const resultado = fn();

            if (resultado === true) {
                return { ok: true, resultado: "Executado sem erros." };
            } else {
                return { ok: false, erro: resultado };
            }

        } catch (err) {
            return { ok: false, erro: err.toString() };
        }
    },

    // ==========================================
    // 3) Validação de segurança — impede código perigoso
    // ==========================================
    validarSeguranca(codigo) {

        const proibidos = [
            "eval(",
            "import(",
            "while(true)",
            "for(;;)",
            "XMLHttpRequest",
            "fetch(",
            "document.write",
            "window.location",
            "delete window",
            "localStorage.clear(",
            "indexedDB.deleteDatabase",
            "await import",
            "setInterval(",
            "setTimeout(",
        ];

        for (const palavra of proibidos) {
            if (codigo.includes(palavra)) {
                return {
                    ok: false,
                    erro: `⚠️ Código inseguro detectado: "${palavra}"`
                };
            }
        }

        return { ok: true };
    },

    // ==========================================
    // 4) Validação completa usada pelo Executor 10.3
    // ==========================================
    validarTudo(codigo) {

        // 1) Teste de sintaxe
        const sintaxe = this.testarCodigo(codigo);
        if (!sintaxe.ok) return sintaxe;

        // 2) Teste de segurança
        const seguro = this.validarSeguranca(codigo);
        if (!seguro.ok) return seguro;

        return { ok: true };
    }
};
