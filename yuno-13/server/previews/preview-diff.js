// ==============================================================
// YUNO 13.0 — PREVIEW DIFF (CORRIGIDO)
// Compatível com preview-engine e seguro para cockpit
// ==============================================================

function toLines(txt) {
    try {
        return String(txt || "")
            .replace(/\r/g, "")
            .split("\n");
    } catch {
        return [String(txt || "")];
    }
}

function sanitize(str) {
    return String(str || "")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function generateDiff(oldHTML, newHTML) {
    const a = toLines(oldHTML);
    const b = toLines(newHTML);

    const changes = [];
    const max = Math.max(a.length, b.length);

    for (let i = 0; i < max; i++) {
        const oldLine = a[i] || "";
        const newLine = b[i] || "";

        if (oldLine !== newLine) {
            changes.push({
                line: i + 1,
                old: sanitize(oldLine),
                new: sanitize(newLine)
            });
        }
    }

    return {
        ok: true,
        totalChanges: changes.length,
        changes,
        timestamp: Date.now()
    };
}

module.exports = {

    // ================================
    // NOVO → Compatível com preview-engine
    // ================================
    compare(oldHTML, newHTML) {
        return generateDiff(oldHTML, newHTML);
    },

    // ================================
    // LEGADO → Mantém compatibilidade com módulos antigos
    // ================================
    diff(oldHTML, newHTML) {
        return generateDiff(oldHTML, newHTML);
    }

};
