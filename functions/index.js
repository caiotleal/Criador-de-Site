const functions = require("firebase-functions");
const admin = require("firebase-admin");
const client = require("firebase-tools");
const { GoogleGenerativeAI } = require("@google/generative-ai"); // Importação correta
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
    .normalize("NFD") // Separa acentos das letras
    .replace(/[\u0300-\u036f]/g, "") // Remove os acentos
    .replace(/\s+/g, "-") // Troca espaços por hífens
    .replace(/[^\w\-]+/g, "") // Remove tudo que não for letra, número ou hífen
    .replace(/\-\-+/g, "-") // Remove hífens duplicados
    .replace(/^-+/, "") // Remove hífen do começo
    .replace(/-+$/, ""); // Remove hífen do fim
}

exports.criarPublicarSite = functions
  .runWith({ timeoutSeconds: 540, memory: "1GB" }) // Aumentei o timeout para garantir
  .https.onCall(async (data, context) => {
    
    const nomeEmpresa = data.nomeEmpresa || "Meu Site Incrivel";
    const siteId = gerarSlug(nomeEmpresa); // AQUI ESTÁ A MÁGICA: "Bar do Tião" vira "bar-do-tiao"
    
    // Adiciona um sufixo aleatório curto se quiser garantir unicidade (opcional)
    // const siteId = `${slug}-${Math.floor(Math.random() * 1000)}`;

    const prompt = data.prompt;
    const projectId = "criador-de-site-1a91d"; // Seu ID do projeto
    
    // IMPORTANTE: Esse token precisa ser gerado via 'firebase login:ci' no terminal
    const firebaseToken = "SEU_TOKEN_CI_AQUI"; 

    console.log(`Iniciando criação para: ${nomeEmpresa} (ID: ${siteId})`);

    // --- PASSO 1: Garantir que o Site existe no Firebase (Multisite) ---
    try {
      await axios.post(
        `https://firebasehosting.googleapis.com/v1beta1/projects/${projectId}/sites?siteId=${siteId}`,
        {},
        { headers: { Authorization: `Bearer ${firebaseToken}` } }
      );
      console.log(`Site ${siteId} criado com sucesso.`);
    } catch (e) {
      // Se der erro 409, significa que o site já existe. Tudo bem, seguimos para atualizar.
      if (e.response && e.response.status === 409) {
        console.log(`Site ${siteId} já existe. Atualizando...`);
      } else {
        console.error("Erro fatal ao criar site:", e.message);
        throw new functions.https.HttpsError("internal", "Nome de site inválido ou indisponível.");
      }
    }

    // --- PASSO 2: Gerar HTML com IA ---
    // Use a API Key do Google AI Studio (não a do Firebase CI)
    const genAI = new GoogleGenerativeAI("SUA_API_KEY_GOOGLE_AI_STUDIO");
    
    // Ajuste do modelo para evitar o erro 404 (use gemini-1.5-flash ou gemini-pro)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
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
    // Limpeza de segurança para remover ```html no início e fim, se houver
    html = html.replace(/```html/g, "").replace(/```/g, "");

    // --- PASSO 3: Preparar o ambiente temporário ---
    const tempDir = path.join(os.tmpdir(), siteId);
    const publicDir = path.join(tempDir, "public");

    // Limpa diretórios antigos se existirem
    if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
    fs.mkdirSync(publicDir, { recursive: true });

    // Salva o HTML gerado
    fs.writeFileSync(path.join(publicDir, "index.html"), html);

    // --- PASSO 4: Configuração Dinâmica do Firebase ---
    // Cria o firebase.json na pasta temporária apontando para o site correto
    const firebaseJson = {
      hosting: {
        target: "alvo-dinamico", 
        public: "public",
        ignore: ["firebase.json", "**/.*", "**/node_modules/**"]
      }
    };
    
    // Cria o .firebaserc mapeando o alias "alvo-dinamico" para o siteId real (bar-do-tiao)
    const firebaserc = {
      projects: { default: projectId },
      targets: {
        [projectId]: {
          hosting: {
            "alvo-dinamico": [siteId]
          }
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
        cwd: tempDir, // Executa o comando a partir da pasta temporária
        only: "hosting:alvo-dinamico" // Publica apenas para esse site específico
      });

      return { 
        success: true, 
        siteId: siteId,
        url: `https://${siteId}.web.app`,
        adminPanel: `https://console.firebase.google.com/project/${projectId}/hosting/sites/${siteId}`
      };

    } catch (error) {
      console.error("Erro no deploy:", error);
      throw new functions.https.HttpsError("internal", "Erro ao publicar no Firebase Hosting.");
    }
  });
