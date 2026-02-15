import React, { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase'; 
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, Settings, Palette, Upload, Layout, Download, 
  Loader2, Minimize2, RefreshCw, Briefcase, FileText, X 
} from 'lucide-react';
import { TEMPLATES } from './components/templates'; // Importa nossos templates de elite

// --- CONSTANTES ---
const LAYOUT_STYLES = [
  { id: 'modern', label: 'Moderno & Luxo', desc: 'Menu flutuante, vidro, suave.' },
  { id: 'tech', label: 'Tech & Futuro', desc: 'Neon, cursor animado, overlay.' },
  { id: 'retro', label: 'Retro & Pop', desc: 'Brutalista, cores fortes, marquee.' }
];

const COLORS = [
  { id: 'blue', primary: '#2563eb', secondary: '#1e40af' },
  { id: 'purple', primary: '#7c3aed', secondary: '#5b21b6' },
  { id: 'emerald', primary: '#059669', secondary: '#047857' },
  { id: 'rose', primary: '#e11d48', secondary: '#be123c' },
  { id: 'orange', primary: '#ea580c', secondary: '#c2410c' }
];

const App: React.FC = () => {
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [aiContent, setAiContent] = useState<any>(null); // Guarda o texto da IA para reuso

  // Estado do Formulário
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    layoutStyle: 'modern',
    colorId: 'blue',
    logoBase64: ''
  });

  // --- 1. FUNÇÃO MESTRA DE GERAÇÃO (Template Engine) ---
  const renderTemplate = (content: any, data: typeof formData) => {
    // Escolhe o template
    let html = TEMPLATES[data.layoutStyle] || TEMPLATES['modern'];
    const colors = COLORS.find(c => c.id === data.colorId) || COLORS[0];

    // INJEÇÃO DE TEXTOS (Substitui {{PLACEHOLDERS}})
    html = html.replace(/{{BUSINESS_NAME}}/g, data.businessName);
    html = html.replace('{{HERO_TITLE}}', content.heroTitle);
    html = html.replace('{{HERO_SUBTITLE}}', content.heroSubtitle);
    html = html.replace('{{FEATURE_1_TITLE}}', content.feature1Title);
    html = html.replace('{{FEATURE_1_DESC}}', content.feature1Desc);
    html = html.replace('{{FEATURE_2_TITLE}}', content.feature2Title);
    html = html.replace('{{FEATURE_2_DESC}}', content.feature2Desc);
    html = html.replace('{{FEATURE_3_TITLE}}', content.feature3Title);
    html = html.replace('{{FEATURE_3_DESC}}', content.feature3Desc);
    html = html.replace('{{ABOUT_TITLE}}', content.aboutTitle);
    html = html.replace('{{ABOUT_TEXT}}', content.aboutText);

    // INJEÇÃO TÉCNICA (Cores, Imagens, Logo)
    html = html.replace(/{{COLOR_PRIMARY}}/g, colors.primary);
    html = html.replace(/{{COLOR_SECONDARY}}/g, colors.secondary);
    
    // Gera tag de busca pro Unsplash/Pollinations baseado no nome/descrição
    const segmentTag = data.description.split(' ')[0] || 'business'; 
    html = html.replace(/{{SEGMENT_TAG}}/g, segmentTag);

    // INJEÇÃO DE LOGO
    if (data.logoBase64) {
      // Se tem imagem, usa ela
      const imgTag = `<img src="${data.logoBase64}" class="h-12 w-auto object-contain" alt="Logo" />`;
      html = html.replace(/\[\[LOGO_AREA\]\]/g, imgTag);
    } else {
      // Se não, usa texto estilizado
      const textLogo = `<span class="font-bold tracking-tight">${data.businessName}</span>`;
      html = html.replace(/\[\[LOGO_AREA\]\]/g, textLogo);
    }

    return html;
  };

  // --- 2. CHAMADA PARA A IA (Backend) ---
  const handleGenerate = async () => {
    if (!formData.businessName || !formData.description) return alert("Preencha Nome e Descrição!");
    setIsGenerating(true);

    try {
      // Se já temos conteúdo da IA e só mudamos o layout/cor, não chama o backend de novo!
      if (aiContent && generatedHtml) {
         const newHtml = renderTemplate(aiContent, formData);
         setGeneratedHtml(newHtml);
         setIsGenerating(false);
         return;
      }

      // Chama a Cloud Function para gerar os TEXTOS (JSON)
      const generateFn = httpsCallable(functions, 'generateSiteContent');
      const result: any = await generateFn({ 
        businessName: formData.businessName, 
        description: formData.description 
      });

      const content = result.data;
      setAiContent(content); // Guarda para reuso

      // Renderiza o HTML final
      const finalHtml = renderTemplate(content, formData);
      setGeneratedHtml(finalHtml);

    } catch (error: any) {
      alert("Erro: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Efeito: Se mudar cor ou layout e já tiver conteúdo, atualiza em tempo real
  useEffect(() => {
    if (aiContent) {
      const newHtml = renderTemplate(aiContent, formData);
      setGeneratedHtml(newHtml);
    }
  }, [formData.layoutStyle, formData.colorId, formData.logoBase64]);


  // --- UPLOAD LOGO ---
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(p => ({ ...p, logoBase64: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadZip = () => {
    if (!generatedHtml) return;
    const zip = new JSZip();
    zip.file("index.html", generatedHtml);
    zip.generateAsync({ type: "blob" }).then(c => saveAs(c, `${formData.businessName}.zip`));
  };

  return (
    <div className="relative w-full h-screen bg-zinc-950 overflow-hidden font-sans text-white">
      
      {/* 1. ÁREA DE PREVIEW (IFRAME FULLSCREEN) */}
      <div className="absolute inset-0 z-0 bg-[#09090b]">
        {generatedHtml ? (
          <iframe 
            srcDoc={generatedHtml} 
            className="w-full h-full border-none bg-white" 
            title="Site Preview"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full opacity-20 animate-pulse select-none">
            <Rocket className="w-24 h-24 mb-6" />
            <h2 className="text-4xl font-bold">SiteCraft AI</h2>
            <p>Seu site aparecerá aqui.</p>
          </div>
        )}
      </div>

      {/* 2. MENU FLUTUANTE DRAGGABLE */}
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

              {/* Conteúdo Scrollável */}
              <div className="p-5 overflow-y-auto custom-scrollbar space-y-6 max-h-[80vh]">
                
                {/* IDENTIDADE */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-500 uppercase flex gap-2"><Briefcase size={12}/> Nome do Negócio</label>
                  <input 
                    className="w-full bg-black/40 border border-zinc-700 rounded-lg p-3 text-sm focus:border-indigo-500 outline-none"
                    placeholder="Ex: Café do Futuro"
                    value={formData.businessName}
                    onChange={e => setFormData({...formData, businessName: e.target.value})}
                  />
                </div>

                {/* PROMPT (DESCRIÇÃO) */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-500 uppercase flex gap-2"><FileText size={12}/> Ideia (Prompt)</label>
                  <textarea 
                    className="w-full h-24 bg-black/40 border border-zinc-700 rounded-lg p-3 text-sm focus:border-indigo-500 outline-none resize-none"
                    placeholder="Descreva seu site: 'Uma cafeteria moderna com cafés especiais e ambiente de coworking...'"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                {/* LOGO */}
                <div className="space-y-3">
                   <label className="text-xs font-bold text-zinc-500 uppercase flex justify-between">
                     <span>Logo (Opcional)</span>
                     {formData.logoBase64 && <button onClick={() => setFormData(p=>({...p, logoBase64:''}))} className="text-red-400 text-[10px] flex items-center gap-1"><X size={10}/> Remover</button>}
                   </label>
                   {!formData.logoBase64 ? (
                     <label className="cursor-pointer border border-dashed border-zinc-600 hover:border-indigo-500 hover:bg-indigo-500/10 rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-all">
                        <Upload size={20} className="text-zinc-400"/>
                        <span className="text-xs text-zinc-400">Carregar Imagem</span>
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                     </label>
                   ) : (
                     <div className="h-16 bg-white/5 border border-zinc-700 rounded-lg flex items-center justify-center p-2">
                        <img src={formData.logoBase64} className="h-full object-contain" alt="Preview"/>
                     </div>
                   )}
                </div>

                {/* ESTILO */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-500 uppercase flex gap-2"><Layout size={12}/> Estilo Visual</label>
                  <div className="grid grid-cols-1 gap-2">
                    {LAYOUT_STYLES.map(style => (
                      <button
                        key={style.id}
                        onClick={() => setFormData({...formData, layoutStyle: style.id})}
                        className={`p-3 rounded-lg border text-left flex items-center justify-between transition-all ${
                          formData.layoutStyle === style.id 
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' 
                            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
                        }`}
                      >
                        <span className="font-bold text-sm">{style.label}</span>
                        <span className="text-[10px] opacity-70">{style.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* CORES */}
                <div className="space-y-3">
                   <label className="text-xs font-bold text-zinc-500 uppercase flex gap-2"><Palette size={12}/> Cor Principal</label>
                   <div className="flex gap-2">
                      {COLORS.map(c => (
                        <button 
                          key={c.id} 
                          onClick={() => setFormData({...formData, colorId: c.id})}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${formData.colorId === c.id ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'}`}
                          style={{ backgroundColor: c.primary }}
                        />
                      ))}
                   </div>
                </div>

                {/* AÇÃO */}
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-900/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                  {generatedHtml ? "Regerar Site" : "Criar Site"}
                </button>

                {generatedHtml && (
                  <button onClick={handleDownloadZip} className="w-full border border-zinc-700 hover:bg-zinc-800 text-zinc-300 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 font-medium transition-colors">
                    <Download size={16} /> Baixar ZIP
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
