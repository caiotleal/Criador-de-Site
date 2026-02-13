const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Mantenha sua chave
const API_KEY = "AIzaSyBeuhoiZBsSgXTAlK81ormf_9P6zcApLDw";

exports.generateSite = onCall(
  { 
    timeoutSeconds: 300, 
    memory: "1GiB" // Aumentei memória para processar a imagem
  }, 
  async (request) => {
    const genAI = new GoogleGenerativeAI(API_KEY);

    try {
      const { businessName, description, segment, paletteId, whatsapp, instagram } = request.data;
      if (!businessName) throw new HttpsError('invalid-argument', 'Nome obrigatório.');

      // 1. Gera o HTML (Cérebro: Gemini 2.5 Flash)
      const textModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      // 2. Tenta Gerar Imagem IA (Artista: Imagen 3)
      // Se falhar, usaremos Unsplash como backup
      let heroImageBase64 = "";
      try {
        console.log("Iniciando geração de imagem com Imagen 3...");
        const imageModel = genAI.getGenerativeModel({ model: "imagen-3.0-generate-001" });
        
        const imagePrompt = `High quality, photorealistic, professional photography of ${segment}, ${description}. Cinematic lighting, 4k resolution, modern style.`;
        
        const imageResult = await imageModel.generateContent(imagePrompt);
        const imageResponse = await imageResult.response;
        
        // O Imagen retorna a imagem em base64 dentro do objeto
        // (A estrutura exata pode variar, ajustamos para o padrão Google)
        if (imageResponse.candidates && imageResponse.candidates[0].content.parts[0].inlineData) {
           heroImageBase64 = imageResponse.candidates[0].content.parts[0].inlineData.data;
        }
      } catch (imgError) {
        console.warn("Falha na imagem IA, usando Unsplash:", imgError.message);
        // Deixamos vazio para o prompt usar Unsplash
      }

      // 3. Prompt do HTML
      const colors = { primary: '#6366f1', secondary: '#8b5cf6', bg: '#0f172a', text: '#f8fafc' };

      const prompt = `
        Crie um arquivo HTML ÚNICO para "${businessName}" (${segment}).
        
        INSTRUÇÃO ESPECIAL DE IMAGEM:
        ${heroImageBase64 ? `USE ESTA IMAGEM BASE64 EXATAMENTE NO BACKGROUND DA SECTION HERO: "data:image/jpeg;base64,${heroImageBase64}"` : `Use imagem do Unsplash: source.unsplash.com/1600x900/?${segment}`}
        Para as outras seções, use Unsplash.

        REGRAS VISUAIS:
        1. Use TailwindCSS e FontAwesome.
        2. Estilo Glassmorphism Moderno.
        3. O menu deve ser transparente/vidro.
        
        Retorne APENAS o HTML puro (<!DOCTYPE html>...).
      `;

      console.log(`Gerando HTML...`);
      const result = await textModel.generateContent(prompt);
      let html = result.response.text();
      html = html.replace(/```html/g, "").replace(/```/g, "");

      return { success: true, html: html };

    } catch (error) {
      console.error("ERRO GERAL:", error);
      throw new HttpsError('internal', error.message);
    }
  }
);
