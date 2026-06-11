import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { Mois, Eleve, TypePaiement } from '../../Types/index';
import { INPUT_ICON, LABEL, SUBMIT_BTN, CANCEL_BTN, FCFA_SUFFIX, SectionHeader, FieldIcon } from '../../utils/formStyles';

interface PaiementFormProps { onClose: () => void; paiementId?: number; }

const IcPerson  = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>;
const IcCoin    = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const IcTag     = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>;
const IcCalendar= () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>;
const IcCard    = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>;
const IcInfo    = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;

const MOTIFS = [{ value: 'MENSUALITE', label: 'Mensualité' }, { value: 'INSCRIPTION', label: 'Inscription' }, { value: 'REMBOURSEMENT', label: 'Remboursement' }];
const MOYENS = [
  { value: 'ESPECES',      label: 'Espèces',      color: '#166534', bg: '#f0fdf4', border: '#86efac' },
  { value: 'WAVE',         label: 'Wave',          color: '#1d4ed8', bg: '#eff6ff', border: '#93c5fd' },
  { value: 'CHEQUE',       label: 'Chèque',        color: '#6b21a8', bg: '#faf5ff', border: '#d8b4fe' },
  { value: 'ORANGE_MONEY', label: 'Orange Money',  color: '#c2410c', bg: '#fff7ed', border: '#fdba74' },
];

export default function PaiementForm({ onClose, paiementId }: PaiementFormProps) {
  const isEdit = !!paiementId;
  const [mois, setMois] = useState<Mois[]>([]);
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [form, setForm] = useState({ eleveId: '', montant: '', motif: 'MENSUALITE', moisId: '', typePaiement: 'ESPECES' as TypePaiement, montantAttendu: '', inscriptionId: '' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');

  const paye = Number(form.montant) || 0;
  const attendu = Number(form.montantAttendu) || 0;
  const statusPmt = attendu > 0 ? (paye >= attendu ? 'SOLDÉ' : paye > 0 ? 'PARTIEL' : null) : null;
  const pct = attendu > 0 ? Math.min(100, Math.round((paye / attendu) * 100)) : 0;

  useEffect(() => {
    api.get('/mois').then(r => setMois(r.data));
    api.get('/eleves').then(r => setEleves(r.data));
    if (isEdit && paiementId) {
      api.get(`/paiements/${paiementId}`)
        .then(r => { const p = r.data; setForm({ eleveId: p.eleveId?.toString() || '', montant: p.montant?.toString() || '', motif: p.motif || 'MENSUALITE', moisId: p.moisId?.toString() || '', typePaiement: p.typePaiement || 'ESPECES', montantAttendu: p.montantAttendu?.toString() || '', inscriptionId: p.inscriptionId?.toString() || '' }); })
        .catch(() => setError('Impossible de charger ce paiement.'))
        .finally(() => setFetching(false));
    }
  }, [paiementId, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); if (error) setError(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ montant: form.montant, motif: form.motif, typePaiement: form.typePaiement, ...(form.moisId && { moisId: form.moisId }), ...(form.montantAttendu && { montantAttendu: form.montantAttendu }), ...(form.inscriptionId && { inscriptionId: form.inscriptionId }) });
      if (isEdit && paiementId) await api.put(`/paiements/${paiementId}/modifier?${params}`);
      else await api.post(`/paiements/enregistrer?${new URLSearchParams({ eleveId: form.eleveId, ...params })}`);
      onClose();
    } catch (err: any) { setError(err.response?.data?.message || 'Erreur lors du paiement'); }
    finally { setLoading(false); }
  };

  if (fetching) return <div className="d-flex align-items-center justify-content-center py-5" style={{ color: '#9ca3af' }}><span className="spinner-border spinner-border-sm me-2" style={{ width: 18, height: 18, borderWidth: 2, color: '#10a050' }} /><span style={{ fontSize: 14 }}>Chargement...</span></div>;

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        {!isEdit && (
          <>
            <SectionHeader title="Bénéficiaire" icon={<IcPerson />} />
            <div className="col-12">
              <label className="form-label" style={LABEL}>Élève <span className="text-danger">*</span></label>
              <FieldIcon icon={<IcPerson />}>
                <select name="eleveId" value={form.eleveId} onChange={handleChange} required className="form-select" style={INPUT_ICON}>
                  <option value="">Choisir un élève</option>
                  {eleves.map(e => <option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>)}
                </select>
              </FieldIcon>
            </div>
          </>
        )}

        <SectionHeader title="Détails du paiement" icon={<IcCoin />} />

        <div className="col-12 col-md-6">
          <label className="form-label" style={LABEL}>Montant payé <span className="text-danger">*</span></label>
          <div className="input-group">
            <FieldIcon icon={<IcCoin />}>
              <input type="number" name="montant" value={form.montant} onChange={handleChange} required placeholder="Ex : 25 000" className="form-control" style={{ ...INPUT_ICON, borderRadius: '8px 0 0 8px' }} />
            </FieldIcon>
            <span className="input-group-text" style={FCFA_SUFFIX}>FCFA</span>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label" style={LABEL}>Motif <span className="text-danger">*</span></label>
          <FieldIcon icon={<IcTag />}>
            <select name="motif" value={form.motif} onChange={handleChange} className="form-select" style={INPUT_ICON}>
              {MOTIFS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </FieldIcon>
        </div>

        <div className="col-12">
          <label className="form-label" style={LABEL}>Moyen de paiement <span className="text-danger">*</span></label>
          <div className="d-flex gap-2 flex-wrap">
            {MOYENS.map(opt => (
              <div key={opt.value} onClick={() => setForm(p => ({ ...p, typePaiement: opt.value as TypePaiement }))}
                className="d-flex align-items-center justify-content-center gap-1"
                style={{ flex: '1 1 auto', cursor: 'pointer', padding: '9px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1.5px solid ${form.typePaiement === opt.value ? opt.border : '#e5e7eb'}`, backgroundColor: form.typePaiement === opt.value ? opt.bg : '#ffffff', color: form.typePaiement === opt.value ? opt.color : '#9ca3af', transition: 'all 0.15s' }}>
                <IcCard />{opt.label}
              </div>
            ))}
          </div>
        </div>

        <SectionHeader title="Informations complémentaires" icon={<IcInfo />} />

        <div className="col-12 col-md-6">
          <label className="form-label" style={LABEL}>Mois</label>
          <FieldIcon icon={<IcCalendar />}>
            <select name="moisId" value={form.moisId} onChange={handleChange} className="form-select" style={INPUT_ICON}>
              <option value="">Choisir un mois</option>
              {mois.map(m => <option key={m.id} value={m.id}>{m.libelle}</option>)}
            </select>
          </FieldIcon>
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label" style={LABEL}>Montant attendu</label>
          <div className="input-group">
            <FieldIcon icon={<IcCoin />}>
              <input type="number" name="montantAttendu" value={form.montantAttendu} onChange={handleChange} placeholder="Ex : 25 000" className="form-control" style={{ ...INPUT_ICON, borderRadius: '8px 0 0 8px' }} />
            </FieldIcon>
            <span className="input-group-text" style={FCFA_SUFFIX}>FCFA</span>
          </div>
        </div>

        {statusPmt && (
          <div className="col-12">
            <div className="p-3 rounded-3" style={{ backgroundColor: statusPmt === 'SOLDÉ' ? '#f0fdf4' : '#fff7ed', border: `1.5px solid ${statusPmt === 'SOLDÉ' ? '#86efac' : '#fed7aa'}` }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span style={{ fontSize: 12, fontWeight: 700, color: statusPmt === 'SOLDÉ' ? '#166534' : '#c2410c' }}>{statusPmt === 'SOLDÉ' ? 'Paiement complet' : 'Paiement partiel'}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: statusPmt === 'SOLDÉ' ? '#166534' : '#c2410c' }}>{pct}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 4, backgroundColor: '#e5e7eb', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, borderRadius: 4, backgroundColor: statusPmt === 'SOLDÉ' ? '#16a34a' : '#f97316', transition: 'width 0.3s' }} />
              </div>
              <div className="d-flex justify-content-between mt-1">
                <span style={{ fontSize: 11, color: '#6b7280' }}>Payé : {paye.toLocaleString('fr-FR')} FCFA</span>
                <span style={{ fontSize: 11, color: '#6b7280' }}>Attendu : {attendu.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && <div className="d-flex align-items-center gap-2 mt-3 p-3 rounded-3" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13 }}><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>{error}</div>}

      <div className="d-flex gap-3 mt-4">
        <button type="button" onClick={onClose} className="btn flex-fill fw-medium" style={CANCEL_BTN}>Annuler</button>
        <button type="submit" disabled={loading} className="btn flex-fill fw-semibold text-white d-flex align-items-center justify-content-center gap-2" style={SUBMIT_BTN(loading)}>
          {loading ? <><span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14, borderWidth: 2 }} /> Sauvegarde...</> : <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg> {isEdit ? 'Modifier le paiement' : 'Enregistrer le paiement'}</>}
        </button>
      </div>
    </form>
  );
}
