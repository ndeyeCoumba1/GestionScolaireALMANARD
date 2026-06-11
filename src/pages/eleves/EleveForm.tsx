import { useEffect, useState, useRef } from 'react';
import api from '../../api/axios';
import type { Classe, Parent } from '../../Types/index';
import { INPUT_ICON, LABEL, SUBMIT_BTN, CANCEL_BTN, SectionHeader, FieldIcon } from '../../utils/formStyles';

interface EleveFormProps { onClose: () => void; eleveId?: number; }

const IcPerson   = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>;
const IcCalendar = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>;
const IcPin      = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
const IcCap      = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>;
const IcUsers    = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
const IcBook     = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.331.477-4.5 1.253"/></svg>;
const IcCamera   = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><circle cx="12" cy="13" r="3"/></svg>;
const IcTrash    = () => <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 01-1-1V5a1 1 0 011-1h6a1 1 0 011 1v1a1 1 0 01-1 1H9z"/></svg>;

const AVATAR_COLORS = ['#0A6E3F','#1d4ed8','#7c3aed','#d97706','#dc2626','#0f766e'];

export default function EleveForm({ onClose, eleveId }: EleveFormProps) {
  const isEdit = !!eleveId;
  const [form, setForm] = useState({ nom: '', prenom: '', dateNaissance: '', sexe: 'M', adresse: '', classeId: '', parentId: '', matricule: '' });
  const [classes, setClasses] = useState<Classe[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');

  /* ── Photo ── */
  const [photoFile, setPhotoFile]     = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [photoExisting, setPhotoExisting] = useState<string>('');
  const [hoverPhoto, setHoverPhoto]   = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get('/classes').then(r => setClasses(r.data));
    api.get('/parents').then(r => setParents(r.data));
    if (isEdit && eleveId) {
      api.get(`/eleves/${eleveId}`)
        .then(r => {
          const e = r.data;
          setForm({ nom: e.nom, prenom: e.prenom, dateNaissance: e.dateNaissance, sexe: e.sexe, adresse: e.adresse, classeId: e.classeId, parentId: e.parentId, matricule: e.matricule || '' });
          if (e.photoUrl) setPhotoExisting(e.photoUrl);
        })
        .catch(() => setError('Impossible de charger cet élève.'))
        .finally(() => setFetching(false));
    }
  }, [eleveId, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  /* ── Gestion photo ── */
  const compressImage = (file: File, maxSize = 300): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = ev => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        };
        img.onerror = reject;
        img.src = ev.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('La photo ne doit pas dépasser 5 Mo.'); return; }
    if (!file.type.startsWith('image/')) { setError('Veuillez sélectionner une image valide.'); return; }
    setPhotoFile(file);
    const compressed = await compressImage(file);
    setPhotoPreview(compressed);
    setError('');
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
    setPhotoExisting('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const photoUrl = photoPreview || photoExisting || null;

      const payload = {
        nom: form.nom, prenom: form.prenom, dateNaissance: form.dateNaissance,
        sexe: form.sexe, adresse: form.adresse,
        classe: { id: Number(form.classeId) },
        parent: { id: Number(form.parentId) },
        photoUrl,
      };

      if (isEdit && eleveId) await api.put(`/eleves/${eleveId}`, payload);
      else await api.post('/eleves', payload);

      onClose();
    } catch {
      setError('Erreur lors de la sauvegarde. Vérifiez les champs.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Aperçu avatar ── */
  const displayPhoto  = photoPreview || photoExisting;
  const initials      = `${(form.nom[0] ?? '').toUpperCase()}${(form.prenom[0] ?? '').toUpperCase()}`;
  const avatarBg      = AVATAR_COLORS[(form.nom.charCodeAt(0) || 0) % AVATAR_COLORS.length];

  if (fetching) return (
    <div className="d-flex align-items-center justify-content-center py-5" style={{ color: '#9ca3af' }}>
      <span className="spinner-border spinner-border-sm me-2" style={{ width: 18, height: 18, borderWidth: 2, color: '#10a050' }} />
      <span style={{ fontSize: 14 }}>Chargement...</span>
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>

      {/* ── Matricule ── */}
      {isEdit && form.matricule && (
        <div className="mb-4 d-flex align-items-center gap-3 p-3 rounded-3" style={{ backgroundColor: '#f0fdf4', border: '1.5px solid #86efac' }}>
          <div className="d-flex align-items-center justify-content-center rounded" style={{ width: 38, height: 38, backgroundColor: '#16a34a', flexShrink: 0, color: 'white' }}><IcCap /></div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Matricule</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#166534', fontFamily: 'monospace', letterSpacing: 2 }}>{form.matricule}</div>
          </div>
        </div>
      )}

      {/* ── Photo de profil ── */}
      <div className="mb-4 p-4 rounded-4 d-flex flex-column align-items-center gap-3" style={{ backgroundColor: '#f8fafc', border: '1.5px dashed #e5e7eb' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', alignSelf: 'flex-start' }}>
          📷 Photo de l'élève
        </div>

        <div style={{ position: 'relative', display: 'inline-block' }}>
          {/* Avatar / photo */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onMouseEnter={() => setHoverPhoto(true)}
            onMouseLeave={() => setHoverPhoto(false)}
            style={{ width: 96, height: 96, borderRadius: '50%', cursor: 'pointer', position: 'relative', overflow: 'hidden', border: `3px solid ${displayPhoto ? '#0A6E3F' : '#e5e7eb'}`, boxShadow: displayPhoto ? '0 4px 16px rgba(10,110,63,0.2)' : '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.2s' }}
          >
            {displayPhoto ? (
              <img src={displayPhoto} alt="Photo élève" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', backgroundColor: initials ? avatarBg : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#fff' }}>
                {initials || <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.6)" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>}
              </div>
            )}
            {/* Overlay hover */}
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: hoverPhoto ? 1 : 0, transition: 'opacity 0.2s', borderRadius: '50%' }}>
              <span style={{ color: '#fff' }}><IcCamera /></span>
            </div>
          </div>

          {/* Bouton supprimer */}
          {displayPhoto && (
            <button type="button" onClick={removePhoto}
              style={{ position: 'absolute', top: 0, right: -4, width: 24, height: 24, borderRadius: '50%', border: '2px solid #fff', backgroundColor: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
              title="Supprimer la photo">
              <IcTrash />
            </button>
          )}
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />

        <div style={{ textAlign: 'center' }}>
          <button type="button" onClick={() => fileInputRef.current?.click()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '7px 16px', fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#0A6E3F'; e.currentTarget.style.color = '#0A6E3F'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#374151'; }}>
            <IcCamera /> {displayPhoto ? 'Changer la photo' : 'Choisir une photo'}
          </button>
          <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 5 }}>JPG, PNG, WebP · max 5 Mo</div>
        </div>

        {photoFile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '5px 12px', fontSize: 11, color: '#166534', fontWeight: 600 }}>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
            {photoFile.name} · {(photoFile.size / 1024).toFixed(0)} Ko
          </div>
        )}
      </div>

      {/* ── Champs du formulaire ── */}
      <div className="row g-3">
        <SectionHeader title="Identité" icon={<IcPerson />} />

        <div className="col-12 col-md-6">
          <label className="form-label" style={LABEL}>Prénom <span className="text-danger">*</span></label>
          <FieldIcon icon={<IcPerson />}>
            <input name="prenom" value={form.prenom} onChange={handleChange} required placeholder="Ex : Aminata" className="form-control" style={INPUT_ICON} />
          </FieldIcon>
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label" style={LABEL}>Nom <span className="text-danger">*</span></label>
          <FieldIcon icon={<IcPerson />}>
            <input name="nom" value={form.nom} onChange={handleChange} required placeholder="Ex : Ndiaye" className="form-control" style={INPUT_ICON} />
          </FieldIcon>
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label" style={LABEL}>Date de naissance <span className="text-danger">*</span></label>
          <FieldIcon icon={<IcCalendar />}>
            <input type="date" name="dateNaissance" value={form.dateNaissance} onChange={handleChange} required className="form-control" style={INPUT_ICON} />
          </FieldIcon>
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label" style={LABEL}>Sexe <span className="text-danger">*</span></label>
          <div className="d-flex gap-2">
            {[{ v: 'M', l: 'Masculin', s: '♂' }, { v: 'F', l: 'Féminin', s: '♀' }].map(opt => (
              <div key={opt.v} onClick={() => setForm(p => ({ ...p, sexe: opt.v }))}
                className="d-flex align-items-center justify-content-center gap-2"
                style={{ flex: 1, cursor: 'pointer', padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, border: `1.5px solid ${form.sexe === opt.v ? '#10a050' : '#e5e7eb'}`, backgroundColor: form.sexe === opt.v ? '#f0fdf4' : '#ffffff', color: form.sexe === opt.v ? '#166534' : '#9ca3af', transition: 'all 0.15s' }}>
                <span style={{ fontSize: 16 }}>{opt.s}</span>{opt.l}
              </div>
            ))}
          </div>
        </div>

        <SectionHeader title="Localisation" icon={<IcPin />} />

        <div className="col-12">
          <label className="form-label" style={LABEL}>Adresse</label>
          <FieldIcon icon={<IcPin />}>
            <input name="adresse" value={form.adresse} onChange={handleChange} placeholder="Ex : Dakar, Médina" className="form-control" style={INPUT_ICON} />
          </FieldIcon>
        </div>

        <SectionHeader title="Scolarité" icon={<IcBook />} />

        <div className="col-12 col-md-6">
          <label className="form-label" style={LABEL}>Classe <span className="text-danger">*</span></label>
          <FieldIcon icon={<IcCap />}>
            <select name="classeId" value={form.classeId} onChange={handleChange} required className="form-select" style={INPUT_ICON}>
              <option value="">Choisir une classe</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.niveau}</option>)}
            </select>
          </FieldIcon>
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label" style={LABEL}>Parent <span className="text-danger">*</span></label>
          <FieldIcon icon={<IcUsers />}>
            <select name="parentId" value={form.parentId} onChange={handleChange} required className="form-select" style={INPUT_ICON}>
              <option value="">Choisir un parent</option>
              {parents.map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
            </select>
          </FieldIcon>
        </div>
      </div>

      {error && (
        <div className="d-flex align-items-center gap-2 mt-3 p-3 rounded-3" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13 }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          {error}
        </div>
      )}

      <div className="d-flex gap-3 mt-4">
        <button type="button" onClick={onClose} className="btn flex-fill fw-medium" style={CANCEL_BTN}>Annuler</button>
        <button type="submit" disabled={loading} className="btn flex-fill fw-semibold text-white d-flex align-items-center justify-content-center gap-2" style={SUBMIT_BTN(loading)}>
          {loading
            ? <><span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14, borderWidth: 2 }} /> Sauvegarde...</>
            : <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg> {isEdit ? 'Enregistrer les modifications' : "Créer l'élève"}</>}
        </button>
      </div>
    </form>
  );
}
