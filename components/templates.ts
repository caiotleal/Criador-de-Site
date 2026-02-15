export const TEMPLATES: Record<string, string> = {
  // =================================================================
  // 1. MODERNO & LUXO (Menu Dock Flutuante + Scroll Suave + AOS)
  // =================================================================
  modern: `
    <!DOCTYPE html>
    <html lang="pt-BR" class="scroll-smooth">
    <head>
      <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
      <title>{{BUSINESS_NAME}}</title>
      <style>
        ::-webkit-scrollbar { width: 0px; background: transparent; }
        .glass-panel { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.5); }
        .social-btn:hover { transform: translateY(-5px); box-shadow: 0 10px 20px -5px rgba(0,0,0,0.2); }
      </style>
    </head>
    <body class="bg-slate-50 text-slate-900 antialiased pb-32">
      
      <nav class="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <div class="glass-panel px-6 py-4 rounded-full shadow-2xl flex items-center gap-8 transition-all hover:scale-105 duration-300">
          <a href="#home" class="text-slate-500 hover:text-indigo-600 transition text-xl"><i class="fas fa-home"></i></a>
          <a href="#features" class="text-slate-500 hover:text-indigo-600 transition text-xl"><i class="fas fa-star"></i></a>
          <div class="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold -mt-16 border-4 border-slate-50 shadow-lg relative top-4 hover:rotate-12 transition">
             <i class="fas fa-bolt"></i>
          </div>
          <a href="#about" class="text-slate-500 hover:text-indigo-600 transition text-xl"><i class="fas fa-user"></i></a>
          <a href="#contact" class="text-slate-500 hover:text-indigo-600 transition text-xl"><i class="fas fa-envelope"></i></a>
        </div>
      </nav>

      <section id="home" class="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div class="absolute inset-0 z-0">
          <img src="https://image.pollinations.ai/prompt/minimalist%20bright%20white%20office%20luxury?width=1920&height=1080&nologo=true" class="w-full h-full object-cover opacity-30" />
          <div class="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50"></div>
        </div>
        
        <div class="relative z-10 text-center max-w-4xl px-6" data-aos="fade-up" data-aos-duration="1000">
          <div class="inline-block px-4 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold mb-6 tracking-wide uppercase">
            {{BUSINESS_NAME}}
          </div>
          <h1 class="text-5xl md:text-8xl font-black tracking-tight text-slate-900 mb-8 leading-tight">
            {{HERO_TITLE}}
          </h1>
          <p class="text-xl md:text-2xl text-slate-600 mb-10 font-light max-w-2xl mx-auto">
            {{HERO_SUBTITLE}}
          </p>
          <div class="flex justify-center gap-4">
            <a href="#contact" class="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30 flex items-center gap-2">
              Começar Agora <i class="fas fa-arrow-right"></i>
            </a>
          </div>
        </div>
      </section>

      <section id="features" class="py-24 px-6">
        <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="group bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-100" data-aos="fade-up" data-aos-delay="100">
              <div class="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 text-2xl mb-6 group-hover:scale-110 transition">
                <i class="fas fa-gem"></i>
              </div>
              <h3 class="text-2xl font-bold mb-3">{{FEATURE_1_TITLE}}</h3>
              <p class="text-slate-500">{{FEATURE_1_DESC}}</p>
            </div>
            
            <div class="group bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-100" data-aos="fade-up" data-aos-delay="200">
              <div class="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 text-2xl mb-6 group-hover:scale-110 transition">
                <i class="fas fa-rocket"></i>
              </div>
              <h3 class="text-2xl font-bold mb-3">{{FEATURE_2_TITLE}}</h3>
              <p class="text-slate-500">{{FEATURE_2_DESC}}</p>
            </div>

            <div class="group bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-100" data-aos="fade-up" data-aos-delay="300">
              <div class="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 text-2xl mb-6 group-hover:scale-110 transition">
                <i class="fas fa-shield-alt"></i>
              </div>
              <h3 class="text-2xl font-bold mb-3">{{FEATURE_3_TITLE}}</h3>
              <p class="text-slate-500">{{FEATURE_3_DESC}}</p>
            </div>
        </div>
      </section>

      <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
      <script> AOS.init({ once: true, offset: 50 }); </script>
    </body>
    </html>
  `,

  // =================================================================
  // 2. TECH & FUTURISTA (Menu Tela Cheia + Mouse Follower + GSAP)
  // =================================================================
  tech: `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
      <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
      <script>
        tailwind.config = { theme: { extend: { colors: { neon: '#00f3ff', dark: '#050505' } } } }
      </script>
      <title>{{BUSINESS_NAME}}</title>
      <style>
        body { background-color: #050505; color: #fff; cursor: none; overflow-x: hidden; }
        
        /* CURSOR PERSONALIZADO */
        .cursor-dot, .cursor-outline { position: fixed; top: 0; left: 0; transform: translate(-50%, -50%); border-radius: 50%; z-index: 9999; pointer-events: none; }
        .cursor-dot { width: 8px; height: 8px; background: #00f3ff; }
        .cursor-outline { width: 40px; height: 40px; border: 1px solid rgba(0, 243, 255, 0.5); transition: width 0.2s, height 0.2s; }
        
        /* MENU OVERLAY */
        .menu-overlay { clip-path: circle(0% at 100% 0); transition: clip-path 0.8s cubic-bezier(0.86, 0, 0.07, 1); }
        .menu-overlay.active { clip-path: circle(150% at 100% 0); }
      </style>
    </head>
    <body class="font-mono">
      
      <div class="cursor-dot"></div>
      <div class="cursor-outline"></div>

      <nav class="fixed top-0 w-full z-50 px-8 py-6 flex justify-between items-center mix-blend-difference">
        <div class="text-neon text-xl font-bold tracking-widest">{{BUSINESS_NAME}}</div>
        
        <button id="menu-btn" class="group relative w-12 h-12 flex flex-col justify-center items-end gap-1.5 z-50">
           <span class="w-8 h-0.5 bg-neon group-hover:w-10 transition-all duration-300"></span>
           <span class="w-6 h-0.5 bg-neon group-hover:w-10 transition-all duration-300 delay-75"></span>
           <span class="w-4 h-0.5 bg-neon group-hover:w-10 transition-all duration-300 delay-100"></span>
        </button>
      </nav>

      <div id="menu-overlay" class="menu-overlay fixed inset-0 bg-neon z-40 flex items-center justify-center">
        <div class="text-dark text-center space-y-4">
           <a href="#" class="block text-6xl font-black hover:text-white transition uppercase tracking-tighter menu-link">Home</a>
           <a href="#" class="block text-6xl font-black hover:text-white transition uppercase tracking-tighter menu-link">Services</a>
           <a href="#" class="block text-6xl font-black hover:text-white transition uppercase tracking-tighter menu-link">About</a>
           <a href="#" class="block text-6xl font-black hover:text-white transition uppercase tracking-tighter menu-link">Contact</a>
        </div>
      </div>

      <section class="h-screen flex flex-col justify-center items-center relative px-6 border-b border-white/10">
        <div class="absolute inset-0 z-0 opacity-20">
           <img src="https://image.pollinations.ai/prompt/cyberpunk%20grid%20neon%20dark?width=1920&height=1080&nologo=true" class="w-full h-full object-cover" />
        </div>
        
        <h1 id="hero-title" class="text-6xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 z-10 text-center leading-none mb-8 opacity-0">
          {{HERO_TITLE}}
        </h1>
        <p class="text-neon text-xl tracking-[0.3em] uppercase z-10 text-center">{{HERO_SUBTITLE}}</p>
      </section>

      <section class="py-32 px-6 bg-dark">
        <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
           <div class="border border-white/20 p-8 hover:bg-white/5 transition duration-500 group">
              <h3 class="text-2xl text-neon mb-4 group-hover:translate-x-2 transition">{{FEATURE_1_TITLE}}</h3>
              <p class="text-gray-400">{{FEATURE_1_DESC}}</p>
           </div>
           <div class="border border-white/20 p-8 hover:bg-white/5 transition duration-500 group">
              <h3 class="text-2xl text-neon mb-4 group-hover:translate-x-2 transition">{{FEATURE_2_TITLE}}</h3>
              <p class="text-gray-400">{{FEATURE_2_DESC}}</p>
           </div>
           <div class="border border-white/20 p-8 hover:bg-white/5 transition duration-500 group">
              <h3 class="text-2xl text-neon mb-4 group-hover:translate-x-2 transition">{{FEATURE_3_TITLE}}</h3>
              <p class="text-gray-400">{{FEATURE_3_DESC}}</p>
           </div>
        </div>
      </section>

      <script>
        // MOUSE FOLLOWER
        const dot = document.querySelector('.cursor-dot');
        const outline = document.querySelector('.cursor-outline');
        window.addEventListener('mousemove', (e) => {
           dot.style.left = \`\${e.clientX}px\`; dot.style.top = \`\${e.clientY}px\`;
           outline.animate({ left: \`\${e.clientX}px\`, top: \`\${e.clientY}px\` }, { duration: 500, fill: "forwards" });
        });

        // MENU TOGGLE
        const btn = document.getElementById('menu-btn');
        const overlay = document.getElementById('menu-overlay');
        const links = document.querySelectorAll('.menu-link');
        let isOpen = false;
        btn.addEventListener('click', () => {
           isOpen = !isOpen;
           if(isOpen) {
             overlay.classList.add('active');
             gsap.fromTo(links, {y: 50, opacity:0}, {y:0, opacity:1, duration: 0.5, stagger: 0.1, delay: 0.3});
           } else {
             overlay.classList.remove('active');
           }
        });

        // HERO ANIMATION
        gsap.to("#hero-title", { duration: 1.5, opacity: 1, ease: "power4.out", delay: 0.5 });
      </script>
    </body>
    </html>
  `,

  // =================================================================
  // 3. RETRO & ROCK (Brutalista + Marquee Infinito)
  // =================================================================
  retro: `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;700&display=swap" rel="stylesheet">
      <title>{{BUSINESS_NAME}}</title>
      <style>
        body { font-family: 'Space Grotesk', sans-serif; background-color: #FFDE00; color: #000; }
        .brutal-border { border: 3px solid #000; box-shadow: 8px 8px 0px #000; transition: all 0.2s; }
        .brutal-border:hover { transform: translate(-4px, -4px); box-shadow: 12px 12px 0px #000; }
        
        /* MARQUEE ANIMATION */
        .marquee-container { overflow: hidden; white-space: nowrap; border-top: 3px solid #000; border-bottom: 3px solid #000; background: #fff; padding: 15px 0; }
        .marquee-content { display: inline-block; animation: marquee 20s linear infinite; font-size: 2rem; font-weight: bold; text-transform: uppercase; }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      </style>
    </head>
    <body class="overflow-x-hidden">
      
      <nav class="flex justify-between items-center p-6 border-b-4 border-black bg-white">
         <div class="text-3xl font-black uppercase italic tracking-tighter">{{BUSINESS_NAME}}</div>
         <a href="#contact" class="bg-black text-white px-8 py-3 text-xl font-bold hover:bg-pink-500 transition-colors border-2 border-transparent hover:border-black">START</a>
      </nav>

      <header class="grid grid-cols-1 md:grid-cols-2 min-h-[80vh] border-b-4 border-black">
         <div class="p-12 flex flex-col justify-center bg-pink-400 border-b-4 md:border-b-0 md:border-r-4 border-black">
            <h1 class="text-7xl font-black mb-8 leading-[0.9] uppercase">{{HERO_TITLE}}</h1>
            <p class="text-2xl font-bold bg-white inline-block p-4 border-4 border-black mb-8 transform -rotate-2 w-fit shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">{{HERO_SUBTITLE}}</p>
         </div>
         <div class="relative overflow-hidden bg-blue-400">
            <img src="https://image.pollinations.ai/prompt/pop%20art%20collage%20retro%20abstract?width=800&height=800&nologo=true" class="w-full h-full object-cover mix-blend-multiply opacity-80 grayscale hover:grayscale-0 transition duration-500"/>
            <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/halftone.png')] opacity-20"></div>
         </div>
      </header>

      <div class="marquee-container">
         <div class="marquee-content">
            {{BUSINESS_NAME}} ★ QUALIDADE MÁXIMA ★ DESIGN ÚNICO ★ FALE CONOSCO ★ {{BUSINESS_NAME}} ★ QUALIDADE MÁXIMA ★ DESIGN ÚNICO ★ FALE CONOSCO ★
         </div>
      </div>

      <section class="p-12 bg-[#FFDE00]">
         <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div class="brutal-border bg-white p-8">
               <h3 class="text-4xl font-black mb-4">01.</h3>
               <h4 class="text-2xl font-bold mb-2">{{FEATURE_1_TITLE}}</h4>
               <p class="text-lg">{{FEATURE_1_DESC}}</p>
            </div>
            <div class="brutal-border bg-blue-300 p-8">
               <h3 class="text-4xl font-black mb-4">02.</h3>
               <h4 class="text-2xl font-bold mb-2">{{FEATURE_2_TITLE}}</h4>
               <p class="text-lg">{{FEATURE_2_DESC}}</p>
            </div>
            <div class="brutal-border bg-pink-300 p-8">
               <h3 class="text-4xl font-black mb-4">03.</h3>
               <h4 class="text-2xl font-bold mb-2">{{FEATURE_3_TITLE}}</h4>
               <p class="text-lg">{{FEATURE_3_DESC}}</p>
            </div>
         </div>
      </section>

      <footer class="bg-black text-white p-12 text-center border-t-4 border-white">
         <p class="text-xl font-bold uppercase">{{BUSINESS_NAME}} © 2024</p>
      </footer>
    </body>
    </html>
  `
};
