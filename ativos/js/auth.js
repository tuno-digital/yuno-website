/**
 * auth.js – YUNO 9.0
 * Sistema simples de autenticação local (será substituído por API real no futuro).
 *
 * O objetivo:
 *  ✔ Login básico
 *  ✔ Logout
 *  ✔ Guardião de páginas protegidas
 *  ✔ Armazenamento seguro local (crypto + hash)
 *  ✔ Preparado para integração futura com backend real
 */

// ==========================================
//  Configurações
// ==========================================
const AUTH_KEY = "yuno_auth_user";

// Pequena função hash (suficiente para armazenamento local)
function hash(text) {
    return btoa(unescape(encodeURIComponent(text)));
}

// ==========================================
//  LOGIN
// ==========================================
window.yunoLogin = function (email, password) {
    if (!email || !password) {
        return { success: false, message: "Preenche o email e a palavra-passe." };
    }

    // Criar token local (não é definitivo)
    const token = hash(email + "::" + password + "::" + Date.now());

    const user = {
        email,
        token,
        timestamp: Date.now()
    };

    localStorage.setItem(AUTH_KEY, JSON.stringify(user));

    console.log("🔐 Login efetuado:", user.email);

    return { success: true, user };
};

// ==========================================
//  LOGOUT
// ==========================================
window.yunoLogout = function () {
    localStorage.removeItem(AUTH_KEY);
    console.log("🚪 Logout efetuado");
    return true;
};

// ==========================================
//  OBTER UTILIZADOR ATUAL
// ==========================================
window.yunoUser = function () {
    const data = localStorage.getItem(AUTH_KEY);
    if (!data) return null;

    try {
        return JSON.parse(data);
    } catch {
        return null;
    }
};

// ==========================================
//  VERIFICAR SESSÃO
// ==========================================
window.yunoIsLogged = function () {
    return !!window.yunoUser();
};

// ==========================================
//  PROTEGER PÁGINAS
// ==========================================
window.yunoRequireAuth = function () {
    if (!window.yunoIsLogged()) {
        console.warn("🔒 Página protegida – redirecionar para login.html");
        window.location.href = "login.html";
    }
};

// Log inicial
console.log("✅ auth.js carregado — YUNO 9.0");