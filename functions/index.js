const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const { google } = require("googleapis");

admin.initializeApp();

// Configurações globais (opcional, ajuda a evitar custos extras)
setGlobalOptions({ maxInstances: 10 });

// Função auxiliar para autenticar no Google
const getHostingClient = async () => {
  const auth = new google.auth.GoogleAuth({
    scopes: [
      "https://www.googleapis.com/auth/cloud-platform",
      "https://www.googleapis.com/auth/firebase"
    ],
  });
  const authClient = await auth.getClient();
  return google.firebasehosting({
    version: "v1beta1",
    auth: authClient,
  });
};

// AQUI ESTÁ A MUDANÇA PRINCIPAL: Sintaxe V2
exports.createSite = onDocumentCreated("subscriptions/{docId}", async (event) => {
    // Na V2, o 'snap' agora é 'event.data'
    const snapshot = event.data;
    if (!snapshot) {
        console.log("Nenhum dado associado ao evento.");
        return;
    }

    const data = snapshot.data();
    const projectId = process.env.GCLOUD_PROJECT || "criador-de-site-1a91d";

    // 1. Verifica se o pagamento foi aprovado
    if (data.status !== "paid") {
      console.log("Status não é 'paid'. Ignorando.");
      return null;
    }

    // 2. Sanitiza o nome do site
    const businessName = data.businessName || "site-cliente";
    const siteId = businessName
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/[^a-z0-9]/g, "-") // Troca símbolos por traço
      .replace(/-+/g, "-") // Evita traços duplos
      .slice(0, 20) + "-" + Math.floor(Math.random() * 10000); 

    try {
      console.log(`Iniciando criação do site: ${siteId}`);
      const hosting = await getHostingClient();

      // 3. Cria o novo sub-site no Firebase Hosting via API
      // Nota: A API requer que o siteId seja passado no final do parent
      const parent = `projects/${projectId}`;
      
      const createResponse = await hosting.projects.sites.create({
        parent: parent,
        siteId: siteId, // O ID vai aqui como parâmetro query ou no body dependendo da versão, aqui forçamos no body
        requestBody: {
            name: `${parent}/sites/${siteId}`, // Formato exato que a API espera
            labels: {
                "generated-by": "ai-studio-automation"
            }
        },
      });

      const finalUrl = `https://${siteId}.web.app`;
      console.log(`Site criado com sucesso: ${finalUrl}`);

      // 4. Salva a URL de volta no Firestore
      await snapshot.ref.update({
        siteUrl: finalUrl,
        deployStatus: "success",
        siteCreatedDate: admin.firestore.FieldValue.serverTimestamp()
      });

    } catch (error) {
      console.error("Erro ao criar o site:", error);
      
      await snapshot.ref.update({
        deployStatus: "error",
        errorMessage: error.message
      });
    }
});
