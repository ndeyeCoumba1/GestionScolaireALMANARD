import { useState } from 'react';
import api from '../../api/axios';

interface UserFormProps {
  onClose: () => void;
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
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  color: '#6b7280',
  marginBottom: 6,
} as const;

export default function UserForm({ onClose }: UserFormProps) {
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', password: '', role: 'ENSEIGNANT' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/users', { ...form, actif: true });
      onClose();
    } catch {
      setError('Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="row g-3">
      <div className="col-12 col-md-6">
        <label className="form-label fw-semibold text-uppercase" style={labelStyle}>
          Nom <span className="text-danger">*</span>
        </label>
        <input
          name="nom"
          type="text"
          value={form.nom}
          onChange={handleChange}
          className="form-control"
          style={inputStyle}
          placeholder="Ex : Diop"
          required
        />
      </div>

      <div className="col-12 col-md-6">
        <label className="form-label fw-semibold text-uppercase" style={labelStyle}>
          Prénom <span className="text-danger">*</span>
        </label>
        <input
          name="prenom"
          type="text"
          value={form.prenom}
          onChange={handleChange}
          className="form-control"
          style={inputStyle}
          placeholder="Ex : Amadou"
          required
        />
      </div>

      <div className="col-12 col-md-6">
        <label className="form-label fw-semibold text-uppercase" style={labelStyle}>
          Email <span className="text-danger">*</span>
        </label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className="form-control"
          style={inputStyle}
          placeholder="Ex : amadou@example.com"
          required
        />
      </div>

      <div className="col-12 col-md-6">
        <label className="form-label fw-semibold text-uppercase" style={labelStyle}>
          Mot de passe <span className="text-danger">*</span>
        </label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          className="form-control"
          style={inputStyle}
          placeholder="••••••••"
          required
        />
      </div>

      <div className="col-12 col-md-6">
        <label className="form-label fw-semibold text-uppercase" style={labelStyle}>
          Rôle <span className="text-danger">*</span>
        </label>
        <select
          value={form.role}
          onChange={handleChange}
          name="role"
          className="form-select"
          style={inputStyle}
        >
          <option value="ADMIN">Admin</option>
          <option value="COMPTABLE">Comptable</option>
          <option value="ENSEIGNANT">Enseignant</option>
        </select>
      </div>

      {error && (
        <div className="col-12">
          <div className="alert d-flex align-items-center gap-2 py-2 px-3"
            style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, color: '#dc2626', fontSize: 14 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {error}
          </div>
        </div>
      )}

      <div className="col-12 d-flex gap-3 pt-1">
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
          style={{ background: 'linear-gradient(135deg, #1a5c38, #2d8653)', borderRadius: 10, padding: '10px 0', fontSize: 14, border: 'none', opacity: loading ? 0.7 : 1 }}
        >
          {loading && (
            <span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14, borderWidth: 2 }} />
          )}
          {loading ? 'Création...' : 'Créer l\'utilisateur'}
        </button>
      </div>
    </form>
  );
}
