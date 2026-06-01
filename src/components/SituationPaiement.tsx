import { useEffect, useState } from 'react';
import { paiementService } from '../services/paiementService';
import type { SituationPaiementDTO, StatutPaiement } from '../Types/paiement';

interface SituationPaiementProps {
  inscriptionId: number;
}

const getStatutBadgeClass = (statut: StatutPaiement): string => {
  switch (statut) {
    case 'PAYE':
      return 'bg-success';
    case 'PARTIEL':
      return 'bg-warning';
    case 'IMPAYE':
      return 'bg-danger';
    case 'EN_ATTENTE':
      return 'bg-secondary';
    case 'ANNULE':
      return 'bg-dark';
    default:
      return 'bg-secondary';
  }
};

const getStatutLabel = (statut: StatutPaiement): string => {
  switch (statut) {
    case 'PAYE':
      return 'PAYÉ';
    case 'PARTIEL':
      return 'PARTIEL';
    case 'IMPAYE':
      return 'IMPAYÉ';
    case 'EN_ATTENTE':
      return 'EN ATTENTE';
    case 'ANNULE':
      return 'ANNULÉ';
    default:
      return statut;
  }
};

export default function SituationPaiement({ inscriptionId }: SituationPaiementProps) {
  const [situation, setSituation] = useState<SituationPaiementDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSituation();
  }, [inscriptionId]);

  const loadSituation = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await paiementService.getSituationByInscription(inscriptionId);
      setSituation(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement de la situation');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (!situation) {
    return (
      <div className="alert alert-info" role="alert">
        Aucune information disponible.
      </div>
    );
  }

  const pourcentagePaye = situation.fraisInscriptionTotal > 0
    ? (situation.fraisInscriptionPaye / situation.fraisInscriptionTotal) * 100
    : 0;

  return (
    <div className="container">
      {/* Statistiques Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-white bg-primary mb-3">
            <div className="card-body">
              <h6 className="card-title">Total Dû</h6>
              <h3 className="card-text">{situation.fraisInscriptionTotal.toLocaleString('fr-FR')} FCFA</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-success mb-3">
            <div className="card-body">
              <h6 className="card-title">Déjà Payé</h6>
              <h3 className="card-text">{situation.fraisInscriptionPaye.toLocaleString('fr-FR')} FCFA</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-danger mb-3">
            <div className="card-body">
              <h6 className="card-title">Reste à Payer</h6>
              <h3 className="card-text">{situation.fraisInscriptionRestant.toLocaleString('fr-FR')} FCFA</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card mb-4">
        <div className="card-body">
          <h6 className="card-title mb-3">Progression du Paiement</h6>
          <div className="progress mb-2" style={{ height: '25px' }}>
            <div
              className="progress-bar bg-success"
              role="progressbar"
              style={{ width: `${pourcentagePaye}%` }}
              aria-valuenow={pourcentagePaye}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              {pourcentagePaye.toFixed(1)}%
            </div>
          </div>
          <div className="d-flex justify-content-between text-muted small">
            <span>Statut global: <strong className={`badge ${getStatutBadgeClass(situation.statutGlobal)}`}>{getStatutLabel(situation.statutGlobal)}</strong></span>
          </div>
        </div>
      </div>

      {/* Historique des Paiements */}
      <div className="card">
        <div className="card-header bg-light">
          <h5 className="card-title mb-0">📋 Historique des Paiements</h5>
        </div>
        <div className="card-body">
          {situation.historique.length === 0 ? (
            <div className="alert alert-info" role="alert">
              Aucun paiement enregistré pour cette inscription.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>N° Reçu</th>
                    <th>Date</th>
                    <th>Élève</th>
                    <th>Montant</th>
                    <th>Motif</th>
                    <th>Mode</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {situation.historique.map((paiement) => (
                    <tr key={paiement.id}>
                      <td className="fw-bold">{paiement.numeroRecu}</td>
                      <td>{new Date(paiement.datePaiement).toLocaleDateString('fr-FR')}</td>
                      <td>{paiement.eleveNom} {paiement.elevePrenom}</td>
                      <td className="fw-bold text-success">{paiement.montant.toLocaleString('fr-FR')} FCFA</td>
                      <td>{paiement.motif}</td>
                      <td>{paiement.typePaiement}</td>
                      <td>
                        <span className={`badge ${getStatutBadgeClass(paiement.statut)}`}>
                          {getStatutLabel(paiement.statut)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
