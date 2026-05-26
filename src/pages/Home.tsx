import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

function clamp(min: number, preferred: number, max: number): string {
  return `clamp(${min}px, ${preferred}vw, ${max}px)`;
}

const features = [
  { icon: '🎓', title: 'Élèves', desc: 'Inscriptions, parcours scolaire et suivi personnalisé de chaque élève.', color: '#1a5c38', bg: '#e8f5ee' },
  { icon: '💳', title: 'Paiements', desc: 'Wave, Orange Money, Chèque ou Espèces — reçus PDF générés instantanément.', color: '#0f9d58', bg: '#e3f6ec' },
  { icon: '📊', title: 'Tableau de bord', desc: 'Statistiques financières et académiques en temps réel.', color: '#f59e0b', bg: '#fff8e1' },
  { icon: '👨‍👩‍👧', title: 'Parents & Tuteurs', desc: 'Fiches de contact et liaison directe famille–établissement.', color: '#6366f1', bg: '#eef2ff' },
  { icon: '🏫', title: 'Classes', desc: 'Organisation des niveaux, régimes (internat / externat) et affectations.', color: '#ec4899', bg: '#fdf2f8' },
  { icon: '📋', title: 'Inscriptions', desc: "Processus d'inscription rapide lié à l'année scolaire active.", color: '#06b6d4', bg: '#ecfeff' },
  { icon: '💸', title: 'Dépenses', desc: 'Suivi budgétaire complet avec historique et export Excel.', color: '#ef4444', bg: '#fff1f2' },
  { icon: '👤', title: 'Utilisateurs', desc: 'Gestion des rôles : Admin, Comptable, Enseignant.', color: '#8b5cf6', bg: '#f5f3ff' },
];

const stats = [
  { value: '200+', label: 'Élèves inscrits' },
  { value: '50+', label: 'Enseignants' },
  { value: '10+', label: "Années d'expérience" },
  { value: '4', label: 'Moyens de paiement' },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", backgroundColor: '#f0f4f1', minHeight: '100vh' }}>

      {/* ── Navbar fixe ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(26,92,56,0.1)' : 'none',
        transition: 'all 0.3s ease',
        padding: '0 40px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/logo.jpeg" alt="Logo" style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 8 }} />
            <span style={{ fontWeight: 700, fontSize: 16, color: scrolled ? '#1a5c38' : '#fff', letterSpacing: '0.02em' }}>
              AL-MANARD3S
            </span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {isAuthenticated ? (
              <Link to="/dashboard" style={{
                padding: '8px 20px', borderRadius: 8,
                backgroundColor: '#1a5c38', color: '#fff',
                textDecoration: 'none', fontSize: 14, fontWeight: 600,
                transition: 'background 0.2s',
              }}>
                Tableau de bord
              </Link>
            ) : (
              <Link to="/login" style={{
                padding: '8px 20px', borderRadius: 8,
                backgroundColor: scrolled ? '#1a5c38' : '#fbbf24',
                color: scrolled ? '#fff' : '#1a5c38',
                textDecoration: 'none', fontSize: 14, fontWeight: 700,
                transition: 'all 0.2s',
              }}>
                Se connecter
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div ref={heroRef} style={{
        background: 'linear-gradient(150deg, #0b4026 0%, #1a5c38 40%, #0f9d58 100%)',
        minHeight: '100vh',
        display: 'flex', alignItems: 'center',
        padding: '100px 40px 80px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Cercles décoratifs */}
        {[
          { w: 700, h: 700, top: -300, right: -300, op: 0.06 },
          { w: 400, h: 400, bottom: -150, left: -100, op: 0.04 },
          { w: 200, h: 200, top: '40%', right: '35%', op: 0.05 },
        ].map((c, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: c.w, height: c.h,
            borderRadius: '50%',
            border: `2px solid rgba(255,255,255,${c.op * 2})`,
            background: `rgba(255,255,255,${c.op})`,
            top: c.top, right: c.right, bottom: c.bottom, left: c.left,
          }} />
        ))}

        {/* Grille de points */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>

            {/* Colonne gauche */}
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '6px 16px', borderRadius: 100,
                background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                marginBottom: 28,
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#4ade80', display: 'inline-block' }} />
                <span style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>Système de Gestion Scolaire</span>
              </div>

              <h1 style={{
                color: '#fff', fontWeight: 800, lineHeight: 1.15, marginBottom: 24,
                fontSize: clamp(32, 5, 62),
                fontFamily: "'Georgia', serif",
              }}>
                مجموعة مدارس المنار<br />
                <span style={{ color: '#fbbf24', fontFamily: "'Segoe UI', sans-serif", fontSize: clamp(28, 4, 54) }}>
                  GROUPE SCOLAIRE<br />AL-MANARD3S
                </span>
              </h1>

              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 18, lineHeight: 1.8, maxWidth: 480, marginBottom: 40 }}>
                Une plateforme complète pour gérer votre établissement — élèves, paiements, inscriptions, classes et bien plus.
              </p>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {isAuthenticated ? (
                  <Link to="/dashboard" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '14px 32px', borderRadius: 10,
                    backgroundColor: '#fff', color: '#1a5c38',
                    textDecoration: 'none', fontSize: 16, fontWeight: 700,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)'; }}
                  >
                    📊 Tableau de bord
                  </Link>
                ) : (
                  <Link to="/login" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '14px 32px', borderRadius: 10,
                    backgroundColor: '#fbbf24', color: '#1a5c38',
                    textDecoration: 'none', fontSize: 16, fontWeight: 700,
                    boxShadow: '0 4px 20px rgba(251,191,36,0.35)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
                  >
                    🔐 Se connecter
                  </Link>
                )}
                <a href="#fonctionnalites" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '14px 32px', borderRadius: 10,
                  backgroundColor: 'transparent', color: '#fff',
                  textDecoration: 'none', fontSize: 16, fontWeight: 600,
                  border: '2px solid rgba(255,255,255,0.3)',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  Découvrir ↓
                </a>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: 0, marginTop: 56, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                {stats.map((s, i) => (
                  <div key={i} style={{ flex: 1, paddingRight: 16, borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.15)' : 'none', paddingLeft: i > 0 ? 16 : 0 }}>
                    <div style={{ color: '#fff', fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{s.value}</div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Colonne droite — carte logo */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 28,
                padding: 48,
                textAlign: 'center',
                boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
                maxWidth: 380, width: '100%',
              }}>
                <div style={{
                  width: 140, height: 140, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.95)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 28px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                }}>
                  <img src="/logo.jpeg" alt="Al-Manard3s Logo" style={{ width: 110, height: 110, objectFit: 'contain', borderRadius: '50%' }} />
                </div>
                <h3 style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 8, fontFamily: "'Georgia', serif" }}>
                  Fondation Daroul Manar D3S
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, marginBottom: 32 }}>
                  Excellence éducative et engagement solidaire
                </p>

                

                <div style={{ marginTop: 28, padding: '16px', borderRadius: 12, background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, margin: 0, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Contact</p>
                  <p style={{ color: '#fff', fontSize: 14, margin: '4px 0 0', fontWeight: 500 }}>+221 78 120 89 78</p>
                  <p style={{ color: '#fff', fontSize: 14, margin: '2px 0 0', fontWeight: 500 }}>+221 77 520 87 67</p>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: '2px 0 0' }}>info@almanard3s.com</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── FONCTIONNALITÉS ── */}
      <div id="fonctionnalites" style={{ padding: '100px 40px', backgroundColor: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{ color: '#0f9d58', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '3px' }}>
              Fonctionnalités
            </span>
            <h2 style={{ color: '#1a5c38', fontSize: 38, fontWeight: 800, marginTop: 12, marginBottom: 16, fontFamily: "'Georgia', serif" }}>
              Tout ce dont vous avez besoin
            </h2>
            <p style={{ color: '#6b7280', fontSize: 17, maxWidth: 560, margin: '0 auto' }}>
              Une plateforme intégrée pour piloter votre établissement au quotidien
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {features.map((f, i) => (
              <div key={i}
                style={{
                  backgroundColor: '#fafafa', borderRadius: 20,
                  padding: '28px 24px', border: '1px solid #f0f0f0',
                  transition: 'all 0.25s ease', cursor: 'default',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 16px 48px rgba(26,92,56,0.1)'; (e.currentTarget as HTMLDivElement).style.borderColor = '#d1fae5'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'none'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; (e.currentTarget as HTMLDivElement).style.borderColor = '#f0f0f0'; }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  backgroundColor: f.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26, marginBottom: 20,
                }}>{f.icon}</div>
                <h5 style={{ color: '#1a1a1a', fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{f.title}</h5>
                <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      

      {/* ── CTA FINAL ── */}
      <div style={{
        background: 'linear-gradient(150deg, #0b4026 0%, #1a5c38 60%, #0f9d58 100%)',
        padding: '100px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />
        <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{ color: '#fff', fontSize: 38, fontWeight: 800, marginBottom: 20, fontFamily: "'Georgia', serif" }}>
            Prêt à moderniser votre gestion ?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, lineHeight: 1.8, marginBottom: 40 }}>
            Rejoignez le Groupe Scolaire Al-MaNard3S et découvrez une nouvelle façon de piloter votre établissement.
          </p>
          {isAuthenticated ? (
            <Link to="/dashboard" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '16px 40px', borderRadius: 12,
              backgroundColor: '#fff', color: '#1a5c38',
              textDecoration: 'none', fontSize: 17, fontWeight: 700,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}>
              📊 Accéder au tableau de bord
            </Link>
          ) : (
            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '16px 40px', borderRadius: 12,
              backgroundColor: '#fbbf24', color: '#1a5c38',
              textDecoration: 'none', fontSize: 17, fontWeight: 700,
              boxShadow: '0 4px 24px rgba(251,191,36,0.35)',
            }}>
              🔐 Commencer maintenant
            </Link>
          )}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: '#0b4026', padding: '48px 40px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 32, paddingBottom: 32, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <img src="/logo.jpeg" alt="Logo" style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 8, background: '#fff', padding: 2 }} />
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>AL-MANARD3S</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, maxWidth: 280, lineHeight: 1.6 }}>
                Fondation Daroul Manar D3S — Excellence éducative et engagement solidaire au Sénégal.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 12 }}>Contact</p>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 6 }}>+221 78 120 89 78</p>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 6 }}>+221 77 520 87 67</p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>info@almanard3s.com</p>
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 12 }}>Application</p>
                <Link to="/login" style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: 14, textDecoration: 'none', marginBottom: 6 }}>Connexion</Link>
                <Link to="/dashboard" style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: 14, textDecoration: 'none' }}>Tableau de bord</Link>
              </div>
            </div>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, textAlign: 'center', marginTop: 24 }}>
            © {new Date().getFullYear()} Groupe Scolaire Al-MaNard3S — Tous droits réservés
          </p>
        </div>
      </footer>
    </div>
  );
}
