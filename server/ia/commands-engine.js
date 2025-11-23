
// ===============================================================
// YUNO IA — COMMAND ENGINE (v10.3 HÍBRIDA)
// Interpretação de comandos + execução de ações reais
// ===============================================================

const MemoryEngine = require("./memory-engine");
const logger = require("../utils/logger");
const fetch = require("node-fetch");

class CommandEngine {

    constructor() {
        this.version = "10.3";
        this.memory = new MemoryEngine();

        // Lista base de comandos
        this.commands = {
            "saudacao": /^(olá|oi|hey|yuno)$/i,
            "lembrar": /^memoriza (.*)/i,
            "esquecer": /^esquece (.*)/i,
            "video": /^gerar video (.*)/i,
            "resumo": /^resume (.*)/i,
            "funil": /^criar funil (.*)/i,
            "post": /^gerar post (.*)/i,
            "query": /^pesquisa (.*)/i
        };
    }

    // ===========================================================
    // EXECUTOR GLOBAL — ponto central que recebe textos do user
    // ===========================================================
    async execute(userText) {
        logger.info("Executando comando: " + userText);

        this.memory.pushShortTerm(userText);

        // SAUDAÇÃO
        if (this.commands.saudacao.test(userText)) {
            return "Olá! Sou a Yuno IA. Como posso ajudar hoje? ✨";
        }

        // MEMORIZAR ALGO
        const lembrar = userText.match(this.commands.lembrar);
        if (lembrar) {
            const conteudo = lembrar[1].trim();
            this.memory.pushLongTerm("MEMORIZAR: " + conteudo, "OK");
            return `Informação memorizada: “${conteudo}”`;
        }

        // ESQUECER
        const esquecer = userText.match(this.commands.esquecer);
        if (esquecer) {
            const alvo = esquecer[1].trim();
            this.memory.longTerm = this.memory.longTerm.filter(
                m => !m.input.includes(alvo) && !m.response.includes(alvo)
            );
            this.memory.savePersistentMemory();
            return `Informação removida da memória: “${alvo}”`;
        }

        // GERAR VÍDEO
        const video = userText.match(this.commands.video);
        if (video) {
            const prompt = video[1].trim();
            return await this.generateVideo(prompt);
        }

        // CRIAR POST
        const post = userText.match(this.commands.post);
        if (post) {
            const assunto = post[1].trim();
            return this.gerarPost(assunto);
        }

        // FUNIL
        const funil = userText.match(this.commands.funil);
        if (funil) {
            const tema = funil[1].trim();
            return this.gerarFunil(tema);
        }

        // PESQUISA (placeholder)
        const pesquisa = userText.match(this.commands.query);
        if (pesquisa) {
            return "🔍 Sistema de pesquisa ainda não implementado (previsto para 10.5).";
        }

        // Se não identificou comando → responder como IA
        return await this.respostaIA(userText);
    }

    // ===========================================================
    // IA DEFAULT (placeholder) — substituído pelo módulo LLM real
    // ===========================================================
    async respostaIA(texto) {
        const memoriaCurta = this.memory.getShortTermSlice(5);
        const memoriaLonga = this.memory.getLongTermSlice(3);

        return `
🤖 *Resposta IA (Versão simplificada 10.3)*  
O módulo LLM ainda não está ativo, mas já recebi a tua mensagem:

**"${texto}"**

Contexto:
- Memória curta: ${memoriaCurta.length} itens
- Memória longa: ${memoriaLonga.length} itens

Assim que ativarmos o LLM (gpt-YUNO), a resposta virá perfeita.
        `.trim();
    }

    // ===========================================================
    // GERAR VÍDEO — usa a API interna
    // ===========================================================
    async generateVideo(prompt) {
        try {
            const result = await fetch("http://localhost:3001/api/video/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt,
                    engine: "heygen" // padrão, depois podemos trocar
                })
            });

            const json = await result.json();

            if (!json.video) return "❌ Não consegui gerar o vídeo. Tenta outro prompt.";

            return `🎬 Vídeo gerado com sucesso:\n${json.video}`;

        } catch (err) {
            logger.error("Erro ao gerar vídeo: " + err);
            return "❌ Erro ao gerar vídeo. Ver logs.";
        }
    }

    // ===========================================================
    // GERAR POST — mini sistema 10.3
    // ===========================================================
    gerarPost(tema) {
        return `
📝 *Post gerado pela Yuno IA 10.3*

✨ Tema: **${tema}**

➡️ "Transforma o teu negócio com automação e IA. A Yuno cria conteúdos,
funis e estratégias com base nos teus objetivos. O futuro começa hoje."

⚡ Este é o modo simplificado. O modo avançado será ativado quando
ligarmos o módulo LLM verdadeiro.`;
    }

    // ===========================================================
    // GERAR FUNIL — modo simplificado
    // ===========================================================
    gerarFunil(tema) {
        return `
🌀 *Funil criado pela Yuno IA — v10.3*

🎯 Tema: **${tema}**

1️⃣ Captação — anúncio e página de captura gerados  
2️⃣ Nutrição — sequência automática de mensagens  
3️⃣ Conversão — página de oferta + CTA  
4️⃣ Retenção — follow-up automático  

🚀 Quando o LLM estiver ativo, o funil será criado COMPLETO.`;
    }

}

module.exports = CommandEngine;
