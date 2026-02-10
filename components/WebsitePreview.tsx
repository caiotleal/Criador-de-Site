
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SiteFormData, Palette } from '../types';
import { 
  Instagram, 
  Facebook, 
  Linkedin, 
  MessageCircle,
  ChevronRight,
  Menu
} from 'lucide-react';

interface WebsitePreviewProps {
  data: SiteFormData;
  palette: Palette;
}

const WebsitePreview: React.FC<WebsitePreviewProps> = ({ data, palette }) => {
  const businessName = data.businessName || 'Nome da Sua Empresa';
  const targetAudience = data.targetAudience || 'Seu público-alvo ideal';
  
  const headline = data.tone === 'Formal' 
    ? `Soluções especializadas para ${targetAudience}.`
    : `O jeito mais top de conectar com ${targetAudience}!`;

  const subheadline = data.tone === 'Formal'
    ? 'Excelência e compromisso com o resultado do seu negócio.'
    : 'Bora fazer acontecer? Qualidade garantida e zero stress.';

  return (
    <div 
      className="flex-1 flex flex-col transition-colors duration-500" 
      style={{ backgroundColor: palette.bg, color: palette.text }}
    >
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
          key={data.tone}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
            {headline}
          </h2>
          <p className="text-sm md:text-base opacity-80 mb-8">
            {subheadline}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="px-8 py-3 rounded-full font-bold text-sm shadow-xl transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: palette.primary, color: 'white' }}
            >
              Começar Agora
            </button>
            <button 
              className="px-8 py-3 rounded-full font-bold text-sm border flex items-center justify-center gap-2 transition-all hover:bg-white/5"
              style={{ borderColor: palette.primary, color: palette.primary }}
            >
              Ver Mais <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </main>

      {/* Dynamic Social Footer */}
      <footer className="p-8 border-t" style={{ borderColor: `${palette.primary}10` }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-xs opacity-50">
            &copy; 2024 {businessName}. Todos os direitos reservados.
          </div>
          
          <div className="flex items-center gap-6">
            <AnimatePresence>
              {data.whatsapp && (
                <motion.a 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  href="#"
                  className="hover:opacity-80 transition-opacity"
                >
                  <MessageCircle className="w-5 h-5" style={{ color: '#25D366' }} />
                </motion.a>
              )}
              {data.instagram && (
                <motion.a 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  href="#"
                  className="hover:opacity-80 transition-opacity"
                >
                  <Instagram className="w-5 h-5" style={{ color: palette.secondary }} />
                </motion.a>
              )}
              {data.facebook && (
                <motion.a 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  href="#"
                  className="hover:opacity-80 transition-opacity"
                >
                  <Facebook className="w-5 h-5" style={{ color: '#1877F2' }} />
                </motion.a>
              )}
              {data.linkedin && (
                <motion.a 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  href="#"
                  className="hover:opacity-80 transition-opacity"
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
