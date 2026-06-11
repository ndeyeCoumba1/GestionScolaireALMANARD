import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { Inscription } from '../../Types/index';
import { SkeletonTable } from '../../components/Common/SkeletonLoader';
import { ConfirmModal } from '../../components/Common/ConfirmModal';
import Drawer from '../../components/Common/Drawer';
import InscriptionForm from './InscriptionForm';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PageBanner, BannerBtn, KpiCard, SearchBar, TableHead, TableFooter, EmptyState, ROW_STYLE, TD, avatarColor, initials } from '../../components/Common/ListLayout';

export default function InscriptionList() {
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [inscriptionToDelete, setInscriptionToDelete] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingInscriptionId, setEditingInscriptionId] = useState<number | undefined>();

  useEffect(() => { fetchInscriptions(); }, []);

  const fetchInscriptions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inscriptions');
      setInscriptions(res.data.map((item: any) => ({
        id: item.id, dateInscription: item.dateInscription, fraisInscription: item.fraisInscription,
        eleveNom: item.eleve?.nom || '', elevePrenom: item.eleve?.prenom || '',
        anneeLibelle: item.annee?.libelle || '', classeNiveau: item.classe?.niveau || '',
      })));
    } catch {} finally { setLoading(false); }
  };

  const handleDelete  = (id: number) => { setInscriptionToDelete(id); setShowDeleteModal(true); };
  const confirmDelete = async () => {
    if (!inscriptionToDelete) return; setDeletingId(inscriptionToDelete);
    try { await api.delete(`/inscriptions/${inscriptionToDelete}`); await fetchInscriptions(); }
    catch {} finally { setDeletingId(null); setShowDeleteModal(false); setInscriptionToDelete(null); }
  };
  const handleOpenDrawer  = (id?: number) => { setEditingInscriptionId(id); setIsDrawerOpen(true); };
  const handleCloseDrawer = () => { setIsDrawerOpen(false); setEditingInscriptionId(undefined); fetchInscriptions(); };

  const filtered    = inscriptions.filter(i => `${i.eleveNom} ${i.elevePrenom} ${i.classeNiveau}`.toLowerCase().includes(search.toLowerCase()));
  const totalFrais  = inscriptions.reduce((s, i) => s + (i.fraisInscription || 0), 0);
  const classes     = new Set(inscriptions.map(i => i.classeNiveau).filter(Boolean)).size;
  const annees      = new Set(inscriptions.map(i => i.anneeLibelle).filter(Boolean)).size;

  const classeData = Object.entries(
    inscriptions.reduce((acc: Record<string, number>, i) => { const k = i.classeNiveau || 'Non défini'; acc[k] = (acc[k] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="d-flex flex-column gap-4" style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>

      <PageBanner icon="📋" subtitle="Portail Français — Scolarité" title="Inscriptions"
        count={`${inscriptions.length} inscription${inscriptions.length !== 1 ? 's' : ''} enregistrée${inscriptions.length !== 1 ? 's' : ''}`}
        gradient="linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 60%, #1e40af 100%)"
        action={<BannerBtn label="Nouvelle Inscription" onClick={() => handleOpenDrawer()} />} />

      <div className="row g-3">
        <KpiCard icon="📋" label="Total inscriptions" value={inscriptions.length} sub={`sur ${annees} année${annees !== 1 ? 's' : ''}`} accent="#1d4ed8" bg="#eff6ff" borderLeft="#3b82f6" />
        <KpiCard icon="💰" label="Total frais"        value={`${totalFrais.toLocaleString('fr-FR')} FCFA`} sub="frais d'inscription cumulés" accent="#0A6E3F" bg="#f0fdf4" borderLeft="#22c55e" />
        <KpiCard icon="🏫" label="Classes"            value={classes}      sub="niveaux représentés" accent="#d97706" bg="#fffbeb" borderLeft="#f59e0b" />
        <KpiCard icon="📅" label="Années"             value={annees}       sub="années scolaires" accent="#7c3aed" bg="#f5f3ff" borderLeft="#8b5cf6" />
      </div>

      <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0' }}>
        <div className="d-flex align-items-center justify-content-between mb-1">
          <p className="fw-bold mb-0" style={{ fontSize: 14, color: '#111827' }}>Inscriptions par classe</p>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>{classeData.length} classe{classeData.length !== 1 ? 's' : ''}</span>
        </div>
        <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 12 }}>Nombre d'inscriptions par niveau</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={classeData} margin={{ left: -10, right: 8 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 12 }} />
            <Bar dataKey="value" name="Inscriptions" fill="#1d4ed8" radius={[6, 6, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-4 shadow-sm overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
        <div style={{ padding: '20px 24px 0' }}>
          <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap mb-4">
            <SearchBar value={search} onChange={setSearch} placeholder="Rechercher une inscription…" width={280} />
            <span style={{ fontSize: 12, color: '#6b7280' }}><span style={{ fontWeight: 700, color: '#111827' }}>{filtered.length}</span> résultat{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div style={{ padding: '0 24px 24px' }}><SkeletonTable rows={6} columns={6} /></div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <TableHead cols={[{ label: 'Élève' }, { label: 'Classe' }, { label: 'Année' }, { label: 'Date' }, { label: 'Frais', align: 'right' }, { label: 'Actions' }]} />
              <tbody>
                {filtered.length === 0 ? (
                  <EmptyState icon="🔍" title={search ? 'Aucun résultat trouvé' : 'Aucune inscription enregistrée'} sub={search ? `Aucune inscription ne correspond à « ${search} »` : undefined} />
                ) : filtered.map(i => (
                  <tr key={i.id} style={ROW_STYLE} onMouseEnter={ev => (ev.currentTarget.style.backgroundColor = '#fafafa')} onMouseLeave={ev => (ev.currentTarget.style.backgroundColor = 'transparent')}>
                    <td style={TD}>
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, backgroundColor: avatarColor(i.id), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
                          {initials(i.eleveNom, i.elevePrenom)}
                        </div>
                        <div style={{ fontWeight: 600, color: '#111827', fontSize: 13 }}>{i.elevePrenom} {i.eleveNom}</div>
                      </div>
                    </td>
                    <td style={TD}>
                      <span style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 600 }}>{i.classeNiveau || '—'}</span>
                    </td>
                    <td style={{ ...TD, color: '#374151', fontSize: 12 }}>{i.anneeLibelle || '—'}</td>
                    <td style={{ ...TD, color: '#9ca3af', fontSize: 11 }}>
                      {i.dateInscription ? new Date(i.dateInscription).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td style={{ ...TD, textAlign: 'right', fontWeight: 700, color: '#0A6E3F', whiteSpace: 'nowrap' }}>{i.fraisInscription?.toLocaleString('fr-FR')} FCFA</td>
                    <td style={TD}>
                      <div className="d-flex align-items-center gap-1">
                        <button onClick={() => handleOpenDrawer(i.id)} title="Modifier" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #bbf7d0', backgroundColor: '#f0fdf4', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 0110 16.414H8v-2a2 2 0 01.586-1.414z"/></svg>
                        </button>
                        <button onClick={() => handleDelete(i.id)} disabled={deletingId === i.id} title="Supprimer" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #fecaca', backgroundColor: '#fef2f2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: deletingId === i.id ? 0.4 : 1 }}>
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
        <TableFooter right={`${filtered.length} / ${inscriptions.length} inscriptions`} />
      </div>

      <ConfirmModal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setInscriptionToDelete(null); }} onConfirm={confirmDelete} title="Supprimer l'inscription" message="Êtes-vous sûr de vouloir supprimer cette inscription ? Cette action est irréversible." confirmText="Supprimer" cancelText="Annuler" variant="danger" />
      <Drawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} title={editingInscriptionId ? "Modifier l'inscription" : 'Nouvelle inscription'}><InscriptionForm onClose={handleCloseDrawer} inscriptionId={editingInscriptionId} /></Drawer>
    </div>
  );
}
