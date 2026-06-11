import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { Mois } from '../../Types/index';
import { INPUT, INPUT_ICON, LABEL, SUBMIT_BTN, CANCEL_BTN, FCFA_SUFFIX, SectionHeader, FieldIcon } from '../../utils/formStyles';

interface DepenseFormProps { onClose: () => void; depenseId?: number; }

const IcTag      = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>;
const IcCoin     = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const IcCalendar = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>;
const IcInfo     = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;

const TYPES_DEPENSE = [
  'Facture_Eau', 'Achat_Woyofal', 'Transport', 'Carburant',
  'Salaire', 'Rechage_Gaz', 'Depense_Gestion_Interne',
  'Restitution_Frais_Scolaire', 'Medical', 'Dettes', 'Social',
  'Fourniture_Scolaire', 'Charbon', 'Denrees', 'PRET',
  'Vidange', 'Cartouche_Imprimante', 'Traveaux_Daradji',
];

export default function DepenseForm({ onClose, depenseId }: DepenseFormProps) {
  const isEdit = !!depenseId;
  const [mois, setMois] = useState<Mois[]>([]);
  const [form, setForm] = useState({ typeDepense: 'Facture_Eau', description: '', montant: '', dateDepense: new Date().toISOString().split('T')[0], moisId: '' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/mois').then(r => setMois(r.data));
    if (isEdit && depenseId) {
      api.get(`/depenses/${depenseId}`)
        .then(r => { const d = r.data; setForm({ typeDepense: d.typeDepense, description: d.description || '', montant: d.montant.toString(), dateDepense: d.dateDepense, moisId: d.moisId?.toString() || '' }); })
        .catch(() => setError('Impossible de charger cette dépense.'))
        .finally(() => setFetching(false));
    }
  }, [depenseId, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setForm(prev => ({ ...prev, [e.target.name]: e.target.value })); if (error) setError(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const payload = { typeDepense: form.typeDepense, description: form.description, montant: Number(form.montant), dateDepense: form.dateDepense, ...(form.moisId && { mois: { id: Number(form.moisId) } }) };
      if (isEdit && depenseId) await api.put(`/depenses/${depenseId}`, payload);
      else await api.post('/depenses', payload);
      onClose();
    } catch { setError('Erreur lors de la sauvegarde. Vérifiez les champs.'); }
    finally { setLoading(false); }
  };

  if (fetching) return <div className="d-flex align-items-center justify-content-center py-5" style={{ color: '#9ca3af' }}><span className="spinner-border spinner-border-sm me-2" style={{ width: 18, height: 18, borderWidth: 2, color: '#10a050' }} /><span style={{ fontSize: 14 }}>Chargement...</span></div>;

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        <SectionHeader title="Dépense" icon={<IcTag />} />

        <div className="col-12 col-md-6">
          <label className="form-label" style={LABEL}>Type de dépense <span className="text-danger">*</span></label>
          <FieldIcon icon={<IcTag />}>
            <select name="typeDepense" value={form.typeDepense} onChange={handleChange} className="form-select" style={INPUT_ICON}>
              {TYPES_DEPENSE.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </select>
          </FieldIcon>
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label" style={LABEL}>Montant <span className="text-danger">*</span></label>
          <div className="input-group">
            <FieldIcon icon={<IcCoin />}>
              <input type="number" name="montant" value={form.montant} onChange={handleChange} required placeholder="Ex : 15 000" className="form-control" style={{ ...INPUT_ICON, borderRadius: '8px 0 0 8px' }} />
            </FieldIcon>
            <span className="input-group-text" style={FCFA_SUFFIX}>FCFA</span>
          </div>
        </div>

        <div className="col-12">
          <label className="form-label" style={LABEL}>Date <span className="text-danger">*</span></label>
          <FieldIcon icon={<IcCalendar />}>
            <input type="date" name="dateDepense" value={form.dateDepense} onChange={handleChange} required className="form-control" style={INPUT_ICON} />
          </FieldIcon>
        </div>

        <SectionHeader title="Informations complémentaires" icon={<IcInfo />} />

        <div className="col-12 col-md-6">
          <label className="form-label" style={LABEL}>Mois concerné</label>
          <FieldIcon icon={<IcCalendar />}>
            <select name="moisId" value={form.moisId} onChange={handleChange} className="form-select" style={INPUT_ICON}>
              <option value="">Choisir un mois</option>
              {mois.map(m => <option key={m.id} value={m.id}>{m.libelle}</option>)}
            </select>
          </FieldIcon>
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label" style={LABEL}>Description</label>
          <FieldIcon icon={<IcInfo />}>
            <input type="text" name="description" value={form.description} onChange={handleChange} placeholder="Détails optionnels..." className="form-control" style={INPUT_ICON} />
          </FieldIcon>
        </div>
      </div>

      {error && <div className="d-flex align-items-center gap-2 mt-3 p-3 rounded-3" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13 }}><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>{error}</div>}

      <div className="d-flex gap-3 mt-4">
        <button type="button" onClick={onClose} className="btn flex-fill fw-medium" style={CANCEL_BTN}>Annuler</button>
        <button type="submit" disabled={loading} className="btn flex-fill fw-semibold text-white d-flex align-items-center justify-content-center gap-2" style={SUBMIT_BTN(loading)}>
          {loading ? <><span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14, borderWidth: 2 }} /> Sauvegarde...</> : <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg> {isEdit ? 'Enregistrer les modifications' : 'Enregistrer'}</>}
        </button>
      </div>
    </form>
  );
}
