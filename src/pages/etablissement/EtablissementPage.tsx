import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { Etablissement } from '../../Types/index';
import { useAuth } from '../../Context/AuthContext';
import { PageBanner } from '../../components/Common/ListLayout';
import { INPUT, LABEL, SUBMIT_BTN, CANCEL_BTN, SectionHeader } from '../../utils/formStyles';

const IcBuilding = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M8 11h2m-2 4h2m4-4h2m-2 4h2M12 3v4" />
  </svg>
);
const IcPhone = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);
const IcMail = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const IcLocation = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IcImage = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const IcEdit = () => (
  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 0110 16.414H8v-2a2 2 0 01.586-1.414z" />
  </svg>
);

const EMPTY: Etablissement = { nom: '', adresse: '', telephone: '', email: '', logoUrl: '' };

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  return (
    <div className="d-flex align-items-start gap-3 py-3" style={{ borderBottom: '1px solid #f3f4f6' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#10a050' }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 15, fontWeight: 500, color: value ? '#111827' : '#d1d5db' }}>{value || '—'}</div>
      </div>
    </div>
  );
}

export default function EtablissementPage() {
  const { role } = useAuth();
  const isAdmin = role === 'ADMIN';

  const [data, setData] = useState<Etablissement | null>(null);
  const [form, setForm] = useState<Etablissement>(EMPTY);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/etablissements');
      const list = Array.isArray(res.data) ? res.data : [res.data];
      if (list.length > 0) {
        setData(list[0]);
        setForm(list[0]);
      } else {
        setData(null);
        setForm(EMPTY);
      }
    } catch {
      setError("Impossible de charger les informations de l'établissement.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      if (data?.id) {
        await api.put(`/etablissements/${data.id}`, form);
      } else {
        await api.post('/etablissements', form);
      }
      setSuccess('Informations enregistrées avec succès.');
      setEditing(false);
      await fetchData();
    } catch {
      setError('Erreur lors de la sauvegarde. Vérifiez les champs.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(data ?? EMPTY);
    setEditing(false);
    setError('');
  };

  const set = (field: keyof Etablissement) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [field]: e.target.value }));

  if (loading) {
    return (
      <div className="d-flex flex-column gap-4" style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <div style={{ height: 132, background: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 60%, #1e3a8a 100%)', borderRadius: 16 }} />
        <div className="bg-white rounded-4 shadow-sm p-5 d-flex align-items-center justify-content-center gap-2" style={{ color: '#9ca3af' }}>
          <span className="spinner-border spinner-border-sm" style={{ width: 20, height: 20, borderWidth: 2, color: '#10a050' }} />
          <span style={{ fontSize: 14 }}>Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-4" style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>

      <PageBanner
        icon="🏛️"
        subtitle="Administration — Paramètres"
        title="Établissement"
        count="Informations de l'établissement scolaire"
        gradient="linear-gradient(135deg, #1e3a5f 0%, #1e40af 60%, #1e3a8a 100%)"
        action={isAdmin && !editing ? (
          <button
            onClick={() => { setEditing(true); setSuccess(''); setError(''); }}
            className="btn fw-semibold d-flex align-items-center gap-2"
            style={{ backgroundColor: '#fff', color: '#1e40af', borderRadius: 12, fontSize: 14, padding: '10px 22px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
          >
            <IcEdit /> Modifier
          </button>
        ) : undefined}
      />

      <div className="row g-4">
        {/* Logo / identité visuelle */}
        <div className="col-12 col-lg-4">
          <div className="bg-white rounded-4 shadow-sm h-100" style={{ border: '1px solid #f0f0f0', overflow: 'hidden' }}>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 110, height: 110, borderRadius: 20, overflow: 'hidden', border: '3px solid #e5e7eb', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {(editing ? form.logoUrl : data?.logoUrl) ? (
                  <img
                    src={editing ? form.logoUrl : data?.logoUrl}
                    alt="Logo établissement"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <span style={{ fontSize: 44 }}>🏛️</span>
                )}
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 4 }}>
                  {data?.nom || 'Nom de l\'établissement'}
                </div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>Établissement scolaire</div>
              </div>
              <div style={{ width: '100%', padding: '12px 16px', borderRadius: 10, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#15803d' }}>Gestion Scolaire Al-Manard3s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Détails */}
        <div className="col-12 col-lg-8">
          {!editing ? (
            <div className="bg-white rounded-4 shadow-sm" style={{ border: '1px solid #f0f0f0', padding: '24px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 4 }}>Informations générales</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>Coordonnées et identité de l'établissement</div>
              {success && (
                <div className="d-flex align-items-center gap-2 mb-3 p-3 rounded-3" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontSize: 13 }}>
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  {success}
                </div>
              )}
              <InfoRow icon={<IcBuilding />} label="Nom de l'établissement" value={data?.nom} />
              <InfoRow icon={<IcLocation />} label="Adresse" value={data?.adresse} />
              <InfoRow icon={<IcPhone />} label="Téléphone" value={data?.telephone} />
              <InfoRow icon={<IcMail />} label="Email" value={data?.email} />
              <InfoRow icon={<IcImage />} label="URL du logo" value={data?.logoUrl} />
              {!data && (
                <div className="text-center py-4" style={{ color: '#9ca3af', fontSize: 13 }}>
                  Aucune information enregistrée.{isAdmin && ' Cliquez sur "Modifier" pour ajouter les informations.'}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-4 shadow-sm" style={{ border: '1px solid #f0f0f0', padding: '24px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 4 }}>Modifier les informations</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>Mettez à jour les coordonnées de l'établissement</div>

              <div className="row g-3 mt-1">
                <SectionHeader title="Identité" icon={<IcBuilding />} />

                <div className="col-12">
                  <label className="form-label" style={LABEL}>Nom de l'établissement <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    style={INPUT}
                    value={form.nom}
                    onChange={set('nom')}
                    placeholder="Ex : Daradji Al-Manard3s"
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label" style={LABEL}>Adresse</label>
                  <input
                    type="text"
                    className="form-control"
                    style={INPUT}
                    value={form.adresse ?? ''}
                    onChange={set('adresse')}
                    placeholder="Ex : Rue 10, Dakar"
                  />
                </div>

                <SectionHeader title="Contact" icon={<IcPhone />} />

                <div className="col-12 col-md-6">
                  <label className="form-label" style={LABEL}>Téléphone</label>
                  <input
                    type="tel"
                    className="form-control"
                    style={INPUT}
                    value={form.telephone ?? ''}
                    onChange={set('telephone')}
                    placeholder="Ex : +221 77 000 00 00"
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label" style={LABEL}>Email</label>
                  <input
                    type="email"
                    className="form-control"
                    style={INPUT}
                    value={form.email ?? ''}
                    onChange={set('email')}
                    placeholder="Ex : contact@ecole.sn"
                  />
                </div>

                <SectionHeader title="Identité visuelle" icon={<IcImage />} />

                <div className="col-12">
                  <label className="form-label" style={LABEL}>URL du logo</label>
                  <input
                    type="url"
                    className="form-control"
                    style={INPUT}
                    value={form.logoUrl ?? ''}
                    onChange={set('logoUrl')}
                    placeholder="https://exemple.com/logo.png"
                  />
                  {form.logoUrl && (
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img
                        src={form.logoUrl}
                        alt="Aperçu logo"
                        style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 10, border: '2px solid #e5e7eb' }}
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>Aperçu du logo</span>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="d-flex align-items-center gap-2 mt-3 p-3 rounded-3" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13 }}>
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  {error}
                </div>
              )}

              <div className="d-flex gap-3 mt-4">
                <button type="button" onClick={handleCancel} className="btn flex-fill fw-medium" style={CANCEL_BTN}>Annuler</button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn flex-fill fw-semibold text-white d-flex align-items-center justify-content-center gap-2"
                  style={SUBMIT_BTN(saving)}
                >
                  {saving
                    ? <><span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14, borderWidth: 2 }} /> Sauvegarde...</>
                    : <><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg> Enregistrer</>
                  }
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
