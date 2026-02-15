// src/components/templates.ts

// Script comum de arrastar (para não repetir 10 vezes)
const DRAG_SCRIPT = `
  <script>
    document.querySelectorAll('.draggable').forEach(elmnt => {
      let pos1=0, pos2=0, pos3=0, pos4=0;
      // Tenta achar um "handle" (cabeçalho) para arrastar, senão usa o elemento todo
      let dragHandle = elmnt.querySelector('.drag-handle') || elmnt;
      
      dragHandle.onmousedown = (e) => {
        e.preventDefault(); pos3 = e.clientX; pos4 = e.clientY;
        // Traz para frente
        document.querySelectorAll('.draggable').forEach(p => p.style.zIndex = 40); elmnt.style.zIndex = 50;
        document.onmouseup = () => { document.onmouseup = null; document.onmousemove = null; };
        document.onmousemove = (e) => {
          e.preventDefault(); pos1 = pos3 - e.clientX; pos2 = pos4 - e.clientY; pos3 = e.clientX; pos4 = e.clientY;
          elmnt.style.top = (elmnt.offsetTop - pos2) + "px"; elmnt.style.left = (elmnt.offsetLeft - pos1) + "px"; 
          elmnt.style.transform = "none"; // Remove centralização CSS se houver
        };
      };
    });
  </script>
`;

// Estilos comuns
const COMMON_HEAD = `
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>tailwind.config = { theme: { extend: { colors: { primary: '{{COLOR_PRIMARY}}', secondary: '{{COLOR_SECONDARY}}' }, fontFamily: { sans: ['Inter', sans-serif] } } } }</script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700;900&display=swap" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
  <title>{{BUSINESS_NAME}}</title>
  <style>
    html { scroll-behavior: smooth; }
    body { font-family: 'Inter', sans-serif; overflow-x: hidden; }
    ::-webkit-scrollbar { width: 8px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: {{COLOR_PRIMARY}}; border-radius: 10px; }
    .draggable { cursor: grab; position: fixed; touch-action: none; user-select: none; } .draggable:active { cursor: grabbing; }
    .glass { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.3); }
    .glass-dark { background: rgba(20, 20, 20, 0.7); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.1); color: white; }
    .neumorph { background: #e0e5ec; box-shadow: 9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5); }
  </style>
`;

export const TEMPLATES: Record<string, string> = {
  // ================= 1. GLASS MINIMAL (Dock Inferior) =================
  temp1: `
    <!DOCTYPE html><html lang="pt-BR"><head>${COMMON_HEAD}</head>
    <body class="bg-slate-50 text-slate-900">
      <nav class="draggable glass px-6 py-3 rounded-full flex items-center gap-6 shadow-xl z-50" style="bottom: 2rem; left: 50%; transform: translateX(-50%);">
         <a href="#home" class="hover:text-primary transition"><i class="fas fa-home"></i></a>
         <a href="#about" class="hover:text-primary transition"><i class="fas fa-info-circle"></i></a>
         <div class="font-bold text-primary px-2">[[LOGO_AREA]]</div>
         <a href="#contact" class="hover:text-primary transition"><i class="fas fa-envelope"></i></a>
      </nav>
      
      <section id="home" class="min-h-screen flex flex-col justify-center items-center text-center px-6 pt-20">
         <h1 class="text-5xl md:text-7xl font-black mb-6 tracking-tight max-w-4xl">{{HERO_TITLE}}</h1>
         <p class="text-xl text-slate-500 mb-8 max-w-2xl">{{HERO_SUBTITLE}}</p>
         <a href="#contact" class="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-secondary transition shadow-lg shadow-primary/30">Começar Agora</a>
      </section>

      <section id="about" class="py-24 px-6 bg-white">
        <div class="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 items-center">
            <div class="h-64 w-full md:w-1/2 bg-primary/10 rounded-3xl flex items-center justify-center text-primary text-6xl"><i class="fas fa-users"></i></div>
            <div class="md:w-1/2">
                <h2 class="text-3xl font-bold mb-4">Quem Somos</h2>
                <h3 class="text-xl font-bold text-primary mb-4">{{ABOUT_TITLE}}</h3>
                <p class="text-slate-600">{{ABOUT_TEXT}}</p>
            </div>
        </div>
      </section>

      <section id="contact" class="py-24 px-6 bg-slate-50">
        <div class="max-w-xl mx-auto glass p-8 rounded-3xl text-center shadow-lg relative overflow-hidden">
           <div class="absolute top-0 left-0 w-full h-2 bg-primary"></div>
           <h2 class="text-3xl font-bold mb-6">{{CONTACT_CALL}}</h2>
           <div class="flex flex-col gap-3">[[WHATSAPP_BTN]] [[INSTAGRAM_BTN]]</div>
        </div>
      </section>
      ${DRAG_SCRIPT}
    </body></html>
  `,

  // ================= 2. SIDEBAR CLEAN (Menu Lateral) =================
  temp2: `
    <!DOCTYPE html><html lang="pt-BR"><head>${COMMON_HEAD}</head>
    <body class="bg-white text-slate-900 flex overflow-x-hidden">
      <nav class="draggable glass flex flex-col p-4 rounded-2xl gap-8 shadow-xl z-50 h-auto fixed left-4 top-1/2 -translate-y-1/2">
         <div class="drag-handle cursor-move text-center text-slate-300 pb-2 border-b border-slate-100"><i class="fas fa-grip-lines"></i></div>
         <a href="#home" class="text-2xl hover:text-primary text-center transition" title="Home"><i class="fas fa-home"></i></a>
         <a href="#about" class="text-2xl hover:text-primary text-center transition" title="Sobre"><i class="fas fa-user"></i></a>
         <a href="#contact" class="text-2xl hover:text-primary text-center transition" title="Contato"><i class="fas fa-paper-plane"></i></a>
      </nav>

      <main class="flex-1 ml-24 md:ml-0">
         <section id="home" class="min-h-screen flex items-center pl-12 md:pl-32 pr-6 bg-slate-50">
            <div class="max-w-3xl">
               <div class="text-primary font-bold mb-4">[[LOGO_AREA]]</div>
               <h1 class="text-6xl font-black mb-6 leading-none">{{HERO_TITLE}}</h1>
               <p class="text-2xl text-slate-600 mb-8 border-l-4 border-primary pl-4">{{HERO_SUBTITLE}}</p>
            </div>
         </section>
         <section id="about" class="py-32 pl-12 md:pl-32 pr-6">
            <div class="max-w-4xl">
                <h2 class="text-sm font-bold text-primary uppercase tracking-widest mb-2">Sobre Nós</h2>
                <h3 class="text-4xl font-bold mb-6">{{ABOUT_TITLE}}</h3>
                <p class="text-lg text-slate-600">{{ABOUT_TEXT}}</p>
            </div>
         </section>
         <section id="contact" class="py-32 pl-12 md:pl-32 pr-6 bg-primary text-white">
            <div class="max-w-4xl">
                <h2 class="text-5xl font-bold mb-8">{{CONTACT_CALL}}</h2>
                <div class="flex gap-4 w-full md:w-auto">[[WHATSAPP_BTN]] [[INSTAGRAM_BTN]]</div>
            </div>
         </section>
      </main>
      ${DRAG_SCRIPT}
    </body></html>
  `,

  // ================= 3. BENTO GRID (Organizado em Blocos) =================
  temp3: `
    <!DOCTYPE html><html lang="pt-BR"><head>${COMMON_HEAD}</head>
    <body class="bg-slate-100 text-slate-900 p-4 md:p-8">
      <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 grid-rows-auto md:grid-rows-[300px_300px_auto] gap-4">
         
         <div class="md:col-span-2 bg-white rounded-3xl p-8 flex items-center justify-between shadow-sm">
            <div class="text-2xl font-bold text-primary">[[LOGO_AREA]]</div>
            <nav class="flex gap-4 font-bold text-sm uppercase tracking-wider">
               <a href="#about" class="hover:text-primary">Sobre</a>
               <a href="#contact" class="hover:text-primary">Contato</a>
            </nav>
         </div>

         <div class="md:col-span-2 bg-primary text-white rounded-3xl p-8 flex items-center shadow-sm">
            <h1 class="text-4xl font-black leading-tight">{{HERO_TITLE}}</h1>
         </div>

         <div class="md:col-span-2 md:row-start-2 bg-white rounded-3xl p-8 flex flex-col justify-center shadow-sm">
            <p class="text-xl text-slate-600 mb-6">{{HERO_SUBTITLE}}</p>
            <a href="#contact" class="text-primary font-bold flex items-center gap-2 hover:gap-4 transition-all">Fale Conosco <i class="fas fa-arrow-right"></i></a>
         </div>

         <div class="md:col-span-2 md:row-start-2 bg-{{COLOR_SECONDARY}} rounded-3xl p-8 flex items-center justify-center text-white text-8xl shadow-sm">
             <i class="fas fa-bolt"></i>
         </div>

         <div id="about" class="md:col-span-3 bg-white rounded-3xl p-12 shadow-sm">
             <h2 class="text-primary font-bold mb-2">Quem Somos</h2>
             <h3 class="text-3xl font-bold mb-4">{{ABOUT_TITLE}}</h3>
             <p class="text-lg text-slate-600">{{ABOUT_TEXT}}</p>
         </div>

         <div id="contact" class="draggable md:col-span-1 bg-slate-900 text-white rounded-3xl p-8 shadow-2xl z-50" style="right: 2rem; bottom: 2rem;">
             <div class="drag-handle mb-4 text-slate-500 cursor-move"><i class="fas fa-grip-lines"></i></div>
             <h2 class="text-xl font-bold mb-6">{{CONTACT_CALL}}</h2>
             <div class="flex flex-col gap-3">[[WHATSAPP_BTN]] [[INSTAGRAM_BTN]]</div>
         </div>
      </div>
      ${DRAG_SCRIPT}
    </body></html>
  `,

  // ================= 4. NEUMORPHISM LIGHT (Suave e Tátil) =================
  temp4: `
    <!DOCTYPE html><html lang="pt-BR"><head>${COMMON_HEAD}
    <style>body { background: #e0e5ec; }</style></head>
    <body class="text-slate-700">
      
      <nav class="fixed top-0 w-full z-40 p-6 flex justify-between items-center mix-blend-multiply">
         <div class="font-bold text-xl text-primary">[[LOGO_AREA]]</div>
      </nav>

      <section class="min-h-screen flex items-center justify-center p-6">
         <div class="max-w-3xl text-center">
            <h1 class="neumorph p-8 rounded-[3rem] text-5xl font-black mb-8 text-slate-800">{{HERO_TITLE}}</h1>
            <p class="text-xl mb-12 px-8">{{HERO_SUBTITLE}}</p>
            <a href="#contact" class="neumorph px-12 py-4 rounded-full font-bold text-primary hover:text-secondary transition inline-block active:shadow-none">Vamos Conversar</a>
         </div>
      </section>

      <div class="draggable neumorph p-8 rounded-3xl w-80 fixed z-50 text-center" style="bottom: 5%; right: 5%;">
         <div class="drag-handle text-slate-400 mb-4 cursor-move"><i class="fas fa-ellipsis-h"></i></div>
         <h3 class="font-bold text-lg mb-4">{{CONTACT_CALL}}</h3>
         <div class="flex flex-col gap-4">[[WHATSAPP_BTN]] [[INSTAGRAM_BTN]]</div>
      </div>

      <section id="about" class="py-24 px-6">
         <div class="max-w-2xl mx-auto neumorph p-12 rounded-[3rem]">
            <h2 class="text-primary font-bold mb-4">{{ABOUT_TITLE}}</h2>
            <p class="text-lg">{{ABOUT_TEXT}}</p>
         </div>
      </section>
      ${DRAG_SCRIPT}
    </body></html>
  `,

  // ================= 5. DARK ELEGANT (Modo Escuro Profissional) =================
  temp5: `
    <!DOCTYPE html><html lang="pt-BR"><head>${COMMON_HEAD}
    <style>body { background: #0f172a; color: white; }</style></head>
    <body>
      <nav class="draggable glass-dark fixed top-4 left-1/2 -translate-x-1/2 px-8 py-4 rounded-full flex items-center gap-8 z-50 shadow-2xl shadow-primary/20">
         <div class="font-bold text-xl tracking-wider">[[LOGO_AREA]]</div>
         <div class="h-6 w-px bg-white/20"></div>
         <a href="#home" class="hover:text-primary transition text-sm uppercase tracking-widest">Home</a>
         <a href="#about" class="hover:text-primary transition text-sm uppercase tracking-widest">Sobre</a>
         <a href="#contact" class="bg-primary px-4 py-1 rounded-full text-sm uppercase tracking-widest hover:bg-secondary transition">Contato</a>
      </nav>

      <section id="home" class="min-h-screen flex items-center justify-center px-6 pt-20 relative overflow-hidden">
         <div class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_{{COLOR_PRIMARY}}33,_transparent_50%)]"></div>
         <div class="text-center max-w-4xl relative z-10">
            <h1 class="text-6xl md:text-8xl font-black mb-8 leading-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">{{HERO_TITLE}}</h1>
            <p class="text-2xl text-slate-300 mb-12 font-light">{{HERO_SUBTITLE}}</p>
         </div>
      </section>

      <section id="about" class="py-32 px-6 bg-slate-900">
         <div class="max-w-3xl mx-auto text-center">
            <h2 class="text-primary text-sm uppercase tracking-[0.3em] mb-4">Nossa Essência</h2>
            <h3 class="text-4xl font-bold mb-8">{{ABOUT_TITLE}}</h3>
            <p class="text-xl text-slate-400 leading-relaxed">{{ABOUT_TEXT}}</p>
         </div>
      </section>

      <div id="contact" class="draggable glass-dark p-8 rounded-2xl w-72 fixed z-50 text-center border-t-4 border-primary" style="bottom: 2rem; left: 2rem;">
         <div class="drag-handle text-slate-500 mb-2 cursor-move"><i class="fas fa-grip-lines-vertical"></i></div>
         <h3 class="font-bold text-lg mb-6">{{CONTACT_CALL}}</h3>
         <div class="flex flex-col gap-3">[[WHATSAPP_BTN]]</div>
      </div>
      ${DRAG_SCRIPT}
    </body></html>
  `,

  // ================= 6. CARD UI (Elementos em Cartões) =================
  temp6: `
    <!DOCTYPE html><html lang="pt-BR"><head>${COMMON_HEAD}</head>
    <body class="bg-slate-200 p-4 md:p-8 min-h-screen flex items-center justify-center">
      <div class="max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 gap-6 relative">
         
         <div class="md:col-span-12 bg-white rounded-2xl p-4 flex justify-between items-center shadow-sm">
            <div class="font-bold text-primary">[[LOGO_AREA]]</div>
            <a href="#contact" class="text-sm font-bold bg-slate-100 px-4 py-2 rounded-xl hover:bg-primary hover:text-white transition">Fale Conosco</a>
         </div>

         <div class="md:col-span-8 bg-white rounded-[2rem] p-8 md:p-12 shadow-md flex flex-col justify-center min-h-[400px]">
            <h1 class="text-5xl font-black mb-6 text-slate-900">{{HERO_TITLE}}</h1>
            <p class="text-xl text-slate-500">{{HERO_SUBTITLE}}</p>
         </div>

         <div class="md:col-span-4 bg-primary rounded-[2rem] p-8 shadow-md flex items-center justify-center text-white">
             <i class="fas fa-fingerprint text-9xl opacity-20"></i>
         </div>

         <div class="md:col-span-7 bg-slate-900 text-white rounded-[2rem] p-10 shadow-md">
            <h3 class="text-2xl font-bold mb-4 text-primary">{{ABOUT_TITLE}}</h3>
            <p class="text-lg text-slate-300">{{ABOUT_TEXT}}</p>
         </div>

         <div class="draggable md:col-span-5 bg-white rounded-[2rem] p-8 shadow-xl z-50 border-2 border-primary" style="position: relative; top:0; left:0;">
             <div class="drag-handle text-center text-slate-300 mb-2 cursor-move"><i class="fas fa-minus"></i></div>
             <h3 class="text-xl font-bold mb-6 text-center">{{CONTACT_CALL}}</h3>
             <div class="flex flex-col gap-3">[[WHATSAPP_BTN]] [[INSTAGRAM_BTN]]</div>
         </div>
      </div>
      ${DRAG_SCRIPT}
    </body></html>
  `,

  // ================= 7. GRADIENT MESH (Fundo Suave Moderno) =================
  temp7: `
    <!DOCTYPE html><html lang="pt-BR"><head>${COMMON_HEAD}
    <style>
      body { background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); min-h-screen; }
      .mesh-bg { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; background: radial-gradient(at 18% 99%, {{COLOR_PRIMARY}}33 0px, transparent 50%), radial-gradient(at 97% 14%, {{COLOR_SECONDARY}}33 0px, transparent 50%), radial-gradient(at 44% 58%, #ffffff55 0px, transparent 50%); filter: blur(60px); opacity: 0.6; }
    </style></head>
    <body class="p-6">
      <div class="mesh-bg"></div>
      
      <nav class="flex justify-between items-center mb-16">
         <div class="glass px-6 py-2 rounded-full font-bold">[[LOGO_AREA]]</div>
      </nav>

      <main class="max-w-4xl mx-auto text-center">
         <div class="glass p-12 rounded-[3rem] shadow-lg mb-8">
            <h1 class="text-6xl font-black mb-8 text-slate-900">{{HERO_TITLE}}</h1>
            <p class="text-2xl text-slate-700">{{HERO_SUBTITLE}}</p>
         </div>

         <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div class="glass p-8 rounded-3xl shadow-sm">
               <h3 class="font-bold text-xl mb-4 text-primary">{{ABOUT_TITLE}}</h3>
               <p class="text-slate-700">{{ABOUT_TEXT}}</p>
            </div>
            
            <div class="draggable glass p-8 rounded-3xl shadow-xl z-50 bg-white/80">
               <div class="drag-handle text-right text-slate-400 cursor-move"><i class="fas fa-expand"></i></div>
               <h3 class="font-bold text-xl mb-6">{{CONTACT_CALL}}</h3>
               <div class="flex flex-col gap-3">[[WHATSAPP_BTN]]</div>
            </div>
         </div>
      </main>
      ${DRAG_SCRIPT}
    </body></html>
  `,

  // ================= 8. TYPOGRAPHY FOCUS (Foco no Texto) =================
  temp8: `
    <!DOCTYPE html><html lang="pt-BR"><head>${COMMON_HEAD}</head>
    <body class="bg-white text-black">
      
      <nav class="p-6 flex justify-between items-end border-b-2 border-black">
         <div class="text-4xl font-black tracking-tighter uppercase">[[LOGO_AREA]]</div>
         <a href="#contact" class="font-bold underline decoration-2 underline-offset-4 hover:text-primary transition">Contato</a>
      </nav>

      <section class="py-24 px-6 max-w-5xl mx-auto">
         <h1 class="text-7xl md:text-9xl font-black mb-12 leading-[0.85] tracking-tight">{{HERO_TITLE}}</h1>
         <p class="text-3xl font-bold text-primary max-w-3xl border-l-8 border-black pl-6">{{HERO_SUBTITLE}}</p>
      </section>

      <section class="py-24 px-6 bg-slate-100">
         <div class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            <h2 class="text-xl font-bold uppercase tracking-widest md:text-right">{{ABOUT_TITLE}}</h2>
            <p class="md:col-span-2 text-2xl font-medium leading-relaxed">{{ABOUT_TEXT}}</p>
         </div>
      </section>

      <div class="draggable fixed bottom-4 right-4 bg-primary text-white p-6 w-72 shadow-[8px_8px_0_#000] border-2 border-black z-50">
         <div class="drag-handle text-right mb-4 cursor-move"><i class="fas fa-arrows-alt"></i></div>
         <h3 class="text-2xl font-black mb-6 uppercase">{{CONTACT_CALL}}</h3>
         <div class="flex flex-col gap-3">[[WHATSAPP_BTN]] [[INSTAGRAM_BTN]]</div>
      </div>
      ${DRAG_SCRIPT}
    </body></html>
  `,

  // ================= 9. SPLIT SCREEN MODERN (Tela Dividida) =================
  temp9: `
    <!DOCTYPE html><html lang="pt-BR"><head>${COMMON_HEAD}</head>
    <body class="flex flex-col md:flex-row min-h-screen">
      
      <div class="w-full md:w-1/2 p-12 md:p-24 flex flex-col justify-center bg-white relative">
         <div class="absolute top-8 left-8 font-bold text-xl">[[LOGO_AREA]]</div>
         
         <h1 class="text-6xl font-black mb-8">{{HERO_TITLE}}</h1>
         <p class="text-xl text-slate-600 mb-12">{{HERO_SUBTITLE}}</p>
         
         <div class="mb-16">
            <h3 class="text-primary font-bold mb-2">{{ABOUT_TITLE}}</h3>
            <p class="text-slate-600 max-w-md">{{ABOUT_TEXT}}</p>
         </div>

         <div class="draggable bg-slate-50 p-8 rounded-2xl shadow-lg border-l-4 border-primary max-w-sm z-50">
             <div class="drag-handle text-slate-300 mb-2 cursor-move text-right"><i class="fas fa-grip-horizontal"></i></div>
             <h3 class="font-bold text-lg mb-6">{{CONTACT_CALL}}</h3>
             <div class="flex flex-col gap-3">[[WHATSAPP_BTN]]</div>
         </div>
      </div>

      <div class="w-full md:w-1/2 bg-{{COLOR_PRIMARY}} relative overflow-hidden flex items-center justify-center p-12">
         <div class="absolute inset-0 bg-gradient-to-br from-transparent to-black/20"></div>
         <div class="text-[20vw] text-white opacity-10 font-black absolute top-0 right-0 leading-none">DESIGN</div>
         <i class="fas fa-layer-group text-white text-9xl relative z-10 drop-shadow-2xl"></i>
      </div>

      ${DRAG_SCRIPT}
    </body></html>
  `,

  // ================= 10. MINIMALIST STORE (Estilo E-commerce Limpo) =================
  temp10: `
    <!DOCTYPE html><html lang="pt-BR"><head>${COMMON_HEAD}</head>
    <body class="bg-white text-slate-900">
      
      <nav class="p-6 flex justify-center border-b border-slate-100">
         <div class="font-bold text-2xl tracking-tight">[[LOGO_AREA]]</div>
      </nav>

      <section class="text-center py-24 px-6 max-w-4xl mx-auto">
         <span class="text-primary text-sm font-bold uppercase tracking-widest mb-4 inline-block">Novo</span>
         <h1 class="text-5xl md:text-7xl font-medium mb-8">{{HERO_TITLE}}</h1>
         <p class="text-xl text-slate-500 mb-12">{{HERO_SUBTITLE}}</p>
         <a href="#contact" class="bg-slate-900 text-white px-8 py-4 rounded-full hover:bg-primary transition">Entrar em Contato</a>
      </section>

      <section class="py-24 bg-slate-50 px-6">
         <div class="max-w-2xl mx-auto text-center">
             <h3 class="text-2xl font-medium mb-6">{{ABOUT_TITLE}}</h3>
             <p class="text-slate-600 leading-relaxed">{{ABOUT_TEXT}}</p>
             <div class="mt-8 h-1 w-24 bg-primary mx-auto"></div>
         </div>
      </section>

      <div class="draggable glass fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md p-4 rounded-2xl shadow-xl z-50 flex items-center justify-between">
         <div>
            <div class="drag-handle text-slate-300 text-xs cursor-move"><i class="fas fa-grip-lines"></i></div>
            <h3 class="font-bold text-sm">{{CONTACT_CALL}}</h3>
         </div>
         <div class="flex gap-2 scale-90 origin-right">[[WHATSAPP_BTN]]</div>
      </div>
      ${DRAG_SCRIPT}
    </body></html>
  `
};
