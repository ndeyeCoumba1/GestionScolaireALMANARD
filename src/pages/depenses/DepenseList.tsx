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
import { generateDepenseListReport, exportDepensesToExcel } from '../../utils/exportUtils';

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

  const rDepenses = depenses.filter(d => {
    if (!d.dateDepense) return false;
    const dt = d.dateDepense.slice(0, 10);
    return dt >= rRange.debut && dt <= rRange.fin;
  });

  const rLabel = rPeriode === 'journalier'
    ? new Date(rDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    : rPeriode === 'hebdomadaire'
    ? `${new Date(rDebut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} – ${new Date(rFin).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}`
    : new Date(rMonth + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const rTotal   = rDepenses.reduce((s, d) => s + (d.montant || 0), 0);
  const rMoyenne = rDepenses.length > 0 ? Math.round(rTotal / rDepenses.length) : 0;
  const rTypes   = new Set(rDepenses.map(d => d.typeDepense)).size;


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

      {/* ═══ RAPPORT PÉRIODIQUE ═══ */}
      <div className="bg-white rounded-4 shadow-sm" style={{ border: '1px solid #f0f0f0', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(90deg, #fef2f2 0%, #fff 100%)', padding: '16px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 4, height: 22, backgroundColor: '#dc2626', borderRadius: 2 }} />
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
                  color: rPeriode === p ? '#dc2626' : '#6b7280',
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
              <button onClick={() => generateDepenseListReport(rDepenses)} disabled={rDepenses.length === 0}
                style={{ borderRadius: 9, border: '1.5px solid #fecaca', backgroundColor: '#fef2f2', padding: '9px 18px', fontSize: 13, fontWeight: 600, color: '#dc2626', cursor: rDepenses.length === 0 ? 'not-allowed' : 'pointer', opacity: rDepenses.length === 0 ? 0.5 : 1 }}>
                📄 Exporter PDF
              </button>
              <button onClick={() => exportDepensesToExcel(rDepenses)} disabled={rDepenses.length === 0}
                style={{ borderRadius: 9, border: '1.5px solid #fca5a5', backgroundColor: '#fff1f1', padding: '9px 18px', fontSize: 13, fontWeight: 600, color: '#b91c1c', cursor: rDepenses.length === 0 ? 'not-allowed' : 'pointer', opacity: rDepenses.length === 0 ? 0.5 : 1 }}>
                📊 Exporter Excel
              </button>
            </div>
          </div>
          {/* Label période */}
          <div className="d-flex align-items-center gap-3 mb-4">
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '6px 14px', fontSize: 12, color: '#dc2626', fontWeight: 600 }}>
              {rPeriode === 'journalier' ? '📅' : rPeriode === 'hebdomadaire' ? '📆' : '🗓️'} {rLabel}
            </div>
            <span style={{ fontSize: 12, color: '#6b7280' }}>
              <span style={{ fontWeight: 700, color: '#111827' }}>{rDepenses.length}</span> dépense{rDepenses.length !== 1 ? 's' : ''} trouvée{rDepenses.length !== 1 ? 's' : ''}
            </span>
          </div>
          {/* KPI periode */}
          <div className="row g-3 mb-4">
            {[
              { icon: '💸', label: 'Total dépensé',    value: `${rTotal.toLocaleString('fr-FR')} FCFA`, color: '#dc2626', bg: '#fef2f2', border: '#ef4444' },
              { icon: '📋', label: 'Nb dépenses',      value: rDepenses.length,                          color: '#1d4ed8', bg: '#eff6ff', border: '#3b82f6' },
              { icon: '🏷️', label: 'Types distincts',  value: rTypes,                                    color: '#d97706', bg: '#fffbeb', border: '#f59e0b' },
              { icon: '📊', label: 'Montant moyen',    value: `${rMoyenne.toLocaleString('fr-FR')} FCFA`, color: '#0f766e', bg: '#f0fdfa', border: '#14b8a6' },
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
          {rDepenses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 24px', color: '#9ca3af', fontSize: 13 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>Aucune dépense pour cette période
            </div>
          ) : (
            <div className="table-responsive rounded-3" style={{ border: '1px solid #e5e7eb' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                    {['Type', 'Description', 'Mois', 'Montant', 'Date'].map((h, i) => (
                      <th key={i} style={{ padding: '10px 14px', textAlign: i === 3 ? 'right' : 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rDepenses.map((d, i) => (
                    <tr key={d.id} style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ backgroundColor: COLORS[i % COLORS.length] + '18', color: COLORS[i % COLORS.length], borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 600 }}>{d.typeDepense.replace(/_/g, ' ')}</span>
                      </td>
                      <td style={{ padding: '10px 14px', color: '#374151', fontSize: 12 }}>{d.description || '—'}</td>
                      <td style={{ padding: '10px 14px', color: '#6b7280', fontSize: 12 }}>{d.moisLibelle || '—'}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#dc2626', whiteSpace: 'nowrap' }}>{d.montant?.toLocaleString('fr-FR')} FCFA</td>
                      <td style={{ padding: '10px 14px', color: '#9ca3af', fontSize: 11, whiteSpace: 'nowrap' }}>
                        {d.dateDepense ? new Date(d.dateDepense).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ backgroundColor: '#fef2f2', borderTop: '2px solid #dc2626' }}>
                    <td colSpan={3} style={{ padding: '10px 14px', fontWeight: 700, fontSize: 12, color: '#dc2626' }}>TOTAL</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, fontSize: 13, color: '#dc2626', whiteSpace: 'nowrap' }}>{rTotal.toLocaleString('fr-FR')} FCFA</td>
                    <td style={{ padding: '10px 14px', fontSize: 11, color: '#dc2626' }}>{rDepenses.length} op.</td>
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
      <Drawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} title={editingDepenseId ? 'Modifier la dépense' : 'Nouvelle dépense'}><DepenseForm key={editingDepenseId ?? 'new'} onClose={handleCloseDrawer} depenseId={editingDepenseId} /></Drawer>
    </div>
  );
}
