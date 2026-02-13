const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { defineSecret } = require("firebase-functions/params");

// Definição dos Secrets (Certifique-se de que estão configurados no Firebase)
const GROQ_KEY = defineSecret("GROQ_KEY");
const FB_TOKEN_CI = defineSecret("FB_TOKEN_CI");

exports.criarPublicarSite = onRequest(
  { secrets: [GROQ_KEY, FB_TOKEN_CI], cors: true },
  async (req, res) => {
    try {
      // 1. Extração dos dados do formulário (vinda do seu front-end)
      const { nomeSite, objetivo, cores, informacoes } = req.body;

      if (!nomeSite) {
        return res.status(400).send("O nome do site é obrigatório.");
      }

      logger.info(`Iniciando criação do site: ${nomeSite}`);

      // 2. Chamada para a API da Groq (Llama 3) para gerar o HTML
      const prompt = `Crie um site HTML5 profissional e responsivo para: ${objetivo}. 
                      Use as cores: ${cores}. Informações extras: ${informacoes}. 
                      Retorne apenas o código HTML completo.`;

      // Simulação da chamada Groq (Substitua pela sua lógica de fetch se necessário)
      const htmlGerado = `<!DOCTYPE html><html><body style="background:${cores}"><h1>${nomeSite}</h1><p>${informacoes}</p></body></html>`;

      // 3. Lógica de Deploy para o Firebase Hosting 
      // Nota: Aqui deve entrar a sua lógica de integração com o GitHub ou API de Hosting
      // que você estava desenvolvendo anteriormente.

      logger.info(`Site ${nomeSite} gerado com sucesso.`);

      // 4. Resposta Final
      return res.status(200).json({
        success: true,
        message: "Site criado e enviado para publicação.",
        url: `https://${nomeSite}.web.app`,
        html: htmlGerado
      });

    } catch (error) {
      logger.error("Erro no processo de criação:", error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
); // <-- Verifique se este fechamento existe na sua linha 106
