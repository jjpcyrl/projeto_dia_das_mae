const path = require("path");
const { v4: uuidv4 } = require("uuid");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Armazenamento em memória (temporário por sessão)
const surpresas = {};

exports.criar = async (req, res) => {
  try {
    const { mensagem, nomeFilho, nomeMae } = req.body;

    if (!mensagem || mensagem.trim() === "") {
      return res.status(400).json({ erro: "A mensagem não pode estar vazia." });
    }

    if (!req.file) {
      return res.status(400).json({ erro: "É necessário enviar um vídeo." });
    }

    // Upload para Cloudinary usando buffer
    const resultado = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "video", folder: "dia-das-maes" },
        (error, result) => error ? reject(error) : resolve(result)
      );
      stream.end(req.file.buffer);
    });

    const id = uuidv4().slice(0, 10);
    const surpresa = {
      id,
      nomeFilho: nomeFilho || "Alguém especial",
      nomeMae:   nomeMae   || "Mãezinha",
      mensagem:  mensagem.trim(),
      videoUrl:  resultado.secure_url,
      criadoEm: new Date().toISOString(),
    };

    surpresas[id] = surpresa;

    res.status(201).json({
      sucesso: true,
      id,
      link: `${req.protocol}://${req.get("host")}/surpresa/${id}`,
      surpresa,
    });
  } catch (err) {
    console.error("[CRIAR]", err);
    res.status(500).json({ erro: "Erro interno ao criar surpresa." });
  }
};

exports.buscar = (req, res) => {
  try {
    const { id } = req.params;
    if (!surpresas[id]) {
      return res.status(404).json({ erro: "Surpresa não encontrada." });
    }
    res.json({ sucesso: true, surpresa: surpresas[id] });
  } catch (err) {
    console.error("[BUSCAR]", err);
    res.status(500).json({ erro: "Erro interno ao buscar surpresa." });
  }
};