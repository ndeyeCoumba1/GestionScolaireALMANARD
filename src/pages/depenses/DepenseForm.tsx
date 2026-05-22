import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { Mois } from '../../Types/index';

interface DepenseFormProps {
  onClose: () => void;
  depenseId?: number;
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
} as const;

const TYPES_DEPENSE = [
  'Facture_Eau', 'Achat_Woyofal', 'Transport', 'Carburant',
  'Salaire', 'Rechage_Gaz', 'Depense_Gestion_Interne',
  'Restitution_Frais_Scolaire', 'Medical', 'Dettes', 'Social',
  'Fourniture_Scolaire', 'Charbon', 'Denrees', 'PRET',
  'Vidange', 'Cartouche_Imprimante', 'Traveaux_Daradji',
];

export default function DepenseForm({ onClose, depenseId }: DepenseFormProps) {
  const isEdit = !!depenseId;
  const [mois, setMois] = useState<Mois[]>([]);
  const [form, setForm] = useState({
    typeDepense: 'Facture_Eau',
    description: '',
    montant: '',
    dateDepense: new Date().toISOString().split('T')[0],
    moisId: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/mois').then(r => setMois(r.data));
    if (isEdit && depenseId) {
      api.get(`/depenses/${depenseId}`)
        .then(r => {
          const d = r.data;
          setForm({
            typeDepense: d.typeDepense,
            description: d.description || '',
            montant: d.montant.toString(),
            dateDepense: d.dateDepense,
            moisId: d.moisId?.toString() || '',
          });
        })
        .catch(() => setError('Impossible de charger cette dépense.'))
        .finally(() => setFetching(false));
    }
  }, [depenseId, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        typeDepense: form.typeDepense,
        description: form.description,
        montant: Number(form.montant),
        dateDepense: form.dateDepense,
        ...(form.moisId && { mois: { id: Number(form.moisId) } }),
      };
      if (isEdit && depenseId) await api.put(`/depenses/${depenseId}`, payload);
      else await api.post('/depenses', payload);
      onClose();
    } catch {
      setError('Erreur lors de la sauvegarde. Vérifiez les champs.');
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
          <div className="row g-3">
            <div className="col-md-6">
              <label style={labelStyle}>Type de dépense</label>
              <select
                name="typeDepense"
                value={form.typeDepense}
                onChange={handleChange}
                className="form-control"
                style={inputStyle}
              >
                {TYPES_DEPENSE.map(t => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label style={labelStyle}>Mois</label>
              <select
                name="moisId"
                value={form.moisId}
                onChange={handleChange}
                className="form-control"
                style={inputStyle}
              >
                <option value="">Choisir un mois</option>
                {mois.map(m => (
                  <option key={m.id} value={m.id}>{m.libelle}</option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label style={labelStyle}>Montant (FCFA)</label>
              <input
                type="number"
                name="montant"
                value={form.montant}
                onChange={handleChange}
                className="form-control"
                style={inputStyle}
                required
              />
            </div>

            <div className="col-md-6">
              <label style={labelStyle}>Date</label>
              <input
                type="date"
                name="dateDepense"
                value={form.dateDepense}
                onChange={handleChange}
                className="form-control"
                style={inputStyle}
                required
              />
            </div>

            <div className="col-12">
              <label style={labelStyle}>Description</label>
              <input
                type="text"
                name="description"
                value={form.description}
                onChange={handleChange}
                className="form-control"
                style={inputStyle}
                placeholder="Description optionnelle"
              />
            </div>
          </div>

          {error && (
            <div className="alert alert-danger mt-3" style={{ fontSize: 13, padding: '10px 14px', borderRadius: 8 }}>
              {error}
            </div>
          )}

          <div className="d-flex gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn flex-fill fw-medium"
              style={{
                border: '1px solid #e5e7eb',
                color: '#6b7280',
                borderRadius: 10,
                padding: '10px 0',
                fontSize: 14,
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn flex-fill fw-semibold text-white"
              style={{
                backgroundColor: '#1a5c38',
                border: 'none',
                borderRadius: 10,
                padding: '10px 0',
                fontSize: 14,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#145a30';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1a5c38';
              }}
            >
              {loading ? 'Sauvegarde...' : isEdit ? 'Enregistrer les modifications' : 'Enregistrer'}
            </button>
          </div>
        </form>
      )}
    </>
  );
}