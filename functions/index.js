// ... dentro do exports.generateSite ...

      // --- 2. LÓGICA DE IMAGENS (ATUALIZADA) ---
      // O source.unsplash.com MORREU. Vamos usar o Pollinations (IA) ou LoremFlickr.
      
      const imageInstruction = `
        IMAGENS:
        1. Para o HERO (Capa), use esta URL que gera imagens via IA: 
           "https://image.pollinations.ai/prompt/photorealistic%20${segment.replace(/ /g, '%20')}%20business%20high%20quality?width=1600&height=900&nologo=true"
        
        2. Para os CARDS e outras seções, use o LoremFlickr (Fotos Reais):
           "https://loremflickr.com/800/600/${segment.split(' ')[0]},work/all"
        
        IMPORTANTE: 
        - Mantenha essas URLs exatamente como estão.
        - Não tente inventar caminhos de arquivo local (ex: ./img/foto.jpg).
        - Use sempre links absolutos (https://...).
      `;

      const prompt = `
        Atue como um Arquiteto de Software Frontend. Crie um site HTML ÚNICO.
        
        DADOS:
        - Nome: "${businessName}"
        - Segmento: "${segment}"
        - Estilo Visual (Layout): "${layoutStyle}"
        - Detalhes do Negócio: "${description}"
        - Cores: Primary ${palette.primary}, Secondary ${palette.secondary}, Bg ${palette.bg}, Text ${palette.text}.

        REGRAS RÍGIDAS:
        1. ${logoInstruction}
        2. ${imageInstruction}
        3. TEXTOS: Escreva textos persuasivos em PORTUGUÊS.
        ... (resto do prompt igual)
