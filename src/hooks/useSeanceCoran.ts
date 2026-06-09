import { useState, useCallback, useEffect } from 'react';
import type { EleveRecitation, NiveauMemorisation } from '../Types/coran';
import { NiveauMemorisation as NiveauMemorisationConst } from '../Types/coran';
import coranService from '../services/coranService';
import type { SeanceRequest } from '../Types/coran';
import { SOURATES } from '../services/coranService';

interface UseSeanceCoranReturn {
  recitations: Record<number, EleveRecitation>;
  setPresence: (eleveId: number, present: boolean) => void;
  setNiveauMemorisation: (eleveId: number, niveau: NiveauMemorisation) => void;
  setCommentaire: (eleveId: number, commentaire: string) => void;
  setVersetEleve: (eleveId: number, sourateNumero: number, versetDebut: number, versetFin: number) => void;
  marquerTousPresents: () => void;
  sauvegarderSeance: (date: string, classeId: number, enseignantId: number, numeroSeance: number, verifierRevision?: boolean) => Promise<void>;
  stats: {
    presents: number;
    memorises: number;
    partiels: number;
    absents: number;
    totalEleves: number;
  };
}

export function useSeanceCoran(initialEleves: Array<{ id: number; groupeNiveau: string }>): UseSeanceCoranReturn {
  const [recitations, setRecitations] = useState<Record<number, EleveRecitation>>({});

  useEffect(() => {
    const newRecitations: Record<number, EleveRecitation> = {};
    initialEleves.forEach((eleve) => {
      newRecitations[eleve.id] = {
        eleveId: eleve.id,
        groupeNiveau: String(eleve.id), // clé unique par élève
        present: true,
        niveauMemorisation: NiveauMemorisationConst.NON_MEMORISE,
        commentaire: '',
        sourateNumero: 1,
        versetDebut: 0,
        versetFin: 0,
      };
    });
    setRecitations(newRecitations);
  }, [initialEleves]);

  const setPresence = useCallback((eleveId: number, present: boolean) => {
    setRecitations((prev) => ({
      ...prev,
      [eleveId]: {
        ...prev[eleveId],
        present,
        niveauMemorisation: present
          ? prev[eleveId]?.niveauMemorisation || NiveauMemorisationConst.NON_MEMORISE
          : NiveauMemorisationConst.ABSENT,
      },
    }));
  }, []);

  const setNiveauMemorisation = useCallback((eleveId: number, niveau: NiveauMemorisation) => {
    setRecitations((prev) => ({
      ...prev,
      [eleveId]: {
        ...prev[eleveId],
        niveauMemorisation: niveau,
        present: niveau !== NiveauMemorisationConst.ABSENT,
      },
    }));
  }, []);

  const setCommentaire = useCallback((eleveId: number, commentaire: string) => {
    setRecitations((prev) => ({
      ...prev,
      [eleveId]: { ...prev[eleveId], commentaire },
    }));
  }, []);

  const setVersetEleve = useCallback((eleveId: number, sourateNumero: number, versetDebut: number, versetFin: number) => {
    setRecitations((prev) => ({
      ...prev,
      [eleveId]: { ...prev[eleveId], sourateNumero, versetDebut, versetFin },
    }));
  }, []);

  const marquerTousPresents = useCallback(() => {
    setRecitations((prev) => {
      const updated: Record<number, EleveRecitation> = {};
      Object.keys(prev).forEach((eleveId) => {
        const id = parseInt(eleveId, 10);
        updated[id] = {
          ...prev[id],
          present: true,
          niveauMemorisation: NiveauMemorisationConst.NON_MEMORISE,
        };
      });
      return updated;
    });
  }, []);

  const sauvegarderSeance = useCallback(async (date: string, classeId: number, enseignantId: number, numeroSeance: number, verifierRevision = true) => {
    const versetsArray: any[] = [];
    const recitationsArray: any[] = [];

    Object.values(recitations)
      .filter((r) => r && r.eleveId)
      .forEach((r) => {
        const sourateNum = r.sourateNumero ?? 1;
        const sourate = SOURATES.find((s) => s.numero === sourateNum);
        const groupe = String(r.eleveId); // un verset par élève

        versetsArray.push({
          date,
          sourateNumero: sourateNum,
          sourateNom: sourate?.nomFrancais || '',
          sourateNomArabe: sourate?.nomArabe || '',
          versetDebut: r.versetDebut ?? 0,
          versetFin: r.versetFin ?? 0,
          groupeNiveau: groupe,
          classeId,
          enseignantId,
        });

        recitationsArray.push({
          eleveId: r.eleveId,
          groupeNiveau: groupe,
          present: r.present,
          niveauMemorisation: r.niveauMemorisation,
          commentaire: r.commentaire || '',
        });
      });

    const seanceRequest: SeanceRequest = {
      date,
      classeId,
      enseignantId,
      numeroSeance,
      verifierRevision,
      versets: versetsArray,
      recitations: recitationsArray,
    };

    await coranService.createSeance(seanceRequest);
  }, [recitations]);

  const stats = {
    presents: Object.values(recitations).filter((r) => r?.present).length,
    memorises: Object.values(recitations).filter((r) => r?.niveauMemorisation === NiveauMemorisationConst.MEMORISE).length,
    partiels: Object.values(recitations).filter((r) => r?.niveauMemorisation === NiveauMemorisationConst.PARTIEL).length,
    absents: Object.values(recitations).filter((r) => r?.niveauMemorisation === NiveauMemorisationConst.ABSENT).length,
    totalEleves: Object.keys(recitations).length,
  };

  return {
    recitations,
    setPresence,
    setNiveauMemorisation,
    setCommentaire,
    setVersetEleve,
    marquerTousPresents,
    sauvegarderSeance,
    stats,
  };
}
