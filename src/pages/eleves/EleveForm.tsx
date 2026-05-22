import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { Classe, Parent } from '../../Types/index';

interface EleveFormProps {
  onClose: () => void;
  eleveId?: number;
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

export default function EleveForm({ onClose, eleveId }: EleveFormProps) {
  const isEdit = !!eleveId;

  const [form, setForm] = useState({
    nom: '', prenom: '', dateNaissance: '',
    sexe: 'M', adresse: '',
    classeId: '', parentId: '',
  });
  const [classes, setClasses] = useState<Classe[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/classes').then(r => setClasses(r.data));
    api.get('/parents').then(r => setParents(r.data));
    if (isEdit && eleveId) {
      api.get(`/eleves/${eleveId}`)
        .then(r => {
          const e = r.data;
          setForm({
            nom: e.nom, prenom: e.prenom,
            dateNaissance: e.dateNaissance,
            sexe: e.sexe, adresse: e.adresse,
            classeId: e.classeId, parentId: e.parentId,
          });
        })
        .catch(() => setError('Impossible de charger cet élève.'))
        .finally(() => setFetching(false));
    }
  }, [eleveId, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        nom: form.nom, prenom: form.prenom,
        dateNaissance: form.dateNaissance,
        sexe: form.sexe, adresse: form.adresse,
        classe: { id: Number(form.classeId) },
        parent: { id: Number(form.parentId) },
      };
      if (isEdit && eleveId) await api.put(`/eleves/${eleveId}`, payload);
      else await api.post('/eleves', payload);
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

            {/* Nom */}
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-uppercase" style={labelStyle}>
                Nom <span className="text-danger">*</span>
              </label>
              <input name="nom" value={form.nom} onChange={handleChange} required
                placeholder="Ex : Ndiaye" className="form-control" style={inputStyle} />
            </div>

            {/* Prénom */}
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-uppercase" style={labelStyle}>
                Prénom <span className="text-danger">*</span>
              </label>
              <input name="prenom" value={form.prenom} onChange={handleChange} required
                placeholder="Ex : Aminata" className="form-control" style={inputStyle} />
            </div>

            {/* Date de naissance */}
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-uppercase" style={labelStyle}>
                Date de naissance <span className="text-danger">*</span>
              </label>
              <input type="date" name="dateNaissance" value={form.dateNaissance} onChange={handleChange} required
                className="form-control" style={inputStyle} />
            </div>

            {/* Sexe */}
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-uppercase" style={labelStyle}>
                Sexe <span className="text-danger">*</span>
              </label>
              <select name="sexe" value={form.sexe} onChange={handleChange}
                className="form-select" style={inputStyle}>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>

            {/* Adresse */}
            <div className="col-12">
              <label className="form-label fw-semibold text-uppercase" style={labelStyle}>
                Adresse
              </label>
              <input name="adresse" value={form.adresse} onChange={handleChange}
                placeholder="Ex : Dakar, Médina" className="form-control" style={inputStyle} />
            </div>

            {/* Classe */}
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-uppercase" style={labelStyle}>
                Classe <span className="text-danger">*</span>
              </label>
              <select name="classeId" value={form.classeId} onChange={handleChange} required
                className="form-select" style={inputStyle}>
                <option value="">Choisir une classe</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.niveau}</option>
                ))}
              </select>
            </div>

            {/* Parent */}
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-uppercase" style={labelStyle}>
                Parent <span className="text-danger">*</span>
              </label>
              <select name="parentId" value={form.parentId} onChange={handleChange} required
                className="form-select" style={inputStyle}>
                <option value="">Choisir un parent</option>
                {parents.map(p => (
                  <option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>
                ))}
              </select>
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
              {loading ? 'Sauvegarde...' : isEdit ? 'Enregistrer les modifications' : 'Créer l\'élève'}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
