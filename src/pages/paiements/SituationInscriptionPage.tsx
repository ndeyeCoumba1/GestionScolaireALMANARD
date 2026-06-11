import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { SituationPaiementDTO, PaiementDTO } from '../../Types/paiement';
import type { Inscription } from '../../Types/index';
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

export default function SituationInscriptionPage() {
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [situation, setSituation] = useState<SituationPaiementDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingInscriptions, setLoadingInscriptions] = useState(true);

  useEffect(() => {
    api.get('/inscriptions')
      .then(r => setInscriptions(r.data))
      .catch(() => {})
      .finally(() => setLoadingInscriptions(false));
  }, []);

  useEffect(() => {
    if (!selectedId) { setSituation(null); return; }
    setLoading(true);
    api.get(`/paiements/inscription/${selectedId}`)
      .then(r => setSituation(r.data))
      .catch(() => setSituation(null))
      .finally(() => setLoading(false));
  }, [selectedId]);

  const sel = inscriptions.find(i => i.id === Number(selectedId));

  return (
    <div className="d-flex flex-column gap-4">
      <PageHeader
        title="🎓 Situation Inscription"
        subtitle="Paiements"
        description="Consultez la situation de paiement d'une inscription."
      />

      {/* Sélecteur */}
      <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0' }}>
        <label className="form-label fw-semibold text-uppercase mb-2" style={{ fontSize: 11, color: '#6b7280', letterSpacing: '0.05em' }}>
          Sélectionner une inscription
        </label>
        {loadingInscriptions ? (
          <div className="text-muted" style={{ fontSize: 13 }}>Chargement...</div>
        ) : (
          <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
            className="form-select" style={{ ...selectStyle, maxWidth: 480 }}>
            <option value="">-- Choisir une inscription --</option>
            {inscriptions.map(i => (
              <option key={i.id} value={i.id}>
                {i.eleveNom} {i.elevePrenom} — {i.anneeLibelle} ({i.classeNiveau})
              </option>
            ))}
          </select>
        )}
      </div>

      {loading && (
        <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0' }}>
          <SkeletonTable rows={3} columns={5} />
        </div>
      )}

      {!loading && situation && (
        <>
          {/* Infos élève */}
          {sel && (
            <div className="bg-white rounded-4 shadow-sm px-4 py-3 d-flex flex-wrap gap-4 align-items-center"
              style={{ border: '1px solid #f0f0f0' }}>
              <div>
                <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Élève</div>
                <div className="fw-semibold" style={{ color: '#111827', fontSize: 15 }}>{sel.eleveNom} {sel.elevePrenom}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Classe</div>
                <div style={{ color: '#374151', fontSize: 14 }}>{sel.classeNiveau}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Année</div>
                <div style={{ color: '#374151', fontSize: 14 }}>{sel.anneeLibelle}</div>
              </div>
              <div className="ms-auto">
                <span className="badge rounded-pill fw-semibold px-3 py-2"
                  style={{
                    backgroundColor: STATUT_CONFIG[situation.statutGlobal]?.bg ?? '#f3f4f6',
                    color: STATUT_CONFIG[situation.statutGlobal]?.color ?? '#374151',
                    fontSize: 13,
                  }}>
                  {STATUT_CONFIG[situation.statutGlobal]?.label ?? situation.statutGlobal}
                </span>
              </div>
            </div>
          )}

          {/* KPI cards */}
          <div className="d-flex gap-3 flex-wrap">
            {[
              { icon: '💰', label: 'Total dû', value: situation.fraisInscriptionTotal, bg: '#f3f4f6', color: '#111827' },
              { icon: '✅', label: 'Montant payé', value: situation.fraisInscriptionPaye, bg: '#dcfce7', color: '#166534' },
              { icon: '⚠️', label: 'Reste à payer', value: situation.fraisInscriptionRestant, bg: situation.fraisInscriptionRestant > 0 ? '#fee2e2' : '#dcfce7', color: situation.fraisInscriptionRestant > 0 ? '#dc2626' : '#166534' },
            ].map((c, i) => (
              <div key={i} className="bg-white rounded-4 shadow-sm p-4 flex-fill" style={{ border: '1px solid #f0f0f0', minWidth: 200 }}>
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 48, height: 48, backgroundColor: c.bg, fontSize: 22, flexShrink: 0 }}>
                    {c.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{c.label}</div>
                    <div className="fw-bold" style={{ fontSize: 18, color: c.color }}>
                      {c.value.toLocaleString('fr-FR')} FCFA
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Barre de progression */}
          {situation.fraisInscriptionTotal > 0 && (
            <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0' }}>
              <div className="d-flex justify-content-between mb-2">
                <span style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>Taux de paiement</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0A6E3F' }}>
                  {Math.round((situation.fraisInscriptionPaye / situation.fraisInscriptionTotal) * 100)}%
                </span>
              </div>
              <div className="rounded-pill overflow-hidden" style={{ height: 12, backgroundColor: '#e5e7eb' }}>
                <div className="rounded-pill" style={{
                  height: '100%',
                  width: `${Math.min(Math.round((situation.fraisInscriptionPaye / situation.fraisInscriptionTotal) * 100), 100)}%`,
                  backgroundColor: situation.fraisInscriptionRestant === 0 ? '#0A6E3F' : '#f59e0b',
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>
          )}

          {/* Historique des paiements */}
          <div className="bg-white rounded-4 shadow-sm overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid #f3f4f6' }}>
              <p className="fw-semibold mb-0" style={{ fontSize: 14, color: '#111827' }}>
                Historique des paiements ({situation.historique.length})
              </p>
            </div>
            <div className="table-responsive">
              <table className="table align-middle mb-0" style={{ fontSize: 13 }}>
                <thead style={{ backgroundColor: '#f9fafb' }}>
                  <tr>
                    {['N° Reçu', 'Montant', 'Type', 'Date', 'Statut', 'Enregistré par'].map(h => (
                      <th key={h} className="py-3 px-3 fw-semibold text-uppercase"
                        style={{ color: '#9ca3af', fontSize: 10, letterSpacing: '0.05em', borderTop: '1px solid #f0f0f0' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {situation.historique.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-5 text-muted">Aucun paiement enregistré.</td></tr>
                  ) : situation.historique.map((p: PaiementDTO) => {
                    const s = STATUT_CONFIG[p.statut] ?? { label: p.statut, bg: '#f3f4f6', color: '#374151' };
                    return (
                      <tr key={p.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                        <td className="py-3 px-3 font-monospace" style={{ fontSize: 11, color: '#9ca3af' }}>{p.numeroRecu}</td>
                        <td className="py-3 px-3 fw-semibold" style={{ color: '#0f9d58' }}>{p.montant.toLocaleString('fr-FR')} FCFA</td>
                        <td className="py-3 px-3" style={{ color: '#374151' }}>{TYPE_LABELS[p.typePaiement] ?? p.typePaiement}</td>
                        <td className="py-3 px-3" style={{ color: '#9ca3af', fontSize: 12 }}>{p.datePaiement}</td>
                        <td className="py-3 px-3">
                          <span className="badge rounded-pill fw-medium" style={{ backgroundColor: s.bg, color: s.color, fontSize: 11, padding: '4px 10px' }}>
                            {s.label}
                          </span>
                        </td>
                        <td className="py-3 px-3" style={{ color: '#6b7280', fontSize: 12 }}>{p.enregistreParNom || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!loading && !situation && selectedId && (
        <div className="bg-white rounded-4 shadow-sm p-5 text-center" style={{ border: '1px solid #f0f0f0' }}>
          <p className="text-muted mb-0">Aucune situation trouvée pour cette inscription.</p>
        </div>
      )}

      {!selectedId && (
        <div className="bg-white rounded-4 shadow-sm p-5 text-center" style={{ border: '1px dashed #e5e7eb' }}>
          <div style={{ fontSize: 40 }}>🎓</div>
          <p className="fw-semibold mt-3 mb-1" style={{ color: '#374151' }}>Sélectionnez une inscription</p>
          <p className="text-muted mb-0" style={{ fontSize: 13 }}>Choisissez une inscription dans la liste pour voir sa situation de paiement.</p>
        </div>
      )}
    </div>
  );
}
