import { useEffect, useState, useCallback } from 'react';
import React from 'react';
import api from '../../api/axios';
import type { Paiement, Annee, Mois, StatutPaiement } from '../../Types/index';
import { SkeletonTable } from '../../components/Common/SkeletonLoader';
import { ConfirmModal } from '../../components/Common/ConfirmModal';
import Drawer from '../../components/Common/Drawer';
import PaiementForm from './PaiementForm';
import { generatePaymentListReport, exportPaymentsToExcel, generateReceipt } from '../../utils/exportUtils';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../Context/AuthContext';

/* ─── Config statuts ─── */
const STATUT_CONFIG: Record<StatutPaiement, { label: string; dot: string; bg: string; color: string; border: string }> = {
  PAYE:       { label: 'Payé',       dot: '#22c55e', bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  PARTIEL:    { label: 'Partiel',    dot: '#f59e0b', bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  IMPAYE:     { label: 'Impayé',     dot: '#ef4444', bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  EN_ATTENTE: { label: 'En attente', dot: '#3b82f6', bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  ANNULE:     { label: 'Annulé',     dot: '#9ca3af', bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb' },
};

const MOTIF_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  INSCRIPTION:   { label: 'Inscription',   bg: '#eff6ff', color: '#1d4ed8' },
  MENSUALITE:    { label: 'Mensualité',    bg: '#f0fdfa', color: '#0f766e' },
  REMBOURSEMENT: { label: 'Remboursement', bg: '#faf5ff', color: '#7c3aed' },
};

const TYPE_ICONS: Record<string, string> = {
  ESPECES: '💵', WAVE: '📱', CHEQUE: '📄', ORANGE_MONEY: '🟠',
};
const TYPE_LABELS: Record<string, string> = {
  ESPECES: 'Espèces', WAVE: 'Wave', CHEQUE: 'Chèque', ORANGE_MONEY: 'Orange Money',
};

/* ─── Initiales avatar ─── */
const AVATAR_COLORS = ['#0A6E3F','#1d4ed8','#7c3aed','#d97706','#dc2626','#0f766e'];
function initials(nom: string, prenom: string) {
  return `${(nom[0] ?? '').toUpperCase()}${(prenom[0] ?? '').toUpperCase()}`;
}
function avatarColor(id: number) { return AVATAR_COLORS[id % AVATAR_COLORS.length]; }

export default function PaiementList() {
  const { role } = useAuth();
  const isReadOnly = role === 'COMPTABLE';

  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paiementToDelete, setPaiementToDelete] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPaiementId, setEditingPaiementId] = useState<number | undefined>();
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  /* Filtres */
  const [annees, setAnnees]           = useState<Annee[]>([]);
  const [moisList, setMoisList]       = useState<Mois[]>([]);
  const [classes, setClasses]         = useState<any[]>([]);
  const [filterAnneeId, setFilterAnneeId]   = useState('');
  const [filterMoisId, setFilterMoisId]     = useState('');
  const [filterStatut, setFilterStatut]     = useState('');
  const [filterClasseId, setFilterClasseId] = useState('');
  const [motifFilter, setMotifFilter]       = useState('');

  useEffect(() => {
    api.get('/annees').then(r => setAnnees(r.data)).catch(() => {});
    api.get('/mois').then(r => setMoisList(r.data)).catch(() => {});
    api.get('/classes').then(r => setClasses(r.data)).catch(() => {});
  }, []);

  const fetchPaiements = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterAnneeId) params.append('anneeId', filterAnneeId);
      if (filterMoisId)  params.append('moisId',  filterMoisId);
      if (filterStatut)  params.append('statut',  filterStatut);
      if (filterClasseId) params.append('classeId', filterClasseId);
      const res = await api.get(`/paiements/recherche?${params}`);
      const data: any[] = res.data || [];
      setPaiements(data.map(item => ({
        id: item.id,
        numeroRecu: item.numeroRecu,
        montant: item.montant,
        montantAttendu: item.montantAttendu,
        datePaiement: item.datePaiement,
        motif: item.motif,
        statut: item.statut,
        typePaiement: item.typePaiement,
        eleveNom: item.eleveNom || item.eleve?.nom || '',
        elevePrenom: item.elevePrenom || item.eleve?.prenom || '',
        matricule: item.matricule,
        classeNom: item.classeNom,
        moisLibelle: item.moisLibelle || item.mois?.libelle || '',
        anneeLibelle: item.anneeLibelle || item.annee?.libelle || '',
        enregistreParNom: item.enregistreParNom || item.user?.nom || '',
        modifieParNom: item.modifieParNom,
        dateModification: item.dateModification,
      })));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [filterAnneeId, filterMoisId, filterStatut, filterClasseId]);

  useEffect(() => { fetchPaiements(); }, [fetchPaiements]);

  const toggleRow = (id: number) => {
    const s = new Set(expandedRows);
    s.has(id) ? s.delete(id) : s.add(id);
    setExpandedRows(s);
  };

  const handleDelete  = (id: number) => { setPaiementToDelete(id); setShowDeleteModal(true); };
  const confirmDelete = async () => {
    if (!paiementToDelete) return;
    setDeletingId(paiementToDelete);
    try { await api.delete(`/paiements/${paiementToDelete}`); await fetchPaiements(); }
    catch (err) { console.error(err); }
    finally { setDeletingId(null); setShowDeleteModal(false); setPaiementToDelete(null); }
  };

  const handleOpenDrawer  = (id?: number) => { setEditingPaiementId(id); setIsDrawerOpen(true); };
  const handleCloseDrawer = () => { setIsDrawerOpen(false); setEditingPaiementId(undefined); fetchPaiements(); };

  const filtered = paiements.filter(p =>
    `${p.eleveNom} ${p.elevePrenom} ${p.numeroRecu} ${p.matricule ?? ''} ${p.classeNom ?? ''}`
      .toLowerCase().includes(search.toLowerCase()) &&
    (motifFilter === '' || p.motif === motifFilter)
  );

  /* Stats KPI */
  const totalEncaisse = paiements.filter(p => p.statut === 'PAYE').reduce((s, p) => s + p.montant, 0);
  const nbPaies       = paiements.filter(p => p.statut === 'PAYE').length;
  const nbAttente     = paiements.filter(p => p.statut === 'EN_ATTENTE').length;
  const nbImpayes     = paiements.filter(p => p.statut === 'IMPAYE' || p.statut === 'PARTIEL').length;
  const totalImpayes  = paiements.filter(p => p.statut === 'IMPAYE' || p.statut === 'PARTIEL')
                          .reduce((s, p) => s + p.montant, 0);

  const motifData = [
    { name: 'Inscriptions',   value: paiements.filter(p => p.motif === 'INSCRIPTION').length },
    { name: 'Mensualités',    value: paiements.filter(p => p.motif === 'MENSUALITE').length },
    { name: 'Remboursements', value: paiements.filter(p => p.motif === 'REMBOURSEMENT').length },
  ].filter(d => d.value > 0);

  const typeData = ['ESPECES','WAVE','CHEQUE','ORANGE_MONEY'].map(t => ({
    name: TYPE_LABELS[t], value: paiements.filter(p => p.typePaiement === t).length,
  })).filter(d => d.value > 0);

  const activeFilters = [filterAnneeId, filterMoisId, filterStatut, filterClasseId].filter(Boolean).length;

  return (
    <div className="d-flex flex-column gap-4" style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>

      {/* ═══ HEADER BANDEAU ═══ */}
      <div className="rounded-4 overflow-hidden shadow-sm" style={{
        background: 'linear-gradient(135deg, #0A6E3F 0%, #15803d 60%, #166534 100%)',
        padding: '28px 32px',
        position: 'relative',
      }}>
        {/* Cercles décoratifs */}
        <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -20, right: 120, width: 100, height: 100, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)' }} />

        <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap position-relative">
          <div className="d-flex align-items-center gap-4">
            <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 56, height: 56, backgroundColor: 'rgba(255,255,255,0.15)', fontSize: 26 }}>
              💳
            </div>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Portail Français — Gestion Financière
              </div>
              <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 800, margin: '4px 0 0', letterSpacing: '-0.3px' }}>
                Paiements
              </h1>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 2 }}>
                {paiements.length} paiement{paiements.length !== 1 ? 's' : ''} enregistré{paiements.length !== 1 ? 's' : ''}
                {activeFilters > 0 && <span style={{ marginLeft: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '2px 10px', fontSize: 11 }}>{activeFilters} filtre{activeFilters > 1 ? 's' : ''} actif{activeFilters > 1 ? 's' : ''}</span>}
              </div>
            </div>
          </div>
          {!isReadOnly && (
            <button onClick={() => handleOpenDrawer()}
              className="btn fw-semibold d-flex align-items-center gap-2"
              style={{ backgroundColor: '#fff', color: '#0A6E3F', borderRadius: 12, fontSize: 14, padding: '10px 22px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', transition: 'transform 0.1s' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
              Nouveau Paiement
            </button>
          )}
        </div>
      </div>

      {/* ═══ KPI CARDS ═══ */}
      <div className="row g-3">
        {[
          {
            icon: '💰', label: 'Total encaissé', value: `${totalEncaisse.toLocaleString('fr-FR')} FCFA`,
            sub: `sur ${nbPaies} paiement${nbPaies > 1 ? 's' : ''}`, accent: '#0A6E3F', bg: '#f0fdf4', borderLeft: '#22c55e',
          },
          {
            icon: '📋', label: 'Total paiements', value: paiements.length,
            sub: `${filtered.length} affiché${filtered.length > 1 ? 's' : ''}`, accent: '#1d4ed8', bg: '#eff6ff', borderLeft: '#3b82f6',
          },
          {
            icon: '⏳', label: 'En attente', value: nbAttente,
            sub: 'paiements en cours', accent: '#d97706', bg: '#fffbeb', borderLeft: '#f59e0b',
          },
          {
            icon: '⚠️', label: 'Impayés', value: `${totalImpayes.toLocaleString('fr-FR')} FCFA`,
            sub: `${nbImpayes} paiement${nbImpayes > 1 ? 's' : ''}`, accent: '#dc2626', bg: '#fef2f2', borderLeft: '#ef4444',
          },
        ].map((c, i) => (
          <div key={i} className="col-6 col-lg-3">
            <div className="bg-white rounded-3 shadow-sm h-100"
              style={{ border: '1px solid #f0f0f0', borderLeft: `3px solid ${c.borderLeft}`, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="rounded-2 d-flex align-items-center justify-content-center"
                    style={{ width: 32, height: 32, backgroundColor: c.bg, fontSize: 15 }}>
                    {c.icon}
                  </div>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: c.borderLeft }} />
                </div>
                <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
                  {c.label}
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: c.accent, lineHeight: 1.2 }}>{c.value}</div>
                <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>{c.sub}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ GRAPHIQUES ═══ */}
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <div className="bg-white rounded-4 shadow-sm p-4 h-100" style={{ border: '1px solid #f0f0f0' }}>
            <div className="d-flex align-items-center justify-content-between mb-1">
              <p className="fw-bold mb-0" style={{ fontSize: 14, color: '#111827' }}>Répartition par motif</p>
              <span style={{ fontSize: 11, color: '#9ca3af' }}>{paiements.length} total</span>
            </div>
            <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 12 }}>Inscriptions · Mensualités · Remboursements</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={motifData} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value">
                  {motifData.map((_, i) => <Cell key={i} fill={['#0A6E3F','#1d4ed8','#7c3aed'][i % 3]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="bg-white rounded-4 shadow-sm p-4 h-100" style={{ border: '1px solid #f0f0f0' }}>
            <div className="d-flex align-items-center justify-content-between mb-1">
              <p className="fw-bold mb-0" style={{ fontSize: 14, color: '#111827' }}>Moyens de paiement</p>
              <span style={{ fontSize: 11, color: '#9ca3af' }}>par volume</span>
            </div>
            <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 12 }}>Espèces · Wave · Chèque · Orange Money</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={typeData} margin={{ left: -10, right: 8 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 12 }} />
                <Bar dataKey="value" name="Paiements" fill="#0A6E3F" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ═══ TABLEAU ═══ */}
      <div className="bg-white rounded-4 shadow-sm overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>

        {/* Toolbar */}
        <div style={{ padding: '20px 24px 0' }}>

          {/* Filtres avancés */}
          <div style={{
            backgroundColor: '#f8fafc', borderRadius: 12, padding: '14px 16px',
            border: '1px solid #e5e7eb', marginBottom: 16,
          }}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#6b7280" strokeWidth={2}><path strokeLinecap="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 14.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-6.586L3.293 6.707A1 1 0 013 6V4z"/></svg>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filtres</span>
              {activeFilters > 0 && (
                <button onClick={() => { setFilterAnneeId(''); setFilterMoisId(''); setFilterStatut(''); setFilterClasseId(''); }}
                  style={{ marginLeft: 'auto', fontSize: 11, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 8px', borderRadius: 6, backgroundColor: '#fef2f2' }}>
                  ✕ Effacer
                </button>
              )}
            </div>
            <div className="row g-2">
              {[
                { val: filterAnneeId, setter: setFilterAnneeId, label: 'Année', opts: annees.map(a => ({ v: String(a.id), l: a.libelle })) },
                { val: filterMoisId,  setter: setFilterMoisId,  label: 'Mois',  opts: moisList.map(m => ({ v: String(m.id), l: m.libelle })) },
                { val: filterStatut,  setter: setFilterStatut,  label: 'Statut', opts: Object.entries(STATUT_CONFIG).map(([k, v]) => ({ v: k, l: v.label })) },
                { val: filterClasseId, setter: setFilterClasseId, label: 'Classe', opts: classes.map(c => ({ v: String(c.id), l: c.niveau })) },
              ].map(({ val, setter, label, opts }) => (
                <div key={label} className="col-6 col-md-3">
                  <div style={{ position: 'relative' }}>
                    <select value={val} onChange={e => setter(e.target.value)}
                      style={{
                        width: '100%', borderRadius: 8, padding: '8px 32px 8px 12px',
                        border: `1.5px solid ${val ? '#0A6E3F' : '#e5e7eb'}`,
                        backgroundColor: val ? '#f0fdf4' : '#fff',
                        fontSize: 13, color: val ? '#0A6E3F' : '#374151',
                        fontWeight: val ? 600 : 400, outline: 'none', appearance: 'none', cursor: 'pointer',
                      }}>
                      <option value="">Tous — {label}</option>
                      {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                    </select>
                    <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                      width="12" height="12" fill="none" viewBox="0 0 24 24" stroke={val ? '#0A6E3F' : '#9ca3af'} strokeWidth={2}>
                      <path strokeLinecap="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs motif + search + exports */}
          <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap mb-4">
            <div className="d-flex gap-1 flex-wrap" style={{ backgroundColor: '#f1f5f9', padding: '4px', borderRadius: 12 }}>
              {[
                { val: '',              lbl: 'Tous',            count: paiements.length },
                { val: 'INSCRIPTION',   lbl: '🎓 Inscriptions',  count: paiements.filter(p => p.motif === 'INSCRIPTION').length },
                { val: 'MENSUALITE',    lbl: '📅 Mensualités',   count: paiements.filter(p => p.motif === 'MENSUALITE').length },
                { val: 'REMBOURSEMENT', lbl: '↩️ Remboursements', count: paiements.filter(p => p.motif === 'REMBOURSEMENT').length },
              ].map(({ val, lbl, count }) => (
                <button key={val} onClick={() => setMotifFilter(val)}
                  style={{
                    border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600,
                    backgroundColor: motifFilter === val ? '#fff' : 'transparent',
                    color: motifFilter === val ? '#0A6E3F' : '#6b7280',
                    boxShadow: motifFilter === val ? '0 1px 6px rgba(0,0,0,0.08)' : 'none',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                  {lbl}
                  <span style={{
                    fontSize: 10, fontWeight: 700, borderRadius: 20, padding: '1px 7px',
                    backgroundColor: motifFilter === val ? '#f0fdf4' : '#e5e7eb',
                    color: motifFilter === val ? '#0A6E3F' : '#9ca3af',
                  }}>{count}</span>
                </button>
              ))}
            </div>

            <div className="d-flex gap-2 align-items-center">
              <div className="position-relative">
                <svg className="position-absolute top-50 translate-middle-y" style={{ left: 12, pointerEvents: 'none' }}
                  width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth={2}>
                  <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
                </svg>
                <input type="text" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
                  style={{
                    paddingLeft: 36, paddingRight: 14, paddingTop: 8, paddingBottom: 8,
                    borderRadius: 10, border: '1.5px solid #e5e7eb', backgroundColor: '#f9fafb',
                    fontSize: 13, outline: 'none', width: 220,
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#0A6E3F')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
                />
              </div>
              <button onClick={() => generatePaymentListReport(filtered)}
                style={{ border: '1.5px solid #e5e7eb', backgroundColor: '#fff', borderRadius: 9, padding: '7px 14px', fontSize: 12, color: '#374151', cursor: 'pointer', fontWeight: 500 }}>
                📄 PDF
              </button>
              <button onClick={() => exportPaymentsToExcel(filtered)}
                style={{ border: '1.5px solid #e5e7eb', backgroundColor: '#fff', borderRadius: 9, padding: '7px 14px', fontSize: 12, color: '#374151', cursor: 'pointer', fontWeight: 500 }}>
                📊 Excel
              </button>
            </div>
          </div>
        </div>

        {/* Compteur résultats */}
        <div style={{ padding: '0 24px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            <span style={{ fontWeight: 700, color: '#111827' }}>{filtered.length}</span> résultat{filtered.length > 1 ? 's' : ''}
            {(search || motifFilter) && <span style={{ color: '#9ca3af' }}> (filtrés sur {paiements.length})</span>}
          </span>
        </div>

        {/* Table */}
        <div className="table-responsive">
          {loading ? (
            <div style={{ padding: '0 24px 24px' }}><SkeletonTable rows={6} columns={10} /></div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #e5e7eb' }}>
                  {['', 'N° Reçu', 'Élève', 'Classe / Mois', 'Motif', 'Montant', 'Attendu', 'Moyen', 'Statut', 'Date', 'Actions'].map((h, i) => (
                    <th key={i} style={{
                      padding: '11px 16px', textAlign: i >= 5 && i <= 7 ? 'right' : 'left',
                      fontSize: 12, fontWeight: 700, color: '#6b7280',
                      textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={11} style={{ padding: '56px 24px', textAlign: 'center' }}>
                      <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
                      <div style={{ fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                        {search || motifFilter ? 'Aucun résultat trouvé' : 'Aucun paiement enregistré'}
                      </div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>
                        {search ? `Aucun paiement ne correspond à « ${search} »` : 'Les paiements apparaîtront ici une fois enregistrés.'}
                      </div>
                    </td>
                  </tr>
                ) : filtered.map(p => {
                  const statut = STATUT_CONFIG[p.statut] ?? { label: p.statut, dot: '#9ca3af', bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb' };
                  const motif  = MOTIF_CONFIG[p.motif]  ?? { label: p.motif, icon: '💬', bg: '#f9fafb', color: '#6b7280' };
                  const isExpanded = expandedRows.has(p.id);
                  const resteAPayer = p.statut === 'PARTIEL' && p.montantAttendu ? (p.montantAttendu - p.montant) : 0;

                  return (
                    <React.Fragment key={p.id}>
                      <tr style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.1s' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fafafa')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>

                        {/* Indicateur statut vertical */}
                        <td style={{ padding: '0 0 0 8px', width: 4 }}>
                          <div style={{ width: 3, height: 40, borderRadius: 4, backgroundColor: statut.dot, margin: '0 auto' }} />
                        </td>

                        {/* N° Reçu */}
                        <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#9ca3af', backgroundColor: '#f3f4f6', borderRadius: 5, padding: '3px 7px' }}>
                            {p.numeroRecu}
                          </span>
                        </td>

                        {/* Élève */}
                        <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                          <div className="d-flex align-items-center gap-2">
                            <div style={{
                              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                              backgroundColor: avatarColor(p.id),
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 12, fontWeight: 700, color: '#fff',
                            }}>
                              {initials(p.eleveNom, p.elevePrenom)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#111827', fontSize: 13 }}>
                                {p.eleveNom} {p.elevePrenom}
                              </div>
                              {p.matricule && (
                                <div style={{ fontSize: 10, color: '#9ca3af' }}>{p.matricule}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Classe / Mois */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 500, color: '#374151', fontSize: 12 }}>{p.classeNom || '—'}</div>
                          <div style={{ color: '#9ca3af', fontSize: 11 }}>{p.moisLibelle || '—'}</div>
                        </td>

                        {/* Motif */}
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center',
                            backgroundColor: motif.bg, color: motif.color,
                            borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 600,
                          }}>
                            {motif.label}
                          </span>
                        </td>

                        {/* Montant */}
                        <td style={{ padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          {p.statut === 'PARTIEL' && p.montantAttendu ? (
                            <button onClick={() => toggleRow(p.id)}
                              style={{
                                border: `1px solid ${isExpanded ? '#fde68a' : '#e5e7eb'}`,
                                backgroundColor: isExpanded ? '#fffbeb' : '#fff',
                                borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
                                textAlign: 'right', lineHeight: 1.3,
                              }}>
                              <div style={{ fontWeight: 700, color: '#d97706', fontSize: 13 }}>
                                {p.montant.toLocaleString('fr-FR')} FCFA
                              </div>
                              <div style={{ fontSize: 9, color: '#9ca3af' }}>
                                {isExpanded ? '▲' : '▼'} détails
                              </div>
                            </button>
                          ) : (
                            <span style={{ fontWeight: 700, color: '#0A6E3F', fontSize: 13 }}>
                              {p.montant.toLocaleString('fr-FR')} FCFA
                            </span>
                          )}
                        </td>

                        {/* Attendu */}
                        <td style={{ padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap', color: '#6b7280', fontSize: 12 }}>
                          {p.montantAttendu ? `${p.montantAttendu.toLocaleString('fr-FR')} FCFA` : '—'}
                        </td>

                        {/* Moyen */}
                        <td style={{ padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: 12, color: '#374151' }}>
                            {TYPE_ICONS[p.typePaiement] ?? ''} {TYPE_LABELS[p.typePaiement] ?? p.typePaiement}
                          </span>
                        </td>

                        {/* Statut */}
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            backgroundColor: statut.bg, color: statut.color,
                            border: `1px solid ${statut.border}`,
                            borderRadius: 20, padding: '4px 11px', fontSize: 11, fontWeight: 600,
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: statut.dot, flexShrink: 0 }} />
                            {statut.label}
                          </span>
                        </td>

                        {/* Date */}
                        <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', color: '#9ca3af', fontSize: 11 }}>
                          {p.datePaiement ? new Date(p.datePaiement).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '14px 16px' }}>
                          <div className="d-flex align-items-center gap-1">
                            <button onClick={() => generateReceipt({
                              numeroRecu: p.numeroRecu,
                              eleveNom: p.eleveNom,
                              elevePrenom: p.elevePrenom,
                              montant: p.montant,
                              montantAttendu: p.montantAttendu,
                              statut: p.statut,
                              motif: p.motif,
                              datePaiement: p.datePaiement,
                              moisLibelle: p.moisLibelle,
                              typePaiement: p.typePaiement,
                              classe: p.classeNom,
                              matricule: p.matricule,
                              anneeScolaire: p.anneeLibelle,
                            }).catch(console.error)}
                              title="Imprimer reçu"
                              style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                              🖨️
                            </button>
                            {!isReadOnly && (
                              <>
                                <button onClick={() => handleOpenDrawer(p.id)} title="Modifier"
                                  style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #bbf7d0', backgroundColor: '#f0fdf4', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                                  ✏️
                                </button>
                                <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id} title="Supprimer"
                                  style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #fecaca', backgroundColor: '#fef2f2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, opacity: deletingId === p.id ? 0.4 : 1 }}>
                                  🗑️
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Ligne dépliante PARTIEL */}
                      {isExpanded && (
                        <tr style={{ backgroundColor: '#fffbeb' }}>
                          <td colSpan={11} style={{ padding: '0 24px 16px' }}>
                            <div style={{ backgroundColor: '#fff', border: '1.5px solid #fde68a', borderRadius: 12, padding: '16px 20px', marginTop: 8 }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>
                                ⚠️ Détail du paiement partiel
                              </div>

                              {/* Barre de progression */}
                              {p.montantAttendu && (
                                <div style={{ marginBottom: 16 }}>
                                  <div className="d-flex justify-content-between mb-1">
                                    <span style={{ fontSize: 11, color: '#92400e' }}>Progression du paiement</span>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: '#0A6E3F' }}>
                                      {Math.round((p.montant / p.montantAttendu) * 100)}%
                                    </span>
                                  </div>
                                  <div style={{ height: 8, backgroundColor: '#fde68a', borderRadius: 10, overflow: 'hidden' }}>
                                    <div style={{
                                      height: '100%', borderRadius: 10,
                                      width: `${Math.min(Math.round((p.montant / p.montantAttendu) * 100), 100)}%`,
                                      backgroundColor: '#0A6E3F', transition: 'width 0.5s ease',
                                    }} />
                                  </div>
                                </div>
                              )}

                              <div className="d-flex flex-wrap gap-3">
                                {[
                                  { label: 'Total attendu',  value: `${p.montantAttendu?.toLocaleString('fr-FR')} FCFA`, color: '#92400e',   bg: '#fff7ed' },
                                  { label: 'Déjà payé',      value: `${p.montant.toLocaleString('fr-FR')} FCFA`,          color: '#166534',   bg: '#f0fdf4' },
                                  { label: 'Reste à payer',  value: `${resteAPayer.toLocaleString('fr-FR')} FCFA`,         color: '#dc2626',   bg: '#fef2f2' },
                                ].map((item, i) => (
                                  <div key={i} style={{ flex: '1 1 130px', backgroundColor: item.bg, borderRadius: 10, padding: '10px 14px' }}>
                                    <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                                    <div style={{ fontSize: 15, fontWeight: 800, color: item.color, marginTop: 4 }}>{item.value}</div>
                                  </div>
                                ))}
                                {p.modifieParNom && (
                                  <div style={{ flex: '1 1 180px', backgroundColor: '#f8fafc', borderRadius: 10, padding: '10px 14px', marginLeft: 'auto' }}>
                                    <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Modifié par</div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginTop: 4 }}>{p.modifieParNom}</div>
                                    {p.dateModification && (
                                      <div style={{ fontSize: 10, color: '#9ca3af' }}>
                                        {new Date(p.dateModification).toLocaleDateString('fr-FR')}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 24px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#d1d5db' }}>
            © {new Date().getFullYear()} Al-Manard3s / Fondation Daroul Manar D3S
          </span>
          <span style={{ fontSize: 11, color: '#d1d5db' }}>
            {filtered.length} / {paiements.length} paiements
          </span>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setPaiementToDelete(null); }}
        onConfirm={confirmDelete}
        title="Supprimer le paiement"
        message="Êtes-vous sûr de vouloir supprimer ce paiement ? Cette action est irréversible."
        confirmText="Supprimer" cancelText="Annuler" variant="danger"
      />

      <Drawer isOpen={isDrawerOpen} onClose={handleCloseDrawer}
        title={editingPaiementId ? 'Modifier le paiement' : 'Nouveau paiement'}>
        <PaiementForm onClose={handleCloseDrawer} paiementId={editingPaiementId} />
      </Drawer>
    </div>
  );
}
