import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { Eleve, Classe } from '../../Types/index';

interface InscriptionFormProps {
  onClose: () => void;
  inscriptionId?: number;
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

export default function InscriptionForm({ onClose, inscriptionId }: InscriptionFormProps) {
  const isEdit = !!inscriptionId;
  const [form, setForm] = useState({ 
    eleveId: '', 
    classeId: '', 
    frais: '',
    montantPaye: '',
    montantAttendu: '',
    inscriptionId: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);

  // Calculate payment status
  const getPaymentStatus = () => {
    const paye = Number(form.montantPaye) || 0;
    const attendu = Number(form.montantAttendu) || 0;
    
    if (attendu === 0) return null;
    if (paye >= attendu) return 'SOLDÉ';
    if (paye > 0) return 'PARTIEL';
    return null;
  };

  const paymentStatus = getPaymentStatus();

  useEffect(() => {
    api.get('/eleves').then(r => setEleves(r.data));
    api.get('/classes').then(r => setClasses(r.data));
    if (isEdit && inscriptionId) {
      api.get(`/inscriptions/${inscriptionId}`)
        .then(r => {
          const i = r.data;
          setForm({
            eleveId: i.eleve?.id?.toString() || '',
            classeId: i.classe?.id?.toString() || '',
            frais: i.fraisInscription?.toString() || '',
            montantPaye: i.montantPaye?.toString() || '',
            montantAttendu: i.montantAttendu?.toString() || '',
            inscriptionId: i.id?.toString() || '',
          });
        })
        .catch(() => setError('Impossible de charger cette inscription.'))
        .finally(() => setFetching(false));
    }
  }, [inscriptionId, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isEdit && inscriptionId) {
        await api.put(`/inscriptions/${inscriptionId}`, {
          fraisInscription: Number(form.frais),
          montantPaye: form.montantPaye ? Number(form.montantPaye) : undefined,
          montantAttendu: form.montantAttendu ? Number(form.montantAttendu) : undefined,
        });
      } else {
        await api.post(
          `/inscriptions/inscrire?eleveId=${form.eleveId}&classeId=${form.classeId}&fraisInscription=${form.frais}`
        );
      }
      onClose();
    } catch (err: any) {
      console.error('Erreur inscription:', err);
      setError(err.response?.data?.message || err.response?.data || 'Erreur inscription');
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
              <select name="eleveId" value={form.eleveId} onChange={handleChange} required disabled={!!isEdit}
                className="form-select" style={inputStyle}>
                <option value="">Choisir un élève</option>
                {eleves.map(e => (
                  <option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>
                ))}
              </select>
            </div>

            {/* Classe */}
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-uppercase" style={labelStyle}>
                Classe <span className="text-danger">*</span>
              </label>
              <select name="classeId" value={form.classeId} onChange={handleChange} required disabled={!!isEdit}
                className="form-select" style={inputStyle}>
                <option value="">Choisir une classe</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.niveau}</option>
                ))}
              </select>
            </div>

            {/* Frais */}
            <div className="col-12">
              <label className="form-label fw-semibold text-uppercase" style={labelStyle}>
                Frais d'inscription (FCFA) <span className="text-danger">*</span>
              </label>
              <input type="number" name="frais" value={form.frais} onChange={handleChange} required
                placeholder="Ex : 25000" className="form-control" style={inputStyle} />
            </div>

            {/* Montant Payé */}
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-uppercase" style={labelStyle}>
                Montant payé (FCFA)
              </label>
              <input type="number" name="montantPaye" value={form.montantPaye} onChange={handleChange}
                placeholder="Ex : 15000" className="form-control" style={inputStyle} />
            </div>

            {/* Montant Attendu */}
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-uppercase" style={labelStyle}>
                Montant attendu (FCFA)
              </label>
              <input type="number" name="montantAttendu" value={form.montantAttendu} onChange={handleChange}
                placeholder="Ex : 25000" className="form-control" style={inputStyle} />
            </div>

            {/* Inscription ID */}
            <div className="col-12">
              <label className="form-label fw-semibold text-uppercase" style={labelStyle}>
                Inscription ID (optionnel)
              </label>
              <input type="number" name="inscriptionId" value={form.inscriptionId} onChange={handleChange}
                placeholder="Ex : 1" className="form-control" style={inputStyle} />
            </div>

            {/* Payment Status Badge */}
            {paymentStatus && (
              <div className="col-12">
                <span 
                  className="badge rounded-pill fw-semibold px-3 py-2"
                  style={{
                    backgroundColor: paymentStatus === 'SOLDÉ' ? '#dcfce7' : '#ffedd5',
                    color: paymentStatus === 'SOLDÉ' ? '#166534' : '#c2410c',
                    fontSize: 12,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  {paymentStatus === 'SOLDÉ' ? '✅ SOLDÉ' : '⚠️ PARTIEL'}
                </span>
              </div>
            )}

          </div>

          {/* Erreur */}
          {error && (
            <div className="alert d-flex align-items-center gap-2 py-2 px-3 mb-3"
              style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, color: '#dc2626', fontSize: 14 }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Boutons */}
          <div className="d-flex gap-3 pt-1">
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
              style={{ background: 'linear-gradient(135deg, #1a5c38, #2d8653)', borderRadius: 10, padding: '10px 0', fontSize: 14, opacity: loading ? 0.7 : 1, border: 'none' }}
            >
              {loading && (
                <span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14, borderWidth: 2 }} />
              )}
              {loading ? 'Sauvegarde...' : isEdit ? 'Enregistrer les modifications' : 'Inscrire'}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
