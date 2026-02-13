const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- SUA NOVA CHAVE AQUI ---
const API_KEY = "AIzaSyBeuhoiZBsSgXTAlK81ormf_9P6zcApLDw";

exports.generateSite = onCall(
  { 
    timeoutSeconds: 300, // 5 minutos de limite (para não dar erro 500)
    memory: "512MiB"     // Memória extra para processar o texto
  }, 
  async (request) => {
    // 1. Inicializa a IA com a chave que você mandou
    const genAI = new GoogleGenerativeAI(API_KEY);

    try {
      // 2. Recebe os dados do formulário do React
      const { businessName, description, segment, paletteId, whatsapp, instagram, linkedin } = request.data;

      // Validação simples
      if (!businessName) {
        throw new HttpsError('invalid-argument', 'O nome da empresa é obrigatório.');
      }

      console.log(`Gerando site para: ${businessName} (${segment})`);

      // 3. Define as cores (Mapa de Paletas)
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

      // 4. O Prompt para o Gemini (Instruções detalhadas)
      const prompt = `
        Aja como um Desenvolvedor Frontend Sênior. Crie um arquivo HTML ÚNICO e completo.
        
        CLIENTE:
        Nome: ${businessName}
        Ramo: ${segment}
        Detalhes: ${description}
        WhatsApp: ${whatsapp || '#'} | Instagram: ${instagram || '#'}
        
        REQUISITOS TÉCNICOS:
        - Use TailwindCSS (via CDN).
        - Use FontAwesome (via CDN).
        - Use a biblioteca AOS Animation (via CDN) para animações no scroll.
        - Estilo Visual: Moderno, Clean, com seções bem definidas.
        
        CONFIGURAÇÃO DE CORES (Tailwind):
        No <script> de config do tailwind, use exatamente:
        colors: {
          primary: '${colors.primary}',
          secondary: '${colors.secondary}',
          dark: '${colors.bg}',
          light: '${colors.text}'
        }
        
        IMAGENS:
        Use APENAS imagens do Unsplash com keywords em INGLÊS relacionadas a "${segment}".
        Exemplo: source.unsplash.com/1600x900/?${segment},business
        
        ESTRUTURA DO HTML:
        1. Header fixo (glassmorphism).
        2. Hero Section com título grande e botão de ação.
        3. Seção "Sobre Nós".
        4. Seção "Diferenciais" (3 cards com ícones).
        5. Seção "Contato" ou "Localização".
        6. Footer.
        7. **Widget Flutuante de WhatsApp** no canto inferior direito.
        
        IMPORTANTE:
        - Retorne APENAS o código HTML cru.
        - Comece com <!DOCTYPE html>.
        - Não use blocos de markdown (\`\`\`).
      `;

      // 5. Chamada à IA
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let html = response.text();

      // Limpeza de segurança (remove ```html se a IA colocar)
      html = html.replace(/```html/g, "").replace(/```/g, "");

      return { success: true, html: html };

    } catch (error) {
      console.error("Erro no Gemini:", error);
      throw new HttpsError('internal', `Erro ao gerar site: ${error.message}`);
    }
  }
);
