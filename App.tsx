import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase'; 
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, Settings, Palette as PaletteIcon, Upload, Layout, 
  Download, Loader2, Minimize2, RefreshCw, Image as ImageIcon, Briefcase, X 
} from 'lucide-react';

import HtmlPreview from './components/HtmlPreview'; 
import PalettePicker from './components/PalettePicker';
import LandingPage from './components/LandingPage';
import { PALETTES } from './constants'; 

// --- LISTA ROBUSTA DE SEGMENTOS ---
const SEGMENTS = [
  "Advocacia e Jurídico", "Agência de Marketing", "Arquitetura e Interiores", 
  "Barbearia", "Cafeteria e Padaria", "Clínica Médica", "Clínica Odontológica",
  "Consultoria Financeira", "Contabilidade", "Delivery de Comida", 
  "Educação e Cursos", "Energia Solar", "Engenharia Civil", "Estética e Beleza", 
  "Eventos e Festas", "Academia e Personal Trainer", "Imobiliária", 
  "Limpeza e Higienização", "Logística e Transportes", "Mecânica Automotiva",
  "Pet Shop e Veterinária", "Pizzaria", "Psicologia", "Restaurante", 
  "Salão de Beleza", "Seguros e Corretagem", "Tecnologia e TI", 
  "Turismo e Viagens", "Varejo e Loja de Roupas"
];

const LAYOUT_STYLES = [
  { id: 'modern', label: 'Moderno', desc: 'Limpo, espaçoso, vidro.' },
  { id: 'classic', label: 'Clássico', desc: 'Sério, corporativo, tradicional.' },
  { id: 'bold', label: 'Arrojado', desc: 'Fontes grandes, alto contraste.' },
  { id: 'minimal', label: 'Minimalista', desc: 'Menos é mais, foco total.' }
];

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'builder'>('landing');
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  
  const [formData, setFormData] = useState({
    businessName: '',
    segment: 'Tecnologia e TI',
    layoutStyle: 'modern',
    description: '',
    paletteId: 'p1',
    whatsapp: '',
    instagram: '',
    logoBase64: '' 
  });

  // --- 1. UPLOAD DE LOGO ---
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validação de tamanho (max 2MB para não travar o payload)
      if (file.size > 2 * 1024 * 1024) return alert("O logo deve ter no máximo 2MB");
      
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, logoBase64: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => setFormData(prev => ({ ...prev, logoBase64: '' }));

  // --- 2. GERAÇÃO INTELIGENTE ---
  const handleGenerateAI = async () => {
    if (!formData.businessName) return alert("Digite o nome da empresa!");
    setIsGenerating(true);
    
    // Pega o objeto de cor completo
    const selectedPalette = PALETTES.find(p => p.id === formData.paletteId);

    try {
      const generateSiteFn = httpsCallable(functions, 'generateSite');
      // Envia tudo separado para a IA montar
      const payload = { ...formData, palette: selectedPalette };

      const result: any = await generateSiteFn(payload);
      if (result.data.success) {
        setGeneratedHtml(result.data.html);
      }
    } catch (error: any) {
      alert(`Erro: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- 3. TROCA DE COR INSTANTÂNEA ---
  const handlePaletteChange = (newPaletteId: string) => {
    setFormData(prev => ({ ...prev, paletteId: newPaletteId }));
    
    if (generatedHtml) {
      const palette = PALETTES.find(p => p.id === newPaletteId);
      if (palette) {
        let newHtml = generatedHtml;
        // Regex para atualizar cores do Tailwind Config em tempo real
        newHtml = newHtml.replace(/primary: '.*?'/, `primary: '${palette.primary}'`);
        newHtml = newHtml.replace(/secondary: '.*?'/, `secondary: '${palette.secondary}'`);
        newHtml = newHtml.replace(/dark: '.*?'/, `dark: '${palette.bg}'`);
        newHtml = newHtml.replace(/light: '.*?'/, `light: '${palette.text}'`);
        setGeneratedHtml(newHtml);
      }
    }
  };

  const handleDownloadZip = () => {
    if (!generatedHtml) return;
    const zip = new JSZip();
    zip.file("index.html", generatedHtml);
    zip.generateAsync({ type: "blob" }).then(c => saveAs(c, `${formData.businessName.trim()}.zip`));
  };

  if (view === 'landing') return <LandingPage onStart={() => setView('builder')} />;

  return (
    <div className="relative w-full h-screen bg-zinc-950 overflow-hidden font-sans text-white">
      
      {/* BACKGROUND / PREVIEW */}
      <div className="absolute inset-0 z-0 bg-[#09090b]">
        {generatedHtml ? (
          <HtmlPreview htmlContent={generatedHtml} mode="desktop" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full opacity-30 animate-pulse">
            <Rocket className="w-24 h-24 mb-6" />
            <h2 className="text-3xl font-bold">SiteCraft Editor</h2>
            <p>Seu site aparecerá aqui em tela cheia.</p>
          </div>
        )}
      </div>

      {/* MENU FLUTUANTE */}
      <motion.div 
        drag dragMomentum={false} initial={{ x: 20, y: 20 }}
        className="absolute z-50 flex flex-col max-h-[95vh]"
      >
        <AnimatePresence mode='wait'>
          {isMenuOpen ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="w-[400px] bg-zinc-900/95 backdrop-blur-xl border border-zinc-700 shadow-2xl rounded-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="h-14 bg-zinc-800/80 border-b border-zinc-700 flex items-center justify-between px-5 cursor-move">
                <span className="font-bold flex items-center gap-2"><Settings size={18} className="text-indigo-400"/> Editor</span>
                <button onClick={() => setIsMenuOpen(false)} className="hover:bg-zinc-700 p-1.5 rounded"><Minimize2 size={18}/></button>
              </div>

              {/* Conteúdo */}
              <div className="p-5 overflow-y-auto custom-scrollbar space-y-6 max-h-[80vh]">
                
                {/* 1. Identidade */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Identidade</label>
                  <input 
                    type="text" placeholder="Nome da Empresa"
                    className="w-full bg-black/40 border border-zinc-700 rounded-lg p-3 text-sm focus:border-indigo-500 outline-none"
                    value={formData.businessName}
                    onChange={e => setFormData({...formData, businessName: e.target.value})}
                  />
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 text-zinc-500" size={16} />
                    <select 
                      className="w-full bg-black/40 border border-zinc-700 rounded-lg p-3 pl-10 text-sm focus:border-indigo-500 outline-none appearance-none"
                      value={formData.segment}
                      onChange={e => setFormData({...formData, segment: e.target.value})}
                    >
                      {SEGMENTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* 2. Logo */}
                <div className="space-y-3">
                   <label className="text-xs font-bold text-zinc-500 uppercase flex items-center justify-between">
                     <span>Logo (Opcional)</span>
                     {formData.logoBase64 && <button onClick={removeLogo} className="text-red-400 text-[10px] flex items-center gap-1 hover:underline"><X size={10}/> Remover</button>}
                   </label>
                   
                   {!formData.logoBase64 ? (
                     <label className="cursor-pointer border border-dashed border-zinc-600 hover:border-indigo-500 hover:bg-indigo-500/10 rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-all">
                        <Upload size={20} className="text-zinc-400"/>
                        <span className="text-xs text-zinc-400">Clique para enviar logo</span>
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                     </label>
                   ) : (
                     <div className="w-full h-16 bg-white/5 border border-zinc-700 rounded-lg flex items-center justify-center p-2 relative">
                        <img src={formData.logoBase64} alt="Logo" className="max-h-full object-contain" />
                     </div>
                   )}
                </div>

                {/* 3. Estilo (Layout) */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2"><Layout size={14}/> Layout</label>
                  <div className="grid grid-cols-2 gap-2">
                    {LAYOUT_STYLES.map(style => (
                      <button
                        key={style.id}
                        onClick={() => setFormData({...formData, layoutStyle: style.id})}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          formData.layoutStyle === style.id 
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/50' 
                            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
                        }`}
                      >
                        <div className="font-bold text-xs">{style.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Cores */}
                <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                   <h3 className="text-xs font-bold text-zinc-500 uppercase mb-3 flex items-center gap-2">
                     <PaletteIcon size={12} /> Cores
                   </h3>
                   <PalettePicker selectedId={formData.paletteId} onSelect={handlePaletteChange} />
                </div>

                {/* AÇÃO */}
                <button 
                  onClick={handleGenerateAI}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-900/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                  {generatedHtml ? "Regerar Site" : "Criar Site"}
                </button>

                {generatedHtml && (
                  <button onClick={handleDownloadZip} className="w-full border border-zinc-700 hover:bg-zinc-800 text-zinc-300 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 font-medium transition-colors">
                    <Download size={16} /> Baixar Site
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }} 
              onClick={() => setIsMenuOpen(true)}
              className="w-14 h-14 bg-indigo-600 hover:bg-indigo-500 rounded-full shadow-2xl flex items-center justify-center cursor-pointer ring-4 ring-black/20 hover:scale-110 transition-transform"
            >
              <Settings className="text-white" size={26} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default App;
