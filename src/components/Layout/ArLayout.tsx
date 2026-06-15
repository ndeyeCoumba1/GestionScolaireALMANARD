import { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

const navItems = [
  { to: '/ar/dashboard', emoji: '🏠', label: 'لوحة القيادة', roles: ['ADMIN', 'ENSEIGNANT', 'RECITATEUR'] },
  { to: '/ar/seance',    emoji: '📖', label: 'جلسة التلاوة', roles: ['ADMIN', 'ENSEIGNANT', 'RECITATEUR'] },
  { to: '/ar/revision',  emoji: '🔁', label: 'المراجعة',     roles: ['ADMIN', 'ENSEIGNANT', 'RECITATEUR'] },
  { to: '/ar/rapports',  emoji: '📋', label: 'التقارير',     roles: ['ADMIN', 'ENSEIGNANT', 'COMPTABLE', 'RECITATEUR'] },
];

export default function ArLayout() {
  const { role, nom, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    document.documentElement.dir = 'rtl';
    return () => { document.documentElement.dir = 'ltr'; };
  }, []);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, isMobile]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8faff' }} dir="rtl">

      {/* Overlay mobile */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 999 }}
        />
      )}

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
          transform: isMobile && !sidebarOpen ? 'translateX(100%)' : 'translateX(0)',
          transition: 'transform 0.3s ease',
          boxShadow: isMobile && sidebarOpen ? '-4px 0 20px rgba(0,0,0,0.15)' : 'none',
        }}
      >
        {/* Logo */}
        <div className="p-4 border-bottom">
          <div className="d-flex align-items-center gap-3">
            <img src="/logo.jpeg" alt="Logo" style={{ width: 44, height: 44, objectFit: 'contain' }} />
            <div>
              <div className="fw-bold" style={{ color: '#0A6E3F', fontSize: 16 }}>المنارد الثالثة</div>
              <div className="text-muted" style={{ fontSize: 11 }}>نظام إدارة المدرسة</div>
            </div>
          </div>
          <div className="mt-3 p-2 rounded-3 d-flex align-items-center gap-2" style={{ backgroundColor: '#e8f5e9' }}>
            <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 36, height: 36, backgroundColor: '#c8e6c9', fontSize: 16 }}>
              👤
            </div>
            <div>
              <div className="fw-semibold small" style={{ color: '#0A6E3F' }}>{nom}</div>
              <span className="badge rounded-pill px-2" style={{ backgroundColor: '#e8f5e9', color: '#0A6E3F', fontSize: 10 }}>
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
              .map(({ to, emoji, label }) => {
                const isActive = location.pathname === to;
                return (
                  <Link key={to} to={to}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                      borderRadius: 10, textDecoration: 'none', fontSize: 14,
                      fontWeight: isActive ? 600 : 400,
                      backgroundColor: isActive ? '#0A6E3F' : 'transparent',
                      color: isActive ? '#ffffff' : '#4b5563',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: isActive ? '0 2px 8px rgba(10,110,63,0.25)' : 'none',
                    }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.backgroundColor = '#f1f8f4'; e.currentTarget.style.color = '#0A6E3F'; } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#4b5563'; } }}
                  >
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{emoji}</span>
                    <span>{label}</span>
                  </Link>
                );
              })}
          </div>
        </nav>

        {/* Déconnexion */}
        <div className="p-3 border-top">
          <button onClick={logout} className="btn w-100 d-flex align-items-center gap-2 text-start"
            style={{ backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #fee2e2', borderRadius: 10, padding: '10px 14px', fontSize: 14 }}>
            <span>🚪</span>
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <div style={{ marginRight: isMobile ? 0 : 260, minHeight: '100vh' }}>
        {/* Barre sticky mobile avec hamburger */}
        {isMobile && (
          <div style={{
            position: 'sticky', top: 0, backgroundColor: '#ffffff',
            borderBottom: '1px solid #e5e7eb', padding: '12px 16px',
            zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0A6E3F' }}>المنارد الثالثة</span>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                backgroundColor: '#0A6E3F', color: '#fff', border: 'none',
                borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 20, lineHeight: 1,
              }}
              aria-label="فتح القائمة"
            >
              ☰
            </button>
          </div>
        )}
        <div style={{ padding: '2rem' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
