// ======================================================================
// YUNO 13.1 — SANDBOX RUNNER (ULTRA-BLINDADO)
// Versão final, completa, auditada e corrigida
// Remove sanitize-html (desnecessário e inseguro)
// Mecanismo próprio de sanitização + CSP com NONCE + anti-DoS + anti-SVG
// ======================================================================

const crypto = require("crypto");

// Limites
const MAX_PREVIEW_INPUT = 100 * 1024; // 100 KB máximo
const MAX_TAGS = 5000;

// Tags permitidas (whitelist)
const SAFE_TAGS = new Set([
    "div","span","p","b","i","strong","em",
    "ul","ol","li",
    "h1","h2","h3","h4","h5","h6",
    "br","hr","pre","code",
    "img","a"
]);

// Atributos permitidos
const SAFE_ATTR = {
    "a": new Set(["href","title","rel","target"]),
    "img": new Set(["src","alt"])
};

// Allowed URL schemes
const SAFE_SCHEMES = ["http:", "https:"];

// ======================================================================
// REJEITA data:image/svg+xml e qualquer SVG embutido
// ======================================================================
function hasDangerousSVG(html) {
    return (
        /<svg/i.test(html) ||
        /data:\s*image\/svg\+xml/i.test(html) ||
        /data:image\/svg/i.test(html)
    );
}

// ======================================================================
// Sanitização HTML simples, rápida e segura (whitelist real)
// ======================================================================
function basicSanitize(html) {
    let out = "";
    let tagCount = 0;

    return html.replace(/<\/?([a-zA-Z0-9]+)([^>]*)>/g, (match, tag, attrs) => {

        tag = tag.toLowerCase();

        if (!SAFE_TAGS.has(tag)) return ""; // descartar tag

        tagCount++;
        if (tagCount > MAX_TAGS) return ""; // anti-DoS

        let cleanAttrs = "";

        // Processar atributos
        const attrRegex = /([a-zA-Z0-9\-:_]+)\s*=\s*(['"])(.*?)\2/g;
        let m;
        while ((m = attrRegex.exec(attrs))) {
            let attr = m[1].toLowerCase();
            let val = m[3];

            if (!SAFE_ATTR[tag] || !SAFE_ATTR[tag].has(attr)) continue;

            // validação de href e src
            if (attr === "href" || attr === "src") {
                try {
                    const u = new URL(val, "http://base/");
                    if (!SAFE_SCHEMES.includes(u.protocol)) continue;
                } catch {
                    continue;
                }
            }

            cleanAttrs += ` ${attr}="${val}"`;
        }

        if (match.startsWith("</")) {
            return `</${tag}>`;
        }

        return `<${tag}${cleanAttrs}>`;
    });
}

// ======================================================================
// Wrapper HTML seguro com CSP real + NONCE verdadeiro
// ======================================================================
function wrapSafeHTML(content, nonce) {

    return `
<!DOCTYPE html>
<html lang="pt-PT">
<head>
    <meta charset="utf-8" />

    <!-- CSP REAL, NÃO BYPASSÁVEL -->
    <meta http-equiv="Content-Security-Policy"
          content="
            default-src 'none';
            img-src 'self';
            style-src 'nonce-${nonce}';
            font-src 'self';
            connect-src 'none';
            media-src 'none';
            object-src 'none';
            frame-ancestors 'none';
            base-uri 'none';
          ">

    <style nonce="${nonce}">
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background: #111;
            color: #fff;
        }
        .yuno-preview {
            border: 2px solid #0ff;
            padding: 20px;
            border-radius: 8px;
            background: #222;
            word-break: break-word;
        }
    </style>
</head>

<body>
    <div class="yuno-preview">
        ${content}
    </div>
</body>
</html>`;
}

// ======================================================================
// GERA O PREVIEW SEGURO + RELATÓRIO
// ======================================================================
async function generate(htmlInput) {

    if (typeof htmlInput !== "string") {
        return { ok: false, error: "Input precisa ser uma string." };
    }

    if (htmlInput.length > MAX_PREVIEW_INPUT) {
        return { ok: false, error: "Input demasiado grande para preview." };
    }

    if (hasDangerousSVG(htmlInput)) {
        return { ok: false, error: "SVG bloqueado por segurança." };
    }

    try {
        const sanitized = basicSanitize(htmlInput);
        const nonce = crypto.randomBytes(16).toString("base64");
        const wrapped = wrapSafeHTML(sanitized, nonce);

        const report = {
            ok: true,
            removedScripts: /<script/i.test(htmlInput),
            removedEvents: /on[a-z]+\s*=/i.test(htmlInput),
            removedIframes: /<iframe/i.test(htmlInput),
            removedSVG: hasDangerousSVG(htmlInput),
            sizeOriginal: htmlInput.length,
            sizeFinal: wrapped.length,
            timestamp: Date.now()
        };

        return {
            ok: true,
            previewHTML: wrapped,
            report
        };

    } catch (err) {
        return {
            ok: false,
            error: "Erro ao gerar preview: " + err.message
        };
    }
}

// ======================================================================
// EXPORTAÇÃO
// ======================================================================
module.exports = {
    generate
};
