import { useEffect } from 'react';

// Definimos o que esse arquivo precisa receber do App principal
interface UseIframeEditorProps {
  setGeneratedHtml: (html: string | null) => void;
  setHasUnsavedChanges: (status: boolean) => void;
}

export const useIframeEditor = ({ setGeneratedHtml, setHasUnsavedChanges }: UseIframeEditorProps) => {
  useEffect(() => {
    const handleIframeMessage = async (event: MessageEvent) => {
      
      // 1. Salva edições de texto gerais do site
      if (event.data?.type === 'CONTENT_EDITED') {
        setGeneratedHtml(event.data.html);
        setHasUnsavedChanges(true);
      }
      
      // 2. Upload Manual de Imagem
      if (event.data?.type === 'REQUEST_UPLOAD') {
        const input = document.createElement('input');
        input.type = 'file'; 
        input.accept = 'image/*';
        input.onchange = (e: any) => {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = () => {
            const iframe = document.querySelector('iframe');
            iframe?.contentWindow?.postMessage({ type: 'INSERT_IMAGE', targetId: event.data.targetId, url: reader.result }, '*');
          };
          reader.readAsDataURL(file);
        };
        input.click();
      }

      // 3. Motor de Geração de Imagem por IA
      if (event.data?.type === 'REQUEST_AI') {
        const promptText = window.prompt("Descreva a imagem que deseja gerar (Ex: 'Uma padaria moderna, realista'):");
        if (promptText) {
          // O motor de IA isolado
          const safePrompt = encodeURIComponent(promptText + ", ultra realistic, professional photography, high resolution");
          const imageUrl = `https://image.pollinations.ai/prompt/${safePrompt}?width=1200&height=800&nologo=true`;
          
          const iframe = document.querySelector('iframe');
          iframe?.contentWindow?.postMessage({ type: 'INSERT_IMAGE', targetId: event.data.targetId, url: imageUrl }, '*');
        }
      }
    };
    
    // Liga o "ouvido" do sistema
    window.addEventListener('message', handleIframeMessage);
    // Desliga quando o componente for fechado (limpeza de memória)
    return () => window.removeEventListener('message', handleIframeMessage);
    
  }, [setGeneratedHtml, setHasUnsavedChanges]); 
};
