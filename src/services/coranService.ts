import api from '../api/axios';
import type {
  VersetJourRequest,
  VersetJourResponse,
  SeanceRequest,
  SeanceResponse,
  EleveRecitationResponse,
  StatistiquesEleveResponse,
  StatistiquesClasseResponse,
  Sourate,
  SeanceRevisionRequest,
  SeanceRevisionResponse,
  RapportCoranResponse,
} from '../Types/coran';

// Liste statique des 114 sourates du Coran
export const SOURATES: Sourate[] = [
  { numero: 1, nomFrancais: 'Al-Fatiha (L\'Ouverture)', nomArabe: 'الفاتحة', nombreVersets: 7 },
  { numero: 2, nomFrancais: 'Al-Baqara (La Vache)', nomArabe: 'البقرة', nombreVersets: 286 },
  { numero: 3, nomFrancais: 'Al-Imran (La Famille d\'Imran)', nomArabe: 'آل عمران', nombreVersets: 200 },
  { numero: 4, nomFrancais: 'An-Nisa (Les Femmes)', nomArabe: 'النساء', nombreVersets: 176 },
  { numero: 5, nomFrancais: 'Al-Maida (La Table Servie)', nomArabe: 'المائدة', nombreVersets: 120 },
  { numero: 6, nomFrancais: 'Al-Anam (Les Bestiaux)', nomArabe: 'الأنعام', nombreVersets: 165 },
  { numero: 7, nomFrancais: 'Al-Araf (Les Murailles)', nomArabe: 'الأعراف', nombreVersets: 206 },
  { numero: 8, nomFrancais: 'Al-Anfal (Le Butin)', nomArabe: 'الأنفال', nombreVersets: 75 },
  { numero: 9, nomFrancais: 'At-Tawba (Le Repentir)', nomArabe: 'التوبة', nombreVersets: 129 },
  { numero: 10, nomFrancais: 'Yunus (Jonas)', nomArabe: 'يونس', nombreVersets: 109 },
  { numero: 11, nomFrancais: 'Hud (Hud)', nomArabe: 'هود', nombreVersets: 123 },
  { numero: 12, nomFrancais: 'Yusuf (Joseph)', nomArabe: 'يوسف', nombreVersets: 111 },
  { numero: 13, nomFrancais: 'Ar-Rad (Le Tonnerre)', nomArabe: 'الرعد', nombreVersets: 43 },
  { numero: 14, nomFrancais: 'Ibrahim (Abraham)', nomArabe: 'إبراهيم', nombreVersets: 52 },
  { numero: 15, nomFrancais: 'Al-Hijr (Le Roc)', nomArabe: 'الحجر', nombreVersets: 99 },
  { numero: 16, nomFrancais: 'An-Nahl (Les Abeilles)', nomArabe: 'النحل', nombreVersets: 128 },
  { numero: 17, nomFrancais: 'Al-Isra (Le Voyage Nocturne)', nomArabe: 'الإسراء', nombreVersets: 111 },
  { numero: 18, nomFrancais: 'Al-Kahf (La Caverne)', nomArabe: 'الكهف', nombreVersets: 110 },
  { numero: 19, nomFrancais: 'Maryam (Marie)', nomArabe: 'مريم', nombreVersets: 98 },
  { numero: 20, nomFrancais: 'Ta-Ha (Ta-Ha)', nomArabe: 'طه', nombreVersets: 135 },
  { numero: 21, nomFrancais: 'Al-Anbiya (Les Prophètes)', nomArabe: 'الأنبياء', nombreVersets: 112 },
  { numero: 22, nomFrancais: 'Al-Hajj (Le Pèlerinage)', nomArabe: 'الحج', nombreVersets: 78 },
  { numero: 23, nomFrancais: 'Al-Muminun (Les Croyants)', nomArabe: 'المؤمنون', nombreVersets: 118 },
  { numero: 24, nomFrancais: 'An-Nur (La Lumière)', nomArabe: 'النور', nombreVersets: 64 },
  { numero: 25, nomFrancais: 'Al-Furqan (Le Critère)', nomArabe: 'الفرقان', nombreVersets: 77 },
  { numero: 26, nomFrancais: 'Ash-Shuara (Les Poètes)', nomArabe: 'الشعراء', nombreVersets: 227 },
  { numero: 27, nomFrancais: 'An-Naml (Les Fourmis)', nomArabe: 'النمل', nombreVersets: 93 },
  { numero: 28, nomFrancais: 'Al-Qasas (Les Récits)', nomArabe: 'القصص', nombreVersets: 88 },
  { numero: 29, nomFrancais: 'Al-Ankabut (L\'Araignée)', nomArabe: 'العنكبوت', nombreVersets: 69 },
  { numero: 30, nomFrancais: 'Ar-Rum (Les Romains)', nomArabe: 'الروم', nombreVersets: 60 },
  { numero: 31, nomFrancais: 'Luqman (Luqman)', nomArabe: 'لقمان', nombreVersets: 34 },
  { numero: 32, nomFrancais: 'As-Sajda (La Prosternation)', nomArabe: 'السجدة', nombreVersets: 30 },
  { numero: 33, nomFrancais: 'Al-Ahzab (Les Coalisés)', nomArabe: 'الأحزاب', nombreVersets: 73 },
  { numero: 34, nomFrancais: 'Saba (Saba)', nomArabe: 'سبأ', nombreVersets: 54 },
  { numero: 35, nomFrancais: 'Fatir (Le Créateur)', nomArabe: 'فاطر', nombreVersets: 45 },
  { numero: 36, nomFrancais: 'Ya-Sin (Ya-Sin)', nomArabe: 'يس', nombreVersets: 83 },
  { numero: 37, nomFrancais: 'As-Saffat (Les Rangés)', nomArabe: 'الصافات', nombreVersets: 182 },
  { numero: 38, nomFrancais: 'Sad (Sad)', nomArabe: 'ص', nombreVersets: 88 },
  { numero: 39, nomFrancais: 'Az-Zumar (Les Groupes)', nomArabe: 'الزمر', nombreVersets: 75 },
  { numero: 40, nomFrancais: 'Ghafir (Le Pardonneur)', nomArabe: 'غافر', nombreVersets: 85 },
  { numero: 41, nomFrancais: 'Fussilat (Les Versets Détaillés)', nomArabe: 'فصلت', nombreVersets: 54 },
  { numero: 42, nomFrancais: 'Ash-Shura (La Consultation)', nomArabe: 'الشورى', nombreVersets: 53 },
  { numero: 43, nomFrancais: 'Az-Zukhruf (L\'Or)', nomArabe: 'الزخرف', nombreVersets: 89 },
  { numero: 44, nomFrancais: 'Ad-Dukhan (La Fumée)', nomArabe: 'الدخان', nombreVersets: 59 },
  { numero: 45, nomFrancais: 'Al-Jathiya (L\'Agenouillée)', nomArabe: 'الجاثية', nombreVersets: 37 },
  { numero: 46, nomFrancais: 'Al-Ahqaf (Les Dunes)', nomArabe: 'الأحقاف', nombreVersets: 35 },
  { numero: 47, nomFrancais: 'Muhammad (Muhammad)', nomArabe: 'محمد', nombreVersets: 38 },
  { numero: 48, nomFrancais: 'Al-Fath (La Victoire)', nomArabe: 'الفتح', nombreVersets: 29 },
  { numero: 49, nomFrancais: 'Al-Hujurat (Les Appartements)', nomArabe: 'الحجرات', nombreVersets: 18 },
  { numero: 50, nomFrancais: 'Qaf (Qaf)', nomArabe: 'ق', nombreVersets: 45 },
  { numero: 51, nomFrancais: 'Adh-Dhariyat (Qui Éparpillent)', nomArabe: 'الذاريات', nombreVersets: 60 },
  { numero: 52, nomFrancais: 'At-Tur (Le Mont)', nomArabe: 'الطور', nombreVersets: 49 },
  { numero: 53, nomFrancais: 'An-Najm (L\'Étoile)', nomArabe: 'النجم', nombreVersets: 62 },
  { numero: 54, nomFrancais: 'Al-Qamar (La Lune)', nomArabe: 'القمر', nombreVersets: 55 },
  { numero: 55, nomFrancais: 'Ar-Rahman (Le Tout Miséricordieux)', nomArabe: 'الرحمن', nombreVersets: 78 },
  { numero: 56, nomFrancais: 'Al-Waqia (L\'Événement)', nomArabe: 'الواقعة', nombreVersets: 96 },
  { numero: 57, nomFrancais: 'Al-Hadid (Le Fer)', nomArabe: 'الحديد', nombreVersets: 29 },
  { numero: 58, nomFrancais: 'Al-Mujadila (La Discussion)', nomArabe: 'المجادلة', nombreVersets: 22 },
  { numero: 59, nomFrancais: 'Al-Hashr (L\'Exode)', nomArabe: 'الحشر', nombreVersets: 24 },
  { numero: 60, nomFrancais: 'Al-Mumtahina (L\'Éprouvée)', nomArabe: 'الممتحنة', nombreVersets: 13 },
  { numero: 61, nomFrancais: 'As-Saff (Le Rang)', nomArabe: 'الصف', nombreVersets: 14 },
  { numero: 62, nomFrancais: 'Al-Jumua (Le Vendredi)', nomArabe: 'الجمعة', nombreVersets: 11 },
  { numero: 63, nomFrancais: 'Al-Munafiqun (Les Hypocrites)', nomArabe: 'المنافقون', nombreVersets: 11 },
  { numero: 64, nomFrancais: 'At-Taghabun (La Grande Perte)', nomArabe: 'التغابن', nombreVersets: 18 },
  { numero: 65, nomFrancais: 'At-Talaq (Le Divorce)', nomArabe: 'الطلاق', nombreVersets: 12 },
  { numero: 66, nomFrancais: 'At-Tahrim (L\'Interdiction)', nomArabe: 'التحريم', nombreVersets: 12 },
  { numero: 67, nomFrancais: 'Al-Mulk (La Souveraineté)', nomArabe: 'الملك', nombreVersets: 30 },
  { numero: 68, nomFrancais: 'Al-Qalam (La Plume)', nomArabe: 'القلم', nombreVersets: 52 },
  { numero: 69, nomFrancais: 'Al-Haqqa (La Réalité)', nomArabe: 'الحاقة', nombreVersets: 52 },
  { numero: 70, nomFrancais: 'Al-Maarij (Les Voies d\'Ascension)', nomArabe: 'المعارج', nombreVersets: 44 },
  { numero: 71, nomFrancais: 'Nuh (Noé)', nomArabe: 'نوح', nombreVersets: 28 },
  { numero: 72, nomFrancais: 'Al-Jinn (Les Djinns)', nomArabe: 'الجن', nombreVersets: 28 },
  { numero: 73, nomFrancais: 'Al-Muzzammil (L\'Enveloppé)', nomArabe: 'المزمل', nombreVersets: 20 },
  { numero: 74, nomFrancais: 'Al-Muddathir (Le Couvert d\'un Manteau)', nomArabe: 'المدثر', nombreVersets: 56 },
  { numero: 75, nomFrancais: 'Al-Qiyama (La Résurrection)', nomArabe: 'القيامة', nombreVersets: 40 },
  { numero: 76, nomFrancais: 'Al-Insan (L\'Homme)', nomArabe: 'الإنسان', nombreVersets: 31 },
  { numero: 77, nomFrancais: 'Al-Mursalat (Les Envoyés)', nomArabe: 'المرسلات', nombreVersets: 50 },
  { numero: 78, nomFrancais: 'An-Naba (La Nouvelle)', nomArabe: 'النبأ', nombreVersets: 40 },
  { numero: 79, nomFrancais: 'An-Naziats (Ce Qui Arrache)', nomArabe: 'النازعات', nombreVersets: 46 },
  { numero: 80, nomFrancais: 'Abasa (Il Fronça les Sourcils)', nomArabe: 'عبس', nombreVersets: 42 },
  { numero: 81, nomFrancais: 'At-Takwir (L\'Enroulement)', nomArabe: 'التكوير', nombreVersets: 29 },
  { numero: 82, nomFrancais: 'Al-Infitar (La Fissure)', nomArabe: 'الانفطار', nombreVersets: 19 },
  { numero: 83, nomFrancais: 'Al-Mutaffifin (Les Fraudeurs)', nomArabe: 'المطففين', nombreVersets: 36 },
  { numero: 84, nomFrancais: 'Al-Inshiqaq (La Déchirure)', nomArabe: 'الانشقاق', nombreVersets: 25 },
  { numero: 85, nomFrancais: 'Al-Buruj (Les Constellations)', nomArabe: 'البروج', nombreVersets: 22 },
  { numero: 86, nomFrancais: 'At-Tariq (L\'Astre Nocturne)', nomArabe: 'الطارق', nombreVersets: 17 },
  { numero: 87, nomFrancais: 'Al-Ala (Le Très-Haut)', nomArabe: 'الأعلى', nombreVersets: 19 },
  { numero: 88, nomFrancais: 'Al-Ghashiya (L\'Événement Accablant)', nomArabe: 'الغاشية', nombreVersets: 26 },
  { numero: 89, nomFrancais: 'Al-Fajr (L\'Aube)', nomArabe: 'الفجر', nombreVersets: 30 },
  { numero: 90, nomFrancais: 'Al-Balad (La Cité)', nomArabe: 'البلد', nombreVersets: 20 },
  { numero: 91, nomFrancais: 'Ash-Shams (Le Soleil)', nomArabe: 'الشمس', nombreVersets: 15 },
  { numero: 92, nomFrancais: 'Al-Layl (La Nuit)', nomArabe: 'الليل', nombreVersets: 21 },
  { numero: 93, nomFrancais: 'Ad-Duha (Le Matin)', nomArabe: 'الضحى', nombreVersets: 11 },
  { numero: 94, nomFrancais: 'Ash-Sharh (L\'Ouverture)', nomArabe: 'الشرح', nombreVersets: 8 },
  { numero: 95, nomFrancais: 'At-Tin (Le Figuier)', nomArabe: 'التين', nombreVersets: 8 },
  { numero: 96, nomFrancais: 'Al-Alaq (L\'Adhérence)', nomArabe: 'العلق', nombreVersets: 19 },
  { numero: 97, nomFrancais: 'Al-Qadr (La Destinée)', nomArabe: 'القدر', nombreVersets: 5 },
  { numero: 98, nomFrancais: 'Al-Bayyina (La Preuve)', nomArabe: 'البينة', nombreVersets: 8 },
  { numero: 99, nomFrancais: 'Az-Zalzala (La Secousse)', nomArabe: 'الزلزلة', nombreVersets: 8 },
  { numero: 100, nomFrancais: 'Al-Adiyat (Les Coursiers)', nomArabe: 'العاديات', nombreVersets: 11 },
  { numero: 101, nomFrancais: 'Al-Qaria (Le Fracas)', nomArabe: 'القارعة', nombreVersets: 11 },
  { numero: 102, nomFrancais: 'At-Takathur (L\'Accumulation)', nomArabe: 'التكاثر', nombreVersets: 8 },
  { numero: 103, nomFrancais: 'Al-Asr (Le Temps)', nomArabe: 'العصر', nombreVersets: 3 },
  { numero: 104, nomFrancais: 'Al-Humaza (Le Calomniateur)', nomArabe: 'الهمزة', nombreVersets: 9 },
  { numero: 105, nomFrancais: 'Al-Fil (L\'Éléphant)', nomArabe: 'الفيل', nombreVersets: 5 },
  { numero: 106, nomFrancais: 'Quraish (Quraish)', nomArabe: 'قريش', nombreVersets: 4 },
  { numero: 107, nomFrancais: 'Al-Maun (L\'Usure)', nomArabe: 'الماعون', nombreVersets: 7 },
  { numero: 108, nomFrancais: 'Al-Kawthar (L\'Abondance)', nomArabe: 'الكوثر', nombreVersets: 3 },
  { numero: 109, nomFrancais: 'Al-Kafirun (Les Infidèles)', nomArabe: 'الكافرون', nombreVersets: 6 },
  { numero: 110, nomFrancais: 'An-Nasr (Le Secours)', nomArabe: 'النصر', nombreVersets: 3 },
  { numero: 111, nomFrancais: 'Al-Masad (Le Fibre)', nomArabe: 'المسد', nombreVersets: 5 },
  { numero: 112, nomFrancais: 'Al-Ikhlas (La Sincérité)', nomArabe: 'الإخلاص', nombreVersets: 4 },
  { numero: 113, nomFrancais: 'Al-Falaq (L\'Aube Naissante)', nomArabe: 'الفلق', nombreVersets: 5 },
  { numero: 114, nomFrancais: 'An-Nas (Les Hommes)', nomArabe: 'الناس', nombreVersets: 6 },
];

// API Calls pour le module Coran

const CORAN_BASE_URL = '/coran';

export const coranService = {
  // Versets du jour
  getVersetsJour: async (date?: string, classeId?: number): Promise<VersetJourResponse[]> => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (classeId) params.append('classeId', classeId.toString());
    const response = await api.get(`${CORAN_BASE_URL}/versets-jour?${params.toString()}`);
    return response.data;
  },

  getHistoriqueVersets: async (classeId: number): Promise<VersetJourResponse[]> => {
    const response = await api.get(`${CORAN_BASE_URL}/versets-jour/historique?classeId=${classeId}`);
    return response.data;
  },

  createVersetJour: async (data: VersetJourRequest): Promise<VersetJourResponse> => {
    const response = await api.post(`${CORAN_BASE_URL}/versets-jour`, data);
    return response.data;
  },

  // Séances
  createSeance: async (data: SeanceRequest): Promise<SeanceResponse> => {
    const response = await api.post(`${CORAN_BASE_URL}/seances`, data);
    return response.data;
  },

  getSeanceByDate: async (date: string, classeId?: number): Promise<SeanceResponse[]> => {
    const params = new URLSearchParams();
    params.append('date', date);
    if (classeId) params.append('classeId', classeId.toString());
    const response = await api.get(`${CORAN_BASE_URL}/seances/date?${params.toString()}`);
    return response.data;
  },

  getHistoriqueSeances: async (classeId: number, dateDebut?: string, dateFin?: string): Promise<SeanceResponse[]> => {
    const params = new URLSearchParams();
    params.append('classeId', classeId.toString());
    if (dateDebut) params.append('dateDebut', dateDebut);
    if (dateFin) params.append('dateFin', dateFin);
    const response = await api.get(`${CORAN_BASE_URL}/seances/historique?${params.toString()}`);
    return response.data;
  },

  // Récitations élève
  getRecitationsEleve: async (eleveId: number, dateDebut?: string, dateFin?: string): Promise<EleveRecitationResponse[]> => {
    const params = new URLSearchParams();
    if (dateDebut) params.append('dateDebut', dateDebut);
    if (dateFin) params.append('dateFin', dateFin);
    const response = await api.get(`${CORAN_BASE_URL}/recitations/eleve/${eleveId}?${params.toString()}`);
    return response.data;
  },

  // Statistiques
  getStatistiquesClasse: async (classeId: number, dateDebut?: string, dateFin?: string): Promise<StatistiquesClasseResponse> => {
    const params = new URLSearchParams();
    if (dateDebut) params.append('dateDebut', dateDebut);
    if (dateFin) params.append('dateFin', dateFin);
    const response = await api.get(`${CORAN_BASE_URL}/stats/classe/${classeId}?${params.toString()}`);
    return response.data;
  },

  getStatistiquesEleve: async (eleveId: number): Promise<StatistiquesEleveResponse> => {
    const response = await api.get(`${CORAN_BASE_URL}/stats/eleve/${eleveId}`);
    return response.data;
  },

  // Révisions
  enregistrerRevision: async (data: SeanceRevisionRequest): Promise<SeanceRevisionResponse> => {
    const response = await api.post(`${CORAN_BASE_URL}/revisions`, data);
    return response.data;
  },

  getRevisionsByEleve: async (eleveId: number, dateDebut?: string, dateFin?: string): Promise<SeanceRevisionResponse[]> => {
    const params = new URLSearchParams();
    if (dateDebut) params.append('dateDebut', dateDebut);
    if (dateFin) params.append('dateFin', dateFin);
    const response = await api.get(`${CORAN_BASE_URL}/revisions/eleve/${eleveId}?${params.toString()}`);
    return response.data;
  },

  getRevisionsByClasse: async (classeId: number, dateDebut?: string, dateFin?: string): Promise<SeanceRevisionResponse[]> => {
    const params = new URLSearchParams();
    if (dateDebut) params.append('dateDebut', dateDebut);
    if (dateFin) params.append('dateFin', dateFin);
    const response = await api.get(`${CORAN_BASE_URL}/revisions/classe/${classeId}?${params.toString()}`);
    return response.data;
  },

  supprimerRevision: async (id: number): Promise<void> => {
    await api.delete(`${CORAN_BASE_URL}/revisions/${id}`);
  },

  getRapport: async (classeId: number, dateDebut: string, dateFin: string): Promise<RapportCoranResponse> => {
    const params = new URLSearchParams();
    params.append('classeId', classeId.toString());
    params.append('dateDebut', dateDebut);
    params.append('dateFin', dateFin);
    const response = await api.get(`${CORAN_BASE_URL}/rapport?${params.toString()}`);
    return response.data;
  },
};

export default coranService;
