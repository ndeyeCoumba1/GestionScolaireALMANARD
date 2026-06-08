import { useEffect, useState, useMemo } from 'react';
import api from '../../api/axios';
import type { Eleve, Classe } from '../../Types/index';
import { useSeanceCoran } from '../../hooks/useSeanceCoran';
import EleveRecitationRow from '../../components/Coran/EleveRecitationRow';
import SeanceStatsBar from '../../components/Coran/SeanceStatsBar';
import { SkeletonTable } from '../../components/Common/SkeletonLoader';
import toast from 'react-hot-toast';
import { useAuth } from '../../Context/AuthContext';

export default function SeanceCoranPage() {
  const { role, nom, prenom, userId } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClasse, setSelectedClasse] = useState<number | ''>('');
  const [selectedEnseignant, setSelectedEnseignant] = useState<number | ''>('');
  const [classes, setClasses] = useState<Classe[]>([]);
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [enseignants, setEnseignants] = useState<any[]>([]);
  const [numeroSeance, setNumeroSeance] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const elevesForSeance = useMemo(
    () => eleves.map((e) => ({ id: e.id, groupeNiveau: e.classeNiveau || 'A' })),
    [eleves]
  );

  const {
    recitations,
    setPresence,
    setNiveauMemorisation,
    setCommentaire,
    setVersetEleve,
    marquerTousPresents,
    sauvegarderSeance,
    stats,
  } = useSeanceCoran(elevesForSeance);

  useEffect(() => {
    fetchClasses();
    fetchEnseignants();
  }, []);

  useEffect(() => {
    if (selectedClasse) {
      fetchEleves(selectedClasse);
    }
  }, [selectedClasse]);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      setClasses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEnseignants = async () => {
    try {
      const res = await api.get('/users');
      const liste = res.data.filter((u: any) => u.role === 'ENSEIGNANT' || u.role === 'RECITATEUR');
      setEnseignants(liste);
      if (role === 'RECITATEUR') autoSelectRecitateur(liste);
    } catch (err: any) {
      if (err?.response?.status === 403 && role === 'RECITATEUR' && userId) {
        const fallback = [{ id: userId, nom: nom || '', prenom: prenom || '', email: '', role: 'RECITATEUR' }];
        setEnseignants(fallback);
        setSelectedEnseignant(userId);
      } else {
        console.error(err);
      }
    }
  };

  const autoSelectRecitateur = (liste: any[]) => {
    // 1. Par userId (si le backend renvoie id dans la réponse login)
    if (userId) {
      const u = liste.find((u: any) => u.id === userId);
      if (u) { setSelectedEnseignant(u.id); return; }
    }
    // 2. Par email (stocké dans localStorage au login — le plus fiable)
    const emailLS = localStorage.getItem('email')?.toLowerCase().trim() ?? '';
    if (emailLS) {
      const u = liste.find((u: any) => u.email?.toLowerCase().trim() === emailLS);
      if (u) { setSelectedEnseignant(u.id); return; }
    }
    // 3. Par nom + prénom
    const nomLS = nom?.toLowerCase().trim() ?? '';
    const prenomLS = prenom?.toLowerCase().trim() ?? '';
    if (nomLS) {
      const u = liste.find((u: any) =>
        u.nom?.toLowerCase().trim() === nomLS &&
        (!prenomLS || u.prenom?.toLowerCase().trim() === prenomLS)
      );
      if (u) setSelectedEnseignant(u.id);
    }
  };

  const fetchEleves = async (classeId: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/eleves/classe/${classeId}`);
      console.log('Élèves récupérés:', res.data);
      setEleves(res.data);
      if (res.data.length === 0) {
        toast('Aucun élève dans cette classe', { icon: '⚠️' });
      } else {
        toast.success(`${res.data.length} élève(s)`);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des élèves:', err);
      toast.error('Erreur lors du chargement des élèves');
      setEleves([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEnregistrerSeance = async () => {
    console.log('=== handleEnregistrerSeance appelé ===');
    console.log('selectedClasse:', selectedClasse);
    console.log('selectedEnseignant:', selectedEnseignant);
    console.log('date:', date);
    console.log('eleves.length:', eleves.length);
    console.log('recitations:', recitations);

    // Validation stricte avant envoi
    if (!selectedClasse || !selectedEnseignant) {
      console.error('Validation échouée: classe ou récitateur manquant');
      toast.error('Veuillez choisir une classe et un récitateur');
      return;
    }

    if (!date) {
      console.error('Validation échouée: date manquante');
      toast.error('Veuillez sélectionner une date');
      return;
    }

    if (eleves.length === 0) {
      console.error('Validation échouée: aucun élève');
      toast.error('Aucun élève dans cette classe');
      return;
    }

    setSaving(true);
    try {
      await sauvegarderSeance(date, Number(selectedClasse), Number(selectedEnseignant), numeroSeance);
      toast.success('Séance enregistrée avec succès !');
      
      // Réinitialiser le formulaire après succès
      setSelectedClasse('');
      setSelectedEnseignant('');
      setEleves([]);
    } catch (err: any) {
      console.error('Erreur HTTP:', err?.response?.status);
      console.error('Détail backend:', err?.response?.data);

      const backendMessage: string = err?.response?.data?.message || err?.response?.data?.error || '';

      if (err?.response?.status === 500 && backendMessage.includes('uk_verset_jour_date_classe_groupe')) {
        toast.error('Un verset du jour existe déjà pour cette classe, cette date et ce groupe. Le backend doit implémenter un vrai upsert.');
      } else if (err?.response?.status === 500) {
        toast.error(`Erreur serveur: ${backendMessage || 'Vérifiez les données'}`);
      } else if (err?.response?.status === 400) {
        toast.error(`Données invalides: ${backendMessage || 'Vérifiez tous les champs'}`);
      } else if (err?.response?.status === 401 || err?.response?.status === 403) {
        toast.error('Non autorisé. Veuillez vous reconnecter.');
      } else {
        toast.error(backendMessage || 'Erreur lors de l\'enregistrement');
      }
    } finally {
      setSaving(false);
    }
  };


  if (role === 'COMPTABLE') {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-muted">Accès non autorisé</div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header */}
      <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0' }}>
        <h1 className="fw-bold mb-1" style={{ fontSize: 24, color: '#111827' }}>Séance de récitation du Coran</h1>
        <p className="text-muted mb-0" style={{ fontSize: 14 }}>Enregistrez les versets du jour et évaluez la mémorisation des élèves</p>
      </div>

      {/* Filtres */}
      <form className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0' }} onSubmit={(e) => e.preventDefault()}>
        <div className="row g-3">
          <div className="col-12 col-md-3">
            <label className="form-label fw-semibold text-uppercase" style={{ fontSize: 11, color: '#6b7280' }}>
              Date de la séance
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="form-control"
              style={{ borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: 14 }}
            />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label fw-semibold text-uppercase" style={{ fontSize: 11, color: '#6b7280' }}>
              N° Séance
            </label>
            <select
              value={numeroSeance}
              onChange={(e) => setNumeroSeance(Number(e.target.value))}
              className="form-select"
              style={{ borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: 14 }}
            >
              <option value={1}>Séance 1 (Matin)</option>
              <option value={2}>Séance 2 (Après-midi)</option>
              <option value={3}>Séance 3</option>
            </select>
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label fw-semibold text-uppercase" style={{ fontSize: 11, color: '#6b7280' }}>
              Classe
            </label>
            <select
              value={selectedClasse}
              onChange={(e) => setSelectedClasse(e.target.value ? Number(e.target.value) : '')}
              className="form-select"
              style={{ borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: 14 }}
            >
              <option value="">Choisir une classe</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.niveau}</option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label fw-semibold text-uppercase" style={{ fontSize: 11, color: '#6b7280' }}>
              {role === 'RECITATEUR' ? 'المسمع (Récitateur)' : 'Récitateur / Enseignant'}
            </label>
            {role === 'RECITATEUR' ? (
              /* RECITATEUR connecté : champ verrouillé sur son nom */
              <div
                className="form-control d-flex align-items-center gap-2"
                style={{ borderRadius: 8, border: '1px solid #d1fae5', backgroundColor: '#f0fdf4', fontSize: 14, color: '#0A6E3F', fontWeight: 600, cursor: 'default' }}
              >
                <span style={{ fontSize: 16 }}>🎧</span>
                <span>
                  {enseignants.find((e: any) => e.id === selectedEnseignant)
                    ? `${enseignants.find((e: any) => e.id === selectedEnseignant).prenom || ''} ${enseignants.find((e: any) => e.id === selectedEnseignant).nom || ''}`.trim()
                    : `${prenom || ''} ${nom || ''}`.trim() || 'Récitateur connecté'}
                </span>
              </div>
            ) : (
              /* ADMIN / ENSEIGNANT : select libre */
              <select
                value={selectedEnseignant}
                onChange={(e) => setSelectedEnseignant(e.target.value ? Number(e.target.value) : '')}
                className="form-select"
                style={{ borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: 14 }}
              >
                <option value="">Choisir un récitateur</option>
                {enseignants.length === 0 ? (
                  <option disabled>Aucun récitateur disponible</option>
                ) : (
                  enseignants.map((e: any) => (
                    <option key={e.id} value={e.id}>
                      {e.prenomArabe || e.prenom} {e.nomArabe || e.nom}
                      {e.role === 'RECITATEUR' ? ' 🎧' : ' 👨‍🏫'}
                    </option>
                  ))
                )}
              </select>
            )}
          </div>
        </div>
      </form>

      {selectedClasse && (
        <>
          {/* Statistiques */}
          <SeanceStatsBar
            presents={stats.presents}
            memorises={stats.memorises}
            partiels={stats.partiels}
            absents={stats.absents}
            totalEleves={stats.totalEleves}
          />

          {/* Tableau des élèves */}
          <div className="bg-white rounded-4 shadow-sm overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
            <div className="p-4 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0" style={{ fontSize: 16, color: '#111827' }}>
                Liste des élèves
              </h5>
              <button
                onClick={marquerTousPresents}
                className="btn btn-sm fw-medium"
                style={{ backgroundColor: '#0A6E3F', color: '#fff', borderRadius: 8, border: 'none' }}
              >
                ✅ Marquer tous présents
              </button>
            </div>
            <div className="table-responsive">
              {loading ? (
                <SkeletonTable rows={5} columns={6} />
              ) : (
                <table className="table align-middle mb-0" style={{ fontSize: 13 }}>
                  <thead style={{ backgroundColor: '#f9fafb' }}>
                    <tr>
                      <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>Présence</th>
                      <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>Élève</th>
                      <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>Sourate / Versets</th>
                      <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>Mémorisation</th>
                      <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>Statut</th>
                      <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>Remarques</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eleves.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-5 text-muted">
                          Sélectionnez une classe pour charger les élèves
                        </td>
                      </tr>
                    ) : (
                      eleves.map((eleve) => (
                        <EleveRecitationRow
                          key={eleve.id}
                          eleve={eleve}
                          recitation={recitations[eleve.id]}
                          onPresenceChange={setPresence}
                          onNiveauChange={setNiveauMemorisation}
                          onCommentaireChange={setCommentaire}
                          onVersetChange={setVersetEleve}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Bouton sauvegarder */}
          <div className="d-flex justify-content-end gap-3">
            <button
              onClick={handleEnregistrerSeance}
              disabled={saving}
              className="btn fw-semibold text-white d-flex align-items-center gap-2 px-4"
              style={{ backgroundColor: '#0A6E3F', borderRadius: 10, fontSize: 14, opacity: saving ? 0.7 : 1, border: 'none' }}
            >
              {saving && (
                <span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14, borderWidth: 2 }} />
              )}
              {saving ? 'Enregistrement...' : '💾 Enregistrer la séance'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}