const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- MODO DE TESTE (CHAVE DIRETA) ---
// Assim que funcionar, voltaremos para o process.env.GEMINI_KEY
const API_KEY = "AIzaSyCaSWUQkoNNf7I3Qt_mz7rTDFkZ8WBvl9g"; 

exports.generateSite = onCall(
  { 
    timeoutSeconds: 300, 
    memory: "512MiB"
    // Note: Removi a linha 'secrets' para este teste
  }, 
  async (request) => {
    try {
      // 1. Inicializa a IA com a chave direta
      const genAI = new GoogleGenerativeAI(API_KEY);

      // 2. Dados do Frontend
      const { businessName, description, segment, paletteId, whatsapp, instagram, linkedin } = request.data;

      if (!businessName) {
        throw new HttpsError('invalid-argument', 'O nome do site é obrigatório.');
      }

      // 3. Mapa de Cores
      const PALETTES = {
        'p1': { primary: '#6366f1', secondary: '#8b5cf6', bg: '#0f172a', text: '#f8fafc' },
        'p2': { primary: '#fbbf24', secondary: '#d97706', bg: '#000000', text: '#f3f4f6' },
        'p3': { primary: '#10b981', secondary: '#34d399', bg: '#ffffff', text: '#1f2937' },
        'p4': { primary: '#1e3a8a', secondary: '#3b82f6', bg: '#f3f4f6', text: '#1f2937' },
        'p5': { primary: '#f97316', secondary: '#fb923c', bg: '#1c1917', text: '#fafaf9' },
        'p6': { primary: '#ec4899', secondary: '#f472b6', bg: '#fff1f2', text: '#881337' },
        'p7': { primary: '#475569', secondary: '#94a3b8', bg: '#f8fafc', text: '#0f172a' },
        'p8': { primary: '#7c3aed', secondary: '#a78bfa', bg: '#000000', text: '#e9d5ff' },
      };

      const colors = PALETTES[paletteId] || PALETTES['p1'];

      // 4. Prompt
      const prompt = `
        Atue como um Especialista Sênior em Frontend.
        Crie um arquivo HTML ÚNICO para: "${businessName}" (${segment}).
        Descrição: "${description}".
        
        REGRAS:
        1. Use TailwindCSS (CDN) + FontAwesome (CDN).
        2. Estilo Moderno/Glassmorphism.
        3. Configuração de cores no <head>:
           primary: '${colors.primary}', secondary: '${colors.secondary}', bg: '${colors.bg}', text: '${colors.text}'
        4. Imagens: Unsplash apenas (keywords: ${segment}).
        5. Conteúdo: Texto em PORTUGUÊS persuasivo.
        6. Retorne APENAS o código HTML puro, começando com <!DOCTYPE html>.
      `;

      // 5. Chamada
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let html = response.text();

      // Limpeza
      html = html.replace(/```html/g, "").replace(/```/g, "");

      return { success: true, html: html };

    } catch (error) {
      console.error("ERRO REAL NO BACKEND:", error);
      // Retorna o erro real para o frontend para sabermos o que houve
      throw new HttpsError('internal', `Erro no Gemini: ${error.message}`);
    }
  }
);
