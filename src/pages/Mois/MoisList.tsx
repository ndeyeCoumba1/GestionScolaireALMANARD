import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { Mois } from '../../Types/index';
import { SkeletonTable } from '../../components/Common/SkeletonLoader';
import { ConfirmModal } from '../../components/Common/ConfirmModal';
import Drawer from '../../components/Common/Drawer';
import MoisForm from './MoisForm';
import { PageBanner, BannerBtn, KpiCard, SearchBar, TableHead, TableFooter, EmptyState, ROW_STYLE, TD } from '../../components/Common/ListLayout';

export default function MoisList() {
  const [mois, setMois] = useState<Mois[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [moisToDelete, setMoisToDelete] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingMoisId, setEditingMoisId] = useState<number | undefined>();

  useEffect(() => { fetchMois(); }, []);

  const fetchMois = async () => {
    setLoading(true);
    try { const res = await api.get('/mois'); setMois(res.data); }
    catch {} finally { setLoading(false); }
  };

  const handleDelete  = (id: number) => { setMoisToDelete(id); setShowDeleteModal(true); };
  const confirmDelete = async () => {
    if (!moisToDelete) return; setDeletingId(moisToDelete);
    try { await api.delete(`/mois/${moisToDelete}`); await fetchMois(); }
    catch {} finally { setDeletingId(null); setShowDeleteModal(false); setMoisToDelete(null); }
  };
  const handleOpenDrawer  = (id?: number) => { setEditingMoisId(id); setIsDrawerOpen(true); };
  const handleCloseDrawer = () => { setIsDrawerOpen(false); setEditingMoisId(undefined); fetchMois(); };

  const filtered      = mois.filter(m => m.libelle.toLowerCase().includes(search.toLowerCase()));
  const totalScol     = mois.reduce((s, m) => s + (m.montantScolarite || 0), 0);
  const montantMoyen  = mois.length > 0 ? Math.round(totalScol / mois.length) : 0;

  return (
    <div className="d-flex flex-column gap-4" style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>

      <PageBanner icon="📆" subtitle="Portail Français — Configuration" title="Mois scolaires"
        count={`${mois.length} mois enregistré${mois.length !== 1 ? 's' : ''}`}
        gradient="linear-gradient(135deg, #0f766e 0%, #0d9488 60%, #0f766e 100%)"
        action={<BannerBtn label="Nouveau Mois" onClick={() => handleOpenDrawer()} />} />

      <div className="row g-3">
        <KpiCard icon="📆" label="Total mois"       value={mois.length}    sub="mois scolaires" accent="#0f766e" bg="#f0fdfa" borderLeft="#14b8a6" />
        <KpiCard icon="💰" label="Total scolarité"  value={`${totalScol.toLocaleString('fr-FR')} FCFA`} sub="montants cumulés" accent="#0A6E3F" bg="#f0fdf4" borderLeft="#22c55e" />
        <KpiCard icon="📊" label="Moyenne / mois"   value={`${montantMoyen.toLocaleString('fr-FR')} FCFA`} sub="montant mensuel moyen" accent="#d97706" bg="#fffbeb" borderLeft="#f59e0b" />
        <KpiCard icon="🔍" label="Résultats"         value={filtered.length} sub="dans la sélection" accent="#1d4ed8" bg="#eff6ff" borderLeft="#3b82f6" />
      </div>

      <div className="bg-white rounded-4 shadow-sm overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
        <div style={{ padding: '20px 24px 0' }}>
          <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap mb-4">
            <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un mois…" width={260} />
            <span style={{ fontSize: 12, color: '#6b7280' }}><span style={{ fontWeight: 700, color: '#111827' }}>{filtered.length}</span> résultat{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div style={{ padding: '0 24px 24px' }}><SkeletonTable rows={5} columns={3} /></div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <TableHead cols={[{ label: 'Mois' }, { label: 'Montant scolarité', align: 'right' }, { label: 'Actions' }]} />
              <tbody>
                {filtered.length === 0 ? (
                  <EmptyState icon="📆" title={search ? 'Aucun mois trouvé' : 'Aucun mois enregistré'} sub={search ? `Aucun mois ne correspond à « ${search} »` : undefined} />
                ) : filtered.map(m => (
                  <tr key={m.id} style={ROW_STYLE} onMouseEnter={ev => (ev.currentTarget.style.backgroundColor = '#fafafa')} onMouseLeave={ev => (ev.currentTarget.style.backgroundColor = 'transparent')}>
                    <td style={TD}>
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, backgroundColor: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                          📅
                        </div>
                        <span style={{ fontWeight: 700, color: '#111827', fontSize: 13 }}>{m.libelle}</span>
                      </div>
                    </td>
                    <td style={{ ...TD, textAlign: 'right', fontWeight: 700, color: '#0f766e', whiteSpace: 'nowrap', fontSize: 13 }}>
                      {m.montantScolarite?.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td style={TD}>
                      <div className="d-flex align-items-center gap-1">
                        <button onClick={() => handleOpenDrawer(m.id)} title="Modifier" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #bbf7d0', backgroundColor: '#f0fdf4', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 0110 16.414H8v-2a2 2 0 01.586-1.414z"/></svg>
                        </button>
                        <button onClick={() => handleDelete(m.id)} disabled={deletingId === m.id} title="Supprimer" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #fecaca', backgroundColor: '#fef2f2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: deletingId === m.id ? 0.4 : 1 }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 01-1-1V5a1 1 0 011-1h6a1 1 0 011 1v1a1 1 0 01-1 1H9z"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <TableFooter right={`${filtered.length} / ${mois.length} mois`} />
      </div>

      <ConfirmModal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setMoisToDelete(null); }} onConfirm={confirmDelete} title="Supprimer le mois" message="Êtes-vous sûr de vouloir supprimer ce mois ? Cette action est irréversible." confirmText="Supprimer" cancelText="Annuler" variant="danger" />
      <Drawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} title={editingMoisId ? 'Modifier le mois' : 'Nouveau mois'}>
        <MoisForm onClose={handleCloseDrawer} moisId={editingMoisId} />
      </Drawer>
    </div>
  );
}
