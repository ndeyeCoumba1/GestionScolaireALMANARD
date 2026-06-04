import type { NiveauMemorisation } from '../../Types/coran';
import { NiveauMemorisation as NiveauMemorisationConst } from '../../Types/coran';

interface NiveauBadgeProps {
  niveau: NiveauMemorisation;
}

const badgeStyles = {
  [NiveauMemorisationConst.MEMORISE]: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    label: 'MÉMORISÉ',
    icon: '✅',
  },
  [NiveauMemorisationConst.PARTIEL]: {
    backgroundColor: '#ffedd5',
    color: '#9a3412',
    label: 'PARTIEL',
    icon: '⚠️',
  },
  [NiveauMemorisationConst.NON_MEMORISE]: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    label: 'NON MÉMORISÉ',
    icon: '❌',
  },
  [NiveauMemorisationConst.ABSENT]: {
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
    label: 'ABSENT',
    icon: '🚫',
  },
};

export default function NiveauBadge({ niveau }: NiveauBadgeProps) {
  const style = badgeStyles[niveau] || badgeStyles[NiveauMemorisationConst.ABSENT];

  return (
    <span
      className="badge rounded-pill fw-medium d-flex align-items-center gap-1"
      style={{
        backgroundColor: style.backgroundColor,
        color: style.color,
        fontSize: 11,
        padding: '5px 10px',
      }}
    >
      <span style={{ fontSize: 12 }}>{style.icon}</span>
      {style.label}
    </span>
  );
}
