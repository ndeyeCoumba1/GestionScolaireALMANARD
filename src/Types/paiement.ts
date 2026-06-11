export type StatutPaiement = 'PAYE' | 'EN_ATTENTE' | 'PARTIEL' | 'IMPAYE' | 'ANNULE';
export type TypePaiement = 'ESPECES' | 'CHEQUE' | 'WAVE' | 'ORANGE_MONEY';
export type MotifPaiement = 'INSCRIPTION' | 'MENSUALITE' | 'REMBOURSEMENT';

export interface PaiementDTO {
  id: number;
  numeroRecu: string;
  montant: number;
  montantAttendu?: number;
  datePaiement: string;
  motif: MotifPaiement;
  statut: StatutPaiement;
  typePaiement: TypePaiement;
  eleveNom: string;
  elevePrenom: string;
  matricule?: string;
  classeNom?: string;
  moisLibelle?: string;
  anneeLibelle?: string;
  enregistreParNom?: string;
  modifieParNom?: string;
  dateModification?: string;
}

export interface SituationPaiementDTO {
  fraisInscriptionTotal: number;
  fraisInscriptionPaye: number;
  fraisInscriptionRestant: number;
  statutGlobal: StatutPaiement;
  historique: PaiementDTO[];
}

export interface SituationMensuelleDTO {
  moisId: number;
  moisLibelle: string;
  montantAttendu?: number;
  montantPaye: number;
  resteAPayer?: number;
  statut: StatutPaiement;
  numeroRecu?: string;
  datePaiement?: string;
  typePaiement?: TypePaiement;
}

export interface SituationAnnuelleEleveDTO {
  eleveId: number;
  eleveNom: string;
  elevePrenom: string;
  matricule: string;
  totalAttendu: number;
  totalPaye: number;
  totalRestant: number;
  mois: SituationMensuelleDTO[];
}

export interface EleveImpayeDTO {
  eleveId: number;
  nom: string;
  prenom: string;
  matricule: string;
  classeNom?: string;
  montantAttendu?: number;
}

export interface TauxRecouvrementDTO {
  moisId: number;
  moisLibelle: string;
  totalEleves: number;
  elevesPayes: number;
  elevesImpaye: number;
  montantAttendu: number;
  montantRecu: number;
  tauxRecouvrement: number;
}

export interface EnregistrerPaiementParams {
  eleveId: number;
  montant: number;
  montantAttendu?: number;
  motif: MotifPaiement;
  typePaiement: TypePaiement;
  moisId?: number;
  inscriptionId?: number;
}
