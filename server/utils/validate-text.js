// validate-text.js
export default function validateText(input) {
    if (!input || typeof input !== "string") {
        throw new Error("❌ Texto inválido enviado para a validação.");
    }

    return input.trim();
}
