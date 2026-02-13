const { onCall, HttpsError } = require("firebase-functions/v2/https");
const client = require("firebase-tools");
const axios = require("axios");
const fs = require("fs");
const os = require("os");
const path = require("path");

exports.criarPublicarSite = onCall({ 
  timeoutSeconds: 540, 
  memory: "1GiB",
  cors: true, 
  region: "us-central1",
  secrets: ["FB_TOKEN_CI", "GROQ_KEY"] 
}, async (request) => {
  
  // 1. Validação de Entrada
  const { nomeEmpresa, prompt, previewOnly } = request.data;
  const GROQ_KEY = process.env.GROQ_KEY;
  const projectId = "criador-de-site-1a91d";

  if (!GROQ_KEY) {
    console.error("ERRO: GROQ_KEY não configurada nos Secrets.");
    throw new HttpsError("failed-precondition", "Configuração de API pendente no servidor.");
  }

  try {
    console.log(`🚀 Iniciando ${previewOnly ? 'Preview' : 'Publicação'} para: ${nomeEmpresa}`);

    // 2. Chamada para a API da Groq (Llama 3)
    const response = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "Você é um desenvolvedor sênior. Responda APENAS com o código solicitado, sem explicações, sem markdown (```) e sem introduções."
        },
        {
          role: "user",
          content: previewOnly 
            ? `Gere um JSON para a empresa ${nomeEmpresa} com o tema ${prompt}. Use EXATAMENTE este formato: {"headline": "Título Impactante", "subheadline": "Frase de apoio chamativa"}`
            : `Crie um index.html profissional e completo para a empresa "${nomeEmpresa}" sobre o tema "${prompt}". Use TailwindCSS via CDN. Inclua seções de Hero, Sobre e Contato. Retorne apenas o código HTML.`
        }
      ],
      temperature: 0.7
    }, {
      headers: { 
        "Authorization": `Bearer ${GROQ_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const aiText = response.data.choices[0].message.content.trim();

    // 3. Tratamento para o Modo PREVIEW (Headline/Subheadline)
    if (previewOnly) {
      try {
        // Extrai o JSON caso a IA mande texto em volta
        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("JSON não encontrado na resposta");
        
        const jsonData = JSON.parse(jsonMatch[0]);
        console.log("✅ Preview extraído com sucesso.");
        return { success: true, data: jsonData };
      } catch (e) {
        console.error("Erro ao processar JSON da IA:", aiText);
        throw new HttpsError("internal", "A IA gerou um formato de texto inválido para o preview.");
      }
    }

    // 4. Tratamento para o Modo PUBLICAÇÃO (HTML Completo)
    let html = aiText.replace(/```html/g, "").replace(/```/g, "").trim();
    
    // Gerar ID do site amigável (sem espaços ou acentos)
    const siteId = nomeEmpresa.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/\s+/g, '-') 
      .replace(/[^\w\-]+/g, '') + "-" + Math.floor(Math.random() * 1000);

    // 5. Preparação dos Arquivos Temporários
    const tempDir = path.join(os.tmpdir(), siteId);
    const publicDir = path.join(tempDir, "public");
    
    if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
    fs.mkdirSync(publicDir, { recursive: true });
    
    fs.writeFileSync(path.join(publicDir, "index.html"), html);
    fs.writeFileSync(path.join(tempDir, "firebase.json"), JSON.stringify({
      hosting: { public: "public" }
    }));

    // 6. Deploy para o Firebase Hosting
    console.log(`📦 Fazendo deploy do site: ${siteId}...`);
    const FIREBASE_TOKEN = process.env.FB_TOKEN_CI;

    await client.hosting.sites.create(siteId, { project: projectId, token: FIREBASE_TOKEN });
    await client.deploy({
      project: projectId,
      site: siteId,
      token: FIREBASE_TOKEN,
      cwd: tempDir,
      only: "hosting"
    });

    console.log("🎉 Site publicado com sucesso!");
    return { success: true, url: `https://${siteId}.web.app` };

  } catch (error) {
    console.error("❌ Erro na Função:", error.response?.data || error.message);
    
    // Se o erro for 401, a chave está errada ou sem permissão
    if (error.response?.status === 401) {
      throw new HttpsError("unauthenticated", "A chave da Groq foi rejeitada. Verifique o Secret Manager.");
    }
    
    throw new HttpsError("internal", "Falha no processo: " + error.message);
  }
});
