import React, { useState, useEffect } from 'react';
import { Globe, Search, ArrowUpRight } from 'lucide-react';

interface DomainCheckerProps {
  // Agora passamos o domínio (se houver) e se o cliente escolheu deixar para depois
  onDomainChange: (domain: string, registerLater: boolean) => void;
}

const DomainChecker: React.FC<DomainCheckerProps> = ({ onDomainChange }) => {
  const [officialDomain, setOfficialDomain] = useState('');
  const [registerLater, setRegisterLater] = useState(false);

  // Atualiza o componente pai sempre que o usuário digita ou marca a caixa
  useEffect(() => {
    onDomainChange(officialDomain, registerLater);
  }, [officialDomain, registerLater, onDomainChange]);

  return (
    <div className="space-y-4 bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800/50">
      <div className="flex items-center gap-3">
        <div className="bg-emerald-500/10 p-2 rounded-lg">
          <Globe className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <h3 className="font-bold text-zinc-100 text-sm">Endereço Oficial</h3>
          <p className="text-[11px] text-zinc-400 mt-0.5">Ex: www.suaempresa.com.br</p>
        </div>
      </div>

      <div className="text-xs text-zinc-400 leading-relaxed bg-zinc-950/50 p-3 rounded-xl">
        Para usar um domínio profissional, você precisa registrá-lo no <strong>Registro.br</strong>. Nós forneceremos um link provisório gratuito enquanto você não configura o oficial.
      </div>

      {/* Botão para o Registro.br */}
      <button 
        type="button"
        onClick={() => window.open('https://registro.br/busca-dominio/', '_blank')}
        className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
      >
        <Search className="w-4 h-4" />
        Consultar no Registro.br <ArrowUpRight className="w-3 h-3 text-zinc-500" />
      </button>

      {/* Campo de input condicional */}
      {!registerLater && (
        <div className="pt-2">
          <label className="text-xs text-zinc-400 font-medium mb-1.5 block">
            Já comprou? Digite seu domínio:
          </label>
          <input 
            type="text" 
            placeholder="suaempresa.com.br"
            value={officialDomain}
            onChange={(e) => setOfficialDomain(e.target.value.toLowerCase())}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-zinc-100 placeholder:text-zinc-600"
          />
        </div>
      )}

      {/* Opção de pular */}
      <div className="pt-2 border-t border-zinc-800/50">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={registerLater}
            onChange={(e) => {
              setRegisterLater(e.target.checked);
              if (e.target.checked) setOfficialDomain(''); // Limpa o campo se marcar para depois
            }}
            className="mt-0.5 rounded border-zinc-700 bg-zinc-950 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-900" 
          />
          <div className="flex flex-col">
            <span className="text-xs text-zinc-300 font-medium group-hover:text-emerald-400 transition-colors">
              Vou configurar meu domínio depois
            </span>
          </div>
        </label>
      </div>
    </div>
  );
};

export default DomainChecker;
