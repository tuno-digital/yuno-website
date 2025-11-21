/**
 * main.js – YUNO 9.0
 * Controla navegação, carregamento de componentes e inicialização global
 */

// =============================
//  NAVBAR DINÂMICA
// =============================
document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.querySelector(".navbar");

    if (navbar) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 20) {
                navbar.classList.add("navbar-scrolled");
            } else {
                navbar.classList.remove("navbar-scrolled");
            }
        });
    }
});

// =============================
//  MENU MOBILE
// =============================
document.addEventListener("click", (e) => {
    const btn = e.target.closest(".menu-toggle");
    const menu = document.querySelector(".mobile-menu");

    if (btn && menu) {
        menu.classList.toggle("open");
    }
});

// =============================
//  FAB (Floating Action Button)
// =============================
const fab = document.querySelector(".fab");
const fabMenu = document.querySelector(".fab-menu");

if (fab && fabMenu) {
    fab.addEventListener("click", () => {
        fabMenu.classList.toggle("open");
        fab.classList.toggle("active");
    });
}

// =============================
//  SMOOTH SCROLL GLOBAL
// =============================
document.querySelectorAll("a[href^='#']").forEach(link => {
    link.addEventListener("click", function (e) {
        const target = document.querySelector(this.getAttribute("href"));

        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth" });
        }
    });
});

// =============================
//  MODAL GLOBAL
// =============================
const modal = document.querySelector(".modal");
const modalClose = document.querySelector(".modal-close");

if (modal && modalClose) {
    modalClose.addEventListener("click", () => {
        modal.classList.remove("active");
    });
}

window.openModal = function (id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add("active");
};

// =============================
//  PÁGINAS COM ANIMAÇÕES LAZY
// =============================
const lazyElements = document.querySelectorAll(".lazy-anim");

if ("IntersectionObserver" in window) {
    const lazyObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                lazyObs.unobserve(entry.target);
            }
        });
    });

    lazyElements.forEach(el => lazyObs.observe(el));
}

// =============================
//  VERIFICAÇÃO DE INTERNET
// =============================
function updateOnlineStatus() {
    if (!navigator.onLine) {
        console.warn("⚠️ Sem internet – modo offline");
    }
}

window.addEventListener("offline", updateOnlineStatus);
window.addEventListener("online", updateOnlineStatus);

// =============================
//  CARREGAMENTO INICIAL
// =============================
console.log("✅ YUNO 9.0 — main.js carregado com sucesso!");