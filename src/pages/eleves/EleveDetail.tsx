import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

interface EleveDetail {
  id: number;
  nom: string;
  prenom: string;
  dateNaissance: string;
  sexe: string;
  adresse: string;
  photoUrl?: string;
  statut: string;
  matricule?: string;

  // Classe (champs plats)
  classeId?: number;
  classeRegime?: string;
  classeStatut?: string;
  classeCapaciteMax?: number;

  // Enseignant (champs plats)
  enseignantId?: number;
  enseignantNom?: string;
  enseignantPrenom?: string;

  // Parent (champs plats)
  parentId?: number;
  parentNom?: string;
  parentPrenom?: string;
  parentTelephone?: string;
  parentEmail?: string;
  parentAdresse?: string;
  parentProfession?: string;
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
};

export default function EleveDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [eleve, setEleve] = useState<EleveDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEleve();
  }, [id]);

  const fetchEleve = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/eleves/${id}`);
      setEleve(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-muted">Chargement...</div>
      </div>
    );
  }

  if (!eleve) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-muted">Élève non trouvé</div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header */}
      <div className="d-flex align-items-center gap-3">
        <button
          onClick={() => navigate('/eleves')}
          className="btn btn-sm d-flex align-items-center justify-content-center"
          style={{ width: 36, height: 36, padding: 0, borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#6b7280' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <h4 className="fw-bold mb-0" style={{ fontSize: 20, color: '#111827' }}>Détails de l'élève</h4>
          <small className="text-muted">Informations complètes</small>
        </div>
      </div>

      {/* Carte principale */}
      <div className="bg-white rounded-4 shadow-sm overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
        <div style={{ height: 5, background: 'linear-gradient(90deg, #1a5c38, #4ade80)' }} />
        <div className="p-4">
          {/* Matricule - En évidence */}
          {eleve.matricule && (
            <div className="mb-4 p-3 rounded-3 d-flex align-items-center justify-content-between" 
                 style={{ backgroundColor: '#f0fdf4', border: '2px solid #16a34a' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center" 
                     style={{ width: 40, height: 40, backgroundColor: '#16a34a', fontSize: 20 }}>
                  🎓
                </div>
                <div>
                  <small className="text-muted fw-semibold" style={{ fontSize: 11, letterSpacing: '0.05em' }}>MATRICULE</small>
                  <div className="fw-bold" style={{ fontSize: 18, color: '#166534', fontFamily: 'monospace', letterSpacing: '1px' }}>
                    {eleve.matricule}
                  </div>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(eleve.matricule!)}
                className="btn btn-sm d-flex align-items-center gap-2"
                style={{ backgroundColor: '#16a34a', color: '#fff', borderRadius: 8, fontSize: 12, padding: '6px 12px' }}
                title="Copier le matricule"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
                Copier
              </button>
            </div>
          )}

          {/* Informations personnelles */}
          <div className="mb-4">
            <h5 className="fw-bold mb-3" style={{ fontSize: 16, color: '#111827' }}>Informations personnelles</h5>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold text-uppercase" style={labelStyle}>Nom</label>
                <div className="form-control" style={inputStyle}>{eleve.nom}</div>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold text-uppercase" style={labelStyle}>Prénom</label>
                <div className="form-control" style={inputStyle}>{eleve.prenom}</div>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold text-uppercase" style={labelStyle}>Date de naissance</label>
                <div className="form-control" style={inputStyle}>{new Date(eleve.dateNaissance).toLocaleDateString('fr-FR')}</div>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold text-uppercase" style={labelStyle}>Sexe</label>
                <div className="form-control" style={inputStyle}>{eleve.sexe}</div>
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold text-uppercase" style={labelStyle}>Adresse</label>
                <div className="form-control" style={inputStyle}>{eleve.adresse || 'Non renseignée'}</div>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold text-uppercase" style={labelStyle}>Statut</label>
                <div>
                  <span
                    className="badge rounded-pill fw-medium"
                    style={{
                      backgroundColor: eleve.statut === 'INSCRIT' ? '#dcfce7' : '#ffedd5',
                      color: eleve.statut === 'INSCRIT' ? '#166534' : '#9a3412',
                      fontSize: 12,
                      padding: '5px 10px',
                    }}
                  >
                    {eleve.statut}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <hr style={{ borderColor: '#f3f4f6' }} />

          {/* Classe */}
          <div className="mb-4">
            <h5 className="fw-bold mb-3" style={{ fontSize: 16, color: '#111827' }}>Classe</h5>
            {eleve.classeId ? (
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold text-uppercase" style={labelStyle}>Régime</label>
                  <div className="form-control" style={inputStyle}>{eleve.classeRegime?.replace('_', ' ') || '—'}</div>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold text-uppercase" style={labelStyle}>Capacité maximale</label>
                  <div className="form-control" style={inputStyle}>{eleve.classeCapaciteMax || '—'} élèves</div>
                </div>
                {eleve.enseignantNom && (
                  <div className="col-12">
                    <label className="form-label fw-semibold text-uppercase" style={labelStyle}>Enseignant</label>
                    <div className="form-control" style={inputStyle}>{eleve.enseignantPrenom} {eleve.enseignantNom}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-muted" style={{ fontSize: 14 }}>Aucune classe assignée</div>
            )}
          </div>

          <hr style={{ borderColor: '#f3f4f6' }} />

          {/* Parent */}
          <div>
            <h5 className="fw-bold mb-3" style={{ fontSize: 16, color: '#111827' }}>Parent / Tuteur</h5>
            {eleve.parentId ? (
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold text-uppercase" style={labelStyle}>Nom</label>
                  <div className="form-control" style={inputStyle}>{eleve.parentNom || '—'}</div>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold text-uppercase" style={labelStyle}>Prénom</label>
                  <div className="form-control" style={inputStyle}>{eleve.parentPrenom || '—'}</div>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold text-uppercase" style={labelStyle}>Email</label>
                  <div className="form-control" style={inputStyle}>{eleve.parentEmail || '—'}</div>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold text-uppercase" style={labelStyle}>Téléphone</label>
                  <div className="form-control" style={inputStyle}>{eleve.parentTelephone || '—'}</div>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold text-uppercase" style={labelStyle}>Profession</label>
                  <div className="form-control" style={inputStyle}>{eleve.parentProfession || 'Non renseignée'}</div>
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold text-uppercase" style={labelStyle}>Adresse</label>
                  <div className="form-control" style={inputStyle}>{eleve.parentAdresse || 'Non renseignée'}</div>
                </div>
              </div>
            ) : (
              <div className="text-muted" style={{ fontSize: 14 }}>Aucun parent assigné</div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="d-flex gap-3">
        <button
          onClick={() => navigate(`/eleves/${eleve.id}/modifier`)}
          className="btn flex-fill fw-semibold text-white d-flex align-items-center justify-content-center gap-2"
          style={{ background: 'linear-gradient(135deg, #1a5c38, #2d8653)', borderRadius: 10, padding: '10px 0', fontSize: 14, border: 'none' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 0110 16.414H8v-2a2 2 0 01.586-1.414z"/>
          </svg>
          Modifier
        </button>
        <button
          onClick={() => navigate('/eleves')}
          className="btn flex-fill fw-medium"
          style={{ border: '1px solid #e5e7eb', color: '#6b7280', borderRadius: 10, padding: '10px 0', fontSize: 14 }}
        >
          Retour
        </button>
      </div>
    </div>
  );
}
