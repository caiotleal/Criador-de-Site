import React, { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, functions } from './firebase';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket, Settings, Palette, Upload, Layout, Download,
  Loader2, Minimize2, RefreshCw, Briefcase, FileText, X, Phone, Globe, CheckCircle, Save, Trash2, AlertCircle, LayoutDashboard, MapPin, Copy, ExternalLink
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

// 10 PALETAS COM DEGRADÊ DE 3 CORES (c4 -> c5 -> c6)
const COLORS = [
  // DARK MODE (Fundos escuros)
  { id: 'cyberpunk', name: 'Cyberpunk', c1: '#09090b', c2: '#18181b', c3: '#27272a', c4: '#06b6d4', c5: '#8b5cf6', c6: '#ec4899', c7: '#fbcfe8', light: '#09090b', dark: '#f8fafc' },
  { id: 'ocean', name: 'Oceano Profundo', c1: '#020617', c2: '#0f172a', c3: '#1e293b', c4: '#2563eb', c5: '#0d9488', c6: '#10b981', c7: '#ccfbf1', light: '#020617', dark: '#f8fafc' },
  { id: 'sunset', name: 'Pôr do Sol', c1: '#1a0505', c2: '#2a0a18', c3: '#431407', c4: '#e11d48', c5: '#ea580c', c6: '#eab308', c7: '#fef08a', light: '#1a0505', dark: '#f8fafc' },
  { id: 'aurora', name: 'Aurora Boreal', c1: '#022c22', c2: '#052e16', c3: '#064e3b', c4: '#10b981', c5: '#0ea5e9', c6: '#8b5cf6', c7: '#e0e7ff', light: '#022c22', dark: '#f8fafc' },
  { id: 'neon', name: 'Neon Urbano', c1: '#171717', c2: '#262626', c3: '#404040', c4: '#d946ef', c5: '#f43f5e', c6: '#f97316', c7: '#ffe4e6', light: '#0a0a0a', dark: '#ffffff' },
  
  // LIGHT MODE (Fundos claros)
  { id: 'tropical', name: 'Tropical Claro', c1: '#f8fafc', c2: '#f1f5f9', c3: '#e2e8f0', c4: '#0ea5e9', c5: '#22c55e', c6: '#eab308', c7: '#fef08a', light: '#ffffff', dark: '#0f172a' },
  { id: 'berry', name: 'Frutas Vermelhas', c1: '#fdf2f8', c2: '#fce7f3', c3: '#fbcfe8', c4: '#e11d48', c5: '#c026d3', c6: '#7c3aed', c7: '#ddd6fe', light: '#fffafc', dark: '#4c0519' },
  { id: 'citrus', name: 'Cítrico', c1: '#fffbeb', c2: '#fef3c7', c3: '#fde68a', c4: '#f59e0b', c5: '#f97316', c6: '#ef4444', c7: '#fecaca', light: '#fffcfa', dark: '#422006' },
  { id: 'aqua', name: 'Água Marinha', c1: '#f0fdfa', c2: '#ccfbf1', c3: '#99f6e4', c4: '#0d9488', c5: '#0284c7', c6: '#2563eb', c7: '#bfdbfe', light: '#f2ffff', dark: '#042f2e' },
  { id: 'pastel', name: 'Sonho Pastel', c1: '#faf5ff', c2: '#f3e8ff', c3: '#e9d5ff', c4: '#9333ea', c5: '#db2777', c6: '#ea580c', c7: '#fed7aa', light: '#fcfaff', dark: '#3b0764' },
];

const cleanHtmlForPublishing = (rawHtml: string | null) => {
  if (!rawHtml) return '';
  if (!rawHtml.includes('editor-toolbar')) return rawHtml;

  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, 'text/html');
  
  const tb = doc.querySelector('#editor-toolbar'); if (tb) tb.remove();
  const sc = doc.querySelector('#editor-script'); if (sc) sc.remove();
  const st = doc.querySelector('#editor-style'); if (st) st.remove();
  
  doc.querySelectorAll('.editable-element').forEach(el => {
    el.removeAttribute('contenteditable');
    el.classList.remove('editable-element');
    if (el.getAttribute('class') === '') el.removeAttribute('class');
  });
  
  return doc.documentElement.outerHTML;
};

const getPreviewHtml = (baseHtml: string | null) => {
  if (!baseHtml) return '';
  const clean = cleanHtmlForPublishing(baseHtml);
  
  const editorScript = `
    <style id="editor-style">
      .custom-editor-toolbar {
        position: absolute; display: none; background: #18181b; padding: 8px; 
        border-radius: 10px; border: 1px solid #3f3f46; box-shadow: 0 10px 25px rgba(0,0,0,0.8);
        z-index: 99999; gap: 8px; align-items: center; font-family: sans-serif;
      }
      .color-picker-group { display: flex; align-items: center; gap: 4px; background: #27272a; padding: 2px 6px 2px 8px; border-radius: 6px; border: 1px solid #3f3f46; }
      .color-picker-label { color: #a1a1aa; font-size: 10px; font-weight: bold; }
      .custom-editor-toolbar input[type="color"] { width: 22px; height: 22px; border: none; cursor: pointer; background: transparent; padding: 0; }
      .custom-editor-toolbar select { background: #27272a; color: white; border: 1px solid #3f3f46; border-radius: 6px; padding: 4px 8px; font-size: 12px; outline: none; cursor: pointer; height: 30px; }
      .custom-editor-toolbar button#text-delete { background: #ef444415; border: 1px solid #ef444450; color: #ef4444; font-size: 12px; font-weight: bold; border-radius: 6px; cursor: pointer; padding: 0 10px; transition: all 0.2s; height: 30px; display: flex; align-items: center; gap: 4px; }
      .custom-editor-toolbar button#text-delete:hover { background: #ef4444; color: white; border-color: #ef4444; }
      .editable-element { transition: all 0.2s; outline: 2px dashed transparent; outline-offset: 2px; }
      .editable-element:hover { outline-color: rgba(59, 130, 246, 0.5); cursor: pointer; }
      .editable-element:focus { outline-color: #3b82f6; }
    </style>

    <div id="editor-toolbar" class="custom-editor-toolbar">
      <div class="color-picker-group" title="Cor do Texto (Fonte)">
        <span class="color-picker-label">T</span>
        <input type="color" id="fore-color-picker" />
      </div>
      <div class="color-picker-group" title="Cor do Fundo (Background)">
        <span class="color-picker-label">F</span>
        <input type="color" id="bg-color-picker" />
      </div>
      <select id="text-size" title="Tamanho da Fonte">
        <option value="1">Pequeno</option><option value="3" selected>Normal</option><option value="5">Grande</option><option value="7">Gigante</option>
      </select>
      <select id="text-font" title="Família da Fonte">
        <option value="Arial">Arial</option><option value="Georgia">Georgia</option><option value="Courier New">Courier</option><option value="Verdana">Verdana</option>
      </select>
      <div style="width: 1px; height: 20px; background: #3f3f46; margin: 0 4px;"></div>
      <button id="text-delete" title="Apagar este elemento do site">✖ Excluir</button>
    </div>

    <script id="editor-script">
      document.addEventListener('DOMContentLoaded', () => {
        const toolbar = document.getElementById('editor-toolbar');
        const foreColorPicker = document.getElementById('fore-color-picker');
        const bgColorPicker = document.getElementById('bg-color-picker');
        let currentTarget = null;

        function sendCleanHtml() {
          const clone = document.documentElement.cloneNode(true);
          const tb = clone.querySelector('#editor-toolbar'); if (tb) tb.remove();
          const sc = clone.querySelector('#editor-script'); if (sc) sc.remove();
          const st = clone.querySelector('#editor-style'); if (st) st.remove();
          clone.querySelectorAll('.editable-element').forEach(el => {
            el.removeAttribute('contenteditable');
            el.classList.remove('editable-element');
            if (el.getAttribute('class') === '') el.removeAttribute('class');
          });
          window.parent.postMessage({ type: 'CONTENT_EDITED', html: clone.outerHTML }, '*');
        }

        function rgbToHex(rgb) {
          if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return '#000000';
          const match = rgb.match(/^rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*(\\d+(?:\\.\\d+)?))?\\)$/);
          if(!match) return '#000000';
          function hex(x) { return ("0" + parseInt(x).toString(16)).slice(-2); }
          return "#" + hex(match[1]) + hex(match[2]) + hex(match[3]);
        }

        document.querySelectorAll('h1, h2, h3, h4, p, span, a, button, img, .icon-btn').forEach(el => {
          if(toolbar.contains(el)) return; 
          
          el.setAttribute('contenteditable', 'true');
          el.classList.add('editable-element');
          
          el.addEventListener('focus', (e) => {
            currentTarget = el;
            const computedStyle = window.getComputedStyle(el);
            foreColorPicker.value = rgbToHex(computedStyle.color);
            bgColorPicker.value = rgbToHex(computedStyle.backgroundColor);

            const rect = el.getBoundingClientRect();
            toolbar.style.display = 'flex';
            toolbar.style.top = (rect.top + window.scrollY - 60) + 'px';
            toolbar.style.left = Math.max(10, rect.left + window.scrollX) + 'px';
          });
        });

        document.addEventListener('click', (e) => {
          if (toolbar.style.display === 'flex' && !toolbar.contains(e.target) && e.target !== currentTarget) {
             toolbar.style.display = 'none';
             sendCleanHtml();
          }
        });

        document.getElementById('text-delete').addEventListener('click', () => {
          if (currentTarget) {
            currentTarget.remove();
            toolbar.style.display = 'none';
            sendCleanHtml();
          }
        });

        foreColorPicker.addEventListener('input', (e) => {
          document.execCommand('foreColor', false, e.target.value);
          sendCleanHtml();
        });

        bgColorPicker.addEventListener('input', (e) => {
          if(currentTarget) {
             currentTarget.style.backgroundColor = e.target.value;
             // Limpa o gradiente se houver, para que a cor sólida funcione
             currentTarget.style.backgroundImage = 'none'; 
             sendCleanHtml();
          }
        });

        document.getElementById('text-size').addEventListener('change', (e) => {
          document.execCommand('fontSize', false, e.target.value);
          sendCleanHtml();
        });

        document.getElementById('text-font').addEventListener('change', (e) => {
          document.execCommand('fontName', false, e.target.value);
          sendCleanHtml();
        });
      });
    <\/script>
  `;
  
  return clean.replace(/<\/body>/i, `${editorScript}</body>`);
};

const App: React.FC = () => {
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [aiContent, setAiContent] = useState<any>(null);
  
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loggedUserEmail, setLoggedUserEmail] = useState<string | null>(auth.currentUser?.email || null);
  const [savedProjects, setSavedProjects] = useState<any[]>([]);
  
  const [activeTab, setActiveTab] = useState<'geral' | 'dominio'>('geral');
  const [currentProjectSlug, setCurrentProjectSlug] = useState<string | null>(null);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // MODAL DE SUCESSO DE PUBLICAÇÃO
  const [publishModalUrl, setPublishModalUrl] = useState<string | null>(null);
  
  const [officialDomain, setOfficialDomain] = useState('');
  const [registerLater, setRegisterLater] = useState(false);

  const [formData, setFormData] = useState({
    businessName: '', description: '', whatsapp: '', instagram: '', facebook: '', tiktok: '',
    ifood: '', noveNove: '', keeta: '', phone: '', email: '', address: '', mapEmbed: '',
    showForm: true, layoutStyle: 'layout_split_duplo', colorId: 'cyberpunk', logoBase64: ''
  });

  useEffect(() => {
    if (aiContent) {
      setGeneratedHtml(renderTemplate(aiContent, formData));
    }
  }, [formData.layoutStyle, formData.colorId, formData.logoBase64, formData.whatsapp, formData.instagram, formData.facebook, formData.tiktok, formData.ifood, formData.noveNove, formData.keeta, formData.showForm, formData.address, formData.mapEmbed, formData.phone, formData.email]);

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
      html = html.replace(/\[\[LOGO_AREA\]\]/g, `<img src="${data.logoBase64}" class="h-12 w-auto object-contain transition-transform duration-500 hover:scale-110" alt="Logo" />`);
    } else {
      html = html.replace(/\[\[LOGO_AREA\]\]/g, `<span class="font-black tracking-tighter text-xl uppercase">${data.businessName || 'Sua Empresa'}</span>`);
    }

    const actionBtn = (label: string, icon: string, href: string, classes: string) => `<a href="${href}" target="_blank" class="icon-btn ${classes} shadow-lg" title="${label}" aria-label="${label}"><i class="${icon}"></i></a>`;

    replaceAll('[[WHATSAPP_BTN]]', data.whatsapp ? actionBtn('WhatsApp', 'fab fa-whatsapp', `https://wa.me/${data.whatsapp.replace(/\D/g, '')}`, 'bg-emerald-500 text-white') : '');
    replaceAll('[[INSTAGRAM_BTN]]', data.instagram ? actionBtn('Instagram', 'fab fa-instagram', `https://instagram.com/${data.instagram.replace('@', '')}`, 'bg-pink-600 text-white') : '');
    replaceAll('[[FACEBOOK_BTN]]', data.facebook ? actionBtn('Facebook', 'fab fa-facebook-f', data.facebook.startsWith('http') ? data.facebook : `https://${data.facebook}`, 'bg-blue-600 text-white') : '');
    replaceAll('[[TIKTOK_BTN]]', data.tiktok ? actionBtn('TikTok', 'fab fa-tiktok', data.tiktok.startsWith('http') ? data.tiktok : `https://${data.tiktok}`, 'bg-slate-900 text-white') : '');
    replaceAll('[[IFOOD_BTN]]', data.ifood ? actionBtn('iFood', 'fas fa-bag-shopping', data.ifood.startsWith('http') ? data.ifood : `https://${data.ifood}`, 'bg-red-600 text-white') : '');
    replaceAll('[[NOVE_NOVE_BTN]]', data.noveNove ? actionBtn('99 Food', 'fas fa-motorcycle', data.noveNove.startsWith('http') ? data.noveNove : `https://${data.noveNove}`, 'bg-yellow-500 text-white') : '');
    replaceAll('[[KEETA_BTN]]', data.keeta ? actionBtn('Keeta', 'fas fa-store', data.keeta.startsWith('http') ? data.keeta : `https://${data.keeta}`, 'bg-orange-600 text-white') : '');

    const mapCode = data.mapEmbed ? `<div class="overflow-hidden rounded-xl shadow-xl mt-4 map-container"><iframe src="${data.mapEmbed}" width="100%" height="220" style="border:0;" loading="lazy"></iframe></div>` : '';
    replaceAll('[[MAP_AREA]]', mapCode);
    
    // AQUI ENTRA O NOVO BOTÃO COM GRADIENTE
    const formCode = data.showForm ? `<form class="space-y-4 ux-form"><input class="w-full border border-slate-300/30 bg-transparent rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[${colors.c4}] transition-all" placeholder="Seu nome" /><input class="w-full border border-slate-300/30 bg-transparent rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[${colors.c4}] transition-all" placeholder="Seu email" /><textarea class="w-full border border-slate-300/30 bg-transparent rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[${colors.c4}] transition-all" rows="4" placeholder="Sua mensagem"></textarea><button type="button" class="btn-primary w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all shadow-lg text-white" style="background: linear-gradient(135deg, ${colors.c4}, ${colors.c5}, ${colors.c6}); border: none;">Enviar mensagem</button></form>` : '';
    replaceAll('[[CONTACT_FORM]]', formCode);

    const uxStyles = `
      <style id="ux-style">
        html { scroll-behavior: smooth; }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        h1, h2 { animation: fadeInUp 0.8s cubic-bezier(0.25, 0.8, 0.25, 1) forwards; }
        p, h3 { animation: fadeInUp 1s cubic-bezier(0.25, 0.8, 0.25, 1) forwards; }
        
        button, .btn-primary, .icon-btn, a {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        }
        button:hover, .btn-primary:hover, .icon-btn:hover {
          transform: translateY(-5px) scale(1.03) !important;
          filter: brightness(1.15);
          box-shadow: 0 15px 25px -5px rgba(0,0,0,0.3) !important;
        }
        button:active, .icon-btn:active {
          transform: translateY(0) scale(0.98) !important;
        }

        .ux-form, .map-container, section > div > div {
          transition: transform 0.4s ease, box-shadow 0.4s ease;
        }
        .ux-form:hover, .map-container:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 30px -10px rgba(0,0,0,0.2) !important;
        }
      </style>
    `;

    let finalHtml = html.replace('</head>', `${uxStyles}</head>`);
    return finalHtml; 
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
    
    if (!currentProjectSlug && !registerLater && !officialDomain) {
      setActiveTab('dominio');
      return alert("Por favor, configure seu domínio ou marque a opção 'Configurar depois' na aba de Domínio Oficial.");
    }
    
    setIsSavingProject(true);
    try {
      const htmlToSave = cleanHtmlForPublishing(generatedHtml);

      if (currentProjectSlug) {
        const updateFn = httpsCallable(functions, 'updateSiteProject');
        await updateFn({ projectId: currentProjectSlug, projectSlug: currentProjectSlug, html: htmlToSave, formData, aiContent });
      } else {
        const cleanName = formData.businessName.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, '-');
        const internalDomain = `${cleanName}-${Math.random().toString(36).substring(2, 6)}`;
        
        const saveFn = httpsCallable(functions, 'saveSiteProject');
        const res: any = await saveFn({
          businessName: formData.businessName,
          officialDomain: registerLater ? "Pendente" : officialDomain,
          internalDomain: internalDomain,
          generatedHtml: htmlToSave, 
          formData, 
          aiContent,
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
      
      let publicUrl = res.data?.publishUrl || `https://${currentProjectSlug}.web.app`;
      if (!publicUrl.startsWith('http')) publicUrl = `https://${publicUrl}`;
      
      fetchProjects();
      
      // ABRE O MODAL LINDO NO LUGAR DO ALERT
      setPublishModalUrl(publicUrl);
      
    } catch (err: any) { alert('Erro ao publicar. O servidor pode estar provisionando sua infraestrutura.'); } 
    finally { setIsPublishing(false); }
  };

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
        setFormData({ businessName: '', description: '', whatsapp: '', instagram: '', facebook: '', tiktok: '', ifood: '', noveNove: '', keeta: '', phone: '', email: '', address: '', mapEmbed: '', showForm: true, layoutStyle: 'layout_split_duplo', colorId: 'cyberpunk', logoBase64: '' });
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
    setGeneratedHtml(cleanHtmlForPublishing(project.generatedHtml)); 
    setCurrentProjectSlug(project.projectSlug || project.id || null);
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
    zip.file('index.html', cleanHtmlForPublishing(generatedHtml)); 
    zip.generateAsync({ type: 'blob' }).then(c => saveAs(c, `${formData.businessName || 'site'}.zip`));
  };

  return (
    <div className="relative w-full h-screen bg-zinc-950 overflow-hidden font-sans text-white">
      {/* FRAME DO SITE */}
      <div className="absolute inset-0 z-0 bg-[#09090b]">
        {generatedHtml ? (
          <iframe srcDoc={getPreviewHtml(generatedHtml)} className="w-full h-full border-none bg-white" title="Preview Visual" />
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

      {/* BARRA FLUTUANTE DE SALVAR / PUBLICAR */}
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

      {/* MODAL DE SUCESSO DE PUBLICAÇÃO */}
      <AnimatePresence>
        {publishModalUrl && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-zinc-700 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center space-y-6"
            >
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-500/30">
                <CheckCircle size={40} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Site Publicado com Sucesso!</h2>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  A sua página já está online. Caso tenha configurado um domínio do Registro.br, pode demorar algumas horas para propagar.
                </p>
              </div>
              
              <div className="bg-black/50 p-3 rounded-xl border border-zinc-800 flex items-center justify-between gap-3 overflow-hidden">
                <code className="text-indigo-300 text-sm truncate flex-1 font-mono">{publishModalUrl}</code>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(publishModalUrl);
                    alert('Link copiado para a área de transferência!');
                  }}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-zinc-700"
                >
                  <Copy size={18} /> Copiar Link
                </button>
                <button 
                  onClick={() => window.open(publishModalUrl, '_blank')}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
                >
                  <ExternalLink size={18} /> Abrir Site
                </button>
              </div>
              <button onClick={() => setPublishModalUrl(null)} className="text-zinc-500 hover:text-zinc-300 font-medium text-sm mt-4 block w-full transition-colors">Fechar janela</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SIDEBAR COMPLETA E INTEGRADA */}
      <motion.div className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <AnimatePresence>
          {isMenuOpen ? (
            <motion.div initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} className="w-[92vw] max-w-[360px] bg-zinc-900/95 backdrop-blur-xl border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="flex justify-between items-center px-4 py-3 border-b border-zinc-700 flex-shrink-0">
                <h2 className="font-bold text-sm tracking-wide">{generatedHtml ? 'Configurações do Site' : 'Novo Projeto'}</h2>
                <button onClick={() => setIsMenuOpen(false)} className="hover:bg-zinc-700 p-1.5 rounded transition-colors"><Minimize2 size={18} /></button>
              </div>

              {/* TABS DE NAVEGAÇÃO */}
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

                    {generatedHtml && (
                      <div className="pt-5 border-t border-zinc-800 space-y-5">
                        
                        <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/30 text-xs text-emerald-300">
                          ✨ <strong>Dica Mágica:</strong> Clique em qualquer texto ou botão no site à direita para mudar suas cores individualmente!
                        </div>

                        {/* LAYOUT E CORES */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-500 uppercase">Estilo do Site</label>
                          <select className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-sm" value={formData.layoutStyle} onChange={e => {setFormData({ ...formData, layoutStyle: e.target.value }); setHasUnsavedChanges(true)}}>
                            {LAYOUT_STYLES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-500 uppercase">Temas (Gradientes 3D)</label>
                          <div className="grid grid-cols-5 gap-3">
                            {COLORS.map(c => (
                              <button 
                                key={c.id} 
                                onClick={() => { setFormData({ ...formData, colorId: c.id }); setHasUnsavedChanges(true); }} 
                                className={`w-10 h-10 rounded-full border-[3px] transition-all relative overflow-hidden ${formData.colorId === c.id ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'border-transparent opacity-60 hover:opacity-100'}`} 
                                title={c.name}
                              >
                                <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${c.c4}, ${c.c5}, ${c.c6})` }} />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* LOGO */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-500 uppercase flex justify-between">
                            <span>Sua Logomarca</span>
                            {formData.logoBase64 && <button onClick={() => { setFormData(p => ({ ...p, logoBase64: '' })); setHasUnsavedChanges(true); }} className="text-red-400 hover:text-red-300 text-[10px] font-bold">X Remover</button>}
                          </label>
                          {!formData.logoBase64 ? (
                            <label className="cursor-pointer border border-dashed border-zinc-600 hover:border-indigo-500 rounded-lg p-3 flex justify-center gap-2 text-xs text-zinc-400 transition-colors">
                              <Upload size={14} /> Fazer Upload
                              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                            </label>
                          ) : (
                            <div className="h-12 bg-zinc-900 border border-zinc-700 rounded-lg flex items-center justify-center overflow-hidden p-1">
                              <img src={formData.logoBase64} className="h-full object-contain" alt="Logo" />
                            </div>
                          )}
                        </div>

                        {/* ENDEREÇO E MAPA */}
                        <div className="space-y-3 pt-3 border-t border-zinc-800">
                          <label className="text-xs font-bold text-zinc-500 uppercase flex gap-1"><MapPin size={14} /> Contato e Localização</label>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <input className="w-full bg-black/40 border border-zinc-700 rounded-lg p-2.5 text-xs focus:border-emerald-500" placeholder="Telefone" value={formData.phone} onChange={e => {setFormData({ ...formData, phone: e.target.value }); setHasUnsavedChanges(true)}} />
                            <input className="w-full bg-black/40 border border-zinc-700 rounded-lg p-2.5 text-xs focus:border-emerald-500" placeholder="E-mail" value={formData.email} onChange={e => {setFormData({ ...formData, email: e.target.value }); setHasUnsavedChanges(true)}} />
                          </div>
                          
                          <input className="w-full bg-black/40 border border-zinc-700 rounded-lg p-2.5 text-xs focus:border-emerald-500" placeholder="Endereço (Ex: Rua Roma, 123 - Centro)" value={formData.address} onChange={e => {setFormData({ ...formData, address: e.target.value }); setHasUnsavedChanges(true)}} />
                          <input className="w-full bg-black/40 border border-zinc-700 rounded-lg p-2.5 text-xs focus:border-emerald-500" placeholder="Link Embed do Google Maps" value={formData.mapEmbed} onChange={e => {setFormData({ ...formData, mapEmbed: e.target.value }); setHasUnsavedChanges(true)}} />
                          
                          {/* TOGGLE MODERNO DE FORMULÁRIO */}
                          <div className="pt-2 flex items-center justify-between bg-black/30 p-3 rounded-lg border border-zinc-800">
                            <span className="text-xs font-medium text-zinc-300">Formulário no site</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" checked={formData.showForm} onChange={e => {setFormData({ ...formData, showForm: e.target.checked }); setHasUnsavedChanges(true)}} />
                              <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                          </div>
                        </div>

                        {/* REDES SOCIAIS E DELIVERY */}
                        <div className="space-y-3 pt-3 border-t border-zinc-800">
                          <label className="text-xs font-bold text-zinc-500 uppercase flex gap-1"><Phone size={14} /> Redes Sociais</label>
                          <input className="w-full bg-black/40 border border-zinc-700 rounded-lg p-2.5 text-xs focus:border-emerald-500" placeholder="WhatsApp (Apenas números)" value={formData.whatsapp} onChange={e => {setFormData({ ...formData, whatsapp: e.target.value }); setHasUnsavedChanges(true)}} />
                          <input className="w-full bg-black/40 border border-zinc-700 rounded-lg p-2.5 text-xs focus:border-emerald-500" placeholder="Instagram (@usuario)" value={formData.instagram} onChange={e => {setFormData({ ...formData, instagram: e.target.value }); setHasUnsavedChanges(true)}} />
                          <input className="w-full bg-black/40 border border-zinc-700 rounded-lg p-2.5 text-xs focus:border-emerald-500" placeholder="Facebook (Link completo)" value={formData.facebook} onChange={e => {setFormData({ ...formData, facebook: e.target.value }); setHasUnsavedChanges(true)}} />
                          <input className="w-full bg-black/40 border border-zinc-700 rounded-lg p-2.5 text-xs focus:border-emerald-500" placeholder="TikTok (Link completo)" value={formData.tiktok} onChange={e => {setFormData({ ...formData, tiktok: e.target.value }); setHasUnsavedChanges(true)}} />
                          
                          <label className="text-xs font-bold text-zinc-500 uppercase mt-4 block">Aplicativos de Delivery</label>
                          <input className="w-full bg-black/40 border border-zinc-700 rounded-lg p-2.5 text-xs focus:border-emerald-500" placeholder="iFood (Link)" value={formData.ifood} onChange={e => {setFormData({ ...formData, ifood: e.target.value }); setHasUnsavedChanges(true)}} />
                          <div className="grid grid-cols-2 gap-2">
                            <input className="w-full bg-black/40 border border-zinc-700 rounded-lg p-2.5 text-xs focus:border-emerald-500" placeholder="99 Food" value={formData.noveNove} onChange={e => {setFormData({ ...formData, noveNove: e.target.value }); setHasUnsavedChanges(true)}} />
                            <input className="w-full bg-black/40 border border-zinc-700 rounded-lg p-2.5 text-xs focus:border-emerald-500" placeholder="Keeta" value={formData.keeta} onChange={e => {setFormData({ ...formData, keeta: e.target.value }); setHasUnsavedChanges(true)}} />
                          </div>
                        </div>

                      </div>
                    )}
                  </>
                )}

                {/* ABA DOMÍNIO */}
                {activeTab === 'dominio' && generatedHtml && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                    {!currentProjectSlug ? (
                      <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/30">
                        <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2 mb-2"><Globe size={16}/> Qual será o endereço?</h4>
                        <p className="text-xs text-indigo-200/80 mb-4 leading-relaxed">
                          Antes de salvar, precisamos saber se você vai usar um domínio oficial (Registro.br).
                        </p>
                        <DomainChecker onDomainChange={(domain, isLater) => { setOfficialDomain(domain); setRegisterLater(isLater); }} />
                      </div>
                    ) : (
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
                
                {/* LISTAGEM DE PROJETOS SALVOS */}
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
