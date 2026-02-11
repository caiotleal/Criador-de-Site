
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Rocket, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Sparkles,
  Loader2,
  CheckCircle,
  AlertCircle
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
    if (!businessName) return;

    setLoading(true);
    setError(null);
    
    try {
      // Tenta gravar no Firestore
      await addDoc(collection(db, 'subscriptions'), {
        businessName: businessName.trim(),
        status: 'paid',
        createdAt: serverTimestamp(),
        source: 'portal_vendas'
      });
      
      setSuccess(true);
      setTimeout(() => onStart(), 1500);
    } catch (err: any) {
      console.error("Erro Firestore:", err);
      if (err.code === 'permission-denied') {
        setError("Erro: Regras do Firestore bloqueando o acesso. Verifique a aba 'Rules'.");
      } else {
        setError("Falha na conexão. Verifique se o projeto Firebase está ativo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#09090b] text-white min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-600/20">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">SiteCraft</h1>
          <p className="text-zinc-500">Crie seu site profissional instantaneamente</p>
        </motion.div>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              type="text" 
              placeholder="Nome da sua Empresa"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Começar Agora <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>
        ) : (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-2xl">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-emerald-400">Sucesso!</h2>
            <p className="text-zinc-500 text-sm">Seu registro foi salvo no Firebase.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
