// guard.js — versão 10.3
import { adminLogin } from "../server/ia/admin-token.js";

async function enterSecret() {
    const token = document.getElementById("token").value.trim();
    const msg = document.getElementById("msg");

    if (!token) {
        msg.textContent = "⚠️ Insere a chave mestre.";
        return;
    }

    try {
        const res = await fetch("/api/admin/validate-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token })
        });

        const data = await res.json();

        if (data.valid === true) {
            msg.textContent = "✔️ Autorizado";
            msg.style.color = "#00ffea";

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 800);
        } else {
            msg.textContent = "❌ Chave incorreta";
            msg.style.color = "#ff0055";
        }

    } catch (err) {
        msg.textContent = "Erro no servidor.";
    }
}

window.enterSecret = enterSecret;
