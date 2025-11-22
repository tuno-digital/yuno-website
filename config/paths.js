// ========================================================
// PATHS — YUNO 10.3
// Estrutura oficial de diretórios
// ========================================================

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PATHS = {
    root: path.join(__dirname, ".."),
    server: path.join(__dirname, "..", "server"),
    data: path.join(__dirname, "..", "data"),
    tmp: path.join(__dirname, "..", "tmp"),
    tmpVideos: path.join(__dirname, "..", "tmp", "videos"),
    logs: path.join(__dirname, "..", "logs"),
    integrations: path.join(__dirname, "..", "integrations")
};
