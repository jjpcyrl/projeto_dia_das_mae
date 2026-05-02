const express = require("express");
const router  = express.Router();
const multer  = require("multer");
const path    = require("path");
const ctrl    = require("../controllers/surpresaController");

// Usa memoryStorage — não salva no disco
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const tipos = /mp4|webm|ogg|mov|avi|mkv/i;
    if (tipos.test(path.extname(file.originalname))) return cb(null, true);
    cb(new Error("Apenas vídeos são permitidos."));
  },
});

router.post("/", upload.single("video"), ctrl.criar);
router.get("/:id", ctrl.buscar);

router.use((err, req, res, next) => {
  res.status(400).json({ erro: err.message });
});

module.exports = router;