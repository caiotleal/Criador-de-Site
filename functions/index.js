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
  
  const { nomeEmpresa, prompt, previewOnly } = request.data;
  const GROQ_KEY = process.env.GROQ_KEY;
  const projectId = "criador-de-site-1a91d";

  try {
    // Chamada para Llama 3 via Groq
    const response = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "Você é um especialista em TailwindCSS. Responda apenas com o código ou JSON solicitado, sem textos explicativos."
        },
        {
          role: "user",
          content: previewOnly 
            ? `Gere JSON para empresa ${nomeEmpresa} sobre ${prompt}. Formato: {"headline": "título", "subheadline": "descrição"}`
            : `Crie um index.html completo com Tailwind para "${nomeEmpresa}". Tema: ${prompt}. Retorne apenas o código HTML.`
        }
      ]
    }, {
      headers: { "Authorization": `Bearer ${GROQ_KEY}` }
    });

    const aiText = response.data.choices[0].message.content;

    if (previewOnly) {
      const jsonMatch = aiText.match(/\{.*\}/s);
      return { success: true, data: JSON.parse(jsonMatch[0]) };
    }

    const html = aiText.replace(/```html/g, "").replace(/```/g, "").trim();

    // Logica de Deploy (Igual à anterior)
    const siteId = nomeEmpresa.toLowerCase().replace(/\s+/g, '-') + "-" + Math.floor(Math.random() * 1000);
    const tempDir = path.join(os.tmpdir(), siteId);
    const publicDir = path.join(tempDir, "public");
    fs.mkdirSync(publicDir, { recursive: true });
    fs.writeFileSync(path.join(publicDir, "index.html"), html);
    fs.writeFileSync(path.join(tempDir, "firebase.json"), JSON.stringify({ hosting: { public: "public" } }));

    await client.hosting.sites.create(siteId, { project: projectId, token: process.env.FB_TOKEN_CI });
    await client.deploy({ project: projectId, site: siteId, token: process.env.FB_TOKEN_CI, cwd: tempDir, only: "hosting" });

    return { success: true, url: `https://${siteId}.web.app` };

  } catch (error) {
    throw new HttpsError("internal", "Erro na Groq: " + error.message);
  }
});
