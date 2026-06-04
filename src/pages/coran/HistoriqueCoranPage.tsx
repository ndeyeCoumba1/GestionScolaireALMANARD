import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { Classe } from '../../Types/index';
import type { SeanceResponse } from '../../Types/coran';
import coranService from '../../services/coranService';
import NiveauBadge from '../../components/Coran/NiveauBadge';
import PageHeader from '../../components/Common/PageHeader';
import { SkeletonTable } from '../../components/Common/SkeletonLoader';
import { useAuth } from '../../Context/AuthContext';

export default function HistoriqueCoranPage() {
  const { role } = useAuth();
  const [selectedClasse, setSelectedClasse] = useState<number | ''>('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [classes, setClasses] = useState<Classe[]>([]);
  const [seances, setSeances] = useState<SeanceResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedSeance, setExpandedSeance] = useState<number | null>(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClasse) {
      fetchHistorique();
    }
  }, [selectedClasse, dateDebut, dateFin]);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      setClasses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistorique = async () => {
    if (!selectedClasse) return;
    
    setLoading(true);
    try {
      const data = await coranService.getHistoriqueSeances(
        Number(selectedClasse),
        dateDebut || undefined,
        dateFin || undefined
      );
      setSeances(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (seanceId: number) => {
    setExpandedSeance(expandedSeance === seanceId ? null : seanceId);
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
      <PageHeader
        subtitle="Historique des séances de récitation"
        title="📚 Historique Coran"
        description="Consultez l'historique des séances de Coran et les résultats de mémorisation."
      />

      {/* Filtres */}
      <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0' }}>
        <div className="row g-3">
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
              Date début
            </label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="form-control"
              style={{ borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: 14 }}
            />
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label fw-semibold text-uppercase" style={{ fontSize: 11, color: '#6b7280' }}>
              Date fin
            </label>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="form-control"
              style={{ borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: 14 }}
            />
          </div>
        </div>
      </div>

      {/* Tableau des séances */}
      <div className="bg-white rounded-4 shadow-sm overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
        <div className="p-4">
          <h5 className="fw-bold mb-3" style={{ fontSize: 16, color: '#111827' }}>
            Séances passées
          </h5>
        </div>
        <div className="table-responsive">
          {loading ? (
            <SkeletonTable rows={5} columns={4} />
          ) : (
            <table className="table align-middle mb-0" style={{ fontSize: 14 }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th className="py-3 px-4 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>
                    Date
                  </th>
                  <th className="py-3 px-4 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>
                    Enseignant
                  </th>
                  <th className="py-3 px-4 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>
                    Présents
                  </th>
                  <th className="py-3 px-4 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>
                    Mémorisés
                  </th>
                  <th className="py-3 px-4 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {seances.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5 text-muted">
                      Aucune séance trouvée
                    </td>
                  </tr>
                ) : (
                  seances.map((seance) => {
                    const presents = seance.recitations.filter((r) => r.present).length;
                    const memorises = seance.recitations.filter(
                      (r) => r.niveauMemorisation === 'MEMORISE'
                    ).length;
                    
                    return (
                      <>
                        <tr key={seance.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                          <td className="py-3 px-4 fw-semibold" style={{ color: '#111827' }}>
                            {new Date(seance.date).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="py-3 px-4" style={{ color: '#374151' }}>
                            {seance.enseignantId}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className="badge rounded-pill fw-medium"
                              style={{
                                backgroundColor: '#dcfce7',
                                color: '#166534',
                                fontSize: 12,
                                padding: '5px 10px',
                              }}
                            >
                              {presents} / {seance.recitations.length}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className="badge rounded-pill fw-medium"
                              style={{
                                backgroundColor: '#dbeafe',
                                color: '#1d4ed8',
                                fontSize: 12,
                                padding: '5px 10px',
                              }}
                            >
                              {memorises}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => toggleExpand(seance.id)}
                              className="btn btn-sm fw-medium"
                              style={{
                                backgroundColor: '#0A6E3F',
                                color: '#fff',
                                borderRadius: 8,
                                border: 'none',
                              }}
                            >
                              {expandedSeance === seance.id ? 'Masquer' : 'Voir détails'}
                            </button>
                          </td>
                        </tr>
                        {expandedSeance === seance.id && (
                          <tr>
                            <td colSpan={5} className="p-4" style={{ backgroundColor: '#f9fafb' }}>
                              <h6 className="fw-bold mb-3" style={{ fontSize: 14, color: '#111827' }}>
                                Détails de la séance
                              </h6>
                              <table className="table table-sm mb-0" style={{ fontSize: 13 }}>
                                <thead>
                                  <tr>
                                    <th>Élève</th>
                                    <th>Versets</th>
                                    <th>Niveau</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {seance.recitations.map((rec) => (
                                    <tr key={rec.id}>
                                      <td>
                                        {rec.elevePrenom} {rec.eleveNom}
                                        {rec.eleveMatricule && (
                                          <span
                                            className="badge rounded-pill ms-2"
                                            style={{
                                              backgroundColor: '#f3f4f6',
                                              color: '#6b7280',
                                              fontSize: 10,
                                              fontFamily: 'monospace',
                                              padding: '2px 6px',
                                            }}
                                          >
                                            🆔 {rec.eleveMatricule}
                                          </span>
                                        )}
                                      </td>
                                      <td>
                                        {rec.sourate && (
                                          <span>
                                            Sourate {rec.sourate} (v.{rec.versetDebut}-{rec.versetFin})
                                          </span>
                                        )}
                                      </td>
                                      <td>
                                        <NiveauBadge niveau={rec.niveauMemorisation} />
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
