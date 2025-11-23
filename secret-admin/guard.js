
// ================================
// YUNO SECRET ADMIN — GUARD 10.3
// Proteção da Sala Secreta
// ================================

async function enterSecret() {
    const token = document.getElementById("token").value.trim();
    const msg = document.getElementById("msg");

    if (!token) {
        msg.textContent = "Introduz a chave mestre.";
        msg.style.color = "var(--danger)";
        return;
    }

    const req = await fetch("/api/admin/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
    });

    const res = await req.json();

    if (res?.valid === true) {
        window.location.href = "control.html";
    } else {
        msg.textContent = "Chave incorreta.";
        msg.style.color = "var(--danger)";
    }
}
