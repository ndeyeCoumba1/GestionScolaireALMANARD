import { useEffect, useState } from 'react';
import { paiementService } from '../services/paiementService';
import type { MotifPaiement, TypePaiement, SituationPaiementDTO } from '../Types/paiement';
import api from '../api/axios';

interface PaiementFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function PaiementForm({ onSuccess, onCancel }: PaiementFormProps) {
  const [eleves, setEleves] = useState<any[]>([]);
  const [mois, setMois] = useState<any[]>([]);
  const [inscriptions, setInscriptions] = useState<any[]>([]);
  
  const [form, setForm] = useState({
    eleveId: '',
    inscriptionId: '',
    montant: '',
    montantAttendu: '',
    motif: 'INSCRIPTION' as MotifPaiement,
    typePaiement: 'ESPECES' as TypePaiement,
    moisId: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [situation, setSituation] = useState<SituationPaiementDTO | null>(null);

  useEffect(() => {
    api.get('/eleves').then(r => setEleves(r.data));
    api.get('/mois').then(r => setMois(r.data));
    api.get('/inscriptions').then(r => setInscriptions(r.data));
  }, []);

  // Load situation when inscription is selected
  useEffect(() => {
    if (form.inscriptionId) {
      loadSituation(Number(form.inscriptionId));
    } else {
      setSituation(null);
    }
  }, [form.inscriptionId]);

  const loadSituation = async (inscriptionId: number) => {
    try {
      const data = await paiementService.getSituationByInscription(inscriptionId);
      setSituation(data);
      // Pre-fill montantAttendu with remaining amount
      setForm(prev => ({
        ...prev,
        montantAttendu: data.fraisInscriptionRestant.toString(),
      }));
    } catch (err) {
      console.error('Erreur chargement situation:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await paiementService.enregistrerPaiement({
        eleveId: Number(form.eleveId),
        montant: Number(form.montant),
        montantAttendu: form.montantAttendu ? Number(form.montantAttendu) : undefined,
        motif: form.motif,
        typePaiement: form.typePaiement,
        moisId: form.moisId ? Number(form.moisId) : undefined,
        inscriptionId: form.inscriptionId ? Number(form.inscriptionId) : undefined,
      });
      
      setSuccess('Paiement enregistré avec succès !');
      if (onSuccess) onSuccess();
      
      // Reset form
      setForm({
        eleveId: '',
        inscriptionId: '',
        montant: '',
        montantAttendu: '',
        motif: 'INSCRIPTION',
        typePaiement: 'ESPECES',
        moisId: '',
      });
      setSituation(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement du paiement');
    } finally {
      setLoading(false);
    }
  };

  const isPartialPayment = Number(form.montant) < Number(form.montantAttendu) && Number(form.montant) > 0;
  const remainingAmount = Number(form.montantAttendu) - Number(form.montant);

  return (
    <div className="container">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5 className="card-title mb-0">📝 Nouveau Paiement</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Élève */}
            <div className="form-group mb-3">
              <label htmlFor="eleveId" className="form-label fw-bold">Élève *</label>
              <select
                id="eleveId"
                name="eleveId"
                value={form.eleveId}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Choisir un élève</option>
                {eleves.map(e => (
                  <option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>
                ))}
              </select>
            </div>

            {/* Inscription */}
            <div className="form-group mb-3">
              <label htmlFor="inscriptionId" className="form-label fw-bold">Inscription (optionnel)</label>
              <select
                id="inscriptionId"
                name="inscriptionId"
                value={form.inscriptionId}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Choisir une inscription</option>
                {inscriptions.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.eleve?.nom} {i.eleve?.prenom} - {i.classe?.niveau}
                  </option>
                ))}
              </select>
            </div>

            {/* Situation de paiement */}
            {situation && (
              <div className="card mb-3 bg-light">
                <div className="card-body">
                  <h6 className="card-title mb-3">💰 Situation de l'élève</h6>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <span>Total dû:</span>
                      <span className="fw-bold">{situation.fraisInscriptionTotal.toLocaleString('fr-FR')} FCFA</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <span>Déjà payé:</span>
                      <span className="fw-bold text-success">{situation.fraisInscriptionPaye.toLocaleString('fr-FR')} FCFA</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <span>Reste à payer:</span>
                      <span className="fw-bold text-danger">{situation.fraisInscriptionRestant.toLocaleString('fr-FR')} FCFA</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            <div className="row">
              {/* Montant */}
              <div className="col-md-6 mb-3">
                <label className="form-label">MONTANT (FCFA) <span className="text-danger">*</span></label>
                <input
                  type="number"
                  className="form-control"
                  value={form.montant}
                  onChange={(e) => setForm({ ...form, montant: e.target.value })}
                  placeholder="Ex : 50000"
                  required
                />
              </div>

              {/* Montant Attendu */}
              <div className="col-md-6">
                <div className="form-group mb-3">
                  <label htmlFor="montantAttendu" className="form-label fw-bold">Montant Attendu (FCFA)</label>
                  <input
                    type="number"
                    id="montantAttendu"
                    name="montantAttendu"
                    value={form.montantAttendu}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Ex: 25000"
                  />
                </div>
              </div>
            </div>

            {/* Alert for partial payment */}
            {isPartialPayment && (
              <div className="alert alert-warning" role="alert">
                <strong>⚠️ Attention :</strong> Il s'agit d'un paiement PARTIEL. Un reste à payer de {remainingAmount.toLocaleString('fr-FR')} FCFA sera généré.
              </div>
            )}

            <div className="row">
              {/* Motif */}
              <div className="col-md-6">
                <div className="form-group mb-3">
                  <label htmlFor="motif" className="form-label fw-bold">Motif *</label>
                  <select
                    id="motif"
                    name="motif"
                    value={form.motif}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="INSCRIPTION">Inscription</option>
                    <option value="MENSUALITE">Mensualité</option>
                  </select>
                </div>
              </div>

              {/* Type de paiement */}
              <div className="col-md-6">
                <div className="form-group mb-3">
                  <label htmlFor="typePaiement" className="form-label fw-bold">Mode de Paiement *</label>
                  <select
                    id="typePaiement"
                    name="typePaiement"
                    value={form.typePaiement}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="ESPECES">Espèces</option>
                    <option value="CHEQUE">Chèque</option>
                    <option value="VIREMENT">Virement</option>
                    <option value="ORANGE_MONEY">Orange Money</option>
                    <option value="WAVE">Wave</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Mois (pour mensualité) */}
            {form.motif === 'MENSUALITE' && (
              <div className="form-group mb-3">
                <label htmlFor="moisId" className="form-label fw-bold">Mois *</label>
                <select
                  id="moisId"
                  name="moisId"
                  value={form.moisId}
                  onChange={handleChange}
                  className="form-select"
                  required={form.motif === 'MENSUALITE'}
                >
                  <option value="">Choisir un mois</option>
                  {mois.map(m => (
                    <option key={m.id} value={m.id}>{m.libelle}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="alert alert-success" role="alert">
                {success}
              </div>
            )}

            {/* Buttons */}
            <div className="d-flex gap-2">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="btn btn-secondary flex-fill"
                >
                  Annuler
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex-fill"
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Traitement...
                  </>
                ) : (
                  'Enregistrer le Paiement'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
