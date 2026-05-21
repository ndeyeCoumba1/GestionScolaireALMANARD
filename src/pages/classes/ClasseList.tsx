import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import type { Classe } from '../../Types/index';
import PageHeader from '../../components/Common/PageHeader';

const niveauStyle: Record<string, { bg: string; color: string }> = {
  INTERNAT:     { bg: '#dbeafe', color: '#1d4ed8' },
  DEMI_PENSION: { bg: '#ffedd5', color: '#9a3412' },
  EXTERNAT:     { bg: '#dcfce7', color: '#166534' },
};

export default function ClasseList() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Classe[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => { fetchClasses(); }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/classes');
      setClasses(res.data);
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette classe ?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/classes/${id}`);
      await fetchClasses();
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = classes.filter(c =>
    c.niveau.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toString().includes(search)
  );

  return (
    <div className="d-flex flex-column gap-4">

      {/* ── Header ── */}
      <PageHeader
        subtitle="Gestion des classes"
        title="Classes"
        description="Consultez et gérez les classes de votre établissement."
        countText={`${classes.length} classe(s) disponible(s)`}
        action={
          <button
            onClick={() => navigate('/classes/nouveau')}
            className="btn fw-semibold d-flex align-items-center gap-2 px-4 py-2"
            style={{ backgroundColor: '#fff', color: '#1a5c38', borderRadius: 12, fontSize: 14 }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
            Nouvelle Classe
          </button>
        }
      />

      {/* ── Recherche ── */}
      <div className="bg-white rounded-4 shadow-sm overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
        <div className="px-4 pt-4 pb-3">
          <p className="fw-semibold text-dark mb-3" style={{ fontSize: 15 }}>Liste des classes</p>
          <div className="position-relative">
            <span className="position-absolute top-50 translate-middle-y text-muted" style={{ left: 14, pointerEvents: 'none' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
              </svg>
            </span>
            <input
              id="classe-search"
              type="text"
              placeholder="Rechercher une classe..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-control"
              style={{ paddingLeft: 38, paddingTop: 10, paddingBottom: 10, borderRadius: 12, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: 14, boxShadow: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* ── Grille des classes ── */}
      {loading ? (
        <div className="text-center py-5 text-muted" style={{ fontSize: 14 }}>Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-4 shadow-sm text-center py-5 text-muted" style={{ border: '1px solid #f0f0f0', fontSize: 14 }}>
          {search ? 'Aucune classe trouvée.' : 'Aucune classe enregistrée.'}
        </div>
      ) : (
        <div className="row g-3">
          {filtered.map(c => {
            const style = niveauStyle[c.niveau] ?? { bg: '#f3f4f6', color: '#374151' };
            return (
              <div key={c.id} className="col-12 col-md-6 col-lg-4">
                <div className="bg-white rounded-4 shadow-sm h-100 overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
                  {/* Bande couleur selon niveau */}
                  <div style={{ height: 4, backgroundColor: style.color, opacity: 0.4 }} />
                  <div className="p-4">
                    {/* Badge niveau + boutons actions */}
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <span
                        className="badge rounded-pill fw-medium"
                        style={{ backgroundColor: style.bg, color: style.color, fontSize: 12, padding: '5px 12px' }}
                      >
                        {c.niveau.replace('_', ' ')}
                      </span>
                      <div className="d-flex align-items-center gap-2">
                        <button
                          onClick={() => navigate(`/classes/${c.id}/modifier`)}
                          title="Modifier"
                          className="btn btn-sm d-flex align-items-center justify-content-center"
                          style={{ width: 30, height: 30, padding: 0, borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#9ca3af' }}
                          onMouseEnter={ev => { const b = ev.currentTarget; b.style.color='#16a34a'; b.style.backgroundColor='#f0faf4'; b.style.borderColor='#bbf7d0'; }}
                          onMouseLeave={ev => { const b = ev.currentTarget; b.style.color='#9ca3af'; b.style.backgroundColor='#fff'; b.style.borderColor='#e5e7eb'; }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 0110 16.414H8v-2a2 2 0 01.586-1.414z"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          disabled={deletingId === c.id}
                          title="Supprimer"
                          className="btn btn-sm d-flex align-items-center justify-content-center"
                          style={{ width: 30, height: 30, padding: 0, borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#9ca3af', opacity: deletingId === c.id ? 0.4 : 1 }}
                          onMouseEnter={ev => { const b = ev.currentTarget; b.style.color='#ef4444'; b.style.backgroundColor='#fef2f2'; b.style.borderColor='#fecaca'; }}
                          onMouseLeave={ev => { const b = ev.currentTarget; b.style.color='#9ca3af'; b.style.backgroundColor='#fff'; b.style.borderColor='#e5e7eb'; }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 01-1-1V5a1 1 0 011-1h6a1 1 0 011 1v1a1 1 0 01-1 1H9z"/>
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Titre */}
                    <h6 className="fw-bold mb-1" style={{ color: '#111827' }}>Classe #{c.id}</h6>
                    <p className="text-muted mb-3" style={{ fontSize: 13 }}>Capacité maximale</p>

                    {/* Capacité + statut */}
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="fw-bold" style={{ fontSize: 22, color: '#1a5c38' }}>{c.capaciteMax}</span>
                      <span
                        className="badge rounded-pill"
                        style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: 12, padding: '5px 10px' }}
                      >
                        Disponible
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="text-center py-2" style={{ fontSize: 12, color: '#d1d5db' }}>
        © 2026 Al-Manard3s — Tous droits réservés
      </div>
    </div>
  );
}
