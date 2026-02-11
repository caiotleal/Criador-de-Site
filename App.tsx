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
  const [formData, setFormData] = useState({
    businessName: '',
    targetAudience: '',
    tone: 'Descontraído',
    paletteId: 'p1'
  });

  const [activeTab, setActiveTab] = useState<'build' | 'preview'>('build');

  const handlePublish = async () => {
    if (!formData.businessName) return alert("Dê um nome ao seu negócio!");
    
    setIsPublishing(true);
    try {
      // Salva na coleção que dispara a Function que já validamos
      await addDoc(collection(db, "subscriptions"), {
        ...formData,
        status: "paid",
        createdAt: serverTimestamp(),
      });
      alert("Sucesso! Seu site está sendo gerado pela nossa IA.");
    } catch (error) {
      console.error("Erro de permissão:", error);
      alert("Erro ao publicar. Verifique as Regras do Firestore.");
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
          className="bg-indigo-600 px-6 py-2 rounded-full hover:bg-indigo-500 disabled:opacity-50 transition-all"
        >
          {isPublishing ? "Publicando..." : "Publicar R$ 499"}
        </button>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
            <h2 className="flex items-center gap-2 mb-4"><Settings size={18}/> Configuração</h2>
            <BusinessForm data={formData} onChange={(name, val) => setFormData(p => ({...p, [name]: val}))} />
          </section>
          
          <section className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
            <h2 className="flex items-center gap-2 mb-4"><PaletteIcon size={18}/> Cores</h2>
            <PalettePicker selectedId={formData.paletteId} onSelect={(id) => setFormData(p => ({...p, paletteId: id}))} />
          </section>
        </div>

        <div className="lg:col-span-7">
          <div className="sticky top-8 border-4 border-zinc-800 rounded-3xl overflow-hidden h-[600px] bg-white">
            <WebsitePreview data={formData} palette={PALETTES.find(p => p.id === formData.paletteId)} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
