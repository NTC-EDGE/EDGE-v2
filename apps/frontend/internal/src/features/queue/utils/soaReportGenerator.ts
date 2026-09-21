import { ApplicationData } from '../../../types/application';

function safeString(val: unknown, fallback = 'N/A'): string {
  if (val === null || val === undefined) return fallback;
  const str = String(val).trim();
  return str.length > 0 ? str : fallback;
}

function formatAddress(app: ApplicationData): string {
  if (!app.address) return 'N/A';
  const parts = [
    app.address.streetAddress || app.address.address,
    app.address.barangay,
    app.address.city,
    app.address.province,
    app.address.region,
    app.address.zipCode,
  ].filter((p): p is string => Boolean(p && typeof p === 'string' && p.trim() !== ''));
  return parts.length > 0 ? parts.join(', ') : 'N/A';
}

function formatCurrency(amount?: number | null): string {
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return `PHP ${safeAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function numberToWords(num?: number | null): string {
  const safeNum = typeof num === 'number' && !isNaN(num) && num >= 0 ? num : 0;
  const a = [
    '', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ',
    'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen ',
  ];
  const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  const n = Math.floor(safeNum);
  if (n === 0) return 'ZERO PESOS ONLY';

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

  const cents = Math.round((safeNum - n) * 100);
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

  const refNum = safeString(app.referenceNumber, app.id ? app.id.slice(0, 8).toUpperCase() : 'NTC-REF');
  const soaNumber = `SOA-${refNum}`;
  const totalWords = numberToWords(app.totalAmountDue);
  const officeName = safeString(app.assignedTo || app.office || tenantName, 'National Telecommunications Commission');
  const applicantName = safeString(app.applicant, 'Applicant');
  const applicantType = safeString(app.applicantType, 'Individual');
  const contactNum = safeString(app.contactDetails?.contactNumber, 'N/A');
  const emailAddr = safeString(app.contactDetails?.email, 'N/A');
  const formattedAddr = formatAddress(app);
  const serviceName = safeString(app.serviceName, 'Application Services');
  const categoryName = safeString(app.category, 'General');
  const filingMode = safeString(app.mode, 'Single');
  const dueDateStr = safeString(app.dueDate, '30 days from issuance');

  const soaItemsList = Array.isArray(app.soaItems) ? app.soaItems : [];
  const lineItemsHtml =
    soaItemsList.length > 0
      ? soaItemsList
          .map((item, index) => {
            const itemCode = safeString(item.code, 'NTC-FEE');
            const itemParticular = safeString(item.particular, 'Statutory Regulatory Fee');
            const validityYears = typeof item.validityYears === 'number' && item.validityYears > 0 ? item.validityYears : 1;
            const noOfUnits = typeof item.noOfUnits === 'number' && item.noOfUnits > 0 ? item.noOfUnits : 1;
            const fees = typeof item.fees === 'number' && !isNaN(item.fees) ? item.fees : 0;
            const amount = typeof item.amount === 'number' && !isNaN(item.amount) ? item.amount : fees * noOfUnits;

            return `
        <tr>
          <td style="border: 1px solid #cbd5e1; padding: 10px 8px; font-size: 11px; text-align: center;">${index + 1}</td>
          <td style="border: 1px solid #cbd5e1; padding: 10px 12px; font-size: 11px; font-family: monospace; color: #0284c7;">${itemCode}</td>
          <td style="border: 1px solid #cbd5e1; padding: 10px 12px; font-size: 11px;">
            <div style="font-weight: 600; color: #0f172a;">${itemParticular}</div>
            <div style="font-size: 10px; color: #64748b;">Validity: ${validityYears} Year(s)</div>
          </td>
          <td style="border: 1px solid #cbd5e1; padding: 10px 12px; font-size: 11px; text-align: center;">${validityYears}</td>
          <td style="border: 1px solid #cbd5e1; padding: 10px 12px; font-size: 11px; text-align: center;">${noOfUnits}</td>
          <td style="border: 1px solid #cbd5e1; padding: 10px 12px; font-size: 11px; text-align: right;">${formatCurrency(fees)}</td>
          <td style="border: 1px solid #cbd5e1; padding: 10px 12px; font-size: 11px; text-align: right; font-weight: 700; color: #0f172a;">${formatCurrency(amount)}</td>
        </tr>
      `;
          })
          .join('')
      : `
        <tr>
          <td colspan="7" style="border: 1px solid #cbd5e1; padding: 18px; text-align: center; color: #64748b; font-style: italic;">
            Standard statutory fees assessed for ${serviceName}. Total: ${formatCurrency(app.totalAmountDue)}
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
          <div class="info-name">${applicantName}</div>
          <div class="info-sub"><strong>Type:</strong> ${applicantType} • <strong>Contact:</strong> ${contactNum}</div>
          <div class="info-sub"><strong>Email:</strong> ${emailAddr}</div>
          <div class="info-sub"><strong>Address:</strong> ${formattedAddr}</div>
        </div>
      </td>
      <td style="width: 50%; vertical-align: top; padding-left: 8px;">
        <div class="info-card">
          <div class="info-title">Application Reference</div>
          <div class="info-name" style="font-family: monospace; color: #0284c7;">Ref #${refNum}</div>
          <div class="info-sub"><strong>Service:</strong> ${serviceName}</div>
          <div class="info-sub"><strong>Category:</strong> ${categoryName} • <strong>Mode:</strong> ${filingMode}</div>
          <div class="info-sub" style="margin-top: 4px;">
            <strong>Payment Due Date:</strong>
            <span class="due-date-badge">${dueDateStr}</span>
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
      <div class="sig-name">${safeString(preparerName, 'Assessing Officer / Evaluator')}</div>
      <div class="sig-role">Assessed & Prepared By</div>
    </div>
    <div class="sig-block">
      <div class="sig-name">${safeString(approverName, 'Chief, Enforcement & Operations Division')}</div>
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

  const refNum = safeString(app.referenceNumber, app.id ? app.id.slice(0, 8).toUpperCase() : 'NTC-REF');
  const opNumber = `OP-${refNum}`;
  const totalWords = numberToWords(app.totalAmountDue);
  const officeName = safeString(app.assignedTo || app.office || tenantName, 'National Telecommunications Commission');
  const applicantName = safeString(app.applicant, 'Applicant');
  const serviceName = safeString(app.serviceName, 'Application Services');
  const categoryName = safeString(app.category, 'General');
  const filingMode = safeString(app.mode, 'Single');
  const orNumber = app.payment?.orNumber;

  const soaItemsList = Array.isArray(app.soaItems) ? app.soaItems : [];
  const lineItemsHtml =
    soaItemsList.length > 0
      ? soaItemsList
          .map((item, idx) => {
            const itemParticular = safeString(item.particular, 'Regulatory Fee Assessment');
            const itemCode = safeString(item.code, 'NTC-FEE');
            const amount = typeof item.amount === 'number' && !isNaN(item.amount) ? item.amount : 0;
            return `
            <tr>
              <td class="td-cell" style="text-align: center;">${idx + 1}</td>
              <td class="td-cell">
                <strong>${itemParticular}</strong> (${itemCode})
              </td>
              <td class="td-cell" style="text-align: right; font-weight: 700;">${formatCurrency(amount)}</td>
            </tr>
          `;
          })
          .join('')
      : `
        <tr>
          <td class="td-cell" style="text-align: center;">1</td>
          <td class="td-cell"><strong>${serviceName} Processing & Regulatory Fees</strong></td>
          <td class="td-cell" style="text-align: right; font-weight: 700;">${formatCurrency(app.totalAmountDue)}</td>
        </tr>
      `;

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
      <span class="info-val">${applicantName}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Application Reference:</span>
      <span class="info-val" style="font-family: monospace; color: #059669;">Ref #${refNum}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Service & Category:</span>
      <span class="info-val">${serviceName} (${categoryName})</span>
    </div>
    <div class="info-row">
      <span class="info-label">Filing Mode:</span>
      <span class="info-val">${filingMode} Application</span>
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
      ${lineItemsHtml}
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
      <strong>Payment Status:</strong> ${orNumber ? `Paid via OR #${orNumber}` : 'Pending Cashier Collection'}
    </div>
  </div>

  <div class="signatories">
    <div class="sig-block">
      <div class="sig-name">Accountant / Collecting Officer</div>
      <div class="sig-role">Authorized Assessment Officer</div>
    </div>
    <div class="sig-block">
      <div class="sig-name">${safeString(cashierName, 'Special Collecting Officer / Cashier')}</div>
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

  const refNum = safeString(app.referenceNumber, app.id ? app.id.slice(0, 8).toUpperCase() : 'NTC-REF');
  const appNum = safeString(app.applicationNumber, 'Pending');
  const applicantName = safeString(app.applicant, 'Applicant');
  const applicantType = safeString(app.applicantType, 'Individual');
  const contactNum = safeString(app.contactDetails?.contactNumber, 'N/A');
  const emailAddr = safeString(app.contactDetails?.email, 'N/A');
  const formattedAddr = formatAddress(app);
  const civilStatus = safeString(app.basicInfo?.civilStatus, 'N/A');
  const nationality = safeString(app.basicInfo?.nationality, 'Filipino');
  const serviceName = safeString(app.serviceName, 'NTC Service Application');
  const categoryName = safeString(app.category, 'General');
  const filingMode = safeString(app.mode, 'Single');
  const appStatus = safeString(app.status, 'Submitted');
  const assignedOffice = safeString(app.assignedTo || app.office || tenantName, 'Main Office');
  const dueDateStr = safeString(app.dueDate, 'N/A');

  const historyList = Array.isArray(app.history) ? app.history : [];
  const auditHistoryHtml =
    historyList.length > 0
      ? historyList
          .map(
            (h, i) => `
        <tr>
          <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 10px; text-align: center;">${i + 1}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 10px; font-weight: 600;">${safeString(h.action, 'Event')}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 10px;">${safeString(h.staff, 'System')}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 10px; color: #64748b;">${safeString(h.timestamp, '')}</td>
        </tr>
      `
          )
          .join('')
      : `<tr><td colspan="4" style="padding: 12px; text-align: center; color: #64748b;">No audit history recorded.</td></tr>`;

  const soaItemsList = Array.isArray(app.soaItems) ? app.soaItems : [];
  const soaRowsHtml =
    soaItemsList.length > 0
      ? soaItemsList
          .map((item) => {
            const particular = safeString(item.particular, 'Fee Item');
            const code = safeString(item.code, 'NTC-FEE');
            const validityYears = typeof item.validityYears === 'number' && item.validityYears > 0 ? item.validityYears : 1;
            const noOfUnits = typeof item.noOfUnits === 'number' && item.noOfUnits > 0 ? item.noOfUnits : 1;
            const amount = typeof item.amount === 'number' && !isNaN(item.amount) ? item.amount : 0;

            return `
              <tr>
                <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 10px;">${particular}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 10px;">${code}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 10px; text-align: center;">${validityYears}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 10px; text-align: center;">${noOfUnits}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 10px; text-align: right; font-weight: 600;">${formatCurrency(amount)}</td>
              </tr>
            `;
          })
          .join('')
      : `<tr><td colspan="5" style="padding: 6px; text-align: center; color: #64748b; font-size: 10px;">Standard service fees: ${formatCurrency(app.totalAmountDue)}</td></tr>`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Application Report - Ref #${refNum}</title>
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
  <div class="sub-header">Application Dossier &amp; Evaluation Summary • ${safeString(tenantName, 'Regional Office')}</div>

  <div class="card">
    <div class="card-title">1. Application Identification</div>
    <div class="grid-2">
      <div class="grid-col">
        <div><strong>Reference Number:</strong> ${refNum}</div>
        <div><strong>Application Number:</strong> ${appNum}</div>
        <div><strong>Service:</strong> ${serviceName}</div>
      </div>
      <div class="grid-col">
        <div><strong>Category / Mode:</strong> ${categoryName} • ${filingMode}</div>
        <div><strong>Status:</strong> ${appStatus}</div>
        <div><strong>Assigned Office:</strong> ${assignedOffice}</div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-title">2. Applicant &amp; Entity Profile</div>
    <div class="grid-2">
      <div class="grid-col">
        <div><strong>Applicant Name:</strong> ${applicantName}</div>
        <div><strong>Type:</strong> ${applicantType}</div>
        <div><strong>Contact:</strong> ${contactNum} • ${emailAddr}</div>
      </div>
      <div class="grid-col">
        <div><strong>Address:</strong> ${formattedAddr}</div>
        <div><strong>Civil Status / Nationality:</strong> ${civilStatus} • ${nationality}</div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-title">3. Statement of Account &amp; Fee Assessment</div>
    <div style="font-size: 11px; margin-bottom: 4px;">
      <strong>Total Assessed:</strong> ${formatCurrency(app.totalAmountDue)} • <strong>Due Date:</strong> ${dueDateStr}
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
        ${soaRowsHtml}
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
