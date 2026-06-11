import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { INPUT_ICON, LABEL, SUBMIT_BTN, CANCEL_BTN, SectionHeader, FieldIcon } from '../../utils/formStyles';

interface ParentFormProps { onClose: () => void; parentId?: number; }

const IcPerson    = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>;
const IcPhone     = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>;
const IcMail      = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>;
const IcPin       = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
const IcBriefcase = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>;

export default function ParentForm({ onClose, parentId }: ParentFormProps) {
  const isEdit = !!parentId;
  const [form, setForm] = useState({ nom: '', prenom: '', telephone: '', email: '', adresse: '', profession: '' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit || !parentId) return;
    api.get(`/parents/${parentId}`)
      .then(r => { const p = r.data; setForm({ nom: p.nom ?? '', prenom: p.prenom ?? '', telephone: p.telephone ?? '', email: p.email ?? '', adresse: p.adresse ?? '', profession: p.profession ?? '' }); })
      .catch(() => setError('Impossible de charger ce parent.'))
      .finally(() => setFetching(false));
  }, [parentId, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); if (error) setError(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      if (isEdit && parentId) await api.put(`/parents/${parentId}`, form);
      else await api.post('/parents', form);
      onClose();
    } catch { setError('Erreur lors de la sauvegarde. Vérifiez les champs.'); }
    finally { setLoading(false); }
  };

  if (fetching) return <div className="d-flex align-items-center justify-content-center py-5" style={{ color: '#9ca3af' }}><span className="spinner-border spinner-border-sm me-2" style={{ width: 18, height: 18, borderWidth: 2, color: '#10a050' }} /><span style={{ fontSize: 14 }}>Chargement...</span></div>;

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        <SectionHeader title="Identité" icon={<IcPerson />} />

        <div className="col-12 col-md-6">
          <label className="form-label" style={LABEL}>Nom <span className="text-danger">*</span></label>
          <FieldIcon icon={<IcPerson />}>
            <input name="nom" value={form.nom} onChange={handleChange} required placeholder="Ex : Diallo" className="form-control" style={INPUT_ICON} />
          </FieldIcon>
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label" style={LABEL}>Prénom <span className="text-danger">*</span></label>
          <FieldIcon icon={<IcPerson />}>
            <input name="prenom" value={form.prenom} onChange={handleChange} required placeholder="Ex : Fatou" className="form-control" style={INPUT_ICON} />
          </FieldIcon>
        </div>

        <SectionHeader title="Contact" icon={<IcPhone />} />

        <div className="col-12 col-md-6">
          <label className="form-label" style={LABEL}>Téléphone <span className="text-danger">*</span></label>
          <FieldIcon icon={<IcPhone />}>
            <input name="telephone" value={form.telephone} onChange={handleChange} required placeholder="Ex : 77 123 45 67" className="form-control" style={INPUT_ICON} />
          </FieldIcon>
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label" style={LABEL}>Email</label>
          <FieldIcon icon={<IcMail />}>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Ex : fatou@example.com" className="form-control" style={INPUT_ICON} />
          </FieldIcon>
        </div>

        <div className="col-12">
          <label className="form-label" style={LABEL}>Adresse</label>
          <FieldIcon icon={<IcPin />}>
            <input name="adresse" value={form.adresse} onChange={handleChange} placeholder="Ex : Tivaouane, Quartier Sud" className="form-control" style={INPUT_ICON} />
          </FieldIcon>
        </div>

        <SectionHeader title="Informations professionnelles" icon={<IcBriefcase />} />

        <div className="col-12">
          <label className="form-label" style={LABEL}>Profession</label>
          <FieldIcon icon={<IcBriefcase />}>
            <input name="profession" value={form.profession} onChange={handleChange} placeholder="Ex : Commerçant, Enseignant..." className="form-control" style={INPUT_ICON} />
          </FieldIcon>
        </div>
      </div>

      {error && <div className="d-flex align-items-center gap-2 mt-3 p-3 rounded-3" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13 }}><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>{error}</div>}

      <div className="d-flex gap-3 mt-4">
        <button type="button" onClick={onClose} className="btn flex-fill fw-medium" style={CANCEL_BTN}>Annuler</button>
        <button type="submit" disabled={loading} className="btn flex-fill fw-semibold text-white d-flex align-items-center justify-content-center gap-2" style={SUBMIT_BTN(loading)}>
          {loading ? <><span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14, borderWidth: 2 }} /> Sauvegarde...</> : <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg> {isEdit ? 'Enregistrer les modifications' : 'Créer le parent'}</>}
        </button>
      </div>
    </form>
  );
}
