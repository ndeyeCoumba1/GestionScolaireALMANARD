import { useState } from 'react';
import api from '../../api/axios';
import logo from '../../../Logo.jpeg';
import { Mail, Lock, BookOpen } from 'lucide-react';

interface AuthResponse {
  token: string;
  role: string;
  nom: string;
  prenom: string;
}

export default function ArLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await api.post<AuthResponse>('/auth/login', {
        email,
        password,
      });
      
      console.log('=== CONNEXION ARABE (PAGE SPÉCIFIQUE) ===');
      console.log('Réponse reçue:', { role: res.data.role, nom: res.data.nom, token: res.data.token });
      
      // 🔥 Stocker TOUT directement dans localStorage
      localStorage.clear();
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('nom', res.data.nom);
      localStorage.setItem('portail', 'AR');
      
      // Vérification immédiate
      const verifyToken = localStorage.getItem('token');
      const verifyPortail = localStorage.getItem('portail');
      const verifyRole = localStorage.getItem('role');
      console.log('Token stocké:', !!verifyToken);
      console.log('Portail stocké:', verifyPortail);
      console.log('Role stocké:', verifyRole);
      
      if (verifyPortail !== 'AR') {
        console.error('Échec du stockage du portail, tentative de correction...');
        localStorage.setItem('portail', 'AR');
      }
      
      // 🔥 REDIRECTION DIRECTE
      console.log('Redirection vers /ar/dashboard');
      window.location.href = '/ar/dashboard';
      
    } catch (err: any) {
      console.error('Erreur:', err);
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      } else {
        setError('خطأ في الخادم. يرجى المحاولة مرة أخرى.');
      }
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #0A6E3F 0%, #0f9d58 100%)',
        padding: '20px',
      }}
    >
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-5">
            <div
              className="h-100 d-flex flex-column justify-content-center align-items-center p-5"
              style={{ background: '#ffffff', borderRadius: 24, minHeight: 'auto' }}
            >
              <div className="text-center mb-5">
                <div
                  style={{
                    width: 100, height: 100, margin: '0 auto',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 24,
                    background: 'linear-gradient(135deg, #e9f7ee 0%, #d4edda 100%)',
                    boxShadow: '0 8px 32px rgba(10, 110, 63, 0.15)',
                  }}
                >
                  {logoError ? (
                    <BookOpen size={50} style={{ color: '#0A6E3F' }} />
                  ) : (
                    <img
                      src={logo}
                      alt="Al-Manard3s"
                      style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 24 }}
                      onError={() => setLogoError(true)}
                    />
                  )}
                </div>
                <h2 className="mt-4 mb-2" style={{ color: '#0A6E3F', fontWeight: 700, fontSize: 28, fontFamily: 'serif' }}>
                  المنارد الثالثة
                </h2>
                <p className="text-muted mb-0" style={{ fontSize: 14 }}>نظام إدارة المدرسة</p>
              </div>

              <div style={{ width: '100%', maxWidth: 400 }}>
                <div className="text-center mb-4">
                  <h3 className="fw-bold mb-2" style={{ color: '#111827', fontSize: 22 }}>تسجيل الدخول</h3>
                  <p className="text-muted" style={{ fontSize: 14 }}>الوصول إلى وحدة تلاوة القرآن</p>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert" style={{ borderRadius: 12, border: 'none', fontSize: 13 }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold" style={{ fontSize: 13, color: '#374151' }}>
                      البريد الإلكتروني
                    </label>
                    <div className="input-group">
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-control"
                        placeholder="user@almanard3s.com"
                        style={{
                          borderRadius: '12px 0 0 12px',
                          backgroundColor: '#f9fafb',
                          borderColor: '#e5e7eb',
                          fontSize: 14,
                          padding: '0.75rem 1rem',
                          direction: 'ltr',
                          textAlign: 'left',
                        }}
                        required
                      />
                      <span className="input-group-text" style={{ borderRadius: '0 12px 12px 0', backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
                        <Mail size={18} style={{ color: '#6b7280' }} />
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-semibold" style={{ fontSize: 13, color: '#374151' }}>
                      كلمة المرور
                    </label>
                    <div className="input-group">
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-control"
                        placeholder="••••••••"
                        style={{
                          borderRadius: '12px 0 0 12px',
                          backgroundColor: '#f9fafb',
                          borderColor: '#e5e7eb',
                          fontSize: 14,
                          padding: '0.75rem 1rem',
                        }}
                        required
                      />
                      <span className="input-group-text" style={{ borderRadius: '0 12px 12px 0', backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
                        <Lock size={18} style={{ color: '#6b7280' }} />
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-lg w-100 fw-semibold"
                    style={{ backgroundColor: '#0A6E3F', borderColor: '#0A6E3F', color: '#fff', borderRadius: 12, fontSize: 14, padding: '0.875rem' }}
                    disabled={loading}
                  >
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm ms-2" style={{ width: 16, height: 16, borderWidth: 2 }} />جاري تسجيل الدخول...</>
                    ) : ('تسجيل الدخول')}
                  </button>
                </form>

                <div className="text-center mt-4">
                  <small className="text-muted" style={{ fontSize: 12 }}>© 2026 المنارد الثالثة — جميع الحقوق محفوظة</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
