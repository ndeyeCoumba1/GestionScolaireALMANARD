import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { Depense } from '../../Types/index';
import PageHeader from '../../components/Common/PageHeader';
import { SkeletonTable } from '../../components/Common/SkeletonLoader';
import { ConfirmModal } from '../../components/Common/ConfirmModal';
import Drawer from '../../components/Common/Drawer';
import DepenseForm from './DepenseForm';
import { useAuth } from '../../Context/AuthContext';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
      const mappedData = res.data.map((item: any) => ({
        id: item.id,
        typeDepense: item.typeDepense,
        description: item.description,
        montant: item.montant,
        dateDepense: item.dateDepense,
        moisLibelle: item.moisLibelle || item.mois?.libelle || '',
        moisId: item.moisId || item.mois?.id,
      }));
      setDepenses(mappedData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDepenseToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!depenseToDelete) return;
    try {
      await api.delete(`/depenses/${depenseToDelete}`);
      fetchDepenses();
    } finally {
      setShowDeleteModal(false);
      setDepenseToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDepenseToDelete(null);
  };

  const handleOpenDrawer = (depenseId?: number) => {
    setEditingDepenseId(depenseId);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingDepenseId(undefined);
    fetchDepenses();
  };

  const filtered = depenses.filter(d =>
    `${d.typeDepense} ${d.description || ''} ${d.moisLibelle || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate chart data
  const totalMontant = depenses.reduce((sum, d) => sum + (d.montant || 0), 0);

  const typeDepenseData = depenses.reduce((acc: { [key: string]: number }, d) => {
    const type = d.typeDepense || 'Autre';
    acc[type] = (acc[type] || 0) + (d.montant || 0);
    return acc;
  }, {});

  const typeDepenseChartData = Object.entries(typeDepenseData).map(([name, value]) => ({ name, value }));

  const COLORS = ['#1a5c38', '#0f9d58', '#10b981', '#34d399', '#6ee7b7', '#d97706', '#db2777'];

  return (
    <div className="d-flex flex-column gap-4">

      {/* ── Header ── */}
      <PageHeader
        subtitle="Gestion des dépenses"
        title="Dépenses"
        description="Consultez les dépenses enregistrées et ajoutez rapidement de nouvelles sorties de fonds."
        countText={`${depenses.length} dépense(s) enregistrée(s)`}
        action={
          role !== 'COMPTABLE' && (
            <button
              onClick={() => handleOpenDrawer()}
              className="btn fw-semibold d-flex align-items-center gap-2 px-4 py-2"
              style={{ backgroundColor: '#fff', color: '#1a5c38', borderRadius: 12, fontSize: 14 }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
              Nouvelle Dépense
            </button>
          )
        }
      />

      {/* ── Statistics Card ── */}
      <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0' }}>
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 56, height: 56, backgroundColor: '#fee2e2', fontSize: 28 }}>
            💸
          </div>
          <div>
            <p className="text-muted mb-0" style={{ fontSize: 13, fontWeight: 500 }}>Total des Dépenses</p>
            <p className="fw-bold mb-0" style={{ fontSize: 28, color: '#dc2626' }}>{totalMontant.toLocaleString('fr-FR')} FCFA</p>
          </div>
        </div>
      </div>

      {/* ── Charts Section ── */}
      <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0' }}>
        <p className="fw-semibold mb-4" style={{ fontSize: 15, color: '#111827' }}>Répartition des Dépenses par Type</p>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={typeDepenseChartData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={5}
              dataKey="value"
            >
              {typeDepenseChartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}
              itemStyle={{ color: '#374151' }}
              formatter={(value: number) => `${value.toLocaleString('fr-FR')} FCFA`}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white rounded-4 shadow-sm overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
        <div className="px-4 pt-4 pb-3">
          <p className="fw-semibold text-dark mb-3" style={{ fontSize: 15 }}>Liste des dépenses</p>
          <div className="position-relative">
            <span className="position-absolute top-50 translate-middle-y text-muted" style={{ left: 14, pointerEvents: 'none' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Rechercher une dépense..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-control"
              style={{ paddingLeft: 38, paddingTop: 10, paddingBottom: 10, borderRadius: 12, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: 14, boxShadow: 'none' }}
            />
          </div>
        </div>

        <div className="table-responsive">
          {loading ? (
            <SkeletonTable rows={5} columns={6} />
          ) : (
            <table className="table align-middle mb-0" style={{ fontSize: 14 }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  {['Type', 'Description', 'Mois', 'Montant', 'Date', 'Actions'].map(h => (
                    <th key={h} className="py-3 px-4 fw-semibold text-uppercase"
                      style={{ color: '#9ca3af', fontSize: 11, letterSpacing: '0.05em', borderTop: '1px solid #f0f0f0' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-5 text-muted">{search ? 'Aucune dépense trouvée.' : 'Aucune dépense enregistrée.'}</td></tr>
                ) : filtered.map(d => (
                <tr key={d.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                  <td className="py-3 px-4">
                    <span className="badge rounded-pill fw-medium" style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: 12, padding: '5px 10px' }}>{d.typeDepense}</span>
                  </td>
                  <td className="py-3 px-4" style={{ color: '#374151' }}>{d.description || '—'}</td>
                  <td className="py-3 px-4" style={{ color: '#6b7280' }}>{d.moisLibelle || '—'}</td>
                  <td className="py-3 px-4 fw-semibold" style={{ color: '#166534' }}>{d.montant?.toLocaleString()} FCFA</td>
                  <td className="py-3 px-4" style={{ color: '#6b7280' }}>{d.dateDepense}</td>
                  <td className="py-3 px-4">
                    <div className="d-flex align-items-center gap-2">
                      {role !== 'COMPTABLE' && (
                        <>
                          <button
                            onClick={() => handleOpenDrawer(d.id)}
                            title="Modifier"
                            className="btn btn-sm d-flex align-items-center justify-content-center"
                            style={{ width: 32, height: 32, padding: 0, borderRadius: 8, border: '1px solid #16a34a', backgroundColor: '#f0faf4', color: '#16a34a' }}
                            onMouseEnter={ev => { const b = ev.currentTarget; b.style.backgroundColor='#16a34a'; b.style.color='#fff'; }}
                            onMouseLeave={ev => { const b = ev.currentTarget; b.style.backgroundColor='#f0faf4'; b.style.color='#16a34a'; }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 0110 16.414H8v-2a2 2 0 01.586-1.414z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(d.id)}
                            title="Supprimer"
                            className="btn btn-sm d-flex align-items-center justify-content-center"
                            style={{ width: 32, height: 32, padding: 0, borderRadius: 8, border: '1px solid #ef4444', backgroundColor: '#fef2f2', color: '#ef4444' }}
                            onMouseEnter={ev => { const b = ev.currentTarget; b.style.backgroundColor='#ef4444'; b.style.color='#fff'; }}
                            onMouseLeave={ev => { const b = ev.currentTarget; b.style.backgroundColor='#fef2f2'; b.style.color='#ef4444'; }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 01-1-1V5a1 1 0 011-1h6a1 1 0 011 1v1a1 1 0 01-1 1H9z"/>
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="text-center py-3" style={{ borderTop: '1px solid #f3f4f6', fontSize: 12, color: '#d1d5db' }}>
          © 2026 Al-Manard3s — Tous droits réservés
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Supprimer la dépense"
        message="Êtes-vous sûr de vouloir supprimer cette dépense ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />

      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={editingDepenseId ? 'Modifier la dépense' : 'Nouvelle dépense'}
      >
        <DepenseForm onClose={handleCloseDrawer} depenseId={editingDepenseId} />
      </Drawer>
    </div>
  );
}