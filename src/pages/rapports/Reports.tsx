import { useState, type ReactNode } from 'react';
import { generateDailyReport, generateWeeklyReport, generateMonthlyReport } from '../../utils/exportUtils';

/* ── SVG icons ── */
const IcCalendar = ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.8}>
    <rect x="3" y="4" width="18" height="18" rx="2"/><path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
);
const IcBarChart = ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
  </svg>
);
const IcCheck = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#0A6E3F" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
);
const IcFile = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
  </svg>
);
const IcShield = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
  </svg>
);
const IcInfo = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 16v-4M12 8h.01"/>
  </svg>
);

/* ── Types ── */
type ReportType = 'daily' | 'weekly' | 'monthly';

const REPORT_TYPES: { key: ReportType; label: string; sub: string; icon: ReactNode }[] = [
  { key: 'daily',   label: 'Journalier',    sub: 'Rapport des transactions du jour',     icon: <IcCalendar size={28} color="#0A6E3F" /> },
  { key: 'weekly',  label: 'Hebdomadaire',  sub: 'Rapport des transactions de la semaine', icon: <IcCalendar size={28} color="#0A6E3F" /> },
  { key: 'monthly', label: 'Mensuel',       sub: 'Rapport des transactions du mois',     icon: <IcBarChart size={28} color="#0A6E3F" /> },
];

const PERIODE_INFO: Record<ReportType, string> = {
  daily:   'Le rapport journalier couvre une journée complète.',
  weekly:  'Le rapport hebdomadaire couvre 7 jours consécutifs.',
  monthly: 'Le rapport mensuel couvre un mois complet de transactions.',
};

const APERCU_ITEMS = [
  { icon: '💸', label: 'Dépenses',              desc: 'Toutes les dépenses effectuées',        bg: '#f0fdf4', color: '#0A6E3F', border: '#bbf7d0' },
  { icon: '💳', label: 'Paiements reçus',        desc: 'Tous les paiements reçus',              bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  { icon: '📋', label: 'Nouvelles inscriptions', desc: 'Toutes les nouvelles inscriptions',     bg: '#f5f3ff', color: '#7c3aed', border: '#c4b5fd' },
  { icon: '🔄', label: 'Modifications',          desc: 'Toutes les modifications apportées',   bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
];

/* ── Historique ── */
interface HistoryItem {
  id: string;
  type: ReportType;
  label: string;
  startDate: string;
  endDate: string;
  generatedAt: string;
}

const STORAGE_KEY = 'rapport_history';
const MAX_HISTORY = 6;

function loadHistory(): HistoryItem[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); } catch { return []; }
}
function saveHistory(items: HistoryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_HISTORY)));
}

const TYPE_CFG: Record<ReportType, { accent: string; bg: string; border: string; icon: string }> = {
  daily:   { accent: '#0A6E3F', bg: '#f0fdf4', border: '#bbf7d0', icon: '📅' },
  weekly:  { accent: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe', icon: '📆' },
  monthly: { accent: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd', icon: '📊' },
};

function fmt(dateStr: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}
function fmtShort(dateStr: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtTime(isoStr: string) {
  return new Date(isoStr).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function Reports() {
  const [reportType, setReportType] = useState<ReportType>('weekly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory);

  const generateReport = async () => {
    if (!startDate || !endDate) { alert('Veuillez sélectionner une date de début et une date de fin'); return; }
    setLoading(true);
    try {
      if (reportType === 'daily')   await generateDailyReport(startDate, endDate);
      if (reportType === 'weekly')  await generateWeeklyReport(startDate, endDate);
      if (reportType === 'monthly') await generateMonthlyReport(startDate, endDate);
      const label = REPORT_TYPES.find(t => t.key === reportType)?.label ?? '';
      const newItem: HistoryItem = { id: Date.now().toString(), type: reportType, label, startDate, endDate, generatedAt: new Date().toISOString() };
      const updated = [newItem, ...history].slice(0, MAX_HISTORY);
      setHistory(updated);
      saveHistory(updated);
    } catch { alert('Erreur lors de la génération du rapport'); }
    finally { setLoading(false); }
  };

  const removeHistory = (id: string) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    saveHistory(updated);
  };

  const labelType = REPORT_TYPES.find(t => t.key === reportType)?.label ?? '';

  return (
    <div className="d-flex flex-column gap-4" style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>

      {/* ── Bannière ── */}
      <div className="rounded-4 overflow-hidden shadow-sm position-relative" style={{ background: 'linear-gradient(135deg, #0A6E3F 0%, #15803d 60%, #166534 100%)', padding: '28px 32px' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -20, right: 120, width: 100, height: 100, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)' }} />
        <div className="d-flex align-items-center justify-content-between position-relative flex-wrap gap-3">
          <div className="d-flex align-items-center gap-4">
            <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 56, height: 56, backgroundColor: 'rgba(255,255,255,0.15)', fontSize: 26 }}>
              📊
            </div>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Portail Français — Finance</div>
              <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 800, margin: '4px 0 2px', letterSpacing: '-0.3px' }}>Gestion des rapports</h1>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>Générez et téléchargez des rapports financiers journaliers, hebdomadaires et mensuels.</div>
            </div>
          </div>
          <div className="rounded-3 overflow-hidden flex-shrink-0" style={{ width: 52, height: 52, border: '2px solid rgba(255,255,255,0.25)', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
            <img src="/logo.jpeg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </div>

      {/* ── Corps principal ── */}
      <div className="row g-4 align-items-start">

        {/* ── Colonne gauche ── */}
        <div className="col-12 col-lg-8 d-flex flex-column gap-4">

          {/* Étape 1 — Type */}
          <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0' }}>
            <div className="d-flex align-items-center gap-3 mb-1">
              <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#0A6E3F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0 }}>1</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>Type de rapport</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>Sélectionnez le type de rapport à générer</div>
              </div>
            </div>

            <div className="row g-3 mt-2">
              {REPORT_TYPES.map(t => {
                const active = reportType === t.key;
                return (
                  <div key={t.key} className="col-12 col-sm-4">
                    <button onClick={() => setReportType(t.key)} style={{ width: '100%', border: `2px solid ${active ? '#0A6E3F' : '#e5e7eb'}`, borderRadius: 14, padding: '16px 14px', backgroundColor: active ? '#f0fdf4' : '#fff', cursor: 'pointer', textAlign: 'left', position: 'relative', transition: 'all 0.15s' }}>
                      {active && (
                        <div style={{ position: 'absolute', top: 10, right: 10, width: 20, height: 20, borderRadius: '50%', backgroundColor: '#0A6E3F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        </div>
                      )}
                      <div style={{ marginBottom: 10 }}>{t.icon}</div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: active ? '#0A6E3F' : '#111827', marginBottom: 4 }}>{t.label}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.4 }}>{t.sub}</div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Étape 2 — Période */}
          <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0' }}>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#0A6E3F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0 }}>2</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>Période du rapport</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>Définissez la période de votre rapport {labelType.toLowerCase()}</div>
              </div>
            </div>

            {/* Info box */}
            <div className="d-flex align-items-center gap-2 mb-4 rounded-3 px-3 py-2" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <span style={{ color: '#0A6E3F', flexShrink: 0 }}><IcInfo /></span>
              <span style={{ fontSize: 13, color: '#166534' }}>{PERIODE_INFO[reportType]}</span>
            </div>

            <div className="row g-3">
              <div className="col-12 col-sm-6">
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>
                  Date de début <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                    style={{ width: '100%', borderRadius: 10, border: '1.5px solid #e5e7eb', padding: '10px 44px 10px 14px', fontSize: 14, outline: 'none', backgroundColor: '#fff', color: '#111827' }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#0A6E3F')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
                  />
                  <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}><IcCalendar size={16} /></span>
                </div>
              </div>
              <div className="col-12 col-sm-6">
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>
                  Date de fin <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                    style={{ width: '100%', borderRadius: 10, border: '1.5px solid #e5e7eb', padding: '10px 44px 10px 14px', fontSize: 14, outline: 'none', backgroundColor: '#fff', color: '#111827' }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#0A6E3F')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
                  />
                  <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}><IcCalendar size={16} /></span>
                </div>
              </div>
            </div>

            {startDate && endDate && (
              <div className="d-flex align-items-center gap-2 mt-3">
                <span style={{ color: '#0A6E3F' }}><IcCalendar size={15} color="#0A6E3F" /></span>
                <span style={{ fontSize: 13, color: '#0A6E3F', fontWeight: 600 }}>
                  {labelType} sélectionné{reportType !== 'daily' ? 'e' : ''} : {fmt(startDate)} – {fmt(endDate)}
                </span>
              </div>
            )}
          </div>

          {/* Bouton générer */}
          <div>
            <button onClick={generateReport} disabled={loading || !startDate || !endDate}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 32px', borderRadius: 12, border: 'none', background: loading || !startDate || !endDate ? '#9ca3af' : 'linear-gradient(135deg, #0A6E3F, #15803d)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading || !startDate || !endDate ? 'not-allowed' : 'pointer', boxShadow: '0 4px 16px rgba(10,110,63,0.3)', transition: 'all 0.15s' }}
              onMouseEnter={e => { if (!loading && startDate && endDate) e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {loading ? (
                <><div className="spinner-border spinner-border-sm me-1" style={{ borderColor: 'rgba(255,255,255,0.4)', borderTopColor: '#fff' }} />Génération en cours…</>
              ) : (
                <><IcFile />Générer le rapport {labelType.toLowerCase()}</>
              )}
            </button>
            <div className="d-flex align-items-center gap-2 mt-2" style={{ fontSize: 12, color: '#9ca3af' }}>
              <IcShield /><span>Vos données sont sécurisées et confidentielles</span>
            </div>
          </div>
        </div>

        {/* ── Colonne droite — Aperçu ── */}
        <div className="col-12 col-lg-4">
          <div className="bg-white rounded-4 shadow-sm p-4 d-flex flex-column gap-3" style={{ border: '1px solid #f0f0f0' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 2 }}>Aperçu du rapport</div>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>Résumé des informations incluses</div>
            </div>

            {/* Sections incluses */}
            <div className="d-flex flex-column gap-2">
              {APERCU_ITEMS.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, backgroundColor: item.bg, border: `1px solid ${item.border}` }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: item.color }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{item.desc}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 20, padding: '2px 8px', flexShrink: 0 }}>
                    <IcCheck />
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#0A6E3F' }}>Inclus</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Séparateur */}
            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Données sécurisées */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#0A6E3F' }}><IcShield /></span>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>Données sécurisées</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.4 }}>Vos données sont traitées de manière sécurisée et confidentielle</div>
                </div>
              </div>

              {/* Format */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#1d4ed8' }}><IcFile /></span>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>Format du rapport</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.4 }}>Le rapport sera généré au format PDF et Excel</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Historique des rapports ── */}
      <div className="bg-white rounded-4 shadow-sm overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Historique</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>Derniers rapports générés</div>
          </div>
          {history.length > 0 && (
            <button onClick={() => { setHistory([]); saveHistory([]); }}
              style={{ fontSize: 11, color: '#9ca3af', background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '4px 12px', cursor: 'pointer' }}>
              Effacer l'historique
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📂</div>
            <div style={{ fontWeight: 600, color: '#374151', fontSize: 14, marginBottom: 4 }}>Aucun rapport généré</div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>Les rapports que vous générez apparaîtront ici.</div>
          </div>
        ) : (
          <div style={{ padding: '16px 24px' }}>
            <div className="row g-3">
              {history.map(h => {
                const cfg = TYPE_CFG[h.type];
                return (
                  <div key={h.id} className="col-12 col-md-6 col-lg-4">
                    <div style={{ borderRadius: 12, border: `1.5px solid ${cfg.border}`, backgroundColor: cfg.bg, padding: '14px 16px', position: 'relative', transition: 'box-shadow 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)')}
                      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>

                      {/* Supprimer */}
                      <button onClick={() => removeHistory(h.id)}
                        style={{ position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: '50%', border: 'none', backgroundColor: 'rgba(0,0,0,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 14, lineHeight: 1, padding: 0 }}
                        title="Supprimer">×</button>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                          {cfg.icon}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: cfg.accent }}>Rapport {h.label}</div>
                          <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>Généré le {fmtTime(h.generatedAt)}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#6b7280' }}>
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2"/><path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18"/></svg>
                        <span style={{ fontWeight: 600, color: '#374151' }}>{fmtShort(h.startDate)}</span>
                        <span>→</span>
                        <span style={{ fontWeight: 600, color: '#374151' }}>{fmtShort(h.endDate)}</span>
                      </div>

                      <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
                        <span style={{ backgroundColor: '#fff', border: `1px solid ${cfg.border}`, color: cfg.accent, borderRadius: 20, padding: '2px 10px', fontSize: 10, fontWeight: 700 }}>PDF</span>
                        <span style={{ backgroundColor: '#fff', border: `1px solid ${cfg.border}`, color: cfg.accent, borderRadius: 20, padding: '2px 10px', fontSize: 10, fontWeight: 700 }}>Excel</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #f3f4f6', padding: '12px 0', textAlign: 'center', fontSize: 11, color: '#d1d5db' }}>
        © {new Date().getFullYear()} Al-Manard3s / Fondation Daroul Manar D3S
      </div>
    </div>
  );
}
