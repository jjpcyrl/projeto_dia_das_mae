/**
 * 💐 Dia das Mães — Servidor Principal
 * ─────────────────────────────────────
 * Express + Multer + UUID
 * Porta padrão: 3000
 */

const express  = require("express");
const cors     = require("cors");
const path     = require("path");
const fs       = require("fs");

const surpresaRoutes = require("./routes/surpresa");

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── Garante que as pastas existam ── */
["uploads", "data"].forEach(dir => {
  const full = path.join(__dirname, dir);
  if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
});

/* ── Middlewares globais ── */
// Aceita requisições do Live Server (porta 5500/5501) e da própria origem
app.use(cors({
  origin: (origin, cb) => cb(null, true), // permite qualquer origem em dev
  methods: ["GET", "POST"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ── Arquivos estáticos ── */
// Serve o front-end diretamente pela mesma origem (sem CORS extra)
app.use(express.static(path.join(__dirname, "../frontend")));

// Serve os vídeos enviados
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ── Rotas da API ── */
app.use("/api/surpresa", surpresaRoutes);

/* ── Rota de visualização da surpresa (SPA fallback) ── */
// Qualquer acesso a /surpresa/:id serve o surpresa.html
app.get("/surpresa/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/surpresa.html"));
});

/* ── Rota raiz ── */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

/* ── 404 genérico ── */
app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada" });
});

/* ── Inicia servidor ── */
app.listen(PORT, () => {
  console.log(`\n🌸 Servidor rodando em http://localhost:${PORT}\n`);
});
