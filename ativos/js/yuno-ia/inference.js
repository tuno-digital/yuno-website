// yuno-ia/inference.js
// Módulo de inferência — YUNO 10.3 REAL AUTO-PROGRAMMING
// Decide resposta, processa comandos, gera blueprint, patch e aplica patch real.

import { YUNO_MEMORY } from "./memory.js";
import { YUNO_PERSONALITY } from "./personality.js";
import { YUNO_COMMANDS } from "./commands.js";

// SAFE MODE 10.2
import { YUNO_INTENT_PROGRAMMING } from "./intent-programming.js";
import { YUNO_SANDBOX } from "./sandbox.js";
import { YUNO_AUTO_WRITER } from "./auto-writer.js";

// REAL MODE 10.3
import { YUNO_CORE } from "./core.js";

export const YUNO_INFERENCE = {

    // =====================================================
    // PROCESSADOR PRINCIPAL
    // =====================================================
    async process(text) {

        const clean = text.trim().toLowerCase();

        // 1) Comandos registados
        const commandResponse = await this.checkCommands(clean);
        if (commandResponse) return commandResponse;

        // 2) AUTO-PROGRAMAÇÃO REAL (10.3)
        const patchResponse = await this.checkAutoProgramming(text, clean);
        if (patchResponse) return patchResponse;

        // 3) AUTO-PROGRAMAÇÃO SAFE MODE (10.2)
        const blueprintResponse = await this.checkBlueprint(text, clean);
        if (blueprintResponse) return blueprintResponse;

        // 4) Memória
        const memoryResponse = await this.checkMemory(clean);
        if (memoryResponse) return memoryResponse;

        // 5) Personalidade
        const personalityResponse = await this.applyPersonality(clean);
        if (personalityResponse) return personalityResponse;

        // 6) Fallback
        return this.fallback(clean);
    },

    // =====================================================
    // COMANDOS BÁSICOS
    // =====================================================
    async checkCommands(text) {
        for (const key in YUNO_COMMANDS) {
            if (text.startsWith(key)) {
                const cmd = YUNO_COMMANDS[key];
                return await cmd.execute({ text });
            }
        }
        return null;
    },

    // =====================================================
    // 10.3 — AUTO-PROGRAMAÇÃO REAL (Aplicar Patch)
    // =====================================================
    async checkAutoProgramming(text, clean) {

        // 1) Comando para iniciar aplicação de patch
        if (clean.includes("aplica patch") || clean.includes("executa patch")) {
            return "🔥 Beleza! Envia-me agora o PATCH em JSON.\nFormato:\n```\npatch:{...}\n```";
        }

        // 2) Recebe PATCH REAL enviado pelo utilizador
        if (clean.startsWith("patch:")) {

            let patchObj = null;

            try {
                const payload = text.replace("patch:", "").trim();
                patchObj = JSON.parse(payload);
            } catch (err) {
                return "❌ Erro: patch inválido (não é JSON).";
            }

            if (!patchObj.path && !patchObj.nome) {
                return "❌ Patch inválido: falta o campo 'path' ou 'nome'.";
            }

            if (!patchObj.codigo) {
                return "❌ Patch inválido: falta o campo 'codigo'.";
            }

            // normaliza path
            patchObj.path = patchObj.path || patchObj.nome;

            // aplicar patch REAL (executor.js)
            const resultado = await YUNO_CORE.modulosAuto.executor.aplicarPatch(patchObj);

            if (!resultado.ok) {
                return `❌ Falha ao aplicar patch:\n${resultado.erro}`;
            }

            // rebuild automático
            const reloadInfo = await YUNO_CORE.modulosAuto.rebuild.reload();

            return `✅ Patch aplicado com sucesso!\n${reloadInfo}`;
        }

        return null;
    },

    // =====================================================
    // 10.2 — SAFE MODE (Blueprint + Patch Preview)
    // =====================================================
    async checkBlueprint(text, clean) {

        const intencao = YUNO_INTENT_PROGRAMMING.detectarIntencao(clean);

        if (!intencao) return null;

        // Gerar blueprint
        const blueprint = YUNO_INTENT_PROGRAMMING.gerarBlueprint(intencao, text);

        // Validar sintaxe
        let validacao = null;
        if (blueprint?.codigoBase) {
            validacao = YUNO_SANDBOX.testarCodigo(blueprint.codigoBase);
        }

        // Criar patch SAFE MODE
        const patch = YUNO_AUTO_WRITER.gerarPatch(
            blueprint.nome || "modulo_auto",
            blueprint.codigoBase || "// sem código"
        );

        return `
🔧 **AUTO-PROGRAMAÇÃO 10.2 — SAFE MODE**

**Intenção detectada:** \`${intencao}\`

📦 **Blueprint:**
\`\`\`json
${JSON.stringify(blueprint, null, 2)}
\`\`\`

🧪 **Validação da Sandbox:**  
${validacao ? (validacao.ok ? "✔ Código válido" : "❌ Erro: " + validacao.erro) : "Sem código"}

📝 **Patch (SAFE MODE — não aplicado):**
\`\`\`json
${JSON.stringify(patch, null, 2)}
\`\`\`

Para aplicar este patch de verdade → envia:

**aplica patch**
        `.trim();
    },

    // =====================================================
    // MEMÓRIA
    // =====================================================
    async checkMemory(text) {
        const mem = YUNO_MEMORY.search(text);

        if (mem) {
            return `Olha, lembrei-me disto que falámos antes: ${mem}`;
        }
        return null;
    },

    // =====================================================
    // PERSONALIDADE
    // =====================================================
    async applyPersonality(text) {
        const intent = this.detectIntent(text);
        const style = YUNO_PERSONALITY.getStyle(intent);

        if (!style) return null;

        return style.response(text);
    },

    // =====================================================
    // INTENÇÕES NORMAIS
    // =====================================================
    detectIntent(text) {

        if (text.includes("ola") || text.includes("oi") || text.includes("boas"))
            return "greeting";

        if (text.includes("ajuda") || text.includes("podes"))
            return "help";

        if (text.includes("quem és") || text.includes("o que és"))
            return "identity";

        if (text.includes("obrigado"))
            return "thanks";

        return "generic";
    },

    // =====================================================
    // FALLBACK
    // =====================================================
    fallback(text) {
        const respostas = [
            "Interessante isso 👀 continua…",
            "Tô contigo, desenvolve mais isso aí ✨",
            "Curti o tema, explica mais.",
            "Conta-me mais para eu entender melhor 🔥"
        ];
        return respostas[Math.floor(Math.random() * respostas.length)];
    }
};
