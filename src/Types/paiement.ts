// Enums
export type StatutPaiement = 'PAYE' | 'EN_ATTENTE' | 'PARTIEL' | 'IMPAYE' | 'ANNULE';
export type MotifPaiement = 'INSCRIPTION' | 'MENSUALITE';
export type TypePaiement = 'ESPECES' | 'CHEQUE' | 'VIREMENT' | 'ORANGE_MONEY' | 'WAVE';

// DTOs
export interface PaiementDTO {
  id: number;
  numeroRecu: string;
  montant: number;
  datePaiement: string;
  motif: MotifPaiement;
  statut: StatutPaiement;
  typePaiement: TypePaiement;
  eleveNom: string;
  elevePrenom: string;
  moisLibelle?: string;
}

export interface SituationPaiementDTO {
  fraisInscriptionTotal: number;
  fraisInscriptionPaye: number;
  fraisInscriptionRestant: number;
  statutGlobal: StatutPaiement;
  historique: PaiementDTO[];
}

// API Parameters
export interface EnregistrerPaiementParams {
  eleveId: number;
  montant: number;
  montantAttendu?: number;
  motif: MotifPaiement;
  typePaiement: TypePaiement;
  moisId?: number;
  inscriptionId?: number;
}
