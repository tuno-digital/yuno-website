// yuno-ia/auto-writer.js
// Sistema de escrita REAL — YUNO 10.3 WRITE MODE
// Agora aplica patches de verdade com rollback automático
// Mantém compatibilidade com a versão SAFE MODE da 10.2

export const YUNO_AUTO_WRITER = {

    // ===============================================================
    // 1) GERAR PATCH (mantém compatível com tua versão antiga)
    // ===============================================================
    gerarPatch(nome, codigoNovo) {
        return {
            nome,
            codigo: codigoNovo,
            timestamp: Date.now(),
            status: "PENDING",
            seguro: true
        };
    },

    // ===============================================================
    // 2) COMPARAR CÓDIGO (mantido da tua versão)
    // ===============================================================
    comparar(original, novo) {
        return {
            linhasOriginal: original.split("\n").length,
            linhasNovo: novo.split("\n").length,
            alteracao: `${Math.abs(original.length - novo.length)} chars`
        };
    },

    // ===============================================================
    // 3) ESCREVER UM NOVO FICHEIRO (10.3 REAL WRITE MODE)
    // ===============================================================
    async criarFicheiro(nome, conteudo) {
        try {
            const handler = await window.showSaveFilePicker({
                suggestedName: nome
            });

            const writable = await handler.createWritable();
            await writable.write(conteudo);
            await writable.close();

            return {
                ok: true,
                path: nome,
                mensagem: "Ficheiro criado com sucesso!"
            };

        } catch (err) {
            return {
                ok: false,
                erro: err.toString()
            };
        }
    },

    // ===============================================================
    // 4) ESCREVER / SOBRESCREVER FICHEIRO (com rollback automático)
    // ===============================================================
    async sobrescrever(path, codigoNovo, codigoOriginal = "") {
        try {
            const handler = await window.showSaveFilePicker({
                suggestedName: path
            });

            const writable = await handler.createWritable();
            await writable.write(codigoNovo);
            await writable.close();

            return {
                ok: true,
                mensagem: "Ficheiro sobrescrito com sucesso!"
            };

        } catch (erroEscrita) {

            // =======================================================
            // ROLLBACK → tentar restaurar versão antiga
            // =======================================================
            try {
                const rollbackHandler = await window.showSaveFilePicker({
                    suggestedName: path
                });

                const writableRollback = await rollbackHandler.createWritable();
                await writableRollback.write(codigoOriginal);
                await writableRollback.close();

                return {
                    ok: false,
                    erro: "Falhou a escrita, mas o rollback foi aplicado.",
                    detalhe: erroEscrita.toString()
                };

            } catch (rollbackErro) {
                return {
                    ok: false,
                    erro: "Erro grave: falhou a escrita e falhou o rollback!",
                    detalhe: rollbackErro.toString()
                };
            }
        }
    }
};
