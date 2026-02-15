import React, { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase'; 
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, Settings, Palette, Upload, Layout, Download, 
  Loader2, Minimize2, RefreshCw, Briefcase, FileText, X, Phone, Instagram 
} from 'lucide-react';
import { TEMPLATES } from './components/templates'; 

const LAYOUT_STYLES = [
  { id: 'lovable', label: 'Lovable Clean', desc: 'Estilo Startup, fundo branco.' },
  { id: 'base_dark', label: 'Base Dark', desc: 'Modo escuro, brilho neon.' },
  { id: 'split', label: 'Split Modern', desc: 'Tela dividida profissional.' }
];

const COLORS = [
  { id: 'blue', primary: '#2563eb', secondary: '#1e40af' },
  { id: 'purple', primary: '#7c3aed', secondary: '#5b21b6' },
  { id: 'emerald', primary: '#059669', secondary: '#047857' },
  { id: 'rose', primary: '#e11d48', secondary: '#be123c' },
  { id: 'orange', primary: '#ea580c', secondary: '#c2410c' },
  { id: 'dark', primary: '#0f172a', secondary: '#334155' }
];

const App: React.FC = () => {
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [aiContent, setAiContent] = useState<any>(null);

  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    whatsapp: '',
    instagram: '',
    layoutStyle: 'modern',
    colorId: 'blue',
    logoBase64: ''
  });

  // --- MOTOR DE TEMPLATE (INJEÇÃO) ---
  const renderTemplate = (content: any, data: typeof formData) => {
    let html = TEMPLATES[data.layoutStyle] || TEMPLATES['modern'];
    const colors = COLORS.find(c => c.id === data.colorId) || COLORS[0];

    // 1. Textos
    html = html.replace(/{{BUSINESS_NAME}}/g, data.businessName);
    html = html.replace('{{HERO_TITLE}}', content.heroTitle);
    html = html.replace('{{HERO_SUBTITLE}}', content.heroSubtitle);
    html = html.replace('{{ABOUT_TITLE}}', content.aboutTitle);
    html = html.replace('{{ABOUT_TEXT}}', content.aboutText);
    html = html.replace('{{CONTACT_CALL}}', content.contactCall);

    // 2. Cores e Imagens
    html = html.replace(/{{COLOR_PRIMARY}}/g, colors.primary);
    html = html.replace(/{{COLOR_SECONDARY}}/g, colors.secondary);

    // 3. Logo
    if (data.logoBase64) {
      html = html.replace(/\[\[LOGO_AREA\]\]/g, `<img src="${data.logoBase64}" class="h-10 w-auto object-contain" alt="Logo" />`);
    } else {
      html = html.replace(/\[\[LOGO_AREA\]\]/g, `<span class="font-bold tracking-tight">${data.businessName}</span>`);
    }

    // 4. Botões Sociais Condicionais
    // WhatsApp
    if (data.whatsapp) {
      const waLink = `https://wa.me/${data.whatsapp.replace(/\D/g, '')}`;
      const waBtn = `<a href="${waLink}" target="_blank" class="block w-full text-center bg-green-500 text-white py-2 rounded font-bold hover:bg-green-600 transition shadow-md"><i class="fab fa-whatsapp"></i> WhatsApp</a>`;
      html = html.replace('[[WHATSAPP_BTN]]', waBtn);
    } else {
      html = html.replace('[[WHATSAPP_BTN]]', '');
    }

    // Instagram
    if (data.instagram) {
      const igLink = `https://instagram.com/${data.instagram.replace('@', '')}`;
      const igBtn = `<a href="${igLink}" target="_blank" class="block w-full text-center bg-pink-600 text-white py-2 rounded font-bold hover:bg-pink-700 transition shadow-md"><i class="fab fa-instagram"></i> Instagram</a>`;
      html = html.replace('[[INSTAGRAM_BTN]]', igBtn);
    } else {
      html = html.replace('[[INSTAGRAM_BTN]]', '');
    }

    return html;
  };

  // --- GERAÇÃO (IA) ---
  const handleGenerate = async () => {
    if (!formData.businessName || !formData.description) return alert("Preencha Nome e Ideia!");
    setIsGenerating(true);

    try {
      if (aiContent && generatedHtml) {
         setGeneratedHtml(renderTemplate(aiContent, formData)); // Só atualiza layout/botões
         setIsGenerating(false);
         return;
      }

      const generateFn = httpsCallable(functions, 'generateSite');
      const result: any = await generateFn({ 
        businessName: formData.businessName, 
        description: formData.description 
      });

      setAiContent(result.data);
      setGeneratedHtml(renderTemplate(result.data, formData));

    } catch (error: any) {
      console.error(error);
      alert("Erro: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Atualização em Tempo Real (Cores/Layout/Contatos)
  useEffect(() => {
    if (aiContent) setGeneratedHtml(renderTemplate(aiContent, formData));
  }, [formData.layoutStyle, formData.colorId, formData.logoBase64, formData.whatsapp, formData.instagram]);

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
      {/* PREVIEW */}
      <div className="absolute inset-0 z-0 bg-[#09090b]">
        {generatedHtml ? (
          <iframe srcDoc={generatedHtml} className="w-full h-full border-none bg-white" title="Preview" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full opacity-20 animate-pulse select-none">
            <Rocket className="w-24 h-24 mb-6" />
            <h2 className="text-4xl font-bold">SiteCraft AI</h2>
            <p className="mt-2">Crie sites interativos em segundos.</p>
          </div>
        )}
      </div>

      {/* EDITOR FLUTUANTE */}
      <motion.div drag dragMomentum={false} initial={{ x: 20, y: 20 }} className="absolute z-50 flex flex-col max-h-[95vh]">
        <AnimatePresence mode='wait'>
          {isMenuOpen ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-[380px] bg-zinc-900/95 backdrop-blur-xl border border-zinc-700 shadow-2xl rounded-2xl flex flex-col overflow-hidden">
              <div className="h-14 bg-zinc-800/80 border-b border-zinc-700 flex items-center justify-between px-5 cursor-move">
                <span className="font-bold flex items-center gap-2"><Settings size={18} className="text-indigo-400"/> Editor</span>
                <button onClick={() => setIsMenuOpen(false)} className="hover:bg-zinc-700 p-1.5 rounded"><Minimize2 size={18}/></button>
              </div>
              <div className="p-5 overflow-y-auto custom-scrollbar space-y-6 max-h-[80vh]">
                
                {/* 1. DADOS */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase flex gap-2 mb-1"><Briefcase size={12}/> Nome</label>
                    <input className="w-full bg-black/40 border border-zinc-700 rounded-lg p-3 text-sm focus:border-indigo-500 outline-none" placeholder="Ex: Pizzaria do Zé" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})}/>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase flex gap-2 mb-1"><FileText size={12}/> Ideia (Prompt)</label>
                    <textarea className="w-full h-20 bg-black/40 border border-zinc-700 rounded-lg p-3 text-sm focus:border-indigo-500 outline-none resize-none" placeholder="Ex: Pizzaria moderna, ambiente familiar..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}/>
                  </div>
                </div>

                {/* 2. CONTATOS (NOVOS) */}
                <div className="space-y-4">
                   <div className="flex gap-2">
                      <div className="flex-1">
                         <label className="text-[10px] font-bold text-zinc-500 uppercase flex gap-1 mb-1"><Phone size={10}/> WhatsApp</label>
                         <input className="w-full bg-black/40 border border-zinc-700 rounded-lg p-2 text-xs focus:border-green-500 outline-none" placeholder="Ex: 11999999999" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})}/>
                      </div>
                      <div className="flex-1">
                         <label className="text-[10px] font-bold text-zinc-500 uppercase flex gap-1 mb-1"><Instagram size={10}/> Instagram</label>
                         <input className="w-full bg-black/40 border border-zinc-700 rounded-lg p-2 text-xs focus:border-pink-500 outline-none" placeholder="Ex: @pizzaria" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})}/>
                      </div>
                   </div>
                </div>

                {/* 3. DESIGN */}
                <div className="space-y-2">
                   <label className="text-xs font-bold text-zinc-500 uppercase flex justify-between"><span>Logo</span> {formData.logoBase64 && <button onClick={() => setFormData(p=>({...p, logoBase64:''}))} className="text-red-400 text-[10px]"><X size={10}/></button>}</label>
                   {!formData.logoBase64 ? (
                     <label className="cursor-pointer border border-dashed border-zinc-600 hover:border-indigo-500 rounded-lg p-3 flex justify-center gap-2 text-xs text-zinc-400"><Upload size={14}/> Carregar Logo <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" /></label>
                   ) : (
                     <div className="h-12 bg-white/5 border border-zinc-700 rounded-lg flex items-center justify-center"><img src={formData.logoBase64} className="h-full object-contain" alt="Preview"/></div>
                   )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase"><Layout size={12} className="inline mr-1"/> Estilo</label>
                  <div className="grid grid-cols-1 gap-2">
                    {LAYOUT_STYLES.map(style => (
                      <button key={style.id} onClick={() => setFormData({...formData, layoutStyle: style.id})} className={`p-2 rounded-lg border text-left flex justify-between items-center transition-all ${formData.layoutStyle === style.id ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}><span className="font-bold text-xs">{style.label}</span></button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-bold text-zinc-500 uppercase"><Palette size={12} className="inline mr-1"/> Cor</label>
                   <div className="flex gap-2 flex-wrap">
                      {COLORS.map(c => (
                        <button key={c.id} onClick={() => setFormData({...formData, colorId: c.id})} className={`w-6 h-6 rounded-full border-2 transition-all ${formData.colorId === c.id ? 'border-white scale-110' : 'border-transparent opacity-50'}`} style={{ backgroundColor: c.primary }}/>
                      ))}
                   </div>
                </div>

                {/* BOTÕES */}
                <button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2">
                  {isGenerating ? <Loader2 className="animate-spin" /> : <RefreshCw />} {generatedHtml ? "Regerar Textos" : "Criar Site"}
                </button>
                {generatedHtml && <button onClick={handleDownloadZip} className="w-full border border-zinc-700 hover:bg-zinc-800 text-zinc-300 py-2 rounded-xl text-sm flex items-center justify-center gap-2"><Download size={16} /> Baixar HTML</button>}
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => setIsMenuOpen(true)} className="w-14 h-14 bg-indigo-600 hover:bg-indigo-500 rounded-full shadow-2xl flex items-center justify-center cursor-pointer ring-4 ring-black/20"><Settings className="text-white" size={26} /></motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
export default App;
