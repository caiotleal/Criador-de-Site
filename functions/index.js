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

// --- APAGAR PROJETO (BANCO + DESATIVAR HOSTING) ---
exports.deleteUserProject = onCall({ cors: true }, async (request) => {
  const uid = ensureAuthed(request);
  const targetId = request.data.targetId || request.data.projectId;
  
  if (!targetId) throw new HttpsError("invalid-argument", "ID do projeto não fornecido.");

  try {
    const db = admin.firestore();
    const projectRef = db.collection("users").doc(uid).collection("projects").doc(targetId);
    
    // 1. Buscamos o ID do site antes de deletar o documento
    const pDoc = await projectRef.get();
    
    if (pDoc.exists) {
      const siteId = pDoc.data().hostingSiteId || targetId;

      // 2. Tenta "limpar" o Hosting (Marcar a release como expirada ou deletar via API de gerenciamento)
      // Nota: Para deletar fisicamente o SITE do Firebase Hosting, você precisaria da Google Cloud API 'firebasehosting.googleapis.com'
      // A solução mais segura aqui é garantir que o documento não exista, pois seu carregador de sites deve validar o Firestore.
      console.log(`Solicitada exclusão do site: ${siteId}`);
    }

    // 3. Remove do Firestore definitivamente
    await projectRef.delete();

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar projeto:", error);
    throw new HttpsError("internal", "Não foi possível remover o projeto completamente.");
  }
});

// --- WEBHOOK DA STRIPE (BUSCA OTIMIZADA) ---
exports.stripeWebhook = onRequest({ cors: true }, async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = "whsec_s0sKkzYh75uyzOgD7j2N9AKJ6BogsUum"; 

  let event;
  try {
    // IMPORTANTE: Use req.rawBody para validar a assinatura da Stripe
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const projectId = session.client_reference_id; 

    if (projectId) {
      try {
        const db = admin.firestore();
        
        // Busca o projeto em qualquer subcoleção de usuário usando Collection Group
        const projectsQuery = await db.collectionGroup("projects")
          .where("projectSlug", "==", projectId)
          .limit(1)
          .get();

        if (!projectsQuery.empty) {
          const projectRef = projectsQuery.docs[0].ref;

          const newExpiration = new Date();
          newExpiration.setDate(newExpiration.getDate() + 365);

          await projectRef.update({
            status: "published",
            paymentStatus: "paid",
            expiresAt: admin.firestore.Timestamp.fromDate(newExpiration),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          console.log(`✅ Projeto ${projectId} ativado com sucesso.`);
        } else {
          console.error(`❌ Projeto ${projectId} não encontrado no banco de dados.`);
        }
      } catch (error) {
        console.error("Erro no processamento do webhook:", error);
      }
    }
  }
  res.status(200).send({ received: true });
});
