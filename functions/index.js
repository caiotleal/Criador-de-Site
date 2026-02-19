const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const admin = require("firebase-admin");
const { GoogleAuth } = require("google-auth-library");

if (!admin.apps.length) {
  admin.initializeApp();
}

const geminiKey = defineSecret("GEMINI_KEY");
const githubToken = defineSecret("GITHUB_TOKEN");

const getGeminiClient = () => {
  const apiKey = geminiKey.value();

  if (!apiKey) {
    throw new HttpsError(
      "failed-precondition",
      "O Secret GEMINI_KEY não está configurado no ambiente das Cloud Functions.",
    );
  }

  return new GoogleGenerativeAI(apiKey);
};

const slugify = (value = "") =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

const ensureAuthed = (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError("unauthenticated", "Faça login para continuar.");
  }
  return request.auth.uid;
};

async function createGithubRepoIfConfigured(repoName) {
  const token = githubToken.value();
  if (!token) {
    return { status: "pending_secret", message: "Secret GITHUB_TOKEN não configurado." };
  }

  const response = await fetch("https://api.github.com/user/repos", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      name: repoName,
      private: true,
      auto_init: true,
      description: "Site criado automaticamente pelo Criador de Site",
    }),
  });

  if (response.status === 422) {
    return { status: "already_exists", url: `https://github.com/${repoName}` };
  }

  if (!response.ok) {
    const errText = await response.text();
    return { status: "error", message: errText.slice(0, 400) };
  }

  const repo = await response.json();
  return { status: "created", url: repo.html_url, fullName: repo.full_name };
}

async function createHostingSiteIfPossible(siteId) {
  const projectId = process.env.GCLOUD_PROJECT;
  if (!projectId) {
    return { status: "error", message: "GCLOUD_PROJECT não disponível." };
  }

  const auth = new GoogleAuth({ scopes: ["https://www.googleapis.com/auth/firebase"] });
  const client = await auth.getClient();
  const token = await client.getAccessToken();

  const url = `https://firebasehosting.googleapis.com/v1beta1/projects/${projectId}/sites?siteId=${siteId}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token.token || token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type: "USER_SITE" }),
  });

  if (response.status === 409) {
    return { status: "already_exists", defaultUrl: `https://${siteId}.web.app` };
  }

  if (!response.ok) {
    const errText = await response.text();
    return { status: "error", message: errText.slice(0, 400) };
  }

  const site = await response.json();
  return {
    status: "created",
    site: site.name,
    defaultUrl: site.defaultUrl || `https://${siteId}.web.app`,
  };
}

exports.generateSite = onCall({
  cors: true,
  timeoutSeconds: 60,
  memory: "256MiB",
  secrets: [geminiKey],
}, async (request) => {
  const genAI = getGeminiClient();
  const { businessName, description } = request.data;

  if (!businessName) throw new HttpsError("invalid-argument", "Nome obrigatório");

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `Atue como redator senior. Empresa: "${businessName}". Descrição: "${description}".
    Gere um JSON com: heroTitle, heroSubtitle, aboutTitle, aboutText, contactCall. Textos curtos e modernos.`;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json/g, "").replace(/```/g, "").replace(/\\n/g, "").trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Erro generateSite:", error);
    throw new HttpsError("internal", error.message);
  }
});

exports.saveSiteProject = onCall({
  cors: true,
  timeoutSeconds: 120,
  memory: "512MiB",
  secrets: [githubToken],
}, async (request) => {
  const uid = ensureAuthed(request);
  const {
    businessName,
    generatedHtml,
    formData,
    aiContent,
  } = request.data || {};

  if (!businessName || !generatedHtml) {
    throw new HttpsError("invalid-argument", "businessName e generatedHtml são obrigatórios.");
  }

  const baseSlug = slugify(businessName) || `site-${Date.now()}`;
  const projectSlug = `${baseSlug}-${uid.slice(0, 6)}`;
  const repoName = `site-${projectSlug}`;
  const hostingSiteId = `site-${projectSlug}`.slice(0, 30);

  const github = await createGithubRepoIfConfigured(repoName);
  const hosting = await createHostingSiteIfPossible(hostingSiteId);

  const now = admin.firestore.FieldValue.serverTimestamp();
  const db = admin.firestore();
  const ref = db.collection("users").doc(uid).collection("projects").doc(projectSlug);

  await ref.set({
    uid,
    businessName,
    projectSlug,
    repoName,
    hostingSiteId,
    generatedHtml,
    formData: formData || {},
    aiContent: aiContent || {},
    github,
    hosting,
    autoDeploy: true,
    needsDeploy: true,
    updatedAt: now,
    createdAt: now,
  }, { merge: true });

  return {
    success: true,
    projectSlug,
    repoName,
    hostingSiteId,
    github,
    hosting,
    message: "Projeto salvo e infra provisionada (ou marcada como pendente).",
  };
});

exports.listUserProjects = onCall({ cors: true }, async (request) => {
  const uid = ensureAuthed(request);
  const snap = await admin.firestore().collection("users").doc(uid).collection("projects")
    .orderBy("updatedAt", "desc")
    .limit(30)
    .get();

  return {
    projects: snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
  };
});
