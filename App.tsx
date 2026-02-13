import React, { useState } from 'react';
import { db } from './firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Settings, Palette as PaletteIcon, Globe, Layout, ChevronLeft } from 'lucide-react';

// Importe seus componentes locais
import BusinessForm from './components/BusinessForm';
import WebsitePreview from './components/WebsitePreview';
import PalettePicker from './components/PalettePicker';
import DomainChecker from './components/DomainChecker';
import LandingPage from './components/LandingPage';
import { PALETTES } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'builder'>('landing');
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Adicionamos 'description' e 'logoUrl' ao estado inicial
  const [formData, setFormData] = useState({
    businessName: '',
    targetAudience: '',
    description: '', // NOVO: Campo para o "Sobre a empresa"
    logoUrl: '',      // NOVO: Para armazenar o link do logo
    tone: 'Descontraído',
    paletteId: 'p1'
  });

  const [activeTab, setActiveTab] = useState<'build' | 'preview'>('build');

  const handlePublish = async () => {
    if (!formData.businessName) return alert("Dê um nome ao seu negócio!");
    if (!formData.description) return alert("Conte-nos um pouco sobre sua empresa para a IA gerar o conteúdo!");
    
    setIsPublishing(true);
    try {
      // Salva no Firestore. O campo 'description' será lido pela sua Cloud Function
      await addDoc(collection(db, "subscriptions"), {
        ...formData,
        status: "paid",
        createdAt: serverTimestamp(),
      });
      alert("Sucesso! O Llama 3 está criando seu site personalizado agora.");
    } catch (error) {
      console.error("Erro ao publicar:", error);
      alert("Houve um erro. Verifique sua conexão ou permissões.");
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
          {isPublishing ? "Gerando Site..." : "Publicar Site Agora"}
        </button>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl">
            <h2 className="flex items-center gap-2 mb-4 font-semibold text-zinc-300">
              <Settings size={18} className="text-indigo-400"/> 
              Identidade do Negócio
            </h2>
            {/* Passamos o formData atualizado para o BusinessForm */}
            <BusinessForm 
              data={formData} 
              onChange={(name, val) => setFormData(p => ({...p, [name]: val}))} 
            />
          </section>
          
          <section className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl">
            <h2 className="flex items-center gap-2 mb-4 font-semibold text-zinc-300">
              <PaletteIcon size={18} className="text-indigo-400"/> 
              Estilo Visual
            </h2>
            <PalettePicker selectedId={formData.paletteId} onSelect={(id) => setFormData(p => ({...p, paletteId: id}))} />
          </section>
        </div>

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
