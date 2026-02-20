import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';

interface DomainCheckerProps {
  onDomainSelected: (domain: string | null) => void;
}

const DomainChecker: React.FC<DomainCheckerProps> = ({ onDomainSelected }) => {
  const [domain, setDomain] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'available' | 'unavailable'>('idle');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const checkDomain = async (domainToCheck = domain) => {
    if (!domainToCheck) return;
    
    setStatus('loading');
    setSuggestions([]);
    
    try {
      const functions = getFunctions();
      const checkDomainAvailability = httpsCallable(functions, 'checkDomainAvailability');
      
      const response = await checkDomainAvailability({ desiredDomain: domainToCheck });
      const data = response.data as any;

      if (data.available) {
        setStatus('available');
        setDomain(data.cleanDomain); 
        // A MÁGICA ACONTECE AQUI: Ele envia o domínio validado para o botão de Salvar!
        onDomainSelected(data.cleanDomain); 
      } else {
        setStatus('unavailable');
        setSuggestions(data.suggestions || []);
        onDomainSelected(null);
      }
    } catch (error) {
      console.error("Erro ao validar domínio:", error);
      setStatus('unavailable');
      onDomainSelected(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') checkDomain();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setDomain(suggestion);
    checkDomain(suggestion); 
  };

  return (
    <div className="space-y-4 font-sans">
      <div className="relative group">
        <input 
          type="text" 
          placeholder="ex: meu-novo-site"
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-4 pr-24 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-600 text-zinc-100"
          value={domain}
          onChange={(e) => {
            setDomain(e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase());
            setStatus('idle');
            // Se o usuário voltar a digitar, bloqueamos o botão de salvar até validar de novo
            onDomainSelected(null); 
          }}
          onKeyDown={handleKeyDown}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {/* Note que aqui agora reflete o destino real da publicação */}
          <span className="text-zinc-500 font-bold text-sm select-none">.web.app</span>
          <button 
            type="button"
            onClick={() => checkDomain()}
            disabled={status === 'loading' || !domain}
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {status === 'available' && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-500/10 border border-emerald-500/50 rounded-xl p-3 flex items-center gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-emerald-400 font-semibold">Domínio Disponível!</p>
          </div>
        </motion.div>
      )}

      {status === 'unavailable' && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex flex-col gap-3"
        >
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-red-400 font-semibold">Este endereço já está em uso.</p>
            </div>
          </div>
          
          {suggestions.length > 0 && (
            <div className="mt-1 pt-3 border-t border-red-500/20">
              <p className="text-xs text-zinc-400 mb-2">Alternativas disponíveis:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((sugestao) => (
                  <button
                    key={sugestao}
                    onClick={() => handleSuggestionClick(sugestao)}
                    type="button"
                    className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs rounded-lg hover:bg-zinc-800 transition-all"
                  >
                    {sugestao}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default DomainChecker;
