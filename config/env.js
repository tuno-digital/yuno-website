// ========================================================
// ENV VALIDATOR — YUNO IA 10.3
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
        console.error("❌ Variáveis .env em falta:");
        missing.forEach(k => console.error(" → " + k));
        process.exit(1);
    }

    console.log("✅ ENV validado com sucesso (10.3).");
}

