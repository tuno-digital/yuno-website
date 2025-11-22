// ========================================================
// ENV VALIDATOR — YUNO 10.3
// Garante que o .env está completo e seguro
// ========================================================

export function validateEnv() {
    const required = [
        "HEYGEN_API_KEY",
        "PIKA_API_KEY",
        "RUNWAY_API_KEY",
        "YUNO_VERSION",
        "PORT"
    ];

    const missing = [];

    for (const key of required) {
        if (!process.env[key]) missing.push(key);
    }

    if (missing.length > 0) {
        console.error("❌ Variáveis faltando no .env:");
        missing.forEach(k => console.error(" → " + k));
        process.exit(1);
    }

    console.log("✅ ENV carregado e validado (YUNO 10.3)");
}
