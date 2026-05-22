import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { Mois, Eleve, TypePaiement } from '../../Types/index';

interface PaiementFormProps {
  onClose: () => void;
  paiementId?: number;
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

export default function PaiementForm({ onClose, paiementId }: PaiementFormProps) {
  const isEdit = !!paiementId;

  const [mois, setMois] = useState<Mois[]>([]);
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [form, setForm] = useState({
    eleveId: '', montant: '', motif: 'MENSUALITE', moisId: '', typePaiement: 'ESPECE' as TypePaiement,
    // userId supprimé — géré côté backend via le token
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/mois').then(r => setMois(r.data));
    api.get('/eleves').then(r => setEleves(r.data));
    if (isEdit && paiementId) {
      api.get(`/paiements/${paiementId}`)
        .then(r => {
          const p = r.data;
          setForm({
            eleveId: p.eleveId?.toString() || '',
            montant: p.montant?.toString() || '',
            motif: p.motif || 'MENSUALITE',
            moisId: p.moisId?.toString() || '',
            typePaiement: p.typePaiement || 'ESPECE',
          });
        })
        .catch(() => setError('Impossible de charger ce paiement.'))
        .finally(() => setFetching(false));
    }
  }, [paiementId, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        eleveId: form.eleveId,
        montant: form.montant,
        motif: form.motif,
        typePaiement: form.typePaiement,
        // userId supprimé de l'URL
        ...(form.moisId && { moisId: form.moisId }),
      });
      // Le token est envoyé automatiquement via l'intercepteur axios
      await api.post(`/paiements/enregistrer?${params}`);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du paiement');
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

            {/* Élève */}
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-uppercase" style={labelStyle}>
                Élève <span className="text-danger">*</span>
              </label>
              <select name="eleveId" value={form.eleveId} onChange={handleChange} required
                className="form-select" style={inputStyle}>
                <option value="">Choisir un élève</option>
                {eleves.map(e => (
                  <option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>
                ))}
              </select>
            </div>

            {/* Montant */}
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-uppercase" style={labelStyle}>
                Montant (FCFA) <span className="text-danger">*</span>
              </label>
              <input type="number" name="montant" value={form.montant} onChange={handleChange} required
                placeholder="Ex : 25000" className="form-control" style={inputStyle} />
            </div>

            {/* Motif */}
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-uppercase" style={labelStyle}>
                Motif <span className="text-danger">*</span>
              </label>
              <select name="motif" value={form.motif} onChange={handleChange}
                className="form-select" style={inputStyle}>
                <option value="MENSUALITE">Mensualité</option>
                <option value="INSCRIPTION">Inscription</option>
              </select>
            </div>

            {/* Type de paiement */}
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-uppercase" style={labelStyle}>
                Type de paiement <span className="text-danger">*</span>
              </label>
              <select name="typePaiement" value={form.typePaiement} onChange={handleChange}
                className="form-select" style={inputStyle}>
                <option value="ESPECE">Espèce</option>
                <option value="WAVE">Wave</option>
                <option value="CHEQUE">Chèque</option>
                <option value="ORANGE_MONEY">Orange Money</option>
              </select>
            </div>

            {/* Mois */}
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-uppercase" style={labelStyle}>
                Mois
              </label>
              <select name="moisId" value={form.moisId} onChange={handleChange}
                className="form-select" style={inputStyle}>
                <option value="">Choisir un mois</option>
                {mois.map(m => (
                  <option key={m.id} value={m.id}>{m.libelle}</option>
                ))}
              </select>
            </div>

            {/* Champ userId SUPPRIMÉ — l'utilisateur est identifié par son token JWT */}

          </div>

          {error && (
            <div className="alert d-flex align-items-center gap-2 py-2 px-3 mb-3"
              style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, color: '#dc2626', fontSize: 14 }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="d-flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="btn flex-fill fw-medium"
              style={{ border: '1px solid #e5e7eb', color: '#6b7280', borderRadius: 10, padding: '10px 0', fontSize: 14 }}>
              Annuler
            </button>
            <button type="submit" disabled={loading}
              className="btn flex-fill fw-semibold text-white d-flex align-items-center justify-content-center gap-2"
              style={{ background: 'linear-gradient(135deg, #1a5c38, #2d8653)', borderRadius: 10, padding: '10px 0', fontSize: 14, opacity: loading ? 0.7 : 1, border: 'none' }}>
              {loading && <span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14, borderWidth: 2 }} />}
              {loading ? 'Sauvegarde...' : isEdit ? 'Enregistrer les modifications' : 'Créer le paiement'}
            </button>
          </div>
        </form>
      )}
    </>
  );
}