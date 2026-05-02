/**
 * Controller: surpresaController
 * ─────────────────────────────────────
 * Responsável por criar e buscar surpresas.
 * Armazena os dados em /data/surpresas.json
 */

const path = require("path");
const fs   = require("fs");
const { v4: uuidv4 } = require("uuid");

const DATA_FILE = path.join(__dirname, "../data/surpresas.json");

/* ── Helpers de persistência ── */

function lerDados() {
  if (!fs.existsSync(DATA_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function salvarDados(dados) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(dados, null, 2), "utf-8");
}

/* ── CRIAR surpresa ── */
exports.criar = (req, res) => {
  try {
    const { mensagem, nomeFilho, nomeMae } = req.body;

    if (!mensagem || mensagem.trim() === "") {
      return res.status(400).json({ erro: "A mensagem não pode estar vazia." });
    }

    if (!req.file) {
      return res.status(400).json({ erro: "É necessário enviar um vídeo." });
    }

    const id = uuidv4().slice(0, 10); // ID curto e amigável
    const videoUrl = `/uploads/${req.file.filename}`;

    const surpresa = {
      id,
      nomeFilho: nomeFilho || "Alguém especial",
      nomeMae:   nomeMae   || "Mãezinha",
      mensagem:  mensagem.trim(),
      videoUrl,
      criadoEm: new Date().toISOString(),
    };

    // Persiste no JSON
    const dados = lerDados();
    dados[id] = surpresa;
    salvarDados(dados);

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

/* ── BUSCAR surpresa por ID ── */
exports.buscar = (req, res) => {
  try {
    const { id } = req.params;
    const dados  = lerDados();

    if (!dados[id]) {
      return res.status(404).json({ erro: "Surpresa não encontrada." });
    }

    res.json({ sucesso: true, surpresa: dados[id] });
  } catch (err) {
    console.error("[BUSCAR]", err);
    res.status(500).json({ erro: "Erro interno ao buscar surpresa." });
  }
};
