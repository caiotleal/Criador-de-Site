import React, { useState } from 'react';
import { db } from './firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Rocket, Settings, Palette as PaletteIcon } from 'lucide-react';

// Importações dos Componentes
import BusinessForm from './components/BusinessForm'; // Agora a importação vai funcionar!
import WebsitePreview from './components/WebsitePreview';
import PalettePicker from './components/PalettePicker';
import LandingPage from './components/LandingPage';
import { PALETTES } from './constants';
import { SiteFormData } from './types'; // Importando a tipagem correta

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'builder'>('landing');
  const [isPublishing, setIsPublishing] = useState(false);
  
  // ESTADO INICIAL ATUALIZADO (Com os novos campos)
  const [formData, setFormData] = useState<SiteFormData>({
    businessName: '',
    segment: '',       // Novo
    description: '',   // Novo
    logoUrl: '',       // Novo
    targetAudience: '',
    tone: 'Descontraído',
    whatsapp: '',
    instagram: '',
    facebook: '',
    linkedin: '',
    paletteId: 'p1',
    layoutId: 'layout-1' // Novo (Padrão inicial)
  });

  const handlePublish = async () => {
    if (!formData.businessName) return alert("Dê um nome ao seu negócio!");
    if (!formData.description) return alert("Conte-nos sobre sua empresa para a IA criar o site!");
    
    setIsPublishing(true);
    try {
      // Salva no Firestore
      await addDoc(collection(db, "subscriptions"), {
        ...formData,
        status: "paid", // Simulação de pago
        createdAt: serverTimestamp(),
      });
      alert("Sucesso! A IA (Llama 3) vai começar a gerar seu site baseada no segmento " + formData.segment);
    } catch (error) {
      console.error("Erro ao publicar:", error);
      alert("Erro ao salvar. Verifique o console.");
    } finally {
      setIsPublishing(false);
    }
  };

  if (view === 'landing') return <LandingPage onStart={() => setView('builder')} />;

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-white">
      <header className="border-b border-zinc-800 p-4 flex justify-between items-center bg-zinc-950">
        <div className="flex items-center gap-2">
           <Rocket className="text-indigo-500" />
           <span className="font-bold">SiteCraft</span>
        </div>
        <button 
          onClick={handlePublish}
          disabled={isPublishing}
          className="bg-indigo-600 px-6 py-2 rounded-full hover:bg-indigo-500 disabled:opacity-50 transition-all font-semibold shadow-lg shadow-indigo-500/20"
        >
          {isPublishing ? "Gerando..." : "Publicar Site"}
        </button>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Coluna da Esquerda: Formulário */}
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl">
            <h2 className="flex items-center gap-2 mb-4 font-semibold text-zinc-300">
              <Settings size={18} className="text-indigo-400"/> 
              Dados do Negócio
            </h2>
            <BusinessForm 
              data={formData} 
              // A tipagem 'any' aqui é provisória apenas para garantir que o build passe
              // O ideal é tipar o BusinessForm corretamente
              onChange={(name, val) => setFormData(p => ({...p, [name]: val}))} 
            />
          </section>
          
          <section className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl">
            <h2 className="flex items-center gap-2 mb-4 font-semibold text-zinc-300">
              <PaletteIcon size={18} className="text-indigo-400"/> 
              Personalização Visual
            </h2>
            <PalettePicker selectedId={formData.paletteId} onSelect={(id) => setFormData(p => ({...p, paletteId: id}))} />
          </section>
        </div>

        {/* Coluna da Direita: Preview */}
        <div className="lg:col-span-7">
          <div className="sticky top-8 border-4 border-zinc-800 rounded-[2.5rem] overflow-hidden h-[700px] bg-white shadow-2xl shadow-indigo-500/10">
            <WebsitePreview data={formData} palette={PALETTES.find(p => p.id === formData.paletteId)} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
