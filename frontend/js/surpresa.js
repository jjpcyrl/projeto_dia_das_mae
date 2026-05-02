/**
 * 💐 surpresa.js — Lógica da página de visualização
 * ──────────────────────────────────────────────────
 * 1. Lê o :id da URL
 * 2. Busca a surpresa na API
 * 3. Exibe tela de intro → conteúdo emocional
 */

// Auto-detecta se está rodando via Live Server (porta diferente de 3000)
const API_BASE = (location.port && location.port !== "3000")
  ? "http://localhost:3000"
  : "";
let _typeTimeout = null;

/* ══════════════════════════════════════════════
   🌱 INIT
══════════════════════════════════════════════ */
window.addEventListener("DOMContentLoaded", async () => {
  iniciarCoracoes();

  const id = obterIdDaUrl();
  if (!id) {
    mostrarEstado("state-erro");
    return;
  }

  await carregarSurpresa(id);
});

/* ══════════════════════════════════════════════
   🔍 OBTER ID DA URL
══════════════════════════════════════════════ */
function obterIdDaUrl() {
  // URL: /surpresa/:id
  const partes = window.location.pathname.split("/");
  return partes[partes.length - 1] || null;
}

/* ══════════════════════════════════════════════
   📡 CARREGAR SURPRESA DA API
══════════════════════════════════════════════ */
async function carregarSurpresa(id) {
  mostrarEstado("state-loading");
  animarLoading();

  try {
    const resp = await fetch(`${API_BASE}/api/surpresa/${id}`);
    if (!resp.ok) throw new Error("Não encontrado");
    const data = await resp.json();
    _surpresa = data.surpresa;

    // Pequeno delay para o loading ser bonito
    await esperar(1800);

    // Preenche os dados na intro
    document.getElementById("intro-nome-mae").textContent = _surpresa.nomeMae;

    mostrarEstado("state-intro");

  } catch (err) {
    await esperar(1000);
    mostrarEstado("state-erro");
  }
}

/* ══════════════════════════════════════════════
   🎁 ABRIR SURPRESA (clique no botão da intro)
══════════════════════════════════════════════ */
function abrirSurpresa() {
  if (!_surpresa) return;

  // Preenche os dados da tela de surpresa
  document.getElementById("s-nome-filho").textContent = _surpresa.nomeFilho;
  document.getElementById("s-nome-mae").textContent   = _surpresa.nomeMae;

  // Vídeo
  const video = document.getElementById("s-video");
  video.src = _surpresa.videoUrl;

  // Data formatada
  const data = new Date(_surpresa.criadoEm);
  document.getElementById("s-data").textContent =
    `Criado em ${data.toLocaleDateString("pt-BR", { day:"2-digit", month:"long", year:"numeric" })} 💐`;

  mostrarEstado("state-surpresa");

  // Animações especiais com delay
  setTimeout(() => {
    dispararConfete();
    criarPetalas();
  }, 500);

  setTimeout(() => {
    digitarMensagem(_surpresa.mensagem);
  }, 800);

  // Tenta reproduzir o vídeo
  setTimeout(() => {
    video.play().catch(() => {}); // ok se bloqueado pelo browser
  }, 1200);
}

/* ══════════════════════════════════════════════
   ⌨️ EFEITO MÁQUINA DE ESCREVER
══════════════════════════════════════════════ */
function digitarMensagem(texto) {
  const el     = document.getElementById("s-mensagem");
  const cursor = document.getElementById("typing-cursor");

  el.textContent   = "";
  cursor.style.display = "inline-block";

  if (_typeTimeout) clearTimeout(_typeTimeout);

  let i = 0;
  const vel = 26; // ms por caractere

  function step() {
    if (i < texto.length) {
      el.textContent += texto[i++];
      _typeTimeout = setTimeout(step, vel);
    } else {
      setTimeout(() => { cursor.style.display = "none"; }, 1400);
    }
  }

  setTimeout(step, 200);
}

/* ══════════════════════════════════════════════
   🔁 REVIVER
══════════════════════════════════════════════ */
function reviver() {
  dispararConfete();
  criarPetalas();
  digitarMensagem(_surpresa.mensagem);

  const video = document.getElementById("s-video");
  video.currentTime = 0;
  video.play().catch(() => {});
}

/* ══════════════════════════════════════════════
   🎭 TROCAR ESTADO DE TELA
══════════════════════════════════════════════ */
function mostrarEstado(id) {
  const telas = ["state-loading", "state-erro", "state-intro", "state-surpresa"];
  telas.forEach(t => {
    const el = document.getElementById(t);
    if (!el) return;
    el.style.display = (t === id) ? "flex" : "none";
  });
}

/* ══════════════════════════════════════════════
   ⏳ LOADING ANIMADO
══════════════════════════════════════════════ */
function animarLoading() {
  const fill = document.getElementById("loading-fill");
  let pct = 0;
  const iv = setInterval(() => {
    pct += Math.random() * 14 + 4;
    if (pct > 95) { pct = 95; clearInterval(iv); }
    fill.style.width = pct + "%";
  }, 120);
  // Completa ao chamar mostrarEstado
  setTimeout(() => { fill.style.width = "100%"; }, 1700);
}

/* ══════════════════════════════════════════════
   🎉 CONFETE
══════════════════════════════════════════════ */
function dispararConfete() {
  const cores = ["#e8a0a8","#c9a76c","#fce8ec","#f5e9d0","#d4748a","#fff"];
  confetti({ particleCount: 80, spread: 80, origin: { y: 0.55 }, colors: cores, scalar: 1.1 });
  setTimeout(() => confetti({ particleCount: 45, angle: 60,  spread: 55, origin: { x:0,   y:.6 }, colors: cores }), 300);
  setTimeout(() => confetti({ particleCount: 45, angle: 120, spread: 55, origin: { x:1,   y:.6 }, colors: cores }), 600);
}

/* ══════════════════════════════════════════════
   🌸 PÉTALAS CAINDO
══════════════════════════════════════════════ */
function criarPetalas() {
  const container = document.getElementById("petal-bg");
  container.innerHTML = "";
  const emojis = ["🌸","🌺","🌷","🪷","✨","💫"];

  for (let i = 0; i < 16; i++) {
    const p = document.createElement("span");
    p.className = "petal";
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    p.style.left                = Math.random() * 100 + "vw";
    p.style.fontSize            = (Math.random() * 16 + 12) + "px";
    p.style.animationDuration   = (Math.random() * 8 + 6) + "s";
    p.style.animationDelay      = (Math.random() * 5) + "s";
    container.appendChild(p);
  }
}

/* ══════════════════════════════════════════════
   ❤️ CORAÇÕES FLUTUANTES
══════════════════════════════════════════════ */
function iniciarCoracoes() {
  const container = document.getElementById("bg-hearts");
  const emojis    = ["❤️","🩷","💕","🌸","💫","💖","🌺"];

  function add() {
    const el = document.createElement("span");
    el.className   = "bh";
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left             = Math.random() * 96 + "vw";
    el.style.fontSize         = (Math.random() * 16 + 14) + "px";
    el.style.animationDuration = (Math.random() * 6 + 7) + "s";
    container.appendChild(el);
    setTimeout(() => el.remove(), 14000);
  }

  for (let i = 0; i < 3; i++) setTimeout(add, i * 1000);
  setInterval(add, 2500);
}

/* ══════════════════════════════════════════════
   🛠️ UTILITÁRIOS
══════════════════════════════════════════════ */
function esperar(ms) { return new Promise(r => setTimeout(r, ms)); }

function mostrarToast(msg, tipo = "") {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.className   = `toast ${tipo}`;
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => t.classList.remove("show"), 3200);
}
