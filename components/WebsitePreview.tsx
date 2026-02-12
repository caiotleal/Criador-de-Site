import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SiteFormData, Palette } from '../types';
import { 
  Instagram, 
  Facebook, 
  Linkedin, 
  MessageCircle,
  ChevronRight,
  Menu,
  Sparkles,
  Loader2
} from 'lucide-react';
// IMPORTAÇÃO CORRIGIDA:
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

interface WebsitePreviewProps {
  data: SiteFormData;
  palette: Palette;
}

const WebsitePreview: React.FC<WebsitePreviewProps> = ({ data, palette }) => {
  const [aiContent, setAiContent] = useState<{ headline: string; subheadline: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchAIContent = async () => {
      // Só gera se tiver nome e público definidos
      if (!data.businessName || !data.targetAudience) return;
      
      setIsGenerating(true);

      try {
        // 1. Inicializa a IA com a chave do arquivo .env
        const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
        
        if (!apiKey) {
          console.warn("API Key não encontrada. Verifique o arquivo .env");
          setIsGenerating(false);
          return;
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // 2. Configura o modelo para retornar JSON estrito
        const model = genAI.getGenerativeModel({
          model: model: "gemini-1.5-flash-latest",
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: SchemaType.OBJECT,
              properties: {
                headline: { 
                  type: SchemaType.STRING, 
                  description: "Um título curto e impactante para o site (máx 8 palavras)" 
                },
                subheadline: { 
                  type: SchemaType.STRING, 
                  description: "Um subtítulo persuasivo explicando o valor (máx 20 palavras)" 
                }
              },
              required: ["headline", "subheadline"]
            }
          }
        });

        // 3. O Prompt
        const prompt = `Atue como um redator expert. Crie conteúdo para:
          Empresa: ${data.businessName}
          Público: ${data.targetAudience}
          Tom de voz: ${data.tone || 'Profissional'}`;

        // 4. Gera e processa o resultado
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonResult = JSON.parse(responseText);

        setAiContent(jsonResult);

      } catch (err) {
        console.error("Erro na geração de conteúdo com IA:", err);
        // Em caso de erro, o site usará o texto padrão abaixo
      } finally {
        setIsGenerating(false);
      }
    };

    // Debounce para não chamar a API a cada letra digitada (espera 1.5s)
    const debounce = setTimeout(fetchAIContent, 1500);
    return () => clearTimeout(debounce);
  }, [data.businessName, data.targetAudience, data.tone]);

  // Texto padrão caso a IA ainda não tenha carregado ou tenha dado erro
  const businessName = data.businessName || 'Sua Empresa';
  
  const headline = aiContent?.headline || (data.tone === 'Formal' 
    ? `Soluções especializadas para ${data.targetAudience || 'você'}.`
    : `Transforme sua experiência com ${businessName}!`);

  const subheadline = aiContent?.subheadline || (data.tone === 'Formal'
    ? 'Compromisso com a excelência e resultados comprovados.'
    : 'A melhor escolha para quem busca qualidade e inovação.');

  return (
    <div 
      className="flex-1 flex flex-col transition-colors duration-500 relative min-h-[500px]" 
      style={{ backgroundColor: palette.bg, color: palette.text }}
    >
      {/* Indicador de Carregamento da IA */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg"
          >
            <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
            <span className="text-[10px] font-bold text-white tracking-wide uppercase">Gerando Site...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cabeçalho do Site */}
      <header className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: `${palette.primary}20` }}>
        <div className="font-bold text-lg tracking-tight" style={{ color: palette.primary }}>
          {businessName}
        </div>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex gap-6 text-sm font-medium opacity-70">
            <span className="cursor-pointer hover:opacity-100 transition-opacity">Início</span>
            <span className="cursor-pointer hover:opacity-100 transition-opacity">Serviços</span>
            <span className="cursor-pointer hover:opacity-100 transition-opacity">Contato</span>
          </nav>
          <Menu className="w-5 h-5 md:hidden" />
        </div>
      </header>

      {/* Conteúdo Principal (Hero) */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-4xl mx-auto w-full">
        <motion.div
          key={headline} // Anima quando o texto muda
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 inline-flex p-3 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
            <Sparkles className="w-6 h-6" style={{ color: palette.primary }} />
          </div>
          
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
            {headline}
          ,</h2>
          
          <p className="text-lg md:text-xl opacity-80 mb-10 leading-relaxed max-w-2xl mx-auto">
            {subheadline}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
            <button 
              className="px-8 py-4 rounded-full font-bold text-sm shadow-xl transition-transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: palette.primary, color: '#fff' }}
            >
              Começar Agora
            </button>
            <button 
              className="px-8 py-4 rounded-full font-bold text-sm border flex items-center justify-center gap-2 transition-colors hover:bg-white/5"
              style={{ borderColor: `${palette.primary}40`, color: palette.primary }}
            >
              Saiba Mais <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </main>

      {/* Rodapé */}
      <footer className="p-8 border-t mt-auto" style={{ borderColor: `${palette.primary}10` }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-xs opacity-50 font-medium">
            &copy; {new Date().getFullYear()} {businessName}. Todos os direitos reservados.
          </div>
          
          <div className="flex items-center gap-6">
            {data.whatsapp && (
              <a href={`https://wa.me/${data.whatsapp}`} target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity">
                <MessageCircle className="w-5 h-5 text-green-500" />
              </a>
            )}
            {data.instagram && (
              <a href={`https://instagram.com/${data.instagram}`} target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity">
                <Instagram className="w-5 h-5" style={{ color: palette.secondary }} />
              </a>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WebsitePreview;
