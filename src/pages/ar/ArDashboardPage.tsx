import { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import api from '../../api/axios';
import { Users, BookOpen, CheckCircle, TrendingUp, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ArDashboardPage() {
  const { role, nom } = useAuth();
  const [stats, setStats] = useState({
    totalEleves: 0,
    sessionsToday: 0,
    tauxPresence: 0,
    tauxMemorisation: 0,
  });
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('=== ArDashboardPage DEBUG ===');
  console.log('Role:', role);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchStats(),
        fetchRecentSessions()
      ]);
    } catch (err) {
      console.error('Erreur globale:', err);
      setError('Erreur de chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Récupérer les vraies statistiques depuis l'API
  const fetchStats = async () => {
    try {
      // 1. Récupérer le nombre total d'élèves
      const elevesRes = await api.get('/eleves');
      const totalEleves = elevesRes.data?.length || 0;
      console.log('Total élèves:', totalEleves);

      // 2. Récupérer les statistiques Coran pour aujourd'hui
      const today = new Date().toISOString().split('T')[0];
      
      // Récupérer toutes les classes
      const classesRes = await api.get('/classes');
      const classes = classesRes.data || [];
      console.log('Nombre de classes:', classes.length);

      let totalSeancesAujourdhui = 0;
      let totalPresence = 0;
      let totalMemorisation = 0;
      let totalClassesAvecStats = 0;

      // Pour chaque classe, récupérer les statistiques
      for (const classe of classes) {
        try {
          // Récupérer les séances d'aujourd'hui pour cette classe
          const seancesRes = await api.get('/coran/seances/historique', {
            params: { classeId: classe.id, dateDebut: today, dateFin: today }
          });
          
          if (seancesRes.data && seancesRes.data.length > 0) {
            totalSeancesAujourdhui += seancesRes.data.length;
          }

          // Récupérer les statistiques de la classe
          const statsRes = await api.get(`/coran/stats/classe/${classe.id}`, {
            params: { dateDebut: today, dateFin: today }
          });
          
          if (statsRes.data) {
            if (statsRes.data.tauxPresenceMoyen) {
              totalPresence += statsRes.data.tauxPresenceMoyen;
              totalClassesAvecStats++;
            }
            if (statsRes.data.tauxMemorisationMoyen) {
              totalMemorisation += statsRes.data.tauxMemorisationMoyen;
            }
          }
        } catch (err) {
          console.error(`Erreur pour la classe ${classe.id}:`, err);
        }
      }

      setStats({
        totalEleves: totalEleves,
        sessionsToday: totalSeancesAujourdhui,
        tauxPresence: totalClassesAvecStats > 0 ? Math.round(totalPresence / totalClassesAvecStats) : 0,
        tauxMemorisation: totalClassesAvecStats > 0 ? Math.round(totalMemorisation / totalClassesAvecStats) : 0,
      });

    } catch (err) {
      console.error('Erreur fetchStats:', err);
      // En cas d'erreur, essayer de récupérer au moins le nombre d'élèves
      try {
        const elevesRes = await api.get('/eleves');
        setStats(prev => ({ ...prev, totalEleves: elevesRes.data?.length || 0 }));
      } catch (e) {
        console.error('Impossible de récupérer les élèves:', e);
      }
    }
  };

  // ✅ Récupérer les sessions récentes depuis l'API
  const fetchRecentSessions = async () => {
    try {
      // Récupérer toutes les classes
      const classesRes = await api.get('/classes');
      const classes = classesRes.data || [];
      
      let allSessions: any[] = [];
      
      // Pour chaque classe, récupérer les séances des 7 derniers jours
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const startDateStr = startDate.toISOString().split('T')[0];
      
      for (const classe of classes) {
        try {
          const seancesRes = await api.get('/coran/seances/historique', {
            params: { classeId: classe.id, dateDebut: startDateStr, dateFin: endDate }
          });
          
          if (seancesRes.data && seancesRes.data.length > 0) {
            allSessions = [...allSessions, ...seancesRes.data];
          }
        } catch (err) {
          console.error(`Erreur pour la classe ${classe.id}:`, err);
        }
      }
      
      // Trier par date décroissante et prendre les 5 plus récentes
      allSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentSessions(allSessions.slice(0, 5));
      console.log('Sessions récentes:', allSessions.length);
      
    } catch (err) {
      console.error('Erreur fetchRecentSessions:', err);
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle }: { 
    title: string; 
    value: string | number; 
    icon: React.ReactNode; 
    color: string;
    subtitle?: string;
  }) => (
    <div className="bg-white rounded-4 shadow-sm p-4 h-100" style={{ border: '1px solid #f0f0f0' }}>
      <div className="d-flex align-items-center gap-3">
        <div
          className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
          style={{ width: 56, height: 56, backgroundColor: color, fontSize: 24 }}
        >
          {icon}
        </div>
        <div className="flex-grow-1">
          <div className="text-muted mb-1" style={{ fontSize: 13 }}>{title}</div>
          <div className="fw-bold" style={{ fontSize: 28, color: '#111827' }}>{value}</div>
          {subtitle && <div className="text-muted small mt-1">{subtitle}</div>}
        </div>
      </div>
    </div>
  );

  if (role === 'COMPTABLE') {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-muted">غير مصرح بالوصول</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border" style={{ color: '#0A6E3F' }} role="status">
          <span className="visually-hidden">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="text-danger mb-3">⚠️ {error}</div>
          <button 
            onClick={() => fetchAllData()} 
            className="btn btn-sm" 
            style={{ backgroundColor: '#0A6E3F', color: 'white' }}
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header avec bienvenue */}
      <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0' }}>
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h1 className="fw-bold mb-1" style={{ fontSize: 28, color: '#111827' }}>
              مرحباً, {nom || 'مستخدم'}
            </h1>
            <p className="text-muted mb-0" style={{ fontSize: 14 }}>
              نظرة عامة على أنشطة تلاوة القرآن والحفظ
            </p>
          </div>
          <div className="text-muted small">
            {new Date().toLocaleDateString('ar-EG', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row g-3">
        <div className="col-12 col-md-6 col-lg-3">
          <StatCard
            title="إجمالي الطلاب"
            value={stats.totalEleves}
            icon={<Users size={28} style={{ color: '#0A6E3F' }} />}
            color="#e8f5e9"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <StatCard
            title="جلسات اليوم"
            value={stats.sessionsToday}
            icon={<BookOpen size={28} style={{ color: '#0A6E3F' }} />}
            color="#e8f5e9"
            subtitle="الجلسات المسجلة"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <StatCard
            title="نسبة الحضور"
            value={`${stats.tauxPresence}%`}
            icon={<CheckCircle size={28} style={{ color: '#0A6E3F' }} />}
            color="#e8f5e9"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <StatCard
            title="نسبة الحفظ"
            value={`${stats.tauxMemorisation}%`}
            icon={<TrendingUp size={28} style={{ color: '#0A6E3F' }} />}
            color="#e8f5e9"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0' }}>
        <h2 className="fw-bold mb-3" style={{ fontSize: 20, color: '#111827' }}>إجراءات سريعة</h2>
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <Link
              to="/ar/seance"
              className="btn w-100 d-flex align-items-center justify-content-center gap-2 fw-semibold"
              style={{ backgroundColor: '#0A6E3F', color: '#fff', borderRadius: 12, fontSize: 14, padding: '0.875rem', textDecoration: 'none', border: 'none' }}
            >
              <BookOpen size={20} />
              بدء جلسة تلاوة جديدة
            </Link>
          </div>
          <div className="col-12 col-md-4">
            <Link
              to="/ar/historique"
              className="btn w-100 d-flex align-items-center justify-content-center gap-2 fw-semibold"
              style={{ backgroundColor: '#ffffff', borderColor: '#0A6E3F', color: '#0A6E3F', borderRadius: 12, fontSize: 14, padding: '0.875rem', textDecoration: 'none', border: '1px solid #0A6E3F' }}
            >
              <Calendar size={20} />
              عرض سجل الجلسات
            </Link>
          </div>
          <div className="col-12 col-md-4">
            <Link
              to="/ar/stats"
              className="btn w-100 d-flex align-items-center justify-content-center gap-2 fw-semibold"
              style={{ backgroundColor: '#ffffff', borderColor: '#0A6E3F', color: '#0A6E3F', borderRadius: 12, fontSize: 14, padding: '0.875rem', textDecoration: 'none', border: '1px solid #0A6E3F' }}
            >
              <TrendingUp size={20} />
              عرض الإحصائيات
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-4 shadow-sm overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
        <div className="p-4 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0" style={{ fontSize: 16, color: '#111827' }}>
            آخر الجلسات
          </h5>
          <Link
            to="/ar/historique"
            className="btn btn-sm fw-semibold"
            style={{ backgroundColor: '#e8f5e9', color: '#0A6E3F', borderRadius: 8, fontSize: 12, textDecoration: 'none' }}
          >
            عرض الكل
          </Link>
        </div>
        <div className="table-responsive">
          <table className="table align-middle mb-0" style={{ fontSize: 13 }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>
                  التاريخ
                </th>
                <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>
                  المعلم
                </th>
                <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>
                  الآيات
                </th>
                <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 12 }}>
                  الحضور
                </th>
              </tr>
            </thead>
            <tbody>
              {recentSessions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-5 text-muted">
                    لا توجد جلسات حديثة
                  </td>
                </tr>
              ) : (
                recentSessions.map((session) => (
                  <tr key={session.id}>
                    <td className="py-3 px-3">
                      {new Date(session.date).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="py-3 px-3">
                      {session.enseignantNom || '-'}
                    </td>
                    <td className="py-3 px-3">
                      {session.versets?.[0]?.sourate || '-'} - الآية {session.versets?.[0]?.versetDebut || '-'} إلى {session.versets?.[0]?.versetFin || '-'}
                    </td>
                    <td className="py-3 px-3">
                      {session.recitations?.filter((r: any) => r.present).length || 0} / {session.recitations?.length || 0}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}