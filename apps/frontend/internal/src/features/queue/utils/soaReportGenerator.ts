import { ApplicationData } from '../../../types/application';

function formatCurrency(amount: number): string {
  return `PHP ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function numberToWords(num: number): string {
  const a = [
    '', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ',
    'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen ',
  ];
  const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  const n = Math.floor(num);
  if (n === 0) return 'zero pesos only';

  function inWords(val: number): string {
    if (val < 20) return a[val] ?? '';
    if (val < 100) {
      const tens = Math.floor(val / 10);
      const rem = val % 10;
      return `${b[tens] ?? ''}${rem > 0 ? `-${a[rem]}` : ' '}`;
    }
    if (val < 1000) {
      const h = Math.floor(val / 100);
      const rem = val % 100;
      return `${a[h]}hundred ${rem > 0 ? inWords(rem) : ''}`;
    }
    if (val < 1000000) {
      const th = Math.floor(val / 1000);
      const rem = val % 1000;
      return `${inWords(th)}thousand ${rem > 0 ? inWords(rem) : ''}`;
    }
    const mil = Math.floor(val / 1000000);
    const rem = val % 1000000;
    return `${inWords(mil)}million ${rem > 0 ? inWords(rem) : ''}`;
  }

  const cents = Math.round((num - n) * 100);
  const centsText = cents > 0 ? ` and ${cents}/100` : '';
  return `${inWords(n).trim()} pesos${centsText} only`.toUpperCase();
}

export function generateSoaPrintableHtml(
  app: ApplicationData,
  tenantName?: string,
  preparerName?: string,
  approverName?: string
): string {
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const soaNumber = `SOA-${app.referenceNumber ?? app.id.slice(0, 8).toUpperCase()}`;
  const totalWords = numberToWords(app.totalAmountDue);
  const officeName = app.assignedTo || app.office || tenantName || 'National Telecommunications Commission';

  const lineItemsHtml =
    app.soaItems.length > 0
      ? app.soaItems
          .map(
            (item, index) => `
        <tr>
          <td style="border: 1px solid #cbd5e1; padding: 10px 8px; font-size: 11px; text-align: center;">${index + 1}</td>
          <td style="border: 1px solid #cbd5e1; padding: 10px 12px; font-size: 11px; font-family: monospace; color: #0284c7;">${item.code || 'NTC-FEE'}</td>
          <td style="border: 1px solid #cbd5e1; padding: 10px 12px; font-size: 11px;">
            <div style="font-weight: 600; color: #0f172a;">${item.particular}</div>
            <div style="font-size: 10px; color: #64748b;">Validity: ${item.validityYears} Year(s)</div>
          </td>
          <td style="border: 1px solid #cbd5e1; padding: 10px 12px; font-size: 11px; text-align: center;">${item.validityYears}</td>
          <td style="border: 1px solid #cbd5e1; padding: 10px 12px; font-size: 11px; text-align: center;">${item.noOfUnits}</td>
          <td style="border: 1px solid #cbd5e1; padding: 10px 12px; font-size: 11px; text-align: right;">${formatCurrency(item.fees)}</td>
          <td style="border: 1px solid #cbd5e1; padding: 10px 12px; font-size: 11px; text-align: right; font-weight: 700; color: #0f172a;">${formatCurrency(item.amount)}</td>
        </tr>
      `
          )
          .join('')
      : `
        <tr>
          <td colspan="7" style="border: 1px solid #cbd5e1; padding: 18px; text-align: center; color: #64748b; font-style: italic;">
            Standard statutory fees assessed for ${app.serviceName || 'Application Services'}. Total: ${formatCurrency(app.totalAmountDue)}
          </td>
        </tr>
      `;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Statement of Account - ${soaNumber}</title>
  <style>
    @media print {
      @page { margin: 12mm 15mm; size: A4 portrait; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #1e293b;
      margin: 0;
      padding: 24px;
      background-color: #ffffff;
      line-height: 1.4;
    }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .header-text { text-align: center; }
    .republic-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 600; }
    .agency-title { font-size: 16px; font-weight: 800; color: #0f172a; letter-spacing: 0.5px; margin-top: 2px; }
    .office-title { font-size: 12px; font-weight: 600; color: #0284c7; }
    .doc-banner {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #ffffff;
      padding: 12px 18px;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .doc-title { font-size: 16px; font-weight: 800; letter-spacing: 0.5px; }
    .doc-ref { font-size: 12px; font-family: monospace; color: #38bdf8; font-weight: 700; }
    .info-grid { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px; }
    .info-title { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
    .info-name { font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 2px; }
    .info-sub { font-size: 11px; color: #475569; }
    .data-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    .th-cell { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px 10px; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #475569; }
    .total-card { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 14px 18px; margin-bottom: 20px; }
    .total-row { display: flex; justify-content: space-between; align-items: center; }
    .total-amount { font-size: 20px; font-weight: 800; color: #0f172a; }
    .total-words { font-size: 11px; font-weight: 600; color: #0284c7; margin-top: 4px; }
    .due-date-badge { display: inline-block; background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
    .guidelines { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 12px 16px; font-size: 10.5px; color: #166534; margin-bottom: 24px; }
    .signatories { display: flex; justify-content: space-between; margin-top: 30px; }
    .sig-block { width: 45%; border-top: 1px solid #94a3b8; padding-top: 6px; text-align: center; }
    .sig-name { font-size: 12px; font-weight: 700; color: #0f172a; text-transform: uppercase; }
    .sig-role { font-size: 10px; color: #64748b; }
    .footer-note { font-size: 9px; color: #94a3b8; text-align: center; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 8px; }
    .print-btn-bar { position: fixed; top: 12px; right: 12px; z-index: 999; }
    .btn-print { background: #0284c7; color: #ffffff; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
  </style>
</head>
<body>
  <div class="print-btn-bar no-print">
    <button class="btn-print" onclick="window.print()">Print Statement of Account</button>
  </div>

  <table class="header-table">
    <tr>
      <td class="header-text">
        <div class="republic-title">Republic of the Philippines</div>
        <div class="agency-title">NATIONAL TELECOMMUNICATIONS COMMISSION</div>
        <div class="office-title">${officeName}</div>
      </td>
    </tr>
  </table>

  <div class="doc-banner">
    <div>
      <div class="doc-title">STATEMENT OF ACCOUNT (SOA)</div>
      <div style="font-size: 10px; opacity: 0.85;">Official Billing Assessment & Regulatory Fee Schedule</div>
    </div>
    <div style="text-align: right;">
      <div class="doc-ref">${soaNumber}</div>
      <div style="font-size: 10px; color: #94a3b8;">Issued: ${currentDate}</div>
    </div>
  </div>

  <table class="info-grid">
    <tr>
      <td style="width: 50%; vertical-align: top; padding-right: 8px;">
        <div class="info-card">
          <div class="info-title">Billed To (Applicant / Payor)</div>
          <div class="info-name">${app.applicant}</div>
          <div class="info-sub"><strong>Type:</strong> ${app.applicantType} • <strong>Contact:</strong> ${app.contactDetails?.contactNumber || 'N/A'}</div>
          <div class="info-sub"><strong>Email:</strong> ${app.contactDetails?.email || 'N/A'}</div>
          <div class="info-sub"><strong>Address:</strong> ${app.address?.streetAddress || app.address?.address || app.address?.city || 'N/A'}</div>
        </div>
      </td>
      <td style="width: 50%; vertical-align: top; padding-left: 8px;">
        <div class="info-card">
          <div class="info-title">Application Reference</div>
          <div class="info-name" style="font-family: monospace; color: #0284c7;">Ref #${app.referenceNumber}</div>
          <div class="info-sub"><strong>Service:</strong> ${app.serviceName}</div>
          <div class="info-sub"><strong>Category:</strong> ${app.category} • <strong>Mode:</strong> ${app.mode}</div>
          <div class="info-sub" style="margin-top: 4px;">
            <strong>Payment Due Date:</strong>
            <span class="due-date-badge">${app.dueDate || '30 days from issuance'}</span>
          </div>
        </div>
      </td>
    </tr>
  </table>

  <table class="data-table">
    <thead>
      <tr>
        <th class="th-cell" style="width: 4%;">#</th>
        <th class="th-cell" style="width: 14%;">Item Code</th>
        <th class="th-cell" style="width: 38%;">Particulars / Description</th>
        <th class="th-cell" style="width: 10%; text-align: center;">Validity</th>
        <th class="th-cell" style="width: 8%; text-align: center;">Units</th>
        <th class="th-cell" style="width: 12%; text-align: right;">Rate (PHP)</th>
        <th class="th-cell" style="width: 14%; text-align: right;">Amount (PHP)</th>
      </tr>
    </thead>
    <tbody>
      ${lineItemsHtml}
    </tbody>
  </table>

  <div class="total-card">
    <div class="total-row">
      <div>
        <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Total Assessment Due</div>
        <div class="total-words">${totalWords}</div>
      </div>
      <div style="text-align: right;">
        <div class="total-amount">${formatCurrency(app.totalAmountDue)}</div>
      </div>
    </div>
  </div>

  <div class="guidelines">
    <div style="font-weight: 700; margin-bottom: 2px;">PAYMENT ADVISORY & GUIDELINES:</div>
    <div>1. Please settle the assessed amount on or before the indicated due date to avoid surcharges or application forfeiture.</div>
    <div>2. Payments may be made via Land Bank of the Philippines, NTC Cashier, or authorized online payment gateways.</div>
    <div>3. Always present this Statement of Account Reference Number (<strong>${soaNumber}</strong>) upon payment.</div>
  </div>

  <div class="signatories">
    <div class="sig-block">
      <div class="sig-name">${preparerName || 'Assessing Officer / Evaluator'}</div>
      <div class="sig-role">Assessed & Prepared By</div>
    </div>
    <div class="sig-block">
      <div class="sig-name">${approverName || 'Chief, Enforcement & Operations Division'}</div>
      <div class="sig-role">Noted & Certified Correct</div>
    </div>
  </div>

  <div class="footer-note">
    This is an official system-generated billing record issued by the National Telecommunications Commission (NTC-EDGE).
    Governed by RA 11032 (Ease of Doing Business Act) and Commission guidelines.
  </div>
</body>
</html>
  `;
}

export function generateOpPrintableHtml(
  app: ApplicationData,
  tenantName?: string,
  cashierName?: string
): string {
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const opNumber = `OP-${app.referenceNumber ?? app.id.slice(0, 8).toUpperCase()}`;
  const totalWords = numberToWords(app.totalAmountDue);
  const officeName = app.assignedTo || app.office || tenantName || 'National Telecommunications Commission';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order of Payment - ${opNumber}</title>
  <style>
    @media print {
      @page { margin: 12mm 15mm; size: A4 portrait; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #1e293b;
      margin: 0;
      padding: 24px;
      background-color: #ffffff;
      line-height: 1.4;
    }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .header-text { text-align: center; }
    .republic-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 600; }
    .agency-title { font-size: 16px; font-weight: 800; color: #0f172a; letter-spacing: 0.5px; margin-top: 2px; }
    .office-title { font-size: 12px; font-weight: 600; color: #059669; }
    .doc-banner {
      background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
      color: #ffffff;
      padding: 12px 18px;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .doc-title { font-size: 16px; font-weight: 800; letter-spacing: 0.5px; }
    .doc-ref { font-size: 12px; font-family: monospace; color: #6ee7b7; font-weight: 700; }
    .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; margin-bottom: 16px; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
    .info-label { font-size: 11px; color: #64748b; font-weight: 600; }
    .info-val { font-size: 12px; color: #0f172a; font-weight: 700; }
    .data-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    .th-cell { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px 10px; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #475569; }
    .td-cell { border: 1px solid #cbd5e1; padding: 10px 12px; font-size: 11px; }
    .payment-box { background: #f0fdf4; border: 1px solid #86efac; border-radius: 6px; padding: 14px 18px; margin-bottom: 24px; }
    .signatories { display: flex; justify-content: space-between; margin-top: 30px; }
    .sig-block { width: 45%; border-top: 1px solid #94a3b8; padding-top: 6px; text-align: center; }
    .sig-name { font-size: 12px; font-weight: 700; color: #0f172a; text-transform: uppercase; }
    .sig-role { font-size: 10px; color: #64748b; }
    .footer-note { font-size: 9px; color: #94a3b8; text-align: center; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 8px; }
    .print-btn-bar { position: fixed; top: 12px; right: 12px; z-index: 999; }
    .btn-print { background: #059669; color: #ffffff; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
  </style>
</head>
<body>
  <div class="print-btn-bar no-print">
    <button class="btn-print" onclick="window.print()">Print Order of Payment</button>
  </div>

  <table class="header-table">
    <tr>
      <td class="header-text">
        <div class="republic-title">Republic of the Philippines</div>
        <div class="agency-title">NATIONAL TELECOMMUNICATIONS COMMISSION</div>
        <div class="office-title">${officeName}</div>
      </td>
    </tr>
  </table>

  <div class="doc-banner">
    <div>
      <div class="doc-title">ORDER OF PAYMENT (OP)</div>
      <div style="font-size: 10px; opacity: 0.85;">Official Treasury & Cashier Payment Authorization</div>
    </div>
    <div style="text-align: right;">
      <div class="doc-ref">${opNumber}</div>
      <div style="font-size: 10px; color: #d1fae5;">Date: ${currentDate}</div>
    </div>
  </div>

  <div class="info-card">
    <div class="info-row">
      <span class="info-label">Payor / Applicant Name:</span>
      <span class="info-val">${app.applicant}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Application Reference:</span>
      <span class="info-val" style="font-family: monospace; color: #059669;">Ref #${app.referenceNumber}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Service & Category:</span>
      <span class="info-val">${app.serviceName} (${app.category})</span>
    </div>
    <div class="info-row">
      <span class="info-label">Filing Mode:</span>
      <span class="info-val">${app.mode} Application</span>
    </div>
  </div>

  <table class="data-table">
    <thead>
      <tr>
        <th class="th-cell" style="width: 8%;">#</th>
        <th class="th-cell" style="width: 60%;">Nature of Collection / Particulars</th>
        <th class="th-cell" style="width: 32%; text-align: right;">Amount (PHP)</th>
      </tr>
    </thead>
    <tbody>
      ${
        app.soaItems.length > 0
          ? app.soaItems
              .map(
                (item, idx) => `
            <tr>
              <td class="td-cell" style="text-align: center;">${idx + 1}</td>
              <td class="td-cell">
                <strong>${item.particular}</strong> (${item.code || 'NTC-FEE'})
              </td>
              <td class="td-cell" style="text-align: right; font-weight: 700;">${formatCurrency(item.amount)}</td>
            </tr>
          `
              )
              .join('')
          : `
            <tr>
              <td class="td-cell" style="text-align: center;">1</td>
              <td class="td-cell"><strong>${app.serviceName} Processing & Regulatory Fees</strong></td>
              <td class="td-cell" style="text-align: right; font-weight: 700;">${formatCurrency(app.totalAmountDue)}</td>
            </tr>
          `
      }
      <tr style="background: #f8fafc;">
        <td colspan="2" class="td-cell" style="font-weight: 800; text-align: right; text-transform: uppercase;">Total Amount Payable:</td>
        <td class="td-cell" style="text-align: right; font-weight: 800; font-size: 13px; color: #059669;">${formatCurrency(app.totalAmountDue)}</td>
      </tr>
    </tbody>
  </table>

  <div class="payment-box">
    <div style="font-weight: 700; color: #065f46; margin-bottom: 4px;">AMOUNT IN WORDS:</div>
    <div style="font-size: 11px; font-weight: 600; color: #047857;">${totalWords}</div>
    <div style="margin-top: 8px; font-size: 10.5px; color: #065f46;">
      <strong>Payment Status:</strong> ${app.payment.orNumber ? `Paid via OR #${app.payment.orNumber}` : 'Pending Cashier Collection'}
    </div>
  </div>

  <div class="signatories">
    <div class="sig-block">
      <div class="sig-name">Accountant / Collecting Officer</div>
      <div class="sig-role">Authorized Assessment Officer</div>
    </div>
    <div class="sig-block">
      <div class="sig-name">${cashierName || 'Special Collecting Officer / Cashier'}</div>
      <div class="sig-role">Collecting Cashier</div>
    </div>
  </div>

  <div class="footer-note">
    National Telecommunications Commission • Order of Payment Generated via NTC-EDGE Digital Portal.
  </div>
</body>
</html>
  `;
}

export function generateFullApplicationSummaryHtml(app: ApplicationData, tenantName?: string): string {
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const auditHistoryHtml =
    app.history && app.history.length > 0
      ? app.history
          .map(
            (h, i) => `
        <tr>
          <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 10px; text-align: center;">${i + 1}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 10px; font-weight: 600;">${h.action}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 10px;">${h.staff}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 10px; color: #64748b;">${h.timestamp}</td>
        </tr>
      `
          )
          .join('')
      : `<tr><td colspan="4" style="padding: 12px; text-align: center; color: #64748b;">No audit history recorded.</td></tr>`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Application Report - Ref #${app.referenceNumber}</title>
  <style>
    @media print {
      @page { margin: 12mm 15mm; size: A4 portrait; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #1e293b;
      margin: 0;
      padding: 24px;
      background-color: #ffffff;
      line-height: 1.4;
    }
    .header-title { font-size: 16px; font-weight: 800; color: #0f172a; text-align: center; margin-bottom: 2px; }
    .sub-header { font-size: 11px; color: #64748b; text-align: center; margin-bottom: 18px; text-transform: uppercase; letter-spacing: 0.5px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px; margin-bottom: 14px; }
    .card-title { font-size: 11px; font-weight: 700; color: #0284c7; text-transform: uppercase; margin-bottom: 6px; }
    .grid-2 { display: flex; gap: 12px; }
    .grid-col { flex: 1; font-size: 11px; }
    .table { width: 100%; border-collapse: collapse; margin-top: 6px; }
    .th { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #475569; }
    .print-btn-bar { position: fixed; top: 12px; right: 12px; z-index: 999; }
    .btn-print { background: #0f172a; color: #ffffff; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; cursor: pointer; }
  </style>
</head>
<body>
  <div class="print-btn-bar no-print">
    <button class="btn-print" onclick="window.print()">Print Full Report</button>
  </div>

  <div class="header-title">NATIONAL TELECOMMUNICATIONS COMMISSION</div>
  <div class="sub-header">Application Dossier &amp; Evaluation Summary • ${tenantName || 'Regional Office'}</div>

  <div class="card">
    <div class="card-title">1. Application Identification</div>
    <div class="grid-2">
      <div class="grid-col">
        <div><strong>Reference Number:</strong> ${app.referenceNumber}</div>
        <div><strong>Application Number:</strong> ${app.applicationNumber || 'Pending'}</div>
        <div><strong>Service:</strong> ${app.serviceName}</div>
      </div>
      <div class="grid-col">
        <div><strong>Category / Mode:</strong> ${app.category} • ${app.mode}</div>
        <div><strong>Status:</strong> ${app.status}</div>
        <div><strong>Assigned Office:</strong> ${app.assignedTo || app.office || 'Main Office'}</div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-title">2. Applicant &amp; Entity Profile</div>
    <div class="grid-2">
      <div class="grid-col">
        <div><strong>Applicant Name:</strong> ${app.applicant}</div>
        <div><strong>Type:</strong> ${app.applicantType}</div>
        <div><strong>Contact:</strong> ${app.contactDetails?.contactNumber || 'N/A'} • ${app.contactDetails?.email || 'N/A'}</div>
      </div>
      <div class="grid-col">
        <div><strong>Address:</strong> ${app.address?.streetAddress || app.address?.address || 'N/A'}</div>
        <div><strong>Civil Status / Nationality:</strong> ${app.basicInfo?.civilStatus || 'N/A'} • ${app.basicInfo?.nationality || 'Filipino'}</div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-title">3. Statement of Account &amp; Fee Assessment</div>
    <div style="font-size: 11px; margin-bottom: 4px;">
      <strong>Total Assessed:</strong> ${formatCurrency(app.totalAmountDue)} • <strong>Due Date:</strong> ${app.dueDate || 'N/A'}
    </div>
    <table class="table">
      <thead>
        <tr>
          <th class="th">Particular</th>
          <th class="th">Code</th>
          <th class="th" style="text-align: center;">Validity</th>
          <th class="th" style="text-align: center;">Units</th>
          <th class="th" style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${
          app.soaItems.length > 0
            ? app.soaItems
                .map(
                  (item) => `
              <tr>
                <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 10px;">${item.particular}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 10px;">${item.code}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 10px; text-align: center;">${item.validityYears}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 10px; text-align: center;">${item.noOfUnits}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 10px; text-align: right; font-weight: 600;">${formatCurrency(item.amount)}</td>
              </tr>
            `
                )
                .join('')
            : `<tr><td colspan="5" style="padding: 6px; text-align: center; color: #64748b; font-size: 10px;">Standard service fees: ${formatCurrency(app.totalAmountDue)}</td></tr>`
        }
      </tbody>
    </table>
  </div>

  <div class="card">
    <div class="card-title">4. Application Process &amp; Audit Trail</div>
    <table class="table">
      <thead>
        <tr>
          <th class="th" style="width: 5%;">#</th>
          <th class="th" style="width: 45%;">Action / State Event</th>
          <th class="th" style="width: 25%;">Officer / Submitter</th>
          <th class="th" style="width: 25%;">Timestamp</th>
        </tr>
      </thead>
      <tbody>
        ${auditHistoryHtml}
      </tbody>
    </table>
  </div>

  <div style="text-align: center; font-size: 9px; color: #94a3b8; margin-top: 18px;">
    Generated on ${currentDate} via NTC-EDGE Digital Portal. Governed by RA 11032.
  </div>
</body>
</html>
  `;
}

export function openPrintableDocumentWindow(htmlContent: string): void {
  if (typeof window !== 'undefined') {
    const printWindow = window.open('', '_blank');
    if (printWindow !== null) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  }
}
