export const TEMPLATES: Record<string, string> = {
  // =================================================================
  // 1. MODERNO (Glassmorphism + Menu Dock Arrastável)
  // =================================================================
  modern: `
    <!DOCTYPE html>
    <html lang="pt-BR" class="scroll-smooth">
    <head>
      <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://cdn.tailwindcss.com"></script>
      <script>tailwind.config = { theme: { extend: { colors: { primary: '{{COLOR_PRIMARY}}', secondary: '{{COLOR_SECONDARY}}' } } } }</script>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
      <title>{{BUSINESS_NAME}}</title>
      <style>
        body { font-family: 'Inter', sans-serif; background: #f8fafc; overflow-x: hidden; }
        .glass { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.4); box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1); }
        .draggable { cursor: grab; position: fixed; z-index: 50; touch-action: none; }
        .draggable:active { cursor: grabbing; z-index: 60; }
        ::-webkit-scrollbar { width: 0px; }
      </style>
    </head>
    <body class="bg-slate-50 text-slate-800">
      
      <nav class="draggable glass px-8 py-4 rounded-full flex items-center gap-8" style="bottom: 2rem; left: 50%; transform: translateX(-50%);">
         <a href="#home" class="text-slate-500 hover:text-primary transition text-2xl"><i class="fas fa-home"></i></a>
         <a href="#about" class="text-slate-500 hover:text-primary transition text-2xl"><i class="fas fa-user"></i></a>
         <div class="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white text-2xl font-bold -mt-12 border-4 border-slate-50 shadow-xl transform hover:-translate-y-2 transition">
            [[LOGO_AREA]]
         </div>
         <a href="#contact" class="text-slate-500 hover:text-primary transition text-2xl"><i class="fas fa-comment-dots"></i></a>
      </nav>

      <section id="home" class="min-h-screen flex items-center justify-center pt-20 relative">
         <div class="absolute inset-0 z-0 opacity-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
         <div class="text-center max-w-4xl px-6 relative z-10">
            <h1 class="text-6xl md:text-8xl font-black mb-6 tracking-tight text-slate-900">{{HERO_TITLE}}</h1>
            <p class="text-2xl text-slate-600 mb-10 font-light">{{HERO_SUBTITLE}}</p>
            <img src="https://image.pollinations.ai/prompt/3d%20render%20abstract%20minimalist%20shapes%20{{COLOR_PRIMARY}}?width=600&height=400&nologo=true" class="mx-auto drop-shadow-2xl hover:scale-105 transition duration-500" />
         </div>
      </section>

      <section id="about" class="py-32 px-6 bg-white">
         <div class="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
             <img src="https://image.pollinations.ai/prompt/cute%203d%20character%20professional%20{{COLOR_PRIMARY}}?width=400&height=400&nologo=true" class="w-1/2 drop-shadow-xl" />
             <div class="w-full md:w-1/2">
                <h2 class="text-4xl font-bold mb-6 text-primary">{{ABOUT_TITLE}}</h2>
                <p class="text-lg text-slate-600 leading-relaxed">{{ABOUT_TEXT}}</p>
             </div>
         </div>
      </section>

      <div id="contact-widget" class="draggable glass p-6 rounded-2xl w-80 hidden md:block" style="top: 20%; right: 2rem;">
         <div class="flex justify-between mb-4 border-b pb-2"><span class="font-bold text-xs uppercase text-slate-400">Contato</span><i class="fas fa-grip-lines text-slate-300"></i></div>
         <h3 class="font-bold text-lg mb-2">{{CONTACT_CALL}}</h3>
         <div class="flex flex-col gap-2 mt-4">
            [[WHATSAPP_BTN]]
            [[INSTAGRAM_BTN]]
         </div>
      </div>

      <script>
        // Script Universal de Drag & Drop
        document.querySelectorAll('.draggable').forEach(elmnt => {
          let pos1=0, pos2=0, pos3=0, pos4=0;
          elmnt.onmousedown = (e) => {
            e.preventDefault(); pos3 = e.clientX; pos4 = e.clientY;
            document.onmouseup = () => { document.onmouseup = null; document.onmousemove = null; };
            document.onmousemove = (e) => {
              e.preventDefault(); pos1 = pos3 - e.clientX; pos2 = pos4 - e.clientY; pos3 = e.clientX; pos4 = e.clientY;
              elmnt.style.top = (elmnt.offsetTop - pos2) + "px"; elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
              elmnt.style.transform = "none";
            };
          };
        });
      </script>
    </body>
    </html>
  `,

  // =================================================================
  // 2. TECH (HUD Futurista + Neon)
  // =================================================================
  tech: `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://cdn.tailwindcss.com"></script>
      <script>tailwind.config = { theme: { extend: { colors: { neon: '{{COLOR_PRIMARY}}', dark: '#050505' } } } }</script>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
      <title>{{BUSINESS_NAME}}</title>
      <style>
        body { background: #050505; color: white; font-family: monospace; overflow: hidden; background-image: radial-gradient(circle at 1px 1px, #222 1px, transparent 0); background-size: 40px 40px; }
        .hud-panel { background: rgba(5,5,5,0.9); border: 1px solid {{COLOR_PRIMARY}}; box-shadow: 0 0 15px {{COLOR_PRIMARY}}33; position: absolute; cursor: move; }
        .hud-header { background: {{COLOR_PRIMARY}}; color: black; padding: 2px 10px; font-size: 10px; font-weight: bold; text-transform: uppercase; cursor: grab; }
      </style>
    </head>
    <body>
      <div class="hud-panel p-8 w-[600px]" style="top: 50%; left: 50%; transform: translate(-50%, -50%);">
         <div class="hud-header">SYSTEM // MAIN</div>
         <div class="mt-4 text-center">
            <h1 class="text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">{{HERO_TITLE}}</h1>
            <p class="text-neon text-lg tracking-widest mb-8">{{HERO_SUBTITLE}}</p>
            <div class="h-[1px] w-full bg-neon/30 my-6"></div>
            <div class="flex justify-center gap-4">[[WHATSAPP_BTN]] [[INSTAGRAM_BTN]]</div>
         </div>
      </div>
      <div class="hud-panel p-4 w-72" style="top: 10%; left: 5%;">
         <div class="hud-header">DATA // ABOUT</div>
         <div class="mt-2">
             <h3 class="text-neon mb-2">>> {{ABOUT_TITLE}}</h3>
             <p class="text-gray-400 text-xs">{{ABOUT_TEXT}}</p>
             <img src="https://image.pollinations.ai/prompt/cyberpunk%20robot%20toy%20{{COLOR_PRIMARY}}?width=200&height=100&nologo=true" class="mt-2 opacity-80" />
         </div>
      </div>
      <div class="hud-panel p-2" style="top: 5%; right: 5%;"><div class="text-xl font-bold text-neon">[[LOGO_AREA]]</div></div>
      <script>
        document.querySelectorAll('.hud-panel').forEach(elmnt => {
          let pos1=0, pos2=0, pos3=0, pos4=0;
          let header = elmnt.querySelector(".hud-header") || elmnt;
          header.onmousedown = (e) => {
            e.preventDefault(); pos3 = e.clientX; pos4 = e.clientY;
            document.querySelectorAll('.hud-panel').forEach(p => p.style.zIndex = 1); elmnt.style.zIndex = 10;
            document.onmouseup = () => { document.onmouseup = null; document.onmousemove = null; };
            document.onmousemove = (e) => {
              e.preventDefault(); pos1 = pos3 - e.clientX; pos2 = pos4 - e.clientY; pos3 = e.clientX; pos4 = e.clientY;
              elmnt.style.top = (elmnt.offsetTop - pos2) + "px"; elmnt.style.left = (elmnt.offsetLeft - pos1) + "px"; elmnt.style.transform = "none";
            };
          };
        });
      </script>
    </body>
    </html>
  `,

  // =================================================================
  // 3. RETRO (Windows 95 Style)
  // =================================================================
  retro: `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet">
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
      <title>{{BUSINESS_NAME}}</title>
      <style>
        body { background-color: {{COLOR_SECONDARY}}; font-family: 'VT323', monospace; overflow: hidden; }
        .window { position: absolute; background: #c0c0c0; border: 2px solid; border-color: #fff #000 #000 #fff; box-shadow: 4px 4px 0 rgba(0,0,0,0.2); }
        .title-bar { background: {{COLOR_PRIMARY}}; color: white; padding: 2px 4px; display: flex; justify-content: space-between; cursor: default; }
        .btn-win { background: #c0c0c0; border: 1px solid #000; border-top-color: #fff; border-left-color: #fff; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: black; }
      </style>
    </head>
    <body class="bg-teal-700 p-4">
      
      <div class="window w-[500px]" style="top: 10%; left: 20%;" id="win-main">
         <div class="title-bar"><span>{{BUSINESS_NAME}}.exe</span><div class="btn-win">X</div></div>
         <div class="p-4 bg-white text-center">
            <h1 class="text-5xl mb-2">{{HERO_TITLE}}</h1>
            <p class="text-xl mb-4">{{HERO_SUBTITLE}}</p>
            <img src="https://image.pollinations.ai/prompt/pixel%20art%20{{COLOR_PRIMARY}}?width=200&height=150&nologo=true" class="mx-auto border-2 border-black" />
         </div>
      </div>

      <div class="window w-[300px]" style="top: 50%; right: 10%;" id="win-contact">
         <div class="title-bar"><span>Msg.exe</span><div class="btn-win">?</div></div>
         <div class="p-4 bg-gray-200 text-center">
            <p class="text-xl mb-4">{{CONTACT_CALL}}</p>
            <div class="flex flex-col gap-2">[[WHATSAPP_BTN]] [[INSTAGRAM_BTN]]</div>
         </div>
      </div>

      <div class="fixed bottom-0 w-full h-10 bg-[#c0c0c0] border-t-2 border-white flex items-center px-2">
         <button class="flex items-center gap-1 px-2 border-2 border-black border-l-white border-t-white font-bold"><i class="fab fa-windows"></i> INICIAR</button>
      </div>

      <script>
        document.querySelectorAll('.window').forEach(elmnt => {
          let pos1=0, pos2=0, pos3=0, pos4=0;
          let bar = elmnt.querySelector(".title-bar");
          bar.onmousedown = (e) => {
            e.preventDefault(); pos3 = e.clientX; pos4 = e.clientY;
            document.querySelectorAll('.window').forEach(w => w.style.zIndex = 10); elmnt.style.zIndex = 20;
            document.onmouseup = () => { document.onmouseup = null; document.onmousemove = null; };
            document.onmousemove = (e) => {
              e.preventDefault(); pos1 = pos3 - e.clientX; pos2 = pos4 - e.clientY; pos3 = e.clientX; pos4 = e.clientY;
              elmnt.style.top = (elmnt.offsetTop - pos2) + "px"; elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
            };
          };
        });
      </script>
    </body>
    </html>
  `
};
