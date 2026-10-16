import React from "react";
import { ScrollView, View } from "react-native";
import { SoaPaymentTabProps } from "./reviewTypes";
import { reviewStyles as styles } from "./reviewStyles";
import { AuditTrailEntry, ApplicantItem } from "../../../../types/application";
import { SoaEmptyState } from "./soaPayment/SoaEmptyState";
import { SoaStatusBanners } from "./soaPayment/SoaStatusBanners";
import { SoaParticularsTable } from "./soaPayment/SoaParticularsTable";
import { SoaPaymentSummary } from "./soaPayment/SoaPaymentSummary";

export function SoaPaymentTab({
  app,
  isEditable,
  updateApplication,
  onOpenGenerateSoa,
  onPreviewReport,
}: SoaPaymentTabProps) {
  const hasSoa = app.soaItems.length > 0 || app.totalAmountDue > 0;
  const hasPayment = app.payment.amountReceived > 0 || app.payment.orNumber.trim().length > 0;

  const hasIncompleteApplicants = app.applicantsList?.some((a: ApplicantItem) => a.status === 'Incomplete') ?? false;
  const isEvaluationReady =
    (app.status === 'Evaluating' || app.status === 'Approved' || app.status === 'Returned') &&
    !hasIncompleteApplicants;

  const canGenerateSoa = isEditable && isEvaluationReady;

  if (!hasSoa) {
    return (
      <SoaEmptyState
        app={app}
        isEditable={isEditable}
        canGenerateSoa={canGenerateSoa}
        isEvaluationReady={isEvaluationReady}
        onOpenGenerateSoa={onOpenGenerateSoa}
      />
    );
  }

  const isForAccountant = app.status === 'ForAccountant';
  const isPendingPayment = app.status === 'PendingPayment';
  const isPaymentSubmitted = Boolean(
    (app.payment && (app.payment.amountReceived > 0 || app.payment.orNumber.trim().length > 0 || (app.payment.checkNumber && app.payment.checkNumber.trim().length > 0))) ||
    (app.note && (app.note.toLowerCase().includes('payment submitted') || app.note.toLowerCase().includes('ref:'))) ||
    (app.history && app.history.some((h: AuditTrailEntry) => h.action.toLowerCase().includes('payment submitted') || h.action.toLowerCase().includes('submit payment')))
  );
  const isSoaReturned =
    app.status === 'Returned' ||
    app.soaStatus === 'Returned' ||
    (app.note !== undefined && (app.note.includes('SOA returned') || app.note.includes('Returned by Accountant'))) ||
    (app.status === 'Evaluating' && app.correctionAuditTrail.some(c => c.action.includes('Returned by Accountant') || c.action.includes('SOA Returned')));

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <SoaStatusBanners
        isForAccountant={isForAccountant}
        isPendingPayment={isPendingPayment}
        isPaymentSubmitted={isPaymentSubmitted}
        isSoaReturned={isSoaReturned}
        note={app.note}
      />

      <SoaParticularsTable
        app={app}
        isEditable={isEditable}
        hasPayment={hasPayment}
        isForAccountant={isForAccountant}
        isSoaReturned={isSoaReturned}
        onOpenGenerateSoa={onOpenGenerateSoa}
        onPreviewReport={onPreviewReport}
        updateApplication={updateApplication}
      />

      <SoaPaymentSummary
        app={app}
        isEditable={isEditable}
        hasPayment={hasPayment}
        isPaymentSubmitted={isPaymentSubmitted}
        updateApplication={updateApplication}
      />

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}
