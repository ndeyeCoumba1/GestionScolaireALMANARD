import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { Inscription } from '../../Types/index';
import { SkeletonTable } from '../../components/Common/SkeletonLoader';
import { ConfirmModal } from '../../components/Common/ConfirmModal';
import Drawer from '../../components/Common/Drawer';
import InscriptionForm from './InscriptionForm';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PageBanner, BannerBtn, KpiCard, SearchBar, TableHead, TableFooter, EmptyState, ROW_STYLE, TD, avatarColor, initials } from '../../components/Common/ListLayout';
import { generateInscriptionListReport, exportInscriptionsToExcel } from '../../utils/exportUtils';

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

  /* ─── Rapport périodique ─── */
  const [rPeriode, setRPeriode] = useState<'journalier' | 'hebdomadaire' | 'mensuel'>('journalier');
  const [rDate, setRDate]       = useState(new Date().toISOString().split('T')[0]);
  const [rDebut, setRDebut]     = useState(new Date().toISOString().split('T')[0]);
  const [rFin, setRFin]         = useState(new Date().toISOString().split('T')[0]);
  const [rMonth, setRMonth]     = useState(new Date().toISOString().slice(0, 7));

  const rRange = (() => {
    if (rPeriode === 'journalier') return { debut: rDate, fin: rDate };
    if (rPeriode === 'hebdomadaire') return { debut: rDebut, fin: rFin };
    const [y, m] = rMonth.split('-').map(Number);
    return { debut: `${y}-${String(m).padStart(2,'0')}-01`, fin: `${y}-${String(m).padStart(2,'0')}-${new Date(y,m,0).getDate()}` };
  })();

  const rInscriptions = inscriptions.filter(i => {
    if (!i.dateInscription) return false;
    const dt = i.dateInscription.slice(0, 10);
    return dt >= rRange.debut && dt <= rRange.fin;
  });

  const rLabel = rPeriode === 'journalier'
    ? new Date(rDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    : rPeriode === 'hebdomadaire'
    ? `${new Date(rDebut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} – ${new Date(rFin).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}`
    : new Date(rMonth + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const rTotalFrais = rInscriptions.reduce((s, i) => s + (i.fraisInscription || 0), 0);
  const rClasses    = new Set(rInscriptions.map(i => i.classeNiveau).filter(Boolean)).size;
  const rAnnees     = new Set(rInscriptions.map(i => i.anneeLibelle).filter(Boolean)).size;


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

      {/* ═══ RAPPORT PÉRIODIQUE ═══ */}
      <div className="bg-white rounded-4 shadow-sm" style={{ border: '1px solid #f0f0f0', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(90deg, #eff6ff 0%, #fff 100%)', padding: '16px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 4, height: 22, backgroundColor: '#1d4ed8', borderRadius: 2 }} />
          <span style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>📊 Rapport Périodique</span>
          <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 4 }}>— Journalier, Hebdomadaire ou Mensuel</span>
        </div>
        <div style={{ padding: '20px 24px' }}>
          {/* Tabs */}
          <div className="d-flex gap-2 mb-4" style={{ backgroundColor: '#f1f5f9', padding: 4, borderRadius: 12, width: 'fit-content' }}>
            {(['journalier', 'hebdomadaire', 'mensuel'] as const).map(p => (
              <button key={p} onClick={() => setRPeriode(p)}
                style={{ border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  backgroundColor: rPeriode === p ? '#fff' : 'transparent',
                  color: rPeriode === p ? '#1d4ed8' : '#6b7280',
                  boxShadow: rPeriode === p ? '0 1px 6px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s' }}>
                {p === 'journalier' ? '📅 Journalier' : p === 'hebdomadaire' ? '📆 Hebdomadaire' : '🗓️ Mensuel'}
              </button>
            ))}
          </div>
          {/* Sélecteurs */}
          <div className="d-flex align-items-end gap-3 flex-wrap mb-4">
            {rPeriode === 'journalier' && (
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Date</label>
                <input type="date" value={rDate} onChange={e => setRDate(e.target.value)} style={{ borderRadius: 8, border: '1.5px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: 13, padding: '8px 12px', outline: 'none' }} />
              </div>
            )}
            {rPeriode === 'hebdomadaire' && (<>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>📅 Date début</label>
                <input type="date" value={rDebut} onChange={e => { setRDebut(e.target.value); if (e.target.value > rFin) setRFin(e.target.value); }} style={{ borderRadius: 8, border: '1.5px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: 13, padding: '8px 12px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>📅 Date fin</label>
                <input type="date" value={rFin} min={rDebut} onChange={e => setRFin(e.target.value)} style={{ borderRadius: 8, border: '1.5px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: 13, padding: '8px 12px', outline: 'none' }} />
              </div>
            </>)}
            {rPeriode === 'mensuel' && (
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Mois</label>
                <input type="month" value={rMonth} onChange={e => setRMonth(e.target.value)} style={{ borderRadius: 8, border: '1.5px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: 13, padding: '8px 12px', outline: 'none' }} />
              </div>
            )}
            <div className="d-flex gap-2 ms-auto">
              <button onClick={() => generateInscriptionListReport(rInscriptions)} disabled={rInscriptions.length === 0}
                style={{ borderRadius: 9, border: '1.5px solid #bfdbfe', backgroundColor: '#eff6ff', padding: '9px 18px', fontSize: 13, fontWeight: 600, color: '#1d4ed8', cursor: rInscriptions.length === 0 ? 'not-allowed' : 'pointer', opacity: rInscriptions.length === 0 ? 0.5 : 1 }}>
                📄 Exporter PDF
              </button>
              <button onClick={() => exportInscriptionsToExcel(rInscriptions)} disabled={rInscriptions.length === 0}
                style={{ borderRadius: 9, border: '1.5px solid #93c5fd', backgroundColor: '#dbeafe', padding: '9px 18px', fontSize: 13, fontWeight: 600, color: '#1e40af', cursor: rInscriptions.length === 0 ? 'not-allowed' : 'pointer', opacity: rInscriptions.length === 0 ? 0.5 : 1 }}>
                📊 Exporter Excel
              </button>
            </div>
          </div>
          {/* Label période */}
          <div className="d-flex align-items-center gap-3 mb-4">
            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '6px 14px', fontSize: 12, color: '#1d4ed8', fontWeight: 600 }}>
              {rPeriode === 'journalier' ? '📅' : rPeriode === 'hebdomadaire' ? '📆' : '🗓️'} {rLabel}
            </div>
            <span style={{ fontSize: 12, color: '#6b7280' }}>
              <span style={{ fontWeight: 700, color: '#111827' }}>{rInscriptions.length}</span> inscription{rInscriptions.length !== 1 ? 's' : ''} trouvée{rInscriptions.length !== 1 ? 's' : ''}
            </span>
          </div>
          {/* KPI periode */}
          <div className="row g-3 mb-4">
            {[
              { icon: '📋', label: 'Nb inscriptions', value: rInscriptions.length,                              color: '#1d4ed8', bg: '#eff6ff', border: '#3b82f6' },
              { icon: '💰', label: 'Total frais',     value: `${rTotalFrais.toLocaleString('fr-FR')} FCFA`,    color: '#0A6E3F', bg: '#f0fdf4', border: '#22c55e' },
              { icon: '🏫', label: 'Classes',         value: rClasses,                                          color: '#d97706', bg: '#fffbeb', border: '#f59e0b' },
              { icon: '📅', label: 'Années',          value: rAnnees,                                           color: '#7c3aed', bg: '#f5f3ff', border: '#8b5cf6' },
            ].map((c, i) => (
              <div key={i} className="col-6 col-lg-3">
                <div style={{ background: c.bg, borderRadius: 12, padding: '14px 16px', borderLeft: `3px solid ${c.border}`, border: `1px solid ${c.border}44` }}>
                  <div style={{ fontSize: 18, marginBottom: 6 }}>{c.icon}</div>
                  <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{c.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: c.color }}>{c.value}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Mini-table */}
          {rInscriptions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 24px', color: '#9ca3af', fontSize: 13 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>Aucune inscription pour cette période
            </div>
          ) : (
            <div className="table-responsive rounded-3" style={{ border: '1px solid #e5e7eb' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                    {['Élève', 'Classe', 'Année', 'Date', 'Frais'].map((h, i) => (
                      <th key={i} style={{ padding: '10px 14px', textAlign: i === 4 ? 'right' : 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rInscriptions.map((i, idx) => (
                    <tr key={i.id} style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ padding: '10px 14px' }}>
                        <div className="d-flex align-items-center gap-2">
                          <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, backgroundColor: avatarColor(i.id), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                            {initials(i.eleveNom, i.elevePrenom)}
                          </div>
                          <span style={{ fontWeight: 600, color: '#111827' }}>{i.elevePrenom} {i.eleveNom}</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 600 }}>{i.classeNiveau || '—'}</span>
                      </td>
                      <td style={{ padding: '10px 14px', color: '#374151', fontSize: 12 }}>{i.anneeLibelle || '—'}</td>
                      <td style={{ padding: '10px 14px', color: '#9ca3af', fontSize: 11, whiteSpace: 'nowrap' }}>
                        {i.dateInscription ? new Date(i.dateInscription).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#0A6E3F', whiteSpace: 'nowrap' }}>{i.fraisInscription?.toLocaleString('fr-FR')} FCFA</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ backgroundColor: '#eff6ff', borderTop: '2px solid #1d4ed8' }}>
                    <td colSpan={4} style={{ padding: '10px 14px', fontWeight: 700, fontSize: 12, color: '#1d4ed8' }}>TOTAL</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, fontSize: 13, color: '#0A6E3F', whiteSpace: 'nowrap' }}>{rTotalFrais.toLocaleString('fr-FR')} FCFA</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
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
      <Drawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} title={editingInscriptionId ? "Modifier l'inscription" : 'Nouvelle inscription'}><InscriptionForm key={editingInscriptionId ?? 'new'} onClose={handleCloseDrawer} inscriptionId={editingInscriptionId} /></Drawer>
    </div>
  );
}
