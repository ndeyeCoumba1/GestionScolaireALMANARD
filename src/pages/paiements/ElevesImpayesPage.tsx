import { useState, useEffect } from 'react';
import api from '../../api/axios';
import type { EleveImpayeDTO } from '../../Types/paiement';
import type { Annee, Mois } from '../../Types/index';
import PageHeader from '../../components/Common/PageHeader';
import { SkeletonTable } from '../../components/Common/SkeletonLoader';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const selectStyle = {
  borderRadius: 10, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb',
  fontSize: 14, padding: '10px 14px', color: '#374151',
} as const;

export default function ElevesImpayesPage() {
  const [annees, setAnnees] = useState<Annee[]>([]);
  const [moisList, setMoisList] = useState<Mois[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedAnneeId, setSelectedAnneeId] = useState('');
  const [selectedMoisId, setSelectedMoisId] = useState('');
  const [selectedClasseId, setSelectedClasseId] = useState('');
  const [eleves, setEleves] = useState<EleveImpayeDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.allSettled([
      api.get('/annees'),
      api.get('/mois'),
      api.get('/classes'),
    ]).then(([anneesRes, moisRes, classesRes]) => {
      if (anneesRes.status === 'fulfilled') {
        const sorted = [...anneesRes.value.data].sort((a: Annee, b: Annee) => b.id - a.id);
        setAnnees(sorted);
        const actif = sorted.find((a: Annee) => a.actif);
        if (actif) setSelectedAnneeId(String(actif.id));
      }
      if (moisRes.status === 'fulfilled') setMoisList(moisRes.value.data);
      if (classesRes.status === 'fulfilled') setClasses(classesRes.value.data);
    });
  }, []);

  const handleLoad = async () => {
    setLoading(true);
    setLoaded(false);
    try {
      const params = new URLSearchParams();
      if (selectedAnneeId) params.append('anneeId', selectedAnneeId);
      if (selectedMoisId) params.append('moisId', selectedMoisId);
      if (selectedClasseId) params.append('classeId', selectedClasseId);
      const res = await api.get(`/paiements/impayés?${params}`);
      setEleves(res.data || []);
      setLoaded(true);
    } catch {
      setEleves([]);
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  const filtered = eleves.filter(e =>
    `${e.nom} ${e.prenom} ${e.matricule} ${e.classeNom ?? ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const totalDu = filtered.reduce((s, e) => s + (e.montantAttendu ?? 0), 0);

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const selectedMois = moisList.find(m => m.id === Number(selectedMoisId));
    const selectedAnnee = annees.find(a => a.id === Number(selectedAnneeId));
    const selectedClasse = classes.find(c => c.id === Number(selectedClasseId));

    // Header
    doc.setFillColor(10, 110, 63);
    doc.rect(0, 0, 210, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('AL-MANARD3S / FONDATION DAROUL MANAR D3S', 14, 11);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Dakar, Sénégal', 14, 18);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 210 - 14, 18, { align: 'right' });

    doc.setTextColor(30, 30, 30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Liste des Élèves Impayés', 105, 38, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    const infos = [
      selectedAnnee ? `Année : ${selectedAnnee.libelle}` : '',
      selectedMois ? `Mois : ${selectedMois.libelle}` : 'Mois : Tous',
      selectedClasse ? `Classe : ${selectedClasse.niveau}` : 'Classe : Toutes',
    ].filter(Boolean).join('    |    ');
    doc.text(infos, 105, 46, { align: 'center' });

    autoTable(doc, {
      startY: 52,
      head: [['Matricule', 'Nom', 'Prénom', 'Classe', 'Montant dû (FCFA)']],
      body: filtered.map(e => [
        e.matricule || '—',
        e.nom,
        e.prenom,
        e.classeNom || '—',
        e.montantAttendu ? e.montantAttendu.toLocaleString('fr-FR') : '—',
      ]),
      headStyles: { fillColor: [10, 110, 63], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10 },
      bodyStyles: { fontSize: 9, textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [240, 250, 244] },
      foot: [['', '', '', 'Total', totalDu.toLocaleString('fr-FR')]],
      footStyles: { fillColor: [67, 56, 202], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10 },
      margin: { left: 14, right: 14 },
    });

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(180, 180, 180);
      doc.text(`Page ${i} / ${pageCount}`, 105, 290, { align: 'center' });
    }

    doc.save(`impayés_${selectedMois?.libelle ?? 'tous'}_${selectedAnnee?.libelle ?? ''}.pdf`);
  };

  return (
    <div className="d-flex flex-column gap-4">
      <PageHeader
        title="⚠️ Élèves Impayés"
        subtitle="Paiements"
        description="Consultez la liste des élèves n'ayant pas payé leurs mensualités."
      />

      {/* Filtres */}
      <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0' }}>
        <div className="row g-3 align-items-end">
          <div className="col-6 col-md-3">
            <label className="form-label fw-semibold text-uppercase mb-2" style={{ fontSize: 11, color: '#6b7280', letterSpacing: '0.05em' }}>Année</label>
            <select value={selectedAnneeId} onChange={e => setSelectedAnneeId(e.target.value)} className="form-select" style={selectStyle}>
              <option value="">Toutes</option>
              {annees.map(a => <option key={a.id} value={a.id}>{a.libelle}{a.actif ? ' ★' : ''}</option>)}
            </select>
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label fw-semibold text-uppercase mb-2" style={{ fontSize: 11, color: '#6b7280', letterSpacing: '0.05em' }}>Mois</label>
            <select value={selectedMoisId} onChange={e => setSelectedMoisId(e.target.value)} className="form-select" style={selectStyle}>
              <option value="">Tous</option>
              {moisList.map(m => <option key={m.id} value={m.id}>{m.libelle}</option>)}
            </select>
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label fw-semibold text-uppercase mb-2" style={{ fontSize: 11, color: '#6b7280', letterSpacing: '0.05em' }}>Classe</label>
            <select value={selectedClasseId} onChange={e => setSelectedClasseId(e.target.value)} className="form-select" style={selectStyle}>
              <option value="">Toutes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.niveau}</option>)}
            </select>
          </div>
          <div className="col-6 col-md-3">
            <button onClick={handleLoad} disabled={loading}
              className="btn fw-semibold w-100"
              style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)', color: '#fff', borderRadius: 10, padding: '10px 0', fontSize: 14, border: 'none' }}>
              {loading ? '⏳ Chargement...' : '🔍 Charger'}
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: '1px solid #f0f0f0' }}>
          <SkeletonTable rows={5} columns={5} />
        </div>
      )}

      {!loading && loaded && (
        <>
          {/* Stats rapides */}
          <div className="d-flex gap-3 flex-wrap">
            <div className="bg-white rounded-4 shadow-sm p-4 flex-fill" style={{ border: '1px solid #f0f0f0', minWidth: 180 }}>
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 48, height: 48, backgroundColor: '#fee2e2', fontSize: 22, flexShrink: 0 }}>⚠️</div>
                <div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>Élèves impayés</div>
                  <div className="fw-bold" style={{ fontSize: 22, color: '#dc2626' }}>{filtered.length}</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-4 shadow-sm p-4 flex-fill" style={{ border: '1px solid #f0f0f0', minWidth: 220 }}>
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 48, height: 48, backgroundColor: '#fef3c7', fontSize: 22, flexShrink: 0 }}>💸</div>
                <div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>Montant total dû</div>
                  <div className="fw-bold" style={{ fontSize: 18, color: '#d97706' }}>{totalDu.toLocaleString('fr-FR')} FCFA</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tableau */}
          <div className="bg-white rounded-4 shadow-sm overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
            <div className="px-4 pt-4 pb-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div className="position-relative" style={{ flex: '1 1 280px', maxWidth: 420 }}>
                <span className="position-absolute top-50 translate-middle-y text-muted" style={{ left: 14, pointerEvents: 'none' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
                  </svg>
                </span>
                <input type="text" placeholder="Rechercher par nom, matricule, classe..." value={search}
                  onChange={e => setSearch(e.target.value)} className="form-control"
                  style={{ paddingLeft: 38, paddingTop: 10, paddingBottom: 10, borderRadius: 12, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: 14, boxShadow: 'none' }} />
              </div>
              <button onClick={exportPDF}
                className="btn fw-semibold d-flex align-items-center gap-2 px-4"
                style={{ background: 'linear-gradient(135deg, #4338ca, #6366f1)', color: '#fff', borderRadius: 10, fontSize: 13, padding: '9px 20px', border: 'none' }}>
                📄 Exporter PDF
              </button>
            </div>

            <div className="table-responsive">
              <table className="table align-middle mb-0" style={{ fontSize: 13 }}>
                <thead style={{ backgroundColor: '#f9fafb' }}>
                  <tr>
                    {['#', 'Matricule', 'Nom', 'Prénom', 'Classe', 'Montant dû'].map(h => (
                      <th key={h} className="py-3 px-3 fw-semibold text-uppercase"
                        style={{ color: '#9ca3af', fontSize: 10, letterSpacing: '0.05em', borderTop: '1px solid #f0f0f0' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-5 text-muted">
                        {search ? 'Aucun résultat pour cette recherche.' : '🎉 Aucun élève impayé trouvé !'}
                      </td>
                    </tr>
                  ) : filtered.map((e, idx) => (
                    <tr key={e.eleveId} style={{ borderTop: '1px solid #f3f4f6' }}>
                      <td className="py-3 px-3" style={{ color: '#9ca3af', fontSize: 12 }}>{idx + 1}</td>
                      <td className="py-3 px-3 font-monospace" style={{ fontSize: 12, color: '#6b7280' }}>{e.matricule || '—'}</td>
                      <td className="py-3 px-3 fw-semibold" style={{ color: '#111827' }}>{e.nom}</td>
                      <td className="py-3 px-3" style={{ color: '#374151' }}>{e.prenom}</td>
                      <td className="py-3 px-3">
                        {e.classeNom ? (
                          <span className="badge rounded-pill" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', fontSize: 11, padding: '4px 10px' }}>
                            {e.classeNom}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="py-3 px-3 fw-semibold" style={{ color: '#dc2626' }}>
                        {e.montantAttendu ? `${e.montantAttendu.toLocaleString('fr-FR')} FCFA` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {filtered.length > 0 && (
                  <tfoot style={{ backgroundColor: '#f9fafb', borderTop: '2px solid #e5e7eb' }}>
                    <tr>
                      <td colSpan={5} className="py-3 px-3 fw-bold text-end" style={{ fontSize: 13, color: '#374151' }}>
                        Total ({filtered.length} élèves) :
                      </td>
                      <td className="py-3 px-3 fw-bold" style={{ color: '#dc2626', fontSize: 14 }}>
                        {totalDu.toLocaleString('fr-FR')} FCFA
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </>
      )}

      {!loaded && !loading && (
        <div className="bg-white rounded-4 shadow-sm p-5 text-center" style={{ border: '1px dashed #e5e7eb' }}>
          <div style={{ fontSize: 40 }}>⚠️</div>
          <p className="fw-semibold mt-3 mb-1" style={{ color: '#374151' }}>Charger la liste</p>
          <p className="text-muted mb-0" style={{ fontSize: 13 }}>Sélectionnez les filtres et cliquez sur "Charger" pour afficher les élèves impayés.</p>
        </div>
      )}
    </div>
  );
}
