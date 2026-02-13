import React, { useRef, useEffect } from 'react';

interface HtmlPreviewProps {
  htmlContent: string; // O código HTML que a IA gerou
  mode: 'desktop' | 'mobile'; // Para simular responsividade
}

const HtmlPreview: React.FC<HtmlPreviewProps> = ({ htmlContent, mode }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Injeta o HTML dentro do iframe sempre que o conteúdo mudar
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
      }
    }
  }, [htmlContent]);

  return (
    <div className={`transition-all duration-300 mx-auto border-4 border-zinc-800 rounded-2xl overflow-hidden bg-white shadow-2xl ${
      mode === 'mobile' ? 'w-[375px] h-[667px]' : 'w-full h-full'
    }`}>
      {/* O iframe isola o CSS do site gerado do CSS do seu painel */}
      <iframe 
        ref={iframeRef}
        title="Site Preview"
        className="w-full h-full border-none"
        sandbox="allow-scripts allow-same-origin" // Segurança básica
      />
    </div>
  );
};

export default HtmlPreview;
