import { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import Sidebar from './Sidebar';

const SIDEBAR_WIDTH = 260;

export default function Layout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, isMobile]);

  if (!isAuthenticated) return <Navigate to="/login" />;

  return (
    <>
      {/* Overlay mobile */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 999 }}
        />
      )}

      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0,
        width: SIDEBAR_WIDTH,
        height: '100vh',
        overflowY: 'auto',
        zIndex: 1000,
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e5e7eb',
        transform: isMobile && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
        transition: 'transform 0.3s ease',
        boxShadow: isMobile && sidebarOpen ? '4px 0 20px rgba(0,0,0,0.15)' : 'none',
      }}>
        <Sidebar />
      </div>

      {/* Contenu principal */}
      <div style={{ marginLeft: isMobile ? 0 : SIDEBAR_WIDTH, minHeight: '100vh', backgroundColor: '#f4f9f6' }}>
        {/* Barre mobile avec hamburger */}
        {isMobile && (
          <div style={{
            position: 'sticky', top: 0, backgroundColor: '#ffffff',
            borderBottom: '1px solid #e5e7eb', padding: '12px 16px',
            zIndex: 100, display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                backgroundColor: '#0A6E3F', color: '#fff', border: 'none',
                borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 20, lineHeight: 1,
              }}
              aria-label="Ouvrir le menu"
            >
              ☰
            </button>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0A6E3F' }}>Al-Manard3s</span>
          </div>
        )}
        <Outlet />
      </div>
    </>
  );
}
