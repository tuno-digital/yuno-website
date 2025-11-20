// integração HEYGEN 9.0 — auditada e corrigida

const fetch = require("node-fetch");

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

async function generateVideo(prompt) {
    // 1) validação da API key
    if (!HEYGEN_API_KEY) {
        console.warn("⚠️ HEYGEN_API_KEY não encontrada no .env");
        return null;
    }

    // 2) validação básica do prompt
    if (!prompt || typeof prompt !== "string") {
        console.warn("⚠️ Prompt inválido para generateVideo");
        return null;
    }

    try {
        const response = await fetch("https://api.heygen.com/v1/video/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                // 3) Authorization corrigido (string + template literal)
                "Authorization": `Bearer ${HEYGEN_API_KEY}`
            },
            body: JSON.stringify({
                prompt: prompt,
                duration: 5,
                resolution: "720p"
            })
        });

        // 4) verifica se a resposta da API foi OK
        if (!response.ok) {
            const errorText = await response.text().catch(() => "");
            console.error("HEYGEN API ERROR:", response.status, errorText);
            return null;
        }

        const data = await response.json();

        // 5) compatibilidade com vários formatos de resposta
        const videoUrl =
            data.video_url ||
            (data.result && data.result.video_url) ||
            null;

        // 6) garante que veio URL válido
        if (!videoUrl) {
            console.error("HEYGEN: resposta sem video_url válida:", data);
            return null;
        }

        // 7) tudo certo → devolve URL do vídeo
        return videoUrl;

    } catch (err) {
        // 8) tratamento de erro mais explícito
        console.error("HEYGEN ERROR (fetch falhou):", err);
        return null;
    }
}

module.exports = { generateVideo };
