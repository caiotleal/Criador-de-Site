import React, { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, functions } from './firebase';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket, Settings, Upload, Download, Loader2, Minimize2, RefreshCw, Briefcase, FileText, X, Phone, Globe, CheckCircle, Save, Trash2, AlertCircle, LayoutDashboard, MapPin, Copy, ExternalLink, Zap, Star, ShieldCheck, CreditCard, User, LogIn, Info
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
  // DARK MODE
  { id: 'obsidian', name: 'Obsidiana', c1: '#000000', c2: '#0a0a0a', c3: '#171717', c4: '#ffffff', c5: '#d4d4d8', c6: '#a1a1aa', c7: '#71717a', light: '#ffffff', dark: '#000000' },
  { id: 'slate', name: 'Ardósia', c1: '#020617', c2: '#0f172a', c3: '#1e293b', c4: '#3b82f6', c5: '#60a5fa', c6: '#93c5fd', c7: '#bfdbfe', light: '#f8fafc', dark: '#020617' },
  { id: 'forest', name: 'Floresta', c1: '#022c22', c2: '#064e3b', c3: '#065f46', c4: '#10b981', c5: '#34d399', c6: '#6ee7b7', c7: '#a7f3d0', light: '#ecfdf5', dark: '#022c22' },
  { id: 'wine', name: 'Vinho', c1: '#2a0510', c2: '#4c0519', c3: '#881337', c4: '#e11d48', c5: '#f43f5e', c6: '#fb7185', c7: '#fda4af', light: '#fff1f2', dark: '#2a0510' },
  { id: 'amethyst', name: 'Ametista', c1: '#170326', c2: '#2e1045', c3: '#4a1d6e', c4: '#9333ea', c5: '#a855f7', c6: '#c084fc', c7: '#d8b4fe', light: '#faf5ff', dark: '#170326' },
  // LIGHT MODE
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
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SiteCraft - Criação Inteligente</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    html, body { -ms-overflow-style: none; scrollbar-width: none; background-color: #050505; color: #ffffff; font-family: sans-serif; overflow-x: hidden; }
    ::-webkit-scrollbar { display: none; }
    .glass-card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.05); transition: transform 0.3s ease; }
    .glass-card:hover { transform: translateY(-5px); border-color: rgba(255, 255, 255, 0.1); }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    .animate-up { animation: fadeUp 1s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  </style>
</head>
<body class="antialiased selection:bg-blue-500 selection:text-white">
  <main class="pt-24 pb-24 px-6 md:px-12 max-w-7xl mx-auto flex flex-col justify-center min-h-screen relative">
    <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none"></div>
    <div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none"></div>

    <div class="relative z-10 animate-up text-center md:text-left max-w-3xl mb-16">
      <div class="inline-block px-4 py-1.5 rounded-full glass-card text-xs font-bold tracking-widest text-blue-400 mb-6 uppercase">O futuro da web</div>
      <h1 class="text-[3rem] md:text-[5.5rem] font-black leading-[0.9] tracking-tighter mb-6 uppercase italic">
        Sua presença digital em <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">segundos.</span>
      </h1>
      <p class="text-lg md:text-2xl text-white/60 font-light leading-relaxed">
        Não perca vendas por não estar no Google. A nossa inteligência artificial cria, escreve e publica o seu site automaticamente. Preencha o menu ao lado e veja a mágica acontecer.
      </p>
    </div>

    <div class="grid md:grid-cols-2 gap-8 relative z-10 animate-up" style="animation-delay: 0.2s;">
      <div class="glass-card p-10 md:p-12 rounded-[2.5rem] relative overflow-hidden group">
        <h3 class="text-3xl font-black mb-2 italic uppercase">Teste Grátis</h3>
        <p class="text-white/50 mb-8">Veja o seu site pronto hoje mesmo.</p>
        <div class="text-5xl font-black mb-2">R$ 0 <span class="text-lg text-white/40 font-normal">/ 5 dias</span></div>
        <p class="text-sm text-blue-400 font-bold mb-8">Após 5 dias, o site é congelado.</p>
        <ul class="space-y-4 text-white/70">
          <li class="flex items-center gap-3"><span class="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs">✔</span> Geração por IA</li>
          <li class="flex items-center gap-3"><span class="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs">✔</span> Domínio gratuito (.web.app)</li>
          <li class="flex items-center gap-3"><span class="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs">✔</span> Formulário de Contato</li>
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
          <li class="flex items-center gap-3"><span class="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs">★</span> Alta velocidade e segurança Google</li>
        </ul>
      </div>
    </div>
  </main>
</body>
</html>
`;

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
      html, body { -ms-overflow-style: none; scrollbar-width: none; }
      ::-webkit-scrollbar { display: none; }
      
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
    </script>
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
  
  const [activeTab, setActiveTab] = useState<'geral' | 'dominio' | 'assinatura'>('geral');
  const [currentProjectSlug, setCurrentProjectSlug] = useState<string | null>(null);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const [publishModalUrl, setPublishModalUrl] = useState<string | null>(null);
  const [officialDomain, setOfficialDomain] = useState('');
  const [registerLater, setRegisterLater] = useState(false);

  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    businessName: '', description: '', whatsapp: '', instagram: '', facebook: '', tiktok: '',
    ifood: '', noveNove: '', keeta: '', phone: '', email: '', address: '', mapEmbed: '',
    showForm: true, layoutStyle: 'layout_modern_center', colorId: 'obsidian', logoBase64: ''
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
    
    replaceAll('{{ADDRESS}}', data.address || 'Endereço não informado');
    replaceAll('{{PHONE}}', data.phone || data.whatsapp || 'Telefone não informado');
    replaceAll('{{EMAIL}}', data.email || 'Email não informado');

    let headInjection = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">';
    
    if (data.logoBase64) {
      headInjection += `<link rel="icon" type="image/png" href="${data.logoBase64}">`;
      html = html.replace(/\[\[LOGO_AREA\]\]/g, `<img src="${data.logoBase64}" class="h-10 md:h-12 w-auto object-contain transition-transform hover:scale-105" alt="Logo" />`);
    } else {
      html = html.replace(/\[\[LOGO_AREA\]\]/g, `<span class="font-black tracking-tighter text-xl uppercase">${companyNameUpper}</span>`);
    }

    replaceAll('[[WHATSAPP_BTN]]', '');
    replaceAll('[[INSTAGRAM_BTN]]', '');
    replaceAll('[[FACEBOOK_BTN]]', '');
    replaceAll('[[TIKTOK_BTN]]', '');
    replaceAll('[[IFOOD_BTN]]', '');
    replaceAll('[[NOVE_NOVE_BTN]]', '');
    replaceAll('[[KEETA_BTN]]', '');

    let floatingHtml = '';
    const addFloatBtn = (icon: string, href: string, bg: string, color: string, label: string) => {
      floatingHtml += `<a href="${href}" target="_blank" class="float-btn" style="background-color: ${bg}; color: ${color};" title="${label}"><i class="${icon}"></i></a>`;
    };

    if (data.whatsapp) addFloatBtn('fab fa-whatsapp', `https://wa.me/${data.whatsapp.replace(/\D/g, '')}`, '#25D366', '#fff', 'WhatsApp');
    if (data.instagram) addFloatBtn('fab fa-instagram', `https://instagram.com/${data.instagram.replace('@', '')}`, '#E1306C', '#fff', 'Instagram');
    if (data.facebook) addFloatBtn('fab fa-facebook-f', data.facebook.startsWith('http') ? data.facebook : `https://${data.facebook}`, '#1877F2', '#fff', 'Facebook');
    if (data.tiktok) addFloatBtn('fab fa-tiktok', data.tiktok.startsWith('http') ? data.tiktok : `https://${data.tiktok}`, '#000000', '#fff', 'TikTok');
    if (data.ifood) addFloatBtn('fas fa-motorcycle', data.ifood.startsWith('http') ? data.ifood : `https://${data.ifood}`, '#EA1D2C', '#fff', 'iFood');
    if (data.noveNove) addFloatBtn('fas fa-car', data.noveNove.startsWith('http') ? data.noveNove : `https://${data.noveNove}`, '#FFC700', '#000', '99 Food');
    if (data.keeta) addFloatBtn('fas fa-store', data.keeta.startsWith('http') ? data.keeta : `https://${data.keeta}`, '#FF4B2B', '#fff', 'Keeta');

    if (floatingHtml) {
      const floatStyle = `
      <style>
        .floating-actions { position: fixed; bottom: 24px; right: 24px; display: flex; flex-direction: column; gap: 12px; z-index: 99999; }
        .float-btn { width: 52px; height: 52px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); transition: all 0.3s ease; text-decoration: none; outline: none; }
        .float-btn:hover { transform: scale(1.1) translateY(-3px); box-shadow: 0 8px 25px rgba(0,0,0,0.4); }
      </style>`;
      headInjection += floatStyle;
      html = html.replace('</body>', `<div class="floating-actions">${floatingHtml}</div></body>`);
    }

    const mapCode = data.mapEmbed ? `<div class="overflow-hidden rounded-[2rem] mt-6 map-container ux-glass"><iframe src="${data.mapEmbed}" width="100%" height="240" style="border:0;" loading="lazy"></iframe></div>` : '';
    replaceAll('[[MAP_AREA]]', mapCode);
    
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
        // Blindagem do Regex: Sem risco de hifens duplos
        const cleanName = formData.businessName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const internalDomain = `${cleanName}-${Math.random().toString(36).substring(2, 6)}`;
        const saveFn = httpsCallable(functions, 'saveSiteProject');
        const res: any = await saveFn({
          businessName: formData.businessName, officialDomain: registerLater ? "Pendente" : officialDomain,
          internalDomain, generatedHtml: htmlToSave, formData, aiContent,
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
      const res: any = await publishFn({ targetId: currentProjectSlug });
      
      let publicUrl = res.data?.publishUrl || `https://${currentProjectSlug}.web.app`;
      if (!publicUrl.startsWith('http')) publicUrl = `https://${publicUrl}`;
      
      fetchProjects();
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
        setGeneratedHtml(null); setCurrentProjectSlug(null); setHasUnsavedChanges(false); setActiveTab('geral');
        setFormData({ businessName: '', description: '', whatsapp: '', instagram: '', facebook: '', tiktok: '', ifood: '', noveNove: '', keeta: '', phone: '', email: '', address: '', mapEmbed: '', showForm: true, layoutStyle: 'layout_modern_center', colorId: 'obsidian', logoBase64: '' });
      }
      fetchProjects();
    } catch (error) { alert("Erro ao excluir o site."); }
  };

  // ------------------------------------------------------------------
  // CHECKOUT STRIPE VIA POP-UP (COM RASTREADOR DE ENVIO)
  // ------------------------------------------------------------------
  const handleStripeCheckout = (projectId: string) => {
    setCheckoutLoading(projectId);
    
    const stripePaymentLink = "https://buy.stripe.com/test_00w7sMfzDdJ8diU04I4wM00";
    const checkoutUrl = `${stripePaymentLink}?client_reference_id=${projectId}`;
    
    console.log("🚀 [FRONT-END] Iniciando Checkout da Stripe...");
    console.log("➡️ ID do Projeto Original:", projectId);
    console.log("🔗 URL Exata do Checkout:", checkoutUrl);
    
    const width = 500;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    window.open(
      checkoutUrl, 
      'StripeCheckout', 
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes,status=no,location=no,toolbar=no,menubar=no`
    );
    
    setCheckoutLoading(null);
  };
  // ------------------------------------------------------------------

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
    if (!project) return null;
    if (project.status === 'frozen') return <span className="text-[9px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold ml-2 border border-red-500/30">CONGELADO</span>;
    
    if (project.expiresAt) {
      const expirationDate = project.expiresAt._seconds ? project.expiresAt._seconds * 1000 : project.expiresAt.seconds * 1000;
      const daysLeft = Math.ceil((new Date(expirationDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      
      if (daysLeft <= 0) return <span className="text-[9px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold ml-2 border border-red-500/30">VENCIDO</span>;
      
      if (project.paymentStatus === 'paid') {
        return <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold ml-2 border border-emerald-500/30" title="Plano Anual Ativo">ATIVO ({daysLeft} dias restantes)</span>;
      } else {
        return <span className="text-[9px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full font-bold ml-2 border border-yellow-500/30 animate-pulse" title="Período de Teste">TRIAL ({daysLeft} dias restantes)</span>;
      }
    }
    return <span className="text-[9px] bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full font-bold ml-2">RASCUNHO</span>;
  };

  return (
    <>
      <style>{`
        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="w-full h-screen bg-[#050505] overflow-hidden font-sans text-white flex">
        
        {/* LEFT SIDE: PREVIEW DO SITE 100% LIMPO */}
        <div className="flex-1 relative h-full overflow-hidden bg-[#050505]">
          <iframe 
            srcDoc={generatedHtml ? getPreviewHtml(generatedHtml) : PROMO_HTML} 
            className="w-full h-full border-none bg-transparent" 
            title="Visão Principal" 
          />

          <AnimatePresence>
            {!isMenuOpen && (
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                onClick={() => setIsMenuOpen(true)} 
                className="absolute bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 rounded-full shadow-2xl flex items-center justify-center cursor-pointer ring-4 ring-black/20 transition-transform hover:scale-105 z-[90]"
              >
                <Settings className="text-white" size={26} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <LoginPage isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSubmit={handleLoginSubmit} />

        <AnimatePresence>
          {publishModalUrl && (
            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-zinc-900 border border-zinc-700 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center space-y-6"
              >
                <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-500/30">
                  <CheckCircle size={40} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Site Publicado com Sucesso!</h2>
                  <p className="text-zinc-400 text-sm leading-relaxed">A sua página já está online. Caso tenha configurado um domínio do Registro.br, pode demorar algumas horas para propagar.</p>
                </div>
                <div className="bg-black/50 p-3 rounded-xl border border-zinc-800 flex items-center justify-between gap-3 overflow-hidden">
                  <code className="text-indigo-300 text-sm truncate flex-1 font-mono">{publishModalUrl}</code>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => { navigator.clipboard.writeText(publishModalUrl); alert('Link copiado!'); }} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-zinc-700"><Copy size={18} /> Copiar Link</button>
                  <button onClick={() => window.open(publishModalUrl, '_blank')} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"><ExternalLink size={18} /> Abrir Site</button>
                </div>
                <button onClick={() => setPublishModalUrl(null)} className="text-zinc-500 hover:text-zinc-300 font-medium text-sm mt-4 block w-full transition-colors">Fechar janela</button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {isMenuOpen && (
            <motion.div 
              initial={{ width: 0, paddingLeft: 0, paddingRight: 0 }} 
              animate={{ width: 420, paddingLeft: 16, paddingRight: 24 }} 
              exit={{ width: 0, paddingLeft: 0, paddingRight: 0 }} 
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="flex-shrink-0 h-screen flex flex-col justify-center overflow-hidden relative z-50 bg-[#050505]"
            >
              <motion.div 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                transition={{ delay: 0.1 }}
                className="w-full h-[95vh] bg-[#0c0c0e] border border-zinc-800 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden relative"
              >
                <div className="flex justify-between items-center px-6 py-5 border-b border-zinc-800/50 flex-shrink-0">
                  <div className="font-black text-xl tracking-tighter uppercase italic text-white select-none">
                    SiteCraft
                  </div>
                  <div className="flex items-center gap-4">
                    {loggedUserEmail ? (
                      <button className="text-zinc-400 hover:text-emerald-400 transition-colors" title={`Logado como: ${loggedUserEmail}`}>
                        <User size={18} />
                      </button>
                    ) : (
                      <button onClick={() => setIsLoginOpen(true)} className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                        <LogIn size={16} /> Login
                      </button>
                    )}
                    <div className="w-px h-4 bg-zinc-800"></div>
                    <button onClick={() => setIsMenuOpen(false)} className="text-zinc-500 hover:text-white transition-colors" title="Esconder Painel">
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {generatedHtml && (
                  <div className="flex border-b border-zinc-800/50 text-[11px] font-bold uppercase tracking-wider flex-shrink-0">
                    <button onClick={() => setActiveTab('geral')} className={`flex-1 py-3.5 text-center transition-colors ${activeTab === 'geral' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-400/5' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'}`}>Visual & Dados</button>
                    
                    <button onClick={() => setActiveTab('dominio')} className={`flex-1 py-3.5 text-center transition-colors relative ${activeTab === 'dominio' ? 'text-indigo-400 border-b-2 border-indigo-400 bg-indigo-400/5' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'}`}>
                      Domínio
                      {(!officialDomain || officialDomain === 'Pendente' || registerLater) && (
                        <span className="absolute top-3 right-4 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                      )}
                    </button>

                    {currentProjectSlug && (
                      <button onClick={() => setActiveTab('assinatura')} className={`flex-1 py-3.5 text-center transition-colors ${activeTab === 'assinatura' ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-400/5' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'}`}>Pagamento</button>
                    )}
                  </div>
                )}

                <div className="p-6 overflow-y-auto flex-1 space-y-6 pb-6">
                  {activeTab === 'geral' && (
                    <>
                      {currentProjectSlug && (
                        <div className="group relative flex items-center justify-between bg-zinc-900 p-3.5 rounded-xl border border-zinc-800/80 -mt-2">
                          <div className="flex items-center gap-2 cursor-help">
                            <Info size={14} className="text-zinc-500" />
                            <span className="text-xs text-zinc-300 font-bold uppercase tracking-wider">Status do Site</span>
                          </div>
                          {getStatusBadge(savedProjects.find(p => p.id === currentProjectSlug) || {})}
                          <div className="absolute hidden group-hover:block top-full left-0 mt-2 w-full bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs p-3.5 rounded-xl shadow-xl z-50 text-center leading-relaxed">
                            Esta informação mostra se o seu site está no período de teste, ativo ou vencido. Projetos vencidos ficam invisíveis para o público.
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-zinc-500 uppercase flex gap-2 mb-1.5"><Briefcase size={12} /> Nome do Negócio</label>
                          <input className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 text-sm focus:border-emerald-500 outline-none transition-colors" placeholder="Ex: Eletricista Silva" value={formData.businessName} onChange={e => {setFormData({ ...formData, businessName: e.target.value }); setHasUnsavedChanges(true)}} />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-zinc-500 uppercase flex gap-2 mb-1.5"><FileText size={12} /> Ideia Principal</label>
                          <textarea className="w-full h-20 bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 text-sm resize-none focus:border-emerald-500 outline-none transition-colors" placeholder="Descreva os serviços..." value={formData.description} onChange={e => {setFormData({ ...formData, description: e.target.value }); setHasUnsavedChanges(true)}} />
                        </div>
                      </div>

                      <button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 border border-zinc-700 transition-colors shadow-sm">
                        {isGenerating ? <Loader2 className="animate-spin" /> : <RefreshCw size={18} />} {generatedHtml ? 'Recriar Site c/ IA' : 'Gerar Meu Site'}
                      </button>

                      {generatedHtml && (
                        <div className="pt-6 border-t border-zinc-800/50 space-y-6">
                          <div className="space-y-2.5">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Estilo do Site</label>
                            <select className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm outline-none" value={formData.layoutStyle} onChange={e => {setFormData({ ...formData, layoutStyle: e.target.value }); setHasUnsavedChanges(true)}}>
                              {LAYOUT_STYLES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                            </select>
                          </div>
                          <div className="space-y-2.5">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Temas (Cores)</label>
                            <div className="grid grid-cols-5 gap-3">
                              {COLORS.map(c => (
                                <button key={c.id} onClick={() => { setFormData({ ...formData, colorId: c.id }); setHasUnsavedChanges(true); }} className={`w-10 h-10 rounded-full transition-all relative overflow-hidden ${formData.colorId === c.id ? 'ring-2 ring-offset-2 ring-zinc-400 scale-110' : 'opacity-50 hover:opacity-100'} ring-offset-[#0c0c0e]`} title={c.name}>
                                  <div className="absolute inset-0" style={{ backgroundColor: c.c1 }} />
                                  <div className="absolute bottom-0 right-0 w-4 h-4 rounded-tl-full" style={{ backgroundColor: c.c4 }} />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2.5">
                            <label className="text-xs font-bold text-zinc-500 uppercase flex justify-between">
                              <span>Sua Logomarca (Favicon)</span>
                              {formData.logoBase64 && <button onClick={() => { setFormData(p => ({ ...p, logoBase64: '' })); setHasUnsavedChanges(true); }} className="text-red-400 hover:text-red-300 text-[10px] font-bold">X Remover</button>}
                            </label>
                            {!formData.logoBase64 ? (
                              <label className="cursor-pointer border border-dashed border-zinc-700 hover:border-emerald-500 rounded-xl p-4 flex justify-center gap-2 text-xs text-zinc-400 transition-colors bg-zinc-900/50"><Upload size={14} /> Fazer Upload<input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" /></label>
                            ) : (
                              <div className="h-14 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center overflow-hidden p-2"><img src={formData.logoBase64} className="h-full object-contain" alt="Logo" /></div>
                            )}
                          </div>

                          <div className="space-y-3 pt-5 border-t border-zinc-800/50">
                            <label className="text-xs font-bold text-zinc-500 uppercase flex gap-1.5"><Globe size={14} /> Redes Sociais</label>
                            <div className="grid grid-cols-2 gap-3">
                              <input className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs focus:border-emerald-500 outline-none" placeholder="WhatsApp (só números)" value={formData.whatsapp} onChange={e => {setFormData({ ...formData, whatsapp: e.target.value }); setHasUnsavedChanges(true)}} />
                              <input className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs focus:border-emerald-500 outline-none" placeholder="Instagram (@usuario)" value={formData.instagram} onChange={e => {setFormData({ ...formData, instagram: e.target.value }); setHasUnsavedChanges(true)}} />
                              <input className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs focus:border-emerald-500 outline-none" placeholder="Facebook (Link)" value={formData.facebook} onChange={e => {setFormData({ ...formData, facebook: e.target.value }); setHasUnsavedChanges(true)}} />
                              <input className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs focus:border-emerald-500 outline-none" placeholder="TikTok (Link)" value={formData.tiktok} onChange={e => {setFormData({ ...formData, tiktok: e.target.value }); setHasUnsavedChanges(true)}} />
                            </div>
                          </div>

                          <div className="space-y-3 pt-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase flex gap-1.5"><Zap size={14} /> Delivery (Opcional)</label>
                            <div className="grid grid-cols-2 gap-3">
                              <input className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs focus:border-emerald-500 outline-none" placeholder="iFood (Link)" value={formData.ifood} onChange={e => {setFormData({ ...formData, ifood: e.target.value }); setHasUnsavedChanges(true)}} />
                              <input className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs focus:border-emerald-500 outline-none" placeholder="99 Food (Link)" value={formData.noveNove} onChange={e => {setFormData({ ...formData, noveNove: e.target.value }); setHasUnsavedChanges(true)}} />
                              <input className="col-span-2 w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs focus:border-emerald-500 outline-none" placeholder="Keeta (Link)" value={formData.keeta} onChange={e => {setFormData({ ...formData, keeta: e.target.value }); setHasUnsavedChanges(true)}} />
                            </div>
                          </div>

                          <div className="space-y-3 pt-5 border-t border-zinc-800/50">
                            <label className="text-xs font-bold text-zinc-500 uppercase flex gap-1.5"><MapPin size={14} /> Contato e Localização</label>
                            <div className="grid grid-cols-2 gap-3">
                              <input className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs focus:border-emerald-500 outline-none" placeholder="Telefone" value={formData.phone} onChange={e => {setFormData({ ...formData, phone: e.target.value }); setHasUnsavedChanges(true)}} />
                              <input className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs focus:border-emerald-500 outline-none" placeholder="E-mail" value={formData.email} onChange={e => {setFormData({ ...formData, email: e.target.value }); setHasUnsavedChanges(true)}} />
                            </div>
                            <input className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs focus:border-emerald-500 outline-none" placeholder="Endereço Físico" value={formData.address} onChange={e => {setFormData({ ...formData, address: e.target.value }); setHasUnsavedChanges(true)}} />
                            <input className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs focus:border-emerald-500 outline-none" placeholder="Link do Google Maps" value={formData.mapEmbed} onChange={e => {setFormData({ ...formData, mapEmbed: e.target.value }); setHasUnsavedChanges(true)}} />
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {activeTab === 'dominio' && generatedHtml && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                      {!currentProjectSlug ? (
                        <div className="bg-indigo-500/10 p-5 rounded-2xl border border-indigo-500/30">
                          <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2 mb-2"><Globe size={16}/> Qual será o endereço?</h4>
                          <p className="text-xs text-indigo-200/80 mb-5 leading-relaxed">Antes de salvar, precisamos saber se você vai usar um domínio oficial (Registro.br).</p>
                          <DomainChecker onDomainChange={(domain, isLater) => { setOfficialDomain(domain); setRegisterLater(isLater); }} />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 shadow-xl">
                            <div className="flex items-center gap-3 mb-5">
                              <div className="bg-indigo-500/20 p-2.5 rounded-xl"><Globe className="text-indigo-400 w-5 h-5" /></div>
                              <div>
                                <h3 className="font-bold text-white text-sm">Apontamento DNS</h3>
                                <p className="text-[10px] text-zinc-400">Configure no seu Registro.br ou Hostinger</p>
                              </div>
                            </div>
                            <div className="bg-[#050505] p-4 rounded-xl border border-zinc-800/50 space-y-4">
                              <div>
                                <div className="flex justify-between items-center mb-1"><span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">TIPO A</span></div>
                                <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 flex justify-between items-center"><code className="text-emerald-400 text-xs font-bold select-all">199.36.158.100</code></div>
                              </div>
                              <div>
                                <div className="flex justify-between items-center mb-1"><span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">TIPO TXT</span></div>
                                <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800"><code className="text-indigo-300 text-[10px] break-all select-all block leading-tight">firebase-site-verification={currentProjectSlug}-app</code></div>
                              </div>
                            </div>
                          </div>
                          <button onClick={handleDownloadZip} className="w-full border border-zinc-800 hover:bg-zinc-800 text-zinc-300 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors mt-4"><Download size={16} /> Baixar Código do Site</button>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'assinatura' && currentProjectSlug && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                      
                      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full pointer-events-none"></div>
                        
                        <h3 className="text-lg font-black text-white mb-1 flex items-center gap-2"><CreditCard size={18} className="text-amber-400" /> Painel de Assinatura</h3>
                        <p className="text-xs text-zinc-400 mb-6">Gerencie o plano do seu projeto <span className="text-amber-400 font-mono">{currentProjectSlug}</span></p>

                        <div className="bg-[#050505] p-5 rounded-xl border border-zinc-800/50 mb-6">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold text-zinc-500 uppercase">Status Atual</span>
                            {getStatusBadge(savedProjects.find(p => p.id === currentProjectSlug) || {})}
                          </div>
                          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-amber-400 h-full rounded-full" style={{ width: '100%' }}></div>
                          </div>
                        </div>

                        {(!savedProjects.find(p => p.id === currentProjectSlug)?.paymentStatus || savedProjects.find(p => p.id === currentProjectSlug)?.paymentStatus !== 'paid') ? (
                          <div className="space-y-4">
                            <div className="flex items-end gap-2">
                              <span className="text-4xl font-black text-white">R$ 499</span>
                              <span className="text-sm text-zinc-500 font-medium pb-1">/ 1º ano</span>
                            </div>
                            <ul className="space-y-2 text-xs text-zinc-300 mb-4">
                              <li className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-400"/> Domínio próprio liberado</li>
                              <li className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-400"/> Site blindado no Google</li>
                              <li className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-400"/> Suporte e renovação garantida</li>
                            </ul>
                            
                            <button 
                              onClick={() => handleStripeCheckout(currentProjectSlug)}
                              disabled={checkoutLoading === currentProjectSlug}
                              className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-900 py-3.5 rounded-xl font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-lg shadow-amber-500/20"
                            >
                              {checkoutLoading === currentProjectSlug ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />} 
                              {checkoutLoading === currentProjectSlug ? 'Iniciando Seguro...' : 'Ativar Plano Anual Seguro'}
                            </button>
                            <p className="text-[9px] text-center text-zinc-500 mt-3 flex items-center justify-center gap-1"><ShieldCheck size={10}/> Pagamento criptografado via Stripe</p>
                          </div>
                        ) : (
                          <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-xl text-center space-y-3">
                            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2">
                              <Star size={24} />
                            </div>
                            <h4 className="font-bold text-emerald-400">Plano Anual Ativado!</h4>
                            <p className="text-xs text-emerald-200/70">O seu site está online, seguro e com todas as funções desbloqueadas. Nenhuma ação necessária.</p>
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                  
                  {loggedUserEmail && (
                    <div className="mt-8 border-t border-zinc-800/50 pt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2"><LayoutDashboard size={14} className="text-emerald-500"/>Meus Projetos</p>
                        <button onClick={handleLogout} className="text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors uppercase bg-red-500/10 px-2.5 py-1 rounded-lg">Sair</button>
                      </div>
                      
                      <div className="max-h-52 overflow-y-auto space-y-2">
                        {savedProjects.length === 0 ? (
                          <p className="text-xs text-zinc-500 italic bg-zinc-900/50 p-4 rounded-xl text-center border border-zinc-800/50">Nenhum projeto ainda.</p>
                        ) : (
                          savedProjects.map((p: any) => (
                            <div key={p.id} className="flex flex-col gap-1.5 bg-zinc-900 border border-zinc-800 rounded-xl p-2.5">
                              <div className="flex items-stretch gap-2 group">
                                <button onClick={() => handleLoadProject(p)} className={`flex-1 text-left text-xs bg-zinc-800/50 hover:bg-zinc-800 rounded-lg p-3 flex justify-between items-center transition-all ${currentProjectSlug === p.id ? 'ring-1 ring-emerald-500/50' : ''}`}>
                                  <div className="flex flex-col truncate pr-2">
                                    <span className="font-bold text-zinc-100 truncate flex items-center gap-2">
                                      {p.businessName || 'Sem Nome'} 
                                      {getStatusBadge(p)}
                                    </span>
                                    <span className="text-[9px] text-zinc-500 font-mono mt-1">{p.id}.web.app</span>
                                  </div>
                                </button>
                                <button onClick={() => handleDeleteSite(p.id)} className="w-10 bg-zinc-800/50 hover:bg-red-500/20 hover:text-red-400 text-zinc-500 rounded-lg flex items-center justify-center transition-all flex-shrink-0" title="Apagar Site"><Trash2 size={14} /></button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {generatedHtml && (
                  <div className="p-4 border-t border-zinc-800/50 bg-[#0c0c0e] flex items-center gap-3 flex-shrink-0">
                    <button 
                      onClick={handleSaveOrUpdateSite} disabled={isSavingProject || (!hasUnsavedChanges && currentProjectSlug !== null)}
                      className={`flex-1 py-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${hasUnsavedChanges || !currentProjectSlug ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
                    >
                      {isSavingProject ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={14} />}
                      {currentProjectSlug ? 'Atualizar' : 'Salvar Projeto'}
                    </button>

                    <button 
                      onClick={handlePublishSite} disabled={isPublishing || hasUnsavedChanges || !currentProjectSlug}
                      className={`flex-1 py-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${!hasUnsavedChanges && currentProjectSlug ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
                    >
                      {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe size={14} />} 
                      Publicar Site
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default App;
