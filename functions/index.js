const { onCall } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Inicializa o Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateSite = onCall({ secrets: ["GEMINI_API_KEY"] }, async (request) => {
  const { businessName, description, segment, paletteId, whatsapp, instagram, linkedin } = request.data;

  // 1. Configuração de Cores (Backend)
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

  // 2. O Prompt "Engenheiro de Software"
  // Aqui misturamos a estrutura fixa (UX) com os dados variáveis do cliente
  const prompt = `
    Atue como um Especialista em Frontend e UX Design.
    Gere um arquivo HTML ÚNICO e COMPLETO para o cliente abaixo.

    DADOS DO CLIENTE:
    - Nome: "${businessName}"
    - Segmento: "${segment}"
    - Sobre: "${description}"
    - WhatsApp: "${whatsapp || '#'}"
    - Instagram: "${instagram || '#'}"
    - LinkedIn: "${linkedin || '#'}"

    REGRAS TÉCNICAS (ESTRUTURA OBRIGATÓRIA):
    1.  **Tecnologia:** Use TailwindCSS (via CDN) + FontAwesome (via CDN) + AOS Library (Animate on Scroll).
    2.  **Layout:** O site DEVE ser moderno, com efeito Glassmorphism (vidro) e fundo escuro ou claro dependendo da paleta.
    3.  **Cores:** Configure o Tailwind config no <head> com:
        primary: '${colors.primary}', secondary: '${colors.secondary}', pageBg: '${colors.bg}', pageText: '${colors.text}'
    4.  **Imagens:** Use APENAS imagens do Unsplash com keywords em inglês relacionadas a ${segment}. Ex: source.unsplash.com/1600x900/?${segment},office
    5.  **Copywriting:** Escreva textos persuasivos e profissionais em PORTUGUÊS baseados na descrição "${description}". Nada de Lorem Ipsum.

    ESTRUTURA DO HTML (Siga esta ordem):
    1.  <head> com Tailwind Config e Scripts do AOS.
    2.  <header> fixo com efeito de vidro (backdrop-blur).
    3.  <section id="hero"> com título H1 grande, subtítulo e CTA.
    4.  <section id="features"> (3 cards com ícones sobre os diferenciais).
    5.  <section id="about"> (Sobre a empresa).
    6.  <section id="stats"> (Contadores animados).
    7.  <footer> completo.
    8.  **WIDGET FLUTUANTE (Obrigatório):** Adicione EXATAMENTE este código HTML antes do </body> para botões sociais flutuantes:
        
        <div id="social-floater" class="fixed z-[9999] bottom-10 right-10 cursor-move touch-none group">
            <div class="glass p-2 rounded-full flex flex-col gap-3 border border-white/20 bg-black/40 backdrop-blur-xl">
                 <div class="h-1 w-8 bg-white/20 rounded-full mx-auto mb-1"></div>
                 <a href="https://wa.me/${whatsapp}" target="_blank" class="w-10 h-10 rounded-full bg-green-500/20 hover:bg-green-500 flex items-center justify-center text-green-400 hover:text-white transition-all"><i class="fa-brands fa-whatsapp text-xl"></i></a>
                 <a href="${instagram}" target="_blank" class="w-10 h-10 rounded-full bg-pink-500/20 hover:bg-pink-500 flex items-center justify-center text-pink-400 hover:text-white transition-all"><i class="fa-brands fa-instagram text-xl"></i></a>
            </div>
        </div>

    9.  **Scripts Finais:** Adicione o script para inicializar o AOS (AOS.init()) e o script de "Drag & Drop" para o widget flutuante funcionar (copie a lógica de dragstart, dragend, touchmove).

    SAÍDA ESPERADA:
    - Retorne APENAS o código HTML puro.
    - Comece com <!DOCTYPE html>.
    - Não use blocos de markdown (\`\`\`).
  `;

  // 3. Chamada à IA
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let html = response.text();

    // Limpeza de segurança
    html = html.replace(/```html/g, "").replace(/```/g, "");

    return { success: true, html: html };
  } catch (error) {
    console.error("Erro na geração:", error);
    throw new Error("Falha ao criar o site.");
  }
});
