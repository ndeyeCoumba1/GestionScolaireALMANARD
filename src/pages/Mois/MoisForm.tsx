import { useEffect, useState } from 'react';
import api from '../../api/axios';

interface MoisFormProps {
  onClose: () => void;
  moisId?: number;
}

export default function MoisForm({ onClose, moisId }: MoisFormProps) {
  const [libelle, setLibelle] = useState('');
  const [montantScolarite, setMontantScolarite] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (moisId) {
      fetchMois();
    }
  }, [moisId]);

  const fetchMois = async () => {
    try {
      const res = await api.get(`/mois/${moisId}`);
      setLibelle(res.data.libelle || '');
      setMontantScolarite(res.data.montantScolarite?.toString() || '');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        libelle,
        montantScolarite: parseFloat(montantScolarite),
      };

      if (moisId) {
        await api.put(`/mois/${moisId}`, data);
      } else {
        await api.post('/mois', data);
      }

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
      <div>
        <label className="form-label fw-medium" style={{ fontSize: 14, color: '#374151' }}>
          Libellé
        </label>
        <input
          type="text"
          className="form-control"
          value={libelle}
          onChange={(e) => setLibelle(e.target.value)}
          required
          style={{
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            padding: '10px 12px',
            fontSize: 14,
          }}
          placeholder="Ex: Janvier, Février..."
        />
      </div>

      <div>
        <label className="form-label fw-medium" style={{ fontSize: 14, color: '#374151' }}>
          Montant Scolarité (FCFA)
        </label>
        <input
          type="number"
          className="form-control"
          value={montantScolarite}
          onChange={(e) => setMontantScolarite(e.target.value)}
          required
          min="0"
          step="0.01"
          style={{
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            padding: '10px 12px',
            fontSize: 14,
          }}
          placeholder="Ex: 50000"
        />
      </div>

      <div className="d-flex gap-2 mt-4">
        <button
          type="button"
          onClick={onClose}
          className="btn fw-medium flex-1"
          style={{
            backgroundColor: '#fff',
            color: '#6b7280',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: '10px',
            fontSize: 14,
          }}
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn fw-medium flex-1"
          style={{
            backgroundColor: '#1a5c38',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px',
            fontSize: 14,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Enregistrement...' : moisId ? 'Modifier' : 'Créer'}
        </button>
      </div>
    </form>
  );
}
