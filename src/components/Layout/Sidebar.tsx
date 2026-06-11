import { NavLink } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

/* ── Inline SVG icons ── */
const IcDashboard = () => <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>;
const IcEleve     = () => <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>;
const IcCalendar  = () => <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="4" width="18" height="18" rx="2"/><path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18"/></svg>;
const IcParent    = () => <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
const IcClasse    = () => <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline strokeLinecap="round" strokeLinejoin="round" points="9 22 9 12 15 12 15 22"/></svg>;
const IcInscript  = () => <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>;
const IcPaiement  = () => <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="1" y="4" width="22" height="16" rx="2"/><path strokeLinecap="round" d="M1 10h22"/></svg>;
const IcDepense   = () => <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/></svg>;
const IcRapport   = () => <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>;
const IcUser      = () => <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="8" r="4"/><path strokeLinecap="round" strokeLinejoin="round" d="M4 20c0-4 3.582-7 8-7s8 3 8 7"/></svg>;
const IcLogout    = () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>;

const navGroups = [
  {
    label: 'Principal',
    items: [
      { to: '/dashboard', icon: <IcDashboard />, label: 'Tableau de bord', roles: ['ADMIN','COMPTABLE','ENSEIGNANT','RECITATEUR'] },
    ],
  },
  {
    label: 'Gestion',
    items: [
      { to: '/eleves',       icon: <IcEleve />,    label: 'Élèves',       roles: ['ADMIN','COMPTABLE','ENSEIGNANT'] },
      { to: '/parents',      icon: <IcParent />,   label: 'Parents',      roles: ['ADMIN','COMPTABLE'] },
      { to: '/classes',      icon: <IcClasse />,   label: 'Classes',      roles: ['ADMIN','COMPTABLE','ENSEIGNANT'] },
      { to: '/inscriptions', icon: <IcInscript />, label: 'Inscriptions', roles: ['ADMIN','COMPTABLE'] },
    ],
  },
  {
    label: 'Finance',
    items: [
      { to: '/annees',    icon: <IcCalendar />, label: 'Années',   roles: ['ADMIN','COMPTABLE','ENSEIGNANT'] },
      { to: '/mois',      icon: <IcCalendar />, label: 'Mois',     roles: ['ADMIN','COMPTABLE'] },
      { to: '/paiements', icon: <IcPaiement />, label: 'Paiements',roles: ['ADMIN','COMPTABLE'] },
      { to: '/depenses',  icon: <IcDepense />,  label: 'Dépenses', roles: ['ADMIN','COMPTABLE'] },
      { to: '/rapports',  icon: <IcRapport />,  label: 'Rapports', roles: ['ADMIN','COMPTABLE'] },
    ],
  },
  {
    label: 'Administration',
    items: [
      { to: '/users', icon: <IcUser />, label: 'Utilisateurs', roles: ['ADMIN'] },
    ],
  },
];

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Administrateur', COMPTABLE: 'Comptable',
  ENSEIGNANT: 'Enseignant', RECITATEUR: 'Récitateur',
};

export default function Sidebar() {
  const { role, nom, prenom, logout } = useAuth();

  const initials = `${(nom?.[0] ?? '').toUpperCase()}${(prenom?.[0] ?? (nom?.[1] ?? '')).toUpperCase()}`;

  return (
    <div
      className="d-flex flex-column"
      style={{
        width: 252,
        minWidth: 252,
        height: '100vh',
        background: 'linear-gradient(180deg, #134e2a 0%, #166534 50%, #134e2a 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Décoration fond */}
      <div style={{ position: 'absolute', top: -60, right: -60, width: 180, height: 180, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 80, left: -40, width: 120, height: 120, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.02)', pointerEvents: 'none' }} />

      {/* ── Logo ── */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="d-flex align-items-center gap-3">
          <div style={{ width: 42, height: 42, borderRadius: 12, overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', border: '2px solid rgba(255,255,255,0.15)' }}>
            <img src="/logo.jpeg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: 15, fontWeight: 800, letterSpacing: '-0.2px', lineHeight: 1.2 }}>Al-Manard3s</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, letterSpacing: '0.04em', marginTop: 2 }}>Gestion Scolaire</div>
          </div>
        </div>

        {/* ── Profil utilisateur ── */}
        <div style={{ marginTop: 16, padding: '10px 12px', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: 'linear-gradient(135deg, #22c55e, #0A6E3F)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            {initials || '?'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nom}</div>
            <div style={{ display: 'inline-block', backgroundColor: 'rgba(34,197,94,0.2)', color: '#4ade80', borderRadius: 20, padding: '1px 8px', fontSize: 10, fontWeight: 600, marginTop: 2 }}>
              {ROLE_LABEL[role ?? ''] ?? role}
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 12px', scrollbarWidth: 'none' }}>
        <div className="d-flex flex-column gap-1">
          {navGroups.map(group => {
            const visible = group.items.filter(item => item.roles.includes(role || ''));
            if (visible.length === 0) return null;
            return (
              <div key={group.label} style={{ marginBottom: 4 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '8px 10px 4px' }}>
                  {group.label}
                </div>
                <div className="d-flex flex-column gap-1">
                  {visible.map(({ to, icon, label }) => (
                    <NavLink
                      key={to}
                      to={to}
                      style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '9px 12px',
                        borderRadius: 10,
                        textDecoration: 'none',
                        fontSize: 13,
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                        backgroundColor: isActive ? 'rgba(34,197,94,0.18)' : 'transparent',
                        borderLeft: isActive ? '3px solid #22c55e' : '3px solid transparent',
                        transition: 'all 0.15s ease',
                        position: 'relative',
                      })}
                      onMouseEnter={e => {
                        const el = e.currentTarget;
                        if (!el.style.backgroundColor.includes('34,197,94')) {
                          el.style.backgroundColor = 'rgba(255,255,255,0.06)';
                          el.style.color = 'rgba(255,255,255,0.85)';
                        }
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget;
                        if (!el.style.backgroundColor.includes('34,197,94')) {
                          el.style.backgroundColor = 'transparent';
                          el.style.color = 'rgba(255,255,255,0.55)';
                        }
                      }}
                    >
                      <span style={{ flexShrink: 0, opacity: 0.9 }}>{icon}</span>
                      <span style={{ flex: 1 }}>{label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </nav>

      {/* ── Déconnexion ── */}
      <div style={{ padding: '12px 12px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={logout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.25)', backgroundColor: 'rgba(239,68,68,0.08)', color: '#f87171', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.18)'; e.currentTarget.style.color = '#fca5a5'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#f87171'; }}
        >
          <IcLogout />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
}
