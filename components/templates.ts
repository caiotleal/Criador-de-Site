const baseStyles = `
  <style>
    html { scroll-behavior: smooth; }
    body { background-color: {{COLOR_1}}; color: {{COLOR_LIGHT}}; overflow-x: hidden; }
    
    /* Efeito Vidro (Glassmorphism) Invisível */
    .ux-glass {
      background: {{COLOR_2}}40; /* Transparência suave */
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid {{COLOR_3}}50;
    }
    
    /* Tipografia Elegante e Proporcional (Menos Agressiva) */
    .hero-title { font-size: clamp(2.25rem, 5vw, 4rem); line-height: 1.1; letter-spacing: -0.02em; }
    .section-title { font-size: clamp(1.75rem, 4vw, 2.75rem); line-height: 1.2; letter-spacing: -0.01em; }

    /* Animações de Entrada (Scroll Reveal) */
    .nav-enter { animation: slideDown 1s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
    @keyframes slideDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

    .reveal-up { opacity: 0; transform: translateY(50px); transition: all 1s cubic-bezier(0.22, 1, 0.36, 1); }
    .reveal-up.active { opacity: 1; transform: translateY(0); }

    .reveal-down { opacity: 0; transform: translateY(-50px); transition: all 1s cubic-bezier(0.22, 1, 0.36, 1); }
    .reveal-down.active { opacity: 1; transform: translateY(0); }

    .reveal-left { opacity: 0; transform: translateX(-50px); transition: all 1s cubic-bezier(0.22, 1, 0.36, 1); }
    .reveal-left.active { opacity: 1; transform: translateX(0); }

    .reveal-right { opacity: 0; transform: translateX(50px); transition: all 1s cubic-bezier(0.22, 1, 0.36, 1); }
    .reveal-right.active { opacity: 1; transform: translateX(0); }

    /* Botões Modernos */
    .btn-hover { transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1); }
    .btn-hover:hover { transform: translateY(-3px) scale(1.02); filter: brightness(1.15); box-shadow: 0 10px 25px -5px {{COLOR_4}}60; }
    .btn-hover:active { transform: translateY(0) scale(0.98); }
  </style>

  <script>
    document.addEventListener("DOMContentLoaded", () => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
      }, { threshold: 0.15 });
      document.querySelectorAll('.reveal-up, .reveal-down, .reveal-left, .reveal-right').forEach(el => observer.observe(el));
    });
  </script>
`;

const navBar = `
  <nav class="fixed w-full z-50 ux-glass nav-enter border-b-0">
    <div class="max-w-7xl mx-auto px-6 h-20 md:h-24 flex items-center justify-between">
      <div class="flex items-center gap-2">[[LOGO_AREA]]</div>
      <div class="hidden md:flex items-center gap-8 text-sm font-bold tracking-widest uppercase">
        <a href="#sobre" class="opacity-60 hover:opacity-100 transition-opacity">Sobre</a>
        <a href="#contato" class="px-8 py-3 rounded-full font-black tracking-widest btn-hover" style="background-color: {{COLOR_4}}; color: {{COLOR_DARK}};">Solicitar</a>
      </div>
    </div>
  </nav>
`;

export const TEMPLATES: Record<string, string> = {
  layout_modern_center: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>{{BUSINESS_NAME}}</title>
  <script src="https://cdn.tailwindcss.com"></script>${baseStyles}
</head>
<body class="antialiased font-sans selection:bg-[{{COLOR_4}}] selection:text-[{{COLOR_DARK}}]">
  ${navBar}
  <main>
    <section class="min-h-screen flex flex-col items-center justify-center pt-24 px-4 relative overflow-hidden">
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] bg-[{{COLOR_4}}]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div class="max-w-4xl mx-auto text-center relative z-10 reveal-up">
        <h1 class="hero-title font-black mb-6 italic uppercase text-transparent bg-clip-text bg-gradient-to-br from-[{{COLOR_LIGHT}}] to-[{{COLOR_5}}]">{{HERO_TITLE}}</h1>
        <p class="text-lg md:text-xl opacity-70 mb-10 max-w-2xl mx-auto font-light leading-relaxed">{{HERO_SUBTITLE}}</p>
        <a href="#contato" class="inline-block px-10 py-4 rounded-full font-black text-sm md:text-base tracking-widest uppercase btn-hover shadow-xl" style="background-color: {{COLOR_LIGHT}}; color: {{COLOR_1}};">Falar com Especialista</a>
      </div>
    </section>

    <section id="sobre" class="py-24 px-4 max-w-6xl mx-auto">
      <div class="grid md:grid-cols-2 gap-6">
        <div class="ux-glass p-10 md:p-14 rounded-[2rem] reveal-left">
          <h2 class="section-title font-black mb-4 italic">{{ABOUT_TITLE}}</h2>
        </div>
        <div class="ux-glass p-10 md:p-14 rounded-[2rem] reveal-right flex items-center">
          <p class="text-lg md:text-xl opacity-70 leading-relaxed">{{ABOUT_TEXT}}</p>
        </div>
      </div>
    </section>

    <section id="contato" class="py-24 px-4 max-w-3xl mx-auto reveal-up">
      <div class="text-center mb-12">
        <h2 class="section-title font-black mb-4 italic">{{CONTACT_CALL}}</h2>
        <p class="opacity-60 text-base md:text-lg">{{ADDRESS}} <br/> {{PHONE}} • {{EMAIL}}</p>
      </div>
      [[CONTACT_FORM]]
      [[MAP_AREA]]
      <div class="flex justify-center gap-4 mt-10">[[WHATSAPP_BTN]][[INSTAGRAM_BTN]][[FACEBOOK_BTN]][[TIKTOK_BTN]]</div>
    </section>
  </main>
</body></html>`,

  layout_modern_split: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>{{BUSINESS_NAME}}</title>
  <script src="https://cdn.tailwindcss.com"></script>${baseStyles}
</head>
<body class="antialiased font-sans selection:bg-[{{COLOR_4}}] selection:text-[{{COLOR_DARK}}]">
  ${navBar}
  <main>
    <section class="min-h-screen flex items-center pt-20 px-6 md:px-12 relative overflow-hidden">
      <div class="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
        <div class="relative z-10 reveal-left">
          <h1 class="hero-title font-black mb-6 italic uppercase">{{HERO_TITLE}}</h1>
          <p class="text-lg md:text-xl opacity-70 mb-8 font-light leading-relaxed">{{HERO_SUBTITLE}}</p>
          <a href="#contato" class="inline-block px-10 py-4 rounded-full font-black text-sm tracking-widest uppercase btn-hover" style="background-color: {{COLOR_4}}; color: {{COLOR_DARK}};">Iniciar Projeto</a>
        </div>
        <div class="h-[50vh] md:h-[60vh] rounded-[2.5rem] ux-glass reveal-right relative overflow-hidden flex items-center justify-center">
           <div class="absolute inset-0 bg-gradient-to-tr from-[{{COLOR_4}}]/20 to-transparent"></div>
           <div class="w-40 h-40 rounded-full bg-[{{COLOR_4}}]/30 blur-3xl absolute"></div>
        </div>
      </div>
    </section>

    <section id="sobre" class="py-24 px-6 max-w-5xl mx-auto reveal-up">
      <div class="ux-glass p-10 md:p-16 rounded-[2.5rem] text-center">
        <h2 class="section-title font-black mb-6 italic">{{ABOUT_TITLE}}</h2>
        <p class="text-lg md:text-xl opacity-70 leading-relaxed mx-auto">{{ABOUT_TEXT}}</p>
      </div>
    </section>

    <section id="contato" class="py-24 px-6 max-w-3xl mx-auto reveal-up">
      <h2 class="section-title font-black mb-10 text-center italic">{{CONTACT_CALL}}</h2>
      [[CONTACT_FORM]]
      <div class="mt-8 text-center opacity-60 text-sm md:text-base">{{ADDRESS}} <br/> {{PHONE}}</div>
      <div class="flex justify-center gap-4 mt-8">[[WHATSAPP_BTN]][[INSTAGRAM_BTN]][[TIKTOK_BTN]]</div>
    </section>
  </main>
</body></html>`,

  layout_glass_grid: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>{{BUSINESS_NAME}}</title>
  <script src="https://cdn.tailwindcss.com"></script>${baseStyles}
</head>
<body class="antialiased font-sans selection:bg-[{{COLOR_4}}] selection:text-[{{COLOR_DARK}}]">
  ${navBar}
  <main class="max-w-7xl mx-auto px-4 pt-32 pb-24 space-y-6">
    
    <div class="grid md:grid-cols-3 gap-6">
      <div class="md:col-span-2 ux-glass p-10 md:p-16 rounded-[2.5rem] reveal-down flex flex-col justify-center min-h-[50vh]">
        <h1 class="hero-title font-black mb-6 italic uppercase">{{HERO_TITLE}}</h1>
        <p class="text-lg md:text-xl opacity-70 max-w-2xl leading-relaxed">{{HERO_SUBTITLE}}</p>
      </div>
      <div class="ux-glass p-10 rounded-[2.5rem] reveal-right flex flex-col justify-between min-h-[50vh]">
        <div class="w-14 h-14 rounded-full flex items-center justify-center mb-8 text-xl" style="background: {{COLOR_4}}; color: {{COLOR_DARK}};">✦</div>
        <div>
          <h2 class="text-2xl md:text-3xl font-black mb-4 italic">{{ABOUT_TITLE}}</h2>
          <p class="opacity-70 leading-relaxed text-sm md:text-base">{{ABOUT_TEXT}}</p>
        </div>
      </div>
    </div>

    <div class="grid md:grid-cols-2 gap-6 reveal-up">
      <div class="ux-glass p-10 md:p-14 rounded-[2.5rem]">
        <h2 class="section-title font-black mb-6 italic">{{CONTACT_CALL}}</h2>
        <p class="opacity-60 mb-8 text-sm md:text-base">{{ADDRESS}} <br/> {{PHONE}} • {{EMAIL}}</p>
        <div class="flex gap-4 mb-6">[[WHATSAPP_BTN]][[INSTAGRAM_BTN]]</div>
        [[MAP_AREA]]
      </div>
      <div class="ux-glass p-10 md:p-14 rounded-[2.5rem]">
        [[CONTACT_FORM]]
      </div>
    </div>

  </main>
</body></html>`,

  layout_minimal_elegance: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>{{BUSINESS_NAME}}</title>
  <script src="https://cdn.tailwindcss.com"></script>${baseStyles}
</head>
<body class="antialiased font-sans selection:bg-[{{COLOR_4}}] selection:text-[{{COLOR_DARK}}]">
  ${navBar}
  <main class="max-w-5xl mx-auto px-6">
    <section class="min-h-screen flex flex-col justify-center pt-24 reveal-up">
      <h1 class="hero-title font-black uppercase italic tracking-tight mb-8">{{HERO_TITLE}}</h1>
      <p class="text-xl md:text-2xl opacity-60 font-light max-w-2xl leading-relaxed">{{HERO_SUBTITLE}}</p>
      <div class="mt-12">
        <a href="#contato" class="inline-block px-10 py-4 rounded-full font-black text-sm tracking-widest uppercase btn-hover" style="background-color: {{COLOR_LIGHT}}; color: {{COLOR_1}};">Descubra Mais</a>
      </div>
    </section>

    <section id="sobre" class="py-24 reveal-up border-t border-[{{COLOR_3}}]/30">
      <h2 class="text-xl md:text-2xl font-black mb-6 text-[{{COLOR_4}}] uppercase tracking-widest">{{ABOUT_TITLE}}</h2>
      <p class="text-xl md:text-3xl font-light leading-relaxed max-w-4xl">{{ABOUT_TEXT}}</p>
    </section>

    <section id="contato" class="py-24 reveal-up border-t border-[{{COLOR_3}}]/30">
      <div class="grid md:grid-cols-2 gap-12">
        <div>
          <h2 class="section-title font-black italic uppercase mb-6">{{CONTACT_CALL}}</h2>
          <div class="opacity-60 space-y-2 text-base">
            <p>{{ADDRESS}}</p><p>{{PHONE}}</p><p>{{EMAIL}}</p>
          </div>
          <div class="flex gap-4 mt-8">[[WHATSAPP_BTN]][[INSTAGRAM_BTN]][[FACEBOOK_BTN]]</div>
        </div>
        <div class="ux-glass p-8 md:p-10 rounded-3xl">[[CONTACT_FORM]]</div>
      </div>
    </section>
  </main>
</body></html>`,

  layout_dynamic_flow: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>{{BUSINESS_NAME}}</title>
  <script src="https://cdn.tailwindcss.com"></script>${baseStyles}
</head>
<body class="antialiased font-sans selection:bg-[{{COLOR_4}}] selection:text-[{{COLOR_DARK}}]">
  ${navBar}
  <main>
    <section class="min-h-screen flex items-center justify-center pt-24 px-4 text-center reveal-down">
      <div class="max-w-4xl mx-auto">
        <div class="inline-block px-5 py-2 rounded-full ux-glass mb-6 text-xs md:text-sm font-bold tracking-widest text-[{{COLOR_4}}] uppercase">Bem-vindo</div>
        <h1 class="hero-title font-black mb-6 italic uppercase">{{HERO_TITLE}}</h1>
        <p class="text-lg md:text-xl opacity-70 font-light mb-10 leading-relaxed">{{HERO_SUBTITLE}}</p>
      </div>
    </section>

    <section id="sobre" class="py-24 px-6 bg-[{{COLOR_2}}]/30 border-y border-[{{COLOR_3}}]/30">
      <div class="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div class="reveal-left">
          <h2 class="section-title font-black mb-6 italic">{{ABOUT_TITLE}}</h2>
          <p class="text-lg opacity-70 leading-relaxed">{{ABOUT_TEXT}}</p>
        </div>
        <div class="h-64 md:h-80 ux-glass rounded-[2rem] reveal-right"></div>
      </div>
    </section>

    <section id="contato" class="py-24 px-6">
      <div class="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div class="order-2 md:order-1 ux-glass p-8 md:p-12 rounded-[2.5rem] reveal-left">[[CONTACT_FORM]]</div>
        <div class="order-1 md:order-2 reveal-right">
          <h2 class="section-title font-black mb-6 italic">{{CONTACT_CALL}}</h2>
          <p class="text-base md:text-lg opacity-60 mb-8">{{ADDRESS}} <br/> {{PHONE}} • {{EMAIL}}</p>
          <div class="flex gap-4">[[WHATSAPP_BTN]][[INSTAGRAM_BTN]][[TIKTOK_BTN]]</div>
        </div>
      </div>
    </section>
  </main>
</body></html>`
};
