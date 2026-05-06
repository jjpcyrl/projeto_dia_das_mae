const { v4: uuidv4 } = require("uuid");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

exports.criar = async (req, res) => {
  try {
    const { mensagem, nomeFilho, nomeMae, videoUrl } = req.body;

    if (!mensagem || mensagem.trim() === "")
      return res.status(400).json({ erro: "A mensagem nao pode estar vazia." });
    if (!videoUrl)
      return res.status(400).json({ erro: "E necessario enviar um video." });

    const id = uuidv4().slice(0, 10);

    const { error } = await supabase.from("surpresas").insert({
      id,
      nome_filho: nomeFilho || "Alguem especial",
      nome_mae:   nomeMae   || "Maezinha",
      mensagem:   mensagem.trim(),
      video_url:  videoUrl,
    });

    if (error) throw error;

    res.status(201).json({
      sucesso: true,
      id,
      link: `${req.protocol}://${req.get("host")}/surpresa/${id}`,
    });
  } catch (err) {
    console.error("[CRIAR]", err);
    res.status(500).json({ erro: "Erro interno ao criar surpresa." });
  }
};

exports.buscar = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("surpresas")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data)
      return res.status(404).json({ erro: "Surpresa nao encontrada." });

    res.json({ sucesso: true, surpresa: {
      id: data.id,
      nomeFilho: data.nome_filho,
      nomeMae:   data.nome_mae,
      mensagem:  data.mensagem,
      videoUrl:  data.video_url,
      criadoEm: data.criado_em,
    }});
  } catch (err) {
    console.error("[BUSCAR]", err);
    res.status(500).json({ erro: "Erro interno ao buscar surpresa." });
  }
};