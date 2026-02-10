
export type ToneOfVoice = 'Formal' | 'Descontraído';

export interface Palette {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  bg: string;
}

export interface SiteFormData {
  businessName: string;
  targetAudience: string;
  tone: ToneOfVoice;
  whatsapp: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  paletteId: string;
}

export interface DomainStatus {
  domain: string;
  available: boolean | null;
  loading: boolean;
}
