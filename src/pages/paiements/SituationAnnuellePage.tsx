import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { SituationAnnuelleEleveDTO, SituationMensuelleDTO } from '../../Types/paiement';
import type { Eleve, Annee } from '../../Types/index';
import PageHeader from '../../components/Common/PageHeader';
import { SkeletonTable } from '../../components/Common/SkeletonLoader';

const STATUT_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  PAYE:       { label: '✅ Payé',       bg: '#dcfce7', color: '#166534' },
  PARTIEL:    { label: '⚠️ Partiel',    bg: '#fef3c7', color: '#92400e' },
  IMPAYE:     { label: '❌ Impayé',     bg: '#fee2e2', color: '#991b1b' },
  EN_ATTENTE: { label: '⏳ En attente', bg: '#dbeafe', color: '#1e40af' },
  ANNULE:     { label: '🚫 Annulé',     bg: '#f3f4f6', color: '#6b7280' },
};

const TYPE_LABELS: Record<string, string> = {
  ESPECES: 'Espèces', WAVE: 'Wave', CHEQUE: 'Chèque', ORANGE_MONEY: 'Orange Money',
};

const selectStyle = {
  borderRadius: 10, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb',
  fontSize: 14, padding: '10px 14px', color: '#374151',
} as const;

export default function SituationAnnuellePage() {
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [annees, setAnnees] = useState<Annee[]>([]);
  const [selectedEleveId, setSelectedEleveId] = useState('');
  const [selectedAnneeId, setSelectedAnneeId] = useState('');
  const [situation, setSituation] = useState<SituationAnnuelleEleveDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingRef, setLoadingRef] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get('/eleves'),
      api.get('/annees'),
    ]).then(([elevesRes, anneesRes]) => {
      if (elevesRes.status === 'fulfilled') setEleves(elevesRes.value.data);
      if (anneesRes.status === 'fulfilled') {
        const sorted = [...anneesRes.value.data].sort((a: Annee, b: Annee) => b.id - a.id);
        setAnnees(sorted);
        const actif = sorted.find((a: Annee) => a.actif);
        if (actif) setSelectedAnneeId(String(actif.id));
      }
    }).finally(() => setLoadingRef(false));
  }, []);

  const handleSearch = () => {
    if (!selectedEleveId || !selectedAnneeId) return;
    setLoading(true);
    api.get(`/paiements/situation-annuelle?eleveId=${selectedEleveId}&anneeId=${selectedAnneeId}`)
      .then(r => setSituation(r.data))
      .catch(() => setSituation(null))
      .finally(() => setLoading(false));
  };

  return (
    <div className="d-flex flex-column gap-4">
      <PageHeader
        title="📅 Situation Annuelle"
        subtitle="Paiements"
        description="Consultez la situation mensuelle de scolarité d'un élève pour une année donnée."
      />

      {/* Filtres */}
      <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0' }}>
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-4">
            <label className="form-label fw-semibold text-uppercase mb-2" style={{ fontSize: 11, color: '#6b7280', letterSpacing: '0.05em' }}>
              Élève
            </label>
            {loadingRef ? <div className="text-muted" style={{ fontSize: 13 }}>Chargement...</div> : (
              <select value={selectedEleveId} onChange={e => setSelectedEleveId(e.target.value)}
                className="form-select" style={selectStyle}>
                <option value="">-- Choisir un élève --</option>
                {eleves.map(e => (
                  <option key={e.id} value={e.id}>{e.nom} {e.prenom}{e.matricule ? ` (${e.matricule})` : ''}</option>
                ))}
              </select>
            )}
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label fw-semibold text-uppercase mb-2" style={{ fontSize: 11, color: '#6b7280', letterSpacing: '0.05em' }}>
              Année scolaire
            </label>
            <select value={selectedAnneeId} onChange={e => setSelectedAnneeId(e.target.value)}
              className="form-select" style={selectStyle}>
              <option value="">-- Choisir une année --</option>
              {annees.map(a => (
                <option key={a.id} value={a.id}>{a.libelle}{a.actif ? ' (en cours)' : ''}</option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-4">
            <button onClick={handleSearch} disabled={!selectedEleveId || !selectedAnneeId || loading}
              className="btn fw-semibold w-100"
              style={{ background: 'linear-gradient(135deg, #0A6E3F, #16a34a)', color: '#fff', borderRadius: 10, padding: '10px 0', fontSize: 14, border: 'none', opacity: (!selectedEleveId || !selectedAnneeId) ? 0.5 : 1 }}>
              {loading ? '⏳ Chargement...' : '🔍 Voir la situation'}
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0' }}>
          <SkeletonTable rows={6} columns={7} />
        </div>
      )}

      {!loading && situation && (
        <>
          {/* En-tête élève */}
          <div className="bg-white rounded-4 shadow-sm px-4 py-3 d-flex flex-wrap gap-4 align-items-center"
            style={{ border: '1px solid #f0f0f0' }}>
            <div>
              <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Élève</div>
              <div className="fw-semibold" style={{ color: '#111827', fontSize: 15 }}>{situation.eleveNom} {situation.elevePrenom}</div>
            </div>
            {situation.matricule && (
              <div>
                <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Matricule</div>
                <div className="font-monospace" style={{ color: '#374151', fontSize: 13 }}>{situation.matricule}</div>
              </div>
            )}
          </div>

          {/* KPI */}
          <div className="d-flex gap-3 flex-wrap">
            {[
              { icon: '💰', label: 'Total attendu',  value: situation.totalAttendu,  bg: '#f3f4f6', color: '#111827' },
              { icon: '✅', label: 'Total payé',     value: situation.totalPaye,     bg: '#dcfce7', color: '#166534' },
              { icon: '⚠️', label: 'Total restant',  value: situation.totalRestant,  bg: situation.totalRestant > 0 ? '#fee2e2' : '#dcfce7', color: situation.totalRestant > 0 ? '#dc2626' : '#166534' },
            ].map((c, i) => (
              <div key={i} className="bg-white rounded-4 shadow-sm p-4 flex-fill" style={{ border: '1px solid #f0f0f0', minWidth: 190 }}>
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 48, height: 48, backgroundColor: c.bg, fontSize: 22, flexShrink: 0 }}>
                    {c.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{c.label}</div>
                    <div className="fw-bold" style={{ fontSize: 17, color: c.color }}>{c.value.toLocaleString('fr-FR')} FCFA</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Barre progression annuelle */}
          {situation.totalAttendu > 0 && (
            <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0' }}>
              <div className="d-flex justify-content-between mb-2">
                <span style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>Taux de recouvrement annuel</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0A6E3F' }}>
                  {Math.round((situation.totalPaye / situation.totalAttendu) * 100)}%
                </span>
              </div>
              <div className="rounded-pill overflow-hidden" style={{ height: 12, backgroundColor: '#e5e7eb' }}>
                <div className="rounded-pill" style={{
                  height: '100%',
                  width: `${Math.min(Math.round((situation.totalPaye / situation.totalAttendu) * 100), 100)}%`,
                  backgroundColor: situation.totalRestant === 0 ? '#0A6E3F' : '#f59e0b',
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>
          )}

          {/* Tableau mensuel */}
          <div className="bg-white rounded-4 shadow-sm overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid #f3f4f6' }}>
              <p className="fw-semibold mb-0" style={{ fontSize: 14, color: '#111827' }}>
                Détail par mois ({situation.mois.length} mois)
              </p>
            </div>
            <div className="table-responsive">
              <table className="table align-middle mb-0" style={{ fontSize: 13 }}>
                <thead style={{ backgroundColor: '#f9fafb' }}>
                  <tr>
                    {['Mois', 'Attendu', 'Payé', 'Reste', 'Statut', 'N° Reçu', 'Date paiement', 'Mode'].map(h => (
                      <th key={h} className="py-3 px-3 fw-semibold text-uppercase"
                        style={{ color: '#9ca3af', fontSize: 10, letterSpacing: '0.05em', borderTop: '1px solid #f0f0f0', whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {situation.mois.map((m: SituationMensuelleDTO) => {
                    const s = STATUT_CONFIG[m.statut] ?? { label: m.statut, bg: '#f3f4f6', color: '#374151' };
                    return (
                      <tr key={m.moisId} style={{ borderTop: '1px solid #f3f4f6' }}>
                        <td className="py-3 px-3 fw-medium" style={{ color: '#111827' }}>{m.moisLibelle}</td>
                        <td className="py-3 px-3 text-end" style={{ color: '#374151' }}>
                          {m.montantAttendu != null ? `${m.montantAttendu.toLocaleString('fr-FR')} FCFA` : '—'}
                        </td>
                        <td className="py-3 px-3 fw-semibold text-end" style={{ color: '#166534' }}>
                          {m.montantPaye.toLocaleString('fr-FR')} FCFA
                        </td>
                        <td className="py-3 px-3 text-end" style={{ color: (m.resteAPayer ?? 0) > 0 ? '#dc2626' : '#6b7280' }}>
                          {m.resteAPayer != null ? `${m.resteAPayer.toLocaleString('fr-FR')} FCFA` : '—'}
                        </td>
                        <td className="py-3 px-3">
                          <span className="badge rounded-pill fw-medium" style={{ backgroundColor: s.bg, color: s.color, fontSize: 11, padding: '4px 10px' }}>
                            {s.label}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-monospace" style={{ fontSize: 11, color: '#9ca3af' }}>{m.numeroRecu || '—'}</td>
                        <td className="py-3 px-3" style={{ color: '#9ca3af', fontSize: 12, whiteSpace: 'nowrap' }}>{m.datePaiement || '—'}</td>
                        <td className="py-3 px-3" style={{ color: '#374151' }}>{m.typePaiement ? (TYPE_LABELS[m.typePaiement] ?? m.typePaiement) : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!loading && !situation && selectedEleveId && selectedAnneeId && (
        <div className="bg-white rounded-4 shadow-sm p-5 text-center" style={{ border: '1px solid #f0f0f0' }}>
          <p className="text-muted mb-0">Cliquez sur "Voir la situation" pour charger les données.</p>
        </div>
      )}

      {!selectedEleveId && !selectedAnneeId && (
        <div className="bg-white rounded-4 shadow-sm p-5 text-center" style={{ border: '1px dashed #e5e7eb' }}>
          <div style={{ fontSize: 40 }}>📅</div>
          <p className="fw-semibold mt-3 mb-1" style={{ color: '#374151' }}>Sélectionnez un élève et une année</p>
          <p className="text-muted mb-0" style={{ fontSize: 13 }}>La situation mensuelle de scolarité s'affichera ici.</p>
        </div>
      )}
    </div>
  );
}
