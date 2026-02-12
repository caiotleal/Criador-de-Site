const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const client = require("firebase-tools");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const os = require("os");
const path = require("path");
const axios = require("axios");

// Inicializa o Admin
admin.initializeApp();

// --- Função Auxiliar: Transforma "Bar do Tião" em "bar-do-tiao" ---
function gerarSlug(texto) {
  return texto
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

// --- CONFIGURAÇÃO DA FUNÇÃO V2 ---
exports.criarPublicarSite = onCall({ 
  timeoutSeconds: 540, 
  memory: "1GiB",
  cors: true, 
  region: "us-central1",
  secrets: ["FB_TOKEN", "GEMINI_KEY"] // Garante que a função carregue os segredos
}, async (request) => {
  
  const data = request.data;
  const nomeEmpresa = data.nomeEmpresa || "Meu Site Incrivel";
  const siteId = gerarSlug(nomeEmpresa) + "-" + Math.floor(Math.random() * 1000);
  const prompt = data.prompt;
  const projectId = "criador-de-site-1a91d"; 

  // Como FB_TOKEN agora é um JSON, precisamos extrair a permissão dele
  // Se você carregou o JSON da conta de serviço, o firebase-tools e o axios precisam saber lidar com isso
  const firebaseToken = process.env.FB_TOKEN; 
  const geminiKey = process.env.GEMINI_KEY;

  console.log(`Iniciando criação para: ${nomeEmpresa} (ID: ${siteId})`);

  // --- PASSO 1: Garantir que o Site existe no Firebase ---
  try {
    // Nota: Se o axios falhar com 401 usando o JSON, você precisará gerar um token de acesso temporário
    await axios.post(
      `https://firebasehosting.googleapis.com/v1beta1/projects/${projectId}/sites?siteId=${siteId}`,
      {},
      { headers: { Authorization: `Bearer ${firebaseToken}` } }
    );
    console.log(`Site ${siteId} criado com sucesso.`);
  } catch (e) {
    if (e.response && e.response.status === 409) {
      console.log(`Site ${siteId} já existe. Seguindo...`);
    } else {
      console.error("Erro fatal ao criar site:", e.response ? e.response.data : e.message);
      // Se der erro 401 aqui, significa que o Hosting não aceitou o JSON puro como Token
      throw new HttpsError("internal", "Erro de autenticação no Firebase.");
    }
  }

  // --- PASSO 2: Gerar HTML com IA ---
  const genAI = new GoogleGenerativeAI(geminiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  
  const result = await model.generateContent(`
    Atue como um desenvolvedor web sênior.
    Crie um arquivo index.html ÚNICO, completo, responsivo e moderno para: ${prompt}.
    O nome da empresa é "${nomeEmpresa}".
    Use TailwindCSS via CDN e imagens do Unsplash. Retorne apenas o HTML puro.
  `);
  
  let html = result.response.text();
  html = html.replace(/```html/g, "").replace(/```/g, "");

  // --- PASSO 3: Preparar o ambiente temporário ---
  const tempDir = path.join(os.tmpdir(), siteId);
  const publicDir = path.join(tempDir, "public");

  if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
  fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(path.join(publicDir, "index.html"), html);

  // --- PASSO 4: Configuração do Firebase Hosting ---
  const firebaseJson = {
    hosting: {
      public: "public",
      ignore: ["firebase.json", "**/.*"]
    }
  };
  
  fs.writeFileSync(path.join(tempDir, "firebase.json"), JSON.stringify(firebaseJson));

  // --- PASSO 5: Deploy ---
  try {
    await client.deploy({
      project: projectId,
      token: firebaseToken, // O firebase-tools aceita o token de CI ou o caminho do arquivo
      cwd: tempDir,
      only: "hosting"
    });

    return { 
      success: true, 
      url: `https://${siteId}.web.app`,
      siteId: siteId
    };

  } catch (error) {
    console.error("Erro no deploy:", error);
    throw new HttpsError("internal", "Erro ao publicar o site.");
  }
});
