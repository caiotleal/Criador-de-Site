
import React, { useState } from 'react';
import { Search, Loader2, CheckCircle2, XCircle } from 'lucide-react';

const DomainChecker: React.FC = () => {
  const [domain, setDomain] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'available' | 'unavailable'>('idle');

  const checkDomain = async () => {
    if (!domain) return;
    
    setStatus('loading');
    
    // Simulate RDAP verification delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Logic: If domain contains 'fail' or is too short, simulate unavailable
    const isAvailable = !domain.toLowerCase().includes('google') && 
                       !domain.toLowerCase().includes('site') &&
                       domain.length > 4;
                       
    setStatus(isAvailable ? 'available' : 'unavailable');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') checkDomain();
  };

  return (
    <div className="space-y-4">
      <div className="relative group">
        <input 
          type="text" 
          placeholder="seu-negocio"
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-4 pr-24 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-600"
          value={domain}
          onChange={(e) => {
            setDomain(e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase());
            setStatus('idle');
          }}
          onKeyDown={handleKeyDown}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <span className="text-zinc-500 font-bold text-sm">.com.br</span>
          <button 
            onClick={checkDomain}
            disabled={status === 'loading' || !domain}
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {status === 'available' && (
        <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-xl p-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-emerald-400 font-semibold">Domínio Disponível!</p>
            <p className="text-emerald-500/70 text-xs">Aproveite para garantir o seu nome na web.</p>
          </div>
        </div>
      )}

      {status === 'unavailable' && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-red-400 font-semibold">Indisponível</p>
            <p className="text-red-500/70 text-xs">Este domínio já está em uso ou é restrito.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DomainChecker;
