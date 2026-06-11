import { useState } from 'react';
import api from '../../api/axios';
import { INPUT_ICON, LABEL, SUBMIT_BTN, CANCEL_BTN, SectionHeader, FieldIcon } from '../../utils/formStyles';

interface UserFormProps { onClose: () => void; }

const IcPerson = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>;
const IcMail   = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>;
const IcLock   = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>;
const IcShield = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>;
const IcEye    = () => <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#6b7280" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>;
const IcEyeOff = () => <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#6b7280" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>;

const ROLES = [
  { value: 'ADMIN',      label: 'Administrateur', color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd' },
  { value: 'COMPTABLE',  label: 'Comptable',      color: '#0369a1', bg: '#f0f9ff', border: '#7dd3fc' },
  { value: 'ENSEIGNANT', label: 'Enseignant',      color: '#166534', bg: '#f0fdf4', border: '#86efac' },
  { value: 'RECITATEUR', label: 'Récitateur',      color: '#9a3412', bg: '#fff7ed', border: '#fdba74' },
];

export default function UserForm({ onClose }: UserFormProps) {
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', password: '', role: 'ENSEIGNANT' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); if (error) setError(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try { await api.post('/users', { ...form, actif: true }); onClose(); }
    catch { setError('Erreur lors de la création. Vérifiez les champs.'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        <SectionHeader title="Identité" icon={<IcPerson />} />

        <div className="col-12 col-md-6">
          <label className="form-label" style={LABEL}>Nom <span className="text-danger">*</span></label>
          <FieldIcon icon={<IcPerson />}>
            <input name="nom" type="text" value={form.nom} onChange={handleChange} required placeholder="Ex : Diop" className="form-control" style={INPUT_ICON} />
          </FieldIcon>
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label" style={LABEL}>Prénom <span className="text-danger">*</span></label>
          <FieldIcon icon={<IcPerson />}>
            <input name="prenom" type="text" value={form.prenom} onChange={handleChange} required placeholder="Ex : Amadou" className="form-control" style={INPUT_ICON} />
          </FieldIcon>
        </div>

        <SectionHeader title="Accès au système" icon={<IcShield />} />

        <div className="col-12 col-md-6">
          <label className="form-label" style={LABEL}>Email <span className="text-danger">*</span></label>
          <FieldIcon icon={<IcMail />}>
            <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="Ex : amadou@example.com" className="form-control" style={INPUT_ICON} />
          </FieldIcon>
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label" style={LABEL}>Mot de passe <span className="text-danger">*</span></label>
          <div className="input-group">
            <FieldIcon icon={<IcLock />}>
              <input name="password" type={showPwd ? 'text' : 'password'} value={form.password} onChange={handleChange} required placeholder="••••••••" className="form-control" style={{ ...INPUT_ICON, borderRadius: '8px 0 0 8px' }} />
            </FieldIcon>
            <button type="button" className="input-group-text" onClick={() => setShowPwd(p => !p)}
              style={{ border: '1.5px solid #e5e7eb', borderLeft: 'none', borderRadius: '0 8px 8px 0', backgroundColor: '#f9fafb', cursor: 'pointer' }}>
              {showPwd ? <IcEyeOff /> : <IcEye />}
            </button>
          </div>
        </div>

        <div className="col-12">
          <label className="form-label" style={LABEL}>Rôle <span className="text-danger">*</span></label>
          <div className="d-flex gap-2 flex-wrap">
            {ROLES.map(opt => (
              <div key={opt.value} onClick={() => setForm(p => ({ ...p, role: opt.value }))}
                style={{ flex: '1 1 auto', cursor: 'pointer', textAlign: 'center', padding: '10px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1.5px solid ${form.role === opt.value ? opt.border : '#e5e7eb'}`, backgroundColor: form.role === opt.value ? opt.bg : '#ffffff', color: form.role === opt.value ? opt.color : '#9ca3af', transition: 'all 0.15s' }}>
                {opt.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="d-flex align-items-center gap-2 mt-3 p-3 rounded-3" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13 }}><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>{error}</div>}

      <div className="d-flex gap-3 mt-4">
        <button type="button" onClick={onClose} className="btn flex-fill fw-medium" style={CANCEL_BTN}>Annuler</button>
        <button type="submit" disabled={loading} className="btn flex-fill fw-semibold text-white d-flex align-items-center justify-content-center gap-2" style={SUBMIT_BTN(loading)}>
          {loading ? <><span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14, borderWidth: 2 }} /> Création...</> : <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg> Créer l'utilisateur</>}
        </button>
      </div>
    </form>
  );
}
