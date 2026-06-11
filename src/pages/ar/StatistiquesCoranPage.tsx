import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { Classe } from '../../Types/index';
import type { RapportCoranResponse } from '../../Types/coran';
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
  const [rapport, setRapport] = useState<RapportCoranResponse | null>(null);
  const [revisions, setRevisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRevisions, setLoadingRevisions] = useState(false);
  const [activeTab, setActiveTab] = useState<'seances' | 'revisions'>('seances');
  const [sortField, setSortField] = useState<'nom' | 'presence' | 'memorise'>('nom');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchClasses();
    const today = new Date().toISOString().split('T')[0];
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    setStartDate(monthAgo.toISOString().split('T')[0]);
    setEndDate(today);
  }, []);

  useEffect(() => {
    if (selectedClasse) {
      fetchStats();
      fetchRevisions();
    }
  }, [selectedClasse, startDate, endDate]);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      setClasses(res.data);
      if (res.data.length > 0) {
        setSelectedClasse(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    if (!selectedClasse) return;
    setLoading(true);
    try {
      const [statsRes, rapportRes] = await Promise.all([
        coranService.getStatistiquesClasse(Number(selectedClasse), startDate, endDate),
        coranService.getRapport(Number(selectedClasse), startDate, endDate),
      ]);
      setStats(statsRes);
      setRapport(rapportRes);
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const fetchRevisions = async () => {
    if (!selectedClasse) return;
    setLoadingRevisions(true);
    try {
      const res = await coranService.getRevisionsByClasse(Number(selectedClasse), startDate, endDate);
      setRevisions(res);
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du chargement des révisions');
    } finally {
      setLoadingRevisions(false);
    }
  };

  const handleSearch = () => {
    fetchStats();
    fetchRevisions();
  };

  const handleSort = (field: 'nom' | 'presence' | 'memorise') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const revisionParEleve: Record<number, any> = {};
  for (const rev of revisions) {
    const key = rev.eleveId;
    if (!revisionParEleve[key]) {
      revisionParEleve[key] = {
        id: rev.eleveId,
        nom: rev.eleveNom,
        prenom: rev.elevePrenom,
        matricule: rev.eleveMatricule,
        count: 0,
        sourates: new Set<number>(),
        lastDate: rev.date,
      };
    }
    revisionParEleve[key].count++;
    if (rev.sourateNumero) revisionParEleve[key].sourates.add(rev.sourateNumero);
    if (rev.date > revisionParEleve[key].lastDate) revisionParEleve[key].lastDate = rev.date;
  }
  const revisionStats = Object.values(revisionParEleve).map((e: any) => ({
    ...e,
    souratesCount: e.sourates.size,
  })).sort((a: any, b: any) => b.count - a.count);

  const sortedEleves = rapport?.eleves ? [...rapport.eleves].sort((a: any, b: any) => {
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
      <div className="rounded-4 p-5 position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: 180, width: 160, height: 160, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', top: 20, right: 120, width: 80, height: 80, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }} />
        <div className="position-relative d-flex align-items-center gap-4">
          <div style={{ width: 64, height: 64, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0 }}>
            📊
          </div>
          <div>
            <h1 className="fw-bold mb-1" style={{ fontSize: 26, color: '#ffffff' }}>Statistiques de mémorisation</h1>
            <p className="mb-1" style={{ fontSize: 17, color: 'rgba(255,255,255,0.9)', fontFamily: 'serif' }}>إحصائيات الحفظ والحضور</p>
            <p className="mb-0" style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Visualisez les taux de présence et de mémorisation par classe et par période</p>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <form className="rounded-4 p-4" style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 16px rgba(109,40,217,0.08)', border: '1px solid #ede9fe' }} onSubmit={(e) => e.preventDefault()}>
        <div className="d-flex align-items-center gap-2 mb-4">
          <div style={{ width: 4, height: 20, backgroundColor: '#7c3aed', borderRadius: 2 }} />
          <span className="fw-semibold" style={{ fontSize: 13, color: '#374151' }}>Filtres — معايير البحث</span>
        </div>
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <label className="form-label fw-semibold d-flex align-items-center gap-1" style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase' }}>
              🏫 Classe — الفصل
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
            <label className="form-label fw-semibold d-flex align-items-center gap-1" style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase' }}>
              📅 Du
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
            <label className="form-label fw-semibold d-flex align-items-center gap-1" style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase' }}>
              📅 Au
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
              style={{ backgroundColor: '#7c3aed', borderColor: '#7c3aed', color: '#fff', borderRadius: 8, fontSize: 14, padding: '0.75rem' }}
            >
              🔍 Rechercher
            </button>
          </div>
        </div>
      </form>

      {(stats || revisions.length > 0) && (
        <>
          {/* Onglets */}
          <div className="rounded-4" style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 16px rgba(109,40,217,0.08)', border: '1px solid #ede9fe' }}>
            <div className="d-flex border-bottom px-4">
              {([
                { key: 'seances' as const, label: '📖 Séances de récitation', count: stats?.totalSeances ?? 0 },
                { key: 'revisions' as const, label: '🔁 Révisions', count: revisions.length },
              ]).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="btn border-0 px-4 py-3 fw-semibold d-flex align-items-center gap-2"
                  style={{
                    fontSize: 14,
                    borderRadius: 0,
                    borderBottom: activeTab === tab.key ? '2px solid #7c3aed' : '2px solid transparent',
                    color: activeTab === tab.key ? '#6d28d9' : '#6b7280',
                    backgroundColor: 'transparent',
                  }}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span
                      className="badge rounded-pill"
                      style={{
                        backgroundColor: activeTab === tab.key ? '#ede9fe' : '#f3f4f6',
                        color: activeTab === tab.key ? '#6d28d9' : '#6b7280',
                        fontSize: 11,
                      }}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ONGLET SÉANCES */}
          {activeTab === 'seances' && stats && (
            <>
              {/* Cards résumé */}
              <div className="row g-3">
                <div className="col-12 col-md-6 col-lg-3">
                  <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0' }}>
                    <div className="text-muted mb-2" style={{ fontSize: 13 }}>Total des élèves</div>
                    <div className="fw-bold" style={{ fontSize: 28, color: '#111827' }}>{stats.nombreTotalEleves || 0}</div>
                  </div>
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                  <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0' }}>
                    <div className="text-muted mb-2" style={{ fontSize: 13 }}>Taux de présence moyen</div>
                    <div className="fw-bold" style={{ fontSize: 28, color: '#111827' }}>{stats.tauxPresenceMoyen ? `${Math.min(Math.round(stats.tauxPresenceMoyen), 100)}%` : '0%'}</div>
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
              <div className="rounded-4 overflow-hidden" style={{ boxShadow: '0 2px 16px rgba(109,40,217,0.08)', border: '1px solid #ede9fe' }}>
                <div className="p-4 d-flex align-items-center gap-2" style={{ background: 'linear-gradient(90deg, #f5f3ff 0%, #ffffff 100%)', borderBottom: '1px solid #ede9fe' }}>
                  <div style={{ width: 4, height: 20, backgroundColor: '#7c3aed', borderRadius: 2 }} />
                  <h5 className="fw-bold mb-0" style={{ fontSize: 16, color: '#6d28d9' }}>
                    Statistiques des élèves — إحصائيات الطلاب
                  </h5>
                </div>
                <div className="table-responsive">
                  {loading ? (
                    <SkeletonTable rows={5} columns={5} />
                  ) : (
                    <table className="table align-middle mb-0" style={{ fontSize: 13 }}>
                      <thead style={{ backgroundColor: '#f9fafb' }}>
                        <tr>
                          <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12, cursor: 'pointer' }} onClick={() => handleSort('nom')}>
                            Nom {sortField === 'nom' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12, cursor: 'pointer' }} onClick={() => handleSort('presence')}>
                            Présence {sortField === 'presence' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12, cursor: 'pointer' }} onClick={() => handleSort('memorise')}>
                            Mémorisé {sortField === 'memorise' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>Partiel</th>
                          <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>Taux</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedEleves.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-5 text-muted">Aucune donnée</td>
                          </tr>
                        ) : (
                          sortedEleves.map((eleve: any) => (
                            <tr key={eleve.eleveId}>
                              <td className="py-3 px-3">
                                <div className="d-flex flex-column">
                                  <span className="fw-semibold">{eleve.nomArabe || eleve.nom}</span>
                                  {eleve.nomArabe && <span className="text-muted" style={{ fontSize: 11 }}>{eleve.nom}</span>}
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <div style={{ flex: 1, height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                                    <div style={{ width: `${Math.min(eleve.tauxPresence, 100)}%`, height: '100%', backgroundColor: '#0A6E3F', borderRadius: 4 }} />
                                  </div>
                                  <span style={{ fontSize: 12, minWidth: 40 }}>{Math.min(Math.round(eleve.tauxPresence), 100)}%</span>
                                </div>
                              </td>
                              <td className="py-3 px-3">{eleve.memorises || 0}</td>
                              <td className="py-3 px-3">{eleve.partiels || 0}</td>
                              <td className="py-3 px-3">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <div style={{ flex: 1, height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                                    <div style={{ width: `${Math.min(eleve.tauxMemorisation, 100)}%`, height: '100%', backgroundColor: '#0A6E3F', borderRadius: 4 }} />
                                  </div>
                                  <span style={{ fontSize: 12, minWidth: 40 }}>{Math.min(Math.round(eleve.tauxMemorisation), 100)}%</span>
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

          {/* ONGLET RÉVISIONS */}
          {activeTab === 'revisions' && (
            <>
              {/* Cards résumé révisions */}
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0' }}>
                    <div className="text-muted mb-2" style={{ fontSize: 13 }}>Total des révisions</div>
                    <div className="fw-bold" style={{ fontSize: 28, color: '#111827' }}>{revisions.length}</div>
                  </div>
                </div>
                <div className="col-12 col-md-4">
                  <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0' }}>
                    <div className="text-muted mb-2" style={{ fontSize: 13 }}>Élèves ayant révisé</div>
                    <div className="fw-bold" style={{ fontSize: 28, color: '#111827' }}>{revisionStats.length}</div>
                  </div>
                </div>
                <div className="col-12 col-md-4">
                  <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0' }}>
                    <div className="text-muted mb-2" style={{ fontSize: 13 }}>Sourates révisées (total)</div>
                    <div className="fw-bold" style={{ fontSize: 28, color: '#111827' }}>
                      {new Set(revisions.filter(r => r.sourateNumero).map((r: any) => r.sourateNumero)).size}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tableau révisions par élève */}
              <div className="rounded-4 overflow-hidden" style={{ boxShadow: '0 2px 16px rgba(109,40,217,0.08)', border: '1px solid #ede9fe' }}>
                <div className="p-4 d-flex align-items-center gap-2" style={{ background: 'linear-gradient(90deg, #f5f3ff 0%, #ffffff 100%)', borderBottom: '1px solid #ede9fe' }}>
                  <div style={{ width: 4, height: 20, backgroundColor: '#7c3aed', borderRadius: 2 }} />
                  <h5 className="fw-bold mb-0" style={{ fontSize: 16, color: '#6d28d9' }}>
                    Révisions par élève — المراجعة لكل طالب
                  </h5>
                </div>
                <div className="table-responsive">
                  {loadingRevisions ? (
                    <SkeletonTable rows={5} columns={5} />
                  ) : (
                    <table className="table align-middle mb-0" style={{ fontSize: 13 }}>
                      <thead style={{ backgroundColor: '#f9fafb' }}>
                        <tr>
                          <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>Matricule</th>
                          <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>Élève</th>
                          <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>Nb révisions</th>
                          <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>Sourates</th>
                          <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>Dernière révision</th>
                        </tr>
                      </thead>
                      <tbody>
                        {revisionStats.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-5 text-muted">Aucune révision pour cette période</td>
                          </tr>
                        ) : (
                          revisionStats.map((eleve: any) => (
                            <tr key={eleve.id}>
                              <td className="py-3 px-3">
                                <span className="badge" style={{ backgroundColor: '#f3f4f6', color: '#374151', fontSize: 11 }}>
                                  {eleve.matricule || '-'}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                <span className="fw-semibold">{eleve.prenom} {eleve.nom}</span>
                              </td>
                              <td className="py-3 px-3">
                                <span className="badge rounded-pill" style={{ backgroundColor: '#ede9fe', color: '#6d28d9', fontSize: 12, padding: '4px 10px' }}>
                                  {eleve.count}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                <span className="badge rounded-pill" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', fontSize: 11 }}>
                                  {eleve.souratesCount}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-muted">
                                {new Date(eleve.lastDate).toLocaleDateString('fr-FR')}
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
        </>
      )}
    </div>
  );
}
