import { Application, SoaLineItem } from '../data/applicationsData';

function safeString(val: unknown, fallback = 'N/A'): string {
  if (val === null || val === undefined) return fallback;
  const str = String(val).trim();
  return str.length > 0 ? str : fallback;
}

export function formatAddress(app: Application): string {
  const parts = [
    app.streetAddress,
    app.barangay,
    app.cityMunicipality,
    app.province,
    app.region,
    app.zipCode,
  ].filter((p): p is string => Boolean(p && typeof p === 'string' && p.trim() !== ''));
  return parts.length > 0 ? parts.join(', ') : 'N/A';
}

export function formatCurrency(amount?: number | null): string {
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return `PHP ${safeAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function numberToWords(num?: number | null): string {
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

export function getEffectiveApplicantName(app: Application): string {
  if (app.mode === 'BULK') {
    return safeString(app.companyName, 'Bulk Corporate Applicant');
  }
  return safeString(app.applicantName, 'Applicant');
}

function deduplicateLineItems(items: SoaLineItem[]): SoaLineItem[] {
  const seen = new Set<string>();
  const result: SoaLineItem[] = [];
  for (const item of items) {
    const key = `${item.itemCode || ''}_${item.particular || ''}_${item.amount}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  return result;
}

export function getEffectiveLineItems(app: Application): SoaLineItem[] {
  if (Array.isArray(app.soaItems) && app.soaItems.length > 0) {
    return deduplicateLineItems(app.soaItems);
  }
  if (app.soa && Array.isArray(app.soa.lineItems) && app.soa.lineItems.length > 0) {
    return deduplicateLineItems(app.soa.lineItems);
  }
  const units = app.mode === 'BULK' ? (app.applicants?.length || 1) : 1;
  const svcLower = (app.serviceName || '').toLowerCase();
  const catLower = (app.serviceCategory || '').toLowerCase();
  const isExam = catLower.includes('exam') || svcLower.includes('exam') || svcLower.includes('admission');

  if (isExam) {
    const examFee = 50;
    return [
      {
        id: 'fee-exam-1',
        particular: 'Examination Fee',
        itemCode: '4-02-01-030',
        validityYears: 1,
        noOfUnits: units,
        feeRate: examFee,
        amount: examFee * units,
      },
    ];
  }

  const filingFee = 180;
  const permitFee = 1200;
  return [
    {
      id: 'fee-filing-1',
      particular: 'Filing & Processing Fee',
      itemCode: 'NTC-FF-01',
      validityYears: 1,
      noOfUnits: units,
      feeRate: filingFee,
      amount: filingFee * units,
    },
    {
      id: 'fee-regulatory-2',
      particular: `${safeString(app.serviceName, 'Permit / License')} Statutory Fee`,
      itemCode: 'NTC-RF-02',
      validityYears: 1,
      noOfUnits: units,
      feeRate: permitFee,
      amount: permitFee * units,
    },
  ];
}

export function getEffectiveTotalAmount(app: Application): number {
  if (typeof app.totalAmountDue === 'number' && app.totalAmountDue > 0) {
    return app.totalAmountDue;
  }
  if (app.soa && typeof app.soa.totalAmount === 'number' && app.soa.totalAmount > 0) {
    return app.soa.totalAmount;
  }
  if (app.op && typeof app.op.amountDue === 'number' && app.op.amountDue > 0) {
    return app.op.amountDue;
  }
  const items = getEffectiveLineItems(app);
  if (items.length > 0) {
    return items.reduce((sum, item) => sum + (typeof item.amount === 'number' ? item.amount : 0), 0);
  }
  const svcLower = (app.serviceName || '').toLowerCase();
  const catLower = (app.serviceCategory || '').toLowerCase();
  const isExam = catLower.includes('exam') || svcLower.includes('exam') || svcLower.includes('admission');
  return isExam ? 50 : 1380;
}

export function generateSoaPrintableHtml(
  app: Application,
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
  const soaNumber = app.soaNumber || `SOA-${refNum}`;
  const totalAmount = getEffectiveTotalAmount(app);
  const totalWords = numberToWords(totalAmount);
  const officeName = safeString(app.office || tenantName, 'National Telecommunications Commission');
  const applicantName = getEffectiveApplicantName(app);
  const applicantType = app.mode === 'BULK' ? 'Corporate / Bulk Entity' : 'Individual';
  const contactNum = safeString(app.mobileNumber, 'N/A');
  const emailAddr = safeString(app.email, 'N/A');
  const formattedAddr = formatAddress(app);
  const serviceName = safeString(app.serviceName, 'Application Services');
  const categoryName = safeString(app.serviceCategory, 'General');
  const filingMode = safeString(app.mode, 'Single');
  const dueDateStr = safeString(
    app.dueDate ? new Date(app.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : undefined,
    '30 days from issuance'
  );

  const effectivePreparer = safeString(
    preparerName || app.soa?.preparedByName || app.evaluatingOfficer,
    'Assessing Officer / Evaluator'
  );
  const effectivePreparerTitle = safeString(
    app.soa?.preparedByTitle,
    'Assessed & Prepared By'
  );
  const effectiveApprover = safeString(
    approverName || app.soa?.approvedByName || app.issuingOfficer,
    'Chief, Enforcement & Operations Division'
  );
  const effectiveApproverTitle = safeString(
    app.soa?.approvedByTitle,
    'Noted & Certified Correct'
  );

  const soaItemsList = getEffectiveLineItems(app);
  const lineItemsHtml = soaItemsList
    .map((item, index) => {
      const itemCode = safeString(item.itemCode, 'NTC-FEE');
      const itemParticular = safeString(item.particular, 'Statutory Regulatory Fee');
      const validityYears = typeof item.validityYears === 'number' && item.validityYears > 0 ? item.validityYears : 1;
      const noOfUnits = typeof item.noOfUnits === 'number' && item.noOfUnits > 0 ? item.noOfUnits : 1;
      const feeRate = typeof item.feeRate === 'number' && !isNaN(item.feeRate) ? item.feeRate : (item.amount / noOfUnits);
      const amount = typeof item.amount === 'number' && !isNaN(item.amount) ? item.amount : feeRate * noOfUnits;

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
          <td style="border: 1px solid #cbd5e1; padding: 10px 12px; font-size: 11px; text-align: right;">${formatCurrency(feeRate)}</td>
          <td style="border: 1px solid #cbd5e1; padding: 10px 12px; font-size: 11px; text-align: right; font-weight: 700; color: #0f172a;">${formatCurrency(amount)}</td>
        </tr>
      `;
    })
    .join('');

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
    .info-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px; }
    .info-title { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
    .info-name { font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 2px; }
    .info-sub { font-size: 11px; color: #475569; }
    .data-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    .th-cell { background: #ffffff; border: 1px solid #cbd5e1; padding: 8px 10px; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #475569; }
    .total-card { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 14px 18px; margin-bottom: 20px; }
    .total-row { display: flex; justify-content: space-between; align-items: center; }
    .total-amount { font-size: 20px; font-weight: 800; color: #0f172a; }
    .total-words { font-size: 11px; font-weight: 600; color: #0284c7; margin-top: 4px; }
    .due-date-badge { display: inline-block; background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
    .guidelines { background: #ffffff; border: 1px solid #bbf7d0; border-radius: 6px; padding: 12px 16px; font-size: 10.5px; color: #166534; margin-bottom: 24px; }
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
      <div style="font-size: 10px; opacity: 0.85;">Official Billing Assessment &amp; Regulatory Fee Schedule</div>
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
        <div class="total-amount">${formatCurrency(totalAmount)}</div>
      </div>
    </div>
  </div>

  <div class="guidelines">
    <div style="font-weight: 700; margin-bottom: 2px;">PAYMENT ADVISORY &amp; GUIDELINES:</div>
    <div>1. Please settle the assessed amount on or before the indicated due date to avoid surcharges or application forfeiture.</div>
    <div>2. Payments may be made via Land Bank of the Philippines, NTC Regional Cashier, or authorized online payment gateways.</div>
    <div>3. Always present this Statement of Account Reference Number (<strong>${soaNumber}</strong>) upon payment.</div>
  </div>

  <div class="signatories">
    <div class="sig-block">
      <div class="sig-name">${effectivePreparer}</div>
      <div class="sig-role">${effectivePreparerTitle}</div>
    </div>
    <div class="sig-block">
      <div class="sig-name">${effectiveApprover}</div>
      <div class="sig-role">${effectiveApproverTitle}</div>
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
  app: Application,
  tenantName?: string,
  cashierName?: string
): string {
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const refNum = safeString(app.referenceNumber, app.id ? app.id.slice(0, 8).toUpperCase() : 'NTC-REF');
  const opNumber = app.opNumber || `OP-${refNum}`;
  const totalAmount = getEffectiveTotalAmount(app);
  const totalWords = numberToWords(totalAmount);
  const officeName = safeString(app.office || tenantName, 'National Telecommunications Commission');
  const applicantName = getEffectiveApplicantName(app);
  const serviceName = safeString(app.serviceName, 'Application Services');
  const categoryName = safeString(app.serviceCategory, 'General');
  const filingMode = safeString(app.mode, 'Single');
  const orNumber = app.op?.officialReceiptNumber;

  const soaItemsList = getEffectiveLineItems(app);
  const lineItemsHtml = soaItemsList
    .map((item, idx) => {
      const itemParticular = safeString(item.particular, 'Regulatory Fee Assessment');
      const itemCode = safeString(item.itemCode, 'NTC-FEE');
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
    .join('');

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
    .info-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; margin-bottom: 16px; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
    .info-label { font-size: 11px; color: #64748b; font-weight: 600; }
    .info-val { font-size: 12px; color: #0f172a; font-weight: 700; }
    .data-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    .th-cell { background: #ffffff; border: 1px solid #cbd5e1; padding: 8px 10px; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #475569; }
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
      <div style="font-size: 10px; opacity: 0.85;">Official Treasury &amp; Cashier Payment Authorization</div>
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
      <span class="info-label">Service &amp; Category:</span>
      <span class="info-val">${categoryName && categoryName !== serviceName && categoryName !== 'General' ? `${serviceName} (${categoryName})` : serviceName}</span>
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
      <tr style="background: #ffffff;">
        <td colspan="2" class="td-cell" style="font-weight: 800; text-align: right; text-transform: uppercase;">Total Amount Payable:</td>
        <td class="td-cell" style="text-align: right; font-weight: 800; font-size: 13px; color: #059669;">${formatCurrency(totalAmount)}</td>
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

export function generateOrPrintableHtml(app: Application): string {
  const applicantName = getEffectiveApplicantName(app);
  const refNum = safeString(app.referenceNumber, app.id ? app.id.slice(0, 8).toUpperCase() : 'NTC-REF');
  const orNumber = safeString(app.officialReceiptNumber || app.op?.officialReceiptNumber, `OR-${refNum}`);
  const opNumber = safeString(app.opNumber || app.op?.opNumber, `OP-${refNum}`);
  const officeName = safeString(app.office, 'NTC Regional Office');
  const formattedAddress = formatAddress(app);
  const lineItems = getEffectiveLineItems(app);
  const totalAmount = app.amountPaid !== undefined && app.amountPaid !== null
    ? app.amountPaid
    : (app.op?.amountReceived !== undefined && app.op.amountReceived > 0
        ? app.op.amountReceived
        : getEffectiveTotalAmount(app));
  const totalWords = numberToWords(totalAmount);

  const rawPaidAt = app.paidAt || app.op?.paidAt;
  let formattedDate = 'N/A';
  if (rawPaidAt) {
    try {
      const d = new Date(rawPaidAt);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
      }
    } catch {
      formattedDate = rawPaidAt;
    }
  } else {
    formattedDate = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  const tableRowsHtml = lineItems.map((item) => {
    const units = typeof item.noOfUnits === 'number' && item.noOfUnits > 0 ? item.noOfUnits : 1;
    const rate = typeof item.feeRate === 'number' && !isNaN(item.feeRate) ? item.feeRate : (item.amount / units);
    const amount = typeof item.amount === 'number' && !isNaN(item.amount) ? item.amount : rate * units;
    return `
      <tr>
        <td style="padding: 6px 8px; border-bottom: 0.5pt solid #cbd5e1; font-size: 8.5pt;">${item.particular}</td>
        <td style="padding: 6px 8px; border-bottom: 0.5pt solid #cbd5e1; font-size: 8.5pt; font-family: monospace; text-align: center;">${item.itemCode || 'NTC-FEE'}</td>
        <td style="padding: 6px 8px; border-bottom: 0.5pt solid #cbd5e1; font-size: 9pt; font-weight: bold; text-align: right;">${formatCurrency(amount).replace('PHP ', '')}</td>
      </tr>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Official Receipt - ${orNumber}</title>
  <style>
    @page {
      size: 139.7mm 215.9mm;
      margin: 0;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      width: 139.7mm;
      min-height: 215.9mm;
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
      min-height: calc(215.9mm - 16mm);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
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
      background: #ffffff;
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
      background: #ffffff;
      border-bottom: 0.8pt solid #0f172a;
      padding: 4px 6px;
      font-size: 8pt;
      font-weight: bold;
      text-align: left;
    }
    .total-row td {
      border-top: 1pt solid #0f172a;
      background: #ffffff;
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
    <div>
      <div class="republic-title">Republic of the Philippines</div>
      <div class="agency-title">NATIONAL TELECOMMUNICATIONS COMMISSION</div>
      <div class="form-title">OFFICIAL RECEIPT</div>
      <div class="form-code">Accountable Form No. 51 (Revised 2006)</div>

      <div class="meta-bar">
        <div><strong>DATE:</strong> ${formattedDate}</div>
        <div><strong>No.</strong> <span class="or-no">${orNumber}</span></div>
      </div>

      <div class="payor-card">
        <div><strong>Agency / Office:</strong> ${officeName}</div>
        <div style="margin-top: 2px;"><strong>Payor:</strong> <span style="font-weight: bold; font-size: 9pt;">${applicantName}</span></div>
        <div style="margin-top: 2px;"><strong>Address:</strong> ${formattedAddress}</div>
        <div style="margin-top: 2px;"><strong>Order of Payment No.:</strong> ${opNumber} • <strong>Application Ref:</strong> #${refNum}</div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 55%;">NATURE OF COLLECTION</th>
            <th style="width: 25%; text-align: center;">FUND / CODE</th>
            <th style="width: 20%; text-align: right;">AMOUNT (PHP)</th>
          </tr>
        </thead>
        <tbody>
          ${tableRowsHtml}
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="2" style="text-align: right; font-size: 8.5pt;">TOTAL AMOUNT (in Figures):</td>
            <td style="text-align: right; font-size: 9.5pt; color: #059669;">${formatCurrency(totalAmount)}</td>
          </tr>
        </tfoot>
      </table>

      <div class="amount-words-box">
        <strong>AMOUNT IN WORDS:</strong><br>
        <span style="font-style: italic; font-weight: bold; color: #047857;">${totalWords}</span>
      </div>

      <div class="payment-method-box">
        <div style="display: flex; justify-content: space-between;">
          <span><strong>Payment Mode:</strong> Cash / Electronic Fund Transfer</span>
          <span><strong>Payment Status:</strong> PAID</span>
        </div>
      </div>
    </div>

    <div>
      <div class="signature-section">
        <div class="signature-box">
          <div class="sign-line"></div>
          <div class="sign-name">Special Collecting Officer</div>
          <div class="sign-role">Authorized Cashier Officer</div>
        </div>
      </div>

      <div style="font-size: 6.5pt; color: #64748b; text-align: center; margin-top: 6px; border-top: 0.5pt solid #cbd5e1; padding-top: 4px;">
        NOTE: Write the number and date of this receipt on the back of check or draft.
      </div>
    </div>
  </div>
</body>
</html>`;
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
