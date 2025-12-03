/* ===========================================================
   YUNO 13.0 — PREVIEW ENGINE (CORRIGIDO)
   Assíncrono • Sanitizado • Seguro • Sem I/O bloqueante
   =========================================================== */

const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const diffGenerator = require("../previews/preview-diff");
const analyzer = require("./analyzer-pro");
const riskAnalyzer = require("./risk-analyzer");
const logger = require("./logger");

const PREVIEW_DIR = path.join(__dirname, "../previews/");

// Cria o diretório de previews (async). Guardamos a promise para garantir que
// operações que escrevem aguardem a inicialização do diretório.
const ensureDirPromise = (async () => {
    try {
        await fs.mkdir(PREVIEW_DIR, { recursive: true });
    } catch (err) {
        // Não lançar aqui — só registar. Operações de escrita tratarão erros.
        logger.error("PREVIEW-ENGINE: Falha ao criar diretório de previews", { erro: err?.message });
    }
})();

// Escapa texto para uso em títulos/labels (evita injeção via atributos)
function escapeText(str = "") {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Sanitizador simples e defensivo para HTML de preview antes de servir.
// Remove <script>, <iframe>, <object>, <embed>, e atributos on*.
// Nota: é intencionalmente conservador — remove embeddeds perigosos.
function sanitizeHtml(html = "") {
    if (typeof html !== "string") return "";

    // Remove blocos <script>...</script>
    let out = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");

    // Remove <iframe>, <object>, <embed>, <link rel="import"> e seus conteúdos
    out = out.replace(/<(iframe|object|embed|link)[\s\S]*?>[\s\S]*?<\/\1>/gi, "");
    out = out.replace(/<(iframe|object|embed|link)[^>]*\/?>/gi, "");

    // Remove atributos que começam com "on" (onclick, onerror, etc.)
    out = out.replace(/\son\w+\s*=\s*(["'])(?:\\.|[^\1])*?\1/gi, "");

    // Remove javascript: URIs em href/src
    out = out.replace(/\b(href|src)\s*=\s*["']\s*javascript:[^"']*["']/gi, "");

    // Opcional: strip event handlers like onload=... within tags without quotes
    out = out.replace(/\son\w+\s*=\s*[^\s>]+/gi, "");

    return out;
}

// Gerador de ID forte (128 bits)
function generateId() {
    return crypto.randomBytes(16).toString("hex");
}

module.exports = {

    // Gera o preview — NÃO grava intent cru, só metadados mínimos.
    async generatePreview(intent) {
        // Validar input estritamente
        if (!intent || typeof intent !== "object") {
            throw new Error("Intent inválido: object esperado.");
        }

        // Validar campos mínimos (não assumes mais do que é necessário)
        const targetRaw = (typeof intent.target === "string" && intent.target.trim().length > 0)
            ? intent.target.trim()
            : "Preview";

        // Nunca logar o objecto intent cru — apenas um resumo seguro
        logger.info("PREVIEW-ENGINE: Gerar preview (request)", {
            target: targetRaw,
            tipo: typeof intent.type === "string" ? intent.type : undefined
        });

        // Garantir diretório disponível
        await ensureDirPromise;

        const id = generateId();
        const safeTitle = escapeText(targetRaw);

        // Gera HTML sanitizado (escape das partes inseridas)
        const html = this._buildPreviewHTML(safeTitle);

        // Gerar diagnóstico (defensivo)
        const diagnostic = await this._generateDiagnostic(html);

        // Payload guardado: NÃO incluímos o intent cru.
        const payload = {
            id,
            target: safeTitle,
            html,                // já contém as inserções escapadas
            diagnostic,
            createdAt: Date.now()
        };

        const filePath = path.join(PREVIEW_DIR, `preview-${id}.json`);

        try {
            await fs.writeFile(filePath, JSON.stringify(payload, null, 2), "utf8");
        } catch (err) {
            // Log seguro e lançar para o caller tratar (evita indicar "gerado" quando não foi)
            logger.error("PREVIEW-ENGINE: Falha ao gravar preview no disco", { erro: err?.message, file: filePath });
            throw new Error("Não foi possível salvar o preview.");
        }

        return { id, html, diagnostic };
    },

    // Build do HTML do preview — as entradas do utilizador já devem vir escapadas
    _buildPreviewHTML(tituloEscapado) {
        // tituloEscapado já é seguro para interpolação em HTML
        return `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8"/>
<title>Preview — ${tituloEscapado}</title>
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<style>
    body { background: #0c0c0c; color: #fff; font-family: Arial, sans-serif; padding: 20px; }
    .preview-box { padding: 20px; background: #111; border: 1px solid #333; border-radius: 10px; }
</style>
</head>
<body>
  <h1>Preview: ${tituloEscapado}</h1>
  <div class="preview-box">
    <p>Este é um preview gerado pela YUNO 13.0.</p>
    <p>Ainda não é o conteúdo final.</p>
  </div>
</body>
</html>`;
    },

    // Diagnóstico: usa riskAnalyzer com html. analyzer.scan() é chamado sem args.
    async _generateDiagnostic(html) {
        try {
            let risco = null;
            let analise = null;
            let diff = null;

            // riskAnalyzer pode analisar o HTML diretamente (se suportado)
            try {
                if (riskAnalyzer && typeof riskAnalyzer.scan === "function") {
                    risco = await riskAnalyzer.scan(html);
                }
            } catch (err) {
                logger.error("PREVIEW-ENGINE: riskAnalyzer falhou", { erro: err?.message });
                risco = { error: "riskAnalyzer_failed" };
            }

            // analyzer.scan() — assumimos API sem argumentos
            try {
                if (analyzer && typeof analyzer.scan === "function") {
                    analise = await analyzer.scan();
                }
            } catch (err) {
                logger.error("PREVIEW-ENGINE: analyzer.scan falhou", { erro: err?.message });
                analise = { error: "analyzer_failed" };
            }

            // diffGenerator: chamar defensivamente — se fornecer método compare(prev, new)
            try {
                if (diffGenerator) {
                    if (typeof diffGenerator.compare === "function") {
                        // Não temos versão anterior; gerar diff contra string vazia pode ser pesado.
                        // Podemos pedir ao diffGenerator que faça um diff "light" se suportar um modo seguro.
                        // Fallback: tentar compare(null, html) dentro de try/catch.
                        diff = await diffGenerator.compare(null, html);
                    } else if (typeof diffGenerator.compareSafe === "function") {
                        diff = await diffGenerator.compareSafe(html);
                    } else {
                        diff = null;
                    }
                }
            } catch (err) {
                logger.error("PREVIEW-ENGINE: diffGenerator falhou", { erro: err?.message });
                diff = { error: "diff_failed" };
            }

            return { risco, analise, diff };

        } catch (err) {
            // Nunca deixar o diagnóstico rebentar o fluxo — devolver objecto seguro
            logger.error("PREVIEW-ENGINE: erro-geral no diagnóstico", { erro: err?.message });
            return { risco: null, analise: null, diff: null };
        }
    },

    // Carregar preview: devolve HTML SANITIZADO pronto para injetar num iframe seguro.
    async loadPreviewFrame(id) {
        if (!id || typeof id !== "string") {
            return "<h1>Preview inválido</h1>";
        }

        const filePath = path.join(PREVIEW_DIR, `preview-${id}.json`);
        try {
            const raw = await fs.readFile(filePath, "utf8");
            const parsed = JSON.parse(raw);

            // parsed.html foi gerado pelo nosso _buildPreviewHTML (com campos escapados),
            // mas ainda devemos sanitizar para remover eventuais alterações manuais.
            const safeHtml = sanitizeHtml(parsed.html || "");
            return safeHtml;

        } catch (err) {
            logger.error("PREVIEW-ENGINE: falha ao carregar preview", { id, erro: err?.message });
            return "<h1>Preview não encontrado ou inválido</h1>";
        }
    },

    // Expor função de limpeza para GC de previews antigos (opcional)
    // NOTA: chamar explicitamente se quiseres ativar GC automático.
    async cleanupOldPreviews(maxAgeMs = 1000 * 60 * 60 * 24 * 7) { // 7 dias por defeito
        try {
            await ensureDirPromise;
            const files = await fs.readdir(PREVIEW_DIR);

            const now = Date.now();
            const removed = [];

            for (const f of files) {
                if (!f.startsWith("preview-") || !f.endsWith(".json")) continue;
                const full = path.join(PREVIEW_DIR, f);
                try {
                    const stat = await fs.stat(full);
                    if ((now - stat.mtimeMs) > maxAgeMs) {
                        await fs.unlink(full);
                        removed.push(f);
                    }
                } catch (err) {
                    logger.error("PREVIEW-ENGINE: cleanup erro ao processar ficheiro", { file: f, erro: err?.message });
                }
            }

            return { removed };
        } catch (err) {
            logger.error("PREVIEW-ENGINE: cleanup falhou", { erro: err?.message });
            return { removed: [], error: err?.message };
        }
    }
};
