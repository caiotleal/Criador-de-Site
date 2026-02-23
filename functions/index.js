const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const stripe = require("stripe")("sk_test_51T3iV5LK0sp6cEMAbpSV1cM4MGESQ9s3EOffFfpUuiU0cbinuy64HCekpoyfAuWZy1gemNFcSpgF1cKPgHDM3pf500vcGP7tGW");

if (!admin.apps.length) admin.initializeApp();

// --- FUNÇÕES AUXILIARES ---
const ensureAuthed = (request) => {
  if (!request.auth?.uid) throw new HttpsError("unauthenticated", "Usuário não autenticado.");
  return request.auth.uid;
};

// --- LISTAR PROJETOS ---
exports.listUserProjects = onCall({ cors: true }, async (request) => {
  const uid = ensureAuthed(request);
  const snap = await admin.firestore()
    .collection("users")
    .doc(uid)
    .collection("projects")
    .orderBy("updatedAt", "desc")
    .get();
  return { projects: snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) };
});

// --- SALVAR/CRIAR PROJETO ---
exports.saveSiteProject = onCall({ cors: true, memory: "512MiB" }, async (request) => {
  const uid = ensureAuthed(request);
  const { businessName, internalDomain, generatedHtml, formData, aiContent } = request.data;
  
  // O ID do documento será o internalDomain (ex: rei-do-bo-z8qe)
  const projectSlug = internalDomain; 
  const now = admin.firestore.FieldValue.serverTimestamp();
  
  const projectRef = admin.firestore()
    .collection("users")
    .doc(uid)
    .collection("projects")
    .doc(projectSlug);

  await projectRef.set({
    uid: uid,
    businessName,
    projectSlug,
    hostingSiteId: projectSlug,
    internalDomain,
    generatedHtml,
    formData: formData || {},
    aiContent: aiContent || {},
    status: "trial",
    updatedAt: now,
    createdAt: now
  }, { merge: true });

  return { success: true, projectSlug };
});

// --- APAGAR PROJETO ---
exports.deleteUserProject = onCall({ cors: true }, async (request) => {
  const uid = ensureAuthed(request);
  const targetId = request.data.targetId || request.data.projectId;
  
  if (!targetId) throw new HttpsError("invalid-argument", "ID do projeto não fornecido.");

  await admin.firestore()
    .collection("users")
    .doc(uid)
    .collection("projects")
    .doc(targetId)
    .delete();

  return { success: true };
});

// --- WEBHOOK DA STRIPE (ATIVAÇÃO) ---
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
    const projectId = session.client_reference_id; 

    if (projectId) {
      try {
        const db = admin.firestore();
        // Busca global para encontrar qual usuário é dono desse projeto
        const usersSnap = await db.collection("users").get();
        
        for (const userDoc of usersSnap.docs) {
          const projectRef = db.collection("users").doc(userDoc.id).collection("projects").doc(projectId);
          const pDoc = await projectRef.get();
          
          if (pDoc.exists) {
            const newExpiration = new Date();
            newExpiration.setDate(newExpiration.getDate() + 365);

            await projectRef.update({
              status: "published",
              paymentStatus: "paid",
              expiresAt: admin.firestore.Timestamp.fromDate(newExpiration),
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`Projeto ${projectId} ativado.`);
            break; 
          }
        }
      } catch (error) {
        console.error("Erro no Webhook:", error);
      }
    }
  }
  res.status(200).send({ received: true });
});

// ... (Aqui você pode manter as suas funções de Hosting e Gemini que já estavam funcionando)
