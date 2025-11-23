// ======================================================
// YUNO ENGINE — Núcleo Principal de IA (v10.3)
// ======================================================

import { YunoMemory } from "./yuno-memory.js";
import { YunoCommands } from "./yuno-commands.js";
import { think } from "./yuno-think.js";

export const YunoEngine = {
    version: "10.3",
    name: "Yuno IA",

    async process(prompt, meta = {}) {

        // Salvar mensagem do utilizador
        YunoMemory.short.push({
            role: "user",
            content: prompt,
            time: Date.now()
        });

        // 1 — Verificar se é comando
        const cmdResponse = await YunoCommands.tryExecute(prompt);
        if (cmdResponse) return cmdResponse;

        // 2 — THINK ENGINE (motor cognitivo)
        const result = await think(prompt);

        // 3 — Guardar resposta na memória
        YunoMemory.short.push({
            role: "assistant",
            content: result,
            time: Date.now()
        });

        return result;
    }
};
