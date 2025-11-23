// ============================================================
// YUNO IA — CLIENT 10.3
// Envia mensagens do site para o servidor IA
// ============================================================

export async function yunoSend(message) {
    try {
        const res = await fetch("/api/ia/message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message,
                userId: "website-user"
            })
        });

        const data = await res.json();
        return data.resposta || "Erro ao receber resposta.";

    } catch (err) {
        console.error("YUNO CLIENT ERROR:", err);
        return "Falha ao comunicar com a IA.";
    }
}
