// src/types.ts

export type ToneOfVoice = 'Formal' | 'Descontraído';

// Adicionamos o campo 'segment' para a lógica de pré-seleção
export interface SiteFormData {
  businessName: string;
  segment: string;     // NOVO: Segmento (Advocacia, Saúde, etc.)
  description: string; // NOVO: "Sobre a Empresa"
  logoUrl: string;     // NOVO: Link do Logo
  targetAudience: string;
  tone: ToneOfVoice;
  whatsapp: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  paletteId: string;
  layoutId: string;    // NOVO: Qual estrutura de site usar
  googlePlaceUrl?: string;
  showReviews?: boolean;
  address?: string;
  phone?: string;
  reviews?: Array<{
    author_name: string;
    profile_photo_url: string;
    rating: number;
    relative_time_description: string;
    text: string;
  }>;
}

export interface Palette {
  id: string;
  name: string; // Agora usaremos nomes em PT-BR (ex: "Azul Oceano")
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  bg: string;
}

export interface LayoutOption {
  id: string;
  name: string; // Ex: "Autoridade Máxima"
  description: string;
}
