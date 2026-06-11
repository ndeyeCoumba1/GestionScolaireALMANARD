import type { CSSProperties } from 'react';

export const INPUT: CSSProperties = {
  borderRadius: 8,
  border: '1.5px solid #e5e7eb',
  backgroundColor: '#ffffff',
  fontSize: 14,
  padding: '10px 14px',
  boxShadow: 'none',
};

export const INPUT_ICON: CSSProperties = {
  ...INPUT,
  paddingLeft: 40,
};

export const LABEL: CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: '#111827',
  marginBottom: 6,
};

export const SUBMIT_BTN = (disabled: boolean): CSSProperties => ({
  background: 'linear-gradient(135deg, #10a050, #1a5c38)',
  borderRadius: 10,
  padding: '12px 0',
  fontSize: 14,
  fontWeight: 600,
  opacity: disabled ? 0.7 : 1,
  border: 'none',
  boxShadow: disabled ? 'none' : '0 2px 8px rgba(16,160,80,0.3)',
});

export const CANCEL_BTN: CSSProperties = {
  border: '1.5px solid #e5e7eb',
  color: '#374151',
  borderRadius: 10,
  padding: '12px 0',
  fontSize: 14,
  backgroundColor: '#f9fafb',
};

export const FCFA_SUFFIX: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: '#6b7280',
  backgroundColor: '#f9fafb',
  border: '1.5px solid #e5e7eb',
  borderLeft: 'none',
  borderRadius: '0 8px 8px 0',
  padding: '0 12px',
};

export function SectionHeader({ title, icon }: { title: string; icon?: React.ReactNode }) {
  return (
    <div className="col-12 d-flex align-items-center gap-2" style={{ marginTop: 18, marginBottom: 4 }}>
      {icon && (
        <span style={{ color: '#10a050', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {icon}
        </span>
      )}
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#10a050', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        {title}
      </span>
      <div style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
    </div>
  );
}

export function FieldIcon({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative' }}>
      <span style={{
        position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
        color: '#9ca3af', pointerEvents: 'none', display: 'flex', alignItems: 'center', zIndex: 1,
      }}>
        {icon}
      </span>
      {children}
    </div>
  );
}
