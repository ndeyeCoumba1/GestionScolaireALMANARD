import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { Depense } from '../../Types/index';
import { SkeletonTable } from '../../components/Common/SkeletonLoader';
import { ConfirmModal } from '../../components/Common/ConfirmModal';
import Drawer from '../../components/Common/Drawer';
import DepenseForm from './DepenseForm';
import { useAuth } from '../../Context/AuthContext';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PageBanner, BannerBtn, KpiCard, SearchBar, TableHead, TableFooter, EmptyState, ROW_STYLE, TD } from '../../components/Common/ListLayout';

const COLORS = ['#0A6E3F','#1d4ed8','#7c3aed','#d97706','#dc2626','#0f766e','#db2777'];

export default function DepenseList() {
  const { role } = useAuth();
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [depenseToDelete, setDepenseToDelete] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingDepenseId, setEditingDepenseId] = useState<number | undefined>();

  useEffect(() => { fetchDepenses(); }, []);

  const fetchDepenses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/depenses');
      setDepenses(res.data.map((item: any) => ({ id: item.id, typeDepense: item.typeDepense, description: item.description, montant: item.montant, dateDepense: item.dateDepense, moisLibelle: item.moisLibelle || item.mois?.libelle || '', moisId: item.moisId || item.mois?.id })));
    } catch {} finally { setLoading(false); }
  };

  const handleDelete  = (id: number) => { setDepenseToDelete(id); setShowDeleteModal(true); };
  const confirmDelete = async () => {
    if (!depenseToDelete) return;
    try { await api.delete(`/depenses/${depenseToDelete}`); fetchDepenses(); }
    finally { setShowDeleteModal(false); setDepenseToDelete(null); }
  };
  const handleOpenDrawer  = (id?: number) => { setEditingDepenseId(id); setIsDrawerOpen(true); };
  const handleCloseDrawer = () => { setIsDrawerOpen(false); setEditingDepenseId(undefined); fetchDepenses(); };

  const filtered    = depenses.filter(d => `${d.typeDepense} ${d.description ?? ''} ${d.moisLibelle ?? ''}`.toLowerCase().includes(search.toLowerCase()));
  const totalMontant = depenses.reduce((s, d) => s + (d.montant || 0), 0);
  const typesDistincts = new Set(depenses.map(d => d.typeDepense)).size;
  const montantMoyenne = depenses.length > 0 ? Math.round(totalMontant / depenses.length) : 0;

  const typeData = Object.entries(depenses.reduce((acc: Record<string, number>, d) => { acc[d.typeDepense] = (acc[d.typeDepense] || 0) + (d.montant || 0); return acc; }, {})).map(([name, value]) => ({ name, value }));

  return (
    <div className="d-flex flex-column gap-4" style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>

      <PageBanner icon="💸" subtitle="Portail Français — Finances" title="Dépenses"
        count={`${depenses.length} dépense${depenses.length !== 1 ? 's' : ''} enregistrée${depenses.length !== 1 ? 's' : ''}`}
        gradient="linear-gradient(135deg, #991b1b 0%, #dc2626 60%, #b91c1c 100%)"
        action={role !== 'COMPTABLE' ? <BannerBtn label="Nouvelle Dépense" onClick={() => handleOpenDrawer()} /> : undefined} />

      <div className="row g-3">
        <KpiCard icon="💸" label="Total dépenses"  value={`${totalMontant.toLocaleString('fr-FR')} FCFA`} sub={`sur ${depenses.length} opération${depenses.length !== 1 ? 's' : ''}`} accent="#dc2626" bg="#fef2f2" borderLeft="#ef4444" />
        <KpiCard icon="📋" label="Nb dépenses"     value={depenses.length}      sub={`${filtered.length} affichée${filtered.length !== 1 ? 's' : ''}`} accent="#1d4ed8" bg="#eff6ff" borderLeft="#3b82f6" />
        <KpiCard icon="🏷️" label="Types distincts"  value={typesDistincts}       sub="catégories de dépenses" accent="#d97706" bg="#fffbeb" borderLeft="#f59e0b" />
        <KpiCard icon="📊" label="Moyenne / dépense" value={`${montantMoyenne.toLocaleString('fr-FR')} FCFA`} sub="par opération" accent="#0f766e" bg="#f0fdfa" borderLeft="#14b8a6" />
      </div>

      <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0' }}>
        <div className="d-flex align-items-center justify-content-between mb-1">
          <p className="fw-bold mb-0" style={{ fontSize: 14, color: '#111827' }}>Répartition par type</p>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>{typeData.length} catégories</span>
        </div>
        <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 12 }}>Montant par catégorie de dépense</p>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={typeData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
              {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 12 }} formatter={(v: any) => `${Number(v).toLocaleString('fr-FR')} FCFA`} />
            <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-4 shadow-sm overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
        <div style={{ padding: '20px 24px 0' }}>
          <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap mb-4">
            <SearchBar value={search} onChange={setSearch} placeholder="Rechercher une dépense…" width={280} />
            <span style={{ fontSize: 12, color: '#6b7280' }}><span style={{ fontWeight: 700, color: '#111827' }}>{filtered.length}</span> résultat{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div style={{ padding: '0 24px 24px' }}><SkeletonTable rows={6} columns={6} /></div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <TableHead cols={[{ label: 'Type' }, { label: 'Description' }, { label: 'Mois' }, { label: 'Montant', align: 'right' }, { label: 'Date' }, { label: 'Actions' }]} />
              <tbody>
                {filtered.length === 0 ? (
                  <EmptyState icon="🔍" title={search ? 'Aucun résultat trouvé' : 'Aucune dépense enregistrée'} />
                ) : filtered.map((d, idx) => (
                  <tr key={d.id} style={ROW_STYLE} onMouseEnter={ev => (ev.currentTarget.style.backgroundColor = '#fafafa')} onMouseLeave={ev => (ev.currentTarget.style.backgroundColor = 'transparent')}>
                    <td style={TD}>
                      <span style={{ backgroundColor: COLORS[idx % COLORS.length] + '18', color: COLORS[idx % COLORS.length], borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 600 }}>
                        {d.typeDepense.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ ...TD, color: '#374151', fontSize: 12 }}>{d.description || '—'}</td>
                    <td style={{ ...TD, color: '#6b7280', fontSize: 12 }}>{d.moisLibelle || '—'}</td>
                    <td style={{ ...TD, textAlign: 'right', fontWeight: 700, color: '#dc2626', whiteSpace: 'nowrap' }}>{d.montant?.toLocaleString('fr-FR')} FCFA</td>
                    <td style={{ ...TD, color: '#9ca3af', fontSize: 11, whiteSpace: 'nowrap' }}>
                      {d.dateDepense ? new Date(d.dateDepense).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td style={TD}>
                      {role !== 'COMPTABLE' && (
                        <div className="d-flex align-items-center gap-1">
                          <button onClick={() => handleOpenDrawer(d.id)} title="Modifier" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #bbf7d0', backgroundColor: '#f0fdf4', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 0110 16.414H8v-2a2 2 0 01.586-1.414z"/></svg>
                          </button>
                          <button onClick={() => handleDelete(d.id)} title="Supprimer" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #fecaca', backgroundColor: '#fef2f2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 01-1-1V5a1 1 0 011-1h6a1 1 0 011 1v1a1 1 0 01-1 1H9z"/></svg>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <TableFooter right={`${filtered.length} / ${depenses.length} dépenses`} />
      </div>

      <ConfirmModal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDepenseToDelete(null); }} onConfirm={confirmDelete} title="Supprimer la dépense" message="Êtes-vous sûr de vouloir supprimer cette dépense ? Cette action est irréversible." confirmText="Supprimer" cancelText="Annuler" variant="danger" />
      <Drawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} title={editingDepenseId ? 'Modifier la dépense' : 'Nouvelle dépense'}><DepenseForm onClose={handleCloseDrawer} depenseId={editingDepenseId} /></Drawer>
    </div>
  );
}
