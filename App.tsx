import React, { useState } from 'react';
import { BusinessForm } from './components/BusinessForm';
import { SitePreview } from './components/SitePreview'; // Componente de preview (se houver)
import { FormData, SiteSegment } from './types';
import { Rocket, Loader2 } from 'lucide-react';

const INITIAL_STATE: FormData = {
  businessName: '',
  segment: 'servicos' as SiteSegment,
  description: '',
  colors: { primary: '#2563eb', secondary: '#1e293b' },
  layoutName: 'moderno',
  contact: { email: '', whatsapp: '' },
  logoUrl: '',
};

function App() {
  const [formData, setFormData] = useState<FormData>(INITIAL_STATE);
  const [isGenerating, setIsGenerating] = useState(false);

  // 1. Atualização Inteligente do Estado
  const handleUpdateForm = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  // 2. Disparo para Firebase Functions
  const handleGenerateSite = async () => {
    setIsGenerating(true);
    try {
      // Aqui entrará a chamada para sua Cloud Function
      console.log("Enviando para SiteCraft Engine:", formData);
      
      // Exemplo de payload esperado pela Llama 3 (Groq):
      // { ...formData, prompt_system: "Gere um site de advocacia..." }
      
      // Simulação de delay de rede
      await new Promise(res => setTimeout(res, 2000));
      
      alert("Solicitação enviada! O deploy via GitHub Actions começou.");
    } catch (error) {
      console.error("Erro ao gerar site:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-slate-900 flex items-center justify-center gap-2">
          <Rocket className="text-blue-600" /> SiteCraft
        </h1>
        <p className="text-slate-600 mt-2">Sua presença digital gerada por IA em segundos.</p>
      </header>

      <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Lado Esquerdo: Formulário */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold mb-4">Configurações do Negócio</h2>
          <BusinessForm 
            data={formData} 
            updateData={handleUpdateForm} 
          />
          
          <button
            onClick={handleGenerateSite}
            disabled={isGenerating || !formData.businessName}
            className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Gerar Site e Fazer Deploy"
            )}
          </button>
        </section>

        {/* Lado Direito: Preview de Regras de Negócio / Status */}
        <section className="flex flex-col gap-4">
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-blue-400 font-mono text-sm mb-2 uppercase tracking-widest">Preview de Blindagem</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between border-b border-slate-800 pb-2">
                <span>Plano:</span>
                <span className="text-green-400">Trial (5 dias)</span>
              </li>
              <li className="flex justify-between border-b border-slate-800 pb-2">
                <span>Segmento:</span>
                <span className="capitalize">{formData.segment}</span>
              </li>
              <li className="flex justify-between">
                <span>Layout:</span>
                <span className="italic">{formData.layoutName}</span>
              </li>
            </ul>
          </div>
          
          {/* Onde o usuário verá o progresso do GitHub Actions futuramente */}
        </section>
      </main>
    </div>
  );
}

export default App;
