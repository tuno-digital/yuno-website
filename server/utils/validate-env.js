// =============================================================
// 🟦 YUNO IA — Validação de variáveis .env — v10.3
// =============================================================

export default function validateEnv() {
    const required = ["OPENAI_API_KEY"];

    const missing = required.filter(v => !process.env[v]);

    if (missing.length > 0) {
        console.error("❌ Variáveis .env em falta:", missing.join(", "));
        process.exit(1);
    }

    console.log("✔️ Ambiente .env validado com sucesso");
}
