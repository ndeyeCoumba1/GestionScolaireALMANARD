import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { User } from '../../Types/index';
import { SkeletonTable } from '../../components/Common/SkeletonLoader';
import Drawer from '../../components/Common/Drawer';
import UserForm from './UserForm';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PageBanner, BannerBtn, KpiCard, TableHead, TableFooter, EmptyState, ROW_STYLE, TD, avatarColor, initials } from '../../components/Common/ListLayout';

const ROLE_CFG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  ADMIN:      { label: 'Administrateur', bg: '#f5f3ff', color: '#7c3aed', border: '#c4b5fd' },
  COMPTABLE:  { label: 'Comptable',      bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  ENSEIGNANT: { label: 'Enseignant',     bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
  RECITATEUR: { label: 'Récitateur',     bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
};
const COLORS = ['#0A6E3F','#1d4ed8','#7c3aed','#d97706'];

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try { const res = await api.get('/users'); setUsers(res.data); }
    finally { setLoading(false); }
  };

  const handleCloseDrawer = () => { setIsDrawerOpen(false); fetchUsers(); };
  const handleDesactiver  = async (id: number) => { await api.put(`/users/${id}/desactiver`); fetchUsers(); };
  const handleReactiver   = async (id: number) => { await api.put(`/users/${id}/reactiver`); fetchUsers(); };

  const actifs   = users.filter(u => u.actif).length;
  const inactifs = users.filter(u => !u.actif).length;
  const roleData = Object.entries(users.reduce((acc: Record<string, number>, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {})).map(([name, value]) => ({ name, value }));

  return (
    <div className="d-flex flex-column gap-4" style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>

      <PageBanner icon="👤" subtitle="Portail Français — Administration" title="Utilisateurs"
        count={`${users.length} utilisateur${users.length !== 1 ? 's' : ''} au total`}
        action={<BannerBtn label="Nouvel Utilisateur" onClick={() => setIsDrawerOpen(true)} />} />

      <div className="row g-3">
        <KpiCard icon="👥" label="Total utilisateurs" value={users.length}  sub="comptes enregistrés" accent="#0A6E3F" bg="#f0fdf4" borderLeft="#22c55e" />
        <KpiCard icon="✅" label="Actifs"              value={actifs}        sub="comptes actifs" accent="#1d4ed8" bg="#eff6ff" borderLeft="#3b82f6" />
        <KpiCard icon="⏸️" label="Inactifs"            value={inactifs}      sub="comptes désactivés" accent="#6b7280" bg="#f9fafb" borderLeft="#9ca3af" />
        <KpiCard icon="🏷️" label="Rôles distincts"     value={roleData.length} sub="types de profils" accent="#d97706" bg="#fffbeb" borderLeft="#f59e0b" />
      </div>

      <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0' }}>
        <div className="d-flex align-items-center justify-content-between mb-1">
          <p className="fw-bold mb-0" style={{ fontSize: 14, color: '#111827' }}>Répartition par rôle</p>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>{users.length} total</span>
        </div>
        <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 12 }}>Distribution des profils utilisateurs</p>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={roleData} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value">
              {roleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-4 shadow-sm overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
        <div style={{ padding: '20px 24px 12px' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}><span style={{ fontWeight: 700, color: '#111827' }}>{users.length}</span> utilisateur{users.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div style={{ padding: '0 24px 24px' }}><SkeletonTable rows={5} columns={5} /></div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <TableHead cols={[{ label: 'Utilisateur' }, { label: 'Email' }, { label: 'Rôle' }, { label: 'Statut' }, { label: 'Actions' }]} />
              <tbody>
                {users.length === 0 ? (
                  <EmptyState icon="👤" title="Aucun utilisateur enregistré" />
                ) : users.map(u => {
                  const roleCfg = ROLE_CFG[u.role] ?? { label: u.role, bg: '#f3f4f6', color: '#374151', border: '#e5e7eb' };
                  return (
                    <tr key={u.id} style={ROW_STYLE} onMouseEnter={ev => (ev.currentTarget.style.backgroundColor = '#fafafa')} onMouseLeave={ev => (ev.currentTarget.style.backgroundColor = 'transparent')}>
                      <td style={TD}>
                        <div className="d-flex align-items-center gap-2">
                          <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, backgroundColor: avatarColor(u.id), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
                            {initials(u.nom, u.prenom)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#111827', fontSize: 13 }}>{u.nom} {u.prenom}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ ...TD, color: '#6b7280', fontSize: 12 }}>{u.email}</td>
                      <td style={TD}>
                        <span style={{ backgroundColor: roleCfg.bg, color: roleCfg.color, border: `1px solid ${roleCfg.border}`, borderRadius: 20, padding: '4px 11px', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: roleCfg.color, flexShrink: 0 }} />
                          {roleCfg.label}
                        </span>
                      </td>
                      <td style={TD}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: u.actif ? '#f0fdf4' : '#f9fafb', color: u.actif ? '#16a34a' : '#6b7280', border: `1px solid ${u.actif ? '#bbf7d0' : '#e5e7eb'}`, borderRadius: 20, padding: '4px 11px', fontSize: 11, fontWeight: 600 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: u.actif ? '#22c55e' : '#9ca3af', flexShrink: 0 }} />
                          {u.actif ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td style={TD}>
                        {u.actif ? (
                          <button onClick={() => handleDesactiver(u.id)} title="Désactiver" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #fecaca', backgroundColor: '#fef2f2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
                          </button>
                        ) : (
                          <button onClick={() => handleReactiver(u.id)} title="Réactiver" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #bbf7d0', backgroundColor: '#f0fdf4', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <TableFooter right={`${users.length} utilisateurs`} />
      </div>

      <Drawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} title="Nouvel utilisateur"><UserForm onClose={handleCloseDrawer} /></Drawer>
    </div>
  );
}
