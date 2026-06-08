import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { User } from '../../Types/index';
import PageHeader from '../../components/Common/PageHeader';
import { SkeletonTable } from '../../components/Common/SkeletonLoader';
import Drawer from '../../components/Common/Drawer';
import UserForm from './UserForm';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } finally { setLoading(false); }
  };

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    fetchUsers();
  };

  const handleDesactiver = async (id: number) => {
    await api.put(`/users/${id}/desactiver`);
    fetchUsers();
  };

  const handleReactiver = async (id: number) => {
    await api.put(`/users/${id}/reactiver`);
    fetchUsers();
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, { bg: string; color: string }> = {
      ADMIN: { bg: '#fee2e2', color: '#991b1b' },
      COMPTABLE: { bg: '#dbeafe', color: '#1d4ed8' },
      ENSEIGNANT: { bg: '#dcfce7', color: '#166534' },
      RECITATEUR: { bg: '#ede9fe', color: '#6d28d9' },
    };
    const style = styles[role] || { bg: '#f3f4f6', color: '#374151' };
    return { backgroundColor: style.bg, color: style.color, fontSize: 12, padding: '5px 10px' };
  };

  const getStatutBadge = (actif: boolean) => {
    return {
      backgroundColor: actif ? '#dcfce7' : '#f3f4f6',
      color: actif ? '#166534' : '#6b7280',
      fontSize: 12,
      padding: '5px 10px',
    };
  };

  // Calculate chart data
  const actifs = users.filter(u => u.actif).length;
  const inactifs = users.filter(u => !u.actif).length;

  const roleData = users.reduce((acc: { [key: string]: number }, u) => {
    const role = u.role || 'Autre';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});

  const roleChartData = Object.entries(roleData).map(([name, value]) => ({ name, value }));

  const COLORS = ['#1a5c38', '#0f9d58', '#10b981', '#34d399', '#6ee7b7'];

  return (
    <div className="d-flex flex-column gap-4">
      <PageHeader
        subtitle="Gestion des utilisateurs"
        title="👤 Utilisateurs"
        description="Créez et gérez les comptes utilisateurs du système avec facilité."
        countText={`${users.length} utilisateur(s) au total`}
        action={
          <button
            onClick={handleOpenDrawer}
            className="btn fw-semibold d-flex align-items-center gap-2 px-4 py-2"
            style={{ backgroundColor: '#fff', color: '#1a5c38', borderRadius: 12, fontSize: 14 }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
            Nouvel Utilisateur
          </button>
        }
      />

      {/* ── Statistics Cards ── */}
      <div className="d-flex gap-3 flex-wrap">
        <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0', flex: '1 1 200px', minWidth: 200 }}>
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, backgroundColor: '#dcfce7', fontSize: 24 }}>
              ✅
            </div>
            <div>
              <p className="text-muted mb-0" style={{ fontSize: 12, fontWeight: 500 }}>Actifs</p>
              <p className="fw-bold mb-0" style={{ fontSize: 24, color: '#166534' }}>{actifs}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0', flex: '1 1 200px', minWidth: 200 }}>
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, backgroundColor: '#f3f4f6', fontSize: 24 }}>
              ⏸️
            </div>
            <div>
              <p className="text-muted mb-0" style={{ fontSize: 12, fontWeight: 500 }}>Inactifs</p>
              <p className="fw-bold mb-0" style={{ fontSize: 24, color: '#6b7280' }}>{inactifs}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Charts Section ── */}
      <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0' }}>
        <p className="fw-semibold mb-4" style={{ fontSize: 15, color: '#111827' }}>Répartition des Utilisateurs par Rôle</p>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={roleChartData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={5}
              dataKey="value"
            >
              {roleChartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}
              itemStyle={{ color: '#374151' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-4 shadow-sm overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
        <div className="px-4 pt-4 pb-3">
          <p className="fw-semibold text-dark mb-0" style={{ fontSize: 15 }}>Liste des utilisateurs</p>
        </div>

        <div className="table-responsive">
          {loading ? (
            <SkeletonTable rows={5} columns={5} />
          ) : (
            <table className="table align-middle mb-0" style={{ fontSize: 14 }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  {['Nom', 'Email', 'Rôle', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="py-3 px-4 fw-semibold text-uppercase"
                      style={{ color: '#9ca3af', fontSize: 11, letterSpacing: '0.05em', borderTop: '1px solid #f0f0f0' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-5 text-muted">Aucun utilisateur trouvé.</td></tr>
                ) : (
                  users.map(u => (
                  <tr key={u.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                    <td className="py-3 px-4 fw-semibold" style={{ color: '#111827' }}>{u.nom} {u.prenom}</td>
                    <td className="py-3 px-4" style={{ color: '#374151' }}>{u.email}</td>
                    <td className="py-3 px-4">
                      <span className="badge rounded-pill fw-medium" style={getRoleBadge(u.role)}>{u.role}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="badge rounded-pill fw-medium" style={getStatutBadge(u.actif)}>
                        {u.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {u.actif ? (
                        <button
                          onClick={() => handleDesactiver(u.id)}
                          className="btn btn-sm fw-medium"
                          style={{
                            width: 32,
                            height: 32,
                            padding: 0,
                            borderRadius: 8,
                            border: '1px solid #ef4444',
                            backgroundColor: '#fef2f2',
                            color: '#ef4444',
                          }}
                          onMouseEnter={ev => { const b = ev.currentTarget; b.style.backgroundColor='#ef4444'; b.style.color='#fff'; }}
                          onMouseLeave={ev => { const b = ev.currentTarget; b.style.backgroundColor='#fef2f2'; b.style.color='#ef4444'; }}
                          title="Désactiver"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                          </svg>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactiver(u.id)}
                          className="btn btn-sm fw-medium"
                          style={{
                            width: 32,
                            height: 32,
                            padding: 0,
                            borderRadius: 8,
                            border: '1px solid #16a34a',
                            backgroundColor: '#f0faf4',
                            color: '#16a34a',
                          }}
                          onMouseEnter={ev => { const b = ev.currentTarget; b.style.backgroundColor='#16a34a'; b.style.color='#fff'; }}
                          onMouseLeave={ev => { const b = ev.currentTarget; b.style.backgroundColor='#f0faf4'; b.style.color='#16a34a'; }}
                          title="Réactiver"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          )}
        </div>

        <div className="text-center py-3" style={{ borderTop: '1px solid #f3f4f6', fontSize: 12, color: '#d1d5db' }}>
          © 2026 Al-Manard3s — Tous droits réservés
        </div>
      </div>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title="Nouvel utilisateur"
      >
        <UserForm onClose={handleCloseDrawer} />
      </Drawer>
    </div>
  );
}