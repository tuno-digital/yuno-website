// ======================================================
// YUNO ENGINE — Núcleo Principal de IA (v10.3)
// Motor interno responsável por:
// - processamento de linguagem
// - síntese de respostas
// - routing para comandos
// - comunicação com memória
// ======================================================

import { YunoMemory } from "./yuno-memory.js";
import { YunoCommands } from "./yuno-commands.js";
import { YunoThink } from "./yuno-think.js";

export const YunoEngine = {
    version: "10.3",
    name: "Yuno IA",

    async process(prompt, meta = {}) {

        // Salvar no histórico
        YunoMemory.short.push({
            role: "user",
            content: prompt,
            time: Date.now()
        });

        // 1 — Verificar se é comando
        const cmdResponse = await YunoCommands.tryExecute(prompt);
        if (cmdResponse) {
            return cmdResponse;
        }

        // 2 — Processamento cognitivo 10.3
        const thinking = await YunoThink.generate(prompt);

        // 3 — Criar resposta final
        const response = `✨ **Yuno 10.3:** ${thinking}`;

        // 4 — Guardar resposta na memória
        YunoMemory.short.push({
            role: "assistant",
            content: response,
            time: Date.now()
        });

        return response;
    }
};
