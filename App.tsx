import React, { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket, Settings, Palette, Upload, Layout, Download,
  Loader2, Minimize2, RefreshCw, Briefcase, FileText, X, Phone, Instagram, MapPin
} from 'lucide-react';
import { TEMPLATES } from './components/templates';

const LAYOUT_STYLES = [
  { id: 'brasil_claro', label: 'Brasil Claro', desc: 'Clean nacional com foco em conversão.' },
  { id: 'samba_noturno', label: 'Samba Noturno', desc: 'Escuro elegante e moderno.' },
  { id: 'bairro_forte', label: 'Bairro Forte', desc: 'Comercial local, direto ao ponto.' },
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
    facebook: '',
    tiktok: '',
    ifood: '',
    noveNove: '',
    keeta: '',
    phone: '',
    email: '',
    address: '',
    mapEmbed: '',
    showForm: true,
    layoutStyle: 'brasil_claro',
    colorId: 'blue',
    logoBase64: ''
  });

  const renderTemplate = (content: any, data: typeof formData) => {
    let html = TEMPLATES[data.layoutStyle] || TEMPLATES['brasil_claro'];
    const colors = COLORS.find(c => c.id === data.colorId) || COLORS[0];

    const replaceAll = (token: string, value: string) => {
      html = html.split(token).join(value);
    };

    replaceAll('{{BUSINESS_NAME}}', data.businessName || 'Sua Empresa');
    replaceAll('{{HERO_TITLE}}', content.heroTitle || `Bem-vindo à ${data.businessName}`);
    replaceAll('{{HERO_SUBTITLE}}', content.heroSubtitle || 'Seu negócio com presença digital profissional.');
    replaceAll('{{ABOUT_TITLE}}', content.aboutTitle || 'Quem Somos');
    replaceAll('{{ABOUT_TEXT}}', content.aboutText || 'Somos uma equipe focada em resultado e atendimento próximo.');
    replaceAll('{{CONTACT_CALL}}', content.contactCall || 'Fale com a gente');
    replaceAll('{{COLOR_PRIMARY}}', colors.primary);
    replaceAll('{{COLOR_SECONDARY}}', colors.secondary);
    replaceAll('{{ADDRESS}}', data.address || 'Endereço não informado');
    replaceAll('{{PHONE}}', data.phone || data.whatsapp || 'Telefone não informado');
    replaceAll('{{EMAIL}}', data.email || 'Email não informado');

    if (data.logoBase64) {
      html = html.replace(/\[\[LOGO_AREA\]\]/g, `<img src="${data.logoBase64}" class="h-10 w-auto object-contain" alt="Logo" />`);
    } else {
      html = html.replace(/\[\[LOGO_AREA\]\]/g, `<span class="font-bold tracking-tight">${data.businessName || 'Sua Empresa'}</span>`);
    }

    const actionBtn = (label: string, icon: string, href: string, classes: string) =>
      `<a href="${href}" target="_blank" class="block w-full text-center ${classes} text-white py-2 rounded-lg font-bold transition shadow-md"><i class="${icon}"></i> ${label}</a>`;

    replaceAll('[[WHATSAPP_BTN]]', data.whatsapp ? actionBtn('WhatsApp', 'fab fa-whatsapp', `https://wa.me/${data.whatsapp.replace(/\D/g, '')}`, 'bg-green-500 hover:bg-green-600') : '');
    replaceAll('[[INSTAGRAM_BTN]]', data.instagram ? actionBtn('Instagram', 'fab fa-instagram', `https://instagram.com/${data.instagram.replace('@', '')}`, 'bg-pink-600 hover:bg-pink-700') : '');
    replaceAll('[[FACEBOOK_BTN]]', data.facebook ? actionBtn('Facebook', 'fab fa-facebook-f', data.facebook.startsWith('http') ? data.facebook : `https://${data.facebook}`, 'bg-blue-700 hover:bg-blue-800') : '');
    replaceAll('[[TIKTOK_BTN]]', data.tiktok ? actionBtn('TikTok', 'fab fa-tiktok', data.tiktok.startsWith('http') ? data.tiktok : `https://${data.tiktok}`, 'bg-slate-800 hover:bg-black') : '');
    replaceAll('[[IFOOD_BTN]]', data.ifood ? actionBtn('iFood', 'fas fa-bag-shopping', data.ifood.startsWith('http') ? data.ifood : `https://${data.ifood}`, 'bg-red-600 hover:bg-red-700') : '');
    replaceAll('[[NOVE_NOVE_BTN]]', data.noveNove ? actionBtn('99 Food', 'fas fa-motorcycle', data.noveNove.startsWith('http') ? data.noveNove : `https://${data.noveNove}`, 'bg-yellow-500 hover:bg-yellow-600 text-slate-900') : '');
    replaceAll('[[KEETA_BTN]]', data.keeta ? actionBtn('Keeta', 'fas fa-store', data.keeta.startsWith('http') ? data.keeta : `https://${data.keeta}`, 'bg-orange-600 hover:bg-orange-700') : '');

    const mapArea = data.mapEmbed
      ? `<iframe src="${data.mapEmbed}" width="100%" height="220" style="border:0;" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`
      : '<p class="text-sm text-slate-500">Mapa não informado.</p>';
    replaceAll('[[MAP_AREA]]', mapArea);

    const contactForm = data.showForm
      ? `<form class="space-y-3"><input class="w-full border border-slate-300 rounded-lg p-2" placeholder="Seu nome" /><input class="w-full border border-slate-300 rounded-lg p-2" placeholder="Seu email" /><textarea class="w-full border border-slate-300 rounded-lg p-2" rows="4" placeholder="Sua mensagem"></textarea><button type="button" class="btn-primary w-full py-2 rounded-lg font-semibold">Enviar mensagem</button></form>`
      : '<p class="text-sm text-slate-500">Formulário desativado para este site.</p>';
    replaceAll('[[CONTACT_FORM]]', contactForm);

    return html;
  };

  const handleGenerate = async () => {
    if (!formData.businessName || !formData.description) return alert('Preencha Nome e Ideia!');
    setIsGenerating(true);

    try {
      if (aiContent && generatedHtml) {
        setGeneratedHtml(renderTemplate(aiContent, formData));
        setIsGenerating(false);
        return;
      }

      const generateFn = httpsCallable(functions, 'generateSite');
      const result: any = await generateFn({ businessName: formData.businessName, description: formData.description });
      setAiContent(result.data);
      setGeneratedHtml(renderTemplate(result.data, formData));
    } catch (error: any) {
      console.error(error);
      alert('Erro: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (aiContent) setGeneratedHtml(renderTemplate(aiContent, formData));
  }, [formData, aiContent]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormData(p => ({ ...p, logoBase64: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleDownloadZip = () => {
    if (!generatedHtml) return;
    const zip = new JSZip();
    zip.file('index.html', generatedHtml);
    zip.generateAsync({ type: 'blob' }).then(c => saveAs(c, `${formData.businessName}.zip`));
  };

  return (
    <div className="relative w-full h-screen bg-zinc-950 overflow-hidden font-sans text-white">
      <div className="absolute inset-0 z-0 bg-[#09090b]">
        {generatedHtml ? (
          <iframe srcDoc={generatedHtml} className="w-full h-full border-none bg-white" title="Preview" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full opacity-20 animate-pulse select-none">
            <Rocket className="w-24 h-24 mb-4" />
            <h2 className="text-2xl font-bold">Seu preview aparece aqui</h2>
          </div>
        )}
      </div>

      <motion.div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <AnimatePresence>
          {isMenuOpen ? (
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} className="w-[92vw] max-w-[380px] bg-zinc-900/95 backdrop-blur-xl border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex justify-between items-center px-4 py-3 border-b border-zinc-700">
                <h2 className="font-bold text-sm tracking-wide">Criador de Site</h2>
                <button onClick={() => setIsMenuOpen(false)} className="hover:bg-zinc-700 p-1.5 rounded"><Minimize2 size={18} /></button>
              </div>
              <div className="p-5 overflow-y-auto custom-scrollbar space-y-5 max-h-[80vh]">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase flex gap-2 mb-1"><Briefcase size={12} /> Nome</label>
                    <input className="w-full bg-black/40 border border-zinc-700 rounded-lg p-3 text-sm" placeholder="Ex: Pizzaria do Zé" value={formData.businessName} onChange={e => setFormData({ ...formData, businessName: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase flex gap-2 mb-1"><FileText size={12} /> Ideia</label>
                    <textarea className="w-full h-20 bg-black/40 border border-zinc-700 rounded-lg p-3 text-sm resize-none" placeholder="Ex: restaurante familiar..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                  </div>
                  <input className="w-full bg-black/40 border border-zinc-700 rounded-lg p-2 text-xs" placeholder="URL embed do mapa (https://www.google.com/maps/embed?... )" value={formData.mapEmbed} onChange={e => setFormData({ ...formData, mapEmbed: e.target.value })} />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase flex gap-1"><MapPin size={12} /> Contato base</label>
                  <input className="w-full bg-black/40 border border-zinc-700 rounded-lg p-2 text-xs" placeholder="Endereço" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                  <div className="grid grid-cols-2 gap-2">
                    <input className="w-full bg-black/40 border border-zinc-700 rounded-lg p-2 text-xs" placeholder="Telefone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    <input className="w-full bg-black/40 border border-zinc-700 rounded-lg p-2 text-xs" placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <input className="w-full bg-black/40 border border-zinc-700 rounded-lg p-2 text-xs" placeholder="URL embed do mapa (https://www.google.com/maps/embed?... )" value={formData.mapEmbed} onChange={e => setFormData({ ...formData, mapEmbed: e.target.value })} />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase flex gap-1"><Phone size={12} /> Redes e Delivery</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input className="bg-black/40 border border-zinc-700 rounded-lg p-2 text-xs" placeholder="WhatsApp" value={formData.whatsapp} onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} />
                    <input className="bg-black/40 border border-zinc-700 rounded-lg p-2 text-xs" placeholder="Instagram" value={formData.instagram} onChange={e => setFormData({ ...formData, instagram: e.target.value })} />
                    <input className="bg-black/40 border border-zinc-700 rounded-lg p-2 text-xs" placeholder="Facebook URL" value={formData.facebook} onChange={e => setFormData({ ...formData, facebook: e.target.value })} />
                    <input className="bg-black/40 border border-zinc-700 rounded-lg p-2 text-xs" placeholder="TikTok URL" value={formData.tiktok} onChange={e => setFormData({ ...formData, tiktok: e.target.value })} />
                    <input className="bg-black/40 border border-zinc-700 rounded-lg p-2 text-xs" placeholder="iFood URL" value={formData.ifood} onChange={e => setFormData({ ...formData, ifood: e.target.value })} />
                    <input className="bg-black/40 border border-zinc-700 rounded-lg p-2 text-xs" placeholder="99 Food URL" value={formData.noveNove} onChange={e => setFormData({ ...formData, noveNove: e.target.value })} />
                    <input className="col-span-2 bg-black/40 border border-zinc-700 rounded-lg p-2 text-xs" placeholder="Keeta URL" value={formData.keeta} onChange={e => setFormData({ ...formData, keeta: e.target.value })} />
                  </div>
                  <label className="flex items-center gap-2 text-xs text-zinc-300"><input type="checkbox" checked={formData.showForm} onChange={e => setFormData({ ...formData, showForm: e.target.checked })} /> Habilitar formulário de contato</label>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase flex justify-between"><span>Logo</span> {formData.logoBase64 && <button onClick={() => setFormData(p => ({ ...p, logoBase64: '' }))} className="text-red-400 text-[10px]"><X size={10} /></button>}</label>
                  {!formData.logoBase64 ? (
                    <label className="cursor-pointer border border-dashed border-zinc-600 hover:border-indigo-500 rounded-lg p-3 flex justify-center gap-2 text-xs text-zinc-400"><Upload size={14} /> Carregar Logo <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" /></label>
                  ) : (
                    <div className="h-12 bg-white/5 border border-zinc-700 rounded-lg flex items-center justify-center"><img src={formData.logoBase64} className="h-full object-contain" alt="Preview" /></div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase"><Layout size={12} className="inline mr-1" /> Estilo</label>
                  <div className="grid grid-cols-1 gap-2">
                    {LAYOUT_STYLES.map(style => (
                      <button key={style.id} onClick={() => setFormData({ ...formData, layoutStyle: style.id })} className={`p-2 rounded-lg border text-left transition-all ${formData.layoutStyle === style.id ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}><span className="font-bold text-xs">{style.label}</span></button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase"><Palette size={12} className="inline mr-1" /> Cor</label>
                  <div className="flex gap-2 flex-wrap">
                    {COLORS.map(c => (
                      <button key={c.id} onClick={() => setFormData({ ...formData, colorId: c.id })} className={`w-6 h-6 rounded-full border-2 transition-all ${formData.colorId === c.id ? 'border-white scale-110' : 'border-transparent opacity-50'}`} style={{ backgroundColor: c.primary }} />
                    ))}
                  </div>
                </div>

                <button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2">
                  {isGenerating ? <Loader2 className="animate-spin" /> : <RefreshCw />} {generatedHtml ? 'Regerar Textos' : 'Criar Site'}
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
