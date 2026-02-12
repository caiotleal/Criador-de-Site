/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
// Adicione o objeto de configuração como primeiro argumento
exports.criarPublicarSite = onCall({ 
  cors: true, // Isso libera o acesso para o seu domínio .web.app
  region: "us-central1" // Certifique-se de que a região é a mesma da imagem
}, async (request) => {
  });
const admin = require("firebase-admin");
const client = require("firebase-tools");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const os = require("os");
const path = require("path");
const axios = require("axios");

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

// --- AQUI ESTÁ A MUDANÇA PARA V2 ---
exports.criarPublicarSite = onCall(
  { 
    timeoutSeconds: 540, 
    memory: "1GiB",
    cors: true // Permite chamar do frontend sem erro de CORS
  }, 
  async (request) => {
    // Na V2, os dados vêm dentro de request.data
    const data = request.data;
    
    const nomeEmpresa = data.nomeEmpresa || "Meu Site Incrivel";
    // Adicionei um número aleatório para evitar duplicidade de site ID
    const siteId = gerarSlug(nomeEmpresa) + "-" + Math.floor(Math.random() * 1000);
    const prompt = data.prompt;
    
    // Configurações Fixas
    const projectId = "criador-de-site-1a91d"; 
    // Substitua as strings diretas por isso:
    const firebaseToken = process.env.FB_TOKEN;
    const geminiKey = process.env.GEMINI_KEY;

    console.log(`Iniciando criação para: ${nomeEmpresa} (ID: ${siteId})`);

    // --- PASSO 1: Garantir que o Site existe no Firebase ---
    try {
      await axios.post(
        `https://firebasehosting.googleapis.com/v1beta1/projects/${projectId}/sites?siteId=${siteId}`,
        {},
        { headers: { Authorization: `Bearer ${firebaseToken}` } }
      );
      console.log(`Site ${siteId} criado com sucesso.`);
    } catch (e) {
      if (e.response && e.response.status === 409) {
        console.log(`Site ${siteId} já existe. Atualizando...`);
      } else {
        console.error("Erro fatal ao criar site:", e.message);
        throw new HttpsError("internal", "Erro ao registrar o site no Firebase.");
      }
    }

    // --- PASSO 2: Gerar HTML com IA ---
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    
    const result = await model.generateContent(`
      Atue como um desenvolvedor web sênior.
      Crie um arquivo index.html ÚNICO, completo, responsivo e moderno para: ${prompt}.
      O nome da empresa é "${nomeEmpresa}".
      Regras:
      1. Use TailwindCSS via CDN.
      2. Inclua imagens placeholder do Unsplash.
      3. NÃO use markdown. Retorne APENAS o código HTML cru.
    `);
    
    let html = result.response.text();
    html = html.replace(/```html/g, "").replace(/```/g, "");

    // --- PASSO 3: Preparar o ambiente temporário ---
    const tempDir = path.join(os.tmpdir(), siteId);
    const publicDir = path.join(tempDir, "public");

    if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
    fs.mkdirSync(publicDir, { recursive: true });
    fs.writeFileSync(path.join(publicDir, "index.html"), html);

    // --- PASSO 4: Configuração Dinâmica ---
    const firebaseJson = {
      hosting: {
        target: "alvo-dinamico", 
        public: "public",
        ignore: ["firebase.json", "**/.*", "**/node_modules/**"]
      }
    };
    
    const firebaserc = {
      projects: { default: projectId },
      targets: {
        [projectId]: {
          hosting: { "alvo-dinamico": [siteId] }
        }
      }
    };

    fs.writeFileSync(path.join(tempDir, "firebase.json"), JSON.stringify(firebaseJson));
    fs.writeFileSync(path.join(tempDir, ".firebaserc"), JSON.stringify(firebaserc));

    // --- PASSO 5: Deploy ---
    try {
      await client.deploy({
        project: projectId,
        token: firebaseToken,
        cwd: tempDir,
        only: "hosting:alvo-dinamico"
      });

      return { 
        success: true, 
        url: `https://${siteId}.web.app`,
        adminPanel: `https://console.firebase.google.com/project/${projectId}/hosting/sites/${siteId}`
      };

    } catch (error) {
      console.error("Erro no deploy:", error);
      throw new HttpsError("internal", "Erro ao publicar no Firebase Hosting.");
    }
  }
);
