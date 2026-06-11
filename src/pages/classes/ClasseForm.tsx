import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { INPUT, LABEL, SUBMIT_BTN, CANCEL_BTN, SectionHeader } from '../../utils/formStyles';

interface ClasseFormProps { onClose: () => void; classeId?: number; }

const IcLayers = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.331.477-4.5 1.253"/></svg>;
const IcCog    = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;

const NIVEAUX = [
  { value: 'INTERNAT',     label: 'Internat',     color: '#1d4ed8', bg: '#dbeafe', border: '#93c5fd' },
  { value: 'DEMI_PENSION', label: 'Demi-pension', color: '#9a3412', bg: '#ffedd5', border: '#fdba74' },
  { value: 'EXTERNAT',     label: 'Externat',     color: '#166534', bg: '#dcfce7', border: '#86efac' },
];

export default function ClasseForm({ onClose, classeId }: ClasseFormProps) {
  const isEdit = !!classeId;
  const [form, setForm] = useState({ niveau: 'INTERNAT', capaciteMax: 30, statut: 'INSCRIT' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit || !classeId) return;
    api.get(`/classes/${classeId}`)
      .then(r => { const c = r.data; setForm({ niveau: c.niveau, capaciteMax: c.capaciteMax, statut: c.statut || 'INSCRIT' }); })
      .catch(() => setError('Impossible de charger cette classe.'))
      .finally(() => setFetching(false));
  }, [classeId, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      if (isEdit && classeId) await api.put(`/classes/${classeId}`, form);
      else await api.post('/classes', form);
      onClose();
    } catch { setError('Erreur lors de la sauvegarde. Vérifiez les champs.'); }
    finally { setLoading(false); }
  };

  if (fetching) return <div className="d-flex align-items-center justify-content-center py-5" style={{ color: '#9ca3af' }}><span className="spinner-border spinner-border-sm me-2" style={{ width: 18, height: 18, borderWidth: 2, color: '#10a050' }} /><span style={{ fontSize: 14 }}>Chargement...</span></div>;

  const selectedNiveau = NIVEAUX.find(n => n.value === form.niveau)!;

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        <SectionHeader title="Type de classe" icon={<IcLayers />} />

        <div className="col-12">
          <label className="form-label" style={LABEL}>Niveau <span className="text-danger">*</span></label>
          <div className="d-flex gap-2">
            {NIVEAUX.map(opt => (
              <div key={opt.value} onClick={() => setForm(p => ({ ...p, niveau: opt.value }))}
                style={{ flex: 1, cursor: 'pointer', textAlign: 'center', padding: '14px 8px', borderRadius: 10, border: `2px solid ${form.niveau === opt.value ? opt.border : '#e5e7eb'}`, backgroundColor: form.niveau === opt.value ? opt.bg : '#ffffff', transition: 'all 0.15s' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: form.niveau === opt.value ? opt.color : '#9ca3af' }}>{opt.label}</div>
                {form.niveau === opt.value && <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: opt.color, margin: '6px auto 0' }} />}
              </div>
            ))}
          </div>
        </div>

        <SectionHeader title="Configuration" icon={<IcCog />} />

        <div className="col-12 col-md-6">
          <label className="form-label" style={LABEL}>Capacité maximale <span className="text-danger">*</span></label>
          <div className="d-flex align-items-center gap-2">
            <button type="button" onClick={() => setForm(p => ({ ...p, capaciteMax: Math.max(1, p.capaciteMax - 1) }))} className="btn d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, borderRadius: 8, border: '1.5px solid #d1d5db', backgroundColor: '#f9fafb', fontSize: 18, color: '#374151', flexShrink: 0 }}>−</button>
            <input type="number" min={1} name="capaciteMax" value={form.capaciteMax} onChange={e => setForm(p => ({ ...p, capaciteMax: Number(e.target.value) }))} className="form-control text-center fw-bold" style={{ ...INPUT, fontSize: 16 }} required />
            <button type="button" onClick={() => setForm(p => ({ ...p, capaciteMax: p.capaciteMax + 1 }))} className="btn d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, borderRadius: 8, border: '1.5px solid #d1d5db', backgroundColor: '#f9fafb', fontSize: 18, color: '#374151', flexShrink: 0 }}>+</button>
          </div>
          <small style={{ fontSize: 11, color: '#9ca3af' }}>{form.capaciteMax} élève(s) maximum</small>
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label" style={LABEL}>Statut <span className="text-danger">*</span></label>
          <div className="d-flex gap-2">
            {[
              { v: 'INSCRIT',     l: 'Ouvert', color: '#166534', bg: '#f0fdf4', border: '#86efac' },
              { v: 'NON_INSCRIT', l: 'Fermé',  color: '#9a3412', bg: '#fff7ed', border: '#fdba74' },
            ].map(opt => (
              <div key={opt.v} onClick={() => setForm(p => ({ ...p, statut: opt.v }))}
                style={{ flex: 1, cursor: 'pointer', textAlign: 'center', padding: '10px 8px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: `1.5px solid ${form.statut === opt.v ? opt.border : '#e5e7eb'}`, backgroundColor: form.statut === opt.v ? opt.bg : '#ffffff', color: form.statut === opt.v ? opt.color : '#9ca3af', transition: 'all 0.15s' }}>
                {opt.l}
              </div>
            ))}
          </div>
        </div>

        <div className="col-12">
          <div className="p-3 rounded-3 d-flex align-items-center gap-3" style={{ backgroundColor: selectedNiveau.bg, border: `1.5px solid ${selectedNiveau.border}` }}>
            <span className="badge rounded-pill fw-semibold px-3 py-2" style={{ backgroundColor: selectedNiveau.bg, color: selectedNiveau.color, border: `1.5px solid ${selectedNiveau.border}`, fontSize: 12 }}>{selectedNiveau.label}</span>
            <span style={{ fontSize: 13, color: selectedNiveau.color, fontWeight: 600 }}>{form.capaciteMax} élève(s) · {form.statut === 'INSCRIT' ? 'Ouvert aux inscriptions' : 'Fermé'}</span>
          </div>
        </div>
      </div>

      {error && <div className="d-flex align-items-center gap-2 mt-3 p-3 rounded-3" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13 }}><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>{error}</div>}

      <div className="d-flex gap-3 mt-4">
        <button type="button" onClick={onClose} className="btn flex-fill fw-medium" style={CANCEL_BTN}>Annuler</button>
        <button type="submit" disabled={loading} className="btn flex-fill fw-semibold text-white d-flex align-items-center justify-content-center gap-2" style={SUBMIT_BTN(loading)}>
          {loading ? <><span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14, borderWidth: 2 }} /> Sauvegarde...</> : <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg> {isEdit ? 'Enregistrer les modifications' : 'Créer la classe'}</>}
        </button>
      </div>
    </form>
  );
}
