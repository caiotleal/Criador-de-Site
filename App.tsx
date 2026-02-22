import React, { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, functions } from './firebase';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket, Settings, Upload, Download, Loader2, Minimize2, RefreshCw, Briefcase, FileText, X, Phone, Globe, CheckCircle, Save, Trash2, LayoutDashboard, MapPin, Copy, ExternalLink, User, Image as ImageIcon
} from 'lucide-react';
import { TEMPLATES } from './components/templates';
import LoginPage from './components/LoginPage';
import DomainChecker from './components/DomainChecker';

const LAYOUT_STYLES = [
  { id: 'layout_modern_center', label: 'Centro Imponente', desc: 'Hero centralizado, animações verticais' },
  { id: 'layout_modern_split', label: 'Split Dinâmico', desc: 'Metades divididas com entradas laterais' },
  { id: 'layout_glass_grid', label: 'Grid em Vidro', desc: 'Containers invisíveis em formato grid' },
  { id: 'layout_minimal_elegance', label: 'Elegância Minimalista', desc: 'Foco total na tipografia e respiro' },
  { id: 'layout_dynamic_flow', label: 'Fluxo Contínuo', desc: 'Seções em zigue-zague com fade' },
];

const COLORS = [
  { id: 'obsidian', name: 'Obsidiana', c1: '#000000', c2: '#0a0a0a', c3: '#171717', c4: '#ffffff', c5: '#d4d4d8', c6: '#a1a1aa', c7: '#71717a', light: '#ffffff', dark: '#000000' },
  { id: 'slate', name: 'Ardósia', c1: '#020617', c2: '#0f172a', c3: '#1e293b', c4: '#3b82f6', c5: '#60a5fa', c6: '#93c5fd', c7: '#bfdbfe', light: '#f8fafc', dark: '#020617' },
  { id: 'forest', name: 'Floresta', c1: '#022c22', c2: '#064e3b', c3: '#065f46', c4: '#10b981', c5: '#34d399', c6: '#6ee7b7', c7: '#a7f3d0', light: '#ecfdf5', dark: '#022c22' },
  { id: 'wine', name: 'Vinho', c1: '#2a0510', c2: '#4c0519', c3: '#881337', c4: '#e11d48', c5: '#f43f5e', c6: '#fb7185', c7: '#fda4af', light: '#fff1f2', dark: '#2a0510' },
  { id: 'amethyst', name: 'Ametista', c1: '#170326', c2: '#2e1045', c3: '#4a1d6e', c4: '#9333ea', c5: '#a855f7', c6: '#c084fc', c7: '#d8b4fe', light: '#faf5ff', dark: '#170326' },
  { id: 'snow', name: 'Neve', c1: '#ffffff', c2: '#f4f4f5', c3: '#e4e4e7', c4: '#09090b', c5: '#27272a', c6: '#3f3f46', c7: '#52525b', light: '#09090b', dark: '#ffffff' },
  { id: 'sky', name: 'Céu Pálido', c1: '#f8fafc', c2: '#f1f5f9', c3: '#e2e8f0', c4: '#1d4ed8', c5: '#2563eb', c6: '#3b82f6', c7: '#60a5fa', light: '#020617', dark: '#ffffff' },
  { id: 'mint', name: 'Menta Suave', c1: '#f0fdf4', c2: '#dcfce7', c3: '#bbf7d0', c4: '#047857', c5: '#059669', c6: '#10b981', c7: '#34d399', light: '#022c22', dark: '#ffffff' },
  { id: 'peach', name: 'Pêssego', c1: '#fff7ed', c2: '#ffedd5', c3: '#fed7aa', c4: '#c2410c', c5: '#ea580c', c6: '#f97316', c7: '#fb923c', light: '#431407', dark: '#ffffff' },
  { id: 'lavender', name: 'Lavanda', c1: '#faf5ff', c2: '#f3e8ff', c3: '#e9d5ff', c4: '#6b21a8', c5: '#7e22ce', c6: '#9333ea', c7: '#a855f7', light: '#2e1045', dark: '#ffffff' },
];

const PROMO_HTML = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>SiteCraft - Criação Inteligente</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #050505; color: #ffffff; font-family: sans-serif; overflow-x: hidden; }
    .glass-card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.05); transition: transform 0.3s ease; }
    .glass-card:hover { transform: translateY(-5px); border-color: rgba(255, 255, 255, 0.1); }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    .animate-up { animation: fadeUp 1s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  </style>
</head>
<body class="antialiased selection:bg-blue-500 selection:text-white">
  <main class="pt-20 pb-24 px-6 md:px-12 max-w-7xl mx-auto flex flex-col justify-center min-h-screen relative">
    <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none"></div>
    <div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none"></div>

    <div class="relative z-10 animate-up text-center md:text-left max-w-3xl mb-16">
      <div class="inline-block px-4 py-1.5 rounded-full glass-card text-xs font-bold tracking-widest text-blue-400 mb-6 uppercase">O futuro da web</div>
      <h1 class="text-[3rem] md:text-[5.5rem] font-black leading-[0.9] tracking-tighter mb-6 uppercase italic">
        Sua presença digital em <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">segundos.</span>
      </h1>
      <p class="text-lg md:text-2xl text-white/60 font-light leading-relaxed">
        Não perca vendas por não estar no Google. A nossa inteligência artificial cria, escreve e publica o seu site automaticamente. Preencha o menu e veja a mágica acontecer.
      </p>
    </div>

    <div class="grid md:grid-cols-2 gap-8 relative z-10 animate-up" style="animation-delay: 0.2s;">
      <div class="glass-card p-10 md:p-12 rounded-[2.5rem] relative overflow-hidden group border-zinc-800">
        <h3 class="text-3xl font-black mb-2 italic uppercase">Teste Grátis</h3>
        <p class="text-white/50 mb-8">Veja o seu site pronto hoje mesmo.</p>
        <div class="text-5xl font-black mb-2">R$ 0 <span class="text-lg text-white/40 font-normal">/ 5 dias</span></div>
        <p class="text-sm text-blue-400 font-bold mb-8">Após 5 dias, o site é congelado.</p>
        <ul class="space-y-4 text-white/70">
          <li class="flex items-center gap-3"><span class="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs">✔</span> Geração por IA</li>
          <li class="flex items-center gap-3"><span class="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs">✔</span> Domínio gratuito (.web.app)</li>
        </ul>
      </div>

      <div class="glass-card p-10 md:p-12 rounded-[2.5rem] relative overflow-hidden border-indigo-500/30 bg-indigo-950/10">
        <div class="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-black tracking-widest px-6 py-2 rounded-bl-3xl uppercase">Mais Assinado</div>
        <h3 class="text-3xl font-black mb-2 italic uppercase text-indigo-400">Plano Anual</h3>
        <p class="text-white/50 mb-8">A solução definitiva para o seu negócio.</p>
        <div class="text-5xl font-black mb-2">R$ 499 <span class="text-lg text-white/40 font-normal">/ 1º ano</span></div>
        <p class="text-sm text-white/50 font-medium mb-8">Renovação garantida por apenas R$ 100/ano.</p>
        <ul class="space-y-4 text-white/70">
          <li class="flex items-center gap-3"><span class="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs">★</span> 365 dias online sem interrupções</li>
          <li class="flex items-center gap-3"><span class="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs">★</span> Apontamento de Domínio (.com.br)</li>
        </ul>
      </div>
    </div>
  </main>
</body>
</html>
`;

const cleanHtmlForPublishing = (rawHtml: string | null) => {
  if (!rawHtml) return '';
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, 'text/html');
  const tb = doc.querySelector('#editor-toolbar'); if (tb) tb.remove();
  const sc = doc.querySelector('#editor-script'); if (sc) sc.remove();
  const st = doc.querySelector('#editor-style'); if (st) st.remove();
  doc.querySelectorAll('.editable-element').forEach(el => { el.removeAttribute('contenteditable'); el.classList.remove('editable-element'); if (el.getAttribute('class') === '') el.removeAttribute('class'); });
  return doc.documentElement.outerHTML;
};

const getPreviewHtml = (baseHtml: string | null) => {
  if (!baseHtml) return '';
  const clean = cleanHtmlForPublishing(baseHtml);
  const editorScript = `
    <style id="editor-style">
      .custom-editor-toolbar { position: absolute; display: none; background: #18181b; padding: 8px; border-radius: 10px; border: 1px solid #3f3f46; box-shadow: 0 10px 25px rgba(0,0,0,0.8); z-index: 99999; gap: 8px; align-items: center; font-family: sans-serif; }
      .color-picker-group { display: flex; align-items: center; gap: 4px; background: #27272a; padding: 2px 6px 2px 8px; border-radius: 6px; border: 1px solid #3f3f46; }
      .color-picker-label { color: #a1a1aa; font-size: 10px; font-weight: bold; }
      .custom-editor-toolbar input[type="color"] { width: 22px; height: 22px; border: none; cursor: pointer; background: transparent; padding: 0; }
      .custom-editor-toolbar select { background: #27272a; color: white; border: 1px solid #3f3f46; border-radius: 6px; padding: 4px 8px; font-size: 12px; outline: none; cursor: pointer; height: 30px; }
      .custom-editor-toolbar button#text-delete { background: #ef444415; border: 1px solid #ef444450; color: #ef4444; font-size: 12px; font-weight: bold; border-radius: 6px; cursor: pointer; padding: 0 10px; transition: all 0.2s; height: 30px; display: flex; align-items: center; gap: 4px; }
      .custom-editor-toolbar button#text-delete:hover { background: #ef4444; color: white; border-color: #ef4444; }
      .editable-element { transition: all 0.2s; outline: 2px dashed transparent; outline-offset: 2px; }
      .editable-element:hover { outline-color: rgba(160, 160, 160, 0.5); cursor: pointer; }
      .editable-element:focus { outline-color: #ffffff; }
    </style>
    <div id="editor-toolbar" class="custom-editor-toolbar">
      <div class="color-picker-group" title="Cor do Texto (Fonte)"><span class="color-picker-label">T</span><input type="color" id="fore-color-picker" /></div>
      <div class="color-picker-group" title="Cor do Fundo (Background)"><span class="color-picker-label">F</span><input type="color" id="bg-color-picker" /></div>
      <select id="text-size" title="Tamanho"><option value="1">Pequeno</option><option value="3" selected>Normal</option><option value="5">Grande</option><option value="7">Gigante</option></select>
      <select id="text-font" title="Fonte"><option value="Arial">Arial</option><option value="Georgia">Georgia</option><option value="Courier New">Courier</option><option value="Verdana">Verdana</option></select>
      <div style="width: 1px; height: 20px; background: #3f3f46; margin: 0 4px;"></div>
      <button id="text-delete" title="Apagar Elemento">✖ Excluir</button>
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
          clone.querySelectorAll('.editable-element').forEach(el => { el.removeAttribute('contenteditable'); el.classList.remove('editable-element'); if (el.getAttribute('class') === '') el.removeAttribute('class'); });
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
            foreColorPicker.value = rgbToHex(window.getComputedStyle(el).color);
            bgColorPicker.value = rgbToHex(window.getComputedStyle(el).backgroundColor);
            const rect = el.getBoundingClientRect();
            toolbar.style.display = 'flex';
            toolbar.style.top = (rect.top + window.scrollY - 60) + 'px';
            toolbar.style.left = Math.max(10, rect.left + window.scrollX) + 'px';
          });
        });
        document.addEventListener('click', (e) => {
          if (toolbar.style.display === 'flex' && !toolbar.contains(e.target) && e.target !== currentTarget) {
             toolbar.style.display = 'none'; sendCleanHtml();
          }
        });
        document.getElementById('text-delete').addEventListener('click', () => {
          if (currentTarget) { currentTarget.remove(); toolbar.style.display = 'none'; sendCleanHtml(); }
        });
        foreColorPicker.addEventListener('input', (e) => { document.execCommand('foreColor', false, e.target.value); sendCleanHtml(); });
        bgColorPicker.addEventListener('input', (e) => { if(currentTarget) { currentTarget.style.backgroundColor = e.target.value; currentTarget.style.backgroundImage = 'none'; sendCleanHtml(); } });
        document.getElementById('text-size').addEventListener('change', (e) => { document.execCommand('fontSize', false, e.target.value); sendCleanHtml(); });
        document.getElementById('text-font').addEventListener('change', (e) => { document.execCommand('fontName', false, e.target.value); sendCleanHtml(); });
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
  
  // CONTROLE DO FLUXO DE BOTÕES (UX)
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [needsDeployLocal, setNeedsDeployLocal] = useState(false); // Libera o Publicar após Salvar
  
  const [publishModalUrl, setPublishModalUrl] = useState<string | null>(null);
  const [officialDomain, setOfficialDomain] = useState('');
  const [registerLater, setRegisterLater] = useState(false);

  const [formData, setFormData] = useState({
    businessName: '', description: '', 
    whatsapp: '', instagram: '', facebook: '', tiktok: '', youtube: '', linkedin: '',
    ifood: '', noveNove: '', keeta: '', zeDelivery: '', rappi: '',
    phone: '', email: '', address: '', mapEmbed: '',
    showForm: true, layoutStyle: 'layout_modern_center', colorId: 'obsidian', logoBase64: '', heroImageBase64: ''
  });

  useEffect(() => {
    if (aiContent) {
      setGeneratedHtml(renderTemplate(aiContent, formData));
    }
  }, [formData]);

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
    let html = TEMPLATES[data.layoutStyle] || TEMPLATES['layout_modern_center'];
    const colors = COLORS.find(c => c.id === data.colorId) || COLORS[0];

    const replaceAll = (token: string, value: string) => { html = html.split(token).join(value); };
    const companyNameUpper = (data.businessName || 'Sua Empresa').toUpperCase();

    replaceAll('{{BUSINESS_NAME}}', companyNameUpper);
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

    // LOGO E FAVICON
    let headInjection = '';
    if (data.logoBase64) {
      headInjection = `<link rel="icon" type="image/png" href="${data.logoBase64}">`;
      html = html.replace(/\[\[LOGO_AREA\]\]/g, `<img src="${data.logoBase64}" class="h-10 md:h-12 w-auto object-contain transition-transform hover:scale-105" alt="Logo" />`);
    } else {
      html = html.replace(/\[\[LOGO_AREA\]\]/g, `<span class="font-black tracking-tighter text-xl uppercase">${companyNameUpper}</span>`);
    }

    // IMAGEM PRINCIPAL (HERO MEDIA) NO LUGAR DO CONTAINER VAZIO
    if (data.heroImageBase64) {
      // Injeta nos templates que possuem área de imagem desenhada (Split e Flow)
      const imgTag = `<img src="${data.heroImageBase64}" class="w-full h-full object-cover opacity-80" alt="Destaque" />`;
      html = html.replace(/<div class="absolute inset-0 bg-gradient-to-tr from-\[\{\{COLOR_4\}\}\]\/20 to-transparent"><\/div>/g, imgTag);
      html = html.replace(/<div class="h-64 md:h-80 ux-glass rounded-\[2rem\] reveal-right"><\/div>/g, `<div class="h-64 md:h-80 ux-glass rounded-[2rem] reveal-right overflow-hidden">${imgTag}</div>`);
    }

    const actionBtn = (label: string, icon: string, href: string, classes: string) => `<a href="${href}" target="_blank" class="icon-btn ${classes} shadow-sm" title="${label}" aria-label="${label}"><i class="${icon}"></i></a>`;

    // REDES SOCIAIS COMPLETAS
    replaceAll('[[WHATSAPP_BTN]]', data.whatsapp ? actionBtn('WhatsApp', 'fab fa-whatsapp', `https://wa.me/${data.whatsapp.replace(/\D/g, '')}`, 'bg-[#25D366] text-white') : '');
    replaceAll('[[INSTAGRAM_BTN]]', data.instagram ? actionBtn('Instagram', 'fab fa-instagram', `https://instagram.com/${data.instagram.replace('@', '')}`, 'bg-[#E1306C] text-white') : '');
    replaceAll('[[FACEBOOK_BTN]]', data.facebook ? actionBtn('Facebook', 'fab fa-facebook-f', data.facebook.startsWith('http') ? data.facebook : `https://${data.facebook}`, 'bg-[#1877F2] text-white') : '');
    replaceAll('[[TIKTOK_BTN]]', data.tiktok ? actionBtn('TikTok', 'fab fa-tiktok', data.tiktok.startsWith('http') ? data.tiktok : `https://${data.tiktok}`, 'bg-[#000000] text-white border border-white/20') : '');
    replaceAll('[[YOUTUBE_BTN]]', data.youtube ? actionBtn('YouTube', 'fab fa-youtube', data.youtube.startsWith('http') ? data.youtube : `https://${data.youtube}`, 'bg-[#FF0000] text-white') : '');
    replaceAll('[[LINKEDIN_BTN]]', data.linkedin ? actionBtn('LinkedIn', 'fab fa-linkedin-in', data.linkedin.startsWith('http') ? data.linkedin : `https://${data.linkedin}`, 'bg-[#0077b5] text-white') : '');

    // APPS DE DELIVERY
    replaceAll('[[IFOOD_BTN]]', data.ifood ? actionBtn('iFood', 'fas fa-motorcycle', data.ifood.startsWith('http') ? data.ifood : `https://${data.ifood}`, 'bg-[#EA1D2C] text-white') : '');
    replaceAll('[[NOVE_NOVE_BTN]]', data.noveNove ? actionBtn('99 Food', 'fas fa-utensils', data.noveNove.startsWith('http') ? data.noveNove : `https://${data.noveNove}`, 'bg-[#FFC700] text-black') : '');
    replaceAll('[[KEETA_BTN]]', data.keeta ? actionBtn('Keeta', 'fas fa-store', data.keeta.startsWith('http') ? data.keeta : `https://${data.keeta}`, 'bg-[#FF4B2B] text-white') : '');
    replaceAll('[[ZE_DELIVERY_BTN]]', data.zeDelivery ? actionBtn('Zé Delivery', 'fas fa-beer', data.zeDelivery.startsWith('http') ? data.zeDelivery : `https://${data.zeDelivery}`, 'bg-[#FFD700] text-black') : '');
    replaceAll('[[RAPPI_BTN]]', data.rappi ? actionBtn('Rappi', 'fas fa-box', data.rappi.startsWith('http') ? data.rappi : `https://${data.rappi}`, 'bg-[#FF4500] text-white') : '');

    const mapCode = data.mapEmbed ? `<div class="overflow-hidden rounded-[2rem] mt-6 map-container ux-glass"><iframe src="${data.mapEmbed}" width="100%" height="240" style="border:0;" loading="lazy"></iframe></div>` : '';
    replaceAll('[[MAP_AREA]]', mapCode);
    
    // FORMULÁRIO COM TOGGLE
    const formCode = data.showForm ? `<form class="space-y-4 ux-form ux-glass p-8 md:p-12 rounded-[2rem]"><input class="w-full bg-[${colors.c1}] border border-[${colors.c3}] rounded-xl p-4 text-sm focus:outline-none focus:border-[${colors.c4}] transition-all placeholder:text-white/30 text-white" placeholder="Seu nome" /><input class="w-full bg-[${colors.c1}] border border-[${colors.c3}] rounded-xl p-4 text-sm focus:outline-none focus:border-[${colors.c4}] transition-all placeholder:text-white/30 text-white" placeholder="Seu email" /><textarea class="w-full bg-[${colors.c1}] border border-[${colors.c3}] rounded-xl p-4 text-sm focus:outline-none focus:border-[${colors.c4}] transition-all placeholder:text-white/30 text-white" rows="4" placeholder="Sua mensagem"></textarea><button type="button" class="btn-primary w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all text-[${colors.c1}]" style="background-color: ${colors.c7}; border: none;">Enviar mensagem</button></form>` : '';
    replaceAll('[[CONTACT_FORM]]', formCode);

    return html.replace('</head>', `${headInjection}</head>`);
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

  const handleHeroImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(p => ({ ...p, heroImageBase64: reader.result as string }));
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
        await updateFn({ targetId: currentProjectSlug, html: htmlToSave, formData, aiContent });
      } else {
        const cleanName = formData.businessName.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, '-');
        const internalDomain = `${cleanName}-${Math.random().toString(36).substring(2, 6)}`;
        const saveFn = httpsCallable(functions, 'saveSiteProject');
        const res: any = await saveFn({
          businessName: formData.businessName, officialDomain: registerLater ? "Pendente" : officialDomain,
          internalDomain, generatedHtml: htmlToSave, formData, aiContent,
        });
        if (res.data?.projectSlug) setCurrentProjectSlug(res.data.projectSlug);
      }
      setHasUnsavedChanges(false);
      setNeedsDeployLocal(true); // SALVOU, AGORA LIBERA O BOTÃO DE PUBLICAR
      fetchProjects();
    } catch (err: any) { alert('Erro ao salvar o site.'); } 
    finally { setIsSavingProject(false); }
  };

  const handlePublishSite = async () => {
    setIsPublishing(true);
    try {
      const publishFn = httpsCallable(functions, 'publishUserProject');
      const res: any = await publishFn({ targetId: currentProjectSlug });
      let publicUrl = res.data?.publishUrl || `https://${currentProjectSlug}.web.app`;
      if (!publicUrl.startsWith('http')) publicUrl = `https://${publicUrl}`;
      fetchProjects();
      setNeedsDeployLocal(false); // PUBLICOU, AGORA DESABILITA ATÉ TER NOVA ALTERAÇÃO
      setPublishModalUrl(publicUrl);
    } catch (err: any) { alert('Erro ao publicar: ' + err.message); } 
    finally { setIsPublishing(false); }
  };

  const handleDeleteSite = async (projectId: string) => {
    if (!window.confirm("Atenção! Esta ação apagará definitivamente o seu site do ar. Tem certeza absoluta?")) return;
    try {
      const deleteFn = httpsCallable(functions, 'deleteUserProject');
      await deleteFn({ targetId: projectId });
      alert("Site excluído com sucesso.");
      if (projectId === currentProjectSlug) {
        setGeneratedHtml(null); setCurrentProjectSlug(null); setHasUnsavedChanges(false); setNeedsDeployLocal(false); setActiveTab('geral');
        setFormData({ businessName: '', description: '', whatsapp: '', instagram: '', facebook: '', tiktok: '', youtube: '', linkedin: '', ifood: '', noveNove: '', keeta: '', zeDelivery: '', rappi: '', phone: '', email: '', address: '', mapEmbed: '', showForm: true, layoutStyle: 'layout_modern_center', colorId: 'obsidian', logoBase64: '', heroImageBase64: '' });
      }
      fetchProjects();
    } catch (error) { alert("Erro ao excluir o site."); }
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
    setNeedsDeployLocal(project.needsDeploy || false);
    setActiveTab('geral');
  };

  const handleLogout = async () => {
    await signOut(auth);
    setSavedProjects([]); setCurrentProjectSlug(null); setGeneratedHtml(null);
  };

  const handleLoginSubmit = async (email: string, password: string) => {
    try { await signInWithEmailAndPassword(auth, email, password); } 
    catch { await createUserWithEmailAndPassword(auth, email, password); }
    setIsLoginOpen(false);
  };

  const handleDownloadZip = () => {
    if (!generatedHtml) return;
    const zip = new JSZip();
    zip.file('index.html', cleanHtmlForPublishing(generatedHtml)); 
    zip.generateAsync({ type: 'blob' }).then(c => saveAs(c, `${formData.businessName || 'site'}.zip`));
  };

  const getStatusBadge = (project: any) => {
    if (project.status === 'frozen') return <span className="text-[9px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold ml-2">CONGELADO</span>;
    if (project.expiresAt) {
      const daysLeft = Math.ceil((new Date(project.expiresAt._seconds * 1000).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      if (daysLeft <= 0) return <span className="text-[9px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold ml-2">EXPIRADO</span>;
      if (project.published && !project.needsDeploy) {
        if (daysLeft <= 5) return <span className="text-[9px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full font-bold ml-2">TRIAL ({daysLeft}d)</span>;
        return <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold ml-2">PUBLICADO</span>;
      }
    }
    return <span className="text-[9px] bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full font-bold ml-2">RASCUNHO</span>;
  };

  return (
    <div className="relative w-full h-screen bg-zinc-950 overflow-hidden font-sans text-white">
      
      {/* FRAME DO SITE OU LANDING PAGE DE VENDAS */}
      <div className="absolute inset-0 z-0 bg-[#050505]">
        <iframe 
          srcDoc={generatedHtml ? getPreviewHtml(generatedHtml) : PROMO_HTML} 
          className="w-full h-full border-none bg-transparent" 
          title="Visão Principal" 
        />
      </div>

      {/* LOGIN DISCRETO NO TOPO DIREITO (ÍCONE PEQUENO) */}
      <div className="absolute top-4 right-6 z-[85]">
        {!loggedUserEmail ? (
          <button onClick={() => setIsLoginOpen(true)} className="w-10 h-10 bg-black/50 hover:bg-black/80 backdrop-blur-md text-zinc-400 hover:text-white rounded-full transition-colors flex items-center justify-center border border-white/10" title="Acessar Conta">
            <User size={18}/>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-zinc-400 text-xs shadow-xl">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="max-w-[100px] truncate">{loggedUserEmail}</span>
            <button onClick={handleLogout} className="ml-1 hover:text-red-400 transition-colors" title="Sair"><X size={14}/></button>
          </div>
        )}
      </div>

      <LoginPage isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSubmit={handleLoginSubmit} />

      {/* MODAL DE SUCESSO DE PUBLICAÇÃO */}
      <AnimatePresence>
        {publishModalUrl && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-zinc-900 border border-zinc-700 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-500/30"><CheckCircle size={40} /></div>
              <div><h2 className="text-2xl font-bold text-white mb-2">Site Publicado!</h2><p className="text-zinc-400 text-sm leading-relaxed">A sua página já está online.</p></div>
              <div className="bg-black/50 p-3 rounded-xl border border-zinc-800 flex items-center justify-between gap-3 overflow-hidden"><code className="text-indigo-300 text-sm truncate flex-1 font-mono">{publishModalUrl}</code></div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { navigator.clipboard.writeText(publishModalUrl); alert('Link copiado!'); }} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-zinc-700"><Copy size={18} /> Copiar Link</button>
                <button onClick={() => window.open(publishModalUrl, '_blank')} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"><ExternalLink size={18} /> Abrir Site</button>
              </div>
              <button onClick={() => setPublishModalUrl(null)} className="text-zinc-500 hover:text-zinc-300 font-medium text-sm mt-4 block w-full transition-colors">Fechar janela</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MENU FLUTUANTE NA DIREITA */}
      <motion.div className="fixed top-20 bottom-4 right-4 z-[90] flex flex-col items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <AnimatePresence>
          {isMenuOpen ? (
            <motion.div initial={{ x: 400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 400, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="w-[92vw] max-w-[360px] bg-zinc-900/95 backdrop-blur-xl border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full">
              
              <div className="flex justify-between items-center px-5 py-4 border-b border-zinc-800 flex-shrink-0">
                <h2 className="font-bold text-sm tracking-wide text-zinc-200">{generatedHtml ? 'Painel de Edição' : 'Novo Projeto'}</h2>
                <button onClick={() => setIsMenuOpen(false)} className="hover:bg-zinc-800 text-zinc-400 hover:text-white p-1.5 rounded transition-colors"><Minimize2 size={16} /></button>
              </div>

              {generatedHtml && (
                <div className="flex border-b border-zinc-800 text-[11px] font-bold uppercase tracking-wider flex-shrink-0">
                  <button onClick={() => setActiveTab('geral')} className={`flex-1 py-3.5 text-center transition-colors ${activeTab === 'geral' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-400/5' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}>Visual & Dados</button>
                  <button onClick={() => setActiveTab('dominio')} className={`flex-1 py-3.5 text-center transition-colors ${activeTab === 'dominio' ? 'text-indigo-400 border-b-2 border-indigo-400 bg-indigo-400/5' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}>Domínio & Acesso</button>
                </div>
              )}

              <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-6 pb-6">
                
                {activeTab === 'geral' && (
                  <>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase flex gap-2 mb-1.5"><Briefcase size={12} /> Nome do Negócio</label>
                        <input className="w-full bg-black/40 border border-zinc-700 rounded-xl p-3 text-sm focus:border-emerald-500 transition-colors" placeholder="Ex: Studio Code" value={formData.businessName} onChange={e => {setFormData({ ...formData, businessName: e.target.value }); setHasUnsavedChanges(true)}} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase flex gap-2 mb-1.5"><FileText size={12} /> Ideia Principal</label>
                        <textarea className="w-full h-20 bg-black/40 border border-zinc-700 rounded-xl p-3 text-sm resize-none focus:border-emerald-500 transition-colors" placeholder="Descreva seus serviços..." value={formData.description} onChange={e => {setFormData({ ...formData, description: e.target.value }); setHasUnsavedChanges(true)}} />
                      </div>
                    </div>

                    {/* BOTÃO MÁGICO DA IA */}
                    <button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20">
                      {isGenerating ? <Loader2 className="animate-spin" /> : <RefreshCw size={16} />} {generatedHtml ? 'Recriar Site c/ IA' : 'Gerar Meu Site'}
                    </button>

                    {/* FLUXO DE UX: BOTÕES DE SALVAR E PUBLICAR EMBUTIDOS AQUI */}
                    {generatedHtml && (
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        {/* BOTÃO ATUALIZAR/SALVAR: Só ativa se houver mudanças */}
                        <button 
                          onClick={handleSaveOrUpdateSite} 
                          disabled={!hasUnsavedChanges && currentProjectSlug !== null}
                          title={(!hasUnsavedChanges && currentProjectSlug) ? "Altere alguma cor, texto ou campo abaixo para habilitar." : "Salvar projeto atual no banco de dados."}
                          className={`py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 
                            ${hasUnsavedChanges || !currentProjectSlug ? 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600 shadow-md' : 'bg-zinc-900/50 text-zinc-600 border border-transparent cursor-not-allowed'}`}
                        >
                          {isSavingProject ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save size={14} />}
                          {currentProjectSlug ? 'Atualizar' : 'Salvar'}
                        </button>
                        
                        {/* BOTÃO PUBLICAR: Só ativa após Atualizar e se não houver pendências */}
                        <button 
                          onClick={handlePublishSite} 
                          disabled={!needsDeployLocal || hasUnsavedChanges}
                          title={hasUnsavedChanges ? "Clique em 'Atualizar' primeiro para salvar as mudanças." : (!needsDeployLocal ? "O site já está publicado na versão mais recente." : "Colocar as alterações ao vivo na internet!")}
                          className={`py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 
                            ${needsDeployLocal && !hasUnsavedChanges ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-zinc-900/50 text-zinc-600 border border-transparent cursor-not-allowed'}`}
                        >
                          {isPublishing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Globe size={14} />} Publicar
                        </button>
                      </div>
                    )}

                    {generatedHtml && (
                      <div className="pt-6 border-t border-zinc-800 space-y-6">
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-zinc-500 uppercase">Estilo do Site</label>
                          <select className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-sm focus:border-emerald-500 outline-none" value={formData.layoutStyle} onChange={e => {setFormData({ ...formData, layoutStyle: e.target.value }); setHasUnsavedChanges(true)}}>
                            {LAYOUT_STYLES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                          </select>
                        </div>

                        <div className="space-y-3">
                          <label className="text-xs font-bold text-zinc-500 uppercase">Cores (Tom sobre Tom)</label>
                          <div className="grid grid-cols-5 gap-3">
                            {COLORS.map(c => (
                              <button key={c.id} onClick={() => { setFormData({ ...formData, colorId: c.id }); setHasUnsavedChanges(true); }} className={`w-full aspect-square rounded-full transition-all relative overflow-hidden ${formData.colorId === c.id ? 'ring-2 ring-emerald-500 scale-110' : 'opacity-60 hover:opacity-100'} ring-offset-2 ring-offset-zinc-900`} title={c.name}>
                                <div className="absolute inset-0" style={{ backgroundColor: c.c1 }} />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* UPLOAD DE LOGO */}
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-zinc-500 uppercase flex justify-between items-center">
                            <span>Logomarca (Ícone/Favicon)</span>
                            {formData.logoBase64 && <button onClick={() => { setFormData(p => ({ ...p, logoBase64: '' })); setHasUnsavedChanges(true); }} className="text-red-400 hover:text-red-300 text-[10px] font-bold px-2 py-1 bg-red-500/10 rounded">Remover</button>}
                          </label>
                          {!formData.logoBase64 ? (
                            <label className="cursor-pointer border-2 border-dashed border-zinc-700 hover:border-emerald-500 bg-zinc-900/50 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-xs text-zinc-400 transition-colors"><Upload size={18} /> Subir Logo<input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" /></label>
                          ) : (
                            <div className="h-16 bg-zinc-900 border border-zinc-700 rounded-xl flex items-center justify-center overflow-hidden p-2"><img src={formData.logoBase64} className="h-full object-contain" alt="Logo" /></div>
                          )}
                        </div>

                        {/* UPLOAD DE IMAGEM PRINCIPAL */}
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-zinc-500 uppercase flex justify-between items-center">
                            <span>Imagem de Destaque (Opcional)</span>
                            {formData.heroImageBase64 && <button onClick={() => { setFormData(p => ({ ...p, heroImageBase64: '' })); setHasUnsavedChanges(true); }} className="text-red-400 hover:text-red-300 text-[10px] font-bold px-2 py-1 bg-red-500/10 rounded">Remover</button>}
                          </label>
                          {!formData.heroImageBase64 ? (
                            <label className="cursor-pointer border-2 border-dashed border-zinc-700 hover:border-indigo-500 bg-zinc-900/50 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-xs text-zinc-400 transition-colors"><ImageIcon size={18} /> Subir Foto do Local/Produto<input type="file" accept="image/*" onChange={handleHeroImageUpload} className="hidden" /></label>
                          ) : (
                            <div className="h-24 bg-zinc-900 border border-zinc-700 rounded-xl flex items-center justify-center overflow-hidden p-1"><img src={formData.heroImageBase64} className="h-full w-full object-cover rounded-lg" alt="Destaque" /></div>
                          )}
                        </div>

                        <div className="space-y-4 pt-4 border-t border-zinc-800">
                          <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-zinc-800">
                            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">Formulário no Site</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" checked={formData.showForm} onChange={e => {setFormData({ ...formData, showForm: e.target.checked }); setHasUnsavedChanges(true)}} />
                              <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                          </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-zinc-800">
                          <label className="text-xs font-bold text-zinc-500 uppercase flex gap-2 items-center"><MapPin size={14} className="text-emerald-500" /> Contato e Localização</label>
                          <div className="grid grid-cols-2 gap-3">
                            <input className="w-full bg-black/40 border border-zinc-700 rounded-xl p-3 text-xs focus:border-emerald-500" placeholder="Telefone" value={formData.phone} onChange={e => {setFormData({ ...formData, phone: e.target.value }); setHasUnsavedChanges(true)}} />
                            <input className="w-full bg-black/40 border border-zinc-700 rounded-xl p-3 text-xs focus:border-emerald-500" placeholder="E-mail" value={formData.email} onChange={e => {setFormData({ ...formData, email: e.target.value }); setHasUnsavedChanges(true)}} />
                          </div>
                          <input className="w-full bg-black/40 border border-zinc-700 rounded-xl p-3 text-xs focus:border-emerald-500" placeholder="Endereço Físico" value={formData.address} onChange={e => {setFormData({ ...formData, address: e.target.value }); setHasUnsavedChanges(true)}} />
                          <input className="w-full bg-black/40 border border-zinc-700 rounded-xl p-3 text-xs focus:border-emerald-500" placeholder="Link do Google Maps" value={formData.mapEmbed} onChange={e => {setFormData({ ...formData, mapEmbed: e.target.value }); setHasUnsavedChanges(true)}} />
                        </div>

                        <div className="space-y-4 pt-4 border-t border-zinc-800">
                          <label className="text-xs font-bold text-zinc-500 uppercase flex gap-2 items-center"><Phone size={14} className="text-emerald-500" /> Redes Sociais Completas</label>
                          <div className="grid grid-cols-2 gap-3">
                            <input className="w-full bg-black/40 border border-zinc-700 rounded-xl p-3 text-xs focus:border-emerald-500" placeholder="WhatsApp (Números)" value={formData.whatsapp} onChange={e => {setFormData({ ...formData, whatsapp: e.target.value }); setHasUnsavedChanges(true)}} />
                            <input className="w-full bg-black/40 border border-zinc-700 rounded-xl p-3 text-xs focus:border-emerald-500" placeholder="Instagram (@usuario)" value={formData.instagram} onChange={e => {setFormData({ ...formData, instagram: e.target.value }); setHasUnsavedChanges(true)}} />
                            <input className="w-full bg-black/40 border border-zinc-700 rounded-xl p-3 text-xs focus:border-emerald-500" placeholder="Facebook (Link)" value={formData.facebook} onChange={e => {setFormData({ ...formData, facebook: e.target.value }); setHasUnsavedChanges(true)}} />
                            <input className="w-full bg-black/40 border border-zinc-700 rounded-xl p-3 text-xs focus:border-emerald-500" placeholder="TikTok (Link)" value={formData.tiktok} onChange={e => {setFormData({ ...formData, tiktok: e.target.value }); setHasUnsavedChanges(true)}} />
                            <input className="w-full bg-black/40 border border-zinc-700 rounded-xl p-3 text-xs focus:border-emerald-
