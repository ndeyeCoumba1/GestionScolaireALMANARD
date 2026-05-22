import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { Paiement } from '../../Types/index';
import PageHeader from '../../components/Common/PageHeader';
import { SkeletonTable } from '../../components/Common/SkeletonLoader';
import { ConfirmModal } from '../../components/Common/ConfirmModal';
import Drawer from '../../components/Common/Drawer';
import PaiementForm from './PaiementForm';
import { generatePaymentListReport, exportPaymentsToExcel, generateReceipt } from '../../utils/exportUtils';

export default function PaiementList() {
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paiementToDelete, setPaiementToDelete] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPaiementId, setEditingPaiementId] = useState<number | undefined>();

  useEffect(() => { fetchPaiements(); }, []);

  const fetchPaiements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/paiements');
      const mappedData = res.data.map((item: any) => ({
        id: item.id,
        numeroRecu: item.numeroRecu,
        montant: item.montant,
        datePaiement: item.datePaiement,
        motif: item.motif,
        statut: item.statut,
        eleveNom: item.eleve?.nom || '',
        elevePrenom: item.eleve?.prenom || '',
        moisLibelle: item.mois?.libelle || '',
        anneeLibelle: item.annee?.libelle || '',
        enregistreParNom: item.user?.nom || '',
      }));
      setPaiements(mappedData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setPaiementToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!paiementToDelete) return;
    setDeletingId(paiementToDelete);
    try {
      await api.delete(`/paiements/${paiementToDelete}`);
      await fetchPaiements();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
      setPaiementToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPaiementToDelete(null);
  };

  const handleExportPDF = () => {
    generatePaymentListReport(filtered);
  };

  const handleExportExcel = () => {
    exportPaymentsToExcel(filtered);
  };

  const handlePrintReceipt = (paiement: Paiement) => {
    generateReceipt({
      numeroRecu: paiement.numeroRecu,
      eleveNom: paiement.eleveNom,
      elevePrenom: paiement.elevePrenom,
      montant: paiement.montant,
      motif: paiement.motif,
      datePaiement: paiement.datePaiement,
      moisLibelle: paiement.moisLibelle,
    });
  };

  const handleOpenDrawer = (paiementId?: number) => {
    setEditingPaiementId(paiementId);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingPaiementId(undefined);
    fetchPaiements();
  };

  const filtered = paiements.filter(p =>
    `${p.eleveNom} ${p.elevePrenom} ${p.numeroRecu}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="d-flex flex-column gap-4">

      {/* ── Header ── */}
      <PageHeader
        subtitle="Gestion des paiements"
        title="💳 Paiements"
        description="Consultez et gérez la liste des paiements enregistrés dans votre établissement."
        countText={`${paiements.length} paiement(s) au total`}
        action={
          <button
            onClick={() => handleOpenDrawer()}
            className="btn fw-semibold d-flex align-items-center gap-2 px-4 py-2"
            style={{ backgroundColor: '#fff', color: '#1a5c38', borderRadius: 12, fontSize: 14 }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
            Nouveau Paiement
          </button>
        }
      />

      {/* ── Table Card ── */}
      <div className="bg-white rounded-4 shadow-sm overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
        <div className="px-4 pt-4 pb-3">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <p className="fw-semibold text-dark mb-0" style={{ fontSize: 15 }}>Liste des paiements</p>
            <div className="d-flex gap-2">
              <button
                onClick={handleExportPDF}
                className="btn btn-sm d-flex align-items-center gap-2"
                style={{
                  border: '1px solid #e5e7eb',
                  backgroundColor: '#fff',
                  color: '#6b7280',
                  borderRadius: 8,
                  fontSize: 13,
                  padding: '6px 12px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.color = '#1a5c38';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff';
                  e.currentTarget.style.color = '#6b7280';
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                PDF
              </button>
              <button
                onClick={handleExportExcel}
                className="btn btn-sm d-flex align-items-center gap-2"
                style={{
                  border: '1px solid #e5e7eb',
                  backgroundColor: '#fff',
                  color: '#6b7280',
                  borderRadius: 8,
                  fontSize: 13,
                  padding: '6px 12px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.color = '#1a5c38';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff';
                  e.currentTarget.style.color = '#6b7280';
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Excel
              </button>
            </div>
          </div>
          <div className="position-relative">
            <span className="position-absolute top-50 translate-middle-y text-muted" style={{ left: 14, pointerEvents: 'none' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
              </svg>
            </span>
            <input
              id="paiement-search"
              type="text"
              placeholder="Rechercher un paiement..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-control"
              style={{ paddingLeft: 38, paddingTop: 10, paddingBottom: 10, borderRadius: 12, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: 14, boxShadow: 'none' }}
            />
          </div>
        </div>

        <div className="table-responsive">
          {loading ? (
            <SkeletonTable rows={5} columns={8} />
          ) : (
            <table className="table align-middle mb-0" style={{ fontSize: 14 }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  {['Reçu', 'Élève', 'Mois', 'Motif', 'Montant', 'Statut', 'Date', 'Actions'].map(h => (
                    <th key={h} className="py-3 px-4 fw-semibold text-uppercase"
                      style={{ color: '#9ca3af', fontSize: 11, letterSpacing: '0.05em', borderTop: '1px solid #f0f0f0' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-5 text-muted">{search ? 'Aucun paiement trouvé.' : 'Aucun paiement enregistré.'}</td></tr>
                ) : filtered.map(p => (
                <tr key={p.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                  <td className="py-3 px-4 font-monospace small text-muted">{p.numeroRecu}</td>
                  <td className="py-3 px-4 fw-semibold" style={{ color: '#111827' }}>{p.eleveNom} {p.elevePrenom}</td>
                  <td className="py-3 px-4" style={{ color: '#374151' }}>{p.moisLibelle || '—'}</td>
                  <td className="py-3 px-4">
                    <span className="badge rounded-pill fw-medium" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', fontSize: 12, padding: '5px 10px' }}>{p.motif}</span>
                  </td>
                  <td className="py-3 px-4 fw-semibold" style={{ color: '#0f9d58' }}>{p.montant?.toLocaleString()} FCFA</td>
                  <td className="py-3 px-4">
                    <span
                      className="badge rounded-pill fw-medium"
                      style={{
                        backgroundColor: p.statut === 'PAYE' ? '#dcfce7' : p.statut === 'EN_ATTENTE' ? '#ffedd5' : '#fee2e2',
                        color: p.statut === 'PAYE' ? '#166534' : p.statut === 'EN_ATTENTE' ? '#9a3412' : '#991b1b',
                        fontSize: 12,
                        padding: '5px 10px',
                      }}
                    >
                      {p.statut}
                    </span>
                  </td>
                  <td className="py-3 px-4" style={{ color: '#9ca3af' }}>{p.datePaiement}</td>
                  <td className="py-3 px-4">
                    <div className="d-flex align-items-center gap-2">
                      <button
                        onClick={() => handlePrintReceipt(p)}
                        title="Imprimer reçu"
                        className="btn btn-sm d-flex align-items-center justify-content-center"
                        style={{ width: 32, height: 32, padding: 0, borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#9ca3af' }}
                        onMouseEnter={ev => { const b = ev.currentTarget; b.style.color='#3b82f6'; b.style.backgroundColor='#eff6ff'; b.style.borderColor='#bfdbfe'; }}
                        onMouseLeave={ev => { const b = ev.currentTarget; b.style.color='#9ca3af'; b.style.backgroundColor='#fff'; b.style.borderColor='#e5e7eb'; }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleOpenDrawer(p.id)}
                        title="Modifier"
                        className="btn btn-sm d-flex align-items-center justify-content-center"
                        style={{ width: 32, height: 32, padding: 0, borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#9ca3af' }}
                        onMouseEnter={ev => { const b = ev.currentTarget; b.style.color='#16a34a'; b.style.backgroundColor='#f0faf4'; b.style.borderColor='#bbf7d0'; }}
                        onMouseLeave={ev => { const b = ev.currentTarget; b.style.color='#9ca3af'; b.style.backgroundColor='#fff'; b.style.borderColor='#e5e7eb'; }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 0110 16.414H8v-2a2 2 0 01.586-1.414z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deletingId === p.id}
                        title="Supprimer"
                        className="btn btn-sm d-flex align-items-center justify-content-center"
                        style={{ width: 32, height: 32, padding: 0, borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#9ca3af', opacity: deletingId === p.id ? 0.4 : 1 }}
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
        title="Supprimer le paiement"
        message="Êtes-vous sûr de vouloir supprimer ce paiement ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />

      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={editingPaiementId ? 'Modifier le paiement' : 'Nouveau paiement'}
      >
        <PaiementForm onClose={handleCloseDrawer} paiementId={editingPaiementId} />
      </Drawer>
    </div>
  );
}