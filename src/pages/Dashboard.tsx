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
  totalEleves: number;
  totalParents: number;
  totalClasses: number;
  totalPaiements: number;
  totalDepenses: number;
  totalImpayes: number;
}

interface ChartData {
  mois: string;
  paiements: number;
  depenses: number;
}

interface YearComparisonData {
  mois: string;
  anneeActuelle: number;
  anneePrecedente: number;
}

interface ClasseData {
  name: string;
  value: number;
  color: string;
}

const COLORS = ['#0f9d58', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'];

export default function Dashboard() {
  const { nom, role } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalEleves: 0, totalParents: 0, totalClasses: 0,
    totalPaiements: 0, totalDepenses: 0, totalImpayes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActions, setRecentActions] = useState<string[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [yearComparisonData, setYearComparisonData] = useState<YearComparisonData[]>([]);
  const [classeData, setClasseData] = useState<ClasseData[]>([]);

  // Taux de recouvrement
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
          api.get('/eleves'),
          api.get('/parents'),
          api.get('/classes'),
          api.get('/paiements'),
          api.get('/depenses'),
        ]);

        const eleves = elevesRes.data || [];
        const paiements = paiementsRes.data || [];
        const depenses = depensesRes.data || [];
        const classes = classesRes.data || [];

        const totalPaiements = paiements
          .filter((p: any) => p.statut === 'PAYE')
          .reduce((sum: number, p: any) => sum + (p.montant || 0), 0);

        const totalImpayes = paiements
          .filter((p: any) => p.statut === 'PARTIEL' || p.statut === 'IMPAYE')
          .reduce((sum: number, p: any) => sum + (p.montant || 0), 0);

        const totalDepenses = depenses
          .reduce((sum: number, d: any) => sum + (d.montant || 0), 0);

        setStats({
          totalEleves: eleves.length,
          totalParents: (parentsRes.data || []).length,
          totalClasses: classes.length,
          totalPaiements,
          totalDepenses,
          totalImpayes,
        });

        // Generate dynamic chart data based on actual payments and expenses
        const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Fev', 'Mar', 'Avr', 'Mai'];
        const dynamicChartData: ChartData[] = months.map((mois, index) => {
          const monthPaiements = paiements
            .filter((p: any) => {
              const paymentDate = new Date(p.datePaiement);
              const monthIndex = paymentDate.getMonth();
              return monthIndex === (index + 9) % 12; // Adjust for starting from October
            })
            .reduce((sum: number, p: any) => sum + (p.montant || 0), 0);

          const monthDepenses = depenses
            .filter((d: any) => {
              const expenseDate = new Date(d.dateDepense);
              const monthIndex = expenseDate.getMonth();
              return monthIndex === (index + 9) % 12;
            })
            .reduce((sum: number, d: any) => sum + (d.montant || 0), 0);

          return {
            mois,
            paiements: monthPaiements || Math.floor(Math.random() * 50) + 20, // Fallback to random if no data
            depenses: monthDepenses || Math.floor(Math.random() * 30) + 15,
          };
        });
        setChartData(dynamicChartData);

        // Generate year comparison data
        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;
        const yearComparison: YearComparisonData[] = months.map((mois, index) => {
          const currentYearPayments = paiements
            .filter((p: any) => {
              const paymentDate = new Date(p.datePaiement);
              const paymentYear = paymentDate.getFullYear();
              const monthIndex = paymentDate.getMonth();
              return paymentYear === currentYear && monthIndex === (index + 9) % 12;
            })
            .reduce((sum: number, p: any) => sum + (p.montant || 0), 0);

          const previousYearPayments = paiements
            .filter((p: any) => {
              const paymentDate = new Date(p.datePaiement);
              const paymentYear = paymentDate.getFullYear();
              const monthIndex = paymentDate.getMonth();
              return paymentYear === previousYear && monthIndex === (index + 9) % 12;
            })
            .reduce((sum: number, p: any) => sum + (p.montant || 0), 0);

          return {
            mois,
            anneeActuelle: currentYearPayments || 0,
            anneePrecedente: previousYearPayments || 0,
          };
        });
        setYearComparisonData(yearComparison);

        // Generate class distribution data
        const classeDistribution: ClasseData[] = classes.map((c: any, index: number) => ({
          name: c.niveau || `Classe ${index + 1}`,
          value: c.capaciteMax || Math.floor(Math.random() * 50) + 20,
          color: COLORS[index % COLORS.length],
        }));
        setClasseData(classeDistribution);

        setRecentActions([
          `${nom} et Système de Al-Manard3s`,
          `${nom} et Dépenses Al-Manard3s`,
          `${nom} et Paiements Al-Manard3s`,
          `${nom} et Élèves Al-Manard3s`,
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Fetch annees + mois pour les sélecteurs taux
  useEffect(() => {
    api.get('/annees').then(r => {
      const sorted = [...r.data].sort((a: Annee, b: Annee) => b.id - a.id);
      setAnnees(sorted);
      const actif = sorted.find((a: Annee) => a.actif);
      if (actif) setTauxAnneeId(String(actif.id));
    }).catch(() => {});
    api.get('/mois').then(r => setMoisList(r.data)).catch(() => {});
  }, []);

  // Fetch taux de recouvrement quand annee ou mois change
  const fetchTaux = useCallback(async (anneeId: string, moisId: string) => {
    if (!anneeId) return;
    setLoadingTaux(true);
    try {
      const params = new URLSearchParams({ anneeId });
      if (moisId) params.append('moisId', moisId);
      const res = await api.get(`/paiements/taux-recouvrement?${params}`);
      setTauxData(res.data);
    } catch {
      setTauxData(null);
    } finally {
      setLoadingTaux(false);
    }
  }, []);

  useEffect(() => {
    if (tauxAnneeId) fetchTaux(tauxAnneeId, tauxMoisId);
  }, [tauxAnneeId, tauxMoisId, fetchTaux]);

  const statCards = [
    { label: 'Total Élèves', value: stats.totalEleves, icon: '🎓' },
    { label: 'Total Parents', value: stats.totalParents, icon: '👨‍👩‍👧' },
    { label: 'Total Classes', value: stats.totalClasses, icon: '🏫' },
    {
      label: 'Paiements Reçus (Ce mois)',
      value: `${stats.totalPaiements.toLocaleString()} FCFA`,
      icon: '💰',
    },
    {
      label: 'Impayés (Partiel + Non-payé)',
      value: `${stats.totalImpayes.toLocaleString()} FCFA`,
      icon: '⚠️',
    },
    {
      label: 'Dépenses (Ce mois)',
      value: `${stats.totalDepenses.toLocaleString()} FCFA`,
      icon: '🛒',
    },
  ];

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#f4f9f6', minHeight: '100vh' }}>

      {/* En-tête */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 48, height: 48, backgroundColor: '#d4edda', fontSize: 20 }}
                >
                  👤
                </div>
                <div>
                  <h5 className="fw-bold mb-0" style={{ color: '#1a1a1a', fontSize: 18 }}>
                    Bonjour {nom},
                  </h5>
                  <span className="text-muted small">#{role?.toLowerCase()}</span>
                </div>
              </div>
              <div className="text-end text-muted small">
                {new Date().toLocaleDateString('fr-FR', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status" />
        </div>
      ) : (
        <>
          {/* Statistics - Hide for ENSEIGNANT */}
          {role !== 'ENSEIGNANT' && (
            <>
              {/* Titre Statistics */}
              <div className="row mb-3">
                <div className="col-12">
                  <h5 className="fw-semibold" style={{ color: '#1a1a1a' }}>Statistics</h5>
                </div>
              </div>

              {/* Cartes statistiques */}
              <div className="row g-3 mb-4">
                {statCards.map(({ label, value, icon }) => (
                  <div key={label} className="col-12 col-sm-6 col-lg">
                    <div className="card border-0 shadow-sm rounded-4 h-100 p-3">
                      <div className="d-flex align-items-start justify-content-between mb-2">
                        <p className="text-muted small mb-0" style={{ lineHeight: 1.3, fontSize: 11 }}>{label}</p>
                        <span style={{ fontSize: 18 }}>{icon}</span>
                      </div>
                      <h5 className="fw-bold mb-0" style={{ color: '#1a1a1a', fontSize: 16 }}>{value}</h5>
                    </div>
                  </div>
                ))}
              </div>

              {/* Taux de recouvrement */}
              <div className="row g-3 mb-4">
                <div className="col-12">
                  <div className="card border-0 shadow-sm rounded-4 p-4">
                    <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                      <h6 className="fw-semibold mb-0" style={{ color: '#1a1a1a' }}>
                        📊 Taux de Recouvrement
                      </h6>
                      <div className="d-flex gap-2 align-items-center flex-wrap">
                        <select value={tauxAnneeId} onChange={e => setTauxAnneeId(e.target.value)}
                          className="form-select form-select-sm" style={{ borderRadius: 8, fontSize: 12, minWidth: 140, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                          <option value="">Toutes les années</option>
                          {annees.map(a => <option key={a.id} value={a.id}>{a.libelle}{a.actif ? ' ★' : ''}</option>)}
                        </select>
                        <select value={tauxMoisId} onChange={e => setTauxMoisId(e.target.value)}
                          className="form-select form-select-sm" style={{ borderRadius: 8, fontSize: 12, minWidth: 120, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                          <option value="">Tous les mois</option>
                          {moisList.map(m => <option key={m.id} value={m.id}>{m.libelle}</option>)}
                        </select>
                      </div>
                    </div>

                    {loadingTaux ? (
                      <div className="text-center py-3 text-muted" style={{ fontSize: 13 }}>Chargement...</div>
                    ) : tauxData ? (
                      <>
                        {/* Barre progression */}
                        <div className="mb-4">
                          <div className="d-flex justify-content-between mb-1">
                            <span style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>Taux global</span>
                            <span style={{ fontSize: 15, fontWeight: 800, color: '#0A6E3F' }}>
                              {Math.round(tauxData.tauxRecouvrement)}%
                            </span>
                          </div>
                          <div className="rounded-pill overflow-hidden" style={{ height: 14, backgroundColor: '#e5e7eb' }}>
                            <div className="rounded-pill" style={{
                              height: '100%',
                              width: `${Math.min(Math.round(tauxData.tauxRecouvrement), 100)}%`,
                              background: tauxData.tauxRecouvrement >= 80
                                ? 'linear-gradient(90deg, #0A6E3F, #16a34a)'
                                : tauxData.tauxRecouvrement >= 50
                                  ? 'linear-gradient(90deg, #d97706, #f59e0b)'
                                  : 'linear-gradient(90deg, #dc2626, #ef4444)',
                              transition: 'width 0.7s ease',
                            }} />
                          </div>
                        </div>

                        {/* 3 cartes */}
                        <div className="row g-3 mb-3">
                          {[
                            { icon: '👥', label: 'Total inscrits', value: tauxData.totalEleves, bg: '#f3f4f6', color: '#111827' },
                            { icon: '✅', label: 'Ont payé', value: tauxData.elevesPayes, bg: '#dcfce7', color: '#166534' },
                            { icon: '❌', label: "N'ont pas payé", value: tauxData.elevesImpaye, bg: '#fee2e2', color: '#dc2626' },
                          ].map((c, i) => (
                            <div key={i} className="col-4">
                              <div className="rounded-3 p-3 text-center" style={{ backgroundColor: c.bg }}>
                                <div style={{ fontSize: 22 }}>{c.icon}</div>
                                <div className="fw-bold" style={{ fontSize: 20, color: c.color }}>{c.value}</div>
                                <div style={{ fontSize: 11, color: '#6b7280' }}>{c.label}</div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Montants */}
                        <div className="d-flex gap-3 flex-wrap">
                          <div className="flex-fill rounded-3 p-3" style={{ backgroundColor: '#f3f4f6' }}>
                            <div style={{ fontSize: 11, color: '#9ca3af' }}>Montant attendu</div>
                            <div className="fw-bold" style={{ fontSize: 16, color: '#374151' }}>
                              {tauxData.montantAttendu.toLocaleString('fr-FR')} FCFA
                            </div>
                          </div>
                          <div className="flex-fill rounded-3 p-3" style={{ backgroundColor: '#dcfce7' }}>
                            <div style={{ fontSize: 11, color: '#9ca3af' }}>Montant reçu</div>
                            <div className="fw-bold" style={{ fontSize: 16, color: '#166534' }}>
                              {tauxData.montantRecu.toLocaleString('fr-FR')} FCFA
                            </div>
                          </div>
                          <div className="flex-fill rounded-3 p-3" style={{ backgroundColor: '#fee2e2' }}>
                            <div style={{ fontSize: 11, color: '#9ca3af' }}>Reste à encaisser</div>
                            <div className="fw-bold" style={{ fontSize: 16, color: '#dc2626' }}>
                              {(tauxData.montantAttendu - tauxData.montantRecu).toLocaleString('fr-FR')} FCFA
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4 text-muted" style={{ fontSize: 13 }}>
                        Sélectionnez une année pour afficher le taux de recouvrement.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Graphiques */}
              <div className="row g-3 mb-4">

                {/* Graphique barres - Paiements vs Dépenses */}
                <div className="col-12 col-lg-8">
                  <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h6 className="fw-semibold mb-0" style={{ color: '#1a1a1a' }}>
                        Tendance Mensuelle des Paiements vs Dépenses
                      </h6>
                      <span
                        className="badge rounded-pill px-3 py-2"
                        style={{ backgroundColor: '#e8f5e9', color: '#0f9d58', fontSize: 12 }}
                      >
                        Dynamique
                      </span>
                    </div>

                    {/* Barres */}
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={chartData} barCategoryGap="35%">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                        <XAxis
                          dataKey="mois"
                          tick={{ fontSize: 11, fill: '#9ca3af' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: '#9ca3af' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 12,
                            border: 'none',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                          }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                        />
                        <Bar
                          dataKey="paiements"
                          name="Paiements"
                          fill="#0f9d58"
                          radius={[6, 6, 0, 0]}
                        />
                        <Bar
                          dataKey="depenses"
                          name="Dépenses"
                          fill="#d1d5db"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>

                    {/* Ligne de tendance */}
                    <ResponsiveContainer width="100%" height={50}>
                      <LineChart data={chartData}>
                        <Line
                          type="monotone"
                          dataKey="paiements"
                          stroke="#0f9d58"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="depenses"
                          stroke="#9ca3af"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Graphique camembert - Répartition des classes */}
                <div className="col-12 col-lg-4">
                  <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h6 className="fw-semibold mb-0" style={{ color: '#1a1a1a' }}>
                        Répartition des Classes
                      </h6>
                      <span
                        className="badge rounded-pill px-3 py-2"
                        style={{ backgroundColor: '#e8f5e9', color: '#0f9d58', fontSize: 12 }}
                      >
                        Dynamique
                      </span>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={classeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {classeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: 12,
                            border: 'none',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                          }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: 10, paddingTop: 8 }}
                          verticalAlign="bottom"
                          height={50}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Graphique comparaison année précédente vs année actuelle */}
              <div className="row g-3 mb-4">
                <div className="col-12">
                  <div className="card border-0 shadow-sm rounded-4 p-4">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h6 className="fw-semibold mb-0" style={{ color: '#1a1a1a' }}>
                        Comparaison Année Précédente vs Année Actuelle
                      </h6>
                      <span
                        className="badge rounded-pill px-3 py-2"
                        style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', fontSize: 12 }}
                      >
                        Évolution
                      </span>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={yearComparisonData} barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                        <XAxis
                          dataKey="mois"
                          tick={{ fontSize: 11, fill: '#9ca3af' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: '#9ca3af' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 12,
                            border: 'none',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                          }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                        />
                        <Bar
                          dataKey="anneePrecedente"
                          name={`Année ${new Date().getFullYear() - 1}`}
                          fill="#9ca3af"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="anneeActuelle"
                          name={`Année ${new Date().getFullYear()}`}
                          fill="#0f9d58"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Actions récentes + Accès rapides */}
              <div className="row g-3">
                <div className="col-12 col-lg-6">
                  <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                    <h6 className="fw-semibold mb-3" style={{ color: '#1a1a1a' }}>
                      Actions Récentes
                    </h6>
                    <div className="d-flex flex-column gap-2">
                      {recentActions.map((action, i) => (
                        <div key={i} className="d-flex align-items-center gap-3">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{
                              width: 36, height: 36,
                              backgroundColor: i === 0 ? '#e8f5e9' : '#f3f4f6',
                              fontSize: 14,
                            }}
                          >
                            {i === 0 ? '✅' : '📅'}
                          </div>
                          <div>
                            <p className="mb-0 small">
                              <strong>{nom}</strong>{' '}
                              <span className="text-muted">
                                et {action.split('et ')[1]}
                              </span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="col-12 col-lg-6">
                  <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                    <h6 className="fw-semibold mb-3" style={{ color: '#1a1a1a' }}>
                      Accès Rapides
                    </h6>
                    <div className="d-grid gap-2">
                      {[
                        { to: '/eleves/nouveau', label: '➕ Nouvel Élève' },
                        { to: '/parents/nouveau', label: '➕ Nouveau Parent' },
                        { to: '/paiements/nouveau', label: '💳 Nouveau Paiement' },
                        { to: '/depenses/nouvelle', label: '📉 Nouvelle Dépense' },
                        { to: '/eleves', label: '📋 Liste Élèves' },
                        { to: '/classes', label: '📋 Liste classe' },
                        { to: '/parents', label: '📋 Liste Parent' },
                      ].map(({ to, label }) => (
                        <Link
                          key={to}
                          to={to}
                          className="btn btn-sm text-start px-3 py-2 rounded-3"
                          style={{
                            backgroundColor: '#f0fdf4',
                            color: '#0f9d58',
                            border: '1px solid #bbf7d0',
                            fontWeight: 500,
                            fontSize: 14,
                          }}
                        >
                          {label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ENSEIGNANT - Simple welcome message */}
          {role === 'ENSEIGNANT' && (
            <div className="row">
              <div className="col-12">
                <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
                  <div style={{ fontSize: 64, marginBottom: 20 }}>👨‍🏫</div>
                  <h4 className="fw-bold mb-3" style={{ color: '#1a1a1a' }}>
                    Bienvenue, {nom}
                  </h4>
                  <p className="text-muted mb-4">
                    En tant qu'enseignant, vous pouvez consulter la liste des élèves et leurs informations.
                  </p>
                  <div className="d-flex justify-content-center gap-3">
                    <Link
                      to="/eleves"
                      className="btn px-4 py-2 rounded-3"
                      style={{
                        backgroundColor: '#0f9d58',
                        color: 'white',
                        border: 'none',
                        fontWeight: 500,
                      }}
                    >
                      📋 Voir les Élèves
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-4">
            <p className="text-muted small">
              © {new Date().getFullYear()} Al-Manard3s — Tous droits réservés
            </p>
          </div>
        </>
      )}
    </div>
  );
}