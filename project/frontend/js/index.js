/**
 * 💐 index.js — Lógica da página de criação de surpresa
 * ────────────────────────────────────────────────────
 * Fluxo: Modal → Upload/Mensagem → POST /api/surpresa
 *        → Exibe link + QR Code
 */

// Se o front estiver sendo aberto pelo Live Server (porta diferente de 3000),
// aponta para o backend Node. Caso contrário, usa a mesma origem.
const API = (location.port && location.port !== "3000")
  ? "http://localhost:3000"
  : "";

/* ── Estado global ── */
let _linkGerado   = "";
let _idGerado     = "";
let _qrInstance   = null;
let _videoSelecionado = null;

/* ══════════════════════════════════════════════
   🌸 INIT
══════════════════════════════════════════════ */
window.addEventListener("DOMContentLoaded", () => {
  iniciarCoracoes();
  monitorarContador();
  configurarDragDrop();
});

/* ══════════════════════════════════════════════
   🧭 MODAL
══════════════════════════════════════════════ */
function abrirModal() {
  document.getElementById("modal-overlay").classList.add("open");
  document.body.style.overflow = "hidden";
}

function fecharModal() {
  document.getElementById("modal-overlay").classList.remove("open");
  document.body.style.overflow = "";
}

// Fecha ao clicar fora do modal
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("modal-overlay").addEventListener("click", e => {
    if (e.target.id === "modal-overlay") fecharModal();
  });
});

/* ══════════════════════════════════════════════
   📹 SELEÇÃO DE VÍDEO
══════════════════════════════════════════════ */
function onVideoSelecionado(input) {
  const file = input.files[0];
  if (!file) return;
  _videoSelecionado = file;

  const url = URL.createObjectURL(file);
  const preview = document.getElementById("video-preview");
  preview.src = url;

  document.getElementById("upload-placeholder").style.display = "none";
  document.getElementById("video-preview-wrap").style.display = "block";
}

function removerVideo() {
  _videoSelecionado = null;
  document.getElementById("video-input").value = "";
  document.getElementById("video-preview").src = "";
  document.getElementById("upload-placeholder").style.display = "block";
  document.getElementById("video-preview-wrap").style.display = "none";
}

/* Drag & Drop */
function configurarDragDrop() {
  const area = document.getElementById("upload-area");
  if (!area) return;

  area.addEventListener("dragover", e => {
    e.preventDefault();
    area.style.borderColor = "var(--rose-deep)";
    area.style.background  = "#fff8f9";
  });

  area.addEventListener("dragleave", () => {
    area.style.borderColor = "";
    area.style.background  = "";
  });

  area.addEventListener("drop", e => {
    e.preventDefault();
    area.style.borderColor = "";
    area.style.background  = "";
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("video/")) {
      mostrarToast("Apenas arquivos de vídeo são aceitos.", "error");
      return;
    }
    // Simula seleção manual
    const input = document.getElementById("video-input");
    // FileList não é diretamente mutável; usamos DataTransfer
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    onVideoSelecionado(input);
  });
}

/* ══════════════════════════════════════════════
   📬 ENVIAR SURPRESA
══════════════════════════════════════════════ */
async function enviarSurpresa() {
  const nomeFilho = document.getElementById("nome-filho").value.trim();
  const nomeMae   = document.getElementById("nome-mae").value.trim();
  const mensagem  = document.getElementById("mensagem").value.trim();

  /* Validações */
  if (!mensagem) {
    mostrarToast("Escreva uma mensagem antes de continuar 🌸", "error");
    document.getElementById("mensagem").focus();
    return;
  }
  if (!_videoSelecionado) {
    mostrarToast("Escolha um vídeo para enviar 🎥", "error");
    return;
  }

  /* Loading */
  setLoading(true);

  try {
    const formData = new FormData();
    formData.append("video",      _videoSelecionado);
    formData.append("mensagem",   mensagem);
    formData.append("nomeFilho",  nomeFilho || "Alguém especial");
    formData.append("nomeMae",    nomeMae   || "Mamãe");

    const resp = await fetch(`${API}/api/surpresa`, {
      method: "POST",
      body:   formData,
    });

    const data = await resp.json();

    if (!resp.ok) {
      throw new Error(data.erro || "Erro ao criar surpresa.");
    }

    /* Sucesso */
    _linkGerado = data.link;
    _idGerado   = data.id;

    mostrarResultado();

  } catch (err) {
    console.error(err);
    mostrarToast(err.message || "Erro ao criar surpresa. Tente novamente.", "error");
  } finally {
    setLoading(false);
  }
}

function setLoading(ativo) {
  const btn     = document.getElementById("btn-enviar");
  const txt     = document.getElementById("btn-enviar-txt");
  const spinner = document.getElementById("spinner");
  btn.disabled        = ativo;
  txt.style.display   = ativo ? "none"  : "inline";
  spinner.style.display = ativo ? "block" : "none";
}

/* ══════════════════════════════════════════════
   🎉 TELA DE RESULTADO
══════════════════════════════════════════════ */
function mostrarResultado() {
  document.getElementById("step-upload").style.display    = "none";
  document.getElementById("step-resultado").style.display = "block";

  document.getElementById("link-texto").textContent = _linkGerado;
  _qrInstance = null; // reseta QR para poder gerar novamente
}

/* ══════════════════════════════════════════════
   📋 COPIAR LINK
══════════════════════════════════════════════ */
function copiarLink() {
  navigator.clipboard.writeText(_linkGerado).then(() => {
    mostrarToast("Link copiado! 📋", "success");
  });
}

/* ══════════════════════════════════════════════
   📱 GERAR QR CODE
══════════════════════════════════════════════ */
function gerarQR() {
  const wrap = document.getElementById("qr-wrap");
  const container = document.getElementById("qr-canvas");

  wrap.style.display = "flex";

  if (_qrInstance) return; // já gerado

  // Limpa conteúdo anterior
  container.innerHTML = "";

  // qrcodejs cria uma <img> dentro do div
  _qrInstance = new QRCode(container, {
    text:         _linkGerado,
    width:        220,
    height:       220,
    colorDark:    "#3a2a2e",
    colorLight:   "#ffffff",
    correctLevel: QRCode.CorrectLevel.H,
  });

  mostrarToast("QR Code gerado! 📱", "success");
}

/* ══════════════════════════════════════════════
   ⬇️ EXPORTAR QR CODE COMO PNG
══════════════════════════════════════════════ */
function exportarQR() {
  if (!_qrInstance) {
    mostrarToast("Gere o QR Code primeiro 📱", "error");
    return;
  }

  // qrcodejs gera uma <img> e um <canvas> dentro do container
  const container = document.getElementById("qr-canvas");
  const canvas = container.querySelector("canvas");
  const img    = container.querySelector("img");

  if (canvas) {
    // Prefere o canvas (mais fiel)
    const link = document.createElement("a");
    link.download = "surpresa-qrcode.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    mostrarToast("QR Code baixado! 🎉", "success");

  } else if (img) {
    // Fallback: usa a <img> gerada
    const link = document.createElement("a");
    link.download = "surpresa-qrcode.png";
    link.href = img.src;
    link.click();
    mostrarToast("QR Code baixado! 🎉", "success");

  } else {
    mostrarToast("Erro ao exportar. Tente novamente.", "error");
  }
}

/* ══════════════════════════════════════════════
   👀 VER SURPRESA
══════════════════════════════════════════════ */
function verSurpresa() {
  window.open(_linkGerado, "_blank");
}

/* ══════════════════════════════════════════════
   ➕ NOVA SURPRESA
══════════════════════════════════════════════ */
function novaSurpresa() {
  // Reseta formulário
  document.getElementById("nome-filho").value = "";
  document.getElementById("nome-mae").value   = "";
  document.getElementById("mensagem").value   = "";
  document.getElementById("char-n").textContent = "0";
  removerVideo();

  _linkGerado = "";
  _idGerado   = "";
  _qrInstance = null;

  document.getElementById("qr-wrap").style.display    = "none";
  document.getElementById("step-resultado").style.display = "none";
  document.getElementById("step-upload").style.display    = "block";
}

/* ══════════════════════════════════════════════
   🔤 CONTADOR DE CARACTERES
══════════════════════════════════════════════ */
function monitorarContador() {
  const ta = document.getElementById("mensagem");
  if (!ta) return;
  ta.addEventListener("input", () => {
    document.getElementById("char-n").textContent = ta.value.length;
  });
}

/* ══════════════════════════════════════════════
   🍞 TOAST
══════════════════════════════════════════════ */
function mostrarToast(msg, tipo = "") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className   = `toast ${tipo}`;
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => t.classList.remove("show"), 3200);
}

/* ══════════════════════════════════════════════
   ❤️ CORAÇÕES FLUTUANTES
══════════════════════════════════════════════ */
function iniciarCoracoes() {
  const container = document.getElementById("bg-hearts");
  const emojis    = ["❤️", "🩷", "💕", "🌸", "💫", "💖", "🌺"];

  function add() {
    const el = document.createElement("span");
    el.className   = "bh";
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left             = Math.random() * 96 + "vw";
    el.style.fontSize         = (Math.random() * 18 + 14) + "px";
    el.style.animationDuration = (Math.random() * 6 + 7) + "s";
    el.style.animationDelay   = "0s";
    container.appendChild(el);
    setTimeout(() => el.remove(), 14000);
  }

  for (let i = 0; i < 4; i++) setTimeout(add, i * 900);
  setInterval(add, 2400);
}
