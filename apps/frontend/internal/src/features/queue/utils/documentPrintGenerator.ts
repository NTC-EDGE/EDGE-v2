import { ApplicationData } from '../../../types/application';
import {
  DocumentPrintOptions,
  PAPER_DIMENSIONS,
  ACCOUNTABLE_FORM_TEMPLATES,
  AccountableFormTemplate,
} from '../types/documentPrintTypes';

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

function formatFullAddress(app: ApplicationData): string {
  if (!app.address) return 'N/A';
  const parts = [
    app.address.streetAddress || app.address.address,
    app.address.barangay,
    app.address.city,
    app.address.province,
    app.address.region,
    app.address.zipCode ? `Zip: ${app.address.zipCode}` : undefined,
  ].filter((p): p is string => Boolean(p && typeof p === 'string' && p.trim().length > 0));
  return parts.length > 0 ? parts.join(', ') : 'N/A';
}

function getPaperSizeCss(options: DocumentPrintOptions): { widthMm: number; heightMm: number; sizeCss: string } {
  const dim = PAPER_DIMENSIONS[options.paperSize] || PAPER_DIMENSIONS.letter;
  const widthMm = options.paperSize === 'custom' && options.customWidthMm ? options.customWidthMm : dim.widthMm;
  const heightMm = options.paperSize === 'custom' && options.customHeightMm ? options.customHeightMm : dim.heightMm;

  const actualWidth = options.orientation === 'landscape' ? heightMm : widthMm;
  const actualHeight = options.orientation === 'landscape' ? widthMm : heightMm;

  const sizeCss = `${actualWidth}mm ${actualHeight}mm`;
  return { widthMm: actualWidth, heightMm: actualHeight, sizeCss };
}

export function findMatchingTemplate(app: ApplicationData, templateId?: string): AccountableFormTemplate {
  if (templateId) {
    const matched = ACCOUNTABLE_FORM_TEMPLATES.find((t) => t.id === templateId);
    if (matched) return matched;
  }

  const category = (app.serviceCategory || app.category || '').toLowerCase();
  const service = (app.serviceName || '').toLowerCase();

  if (category.includes('license') || service.includes('radio station') || service.includes('rsl')) {
    return ACCOUNTABLE_FORM_TEMPLATES[0] ?? ACCOUNTABLE_FORM_TEMPLATES[0]; // NTC-FORM-101
  }
  if (category.includes('cert') || service.includes('operator') || service.includes('amateur')) {
    return ACCOUNTABLE_FORM_TEMPLATES[1] ?? ACCOUNTABLE_FORM_TEMPLATES[0]; // NTC-FORM-102
  }
  if (category.includes('permit') || service.includes('permit') || service.includes('registration')) {
    return ACCOUNTABLE_FORM_TEMPLATES[2] ?? ACCOUNTABLE_FORM_TEMPLATES[0]; // NTC-FORM-301
  }

  return ACCOUNTABLE_FORM_TEMPLATES[0] ?? ACCOUNTABLE_FORM_TEMPLATES[0];
}

/**
 * Generates the full statutory document HTML for Plain Bond Paper printing.
 */
export function generateStatutoryDocumentHtml(
  app: ApplicationData,
  options: DocumentPrintOptions
): string {
  const { sizeCss, widthMm, heightMm } = getPaperSizeCss(options);

  const docTitle = safeStr(options.issuedDocumentType || app.serviceName, 'STATUTORY REGULATORY LICENSE');
  const formNum = safeStr(options.formNumber || app.applicationNumber, `NTC-${app.office || 'R07'}-${new Date().getFullYear()}-FORM-001`);
  const licNum = safeStr(options.licenseNumber, `NTC-${app.office || 'R07'}-${new Date().getFullYear()}-LIC-001`);
  const callSign = safeStr(options.callSign, 'N/A');
  const stationClass = safeStr(options.stationClass, 'Land Mobile / Fixed Station');
  const freqBand = safeStr(options.frequencyBand, '144.000 - 146.000 MHz (VHF)');
  const issueDateStr = formatDate(options.issueDate || new Date().toISOString());
  const expiryDateStr = formatDate(options.expiryDate || new Date(Date.now() + 3 * 365 * 24 * 3600 * 1000).toISOString());
  const orNumber = safeStr(options.officialReceiptNumber || app.payment?.orNumber, 'N/A');
  const applicantName = safeStr(app.applicant, 'Applicant Name');
  const fullAddress = formatFullAddress(app);
  const signatoryName = safeStr(options.signatoryName || app.issuingOfficer || app.evaluatingOfficer, 'REGIONAL DIRECTOR');
  const signatoryTitle = safeStr(options.signatoryTitle, 'Regional Director / Authorized Signatory');
  const officeName = safeStr(app.office || app.assignedTo, 'National Telecommunications Commission - Regional Office');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${docTitle} - #${formNum}</title>
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
      font-family: "Times New Roman", Times, "Liberation Serif", serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0 auto;
      padding: 14mm 16mm;
      position: relative;
      overflow: hidden;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page-border {
      width: 100%;
      height: 100%;
      border: 3.5pt double #1e3a8a;
      padding: 8mm 10mm;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 120mm;
      height: 120mm;
      opacity: 0.055;
      pointer-events: none;
      z-index: 0;
    }
    .content-layer {
      position: relative;
      z-index: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .header-section {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 5mm;
      border-bottom: 1.5pt solid #1e3a8a;
      padding-bottom: 4mm;
      min-height: 24mm;
    }
    .header-text-block {
      text-align: center;
      flex: 1;
      padding-right: 25mm;
    }
    .header-qr-corner {
      position: absolute;
      top: 0;
      right: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .republic-text {
      font-size: 11pt;
      font-weight: bold;
      letter-spacing: 0.5px;
      color: #1e293b;
      text-transform: uppercase;
    }
    .dept-text {
      font-size: 9pt;
      color: #334155;
      margin-top: 1mm;
    }
    .agency-name {
      font-size: 14.5pt;
      font-weight: bold;
      color: #1e3a8a;
      letter-spacing: 0.8px;
      margin-top: 1.5mm;
      text-transform: uppercase;
    }
    .office-sub {
      font-size: 9.5pt;
      color: #475569;
      font-style: italic;
      margin-top: 0.8mm;
    }
    .doc-title-box {
      text-align: center;
      margin: 4mm 0;
    }
    .doc-main-title {
      font-size: 16.5pt;
      font-weight: bold;
      letter-spacing: 1.2px;
      color: #1e3a8a;
      text-transform: uppercase;
      text-decoration: underline;
    }
    .control-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4mm;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 9pt;
    }
    .control-item strong {
      color: #1e3a8a;
    }
    .licensee-box {
      border: 1pt solid #cbd5e1;
      background: #f8fafc;
      padding: 3mm 4mm;
      margin-bottom: 4mm;
      font-family: Arial, Helvetica, sans-serif;
    }
    .licensee-label {
      font-size: 8pt;
      color: #64748b;
      text-transform: uppercase;
      font-weight: bold;
    }
    .licensee-name {
      font-size: 13pt;
      font-weight: bold;
      color: #0f172a;
      margin-top: 1mm;
    }
    .licensee-addr {
      font-size: 9pt;
      color: #334155;
      margin-top: 1mm;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 8.5pt;
      margin-bottom: 4mm;
    }
    .data-table th, .data-table td {
      border: 1pt solid #cbd5e1;
      padding: 2.2mm 3mm;
      vertical-align: middle;
    }
    .data-table th {
      background: #f1f5f9;
      font-weight: bold;
      color: #334155;
      text-transform: uppercase;
      font-size: 7.8pt;
    }
    .data-table td.val-bold {
      font-weight: bold;
      color: #0f172a;
    }
    .data-table td.mono {
      font-family: "Courier New", Courier, monospace;
      font-size: 9.5pt;
    }
    .statutory-clauses {
      font-size: 8pt;
      color: #475569;
      line-height: 1.35;
      text-align: justify;
      margin-bottom: 4mm;
      font-style: italic;
    }
    .footer-sign-section {
      display: flex;
      justify-content: flex-end;
      align-items: flex-end;
      margin-top: 4mm;
      padding-top: 3mm;
      border-top: 1pt solid #e2e8f0;
    }
    .qr-box {
      width: 22mm;
      height: 22mm;
      border: 1pt solid #1e3a8a;
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1mm;
    }
    .qr-sub-text {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 5.5pt;
      font-weight: bold;
      color: #1e3a8a;
      letter-spacing: 0.5px;
      margin-top: 1mm;
    }
    .signature-box {
      text-align: center;
      width: 70mm;
    }
    .sign-line {
      border-bottom: 1.2pt solid #0f172a;
      margin-bottom: 1.5mm;
      height: 12mm;
    }
    .sign-name {
      font-size: 10.5pt;
      font-weight: bold;
      text-transform: uppercase;
      color: #0f172a;
    }
    .sign-title {
      font-size: 8pt;
      color: #475569;
      font-style: italic;
    }
    .bottom-footnote {
      text-align: center;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 6.5pt;
      color: #94a3b8;
      margin-top: 2mm;
    }
  </style>
</head>
<body>
  <div class="page-border">
    <!-- SVG Seal Watermark Background -->
    <svg class="watermark" viewBox="0 0 100 100" fill="none" stroke="#1e3a8a" stroke-width="1.5">
      <circle cx="50" cy="50" r="46" stroke-width="2" />
      <circle cx="50" cy="50" r="41" stroke-dasharray="2,2" />
      <polygon points="50,15 61,38 85,38 66,54 73,78 50,63 27,78 34,54 15,38 39,38" fill="none" stroke-width="1.2" />
      <text x="50" y="93" text-anchor="middle" font-size="6" font-family="Arial" font-weight="bold">OFFICIAL SEAL • NTC</text>
    </svg>

    <div class="content-layer">
      <div>
        <div class="header-section">
          <div class="header-text-block">
            <div class="republic-text">Republic of the Philippines</div>
            <div class="dept-text">Department of Information and Communications Technology</div>
            <div class="agency-name">National Telecommunications Commission</div>
            <div class="office-sub">${officeName}</div>
          </div>
          <div class="header-qr-corner">
            <div class="qr-box">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#1e3a8a" stroke-width="1.5">
                <rect x="2" y="2" width="8" height="8" rx="1"/>
                <rect x="14" y="2" width="8" height="8" rx="1"/>
                <rect x="2" y="14" width="8" height="8" rx="1"/>
                <rect x="5" y="5" width="2" height="2" fill="#1e3a8a"/>
                <rect x="17" y="5" width="2" height="2" fill="#1e3a8a"/>
                <rect x="5" y="17" width="2" height="2" fill="#1e3a8a"/>
                <path d="M14 14h2v2h-2zM18 14h4v2h-4zM14 18h4v4h-4zM20 18h2v4h-2z" fill="#1e3a8a"/>
              </svg>
            </div>
            <div class="qr-sub-text">NTC VERIFIED</div>
          </div>
        </div>

        <div class="doc-title-box">
          <div class="doc-main-title">${docTitle}</div>
        </div>

        <div class="control-row">
          <div class="control-item">FORM NO: <strong class="mono">${formNum}</strong></div>
          <div class="control-item">LICENSE / CERT NO: <strong class="mono">${licNum}</strong></div>
          <div class="control-item">OR NO: <strong>${orNumber}</strong></div>
        </div>

        <div class="licensee-box">
          <div class="licensee-label">Grantee / Registered Entity:</div>
          <div class="licensee-name">${applicantName}</div>
          <div class="licensee-addr">📍 ${fullAddress}</div>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>Call Sign</th>
              <th>Station Class</th>
              <th>Service Category</th>
              <th>Date Issued</th>
              <th>Expiration Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="val-bold mono" style="font-size: 11pt; color: #1e3a8a;">${callSign}</td>
              <td class="val-bold">${stationClass}</td>
              <td>${safeStr(app.serviceCategory, 'Telecommunications')}</td>
              <td>${issueDateStr}</td>
              <td class="val-bold" style="color: #b91c1c;">${expiryDateStr}</td>
            </tr>
          </tbody>
        </table>

        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 40%;">Authorized Frequencies</th>
              <th style="width: 35%;">Transmitter Specifications</th>
              <th style="width: 25%;">Points of Communication</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="mono">${freqBand}</td>
              <td>Transceiver Unit / Compliant Output Power</td>
              <td>Authorized NTC Coordinates / Field Zones</td>
            </tr>
          </tbody>
        </table>

        <div class="statutory-clauses">
          Pursuant to the provisions of the Public Telecommunications Policy Act (RA 7925), Act No. 3846 as amended, and existing NTC rules and regulations, the grantee is hereby authorized to install, operate, and maintain the radio station described above. This authority is subject to the terms and conditions prescribed herein and on the reverse side hereof.
        </div>
      </div>

      <div>
        <div class="footer-sign-section">
          <div class="signature-box">
            <div class="sign-line"></div>
            <div class="sign-name">${signatoryName}</div>
            <div class="sign-title">${signatoryTitle}</div>
          </div>
        </div>

        <div class="bottom-footnote">
          NTC-EDGE Official Digital System • Generated on ${formatDate(new Date().toISOString())} • RA 11032 Ease of Doing Business Certified
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Generates the precision data overlay HTML for Accountable Form printing.
 * Suppresses background graphics and prints ONLY dynamic fields at exact millimeter coordinates.
 */
export function generateAccountableFormOverlayHtml(
  app: ApplicationData,
  options: DocumentPrintOptions,
  template?: AccountableFormTemplate
): string {
  const activeTemplate = template || findMatchingTemplate(app, options.selectedTemplateId);
  const { sizeCss, widthMm, heightMm } = getPaperSizeCss(options);

  const offsetX = options.calibration.offsetXmm || 0;
  const offsetY = options.calibration.offsetYmm || 0;
  const scale = (options.calibration.scalePercent || 100) / 100;

  // Resolve values dictionary for template field mappings
  const formNum = safeStr(options.formNumber || app.applicationNumber, `NTC-${app.office || 'R07'}-${new Date().getFullYear()}-001`);
  const licNum = safeStr(options.licenseNumber, formNum);
  const callSign = safeStr(options.callSign, 'N/A');
  const stationClass = safeStr(options.stationClass, 'Station Class A');
  const freqBand = safeStr(options.frequencyBand, '144.000 - 146.000 MHz');
  const issueDateStr = formatDate(options.issueDate || new Date().toISOString());
  const expiryDateStr = formatDate(options.expiryDate || new Date(Date.now() + 3 * 365 * 24 * 3600 * 1000).toISOString());
  const orNumber = safeStr(options.officialReceiptNumber || app.payment?.orNumber, 'N/A');
  const applicantName = safeStr(app.applicant, 'Applicant Name');
  const fullAddress = formatFullAddress(app);
  const signatoryName = safeStr(options.signatoryName || app.issuingOfficer || app.evaluatingOfficer, 'REGIONAL DIRECTOR');
  const signatoryTitle = safeStr(options.signatoryTitle, 'Regional Director / Authorized Signatory');
  const serviceName = safeStr(app.serviceName, 'Radio Service');
  const serviceCategory = safeStr(app.serviceCategory, 'Commercial');
  const remarks = safeStr(options.remarks || app.note, 'None');
  const totalAmount = app.totalAmountDue ? `PHP ${app.totalAmountDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'N/A';

  const valuesMap: Record<string, string> = {
    formNumber: formNum,
    licenseNumber: licNum,
    applicantName: applicantName,
    address: fullAddress,
    callSign: callSign,
    stationClass: stationClass,
    serviceCategory: serviceCategory,
    serviceName: serviceName,
    frequencyBand: freqBand,
    equipmentDetails: `Make: Standard / Transceiver Power: Compliant`,
    issueDate: issueDateStr,
    expiryDate: expiryDateStr,
    orNumber: orNumber,
    signatoryName: signatoryName,
    signatoryTitle: signatoryTitle,
    remarks: remarks,
    totalAmount: totalAmount,
    amountInWords: totalAmount,
    agency: 'National Telecommunications Commission',
    birthDate: app.basicInfo?.dob ? formatDate(app.basicInfo.dob) : 'N/A',
  };

  const fieldsHtml = activeTemplate.fields.map((f) => {
    const rawVal = valuesMap[f.id] || '';
    const displayVal = f.uppercase ? rawVal.toUpperCase() : rawVal;
    const topPos = f.topMm + offsetY;
    const leftPos = f.leftMm + offsetX;
    const widthStyle = f.widthMm ? `width: ${f.widthMm}mm;` : '';
    const heightStyle = f.heightMm ? `height: ${f.heightMm}mm;` : '';
    const fontStyle = `font-size: ${f.fontSizePt || 10}pt;`;
    const weightStyle = f.fontWeight ? `font-weight: ${f.fontWeight};` : '';
    const alignStyle = f.textAlign ? `text-align: ${f.textAlign};` : 'text-align: left;';
    const fontFam = f.isMonospace ? 'font-family: "Courier New", Courier, monospace;' : 'font-family: Arial, Helvetica, sans-serif;';

    if (f.id === 'qrCode') {
      return `
        <div class="overlay-field" style="top: ${topPos}mm; left: ${leftPos}mm; ${widthStyle} ${heightStyle}">
          <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.5">
            <rect x="2" y="2" width="8" height="8" rx="1"/>
            <rect x="14" y="2" width="8" height="8" rx="1"/>
            <rect x="2" y="14" width="8" height="8" rx="1"/>
            <rect x="5" y="5" width="2" height="2" fill="#000"/>
            <rect x="17" y="5" width="2" height="2" fill="#000"/>
            <rect x="5" y="17" width="2" height="2" fill="#000"/>
            <path d="M14 14h2v2h-2zM18 14h4v2h-4zM14 18h4v4h-4zM20 18h2v4h-2z"/>
          </svg>
        </div>
      `;
    }

    return `
      <div class="overlay-field" style="top: ${topPos}mm; left: ${leftPos}mm; ${widthStyle} ${fontStyle} ${weightStyle} ${alignStyle} ${fontFam}">
        ${displayVal}
      </div>
    `;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Accountable Form Overlay - ${activeTemplate.code} - ${formNum}</title>
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
      transform: scale(${scale});
      transform-origin: top left;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .overlay-field {
      position: absolute;
      color: #000000;
      line-height: 1.25;
      white-space: normal;
      word-break: break-word;
    }
  </style>
</head>
<body>
  ${fieldsHtml}
</body>
</html>`;
}

/**
 * Generates an Alignment Test Sheet with coordinate grids and bounding boxes
 * so officers can test-feed on blank paper before using official accountable forms.
 */
export function generateAlignmentTestSheetHtml(
  options: DocumentPrintOptions,
  template?: AccountableFormTemplate
): string {
  const activeTemplate = template ?? ACCOUNTABLE_FORM_TEMPLATES[0];
  const { sizeCss, widthMm, heightMm } = getPaperSizeCss(options);

  const offsetX = options.calibration.offsetXmm || 0;
  const offsetY = options.calibration.offsetYmm || 0;

  const boxesHtml = activeTemplate.fields.map((f) => {
    const topPos = f.topMm + offsetY;
    const leftPos = f.leftMm + offsetX;
    const w = f.widthMm || 40;
    const h = f.heightMm || 8;

    return `
      <div style="position: absolute; top: ${topPos}mm; left: ${leftPos}mm; width: ${w}mm; height: ${h}mm; border: 1pt dashed #ef4444; background: rgba(239, 68, 68, 0.08); font-family: monospace; font-size: 7pt; color: #dc2626; padding: 1mm; overflow: hidden;">
        [${f.id}] ${f.label} (${topPos.toFixed(1)}, ${leftPos.toFixed(1)} mm)
      </div>
    `;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Printer Calibration &amp; Alignment Test Sheet</title>
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
      background: #ffffff;
      font-family: Arial, Helvetica, sans-serif;
    }
    .grid-crosshair {
      position: absolute;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
    .banner {
      position: absolute;
      top: 6mm;
      left: 10mm;
      right: 10mm;
      padding: 2mm 4mm;
      background: #fef2f2;
      border: 1pt solid #f87171;
      font-size: 8pt;
      color: #991b1b;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="banner">
    <div><strong>NTC-EDGE ALIGNMENT CALIBRATION SHEET</strong> • Template: ${activeTemplate.title} (${activeTemplate.code})</div>
    <div>Offsets: X=${offsetX > 0 ? `+${offsetX}` : offsetX}mm, Y=${offsetY > 0 ? `+${offsetY}` : offsetY}mm</div>
  </div>

  ${boxesHtml}
</body>
</html>`;
}

/**
 * Robust document popup print trigger.
 */
export function openDocumentPrintWindow(htmlContent: string): void {
  if (typeof window !== 'undefined') {
    const printWindow = window.open('', '_blank', 'width=880,height=960');
    if (printWindow !== null) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 400);
    }
  }
}
