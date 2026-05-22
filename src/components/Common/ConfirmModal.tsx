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
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      bg: '#fef2f2',
      border: '#fecaca',
      icon: '⚠️',
      confirmBg: '#dc2626',
      confirmHover: '#b91c1c',
    },
    warning: {
      bg: '#fffbeb',
      border: '#fde68a',
      icon: '⚡',
      confirmBg: '#f59e0b',
      confirmHover: '#d97706',
    },
    info: {
      bg: '#eff6ff',
      border: '#bfdbfe',
      icon: 'ℹ️',
      confirmBg: '#3b82f6',
      confirmHover: '#2563eb',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      className="modal fade show"
      style={{
        display: 'block',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
      tabIndex={-1}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: 400 }}
      >
        <div
          className="modal-content rounded-4 overflow-hidden"
          style={{ border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
        >
          {/* Header */}
          <div
            className="modal-header border-0 pb-0"
            style={{ backgroundColor: style.bg }}
          >
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 40, height: 40, backgroundColor: 'rgba(255, 255, 255, 0.8)', fontSize: 20 }}
              >
                {style.icon}
              </div>
              <h5 className="modal-title fw-bold mb-0" style={{ fontSize: 16, color: '#111827' }}>
                {title}
              </h5>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              style={{ fontSize: 18, opacity: 0.5 }}
            />
          </div>

          {/* Body */}
          <div className="modal-body py-4">
            <p className="mb-0" style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
              {message}
            </p>
          </div>

          {/* Footer */}
          <div className="modal-footer border-0 pt-0 gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn flex-fill fw-medium"
              style={{
                border: '1px solid #e5e7eb',
                color: '#6b7280',
                borderRadius: 10,
                padding: '10px 0',
                fontSize: 14,
              }}
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="btn flex-fill fw-semibold text-white"
              style={{
                backgroundColor: style.confirmBg,
                border: 'none',
                borderRadius: 10,
                padding: '10px 0',
                fontSize: 14,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = style.confirmHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = style.confirmBg;
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
