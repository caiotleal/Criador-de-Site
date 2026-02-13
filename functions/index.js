const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = "AIzaSyBeuhoiZBsSgXTAlK81ormf_9P6zcApLDw"; 

exports.generateSite = onCall(
  { timeoutSeconds: 300, memory: "512MiB" }, 
  async (request) => {
    const genAI = new GoogleGenerativeAI(API_KEY);

    try {
      const { 
        businessName, description, segment, layoutStyle, palette, 
        whatsapp, instagram 
        // NOTE: Não precisamos receber o logoBase64 aqui! Economiza banda.
      } = request.data;

      if (!businessName) throw new HttpsError('invalid-argument', 'Nome obrigatório.');

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // --- ESTRATÉGIA DE IMAGENS ---
      // 1. Logo: Usamos um marcador [[LOGO_SRC]] que o React vai substituir.
      // 2. Hero Image: Usamos Pollinations com seed aleatória para variar sempre.
      const seed = Math.floor(Math.random() * 1000);
      const heroUrl = `https://image.pollinations.ai/prompt/cinematic%20photo%20of%20${segment.replace(/ /g, '%20')}%20${businessName.replace(/ /g, '%20')},%20high%20quality,%204k,%20realistic?width=1600&height=900&nologo=true&seed=${seed}`;

      const prompt = `
        Crie um HTML PROFISSIONAL para "${businessName}" (${segment}).
        Estilo: ${layoutStyle}. 
        Cores: Primary ${palette.primary}, Secondary ${palette.secondary}, Bg ${palette.bg}, Text ${palette.text}.

        REGRAS CRÍTICAS DE IMAGEM:
        1. Para o LOGO no Header e Footer, use EXATAMENTE: src="[[LOGO_SRC]]" 
           (Não coloque URL real, o sistema vai injetar depois).
           Adicione a classe: "h-12 w-auto object-contain".
        
        2. Para o HERO (Capa), use EXATAMENTE esta URL: 
           "${heroUrl}"
           
        3. Para outras imagens (Cards), use LoremFlickr:
           "https://loremflickr.com/800/600/${segment.split(' ')[0]},work/all"

        REGRAS DE CONTEÚDO:
        - Detalhes do negócio: "${description}".
        - Texto persuasivo em Português.
        - Use FontAwesome para ícones.
        
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
