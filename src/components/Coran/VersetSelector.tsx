import type { VersetJour } from '../../Types/coran';
import { SOURATES } from '../../services/coranService';

interface VersetSelectorProps {
  groupe: string;
  verset: VersetJour;
  onChange: (verset: VersetJour) => void;
}

const inputStyle = {
  borderRadius: 8,
  border: '1px solid #e5e7eb',
  backgroundColor: '#f9fafb',
  fontSize: 14,
  padding: '8px 12px',
  boxShadow: 'none',
} as const;

const labelStyle = {
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  color: '#6b7280',
  marginBottom: 4,
};

export default function VersetSelector({ groupe, verset, onChange }: VersetSelectorProps) {
  const selectedSourate = SOURATES.find((s) => s.numero === verset.sourate);

  const handleChange = (field: keyof VersetJour, value: string | number) => {
    onChange({
      ...verset,
      [field]: value,
    });
  };

  return (
    <div className="p-3 rounded-3 mb-3" style={{ backgroundColor: '#f0fdf4', border: '1px solid #16a34a' }}>
      <h6 className="fw-bold mb-3" style={{ fontSize: 14, color: '#166534' }}>
        📖 Versets du jour - Groupe : {groupe}
      </h6>
      
      <div className="row g-3">
        {/* Sélecteur de sourate - Arabic first, French in parentheses */}
        <div className="col-12 col-md-6">
          <label className="form-label" style={labelStyle}>السورة</label>
          <select
            value={verset.sourate}
            onChange={(e) => handleChange('sourate', parseInt(e.target.value, 10))}
            className="form-select"
            style={inputStyle}
          >
            {SOURATES.map((sourate) => (
              <option key={sourate.numero} value={sourate.numero}>
                {sourate.nomArabe} ({sourate.nomFrancais})
              </option>
            ))}
          </select>
        </div>

        {/* Nom français de la sourate (read-only) */}
        {selectedSourate && (
          <div className="col-12 col-md-6">
            <label className="form-label" style={labelStyle}>Nom français</label>
            <div
              className="form-control d-flex align-items-center"
              style={{
                ...inputStyle,
                backgroundColor: '#e5e7eb',
                cursor: 'not-allowed',
              }}
            >
              {selectedSourate.nomFrancais}
            </div>
          </div>
        )}

        {/* Verset début */}
        <div className="col-6 col-md-3">
          <label className="form-label" style={labelStyle}>آية البداية</label>
          <input
            type="number"
            min="1"
            max={selectedSourate?.nombreVersets || 999}
            value={verset.versetDebut}
            onChange={(e) => handleChange('versetDebut', parseInt(e.target.value, 10))}
            className="form-control"
            style={inputStyle}
          />
        </div>

        {/* Verset fin */}
        <div className="col-6 col-md-3">
          <label className="form-label" style={labelStyle}>آية النهاية</label>
          <input
            type="number"
            min={verset.versetDebut}
            max={selectedSourate?.nombreVersets || 999}
            value={verset.versetFin}
            onChange={(e) => handleChange('versetFin', parseInt(e.target.value, 10))}
            className="form-control"
            style={inputStyle}
          />
        </div>

        {/* Nombre de versets */}
        {selectedSourate && (
          <div className="col-12 col-md-6">
            <label className="form-label" style={labelStyle}>إجمالي الآيات</label>
            <div className="form-control" style={{ ...inputStyle, backgroundColor: '#e5e7eb' }}>
              {selectedSourate.nombreVersets} آية
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
