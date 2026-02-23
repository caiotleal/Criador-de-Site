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
// CONFIGURAÇÃO DA STRIPE
// ============================================================================
const stripe = require("stripe")("sk_test_51T3iV5LK0sp6cEMAbpSV1cM4MGESQ9s3EOffFfpUuiU0cbinuy64HCekpoyfAuWZy1gemNFcSpgF1cKPgHDM3pf500vcGP7tGW");

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
  const version = await createVersion.json();
  const versionName = version.name;

  const populate = await fetch(`https://firebasehosting.googleapis.com/v1beta1/${versionName}:populateFiles`, {
    method: "POST", headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ files: { "/index.html": fileHash } }),
  });
  const populateData = await populate.json();

  if ((populateData.uploadRequiredHashes || []).includes(fileHash)) {
    await fetch(`${populateData.uploadUrl}/${fileHash}`, {
      method: "POST", headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/octet-stream", "Content-Length": gzippedContent.length.toString() },
      body: gzippedContent,
    });
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
  throw new HttpsError("failed-precondition", existingOrNew?.message || "Falha Hosting.");
}

// ============================================================================
// FUNÇÕES DE IA E PROJETOS
// ============================================================================
exports.generateSite = onCall({ cors: true, timeoutSeconds: 60, memory: "256MiB", secrets: [geminiKey] }, async (request) => {
  const genAI = getGeminiClient();
  const { businessName, description } = request.data;
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", generationConfig: { responseMimeType: "application/json" } });
  const prompt = `Atue como redator. Empresa: "${businessName}". Descrição: "${description}". Gere JSON com: heroTitle, heroSubtitle, aboutTitle, aboutText, contactCall.`;
  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text().replace(/```json/g, "").replace(/```/g, "").trim());
  } catch (error) { throw new HttpsError("internal", error.message); }
});

exports.saveSiteProject = onCall({ cors: true, memory: "512MiB" }, async (request) => {
  const uid = ensureAuthed(request);
  const { businessName, internalDomain, generatedHtml, formData, aiContent } = request.data;
  const projectSlug = internalDomain; 

  await createHostingSiteIfPossible(projectSlug);
  const now = admin.firestore.FieldValue.serverTimestamp();
  
  await admin.firestore().collection("users").doc(uid).collection("projects").doc(projectSlug).set({
    uid, businessName, projectSlug, hostingSiteId: projectSlug, internalDomain,
    generatedHtml, formData: formData || {}, aiContent: aiContent || {},
    status: "trial", updatedAt: now, createdAt: now
  }, { merge: true });

  return { success: true, projectSlug };
});

exports.publishUserProject = onCall({ cors: true, timeoutSeconds: 180, memory: "512MiB" }, async (request) => {
  const uid = ensureAuthed(request);
  const targetId = request.data.targetId;
  const ref = admin.firestore().collection("users").doc(uid).collection("projects").doc(targetId);
  const snap = await ref.get();
  const project = snap.data();

  const hostingProvision = await ensureHostingReady(project.hostingSiteId);
  await deployHtmlToFirebaseHosting(project.hostingSiteId, project.generatedHtml);
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 5); 

  await ref.update({
    published: true, status: "published",
    expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, url: hostingProvision.defaultUrl };
});

// ==============================================================================
// WEBHOOK DA STRIPE (O QUE ATIVA O SITE NO SEU BANCO)
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
    const projectId = session.client_reference_id; 

    if (projectId) {
      try {
        const db = admin.firestore();
        // Busca em todos os usuários para achar o projeto na subcoleção 'projects'
        const usersSnap = await db.collection("users").get();
        let found = false;

        for (const userDoc of usersSnap.docs) {
          const projectRef = db.collection("users").doc(userDoc.id).collection("projects").doc(projectId);
          const pDoc = await projectRef.get();
          
          if (pDoc.exists) {
            const newExpiration = new Date();
            newExpiration.setDate(newExpiration.getDate() + 365);
            await projectRef.update({
              status: "published",
              paymentStatus: "paid",
              expiresAt: admin.firestore.Timestamp.fromDate(newExpiration)
            });
            console.log(`PROJETO ${projectId} ATIVADO COM SUCESSO.`);
            found = true;
            break;
          }
        }
        if (!found) console.error(`Projeto ${projectId} não localizado.`);
      } catch (error) { console.error("Erro no Firestore:", error); }
    }
  }
  res.status(200).send({ received: true });
});
