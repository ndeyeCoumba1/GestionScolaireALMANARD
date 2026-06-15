import { useState, type ReactNode } from 'react';
import { generateDailyReport, generateWeeklyReport, generateMonthlyReport } from '../../utils/exportUtils';
import almanardLogo from '../../assets/almanard.jpeg';

/* ── Icônes ── */
const IcCalendar = ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.8}>
    <rect x="3" y="4" width="18" height="18" rx="2"/><path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
);
const IcDown = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m0 0l-6-6m6 6l6-6"/>
  </svg>
);
const IcCheck = ({ size = 12, color = '#fff' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
  </svg>
);
const IcSparkle = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
  </svg>
);
const IcShield = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
  </svg>
);
const IcFile = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
  </svg>
);
const IcClock = ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.8}>
    <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 6v6l4 2"/>
  </svg>
);
const IcTrash = ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
  </svg>
);

/* ── Types ── */
type ReportType = 'daily' | 'weekly' | 'monthly';

const REPORT_TYPES: {
  key: ReportType;
  label: string;
  sub: string;
  icon: string;
  accent: string;
  accentBg: string;
  accentBorder: string;
  features: string[];
}[] = [
  {
    key: 'daily', label: 'Journalier', sub: 'Activité du jour',
    icon: '📅', accent: '#0A6E3F', accentBg: '#f0fdf4', accentBorder: '#86efac',
    features: ['Transactions du jour', 'Paiements reçus', 'Dépenses effectuées'],
  },
  {
    key: 'weekly', label: 'Hebdomadaire', sub: 'Bilan de la semaine',
    icon: '📆', accent: '#1d4ed8', accentBg: '#eff6ff', accentBorder: '#93c5fd',
    features: ['Synthèse sur 7 jours', 'Évolution journalière', 'Top élèves payants'],
  },
  {
    key: 'monthly', label: 'Mensuel', sub: 'Rapport du mois complet',
    icon: '📊', accent: '#7c3aed', accentBg: '#f5f3ff', accentBorder: '#c4b5fd',
    features: ['Analyse mensuelle complète', 'Graphiques & tendances', 'Classements & performances'],
  },
];

const CONTENT_ITEMS: { icon: string; label: string; color: string; bg: string }[] = [
  { icon: '💳', label: 'Paiements reçus',        color: '#0A6E3F', bg: '#f0fdf4' },
  { icon: '💸', label: 'Dépenses effectuées',     color: '#dc2626', bg: '#fef2f2' },
  { icon: '📋', label: 'Nouvelles inscriptions',  color: '#1d4ed8', bg: '#eff6ff' },
  { icon: '📈', label: 'Analyse financière',       color: '#7c3aed', bg: '#f5f3ff' },
  { icon: '🏆', label: 'Top contributeurs',        color: '#d97706', bg: '#fffbeb' },
  { icon: '🔄', label: 'Historique complet',       color: '#0891b2', bg: '#ecfeff' },
];

interface HistoryItem {
  id: string;
  type: ReportType;
  label: string;
  startDate: string;
  endDate: string;
  generatedAt: string;
}

const STORAGE_KEY = 'rapport_history';
const MAX_HISTORY = 9;

function loadHistory(): HistoryItem[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); } catch { return []; }
}
function saveHistory(items: HistoryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_HISTORY)));
}

function fmt(d: string) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}
function fmtShort(d: string) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const G  = '#0A6E3F';
const GL = '#f0fdf4';
const GB = '#86efac';

/* ── Composant Step Badge ── */
function StepBadge({ n, done }: { n: number; done: boolean }) {
  return (
    <div style={{
      width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
      backgroundColor: done ? G : '#fff',
      border: `2px solid ${done ? G : '#d1d5db'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {done
        ? <IcCheck size={13} color="#fff" />
        : <span style={{ fontSize: 12, fontWeight: 800, color: '#6b7280' }}>{n}</span>}
    </div>
  );
}

/* ── Composant Quick Date Button ── */
function QuickBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      fontSize: 11, fontWeight: 600, color: G,
      background: GL, border: `1px solid ${GB}`,
      borderRadius: 20, padding: '4px 12px', cursor: 'pointer',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </button>
  );
}

/* ── Petit badge tag ── */
function Tag({ children, color, bg, border }: { children: ReactNode; color: string; bg: string; border: string }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, color, backgroundColor: bg, border: `1px solid ${border}`, borderRadius: 20, padding: '2px 9px' }}>
      {children}
    </span>
  );
}

const TYPE_CFG = {
  daily:   { accent: G,        bg: GL,       border: GB,       icon: '📅', label: 'Journalier'    },
  weekly:  { accent: '#1d4ed8', bg: '#eff6ff', border: '#93c5fd', icon: '📆', label: 'Hebdomadaire' },
  monthly: { accent: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd', icon: '📊', label: 'Mensuel'       },
};

export default function Reports() {
  const [reportType, setReportType] = useState<ReportType>('monthly');
  const [startDate, setStartDate]   = useState('');
  const [endDate,   setEndDate]     = useState('');
  const [loading,   setLoading]     = useState(false);
  const [history,   setHistory]     = useState<HistoryItem[]>(loadHistory);

  const today      = new Date();
  const todayStr   = today.toISOString().split('T')[0];
  const monStr     = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const sunStr     = (() => {
    const d = new Date(today); d.setDate(today.getDate() - today.getDay() + 1); return d.toISOString().split('T')[0];
  })();

  const quickDates: { label: string; start: string; end: string }[] = [
    { label: "Aujourd'hui",     start: todayStr, end: todayStr },
    { label: 'Cette semaine',   start: sunStr,   end: todayStr },
    { label: 'Ce mois',         start: monStr,   end: todayStr },
    { label: 'Mois précédent',  start: new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0],
      end: new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0] },
  ];

  const generateReport = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      if (reportType === 'daily')   await generateDailyReport(startDate, endDate);
      if (reportType === 'weekly')  await generateWeeklyReport(startDate, endDate);
      if (reportType === 'monthly') await generateMonthlyReport(startDate, endDate);
      const label = REPORT_TYPES.find(t => t.key === reportType)?.label ?? '';
      const item: HistoryItem = { id: Date.now().toString(), type: reportType, label, startDate, endDate, generatedAt: new Date().toISOString() };
      const updated = [item, ...history].slice(0, MAX_HISTORY);
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

  const cfg       = TYPE_CFG[reportType];
  const step1Done = true;
  const step2Done = !!startDate && !!endDate;
  const canGen    = step1Done && step2Done && !loading;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* ════════════════════════════════════
          EN-TÊTE ÉCOLE
      ════════════════════════════════════ */}
      <div style={{
        background: 'linear-gradient(135deg, #064e29 0%, #0A6E3F 55%, #15803d 100%)',
        padding: '0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Cercles décoratifs */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: -30, right: 180, width: 120, height: 120, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', top: 20, right: 260, width: 60, height: 60, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)' }} />

        {/* Contenu */}
        <div style={{ padding: '20px 32px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, position: 'relative' }}>
          {/* Gauche : logo + infos école */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ width: 68, height: 68, borderRadius: 16, overflow: 'hidden', border: '2.5px solid rgba(255,255,255,0.3)', flexShrink: 0, boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}>
              <img src={almanardLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Groupe Scolaire</div>
              <div style={{ color: '#fff', fontSize: 22, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.3px' }}>AL-MANAR D3S</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 2 }}>Tivaouane, Sénégal — +221 78 120 89 78</div>
            </div>
          </div>

          {/* Centre : titre page */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 30, padding: '6px 18px', marginBottom: 8 }}>
              <span style={{ fontSize: 16 }}>📊</span>
              <span style={{ color: '#fff', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Centre de Rapports</span>
            </div>
            <div style={{ color: '#fff', fontSize: 26, fontWeight: 900, letterSpacing: '-0.5px' }}>Gestion des Rapports</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4 }}>Générez des rapports financiers journaliers, hebdomadaires et mensuels</div>
          </div>

          {/* Droite : date du jour */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 16px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Aujourd'hui</div>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 700, marginTop: 2 }}>
                {today.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 6, backgroundColor: 'rgba(134,239,172,0.2)', border: '1px solid rgba(134,239,172,0.4)', borderRadius: 20, padding: '2px 10px' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#86efac' }} />
                <span style={{ color: '#86efac', fontSize: 10, fontWeight: 700 }}>Système actif</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bande inférieure de navigation */}
        <div style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '8px 32px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Tableau de bord</span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>›</span>
          <span style={{ color: '#86efac', fontSize: 12, fontWeight: 600 }}>Rapports financiers</span>
        </div>
      </div>

      {/* ════════════════════════════════════
          CORPS
      ════════════════════════════════════ */}
      <div style={{ padding: '28px 24px', maxWidth: 1280, margin: '0 auto' }}>
        <div className="row g-4 align-items-start">

          {/* ── Colonne principale (gauche) ── */}
          <div className="col-12 col-xl-8 d-flex flex-column gap-4">

            {/* ─── Étape 1 : Type de rapport ─── */}
            <div style={{ backgroundColor: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', padding: 28, boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
                <StepBadge n={1} done={step1Done} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#111827' }}>Type de rapport</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 1 }}>Choisissez la périodicité du rapport à générer</div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <Tag color={cfg.accent} bg={cfg.bg} border={cfg.border}>{cfg.icon} {cfg.label}</Tag>
                </div>
              </div>

              <div className="row g-3">
                {REPORT_TYPES.map(t => {
                  const active = reportType === t.key;
                  return (
                    <div key={t.key} className="col-12 col-md-4">
                      <button
                        onClick={() => setReportType(t.key)}
                        style={{
                          width: '100%', textAlign: 'left', cursor: 'pointer',
                          border: `2px solid ${active ? t.accent : '#e5e7eb'}`,
                          borderRadius: 16,
                          padding: '18px 16px',
                          backgroundColor: active ? t.accentBg : '#fafafa',
                          transition: 'all 0.15s',
                          position: 'relative',
                          boxShadow: active ? `0 4px 20px ${t.accent}22` : 'none',
                        }}
                        onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = t.accent + '66'; e.currentTarget.style.backgroundColor = t.accentBg; }}}
                        onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.backgroundColor = '#fafafa'; }}}
                      >
                        {active && (
                          <div style={{ position: 'absolute', top: 12, right: 12, width: 22, height: 22, borderRadius: '50%', backgroundColor: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <IcCheck size={11} />
                          </div>
                        )}

                        <div style={{ fontSize: 28, marginBottom: 10 }}>{t.icon}</div>
                        <div style={{ fontWeight: 800, fontSize: 14, color: active ? t.accent : '#111827', marginBottom: 3 }}>{t.label}</div>
                        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 12 }}>{t.sub}</div>

                        <div style={{ borderTop: `1px dashed ${active ? t.accentBorder : '#e5e7eb'}`, paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
                          {t.features.map((f, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: active ? t.accent : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <IcCheck size={8} />
                              </div>
                              <span style={{ fontSize: 11, color: active ? '#374151' : '#9ca3af' }}>{f}</span>
                            </div>
                          ))}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ─── Étape 2 : Période ─── */}
            <div style={{ backgroundColor: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', padding: 28, boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <StepBadge n={2} done={step2Done} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#111827' }}>Période du rapport</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 1 }}>Définissez la plage de dates à analyser</div>
                </div>
              </div>

              {/* Raccourcis rapides */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Raccourcis rapides</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {quickDates.map(q => (
                    <QuickBtn key={q.label} label={q.label} onClick={() => { setStartDate(q.start); setEndDate(q.end); }} />
                  ))}
                </div>
              </div>

              {/* Inputs dates */}
              <div className="row g-3">
                {[
                  { label: 'Date de début', value: startDate, onChange: setStartDate },
                  { label: 'Date de fin',   value: endDate,   onChange: setEndDate   },
                ].map(({ label, value, onChange }) => (
                  <div key={label} className="col-12 col-sm-6">
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {label} <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="date" value={value}
                        onChange={e => onChange(e.target.value)}
                        style={{ width: '100%', borderRadius: 12, border: '1.5px solid #e5e7eb', padding: '11px 42px 11px 14px', fontSize: 14, outline: 'none', backgroundColor: '#fafafa', color: '#111827', transition: 'border-color 0.15s', boxSizing: 'border-box' }}
                        onFocus={e => { e.currentTarget.style.borderColor = G; e.currentTarget.style.backgroundColor = '#fff'; }}
                        onBlur={e =>  { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.backgroundColor = '#fafafa'; }}
                      />
                      <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}>
                        <IcCalendar size={16} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Résumé période sélectionnée */}
              {step2Done && (
                <div style={{ marginTop: 18, padding: '12px 16px', backgroundColor: GL, border: `1px solid ${GB}`, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <IcCalendar size={16} color={G} />
                  <div style={{ fontSize: 13, color: '#166534', fontWeight: 600 }}>
                    Rapport <strong>{cfg.label.toLowerCase()}</strong> : {fmt(startDate)} → {fmt(endDate)}
                  </div>
                  {startDate !== endDate && (
                    <Tag color={G} bg="#dcfce7" border={GB}>
                      {Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1} jour(s)
                    </Tag>
                  )}
                </div>
              )}
            </div>

            {/* ─── Étape 3 : Générer ─── */}
            <div style={{ backgroundColor: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', padding: 28, boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
                <StepBadge n={3} done={false} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#111827' }}>Génération du rapport</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 1 }}>Le rapport sera téléchargé au format PDF et Excel</div>
                </div>
              </div>

              <div className="row g-3 align-items-center">
                <div className="col-12 col-sm-auto">
                  <button
                    onClick={generateReport}
                    disabled={!canGen}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '14px 30px', borderRadius: 14, border: 'none',
                      background: canGen ? `linear-gradient(135deg, ${G}, #15803d)` : '#d1d5db',
                      color: '#fff', fontSize: 15, fontWeight: 800, cursor: canGen ? 'pointer' : 'not-allowed',
                      boxShadow: canGen ? `0 6px 24px ${G}44` : 'none',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (canGen) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 10px 32px ${G}55`; }}}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = canGen ? `0 6px 24px ${G}44` : 'none'; }}
                  >
                    {loading ? (
                      <><div className="spinner-border spinner-border-sm" style={{ width: 16, height: 16, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> Génération…</>
                    ) : (
                      <><IcDown size={18} color="#fff" /> Générer le rapport {cfg.label.toLowerCase()}</>
                    )}
                  </button>
                </div>

                <div className="col">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { icon: <IcShield size={13} color={G} />, text: 'Données sécurisées et confidentielles' },
                      { icon: <IcFile size={13} color="#1d4ed8" />, text: 'Fichiers PDF + Excel téléchargés automatiquement' },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
                        {item.icon} {item.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Barre de validation */}
              {!step2Done && (
                <div style={{ marginTop: 16, padding: '10px 14px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#92400e' }}>
                  <span>⚠️</span>
                  Veuillez sélectionner une date de début et une date de fin pour activer la génération.
                </div>
              )}
            </div>
          </div>

          {/* ── Colonne droite ── */}
          <div className="col-12 col-xl-4 d-flex flex-column gap-4">

            {/* Contenu du rapport */}
            <div style={{ backgroundColor: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: GL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IcSparkle />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>Contenu du rapport</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>Données incluses dans le PDF</div>
                </div>
              </div>
              <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {CONTENT_ITEMS.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, backgroundColor: item.bg }}>
                    <div style={{ fontSize: 18, width: 32, height: 32, borderRadius: 8, backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', flexShrink: 0 }}>
                      {item.icon}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: item.color }}>{item.label}</span>
                    <div style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%', backgroundColor: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <IcCheck size={9} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Infos format */}
            <div style={{ backgroundColor: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', padding: 20, boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#111827', marginBottom: 14 }}>Format & Sécurité</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { icon: '📄', label: 'PDF',   desc: 'Rapport complet avec graphiques et tableaux', color: '#dc2626', bg: '#fef2f2' },
                  { icon: '📊', label: 'Excel', desc: 'Données brutes exportables et analysables',   color: '#16a34a', bg: '#f0fdf4' },
                  { icon: '🔒', label: 'Sécurisé', desc: 'Données confidentielles et non partagées', color: '#7c3aed', bg: '#f5f3ff' },
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{f.icon}</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: f.color }}>{f.label}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.4 }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Aperçu école */}
            <div style={{ background: `linear-gradient(135deg, #064e29, #0A6E3F)`, borderRadius: 20, padding: 20, color: '#fff', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: -20, right: -20, width: 100, height: 100, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, position: 'relative' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.25)', flexShrink: 0 }}>
                  <img src={almanardLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>AL-MANAR D3S</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>Fondation Daroul Manar D3S</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, position: 'relative' }}>
                📍 Tivaouane, Sénégal<br />
                📞 +221 78 120 89 78<br />
                ✉️ info@almanard3s.com
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════
            HISTORIQUE
        ════════════════════════════════════ */}
        <div style={{ marginTop: 32, backgroundColor: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>

          {/* Header historique */}
          <div style={{ padding: '20px 28px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: GL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IcClock size={18} color={G} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#111827' }}>Historique des rapports</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>{history.length} rapport(s) généré(s)</div>
              </div>
            </div>
            {history.length > 0 && (
              <button onClick={() => { setHistory([]); saveHistory([]); }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9ca3af', background: 'none', border: '1px solid #e5e7eb', borderRadius: 10, padding: '6px 14px', cursor: 'pointer' }}>
                <IcTrash size={13} /> Effacer l'historique
              </button>
            )}
          </div>

          {/* Corps historique */}
          {history.length === 0 ? (
            <div style={{ padding: '56px 24px', textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: '#f9fafb', border: '2px dashed #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 32 }}>
                📂
              </div>
              <div style={{ fontWeight: 700, color: '#374151', fontSize: 15, marginBottom: 6 }}>Aucun rapport généré</div>
              <div style={{ fontSize: 13, color: '#9ca3af' }}>Les rapports que vous générez apparaîtront ici pour un accès rapide.</div>
            </div>
          ) : (
            <div style={{ padding: '20px 28px' }}>
              <div className="row g-3">
                {history.map(h => {
                  const c = TYPE_CFG[h.type];
                  return (
                    <div key={h.id} className="col-12 col-sm-6 col-lg-4">
                      <div style={{
                        borderRadius: 16, border: `1.5px solid ${c.border}`,
                        backgroundColor: c.bg, padding: '16px 18px',
                        position: 'relative', transition: 'all 0.15s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 6px 20px ${c.accent}22`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
                      >
                        {/* Supprimer */}
                        <button onClick={() => removeHistory(h.id)} title="Supprimer"
                          style={{ position: 'absolute', top: 12, right: 12, width: 24, height: 24, borderRadius: '50%', border: 'none', backgroundColor: 'rgba(0,0,0,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                          <IcTrash size={12} color="#9ca3af" />
                        </button>

                        {/* En-tête carte */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                            {c.icon}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 13, color: c.accent }}>Rapport {h.label}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#9ca3af', marginTop: 2 }}>
                              <IcClock size={11} color="#9ca3af" /> {fmtTime(h.generatedAt)}
                            </div>
                          </div>
                        </div>

                        {/* Dates */}
                        <div style={{ backgroundColor: '#fff', borderRadius: 10, padding: '8px 10px', marginBottom: 10, border: '1px solid rgba(0,0,0,0.05)' }}>
                          <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, fontWeight: 600 }}>Période</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#374151' }}>
                            <span>{fmtShort(h.startDate)}</span>
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth={2}><path strokeLinecap="round" d="M5 12h14m-5-5l5 5-5 5"/></svg>
                            <span>{fmtShort(h.endDate)}</span>
                          </div>
                        </div>

                        {/* Formats */}
                        <div style={{ display: 'flex', gap: 6 }}>
                          <Tag color={c.accent} bg="#fff" border={c.border}>📄 PDF</Tag>
                          <Tag color={c.accent} bg="#fff" border={c.border}>📊 Excel</Tag>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 11, color: '#d1d5db', paddingBottom: 8 }}>
          © {today.getFullYear()} Al-Manard3s — Fondation Daroul Manar D3S, Tivaouane, Sénégal
        </div>
      </div>
    </div>
  );
}
