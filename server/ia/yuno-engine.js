// ======================================================
// YUNO ENGINE — Núcleo Principal de IA (v10.3)
// ======================================================

import { YunoMemory } from "./yuno-memory.js";
import { YunoCommands } from "./yuno-commands.js";
import { YunoThink } from "./yuno-think.js";

export const YunoEngine = {
    version: "10.3",
    name: "Yuno IA",

    async process(prompt, meta = {}) {

        // Guardar memória curta (entrada)
        YunoMemory.short.push({
            role: "user",
            content: prompt,
            time: Date.now()
        });

        // 1 — Verificar comandos internos
        const cmdResponse = await YunoCommands.tryExecute(prompt);
        if (cmdResponse) {
            return cmdResponse;
        }

        // 2 — THINK 10.3 (motor cognitivo)
        const thinking = await YunoThink(prompt);

        // 3 — Criar resposta final formatada
        const response = `✨ Yuno 10.3: ${thinking}`;

        // 4 — Guardar memória curta (resposta)
        YunoMemory.short.push({
            role: "assistant",
            content: response,
            time: Date.now()
        });

        return response;
    }
};
