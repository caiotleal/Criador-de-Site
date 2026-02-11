
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
import { GoogleGenerativeAI } from "@google/generative-ai";

interface WebsitePreviewProps {
  data: SiteFormData;
  palette: Palette;
}

const WebsitePreview: React.FC<WebsitePreviewProps> = ({ data, palette }) => {
  const [aiContent, setAiContent] = useState<{ headline: string; subheadline: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fix: Generate dynamic content using Gemini API to create a professional site experience
  useEffect(() => {
    const fetchAIContent = async () => {
      if (!data.businessName || !data.targetAudience) return;
      
      setIsGenerating(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Atue como um redator publicitário experiente. Gere um título (headline) curto e impactante e um subtítulo (subheadline) persuasivo para o seguinte negócio:
            Nome da Empresa: ${data.businessName}
            Público-Alvo: ${data.targetAudience}
            Tom de Voz: ${data.tone}
            
            Retorne exclusivamente um JSON com os campos "headline" e "subheadline".`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                headline: { type: Type.STRING, description: 'Um título chamativo para o site.' },
                subheadline: { type: Type.STRING, description: 'Um parágrafo curto que descreve o valor do negócio.' }
              },
              required: ["headline", "subheadline"]
            }
          }
        });

        const result = JSON.parse(response.text || '{}');
        if (result.headline && result.subheadline) {
          setAiContent(result);
        }
      } catch (err) {
        console.error("Erro na geração de conteúdo com IA:", err);
      } finally {
        setIsGenerating(false);
      }
    };

    const debounce = setTimeout(fetchAIContent, 1000);
    return () => clearTimeout(debounce);
  }, [data.businessName, data.targetAudience, data.tone]);

  const businessName = data.businessName || 'Nome da Sua Empresa';
  
  // Use AI-generated content or fall back to template-based messages
  const headline = aiContent?.headline || (data.tone === 'Formal' 
    ? `Soluções especializadas para ${data.targetAudience || 'seu público'}.`
    : `O jeito mais top de conectar com ${data.targetAudience || 'seu público'}!`);

  const subheadline = aiContent?.subheadline || (data.tone === 'Formal'
    ? 'Excelência e compromisso com o resultado do seu negócio.'
    : 'Bora fazer acontecer? Qualidade garantida e zero stress.');

  return (
    <div 
      className="flex-1 flex flex-col transition-colors duration-500 relative" 
      style={{ backgroundColor: palette.bg, color: palette.text }}
    >
      {/* AI Content Loading Status */}
      {isGenerating && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-zinc-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
          <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
          <span className="text-[10px] font-bold text-indigo-400 tracking-tight uppercase">Otimizando com IA</span>
        </div>
      )}

      {/* Mini Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: `${palette.primary}20` }}>
        <div className="font-bold text-lg" style={{ color: palette.primary }}>
          {businessName.split(' ')[0]}
        </div>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex gap-4 text-xs font-medium opacity-70">
            <span>Home</span>
            <span>Sobre</span>
            <span>Serviços</span>
          </nav>
          <Menu className="w-5 h-5 md:hidden" />
        </div>
      </header>

      {/* Hero Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <motion.div
          key={`${data.tone}-${headline}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md"
        >
          <div className="mb-6 inline-flex p-3 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
            <Sparkles className="w-6 h-6" style={{ color: palette.primary }} />
          </div>
          
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight tracking-tight">
            {headline}
          </h2>
          <p className="text-sm md:text-lg opacity-80 mb-10 leading-relaxed">
            {subheadline}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="px-10 py-4 rounded-full font-bold text-sm shadow-2xl transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: palette.primary, color: 'white' }}
            >
              Começar Agora
            </button>
            <button 
              className="px-10 py-4 rounded-full font-bold text-sm border flex items-center justify-center gap-2 transition-all hover:bg-white/5"
              style={{ borderColor: `${palette.primary}40`, color: palette.primary }}
            >
              Ver Mais <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </main>

      {/* Dynamic Social Footer */}
      <footer className="p-8 border-t" style={{ borderColor: `${palette.primary}10` }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-xs opacity-50 font-medium">
            &copy; {new Date().getFullYear()} {businessName}. Criado com SiteCraft.
          </div>
          
          <div className="flex items-center gap-6">
            <AnimatePresence>
              {data.whatsapp && (
                <motion.a 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  href={`https://wa.me/${data.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-110 transition-transform"
                >
                  <MessageCircle className="w-5 h-5" style={{ color: '#25D366' }} />
                </motion.a>
              )}
              {data.instagram && (
                <motion.a 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  href={`https://instagram.com/${data.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-110 transition-transform"
                >
                  <Instagram className="w-5 h-5" style={{ color: palette.secondary }} />
                </motion.a>
              )}
              {data.facebook && (
                <motion.a 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  href={data.facebook.startsWith('http') ? data.facebook : `https://facebook.com/${data.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-110 transition-transform"
                >
                  <Facebook className="w-5 h-5" style={{ color: '#1877F2' }} />
                </motion.a>
              )}
              {data.linkedin && (
                <motion.a 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  href={data.linkedin.startsWith('http') ? data.linkedin : `https://linkedin.com/in/${data.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-110 transition-transform"
                >
                  <Linkedin className="w-5 h-5" style={{ color: '#0A66C2' }} />
                </motion.a>
              )}
            </AnimatePresence>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WebsitePreview;
