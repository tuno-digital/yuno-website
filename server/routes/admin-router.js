// =======================================================
// YUNO IA — ADMIN ROUTER (v10.3)
// Painel secreto / Autenticação Admin / Rotas avançadas
// =======================================================

import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { ADMIN_MASTER } from "../ia/admin-token.js";
import fs from "fs";
import path from "path";

const router = express.Router();

// ======================================
// 1) LOGIN DO ADMIN
// ======================================
router.post("/login", async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha)
        return res.status(400).json({ erro: true, message: "Email e senha obrigatórios." });

    if (email !== ADMIN_MASTER.email)
        return res.status(401).json({ erro: true, message: "Credenciais inválidas." });

    const senhaValida = await bcrypt.compare(senha, ADMIN_MASTER.hash);
    if (!senhaValida)
        return res.status(401).json({ erro: true, message: "Senha incorreta." });

    const token = jwt.sign(
        {
            id: ADMIN_MASTER.id,
            email: ADMIN_MASTER.email,
            role: "superadmin"
        },
        ADMIN_MASTER.jwtSecret,
        { expiresIn: "6h" }
    );

    return res.json({
        erro: false,
        message: "Login autorizado.",
        token
    });
});

// ======================================
// 2) MIDDLEWARE — VERIFICAR TOKEN
// ======================================
function validarToken(req, res, next) {
    const header = req.headers.authorization;

    if (!header)
        return res.status(401).json({ erro: true, message: "Token não fornecido." });

    const token = header.split(" ")[1];

    try {
        const decoded = jwt.verify(token, ADMIN_MASTER.jwtSecret);
        req.admin = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ erro: true, message: "Token inválido." });
    }
}

// ======================================
// 3) ROTA — ESTADO DO SISTEMA
// ======================================
router.get("/estado", validarToken, (req, res) => {
    res.json({
        sistema: "YUNO IA — Arena 10.3",
        status: "online",
        memoria: process.memoryUsage(),
        uptime: process.uptime(),
        admin: req.admin.email
    });
});

// ======================================
// 4) LOGS DO SISTEMA (painel)
// ======================================
router.get("/logs", validarToken, (req, res) => {
    const logsPath = path.join(process.cwd(), "secret-admin", "logs", "master.log");

    if (!fs.existsSync(logsPath)) {
        return res.json({ logs: [] });
    }

    const conteudo = fs.readFileSync(logsPath, "utf-8").split("\n");

    res.json({ logs: conteudo });
});

// ======================================
// 5) EXECUTAR COMANDO INTERNO NA IA
// ======================================
import { YUNO_MASTER_CTRL } from "../ia/yuno-master.js";

router.post("/comando", validarToken, async (req, res) => {
    const { comando } = req.body;

    if (!comando)
        return res.status(400).json({ erro: true, message: "Comando vazio." });

    const resposta = await YUNO_MASTER_CTRL.executar(comando);

    res.json({
        erro: false,
        comando,
        resposta
    });
});

// ======================================
// 6) GUARDAR CONFIGURAÇÕES DA IA
// ======================================
router.post("/configs/salvar", validarToken, (req, res) => {
    try {
        const configPath = path.join(process.cwd(), "server", "ia", "yuno-config.json");
        fs.writeFileSync(configPath, JSON.stringify(req.body, null, 2));

        res.json({ erro: false, message: "Configurações guardadas com sucesso." });

    } catch (err) {
        res.status(500).json({ erro: true, message: "Erro ao guardar configurações." });
    }
});

// ======================================
// 7) EXPORTAR ROTAS
// ======================================
export default router;
