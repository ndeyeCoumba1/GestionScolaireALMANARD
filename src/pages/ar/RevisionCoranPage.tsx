import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { Eleve, Classe } from '../../Types/index';
import { SOURATES } from '../../services/coranService';
import coranService from '../../services/coranService';
import type { SeanceRevisionResponse } from '../../Types/coran';
import { SkeletonTable } from '../../components/Common/SkeletonLoader';
import { ConfirmModal } from '../../components/Common/ConfirmModal';
import toast from 'react-hot-toast';
import { useAuth } from '../../Context/AuthContext';

interface RevisionRow {
  present: boolean;
  sourateNumero: number;
  versetDebut: number;
  versetFin: number;
  commentaire: string;
  enseignantId: number | '';
}

const translateNiveau = (niveau: string) => {
  const map: Record<string, string> = {
    INTERNAT: 'داخلي',
    EXTERNAT: 'خارجي',
    DEMI_PENSION: 'نصف داخلي',
  };
  return map[niveau] ?? niveau;
};

export default function RevisionCoranPage() {
  const { role, nom, prenom, userId } = useAuth();
  const [activeTab, setActiveTab] = useState<'saisie' | 'historique'>('saisie');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClasse, setSelectedClasse] = useState<number | ''>('');
  const [selectedEnseignant, setSelectedEnseignant] = useState<number | ''>('');
  const [selectedEnseignantClasse, setSelectedEnseignantClasse] = useState<number | ''>('');
  const [classes, setClasses] = useState<Classe[]>([]);
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [enseignants, setEnseignants] = useState<any[]>([]);
  const [rows, setRows] = useState<Record<number, RevisionRow>>({});
  const [numeroSeance, setNumeroSeance] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [dernieresRevisions, setDernieresRevisions] = useState<SeanceRevisionResponse[]>([]);
  const [historique, setHistorique] = useState<SeanceRevisionResponse[]>([]);
  const [recentesSeances, setRecentesSeances] = useState<any[]>([]);
  const [loadingRecentes, setLoadingRecentes] = useState(false);
  const [loadingHisto, setLoadingHisto] = useState(false);
  const [histoDateDebut, setHistoDateDebut] = useState('');
  const [histoDateFin, setHistoDateFin] = useState('');
  const [elevesMap, setElevesMap] = useState<Record<number, string>>({});
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    fetchClasses();
    fetchEnseignants();
  }, []);

  useEffect(() => {
    if (classes.length > 0) fetchRecentesSeances();
  }, [classes]); // eslint-disable-line

  const fetchRecentesSeances = async () => {
    setLoadingRecentes(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const dateDebut = weekAgo.toISOString().split('T')[0];

      const results = await Promise.allSettled(
        classes.map(c => coranService.getRevisionsByClasse(c.id, dateDebut, today))
      );
      const all: SeanceRevisionResponse[] = results
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => (r as PromiseFulfilledResult<SeanceRevisionResponse[]>).value);

      const map = new Map<string, { date: string; classeNiveau: string; enseignantNom: string; numeroSeance: number; count: number }>();
      all.forEach(rv => {
        const num = rv.numeroSeance ?? 1;
        const key = `${rv.date}_${rv.classeId}_${rv.enseignantId}_${num}`;
        if (!map.has(key)) {
          map.set(key, { date: rv.date, classeNiveau: rv.classeNiveau, enseignantNom: rv.enseignantNom, numeroSeance: num, count: 0 });
        }
        map.get(key)!.count++;
      });

      const seances = Array.from(map.values())
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

      setRecentesSeances(seances);
    } catch {
      // silently ignore
    } finally {
      setLoadingRecentes(false);
    }
  };

  useEffect(() => {
    if (selectedClasse) fetchEleves(Number(selectedClasse));
  }, [selectedClasse]);

  useEffect(() => {
    const init: Record<number, RevisionRow> = {};
    eleves.forEach(e => {
      init[e.id] = { present: true, sourateNumero: 1, versetDebut: 0, versetFin: 0, commentaire: '', enseignantId: selectedEnseignantClasse };
    });
    setRows(init);
  }, [eleves]); // eslint-disable-line

  useEffect(() => {
    if (Object.keys(rows).length === 0) return;
    setRows(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(id => {
        updated[Number(id)] = { ...updated[Number(id)], enseignantId: selectedEnseignantClasse };
      });
      return updated;
    });
  }, [selectedEnseignantClasse]); // eslint-disable-line

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      setClasses(res.data);
    } catch {}
  };

  const fetchEnseignants = async () => {
    let effectiveUserId = userId;
    if (role === 'RECITATEUR' && !effectiveUserId) {
      try {
        const meRes = await api.get('/auth/me');
        const id = meRes.data?.id ?? meRes.data?.userId ?? null;
        if (id) {
          effectiveUserId = Number(id);
          localStorage.setItem('userId', String(effectiveUserId));
        }
      } catch {}
    }
    try {
      const res = await api.get('/users/enseignants');
      setEnseignants(res.data);
    } catch {}
    if (role === 'RECITATEUR' && effectiveUserId) {
      setSelectedEnseignant(effectiveUserId);
    }
  };

  const fetchEleves = async (classeId: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/eleves/classe/${classeId}`);
      setEleves(res.data);
      const map: Record<number, string> = {};
      res.data.forEach((e: any) => { map[e.id] = e.matricule || ''; });
      setElevesMap(map);
      if (res.data.length === 0) toast('لا يوجد طلاب في هذا الفصل', { icon: '⚠️' });
    } catch {
      toast.error('خطأ في تحميل الطلاب');
      setEleves([]);
    } finally {
      setLoading(false);
    }
  };

  const updateRow = (eleveId: number, patch: Partial<RevisionRow>) => {
    setRows(prev => ({ ...prev, [eleveId]: { ...prev[eleveId], ...patch } }));
  };

  const marquerTousPresents = () => {
    setRows(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(id => { updated[Number(id)] = { ...updated[Number(id)], present: true }; });
      return updated;
    });
  };

  const handleEnregistrer = async () => {
    if (!selectedClasse) { toast.error('يرجى اختيار فصل'); return; }
    if (!date) { toast.error('يرجى اختيار تاريخ'); return; }

    const presents = eleves.filter(e => rows[e.id]?.present);
    if (presents.length === 0) { toast.error('لا يوجد طلاب حاضرون'); return; }

    setSaveResult(null);
    setDernieresRevisions([]);
    setSaving(true);
    let errCount = 0;
    const savedRevisions: SeanceRevisionResponse[] = [];
    for (const eleve of presents) {
      const row = rows[eleve.id];
      const sourate = SOURATES.find(s => s.numero === row.sourateNumero);
      try {
        const ensId = row.enseignantId || selectedEnseignantClasse;
        if (!ensId) { errCount++; continue; }
        const res = await coranService.enregistrerRevision({
          date,
          eleveId: eleve.id,
          classeId: Number(selectedClasse),
          enseignantId: Number(ensId),
          numeroSeance,
          sourateNumero: row.sourateNumero,
          sourateNom: sourate?.nomFrancais || '',
          sourateNomArabe: sourate?.nomArabe || '',
          versetRevisionDebut: row.versetDebut,
          versetRevisionFin: row.versetFin,
          commentaire: row.commentaire || undefined,
        });
        savedRevisions.push(res);
      } catch {
        errCount++;
      }
    }
    setSaving(false);
    if (errCount === 0) {
      setSaveResult({ type: 'success', message: `تم تسجيل ${presents.length} مراجعة بنجاح!` });
      setDernieresRevisions(savedRevisions);
      fetchRecentesSeances();
      setSelectedClasse('');
      setEleves([]);
    } else {
      setSaveResult({ type: 'error', message: `${errCount} خطأ من أصل ${presents.length} طالب. تحقق من البيانات.` });
      if (savedRevisions.length > 0) setDernieresRevisions(savedRevisions);
    }
  };

  const fetchHistorique = async () => {
    if (!selectedClasse) { toast.error('اختر فصلاً'); return; }
    setLoadingHisto(true);
    try {
      const data = await coranService.getRevisionsByClasse(
        Number(selectedClasse),
        histoDateDebut || undefined,
        histoDateFin || undefined,
      );
      setHistorique(data);
      if (data.length === 0) toast('لا توجد مراجعات', { icon: 'ℹ️' });
    } catch {
      toast.error('خطأ في تحميل السجل');
    } finally {
      setLoadingHisto(false);
    }
  };

  const handleSupprimer = (id: number) => { setDeleteId(id); };

  const confirmSupprimer = async () => {
    if (deleteId === null) return;
    try {
      await coranService.supprimerRevision(deleteId);
      setHistorique(prev => prev.filter(r => r.id !== deleteId));
      toast.success('تم حذف المراجعة');
    } catch {
      toast.error('خطأ في الحذف');
    } finally {
      setDeleteId(null);
    }
  };

  if (role === 'COMPTABLE') {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-muted">غير مصرح بالوصول</div>
      </div>
    );
  }

  const inputStyle = {
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
    fontSize: 12,
    padding: '4px 8px',
  } as const;

  const canDelete = role === 'ADMIN' || role === 'ENSEIGNANT' || role === 'RECITATEUR';

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header */}
      <div className="rounded-4 p-5 position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a3a6e 0%, #2563eb 100%)' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: 180, width: 160, height: 160, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', top: 20, right: 120, width: 80, height: 80, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }} />
        <div className="position-relative d-flex align-items-center gap-4">
          <div style={{ width: 64, height: 64, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0 }}>
            🔁
          </div>
          <div>
            <h1 className="fw-bold mb-1" style={{ fontSize: 26, color: '#ffffff' }}>مراجعة حفظ القرآن الكريم</h1>
            <p className="mb-0" style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>سجّل الآيات التي راجعها كل طالب</p>
          </div>
        </div>
      </div>

      {/* Tabs + Filtres */}
      <div className="rounded-4" style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 16px rgba(37,99,235,0.08)', border: '1px solid #dbeafe' }}>
        <div className="d-flex border-bottom px-4">
          {(['saisie', 'historique'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="btn border-0 px-4 py-3 fw-semibold"
              style={{
                fontSize: 14,
                borderRadius: 0,
                borderBottom: activeTab === tab ? '2px solid #2563eb' : '2px solid transparent',
                color: activeTab === tab ? '#2563eb' : '#6b7280',
                backgroundColor: 'transparent',
              }}
            >
              {tab === 'saisie' ? '✏️ الإدخال' : '📚 السجل'}
            </button>
          ))}
        </div>

        <form className="p-4" onSubmit={e => e.preventDefault()}>
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-2">
              <label className="form-label fw-semibold text-uppercase" style={{ fontSize: 11, color: '#6b7280' }}>التاريخ</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="form-control" style={{ borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: 14 }} />
            </div>

            <div className="col-12 col-md-2">
              <label className="form-label fw-semibold text-uppercase" style={{ fontSize: 11, color: '#6b7280' }}>الفصل</label>
              <select value={selectedClasse} onChange={e => setSelectedClasse(e.target.value ? Number(e.target.value) : '')} className="form-select" style={{ borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: 14 }}>
                <option value="">اختر الفصل</option>
                {classes.map(c => <option key={c.id} value={c.id}>{translateNiveau(c.niveau)}</option>)}
              </select>
            </div>

            <div className="col-12 col-md-2">
              <label className="form-label fw-semibold text-uppercase" style={{ fontSize: 11, color: '#6b7280' }}>المسمع</label>
              {role === 'RECITATEUR' ? (
                <div className="form-control d-flex align-items-center gap-2" style={{ borderRadius: 8, border: '1px solid #d1fae5', backgroundColor: '#f0fdf4', fontSize: 14, color: '#0A6E3F', fontWeight: 600 }}>
                  <span>🎧</span>
                  <span>
                    {enseignants.find((e: any) => e.id === selectedEnseignant)
                      ? `${enseignants.find((e: any) => e.id === selectedEnseignant).prenom || ''} ${enseignants.find((e: any) => e.id === selectedEnseignant).nom || ''}`.trim()
                      : `${prenom || ''} ${nom || ''}`.trim() || 'المسمع المتصل'}
                  </span>
                </div>
              ) : (
                <select value={selectedEnseignant} onChange={e => setSelectedEnseignant(e.target.value ? Number(e.target.value) : '')} className="form-select" style={{ borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: 14 }}>
                  <option value="">اختر المسمع</option>
                  {enseignants.filter((e: any) => e.role === 'RECITATEUR').map((e: any) => (
                    <option key={e.id} value={e.id}>🎧 {e.prenomArabe || e.prenom} {e.nomArabe || e.nom}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="col-12 col-md-3">
              <label className="form-label fw-semibold text-uppercase" style={{ fontSize: 11, color: '#6b7280' }}>👨‍🏫 المعلم</label>
              <select value={selectedEnseignantClasse} onChange={e => setSelectedEnseignantClasse(e.target.value ? Number(e.target.value) : '')} className="form-select" style={{ borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: 14 }}>
                <option value="">اختر المعلم</option>
                {enseignants.filter((e: any) => e.role === 'ENSEIGNANT' || e.role === 'ADMIN').map((e: any) => (
                  <option key={e.id} value={e.id}>👨‍🏫 {e.prenomArabe || e.prenom} {e.nomArabe || e.nom}</option>
                ))}
              </select>
            </div>

            {activeTab === 'saisie' && (
              <div className="col-12 col-md-2">
                <label className="form-label fw-semibold text-uppercase" style={{ fontSize: 11, color: '#6b7280' }}>رقم الجلسة</label>
                <input type="number" min={1} value={numeroSeance} onChange={e => setNumeroSeance(Math.max(1, Number(e.target.value)))} className="form-control" style={{ borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: 14 }} />
              </div>
            )}

            {activeTab === 'historique' && (
              <>
                <div className="col-12 col-md-2">
                  <label className="form-label fw-semibold text-uppercase" style={{ fontSize: 11, color: '#6b7280' }}>من</label>
                  <input type="date" value={histoDateDebut} onChange={e => setHistoDateDebut(e.target.value)} className="form-control" style={{ borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: 14 }} />
                </div>
                <div className="col-12 col-md-2">
                  <label className="form-label fw-semibold text-uppercase" style={{ fontSize: 11, color: '#6b7280' }}>إلى</label>
                  <input type="date" value={histoDateFin} onChange={e => setHistoDateFin(e.target.value)} className="form-control" style={{ borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: 14 }} />
                </div>
                <div className="col-12 col-md-1 d-flex align-items-end">
                  <button onClick={fetchHistorique} className="btn w-100 fw-semibold text-white" style={{ backgroundColor: '#0A6E3F', borderRadius: 8, border: 'none', fontSize: 14, padding: '0.5rem' }}>
                    🔍
                  </button>
                </div>
              </>
            )}
          </div>
        </form>
      </div>

      {/* TAB SAISIE */}
      {activeTab === 'saisie' && selectedClasse && (
        <>
          <div className="rounded-4 overflow-hidden" style={{ boxShadow: '0 2px 16px rgba(37,99,235,0.08)', border: '1px solid #dbeafe' }}>
            <div className="p-4 d-flex justify-content-between align-items-center" style={{ background: 'linear-gradient(90deg, #eff6ff 0%, #ffffff 100%)', borderBottom: '1px solid #dbeafe' }}>
              <div className="d-flex align-items-center gap-2">
                <div style={{ width: 4, height: 20, backgroundColor: '#2563eb', borderRadius: 2 }} />
                <h5 className="fw-bold mb-0" style={{ fontSize: 16, color: '#1d4ed8' }}>قائمة الطلاب</h5>
              </div>
              <button onClick={marquerTousPresents} className="btn btn-sm fw-medium" style={{ backgroundColor: '#2563eb', color: '#fff', borderRadius: 8, border: 'none' }}>
                ✅ تعليم الكل حاضرين
              </button>
            </div>
            <div className="table-responsive">
              {loading ? (
                <SkeletonTable rows={5} columns={8} />
              ) : (
                <table className="table align-middle mb-0" style={{ fontSize: 13 }}>
                  <thead style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                    <tr>
                      <th className="py-3 px-2 fw-bold text-uppercase text-center" style={{ color: '#374151', fontSize: 11 }}>الحضور</th>
                      <th className="py-3 px-2 fw-bold text-uppercase text-center" style={{ color: '#374151', fontSize: 11 }}>رقم التعريف</th>
                      <th className="py-3 px-2 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 11 }}>الاسم</th>
                      <th className="py-3 px-2 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 11 }}>اللقب</th>
                      <th className="py-3 px-2 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 11 }}>المعلم</th>
                      <th className="py-3 px-2 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 11 }}>السورة المراجَعة</th>
                      <th className="py-3 px-2 fw-bold text-uppercase text-center" style={{ color: '#374151', fontSize: 11 }}>آية البداية</th>
                      <th className="py-3 px-2 fw-bold text-uppercase text-center" style={{ color: '#374151', fontSize: 11 }}>آية النهاية</th>
                      <th className="py-3 px-2 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 11 }}>ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eleves.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-5 text-muted">
                          اختر فصلاً لتحميل الطلاب
                        </td>
                      </tr>
                    ) : (
                      eleves.map(eleve => {
                        const row = rows[eleve.id] ?? { present: true, sourateNumero: 1, versetDebut: 0, versetFin: 0, commentaire: '', enseignantId: selectedEnseignantClasse };
                        const isAbsent = !row.present;
                        const sourate = SOURATES.find(s => s.numero === row.sourateNumero);
                        const maxV = sourate?.nombreVersets ?? 286;
                        return (
                          <tr key={eleve.id} style={{ backgroundColor: isAbsent ? '#f9fafb' : 'transparent', opacity: isAbsent ? 0.6 : 1 }}>
                            <td className="py-2 px-2 text-center" style={{ verticalAlign: 'middle' }}>
                              <input type="checkbox" checked={row.present} onChange={e => updateRow(eleve.id, { present: e.target.checked })} style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#0A6E3F' }} />
                            </td>
                            <td className="py-2 px-2 text-center" style={{ verticalAlign: 'middle' }}>
                              {(eleve as any).matricule ? (
                                <span className="badge rounded-pill" style={{ backgroundColor: '#f3f4f6', color: '#6b7280', fontSize: 10, fontFamily: 'monospace' }}>
                                  {(eleve as any).matricule}
                                </span>
                              ) : <span className="text-muted" style={{ fontSize: 11 }}>—</span>}
                            </td>
                            <td className="py-2 px-2" style={{ verticalAlign: 'middle', direction: 'rtl' }}>
                              <span style={{ fontSize: 13, color: '#111827', fontFamily: 'serif' }}>
                                {eleve.prenomArabe || eleve.prenom}
                              </span>
                            </td>
                            <td className="py-2 px-2" style={{ verticalAlign: 'middle', direction: 'rtl' }}>
                              <span className="fw-semibold" style={{ fontSize: 13, color: '#111827', fontFamily: 'serif' }}>
                                {eleve.nomArabe || eleve.nom}
                              </span>
                            </td>
                            <td className="py-2 px-2" style={{ verticalAlign: 'middle', minWidth: 160 }}>
                              {role === 'RECITATEUR' ? (
                                <span style={{ fontSize: 12, color: '#0A6E3F', fontWeight: 600 }}>
                                  🎧 {enseignants[0]?.prenom} {enseignants[0]?.nom}
                                </span>
                              ) : (
                                <select value={row.enseignantId} onChange={e => updateRow(eleve.id, { enseignantId: e.target.value ? Number(e.target.value) : '' })} disabled={isAbsent} className="form-select" style={{ ...inputStyle, opacity: isAbsent ? 0.5 : 1 }}>
                                  <option value="">— اختر —</option>
                                  {enseignants.map((ens: any) => (
                                    <option key={ens.id} value={ens.id}>
                                      {ens.prenomArabe || ens.prenom} {ens.nomArabe || ens.nom} {ens.role === 'RECITATEUR' ? '🎧' : '👨‍🏫'}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </td>
                            <td className="py-2 px-2" style={{ verticalAlign: 'middle', minWidth: 180 }}>
                              <select value={row.sourateNumero} onChange={e => updateRow(eleve.id, { sourateNumero: Number(e.target.value), versetDebut: 0, versetFin: 0 })} disabled={isAbsent} className="form-select" style={{ ...inputStyle }}>
                                {SOURATES.map(s => (
                                  <option key={s.numero} value={s.numero}>
                                    {s.numero}. {s.nomArabe} — {s.nomFrancais}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2 px-2 text-center" style={{ verticalAlign: 'middle' }}>
                              <input type="number" min={0} max={maxV} value={row.versetDebut} onChange={e => updateRow(eleve.id, { versetDebut: Math.max(0, Number(e.target.value)) })} disabled={isAbsent} className="form-control text-center" style={{ ...inputStyle, width: 64 }} />
                            </td>
                            <td className="py-2 px-2 text-center" style={{ verticalAlign: 'middle' }}>
                              <input type="number" min={0} max={maxV} value={row.versetFin} onChange={e => updateRow(eleve.id, { versetFin: Math.max(0, Number(e.target.value)) })} disabled={isAbsent} className="form-control text-center" style={{ ...inputStyle, width: 64 }} />
                              <span style={{ fontSize: 10, color: '#9ca3af' }}>/{maxV}</span>
                            </td>
                            <td className="py-2 px-2" style={{ verticalAlign: 'middle' }}>
                              <input type="text" value={row.commentaire} onChange={e => updateRow(eleve.id, { commentaire: e.target.value })} placeholder="ملاحظات..." disabled={isAbsent} className="form-control" style={{ ...inputStyle, minWidth: 130, opacity: isAbsent ? 0.5 : 1 }} />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="d-flex justify-content-end">
            <button onClick={handleEnregistrer} disabled={saving} className="btn fw-semibold text-white d-flex align-items-center gap-2 px-4" style={{ backgroundColor: '#2563eb', borderRadius: 10, fontSize: 14, opacity: saving ? 0.7 : 1, border: 'none' }}>
              {saving && <span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14, borderWidth: 2 }} />}
              {saving ? 'جاري الحفظ...' : '💾 حفظ المراجعات'}
            </button>
          </div>
        </>
      )}

      {/* Résultat */}
      {saveResult && (
        <div className="rounded-3 p-3 d-flex align-items-start gap-3" style={{ backgroundColor: saveResult.type === 'success' ? '#f0fdf4' : '#fef2f2', border: `1px solid ${saveResult.type === 'success' ? '#bbf7d0' : '#fecaca'}`, borderLeft: `4px solid ${saveResult.type === 'success' ? '#2563eb' : '#dc2626'}` }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>{saveResult.type === 'success' ? '✅' : '❌'}</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: saveResult.type === 'success' ? '#1d4ed8' : '#dc2626', flex: 1 }}>{saveResult.message}</span>
          <button onClick={() => setSaveResult(null)} className="btn-close" style={{ fontSize: 10, flexShrink: 0 }} />
        </div>
      )}

      {/* آخر المراجعات المسجلة */}
      {dernieresRevisions.length > 0 && (
        <div className="rounded-4 overflow-hidden" style={{ border: '1px solid #dbeafe', boxShadow: '0 2px 12px rgba(37,99,235,0.07)' }}>
          <div className="p-3 d-flex align-items-center justify-content-between" style={{ background: 'linear-gradient(90deg, #eff6ff 0%, #ffffff 100%)', borderBottom: '1px solid #dbeafe' }}>
            <div className="d-flex align-items-center gap-2">
              <div style={{ width: 4, height: 18, backgroundColor: '#2563eb', borderRadius: 2 }} />
              <span className="fw-bold" style={{ fontSize: 14, color: '#1d4ed8' }}>📋 آخر المراجعات المسجلة</span>
              <span className="badge rounded-pill" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', fontSize: 12, fontWeight: 600 }}>{dernieresRevisions.length}</span>
            </div>
            <button onClick={() => setDernieresRevisions([])} className="btn-close" style={{ fontSize: 10 }} />
          </div>
          <div className="table-responsive">
            <table className="table table-hover mb-0" style={{ fontSize: 13 }}>
              <thead style={{ backgroundColor: '#f8faff' }}>
                <tr>
                  <th className="py-2 px-3 fw-semibold" style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>الاسم</th>
                  <th className="py-2 px-3 fw-semibold" style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>اللقب</th>
                  <th className="py-2 px-3 fw-semibold" style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>رقم التعريف</th>
                  <th className="py-2 px-3 fw-semibold" style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>السورة</th>
                  <th className="py-2 px-3 fw-semibold text-center" style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>آية البداية</th>
                  <th className="py-2 px-3 fw-semibold text-center" style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>آية النهاية</th>
                  <th className="py-2 px-3 fw-semibold text-center" style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>رقم الجلسة</th>
                  <th className="py-2 px-3 fw-semibold" style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {dernieresRevisions.map((rv) => (
                  <tr key={rv.id}>
                    <td className="py-2 px-3" style={{ verticalAlign: 'middle', direction: 'rtl' }}>{rv.elevePrenom}</td>
                    <td className="py-2 px-3 fw-semibold" style={{ verticalAlign: 'middle', direction: 'rtl' }}>{rv.eleveNom}</td>
                    <td className="py-2 px-3" style={{ verticalAlign: 'middle' }}>
                      {(rv.matricule || rv.eleveMatricule || elevesMap[rv.eleveId]) ? (
                        <span className="badge rounded-pill" style={{ backgroundColor: '#f3f4f6', color: '#6b7280', fontSize: 10, fontFamily: 'monospace' }}>
                          {rv.matricule || rv.eleveMatricule || elevesMap[rv.eleveId]}
                        </span>
                      ) : <span style={{ color: '#d1d5db' }}>—</span>}
                    </td>
                    <td className="py-2 px-3" style={{ verticalAlign: 'middle' }}>
                      <span style={{ color: '#374151' }}>
                        {rv.sourateNomArabe && <span style={{ fontFamily: 'serif', marginRight: 4 }}>{rv.sourateNomArabe}</span>}
                        <span style={{ color: '#9ca3af', fontSize: 11 }}>{rv.sourateNom}</span>
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center" style={{ verticalAlign: 'middle' }}>
                      <span className="badge" style={{ backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: 700 }}>{rv.versetRevisionDebut}</span>
                    </td>
                    <td className="py-2 px-3 text-center" style={{ verticalAlign: 'middle' }}>
                      <span className="badge" style={{ backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: 700 }}>{rv.versetRevisionFin}</span>
                    </td>
                    <td className="py-2 px-3 text-center" style={{ verticalAlign: 'middle' }}>
                      <span className="badge rounded-pill" style={{ backgroundColor: '#f0fdf4', color: '#15803d', fontSize: 11 }}>#{rv.numeroSeance ?? 1}</span>
                    </td>
                    <td className="py-2 px-3" style={{ verticalAlign: 'middle', color: '#6b7280', fontSize: 12 }}>
                      {new Date(rv.date).toLocaleDateString('ar-SA')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* آخر جلسات المراجعة */}
      <div className="rounded-4 overflow-hidden" style={{ border: '1px solid #dbeafe', boxShadow: '0 2px 12px rgba(37,99,235,0.06)' }}>
        <div className="p-3 d-flex align-items-center justify-content-between" style={{ background: 'linear-gradient(90deg, #eff6ff 0%, #ffffff 100%)', borderBottom: '1px solid #dbeafe' }}>
          <div className="d-flex align-items-center gap-2">
            <div style={{ width: 4, height: 18, backgroundColor: '#2563eb', borderRadius: 2 }} />
            <span className="fw-bold" style={{ fontSize: 14, color: '#1d4ed8' }}>🕐 آخر جلسات المراجعة</span>
            <span className="badge rounded-pill" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', fontSize: 11, fontWeight: 600 }}>
              {loadingRecentes ? '...' : `${recentesSeances.length} جلسة`}
            </span>
          </div>
          <button onClick={fetchRecentesSeances} className="btn btn-sm fw-medium d-flex align-items-center gap-1" style={{ fontSize: 12, color: '#2563eb', backgroundColor: 'transparent', border: '1px solid #bfdbfe', borderRadius: 8 }}>
            🔄 تحديث
          </button>
        </div>

        {loadingRecentes ? (
          <div className="p-4 text-center text-muted" style={{ fontSize: 13 }}>
            <span className="spinner-border spinner-border-sm me-2" style={{ width: 14, height: 14, borderWidth: 2 }} />
            جاري التحميل...
          </div>
        ) : recentesSeances.length === 0 ? (
          <div className="p-4 text-center text-muted" style={{ fontSize: 13 }}>لا توجد جلسات مراجعة في آخر 7 أيام</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0" style={{ fontSize: 13 }}>
              <thead style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <tr>
                  <th className="py-2 px-3 fw-semibold text-uppercase" style={{ fontSize: 11, color: '#6b7280' }}>التاريخ</th>
                  <th className="py-2 px-3 fw-semibold text-uppercase" style={{ fontSize: 11, color: '#6b7280' }}>الفصل</th>
                  <th className="py-2 px-3 fw-semibold text-uppercase text-center" style={{ fontSize: 11, color: '#6b7280' }}>رقم الجلسة</th>
                  <th className="py-2 px-3 fw-semibold text-uppercase" style={{ fontSize: 11, color: '#6b7280' }}>المعلم</th>
                  <th className="py-2 px-3 fw-semibold text-uppercase text-center" style={{ fontSize: 11, color: '#6b7280' }}>الطلاب المراجَعون</th>
                </tr>
              </thead>
              <tbody>
                {recentesSeances.map((s, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-3 fw-semibold" style={{ verticalAlign: 'middle', color: '#111827' }}>
                      {new Date(s.date).toLocaleDateString('ar-SA', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-2 px-3" style={{ verticalAlign: 'middle' }}>
                      <span className="badge rounded-pill" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontSize: 12, fontWeight: 600 }}>{s.classeNiveau}</span>
                    </td>
                    <td className="py-2 px-3 text-center" style={{ verticalAlign: 'middle' }}>
                      <span className="badge rounded-pill" style={{ backgroundColor: '#f0fdf4', color: '#15803d', fontSize: 11, fontWeight: 600 }}>الجلسة {s.numeroSeance}</span>
                    </td>
                    <td className="py-2 px-3" style={{ verticalAlign: 'middle' }}>
                      <div className="d-flex align-items-center gap-1">
                        <span style={{ fontSize: 14 }}>👨‍🏫</span>
                        <span style={{ fontSize: 12, color: '#6366f1', fontWeight: 600 }}>{s.enseignantNom}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-center" style={{ verticalAlign: 'middle' }}>
                      <span className="badge" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', fontWeight: 700 }}>{s.count} طالب</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* TAB HISTORIQUE */}
      {activeTab === 'historique' && (
        <div className="bg-white rounded-4 shadow-sm overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
          <div className="p-4 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0" style={{ fontSize: 16, color: '#111827' }}>سجل المراجعات</h5>
            {historique.length > 0 && (
              <span className="badge" style={{ backgroundColor: '#f0fdf4', color: '#0A6E3F', fontSize: 13, fontWeight: 600, padding: '6px 12px', borderRadius: 8 }}>
                {historique.length} مراجعة
              </span>
            )}
          </div>
          <div className="table-responsive">
            {loadingHisto ? (
              <SkeletonTable rows={5} columns={7} />
            ) : historique.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
                <p style={{ fontSize: 14 }}>اختر فصلاً وانقر على 🔍 لتحميل السجل</p>
              </div>
            ) : (
              <table className="table align-middle mb-0" style={{ fontSize: 13 }}>
                <thead style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <tr>
                    <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 11 }}>التاريخ</th>
                    <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 11 }}>الطالب</th>
                    <th className="py-3 px-3 fw-bold text-uppercase text-center" style={{ color: '#374151', fontSize: 11 }}>رقم التعريف</th>
                    <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 11 }}>السورة</th>
                    <th className="py-3 px-3 fw-bold text-uppercase text-center" style={{ color: '#374151', fontSize: 11 }}>الآيات</th>
                    <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 11 }}>المعلم</th>
                    <th className="py-3 px-3 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 11 }}>ملاحظات</th>
                    {canDelete && (
                      <th className="py-3 px-3 fw-bold text-uppercase text-center" style={{ color: '#374151', fontSize: 11 }}>الإجراء</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {historique.map(r => (
                    <tr key={r.id}>
                      <td className="py-2 px-3" style={{ verticalAlign: 'middle' }}>
                        <span className="badge" style={{ backgroundColor: '#f0fdf4', color: '#0A6E3F', fontSize: 11, fontWeight: 500 }}>{r.date}</span>
                      </td>
                      <td className="py-2 px-3" style={{ verticalAlign: 'middle', direction: 'rtl' }}>
                        <span className="fw-semibold" style={{ fontSize: 13 }}>{r.elevePrenom} {r.eleveNom}</span>
                      </td>
                      <td className="py-2 px-3 text-center" style={{ verticalAlign: 'middle' }}>
                        {(r.eleveMatricule || elevesMap[r.eleveId]) ? (
                          <span className="badge rounded-pill" style={{ backgroundColor: '#f3f4f6', color: '#6b7280', fontSize: 10, fontFamily: 'monospace' }}>
                            {r.eleveMatricule || elevesMap[r.eleveId]}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="py-2 px-3" style={{ verticalAlign: 'middle' }}>
                        <div className="d-flex flex-column">
                          {r.sourateNomArabe && <span style={{ fontFamily: 'serif', color: '#374151', fontSize: 13 }}>{r.sourateNomArabe}</span>}
                          {r.sourateNom && <span className="text-muted" style={{ fontSize: 11 }}>{r.sourateNom}</span>}
                          {!r.sourateNom && !r.sourateNomArabe && <span className="text-muted">—</span>}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center" style={{ verticalAlign: 'middle' }}>
                        <span className="badge" style={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: 11 }}>
                          {r.versetRevisionDebut} → {r.versetRevisionFin}
                        </span>
                      </td>
                      <td className="py-2 px-3" style={{ verticalAlign: 'middle' }}>
                        <div className="d-flex align-items-center gap-1">
                          <span style={{ fontSize: 14 }}>👨‍🏫</span>
                          <span style={{ fontSize: 12, color: '#6366f1', fontWeight: 600 }}>{r.enseignantNom || '—'}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3" style={{ verticalAlign: 'middle' }}>
                        <span className="text-muted" style={{ fontSize: 12 }}>{r.commentaire || '—'}</span>
                      </td>
                      {canDelete && (
                        <td className="py-2 px-3 text-center" style={{ verticalAlign: 'middle' }}>
                          <button onClick={() => handleSupprimer(r.id)} className="btn btn-sm" style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 6, fontSize: 12 }} title="حذف">
                            🗑️
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmSupprimer}
        title="حذف المراجعة"
        message="هل أنت متأكد من حذف هذه المراجعة؟ هذا الإجراء لا يمكن التراجع عنه."
        confirmText="حذف"
        cancelText="إلغاء"
        variant="danger"
      />
    </div>
  );
}
