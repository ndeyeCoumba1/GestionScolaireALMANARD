import { useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import api from '../../api/axios';
import type { AuthResponse } from '../../Types/index';
import { Mail, Lock, Eye, EyeOff, GraduationCap, Users, ShieldCheck } from 'lucide-react';
import logo from '../../../Logo.jpeg';
import schoolPhoto from '../../../1-CQM37jlT.jpeg';

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    <path fill="none" d="M0 0h48v48H0z"/>
  </svg>
);

export default function LoginPage() {
  const { login } = useAuth();

  const [frenchEmail, setFrenchEmail]       = useState('');
  const [frenchPassword, setFrenchPassword] = useState('');
  const [frenchError, setFrenchError]       = useState('');
  const [frenchLoading, setFrenchLoading]   = useState(false);
  const [showFrPwd, setShowFrPwd]           = useState(false);
  const [rememberFr, setRememberFr]         = useState(false);

  const [arabicEmail, setArabicEmail]       = useState('');
  const [arabicPassword, setArabicPassword] = useState('');
  const [arabicError, setArabicError]       = useState('');
  const [arabicLoading, setArabicLoading]   = useState(false);
  const [showArPwd, setShowArPwd]           = useState(false);
  const [rememberAr, setRememberAr]         = useState(false);

  const [logoError, setLogoError] = useState(false);

  const handleFrenchSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setFrenchLoading(true); setFrenchError('');
    try {
      const res = await api.post<AuthResponse>('/auth/login', { email: frenchEmail, password: frenchPassword });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('nom', res.data.nom);
      localStorage.setItem('portail', 'FR');
      login(res.data.token, res.data.role, res.data.nom, 'FR');
      setTimeout(() => { window.location.href = '/dashboard'; }, 100);
    } catch { setFrenchError('Email ou mot de passe incorrect'); }
    finally { setFrenchLoading(false); }
  };

  const handleArabicSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setArabicLoading(true); setArabicError('');
    try {
      const res = await api.post<AuthResponse>('/auth/login', { email: arabicEmail, password: arabicPassword });
      localStorage.clear();
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('nom', res.data.nom);
      localStorage.setItem('portail', 'AR');
      setTimeout(() => { window.location.href = (res.data.role === 'ADMIN' || res.data.role === 'RECITATEUR') ? '/ar/dashboard' : '/ar/seance'; }, 100);
    } catch { setArabicError('البريد الإلكتروني أو كلمة المرور غير صحيحة'); setArabicLoading(false); }
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lp-root {
          width: 100vw; height: 100vh;
          display: flex; overflow: hidden;
          background: linear-gradient(135deg, #0a1a10 0%, #134e2a 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        /* ════════════ HERO ════════════ */
        .lp-hero {
          flex: 0 0 44%;
          position: relative; overflow: hidden;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          height: 100vh;
          border-radius: 0 40px 40px 0;
          box-shadow: 8px 0 48px rgba(0,0,0,0.25);
          z-index: 2;
        }
        .lp-hero-bg {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover; object-position: center 15%;
          transform: scale(1.06);
        }
        .lp-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(180deg,
            rgba(2,28,15,0.80) 0%,
            rgba(4,58,30,0.50) 28%,
            rgba(4,58,30,0.55) 65%,
            rgba(2,20,10,0.92) 100%);
        }
        .lp-hero-vignette {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,0.38) 100%);
        }
        .lp-hero-content {
          position: relative; z-index: 3;
          text-align: center; padding: 32px 28px 20px;
          color: #fff; display: flex; flex-direction: column; align-items: center;
          width: 100%;
        }

        .lp-logo-outer {
          width: 130px; height: 130px; border-radius: 50%;
          border: 2px solid rgba(212,175,55,0.5);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 18px; position: relative; flex-shrink: 0;
        }
        .lp-logo-outer::before {
          content: ''; position: absolute; inset: 7px;
          border-radius: 50%; border: 1px solid rgba(255,255,255,0.2);
        }
        .lp-logo-inner {
          width: 104px; height: 104px; border-radius: 50%; overflow: hidden;
          border: 3px solid rgba(255,255,255,0.88);
          box-shadow: 0 0 0 4px rgba(212,175,55,0.22), 0 12px 36px rgba(0,0,0,0.45);
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.1);
        }
        .lp-logo-inner img { width: 100%; height: 100%; object-fit: cover; }

        .lp-hero-name-ar {
          font-size: 17px; font-family: 'Georgia', serif; font-weight: 700;
          direction: rtl; line-height: 1.6;
          text-shadow: 0 2px 12px rgba(0,0,0,0.6); color: #fff; margin-bottom: 4px;
        }
        .lp-hero-sep {
          width: 44px; height: 2px; border-radius: 2px;
          background: linear-gradient(to right, transparent, rgba(212,175,55,0.9), transparent);
          margin: 8px auto 6px;
        }
        .lp-hero-subtitle {
          font-size: 9.5px; font-weight: 700; letter-spacing: 2px;
          color: #d4af37; text-transform: uppercase;
          text-shadow: 0 1px 6px rgba(0,0,0,0.4); margin-bottom: 3px;
        }
        .lp-hero-name-fr {
          font-size: 10px; font-weight: 700;
          color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 2px;
        }

        .lp-pillars { display: flex; gap: 8px; margin-top: 24px; width: 100%; }
        .lp-pillar {
          flex: 1; display: flex; flex-direction: column; align-items: center;
          gap: 6px; padding: 12px 6px 10px; text-align: center;
          background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.14);
          border-radius: 14px; backdrop-filter: blur(12px); transition: background 0.2s;
        }
        .lp-pillar:hover { background: rgba(255,255,255,0.12); }
        .lp-pillar-icon {
          width: 38px; height: 38px; border-radius: 10px;
          background: linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 100%);
          border: 1px solid rgba(255,255,255,0.22);
          display: flex; align-items: center; justify-content: center; color: #d4af37;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15); flex-shrink: 0;
        }
        .lp-pillar-label { font-size: 11px; font-weight: 700; color: #fff; line-height: 1.2; }
        .lp-pillar-sub { font-size: 9.5px; color: rgba(255,255,255,0.5); line-height: 1.2; }

        .lp-hero-bottom {
          position: absolute; bottom: 0; left: 0; right: 0; z-index: 3;
          padding: 12px 16px;
          background: linear-gradient(to top, rgba(2,18,10,0.88) 0%, transparent 100%);
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .lp-loc-badge {
          display: flex; align-items: center; gap: 5px;
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
          border-radius: 20px; padding: 5px 12px;
          font-size: 9.5px; font-weight: 700;
          color: rgba(255,255,255,0.8); letter-spacing: 0.8px; text-transform: uppercase;
          backdrop-filter: blur(8px);
        }
        .lp-loc-badge svg { color: #d4af37; }
        .lp-loc-sep { width: 4px; height: 4px; border-radius: 50%; background: rgba(212,175,55,0.5); }

        /* ════════════ FORMS PANEL ════════════ */
        .lp-forms-panel {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 20px 20px; height: 100vh; overflow: hidden;
          background: transparent;
        }
        .lp-forms-content {
          display: flex; flex-direction: column; align-items: center;
          width: 100%; max-width: 720px;
        }

        /* System tag */
        .lp-sys-tag {
          display: flex; align-items: center; gap: 10px; margin-bottom: 16px; width: 100%;
        }
        .lp-sys-tag-icon {
          width: 32px; height: 32px; border-radius: 8px;
          background: linear-gradient(135deg, #d4af37, #a07c10);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(160,124,16,0.3); color: #fff; flex-shrink: 0;
        }
        .lp-sys-tag-line { flex: 1; height: 1px; background: linear-gradient(to right, transparent, rgba(255,255,255,0.2)); }
        .lp-sys-tag-line-r { background: linear-gradient(to left, transparent, rgba(255,255,255,0.2)); }
        .lp-sys-tag-text {
          font-size: 9.5px; font-weight: 800; color: rgba(255,255,255,0.7);
          text-transform: uppercase; letter-spacing: 2.5px; white-space: nowrap;
        }

        /* Cards */
        .lp-cards-row { display: flex; gap: 14px; width: 100%; }
        .lp-card {
          flex: 1; background: #fff; border-radius: 18px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05), 0 8px 28px rgba(0,0,0,0.08);
          overflow: hidden; display: flex; flex-direction: column; min-width: 0;
          border: 1px solid #edf0f5;
        }
        .lp-card-accent { height: 4px; background: linear-gradient(90deg, #0A6E3F, #22c55e); flex-shrink: 0; }
        .lp-card-accent-ar { background: linear-gradient(90deg, #22c55e, #0A6E3F); }
        .lp-card-body { flex: 1; padding: 18px 20px 14px; display: flex; flex-direction: column; }

        .lp-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 12px; border-radius: 99px;
          font-size: 9.5px; font-weight: 800;
          background: #f0fdf4; color: #166534; border: 1.5px solid #bbf7d0;
          margin-bottom: 10px; width: fit-content;
          letter-spacing: 0.8px; text-transform: uppercase;
        }
        .lp-card-title { font-size: 20px; font-weight: 800; color: #111827; letter-spacing: -0.4px; margin-bottom: 3px; }
        .lp-title-underline {
          width: 32px; height: 3px; border-radius: 3px;
          background: linear-gradient(90deg, #0A6E3F, #22c55e); margin-bottom: 5px;
        }
        .lp-card-sub { font-size: 11px; color: #94a3b8; margin-bottom: 14px; line-height: 1.4; }

        .lp-label { font-size: 11.5px; font-weight: 600; color: #4b5563; margin-bottom: 4px; display: block; }
        .lp-field { position: relative; margin-bottom: 10px; }
        .lp-icon {
          position: absolute; top: 50%; transform: translateY(-50%);
          color: #c4cdd8; display: flex; align-items: center; pointer-events: none; z-index: 1;
        }
        .lp-icon-l { left: 12px; }
        .lp-icon-r { right: 12px; }
        .lp-input {
          width: 100%; padding: 9px 38px;
          border: 1.5px solid #e5e9f0; border-radius: 9px;
          background: #f8fafc; font-size: 13px; color: #111827;
          outline: none; transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
        }
        .lp-input:focus { border-color: #0A6E3F; background: #fff; box-shadow: 0 0 0 3px rgba(10,110,63,0.1); }
        .lp-input::placeholder { color: #cbd5e0; font-size: 12.5px; }
        .lp-eye {
          position: absolute; top: 50%; transform: translateY(-50%);
          background: none; border: none; padding: 4px; color: #c4cdd8;
          cursor: pointer; display: flex; align-items: center; transition: color 0.15s; z-index: 1;
        }
        .lp-eye:hover { color: #0A6E3F; }
        .lp-eye-r { right: 10px; } .lp-eye-l { left: 10px; }

        .lp-remember-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .lp-remember { display: flex; align-items: center; gap: 6px; font-size: 11.5px; color: #6b7280; cursor: pointer; user-select: none; }
        .lp-remember input[type=checkbox] { width: 14px; height: 14px; accent-color: #0A6E3F; cursor: pointer; }
        .lp-forgot { font-size: 11.5px; font-weight: 600; color: #0A6E3F; text-decoration: none; transition: opacity 0.15s; }
        .lp-forgot:hover { opacity: 0.7; }

        @keyframes btn-shine {
          0%   { left: -110%; }
          60%, 100% { left: 130%; }
        }
        .lp-btn {
          width: 100%; padding: 11px;
          background: linear-gradient(135deg, #0A6E3F 0%, #16a34a 100%);
          color: #fff; border: none; border-radius: 9px;
          font-size: 13.5px; font-weight: 700; cursor: pointer;
          transition: transform 0.12s, box-shadow 0.18s, opacity 0.15s;
          box-shadow: 0 4px 14px rgba(10,110,63,0.35);
          display: flex; align-items: center; justify-content: center; gap: 7px;
          position: relative; overflow: hidden;
        }
        .lp-btn::before {
          content: ''; position: absolute; top: 0; left: -110%;
          width: 65%; height: 100%;
          background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.38) 50%, transparent 100%);
          animation: btn-shine 2.4s ease-in-out infinite; pointer-events: none;
        }
        .lp-btn:disabled::before { animation: none; }
        .lp-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 7px 22px rgba(10,110,63,0.42); }
        .lp-btn:active:not(:disabled) { transform: translateY(0); }
        .lp-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .lp-or { display: flex; align-items: center; gap: 8px; margin: 10px 0; }
        .lp-or-line { flex: 1; height: 1px; background: #e5e9f0; }
        .lp-or-text { font-size: 10.5px; font-weight: 600; color: #cbd5e0; letter-spacing: 1px; }

        .lp-google-btn {
          width: 100%; padding: 9px;
          background: #fff; color: #374151;
          border: 1.5px solid #e5e9f0; border-radius: 9px;
          font-size: 12.5px; font-weight: 600; cursor: pointer;
          transition: border-color 0.15s, box-shadow 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .lp-google-btn:hover { border-color: #4285F4; box-shadow: 0 2px 10px rgba(66,133,244,0.15); }

        .lp-error {
          background: #fff5f5; border: 1px solid #fed7d7; color: #c53030;
          border-radius: 7px; padding: 7px 10px; font-size: 11.5px; margin-bottom: 10px;
          display: flex; align-items: center; gap: 6px; border-left: 3px solid #fc8181;
        }

        .lp-card-footer { font-size: 10.5px; color: #cbd5e0; text-align: center; padding-top: 12px; margin-top: auto; border-top: 1px solid #f1f5f9; }

        /* Security + footer */
        .lp-security {
          display: flex; align-items: center; gap: 12px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 12px;
          padding: 10px 16px; margin-top: 14px;
          width: 100%; backdrop-filter: blur(8px);
        }
        .lp-security-icon {
          width: 34px; height: 34px; border-radius: 9px;
          background: linear-gradient(135deg, #22c55e, #0A6E3F);
          display: flex; align-items: center; justify-content: center;
          color: #fff; flex-shrink: 0; box-shadow: 0 3px 10px rgba(10,110,63,0.4);
        }
        .lp-security-title { font-size: 12px; font-weight: 700; color: #fff; margin-bottom: 1px; }
        .lp-security-sub { font-size: 10.5px; color: rgba(255,255,255,0.55); line-height: 1.3; }

        .lp-bottom-caption { margin-top: 12px; text-align: center; }
        .lp-bottom-caption p { font-size: 10.5px; color: rgba(255,255,255,0.4); margin-bottom: 3px; }
        .lp-bottom-caption a {
          font-size: 10.5px; font-weight: 600; color: #4ade80;
          text-decoration: none; display: inline-flex; align-items: center; gap: 4px;
        }
        .lp-bottom-caption a:hover { text-decoration: underline; }

        @media (max-width: 980px) {
          .lp-hero { flex: 0 0 40%; }
          .lp-card-body { padding: 14px 16px 12px; }
        }
        @media (max-width: 720px) {
          .lp-root { flex-direction: column; height: auto; min-height: 100vh; overflow: auto; }
          .lp-hero { flex: none; height: 260px; width: 100%; border-radius: 0 0 28px 28px; }
          .lp-forms-panel { height: auto; padding: 20px 14px; overflow: visible; }
          .lp-cards-row { flex-direction: column; gap: 10px; }
        }
      `}</style>

      <div className="lp-root">

        {/* ══ HERO ══ */}
        <div className="lp-hero">
          <img src={schoolPhoto} alt="" className="lp-hero-bg" />
          <div className="lp-hero-overlay" />
          <div className="lp-hero-vignette" />

          <div className="lp-hero-content">
            <div className="lp-logo-outer">
              <div className="lp-logo-inner">
                {logoError
                  ? <span style={{ fontSize: 44, lineHeight: 1 }}>🕌</span>
                  : <img src={logo} alt="logo" onError={() => setLogoError(true)} />}
              </div>
            </div>

            <p className="lp-hero-name-ar">مؤسسة دار المنار للتربية والتعليم</p>
            <div className="lp-hero-sep" />
            <p className="lp-hero-subtitle">Éduquer aujourd'hui, construire demain</p>
            <p className="lp-hero-name-fr">Fondation Daroul Manar D3S</p>

            <div className="lp-pillars">
              <div className="lp-pillar">
                <div className="lp-pillar-icon"><GraduationCap size={17} /></div>
                <span className="lp-pillar-label">Éducation</span>
                <span className="lp-pillar-sub">de qualité</span>
              </div>
              <div className="lp-pillar">
                <div className="lp-pillar-icon"><Users size={17} /></div>
                <span className="lp-pillar-label">Encadrement</span>
                <span className="lp-pillar-sub">professionnel</span>
              </div>
              <div className="lp-pillar">
                <div className="lp-pillar-icon"><ShieldCheck size={17} /></div>
                <span className="lp-pillar-label">Valeurs</span>
                <span className="lp-pillar-sub">et éthique</span>
              </div>
            </div>
          </div>

          <div className="lp-hero-bottom">
            <div className="lp-loc-badge">
              <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              Groupe Scolaire D3S
            </div>
            <div className="lp-loc-sep" />
            <div className="lp-loc-badge">
              <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M8 11h2m-2 4h2m4-4h2m-2 4h2M12 3v4"/></svg>
              Tivaouane, Sénégal
            </div>
          </div>
        </div>

        {/* ══ FORMS PANEL ══ */}
        <div className="lp-forms-panel">
          <div className="lp-forms-content">

            <div className="lp-sys-tag">
              <div className="lp-sys-tag-line" />
              <div className="lp-sys-tag-icon"><GraduationCap size={16} /></div>
              <span className="lp-sys-tag-text">Système de Gestion Scolaire</span>
              <div className="lp-sys-tag-line lp-sys-tag-line-r" />
            </div>

            <div className="lp-cards-row">

              {/* ── PORTAIL FRANÇAIS ── */}
              <div className="lp-card">
                <div className="lp-card-accent" />
                <div className="lp-card-body">
                  <span className="lp-badge">🌐 Portail Français</span>
                  <h2 className="lp-card-title">Connexion</h2>
                  <div className="lp-title-underline" />
                  <p className="lp-card-sub">Accès administratif, financier et inscriptions</p>

                  {frenchError && <div className="lp-error"><span>⚠️</span> {frenchError}</div>}

                  <form onSubmit={handleFrenchSubmit}>
                    <label className="lp-label" htmlFor="fr-email">Adresse email</label>
                    <div className="lp-field">
                      <span className="lp-icon lp-icon-l"><Mail size={14} /></span>
                      <input id="fr-email" type="email" className="lp-input" placeholder="user@almanard3s.com"
                        value={frenchEmail} onChange={e => setFrenchEmail(e.target.value)} required />
                    </div>

                    <label className="lp-label" htmlFor="fr-password">Mot de passe</label>
                    <div className="lp-field">
                      <span className="lp-icon lp-icon-l"><Lock size={14} /></span>
                      <input id="fr-password" type={showFrPwd ? 'text' : 'password'} className="lp-input" placeholder="••••••••"
                        value={frenchPassword} onChange={e => setFrenchPassword(e.target.value)} required />
                      <button type="button" className="lp-eye lp-eye-r" onClick={() => setShowFrPwd(v => !v)}>
                        {showFrPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>

                    <div className="lp-remember-row">
                      <label className="lp-remember">
                        <input type="checkbox" checked={rememberFr} onChange={e => setRememberFr(e.target.checked)} />
                        Se souvenir de moi
                      </label>
                      <a href="#" className="lp-forgot">Mot de passe oublié ?</a>
                    </div>

                    <button type="submit" className="lp-btn" disabled={frenchLoading}>
                      {frenchLoading
                        ? <><span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14, borderWidth: 2 }} /> Connexion...</>
                        : <><Lock size={14} /> Se connecter</>}
                    </button>

                    <div className="lp-or">
                      <div className="lp-or-line" /><span className="lp-or-text">OU</span><div className="lp-or-line" />
                    </div>

                    <button type="button" className="lp-google-btn"><GoogleIcon /> Se connecter avec Google</button>
                  </form>

                  <p className="lp-card-footer">© 2026 Al-Manard3s</p>
                </div>
              </div>

              {/* ── PORTAIL ARABE ── */}
              <div className="lp-card" dir="rtl">
                <div className="lp-card-accent lp-card-accent-ar" />
                <div className="lp-card-body">
                  <span className="lp-badge">📖 البوابة العربية</span>
                  <h2 className="lp-card-title">تسجيل الدخول</h2>
                  <div className="lp-title-underline" />
                  <p className="lp-card-sub">وحدة إدارة مالية وحفظ القرآن الكريم</p>

                  {arabicError && <div className="lp-error" dir="rtl"><span>⚠️</span> {arabicError}</div>}

                  <form onSubmit={handleArabicSubmit}>
                    <label className="lp-label" htmlFor="ar-email">البريد الإلكتروني</label>
                    <div className="lp-field">
                      <span className="lp-icon lp-icon-r"><Mail size={14} /></span>
                      <input id="ar-email" type="email" className="lp-input" placeholder="user@almanard3s.com"
                        value={arabicEmail} onChange={e => setArabicEmail(e.target.value)}
                        style={{ direction: 'ltr', textAlign: 'left' }} required />
                    </div>

                    <label className="lp-label" htmlFor="ar-password">كلمة المرور</label>
                    <div className="lp-field">
                      <span className="lp-icon lp-icon-r"><Lock size={14} /></span>
                      <input id="ar-password" type={showArPwd ? 'text' : 'password'} className="lp-input" placeholder="••••••••"
                        value={arabicPassword} onChange={e => setArabicPassword(e.target.value)} required />
                      <button type="button" className="lp-eye lp-eye-l" onClick={() => setShowArPwd(v => !v)}>
                        {showArPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>

                    <div className="lp-remember-row" style={{ flexDirection: 'row-reverse' }}>
                      <label className="lp-remember" style={{ flexDirection: 'row-reverse' }}>
                        <input type="checkbox" checked={rememberAr} onChange={e => setRememberAr(e.target.checked)} />
                        تذكرني
                      </label>
                      <a href="#" className="lp-forgot">نسيت كلمة المرور ؟</a>
                    </div>

                    <button type="submit" className="lp-btn" disabled={arabicLoading}>
                      {arabicLoading
                        ? <><span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14, borderWidth: 2 }} /> جاري تسجيل الدخول...</>
                        : <><Lock size={14} /> تسجيل الدخول</>}
                    </button>

                    <div className="lp-or">
                      <div className="lp-or-line" /><span className="lp-or-text">أو</span><div className="lp-or-line" />
                    </div>

                    <button type="button" className="lp-google-btn" dir="rtl"><GoogleIcon /> Google الدخول باستخدام</button>
                  </form>

                  <p className="lp-card-footer" dir="ltr">جميع الحقوق محفوظة 2026 ©</p>
                </div>
              </div>

            </div>

            

            <div className="lp-bottom-caption">
              <p>© 2026 Al-ManarD3s. Tous droits réservés.</p>
              <a href="#">
                Al-ManarD3s Management System
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              </a>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}
