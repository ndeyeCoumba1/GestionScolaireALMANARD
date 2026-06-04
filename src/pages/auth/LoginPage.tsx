import { useState } from 'react';
// import { useNavigate } from 'react-router-dom'; // ← SUPPRIMÉ - on utilise window.location
import { useAuth } from '../../Context/AuthContext';
import api from '../../api/axios';
import type { AuthResponse } from '../../Types/index';
import { Mail, Lock, GraduationCap, BookOpen } from 'lucide-react';
import logo from '../../../Logo.jpeg';

export default function LoginPage() {
  // const navigate = useNavigate(); // ← SUPPRIMÉ
  const { login } = useAuth();

  // French form state
  const [frenchEmail, setFrenchEmail] = useState('');
  const [frenchPassword, setFrenchPassword] = useState('');
  const [frenchError, setFrenchError] = useState('');
  const [frenchLoading, setFrenchLoading] = useState(false);

  // Arabic form state
  const [arabicEmail, setArabicEmail] = useState('');
  const [arabicPassword, setArabicPassword] = useState('');
  const [arabicError, setArabicError] = useState('');
  const [arabicLoading, setArabicLoading] = useState(false);

  const [logoError, setLogoError] = useState(false);

  // ── Formulaire FRANÇAIS (corrigé) ───────────────────────
  const handleFrenchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFrenchLoading(true);
    setFrenchError('');
    try {
      const res = await api.post<AuthResponse>('/auth/login', { 
        email: frenchEmail, 
        password: frenchPassword 
      });
      
      // Stockage direct dans localStorage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('nom', res.data.nom);
      localStorage.setItem('portail', 'FR');
      
      // Appel du contexte
      login(res.data.token, res.data.role, res.data.nom, 'FR');
      
      // Redirection forcée
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 100);
      
    } catch (err: any) {
      console.error('Erreur connexion FR:', err);
      setFrenchError('Email ou mot de passe incorrect');
    } finally {
      setFrenchLoading(false);
    }
  };

  // ── Formulaire ARABE (SOLUTION RADICALE) ──────────────────────────
  const handleArabicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setArabicLoading(true);
    setArabicError('');
    
    try {
      const res = await api.post<AuthResponse>('/auth/login', { 
        email: arabicEmail, 
        password: arabicPassword 
      });
      
      console.log('=== CONNEXION ARABE ===');
      console.log('Réponse reçue:', { role: res.data.role, nom: res.data.nom });
      
      // 🔥 SOLUTION RADICALE: On ne passe PAS par le contexte pour le portail
      // On vide et on stocke TOUT directement dans localStorage
      localStorage.clear();
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('nom', res.data.nom);
      localStorage.setItem('portail', 'AR');
      
      // Vérification immédiate du stockage
      const verifyToken = localStorage.getItem('token');
      const verifyPortail = localStorage.getItem('portail');
      console.log('Token stocké:', !!verifyToken);
      console.log('Portail stocké dans localStorage:', verifyPortail);
      
      if (verifyPortail !== 'AR') {
        console.error('Échec du stockage du portail, tentative de correction...');
        localStorage.setItem('portail', 'AR');
      }
      
      // Redirection selon le rôle avec window.location (force le rechargement)
      console.log('Redirection vers:', res.data.role === 'ADMIN' ? '/ar/dashboard' : '/ar/seance');
      
      setTimeout(() => {
        if (res.data.role === 'ADMIN') {
          window.location.href = '/ar/dashboard';
        } else {
          window.location.href = '/ar/seance';
        }
      }, 100);
      
    } catch (err: any) {
      console.error('Erreur détaillée:', err);
      setArabicError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      setArabicLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', width: '100vw', background: 'linear-gradient(135deg, #0A6E3F 0%, #0f9d58 100%)', padding: '20px' }}>
      <div className="container-fluid">
        <div className="row g-0">
          {/* French Side - Left */}
          <div className="col-12 col-md-6">
            <div className="h-100 d-flex flex-column justify-content-center align-items-center p-5" style={{ background: '#ffffff', minHeight: '100vh' }}>
              {/* Logo */}
              <div className="text-center mb-5">
                <div style={{ width: 100, height: 100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 24, background: 'linear-gradient(135deg, #e9f7ee 0%, #d4edda 100%)', boxShadow: '0 8px 32px rgba(10, 110, 63, 0.15)' }}>
                  {logoError ? (
                    <GraduationCap size={50} style={{ color: '#0A6E3F' }} />
                  ) : (
                    <img
                      src={logo}
                      alt="Al-Manard3s"
                      style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 24 }}
                      onError={() => setLogoError(true)}
                    />
                  )}
                </div>
                <h2 className="mt-4 mb-2" style={{ color: '#0A6E3F', fontWeight: 700, fontSize: 28 }}>Al-Manard3s</h2>
                <p className="text-muted mb-0" style={{ fontSize: 14 }}>Système de Gestion Scolaire</p>
              </div>

              {/* French Form */}
              <div style={{ width: '100%', maxWidth: 400 }}>
                <div className="text-center mb-4">
                  <h3 className="fw-bold mb-2" style={{ color: '#111827', fontSize: 22 }}>Connexion</h3>
                  <p className="text-muted" style={{ fontSize: 14 }}>Accès administratif, financier et inscriptions</p>
                </div>

                {frenchError && (
                  <div className="alert alert-danger" role="alert" style={{ borderRadius: 12, border: 'none', fontSize: 13 }}>
                    {frenchError}
                  </div>
                )}

                <form onSubmit={handleFrenchSubmit}>
                  <div className="mb-3">
                    <label htmlFor="french-email" className="form-label fw-semibold" style={{ fontSize: 13, color: '#374151' }}>
                      Adresse email
                    </label>
                    <div className="input-group">
                      <span className="input-group-text" style={{ borderRight: 'none', borderRadius: '12px 0 0 12px', backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
                        <Mail size={18} style={{ color: '#6b7280' }} />
                      </span>
                      <input
                        id="french-email"
                        type="email"
                        value={frenchEmail}
                        onChange={(e) => setFrenchEmail(e.target.value)}
                        className="form-control"
                        placeholder="user@almanard3s.com"
                        style={{ borderLeft: 'none', borderRadius: '0 12px 12px 0', backgroundColor: '#f9fafb', borderColor: '#e5e7eb', fontSize: 14, padding: '0.75rem 1rem' }}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="french-password" className="form-label fw-semibold" style={{ fontSize: 13, color: '#374151' }}>
                      Mot de passe
                    </label>
                    <div className="input-group">
                      <span className="input-group-text" style={{ borderRight: 'none', borderRadius: '12px 0 0 12px', backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
                        <Lock size={18} style={{ color: '#6b7280' }} />
                      </span>
                      <input
                        id="french-password"
                        type="password"
                        value={frenchPassword}
                        onChange={(e) => setFrenchPassword(e.target.value)}
                        className="form-control"
                        placeholder="••••••••"
                        style={{ borderLeft: 'none', borderRadius: '0 12px 12px 0', backgroundColor: '#f9fafb', borderColor: '#e5e7eb', fontSize: 14, padding: '0.75rem 1rem' }}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-lg w-100 fw-semibold"
                    style={{ backgroundColor: '#0A6E3F', borderColor: '#0A6E3F', color: '#fff', borderRadius: 12, fontSize: 14, padding: '0.875rem' }}
                    disabled={frenchLoading}
                  >
                    {frenchLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" style={{ width: 16, height: 16, borderWidth: 2 }} />
                        Connexion...
                      </>
                    ) : (
                      'Se connecter'
                    )}
                  </button>
                </form>

                <div className="text-center mt-4">
                  <small className="text-muted" style={{ fontSize: 12 }}>© 2026 Al-Manard3s — Tous droits réservés</small>
                </div>
              </div>
            </div>
          </div>

          {/* Arabic Side - Right */}
          <div className="col-12 col-md-6">
            <div className="h-100 d-flex flex-column justify-content-center align-items-center p-5" style={{ background: '#f8fafc', minHeight: '100vh' }} dir="rtl">
              {/* Logo */}
              <div className="text-center mb-5">
                <div style={{ width: 100, height: 100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 24, background: 'linear-gradient(135deg, #e9f7ee 0%, #d4edda 100%)', boxShadow: '0 8px 32px rgba(10, 110, 63, 0.15)' }}>
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
                <h2 className="mt-4 mb-2" style={{ color: '#0A6E3F', fontWeight: 700, fontSize: 28 }}>المنارد الثالثة</h2>
                <p className="text-muted mb-0" style={{ fontSize: 14 }}>نظام إدارة المدرسة</p>
              </div>

              {/* Arabic Form */}
              <div style={{ width: '100%', maxWidth: 400 }}>
                <div className="text-center mb-4">
                  <h3 className="fw-bold mb-2" style={{ color: '#111827', fontSize: 22 }}>تسجيل الدخول</h3>
                  <p className="text-muted" style={{ fontSize: 14 }}>الوصول إلى وحدة تلاوة القرآن</p>
                </div>

                {arabicError && (
                  <div className="alert alert-danger" role="alert" style={{ borderRadius: 12, border: 'none', fontSize: 13 }}>
                    {arabicError}
                  </div>
                )}

                <form onSubmit={handleArabicSubmit}>
                  <div className="mb-3">
                    <label htmlFor="arabic-email" className="form-label fw-semibold" style={{ fontSize: 13, color: '#374151' }}>
                      البريد الإلكتروني
                    </label>
                    <div className="input-group">
                      <span className="input-group-text" style={{ borderLeft: 'none', borderRadius: '0 12px 12px 0', backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
                        <Mail size={18} style={{ color: '#6b7280' }} />
                      </span>
                      <input
                        id="arabic-email"
                        type="email"
                        value={arabicEmail}
                        onChange={(e) => setArabicEmail(e.target.value)}
                        className="form-control"
                        placeholder="user@almanard3s.com"
                        style={{ borderRight: 'none', borderRadius: '12px 0 0 12px', backgroundColor: '#f9fafb', borderColor: '#e5e7eb', fontSize: 14, padding: '0.75rem 1rem' }}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="arabic-password" className="form-label fw-semibold" style={{ fontSize: 13, color: '#374151' }}>
                      كلمة المرور
                    </label>
                    <div className="input-group">
                      <span className="input-group-text" style={{ borderLeft: 'none', borderRadius: '0 12px 12px 0', backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
                        <Lock size={18} style={{ color: '#6b7280' }} />
                      </span>
                      <input
                        id="arabic-password"
                        type="password"
                        value={arabicPassword}
                        onChange={(e) => setArabicPassword(e.target.value)}
                        className="form-control"
                        placeholder="••••••••"
                        style={{ borderRight: 'none', borderRadius: '12px 0 0 12px', backgroundColor: '#f9fafb', borderColor: '#e5e7eb', fontSize: 14, padding: '0.75rem 1rem' }}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-lg w-100 fw-semibold"
                    style={{ backgroundColor: '#0A6E3F', borderColor: '#0A6E3F', color: '#fff', borderRadius: 12, fontSize: 14, padding: '0.875rem' }}
                    disabled={arabicLoading}
                  >
                    {arabicLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" style={{ width: 16, height: 16, borderWidth: 2 }} />
                        جاري تسجيل الدخول...
                      </>
                    ) : (
                      'تسجيل الدخول'
                    )}
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