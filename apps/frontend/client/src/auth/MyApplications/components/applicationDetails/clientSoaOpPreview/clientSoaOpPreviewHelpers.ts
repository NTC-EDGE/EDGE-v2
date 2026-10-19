import { Platform, Linking } from 'react-native';
import { applicationService } from '@edge/api';
import { Application } from '../../../data/applicationsData';
import {
  generateSoaPrintableHtml,
  generateOpPrintableHtml,
  generateOrPrintableHtml,
  openPrintableDocumentWindow,
  formatAddress,
  numberToWords,
  getEffectiveApplicantName,
  getEffectiveLineItems,
  getEffectiveTotalAmount,
} from '../../../utils/clientSoaReportGenerator';
import { ClientReportTab } from './clientSoaOpPreviewTypes';

export function getPreviewApplicationMetadata(app: Application) {
  const refNum = app.referenceNumber || (app.id ? app.id.slice(0, 8).toUpperCase() : 'NTC-REF');
  const soaNum = app.soaNumber || `SOA-${refNum}`;
  const opNum = app.opNumber || `OP-${refNum}`;
  const orNum = app.officialReceiptNumber || app.op?.officialReceiptNumber || null;
  const isPaid = Boolean(orNum && orNum.trim().length > 0);
  const orList = orNum !== null
    ? orNum.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
    : [];

  const applicantName = getEffectiveApplicantName(app);
  const applicantType = app.mode === 'BULK' ? 'Corporate / Bulk Entity' : 'Individual';
  const contactNum = app.mobileNumber || 'N/A';
  const emailAddr = app.email || 'N/A';
  const formattedAddr = formatAddress(app);
  const lineItems = getEffectiveLineItems(app);
  const totalAmount = getEffectiveTotalAmount(app);
  const wordsTotal = numberToWords(totalAmount);
  const officeName = app.office || 'National Telecommunications Commission';
  const serviceName = app.serviceName || 'Application Services';
  const categoryName = app.serviceCategory || 'General';
  const filingMode = app.mode === 'BULK' ? 'Bulk Application' : 'Single Application';
  const dueDateFormatted = app.dueDate
    ? new Date(app.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '30 days from issuance';

  const paidDateFormatted = (app.paidAt || app.op?.paidAt)
    ? new Date(app.paidAt || app.op?.paidAt || '').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : dueDateFormatted;

  const paidAmount = app.amountPaid !== undefined && app.amountPaid !== null
    ? app.amountPaid
    : (app.op?.amountReceived !== undefined && app.op.amountReceived > 0
        ? app.op.amountReceived
        : totalAmount);
  const wordsPaid = numberToWords(paidAmount);

  return {
    refNum,
    soaNum,
    opNum,
    orNum,
    isPaid,
    orList,
    applicantName,
    applicantType,
    contactNum,
    emailAddr,
    formattedAddr,
    lineItems,
    totalAmount,
    wordsTotal,
    officeName,
    serviceName,
    categoryName,
    filingMode,
    dueDateFormatted,
    paidDateFormatted,
    paidAmount,
    wordsPaid,
  };
}

export async function handlePrintDocument(
  app: Application,
  activeTab: ClientReportTab,
  effectiveSelectedOr: string | null
): Promise<void> {
  if (typeof app.id === 'string' && app.id.trim().length > 0) {
    try {
      const selectedOrParam = effectiveSelectedOr !== null ? effectiveSelectedOr : undefined;
      const [pdfBlob, err] = activeTab === 'soa'
        ? await applicationService.previewSoaPdf(app.id)
        : activeTab === 'op'
          ? await applicationService.previewOpPdf(app.id)
          : await applicationService.previewOrPdf(app.id, selectedOrParam);

      if (pdfBlob !== null && err === null && Platform.OS === 'web' && typeof window !== 'undefined') {
        const blobUrl = window.URL.createObjectURL(pdfBlob);
        const printWindow = window.open(blobUrl, '_blank');
        if (printWindow !== null) {
          printWindow.focus();
          return;
        }
      }
    } catch (err: unknown) {
      console.warn('Direct blob fetch failed, falling back to direct URL open:', err);
    }

    const selectedOrParam = effectiveSelectedOr !== null ? effectiveSelectedOr : undefined;
    const url = activeTab === 'soa'
      ? applicationService.getSoaPrintUrl(app.id)
      : activeTab === 'op'
        ? applicationService.getOpPrintUrl(app.id)
        : applicationService.getOrPrintUrl(app.id, selectedOrParam);

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const printWin = window.open(url, '_blank');
      if (printWin !== null) {
        printWin.focus();
        return;
      }
    }
  }

  if (activeTab === 'soa') {
    const html = generateSoaPrintableHtml(
      app,
      app.office,
      app.soa?.preparedByName || app.evaluatingOfficer,
      app.soa?.approvedByName || app.issuingOfficer
    );
    openPrintableDocumentWindow(html);
  } else if (activeTab === 'op') {
    const html = generateOpPrintableHtml(app);
    openPrintableDocumentWindow(html);
  } else {
    const html = generateOrPrintableHtml(app);
    openPrintableDocumentWindow(html);
  }
}

export function handleDownloadSpecificDocument(
  app: Application,
  targetDoc: ClientReportTab,
  targetOrNumber?: string,
  effectiveSelectedOr?: string | null
): void {
  if (typeof app.id !== 'string' || app.id.trim().length === 0) return;
  const resolvedOr = (typeof targetOrNumber === 'string' && targetOrNumber.length > 0)
    ? targetOrNumber
    : (typeof effectiveSelectedOr === 'string' && effectiveSelectedOr.length > 0 ? effectiveSelectedOr : undefined);

  const url = targetDoc === 'soa'
    ? applicationService.getSoaPrintUrl(app.id)
    : targetDoc === 'op'
      ? applicationService.getOpPrintUrl(app.id)
      : applicationService.getOrPrintUrl(app.id, resolvedOr);

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.open(url, '_blank');
  } else {
    void Linking.openURL(url);
  }
}
