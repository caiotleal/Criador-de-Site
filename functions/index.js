const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- COLE SUA CHAVE NOVA AQUI DENTRO DAS ASPAS ---
const API_KEY = "AIzaSyDZNznq-O9FrNhFtlZszrhmEg7LhfCLyqE"; 

exports.generateSite = onCall(
  { 
    cors: true, 
    timeoutSeconds: 60, 
    memory: "256MiB"
    // Note que REMOVEMOS a linha 'secrets: [...]'
  }, 
  async (request) => {
    // Inicializa a IA direto com a chave
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Validação
    if (!request.data.businessName) {
      throw new HttpsError('invalid-argument', 'O nome da empresa é obrigatório.');
    }

    const { businessName, description } = request.data;
    
    // Configuração do Modelo
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", 
      generationConfig: { responseMimeType: "application/json" } 
    });

    const prompt = `
      Atue como redator web senior.
      Cliente: "${businessName}"
      Descrição: "${description}"
      
      Gere um JSON válido.
      Estrutura:
      {
        "heroTitle": "Título curto e impactante (max 6 palavras)",
        "heroSubtitle": "Subtítulo vendedor (max 12 palavras)",
        "aboutTitle": "Título criativo para 'Quem Somos'",
        "aboutText": "Texto curto sobre a empresa (max 25 palavras)",
        "contactCall": "Chamada para ação de contato"
      }
    `;
    
    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text();
      
      // Limpeza de segurança
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      
      return JSON.parse(text);

    } catch (error) {
      console.error("ERRO:", error);
      throw new HttpsError('internal', `Erro API: ${error.message}`);
    }
  }
);
