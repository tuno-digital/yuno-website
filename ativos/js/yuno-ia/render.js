export const YUNO_RENDER = {

    chatBox: null,
    typingElement: null,

    init() {
        this.chatBox = document.querySelector("#yunoChat");
        this.typingElement = document.querySelector("#yunoTyping");

        if (!this.chatBox) console.warn("⚠️ chatBox (#yunoChat) não encontrado.");
    },

    // ================================
    // RENDERIZA MENSAGEM DO UTILIZADOR
    // ================================
    userMessage(text) {
        const msg = document.createElement("div");
        msg.className = "msg user-msg";

        msg.innerHTML = `
            <div class="bubble user-bubble">
                <p>${text}</p>
            </div>
        `;

        this.chatBox.appendChild(msg);
        this.scrollToBottom();
    },

    // ================================
    // MOSTRA "YUNO ESTÁ A DIGITAR..."
    // ================================
    showTyping() {
        if (!this.typingElement) return;
        this.typingElement.style.display = "flex";
    },

    hideTyping() {
        if (!this.typingElement) return;
        this.typingElement.style.display = "none";
    },

    // ================================
    // RENDERIZA MENSAGEM DA IA
    // ================================
    async aiMessage(text) {

        const msg = document.createElement("div");
        msg.className = "msg ai-msg";

        msg.innerHTML = `
            <div class="bubble ai-bubble neon-border">
                <span class="cursor-effect"></span>
                <p class="ai-text"></p>
            </div>
        `;

        this.chatBox.appendChild(msg);

        // efeito de "escrita"
        await this.typeEffect(msg.querySelector(".ai-text"), text);

        this.scrollToBottom();
    },

    // ================================
    // EFEITO DE DIGITAÇÃO
    // ================================
    typeEffect(element, text, speed = 18) {
        return new Promise((resolve) => {
            let i = 0;

            const interval = setInterval(() => {
                element.textContent += text.charAt(i);
                i++;

                if (i >= text.length) {
                    clearInterval(interval);
                    resolve();
                }
            }, speed);
        });
    },

    // ================================
    // AUTO-SCROLL
    // ================================
    scrollToBottom() {
        this.chatBox.scrollTop = this.chatBox.scrollHeight;
    },

    // ================================
    // RENDERIZA LISTAS / RESULTADOS
    // (Ex: Análise de página, logs)
    // ================================
    renderList(title, items) {
        const box = document.createElement("div");
        box.className = "msg ai-msg";

        let html = `
            <div class="bubble ai-bubble neon-border">
                <h4>${title}</h4>
                <ul>
        `;

        items.forEach(i => {
            html += `<li>${i}</li>`;
        });

        html += `
                </ul>
            </div>
        `;

        box.innerHTML = html;
        this.chatBox.appendChild(box);
        this.scrollToBottom();
    }
};
