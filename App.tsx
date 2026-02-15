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
import { TEMPLATES } from './components/templates'; // Certifique-se de que o arquivo components/templates.ts existe

// --- 1. CONSTANTES E DADOS ---

// Removida a lista SEGMENTS. Agora a IA descobre o segmento pela descrição.

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
  { id: 'orange', primary: '#ea580c', secondary: '#c2410c' },
  { id: 'dark', primary: '#0f172a', secondary: '#334155' }
];

const App: React.FC = () => {
  // Estados da Aplicação
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [aiContent, setAiContent] = useState<any>(null); // Guarda o texto da IA

  // Formulário Simplificado (Sem select de segmento)
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    layoutStyle: 'modern',
    colorId: 'blue',
    logoBase64: ''
  });

  // --- 2. MOTOR DE TEMPLATES (A MÁGICA) ---
  const renderTemplate = (content: any, data: typeof formData) => {
    // 1. Escolhe o esqueleto HTML
    let html = TEMPLATES[data.layoutStyle] || TEMPLATES['modern'];
    const colors = COLORS.find(c => c.id === data.colorId) || COLORS[0];

    // 2. Injeta os Textos da IA
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

    // 3. Injeta Configurações Visuais
    html = html.replace(/{{COLOR_PRIMARY}}/g, colors.primary);
    html = html.replace(/{{COLOR_SECONDARY}}/g, colors.secondary);
    
    // Tag para imagem (usa a primeira palavra da descrição para buscar imagem)
    // Removemos acentos e espaços para a URL da imagem ficar limpa
    const segmentTag = data.description.split(' ')[0].normalize("NFD").replace(/[\u0300-\u036f]/g, "") || 'business';
    html = html.replace(/{{SEGMENT_TAG}}/g, segmentTag);

    // 4. Injeta Logo
    if (data.logoBase64) {
      const imgTag = `<img src="${data.logoBase64}" class="h-12 w-auto object-contain" alt="Logo" />`;
      html = html.replace(/\[\[LOGO_AREA\]\]/g, imgTag);
    } else {
      const textLogo = `<span class="font-bold tracking-tight">${data.businessName}</span>`;
      html = html.replace(/\[\[LOGO_AREA\]\]/g, textLogo);
    }

    return html;
  };

  // --- 3. COMUNICAÇÃO COM O BACKEND ---
  const handleGenerate = async () => {
    if (!formData.businessName) return alert("Digite o nome da empresa!");
    if (!formData.description) return alert("Descreva o negócio para a IA criar o conteúdo!");
    
    setIsGenerating(true);

    try {
      // Se já temos o texto da IA e só mudamos cor/layout, não gasta crédito da IA!
      if (aiContent && generatedHtml) {
         const newHtml = renderTemplate(aiContent, formData);
         setGeneratedHtml(newHtml);
         setIsGenerating(false);
         return;
      }

      // Chama a Cloud Function (só busca JSON)
      // Atenção: O nome da função deve bater com o exports.generateSiteContent do backend
      const generateFn = httpsCallable(functions, 'generateSiteContent');
      const result: any = await generateFn({ 
        businessName: formData.businessName, 
        description: formData.description 
      });

      const content = result.data;
      setAiContent(content); // Salva para reuso

      // Gera o HTML final
      const finalHtml = renderTemplate(content, formData);
      setGeneratedHtml(finalHtml);

    } catch (error: any) {
      console.error(error);
      alert("Erro ao gerar: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Atualiza em tempo real se mudar cor ou layout (sem chamar IA)
  useEffect(() => {
    if (aiContent) {
      const newHtml = renderTemplate(aiContent, formData);
      setGeneratedHtml(newHtml);
    }
  }, [formData.layoutStyle, formData.colorId, formData.logoBase64]);


  // --- 4. FUNÇÕES UTILITÁRIAS ---
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return alert("O logo deve ser menor que 2MB");
      const reader = new FileReader();
      reader.onloadend = () => setFormData(p => ({ ...p, logoBase64: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadZip = () => {
    if (!generatedHtml) return;
    const zip = new JSZip();
    zip.file("index.html", generatedHtml);
    zip.generateAsync({ type: "blob" }).then(c => saveAs(c, `${formData.businessName.trim()}.zip`));
  };

  // --- 5. RENDERIZAÇÃO (INTERFACE) ---
  return (
    <div className="relative w-full h-screen bg-zinc-950 overflow-hidden font-sans text-white">
      
      {/* BACKGROUND (PREVIEW) */}
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
            <p className="mt-2">Preencha os dados ao lado para começar.</p>
          </div>
        )}
      </div>

      {/* MENU FLUTUANTE (SIDEBAR) */}
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
              {/* Header do Menu */}
              <div className="h-14 bg-zinc-800/80 border-b border-zinc-700 flex items-center justify-between px-5 cursor-move">
                <span className="font-bold flex items-center gap-2"><Settings size={18} className="text-indigo-400"/> Editor</span>
                <button onClick={() => setIsMenuOpen(false)} className="hover:bg-zinc-700 p-1.5 rounded"><Minimize2 size={18}/></button>
              </div>

              {/* Corpo do Menu */}
              <div className="p-5 overflow-y-auto custom-scrollbar space-y-6 max-h-[80vh]">
                
                {/* Inputs de Texto */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase flex gap-2 mb-1"><Briefcase size={12}/> Nome</label>
                    <input 
                      className="w-full bg-black/40 border border-zinc-700 rounded-lg p-3 text-sm focus:border-indigo-500 outline-none"
                      placeholder="Ex: Pizzaria do Zé"
                      value={formData.businessName}
                      onChange={e => setFormData({...formData, businessName: e.target.value})}
                    />
                  </div>
                  
                  {/* CAMPO DE PROMPT (SUBSTITUI O SEGMENTO) */}
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase flex gap-2 mb-1"><FileText size={12}/> Ideia (Prompt)</label>
                    <textarea 
                      className="w-full h-24 bg-black/40 border border-zinc-700 rounded-lg p-3 text-sm focus:border-indigo-500 outline-none resize-none placeholder:text-zinc-600"
                      placeholder="Descreva o negócio... Ex: 'Advocacia trabalhista com foco em bancários, ambiente sério e tradicional...'"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </div>

                {/* Logo */}
                <div className="space-y-2">
                   <label className="text-xs font-bold text-zinc-500 uppercase flex justify-between">
                     <span>Logo</span>
                     {formData.logoBase64 && <button onClick={() => setFormData(p=>({...p, logoBase64
