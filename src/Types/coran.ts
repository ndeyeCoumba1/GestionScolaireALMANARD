// Types pour le module Coran

export const NiveauMemorisation = {
  MEMORISE: 'MEMORISE',
  PARTIEL: 'PARTIEL',
  NON_MEMORISE: 'NON_MEMORISE',
  ABSENT: 'ABSENT',
} as const;

export type NiveauMemorisation = typeof NiveauMemorisation[keyof typeof NiveauMemorisation];

export interface VersetJour {
  id?: number;
  sourate: number;
  versetDebut: number;
  versetFin: number;
  groupeNiveau: string;
  classeId?: number;
  enseignantId?: number;
  date?: string;
}

export interface VersetJourRequest {
  sourate: number;
  versetDebut: number;
  versetFin: number;
  groupeNiveau: string;
  classeId?: number;
  enseignantId?: number;
  date?: string;
}

export interface VersetJourResponse {
  id: number;
  sourate: number;
  versetDebut: number;
  versetFin: number;
  groupeNiveau: string;
  classeId?: number;
  enseignantId?: number;
  date: string;
}

export interface SeanceRecitation {
  id?: number;
  date: string;
  classeId: number;
  enseignantId: number;
  enregistrePar?: string;
}

export interface SeanceRequest {
  date: string;
  classeId: number;
  enseignantId: number;
  versets: VersetJourRequest[];
  recitations: EleveRecitationRequest[];
}

export interface SeanceResponse {
  id: number;
  date: string;
  classeId: number;
  enseignantId: number;
  enregistrePar: string;
  versets: VersetJourResponse[];
  recitations: EleveRecitationResponse[];
}

export interface EleveRecitation {
  id?: number;
  seanceId?: number;
  eleveId: number;
  groupeNiveau: string;
  versetJourId?: number;
  present: boolean;
  niveauMemorisation: NiveauMemorisation;
  commentaire?: string;
}

export interface EleveRecitationRequest {
  eleveId: number;
  groupeNiveau: string;
  present: boolean;
  niveauMemorisation: NiveauMemorisation;
  commentaire?: string;
}

export interface EleveRecitationResponse {
  id: number;
  eleveId: number;
  eleveNom: string;
  elevePrenom: string;
  eleveMatricule?: string;
  groupeNiveau: string;
  versetJourId?: number;
  sourate?: number;
  versetDebut?: number;
  versetFin?: number;
  present: boolean;
  niveauMemorisation: NiveauMemorisation;
  commentaire?: string;
}

export interface StatistiquesEleveResponse {
  eleveId: number;
  eleveNom: string;
  elevePrenom: string;
  eleveMatricule?: string;
  tauxPresence: number;
  tauxMemorisation: number;
  nombreMemorise: number;
  nombrePartiel: number;
  nombreNonMemorise: number;
  nombreAbsent: number;
  totalSeances: number;
}

export interface StatistiquesClasseResponse {
  classeId: number;
  classeNiveau: string;
  tauxPresenceMoyen: number;
  tauxMemorisationMoyen: number;
  nombreTotalEleves: number;
  nombreMemorises: number;
  nombrePartiels: number;
  nombreNonMemorises: number;
  nombreAbsents: number;
  totalSeances: number;
}

export interface Sourate {
  numero: number;
  nomFrancais: string;
  nomArabe: string;
  nombreVersets: number;
}
