import React, { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, functions, db } from './firebase'; // Certifique-se de que db está exportado no seu firebase.ts se for usar addDoc direto, ou ajuste conforme seu backend
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket, Settings, Palette, Upload, Layout, Download,
  Loader2, Minimize2, RefreshCw, Briefcase, FileText, X, Phone, MapPin, Sparkles, Globe, CheckCircle, LayoutDashboard
} from 'lucide-react';
import { TEMPLATES } from './components/templates';
import LoginPage from './components/LoginPage';
import DomainChecker from './components/DomainChecker';
import ClientDashboard from './components/ClientDashboard'; // O nosso novo painel!

const LAYOUT_STYLES = [
  { id: 'layout_split_duplo', label: 'Split Duplo', desc: 'Hero em duas colunas com bloco de diferencial.' },
  { id: 'layout_coluna_simples', label: 'Coluna Simples', desc: 'Fluxo vertical limpo e direto.' },
  { id: 'layout_menu_hamburguer', label: 'Menu Hambúrguer', desc: 'Menu compacto e moderno.' },
  { id: 'layout_cards_moderno', label: 'Cards Moderno', desc: 'Seções com destaque em cards.' },
  { id: 'layout_sidebar_profissional', label: 'Sidebar Profissional', desc: 'Navegação lateral para visual premium.' },
];

const COLORS = [
  { id: 'teal_pro', name: 'Teal Pro', c1: '#003333', c2: '#004444', c3: '#006666', c4: '#009c93', c5: '#a3f3ff', c6: '#c5f7ff', c7: '#eafffd', light: '#ffffff', dark: '#003333' },
  { id: 'violet_studio', name: 'Violet Studio', c1: '#24103a', c2: '#3b1f63', c3: '#5b2b95', c4: '#7b3aed', c5: '#d8c5ff', c6: '#ebe1ff', c7: '#f6f1ff', light: '#ffffff', dark: '#24103a' },
  { id: 'sunset_orange', name: 'Sunset Orange', c1: '#4a2108', c2: '#7a330a', c3: '#b34d0f', c4: '#ea580c', c5: '#ffd9bf', c6: '#ffe9da', c7: '#fff5ee', light: '#ffffff', dark: '#4a2108' },
  { id: 'ocean_navy', name: 'Ocean Navy', c1: '#0a1f33', c2: '#12395c', c3: '#1f5f94', c4: '#2b7fc5', c5: '#c3e6ff', c6: '#deefff', c7: '#f2f8ff', light: '#ffffff', dark: '#0a1f33' },
  { id: 'forest_luxe', name: 'Forest Luxe', c1: '#0f2d1c', c2: '#18472b', c3: '#226c3e', c4: '#2f9c58', c5: '#c6f5d6', c6: '#ddf9e7', c7: '#f1fff6', light: '#ffffff', dark: '#0f2d1c' }
];

const App: React.FC = () => {
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [aiContent, setAiContent] = useState<any>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loggedUserEmail, setLoggedUserEmail] = useState<string | null>(auth.currentUser?.email || null);
  const [publishedDomain, setPublishedDomain] = useState<string | null>(null);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [savedProjects, setSavedProjects] = useState<any[]>([]);
  
  // Controle de Interface
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  
  // Estados de Controle do Fluxo de Domínio
  const [currentProjectSlug, setCurrentProjectSlug] = useState<string | null>(null);
  const [officialDomain, setOfficialDomain] = useState('');
  const [registerLater, setRegisterLater] = useState(false);

  const [formData, setFormData] = useState({
    businessName: '', description: '', whatsapp: '', instagram: '', facebook: '', tiktok: '',
    ifood: '', noveNove: '', keeta: '', phone: '', email: '', address: '', mapEmbed: '',
    showForm: true, layoutStyle: 'layout_split_duplo', colorId: 'teal_pro', logoBase64: ''
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setLoggedUserEmail(user?.email || null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!auth.currentUser) {
        setSavedProjects([]);
        return;
      }
      try {
        const listFn = httpsCallable(functions, 'listUserProjects');
        const listRes: any = await listFn({});
        setSavedProjects(listRes.data?.projects || []);
      } catch {
        setSavedProjects([]);
      }
    };
    fetchProjects();
  }, [loggedUserEmail]);

  const renderTemplate = (content: any, data: typeof formData) => {
    let html = TEMPLATES[data.layoutStyle] || TEMPLATES['layout_split_duplo'];
    const colors = COLORS.find(c => c.id === data.colorId) || COLORS[0];

    const replaceAll = (token: string, value: string) => { html = html.split(token).join(value); };

    replaceAll('{{BUSINESS_NAME}}', data.businessName || 'Sua Empresa');
    replaceAll('{{HERO_TITLE}}', content.heroTitle || `Bem-vindo à ${data.businessName}`);
    replaceAll('{{HERO_SUBTITLE}}', content.heroSubtitle || 'Seu negócio com presença digital profissional.');
    replaceAll('{{ABOUT_TITLE}}', content.aboutTitle || 'Quem Somos');
    replaceAll('{{ABOUT_TEXT}}', content.aboutText || 'Somos uma equipe focada em resultado e atendimento próximo.');
    replaceAll('{{CONTACT_CALL}}', content.contactCall || 'Fale com a gente');
    replaceAll('{{COLOR_1}}', colors.c1); replaceAll('{{COLOR_2}}', colors.c2); replaceAll('{{COLOR_3}}', colors.c3);
    replaceAll('{{COLOR_4}}', colors.c4); replaceAll('{{COLOR_5}}', colors.c5); replaceAll('{{COLOR_6}}', colors.c6);
    replaceAll('{{COLOR_7}}', colors.c7); replaceAll('{{COLOR_LIGHT}}', colors.light); replaceAll('{{COLOR_DARK}}', colors.dark);
    replaceAll('{{ADDRESS}}', data.address || 'Endereço não informado');
    replaceAll('{{PHONE}}', data.phone || data.whatsapp || 'Telefone não informado');
    replaceAll('{{EMAIL}}', data.email || 'Email não informado');

    if (data.logoBase64) {
      html = html.replace(/\[\[LOGO_AREA\]\]/g, `<img src="${data.logoBase64}" class="h-10 w-auto object-contain" alt="Logo" />`);
    } else {
      html = html.replace(/\[\[LOGO_AREA\]\]/g, `<span class="font-bold tracking-tight">${data.businessName || 'Sua Empresa'}</span>`);
    }

    const actionBtn = (label: string, icon: string, href: string, classes: string) => `<a href="${href}" target="_blank" class="icon-btn ${classes}" title="${label}" aria-label="${label}"><i class="${icon}"></i></a>`;

    replaceAll('[[WHATSAPP_BTN]]', data.whatsapp ? actionBtn('WhatsApp', 'fab fa-whatsapp', `https://wa.me/${data.whatsapp.replace(/\D/g, '')}`, 'bg-green-500') : '');
    replaceAll('[[INSTAGRAM_BTN]]', data.instagram ? actionBtn('Instagram', 'fab fa-instagram', `https://instagram.com/${data.instagram.replace('@', '')}`, 'bg-pink-600') : '');
    replaceAll('[[FACEBOOK_BTN]]', data.facebook ? actionBtn('Facebook', 'fab fa-facebook-f', data.facebook.startsWith('http') ? data.facebook : `https://${data.facebook}`, 'bg-blue-700') : '');
    replaceAll('[[TIKTOK_BTN]]', data.tiktok ? actionBtn('TikTok', 'fab fa-tiktok', data.tiktok.startsWith('http') ? data.tiktok : `https://${data.tiktok}`, 'bg-slate-800') : '');
    replaceAll('[[IFOOD_BTN]]', data.ifood ? actionBtn('iFood', 'fas fa-bag-shopping', data.ifood.startsWith('http') ? data.ifood : `https://${data.ifood}`, 'bg-red-600') : '');
    replaceAll('[[NOVE_NOVE_BTN]]', data.noveNove ? actionBtn('99 Food', 'fas fa-motorcycle', data.noveNove.startsWith('http') ? data.noveNove : `https://${data.noveNove}`, 'bg-yellow-500') : '');
    replaceAll('[[KEETA_BTN]]', data.keeta ? actionBtn('Keeta', 'fas fa-store', data.keeta.startsWith('http') ? data.keeta : `https://${data.keeta}`, 'bg-orange-600') : '');

    const mapArea = data.mapEmbed ? `<iframe src="${data.mapEmbed}" width="100%" height="220" style="border:0;" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>` : '<p class="text-sm text-slate-500">Mapa não informado.</p>';
    replaceAll('[[MAP_AREA]]', mapArea);

    const contactForm = data.showForm ? `<form class="space-y-3"><input class="w-full border border-slate-300 rounded-lg p-2" placeholder="Seu nome" /><input class="w-full border border-slate-300 rounded-lg p-2" placeholder="Seu email" /><textarea class="w-full border border-slate-300 rounded-lg p-2" rows="4" placeholder="Sua mensagem"></textarea><button type="button" class="btn-primary w-full py-2 rounded-lg font-semibold">Enviar mensagem</button></form>` : '<p class="text-sm text-slate-500">Formulário desativado para este site.</p>';
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

  const handleLoginSubmit = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      await createUserWithEmailAndPassword(auth, email, password);
    }
    setIsLoginOpen(false);
  };

  // FLUXO 1: SALVAR PROJETO (Totalmente livre de erros de banco)
  const handleSaveProject = async () => {
    if (!auth.currentUser) {
      setIsLoginOpen(true);
      return;
    }
    if (!generatedHtml) return;
    
    // Validação limpa: o usuário decide o caminho dele
    if (!registerLater && !officialDomain) {
      alert("Por favor, informe o domínio que você comprou na barra lateral ou marque a opção 'Vou configurar depois'.");
      return;
    }

    setIsSavingProject(true);
    try {
      // Criação de URL blindada contra duplicações (sem depender do Firebase procurar antes)
      const baseName = formData.businessName || 'meu-site';
      const cleanName = baseName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '-');
      const suffix = Math.random().toString(36).substring(2, 6); // Sufixo de segurança
      const internalDomain = `${cleanName}-${suffix}`; // Backend cuida de adicionar .web.app

      const saveFn = httpsCallable(functions, 'saveSiteProject');
      const res: any = await saveFn({
        businessName: formData.businessName,
        officialDomain: registerLater ? "Pendente" : officialDomain,
        internalDomain: internalDomain,
        registerLater: registerLater,
        generatedHtml,
        formData,
        aiContent,
      });

      const data = res.data || {};
      if (data?.projectSlug) setCurrentProjectSlug(data.projectSlug);
      if (data?.hosting?.defaultUrl) {
        setPublishedDomain(data.hosting.defaultUrl.replace('https://', ''));
      }

      const listFn = httpsCallable(functions, 'listUserProjects');
      const listRes: any = await listFn({});
      setSavedProjects(listRes.data?.projects || []);
      
    } catch (err: any) {
      alert('Erro ao salvar projeto: ' + (err?.message || 'erro desconhecido'));
    } finally {
      setIsSavingProject(false);
    }
  };

  // FLUXO 2: PUBLICAR SITE (Requer Salvamento Prévio)
  const handlePublishSite = async () => {
    if (!auth.currentUser) {
      setIsLoginOpen(true);
      return;
    }
    
    if (!currentProjectSlug) {
      alert("Você precisa salvar o projeto primeiro antes de publicar.");
      return;
    }

    try {
      setIsPublishing(true);
      const publishFn = httpsCallable(functions, 'publishUserProject');
      const publishRes: any = await publishFn({ projectSlug: currentProjectSlug });
      const url = publishRes.data?.publishUrl as string;
      if (url) {
        setPublishedDomain(url.replace(/^https?:\/\//, ''));
        window.open(url, '_blank');
      }

      const listFn = httpsCallable(functions, 'listUserProjects');
      const listRes: any = await listFn({});
      setSavedProjects(listRes.data?.projects || []);
    } catch (err: any) {
      alert('Erro ao publicar: ' + (err?.message || 'erro desconhecido'));
    } finally {
      setIsPublishing(false);
    }
  };

  const handleLoadProject = (project: any) => {
    if (!project) return;
    setFormData((prev) => ({ ...prev, ...(project.formData || {}) }));
    setAiContent(project.aiContent || null);
    setGeneratedHtml(project.generatedHtml || null);
    setCurrentProjectSlug(project.projectSlug || project.id || null);
    if (project.publishUrl) setPublishedDomain(String(project.publishUrl).replace(/^https?:\/\//, ''));
    
    // Puxa os dados de domínio atualizados para a tela
    setOfficialDomain(project.officialDomain || '');
    setRegisterLater(project.officialDomain === 'Pendente');
  };

  const handleLogout = async () => {
    await signOut(auth);
    setSavedProjects([]);
    setCurrentProjectSlug(null);
    setOfficialDomain('');
    setRegisterLater(false);
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

      {/* HEADER: INFO DO USUÁRIO E BOTÃO DO PAINEL DE CONTROLE */}
      {loggedUserEmail && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[90] flex items-center gap-3">
          <div className="bg-zinc-900/90 backdrop-blur-md text-white text-xs md:text-sm px-4 py-2.5 rounded-full shadow-xl border border-zinc-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="hidden md:inline text-zinc-400">Logado como:</span> 
            <strong className="text-emerald-400">{loggedUserEmail}</strong>
          </div>
          
          <button 
            onClick={() => setIsDashboardOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs md:text-sm px-5 py-2.5 rounded-full shadow-xl font-bold flex items-center gap-2 transition-all hover:scale-105"
          >
            <LayoutDashboard size={16} />
            Meu Painel
          </button>
        </div>
      )}

      {/* BOTÃO FLUTUANTE CENTRAL: Respeitando a ordem Salvar -> Publicar */}
      {generatedHtml && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 z-[85]" drag dragConstraints={{ top: -240, left: -420, right: 420, bottom: 260 }} dragElastic={0.08} dragMomentum={false}
        >
          {!loggedUserEmail ? (
            <button
              onClick={() => setIsLoginOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-4 rounded-2xl shadow-2xl text-sm md:text-base font-bold flex items-center gap-2 border-2 border-white/40"
            >
              <Sparkles size={16} /> Faça login para Salvar e Publicar
            </button>
          ) : (
            <div className="space-y-2">
              {!currentProjectSlug ? (
                // ETAPA 1: SALVAR
                <button
                  onClick={handleSaveProject}
                  disabled={isSavingProject}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-4 rounded-2xl shadow-2xl text-sm md:text-base font-bold flex items-center gap-2 border-2 border-white/40"
                >
                  <Briefcase size={16} /> {isSavingProject ? 'Salvando...' : '1. Salvar Projeto para Publicar'}
                </button>
              ) : (
                // ETAPA 2: PUBLICAR
                <button
                  onClick={handlePublishSite}
                  disabled={isPublishing}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-4 rounded-2xl shadow-2xl text-sm md:text-base font-bold flex items-center gap-2 border-2 border-white/40"
                >
                  <Globe size={16} /> {isPublishing ? 'Publicando...' : '2. Publicar Site na Web'}
                </button>
              )}
              
              {publishedDomain && (
                <div className="bg-zinc-900/95 border border-zinc-700 text-zinc-100 px-3 py-2 rounded-xl text-xs text-center shadow-xl backdrop-blur-md">
                  Disponível em: <br/><a href={`https://${publishedDomain}`} target="_blank" rel="noreferrer" className="text-emerald-400 font-bold hover:underline">https://{publishedDomain}</a>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      <LoginPage isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSubmit={handleLoginSubmit} />

      {/* SIDEBAR DO CRIADOR */}
      <motion.div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <AnimatePresence>
          {isMenuOpen ? (
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} className="w-[92vw] max-w-[380px] bg-zinc-900/95 backdrop-blur-xl border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex justify-between items-center px-4 py-3 border-b border-zinc-700">
                <h2 className="font-bold text-sm tracking-wide">Criador de Site</h2>
                <button onClick={() => setIsMenuOpen(false)} className="hover:bg-zinc-700 p-1.5 rounded transition-colors"><Minimize2 size={18} /></button>
              </div>
              <div className="p-5 overflow-y-auto custom-scrollbar space-y-5 max-h-[80vh]">
                
                {/* 1. SEÇÃO NOME E IDEIA */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase flex gap-2 mb-1"><Briefcase size={12} /> Nome</label>
                    <input className="w-full bg-black/40 border border-zinc-700 rounded-lg p-3 text-sm focus:border-emerald-500 transition-colors" placeholder="Ex: Pizzaria do Zé" value={formData.businessName} onChange={e => setFormData({ ...formData, businessName: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase flex gap-2 mb-1"><FileText size={12} /> Ideia</label>
                    <textarea className="w-full h-20 bg-black/40 border border-zinc-700 rounded-lg p-3 text-sm resize-none focus:border-emerald-500 transition-colors" placeholder="Ex: restaurante familiar..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                  </div>
                </div>

                {/* 2. SEÇÃO CONTATO E MAPA */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase flex gap-1"><MapPin size={12} /> Contato base</label>
                  <input className="w-full bg-black/40 border border-zinc-700 rounded-lg p-2 text-xs" placeholder="Endereço" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                  <div className="grid grid-cols-2 gap-2">
                    <input className="w-full bg-black/40 border border-zinc-700 rounded-lg p-2 text-xs" placeholder="Telefone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    <input className="w-full bg-black/40 border border-zinc-700 rounded-lg p-2 text-xs" placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <input className="w-full bg-black/40 border border-zinc-700 rounded-lg p-2 text-xs" placeholder="URL embed do mapa" value={formData.mapEmbed} onChange={e => setFormData({ ...formData, mapEmbed: e.target.value })} />
                </div>

                {/* 3. SEÇÃO REDES SOCIAIS E DELIVERY */}
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
                  <label className="flex items-center gap-2 text-xs text-zinc-300"><input type="checkbox" checked={formData.showForm} onChange={e => setFormData({ ...formData, showForm: e.target.checked })} className="accent-emerald-500" /> Habilitar formulário</label>
                </div>

                {/* 4. SEÇÃO LOGO */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase flex justify-between"><span>Logo</span> {formData.logoBase64 && <button onClick={() => setFormData(p => ({ ...p, logoBase64: '' }))} className="text-red-400 text-[10px] hover:text-red-300 transition-colors"><X size={10} /></button>}</label>
                  {!formData.logoBase64 ? (
                    <label className="cursor-pointer border border-dashed border-zinc-600 hover:border-indigo-500 rounded-lg p-3 flex justify-center gap-2 text-xs text-zinc-400 transition-colors"><Upload size={14} /> Carregar Logo <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" /></label>
                  ) : (
                    <div className="h-12 bg-white/5 border border-zinc-700 rounded-lg flex items-center justify-center"><img src={formData.logoBase64} className="h-full object-contain" alt="Preview" /></div>
                  )}
                </div>

                {/* 5. SEÇÃO ESTILO VISUAL */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase"><Layout size={12} className="inline mr-1" /> Estilo</label>
                  <div className="grid grid-cols-1 gap-2">
                    {LAYOUT_STYLES.map(style => (
                      <button key={style.id} onClick={() => setFormData({ ...formData, layoutStyle: style.id })} className={`p-2 rounded-lg border text-left transition-all ${formData.layoutStyle === style.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}><span className="font-bold text-xs">{style.label}</span></button>
                    ))}
                  </div>
                </div>

                {/* 6. SEÇÃO COR */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase"><Palette size={12} className="inline mr-1" /> Cor</label>
                  <div className="flex gap-2 flex-wrap">
                    {COLORS.map(c => (
                      <button key={c.id} onClick={() => setFormData({ ...formData, colorId: c.id })} className={`w-6 h-6 rounded-full border-2 transition-all ${formData.colorId === c.id ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`} style={{ backgroundColor: c.c4 }} />
                    ))}
                  </div>
                </div>

                {/* 7. NOVA SEÇÃO: DOMÍNIO INTEGRADOR */}
                {!currentProjectSlug && (
                  <div className="space-y-2 border-t border-zinc-700 pt-4">
                    <label className="text-xs font-bold text-zinc-500 uppercase flex gap-1"><Globe size={12} /> Endereço do Site</label>
                    <DomainChecker 
                      onDomainChange={(domain, isLater) => {
                        setOfficialDomain(domain);
                        setRegisterLater(isLater);
                      }} 
                    />
                  </div>
                )}

                {/* 8. BOTÕES DE AÇÃO DA SIDEBAR */}
                <button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 border border-zinc-600 transition-colors">
                  {isGenerating ? <Loader2 className="animate-spin" /> : <RefreshCw />} {generatedHtml ? 'Regerar Textos' : 'Gerar Site'}
                </button>
                
                {generatedHtml && <button onClick={handleDownloadZip} className="w-full border border-zinc-700 hover:bg-zinc-800 text-zinc-300 py-2 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"><Download size={16} /> Baixar HTML</button>}
                
                {generatedHtml && !currentProjectSlug && (
                  <button 
                    onClick={handleSaveProject} 
                    disabled={isSavingProject} 
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-bold shadow-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Briefcase size={16} /> {isSavingProject ? 'Salvando...' : '1. Salvar Projeto'}
                  </button>
                )}

                {currentProjectSlug && (
                  <button 
                    onClick={handlePublishSite} 
                    disabled={isPublishing} 
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Globe size={16} /> {isPublishing ? 'Publicando...' : '2. Publicar Site'}
                  </button>
                )}
                
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => setIsMenuOpen(true)} className="w-14 h-14 bg-indigo-600 hover:bg-indigo-500 rounded-full shadow-2xl flex items-center justify-center cursor-pointer ring-4 ring-black/20 transition-transform hover:scale-105"><Settings className="text-white" size={26} /></motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* RENDERIZAÇÃO DO PAINEL DE CONTROLE (O NOVO DASHBOARD) */}
      <AnimatePresence>
        {isDashboardOpen && (
          <ClientDashboard 
            projects={savedProjects}
            userEmail={loggedUserEmail || ''}
            onClose={() => setIsDashboardOpen(false)}
            onEditProject={(project) => {
              handleLoadProject(project); // Carrega os dados na barra lateral perfeitamente
              setIsDashboardOpen(false); // Fecha o painel para ele editar
              setIsMenuOpen(true); // Garante que a barra lateral esteja aberta focando na edição
            }}
            onUpgrade={(projectId) => {
              // Aqui chamaremos a integração com Stripe / MercadoPago / Asaas
              alert(`Iniciando upgrade para o projeto ID: ${projectId}. O checkout será integrado aqui!`);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
