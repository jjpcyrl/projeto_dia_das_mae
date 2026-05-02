# 💐 Surpresa Dia das Mães — Guia Completo

Sistema completo de surpresas personalizadas com vídeo, mensagem, link compartilhável e QR Code.

---

## 🗂️ Estrutura do projeto

```
project/
├── backend/
│   ├── server.js                  ← Servidor Express (entrada)
│   ├── routes/
│   │   └── surpresa.js            ← Rotas da API
│   ├── controllers/
│   │   └── surpresaController.js  ← Lógica MVC
│   ├── data/
│   │   └── surpresas.json         ← Banco de dados (criado automático)
│   └── uploads/                   ← Vídeos recebidos (criado automático)
│
└── frontend/
    ├── index.html                 ← Página de criação
    ├── surpresa.html              ← Página de visualização
    ├── css/
    │   ├── global.css             ← Estilos compartilhados
    │   ├── index.css              ← Estilos da criação
    │   └── surpresa.css           ← Estilos da visualização
    └── js/
        ├── index.js               ← Lógica da criação
        └── surpresa.js            ← Lógica da visualização
```

---

## 🚀 Como executar (passo a passo)

### 1. Pré-requisitos

Certifique-se de ter o **Node.js** instalado (versão 16 ou superior):

```bash
node --version
# deve mostrar v16.x.x ou superior
```

### 2. Instale as dependências

```bash
cd project/backend
npm install
```

> ✅ Isso instala: `express`, `multer`, `uuid`, `cors`

### 3. Inicie o servidor

```bash
npm start
# ou: node server.js
```

Você verá no terminal:
```
🌸 Servidor rodando em http://localhost:3000
```

### 4. Acesse no navegador

Abra **http://localhost:3000**

---

## 🎯 Fluxo de uso

```
Usuário → clica "Abrir minha surpresa"
       → modal abre
       → preenche nome, mensagem, faz upload do vídeo
       → clica "Criar surpresa"
       → recebe link: http://localhost:3000/surpresa/abc123xyz
       → clica "Gerar QR Code"
       → compartilha o link ou QR com a mamãe
       
Mamãe  → acessa o link
       → vê tela de boas-vindas com o nome dela
       → clica "Abrir minha surpresa"
       → assiste ao vídeo e lê a mensagem com animação
```

---

## 🌐 Endpoints da API

| Método | Rota                   | Descrição                            |
|--------|------------------------|--------------------------------------|
| POST   | `/api/surpresa`        | Cria nova surpresa (multipart/form)  |
| GET    | `/api/surpresa/:id`    | Retorna dados da surpresa por ID     |
| GET    | `/surpresa/:id`        | Serve a página de visualização       |
| GET    | `/`                    | Serve a página de criação            |

### POST `/api/surpresa` — campos esperados

| Campo       | Tipo    | Obrigatório | Descrição               |
|-------------|---------|-------------|-------------------------|
| `video`     | arquivo | ✅ sim      | Vídeo (mp4/webm/mov)    |
| `mensagem`  | texto   | ✅ sim      | Mensagem personalizada  |
| `nomeFilho` | texto   | não         | Nome de quem enviou     |
| `nomeMae`   | texto   | não         | Nome da mamãe           |

### Resposta de sucesso

```json
{
  "sucesso": true,
  "id": "a1b2c3d4e5",
  "link": "http://localhost:3000/surpresa/a1b2c3d4e5",
  "surpresa": {
    "id": "a1b2c3d4e5",
    "nomeFilho": "Ana",
    "nomeMae": "Maria",
    "mensagem": "Mãe, te amo muito!",
    "videoUrl": "/uploads/1234567890-video.mp4",
    "criadoEm": "2025-05-11T10:30:00.000Z"
  }
}
```

---

## 🛠️ Personalização

### Trocar a porta do servidor

```bash
PORT=8080 node server.js
```

### Aumentar o limite de tamanho do vídeo

Em `routes/surpresa.js`, altere:
```js
limits: { fileSize: 500 * 1024 * 1024 } // 500 MB
```

### Usar em produção (IP da rede local)

Para que outras pessoas na mesma rede acessem o link:

1. Descubra o IP local da máquina:
   ```bash
   # Mac/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```

2. Compartilhe o link como:
   ```
   http://192.168.1.X:3000/surpresa/abc123
   ```

3. O QR Code será gerado com `window.location.origin` automaticamente — 
   para que funcione na rede, atualize a linha no `controllers/surpresaController.js`:
   ```js
   link: `http://SEU_IP_LOCAL:3000/surpresa/${id}`,
   ```

---

## 🔧 Dependências usadas

| Pacote    | Versão  | Função                          |
|-----------|---------|---------------------------------|
| express   | ^5.x    | Servidor HTTP                   |
| multer    | ^2.x    | Upload de arquivos              |
| uuid      | ^14.x   | Geração de IDs únicos           |
| cors      | ^2.x    | Habilitar cross-origin requests |

**Frontend (CDN, sem instalação):**
- `canvas-confetti` — chuva de confete
- `qrcodejs` — geração do QR Code
- Google Fonts — tipografia elegante

---

## ✨ Funcionalidades implementadas

- [x] Modal com upload de vídeo + preview antes de enviar
- [x] Drag & drop de vídeo
- [x] Contador de caracteres na mensagem
- [x] Loading animado durante envio
- [x] Geração de ID único (UUID)
- [x] Persistência em JSON local
- [x] Link compartilhável único
- [x] QR Code gerado no front-end
- [x] Página de visualização emocional
- [x] Efeito máquina de escrever na mensagem
- [x] Confete ao abrir a surpresa
- [x] Pétalas caindo + corações flutuantes
- [x] Botão "Reviver esse momento"
- [x] Toast de feedback (copiar link, erros)
- [x] Layout responsivo (mobile first)
- [x] Arquitetura MVC no backend
