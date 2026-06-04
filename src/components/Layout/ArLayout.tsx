import { Outlet } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { useEffect } from 'react';

const navItems = [
  { to: '/ar/dashboard', emoji: '🏠', label: 'لوحة القيادة', roles: ['ADMIN', 'ENSEIGNANT'] },
  { to: '/ar/seance', emoji: '📖', label: 'جلسة التلاوة', roles: ['ADMIN', 'ENSEIGNANT'] },
  { to: '/ar/historique', emoji: '📚', label: 'السجل', roles: ['ADMIN', 'ENSEIGNANT', 'COMPTABLE'] },
  { to: '/ar/stats', emoji: '📊', label: 'الإحصائيات', roles: ['ADMIN', 'ENSEIGNANT', 'COMPTABLE'] },
];

export default function ArLayout() {
  const { role, nom, logout } = useAuth();

  useEffect(() => {
    document.documentElement.dir = 'rtl';
    return () => {
      document.documentElement.dir = 'ltr';
    };
  }, []);

  return (
    <div className="d-flex ar-portal" style={{ minHeight: '100vh', backgroundColor: '#f8faff' }} dir="rtl">
      {/* Sidebar */}
      <div
        className="d-flex flex-column"
        style={{
          width: 260,
          height: '100vh',
          backgroundColor: '#ffffff',
          position: 'fixed',
          right: 0,
          top: 0,
          zIndex: 1000,
        }}
      >
        {/* Logo */}
        <div className="p-4 border-bottom">
          <div className="d-flex align-items-center gap-3">
            <img
              src="/logo.jpeg"
              alt="Al-Manard3s Logo"
              style={{ width: 44, height: 44, objectFit: 'contain' }}
            />
            <div>
              <div className="fw-bold" style={{ color: '#0A6E3F', fontSize: 16 }}>
                المنارد الثالثة
              </div>
              <div className="text-muted" style={{ fontSize: 11 }}>
                نظام إدارة المدرسة
              </div>
            </div>
          </div>

          {/* Profil */}
          <div
            className="mt-3 p-2 rounded-3 d-flex align-items-center gap-2"
            style={{ backgroundColor: '#e8f5e9' }}
          >
            <div
              className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 36, height: 36, backgroundColor: '#c8e6c9', fontSize: 16 }}
            >
              👤
            </div>
            <div>
              <div className="fw-semibold small" style={{ color: '#0A6E3F' }}>{nom}</div>
              <span
                className="badge rounded-pill px-2"
                style={{ backgroundColor: '#e8f5e9', color: '#0A6E3F', fontSize: 10 }}
              >
                {role}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-grow-1 p-3 overflow-auto">
          <div className="d-flex flex-column gap-1">
            {navItems
              .filter(item => item.roles.includes(role || ''))
              .map(({ to, emoji, label }) => (
                <a
                  key={to}
                  href={to}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    borderRadius: 10,
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: 400,
                    backgroundColor: 'transparent',
                    color: '#4b5563',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget;
                    el.style.backgroundColor = '#f1f8f4';
                    el.style.color = '#0A6E3F';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget;
                    el.style.backgroundColor = 'transparent';
                    el.style.color = '#4b5563';
                  }}
                >
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{emoji}</span>
                  <span>{label}</span>
                </a>
              ))}
          </div>
        </nav>

        {/* Déconnexion */}
        <div className="p-3 border-top">
          <button
            onClick={logout}
            className="btn w-100 d-flex align-items-center gap-2 text-start"
            style={{
              backgroundColor: 'transparent',
              color: '#ef4444',
              border: '1px solid #fee2e2',
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: 14,
            }}
          >
            <span>🚪</span>
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginRight: 260, flex: 1, padding: '2rem' }}>
        <Outlet />
      </div>
    </div>
  );
}
