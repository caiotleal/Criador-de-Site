const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { defineSecret } = require("firebase-functions/params");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const admin = require("firebase-admin");
const { GoogleAuth } = require("google-auth-library");
const crypto = require("crypto");
const zlib = require("zlib");
const { onRequest } = require("firebase-functions/v2/https");

// ============================================================================
// CONFIGURAÇÃO DA STRIPE (COLOQUE SUA CHAVE SECRETA AQUI)
// ============================================================================
const stripe = require("stripe")("whsec_s0sKkzYh75uyzOgD7j2N9AKJ6BogsUum");

if (!admin.apps.length) admin.initializeApp();

const geminiKey = defineSecret("GEMINI_KEY");

const getProjectId = () => process.env.GCLOUD_PROJECT || JSON.parse(process.env.FIREBASE_CONFIG || '{}').projectId;

const getGeminiClient = () => {
  const apiKey = geminiKey.value();
  if (!apiKey) throw new HttpsError("failed-precondition", "Secret GEMINI_KEY ausente.");
  return new GoogleGenerativeAI(apiKey);
};

const slugify = (value = "") => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);

const ensureAuthed = (request) => {
  if (!request.auth?.uid) throw new HttpsError("unauthenticated", "Faça login para continuar.");
  return request.auth.uid;
};

async function getFirebaseAccessToken() {
  const auth = new GoogleAuth({ scopes: ["https://www.googleapis.com/auth/firebase"] });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token || token;
}

async function configureSiteRetention(siteId) {
  try {
    const projectId = getProjectId();
    if (!projectId) return;
    const token = await getFirebaseAccessToken();
    const url = `https://firebasehosting.googleapis.com/v1beta1/projects/${projectId}/sites/${siteId}/config?updateMask=maxVersions`;
    await fetch(url, {
      method: "PATCH", headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ maxVersions: 2 }),
    });
  } catch (e) { console.error(`Falha retenção ${siteId}`, e); }
}

async function createHostingSiteIfPossible(siteId) {
  const projectId = getProjectId();
  if (!projectId) return { status: "error", message: "GCLOUD_PROJECT não disponível." };
  const token = await getFirebaseAccessToken();
  const url = `https://firebasehosting.googleapis.com/v1beta1/projects/${projectId}/sites?siteId=${siteId}`;
  const response = await fetch(url, {
    method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ type: "USER_SITE" }),
  });
  if (response.status === 409) return { status: "already_exists", defaultUrl: `https://${siteId}.web.app` };
  if (!response.ok) return { status: "error", message: (await response.text()).slice(0, 400) };
  const site = await response.json();
  return { status: "created", site: site.name, defaultUrl: site.defaultUrl || `https://${siteId}.web.app` };
}

function sha256Hex(content) { return crypto.createHash("sha256").update(content).digest("hex"); }

async function deployHtmlToFirebaseHosting(siteId, htmlContent) {
  const token = await getFirebaseAccessToken();
  const htmlBuffer = Buffer.from(htmlContent, "utf-8");
  const gzippedContent = zlib.gzipSync(htmlBuffer);
  const fileHash = sha256Hex(gzippedContent);

  const createVersion = await fetch(`https://firebasehosting.googleapis.com/v1beta1/sites/${siteId}/versions`, {
    method: "POST", headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ config: { rewrites: [{ glob: "**", path: "/index.html" }] } }),
  });
  if (!createVersion.ok) throw new Error(`Falha criar versão: ${await createVersion.text()}`);
  const version = await createVersion.json();
  const versionName = version.name;

  const populate = await fetch(`https://firebasehosting.googleapis.com/v1beta1/${versionName}:populateFiles`, {
    method: "POST", headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ files: { "/index.html": fileHash } }),
  });
  if (!populate.ok) throw new Error(`Falha populate: ${await populate.text()}`);
  const populateData = await populate.json();

  if ((populateData.uploadRequiredHashes || []).includes(fileHash)) {
    const up = await fetch(`${populateData.uploadUrl}/${fileHash}`, {
      method: "POST", headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/octet-stream", "Content-Length": gzippedContent.length.toString() },
      body: gzippedContent,
    });
    if (!up.ok) throw new Error(`Falha upload: ${await up.text()}`);
  }

  await fetch(`https://firebasehosting.googleapis.com/v1beta1/${versionName}?updateMask=status`, {
    method: "PATCH", headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ status: "FINALIZED" }),
  });

  const release = await fetch(`https://firebasehosting.googleapis.com/v1beta1/sites/${siteId}/releases?versionName=${encodeURIComponent(versionName)}`, {
    method: "POST", headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Deploy automático" }),
  });

  return { versionName, release: await release.json() };
}

async function ensureHostingReady(siteId) {
  const existingOrNew = await createHostingSiteIfPossible(siteId);
  if (existingOrNew.status === "created" || existingOrNew.status === "already_exists") {
    await configureSiteRetention(siteId);
    return existingOrNew;
  }
  throw new HttpsError("failed-precondition", existingOrNew?.message || "Falha ao preparar o Firebase Hosting.");
}

exports.generateSite = onCall({ cors: true, timeoutSeconds: 60, memory: "256MiB", secrets: [geminiKey] }, async (request) => {
  const genAI = getGeminiClient();
  const { businessName, description } = request.data;
  if (!businessName) throw new HttpsError("invalid-argument", "Nome obrigatório");

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });

  const prompt = `Atue como um redator publicitário sênior e revisor ortográfico.
    Empresa: "${businessName}". Descrição: "${description}".
    Gere JSON exato com as chaves: heroTitle, heroSubtitle, aboutTitle, aboutText, contactCall.
    REGRAS: 1. Corrija ortografia. 2. Primeira letra maiúscula e restante minúsculo conforme a norma culta. NÃO use caixa alta em tudo. 3. Textos curtos, altamente persuasivos.`;

  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text().replace(/```json/g, "").replace(/```/g, "").replace(/\\n/g, "").trim());
  } catch (error) { throw new HttpsError("internal", error.message); }
});

exports.checkDomainAvailability = onCall({ cors: true }, async (request) => {
  const { desiredDomain } = request.data || {};
  const cleanDomain = slugify(desiredDomain).slice(0, 30);
  const snap = await admin.firestore().collectionGroup("projects").where("hostingSiteId", "==", cleanDomain).get();
  if (!snap.empty) return { available: false, cleanDomain, message: "Já em uso." };
  return { available: true, cleanDomain };
});

exports.saveSiteProject = onCall({ cors: true, memory: "512MiB" }, async (request) => {
  const uid = ensureAuthed(request);
  const { businessName, internalDomain, officialDomain, generatedHtml, formData, aiContent } = request.data;
  const projectSlug = internalDomain; 

  const hosting = await createHostingSiteIfPossible(projectSlug);
  await configureSiteRetention(projectSlug);

  const now = admin.firestore.FieldValue.serverTimestamp();
  await admin.firestore().collection("users").doc(uid).collection("projects").doc(projectSlug).set({
    uid, businessName, projectSlug, hostingSiteId: projectSlug, internalDomain,
    officialDomain: officialDomain || "Pendente", generatedHtml, formData: formData || {}, aiContent: aiContent || {},
    hosting, autoDeploy: true, needsDeploy: true, updatedAt: now, createdAt: now, status: "draft"
  }, { merge: true });

  return { success: true, projectSlug, hostingSiteId: projectSlug };
});

exports.updateSiteProject = onCall({ cors: true }, async (request) => {
  const uid = ensureAuthed(request);
  const targetId = request.data.targetId || request.data.projectId || request.data.projectSlug;
  const { html, formData, aiContent } = request.data;
  
  await admin.firestore().collection("users").doc(uid).collection("projects").doc(targetId).update({
    generatedHtml: html, ...(formData && { formData }), ...(aiContent && { aiContent }),
    needsDeploy: true, updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { success: true };
});

exports.listUserProjects = onCall({ cors: true }, async (request) => {
  const uid = ensureAuthed(request);
  const snap = await admin.firestore().collection("users").doc(uid).collection("projects").orderBy("updatedAt", "desc").get();
  return { projects: snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) };
});

exports.publishUserProject = onCall({ cors: true, timeoutSeconds: 180, memory: "512MiB" }, async (request) => {
  try {
    const uid = ensureAuthed(request);
    const targetId = request.data.targetId || request.data.projectId || request.data.projectSlug;
    if (!targetId) throw new HttpsError("invalid-argument", "ID do projeto é obrigatório para publicar.");

    const db = admin.firestore();
    const ref = db.collection("users").doc(uid).collection("projects").doc(targetId);
    const snap = await ref.get();
    
    if (!snap.exists) throw new HttpsError("not-found", "Projeto não encontrado.");
    const project = snap.data();
    if (!project.generatedHtml || !project.hostingSiteId) throw new HttpsError("failed-precondition", "Projeto incompleto sem HTML ou Site ID.");

    const hostingProvision = await ensureHostingReady(project.hostingSiteId);
    const deployResult = await deployHtmlToFirebaseHosting(project.hostingSiteId, project.generatedHtml);
    const publicUrl = hostingProvision.defaultUrl || `https://${project.hostingSiteId}.web.app`;

    // LÓGICA DE COBRANÇA: 5 Dias de Trial se for novo
    let expiresAt = project.expiresAt ? project.expiresAt.toDate() : null;
    if (!expiresAt) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 5); // 5 DIAS DE TRIAL
    }

    await ref.set({
      published: true, publishUrl: publicUrl, publishedAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
      status: "published", needsDeploy: false, lastDeploy: deployResult,
      hosting: { ...(project.hosting || {}), ...hostingProvision },
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    return { success: true, publishUrl: publicUrl, expiresAt: expiresAt.toISOString() };
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    const errMsg = error?.message ? String(error.message).toLowerCase() : "";
    if (errMsg.includes("404") || errMsg.includes("not found") || errMsg.includes("deleted")) {
      throw new HttpsError("not-found", "A infraestrutura deste site não existe mais. O projeto foi retirado da lista.");
    }
    throw new HttpsError("internal", "Falha interna no servidor ao publicar.", { detail: errMsg });
  }
});

exports.deleteUserProject = onCall({ cors: true }, async (request) => {
  const uid = ensureAuthed(request);
  const targetId = request.data.targetId || request.data.projectId || request.data.projectSlug;
  const ref = admin.firestore().collection("users").doc(uid).collection("projects").doc(targetId);
  const snap = await ref.get();

  if (snap.exists) {
    const siteId = snap.data().hostingSiteId;
    if (siteId) {
      try {
        const projectIdEnv = getProjectId();
        const token = await getFirebaseAccessToken();
        await fetch(`https://firebasehosting.googleapis.com/v1beta1/projects/${projectIdEnv}/sites/${siteId}`, {
          method: "DELETE", headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) { console.error("Falha ao deletar site no Hosting", e); }
    }
    await ref.delete();
  }
  return { success: true };
});

// SIMULAÇÃO DE RENOVAÇÃO MANUAL (Você pode apagar isso depois, pois a Stripe vai fazer automático)
exports.renewSiteSubscription = onCall({ cors: true }, async (request) => {
  const uid = ensureAuthed(request);
  const targetId = request.data.targetId || request.data.projectId || request.data.projectSlug;

  const ref = admin.firestore().collection("users").doc(uid).collection("projects").doc(targetId);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError("not-found", "Projeto não encontrado.");

  const newExpiration = new Date();
  newExpiration.setDate(newExpiration.getDate() + 365); // MAIS 1 ANO

  await ref.update({
    expiresAt: admin.firestore.Timestamp.fromDate(newExpiration),
    status: "published", 
    paymentStatus: "paid",
    needsDeploy: true
  });

  return { success: true, newExpiration: newExpiration.toISOString() };
});


// ==============================================================================
// WEBHOOK DA STRIPE (A MÁGICA QUE LIBERA O SITE)
// ==============================================================================
exports.stripeWebhook = onRequest({ cors: true }, async (req, res) => {
  const sig = req.headers["stripe-signature"];
  
  // COLOQUE AQUI A CHAVE WHSEC QUE A STRIPE VAI TE DAR NO PAINEL DE WEBHOOKS
  const endpointSecret = "whsec_SEU_SEGREDO_WEBHOOK_AQUI"; 

  let event;

  try {
    // A Stripe exige ler o buffer raw. Se falhar, é porque o Firebase parseou o body.
    event = stripe.webhooks.constructEvent(req.rawBody || req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Erro na assinatura do Webhook:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Verifica se o pagamento foi completado com sucesso
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    
    // Pegamos o ID do projeto que nós enviamos pelo link no App.tsx
    const projectId = session.client_reference_id; 

    if (projectId) {
      try {
        const db = admin.firestore();
        
        // Busca o projeto usando o collectionGroup para não precisar do UID do usuário
        const projectQuery = await db.collectionGroup("projects").where("projectSlug", "==", projectId).get();
        
        if (!projectQuery.empty) {
          const projectRef = projectQuery.docs[0].ref;
          
          const newExpiration = new Date();
          newExpiration.setDate(newExpiration.getDate() + 365); // Adiciona 1 ano de acesso

          await projectRef.update({
            status: "published", // Retira o site do status de "frozen"
            paymentStatus: "paid",
            expiresAt: admin.firestore.Timestamp.fromDate(newExpiration),
            needsDeploy: true // Avisa o sistema que o site precisa ser publicado de novo para ficar visível
          });
          
          console.log(`PAGAMENTO APROVADO! Projeto ${projectId} renovado por 1 ano.`);
        } else {
          console.error(`Projeto ${projectId} não encontrado no banco de dados após o pagamento.`);
        }
      } catch (error) {
        console.error(`Erro fatal ao atualizar o projeto ${projectId} no Firebase:`, error);
      }
    }
  }

  res.status(200).send({ received: true });
});


// ==============================================================================
// CRON JOB DIÁRIO: CONGELAMENTO E EXCLUSÃO
// ==============================================================================
exports.cleanupExpiredSites = onSchedule("every 24 hours", async (event) => {
  const db = admin.firestore();
  const now = admin.firestore.Timestamp.now();
  const token = await getFirebaseAccessToken();
  const projectIdEnv = getProjectId();
  
  // 1. CONGELA SITES QUE VENCERAM (Passou 5 dias do trial ou 1 ano do pago)
  const expiredSnap = await db.collectionGroup("projects").where("published", "==", true).where("expiresAt", "<=", now).get();
  let frozenCount = 0;

  for (const doc of expiredSnap.docs) {
    const data = doc.data();
    if (data.hostingSiteId) {
      try {
        // Deleta do Firebase Hosting (Site sai do ar)
        await fetch(`https://firebasehosting.googleapis.com/v1beta1/projects/${projectIdEnv}/sites/${data.hostingSiteId}`, {
          method: "DELETE", headers: { Authorization: `Bearer ${token}` }
        });
        frozenCount++;
      } catch (e) {}
    }
    
    // Configura a data de deleção fatal (+30 dias após congelar)
    const hardDeleteDate = new Date();
    hardDeleteDate.setDate(hardDeleteDate.getDate() + 30);

    await doc.ref.update({
      published: false,
      status: "frozen",
      frozenAt: now,
      hardDeleteAt: admin.firestore.Timestamp.fromDate(hardDeleteDate),
      needsDeploy: true
    });
  }

  // 2. EXCLUI SITES CONGELADOS HÁ MAIS DE 30 DIAS
  const frozenSnap = await db.collectionGroup("projects").where("status", "==", "frozen").where("hardDeleteAt", "<=", now).get();
  let deletedCount = 0;

  for (const doc of frozenSnap.docs) {
    await doc.ref.delete();
    deletedCount++;
  }

  console.log(`Cron: ${frozenCount} sites congelados. ${deletedCount} excluídos permanentemente.`);
});
