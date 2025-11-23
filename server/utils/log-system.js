// =========================================================
// LOG SYSTEM — YUNO IA 10.3
// Sistema de logs completo para a Sala Secreta (Admin)
// =========================================================

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho dos logs
const LOG_FILE = path.join(__dirname, "..", "..", "secret-admin", "logs.txt");

// Função interna para formatar timestamp
function timestamp() {
    return new Date().toISOString().replace("T", " ").split(".")[0];
}

// =============================================
// 🔵 ESCREVER LOG
// =============================================
export function addLog(msg) {
    const linha = `[${timestamp()}] ${msg}\n`;

    try {
        fs.appendFileSync(LOG_FILE, linha, "utf8");
    } catch (err) {
        console.error("Erro ao gravar log:", err);
    }
}

// =============================================
// 🔵 LER LOGS
// =============================================
export function readLogs() {
    try {
        if (!fs.existsSync(LOG_FILE)) return [];
        const data = fs.readFileSync(LOG_FILE, "utf8");
        return data.split("\n").filter(l => l.trim() !== "");
    } catch (err) {
        console.error("Erro ao ler logs:", err);
        return [];
    }
}

// =============================================
// 🔴 APAGAR LOGS
// =============================================
export function clearLogs() {
    try {
        fs.writeFileSync(LOG_FILE, "", "utf8");
        return true;
    } catch (err) {
        console.error("Erro ao limpar logs:", err);
        return false;
    }
}
