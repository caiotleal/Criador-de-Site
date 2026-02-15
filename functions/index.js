const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// COLE SUA CHAVE API AQUI
const API_KEY = "AIzaSyDZNznq-O9FrNhFtlZszrhmEg7LhfCLyqE"; 

exports.generateSite = onCall({ cors: true, timeoutSeconds: 60, memory: "256MiB" }, async (request) => {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const { businessName, description } = request.data;

    if (!businessName) throw new HttpsError('invalid-argument', 'Nome obrigatório');

    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash", // Versão estável e rápida
        generationConfig: { responseMimeType: "application/json" } 
    });

    const prompt = `Atue como redator senior. Empresa: "${businessName}". Descrição: "${description}". 
    Gere um JSON com: heroTitle, heroSubtitle, aboutTitle, aboutText, contactCall. Textos curtos e modernos.`;

    try {
        const result = await model.generateContent(prompt);
        let text = result.response.text();
        
        // Limpeza agressiva para garantir que seja apenas JSON
        text = text.replace(/```json/g, "").replace(/```/g, "").replace(/\\n/g, "").trim();
        
        return JSON.parse(text);
    } catch (error) {
        console.error("Erro:", error);
        throw new HttpsError('internal', error.message);
    }
});
