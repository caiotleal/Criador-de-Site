import React, { Suspense, lazy, useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, functions } from './firebase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket, Settings, Upload, Download, Loader2, Minimize2, RefreshCw, Briefcase, FileText, X, Phone, Globe, CheckCircle, Save, Trash2, AlertCircle, LayoutDashboard, MapPin, Copy, ExternalLink, Zap, Star, ShieldCheck, CreditCard, User, LogIn, Info
} from 'lucide-react';
import { TEMPLATES } from './components/templates';
const LoginPage = lazy(() => import('./components/LoginPage'));
const DomainChecker = lazy(() => import('./components/DomainChecker'));
import { useIframeEditor } from './components/useIframeEditor'; 

// 👇 PUXANDO A IMAGEM DO ARQUIVO EXTERNO 👇
import { BRAND_LOGO } from './components/brand';

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
  // TONS TERROSOS
  { id: 'terracotta', name: 'Terracota', c1: '#1c0f0a', c2: '#2c1810', c3: '#452516', c4: '#d97743', c5: '#e89564', c6: '#f0b48b', c7: '#f5ceb3', light: '#ffffff', dark: '#1c0f0a' },
  { id: 'sand', name: 'Areia', c1: '#fdfbf7', c2: '#f4eee4', c3: '#e6dac3', c4: '#a37b45', c5: '#b5905d', c6: '#c9a87a', c7: '#dbc19a', light: '#2c1810', dark: '#ffffff' },
  { id: 'rust', name: 'Ferrugem', c1: '#1a0f0a', c2: '#2b1710', c3: '#422216', c4: '#b84a23', c5: '#d4633b', c6: '#e38866', c7: '#f0b097', light: '#ffffff', dark: '#1a0f0a' },
  { id: 'moss', name: 'Musgo', c1: '#f9faf6', c2: '#edf1e6', c3: '#dce4ce', c4: '#5e6b4b', c5: '#76855f', c6: '#91a179', c7: '#adbc95', light: '#1f2617', dark: '#ffffff' },
  { id: 'mocha', name: 'Café', c1: '#1a1614', c2: '#26201e', c3: '#38302c', c4: '#a67c52', c5: '#c0976e', c6: '#d5b38f', c7: '#e6ceb1', light: '#ffffff', dark: '#1a1614' },
];

const PROMO_HTML = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SiteZing - Criação Inteligente em Segundos</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    /* NOVO TEMA CLARO SITEZING */
    html, body { -ms-overflow-style: none; scrollbar-width: none; background-color: #FFFFFF; color: #1E293B; font-family: sans-serif; overflow-x: hidden; }
    ::-webkit-scrollbar { display: none; }
    .glass-card { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(226, 232, 240, 0.8); transition: transform 0.3s ease, box-shadow 0.3s ease; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05); }
    .glass-card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px -10px rgba(59, 130, 246, 0.15); border-color: rgba(59, 130, 246, 0.3); }
    
    @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    .animate-up { animation: fadeUp 1s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
    
    /* UX: Efeito de Flutuação Suave para o Logo */
    @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
    .animate-floating { animation: float 6s ease-in-out infinite; }
  </style>
</head>
<body class="antialiased selection:bg-blue-500 selection:text-white">
  <main class="pt-24 pb-24 px-6 md:px-12 max-w-7xl mx-auto flex flex-col justify-center min-h-screen relative">
    
    <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 blur-[150px] rounded-full pointer-events-none"></div>
    <div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-100/50 blur-[150px] rounded-full pointer-events-none"></div>

    <div class="relative z-10 animate-up text-center md:text-left max-w-3xl mb-16">
      
      <div class="mb-12 flex justify-center md:justify-start">
         <img src="${BRAND_LOGO}" alt="SiteZing Logo" class="h-24 md:h-28 w-auto drop-shadow-md animate-floating" />
      </div>

      <div class="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-xs font-bold tracking-widest text-blue-600 mb-6 uppercase">A revolução da web</div>
      
      <h1 class="text-[3rem] md:text-[5.5rem] font-black leading-[0.9] tracking-tighter mb-6 uppercase italic text-slate-900">
        Seu site pronto em um <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Zing!</span>
      </h1>
      <p class="text-lg md:text-2xl text-slate-500 font-light leading-relaxed">
        Não perca vendas por não estar no Google. A nossa inteligência artificial cria, escreve e publica o seu site automaticamente. Preencha o menu ao lado e veja a mágica acontecer.
      </p>
    </div>

    <div class="grid md:grid-cols-3 gap-6 relative z-10 animate-up" style="animation-delay: 0.2s;">
      <div class="glass-card p-8 rounded-[2rem] relative overflow-hidden group">
        <h3 class="text-2xl font-black mb-1 italic uppercase text-slate-800">Teste Grátis</h3>
        <p class="text-slate-500 mb-6 text-sm">Veja o seu site pronto hoje mesmo.</p>
        <div class="text-4xl font-black mb-1 text-blue-600">R$ 0 <span class="text-sm text-slate-400 font-normal">/ 5 dias</span></div>
        <p class="text-[11px] text-blue-500 font-bold mb-6">Após 5 dias, o site é congelado.</p>
        <ul class="space-y-3 text-slate-600 text-sm font-medium">
          <li class="flex items-center gap-3"><span class="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-[10px]">✔</span> Geração por IA</li>
          <li class="flex items-center gap-3"><span class="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-[10px]">✔</span> Domínio gratuito (.web.app)</li>
        </ul>
      </div>

      <div class="glass-card p-8 rounded-[2rem] relative overflow-hidden group">
        <h3 class="text-2xl font-black mb-1 italic uppercase text-slate-800">Mensal</h3>
        <p class="text-slate-500 mb-6 text-sm">Ideal para validar seu negócio.</p>
        <div class="text-4xl font-black mb-1 text-slate-900">R$ 49<span class="text-2xl">,90</span> <span class="text-sm text-slate-400 font-normal">/ mês</span></div>
        <p class="text-[11px] text-slate-500 font-bold mb-6">Cancele quando quiser.</p>
        <ul class="space-y-3 text-slate-600 text-sm font-medium">
          <li class="flex items-center gap-3"><span class="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-[10px]">✔</span> Site online 24/7</li>
          <li class="flex items-center gap-3"><span class="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-[10px]">✔</span> Domínio próprio (.com.br)</li>
        </ul>
      </div>

      <div class="glass-card p-8 rounded-[2rem] relative overflow-hidden border-orange-200 bg-white shadow-[0_20px_50px_-12px_rgba(249,115,22,0.15)] transform md:-translate-y-4">
        <div class="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-orange-400 text-white text-[10px] font-black tracking-widest px-4 py-2 rounded-bl-2xl uppercase flex gap-1.5 items-center justify-center shadow-lg">
          <Star size={12} className="text-white" />
          <span class="leading-none">Mais Assinado</span>
        </div>

        <h3 class="text-2xl font-black mb-1 italic uppercase text-orange-500">Anual</h3>
        <p class="text-slate-500 mb-6 text-sm">A solução definitiva e econômica.</p>
        <div class="text-4xl font-black mb-1 text-slate-900">R$ 499 <span class="text-sm text-slate-400 font-normal">/ 1º ano</span></div>
        <p class="text-[11px] text-orange-500 font-bold mb-6">Equivale a R$ 41,58 por mês.</p>
        <ul class="space-y-3 text-slate-600 text-sm font-medium">
          <li class="flex items-center gap-3"><span class="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 text-[12px]">★</span> 2 meses grátis</li>
          <li class="flex items-center gap-3"><span class="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 text-[12px]">★</span> Apontamento de Domínio</li>
          <li class="flex items-center gap-3"><span class="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 text-[12px]">★</span> Alta velocidade Google</li>
        </ul>
      </div>
    </div>
  </main>
</body>
</html>
`;

// Função utilitária para limpar o HTML antes de publicar (Removendo toolbar, scripts, etc.)
const cleanHtmlForPublishing = (rawHtml: string | null, preserveEditable = false) => {
  if (!rawHtml) return '';
  if (!rawHtml.includes('editor-toolbar')) return rawHtml;

  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, 'text/html');
  const tb = doc.querySelector('#editor-toolbar'); if (tb) tb.remove();
  const imgTb = doc.querySelector('#image-toolbar'); if (imgTb) imgTb.remove();
  const sc = doc.querySelector('#editor-script'); if (sc) sc.remove();
  const st = doc.querySelector('#editor-style'); if (st) st.remove();
  
  doc.querySelectorAll('.editable-element').forEach(el => {
    el.removeAttribute('contenteditable');
    el.classList.remove('editable-element');
    if (el.getAttribute('class') === '') el.removeAttribute('class');
  });

  if (!preserveEditable) {
    doc.querySelectorAll('.editable-image-wrapper').forEach(wrapper => {
      const hasImg = wrapper.querySelector('img');
      if (!hasImg) {
        wrapper.remove();
      } else {
        wrapper.classList.remove('editable-image-wrapper');
        const core = wrapper.querySelector('.editable-image');
        if (core) {
          core.classList.remove('editable-image', 'border-2', 'border-dashed', 'border-zinc-600', 'cursor-pointer', 'hover:border-emerald-500');
          core.querySelectorAll('i, span').forEach(el => el.remove());
        }
      }
    });
  }
  
  return doc.documentElement.outerHTML;
};

// Função para gerar o HTML de pré-visualização (Injetando toolbar e scripts do editor)
const getPreviewHtml = (baseHtml: string | null) => {
  if (!baseHtml) return '';
  const clean = cleanHtmlForPublishing(baseHtml, true);
  
  const editorScript = `
    <style id="editor-style">
      html, body { -ms-overflow-style: none; scrollbar-width: none; }
      ::-webkit-scrollbar { display: none; }
      
      .custom-editor-toolbar { position: absolute; display: none; background: #18181b; padding: 8px; border-radius: 10px; border: 1px solid #3f3f46; box-shadow: 0 10px 25 rgba(0,0,0,0.8); z-index: 99999; gap: 8px; align-items: center; font-family: sans-serif; }
      .color-picker-group { display: flex; align-items: center; gap: 4px; background: #27272a; padding: 2px 6px 2px 8px; border-radius: 6px; border: 1px solid #3f3f46; }
      .color-picker-label { color: #a1a1aa; font-size: 10px; font-weight: bold; }
      .custom-editor-toolbar input[type="color"] { width: 22px; height: 22px; border: none; cursor: pointer; background: transparent; padding: 0; }
      .custom-editor-toolbar select { background: #27272a; color: white; border: 1px solid #3f3f46; border-radius: 6px; padding: 4px 8px; font-size: 12px; outline: none; cursor: pointer; height: 30px; }
      .custom-editor-toolbar button#text-delete { background: #ef444415; border: 1px solid #ef444450; color: #ef4444; font-size: 12px; font-weight: bold; border-radius: 6px; cursor: pointer; padding: 0 10px; transition: all 0.2s; height: 30px; display: flex; align-items: center; gap: 4px; }
      .custom-editor-toolbar button#text-delete:hover { background: #ef4444; color: white; border-color: #ef4444; }
      .editable-element { transition: all 0.2s; outline: 2px dashed transparent; outline-offset: 2px; }
      .editable-element:hover { outline-color: rgba(160, 160, 160, 0.5); cursor: pointer; }
      .editable-element:focus { outline-color: #ffffff; }

      .editable-image { position: relative; transition: all 0.2s; overflow: hidden; }
      .editable-image:hover { background: transparent; }
    </style>
    <div id="editor-toolbar" class="custom-editor-toolbar">
      <div class="color-picker-group" title="Cor do Texto (Fonte)"><span class="color-picker-label">T</span><input type="color" id="fore-color-picker" /></div>
      <div class="color-picker-group" title="Cor do Fundo (Background)"><span class="color-picker-label">F</span><input type="color" id="bg-color-picker" /></div>
      <select id="text-size" title="Tamanho"><option value="1">Pequeno</option><option value="3" selected>Normal</option><option value="5">Grande</option><option value="7">Gigante</option></select>
      <select id="text-font" title="Fonte"><option value="Arial">Arial</option><option value="Georgia">Georgia</option><option value="Courier New">Courier</option><option value="Verdana">Verdana</option></select>
      <div style="width: 1px; height: 20px; background: #3f3f46; margin: 0 4px;"></div>
      <button id="text-delete" title="Apagar Elemento">✖ Excluir</button>
    </div>

    <div id="image-toolbar" class="custom-editor-toolbar flex gap-2">
      <button id="btn-upload" style="background: #27272a; color: white; padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; cursor: pointer; border: none;">📤 Upload</button>
      <button id="btn-ai" style="background: #10b981; color: white; padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; cursor: pointer; border: none;">✨ Gerar com IA</button>
      <button id="btn-img-delete" style="color: #ef4444; background: none; border: none; font-size: 12px; cursor: pointer; margin-left: 4px;">✖ Remover</button>
    </div>

    <script id="editor-script">
      document.addEventListener('DOMContentLoaded', () => {
        const textToolbar = document.getElementById('editor-toolbar');
        const imgToolbar = document.getElementById('image-toolbar');
        const foreColorPicker = document.getElementById('fore-color-picker');
        const bgColorPicker = document.getElementById('bg-color-picker');
        let currentTarget = null;
        let currentImgTarget = null;

        function sendCleanHtml() {
          const clone = document.documentElement.cloneNode(true);
          const tbs = clone.querySelectorAll('.custom-editor-toolbar, #editor-script, #editor-style');
          tbs.forEach(el => el.remove());
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
          if(textToolbar.contains(el) || imgToolbar.contains(el)) return; 
          el.setAttribute('contenteditable', 'true');
          el.classList.add('editable-element');
          el.addEventListener('focus', (e) => {
            imgToolbar.style.display = 'none';
            currentTarget = el;
            foreColorPicker.value = rgbToHex(window.getComputedStyle(el).color);
            bgColorPicker.value = rgbToHex(window.getComputedStyle(el).backgroundColor);
            const rect = el.getBoundingClientRect();
            textToolbar.style.display = 'flex';
            textToolbar.style.top = (rect.top + window.scrollY - 60) + 'px';
            textToolbar.style.left = Math.max(10, rect.left + window.scrollX) + 'px';
          });
        });

        document.querySelectorAll('.editable-image').forEach(el => {
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            textToolbar.style.display = 'none';
            currentImgTarget = el;
            const rect = el.getBoundingClientRect();
            imgToolbar.style.display = 'flex';
            imgToolbar.style.top = (rect.top + window.scrollY + 10) + 'px';
            imgToolbar.style.left = (rect.left + window.scrollX + 10) + 'px';
          });
        });

        document.addEventListener('click', (e) => {
          if (textToolbar.style.display === 'flex' && !textToolbar.contains(e.target) && e.target !== currentTarget) {
             textToolbar.style.display = 'none'; sendCleanHtml();
          }
          if (imgToolbar.style.display === 'flex' && !imgToolbar.contains(e.target) && !e.target.closest('.editable-image')) {
             imgToolbar.style.display = 'none';
          }
        });

        document.getElementById('text-delete').addEventListener('click', () => {
          if (currentTarget) { currentTarget.remove(); textToolbar.style.display = 'none'; sendCleanHtml(); }
        });
        foreColorPicker.addEventListener('input', (e) => { document.execCommand('foreColor', false, e.target.value); sendCleanHtml(); });
        bgColorPicker.addEventListener('input', (e) => { if(currentTarget) { currentTarget.style.backgroundColor = e.target.value; currentTarget.style.backgroundImage = 'none'; sendCleanHtml(); } });
        document.getElementById('text-size').addEventListener('change', (e) => { document.execCommand('fontSize', false, e.target.value); sendCleanHtml(); });
        document.getElementById('text-font').addEventListener('change', (e) => { document.execCommand('fontName', false, e.target.value); sendCleanHtml(); });

        document.getElementById('btn-upload').addEventListener('click', () => {
          window.parent.postMessage({ type: 'REQUEST_UPLOAD', targetId: currentImgTarget.dataset.id }, '*');
          imgToolbar.style.display = 'none';
        });

        document.getElementById('btn-ai').addEventListener('click', () => {
          imgToolbar.style.display = 'none';
          if (!currentImgTarget) return;

          currentImgTarget.innerHTML = '<div style="display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 460px; background: #18181b; padding: 16px; border-radius: 12px; border: 1px solid #3f3f46; box-shadow: 0 10px 25px rgba(0,0,0,0.8); z-index: 50;"><span style="color: #10b981; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">✨ Gerar Imagem com IA</span><input type="text" id="ai-img-prompt" placeholder="Ex: foto realista de um hamburguer na mesa" style="width: 100%; background: #27272a; color: white; padding: 10px 12px; border-radius: 8px; border: 1px solid #52525b; outline: none; font-size: 13px;" autocomplete="off"><div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px;"><button id="ai-img-cancel" style="background: transparent; color: #a1a1aa; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: bold; cursor: pointer; border: none;">Cancelar</button><button id="ai-img-confirm" style="background: #10b981; color: white; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: bold; cursor: pointer; border: none;">Gerar Imagem</button></div></div>';

          setTimeout(() => { const inp = document.getElementById('ai-img-prompt'); if(inp) inp.focus(); }, 50);

          document.getElementById('ai-img-cancel').addEventListener('click', (e) => {
            e.stopPropagation();
            currentImgTarget.innerHTML = '<i class="fas fa-camera text-4xl mb-3"></i><span class="text-xs font-bold uppercase tracking-widest">Adicionar Imagem</span>';
          });

          document.getElementById('ai-img-confirm').addEventListener('click', (e) => {
            e.stopPropagation();
            const inp = document.getElementById('ai-img-prompt');
            const promptText = inp ? inp.value.trim() : '';
            if(!promptText) return;

            currentImgTarget.innerHTML = '<div style="display:flex; flex-direction:column; align-items:center; color:#10b981;"><i class="fas fa-circle-notch fa-spin text-3xl mb-3"></i><span class="text-xs font-bold uppercase tracking-widest">Criando imagem realista...</span></div>';
            window.parent.postMessage({ type: 'REQUEST_AI', targetId: currentImgTarget.dataset.id, prompt: promptText }, '*');
          });
        });

        document.getElementById('btn-img-delete').addEventListener('click', () => {
          if (currentImgTarget) { 
            currentImgTarget.innerHTML = '<i class="fas fa-camera text-4xl mb-3"></i><span class="text-xs font-bold uppercase tracking-widest">Adicionar Imagem (Opcional)</span>';
            sendCleanHtml(); 
            imgToolbar.style.display = 'none';
          }
        });

        window.addEventListener('message', (e) => {
          if (e.data.type === 'INSERT_IMAGE') {
            const targetEl = document.querySelector(\`.editable-image[data-id="\${e.data.targetId}"]\`);
            if (targetEl) {
              targetEl.innerHTML = \`<img src="\${e.data.url}" class="w-full h-full block object-contain" style="border-radius: inherit; margin: 0; box-shadow: none;" />\`;
              sendCleanHtml();
            }
          }

          if (e.data.type === 'STOCK_IMAGE_OPTIONS') {
            const targetEl = document.querySelector(\`.editable-image[data-id="\${e.data.targetId}"]\`);
            if (targetEl && e.data.options && e.data.options.length) {
              let html = \`<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%; height: 100%; min-height: 200px; background: #18181b; padding: 12px; border-radius: 12px;">\`;
              e.data.options.forEach((optStr, idx) => {
                 const urls = optStr.split('|');
                 html += \`<div class="stock-opt stock-opt-\${idx}" style="cursor:pointer; position:relative; overflow:hidden; border-radius:8px; display:flex; align-items:center; justify-content:center; background:#27272a;">
                     <img src="\${urls[0]}" onerror="this.src='\${urls[1]||urls[0]}'" style="width:100%; height:100%; object-fit:cover; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"/>
                     <div style="position:absolute; bottom:4px; left:4px; background:rgba(0,0,0,0.7); color:white; font-size:10px; padding:2px 6px; border-radius:4px; pointer-events:none;">Usar esta</div>
                  </div>\`;
              });
              html += \`</div>\`;
              targetEl.innerHTML = html;
              
              setTimeout(() => {
                 e.data.options.forEach((optStr, idx) => {
                    const el = targetEl.querySelector('.stock-opt-' + idx);
                    if(el) {
                       el.addEventListener('click', (ev) => {
                          ev.stopPropagation();
                          const img = el.querySelector('img');
                          if(img && img.src) {
                             window.parent.postMessage({ type: 'INSERT_IMAGE', targetId: e.data.targetId, url: img.src }, '*');
                          }
                       });
                    }
                 });
              }, 100);
            }
          }
        });
      });
    </script>
  `;
  return clean.replace(/<\/body>/i, `${editorScript}</body>`);
};

// Função para extrair imagens customizadas (base64) já enviadas para o iframe
const extractCustomImages = (html: string | null) => {
  if (!html) return {};
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const images: Record<string, string> = {};
  doc.querySelectorAll('.editable-image').forEach(el => {
    const id = el.getAttribute('data-id');
    const img = el.querySelector('img');
    if (id && img && img.src) {
      images[id] = img.src;
    }
  });
  return images;
};

const App: React.FC = () => {
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [aiContent, setAiContent] = useState<any>(null);
  const [isCanceling, setIsCanceling] = useState<string | null>(null);
  
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

  // Estados para gerenciar checkout e cancelamento
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  // Dados do formulário
  const [formData, setFormData] = useState({
    businessName: '', description: '', region: '', whatsapp: '', instagram: '', facebook: '', linkedin: '', tiktok: '',
    ifood: '', noveNove: '', keeta: '', phone: '', email: '', address: '', showMap: true,
    showForm: true, showFloatingContact: true, layoutStyle: 'layout_modern_center', colorId: 'obsidian', logoBase64: ''
  });

  // Hook customizado para lidar com a edição no iframe
  useIframeEditor({ setGeneratedHtml, setHasUnsavedChanges });

  // Efeito para injetar o Favicon dinâmico e Título
  useEffect(() => {
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = BRAND_LOGO;
    document.title = "SiteZing - Seu site pronto em um ZING !!!";
  }, []);

  // Re-renderizar o template quando dados do formulário mudam (e já existe conteúdo da IA)
  useEffect(() => {
    if (aiContent) {
      setGeneratedHtml(prevHtml => {
        const extractedImages = extractCustomImages(prevHtml); // Preservar imagens enviadas
        return renderTemplate(aiContent, formData, extractedImages);
      });
    }
  }, [formData.layoutStyle, formData.colorId, formData.logoBase64, formData.whatsapp, formData.instagram, formData.facebook, formData.linkedin, formData.tiktok, formData.ifood, formData.noveNove, formData.keeta, formData.showForm, formData.showFloatingContact, formData.showMap, formData.address, formData.phone, formData.email, formData.region]);

  // Efeito para verificar autenticação
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setLoggedUserEmail(user?.email || null);
    });
    return () => unsub();
  }, []);

  // Função para buscar projetos salvos do usuário
  const fetchProjects = async () => {
    if (!auth.currentUser) return setSavedProjects([]);
    try {
      const listFn = httpsCallable(functions, 'listUserProjects');
      const listRes: any = await listFn({});
      setSavedProjects(listRes.data?.projects || []);
    } catch (error) {
      setSavedProjects([]);
    }
  };

  // Buscar projetos ao carregar ou mudar usuário
  useEffect(() => {
    fetchProjects();
  }, [loggedUserEmail]);

  // Função principal de renderização do template
  const renderTemplate = (content: any, data: typeof formData, customImages: Record<string, string> = {}) => {
    let html = TEMPLATES[data.layoutStyle] || TEMPLATES['layout_modern_center'];
    const colors = COLORS.find(c => c.id === data.colorId) || COLORS[0];

    const replaceAll = (token: string, value: string) => {
      html = html.split(token).join(value);
    };

    const companyNameUpper = (data.businessName || 'Sua Empresa').toUpperCase();

    // Substituições básicas de conteúdo
    replaceAll('{{BUSINESS_NAME}}', companyNameUpper);
    replaceAll('{{HERO_TITLE}}', content.heroTitle || `Bem-vindo à ${data.businessName}`);
    replaceAll('{{HERO_SUBTITLE}}', content.heroSubtitle || 'Presença digital profissional.');
    replaceAll('{{ABOUT_TITLE}}', content.aboutTitle || 'Quem Somos');
    replaceAll('{{ABOUT_TEXT}}', content.aboutText || 'Nossa história e serviços.');
    replaceAll('{{CONTACT_CALL}}', content.contactCall || 'Fale conosco');
    
    // Substituições de cores
    replaceAll('{{COLOR_1}}', colors.c1);
    replaceAll('{{COLOR_2}}', colors.c2);
    replaceAll('{{COLOR_3}}', colors.c3);
    replaceAll('{{COLOR_4}}', colors.c4);
    replaceAll('{{COLOR_5}}', colors.c5);
    replaceAll('{{COLOR_6}}', colors.c6);
    replaceAll('{{COLOR_7}}', colors.c7);
    replaceAll('{{COLOR_LIGHT}}', colors.light);
    replaceAll('{{COLOR_DARK}}', colors.dark);
    
    // Contatos e Localização
    replaceAll('{{ADDRESS}}', data.region ? `${data.address || 'Endereço não informado'} - ${data.region}` : (data.address || 'Endereço não informado'));
    replaceAll('{{PHONE}}', data.phone || data.whatsapp || 'Telefone não informado');
    replaceAll('{{EMAIL}}', data.email || 'Email não informado');

    // Preparar injeções no HEAD
    let headInjection = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">';
    
    // Injetar Logo ou Título
    if (data.logoBase64) {
      headInjection += `<link rel="icon" type="image/png" href="${data.logoBase64}">`;
      html = html.replace(/\[\[LOGO_AREA\]\]/g, `<img src="${data.logoBase64}" class="h-10 md:h-12 w-auto object-contain transition-transform hover:scale-105" alt="Logo" />`);
    } else {
      html = html.replace(/\[\[LOGO_AREA\]\]/g, `<span class="font-black tracking-tighter text-xl uppercase">${companyNameUpper}</span>`);
    }

    // Limpar placeholders de botões sociais antes de reinserir
    replaceAll('[[WHATSAPP_BTN]]', ''); replaceAll('[[INSTAGRAM_BTN]]', ''); replaceAll('[[FACEBOOK_BTN]]', '');
    replaceAll('[[TIKTOK_BTN]]', ''); replaceAll('[[LINKEDIN_BTN]]', ''); replaceAll('[[IFOOD_BTN]]', ''); replaceAll('[[NOVE_NOVE_BTN]]', ''); replaceAll('[[KEETA_BTN]]', '');

    // Gerar HTML de Redes Sociais e Botões de Ação Flutuantes
    let socialHtml = '';
    const addSocialBtn = (href: string, brandColor: string, label: string, innerHtml: string) => {
      socialHtml += `<a href="${href}" target="_blank" class="social-icon" style="color: ${brandColor};" title="${label}">${innerHtml}</a>`;
    };

    if (data.whatsapp) addSocialBtn(`https://wa.me/${data.whatsapp.replace(/\D/g, '')}`, '#25D366', 'WhatsApp', '<i class="fab fa-whatsapp"></i>');
    if (data.instagram) addSocialBtn(`https://instagram.com/${data.instagram.replace('@', '')}`, '#E1306C', 'Instagram', '<i class="fab fa-instagram"></i>');
    if (data.facebook) addSocialBtn(data.facebook.startsWith('http') ? data.facebook : `https://${data.facebook}`, '#1877F2', 'Facebook', '<i class="fab fa-facebook-f"></i>');
    if (data.linkedin) addSocialBtn(data.linkedin.startsWith('http') ? data.linkedin : `https://${data.linkedin}`, '#0A66C2', 'LinkedIn', '<i class="fab fa-linkedin-in"></i>');
    if (data.tiktok) addSocialBtn(data.tiktok.startsWith('http') ? data.tiktok : `https://${data.tiktok}`, '#fff', 'TikTok', '<i class="fab fa-tiktok"></i>');
    if (data.ifood) addSocialBtn(data.ifood.startsWith('http') ? data.ifood : `https://${data.ifood}`, '#EA1D2C', 'iFood', '<img src="https://cdn.simpleicons.org/ifood/EA1D2C" alt="iFood" class="float-logo"/>');
    if (data.noveNove) addSocialBtn(data.noveNove.startsWith('http') ? data.noveNove : `https://${data.noveNove}`, '#FFC700', '99', '<span class="float-brand inline-block" style="color: #FFC700">99</span>');
    if (data.keeta) addSocialBtn(data.keeta.startsWith('http') ? data.keeta : `https://${data.keeta}`, '#19B84A', 'Keeta', '<span class="float-brand inline-block" style="color: #19B84A">Keeta</span>');

    let contactHtml = '';
    if (data.showFloatingContact) {
      contactHtml = `<a href="#contato" class="contact-dock-btn"><i class="fas fa-comment-dots text-[18px]"></i> Fale Conosco</a>`;
    }

    if (socialHtml || contactHtml) {
      const wrappedSocials = socialHtml ? `<div class="social-dock">${socialHtml}</div>` : '';
      const floatStyle = `
      <style>
        @keyframes gentle-float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        .floating-dock { position: fixed; bottom: 32px; right: 32px; display: flex; align-items: center; gap: 16px; z-index: 99999; flex-wrap: wrap; justify-content: flex-end; animation: gentle-float 4s ease-in-out infinite; opacity: 0; pointer-events: none; transform: translateY(20px); transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .floating-dock.scrolled-active { opacity: 1; pointer-events: auto; transform: translateY(0px); }
        .social-dock { display: flex; align-items: center; gap: 4px; padding: 6px 16px; border-radius: 100px; background-color: ${colors.c2}cc; border: 1px solid ${colors.c3}; box-shadow: 0 8px 32px rgba(0,0,0,0.2); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
        .social-icon { display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 50%; font-size: 22px; transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); text-decoration: none; }
        .social-icon:hover { transform: translateY(-4px) scale(1.15); filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3)); }
        .social-icon .float-logo { width: 22px; height: 22px; object-fit: contain; }
        .social-icon .float-brand { font-size: 13px; font-weight: 900; }
        .contact-dock-btn { display: flex; align-items: center; gap: 10px; padding: 12px 24px; border-radius: 100px; background-color: ${colors.c4}; color: ${colors.c1}; font-weight: 800; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; box-shadow: 0 8px 32px rgba(0,0,0,0.3); transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); text-decoration: none; border: 1px solid ${colors.c3}40; pointer-events: auto; }
        .contact-dock-btn:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.4); }
        .floating-dock:hover { animation-play-state: paused; }
        @media (max-width: 640px) {
           .floating-dock { bottom: 20px; right: 20px; left: 20px; flex-direction: column-reverse; align-items: flex-end; }
        }
      </style>
      <script>
        document.addEventListener('DOMContentLoaded', () => {
          const dock = document.querySelector('.floating-dock');
          if (!dock) return;
          const handleScroll = () => {
             if (window.scrollY > document.documentElement.clientHeight * 0.4) {
                dock.classList.add('scrolled-active');
             } else {
                dock.classList.remove('scrolled-active');
             }
          };
          window.addEventListener('scroll', handleScroll, { passive: true });
          handleScroll();
        });
      </script>`;
      headInjection += floatStyle;
      html = html.replace('</body>', `<div class="floating-dock">${contactHtml}${wrappedSocials}</div></body>`);
    }

    // Injetar marca d'água no rodapé do site gerado
    const footerBrand = `<div style="text-align:center; padding: 24px; font-size: 12px; opacity: 0.5; width: 100%; font-family: sans-serif; display: flex; align-items: center; justify-content: center; gap: 6px;">Criado por <a href="https://sitezing.com.br" target="_blank" style="text-decoration: none; font-weight: 900; display: flex; align-items: center; gap: 4px; color: inherit; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'"><img src="${BRAND_LOGO}" style="height: 16px; width: auto;" alt="SiteZing"/> SiteZing</a></div>`;
    html = html.replace('</body>', `${footerBrand}</body>`);

    // Injetar Mapa e Formulário se ativados
    const mapUrl = data.address ? `https://https://maps.google.com/maps?q=${encodeURIComponent(data.address)}&output=embed` : '';
    const mapCode = (data.showMap && mapUrl) ? `<div class="overflow-hidden rounded-[2rem] mt-6 map-container ux-glass"><iframe src="${mapUrl}" width="100%" height="240" style="border:0;" loading="lazy"></iframe></div>` : '';
    replaceAll('[[MAP_AREA]]', mapCode);
    
    // Configurar Formsubmit.co para o formulário AJAX
    const formAction = data.email ? `action="https://formsubmit.co/ajax/${data.email}"` : '';
    
    const hiddenInputs = data.email ? `
      <input type="hidden" name="_subject" value="[Contato do seu Site] Nova mensagem de um cliente">
      <input type="hidden" name="_language" value="pt-BR">
      <input type="hidden" name="_template" value="box">
      <input type="hidden" name="_captcha" value="false">
    ` : '';

    const formCode = data.showForm ? `
    <form id="sitecraft-contact-form" ${formAction} class="space-y-4 ux-form ux-glass p-8 md:p-12 rounded-[2rem] relative">
      ${hiddenInputs}
      <input name="Nome" required class="w-full bg-[${colors.c1}] border border-[${colors.c3}] rounded-xl p-4 text-sm focus:outline-none focus:border-[${colors.c4}] transition-all text-[${colors.c4}] placeholder:text-[${colors.c6}]" placeholder="Seu nome" />
      <input name="Email" type="email" required class="w-full bg-[${colors.c1}] border border-[${colors.c3}] rounded-xl p-4 text-sm focus:outline-none focus:border-[${colors.c4}] transition-all text-[${colors.c4}] placeholder:text-[${colors.c6}]" placeholder="Seu email" />
      <textarea name="Mensagem" required class="w-full bg-[${colors.c1}] border border-[${colors.c3}] rounded-xl p-4 text-sm focus:outline-none focus:border-[${colors.c4}] transition-all text-[${colors.c4}] placeholder:text-[${colors.c6}]" rows="4" placeholder="Sua mensagem"></textarea>
      <button type="${data.email ? 'submit' : 'button'}" class="btn-primary w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all text-[${colors.c1}]" style="background-color: ${colors.c7}; border: none;">Enviar mensagem</button>
    </form>
    
    <script id="contact-form-script">
      document.addEventListener('DOMContentLoaded', function() {
        const form = document.getElementById('sitecraft-contact-form');
        if (form && form.hasAttribute('action')) {
          form.addEventListener('submit', function(e) {
            e.preventDefault(); 
            
            const btn = form.querySelector('button[type="submit"]');
            if(btn) { 
              btn.innerText = 'Enviando...'; 
              btn.style.opacity = '0.7';
              btn.disabled = true; 
            }
            
            const formData = new FormData(form);
            const dataObj = Object.fromEntries(formData.entries());

            fetch(form.action, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify(dataObj)
            })
            .then(response => response.json())
            .then(data => {
              form.innerHTML = '<div style="text-align:center; padding: 20px; animation: fadeUp 0.5s ease;"><div style="width: 64px; height: 64px; background: rgba(16,185,129,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;"><i class="fas fa-check" style="font-size: 30px; color: #10b981;"></i></div><h3 style="font-size: 24px; font-weight: 900; color: ${colors.c4}; margin-bottom: 8px;">Enviado com sucesso!</h3><p style="font-size: 14px; color: ${colors.c6};">Agradecemos o seu contato. Retornaremos o mais breve possível.</p></div>';
            })
            .catch(error => {
              if(btn) { 
                btn.innerText = 'Erro ao enviar. Tente novamente.'; 
                btn.style.opacity = '1';
                btn.disabled = false; 
              }
            });
          });
        }
      });
    </script>` : '';

    replaceAll('[[CONTACT_FORM]]', formCode);

    // Injetar placeholders de imagens editáveis
    const imgPlaceholder = (id: string, label: string) => {
      if (customImages[id]) {
         return `
      <div class="editable-image-wrapper w-full py-4">
        <div class="editable-image rounded-2xl flex flex-col items-center justify-center text-zinc-500 hover:text-emerald-500 transition-colors cursor-pointer w-full min-h-[320px] bg-black/20" data-id="${id}">
          <img src="${customImages[id]}" class="w-full h-full block object-contain" style="border-radius: inherit; margin: 0; box-shadow: none;" />
        </div>
      </div>`;
      }
      return `
      <div class="editable-image-wrapper w-full py-4">
        <div class="editable-image rounded-2xl flex flex-col items-center justify-center text-zinc-500 hover:text-emerald-500 transition-colors cursor-pointer w-full min-h-[320px] bg-black/20" data-id="${id}">
          <i class="fas fa-camera text-4xl mb-3"></i><span class="text-xs font-bold uppercase tracking-widest">Adicionar Imagem - ${label}</span>
        </div>
      </div>`;
    };

    replaceAll('[[HERO_IMAGE]]', imgPlaceholder('hero-img', 'Destaque (Topo)'));
    replaceAll('[[ABOUT_IMAGE]]', imgPlaceholder('about-img', 'Quem Somos'));

    // Finalizar HEAD injection
    return html.replace('</head>', `${headInjection}</head>`);
  };

  // Funções de ação (Gerar, Salvar, Publicar)
  const handleGenerate = async () => {
    if (!formData.businessName || !formData.description) return alert('Preencha Nome e Ideia!');
    setIsGenerating(true);
    try {
      if (aiContent && generatedHtml) {
        const extractedImages = extractCustomImages(generatedHtml);
        setGeneratedHtml(renderTemplate(aiContent, formData, extractedImages));
        setHasUnsavedChanges(true);
        setIsGenerating(false);
        return;
      }
      const generateFn = httpsCallable(functions, 'generateSite');
      const result: any = await generateFn({ businessName: formData.businessName, description: formData.description, region: formData.region });
      setAiContent(result.data);
      const extractedImages = extractCustomImages(generatedHtml);
      setGeneratedHtml(renderTemplate(result.data, formData, extractedImages));
      setHasUnsavedChanges(true);
    } catch (error: any) { alert('Erro: ' + error.message); } 
    finally { setIsGenerating(false); }
  };

  // Lógica para upload de logo do usuário (base64)
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
        setFormData({ businessName: '', description: '', region: '', whatsapp: '', instagram: '', facebook: '', linkedin: '', tiktok: '', ifood: '', noveNove: '', keeta: '', phone: '', email: '', address: '', showMap: true, showForm: true, showFloatingContact: true, layoutStyle: 'layout_modern_center', colorId: 'obsidian', logoBase64: '' });
      }
      fetchProjects();
    } catch (error) { alert("Erro ao excluir o site."); }
  };

  const handleStripeCheckout = async (projectId: string, planType: 'mensal' | 'anual') => {
    if (!projectId) return;
    setCheckoutLoading(projectId);
    try {
      const createCheckoutFn = httpsCallable(functions, 'createStripeCheckoutSession');
      const res: any = await createCheckoutFn({ projectId, origin: window.location.origin, planType });
      if (res.data?.url) {
        window.location.href = res.data.url;
        return;
      }
      throw new Error('URL de checkout inválida.');
    } catch (error: any) {
      alert('Erro ao iniciar pagamento: ' + error.message);
    } finally {
      setCheckoutLoading(null);
    }
  };
  
  const handleCancelSubscription = async (projectId: string) => {
    if (!window.confirm("Tem certeza que deseja cancelar sua assinatura?\n\nSeu site continuará no ar até o final do período que já foi pago. Após essa data, ele será congelado e você não será mais cobrado.")) return;
    
    setIsCanceling(projectId);
    try {
      const cancelFn = httpsCallable(functions, 'cancelStripeSubscription');
      await cancelFn({ projectId });
      alert("Assinatura cancelada com sucesso! O site permanecerá ativo até o fim do ciclo vigente.");
      fetchProjects(); 
    } catch (error: any) {
      alert("Erro ao cancelar: " + error.message);
    } finally {
      setIsCanceling(null);
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
    setSavedProjects([]); setCurrentProjectSlug(null); setGeneratedHtml(null);
  };

  const handleLoginSubmit = async (email: string, password: string) => {
    try { await signInWithEmailAndPassword(auth, email, password); } 
    catch { await createUserWithEmailAndPassword(auth, email, password); }
    setIsLoginOpen(false);
  };

  // Funções utilitárias de Badges e Títulos
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

      {/* 👇 NOVO TEMA CLARO SITEZING 👇 */}
      <div className="w-full h-screen bg-[#FFFFFF] overflow-hidden font-sans text-slate-900 flex">
        
        {/* Área Principal (Preview do Site) */}
        <div className="flex-1 relative h-full overflow-hidden bg-[#FFFFFF]">
          <iframe 
            srcDoc={generatedHtml ? getPreviewHtml(generatedHtml) : PROMO_HTML} 
            className="w-full h-full border-none bg-transparent" 
            title="Visão Principal" 
          />

          <AnimatePresence>
            {!isMenuOpen && (
              <>
                {/* 👇 UX: SETA PULSANTE (RADAR PULSE) PARA ENGRENAGEM 👇 */}
                <div className="absolute bottom-24 right-6 z-[90] flex items-center gap-4 text-emerald-600">
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="relative flex items-center justify-center"
                  >
                    {/* Animação do Pulso (Radar) */}
                    <motion.div
                      animate={{ scale: [1, 2], opacity: [0.6, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                      className="absolute w-12 h-12 bg-emerald-400 rounded-full"
                    />
                    {/* Ícone e Texto Fixo */}
                    <div className="relative flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                      <Settings size={14} className="animate-spin-slow" />
                      <span className="text-sm font-bold uppercase tracking-wider">Crie seu Site</span>
                    </div>
                  </motion.div>
                </div>
                
                {/* Botão flutuante para reabrir o menu */}
                <motion.div 
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  onClick={() => setIsMenuOpen(true)} 
                  className="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-500 rounded-full shadow-2xl flex items-center justify-center cursor-pointer ring-4 ring-black/20 transition-transform hover:scale-105 z-[90]"
                >
                  <Settings className="text-white" size={26} />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Modal de Login (Lazy Loaded) */}
        <Suspense fallback={null}>
          <LoginPage isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSubmit={handleLoginSubmit} brandLogo={BRAND_LOGO} />
        </Suspense>

        {/* Modal de Sucesso na Publicação */}
        <AnimatePresence>
          {publishModalUrl && (
            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white border border-slate-200 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center space-y-6"
              >
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-200">
                  <CheckCircle size={40} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-950 mb-2">Site Publicado com Sucesso!</h2>
                  <p className="text-slate-500 text-sm leading-relaxed">A sua página já está online. Caso tenha configurado um domínio do Registro.br / DNS, pode demorar algumas horas para propagar.</p>
                </div>
                <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 overflow-hidden">
                  <code className="text-blue-600 text-sm truncate flex-1 font-mono">{publishModalUrl}</code>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => { navigator.clipboard.writeText(publishModalUrl); alert('Link copiado!'); }} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-slate-300"><Copy size={18} /> Copiar Link</button>
                  <button onClick={() => window.open(publishModalUrl, '_blank')} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/20"><ExternalLink size={18} /> Abrir Site</button>
                </div>
                <button onClick={() => setPublishModalUrl(null)} className="text-slate-500 hover:text-slate-800 font-medium text-sm mt-4 block w-full transition-colors">Fechar janela</button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Painel de Controle (Sidebar) Clarinha com Glassmorphism */}
        <AnimatePresence initial={false}>
          {isMenuOpen && (
            <motion.div 
              initial={{ width: 0, paddingLeft: 0, paddingRight: 0 }} 
              animate={{ width: 420, paddingLeft: 16, paddingRight: 24 }} 
              exit={{ width: 0, paddingLeft: 0, paddingRight: 0 }} 
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="flex-shrink-0 h-screen flex flex-col justify-center overflow-hidden relative z-50 bg-[#FFFFFF]"
            >
              <motion.div 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                transition={{ delay: 0.1 }}
                className="w-full h-[95vh] bg-[#F8FAFC] border border-slate-200 rounded-[2rem] shadow-lg flex flex-col overflow-hidden relative glass-container-light"
              >
                
                {/* Cabeçalho do Menu */}
                <div className="flex justify-between items-center px-6 py-5 border-b border-slate-200 flex-shrink-0">
                  <div className="flex items-center gap-3 select-none">
                    <img src={BRAND_LOGO} alt="SiteZing" className="h-8 w-auto object-contain drop-shadow-sm" />
                  </div>
                  <div className="flex items-center gap-4">
                    {loggedUserEmail ? (
                      <button className="text-slate-400 hover:text-emerald-600 transition-colors" title={`Logado como: ${loggedUserEmail}`}>
                        <User size={18} />
                      </button>
                    ) : (
                      <button onClick={() => setIsLoginOpen(true)} className="text-xs font-bold text-emerald-600 hover:text-emerald-500 transition-colors flex items-center gap-1.5">
                        <LogIn size={16} /> Login
                      </button>
                    )}
                    <div className="w-px h-4 bg-slate-200"></div>
                    <button onClick={() => setIsMenuOpen(false)} className="text-slate-500 hover:text-slate-900 transition-colors" title="Esconder Painel">
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Abas de Navegação */}
                {generatedHtml && (() => {
                  const currentProject = savedProjects.find(p => p.id === currentProjectSlug);
                  let daysLeft = 0; let isPaid = false;
                  
                  if (currentProject?.expiresAt) {
                    const expirationDate = currentProject.expiresAt._seconds ? currentProject.expiresAt._seconds * 1000 : currentProject.expiresAt.seconds * 1000;
                    daysLeft = Math.ceil((new Date(expirationDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                    isPaid = currentProject.paymentStatus === 'paid';
                  }

                  return (
                    <div className="flex border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider flex-shrink-0 bg-white">
                      <button onClick={() => setActiveTab('geral')} className={`flex-1 py-3.5 text-center transition-colors ${activeTab === 'geral' ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}>
                        Visual & Dados
                      </button>
                      
                      <button onClick={() => setActiveTab('dominio')} className={`flex-1 py-3.5 text-center transition-colors relative ${activeTab === 'dominio' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}>
                        Domínio
                        {(!officialDomain || officialDomain === 'Pendente' || registerLater) && (
                          <span className="absolute top-3 right-4 flex h-2 w-2" title="Domínio não configurado">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </span>
                        )}
                      </button>

                      {currentProjectSlug && (
                        <button onClick={() => setActiveTab('assinatura')} className={`flex-1 py-3.5 text-center transition-colors relative ${activeTab === 'assinatura' ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}>
                          Pagamento
                          {!isPaid && (
                            <span className="absolute top-3 right-2 flex h-2 w-2" title={daysLeft > 0 ? "Período de Teste" : "Vencido"}>
                              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${daysLeft > 0 ? 'bg-yellow-400' : 'bg-red-400'}`}></span>
                              <span className={`relative inline-flex rounded-full h-2 w-2 ${daysLeft > 0 ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })()}

                {/* Conteúdo do Menu */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6 pb-6 bg-white">
                  {activeTab === 'geral' && (
                    <>
                      {currentProjectSlug && (
                        <div className="group relative flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200 -mt-2">
                          <div className="flex items-center gap-2 cursor-help">
                            <Info size={14} className="text-slate-400" />
                            <span className="text-xs text-slate-600 font-bold uppercase tracking-wider">Status do Site</span>
                          </div>
                          {getStatusBadge(savedProjects.find(p => p.id === currentProjectSlug) || {})}
                          <div className="absolute hidden group-hover:block top-full left-0 mt-2 w-full bg-white border border-slate-200 text-slate-700 text-xs p-3.5 rounded-xl shadow-lg z-50 text-center leading-relaxed">
                            Esta informação mostra se o seu site está no período de teste, ativo ou vencido. Projetos vencidos ficam invisíveis para o público.
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase flex gap-2 mb-1.5"><Briefcase size={12} /> Nome do Negócio</label>
                          <input className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm focus:border-emerald-500 outline-none transition-colors" placeholder="Ex: Eletricista Silva" value={formData.businessName} onChange={e => {setFormData({ ...formData, businessName: e.target.value }); setHasUnsavedChanges(true)}} />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase flex gap-2 mb-1.5"><MapPin size={12} /> Região de atuação</label>
                          <input className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm focus:border-emerald-500 outline-none transition-colors" placeholder="Ex: Zona Sul de São Paulo - SP" value={formData.region} onChange={e => {setFormData({ ...formData, region: e.target.value }); setHasUnsavedChanges(true)}} />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase flex gap-2 mb-1.5"><FileText size={12} /> Ideia Principal</label>
                          <textarea className="w-full h-20 bg-white border border-slate-200 rounded-xl p-3.5 text-sm resize-none focus:border-emerald-500 outline-none transition-colors" placeholder="Descreva os serviços..." value={formData.description} onChange={e => {setFormData({ ...formData, description: e.target.value }); setHasUnsavedChanges(true)}} />
                        </div>
                      </div>

                      <button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 border border-slate-700 transition-colors shadow-sm">
                        {isGenerating ? <Loader2 className="animate-spin" /> : <RefreshCw size={18} />} {generatedHtml ? 'Recriar Site c/ IA' : 'Gerar Meu Site'}
                      </button>

                      {generatedHtml && (
                        <div className="pt-6 border-t border-slate-200 space-y-6">
                          {/* Configurações de Estilo e Cor */}
                          <div className="space-y-2.5">
                            <label className="text-xs font-bold text-slate-500 uppercase">Estilo do Site</label>
                            <select className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm outline-none" value={formData.layoutStyle} onChange={e => {setFormData({ ...formData, layoutStyle: e.target.value }); setHasUnsavedChanges(true)}}>
                              {LAYOUT_STYLES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                            </select>
                          </div>
                          <div className="space-y-2.5">
                            <label className="text-xs font-bold text-slate-500 uppercase">Temas (Cores)</label>
                            <div className="grid grid-cols-5 gap-3">
                              {COLORS.map(c => (
                                <button key={c.id} onClick={() => { setFormData({ ...formData, colorId: c.id }); setHasUnsavedChanges(true); }} className={`w-10 h-10 rounded-full transition-all relative overflow-hidden ${formData.colorId === c.id ? 'ring-2 ring-offset-2 ring-emerald-400 scale-110' : 'opacity-60 hover:opacity-100'} ring-offset-white`} title={c.name}>
                                  <div className="absolute inset-0" style={{ backgroundColor: c.c1 }} />
                                  <div className="absolute bottom-0 right-0 w-4 h-4 rounded-tl-full" style={{ backgroundColor: c.c4 }} />
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Upload de Logo */}
                          <div className="space-y-2.5">
                            <label className="text-xs font-bold text-slate-500 uppercase flex justify-between items-center">
                              <span>Sua Logomarca (Favicon)</span>
                              {formData.logoBase64 && <button onClick={() => { setFormData(p => ({ ...p, logoBase64: '' })); setHasUnsavedChanges(true); }} className="text-red-600 hover:text-red-500 text-[10px] font-bold">X Remover</button>}
                            </label>
                            
                            {!formData.logoBase64 ? (
                              <div className="space-y-2">
                                <label className="cursor-pointer w-full border border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-4 flex justify-center items-center gap-2 text-xs text-slate-500 hover:text-emerald-600 transition-colors bg-slate-50">
                                  <Upload size={14} /> Fazer Upload da Marca
                                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                </label>
                                <p className="text-[10px] text-slate-400 text-center">
                                  Não tem um logo? <a href="https://www.canva.com/pt_br/criar/logotipo/" target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">Crie de graça no Canva</a>
                                </p>
                              </div>
                            ) : (
                              <div className="h-14 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden p-2">
                                <img src={formData.logoBase64} className="h-full object-contain" alt="Logo" />
                              </div>
                            )}
                          </div>

                          {/* Redes Sociais */}
                          <div className="space-y-3 pt-5 border-t border-slate-200">
                            <label className="text-xs font-bold text-slate-500 uppercase flex gap-1.5"><Globe size={14} /> Redes Sociais</label>
                            <div className="grid grid-cols-2 gap-3">
                              <input className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:border-emerald-500 outline-none" placeholder="WhatsApp (só números)" value={formData.whatsapp} onChange={e => {setFormData({ ...formData, whatsapp: e.target.value }); setHasUnsavedChanges(true)}} />
                              <input className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:border-emerald-500 outline-none" placeholder="Instagram (@usuario)" value={formData.instagram} onChange={e => {setFormData({ ...formData, instagram: e.target.value }); setHasUnsavedChanges(true)}} />
                              <input className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:border-emerald-500 outline-none" placeholder="Facebook (Link)" value={formData.facebook} onChange={e => {setFormData({ ...formData, facebook: e.target.value }); setHasUnsavedChanges(true)}} />
                              <input className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:border-emerald-500 outline-none" placeholder="LinkedIn (Link)" value={formData.linkedin} onChange={e => {setFormData({ ...formData, linkedin: e.target.value }); setHasUnsavedChanges(true)}} />
                              <input className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:border-emerald-500 outline-none" placeholder="TikTok (Link)" value={formData.tiktok} onChange={e => {setFormData({ ...formData, tiktok: e.target.value }); setHasUnsavedChanges(true)}} />
                            </div>
                          </div>

                          {/* Contato e Localização */}
                          <div className="space-y-3 pt-5 border-t border-slate-200">
                            <label className="text-xs font-bold text-slate-500 uppercase flex gap-1.5"><MapPin size={14} /> Contato e Localização</label>
                            <div className="grid grid-cols-2 gap-3">
                              <input className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:border-emerald-500 outline-none" placeholder="Telefone" value={formData.phone} onChange={e => {setFormData({ ...formData, phone: e.target.value }); setHasUnsavedChanges(true)}} />
                              <input className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:border-emerald-500 outline-none" placeholder="E-mail" value={formData.email} onChange={e => {setFormData({ ...formData, email: e.target.value }); setHasUnsavedChanges(true)}} />
                            </div>
                            <input className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:border-emerald-500 outline-none" placeholder="Endereço Físico" value={formData.address} onChange={e => {setFormData({ ...formData, address: e.target.value }); setHasUnsavedChanges(true)}} />
                            
                            <label className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600">
                              <span>Exibir Mapa do Google no site</span>
                              <input type="checkbox" checked={formData.showMap} onChange={e => {setFormData({ ...formData, showMap: e.target.checked }); setHasUnsavedChanges(true)}} className="accent-emerald-500" />
                            </label>

                            <label className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600">
                              <span>Exibir botão Contato flutuante na tela</span>
                              <input type="checkbox" checked={formData.showFloatingContact} onChange={e => {setFormData({ ...formData, showFloatingContact: e.target.checked }); setHasUnsavedChanges(true)}} className="accent-emerald-500" />
                            </label>

                            <label className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600">
                              <span>Exibir formulário de contato no site</span>
                              <input type="checkbox" checked={formData.showForm} onChange={e => {setFormData({ ...formData, showForm: e.target.checked }); setHasUnsavedChanges(true)}} className="accent-emerald-500" />
                            </label>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {activeTab === 'dominio' && generatedHtml && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                      {!currentProjectSlug ? (
                        <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                          <h4 className="text-sm font-bold text-blue-700 flex items-center gap-2"><Globe size={16}/> Qual será o endereço?</h4>
                          <p className="text-xs text-blue-600/80 mb-5 leading-relaxed">Antes de salvar, precisamos saber se você vai usar um domínio oficial (Ex: Registro.br).</p>
                          <Suspense fallback={null}>
                            <DomainChecker onDomainChange={(domain, isLater) => { setOfficialDomain(domain); setRegisterLater(isLater); }} />
                          </Suspense>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-5">
                              <div className="bg-blue-100 p-2.5 rounded-xl"><Globe className="text-blue-600 w-5 h-5" /></div>
                              <div>
                                <h3 className="font-bold text-slate-950 text-sm">Apontamento DNS</h3>
                                <p className="text-[10px] text-slate-500">Configure no seu provedor de domínio</p>
                              </div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                              <div>
                                <div className="flex justify-between items-center mb-1"><span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">TIPO A</span></div>
                                <div className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center"><code className="text-emerald-600 text-xs font-bold select-all">199.36.158.100</code></div>
                              </div>
                              <div>
                                <div className="flex justify-between items-center mb-1"><span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">TIPO TXT</span></div>
                                <div className="bg-white p-3 rounded-xl border border-slate-200"><code className="text-blue-700 text-[10px] break-all select-all block leading-tight">firebase-site-verification={currentProjectSlug}-app</code></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'assinatura' && currentProjectSlug && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                      
                      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 blur-[50px] rounded-full pointer-events-none"></div>
                        
                        <h3 className="text-lg font-black text-slate-950 mb-1 flex items-center gap-2"><CreditCard size={18} className="text-orange-500" /> Painel de Assinatura</h3>
                        <p className="text-xs text-slate-500 mb-6">Gerencie o plano do seu projeto <span className="text-orange-500 font-mono">{currentProjectSlug}</span></p>

                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 mb-6">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold text-slate-500 uppercase">Status Atual</span>
                            {getStatusBadge(savedProjects.find(p => p.id === currentProjectSlug) || {})}
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-orange-400 h-full rounded-full" style={{ width: '100%' }}></div>
                          </div>
                        </div>

                        {/* Exibir planos para assinatura se não pago */}
                        {(!savedProjects.find(p => p.id === currentProjectSlug)?.paymentStatus || savedProjects.find(p => p.id === currentProjectSlug)?.paymentStatus !== 'paid') ? (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Plano Mensal Clarinho */}
                              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors flex flex-col h-full relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-black uppercase px-2 py-1 rounded-bl-lg rounded-tr-lg">Mais Vendido</div>
                                <h4 className="text-blue-700 font-bold mb-2 uppercase tracking-wide text-xs">Plano Mensal</h4>
                                <div className="flex items-end gap-1 mb-4">
                                  <span className="text-3xl font-black text-slate-950">R$ 49,99</span>
                                  <span className="text-xs text-slate-500 font-medium pb-1">/mês</span>
                                </div>
                                <ul className="space-y-2 text-xs text-slate-600 mb-6 flex-1">
                                  <li className="flex items-start gap-2"><CheckCircle size={14} className="text-emerald-600 shrink-0 mt-0.5"/> Domínio próprio</li>
                                  <li className="flex items-start gap-2"><CheckCircle size={14} className="text-emerald-600 shrink-0 mt-0.5"/> Site blindado no Google</li>
                                  <li className="flex items-start gap-2"><CheckCircle size={14} className="text-emerald-600 shrink-0 mt-0.5"/> Suporte prioritário</li>
                                </ul>
                                <button 
                                  onClick={() => handleStripeCheckout(currentProjectSlug, 'mensal')}
                                  disabled={checkoutLoading === currentProjectSlug}
                                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors"
                                >
                                  {checkoutLoading === currentProjectSlug ? 'Processando...' : 'Assinar Mensal'}
                                </button>
                              </div>

                              {/* Plano Anual Clarinho */}
                              <div className="bg-white p-5 rounded-xl border border-orange-200 group-hover:border-orange-300 transition-colors flex flex-col h-full relative overflow-hidden shadow-sm">
                                <div className="absolute top-0 right-0 bg-orange-500 text-white text-[9px] font-black uppercase px-2 py-1 rounded-bl-lg rounded-tr-lg">Mais Econômico</div>
                                <h4 className="text-orange-600 font-bold mb-2 uppercase tracking-wide text-xs">Plano Anual</h4>
                                <div className="flex items-end gap-1 mb-4">
                                  <span className="text-3xl font-black text-slate-950">R$ 499</span>
                                  <span className="text-xs text-slate-500 font-medium pb-1">/ano</span>
                                </div>
                                <ul className="space-y-2 text-xs text-slate-600 mb-6 flex-1">
                                  <li className="flex items-start gap-2"><CheckCircle size={14} className="text-emerald-600 shrink-0 mt-0.5"/> 2 meses grátis</li>
                                  <li className="flex items-start gap-2"><CheckCircle size={14} className="text-emerald-600 shrink-0 mt-0.5"/> Domínio premium</li>
                                  <li className="flex items-start gap-2"><CheckCircle size={14} className="text-emerald-600 shrink-0 mt-0.5"/> Gerente dedicado</li>
                                </ul>
                                <button 
                                  onClick={() => handleStripeCheckout(currentProjectSlug, 'anual')}
                                  disabled={checkoutLoading === currentProjectSlug}
                                  className="w-full bg-orange-500 hover:bg-orange-400 text-white py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors shadow-lg shadow-orange-500/20"
                                >
                                  {checkoutLoading === currentProjectSlug ? 'Processando...' : 'Assinar Anual'}
                                </button>
                              </div>
                            </div>
                            
                            <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 text-[10px] text-slate-500 leading-relaxed font-mono">
                              <strong className="text-slate-700 block mb-1">TERMOS DE RENOVAÇÃO E CICLO DE VIDA:</strong>
                              O site conta com um <span className="text-orange-600 font-bold">período gratuito de 30 dias iniciais</span>. Vencido qualquer plano ou o período gratuito, o site será suspenso ("congelado") após 5 dias de atraso. O sistema exclui permanentemente todos os dados e o site do ar se não houver regularização no prazo de 60 dias após o vencimento, cancelando automaticamente associações na operadora de cartão. 
                            </div>
                            <p className="text-[9px] text-center text-slate-500 flex items-center justify-center gap-1"><ShieldCheck size={10}/> Pagamentos 100% seguros operados globalmente pela Stripe.</p>
                          </div>
                        ) : (
                          // Exibir gestão se já pago
                          <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-xl text-center space-y-4 shadow-sm relative overflow-hidden">
                            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                              <Star size={28} />
                            </div>
                            <h4 className="font-black text-emerald-700 text-lg uppercase tracking-wider">
                              Plano {savedProjects.find(p => p.id === currentProjectSlug)?.planSelected === 'anual' ? 'Anual' : 'Mensal'} Ativo
                            </h4>
                            <p className="text-xs text-emerald-600/70 leading-relaxed max-w-sm mx-auto">
                              Seu site está operando com potência máxima e todos os recursos premium estão liberados.
                            </p>
                            
                            {savedProjects.find(p => p.id === currentProjectSlug)?.cancelAtPeriodEnd ? (
                              <div className="mt-4 bg-yellow-50 border border-yellow-100 p-4 rounded-xl text-left flex gap-3 items-start">
                                <AlertCircle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <h5 className="text-yellow-700 font-bold text-xs mb-1 uppercase tracking-wide">Assinatura Cancelada</h5>
                                  <p className="text-[10px] text-yellow-600/70 leading-relaxed">
                                    Não haverá novas cobranças. O seu site continuará 100% ativo até o fim do período que já foi pago. Após o vencimento, ele será suspenso automaticamente.
                                  </p>
                                </div>
                              </div>
                            ) : (
                              // Botão de upgrade ou cancelamento
                              <>
                                {savedProjects.find(p => p.id === currentProjectSlug)?.planSelected === 'mensal' ? (
                                  <div className="pt-4 mt-2 border-t border-emerald-100 text-left">
                                    <div className="bg-white border border-orange-200 p-5 rounded-xl relative shadow-sm">
                                      <div className="absolute top-0 right-0 bg-orange-500 text-white text-[9px] font-black uppercase px-2 py-1 rounded-bl-lg rounded-tr-lg">Upgrade Exclusivo</div>
                                      <h5 className="text-orange-600 font-bold text-sm mb-1 uppercase tracking-wide">Mudar para Plano Anual</h5>
                                      <p className="text-[10px] text-slate-500 mb-4 leading-relaxed">
                                        Faça o upgrade agora por R$ 499,00. Seu plano atual será substituído imediatamente e você iniciará um novo ciclo ininterrupto de 12 meses.
                                      </p>
                                      <button 
                                        onClick={() => handleStripeCheckout(currentProjectSlug, 'anual')}
                                        disabled={checkoutLoading === currentProjectSlug}
                                        className="w-full bg-orange-500 hover:bg-orange-400 text-white py-3 rounded-lg font-black uppercase tracking-wider text-[10px] transition-colors shadow-lg shadow-orange-500/20 flex justify-center items-center gap-2"
                                      >
                                        {checkoutLoading === currentProjectSlug ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />}
                                        Fazer Upgrade e Pagar R$ 499
                                      </button>
                                    </div>
                                    
                                    <div className="text-center mt-5">
                                      <button 
                                        onClick={() => handleCancelSubscription(currentProjectSlug)}
                                        disabled={isCanceling === currentProjectSlug}
                                        className="text-[10px] font-bold text-red-600/60 hover:text-red-500 transition-colors uppercase tracking-widest"
                                      >
                                        {isCanceling === currentProjectSlug ? 'Processando...' : 'Cancelar Assinatura Mensal'}
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  // Informação do Plano Anual
                                  <div className="pt-4 mt-2 border-t border-emerald-100">
                                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-left flex gap-3 items-start">
                                      <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                      <div>
                                        <h5 className="text-slate-800 font-bold text-xs mb-1 uppercase tracking-wide">Sobre o seu plano</h5>
                                        <p className="text-[10px] text-slate-500 leading-relaxed">
                                          Você está no plano Anual. A alteração para o plano mensal (downgrade) só estará disponível nesta tela após a expiração do seu ciclo atual de 12 meses.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                  
                  {/* Seção de Projetos Salvos (Lista) */}
                  {loggedUserEmail && (
                    <div className="mt-8 border-t border-slate-200 pt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2"><LayoutDashboard size={14} className="text-emerald-600"/>Meus Projetos</p>
                        <button onClick={handleLogout} className="text-[10px] font-bold text-red-600 hover:text-red-500 transition-colors uppercase bg-red-50 px-2.5 py-1 rounded-lg">Sair</button>
                      </div>
                      
                      <div className="max-h-52 overflow-y-auto space-y-2">
                        {savedProjects.length === 0 ? (
                          <p className="text-xs text-slate-500 italic bg-slate-50 p-4 rounded-xl text-center border border-slate-100">Nenhum projeto ainda.</p>
                        ) : (
                          savedProjects.map((p: any) => (
                            <div key={p.id} className="flex flex-col gap-1.5 bg-white border border-slate-100 rounded-xl p-2.5 shadow-sm">
                              <div className="flex items-stretch gap-2 group">
                                <button onClick={() => handleLoadProject(p)} className={`flex-1 text-left text-xs bg-slate-50 hover:bg-slate-100 rounded-lg p-3 flex justify-between items-center transition-all ${currentProjectSlug === p.id ? 'ring-1 ring-emerald-300' : ''}`}>
                                  <div className="flex flex-col truncate pr-2">
                                    <span className="font-bold text-slate-900 truncate flex items-center gap-2">
                                      {p.businessName || 'Sem Nome'} 
                                      {getStatusBadge(p)}
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-mono mt-1">{p.id}.web.app</span>
                                  </div>
                                </button>
                                <button onClick={() => handleDeleteSite(p.id)} className="w-10 bg-slate-50 hover:bg-red-100 hover:text-red-600 text-slate-400 rounded-lg flex items-center justify-center transition-all flex-shrink-0" title="Apagar Site"><Trash2 size={14} /></button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Rodapé do Menu (Botões de Ação) */}
                {generatedHtml && (
                  <div className="p-4 border-t border-slate-200 bg-[#FFFFFF] flex items-center gap-3 flex-shrink-0">
                    <button 
                      onClick={handleSaveOrUpdateSite} disabled={isSavingProject || (!hasUnsavedChanges && currentProjectSlug !== null)}
                      className={`flex-1 py-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${hasUnsavedChanges || !currentProjectSlug ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                    >
                      {isSavingProject ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={14} />}
                      {currentProjectSlug ? 'Atualizar' : 'Salvar Projeto'}
                    </button>

                    <button 
 
                      onClick={handlePublishSite} disabled={isPublishing || hasUnsavedChanges || !currentProjectSlug}
                      className={`flex-1 py-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${!hasUnsavedChanges && currentProjectSlug ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
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
