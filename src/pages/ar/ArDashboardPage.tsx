import { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import api from '../../api/axios';
import { COLORS } from '../../styles/tokens';
import { Users, BookOpen, CheckCircle, TrendingUp, Calendar, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const C_GREEN  = COLORS.green;
const C_GREEN_L= COLORS.greenLight;
const C_PURPLE = COLORS.purple;
const C_BLUE   = COLORS.blue;
const C_BLUE_L = COLORS.blueLight;
const C_AMBER  = COLORS.amber;
const C_AMBER_L= COLORS.amberLight;
const C_GRAY   = COLORS.gray;

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

interface SeanceRecente {
  id: number | string;
  date: string;
  enseignantNom?: string;
  enseignantNomArabe?: string;
  versets?: Array<{
    sourateNom?: string;
    sourateNomArabe?: string;
    versetDebut?: number;
    versetFin?: number;
  }>;
  recitations?: Array<{ present: boolean }>;
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
  const [recentSessions, setRecentSessions] = useState<SeanceRecente[]>([]);
  const [classesStats, setClassesStats] = useState<ClasseStat[]>([]);
  const [dailyActivity, setDailyActivity] = useState<DayActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weeklyStats, setWeeklyStats] = useState({ totalSeances: 0, totalRevisions: 0, tauxPresence: 0, tauxMemorisation: 0 });
  const [monthlyStats, setMonthlyStats] = useState({ totalSeances: 0, totalRevisions: 0, tauxPresence: 0, tauxMemorisation: 0 });

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo  = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date(); monthAgo.setDate(monthAgo.getDate() - 30);
      await Promise.all([
        fetchStats(),
        fetchRecentSessions(),
        fetchPeriodStats(weekAgo.toISOString().split('T')[0], today).then(setWeeklyStats),
        fetchPeriodStats(monthAgo.toISOString().split('T')[0], today).then(setMonthlyStats),
      ]);
    } catch {
      setError('خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const fetchPeriodStats = async (dateDebut: string, dateFin: string) => {
    try {
      const classesRes = await api.get('/classes');
      const classes = classesRes.data || [];
      let totalSeances = 0, totalRevisions = 0, totalPresence = 0, totalMemorisation = 0, totalClassesAvecStats = 0;
      await Promise.all(classes.map(async (classe: any) => {
        try {
          const [seancesRes, statsRes, revRes] = await Promise.allSettled([
            api.get('/coran/seances/historique', { params: { classeId: classe.id, dateDebut, dateFin } }),
            api.get(`/coran/stats/classe/${classe.id}`, { params: { dateDebut, dateFin } }),
            api.get(`/coran/revisions/classe/${classe.id}`, { params: { dateDebut, dateFin } }),
          ]);
          if (seancesRes.status === 'fulfilled') totalSeances   += seancesRes.value.data?.length || 0;
          if (revRes.status    === 'fulfilled') totalRevisions  += revRes.value.data?.length    || 0;
          if (statsRes.status  === 'fulfilled' && statsRes.value.data) {
            const tp = statsRes.value.data.tauxPresenceMoyen    || 0;
            const tm = statsRes.value.data.tauxMemorisationMoyen|| 0;
            if (tp > 0 || tm > 0) { totalPresence += tp; totalMemorisation += tm; totalClassesAvecStats++; }
          }
        } catch (_) {}
      }));
      return {
        totalSeances, totalRevisions,
        tauxPresence:      totalClassesAvecStats > 0 ? Math.min(Math.round(totalPresence    / totalClassesAvecStats), 100) : 0,
        tauxMemorisation:  totalClassesAvecStats > 0 ? Math.min(Math.round(totalMemorisation/ totalClassesAvecStats), 100) : 0,
      };
    } catch (_) {
      return { totalSeances: 0, totalRevisions: 0, tauxPresence: 0, tauxMemorisation: 0 };
    }
  };

  const fetchStats = async () => {
    try {
      const [elevesRes, classesRes] = await Promise.all([api.get('/eleves'), api.get('/classes')]);
      const totalEleves = elevesRes.data?.length || 0;
      const classes     = classesRes.data || [];
      const today       = new Date().toISOString().split('T')[0];
      let totalSeancesAujourdhui = 0, totalRevisions = 0, totalPresence = 0, totalMemorisation = 0, totalClassesAvecStats = 0;
      const classeStatsArr: ClasseStat[] = [];

      await Promise.all(classes.map(async (classe: any) => {
        try {
          const [seancesRes, statsRes, revRes] = await Promise.allSettled([
            api.get('/coran/seances/historique', { params: { classeId: classe.id, dateDebut: today, dateFin: today } }),
            api.get(`/coran/stats/classe/${classe.id}`, { params: { dateDebut: today, dateFin: today } }),
            api.get(`/coran/revisions/classe/${classe.id}`, { params: { dateDebut: today, dateFin: today } }),
          ]);
          if (seancesRes.status === 'fulfilled') totalSeancesAujourdhui += seancesRes.value.data?.length || 0;
          if (revRes.status    === 'fulfilled') totalRevisions          += revRes.value.data?.length    || 0;
          if (statsRes.status  === 'fulfilled' && statsRes.value.data) {
            const tp = statsRes.value.data.tauxPresenceMoyen    || 0;
            const tm = statsRes.value.data.tauxMemorisationMoyen|| 0;
            totalPresence += tp; totalMemorisation += tm; totalClassesAvecStats++;
            if (tp > 0 || tm > 0) classeStatsArr.push({ niveau: classe.niveau, tauxPresence: Math.round(tp), tauxMemorisation: Math.round(tm) });
          }
        } catch (_) {}
      }));

      setClassesStats(classeStatsArr.sort((a, b) => b.tauxPresence - a.tauxPresence));
      setStats({
        totalEleves,
        sessionsToday:    totalSeancesAujourdhui,
        revisionsToday:   totalRevisions,
        tauxPresence:     totalClassesAvecStats > 0 ? Math.round(totalPresence    / totalClassesAvecStats) : 0,
        tauxMemorisation: totalClassesAvecStats > 0 ? Math.round(totalMemorisation/ totalClassesAvecStats) : 0,
      });
    } catch (_) {}
  };

  const fetchRecentSessions = async () => {
    try {
      const classesRes = await api.get('/classes');
      const classes    = classesRes.data || [];
      const endDate    = new Date().toISOString().split('T')[0];
      const startObj   = new Date(); startObj.setDate(startObj.getDate() - 6);
      const startDate  = startObj.toISOString().split('T')[0];

      const activityMap: Record<string, DayActivity> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        activityMap[key] = { jour: d.toLocaleDateString('ar-SA', { weekday: 'short', day: 'numeric' }), seances: 0, revisions: 0 };
      }

      let allSessions: SeanceRecente[] = [];
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
    } catch (_) {}
  };

  if (role === 'COMPTABLE') {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-muted">الوصول غير مسموح به</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="d-flex flex-column align-items-center gap-3">
          <div className="spinner-border" style={{ color: C_GREEN, width: 48, height: 48 }} role="status" />
          <p className="text-muted text-center mb-0" style={{ fontSize: 14 }}>جاري تحميل لوحة القيادة...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="text-danger mb-3">⚠️ {error}</div>
          <button onClick={fetchAllData} className="btn btn-sm" style={{ backgroundColor: C_GREEN, color: 'white' }}>
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  const presenceData = [
    { name: 'حاضر', value: stats.tauxPresence },
    { name: 'غائب', value: 100 - stats.tauxPresence },
  ];
  const memorisationData = [
    { name: 'محفوظ', value: stats.tauxMemorisation },
    { name: 'قيد الحفظ', value: 100 - stats.tauxMemorisation },
  ];

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header */}
      <div className="rounded-4 p-5 position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #064e2e 0%, #0A6E3F 60%, #15803d 100%)' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: 200, width: 180, height: 180, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)' }} />
        <div className="position-relative d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-4">
            <div style={{ width: 64, height: 64, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0 }}>
              🕌
            </div>
            <div>
              <h1 className="fw-bold mb-1" style={{ fontSize: 26, color: '#ffffff' }}>مرحباً، {nom || 'المستخدم'}</h1>
              <p className="mb-1" style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', fontFamily: 'serif' }}>لوحة القيادة — نظرة عامة</p>
              <p className="mb-0" style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
                {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <button
            onClick={fetchAllData}
            className="btn d-flex align-items-center gap-2"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10, fontSize: 13 }}
          >
            <RefreshCcw size={15} />
            تحديث
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="row g-3">
        {[
          { label: 'إجمالي الطلاب',  arabic: 'إجمالي الطلاب',  value: stats.totalEleves,         icon: <Users       size={26} color={C_GREEN}  />, bg: C_GREEN_L,  accent: C_GREEN  },
          { label: 'جلسات اليوم',    arabic: 'جلسات اليوم',    value: stats.sessionsToday,       icon: <BookOpen    size={26} color={C_BLUE}   />, bg: C_BLUE_L,   accent: C_BLUE   },
          { label: 'مراجعات اليوم',  arabic: 'مراجعات اليوم',  value: stats.revisionsToday,      icon: <RefreshCcw  size={26} color={C_AMBER}  />, bg: C_AMBER_L,  accent: C_AMBER  },
          { label: 'نسبة الحضور',    arabic: 'نسبة الحضور',    value: `${stats.tauxPresence}%`,  icon: <CheckCircle size={26} color={C_GREEN}  />, bg: C_GREEN_L,  accent: C_GREEN  },
          { label: 'نسبة الحفظ',     arabic: 'نسبة الحفظ',     value: `${stats.tauxMemorisation}%`, icon: <TrendingUp size={26} color={C_PURPLE} />, bg: '#f5f3ff', accent: C_PURPLE },
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
          { title: 'ملخص الأسبوع', arabic: 'ملخص الأسبوع', period: 'آخر 7 أيام',   data: weeklyStats, accent: C_BLUE,   bg: C_BLUE_L,   icon: '📅' },
          { title: 'ملخص الشهر',   arabic: 'ملخص الشهر',   period: 'آخر 30 يوماً', data: monthlyStats,accent: C_PURPLE, bg: '#f5f3ff',  icon: '📊' },
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
                  { label: 'الجلسات',      labelAr: 'الجلسات',      value: summary.data.totalSeances,              color: C_GREEN,       bg: C_GREEN_L  },
                  { label: 'المراجعات',    labelAr: 'المراجعات',    value: summary.data.totalRevisions,            color: C_AMBER,       bg: C_AMBER_L  },
                  { label: 'نسبة الحضور',  labelAr: 'نسبة الحضور',  value: `${summary.data.tauxPresence}%`,        color: summary.accent,bg: summary.bg },
                  { label: 'نسبة الحفظ',   labelAr: 'نسبة الحفظ',   value: `${summary.data.tauxMemorisation}%`,    color: C_PURPLE,      bg: '#f5f3ff'  },
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
                  {[
                    { pct: summary.data.tauxPresence,     color: summary.accent, label: `الحضور ${summary.data.tauxPresence}%` },
                    { pct: summary.data.tauxMemorisation, color: C_PURPLE,       label: `الحفظ ${summary.data.tauxMemorisation}%` },
                  ].map((bar, k) => (
                    <div key={k}>
                      <div style={{ height: 6, width: 80, backgroundColor: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${bar.pct}%`, height: '100%', backgroundColor: bar.color, borderRadius: 3 }} />
                      </div>
                      <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 3 }}>{bar.label}</div>
                    </div>
                  ))}
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
              <span className="fw-semibold" style={{ fontSize: 14, color: '#374151' }}>نسبة الحضور</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={presenceData} cx="50%" cy="50%" innerRadius={55} outerRadius={78} startAngle={90} endAngle={-270} dataKey="value" labelLine={false}>
                  <Cell fill={C_GREEN} />
                  <Cell fill={C_GRAY} />
                </Pie>
                <Tooltip formatter={(v: number) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center mt-1">
              <span className="fw-bold" style={{ fontSize: 28, color: C_GREEN }}>{stats.tauxPresence}%</span>
              <div className="text-muted" style={{ fontSize: 12 }}>نسبة الحضور</div>
            </div>
            <div className="d-flex justify-content-center gap-3 mt-2">
              {[{ color: C_GREEN, label: 'حاضر' }, { color: C_GRAY, label: 'غائب' }].map((l, i) => (
                <div key={i} className="d-flex align-items-center gap-1">
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: l.color }} />
                  <span style={{ fontSize: 11, color: '#6b7280' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Donut mémorisation */}
        <div className="col-12 col-md-4">
          <div className="bg-white rounded-4 shadow-sm p-4 h-100" style={{ border: '1px solid #f0f0f0' }}>
            <div className="d-flex align-items-center gap-2 mb-3">
              <div style={{ width: 4, height: 18, backgroundColor: C_PURPLE, borderRadius: 2 }} />
              <span className="fw-semibold" style={{ fontSize: 14, color: '#374151' }}>نسبة الحفظ</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={memorisationData} cx="50%" cy="50%" innerRadius={55} outerRadius={78} startAngle={90} endAngle={-270} dataKey="value" labelLine={false}>
                  <Cell fill={C_PURPLE} />
                  <Cell fill={C_GRAY} />
                </Pie>
                <Tooltip formatter={(v: number) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center mt-1">
              <span className="fw-bold" style={{ fontSize: 28, color: C_PURPLE }}>{stats.tauxMemorisation}%</span>
              <div className="text-muted" style={{ fontSize: 12 }}>نسبة الحفظ</div>
            </div>
            <div className="d-flex justify-content-center gap-3 mt-2">
              {[{ color: C_PURPLE, label: 'محفوظ' }, { color: C_GRAY, label: 'قيد الحفظ' }].map((l, i) => (
                <div key={i} className="d-flex align-items-center gap-1">
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: l.color }} />
                  <span style={{ fontSize: 11, color: '#6b7280' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Résumé du jour */}
        <div className="col-12 col-md-4">
          <div className="bg-white rounded-4 shadow-sm p-4 h-100" style={{ border: '1px solid #f0f0f0' }}>
            <div className="d-flex align-items-center gap-2 mb-3">
              <div style={{ width: 4, height: 18, backgroundColor: C_AMBER, borderRadius: 2 }} />
              <span className="fw-semibold" style={{ fontSize: 14, color: '#374151' }}>ملخص اليوم</span>
            </div>
            <div className="d-flex flex-column gap-3 mt-2">
              {[
                { label: 'الجلسات',   value: stats.sessionsToday,    max: Math.max(stats.sessionsToday, 5),    color: C_BLUE   },
                { label: 'المراجعات', value: stats.revisionsToday,   max: Math.max(stats.revisionsToday, 5),   color: C_AMBER  },
                { label: 'الحضور',    value: stats.tauxPresence,     max: 100, color: C_GREEN, suffix: '%' },
                { label: 'الحفظ',     value: stats.tauxMemorisation, max: 100, color: C_PURPLE, suffix: '%' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="d-flex justify-content-between mb-1">
                    <span style={{ fontSize: 12, color: '#6b7280' }}>{item.label}</span>
                    <span className="fw-semibold" style={{ fontSize: 13, color: item.color }}>{item.value}{('suffix' in item) ? item.suffix : ''}</span>
                  </div>
                  <div style={{ height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${item.max > 0 ? Math.round((item.value / item.max) * 100) : 0}%`, height: '100%', backgroundColor: item.color, borderRadius: 4, transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-3" style={{ backgroundColor: C_GREEN_L }}>
              <div className="fw-semibold" style={{ fontSize: 12, color: C_GREEN }}>
                {stats.sessionsToday > 0 ? `✅ ${stats.sessionsToday} جلسة مسجلة` : '📭 لا توجد جلسات اليوم'}
              </div>
              {stats.revisionsToday > 0 && (
                <div className="fw-semibold mt-1" style={{ fontSize: 12, color: C_AMBER }}>
                  🔁 {stats.revisionsToday} مراجعة مسجلة
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Activité 7 jours + Classes stats */}
      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="bg-white rounded-4 shadow-sm p-4 h-100" style={{ border: '1px solid #f0f0f0' }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center gap-2">
                <div style={{ width: 4, height: 18, backgroundColor: C_BLUE, borderRadius: 2 }} />
                <span className="fw-semibold" style={{ fontSize: 14, color: '#374151' }}>نشاط الأيام السبعة الأخيرة</span>
              </div>
              <div className="d-flex align-items-center gap-3">
                {[{ color: C_GREEN, label: 'الجلسات' }, { color: C_AMBER, label: 'المراجعات' }].map((l, i) => (
                  <div key={i} className="d-flex align-items-center gap-1">
                    <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: l.color }} />
                    <span style={{ fontSize: 11, color: '#6b7280' }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dailyActivity} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="jour" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} cursor={{ fill: '#f9fafb' }} />
                <Bar dataKey="seances"  name="الجلسات"   fill={C_GREEN} radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="revisions" name="المراجعات" fill={C_AMBER} radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="bg-white rounded-4 shadow-sm p-4 h-100" style={{ border: '1px solid #f0f0f0' }}>
            <div className="d-flex align-items-center gap-2 mb-3">
              <div style={{ width: 4, height: 18, backgroundColor: C_PURPLE, borderRadius: 2 }} />
              <span className="fw-semibold" style={{ fontSize: 14, color: '#374151' }}>الحضور حسب الفصل</span>
            </div>
            {classesStats.length === 0 ? (
              <div className="d-flex align-items-center justify-content-center" style={{ height: 180 }}>
                <p className="text-muted" style={{ fontSize: 13 }}>لا توجد بيانات اليوم</p>
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
                      <div style={{ width: `${c.tauxPresence}%`, height: '100%', background: `linear-gradient(90deg, ${C_GREEN}, #16a34a)`, borderRadius: 4, transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dernières séances + Actions rapides */}
      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="bg-white rounded-4 shadow-sm overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
            <div className="p-4 d-flex justify-content-between align-items-center" style={{ borderBottom: '1px solid #f3f4f6' }}>
              <div className="d-flex align-items-center gap-2">
                <div style={{ width: 4, height: 18, backgroundColor: C_GREEN, borderRadius: 2 }} />
                <h5 className="fw-bold mb-0" style={{ fontSize: 15, color: '#111827' }}>آخر الجلسات</h5>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table align-middle mb-0" style={{ fontSize: 13 }}>
                <thead style={{ backgroundColor: '#f9fafb' }}>
                  <tr>
                    <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#6b7280', fontSize: 11 }}>التاريخ</th>
                    <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#6b7280', fontSize: 11 }}>المعلم</th>
                    <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#6b7280', fontSize: 11 }}>الآيات</th>
                    <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#6b7280', fontSize: 11 }}>الحضور</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSessions.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-5 text-muted">لا توجد جلسات حديثة</td></tr>
                  ) : (
                    recentSessions.map((session) => (
                      <tr key={session.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                        <td className="py-3 px-3">
                          <div className="d-flex align-items-center gap-2">
                            <Calendar size={13} color="#9ca3af" />
                            {new Date(session.date).toLocaleDateString('ar-SA')}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="fw-semibold">{session.enseignantNomArabe || session.enseignantNom || '-'}</span>
                        </td>
                        <td className="py-3 px-3 text-muted">
                          {session.versets?.[0]
                            ? `${session.versets[0].sourateNomArabe || session.versets[0].sourateNom || 'سورة'} — ${session.versets[0].versetDebut}→${session.versets[0].versetFin}`
                            : '-'}
                        </td>
                        <td className="py-3 px-3">
                          <span className="badge rounded-pill" style={{ backgroundColor: C_GREEN_L, color: C_GREEN, fontSize: 12 }}>
                            {session.recitations?.filter((r) => r.present).length || 0} / {session.recitations?.length || 0}
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

        {/* Actions rapides */}
        <div className="col-12 col-lg-4">
          <div className="bg-white rounded-4 shadow-sm p-4 h-100" style={{ border: '1px solid #f0f0f0' }}>
            <div className="d-flex align-items-center gap-2 mb-4">
              <div style={{ width: 4, height: 18, backgroundColor: C_GREEN, borderRadius: 2 }} />
              <h5 className="fw-bold mb-0" style={{ fontSize: 15, color: '#111827' }}>إجراءات سريعة</h5>
            </div>
            <div className="d-flex flex-column gap-2">
              {[
                { to: '/ar/seance',   icon: <BookOpen   size={17} />, label: 'جلسة جديدة',       arabic: 'جلسة التلاوة',     bg: C_GREEN,   color: '#fff'   },
                { to: '/ar/revision', icon: <RefreshCcw size={17} />, label: 'تسجيل المراجعة',   arabic: 'المراجعة',          bg: C_AMBER_L, color: C_AMBER  },
              ].map((action, i) => (
                <Link key={i} to={action.to} className="btn d-flex align-items-center gap-3 fw-semibold text-start"
                  style={{ backgroundColor: action.bg, color: action.color, borderRadius: 10, fontSize: 13, padding: '0.7rem 1rem', textDecoration: 'none', border: 'none' }}>
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
