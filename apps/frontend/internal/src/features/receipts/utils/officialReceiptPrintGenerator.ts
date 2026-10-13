import { OfficialReceiptDto } from '@edge/api';
import {
  PaperSize,
  PrintOutputMode,
  PageOrientation,
  PAPER_DIMENSIONS,
} from '../../queue/types/documentPrintTypes';
import { openDocumentPrintWindow } from '../../queue/utils/documentPrintGenerator';

export interface OfficialReceiptPrintOptions {
  outputMode: PrintOutputMode;
  paperSize: PaperSize;
  orientation: PageOrientation;
  customWidthMm?: number;
  customHeightMm?: number;
  calibration: {
    offsetXmm: number;
    offsetYmm: number;
    scalePercent?: number;
  };
  collectingOfficerName?: string;
  collectingOfficerTitle?: string;
  agencyOffice?: string;
}

export const OFFICIAL_RECEIPT_PORTRAIT_DIMENSIONS = {
  widthMm: 139.7, // 5.5 inches
  heightMm: 215.9, // 8.5 inches
};

function safeStr(val: unknown, fallback = ''): string {
  if (val === null || val === undefined) return fallback;
  const str = String(val).trim();
  return str.length > 0 ? str : fallback;
}

function formatDate(val?: string | null): string {
  if (!val || typeof val !== 'string' || val.trim().length === 0) return 'N/A';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return val;
  }
}

function numberToWords(amount: number): string {
  if (amount <= 0) return 'ZERO PESOS ONLY';
  const units = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
  const teens = ['TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
  const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
  const scales = ['', 'THOUSAND', 'MILLION', 'BILLION'];

  function convertGroup(n: number): string {
    let s = '';
    const h = Math.floor(n / 100);
    const r = n % 100;
    if (h > 0) s += `${units[h]} HUNDRED `;
    if (r >= 20) {
      const t = Math.floor(r / 10);
      const u = r % 10;
      s += tens[t] + (u > 0 ? `-${units[u]}` : '');
    } else if (r >= 10) {
      s += teens[r - 10];
    } else if (r > 0) {
      s += units[r];
    }
    return s.trim();
  }

  const intPart = Math.floor(amount);
  const centPart = Math.round((amount - intPart) * 100);

  if (intPart === 0) {
    return centPart > 0 ? `${centPart}/100 PESOS ONLY` : 'ZERO PESOS ONLY';
  }

  let words = '';
  let temp = intPart;
  let scaleIdx = 0;

  while (temp > 0) {
    const group = temp % 1000;
    if (group > 0) {
      const groupStr = convertGroup(group);
      const scaleStr = scales[scaleIdx] ? ` ${scales[scaleIdx]}` : '';
      words = `${groupStr}${scaleStr} ${words}`.trim();
    }
    temp = Math.floor(temp / 1000);
    scaleIdx++;
  }

  const centStr = centPart > 0 ? ` & ${centPart}/100` : '';
  return `${words.toUpperCase()}${centStr} PESOS ONLY`;
}

function getReceiptPaperDimensions(options: OfficialReceiptPrintOptions): { widthMm: number; heightMm: number; sizeCss: string } {
  if (options.paperSize === 'custom' && options.customWidthMm && options.customHeightMm) {
    const widthMm = options.orientation === 'landscape' ? options.customHeightMm : options.customWidthMm;
    const heightMm = options.orientation === 'landscape' ? options.customWidthMm : options.customHeightMm;
    return { widthMm, heightMm, sizeCss: `${widthMm}mm ${heightMm}mm` };
  }

  // If set to portrait half-sheet (5.5" x 8.5" standard physical form)
  if (options.paperSize === 'letter' && options.orientation === 'portrait') {
    // Standard Accountable Form No. 51 pad dimensions
    return {
      widthMm: OFFICIAL_RECEIPT_PORTRAIT_DIMENSIONS.widthMm,
      heightMm: OFFICIAL_RECEIPT_PORTRAIT_DIMENSIONS.heightMm,
      sizeCss: `${OFFICIAL_RECEIPT_PORTRAIT_DIMENSIONS.widthMm}mm ${OFFICIAL_RECEIPT_PORTRAIT_DIMENSIONS.heightMm}mm`,
    };
  }

  const dim = PAPER_DIMENSIONS[options.paperSize] || PAPER_DIMENSIONS.letter;
  const widthMm = options.orientation === 'landscape' ? dim.heightMm : dim.widthMm;
  const heightMm = options.orientation === 'landscape' ? dim.widthMm : dim.heightMm;
  return { widthMm, heightMm, sizeCss: `${widthMm}mm ${heightMm}mm` };
}

/**
 * Generates the precision HTML for printing an Official Receipt (Accountable Form No. 51).
 * Supports Plain Bond Paper (Full Form), Pre-Printed Form Overlay, and Alignment Test.
 */
export function generateOfficialReceiptPrintHtml(
  receipt: OfficialReceiptDto,
  options: OfficialReceiptPrintOptions
): string {
  if (options.outputMode === 'accountable_form') {
    return generateOfficialReceiptOverlayHtml(receipt, options);
  }
  if (options.outputMode === 'alignment_test') {
    return generateOfficialReceiptAlignmentTestHtml(receipt, options);
  }
  return generateOfficialReceiptPlainPaperHtml(receipt, options);
}

/**
 * Plain Bond Paper (Full Form):
 * Renders complete official receipt including colored seal, NTC emblem, Republic headers,
 * borders, metadata, line items table, and signature line.
 */
function generateOfficialReceiptPlainPaperHtml(
  receipt: OfficialReceiptDto,
  options: OfficialReceiptPrintOptions
): string {
  const { widthMm, heightMm, sizeCss } = getReceiptPaperDimensions(options);
  const dateStr = formatDate(receipt.issuedAt);
  const amountStr = receipt.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const amountWords = numberToWords(receipt.amount);
  const isCancelled = receipt.status === 'Cancelled' || (receipt.status as unknown) === 2;
  const collectingOfficer = safeStr(options.collectingOfficerName || receipt.issuedByUserName, 'Authorized Collecting Officer');
  const agencyOffice = safeStr(options.agencyOffice, 'NTC Regional Office No. VII');

  const lineItems = receipt.lineItems && receipt.lineItems.length > 0
    ? receipt.lineItems
    : [{ id: '1', feeCode: 'REG-01', description: 'Payment of Regulatory Fees', amount: receipt.amount }];

  const tableRowsHtml = lineItems.map((item) => `
    <tr>
      <td style="padding: 4px 6px; border-bottom: 0.5pt solid #cbd5e1; font-size: 8.5pt;">${item.description}</td>
      <td style="padding: 4px 6px; border-bottom: 0.5pt solid #cbd5e1; font-size: 8.5pt; font-family: monospace; text-align: center;">${item.feeCode}</td>
      <td style="padding: 4px 6px; border-bottom: 0.5pt solid #cbd5e1; font-size: 9pt; font-weight: bold; text-align: right;">${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Official Receipt - ${receipt.officialReceiptNumber}</title>
  <style>
    @page {
      size: ${sizeCss};
      margin: 0;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      width: ${widthMm}mm;
      min-height: ${heightMm}mm;
      padding: 8mm;
      font-family: Arial, Helvetica, sans-serif;
      color: #0f172a;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .sheet-border {
      border: 1.5pt solid #0f172a;
      padding: 6mm;
      min-height: calc(${heightMm}mm - 16mm);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
    }
    .watermark {
      position: absolute;
      top: 35%;
      left: 10%;
      right: 10%;
      text-align: center;
      transform: rotate(-30deg);
      font-size: 40pt;
      font-weight: 900;
      color: rgba(239, 68, 68, 0.18);
      border: 3pt solid rgba(239, 68, 68, 0.25);
      padding: 8px;
      pointer-events: none;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 6px;
    }
    .republic-title {
      font-size: 8.5pt;
      font-family: "Times New Roman", serif;
      text-align: center;
    }
    .agency-title {
      font-size: 10pt;
      font-weight: bold;
      font-family: "Times New Roman", serif;
      text-align: center;
    }
    .form-title {
      font-size: 13pt;
      font-weight: bold;
      letter-spacing: 1.5px;
      text-align: center;
      margin-top: 2px;
    }
    .form-code {
      font-size: 7pt;
      font-style: italic;
      color: #64748b;
      text-align: center;
    }
    .meta-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 0.8pt solid #0f172a;
      padding: 4px 8px;
      margin-top: 6px;
      background: #f8fafc;
    }
    .or-no {
      font-size: 12pt;
      font-weight: bold;
      color: #dc2626;
      font-family: monospace;
    }
    .payor-card {
      border: 0.8pt solid #0f172a;
      padding: 4px 8px;
      margin-top: 4px;
      font-size: 8.5pt;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      border: 0.8pt solid #0f172a;
      margin-top: 4px;
    }
    .items-table th {
      background: #f1f5f9;
      border-bottom: 0.8pt solid #0f172a;
      padding: 4px 6px;
      font-size: 8pt;
      font-weight: bold;
      text-align: left;
    }
    .total-row td {
      border-top: 1pt solid #0f172a;
      background: #f8fafc;
      padding: 5px 6px;
      font-weight: bold;
    }
    .amount-words-box {
      border: 0.8pt solid #0f172a;
      padding: 4px 8px;
      margin-top: 4px;
      font-size: 8pt;
    }
    .payment-method-box {
      border: 0.8pt solid #0f172a;
      padding: 4px 8px;
      margin-top: 4px;
      font-size: 8pt;
    }
    .signature-section {
      display: flex;
      justify-content: flex-end;
      margin-top: 8px;
    }
    .signature-box {
      width: 60mm;
      text-align: center;
    }
    .sign-line {
      border-bottom: 0.8pt solid #0f172a;
      height: 18px;
      margin-bottom: 2px;
    }
    .sign-name {
      font-size: 8.5pt;
      font-weight: bold;
      text-transform: uppercase;
    }
    .sign-role {
      font-size: 7pt;
      color: #475569;
    }
  </style>
</head>
<body>
  <div class="sheet-border">
    ${isCancelled ? '<div class="watermark">CANCELLED / VOID</div>' : ''}
    <div>
      <div class="republic-title">Republic of the Philippines</div>
      <div class="agency-title">NATIONAL TELECOMMUNICATIONS COMMISSION</div>
      <div class="form-title">OFFICIAL RECEIPT</div>
      <div class="form-code">Accountable Form No. 51 (Revised 2006)</div>

      <div class="meta-bar">
        <div><strong>DATE:</strong> ${dateStr}</div>
        <div><strong>No.</strong> <span class="or-no">${receipt.officialReceiptNumber}</span></div>
      </div>

      <div class="payor-card">
        <div><strong>Agency / Office:</strong> ${agencyOffice}</div>
        <div style="margin-top: 2px;"><strong>Payor:</strong> <span style="font-weight: bold; font-size: 9pt;">${receipt.payorName}</span></div>
        ${receipt.payorAddress ? `<div style="margin-top: 2px;"><strong>Address:</strong> ${receipt.payorAddress}</div>` : ''}
        ${receipt.opNumber ? `<div style="margin-top: 2px;"><strong>Order of Payment No.:</strong> ${receipt.opNumber}</div>` : ''}
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 55%;">NATURE OF COLLECTION</th>
            <th style="width: 25%; text-align: center;">FUND / CODE</th>
            <th style="width: 20%; text-align: right;">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          ${tableRowsHtml}
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="2" style="text-align: right; font-size: 8.5pt;">TOTAL AMOUNT (in Figures):</td>
            <td style="text-align: right; font-size: 9.5pt; color: #0f172a;">₱${amountStr}</td>
          </tr>
        </tfoot>
      </table>

      <div class="amount-words-box">
        <strong>Amount in Words:</strong> ${amountWords}
      </div>

      <div class="payment-method-box">
        <div><strong>Payment Mode:</strong> ${receipt.paymentMethod.toUpperCase()}</div>
        ${receipt.paymentMethod === 'Check' ? `<div>Check No.: <strong>${safeStr(receipt.checkNumber, 'N/A')}</strong> • Drawee Bank: <strong>${safeStr(receipt.checkBank, 'N/A')}</strong></div>` : ''}
        ${receipt.depositSlipNumber ? `<div>Deposit Slip No.: <strong>${receipt.depositSlipNumber}</strong></div>` : ''}
      </div>
    </div>

    <div>
      <div class="signature-section">
        <div class="signature-box">
          <div style="font-size: 7pt; color: #475569; margin-bottom: 8px;">RECEIVED THE AMOUNT STATED ABOVE</div>
          <div class="sign-line"></div>
          <div class="sign-name">${collectingOfficer}</div>
          <div class="sign-role">Collecting Officer / Cashier</div>
        </div>
      </div>
      <div style="font-size: 6.5pt; color: #94a3b8; text-align: center; margin-top: 4px;">
        NTC-EDGE Official Cashier Management • Printed on ${formatDate(new Date().toISOString())}
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Pre-Printed Form Overlay (Accountable Form No. 51):
 * Suppresses all static text, borders, headers, and backgrounds.
 * Renders ONLY the variable cashier data at millimeter positions matching the physical form pad,
 * applying horizontal and vertical feeder tray calibration.
 */
function generateOfficialReceiptOverlayHtml(
  receipt: OfficialReceiptDto,
  options: OfficialReceiptPrintOptions
): string {
  const { widthMm, heightMm, sizeCss } = getReceiptPaperDimensions(options);
  const offsetX = options.calibration.offsetXmm || 0;
  const offsetY = options.calibration.offsetYmm || 0;
  const scale = (options.calibration.scalePercent || 100) / 100;

  const dateStr = formatDate(receipt.issuedAt);
  const amountStr = receipt.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const amountWords = numberToWords(receipt.amount);
  const collectingOfficer = safeStr(options.collectingOfficerName || receipt.issuedByUserName, 'COLLECTING OFFICER');
  const agencyOffice = safeStr(options.agencyOffice, 'NTC REGIONAL OFFICE NO. VII');

  const lineItems = receipt.lineItems && receipt.lineItems.length > 0
    ? receipt.lineItems
    : [{ id: '1', feeCode: 'REG-01', description: 'Payment of Regulatory Fees', amount: receipt.amount }];

  const lineItemsHtml = lineItems.map((item, idx) => {
    const topPos = 72 + offsetY + (idx * 6.5);
    return `
      <div style="position: absolute; top: ${topPos}mm; left: ${12 + offsetX}mm; width: 62mm; font-size: 8pt; white-space: nowrap; overflow: hidden;">
        ${item.description}
      </div>
      <div style="position: absolute; top: ${topPos}mm; left: ${76 + offsetX}mm; width: 22mm; font-size: 8pt; font-family: monospace; text-align: center;">
        ${item.feeCode}
      </div>
      <div style="position: absolute; top: ${topPos}mm; left: ${100 + offsetX}mm; width: 28mm; font-size: 8.5pt; font-weight: bold; text-align: right;">
        ${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
    `;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Accountable Form 51 Overlay - ${receipt.officialReceiptNumber}</title>
  <style>
    @page {
      size: ${sizeCss};
      margin: 0;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      width: ${widthMm}mm;
      height: ${heightMm}mm;
      margin: 0;
      padding: 0;
      position: relative;
      background: transparent;
      overflow: hidden;
      font-family: Arial, Helvetica, sans-serif;
      color: #000000;
      transform: scale(${scale});
      transform-origin: top left;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .field {
      position: absolute;
      line-height: 1.2;
    }
  </style>
</head>
<body>
  <!-- Date Field -->
  <div class="field" style="top: ${26 + offsetY}mm; left: ${24 + offsetX}mm; width: 45mm; font-size: 8.5pt;">
    ${dateStr}
  </div>

  <!-- Official Receipt Number (if not pre-numbered, fills designated box) -->
  <div class="field" style="top: ${22 + offsetY}mm; left: ${92 + offsetX}mm; width: 38mm; font-size: 11pt; font-weight: bold; font-family: monospace; text-align: right; color: #dc2626;">
    ${receipt.officialReceiptNumber}
  </div>

  <!-- Agency / Office -->
  <div class="field" style="top: ${36 + offsetY}mm; left: ${30 + offsetX}mm; width: 95mm; font-size: 8.5pt;">
    ${agencyOffice}
  </div>

  <!-- Payor Name -->
  <div class="field" style="top: ${44 + offsetY}mm; left: ${22 + offsetX}mm; width: 105mm; font-size: 9pt; font-weight: bold;">
    ${receipt.payorName}
  </div>

  <!-- Payor Address -->
  <div class="field" style="top: ${52 + offsetY}mm; left: ${22 + offsetX}mm; width: 105mm; font-size: 8pt;">
    ${safeStr(receipt.payorAddress)}
  </div>

  <!-- Dynamic Line Items -->
  ${lineItemsHtml}

  <!-- Total Amount (in Figures) -->
  <div class="field" style="top: ${136 + offsetY}mm; left: ${98 + offsetX}mm; width: 30mm; font-size: 9.5pt; font-weight: bold; text-align: right;">
    ${amountStr}
  </div>

  <!-- Total Amount in Words -->
  <div class="field" style="top: ${146 + offsetY}mm; left: ${14 + offsetX}mm; width: 114mm; font-size: 8pt; line-height: 1.2; text-transform: uppercase;">
    ${amountWords}
  </div>

  <!-- Payment Mode Checkbox indicators -->
  <div class="field" style="top: ${158 + offsetY}mm; left: ${14 + offsetX}mm; width: 114mm; font-size: 7.5pt;">
    ${receipt.paymentMethod === 'Cash' ? '✔ CASH' : receipt.paymentMethod === 'Check' ? `✔ CHECK: ${safeStr(receipt.checkNumber)} (${safeStr(receipt.checkBank)})` : `✔ ${receipt.paymentMethod.toUpperCase()}`}
  </div>

  <!-- Collecting Officer Name -->
  <div class="field" style="top: ${188 + offsetY}mm; left: ${70 + offsetX}mm; width: 58mm; font-size: 8.5pt; font-weight: bold; text-align: center; text-transform: uppercase;">
    ${collectingOfficer}
  </div>
</body>
</html>`;
}

/**
 * Alignment Test Sheet:
 * Prints dashed red bounding boxes with labels and exact coordinates on blank paper,
 * so cashiers can calibrate printer trays before inserting official accountable forms.
 */
function generateOfficialReceiptAlignmentTestHtml(
  receipt: OfficialReceiptDto,
  options: OfficialReceiptPrintOptions
): string {
  const { widthMm, heightMm, sizeCss } = getReceiptPaperDimensions(options);
  const offsetX = options.calibration.offsetXmm || 0;
  const offsetY = options.calibration.offsetYmm || 0;

  const boxes = [
    { label: 'Date', top: 26, left: 24, w: 45, h: 6 },
    { label: 'OR Number', top: 22, left: 92, w: 38, h: 8 },
    { label: 'Agency', top: 36, left: 30, w: 95, h: 6 },
    { label: 'Payor Name', top: 44, left: 22, w: 105, h: 7 },
    { label: 'Payor Address', top: 52, left: 22, w: 105, h: 6 },
    { label: 'Nature of Collection (Table Row 1)', top: 72, left: 12, w: 62, h: 6 },
    { label: 'Account Code (Table Row 1)', top: 72, left: 76, w: 22, h: 6 },
    { label: 'Amount (Table Row 1)', top: 72, left: 100, w: 28, h: 6 },
    { label: 'Total Amount (Figures)', top: 136, left: 98, w: 30, h: 7 },
    { label: 'Amount in Words', top: 146, left: 14, w: 114, h: 8 },
    { label: 'Payment Mode', top: 158, left: 14, w: 114, h: 6 },
    { label: 'Collecting Officer Signature', top: 188, left: 70, w: 58, h: 8 },
  ];

  const boxesHtml = boxes.map((b) => `
    <div style="position: absolute; top: ${b.top + offsetY}mm; left: ${b.left + offsetX}mm; width: ${b.w}mm; height: ${b.h}mm; border: 1pt dashed #ef4444; background: rgba(239, 68, 68, 0.08); font-family: monospace; font-size: 6.5pt; color: #dc2626; padding: 1mm; overflow: hidden;">
      ${b.label} (${(b.top + offsetY).toFixed(1)}, ${(b.left + offsetX).toFixed(1)} mm)
    </div>
  `).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Accountable Form 51 Alignment Test Sheet</title>
  <style>
    @page {
      size: ${sizeCss};
      margin: 0;
    }
    body {
      width: ${widthMm}mm;
      height: ${heightMm}mm;
      margin: 0;
      padding: 0;
      position: relative;
      background: #ffffff;
      font-family: Arial, Helvetica, sans-serif;
    }
    .banner {
      position: absolute;
      top: 4mm;
      left: 10mm;
      right: 10mm;
      padding: 2mm 4mm;
      background: #fef2f2;
      border: 1pt solid #f87171;
      font-size: 7.5pt;
      color: #991b1b;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="banner">
    <div><strong>NTC-EDGE ALIGNMENT SHEET</strong> • Accountable Form No. 51</div>
    <div>Offsets: X=${offsetX > 0 ? `+${offsetX}` : offsetX}mm, Y=${offsetY > 0 ? `+${offsetY}` : offsetY}mm</div>
  </div>
  ${boxesHtml}
</body>
</html>`;
}
