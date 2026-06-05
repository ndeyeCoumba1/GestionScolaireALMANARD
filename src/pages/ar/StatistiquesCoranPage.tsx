import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { Classe } from '../../Types/index';
import coranService from '../../services/coranService';
import { SkeletonTable } from '../../components/Common/SkeletonLoader';
import toast from 'react-hot-toast';
import { useAuth } from '../../Context/AuthContext';

export default function StatistiquesCoranPage() {
  const { role } = useAuth();
  const [selectedClasse, setSelectedClasse] = useState<number | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [classes, setClasses] = useState<Classe[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState<'nom' | 'presence' | 'memorise'>('nom');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchClasses();
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
  }, []);

  useEffect(() => {
    if (selectedClasse) {
      fetchStats();
    }
  }, [selectedClasse, startDate, endDate]);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      setClasses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    if (!selectedClasse) return;
    setLoading(true);
    try {
      const res = await coranService.getStatistiquesClasse(Number(selectedClasse), startDate, endDate);
      setStats(res);
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchStats();
  };

  const handleSort = (field: 'nom' | 'presence' | 'memorise') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedEleves = stats?.eleveStats ? [...stats.eleveStats].sort((a: any, b: any) => {
    let comparison = 0;
    if (sortField === 'nom') {
      comparison = a.nom.localeCompare(b.nom);
    } else if (sortField === 'presence') {
      comparison = a.tauxPresence - b.tauxPresence;
    } else if (sortField === 'memorise') {
      comparison = a.tauxMemorisation - b.tauxMemorisation;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  }) : [];

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
        <h1 className="fw-bold mb-1" style={{ fontSize: 24, color: '#111827' }}>Statistiques de mémorisation et de présence</h1>
        <p className="text-muted mb-0" style={{ fontSize: 14 }}>Afficher les statistiques de mémorisation et de présence pour la classe</p>
      </div>

      {/* Filtres */}
      <form className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0' }} onSubmit={(e) => e.preventDefault()}>
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
          <div className="col-12 col-md-3">
            <label className="form-label fw-semibold text-uppercase" style={{ fontSize: 11, color: '#6b7280' }}>
              Du
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="form-control"
              style={{ borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: 14 }}
            />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label fw-semibold text-uppercase" style={{ fontSize: 11, color: '#6b7280' }}>
              Au
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="form-control"
              style={{ borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: 14 }}
            />
          </div>
          <div className="col-12 col-md-2 d-flex align-items-end">
            <button
              onClick={handleSearch}
              className="btn w-100 fw-semibold"
              style={{ backgroundColor: '#0A6E3F', borderColor: '#0A6E3F', color: '#fff', borderRadius: 8, fontSize: 14, padding: '0.75rem' }}
            >
              Rechercher
            </button>
          </div>
        </div>
      </form>

      {stats && (
        <>
          {/* Cards résumé */}
          <div className="row g-3">
            <div className="col-12 col-md-6 col-lg-3">
              <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0' }}>
                <div className="text-muted mb-2" style={{ fontSize: 13 }}>Total des élèves</div>
                <div className="fw-bold" style={{ fontSize: 28, color: '#111827' }}>{stats.totalEleves || 0}</div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0' }}>
                <div className="text-muted mb-2" style={{ fontSize: 13 }}>Taux de présence moyen</div>
                <div className="fw-bold" style={{ fontSize: 28, color: '#111827' }}>{stats.tauxPresenceMoyen ? `${stats.tauxPresenceMoyen}%` : '0%'}</div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0' }}>
                <div className="text-muted mb-2" style={{ fontSize: 13 }}>Taux de mémorisation moyen</div>
                <div className="fw-bold" style={{ fontSize: 28, color: '#111827' }}>{stats.tauxMemorisationMoyen ? `${stats.tauxMemorisationMoyen}%` : '0%'}</div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0' }}>
                <div className="text-muted mb-2" style={{ fontSize: 13 }}>Total des séances</div>
                <div className="fw-bold" style={{ fontSize: 28, color: '#111827' }}>{stats.totalSeances || 0}</div>
              </div>
            </div>
          </div>

          {/* Tableau des élèves */}
          <div className="bg-white rounded-4 shadow-sm overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
            <div className="p-4">
              <h5 className="fw-bold mb-0" style={{ fontSize: 16, color: '#111827' }}>
                Statistiques des élèves
              </h5>
            </div>
            <div className="table-responsive">
              {loading ? (
                <SkeletonTable rows={5} columns={5} />
              ) : (
                <table className="table align-middle mb-0" style={{ fontSize: 13 }}>
                  <thead style={{ backgroundColor: '#f9fafb' }}>
                    <tr>
                      <th className="py-3 px-3 fw-bold text-uppercase cursor-pointer" style={{ color: '#374151', fontSize: 12 }} onClick={() => handleSort('nom')}>
                        Nom {sortField === 'nom' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="py-3 px-3 fw-bold text-uppercase cursor-pointer" style={{ color: '#374151', fontSize: 12 }} onClick={() => handleSort('presence')}>
                        Présence {sortField === 'presence' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="py-3 px-3 fw-bold text-uppercase cursor-pointer" style={{ color: '#374151', fontSize: 12 }} onClick={() => handleSort('memorise')}>
                        Mémorisé {sortField === 'memorise' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>
                        Partiel
                      </th>
                      <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>
                        Taux
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedEleves.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-5 text-muted">
                          Aucune donnée
                        </td>
                      </tr>
                    ) : (
                      sortedEleves.map((eleve: any) => (
                        <tr key={eleve.id}>
                          <td className="py-3 px-3">
                            <div className="d-flex flex-column">
                              <span className="fw-semibold">{eleve.nomArabe || eleve.nom}</span>
                              {eleve.nomArabe && (
                                <span className="text-muted" style={{ fontSize: 11 }}>{eleve.nom}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ flex: 1, height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                                <div style={{ width: `${eleve.tauxPresence}%`, height: '100%', backgroundColor: '#0A6E3F', borderRadius: 4 }} />
                              </div>
                              <span style={{ fontSize: 12, minWidth: 40 }}>{eleve.tauxPresence}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-3">{eleve.memorises || 0}</td>
                          <td className="py-3 px-3">{eleve.partiels || 0}</td>
                          <td className="py-3 px-3">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ flex: 1, height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                                <div style={{ width: `${eleve.tauxMemorisation}%`, height: '100%', backgroundColor: '#0A6E3F', borderRadius: 4 }} />
                              </div>
                              <span style={{ fontSize: 12, minWidth: 40 }}>{eleve.tauxMemorisation}%</span>
                            </div>
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
