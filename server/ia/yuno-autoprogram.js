// ======================================================
// YUNO AUTO-PROGRAM — Evolução automática 10.3 (ESM)
// ======================================================

import fs from "fs";
import path from "path";

export const YunoAutoProgram = {

    async write(file, content) {
        try {
            const location = path.join(process.cwd(), file);
            await fs.promises.writeFile(location, content, "utf8");
            return `✅ Ficheiro atualizado: ${file}`;
        } catch (e) {
            return `❌ Erro ao escrever ficheiro ${file}: ${e}`;
        }
    },

    async append(file, content) {
        try {
            const location = path.join(process.cwd(), file);
            await fs.promises.appendFile(location, content, "utf8");
            return `➕ Conteúdo adicionado ao ficheiro ${file}`;
        } catch (e) {
            return `❌ Falha ao adicionar conteúdo: ${e}`;
        }
    }
};

export default YunoAutoProgram;
