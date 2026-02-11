
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, 
  Layout, 
  Settings, 
  Palette as PaletteIcon, 
  Globe, 
  CheckCircle2, 
  Smartphone,
  ChevronLeft
} from 'lucide-react';
import BusinessForm from './components/BusinessForm';
import WebsitePreview from './components/WebsitePreview';
import PalettePicker from './components/PalettePicker';
import DomainChecker from './components/DomainChecker';
import LandingPage from './components/LandingPage';
import { SiteFormData } from './types';
import { PALETTES } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'builder'>('landing');
  const [formData, setFormData] = useState<SiteFormData>({
    businessName: '',
    targetAudience: '',
    tone: 'Descontraído',
    whatsapp: '',
    instagram: '',
    facebook: '',
    linkedin: '',
    paletteId: 'p1'
  });

  const [activeTab, setActiveTab] = useState<'build' | 'preview'>('build');

  const handleInputChange = (name: keyof SiteFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const selectedPalette = PALETTES.find(p => p.id === formData.paletteId) || PALETTES[0];

  if (view === 'landing') {
    return <LandingPage onStart={() => setView('builder')} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b]">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView('landing')}
              className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <Rocket className="text-white w-5 h-5" />
              </div>
              <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 hidden sm:block">
                SiteCraft
              </h1>
            </div>
          </div>
          
          <nav className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-full border border-zinc-800">
            <button 
              onClick={() => setActiveTab('build')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${activeTab === 'build' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}
            >
              Configurar
            </button>
            <button 
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${activeTab === 'preview' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}
            >
              Preview
            </button>
          </nav>

          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-full font-semibold text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
            Publicar R$ 499
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Section: Controls */}
        <div className={`lg:col-span-5 space-y-8 ${activeTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
          <section className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Settings className="w-5 h-5 text-indigo-400" />
              </div>
              <h2 className="text-lg font-semibold">Identidade do Negócio</h2>
            </div>
            <BusinessForm data={formData} onChange={handleInputChange} />
          </section>

          <section className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <PaletteIcon className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-lg font-semibold">Paleta de Cores</h2>
            </div>
            <PalettePicker 
              selectedId={formData.paletteId} 
              onSelect={(id) => handleInputChange('paletteId', id)} 
            />
          </section>

          <section className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Globe className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-lg font-semibold">Domínio .com.br</h2>
            </div>
            <DomainChecker />
          </section>
        </div>

        {/* Right Section: Live Preview */}
        <div className={`lg:col-span-7 ${activeTab === 'build' ? 'hidden lg:block' : 'block'}`}>
          <div className="sticky top-24">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-zinc-800 rounded-md">
                  <Layout className="w-4 h-4 text-zinc-400" />
                </div>
                <span className="text-xs font-medium text-zinc-400">Preview em Tempo Real</span>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative border-4 border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl bg-zinc-950 min-h-[600px] flex flex-col">
                <WebsitePreview data={formData} palette={selectedPalette} />
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-6 text-zinc-500 text-xs">
              <div className="flex items-center gap-1">
                <Smartphone className="w-3 h-3" /> Responsivo
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> SEO Ready
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button 
          onClick={() => setActiveTab(activeTab === 'build' ? 'preview' : 'build')}
          className="bg-indigo-600 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-600/40 text-white"
        >
          {activeTab === 'build' ? <Layout /> : <Settings />}
        </button>
      </div>
    </div>
  );
};

export default App;
