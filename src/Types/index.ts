export type Role = 'ADMIN' | 'COMPTABLE' | 'ENSEIGNANT';
export type Sexe = 'M' | 'F';
export type StatutEleve = 'INSCRIT' | 'NON_INSCRIT';
export type StatutPaiement = 'PAYE' | 'EN_ATTENTE' | 'ANNULE';
export type MotifPaiement = 'INSCRIPTION' | 'MENSUALITE' | 'AUTRE';
export type NiveauClasse = 'INTERNAT' | 'DEMI_PENSION' | 'EXTERNAT';
export type TypeDepense = 
  | 'Facture_Eau' | 'Salaire' | 'Fourniture_Scolaire'
  | 'Carburant' | 'Medical' | 'Social' | 'PRET'
  | 'Denrees' | 'Charbon' | 'Cartouche_Imprimante' 
  |'Vidange' | 'Nate de Bintou Kandji' |'Transport' 
  | 'Nate mere de Mouhamed Nazir GUEYE'
  | 'Depense par Maguette BA'| 'Dettes'
  | 'Restitution Frais Scolaires'
  | 'depense Gestion Interne'|'Traveaux Daradji'
  |'Achats Woyofal' |'Recharge Gaz' |'Achats Machine à laver'  | string;

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  actif: boolean;
}

export interface Classe {
  id: number;
  niveau: NiveauClasse;
  capaciteMax: number;
  statut?: string;
}

export interface Parent {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  adresse: string;
  profession: string;
}

export interface Eleve {
  id: number;
  nom: string;
  prenom: string;
  dateNaissance: string;
  sexe: Sexe;
  adresse: string;
  status: StatutEleve;
  classeId: number;
  classeNiveau: string;
  parentId: number;
  parentNom: string;
  parentTelephone: string;
}

export interface Annee {
  id: number;
  libelle: string;
  dateDebut: string;
  dateFin: string;
  actif: boolean;
}

export interface Mois {
  id: number;
  libelle: string;
  montantScolarite: number;
}

export interface Paiement {
  id: number;
  numeroRecu: string;
  montant: number;
  datePaiement: string;
  motif: MotifPaiement;
  statut: StatutPaiement;
  eleveNom: string;
  elevePrenom: string;
  moisLibelle: string;
  anneeLibelle: string;
  enregistreParNom: string;
}

export interface Inscription {
  id: number;
  dateInscription: string;
  fraisInscription: number;
  eleveNom: string;
  elevePrenom: string;
  anneeLibelle: string;
  classeNiveau: string;
}

export interface Depense {
  id: number;
  description: string;
  typeDepense: TypeDepense;
  montant: number;
  dateDepense: string;
  anneeLibelle: string;
  moisLibelle: string;
  enregistreParNom: string;
}

export interface AuthResponse {
  token: string;
  role: Role;
  nom: string;
  prenom: string;
} 