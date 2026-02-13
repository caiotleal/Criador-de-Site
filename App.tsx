import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Settings, Palette as PaletteIcon, Eye, X, Lock, LogIn } from 'lucide-react';

// Importações Locais
import BusinessForm from './components/BusinessForm';
import WebsitePreview from './components/WebsitePreview';
import PalettePicker from './components/PalettePicker';
import LandingPage from './components/LandingPage';
import { PALETTES } from './constants';
import { SiteFormData } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'builder'>('landing');
  const [showFullPreview, setShowFullPreview] = useState(false); // Estado para o Preview Tela Cheia
  
  // Estado Inicial com os novos campos
  const [formData, setFormData] = useState<SiteFormData>({
    businessName: '',
    segment: '',
    description: '',
    logoUrl: '',
    targetAudience: '',
    tone: 'Descontraído',
    whatsapp: '',
    instagram: '',
    facebook: '',
    linkedin: '',
    paletteId: 'p1',
    layoutId: 'layout-1'
  });

  // Função para simular o Login/Cadastro (Fase 3)
  const handleLoginClick = () => {
    alert("Aqui abrirá o Pop-up de Login/Cadastro (Próxima Fase!)");
    // Após login, liberaríamos a edição e esconderíamos o banner
  };

  if (view === 'landing') return <LandingPage onStart={() => setView('builder')} />;

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-white font-sans">
      
      {/* --- MODO PREVIEW TELA CHEIA (O SITE "NO AR") --- */}
      <AnimatePresence>
        {showFullPreview && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-50 bg-white overflow-y-auto"
          >
            {/* Banner de Conversão (A Trava) */}
            <div className="sticky top-0 z-[60] bg-indigo-600 text-white px-4 py-3 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Lock size={16} className="text-indigo-200" />
                <span>
                  Você está visualizando um rascunho temporário. 
                  <span className="opacity-80 hidden sm:inline"> Para editar textos, trocar cores e salvar:</span>
                </span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button 
                  onClick={handleLoginClick}
                  className="flex-1 sm:flex-none bg-white text-indigo-700 hover:bg-indigo-50 px-4 py-1.5 rounded-full text-sm font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <LogIn size={14} />
                  Cadastrar para Editar
                </button>
                <button 
                  onClick={() => setShowFullPreview(false)}
                  className="p-1.5 hover:bg-indigo-700 rounded-full transition-colors"
                  title="Fechar Preview"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* O Site Gerado (Sem bordas, experiência real) */}
            <div className="w-full min-h-screen">
               <WebsitePreview data={formData} palette={PALETTES.find(p => p.id === formData.paletteId)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* --- MODO CONSTRUTOR (TELA DIVIDIDA) --- */}
      <header className="border-b border-zinc-800 p-4 flex justify-between items-center bg-zinc-950 sticky top-0 z-40">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
             <Rocket className="text-white w-5 h-5" />
           </div>
           <span className="font-bold text-lg tracking-tight">SiteCraft</span>
        </div>
        
        <div className="flex gap-3">
          {/* Botão Principal: Ver meu Site */}
          <button 
            onClick={() => {
              if(!formData.businessName) return alert("Preencha pelo menos o nome da empresa!");
              setShowFullPreview(true);
            }}
            className="bg-white text-zinc-900 px-6 py-2.5 rounded-full hover:bg-zinc-200 transition-all font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center gap-2"
          >
            <Eye size={18} />
            Ver meu Site
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] mx-auto w-full p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Lado Esquerdo: Formulário */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6 overflow-y-auto max-h-[calc(100vh-100px)] custom-scrollbar pb-20">
          <section className="bg-zinc-900/50 backdrop-blur-sm p-6 rounded-2xl border border-zinc-800/50">
            <h2 className="flex items-center gap-2 mb-6 font-semibold text-zinc-100 border-b border-zinc-800 pb-4">
              <Settings size={18} className="text-indigo-400"/> 
              Dados do Negócio
            </h2>
            <BusinessForm 
              data={formData} 
              onChange={(name, val) => setFormData(p => ({...p, [name]: val}))} 
            />
          </section>
          
          <section className="bg-zinc-900/50 backdrop-blur-sm p-6 rounded-2xl border border-zinc-800/50">
            <h2 className="flex items-center gap-2 mb-6 font-semibold text-zinc-100 border-b border-zinc-800 pb-4">
              <PaletteIcon size={18} className="text-indigo-400"/> 
              Estilo Visual
            </h2>
            <PalettePicker selectedId={formData.paletteId} onSelect={(id) => setFormData(p => ({...p, paletteId: id}))} />
          </section>
        </div>

        {/* Lado Direito: Preview Instantâneo (Menor) */}
        <div className="hidden lg:block lg:col-span-8 xl:col-span-9 sticky top-24 h-[calc(100vh-120px)]">
           <div className="w-full h-full border border-zinc-800 rounded-3xl overflow-hidden bg-zinc-900 relative shadow-2xl">
              {/* Barra de endereço fake para dar imersão */}
              <div className="h-10 bg-zinc-950 border-b border-zinc-800 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
                </div>
                <div className="flex-1 mx-4 bg-zinc-900 rounded-md h-6 flex items-center justify-center text-[10px] text-zinc-500 font-mono">
                  {formData.businessName ? `${formData.businessName.toLowerCase().replace(/\s/g, '-')}.sitecraft.app` : 'seu-site.com'}
                </div>
              </div>

              {/* O Preview em si */}
              <div className="w-full h-[calc(100%-40px)] bg-white overflow-y-auto">
                <WebsitePreview data={formData} palette={PALETTES.find(p => p.id === formData.paletteId)} />
              </div>

              {/* Overlay sutil incentivando o clique em "Ver meu Site" */}
              <div className="absolute bottom-6 right-6 pointer-events-none">
                 <div className="bg-zinc-900/90 text-white text-xs px-3 py-1.5 rounded-full border border-zinc-700 shadow-xl backdrop-blur-md">
                    Preenchendo...
                 </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default App;
