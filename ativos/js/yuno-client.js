/* ============================================================
   YUNO 9.0 AUDITADO — yuno-client.js
   Módulo principal da IA da YUNO.
   Responsável por: entrada, respostas, logs e UX do terminal.
   ============================================================ */

const YUNO = (() => {

  /* -----------------------------------------------------------
     1. ELEMENTOS DO TERMINAL
  ----------------------------------------------------------- */
  const terminal = document.getElementById("yuno-terminal");
  const input = document.getElementById("yuno-input");
  const sendBtn = document.getElementById("yuno-send");

  if (!terminal || !input) {
    console.warn("⚠️ YUNO CLIENT: Terminal não encontrado.");
    return {};
  }

  /* -----------------------------------------------------------
     2. UTILIDADES DE UI
  ----------------------------------------------------------- */
  function printUser(message) {
    writeLine(<span class="user">👤 Tu: </span>${escapeHTML(message)});
  }

  function printYuno(message) {
    writeLine(<span class="yuno">🤖 Yuno: </span>${message});
  }

  function writeLine(html) {
    const div = document.createElement("div");
    div.classList.add("line");
    div.innerHTML = html;
    terminal.appendChild(div);
    terminal.scrollTop = terminal.scrollHeight;
  }

  function escapeHTML(text) {
    return text.replace(/[&<>'"]/g, tag => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;'
    }[tag]));
  }

  /* -----------------------------------------------------------
     3. RESPOSTAS DA IA (placeholder)
     Aqui programamos a YUNO pré-IA real.
  ----------------------------------------------------------- */
  function generateLocalResponse(prompt) {
    const lower = prompt.toLowerCase();

    // respostas pré-definidas mais inteligentes
    if (lower.includes("olá") || lower.includes("ola")) {
      return "Olá! Em que posso ajudar hoje?";
    }

    if (lower.includes("serviço") || lower.includes("services")) {
      return "A YUNO oferece automações, IA, funis inteligentes, criação de sites futuristas e gestão digital completa.";
    }

    if (lower.includes("preço") || lower.includes("planos")) {
      return "Os nossos planos começam em valores acessíveis e escalam conforme as necessidades da tua empresa. Consulta a página Planos.";
    }

    if (lower.includes("quem és") || lower.includes("tu és")) {
      return "Sou a YUNO IA — criada para automatizar, criar, responder e acelerar qualquer negócio.";
    }

    if (lower.includes("ajuda") || lower.includes("help")) {
      return "Podes perguntar qualquer coisa sobre IA, automações, serviços ou marketing digital!";
    }

    // fallback
    return "Entendi! Esse tema é importante. Se quiseres, posso aprofundar ou procurar informação mais específica.";
  }

  /* -----------------------------------------------------------
     4. SISTEMA DE ENVIO
     (com futuro plug-in para API REAL)
  ----------------------------------------------------------- */
  async function processMessage() {
    const prompt = input.value.trim();
    if (!prompt) return;

    printUser(prompt);
    input.value = "";

    // animação “YUNO está a pensar…”
    const thinking = document.createElement("div");
    thinking.className = "line thinking";
    thinking.innerHTML = "<span class='dots'>•••</span>";
    terminal.appendChild(thinking);
    terminal.scrollTop = terminal.scrollHeight;

    await sleep(800);

    thinking.remove();

    // RESPOSTA LOCAL (placeholder)
    const response = generateLocalResponse(prompt);

    printYuno(response);
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  /* -----------------------------------------------------------
     5. EVENTOS
  ----------------------------------------------------------- */
  sendBtn?.addEventListener("click", processMessage);

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") processMessage();
  });

  /* -----------------------------------------------------------
     6. RETORNO GLOBAL (API pública)
  ----------------------------------------------------------- */
  return {
    send: processMessage,
    test: () => printYuno("Sistema YUNO 9.0 carregado com sucesso.")
  };

})();

/* Auto mensagem inicial */
window.addEventListener("DOMContentLoaded", () => {
  const first = document.getElementById("yuno-terminal");
  if (first) {
    const msg = document.createElement("div");
    msg.className = "line intro";
    msg.innerHTML = "<span class='yuno'>🤖 Yuno:</span> Sistema inicializado. Como posso ajudar?";
    first.appendChild(msg);
  }
});