// ===========================================================
// YUNO 13.0 — BUILDER ENGINE (CORRIGIDO)
// Gera blueprints, patches, previews e controla o modo seguro
// NÃO APLICA alterações — apenas prepara
// ===========================================================

const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const crypto = require("crypto");

const diffEngine = require("./diff-engine");
const patchValidator = require("./patch-validator");
const rollbackEngine = require("./rollback-engine");
const templateSandbox = require("./sandbox-runner");

const logger = require("../core/logger");

// Raiz do projeto (correção de path traversal)
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

// Diretórios internos (corrigido — sempre relativo ao ficheiro)
const PATCH_DIR = path.join(__dirname, "patches");
const ROLLBACK_DIR = path.join(__dirname, "rollback");

// Garantir que pastas existem
for (const dir of [PATCH_DIR, ROLLBACK_DIR]) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    }
}

// ===========================================================
// GERA BLUEPRINT (plano técnico)
// ===========================================================
function generateBlueprint(intent) {
    return {
        schemaVersion: "1.0",
        titulo: "Blueprint de Construção 13.0",
        intenção: intent,
        passos: [
            "Analisar intenção",
            "Identificar ficheiro alvo",
            "Gerar conteúdo sugerido",
            "Criar preview seguro",
            "Aguardar aprovação"
        ],
        timestamp: Date.now()
    };
}

// ===========================================================
// SANITIZAR PATH ALVO — impedir escape
// ===========================================================
function sanitizeFilePath(filePath) {
    const abs = path.resolve(PROJECT_ROOT, filePath);

    // Se não estiver dentro do projeto → bloquear
    if (!abs.startsWith(PROJECT_ROOT)) {
        throw new Error("Acesso a ficheiro fora do diretório permitido.");
    }

    return abs;
}

// ===========================================================
// CRIAR PATCH (seguro, atómico, validado)
// ===========================================================
async function createPatch(filePath, newContent) {
    try {
        if (typeof newContent !== "string") {
            return { ok: false, error: "Conteúdo inválido." };
        }

        const absPath = sanitizeFilePath(filePath);

        // Ler original (se existir)
        let original = "";
        if (fs.existsSync(absPath)) {
            // Limite de segurança (10MB)
            const stats = fs.statSync(absPath);
            if (stats.size > 10 * 1024 * 1024) {
                return { ok: false, error: "Ficheiro demasiado grande para patch." };
            }

            original = fs.readFileSync(absPath, "utf8");
        }

        // Criar diffs
        const diff = diffEngine.generateDiff(original, newContent);

        // Validar diff
        const valid = patchValidator.validate(diff);
        if (!valid.ok) {
            return {
                ok: false,
                error: valid.error,
                message: "Diff inválido. Construção bloqueada."
            };
        }

        // ID seguro, impossível de adivinhar
        const randomId = crypto.randomBytes(6).toString("hex");
        const patchId = `patch-${Date.now()}-${randomId}.json`;
        const patchPath = path.join(PATCH_DIR, patchId);

        // Checksum da base — segurança e integridade
        const baseChecksum = crypto
            .createHash("sha256")
            .update(original)
            .digest("hex");

        // Escrever atomicamente
        const tmpPath = patchPath + ".tmp";

        await fsp.writeFile(
            tmpPath,
            JSON.stringify(
                {
                    schemaVersion: "1.0",
                    id: patchId,
                    file: filePath,
                    absPathHash: crypto.createHash("sha256").update(absPath).digest("hex"),
                    baseChecksum,
                    diff,
                    timestamp: Date.now()
                },
                null,
                4
            ),
            { mode: 0o600 }
        );

        await fsp.rename(tmpPath, patchPath);

        logger.info("Patch criado", { patchId, filePath });

        return {
            ok: true,
            patchId,
            patchPath,
            message: "Patch criado e guardado no modo seguro."
        };
    } catch (err) {
        logger.error("Erro ao criar patch", err);
        return { ok: false, error: err.message };
    }
}

// ===========================================================
// GERAR PREVIEW SAFE (HTML isolado)
// ===========================================================
async function generatePreview(html) {
    try {
        if (typeof html !== "string") {
            return { ok: false, error: "Conteúdo inválido." };
        }

        const safe = await templateSandbox.generate(html);

        return {
            ok: true,
            preview: safe.previewHTML,
            report: safe.report
        };
    } catch (err) {
        logger.error("Erro ao gerar sandbox preview", err);
        return { ok: false, error: err.message };
    }
}

// ===========================================================
// EXPORTAR
// ===========================================================
module.exports = {
    generateBlueprint,
    createPatch,
    generatePreview
};
