import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase'; // Certifique-se que seu firebase.ts exporta 'functions'
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Settings, Palette as PaletteIcon, Eye, X, Download, Loader2, Lock, LogIn } from 'lucide-react';

// Seus Componentes
import BusinessForm from './components/BusinessForm';
import WebsitePreview from './components/WebsitePreview'; // Preview estático (enquanto digita)
import HtmlPreview from './components/HtmlPreview';       // Preview real (do HTML gerado)
import PalettePicker from './components/PalettePicker';
import LandingPage from './components/LandingPage';
import { PALETTES } from './constants';
import { SiteFormData } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'builder'>('landing');
  
  // Estado para o site gerado pela IA (HTML puro)
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);

  // Estado do Formulário
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

  // --- FUNÇÃO 1: CHAMAR A IA (CORRIGIDA) ---
  const handleGenerateAI = async () => {
    if (!formData.businessName) return alert("Digite o nome da sua empresa!");
    if (!formData.description) return alert("Descreva um pouco seu negócio para a IA criar o texto!");

    setIsGenerating(true);
    
    try {
      // Chama a função 'generateSite' que criamos no Backend
      const generateSiteFn = httpsCallable(functions, 'generateSite');
      
      console.log("Enviando dados para o Gemini:", formData); // Debug

      // AQUI ESTÁ A CORREÇÃO: Enviamos o objeto formData direto
      const result: any = await generateSiteFn(formData);

      if (result.data.success) {
        setGeneratedHtml(result.data.html); // Salva o HTML na memória
        setShowFullPreview(true);           // Abre o preview tela cheia
      }

    } catch (error: any) {
      console.error("Erro detalhado:", error);
      alert(`Erro na geração: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- FUNÇÃO 2: BAIXAR ZIP (SIMULA DEPLOY) ---
  const handleDownloadZip = () => {
    if (!generatedHtml) return;
    const zip = new JSZip();

    // Cria estrutura para Firebase Hosting
    zip.file("public/index.html", generatedHtml);
    zip.file("firebase.json", JSON.stringify({
      hosting: { public: "public", rewrites: [{ source: "**", destination: "/index.html" }] }
    }, null, 2));

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, `${formData.businessName.replace(/\s+/g, '-')}-site.zip`);
    });
  };

  if (view === 'landing') return <LandingPage onStart={() => setView('builder')} />;

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-white font-sans">
      
      {/* --- PREVIEW TELA CHEIA (O SITE REAL GERADO) --- */}
      <AnimatePresence>
        {showFullPreview && generatedHtml && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-50 bg-white flex flex-col"
          >
            {/* Barra de Controle do Preview */}
            <div className="bg-zinc-900 text-white px-4 py-3 shadow-lg flex items-center justify-between border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">Seu Site Está Pronto! 🚀</span>
                <span className="text-xs bg-indigo-600 px-2 py-1 rounded text-white/90">Rascunho</span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleDownloadZip}
                  className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-colors"
                >
                  <Download size={16} /> Baixar Código (ZIP)
                </button>
                <button 
                  onClick={() => setShowFullPreview(false)}
                  className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* O Iframe Seguro */}
            <div className="flex-1 w-full bg-gray-100 overflow-hidden">
               <HtmlPreview htmlContent={generatedHtml} mode="desktop" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- HEADER PRINCIPAL --- */}
      <header className="border-b border-zinc-800 p-4 flex justify-between items-center bg-zinc-950 sticky top-0 z-40">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
             <Rocket className="text-white w-5 h-5" />
           </div>
           <span className="font-bold text-lg tracking-tight">SiteCraft AI</span>
        </div>
        
        <button 
          onClick={handleGenerateAI}
          disabled={isGenerating}
          className="bg-white text-zinc-900 px-6 py-2.5 rounded-full hover:bg-zinc-200 transition-all font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? <Loader2 className="animate-spin" /> : <Eye size={18} />}
          {isGenerating ? "A IA está criando..." : "Gerar Site com IA"}
        </button>
      </header>

      {/* --- CONTEÚDO (FORMULÁRIO E PREVIEW RÁPIDO) --- */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Esquerda: Formulário */}
        <div className="lg:col-span-4 space-y-6 pb-20">
          <section className="bg-zinc-900/50 backdrop-blur-sm p-6 rounded-2xl border border-zinc-800/50">
            <h2 className="flex items-center gap-2 mb-6 font-semibold text-zinc-100 border-b border-zinc-800 pb-4">
              <Settings size={18} className="text-indigo-400"/> Dados do Negócio
            </h2>
            <BusinessForm data={formData} onChange={(name, val) => setFormData(p => ({...p, [name]: val}))} />
          </section>
          
          <section className="bg-zinc-900/50 backdrop-blur-sm p-6 rounded-2xl border border-zinc-800/50">
            <h2 className="flex items-center gap-2 mb-6 font-semibold text-zinc-100 border-b border-zinc-800 pb-4">
              <PaletteIcon size={18} className="text-indigo-400"/> Estilo Visual
            </h2>
            <PalettePicker selectedId={formData.paletteId} onSelect={(id) => setFormData(p => ({...p, paletteId: id}))} />
          </section>
        </div>

        {/* Direita: Preview Rápido (React) */}
        <div className="hidden lg:block lg:col-span-8 sticky top-24 h-[calc(100vh-120px)]">
           <div className="w-full h-full border border-zinc-800 rounded-3xl overflow-hidden bg-zinc-900 relative shadow-2xl">
              <div className="h-10 bg-zinc-950 border-b border-zinc-800 flex items-center px-4 gap-2">
                <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500/20"></div><div className="w-3 h-3 rounded-full bg-yellow-500/20"></div><div className="w-3 h-3 rounded-full bg-green-500/20"></div></div>
                <div className="flex-1 mx-4 bg-zinc-900 rounded-md h-6 flex items-center justify-center text-[10px] text-zinc-500 font-mono">racionamento-visual.sitecraft.app</div>
              </div>
              <div className="w-full h-[calc(100%-40px)] bg-white overflow-y-auto">
                <WebsitePreview data={formData} palette={PALETTES.find(p => p.id === formData.paletteId)} />
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default App;
