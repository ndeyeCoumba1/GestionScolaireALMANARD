interface SeanceStatsBarProps {
  presents: number;
  memorises: number;
  partiels: number;
  absents: number;
  totalEleves: number;
}

export default function SeanceStatsBar({
  presents,
  memorises,
  partiels,
  absents,
  totalEleves,
}: SeanceStatsBarProps) {
  const presencePercentage = totalEleves > 0 ? (presents / totalEleves) * 100 : 0;
  const memorisationPercentage = presents > 0 ? (memorises / presents) * 100 : 0;

  return (
    <div className="p-4 rounded-4 mb-4" style={{ backgroundColor: '#f0fdf4', border: '1px solid #16a34a' }}>
      <div className="row g-4">
        {/* Présence */}
        <div className="col-12 col-md-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: 48, height: 48, backgroundColor: '#16a34a', fontSize: 20 }}
            >
              ✅
            </div>
            <div>
              <small className="text-muted fw-semibold" style={{ fontSize: 11, letterSpacing: '0.05em' }}>
                PRÉSENCE
              </small>
              <div className="fw-bold" style={{ fontSize: 20, color: '#166534' }}>
                {presents} / {totalEleves}
              </div>
              <small style={{ fontSize: 11, color: '#6b7280' }}>{presencePercentage.toFixed(0)}%</small>
            </div>
          </div>
          <div
            className="mt-2 rounded-2"
            style={{
              height: 6,
              backgroundColor: '#e5e7eb',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${presencePercentage}%`,
                backgroundColor: '#16a34a',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Mémorisés */}
        <div className="col-12 col-md-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: 48, height: 48, backgroundColor: '#dcfce7', fontSize: 20 }}
            >
              📚
            </div>
            <div>
              <small className="text-muted fw-semibold" style={{ fontSize: 11, letterSpacing: '0.05em' }}>
                MÉMORISÉS
              </small>
              <div className="fw-bold" style={{ fontSize: 20, color: '#166534' }}>
                {memorises}
              </div>
              <small style={{ fontSize: 11, color: '#6b7280' }}>{memorisationPercentage.toFixed(0)}%</small>
            </div>
          </div>
          <div
            className="mt-2 rounded-2"
            style={{
              height: 6,
              backgroundColor: '#e5e7eb',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${memorisationPercentage}%`,
                backgroundColor: '#22c55e',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Partiels */}
        <div className="col-12 col-md-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: 48, height: 48, backgroundColor: '#ffedd5', fontSize: 20 }}
            >
              ⚠️
            </div>
            <div>
              <small className="text-muted fw-semibold" style={{ fontSize: 11, letterSpacing: '0.05em' }}>
                PARTIELS
              </small>
              <div className="fw-bold" style={{ fontSize: 20, color: '#9a3412' }}>
                {partiels}
              </div>
              <small style={{ fontSize: 11, color: '#6b7280' }}>
                {presents > 0 ? ((partiels / presents) * 100).toFixed(0) : 0}%
              </small>
            </div>
          </div>
          <div
            className="mt-2 rounded-2"
            style={{
              height: 6,
              backgroundColor: '#e5e7eb',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${presents > 0 ? (partiels / presents) * 100 : 0}%`,
                backgroundColor: '#f97316',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Absents */}
        <div className="col-12 col-md-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: 48, height: 48, backgroundColor: '#f3f4f6', fontSize: 20 }}
            >
              🚫
            </div>
            <div>
              <small className="text-muted fw-semibold" style={{ fontSize: 11, letterSpacing: '0.05em' }}>
                ABSENTS
              </small>
              <div className="fw-bold" style={{ fontSize: 20, color: '#6b7280' }}>
                {absents}
              </div>
              <small style={{ fontSize: 11, color: '#6b7280' }}>
                {totalEleves > 0 ? ((absents / totalEleves) * 100).toFixed(0) : 0}%
              </small>
            </div>
          </div>
          <div
            className="mt-2 rounded-2"
            style={{
              height: 6,
              backgroundColor: '#e5e7eb',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${totalEleves > 0 ? (absents / totalEleves) * 100 : 0}%`,
                backgroundColor: '#9ca3af',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
