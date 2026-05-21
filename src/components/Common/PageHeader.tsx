import type { ReactNode } from 'react';
import logo from '../../../Logo.jpeg';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  countText?: string;
  action?: ReactNode;
}

export default function PageHeader({ title, subtitle, description, countText, action }: PageHeaderProps) {
  return (
    <div
      className="rounded-4 px-4 py-3 shadow-sm"
      style={{ background: 'linear-gradient(135deg, #0f9d58 0%, #0f9d58 100%)', color: '#fff' }}
    >
      <div className="d-flex align-items-center justify-content-between gap-3">
        {/* Texte centré */}
        <div className="flex-fill text-center">
          {subtitle && (
            <p className="mb-1 fw-semibold text-uppercase" style={{ fontSize: 11, letterSpacing: '0.18em', opacity: 0.85 }}>
              {subtitle}
            </p>
          )}
          <h6 className="mb-1 fw-bold text-white" style={{ fontSize: 15 }}>{title}</h6>
          {description && <p className="mb-0" style={{ fontSize: 13, opacity: 0.85 }}>{description}</p>}
          {countText && <p className="mb-0 fw-semibold" style={{ fontSize: 13, opacity: 0.9 }}>{countText}</p>}
        </div>

        {/* Action + logo */}
        <div className="d-flex align-items-center gap-2 flex-shrink-0">
          {action}
          <img
            src={logo}
            alt="Al-Manard3s"
            style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 10, border: '2px solid rgba(255,255,255,0.6)' }}
          />
        </div>
      </div>
    </div>
  );
}
