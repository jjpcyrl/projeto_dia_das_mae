/**
 * Rotas: /api/surpresa
 */

const express    = require("express");
const router     = express.Router();
const multer     = require("multer");
const path       = require("path");
const ctrl       = require("../controllers/surpresaController");

/* ── Configuração do Multer ── */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    // Prefixo de timestamp para evitar colisões de nome
    const ext  = path.extname(file.originalname);
    const nome = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, nome);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB max
  fileFilter: (req, file, cb) => {
    const tipos = /mp4|webm|ogg|mov|avi|mkv/i;
    if (tipos.test(path.extname(file.originalname))) return cb(null, true);
    cb(new Error("Apenas vídeos são permitidos."));
  },
});

/* ── Endpoints ── */

// POST /api/surpresa — cria uma nova surpresa
router.post("/", upload.single("video"), ctrl.criar);

// GET /api/surpresa/:id — retorna dados da surpresa
router.get("/:id", ctrl.buscar);

// Tratamento de erro do Multer
router.use((err, req, res, next) => {
  res.status(400).json({ erro: err.message });
});

module.exports = router;
