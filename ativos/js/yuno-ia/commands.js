export const YUNO_COMMANDS = {

    // SISTEMA
    "reiniciar-sessao": {
        description: "Reinicia a IA e limpa cache temporário.",
        execute: async (core) => {
            core.log("[SISTEMA] Reiniciar sessão solicitado.");
            core.reset();
            return "Sessão reiniciada com sucesso.";
        }
    },

    "limpar-logs": {
        description: "Limpa todos os registos de logs do painel da IA.",
        execute: async (core) => {
            core.clearLogs();
            return "Todos os logs foram limpos.";
        }
    },

    // PERSONALIDADE
    "definir-tonalidade": {
        description: "Define o tom de voz da IA.",
        params: ["tom"],
        execute: async (core, tom) => {
            core.brain.personality = tom;
            core.log(`[PERSONALIDADE] Tom definido para: ${tom}`);
            return `Tom atualizado para '${tom}'.`;
        }
    },

    // CONTEÚDOS
    "gerar-post": {
        description: "Gera um conteúdo curto para redes sociais.",
        params: ["tema"],
        execute: async (core, tema) => {
            core.log(`[POST] Gerando conteúdo para tema: ${tema}`);

            return `Aqui vai um post sobre ${tema}:\n\n"${tema} é mais que tendência — é futuro. A Yuno transforma tecnologias complexas em resultados reais."`;
        }
    },

    "gerar-texto": {
        description: "Gera um texto maior (blog, email, copy).",
        params: ["tema"],
        execute: async (core, tema) => {
            core.log(`[POST LONGO] Gerando texto sobre: ${tema}`);

            return `Texto gerado sobre ${tema}:\n\nA tecnologia evolui todos os dias — e a Yuno acompanha essa evolução com sistemas inteligentes preparados para escalar.`;
        }
    },

    // ANÁLISES
    "analisar-pagina": {
        description: "Analisa uma página e retorna melhorias.",
        execute: async (core) => {
            const sugestoes = [
                "Adicionar animações suaves.",
                "Melhorar contraste de texto.",
                "Rever espaçamento.",
                "Adicionar CTA mais visível."
            ];
            core.log("[ANÁLISE] Página analisada.");
            return sugestoes;
        }
    },

    // AUTOMAÇÕES
    "automacao-on": {
        description: "Ativa uma automação.",
        params: ["nome"],
        execute: async (core, nome) => {
            core.log(`[AUTOMAÇÃO] '${nome}' ativada.`);
            return `Automaçao '${nome}' ativada.`;
        }
    },

    "automacao-off": {
        description: "Desativa uma automação.",
        params: ["nome"],
        execute: async (core, nome) => {
            core.log(`[AUTOMAÇÃO] '${nome}' desativada.`);
            return `Automaçao '${nome}' desativada.`;
        }
    },

    // RELATÓRIOS
    "resumo-do-dia": {
        description: "Mostra um resumo das atividades da IA.",
        execute: async (core) => {
            core.log(`[RELATÓRIO] Gerando resumo diário.`);
            return {
                posts_gerados: 4,
                automatizacoes_ativas: 3,
                humor_ia: core.brain.personality || "padrão",
                estatisticas: {
                    comandos_hoje: core.logs.length
                }
            };
        }
    }
};
