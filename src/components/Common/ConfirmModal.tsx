import { useEffect } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'danger',
}: ConfirmModalProps) {

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const variantStyles = {
    danger:  { bg: '#fef2f2', icon: '⚠️', confirmBg: '#dc2626', confirmHover: '#b91c1c' },
    warning: { bg: '#fffbeb', icon: '⚡', confirmBg: '#f59e0b', confirmHover: '#d97706' },
    info:    { bg: '#eff6ff', icon: 'ℹ️', confirmBg: '#3b82f6', confirmHover: '#2563eb' },
  };

  const s = variantStyles[variant];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#fff', borderRadius: 16, width: '100%', maxWidth: 400,
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ backgroundColor: s.bg, padding: '20px 24px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
              {s.icon}
            </div>
            <h5 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>{title}</h5>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: 18, flexShrink: 0 }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 24px 20px' }}>
          <p style={{ margin: 0, fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>{message}</p>
        </div>

        {/* Footer */}
        <div style={{ padding: '0 24px 24px', display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            style={{ flex: 1, border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#374151', borderRadius: 10, padding: '10px 0', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{ flex: 1, backgroundColor: s.confirmBg, border: 'none', color: '#fff', borderRadius: 10, padding: '10px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = s.confirmHover)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = s.confirmBg)}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
