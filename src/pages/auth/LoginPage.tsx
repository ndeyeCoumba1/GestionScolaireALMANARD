import { useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import api from '../../api/axios';
import type { AuthResponse } from '../../Types/index';
import { Mail, Lock, Eye, EyeOff, GraduationCap, Users, ShieldCheck } from 'lucide-react';
import logo from '../../../Logo.jpeg';
import schoolPhoto from '../../../1-CQM37jlT.jpeg';

export default function LoginPage() {
  const { login } = useAuth();

  const [frenchEmail, setFrenchEmail]       = useState('');
  const [frenchPassword, setFrenchPassword] = useState('');
  const [frenchError, setFrenchError]       = useState('');
  const [frenchLoading, setFrenchLoading]   = useState(false);
  const [showFrPwd, setShowFrPwd]           = useState(false);

  const [arabicEmail, setArabicEmail]       = useState('');
  const [arabicPassword, setArabicPassword] = useState('');
  const [arabicError, setArabicError]       = useState('');
  const [arabicLoading, setArabicLoading]   = useState(false);
  const [showArPwd, setShowArPwd]           = useState(false);

  const [logoError, setLogoError] = useState(false);

  const handleFrenchSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setFrenchLoading(true);
    setFrenchError('');
    try {
      const res = await api.post<AuthResponse>('/auth/login', { email: frenchEmail, password: frenchPassword });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('nom', res.data.nom);
      localStorage.setItem('portail', 'FR');
      login(res.data.token, res.data.role, res.data.nom, 'FR');
      setTimeout(() => { window.location.href = '/dashboard'; }, 100);
    } catch {
      setFrenchError('Email ou mot de passe incorrect');
    } finally {
      setFrenchLoading(false);
    }
  };

  const handleArabicSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setArabicLoading(true);
    setArabicError('');
    try {
      const res = await api.post<AuthResponse>('/auth/login', { email: arabicEmail, password: arabicPassword });
      localStorage.clear();
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('nom', res.data.nom);
      localStorage.setItem('portail', 'AR');
      if (localStorage.getItem('portail') !== 'AR') localStorage.setItem('portail', 'AR');
      setTimeout(() => {
        window.location.href = res.data.role === 'ADMIN' ? '/ar/dashboard' : '/ar/seance';
      }, 100);
    } catch {
      setArabicError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      setArabicLoading(false);
    }
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lp-root {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          background: #edf2f7;
          overflow: hidden;
        }

        /* ══════════════════════════════════
           HERO PANEL
        ══════════════════════════════════ */
        .lp-hero {
          flex: 0 0 47%;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          box-shadow: 6px 0 40px rgba(0,0,0,0.18);
          z-index: 2;
        }
        .lp-hero-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 15%;
          transform: scale(1.04);
        }
        .lp-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(2, 28, 15, 0.75) 0%,
            rgba(5, 65, 35, 0.55) 30%,
            rgba(5, 65, 35, 0.60) 65%,
            rgba(2, 28, 15, 0.90) 100%
          );
        }
        /* subtle vignette */
        .lp-hero-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.35) 100%);
        }

        .lp-hero-content {
          position: relative;
          z-index: 3;
          text-align: center;
          padding: 48px 36px;
          color: #fff;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* double ring logo */
        .lp-logo-outer {
          width: 148px;
          height: 148px;
          border-radius: 50%;
          border: 2px solid rgba(255, 210, 80, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 28px;
          flex-shrink: 0;
          position: relative;
        }
        .lp-logo-outer::before {
          content: '';
          position: absolute;
          inset: 7px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.2);
        }
        .lp-logo-inner {
          width: 118px;
          height: 118px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid rgba(255,255,255,0.85);
          box-shadow: 0 0 0 4px rgba(255,210,80,0.2), 0 16px 48px rgba(0,0,0,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.1);
        }
        .lp-logo-inner img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .lp-hero-name-ar {
          font-size: 20px;
          font-family: 'Georgia', serif;
          font-weight: 700;
          margin-bottom: 6px;
          direction: rtl;
          line-height: 1.55;
          text-shadow: 0 2px 12px rgba(0,0,0,0.6);
          color: #fff;
        }
        .lp-hero-sep {
          width: 48px;
          height: 2px;
          border-radius: 2px;
          background: linear-gradient(to right, transparent, rgba(255,210,80,0.8), transparent);
          margin: 14px auto;
        }
        .lp-hero-name-fr {
          font-size: 11px;
          font-weight: 700;
          color: rgba(255,255,255,0.72);
          text-transform: uppercase;
          letter-spacing: 2.5px;
          text-shadow: 0 1px 6px rgba(0,0,0,0.4);
        }

        /* bottom watermark */
        .lp-hero-bottom {
          position: absolute;
          bottom: 0;
          left: 0; right: 0;
          z-index: 3;
          padding: 20px 24px;
          background: linear-gradient(to top, rgba(2,28,15,0.85) 0%, transparent 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }
        .lp-hero-bottom-dot {
          width: 4px; height: 4px;
          border-radius: 50%;
          background: rgba(255,210,80,0.6);
        }
        .lp-hero-bottom-text {
          font-size: 11px;
          color: rgba(255,255,255,0.45);
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        /* pillars */
        .lp-pillars {
          display: flex;
          gap: 10px;
          margin-top: 36px;
          width: 100%;
        }
        .lp-pillar {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 18px 10px 16px;
          text-align: center;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 16px;
          backdrop-filter: blur(12px);
          transition: background 0.2s;
        }
        .lp-pillar:hover {
          background: rgba(255,255,255,0.12);
        }
        .lp-pillar-icon {
          width: 44px; height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 100%);
          border: 1px solid rgba(255,255,255,0.22);
          display: flex; align-items: center; justify-content: center;
          color: #fff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          flex-shrink: 0;
        }
        .lp-pillar-label {
          font-size: 12px;
          font-weight: 700;
          color: #fff;
          line-height: 1.2;
          letter-spacing: 0.1px;
        }
        .lp-pillar-sub {
          font-size: 10.5px;
          color: rgba(255,255,255,0.5);
          line-height: 1.2;
          margin-top: -4px;
        }

        /* ══════════════════════════════════
           FORMS PANEL
        ══════════════════════════════════ */
        .lp-forms-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 28px;
          overflow-y: auto;
          position: relative;
        }
        .lp-forms-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 15%;
          filter: blur(18px) saturate(0.6);
          transform: scale(1.08);
        }
        .lp-forms-overlay {
          position: absolute;
          inset: 0;
          background: rgba(237, 242, 247, 0.88);
        }
        .lp-forms-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }

        /* top tag */
        .lp-sys-tag {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 28px;
        }
        .lp-sys-tag-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(to right, transparent, #cbd5e0);
          width: 40px;
        }
        .lp-sys-tag-line-r {
          background: linear-gradient(to left, transparent, #cbd5e0);
        }
        .lp-sys-tag-text {
          font-size: 11px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 2px;
          white-space: nowrap;
        }

        /* cards row */
        .lp-cards-row {
          display: flex;
          gap: 16px;
          width: 100%;
          max-width: 680px;
        }

        /* individual card */
        .lp-card {
          flex: 1;
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.08);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        /* colored top accent */
        .lp-card-accent {
          height: 4px;
          background: linear-gradient(90deg, #0A6E3F 0%, #22c55e 100%);
          flex-shrink: 0;
        }
        .lp-card-accent-ar {
          background: linear-gradient(90deg, #22c55e 0%, #0A6E3F 100%);
        }
        .lp-card-body {
          flex: 1;
          padding: 28px 28px 24px;
          display: flex;
          flex-direction: column;
        }

        /* portal badge */
        .lp-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 99px;
          font-size: 10.5px;
          font-weight: 700;
          background: #f0fdf4;
          color: #166534;
          border: 1px solid #bbf7d0;
          margin-bottom: 16px;
          width: fit-content;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .lp-card-title {
          font-size: 22px;
          font-weight: 800;
          color: #111827;
          margin-bottom: 4px;
          letter-spacing: -0.4px;
        }
        .lp-card-sub {
          font-size: 12px;
          color: #94a3b8;
          margin-bottom: 24px;
          line-height: 1.5;
        }

        /* form fields */
        .lp-label {
          font-size: 12px;
          font-weight: 600;
          color: #4b5563;
          margin-bottom: 6px;
          display: block;
        }
        .lp-field {
          position: relative;
          margin-bottom: 16px;
        }
        .lp-icon {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          color: #c4cdd8;
          display: flex;
          align-items: center;
          pointer-events: none;
          z-index: 1;
        }
        .lp-icon-l { left: 13px; }
        .lp-icon-r { right: 13px; }
        .lp-input {
          width: 100%;
          padding: 11px 42px;
          border: 1.5px solid #e5e9f0;
          border-radius: 10px;
          background: #f8fafc;
          font-size: 13.5px;
          color: #111827;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
        }
        .lp-input:focus {
          border-color: #0A6E3F;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(10,110,63,0.12);
        }
        .lp-input::placeholder { color: #cbd5e0; font-size: 13px; }
        .lp-eye {
          position: absolute;
          top: 50%; transform: translateY(-50%);
          background: none; border: none; padding: 4px;
          color: #c4cdd8; cursor: pointer;
          display: flex; align-items: center;
          transition: color 0.15s;
          z-index: 1;
        }
        .lp-eye:hover { color: #0A6E3F; }
        .lp-eye-r { right: 11px; }
        .lp-eye-l { left: 11px; }

        .lp-btn {
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg, #0A6E3F 0%, #16a34a 100%);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.12s, box-shadow 0.18s, opacity 0.15s;
          box-shadow: 0 4px 16px rgba(10,110,63,0.35);
          margin-top: 8px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .lp-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 26px rgba(10,110,63,0.42);
        }
        .lp-btn:active:not(:disabled) { transform: translateY(0); }
        .lp-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .lp-error {
          background: #fff5f5;
          border: 1px solid #fed7d7;
          color: #c53030;
          border-radius: 8px;
          padding: 9px 12px;
          font-size: 12px;
          margin-bottom: 16px;
          display: flex; align-items: center; gap: 7px;
          border-left: 3px solid #fc8181;
        }

        .lp-card-footer {
          font-size: 11px;
          color: #cbd5e0;
          text-align: center;
          padding-top: 18px;
          margin-top: auto;
          border-top: 1px solid #f1f5f9;
        }

        /* bottom caption */
        .lp-bottom-caption {
          margin-top: 24px;
          font-size: 11px;
          color: #94a3b8;
          text-align: center;
          letter-spacing: 0.4px;
        }

        /* ══════════════════════════════════
           RESPONSIVE
        ══════════════════════════════════ */
        @media (max-width: 980px) {
          .lp-hero { flex: 0 0 40%; }
          .lp-card-body { padding: 24px 20px 20px; }
        }
        @media (max-width: 720px) {
          .lp-root { flex-direction: column; }
          .lp-hero {
            flex: none; min-height: 260px; width: 100%;
            box-shadow: 0 6px 32px rgba(0,0,0,0.2);
          }
          .lp-hero-content { padding: 28px 20px; }
          .lp-logo-outer { width: 100px; height: 100px; margin-bottom: 16px; }
          .lp-logo-inner { width: 80px; height: 80px; }
          .lp-hero-name-ar { font-size: 16px; }
          .lp-hero-bottom { padding: 12px 16px; }
          .lp-forms-panel { padding: 28px 16px; }
          .lp-cards-row { flex-direction: column; gap: 12px; max-width: 400px; }
        }
      `}</style>

      <div className="lp-root">

        {/* ══ HERO PANEL ══ */}
        <div className="lp-hero">
          <img src={schoolPhoto} alt="" className="lp-hero-bg" />
          <div className="lp-hero-overlay" />
          <div className="lp-hero-vignette" />

          <div className="lp-hero-content">
            <div className="lp-logo-outer">
              <div className="lp-logo-inner">
                {logoError
                  ? <span style={{ fontSize: 48, lineHeight: 1 }}>🕌</span>
                  : <img src={logo} alt="logo Daroul Manar" onError={() => setLogoError(true)} />
                }
              </div>
            </div>
            <p className="lp-hero-name-ar">مؤسسة دار المنار للتربية والتعليم</p>
            <div className="lp-hero-sep" />
            <p className="lp-hero-name-fr">Fondation Daroul Manar D3S</p>

            <div className="lp-pillars">
              <div className="lp-pillar">
                <div className="lp-pillar-icon"><GraduationCap size={18} /></div>
                <span className="lp-pillar-label">Éducation</span>
                <span className="lp-pillar-sub">de qualité</span>
              </div>
              <div className="lp-pillar">
                <div className="lp-pillar-icon"><Users size={18} /></div>
                <span className="lp-pillar-label">Encadrement</span>
                <span className="lp-pillar-sub">professionnel</span>
              </div>
              <div className="lp-pillar">
                <div className="lp-pillar-icon"><ShieldCheck size={18} /></div>
                <span className="lp-pillar-label">Valeurs</span>
                <span className="lp-pillar-sub">et éthique</span>
              </div>
            </div>
          </div>

          <div className="lp-hero-bottom">
            <div className="lp-hero-bottom-dot" />
            <span className="lp-hero-bottom-text">Groupe Scolaire D3S</span>
            <div className="lp-hero-bottom-dot" />
            <span className="lp-hero-bottom-text">Tivaoune</span>
            <div className="lp-hero-bottom-dot" />
          </div>
        </div>

        {/* ══ FORMS PANEL ══ */}
        <div className="lp-forms-panel">
          <img src={schoolPhoto} alt="" className="lp-forms-bg" />
          <div className="lp-forms-overlay" />

          <div className="lp-forms-content">
          <div className="lp-sys-tag">
            <div className="lp-sys-tag-line" />
            <span className="lp-sys-tag-text">Système de Gestion Scolaire</span>
            <div className="lp-sys-tag-line lp-sys-tag-line-r" />
          </div>

          <div className="lp-cards-row">

            {/* ── PORTAIL FRANÇAIS ── */}
            <div className="lp-card">
              <div className="lp-card-accent" />
              <div className="lp-card-body">
                <span className="lp-badge">🎓 Portail Français</span>
                <h2 className="lp-card-title">Connexion</h2>
                <p className="lp-card-sub">Accès administratif, financier et inscriptions</p>

                {frenchError && (
                  <div className="lp-error"><span>⚠️</span> {frenchError}</div>
                )}

                <form onSubmit={handleFrenchSubmit}>
                  <label className="lp-label" htmlFor="fr-email">Adresse email</label>
                  <div className="lp-field">
                    <span className="lp-icon lp-icon-l"><Mail size={15} /></span>
                    <input id="fr-email" type="email" className="lp-input"
                      placeholder="user@almanard3s.com"
                      value={frenchEmail} onChange={e => setFrenchEmail(e.target.value)} required />
                  </div>

                  <label className="lp-label" htmlFor="fr-password">Mot de passe</label>
                  <div className="lp-field">
                    <span className="lp-icon lp-icon-l"><Lock size={15} /></span>
                    <input id="fr-password" type={showFrPwd ? 'text' : 'password'} className="lp-input"
                      placeholder="••••••••"
                      value={frenchPassword} onChange={e => setFrenchPassword(e.target.value)} required />
                    <button type="button" className="lp-eye lp-eye-r" onClick={() => setShowFrPwd(v => !v)}>
                      {showFrPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  <button type="submit" className="lp-btn" disabled={frenchLoading}>
                    {frenchLoading
                      ? <><span className="spinner-border spinner-border-sm" style={{ width: 15, height: 15, borderWidth: 2 }} /> Connexion...</>
                      : 'Se connecter'}
                  </button>
                </form>

                <p className="lp-card-footer">© 2026 Al-Manard3s</p>
              </div>
            </div>

            {/* ── PORTAIL ARABE ── */}
            <div className="lp-card" dir="rtl">
              <div className="lp-card-accent lp-card-accent-ar" />
              <div className="lp-card-body">
                <span className="lp-badge">📖 الوحدة القرآنية</span>
                <h2 className="lp-card-title">تسجيل الدخول</h2>
                <p className="lp-card-sub">وحدة تلاوة وحفظ القرآن الكريم</p>

                {arabicError && (
                  <div className="lp-error" dir="rtl"><span>⚠️</span> {arabicError}</div>
                )}

                <form onSubmit={handleArabicSubmit}>
                  <label className="lp-label" htmlFor="ar-email">البريد الإلكتروني</label>
                  <div className="lp-field">
                    <span className="lp-icon lp-icon-r"><Mail size={15} /></span>
                    <input id="ar-email" type="email" className="lp-input"
                      placeholder="user@almanard3s.com"
                      value={arabicEmail} onChange={e => setArabicEmail(e.target.value)}
                      style={{ direction: 'ltr', textAlign: 'left' }} required />
                  </div>

                  <label className="lp-label" htmlFor="ar-password">كلمة المرور</label>
                  <div className="lp-field">
                    <span className="lp-icon lp-icon-r"><Lock size={15} /></span>
                    <input id="ar-password" type={showArPwd ? 'text' : 'password'} className="lp-input"
                      placeholder="••••••••"
                      value={arabicPassword} onChange={e => setArabicPassword(e.target.value)} required />
                    <button type="button" className="lp-eye lp-eye-l" onClick={() => setShowArPwd(v => !v)}>
                      {showArPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  <button type="submit" className="lp-btn" disabled={arabicLoading}>
                    {arabicLoading
                      ? <><span className="spinner-border spinner-border-sm" style={{ width: 15, height: 15, borderWidth: 2 }} /> جاري تسجيل الدخول...</>
                      : 'تسجيل الدخول'}
                  </button>
                </form>

                <p className="lp-card-footer" dir="ltr">جميع الحقوق محفوظة 2026 ©</p>
              </div>
            </div>

          </div>

          <p className="lp-bottom-caption">نظام إدارة المدرسة — Al-Manard3s Management System</p>
          </div>
        </div>

      </div>
    </>
  );
}
