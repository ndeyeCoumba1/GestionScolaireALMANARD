import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';

const fields = [
  { name: 'nom',        label: 'Nom',       required: true,  placeholder: 'nom' },
  { name: 'prenom',     label: 'Prénom',     required: true,  placeholder: 'prenom' },
  { name: 'telephone',  label: 'Téléphone',  required: true,  placeholder: 'telephone' },
  { name: 'email',      label: 'Email',      required: false, placeholder: 'email' },
  { name: 'adresse',    label: 'Adresse',    required: false, placeholder: 'adresse' },
  { name: 'profession', label: 'Profession', required: false, placeholder: 'profession' },
] as const;

type FormData = Record<typeof fields[number]['name'], string>;

export default function ParentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState<FormData>({
    nom: '', prenom: '', telephone: '',
    email: '', adresse: '', profession: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/parents/${id}`)
      .then(r => {
        const p = r.data;
        setForm({
          nom: p.nom ?? '', prenom: p.prenom ?? '', telephone: p.telephone ?? '',
          email: p.email ?? '', adresse: p.adresse ?? '', profession: p.profession ?? '',
        });
      })
      .catch(() => setError('Impossible de charger ce parent.'))
      .finally(() => setFetching(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isEdit) await api.put(`/parents/${id}`, form);
      else await api.post('/parents', form);
      navigate('/parents');
    } catch {
      setError('Erreur lors de la sauvegarde. Vérifiez les champs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>

      {/* ── Card ── */}
      <div className="bg-white rounded-4 shadow-sm overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
        {/* Bande verte */}
        <div style={{ height: 5, background: 'linear-gradient(90deg, #1a5c38, #4ade80)' }} />

        <div className="p-4">
          {/* ── Header ── */}
          <div className="d-flex align-items-center gap-3 mb-4">
            <button
              type="button"
              onClick={() => navigate('/parents')}
              className="btn btn-sm d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', color: '#9ca3af' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <div>
              <h5 className="mb-0 fw-bold text-dark">{isEdit ? 'Modifier le parent' : 'Nouveau parent'}</h5>
              <small className="text-muted">
                {isEdit ? 'Mettez à jour les informations du responsable.' : 'Renseignez les informations du responsable.'}
              </small>
            </div>
          </div>

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
                  onClick={() => navigate('/parents')}
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
        </div>
      </div>
    </div>
  );
}
