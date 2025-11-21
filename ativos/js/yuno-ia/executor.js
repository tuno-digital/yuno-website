// yuno-ia/executor.js
// Executor real de patches — YUNO 10.3 WRITE MODE
// Aplica patches, valida código e dispara eventos para o autosystem

import { YUNO_SANDBOX } from "./sandbox.js";
import { YUNO_AUTO_WRITER } from "./auto-writer.js";

export const YUNO_EXECUTOR = {

    // ===========================================================
    // 1) APLICAR PATCH REAL
    // ===========================================================
    async aplicarPatch(patch) {
        try {
            console.log("%c[YUNO_EXECUTOR] Aplicando patch...", "color:#00ffaa");

            // --------------------------------------------
            // 1.1 Validar sintaxe com SANDBOX antes de tocar ficheiros
            // --------------------------------------------
            const valid = YUNO_SANDBOX.testarCodigo(patch.codigo);

            if (!valid.ok) {
                return {
                    ok: false,
                    erro: "Erro de sintaxe no código: " + valid.erro
                };
            }

            // --------------------------------------------
            // 1.2 Carregar conteúdo original (para rollback)
            // --------------------------------------------
            let original = "";
            try {
                const req = await fetch(patch.path);
                original = await req.text();
            } catch (err) {
                original = "// ERRO: não foi possível ler o ficheiro original.";
            }

            // --------------------------------------------
            // 1.3 Aplicar patch REAL (write)
            // --------------------------------------------
            const resultado = await YUNO_AUTO_WRITER.sobrescrever(
                patch.path,
                patch.codigo,
                original
            );

            if (!resultado.ok) {
                // Falhou o write → rollback já foi executado pelo auto-writer
                return {
                    ok: false,
                    erro: resultado.erro,
                    detalhe: resultado.detalhe
                };
            }

            // --------------------------------------------
            // 1.4 Disparar evento de sucesso global
            // --------------------------------------------
            window.dispatchEvent(
                new CustomEvent("yuno:patch_applied", { detail: patch })
            );

            console.log("%c[YUNO_EXECUTOR] Patch aplicado com sucesso!", "color:#00ffaa");

            return {
                ok: true,
                patch,
                mensagem: "Patch aplicado com sucesso!"
            };

        } catch (err) {

            return {
                ok: false,
                erro: "Erro inesperado ao aplicar patch: " + err.toString()
            };
        }
    }
};
