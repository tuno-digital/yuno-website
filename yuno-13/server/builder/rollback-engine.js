// ===========================================================
// YUNO 13.0 — ROLLBACK ENGINE (CORRIGIDO & BLINDADO)
// Snapshots com integridade, atomicidade e proteção total
// ===========================================================

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const logger = require("../core/logger");

// Raiz do projeto (proteção contra path traversal)
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

// Pasta onde ficam snapshots
const ROLLBACK_DIR = path.join(__dirname, "rollback");

// Garantir diretório
fs.mkdirSync(ROLLBACK_DIR, { recursive: true });

// Limite (proteção)
const MAX_SNAPSHOT_MB = 10; // evita snapshots gigantes sem querer


// ===========================================================
// 🔹 Criar checksum SHA256
// ===========================================================
function checksum(data) {
    return crypto.createHash("sha256").update(data || "", "utf8").digest("hex");
}


// ===========================================================
// 🔹 Criar snapshot seguro
// ===========================================================
function createSnapshot(filePath) {
    try {
        const abs = path.resolve(filePath);

        // Bloquear paths fora do projeto
        if (!abs.startsWith(PROJECT_ROOT)) {
            return { ok: false, error: "Caminho fora do projeto. Snapshot bloqueado." };
        }

        // Ler ficheiro (sem existsSync → TOCTOU fix)
        let originalContent = "";
        try {
            originalContent = fs.readFileSync(abs, "utf8");
        } catch (e) {
            if (e.code !== "ENOENT") throw e;
            originalContent = "";
        }

        // Proteger tamanho
        const bytes = Buffer.byteLength(originalContent, "utf8");
        const mb = bytes / (1024 * 1024);

        if (mb > MAX_SNAPSHOT_MB) {
            return {
                ok: false,
                error: `Snapshot excede ${MAX_SNAPSHOT_MB} MB (tamanho atual: ${mb.toFixed(2)} MB).`
            };
        }

        // Criar ID seguro
        const snapId = `rollback-${Date.now()}-${crypto.randomBytes(5).toString("hex")}.json`;
        const snapPath = path.join(ROLLBACK_DIR, snapId);

        const payload = {
            id: snapId,
            file: filePath,          // path ORIGINAL solicitado
            absPath: abs,            // path absoluto validado
            checksum: checksum(originalContent),
            originalContent,
            createdAt: Date.now()
        };

        // Gravação atómica
        const tmp = snapPath + ".tmp";
        fs.writeFileSync(tmp, JSON.stringify(payload, null, 4), { mode: 0o600 });
        fs.renameSync(tmp, snapPath);

        logger.info("Snapshot criado", { snapId, file: filePath });

        return { ok: true, snapId, snapPath };

    } catch (err) {
        logger.error("Erro ao criar snapshot", err);
        return { ok: false, error: err.message };
    }
}


// ===========================================================
// 🔹 Aplicar rollback com validação de integridade
// ===========================================================
function applyRollback(snapId) {
    try {
        const snapPath = path.join(ROLLBACK_DIR, snapId);

        if (!fs.existsSync(snapPath)) {
            return { ok: false, error: "Snapshot não encontrado." };
        }

        const snap = JSON.parse(fs.readFileSync(snapPath, "utf8"));
        const target = path.resolve(snap.file);

        // Proteger path traversal
        if (!target.startsWith(PROJECT_ROOT)) {
            return { ok: false, error: "Rollback bloqueado: ficheiro fora do projeto." };
        }

        // Validar integridade
        if (checksum(snap.originalContent) !== snap.checksum) {
            return {
                ok: false,
                error: "Snapshot corrompido. Checksum inválido. Rollback abortado."
            };
        }

        // Escrita atómica
        const tmp = target + ".tmp-rollback";
        fs.writeFileSync(tmp, snap.originalContent, "utf8");
        fs.renameSync(tmp, target);

        logger.info("Rollback aplicado", { snapId, file: snap.file });

        return { ok: true, file: snap.file, message: "Rollback aplicado com sucesso." };

    } catch (err) {
        logger.error("Erro ao aplicar rollback", err);
        return { ok: false, error: err.message };
    }
}


// ===========================================================
// 🔹 Listar snapshots (META-ONLY) — sem originalContent
// ===========================================================
function listSnapshots() {
    try {
        const files = fs.readdirSync(ROLLBACK_DIR);

        const snaps = files.map(f => {
            try {
                const raw = JSON.parse(
                    fs.readFileSync(path.join(ROLLBACK_DIR, f), "utf8")
                );

                // Remover conteúdo sensível na listagem
                return {
                    id: raw.id,
                    file: raw.file,
                    createdAt: raw.createdAt,
                    sizeBytes: Buffer.byteLength(raw.originalContent || "", "utf8"),
                    checksum: raw.checksum
                };

            } catch {
                return null;
            }
        }).filter(Boolean);

        return { ok: true, snapshots: snaps };

    } catch (err) {
        return { ok: false, error: err.message };
    }
}


// ===========================================================
// EXPORTAÇÃO
// ===========================================================
module.exports = {
    createSnapshot,
    applyRollback,
    listSnapshots
};
