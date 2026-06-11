import React, { useEffect, useState, useCallback, useRef } from 'react';
import api from '../../api/axios';
import type { Classe } from '../../Types/index';
import type { RapportCoranResponse, RapportLigneEleve } from '../../Types/coran';
import coranService from '../../services/coranService';
import toast from 'react-hot-toast';
import { useAuth } from '../../Context/AuthContext';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

type PeriodeType = 'journalier' | 'hebdomadaire' | 'mensuel';

interface RecentReport {
  id: string;
  classeId: number;
  classeNom: string;
  periode: PeriodeType;
  dateDebut: string;
  dateFin: string;
  periodLabel: string;
  totalSeances: number;
  totalEleves: number;
  generatedAt: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getWeekBounds(date: string) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { debut: monday.toISOString().split('T')[0], fin: sunday.toISOString().split('T')[0] };
}

function getMonthBounds(ym: string) {
  const [y, m] = ym.split('-').map(Number);
  const debut = `${y}-${String(m).padStart(2, '0')}-01`;
  const fin = `${y}-${String(m).padStart(2, '0')}-${new Date(y, m, 0).getDate()}`;
  return { debut, fin };
}

function frDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function frMonth(ym: string) {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

function frWeek(date: string) {
  const { debut, fin } = getWeekBounds(date);
  return `${frDate(debut)} – ${frDate(fin)}`;
}

// ─── PrintableTable ──────────────────────────────────────────────────────────

interface PrintableTableProps {
  titre: string;
  classeNom: string;
  totalSeances: number;
  eleves: RapportLigneEleve[];
  enseignantClasse: string;
  periodLabel: string;
  logoDataUrl?: string;
}

const PrintableTable = React.forwardRef<HTMLDivElement, PrintableTableProps>(
  ({ titre, classeNom, totalSeances, eleves, enseignantClasse, periodLabel, logoDataUrl }, ref) => {
    const totalPresents = eleves.reduce((a, e) => a + e.presents, 0);
    const totalAbsents  = eleves.reduce((a, e) => a + e.absents, 0);
    const totalMemo     = eleves.reduce((a, e) => a + e.memorises, 0);
    const totalPartiel  = eleves.reduce((a, e) => a + e.partiels, 0);

    return (
      <div
        ref={ref}
        dir="rtl"
        style={{
          backgroundColor: '#fff',
          fontFamily: 'Arial, sans-serif',
          padding: '16px 20px',
          width: '297mm',
          minWidth: '297mm',
          fontSize: 12,
          color: '#000',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, borderBottom: '2px solid #0A6E3F', paddingBottom: 10 }}>
          {logoDataUrl && (
            <img src={logoDataUrl} alt="Logo" style={{ width: 64, height: 64, objectFit: 'contain', flexShrink: 0, borderRadius: 8 }} />
          )}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: '#0A6E3F' }}>مدرسة المنارد الثالثة الإسلامية</div>
            <div style={{ fontSize: 14, fontWeight: 'bold', marginTop: 4 }}>{titre}</div>
            <div style={{ fontSize: 12, marginTop: 4, color: '#374151' }}>
              الفصل: <strong>{classeNom}</strong>
              &nbsp;&nbsp;|&nbsp;&nbsp;
              الفترة: <strong>{periodLabel}</strong>
              &nbsp;&nbsp;|&nbsp;&nbsp;
              عدد الجلسات: <strong>{totalSeances}</strong>
            </div>
          </div>
          {logoDataUrl && (
            <img src={logoDataUrl} alt="Logo" style={{ width: 64, height: 64, objectFit: 'contain', flexShrink: 0, borderRadius: 8, opacity: 0.3 }} />
          )}
        </div>

        {/* Main table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, direction: 'rtl' }}>
          <thead>
            <tr style={{ backgroundColor: '#0A6E3F', color: '#fff' }}>
              <th style={{ ...th, minWidth: 90 }}>رقم التعريف</th>
              <th style={{ ...th, minWidth: 120 }}>اسم الطالب</th>
              <th style={th}>السورة</th>
              <th style={th}>تلاوة من</th>
              <th style={th}>تلاوة إلى</th>
              <th style={th}>مراجعة من</th>
              <th style={th}>مراجعة إلى</th>
              <th style={th}>الحضور</th>
              <th style={th}>الغياب</th>
              <th style={th}>نسبة الحضور</th>
              <th style={th}>محفوظ</th>
              <th style={th}>جزئي</th>
              <th style={th}>نسبة الحفظ</th>
              <th style={th}>المستوى</th>
              <th style={{ ...th, minWidth: 110 }}>المسمع</th>
              <th style={{ ...th, minWidth: 110 }}>المعلم</th>
              <th style={{ ...th, minWidth: 90 }}>ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {eleves.map((e, i) => {
              const niveauColor = e.tauxMemorisation >= 80 ? '#0A6E3F'
                : e.tauxMemorisation >= 60 ? '#1d4ed8'
                : e.tauxMemorisation >= 40 ? '#d97706'
                : '#dc2626';
              const bg = i % 2 === 0 ? '#fff' : '#f9fafb';

              return (
                <tr key={e.eleveId} style={{ backgroundColor: bg }}>
                  <td style={{ ...td, fontFamily: 'monospace', fontSize: 10, color: '#6b7280' }}>{e.matricule || '—'}</td>
                  <td style={{ ...td, fontWeight: 600, textAlign: 'right' }}>{e.prenom} {e.nom}</td>
                  <td style={td}>{e.sourateNomArabe || e.sourateNom || '—'}</td>
                  <td style={td}>{e.versetTlatwaDebut ?? '—'}</td>
                  <td style={td}>{e.versetTlatwaFin ?? '—'}</td>
                  <td style={{ ...td, color: '#7c3aed', fontWeight: 600 }}>{e.versetRevisionDebut ?? '—'}</td>
                  <td style={{ ...td, color: '#7c3aed', fontWeight: 600 }}>{e.versetRevisionFin ?? '—'}</td>
                  <td style={{ ...td, color: '#1d4ed8', fontWeight: 600 }}>{e.presents}</td>
                  <td style={{ ...td, color: '#dc2626', fontWeight: 600 }}>{e.absents}</td>
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                      <div style={{ width: 40, height: 6, backgroundColor: '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ width: `${e.tauxPresence}%`, height: '100%', backgroundColor: '#1d4ed8', borderRadius: 99 }} />
                      </div>
                      <span style={{ fontSize: 10, color: '#1d4ed8', fontWeight: 600 }}>{e.tauxPresence}%</span>
                    </div>
                  </td>
                  <td style={{ ...td, color: '#0A6E3F', fontWeight: 600 }}>{e.memorises}</td>
                  <td style={{ ...td, color: '#d97706', fontWeight: 600 }}>{e.partiels}</td>
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                      <div style={{ width: 40, height: 6, backgroundColor: '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ width: `${e.tauxMemorisation}%`, height: '100%', backgroundColor: '#0A6E3F', borderRadius: 99 }} />
                      </div>
                      <span style={{ fontSize: 10, color: '#0A6E3F', fontWeight: 600 }}>{e.tauxMemorisation}%</span>
                    </div>
                  </td>
                  <td style={{ ...td, fontWeight: 600, color: niveauColor }}>{e.niveau}</td>
                  <td style={{ ...td, fontSize: 10, color: '#0A6E3F', fontWeight: 600 }}>{e.enseignantNom || '—'}</td>
                  <td style={{ ...td, fontSize: 10, color: '#1d4ed8', fontWeight: 600 }}>{enseignantClasse || '—'}</td>
                  <td style={{ ...td, fontSize: 9, color: '#6b7280' }}>{e.commentaire || '—'}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: '#e8f5e9', fontWeight: 700, borderTop: '2px solid #0A6E3F' }}>
              <td style={td} colSpan={2}>المجموع</td>
              <td style={td} colSpan={5}>{totalSeances} جلسة</td>
              <td style={{ ...td, color: '#1d4ed8' }}>{totalPresents}</td>
              <td style={{ ...td, color: '#dc2626' }}>{totalAbsents}</td>
              <td style={td}>
                {totalPresents + totalAbsents > 0 ? Math.round(totalPresents / (totalPresents + totalAbsents) * 100) : 0}%
              </td>
              <td style={{ ...td, color: '#0A6E3F' }}>{totalMemo}</td>
              <td style={{ ...td, color: '#d97706' }}>{totalPartiel}</td>
              <td style={td}>
                {totalPresents > 0 ? Math.round((totalMemo + totalPartiel * 0.5) / totalPresents * 100) : 0}%
              </td>
              <td style={td} colSpan={4}></td>
            </tr>
          </tfoot>
        </table>

        {/* Footer */}
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#6b7280', borderTop: '1px solid #e5e7eb', paddingTop: 8 }}>
          <div>تاريخ الطباعة: {new Date().toLocaleDateString('fr-FR')}</div>
          <div>المنارد الثالثة — نظام إدارة المدرسة</div>
          <div>توقيع المعلم: _______________</div>
        </div>
      </div>
    );
  }
);

const th: React.CSSProperties = {
  border: '1px solid #d1fae5',
  padding: '6px 8px',
  textAlign: 'center',
  fontSize: 11,
  fontWeight: 700,
  whiteSpace: 'nowrap',
};

const td: React.CSSProperties = {
  border: '1px solid #e5e7eb',
  padding: '5px 8px',
  textAlign: 'center',
  fontSize: 11,
};

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function RapportCoranPage() {
  const { role } = useAuth();
  const [periode, setPeriode] = useState<PeriodeType>('journalier');
  const [selectedClasse, setSelectedClasse] = useState<number | ''>('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [classes, setClasses] = useState<Classe[]>([]);
  const [enseignants, setEnseignants] = useState<any[]>([]);
  const [rapport, setRapport] = useState<RapportCoranResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [logoDataUrl, setLogoDataUrl] = useState<string>('');
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/classes').then(r => setClasses(r.data)).catch(console.error);
    api.get('/users/enseignants').then(r => setEnseignants(r.data)).catch(() => {});
    const saved = JSON.parse(localStorage.getItem('recentReports') || '[]');
    setRecentReports(saved);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        setLogoDataUrl(canvas.toDataURL('image/jpeg'));
      }
    };
    img.src = '/logo.jpeg';
  }, []);

  const getDateBounds = useCallback(() => {
    if (periode === 'journalier') return { debut: selectedDate, fin: selectedDate };
    if (periode === 'hebdomadaire') return getWeekBounds(selectedDate);
    return getMonthBounds(selectedMonth);
  }, [periode, selectedDate, selectedMonth]);

  const saveToRecents = useCallback((res: RapportCoranResponse, debut: string, fin: string, label: string) => {
    const entry: RecentReport = {
      id: `${Date.now()}`,
      classeId: res.classeId,
      classeNom: res.classeNom,
      periode,
      dateDebut: debut,
      dateFin: fin,
      periodLabel: label,
      totalSeances: res.totalSeances,
      totalEleves: res.eleves.length,
      generatedAt: new Date().toISOString(),
    };
    const existing: RecentReport[] = JSON.parse(localStorage.getItem('recentReports') || '[]');
    const filtered = existing.filter(r => !(r.classeId === entry.classeId && r.dateDebut === entry.dateDebut && r.dateFin === entry.dateFin));
    const updated = [entry, ...filtered].slice(0, 5);
    localStorage.setItem('recentReports', JSON.stringify(updated));
    setRecentReports(updated);
  }, [periode]);

  const loadRecent = (r: RecentReport) => {
    setSelectedClasse(r.classeId);
    setPeriode(r.periode);
    if (r.periode === 'mensuel') {
      setSelectedMonth(r.dateDebut.slice(0, 7));
    } else {
      setSelectedDate(r.dateDebut);
    }
  };

  const fetchData = useCallback(async () => {
    if (!selectedClasse) return;
    setLoading(true);
    try {
      const { debut, fin } = getDateBounds();
      const res = await coranService.getRapport(Number(selectedClasse), debut, fin);
      setRapport(res);
      if (res.totalSeances === 0) {
        toast('Aucune séance pour cette période', { icon: '📭' });
      } else {
        const label = periode === 'journalier' ? frDate(debut)
          : periode === 'hebdomadaire' ? frWeek(debut)
          : frMonth(debut.slice(0, 7));
        saveToRecents(res, debut, fin, label);
      }
    } catch {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [selectedClasse, getDateBounds, saveToRecents, periode]);

  useEffect(() => {
    if (selectedClasse) fetchData();
    else setRapport(null);
  }, [fetchData, selectedClasse]);

  const generatePDF = async () => {
    const el = printRef.current;
    if (!el || !rapport || rapport.eleves.length === 0) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      const pdfH = pw / ratio;

      if (pdfH <= ph) {
        pdf.addImage(imgData, 'PNG', 0, 0, pw, pdfH);
      } else {
        let yPos = 0;
        const pageH = (ph * canvas.width) / pw;
        while (yPos < canvas.height) {
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = Math.min(pageH, canvas.height - yPos);
          const ctx = pageCanvas.getContext('2d')!;
          ctx.drawImage(canvas, 0, -yPos);
          if (yPos > 0) pdf.addPage();
          pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', 0, 0, pw, (pageCanvas.height * pw) / canvas.width);
          yPos += pageH;
        }
      }

      const filename = periode === 'journalier'
        ? `rapport-journalier-${selectedDate}.pdf`
        : periode === 'hebdomadaire'
        ? `rapport-hebdomadaire-${selectedDate}.pdf`
        : `rapport-mensuel-${selectedMonth}.pdf`;

      pdf.save(filename);
      toast.success('PDF généré avec succès !');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la génération du PDF');
    } finally {
      setGenerating(false);
    }
  };

  const periodLabel =
    periode === 'journalier' ? frDate(selectedDate)
    : periode === 'hebdomadaire' ? frWeek(selectedDate)
    : frMonth(selectedMonth);

  const selectedClasseObj = classes.find(c => c.id === selectedClasse);
  const classeNom = rapport?.classeNom || selectedClasseObj?.niveau || '';

  // Priorité : backend → liste enseignants par enseignantId de la classe
  const enseignantClasse = (() => {
    if (rapport?.enseignantClasse) return rapport.enseignantClasse;
    const eid = selectedClasseObj?.enseignantId;
    if (eid) {
      const e = enseignants.find((en: any) => en.id === eid);
      if (e) return `${e.prenom} ${e.nom}`.trim();
    }
    return '';
  })();

  const eleves = rapport?.eleves ?? [];
  const hasData = eleves.length > 0;

  if (role === 'COMPTABLE') {
    return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}><div className="text-muted">Accès non autorisé</div></div>;
  }

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header */}
      <div className="rounded-4 p-5 position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #3730a3 0%, #4338ca 100%)' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: 180, width: 160, height: 160, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', top: 20, right: 120, width: 80, height: 80, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }} />
        <div className="position-relative d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-4">
            <div style={{ width: 64, height: 64, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0 }}>
              📋
            </div>
            <div>
              <h1 className="fw-bold mb-1" style={{ fontSize: 26, color: '#ffffff' }}>Rapports des séances de récitation</h1>
              <p className="mb-1" style={{ fontSize: 17, color: 'rgba(255,255,255,0.9)', fontFamily: 'serif' }}>تقارير جلسات التلاوة</p>
              <p className="mb-0" style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Générez et téléchargez les rapports journaliers, hebdomadaires et mensuels</p>
            </div>
          </div>
          {hasData && (
            <div className="d-flex gap-2 flex-wrap">
              <button onClick={() => window.print()} className="btn fw-semibold" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: 8, fontSize: 13, border: '1px solid rgba(255,255,255,0.3)' }}>
                🖨️ Imprimer
              </button>
              <button onClick={generatePDF} disabled={generating} className="btn fw-semibold" style={{ backgroundColor: '#ffffff', color: '#4338ca', borderRadius: 8, fontSize: 13, border: 'none', minWidth: 160, fontWeight: 700 }}>
                {generating
                  ? <><span className="spinner-border spinner-border-sm me-2" style={{ width: 14, height: 14, borderWidth: 2 }} />Génération...</>
                  : '⬇️ Télécharger PDF'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className="rounded-4 p-4" style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 16px rgba(67,56,202,0.08)', border: '1px solid #e0e7ff' }}>
        <div className="d-flex align-items-center gap-2 mb-4">
          <div style={{ width: 4, height: 20, backgroundColor: '#4338ca', borderRadius: 2 }} />
          <span className="fw-semibold" style={{ fontSize: 13, color: '#374151' }}>Période du rapport — فترة التقرير</span>
        </div>
        <div className="d-flex gap-2 mb-4">
          {(['journalier', 'hebdomadaire', 'mensuel'] as PeriodeType[]).map((p) => (
            <button
              key={p}
              onClick={() => { setPeriode(p); setRapport(null); }}
              className="btn fw-semibold"
              style={{
                borderRadius: 8, fontSize: 13, padding: '8px 18px',
                backgroundColor: periode === p ? '#4338ca' : '#f9fafb',
                color: periode === p ? '#fff' : '#374151',
                border: periode === p ? 'none' : '1px solid #e5e7eb',
              }}
            >
              {p === 'journalier' ? '📅 Journalier' : p === 'hebdomadaire' ? '📆 Hebdomadaire' : '🗓️ Mensuel'}
            </button>
          ))}
        </div>

        <div className="row g-3">
          <div className="col-12 col-md-4">
            <label className="form-label fw-semibold text-uppercase" style={{ fontSize: 11, color: '#6b7280' }}>Classe</label>
            <select value={selectedClasse} onChange={e => setSelectedClasse(e.target.value ? Number(e.target.value) : '')}
              className="form-select" style={{ borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: 14 }}>
              <option value="">Choisir une classe</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.niveau}</option>)}
            </select>
          </div>

          {periode !== 'mensuel' ? (
            <div className="col-12 col-md-4">
              <label className="form-label fw-semibold text-uppercase" style={{ fontSize: 11, color: '#6b7280' }}>
                {periode === 'journalier' ? 'Date' : 'Semaine (sélectionner une date)'}
              </label>
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                className="form-control" style={{ borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: 14 }} />
            </div>
          ) : (
            <div className="col-12 col-md-4">
              <label className="form-label fw-semibold text-uppercase" style={{ fontSize: 11, color: '#6b7280' }}>Mois</label>
              <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
                className="form-control" style={{ borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: 14 }} />
            </div>
          )}

          <div className="col-12 col-md-4 d-flex align-items-end">
            <button onClick={fetchData} disabled={!selectedClasse || loading} className="btn fw-semibold w-100"
              style={{ backgroundColor: '#4338ca', color: '#fff', borderRadius: 8, fontSize: 14, padding: '0.75rem', border: 'none', opacity: (!selectedClasse || loading) ? 0.6 : 1 }}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2" style={{ width: 14, height: 14, borderWidth: 2 }} />Chargement...</> : '🔍 Générer le rapport'}
            </button>
          </div>
        </div>

        {selectedClasse && (
          <div className="mt-3 d-flex flex-wrap gap-2 align-items-center">
            <div className="p-2 rounded-3 d-inline-block" style={{ backgroundColor: '#f0fdf4', border: '1px solid #d1fae5', fontSize: 12, color: '#0A6E3F' }}>
              {periode === 'journalier' ? '📅' : periode === 'hebdomadaire' ? '📆' : '🗓️'}
              &nbsp;<strong>{classeNom}</strong> — {periodLabel}
            </div>
            {enseignantClasse && (
              <div className="p-2 rounded-3 d-inline-block" style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', fontSize: 12, color: '#1d4ed8' }}>
                👨‍🏫 المعلم : <strong>{enseignantClasse}</strong>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Derniers rapports générés */}
      {recentReports.length > 0 && (
        <div className="rounded-4 p-4" style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 16px rgba(67,56,202,0.08)', border: '1px solid #e0e7ff' }}>
          <div className="d-flex align-items-center gap-2 mb-3">
            <div style={{ width: 4, height: 20, backgroundColor: '#4338ca', borderRadius: 2 }} />
            <span className="fw-semibold" style={{ fontSize: 13, color: '#374151' }}>Derniers rapports générés — آخر التقارير</span>
          </div>
          <div className="d-flex flex-wrap gap-3">
            {recentReports.map((r) => (
              <div
                key={r.id}
                onClick={() => loadRecent(r)}
                style={{
                  cursor: 'pointer',
                  border: '1px solid #e0e7ff',
                  borderRadius: 12,
                  padding: '12px 16px',
                  backgroundColor: '#f8f7ff',
                  minWidth: 180,
                  flex: '1 1 180px',
                  maxWidth: 240,
                  transition: 'box-shadow 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(67,56,202,0.15)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span style={{ fontSize: 16 }}>
                    {r.periode === 'journalier' ? '📅' : r.periode === 'hebdomadaire' ? '📆' : '🗓️'}
                  </span>
                  <span className="fw-bold" style={{ fontSize: 13, color: '#3730a3' }}>{r.classeNom}</span>
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>{r.periodLabel}</div>
                <div className="d-flex gap-2 flex-wrap">
                  <span className="badge rounded-pill" style={{ backgroundColor: '#e0e7ff', color: '#4338ca', fontSize: 10 }}>
                    📖 {r.totalSeances} séance{r.totalSeances > 1 ? 's' : ''}
                  </span>
                  <span className="badge rounded-pill" style={{ backgroundColor: '#e8f5e9', color: '#0A6E3F', fontSize: 10 }}>
                    👥 {r.totalEleves} élève{r.totalEleves > 1 ? 's' : ''}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 6 }}>
                  {new Date(r.generatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Placeholder */}
      {!selectedClasse && (
        <div className="bg-white rounded-4 shadow-sm p-5 text-center" style={{ border: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <p className="fw-semibold mb-1" style={{ fontSize: 15, color: '#111827' }}>Aucun rapport sélectionné</p>
          <p className="text-muted mb-0" style={{ fontSize: 13 }}>Choisissez une classe et une période, puis cliquez sur "Générer le rapport"</p>
        </div>
      )}

      {selectedClasse && !loading && rapport !== null && eleves.length === 0 && (
        <div className="bg-white rounded-4 shadow-sm p-5 text-center" style={{ border: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <p className="text-muted mb-0" style={{ fontSize: 13 }}>Aucune séance enregistrée pour cette période</p>
        </div>
      )}

      {/* KPI cards */}
      {hasData && rapport && (
        <div className="row g-3">
          {[
            { label: 'Séances', value: rapport.totalSeances, color: '#0A6E3F', bg: '#e8f5e9', icon: '📖' },
            { label: 'Élèves', value: eleves.length, color: '#7c3aed', bg: '#f5f3ff', icon: '👥' },
            { label: 'Taux de présence', value: `${rapport.tauxPresenceMoyen}%`, color: '#1d4ed8', bg: '#dbeafe', icon: '✅' },
            { label: 'Taux de mémorisation', value: `${rapport.tauxMemorisationMoyen}%`, color: '#d97706', bg: '#fef3c7', icon: '⭐' },
          ].map((card) => (
            <div key={card.label} className="col-6 col-md-3">
              <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: `1px solid ${card.color}22` }}>
                <div style={{ fontSize: 24 }}>{card.icon}</div>
                <div className="fw-bold mt-2" style={{ fontSize: 26, color: card.color }}>{card.value}</div>
                <div className="text-muted" style={{ fontSize: 12 }}>{card.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Printable Table */}
      {hasData && rapport && (
        <div className="rounded-4 overflow-hidden" style={{ boxShadow: '0 2px 16px rgba(67,56,202,0.08)', border: '1px solid #e0e7ff' }}>
          <div className="p-4 d-flex justify-content-between align-items-center" style={{ background: 'linear-gradient(90deg, #eef2ff 0%, #ffffff 100%)', borderBottom: '1px solid #e0e7ff' }}>
            <div className="d-flex align-items-center gap-2">
              <div style={{ width: 4, height: 20, backgroundColor: '#4338ca', borderRadius: 2 }} />
              <h5 className="fw-bold mb-0" style={{ fontSize: 15, color: '#3730a3' }}>
                Tableau de récitation — {classeNom} — {periodLabel}
              </h5>
            </div>
            <span className="badge rounded-pill" style={{ backgroundColor: '#e0e7ff', color: '#4338ca', fontSize: 12 }}>
              {eleves.length} élève(s)
            </span>
          </div>

          <div style={{ overflowX: 'auto', padding: 16 }}>
            <PrintableTable
              ref={printRef}
              titre="قائمة التلاوة"
              classeNom={classeNom}
              totalSeances={rapport.totalSeances}
              eleves={eleves}
              enseignantClasse={enseignantClasse}
              periodLabel={periodLabel}
              logoDataUrl={logoDataUrl}
            />
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #rapport-print-zone, #rapport-print-zone * { visibility: visible; }
          #rapport-print-zone { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
