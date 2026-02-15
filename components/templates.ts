// src/components/templates.ts

const COMMON_HEAD = `
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
  
  <style>
    /* VARIÁVEIS CSS REAIS - ISSO GARANTE A COR EXATA */
    :root {
      --primary: {{COLOR_PRIMARY}};
      --secondary: {{COLOR_SECONDARY}};
    }
    
    body { font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
    
    /* Utilitários Lovable Style */
    .btn-primary {
      background-color: var(--primary);
      color: white;
      transition: all 0.2s;
    }
    .btn-primary:hover {
      filter: brightness(110%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .text-brand { color: var(--primary); }
    .bg-brand-light { background-color: var(--primary); opacity: 0.1; }
    .border-brand { border-color: var(--primary); }
    
    /* Scrollbar invisível */
    ::-webkit-scrollbar { width: 0px; background: transparent; }
    
    /* Draggable */
    .draggable { cursor: grab; user-select: none; z-index: 50; }
    .draggable:active { cursor: grabbing; }
  </style>
  
  <script>
    // Configura Tailwind para ler as variáveis CSS
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: 'var(--primary)',
            accent: 'var(--secondary)',
          },
          boxShadow: {
            'lovable': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 0 3px rgba(0,0,0,0.05)',
          }
        }
      }
    }
  </script>
`;

const DRAG_SCRIPT = `
  <script>
    document.querySelectorAll('.draggable').forEach(elmnt => {
      let pos1=0, pos2=0, pos3=0, pos4=0;
      let handle = elmnt.querySelector('.drag-handle') || elmnt;
      handle.onmousedown = (e) => {
        e.preventDefault(); pos3 = e.clientX; pos4 = e.clientY;
        document.onmouseup = () => { document.onmouseup = null; document.onmousemove = null; };
        document.onmousemove = (e) => {
          e.preventDefault(); pos1 = pos3 - e.clientX; pos2 = pos4 - e.clientY; pos3 = e.clientX; pos4 = e.clientY;
          elmnt.style.top = (elmnt.offsetTop - pos2) + "px"; elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
          elmnt.style.transform = 'none';
        };
      };
    });
  </script>
`;

export const TEMPLATES: Record<string, string> = {
  
  // =================================================================
  // 1. LOVABLE LAUNCHPAD (Estilo Startup Clean)
  // Fundo branco, tipografia forte, botões arredondados, foco em conversão.
  // =================================================================
  lovable: `
    <!DOCTYPE html><html lang="pt-BR"><head>${COMMON_HEAD}<title>{{BUSINESS_NAME}}</title></head>
    <body class="bg-white text-slate-900">
      
      <nav class="fixed top-0 w-full bg-white/80 backdrop-blur-md z-40 border-b border-slate-100">
        <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div class="font-bold text-lg tracking-tight">[[LOGO_AREA]]</div>
          <a href="#contact" class="text-sm font-medium hover:text-brand transition">Contato</a>
        </div>
      </nav>

      <section class="pt-32 pb-20 px-6 text-center max-w-4xl mx-auto">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600 mb-6 animate-fade-in">
          <span class="w-2 h-2 rounded-full bg-brand"></span> Novidade
        </div>
        <h1 class="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">{{HERO_TITLE}}</h1>
        <p class="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">{{HERO_SUBTITLE}}</p>
        
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#contact" class="btn-primary px-8 py-4 rounded-xl font-semibold text-lg w-full sm:w-auto">Começar Agora</a>
          <button class="px-8 py-4 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition w-full sm:w-auto">Saber mais</button>
        </div>
      </section>

      <section class="py-20 px-6 bg-slate-50/50">
        <div class="max-w-6xl mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white p-8 rounded-2xl border border-slate-100 shadow-lovable hover:border-brand/30 transition duration-300">
              <div class="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand mb-4"><i class="fas fa-bolt"></i></div>
              <h3 class="font-bold text-lg mb-2 text-slate-800">Rápido e Eficiente</h3>
              <p class="text-slate-500 text-sm leading-relaxed">{{ABOUT_TEXT}}</p>
            </div>
            <div class="bg-white p-8 rounded-2xl border border-slate-100 shadow-lovable hover:border-brand/30 transition duration-300 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-20 h-20 bg-brand/5 rounded-full -mr-10 -mt-10"></div>
              <div class="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand mb-4"><i class="fas fa-star"></i></div>
              <h3 class="font-bold text-lg mb-2 text-slate-800">{{ABOUT_TITLE}}</h3>
              <p class="text-slate-500 text-sm leading-relaxed">Qualidade premium em cada detalhe do nosso serviço.</p>
            </div>
            <div class="bg-white p-8 rounded-2xl border border-slate-100 shadow-lovable hover:border-brand/30 transition duration-300">
              <div class="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand mb-4"><i class="fas fa-shield-alt"></i></div>
              <h3 class="font-bold text-lg mb-2 text-slate-800">Confiabilidade</h3>
              <p class="text-slate-500 text-sm leading-relaxed">Segurança e suporte total para você.</p>
            </div>
          </div>
        </div>
      </section>

      <div id="contact" class="draggable fixed bottom-6 right-6 bg-white p-6 rounded-2xl shadow-2xl border border-slate-100 w-80 z-50">
        <div class="drag-handle flex justify-between items-center mb-4 cursor-move text-slate-400 hover:text-brand">
          <span class="text-xs font-bold uppercase tracking-widest">Contato</span>
          <i class="fas fa-grip-lines"></i>
        </div>
        <h3 class="text-xl font-bold mb-2 text-slate-900">{{CONTACT_CALL}}</h3>
        <p class="text-sm text-slate-500 mb-4">Fale com nossa equipe agora.</p>
        <div class="space-y-3">
          [[WHATSAPP_BTN]]
          [[INSTAGRAM_BTN]]
        </div>
      </div>

      ${DRAG_SCRIPT}
    </body></html>
  `,

  // =================================================================
  // 2. BASE DARK (Estilo SaaS Noturno)
  // Fundo escuro (quase preto), brilhos sutis (glow), texto branco.
  // =================================================================
  base_dark: `
    <!DOCTYPE html><html lang="pt-BR"><head>${COMMON_HEAD}<title>{{BUSINESS_NAME}}</title>
    <style>body { background-color: #0A0A0B; color: #EDEDEF; }</style></head>
    <body>
      
      <div class="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand opacity-20 blur-[120px] rounded-full pointer-events-none z-0"></div>

      <nav class="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div class="font-bold text-xl tracking-tighter">[[LOGO_AREA]]</div>
        <a href="#contact" class="text-sm text-gray-400 hover:text-white transition">Fale Conosco</a>
      </nav>

      <main class="relative z-10 max-w-5xl mx-auto px-6 mt-20 text-center">
        <h1 class="text-6xl md:text-8xl font-bold tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">{{HERO_TITLE}}</h1>
        <p class="text-xl text-gray-400 mb-12 max-w-2xl mx-auto font-light">{{HERO_SUBTITLE}}</p>
        
        <div class="flex justify-center gap-4">
          <a href="#contact" class="bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-gray-200 transition">Começar</a>
          <button class="px-8 py-4 rounded-full border border-gray-800 text-gray-300 hover:border-gray-600 transition">Saiba mais</button>
        </div>
      </main>

      <section class="relative z-10 max-w-7xl mx-auto px-6 mt-32 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-[#121214] border border-white/5 p-10 rounded-3xl hover:border-brand/50 transition duration-500 group">
          <h3 class="text-2xl font-bold mb-4 group-hover:text-brand transition">{{ABOUT_TITLE}}</h3>
          <p class="text-gray-400 leading-relaxed">{{ABOUT_TEXT}}</p>
        </div>
        <div class="bg-[#121214] border border-white/5 p-10 rounded-3xl flex items-center justify-center relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-tr from-brand/10 to-transparent"></div>
          <span class="text-8xl opacity-10 font-black tracking-tighter">FUTURE</span>
        </div>
      </section>

      <div id="contact" class="draggable fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#121214]/90 backdrop-blur border border-white/10 p-6 rounded-2xl w-[90%] max-w-md shadow-2xl z-50 text-center">
        <div class="drag-handle mb-4 text-gray-600 cursor-move"><i class="fas fa-minus"></i></div>
        <h3 class="text-xl font-bold mb-4 text-white">{{CONTACT_CALL}}</h3>
        <div class="flex flex-col gap-3">
           [[WHATSAPP_BTN]]
        </div>
      </div>

      ${DRAG_SCRIPT}
    </body></html>
  `,

  // =================================================================
  // 3. SPLIT MODERN (Estilo Portfolio/Agência)
  // Tela dividida: Esquerda Conteúdo, Direita Imagem/Cor Sólida.
  // =================================================================
  split: `
    <!DOCTYPE html><html lang="pt-BR"><head>${COMMON_HEAD}<title>{{BUSINESS_NAME}}</title></head>
    <body class="bg-slate-50 h-screen overflow-hidden flex flex-col md:flex-row">
      
      <div class="w-full md:w-1/2 h-full overflow-y-auto bg-white p-8 md:p-16 flex flex-col justify-center relative">
        <div class="absolute top-8 left-8 font-bold text-xl tracking-tight text-slate-900">[[LOGO_AREA]]</div>
        
        <div class="max-w-md mx-auto md:mx-0">
           <h1 class="text-5xl font-bold tracking-tight mb-6 text-slate-900">{{HERO_TITLE}}</h1>
           <p class="text-lg text-slate-500 mb-8 border-l-2 border-brand pl-4">{{HERO_SUBTITLE}}</p>
           
           <div class="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
             <h3 class="font-bold text-slate-900 mb-2">{{ABOUT_TITLE}}</h3>
             <p class="text-sm text-slate-600">{{ABOUT_TEXT}}</p>
           </div>
           
           <div id="contact" class="pt-8 border-t border-slate-100">
             <h3 class="font-bold text-xl mb-4">{{CONTACT_CALL}}</h3>
             <div class="flex gap-3">
               [[WHATSAPP_BTN]]
               [[INSTAGRAM_BTN]]
             </div>
           </div>
        </div>
      </div>

      <div class="hidden md:flex w-1/2 h-full bg-slate-100 items-center justify-center relative overflow-hidden">
        <div class="absolute inset-0 bg-brand opacity-10"></div>
        <div class="absolute -top-20 -right-20 w-96 h-96 bg-brand opacity-20 rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-white to-transparent opacity-50"></div>
        
        <div class="draggable bg-white p-8 rounded-3xl shadow-2xl max-w-xs transform rotate-3 hover:rotate-0 transition duration-500 cursor-move border border-slate-100">
           <div class="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center text-xl mb-4 shadow-lg shadow-brand/30">
             <i class="fas fa-arrow-right"></i>
           </div>
           <h3 class="text-2xl font-bold mb-2">Visite-nos</h3>
           <p class="text-slate-500 text-sm">Estamos prontos para transformar sua ideia em realidade.</p>
        </div>
      </div>

      ${DRAG_SCRIPT}
    </body></html>
  `
};
