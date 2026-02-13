import React, { useState, useRef } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase'; 
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Settings, Palette as PaletteIcon, X, Download, Loader2, Maximize2, Minimize2, Move, RefreshCw } from 'lucide-react';

import BusinessForm from './components/BusinessForm';
import HtmlPreview from './components/HtmlPreview'; 
import PalettePicker from './components/PalettePicker';
import LandingPage from './components/LandingPage';
import { PALETTES } from './constants';
import { SiteFormData } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'builder'>('landing');
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(true); // Controle do Menu Flutuante

  const [formData, setFormData] = useState<SiteFormData>({
    businessName: '',
    segment: '',
    description: '',
    paletteId: 'p1',
    // ... outros campos ...
    logoUrl: '', targetAudience: '', tone: 'Descontraído', whatsapp: '', instagram: '', facebook: '', linkedin: '', layoutId: 'layout-1'
  });

  // --- IA + IMAGEM (Backend) ---
  const handleGenerateAI = async () => {
    if (!formData.businessName) return alert("Digite o nome da empresa!");
    setIsGenerating(true);
    try {
      const generateSiteFn = httpsCallable(functions, 'generateSite');
      const result: any = await generateSiteFn(formData);
      if (result.data.success) {
        setGeneratedHtml(result.data.html);
      }
    } catch (error: any) {
      alert(`Erro: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- MUDANÇA DE COR EM TEMPO REAL ---
  const handlePaletteChange = (newPaletteId: string) => {
    setFormData(prev => ({ ...prev, paletteId: newPaletteId }));
    if (generatedHtml) {
      const palette = PALETTES.find(p => p.id === newPaletteId);
      if (palette) {
        let newHtml = generatedHtml;
        newHtml = newHtml.replace(/primary: '#[a-fA-F0-9]{6}'/g, `primary: '${palette.primary}'`);
        newHtml = newHtml.replace(/secondary: '#[a-fA-F0-9]{6}'/g, `secondary: '${palette.secondary}'`);
        newHtml = newHtml.replace(/dark: '#[a-fA-F0-9]{6}'/g, `dark: '${palette.bg}'`);
        newHtml = newHtml.replace(/light: '#[a-fA-F0-9]{6}'/g, `light: '${palette.text}'`);
        setGeneratedHtml(newHtml);
      }
    }
  };

  const handleDownloadZip = () => {
    if (!generatedHtml) return;
    const zip = new JSZip();
    zip.file("index.html", generatedHtml);
    zip.generateAsync({ type: "blob" }).then(c => saveAs(c, "site.zip"));
  };

  if (view === 'landing') return <LandingPage onStart={() => setView('builder')} />;

  return (
    <div className="relative w-full h-screen bg-zinc-950 overflow-hidden font-sans">
      
      {/* 1. LAYER DO SITE (Fundo) */}
      <div className="absolute inset-0 z-0">
        {generatedHtml ? (
          <HtmlPreview htmlContent={generatedHtml} mode="desktop" />
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-500">
            <div className="text-center">
              <Rocket className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>O site aparecerá aqui em tela cheia.</p>
            </div>
          </div>
        )}
      </div>

      {/* 2. LAYER DO MENU FLUTUANTE (Draggable) */}
      <motion.div 
        drag
        dragMomentum={false} // Para não "escorregar" quando soltar
        initial={{ x: 20, y: 20 }}
        className="absolute z-50"
      >
        <AnimatePresence mode='wait'>
          {isMenuOpen ? (
            // --- ESTADO ABERTO (Painel Completo) ---
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-[380px] bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/50 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Header do Menu (Área de Arrastar) */}
              <div className="h-12 bg-zinc-800/50 border-b border-zinc-700/50 flex items-center justify-between px-4 cursor-move active:cursor-grabbing group">
                <div className="flex items-center gap-2 text-zinc-300">
                  <Move size={14} className="opacity-50 group-hover:opacity-100" />
                  <span className="font-bold text-sm">SiteCraft Editor</span>
                </div>
                <div className="flex gap-2">
                   {/* Botão Minimizar */}
                   <button onClick={() => setIsMenuOpen(false)} className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white">
                      <Minimize2 size={16} />
                   </button>
                </div>
              </div>

              {/* Corpo do Menu (Scrollável) */}
              <div className="p-5 overflow-y-auto custom-scrollbar space-y-6">
                
                {/* Botão Principal */}
                <button 
                  onClick={handleGenerateAI}
                  disabled={isGenerating}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2 transition-all"
                >
                  {isGenerating ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                  {generatedHtml ? "Regerar Site" : "Gerar com IA"}
                </button>

                {/* Cores */}
                <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                   <h3 className="text-xs font-bold text-zinc-400 uppercase mb-3 flex items-center gap-2">
                     <PaletteIcon size={12} /> Cores (Tempo Real)
                   </h3>
                   <PalettePicker selectedId={formData.paletteId} onSelect={handlePaletteChange} />
                </div>

                {/* Formulário */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase border-b border-zinc-700 pb-2">Dados do Negócio</h3>
                  <BusinessForm data={formData} onChange={(n, v) => setFormData(p => ({...p, [n]: v}))} />
                </div>

                {generatedHtml && (
                  <button onClick={handleDownloadZip} className="w-full border border-zinc-700 hover:bg-zinc-800 text-zinc-300 py-2 rounded-lg text-sm flex items-center justify-center gap-2">
                    <Download size={14} /> Baixar Código ZIP
                  </button>
                )}
              </div>
            </motion.div>

          ) : (
            // --- ESTADO MINIMIZADO (Apenas Ícone) ---
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              onClick={() => setIsMenuOpen(true)}
              className="w-12 h-12 bg-indigo-600 hover:bg-indigo-500 rounded-full shadow-2xl flex items-center justify-center text-white cursor-pointer ring-4 ring-black/20"
            >
              <Settings size={24} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default App;
