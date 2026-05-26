import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import type { Paiement } from '../Types/index';
import almanardLogo from '../assets/almanard.jpeg';
import api from '../api/axios';

// ── Utilitaire formatage montant ──
const formatMontant = (n: number): string =>
  n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';

// ── PDF Export Functions ──

export interface ReceiptData {
  numeroRecu: string;
  eleveNom: string;
  elevePrenom: string;
  montant: number;
  motif: string;
  datePaiement: string;
  moisLibelle?: string;
  typePaiement?: string;
  telephone?: string;
  referenceTransaction?: string;
  classe?: string;
  matricule?: string;
  captureJustificatif?: boolean;
}

export function generateReceipt(data: ReceiptData) {
  const doc = new jsPDF();

  // Montant formaté sans toLocaleString (évite les espaces insécables)
  const montantText = typeof data.montant === 'number'
    ? formatMontant(data.montant)
    : `${data.montant} FCFA`;

  // 1. Header - Logo et nom de l'école
  try {
    doc.addImage(almanardLogo, 'JPEG', 20, 10, 30, 30);
  } catch (error) {
    console.warn('Logo could not be loaded');
  }

  doc.setFontSize(16);
  doc.setTextColor(26, 92, 56);
  doc.setFont('helvetica', 'bold');
  doc.text('GROUPE SCOLAIRE AL-MANARD3S', 105, 25, { align: 'center' });

  // 2. Ligne verte
  doc.setDrawColor(26, 92, 56);
  doc.setLineWidth(1);
  doc.line(20, 40, 190, 40);

  // 3. Titre du reçu
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text(`RECU DE PAIEMENT N°: ${data.numeroRecu}`, 105, 50, { align: 'center' });

  
  // 4. Bloc informations élève
  const studentInfoY = 65;
  doc.setFillColor(220, 252, 231);
  doc.roundedRect(20, studentInfoY, 170, 35, 3, 3, 'F');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 92, 56);
  doc.text("INFORMATIONS SUR L'ELEVE", 25, studentInfoY + 8);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(55, 65, 81);
  doc.text(`Nom Complet: ${data.elevePrenom} ${data.eleveNom}`, 25, studentInfoY + 18);

  if (data.matricule) {
    doc.text(`Matricule: ${data.matricule}`, 25, studentInfoY + 26);
  }
  if (data.classe) {
    doc.text(`Classe: ${data.classe}`, 105, studentInfoY + 26);
  }

  // 5. Détails du paiement
  const paymentDetailsY = studentInfoY + 45;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 92, 56);
  doc.text('DETAILS DU PAIEMENT', 20, paymentDetailsY);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(55, 65, 81);

  const dateObj = new Date(data.datePaiement);
  const formattedDate = dateObj.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  doc.text(`Date de l'operation: ${formattedDate}`, 20, paymentDetailsY + 10);

  let motifText = data.motif;
  if (data.moisLibelle) {
    motifText += ` - Mois de ${data.moisLibelle}`;
  }
  doc.text(`Type / Motif: ${motifText}`, 20, paymentDetailsY + 18);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(`Montant: ${montantText}`, 20, paymentDetailsY + 28);

  // 6. Tableau de paiement
  const tableY = paymentDetailsY + 40;
  let description = 'Paiement';
  if (data.typePaiement) {
    const typeLabels: Record<string, string> = {
      'ESPECE': 'Espece',
      'WAVE': 'Wave',
      'CHEQUE': 'Cheque',
      'ORANGE_MONEY': 'Orange Money',
    };
    description = `Paiement via ${typeLabels[data.typePaiement] || data.typePaiement}`;
    if (data.typePaiement === 'WAVE' || data.typePaiement === 'ORANGE_MONEY') {
      description += ' - Transfert Mobile';
    }
  }

  const tableData = [[description, montantText]];
  let tableFinalY = tableY;

  autoTable(doc, {
    startY: tableY,
    head: [['Description', 'Montant (FCFA)']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 157, 88],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 11,
    },
    bodyStyles: {
      textColor: [0, 0, 0],
      halign: 'right',
      fontSize: 12,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 110, halign: 'left' },
      1: { cellWidth: 60, halign: 'right' },
    },
    didDrawPage: (hookData) => {
      tableFinalY = hookData.table?.finalY || tableY + 20;
      doc.setDrawColor(26, 92, 56);
      doc.setLineWidth(0.5);
      doc.line(20, tableFinalY + 5, 190, tableFinalY + 5);
      doc.line(20, tableFinalY + 7, 190, tableFinalY + 7);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('MONTANT TOTAL PAYE', 20, tableFinalY + 15);
      doc.text(montantText, 190, tableFinalY + 15, { align: 'right' });
    },
  });

  // 7. Traçabilité numérique (paiements mobiles)
  if (data.typePaiement === 'WAVE' || data.typePaiement === 'ORANGE_MONEY') {
    const traceabilityY = tableFinalY + 25;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 92, 56);
    doc.text('TRACABILITE NUMERIQUE', 20, traceabilityY + 15);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(55, 65, 81);

    const typeLabels: Record<string, string> = {
      'WAVE': 'Wave',
      'ORANGE_MONEY': 'Orange Money',
    };

    doc.text(`Moyen de Paiement: ${typeLabels[data.typePaiement!] || data.typePaiement}`, 20, traceabilityY + 25);

    if (data.telephone) {
      doc.text(`Numero Associe: ${data.telephone}`, 20, traceabilityY + 33);
    }
    if (data.referenceTransaction) {
      doc.text(`Reference de Transaction: ${data.referenceTransaction}`, 20, traceabilityY + 41);
    }

    doc.setFontSize(9);
    if (data.captureJustificatif) {
      doc.setTextColor(15, 157, 88);
      doc.text("Capture d'ecran jointe au dossier", 20, traceabilityY + 49);
    } else {
      doc.setTextColor(239, 68, 68);
      doc.text("Capture d'ecran non jointe", 20, traceabilityY + 49);
    }
  }

  // 8. Footer - Signature et cachet
  const footerY = doc.internal.pageSize.height - 50;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(140, footerY, 40, 25);

  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text('Signature', 160, footerY + 15, { align: 'center' });
  doc.text('Cachet', 160, footerY + 22, { align: 'center' });

  doc.setDrawColor(229, 231, 235);
  doc.line(20, footerY + 35, 190, footerY + 35);

  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text('GROUPE SCOLAIRE AL-MANARD3S', 105, footerY + 42, { align: 'center' });
  doc.text('Tel: +221 78 120 89 78 | +221 77 520 87 67 | Email: info@almanard3s.com | www.almanard3s.com', 105, footerY + 48, { align: 'center' });

  doc.save(`recu_${data.numeroRecu}.pdf`);
}

export function generatePaymentListReport(paiements: Paiement[], title: string = 'Rapport des Paiements') {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setTextColor(26, 92, 56);
  doc.text(title, 105, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`Genere le ${new Date().toLocaleDateString('fr-FR')}`, 105, 28, { align: 'center' });
  doc.text(`Total: ${paiements.length} paiement(s)`, 105, 34, { align: 'center' });

  doc.setDrawColor(229, 231, 235);
  doc.line(20, 40, 190, 40);

  const tableData = paiements.map(p => [
    p.numeroRecu,
    `${p.eleveNom} ${p.elevePrenom}`,
    p.motif,
    p.moisLibelle || '—',
    formatMontant(p.montant),
    new Date(p.datePaiement).toLocaleDateString('fr-FR'),
  ]);

  const totalMontant = paiements.reduce((sum, p) => sum + p.montant, 0);

  autoTable(doc, {
    startY: 50,
    head: [['N° Recu', 'Eleve', 'Motif', 'Mois', 'Montant', 'Date']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [26, 92, 56],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 9,
    },
    bodyStyles: {
      textColor: [55, 65, 81],
      halign: 'center',
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 40 },
      2: { cellWidth: 30 },
      3: { cellWidth: 25 },
      4: { cellWidth: 35 },
      5: { cellWidth: 25 },
    },
    styles: { overflow: 'linebreak' },
    didDrawPage: (data) => {
      const finalY = data.cursor?.y || data.table.finalY;
      doc.setFontSize(10);
      doc.setTextColor(26, 92, 56);
      doc.setFont(undefined, 'bold');
      doc.text(
        `Total: ${formatMontant(totalMontant)}`,
        190,
        finalY + 10,
        { align: 'right' }
      );
    },
  });

  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Page ${i} / ${pageCount} — © 2026 Al-Manard3s`,
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  doc.save(`rapport_paiements_${new Date().toISOString().split('T')[0]}.pdf`);
}

// ── Excel Export Functions ──

export function exportPaymentsToExcel(paiements: Paiement[], filename: string = 'paiements') {
  const excelData = paiements.map(p => ({
    'Numero de Recu': p.numeroRecu,
    'Eleve': `${p.eleveNom} ${p.elevePrenom}`,
    'Motif': p.motif,
    'Mois': p.moisLibelle || '—',
    'Montant (FCFA)': p.montant,
    'Date de Paiement': new Date(p.datePaiement).toLocaleDateString('fr-FR'),
    'Enregistre par': p.enregistreParNom || '—',
  }));

  const totalMontant = paiements.reduce((sum, p) => sum + p.montant, 0);

  excelData.push({
    'Numero de Recu': 'TOTAL',
    'Eleve': '',
    'Motif': '' as any,
    'Mois': '',
    'Montant (FCFA)': totalMontant,
    'Date de Paiement': '',
    'Enregistre par': '',
  });

  const ws = XLSX.utils.json_to_sheet(excelData);

  ws['!cols'] = [
    { wch: 20 },
    { wch: 30 },
    { wch: 15 },
    { wch: 15 },
    { wch: 18 },
    { wch: 18 },
    { wch: 20 },
  ];

  const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
    const address = XLSX.utils.encode_col(C) + '1';
    if (!ws[address]) continue;
    ws[address].s = {
      fill: { fgColor: { rgb: '1A5C38' } },
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      alignment: { horizontal: 'center' },
    };
  }

  const totalRowIndex = excelData.length;
  for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
    const address = XLSX.utils.encode_col(C) + totalRowIndex;
    if (!ws[address]) continue;
    ws[address].s = {
      fill: { fgColor: { rgb: 'DCFCE7' } },
      font: { bold: true, color: { rgb: '166534' } },
    };
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Paiements');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// ── Report Generation Functions ──

export async function generateDailyReport(startDate: string, endDate: string) {
  try {
    const [paiementsRes, depensesRes, inscriptionsRes] = await Promise.all([
      api.get('/paiements'),
      api.get('/depenses'),
      api.get('/inscription'),
    ]);

    const paiements = paiementsRes.data || [];
    const depenses = depensesRes.data || [];
    const inscriptions = inscriptionsRes.data || [];

    // Filter by date range
    const filteredPaiements = paiements.filter((p: any) => {
      const date = new Date(p.datePaiement).toISOString().split('T')[0];
      return date >= startDate && date <= endDate;
    });

    const filteredDepenses = depenses.filter((d: any) => {
      const date = new Date(d.dateDepense).toISOString().split('T')[0];
      return date >= startDate && date <= endDate;
    });

    const filteredInscriptions = inscriptions.filter((i: any) => {
      const date = new Date(i.dateInscription).toISOString().split('T')[0];
      return date >= startDate && date <= endDate;
    });

    const doc = new jsPDF();

    // Header
    try {
      doc.addImage(almanardLogo, 'JPEG', 20, 10, 30, 30);
    } catch (error) {
      console.warn('Logo could not be loaded');
    }

    doc.setFontSize(18);
    doc.setTextColor(26, 92, 56);
    doc.setFont('helvetica', 'bold');
    doc.text('RAPPORT JOURNALIER', 105, 25, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128);
    doc.text(`Période: ${new Date(startDate).toLocaleDateString('fr-FR')} - ${new Date(endDate).toLocaleDateString('fr-FR')}`, 105, 33, { align: 'center' });

    doc.setDrawColor(229, 231, 235);
    doc.line(20, 40, 190, 40);

    // Summary
    const totalPaiements = filteredPaiements.reduce((sum: number, p: any) => sum + (p.montant || 0), 0);
    const totalDepenses = filteredDepenses.reduce((sum: number, d: any) => sum + (d.montant || 0), 0);

    doc.setFontSize(12);
    doc.setTextColor(26, 92, 56);
    doc.setFont('helvetica', 'bold');
    doc.text('RÉSUMÉ', 20, 50);

    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    doc.setFont('helvetica', 'normal');
    doc.text(`Paiements: ${filteredPaiements.length} transaction(s) - ${formatMontant(totalPaiements)}`, 20, 58);
    doc.text(`Dépenses: ${filteredDepenses.length} dépense(s) - ${formatMontant(totalDepenses)}`, 20, 65);
    doc.text(`Nouvelles inscriptions: ${filteredInscriptions.length}`, 20, 72);

    // Paiements table
    if (filteredPaiements.length > 0) {
      const paiementData = filteredPaiements.map((p: any) => [
        p.numeroRecu,
        `${p.eleveNom} ${p.elevePrenom}`,
        p.motif,
        formatMontant(p.montant),
        new Date(p.datePaiement).toLocaleDateString('fr-FR'),
      ]);

      autoTable(doc, {
        startY: 85,
        head: [['N° Recu', 'Élève', 'Motif', 'Montant', 'Date']],
        body: paiementData,
        theme: 'striped',
        headStyles: { fillColor: [26, 92, 56], textColor: 255, fontSize: 9 },
        bodyStyles: { textColor: [55, 65, 81], fontSize: 8 },
      });
    }

    doc.save(`rapport_journalier_${startDate}_${endDate}.pdf`);
  } catch (error) {
    console.error('Error generating daily report:', error);
    throw error;
  }
}

export async function generateWeeklyReport(startDate: string, endDate: string) {
  try {
    const [paiementsRes, depensesRes, inscriptionsRes] = await Promise.all([
      api.get('/paiements'),
      api.get('/depenses'),
      api.get('/inscription'),
    ]);

    const paiements = paiementsRes.data || [];
    const depenses = depensesRes.data || [];
    const inscriptions = inscriptionsRes.data || [];

    // Filter by date range
    const filteredPaiements = paiements.filter((p: any) => {
      const date = new Date(p.datePaiement).toISOString().split('T')[0];
      return date >= startDate && date <= endDate;
    });

    const filteredDepenses = depenses.filter((d: any) => {
      const date = new Date(d.dateDepense).toISOString().split('T')[0];
      return date >= startDate && date <= endDate;
    });

    const filteredInscriptions = inscriptions.filter((i: any) => {
      const date = new Date(i.dateInscription).toISOString().split('T')[0];
      return date >= startDate && date <= endDate;
    });

    const doc = new jsPDF();

    // Header
    try {
      doc.addImage(almanardLogo, 'JPEG', 20, 10, 30, 30);
    } catch (error) {
      console.warn('Logo could not be loaded');
    }

    doc.setFontSize(18);
    doc.setTextColor(26, 92, 56);
    doc.setFont('helvetica', 'bold');
    doc.text('RAPPORT HEBDOMADAIRE', 105, 25, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128);
    doc.text(`Période: ${new Date(startDate).toLocaleDateString('fr-FR')} - ${new Date(endDate).toLocaleDateString('fr-FR')}`, 105, 33, { align: 'center' });

    doc.setDrawColor(229, 231, 235);
    doc.line(20, 40, 190, 40);

    // Summary
    const totalPaiements = filteredPaiements.reduce((sum: number, p: any) => sum + (p.montant || 0), 0);
    const totalDepenses = filteredDepenses.reduce((sum: number, d: any) => sum + (d.montant || 0), 0);

    doc.setFontSize(12);
    doc.setTextColor(26, 92, 56);
    doc.setFont('helvetica', 'bold');
    doc.text('RÉSUMÉ HEBDOMADAIRE', 20, 50);

    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    doc.setFont('helvetica', 'normal');
    doc.text(`Paiements: ${filteredPaiements.length} transaction(s) - ${formatMontant(totalPaiements)}`, 20, 58);
    doc.text(`Dépenses: ${filteredDepenses.length} dépense(s) - ${formatMontant(totalDepenses)}`, 20, 65);
    doc.text(`Nouvelles inscriptions: ${filteredInscriptions.length}`, 20, 72);
    doc.text(`Solde net: ${formatMontant(totalPaiements - totalDepenses)}`, 20, 79);

    // Paiements table
    if (filteredPaiements.length > 0) {
      const paiementData = filteredPaiements.map((p: any) => [
        p.numeroRecu,
        `${p.eleveNom} ${p.elevePrenom}`,
        p.motif,
        formatMontant(p.montant),
        new Date(p.datePaiement).toLocaleDateString('fr-FR'),
      ]);

      autoTable(doc, {
        startY: 90,
        head: [['N° Recu', 'Élève', 'Motif', 'Montant', 'Date']],
        body: paiementData,
        theme: 'striped',
        headStyles: { fillColor: [26, 92, 56], textColor: 255, fontSize: 9 },
        bodyStyles: { textColor: [55, 65, 81], fontSize: 8 },
      });
    }

    doc.save(`rapport_hebdomadaire_${startDate}_${endDate}.pdf`);
  } catch (error) {
    console.error('Error generating weekly report:', error);
    throw error;
  }
}

export async function generateMonthlyReport(startDate: string, endDate: string) {
  try {
    const [paiementsRes, depensesRes, inscriptionsRes, elevesRes] = await Promise.all([
      api.get('/paiements'),
      api.get('/depenses'),
      api.get('/inscription'),
      api.get('/eleves'),
    ]);

    const paiements = paiementsRes.data || [];
    const depenses = depensesRes.data || [];
    const inscriptions = inscriptionsRes.data || [];
    const eleves = elevesRes.data || [];

    // Filter by date range
    const filteredPaiements = paiements.filter((p: any) => {
      const date = new Date(p.datePaiement).toISOString().split('T')[0];
      return date >= startDate && date <= endDate;
    });

    const filteredDepenses = depenses.filter((d: any) => {
      const date = new Date(d.dateDepense).toISOString().split('T')[0];
      return date >= startDate && date <= endDate;
    });

    const filteredInscriptions = inscriptions.filter((i: any) => {
      const date = new Date(i.dateInscription).toISOString().split('T')[0];
      return date >= startDate && date <= endDate;
    });

    const doc = new jsPDF();

    // Header
    try {
      doc.addImage(almanardLogo, 'JPEG', 20, 10, 30, 30);
    } catch (error) {
      console.warn('Logo could not be loaded');
    }

    doc.setFontSize(18);
    doc.setTextColor(26, 92, 56);
    doc.setFont('helvetica', 'bold');
    doc.text('RAPPORT MENSUEL', 105, 25, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128);
    doc.text(`Période: ${new Date(startDate).toLocaleDateString('fr-FR')} - ${new Date(endDate).toLocaleDateString('fr-FR')}`, 105, 33, { align: 'center' });

    doc.setDrawColor(229, 231, 235);
    doc.line(20, 40, 190, 40);

    // Summary
    const totalPaiements = filteredPaiements.reduce((sum: number, p: any) => sum + (p.montant || 0), 0);
    const totalDepenses = filteredDepenses.reduce((sum: number, d: any) => sum + (d.montant || 0), 0);

    doc.setFontSize(12);
    doc.setTextColor(26, 92, 56);
    doc.setFont('helvetica', 'bold');
    doc.text('RÉSUMÉ MENSUEL', 20, 50);

    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total élèves: ${eleves.length}`, 20, 58);
    doc.text(`Paiements: ${filteredPaiements.length} transaction(s) - ${formatMontant(totalPaiements)}`, 20, 65);
    doc.text(`Dépenses: ${filteredDepenses.length} dépense(s) - ${formatMontant(totalDepenses)}`, 20, 72);
    doc.text(`Nouvelles inscriptions: ${filteredInscriptions.length}`, 20, 79);
    doc.text(`Solde net: ${formatMontant(totalPaiements - totalDepenses)}`, 20, 86);

    // Paiements by motif
    const paiementsByMotif = filteredPaiements.reduce((acc: any, p: any) => {
      acc[p.motif] = (acc[p.motif] || 0) + (p.montant || 0);
      return acc;
    }, {});

    doc.setFontSize(11);
    doc.setTextColor(26, 92, 56);
    doc.setFont('helvetica', 'bold');
    doc.text('Paiements par Motif', 20, 96);

    let motifY = 104;
    Object.entries(paiementsByMotif).forEach(([motif, montant]: [string, any]) => {
      doc.setFontSize(9);
      doc.setTextColor(55, 65, 81);
      doc.setFont('helvetica', 'normal');
      doc.text(`${motif}: ${formatMontant(montant)}`, 20, motifY);
      motifY += 7;
    });

    // Paiements table
    if (filteredPaiements.length > 0) {
      const paiementData = filteredPaiements.map((p: any) => [
        p.numeroRecu,
        `${p.eleveNom} ${p.elevePrenom}`,
        p.motif,
        formatMontant(p.montant),
        new Date(p.datePaiement).toLocaleDateString('fr-FR'),
      ]);

      autoTable(doc, {
        startY: motifY + 5,
        head: [['N° Recu', 'Élève', 'Motif', 'Montant', 'Date']],
        body: paiementData,
        theme: 'striped',
        headStyles: { fillColor: [26, 92, 56], textColor: 255, fontSize: 9 },
        bodyStyles: { textColor: [55, 65, 81], fontSize: 8 },
      });
    }

    doc.save(`rapport_mensuel_${startDate}_${endDate}.pdf`);
  } catch (error) {
    console.error('Error generating monthly report:', error);
    throw error;
  }
}