import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { Classe, Eleve } from '../../Types/index';
import type { StatistiquesClasseResponse, StatistiquesEleveResponse } from '../../Types/coran';
import coranService from '../../services/coranService';
import PageHeader from '../../components/Common/PageHeader';
import { SkeletonTable } from '../../components/Common/SkeletonLoader';
import { useAuth } from '../../Context/AuthContext';

export default function StatistiquesCoranPage() {
  const { role } = useAuth();
  const [selectedClasse, setSelectedClasse] = useState<number | ''>('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [classes, setClasses] = useState<Classe[]>([]);
  const [statsClasse, setStatsClasse] = useState<StatistiquesClasseResponse | null>(null);
  const [statsEleves, setStatsEleves] = useState<StatistiquesEleveResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'tauxMemorisation' | 'tauxPresence'>('tauxMemorisation');

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClasse) {
      fetchStatistiques();
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

  const fetchStatistiques = async () => {
    if (!selectedClasse) return;
    
    setLoading(true);
    try {
      const [classeStats, elevesStats] = await Promise.all([
        coranService.getStatistiquesClasse(
          Number(selectedClasse),
          dateDebut || undefined,
          dateFin || undefined
        ),
        api.get(`/eleves?classeId=${selectedClasse}`).then(async (res) => {
          const eleves: Eleve[] = res.data;
          const statsPromises = eleves.map((eleve) =>
            coranService.getStatistiquesEleve(eleve.id)
          );
          return Promise.all(statsPromises);
        }),
      ]);
      setStatsClasse(classeStats);
      setStatsEleves(elevesStats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: 'tauxMemorisation' | 'tauxPresence') => {
    setSortBy(field);
    setStatsEleves([...statsEleves].sort((a, b) => b[field] - a[field]));
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
        subtitle="Statistiques de mémorisation du Coran"
        title="📊 Statistiques Coran"
        description="Consultez les statistiques de présence et de mémorisation des élèves."
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

      {selectedClasse && statsClasse && (
        <>
          {/* Cartes résumé */}
          <div className="d-flex gap-3 flex-wrap">
            <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0', flex: '1 1 200px', minWidth: 200 }}>
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 48, height: 48, backgroundColor: '#dbeafe', fontSize: 20 }}
                >
                  👥
                </div>
                <div>
                  <p className="text-muted mb-0" style={{ fontSize: 12, fontWeight: 500 }}>Total Élèves</p>
                  <p className="fw-bold mb-0" style={{ fontSize: 24, color: '#1d4ed8' }}>{statsClasse.nombreTotalEleves}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0', flex: '1 1 200px', minWidth: 200 }}>
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 48, height: 48, backgroundColor: '#dcfce7', fontSize: 20 }}
                >
                  ✅
                </div>
                <div>
                  <p className="text-muted mb-0" style={{ fontSize: 12, fontWeight: 500 }}>Taux Présence</p>
                  <p className="fw-bold mb-0" style={{ fontSize: 24, color: '#166534' }}>{statsClasse.tauxPresenceMoyen.toFixed(1)}%</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0', flex: '1 1 200px', minWidth: 200 }}>
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 48, height: 48, backgroundColor: '#fef3c7', fontSize: 20 }}
                >
                  📚
                </div>
                <div>
                  <p className="text-muted mb-0" style={{ fontSize: 12, fontWeight: 500 }}>Taux Mémorisation</p>
                  <p className="fw-bold mb-0" style={{ fontSize: 24, color: '#d97706' }}>{statsClasse.tauxMemorisationMoyen.toFixed(1)}%</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0', flex: '1 1 200px', minWidth: 200 }}>
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 48, height: 48, backgroundColor: '#fce7f3', fontSize: 20 }}
                >
                  🏆
                </div>
                <div>
                  <p className="text-muted mb-0" style={{ fontSize: 12, fontWeight: 500 }}>Mémorisés</p>
                  <p className="fw-bold mb-0" style={{ fontSize: 24, color: '#db2777' }}>{statsClasse.nombreMemorises}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tableau par élève */}
          <div className="bg-white rounded-4 shadow-sm overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
            <div className="p-4 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0" style={{ fontSize: 16, color: '#111827' }}>
                Statistiques par élève
              </h5>
              <div className="d-flex gap-2">
                <button
                  onClick={() => handleSort('tauxMemorisation')}
                  className="btn btn-sm fw-medium"
                  style={{
                    backgroundColor: sortBy === 'tauxMemorisation' ? '#0A6E3F' : '#f3f4f6',
                    color: sortBy === 'tauxMemorisation' ? '#fff' : '#374151',
                    borderRadius: 8,
                    border: 'none',
                  }}
                >
                  Trier par mémorisation
                </button>
                <button
                  onClick={() => handleSort('tauxPresence')}
                  className="btn btn-sm fw-medium"
                  style={{
                    backgroundColor: sortBy === 'tauxPresence' ? '#0A6E3F' : '#f3f4f6',
                    color: sortBy === 'tauxPresence' ? '#fff' : '#374151',
                    borderRadius: 8,
                    border: 'none',
                  }}
                >
                  Trier par présence
                </button>
              </div>
            </div>
            <div className="table-responsive">
              {loading ? (
                <SkeletonTable rows={5} columns={6} />
              ) : (
                <table className="table align-middle mb-0" style={{ fontSize: 14 }}>
                  <thead style={{ backgroundColor: '#f9fafb' }}>
                    <tr>
                      <th className="py-3 px-4 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>
                        Élève
                      </th>
                      <th className="py-3 px-4 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>
                        Taux Présence
                      </th>
                      <th className="py-3 px-4 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>
                        Taux Mémorisation
                      </th>
                      <th className="py-3 px-4 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>
                        Mémorisés
                      </th>
                      <th className="py-3 px-4 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>
                        Partiels
                      </th>
                      <th className="py-3 px-4 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>
                        Absents
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {statsEleves.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-5 text-muted">
                          Aucune statistique disponible
                        </td>
                      </tr>
                    ) : (
                      statsEleves.map((stat) => (
                        <tr key={stat.eleveId} style={{ borderTop: '1px solid #f3f4f6' }}>
                          <td className="py-3 px-4">
                            <div className="d-flex flex-column">
                              <span className="fw-semibold" style={{ fontSize: 13, color: '#111827' }}>
                                {stat.elevePrenom} {stat.eleveNom}
                              </span>
                              {stat.eleveMatricule && (
                                <span
                                  className="badge rounded-pill fw-medium mt-1"
                                  style={{
                                    backgroundColor: '#f3f4f6',
                                    color: '#6b7280',
                                    fontSize: 10,
                                    fontFamily: 'monospace',
                                    padding: '2px 6px',
                                  }}
                                >
                                  🆔 {stat.eleveMatricule}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="rounded-2"
                                style={{
                                  width: 100,
                                  height: 8,
                                  backgroundColor: '#e5e7eb',
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    height: '100%',
                                    width: `${stat.tauxPresence}%`,
                                    backgroundColor: '#16a34a',
                                    transition: 'width 0.3s ease',
                                  }}
                                />
                              </div>
                              <span className="fw-semibold" style={{ fontSize: 12, color: '#374151' }}>
                                {stat.tauxPresence.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="rounded-2"
                                style={{
                                  width: 100,
                                  height: 8,
                                  backgroundColor: '#e5e7eb',
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    height: '100%',
                                    width: `${stat.tauxMemorisation}%`,
                                    backgroundColor: '#0A6E3F',
                                    transition: 'width 0.3s ease',
                                  }}
                                />
                              </div>
                              <span className="fw-semibold" style={{ fontSize: 12, color: '#374151' }}>
                                {stat.tauxMemorisation.toFixed(1)}%
                              </span>
                            </div>
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
                              {stat.nombreMemorise}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className="badge rounded-pill fw-medium"
                              style={{
                                backgroundColor: '#ffedd5',
                                color: '#9a3412',
                                fontSize: 12,
                                padding: '5px 10px',
                              }}
                            >
                              {stat.nombrePartiel}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className="badge rounded-pill fw-medium"
                              style={{
                                backgroundColor: '#f3f4f6',
                                color: '#6b7280',
                                fontSize: 12,
                                padding: '5px 10px',
                              }}
                            >
                              {stat.nombreAbsent}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
