const COMMON_HEAD = `
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
  <style>
    :root { --primary: {{COLOR_PRIMARY}}; --secondary: {{COLOR_SECONDARY}}; }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { font-family: 'Inter', sans-serif; margin: 0; }
    section[id] { scroll-margin-top: 86px; }

    .btn-primary { background: linear-gradient(90deg,var(--primary),var(--secondary)); color: white; transition: all .2s ease; }
    .btn-primary:hover { transform: translateY(-2px); filter: brightness(1.05); }

    .draggable { cursor: grab; user-select: none; z-index: 70; }
    .draggable.dragging { cursor: grabbing; transition: none !important; }
    .drag-handle { touch-action: none; }

    .floating-hint { animation: pulseHint 1.8s infinite; }
    @keyframes pulseHint { 0%,100% { opacity:.45 } 50% { opacity: 1 } }

    @media (max-width: 768px) {
      #floating-social {
        top: auto !important;
        bottom: 12px !important;
        right: 12px !important;
        left: 12px !important;
        transform: none !important;
        width: auto !important;
        max-width: none !important;
      }
    }
  </style>
  <script>
    tailwind.config = { theme: { extend: { colors: { brand: 'var(--primary)', accent: 'var(--secondary)' } } } }
  </script>
`;

const FLOATING_PANEL = `
  <aside id="floating-social" class="draggable fixed top-1/2 -translate-y-1/2 right-4 bg-white/95 border border-slate-200 shadow-2xl rounded-2xl p-3 w-[250px] max-w-[92vw]">
    <div class="drag-handle text-[11px] uppercase tracking-wider text-slate-500 mb-2 flex justify-between items-center cursor-move">
      <span>Mídias e Delivery</span>
      <span class="floating-hint"><i class="fas fa-arrows-left-right"></i></span>
    </div>
    <div class="space-y-2 max-h-[68vh] overflow-y-auto">
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

const DRAG_MAGNET_SCRIPT = `
  <script>
    document.querySelectorAll('.draggable').forEach((elmnt) => {
      let isDragging = false;
      let startX = 0, startY = 0, startLeft = 0, startTop = 0;
      const handle = elmnt.querySelector('.drag-handle') || elmnt;

      const getPoint = (e) => (e.touches && e.touches[0]) ? e.touches[0] : e;

      const onMove = (e) => {
        if (!isDragging) return;
        const p = getPoint(e);
        const dx = p.clientX - startX;
        const dy = p.clientY - startY;
        elmnt.style.left = (startLeft + dx) + 'px';
        elmnt.style.top = (startTop + dy) + 'px';
        elmnt.style.right = 'auto';
        elmnt.style.transform = 'none';
      };

      const onEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        elmnt.classList.remove('dragging');
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onEnd);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onEnd);

        const rect = elmnt.getBoundingClientRect();
        const snapRight = rect.left > window.innerWidth / 2;
        elmnt.style.transition = 'left .2s ease, right .2s ease, top .2s ease';
        elmnt.style.left = snapRight ? 'auto' : '16px';
        elmnt.style.right = snapRight ? '16px' : 'auto';

        // limite vertical
        const minTop = 8;
        const maxTop = window.innerHeight - rect.height - 8;
        const clampedTop = Math.max(minTop, Math.min(rect.top, maxTop));
        elmnt.style.top = clampedTop + 'px';

        setTimeout(() => { elmnt.style.transition = ''; }, 220);
      };

      const onStart = (e) => {
        const p = getPoint(e);
        isDragging = true;
        elmnt.classList.add('dragging');
        const rect = elmnt.getBoundingClientRect();
        startX = p.clientX; startY = p.clientY;
        startLeft = rect.left; startTop = rect.top;
        elmnt.style.left = rect.left + 'px';
        elmnt.style.top = rect.top + 'px';
        elmnt.style.right = 'auto';
        elmnt.style.transform = 'none';

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchmove', onMove, { passive: true });
        document.addEventListener('touchend', onEnd);
      };

      handle.addEventListener('mousedown', onStart);
      handle.addEventListener('touchstart', onStart, { passive: true });
    });
  </script>
`;

const BASE_TEMPLATE = (extraBodyClass = '', cardClass = 'bg-white border border-slate-200') => `
<!DOCTYPE html><html lang="pt-BR"><head>${COMMON_HEAD}<title>{{BUSINESS_NAME}}</title></head>
<body class="bg-slate-50 text-slate-900 ${extraBodyClass}">
  <nav class="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
    <div class="max-w-6xl mx-auto h-16 px-6 flex items-center justify-between gap-3">
      <div class="font-bold text-lg">[[LOGO_AREA]]</div>
      <div class="flex gap-3 md:gap-4 text-xs md:text-sm font-semibold text-slate-600 flex-wrap justify-end">
        <a href="#home" class="hover:text-brand">Home</a>
        <a href="#quem-somos" class="hover:text-brand">Quem Somos</a>
        <a href="#contato" class="hover:text-brand">Contato</a>
      </div>
    </div>
  </nav>

  <section id="home" class="max-w-6xl mx-auto px-6 py-12 md:py-20">
    <div class="grid md:grid-cols-2 gap-8 items-center">
      <div>
        <h1 class="text-4xl md:text-6xl font-extrabold leading-tight">{{HERO_TITLE}}</h1>
        <p class="text-slate-600 mt-4 text-lg">{{HERO_SUBTITLE}}</p>
        <a href="#contato" class="btn-primary inline-block mt-7 px-7 py-3 rounded-xl font-semibold">Fale com a equipe</a>
      </div>
      <div class="${cardClass} rounded-2xl p-6">
        <h3 class="font-bold text-xl mb-3">Nosso diferencial</h3>
        <ul class="text-sm md:text-base space-y-2 text-slate-700">
          <li><i class="fas fa-circle-check text-brand"></i> Atendimento próximo e rápido</li>
          <li><i class="fas fa-circle-check text-brand"></i> Qualidade e confiança no serviço</li>
          <li><i class="fas fa-circle-check text-brand"></i> {{ABOUT_TEXT}}</li>
        </ul>
        <p class="mt-3 text-slate-600"><strong>Tempo no mercado:</strong> experiência consolidada no segmento.</p>
      </div>
    </div>
  </section>

  <section id="quem-somos" class="bg-white border-y border-slate-200">
    <div class="max-w-6xl mx-auto px-6 py-10 md:py-14">
      <h2 class="text-3xl font-bold mb-3">{{ABOUT_TITLE}}</h2>
      <p class="text-slate-700 leading-relaxed text-lg">{{ABOUT_TEXT}}</p>
    </div>
  </section>

  <section id="contato" class="max-w-6xl mx-auto px-6 py-10 md:py-14">
    <h2 class="text-3xl font-bold mb-6">{{CONTACT_CALL}}</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="${cardClass} rounded-2xl p-6 space-y-3">
        <p><i class="fas fa-location-dot text-brand"></i> <strong>Endereço:</strong> {{ADDRESS}}</p>
        <p><i class="fas fa-phone text-brand"></i> <strong>Telefone:</strong> {{PHONE}}</p>
        <p><i class="fas fa-envelope text-brand"></i> <strong>Email:</strong> {{EMAIL}}</p>
        [[MAP_AREA]]
      </div>
      <div class="${cardClass} rounded-2xl p-6">[[CONTACT_FORM]]</div>
    </div>
  </section>

  ${FLOATING_PANEL}
  ${DRAG_MAGNET_SCRIPT}
</body></html>
`;

export const TEMPLATES: Record<string, string> = {
  brasil_claro: BASE_TEMPLATE(),
  samba_noturno: BASE_TEMPLATE('bg-slate-950 text-slate-100', 'bg-slate-900 border border-slate-800'),
  bairro_forte: BASE_TEMPLATE('bg-amber-50 text-slate-900', 'bg-white border border-amber-200'),
  lovable: BASE_TEMPLATE(),
  base_dark: BASE_TEMPLATE('bg-slate-950 text-slate-100', 'bg-slate-900 border border-slate-800'),
  split: BASE_TEMPLATE('bg-amber-50 text-slate-900', 'bg-white border border-amber-200'),
};
