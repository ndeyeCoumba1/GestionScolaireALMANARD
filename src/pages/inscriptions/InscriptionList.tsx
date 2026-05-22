import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { Inscription } from '../../Types/index';
import PageHeader from '../../components/Common/PageHeader';
import { SkeletonTable } from '../../components/Common/SkeletonLoader';
import { ConfirmModal } from '../../components/Common/ConfirmModal';
import Drawer from '../../components/Common/Drawer';
import InscriptionForm from './InscriptionForm';

export default function InscriptionList() {
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [inscriptionToDelete, setInscriptionToDelete] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingInscriptionId, setEditingInscriptionId] = useState<number | undefined>();

  useEffect(() => {
    fetchInscriptions();
  }, []);

  const fetchInscriptions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inscription');
      const mappedData = res.data.map((item: any) => ({
        id: item.id,
        dateInscription: item.dateInscription,
        fraisInscription: item.fraisInscription,
        eleveNom: item.eleve?.nom || '',
        elevePrenom: item.eleve?.prenom || '',
        anneeLibelle: item.annee?.libelle || '',
        classeNiveau: item.classe?.niveau || '',
      }));
      setInscriptions(mappedData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setInscriptionToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!inscriptionToDelete) return;
    setDeletingId(inscriptionToDelete);
    try {
      await api.delete(`/inscription/${inscriptionToDelete}`);
      await fetchInscriptions();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
      setInscriptionToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setInscriptionToDelete(null);
  };

  const handleOpenDrawer = (inscriptionId?: number) => {
    setEditingInscriptionId(inscriptionId);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingInscriptionId(undefined);
    fetchInscriptions();
  };

  const filtered = inscriptions.filter(i =>
    `${i.eleveNom} ${i.elevePrenom} ${i.classeNiveau}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="d-flex flex-column gap-4">

      {/* ── Header ── */}
      <PageHeader
        subtitle="Gestion des inscriptions"
        title="📋 Inscriptions"
        description="Consultez et gérez la liste des inscriptions des élèves dans votre établissement."
        countText={`${inscriptions.length} inscription(s) au total`}
        action={
          <button
            onClick={() => handleOpenDrawer()}
            className="btn fw-semibold d-flex align-items-center gap-2 px-4 py-2"
            style={{ backgroundColor: '#fff', color: '#1a5c38', borderRadius: 12, fontSize: 14 }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
            Nouvelle Inscription
          </button>
        }
      />

      {/* ── Table Card ── */}
      <div className="bg-white rounded-4 shadow-sm overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
        <div className="px-4 pt-4 pb-3">
          <p className="fw-semibold text-dark mb-3" style={{ fontSize: 15 }}>Liste des inscriptions</p>
          <div className="position-relative">
            <span className="position-absolute top-50 translate-middle-y text-muted" style={{ left: 14, pointerEvents: 'none' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
              </svg>
            </span>
            <input
              id="inscription-search"
              type="text"
              placeholder="Rechercher une inscription..."
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
                  {['Élève', 'Classe', 'Année', 'Date', 'Frais', 'Actions'].map(h => (
                    <th key={h} className="py-3 px-4 fw-semibold text-uppercase"
                      style={{ color: '#9ca3af', fontSize: 11, letterSpacing: '0.05em', borderTop: '1px solid #f0f0f0' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-5 text-muted">{search ? 'Aucune inscription trouvée.' : 'Aucune inscription enregistrée.'}</td></tr>
                ) : filtered.map(i => (
                <tr key={i.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                  <td className="py-3 px-4 fw-semibold" style={{ color: '#111827' }}>{i.eleveNom} {i.elevePrenom}</td>
                  <td className="py-3 px-4">
                    <span className="badge rounded-pill fw-medium" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', fontSize: 12, padding: '5px 10px' }}>{i.classeNiveau}</span>
                  </td>
                  <td className="py-3 px-4" style={{ color: '#374151' }}>{i.anneeLibelle}</td>
                  <td className="py-3 px-4" style={{ color: '#9ca3af' }}>{i.dateInscription}</td>
                  <td className="py-3 px-4 fw-semibold" style={{ color: '#0f9d58' }}>{i.fraisInscription?.toLocaleString()} FCFA</td>
                  <td className="py-3 px-4">
                    <div className="d-flex align-items-center gap-2">
                      <button
                        onClick={() => handleOpenDrawer(i.id)}
                        title="Modifier"
                        className="btn btn-sm d-flex align-items-center justify-content-center"
                        style={{ width: 32, height: 32, padding: 0, borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#9ca3af' }}
                        onMouseEnter={ev => { const b = ev.currentTarget; b.style.color='#1a5c38'; b.style.backgroundColor='#e8f5e9'; b.style.borderColor='#c8e6c9'; }}
                        onMouseLeave={ev => { const b = ev.currentTarget; b.style.color='#9ca3af'; b.style.backgroundColor='#fff'; b.style.borderColor='#e5e7eb'; }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(i.id)}
                        disabled={deletingId === i.id}
                        title="Supprimer"
                        className="btn btn-sm d-flex align-items-center justify-content-center"
                        style={{ width: 32, height: 32, padding: 0, borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#9ca3af', opacity: deletingId === i.id ? 0.4 : 1 }}
                        onMouseEnter={ev => { const b = ev.currentTarget; b.style.color='#ef4444'; b.style.backgroundColor='#fef2f2'; b.style.borderColor='#fecaca'; }}
                        onMouseLeave={ev => { const b = ev.currentTarget; b.style.color='#9ca3af'; b.style.backgroundColor='#fff'; b.style.borderColor='#e5e7eb'; }}
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
        title="Supprimer l'inscription"
        message="Êtes-vous sûr de vouloir supprimer cette inscription ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />

      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={editingInscriptionId ? 'Modifier l\'inscription' : 'Nouvelle inscription'}
      >
        <InscriptionForm onClose={handleCloseDrawer} inscriptionId={editingInscriptionId} />
      </Drawer>
    </div>
  );
}