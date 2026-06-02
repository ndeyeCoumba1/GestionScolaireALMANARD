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
  montantAttendu?: number;
  statut?: string;
  motif: string;
  datePaiement: string;
  moisLibelle?: string;
  typePaiement?: string;
  telephone?: string;
  referenceTransaction?: string;
  classe?: string;
  matricule?: string;
  anneeScolaire?: string;
  captureJustificatif?: boolean;
}

export interface DailyReportData {
  dateRapport: string;
  dateDebut: string;
  dateFin: string;
  reportId: string;
  totalRecettes: number;
  totalDepenses: number;
  soldeNet: number;
  paiements: Array<{
    numeroRecu: string;
    eleveNom: string;
    elevePrenom: string;
    moisLibelle?: string;
    motif: string;
    montant: number;
    montantAttendu?: number;
    statut: string;
    typePaiement: string;
  }>;
  depenses: Array<{
    numeroDepense: string;
    description: string;
    periode?: string;
    montant: number;
    date: string;
  }>;
  nouvellesInscriptions: Array<{
    nom: string;
    prenom: string;
    classe: string;
  }>;
  modificationsSysteme: Array<{
    utilisateur: string;
    action: string;
    date: string;
  }>;
}

export function generateReceipt(data: ReceiptData) {
  const doc = new jsPDF();
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;

  // Couleurs - Dégradé vert
  const darkGreen: [number, number, number] = [10, 110, 63]; // #0A6E3F
  const mediumGreen: [number, number, number] = [15, 157, 88]; // #0F9D58
  const lightGreen: [number, number, number] = [220, 252, 231]; // #DCFCED
  const grayText: [number, number, number] = [55, 65, 81];
  const lightGray: [number, number, number] = [229, 231, 235];

  // Calcul du reste à payer et statut
  const montantAttendu = data.montantAttendu || data.montant;
  const resteAPayer = Math.max(0, montantAttendu - data.montant);
  const estPaiementPartiel = data.statut === 'PARTIEL' || (data.montantAttendu && data.montant < data.montantAttendu);

  // Montant formaté
  const montantText = formatMontant(data.montant);
  const montantAttenduText = formatMontant(montantAttendu);
  const resteAPayerText = formatMontant(resteAPayer);

  // ── HEADER ──
  // Logo à gauche
  try {
    doc.addImage(almanardLogo, 'JPEG', margin, 12, 28, 28);
  } catch (error) {
    console.warn('Logo could not be loaded');
  }

  // Titre à droite
  doc.setFontSize(22);
  doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('REÇU DE PAIEMENT', pageWidth - margin, 20, { align: 'right' });

  // Numéro du reçu dans un encadré moderne
  doc.setDrawColor(darkGreen[0], darkGreen[1], darkGreen[2]);
  doc.setLineWidth(1);
  doc.roundedRect(pageWidth - margin - 60, 28, 60, 20, 5, 5, 'S');
  
  doc.setFontSize(8);
  doc.setTextColor(grayText[0], grayText[1], grayText[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('N° REÇU', pageWidth - margin - 55, 35);
  
  doc.setFontSize(12);
  doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(data.numeroRecu, pageWidth - margin - 55, 42);

  // Ligne de séparation
  doc.setDrawColor(lightGreen[0], lightGreen[1], lightGreen[2]);
  doc.setLineWidth(2);
  doc.line(margin, 50, pageWidth - margin, 50);

  let currentY = 58;

  // ── SECTION INFORMATIONS SUR L'ÉLÈVE ──
  doc.setFontSize(10);
  doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('👤 INFORMATIONS SUR L\'ÉLÈVE', margin, currentY);
  currentY += 8;

  // Bloc élève avec fond léger
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, currentY, pageWidth - 2 * margin, 30, 5, 5, 'F');
  
  doc.setFontSize(9);
  doc.setTextColor(grayText[0], grayText[1], grayText[2]);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nom complet : ${data.elevePrenom} ${data.eleveNom}`, margin + 8, currentY + 12);
  
  if (data.classe) {
    doc.text(`Classe : ${data.classe}`, margin + 8, currentY + 22);
  }
  if (data.anneeScolaire) {
    doc.text(`Année scolaire : ${data.anneeScolaire}`, pageWidth - margin - 8, currentY + 22, { align: 'right' });
  }

  currentY += 40;

  // ── SECTION DÉTAILS DU PAIEMENT ──
  doc.setFontSize(10);
  doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('💳 DÉTAILS DU PAIEMENT', margin, currentY);
  currentY += 8;

  const dateObj = new Date(data.datePaiement);
  const formattedDate = dateObj.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  doc.setFontSize(9);
  doc.setTextColor(grayText[0], grayText[1], grayText[2]);
  doc.setFont('helvetica', 'normal');
  doc.text(`📅 Date : ${formattedDate}`, margin + 8, currentY);

  let motifText = data.motif;
  if (data.moisLibelle) {
    motifText += ` - ${data.moisLibelle}`;
  }
  doc.text(`📝 Motif : ${motifText}`, margin + 8, currentY + 8);

  currentY += 18;

  // ── TABLEAU ÉLÉGANT ──
  const tableRows = [
    ['Montant total attendu', montantAttenduText],
    ['Montant versé', montantText],
  ];

  if (estPaiementPartiel) {
    tableRows.push(['Statut', 'PARTIEL']);
  } else {
    tableRows.push(['Statut', 'PAYÉ']);
  }

  let tableFinalY = currentY;

  autoTable(doc, {
    startY: currentY,
    head: [['Description', 'Montant']],
    body: tableRows,
    theme: 'plain',
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: darkGreen,
      fontStyle: 'bold',
      halign: 'left',
      fontSize: 9,
    },
    bodyStyles: {
      textColor: grayText,
      fontSize: 10,
    },
    columnStyles: {
      0: { cellWidth: 120, halign: 'left' },
      1: { cellWidth: 50, halign: 'right', fontStyle: 'bold' },
    },
    didDrawCell: (hookData) => {
      if (hookData.section === 'body') {
        const cell = hookData.cell;
        // Bordure arrondie pour chaque cellule
        doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.setLineWidth(0.3);
        doc.roundedRect(cell.x, cell.y, cell.width, cell.height, 2, 2, 'S');
        
        // Statut en vert
        if (hookData.row.raw[0] === 'Statut') {
          doc.setTextColor(mediumGreen[0], mediumGreen[1], mediumGreen[2]);
        }
      }
    },
    didDrawPage: (hookData) => {
      tableFinalY = hookData.table?.finalY || currentY + 30;
    },
  });

  currentY = tableFinalY + 12;

  // ── SECTION RÉSUMÉ AVEC DESIGN VISUEL MODERNE ──
  // Bloc Reste à payer (vert foncé)
  doc.setFillColor(darkGreen[0], darkGreen[1], darkGreen[2]);
  doc.roundedRect(margin, currentY, (pageWidth - 2 * margin) / 2 - 5, 35, 8, 8, 'F');
  
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.text('RESTE À PAYER', margin + 10, currentY + 12);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(resteAPayerText, margin + 10, currentY + 24);

  // Bloc Montant versé aujourd'hui (mis en valeur)
  const summaryBlockX = margin + (pageWidth - 2 * margin) / 2 + 5;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(mediumGreen[0], mediumGreen[1], mediumGreen[2]);
  doc.setLineWidth(2);
  doc.roundedRect(summaryBlockX, currentY, (pageWidth - 2 * margin) / 2 - 5, 35, 8, 8, 'FD');
  
  doc.setFontSize(8);
  doc.setTextColor(grayText[0], grayText[1], grayText[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('MONTANT VERSÉ AUJOURD\'HUI', summaryBlockX + 10, currentY + 12);
  
  doc.setFontSize(14);
  doc.setTextColor(mediumGreen[0], mediumGreen[1], mediumGreen[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(montantText, summaryBlockX + 10, currentY + 24);

  currentY += 45;

  // ── MESSAGE POUR PAIEMENT PARTIEL ──
  if (estPaiementPartiel && resteAPayer > 0) {
    doc.setFillColor(254, 243, 242);
    doc.roundedRect(margin, currentY, pageWidth - 2 * margin, 25, 5, 5, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(220, 38, 38);
    doc.setFont('helvetica', 'bold');
    doc.text('⚠️ Paiement partiel - Un solde de ' + resteAPayerText + ' reste dû', margin + 8, currentY + 12);
    
    doc.setFontSize(7);
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    doc.setFont('helvetica', 'normal');
    doc.text('Veuillez régulariser la situation dans les plus brefs délais.', margin + 8, currentY + 20);
    
    currentY += 30;
  }

  // ── TRACABILITÉ NUMÉRIQUE ──
  if (data.typePaiement === 'WAVE' || data.typePaiement === 'ORANGE_MONEY') {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, currentY, pageWidth - 2 * margin, 30, 5, 5, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('📱 TRACABILITÉ NUMÉRIQUE', margin + 8, currentY + 10);
    
    doc.setFontSize(8);
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    doc.setFont('helvetica', 'normal');
    
    const typeLabels: Record<string, string> = {
      'WAVE': 'Wave',
      'ORANGE_MONEY': 'Orange Money',
    };
    
    doc.text(`Moyen : ${typeLabels[data.typePaiement!] || data.typePaiement}`, margin + 8, currentY + 18);
    
    if (data.telephone) {
      doc.text(`Téléphone : ${data.telephone}`, margin + 8, currentY + 26);
    }
    
    currentY += 38;
  }

  // ── SIGNATURE ET CACHET ──
  const signatureY = pageHeight - 60;
  
  doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.setLineWidth(1);
  doc.roundedRect(pageWidth - margin - 50, signatureY, 50, 40, 5, 5, 'S');
  
  doc.setFontSize(8);
  doc.setTextColor(grayText[0], grayText[1], grayText[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('Signature', pageWidth - margin - 25, signatureY + 20, { align: 'center' });
  doc.text('Cachet', pageWidth - margin - 25, signatureY + 30, { align: 'center' });

  // ── FOOTER ──
  const footerY = pageHeight - 40;
  
  doc.setDrawColor(lightGreen[0], lightGreen[1], lightGreen[2]);
  doc.setLineWidth(1);
  doc.line(margin, footerY, pageWidth - margin, footerY);
  
  doc.setFontSize(7);
  doc.setTextColor(grayText[0], grayText[1], grayText[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('GROUPE SCOLAIRE AL-MANAR D3S', pageWidth / 2, footerY + 8, { align: 'center' });
  doc.text('📞 +221 78 120 89 78 | +221 77 520 87 67', pageWidth / 2, footerY + 15, { align: 'center' });
  doc.text('✉️ info@almanard3s.com | 🌐 www.almanard3s.com', pageWidth / 2, footerY + 22, { align: 'center' });

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
    p.numeroRecu || '—',
    `${p.eleveNom || ''} ${p.elevePrenom || ''}`.trim() || '—',
    p.motif || '—',
    p.moisLibelle || '—',
    formatMontant(p.montant || 0),
    p.datePaiement ? new Date(p.datePaiement).toLocaleDateString('fr-FR') : '—',
    `${p.enregistreParNom || '—'}${p.enregistreParRole ? ` (${p.enregistreParRole})` : ''}`,
  ]);

  const totalMontant = paiements.reduce((sum, p) => sum + p.montant, 0);

  autoTable(doc, {
    startY: 50,
    head: [['N° Recu', 'Eleve', 'Motif', 'Mois', 'Montant', 'Date', 'Enregistré par']],
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
      0: { cellWidth: 22 },
      1: { cellWidth: 35 },
      2: { cellWidth: 25 },
      3: { cellWidth: 22 },
      4: { cellWidth: 30 },
      5: { cellWidth: 22 },
      6: { cellWidth: 32 },
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
    'Numero de Recu': p.numeroRecu || '—',
    'Eleve': `${p.eleveNom || ''} ${p.elevePrenom || ''}`.trim() || '—',
    'Motif': p.motif || '—',
    'Mois': p.moisLibelle || '—',
    'Montant (FCFA)': p.montant || 0,
    'Date de Paiement': p.datePaiement ? new Date(p.datePaiement).toLocaleDateString('fr-FR') : '—',
    'Enregistre par': `${p.enregistreParNom || '—'}${p.enregistreParRole ? ` (${p.enregistreParRole})` : ''}`,
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
      api.get('/inscriptions'),
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

    // Calculate totals
    const totalRecettes = filteredPaiements.reduce((sum: number, p: any) => sum + (p.montant || 0), 0);
    const totalDepenses = filteredDepenses.reduce((sum: number, d: any) => sum + (d.montant || 0), 0);
    const soldeNet = totalRecettes - totalDepenses;

    // Generate report ID
    const today = new Date();
    const reportId = `REF-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}-001`;

    // Format date for display
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    // Prepare DailyReportData
    const reportData: DailyReportData = {
      dateRapport: formatDate(endDate),
      dateDebut: formatDate(startDate),
      dateFin: formatDate(endDate),
      reportId,
      totalRecettes,
      totalDepenses,
      soldeNet,
      paiements: filteredPaiements.map((p: any) => ({
        numeroRecu: p.numeroRecu || 'REC-' + p.id,
        eleveNom: p.eleve?.nom || p.eleveNom || '',
        elevePrenom: p.eleve?.prenom || p.elevePrenom || '',
        moisLibelle: p.mois?.libelle || p.moisLibelle || p.mois || '',
        motif: p.motif || '',
        montant: p.montant || 0,
        montantAttendu: p.montantAttendu,
        statut: p.statut || 'PAYE',
        typePaiement: p.typePaiement || 'ESPECES',
      })),
      depenses: filteredDepenses.map((d: any) => ({
        numeroDepense: d.numeroDepense || 'EXP-' + d.id,
        description: d.description || '',
        periode: d.periode || '',
        montant: d.montant || 0,
        date: new Date(d.dateDepense).toLocaleDateString('fr-FR'),
      })),
      nouvellesInscriptions: filteredInscriptions.map((i: any) => ({
        nom: i.eleveNom || '',
        prenom: i.elevePrenom || '',
        classe: i.classe || '',
      })),
      modificationsSysteme: [], // TODO: Fetch from API if available
    };

    // Generate PDF using the new function
    generateDailyReportPDF(reportData, 'daily');
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
      api.get('/inscriptions'),
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

    // Calculate totals
    const totalRecettes = filteredPaiements.reduce((sum: number, p: any) => sum + (p.montant || 0), 0);
    const totalDepenses = filteredDepenses.reduce((sum: number, d: any) => sum + (d.montant || 0), 0);
    const soldeNet = totalRecettes - totalDepenses;

    // Generate report ID
    const today = new Date();
    const reportId = `REF-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}-002`;

    // Format date for display
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    // Prepare DailyReportData (reusing the same interface)
    const reportData: DailyReportData = {
      dateRapport: formatDate(endDate),
      dateDebut: formatDate(startDate),
      dateFin: formatDate(endDate),
      reportId,
      totalRecettes,
      totalDepenses,
      soldeNet,
      paiements: filteredPaiements.map((p: any) => ({
        numeroRecu: p.numeroRecu || 'REC-' + p.id,
        eleveNom: p.eleve?.nom || p.eleveNom || '',
        elevePrenom: p.eleve?.prenom || p.elevePrenom || '',
        moisLibelle: p.mois?.libelle || p.moisLibelle || p.mois || '',
        motif: p.motif || '',
        montant: p.montant || 0,
        montantAttendu: p.montantAttendu,
        statut: p.statut || 'PAYE',
        typePaiement: p.typePaiement || 'ESPECES',
      })),
      depenses: filteredDepenses.map((d: any) => ({
        numeroDepense: d.numeroDepense || 'EXP-' + d.id,
        description: d.description || '',
        periode: d.periode || '',
        montant: d.montant || 0,
        date: new Date(d.dateDepense).toLocaleDateString('fr-FR'),
      })),
      nouvellesInscriptions: filteredInscriptions.map((i: any) => ({
        nom: i.eleveNom || '',
        prenom: i.elevePrenom || '',
        classe: i.classe || '',
      })),
      modificationsSysteme: [], // TODO: Fetch from API if available
    };

    // Generate PDF using the same function (we'll modify the title in the PDF)
    generateDailyReportPDF(reportData, 'weekly');
  } catch (error) {
    console.error('Error generating weekly report:', error);
    throw error;
  }
}

export async function generateMonthlyReport(startDate: string, endDate: string) {
  try {
    const [paiementsRes, depensesRes, inscriptionsRes] = await Promise.all([
      api.get('/paiements'),
      api.get('/depenses'),
      api.get('/inscriptions'),
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

    // Calculate totals
    const totalRecettes = filteredPaiements.reduce((sum: number, p: any) => sum + (p.montant || 0), 0);
    const totalDepenses = filteredDepenses.reduce((sum: number, d: any) => sum + (d.montant || 0), 0);
    const soldeNet = totalRecettes - totalDepenses;

    // Generate report ID
    const today = new Date();
    const reportId = `REF-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}-003`;

    // Format date for display
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    // Prepare DailyReportData (reusing the same interface)
    const reportData: DailyReportData = {
      dateRapport: formatDate(endDate),
      dateDebut: formatDate(startDate),
      dateFin: formatDate(endDate),
      reportId,
      totalRecettes,
      totalDepenses,
      soldeNet,
      paiements: filteredPaiements.map((p: any) => ({
        numeroRecu: p.numeroRecu || 'REC-' + p.id,
        eleveNom: p.eleve?.nom || p.eleveNom || '',
        elevePrenom: p.eleve?.prenom || p.elevePrenom || '',
        moisLibelle: p.mois?.libelle || p.moisLibelle || p.mois || '',
        motif: p.motif || '',
        montant: p.montant || 0,
        montantAttendu: p.montantAttendu,
        statut: p.statut || 'PAYE',
        typePaiement: p.typePaiement || 'ESPECES',
      })),
      depenses: filteredDepenses.map((d: any) => ({
        numeroDepense: d.numeroDepense || 'EXP-' + d.id,
        description: d.description || '',
        periode: d.periode || '',
        montant: d.montant || 0,
        date: new Date(d.dateDepense).toLocaleDateString('fr-FR'),
      })),
      nouvellesInscriptions: filteredInscriptions.map((i: any) => ({
        nom: i.eleveNom || '',
        prenom: i.elevePrenom || '',
        classe: i.classe || '',
      })),
      modificationsSysteme: [], // TODO: Fetch from API if available
    };

    // Generate PDF using the same function
    generateDailyReportPDF(reportData, 'monthly');
  } catch (error) {
    console.error('Error generating monthly report:', error);
    throw error;
  }
}

export function generateDailyReportPDF(data: DailyReportData, reportType: 'daily' | 'weekly' | 'monthly' = 'daily') {
  const doc = new jsPDF();
  const pageWidth = 210;
  const margin = 15;
  let currentY = margin;

  // Couleurs
  const primaryColor: [number, number, number] = [10, 110, 63]; // #0A6E3F - Vert Émeraude
  const lightGray: [number, number, number] = [229, 231, 235]; // #E5E7EB
  const statusPayeBg: [number, number, number] = [220, 252, 227]; // Vert clair
  const statusPayeText: [number, number, number] = [22, 101, 52]; // Vert foncé
  const statusPartielBg: [number, number, number] = [255, 245, 236]; // Orange/jaune clair
  const statusPartielText: [number, number, number] = [124, 45, 18]; // Orange/sombre

  // ── A. En-tête Principal (Header) ──
  try {
    doc.addImage(almanardLogo, 'JPEG', margin, currentY, 22, 22);
  } catch (error) {
    console.warn('Logo could not be loaded');
  }

  currentY += 5;

  doc.setFontSize(14);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');

  const reportTitle = reportType === 'daily' ? 'RAPPORT JOURNALIER D\'ACTIVITÉS ET FINANCIER' :
                      reportType === 'weekly' ? 'RAPPORT HEBDOMADAIRE D\'ACTIVITÉS ET FINANCIER' :
                      'RAPPORT MENSUEL D\'ACTIVITÉS ET FINANCIER';
  doc.text(reportTitle, pageWidth / 2, currentY + 8, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);
  doc.setFont('helvetica', 'normal');
  doc.text('GROUPE SCOLAIRE AL-MANAR D3S', pageWidth / 2, currentY + 15, { align: 'center' });

  currentY += 25;

  // Metadonnées du Rapport
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date du Rapport : ${data.dateRapport}`, margin, currentY);
  doc.text(`Période : ${data.dateDebut} - ${data.dateFin}`, margin, currentY + 5);
  doc.text(`Report ID : ${data.reportId}`, margin, currentY + 10);

  currentY += 18;

  // Ligne de séparation
  doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 10;

  // ── B. Section 1 : Résumé Financier du Jour (3 blocs) ──
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('RÉSUMÉ FINANCIER DU JOUR', margin, currentY);
  currentY += 8;

  const blockWidth = (pageWidth - 2 * margin - 10) / 3;
  const blockHeight = 30;

  // Bloc 1: Total Recettes
  doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, currentY, blockWidth, blockHeight, 3, 3, 'S');
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.setFont('helvetica', 'normal');
  doc.text('Total Recettes', margin + 5, currentY + 8);
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(formatMontant(data.totalRecettes), margin + 5, currentY + 20);

  // Bloc 2: Total Dépenses
  doc.roundedRect(margin + blockWidth + 5, currentY, blockWidth, blockHeight, 3, 3, 'S');
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.setFont('helvetica', 'normal');
  doc.text('Total Dépenses', margin + blockWidth + 10, currentY + 8);
  doc.setFontSize(12);
  doc.setTextColor(220, 38, 38);
  doc.setFont('helvetica', 'bold');
  doc.text(formatMontant(data.totalDepenses), margin + blockWidth + 10, currentY + 20);

  // Bloc 3: Solde Net
  doc.roundedRect(margin + 2 * (blockWidth + 5), currentY, blockWidth, blockHeight, 3, 3, 'S');
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.setFont('helvetica', 'normal');
  doc.text('Solde Net', margin + 2 * (blockWidth + 5) + 5, currentY + 8);
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(formatMontant(data.soldeNet), margin + 2 * (blockWidth + 5) + 5, currentY + 20);

  currentY += blockHeight + 15;

  // ── C. Section 2 : Détails des Paiements Reçus (Tableau Principal) ──
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('DÉTAILS DES PAIEMENTS REÇUS', margin, currentY);
  currentY += 8;

  const paiementTableData = data.paiements.map((p) => {
    const montantCell = p.statut === 'PARTIEL' && p.montantAttendu
      ? `rec recd: ${formatMontant(p.montant)}\ntotal due: ${formatMontant(p.montantAttendu)}`
      : formatMontant(p.montant);

    const statutBadge = p.statut === 'PARTIEL' ? 'PARTIEL' : 'PAYE';

    return [
      p.numeroRecu,
      `${p.elevePrenom} ${p.eleveNom}`,
      p.moisLibelle || '—',
      p.motif,
      montantCell,
      p.typePaiement,
      statutBadge,
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [['# Reçu', 'Élève', 'Période/Mois', 'Motif', 'Montant (FCFA)', 'Moyen', 'Statut']],
    body: paiementTableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor as any,
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 8,
    },
    bodyStyles: {
      textColor: [55, 65, 81],
      fontSize: 7,
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 35 },
      2: { cellWidth: 20 },
      3: { cellWidth: 20 },
      4: { cellWidth: 35 },
      5: { cellWidth: 25 },
      6: { cellWidth: 20 },
    },
    didDrawCell: (data) => {
      if (data.section === 'body' && data.column.index === 6) {
        const statut = data.cell.raw;
        if (statut === 'PARTIEL') {
          doc.setFillColor(statusPartielBg[0], statusPartielBg[1], statusPartielBg[2]);
          doc.setTextColor(statusPartielText[0], statusPartielText[1], statusPartielText[2]);
          doc.roundedRect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 2, 2, 'F');
        } else if (statut === 'PAYE') {
          doc.setFillColor(statusPayeBg[0], statusPayeBg[1], statusPayeBg[2]);
          doc.setTextColor(statusPayeText[0], statusPayeText[1], statusPayeText[2]);
          doc.roundedRect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 2, 2, 'F');
        }
      }
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // ── D. Section 3 : Détails des Dépenses Effectuées (Tableau Secondaire) ──
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('DÉTAILS DES DÉPENSES EFFECTUÉES', margin, currentY);
  currentY += 8;

  const depenseTableData = data.depenses.map((d) => [
    d.numeroDepense,
    d.description,
    d.periode || '—',
    formatMontant(d.montant),
    d.date,
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['# Dépense', 'Description', 'Période', 'Montant (FCFA)', 'Date']],
    body: depenseTableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor as any,
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 8,
    },
    bodyStyles: {
      textColor: [55, 65, 81],
      fontSize: 7,
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 50 },
      2: { cellWidth: 25 },
      3: { cellWidth: 35 },
      4: { cellWidth: 25 },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // ── E. Section 4 : Nouvelles Inscriptions & Modifications Système ──
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('NOUVELLES INSCRIPTIONS & MODIFICATIONS SYSTÈME', margin, currentY);
  currentY += 8;

  const columnWidth = (pageWidth - 2 * margin - 10) / 2;

  // Colonne Gauche: Nouvelles Inscriptions
  doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, currentY, columnWidth, 40, 3, 3, 'S');

  doc.setFontSize(8);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Nouvelles Inscriptions', margin + 5, currentY + 8);

  doc.setFontSize(7);
  doc.setTextColor(55, 65, 81);
  doc.setFont('helvetica', 'normal');
  let inscriptionY = currentY + 15;
  data.nouvellesInscriptions.forEach((inscr) => {
    if (inscriptionY < currentY + 35) {
      doc.text(`${inscr.prenom} ${inscr.nom} - ${inscr.classe}`, margin + 5, inscriptionY);
      inscriptionY += 5;
    }
  });

  if (data.nouvellesInscriptions.length === 0) {
    doc.text('Aucune nouvelle inscription aujourd\'hui', margin + 5, inscriptionY);
  }

  // Colonne Droite: Modifications Utilisateur
  doc.roundedRect(margin + columnWidth + 10, currentY, columnWidth, 40, 3, 3, 'S');

  doc.setFontSize(8);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Modifications Utilisateur', margin + columnWidth + 15, currentY + 8);

  doc.setFontSize(7);
  doc.setTextColor(55, 65, 81);
  doc.setFont('helvetica', 'normal');
  let modificationY = currentY + 15;
  data.modificationsSysteme.forEach((mod) => {
    if (modificationY < currentY + 35) {
      doc.text(`${mod.utilisateur}: ${mod.action}`, margin + columnWidth + 15, modificationY);
      modificationY += 5;
    }
  });

  if (data.modificationsSysteme.length === 0) {
    doc.text('Aucune modification système aujourd\'hui', margin + columnWidth + 15, modificationY);
  }

  currentY += 50;

  // ── F. Pied de Page (Footer & Signatures) ──
  // Bloc de Validation
  const signatureBlockWidth = (pageWidth - 2 * margin - 10) / 2;
  const signatureBlockHeight = 30;

  doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, currentY, signatureBlockWidth, signatureBlockHeight, 3, 3, 'S');
  doc.roundedRect(margin + signatureBlockWidth + 10, currentY, signatureBlockWidth, signatureBlockHeight, 3, 3, 'S');

  doc.setFontSize(9);
  doc.setTextColor(55, 65, 81);
  doc.setFont('helvetica', 'normal');
  doc.text('Signé & Tamponné (Direction)', margin + 5, currentY + 15);
  doc.text('Signé & Tamponné (Comptable)', margin + signatureBlockWidth + 15, currentY + 15);

  currentY += signatureBlockHeight + 10;

  // Bandeau de Contact Inférieur
  doc.setFillColor(243, 244, 246);
  doc.rect(margin, currentY, pageWidth - 2 * margin, 15, 'F');

  doc.setFontSize(8);
  doc.setTextColor(55, 65, 81);
  doc.setFont('helvetica', 'normal');
  doc.text('Tel : +221 78 120 89 78 | +221 77 520 87 67', pageWidth / 2, currentY + 6, { align: 'center' });
  doc.text('Email : info@almanard3s.com | www.almanard3s.com', pageWidth / 2, currentY + 12, { align: 'center' });

  // Dynamically name the file based on report type and period
  const formatDateForFilename = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
      .replace(/ /g, '_')
      .toLowerCase();
  };

  let filename = '';
  if (reportType === 'daily') {
    filename = `rapport_journalier_${formatDateForFilename(data.dateRapport)}.pdf`;
  } else if (reportType === 'weekly') {
    filename = `rapport_hebdomadaire_${formatDateForFilename(data.dateDebut)}_au_${formatDateForFilename(data.dateFin)}.pdf`;
  } else {
    filename = `rapport_mensuel_${formatDateForFilename(data.dateRapport)}.pdf`;
  }

  // Sauvegarde du PDF
  doc.save(filename);
}