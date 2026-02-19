const COMMON_HEAD = `
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
  <style>
    :root {
      --color-1: {{COLOR_1}};
      --color-2: {{COLOR_2}};
      --color-3: {{COLOR_3}};
      --color-4: {{COLOR_4}};
      --color-5: {{COLOR_5}};
      --color-6: {{COLOR_6}};
      --color-7: {{COLOR_7}};
      --color-light: {{COLOR_LIGHT}};
      --color-dark: {{COLOR_DARK}};
    }

    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      font-family: 'Inter', sans-serif;
      background: linear-gradient(180deg, var(--color-7), color-mix(in srgb, var(--color-7) 75%, white));
      color: var(--color-dark);
    }
    section[id] { scroll-margin-top: 88px; }

    .site-shell { max-width: 1180px; margin: 0 auto; padding: 0 24px; }
    .nav-clean {
      position: sticky; top: 0; z-index: 40;
      background: color-mix(in srgb, var(--color-light) 82%, transparent);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid color-mix(in srgb, var(--color-4) 14%, transparent);
    }

    .btn-main {
      background: linear-gradient(120deg, var(--color-3), var(--color-4));
      color: white; border: 0; border-radius: 14px;
      padding: 12px 22px; font-weight: 700;
      transition: transform .2s ease, filter .2s ease;
    }
    .btn-main:hover { transform: translateY(-2px); filter: brightness(1.05); }

    .card-soft {
      background: color-mix(in srgb, var(--color-light) 88%, transparent);
      border: 1px solid color-mix(in srgb, var(--color-4) 18%, transparent);
      border-radius: 20px;
      box-shadow: 0 18px 35px -32px color-mix(in srgb, var(--color-2) 58%, transparent);
    }

    .floating-medias {
      position: fixed; right: 14px; top: 50%; transform: translateY(-50%);
      z-index: 70; padding: 8px;
      background: color-mix(in srgb, var(--color-light) 30%, transparent);
      border: 1px solid color-mix(in srgb, var(--color-light) 45%, transparent);
      border-radius: 999px; backdrop-filter: blur(12px);
    }
    .floating-medias .icon-btn {
      width: 44px; height: 44px; border-radius: 999px; display: grid; place-items: center;
      text-decoration: none; color: white; font-size: 18px;
      margin: 6px 0;
      box-shadow: 0 10px 18px -12px rgba(0,0,0,.45);
      transition: transform .2s ease, filter .2s ease;
    }
    .floating-medias .icon-btn:hover { transform: scale(1.06); filter: brightness(1.05); }

    .drag-handle { cursor: move; display: grid; place-items: center; color: var(--color-dark); font-size: 12px; opacity: .7; }

    @media (max-width: 768px) {
      .site-shell { padding: 0 16px; }
      .floating-medias {
        top: auto; bottom: 12px; right: 12px; transform: none;
        display: flex; align-items: center; gap: 6px; border-radius: 16px;
      }
      .floating-medias .stack { display: flex; gap: 6px; overflow-x: auto; max-width: 74vw; }
      .floating-medias .icon-btn { margin: 0; width: 40px; height: 40px; font-size: 16px; }
    }
  </style>
  <script>
    tailwind.config = { theme: { extend: { colors: { brand: 'var(--color-4)', ink: 'var(--color-dark)' } } } }
  </script>
`;

const FLOATING_MEDIA_PANEL = `
  <aside id="floating-social" class="floating-medias draggable">
    <div class="drag-handle" title="Arraste para mover"><i class="fas fa-grip-lines"></i></div>
    <div class="stack">
      [[WHATSAPP_BTN]]
      [[INSTAGRAM_BTN]]
      [[FACEBOOK_BTN]]
      [[TIKTOK_BTN]]
      [[IFOOD_BTN]]
      [[NOVE_NOVE_BTN]]
      [[KEETA_BTN]]
    </div>
  </aside>
`;

const DRAG_SCRIPT = `
  <script>
    document.querySelectorAll('.draggable').forEach((elmnt) => {
      let isDragging = false;
      let startX = 0, startY = 0, startLeft = 0, startTop = 0;
      const handle = elmnt.querySelector('.drag-handle') || elmnt;
      const point = (e) => (e.touches && e.touches[0]) ? e.touches[0] : e;

      const move = (e) => {
        if (!isDragging) return;
        const p = point(e);
        elmnt.style.left = startLeft + (p.clientX - startX) + 'px';
        elmnt.style.top = startTop + (p.clientY - startY) + 'px';
        elmnt.style.right = 'auto';
        elmnt.style.transform = 'none';
      };

      const stop = () => {
        if (!isDragging) return;
        isDragging = false;
        const rect = elmnt.getBoundingClientRect();
        const snapRight = rect.left > window.innerWidth / 2;
        elmnt.style.left = snapRight ? 'auto' : '12px';
        elmnt.style.right = snapRight ? '12px' : 'auto';
        elmnt.style.top = Math.max(8, Math.min(rect.top, window.innerHeight - rect.height - 8)) + 'px';
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', stop);
        document.removeEventListener('touchmove', move);
        document.removeEventListener('touchend', stop);
      };

      const start = (e) => {
        const p = point(e);
        const rect = elmnt.getBoundingClientRect();
        isDragging = true;
        startX = p.clientX; startY = p.clientY;
        startLeft = rect.left; startTop = rect.top;
        elmnt.style.left = rect.left + 'px';
        elmnt.style.top = rect.top + 'px';
        elmnt.style.right = 'auto';
        elmnt.style.transform = 'none';
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', stop);
        document.addEventListener('touchmove', move, { passive: true });
        document.addEventListener('touchend', stop);
      };

      handle.addEventListener('mousedown', start);
      handle.addEventListener('touchstart', start, { passive: true });
    });
  </script>
`;

const BASE_SECTIONS = (hero: string, about: string, contact: string) => `
  ${hero}
  ${about}
  ${contact}
  ${FLOATING_MEDIA_PANEL}
  ${DRAG_SCRIPT}
`;

const NAV = `
  <nav class="nav-clean">
    <div class="site-shell h-16 flex items-center justify-between gap-4">
      <div class="font-extrabold text-xl" style="color:var(--color-2)">[[LOGO_AREA]]</div>
      <div class="flex gap-5 text-sm font-semibold" style="color:var(--color-2)">
        <a href="#home">Home</a>
        <a href="#quem-somos">Quem Somos</a>
        <a href="#contato">Contato</a>
      </div>
    </div>
  </nav>
`;

const TEMPLATE_SPLIT = `<!DOCTYPE html><html lang="pt-BR"><head>${COMMON_HEAD}<title>{{BUSINESS_NAME}}</title></head><body>${NAV}${BASE_SECTIONS(
`<section id="home" class="site-shell py-12 md:py-20"><div class="grid md:grid-cols-2 gap-8 items-center"><div><h1 class="text-4xl md:text-6xl font-extrabold leading-tight">{{HERO_TITLE}}</h1><p class="mt-4 text-lg" style="color:var(--color-2)">{{HERO_SUBTITLE}}</p><button class="btn-main mt-7">Fale com a equipe</button></div><div class="card-soft p-6"><h3 class="text-xl font-bold mb-3">Nosso diferencial</h3><p style="color:var(--color-2)">Atendimento próximo, experiência no mercado e foco em resultados consistentes.</p></div></div></section>`,
`<section id="quem-somos" class="site-shell py-10 md:py-14"><div class="card-soft p-7"><h2 class="text-3xl font-bold mb-3">{{ABOUT_TITLE}}</h2><p class="text-lg" style="color:var(--color-2)">{{ABOUT_TEXT}}</p></div></section>`,
`<section id="contato" class="site-shell pb-14"><h2 class="text-3xl font-bold mb-5">{{CONTACT_CALL}}</h2><div class="grid md:grid-cols-2 gap-6"><div class="card-soft p-6 space-y-2"><p><strong>Endereço:</strong> {{ADDRESS}}</p><p><strong>Telefone:</strong> {{PHONE}}</p><p><strong>Email:</strong> {{EMAIL}}</p>[[MAP_AREA]]</div><div class="card-soft p-6">[[CONTACT_FORM]]</div></div></section>`
)}</body></html>`;

const TEMPLATE_ONECOLUMN = `<!DOCTYPE html><html lang="pt-BR"><head>${COMMON_HEAD}<title>{{BUSINESS_NAME}}</title></head><body>${NAV}${BASE_SECTIONS(
`<section id="home" class="site-shell py-12 md:py-20 text-center"><h1 class="text-4xl md:text-6xl font-extrabold">{{HERO_TITLE}}</h1><p class="mt-4 max-w-3xl mx-auto text-lg" style="color:var(--color-2)">{{HERO_SUBTITLE}}</p><button class="btn-main mt-7">Fale com a equipe</button><div class="card-soft p-6 mt-8 max-w-4xl mx-auto"><h3 class="text-xl font-bold mb-3">Nosso diferencial</h3><p style="color:var(--color-2)">{{ABOUT_TEXT}}</p></div></section>`,
`<section id="quem-somos" class="site-shell py-6 md:py-10"><h2 class="text-3xl font-bold mb-3 text-center">{{ABOUT_TITLE}}</h2><p class="text-lg max-w-4xl mx-auto text-center" style="color:var(--color-2)">{{ABOUT_TEXT}}</p></section>`,
`<section id="contato" class="site-shell pb-14"><div class="card-soft p-6 md:p-8"><h2 class="text-3xl font-bold mb-5">{{CONTACT_CALL}}</h2><div class="grid md:grid-cols-2 gap-6"><div class="space-y-2"><p><strong>Endereço:</strong> {{ADDRESS}}</p><p><strong>Telefone:</strong> {{PHONE}}</p><p><strong>Email:</strong> {{EMAIL}}</p>[[MAP_AREA]]</div><div>[[CONTACT_FORM]]</div></div></div></section>`
)}</body></html>`;

const TEMPLATE_HAMBURGUER = `<!DOCTYPE html><html lang="pt-BR"><head>${COMMON_HEAD}<title>{{BUSINESS_NAME}}</title></head><body>
  <nav class="nav-clean"><div class="site-shell h-16 flex items-center justify-between"><div class="font-extrabold text-xl" style="color:var(--color-2)">[[LOGO_AREA]]</div><button onclick="document.getElementById('mnav').classList.toggle('hidden')" class="btn-main !py-2 !px-3"><i class='fas fa-bars'></i></button></div><div id="mnav" class="hidden site-shell pb-3 text-sm font-semibold" style="color:var(--color-2)"><a class="mr-4" href="#home">Home</a><a class="mr-4" href="#quem-somos">Quem Somos</a><a href="#contato">Contato</a></div></nav>
  ${BASE_SECTIONS(
`<section id='home' class='site-shell py-12 md:py-20'><div class='card-soft p-8'><h1 class='text-4xl md:text-6xl font-extrabold'>{{HERO_TITLE}}</h1><p class='mt-4 text-lg' style='color:var(--color-2)'>{{HERO_SUBTITLE}}</p><button class='btn-main mt-6'>Fale com a equipe</button></div></section>`,
`<section id='quem-somos' class='site-shell py-4 md:py-8'><div class='grid md:grid-cols-3 gap-6'><div class='card-soft p-6 md:col-span-2'><h2 class='text-3xl font-bold mb-3'>{{ABOUT_TITLE}}</h2><p style='color:var(--color-2)'>{{ABOUT_TEXT}}</p></div><div class='card-soft p-6'><h4 class='font-bold mb-2'>Tempo no mercado</h4><p style='color:var(--color-2)'>Experiência sólida e entrega consistente.</p></div></div></section>`,
`<section id='contato' class='site-shell pb-14'><h2 class='text-3xl font-bold mb-5'>{{CONTACT_CALL}}</h2><div class='grid md:grid-cols-2 gap-6'><div class='card-soft p-6'>[[CONTACT_FORM]]</div><div class='card-soft p-6 space-y-2'><p><strong>Endereço:</strong> {{ADDRESS}}</p><p><strong>Telefone:</strong> {{PHONE}}</p><p><strong>Email:</strong> {{EMAIL}}</p>[[MAP_AREA]]</div></div></section>`
)}
</body></html>`;

const TEMPLATE_CARDS = `<!DOCTYPE html><html lang="pt-BR"><head>${COMMON_HEAD}<title>{{BUSINESS_NAME}}</title></head><body>${NAV}${BASE_SECTIONS(
`<section id='home' class='site-shell py-12 md:py-20'><h1 class='text-4xl md:text-6xl font-extrabold mb-4'>{{HERO_TITLE}}</h1><p class='text-lg mb-8' style='color:var(--color-2)'>{{HERO_SUBTITLE}}</p><div class='grid md:grid-cols-3 gap-4'><div class='card-soft p-5'><h4 class='font-bold'>Diferencial</h4><p style='color:var(--color-2)'>Atendimento humano</p></div><div class='card-soft p-5'><h4 class='font-bold'>Mercado</h4><p style='color:var(--color-2)'>Experiência e confiança</p></div><div class='card-soft p-5'><h4 class='font-bold'>Resultado</h4><p style='color:var(--color-2)'>Foco em conversão</p></div></div></section>`,
`<section id='quem-somos' class='site-shell py-6 md:py-10'><div class='card-soft p-7'><h2 class='text-3xl font-bold mb-3'>{{ABOUT_TITLE}}</h2><p class='text-lg' style='color:var(--color-2)'>{{ABOUT_TEXT}}</p></div></section>`,
`<section id='contato' class='site-shell pb-14'><div class='grid md:grid-cols-2 gap-6'><div class='card-soft p-6 space-y-2'><h3 class='text-2xl font-bold mb-2'>{{CONTACT_CALL}}</h3><p><strong>Endereço:</strong> {{ADDRESS}}</p><p><strong>Telefone:</strong> {{PHONE}}</p><p><strong>Email:</strong> {{EMAIL}}</p>[[MAP_AREA]]</div><div class='card-soft p-6'>[[CONTACT_FORM]]</div></div></section>`
)}</body></html>`;

const TEMPLATE_SIDEBAR = `<!DOCTYPE html><html lang="pt-BR"><head>${COMMON_HEAD}<title>{{BUSINESS_NAME}}</title></head><body>
  <div class='md:flex min-h-screen'>
    <aside class='md:w-64 card-soft md:rounded-none md:border-r md:border-l-0 md:border-t-0 md:border-b-0 p-5 md:sticky md:top-0 md:h-screen'>
      <div class='font-extrabold text-xl mb-4' style='color:var(--color-2)'>[[LOGO_AREA]]</div>
      <nav class='space-y-2 text-sm font-semibold' style='color:var(--color-2)'><a class='block' href='#home'>Home</a><a class='block' href='#quem-somos'>Quem Somos</a><a class='block' href='#contato'>Contato</a></nav>
    </aside>
    <main class='flex-1'>
      ${BASE_SECTIONS(
`<section id='home' class='site-shell py-12 md:py-16'><h1 class='text-4xl md:text-6xl font-extrabold'>{{HERO_TITLE}}</h1><p class='mt-4 text-lg' style='color:var(--color-2)'>{{HERO_SUBTITLE}}</p><button class='btn-main mt-7'>Fale com a equipe</button></section>`,
`<section id='quem-somos' class='site-shell py-4 md:py-8'><div class='card-soft p-7'><h2 class='text-3xl font-bold mb-3'>{{ABOUT_TITLE}}</h2><p class='text-lg' style='color:var(--color-2)'>{{ABOUT_TEXT}}</p></div></section>`,
`<section id='contato' class='site-shell pb-14'><h2 class='text-3xl font-bold mb-5'>{{CONTACT_CALL}}</h2><div class='grid md:grid-cols-2 gap-6'><div class='card-soft p-6 space-y-2'><p><strong>Endereço:</strong> {{ADDRESS}}</p><p><strong>Telefone:</strong> {{PHONE}}</p><p><strong>Email:</strong> {{EMAIL}}</p>[[MAP_AREA]]</div><div class='card-soft p-6'>[[CONTACT_FORM]]</div></div></section>`
)}
    </main>
  </div>
</body></html>`;

export const TEMPLATES: Record<string, string> = {
  layout_split_duplo: TEMPLATE_SPLIT,
  layout_coluna_simples: TEMPLATE_ONECOLUMN,
  layout_menu_hamburguer: TEMPLATE_HAMBURGUER,
  layout_cards_moderno: TEMPLATE_CARDS,
  layout_sidebar_profissional: TEMPLATE_SIDEBAR,

  // aliases legados
  brasil_claro: TEMPLATE_SPLIT,
  samba_noturno: TEMPLATE_CARDS,
  bairro_forte: TEMPLATE_ONECOLUMN,
  lovable: TEMPLATE_SPLIT,
  base_dark: TEMPLATE_CARDS,
  split: TEMPLATE_ONECOLUMN,
};
