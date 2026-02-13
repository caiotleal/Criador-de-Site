const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Sua chave válida
const API_KEY = "AIzaSyBeuhoiZBsSgXTAlK81ormf_9P6zcApLDw";

exports.generateSite = onCall(
  { 
    timeoutSeconds: 300, 
    memory: "512MiB" 
  }, 
  async (request) => {
    const genAI = new GoogleGenerativeAI(API_KEY);

    try {
      const { businessName, description, segment, paletteId, whatsapp, instagram } = request.data;

      if (!businessName) throw new HttpsError('invalid-argument', 'Nome obrigatório.');

      // --- MUDANÇA AQUI ---
      // Usando o modelo que CONFIRMAMOS que existe na sua lista:
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const colors = { primary: '#6366f1', secondary: '#8b5cf6', bg: '#0f172a', text: '#f8fafc' };

      const prompt = `
        Crie um arquivo HTML ÚNICO e MODERNISSIMO para a empresa "${businessName}".
        Segmento: ${segment}.
        Detalhes: ${description}.
        
        REGRAS:
        1. Use TailwindCSS (CDN) e FontAwesome.
        2. Estilo Glassmorphism (vidro).
        3. Retorne APENAS o código HTML puro começando com <!DOCTYPE html>.
        4. O código deve ser responsivo e pronto para uso.
      `;

      console.log(`Solicitando geração ao modelo: gemini-2.5-flash`);

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let html = response.text();

      // Limpeza
      html = html.replace(/```html/g, "").replace(/```/g, "");

      return { success: true, html: html };

    } catch (error) {
      console.error("ERRO:", error);
      throw new HttpsError('internal', `Erro API (${error.message})`);
    }
  }
);
