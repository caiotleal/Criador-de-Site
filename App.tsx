import React, { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, functions, db } from './firebase';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket, Settings, Palette, Upload, Layout, Download,
  Loader2, Minimize2, RefreshCw, Briefcase, FileText, X, Phone, MapPin, Sparkles, Globe, CheckCircle, LayoutDashboard, Save, AlertCircle
} from 'lucide-react';
import { TEMPLATES } from './components/templates';
import LoginPage from './components/LoginPage';
import DomainChecker from './components/DomainChecker';
import ClientDashboard from './components/ClientDashboard';

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
  const [savedProjects, setSavedProjects] = useState<any[]>([]);
  
  // Interface e Dashboards
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'geral' | 'dominio'>('geral');
  
  // Estados de Controle de Publicação e Edição Visual
  const [currentProjectSlug, setCurrentProjectSlug] = useState<string | null>(null);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  
  // Domínios
  const [officialDomain, setOfficialDomain] = useState('');
  const [registerLater, setRegisterLater] = useState(false);

  const [formData, setFormData] = useState({
    businessName: '', description: '', whatsapp: '', instagram: '', facebook: '', tiktok: '',
    ifood: '', noveNove: '', keeta: '', phone: '', email: '', address: '', mapEmbed: '',
    showForm: true, layoutStyle: 'layout_split_duplo', colorId: 'teal_pro', logoBase64: ''
  });

  // Listener para capturar edições feitas diretamente no iframe (Editor Visual)
  useEffect(() => {
    const handleIframeMessage = (event: MessageEvent) => {
      if (event.data?.type === 'CONTENT_EDITED') {
        setGeneratedHtml(event.data.html);
        setHasUnsavedChanges(true);
      }
    };
    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setLoggedUserEmail(user?.email || null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!auth.currentUser) return setSavedProjects([]);
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
    replaceAll('{{ABOUT_TEXT}}', content.aboutText || 'Somos uma equipe focada em resultados.');
    replaceAll('{{CONTACT_CALL}}', content.contactCall || 'Fale connosco');
    replaceAll('{{COLOR_1}}', colors.c1); replaceAll('{{COLOR_2}}', colors.c2); replaceAll('{{COLOR_3}}', colors.c3);
    replaceAll('{{COLOR_4}}', colors.c4); replaceAll('{{COLOR_5}}', colors.c5); replaceAll('{{COLOR_6}}', colors.c6);
    replaceAll('{{COLOR_7}}', colors.c7); replaceAll('{{COLOR_LIGHT}}', colors.light); replaceAll('{{COLOR_DARK}}', colors.dark);
    replaceAll('{{ADDRESS}}', data.address || 'Morada não informada');
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

    const mapArea = data.mapEmbed ? `<iframe src="${data.mapEmbed}" width="100%" height="220" style="border:0;" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>` : '';
    replaceAll('[[MAP_AREA]]', mapArea);
    replaceAll('[[CONTACT_FORM]]', data.showForm ? `<form class="space-y-3"><input class="w-full border border-slate-300 rounded-lg p-2" placeholder="Seu nome" /><input class="w-full border border-slate-300 rounded-lg p-2" placeholder="Seu email" /><textarea class="w-full border border-slate-300 rounded-lg p-2" rows="4" placeholder="Sua mensagem"></textarea><button type="button" class="btn-primary w-full py-2 rounded-lg font-semibold">Enviar mensagem</button></form>` : '');

    // SCRIPT DO EDITOR VISUAL (Torna os elementos editáveis ao clicar)
    const editorScript = `
      <script>
        document.addEventListener('DOMContentLoaded', () => {
          const editableTags = document.querySelectorAll('h1, h2, h3, h4, p, span, a, button');
          editableTags.forEach(el => {
            el.setAttribute('contenteditable', 'true');
            el.style.outline = 'none';
            el.addEventListener('focus', () => el.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.5)');
            el.addEventListener('blur', () => {
              el.style.boxShadow = 'none';
              // Remove o script antes de enviar para não sujar o código salvo
              const cleanHtml = document.documentElement.outerHTML;
              window.parent.postMessage({ type: 'CONTENT_EDITED', html: cleanHtml }, '*');
            });
          });
        });
      </script>
    `;
    
    return html.replace('</body>', `${editorScript}</body>`);
  };

  const handleGenerate = async () => {
    if (!formData.businessName || !formData.description) return alert('Preencha o Nome e a Ideia!');
    setIsGenerating(true);

    try {
      if (aiContent && generatedHtml) {
        setGeneratedHtml(renderTemplate(aiContent, formData));
        setHasUnsavedChanges(true); // Se regerar, precisa salvar
        setIsGenerating(false);
        return;
      }

      const generateFn = httpsCallable(functions, 'generateSite');
      const result: any = await generateFn({ businessName: formData.businessName, description: formData.description });
      setAiContent(result.data);
      setGeneratedHtml(renderTemplate(result.data, formData));
      setHasUnsavedChanges(true);
    } catch (error: any) {
      alert('Erro: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(p => ({ ...p, logoBase64: reader.result as string }));
      setHasUnsavedChanges(true);
    };
    reader.readAsDataURL(file);
  };

  const handleLoginSubmit = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      await createUserWithEmailAndPassword(auth, email, password);
    }
    setIsLoginOpen(false);
  };

  // FLUXO 1: CRIAR NOVO PROJETO (Primeira vez)
  const handleCreateProject = async () => {
    if (!auth.currentUser) return setIsLoginOpen(true);
    if (!generatedHtml) return;
    if (!registerLater && !officialDomain) return alert("Informe o domínio ou selecione configurar depois.");

    setIsSavingProject(true);
    try {
      const cleanName = (formData.businessName || 'site').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '-');
      const suffix = Math.random().toString(36).substring(2, 6);
      const internalDomain = `${cleanName}-${suffix}`;

      const saveFn = httpsCallable(functions, 'saveSiteProject');
      const res: any = await saveFn({
        businessName: formData.businessName,
        officialDomain: registerLater ? "Pendente" : officialDomain,
        internalDomain: internalDomain,
        generatedHtml,
        formData,
        aiContent,
      });

      if (res.data?.projectSlug) setCurrentProjectSlug(res.data.projectSlug);
      setHasUnsavedChanges(false);
      setLastSavedAt(new Date());
      alert("Projeto criado e guardado com sucesso!");
    } catch (err: any) {
      alert('Erro ao criar projeto.');
    } finally {
      setIsSavingProject(false);
    }
  };

  // FLUXO 2: SALVAR ALTERAÇÕES (Rascunho)
  const handleSaveChanges = async () => {
    if (!currentProjectSlug) return;
    setIsSavingDraft(true);
    try {
      const updateFn = httpsCallable(functions, 'updateSiteProject');
      await updateFn({ 
        projectId: currentProjectSlug, 
        html: generatedHtml,
        formData: formData
      });
      setHasUnsavedChanges(false);
      setLastSavedAt(new Date());
    } catch (error) {
      alert("Erro ao guardar as alterações.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  // FLUXO 3: PUBLICAR SITE (Apenas se não houver edições pendentes)
  const handlePublishSite = async () => {
    if (hasUnsavedChanges) return alert("Por favor, guarde as suas alterações antes de publicar.");
    setIsPublishing(true);
    try {
      const publishFn = httpsCallable(functions, 'publishUserProject');
      const res: any = await publishFn({ projectSlug: currentProjectSlug });
      if (res.data?.publishUrl) setPublishedDomain(res.data.publishUrl.replace(/^https?:\/\//, ''));
      alert("Site publicado com sucesso!");
    } catch (err: any) {
      alert('Erro ao publicar.');
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
    setOfficialDomain(project.officialDomain || '');
    setRegisterLater(project.officialDomain === 'Pendente');
    setHasUnsavedChanges(false);
  };

  return (
    <div className="relative w-full h-screen bg-zinc-950 overflow-hidden font-sans text-white">
      {/* FRAME DO SITE GERADO */}
      <div className="absolute inset-0 z-0 bg-[#09090b]">
        {generatedHtml ? (
          <iframe srcDoc={generatedHtml} className="w-full h-full border-none bg-white" title="Preview Visual" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full opacity-20 animate-pulse select-none">
            <Rocket className="w-24 h-24 mb-4" />
            <h2 className="text-2xl font-bold">Inicie o seu projeto</h2>
          </div>
        )}
      </div>

      {/* HEADER: INFO DO USUÁRIO E DASHBOARD */}
      {loggedUserEmail && (
        <div className="fixed top-4 right-4 md:right-6 z-[90] flex items-center gap-3">
          <button 
            onClick={() => setIsDashboardOpen(true)}
            className="bg-zinc-900/90 backdrop-blur-md border border-zinc-700 hover:border-indigo-500 text-white text-xs md:text-sm px-5 py-2.5 rounded-full shadow-xl font-bold flex items-center gap-2 transition-all"
          >
            <LayoutDashboard size={16} className="text-indigo-400" />
            Meu Painel
          </button>
        </div>
      )}

      {/* BARRA DE AÇÕES FLUTUANTE (EDITION MODE) */}
      {currentProjectSlug && (
        <motion.div 
          initial={{ y: -50, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[85] bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 p-2 rounded-2xl shadow-2xl flex items-center gap-3"
        >
          <div className="px-4 hidden md:flex items-center">
            {hasUnsavedChanges ? (
              <span className="text-yellow-500 text-xs font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" /> Alterações pendentes
              </span>
            ) : lastSavedAt ? (
              <span className="text-zinc-400 text-xs flex items-center gap-2">
                <CheckCircle size={12} className="text-emerald-500" /> 
                Guardado às {lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            ) : null}
          </div>

          <button 
            onClick={handleSaveChanges}
            disabled={isSavingDraft || !hasUnsavedChanges}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              hasUnsavedChanges ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            {isSavingDraft ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
            Guardar
          </button>

          <div className="w-px h-6 bg-zinc-700 mx-1"></div>

          <button 
            onClick={handlePublishSite}
            disabled={isPublishing || hasUnsavedChanges}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              !hasUnsavedChanges ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe size={16} />}
            Publicar
          </button>
        </motion.div>
      )}

      <LoginPage isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSubmit={handleLoginSubmit} />

      {/* SIDEBAR INTELIGENTE (Criação vs Edição) */}
      <motion.div className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <AnimatePresence>
          {isMenuOpen ? (
            <motion.div initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} className="w-[92vw] max-w-[340px] bg-zinc-900/95 backdrop-blur-xl border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex justify-between items-center px-4 py-3 border-b border-zinc-700">
                <h2 className="font-bold text-sm tracking-wide">{currentProjectSlug ? 'Configurações do Site' : 'Novo Projeto'}</h2>
                <button onClick={() => setIsMenuOpen(false)} className="hover:bg-zinc-700 p-1.5 rounded transition-colors"><Minimize2 size={18} /></button>
              </div>

              {/* MODO DE EDIÇÃO: Painel de Configurações Gerais */}
              {currentProjectSlug ? (
                <div className="p-0">
                  <div className="flex border-b border-zinc-800 text-xs font-semibold">
                    <button onClick={() => setActiveTab('geral')} className={`flex-1 py-3 text-center transition-colors ${activeTab === 'geral' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}>Estilo Visual</button>
                    <button onClick={() => setActiveTab('dominio')} className={`flex-1 py-3 text-center transition-colors ${activeTab === 'dominio' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}>Domínio</button>
                  </div>

                  <div className="p-5 overflow-y-auto custom-scrollbar max-h-[70vh] space-y-6">
                    {activeTab === 'geral' && (
                      <>
                        <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl text-xs text-indigo-200 mb-4 flex items-start gap-2">
                          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                          <p>Dica: Clique diretamente em qualquer texto do site à direita para editar o conteúdo.</p>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-500 uppercase"><Layout size={12} className="inline mr-1" /> Layout</label>
                          <div className="grid grid-cols-1 gap-2">
                            {LAYOUT_STYLES.map(style => (
                              <button key={style.id} onClick={() => { setFormData({ ...formData, layoutStyle: style.id }); setHasUnsavedChanges(true); }} className={`p-2 rounded-lg border text-left transition-all ${formData.layoutStyle === style.id ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}><span className="font-bold text-xs">{style.label}</span></button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-500 uppercase"><Palette size={12} className="inline mr-1" /> Paleta de Cores</label>
                          <div className="flex gap-2 flex-wrap">
                            {COLORS.map(c => (
                              <button key={c.id} onClick={() => { setFormData({ ...formData, colorId: c.id }); setHasUnsavedChanges(true); }} className={`w-6 h-6 rounded-full border-2 transition-all ${formData.colorId === c.id ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`} style={{ backgroundColor: c.c4 }} />
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-500 uppercase flex justify-between"><span>Logotipo</span> {formData.logoBase64 && <button onClick={() => { setFormData(p => ({ ...p, logoBase64: '' })); setHasUnsavedChanges(true); }} className="text-red-400 text-[10px]"><X size={10} /></button>}</label>
                          {!formData.logoBase64 ? (
                            <label className="cursor-pointer border border-dashed border-zinc-600 hover:border-indigo-500 rounded-lg p-3 flex justify-center gap-2 text-xs text-zinc-400"><Upload size={14} /> Carregar <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" /></label>
                          ) : (
                            <div className="h-12 bg-white/5 border border-zinc-700 rounded-lg flex items-center justify-center"><img src={formData.logoBase64} className="h-full object-contain" alt="Preview" /></div>
                          )}
                        </div>
                      </>
                    )}

                    {activeTab === 'dominio' && (
                      <div className="space-y-4">
                        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
                          <h4 className="text-sm font-bold text-white flex items-center gap-2"><Globe size={16} className="text-emerald-400"/> Apontamentos DNS</h4>
                          <p className="text-xs text-zinc-400">Aceda ao painel do seu domínio (ex: Registro.br) e adicione as seguintes configurações:</p>
                          <div className="bg-black/50 p-3 rounded-lg border border-zinc-700/50 space-y-3 text-xs">
                            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                              <span className="text-zinc-500 font-bold">Tipo A</span>
                              <span className="text-emerald-400 font-mono select-all">199.36.158.100</span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-zinc-500 font-bold">Tipo TXT</span>
                              <span className="text-emerald-400 font-mono text-[10px] break-all select-all">firebase-site-verification={currentProjectSlug}-app</span>
                            </div>
                          </div>
                          <button className="w-full mt-2 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg text-xs font-bold transition-all border border-zinc-700">
                            Verificar Conexão do Domínio
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* MODO DE CRIAÇÃO: Formulário Inicial */
                <div className="p-5 overflow-y-auto custom-scrollbar max-h-[75vh] space-y-5">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase flex gap-2 mb-1"><Briefcase size={12} /> Nome do Negócio</label>
                      <input className="w-full bg-black/40 border border-zinc-700 rounded-lg p-3 text-sm focus:border-emerald-500" placeholder="Ex: Pizzaria Roma" value={formData.businessName} onChange={e => setFormData({ ...formData, businessName: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase flex gap-2 mb-1"><FileText size={12} /> Sobre o negócio</label>
                      <textarea className="w-full h-20 bg-black/40 border border-zinc-700 rounded-lg p-3 text-sm resize-none focus:border-emerald-500" placeholder="Descreva os seus serviços..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-zinc-700 pt-4">
                    <label className="text-xs font-bold text-zinc-500 uppercase flex gap-1"><Globe size={12} /> Endereço do Site</label>
                    <DomainChecker onDomainChange={(domain, isLater) => { setOfficialDomain(domain); setRegisterLater(isLater); }} />
                  </div>

                  <button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-zinc-600 transition-colors">
                    {isGenerating ? <Loader2 className="animate-spin" /> : <RefreshCw />} Gerar Pré-visualização
                  </button>
                  
                  {generatedHtml && (
                    <button onClick={handleCreateProject} disabled={isSavingProject} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white py-3 rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2">
                      <Briefcase size={16} /> {isSavingProject ? 'A processar...' : 'Criar e Guardar Projeto'}
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => setIsMenuOpen(true)} className="w-14 h-14 bg-indigo-600 hover:bg-indigo-500 rounded-full shadow-2xl flex items-center justify-center cursor-pointer ring-4 ring-black/20 transition-transform hover:scale-105"><Settings className="text-white" size={26} /></motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* DASHBOARD DE CLIENTE */}
      <AnimatePresence>
        {isDashboardOpen && (
          <ClientDashboard 
            projects={savedProjects}
            userEmail={loggedUserEmail || ''}
            onClose={() => setIsDashboardOpen(false)}
            onEditProject={(project) => {
              handleLoadProject(project);
              setIsDashboardOpen(false);
              setIsMenuOpen(true);
            }}
            onUpgrade={(projectId) => {
              alert(`A redirecionar para o pagamento do projeto: ${projectId}`);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
