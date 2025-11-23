// ===============================================================
// 📄 AUTO REPORT SYSTEM — v10.3
// Guarda relatórios de scans, fixes e upgrades
// ===============================================================

const fs = require("fs");
const path = require("path");

const REPORTS_DIR = path.join(__dirname, "../../..", "data", "reports");

if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR);

function saveAutoReport(data) {
    const filename = new Date().toISOString().replace(/[:.]/g, "-") + ".json";
    const filepath = path.join(REPORTS_DIR, filename);

    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

module.exports = { saveAutoReport };
