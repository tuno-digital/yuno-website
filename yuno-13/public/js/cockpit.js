/* ============================================================
   YUNO 13.0 — COCKPIT JS • OMEGA (CORRIGIDO FINAL, INJECT KEY)
   Chat • Preview • Relatório • Kanban • Telemetria
   Auditoria: injeção automática de x-api-key + robustez
============================================================ */

(function () {
  "use strict";

  /* -----------------------------
     Helpers: DOM + escape + logs
  ----------------------------- */
  function $id(id) {
    return document.getElementById(id) || null;
  }

  function safeReplaceAll(str, search, replace) {
    if (typeof str.replaceAll === "function") return str.replaceAll(search, replace);
    return str.split(search).join(replace);
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    let s = String(str);
    s = safeReplaceAll(s, "&", "&amp;");
    s = safeReplaceAll(s, "<", "&lt;");
    s = safeReplaceAll(s, ">", "&gt;");
    s = safeReplaceAll(s, '"', "&quot;");
    return s;
  }

  function uiLog(msg, type = "info") {
    const logs = $id("logs-box");
    if (!logs) return;
    const row = document.createElement("div");
    const time = new Date().toLocaleTimeString();
    row.textContent = `[${time}] [${type.toUpperCase()}] ${msg}`;
    if (type === "err") row.style.color = "#ff8080";
    logs.appendChild(row);
    logs.scrollTop = logs.scrollHeight;
  }

  function appendChat(html, klass = "") {
    const chat = $id("chat-box");
    if (!chat) return;
    const wrap = document.createElement("div");
    if (klass) wrap.className = klass;
    wrap.innerHTML = html;
    chat.appendChild(wrap);
    chat.scrollTop = chat.scrollHeight;
  }

  /* -----------------------------
     API Key helpers (localStorage / window / cookie fallback)
  ----------------------------- */
  function readKeyFromCookie() {
    try {
      const m = document.cookie.match(/(?:^|;\s*)YUNO_API_KEY=([^;]+)/);
      return m ? decodeURIComponent(m[1]) : "";
    } catch (e) {
      return "";
    }
  }

  function getApiKey() {
    try {
      const fromWindow = (window.YUNO_API_KEY || window.__YUNO_API_KEY__ || "").toString().trim();
      if (fromWindow) return fromWindow;
    } catch (e) {}
    try {
      const fromLocal = (localStorage.getItem("YUNO_API_KEY") || "").toString().trim();
      if (fromLocal) return fromLocal;
    } catch (e) {}
    try {
      const fromCookie = (readKeyFromCookie() || "").toString().trim();
      if (fromCookie) return fromCookie;
    } catch (e) {}
    return "";
  }

  function ensureApiKey(showUiNotice = true) {
    const k = getApiKey();
    if (!k) {
      if (showUiNotice) {
        appendChat(
          "<b>Yuno:</b> ❌ Nenhuma API-KEY definida. Configure antes de continuar.",
          "yuno-critical"
        );
        uiLog("Nenhuma API-KEY encontrada no browser (localStorage/window/cookie).", "err");
      }
      return false;
    }
    return true;
  }

  /* -----------------------------
     yunoFetch wrapper — injeta x-api-key sempre
  ----------------------------- */
  async function yunoFetch(input, init = {}) {
    // clone init to avoid mutating caller
    const cfg = Object.assign({}, init);
    cfg.headers = new Headers(init && init.headers ? init.headers : {});

    // set content-type default (if body present and no content-type)
    if (cfg.body && !cfg.headers.has("Content-Type")) {
      cfg.headers.set("Content-Type", "application/json");
    }

    const key = getApiKey();
    if (key) {
      cfg.headers.set("x-api-key", key);
    }

    // debug
    console.debug("yunoFetch:", { input: String(input), method: cfg.method || "GET", hasKey: !!key });

    return fetch(input, cfg);
  }

  /* -----------------------------
     Detectar nível visual
  ----------------------------- */
  function detectarNivel(msg) {
    msg = (msg || "").toString().toLowerCase();
    if (msg.includes("erro") || msg.includes("falha") || msg.includes("crítico"))
      return "yuno-critical";
    if (msg.includes("alerta") || msg.includes("atenção")) return "yuno-alert";
    if (msg.includes("sistema") || msg.includes("processando")) return "yuno-system";
    return "yuno-info";
  }

  /* -----------------------------
     PREVIEW sandbox
  ----------------------------- */
  function renderPreview(pack) {
    const iframe = $id("livePreviewBox");
    if (!iframe) return;
    const previewId = pack?.id || pack?.previewId;
    if (!previewId) return;
    iframe.src = `/api/ia/preview-frame?id=${encodeURIComponent(previewId)}`;
  }

  /* -----------------------------
     RELATÓRIO JSON
  ----------------------------- */
  function renderReport(report) {
    const box = $id("reportContent");
    if (!box) return;
    if (!report) {
      box.textContent = "Relatório vazio...";
      return;
    }
    try {
      box.innerHTML = `<pre class="json-block">${JSON.stringify(report, null, 2)}</pre>`;
    } catch {
      box.textContent = String(report);
    }
  }

  /* -----------------------------
     ENVIAR MENSAGEM
  ----------------------------- */
  async function sendMessage() {
    if (!ensureApiKey(true)) return;

    const msgField = $id("msg");
    if (!msgField) return;

    const text = msgField.value.trim();
    if (!text) return;

    appendChat(`<b>Tu:</b> ${escapeHtml(text)}`);
    uiLog(`INPUT: ${text}`, "sys");
    msgField.value = "";

    try {
      const resp = await yunoFetch("/api/ia/process", {
        method: "POST",
        body: JSON.stringify({ prompt: text }),
      });

      if (!resp.ok) {
        appendChat(`<b>Yuno:</b> ❌ Erro ${resp.status} ao comunicar com o servidor.`, "yuno-critical");
        uiLog(`Server returned ${resp.status}`, "err");
        return;
      }

      const data = await resp.json().catch(() => ({ error: "Resposta inválida do servidor." }));

      let mensagemYuno = "";

      if (data?.message) mensagemYuno = escapeHtml(data.message);
      else if (data?.response) {
        if (typeof data.response === "object") {
          mensagemYuno = `<pre class="json-block">${JSON.stringify(data.response, null, 2)}</pre>`;
        } else mensagemYuno = escapeHtml(String(data.response));
      } else if (data?.error) mensagemYuno = `❌ ${escapeHtml(data.error)}`;
      else mensagemYuno = "❌ Resposta vazia do servidor.";

      const nivel = detectarNivel(mensagemYuno);
      appendChat(`<b>Yuno:</b> ${mensagemYuno}`, nivel);

      uiLog(`[OUTPUT RAW] ${JSON.stringify(data)}`, "sys");

      if (data?.preview) renderPreview(data.preview);
      if (data?.report) renderReport(data.report);

      const statusPanel = $id("statusPanel");
      if (statusPanel)
        statusPanel.innerHTML = `<b>Último comando:</b> ${escapeHtml(text)}<br><b>Estado:</b> OK`;
    } catch (err) {
      appendChat(`<b>Yuno:</b> ❌ Erro de ligação`, "yuno-critical");
      uiLog(`[ERRO] ${err}`, "error");
      console.error("sendMessage err:", err);
    }
  }

  /* -----------------------------
     ENTER
  ----------------------------- */
  function setupEnter() {
    const input = $id("msg");
    if (!input) return;

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  /* -----------------------------
     KANBAN — carregar
  ----------------------------- */
  async function carregarKanban() {
    if (!ensureApiKey(true)) return;

    try {
      const resp = await yunoFetch("/api/ia/process", {
        method: "POST",
        body: JSON.stringify({ prompt: "yuno tarefa listar" }),
      });

      if (!resp.ok) {
        uiLog(`carregarKanban: server returned ${resp.status}`, "err");
        return;
      }

      const data = await resp.json();
      const texto = data?.message || "";

      const linhas = texto.split("\n").filter((l) => /\[[A-Za-z0-9\-]+\]/.test(l));

      const pend = $id("list-pendente");
      const prog = $id("list-progresso");
      const conc = $id("list-concluida");

      if (pend) pend.innerHTML = "";
      if (prog) prog.innerHTML = "";
      if (conc) conc.innerHTML = "";

      linhas.forEach((l) => {
        const id = l.match(/\[([A-Za-z0-9\-]+)\]/)?.[1] || "?";
        const titulo = l.split("]").pop().trim();

        let classe = "task normal";
        if (titulo.includes("!")) classe = "task urgente";
        if (titulo.includes("*")) classe = "task prioridade";

        const div = document.createElement("div");
        div.className = classe;
        div.draggable = true;
        div.dataset.id = id;
        div.textContent = titulo;

        div.addEventListener("dragstart", (e) => {
          try {
            e.dataTransfer.setData("text/plain", id);
          } catch (ex) {
            // fallback
            e.dataTransfer.setData("text", id);
          }
        });

        if (l.includes("(concluida)")) conc.appendChild(div);
        else if (l.includes("(progresso)")) prog.appendChild(div);
        else pend.appendChild(div);
      });
    } catch (e) {
      uiLog("Erro carregar Kanban: " + (e && e.message ? e.message : e), "error");
      console.error("carregarKanban err:", e);
    }
  }

  /* -----------------------------
     Drag & Drop corrigido
  ----------------------------- */
  function setupKanbanDragDrop() {
    document.querySelectorAll(".kanban-list").forEach((list) => {
      list.addEventListener("dragover", (e) => e.preventDefault());

      list.addEventListener("drop", async function (e) {
        const id = e.dataTransfer.getData("text/plain") || e.dataTransfer.getData("text") || "";
        if (!id) return;

        let cmd = "";
        if (this.id === "list-pendente") cmd = `yuno tarefa pendente ${id}`;
        if (this.id === "list-progresso") cmd = `yuno tarefa progresso ${id}`;
        if (this.id === "list-concluida") cmd = `yuno tarefa ok ${id}`;

        if (cmd) {
          await yunoFetch("/api/ia/process", {
            method: "POST",
            body: JSON.stringify({ prompt: cmd }),
          }).catch(() => {});
        }

        await carregarKanban();
      });
    });
  }

  /* -----------------------------
     Polling para API key (melhora UX: não trava)
  ----------------------------- */
  function waitForApiKeyAndRun(fn, tries = 30, delay = 300) {
    let i = 0;
    const tid = setInterval(() => {
      i++;
      if (getApiKey()) {
        clearInterval(tid);
        try { fn(); } catch (e) { console.error(e); }
        return;
      }
      if (i >= tries) {
        clearInterval(tid);
        uiLog("Polling por API key expirou; aguarde e defina a chave.", "err");
      }
    }, delay);
  }

  /* -----------------------------
     Inicialização
  ----------------------------- */
  async function init() {
    const chat = $id("chat-box");
    if (chat) chat.innerHTML += `<div class="yuno-system">🔧 Cockpit carregado...</div>`;

    setupEnter();
    setupKanbanDragDrop();

    if (getApiKey()) {
      // chave presente — carregar imediatamente
      await carregarKanban();
    } else {
      // sem chave — inicia polling para não travar UI
      uiLog("API key não detectada no arranque; aguardando definição da chave...", "err");
      waitForApiKeyAndRun(carregarKanban, 60, 500); // tenta por 30s
    }
  }

  /* -----------------------------
     Expor funções
  ----------------------------- */
  window.YUNO = window.YUNO || {};
  window.YUNO.sendMessage = sendMessage;
  window.YUNO.carregarKanban = carregarKanban;
  window.YUNO.getApiKey = getApiKey; // utilitário exposto (segurança: não mostrar chave sem consent)
  window.YUNO.yunoFetch = yunoFetch;

  document.addEventListener("DOMContentLoaded", init);
})();
