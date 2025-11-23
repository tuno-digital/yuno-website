
// =============================================================
// YUNO MASTER ADMIN — v10.3
// Controlador oficial do Painel Secreto do Administrador
// Liga o front-end secreto ao servidor admin protegido
// =============================================================

console.log("%c[YUNO MASTER] Iniciado (10.3)", "color:#00eaff");

// ============================
// CONFIGURAÇÃO DO ENDPOINT
// ============================
const ADMIN_API = "/api/admin"; // rota protegida no servidor

// ============================
// TOKEN DO ADMIN (armazenado localmente)
// ============================
function getToken() {
    return localStorage.getItem("yuno_master_token");
}

function authHeader() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
    };
}

// ============================
// API PRINCIPAL DO PAINEL SECRETO
// ============================
export const adminAPI = {

    // =======================
    // 1. Estado geral do sistema
    // =======================
    async status() {
        try {
            const req = await fetch(`${ADMIN_API}/status`, {
                method: "GET",
                headers: authHeader()
            });
            return await req.json();
        } catch (e) {
            console.error("Erro ao obter estado do servidor:", e);
            return { erro: true };
        }
    },

    // =======================
    // 2. Obter logs internos da IA
    // =======================
    async logs() {
        try {
            const req = await fetch(`${ADMIN_API}/logs`, {
                method: "GET",
                headers: authHeader()
            });
            const res = await req.json();
            return res.logs || [];
        } catch (e) {
            console.error("Erro ao obter logs:", e);
            return ["Erro ao carregar logs."];
        }
    },

    // =======================
    // 3. Recarregar a IA (reinicia o núcleo)
    // =======================
    async reloadIA() {
        try {
            await fetch(`${ADMIN_API}/reload-ia`, {
                method: "POST",
                headers: authHeader()
            });
            return true;
        } catch (e) {
            console.error("Erro ao recarregar IA:", e);
            return false;
        }
    },

    // =======================
    // 4. Reconstruir o núcleo YUNO (Core 10.3)
    // =======================
    async rebuildCore() {
        try {
            await fetch(`${ADMIN_API}/rebuild-core`, {
                method: "POST",
                headers: authHeader()
            });
            return true;
        } catch (e) {
            console.error("Erro ao reconstruir núcleo:", e);
            return false;
        }
    },

    // =======================
    // 5. Limpar logs internos
    // =======================
    async clearLogs() {
        try {
            await fetch(`${ADMIN_API}/clear-logs`, {
                method: "POST",
                headers: authHeader()
            });
            return true;
        } catch (e) {
            return false;
        }
    },

    // =======================
    // 6. Teste rápido da IA
    // =======================
    async testIA(prompt = "Olá Yuno!") {
        try {
            const req = await fetch(`${ADMIN_API}/test-ia`, {
                method: "POST",
                headers: authHeader(),
                body: JSON.stringify({ prompt })
            });
            return await req.json();
        } catch (e) {
            console.error("Erro no teste da IA:", e);
            return { erro: true };
        }
    }
};


// =============================================================
// Funções Globais (caso precisemos expor no painel)
// =============================================================
export function logout() {
    localStorage.removeItem("yuno_master_token");
    window.location.href = "admin-login.html";
}

export function isLogged() {
    return !!getToken();
}

console.log("%c[YUNO MASTER] Módulo Carregado", "color:#ff00ea");
