import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { Classe } from '../../Types/index';
import coranService from '../../services/coranService';
import NiveauBadge from '../../components/Coran/NiveauBadge';
import { SkeletonTable } from '../../components/Common/SkeletonLoader';
import toast from 'react-hot-toast';
import { useAuth } from '../../Context/AuthContext';

export default function HistoriqueCoranPage() {
  const { role } = useAuth();
  const [selectedClasse, setSelectedClasse] = useState<number | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [classes, setClasses] = useState<Classe[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
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

  const fetchSessions = async () => {
    if (!selectedClasse) return;
    setLoading(true);
    try {
      const res = await coranService.getHistoriqueSeances(Number(selectedClasse), startDate, endDate);
      setSessions(res);
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du chargement de l\'historique');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchSessions();
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
        <h1 className="fw-bold mb-1" style={{ fontSize: 24, color: '#111827' }}>Historique des séances de récitation</h1>
        <p className="text-muted mb-0" style={{ fontSize: 14 }}>Afficher l'historique des séances de récitation et les détails de mémorisation</p>
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

      {/* Tableau des sessions */}
      <div className="bg-white rounded-4 shadow-sm overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
        <div className="table-responsive">
          {loading ? (
            <SkeletonTable rows={5} columns={5} />
          ) : (
            <table className="table align-middle mb-0" style={{ fontSize: 13 }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>
                    Date
                  </th>
                  <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>
                    Enseignant
                  </th>
                  <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>
                    Versets
                  </th>
                  <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>
                    Présence
                  </th>
                  <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5 text-muted">
                      Aucune séance dans cette période
                    </td>
                  </tr>
                ) : (
                  sessions.map((session) => (
                    <>
                      <tr key={session.id} style={{ cursor: 'pointer' }} onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}>
                        <td className="py-3 px-3">
                          {new Date(session.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="py-3 px-3">
                          <div className="d-flex flex-column">
                            <span className="fw-semibold">{session.enseignantNomArabe || session.enseignantNom}</span>
                            {session.enseignantNomArabe && (
                              <span className="text-muted" style={{ fontSize: 11 }}>{session.enseignantNom}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          {session.versets?.[0]?.sourate || '-'} - Verset {session.versets?.[0]?.versetDebut || '-'} à {session.versets?.[0]?.versetFin || '-'}
                        </td>
                        <td className="py-3 px-3">
                          {session.recitations?.filter((r: any) => r.present).length || 0} / {session.recitations?.length || 0}
                        </td>
                        <td className="py-3 px-3">
                          <button className="btn btn-sm" style={{ backgroundColor: '#e8f5e9', color: '#0A6E3F', borderRadius: 6, fontSize: 12 }}>
                            {expandedSession === session.id ? 'Masquer' : 'Afficher les détails'}
                          </button>
                        </td>
                      </tr>
                      {expandedSession === session.id && (
                        <tr>
                          <td colSpan={5} className="p-3" style={{ backgroundColor: '#f9fafb' }}>
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
                                        <div className="d-flex flex-column">
                                          <span className="fw-semibold">{recitation.eleveNomArabe || recitation.eleveNom}</span>
                                          {recitation.eleveNomArabe && (
                                            <span className="text-muted" style={{ fontSize: 11 }}>{recitation.eleveNom}</span>
                                          )}
                                        </div>
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
                    </>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
