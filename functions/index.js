const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { google } = require("googleapis");

admin.initializeApp();

// Configuração da autenticação com o Google
const getHostingClient = async () => {
  const auth = new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform", "https://www.googleapis.com/auth/firebase"],
  });
  const authClient = await auth.getClient();
  return google.firebasehosting({
    version: "v1beta1",
    auth: authClient,
  });
};

exports.createSite = functions.firestore
  .document("subscriptions/{docId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const projectId = process.env.GCLOUD_PROJECT;

    // 1. Verifica se o pagamento foi aprovado
    if (data.status !== "paid") {
      console.log("Status não é 'paid'. Ignorando.");
      return null;
    }

    // 2. Sanitiza o nome do site (remove acentos, espaços e caracteres especiais)
    const siteId = data.businessName
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/[^a-z0-9]/g, "-") // Troca símbolos por traço
      .replace(/-+/g, "-") // Evita traços duplos
      .slice(0, 20) + "-" + Math.floor(Math.random() * 10000); // Garante que é único

    try {
      console.log(`Iniciando criação do site: ${siteId}`);
      const hosting = await getHostingClient();

      // 3. Cria o novo sub-site no Firebase Hosting
      const createResponse = await hosting.projects.sites.create({
        parent: `projects/${projectId}`,
        siteId: siteId,
        requestBody: {
          // Configurações opcionais do site podem vir aqui
        },
      });

      console.log(`Site criado com sucesso: https://${siteId}.web.app`);

      // 4. Salva a URL de volta no Firestore para o cliente ver
      await snap.ref.update({
        siteUrl: `https://${siteId}.web.app`,
        deployStatus: "success",
        siteCreatedDate: admin.firestore.FieldValue.serverTimestamp()
      });

      return { success: true, url: `https://${siteId}.web.app` };

    } catch (error) {
      console.error("Erro ao criar o site:", error);
      
      // Se der erro, salva no banco para você saber
      await snap.ref.update({
        deployStatus: "error",
        errorMessage: error.message
      });
      
      return { success: false, error: error.message };
    }
  });
