const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = "AIzaSyBeuhoiZBsSgXTAlK81ormf_9P6zcApLDw";

exports.generateSite = onCall(
  { 
    cors: true, // Permite acesso do localhost ou web
    timeoutSeconds: 60, 
    memory: "256MiB" 
  }, 
  async (request) => {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const { businessName, description } = request.data;
    
    // Validação
    if (!businessName) throw new HttpsError('invalid-argument', 'Nome é obrigatório');

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", 
      generationConfig: { responseMimeType: "application/json" } 
    });

    const prompt = `
      Atue como redator criativo para landing pages.
      Cliente: "${businessName}"
      Descrição: "${description}"
      
      Gere JSON com textos curtos e persuasivos.
      Estrutura:
      {
        "heroTitle": "Título principal (max 5 palavras)",
        "heroSubtitle": "Subtítulo vendedor (max 12 palavras)",
        "aboutTitle": "Título criativo para 'Quem Somos'",
        "aboutText": "Texto curto sobre a empresa (max 25 palavras)",
        "contactCall": "Chamada para ação de contato"
      }
    `;
    
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  }
);
