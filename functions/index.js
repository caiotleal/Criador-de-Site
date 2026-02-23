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
  
  const projectSlug = internalDomain; 
  const now = admin.firestore.FieldValue.serverTimestamp();
  
  // Criamos uma data de expiração para o Trial (5 dias)
  const trialExpiration = new Date();
  trialExpiration.setDate(trialExpiration.getDate() + 5);

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
    expiresAt: admin.firestore.Timestamp.fromDate(trialExpiration),
    updatedAt: now,
    createdAt: now
  }, { merge: true });

  return { success: true, projectSlug };
});

// --- APAGAR PROJETO (Firestore + Hosting simulado) ---
exports.deleteUserProject = onCall({ cors: true }, async (request) => {
  const uid = ensureAuthed(request);
  const targetId = request.data.targetId || request.data.projectId;
  
  if (!targetId) throw new HttpsError("invalid-argument", "ID do projeto não fornecido.");

  // 1. Remove do Firestore
  await admin.firestore()
    .collection("users")
    .doc(uid)
    .collection("projects")
    .doc(targetId)
    .delete();

  // NOTA: Para deletar do Hosting via API, você precisaria do Firebase CLI token.
  // Como solução imediata, ao deletar o doc, o front-end já não o verá mais.
  
  return { success: true };
});

// --- WEBHOOK DA STRIPE (BUSCA OTIMIZADA) ---
exports.stripeWebhook = onRequest({ cors: true }, async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = "whsec_s0sKkzYh75uyzOgD7j2N9AKJ6BogsUum"; 

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error(`Erro na assinatura: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const projectId = session.client_reference_id; 

    if (projectId) {
      try {
        const db = admin.firestore();
        
        // BUSCA OTIMIZADA: Em vez de listar usuários, buscamos direto pelo projectSlug
        // usando a técnica de Group Collection ou busca por campo.
        const projectsQuery = await db.collectionGroup("projects")
          .where("projectSlug", "==", projectId)
          .limit(1)
          .get();

        if (!projectsQuery.empty) {
          const projectDoc = projectsQuery.docs[0];
          const projectRef = projectDoc.ref;

          const newExpiration = new Date();
          newExpiration.setDate(newExpiration.getDate() + 365); // 1 ano

          await projectRef.update({
            status: "published",
            paymentStatus: "paid",
            expiresAt: admin.firestore.Timestamp.fromDate(newExpiration),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          console.log(`✅ Sucesso: Projeto ${projectId} renovado por 1 ano.`);
        } else {
          console.log(`❌ Erro: Projeto ${projectId} não encontrado no banco.`);
        }
      } catch (error) {
        console.error("Erro ao processar ativação:", error);
      }
    }
  }
  res.status(200).send({ received: true });
});
