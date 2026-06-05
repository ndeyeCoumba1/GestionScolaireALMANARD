import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { Eleve, Classe } from '../../Types/index';
import { useSeanceCoran } from '../../hooks/useSeanceCoran';
import VersetSelector from '../../components/Coran/VersetSelector';
import EleveRecitationRow from '../../components/Coran/EleveRecitationRow';
import SeanceStatsBar from '../../components/Coran/SeanceStatsBar';
import { SkeletonTable } from '../../components/Common/SkeletonLoader';
import toast from 'react-hot-toast';
import { useAuth } from '../../Context/AuthContext';
import { SOURATES } from '../../services/coranService';

export default function SeanceCoranPage() {
  const { role } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClasse, setSelectedClasse] = useState<number | ''>('');
  const [selectedEnseignant, setSelectedEnseignant] = useState<number | ''>('');
  const [classes, setClasses] = useState<Classe[]>([]);
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [enseignants, setEnseignants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    recitations,
    versetsGroupe,
    setPresence,
    setNiveauMemorisation,
    setCommentaire,
    setVersetGroupe,
    marquerTousPresents,
    stats,
  } = useSeanceCoran(
    eleves.map((e) => ({ id: e.id, groupeNiveau: e.classeNiveau || 'A' }))
  );

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
      setEnseignants(res.data.filter((u: any) => u.role === 'ENSEIGNANT'));
    } catch (err) {
      console.error(err);
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
    console.log('versetsGroupe:', versetsGroupe);
    console.log('recitations:', recitations);

    // Validation stricte avant envoi
    if (!selectedClasse || !selectedEnseignant) {
      console.error('Validation échouée: classe ou enseignant manquant');
      toast.error('Veuillez choisir une classe et un enseignant');
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

    // Récupérer les informations de la classe et de l'enseignant
    const classe = classes.find((c) => c.id === Number(selectedClasse));
    const enseignant = enseignants.find((e) => e.id === Number(selectedEnseignant));

    console.log('classe trouvée:', classe);
    console.log('enseignant trouvé:', enseignant);

    if (!classe || !enseignant) {
      console.error('Validation échouée: classe ou enseignant non trouvé');
      toast.error('Informations de classe ou d\'enseignant invalides');
      return;
    }

    // Récupérer le premier verset pour la sourate
    const firstVerset = Object.values(versetsGroupe)[0];
    console.log('firstVerset:', firstVerset);
    
    if (!firstVerset) {
      console.error('Validation échouée: aucun verset');
      toast.error('Veuillez sélectionner au moins un verset');
      return;
    }

    setSaving(true);

    try {
      // Construire le payload selon la structure SeanceRequest originale (celle que le backend accepte)
      const versetsArray = Object.values(versetsGroupe).map((v) => {
        const sourate = SOURATES.find((s) => s.numero === v.sourate);
        return {
          date: date,
          sourateNumero: v.sourate,
          sourateNom: sourate?.nomFrancais || '',
          sourateNomArabe: sourate?.nomArabe || '',
          versetDebut: v.versetDebut,
          versetFin: v.versetFin,
          groupeNiveau: v.groupeNiveau,
          classeId: Number(selectedClasse),
          enseignantId: Number(selectedEnseignant),
        };
      });
      const recitationsArray = Object.values(recitations)
        .filter((r) => r.eleveId != null && !isNaN(Number(r.eleveId)))
        .map((r) => ({
          eleveId: Number(r.eleveId),
          groupeNiveau: r.groupeNiveau,
          present: r.present,
          niveauMemorisation: r.niveauMemorisation,
          commentaire: r.commentaire || '',
        }));

      console.log('recitationsArray:', recitationsArray);

      if (recitationsArray.length === 0) {
        toast.error('Aucun élève valide trouvé pour l\'enregistrement');
        setSaving(false);
        return;
      }

      const payload = {
        date: date,
        classeId: Number(selectedClasse),
        enseignantId: Number(selectedEnseignant),
        versets: versetsArray,
        recitations: recitationsArray,
      };

      console.log('Payload envoyé:', payload);

      const response = await api.post('/coran/seances', payload);
      console.log('Réponse du serveur:', response);

      if (response.status === 200 || response.status === 201) {
        toast.success('Séance enregistrée avec succès');
        // Réinitialiser le formulaire ou rediriger
        setDate(new Date().toISOString().split('T')[0]);
        setSelectedClasse('');
        setSelectedEnseignant('');
        setEleves([]);
      }
    } catch (err: any) {
      console.error('Erreur lors de l\'enregistrement:', err);
      
      if (err?.response?.status === 500) {
        toast.error('Erreur serveur. Veuillez vérifier les données et réessayer.');
      } else if (err?.response?.status === 400) {
        toast.error('Données invalides. Veuillez vérifier tous les champs.');
      } else if (err?.response?.status === 401 || err?.response?.status === 403) {
        toast.error('Non autorisé. Veuillez vous reconnecter.');
      } else {
        toast.error('Erreur lors de l\'enregistrement de la séance');
      }
    } finally {
      setSaving(false);
    }
  };

  const groupes = [...new Set(eleves.map((e) => e.classeNiveau || 'A'))];

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
          <div className="col-12 col-md-4">
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
          <div className="col-12 col-md-4">
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
          <div className="col-12 col-md-4">
            <label className="form-label fw-semibold text-uppercase" style={{ fontSize: 11, color: '#6b7280' }}>
              Enseignant
            </label>
            <select
              value={selectedEnseignant}
              onChange={(e) => setSelectedEnseignant(e.target.value ? Number(e.target.value) : '')}
              className="form-select"
              style={{ borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: 14 }}
            >
              <option value="">اختر معلماً</option>
              {enseignants.length === 0 ? (
                <option disabled>Aucun enseignant disponible</option>
              ) : (
                enseignants.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.prenomArabe || e.prenom} {e.nomArabe || e.nom}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </form>

      {selectedClasse && (
        <>
          {/* Versets du jour */}
          <div>
            <h5 className="fw-bold mb-3" style={{ fontSize: 16, color: '#111827' }}>
              Versets du jour
            </h5>
            {groupes.map((groupe) => (
              <VersetSelector
                key={groupe}
                groupe={groupe}
                verset={versetsGroupe[groupe] || { sourate: 1, versetDebut: 1, versetFin: 7, groupeNiveau: groupe }}
                onChange={(verset) => setVersetGroupe(groupe, verset)}
              />
            ))}
          </div>

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
                      <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>
                        Présence
                      </th>
                      <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>
                        Nom
                      </th>
                      <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>
                        Groupe
                      </th>
                      <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>
                        Niveau
                      </th>
                      <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>
                        Statut
                      </th>
                      <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>
                        Note
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {eleves.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-5 text-muted">
                          Aucun élève dans cette classe
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
