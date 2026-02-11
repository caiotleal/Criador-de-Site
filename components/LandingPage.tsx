
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Rocket, 
  ArrowRight, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Zap,
  Shield,
  Layout
} from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || businessName.length < 3) return;

    setLoading(true);
    setError(null);
    
    try {
      // Salva o "Lead de Venda" no Firestore para disparar a Cloud Function
      await addDoc(collection(db, 'subscriptions'), {
        businessName: businessName.trim(),
        status: 'paid', // Simula o pagamento aprovado para ativar o deploy automático
        createdAt: serverTimestamp(),
        source: 'main_portal',
        platformVersion: '2.0'
      });
      
      setSuccess(true);
      // Pequeno delay para o usuário ver o check de sucesso antes de ir pro builder
      setTimeout(() => onStart(), 2000);
    } catch (err: any) {
      console.error("Erro Firebase:", err);
      setError("Não foi possível conectar ao servidor. Verifique sua internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] selection:bg-indigo-500/30">
      {/* Background Decorativo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 md:py-24">
        {/* Nav Minimalista */}
        <nav className="flex justify-between items-center mb-20">
          <div className="flex items-center gap-2 group cursor-default">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">SiteCraft</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-zinc-400">
            <a href="#" className="hover:text-white transition-colors">Funcionalidades</a>
            <a href="#" className="hover:text-white transition-colors">Preços</a>
            <a href="#" className="hover:text-white transition-colors">Showcase</a>
          </div>
        </nav>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Hero Content */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-6">
              <Zap className="w-3 h-3 fill-current" /> NOVO: DEPLOY INSTANTÂNEO
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1] tracking-tight">
              Sua empresa merece um <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">site de elite.</span>
            </h1>
            <p className="text-lg text-zinc-400 mb-10 max-w-lg leading-relaxed">
              Esqueça editores complexos. Digite o nome da sua empresa e nós geramos, configuramos e publicamos seu site profissional em segundos.
            </p>

            <div className="grid grid-cols-2 gap-6 mb-12">
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-3 h-3 text-emerald-500" />
                </div>
                <p className="text-sm text-zinc-500">Hospedagem inclusa</p>
              </div>
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-3 h-3 text-emerald-500" />
                </div>
                <p className="text-sm text-zinc-500">Design responsivo</p>
              </div>
            </div>
          </motion.div>

          {/* Card de Conversão */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-zinc-900/50 border border-zinc-800 p-8 md:p-10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Layout className="w-32 h-32" />
            </div>

            <h2 className="text-2xl font-bold mb-2">Pronto para começar?</h2>
            <p className="text-zinc-500 text-sm mb-8">Nenhuma configuração técnica necessária.</p>

            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-600 ml-1">Nome do seu Negócio</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Studio de Design Loft"
                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all placeholder:text-zinc-700"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                  />
                </div>
                
                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {error}
                  </motion.div>
                )}

                <button 
                  type="submit"
                  disabled={loading || businessName.length < 3}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-indigo-600/20 group"
                >
                  {loading ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    <>
                      Criar meu Site Grátis
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
                <p className="text-[10px] text-center text-zinc-600 mt-4">
                  Ao clicar, você concorda com nossos termos de serviço.
                </p>
              </form>
            ) : (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                className="py-12 text-center space-y-4"
              >
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-emerald-400">Quase lá!</h3>
                <p className="text-zinc-400 text-sm">Registro salvo. Abrindo o editor...</p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Footer Minimal */}
        <div className="mt-32 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <Shield className="w-4 h-4 text-zinc-600" />
            <span className="text-xs text-zinc-600 uppercase tracking-widest font-bold">100% Seguro & Protegido</span>
          </div>
          <p className="text-xs text-zinc-700">© 2024 SiteCraft Global. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
