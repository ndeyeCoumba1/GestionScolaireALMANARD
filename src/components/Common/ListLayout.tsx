import type { CSSProperties, ReactNode } from 'react';

/* ─── Banner gradient (identique à PaiementList) ─── */
interface PageBannerProps {
  icon: string;
  subtitle: string;
  title: string;
  count: string;
  action?: ReactNode;
  gradient?: string;
  activeFilters?: number;
}
export function PageBanner({ icon, subtitle, title, count, action, gradient = 'linear-gradient(135deg, #0A6E3F 0%, #15803d 60%, #166534 100%)', activeFilters = 0 }: PageBannerProps) {
  return (
    <div className="rounded-4 overflow-hidden shadow-sm" style={{ background: gradient, padding: '28px 32px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)' }} />
      <div style={{ position: 'absolute', bottom: -20, right: 120, width: 100, height: 100, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)' }} />
      <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap position-relative">
        <div className="d-flex align-items-center gap-4">
          <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 56, height: 56, backgroundColor: 'rgba(255,255,255,0.15)', fontSize: 26 }}>{icon}</div>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{subtitle}</div>
            <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 800, margin: '4px 0 0', letterSpacing: '-0.3px' }}>{title}</h1>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 2 }}>
              {count}
              {activeFilters > 0 && <span style={{ marginLeft: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '2px 10px', fontSize: 11 }}>{activeFilters} filtre{activeFilters > 1 ? 's' : ''} actif{activeFilters > 1 ? 's' : ''}</span>}
            </div>
          </div>
        </div>
        {action && (
          <div>{action}</div>
        )}
      </div>
    </div>
  );
}

/* ─── Bouton action (blanc sur gradient) ─── */
export function BannerBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="btn fw-semibold d-flex align-items-center gap-2"
      style={{ backgroundColor: '#fff', color: '#0A6E3F', borderRadius: 12, fontSize: 14, padding: '10px 22px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
      <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
      {label}
    </button>
  );
}

/* ─── Carte KPI compacte (identique à PaiementList) ─── */
interface KpiCardProps {
  icon: string; label: string; value: string | number;
  sub: string; accent: string; bg: string; borderLeft: string;
}
export function KpiCard({ icon, label, value, sub, accent, bg, borderLeft }: KpiCardProps) {
  return (
    <div className="col-6 col-lg-3">
      <div className="bg-white rounded-3 shadow-sm h-100" style={{ border: '1px solid #f0f0f0', borderLeft: `3px solid ${borderLeft}`, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px' }}>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div className="rounded-2 d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, backgroundColor: bg, fontSize: 15 }}>{icon}</div>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: borderLeft }} />
          </div>
          <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: accent, lineHeight: 1.2 }}>{value}</div>
          <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>{sub}</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Barre de recherche ─── */
interface SearchBarProps {
  value: string; onChange: (v: string) => void;
  placeholder?: string; width?: number;
  extra?: ReactNode;
}
export function SearchBar({ value, onChange, placeholder = 'Rechercher…', width = 240, extra }: SearchBarProps) {
  return (
    <div className="d-flex align-items-center gap-2">
      <div className="position-relative">
        <svg className="position-absolute top-50 translate-middle-y" style={{ left: 12, pointerEvents: 'none' }}
          width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth={2}>
          <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
        </svg>
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{ paddingLeft: 36, paddingRight: 14, paddingTop: 8, paddingBottom: 8, borderRadius: 10, border: '1.5px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: 13, outline: 'none', width, transition: 'border-color 0.15s' }}
          onFocus={e => (e.currentTarget.style.borderColor = '#0A6E3F')}
          onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
        />
      </div>
      {extra}
    </div>
  );
}

/* ─── En-tête de tableau ─── */
export function TableHead({ cols }: { cols: { label: string; align?: 'left' | 'right' | 'center' }[] }) {
  return (
    <thead>
      <tr style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #e5e7eb' }}>
        {cols.map((c, i) => (
          <th key={i} style={{ padding: '11px 16px', textAlign: c.align ?? 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
            {c.label}
          </th>
        ))}
      </tr>
    </thead>
  );
}

/* ─── Footer tableau ─── */
export function TableFooter({ left, right }: { left?: string; right?: string }) {
  return (
    <div style={{ padding: '12px 24px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 11, color: '#d1d5db' }}>{left ?? `© ${new Date().getFullYear()} Al-Manard3s / Fondation Daroul Manar D3S`}</span>
      {right && <span style={{ fontSize: 11, color: '#d1d5db' }}>{right}</span>}
    </div>
  );
}

/* ─── Vide état ─── */
export function EmptyState({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <tr>
      <td colSpan={99} style={{ padding: '56px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
        <div style={{ fontWeight: 600, color: '#374151', marginBottom: 4 }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: '#9ca3af' }}>{sub}</div>}
      </td>
    </tr>
  );
}

/* ─── Avatar initiales ─── */
const AVATAR_COLORS = ['#0A6E3F','#1d4ed8','#7c3aed','#d97706','#dc2626','#0f766e'];
export const avatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];
export const initials    = (a: string, b: string) => `${(a[0]??'').toUpperCase()}${(b[0]??'').toUpperCase()}`;

/* ─── Style constantes ─── */
export const ROW_STYLE: CSSProperties = { borderBottom: '1px solid #f3f4f6', transition: 'background 0.1s' };
export const TD: CSSProperties = { padding: '14px 16px' };
