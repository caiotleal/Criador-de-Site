import React, { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, functions } from './firebase';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket, Settings, Palette, Upload, Layout, Download,
  Loader2, Minimize2, RefreshCw, Briefcase, FileText, X, Phone, MapPin, Sparkles, Globe, CheckCircle, LayoutDashboard, Save
} from 'lucide-react';
import { TEMPLATES } from './components/templates';
import LoginPage from './components/LoginPage';
import ClientDashboard from './components/ClientDashboard';

const LAYOUT_STYLES = [
  { id: 'layout_split_duplo', label: 'Split Duplo', desc: 'Hero em duas colunas' },
  { id: 'layout_coluna_simples', label: 'Coluna Simples', desc: 'Fluxo vertical limpo' },
  { id: 'layout_menu_hamburguer', label: 'Menu Hambúrguer', desc: 'Menu moderno' },
];

const COLORS = [
  { id: 'teal_pro', name: 'Teal', c1: '#003333', c2: '#004444', c3: '#006666', c4: '#009c93', c5: '#a3f3ff', c6: '#c5f7ff', c7: '#eafffd', light: '#ffffff', dark: '#003333' },
  { id: 'violet_studio', name: 'Violet', c1: '#24103a', c2: '#3b1f63', c3: '#5b2b95', c4: '#7b3aed', c5: '#d8c5ff', c6: '#ebe1ff', c7: '#f6f1ff', light: '#ffffff', dark: '#24103a' },
  { id: 'ocean_navy', name: 'Ocean', c1: '#0a1f33', c2: '#12395c', c3: '#1f5f94', c4: '#2b7fc5', c5: '#c3e6ff', c6: '#deefff', c7: '#f2f8ff', light: '#ffffff', dark: '#0a1f33' },
];

const App: React.FC = () => {
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [aiContent, setAiContent] = useState<any>(null);
  
  // Autenticação e Dashboards
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loggedUserEmail, setLoggedUserEmail] = useState<string | null>(auth.currentUser?.email || null);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [savedProjects, setSavedProjects] = useState<any[]>([]);
  
  // Controle de Fluxo
  const [currentProjectSlug, setCurrentProjectSlug] = useState<string | null>(null);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [publishedDomain, setPublishedDomain] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    businessName: '', description: '', whatsapp: '', instagram: '', facebook: '', tiktok: '',
    ifood: '', noveNove: '', keeta: '', phone: '', email: '', address: '', mapEmbed: '',
    showForm: true, layoutStyle: 'layout_split_duplo', colorId: 'teal_pro', logoBase64: ''
  });

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

    const mapArea = data.mapEmbed ? `<iframe src="${data.mapEmbed}" width="100%" height="220" style="border:0;" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>` : '';
    replaceAll('[[MAP_AREA]]', mapArea);
    replaceAll('[[CONTACT_FORM]]', data.showForm ? `<form class="space-y-3"><input class="w-full border border-slate-300 rounded-lg p-2" placeholder="Seu nome" /><input class="w-full border border-slate-300 rounded-lg p-2" placeholder="Seu email" /><textarea class="w-full border border-slate-300 rounded-lg p-2" rows="4" placeholder="Sua mensagem"></textarea><button type="button" class="btn-primary w-full py-2 rounded-lg font-semibold">Enviar mensagem</button></form>` : '');

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

  const handleSaveOrUpdateSite = async () => {
    if (!auth.currentUser) return setIsLoginOpen(true);
    setIsSavingProject(true);

    try {
      const cleanName = formData.businessName.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, '-');
      const internalDomain = `${cleanName}-${Math.random().toString(36).substring(2, 6)}`;

      if (currentProjectSlug) {
        const updateFn = httpsCallable(functions, 'updateSiteProject');
        await updateFn({ projectId: currentProjectSlug, html: generatedHtml, formData });
      } else {
        const saveFn = httpsCallable(functions, 'saveSiteProject');
        const res: any = await saveFn({
          businessName: formData.businessName,
          internalDomain: internalDomain,
          generatedHtml, formData, aiContent,
        });
        if (res.data?.projectSlug) setCurrentProjectSlug(res.data.projectSlug);
      }
      
      setHasUnsavedChanges(false);
      setLastSavedAt(new Date());
      fetchProjects();
      alert("Site guardado com sucesso!");
    } catch (err: any) { alert('Erro ao guardar site.'); } 
    finally { setIsSavingProject(false); }
  };

  const handlePublishSite = async () => {
    if (hasUnsavedChanges) return alert("Guarde as alterações antes de publicar.");
    setIsPublishing(true);
    try {
      const publishFn = httpsCallable(functions, 'publishUserProject');
      const res: any = await publishFn({ projectSlug: currentProjectSlug });
      if (res.data?.publishUrl) setPublishedDomain(res.data.publishUrl.replace(/^https?:\/\//, ''));
      alert("Site publicado com sucesso!");
    } catch (err: any) { alert('Erro ao publicar.'); } 
    finally { setIsPublishing(false); }
  };

  const handleLoginSubmit = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      // Se não existir, cria a conta automaticamente
      await createUserWithEmailAndPassword(auth, email, password);
    }
    setIsLoginOpen(false);
  };
      
      if (projectId === currentProjectSlug) {
        setGeneratedHtml(null);
        setCurrentProjectSlug(null);
        setHasUnsavedChanges(false);
        setFormData({ businessName: '', description: '', whatsapp: '', instagram: '', facebook: '', tiktok: '', ifood: '', noveNove: '', keeta: '', phone: '', email: '', address: '', mapEmbed: '', showForm: true, layoutStyle: 'layout_split_duplo', colorId: 'teal_pro', logoBase64: '' });
      }
      fetchProjects();
    } catch (error) {
      alert("Erro ao excluir o site.");
    }
  };

  return (
    <div className="relative w-full h-screen bg-zinc-950 overflow-hidden font-sans text-white">
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

      {loggedUserEmail && (
        <div className="fixed top-4 right-4 md:right-6 z-[90] flex items-center gap-3">
          <button onClick={() => setIsDashboardOpen(true)} className="bg-zinc-900/90 backdrop-blur-md border border-zinc-700 hover:border-indigo-500 text-white px-5 py-2.5 rounded-full shadow-xl font-bold flex items-center gap-2 transition-all">
            <LayoutDashboard size={16} className="text-indigo-400" /> Meu Painel
          </button>
        </div>
      )}

      {generatedHtml && (
        <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed top-6 left-1/2 -translate-x-1/2 z-[85] bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 p-2 rounded-2xl shadow-2xl flex items-center gap-3">
          <button 
            onClick={handleSaveOrUpdateSite} disabled={isSavingProject || (!hasUnsavedChanges && currentProjectSlug !== null)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${hasUnsavedChanges || !currentProjectSlug ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
          >
            {isSavingProject ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
            {currentProjectSlug ? 'Atualizar Site' : 'Guardar Site'}
          </button>
          <div className="w-px h-6 bg-zinc-700 mx-1"></div>
          <button 
            onClick={handlePublishSite} disabled={isPublishing || hasUnsavedChanges || !currentProjectSlug}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${!hasUnsavedChanges && currentProjectSlug ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
          >
            {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe size={16} />} Publicar
          </button>
        </motion.div>
      )}

      <LoginPage isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSubmit={handleLoginSubmit} />

      <motion.div className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <AnimatePresence>
          {isMenuOpen ? (
            <motion.div initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} className="w-[92vw] max-w-[340px] bg-zinc-900/95 backdrop-blur-xl border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex justify-between items-center px-4 py-3 border-b border-zinc-700">
                <h2 className="font-bold text-sm tracking-wide">{generatedHtml ? 'Painel de Configurações' : 'Novo Projeto'}</h2>
                <button onClick={() => setIsMenuOpen(false)} className="hover:bg-zinc-700 p-1.5 rounded transition-colors"><Minimize2 size={18} /></button>
              </div>

              <div className="p-5 overflow-y-auto custom-scrollbar max-h-[75vh] space-y-5">
                <div className="space-y-3">
                  <input className="w-full bg-black/40 border border-zinc-700 rounded-lg p-3 text-sm focus:border-emerald-500" placeholder="Nome do Negócio" value={formData.businessName} onChange={e => {setFormData({ ...formData, businessName: e.target.value }); setHasUnsavedChanges(true)}} />
                  <textarea className="w-full h-20 bg-black/40 border border-zinc-700 rounded-lg p-3 text-sm resize-none focus:border-emerald-500" placeholder="Ideia do site..." value={formData.description} onChange={e => {setFormData({ ...formData, description: e.target.value }); setHasUnsavedChanges(true)}} />
                </div>

                <button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-zinc-600 transition-colors">
                  {isGenerating ? <Loader2 className="animate-spin" /> : <RefreshCw />} {generatedHtml ? 'Recriar Textos c/ IA' : 'Gerar Meu Site'}
                </button>

                {generatedHtml && (
                  <div className="pt-4 border-t border-zinc-800 space-y-5">
                    <div className="bg-indigo-500/10 p-3 rounded-lg border border-indigo-500/30 text-xs text-indigo-300">
                      ✨ <strong>Dica:</strong> Clique nos textos do site à direita para alterar cores, tamanhos e fontes!
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase">Layout Principal</label>
                      <select className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-sm" value={formData.layoutStyle} onChange={e => {setFormData({ ...formData, layoutStyle: e.target.value }); setHasUnsavedChanges(true)}}>
                        {LAYOUT_STYLES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase">Tema de Cores</label>
                      <div className="flex gap-2 flex-wrap">
                        {COLORS.map(c => <button key={c.id} onClick={() => { setFormData({ ...formData, colorId: c.id }); setHasUnsavedChanges(true); }} className={`w-8 h-8 rounded-full border-2 transition-all ${formData.colorId === c.id ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: c.c4 }} />)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase">Redes Sociais</label>
                      <input className="w-full bg-black/40 border border-zinc-700 rounded-lg p-2 text-xs" placeholder="WhatsApp (Apenas números)" value={formData.whatsapp} onChange={e => {setFormData({ ...formData, whatsapp: e.target.value }); setHasUnsavedChanges(true)}} />
                      <input className="w-full bg-black/40 border border-zinc-700 rounded-lg p-2 text-xs mt-2" placeholder="Instagram (@usuario)" value={formData.instagram} onChange={e => {setFormData({ ...formData, instagram: e.target.value }); setHasUnsavedChanges(true)}} />
                    </div>
                    <div className="space-y-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2"><Globe size={16} className="text-emerald-400"/> Domínio Profissional</h4>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Para ter um site <strong>.com.br</strong>, registre o nome no <a href="https://registro.br" target="_blank" rel="noreferrer" className="text-emerald-400 underline">Registro.br</a> e configure o seu DNS.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => setIsMenuOpen(true)} className="w-14 h-14 bg-indigo-600 hover:bg-indigo-500 rounded-full shadow-2xl flex items-center justify-center cursor-pointer ring-4 ring-black/20 transition-transform"><Settings className="text-white" size={26} /></motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {isDashboardOpen && (
          <ClientDashboard 
            projects={savedProjects}
            userEmail={loggedUserEmail || ''}
            onClose={() => setIsDashboardOpen(false)}
            onEditProject={(project) => {
              setFormData(project.formData);
              setGeneratedHtml(project.generatedHtml);
              setCurrentProjectSlug(project.projectSlug || project.id);
              setHasUnsavedChanges(false);
              setIsDashboardOpen(false);
              setIsMenuOpen(true);
            }}
            onDeleteProject={handleDeleteSite}
            onUpgrade={(projectId) => alert(`Redirecionando para o checkout do projeto: ${projectId}`)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
