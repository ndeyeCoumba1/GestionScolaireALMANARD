interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

export function SkeletonTable({ rows = 5, columns = 6 }: SkeletonTableProps) {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
      `}</style>
      <table className="table align-middle mb-0" style={{ fontSize: 14 }}>
        <thead style={{ backgroundColor: '#f9fafb' }}>
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="py-3 px-4 fw-semibold text-uppercase"
                style={{ color: '#9ca3af', fontSize: 11, letterSpacing: '0.05em', borderTop: '1px solid #f0f0f0' }}>
                <div className="skeleton" style={{ height: 12, width: '60%', borderRadius: 4 }} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} style={{ borderTop: '1px solid #f3f4f6' }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="py-3 px-4">
                  <div
                    className="skeleton"
                    style={{
                      height: colIndex === columns - 1 ? 32 : 16,
                      width: colIndex === columns - 1 ? 32 : colIndex === 0 ? '70%' : '40%',
                      borderRadius: colIndex === columns - 1 ? 8 : 4,
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

interface SkeletonCardProps {
  count?: number;
}

export function SkeletonCard({ count = 3 }: SkeletonCardProps) {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
      `}</style>
      <div className="row g-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="col-12 col-md-4">
            <div className="bg-white rounded-4 shadow-sm h-100 overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
              <div className="skeleton" style={{ height: 5, width: '100%' }} />
              <div className="p-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="skeleton" style={{ height: 24, width: 24, borderRadius: '50%' }} />
                  <div className="skeleton" style={{ height: 24, width: 80, borderRadius: 12 }} />
                </div>
                <div className="skeleton mb-2" style={{ height: 20, width: '60%', borderRadius: 4 }} />
                <div className="skeleton mb-3" style={{ height: 12, width: '40%', borderRadius: 4 }} />
                <div className="d-flex align-items-center justify-content-between">
                  <div className="skeleton" style={{ height: 28, width: 40, borderRadius: 4 }} />
                  <div className="skeleton" style={{ height: 24, width: 60, borderRadius: 12 }} />
                </div>
                <div className="skeleton mt-3" style={{ height: 6, width: '100%', borderRadius: 3 }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
