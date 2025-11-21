// yuno-ia/input-handler.js

import { YUNO_SECURITY } from "./security.js";

export const YUNO_INPUT = {

    input: null,
    sendBtn: null,

    init() {
        this.input = document.querySelector("#yunoInput");
        this.sendBtn = document.querySelector("#yunoSend");

        if (!this.input) {
            console.warn("⚠️ input (#yunoInput) não encontrado.");
            return;
        }

        // Enter
        this.input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") this.send();
        });

        // Botão
        if (this.sendBtn) {
            this.sendBtn.addEventListener("click", () => this.send());
        }
    },

    send() {
        let text = this.input.value.trim();
        if (text.length === 0) return;

        // sanitização
        text = YUNO_SECURITY.sanitize(text);

        // mandar para engine
        window.dispatchEvent(
            new CustomEvent("yuno:user_message", { detail: { text } })
        );

        this.input.value = "";
    }
};
