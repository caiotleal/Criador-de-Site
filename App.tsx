import React, { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, functions } from './firebase';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket, Settings, Palette, Upload, Layout, Download,
  Loader2, Minimize2, RefreshCw, Briefcase, FileText, X, Phone, Globe, CheckCircle, Save, Trash2, AlertCircle
} from 'lucide-react';
import { TEMPLATES } from './components/templates';
import LoginPage from './components/LoginPage';
import DomainChecker from './components/DomainChecker';

const LAYOUT_STYLES = [
  { id: 'layout_split_duplo', label: 'Split Duplo', desc: 'Hero em duas colunas' },
  { id: 'layout_coluna_simples', label: 'Coluna Simples', desc: 'Fluxo vertical limpo' },
  { id: 'layout_menu_hamburguer', label: 'Menu Hambúrguer', desc: 'Menu compacto e moderno' },
  { id: 'layout_cards_moderno', label: 'Cards Moderno', desc: 'Seções em cards' },
];

const COLORS = [
  { id: 'teal_pro', name: 'Teal Pro', c1: '#003333', c2: '#004444', c3: '#006666', c4: '#009c93', c5: '#a3f3ff', c6: '#c5f7ff', c7: '#eafffd', light: '#ffffff', dark: '#003333' },
  { id: 'violet_studio', name: 'Violet Studio', c1: '#24103a', c2: '#3b1f63', c3: '#5b2b95', c4: '#7b3aed', c5: '#d8c5ff', c6: '#ebe1ff', c7: '#f6f1ff', light: '#ffffff', dark: '#24103a' },
  { id: 'ocean_navy', name: 'Ocean Navy', c1: '#0a1f33', c2: '#12395c', c3: '#1f5f94', c4: '#2b7fc5', c5: '#c3e6ff', c6: '#deefff', c7: '#f2f8ff', light: '#ffffff', dark: '#0a1f33' },
  { id: 'sunset_orange', name: 'Sunset Orange', c1: '#4a2108', c2: '#7a330a', c3: '#b34d0f', c4: '#ea580c', c5: '#ffd9bf', c6: '#ffe9da', c7: '#fff5ee', light: '#ffffff', dark: '#4a2108' },
];

const App: React.FC = () => {
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [aiContent, setAiContent] = useState<any>(null);
  
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loggedUserEmail, setLoggedUserEmail] = useState<string | null>(auth.currentUser?.email || null);
  const [savedProjects, setSavedProjects] = useState<any[]>([]);
  
  // Controle de Interface (Tabs)
  const [activeTab, setActiveTab] = useState<'geral' | 'dominio'>('geral');
  
  // Controles de Salvamento e Publicação
  const [currentProjectSlug, setCurrentProjectSlug] = useState<string | null>(null);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [publishedDomain, setPublishedDomain] = useState<string | null>(null);
  
  const [officialDomain, setOfficialDomain] = useState('');
  const [registerLater, setRegisterLater] = useState(false);

  const [formData, setFormData] = useState({
    businessName: '', description: '', whatsapp: '', instagram: '', facebook: '', tiktok: '',
    ifood: '', noveNove: '', keeta: '', phone: '', email: '', address: '', mapEmbed: '',
    showForm: true, layoutStyle: 'layout_split_duplo', colorId: 'teal_pro', logoBase64: ''
  });

  // Atualiza visualmente em tempo real as configurações da barra lateral
  useEffect(() => {
    if (aiContent) {
      setGeneratedHtml(renderTemplate(aiContent, formData));
    }
  }, [formData.layoutStyle, formData.colorId, formData.logoBase64, formData.whatsapp, formData.instagram, formData.facebook, formData.tiktok, formData.ifood, formData.noveNove, formData.keeta, formData.showForm]);

  // Listener para capturar edições feitas direto no site (Iframe)
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
    const unsub = onAuthStateChanged(auth, (user) => setLoggedUserEmail(user?.email || null));
    return () => unsub();
  }, []);

  const fetchProjects = async () => {
    if (!auth.currentUser) return setSavedProjects([]);
    try {
      const listFn = httpsCallable(functions, 'listUserProjects');
      const listRes: any = await listFn({});
      setSavedProjects(listRes.data?.projects || []);
    } catch { setSavedProjects([]); }
  };

  useEffect(() => { fetchProjects(); }, [loggedUserEmail]);

  const renderTemplate = (content: any, data: typeof formData) => {
    let html = TEMPLATES[data.layoutStyle] || TEMPLATES['layout_split_duplo'];
    const colors = COLORS.find(c => c.id === data.colorId) || COLORS[0];

    const replaceAll = (token: string, value: string) => { html = html.split(token).join(value); };

    replaceAll('{{BUSINESS_NAME}}', data.businessName || 'Sua Empresa');
    replaceAll('{{HERO_TITLE}}', content.heroTitle || `Bem-vindo à ${data.businessName}`);
    replaceAll('{{HERO_SUBTITLE}}', content.heroSubtitle || 'Presença digital profissional.');
    replaceAll('{{ABOUT_TITLE}}', content.aboutTitle || 'Quem Somos');
    replaceAll('{{ABOUT_TEXT}}', content.aboutText || 'Nossa história e serviços.');
    replaceAll('{{CONTACT_CALL}}', content.contactCall || 'Fale conosco');
    
    replaceAll('{{COLOR_1}}', colors.c1); replaceAll('{{COLOR_2}}', colors.c2); replaceAll('{{COLOR_3}}', colors.c3);
    replaceAll('{{COLOR_4}}', colors.c4); replaceAll('{{COLOR_5}}', colors.c5); replaceAll('{{COLOR_6}}', colors.c6);
    replaceAll('{{COLOR_7}}', colors.c7); replaceAll('{{COLOR_LIGHT}}', colors.light); replaceAll('{{COLOR_DARK}}', colors.dark);
    
    replaceAll('{{ADDRESS}}', data.address || '');
    replaceAll('{{PHONE}}', data.phone || data.whatsapp || '');
    replaceAll('{{EMAIL}}', data.email || '');

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

    replaceAll('[[MAP_AREA]]', data.mapEmbed ? `<iframe src="${data.mapEmbed}" width="100%" height="220" style="border:0;" loading="lazy"></iframe>` : '');
    replaceAll('[[CONTACT_FORM]]', data.showForm ? `<form class="space-y-3"><input class="w-full border border-slate-300 rounded-lg p-2" placeholder="Seu nome" /><input class="w-full border border-slate-300 rounded-lg p-2" placeholder="Seu email" /><textarea class="w-full border border-slate-300 rounded-lg p-2" rows="4" placeholder="Sua mensagem"></textarea><button type="button" class="btn-primary w-full py-2 rounded-lg font-semibold">Enviar mensagem</button></form>` : '');

    // SCRIPT DO EDITOR VISUAL
    const editorScript = `
      <style>
        .custom-editor-toolbar {
          position: absolute; display: none; background: #18181b; padding: 6px; 
          border-radius: 8px; border: 1px solid #3f3f46; box-shadow: 0 10px 25px rgba(0,0,0,0.5);
          z-index: 99999; gap: 8px; align-items: center;
        }
        .custom-editor-toolbar input[type="color"] { width: 24px; height: 24px; border: none; cursor: pointer; background: transparent; }
        .custom-editor-toolbar select { background: #27272a; color: white; border: 1px solid #3f3f46; border-radius: 4px; padding: 4px; font-size: 12px; outline: none; }
        .editable-element { transition: outline 0.2s; outline: 2px dashed transparent; outline-offset: 4px; }
        .editable-element:hover { outline-color: rgba(16, 185, 129, 0.4); cursor: text; }
        .editable-element:focus { outline-color: #10b981; }
      </style>

      <div id="editor-toolbar" class="custom-editor-toolbar">
        <input type="color" id="text-color" title="Cor do Texto" />
        <select id="text-size" title="Tamanho">
          <option value="1">Pequeno</option><option value="3" selected>Normal</option><option value="5">Grande</option><option value="7">Gigante</option>
        </select>
        <select id="text-font" title="Fonte">
          <option value="Arial">Arial</option><option value="Georgia">Georgia</option><option value="Courier New">Courier</option>
        </select>
      </div>

      <script>
        document.addEventListener('DOMContentLoaded', () => {
          const toolbar = document.getElementById('editor-toolbar');

          document.querySelectorAll('h1, h2, h3, h4, p, span, button').forEach(el => {
            el.setAttribute('contenteditable', 'true');
            el.classList.add('editable-element');
            
            el.addEventListener('focus', (e) => {
              const rect = el.getBoundingClientRect();
              toolbar.style.display = 'flex';
              toolbar.style.top = (rect.top + window.scrollY - 45) + 'px';
              toolbar.style.left = (rect.left + window.scrollX) + 'px';
            });

            el.addEventListener('blur', (e) => {
              setTimeout(() => {
                if (!toolbar.contains(document.activeElement)) {
                  toolbar.style.display = 'none';
                  const cleanHtml = document.documentElement.outerHTML;
                  window.parent.postMessage({ type: 'CONTENT_EDITED', html: cleanHtml }, '*');
                }
              }, 200);
            });
          });

          document.getElementById('text-color').addEventListener('input', (e) => {
            document.execCommand('foreColor', false, e.target.value);
            window.parent.postMessage({ type: 'CONTENT_EDITED', html: document.documentElement.outerHTML }, '*');
          });

          document.getElementById('text-size').addEventListener('change', (e) => {
            document.execCommand('fontSize', false, e.target.value);
            window.parent.postMessage({ type: 'CONTENT_EDITED', html: document.documentElement.outerHTML }, '*');
          });

          document.getElementById('text-font').addEventListener('change', (e) => {
            document.execCommand('fontName', false, e.target.value);
            window.parent.postMessage({ type: 'CONTENT_EDITED', html: document.documentElement.outerHTML }, '*');
          });
        });
      </script>
    `;
    
    return html.replace('</body>', `${editorScript}</body>`);
  };

  const handleGenerate = async () => {
    if (!formData.businessName || !formData.description) return alert('Preencha Nome e Ideia!');
    setIsGenerating(true);
    try {
      if (aiContent && generatedHtml) {
        setGeneratedHtml(renderTemplate(aiContent, formData));
        setHasUnsavedChanges(true);
        setIsGenerating(false);
        return;
      }
      const generateFn = httpsCallable(functions, 'generateSite');
      const result: any = await generateFn({ businessName: formData.businessName, description: formData.description });
      setAiContent(result.data);
      setGeneratedHtml(renderTemplate(result.data, formData));
      setHasUnsavedChanges(true);
    } catch (error: any) { alert('Erro: ' + error.message); } 
    finally { setIsGenerating(false); }
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

  const handleSaveOrUpdateSite = async () => {
    if (!auth.currentUser) return setIsLoginOpen(true);
    
    // Se está salvando pela primeira vez, exige que passe pela aba domínio e confirme
    if (!currentProjectSlug && !registerLater && !officialDomain) {
      setActiveTab('dominio');
      return alert("Por favor, configure seu domínio ou marque a opção 'Configurar depois' na aba de Domínio Oficial.");
    }
    
    setIsSavingProject(true);
    try {
      if (currentProjectSlug) {
        // Atualiza projeto existente
        const updateFn = httpsCallable(functions, 'updateSiteProject');
        await updateFn({ projectId: currentProjectSlug, projectSlug: currentProjectSlug, html: generatedHtml, formData });
      } else {
        // Cria projeto novo
        const cleanName = formData.businessName.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, '-');
        const internalDomain = `${cleanName}-${Math.random().toString(36).substring(2, 6)}`;
        
        const saveFn = httpsCallable(functions, 'saveSiteProject');
        const res: any = await saveFn({
          businessName: formData.businessName,
          officialDomain: registerLater ? "Pendente" : officialDomain,
          internalDomain: internalDomain,
          generatedHtml, formData, aiContent,
        });
        if (res.data?.projectSlug) setCurrentProjectSlug(res.data.projectSlug);
      }
      
      setHasUnsavedChanges(false);
      fetchProjects();
      alert("Site salvo com sucesso!");
    } catch (err: any) { alert('Erro ao salvar o site.'); } 
    finally { setIsSavingProject(false); }
  };

  const handlePublishSite = async () => {
    if (hasUnsavedChanges) return alert("Salve suas alterações antes de publicar.");
    setIsPublishing(true);
    try {
      const publishFn = httpsCallable(functions, 'publishUserProject');
      const res: any = await publishFn({ projectSlug: currentProjectSlug, projectId: currentProjectSlug });
      if (res.data?.publishUrl) setPublishedDomain(res.data.publishUrl.replace(/^https?:\/\//, ''));
      alert("Site publicado com sucesso! Pode demorar alguns minutos para o link propagar na internet.");
      fetchProjects();
    } catch (err: any) { alert('Erro ao publicar. O servidor pode estar provisionando sua infraestrutura.'); } 
    finally { setIsPublishing(false); }
  };

  // A FUNÇÃO DA LIXEIRA
  const handleDeleteSite = async (projectId: string) => {
    if (!window.confirm("Atenção! Esta ação apagará definitivamente o seu site do ar. Tem certeza absoluta?")) return;
    try {
      const deleteFn = httpsCallable(functions, 'deleteUserProject');
      await deleteFn({ projectId, projectSlug: projectId });
      alert("Site excluído com sucesso.");
      
      if (projectId === currentProjectSlug) {
        setGeneratedHtml(null);
        setCurrentProjectSlug(null);
        setHasUnsavedChanges(false);
        setActiveTab('geral');
        setFormData({ businessName: '', description: '', whatsapp: '', instagram: '', facebook: '', tiktok: '', ifood: '', noveNove: '', keeta: '', phone: '', email: '', address: '', mapEmbed: '', showForm: true, layoutStyle: 'layout_split_duplo', colorId: 'teal_pro', logoBase64: '' });
      }
      fetchProjects();
    } catch (error) {
      alert("Erro ao excluir o site.");
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
    setActiveTab('geral');
  };

  const handleLogout = async () => {
    await signOut(auth);
    setSavedProjects([]);
    setCurrentProjectSlug(null);
    setGeneratedHtml(null);
  };

  const handleLoginSubmit = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      await createUserWithEmailAndPassword(auth, email, password);
    }
    setIsLoginOpen(false);
  };

  const handleDownloadZip = () => {
    if (!generatedHtml) return;
    const zip = new JSZip();
    zip.file('index.html', generatedHtml);
    zip.generateAsync({ type: 'blob' }).then(c => saveAs(c, `${formData.businessName || 'site'}.zip`));
  };

  return (
    <div className="relative w-full h-screen bg-zinc-950 overflow-hidden font-sans text-white">
      {/* FRAME DO SITE */}
      <div className="absolute inset-0 z-0 bg-[#09090b]">
        {generatedHtml ? (
          <iframe srcDoc={generatedHtml} className="w-full h-full border-none bg-white" title="Preview Visual" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full opacity-20 animate-pulse select-none">
            <Rocket className="w-24 h-24 mb-4" />
            <h2 className="text-2xl font-bold">O seu site vai aparecer aqui</h2>
          </div>
        )}
      </div>

      {loggedUserEmail && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[90] bg-emerald-700/90 text-white text-xs md:text-sm px-4 py-2 rounded-full shadow-lg border border-emerald-300/30 backdrop-blur-md">
          ✅ Logado como: <strong>{loggedUserEmail}</strong>
        </div>
      )}

      {/* BARRA FLUTUANTE DE SALVAR / PUBLICAR NO TOPO DA TELA */}
      {generatedHtml && (
        <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed top-6 right-6 z-[85] bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 p-2 rounded-2xl shadow-2xl flex items-center gap-3">
          <button 
            onClick={handleSaveOrUpdateSite} disabled={isSavingProject || (!hasUnsavedChanges && currentProjectSlug !== null)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${hasUnsavedChanges || !currentProjectSlug ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
          >
            {isSavingProject ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
            {currentProjectSlug ? 'Atualizar Site' : 'Salvar Projeto'}
          </button>

          <div className="w-px h-6 bg-zinc-700 mx-1"></div>

          <button 
            onClick={handlePublishSite} disabled={isPublishing || hasUnsavedChanges || !currentProjectSlug}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${!hasUnsavedChanges && currentProjectSlug ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
          >
            {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe size={16} />} Publicar
          </button>
        </motion.div>
      )}

      <LoginPage isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSubmit={handleLoginSubmit} />

      {/* SIDEBAR COMPLETA E INTEGRADA */}
      <motion.div className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <AnimatePresence>
          {isMenuOpen ? (
            <motion.div initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} className="w-[92vw] max-w-[350px] bg-zinc-900/95 backdrop-blur-xl border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="flex justify-between items-center px-4 py-3 border-b border-zinc-700 flex-shrink-0">
                <h2 className="font-bold text-sm tracking-wide">{generatedHtml ? 'Configurações do Site' : 'Novo Projeto'}</h2>
                <button onClick={() => setIsMenuOpen(false)} className="hover:bg-zinc-700 p-1.5 rounded transition-colors"><Minimize2 size={18} /></button>
              </div>

              {/* TABS DE NAVEGAÇÃO (Aparece apenas quando o site foi gerado) */}
              {generatedHtml && (
                <div className="flex border-b border-zinc-800 text-[11px] font-bold uppercase tracking-wider flex-shrink-0">
                  <button 
                    onClick={() => setActiveTab('geral')} 
                    className={`flex-1 py-3.5 text-center transition-colors ${activeTab === 'geral' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-400/5' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}
                  >
                    Visual & Dados
                  </button>
                  <button 
                    onClick={() => setActiveTab('dominio')} 
                    className={`flex-1 py-3.5 text-center transition-colors ${activeTab === 'dominio' ? 'text-indigo-400 border-b-2 border-indigo-400 bg-indigo-400/5' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}
                  >
                    Domínio Oficial
                  </button>
                </div>
              )}

              <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-6 pb-20">
                
                {/* ETAPA 1: O FORMULÁRIO ENXUTO INICIAL (Sempre visível se for a aba geral, mas read-only/editável) */}
                {activeTab === 'geral' && (
                  <>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase flex gap-2 mb-1"><Briefcase size={12} /> Nome do Negócio</label>
                        <input className="w-full bg-black/40 border border-zinc-700 rounded-lg p-3 text-sm focus:border-emerald-500" placeholder="Ex: Pizzaria Roma" value={formData.businessName} onChange={e => {setFormData({ ...formData, businessName: e.target.value }); setHasUnsavedChanges(true)}} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase flex gap-2 mb-1"><FileText size={12} /> Ideia Principal</label>
                        <textarea className="w-full h-16 bg-black/40 border border-zinc-700 rounded-lg p-3 text-sm resize-none focus:border-emerald-500" placeholder="Descreva os serviços..." value={formData.description} onChange={e => {setFormData({ ...formData, description: e.target.value }); setHasUnsavedChanges(true)}} />
                      </div>
                    </div>

                    <button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-zinc-600 transition-colors">
                      {isGenerating ? <Loader2 className="animate-spin" /> : <RefreshCw />} {generatedHtml ? 'Recriar Site c/ IA' : 'Gerar Meu Site'}
                    </button>

                    {/* OPÇÕES COMPLETAS DE VISUAL */}
                    {generatedHtml && (
                      <div className="pt-5 border-t border-zinc-800 space-y-5">
                        
                        <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/30 text-xs text-emerald-300">
                          ✨ <strong>Edição Visual:</strong> Clique em qualquer texto no site à direita para alterar cor, tamanho e fonte.
                        </div>

                        {/* LAYOUT E CORES */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-500 uppercase">Estilo do Site</label>
                          <select className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-sm" value={formData.layoutStyle} onChange={e => {setFormData({ ...formData, layoutStyle: e.target.value }); setHasUnsavedChanges(true)}}>
                            {LAYOUT_STYLES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-500 uppercase">Tema de Cores</label>
                          <div className="flex gap-2 flex-wrap">
                            {COLORS.map(c => <button key={c.id} onClick={() => { setFormData({ ...formData, colorId: c.id }); setHasUnsavedChanges(true); }} className={`w-8 h-8 rounded-full border-2 transition-all ${formData.colorId === c.id ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`} style={{ backgroundColor: c.c4 }} title={c.name} />)}
                          </div>
                        </div>

                        {/* LOGO */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-500 uppercase flex justify-between">
                            <span>Sua Logomarca</span>
                            {formData.logoBase64 && <button onClick={() => { setFormData(p => ({ ...p, logoBase64: '' })); setHasUnsavedChanges(true); }} className="text-red-400 hover:text-red-300 text-[10px]"><X size={12} /></button>}
                          </label>
                          {!formData.logoBase64 ? (
                            <label className="cursor-pointer border border-dashed border-zinc-600 hover:border-indigo-500 rounded-lg p-3 flex justify-center gap-2 text-xs text-zinc-400 transition-colors">
                              <Upload size={14} /> Fazer Upload
                              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                            </label>
                          ) : (
                            <div className="h-12 bg-white/5 border border-zinc-700 rounded-lg flex items-center justify-center overflow-hidden p-1">
                              <img src={formData.logoBase64} className="h-full object-contain" alt="Logo" />
                            </div>
                          )}
                        </div>

                        {/* REDES SOCIAIS E DELIVERY */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-500 uppercase flex gap-1"><Phone size={12} /> Redes e Contato</label>
                          <input className="w-full bg-black/40 border border-zinc-700 rounded-lg p-2.5 text-xs" placeholder="WhatsApp (Apenas números)" value={formData.whatsapp} onChange={e => {setFormData({ ...formData, whatsapp: e.target.value }); setHasUnsavedChanges(true)}} />
                          <input className="w-full bg-black/40 border border-zinc-700 rounded-lg p-2.5 text-xs mt-2" placeholder="Instagram (@usuario)" value={formData.instagram} onChange={e => {setFormData({ ...formData, instagram: e.target.value }); setHasUnsavedChanges(true)}} />
                          <input className="w-full bg-black/40 border border-zinc-700 rounded-lg p-2.5 text-xs mt-2" placeholder="Facebook (Link completo)" value={formData.facebook} onChange={e => {setFormData({ ...formData, facebook: e.target.value }); setHasUnsavedChanges(true)}} />
                          <input className="w-full bg-black/40 border border-zinc-700 rounded-lg p-2.5 text-xs mt-2" placeholder="TikTok (Link completo)" value={formData.tiktok} onChange={e => {setFormData({ ...formData, tiktok: e.target.value }); setHasUnsavedChanges(true)}} />
                          
                          <label className="text-xs font-bold text-zinc-500 uppercase mt-4 block">Aplicativos de Delivery</label>
                          <input className="w-full bg-black/40 border border-zinc-700 rounded-lg p-2.5 text-xs" placeholder="iFood (Link)" value={formData.ifood} onChange={e => {setFormData({ ...formData, ifood: e.target.value }); setHasUnsavedChanges(true)}} />
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <input className="w-full bg-black/40 border border-zinc-700 rounded-lg p-2.5 text-xs" placeholder="99 Food" value={formData.noveNove} onChange={e => {setFormData({ ...formData, noveNove: e.target.value }); setHasUnsavedChanges(true)}} />
                            <input className="w-full bg-black/40 border border-zinc-700 rounded-lg p-2.5 text-xs" placeholder="Keeta" value={formData.keeta} onChange={e => {setFormData({ ...formData, keeta: e.target.value }); setHasUnsavedChanges(true)}} />
                          </div>
                        </div>

                      </div>
                    )}
                  </>
                )}

                {/* ABA DOMÍNIO: ONDE A MÁGICA DOS DNS ACONTECE */}
                {activeTab === 'dominio' && generatedHtml && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                    
                    {/* Se o projeto não foi salvo ainda */}
                    {!currentProjectSlug ? (
                      <>
                        <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/30">
                          <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2 mb-2"><Globe size={16}/> Qual será o endereço?</h4>
                          <p className="text-xs text-indigo-200/80 mb-4 leading-relaxed">
                            Antes de salvar, precisamos saber se você vai usar um domínio oficial (Registro.br).
                          </p>
                          <DomainChecker onDomainChange={(domain, isLater) => { setOfficialDomain(domain); setRegisterLater(isLater); }} />
                        </div>
                      </>
                    ) : (
                      /* Se o projeto JÁ FOI SALVO: Mostra as instruções de apontamento */
                      <div className="space-y-4">
                        <div className="bg-[#121214] p-5 rounded-2xl border border-zinc-800 shadow-xl">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="bg-indigo-500/20 p-2.5 rounded-xl">
                              <Globe className="text-indigo-400 w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="font-bold text-white text-sm">Apontamento DNS</h3>
                              <p className="text-[10px] text-zinc-400">Configure no seu Registro.br ou Hostinger</p>
                            </div>
                          </div>

                          <div className="bg-black/60 p-4 rounded-xl border border-zinc-800/50 space-y-4">
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">TIPO A</span>
                              </div>
                              <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800 flex justify-between items-center group">
                                <code className="text-emerald-400 text-xs font-bold select-all">199.36.158.100</code>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">TIPO TXT</span>
                              </div>
                              <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
                                <code className="text-indigo-300 text-[10px] break-all select-all block leading-tight">
                                  firebase-site-verification={currentProjectSlug}-app
                                </code>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20 flex gap-2 items-start">
                            <AlertCircle size={14} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                            <p className="text-[10px] text-yellow-200/80 leading-relaxed">
                              Após inserir os dados acima no seu provedor, pode levar até 24 horas para a internet reconhecer o seu domínio. 
                              Enquanto isso, seu site já funciona neste link provisório: <br/>
                              <a href={`https://${currentProjectSlug}.web.app`} target="_blank" rel="noreferrer" className="text-indigo-400 font-bold hover:underline mt-1 inline-block">https://{currentProjectSlug}.web.app</a>
                            </p>
                          </div>
                        </div>

                        {generatedHtml && <button onClick={handleDownloadZip} className="w-full border border-zinc-700 hover:bg-zinc-800 text-zinc-300 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors mt-4"><Download size={16} /> Baixar Código do Site</button>}
                      </div>
                    )}
                  </div>
                )}
                
                {/* LISTAGEM DE PROJETOS SALVOS (Com Lixeira Rápida) */}
                {loggedUserEmail && (
                  <div className="mt-8 border-t border-zinc-800 pt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                        <LayoutDashboard size={14} className="text-emerald-500"/>
                        Meus Projetos
                      </p>
                      <button onClick={handleLogout} className="text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors uppercase bg-red-500/10 px-2 py-1 rounded">Sair</button>
                    </div>
                    
                    <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
                      {savedProjects.length === 0 ? (
                        <p className="text-xs text-zinc-500 italic bg-zinc-900/50 p-3 rounded-lg text-center border border-zinc-800/50">Nenhum projeto ainda.</p>
                      ) : (
                        savedProjects.map((p: any) => (
                          <div key={p.id} className="flex items-stretch gap-1.5 group">
                            {/* Botão de Carregar Projeto */}
                            <button 
                              onClick={() => handleLoadProject(p)} 
                              className={`flex-1 text-left text-xs bg-zinc-900 hover:bg-zinc-800 rounded-xl p-3 flex justify-between items-center border transition-all ${currentProjectSlug === p.id ? 'border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'border-zinc-800'}`}
                            >
                              <div className="flex flex-col truncate pr-2">
                                <span className="font-bold text-zinc-100 truncate">{p.businessName || 'Sem Nome'}</span>
                                <span className="text-[9px] text-zinc-500 font-mono mt-0.5">{p.id}.web.app</span>
                              </div>
                              {p.published && <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />}
                            </button>
                            
                            {/* O BOTÃO DA LIXEIRA */}
                            <button 
                              onClick={() => handleDeleteSite(p.id)} 
                              className="w-10 bg-zinc-900 hover:bg-red-500 hover:text-white text-zinc-500 rounded-xl border border-zinc-800 hover:border-red-500 flex items-center justify-center transition-all flex-shrink-0" 
                              title="Apagar Site"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => setIsMenuOpen(true)} className="w-14 h-14 bg-indigo-600 hover:bg-indigo-500 rounded-full shadow-2xl flex items-center justify-center cursor-pointer ring-4 ring-black/20 transition-transform hover:scale-105"><Settings className="text-white" size={26} /></motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default App;
