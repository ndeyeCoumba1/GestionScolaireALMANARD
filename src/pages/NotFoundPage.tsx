import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const portail = localStorage.getItem('portail');
  const token = localStorage.getItem('token');

  const handleBack = () => {
    if (!token) return navigate('/login');
    navigate(portail === 'AR' ? '/ar/dashboard' : '/dashboard');
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh', gap: 16,
      backgroundColor: '#f8fafc',
    }}>
      <div style={{ fontSize: 72 }}>🔍</div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0 }}>
        Page non trouvée
      </h1>
      <p style={{ fontSize: 16, color: '#6b7280', margin: 0 }}>
        404 — Cette page n'existe pas
      </p>
      <button
        onClick={handleBack}
        style={{
          marginTop: 8, backgroundColor: '#0A6E3F', color: '#fff',
          border: 'none', borderRadius: 10, padding: '10px 24px',
          fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}
      >
        ← Retour au tableau de bord
      </button>
    </div>
  );
}
