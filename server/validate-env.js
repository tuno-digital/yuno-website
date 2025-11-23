// =============================================================
// SAFE ENV CHECK — NÃO CRASHA (YUNO 10.3)
// =============================================================

export default function validateEnv() {
    const required = ["OPENAI_API_KEY"];
    const missing = required.filter(v => !process.env[v]);

    if (missing.length > 0) {
        console.warn("⚠️ Variáveis .env em falta:", missing.join(", "));
        console.warn("⚠️ Yuno vai arrancar em modo offline.");
        return false;
    }

    console.log("✔️ .env validado");
    return true;
}
