import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import type { Eleve, Classe } from '../../Types/index';
import { SkeletonTable } from '../../components/Common/SkeletonLoader';
import { ConfirmModal } from '../../components/Common/ConfirmModal';
import Drawer from '../../components/Common/Drawer';
import EleveForm from './EleveForm';
import { useAuth } from '../../Context/AuthContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PageBanner, BannerBtn, KpiCard, SearchBar, TableHead, TableFooter, EmptyState, ROW_STYLE, TD, avatarColor, initials } from '../../components/Common/ListLayout';

export default function EleveList() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eleveToDelete, setEleveToDelete] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingEleveId, setEditingEleveId] = useState<number | undefined>();

  useEffect(() => { fetchEleves(); fetchClasses(); }, []);

  const fetchClasses = async () => { try { const res = await api.get('/classes'); setClasses(res.data); } catch {} };

  const fetchEleves = async () => {
    setLoading(true);
    try {
      const res = await api.get('/eleves');
      setEleves(res.data.map((item: any) => ({
        id: item.id, nom: item.nom, prenom: item.prenom, dateNaissance: item.dateNaissance,
        sexe: item.sexe, adresse: item.adresse, status: item.statut || item.status,
        matricule: item.matricule, classeId: item.classeId,
        classeNiveau: item.classeRegime || item.classe?.niveau || '',
        parentId: item.parentId, parentNom: item.parentNom || item.parent?.nom || '',
        parentPrenom: item.parentPrenom || item.parent?.prenom || '',
        photoUrl: item.photoUrl || '',
      })));
    } catch {} finally { setLoading(false); }
  };

  const handleDelete  = (id: number) => { setEleveToDelete(id); setShowDeleteModal(true); };
  const confirmDelete = async () => {
    if (!eleveToDelete) return; setDeletingId(eleveToDelete);
    try { await api.delete(`/eleves/${eleveToDelete}`); await fetchEleves(); }
    catch {} finally { setDeletingId(null); setShowDeleteModal(false); setEleveToDelete(null); }
  };
  const handleOpenDrawer  = (id?: number) => { setEditingEleveId(id); setIsDrawerOpen(true); };
  const handleCloseDrawer = () => { setIsDrawerOpen(false); setEditingEleveId(undefined); fetchEleves(); };

  const filtered   = eleves.filter(e => `${e.nom} ${e.prenom} ${e.matricule ?? ''}`.toLowerCase().includes(search.toLowerCase()));
  const garcons    = eleves.filter(e => e.sexe === 'M').length;
  const filles     = eleves.filter(e => e.sexe === 'F').length;
  const inscrits   = eleves.filter(e => e.status === 'INSCRIT').length;
  const byClass    = classes.map(c => ({ name: c.niveau, value: eleves.filter(e => e.classeNiveau === c.niveau).length })).filter(d => d.value > 0);
  const genderData = [{ name: 'Garçons', value: garcons }, { name: 'Filles', value: filles }];

  return (
    <div className="d-flex flex-column gap-4" style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>

      <PageBanner icon="🎓" subtitle="Portail Français — Scolarité" title="Élèves" count={`${eleves.length} élève${eleves.length !== 1 ? 's' : ''} enregistré${eleves.length !== 1 ? 's' : ''}`}
        action={role !== 'ENSEIGNANT' ? <BannerBtn label="Nouvel Élève" onClick={() => handleOpenDrawer()} /> : undefined} />

      <div className="row g-3">
        <KpiCard icon="🎓" label="Total élèves"  value={eleves.length} sub="inscrits dans l'établissement" accent="#0A6E3F" bg="#f0fdf4" borderLeft="#22c55e" />
        <KpiCard icon="✅" label="Inscrits"        value={inscrits}       sub={`${eleves.length - inscrits} non inscrits`} accent="#1d4ed8" bg="#eff6ff" borderLeft="#3b82f6" />
        <KpiCard icon="👦" label="Garçons"         value={garcons}        sub={`${eleves.length > 0 ? Math.round(garcons / eleves.length * 100) : 0}% de l'effectif`} accent="#d97706" bg="#fffbeb" borderLeft="#f59e0b" />
        <KpiCard icon="👧" label="Filles"          value={filles}         sub={`${eleves.length > 0 ? Math.round(filles / eleves.length * 100) : 0}% de l'effectif`} accent="#db2777" bg="#fdf2f8" borderLeft="#ec4899" />
      </div>

      <div className="row g-3">
        <div className="col-12 col-md-6">
          <div className="bg-white rounded-4 shadow-sm p-4 h-100" style={{ border: '1px solid #f0f0f0' }}>
            <div className="d-flex align-items-center justify-content-between mb-1">
              <p className="fw-bold mb-0" style={{ fontSize: 14, color: '#111827' }}>Répartition par classe</p>
              <span style={{ fontSize: 11, color: '#9ca3af' }}>{byClass.length} classe{byClass.length !== 1 ? 's' : ''}</span>
            </div>
            <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 12 }}>Nombre d'élèves par niveau</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byClass} margin={{ left: -10, right: 8 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 12 }} />
                <Bar dataKey="value" name="Élèves" fill="#0A6E3F" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="bg-white rounded-4 shadow-sm p-4 h-100" style={{ border: '1px solid #f0f0f0' }}>
            <div className="d-flex align-items-center justify-content-between mb-1">
              <p className="fw-bold mb-0" style={{ fontSize: 14, color: '#111827' }}>Répartition par sexe</p>
              <span style={{ fontSize: 11, color: '#9ca3af' }}>Garçons · Filles</span>
            </div>
            <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 12 }}>Distribution de l'effectif</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={genderData} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value">
                  <Cell fill="#d97706" /><Cell fill="#db2777" />
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-4 shadow-sm overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
        <div style={{ padding: '20px 24px 0' }}>
          <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap mb-4">
            <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un élève (nom, prénom, matricule)…" width={300} />
            <span style={{ fontSize: 12, color: '#6b7280' }}><span style={{ fontWeight: 700, color: '#111827' }}>{filtered.length}</span> résultat{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div style={{ padding: '0 24px 24px' }}><SkeletonTable rows={6} columns={6} /></div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <TableHead cols={[{ label: 'Élève' }, { label: 'Classe' }, { label: 'Parent' }, { label: 'Sexe' }, { label: 'Statut' }, { label: 'Actions' }]} />
              <tbody>
                {filtered.length === 0 ? (
                  <EmptyState icon="🔍" title={search ? 'Aucun résultat trouvé' : 'Aucun élève enregistré'} sub={search ? `Aucun élève ne correspond à « ${search} »` : 'Les élèves apparaîtront ici une fois ajoutés.'} />
                ) : filtered.map(e => (
                  <tr key={e.id} style={ROW_STYLE} onMouseEnter={ev => (ev.currentTarget.style.backgroundColor = '#fafafa')} onMouseLeave={ev => (ev.currentTarget.style.backgroundColor = 'transparent')}>
                    <td style={TD}>
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, overflow: 'hidden', backgroundColor: avatarColor(e.id), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', border: e.photoUrl ? '2px solid #e5e7eb' : 'none' }}>
                          {e.photoUrl
                            ? <img src={e.photoUrl} alt={e.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : initials(e.nom, e.prenom)}
                        </div>
                        <div>
                          {e.matricule && (
                            <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#0A6E3F', backgroundColor: '#f0fdf4', borderRadius: 4, padding: '1px 6px', marginBottom: 3, display: 'inline-block', fontWeight: 700, letterSpacing: '0.03em' }}>
                              {e.matricule}
                            </div>
                          )}
                          <div style={{ fontWeight: 600, color: '#111827', fontSize: 13 }}>{e.nom} {e.prenom}</div>
                          {e.parentNom && <div style={{ fontSize: 10, color: '#9ca3af' }}>Parent : {e.parentPrenom} {e.parentNom}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={TD}>
                      {e.classeNiveau
                        ? <span style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 600 }}>{e.classeNiveau}</span>
                        : <span style={{ color: '#9ca3af' }}>—</span>}
                    </td>
                    <td style={{ ...TD, color: '#6b7280', fontSize: 12 }}>{e.parentNom ? `${e.parentPrenom ?? ''} ${e.parentNom}`.trim() : '—'}</td>
                    <td style={TD}>
                      <span style={{ fontSize: 13, color: e.sexe === 'M' ? '#1d4ed8' : '#db2777' }}>{e.sexe === 'M' ? '♂ Masculin' : '♀ Féminin'}</span>
                    </td>
                    <td style={TD}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: e.status === 'INSCRIT' ? '#f0fdf4' : '#fff7ed', color: e.status === 'INSCRIT' ? '#16a34a' : '#c2410c', border: `1px solid ${e.status === 'INSCRIT' ? '#bbf7d0' : '#fed7aa'}`, borderRadius: 20, padding: '4px 11px', fontSize: 11, fontWeight: 600 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: e.status === 'INSCRIT' ? '#22c55e' : '#f97316', flexShrink: 0 }} />
                        {e.status}
                      </span>
                    </td>
                    <td style={TD}>
                      <div className="d-flex align-items-center gap-1">
                        <button onClick={() => navigate(`/eleves/${e.id}`)} title="Voir" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#3b82f6" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        </button>
                        {role !== 'ENSEIGNANT' && (
                          <>
                            <button onClick={() => handleOpenDrawer(e.id)} title="Modifier" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #bbf7d0', backgroundColor: '#f0fdf4', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 0110 16.414H8v-2a2 2 0 01.586-1.414z"/></svg>
                            </button>
                            <button onClick={() => handleDelete(e.id)} disabled={deletingId === e.id} title="Supprimer" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #fecaca', backgroundColor: '#fef2f2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: deletingId === e.id ? 0.4 : 1 }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 01-1-1V5a1 1 0 011-1h6a1 1 0 011 1v1a1 1 0 01-1 1H9z"/></svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <TableFooter right={`${filtered.length} / ${eleves.length} élèves`} />
      </div>

      <ConfirmModal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setEleveToDelete(null); }} onConfirm={confirmDelete} title="Supprimer l'élève" message="Êtes-vous sûr de vouloir supprimer cet élève ? Cette action est irréversible." confirmText="Supprimer" cancelText="Annuler" variant="danger" />
      <Drawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} title={editingEleveId ? "Modifier l'élève" : 'Nouvel élève'}><EleveForm onClose={handleCloseDrawer} eleveId={editingEleveId} /></Drawer>
    </div>
  );
}
