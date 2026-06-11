import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { Annee } from '../../Types/index';
import { SkeletonTable } from '../../components/Common/SkeletonLoader';
import { ConfirmModal } from '../../components/Common/ConfirmModal';
import Drawer from '../../components/Common/Drawer';
import AnneeForm from './AnneeForm';
import { PageBanner, BannerBtn, KpiCard, SearchBar, TableHead, TableFooter, EmptyState, ROW_STYLE, TD } from '../../components/Common/ListLayout';

export default function AnneeList() {
  const [annees, setAnnees] = useState<Annee[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [anneeToDelete, setAnneeToDelete] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingAnneeId, setEditingAnneeId] = useState<number | undefined>();

  useEffect(() => { fetchAnnees(); }, []);

  const fetchAnnees = async () => {
    setLoading(true);
    try { const res = await api.get('/annees'); setAnnees(res.data); }
    catch {} finally { setLoading(false); }
  };

  const handleDelete  = (id: number) => { setAnneeToDelete(id); setShowDeleteModal(true); };
  const confirmDelete = async () => {
    if (!anneeToDelete) return; setDeletingId(anneeToDelete);
    try { await api.delete(`/annees/${anneeToDelete}`); await fetchAnnees(); }
    catch {} finally { setDeletingId(null); setShowDeleteModal(false); setAnneeToDelete(null); }
  };
  const handleOpenDrawer  = (id?: number) => { setEditingAnneeId(id); setIsDrawerOpen(true); };
  const handleCloseDrawer = () => { setIsDrawerOpen(false); setEditingAnneeId(undefined); fetchAnnees(); };

  const filtered = annees.filter(a => a.libelle.toLowerCase().includes(search.toLowerCase()) || a.id.toString().includes(search));
  const actives  = annees.filter(a => a.actif).length;

  return (
    <div className="d-flex flex-column gap-4" style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>

      <PageBanner icon="📅" subtitle="Portail Français — Configuration" title="Années scolaires"
        count={`${annees.length} année${annees.length !== 1 ? 's' : ''} enregistrée${annees.length !== 1 ? 's' : ''}`}
        gradient="linear-gradient(135deg, #5b21b6 0%, #7c3aed 60%, #6d28d9 100%)"
        action={<BannerBtn label="Nouvelle Année" onClick={() => handleOpenDrawer()} />} />

      <div className="row g-3">
        <KpiCard icon="📅" label="Total années"   value={annees.length} sub="années scolaires" accent="#7c3aed" bg="#f5f3ff" borderLeft="#8b5cf6" />
        <KpiCard icon="✅" label="Actives"          value={actives}       sub="années en cours" accent="#0A6E3F" bg="#f0fdf4" borderLeft="#22c55e" />
        <KpiCard icon="📁" label="Archivées"        value={annees.length - actives} sub="années terminées" accent="#6b7280" bg="#f9fafb" borderLeft="#9ca3af" />
        <KpiCard icon="🔍" label="Résultats"        value={filtered.length} sub="dans la sélection" accent="#d97706" bg="#fffbeb" borderLeft="#f59e0b" />
      </div>

      <div className="bg-white rounded-4 shadow-sm overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
        <div style={{ padding: '20px 24px 0' }}>
          <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap mb-4">
            <SearchBar value={search} onChange={setSearch} placeholder="Rechercher une année scolaire…" width={280} />
            <span style={{ fontSize: 12, color: '#6b7280' }}><span style={{ fontWeight: 700, color: '#111827' }}>{filtered.length}</span> résultat{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div style={{ padding: '0 24px 24px' }}><SkeletonTable rows={5} columns={5} /></div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <TableHead cols={[{ label: 'Libellé' }, { label: 'Date début' }, { label: 'Date fin' }, { label: 'Statut' }, { label: 'Actions' }]} />
              <tbody>
                {filtered.length === 0 ? (
                  <EmptyState icon="📅" title={search ? 'Aucune année trouvée' : 'Aucune année enregistrée'} sub={search ? `Aucune année ne correspond à « ${search} »` : undefined} />
                ) : filtered.map(a => (
                  <tr key={a.id} style={ROW_STYLE} onMouseEnter={ev => (ev.currentTarget.style.backgroundColor = '#fafafa')} onMouseLeave={ev => (ev.currentTarget.style.backgroundColor = 'transparent')}>
                    <td style={TD}>
                      <span style={{ fontWeight: 700, color: '#111827', fontSize: 13 }}>{a.libelle}</span>
                    </td>
                    <td style={{ ...TD, color: '#374151', fontSize: 12 }}>
                      {a.dateDebut ? new Date(a.dateDebut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td style={{ ...TD, color: '#374151', fontSize: 12 }}>
                      {a.dateFin ? new Date(a.dateFin).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td style={TD}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: a.actif ? '#f0fdf4' : '#f9fafb', color: a.actif ? '#16a34a' : '#6b7280', border: `1px solid ${a.actif ? '#bbf7d0' : '#e5e7eb'}`, borderRadius: 20, padding: '4px 11px', fontSize: 11, fontWeight: 600 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: a.actif ? '#22c55e' : '#9ca3af', flexShrink: 0 }} />
                        {a.actif ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={TD}>
                      <div className="d-flex align-items-center gap-1">
                        <button onClick={() => handleOpenDrawer(a.id)} title="Modifier" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #bbf7d0', backgroundColor: '#f0fdf4', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 0110 16.414H8v-2a2 2 0 01.586-1.414z"/></svg>
                        </button>
                        <button onClick={() => handleDelete(a.id)} disabled={deletingId === a.id} title="Supprimer" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #fecaca', backgroundColor: '#fef2f2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: deletingId === a.id ? 0.4 : 1 }}>
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
        <TableFooter right={`${filtered.length} / ${annees.length} années`} />
      </div>

      <ConfirmModal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setAnneeToDelete(null); }} onConfirm={confirmDelete} title="Supprimer l'année scolaire" message="Êtes-vous sûr de vouloir supprimer cette année scolaire ? Cette action est irréversible." confirmText="Supprimer" cancelText="Annuler" variant="danger" />
      <Drawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} title={editingAnneeId ? "Modifier l'année scolaire" : 'Nouvelle année scolaire'}>
        <AnneeForm onClose={handleCloseDrawer} anneeId={editingAnneeId} />
      </Drawer>
    </div>
  );
}
