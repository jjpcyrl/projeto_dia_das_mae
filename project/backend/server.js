const express  = require("express");
const cors     = require("cors");
const path     = require("path");

const surpresaRoutes = require("./routes/surpresa");

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: (origin, cb) => cb(null, true),
  methods: ["GET", "POST"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/surpresa", surpresaRoutes);

app.get("/surpresa/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/surpresa.html"));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada" });
});

app.listen(PORT, () => {
  console.log(`\n🌸 Servidor rodando em http://localhost:${PORT}\n`);
});