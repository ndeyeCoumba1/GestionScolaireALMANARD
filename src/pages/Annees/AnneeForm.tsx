import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { formatDateForInput } from '../../utils/dateUtils';

interface AnneeFormProps {
  onClose: () => void;
  anneeId?: number;
}

const inputStyle = {
  borderRadius: 10,
  border: '1px solid #e5e7eb',
  backgroundColor: '#f9fafb',
  fontSize: 14,
  padding: '10px 14px',
  boxShadow: 'none',
} as const;

const labelStyle = {
  fontSize: 11,
  color: '#6b7280',
  letterSpacing: '0.05em',
} as const;

export default function AnneeForm({ onClose, anneeId }: AnneeFormProps) {
  const isEdit = !!anneeId;

  const [form, setForm] = useState({
    libelle: '',
    dateDebut: '',
    dateFin: '',
    actif: true,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit || !anneeId) return;
    api.get(`/annees/${anneeId}`)
      .then(r => {
        const a = r.data;
        setForm({
          libelle: a.libelle,
          dateDebut: formatDateForInput(a.dateDebut),
          dateFin: formatDateForInput(a.dateFin),
          actif: a.actif
        });
      })
      .catch(() => setError('Impossible de charger cette année scolaire.'))
      .finally(() => setFetching(false));
  }, [anneeId, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isEdit && anneeId) await api.put(`/annees/${anneeId}`, form);
      else await api.post('/annees', form);
      onClose();
    } catch {
      setError('Erreur lors de la sauvegarde. Vérifiez les champs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {fetching ? (
        <div className="text-center py-5 text-muted">Chargement...</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="row g-3 mb-3">

            {/* Libellé */}
            <div className="col-12">
              <label className="form-label fw-semibold text-uppercase" style={labelStyle}>
                Libellé <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="libelle"
                value={form.libelle}
                onChange={handleChange}
                placeholder="Ex : 2024-2025"
                className="form-control"
                style={inputStyle}
                required
              />
            </div>

            {/* Date début */}
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-uppercase" style={labelStyle}>
                Date début <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                name="dateDebut"
                value={form.dateDebut}
                onChange={handleChange}
                className="form-control"
                style={inputStyle}
                required
              />
            </div>

            {/* Date fin */}
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-uppercase" style={labelStyle}>
                Date fin <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                name="dateFin"
                value={form.dateFin}
                onChange={handleChange}
                className="form-control"
                style={inputStyle}
                required
              />
            </div>

            {/* Actif */}
            <div className="col-12">
              <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ backgroundColor: '#f9fafb', border: '1px solid #f0f0f0' }}>
                <input
                  type="checkbox"
                  name="actif"
                  id="actif"
                  checked={form.actif}
                  onChange={handleChange}
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                />
                <label htmlFor="actif" className="fw-semibold mb-0" style={{ fontSize: 14, cursor: 'pointer' }}>
                  Année active
                </label>
              </div>
            </div>

          </div>

          {/* Erreur */}
          {error && (
            <div className="alert d-flex align-items-center gap-2 py-2 px-3 mb-3"
              style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, color: '#dc2626', fontSize: 14 }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Boutons */}
          <div className="d-flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="btn flex-fill fw-medium"
              style={{ border: '1px solid #e5e7eb', color: '#6b7280', borderRadius: 10, padding: '10px 0', fontSize: 14 }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn flex-fill fw-semibold text-white d-flex align-items-center justify-content-center gap-2"
              style={{ background: 'linear-gradient(135deg, #1a5c38, #2d8653)', borderRadius: 10, padding: '10px 0', fontSize: 14, opacity: loading ? 0.7 : 1, border: 'none' }}
            >
              {loading && (
                <span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14, borderWidth: 2 }} />
              )}
              {loading ? 'Sauvegarde...' : isEdit ? 'Enregistrer les modifications' : 'Créer l\'année'}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
