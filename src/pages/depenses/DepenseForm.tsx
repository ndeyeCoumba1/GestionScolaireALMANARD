import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import type { Mois } from '../../Types/index';

const TYPES_DEPENSE = [
  'Facture_Eau', 'Achat_Woyofal', 'Transport', 'Carburant',
  'Salaire', 'Rechage_Gaz', 'Depense_Gestion_Interne',
  'Restitution_Frais_Scolaire', 'Medical', 'Dettes', 'Social',
  'Fourniture_Scolaire', 'Charbon', 'Denrees', 'PRET',
  'Vidange', 'Cartouche_Imprimante', 'Traveaux_Daradji',
];

export default function DepenseForm() {
  const navigate = useNavigate();
  const [mois, setMois] = useState<Mois[]>([]);
  const [form, setForm] = useState({
    typeDepense: 'Facture_Eau',
    description: '',
    montant: '',
    dateDepense: new Date().toISOString().split('T')[0],
    moisId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/mois').then(r => setMois(r.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        typeDepense: form.typeDepense,
        description: form.description,
        montant: Number(form.montant),
        dateDepense: form.dateDepense,
        ...(form.moisId && { mois: { id: Number(form.moisId) } }),
      };
      await api.post('/depenses', payload);
      navigate('/depenses');
    } catch { setError('Erreur lors de la sauvegarde'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/depenses')} className="text-gray-400 hover:text-gray-600">←</button>
        <h1 className="text-2xl font-bold text-gray-800">📉 Nouvelle Dépense</h1>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de dépense</label>
              <select value={form.typeDepense}
                onChange={e => setForm({ ...form, typeDepense: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400">
                {TYPES_DEPENSE.map(t => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mois</label>
              <select value={form.moisId}
                onChange={e => setForm({ ...form, moisId: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400">
                <option value="">Choisir un mois</option>
                {mois.map(m => (
                  <option key={m.id} value={m.id}>{m.libelle}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant (FCFA)</label>
              <input type="number" value={form.montant}
                onChange={e => setForm({ ...form, montant: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" value={form.dateDepense}
                onChange={e => setForm({ ...form, dateDepense: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder="Description optionnelle" />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate('/depenses')}
              className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2 hover:bg-gray-50">
              Annuler
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-red-500 text-white rounded-xl py-2 hover:bg-red-600 disabled:opacity-50">
              {loading ? 'Sauvegarde...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}