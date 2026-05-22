import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import type { Paiement } from '../Types/index';
import almanardLogo from '../assets/almanard.jpeg';

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
  
  // 1. Header - Logo and school name
  // Add logo
  try {
    doc.addImage(almanardLogo, 'JPEG', 20, 10, 30, 30);
  } catch (error) {
    // If logo fails to load, continue without it
    console.warn('Logo could not be loaded');
  }
  
  doc.setFontSize(16);
  doc.setTextColor(26, 92, 56); // Dark green
  doc.setFont('helvetica', 'bold');
  doc.text('GROUPE SCOLAIRE AL-MANARD3S', 105, 25, { align: 'center' });
  
  // 2. Visual banner - Green line
  doc.setDrawColor(26, 92, 56);
  doc.setLineWidth(1);
  doc.line(20, 40, 190, 40);
  
  // 3. Receipt title with number
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text(`REÇU DE PAIEMENT N°: ${data.numeroRecu}`, 105, 45, { align: 'center' });
  
  // 4. Student information block with light green background
  const studentInfoY = 55;
  doc.setFillColor(220, 252, 231); // Light green background
  doc.roundedRect(20, studentInfoY, 170, 35, 3, 3, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 92, 56);
  doc.text('INFORMATIONS SUR L\'ÉLÈVE', 25, studentInfoY + 8);
  
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
  
  // 5. Payment details block
  const paymentDetailsY = studentInfoY + 45;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 92, 56);
  doc.text('DÉTAILS DU PAIEMENT', 20, paymentDetailsY);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(55, 65, 81);
  
  const dateObj = new Date(data.datePaiement);
  const formattedDate = dateObj.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  doc.text(`Date de l'opération: ${formattedDate}`, 20, paymentDetailsY + 10);
  
  let motifText = data.motif;
  if (data.moisLibelle) {
    motifText += ` - Mois de ${data.moisLibelle}`;
  }
  doc.text(`Type / Motif: ${motifText}`, 20, paymentDetailsY + 18);
  
  // 6. Payment table
  const tableY = paymentDetailsY + 30;
  let description = 'Paiement';
  if (data.typePaiement) {
    const typeLabels: Record<string, string> = {
      'ESPECE': 'Espèce',
      'WAVE': 'Wave',
      'CHEQUE': 'Chèque',
      'ORANGE_MONEY': 'Orange Money'
    };
    description = `Paiement via ${typeLabels[data.typePaiement] || data.typePaiement}`;
    if (data.typePaiement === 'WAVE' || data.typePaiement === 'ORANGE_MONEY') {
      description += ' - Transfert Mobile';
    }
  }
  
  const tableData = [
    [description, `${data.montant.toLocaleString()} FCFA`]
  ];
  
  let tableFinalY = tableY;
  
  autoTable(doc, {
    startY: tableY,
    head: [['Description', 'Montant (FCFA)']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 157, 88], // Green primary (#0f9d58)
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 11,
    },
    bodyStyles: {
      textColor: [55, 65, 81],
      halign: 'center',
      fontSize: 10,
    },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 50 },
    },
    didDrawPage: (hookData) => {
      // Add total row
      tableFinalY = hookData.table?.finalY || tableY + 20;
      doc.setDrawColor(26, 92, 56);
      doc.setLineWidth(0.5);
      doc.line(20, tableFinalY + 5, 190, tableFinalY + 5);
      doc.line(20, tableFinalY + 7, 190, tableFinalY + 7);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 92, 56);
      doc.text('MONTANT TOTAL PAYÉ', 20, tableFinalY + 15);
      doc.text(`${data.montant.toLocaleString()} FCFA`, 190, tableFinalY + 15, { align: 'right' });
    },
  });
  
  // 7. Digital traceability block (for mobile payments)
  if (data.typePaiement === 'WAVE' || data.typePaiement === 'ORANGE_MONEY') {
    const traceabilityY = tableFinalY + 25;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 92, 56);
    doc.text('TRAÇABILITÉ NUMÉRIQUE', 20, traceabilityY + 15);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(55, 65, 81);
    
    const typeLabels: Record<string, string> = {
      'WAVE': 'Wave',
      'ORANGE_MONEY': 'Orange Money'
    };
    
    doc.text(`Moyen de Paiement: ${typeLabels[data.typePaiement!] || data.typePaiement}`, 20, traceabilityY + 25);
    
    if (data.telephone) {
      doc.text(`Numéro Associé: ${data.telephone}`, 20, traceabilityY + 33);
    }
    
    if (data.referenceTransaction) {
      doc.text(`Référence de Transaction: ${data.referenceTransaction}`, 20, traceabilityY + 41);
    }
    
    const justificatifText = data.captureJustificatif 
      ? '✓ Capture d\'écran jointe au dossier' 
      : '⚠ Capture d\'écran non jointe';
    doc.setFontSize(9);
    if (data.captureJustificatif) {
      doc.setTextColor(15, 157, 88);
    } else {
      doc.setTextColor(239, 68, 68);
    }
    doc.text(justificatifText, 20, traceabilityY + 49);
  }
  
  // 8. Footer - Signature and stamp
  const footerY = doc.internal.pageSize.height - 50;
  
  // Signature box
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(140, footerY, 40, 25);
  
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text('Signature', 160, footerY + 15, { align: 'center' });
  doc.text('Cachet', 160, footerY + 22, { align: 'center' });
  
  // Footer line
  doc.setDrawColor(229, 231, 235);
  doc.line(20, footerY + 35, 190, footerY + 35);
  
  // Contact info
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text('GROUPE SCOLAIRE AL-MANARD3S', 105, footerY + 42, { align: 'center' });
  doc.text('Tél: +221 XX XX XX XX | Email: contact@almanard3s.edu | www.almanard3s.edu', 105, footerY + 48, { align: 'center' });

  doc.save(`recu_${data.numeroRecu}.pdf`);
}

export function generatePaymentListReport(paiements: Paiement[], title: string = 'Rapport des Paiements') {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.setTextColor(26, 92, 56);
  doc.text(title, 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, 28, { align: 'center' });
  
  doc.text(`Total: ${paiements.length} paiement(s)`, 105, 34, { align: 'center' });
  
  // Line separator
  doc.setDrawColor(229, 231, 235);
  doc.line(20, 40, 190, 40);
  
  // Table
  const tableData = paiements.map(p => [
    p.numeroRecu,
    `${p.eleveNom} ${p.elevePrenom}`,
    p.motif,
    p.moisLibelle || '—',
    `${p.montant.toLocaleString()} FCFA`,
    new Date(p.datePaiement).toLocaleDateString('fr-FR'),
  ]);
  
  const totalMontant = paiements.reduce((sum, p) => sum + p.montant, 0);
  
  autoTable(doc, {
    startY: 50,
    head: [['N° Reçu', 'Élève', 'Motif', 'Mois', 'Montant', 'Date']],
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
    styles: {
      overflow: 'linebreak',
    },
    didDrawPage: (data) => {
      // Add total at the bottom of each page
      const finalY = data.cursor?.y || data.table.finalY;
      doc.setFontSize(10);
      doc.setTextColor(26, 92, 56);
      doc.setFont(undefined, 'bold');
      doc.text(
        `Total: ${totalMontant.toLocaleString()} FCFA`,
        190,
        finalY + 10,
        { align: 'right' }
      );
    },
  });
  
  // Footer
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
  // Prepare data for Excel
  const excelData = paiements.map(p => ({
    'Numéro de Reçu': p.numeroRecu,
    'Élève': `${p.eleveNom} ${p.elevePrenom}`,
    'Motif': p.motif,
    'Mois': p.moisLibelle || '—',
    'Montant (FCFA)': p.montant,
    'Date de Paiement': new Date(p.datePaiement).toLocaleDateString('fr-FR'),
    'Enregistré par': p.enregistreParNom || '—',
  }));
  
  // Calculate totals
  const totalMontant = paiements.reduce((sum, p) => sum + p.montant, 0);
  
  // Add summary row
  excelData.push({
    'Numéro de Reçu': 'TOTAL',
    'Élève': '' as string,
    'Motif': '' as any,
    'Mois': '',
    'Montant (FCFA)': totalMontant,
    'Date de Paiement': '',
    'Enregistré par': '',
  });
  
  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(excelData);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 20 }, // Numéro de Reçu
    { wch: 30 }, // Élève
    { wch: 15 }, // Motif
    { wch: 15 }, // Mois
    { wch: 18 }, // Montant
    { wch: 18 }, // Date
    { wch: 20 }, // Enregistré par
  ];
  
  // Style header row
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
  
  // Style total row
  const totalRowIndex = excelData.length;
  for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
    const address = XLSX.utils.encode_col(C) + totalRowIndex;
    if (!ws[address]) continue;
    ws[address].s = {
      fill: { fgColor: { rgb: 'DCFE7' } },
      font: { bold: true, color: { rgb: '166534' } },
    };
  }
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Paiements');
  
  // Generate and save
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
}
