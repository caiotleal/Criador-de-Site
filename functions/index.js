const { onCall, HttpsError } = require("firebase-functions/v2/https");
const client = require("firebase-tools");
const { VertexAI } = require('@google-cloud/vertexai');
const fs = require("fs");
const os = require("os");
const path = require("path");

exports.criarPublicarSite = onCall({ 
  timeoutSeconds: 540, 
  memory: "1GiB",
  cors: true, 
  region: "us-central1",
  secrets: ["FB_TOKEN_CI"] 
}, async (request) => {
  
  const { nomeEmpresa, prompt, previewOnly } = request.data;
  const projectId = "criador-de-site-1a91d";
  
  try {
    // Inicializa Vertex AI (Não precisa de chave GEMINI_KEY, usa permissão IAM)
    const vertexAI = new VertexAI({project: projectId, location: 'us-central1'});
    const model = vertexAI.getGenerativeModel({ model: 'gemini-1.5-flash-001' });

    if (previewOnly) {
      const result = await model.generateContent({
        contents: [{role: 'user', parts: [{text: `Gere JSON: {"headline": "...", "subheadline": "..."} para: ${prompt}`}]}]
      });
      const response = result.response.candidates[0].content.parts[0].text;
      return { success: true, data: JSON.parse(response.replace(/```json/g, "").replace(/```/g, "")) };
    }

    const result = await model.generateContent({
      contents: [{role: 'user', parts: [{text: `Crie um index.html para ${nomeEmpresa}. Tema: ${prompt}. Use TailwindCSS. Retorne APENAS HTML.`}]}]
    });
    const html = result.response.candidates[0].content.parts[0].text.replace(/```html/g, "").replace(/```/g, "").trim();

    // Preparação de arquivos e Deploy
    const siteId = nomeEmpresa.toLowerCase().replace(/\s+/g, '-') + "-" + Math.floor(Math.random() * 1000);
    const tempDir = path.join(os.tmpdir(), siteId);
    const publicDir = path.join(tempDir, "public");
    fs.mkdirSync(publicDir, { recursive: true });
    fs.writeFileSync(path.join(publicDir, "index.html"), html);
    fs.writeFileSync(path.join(tempDir, "firebase.json"), JSON.stringify({ hosting: { public: "public" } }));

    const FIREBASE_TOKEN = process.env.FB_TOKEN_CI;
    await client.hosting.sites.create(siteId, { project: projectId, token: FIREBASE_TOKEN });
    await client.deploy({ project: projectId, site: siteId, token: FIREBASE_TOKEN, cwd: tempDir, only: "hosting" });

    return { success: true, url: `https://${siteId}.web.app` };

  } catch (error) {
    throw new HttpsError("internal", error.message);
  }
});
