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

export interface OfficialSoaFormRow {
  code: string;
  description: string;
  category: 'FOR LICENSES' | 'FOR PERMITS' | 'FOR AMATUER AND ROC' | 'OTHER APPLICATION';
  amount?: number;
  matchKeys: string[];
}

export const OFFICIAL_SOA_FORM_ROWS: OfficialSoaFormRow[] = [
  // 1. FOR LICENSES
  { code: '4-02-01-010', description: 'Permit to Purchase', category: 'FOR LICENSES', matchKeys: ['permit to purchase', 'purchase permit'] },
  { code: '4-02-01-130', description: 'Filling Fee', category: 'FOR LICENSES', matchKeys: ['filling fee', 'filing fee', 'filing'] },
  { code: '4-02-01-010', description: 'Permit to Possess/Storage', category: 'FOR LICENSES', matchKeys: ['possess', 'storage'] },
  { code: '4-02-01-010', description: 'Construction Permit Fee', category: 'FOR LICENSES', matchKeys: ['construction permit', 'construction'] },
  { code: '4-02-01-060', description: 'Radio Station License', category: 'FOR LICENSES', matchKeys: ['radio station license', 'rsl', 'license fee', 'station license'] },
  { code: '4-02-01-100', description: 'Inspection Fee', category: 'FOR LICENSES', matchKeys: ['inspection fee', 'inspection'] },
  { code: '4-02-01-080', description: "Spectrum User's Fee (SUF)", category: 'FOR LICENSES', matchKeys: ['spectrum user', 'suf', 'spectrum'] },
  {
    code: '4-02-01-140',
    description: "Fines/Penalties/Surcharges<br><span style=\"font-size: 9.5px; color: #475569;\">(SUR)Radio Station License<br>(SUR)Spectrum User's Fee (SUF)</span>",
    category: 'FOR LICENSES',
    matchKeys: ['surcharge', 'surcharges', 'fines', 'penalty', 'penalties']
  },

  // 2. FOR PERMITS
  {
    code: '4-02-01-010',
    description: 'Permit Fees (Dealers/Reseller/Service<br>Center/Sell/ Transfer/REC/Import)',
    category: 'FOR PERMITS',
    matchKeys: ['permit fee', 'dealer', 'reseller', 'service center', 'transfer', 'rec', 'import']
  },
  { code: '4-02-01-100', description: 'Inspection Fee', category: 'FOR PERMITS', matchKeys: ['permit inspection'] },
  { code: '4-02-01-130', description: 'Filling Fee', category: 'FOR PERMITS', matchKeys: ['permit filing', 'permit filling'] },
  { code: '4-02-01-140', description: 'Fines/Penalties/Surcharges', category: 'FOR PERMITS', matchKeys: ['permit fine', 'permit penalty'] },

  // 3. FOR AMATUER AND ROC
  { code: '4-02-01-060', description: 'Radio Station License', category: 'FOR AMATUER AND ROC', matchKeys: ['amateur station', 'amateur license', 'amatuer'] },
  { code: '4-02-01-060', description: "Radio Operator's Cert.", category: 'FOR AMATUER AND ROC', matchKeys: ['radio operator', 'roc', 'operator cert', 'amateur cert'] },
  { code: '4-02-01-130', description: 'Application Fee/Filing Fee', category: 'FOR AMATUER AND ROC', matchKeys: ['application fee', 'amateur application'] },
  { code: '4-02-02-040', description: 'Seminar Fee', category: 'FOR AMATUER AND ROC', matchKeys: ['seminar fee', 'seminar'] },
  {
    code: '4-02-01-140',
    description: "Fines/Penalties/Surcharges<br><span style=\"font-size: 9.5px; color: #475569;\">(SUR)Radio Station License :<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;TO<br>(SUR)Radio Operator's Cert. :<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;TO</span>",
    category: 'FOR AMATUER AND ROC',
    matchKeys: ['amateur penalty', 'roc surcharge']
  },

  // 4. OTHER APPLICATION
  { code: '4-02-01-020', description: 'Registration Fee', category: 'OTHER APPLICATION', matchKeys: ['registration fee', 'registration'] },
  { code: '4-02-01-070', description: 'Supervision & Regulation Fee', category: 'OTHER APPLICATION', matchKeys: ['supervision', 'regulation', 'srf'] },
  { code: '4-02-01-040', description: 'Verification Fee & Authentication Fees', category: 'OTHER APPLICATION', matchKeys: ['verification', 'authentication'] },
  { code: '4-02-01-030', description: 'Examination Fee', category: 'OTHER APPLICATION', matchKeys: ['examination fee', 'examination', 'exam'] },
  { code: '4-02-01-040', description: 'Clearance/Certification Fee', category: 'OTHER APPLICATION', matchKeys: ['clearance', 'certification fee'] },
  { code: '4-02-01-060', description: 'Modification Fee', category: 'OTHER APPLICATION', matchKeys: ['modification fee', 'modification'] },
  { code: '4-02-01-990', description: 'Miscellaneous Income', category: 'OTHER APPLICATION', matchKeys: ['miscellaneous', 'misc'] },
  { code: '4-01-04-010', description: 'Documentary Stamp Tax (DST)', category: 'OTHER APPLICATION', matchKeys: ['documentary stamp', 'dst', 'stamp tax'] },
  { code: '', description: 'Others (PENALTY FOR LATE<br>&nbsp;DELIVERY)', category: 'OTHER APPLICATION', matchKeys: ['late delivery', 'late penalty', 'others'] },
];

export function getPopulatedSoaRows(app: ApplicationData): { rows: (OfficialSoaFormRow & { calculatedAmount: number })[]; totalAmount: number } {
  const rowMap = OFFICIAL_SOA_FORM_ROWS.map((r) => ({
    ...r,
    calculatedAmount: 0,
  }));

  const soaItemsList = Array.isArray(app.soaItems) ? app.soaItems : [];

  if (soaItemsList.length > 0) {
    for (const item of soaItemsList) {
      const itemParticular = safeString(item.particular, '').toLowerCase();
      const itemCode = safeString(item.code, '').toLowerCase();
      const amount = typeof item.amount === 'number' && !isNaN(item.amount) ? item.amount : 0;

      // 1. Try exact code matching
      let matched = rowMap.find((r) => r.code.length > 0 && r.code.toLowerCase() === itemCode);

      // 2. Try matchKeys
      if (!matched) {
        matched = rowMap.find((r) =>
          r.matchKeys.some((k) => itemParticular.includes(k) || (itemCode.length > 0 && itemCode.includes(k)))
        );
      }

      if (matched) {
        matched.calculatedAmount += amount;
      } else {
        // Fallback to Others
        const others = rowMap.find((r) => r.category === 'OTHER APPLICATION' && r.matchKeys.includes('others'));
        if (others) {
          others.calculatedAmount += amount;
        }
      }
    }
  } else if (typeof app.totalAmountDue === 'number' && app.totalAmountDue > 0) {
    const sName = (app.serviceName || app.category || '').toLowerCase();
    if (sName.includes('license') || sName.includes('station') || sName.includes('rsl')) {
      const rslRow = rowMap.find((r) => r.code === '4-02-01-060' && r.category === 'FOR LICENSES');
      if (rslRow) rslRow.calculatedAmount = app.totalAmountDue;
    } else if (sName.includes('permit')) {
      const permitRow = rowMap.find((r) => r.category === 'FOR PERMITS' && r.code === '4-02-01-010');
      if (permitRow) permitRow.calculatedAmount = app.totalAmountDue;
    } else if (sName.includes('amateur') || sName.includes('operator') || sName.includes('roc')) {
      const rocRow = rowMap.find((r) => r.category === 'FOR AMATUER AND ROC' && r.code === '4-02-01-060');
      if (rocRow) rocRow.calculatedAmount = app.totalAmountDue;
    } else {
      const regRow = rowMap.find((r) => r.code === '4-02-01-020');
      if (regRow) regRow.calculatedAmount = app.totalAmountDue;
    }
  }

  const computedTotal = rowMap.reduce((sum, r) => sum + r.calculatedAmount, 0);
  const finalTotal = computedTotal > 0 ? computedTotal : (app.totalAmountDue || 0);

  return { rows: rowMap, totalAmount: finalTotal };
}

export function generateSoaPrintableHtml(
  app: ApplicationData,
  optionsOrTenantName?: { outputMode?: 'plain_paper' | 'accountable_form'; monthOf?: string; tenantName?: string } | string,
  preparerName?: string,
  approverName?: string
): string {
  const isOptionsObj = typeof optionsOrTenantName === 'object' && optionsOrTenantName !== null;
  const outputMode = isOptionsObj ? optionsOrTenantName.outputMode ?? 'plain_paper' : 'plain_paper';
  const isOverlay = outputMode === 'accountable_form';

  const dateObj = app.createdAt ? new Date(app.createdAt) : new Date();
  const currentMonthYear = isOptionsObj && optionsOrTenantName.monthOf
    ? optionsOrTenantName.monthOf.toUpperCase()
    : dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();

  const { rows, totalAmount } = getPopulatedSoaRows(app);
  const formattedTotal = totalAmount > 0 ? totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '';

  const categories: Array<'FOR LICENSES' | 'FOR PERMITS' | 'FOR AMATUER AND ROC' | 'OTHER APPLICATION'> = [
    'FOR LICENSES',
    'FOR PERMITS',
    'FOR AMATUER AND ROC',
    'OTHER APPLICATION',
  ];

  const tableSectionsHtml = categories
    .map((cat) => {
      const catRows = rows.filter((r) => r.category === cat);
      const rowsHtml = catRows
        .map((r) => {
          const amtStr = r.calculatedAmount > 0
            ? r.calculatedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : '';

          return `
            <tr style="height: 22px;">
              <td class="code-cell">${isOverlay ? '' : r.code}</td>
              <td class="desc-cell">${isOverlay ? '' : r.description}</td>
              <td class="amount-cell">${amtStr}</td>
            </tr>
          `;
        })
        .join('');

      return `
        <tr class="banner-row">
          <td colspan="3" class="banner-cell">${isOverlay ? '' : cat}</td>
        </tr>
        ${rowsHtml}
      `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Statement of Account - ${app.referenceNumber || app.id || 'NTC-SOA'}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm;
    }
    @media print {
      body {
        margin: 0;
        padding: 0;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .no-print { display: none !important; }
    }
    * {
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
    }
    body {
      font-family: 'Times New Roman', Times, serif, 'Segoe UI', Arial;
      color: #000000;
      background-color: #ffffff;
      margin: 0;
      padding: 16px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .page-container {
      width: 100%;
      max-width: 680px;
      margin: 0 auto;
    }
    .print-actions {
      position: fixed;
      top: 14px;
      right: 14px;
      z-index: 1000;
      display: flex;
      gap: 8px;
    }
    .btn-print {
      background: #0f172a;
      color: #ffffff;
      border: 1px solid #334155;
      padding: 8px 16px;
      border-radius: 6px;
      font-family: system-ui, sans-serif;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 6px rgba(0,0,0,0.15);
    }
    .mode-indicator {
      font-family: system-ui, sans-serif;
      font-size: 11px;
      color: #64748b;
      margin-bottom: 8px;
      text-align: center;
    }
    /* Main official NTC Assessment Form Table */
    .soa-table {
      width: 100%;
      border-collapse: collapse;
      border: ${isOverlay ? '1.5px solid transparent' : '2px solid #000000'};
      table-layout: fixed;
    }
    .col-code { width: 92px; }
    .col-desc { width: 388px; }
    .col-amt { width: 200px; }

    .header-cell {
      border: ${isOverlay ? '1px solid transparent' : '1px solid #000000'};
      text-align: center;
      vertical-align: middle;
      font-weight: bold;
      font-size: 13px;
      padding: 6px 4px;
    }
    .report-title {
      font-size: 12.5px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    .month-label {
      font-size: 12px;
      font-weight: bold;
      margin-top: 4px;
    }
    .month-val {
      display: inline-block;
      min-width: 90px;
      text-align: center;
      border-bottom: ${isOverlay ? 'none' : '1px solid #000000'};
      padding: 0 4px;
      font-weight: bold;
      font-size: 12px;
    }
    .banner-row {
      height: 22px;
    }
    .banner-cell {
      border: ${isOverlay ? '1px solid transparent' : '1px solid #000000'};
      text-align: center;
      vertical-align: middle;
      font-weight: bold;
      font-size: 12.5px;
      text-transform: uppercase;
      padding: 2px 4px;
    }
    .code-cell {
      border: ${isOverlay ? '1px solid transparent' : '1px solid #000000'};
      font-size: 11.5px;
      padding: 2px 6px;
      vertical-align: middle;
      text-align: left;
      font-family: monospace, 'Courier New';
    }
    .desc-cell {
      border: ${isOverlay ? '1px solid transparent' : '1px solid #000000'};
      font-size: 11.5px;
      padding: 2px 6px;
      vertical-align: middle;
      text-align: left;
      line-height: 1.15;
    }
    .amount-cell {
      border: ${isOverlay ? '1px solid transparent' : '1px solid #000000'};
      font-size: 12px;
      font-weight: bold;
      padding: 2px 10px;
      vertical-align: middle;
      text-align: right;
      font-family: 'Segoe UI', Arial, sans-serif;
    }
    .total-label-cell {
      border: ${isOverlay ? '1px solid transparent' : '1px solid #000000'};
      text-align: right;
      vertical-align: middle;
      font-weight: bold;
      font-size: 13.5px;
      padding: 4px 12px;
    }
    .total-amount-cell {
      border: ${isOverlay ? '1px solid transparent' : '1px solid #000000'};
      text-align: right;
      vertical-align: middle;
      font-weight: bold;
      font-size: 13px;
      padding: 4px 10px;
      font-family: 'Segoe UI', Arial, sans-serif;
    }
  </style>
</head>
<body>
  <div class="print-actions no-print">
    <button class="btn-print" onclick="window.print()">Print Statement of Account</button>
  </div>

  <div class="page-container">
    <div class="mode-indicator no-print">
      ${isOverlay ? '⚡ Pre-Printed Accountable Form Overlay Mode (Background artwork & borders suppressed for physical stationery)' : '📄 Official Plain Paper Electronic Form (soa-report-template.pdf standard layout)'}
    </div>

    <table class="soa-table">
      <colgroup>
        <col class="col-code" />
        <col class="col-desc" />
        <col class="col-amt" />
      </colgroup>
      <thead>
        <tr>
          <th class="header-cell">${isOverlay ? '' : 'Code'}</th>
          <th class="header-cell">${isOverlay ? '' : 'Description'}</th>
          <th class="header-cell" style="padding: 4px 2px;">
            ${isOverlay ? '<div style="height: 14px;"></div>' : '<div class="report-title">CASHIER\'S REPORT</div>'}
            <div class="month-label">
              ${isOverlay ? '' : 'MONTH OF '}
              <span class="month-val">${currentMonthYear}</span>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        ${tableSectionsHtml}
        <tr style="height: 26px;">
          <td colspan="2" class="total-label-cell">${isOverlay ? '' : 'TOTAL'}</td>
          <td class="total-amount-cell">${formattedTotal}</td>
        </tr>
      </tbody>
    </table>
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
