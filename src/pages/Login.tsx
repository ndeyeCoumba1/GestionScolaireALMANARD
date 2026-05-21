import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import api from '../api/axios';
import type { AuthResponse } from '../Types/index';
import logo from '../../Logo.jpeg';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [logoError, setLogoError] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post<AuthResponse>('/auth/login', { email, password });
      login(res.data.token, res.data.role, res.data.nom);
      navigate('/dashboard');
    } catch {
      setError('Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', width: '100vw', background: '#0f9d58', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div className="card shadow-lg rounded-4 overflow-hidden" style={{ width: '100%' }}>
          <div className="card-header bg-white border-0 text-center py-4">
            <div style={{ width: 90, height: 90, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 24, background: '#e9f7ee', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
              <img
                src={logo}
                alt="Al-Manard3s"
                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 24 }}
                onError={() => setLogoError(true)}
              />
            </div>
            <h2 className="mt-3 mb-0" style={{ color: '#0f9d58', fontWeight: 700 }}>Al-Manard3s</h2>
            <small className="text-muted">Système de Gestion Scolaire</small>
          </div>
          <div className="card-body p-4">
            <p className="text-center text-secondary">Connectez-vous </p>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3" style={{ marginBottom: '1rem' }}>
                <label htmlFor="email" className="form-label" style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem' }}>Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control"
                  placeholder="user@almanard3s.com"
                  style={{ padding: '0.85rem 1rem', borderRadius: '14px', borderColor: '#d1d5db' }}
                  required
                />
              </div>

              <div className="mb-3" style={{ marginBottom: '1rem' }}>
                <label htmlFor="password" className="form-label" style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem' }}>Mot de passe</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control"
                  placeholder="••••••••"
                  style={{ padding: '0.85rem 1rem', borderRadius: '14px', borderColor: '#d1d5db' }}
                  required
                />
              </div>

              <div className="d-grid">
                <button type="submit" className="btn btn-lg" style={{ backgroundColor: '#0f9d58', borderColor: '#0f9d58', color: '#fff' }} disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Connexion...
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </button>
              </div>
            </form>

            <div className="text-center mt-4">
              <small className="text-muted">© 2026 Al-Manard3s — Tous droits réservés</small>
            </div>
          </div>
        </div>
        <div className="text-center mt-3 text-white-50">
          <small>Besoin d'aide ? Contactez l'administrateur.</small>
        </div>
      </div>
    </div>
  );
}