const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const { GoogleAuth } = require("google-auth-library");

admin.initializeApp();

exports.createSite = onDocumentCreated("subscriptions/{docId}", async (event) => {
    const data = event.data.data();
    const siteId = data.businessName.toLowerCase().replace(/\s+/g, '-');

    try {
        const auth = new GoogleAuth({
            scopes: 'https://www.googleapis.com/auth/cloud-platform'
        });
        const client = await auth.getClient();
        const projectId = process.env.GCLOUD_PROJECT;

        // Chamada correta para a API de Hosting do Firebase
        const url = `https://firebasehosting.googleapis.com/v1beta1/projects/${projectId}/sites?siteId=${siteId}`;
        
        await client.request({
            url,
            method: 'POST',
            data: { "type": "USER_SITE" }
        });

        console.log(`Site ${siteId} criado com sucesso para o cliente!`);
    } catch (error) {
        console.error("Erro ao criar site:", error.response ? error.response.data : error.message);
    }
});
