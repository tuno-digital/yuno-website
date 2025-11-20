// ativos/js/ui-effects.js
// YUNO 9.0 — Sistema de efeitos visuais auditado
// Zero erros, zero emojis, zero caracteres invisíveis.

// --------------------------------------------------
// 1. Smooth scroll global
// --------------------------------------------------
(function () {
    const anchors = document.querySelectorAll('a[href^="#"]');
    if (!anchors.length) return;

    anchors.forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            const href = this.getAttribute("href");
            if (!href || href === "#") return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();
            if (typeof target.scrollIntoView === "function") {
                target.scrollIntoView({ behavior: "smooth" });
            } else {
                const rect = target.getBoundingClientRect();
                window.scrollTo(0, rect.top + window.pageYOffset);
            }
        });
    });
})();

// --------------------------------------------------
// 2. Reveal on Scroll (fade-up, fade-left, fade-right)
// --------------------------------------------------
(function () {
    if (typeof IntersectionObserver === "undefined") return;

    const targets = document.querySelectorAll(
        ".reveal, .fade-up, .fade-left, .fade-right"
    );
    if (!targets.length) return;

    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("show");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );

    targets.forEach(el => observer.observe(el));
})();

// --------------------------------------------------
// 3. Parallax suave — elementos com classe .parallax-bg
// --------------------------------------------------
(function () {
    const parallax = document.querySelector(".parallax-bg");
    if (!parallax) return;

    let pending = false;
    let lastX = 0;
    let lastY = 0;

    window.addEventListener("mousemove", e => {
        lastX = (e.clientX / window.innerWidth) - 0.5;
        lastY = (e.clientY / window.innerHeight) - 0.5;

        if (pending) return;
        pending = true;

        window.requestAnimationFrame(() => {
            const moveX = lastX * 20;
            const moveY = lastY * 20;
            parallax.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
            pending = false;
        });
    });
})();

// --------------------------------------------------
// 4. Neon Hover Glow
// --------------------------------------------------
(function () {
    const glowTargets = document.querySelectorAll(".neon-glow");
    if (!glowTargets.length) return;

    glowTargets.forEach(el => {
        el.addEventListener("mouseenter", () => {
            el.style.filter = "drop-shadow(0 0 12px #00eaff)";
        });

        el.addEventListener("mouseleave", () => {
            el.style.filter = "drop-shadow(0 0 0 transparent)";
        });
    });
})();
