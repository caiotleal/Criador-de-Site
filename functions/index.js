const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const stripe = require("stripe")("sk_test_51T3iV5LK0sp6cEMAbpSV1cM4MGESQ9s3EOffFfpUuiU0cbinuy64HCekpoyfAuWZy1gemNFcSpgF1cKPgHDM3pf500vcGP7tGW");

if (!admin.apps.length) admin.initializeApp();

// ... (Mantenha suas outras funções de IA e Hosting aqui em cima)

// ==============================================================================
// WEBHOOK DA STRIPE (VERSÃO FINAL PARA SUBCOLEÇÕES)
// ==============================================================================
exports.stripeWebhook = onRequest({ cors: true }, async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = "whsec_s0sKkzYh75uyzOgD7j2N9AKJ6BogsUum"; 

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody || req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const projectId = session.client_reference_id; // Ex: rei-do-bo-z8qe

    if (projectId) {
      try {
        const db = admin.firestore();
        // 1. Buscamos em todos os usuários quem é o dono desse projeto
        const usersSnap = await db.collection("users").get();
        
        for (const userDoc of usersSnap.docs) {
          const projectRef = db.collection("users").doc(userDoc.id).collection("projects").doc(projectId);
          const pDoc = await projectRef.get();
          
          if (pDoc.exists) {
            const newExpiration = new Date();
            newExpiration.setDate(newExpiration.getDate() + 365);

            // 2. ATUALIZAÇÃO SEGURA: Usamos merge para não apagar o UID nem outros dados
            await projectRef.set({
              status: "published",
              paymentStatus: "paid",
              expiresAt: admin.firestore.Timestamp.fromDate(newExpiration),
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            console.log(`SUCESSO: Projeto ${projectId} do usuário ${userDoc.id} atualizado.`);
            break; 
          }
        }
      } catch (error) {
        console.error("Erro ao processar pagamento no Firestore:", error);
      }
    }
  }
  res.status(200).send({ received: true });
});

// ==============================================================================
// LISTAGEM (PARA GARANTIR QUE APAREÇA NO PERFIL)
// ==============================================================================
exports.listUserProjects = onCall({ cors: true }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Login necessário.");
  
  const uid = request.auth.uid;
  const snap = await admin.firestore()
    .collection("users")
    .doc(uid)
    .collection("projects")
    .get();

  return { projects: snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) };
});
