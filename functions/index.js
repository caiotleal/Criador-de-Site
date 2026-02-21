const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { defineSecret } = require("firebase-functions/params");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const admin = require("firebase-admin");
const { GoogleAuth } = require("google-auth-library");
const crypto = require("crypto");
const zlib = require("zlib");

if (!admin.apps.length) {
  admin.initializeApp();
}

const geminiKey = defineSecret("GEMINI_KEY");

const getGeminiClient = () => {
  const apiKey = geminiKey.value();
  if (!apiKey) throw new HttpsError("failed-precondition", "Secret GEMINI_KEY ausente.");
  return new GoogleGenerativeAI(apiKey);
};

const slugify = (value = "") =>
  value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);

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
    const projectId = process.env.GCLOUD_PROJECT;
    const token = await getFirebaseAccessToken();
    const url = `https://firebasehosting.googleapis.com/v1beta1/projects/${projectId}/sites/${siteId}/config?updateMask=maxVersions`;
    await fetch(url, {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ maxVersions: 2 }),
    });
  } catch (e) { console.error(`Falha retenção ${siteId}`, e); }
}

async function createHostingSiteIfPossible(siteId) {
  const projectId = process.env.GCLOUD_PROJECT;
  const token = await getFirebaseAccessToken();
  const url = `https://firebasehosting.googleapis.com/v1beta1/projects/${projectId}/sites?siteId=${siteId}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
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
  throw new HttpsError("failed-precondition", existingOrNew?.message || "Falha Hosting.");
}

exports.generateSite = onCall({ cors: true, timeoutSeconds: 60, memory: "256MiB", secrets: [geminiKey] }, async (request) => {
  const genAI = getGeminiClient();
  const { businessName, description } = request.data;
  if (!businessName) throw new HttpsError("invalid-argument", "Nome obrigatório");

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });

  const prompt = `Atue como redator publicitário sênior e revisor ortográfico.
    Empresa: "${businessName}". Descrição: "${description}".
    Gere JSON exato com as chaves: heroTitle, heroSubtitle, aboutTitle, aboutText, contactCall.
    REGRAS: 1. Corrija ortografia. 2. Primeira letra maiúscula e restante natural, NÃO use caixa alta em tudo. 3. Textos persuasivos para vendas.`;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    return JSON.parse(text.replace(/```json/g, "").replace(/```/g, "").replace(/\\n/g, "").trim());
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
  const { targetId, html, formData, aiContent } = request.data;
  
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
  const uid = ensureAuthed(request);
  const { targetId } = request.data;

  const ref = admin.firestore().collection("users").doc(uid).collection("projects").doc(targetId);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError("not-found", "Projeto não encontrado.");
  
  const project = snap.data();
  if (!project.generatedHtml || !project.hostingSiteId) throw new HttpsError("failed-precondition", "Projeto incompleto.");

  const hostingProvision = await ensureHostingReady(project.hostingSiteId);
  const deployResult = await deployHtmlToFirebaseHosting(project.hostingSiteId, project.generatedHtml);
  const publicUrl = hostingProvision.defaultUrl || `https://${project.hostingSiteId}.web.app`;

  // REGRA DE VALIDADE: Se não tem validade (primeira vez), ganha 5 dias de Trial. 
  // Se já tem validade (foi pago ou ainda no trial), mantém a data existente.
  let expiresAt = project.expiresAt ? project.expiresAt.toDate() : null;
  if (!expiresAt) {
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 5); // 5 DIAS GRÁTIS
  }

  await ref.set({
    published: true, publishUrl: publicUrl, publishedAt: admin.firestore.FieldValue.serverTimestamp(),
    expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
    status: "published", needsDeploy: false, lastDeploy: deployResult,
    hosting: { ...(project.hosting || {}), ...hostingProvision },
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  return { success: true, publishUrl: publicUrl, expiresAt: expiresAt.toISOString() };
});

exports.deleteUserProject = onCall({ cors: true }, async (request) => {
  const uid = ensureAuthed(request);
  const { targetId } = request.data;
  const ref = admin.firestore().collection("users").doc(uid).collection("projects").doc(targetId);
  const snap = await ref.get();

  if (snap.exists) {
    const siteId = snap.data().hostingSiteId;
    if (siteId) {
      try {
        const projectIdEnv = process.env.GCLOUD_PROJECT;
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

// SIMULAÇÃO DE PAGAMENTO (Renovação por 365 dias)
exports.renewSiteSubscription = onCall({ cors: true }, async (request) => {
  const uid = ensureAuthed(request);
  const { targetId } = request.data;

  const ref = admin.firestore().collection("users").doc(uid).collection("projects").doc(targetId);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError("not-found", "Projeto não encontrado.");

  const newExpiration = new Date();
  newExpiration.setDate(newExpiration.getDate() + 365); // MAIS 1 ANO

  await ref.update({
    expiresAt: admin.firestore.Timestamp.fromDate(newExpiration),
    status: "published", // Tira do status de 'frozen'
    paymentStatus: "paid",
    needsDeploy: true // Força o cliente a clicar em publicar de novo se estava congelado
  });

  return { success: true, newExpiration: newExpiration.toISOString() };
});


// ==============================================================================
// CRON JOB DIÁRIO: CONGELAMENTO E EXCLUSÃO POR FALTA DE PAGAMENTO
// ==============================================================================
exports.cleanupExpiredSites = onSchedule("every 24 hours", async (event) => {
  const db = admin.firestore();
  const now = admin.firestore.Timestamp.now();
  const token = await getFirebaseAccessToken();
  const projectIdEnv = process.env.GCLOUD_PROJECT;
  
  // 1. CONGELAR SITES QUE VENCERAM (Passou os 5 dias ou 365 dias)
  const expiredSnap = await db.collectionGroup("projects").where("published", "==", true).where("expiresAt", "<=", now).get();
  let frozenCount = 0;

  for (const doc of expiredSnap.docs) {
    const data = doc.data();
    if (data.hostingSiteId) {
      try {
        // Tira o site do ar deletando do Hosting
        await fetch(`https://firebasehosting.googleapis.com/v1beta1/projects/${projectIdEnv}/sites/${data.hostingSiteId}`, {
          method: "DELETE", headers: { Authorization: `Bearer ${token}` }
        });
        frozenCount++;
      } catch (e) {}
    }
    
    // Marca como congelado e define o prazo fatal de 30 dias para pagar
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

  // 2. EXCLUIR DEFINITIVAMENTE SITES CONGELADOS HÁ MAIS DE 30 DIAS
  const frozenSnap = await db.collectionGroup("projects").where("status", "==", "frozen").where("hardDeleteAt", "<=", now).get();
  let deletedCount = 0;

  for (const doc of frozenSnap.docs) {
    // Apaga do banco de dados definitivamente
    await doc.ref.delete();
    deletedCount++;
  }

  console.log(`Cron Finalizado: ${frozenCount} congelados. ${deletedCount} excluídos permanentemente.`);
});
