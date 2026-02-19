const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { GoogleGenerativeAI } = require("@google/generative-ai");

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

    // Limpeza agressiva para garantir que seja apenas JSON
    text = text.replace(/```json/g, "").replace(/```/g, "").replace(/\\n/g, "").trim();

    return JSON.parse(text);
  } catch (error) {
    console.error("Erro:", error);
    throw new HttpsError("internal", error.message);
  }
});
