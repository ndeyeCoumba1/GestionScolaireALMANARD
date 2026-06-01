import api from '../api/axios';
import type { EnregistrerPaiementParams, SituationPaiementDTO } from '../Types/paiement';

export const paiementService = {
  /**
   * Enregistre un paiement
   * @param params Les paramètres du paiement (envoyés comme Query Parameters)
   */
  enregistrerPaiement: async (params: EnregistrerPaiementParams): Promise<void> => {
    const queryParams = new URLSearchParams();
    
    queryParams.append('eleveId', params.eleveId.toString());
    queryParams.append('montant', params.montant.toString());
    queryParams.append('motif', params.motif);
    queryParams.append('typePaiement', params.typePaiement);
    
    if (params.montantAttendu !== undefined) {
      queryParams.append('montantAttendu', params.montantAttendu.toString());
    }
    
    if (params.moisId !== undefined) {
      queryParams.append('moisId', params.moisId.toString());
    }
    
    if (params.inscriptionId !== undefined) {
      queryParams.append('inscriptionId', params.inscriptionId.toString());
    }
    
    await api.post(`/paiements/enregistrer?${queryParams.toString()}`);
  },

  /**
   * Récupère la situation de paiement pour une inscription
   * @param inscriptionId L'ID de l'inscription
   * @returns La situation de paiement
   */
  getSituationByInscription: async (inscriptionId: number): Promise<SituationPaiementDTO> => {
    const response = await api.get(`/paiements/situation/inscription/${inscriptionId}`);
    return response.data;
  },
};
