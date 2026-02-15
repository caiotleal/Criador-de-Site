const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { defineSecret } = require("firebase-functions/params");

// --- MUDANÇA AQUI: O NOME AGORA É GEMINI_KEY ---
const geminiKey = defineSecret("GEMINI_KEY");

exports.generateSite = onCall(
  { 
    cors: true, 
    timeoutSeconds: 60, 
    memory: "256MiB",
    secrets: [geminiKey] // <--- AQUI TAMBÉM
  }, 
  async (request) => {
    // --- E AQUI PARA USAR O VALOR ---
    const genAI = new GoogleGenerativeAI(geminiKey.value());
    
    // ... resto do código continua igual ...
    
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
      model: "gemini-2.5-flash", 
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
