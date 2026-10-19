import React from 'react';
import { Modal, View, ScrollView, Platform, useWindowDimensions, Text } from 'react-native';
import { Application } from '../../data/applicationsData';
import { ClientReportTab, ClientSoaOpPreviewModalProps } from './clientSoaOpPreview/clientSoaOpPreviewTypes';
import { useClientSoaOpPreview } from './clientSoaOpPreview/useClientSoaOpPreview';
import { ClientSoaOpHeader } from './clientSoaOpPreview/ClientSoaOpHeader';
import { ClientSoaOpDropdownMenu } from './clientSoaOpPreview/ClientSoaOpDropdownMenu';
import { ClientSoaOpTabs } from './clientSoaOpPreview/ClientSoaOpTabs';
import { ClientSoaOpPdfViewer } from './clientSoaOpPreview/ClientSoaOpPdfViewer';
import { ClientSoaOpPaperHeader } from './clientSoaOpPreview/ClientSoaOpPaperHeader';
import { ClientSoaDataView } from './clientSoaOpPreview/ClientSoaDataView';
import { ClientOpDataView } from './clientSoaOpPreview/ClientOpDataView';
import { ClientOrDataView } from './clientSoaOpPreview/ClientOrDataView';
import { ClientSoaOpFooter } from './clientSoaOpPreview/ClientSoaOpFooter';
import { modalStyles } from './clientSoaOpPreview/styles/clientSoaOpModalStyles';

export type { ClientReportTab, ClientSoaOpPreviewModalProps };

export function ClientSoaOpPreviewModal({
  visible,
  app,
  initialTab = 'soa',
  onClose,
  onProceedToPayment,
}: ClientSoaOpPreviewModalProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const p = useClientSoaOpPreview(app, visible, initialTab);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={modalStyles.modalOverlay}>
        <View style={[modalStyles.modalContainer, { maxWidth: 920, width: '100%' }]}>
          <ClientSoaOpHeader
            activeTab={p.activeTab}
            refNum={p.refNum}
            applicantName={p.applicantName}
            viewFormat={p.viewFormat}
            showActionMenu={p.showActionMenu}
            onToggleActionMenu={() => p.setShowActionMenu((prev) => !prev)}
            onCloseActionMenu={() => p.setShowActionMenu(false)}
            onSelectViewFormat={p.setViewFormat}
            onPrint={p.handlePrint}
            onClose={onClose}
            dropdownMenu={
              <ClientSoaOpDropdownMenu
                visible={p.showActionMenu}
                isPaid={p.isPaid}
                soaNum={p.soaNum}
                opNum={p.opNum}
                orNum={p.orNum}
                orList={p.orList}
                onDownloadDoc={p.handleDownloadDoc}
                onReloadTemplate={p.handleReload}
                onClose={() => p.setShowActionMenu(false)}
              />
            }
          />

          <ClientSoaOpTabs
            activeTab={p.activeTab}
            onSelectTab={p.setActiveTab}
            soaNum={p.soaNum}
            opNum={p.opNum}
            orNum={p.orNum}
            isPaid={p.isPaid}
            orList={p.orList}
            effectiveSelectedOr={p.effectiveSelectedOr}
            onSelectOrNumber={p.setSelectedOrNumber}
          />

          {Platform.OS === 'web' && p.viewFormat === 'pdf' ? (
            <ClientSoaOpPdfViewer
              activeTab={p.activeTab}
              isLoadingPdf={p.isLoadingPdf}
              pdfError={p.pdfError}
              pdfBlobUrl={p.pdfBlobUrl}
              onRetry={p.handleReload}
              onSwitchToGrid={() => p.setViewFormat('grid')}
            />
          ) : (
            <ScrollView
              style={modalStyles.modalBody}
              contentContainerStyle={modalStyles.modalBodyContent}
              showsVerticalScrollIndicator={true}
            >
              <View style={modalStyles.paperContainer}>
                <ClientSoaOpPaperHeader officeName={p.officeName} activeTab={p.activeTab} />

                {p.activeTab === 'soa' ? (
                  <ClientSoaDataView
                    app={app}
                    soaNum={p.soaNum}
                    applicantName={p.applicantName}
                    applicantType={p.applicantType}
                    contactNum={p.contactNum}
                    emailAddr={p.emailAddr}
                    formattedAddr={p.formattedAddr}
                    serviceName={p.serviceName}
                    categoryName={p.categoryName}
                    refNum={p.refNum}
                    filingMode={p.filingMode}
                    dueDateFormatted={p.dueDateFormatted}
                    lineItems={p.lineItems}
                    totalAmount={p.totalAmount}
                    wordsTotal={p.wordsTotal}
                    isDesktop={isDesktop}
                  />
                ) : p.activeTab === 'op' ? (
                  <ClientOpDataView
                    app={app}
                    opNum={p.opNum}
                    applicantName={p.applicantName}
                    formattedAddr={p.formattedAddr}
                    serviceName={p.serviceName}
                    refNum={p.refNum}
                    lineItems={p.lineItems}
                    totalAmount={p.totalAmount}
                    wordsTotal={p.wordsTotal}
                    orNum={p.orNum}
                    orList={p.orList}
                    isDesktop={isDesktop}
                  />
                ) : (
                  <ClientOrDataView
                    app={app}
                    refNum={p.refNum}
                    opNum={p.opNum}
                    orNum={p.orNum}
                    effectiveSelectedOr={p.effectiveSelectedOr}
                    applicantName={p.applicantName}
                    formattedAddr={p.formattedAddr}
                    officeName={p.officeName}
                    paidAmount={p.paidAmount}
                    paidDateFormatted={p.paidDateFormatted}
                    wordsPaid={p.wordsPaid}
                    lineItems={p.lineItems}
                    isDesktop={isDesktop}
                  />
                )}

                <View style={modalStyles.footerNoteContainer}>
                  <Text style={modalStyles.footerNoteText}>
                    National Telecommunications Commission • Official Document Generated via NTC-EDGE Digital Portal. Governed by RA 11032.
                  </Text>
                </View>
              </View>
            </ScrollView>
          )}

          <ClientSoaOpFooter
            isPaid={p.isPaid}
            onClose={onClose}
            onProceedToPayment={onProceedToPayment}
          />
        </View>
      </View>
    </Modal>
  );
}
