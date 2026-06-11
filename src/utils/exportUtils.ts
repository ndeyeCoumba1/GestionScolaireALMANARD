import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import QRCode from 'qrcode';
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
  eleveNomArabe?: string;
  elevePrenomArabe?: string;
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

export async function generateReceipt(data: ReceiptData) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const H = 297;
  const M = 15;

  const GREEN:   [number,number,number] = [10, 110, 63];
  const GREEN_D: [number,number,number] = [8, 85, 48];
  const GRAY:    [number,number,number] = [55, 65, 81];
  const GRAY_L:  [number,number,number] = [107, 114, 128];
  const BORDER:  [number,number,number] = [209, 213, 219];
  const RED:     [number,number,number] = [220, 38, 38];
  const ORANGE:  [number,number,number] = [217, 119, 6];
  const WHITE:   [number,number,number] = [255, 255, 255];
  const BLACK:   [number,number,number] = [17, 24, 39];

  const montantAttendu = data.montantAttendu || data.montant;
  const resteAPayer    = Math.max(0, montantAttendu - data.montant);
  const isPartiel      = data.statut === 'PARTIEL' || (!!data.montantAttendu && data.montant < data.montantAttendu);
  const tauxPaiement   = montantAttendu > 0 ? Math.min(100, Math.round((data.montant / montantAttendu) * 100)) : 100;

  const fmtDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }); }
    catch { return d; }
  };
  const MOTIF_LABELS: Record<string,string> = { INSCRIPTION:'Inscription', MENSUALITE:'Mensualité', REMBOURSEMENT:'Remboursement' };
  const TYPE_LABELS:  Record<string,string> = { ESPECES:'Espèces', WAVE:'Wave', CHEQUE:'Chèque', ORANGE_MONEY:'Orange Money' };

  // Code de verification 6 chars
  const verificationCode = (() => {
    const raw = `${data.numeroRecu}-${data.montant}-${data.datePaiement}`;
    let h = 0;
    for (let i = 0; i < raw.length; i++) { h = (Math.imul(31, h) + raw.charCodeAt(i)) | 0; }
    return Math.abs(h).toString(16).toUpperCase().padStart(6, '0').slice(0, 6);
  })();

  // QR Code (black, high quality)
  const qrContent = `${data.numeroRecu}|${data.montant}FCFA|${data.eleveNom} ${data.elevePrenom}|${data.datePaiement}|${verificationCode}`;
  let qrBase64 = '';
  try {
    const dataUrl = await QRCode.toDataURL(qrContent, {
      width: 200, margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#000000', light: '#FFFFFF' },
    });
    qrBase64 = dataUrl.split(',')[1] ?? '';
  } catch {}

  // ══════════════════════════════════════
  // HEADER (fond blanc)
  // ══════════════════════════════════════
  try { doc.addImage(almanardLogo, 'JPEG', M, 8, 26, 26); } catch {}

  doc.setTextColor(...GREEN);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('AL-MANARD3S', M + 32, 17);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY);
  doc.text('FONDATION DAROUL MANAR D3S — TIVAOUANE, SENEGAL', M + 32, 23);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...GRAY_L);
  doc.text('+221 78 120 89 78 / +221 77 520 87 67', M + 32, 28.5);
  doc.text('info@almanard3s.com', M + 32, 33);
  doc.text('www.almanard3s.com', M + 32, 37.5);

  // N° RECU box (haut droite)
  const bW = 55; const bX = W - M - bW;
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.5);
  doc.roundedRect(bX, 8, bW, 26, 3, 3, 'D');
  doc.setTextColor(...GRAY_L);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('N° RECU', bX + bW / 2, 15, { align: 'center' });
  doc.setFillColor(...GREEN);
  doc.roundedRect(bX + 4, 17, bW - 8, 13, 2, 2, 'F');
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  // Truncate if too long
  const recuDisplay = data.numeroRecu.length > 18 ? data.numeroRecu.slice(-18) : data.numeroRecu;
  doc.text(recuDisplay, bX + bW / 2, 25.5, { align: 'center' });

  // Ligne séparatrice
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.5);
  doc.line(M, 44, W - M, 44);

  // ══════════════════════════════════════
  // TITRE
  // ══════════════════════════════════════
  doc.setTextColor(...BLACK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.text('REÇU DE PAIEMENT', W / 2, 56, { align: 'center' });

  // ══════════════════════════════════════
  // BLOC MONTANT (2 zones séparées par ligne verticale)
  // ══════════════════════════════════════
  const amtY = 62; const amtH = 28;
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.5);
  doc.roundedRect(M, amtY, W - 2 * M, amtH, 4, 4, 'D');

  // Gauche : montant
  doc.setTextColor(...GREEN);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('MONTANT VERSÉ', M + 18, amtY + 8);

  doc.setTextColor(...BLACK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text(formatMontant(data.montant), M + 8, amtY + 22);

  // Ligne verticale séparatrice
  const midX = W / 2 + 2;
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.4);
  doc.line(midX, amtY + 4, midX, amtY + amtH - 4);

  // Droite : statut
  const statusColor: [number,number,number] = isPartiel ? ORANGE : GREEN;
  const statusLabel = isPartiel ? 'PARTIEL' : 'PAYÉ';
  const statusMsg   = isPartiel
    ? `Reste à payer : ${formatMontant(resteAPayer)}`
    : 'Paiement effectué en totalité';

  const pillX = midX + 10; const pillW = 48;
  doc.setFillColor(...statusColor);
  doc.roundedRect(pillX, amtY + 7, pillW, 10, 5, 5, 'F');
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(statusLabel, pillX + pillW / 2, amtY + 13.5, { align: 'center' });

  doc.setTextColor(...GRAY_L);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(statusMsg, pillX + pillW / 2, amtY + 22, { align: 'center' });

  // ══════════════════════════════════════
  // CARTES INFOS (2 colonnes)
  // ══════════════════════════════════════
  const infoY = amtY + amtH + 7;
  const colW  = (W - 2 * M - 5) / 2;
  const infoH = 50;

  const drawInfoCard = (
    cx: number,
    title: string,
    hdrColor: [number,number,number],
    rows: [string, string][],
  ) => {
    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.4);
    doc.roundedRect(cx, infoY, colW, infoH, 4, 4, 'FD');

    // Titre section
    doc.setTextColor(...hdrColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(title, cx + 6, infoY + 9);

    // Séparateur
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.3);
    doc.line(cx + 4, infoY + 13, cx + colW - 4, infoY + 13);

    rows.forEach(([lbl, val], i) => {
      const ry = infoY + 21 + i * 8;
      doc.setTextColor(...GRAY_L);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text(lbl + ' :', cx + 6, ry);
      doc.setTextColor(...GRAY);
      doc.setFont('helvetica', 'bold');
      const maxVal = val.length > 20 ? val.slice(0, 19) + '...' : val;
      doc.text(maxVal, cx + colW - 4, ry, { align: 'right' });
    });
  };

  const motifLabel = MOTIF_LABELS[data.motif] || data.motif;
  const typeLabel  = TYPE_LABELS[data.typePaiement || ''] || (data.typePaiement || '—');

  drawInfoCard(M, 'INFORMATIONS ÉLÈVE', GREEN, [
    ['Nom complet',    `${data.elevePrenom} ${data.eleveNom}`],
    ['Classe',          data.classe        || '—'],
    ['Matricule',       data.matricule     || '—'],
    ['Année scolaire', data.anneeScolaire  || '—'],
  ]);

  drawInfoCard(M + colW + 5, 'DÉTAILS DU PAIEMENT', GREEN, [
    ['Date',              fmtDate(data.datePaiement)],
    ['Motif',             motifLabel + (data.moisLibelle ? ` — ${data.moisLibelle}` : '')],
    ['Moyen de paiement', typeLabel],
    ['Référence',         data.numeroRecu],
  ]);

  // ══════════════════════════════════════
  // RÉCAPITULATIF
  // ══════════════════════════════════════
  const recapY = infoY + infoH + 7;

  doc.setTextColor(...GREEN);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('RÉCAPITULATIF', M + 4, recapY + 6);

  const tableRows: [string, string][] = [
    ['Montant attendu', formatMontant(montantAttendu)],
    ['Montant versé', formatMontant(data.montant)],
    ['Reste à payer', formatMontant(resteAPayer)],
  ];
  const colTotal = W - 2 * M;

  autoTable(doc, {
    startY: recapY + 10,
    head: [['DESCRIPTION', 'MONTANT']],
    body: tableRows,
    theme: 'plain',
    headStyles: {
      fillColor: GREEN_D,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 7.5,
      cellPadding: { top: 3, bottom: 3, left: 5, right: 5 },
    },
    bodyStyles: {
      textColor: GRAY,
      fontSize: 8,
      cellPadding: { top: 3, bottom: 3, left: 5, right: 5 },
    },
    columnStyles: {
      0: { cellWidth: colTotal * 0.62, halign: 'left' },
      1: { cellWidth: colTotal * 0.38, halign: 'right' },
    },
    didDrawCell: (d) => {
      if (d.section === 'body') {
        doc.setDrawColor(...BORDER);
        doc.setLineWidth(0.3);
        doc.line(d.cell.x, d.cell.y + d.cell.height, d.cell.x + d.cell.width, d.cell.y + d.cell.height);
        const raw = d.row.raw as any;
        if (raw[0] === 'Reste à payer') {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...(resteAPayer > 0 ? RED : GREEN));
        } else if (raw[0] === 'Montant versé' && d.column.index === 1) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...GREEN);
        }
      }
    },
  });

  const afterRecap = (doc as any).lastAutoTable.finalY;

  // ══════════════════════════════════════
  // BARRE PROGRESSION (partiel seulement)
  // ══════════════════════════════════════
  let sigStartY = afterRecap + 6;
  if (isPartiel) {
    doc.setFillColor(255, 251, 235);
    doc.setDrawColor(253, 230, 138);
    doc.setLineWidth(0.4);
    doc.roundedRect(M, sigStartY, W - 2 * M, 15, 3, 3, 'FD');
    doc.setTextColor(...ORANGE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(`Paiement partiel — ${tauxPaiement}% réglé — Reste : ${formatMontant(resteAPayer)}`, M + 6, sigStartY + 6);
    doc.setFillColor(229, 231, 235);
    doc.roundedRect(M + 6, sigStartY + 9, W - 2 * M - 12, 4, 2, 2, 'F');
    doc.setFillColor(...ORANGE);
    const bw = Math.max(4, (W - 2 * M - 12) * tauxPaiement / 100);
    doc.roundedRect(M + 6, sigStartY + 9, bw, 4, 2, 2, 'F');
    sigStartY += 20;
  }

  // ══════════════════════════════════════
  // SIGNATURES + QR (3 colonnes)
  // ══════════════════════════════════════
  const sigH  = 40;
  const c3W   = (W - 2 * M - 8) / 3;
  const sigY  = Math.max(sigStartY, H - 30 - sigH - 6);

  // Col 1 : Signature du Payeur
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.4);
  doc.roundedRect(M, sigY, c3W, sigH, 3, 3, 'D');
  doc.setTextColor(...GREEN);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('SIGNATURE DU PAYEUR', M + c3W / 2, sigY + 7, { align: 'center' });
  doc.setDrawColor(...GRAY_L);
  doc.setLineWidth(0.3);
  doc.line(M + 6, sigY + sigH - 8, M + c3W - 6, sigY + sigH - 8);

  // Col 2 : Cachet & Signature École
  const col2X = M + c3W + 4;
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.4);
  doc.roundedRect(col2X, sigY, c3W, sigH, 3, 3, 'D');
  doc.setTextColor(...GREEN);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('CACHET & SIGNATURE (ÉCOLE)', col2X + c3W / 2, sigY + 7, { align: 'center' });
  doc.setDrawColor(...GRAY_L);
  doc.setLineWidth(0.3);
  doc.line(col2X + 6, sigY + sigH - 8, col2X + c3W - 6, sigY + sigH - 8);

  // Col 3 : Document Officiel + QR
  const col3X = M + 2 * (c3W + 4);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.4);
  doc.roundedRect(col3X, sigY, c3W, sigH, 3, 3, 'FD');

  // En-tête vert
  doc.setFillColor(...GREEN);
  doc.roundedRect(col3X, sigY, c3W, 8, 3, 3, 'F');
  doc.rect(col3X, sigY + 4, c3W, 4, 'F');
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.text('DOCUMENT OFFICIEL', col3X + c3W / 2, sigY + 5.5, { align: 'center' });

  // QR code
  const qrSize = 18;
  const qrX    = col3X + (c3W - qrSize) / 2;
  const qrImgY = sigY + 10;
  if (qrBase64) {
    try { doc.addImage(qrBase64, 'PNG', qrX, qrImgY, qrSize, qrSize); } catch {}
  }

  // Code de vérification
  const codeBoxY = sigY + sigH - 12;
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.4);
  doc.roundedRect(col3X + 4, codeBoxY, c3W - 8, 9, 2, 2, 'D');
  doc.setTextColor(...GRAY_L);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5);
  doc.text('Code de vérification', col3X + c3W / 2, codeBoxY + 3.5, { align: 'center' });
  doc.setTextColor(...GREEN);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(verificationCode, col3X + c3W / 2, codeBoxY + 8, { align: 'center' });

  // ══════════════════════════════════════
  // FOOTER
  // ══════════════════════════════════════
  const now = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' } as any);
  const fY = H - 22;
  doc.setFillColor(...GREEN_D);
  doc.rect(0, fY, W, 22, 'F');

  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('GROUPE SCOLAIRE AL-MANAR D3S', W / 2, fY + 7, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(200, 240, 210);
  doc.text('+221 78 120 89 78 / +221 77 520 87 67   |   info@almanard3s.com   |   www.almanard3s.com', W / 2, fY + 13, { align: 'center' });

  doc.setDrawColor(255, 255, 255);
  doc.setGState(new (doc as any).GState({ opacity: 0.2 }));
  doc.setLineWidth(0.3);
  doc.line(M, fY + 15, W - M, fY + 15);
  doc.setGState(new (doc as any).GState({ opacity: 1 }));

  doc.setFontSize(6);
  doc.setTextColor(180, 220, 190);
  doc.text(`Généré le : ${now}   |   Ce reçu est un document officiel.`, W / 2, fY + 19, { align: 'center' });

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
      const finalY = data.cursor?.y ?? data.table.finalY ?? 0;
      doc.setFontSize(10);
      doc.setTextColor(26, 92, 56);
      doc.setFont('helvetica', 'bold');
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
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const H = 297;
  const M = 15;

  const GREEN:    [number,number,number] = [10, 110, 63];
  const GREEN_D:  [number,number,number] = [8, 85, 48];
  const GREEN_L:  [number,number,number] = [240, 253, 244];
  const RED:      [number,number,number] = [220, 38, 38];
  const RED_D:    [number,number,number] = [140, 20, 20];
  const RED_L:    [number,number,number] = [254, 242, 242];
  const BLUE:     [number,number,number] = [37, 99, 235];
  const BLUE_L:   [number,number,number] = [239, 246, 255];
  const ORANGE:   [number,number,number] = [194, 65, 12];
  const PURPLE:   [number,number,number] = [126, 34, 206];
  const GRAY:     [number,number,number] = [55, 65, 81];
  const GRAY_L:   [number,number,number] = [107, 114, 128];
  const BORDER:   [number,number,number] = [209, 213, 219];
  const WHITE:    [number,number,number] = [255, 255, 255];
  const BLACK:    [number,number,number] = [17, 24, 39];
  const BG:       [number,number,number] = [248, 250, 252];

  const now = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  } as any);

  const typeLabel = reportType === 'daily'  ? 'JOURNALIER'
                 : reportType === 'weekly' ? 'HEBDOMADAIRE'
                 : 'MENSUEL';

  // ── Stats calculées ──
  const elevesPayants = new Set(data.paiements.map(p => `${p.elevePrenom}|${p.eleveNom}`)).size;
  const paiementsPartiels = data.paiements.filter(p => p.statut === 'PARTIEL').length;

  const moisCount: Record<string, number> = {};
  data.paiements.forEach(p => {
    if (p.moisLibelle) moisCount[p.moisLibelle] = (moisCount[p.moisLibelle] || 0) + 1;
  });
  const topMois = Object.entries(moisCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  const METHOD_LABELS: Record<string, string> = {
    ESPECES: 'Especes', WAVE: 'Wave', CHEQUE: 'Cheque', ORANGE_MONEY: 'Orange Money',
  };
  const METHOD_COLORS: Record<string, [number,number,number]> = {
    ESPECES: GREEN, WAVE: BLUE, ORANGE_MONEY: [217, 119, 6], CHEQUE: PURPLE,
  };
  const methodCount: Record<string, number> = {};
  data.paiements.forEach(p => {
    methodCount[p.typePaiement] = (methodCount[p.typePaiement] || 0) + 1;
  });
  const methodEntries = Object.entries(methodCount).sort((a, b) => b[1] - a[1]);
  const totalPmts = data.paiements.length;

  // ══════════════════════════════════════════════════════════════════
  // HEADER
  // ══════════════════════════════════════════════════════════════════
  try { doc.addImage(almanardLogo, 'JPEG', M, 8, 26, 26); } catch {}

  doc.setTextColor(...GREEN);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('AL-MANARD3S', M + 32, 17);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY);
  doc.text('FONDATION DAROUL MANAR D3S — TIVAOUANE, SENEGAL', M + 32, 23);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...GRAY_L);
  doc.text('+221 78 120 89 78 / +221 77 520 87 67', M + 32, 28.5);
  doc.text('info@almanard3s.com   |   www.almanard3s.com', M + 32, 33);

  const bW = 55; const bX = W - M - bW;
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.5);
  doc.roundedRect(bX, 8, bW, 26, 3, 3, 'D');
  doc.setTextColor(...GRAY_L);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('N° RAPPORT', bX + bW / 2, 15, { align: 'center' });
  doc.setFillColor(...GREEN);
  doc.roundedRect(bX + 4, 17, bW - 8, 13, 2, 2, 'F');
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text(data.reportId, bX + bW / 2, 25.5, { align: 'center' });

  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.5);
  doc.line(M, 42, W - M, 42);

  // ══════════════════════════════════════════════════════════════════
  // TITRE
  // ══════════════════════════════════════════════════════════════════
  doc.setTextColor(...BLACK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('RAPPORT DES PAIEMENTS ET DES DEPENSES', W / 2, 52, { align: 'center' });
  doc.setTextColor(...GRAY_L);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Rapport ${typeLabel}   |   Periode : ${data.dateDebut} - ${data.dateFin}`, W / 2, 59, { align: 'center' });

  // ══════════════════════════════════════════════════════════════════
  // CARTES KPI (3 colonnes)
  // ══════════════════════════════════════════════════════════════════
  const kpiY = 65;
  const kpiH = 32;
  const kpiW = (W - 2 * M - 8) / 3;

  const drawKpi = (
    x: number, label: string, montant: number,
    bgColor: [number,number,number], barColor: [number,number,number], textColor: [number,number,number],
  ) => {
    doc.setFillColor(...bgColor);
    doc.setDrawColor(...barColor);
    doc.setLineWidth(0.6);
    doc.roundedRect(x, kpiY, kpiW, kpiH, 3, 3, 'FD');
    doc.setFillColor(...barColor);
    doc.roundedRect(x, kpiY, kpiW, 4, 2, 2, 'F');
    doc.setTextColor(...GRAY_L);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text(label, x + kpiW / 2, kpiY + 13, { align: 'center' });
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(formatMontant(montant), kpiW - 6);
    doc.text(lines[0], x + kpiW / 2, kpiY + 24, { align: 'center' });
    if (lines[1]) {
      doc.setFontSize(8);
      doc.text(lines[1], x + kpiW / 2, kpiY + 30, { align: 'center' });
    }
  };

  const soldeColor: [number,number,number] = data.soldeNet >= 0 ? BLUE : RED;
  const soldeBg:    [number,number,number] = data.soldeNet >= 0 ? BLUE_L : RED_L;
  drawKpi(M,                  'TOTAL RECETTES', data.totalRecettes, GREEN_L, GREEN,      GREEN);
  drawKpi(M + kpiW + 4,       'TOTAL DEPENSES', data.totalDepenses, RED_L,   RED,        RED);
  drawKpi(M + 2 * (kpiW + 4), 'SOLDE NET',      data.soldeNet,      soldeBg, soldeColor, soldeColor);

  let curY = kpiY + kpiH + 8;

  // ══════════════════════════════════════════════════════════════════
  // STATS (4 mini-cards)
  // ══════════════════════════════════════════════════════════════════
  const statH = 20;
  const statW = (W - 2 * M - 9) / 4;

  const drawStat = (x: number, label: string, value: string, color: [number,number,number]) => {
    doc.setFillColor(...BG);
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.4);
    doc.roundedRect(x, curY, statW, statH, 2, 2, 'FD');
    doc.setFillColor(...color);
    doc.rect(x, curY, 3, statH, 'F');
    doc.setTextColor(...color);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(value, x + statW / 2 + 1.5, curY + 11, { align: 'center' });
    doc.setTextColor(...GRAY_L);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.text(label, x + statW / 2 + 1.5, curY + 17, { align: 'center' });
  };

  drawStat(M,                     'ELEVES PAYANTS',     String(elevesPayants),      GREEN);
  drawStat(M + statW + 3,         'PMTS PARTIELS',      String(paiementsPartiels),  ORANGE);
  drawStat(M + 2 * (statW + 3),   'TOP MOIS',           topMois.slice(0, 10),       BLUE);
  drawStat(M + 3 * (statW + 3),   'TRANSACTIONS',       String(totalPmts),          GRAY);

  curY += statH + 8;

  // ══════════════════════════════════════════════════════════════════
  // RÉPARTITION DES MOYENS DE PAIEMENT (barres horizontales)
  // ══════════════════════════════════════════════════════════════════
  if (methodEntries.length > 0) {
    doc.setFillColor(...BG);
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.4);
    const chartH = 8 + methodEntries.length * 8 + 4;
    doc.roundedRect(M, curY, W - 2 * M, chartH, 2, 2, 'FD');

    doc.setTextColor(...GRAY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('REPARTITION DES MOYENS DE PAIEMENT', M + 5, curY + 6);
    doc.setTextColor(...GRAY_L);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.text(`${totalPmts} transaction(s)`, W - M - 4, curY + 6, { align: 'right' });

    const labelW = 30;
    const pctW = 18;
    const barMaxW = W - 2 * M - labelW - pctW - 14;
    const barH = 4.5;

    methodEntries.forEach(([method, count], idx) => {
      const pct = totalPmts > 0 ? count / totalPmts : 0;
      const barW = Math.max(1, barMaxW * pct);
      const color = METHOD_COLORS[method] || GRAY;
      const label = METHOD_LABELS[method] || method;
      const rowY = curY + 10 + idx * 8;

      doc.setTextColor(...GRAY);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.text(label, M + 5, rowY + barH - 0.5);

      doc.setFillColor(229, 231, 235);
      doc.roundedRect(M + 5 + labelW, rowY, barMaxW, barH, 1, 1, 'F');

      doc.setFillColor(...color);
      doc.roundedRect(M + 5 + labelW, rowY, barW, barH, 1, 1, 'F');

      doc.setTextColor(...GRAY_L);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.text(`${count} (${Math.round(pct * 100)}%)`, M + 5 + labelW + barMaxW + 3, rowY + barH - 0.5);
    });

    curY += chartH + 8;
  }

  // ══════════════════════════════════════════════════════════════════
  // SECTION PAIEMENTS — BANNIÈRE
  // ══════════════════════════════════════════════════════════════════
  doc.setFillColor(...GREEN_D);
  doc.rect(M, curY, W - 2 * M, 11, 'F');
  doc.setFillColor(...GREEN);
  doc.rect(M, curY, 4, 11, 'F');
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('PAIEMENTS RECUS', M + 8, curY + 7.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`${data.paiements.length} transaction(s)`, W - M - 4, curY + 7.5, { align: 'right' });
  curY += 13;

  const totalPaiements = data.paiements.reduce((s, p) => s + p.montant, 0);

  autoTable(doc, {
    startY: curY,
    head: [['N° Recu', 'Eleve', 'Mois', 'Motif', 'Montant (FCFA)', 'Moyen', 'Statut']],
    body: data.paiements.map(p => [
      p.numeroRecu,
      `${p.elevePrenom} ${p.eleveNom}`,
      p.moisLibelle || '—',
      p.motif,
      formatMontant(p.montant),
      p.typePaiement,
      p.statut === 'PARTIEL' ? 'PARTIEL' : 'PAYE',
    ]),
    foot: [['', '', '', 'TOTAL', formatMontant(totalPaiements), '', '']],
    theme: 'plain',
    headStyles: { fillColor: GREEN_D, textColor: WHITE, fontStyle: 'bold', fontSize: 7.5, cellPadding: 3 },
    bodyStyles: { textColor: GRAY, fontSize: 7, cellPadding: 2.5 },
    footStyles: { fillColor: GREEN_L, textColor: GREEN, fontStyle: 'bold', fontSize: 8, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 26 },
      1: { cellWidth: 34 },
      2: { cellWidth: 18 },
      3: { cellWidth: 20 },
      4: { cellWidth: 32, halign: 'right' },
      5: { cellWidth: 22 },
      6: { cellWidth: 18, halign: 'center' },
    },
    didParseCell: (d) => {
      if (d.section === 'body' && d.column.index === 6) {
        const s = d.cell.raw as string;
        d.cell.styles.fillColor = [255, 255, 255];
        d.cell.styles.textColor = s === 'PARTIEL' ? [194, 65, 12] : [22, 101, 52];
        d.cell.styles.fontStyle = 'bold';
        d.cell.styles.halign    = 'center';
      }
    },
    didDrawCell: (d) => {
      if (d.section === 'body') {
        doc.setDrawColor(...BORDER);
        doc.setLineWidth(0.2);
        doc.line(d.cell.x, d.cell.y + d.cell.height, d.cell.x + d.cell.width, d.cell.y + d.cell.height);
      }
    },
  });

  curY = (doc as any).lastAutoTable.finalY + 8;

  // ══════════════════════════════════════════════════════════════════
  // SECTION DÉPENSES — BANNIÈRE
  // ══════════════════════════════════════════════════════════════════
  doc.setFillColor(...RED_D);
  doc.rect(M, curY, W - 2 * M, 11, 'F');
  doc.setFillColor(...RED);
  doc.rect(M, curY, 4, 11, 'F');
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('DEPENSES EFFECTUEES', M + 8, curY + 7.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`${data.depenses.length} depense(s)`, W - M - 4, curY + 7.5, { align: 'right' });
  curY += 13;

  const totalDepenses = data.depenses.reduce((s, d) => s + d.montant, 0);

  autoTable(doc, {
    startY: curY,
    head: [['N° Depense', 'Description', 'Periode', 'Montant (FCFA)', 'Date']],
    body: data.depenses.map(d => [
      d.numeroDepense,
      d.description,
      d.periode || '—',
      formatMontant(d.montant),
      d.date,
    ]),
    foot: [['', '', 'TOTAL', formatMontant(totalDepenses), '']],
    theme: 'plain',
    headStyles: { fillColor: [180, 30, 30] as [number,number,number], textColor: WHITE, fontStyle: 'bold', fontSize: 7.5, cellPadding: 3 },
    bodyStyles: { textColor: GRAY, fontSize: 7, cellPadding: 2.5 },
    footStyles: { fillColor: RED_L, textColor: RED, fontStyle: 'bold', fontSize: 8, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 60 },
      2: { cellWidth: 28 },
      3: { cellWidth: 38, halign: 'right' },
      4: { cellWidth: 26 },
    },
    didDrawCell: (d) => {
      if (d.section === 'body') {
        doc.setDrawColor(...BORDER);
        doc.setLineWidth(0.2);
        doc.line(d.cell.x, d.cell.y + d.cell.height, d.cell.x + d.cell.width, d.cell.y + d.cell.height);
      }
    },
  });

  curY = (doc as any).lastAutoTable.finalY + 10;

  // ══════════════════════════════════════════════════════════════════
  // SIGNATURES
  // ══════════════════════════════════════════════════════════════════
  const sigW = (W - 2 * M - 6) / 2;
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.4);
  doc.roundedRect(M, curY, sigW, 28, 3, 3, 'D');
  doc.roundedRect(M + sigW + 6, curY, sigW, 28, 3, 3, 'D');
  doc.setTextColor(...GREEN);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('Signature (Direction)', M + sigW / 2, curY + 7, { align: 'center' });
  doc.text('Signature (Comptable)', M + sigW + 6 + sigW / 2, curY + 7, { align: 'center' });
  doc.setDrawColor(...GRAY_L);
  doc.setLineWidth(0.3);
  doc.line(M + 6,         curY + 22, M + sigW - 6,    curY + 22);
  doc.line(M + sigW + 12, curY + 22, M + sigW + sigW, curY + 22);

  // ══════════════════════════════════════════════════════════════════
  // FOOTER
  // ══════════════════════════════════════════════════════════════════
  const fY = H - 20;
  doc.setFillColor(...GREEN_D);
  doc.rect(0, fY, W, 20, 'F');
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('GROUPE SCOLAIRE AL-MANAR D3S', W / 2, fY + 7, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(200, 240, 210);
  doc.text('+221 78 120 89 78 / +221 77 520 87 67   |   info@almanard3s.com', W / 2, fY + 13, { align: 'center' });
  doc.setFontSize(6);
  doc.setTextColor(180, 220, 190);
  doc.text(`Genere le : ${now}   |   Document officiel`, W / 2, fY + 17.5, { align: 'center' });

  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(6.5);
    doc.setTextColor(...GRAY_L);
    doc.text(`Page ${i} / ${pageCount}`, W - M, fY - 3, { align: 'right' });
  }

  const filename = reportType === 'daily'  ? `rapport_journalier_${data.dateRapport}.pdf`
                 : reportType === 'weekly' ? `rapport_hebdomadaire_${data.dateDebut}_au_${data.dateFin}.pdf`
                 : `rapport_mensuel_${data.dateRapport}.pdf`;

  doc.save(filename);
}