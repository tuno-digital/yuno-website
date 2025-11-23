// ============================================================
// 🔥 YUNO IA — CLIENT 10.3
// Cliente oficial para comunicação com a IA (frontend)
// Compatível com /api/ia/process unificado
// ============================================================

export async function yunoSend(input, userId = "website-user") {

    try {
        // Aceita tanto "prompt" como "message"
        const payload = {
            prompt: input,
            message: input,
            userId
        };

        const res = await fetch("/api/ia/process", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        // Falha de comunicação com o servidor
        if (!res.ok) {
            return "⚠️ Erro ao comunicar com o servidor da YUNO.";
        }

        const data = await res.json();

        // Resposta padrão caso backend retorne vazio
        return data?.resposta || "⚠️ A Yuno não conseguiu gerar resposta.";
    }

    catch (err) {
        console.error("[YUNO_CLIENT_10.3] ERRO:", err);
        return "❌ Falha de comunicação com a IA.";
    }
}
