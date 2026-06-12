import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../Context/AuthContext';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import type { TauxRecouvrementDTO } from '../Types/paiement';
import type { Annee, Mois } from '../Types/index';

interface Stats {
  totalEleves: number; totalParents: number; totalClasses: number;
  totalPaiements: number; totalDepenses: number; totalImpayes: number;
}
interface ChartData { mois: string; paiements: number; depenses: number; }
interface YearComparisonData { mois: string; anneeActuelle: number; anneePrecedente: number; }
interface ClasseData { name: string; value: number; color: string; }

const COLORS = ['#0A6E3F','#1d4ed8','#7c3aed','#d97706','#dc2626','#0f766e'];

const QUICK_LINKS = [
  { to: '/eleves',       icon: '🎓', label: 'Élèves',      desc: 'Gérer les élèves',   accent: '#0A6E3F', bg: '#f0fdf4', border: '#bbf7d0' },
  { to: '/parents',      icon: '👪', label: 'Parents',     desc: 'Gérer les parents',  accent: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
  { to: '/paiements',    icon: '💳', label: 'Paiements',   desc: 'Suivi des paiements',accent: '#0f766e', bg: '#f0fdfa', border: '#99f6e4' },
  { to: '/depenses',     icon: '💸', label: 'Dépenses',    desc: 'Gérer les dépenses', accent: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  { to: '/inscriptions', icon: '📋', label: 'Inscriptions',desc: 'Gérer les inscrip.', accent: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd' },
  { to: '/classes',      icon: '🏫', label: 'Classes',     desc: 'Gérer les classes',  accent: '#d97706', bg: '#fffbeb', border: '#fde68a' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bonjour';
  if (h < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Administrateur', COMPTABLE: 'Comptable',
  ENSEIGNANT: 'Enseignant', RECITATEUR: 'Récitateur',
};

export default function Dashboard() {
  const { nom, role } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalEleves: 0, totalParents: 0, totalClasses: 0,
    totalPaiements: 0, totalDepenses: 0, totalImpayes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [yearComparisonData, setYearComparisonData] = useState<YearComparisonData[]>([]);
  const [classeData, setClasseData] = useState<ClasseData[]>([]);

  const [annees, setAnnees] = useState<Annee[]>([]);
  const [moisList, setMoisList] = useState<Mois[]>([]);
  const [tauxAnneeId, setTauxAnneeId] = useState('');
  const [tauxMoisId, setTauxMoisId] = useState('');
  const [tauxData, setTauxData] = useState<TauxRecouvrementDTO | null>(null);
  const [loadingTaux, setLoadingTaux] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [elevesRes, parentsRes, classesRes, paiementsRes, depensesRes] = await Promise.all([
          api.get('/eleves'), api.get('/parents'), api.get('/classes'),
          api.get('/paiements'), api.get('/depenses'),
        ]);
        const eleves = elevesRes.data || [];
        const paiements = paiementsRes.data || [];
        const depenses = depensesRes.data || [];
        const classes = classesRes.data || [];

        const totalPaiements = paiements.filter((p: any) => p.statut === 'PAYE').reduce((s: number, p: any) => s + (p.montant || 0), 0);
        const totalImpayes   = paiements.filter((p: any) => p.statut === 'PARTIEL' || p.statut === 'IMPAYE').reduce((s: number, p: any) => s + (p.montant || 0), 0);
        const totalDepenses  = depenses.reduce((s: number, d: any) => s + (d.montant || 0), 0);

        setStats({ totalEleves: eleves.length, totalParents: (parentsRes.data || []).length, totalClasses: classes.length, totalPaiements, totalDepenses, totalImpayes });

        const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Fev', 'Mar', 'Avr', 'Mai'];
        setChartData(months.map((mois, idx) => ({
          mois,
          paiements: paiements.filter((p: any) => new Date(p.datePaiement).getMonth() === (idx + 9) % 12).reduce((s: number, p: any) => s + (p.montant || 0), 0) || 0,
          depenses:  depenses.filter((d: any)  => new Date(d.dateDepense).getMonth()  === (idx + 9) % 12).reduce((s: number, d: any) => s + (d.montant || 0), 0) || 0,
        })));

        const cy = new Date().getFullYear();
        setYearComparisonData(months.map((mois, idx) => ({
          mois,
          anneeActuelle:  paiements.filter((p: any) => { const d = new Date(p.datePaiement); return d.getFullYear() === cy   && d.getMonth() === (idx+9)%12; }).reduce((s: number, p: any) => s + (p.montant||0), 0),
          anneePrecedente: paiements.filter((p: any) => { const d = new Date(p.datePaiement); return d.getFullYear() === cy-1 && d.getMonth() === (idx+9)%12; }).reduce((s: number, p: any) => s + (p.montant||0), 0),
        })));

        setClasseData(classes.map((c: any, i: number) => ({ name: c.niveau || `Classe ${i+1}`, value: c.capaciteMax || 30, color: COLORS[i % COLORS.length] })));
      } catch {} finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    api.get('/annees').then(r => {
      const sorted = [...r.data].sort((a: Annee, b: Annee) => b.id - a.id);
      setAnnees(sorted);
      const actif = sorted.find((a: Annee) => a.actif);
      if (actif) setTauxAnneeId(String(actif.id));
    }).catch(() => {});
    api.get('/mois').then(r => setMoisList(r.data)).catch(() => {});
  }, []);

  const fetchTaux = useCallback(async (anneeId: string, moisId: string) => {
    if (!anneeId) return;
    setLoadingTaux(true);
    try {
      const params = new URLSearchParams({ anneeId });
      if (moisId) params.append('moisId', moisId);
      const res = await api.get(`/paiements/taux-recouvrement?${params}`);
      setTauxData(res.data);
    } catch { setTauxData(null); }
    finally { setLoadingTaux(false); }
  }, []);

  useEffect(() => { if (tauxAnneeId) fetchTaux(tauxAnneeId, tauxMoisId); }, [tauxAnneeId, tauxMoisId, fetchTaux]);

  const kpiCards = [
    { icon: '🎓', label: 'Total élèves',   value: stats.totalEleves,    sub: 'inscrits dans l\'établissement', accent: '#0A6E3F',  bg: '#f0fdf4',  border: '#22c55e' },
    { icon: '👪', label: 'Total parents',   value: stats.totalParents,   sub: 'responsables enregistrés',       accent: '#1d4ed8',  bg: '#eff6ff',  border: '#3b82f6' },
    { icon: '🏫', label: 'Classes',         value: stats.totalClasses,   sub: 'niveaux disponibles',            accent: '#d97706',  bg: '#fffbeb',  border: '#f59e0b' },
    { icon: '✅', label: 'Paiements reçus', value: `${stats.totalPaiements.toLocaleString('fr-FR')} FCFA`, sub: 'total encaissé', accent: '#0f766e', bg: '#f0fdfa', border: '#14b8a6' },
    { icon: '⚠️', label: 'Impayés',         value: `${stats.totalImpayes.toLocaleString('fr-FR')} FCFA`,  sub: 'partiel + non payé', accent: '#dc2626', bg: '#fef2f2', border: '#ef4444' },
    { icon: '💸', label: 'Dépenses',        value: `${stats.totalDepenses.toLocaleString('fr-FR')} FCFA`, sub: 'charges enregistrées', accent: '#7c3aed', bg: '#f5f3ff', border: '#8b5cf6' },
  ];

  const tauxPct = tauxData ? Math.min(Math.round(tauxData.tauxRecouvrement), 100) : 0;
  const tauxColor = tauxPct >= 80 ? '#0A6E3F' : tauxPct >= 50 ? '#d97706' : '#dc2626';
  const tauxGrad  = tauxPct >= 80
    ? 'linear-gradient(90deg, #0A6E3F, #16a34a)'
    : tauxPct >= 50
      ? 'linear-gradient(90deg, #d97706, #f59e0b)'
      : 'linear-gradient(90deg, #dc2626, #ef4444)';

  return (
    <div className="d-flex flex-column gap-4" style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>

      {/* ── Bannière de bienvenue ── */}
      <div className="rounded-4 overflow-hidden shadow-sm position-relative" style={{ background: 'linear-gradient(135deg, #0A6E3F 0%, #15803d 60%, #166534 100%)', padding: '32px 36px' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -30, right: 180, width: 120, height: 120, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', top: 20, right: 80, width: 60, height: 60, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)' }} />

        <div className="d-flex align-items-center justify-content-between gap-4 flex-wrap position-relative">
          <div className="d-flex align-items-center gap-4">
            <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 68, height: 68, backgroundColor: 'rgba(255,255,255,0.15)', fontSize: 32, backdropFilter: 'blur(4px)' }}>
              👤
            </div>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
                Portail Français — Al-Manard3s
              </div>
              <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.3px' }}>
                {getGreeting()}, {nom} 👋
              </h1>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 600, color: '#fff' }}>
                  {ROLE_LABEL[role ?? ''] ?? role}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                  {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {role !== 'ENSEIGNANT' && (
            <div className="d-flex flex-column align-items-end gap-2">
              <div className="d-flex gap-2">
                {[
                  { label: 'Nouvel élève', to: '/eleves' },
                  { label: 'Paiement', to: '/paiements' },
                ].map(l => (
                  <Link key={l.to} to={l.to} style={{ backgroundColor: '#fff', color: '#0A6E3F', borderRadius: 10, padding: '8px 18px', fontSize: 13, fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 6, transition: 'transform 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                    <span>+</span>{l.label}
                  </Link>
                ))}
              </div>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>© {new Date().getFullYear()} Fondation Daroul Manar D3S</span>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <div className="d-flex flex-column align-items-center gap-3">
            <div className="spinner-border" style={{ width: 40, height: 40, color: '#0A6E3F', borderWidth: 3 }} role="status" />
            <span className="text-center" style={{ fontSize: 13, color: '#9ca3af' }}>Chargement du tableau de bord…</span>
          </div>
        </div>
      ) : (
        <>
          {role !== 'ENSEIGNANT' && (
            <>
              {/* ── KPI Cards ── */}
              <div className="row g-3">
                {kpiCards.map((c, i) => (
                  <div key={i} className="col-6 col-lg-2">
                    <div className="bg-white rounded-3 shadow-sm h-100" style={{ border: '1px solid #f0f0f0', borderLeft: `3px solid ${c.border}`, overflow: 'hidden' }}>
                      <div style={{ padding: '12px 16px' }}>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <div className="rounded-2 d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, backgroundColor: c.bg, fontSize: 15 }}>{c.icon}</div>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: c.border }} />
                        </div>
                        <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{c.label}</div>
                        <div style={{ fontSize: typeof c.value === 'string' && c.value.length > 10 ? 13 : 18, fontWeight: 800, color: c.accent, lineHeight: 1.2 }}>{c.value}</div>
                        <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>{c.sub}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Accès rapides ── */}
              <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0' }}>
                <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Navigation</div>
                <p className="fw-bold mb-0" style={{ fontSize: 14, color: '#111827', marginBottom: 16 }}>Accès Rapides</p>
                <div className="row g-3">
                  {QUICK_LINKS.map(l => (
                    <div key={l.to} className="col-6 col-md-4 col-lg-2">
                      <Link to={l.to} style={{ textDecoration: 'none' }}>
                        <div className="rounded-3 d-flex flex-column align-items-center justify-content-center p-3 gap-2 text-center"
                          style={{ backgroundColor: l.bg, border: `1.5px solid ${l.border}`, transition: 'all 0.15s', cursor: 'pointer', minHeight: 90 }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
                          <span style={{ fontSize: 26 }}>{l.icon}</span>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 12, color: l.accent }}>{l.label}</div>
                            <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>{l.desc}</div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Taux de recouvrement ── */}
              <div className="bg-white rounded-4 shadow-sm overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
                <div style={{ borderBottom: '1px solid #f3f4f6', padding: '20px 24px' }}>
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div>
                      <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Finance</div>
                      <h6 className="fw-bold mb-0" style={{ color: '#111827', fontSize: 15 }}>Taux de Recouvrement</h6>
                    </div>
                    <div className="d-flex gap-2 align-items-center flex-wrap">
                      <select value={tauxAnneeId} onChange={e => setTauxAnneeId(e.target.value)}
                        style={{ borderRadius: 8, fontSize: 12, minWidth: 145, border: '1.5px solid #e5e7eb', backgroundColor: '#f9fafb', padding: '6px 10px', outline: 'none', color: '#374151' }}>
                        <option value="">Toutes les années</option>
                        {annees.map(a => <option key={a.id} value={a.id}>{a.libelle}{a.actif ? ' ★' : ''}</option>)}
                      </select>
                      <select value={tauxMoisId} onChange={e => setTauxMoisId(e.target.value)}
                        style={{ borderRadius: 8, fontSize: 12, minWidth: 125, border: '1.5px solid #e5e7eb', backgroundColor: '#f9fafb', padding: '6px 10px', outline: 'none', color: '#374151' }}>
                        <option value="">Tous les mois</option>
                        {moisList.map(m => <option key={m.id} value={m.id}>{m.libelle}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '24px' }}>
                  {loadingTaux ? (
                    <div className="text-center py-4" style={{ color: '#9ca3af', fontSize: 13 }}>
                      <div className="spinner-border spinner-border-sm me-2" style={{ color: '#0A6E3F' }} />
                      Chargement…
                    </div>
                  ) : tauxData ? (
                    <div className="d-flex flex-column gap-4">
                      {/* Barre + % */}
                      <div>
                        <div className="d-flex align-items-end justify-content-between mb-2">
                          <div>
                            <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>Taux global de recouvrement</div>
                            <div style={{ fontSize: 36, fontWeight: 900, color: tauxColor, lineHeight: 1 }}>
                              {Math.round(tauxData.tauxRecouvrement)}%
                            </div>
                          </div>
                          <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'right' }}>
                            <div>{tauxData.elevesPayes} élèves ont payé</div>
                            <div>{tauxData.elevesImpaye} n'ont pas payé</div>
                          </div>
                        </div>
                        <div className="rounded-pill overflow-hidden" style={{ height: 10, backgroundColor: '#f3f4f6' }}>
                          <div className="rounded-pill" style={{ height: '100%', width: `${tauxPct}%`, background: tauxGrad, transition: 'width 0.8s ease' }} />
                        </div>
                      </div>

                      {/* 3 mini blocs élèves */}
                      <div className="row g-3">
                        {[
                          { icon: '👥', label: 'Total inscrits',   value: tauxData.totalEleves,   bg: '#f8fafc', accent: '#374151',  border: '#e5e7eb' },
                          { icon: '✅', label: 'Ont payé',          value: tauxData.elevesPayes,   bg: '#f0fdf4', accent: '#166534',  border: '#bbf7d0' },
                          { icon: '❌', label: "N'ont pas payé",    value: tauxData.elevesImpaye,  bg: '#fef2f2', accent: '#dc2626',  border: '#fecaca' },
                        ].map((c, i) => (
                          <div key={i} className="col-4">
                            <div className="rounded-3 d-flex align-items-center gap-3 p-3" style={{ backgroundColor: c.bg, border: `1px solid ${c.border}` }}>
                              <span style={{ fontSize: 22 }}>{c.icon}</span>
                              <div>
                                <div style={{ fontSize: 20, fontWeight: 800, color: c.accent, lineHeight: 1 }}>{c.value}</div>
                                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{c.label}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Montants */}
                      <div className="row g-3">
                        {[
                          { label: 'Montant attendu',     value: tauxData.montantAttendu,                              bg: '#f8fafc', accent: '#374151',  border: '#e5e7eb' },
                          { label: 'Montant reçu',        value: tauxData.montantRecu,                                 bg: '#f0fdf4', accent: '#166534',  border: '#bbf7d0' },
                          { label: 'Reste à encaisser',   value: tauxData.montantAttendu - tauxData.montantRecu,       bg: '#fef2f2', accent: '#dc2626',  border: '#fecaca' },
                        ].map((c, i) => (
                          <div key={i} className="col-4">
                            <div className="rounded-3 p-3" style={{ backgroundColor: c.bg, border: `1px solid ${c.border}` }}>
                              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{c.label}</div>
                              <div style={{ fontSize: 14, fontWeight: 800, color: c.accent, whiteSpace: 'nowrap' }}>
                                {c.value.toLocaleString('fr-FR')} FCFA
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="d-flex flex-column align-items-center justify-content-center py-4 gap-2">
                      <span style={{ fontSize: 28 }}>📊</span>
                      <span style={{ fontSize: 13, color: '#9ca3af' }}>Sélectionnez une année pour afficher le taux de recouvrement</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Graphiques ── */}
              <div className="row g-3">
                <div className="col-12 col-lg-8">
                  <div className="bg-white rounded-4 shadow-sm p-4 h-100" style={{ border: '1px solid #f0f0f0' }}>
                    <div className="d-flex align-items-start justify-content-between mb-1">
                      <div>
                        <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Analyse mensuelle</div>
                        <p className="fw-bold mb-0" style={{ fontSize: 14, color: '#111827' }}>Paiements vs Dépenses</p>
                      </div>
                      <span style={{ backgroundColor: '#f0fdf4', color: '#0A6E3F', border: '1px solid #bbf7d0', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>Dynamique</span>
                    </div>
                    <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 16 }}>Évolution sur 8 mois</p>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={chartData} barCategoryGap="35%">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                        <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                        <Bar dataKey="paiements" name="Paiements" fill="#0A6E3F" radius={[6,6,0,0]} />
                        <Bar dataKey="depenses"  name="Dépenses"  fill="#e5e7eb" radius={[6,6,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                    <div style={{ marginTop: 8, borderTop: '1px solid #f3f4f6', paddingTop: 8 }}>
                      <ResponsiveContainer width="100%" height={44}>
                        <LineChart data={chartData}>
                          <Line type="monotone" dataKey="paiements" stroke="#0A6E3F" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="depenses"  stroke="#9ca3af" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-lg-4">
                  <div className="bg-white rounded-4 shadow-sm p-4 h-100" style={{ border: '1px solid #f0f0f0' }}>
                    <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Organisation</div>
                    <p className="fw-bold mb-0" style={{ fontSize: 14, color: '#111827' }}>Répartition des Classes</p>
                    <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8 }}>Capacité par niveau</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={classeData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={4} dataKey="value">
                          {classeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 12 }} />
                        <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* ── Comparaison années ── */}
              <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0' }}>
                <div className="d-flex align-items-start justify-content-between mb-1">
                  <div>
                    <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Comparaison</div>
                    <p className="fw-bold mb-0" style={{ fontSize: 14, color: '#111827' }}>Année précédente vs Année actuelle</p>
                  </div>
                  <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>Évolution</span>
                </div>
                <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 16 }}>Paiements {new Date().getFullYear()-1} vs {new Date().getFullYear()}</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={yearComparisonData} barCategoryGap="25%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                    <Bar dataKey="anneePrecedente" name={`${new Date().getFullYear()-1}`} fill="#e5e7eb" radius={[4,4,0,0]} />
                    <Bar dataKey="anneeActuelle"   name={`${new Date().getFullYear()}`}   fill="#0A6E3F" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </>
          )}

          {/* ── Vue ENSEIGNANT ── */}
          {role === 'ENSEIGNANT' && (
            <div className="bg-white rounded-4 shadow-sm p-5 text-center" style={{ border: '1px solid #f0f0f0' }}>
              <div style={{ fontSize: 64, marginBottom: 20 }}>👨‍🏫</div>
              <h4 className="fw-bold mb-2" style={{ color: '#111827', fontSize: 22 }}>Bienvenue, {nom}</h4>
              <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 28 }}>
                En tant qu'enseignant, vous pouvez consulter la liste des élèves et leurs informations.
              </p>
              <Link to="/eleves" style={{ backgroundColor: '#0A6E3F', color: '#fff', borderRadius: 10, padding: '12px 28px', fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                📋 Voir les Élèves
              </Link>
            </div>
          )}

          {/* ── Footer ── */}
          <div style={{ borderTop: '1px solid #f3f4f6', padding: '12px 0', textAlign: 'center', fontSize: 11, color: '#d1d5db' }}>
            © {new Date().getFullYear()} Al-Manard3s / Fondation Daroul Manar D3S
          </div>
        </>
      )}
    </div>
  );
}
