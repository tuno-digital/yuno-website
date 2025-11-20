/**
 * API CORE - YUNO 9.0 AUDITADA
 * Sistema central de comunicação AJAX / Fetch
 * Seguro, rápido e sem dependências externas
 */

const API = {
    baseURL: "/api",

    /**
     * GET request
     */
    async get(endpoint = "") {
        try {
            const url = `${this.baseURL}${endpoint}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                return { error: true, message: `Erro GET: ${response.status}` };
            }

            return await response.json();

        } catch (err) {
            console.error("API GET ERROR:", err);
            return { error: true, message: "Erro ao obter dados" };
        }
    },

    /**
     * POST request
     */
    async post(endpoint = "", data = {}) {
        try {
            const url = `${this.baseURL}${endpoint}`;

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                return { error: true, message: `Erro POST: ${response.status}` };
            }

            return await response.json();

        } catch (err) {
            console.error("API POST ERROR:", err);
            return { error: true, message: "Erro ao enviar dados" };
        }
    },

    /**
     * Função genérica para endpoints com autenticação
     */
    async secure(endpoint = "", data = {}, token = "") {
        try {
            if (!token) {
                return { error: true, message: "Token ausente" };
            }

            const url = `${this.baseURL}${endpoint}`;

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                return { error: true, message: `Erro SECURE: ${response.status}` };
            }

            return await response.json();

        } catch (err) {
            console.error("API SECURE ERROR:", err);
            return { error: true, message: "Erro de autenticação" };
        }
    }
};

window.API = API;
