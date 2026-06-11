import { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import api from '../../api/axios';
import { Users, BookOpen, CheckCircle, TrendingUp, Calendar, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';

const C_GREEN = '#0A6E3F';
const C_GREEN_L = '#e8f5e9';
const C_PURPLE = '#7c3aed';
const C_BLUE = '#2563eb';
const C_BLUE_L = '#dbeafe';
const C_AMBER = '#d97706';
const C_AMBER_L = '#fef3c7';
const C_GRAY = '#e5e7eb';

interface ClasseStat {
  niveau: string;
  tauxPresence: number;
  tauxMemorisation: number;
}

interface DayActivity {
  jour: string;
  seances: number;
  revisions: number;
}

export default function ArDashboardPage() {
  const { role, nom } = useAuth();
  const [stats, setStats] = useState({
    totalEleves: 0,
    sessionsToday: 0,
    revisionsToday: 0,
    tauxPresence: 0,
    tauxMemorisation: 0,
  });
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [classesStats, setClassesStats] = useState<ClasseStat[]>([]);
  const [dailyActivity, setDailyActivity] = useState<DayActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weeklyStats, setWeeklyStats] = useState({ totalSeances: 0, totalRevisions: 0, tauxPresence: 0, tauxMemorisation: 0 });
  const [monthlyStats, setMonthlyStats] = useState({ totalSeances: 0, totalRevisions: 0, tauxPresence: 0, tauxMemorisation: 0 });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date(); monthAgo.setDate(monthAgo.getDate() - 30);
      await Promise.all([
        fetchStats(),
        fetchRecentSessions(),
        fetchPeriodStats(weekAgo.toISOString().split('T')[0], today).then(setWeeklyStats),
        fetchPeriodStats(monthAgo.toISOString().split('T')[0], today).then(setMonthlyStats),
      ]);
    } catch (err) {
      console.error('Erreur globale:', err);
      setError('Erreur de chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const fetchPeriodStats = async (dateDebut: string, dateFin: string) => {
    try {
      const classesRes = await api.get('/classes');
      const classes = classesRes.data || [];
      let totalSeances = 0;
      let totalRevisions = 0;
      let totalPresence = 0;
      let totalMemorisation = 0;
      let totalClassesAvecStats = 0;
      await Promise.all(classes.map(async (classe: any) => {
        try {
          const [seancesRes, statsRes, revRes] = await Promise.allSettled([
            api.get('/coran/seances/historique', { params: { classeId: classe.id, dateDebut, dateFin } }),
            api.get(`/coran/stats/classe/${classe.id}`, { params: { dateDebut, dateFin } }),
            api.get(`/coran/revisions/classe/${classe.id}`, { params: { dateDebut, dateFin } }),
          ]);
          if (seancesRes.status === 'fulfilled') totalSeances += seancesRes.value.data?.length || 0;
          if (revRes.status === 'fulfilled') totalRevisions += revRes.value.data?.length || 0;
          if (statsRes.status === 'fulfilled' && statsRes.value.data) {
            const tp = statsRes.value.data.tauxPresenceMoyen || 0;
            const tm = statsRes.value.data.tauxMemorisationMoyen || 0;
            if (tp > 0 || tm > 0) {
              totalPresence += tp;
              totalMemorisation += tm;
              totalClassesAvecStats++;
            }
          }
        } catch (_) {}
      }));
      return {
        totalSeances,
        totalRevisions,
        tauxPresence: totalClassesAvecStats > 0 ? Math.min(Math.round(totalPresence / totalClassesAvecStats), 100) : 0,
        tauxMemorisation: totalClassesAvecStats > 0 ? Math.min(Math.round(totalMemorisation / totalClassesAvecStats), 100) : 0,
      };
    } catch (_) {
      return { totalSeances: 0, totalRevisions: 0, tauxPresence: 0, tauxMemorisation: 0 };
    }
  };

  const fetchStats = async () => {
    try {
      const [elevesRes, classesRes] = await Promise.all([
        api.get('/eleves'),
        api.get('/classes'),
      ]);
      const totalEleves = elevesRes.data?.length || 0;
      const classes = classesRes.data || [];
      const today = new Date().toISOString().split('T')[0];

      let totalSeancesAujourdhui = 0;
      let totalRevisions = 0;
      let totalPresence = 0;
      let totalMemorisation = 0;
      let totalClassesAvecStats = 0;
      const classeStatsArr: ClasseStat[] = [];

      await Promise.all(classes.map(async (classe: any) => {
        try {
          const [seancesRes, statsRes, revRes] = await Promise.allSettled([
            api.get('/coran/seances/historique', { params: { classeId: classe.id, dateDebut: today, dateFin: today } }),
            api.get(`/coran/stats/classe/${classe.id}`, { params: { dateDebut: today, dateFin: today } }),
            api.get(`/coran/revisions/classe/${classe.id}`, { params: { dateDebut: today, dateFin: today } }),
          ]);

          if (seancesRes.status === 'fulfilled') {
            totalSeancesAujourdhui += seancesRes.value.data?.length || 0;
          }
          if (revRes.status === 'fulfilled') {
            totalRevisions += revRes.value.data?.length || 0;
          }
          if (statsRes.status === 'fulfilled' && statsRes.value.data) {
            const tp = statsRes.value.data.tauxPresenceMoyen || 0;
            const tm = statsRes.value.data.tauxMemorisationMoyen || 0;
            totalPresence += tp;
            totalMemorisation += tm;
            totalClassesAvecStats++;
            if (tp > 0 || tm > 0) {
              classeStatsArr.push({ niveau: classe.niveau, tauxPresence: Math.round(tp), tauxMemorisation: Math.round(tm) });
            }
          }
        } catch (_) {}
      }));

      setClassesStats(classeStatsArr.sort((a, b) => b.tauxPresence - a.tauxPresence));
      setStats({
        totalEleves,
        sessionsToday: totalSeancesAujourdhui,
        revisionsToday: totalRevisions,
        tauxPresence: totalClassesAvecStats > 0 ? Math.round(totalPresence / totalClassesAvecStats) : 0,
        tauxMemorisation: totalClassesAvecStats > 0 ? Math.round(totalMemorisation / totalClassesAvecStats) : 0,
      });
    } catch (err) {
      console.error('Erreur fetchStats:', err);
    }
  };

  const fetchRecentSessions = async () => {
    try {
      const classesRes = await api.get('/classes');
      const classes = classesRes.data || [];
      const endDate = new Date().toISOString().split('T')[0];
      const startObj = new Date();
      startObj.setDate(startObj.getDate() - 6);
      const startDate = startObj.toISOString().split('T')[0];

      const activityMap: Record<string, DayActivity> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        activityMap[key] = {
          jour: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
          seances: 0,
          revisions: 0,
        };
      }

      let allSessions: any[] = [];
      await Promise.all(classes.map(async (classe: any) => {
        try {
          const [seancesRes, revRes] = await Promise.allSettled([
            api.get('/coran/seances/historique', { params: { classeId: classe.id, dateDebut: startDate, dateFin: endDate } }),
            api.get(`/coran/revisions/classe/${classe.id}`, { params: { dateDebut: startDate, dateFin: endDate } }),
          ]);
          if (seancesRes.status === 'fulfilled' && seancesRes.value.data?.length) {
            allSessions = [...allSessions, ...seancesRes.value.data];
            for (const s of seancesRes.value.data) {
              const key = (s.date || '').split('T')[0];
              if (activityMap[key]) activityMap[key].seances++;
            }
          }
          if (revRes.status === 'fulfilled' && revRes.value.data?.length) {
            for (const r of revRes.value.data) {
              const key = (r.date || '').split('T')[0];
              if (activityMap[key]) activityMap[key].revisions++;
            }
          }
        } catch (_) {}
      }));

      allSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentSessions(allSessions.slice(0, 5));
      setDailyActivity(Object.values(activityMap));
    } catch (err) {
      console.error('Erreur fetchRecentSessions:', err);
    }
  };

  if (role === 'COMPTABLE') {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-muted">Accès non autorisé</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center flex-column gap-3" style={{ minHeight: '60vh' }}>
        <div className="spinner-border" style={{ color: C_GREEN, width: 48, height: 48 }} role="status" />
        <p className="text-muted" style={{ fontSize: 14 }}>Chargement du tableau de bord…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="text-danger mb-3">⚠️ {error}</div>
          <button onClick={fetchAllData} className="btn btn-sm" style={{ backgroundColor: C_GREEN, color: 'white' }}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const presenceData = [
    { name: 'Présents', value: stats.tauxPresence },
    { name: 'Absents', value: 100 - stats.tauxPresence },
  ];
  const memorisationData = [
    { name: 'Mémorisé', value: stats.tauxMemorisation },
    { name: 'En cours', value: 100 - stats.tauxMemorisation },
  ];

  const CustomDonutLabel = ({ cx, cy, value, label, color }: any) => (
    <>
      <text x={cx} y={cy - 8} textAnchor="middle" style={{ fontSize: 26, fontWeight: 700, fill: color }}>{value}%</text>
      <text x={cx} y={cy + 16} textAnchor="middle" style={{ fontSize: 11, fill: '#6b7280' }}>{label}</text>
    </>
  );

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header gradient */}
      <div className="rounded-4 p-5 position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #064e2e 0%, #0A6E3F 60%, #15803d 100%)' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: 200, width: 180, height: 180, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', top: 30, right: 140, width: 90, height: 90, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)' }} />
        <div className="position-relative d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-4">
            <div style={{ width: 64, height: 64, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0 }}>
              🕌
            </div>
            <div>
              <h1 className="fw-bold mb-1" style={{ fontSize: 26, color: '#ffffff' }}>
                مرحباً، {nom || 'المستخدم'}
              </h1>
              <p className="mb-1" style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', fontFamily: 'serif' }}>لوحة القيادة — Vue d'ensemble</p>
              <p className="mb-0" style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <button
            onClick={fetchAllData}
            className="btn d-flex align-items-center gap-2"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10, fontSize: 13 }}
          >
            <RefreshCcw size={15} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="row g-3">
        {[
          { label: 'Total élèves', arabic: 'إجمالي الطلاب', value: stats.totalEleves, icon: <Users size={26} color={C_GREEN} />, bg: C_GREEN_L, accent: C_GREEN },
          { label: "Séances aujourd'hui", arabic: 'جلسات اليوم', value: stats.sessionsToday, icon: <BookOpen size={26} color={C_BLUE} />, bg: C_BLUE_L, accent: C_BLUE },
          { label: "Révisions aujourd'hui", arabic: 'مراجعات اليوم', value: stats.revisionsToday, icon: <RefreshCcw size={26} color={C_AMBER} />, bg: C_AMBER_L, accent: C_AMBER },
          { label: 'Taux de présence', arabic: 'نسبة الحضور', value: `${stats.tauxPresence}%`, icon: <CheckCircle size={26} color={C_GREEN} />, bg: C_GREEN_L, accent: C_GREEN },
          { label: 'Taux mémorisation', arabic: 'نسبة الحفظ', value: `${stats.tauxMemorisation}%`, icon: <TrendingUp size={26} color={C_PURPLE} />, bg: '#f5f3ff', accent: C_PURPLE },
        ].map((card, i) => (
          <div key={i} className="col-6 col-md-4 col-lg">
            <div className="bg-white rounded-4 shadow-sm p-3 h-100" style={{ border: `1px solid ${C_GRAY}`, borderTop: `3px solid ${card.accent}` }}>
              <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                <div style={{ width: 46, height: 46, borderRadius: 12, backgroundColor: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {card.icon}
                </div>
                <div className="text-end">
                  <div className="fw-bold" style={{ fontSize: 24, color: '#111827', lineHeight: 1 }}>{card.value}</div>
                </div>
              </div>
              <div className="text-muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.label}</div>
              <div style={{ fontSize: 12, color: card.accent, fontFamily: 'serif' }}>{card.arabic}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Résumés hebdomadaire et mensuel */}
      <div className="row g-4">
        {[
          {
            title: 'Résumé hebdomadaire',
            arabic: 'ملخص الأسبوع',
            period: '7 derniers jours',
            data: weeklyStats,
            accent: C_BLUE,
            bg: C_BLUE_L,
            icon: '📅',
          },
          {
            title: 'Résumé mensuel',
            arabic: 'ملخص الشهر',
            period: '30 derniers jours',
            data: monthlyStats,
            accent: C_PURPLE,
            bg: '#f5f3ff',
            icon: '📊',
          },
        ].map((summary, i) => (
          <div key={i} className="col-12 col-md-6">
            <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0', borderTop: `3px solid ${summary.accent}` }}>
              <div className="d-flex align-items-center gap-3 mb-4">
                <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: summary.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                  {summary.icon}
                </div>
                <div>
                  <div className="fw-bold" style={{ fontSize: 15, color: '#111827' }}>{summary.title}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{summary.period} — <span style={{ fontFamily: 'serif', color: summary.accent }}>{summary.arabic}</span></div>
                </div>
              </div>
              <div className="row g-3">
                {[
                  { label: 'Séances', labelAr: 'الجلسات', value: summary.data.totalSeances, color: C_GREEN, bg: C_GREEN_L },
                  { label: 'Révisions', labelAr: 'المراجعات', value: summary.data.totalRevisions, color: C_AMBER, bg: C_AMBER_L },
                  { label: 'Taux présence', labelAr: 'نسبة الحضور', value: `${summary.data.tauxPresence}%`, color: summary.accent, bg: summary.bg },
                  { label: 'Mémorisation', labelAr: 'نسبة الحفظ', value: `${summary.data.tauxMemorisation}%`, color: C_PURPLE, bg: '#f5f3ff' },
                ].map((metric, j) => (
                  <div key={j} className="col-6">
                    <div className="p-3 rounded-3" style={{ backgroundColor: metric.bg, border: `1px solid ${metric.bg}` }}>
                      <div className="fw-bold" style={{ fontSize: 24, color: metric.color, lineHeight: 1 }}>{metric.value}</div>
                      <div style={{ fontSize: 11, color: '#374151', marginTop: 4 }}>{metric.label}</div>
                      <div style={{ fontSize: 11, color: metric.color, fontFamily: 'serif', opacity: 0.8 }}>{metric.labelAr}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid #f3f4f6' }}>
                <div className="d-flex gap-4">
                  <div>
                    <div style={{ height: 6, width: 80, backgroundColor: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${summary.data.tauxPresence}%`, height: '100%', backgroundColor: summary.accent, borderRadius: 3 }} />
                    </div>
                    <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 3 }}>Présence {summary.data.tauxPresence}%</div>
                  </div>
                  <div>
                    <div style={{ height: 6, width: 80, backgroundColor: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${summary.data.tauxMemorisation}%`, height: '100%', backgroundColor: C_PURPLE, borderRadius: 3 }} />
                    </div>
                    <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 3 }}>Mémorisation {summary.data.tauxMemorisation}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="row g-4">
        {/* Donut présence */}
        <div className="col-12 col-md-4">
          <div className="bg-white rounded-4 shadow-sm p-4 h-100" style={{ border: '1px solid #f0f0f0' }}>
            <div className="d-flex align-items-center gap-2 mb-3">
              <div style={{ width: 4, height: 18, backgroundColor: C_GREEN, borderRadius: 2 }} />
              <span className="fw-semibold" style={{ fontSize: 14, color: '#374151' }}>Taux de présence</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={presenceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={78}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  labelLine={false}
                >
                  <Cell fill={C_GREEN} />
                  <Cell fill={C_GRAY} />
                </Pie>
                <Tooltip formatter={(v: any) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center mt-1">
              <span className="fw-bold" style={{ fontSize: 28, color: C_GREEN }}>{stats.tauxPresence}%</span>
              <div className="text-muted" style={{ fontSize: 12 }}>نسبة الحضور</div>
            </div>
            <div className="d-flex justify-content-center gap-3 mt-2">
              <div className="d-flex align-items-center gap-1">
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: C_GREEN }} />
                <span style={{ fontSize: 11, color: '#6b7280' }}>Présents</span>
              </div>
              <div className="d-flex align-items-center gap-1">
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: C_GRAY }} />
                <span style={{ fontSize: 11, color: '#6b7280' }}>Absents</span>
              </div>
            </div>
          </div>
        </div>

        {/* Donut mémorisation */}
        <div className="col-12 col-md-4">
          <div className="bg-white rounded-4 shadow-sm p-4 h-100" style={{ border: '1px solid #f0f0f0' }}>
            <div className="d-flex align-items-center gap-2 mb-3">
              <div style={{ width: 4, height: 18, backgroundColor: C_PURPLE, borderRadius: 2 }} />
              <span className="fw-semibold" style={{ fontSize: 14, color: '#374151' }}>Taux de mémorisation</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={memorisationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={78}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  labelLine={false}
                >
                  <Cell fill={C_PURPLE} />
                  <Cell fill={C_GRAY} />
                </Pie>
                <Tooltip formatter={(v: any) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center mt-1">
              <span className="fw-bold" style={{ fontSize: 28, color: C_PURPLE }}>{stats.tauxMemorisation}%</span>
              <div className="text-muted" style={{ fontSize: 12 }}>نسبة الحفظ</div>
            </div>
            <div className="d-flex justify-content-center gap-3 mt-2">
              <div className="d-flex align-items-center gap-1">
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: C_PURPLE }} />
                <span style={{ fontSize: 11, color: '#6b7280' }}>Mémorisé</span>
              </div>
              <div className="d-flex align-items-center gap-1">
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: C_GRAY }} />
                <span style={{ fontSize: 11, color: '#6b7280' }}>En cours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats rapides / ratio */}
        <div className="col-12 col-md-4">
          <div className="bg-white rounded-4 shadow-sm p-4 h-100" style={{ border: '1px solid #f0f0f0' }}>
            <div className="d-flex align-items-center gap-2 mb-3">
              <div style={{ width: 4, height: 18, backgroundColor: C_AMBER, borderRadius: 2 }} />
              <span className="fw-semibold" style={{ fontSize: 14, color: '#374151' }}>Résumé du jour</span>
            </div>
            <div className="d-flex flex-column gap-3 mt-2">
              {[
                { label: 'Séances', value: stats.sessionsToday, max: Math.max(stats.sessionsToday, 5), color: C_BLUE },
                { label: 'Révisions', value: stats.revisionsToday, max: Math.max(stats.revisionsToday, 5), color: C_AMBER },
                { label: 'Présence', value: stats.tauxPresence, max: 100, color: C_GREEN, suffix: '%' },
                { label: 'Mémorisation', value: stats.tauxMemorisation, max: 100, color: C_PURPLE, suffix: '%' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="d-flex justify-content-between mb-1">
                    <span style={{ fontSize: 12, color: '#6b7280' }}>{item.label}</span>
                    <span className="fw-semibold" style={{ fontSize: 13, color: item.color }}>{item.value}{item.suffix || ''}</span>
                  </div>
                  <div style={{ height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${item.max > 0 ? Math.round((item.value / item.max) * 100) : 0}%`, height: '100%', backgroundColor: item.color, borderRadius: 4, transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-3" style={{ backgroundColor: C_GREEN_L }}>
              <div className="fw-semibold" style={{ fontSize: 12, color: C_GREEN }}>
                {stats.sessionsToday > 0 ? `✅ ${stats.sessionsToday} séance(s) enregistrée(s)` : '📭 Aucune séance aujourd\'hui'}
              </div>
              {stats.revisionsToday > 0 && (
                <div className="fw-semibold mt-1" style={{ fontSize: 12, color: C_AMBER }}>
                  🔁 {stats.revisionsToday} révision(s) enregistrée(s)
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Activité hebdomadaire + Classes stats */}
      <div className="row g-4">
        {/* Bar chart activité 7 jours */}
        <div className="col-12 col-lg-7">
          <div className="bg-white rounded-4 shadow-sm p-4 h-100" style={{ border: '1px solid #f0f0f0' }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center gap-2">
                <div style={{ width: 4, height: 18, backgroundColor: C_BLUE, borderRadius: 2 }} />
                <span className="fw-semibold" style={{ fontSize: 14, color: '#374151' }}>Activité des 7 derniers jours</span>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center gap-1">
                  <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: C_GREEN }} />
                  <span style={{ fontSize: 11, color: '#6b7280' }}>Séances</span>
                </div>
                <div className="d-flex align-items-center gap-1">
                  <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: C_AMBER }} />
                  <span style={{ fontSize: 11, color: '#6b7280' }}>Révisions</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dailyActivity} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="jour" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  cursor={{ fill: '#f9fafb' }}
                />
                <Bar dataKey="seances" name="Séances" fill={C_GREEN} radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="revisions" name="Révisions" fill={C_AMBER} radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Per-class progress bars */}
        <div className="col-12 col-lg-5">
          <div className="bg-white rounded-4 shadow-sm p-4 h-100" style={{ border: '1px solid #f0f0f0' }}>
            <div className="d-flex align-items-center gap-2 mb-3">
              <div style={{ width: 4, height: 18, backgroundColor: C_PURPLE, borderRadius: 2 }} />
              <span className="fw-semibold" style={{ fontSize: 14, color: '#374151' }}>Présence par classe</span>
            </div>
            {classesStats.length === 0 ? (
              <div className="d-flex align-items-center justify-content-center" style={{ height: 180 }}>
                <p className="text-muted" style={{ fontSize: 13 }}>Aucune donnée aujourd'hui</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {classesStats.slice(0, 6).map((c, i) => (
                  <div key={i}>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="fw-semibold" style={{ fontSize: 12, color: '#374151' }}>{c.niveau}</span>
                      <div className="d-flex gap-2">
                        <span style={{ fontSize: 11, color: C_GREEN }}>👥 {c.tauxPresence}%</span>
                        <span style={{ fontSize: 11, color: C_PURPLE }}>📖 {c.tauxMemorisation}%</span>
                      </div>
                    </div>
                    <div style={{ height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${c.tauxPresence}%`,
                          height: '100%',
                          background: `linear-gradient(90deg, ${C_GREEN}, #16a34a)`,
                          borderRadius: 4,
                          transition: 'width 0.8s ease',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent sessions + Quick actions */}
      <div className="row g-4">
        {/* Recent sessions */}
        <div className="col-12 col-lg-8">
          <div className="bg-white rounded-4 shadow-sm overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
            <div className="p-4 d-flex justify-content-between align-items-center" style={{ borderBottom: '1px solid #f3f4f6' }}>
              <div className="d-flex align-items-center gap-2">
                <div style={{ width: 4, height: 18, backgroundColor: C_GREEN, borderRadius: 2 }} />
                <h5 className="fw-bold mb-0" style={{ fontSize: 15, color: '#111827' }}>Dernières séances</h5>
              </div>
              <Link
                to="/ar/historique"
                className="btn btn-sm fw-semibold"
                style={{ backgroundColor: C_GREEN_L, color: C_GREEN, borderRadius: 8, fontSize: 12, textDecoration: 'none' }}
              >
                Voir tout →
              </Link>
            </div>
            <div className="table-responsive">
              <table className="table align-middle mb-0" style={{ fontSize: 13 }}>
                <thead style={{ backgroundColor: '#f9fafb' }}>
                  <tr>
                    <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#6b7280', fontSize: 11 }}>Date</th>
                    <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#6b7280', fontSize: 11 }}>Enseignant</th>
                    <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#6b7280', fontSize: 11 }}>Versets</th>
                    <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#6b7280', fontSize: 11 }}>Présence</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSessions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-5 text-muted">Aucune séance récente</td>
                    </tr>
                  ) : (
                    recentSessions.map((session) => (
                      <tr key={session.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                        <td className="py-3 px-3">
                          <div className="d-flex align-items-center gap-2">
                            <Calendar size={13} color="#9ca3af" />
                            {new Date(session.date).toLocaleDateString('fr-FR')}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="fw-semibold">{session.enseignantNomArabe || session.enseignantNom || '-'}</span>
                        </td>
                        <td className="py-3 px-3 text-muted">
                          {session.versets?.[0]
                            ? `${session.versets[0].sourateNomArabe || session.versets[0].sourateNom || 'Sourate'} — ${session.versets[0].versetDebut}→${session.versets[0].versetFin}`
                            : '-'}
                        </td>
                        <td className="py-3 px-3">
                          <span className="badge rounded-pill" style={{ backgroundColor: C_GREEN_L, color: C_GREEN, fontSize: 12 }}>
                            {session.recitations?.filter((r: any) => r.present).length || 0} / {session.recitations?.length || 0}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="col-12 col-lg-4">
          <div className="bg-white rounded-4 shadow-sm p-4 h-100" style={{ border: '1px solid #f0f0f0' }}>
            <div className="d-flex align-items-center gap-2 mb-4">
              <div style={{ width: 4, height: 18, backgroundColor: C_GREEN, borderRadius: 2 }} />
              <h5 className="fw-bold mb-0" style={{ fontSize: 15, color: '#111827' }}>Actions rapides</h5>
            </div>
            <div className="d-flex flex-column gap-2">
              {[
                { to: '/ar/seance', icon: <BookOpen size={17} />, label: 'Nouvelle séance', arabic: 'جلسة جديدة', bg: C_GREEN, color: '#fff' },
                { to: '/ar/revision', icon: <RefreshCcw size={17} />, label: 'Saisir révisions', arabic: 'تسجيل المراجعة', bg: C_AMBER_L, color: C_AMBER },
                { to: '/ar/historique', icon: <Calendar size={17} />, label: 'Historique', arabic: 'السجل', bg: C_BLUE_L, color: C_BLUE },
                { to: '/ar/stats', icon: <TrendingUp size={17} />, label: 'Statistiques', arabic: 'الإحصائيات', bg: '#f5f3ff', color: C_PURPLE },
              ].map((action, i) => (
                <Link
                  key={i}
                  to={action.to}
                  className="btn d-flex align-items-center gap-3 fw-semibold text-start"
                  style={{
                    backgroundColor: action.bg,
                    color: action.color,
                    borderRadius: 10,
                    fontSize: 13,
                    padding: '0.7rem 1rem',
                    textDecoration: 'none',
                    border: 'none',
                  }}
                >
                  {action.icon}
                  <div>
                    <div style={{ lineHeight: 1.2 }}>{action.label}</div>
                    <div style={{ fontSize: 11, opacity: 0.75, fontFamily: 'serif' }}>{action.arabic}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
