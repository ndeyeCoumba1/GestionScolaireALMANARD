import { useState, useCallback } from 'react';
import type { EleveRecitation, VersetJour, NiveauMemorisation } from '../Types/coran';
import { NiveauMemorisation as NiveauMemorisationConst } from '../Types/coran';
import coranService from '../services/coranService';
import type { SeanceRequest } from '../Types/coran';

interface UseSeanceCoranReturn {
  recitations: Record<number, EleveRecitation>;
  versetsGroupe: Record<string, VersetJour>;
  setPresence: (eleveId: number, present: boolean) => void;
  setNiveauMemorisation: (eleveId: number, niveau: NiveauMemorisation) => void;
  setCommentaire: (eleveId: number, commentaire: string) => void;
  setVersetGroupe: (groupe: string, verset: VersetJour) => void;
  marquerTousPresents: () => void;
  sauvegarderSeance: (date: string, classeId: number, enseignantId: number) => Promise<void>;
  stats: {
    presents: number;
    memorises: number;
    partiels: number;
    absents: number;
    totalEleves: number;
  };
}

export function useSeanceCoran(initialEleves: Array<{ id: number; groupeNiveau: string }>): UseSeanceCoranReturn {
  // Initialiser les récitations pour chaque élève
  const [recitations, setRecitations] = useState<Record<number, EleveRecitation>>(() => {
    const initial: Record<number, EleveRecitation> = {};
    initialEleves.forEach((eleve) => {
      initial[eleve.id] = {
        eleveId: eleve.id,
        groupeNiveau: eleve.groupeNiveau,
        present: true,
        niveauMemorisation: NiveauMemorisationConst.NON_MEMORISE,
        commentaire: '',
      };
    });
    return initial;
  });

  // Versets par groupe/niveau
  const [versetsGroupe, setVersetsGroupe] = useState<Record<string, VersetJour>>(() => {
    const groupes = [...new Set(initialEleves.map((e) => e.groupeNiveau))];
    const initial: Record<string, VersetJour> = {};
    groupes.forEach((groupe) => {
      initial[groupe] = {
        sourate: 1,
        versetDebut: 1,
        versetFin: 7,
        groupeNiveau: groupe,
      };
    });
    return initial;
  });

  // Modifier la présence d'un élève
  const setPresence = useCallback((eleveId: number, present: boolean) => {
    setRecitations((prev) => ({
      ...prev,
      [eleveId]: {
        ...prev[eleveId],
        present,
        niveauMemorisation: present ? prev[eleveId].niveauMemorisation : NiveauMemorisationConst.ABSENT,
      },
    }));
  }, []);

  // Modifier le niveau de mémorisation d'un élève
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

  // Modifier le commentaire d'un élève
  const setCommentaire = useCallback((eleveId: number, commentaire: string) => {
    setRecitations((prev) => ({
      ...prev,
      [eleveId]: {
        ...prev[eleveId],
        commentaire,
      },
    }));
  }, []);

  // Modifier le verset pour un groupe
  const setVersetGroupe = useCallback((groupe: string, verset: VersetJour) => {
    setVersetsGroupe((prev) => ({
      ...prev,
      [groupe]: verset,
    }));
  }, []);

  // Marquer tous les élèves comme présents
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

  // Sauvegarder la séance
  const sauvegarderSeance = useCallback(async (date: string, classeId: number, enseignantId: number) => {
    const versetsArray = Object.values(versetsGroupe);
    const recitationsArray = Object.values(recitations).map((r) => ({
      eleveId: r.eleveId,
      groupeNiveau: r.groupeNiveau,
      present: r.present,
      niveauMemorisation: r.niveauMemorisation,
      commentaire: r.commentaire,
    }));

    const seanceRequest: SeanceRequest = {
      date,
      classeId,
      enseignantId,
      versets: versetsArray,
      recitations: recitationsArray,
    };

    await coranService.createSeance(seanceRequest);
  }, [recitations, versetsGroupe]);

  // Calculer les statistiques
  const stats = {
    presents: Object.values(recitations).filter((r) => r.present).length,
    memorises: Object.values(recitations).filter((r) => r.niveauMemorisation === NiveauMemorisationConst.MEMORISE).length,
    partiels: Object.values(recitations).filter((r) => r.niveauMemorisation === NiveauMemorisationConst.PARTIEL).length,
    absents: Object.values(recitations).filter((r) => r.niveauMemorisation === NiveauMemorisationConst.ABSENT).length,
    totalEleves: Object.keys(recitations).length,
  };

  return {
    recitations,
    versetsGroupe,
    setPresence,
    setNiveauMemorisation,
    setCommentaire,
    setVersetGroupe,
    marquerTousPresents,
    sauvegarderSeance,
    stats,
  };
}
