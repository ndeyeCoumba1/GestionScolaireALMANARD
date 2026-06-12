import { useEffect, useState, useMemo } from 'react';
import api from '../../api/axios';
import type { Eleve, Classe } from '../../Types/index';
import { useSeanceCoran } from '../../hooks/useSeanceCoran';
import EleveRecitationRow from '../../components/Coran/EleveRecitationRow';
import SeanceStatsBar from '../../components/Coran/SeanceStatsBar';
import { SkeletonTable } from '../../components/Common/SkeletonLoader';
import toast from 'react-hot-toast';
import { useAuth } from '../../Context/AuthContext';

export default function SeanceCoranPage() {
  const { role, nom, prenom, userId } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClasse, setSelectedClasse] = useState<number | ''>('');
  const [selectedEnseignant, setSelectedEnseignant] = useState<number | ''>('');
  const [selectedTeacher, setSelectedTeacher] = useState<number | ''>('');
  const [classes, setClasses] = useState<Classe[]>([]);
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [enseignants, setEnseignants] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [numeroSeance, setNumeroSeance] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [verifierRevision, setVerifierRevision] = useState(true);
  const [revisionErrors, setRevisionErrors] = useState<string[]>([]);
  const [saveResult, setSaveResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [missingVersetIds, setMissingVersetIds] = useState<number[]>([]);
  const [dernieresRecitations, setDernieresRecitations] = useState<any[]>([]);
  const [derniereDateSeance, setDerniereDateSeance] = useState<string>('');
  const [dernierNumeroSeance, setDernierNumeroSeance] = useState<number>(1);
  const [dernieresSeances, setDernieresSeances] = useState<any[]>([]);
  const [loadingDernieres, setLoadingDernieres] = useState(false);

  // Historique
  const [showHistory, setShowHistory] = useState(false);
  const [histDebut, setHistDebut] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().split('T')[0];
  });
  const [histFin, setHistFin] = useState(new Date().toISOString().split('T')[0]);
  const [histClasse, setHistClasse] = useState<number | ''>('');
  const [histSeances, setHistSeances] = useState<any[]>([]);
  const [histLoading, setHistLoading] = useState(false);
  const [histExpanded, setHistExpanded] = useState<number | null>(null);

  const elevesForSeance = useMemo(
    () => eleves.map((e) => ({ id: e.id, groupeNiveau: e.classeNiveau || 'A' })),
    [eleves]
  );

  const {
    recitations,
    setPresence,
    setNiveauMemorisation,
    setCommentaire,
    setVersetEleve,
    marquerTousPresents,
    sauvegarderSeance,
    stats,
  } = useSeanceCoran(elevesForSeance);

  useEffect(() => {
    fetchClasses();
    fetchEnseignants();
    fetchTeachers();
  }, []);

  // Charger les 5 dernières séances dès que les classes sont disponibles
  useEffect(() => {
    if (classes.length > 0) fetchDernieresSeances();
  }, [classes]); // eslint-disable-line

  const fetchDernieresSeances = async () => {
    setLoadingDernieres(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      const dateDebut = monthAgo.toISOString().split('T')[0];

      const results = await Promise.allSettled(
        classes.map(c =>
          api.get(`/coran/seances/historique?classeId=${c.id}&dateDebut=${dateDebut}&dateFin=${today}`)
        )
      );
      const seances: any[] = results
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => (r as PromiseFulfilledResult<any>).value.data ?? []);
      seances.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setDernieresSeances(seances.slice(0, 5));
    } catch {
      // silently ignore
    } finally {
      setLoadingDernieres(false);
    }
  };

  const fetchHistory = async () => {
    if (!histDebut || !histFin) return;
    setHistLoading(true);
    try {
      const classesToQuery = histClasse ? [histClasse] : classes.map(c => c.id);
      const results = await Promise.allSettled(
        classesToQuery.map(id =>
          api.get(`/coran/seances/historique?classeId=${id}&dateDebut=${histDebut}&dateFin=${histFin}`)
        )
      );
      const all: any[] = results
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => (r as PromiseFulfilledResult<any>).value.data ?? []);
      all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setHistSeances(all);
    } catch {
      toast.error('Erreur lors du chargement de l\'historique');
    } finally {
      setHistLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClasse) {
      fetchEleves(selectedClasse);
      // Auto-select the class teacher when class changes
      const classe = classes.find(c => c.id === selectedClasse) as any;
      if (classe?.enseignant?.id) {
        setSelectedTeacher(classe.enseignant.id);
      } else if (classe?.enseignantId) {
        setSelectedTeacher(classe.enseignantId);
      }
    }
  }, [selectedClasse]);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      setClasses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEnseignants = async () => {
    // Résoudre l'ID du récitateur connecté si nécessaire
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

    // Toujours charger la liste complète des enseignants
    try {
      const res = await api.get('/users/enseignants');
      setEnseignants(res.data);
    } catch (err) {
      console.error(err);
    }

    // Pré-sélectionner le récitateur connecté dans le champ récitateur
    if (role === 'RECITATEUR' && effectiveUserId) {
      setSelectedEnseignant(effectiveUserId);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/users/enseignants');
      setTeachers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEleves = async (classeId: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/eleves/classe/${classeId}`);
      console.log('Élèves récupérés:', res.data);
      setEleves(res.data);
      if (res.data.length === 0) {
        toast('Aucun élève dans cette classe', { icon: '⚠️' });
      } else {
        toast.success(`${res.data.length} élève(s)`);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des élèves:', err);
      toast.error('Erreur lors du chargement des élèves');
      setEleves([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEnregistrerSeance = async () => {
    console.log('=== handleEnregistrerSeance appelé ===');
    console.log('selectedClasse:', selectedClasse);
    console.log('selectedEnseignant:', selectedEnseignant);
    console.log('date:', date);
    console.log('eleves.length:', eleves.length);
    console.log('recitations:', recitations);

    if (!selectedClasse) {
      toast.error('Veuillez choisir une classe');
      return;
    }
    if (role !== 'RECITATEUR' && !selectedEnseignant) {
      toast.error('Veuillez choisir un récitateur');
      return;
    }

    if (!date) {
      console.error('Validation échouée: date manquante');
      toast.error('Veuillez sélectionner une date');
      return;
    }

    if (eleves.length === 0) {
      console.error('Validation échouée: aucun élève');
      toast.error('Aucun élève dans cette classe');
      return;
    }

    // Vérifier que tous les élèves présents ont verset début ET fin > 0
    const elevesSansVerset = eleves.filter(e => {
      const rec = recitations[e.id];
      if (!rec?.present) return false;
      const debutOk = (rec.versetDebut ?? 0) > 0;
      const finOk = (rec.versetFin ?? 0) > 0;
      return !debutOk || !finOk;
    });
    if (elevesSansVerset.length > 0) {
      setMissingVersetIds(elevesSansVerset.map(e => e.id));
      const details = elevesSansVerset.map(e => {
        const rec = recitations[e.id];
        const debutOk = (rec?.versetDebut ?? 0) > 0;
        const finOk = (rec?.versetFin ?? 0) > 0;
        const champ = !debutOk && !finOk ? 'début et fin' : !debutOk ? 'début' : 'fin';
        return `${e.prenom} ${e.nom} (verset ${champ} manquant)`;
      }).join(' • ');
      setSaveResult({ type: 'error', message: `Versets obligatoires manquants — ${details}` });
      return;
    }
    setMissingVersetIds([]);
    setRevisionErrors([]);
    setSaveResult(null);
    setDernieresRecitations([]);
    setSaving(true);
    try {
      // Le récitateur (selectedEnseignant) est stocké comme "enseignant" de la séance.
      // L'enseignant de la classe (selectedTeacher) vient de l'entité Classe, pas de la séance.
      const enseignantId = selectedEnseignant !== ''
        ? Number(selectedEnseignant)
        : (userId ?? 0);
      const seanceResponse = await sauvegarderSeance(date, Number(selectedClasse), enseignantId, numeroSeance, verifierRevision);
      setSaveResult({ type: 'success', message: 'Séance enregistrée avec succès !' });
      fetchDernieresSeances();
      if (seanceResponse?.recitations) {
        setDernieresRecitations(seanceResponse.recitations);
        setDerniereDateSeance(seanceResponse.date);
        setDernierNumeroSeance(seanceResponse.numeroSeance ?? numeroSeance);
      }
      setSelectedClasse('');
      setSelectedEnseignant('');
      setEleves([]);
    } catch (err: any) {
      const rawMessage: string = err?.response?.data?.message || err?.response?.data?.error || '';
      // Retirer le préfixe générique du backend
      const backendMessage = rawMessage.replace(/^Erreur lors de l['']enregistrement\s*:\s*/i, '');
      const status = err?.response?.status;

      if (backendMessage && backendMessage.includes("n'a pas révisé")) {
        const messages: string[] = Array.isArray(err?.response?.data?.errors)
          ? err.response.data.errors
          : backendMessage.split('\n').filter(Boolean);
        setRevisionErrors(messages);
      } else if (status === 500 && backendMessage.includes('uk_verset_jour_date_classe_groupe')) {
        setSaveResult({ type: 'error', message: 'Un verset du jour existe déjà pour cette séance.' });
      } else if (status === 401 || status === 403) {
        setSaveResult({ type: 'error', message: 'Non autorisé. Veuillez vous reconnecter.' });
      } else {
        setSaveResult({ type: 'error', message: backendMessage || "Erreur lors de l'enregistrement." });
      }
    } finally {
      setSaving(false);
    }
  };


  if (role === 'COMPTABLE') {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-muted">Accès non autorisé</div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header */}
      <div className="rounded-4 p-5 position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0A6E3F 0%, #1a8f52 100%)' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: 180, width: 160, height: 160, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', top: 20, right: 120, width: 80, height: 80, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }} />
        <div className="position-relative d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-4">
            <div style={{ width: 64, height: 64, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0 }}>
              📖
            </div>
            <div>
              <h1 className="fw-bold mb-1" style={{ fontSize: 26, color: '#ffffff' }}>Séance de récitation du Coran</h1>
              <p className="mb-1" style={{ fontSize: 17, color: 'rgba(255,255,255,0.9)', fontFamily: 'serif' }}>جلسة تلاوة القرآن الكريم</p>
              <p className="mb-0" style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Enregistrez les versets du jour et évaluez la mémorisation des élèves</p>
            </div>
          </div>
          <button
            onClick={() => { setShowHistory(h => !h); setHistSeances([]); }}
            className="btn fw-semibold"
            style={{ backgroundColor: showHistory ? '#ffffff' : 'rgba(255,255,255,0.15)', color: showHistory ? '#0A6E3F' : '#ffffff', borderRadius: 10, fontSize: 13, border: '1px solid rgba(255,255,255,0.3)', padding: '10px 20px' }}
          >
            📚 {showHistory ? 'Fermer l\'historique' : 'Historique'}
          </button>
        </div>
      </div>

      {/* Panel Historique */}
      {showHistory && (
        <div className="rounded-4 p-4" style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 16px rgba(10,110,63,0.10)', border: '1px solid #d1fae5' }}>
          <div className="d-flex align-items-center gap-2 mb-4">
            <div style={{ width: 4, height: 20, backgroundColor: '#0A6E3F', borderRadius: 2 }} />
            <span className="fw-semibold" style={{ fontSize: 13, color: '#374151' }}>Historique des séances — سجل الجلسات</span>
          </div>
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-3">
              <label className="form-label fw-semibold text-uppercase" style={{ fontSize: 11, color: '#6b7280' }}>📅 Date début</label>
              <input
                type="date"
                value={histDebut}
                onChange={e => setHistDebut(e.target.value)}
                className="form-control"
                style={{ borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: 14 }}
              />
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label fw-semibold text-uppercase" style={{ fontSize: 11, color: '#6b7280' }}>📅 Date fin</label>
              <input
                type="date"
                value={histFin}
                min={histDebut}
                onChange={e => setHistFin(e.target.value)}
                className="form-control"
                style={{ borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: 14 }}
              />
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label fw-semibold text-uppercase" style={{ fontSize: 11, color: '#6b7280' }}>🏫 Classe (optionnel)</label>
              <select
                value={histClasse}
                onChange={e => setHistClasse(e.target.value ? Number(e.target.value) : '')}
                className="form-select"
                style={{ borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: 14 }}
              >
                <option value="">Toutes les classes</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.niveau}</option>)}
              </select>
            </div>
            <div className="col-12 col-md-3 d-flex align-items-end">
              <button
                onClick={fetchHistory}
                disabled={histLoading || !histDebut || !histFin}
                className="btn fw-semibold w-100"
                style={{ backgroundColor: '#0A6E3F', color: '#fff', borderRadius: 8, fontSize: 14, padding: '0.75rem', border: 'none', opacity: histLoading ? 0.7 : 1 }}
              >
                {histLoading
                  ? <><span className="spinner-border spinner-border-sm me-2" style={{ width: 14, height: 14, borderWidth: 2 }} />Chargement...</>
                  : '🔍 Rechercher'}
              </button>
            </div>
          </div>

          {histSeances.length === 0 && !histLoading && (
            <div className="text-center py-4 text-muted" style={{ fontSize: 13 }}>
              Lancez une recherche pour afficher les séances
            </div>
          )}

          {histSeances.length > 0 && (
            <div className="table-responsive">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge rounded-pill" style={{ backgroundColor: '#d1fae5', color: '#065f46', fontSize: 12 }}>
                  {histSeances.length} séance(s) trouvée(s)
                </span>
              </div>
              <table className="table table-hover mb-0" style={{ fontSize: 13 }}>
                <thead style={{ backgroundColor: '#f0fdf4', borderBottom: '2px solid #d1fae5' }}>
                  <tr>
                    <th className="py-2 px-3 fw-semibold text-uppercase" style={{ fontSize: 11, color: '#6b7280' }}>Date</th>
                    <th className="py-2 px-3 fw-semibold text-uppercase" style={{ fontSize: 11, color: '#6b7280' }}>Classe</th>
                    <th className="py-2 px-3 fw-semibold text-uppercase" style={{ fontSize: 11, color: '#6b7280' }}>N° Séance</th>
                    <th className="py-2 px-3 fw-semibold text-uppercase" style={{ fontSize: 11, color: '#6b7280' }}>Récitateur</th>
                    <th className="py-2 px-3 fw-semibold text-uppercase text-center" style={{ fontSize: 11, color: '#6b7280' }}>Présents</th>
                    <th className="py-2 px-3 fw-semibold text-uppercase text-center" style={{ fontSize: 11, color: '#6b7280' }}>Mémorisés</th>
                    <th className="py-2 px-3 fw-semibold text-uppercase text-center" style={{ fontSize: 11, color: '#6b7280' }}>Total</th>
                    <th className="py-2 px-3 fw-semibold text-uppercase" style={{ fontSize: 11, color: '#6b7280' }}>Détails</th>
                  </tr>
                </thead>
                <tbody>
                  {histSeances.map((s: any, idx: number) => {
                    const recits: any[] = s.recitations ?? [];
                    const presents = recits.filter(r => r.present).length;
                    const memorises = recits.filter(r => r.niveauMemorisation === 'MEMORISE').length;
                    const total = recits.length;
                    const tauxPresence = total > 0 ? Math.round((presents / total) * 100) : 0;
                    const expanded = histExpanded === (s.id ?? idx);
                    return (
                      <>
                        <tr key={s.id ?? idx} style={{ cursor: 'pointer' }} onClick={() => setHistExpanded(expanded ? null : (s.id ?? idx))}>
                          <td className="py-2 px-3" style={{ verticalAlign: 'middle' }}>
                            <span className="fw-semibold" style={{ color: '#111827' }}>
                              {s.date ? new Date(s.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                            </span>
                          </td>
                          <td className="py-2 px-3" style={{ verticalAlign: 'middle' }}>
                            <span className="badge rounded-pill" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontSize: 12, fontWeight: 600 }}>
                              {s.classeNiveau ?? '—'}
                            </span>
                          </td>
                          <td className="py-2 px-3" style={{ verticalAlign: 'middle', color: '#6b7280' }}>
                            Séance {s.numeroSeance ?? 1}
                          </td>
                          <td className="py-2 px-3" style={{ verticalAlign: 'middle' }}>
                            <div className="d-flex align-items-center gap-1">
                              <span style={{ fontSize: 13 }}>🎧</span>
                              <span style={{ fontWeight: 500, color: '#374151' }}>{s.enseignantNom ?? '—'}</span>
                            </div>
                          </td>
                          <td className="py-2 px-3 text-center" style={{ verticalAlign: 'middle' }}>
                            <div className="d-flex align-items-center justify-content-center gap-1">
                              <span className="badge" style={{ backgroundColor: '#d1fae5', color: '#065f46', fontWeight: 700 }}>{presents}</span>
                              <span style={{ fontSize: 10, color: '#9ca3af' }}>{tauxPresence}%</span>
                            </div>
                          </td>
                          <td className="py-2 px-3 text-center" style={{ verticalAlign: 'middle' }}>
                            <span className="badge" style={{ backgroundColor: '#fef9c3', color: '#854d0e', fontWeight: 700 }}>{memorises}</span>
                          </td>
                          <td className="py-2 px-3 text-center" style={{ verticalAlign: 'middle', color: '#6b7280' }}>
                            {total}
                          </td>
                          <td className="py-2 px-3" style={{ verticalAlign: 'middle' }}>
                            <button className="btn btn-sm" style={{ backgroundColor: '#e8f5e9', color: '#0A6E3F', borderRadius: 6, fontSize: 12 }}>
                              {expanded ? 'Masquer ▲' : 'Détails ▼'}
                            </button>
                          </td>
                        </tr>
                        {expanded && recits.length > 0 && (
                          <tr key={`detail-${s.id ?? idx}`}>
                            <td colSpan={8} className="p-3" style={{ backgroundColor: '#f9fafb' }}>
                              <div className="bg-white rounded-3 p-3">
                                <h6 className="fw-bold mb-3" style={{ fontSize: 13, color: '#0A6E3F' }}>
                                  Détails — {s.date ? new Date(s.date).toLocaleDateString('fr-FR') : ''} · {s.classeNiveau}
                                </h6>
                                <table className="table table-sm mb-0" style={{ fontSize: 12 }}>
                                  <thead style={{ backgroundColor: '#f0fdf4' }}>
                                    <tr>
                                      <th>Élève</th>
                                      <th>Matricule</th>
                                      <th>Sourate</th>
                                      <th className="text-center">V. Début</th>
                                      <th className="text-center">V. Fin</th>
                                      <th className="text-center">Présence</th>
                                      <th className="text-center">Mémorisation</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {recits.map((r: any) => {
                                      const niveauColors: Record<string, { bg: string; color: string; label: string }> = {
                                        MEMORISE:     { bg: '#d1fae5', color: '#065f46', label: 'Mémorisé' },
                                        PARTIEL:      { bg: '#fef9c3', color: '#854d0e', label: 'Partiel' },
                                        NON_MEMORISE: { bg: '#fee2e2', color: '#991b1b', label: 'Non mémorisé' },
                                        ABSENT:       { bg: '#f3f4f6', color: '#6b7280', label: 'Absent' },
                                      };
                                      const niv = niveauColors[r.niveauMemorisation] ?? niveauColors['NON_MEMORISE'];
                                      return (
                                        <tr key={r.id} style={{ opacity: r.present ? 1 : 0.6 }}>
                                          <td className="fw-semibold">{r.elevePrenom} {r.eleveNom}</td>
                                          <td>
                                            {r.matricule
                                              ? <span className="badge" style={{ backgroundColor: '#f3f4f6', color: '#6b7280', fontFamily: 'monospace', fontSize: 10 }}>{r.matricule}</span>
                                              : <span className="text-muted">—</span>}
                                          </td>
                                          <td style={{ direction: 'rtl' }}>{r.sourateNomArabe || r.sourateNom || '—'}</td>
                                          <td className="text-center">{r.versetDebut ?? '—'}</td>
                                          <td className="text-center">{r.versetFin ?? '—'}</td>
                                          <td className="text-center">{r.present ? '✅' : '❌'}</td>
                                          <td className="text-center">
                                            <span className="badge rounded-pill" style={{ backgroundColor: niv.bg, color: niv.color, fontSize: 10 }}>
                                              {niv.label}
                                            </span>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Filtres */}
      <form className="rounded-4 p-4" style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 16px rgba(10,110,63,0.08)', border: '1px solid #e8f5e9' }} onSubmit={(e) => e.preventDefault()}>
        <div className="d-flex align-items-center gap-2 mb-4">
          <div style={{ width: 4, height: 20, backgroundColor: '#0A6E3F', borderRadius: 2 }} />
          <span className="fw-semibold" style={{ fontSize: 13, color: '#374151' }}>Paramètres de la séance — إعدادات الجلسة</span>
        </div>
        <div className="row g-3">
          <div className="col-12 col-md-2">
            <label className="form-label fw-semibold d-flex align-items-center gap-1" style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase' }}>
              📅 Date de la séance
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="form-control"
              style={{ borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: 14 }}
            />
          </div>
          <div className="col-12 col-md-2">
            <label className="form-label fw-semibold d-flex align-items-center gap-1" style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase' }}>
              🔢 N° Séance
            </label>
            <select
              value={numeroSeance}
              onChange={(e) => setNumeroSeance(Number(e.target.value))}
              className="form-select"
              style={{ borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: 14 }}
            >
              <option value={1}>Séance 1 (Matin)</option>
              <option value={2}>Séance 2 (Après-midi)</option>
              <option value={3}>Séance 3</option>
            </select>
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label fw-semibold d-flex align-items-center gap-1" style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase' }}>
              🏫 Classe — الفصل
            </label>
            <select
              value={selectedClasse}
              onChange={(e) => setSelectedClasse(e.target.value ? Number(e.target.value) : '')}
              className="form-select"
              style={{ borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: 14 }}
            >
              <option value="">Choisir une classe</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.niveau}</option>
              ))}
            </select>
          </div>

          {/* Récitateur */}
          <div className="col-12 col-md-3">
            <label className="form-label fw-semibold text-uppercase" style={{ fontSize: 11, color: '#6b7280' }}>
              {role === 'RECITATEUR' ? 'المسمع (Récitateur)' : 'Récitateur / Enseignant'}
            </label>
            {role === 'RECITATEUR' ? (
              /* RECITATEUR connecté : champ verrouillé sur son nom */
              <div
                className="form-control d-flex align-items-center gap-2"
                style={{ borderRadius: 8, border: '1px solid #d1fae5', backgroundColor: '#f0fdf4', fontSize: 14, color: '#0A6E3F', fontWeight: 600, cursor: 'default' }}
              >
                <span style={{ fontSize: 16 }}>🎧</span>
                <span>
                  {enseignants.find((e: any) => e.id === selectedEnseignant)
                    ? `${enseignants.find((e: any) => e.id === selectedEnseignant).prenom || ''} ${enseignants.find((e: any) => e.id === selectedEnseignant).nom || ''}`.trim()
                    : `${prenom || ''} ${nom || ''}`.trim() || 'Récitateur connecté'}
                </span>
              </div>
            ) : (
              /* ADMIN / ENSEIGNANT : select libre */
              <select
                value={selectedEnseignant}
                onChange={(e) => setSelectedEnseignant(e.target.value ? Number(e.target.value) : '')}
                className="form-select"
                style={{ borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: 14 }}
              >
                <option value="">Choisir un récitateur</option>
                {enseignants.length === 0 ? (
                  <option disabled>Aucun récitateur disponible</option>
                ) : (
                  enseignants.map((e: any) => (
                    <option key={e.id} value={e.id}>
                      {e.prenomArabe || e.prenom} {e.nomArabe || e.nom}
                      {e.role === 'RECITATEUR' ? ' 🎧' : ' 👨‍🏫'}
                    </option>
                  ))
                )}
              </select>
            )}
          </div>
        </div>
      </form>

      {selectedClasse && (
        <>
          {/* Statistiques */}
          <SeanceStatsBar
            presents={stats.presents}
            memorises={stats.memorises}
            partiels={stats.partiels}
            absents={stats.absents}
            totalEleves={stats.totalEleves}
          />

          {/* Tableau des élèves */}
          <div className="rounded-4 overflow-hidden" style={{ boxShadow: '0 2px 16px rgba(10,110,63,0.08)', border: '1px solid #e8f5e9' }}>
            <div className="p-4 d-flex justify-content-between align-items-center" style={{ background: 'linear-gradient(90deg, #f0fdf4 0%, #ffffff 100%)', borderBottom: '1px solid #e8f5e9' }}>
              <div className="d-flex align-items-center gap-2">
                <div style={{ width: 4, height: 20, backgroundColor: '#0A6E3F', borderRadius: 2 }} />
                <h5 className="fw-bold mb-0" style={{ fontSize: 16, color: '#0A6E3F' }}>
                  Liste des élèves — قائمة الطلاب
                </h5>
              </div>
              <button
                onClick={marquerTousPresents}
                className="btn btn-sm fw-medium"
                style={{ backgroundColor: '#0A6E3F', color: '#fff', borderRadius: 8, border: 'none' }}
              >
                ✅ Marquer tous présents
              </button>
            </div>
            <div className="table-responsive">
              {loading ? (
                <SkeletonTable rows={5} columns={6} />
              ) : (
                <table className="table align-middle mb-0" style={{ fontSize: 13 }}>
                  <thead style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                    <tr>
                      <th className="py-3 px-2 fw-bold text-uppercase text-center" style={{ color: '#374151', fontSize: 11 }}>Présence</th>
                      <th className="py-3 px-2 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 11 }}>Prénom</th>
                      <th className="py-3 px-2 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 11 }}>Nom</th>
                      <th className="py-3 px-2 fw-bold text-uppercase text-center" style={{ color: '#374151', fontSize: 11 }}>Matricule</th>
                      <th className="py-3 px-2 fw-bold text-uppercase text-end" style={{ color: '#374151', fontSize: 11 }}>الاسم</th>
                      <th className="py-3 px-2 fw-bold text-uppercase text-end" style={{ color: '#374151', fontSize: 11 }}>اللقب</th>
                      <th className="py-3 px-2 fw-bold text-uppercase text-center" style={{ color: '#374151', fontSize: 11 }}>Classe</th>
                      <th className="py-3 px-2 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 11 }}>Sourate</th>
                      <th className="py-3 px-2 fw-bold text-uppercase text-center" style={{ color: '#374151', fontSize: 11 }}>V. Début</th>
                      <th className="py-3 px-2 fw-bold text-uppercase text-center" style={{ color: '#374151', fontSize: 11 }}>V. Fin</th>
                      <th className="py-3 px-2 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 11 }}>Mémorisation</th>
                      <th className="py-3 px-2 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 11 }}>Statut</th>
                      <th className="py-3 px-2 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 11 }}>Récitateur</th>
                      <th className="py-3 px-2 fw-bold text-uppercase" style={{ color: '#374151', fontSize: 11 }}>Remarques</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eleves.length === 0 ? (
                      <tr>
                        <td colSpan={14} className="text-center py-5 text-muted">
                          Sélectionnez une classe pour charger les élèves
                        </td>
                      </tr>
                    ) : (
                      eleves.map((eleve) => (
                        <EleveRecitationRow
                          key={eleve.id}
                          eleve={eleve}
                          recitation={recitations[eleve.id]}
                          hasError={missingVersetIds.includes(eleve.id)}
                          classeName={classes.find(c => c.id === selectedClasse)?.niveau || ''}
                          recitateur={(() => {
                            const r = enseignants.find((e: any) => e.id === selectedEnseignant);
                            return r ? `${r.prenom || ''} ${r.nom || ''}`.trim() : `${prenom || ''} ${nom || ''}`.trim();
                          })()}
                          onPresenceChange={setPresence}
                          onNiveauChange={setNiveauMemorisation}
                          onCommentaireChange={setCommentaire}
                          onVersetChange={setVersetEleve}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Panneau erreurs de révision manquante */}
          {revisionErrors.length > 0 && (
            <div className="rounded-3 p-4" style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderLeft: '4px solid #ea580c' }}>
              <div className="d-flex align-items-start gap-3">
                <span style={{ fontSize: 22, flexShrink: 0 }}>⚠️</span>
                <div className="flex-grow-1">
                  <div className="fw-bold mb-2" style={{ fontSize: 14, color: '#9a3412' }}>
                    Révisions manquantes — لم تتم المراجعة
                  </div>
                  <ul className="mb-3 ps-3" style={{ fontSize: 13, color: '#7c2d12' }}>
                    {revisionErrors.map((msg, i) => (
                      <li key={i} className="mb-1">{msg}</li>
                    ))}
                  </ul>
                  <div className="d-flex align-items-center gap-3 flex-wrap">
                    <a
                      href="/ar/revision"
                      className="btn btn-sm fw-semibold"
                      style={{ backgroundColor: '#ea580c', color: '#fff', borderRadius: 8, fontSize: 12, textDecoration: 'none' }}
                    >
                      🔁 Aller à la page Révisions
                    </a>
                    <label className="d-flex align-items-center gap-2" style={{ cursor: 'pointer', fontSize: 13, color: '#9a3412' }}>
                      <input
                        type="checkbox"
                        checked={!verifierRevision}
                        onChange={(e) => setVerifierRevision(!e.target.checked)}
                        style={{ width: 16, height: 16, accentColor: '#ea580c' }}
                      />
                      Ignorer la vérification et enregistrer quand même
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bouton sauvegarder */}
          <div className="d-flex align-items-center justify-content-between gap-3">
            <label className="d-flex align-items-center gap-2" style={{ cursor: 'pointer', fontSize: 13, color: '#6b7280' }}>
              <input
                type="checkbox"
                checked={verifierRevision}
                onChange={(e) => {
                  setVerifierRevision(e.target.checked);
                  setRevisionErrors([]);
                }}
                style={{ width: 16, height: 16, accentColor: '#0A6E3F' }}
              />
              Vérifier que les versets ont été révisés avant récitation
            </label>
            <button
              onClick={handleEnregistrerSeance}
              disabled={saving}
              className="btn fw-semibold text-white d-flex align-items-center gap-2 px-4"
              style={{ backgroundColor: '#0A6E3F', borderRadius: 10, fontSize: 14, opacity: saving ? 0.7 : 1, border: 'none' }}
            >
              {saving && (
                <span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14, borderWidth: 2 }} />
              )}
              {saving ? 'Enregistrement...' : '💾 Enregistrer la séance'}
            </button>
          </div>
        </>
      )}

      {/* Récapitulatif des dernières récitations enregistrées */}
      {dernieresRecitations.length > 0 && (
        <div className="rounded-4 overflow-hidden" style={{ border: '1px solid #d1fae5', boxShadow: '0 2px 12px rgba(10,110,63,0.07)' }}>
          <div className="p-3 d-flex align-items-center justify-content-between" style={{ background: 'linear-gradient(90deg, #f0fdf4 0%, #ffffff 100%)', borderBottom: '1px solid #d1fae5' }}>
            <div className="d-flex align-items-center gap-2">
              <div style={{ width: 4, height: 18, backgroundColor: '#0A6E3F', borderRadius: 2 }} />
              <span className="fw-bold" style={{ fontSize: 14, color: '#0A6E3F' }}>
                📋 Dernières récitations enregistrées
              </span>
              <span className="badge rounded-pill" style={{ backgroundColor: '#d1fae5', color: '#0A6E3F', fontSize: 12, fontWeight: 600 }}>
                {dernieresRecitations.filter((r: any) => r.present).length} présent(s)
              </span>
              <span className="badge rounded-pill" style={{ backgroundColor: '#f3f4f6', color: '#6b7280', fontSize: 11 }}>
                Séance #{dernierNumeroSeance} — {derniereDateSeance ? new Date(derniereDateSeance).toLocaleDateString('fr-FR') : ''}
              </span>
            </div>
            <button
              onClick={() => setDernieresRecitations([])}
              className="btn-close"
              style={{ fontSize: 10 }}
              aria-label="Fermer"
            />
          </div>
          <div className="table-responsive">
            <table className="table table-hover mb-0" style={{ fontSize: 13 }}>
              <thead style={{ backgroundColor: '#f8fffe' }}>
                <tr>
                  <th className="py-2 px-3 fw-semibold" style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>Prénom</th>
                  <th className="py-2 px-3 fw-semibold" style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>Nom</th>
                  <th className="py-2 px-3 fw-semibold" style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>Matricule</th>
                  <th className="py-2 px-3 fw-semibold" style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>Sourate</th>
                  <th className="py-2 px-3 fw-semibold text-center" style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>V. Début</th>
                  <th className="py-2 px-3 fw-semibold text-center" style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>V. Fin</th>
                  <th className="py-2 px-3 fw-semibold text-center" style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>Mémorisation</th>
                  <th className="py-2 px-3 fw-semibold text-center" style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>Présence</th>
                </tr>
              </thead>
              <tbody>
                {dernieresRecitations.map((r: any) => {
                  const niveauColors: Record<string, { bg: string; color: string; label: string }> = {
                    MEMORISE:     { bg: '#d1fae5', color: '#065f46', label: 'Mémorisé' },
                    PARTIEL:      { bg: '#fef9c3', color: '#854d0e', label: 'Partiel' },
                    NON_MEMORISE: { bg: '#fee2e2', color: '#991b1b', label: 'Non mémorisé' },
                    ABSENT:       { bg: '#f3f4f6', color: '#6b7280', label: 'Absent' },
                  };
                  const niv = niveauColors[r.niveauMemorisation] ?? niveauColors['NON_MEMORISE'];
                  return (
                    <tr key={r.id} style={{ opacity: r.present ? 1 : 0.6 }}>
                      <td className="py-2 px-3" style={{ verticalAlign: 'middle' }}>{r.elevePrenom}</td>
                      <td className="py-2 px-3 fw-semibold" style={{ verticalAlign: 'middle' }}>{r.eleveNom}</td>
                      <td className="py-2 px-3" style={{ verticalAlign: 'middle' }}>
                        {r.matricule ? (
                          <span className="badge rounded-pill" style={{ backgroundColor: '#f3f4f6', color: '#6b7280', fontSize: 10, fontFamily: 'monospace' }}>
                            {r.matricule}
                          </span>
                        ) : <span style={{ color: '#d1d5db' }}>—</span>}
                      </td>
                      <td className="py-2 px-3" style={{ verticalAlign: 'middle' }}>
                        {r.sourateNomArabe && <span style={{ fontFamily: 'serif', marginRight: 4, fontSize: 13 }}>{r.sourateNomArabe}</span>}
                        {r.sourateNom && <span style={{ color: '#9ca3af', fontSize: 11 }}>{r.sourateNom}</span>}
                        {!r.sourateNom && !r.sourateNomArabe && <span style={{ color: '#d1d5db' }}>—</span>}
                      </td>
                      <td className="py-2 px-3 text-center" style={{ verticalAlign: 'middle' }}>
                        {r.versetDebut ? <span className="badge" style={{ backgroundColor: '#f0fdf4', color: '#0A6E3F', fontWeight: 700 }}>{r.versetDebut}</span> : <span style={{ color: '#d1d5db' }}>—</span>}
                      </td>
                      <td className="py-2 px-3 text-center" style={{ verticalAlign: 'middle' }}>
                        {r.versetFin ? <span className="badge" style={{ backgroundColor: '#f0fdf4', color: '#0A6E3F', fontWeight: 700 }}>{r.versetFin}</span> : <span style={{ color: '#d1d5db' }}>—</span>}
                      </td>
                      <td className="py-2 px-3 text-center" style={{ verticalAlign: 'middle' }}>
                        <span className="badge rounded-pill" style={{ backgroundColor: niv.bg, color: niv.color, fontSize: 11, fontWeight: 600 }}>
                          {niv.label}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center" style={{ verticalAlign: 'middle' }}>
                        <span style={{ fontSize: 16 }}>{r.present ? '✅' : '❌'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 5 dernières séances enregistrées ── */}
      <div className="rounded-4 overflow-hidden" style={{ border: '1px solid #e8f5e9', boxShadow: '0 2px 12px rgba(10,110,63,0.06)' }}>
        <div className="p-3 d-flex align-items-center justify-content-between" style={{ background: 'linear-gradient(90deg, #f0fdf4 0%, #ffffff 100%)', borderBottom: '1px solid #e8f5e9' }}>
          <div className="d-flex align-items-center gap-2">
            <div style={{ width: 4, height: 18, backgroundColor: '#0A6E3F', borderRadius: 2 }} />
            <span className="fw-bold" style={{ fontSize: 14, color: '#0A6E3F' }}>🕐 Dernières séances enregistrées</span>
            <span className="badge rounded-pill" style={{ backgroundColor: '#d1fae5', color: '#065f46', fontSize: 11, fontWeight: 600 }}>
              {loadingDernieres ? '...' : `${dernieresSeances.length} séance(s)`}
            </span>
          </div>
          <button
            onClick={fetchDernieresSeances}
            className="btn btn-sm fw-medium d-flex align-items-center gap-1"
            style={{ fontSize: 12, color: '#0A6E3F', backgroundColor: 'transparent', border: '1px solid #bbf7d0', borderRadius: 8 }}
          >
            🔄 Actualiser
          </button>
        </div>

        {loadingDernieres ? (
          <div className="p-4 text-center text-muted" style={{ fontSize: 13 }}>
            <span className="spinner-border spinner-border-sm me-2" style={{ width: 14, height: 14, borderWidth: 2 }} />
            Chargement...
          </div>
        ) : dernieresSeances.length === 0 ? (
          <div className="p-4 text-center text-muted" style={{ fontSize: 13 }}>
            Aucune séance enregistrée ces 7 derniers jours
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0" style={{ fontSize: 13 }}>
              <thead style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <tr>
                  <th className="py-2 px-3 fw-semibold text-uppercase" style={{ fontSize: 11, color: '#6b7280' }}>Date</th>
                  <th className="py-2 px-3 fw-semibold text-uppercase" style={{ fontSize: 11, color: '#6b7280' }}>Classe</th>
                  <th className="py-2 px-3 fw-semibold text-uppercase" style={{ fontSize: 11, color: '#6b7280' }}>N° Séance</th>
                  <th className="py-2 px-3 fw-semibold text-uppercase" style={{ fontSize: 11, color: '#6b7280' }}>Récitateur</th>
                  <th className="py-2 px-3 fw-semibold text-uppercase text-center" style={{ fontSize: 11, color: '#6b7280' }}>Présents</th>
                  <th className="py-2 px-3 fw-semibold text-uppercase text-center" style={{ fontSize: 11, color: '#6b7280' }}>Mémorisés</th>
                  <th className="py-2 px-3 fw-semibold text-uppercase text-center" style={{ fontSize: 11, color: '#6b7280' }}>Total élèves</th>
                </tr>
              </thead>
              <tbody>
                {dernieresSeances.map((s: any, idx: number) => {
                  const recits: any[] = s.recitations ?? [];
                  const presents = recits.filter(r => r.present).length;
                  const memorises = recits.filter(r => r.niveauMemorisation === 'MEMORISE').length;
                  const total = recits.length;
                  const tauxPresence = total > 0 ? Math.round((presents / total) * 100) : 0;
                  return (
                    <tr key={s.id ?? idx}>
                      <td className="py-2 px-3" style={{ verticalAlign: 'middle' }}>
                        <span className="fw-semibold" style={{ color: '#111827' }}>
                          {s.date ? new Date(s.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </span>
                      </td>
                      <td className="py-2 px-3" style={{ verticalAlign: 'middle' }}>
                        <span className="badge rounded-pill" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontSize: 12, fontWeight: 600 }}>
                          {s.classeNiveau ?? '—'}
                        </span>
                      </td>
                      <td className="py-2 px-3" style={{ verticalAlign: 'middle', color: '#6b7280' }}>
                        Séance {s.numeroSeance ?? 1}
                      </td>
                      <td className="py-2 px-3" style={{ verticalAlign: 'middle' }}>
                        <span style={{ color: '#374151', fontWeight: 500 }}>{s.enseignantNom ?? '—'}</span>
                      </td>
                      <td className="py-2 px-3 text-center" style={{ verticalAlign: 'middle' }}>
                        <div className="d-flex align-items-center justify-content-center gap-1">
                          <span className="badge" style={{ backgroundColor: '#d1fae5', color: '#065f46', fontWeight: 700 }}>{presents}</span>
                          <span style={{ fontSize: 10, color: '#9ca3af' }}>{tauxPresence}%</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center" style={{ verticalAlign: 'middle' }}>
                        <span className="badge" style={{ backgroundColor: '#fef9c3', color: '#854d0e', fontWeight: 700 }}>{memorises}</span>
                      </td>
                      <td className="py-2 px-3 text-center" style={{ verticalAlign: 'middle', color: '#6b7280' }}>
                        {total}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Résultat de l'enregistrement — toujours visible même après reset du formulaire */}
      {saveResult && (
        <div
          className="rounded-3 p-3 d-flex align-items-start gap-3"
          style={{
            backgroundColor: saveResult.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${saveResult.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            borderLeft: `4px solid ${saveResult.type === 'success' ? '#0A6E3F' : '#dc2626'}`,
          }}
        >
          <span style={{ fontSize: 20, flexShrink: 0 }}>
            {saveResult.type === 'success' ? '✅' : '❌'}
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: saveResult.type === 'success' ? '#15803d' : '#dc2626', flex: 1 }}>
            {saveResult.message}
          </span>
          <button
            onClick={() => setSaveResult(null)}
            className="btn-close"
            style={{ fontSize: 10, flexShrink: 0 }}
            aria-label="Fermer"
          />
        </div>
      )}
    </div>
  );
}