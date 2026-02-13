import React from 'react';
import { motion } from 'framer-motion';
import { SiteFormData, ToneOfVoice } from '../types';
import { 
  Building2, 
  Users2, 
  MessageCircle, 
  Instagram, 
  Facebook, 
  Linkedin,
  FileText,   // Novo ícone para descrição
  ImagePlus   // Novo ícone para logo
} from 'lucide-react';

interface BusinessFormProps {
  data: SiteFormData;
  onChange: (name: keyof SiteFormData, value: string) => void;
}

const BusinessForm: React.FC<BusinessFormProps> = ({ data, onChange }) => {
  const inputClass = "w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600";
  const labelClass = "block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 ml-1";

  return (
    <div className="space-y-6">
      {/* Nome da Empresa */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <label className={labelClass}>Nome da Empresa</label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input 
            type="text" 
            placeholder="Ex: Pizzaria do Jão"
            className={`${inputClass} pl-10`}
            value={data.businessName}
            onChange={(e) => onChange('businessName', e.target.value)}
          />
        </div>
      </motion.div>

      {/* NOVO: Sobre a Empresa (Descrição Detalhada) */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <label className={labelClass}>Sobre a Empresa (Conte detalhes para a IA)</label>
        <div className="relative">
          <FileText className="absolute left-3 top-4 w-4 h-4 text-zinc-600" />
          <textarea 
            placeholder="Descreva o que sua empresa faz, seus diferenciais e história..."
            className={`${inputClass} pl-10 resize-none h-24`}
            value={data.description} // Certifique-se de que 'description' existe no seu SiteFormData
            onChange={(e) => onChange('description' as keyof SiteFormData, e.target.value)}
          />
        </div>
      </motion.div>

      {/* NOVO: Logo da Empresa */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <label className={labelClass}>URL do Logo</label>
        <div className="relative">
          <ImagePlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input 
            type="text" 
            placeholder="Link da imagem do seu logo (ex: imgur.com/seu-logo.png)"
            className={`${inputClass} pl-10`}
            value={data.logoUrl} // Certifique-se de que 'logoUrl' existe no seu SiteFormData
            onChange={(e) => onChange('logoUrl' as keyof SiteFormData, e.target.value)}
          />
        </div>
      </motion.div>

      {/* Público-Alvo */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <label className={labelClass}>Público-Alvo</label>
        <div className="relative">
          <Users2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input 
            type="text" 
            placeholder="Ex: Jovens apaixonados por tecnologia"
            className={`${inputClass} pl-10`}
            value={data.targetAudience}
            onChange={(e) => onChange('targetAudience', e.target.value)}
          />
        </div>
      </motion.div>

      {/* Tom de Voz */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <label className={labelClass}>Tom de Voz</label>
        <div className="flex gap-2">
          {(['Descontraído', 'Formal'] as ToneOfVoice[]).map((tone) => (
            <button
              key={tone}
              type="button"
              onClick={() => onChange('tone', tone)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                data.tone === tone 
                  ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' 
                  : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tone}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Contatos & Redes */}
      <div className="pt-4 border-t border-zinc-800">
        <label className={labelClass}>Contatos & Redes</label>
        <div className="grid grid-cols-1 gap-4">
          <div className="relative">
            <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
            <input 
              type="tel" 
              placeholder="WhatsApp (Ex: 11 99999-9999)"
              className={`${inputClass} pl-10`}
              value={data.whatsapp}
              onChange={(e) => onChange('whatsapp', e.target.value)}
            />
          </div>
          <div className="relative">
            <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-500" />
            <input 
              type="text" 
              placeholder="Username Instagram"
              className={`${inputClass} pl-10`}
              value={data.instagram}
              onChange={(e) => onChange('instagram', e.target.value)}
            />
          </div>
          {/* ... Facebook e LinkedIn seguem o mesmo padrão ... */}
        </div>
      </div>
    </div>
  );
};

export default BusinessForm;
