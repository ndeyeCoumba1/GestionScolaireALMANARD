import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../Context/AuthContext';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

interface Stats {
  totalEleves: number;
  totalParents: number;
  totalClasses: number;
  totalPaiements: number;
  totalDepenses: number;
}

const chartData = [
  { mois: 'Oct', paiements: 20, depenses: 15 },
  { mois: 'Nov', paiements: 35, depenses: 20 },
  { mois: 'Dec', paiements: 40, depenses: 25 },
  { mois: 'Jan', paiements: 30, depenses: 18 },
  { mois: 'Fev', paiements: 45, depenses: 30 },
  { mois: 'Mar', paiements: 60, depenses: 35 },
  { mois: 'Avr', paiements: 50, depenses: 28 },
  { mois: 'Mai', paiements: 65, depenses: 40 },
];

export default function Dashboard() {
  const { nom, role } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalEleves: 0, totalParents: 0, totalClasses: 0,
    totalPaiements: 0, totalDepenses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActions, setRecentActions] = useState<string[]>([]);

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

        const totalPaiements = paiements
          .filter((p: any) => p.statut === 'PAYE')
          .reduce((sum: number, p: any) => sum + (p.montant || 0), 0);

        const totalDepenses = depenses
          .reduce((sum: number, d: any) => sum + (d.montant || 0), 0);

        setStats({
          totalEleves: eleves.length,
          totalParents: (parentsRes.data || []).length,
          totalClasses: (classesRes.data || []).length,
          totalPaiements,
          totalDepenses,
        });

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
                  style={{ width: 56, height: 56, backgroundColor: '#d4edda', fontSize: 24 }}
                >
                  👤
                </div>
                <div>
                  <h4 className="fw-bold mb-0" style={{ color: '#1a1a1a' }}>
                    Bonjour {nom},
                  </h4>
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
                <div className="card border-0 shadow-sm rounded-4 h-100 p-4">
                  <div className="d-flex align-items-start justify-content-between mb-3">
                    <p className="text-muted small mb-0" style={{ lineHeight: 1.3 }}>{label}</p>
                    <span style={{ fontSize: 22 }}>{icon}</span>
                  </div>
                  <h3 className="fw-bold mb-0" style={{ color: '#1a1a1a' }}>{value}</h3>
                </div>
              </div>
            ))}
          </div>

          {/* Graphique + Actions */}
          <div className="row g-3">

            {/* Graphique */}
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
                    Stable
                  </span>
                </div>

                {/* Barres */}
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} barCategoryGap="35%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis
                      dataKey="mois"
                      tick={{ fontSize: 12, fill: '#9ca3af' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#9ca3af' }}
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
                      wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
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
                <ResponsiveContainer width="100%" height={60}>
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

            {/* Actions récentes + Accès rapides */}
            <div className="col-12 col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100">

                {/* Actions récentes */}
                <h6 className="fw-semibold mb-3" style={{ color: '#1a1a1a' }}>
                  Actions Récentes
                </h6>
                <div className="d-flex flex-column gap-2 mb-4">
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

                {/* Séparateur */}
                <hr className="my-3" style={{ borderColor: '#e5e7eb' }} />

                {/* Accès rapides */}
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