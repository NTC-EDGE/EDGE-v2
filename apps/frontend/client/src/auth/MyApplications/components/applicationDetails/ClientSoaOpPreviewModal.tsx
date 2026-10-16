import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
  useWindowDimensions,
} from 'react-native';
import {
  Icon,
  SPACING,
  TYPOGRAPHY,
} from '@edge/ui';
import { applicationService } from '@edge/api';
import { Application } from '../../data/applicationsData';
import {
  generateSoaPrintableHtml,
  generateOpPrintableHtml,
  generateOrPrintableHtml,
  openPrintableDocumentWindow,
  formatAddress,
  formatCurrency,
  numberToWords,
  getEffectiveApplicantName,
  getEffectiveLineItems,
  getEffectiveTotalAmount,
} from '../../utils/clientSoaReportGenerator';

export type ClientReportTab = 'soa' | 'op' | 'or';

interface ClientSoaOpPreviewModalProps {
  visible: boolean;
  app: Application;
  initialTab?: ClientReportTab;
  onClose: () => void;
  onProceedToPayment?: () => void;
}

export function ClientSoaOpPreviewModal({
  visible,
  app,
  initialTab = 'soa',
  onClose,
  onProceedToPayment,
}: ClientSoaOpPreviewModalProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [activeTab, setActiveTab] = useState<ClientReportTab>(initialTab);
  const [viewFormat, setViewFormat] = useState<'pdf' | 'grid'>('pdf');
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [showActionMenu, setShowActionMenu] = useState<boolean>(false);

  const refNum = app.referenceNumber || (app.id ? app.id.slice(0, 8).toUpperCase() : 'NTC-REF');
  const soaNum = app.soaNumber || `SOA-${refNum}`;
  const opNum = app.opNumber || `OP-${refNum}`;
  const orNum = app.officialReceiptNumber || app.op?.officialReceiptNumber || null;
  const isPaid = Boolean(orNum && orNum.trim().length > 0);

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

  useEffect(() => {
    if (visible) {
      setActiveTab(initialTab);
      setViewFormat('pdf');
      setShowActionMenu(false);
    }
  }, [visible, initialTab]);

  useEffect(() => {
    if (!showActionMenu) return;
    const handleOutsideClick = () => {
      setShowActionMenu(false);
    };
    if (typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        window.addEventListener('click', handleOutsideClick);
        window.addEventListener('blur', handleOutsideClick);
      }, 50);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('click', handleOutsideClick);
        window.removeEventListener('blur', handleOutsideClick);
      };
    }
  }, [showActionMenu]);

  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    if (Platform.OS === 'web' && viewFormat === 'pdf' && typeof app.id === 'string' && app.id.trim().length > 0) {
      setIsLoadingPdf(true);
      setPdfError(null);
      setPdfBlobUrl(null);

      const loadBlob = async () => {
        try {
          const [blob, err] = activeTab === 'soa'
            ? await applicationService.previewSoaPdf(app.id)
            : activeTab === 'op'
              ? await applicationService.previewOpPdf(app.id)
              : await applicationService.previewOrPdf(app.id);

          if (!active) return;

          if (err !== null || blob === null) {
            const errDetail = typeof err === 'string' && err.trim().length > 0
              ? err
              : `Unable to load official ${activeTab.toUpperCase()} PDF template.`;
            setPdfError(errDetail);
            setIsLoadingPdf(false);
            return;
          }

          if (typeof window !== 'undefined') {
            createdUrl = window.URL.createObjectURL(blob);
            setPdfBlobUrl(createdUrl);
            setIsLoadingPdf(false);
          }
        } catch (fetchErr: unknown) {
          if (!active) return;
          const errorMessage = fetchErr instanceof Error ? fetchErr.message : 'Error loading official PDF';
          setPdfError(errorMessage);
          setIsLoadingPdf(false);
        }
      };

      void loadBlob();
    } else {
      setIsLoadingPdf(false);
      setPdfError(null);
    }

    return () => {
      active = false;
      if (createdUrl !== null && typeof window !== 'undefined') {
        window.URL.revokeObjectURL(createdUrl);
      }
    };
  }, [app.id, activeTab, viewFormat, reloadKey]);

  if (!visible) return null;

  const handlePrint = async () => {
    if (typeof app.id === 'string' && app.id.trim().length > 0) {
      try {
        const [pdfBlob, err] = activeTab === 'soa'
          ? await applicationService.previewSoaPdf(app.id)
          : activeTab === 'op'
            ? await applicationService.previewOpPdf(app.id)
            : await applicationService.previewOrPdf(app.id);

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

      const url = activeTab === 'soa'
        ? applicationService.getSoaPrintUrl(app.id)
        : activeTab === 'op'
          ? applicationService.getOpPrintUrl(app.id)
          : applicationService.getOrPrintUrl(app.id);

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const printWin = window.open(url, '_blank');
        if (printWin !== null) {
          printWin.focus();
          return;
        }
      }
    }

    if (activeTab === 'soa') {
      const html = generateSoaPrintableHtml(app);
      openPrintableDocumentWindow(html);
    } else if (activeTab === 'op') {
      const html = generateOpPrintableHtml(app);
      openPrintableDocumentWindow(html);
    } else {
      const html = generateOrPrintableHtml(app);
      openPrintableDocumentWindow(html);
    }
  };

  const handleDownloadSpecificPdf = (targetDoc: ClientReportTab) => {
    if (typeof app.id !== 'string' || app.id.trim().length === 0) return;
    const url = targetDoc === 'soa'
      ? applicationService.getSoaPrintUrl(app.id)
      : targetDoc === 'op'
        ? applicationService.getOpPrintUrl(app.id)
        : applicationService.getOrPrintUrl(app.id);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(url, '_blank');
    } else {
      void Linking.openURL(url);
    }
  };

  const handleDownloadPdf = () => {
    handleDownloadSpecificPdf(activeTab);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { maxWidth: 920, width: '100%' }]}>
          {/* Top Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.headerIconCircle,
                  activeTab === 'or'
                    ? { backgroundColor: '#ECFDF5' }
                    : activeTab === 'op'
                    ? { backgroundColor: '#F0FDF4' }
                    : { backgroundColor: '#E0F2FE' },
                ]}
              >
                <Icon
                  name={activeTab === 'or' ? 'check-circle' : activeTab === 'op' ? 'credit-card' : 'file-text'}
                  size={20}
                  color={activeTab === 'or' ? '#059669' : activeTab === 'op' ? '#047857' : '#0284C7'}
                />
              </View>
              <View>
                <Text style={styles.modalTitle}>
                  Application Reports • {activeTab === 'or'
                    ? 'Official Receipt (OR)'
                    : activeTab === 'op'
                    ? 'Order of Payment (OP)'
                    : 'Statement of Account (SOA)'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  Ref #{refNum} • {applicantName}
                </Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              {Platform.OS === 'web' && (
                <View style={styles.formatSwitcher}>
                  <TouchableOpacity
                    style={[styles.formatBtn, viewFormat === 'pdf' && styles.formatBtnActive]}
                    onPress={() => {
                      setViewFormat('pdf');
                      setShowActionMenu(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <Icon name="file-text" size={13} color={viewFormat === 'pdf' ? '#0369A1' : '#64748B'} />
                    <Text style={[styles.formatBtnText, viewFormat === 'pdf' && styles.formatBtnTextActive]}>
                      PDF Template
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.formatBtn, viewFormat === 'grid' && styles.formatBtnActive]}
                    onPress={() => {
                      setViewFormat('grid');
                      setShowActionMenu(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <Icon name="layout" size={13} color={viewFormat === 'grid' ? '#0369A1' : '#64748B'} />
                    <Text style={[styles.formatBtnText, viewFormat === 'grid' && styles.formatBtnTextActive]}>
                      Data View
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.printBtn,
                  activeTab === 'or'
                    ? { backgroundColor: '#10B981' }
                    : activeTab === 'op'
                    ? { backgroundColor: '#059669' }
                    : { backgroundColor: '#0284C7' },
                ]}
                onPress={() => {
                  setShowActionMenu(false);
                  handlePrint();
                }}
                activeOpacity={0.75}
              >
                <Icon name="printer" size={15} color="#FFFFFF" />
                <Text style={styles.printBtnText}>Print</Text>
              </TouchableOpacity>

              {/* 3-Dots More Options Menu Button */}
              <TouchableOpacity
                onPress={(e) => {
                  if ('stopPropagation' in e && typeof e.stopPropagation === 'function') {
                    e.stopPropagation();
                  }
                  setShowActionMenu((prev) => !prev);
                }}
                style={[
                  styles.menuTriggerBtn,
                  showActionMenu && styles.menuTriggerBtnActive,
                ]}
                activeOpacity={0.8}
                accessibilityLabel="More options"
              >
                <Icon name="more-vertical" size={17} color="#475569" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => {
                  setShowActionMenu(false);
                  onClose();
                }}
                hitSlop={8}
                activeOpacity={0.7}
              >
                <Icon name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Dropdown Menu from 3-Dots */}
            {showActionMenu && (
              <View
                style={styles.dropdownMenu}
                onTouchStart={(e) => {
                  if ('stopPropagation' in e && typeof e.stopPropagation === 'function') {
                    e.stopPropagation();
                  }
                }}
              >
                <View style={styles.dropdownSectionHeader}>
                  <Text style={styles.dropdownSectionTitle}>DOWNLOAD OFFICIAL PDF</Text>
                </View>

                <TouchableOpacity
                  style={styles.dropdownMenuItem}
                  onPress={() => {
                    setShowActionMenu(false);
                    handleDownloadSpecificPdf('soa');
                  }}
                  activeOpacity={0.7}
                >
                  <Icon name="file-text" size={15} color="#0369A1" />
                  <View style={styles.dropdownMenuTextContainer}>
                    <Text style={styles.dropdownMenuItemText}>Statement of Account (SOA)</Text>
                    <Text style={styles.dropdownMenuItemSubtext}>Official Vector PDF • #{soaNum}</Text>
                  </View>
                  <Icon name="download" size={13} color="#94A3B8" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dropdownMenuItem}
                  onPress={() => {
                    setShowActionMenu(false);
                    handleDownloadSpecificPdf('op');
                  }}
                  activeOpacity={0.7}
                >
                  <Icon name="credit-card" size={15} color="#047857" />
                  <View style={styles.dropdownMenuTextContainer}>
                    <Text style={styles.dropdownMenuItemText}>Order of Payment (OP)</Text>
                    <Text style={styles.dropdownMenuItemSubtext}>Official Vector PDF • #{opNum}</Text>
                  </View>
                  <Icon name="download" size={13} color="#94A3B8" />
                </TouchableOpacity>

                {isPaid && (
                  <TouchableOpacity
                    style={styles.dropdownMenuItem}
                    onPress={() => {
                      setShowActionMenu(false);
                      handleDownloadSpecificPdf('or');
                    }}
                    activeOpacity={0.7}
                  >
                    <Icon name="check-circle" size={15} color="#059669" />
                    <View style={styles.dropdownMenuTextContainer}>
                      <Text style={styles.dropdownMenuItemText}>Official Receipt (OR)</Text>
                      <Text style={styles.dropdownMenuItemSubtext}>Accountable Form 51 • #{orNum}</Text>
                    </View>
                    <Icon name="download" size={13} color="#94A3B8" />
                  </TouchableOpacity>
                )}

                {Platform.OS === 'web' && (
                  <>
                    <View style={styles.dropdownDivider} />
                    <TouchableOpacity
                      style={styles.dropdownMenuItem}
                      onPress={() => {
                        setShowActionMenu(false);
                        setReloadKey((k) => k + 1);
                      }}
                      activeOpacity={0.7}
                    >
                      <Icon name="refresh-cw" size={14} color="#64748B" />
                      <View style={styles.dropdownMenuTextContainer}>
                        <Text style={styles.dropdownMenuItemText}>Reload Current Template</Text>
                        <Text style={styles.dropdownMenuItemSubtext}>Fetch fresh template from server</Text>
                      </View>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </View>

          {/* Document Tab Switcher */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'soa' && styles.tabItemActiveSoa]}
              onPress={() => setActiveTab('soa')}
              activeOpacity={0.75}
            >
              <Icon
                name="file-text"
                size={15}
                color={activeTab === 'soa' ? '#0369A1' : '#64748B'}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'soa' && styles.tabTextActiveSoa,
                ]}
              >
                Statement of Account (SOA)
              </Text>
              <View style={[styles.tabBadge, activeTab === 'soa' ? styles.tabBadgeActiveSoa : styles.tabBadgeInactive]}>
                <Text style={[styles.tabBadgeText, activeTab === 'soa' ? styles.tabBadgeTextActiveSoa : styles.tabBadgeTextInactive]}>
                  {soaNum}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'op' && styles.tabItemActiveOp]}
              onPress={() => setActiveTab('op')}
              activeOpacity={0.75}
            >
              <Icon
                name="credit-card"
                size={15}
                color={activeTab === 'op' ? '#047857' : '#64748B'}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'op' && styles.tabTextActiveOp,
                ]}
              >
                Order of Payment (OP)
              </Text>
              <View style={[styles.tabBadge, activeTab === 'op' ? styles.tabBadgeActiveOp : styles.tabBadgeInactive]}>
                <Text style={[styles.tabBadgeText, activeTab === 'op' ? styles.tabBadgeTextActiveOp : styles.tabBadgeTextInactive]}>
                  {opNum}
                </Text>
              </View>
            </TouchableOpacity>

            {isPaid && (
              <TouchableOpacity
                style={[styles.tabItem, activeTab === 'or' && styles.tabItemActiveOr]}
                onPress={() => setActiveTab('or')}
                activeOpacity={0.75}
              >
                <Icon
                  name="check-circle"
                  size={15}
                  color={activeTab === 'or' ? '#059669' : '#64748B'}
                />
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'or' && styles.tabTextActiveOr,
                  ]}
                >
                  Official Receipt (OR)
                </Text>
                <View style={[styles.tabBadge, activeTab === 'or' ? styles.tabBadgeActiveOr : styles.tabBadgeInactive]}>
                  <Text style={[styles.tabBadgeText, activeTab === 'or' ? styles.tabBadgeTextActiveOr : styles.tabBadgeTextInactive]}>
                    {orNum}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* View Container: Web Iframe Vector PDF vs Structured Data Grid */}
          {Platform.OS === 'web' && viewFormat === 'pdf' ? (
            <View style={styles.pdfContainer}>
              {isLoadingPdf ? (
                <View style={styles.pdfLoadingBox}>
                  <Icon
                    name={activeTab === 'or' ? 'check-circle' : 'file-text'}
                    size={32}
                    color={activeTab === 'or' ? '#059669' : '#0284C7'}
                  />
                  <Text style={styles.pdfLoadingText}>
                    Loading official {activeTab === 'soa' ? 'Statement of Account' : activeTab === 'op' ? 'Order of Payment' : 'Official Receipt'} PDF template...
                  </Text>
                </View>
              ) : pdfError !== null ? (
                <View style={styles.pdfErrorBox}>
                  <Icon name="alert-circle" size={32} color="#DC2626" />
                  <Text style={styles.pdfErrorText}>{pdfError}</Text>
                  <View style={styles.pdfErrorActions}>
                    <TouchableOpacity
                      style={styles.retryBtn}
                      onPress={() => setReloadKey((k) => k + 1)}
                      activeOpacity={0.8}
                    >
                      <Icon name="refresh-cw" size={14} color="#FFFFFF" />
                      <Text style={styles.retryBtnText}>Retry Loading</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.switchGridBtn}
                      onPress={() => setViewFormat('grid')}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.switchGridBtnText}>Switch to Data View</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : pdfBlobUrl !== null ? (
                React.createElement('iframe', {
                  src: pdfBlobUrl,
                  style: { width: '100%', height: '100%', minHeight: '680px', border: 'none', borderRadius: '8px' },
                  title: activeTab === 'soa' ? 'Official Statement of Account PDF' : activeTab === 'op' ? 'Official Order of Payment PDF' : 'Official Receipt PDF',
                })
              ) : null}
            </View>
          ) : (
            <ScrollView
              style={styles.modalBody}
              contentContainerStyle={styles.modalBodyContent}
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.paperContainer}>
                {/* Agency Header */}
                <View style={styles.republicHeader}>
                  <Text style={styles.republicTitle}>Republic of the Philippines</Text>
                  <Text style={styles.agencyTitle}>NATIONAL TELECOMMUNICATIONS COMMISSION</Text>
                  <Text
                    style={[
                      styles.officeTitle,
                      activeTab === 'or'
                        ? { color: '#059669' }
                        : activeTab === 'op'
                        ? { color: '#047857' }
                        : { color: '#0284C7' },
                    ]}
                  >
                    {officeName}
                  </Text>
                </View>

                {activeTab === 'soa' ? (
                  /* ─────────────────────────────────────────────────────────────
                     Statement of Account (SOA) Body View
                     ───────────────────────────────────────────────────────────── */
                  <View>
                    <View style={styles.soaBanner}>
                      <View>
                        <Text style={styles.bannerTitle}>STATEMENT OF ACCOUNT (SOA)</Text>
                        <Text style={styles.bannerSubtitle}>
                          Official Regulatory Fee Assessment &amp; Schedule
                        </Text>
                      </View>
                      <View style={styles.bannerRight}>
                        <Text style={styles.bannerDocNum}>{soaNum}</Text>
                        <Text style={styles.bannerDate}>
                          Issued: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </Text>
                      </View>
                    </View>

                    {/* Info Grid */}
                    <View style={[styles.infoGrid, { flexDirection: isDesktop ? 'row' : 'column' }]}>
                      <View style={[styles.infoCard, { flex: 1 }]}>
                        <Text style={styles.infoCardTitle}>Billed To (Payor / Applicant)</Text>
                        <Text style={styles.infoCardName}>{applicantName}</Text>
                        <Text style={styles.infoCardDetail}>
                          <Text style={styles.boldText}>Type:</Text> {applicantType} •{' '}
                          <Text style={styles.boldText}>Contact:</Text> {contactNum}
                        </Text>
                        <Text style={styles.infoCardDetail}>
                          <Text style={styles.boldText}>Email:</Text> {emailAddr}
                        </Text>
                        <Text style={styles.infoCardDetail}>
                          <Text style={styles.boldText}>Address:</Text> {formattedAddr}
                        </Text>
                      </View>

                      <View style={[styles.infoCard, { flex: 1 }]}>
                        <Text style={styles.infoCardTitle}>Assessment &amp; Filing Details</Text>
                        <Text style={styles.infoCardName}>
                          {categoryName && categoryName !== serviceName && categoryName !== 'General'
                            ? `${serviceName} (${categoryName})`
                            : serviceName}
                        </Text>
                        <Text style={styles.infoCardDetail}>
                          <Text style={styles.boldText}>Reference No.:</Text> #{refNum}
                        </Text>
                        <Text style={styles.infoCardDetail}>
                          <Text style={styles.boldText}>Filing Mode:</Text> {filingMode}
                        </Text>
                        <Text style={styles.infoCardDetail}>
                          <Text style={styles.boldText}>Due Date:</Text>{' '}
                          <Text style={styles.dueDateHighlight}>{dueDateFormatted}</Text>
                        </Text>
                      </View>
                    </View>

                    {/* Line Items Table */}
                    <View style={styles.dataTable}>
                      <View style={styles.tableHeader}>
                        <Text style={[styles.thCell, { flex: 3 }]}>PARTICULARS / NATURE OF COLLECTION</Text>
                        <Text style={[styles.thCell, { width: 50, textAlign: 'center' }]}>QTY</Text>
                        <Text style={[styles.thCell, { width: 60, textAlign: 'center' }]}>YRS</Text>
                        <Text style={[styles.thCell, { width: 100, textAlign: 'right' }]}>RATE (PHP)</Text>
                        <Text style={[styles.thCell, { width: 110, textAlign: 'right' }]}>AMOUNT (PHP)</Text>
                      </View>

                      {lineItems.map((item, idx) => {
                        const units = typeof item.noOfUnits === 'number' && item.noOfUnits > 0 ? item.noOfUnits : 1;
                        const validity = typeof item.validityYears === 'number' && item.validityYears > 0 ? item.validityYears : 1;
                        const rate = typeof item.feeRate === 'number' && !isNaN(item.feeRate) ? item.feeRate : (item.amount / units);
                        const amount = typeof item.amount === 'number' && !isNaN(item.amount) ? item.amount : rate * units;

                        return (
                          <View key={item.id || idx} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowEven]}>
                            <View style={{ flex: 3 }}>
                              <Text style={styles.tdParticularName}>{item.particular}</Text>
                              <Text style={styles.tdParticularSub}>Code: {item.itemCode || 'NTC-FEE'}</Text>
                            </View>
                            <Text style={[styles.tdCell, { width: 50, textAlign: 'center' }]}>{units}</Text>
                            <Text style={[styles.tdCell, { width: 60, textAlign: 'center' }]}>{validity}</Text>
                            <Text style={[styles.tdCell, { width: 100, textAlign: 'right' }]}>
                              {formatCurrency(rate).replace('PHP ', '')}
                            </Text>
                            <Text style={[styles.tdCell, { width: 110, textAlign: 'right', fontWeight: '700', color: '#0F172A' }]}>
                              {formatCurrency(amount).replace('PHP ', '')}
                            </Text>
                          </View>
                        );
                      })}

                      <View style={styles.tableTotalRow}>
                        <Text style={styles.tableTotalLabel}>TOTAL AMOUNT DUE:</Text>
                        <Text style={styles.tableTotalAmount}>{formatCurrency(totalAmount)}</Text>
                      </View>
                    </View>

                    {/* Amount in words */}
                    <View style={styles.wordsCard}>
                      <Text style={styles.wordsLabel}>AMOUNT IN WORDS:</Text>
                      <Text style={styles.wordsText}>{wordsTotal}</Text>
                    </View>

                    {/* Signatories */}
                    <View style={[styles.signatoriesRow, { flexDirection: isDesktop ? 'row' : 'column', gap: 20 }]}>
                      <View style={styles.sigBlock}>
                        <Text style={styles.sigName}>REGIONAL ASSESSMENT OFFICER</Text>
                        <Text style={styles.sigRole}>Authorized Assessment Officer</Text>
                      </View>
                      <View style={styles.sigBlock}>
                        <Text style={styles.sigName}>COMMISSION AUDITOR</Text>
                        <Text style={styles.sigRole}>Commission Representative</Text>
                      </View>
                    </View>
                  </View>
                ) : activeTab === 'op' ? (
                  /* ─────────────────────────────────────────────────────────────
                     Order of Payment (OP) Body View
                     ───────────────────────────────────────────────────────────── */
                  <View>
                    <View style={styles.opBanner}>
                      <View>
                        <Text style={styles.bannerTitle}>ORDER OF PAYMENT (OP)</Text>
                        <Text style={styles.bannerSubtitle}>
                          Authorized National Telecommunications Commission Payment Voucher
                        </Text>
                      </View>
                      <View style={styles.bannerRight}>
                        <Text style={styles.bannerDocNum}>{opNum}</Text>
                        <Text style={styles.bannerDate}>
                          Issued: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </Text>
                      </View>
                    </View>

                    {/* Payor Card */}
                    <View style={styles.opPayorCard}>
                      <View style={styles.opPayorRow}>
                        <Text style={styles.opPayorLabel}>Payor / Applicant:</Text>
                        <Text style={styles.opPayorVal}>{applicantName}</Text>
                      </View>
                      <View style={styles.opPayorRow}>
                        <Text style={styles.opPayorLabel}>Application Reference:</Text>
                        <Text style={[styles.opPayorVal, { fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }) }]}>
                          #{refNum}
                        </Text>
                      </View>
                      <View style={styles.opPayorRow}>
                        <Text style={styles.opPayorLabel}>Address:</Text>
                        <Text style={styles.opPayorVal}>{formattedAddr}</Text>
                      </View>
                      <View style={styles.opPayorRow}>
                        <Text style={styles.opPayorLabel}>Service Variant:</Text>
                        <Text style={styles.opPayorVal}>{serviceName}</Text>
                      </View>
                    </View>

                    {/* Line items table */}
                    <View style={styles.dataTable}>
                      <View style={[styles.tableHeader, { backgroundColor: '#F0FDF4', borderBottomColor: '#BBF7D0' }]}>
                        <Text style={[styles.thCell, { flex: 3, color: '#065F46' }]}>NATURE OF COLLECTION / PARTICULARS</Text>
                        <Text style={[styles.thCell, { width: 140, textAlign: 'right', color: '#065F46' }]}>AMOUNT (PHP)</Text>
                      </View>

                      {lineItems.map((item, idx) => {
                        const units = typeof item.noOfUnits === 'number' && item.noOfUnits > 0 ? item.noOfUnits : 1;
                        const rate = typeof item.feeRate === 'number' && !isNaN(item.feeRate) ? item.feeRate : (item.amount / units);
                        const amount = typeof item.amount === 'number' && !isNaN(item.amount) ? item.amount : rate * units;

                        return (
                          <View key={item.id || idx} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowEven]}>
                            <View style={{ flex: 3 }}>
                              <Text style={styles.tdParticularName}>{item.particular}</Text>
                              <Text style={styles.tdParticularSub}>Code: {item.itemCode || 'NTC-FEE'}</Text>
                            </View>
                            <Text style={[styles.tdCell, { width: 140, textAlign: 'right', fontWeight: '700', color: '#0F172A' }]}>
                              {formatCurrency(amount)}
                            </Text>
                          </View>
                        );
                      })}

                      <View style={styles.opTotalRow}>
                        <Text style={styles.opTotalLabel}>TOTAL AMOUNT PAYABLE:</Text>
                        <Text style={styles.opTotalAmount}>{formatCurrency(totalAmount)}</Text>
                      </View>
                    </View>

                    {/* Payment Status & Words */}
                    <View style={styles.opStatusCard}>
                      <Text style={styles.opStatusLabel}>AMOUNT IN WORDS:</Text>
                      <Text style={styles.opStatusWords}>{wordsTotal}</Text>
                      <View style={styles.opPaymentStatusBadgeRow}>
                        <Text style={styles.opPaymentStatusText}>
                          <Text style={styles.boldText}>Payment Status:</Text>{' '}
                          {orNum
                            ? `Paid via OR #${orNum}`
                            : 'Pending Cashier Verification / Collection'}
                        </Text>
                      </View>
                    </View>

                    {/* Signatories */}
                    <View style={[styles.signatoriesRow, { flexDirection: isDesktop ? 'row' : 'column', gap: 20 }]}>
                      <View style={styles.sigBlock}>
                        <Text style={styles.sigName}>REGIONAL ASSESSMENT OFFICER</Text>
                        <Text style={styles.sigRole}>Authorized Assessment Officer</Text>
                      </View>
                      <View style={styles.sigBlock}>
                        <Text style={styles.sigName}>SPECIAL COLLECTING OFFICER</Text>
                        <Text style={styles.sigRole}>Collecting Cashier</Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  /* ─────────────────────────────────────────────────────────────
                     Official Receipt (OR) Body View (Accountable Form No. 51)
                     ───────────────────────────────────────────────────────────── */
                  <View>
                    <View style={styles.orBanner}>
                      <View>
                        <Text style={styles.bannerTitle}>OFFICIAL RECEIPT (OR)</Text>
                        <Text style={styles.bannerSubtitle}>
                          Accountable Form No. 51 (Revised 2006)
                        </Text>
                      </View>
                      <View style={styles.bannerRight}>
                        <Text style={[styles.bannerDocNum, { color: '#34D399' }]}>{orNum ?? `OR-${refNum}`}</Text>
                        <Text style={styles.bannerDate}>
                          Date Issued: {paidDateFormatted}
                        </Text>
                      </View>
                    </View>

                    {/* Info Grid */}
                    <View style={[styles.infoGrid, { flexDirection: isDesktop ? 'row' : 'column' }]}>
                      <View style={[styles.infoCard, { flex: 1 }]}>
                        <Text style={[styles.infoCardTitle, { color: '#059669' }]}>Payor Information</Text>
                        <Text style={styles.infoCardName}>{applicantName}</Text>
                        <Text style={styles.infoCardDetail}>
                          <Text style={styles.boldText}>Address:</Text> {formattedAddr}
                        </Text>
                        <Text style={styles.infoCardDetail}>
                          <Text style={styles.boldText}>Order of Payment:</Text> {opNum} • <Text style={styles.boldText}>App Ref:</Text> #{refNum}
                        </Text>
                      </View>
                      <View style={[styles.infoCard, { flex: 1 }]}>
                        <Text style={[styles.infoCardTitle, { color: '#059669' }]}>Payment Details</Text>
                        <Text style={styles.infoCardName}>Total Paid: {formatCurrency(paidAmount)}</Text>
                        <Text style={styles.infoCardDetail}>
                          <Text style={styles.boldText}>Mode of Payment:</Text> {app.op?.paymentMethod || 'Cash / Electronic Payment'}
                        </Text>
                        <Text style={styles.infoCardDetail}>
                          <Text style={styles.boldText}>Issuing Office:</Text> {officeName}
                        </Text>
                      </View>
                    </View>

                    {/* Nature of Collection Table */}
                    <View style={styles.dataTable}>
                      <View style={[styles.tableHeader, { backgroundColor: '#ECFDF5', borderBottomColor: '#A7F3D0' }]}>
                        <Text style={[styles.thCell, { flex: 3, color: '#065F46' }]}>NATURE OF COLLECTION</Text>
                        <Text style={[styles.thCell, { width: 140, textAlign: 'center', color: '#065F46' }]}>FUND / CODE</Text>
                        <Text style={[styles.thCell, { width: 140, textAlign: 'right', color: '#065F46' }]}>AMOUNT (PHP)</Text>
                      </View>

                      {lineItems.map((item, idx) => {
                        const units = typeof item.noOfUnits === 'number' && item.noOfUnits > 0 ? item.noOfUnits : 1;
                        const rate = typeof item.feeRate === 'number' && !isNaN(item.feeRate) ? item.feeRate : (item.amount / units);
                        const amount = typeof item.amount === 'number' && !isNaN(item.amount) ? item.amount : rate * units;

                        return (
                          <View key={item.id || idx} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowEven]}>
                            <View style={{ flex: 3 }}>
                              <Text style={styles.tdParticularName}>{item.particular}</Text>
                            </View>
                            <Text style={[styles.tdCell, { width: 140, textAlign: 'center', fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }) }]}>
                              {item.itemCode || 'NTC-FEE'}
                            </Text>
                            <Text style={[styles.tdCell, { width: 140, textAlign: 'right', fontWeight: '700', color: '#0F172A' }]}>
                              {formatCurrency(amount).replace('PHP ', '')}
                            </Text>
                          </View>
                        );
                      })}

                      <View style={[styles.opTotalRow, { backgroundColor: '#F0FDF4', borderTopColor: '#BBF7D0' }]}>
                        <Text style={[styles.opTotalLabel, { color: '#065F46' }]}>TOTAL AMOUNT (in Figures):</Text>
                        <Text style={[styles.opTotalAmount, { color: '#059669' }]}>{formatCurrency(paidAmount)}</Text>
                      </View>
                    </View>

                    {/* Payment Status & Words */}
                    <View style={[styles.opStatusCard, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                      <Text style={[styles.opStatusLabel, { color: '#065F46' }]}>AMOUNT IN WORDS:</Text>
                      <Text style={[styles.opStatusWords, { color: '#047857' }]}>{wordsPaid}</Text>
                      <View style={styles.opPaymentStatusBadgeRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Icon name="check-circle" size={14} color="#059669" />
                          <Text style={[styles.opPaymentStatusText, { color: '#065F46', fontWeight: '700' }]}>
                            OFFICIALLY PAID &amp; ACKNOWLEDGED • OR #{orNum ?? refNum}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Signatories */}
                    <View style={[styles.signatoriesRow, { flexDirection: isDesktop ? 'row' : 'column', gap: 20 }]}>
                      <View style={styles.sigBlock}>
                        <View style={{ width: 180, borderBottomWidth: 1, borderBottomColor: '#0F172A', marginBottom: 6 }} />
                        <Text style={styles.sigName}>SPECIAL COLLECTING OFFICER</Text>
                        <Text style={styles.sigRole}>Authorized Cashier / Collecting Officer</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Footer Note */}
                <View style={styles.footerNoteContainer}>
                  <Text style={styles.footerNoteText}>
                    National Telecommunications Commission • Official Document Generated via NTC-EDGE Digital Portal. Governed by RA 11032.
                  </Text>
                </View>
              </View>
            </ScrollView>
          )}

          {/* Modal Bottom Footer Actions */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={onClose} activeOpacity={0.75}>
              <Text style={styles.secondaryBtnText}>Close Preview</Text>
            </TouchableOpacity>

            {onProceedToPayment && !isPaid && (
              <TouchableOpacity
                style={styles.primaryPayBtn}
                onPress={() => {
                  onClose();
                  onProceedToPayment();
                }}
                activeOpacity={0.85}
              >
                <Icon name="dollar-sign" size={16} color="#FFFFFF" />
                <Text style={styles.primaryPayBtnText}>Proceed to Payment</Text>
                <Icon name="arrow-right" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[16],
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    height: '92%',
    maxHeight: '94%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    display: 'flex',
    flexDirection: 'column',
    ...Platform.select({
      web: {
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[16],
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    position: 'relative',
    zIndex: 100,
    gap: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 200,
  },
  headerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
  },
  modalSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuTriggerBtn: {
    padding: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTriggerBtnActive: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 52,
    right: 16,
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 50,
    zIndex: 1000,
  },
  dropdownSectionHeader: {
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 4,
  },
  dropdownSectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#64748B',
    letterSpacing: 0.5,
  },
  dropdownMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  dropdownMenuTextContainer: {
    flex: 1,
  },
  dropdownMenuItemText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12.5,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#0F172A',
  },
  dropdownMenuItemSubtext: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 1,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  formatSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    padding: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 4,
  },
  formatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  formatBtnActive: {
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
      },
    }),
  },
  formatBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: '#64748B',
  },
  formatBtnTextActive: {
    color: '#0369A1',
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  printBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  printBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 6,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: SPACING[16],
    paddingTop: 8,
    gap: 8,
    flexWrap: 'wrap',
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    borderBottomWidth: 0,
    marginBottom: -1,
  },
  tabItemActiveSoa: {
    backgroundColor: '#FFFFFF',
    borderColor: '#BAE6FD',
    borderBottomColor: '#FFFFFF',
  },
  tabItemActiveOp: {
    backgroundColor: '#FFFFFF',
    borderColor: '#A7F3D0',
    borderBottomColor: '#FFFFFF',
  },
  tabItemActiveOr: {
    backgroundColor: '#FFFFFF',
    borderColor: '#A7F3D0',
    borderBottomColor: '#FFFFFF',
  },
  tabText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: '#64748B',
  },
  tabTextActiveSoa: {
    color: '#0369A1',
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  tabTextActiveOp: {
    color: '#047857',
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  tabTextActiveOr: {
    color: '#059669',
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tabBadgeActiveSoa: {
    backgroundColor: '#E0F2FE',
  },
  tabBadgeActiveOp: {
    backgroundColor: '#D1FAE5',
  },
  tabBadgeActiveOr: {
    backgroundColor: '#D1FAE5',
  },
  tabBadgeInactive: {
    backgroundColor: '#F1F5F9',
  },
  tabBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  tabBadgeTextActiveSoa: {
    color: '#0369A1',
  },
  tabBadgeTextActiveOp: {
    color: '#047857',
  },
  tabBadgeTextActiveOr: {
    color: '#065F46',
  },
  tabBadgeTextInactive: {
    color: '#94A3B8',
  },
  pdfContainer: {
    flex: 1,
    minHeight: 680,
    backgroundColor: '#334155',
    position: 'relative',
    zIndex: 1,
  },
  pdfLoadingBox: {
    flex: 1,
    minHeight: 500,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
  },
  pdfLoadingText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: '#475569',
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  pdfErrorBox: {
    flex: 1,
    minHeight: 450,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#FEF2F2',
    padding: 24,
  },
  pdfErrorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
    maxWidth: 400,
  },
  pdfErrorActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  retryBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
  },
  switchGridBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DC2626',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  switchGridBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#DC2626',
  },
  modalBody: {
    flex: 1,
    minHeight: 500,
    backgroundColor: '#F1F5F9',
  },
  modalBodyContent: {
    padding: SPACING[16],
  },
  paperContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: SPACING[20],
  },
  republicHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  republicTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  agencyTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  officeTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#0284C7',
    marginTop: 2,
  },
  soaBanner: {
    backgroundColor: '#0F172A',
    borderRadius: 6,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  opBanner: {
    backgroundColor: '#064E3B',
    borderRadius: 6,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orBanner: {
    backgroundColor: '#064E3B',
    borderRadius: 6,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bannerTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  bannerSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  bannerRight: {
    alignItems: 'flex-end',
  },
  bannerDocNum: {
    fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#38BDF8',
  },
  bannerDate: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  infoGrid: {
    gap: 12,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  infoCardTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0284C7',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  infoCardName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
    marginBottom: 4,
  },
  infoCardDetail: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: '#475569',
    marginTop: 2,
  },
  boldText: {
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#334155',
  },
  dueDateHighlight: {
    color: '#DC2626',
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  dataTable: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  thCell: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#475569',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tableRowEven: {
    backgroundColor: '#FAFAFA',
  },
  tdParticularName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#0F172A',
  },
  tdParticularSub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  tdCell: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#334155',
  },
  tableTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1.5,
    borderTopColor: '#0F172A',
  },
  tableTotalLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
  },
  tableTotalAmount: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0369A1',
  },
  wordsCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
  },
  wordsLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#065F46',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  wordsText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#047857',
  },
  opPayorCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    gap: 4,
  },
  opPayorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  opPayorLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: '#64748B',
  },
  opPayorVal: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#0F172A',
  },
  opTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1.5,
    borderTopColor: '#064E3B',
  },
  opTotalLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#064E3B',
  },
  opTotalAmount: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#047857',
  },
  opStatusCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
  },
  opStatusLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#065F46',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  opStatusWords: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#047857',
  },
  opPaymentStatusBadgeRow: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#A7F3D0',
  },
  opPaymentStatusText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: '#065F46',
  },
  signatoriesRow: {
    justifyContent: 'space-around',
    marginVertical: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  sigBlock: {
    alignItems: 'center',
  },
  sigName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
    textTransform: 'uppercase',
  },
  sigRole: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  footerNoteContainer: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 0.8,
    borderTopColor: '#E2E8F0',
    alignItems: 'center',
  },
  footerNoteText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9,
    color: '#94A3B8',
    textAlign: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[12],
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  secondaryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  secondaryBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#475569',
  },
  primaryPayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0284C7',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  primaryPayBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
  },
});
