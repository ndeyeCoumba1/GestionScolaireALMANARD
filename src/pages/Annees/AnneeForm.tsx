import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { formatDateForInput } from '../../utils/dateUtils';
import { INPUT, INPUT_ICON, LABEL, SUBMIT_BTN, CANCEL_BTN, SectionHeader, FieldIcon } from '../../utils/formStyles';

interface AnneeFormProps { onClose: () => void; anneeId?: number; }

const IcText     = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/></svg>;
const IcCalendar = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>;
const IcToggle   = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;

export default function AnneeForm({ onClose, anneeId }: AnneeFormProps) {
  const isEdit = !!anneeId;
  const [form, setForm] = useState({ libelle: '', dateDebut: '', dateFin: '', actif: true });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit || !anneeId) return;
    api.get(`/annees/${anneeId}`)
      .then(r => { const a = r.data; setForm({ libelle: a.libelle, dateDebut: formatDateForInput(a.dateDebut), dateFin: formatDateForInput(a.dateFin), actif: a.actif }); })
      .catch(() => setError('Impossible de charger cette année scolaire.'))
      .finally(() => setFetching(false));
  }, [anneeId, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      if (isEdit && anneeId) await api.put(`/annees/${anneeId}`, form);
      else await api.post('/annees', form);
      onClose();
    } catch { setError('Erreur lors de la sauvegarde. Vérifiez les champs.'); }
    finally { setLoading(false); }
  };

  if (fetching) return <div className="d-flex align-items-center justify-content-center py-5" style={{ color: '#9ca3af' }}><span className="spinner-border spinner-border-sm me-2" style={{ width: 18, height: 18, borderWidth: 2, color: '#10a050' }} /><span style={{ fontSize: 14 }}>Chargement...</span></div>;

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        <SectionHeader title="Année scolaire" icon={<IcText />} />

        <div className="col-12">
          <label className="form-label" style={LABEL}>Libellé <span className="text-danger">*</span></label>
          <FieldIcon icon={<IcText />}>
            <input type="text" name="libelle" value={form.libelle} onChange={handleChange} required placeholder="Ex : 2024-2025" className="form-control" style={INPUT_ICON} />
          </FieldIcon>
          <small style={{ fontSize: 11, color: '#9ca3af' }}>Format recommandé : AAAA-AAAA</small>
        </div>

        <SectionHeader title="Période" icon={<IcCalendar />} />

        <div className="col-12 col-md-6">
          <label className="form-label" style={LABEL}>Date de début <span className="text-danger">*</span></label>
          <FieldIcon icon={<IcCalendar />}>
            <input type="date" name="dateDebut" value={form.dateDebut} onChange={handleChange} required className="form-control" style={INPUT_ICON} />
          </FieldIcon>
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label" style={LABEL}>Date de fin <span className="text-danger">*</span></label>
          <FieldIcon icon={<IcCalendar />}>
            <input type="date" name="dateFin" value={form.dateFin} onChange={handleChange} required className="form-control" style={INPUT_ICON} />
          </FieldIcon>
        </div>

        {form.dateDebut && form.dateFin && new Date(form.dateFin) > new Date(form.dateDebut) && (
          <div className="col-12">
            <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-3" style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#16a34a' }} />
              <span style={{ fontSize: 12, color: '#166534' }}>Durée : <strong>{Math.round((new Date(form.dateFin).getTime() - new Date(form.dateDebut).getTime()) / (1000 * 60 * 60 * 24 * 30))} mois</strong></span>
            </div>
          </div>
        )}

        <SectionHeader title="Statut" icon={<IcToggle />} />

        <div className="col-12">
          <div onClick={() => setForm(p => ({ ...p, actif: !p.actif }))} className="d-flex align-items-center gap-3 p-3 rounded-3"
            style={{ cursor: 'pointer', border: `1.5px solid ${form.actif ? '#86efac' : '#e5e7eb'}`, backgroundColor: form.actif ? '#f0fdf4' : '#f9fafb', transition: 'all 0.15s' }}>
            <div style={{ width: 42, height: 24, borderRadius: 12, transition: 'all 0.2s', backgroundColor: form.actif ? '#16a34a' : '#d1d5db', position: 'relative', flexShrink: 0 }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: '#fff', position: 'absolute', top: 3, left: form.actif ? 21 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: form.actif ? '#166534' : '#6b7280' }}>{form.actif ? 'Année active' : 'Année inactive'}</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>{form.actif ? 'Les inscriptions et paiements sont ouverts' : 'Aucune opération possible sur cette année'}</div>
            </div>
          </div>
          <input type="checkbox" name="actif" checked={form.actif} onChange={handleChange} hidden />
        </div>
      </div>

      {error && <div className="d-flex align-items-center gap-2 mt-3 p-3 rounded-3" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13 }}><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>{error}</div>}

      <div className="d-flex gap-3 mt-4">
        <button type="button" onClick={onClose} className="btn flex-fill fw-medium" style={CANCEL_BTN}>Annuler</button>
        <button type="submit" disabled={loading} className="btn flex-fill fw-semibold text-white d-flex align-items-center justify-content-center gap-2" style={SUBMIT_BTN(loading)}>
          {loading ? <><span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14, borderWidth: 2 }} /> Sauvegarde...</> : <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg> {isEdit ? 'Enregistrer les modifications' : "Créer l'année"}</>}
        </button>
      </div>
    </form>
  );
}
