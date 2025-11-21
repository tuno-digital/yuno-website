require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Importar integrações
const heygen = require("../integrations/video/heygen");
const pika = require("../integrations/video/pika");
const runway = require("../integrations/video/runwayml");

const app = express();
app.use(cors());
app.use(express.json());

// Rota principal de geração de vídeo
app.post("/api/video/generate", async (req, res) => {
    try {
        const { prompt, engine } = req.body;

        if (!prompt) {
            return res.status(400).json({ erro: "Prompt é obrigatório." });
        }

        let result = null;

        if (engine === "heygen") {
            result = await heygen.generateVideo(prompt);
        } else if (engine === "pika") {
            result = await pika.generateVideo(prompt);
        } else if (engine === "runway") {
            result = await runway.generateVideo(prompt);
        } else {
            return res.status(400).json({ erro: "Engine inválido." });
        }

        return res.status(200).json({ video: result });

    } catch (erro) {
        console.error("Erro no servidor:", erro);
        return res.status(500).json({ erro: "Erro interno no servidor." });
    }
});

// Inicialização do servidor
const PORT = process.env.PORTO || 3001;

app.listen(PORT, () => {
    console.log("Servidor de vídeo YUNO online na porta " + PORT);
});
