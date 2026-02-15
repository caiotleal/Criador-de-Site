const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Mantenha sua chave aqui. Se der erro de quota, crie uma nova no Google AI Studio.
const API_KEY = "AIzaSyBeuhoiZBsSgXTAlK81ormf_9P6zcApLDw"; 

exports.generateSite = onCall(
  { 
    cors: true, // OBRIGATÓRIO: Permite que o site converse com o servidor
    timeoutSeconds: 60, // Dá tempo para a IA pensar
    memory: "256MiB",
    maxInstances: 10
  }, 
  async (request) => {
    // 1. Configuração da IA
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // 2. Validação dos dados recebidos
    if (!request.data || !request.data.businessName) {
      console.error("Erro: Nome da empresa não fornecido.");
      throw new HttpsError('invalid-argument', 'O nome da empresa é obrigatório.');
    }

    const { businessName, description } = request.data;
    console.log(`Gerando site para: ${businessName}`);

    // 3. Modelo Gemini (Usando a versão estável Flash)
    // Se você quiser usar outra versão, mude apenas a string "gemini-1.5-flash"
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", 
      generationConfig: { responseMimeType: "application/json" } 
    });

    const prompt = `
      Atue como um redator profissional de sites (Copywriter).
      Cliente: "${businessName}"
      Descrição do negócio: "${description}"

      Gere um objeto JSON contendo textos curtos, modernos e persuasivos para o site.
      
      A resposta deve ser APENAS o JSON cru, com a seguinte estrutura exata:
      {
        "heroTitle": "Título principal curto e impactante (max 6 palavras)",
        "heroSubtitle": "Subtítulo vendedor e direto (max 12 palavras)",
        "aboutTitle": "Título criativo para a seção Quem Somos",
        "aboutText": "Um parágrafo resumido e inspirador sobre a empresa (max 25 palavras)",
        "contactCall": "Uma frase curta de chamada para contato (ex: Vamos fechar negócio?)"
      }
    `;

    try {
      // 4. Chamada para a IA
      const result = await model.generateContent(prompt);
      let text = result.response.text();

      // --- A CORREÇÃO DO ERRO INTERNAL ---
      // O Gemini às vezes manda o texto assim: ```json { ... } ```
      // O código abaixo remove essas crases para não quebrar o JSON.parse
      if (text.includes("```")) {
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      }

      console.log("JSON Gerado pela IA:", text); // Isso ajuda a ver o erro nos logs do Firebase

      // 5. Retorno Seguro
      return JSON.parse(text);

    } catch (error) {
      console.error("ERRO NO BACKEND:", error);
      // Retorna uma mensagem clara para o seu site em vez de apenas "INTERNAL"
      throw new HttpsError('internal', `Falha ao processar IA: ${error.message}`);
    }
  }
);
