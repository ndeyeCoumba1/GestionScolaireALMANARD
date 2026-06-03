import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import type { Eleve, Classe } from '../../Types/index';
import PageHeader from '../../components/Common/PageHeader';
import { SkeletonTable } from '../../components/Common/SkeletonLoader';
import { ConfirmModal } from '../../components/Common/ConfirmModal';
import Drawer from '../../components/Common/Drawer';
import EleveForm from './EleveForm';
import { useAuth } from '../../Context/AuthContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

  useEffect(() => {
    fetchEleves();
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      setClasses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEleves = async () => {
    setLoading(true);
    try {
      const res = await api.get('/eleves');
      const mappedData = res.data.map((item: any) => ({
        id: item.id,
        nom: item.nom,
        prenom: item.prenom,
        dateNaissance: item.dateNaissance,
        sexe: item.sexe,
        adresse: item.adresse,
        photoUrl: item.photoUrl,
        status: item.statut || item.status,
        matricule: item.matricule,
        // Classe
        classeId: item.classeId,
        classeNiveau: item.classeRegime || item.classe?.niveau || '',
        classeCapaciteMax: item.classeCapaciteMax || item.classe?.capaciteMax,
        // Parent
        parentId: item.parentId,
        parentNom: item.parentNom || item.parent?.nom || '',
        parentPrenom: item.parentPrenom || item.parent?.prenom || '',
        // Enseignant
        enseignantId: item.enseignantId,
        enseignantNom: item.enseignantNom || item.classe?.enseignant?.nom || '',
        enseignantPrenom: item.enseignantPrenom || item.classe?.enseignant?.prenom || '',
      }));
      setEleves(mappedData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setEleveToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!eleveToDelete) return;
    setDeletingId(eleveToDelete);
    try {
      await api.delete(`/eleves/${eleveToDelete}`);
      await fetchEleves();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
      setEleveToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setEleveToDelete(null);
  };

  const handleOpenDrawer = (eleveId?: number) => {
    setEditingEleveId(eleveId);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingEleveId(undefined);
    fetchEleves();
  };

  const filtered = eleves.filter(e =>
    `${e.nom} ${e.prenom} ${e.matricule || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate statistics
  const totalEleves = eleves.length;
  const inscrits = eleves.filter(e => e.status === 'INSCRIT').length;
  const garcons = eleves.filter(e => e.sexe === 'M').length;
  const filles = eleves.filter(e => e.sexe === 'F').length;

  // Calculate students by class
  const studentsByClass = classes.map(classe => ({
    name: classe.niveau,
    value: eleves.filter(e => e.classeNiveau === classe.niveau).length,
  })).filter(item => item.value > 0);

  // Calculate gender distribution
  const genderData = [
    { name: 'Garçons', value: garcons },
    { name: 'Filles', value: filles },
  ];

  return (
    <div className="d-flex flex-column gap-4">

      {/* ── Header ── */}
      <PageHeader
        subtitle="Gestion des élèves"
        title="🎓 Élèves"
        description="Consultez et gérez la liste des élèves inscrits dans votre établissement."
        countText={`${eleves.length} élève(s) au total`}
        action={
          role !== 'ENSEIGNANT' && (
            <button
              onClick={() => handleOpenDrawer()}
              className="btn fw-semibold d-flex align-items-center gap-2 px-4 py-2"
              style={{ backgroundColor: '#fff', color: '#1a5c38', borderRadius: 12, fontSize: 14 }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
              Nouvel Élève
            </button>
          )
        }
      />

      {/* ── Statistics Cards ── */}
      <div className="d-flex gap-3 flex-wrap">
        <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0', flex: '1 1 200px', minWidth: 200 }}>
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, backgroundColor: '#e8f5e9', fontSize: 24 }}>
              🎓
            </div>
            <div>
              <p className="text-muted mb-0" style={{ fontSize: 12, fontWeight: 500 }}>Total Élèves</p>
              <p className="fw-bold mb-0" style={{ fontSize: 24, color: '#1a5c38' }}>{totalEleves}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0', flex: '1 1 200px', minWidth: 200 }}>
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, backgroundColor: '#dbeafe', fontSize: 24 }}>
              ✅
            </div>
            <div>
              <p className="text-muted mb-0" style={{ fontSize: 12, fontWeight: 500 }}>Inscrits</p>
              <p className="fw-bold mb-0" style={{ fontSize: 24, color: '#1d4ed8' }}>{inscrits}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0', flex: '1 1 200px', minWidth: 200 }}>
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, backgroundColor: '#fef3c7', fontSize: 24 }}>
              👦
            </div>
            <div>
              <p className="text-muted mb-0" style={{ fontSize: 12, fontWeight: 500 }}>Garçons</p>
              <p className="fw-bold mb-0" style={{ fontSize: 24, color: '#d97706' }}>{garcons}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0', flex: '1 1 200px', minWidth: 200 }}>
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, backgroundColor: '#fce7f3', fontSize: 24 }}>
              👧
            </div>
            <div>
              <p className="text-muted mb-0" style={{ fontSize: 12, fontWeight: 500 }}>Filles</p>
              <p className="fw-bold mb-0" style={{ fontSize: 24, color: '#db2777' }}>{filles}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Charts Section ── */}
      <div className="d-flex gap-3 flex-wrap">
        <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0', flex: '1 1 400px', minWidth: 350 }}>
          <p className="fw-semibold mb-4" style={{ fontSize: 15, color: '#111827' }}>Répartition par Classe</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={studentsByClass}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}
                itemStyle={{ color: '#374151' }}
              />
              <Bar dataKey="value" fill="#1a5c38" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0', flex: '1 1 400px', minWidth: 350 }}>
          <p className="fw-semibold mb-4" style={{ fontSize: 15, color: '#111827' }}>Répartition par Sexe</p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {genderData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#d97706' : '#db2777'} />
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
      </div>
           

      {/* ── Table Card ── */}
      <div className="bg-white rounded-4 shadow-sm overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
        <div className="px-4 pt-4 pb-3">
          <p className="fw-semibold text-dark mb-3" style={{ fontSize: 15 }}>Liste des élèves</p>
          <div className="position-relative">
            <span className="position-absolute top-50 translate-middle-y text-muted" style={{ left: 14, pointerEvents: 'none' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
              </svg>
            </span>
            <input
              id="eleve-search"
              type="text"
              placeholder="Rechercher un élève (nom, prénom, matricule)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-control"
              style={{ paddingLeft: 38, paddingTop: 10, paddingBottom: 10, borderRadius: 12, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: 14, boxShadow: 'none' }}
            />
          </div>
        </div>

        <div className="table-responsive">
          {loading ? (
            <SkeletonTable rows={5} columns={7} />
          ) : (
            <table className="table align-middle mb-0" style={{ fontSize: 14 }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  {['Matricule', 'Nom', 'Prénom', 'Classe', 'Parent', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="py-4 px-4 fw-bold text-uppercase"
                      style={{ color: '#374151', fontSize: 14, letterSpacing: '0.05em', borderTop: '1px solid #f0f0f0' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-5 text-muted">{search ? 'Aucun élève trouvé.' : 'Aucun élève enregistré.'}</td></tr>
                ) : filtered.map(e => (
                <tr key={e.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                  <td className="py-3 px-4">
                    {e.matricule ? (
                      <span className="badge rounded-pill fw-medium d-flex align-items-center gap-1" 
                        style={{ 
                          backgroundColor: '#f3f4f6', 
                          color: '#374151', 
                          fontSize: 11, 
                          padding: '6px 10px',
                          fontFamily: 'monospace',
                          letterSpacing: '0.5px'
                        }}>
                        🆔 {e.matricule}
                      </span>
                    ) : (
                      <span style={{ color: '#9ca3af', fontSize: 12 }}>—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 fw-semibold" style={{ color: '#111827' }}>{e.nom}</td>
                  <td className="py-3 px-4" style={{ color: '#374151' }}>{e.prenom}</td>
                  <td className="py-3 px-4">
                    {e.classeNiveau
                      ? <span className="badge rounded-pill fw-medium" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', fontSize: 12, padding: '5px 10px' }}>{e.classeNiveau}</span>
                      : <span style={{ color: '#9ca3af' }}>—</span>
                    }
                  </td>
                  <td className="py-3 px-4" style={{ color: '#9ca3af' }}>{e.parentNom || '—'}</td>
                  <td className="py-3 px-4">
                    <span
                      className="badge rounded-pill fw-medium"
                      style={{
                        backgroundColor: e.status === 'INSCRIT' ? '#dcfce7' : '#ffedd5',
                        color: e.status === 'INSCRIT' ? '#166534' : '#9a3412',
                        fontSize: 12,
                        padding: '5px 10px',
                      }}
                    >
                      {e.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="d-flex align-items-center gap-2">
                      <button
                        onClick={() => navigate(`/eleves/${e.id}`)}
                        title="Voir"
                        className="btn btn-sm d-flex align-items-center justify-content-center"
                        style={{ width: 32, height: 32, padding: 0, borderRadius: 8, border: '1px solid #3b82f6', backgroundColor: '#eff6ff', color: '#3b82f6' }}
                        onMouseEnter={ev => { const b = ev.currentTarget; b.style.backgroundColor='#3b82f6'; b.style.color='#fff'; }}
                        onMouseLeave={ev => { const b = ev.currentTarget; b.style.backgroundColor='#eff6ff'; b.style.color='#3b82f6'; }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      </button>
                      {role !== 'ENSEIGNANT' && (
                        <>
                          <button
                            onClick={() => handleOpenDrawer(e.id)}
                            title="Modifier"
                            className="btn btn-sm d-flex align-items-center justify-content-center"
                            style={{ width: 32, height: 32, padding: 0, borderRadius: 8, border: '1px solid #16a34a', backgroundColor: '#f0faf4', color: '#16a34a' }}
                            onMouseEnter={ev => { const b = ev.currentTarget; b.style.backgroundColor='#16a34a'; b.style.color='#fff'; }}
                            onMouseLeave={ev => { const b = ev.currentTarget; b.style.backgroundColor='#f0faf4'; b.style.color='#16a34a'; }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 0110 16.414H8v-2a2 2 0 01.586-1.414z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(e.id)}
                            disabled={deletingId === e.id}
                            title="Supprimer"
                            className="btn btn-sm d-flex align-items-center justify-content-center"
                            style={{ width: 32, height: 32, padding: 0, borderRadius: 8, border: '1px solid #ef4444', backgroundColor: '#fef2f2', color: '#ef4444', opacity: deletingId === e.id ? 0.4 : 1 }}
                            onMouseEnter={ev => { const b = ev.currentTarget; b.style.backgroundColor='#ef4444'; b.style.color='#fff'; }}
                            onMouseLeave={ev => { const b = ev.currentTarget; b.style.backgroundColor='#fef2f2'; b.style.color='#ef4444'; }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 01-1-1V5a1 1 0 011-1h6a1 1 0 011 1v1a1 1 0 01-1 1H9z"/>
                            </svg>
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

        <div className="text-center py-3" style={{ borderTop: '1px solid #f3f4f6', fontSize: 12, color: '#d1d5db' }}>
          © 2026 Al-Manard3s — Tous droits réservés
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Supprimer l'élève"
        message="Êtes-vous sûr de vouloir supprimer cet élève ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />

      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={editingEleveId ? 'Modifier l\'élève' : 'Nouvel élève'}
      >
        <EleveForm onClose={handleCloseDrawer} eleveId={editingEleveId} />
      </Drawer>
    </div>
  );
}
