import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { Annee } from '../../Types/index';
import PageHeader from '../../components/Common/PageHeader';
import { SkeletonTable } from '../../components/Common/SkeletonLoader';
import { ConfirmModal } from '../../components/Common/ConfirmModal';
import Drawer from '../../components/Common/Drawer';
import AnneeForm from './AnneeForm';

export default function AnneeList() {
  const [annees, setAnnees] = useState<Annee[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [anneeToDelete, setAnneeToDelete] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingAnneeId, setEditingAnneeId] = useState<number | undefined>();

  useEffect(() => {
    fetchAnnees();
  }, []);

  const fetchAnnees = async () => {
    setLoading(true);
    try {
      const res = await api.get('/annees');
      setAnnees(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setAnneeToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!anneeToDelete) return;
    setDeletingId(anneeToDelete);
    try {
      await api.delete(`/annees/${anneeToDelete}`);
      await fetchAnnees();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
      setAnneeToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setAnneeToDelete(null);
  };

  const handleOpenDrawer = (anneeId?: number) => {
    setEditingAnneeId(anneeId);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingAnneeId(undefined);
    fetchAnnees();
  };

  const filtered = annees.filter(a =>
    a.libelle.toLowerCase().includes(search.toLowerCase()) ||
    a.id.toString().includes(search)
  );

  return (
    <div className="d-flex flex-column gap-4">

      {/* ── Header ── */}
      <PageHeader
        subtitle="Gestion des années scolaires"
        title="Années"
        description="Consultez et gérez les années scolaires de votre établissement."
        countText={`${annees.length} année(s) enregistrée(s)`}
        action={
          <button
            onClick={() => handleOpenDrawer()}
            className="btn fw-semibold d-flex align-items-center gap-2 px-4 py-2"
            style={{ backgroundColor: '#fff', color: '#1a5c38', borderRadius: 12, fontSize: 14 }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
            Nouvelle Année
          </button>
        }
      />

      {/* ── Recherche ── */}
      <div className="bg-white rounded-4 shadow-sm overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
        <div className="px-4 pt-4 pb-3">
          <p className="fw-semibold text-dark mb-3" style={{ fontSize: 15 }}>Liste des années scolaires</p>
          <div className="position-relative">
            <span className="position-absolute top-50 translate-middle-y text-muted" style={{ left: 14, pointerEvents: 'none' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
              </svg>
            </span>
            <input
              id="annee-search"
              type="text"
              placeholder="Rechercher une année..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-control"
              style={{ paddingLeft: 38, paddingTop: 10, paddingBottom: 10, borderRadius: 12, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: 14, boxShadow: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* ── Tableau ── */}
      <div className="bg-white rounded-4 shadow-sm overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
        <div className="table-responsive">
          {loading ? (
            <SkeletonTable rows={5} columns={5} />
          ) : (
            <table className="table align-middle mb-0" style={{ fontSize: 14 }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  {['Libellé', 'Date début', 'Date fin', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="py-3 px-4 fw-semibold text-uppercase"
                      style={{ color: '#9ca3af', fontSize: 11, letterSpacing: '0.05em', borderTop: '1px solid #f0f0f0' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-5 text-muted">{search ? 'Aucune année trouvée.' : 'Aucune année enregistrée.'}</td></tr>
                ) : filtered.map(a => (
                <tr key={a.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                  <td className="py-3 px-4 fw-semibold" style={{ color: '#111827' }}>{a.libelle}</td>
                  <td className="py-3 px-4" style={{ color: '#374151' }}>{a.dateDebut}</td>
                  <td className="py-3 px-4" style={{ color: '#374151' }}>{a.dateFin}</td>
                  <td className="py-3 px-4">
                    <span className="badge rounded-pill fw-medium" style={{
                      backgroundColor: a.actif ? '#dcfce7' : '#f3f4f6',
                      color: a.actif ? '#166534' : '#6b7280',
                      fontSize: 12,
                      padding: '5px 10px'
                    }}>
                      {a.actif ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="d-flex align-items-center gap-2">
                      <button
                        onClick={() => handleOpenDrawer(a.id)}
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
                        onClick={() => handleDelete(a.id)}
                        disabled={deletingId === a.id}
                        title="Supprimer"
                        className="btn btn-sm d-flex align-items-center justify-content-center"
                        style={{ width: 32, height: 32, padding: 0, borderRadius: 8, border: '1px solid #ef4444', backgroundColor: '#fef2f2', color: '#ef4444', opacity: deletingId === a.id ? 0.4 : 1 }}
                        onMouseEnter={ev => { const b = ev.currentTarget; b.style.backgroundColor='#ef4444'; b.style.color='#fff'; }}
                        onMouseLeave={ev => { const b = ev.currentTarget; b.style.backgroundColor='#fef2f2'; b.style.color='#ef4444'; }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 01-1-1V5a1 1 0 011-1h6a1 1 0 011 1v1a1 1 0 01-1 1H9z"/>
                        </svg>
                      </button>
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
        title="Supprimer l'année scolaire"
        message="Êtes-vous sûr de vouloir supprimer cette année scolaire ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />

      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={editingAnneeId ? 'Modifier l\'année scolaire' : 'Nouvelle année scolaire'}
      >
        <AnneeForm onClose={handleCloseDrawer} anneeId={editingAnneeId} />
      </Drawer>
    </div>
  );
}
