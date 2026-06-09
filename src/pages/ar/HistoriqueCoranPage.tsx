import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { Classe } from '../../Types/index';
import coranService from '../../services/coranService';
import NiveauBadge from '../../components/Coran/NiveauBadge';
import { SkeletonTable } from '../../components/Common/SkeletonLoader';
import toast from 'react-hot-toast';
import { useAuth } from '../../Context/AuthContext';

export default function HistoriqueCoranPage() {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<'seances' | 'revisions'>('seances');
  const [selectedClasse, setSelectedClasse] = useState<number | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [classes, setClasses] = useState<Classe[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [revisions, setRevisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRevisions, setLoadingRevisions] = useState(false);
  const [expandedSession, setExpandedSession] = useState<number | null>(null);

  useEffect(() => {
    fetchClasses();
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
  }, []);

  useEffect(() => {
    if (selectedClasse) {
      fetchSessions();
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

  const fetchSessions = async () => {
    if (!selectedClasse) return;
    setLoading(true);
    try {
      const res = await coranService.getHistoriqueSeances(Number(selectedClasse), startDate, endDate);
      setSessions(res);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du chargement de l'historique");
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
      toast.error("Erreur lors du chargement des révisions");
    } finally {
      setLoadingRevisions(false);
    }
  };

  const handleSearch = () => {
    fetchSessions();
    fetchRevisions();
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
      <div className="rounded-4 p-5 position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: 180, width: 160, height: 160, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', top: 20, right: 120, width: 80, height: 80, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }} />
        <div className="position-relative d-flex align-items-center gap-4">
          <div style={{ width: 64, height: 64, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0 }}>
            📚
          </div>
          <div>
            <h1 className="fw-bold mb-1" style={{ fontSize: 26, color: '#ffffff' }}>Historique des séances de récitation</h1>
            <p className="mb-1" style={{ fontSize: 17, color: 'rgba(255,255,255,0.9)', fontFamily: 'serif' }}>سجل جلسات التلاوة</p>
            <p className="mb-0" style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Consultez l'historique des séances et les détails de mémorisation</p>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <form className="rounded-4 p-4" style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 16px rgba(180,83,9,0.08)', border: '1px solid #fef3c7' }} onSubmit={(e) => e.preventDefault()}>
        <div className="d-flex align-items-center gap-2 mb-4">
          <div style={{ width: 4, height: 20, backgroundColor: '#d97706', borderRadius: 2 }} />
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
              style={{ backgroundColor: '#d97706', borderColor: '#d97706', color: '#fff', borderRadius: 8, fontSize: 14, padding: '0.75rem' }}
            >
              🔍 Rechercher
            </button>
          </div>
        </div>
      </form>

      {/* Message si aucune classe sélectionnée */}
      {!selectedClasse && (
        <div className="bg-white rounded-4 shadow-sm p-5 text-center" style={{ border: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
          <p className="text-muted mb-0" style={{ fontSize: 14 }}>Sélectionnez une classe pour afficher l'historique</p>
        </div>
      )}

      {/* Onglets Séances / Révisions */}
      {selectedClasse && (
        <div className="rounded-4" style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 16px rgba(180,83,9,0.08)', border: '1px solid #fef3c7' }}>
          <div className="d-flex border-bottom px-4">
            {([
              { key: 'seances', label: '📖 Séances de récitation', count: sessions.length },
              { key: 'revisions', label: '🔁 Révisions', count: revisions.length },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="btn border-0 px-4 py-3 fw-semibold d-flex align-items-center gap-2"
                style={{
                  fontSize: 14,
                  borderRadius: 0,
                  borderBottom: activeTab === tab.key ? '2px solid #d97706' : '2px solid transparent',
                  color: activeTab === tab.key ? '#b45309' : '#6b7280',
                  backgroundColor: 'transparent',
                }}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="badge rounded-pill" style={{ backgroundColor: activeTab === tab.key ? '#fef3c7' : '#f3f4f6', color: activeTab === tab.key ? '#b45309' : '#6b7280', fontSize: 11 }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* TABLE SÉANCES */}
          {activeTab === 'seances' && (
            <div className="table-responsive">
              {loading ? (
                <SkeletonTable rows={5} columns={6} />
              ) : (
                <table className="table align-middle mb-0" style={{ fontSize: 13 }}>
                  <thead style={{ backgroundColor: '#f9fafb' }}>
                    <tr>
                      <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>Date</th>
                      <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>N° Séance</th>
                      <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>Enseignant</th>
                      <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>Versets</th>
                      <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>Présence</th>
                      <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-5 text-muted">
                          Aucune séance trouvée pour cette période
                        </td>
                      </tr>
                    ) : (
                      sessions.map((session) => (
                        <React.Fragment key={session.id}>
                          <tr style={{ cursor: 'pointer' }} onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}>
                            <td className="py-3 px-3">
                              {new Date(session.date).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="py-3 px-3">
                              <span className="badge rounded-pill fw-medium" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', fontSize: 11 }}>
                                Séance {session.numeroSeance || 1}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="fw-semibold">{session.enseignantNom}</span>
                            </td>
                            <td className="py-3 px-3">
                              {session.versets?.[0]
                                ? `${session.versets[0].sourateNomArabe || session.versets[0].sourateNom} — versets ${session.versets[0].versetDebut} à ${session.versets[0].versetFin}`
                                : '-'}
                            </td>
                            <td className="py-3 px-3">
                              <span className="fw-semibold" style={{ color: '#0A6E3F' }}>
                                {session.recitations?.filter((r: any) => r.present).length || 0}
                              </span>
                              <span className="text-muted"> / {session.recitations?.length || 0}</span>
                            </td>
                            <td className="py-3 px-3">
                              <button className="btn btn-sm" style={{ backgroundColor: '#e8f5e9', color: '#0A6E3F', borderRadius: 6, fontSize: 12 }}>
                                {expandedSession === session.id ? 'Masquer ▲' : 'Détails ▼'}
                              </button>
                            </td>
                          </tr>
                          {expandedSession === session.id && (
                            <tr>
                              <td colSpan={6} className="p-3" style={{ backgroundColor: '#f9fafb' }}>
                                <div className="bg-white rounded-3 p-3">
                                  <h6 className="fw-bold mb-3" style={{ fontSize: 14, color: '#111827' }}>Détails de mémorisation</h6>
                                  <table className="table table-sm mb-0" style={{ fontSize: 12 }}>
                                    <thead>
                                      <tr>
                                        <th>Élève</th>
                                        <th>Présence</th>
                                        <th>Niveau de mémorisation</th>
                                        <th>Note</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {session.recitations?.map((recitation: any) => (
                                        <tr key={recitation.id}>
                                          <td>
                                            <span className="fw-semibold">
                                              {recitation.prenomArabe || recitation.elevePrenom} {recitation.nomArabe || recitation.eleveNom}
                                            </span>
                                          </td>
                                          <td>{recitation.present ? '✅' : '❌'}</td>
                                          <td><NiveauBadge niveau={recitation.niveauMemorisation} /></td>
                                          <td>{recitation.commentaire || '-'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TABLE RÉVISIONS */}
          {activeTab === 'revisions' && (
            <div className="table-responsive">
              {loadingRevisions ? (
                <SkeletonTable rows={5} columns={7} />
              ) : (
                <table className="table align-middle mb-0" style={{ fontSize: 13 }}>
                  <thead style={{ backgroundColor: '#f9fafb' }}>
                    <tr>
                      <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>Date</th>
                      <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>Matricule</th>
                      <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>Élève</th>
                      <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>Sourate</th>
                      <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>Versets</th>
                      <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>Récitateur</th>
                      <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>Commentaire</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revisions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-5 text-muted">
                          Aucune révision trouvée pour cette période
                        </td>
                      </tr>
                    ) : (
                      revisions.map((revision: any) => (
                        <tr key={revision.id}>
                          <td className="py-3 px-3">
                            {new Date(revision.date).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="py-3 px-3">
                            <span className="badge" style={{ backgroundColor: '#f3f4f6', color: '#374151', fontSize: 11 }}>
                              {revision.eleveMatricule || '-'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="fw-semibold">{revision.elevePrenom} {revision.eleveNom}</span>
                          </td>
                          <td className="py-3 px-3">
                            {revision.sourateNomArabe || revision.sourateNom || (revision.sourateNumero ? `Sourate ${revision.sourateNumero}` : '-')}
                          </td>
                          <td className="py-3 px-3">
                            <span className="badge rounded-pill" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', fontSize: 11 }}>
                              {revision.versetRevisionDebut} → {revision.versetRevisionFin}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {revision.enseignantNom || '-'}
                          </td>
                          <td className="py-3 px-3 text-muted" style={{ maxWidth: 200 }}>
                            {revision.commentaire || '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
