import { useEffect, useState } from 'react';
import api from '../../api/axios';

interface ClasseFormProps {
  onClose: () => void;
  classeId?: number;
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

export default function ClasseForm({ onClose, classeId }: ClasseFormProps) {
  const isEdit = !!classeId;

  const [form, setForm] = useState({
    niveau: 'INTERNAT',
    capaciteMax: 30,
    statut: 'INSCRIT',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit || !classeId) return;
    api.get(`/classes/${classeId}`)
      .then(r => {
        const c = r.data;
        setForm({ niveau: c.niveau, capaciteMax: c.capaciteMax, statut: c.statut || 'INSCRIT' });
      })
      .catch(() => setError('Impossible de charger cette classe.'))
      .finally(() => setFetching(false));
  }, [classeId, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isEdit && classeId) await api.put(`/classes/${classeId}`, form);
      else await api.post('/classes', form);
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

            {/* Niveau */}
            <div className="col-12">
              <label className="form-label fw-semibold text-uppercase" style={labelStyle}>
                Niveau <span className="text-danger">*</span>
              </label>
              <select
                name="niveau"
                value={form.niveau}
                onChange={e => setForm(prev => ({ ...prev, niveau: e.target.value }))}
                className="form-select"
                style={inputStyle}
                required
              >
                <option value="INTERNAT">Internat</option>
                <option value="DEMI_PENSION">Demi-pension</option>
                <option value="EXTERNAT">Externat</option>
              </select>
            </div>

            {/* Capacité max */}
            <div className="col-12">
              <label className="form-label fw-semibold text-uppercase" style={labelStyle}>
                Capacité maximale <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                min={1}
                name="capaciteMax"
                value={form.capaciteMax}
                onChange={e => setForm(prev => ({ ...prev, capaciteMax: Number(e.target.value) }))}
                className="form-control"
                style={inputStyle}
                required
              />
            </div>

            {/* Statut */}
            <div className="col-12">
              <label className="form-label fw-semibold text-uppercase" style={labelStyle}>
                Statut <span className="text-danger">*</span>
              </label>
              <select
                name="statut"
                value={form.statut}
                onChange={e => setForm(prev => ({ ...prev, statut: e.target.value }))}
                className="form-select"
                style={inputStyle}
                required
              >
                <option value="INSCRIT">Inscrit</option>
                <option value="NON_INSCRIT">Non inscrit</option>
              </select>
            </div>

          </div>

          {/* Aperçu du badge niveau */}
          <div className="mb-3 p-3 rounded-3" style={{ backgroundColor: '#f9fafb', border: '1px solid #f0f0f0' }}>
            <p className="mb-2 fw-semibold text-uppercase" style={{ fontSize: 11, color: '#6b7280', letterSpacing: '0.05em' }}>Aperçu</p>
            <div className="d-flex align-items-center gap-3">
              <span
                className="badge rounded-pill fw-medium"
                style={{
                  backgroundColor:
                    form.niveau === 'INTERNAT' ? '#dbeafe' :
                    form.niveau === 'DEMI_PENSION' ? '#ffedd5' : '#dcfce7',
                  color:
                    form.niveau === 'INTERNAT' ? '#1d4ed8' :
                    form.niveau === 'DEMI_PENSION' ? '#9a3412' : '#166534',
                  fontSize: 12,
                  padding: '5px 12px',
                }}
              >
                {form.niveau.replace('_', ' ')}
              </span>
              <span style={{ fontSize: 13, color: '#6b7280' }}>
                Capacité : <strong style={{ color: '#111827' }}>{form.capaciteMax}</strong> élève(s)
              </span>
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
              {loading ? 'Sauvegarde...' : isEdit ? 'Enregistrer les modifications' : 'Créer la classe'}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
