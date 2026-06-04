import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { Eleve, Classe } from '../../Types/index';
import { useSeanceCoran } from '../../hooks/useSeanceCoran';
import VersetSelector from '../../components/Coran/VersetSelector';
import EleveRecitationRow from '../../components/Coran/EleveRecitationRow';
import SeanceStatsBar from '../../components/Coran/SeanceStatsBar';
import PageHeader from '../../components/Common/PageHeader';
import { SkeletonTable } from '../../components/Common/SkeletonLoader';
import toast from 'react-hot-toast';
import { useAuth } from '../../Context/AuthContext';

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
    sauvegarderSeance,
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
        toast('Aucun élève trouvé pour cette classe', { icon: '⚠️' });
      } else {
        toast.success(`${res.data.length} élève(s) chargé(s)`);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des élèves:', err);
      toast.error('Erreur lors du chargement des élèves');
      setEleves([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedClasse || !selectedEnseignant) {
      toast.error('Veuillez sélectionner une classe et un enseignant');
      return;
    }

    setSaving(true);
    try {
      await sauvegarderSeance(date, Number(selectedClasse), Number(selectedEnseignant));
      toast.success('Séance enregistrée avec succès');
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'enregistrement de la séance");
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
      <PageHeader
        subtitle="Enregistrement des séances de récitation"
        title="📖 Séance de Coran"
        description="Enregistrez les versets du jour et évaluez la mémorisation des élèves."
      />

      {/* Filtres */}
      <form className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0' }} onSubmit={(e) => e.preventDefault()}>
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <label className="form-label fw-semibold text-uppercase" style={{ fontSize: 11, color: '#6b7280' }}>
              Date
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
              <option value="">Choisir un enseignant</option>
              {enseignants.map((e) => (
                <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>
              ))}
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
                ✅ Tous présents
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
                        Élève
                      </th>
                      <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>
                        Groupe
                      </th>
                      <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>
                        Niveau
                      </th>
                      <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>
                        État
                      </th>
                      <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>
                        Commentaire
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
              onClick={handleSave}
              disabled={saving}
              className="btn fw-semibold text-white d-flex align-items-center gap-2 px-4"
              style={{ backgroundColor: '#0A6E3F', borderRadius: 10, fontSize: 14, opacity: saving ? 0.7 : 1, border: 'none' }}
            >
              {saving && (
                <span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14, borderWidth: 2 }} />
              )}
              {saving ? 'Enregistrement...' : '💾 Sauvegarder la séance'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
