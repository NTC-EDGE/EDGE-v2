import { ApplicationData } from '../../../types/application';

function safeString(val: unknown, fallback = 'N/A'): string {
  if (val === null || val === undefined) return fallback;
  const str = String(val).trim();
  return str.length > 0 ? str : fallback;
}

export function formatAddress(app: ApplicationData): string {
  if (!app.address) return 'N/A';
  const parts = [
    app.address.streetAddress || app.address.address,
    app.address.barangay,
    app.address.city,
    app.address.province,
    app.address.region,
    app.address.zipCode,
  ].filter((p): p is string => typeof p === 'string' && p.trim().length > 0);
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

  const tenantName = isOptionsObj ? optionsOrTenantName.tenantName : (typeof optionsOrTenantName === 'string' ? optionsOrTenantName : undefined);
  const officeName = safeString(app.office || app.assignedTo || tenantName, 'Regional Office No. VII');
  const payorName = safeString(app.applicant, 'Applicant');
  const payorAddress = formatAddress(app);
  const refNum = safeString(app.referenceNumber, app.id ? app.id.slice(0, 8).toUpperCase() : 'NTC-SOA');
  const soaNumber = `SOA-${refNum}`;
  const totalInWords = numberToWords(totalAmount);

  // Compute due date (30 days from created date)
  const dueDateObj = new Date(dateObj.getTime() + 30 * 24 * 60 * 60 * 1000);
  const dueDateStr = dueDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Classify transaction type checkboxes
  const variantLower = (app.serviceVariantName || app.serviceName || app.category || '').toLowerCase();
  const isRen = variantLower.includes('renew');
  const isMod = variantLower.includes('mod') && !isRen;
  const isDup = variantLower.includes('dup');
  const isCv = variantLower.includes('cv') || variantLower.includes('convert');
  const isRoc = variantLower.includes('roc') || variantLower.includes('operator');
  const isCo = variantLower.includes('co') || variantLower.includes('ownership');
  const isMa = variantLower.includes('ma');
  const isMs = variantLower.includes('ms');
  const isNew = !isRen && !isMod && !isDup && !isCv && !isRoc && !isCo && !isMa && !isMs;

  const isForAssessmentOnly = app.intent === 'AssessmentOnly' || app.isAssessmentOnly === true;
  const isEndorsedForPayment = !isForAssessmentOnly;

  const orNumber = app.payment?.orNumber ?? '';
  const orAmount = app.payment?.amountReceived && app.payment.amountReceived > 0
    ? `₱ ${app.payment.amountReceived.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    : (formattedTotal ? `₱ ${formattedTotal}` : '');
  const orDate = app.payment?.orNumber
    ? (app.updatedAt
        ? new Date(app.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }))
    : '';
  const orBy = app.issuingOfficer ?? app.evaluatingOfficer ?? '';

  const prepName = safeString(preparerName || app.evaluatingOfficer, 'AUTHORIZED EVALUATOR');
  const apprvName = safeString(approverName || app.issuingOfficer, 'CHIEF, ENFORCEMENT & OPERATIONS DIVISION');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Statement of Account - ${soaNumber}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 12mm;
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
      font-family: 'Times New Roman', Times, serif;
      color: #000000;
      background-color: #ffffff;
      margin: 0;
      padding: 10px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .page-container {
      width: 100%;
      max-width: 720px;
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
      margin-bottom: 6px;
      text-align: center;
    }

    /* Official Top Header with Logos */
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 6px;
      visibility: ${isOverlay ? 'hidden' : 'visible'};
    }
    .logo-cell {
      width: 70px;
      text-align: center;
      vertical-align: middle;
    }
    .header-text-cell {
      text-align: center;
      vertical-align: middle;
      padding: 0 6px;
    }
    .rep-title {
      font-size: 10.5px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      font-weight: normal;
    }
    .dict-title {
      font-size: 9.5px;
      letter-spacing: 0.3px;
      font-weight: bold;
      text-transform: uppercase;
      margin-top: 1px;
    }
    .agency-title {
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      margin-top: 2px;
    }
    .office-title {
      font-size: 10px;
      font-weight: 600;
      margin-top: 1px;
    }

    /* Document Title & Series Code */
    .title-banner {
      text-align: center;
      margin: 4px 0 6px 0;
      visibility: ${isOverlay ? 'hidden' : 'visible'};
    }
    .doc-main-title {
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .doc-series-sub {
      font-size: 8.5px;
      font-style: italic;
      color: #334155;
    }

    /* Payor & Control Box */
    .meta-box {
      width: 100%;
      border: ${isOverlay ? '1px solid transparent' : '1px solid #000000'};
      border-collapse: collapse;
      margin-bottom: 4px;
      font-family: Arial, sans-serif;
      font-size: 9px;
    }
    .meta-box td {
      padding: 2.5px 6px;
      border: ${isOverlay ? '1px solid transparent' : '1px solid #000000'};
      vertical-align: middle;
    }
    .meta-label {
      font-weight: bold;
      color: ${isOverlay ? 'transparent' : '#000000'};
    }
    .meta-val {
      font-weight: 600;
    }

    /* Checkboxes Row */
    .checkbox-bar {
      width: 100%;
      display: flex;
      justify-content: space-between;
      border: ${isOverlay ? '1px solid transparent' : '1px solid #000000'};
      border-bottom: none;
      padding: 2.5px 8px;
      background: ${isOverlay ? 'transparent' : '#f8fafc'};
      font-family: Arial, sans-serif;
      font-size: 8.5px;
      margin-top: 2px;
    }
    .cb-item {
      display: inline-flex;
      align-items: center;
      gap: 3px;
    }
    .cb-mark {
      font-weight: bold;
      font-family: monospace;
      font-size: 9.5px;
    }
    .cb-label {
      color: ${isOverlay ? 'transparent' : '#000000'};
    }

    /* Main official NTC Assessment Form Table */
    .soa-table {
      width: 100%;
      border-collapse: collapse;
      border: ${isOverlay ? '1.5px solid transparent' : '2px solid #000000'};
      table-layout: fixed;
    }
    .col-code { width: 85px; }
    .col-desc { width: 445px; }
    .col-amt { width: 190px; }

    .header-cell {
      border: ${isOverlay ? '1px solid transparent' : '1px solid #000000'};
      text-align: center;
      vertical-align: middle;
      font-weight: bold;
      font-size: 11.5px;
      padding: 4px 4px;
      background: ${isOverlay ? 'transparent' : '#f1f5f9'};
    }
    .report-title {
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .month-label {
      font-size: 10px;
      font-weight: bold;
      margin-top: 1px;
    }
    .month-val {
      display: inline-block;
      min-width: 80px;
      text-align: center;
      border-bottom: ${isOverlay ? 'none' : '1px solid #000000'};
      padding: 0 4px;
      font-weight: bold;
      font-size: 10.5px;
    }
    .banner-row {
      height: 19px;
    }
    .banner-cell {
      border: ${isOverlay ? '1px solid transparent' : '1px solid #000000'};
      text-align: center;
      vertical-align: middle;
      font-weight: bold;
      font-size: 10.5px;
      text-transform: uppercase;
      padding: 2px 4px;
      background: ${isOverlay ? 'transparent' : '#e2e8f0'};
    }
    .code-cell {
      border: ${isOverlay ? '1px solid transparent' : '1px solid #000000'};
      font-size: 10px;
      padding: 1.5px 5px;
      vertical-align: middle;
      text-align: left;
      font-family: monospace, 'Courier New';
    }
    .desc-cell {
      border: ${isOverlay ? '1px solid transparent' : '1px solid #000000'};
      font-size: 10px;
      padding: 1.5px 5px;
      vertical-align: middle;
      text-align: left;
      line-height: 1.15;
    }
    .amount-cell {
      border: ${isOverlay ? '1px solid transparent' : '1px solid #000000'};
      font-size: 10.5px;
      font-weight: bold;
      padding: 1.5px 8px;
      vertical-align: middle;
      text-align: right;
      font-family: Arial, sans-serif;
    }
    .total-label-cell {
      border: ${isOverlay ? '1px solid transparent' : '1px solid #000000'};
      text-align: right;
      vertical-align: middle;
      font-weight: bold;
      font-size: 11.5px;
      padding: 3px 10px;
      background: ${isOverlay ? 'transparent' : '#f8fafc'};
    }
    .total-amount-cell {
      border: ${isOverlay ? '1px solid transparent' : '1px solid #000000'};
      text-align: right;
      vertical-align: middle;
      font-weight: bold;
      font-size: 11.5px;
      padding: 3px 8px;
      font-family: Arial, sans-serif;
      background: ${isOverlay ? 'transparent' : '#f8fafc'};
    }

    /* Words Row */
    .words-box {
      border: ${isOverlay ? '1px solid transparent' : '1px solid #000000'};
      border-top: none;
      padding: 3px 8px;
      font-size: 8.5px;
      font-family: Arial, sans-serif;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    /* Bottom Assessment, O.R. Stamp, & Signatures Grid */
    .bottom-grid {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4px;
      font-family: Arial, sans-serif;
    }
    .bottom-grid td {
      vertical-align: top;
      padding: 0;
    }
    .or-stamp-table {
      width: 100%;
      max-width: 180px;
      border: ${isOverlay ? '1.2px solid transparent' : '1.2px solid #000000'};
      border-collapse: collapse;
      font-size: 8px;
    }
    .or-stamp-table td {
      border: ${isOverlay ? '0.5px solid transparent' : '0.5px solid #000000'};
      padding: 1.5px 3px;
      vertical-align: middle;
    }
    .or-header-cell {
      width: 32px;
      text-align: center;
      font-weight: bold;
      font-size: 10.5px;
      background: ${isOverlay ? 'transparent' : '#f1f5f9'};
    }

    .sig-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.5px;
    }
    .sig-table td {
      padding: 3px 6px;
      text-align: center;
      vertical-align: bottom;
    }
    .sig-line {
      border-bottom: ${isOverlay ? 'none' : '0.8px solid #000000'};
      margin-bottom: 2px;
      height: 18px;
    }
    .sig-name {
      font-weight: bold;
      font-size: 9px;
      text-transform: uppercase;
    }
    .sig-title {
      font-size: 7.5px;
      color: ${isOverlay ? 'transparent' : '#475569'};
      font-style: italic;
    }

    .footnote {
      text-align: center;
      font-size: 7px;
      font-family: Arial, sans-serif;
      color: #64748b;
      margin-top: 4px;
      visibility: ${isOverlay ? 'hidden' : 'visible'};
    }
  </style>
</head>
<body>
  <div class="print-actions no-print">
    <button class="btn-print" onclick="window.print()">Print Statement of Account</button>
  </div>

  <div class="page-container">
    <div class="mode-indicator no-print">
      ${isOverlay ? '⚡ Pre-Printed Accountable Form Overlay Mode (Background artwork & borders suppressed for physical stationery)' : '📄 Official Plain Paper Electronic Form (National Telecommunications Commission)'}
    </div>

    <!-- Official Header with Color Logos -->
    <table class="header-table">
      <tr>
        <td class="logo-cell">
          <!-- Republic of the Philippines Seal Vector -->
          <svg width="56" height="56" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="#FCD116" stroke="#B45309" stroke-width="1.5"/>
            <circle cx="50" cy="50" r="44" fill="#FFFFFF"/>
            <path d="M 50 10 A 40 40 0 0 1 50 90 Z" fill="#CE1126"/>
            <path d="M 50 10 A 40 40 0 0 0 50 90 Z" fill="#0038A8"/>
            <circle cx="50" cy="50" r="24" fill="#FCD116"/>
            <!-- Sun Rays & Stars -->
            <polygon points="50,28 53,42 67,42 56,50 60,64 50,56 40,64 44,50 33,42 47,42" fill="#FFFFFF"/>
          </svg>
        </td>
        <td class="header-text-cell">
          <div class="rep-title">Republic of the Philippines</div>
          <div class="dict-title">Department of Information and Communications Technology</div>
          <div class="agency-title">National Telecommunications Commission</div>
          <div class="office-title">${officeName}</div>
        </td>
        <td class="logo-cell">
          <!-- NTC Official Full Color Emblem Vector -->
          <svg width="56" height="56" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="#0F172A" stroke="#2563EB" stroke-width="1.5"/>
            <circle cx="50" cy="50" r="43" fill="#FFFFFF"/>
            <!-- Radio Mast radiating waves -->
            <path d="M 30 75 L 50 22 L 70 75 Z" fill="none" stroke="#2563EB" stroke-width="3"/>
            <circle cx="50" cy="22" r="5" fill="#DC2626"/>
            <path d="M 35 45 A 20 20 0 0 1 65 45" fill="none" stroke="#D97706" stroke-width="2.5" stroke-dasharray="3,2"/>
            <path d="M 27 38 A 30 30 0 0 1 73 38" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-dasharray="4,2"/>
            <path d="M 20 30 A 40 40 0 0 1 80 30" fill="none" stroke="#059669" stroke-width="2.5" stroke-dasharray="4,3"/>
            <!-- Philippine Stars at base -->
            <polygon points="50,68 52,73 57,73 53,76 55,81 50,78 45,81 47,76 43,73 48,73" fill="#FCD116"/>
          </svg>
        </td>
      </tr>
    </table>

    <!-- Title & Series Subtitle -->
    <div class="title-banner">
      <div class="doc-main-title">Statement of Account</div>
      <div class="doc-series-sub">(RC Code-Year of Issue-Mo. Of Issue-Series of the RC)</div>
    </div>

    <!-- Payor & Control Information Box -->
    <table class="meta-box">
      <tr>
        <td style="width: 60%;">
          <span class="meta-label">Payor: </span>
          <span class="meta-val">${payorName}</span>
        </td>
        <td style="width: 40%;">
          <span class="meta-label">Account No.: </span>
          <span class="meta-val">${soaNumber}</span>
        </td>
      </tr>
      <tr>
        <td>
          <span class="meta-label">Address: </span>
          <span class="meta-val">${payorAddress}</span>
        </td>
        <td>
          <span class="meta-label">Date: </span>
          <span class="meta-val">${formattedDate}</span>
          <span class="meta-label" style="margin-left: 8px;">Due: </span>
          <span class="meta-val" style="color: #b91c1c;">${dueDateStr}</span>
        </td>
      </tr>
    </table>

    <!-- Transaction Checkbox Strip -->
    <div class="checkbox-bar">
      <span class="cb-item"><span class="cb-mark">${isNew ? '[X]' : '[ ]'}</span> <span class="cb-label">New</span></span>
      <span class="cb-item"><span class="cb-mark">${isMod ? '[X]' : '[ ]'}</span> <span class="cb-label">Mod</span></span>
      <span class="cb-item"><span class="cb-mark">${isCo ? '[X]' : '[ ]'}</span> <span class="cb-label">Co</span></span>
      <span class="cb-item"><span class="cb-mark">${isMa ? '[X]' : '[ ]'}</span> <span class="cb-label">Ma</span></span>
      <span class="cb-item"><span class="cb-mark">${isRen ? '[X]' : '[ ]'}</span> <span class="cb-label">Ren</span></span>
      <span class="cb-item"><span class="cb-mark">${isDup ? '[X]' : '[ ]'}</span> <span class="cb-label">Dup</span></span>
      <span class="cb-item"><span class="cb-mark">${isCv ? '[X]' : '[ ]'}</span> <span class="cb-label">Cv</span></span>
      <span class="cb-item"><span class="cb-mark">${isRoc ? '[X]' : '[ ]'}</span> <span class="cb-label">ROC</span></span>
      <span class="cb-item"><span class="cb-mark">${isMs ? '[X]' : '[ ]'}</span> <span class="cb-label">MS</span></span>
      <span class="cb-item"><span class="cb-mark">[ ]</span> <span class="cb-label">Others</span></span>
    </div>

    <!-- Main Official Fee Assessment Matrix -->
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
          <th class="header-cell" style="padding: 2px 2px;">
            ${isOverlay ? '<div style="height: 12px;"></div>' : '<div class="report-title">CASHIER\'S REPORT</div>'}
            <div class="month-label">
              ${isOverlay ? '' : 'MONTH OF '}
              <span class="month-val">${currentMonthYear}</span>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        ${tableSectionsHtml}
        <tr style="height: 24px;">
          <td colspan="2" class="total-label-cell">${isOverlay ? '' : 'TOTAL'}</td>
          <td class="total-amount-cell">₱ ${formattedTotal}</td>
        </tr>
      </tbody>
    </table>

    <!-- Amount in Words -->
    <div class="words-box">
      <div><span class="meta-label">AMOUNT IN WORDS: </span><strong>${totalInWords}</strong></div>
      <div><span class="meta-label">TOTAL: </span><strong>₱ ${formattedTotal}</strong></div>
    </div>

    <!-- Bottom Section: Assessment Stamp, O.R. Box, & Signatures -->
    <table class="bottom-grid">
      <tr>
        <!-- Left: Conditions & O.R. Stamp -->
        <td style="width: 48%; padding-top: 4px;">
          <div style="font-size: 8px; margin-bottom: 3px; display: flex; gap: 10px;">
            <span><strong>${isForAssessmentOnly ? '[X]' : '[ ]'}</strong> For Assessment Only</span>
            <span><strong>${isEndorsedForPayment ? '[X]' : '[ ]'}</strong> Endorsed for Payment</span>
          </div>

          <table class="or-stamp-table">
            <tr>
              <td rowspan="4" class="or-header-cell">O.R.</td>
              <td><span style="font-weight: bold;">No.</span> ${orNumber}</td>
            </tr>
            <tr>
              <td><span style="font-weight: bold;">AMOUNT:</span> <strong style="font-size: 11px; color: #15803d;">${orAmount}</strong></td>
            </tr>
            <tr>
              <td><span style="font-weight: bold;">Date:</span> ${orDate}</td>
            </tr>
            <tr>
              <td><span style="font-weight: bold;">By:</span> ${orBy}</td>
            </tr>
          </table>
        </td>

        <!-- Right: Official Signatories -->
        <td style="width: 52%; padding-top: 4px;">
          <table class="sig-table">
            <tr>
              <td>
                <div style="font-size: 7.5px; color: #475569; text-align: left; margin-bottom: 2px;">Prepared By:</div>
                <div class="sig-line"></div>
                <div class="sig-name">${prepName}</div>
                <div class="sig-title">EVALUATOR, NTC</div>
              </td>
              <td>
                <div style="font-size: 7.5px; color: #475569; text-align: left; margin-bottom: 2px;">Approved By:</div>
                <div class="sig-line"></div>
                <div class="sig-name">${apprvName}</div>
                <div class="sig-title">CHIEF, ENFORCEMENT &amp; OPERATIONS DIV.</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <div class="footnote">
      NTC-EDGE Official Digital System • Generated on ${formattedDate} • RA 11032 Ease of Doing Business Act Certified
    </div>
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

  const applicantAddress = safeString(
    formatAddress(app),
    'Cebu City, Philippines'
  );

  const paymentStatusText = orNumber
    ? `Paid via OR #${orNumber}`
    : 'Pending Cashier Collection';

  const renderSingleVoucher = (copyTitle: string) => `
    <div class="voucher-wrapper">
      <table class="voucher-top-table">
        <tr>
          <td style="width: 65%; vertical-align: top;">
            <div class="rep-title">Republic of the Philippines</div>
            <div class="ntc-title">NATIONAL TELECOMMUNICATIONS COMMISSION</div>
            <div class="ro-title">Regional Office No. VII</div>
            <div class="fund-title">General Fund</div>
          </td>
          <td style="width: 35%; vertical-align: top; text-align: right;">
            <div class="serial-row">
              <span class="label-bold">Serial No. :</span>
              <span class="val-underline mono-bold">${opNumber}</span>
            </div>
            <div class="serial-row" style="margin-top: 3px;">
              <span class="label-bold">Date :</span>
              <span class="val-underline">${currentDate}</span>
            </div>
          </td>
        </tr>
      </table>

      <div class="voucher-heading">
        <div class="op-main-title">ORDER OF PAYMENT (OP)</div>
        <div class="op-copy-subtitle">(${copyTitle})</div>
      </div>

      <div class="voucher-body">
        <div class="officer-salutation"><strong>The Collecting Officer</strong></div>
        <div class="lead-line">
          Please issue <strong>Official Receipt</strong> in favor of
          <span class="val-underline bold-val">${applicantName}</span>
        </div>
        <div class="sub-caption">(Name of Payor)</div>

        <div class="address-line">
          <span class="val-underline">${applicantAddress}</span>
        </div>
        <div class="sub-caption">(Address/Office of Payor)</div>

        <div class="amount-line">
          in the amount of PHP <span class="val-underline bold-val">${totalWords}</span>
          (<span class="val-underline bold-val">PHP ${formatCurrency(app.totalAmountDue)}</span>)
        </div>

        <div class="purpose-line">
          for the payment of <span class="val-underline">${serviceName} Assessment & Regulatory Fees</span>
        </div>
        <div class="sub-caption">(Purpose)</div>

        <div class="soa-ref-line">
          per Statement of Account No. <span class="val-underline bold-val">SOA-${refNum}</span>
          dated <span class="val-underline">${currentDate}</span>
        </div>
      </div>

      <div class="bank-instruction">
        Please deposit the collections under Bank Account/s:
      </div>

      <table class="bank-grid">
        <thead>
          <tr>
            <th style="width: 10%; text-align: center;">No.</th>
            <th style="width: 60%; text-align: left;">Name of Bank</th>
            <th style="width: 30%; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align: center;">1</td>
            <td>Land Bank of the Philippines</td>
            <td style="text-align: right; font-weight: bold;">PHP ${formatCurrency(app.totalAmountDue)}</td>
          </tr>
          <tr class="total-row">
            <td colspan="2" style="text-align: right; font-weight: bold;">TOTAL PHP</td>
            <td style="text-align: right; font-weight: bold;">${formatCurrency(app.totalAmountDue)}</td>
          </tr>
        </tbody>
      </table>

      <table class="voucher-footer-table">
        <tr>
          <td style="width: 48%; vertical-align: top;">
            <table class="or-stamp-box">
              <tr>
                <td style="width: 55px; font-weight: bold;">O.R. No.</td>
                <td style="font-weight: bold; font-family: monospace;">${orNumber || '________________'}</td>
              </tr>
              <tr>
                <td style="font-weight: bold;">AMOUNT:</td>
                <td style="font-weight: bold;">${app.payment?.amountReceived ? `PHP ${formatCurrency(app.payment.amountReceived)}` : (orNumber ? `PHP ${formatCurrency(app.totalAmountDue)}` : '________________')}</td>
              </tr>
              <tr>
                <td>Date:</td>
                <td>${orNumber ? currentDate : '________________'}</td>
              </tr>
              <tr>
                <td>By:</td>
                <td>${safeString(cashierName, 'Special Collecting Officer')}</td>
              </tr>
            </table>
          </td>
          <td style="width: 52%; vertical-align: bottom; text-align: center; padding-left: 20px;">
            <div class="officer-sig-line"></div>
            <div class="officer-name">${safeString(cashierName, 'Special Collecting Officer')}</div>
            <div class="officer-title">Special Collecting Officer / Cashier</div>
            <div style="font-size: 8px; color: #64748b; margin-top: 2px;">${paymentStatusText}</div>
          </td>
        </tr>
      </table>
    </div>
  `;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order of Payment - ${opNumber}</title>
  <style>
    @media print {
      @page { margin: 8mm 10mm; size: A4 portrait; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 0 !important; }
      .no-print { display: none !important; }
      .cut-line { margin: 6mm 0 !important; }
    }
    body {
      font-family: Arial, Helvetica, sans-serif;
      color: #000000;
      margin: 0;
      padding: 12px;
      background-color: #ffffff;
      line-height: 1.25;
    }
    .print-btn-bar { position: fixed; top: 12px; right: 12px; z-index: 999; }
    .btn-print { background: #0f172a; color: #ffffff; border: none; padding: 8px 16px; border-radius: 4px; font-weight: 700; font-size: 12px; cursor: pointer; }
    
    .voucher-wrapper {
      border: 1.8px solid #000000;
      padding: 10px 14px;
      background: #ffffff;
      box-sizing: border-box;
    }
    .voucher-top-table { width: 100%; border-collapse: collapse; }
    .rep-title { font-size: 9.5px; text-transform: uppercase; color: #334155; }
    .ntc-title { font-size: 11px; font-weight: 800; letter-spacing: 0.3px; }
    .ro-title { font-size: 9.5px; font-weight: bold; }
    .fund-title { font-size: 9.5px; font-weight: bold; margin-top: 2px; }
    .serial-row { font-size: 9.5px; }
    .label-bold { font-weight: bold; }
    .val-underline { border-bottom: 1px solid #000000; padding: 0 4px; display: inline-block; min-width: 60px; }
    .mono-bold { font-family: monospace; font-weight: bold; font-size: 10.5px; }
    .bold-val { font-weight: bold; }
    
    .voucher-heading { text-align: center; margin: 6px 0 6px 0; }
    .op-main-title { font-size: 13px; font-weight: 900; letter-spacing: 0.8px; text-transform: uppercase; }
    .op-copy-subtitle { font-size: 8.5px; font-style: italic; color: #475569; }
    
    .voucher-body { font-size: 10px; line-height: 1.45; margin-bottom: 6px; }
    .officer-salutation { font-size: 10px; margin-bottom: 2px; }
    .sub-caption { font-size: 8px; color: #475569; font-style: italic; margin-bottom: 2px; }
    
    .bank-instruction { font-size: 9.5px; font-weight: bold; margin-bottom: 3px; }
    .bank-grid { width: 100%; border-collapse: collapse; border: 1px solid #000000; font-size: 9.5px; }
    .bank-grid th { border: 1px solid #000000; background: #f1f5f9; padding: 3px 6px; font-size: 9px; font-weight: bold; }
    .bank-grid td { border: 1px solid #000000; padding: 3px 6px; }
    .total-row { background: #f8fafc; }
    
    .voucher-footer-table { width: 100%; border-collapse: collapse; margin-top: 6px; }
    .or-stamp-box { border: 1px solid #000000; border-collapse: collapse; font-size: 9px; width: 100%; }
    .or-stamp-box td { border: 0.5px solid #000000; padding: 2px 4px; }
    
    .officer-sig-line { border-bottom: 1.2px solid #000000; width: 85%; margin: 0 auto 3px auto; height: 18px; }
    .officer-name { font-size: 10px; font-weight: bold; text-transform: uppercase; }
    .officer-title { font-size: 8.5px; font-style: italic; color: #475569; }
    
    .cut-line {
      text-align: center;
      margin: 10px 0;
      font-size: 8.5px;
      color: #64748b;
      letter-spacing: 2px;
      border-top: 1px dashed #94a3b8;
      padding-top: 2px;
    }
  </style>
</head>
<body>
  <div class="print-btn-bar no-print">
    <button class="btn-print" onclick="window.print()">Print Order of Payment</button>
  </div>

  <!-- Upper Voucher: Payor's Copy -->
  ${renderSingleVoucher("Payor's Copy")}

  <div class="cut-line">
    ✂ - - - - - - - - - - - - - - - - - - - - - CUT HERE - - - - - - - - - - - - - - - - - - - - - ✂
  </div>

  <!-- Lower Voucher: Collecting Officer's Copy -->
  ${renderSingleVoucher("Collecting Officer's Copy")}
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
