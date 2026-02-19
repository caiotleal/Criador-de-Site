// src/components/templates.ts

const COMMON_HEAD = `
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">

  <style>
    :root {
      --primary: {{COLOR_PRIMARY}};
      --secondary: {{COLOR_SECONDARY}};
      --text: #0f172a;
      --bg-soft: #f8fafc;
    }

    * { box-sizing: border-box; }
    body {
      font-family: 'Inter', sans-serif;
      -webkit-font-smoothing: antialiased;
      margin: 0;
    }

    .btn-primary {
      background: linear-gradient(90deg, var(--primary), var(--secondary));
      color: #fff;
      border: 0;
      transition: transform .25s ease, box-shadow .25s ease;
      box-shadow: 0 10px 22px -12px color-mix(in srgb, var(--primary) 70%, transparent);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 16px 28px -16px color-mix(in srgb, var(--primary) 75%, transparent);
    }

    .fade-up { animation: fadeUp .7s ease forwards; opacity: 0; }
    .fade-up.d2 { animation-delay: .12s; }
    .fade-up.d3 { animation-delay: .24s; }

    .float-soft { animation: floatSoft 4.5s ease-in-out infinite; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(14px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes floatSoft {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }

    ::-webkit-scrollbar { width: 0; background: transparent; }

    .draggable { cursor: grab; user-select: none; z-index: 60; }
    .draggable:active { cursor: grabbing; }
  </style>

  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: 'var(--primary)',
            accent: 'var(--secondary)',
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
  lovable: `
    <!DOCTYPE html><html lang="pt-BR"><head>${COMMON_HEAD}<title>{{BUSINESS_NAME}}</title></head>
    <body class="bg-white text-slate-900">
      <nav class="sticky top-0 z-40 backdrop-blur bg-white/85 border-b border-slate-100">
        <div class="max-w-6xl mx-auto h-16 px-6 flex items-center justify-between">
          <div class="font-bold text-lg">[[LOGO_AREA]]</div>
          <a href="#contact" class="text-sm font-semibold text-slate-500 hover:text-brand">Contato</a>
        </div>
      </nav>

      <header class="max-w-6xl mx-auto px-6 pt-16 pb-14 text-center">
        <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-semibold fade-up">
          <i class="fas fa-sparkles"></i> Simples, bonito e funcional
        </span>
        <h1 class="fade-up d2 text-4xl md:text-6xl font-extrabold leading-tight mt-5">{{HERO_TITLE}}</h1>
        <p class="fade-up d3 text-slate-600 text-lg max-w-2xl mx-auto mt-5">{{HERO_SUBTITLE}}</p>
        <a href="#contact" class="fade-up d3 btn-primary inline-block mt-8 px-8 py-3 rounded-xl font-semibold">Quero falar agora</a>
      </header>

      <section class="bg-slate-50 border-y border-slate-100">
        <div class="max-w-6xl mx-auto px-6 py-12 grid gap-4 md:grid-cols-3">
          <article class="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm fade-up">
            <div class="w-10 h-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center mb-3"><i class="fas fa-check"></i></div>
            <h3 class="font-bold text-slate-900 mb-2">{{ABOUT_TITLE}}</h3>
            <p class="text-sm text-slate-600">{{ABOUT_TEXT}}</p>
          </article>
          <article class="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm fade-up d2">
            <div class="w-10 h-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center mb-3"><i class="fas fa-bolt"></i></div>
            <h3 class="font-bold text-slate-900 mb-2">Atendimento rápido</h3>
            <p class="text-sm text-slate-600">Processo objetivo para você resolver tudo sem complicação.</p>
          </article>
          <article class="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm fade-up d3">
            <div class="w-10 h-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center mb-3"><i class="fas fa-heart"></i></div>
            <h3 class="font-bold text-slate-900 mb-2">Experiência agradável</h3>
            <p class="text-sm text-slate-600">Visual limpo e com pequenos movimentos para destacar o que importa.</p>
          </article>
        </div>
      </section>

      <div id="contact" class="draggable fixed bottom-5 right-5 w-[92%] sm:w-[360px] bg-white/95 border border-slate-200 rounded-2xl p-5 shadow-2xl float-soft">
        <div class="drag-handle flex items-center justify-between text-xs uppercase tracking-wider text-slate-400 mb-2 cursor-move">
          <span>Arraste o contato</span><i class="fas fa-grip-lines"></i>
        </div>
        <h3 class="text-lg font-bold text-slate-900 mb-3">{{CONTACT_CALL}}</h3>
        <div class="space-y-2">
          [[WHATSAPP_BTN]]
          [[INSTAGRAM_BTN]]
        </div>
      </div>
      ${DRAG_SCRIPT}
    </body></html>
  `,

  base_dark: `
    <!DOCTYPE html><html lang="pt-BR"><head>${COMMON_HEAD}<title>{{BUSINESS_NAME}}</title>
    <style>
      body { background: radial-gradient(circle at 20% 20%, #1f2937 0%, #020617 55%); color: #e2e8f0; min-height: 100vh; }
      .glass { background: rgba(15, 23, 42, .72); border: 1px solid rgba(148, 163, 184, .2); }
    </style></head>
    <body>
      <nav class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div class="font-bold">[[LOGO_AREA]]</div>
        <a href="#contact" class="text-sm text-slate-300 hover:text-white">Contato</a>
      </nav>

      <main class="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 class="fade-up text-4xl md:text-6xl font-extrabold">{{HERO_TITLE}}</h1>
          <p class="fade-up d2 mt-5 text-slate-300">{{HERO_SUBTITLE}}</p>
          <a href="#contact" class="fade-up d3 btn-primary inline-block mt-7 px-7 py-3 rounded-xl font-semibold">Agendar contato</a>
        </div>
        <div class="glass rounded-3xl p-7 fade-up d2">
          <h3 class="font-bold text-xl mb-2">{{ABOUT_TITLE}}</h3>
          <p class="text-slate-300 leading-relaxed">{{ABOUT_TEXT}}</p>
          <div class="mt-6 flex items-center gap-3 text-brand"><i class="fas fa-star"></i><span class="text-sm">Visual moderno com foco em conversão.</span></div>
        </div>
      </main>

      <div id="contact" class="draggable fixed bottom-6 left-1/2 -translate-x-1/2 glass rounded-2xl p-5 w-[92%] sm:w-[380px] shadow-2xl float-soft">
        <div class="drag-handle text-center mb-2 text-slate-500 cursor-move"><i class="fas fa-grip-lines"></i></div>
        <h3 class="text-center text-lg font-bold mb-3">{{CONTACT_CALL}}</h3>
        <div class="space-y-2">[[WHATSAPP_BTN]] [[INSTAGRAM_BTN]]</div>
      </div>
      ${DRAG_SCRIPT}
    </body></html>
  `,

  split: `
    <!DOCTYPE html><html lang="pt-BR"><head>${COMMON_HEAD}<title>{{BUSINESS_NAME}}</title></head>
    <body class="min-h-screen bg-slate-100 text-slate-900 md:flex">
      <section class="md:w-1/2 bg-white p-8 md:p-14 flex flex-col justify-center">
        <div class="font-bold text-lg mb-10">[[LOGO_AREA]]</div>
        <h1 class="fade-up text-4xl md:text-5xl font-extrabold">{{HERO_TITLE}}</h1>
        <p class="fade-up d2 mt-5 text-slate-600">{{HERO_SUBTITLE}}</p>
        <div class="fade-up d3 mt-8 p-5 rounded-2xl border border-slate-200 bg-slate-50">
          <h3 class="font-bold mb-2">{{ABOUT_TITLE}}</h3>
          <p class="text-slate-600 text-sm">{{ABOUT_TEXT}}</p>
        </div>
      </section>

      <section class="md:w-1/2 p-8 md:p-14 flex items-center justify-center relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-brand/20 to-accent/20"></div>
        <div class="relative bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 max-w-sm w-full float-soft">
          <h3 class="text-2xl font-bold mb-2">{{CONTACT_CALL}}</h3>
          <p class="text-slate-600 text-sm mb-4">Escolha o canal e fale com a gente agora.</p>
          <div id="contact" class="space-y-2">
            [[WHATSAPP_BTN]]
            [[INSTAGRAM_BTN]]
          </div>
        </div>
      </section>
    </body></html>
  `
};
