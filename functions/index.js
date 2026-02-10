
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { google } = require('googleapis');
const crypto = require('crypto');

admin.initializeApp();

const HOSTING_API = google.hosting('v1beta1');
const PROJECT_ID = 'criador-de-site-1a91d';

/**
 * Formata o nome da empresa para um ID de site válido
 */
function sanitizeSiteId(name) {
  return name.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 30);
}

/**
 * Gera o HTML customizado para o cliente
 */
function generateClientHtml(data) {
  const { businessName, whatsapp, palette, tone } = data;
  
  return `
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${businessName}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/framer-motion@10.16.4/dist/framer-motion.js"></script>
    <style>
        :root {
            --primary: ${palette.primary};
            --secondary: ${palette.secondary};
            --bg: ${palette.bg};
            --text: ${palette.text};
        }
        body { background-color: var(--bg); color: var(--text); overflow-x: hidden; }
    </style>
</head>
<body class="font-sans">
    <div id="root">
        <nav class="p-6 flex justify-between items-center max-w-6xl mx-auto">
            <h1 class="text-2xl font-bold" style="color: var(--primary)">${businessName}</h1>
            <a href="https://wa.me/${whatsapp}" class="px-6 py-2 rounded-full font-bold transition-transform hover:scale-105" style="background: var(--primary); color: white">Contato</a>
        </nav>

        <main class="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <div id="hero">
                <h2 class="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
                    ${tone === 'Formal' ? 'Excelência Profissional' : 'Tudo o que você precisa'} <br/>
                    <span style="color: var(--primary)">ao seu alcance.</span>
                </h2>
                <p class="text-xl opacity-80 max-w-2xl mx-auto mb-10">
                    Seja bem-vindo ao novo portal da ${businessName}. Estamos prontos para atender você com o melhor serviço do mercado.
                </p>
                <div class="flex gap-4 justify-center">
                    <button class="px-10 py-4 rounded-xl font-bold text-lg shadow-2xl transition-all" style="background: var(--primary); color: white">Saiba Mais</button>
                </div>
            </div>
        </main>
    </div>

    <script>
        const { motion } = window.framerMotion;
        const container = document.getElementById('hero');
        
        // Animação de entrada suave
        container.style.opacity = 0;
        container.style.transform = 'translateY(20px)';
        setTimeout(() => {
            container.style.transition = 'all 0.8s ease-out';
            container.style.opacity = 1;
            container.style.transform = 'translateY(0)';
        }, 100);
    </script>
</body>
</html>
  `;
}

exports.autoDeploySite = functions.firestore
  .document('subscriptions/{subId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const rawSiteId = sanitizeSiteId(data.businessName);
    const siteId = `${rawSiteId}-${context.params.subId.substring(0, 5)}`;
    
    try {
      // 1. Obter credenciais de autorização
      const auth = await google.auth.getClient({
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
      });

      // 2. Criar o Site no Hosting (Multi-site)
      // Nota: No Plano Spark, o limite é de 36 sites por projeto.
      console.log(`Criando site: ${siteId}`);
      await HOSTING_API.projects.sites.create({
        auth,
        parent: `projects/${PROJECT_ID}`,
        siteId: siteId,
        requestBody: { type: 'USER_SITE' }
      });

      // 3. Preparar conteúdo
      const htmlContent = generateClientHtml(data);
      const hash = crypto.createHash('sha256').update(htmlContent).digest('hex');
      const files = {
        '/index.html': hash
      };

      // 4. Criar nova Versão
      const versionResponse = await HOSTING_API.projects.sites.versions.create({
        auth,
        parent: `projects/${PROJECT_ID}/sites/${siteId}`,
        requestBody: {
          config: { headers: [{ glob: "**", headers: { "Cache-Control": "max-age=3600" } }] }
        }
      });
      const versionName = versionResponse.data.name;

      // 5. Popular arquivos (Upload)
      await HOSTING_API.projects.sites.versions.populateFiles({
        auth,
        parent: versionName,
        requestBody: { files }
      });

      // 6. Upload do conteúdo via requisição manual (Buffer)
      // Como é apenas 1 arquivo pequeno, enviamos diretamente
      const accessToken = (await auth.getAccessToken()).token;
      const uploadUrl = `https://upload-firebasehosting.googleapis.com/upload/sites/${siteId}/versions/${versionName.split('/').pop()}/files/${hash}`;
      
      await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/octet-stream'
        },
        body: htmlContent
      });

      // 7. Finalizar Versão
      await HOSTING_API.projects.sites.versions.patch({
        auth,
        name: versionName,
        updateMask: 'status',
        requestBody: { status: 'FINALIZED' }
      });

      // 8. Criar o Release (Torna o site público)
      await HOSTING_API.projects.sites.releases.create({
        auth,
        parent: `projects/${PROJECT_ID}/sites/${siteId}`,
        versionName: versionName,
        requestBody: { message: 'Auto-deploy via Cloud Function' }
      });

      // 9. Atualizar Firestore com a URL final
      await snap.ref.update({
        status: 'published',
        deployedUrl: `https://${siteId}.web.app`,
        publishedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`Sucesso! Site publicado em https://${siteId}.web.app`);

    } catch (error) {
      console.error('Erro no AutoDeploy:', error);
      await snap.ref.update({ status: 'error', errorMessage: error.message });
    }
  });
