const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const client = require("firebase-tools");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAuth } = require("google-auth-library"); // Para converter o JSON em Token
const fs = require("fs");
const os = require("os");
const path = require("path");
const axios = require("axios");

admin.initializeApp();

// Auxiliar para criar IDs de site amigáveis
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

exports.criarPublicarSite = onCall({ 
  timeoutSeconds: 540, 
  memory: "1GiB",
  cors: true, 
  region: "us-central1",
  secrets: ["FB_TOKEN", "GEMINI_KEY"]
}, async (request) => {
  
  const data = request.data;
  const nomeEmpresa = data.nomeEmpresa || "Meu Site Incrivel";
  const siteId = gerarSlug(nomeEmpresa) + "-" + Math.floor(Math.random() * 1000);
  const prompt = data.prompt;
  const projectId = "criador-de-site-1a91d"; 

  // Pegamos os valores brutos do Cofre (Secret Manager)
  const firebaseTokenRaw = process.env.FB_TOKEN;
  const geminiKey = process.env.GEMINI_KEY;

  if (!firebaseTokenRaw || !geminiKey) {
    throw new HttpsError("failed-precondition", "Segredos não configurados no servidor.");
  }

  // --- PASSO 0: Autenticação (Transforma JSON em Token de Acesso) ---
  let accessToken;
  try {
    const auth = new GoogleAuth({
      credentials: JSON.parse(firebaseTokenRaw),
      scopes: [
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/firebase'
      ]
    });
    const clientAuth = await auth.getClient();
    const tokenResponse = await clientAuth.getAccessToken();
    accessToken = tokenResponse.token;
  } catch (err) {
    console.error("Erro ao processar JSON do FB_TOKEN:", err);
    throw new HttpsError("unauthenticated", "Erro interno de autenticação.");
  }

  console.log(`Iniciando criação para: ${nomeEmpresa} (ID: ${siteId})`);

  // --- PASSO 1: Criar o Site no Firebase Hosting via API ---
  try {
    await axios.post(
      `https://firebasehosting.googleapis.com/v1beta1/projects/${projectId}/sites?siteId=${siteId}`,
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    console.log(`Site ${siteId} criado.`);
  } catch (e) {
    if (e.response && e.response.status === 409) {
      console.log(`Site ${siteId} já existe.`);
    } else {
      console.error("Erro API Hosting:", e.response ? e.response.data : e.message);
      throw new HttpsError("internal", "Não foi possível registrar o site.");
    }
  }

  // --- PASSO 2: IA gera o HTML ---
  const genAI = new GoogleGenerativeAI(geminiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  
  const result = await model.generateContent(`
    Crie um index.html ÚNICO, completo e moderno para a empresa "${nomeEmpresa}".
    O tema é: ${prompt}.
    Use TailwindCSS via CDN. Retorne APENAS o código HTML.
  `);
  
  let html = result.response.text();
  html = html.replace(/```html/g, "").replace(/```/g, "");

  // --- PASSO 3: Criar arquivos temporários ---
  const tempDir = path.join(os.tmpdir(), siteId);
  const publicDir = path.join(tempDir, "public");

  if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
  fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(path.join(publicDir, "index.html"), html);

  const firebaseJson = { hosting: { public: "public", ignore: ["firebase.json", "**/.*"] } };
  fs.writeFileSync(path.join(tempDir, "firebase.json"), JSON.stringify(firebaseJson));

  // --- PASSO 4: Deploy final ---
  try {
    // Para o deploy via biblioteca, usamos o accessToken gerado
    await client.deploy({
      project: projectId,
      token: accessToken,
      cwd: tempDir,
      only: "hosting"
    });

    return { 
      success: true, 
      url: `https://${siteId}.web.app`,
      siteId: siteId
    };

  } catch (error) {
    console.error("Erro no deploy final:", error);
    throw new HttpsError("internal", "Erro ao publicar os arquivos do site.");
  }
});
