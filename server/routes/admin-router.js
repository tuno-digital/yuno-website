
// ==============================================
// 📜 LOGS — Listar
// ==============================================
router.get("/logs", (req, res) => {
    const logs = readLogs();
    res.json({ logs });
});

// ==============================================
// 🧨 LOGS — Limpar
// ==============================================
router.post("/clear-logs", (req, res) => {
    const ok = clearLogs();

    if (!ok) {
        return res.status(500).json({ erro: true, msg: "Falha ao limpar logs" });
    }

    addLog("🧹 Logs limpos pelo administrador.");
    res.json({ msg: "Todos os logs foram limpos." });
});
