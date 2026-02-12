// Importante: Adicione SchemaType na importação lá em cima:
  // import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

  useEffect(() => {
    const fetchAIContent = async () => {
      if (!data.businessName || !data.targetAudience) return;
      
      setIsGenerating(true);
      try {
        // 1. Inicialização Correta (Use sua chave aqui ou via variável de ambiente)
        // Nota: Em Vite, use import.meta.env.VITE_API_KEY em vez de process.env
        const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY); 
        
        // 2. Obter o Modelo
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash", // Use um modelo válido
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: SchemaType.OBJECT,
                    properties: {
                        headline: { type: SchemaType.STRING, description: 'Um título chamativo' },
                        subheadline: { type: SchemaType.STRING, description: 'Um subtítulo persuasivo' }
                    },
                    required: ["headline", "subheadline"]
                }
            }
        });

        // 3. Gerar Conteúdo
        const prompt = `Atue como um redator publicitário. Crie título e subtítulo para:
            Empresa: ${data.businessName}
            Público: ${data.targetAudience}
            Tom: ${data.tone}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonResult = JSON.parse(responseText);

        if (jsonResult.headline && jsonResult.subheadline) {
          setAiContent(jsonResult);
        }
      } catch (err) {
        console.error("Erro na geração de conteúdo com IA:", err);
      } finally {
        setIsGenerating(false);
      }
    };

    const debounce = setTimeout(fetchAIContent, 1000);
    return () => clearTimeout(debounce);
  }, [data.businessName, data.targetAudience, data.tone]);
