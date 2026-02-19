const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const admin = require("firebase-admin");
const { GoogleAuth } = require("google-auth-library");
const crypto = require("crypto");

if (!admin.apps.length) {
  admin.initializeApp();
}

const geminiKey = defineSecret("GEMINI_KEY");

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
  const token = process.env.GITHUB_TOKEN || "";
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



async function getFirebaseAccessToken() {
  const auth = new GoogleAuth({ scopes: ["https://www.googleapis.com/auth/firebase"] });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token || token;
}

function sha256Hex(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

async function deployHtmlToFirebaseHosting(siteId, htmlContent) {
  const token = await getFirebaseAccessToken();
  
  // 1. Garantir conversão segura para Buffer UTF-8 e compactação
  const htmlBuffer = Buffer.from(htmlContent, "utf-8");
  const gzippedContent = zlib.gzipSync(htmlBuffer);
  const fileHash = sha256Hex(gzippedContent);

  // 2. Criar a versão
  const createVersion = await fetch(`https://firebasehosting.googleapis.com/v1beta1/sites/${siteId}/versions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ config: { rewrites: [{ glob: "**", path: "/index.html" }] } }),
  });

  if (!createVersion.ok) {
    const txt = await createVersion.text();
    throw new Error(`Falha ao criar versão Hosting: ${txt}`);
  }

  const version = await createVersion.json();
  const versionName = version.name;

  // 3. Preparar o upload (populateFiles)
  const populate = await fetch(`https://firebasehosting.googleapis.com/v1beta1/${versionName}:populateFiles`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ files: { "/index.html": fileHash } }),
  });

  if (!populate.ok) {
    const txt = await populate.text();
    throw new Error(`Falha ao preparar upload Hosting: ${txt}`);
  }

  const populateData = await populate.json();
  const requiredHashes = populateData.uploadRequiredHashes || [];

  // 4. Fazer o upload exato (com Content-Length)
  if (requiredHashes.includes(fileHash)) {
    const uploadUrl = `${populateData.uploadUrl}/${fileHash}`;

    const up = await fetch(uploadUrl, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/octet-stream",
        // A chave para o Firebase aceitar o GZIP sem fatiamento:
        "Content-Length": gzippedContent.length.toString() 
      },
      body: gzippedContent,
    });

    if (!up.ok) {
      const txt = await up.text();
      throw new Error(`Falha no upload do arquivo para Hosting: ${txt}`);
    }
  }

  // 5. Finalizar a versão
  const finalize = await fetch(`https://firebasehosting.googleapis.com/v1beta1/${versionName}?updateMask=status`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: "FINALIZED" }),
  });

  if (!finalize.ok) {
    const txt = await finalize.text();
    throw new Error(`Falha ao finalizar versão Hosting: ${txt}`);
  }

  // 6. Criar o release
  const release = await fetch(`https://firebasehosting.googleapis.com/v1beta1/sites/${siteId}/releases?versionName=${encodeURIComponent(versionName)}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: "Deploy automático via Criador de Site" }),
  });

  if (!release.ok) {
    const txt = await release.text();
    throw new Error(`Falha ao criar release Hosting: ${txt}`);
  }

  return { versionName, release: await release.json() };
}

async function ensureHostingReady(siteId) {
  const existingOrNew = await createHostingSiteIfPossible(siteId);
  if (existingOrNew.status === "created" || existingOrNew.status === "already_exists") {
    return existingOrNew;
  }

  const reason = existingOrNew?.message || "Falha ao provisionar site no Firebase Hosting.";
  throw new HttpsError("failed-precondition", reason);
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


exports.publishUserProject = onCall({
  cors: true,
  timeoutSeconds: 180,
  memory: "512MiB",
}, async (request) => {
  const uid = ensureAuthed(request);
  const { projectSlug } = request.data || {};

  if (!projectSlug) {
    throw new HttpsError("invalid-argument", "projectSlug é obrigatório.");
  }

  const ref = admin.firestore().collection("users").doc(uid).collection("projects").doc(projectSlug);
  const snap = await ref.get();

  if (!snap.exists) {
    throw new HttpsError("not-found", "Projeto não encontrado para este usuário.");
  }

  const project = snap.data();
  const html = project.generatedHtml;
  const hostingSiteId = project.hostingSiteId;

  if (!html || !hostingSiteId) {
    throw new HttpsError("failed-precondition", "Projeto sem HTML ou hostingSiteId.");
  }

  try {
    const hostingProvision = await ensureHostingReady(hostingSiteId);
    const deployResult = await deployHtmlToFirebaseHosting(hostingSiteId, html);
    const publicUrl = hostingProvision.defaultUrl || `https://${hostingSiteId}.web.app`;

    await ref.set({
      published: true,
      publishUrl: publicUrl,
      publishedAt: admin.firestore.FieldValue.serverTimestamp(),
      needsDeploy: false,
      lastDeploy: deployResult,
      hosting: {
        ...(project.hosting || {}),
        ...hostingProvision,
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    return {
      success: true,
      publishUrl: publicUrl,
      hostingSiteId,
      deploy: deployResult,
    };
  } catch (error) {
    console.error("Erro publishUserProject:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError(
      "internal",
      "Falha ao publicar o projeto no Firebase Hosting.",
      { message: error?.message || "erro desconhecido" },
    );
  }
});
