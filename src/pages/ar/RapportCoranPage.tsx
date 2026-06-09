import React, { useEffect, useState, useCallback, useRef } from 'react';
import api from '../../api/axios';
import type { Classe } from '../../Types/index';
import type { SeanceResponse, SeanceRevisionResponse } from '../../Types/coran';
import coranService from '../../services/coranService';
import toast from 'react-hot-toast';
import { useAuth } from '../../Context/AuthContext';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

type PeriodeType = 'journalier' | 'hebdomadaire' | 'mensuel';

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

// Aggregate per student across séances
interface StudentRow {
  id: number;
  nom: string;
  prenom: string;
  matricule: string;
  totalSeances: number;
  presents: number;
  memorises: number;
  partiels: number;
  absents: number;
  sourates: string[];
  commentaires: string[];
  reciteurs: string[];
  enseignants: string[];
}

function buildStudentRows(seances: SeanceResponse[]): StudentRow[] {
  const map = new Map<number, StudentRow>();
  seances.forEach((s) => {
    const souratesThisSeance: string[] = [];
    s.versets?.forEach((v: any) => {
      const label = v.sourateNomArabe || v.sourateNom || '';
      if (label && !souratesThisSeance.includes(label)) souratesThisSeance.push(label);
    });

    s.recitations?.forEach((r: any) => {
      if (!map.has(r.eleveId)) {
        map.set(r.eleveId, {
          id: r.eleveId,
          nom: r.eleveNom || '',
          prenom: r.elevePrenom || '',
          matricule: r.matricule || '',
          totalSeances: 0,
          presents: 0,
          memorises: 0,
          partiels: 0,
          absents: 0,
          sourates: [],
          commentaires: [],
          reciteurs: [],
          enseignants: [],
        });
      }
      const row = map.get(r.eleveId)!;
      row.totalSeances++;
      if (r.present) {
        row.presents++;
        if (r.niveauMemorisation === 'MEMORISE') row.memorises++;
        else if (r.niveauMemorisation === 'PARTIEL') row.partiels++;
      } else {
        row.absents++;
      }
      souratesThisSeance.forEach((sn) => {
        if (!row.sourates.includes(sn)) row.sourates.push(sn);
      });
      if (r.commentaire) row.commentaires.push(r.commentaire);
      const recNom = s.enseignantNom || '';
      if (recNom && !row.reciteurs.includes(recNom)) row.reciteurs.push(recNom);
      if (recNom && !row.enseignants.includes(recNom)) row.enseignants.push(recNom);
    });
  });
  return Array.from(map.values()).sort((a, b) =>
    `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`)
  );
}

// ─── PrintableTable ──────────────────────────────────────────────────────────

interface PrintableTableProps {
  titre: string;
  periode: string;
  classeNom: string;
  seances: SeanceResponse[];
  students: StudentRow[];
  revisions: SeanceRevisionResponse[];
  enseignantClasse: string;
  periodLabel: string;
  logoDataUrl?: string;
}

const PrintableTable = React.forwardRef<HTMLDivElement, PrintableTableProps>(
  ({ titre, classeNom, seances, students, revisions, enseignantClasse, periodLabel, logoDataUrl }, ref) => {
    const totalPresents = students.reduce((a, s) => a + s.presents, 0);
    const totalAbsents = students.reduce((a, s) => a + s.absents, 0);
    const totalMemo = students.reduce((a, s) => a + s.memorises, 0);
    const totalPartiel = students.reduce((a, s) => a + s.partiels, 0);
    const totalSeances = seances.length;

    // Get first verset from first séance for column info
    const firstVerset = seances[0]?.versets?.[0] as any;

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
          {/* Logo */}
          {logoDataUrl && (
            <img
              src={logoDataUrl}
              alt="Logo"
              style={{ width: 64, height: 64, objectFit: 'contain', flexShrink: 0, borderRadius: 8 }}
            />
          )}
          {/* Titre centré */}
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
          {/* Logo (côté gauche pour symétrie) */}
          {logoDataUrl && (
            <img
              src={logoDataUrl}
              alt="Logo"
              style={{ width: 64, height: 64, objectFit: 'contain', flexShrink: 0, borderRadius: 8, opacity: 0.3 }}
            />
          )}
        </div>

        {/* Main table */}
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 11,
            direction: 'rtl',
          }}
        >
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
            {students.map((s, i) => {
              const tauxPresence = s.totalSeances > 0 ? Math.round((s.presents / s.totalSeances) * 100) : 0;
              const tauxMemo = s.presents > 0 ? Math.round(((s.memorises + s.partiels * 0.5) / s.presents) * 100) : 0;
              const niveau = tauxMemo >= 80 ? 'ممتاز' : tauxMemo >= 60 ? 'جيد' : tauxMemo >= 40 ? 'متوسط' : 'ضعيف';
              const niveauColor = tauxMemo >= 80 ? '#0A6E3F' : tauxMemo >= 60 ? '#1d4ed8' : tauxMemo >= 40 ? '#d97706' : '#dc2626';
              const bg = i % 2 === 0 ? '#fff' : '#f9fafb';

              // Dernière révision de cet élève sur la période
              const eleveRevisions = revisions.filter(rv => rv.eleveId === s.id);
              const lastRev = eleveRevisions.at(-1);

              return (
                <tr key={s.id} style={{ backgroundColor: bg }}>
                  <td style={{ ...td, fontFamily: 'monospace', fontSize: 10, color: '#6b7280' }}>{s.matricule || '—'}</td>
                  <td style={{ ...td, fontWeight: 600, textAlign: 'right' }}>{s.prenom} {s.nom}</td>
                  <td style={td}>{s.sourates[0] || '—'}</td>
                  <td style={td}>{firstVerset?.versetDebut || '—'}</td>
                  <td style={td}>{firstVerset?.versetFin || '—'}</td>
                  <td style={{ ...td, color: '#7c3aed', fontWeight: 600 }}>{lastRev?.versetRevisionDebut ?? '—'}</td>
                  <td style={{ ...td, color: '#7c3aed', fontWeight: 600 }}>{lastRev?.versetRevisionFin ?? '—'}</td>
                  <td style={{ ...td, color: '#1d4ed8', fontWeight: 600 }}>{s.presents}</td>
                  <td style={{ ...td, color: '#dc2626', fontWeight: 600 }}>{s.absents}</td>
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                      <div style={{ width: 40, height: 6, backgroundColor: '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ width: `${tauxPresence}%`, height: '100%', backgroundColor: '#1d4ed8', borderRadius: 99 }} />
                      </div>
                      <span style={{ fontSize: 10, color: '#1d4ed8', fontWeight: 600 }}>{tauxPresence}%</span>
                    </div>
                  </td>
                  <td style={{ ...td, color: '#0A6E3F', fontWeight: 600 }}>{s.memorises}</td>
                  <td style={{ ...td, color: '#d97706', fontWeight: 600 }}>{s.partiels}</td>
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                      <div style={{ width: 40, height: 6, backgroundColor: '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ width: `${tauxMemo}%`, height: '100%', backgroundColor: '#0A6E3F', borderRadius: 99 }} />
                      </div>
                      <span style={{ fontSize: 10, color: '#0A6E3F', fontWeight: 600 }}>{tauxMemo}%</span>
                    </div>
                  </td>
                  <td style={{ ...td, fontWeight: 600, color: niveauColor }}>{niveau}</td>
                  <td style={{ ...td, fontSize: 10, color: '#0A6E3F', fontWeight: 600 }}>{s.enseignants.join('، ') || '—'}</td>
                  <td style={{ ...td, fontSize: 10, color: '#1d4ed8', fontWeight: 600 }}>{enseignantClasse || '—'}</td>
                  <td style={{ ...td, fontSize: 9, color: '#6b7280' }}>{s.commentaires.slice(0, 2).join('، ') || '—'}</td>
                </tr>
              );
            })}
          </tbody>
          {/* Totals row */}
          <tfoot>
            <tr style={{ backgroundColor: '#e8f5e9', fontWeight: 700, borderTop: '2px solid #0A6E3F' }}>
              <td style={td} colSpan={2}>المجموع</td>
              <td style={td} colSpan={5}>{totalSeances} جلسة</td>
              <td style={{ ...td, color: '#1d4ed8' }}>{totalPresents}</td>
              <td style={{ ...td, color: '#dc2626' }}>{totalAbsents}</td>
              <td style={td}>
                {students.length > 0 ? Math.round((totalPresents / (totalPresents + totalAbsents)) * 100) : 0}%
              </td>
              <td style={{ ...td, color: '#0A6E3F' }}>{totalMemo}</td>
              <td style={{ ...td, color: '#d97706' }}>{totalPartiel}</td>
              <td style={td}>
                {totalPresents > 0 ? Math.round(((totalMemo + totalPartiel * 0.5) / totalPresents) * 100) : 0}%
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
  const [seances, setSeances] = useState<SeanceResponse[]>([]);
  const [revisions, setRevisions] = useState<SeanceRevisionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [logoDataUrl, setLogoDataUrl] = useState<string>('');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/classes').then(r => setClasses(r.data)).catch(console.error);
    // Charge le logo en base64 pour html2canvas
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

  const fetchData = useCallback(async () => {
    if (!selectedClasse) return;
    setLoading(true);
    try {
      const { debut, fin } = getDateBounds();
      const [seancesRes, revisionsRes] = await Promise.all([
        coranService.getHistoriqueSeances(Number(selectedClasse), debut, fin),
        coranService.getRevisionsByClasse(Number(selectedClasse), debut, fin).catch(() => []),
      ]);
      setSeances(seancesRes);
      setRevisions(revisionsRes);
      if (seancesRes.length === 0) toast('Aucune séance pour cette période', { icon: '📭' });
    } catch {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [selectedClasse, getDateBounds]);

  useEffect(() => {
    if (selectedClasse) fetchData();
    else setSeances([]);
  }, [fetchData, selectedClasse]);

  const generatePDF = async () => {
    const el = printRef.current;
    if (!el || students.length === 0) return;
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
        // Multi-page
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
  const classeNom = selectedClasseObj?.niveau || '';
  const enseignantClasse = selectedClasseObj?.enseignant
    ? `${selectedClasseObj.enseignant.prenom} ${selectedClasseObj.enseignant.nom}`.trim()
    : '';
  const students = buildStudentRows(seances);

  // Stats
  const totalPresents = students.reduce((a, s) => a + s.presents, 0);
  const totalPersonnes = students.reduce((a, s) => a + s.totalSeances, 0);
  const tauxPresenceMoyen = totalPersonnes > 0 ? Math.round((totalPresents / totalPersonnes) * 100) : 0;
  const totalMemo = students.reduce((a, s) => a + s.memorises, 0);
  const tauxMemoMoyen = totalPresents > 0 ? Math.round(((totalMemo + students.reduce((a, s) => a + s.partiels, 0) * 0.5) / totalPresents) * 100) : 0;

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
          {students.length > 0 && (
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
        {/* Onglets */}
        <div className="d-flex gap-2 mb-4">
          {(['journalier', 'hebdomadaire', 'mensuel'] as PeriodeType[]).map((p) => (
            <button
              key={p}
              onClick={() => { setPeriode(p); setSeances([]); }}
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

        {/* Période affichée */}
        {selectedClasse && (
          <div className="mt-3 p-2 rounded-3 d-inline-block" style={{ backgroundColor: '#f0fdf4', border: '1px solid #d1fae5', fontSize: 12, color: '#0A6E3F' }}>
            {periode === 'journalier' ? '📅' : periode === 'hebdomadaire' ? '📆' : '🗓️'}
            &nbsp;<strong>{classeNom}</strong> — {periodLabel}
          </div>
        )}
      </div>

      {/* Placeholder */}
      {!selectedClasse && (
        <div className="bg-white rounded-4 shadow-sm p-5 text-center" style={{ border: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <p className="fw-semibold mb-1" style={{ fontSize: 15, color: '#111827' }}>Aucun rapport sélectionné</p>
          <p className="text-muted mb-0" style={{ fontSize: 13 }}>Choisissez une classe et une période, puis cliquez sur "Générer le rapport"</p>
        </div>
      )}

      {selectedClasse && !loading && seances.length === 0 && (
        <div className="bg-white rounded-4 shadow-sm p-5 text-center" style={{ border: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <p className="text-muted mb-0" style={{ fontSize: 13 }}>Aucune séance enregistrée pour cette période</p>
        </div>
      )}

      {/* KPI cards */}
      {students.length > 0 && (
        <div className="row g-3">
          {[
            { label: 'Séances', value: seances.length, color: '#0A6E3F', bg: '#e8f5e9', icon: '📖' },
            { label: 'Élèves', value: students.length, color: '#7c3aed', bg: '#f5f3ff', icon: '👥' },
            { label: 'Taux de présence', value: `${tauxPresenceMoyen}%`, color: '#1d4ed8', bg: '#dbeafe', icon: '✅' },
            { label: 'Taux de mémorisation', value: `${tauxMemoMoyen}%`, color: '#d97706', bg: '#fef3c7', icon: '⭐' },
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

      {/* ──── PRINTABLE TABLE (visible + used for PDF capture) ──── */}
      {students.length > 0 && (
        <div className="rounded-4 overflow-hidden" style={{ boxShadow: '0 2px 16px rgba(67,56,202,0.08)', border: '1px solid #e0e7ff' }}>
          <div className="p-4 d-flex justify-content-between align-items-center" style={{ background: 'linear-gradient(90deg, #eef2ff 0%, #ffffff 100%)', borderBottom: '1px solid #e0e7ff' }}>
            <div className="d-flex align-items-center gap-2">
              <div style={{ width: 4, height: 20, backgroundColor: '#4338ca', borderRadius: 2 }} />
              <h5 className="fw-bold mb-0" style={{ fontSize: 15, color: '#3730a3' }}>
                Tableau de récitation — {classeNom} — {periodLabel}
              </h5>
            </div>
            <span className="badge rounded-pill" style={{ backgroundColor: '#e0e7ff', color: '#4338ca', fontSize: 12 }}>
              {students.length} élève(s)
            </span>
          </div>

          {/* This div is captured for PDF */}
          <div style={{ overflowX: 'auto', padding: 16 }}>
            <PrintableTable
              ref={printRef}
              titre="قائمة التلاوة"
              periode={periode}
              classeNom={classeNom}
              seances={seances}
              students={students}
              revisions={revisions}
              enseignantClasse={enseignantClasse}
              periodLabel={periodLabel}
              logoDataUrl={logoDataUrl}
            />
          </div>
        </div>
      )}

      {/* Print CSS */}
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
