// =======================================================
// YUNO IA — ADMIN ROUTER (v10.3 Híbrida)
// Área secreta do Criador • Gestão Master da IA
// =======================================================

import express from "express";
import { verifyAdminToken } from "./admin-token.js";
import { validateSession, createSession } from "./session-guard.js";
import { hasPermission } from "./permissions.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

// ==============================================
// 1 — Validação do Token Mestre (entrada secreta)
// ==============================================
router.post("/validate-token", (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.json({ valid: false, msg: "Token vazio" });
    }

    const valid = verifyAdminToken(token);

    if (valid) {
        const session = createSession("master");
        logger.system("✔️ Acesso secreto autorizado ao criador!");

        return res.json({
            valid: true,
            session
        });
    }

    logger.warn("❌ Tentativa de acesso com token inválido!");

    return res.json({ valid: false });
});

// ==============================================
// 2 — Endpoint da Área Secreta/Dashboard
// ==============================================
router.get("/dashboard", validateSession, (req, res) => {
    if (!hasPermission(req.session.role, "admin_panel")) {
        return res.status(403).json({ erro: "Sem permissão" });
    }

    res.json({
        status: "ok",
        panel: "YUNO Admin Dashboard 10.3",
        version: "10.3",
        features: [
            "Controlo total da IA",
            "Logs internos",
            "Estado da memória",
            "Auto-programação",
            "Configurações secretas"
        ]
    });
});

// ===============================
// 3 — Logs Internos (sala secreta)
// ===============================
router.get("/logs", validateSession, (req, res) => {
    if (!hasPermission(req.session.role, "view_logs")) {
        return res.status(403).json({ erro: "Sem permissão" });
    }

    try {
        const logs = logger.getHistory();
        res.json({ logs });
    } catch (e) {
        res.json({ erro: "Não foi possível carregar logs" });
    }
});

// ==========================================
// 4 — Reset Interno da IA (Uso do Criador)
// ==========================================
router.post("/reset-core", validateSession, (req, res) => {
    if (!hasPermission(req.session.role, "reset_core")) {
        return res.status(403).json({ erro: "Sem permissão" });
    }

    logger.system("⚠️ RESET solicitado pelo criador!");

    return res.json({
        status: "executado",
        msg: "Reset interno agendado."
    });
});

// ==========================================
// 5 — Ver Estado do Sistema
// ==========================================
router.get("/status", validateSession, (req, res) => {
    res.json({
        ia: "online",
        version: "10.3",
        memory: "carregada",
        automacoes: "ativas",
        serverTime: new Date()
    });
});

export default router;
