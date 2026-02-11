
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Rocket, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Sparkles,
  Globe,
  CreditCard,
  Loader2,
  CheckCircle
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName) return;

    setLoading(true);
    try {
      // Salva no Firestore conforme solicitado
      await addDoc(collection(db, 'subscriptions'), {
        businessName,
        status: 'paid',
        createdAt: serverTimestamp(),
        source: 'portal_vendas'
      });
      
      setSuccess(true);
      // Pequeno delay para o usuário ver o sucesso antes de ir para o builder
      setTimeout(() => {
        onStart();
      }, 1500);
    } catch (error) {
      console.error("Erro ao salvar assinatura:", error);
      alert("Erro ao processar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#09090b] text-white selection:bg-indigo-500/30 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 px-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-sm mb-8"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Novo: Deploy em 10 segundos via Firebase Blaze</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500"
          >
            Seu negócio online <br /> em um clique.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            A plataforma automatizada que cria seu site profissional e o coloca no ar instantaneamente. Sem complicações.
          </motion.p>

          {/* Checkout / Start Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-md mx-auto"
          >
            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative group">
                  <input 
                    type="text" 
                    required
                    placeholder="Nome da sua futura empresa..."
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full group relative px-8 py-4 bg-indigo-600 rounded-2xl font-bold text-lg hover:bg-indigo-500 transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      Garantir meu site por R$ 499
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl flex flex-col items-center gap-3">
                <CheckCircle className="w-12 h-12 text-emerald-500 animate-bounce" />
                <h3 className="text-xl font-bold text-emerald-400">Pagamento Confirmado!</h3>
                <p className="text-zinc-500 text-sm">Iniciando o construtor do seu site...</p>
              </div>
            )}
            
            <div className="mt-6 flex items-center justify-center gap-4 text-zinc-500 text-xs">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> SSL Grátis</span>
              <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Deploy Imediato</span>
              <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> Pagamento Seguro</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-4 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-amber-400" />}
              title="Cloud Automática"
              description="Nossas Cloud Functions realizam o deploy direto no seu sub-domínio sem você tocar em código."
            />
            <FeatureCard 
              icon={<Globe className="w-6 h-6 text-indigo-400" />}
              title="Escala Google"
              description="Hospedagem de alta performance via Firebase Hosting com latência mínima em todo o mundo."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6 text-emerald-400" />}
              title="Pronto para SEO"
              description="Estrutura semântica e ultra-leve que garante as melhores posições nas buscas do Google."
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl hover:border-zinc-700 transition-colors"
  >
    <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-zinc-500 leading-relaxed text-sm">{description}</p>
  </motion.div>
);

export default LandingPage;
