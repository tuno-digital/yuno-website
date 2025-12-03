// ===========================================================
// YUNO 13.0 — PATCH VALIDATOR (CORRIGIDO)
// Segurança militar aprimorada sem quebrar a lógica existente
// ===========================================================

module.exports = {

    validate(diff) {
        try {

            // ---------------------------------------------------
            // 0) VALIDAÇÃO DE SCHEMA
            // ---------------------------------------------------
            if (!diff || typeof diff !== "object") {
                return { ok: false, error: "Diff inválido: estrutura inexistente." };
            }

            if (!Array.isArray(diff.ops)) {
                return { ok: false, error: "Diff inválido: 'ops' ausente ou inválido." };
            }

            if (typeof diff.unified !== "string") {
                return { ok: false, error: "Unified diff ausente ou inválido." };
            }

            const ops = diff.ops;

            // Contadores básicos
            const totalRem = ops.filter(o => o.op === "rem").length;
            const totalAdd = ops.filter(o => o.op === "add").length;
            const totalEq  = ops.filter(o => o.op === "eq").length;

            const totalOps = totalRem + totalAdd + totalEq;


            // ---------------------------------------------------
            // 1) BLOQUEAR "APAGAR FICHEIRO" REAL (corrigido)
            // antiga regra era frágil
            // ---------------------------------------------------
            const removalRatio = totalRem / Math.max(1, totalOps);

            if (removalRatio > 0.90 && totalEq < 3 && totalAdd < 3) {
                return {
                    ok: false,
                    error: "Patch tenta substituir ou apagar ficheiro quase inteiro. Bloqueado."
                };
            }


            // ---------------------------------------------------
            // 2) DETEÇÃO DE PADRÕES MALICIOSOS (melhorada)
            // normalizamos linha, removemos espaços extras
            // e evitamos falso-positivo por comentários
            // ---------------------------------------------------
            const dangerPatterns = [
                /\brm\s+-rf\b/i,
                /\brimraf\b/i,
                /\bunlink\b/i,
                /\brmdir\b/i,
                /\bdel\s+\S+/i,
                /\bprocess\.exit\b/i,
                /while\s*\(\s*true\s*\)/i,
                /<script>/i,
                /\beval\s*\(/i,
                /\bfunction\s*\(/i,
                /\bchild_process\b/i,
                /\bexec\s*\(/i
            ];

            for (const op of ops) {
                if (op.op !== "add" && op.op !== "rem") continue;

                const line = String(op.line || "")
                    .trim()
                    .toLowerCase();

                // ignorar comentários
                if (line.startsWith("//") || line.startsWith("/*") || line.startsWith("*")) {
                    continue;
                }

                for (const pattern of dangerPatterns) {
                    if (pattern.test(line)) {
                        return {
                            ok: false,
                            error: `Padrão malicioso detectado (${pattern}). Patch bloqueado.`
                        };
                    }
                }
            }


            // ---------------------------------------------------
            // 3) PATCH GIGANTE — threshold de segurança
            // ---------------------------------------------------
            if (totalAdd + totalRem > 3000) {
                return {
                    ok: false,
                    error: "Patch demasiado grande. Risco elevado de destruição acidental."
                };
            }


            // ---------------------------------------------------
            // 4) REMOÇÃO MASSIVA SUSPEITA
            // ---------------------------------------------------
            if (totalRem > 500 && totalAdd < 10) {
                return {
                    ok: false,
                    error: "Remoção massiva sem adições. Possível erro ou ataque."
                };
            }


            // ---------------------------------------------------
            // 5) VALIDAR UNIFIED DIFF CORRETAMENTE
            // ---------------------------------------------------
            const unifiedLines = diff.unified.split("\n");

            if (unifiedLines.length < 3 || !unifiedLines[0].startsWith("---")) {
                return {
                    ok: false,
                    error: "Unified diff inválido ou incompleto."
                };
            }


            // ---------------------------------------------------
            // 6) PASSOU EM TODAS AS REGRAS
            // ---------------------------------------------------
            return { ok: true };

        } catch (err) {
            return { ok: false, error: err.message };
        }
    }
};
