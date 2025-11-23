// =====================================================
// SETTINGS-PANEL.JS — Painel Secreto YUNO IA 10.3
// Controlo total da IA: personalidade, modelo,
// segurança, auto-upgrade e integrações.
// =====================================================

console.log("⚙️ Painel de Configurações 10.3 carregado.");

const api = async (rota, metodo = "GET", body = null) => {
    try {
        const config = {
            method: metodo,
            headers: { "Content-Type": "application/json" }
        };

        if (body) config.body = JSON.stringify(body);

        const res = await fetch(`/api/admin/${rota}`, config);

        if (!res.ok) {
            console.error("Erro API:", res.status);
            return null;
        }

        return await res.json();

    } catch (err) {
        console.error("Erro comunicação API:", err);
        return null;
    }
};

// ELEMENTOS
const iaTone = document.getElementById("iaTone");
const iaWriting = document.getElementById("iaWriting");
const iaTemp = document.getElementById("iaTemp");
const iaModel = document.getElementById("iaModel");
const speedQuality = document.getElementById("speedQuality");

const apiKey = document.getElementById("apiKey");
const yunoKey = document.getElementById("yunoKey");

const autoFix = document.getElementById("autoFix");
const autoUpgrade = document.getElementById("autoUpgrade");
const memoryMonitor = document.getElementById("memoryMonitor");

const estadoBox = document.getElementById("estadoBox");
const salvarBtn = document.getElementById("salvarBtn");
const btnEstado = document.getElementById("btnEstado");

// =====================================================
// 1 — CARREGAR CONFIGURAÇÕES INICIAIS
// =====================================================

async function carregarConfigs() {
    const dados = await api("configs");

    if (!dados) {
        estadoBox.innerText = "❌ Erro ao carregar configs";
        return;
    }

    console.log("Configurações carregadas:", dados);

    iaTone.value = dados.persona.tone;
    iaWriting.value = dados.persona.style;
    iaTemp.value = dados.persona.temperature;

    iaModel.value = dados.model.name;
    speedQuality.value = dados.model.speed_quality;

    apiKey.value = dados.keys.api_key || "";
    yunoKey.value = dados.keys.internal_token || "";

    autoFix.checked = dados.security.auto_fix;
    autoUpgrade.checked = dados.security.auto_upgrade;
    memoryMonitor.checked = dados.security.memory_monitor;
}

carregarConfigs();

// =====================================================
// 2 — GUARDAR CONFIGURAÇÕES
// =====================================================

salvarBtn.addEventListener("click", async () => {

    const body = {
        persona: {
            tone: iaTone.value,
            style: iaWriting.value,
            temperature: Number(iaTemp.value)
        },

        model: {
            name: iaModel.value,
            speed_quality: Number(speedQuality.value)
        },

        keys: {
            api_key: apiKey.value,
            internal_token: yunoKey.value
        },

        security: {
            auto_fix: autoFix.checked,
            auto_upgrade: autoUpgrade.checked,
            memory_monitor: memoryMonitor.checked
        }
    };

    const r = await api("configs/salvar", "POST", body);

    if (!r) return alert("❌ Erro ao guardar!");

    alert("✅ Configurações guardadas com sucesso!");
});


// =====================================================
// 3 — ESTADO DO SISTEMA
// =====================================================

btnEstado.addEventListener("click", async () => {
    estadoBox.innerText = "A carregar...";

    const status = await api("estado");

    if (!status) {
        estadoBox.innerText = "❌ Erro ao obter estado do servidor";
        return;
    }

    estadoBox.innerText = JSON.stringify(status, null, 2);
});

