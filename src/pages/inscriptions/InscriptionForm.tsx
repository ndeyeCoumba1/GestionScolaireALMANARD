import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { Eleve, Classe } from '../../Types/index';
import { INPUT, INPUT_ICON, LABEL, SUBMIT_BTN, CANCEL_BTN, FCFA_SUFFIX, SectionHeader, FieldIcon } from '../../utils/formStyles';

interface InscriptionFormProps { onClose: () => void; inscriptionId?: number; }

const IcPerson = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>;
const IcCap   = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>;
const IcCoin  = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;

export default function InscriptionForm({ onClose, inscriptionId }: InscriptionFormProps) {
  const isEdit = !!inscriptionId;
  const [form, setForm] = useState({ eleveId: '', classeId: '', frais: '', montantPaye: '', montantAttendu: '' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);

  const paye    = Number(form.montantPaye)    || 0;
  const attendu = Number(form.montantAttendu) || 0;
  const statusPmt = attendu > 0 ? (paye >= attendu ? 'SOLDÉ' : paye > 0 ? 'PARTIEL' : null) : null;
  const pct = attendu > 0 ? Math.min(100, Math.round((paye / attendu) * 100)) : 0;

  useEffect(() => {
    api.get('/eleves').then(r => setEleves(r.data));
    api.get('/classes').then(r => setClasses(r.data));
    if (isEdit && inscriptionId) {
      api.get(`/inscriptions/${inscriptionId}`)
        .then(r => { const i = r.data; setForm({ eleveId: i.eleve?.id?.toString() || '', classeId: i.classe?.id?.toString() || '', frais: i.fraisInscription?.toString() || '', montantPaye: i.montantPaye?.toString() || '', montantAttendu: i.montantAttendu?.toString() || '' }); })
        .catch(() => setError('Impossible de charger cette inscription.'))
        .finally(() => setFetching(false));
    }
  }, [inscriptionId, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setForm(prev => ({ ...prev, [e.target.name]: e.target.value })); if (error) setError(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      if (isEdit && inscriptionId) {
        await api.put(`/inscriptions/${inscriptionId}`, { fraisInscription: Number(form.frais), montantPaye: form.montantPaye ? Number(form.montantPaye) : undefined, montantAttendu: form.montantAttendu ? Number(form.montantAttendu) : undefined });
      } else {
        await api.post(`/inscriptions/inscrire?eleveId=${form.eleveId}&classeId=${form.classeId}&fraisInscription=${form.frais}`);
      }
      onClose();
    } catch (err: any) { setError(err.response?.data?.message || err.response?.data || "Erreur lors de l'inscription"); }
    finally { setLoading(false); }
  };

  if (fetching) return <div className="d-flex align-items-center justify-content-center py-5" style={{ color: '#9ca3af' }}><span className="spinner-border spinner-border-sm me-2" style={{ width: 18, height: 18, borderWidth: 2, color: '#10a050' }} /><span style={{ fontSize: 14 }}>Chargement...</span></div>;

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        <SectionHeader title="Affectation" icon={<IcPerson />} />

        <div className="col-12 col-md-6">
          <label className="form-label" style={LABEL}>Élève <span className="text-danger">*</span></label>
          <FieldIcon icon={<IcPerson />}>
            <select name="eleveId" value={form.eleveId} onChange={handleChange} required disabled={isEdit} className="form-select" style={{ ...INPUT_ICON, ...(isEdit ? { opacity: 0.6, cursor: 'not-allowed' } : {}) }}>
              <option value="">Choisir un élève</option>
              {eleves.map(e => <option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>)}
            </select>
          </FieldIcon>
          {isEdit && <small style={{ fontSize: 11, color: '#9ca3af' }}>Non modifiable après inscription</small>}
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label" style={LABEL}>Classe <span className="text-danger">*</span></label>
          <FieldIcon icon={<IcCap />}>
            <select name="classeId" value={form.classeId} onChange={handleChange} required disabled={isEdit} className="form-select" style={{ ...INPUT_ICON, ...(isEdit ? { opacity: 0.6, cursor: 'not-allowed' } : {}) }}>
              <option value="">Choisir une classe</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.niveau}</option>)}
            </select>
          </FieldIcon>
          {isEdit && <small style={{ fontSize: 11, color: '#9ca3af' }}>Non modifiable après inscription</small>}
        </div>

        <SectionHeader title="Frais d'inscription" icon={<IcCoin />} />

        <div className="col-12 col-md-6">
          <label className="form-label" style={LABEL}>Frais d'inscription <span className="text-danger">*</span></label>
          <div className="input-group">
            <FieldIcon icon={<IcCoin />}>
              <input type="number" name="frais" value={form.frais} onChange={handleChange} required placeholder="Ex : 25 000" className="form-control" style={{ ...INPUT_ICON, borderRadius: '8px 0 0 8px' }} />
            </FieldIcon>
            <span className="input-group-text" style={FCFA_SUFFIX}>FCFA</span>
          </div>
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

        {isEdit && (
          <div className="col-12 col-md-6">
            <label className="form-label" style={LABEL}>Montant déjà payé</label>
            <div className="input-group">
              <FieldIcon icon={<IcCoin />}>
                <input type="number" name="montantPaye" value={form.montantPaye} onChange={handleChange} placeholder="Ex : 15 000" className="form-control" style={{ ...INPUT_ICON, borderRadius: '8px 0 0 8px' }} />
              </FieldIcon>
              <span className="input-group-text" style={FCFA_SUFFIX}>FCFA</span>
            </div>
          </div>
        )}

        {statusPmt && (
          <div className="col-12">
            <div className="p-3 rounded-3" style={{ backgroundColor: statusPmt === 'SOLDÉ' ? '#f0fdf4' : '#fff7ed', border: `1.5px solid ${statusPmt === 'SOLDÉ' ? '#86efac' : '#fed7aa'}` }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span style={{ fontSize: 12, fontWeight: 700, color: statusPmt === 'SOLDÉ' ? '#166534' : '#c2410c' }}>{statusPmt === 'SOLDÉ' ? 'Frais soldés' : 'Paiement partiel'}</span>
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
          {loading ? <><span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14, borderWidth: 2 }} /> Sauvegarde...</> : <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg> {isEdit ? 'Enregistrer les modifications' : 'Inscrire'}</>}
        </button>
      </div>
    </form>
  );
}
