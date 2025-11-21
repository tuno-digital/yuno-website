const fetch = require("node-fetch");

const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY || "COLOCA_AQUI_A_CHAVE";

async function generateVideo(prompt) {
    try {
        const response = await fetch("https://api.runwayml.com/v1/gen2", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": Bearer ${RUNWAY_API_KEY}
            },
            body: JSON.stringify({
                prompt,
                mode: "text-to-video",
                duration: 5,
                size: "1280x720"
            })
        });

        const data = await response.json();

        // Compatibilidade com diferentes formatos da API
        return data?.output?.video_url || null;

    } catch (err) {
        console.error("ERRO RUNWAY:", err);
        return null;
    }
}

module.exports = { generateVideo };