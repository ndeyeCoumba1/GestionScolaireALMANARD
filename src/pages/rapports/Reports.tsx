import { useState } from 'react';
import PageHeader from '../../components/Common/PageHeader';
import { generateDailyReport, generateWeeklyReport, generateMonthlyReport } from '../../utils/exportUtils';

export default function Reports() {
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    if (!startDate || !endDate) {
      alert('Veuillez sélectionner une date de début et une date de fin');
      return;
    }

    setLoading(true);
    try {
      switch (reportType) {
        case 'daily':
          await generateDailyReport(startDate, endDate);
          break;
        case 'weekly':
          await generateWeeklyReport(startDate, endDate);
          break;
        case 'monthly':
          await generateMonthlyReport(startDate, endDate);
          break;
      }
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la génération du rapport');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      <PageHeader
        subtitle="Gestion des rapports"
        title="📊 Rapports"
        description="Générez et téléchargez des rapports journaliers, hebdomadaires et mensuels."
        countText=""
        action={null}
      />

      {/* Report Type Selection */}
      <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0' }}>
        <p className="fw-semibold mb-3" style={{ fontSize: 15, color: '#111827' }}>Type de Rapport</p>
        <div className="d-flex gap-2 flex-wrap">
          <button
            onClick={() => setReportType('daily')}
            className="btn px-4 py-2 rounded-3"
            style={{
              backgroundColor: reportType === 'daily' ? '#1a5c38' : '#f0f0f0',
              color: reportType === 'daily' ? '#fff' : '#374151',
              border: reportType === 'daily' ? 'none' : '1px solid #e5e7eb',
              fontWeight: 500,
            }}
          >
            📅 Journalier
          </button>
          <button
            onClick={() => setReportType('weekly')}
            className="btn px-4 py-2 rounded-3"
            style={{
              backgroundColor: reportType === 'weekly' ? '#1a5c38' : '#f0f0f0',
              color: reportType === 'weekly' ? '#fff' : '#374151',
              border: reportType === 'weekly' ? 'none' : '1px solid #e5e7eb',
              fontWeight: 500,
            }}
          >
            📆 Hebdomadaire
          </button>
          <button
            onClick={() => setReportType('monthly')}
            className="btn px-4 py-2 rounded-3"
            style={{
              backgroundColor: reportType === 'monthly' ? '#1a5c38' : '#f0f0f0',
              color: reportType === 'monthly' ? '#fff' : '#374151',
              border: reportType === 'monthly' ? 'none' : '1px solid #e5e7eb',
              fontWeight: 500,
            }}
          >
            📊 Mensuel
          </button>
        </div>
      </div>

      {/* Date Range Selection */}
      <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0' }}>
        <p className="fw-semibold mb-3" style={{ fontSize: 15, color: '#111827' }}>Période</p>
        <div className="d-flex gap-3 flex-wrap">
          <div>
            <label className="form-label small text-muted">Date de début</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="form-control"
              style={{ borderRadius: 8, border: '1px solid #e5e7eb', padding: '10px 12px' }}
            />
          </div>
          <div>
            <label className="form-label small text-muted">Date de fin</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="form-control"
              style={{ borderRadius: 8, border: '1px solid #e5e7eb', padding: '10px 12px' }}
            />
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="d-flex gap-3">
        <button
          onClick={generateReport}
          disabled={loading}
          className="btn px-5 py-2 rounded-3"
          style={{
            backgroundColor: '#1a5c38',
            color: '#fff',
            border: 'none',
            fontWeight: 600,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Génération en cours...' : '📄 Générer le Rapport'}
        </button>
      </div>

      {/* Report Description */}
      <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0' }}>
        <p className="fw-semibold mb-3" style={{ fontSize: 15, color: '#111827' }}>Description</p>
        <div className="text-muted" style={{ fontSize: 14, lineHeight: 1.6 }}>
          {reportType === 'daily' && (
            <p>
              Le rapport journalier contient toutes les transactions du jour sélectionné, 
              incluant les paiements reçus, les dépenses effectuées, les nouvelles inscriptions 
              et les modifications apportées au système.
            </p>
          )}
          {reportType === 'weekly' && (
            <p>
              Le rapport hebdomadaire résume les activités de la semaine sélectionnée, 
              avec des statistiques sur les paiements, les dépenses, les inscriptions 
              et les tendances financières.
            </p>
          )}
          {reportType === 'monthly' && (
            <p>
              Le rapport mensuel fournit une vue d'ensemble complète du mois sélectionné, 
              incluant des analyses détaillées des revenus, des dépenses, de la fréquentation 
              des élèves et des performances financières.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
