import { NavLink } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

const navItems = [
  { to: '/dashboard', emoji: '🏠', label: 'Tableau de bord', roles: ['ADMIN', 'COMPTABLE', 'ENSEIGNANT'] },
  { to: '/eleves', emoji: '🎓', label: 'Élèves', roles: ['ADMIN', 'COMPTABLE', 'ENSEIGNANT'] },
  { to: '/annees', emoji: '📅', label: 'Années', roles: ['ADMIN', 'COMPTABLE', 'ENSEIGNANT'] },
  { to: '/mois', emoji: '📆', label: 'Mois', roles: ['ADMIN', 'COMPTABLE'] },
  { to: '/parents', emoji: '👨‍👩‍👧', label: 'Parents', roles: ['ADMIN', 'COMPTABLE'] },
  { to: '/classes', emoji: '🏫', label: 'Classes', roles: ['ADMIN', 'COMPTABLE', 'ENSEIGNANT'] },
  { to: '/inscriptions', emoji: '📋', label: 'Inscriptions', roles: ['ADMIN', 'COMPTABLE'] },
  { to: '/paiements', emoji: '💰', label: 'Paiements', roles: ['ADMIN', 'COMPTABLE'] },
  { to: '/depenses', emoji: '📉', label: 'Dépenses', roles: ['ADMIN', 'COMPTABLE'] },
  { to: '/rapports', emoji: '📊', label: 'Rapports', roles: ['ADMIN', 'COMPTABLE'] },
  { to: '/users', emoji: '👤', label: 'Utilisateurs', roles: ['ADMIN'] },
];

export default function Sidebar() {
  const { role, nom, logout } = useAuth();

  return (
    <div
      className="d-flex flex-column"
      style={{
        width: 260,          
        height: '100vh',
        backgroundColor: '#ffffff',
        
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
            <div className="fw-bold" style={{ color: '#0f9d58', fontSize: 16 }}>
              Al-Manard3s
            </div>
            <div className="text-muted" style={{ fontSize: 11 }}>
              Système de Gestion Scolaire
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
            <div className="fw-semibold small" style={{ color: '#0f9d58' }}>{nom}</div>
            <span
              className="badge rounded-pill px-2"
              style={{ backgroundColor: '#e8f5e9', color: '#0f9d58', fontSize: 10 }}
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
              <NavLink
                key={to}
                to={to}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderRadius: 10,
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  backgroundColor: isActive ? '#0f9d58' : 'transparent',
                  color: isActive ? '#ffffff' : '#4b5563',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isActive ? 'translateX(4px)' : 'translateX(0)',
                })}
                onMouseEnter={e => {
                  const el = e.currentTarget;
                  if (!el.style.backgroundColor.includes('0f9d58')) {
                    el.style.backgroundColor = '#f1f8f4';
                    el.style.color = '#0f9d58';
                    el.style.transform = 'translateX(4px)';
                  }
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget;
                  if (!el.style.backgroundColor.includes('0f9d58')) {
                    el.style.backgroundColor = 'transparent';
                    el.style.color = '#4b5563';
                    el.style.transform = 'translateX(0)';
                  }
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{emoji}</span>
                <span>{label}</span>
              </NavLink>
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
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
}