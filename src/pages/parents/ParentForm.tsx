import { useEffect, useState } from 'react';
import api from '../../api/axios';

interface ParentFormProps {
  onClose: () => void;
  parentId?: number;
}

const fields = [
  { name: 'nom',        label: 'Nom',       required: true,  placeholder: 'nom' },
  { name: 'prenom',     label: 'Prénom',     required: true,  placeholder: 'prenom' },
  { name: 'telephone',  label: 'Téléphone',  required: true,  placeholder: 'telephone' },
  { name: 'email',      label: 'Email',      required: false, placeholder: 'email' },
  { name: 'adresse',    label: 'Adresse',    required: false, placeholder: 'adresse' },
  { name: 'profession', label: 'Profession', required: false, placeholder: 'profession' },
] as const;

type FormData = Record<typeof fields[number]['name'], string>;

export default function ParentForm({ onClose, parentId }: ParentFormProps) {
  const isEdit = !!parentId;

  const [form, setForm] = useState<FormData>({
    nom: '', prenom: '', telephone: '',
    email: '', adresse: '', profession: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit || !parentId) return;
    api.get(`/parents/${parentId}`)
      .then(r => {
        const p = r.data;
        setForm({
          nom: p.nom ?? '', prenom: p.prenom ?? '', telephone: p.telephone ?? '',
          email: p.email ?? '', adresse: p.adresse ?? '', profession: p.profession ?? '',
        });
      })
      .catch(() => setError('Impossible de charger ce parent.'))
      .finally(() => setFetching(false));
  }, [parentId, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isEdit && parentId) await api.put(`/parents/${parentId}`, form);
      else await api.post('/parents', form);
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
            {fields.map(({ name, label, required, placeholder }) => (
              <div className="col-12 col-md-6" key={name}>
                <label className="form-label fw-semibold text-uppercase" style={{ fontSize: 11, color: '#6b7280', letterSpacing: '0.05em' }}>
                  {label}{required && <span className="text-danger ms-1">*</span>}
                </label>
                <input
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  required={required}
                  placeholder={placeholder}
                  className="form-control"
                  style={{ borderRadius: 10, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: 14, padding: '10px 14px', boxShadow: 'none' }}
                />
              </div>
            ))}
          </div>

          {error && (
            <div className="alert d-flex align-items-center gap-2 py-2 px-3 mb-3"
              style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, color: '#dc2626', fontSize: 14 }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

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
              {loading ? 'Sauvegarde...' : isEdit ? 'Enregistrer les modifications' : 'Créer le parent'}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
