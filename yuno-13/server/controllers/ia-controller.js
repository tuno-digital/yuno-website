// ==============================================================
// YUNO 13.0 — IA CONTROLLER (AUDITADO E CORRIGIDO)
// Ponte entre /api/ia e o núcleo da YUNO
// ==============================================================

const thinker = require("../core/thinker-engine");
const intentEngine = require("../core/intent-engine");
const iaEngine = require("../core/ia-engine");
const state = require("../core/yuno-state");
const logger = require("../core/logger");

const MAX_COMANDO_BYTES = 200_000;

// Detectar e normalizar campo enviado pelo cockpit
function extrairComando(body) {
    return (
        body?.comando ||
        body?.prompt ||
        body?.message ||
        ""
    );
}

module.exports = {

    // ==========================================================
    // PROCESSAR COMANDO DA IA → /api/ia/process
    // ==========================================================
    async processar(req, res) {
        try {
            // Normalizar nome do campo
            const comando = extrairComando(req.body);

            logger.info(`IA-CONTROLLER: Comando recebido → "${comando}"`);

            // 1. Validar entrada
            if (typeof comando !== "string" || !comando.trim()) {
                return res.status(400).json({
                    ok: false,
                    erro: "Comando vazio ou inválido."
                });
            }

            if (comando.length > MAX_COMANDO_BYTES) {
                return res.status(400).json({
                    ok: false,
                    erro: "Comando demasiado grande."
                });
            }

            // 2. Validar existencia das funções nos módulos (proteção runtime)
            if (!intentEngine || typeof intentEngine.parse !== "function") {
                logger.error("intentEngine.parse não encontrado!");
                return res.status(500).json({
                    ok: false,
                    erro: "Motor de intenção indisponível."
                });
            }

            if (!thinker || typeof thinker.processar !== "function") {
                logger.error("thinker.processar não encontrado!");
                return res.status(500).json({
                    ok: false,
                    erro: "Motor de raciocínio indisponível."
                });
            }

            if (!iaEngine || (typeof iaEngine.executar !== "function" && typeof iaEngine.execute !== "function")) {
                logger.error("iaEngine.executar/execute não encontrado!");
                return res.status(500).json({
                    ok: false,
                    erro: "Motor de execução indisponível."
                });
            }

            // fallback se motor usa inglês
            if (!iaEngine.executar && typeof iaEngine.execute === "function") {
                iaEngine.executar = iaEngine.execute;
            }

            // 3. Guardar comando no estado global
            state.setComando(comando);

            // 4. Interpretar intenção
            const intent = await intentEngine.parse(comando);
            if (!intent) {
                logger.warn("IntentEngine devolveu intenção vazia.");
                return res.status(422).json({
                    ok: false,
                    erro: "Não foi possível interpretar o comando."
                });
            }
            state.setIntent(intent);

            // 5. Raciocinar internamente
            const pensamento = await thinker.processar(intent, state.getAll());
            if (!pensamento) {
                logger.warn("Thinker devolveu pensamento vazio.");
            }

            // 6. Executar ação final
            const execucao = await iaEngine.executar(intent, pensamento, state.getAll());
            if (!execucao) {
                logger.warn("IA Engine devolveu execução vazia.");
            }

            // 7. Criar estado seguro (sem info sensível)
            const safeState = {
                modo: state.modo || "desconhecido",
                ultimaIntent: intent?.tipo || null
            };

            return res.json({
                ok: true,
                comandoRecebido: comando,
                intent,
                pensamento,
                execucao,
                estado: safeState,
                timestamp: Date.now()
            });

        } catch (err) {
            logger.error("ERRO no ia-controller:", err);

            return res.status(500).json({
                ok: false,
                erro: "Erro interno ao processar comando da IA."
            });
        }
    },

    // ==========================================================
    // HEALTHCHECK → /api/ia/ping
    // ==========================================================
    async ping(req, res) {
        return res.json({
            ok: true,
            status: "YUNO 13.0 operacional",
            modo: state?.modo || "desconhecido",
            timestamp: Date.now()
        });
    }
};
