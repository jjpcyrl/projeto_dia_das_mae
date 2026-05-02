const { v4: uuidv4 } = require("uuid");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const surpresas = {};

// Gera assinatura para upload direto do frontend
exports.assinar = (req, res) => {
  try {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = "dia-das-maes";
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET
    );
    res.json({
      timestamp,
      signature,
      folder,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
    });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao gerar assinatura." });
  }
};

exports.criar = (req, res) => {
  try {
    const { mensagem, nomeFilho, nomeMae, videoUrl } = req.body;

    if (!mensagem || mensagem.trim() === "")
      return res.status(400).json({ erro: "A mensagem não pode estar vazia." });
    if (!videoUrl)
      return res.status(400).json({ erro: "É necessário enviar um vídeo." });

    const id = uuidv4().slice(0, 10);
    const surpresa = {
      id,
      nomeFilho: nomeFilho || "Alguém especial",
      nomeMae:   nomeMae   || "Mãezinha",
      mensagem:  mensagem.trim(),
      videoUrl,
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
    res.status(500).json({ erro: "Erro interno ao criar surpresa." });
  }
};

exports.buscar = (req, res) => {
  try {
    const { id } = req.params;
    if (!surpresas[id])
      return res.status(404).json({ erro: "Surpresa não encontrada." });
    res.json({ sucesso: true, surpresa: surpresas[id] });
  } catch (err) {
    res.status(500).json({ erro: "Erro interno ao buscar surpresa." });
  }
};