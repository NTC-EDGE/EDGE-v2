import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
  Linking,
} from 'react-native';
import { Icon as Lucide, useTheme } from '@edge/ui';
import {
  PendingPaymentDto,
  useAdminApplicationDetails,
  parsePaymentBreakdown,
  storageService,
  applicationService,
} from '@edge/api';
import { DocumentPreviewModal, DocumentPreviewFile } from '../../../shared/components/DocumentPreviewModal';

interface PendingPaymentDetailsModalProps {
  visible: boolean;
  payment: PendingPaymentDto | null;
  onClose: () => void;
  onEndorse?: (payment: PendingPaymentDto) => void;
  onIssueReceipt?: (payment: PendingPaymentDto) => void;
  canIssueReceipt?: boolean;
  canEndorse?: boolean;
}

type DetailsTab = 'overview' | 'billing' | 'particulars' | 'timeline';

export function PendingPaymentDetailsModal({
  visible,
  payment,
  onClose,
  onEndorse,
  onIssueReceipt,
  canIssueReceipt = true,
  canEndorse = true,
}: PendingPaymentDetailsModalProps) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [activeTab, setActiveTab] = useState<DetailsTab>('overview');
  const [previewProofDoc, setPreviewProofDoc] = useState<DocumentPreviewFile | null>(null);

  const applicationId = payment !== null ? payment.applicationId : undefined;
  const {
    applicationDto: app,
    isLoading: isLoadingDetails,
  } = useAdminApplicationDetails(applicationId);

  if (!visible || payment === null) {
    return null;
  }

  const billedDate = new Date(payment.billedAt);
  const formattedBilledDate = billedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const daysSinceBilled = Math.floor((Date.now() - billedDate.getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysSinceBilled >= 30;

  const breakdown = parsePaymentBreakdown(payment.remarks);

  // Applicant info resolution
  const primaryApplicant = app?.applicants && app.applicants.length > 0 ? app.applicants[0] : null;
  const applicantName =
    primaryApplicant?.details
      ? `${primaryApplicant.details.firstName} ${primaryApplicant.details.lastName}`.trim()
      : payment.applicantName;
  const applicantEmail =
    primaryApplicant?.details?.email ??
    primaryApplicant?.details?.emailAddress ??
    app?.filingUser?.email ??
    'N/A';
  const applicantPhone =
    primaryApplicant?.details?.contactNumber ??
    primaryApplicant?.company?.contactNumber ??
    'N/A';
  const applicantAddress =
    primaryApplicant?.details?.address ??
    primaryApplicant?.company?.address ??
    payment.payorAddress ??
    'N/A';
  const companyName = primaryApplicant?.company?.name ?? app?.filingUser?.company?.name ?? null;

  const handleOpenPrintOp = () => {
    if (payment.applicationId) {
      const url = applicationService.getOpPrintUrl(payment.applicationId);
      if (typeof window !== 'undefined') {
        const win = window.open(url, '_blank');
        if (win !== null) {
          win.focus();
        }
      } else {
        Linking.openURL(url);
      }
    }
  };

  const handleOpenProofFile = (fileId: string, proofFileName?: string) => {
    const url = storageService.getFileDownloadUrl(fileId, payment.tenantId);
    setPreviewProofDoc({
      uri: url,
      name: proofFileName || 'Check / Payment Proof',
      category: 'Proof of Payment',
      type: 'IMAGE',
      referenceNumber: payment.referenceNumber ?? undefined,
      applicantName: payment.payorName ?? undefined,
    });
  };

  return (
    <>
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: colors.cardBg,
              borderColor: colors.border,
              maxWidth: isMobile ? '96%' : 840,
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.headerIconBox, { backgroundColor: colors.brand.indigoLight }]}>
                <Lucide name="file-text" size={22} color={colors.brand.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.headerTitleRow}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Application Details</Text>
                  <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }]}>
                    <View style={[styles.statusDot, { backgroundColor: '#16A34A' }]} />
                    <Text style={[styles.statusText, { color: '#166534' }]}>SUBJECT FOR PAYMENT</Text>
                  </View>
                  {isOverdue && (
                    <View style={[styles.statusBadge, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}>
                      <Lucide name="alert-triangle" size={11} color="#DC2626" />
                      <Text style={[styles.statusText, { color: '#B91C1C' }]}>PAYMENT OVERDUE</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                  Ref #{payment.referenceNumber || payment.applicationNumber || 'N/A'} • OP: {payment.opNumber} • Billed: {formattedBilledDate} ({daysSinceBilled}d ago)
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.neutral[100] }]}
            >
              <Lucide name="x" size={18} color={colors.neutral[600]} />
            </TouchableOpacity>
          </View>

          {/* Sub-Navigation Tabs */}
          <View style={[styles.tabBar, { borderBottomColor: colors.border, backgroundColor: colors.neutral[50] }]}>
            <TouchableOpacity
              onPress={() => setActiveTab('overview')}
              style={[
                styles.tabBtn,
                activeTab === 'overview' && { borderBottomColor: colors.brand.primary },
              ]}
            >
              <Lucide
                name="user"
                size={14}
                color={activeTab === 'overview' ? colors.brand.primary : colors.neutral[600]}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  { color: activeTab === 'overview' ? colors.brand.primary : colors.neutral[600] },
                  activeTab === 'overview' && { fontWeight: '700' },
                ]}
              >
                Applicant & Service
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('billing')}
              style={[
                styles.tabBtn,
                activeTab === 'billing' && { borderBottomColor: colors.brand.primary },
              ]}
            >
              <Lucide
                name="credit-card"
                size={14}
                color={activeTab === 'billing' ? colors.brand.primary : colors.neutral[600]}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  { color: activeTab === 'billing' ? colors.brand.primary : colors.neutral[600] },
                  activeTab === 'billing' && { fontWeight: '700' },
                ]}
              >
                Billing & Payment Proof
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('particulars')}
              style={[
                styles.tabBtn,
                activeTab === 'particulars' && { borderBottomColor: colors.brand.primary },
              ]}
            >
              <Lucide
                name="layers"
                size={14}
                color={activeTab === 'particulars' ? colors.brand.primary : colors.neutral[600]}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  { color: activeTab === 'particulars' ? colors.brand.primary : colors.neutral[600] },
                  activeTab === 'particulars' && { fontWeight: '700' },
                ]}
              >
                Service Particulars & Forms
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('timeline')}
              style={[
                styles.tabBtn,
                activeTab === 'timeline' && { borderBottomColor: colors.brand.primary },
              ]}
            >
              <Lucide
                name="clock"
                size={14}
                color={activeTab === 'timeline' ? colors.brand.primary : colors.neutral[600]}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  { color: activeTab === 'timeline' ? colors.brand.primary : colors.neutral[600] },
                  activeTab === 'timeline' && { fontWeight: '700' },
                ]}
              >
                Audit Timeline
              </Text>
            </TouchableOpacity>
          </View>

          {/* Modal Body */}
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {isLoadingDetails && (
              <View style={styles.inlineLoading}>
                <ActivityIndicator size="small" color={colors.brand.primary} />
                <Text style={[styles.inlineLoadingText, { color: colors.textMuted }]}>
                  Fetching latest application metadata...
                </Text>
              </View>
            )}

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <View style={styles.tabContent}>
                {/* Service Info Box */}
                <View style={[styles.infoCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  <View style={styles.infoCardHeader}>
                    <Lucide name="award" size={16} color={colors.brand.primary} />
                    <Text style={[styles.infoCardTitle, { color: colors.text }]}>Service Applied</Text>
                  </View>
                  <View style={styles.infoGrid}>
                    <View style={styles.infoCol}>
                      <Text style={[styles.infoLabel, { color: colors.textMuted }]}>SERVICE NAME</Text>
                      <Text style={[styles.infoValueBold, { color: colors.text }]}>{payment.serviceName}</Text>
                    </View>
                    <View style={styles.infoCol}>
                      <Text style={[styles.infoLabel, { color: colors.textMuted }]}>CATEGORY</Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>{payment.serviceCategory || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoCol}>
                      <Text style={[styles.infoLabel, { color: colors.textMuted }]}>SUBMISSION MODE</Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>{app?.submissionMode || 'Online'}</Text>
                    </View>
                  </View>
                </View>

                {/* Applicant Info Box */}
                <View style={[styles.infoCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  <View style={styles.infoCardHeader}>
                    <Lucide name="user" size={16} color={colors.brand.primary} />
                    <Text style={[styles.infoCardTitle, { color: colors.text }]}>Applicant Information</Text>
                  </View>
                  <View style={styles.infoGrid}>
                    <View style={styles.infoCol}>
                      <Text style={[styles.infoLabel, { color: colors.textMuted }]}>FULL NAME / PAYOR</Text>
                      <Text style={[styles.infoValueBold, { color: colors.text }]}>{applicantName}</Text>
                      <Text style={[styles.infoSubText, { color: colors.textMuted }]}>Type: {payment.applicantType}</Text>
                    </View>
                    <View style={styles.infoCol}>
                      <Text style={[styles.infoLabel, { color: colors.textMuted }]}>EMAIL ADDRESS</Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>{applicantEmail}</Text>
                    </View>
                    <View style={styles.infoCol}>
                      <Text style={[styles.infoLabel, { color: colors.textMuted }]}>CONTACT NUMBER</Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>{applicantPhone}</Text>
                    </View>
                  </View>

                  <View style={[styles.infoRowFull, { borderTopColor: colors.border }]}>
                    <Text style={[styles.infoLabel, { color: colors.textMuted }]}>REGISTERED ADDRESS</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>{applicantAddress}</Text>
                  </View>

                  {companyName !== null && (
                    <View style={[styles.infoRowFull, { borderTopColor: colors.border }]}>
                      <Text style={[styles.infoLabel, { color: colors.textMuted }]}>AFFILIATED COMPANY / ENTITY</Text>
                      <Text style={[styles.infoValueBold, { color: colors.text }]}>{companyName}</Text>
                    </View>
                  )}
                </View>

                {/* Assigned Officers */}
                {app !== null && (
                  <View style={[styles.infoCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                    <View style={styles.infoCardHeader}>
                      <Lucide name="users" size={16} color={colors.brand.primary} />
                      <Text style={[styles.infoCardTitle, { color: colors.text }]}>Workflow Processing Staff</Text>
                    </View>
                    <View style={styles.infoGrid}>
                      <View style={styles.infoCol}>
                        <Text style={[styles.infoLabel, { color: colors.textMuted }]}>EVALUATING OFFICER</Text>
                        <Text style={[styles.infoValue, { color: colors.text }]}>
                          {app.evaluatingOfficer || app.assignedOfficerName || 'Assigned to Evaluation Pool'}
                        </Text>
                      </View>
                      <View style={styles.infoCol}>
                        <Text style={[styles.infoLabel, { color: colors.textMuted }]}>ACCOUNTING OFFICER</Text>
                        <Text style={[styles.infoValue, { color: colors.text }]}>
                          {app.accountingOfficer || 'Assigned to Accounting Pool'}
                        </Text>
                      </View>
                      <View style={styles.infoCol}>
                        <Text style={[styles.infoLabel, { color: colors.textMuted }]}>COLLECTING CASHIER</Text>
                        <Text style={[styles.infoValue, { color: colors.text }]}>
                          {app.cashierOfficer || 'Pending Collection'}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* TAB 2: BILLING & PAYMENT PROOF */}
            {activeTab === 'billing' && (
              <View style={styles.tabContent}>
                {/* Billing Summary Banner */}
                <View style={[styles.billingHero, { backgroundColor: colors.neutral[50], borderColor: colors.border }]}>
                  <View style={styles.billingHeroRow}>
                    <View style={styles.billingHeroItem}>
                      <Text style={[styles.billingHeroLabel, { color: colors.textMuted }]}>TOTAL AMOUNT DUE</Text>
                      <Text style={[styles.billingHeroValue, { color: colors.semantic.successText }]}>
                        ₱{(payment.amountDue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Text>
                    </View>

                    <View style={styles.billingHeroItem}>
                      <Text style={[styles.billingHeroLabel, { color: colors.textMuted }]}>AMOUNT RECEIVED</Text>
                      <Text style={[styles.billingHeroValue, { color: colors.text }]}>
                        ₱{(payment.amountReceived ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Text>
                    </View>

                    <View style={styles.billingHeroItem}>
                      <Text style={[styles.billingHeroLabel, { color: colors.textMuted }]}>REMAINING BALANCE</Text>
                      <Text
                        style={[
                          styles.billingHeroValue,
                          {
                            color:
                              (payment.remainingBalance ?? payment.amountDue) > 0
                                ? colors.semantic.warningText
                                : colors.semantic.successText,
                          },
                        ]}
                      >
                        ₱{(payment.remainingBalance ?? payment.amountDue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.billingDocLinks, { borderTopColor: colors.border }]}>
                    <TouchableOpacity
                      onPress={handleOpenPrintOp}
                      style={[styles.docLinkBtn, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
                    >
                      <Lucide name="printer" size={14} color={colors.brand.primary} />
                      <Text style={[styles.docLinkText, { color: colors.brand.primary }]}>Print Official OP Document</Text>
                    </TouchableOpacity>
                    <Text style={[styles.docRefText, { color: colors.textMuted }]}>
                      SOA Ref: {payment.soaNumber || 'N/A'} • OP: {payment.opNumber}
                    </Text>
                  </View>
                </View>

                {/* Particulars Table */}
                <View style={[styles.infoCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  <View style={styles.infoCardHeader}>
                    <Lucide name="list" size={16} color={colors.brand.primary} />
                    <Text style={[styles.infoCardTitle, { color: colors.text }]}>Particulars & Fee Computation</Text>
                  </View>

                  <View style={styles.particularsTable}>
                    <View style={[styles.tableHeader, { backgroundColor: colors.neutral[100], borderColor: colors.border }]}>
                      <Text style={[styles.thCode, { color: colors.textMuted }]}>FEE CODE</Text>
                      <Text style={[styles.thDesc, { color: colors.textMuted }]}>DESCRIPTION</Text>
                      <Text style={[styles.thAmt, { color: colors.textMuted }]}>AMOUNT (₱)</Text>
                    </View>

                    {payment.lineItems && payment.lineItems.length > 0 ? (
                      payment.lineItems.map((item, idx) => (
                        <View key={idx} style={[styles.tableRow, { borderBottomColor: colors.border }]}>
                          <Text style={[styles.tdCode, { color: colors.brand.primary }]}>{item.feeCode}</Text>
                          <Text style={[styles.tdDesc, { color: colors.text }]}>{item.description}</Text>
                          <Text style={[styles.tdAmt, { color: colors.text }]}>
                            ₱{(item.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <View style={styles.emptyTableBox}>
                        <Text style={[styles.emptyTableText, { color: colors.textMuted }]}>
                          No statutory fee line items recorded for this OP.
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Client Preferred Payment & Uploaded Proof */}
                <View style={[styles.infoCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  <View style={styles.infoCardHeader}>
                    <Lucide name="check-square" size={16} color={colors.brand.primary} />
                    <Text style={[styles.infoCardTitle, { color: colors.text }]}>Client Submitted Payment & Proof</Text>
                  </View>

                  {breakdown !== null ? (
                    <View style={{ gap: 10 }}>
                      <View style={[styles.prefTag, { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' }]}>
                        <Lucide name="layers" size={14} color="#6D28D9" />
                        <Text style={{ fontSize: 13, fontWeight: '700', color: '#4C1D95' }}>
                          Preference: {breakdown.isCombination ? 'Combination / Split Payment' : breakdown.items[0]?.mode}
                        </Text>
                      </View>

                      {breakdown.items.map((item, idx) => (
                        <View key={idx} style={[styles.paymentItemBox, { borderColor: colors.border, backgroundColor: colors.neutral[50] }]}>
                          <View style={styles.paymentItemHeader}>
                            <Text style={[styles.paymentItemMode, { color: colors.brand.primary }]}>{item.mode}</Text>
                            <Text style={[styles.paymentItemAmount, { color: colors.text }]}>
                              ₱{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Text>
                          </View>

                          {item.mode === 'Check' && (
                            <Text style={[styles.paymentItemSub, { color: colors.textMuted }]}>
                              Bank: {item.checkBank || 'Not Specified'} • Check #: {item.checkNumber || 'N/A'} • Date: {item.checkDate || 'N/A'}
                            </Text>
                          )}

                          {item.mode === 'Online' && (
                            <Text style={[styles.paymentItemSub, { color: colors.textMuted }]}>
                              Gateway Reference #: {item.referenceNumber || 'N/A'}
                            </Text>
                          )}

                          {item.proofFileId && (
                            <TouchableOpacity
                              onPress={() => item.proofFileId && handleOpenProofFile(item.proofFileId, item.proofFileName)}
                              style={[styles.proofBtn, { backgroundColor: colors.brand.indigoLight }]}
                            >
                              <Lucide name="image" size={13} color={colors.brand.primary} />
                              <Text style={[styles.proofBtnText, { color: colors.brand.primary }]}>
                                View Uploaded Check/Proof Photo ({item.proofFileName || 'Attachment'})
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      ))}

                      {breakdown.proofOfPaymentFileId && (
                        <TouchableOpacity
                          onPress={() => breakdown.proofOfPaymentFileId && handleOpenProofFile(breakdown.proofOfPaymentFileId, breakdown.proofFileName)}
                          style={[styles.proofBtn, { backgroundColor: '#F0FDF4', borderColor: '#86EFAC' }]}
                        >
                          <Lucide name="file-text" size={14} color="#16A34A" />
                          <Text style={[styles.proofBtnText, { color: '#166534' }]}>
                            View Main Payment Receipt Proof ({breakdown.proofFileName || 'Document'})
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ) : payment.checkBank || payment.checkNumber || payment.paymentMethod === 'Check' ? (
                    <View style={[styles.paymentItemBox, { borderColor: colors.border, backgroundColor: colors.neutral[50] }]}>
                      <View style={styles.paymentItemHeader}>
                        <Text style={[styles.paymentItemMode, { color: '#0284C7' }]}>Payment Method: Check</Text>
                      </View>
                      <Text style={[styles.paymentItemSub, { color: colors.text }]}>
                        Bank: {payment.checkBank || 'Not Specified'} • Check #: {payment.checkNumber || 'N/A'}
                      </Text>
                      {payment.checkDate && (
                        <Text style={[styles.paymentItemSub, { color: colors.textMuted }]}>
                          Check Date: {new Date(payment.checkDate).toLocaleDateString('en-US')}
                        </Text>
                      )}
                    </View>
                  ) : payment.paymentReferenceNumber || payment.paymentMethod === 'Online' ? (
                    <View style={[styles.paymentItemBox, { borderColor: colors.border, backgroundColor: colors.neutral[50] }]}>
                      <View style={styles.paymentItemHeader}>
                        <Text style={[styles.paymentItemMode, { color: '#16A34A' }]}>Payment Method: Online Gateway</Text>
                      </View>
                      <Text style={[styles.paymentItemSub, { color: colors.text }]}>
                        Reference Number: {payment.paymentReferenceNumber || 'N/A'}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.emptyTableBox}>
                      <Text style={[styles.emptyTableText, { color: colors.textMuted }]}>
                        Client has not selected an online/check preference. Default method: Cash payment at Counter.
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* TAB 3: SERVICE PARTICULARS & FORMS */}
            {activeTab === 'particulars' && (
              <View style={styles.tabContent}>
                {/* Form Fields / Radio Specifications */}
                <View style={[styles.infoCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  <View style={styles.infoCardHeader}>
                    <Lucide name="sliders" size={16} color={colors.brand.primary} />
                    <Text style={[styles.infoCardTitle, { color: colors.text }]}>Service Specifications & Particulars</Text>
                  </View>

                  {primaryApplicant?.formFieldValues && primaryApplicant.formFieldValues.length > 0 ? (
                    <View style={styles.fieldValuesGrid}>
                      {primaryApplicant.formFieldValues.map((fv, fIdx) => (
                        <View key={fIdx} style={styles.fieldValueItem}>
                          <Text style={[styles.fieldValueLabel, { color: colors.textMuted }]}>
                            {fv.fieldLabel || fv.fieldId}
                          </Text>
                          <Text style={[styles.fieldValueText, { color: colors.text }]}>
                            {fv.value || 'None'}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.emptyTableBox}>
                      <Text style={[styles.emptyTableText, { color: colors.textMuted }]}>
                        Standard application particulars recorded in service metadata: {payment.serviceName}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Issued Statutory Documents (if pre-configured) */}
                {app?.issuedDocumentDetails && app.issuedDocumentDetails.length > 0 && (
                  <View style={[styles.infoCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                    <View style={styles.infoCardHeader}>
                      <Lucide name="shield" size={16} color={colors.brand.primary} />
                      <Text style={[styles.infoCardTitle, { color: colors.text }]}>Configured Document Particulars</Text>
                    </View>
                    {app.issuedDocumentDetails.map((doc, dIdx) => (
                      <View key={dIdx} style={[styles.docDetailBox, { borderColor: colors.border, backgroundColor: colors.neutral[50] }]}>
                        <Text style={[styles.docTypeTitle, { color: colors.text }]}>{doc.documentType} (Form #{doc.formNumber})</Text>
                        <View style={styles.fieldValuesGrid}>
                          {doc.callSign && (
                            <View style={styles.fieldValueItem}>
                              <Text style={[styles.fieldValueLabel, { color: colors.textMuted }]}>Call Sign</Text>
                              <Text style={[styles.fieldValueText, { color: colors.text }]}>{doc.callSign}</Text>
                            </View>
                          )}
                          {doc.frequencyBand && (
                            <View style={styles.fieldValueItem}>
                              <Text style={[styles.fieldValueLabel, { color: colors.textMuted }]}>Frequency Band</Text>
                              <Text style={[styles.fieldValueText, { color: colors.text }]}>{doc.frequencyBand}</Text>
                            </View>
                          )}
                          {doc.licenseNumber && (
                            <View style={styles.fieldValueItem}>
                              <Text style={[styles.fieldValueLabel, { color: colors.textMuted }]}>License #</Text>
                              <Text style={[styles.fieldValueText, { color: colors.text }]}>{doc.licenseNumber}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* TAB 4: AUDIT TIMELINE */}
            {activeTab === 'timeline' && (
              <View style={styles.tabContent}>
                <View style={[styles.infoCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  <View style={styles.infoCardHeader}>
                    <Lucide name="git-commit" size={16} color={colors.brand.primary} />
                    <Text style={[styles.infoCardTitle, { color: colors.text }]}>Application Audit Trail & Timeline</Text>
                  </View>

                  {app?.histories && app.histories.length > 0 ? (
                    <View style={styles.timelineList}>
                      {app.histories.map((hist, hIdx) => {
                        const histDate = new Date(hist.timestamp).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        });

                        return (
                          <View key={hIdx} style={styles.timelineItem}>
                            <View style={[styles.timelineDot, { backgroundColor: colors.brand.primary }]} />
                            <View style={styles.timelineContent}>
                              <View style={styles.timelineHeader}>
                                <Text style={[styles.timelineAction, { color: colors.text }]}>{hist.action}</Text>
                                <Text style={[styles.timelineDate, { color: colors.textMuted }]}>{histDate}</Text>
                              </View>
                              <Text style={[styles.timelineStaff, { color: colors.textMuted }]}>
                                By: {hist.staffName || 'System'} {hist.staffRole ? `(${hist.staffRole})` : ''}
                              </Text>
                              {hist.remarks && hist.remarks.trim().length > 0 && (
                                <View style={[styles.timelineRemarksBox, { backgroundColor: colors.neutral[100] }]}>
                                  <Text style={[styles.timelineRemarksText, { color: colors.neutral[700] }]}>
                                    {hist.remarks}
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  ) : (
                    <View style={styles.emptyTableBox}>
                      <Text style={[styles.emptyTableText, { color: colors.textMuted }]}>
                        No historical audit events logged yet.
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Modal Footer Actions */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeActionBtn, { borderColor: colors.border }]}
            >
              <Text style={[styles.closeActionBtnText, { color: colors.neutral[700] }]}>Close</Text>
            </TouchableOpacity>

            <View style={styles.footerRight}>
              {canEndorse && onEndorse !== undefined && (
                <TouchableOpacity
                  onPress={() => onEndorse(payment)}
                  style={[styles.endorseActionBtn, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}
                >
                  <Lucide name="corner-up-left" size={15} color="#D97706" />
                  <Text style={[styles.endorseActionBtnText, { color: '#B45309' }]}>
                    Endorse for Re-Review
                  </Text>
                </TouchableOpacity>
              )}

              {canIssueReceipt && onIssueReceipt !== undefined && (
                <TouchableOpacity
                  onPress={() => onIssueReceipt(payment)}
                  style={[styles.issueActionBtn, { backgroundColor: colors.brand.primary }]}
                >
                  <Lucide name="printer" size={15} color="#FFFFFF" />
                  <Text style={styles.issueActionBtnText}>Collect & Issue OR</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>

    {previewProofDoc !== null && (
      <DocumentPreviewModal
        visible={previewProofDoc !== null}
        file={previewProofDoc}
        onClose={() => setPreviewProofDoc(null)}
        label={previewProofDoc?.name}
      />
    )}
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerIconBox: {
    width: 42,
    height: 42,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 12,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    maxHeight: 520,
  },
  tabContent: {
    gap: 14,
  },
  inlineLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    marginBottom: 8,
  },
  inlineLoadingText: {
    fontSize: 12,
  },
  infoCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoCardTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  infoCol: {
    flex: 1,
    minWidth: 180,
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  infoValueBold: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  infoValue: {
    fontSize: 13,
    marginTop: 2,
  },
  infoSubText: {
    fontSize: 11,
    marginTop: 1,
  },
  infoRowFull: {
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 4,
  },
  billingHero: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  billingHeroRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  billingHeroItem: {
    flex: 1,
    minWidth: 140,
  },
  billingHeroLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  billingHeroValue: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
  },
  billingDocLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
    borderTopWidth: 1,
    paddingTop: 10,
  },
  docLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  docLinkText: {
    fontSize: 12,
    fontWeight: '700',
  },
  docRefText: {
    fontSize: 11,
  },
  particularsTable: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  thCode: {
    width: 80,
    fontSize: 10,
    fontWeight: '700',
  },
  thDesc: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
  },
  thAmt: {
    width: 100,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  tdCode: {
    width: 80,
    fontSize: 11,
    fontWeight: '700',
  },
  tdDesc: {
    flex: 1,
    fontSize: 12,
  },
  tdAmt: {
    width: 100,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  emptyTableBox: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTableText: {
    fontSize: 12,
    textAlign: 'center',
  },
  prefTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  paymentItemBox: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    gap: 4,
  },
  paymentItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentItemMode: {
    fontSize: 13,
    fontWeight: '700',
  },
  paymentItemAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  paymentItemSub: {
    fontSize: 12,
  },
  proofBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  proofBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  fieldValuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  fieldValueItem: {
    minWidth: 160,
    flex: 1,
  },
  fieldValueLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  fieldValueText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 1,
  },
  docDetailBox: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    gap: 8,
  },
  docTypeTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  timelineList: {
    gap: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 10,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    gap: 2,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  timelineAction: {
    fontSize: 12,
    fontWeight: '700',
  },
  timelineDate: {
    fontSize: 10,
  },
  timelineStaff: {
    fontSize: 11,
  },
  timelineRemarksBox: {
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  timelineRemarksText: {
    fontSize: 11,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    flexWrap: 'wrap',
    gap: 10,
  },
  closeActionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
  },
  closeActionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  endorseActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
  },
  endorseActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  issueActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  issueActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
