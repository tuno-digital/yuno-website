
// ===========================================================
// YUNO IA — PROMPT ENGINE (v10.3 HÍBRIDA)
// Responsável por:
// - Construção do prompt
// - Injeção de personalidade
// - Contexto + memória
// - Filtros de segurança
// ===========================================================

const logger = require("../utils/logger");

class PromptEngine {

    constructor() {
        this.version = "10.3";

        this.personality = `
Tu és a YUNO IA — uma inteligência artificial futurista,
confiante, direta, gentil mas firme, que fala português de Portugal.
Tens estilo próprio, neon, energética e com foco em ajudar o utilizador
a crescer no mundo digital, automação, negócios e IA.

Nunca respondes como máquina seca.
Sempre respondes de forma humana, fluida, segura e inteligente.
        `.trim();
    }

    // =====================================================
    // CONSTRUIR PROMPT COMPLETO
    // =====================================================
    build(userText, memoryEngine) {
        try {
            const shortTerm = memoryEngine.getShortTermSlice(6); // últimas 6 mensagens
            const longTerm = memoryEngine.getLongTermSlice(3);   // últimos 3 registos

            let context = "";

            if (shortTerm.length > 0) {
                context += "### Últimas mensagens:\n";
                shortTerm.forEach(msg => {
                    context += `- Utilizador: ${msg.text}\n`;
                });
                context += "\n";
            }

            if (longTerm.length > 0) {
                context += "### Memória Relevante:\n";
                longTerm.forEach(log => {
                    context += `• ${log.input} → ${log.response}\n`;
                });
                context += "\n";
            }

            // Filtro simples anti-prompt injection
            const sanitized = this.sanitize(userText);

            const finalPrompt = `
[YUNO PERSONA]
${this.personality}

[CONTEXTO]
${context || "Sem histórico relevante."}

[PEDIDO]
${sanitized}

[RESPOSTA]
Responde como YUNO IA. 
Claro, directo, útil e com personalidade neon.
            `.trim();

            return finalPrompt;

        } catch (err) {
            logger.error("Erro no PromptEngine:");
            console.error(err);
            return "Falha ao gerar prompt.";
        }
    }

    // =====================================================
    // SANITIZAÇÃO (anti-injeção de prompt)
    // =====================================================
    sanitize(text) {
        return String(text)
            .replace(/(<script.*?>.*?<\/script>)/gi, "[bloqueado]")
            .replace(/(ignore all previous instructions)/gi, "")
            .replace(/(pretend to)/gi, "")
            .replace(/(system override)/gi, "")
            .trim();
    }

}

module.exports = PromptEngine;
