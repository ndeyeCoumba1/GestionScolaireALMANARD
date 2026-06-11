import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { INPUT_ICON, LABEL, SUBMIT_BTN, CANCEL_BTN, FCFA_SUFFIX, SectionHeader, FieldIcon } from '../../utils/formStyles';

interface MoisFormProps { onClose: () => void; moisId?: number; }

const IcCalendar = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>;
const IcCoin     = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;

export default function MoisForm({ onClose, moisId }: MoisFormProps) {
  const isEdit = !!moisId;
  const [libelle, setLibelle] = useState('');
  const [montantScolarite, setMontantScolarite] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!moisId) return;
    api.get(`/mois/${moisId}`)
      .then(r => { setLibelle(r.data.libelle || ''); setMontantScolarite(r.data.montantScolarite?.toString() || ''); })
      .catch(() => setError('Impossible de charger ce mois.'));
  }, [moisId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const data = { libelle, montantScolarite: parseFloat(montantScolarite) };
      if (moisId) await api.put(`/mois/${moisId}`, data);
      else await api.post('/mois', data);
      onClose();
    } catch { setError('Erreur lors de la sauvegarde.'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        <SectionHeader title="Mois scolaire" icon={<IcCalendar />} />

        <div className="col-12">
          <label className="form-label" style={LABEL}>Libellé <span className="text-danger">*</span></label>
          <FieldIcon icon={<IcCalendar />}>
            <input type="text" value={libelle} onChange={e => { setLibelle(e.target.value); setError(''); }} required placeholder="Ex : Janvier, Février..." className="form-control" style={INPUT_ICON} />
          </FieldIcon>
        </div>

        <SectionHeader title="Scolarité" icon={<IcCoin />} />

        <div className="col-12">
          <label className="form-label" style={LABEL}>Montant mensualité <span className="text-danger">*</span></label>
          <div className="input-group">
            <FieldIcon icon={<IcCoin />}>
              <input type="number" value={montantScolarite} onChange={e => { setMontantScolarite(e.target.value); setError(''); }} required min="0" placeholder="Ex : 50 000" className="form-control" style={{ ...INPUT_ICON, borderRadius: '8px 0 0 8px' }} />
            </FieldIcon>
            <span className="input-group-text" style={FCFA_SUFFIX}>FCFA</span>
          </div>
          <small style={{ fontSize: 11, color: '#9ca3af' }}>Montant appliqué à tous les élèves pour ce mois</small>
        </div>

        {libelle && montantScolarite && (
          <div className="col-12">
            <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ backgroundColor: '#f0fdf4', border: '1.5px solid #86efac' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <IcCalendar />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#166534' }}>{libelle}</div>
                <div style={{ fontSize: 12, color: '#16a34a' }}>{Number(montantScolarite).toLocaleString('fr-FR')} FCFA / élève</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && <div className="d-flex align-items-center gap-2 mt-3 p-3 rounded-3" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13 }}><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>{error}</div>}

      <div className="d-flex gap-3 mt-4">
        <button type="button" onClick={onClose} className="btn flex-fill fw-medium" style={CANCEL_BTN}>Annuler</button>
        <button type="submit" disabled={loading} className="btn flex-fill fw-semibold text-white d-flex align-items-center justify-content-center gap-2" style={SUBMIT_BTN(loading)}>
          {loading ? <><span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14, borderWidth: 2 }} /> Sauvegarde...</> : <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg> {isEdit ? 'Enregistrer les modifications' : 'Créer le mois'}</>}
        </button>
      </div>
    </form>
  );
}
