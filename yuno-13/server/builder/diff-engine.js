// ===========================================================
// YUNO 13.0 — DIFF ENGINE (CORRIGIDO)
// Gera diffs linha-a-linha e unified diff seguro e consistente
// ===========================================================

/**
 * Normaliza texto para array de linhas
 * @param {string} txt
 * @returns {string[]}
 */
function toLines(txt) {
    if (txt === null || txt === undefined) return [];
    return String(txt).replace(/\r/g, "").split("\n");
}

/**
 * Diferenças usando LCS linha-a-linha
 * @param {string[]} a
 * @param {string[]} b
 * @returns {Array<{op:'eq'|'add'|'rem', line:string}>}
 */
function lineDiff(a, b) {

    // Proteção: recusar diffs gigantes (evita crash por memória O(n*m))
    const MAX_LINES = 20000;
    if (a.length + b.length > MAX_LINES) {
        throw new Error("Diff demasiado grande — limite de segurança YUNO 13.0.");
    }

    const n = a.length;
    const m = b.length;

    // DP LCS
    const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

    for (let i = n - 1; i >= 0; --i) {
        for (let j = m - 1; j >= 0; --j) {
            dp[i][j] = (a[i] === b[j])
                ? 1 + dp[i + 1][j + 1]
                : Math.max(dp[i + 1][j], dp[i][j + 1]);
        }
    }

    const ops = [];
    let i = 0, j = 0;

    while (i < n && j < m) {
        if (a[i] === b[j]) {
            ops.push({ op: "eq", line: a[i] });
            i++; j++;
        } else if (dp[i + 1][j] >= dp[i][j + 1]) {
            ops.push({ op: "rem", line: a[i] });
            i++;
        } else {
            ops.push({ op: "add", line: b[j] });
            j++;
        }
    }

    while (i < n) { ops.push({ op: "rem", line: a[i++] }); }
    while (j < m) { ops.push({ op: "add", line: b[j++] }); }

    return ops;
}

/**
 * Gera unified diff seguro
 * Corrige hunk count = 0 e ranges inválidos
 * Mantém EXACTAMENTE o mesmo comportamento da Yuno
 */
function generateUnified(ops, aName = "original", bName = "modified") {

    const out = [];
    out.push(`--- ${aName}`);
    out.push(`+++ ${bName}`);

    let aLine = 1, bLine = 1;
    let hunkLines = [];
    let aStart = null, bStart = null;
    let aCount = 0, bCount = 0;

    function flush() {
        if (!hunkLines.length) return;

        // Garantir ranges válidos
        const aC = Math.max(0, aCount);
        const bC = Math.max(0, bCount);

        // Formato recomendado: start,count
        out.push(`@@ -${aStart},${aC} +${bStart},${bC} @@`);
        out.push(...hunkLines);

        hunkLines = [];
        aStart = bStart = null;
        aCount = bCount = 0;
    }

    for (const op of ops) {

        if (op.op === "eq") {
            if (hunkLines.length) flush();

            out.push(" " + op.line);
            aLine++;
            bLine++;
            continue;
        }

        if (hunkLines.length === 0) {
            aStart = aLine;
            bStart = bLine;
        }

        if (op.op === "rem") {
            hunkLines.push("-" + op.line);
            aLine++;
            aCount++;
        }

        else if (op.op === "add") {
            hunkLines.push("+" + op.line);
            bLine++;
            bCount++;
        }
    }

    flush();
    return out.join("\n");
}

/**
 * Resumo quantitativo
 */
function summaryFromOps(ops) {
    let added = 0, removed = 0;
    for (const o of ops) {
        if (o.op === "add") added++;
        if (o.op === "rem") removed++;
    }
    return {
        added,
        removed,
        changed: Math.min(added, removed)
    };
}

/**
 * API principal
 */
function generateDiff(original, modified, opts = {}) {
    try {

        if (typeof original !== "string") original = String(original || "");
        if (typeof modified !== "string") modified = String(modified || "");

        const a = toLines(original);
        const b = toLines(modified);

        const ops = lineDiff(a, b);
        const unified = generateUnified(
            ops,
            opts.originalName || "original",
            opts.modifiedName || "modified"
        );

        return {
            ok: true,
            ops,
            unified,
            summary: summaryFromOps(ops),
            meta: {
                originalLines: a.length,
                modifiedLines: b.length,
                generatedAt: Date.now()
            }
        };

    } catch (err) {
        return { ok: false, error: String(err) };
    }
}

module.exports = {
    generateDiff
};
