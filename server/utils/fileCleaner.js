// ===================================================
// FILE CLEANER — YUNO IA 10.3
// Remove vídeos antigos da pasta /tmp/videos
// ===================================================
const fs = require("fs");
const path = require("path");
const logger = require("./logger");

const VIDEO_DIR = path.join(__dirname, "../../tmp/videos");

module.exports = function cleanOldFiles() {
    try {
        if (!fs.existsSync(VIDEO_DIR)) return;

        const files = fs.readdirSync(VIDEO_DIR);

        files.forEach(file => {
            const filePath = path.join(VIDEO_DIR, file);
            const stats = fs.statSync(filePath);

            const ageHours = (Date.now() - stats.mtimeMs) / 1000 / 3600;

            if (ageHours > 6) { // apaga com mais de 6h
                fs.unlinkSync(filePath);
                logger.warn(`Arquivo removido automaticamente: ${file}`);
            }
        });

    } catch (err) {
        logger.error("Erro ao limpar arquivos: " + err.message);
    }
};
