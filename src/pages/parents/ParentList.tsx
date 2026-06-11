import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { Parent } from '../../Types/index';
import { SkeletonTable } from '../../components/Common/SkeletonLoader';
import { ConfirmModal } from '../../components/Common/ConfirmModal';
import Drawer from '../../components/Common/Drawer';
import ParentForm from './ParentForm';
import { PageBanner, BannerBtn, KpiCard, SearchBar, TableHead, TableFooter, EmptyState, ROW_STYLE, TD, avatarColor, initials } from '../../components/Common/ListLayout';

export default function ParentList() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [parentToDelete, setParentToDelete] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingParentId, setEditingParentId] = useState<number | undefined>();

  useEffect(() => { fetchParents(); }, []);

  const fetchParents = async () => {
    setLoading(true);
    try { const res = await api.get('/parents'); setParents(res.data); }
    finally { setLoading(false); }
  };

  const handleDelete  = (id: number) => { setParentToDelete(id); setShowDeleteModal(true); };
  const confirmDelete = async () => {
    if (!parentToDelete) return; setDeletingId(parentToDelete);
    try { await api.delete(`/parents/${parentToDelete}`); await fetchParents(); }
    finally { setDeletingId(null); setShowDeleteModal(false); setParentToDelete(null); }
  };
  const handleOpenDrawer  = (id?: number) => { setEditingParentId(id); setIsDrawerOpen(true); };
  const handleCloseDrawer = () => { setIsDrawerOpen(false); setEditingParentId(undefined); fetchParents(); };

  const filtered    = parents.filter(p => `${p.nom} ${p.prenom} ${p.telephone} ${p.email ?? ''} ${p.profession ?? ''}`.toLowerCase().includes(search.toLowerCase()));
  const avecEmail   = parents.filter(p => p.email).length;
  const avecProfess = parents.filter(p => p.profession).length;

  return (
    <div className="d-flex flex-column gap-4" style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>

      <PageBanner icon="👨‍👩‍👧" subtitle="Portail Français — Responsables" title="Parents" count={`${parents.length} parent${parents.length !== 1 ? 's' : ''} enregistré${parents.length !== 1 ? 's' : ''}`}
        action={<BannerBtn label="Nouveau Parent" onClick={() => handleOpenDrawer()} />} />

      <div className="row g-3">
        <KpiCard icon="👪" label="Total parents"     value={parents.length} sub="responsables enregistrés" accent="#0A6E3F" bg="#f0fdf4" borderLeft="#22c55e" />
        <KpiCard icon="📧" label="Avec email"         value={avecEmail}      sub={`${parents.length - avecEmail} sans email`} accent="#1d4ed8" bg="#eff6ff" borderLeft="#3b82f6" />
        <KpiCard icon="💼" label="Avec profession"    value={avecProfess}    sub={`${parents.length - avecProfess} non renseigné`} accent="#d97706" bg="#fffbeb" borderLeft="#f59e0b" />
        <KpiCard icon="✅" label="Renseignés"          value={filtered.length} sub="dans la sélection actuelle" accent="#0f766e" bg="#f0fdfa" borderLeft="#14b8a6" />
      </div>

      <div className="bg-white rounded-4 shadow-sm overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
        <div style={{ padding: '20px 24px 0' }}>
          <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap mb-4">
            <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un parent…" width={280} />
            <span style={{ fontSize: 12, color: '#6b7280' }}><span style={{ fontWeight: 700, color: '#111827' }}>{filtered.length}</span> résultat{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div style={{ padding: '0 24px 24px' }}><SkeletonTable rows={6} columns={6} /></div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <TableHead cols={[{ label: 'Parent' }, { label: 'Téléphone' }, { label: 'Email' }, { label: 'Adresse' }, { label: 'Profession' }, { label: 'Actions' }]} />
              <tbody>
                {filtered.length === 0 ? (
                  <EmptyState icon="🔍" title={search ? 'Aucun résultat trouvé' : 'Aucun parent enregistré'} sub={search ? `Aucun parent ne correspond à « ${search} »` : undefined} />
                ) : filtered.map(p => (
                  <tr key={p.id} style={ROW_STYLE} onMouseEnter={ev => (ev.currentTarget.style.backgroundColor = '#fafafa')} onMouseLeave={ev => (ev.currentTarget.style.backgroundColor = 'transparent')}>
                    <td style={TD}>
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, backgroundColor: avatarColor(p.id), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
                          {initials(p.nom, p.prenom)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#111827', fontSize: 13 }}>{p.nom} {p.prenom}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ ...TD, color: '#374151', fontSize: 12 }}>{p.telephone}</td>
                    <td style={{ ...TD, color: '#9ca3af', fontSize: 12 }}>{p.email || '—'}</td>
                    <td style={{ ...TD, color: '#9ca3af', fontSize: 12 }}>{(p as any).adresse || '—'}</td>
                    <td style={TD}>
                      {p.profession
                        ? <span style={{ backgroundColor: '#f0fdf4', color: '#166534', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 600 }}>{p.profession}</span>
                        : <span style={{ color: '#9ca3af' }}>—</span>}
                    </td>
                    <td style={TD}>
                      <div className="d-flex align-items-center gap-1">
                        <button onClick={() => handleOpenDrawer(p.id)} title="Modifier" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #bbf7d0', backgroundColor: '#f0fdf4', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 0110 16.414H8v-2a2 2 0 01.586-1.414z"/></svg>
                        </button>
                        <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id} title="Supprimer" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #fecaca', backgroundColor: '#fef2f2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: deletingId === p.id ? 0.4 : 1 }}>
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
        <TableFooter right={`${filtered.length} / ${parents.length} parents`} />
      </div>

      <ConfirmModal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setParentToDelete(null); }} onConfirm={confirmDelete} title="Supprimer le parent" message="Êtes-vous sûr de vouloir supprimer ce parent ? Cette action est irréversible." confirmText="Supprimer" cancelText="Annuler" variant="danger" />
      <Drawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} title={editingParentId ? 'Modifier le parent' : 'Nouveau parent'}><ParentForm onClose={handleCloseDrawer} parentId={editingParentId} /></Drawer>
    </div>
  );
}
