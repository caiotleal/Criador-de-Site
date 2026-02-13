const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = "AIzaSyBeuhoiZBsSgXTAlK81ormf_9P6zcApLDw"; // Sua chave

exports.generateSite = onCall(
  { 
    timeoutSeconds: 300, 
    memory: "512MiB" 
  }, 
  async (request) => {
    const genAI = new GoogleGenerativeAI(API_KEY);

    try {
      const { 
        businessName, 
        description, 
        segment, 
        layoutStyle, 
        palette, 
        whatsapp, 
        instagram,
        logoBase64 
      } = request.data;

      if (!businessName) throw new HttpsError('invalid-argument', 'Nome obrigatório.');

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // --- 1. LÓGICA DO LOGO (IMAGEM vs TEXTO) ---
      // Se tiver imagem, usa ela. Se não, instrui a criar um logo em texto.
      const logoInstruction = logoBase64 
        ? `
          LOGO: O cliente enviou um logo.
          Use EXATAMENTE esta tag no Header e no Footer (não mude nada):
          <img src="${logoBase64}" alt="${businessName}" class="h-10 w-auto object-contain hover:opacity-90 transition-opacity" />
          Também use este base64 no <link rel="icon"> do head.
        ` 
        : `
          LOGO: O cliente NÃO tem imagem. 
          Crie um logotipo tipográfico moderno usando o nome "${businessName}".
          Exemplo: <span class="text-2xl font-bold tracking-tight text-${palette.primary.replace('#', '')}"><i class="fas fa-layer-group mr-2"></i>${businessName}</span>
        `;

      // --- 2. LÓGICA DE IMAGENS (UNSPLASH DINÂMICO) ---
      // Criamos keywords em inglês baseadas no segmento para a busca funcionar bem
      const prompt = `
        Atue como um Arquiteto de Software Frontend. Crie um site HTML ÚNICO.
        
        DADOS:
        - Nome: "${businessName}"
        - Segmento: "${segment}"
        - Estilo Visual (Layout): "${layoutStyle}" (Adapte a estrutura do HTML para este estilo).
        - Cores: Primary ${palette.primary}, Secondary ${palette.secondary}, Bg ${palette.bg}, Text ${palette.text}.

        REGRAS RÍGIDAS:
        1. ${logoInstruction}
        2. IMAGENS: Use URLs do Unsplash com keywords em inglês para o segmento "${segment}".
           - Hero: https://source.unsplash.com/1600x900/?${segment.split(' ')[0]},business
           - Cards: https://source.unsplash.com/800x600/?${segment.split(' ')[0]},work
           (NUNCA gere imagens com IA, use apenas esses links).
        3. TEXTOS: Escreva textos persuasivos em PORTUGUÊS para vender serviços de ${segment}.
           - Use termos como "Sob medida", "Qualidade Garantida", "Entre em contato".
           - NÃO coloque preços fixos (ex: R$ 50,00). Use "Orçamento Grátis".
        4. ESTRUTURA:
           - Header (Vidro/Glass).
           - Hero Section (Com a imagem de fundo e CTA).
           - Sobre Nós.
           - Serviços (3 cards).
           - Depoimentos (fictícios).
           - Footer.

        Retorne APENAS o HTML puro (<!DOCTYPE html>...).
      `;

      const result = await model.generateContent(prompt);
      let html = result.response.text();
      html = html.replace(/```html/g, "").replace(/```/g, "");

      return { success: true, html: html };

    } catch (error) {
      console.error("ERRO:", error);
      throw new HttpsError('internal', error.message);
    }
  }
);
