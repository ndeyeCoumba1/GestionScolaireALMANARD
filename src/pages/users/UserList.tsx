import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { User } from '../../Types/index';
import PageHeader from '../../components/Common/PageHeader';

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', password: '', role: 'ENSEIGNANT' });
  const [error, setError] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users', { ...form, actif: true });
      setShowForm(false);
      setForm({ nom: '', prenom: '', email: '', password: '', role: 'ENSEIGNANT' });
      fetchUsers();
    } catch { setError('Erreur lors de la création'); }
  };

  const handleDesactiver = async (id: number) => {
    await api.put(`/users/${id}/desactiver`);
    fetchUsers();
  };

  const roleColor: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-700',
    COMPTABLE: 'bg-blue-100 text-blue-700',
    ENSEIGNANT: 'bg-green-100 text-green-700',
  };

  return (
    <div className="space-y-4">
      <PageHeader
        subtitle="Gestion utilisateurs"
        title="👤 Utilisateurs"
        description="Créez et gérez les comptes utilisateurs du système avec facilité."
        countText={`${users.length} utilisateur(s) actif(s)`}
        action={
          <button onClick={() => setShowForm(!showForm)}
            className="btn btn-light rounded-pill px-4 py-2 fw-semibold text-success">
            + Nouvel Utilisateur
          </button>
        }
      />

      {showForm && (
        <div className="rounded-4 bg-white shadow-sm p-4">
          <h2 className="fw-semibold text-success mb-4">Créer un utilisateur</h2>
          <form onSubmit={handleCreate} className="row g-3">
            {[
              { name: 'nom', label: 'Nom' },
              { name: 'prenom', label: 'Prénom' },
              { name: 'email', label: 'Email' },
              { name: 'password', label: 'Mot de passe' },
            ].map(({ name, label }) => (
              <div key={name} className="col-12 col-md-6">
                <label className="form-label fw-semibold">{label}</label>
                <input name={name} type={name === 'password' ? 'password' : 'text'}
                  value={(form as any)[name]}
                  onChange={e => setForm({ ...form, [name]: e.target.value })}
                  className="form-control rounded-pill border-0 shadow-sm"
                  placeholder={label} required />
              </div>
            ))}
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">Rôle</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                className="form-select rounded-pill border-0 shadow-sm">
                <option value="ADMIN">Admin</option>
                <option value="COMPTABLE">Comptable</option>
                <option value="ENSEIGNANT">Enseignant</option>
              </select>
            </div>
            {error && <p className="text-danger text-sm col-12">{error}</p>}
            <div className="col-12 d-flex flex-wrap gap-2">
              <button type="submit" className="btn btn-success rounded-pill px-4 py-2">Créer</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline-secondary rounded-pill px-4 py-2">Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-4 bg-white shadow-sm overflow-hidden">
        <div className="table-responsive">
          <table className="table mb-0">
            <thead style={{ backgroundColor: '#f1fcf5' }}>
              <tr>
                <th className="py-3">Nom</th>
                <th className="py-3">Email</th>
                <th className="py-3">Rôle</th>
                <th className="py-3">Statut</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-5 text-muted">Chargement...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-5 text-muted">Aucun utilisateur trouvé</td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="align-middle border-top">
                    <td className="py-3 fw-semibold">{u.nom} {u.prenom}</td>
                    <td className="py-3 text-muted">{u.email}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-pill text-xs fw-semibold ${roleColor[u.role] || ''}`}>{u.role}</span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-pill text-xs fw-semibold ${u.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {u.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="py-3">
                      {u.actif && (
                        <button onClick={() => handleDesactiver(u.id)} className="btn btn-sm btn-outline-danger rounded-pill">Désactiver</button>
                      )}
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