// ======================================================
// YUNO IA — PERSONALITY ENGINE (v10.1 Hybrid Neon)
// Controla o tom, temperatura, estilo, persona e identidade
// ======================================================

import { YUNO_MEMORY } from "./memory.js";

export const YUNO_PERSONALITY = {

    // ============================
    // DEFINIÇÃO PADRÃO DA YUNO
    // ============================
    config: {
        tom: "profissional",
        temperatura: 0.7,
        estilo: "conversacional",
        formalidade: "médio",
        emojis: true,
        velocidade: "normal",
        persona: "Yuno-Core",
    },

    // ============================
    // PRESETS DE PERSONALIDADE
    // ============================
    presets: {
        "profissional": {
            tom: "profissional",
            estilo: "formal",
            formalidade: "alto",
            temperatura: 0.3,
            emojis: false,
            velocidade: "normal",
            persona: "Yuno-Pro"
        },
        "amigável": {
            tom: "amigável",
            estilo: "conversacional",
            formalidade: "médio",
            temperatura: 0.7,
            emojis: true,
            velocidade: "rápida",
            persona: "Yuno-Friend"
        },
        "motivadora": {
            tom: "motivadora",
            estilo: "emocional",
            formalidade: "baixo",
            temperatura: 0.8,
            emojis: true,
            velocidade: "rápida",
            persona: "Yuno-Motiva"
        },
        "futurista": {
            tom: "futurista",
            estilo: "tecnológico",
            formalidade: "médio",
            temperatura: 0.6,
            emojis: false,
            velocidade: "normal",
            persona: "Yuno-Neon"
        },
        "personalizada": {
            tom: "custom",
            estilo: "custom",
            formalidade: "custom",
            temperatura: 0.5,
            emojis: true,
            velocidade: "normal",
            persona: "Yuno-Custom"
        }
    },

    // ============================
    // APLICAR PERSONALIDADE
    // ============================
    aplicarPreset(nome) {
        if (!this.presets[nome]) return;

        this.config = { ...this.presets[nome] };

        YUNO_MEMORY.addSystem(`[PERSONALIDADE] Preset aplicado: ${nome}`);
        YUNO_MEMORY.addLong(`A Yuno adotou o estilo: ${nome}`);
    },

    // ============================
    // DEFINIR PERSONALIDADE MANUAL
    // ============================
    definirManual({ tom, estilo, formalidade, temperatura, emojis, velocidade, persona }) {
        this.config = {
            tom: tom ?? this.config.tom,
            estilo: estilo ?? this.config.estilo,
            formalidade: formalidade ?? this.config.formalidade,
            temperatura: temperatura ?? this.config.temperatura,
            emojis: emojis ?? this.config.emojis,
            velocidade: velocidade ?? this.config.velocidade,
            persona: persona ?? this.config.persona
        };

        YUNO_MEMORY.addSystem(`[IA] Personalidade modificada manualmente.`);
    },

    // ============================
    // GERAR INSTRUÇÕES DO ESTILO
    // (o cérebro usa isto para gerar respostas)
    // ============================
    gerarInstrucoes() {
        const p = this.config;
        return `
            Tom: ${p.tom};
            Estilo: ${p.estilo};
            Formalidade: ${p.formalidade};
            Criatividade: ${p.temperatura};
            Usa emojis: ${p.emojis ? "Sim" : "Não"};
            Persona ativa: ${p.persona};
            Velocidade sugerida: ${p.velocidade}.
        `;
    },

    // ============================
    // DEBUG
    // ============================
    debug() {
        console.log("=== YUNO PERSONALIDADE ATUAL ===");
        console.table(this.config);
        console.log("Instruções:", this.gerarInstrucoes());
    }
};

// Tornar global se necessário
window.YUNO_PERSONALITY = YUNO_PERSONALITY;
