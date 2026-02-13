const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.generateSite = onCall(
  { 
    secrets: ["GEMINI_KEY"], // Nome exato do seu segredo no Google Cloud
    timeoutSeconds: 300,     // 5 minutos para evitar erro 500
    memory: "512MiB"
  }, 
  async (request) => {
    // 1. Inicializa a IA (DENTRO da função para acessar o segredo)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

    // 2. Extrai os dados enviados pelo Frontend
    const { businessName, description, segment, paletteId, whatsapp, instagram, linkedin } = request.data;

    // 3. Validação de Segurança (Evita o erro "Bad Request")
    if (!businessName) {
      throw new HttpsError('invalid-argument', 'O nome do site é obrigatório para gerar o código.');
    }

    // 4. Mapa de Cores (O Backend precisa saber os códigos Hex)
    const PALETTES = {
      'p1': { primary: '#6366f1', secondary: '#8b5cf6', bg: '#0f172a', text: '#f8fafc' }, // Azul Tech
      'p2': { primary: '#fbbf24', secondary: '#d97706', bg: '#000000', text: '#f3f4f6' }, // Preto e Ouro
      'p3': { primary: '#10b981', secondary: '#34d399', bg: '#ffffff', text: '#1f2937' }, // Verde Fresh
      'p4': { primary: '#1e3a8a', secondary: '#3b82f6', bg: '#f3f4f6', text: '#1f2937' }, // Azul Oceano
      'p5': { primary: '#f97316', secondary: '#fb923c', bg: '#1c1917', text: '#fafaf9' }, // Pôr do Sol
      'p6': { primary: '#ec4899', secondary: '#f472b6', bg: '#fff1f2', text: '#881337' }, // Rosa
      'p7': { primary: '#475569', secondary: '#94a3b8', bg: '#f8fafc', text: '#0f172a' }, // Cinza
      'p8': { primary: '#7c3aed', secondary: '#a78bfa', bg: '#000000', text: '#e9d5ff' }, // Roxo
    };

    const colors = PALETTES[paletteId] || PALETTES['p1'];

    // 5. O Prompt Mestre (Engenharia de Prompt)
    const prompt = `
      Atue como um Especialista Sênior em Frontend e UX Design.
      Gere um arquivo HTML ÚNICO e COMPLETO baseado nestes dados:

      CLIENTE:
      - Nome: "${businessName}"
      - Segmento: "${segment}"
      - Sobre: "${description}"
      - Social: WhatsApp (${whatsapp || '#'}), Instagram (${instagram || '#' })

      REGRAS TÉCNICAS (OBRIGATÓRIO):
      1. Use TailwindCSS (CDN) + FontAwesome (CDN) + AOS Library (CDN).
      2. Estilo Visual: Moderno, Clean, Glassmorphism (efeito vidro).
      3. Configuração de Cores no Tailwind (script no head):
         primary: '${colors.primary}', secondary: '${colors.secondary}', pageBg: '${colors.bg}', pageText: '${colors.text}'
      4. Imagens: Use APENAS imagens do Unsplash com keywords em inglês do segmento "${segment}".
      5. Texto: Escreva copy persuasiva em PORTUGUÊS. Nada de Lorem Ipsum.

      ESTRUTURA OBRIGATÓRIA:
      - Header flutuante.
      - Hero Section impactante.
      - Seção de Serviços (3 cards).
      - Seção Sobre.
      - Footer completo.
      - **IMPORTANTE:** Adicione um widget flutuante de redes sociais no canto inferior direito (vidro/glass).

      SAÍDA:
      Retorne APENAS o código HTML cru. Comece com <!DOCTYPE html>. Sem markdown (\`\`\`).
    `;

    // 6. Chamada à IA
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let html = response.text();

      // Limpeza de segurança
      html = html.replace(/```html/g, "").replace(/```/g, "");

      return { success: true, html: html };
    } catch (error) {
      console.error("Erro Gemini:", error);
      throw new HttpsError('internal', 'Erro ao gerar o site com IA.');
    }
  }
);
