import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import type { Depense } from '../../Types/index';
import PageHeader from '../../components/Common/PageHeader';

export default function DepenseList() {
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchDepenses(); }, []);

  const fetchDepenses = async () => {
    try {
      const res = await api.get('/depenses');
      setDepenses(res.data);
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette dépense ?')) return;
    await api.delete(`/depenses/${id}`);
    fetchDepenses();
  };

  return (
    <div className="space-y-4">
      <PageHeader
        subtitle="Gestion des dépenses"
        title="📉 Dépenses"
        description="Consultez les dépenses enregistrées et ajoutez rapidement de nouvelles sorties de fonds."
        countText={`${depenses.length} dépense(s) enregistrée(s)`}
        action={
          <button onClick={() => navigate('/depenses/nouvelle')} className="btn btn-light rounded-pill px-4 py-2 fw-semibold text-success">
            + Nouvelle Dépense
          </button>
        }
      />

      <div className="rounded-4 bg-white shadow-sm overflow-hidden">
        <div className="table-responsive">
          <table className="table mb-0">
            <thead style={{ backgroundColor: '#f1fcf5' }}>
              <tr>
                <th className="py-3">Type</th>
                <th className="py-3">Description</th>
                <th className="py-3">Mois</th>
                <th className="py-3">Montant</th>
                <th className="py-3">Date</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-muted">Chargement...</td>
                </tr>
              ) : depenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-muted">Aucune dépense trouvée</td>
                </tr>
              ) : (
                depenses.map(d => (
                  <tr key={d.id} className="align-middle border-top">
                    <td className="py-3">
                      <span className="badge rounded-pill" style={{ backgroundColor: '#eef9f0', color: '#0f9d58' }}>{d.typeDepense}</span>
                    </td>
                    <td className="py-3 text-muted">{d.description || '—'}</td>
                    <td className="py-3 text-muted">{d.moisLibelle || '—'}</td>
                    <td className="py-3 fw-semibold" style={{ color: '#0f9d58' }}>{d.montant?.toLocaleString()} FCFA</td>
                    <td className="py-3 text-muted">{d.dateDepense}</td>
                    <td className="py-3">
                      <button onClick={() => handleDelete(d.id)} className="btn btn-sm btn-outline-danger rounded-pill">Supprimer</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}