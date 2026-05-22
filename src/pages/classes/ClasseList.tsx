import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { Classe } from '../../Types/index';
import PageHeader from '../../components/Common/PageHeader';
import { SkeletonCard } from '../../components/Common/SkeletonLoader';
import Drawer from '../../components/Common/Drawer';
import ClasseForm from './ClasseForm';

const niveauStyle: Record<string, { bg: string; color: string; gradient: string; icon: string }> = {
  INTERNAT:     { bg: '#dbeafe', color: '#1d4ed8', gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', icon: '🏠' },
  DEMI_PENSION: { bg: '#ffedd5', color: '#9a3412', gradient: 'linear-gradient(135deg, #f97316, #9a3412)', icon: '🍽️' },
  EXTERNAT:     { bg: '#dcfce7', color: '#166534', gradient: 'linear-gradient(135deg, #22c55e, #166534)', icon: '🎒' },
};

export default function ClasseList() {
  const [classes, setClasses] = useState<Classe[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingClasseId, setEditingClasseId] = useState<number | undefined>();

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

  const handleOpenDrawer = (classeId?: number) => {
    setEditingClasseId(classeId);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingClasseId(undefined);
    fetchClasses();
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
            onClick={() => handleOpenDrawer()}
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
        <SkeletonCard count={3} />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-4 shadow-sm text-center py-5 text-muted" style={{ border: '1px solid #f0f0f0', fontSize: 14 }}>
          {search ? 'Aucune classe trouvée.' : 'Aucune classe enregistrée.'}
        </div>
      ) : (
        <div className="row g-4">
          {filtered.map(c => {
            const style = niveauStyle[c.niveau] ?? { bg: '#f3f4f6', color: '#374151', gradient: 'linear-gradient(135deg, #9ca3af, #6b7280)', icon: '📚' };
            return (
              <div key={c.id} className="col-12 col-md-4">
                <div
                  className="bg-white rounded-4 shadow-sm h-100 overflow-hidden position-relative"
                  style={{
                    border: '1px solid #f0f0f0',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={ev => {
                    const el = ev.currentTarget;
                    el.style.transform = 'translateY(-4px)';
                    el.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={ev => {
                    const el = ev.currentTarget;
                    el.style.transform = 'translateY(0)';
                    el.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                  }}
                >
                  {/* Header avec gradient */}
                  <div
                    className="p-4 text-white position-relative"
                    style={{ background: style.gradient }}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: 48, height: 48, backgroundColor: 'rgba(255, 255, 255, 0.2)', fontSize: 24 }}
                        >
                          {style.icon}
                        </div>
                        <div>
                          <h5 className="fw-bold mb-0" style={{ fontSize: 16 }}>{c.niveau.replace('_', ' ')}</h5>
                          <small style={{ opacity: 0.9, fontSize: 12 }}>Classe #{c.id}</small>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenDrawer(c.id); }}
                          title="Modifier"
                          className="btn btn-sm d-flex align-items-center justify-content-center"
                          style={{ width: 32, height: 32, padding: 0, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.3)', backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#fff' }}
                          onMouseEnter={ev => { const b = ev.currentTarget; b.style.backgroundColor='rgba(255, 255, 255, 0.3)'; }}
                          onMouseLeave={ev => { const b = ev.currentTarget; b.style.backgroundColor='rgba(255, 255, 255, 0.2)'; }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 0110 16.414H8v-2a2 2 0 01.586-1.414z"/>
                          </svg>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                          disabled={deletingId === c.id}
                          title="Supprimer"
                          className="btn btn-sm d-flex align-items-center justify-content-center"
                          style={{ width: 32, height: 32, padding: 0, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.3)', backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#fff', opacity: deletingId === c.id ? 0.4 : 1 }}
                          onMouseEnter={ev => { const b = ev.currentTarget; b.style.backgroundColor='rgba(239, 68, 68, 0.3)'; }}
                          onMouseLeave={ev => { const b = ev.currentTarget; b.style.backgroundColor='rgba(255, 255, 255, 0.2)'; }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 01-1-1V5a1 1 0 011-1h6a1 1 0 011 1v1a1 1 0 01-1 1H9z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Corps */}
                  <div className="p-4">
                    <div className="mb-3">
                      <p className="text-muted mb-1" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Capacité maximale</p>
                      <div className="d-flex align-items-center justify-content-between">
                        <span className="fw-bold" style={{ fontSize: 28, color: style.color }}>{c.capaciteMax}</span>
                        <span
                          className="badge rounded-pill fw-medium"
                          style={{ backgroundColor: style.bg, color: style.color, fontSize: 11, padding: '4px 10px' }}
                        >
                          Élèves
                        </span>
                      </div>
                    </div>

                    {/* Barre de progression décorative */}
                    <div
                      className="rounded-pill"
                      style={{ height: 6, backgroundColor: '#f3f4f6', overflow: 'hidden' }}
                    >
                      <div
                        className="rounded-pill"
                        style={{
                          height: '100%',
                          width: '100%',
                          background: style.gradient,
                          transition: 'width 0.5s ease',
                        }}
                      />
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

      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={editingClasseId ? 'Modifier la classe' : 'Nouvelle classe'}
      >
        <ClasseForm onClose={handleCloseDrawer} classeId={editingClasseId} />
      </Drawer>
    </div>
  );
}
