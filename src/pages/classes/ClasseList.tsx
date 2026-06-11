import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { Classe } from '../../Types/index';
import { SkeletonCard } from '../../components/Common/SkeletonLoader';
import Drawer from '../../components/Common/Drawer';
import ClasseForm from './ClasseForm';
import { useAuth } from '../../Context/AuthContext';
import { PageBanner, BannerBtn, KpiCard, SearchBar, TableFooter } from '../../components/Common/ListLayout';

const niveauStyle: Record<string, { bg: string; color: string; gradient: string; icon: string }> = {
  INTERNAT:     { bg: '#dbeafe', color: '#1d4ed8', gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', icon: '🏠' },
  DEMI_PENSION: { bg: '#ffedd5', color: '#9a3412', gradient: 'linear-gradient(135deg, #f97316, #9a3412)', icon: '🍽️' },
  EXTERNAT:     { bg: '#dcfce7', color: '#166534', gradient: 'linear-gradient(135deg, #22c55e, #166534)', icon: '🎒' },
};

export default function ClasseList() {
  const { role } = useAuth();
  const [classes, setClasses] = useState<Classe[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingClasseId, setEditingClasseId] = useState<number | undefined>();

  useEffect(() => { fetchClasses(); }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try { const res = await api.get('/classes'); setClasses(res.data); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette classe ?')) return;
    setDeletingId(id);
    try { await api.delete(`/classes/${id}`); await fetchClasses(); }
    finally { setDeletingId(null); }
  };
  const handleOpenDrawer  = (id?: number) => { setEditingClasseId(id); setIsDrawerOpen(true); };
  const handleCloseDrawer = () => { setIsDrawerOpen(false); setEditingClasseId(undefined); fetchClasses(); };

  const filtered       = classes.filter(c => c.niveau.toLowerCase().includes(search.toLowerCase()) || c.id.toString().includes(search));
  const totalCapacity  = classes.reduce((s, c) => s + c.capaciteMax, 0);
  const niveaux        = new Set(classes.map(c => c.niveau)).size;

  return (
    <div className="d-flex flex-column gap-4" style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>

      <PageBanner icon="🏫" subtitle="Portail Français — Organisation" title="Classes"
        count={`${classes.length} classe${classes.length !== 1 ? 's' : ''} disponible${classes.length !== 1 ? 's' : ''}`}
        gradient="linear-gradient(135deg, #1e3a5f 0%, #1e40af 60%, #1e3a8a 100%)"
        action={role !== 'COMPTABLE' ? <BannerBtn label="Nouvelle Classe" onClick={() => handleOpenDrawer()} /> : undefined} />

      <div className="row g-3">
        <KpiCard icon="🏫" label="Total classes"    value={classes.length}  sub="classes enregistrées" accent="#0A6E3F" bg="#f0fdf4" borderLeft="#22c55e" />
        <KpiCard icon="👥" label="Capacité totale"  value={`${totalCapacity} places`} sub="places disponibles" accent="#1d4ed8" bg="#eff6ff" borderLeft="#3b82f6" />
        <KpiCard icon="📚" label="Niveaux"          value={niveaux}         sub="types de classes" accent="#d97706" bg="#fffbeb" borderLeft="#f59e0b" />
        <KpiCard icon="📊" label="Moy. capacité"    value={classes.length > 0 ? Math.round(totalCapacity / classes.length) : 0} sub="élèves par classe" accent="#0f766e" bg="#f0fdfa" borderLeft="#14b8a6" />
      </div>

      <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0' }}>
        <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
          <SearchBar value={search} onChange={setSearch} placeholder="Rechercher une classe…" width={260} />
          <span style={{ fontSize: 12, color: '#6b7280' }}><span style={{ fontWeight: 700, color: '#111827' }}>{filtered.length}</span> classe{filtered.length !== 1 ? 's' : ''} affichée{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {loading ? (
        <SkeletonCard count={3} />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-4 shadow-sm d-flex flex-column align-items-center justify-content-center py-5" style={{ border: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🏫</div>
          <div style={{ fontWeight: 600, color: '#374151' }}>{search ? 'Aucune classe trouvée' : 'Aucune classe enregistrée'}</div>
        </div>
      ) : (
        <div className="row g-4">
          {filtered.map(c => {
            const style = niveauStyle[c.niveau] ?? { bg: '#f3f4f6', color: '#374151', gradient: 'linear-gradient(135deg, #9ca3af, #6b7280)', icon: '📚' };
            return (
              <div key={c.id} className="col-12 col-md-4">
                <div className="bg-white rounded-4 shadow-sm h-100 overflow-hidden position-relative"
                  style={{ border: '1px solid #f0f0f0', transition: 'all 0.25s ease', cursor: 'pointer' }}
                  onMouseEnter={ev => { ev.currentTarget.style.transform = 'translateY(-4px)'; ev.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)'; }}
                  onMouseLeave={ev => { ev.currentTarget.style.transform = 'translateY(0)'; ev.currentTarget.style.boxShadow = ''; }}>
                  <div className="p-4 text-white position-relative" style={{ background: style.gradient }}>
                    <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)' }} />
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-3">
                        <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, backgroundColor: 'rgba(255,255,255,0.2)', fontSize: 24 }}>
                          {style.icon}
                        </div>
                        <div>
                          <h5 className="fw-bold mb-0" style={{ fontSize: 16 }}>{c.niveau.replace('_', ' ')}</h5>
                          <small style={{ opacity: 0.8, fontSize: 11 }}>Classe #{c.id}</small>
                        </div>
                      </div>
                      {role !== 'COMPTABLE' && (
                        <div className="d-flex gap-2">
                          <button onClick={e => { e.stopPropagation(); handleOpenDrawer(c.id); }} title="Modifier"
                            style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 0110 16.414H8v-2a2 2 0 01.586-1.414z"/></svg>
                          </button>
                          <button onClick={e => { e.stopPropagation(); handleDelete(c.id); }} disabled={deletingId === c.id} title="Supprimer"
                            style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: deletingId === c.id ? 0.4 : 1 }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 01-1-1V5a1 1 0 011-1h6a1 1 0 011 1v1a1 1 0 01-1 1H9z"/></svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <p style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Capacité maximale</p>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <span style={{ fontSize: 28, fontWeight: 800, color: style.color }}>{c.capaciteMax}</span>
                      <span style={{ backgroundColor: style.bg, color: style.color, borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 600 }}>Élèves</span>
                    </div>
                    <div className="rounded-pill" style={{ height: 6, backgroundColor: '#f3f4f6', overflow: 'hidden' }}>
                      <div className="rounded-pill" style={{ height: '100%', width: '100%', background: style.gradient }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-white rounded-4 shadow-sm" style={{ border: '1px solid #f0f0f0' }}>
        <TableFooter right={`${filtered.length} / ${classes.length} classes`} />
      </div>

      <Drawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} title={editingClasseId ? 'Modifier la classe' : 'Nouvelle classe'}>
        <ClasseForm onClose={handleCloseDrawer} classeId={editingClasseId} />
      </Drawer>
    </div>
  );
}
