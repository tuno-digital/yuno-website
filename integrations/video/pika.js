// integração HEYGEN 9.0 — auditada e corrigida

const fetch = require("node-fetch");

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const HEYGEN_ENDPOINT = "https://api.heygen.com/v1/video/generate";

async function generateVideo(prompt) {
    // 1) validação da API key
    if (!HEYGEN_API_KEY) {
        console.warn("HEYGEN_API_KEY não encontrada no .env");
        return null;
    }

    // 2) validação básica do prompt
    if (!prompt || typeof prompt !== "string") {
        console.warn("Prompt inválido para generateVideo");
        return null;
    }

    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) {
        console.warn("Prompt vazio após trim");
        return null;
    }

    try {
        const response = await fetch(HEYGEN_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${HEYGEN_API_KEY}`
            },
            body: JSON.stringify({
                prompt: cleanPrompt,
                duration: 5,
                resolution: "720p"
                // aqui depois adicionas os campos obrigatórios da Heygen:
                // avatar_id, voice_id, etc.
            })
        });

        // 3) verifica se a resposta da API foi OK
        if (!response.ok) {
            let errorText = "";
            try {
                errorText = await response.text();
            } catch (e) {
                errorText = "Falha ao ler corpo do erro";
            }
            console.error("HEYGEN API ERROR:", response.status, errorText);
            return null;
        }

        let data;
        try {
            data = await response.json();
        } catch (e) {
            console.error("HEYGEN JSON PARSE ERROR:", e);
            return null;
        }

        // 4) compatibilidade com vários formatos de resposta
        const videoUrl =
            data.video_url ||
            (data.result && data.result.video_url) ||
            null;

        // 5) garante que veio URL válido
        if (!videoUrl || typeof videoUrl !== "string") {
            console.error("HEYGEN: resposta sem video_url válida:", data);
            return null;
        }

        // 6) tudo certo -> devolve URL do vídeo
        return videoUrl;

    } catch (err) {
        // 7) tratamento de erro mais explícito
        console.error("HEYGEN ERROR (fetch falhou):", err);
        return null;
    }
}

module.exports = { generateVideo };
