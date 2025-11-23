// ======================================================
// YUNO VIDEO ROUTER (ESM VERSION)
// ======================================================

import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
    res.json({
        ok: true,
        message: "Rota de vídeo ativa (placeholder)."
    });
});

export default router;
